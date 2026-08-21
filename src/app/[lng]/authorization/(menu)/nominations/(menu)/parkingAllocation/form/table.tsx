import { useEffect, useRef } from "react";
import React, { useState } from 'react';
import TableSkeleton, { DefaultSkeleton } from '@/components/material_custom/DefaultSkeleton';
import { formatNumberFourDecimal, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_sort_header_style } from "@/utils/styles";
import { handleSortParkingAllocation } from "@/utils/sortTable";
import getUserValue from "@/utils/getuserValue";

interface TableProps {
  openEditForm: (id: any) => void;
  openViewForm: (id: any) => void;
  setDataReGen: any;
  // dataTableYesterday: any;
  selectedRoles: any;
  setSelectedRoles: any;
  tableData: any;
  isLoading: any;
  columnVisibility: any;
  userPermission?: any;
}

// const TableNomParkingAllocation: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, setDataReGen, dataTableYesterday, selectedRoles, setSelectedRoles }) => {
const TableNomParkingAllocation: React.FC<TableProps> = ({ openEditForm, openViewForm, tableData, isLoading, columnVisibility, userPermission, setDataReGen, selectedRoles, setSelectedRoles }) => {
  const [sortState, setSortState] = useState({ column: null, direction: null });
  const [sortedData, setSortedData] = useState(tableData);

  const userDT: any = getUserValue();

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setSortedData(tableData);
    } else {
      setSortedData([]);
    }
  }, [tableData]);

  const [openPopoverId, setOpenPopoverId] = useState(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const togglePopover = (id: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null);
    } else {
      setOpenPopoverId(id);
    }
  };

  const getArrowIcon = (column: string) => {
    return <div className={`${table_col_arrow_sort_style}`}>
      <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
      <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
    </div>
  };

  const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case "view":
        openViewForm(id);
        setOpenPopoverId(null); // close popover
        break;
      case "edit":
        openEditForm(id);
        setOpenPopoverId(null);
        break;
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setOpenPopoverId(null);
    }
  };

  // const findParkDefault = async (zone_id: any) => {

  //   const response: any = await getService(`/master/parking-allocation/park-default?zone_id=${zone_id}`);
  //    

  //   setDataParkDefault(response)

  //   return response
  // }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);

  // const [parkDefaults, setParkDefaults] = useState<{ [zoneId: number]: any }>({});
  // useEffect(() => {
  //   const loadDefaults = async () => {
  //     if (!sortedData) return;

  //     const result: { [zoneId: number]: any } = {};

  //     for (const mainItem of sortedData) {
  //       const zoneId = mainItem?.zoneObj?.id;
  //       if (zoneId && !result[zoneId]) {
  //         result[zoneId] = await findParkDefault(zoneId);
  //       }
  //     }

  //     setParkDefaults(result);
  //   };

  //   loadDefaults();
  // }, [sortedData]);



  return (
    <div className={`relative h-[calc(100vh-380px)] overflow-y-auto block  rounded-t-md z-1`}>

      {
        isLoading ?
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
              <tr className="h-9">

                {columnVisibility.zone && (
                  <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortParkingAllocation("zoneObj.name", sortState, setSortState, setSortedData, tableData)}>
                    {`Zone`}
                    {getArrowIcon("zoneObj.name")}
                  </th>
                )}

                {columnVisibility.shipper_name && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("shipper_name", sortState, setSortState, setSortedData, tableData)}>
                    {`Shipper Name`}
                    {getArrowIcon("shipper_name")}
                  </th>
                )}

                {columnVisibility.contract_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}>
                    {`Contract Code`}
                    {getArrowIcon("contract_code.contract_code")}
                  </th>
                )}

                {columnVisibility.nominations_code && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("nominations_code", sortState, setSortState, setSortedData, tableData)}>
                    {`Nominations Code`}
                    {getArrowIcon("nominations_code")}
                  </th>
                )}

                {columnVisibility.version && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("version.version", sortState, setSortState, setSortedData, tableData)}>
                    {`Version`}
                    {getArrowIcon("version.version")}
                  </th>
                )}

                {columnVisibility.eod_park && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("EODPark", sortState, setSortState, setSortedData, tableData)}>
                    {`EOD Park (MMBTU)`}
                    {getArrowIcon("EODPark")}
                  </th>
                )}

                {columnVisibility.unpark_nominations && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("Unpark", sortState, setSortState, setSortedData, tableData)}>
                    {`Unpark Nominations (MMBTU)`}
                    {getArrowIcon("Unpark")}
                  </th>
                )}

                {columnVisibility.park_nominations && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("Park", sortState, setSortState, setSortedData, tableData)}>
                    {`Park Nominations (MMBTU)`}
                    {getArrowIcon("Park")}
                  </th>
                )}

                {columnVisibility.park_allocation && (
                  <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortParkingAllocation("park_allocation", sortState, setSortState, setSortedData, tableData)}>
                    {`Park Allocated (MMBTU)`}
                    {getArrowIcon("park_allocation")}
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {sortedData && sortedData?.map((mainItem: any, mockIndex: number) => {
                // let yesterday_val = dataTableYesterday.find((itemx: any) => itemx.zone == mainItem.zone) // Last User Park Value
                const yesterdayDataPark = mainItem['dataParkD-1']?.data

                return (
                  <>
                    {mainItem?.data?.map((item: any, index: number) => {

                      {/* // แสดงตาม zone ที่ set ไว้ใน system parameter ใน dam */ }
                      {/* ดึงข้อมูลจากเส้นนี้มาแสดงก็ได้ ใช้ id zone ใน row master/parking-allocation/park-default?zone_id=30 */ }

                      // let park_allo_default = findParkDefault(mainItem?.zoneObj?.id)
                      // const park_allo_default = parkDefaults[mainItem?.zoneObj?.id];
                      const yesterdayItemPark = yesterdayDataPark?.find((yesterdayItem: any) =>
                        yesterdayItem?.contract_code ?
                          yesterdayItem?.contract_code == item?.data?.[0]?.contract_code?.contract_code
                          :
                          yesterdayItem?.reserve_balancing_gas_contract == item?.data?.[0]?.reserve_balancing_gas_contract
                      )
                      console.log('yesterdayItemPark : ', yesterdayItemPark);
                      return (
                        <>
                          {
                            <tr key={`${mockIndex}-${index}`} className="border-b bg-white h-12">

                              {columnVisibility.zone && (
                                <td className="px-2 py-1 h-[30px] justify-center">
                                  {mainItem?.zoneObj && (
                                    <div
                                      className="flex justify-center items-center rounded-full p-1 text-[#464255] text-center"
                                      style={{
                                        backgroundColor: mainItem?.zoneObj?.color,
                                        minWidth: '130px',
                                        maxWidth: 'max-content',
                                        wordWrap: 'break-word',
                                        whiteSpace: 'normal',
                                      }}
                                    >
                                      {`${mainItem?.zoneObj?.name}`}
                                    </div>
                                  )}
                                </td>
                              )}

                              {columnVisibility.shipper_name && (
                                <td className="px-2 py-1 text-[#464255] text-center">
                                  {item?.data?.[0]?.group ? item?.data?.[0]?.group?.name : ''}
                                </td>
                              )}

                              {columnVisibility.contract_code && (
                                <td className="px-2 py-1 text-[#464255] text-center">
                                  {/* {mainItem?.contract_code ? mainItem?.contract_code?.contract_code : ''} */}
                                  {item?.data?.[0]?.contract_code ? item?.data?.[0]?.contract_code?.contract_code : item?.data?.[0]?.reserve_balancing_gas_contract?.res_bal_gas_contract ? item?.data?.[0]?.reserve_balancing_gas_contract?.res_bal_gas_contract : ''}
                                </td>
                              )}

                              {columnVisibility.nominations_code && (
                                <td className="px-2 py-1 text-[#464255] text-center">
                                  {item?.data?.[0]?.nomination_code ? item?.data?.[0]?.nomination_code : ''}
                                </td>
                              )}

                              {columnVisibility.version && (
                                <td className="px-2 py-1 text-[#464255] text-center">
                                  {item?.data?.[0]?.version ? item?.data?.[0]?.version?.version : ''}
                                </td>
                              )}

                              {/* EOD PARK */}
                              {columnVisibility.eod_park && (
                                <td className="px-2 py-1 text-[#464255] text-right">
                                  {item?.EODPark !== null && item?.EODPark !== undefined ? formatNumberFourDecimal(item?.EODPark) : ''}
                                  {/* {yesterdayItemPark?.EODPark !== null && yesterdayItemPark?.EODPark !== undefined ? formatNumberThreeDecimal(yesterdayItemPark?.EODPark) : ''} */}
                                </td>
                              )}

                              {/* Unpark */}
                              {columnVisibility.unpark_nominations && (
                                <td className="px-2 py-1 text-[#464255] text-right">
                                  {/* {itemSub?.type == 'Unpark' ? formatNumberThreeDecimal(itemSub?.value) : ''} */}
                                  {/* {item?.data?.[1] ? formatNumberThreeDecimal(item?.data?.[1]?.value) : ''} */}

                                  {/* {item?.data?.[1] ? item?.data?.[1]?.value : ''} */}
                                  {/* {item?.data?.[0]?.type == 'Unpark' ? item?.data?.[0]?.value : item?.data?.[1]?.type == 'Unpark' && item?.data?.[1]?.value} */}
                                  {item?.data?.[0]?.type == 'Unpark' ? formatNumberFourDecimal(item?.data?.[0]?.value) : item?.data?.[1]?.type == 'Unpark' && formatNumberFourDecimal(item?.data?.[1]?.value)}

                                </td>
                              )}

                              {/* Park */}
                              {columnVisibility.park_nominations && (
                                <td className="px-2 py-1 text-[#464255] text-right">
                                  {/* {itemSub?.type == 'Park' ? formatNumberThreeDecimal(itemSub?.value) : ''} */}
                                  {/* {item?.data?.[0] ? formatNumberThreeDecimal(item?.data?.[0]?.value) : ''} */}
                                  {/* {item?.data?.[0] ? formatNumberThreeDecimal(item?.data?.[0]?.value) : ''} */}

                                  {/* {item?.data?.[0]?.type == 'Park' ? item?.data?.[0]?.value : item?.data?.[1]?.type == 'Park' && item?.data?.[1]?.value} */}
                                  {item?.data?.[0]?.type == 'Park' ? formatNumberFourDecimal(item?.data?.[0]?.value) : item?.data?.[1]?.type == 'Park' && formatNumberFourDecimal(item?.data?.[1]?.value)}

                                </td>
                              )}

                              {/* Park Allocated */}
                              {columnVisibility.park_allocation && (
                                <td className="px-2 py-1 text-[#464255] text-right">
                                  {item?.parkAllocatedMMBTUD !== null && item?.parkAllocatedMMBTUD !== undefined ? formatNumberFourDecimal(item?.parkAllocatedMMBTUD) : ''}
                                </td>
                              )}

                            </tr>
                          }

                        </>

                      )
                    })}

                    {/* --- Summary Row --- */}
                    <tr key={`summary-${mockIndex}`} className="h-[54px] font-semibold bg-[#00ADEF47]">
                      {/* <td className="px-2 py-1 text-[#464255]"></td> */}

                      {/* // แสดงตาม zone ที่ set ไว้ใน system parameter ใน dam */}
                      {/* ดึงข้อมูลจากเส้นนี้มาแสดงก็ได้ ใช้ id zone ใน row master/parking-allocation/park-default?zone_id=30 */}

                      {/* <td className="px-2 py-1 text-[#464255] pl-8" colSpan={3}>{`Park Default Value (MMBTU/D) : ${park_allo_default?.value}`}</td> */}
                      {/* <td className="px-2 py-1 text-[#464255] pl-8" colSpan={3}>{`Park Default Value (MMBTU/D) : ${mainItem?.parkDefault?.value}`}</td> */}

                      {columnVisibility.shipper_name && (
                        // <td className="px-2 py-1 text-[#464255] pl-8" colSpan={3}>{`Park Default Value (MMBTU/D) : ${mainItem?.parkDefault ? formatNumberThreeDecimal(mainItem?.parkDefault?.value) : ''}`}</td>
                        // <td className="px-2 py-1 text-[#464255] pl-8" colSpan={3}>{`Maximum Park Value : ${mainItem?.parkDefault ? formatNumberThreeDecimal(mainItem?.parkDefault?.value) : ''}`}</td> // https://app.clickup.com/t/86etzcgw4  เปลี่ยนชื่อจาก Park Defaul Value > Maximum Park Value
                        <td className="px-2 py-1 text-[#464255] pl-8" colSpan={3}>{`Maximum Park Value : ${mainItem?.parkDefault !== null && mainItem?.parkDefault !== undefined ? formatNumberFourDecimal(mainItem?.parkDefault?.value) : ''}`}</td> // https://app.clickup.com/t/86etzcgw4  เปลี่ยนชื่อจาก Park Defaul Value > Maximum Park Value
                      )}

                      {columnVisibility.nominations_code && (
                        // <td className="px-2 py-1 text-[#464255]" colSpan={2}>{`Last User Park Value (MMBTU/D) :`}</td>

                        // https://app.clickup.com/t/86etzcgwh เปลี่ยนชื่อจาก Last User Park Value > EOD Value (D-1)
                        // <td className="px-2 py-1 text-[#464255]" colSpan={2}>{`EOD Value (D-1) : ${dataTableYesterday ? yesterday_val?.sumPark || '' : ''}`}</td>
                        // <td className="px-2 py-1 text-[#464255]" colSpan={2}>{`EOD Value (D-1) : ${mainItem.lastUserParkValue ? formatNumberThreeDecimal(mainItem?.lastUserParkValue) : ''}`}</td>
                        <td className="px-2 py-1 text-[#464255]" colSpan={2}>{`EOD Value (D-1) : ${mainItem?.["EODValueSumD-1"] ? formatNumberFourDecimal(mainItem?.["EODValueSumD-1"]) : ''}`}</td>
                        
                      )}

                      {columnVisibility.eod_park && (
                        <td className="px-2 py-1 text-[#464255] text-right">{`Available Parking Value`}</td> // เปลี่ยนชื่อจาก Total Parking Value > Available Parking Value https://app.clickup.com/t/86etzcgup
                      )}

                      {/* Total unpark */}
                      {columnVisibility.unpark_nominations && (
                        <td className="px-2 py-1 text-[#464255] text-right">
                          {/* {formatNumberThreeDecimal(mainItem?.sumUnpark)} */}
                          {mainItem?.sumUnpark !== null && mainItem?.sumUnpark !== undefined ? formatNumberFourDecimal(mainItem?.sumUnpark) : ''}
                        </td>
                      )}

                      {/* Total park */}
                      {columnVisibility.park_nominations && (
                        <td className="px-2 py-1 text-[#464255] text-right">
                          {/* {formatNumberThreeDecimal(mainItem?.sumPark)} */}
                          {mainItem?.sumPark !== null && mainItem?.sumPark !== undefined ? formatNumberFourDecimal(mainItem?.sumPark) : ''}
                        </td>
                      )}

                      {/* Park Allocate */}
                      {columnVisibility.park_allocation && (
                        <td className="px-2 py-1 text-[#464255] text-right">
                          {/* {formatNumberThreeDecimal(mainItem?.sumParkAllocate)} */}
                          {mainItem?.sumParkAllocate !== null && mainItem?.sumParkAllocate !== undefined ? formatNumberFourDecimal(mainItem?.sumParkAllocate) : ''}
                        </td>
                      )}

                    </tr>

                  </>
                )
              })}
            </tbody>

          </table>
          :
          <TableSkeleton />
      }
    </div >

  )
}

export default TableNomParkingAllocation;