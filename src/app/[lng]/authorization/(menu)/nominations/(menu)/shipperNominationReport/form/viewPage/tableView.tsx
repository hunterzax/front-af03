import {useEffect} from 'react'
import React, {useState} from 'react'
import TableSkeleton from '@/components/material_custom/DefaultSkeleton'
import {addTotalPerRow, findWeeklyByGasDay, formatNumberFourDecimal, formatNumberThreeDecimal, getContrastTextColor} from '@/utils/generalFormatter'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import {table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style} from '@/utils/styles'
import {handleSort, handleSortWithPaginate, sortOnPagenationWithPaginate} from '@/utils/sortTable'
import NodataTable from '@/components/other/nodataTable'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import dayjs from 'dayjs'

const TableView: React.FC<any> = ({tableData, openViewForm, columnVisibility, isLoading, userPermission, tabEntry, openDetailForm, tabIndex, subTabIndex, subTabIndexview, gasDayFilter, itemsPerPage, currentPage, originalData, dataSorting}) => {
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const [sortedData, setSortedData] = useState<any>([])

  const sortKeyCapRight = tabIndex === 2 && subTabIndex >= 0 && subTabIndex <= 6 ? `weeklyDay.${dayKeys[subTabIndex]}.capacityRightMMBTUD` : 'capacityRightMMBTUD'

  const sortKeyNominated = tabIndex === 2 && subTabIndex >= 0 && subTabIndex <= 6 ? `weeklyDay.${dayKeys[subTabIndex]}.nominatedValueMMBTUD` : 'nominatedValueMMBTUD'

  const sortKeyOverusage = tabIndex === 2 && subTabIndex >= 0 && subTabIndex <= 6 ? `weeklyDay.${dayKeys[subTabIndex]}.overusageMMBTUD` : 'overusageMMBTUD'
  console.log('--- tableData : ', tableData);
  useEffect(() => {
    const sum_val_ = addTotalPerRow(tableData)
    if (sortState?.direction) {
      const col: any = sortState?.column
      sortOnPagenationWithPaginate(col, sortState, setSortState, setSortedData, dataSorting, itemsPerPage, currentPage)
    } else {
      setSortedData(sum_val_)
    }
  }, [tableData])

  const [sortState, setSortState] = useState({column: null, direction: null})

  const getArrowIcon = (column: string) => {
    return (
      <div className={`${table_col_arrow_sort_style}`}>
        <ArrowDropUpIcon sx={{fontSize: 18, opacity: sortState.column === column && sortState.direction === 'asc' ? 1 : 0.4}} />
        <ArrowDropDownIcon sx={{fontSize: 18, opacity: sortState.column === column && sortState.direction === 'desc' ? 1 : 0.4}} />
      </div>
    )
  }

  // console.log('sortedData : ', sortedData);
  // nominatedValueMMBTUD

  return (
    <div className={`relative h-[calc(100vh-340px)] overflow-y-auto block  rounded-t-md z-1`}>
      {isLoading ? (
        <table className={`w-full text-sm text-left rtl:text-right text-gray-500 `}>
          <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
            <tr className="h-9">
              {columnVisibility.gas_day && (
                <th scope="col" className={`${table_sort_header_style} text-center max-w-[200px]`} onClick={() => handleSortWithPaginate('gas_day', sortState, setSortState, setSortedData, dataSorting, itemsPerPage, currentPage)}>
                  {`Gas Day`}
                  {getArrowIcon('gas_day')}
                </th>
              )}

              {columnVisibility.area && (
                <th scope="col" className={`${table_sort_header_style} text-center !min-w-[120px] !max-w-[200px]`} onClick={() => handleSortWithPaginate('area_text', sortState, setSortState, setSortedData, dataSorting, itemsPerPage, currentPage)}>
                  {`Area`}
                  {getArrowIcon('area_text')}
                </th>
              )}

              {columnVisibility.capacity_right && (
                <th scope="col" className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`} onClick={() => handleSortWithPaginate(sortKeyCapRight, sortState, setSortState, setSortedData, dataSorting, itemsPerPage, currentPage)}>
                  {`Capacity Right (MMBTU/D)`}
                  {getArrowIcon(sortKeyCapRight)}
                </th>
              )}

              {columnVisibility.nominated_value && (
                <th scope="col" className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`} onClick={() => handleSortWithPaginate(sortKeyNominated, sortState, setSortState, setSortedData, dataSorting, itemsPerPage, currentPage)}>
                  {`Nominated Value (MMBTU/D)`}
                  {getArrowIcon(sortKeyNominated)}
                </th>
              )}

              {columnVisibility.overusage && (
                <th scope="col" className={`${table_sort_header_style} !min-w-[120px] !max-w-[200px] text-right`} onClick={() => handleSortWithPaginate(sortKeyOverusage, sortState, setSortState, setSortedData, dataSorting, itemsPerPage, currentPage)}>
                  {`Overusage (MMBTU/D)`}
                  {getArrowIcon(sortKeyOverusage)}
                </th>
              )}

              {columnVisibility.action && (
                <th scope="col" className={`${table_header_style} text-center`}>
                  {`Detail`}
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {sortedData?.length > 0 &&
              sortedData?.map((row: any, index: any) => {
                const hitMeUp = findWeeklyByGasDay(row?.weeklyDay, gasDayFilter)
                // console.log('row : ', row);
                // console.log('row?.capacityRightMMBTUD : ', row?.capacityRightMMBTUD);
                return (
                  <tr key={row?.id} className={`${table_row_style}`}>
                    {columnVisibility.gas_day && (
                      <td className="px-2 py-1 text-[#464255] max-w-[60px] text-center">
                        {tabIndex == 0
                          ? originalData?.gas_day_text || originalData?.gas_day
                          : tabIndex === 2 && subTabIndex < 7
                            ? dayjs(originalData?.gas_day, 'DD/MM/YYYY').add(subTabIndex, 'day').format('DD/MM/YYYY')
                            : tabIndex === 2 && subTabIndex >= 7
                              ? hitMeUp?.data?.gas_day_text
                              : dayjs(originalData?.gas_day, 'DD/MM/YYYY').format('DD/MM/YYYY')}
                      </td>
                    )}

                    {columnVisibility.area && (
                      <td className="px-2 py-1 justify-center flex min-w-[120px] text-center">
                        {row?.areaObj ? (
                          row?.areaObj?.entry_exit_id == 2 ? (
                            <div className="flex justify-center items-center rounded-full p-1 text-[#464255]" style={{backgroundColor: row?.areaObj?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.areaObj?.color)}}>
                              {`${row?.areaObj?.name}`}
                            </div>
                          ) : (
                            <div className="flex justify-center items-center rounded-lg p-1 text-[#464255]" style={{backgroundColor: row?.areaObj?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.areaObj?.color)}}>
                              {`${row?.areaObj?.name}`}
                            </div>
                          )
                        ) : null}
                      </td>
                    )}

                    {tabIndex == 2 ? (
                      <>
                        {columnVisibility.capacity_right && (
                          <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                            {' '}
                            {subTabIndex < 7
                              ? (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.capacityRightMMBTUD) ?? '0.000')
                              : (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.capacityRightMMBTUD) ?? '0.000')}
                          </td>
                        )}

                        {columnVisibility.nominated_value && (
                          <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                            {' '}
                            {subTabIndex < 7
                              ? (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.nominatedValueMMBTUD) ?? '0.000')
                              : (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.nominatedValueMMBTUD) ?? '0.000')}
                          </td>
                        )}

                        {columnVisibility.overusage && (
                          <td className="px-4 py-1 text-[#464255] max-w-[250px] text-right">
                            {' '}
                            {subTabIndex < 7
                              ? (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndex]]?.overusageMMBTUD) ?? '0.000')
                              : (formatNumberThreeDecimal(row?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][subTabIndexview]]?.overusageMMBTUD) ?? '0.000')}
                          </td>
                        )}
                      </>
                    ) : (
                      <>
                        {columnVisibility.capacity_right && <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">{row?.capacityRightMMBTUD ? formatNumberThreeDecimal(row?.capacityRightMMBTUD) : '0.000'}</td>}

                        {columnVisibility.nominated_value && <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">{row?.nominatedValueMMBTUD ? formatNumberThreeDecimal(row?.nominatedValueMMBTUD) : (row?.nominatedValueMMBTUD === null ? null : '0.000')}</td>}

                        {columnVisibility.overusage && <td className="px-4 py-1 text-[#464255] max-w-[60px] text-right">{row?.overusageMMBTUD ? formatNumberThreeDecimal(row?.overusageMMBTUD) : (row?.nominatedValueMMBTUD === null ? null : '0.000')}</td>}
                      </>
                    )}

                    {columnVisibility.action && (
                      <td className="px-2 py-1 text-center">
                        <div className="inline-flex items-center justify-center relative">
                          {
                            row?.nominatedValueMMBTUD !== null && 
                            <button
                            type="button" className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative" onClick={() => openDetailForm(row)} disabled={false}>
                              <RemoveRedEyeOutlinedIcon sx={{fontSize: 18, color: '#464255', '&:hover': {color: '#ffffff'}}} />
                            </button>
                          }
                        </div>
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

      {isLoading && sortedData?.length == 0 && <NodataTable />}
    </div>
  )
}

export default TableView
