import {useEffect} from 'react'
import React, {useState} from 'react'
import TableSkeleton from '@/components/material_custom/DefaultSkeleton'
import {exportToExcel, formatNumberFourDecimal, formatNumberSixDecimal, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, getContrastTextColor, removeComma, sumDataNomShipperReport, sumDataNomShipperReportConcept} from '@/utils/generalFormatter'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {table_col_arrow_sort_style, table_row_style, table_sort_header_style} from '@/utils/styles'
import {handleSort, handleSortConcept} from '@/utils/sortTable'
import NodataTable from '@/components/other/nodataTable'
import {Tab, Tabs} from '@mui/material'
import {Tune} from '@mui/icons-material'
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol'
import PaginationComponent from '@/components/other/globalPagination'
import dayjs from 'dayjs'
import BtnGeneral from '@/components/other/btnGeneral'
import SearchInput from '@/components/other/searchInput'
import {parseToNumber} from '@/utils/number'

const TableEachZone: React.FC<any> = ({tableData, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, tabMainIndex, subTabIndex, subTabIndexview, gasDay}) => {
  const [sortedDataOriginal0, setSortedDataOriginal0] = useState<any>([])
  const [sortedDataOriginal1, setSortedDataOriginal1] = useState<any>([])
  const [sortedData, setSortedData] = useState<any>([])
  const [sortedDataTabConcept, setSortedDataTabConcept] = useState<any>([])
  const [isLoading, setIsLoading] = useState<any>(false)

  const [filterTabZero, setFilterTabZero] = useState<any>([])
  const [filterTabConcept, setFilterTabConcept] = useState<any>([])

  const [sortState, setSortState] = useState({column: null, direction: null})
    
  useEffect(() => {
    console.log('tableData : ', tableData); 
    const result_tab_zero = sumDataNomShipperReport(tableData?.nominaionPointZone[0]?.zone)
    const result_tab_one = sumDataNomShipperReportConcept(tableData?.conceptPointZone[0]?.zone)
    console.log('### result_tab_zero : ', result_tab_zero);
    const data_tab_zero = result_tab_zero?.map(({data_temp, ...rest}) => ({
      ...rest,
      ...data_temp,
      data_temp // keep original data_temp intact
    }))

    const data_tab_one = result_tab_one?.map(({data_temp, ...rest}) => ({
      ...rest,
      ...data_temp,
      data_temp // keep original data_temp intact
    }))
    setSortedDataOriginal0(data_tab_zero)
    setSortedDataOriginal1(data_tab_one)
    setSortedData(data_tab_zero)
    setSortedDataTabConcept(data_tab_one)

    setFilterTabZero(data_tab_zero)
    setFilterTabConcept(data_tab_one)

    setIsLoading(true)
  }, [tableData])

  const getArrowIcon = (column: string) => {
    return (
      <div className={`${table_col_arrow_sort_style}`}>
        <ArrowDropUpIcon sx={{fontSize: 18, opacity: sortState.column === column && sortState.direction === 'asc' ? 1 : 0.4}} />
        <ArrowDropDownIcon sx={{fontSize: 18, opacity: sortState.column === column && sortState.direction === 'desc' ? 1 : 0.4}} />
      </div>
    )
  }

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {
    if (tabMain == 0) {
      const filtered = filterTabZero?.filter((item: any) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim()
        return (
          item['1']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['2']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['3']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['4']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['5']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['6']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['7']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['8']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['9']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['10']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          //value area =====================================================================================

          (!isNaN(item['11']) && item['11']?.toString()?.includes(queryLower)) ||
          (!isNaN(item['12']) && item['12']?.toString()?.includes(queryLower)) ||
          (!isNaN(item['13']) && item['13']?.toString()?.includes(queryLower)) ||
          (!isNaN(item['14']) && item['14']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['15']) && item['15']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['16']) && item['16']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['17']) && item['17']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['18']) && item['18']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['19']) && item['19']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['20']) && item['20']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['21']) && item['21']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['22']) && item['22']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['23']) && item['23']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['24']) && item['24']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['25']) && item['25']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['26']) && item['26']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['27']) && item['27']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['28']) && item['28']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['29']) && item['29']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['30']) && item['30']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['31']) && item['31']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['32']) && item['32']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['33']) && item['33']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['34']) && item['34']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['35']) && item['35']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['36']) && item['36']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['37']) && item['37']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['38']) && item['38']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['11']) && formatNumberThreeDecimal(item['11'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['12']) && formatNumberThreeDecimal(item['12'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['13']) && formatNumberThreeDecimal(item['13'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['14']) && formatNumberThreeDecimal(item['14'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['15']) && formatNumberThreeDecimal(item['15'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['16']) && formatNumberThreeDecimal(item['16'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['17']) && formatNumberThreeDecimal(item['17'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['18']) && formatNumberThreeDecimal(item['18'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['19']) && formatNumberThreeDecimal(item['19'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['20']) && formatNumberThreeDecimal(item['20'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['21']) && formatNumberThreeDecimal(item['21'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['22']) && formatNumberThreeDecimal(item['22'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['23']) && formatNumberThreeDecimal(item['23'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['24']) && formatNumberThreeDecimal(item['24'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['25']) && formatNumberThreeDecimal(item['25'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['26']) && formatNumberThreeDecimal(item['26'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['27']) && formatNumberThreeDecimal(item['27'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['28']) && formatNumberThreeDecimal(item['28'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['29']) && formatNumberThreeDecimal(item['29'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['30']) && formatNumberThreeDecimal(item['30'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['31']) && formatNumberThreeDecimal(item['31'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['32']) && formatNumberThreeDecimal(item['32'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['33']) && formatNumberThreeDecimal(item['33'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['34']) && formatNumberThreeDecimal(item['34'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['35']) && formatNumberThreeDecimal(item['35'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['36']) && formatNumberThreeDecimal(item['36'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['37']) && formatNumberThreeDecimal(item['37'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['38']) && formatNumberThreeDecimal(item['38'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['11']) && formatNumberThreeDecimalNoComma(item['11'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['12']) && formatNumberThreeDecimalNoComma(item['12'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['13']) && formatNumberThreeDecimalNoComma(item['13'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['14']) && formatNumberThreeDecimalNoComma(item['14'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['15']) && formatNumberThreeDecimalNoComma(item['15'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['16']) && formatNumberThreeDecimalNoComma(item['16'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['17']) && formatNumberThreeDecimalNoComma(item['17'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['18']) && formatNumberThreeDecimalNoComma(item['18'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['19']) && formatNumberThreeDecimalNoComma(item['19'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['20']) && formatNumberThreeDecimalNoComma(item['20'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['21']) && formatNumberThreeDecimalNoComma(item['21'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['22']) && formatNumberThreeDecimalNoComma(item['22'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['23']) && formatNumberThreeDecimalNoComma(item['23'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['24']) && formatNumberThreeDecimalNoComma(item['24'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['25']) && formatNumberThreeDecimalNoComma(item['25'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['26']) && formatNumberThreeDecimalNoComma(item['26'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['27']) && formatNumberThreeDecimalNoComma(item['27'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['28']) && formatNumberThreeDecimalNoComma(item['28'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['29']) && formatNumberThreeDecimalNoComma(item['29'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['30']) && formatNumberThreeDecimalNoComma(item['30'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['31']) && formatNumberThreeDecimalNoComma(item['31'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['32']) && formatNumberThreeDecimalNoComma(item['32'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['33']) && formatNumberThreeDecimalNoComma(item['33'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['34']) && formatNumberThreeDecimalNoComma(item['34'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['35']) && formatNumberThreeDecimalNoComma(item['35'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['36']) && formatNumberThreeDecimalNoComma(item['36'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['37']) && formatNumberThreeDecimalNoComma(item['37'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['38']) && formatNumberThreeDecimalNoComma(item['38'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['14']) && removeComma(item['14'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['15']) && removeComma(item['15'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['16']) && removeComma(item['16'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['17']) && removeComma(item['17'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['18']) && removeComma(item['18'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['19']) && removeComma(item['19'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['20']) && removeComma(item['20'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['21']) && removeComma(item['21'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['22']) && removeComma(item['22'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['23']) && removeComma(item['23'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['24']) && removeComma(item['24'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['25']) && removeComma(item['25'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['26']) && removeComma(item['26'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['27']) && removeComma(item['27'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['28']) && removeComma(item['28'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['29']) && removeComma(item['29'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['30']) && removeComma(item['30'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['31']) && removeComma(item['31'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['32']) && removeComma(item['32'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['33']) && removeComma(item['33'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['34']) && removeComma(item['34'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['35']) && removeComma(item['35'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['36']) && removeComma(item['36'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['37']) && removeComma(item['37'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          (!isNaN(item['38']) && removeComma(item['38'])?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower))
        )
      })
      setSortedData(filtered)
    } else {
      const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim()

      //ทดสอบมาแล้ว หาก value มีค่าเป็น "" มันจะ return จาก formatNumberThreeDecimal เป็น 0.000 ทำให้ search ค่า 0.000 เมื่อไหร่จะเจอทุก data
      const safeFormat3 = (value: any) => {
        if (value === null || value === undefined || String(value).trim() === '') {
          return ''
        }

        return formatNumberThreeDecimal(value)
      }

      const safeFormat3NoComma = (value: any) => {
        if (value === null || value === undefined || String(value).trim() === '') {
          return ''
        }

        return formatNumberThreeDecimalNoComma(value)
      }

      const filtered = filterTabConcept?.filter((item: any) => {
        return (
          item['1']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['2']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['3']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['4']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['5']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['6']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['7']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['8']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['9']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item['10']?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['11']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['12']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['13']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['14']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['15']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['16']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['17']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['18']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['19']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['20']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['21']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['22']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['23']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['24']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['25']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['26']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['27']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['28']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['29']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['30']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['31']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['32']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['33']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['34']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['35']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['36']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['37']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3(item['38']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['11']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['12']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['13']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['14']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['15']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['16']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['17']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['18']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['19']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['20']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['21']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['22']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['23']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['24']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['25']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['26']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['27']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['28']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['29']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['30']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['31']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['32']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['33']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['34']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['35']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['36']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['37']).toLowerCase().trim().includes(queryLower) ||
          safeFormat3NoComma(item['38']).toLowerCase().trim().includes(queryLower)
        )
      })

      setSortedDataTabConcept(filtered)
    }
  }

  // ===================== TABLE HEADER MAP =====================
  const hours = Array.from({length: 24}, (_, i) => ({
    key: `h${i + 1}`,
    label: `H${i + 1}`,
    timeRange: `${String(i).padStart(2, '0')}:01 - ${String(i + 1).padStart(2, '0')}:00`
  }))

  // ############### TAB ###############
  const [tabIndex, setTabIndex] = useState(0)
  const handleChange = (event: any, newValue: any) => {
    // 0 = 1-6 Hr
    // 1 = 7-12 Hr
    // 2 = 13-18 Hr
    // 3 = 19-24 Hr
    // 4 = All Day
    setTabIndex(newValue)
  }

  const getVisibleHours = () => {
    // Tab Daily/Weekly , Tab Daily : Entry/Exit > ในหน้า Detail Default Tab All Day แล้วเอา All day มาไว้ข้างหน้า https://app.clickup.com/t/86etzch3m
    switch (tabIndex) {
      case 0:
        return hours // H1 - H6
      case 1:
        return hours.slice(0, 6) // H1 - H6
      case 2:
        return hours.slice(6, 12) // H7 - H12
      case 3:
        return hours.slice(12, 18) // H13 - H18
      case 4:
        return hours.slice(18, 24) // H19 - H24
      default:
        return []
    }
  }

  useEffect(() => {
    getVisibleHours()
  }, [tabIndex])

  // tabMain = 'Entry/Exit' or 'Concept Point'
  const [tabMain, setTabMain] = useState(0)
  const handleChangeTabMain = (event: any, newValue: any) => {
    setTabMain(newValue)
  }

  // ############### COLUMN SHOW/HIDE ENTRY / EXIT ###############
  // if tabIndex = 4 show all
  const initialColumnsTabEntryExit: any = [
    {key: 'supply_demand', label: 'Supply/Demand', visible: true}, // always show
    {key: 'area', label: 'Area', visible: true}, // always show
    {key: 'nomination_point', label: 'Nomination Point', visible: true}, // always show
    {key: 'unit', label: 'Unit', visible: true}, // always show
    {key: 'type', label: 'Type', visible: true}, // always show
    {key: 'entry_exit', label: 'Entry/Exit', visible: true}, // always show
    {key: 'wi', label: 'WI', visible: true}, // always show
    {key: 'hv', label: 'HV', visible: true}, // always show
    {key: 'sg', label: 'SG', visible: true}, // always show

    {key: 'h1', label: 'H1 00:00 - 01:00', visible: true},
    {key: 'h2', label: 'H2 01:01 - 02:00', visible: true},
    {key: 'h3', label: 'H3 02:01 - 03:00', visible: true},
    {key: 'h4', label: 'H4 03:01 - 04:00', visible: true},
    {key: 'h5', label: 'H5 04:01 - 05:00', visible: true},
    {key: 'h6', label: 'H6 05:01 - 06:00', visible: true},

    {key: 'h7', label: 'H7 06:01 - 07:00', visible: true},
    {key: 'h8', label: 'H8 07:01 - 08:00', visible: true},
    {key: 'h9', label: 'H9 08:01 - 09:00', visible: true},
    {key: 'h10', label: 'H10 09:01 - 10:00', visible: true},
    {key: 'h11', label: 'H11 10:01 - 11:00', visible: true},
    {key: 'h12', label: 'H12 11:01 - 12:00', visible: true},

    {key: 'h13', label: 'H13 12:01 - 13:00', visible: true},
    {key: 'h14', label: 'H14 13:01 - 14:00', visible: true},
    {key: 'h15', label: 'H15 14:01 - 15:00', visible: true},
    {key: 'h16', label: 'H16 15:01 - 16:00', visible: true},
    {key: 'h17', label: 'H17 16:01 - 17:00', visible: true},
    {key: 'h18', label: 'H18 17:01 - 18:00', visible: true},

    {key: 'h19', label: 'H19 18:01 - 19:00', visible: true},
    {key: 'h20', label: 'H20 19:01 - 20:00', visible: true},
    {key: 'h21', label: 'H21 20:01 - 21:00', visible: true},
    {key: 'h22', label: 'H22 21:01 - 22:00', visible: true},
    {key: 'h23', label: 'H23 22:01 - 23:00', visible: true},
    {key: 'h24', label: 'H24 23:01 - 24:00', visible: true},
    {key: 'total', label: 'Total', visible: true} // ในหน้า Detail ให้มี Column Total ด้วย ทั้ง Tab Entry/Exit แล้ว Tab Concept Point https://app.clickup.com/t/86ev29x0u
  ]

  // v2.0.33 Detail Weekly tab Concept point แสดงข้อมูลไม่ถูกต้อง ไม่มีชื่อ point แสดง แต่ขึ้นแสดงค่าผลรวมของ Park
  const initialColumnsTabConceptPoint: any = [
    {key: 'supply_demand', label: 'Supply/Demand', visible: true},
    {key: 'concept_id', label: 'Concept ID', visible: true},
    {key: 'unit', label: 'Unit', visible: true},
    {key: 'entry_exit', label: 'Entry/Exit', visible: true},

    {key: 'h1', label: 'H1 00:00 - 01:00', visible: true},
    {key: 'h2', label: 'H2 01:01 - 02:00', visible: true},
    {key: 'h3', label: 'H3 02:01 - 03:00', visible: true},
    {key: 'h4', label: 'H4 03:01 - 04:00', visible: true},
    {key: 'h5', label: 'H5 04:01 - 05:00', visible: true},
    {key: 'h6', label: 'H6 05:01 - 06:00', visible: true},
    {key: 'h7', label: 'H7 06:01 - 07:00', visible: true},
    {key: 'h8', label: 'H8 07:01 - 08:00', visible: true},
    {key: 'h9', label: 'H9 08:01 - 09:00', visible: true},

    {key: 'h10', label: 'H10 09:01 - 10:00', visible: true},
    {key: 'h11', label: 'H11 10:01 - 11:00', visible: true},
    {key: 'h12', label: 'H12 11:01 - 12:00', visible: true},
    {key: 'h13', label: 'H13 12:01 - 13:00', visible: true},
    {key: 'h14', label: 'H14 13:01 - 14:00', visible: true},
    {key: 'h15', label: 'H15 14:01 - 15:00', visible: true},
    {key: 'h16', label: 'H16 15:01 - 16:00', visible: true},
    {key: 'h17', label: 'H17 16:01 - 17:00', visible: true},
    {key: 'h18', label: 'H18 17:01 - 18:00', visible: true},
    {key: 'h19', label: 'H19 18:01 - 19:00', visible: true},
    {key: 'h20', label: 'H20 19:01 - 20:00', visible: true},
    {key: 'h21', label: 'H21 20:01 - 21:00', visible: true},
    {key: 'h22', label: 'H22 21:01 - 22:00', visible: true},
    {key: 'h23', label: 'H23 22:01 - 23:00', visible: true},
    {key: 'h24', label: 'H24 23:01 - 24:00', visible: true},
    {key: 'total', label: 'Total', visible: true}
  ]

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const filterColumnsByTabIndex = (tabIndex: number) => {
    const alwaysVisibleKeys = ['supply_demand', 'area', 'nomination_point', 'unit', 'type', 'entry_exit', 'wi', 'hv', 'sg', 'total']

    if (tabMainIndex === 2 && subTabIndex < 7) {
      // Only return always visible + gas_day
      return [
        ...initialColumnsTabEntryExit.filter((col: any) => alwaysVisibleKeys.includes(col.key)),
        {
          key: 'week_day',
          label: dayLabels[subTabIndex] ?? 'Unknown',
          visible: true
        }
      ]
    } else if (tabMainIndex === 2 && subTabIndex == 7) {
      return [
        ...initialColumnsTabEntryExit.filter((col: any) => alwaysVisibleKeys.includes(col.key)),
        {
          key: 'week_day',
          label: dayLabels[subTabIndexview] ?? 'Unknown',
          visible: true
        }
      ]
    }

    if (tabIndex === 0) {
      // Show everything when tabIndex = 0
      return initialColumnsTabEntryExit
    }

    // Normal case
    const hourColumnMapping: {[key: number]: string[]} = {
      1: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      2: ['h7', 'h8', 'h9', 'h10', 'h11', 'h12'],
      3: ['h13', 'h14', 'h15', 'h16', 'h17', 'h18'],
      4: ['h19', 'h20', 'h21', 'h22', 'h23', 'h24']
    }

    return initialColumnsTabEntryExit.filter((col: any) => {
      if (alwaysVisibleKeys.includes(col.key)) {
        return true
      }
      return hourColumnMapping[tabIndex]?.includes(col.key) ?? false
    })
  }

  const filterColumnsByTabIndexConcept = (tabMain: number, tabIndex: number) => {
    const targetColumns = tabMain == 0 ? initialColumnsTabEntryExit : initialColumnsTabConceptPoint
    const alwaysVisibleKeys = tabMain == 0 ? ['supply_demand', 'area', 'nomination_point', 'unit', 'type', 'concept_id', 'entry_exit', 'wi', 'hv', 'sg', 'total'] : ['supply_demand', 'area', 'unit', 'concept_id', 'entry_exit', 'wi', 'hv', 'sg', 'total']

    // tabMainIndex 0 = daily/weekly
    // tabMainIndex 1 = daily
    // tabMainIndex 2 = weekly

    // tab weekly หน้าแรกสุด
    if (tabMainIndex === 2 && subTabIndex < 7) {
      return [
        ...targetColumns.filter((col: any) => alwaysVisibleKeys.includes(col.key)),
        {
          key: 'week_day',
          label: dayLabels[subTabIndex] ?? 'Unknown',
          visible: true
        }
      ]
    } else if (tabMainIndex === 2 && subTabIndex == 7) {
      return [
        ...targetColumns.filter((col: any) => alwaysVisibleKeys.includes(col.key)),
        {
          key: 'week_day',
          label: dayLabels[subTabIndexview] ?? 'Unknown',
          visible: true
        }
      ]
    }

    if (tabIndex === 0) {
      return targetColumns
    }

    // Normal case
    const hourColumnMapping: {[key: number]: string[]} = {
      1: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      2: ['h7', 'h8', 'h9', 'h10', 'h11', 'h12'],
      3: ['h13', 'h14', 'h15', 'h16', 'h17', 'h18'],
      4: ['h19', 'h20', 'h21', 'h22', 'h23', 'h24']
    }

    return targetColumns.filter((col: any) => {
      if (alwaysVisibleKeys.includes(col.key)) {
        return true
      }
      return hourColumnMapping[tabIndex]?.includes(col.key) ?? false
    })
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Usage
  const visibleColumns = filterColumnsByTabIndex(tabIndex)
  const [visibleColumnsConcept, setVisibleColumnsConcept] = useState<any>()

  useEffect(() => {
    const showColumsList = filterColumnsByTabIndexConcept(tabMain, tabIndex)
    setVisibleColumnsConcept(showColumsList)
    setColumnVisibility(Object.fromEntries(showColumsList.map((column: any) => [column.key, column.visible])))
    setTimeout(() => {
      setColumnVisibility(Object.fromEntries(showColumsList.map((column: any) => [column.key, column.visible])))
    }, 300)
  }, [tabMain, tabIndex])

  const getInitialColumns = () => (tabMain === 0 ? visibleColumns : visibleColumnsConcept)

  const [columnVisibility, setColumnVisibility] = useState<any>(Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible])))

  useEffect(() => {
    setColumnVisibility(Object.fromEntries(getInitialColumns().map((column: any) => [column.key, column.visible])))
  }, [tabMain])

  const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }))
  }

  // ############### PAGINATION ###############
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [paginatedData, setPaginatedData] = useState<any[]>([])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage)
    setCurrentPage(1)
  }

  useEffect(() => {
    if (tabMain == 0) {
      if (sortedData) {
        setPaginatedData(sortedData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
      }
    } else {
      if (sortedDataTabConcept) {
        setPaginatedData(sortedDataTabConcept?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
      }
    }
  }, [tabMain, sortedData, sortedDataTabConcept, currentPage, itemsPerPage])

  const getDayNameBySubTabIndex = (subTabIndex: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[subTabIndex] || ''
  }

  useEffect(() => {
    console.log('paginatedData : ', paginatedData);
  }, [paginatedData])
  

  return (
    <div className={`relative  rounded-t-md z-1`}>
      <div className="pb-2 -ml-5">
        <Tabs
          value={tabMain}
          onChange={handleChangeTabMain}
          aria-label="wrapped label tabs example"
          sx={{
            '& .Mui-selected': {
              color: '#00ADEF !important',
              fontWeight: 'bold !important'
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#00ADEF !important',
              width: tabMain === 0 ? '90px !important' : '110px !important',
              transform: tabMain === 0 ? 'translateX(30%)' : 'translateX(15%)',
              bottom: '10px'
            },
            '& .MuiTab-root': {
              minWidth: 'auto !important'
            }
          }}
        >
          {['Entry/Exit', 'Concept Point'].map((label, index) => (
            <Tab
              key={label}
              label={label}
              id={`tab-${index}`}
              sx={{
                fontFamily: 'Tahoma !important',
                textTransform: 'none',
                padding: '8px 16px',
                minWidth: '50px',
                maxWidth: '140px',
                flexShrink: 0,
                color: tabMain === index ? '#58585A' : '#9CA3AF'
              }}
            />
          ))}
        </Tabs>
      </div>

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
              exportToExcel(tabMain === 0 ? sortedData : sortedDataTabConcept, 'shipper-nom-report-detail', columnVisibility, {
                tabMainIndex: tabMainIndex, // จากหน้าแรก daily/weekly = 0, daily = 1, weekly = 2
                subTabIndex: subTabIndex < 7 ? subTabIndex : subTabIndexview, // จาก tab weekly -> tab ย่อยรายวัน sunday = 0, monday = 1, ... , saturday = 6
                tabEachZoneIndex: tabMain, // จากหน้า detail tab entry/exit = 0, concept point = 1
                tableData: tableData,
                gasDay: gasDay,
                day_text: getDayNameBySubTabIndex(subTabIndex < 7 ? subTabIndex : subTabIndexview),
                date: dayjs(tableData.gas_day, 'DD/MM/YYYY')
                  .add(subTabIndex < 7 ? subTabIndex : subTabIndexview, 'day')
                  .format('DD/MM/YYYY')
              })
            }
            can_export={userPermission ? userPermission?.f_export : false}
          />
        </div>
      </div>

      {tabMainIndex !== 2 && (
        <div className="tabPlanning pb-4 ">
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
            {['All Day', '1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.'].map((label, index) => (
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
                  minWidth: '80px',
                  maxWidth: '80px',
                  flexShrink: 0, // Prevents shrinking
                  backgroundColor: tabIndex === index ? '#FFFFFF' : '#9CA3AF1A',
                  color: tabIndex === index ? '#58585A' : '#9CA3AF',
                  '&:hover': {
                    backgroundColor: '#F3F4F6'
                  }
                }}
              />
            ))}
          </Tabs>
        </div>
      )}

      <div className="h-[calc(100vh-500px)] overflow-y-auto overflow-x-auto block">
        {isLoading ? (
          <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-20">
                {/* tabs concept point */}
                {columnVisibility.supply_demand && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort('1', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Supply/Demand`}
                    {getArrowIcon('1')}
                  </th>
                )}

                {columnVisibility.area && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort('area_text', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Area`}
                    {getArrowIcon('area_text')}
                  </th>
                )}

                {columnVisibility.nomination_point && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] `} onClick={() => handleSort('3', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Nomination Point`}
                    {getArrowIcon('3')}
                  </th>
                )}

                {/* tabs concept point */}
                {columnVisibility.concept_id && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSortConcept(['3', '4', '5'], sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Concept ID`}
                    {getArrowIcon('3,4,5')}
                  </th>
                )}

                {/* tabs concept point */}
                {columnVisibility.unit && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort('9', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Unit`}
                    {getArrowIcon('9')}
                  </th>
                )}

                {columnVisibility.type && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort('6', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Type`}
                    {getArrowIcon('6')}
                  </th>
                )}

                {/* tabs concept point */}
                {columnVisibility.entry_exit && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px]`} onClick={() => handleSort('10', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Entry/Exit`}
                    {getArrowIcon('10')}
                  </th>
                )}

                {columnVisibility.wi && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort('11', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`WI`}
                    {getArrowIcon('11')}
                  </th>
                )}

                {columnVisibility.hv && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort('12', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`HV`}
                    {getArrowIcon('12')}
                  </th>
                )}

                {columnVisibility.sg && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort('13', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`SG`}
                    {getArrowIcon('13')}
                  </th>
                )}

                {getVisibleHours().map(({key, label, timeRange}, index) => {
                  let countmanoSort: any = index + 14 //data length => get sort data

                  return (
                    columnVisibility[key] && (
                      <th
                        key={key}
                        scope="col"
                        className={`${table_sort_header_style} min-w-[170px] text-center`}
                        onClick={() => handleSort(countmanoSort?.toString(), sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}
                      >
                        <div>{label}</div>
                        <div>{timeRange}</div>
                        {getArrowIcon(countmanoSort?.toString())}
                      </th>
                    )
                  )
                })}

                {columnVisibility.total && tabMainIndex !== 2 && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort('38', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    {`Total`}
                    {getArrowIcon('38')}
                  </th>
                )}

                {columnVisibility.week_day && tabMainIndex == 2 && (
                  <th scope="col" className={`${table_sort_header_style} min-w-[120px] text-center`} onClick={() => handleSort('14', sortState, setSortState, tabMain === 0 ? setSortedData : setSortedDataTabConcept, tabMain === 0 ? sortedDataOriginal0 : sortedDataOriginal1)}>
                    <div>{getDayNameBySubTabIndex(subTabIndex < 7 ? subTabIndex : subTabIndexview)}</div>
                    <div>
                      {tabMainIndex === 2 && tableData?.gas_day
                        ? dayjs(tableData.gas_day, 'DD/MM/YYYY')
                            .add(subTabIndex < 7 ? subTabIndex : subTabIndexview, 'day')
                            .format('DD/MM/YYYY')
                        : tableData?.gas_day || ''}
                    </div>
                    {getArrowIcon('14')}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {paginatedData?.length > 0 &&
                paginatedData?.map((row: any, index: any) => {
                  let key_: any = ''
                  let value_: any = ''
                  let valueAll_: any = ''
                  if (tabMainIndex !== 2 && row?.nom?.nomination_type_id == 2) {
                    key_ = Object.keys(row?.headData || {}).find((k) => row.headData[k] === gasDay) || ''
                    // value_ = (row?.data_temp[key_] === "0.000" || row?.data_temp[key_] === 0) ? 0 : ((!!parseToNumber(row?.data_temp[key_] ?? null) && (parseToNumber(row?.data_temp[key_] ?? null) || 0) / 24) || '')
                    value_ = (row?.data_temp[key_] === "0.000" || row?.data_temp[key_] === 0) ? 0 : ((!!parseToNumber(row?.data_temp[key_] ?? null) && (parseToNumber(row?.data_temp[key_] ?? null) || 0)) || '')
                    
                    valueAll_ = row?.nom?.nomination_type_id === 2 && value_ !== "" ? (value_?.toFixed(3) * 24) : row?.data_temp[key_]
                  }

                  let selectedDay: any = getDayNameBySubTabIndex(subTabIndex < 7 ? subTabIndex : subTabIndexview)

                  const wi_ = row?.data_temp['11']
                  const hv_ = row?.data_temp['12']
                  const sg_ = row?.data_temp['13']

                  return (
                    <tr key={index} className={`${table_row_style}`}>
                      {columnVisibility.supply_demand && <td className="px-2 py-1 text-[#464255] ">{row?.data_temp['1'] ? row?.data_temp['1'] : ''}</td>}

                      {columnVisibility.concept_id && <td className="px-2 py-1 text-[#464255]">{row?.data_temp['3']?.trim() !== '' ? row?.data_temp['3'] : row?.data_temp['4']?.trim() !== '' ? row?.data_temp['4'] : row?.data_temp['5']?.trim() !== '' ? row?.data_temp['5'] : ''}</td>}

                      {columnVisibility?.area && (
                        <td className={`px-2 py-1 ${row?.status ? 'text-[#464255]' : 'text-[#9CA3AF]'} !justify-center items-center text-center flex`}>
                          {(() => {
                            const filter_area = areaMaster?.data?.find((item: any) => item.name === row?.area_text?.trim())

                            return filter_area?.entry_exit_id == 2 ? (
                              <div className="flex justify-center items-center rounded-full p-1 text-[#464255]" style={{backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color)}}>
                                {`${filter_area?.name}`}
                              </div>
                            ) : filter_area?.entry_exit_id == 1 ? (
                              <div className="flex justify-center items-center rounded-lg p-1 text-[#464255]" style={{backgroundColor: filter_area?.color, width: '40px', height: '40px', color: getContrastTextColor(filter_area?.color)}}>
                                {`${filter_area?.name}`}
                              </div>
                            ) : null
                          })()}
                        </td>
                      )}

                      {columnVisibility.nomination_point && <td className="px-2 py-1 text-[#464255]">{row?.data_temp['3'] ? row?.data_temp['3'] : ''}</td>}

                      {columnVisibility.unit && <td className="px-2 py-1 text-[#464255]">{row?.data_temp['9'] ? row?.data_temp['9'] : ''}</td>}

                      {columnVisibility.type && <td className="px-2 py-1 text-[#464255]">{row?.data_temp['6'] ? row?.data_temp['6'] : ''}</td>}

                      {columnVisibility.entry_exit && (
                        <td className="px-2 py-1  justify-center ">
                          {(() => {
                            const filter_entry_exit = entryExitMaster?.data?.find((item: any) => item.name === row?.data_temp['10']?.trim())
                            return filter_entry_exit ? <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{backgroundColor: filter_entry_exit?.color}}>{`${filter_entry_exit?.name}`}</div> : ''
                          })()}
                        </td>
                      )}

                      {columnVisibility.wi && (
                        <td
                          className={`px-2 py-1 text-[#464255] text-right 
                                ${row?.data_temp?.['11'] !== undefined && row?.newObj?.['11']?.min !== undefined && row?.newObj?.['11']?.max !== undefined && (row.data_temp['11'] < row.newObj['11'].min || row.data_temp['11'] > row.newObj['11'].max) ? 'text-[#ED1B24]' : ''}
                            `}
                        >
                          {row?.data_temp['11'] ? formatNumberThreeDecimal(row?.data_temp['11']) : ''}
                        </td>
                      )}

                      {columnVisibility.hv && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['12']) < row?.newObj?.['12']?.min || parseFloat(row?.data_temp['12']) > row?.newObj?.['12']?.max ? 'text-[#ED1B24]' : ''}`}>
                          {row?.data_temp['12'] ? formatNumberThreeDecimal(row?.data_temp['12']) : ''}
                        </td> 
                      )}

                      {columnVisibility.sg && <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['13']) > parseFloat(row?.newObj?.['13']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                        {row?.data_temp['13'] ? formatNumberFourDecimal(row?.data_temp['13']) : ''}
                        </td>}

                      {columnVisibility.h1 && (tabIndex == 1 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['14']) > parseFloat(row?.newObj?.['14']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['14']) : formatNumberThreeDecimal(row?.data_temp['14'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h2 && (tabIndex == 1 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['15']) > parseFloat(row?.newObj?.['15']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['15']) : formatNumberThreeDecimal(row?.data_temp['15'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h3 && (tabIndex == 1 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['16']) > parseFloat(row?.newObj?.['16']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['16']) : formatNumberThreeDecimal(row?.data_temp['16'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h4 && (tabIndex == 1 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['17']) > parseFloat(row?.newObj?.['17']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['17']) : formatNumberThreeDecimal(row?.data_temp['17'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h5 && (tabIndex == 1 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['18']) > parseFloat(row?.newObj?.['18']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['18']) : formatNumberThreeDecimal(row?.data_temp['18'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h6 && (tabIndex == 1 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['19']) > parseFloat(row?.newObj?.['19']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['19']) : formatNumberThreeDecimal(row?.data_temp['19'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h7 && (tabIndex == 2 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['20']) > parseFloat(row?.newObj?.['20']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['20']) : formatNumberThreeDecimal(row?.data_temp['20'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h8 && (tabIndex == 2 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['21']) > parseFloat(row?.newObj?.['21']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['21']) : formatNumberThreeDecimal(row?.data_temp['21'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h9 && (tabIndex == 2 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['22']) > parseFloat(row?.newObj?.['22']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['22']) : formatNumberThreeDecimal(row?.data_temp['22'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h10 && (tabIndex == 2 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['23']) > parseFloat(row?.newObj?.['23']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['23']) : formatNumberThreeDecimal(row?.data_temp['23'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h11 && (tabIndex == 2 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['24']) > parseFloat(row?.newObj?.['24']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['24']) : formatNumberThreeDecimal(row?.data_temp['24'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h12 && (tabIndex == 2 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['25']) > parseFloat(row?.newObj?.['25']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['25']) : formatNumberThreeDecimal(row?.data_temp['25'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h13 && (tabIndex == 3 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['26']) > parseFloat(row?.newObj?.['26']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['26']) : formatNumberThreeDecimal(row?.data_temp['26'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h14 && (tabIndex == 3 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['27']) > parseFloat(row?.newObj?.['27']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['27']) : formatNumberThreeDecimal(row?.data_temp['27'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h15 && (tabIndex == 3 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['28']) > parseFloat(row?.newObj?.['28']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['28']) : formatNumberThreeDecimal(row?.data_temp['28'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h16 && (tabIndex == 3 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['29']) > parseFloat(row?.newObj?.['29']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['29']) : formatNumberThreeDecimal(row?.data_temp['29'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h17 && (tabIndex == 3 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['30']) > parseFloat(row?.newObj?.['30']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['30']) : formatNumberThreeDecimal(row?.data_temp['30'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h18 && (tabIndex == 3 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['31']) > parseFloat(row?.newObj?.['31']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['31']) : formatNumberThreeDecimal(row?.data_temp['31'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h19 && (tabIndex == 4 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['32']) > parseFloat(row?.newObj?.['32']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['32']) : formatNumberThreeDecimal(row?.data_temp['32'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h20 && (tabIndex == 4 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['33']) > parseFloat(row?.newObj?.['33']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['33']) : formatNumberThreeDecimal(row?.data_temp['33'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h21 && (tabIndex == 4 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['34']) > parseFloat(row?.newObj?.['34']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['34']) : formatNumberThreeDecimal(row?.data_temp['34'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h22 && (tabIndex == 4 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['35']) > parseFloat(row?.newObj?.['35']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['35']) : formatNumberThreeDecimal(row?.data_temp['35'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h23 && (tabIndex == 4 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['36']) > parseFloat(row?.newObj?.['36']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['36']) : formatNumberThreeDecimal(row?.data_temp['36'])) ) || ''}
                        </td>
                      )}

                      {columnVisibility.h24 && (tabIndex == 4 || tabIndex == 0) && (
                        <td className={`px-2 py-1 text-[#464255] text-right ${parseFloat(row?.data_temp['37']) > parseFloat(row?.newObj?.['37']?.valueBook) ? 'text-[#ED1B24]' : ''}`}>
                          {(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(value_) : formatNumberThreeDecimal(value_))  : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['37']) : formatNumberThreeDecimal(row?.data_temp['37'])) ) || ''}
                        </td>
                      )}

                      {/* {columnVisibility.total && tabMainIndex !== 2 && <td className="px-2 py-1 text-[#464255] text-right font-semibold">{(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(value_ * 24) : formatNumberThreeDecimal(row?.data_temp['38'])) || ''}</td>} */}
                      {/* {columnVisibility.total && tabMainIndex !== 2 && <td className="px-2 py-1 text-[#464255] text-right font-semibold">{(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? formatNumberThreeDecimal(valueAll_) : formatNumberThreeDecimal(row?.data_temp['38'])) || ''}</td>} */}
                      {columnVisibility.total && tabMainIndex !== 2 && <td className="px-2 py-1 text-[#464255] text-right font-semibold">{(tabMainIndex !== 2 && row?.nom?.nomination_type_id === 2 ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(valueAll_) : formatNumberThreeDecimal(valueAll_)) : ((row?.data_temp['9'] === "MMSCFD") ? formatNumberSixDecimal(row?.data_temp['38']) : formatNumberThreeDecimal(row?.data_temp['38']))) || ''}</td>}

                      {columnVisibility.week_day && tabMainIndex == 2 && (
                        <td className="px-4 py-1 text-[#464255] text-right font-semibold">
                          {/* แสดงผล data_temp ตั้งแต่คีย์ 14 - 20 ขึ้นอยู่กับว่ากดดูวันไหน */}
                          {/* key 14 = sunday, 15 = monday, 16 = tuesday, 17 = wednesday, 18 = thursday, 19 = friday, 20 = saturday */}

                          {/* ตาม excel ไม่รู้ถูกไหม */}
                          {selectedDay == 'Sunday'
                            ? row?.data_temp['14']
                              ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['14']) : formatNumberThreeDecimal(row?.data_temp['14']))
                              : ''
                            : selectedDay == 'Monday'
                              ? row?.data_temp['15']
                                ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['15']) : formatNumberThreeDecimal(row?.data_temp['15']))
                                : ''
                              : selectedDay == 'Tuesday'
                                ? row?.data_temp['16']
                                  ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['16']) : formatNumberThreeDecimal(row?.data_temp['16']))
                                  : ''
                                : selectedDay == 'Wednesday'
                                  ? row?.data_temp['17']
                                    ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['17']) : formatNumberThreeDecimal(row?.data_temp['17']))
                                    : ''
                                  : selectedDay == 'Thursday'
                                    ? row?.data_temp['18']
                                      ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['18']) : formatNumberThreeDecimal(row?.data_temp['18']))
                                      : ''
                                    : selectedDay == 'Friday'
                                      ? row?.data_temp['19']
                                        ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['19']) : formatNumberThreeDecimal(row?.data_temp['19']))
                                        : ''
                                      : selectedDay == 'Saturday' && row?.data_temp['20']
                                        ? ((row?.data_temp['9'] === "MMSCFD") ? formatNumberThreeDecimal(row?.data_temp['20']) : formatNumberThreeDecimal(row?.data_temp['20']))
                                        : ''}
                        </td>
                      )}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        ) : (
          <TableSkeleton />
        )}
      </div>

      {isLoading && ((tabMain === 0 && sortedData?.length === 0) || (tabMain === 1 && sortedDataTabConcept?.length === 0)) && <NodataTable />}

      <PaginationComponent totalItems={tabMain === 0 ? sortedData?.length : sortedDataTabConcept?.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={handlePageChange} onItemsPerPageChange={handleItemsPerPageChange} />

      <ColumnVisibilityPopover open={open} anchorEl={anchorEl} setAnchorEl={setAnchorEl} columnVisibility={columnVisibility} handleColumnToggle={handleColumnToggle} initialColumns={tabMain == 0 ? visibleColumns : visibleColumnsConcept} />
    </div>
  )
}

export default TableEachZone
