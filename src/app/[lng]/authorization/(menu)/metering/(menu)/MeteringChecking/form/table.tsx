import { useEffect, useState } from "react";
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { handleSort } from "@/utils/sortTable";
import { formatNumberThreeDecimal, toDayjs } from "@/utils/generalFormatter";

interface TableProps {
    tableData: any;
    isLoading?: boolean;
    setisLoading?: any;
    tabIndex?: any;
    columnVisibility?: any;
    selectedKey: any;
    hindDefaultNodata?: any;
    hindWarning?: any;
}

const TableMtrChecking: React.FC<TableProps> = ({
    tableData,
    isLoading = false,
    setisLoading,
    tabIndex,
    columnVisibility,
    selectedKey,
    hindDefaultNodata,
    hindWarning,
}) => {

    //state
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    //load data
    useEffect(() => {
        if (tableData && tableData?.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUp sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDown sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className="h-[calc(100vh-440px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
            {/* <Spinloading spin={isLoading} rounded={0} /> */}

            {isLoading ?
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                        <tr className="h-9">
                            {columnVisibility?.gas_day && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("gasDay", sortState, setSortState, setSortedData, tableData)}>
                                    {`Gas Day`}
                                    {getArrowIcon("gasDay")}
                                </th>
                            )}

                            {columnVisibility?.metering_point_id && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("meteringPointId", sortState, setSortState, setSortedData, tableData)}>
                                    {`Metering Point ID`}
                                    {getArrowIcon("meteringPointId")}
                                </th>
                            )}

                            {columnVisibility?.customer_type && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("customer_type_name", sortState, setSortState, setSortedData, tableData)}>
                                    {`Customer Type`}
                                    {getArrowIcon("customer_type_name")}
                                </th>
                            )}

                            {/* {[...Array.from({ length: 25 }, (_, i) => i.toString().padStart(2, "0"))] */}
                            {/* {[...Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)]
                            .filter((key) => columnVisibility?.[key])
                            .map((key) => (
                                <th
                                    key={key}
                                    scope="col"
                                    className={`${table_header_style} ${!isNaN(Number(key)) ? "text-center" : ""}`}
                                >
                                    {isNaN(Number(key)) ? key.replace("_", " ") : `${key}.00`}
                                </th>
                            ))} */}


                            {Array.from({ length: 24 }, (_, i) => {
                                // i = 0‥23 → hour = 1‥24
                                const hour = i + 1;
                                return `${hour.toString().padStart(2, "0")}:00`;   // "01:00" … "24:00"
                            }).filter(key => columnVisibility?.[key]).map(key => (
                                <th
                                    key={key}
                                    scope="col"
                                    className={`${(hindDefaultNodata?.[key] || hindWarning?.[key]) && " hidden"} ${table_header_style} text-center`}
                                >
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {sortedData && (sortedData || [])?.map((row: any, index: any) => {
                            return (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                    style={{ backgroundColor: !isLoading && selectedKey == row?.id ? "#f8f8f8" : "#fff" }}
                                >
                                    {columnVisibility?.gas_day && (
                                        // <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} text-center`}>{row?.gasDay}</td>
                                        <td className={`px-2 py-1 text-[#464255] text-center`}>{row?.gasDay ? toDayjs(row?.gasDay)?.format("DD/MM/YYYY") : ''}</td>
                                    )}

                                    {columnVisibility?.metering_point_id && (
                                        // <td className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} `}>{row?.meteringPointId}</td>
                                        <td className={`px-2 py-1 text-[#464255] `}>{row?.meteringPointId ? row?.meteringPointId : ''}</td>
                                    )}

                                    {columnVisibility?.customer_type && (
                                        // <td className={`px-2 py-1 text-[#464255] `}>{row?.customer_type_name}</td>
                                        <td className={`px-2 py-1 text-[#464255] `}>{row?.customer_type ? row?.customer_type?.name : ''}</td>
                                    )}

                                    {/* เดิม 00:00 - 23:00 */}
                                    {/* {[...Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)]
                                        .filter((key) => columnVisibility?.[key]) // Only include visible columns
                                        .map((key) => (
                                            <td
                                                key={key}
                                                scope="col"
                                                className={`px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} text-center`}
                                            >
                                                {
                                                    row[key] === "<%low" ? (
                                                        <span className="text-[#E8B125] font-normal text-[16px]">{`<%low`}</span>
                                                    ) : row[key] === ">%high" ? (
                                                        <span className="text-[#EC6300] font-normal text-[16px]">{`>%high`}</span>
                                                    ) : row[key] === "Div/0" ? (
                                                        <span className="text-[#5E5E5E] font-normal text-[16px]">{`Div/0`}</span>
                                                    ) : row[key] == null ? <span className="text-[#5E5E5E] font-normal text-[16px] tracking-wider">{`N/A`}</span>
                                                        : (
                                                            <div style={{ background: '#FFF' }} className="w-[40px] h-[40px] mt-[15px] flex justify-center items-center">
                                                                <img
                                                                    src={row[key]}
                                                                    // style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                                                                    style={{ width: '30px', height: '30px', objectFit: 'contain' }}
                                                                    alt="Data Image"
                                                                />
                                                            </div>
                                                        )
                                                }

                                            </td>
                                        ))} */}


                                    {/* ใหม่ 01:00 - 24:00 */}
                                    {Array.from({ length: 24 }, (_, i) => {
                                        // i = 0‑23  →  hour = 1‑24
                                        const hour = i + 1;
                                        const hour_val = i;

                                        return {
                                            key: `${hour.toString().padStart(2, "0")}:00`,
                                            val: `${hour_val.toString().padStart(2, "0")}:00`,
                                        }; // "01:00" … "24:00"
                                    })
                                        .filter(key => columnVisibility?.[key?.key])            // include เฉพาะคอลัมน์ที่เปิด
                                        .map((key_:any) => { 
                                            const { val, key } = key_

                                            if(tabIndex === 0){
                                                return (
                                                  <td
                                                      key={key}
                                                      className={`${(hindDefaultNodata?.[key] || hindWarning?.[key]) && " hidden"} px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} text-center`}
                                                  >
                                                      {/* --- แสดงค่า --- */}
                                                      {row[key] === "<%low" ? (
                                                          <span className="text-[#FDC533] font-normal text-[16px]">{`<%low`}</span>
                                                      ) : row[key] === ">%high" ? (
                                                          <span className="text-[#FC7E11] font-normal text-[16px]">{`>%high`}</span>
                                                      ) : row[key] === "Div/0" ? (
                                                          <span className="text-[#696969] font-normal text-[16px]">{`Div/0`}</span>
                                                      ) : row[key] == null ? (
                                                          <span className="text-[#D3D3D3] font-normal text-[16px] tracking-wider">{`N/A`}</span>
                                                      ) : (
                                                          <div className="w-[40px] h-[40px] mt-[15px] flex justify-center items-center bg-white">
                                                              <img
                                                                  src={row[key]}
                                                                  style={{ width: "30px", height: "30px", objectFit: "contain" }}
                                                                  alt="Data"
                                                              />
                                                          </div>
                                                      )}
                                                  </td>
                                              )
                                            }else{
                                                // 
                                                const value1 = `calcCondition1_${val}`
                                                const value = `calcCondition2_${val}`
                                                const type = `type_${val}`

                                                const value_1 = Number.isNaN(Number(row[value] || row[value1])) ? null : formatNumberThreeDecimal(row[value] || row[value1])
                                                const value_ = (value_1 === null) ? "N/A" : value_1 === "-Infinity" || value_1 === "Infinity" ? "Div/0" : value_1


                                                // if(row?.meteringPointId === "HMMT"){ 
                                                //     console.log('row : ', row);
                                                //     console.log('key : ', key);
                                                //     console.log('row[key] : ', row[key]);
                                                //     console.log('row[value] : ', row[value]);
                                                //     console.log('row[value1] : ', row[value1]); 
                                                //     console.log('val : ', val);
                                                //     console.log('- - - -');
                                                // }
                                                return (
                                                  <td
                                                      key={key}
                                                      className={`${(hindDefaultNodata?.[key] || hindWarning?.[key]) && " hidden"} px-2 py-1 ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} text-center`}
                                                  >
                                                      {/* --- แสดงค่า --- */}
                                                      {(row[key] === "<%low" || row[type] === "<%low") ? (
                                                          <div className="flex justify-center items-center text-[#FDC533] font-normal text-[16px]">{value_}</div>
                                                      ) : row[key] == null ? (
                                                          <div className="flex justify-center items-center text-[#696969] font-normal text-[16px] tracking-wider">{value_}</div>
                                                      ) : (row[key] === ">%high" || row[type] === ">%high") ? (
                                                          <div className="flex justify-center items-center text-[#FC7E11] font-normal text-[16px]">{value_}</div>
                                                      ) : row[key] === "Div/0" ? (
                                                          <div className="flex justify-center items-center text-[#696969] font-normal text-[16px]">{value_}</div>
                                                      ) : row[type] === "gray_url" ? (
                                                          <div className="flex justify-center items-center text-[#D3D3D3] font-normal text-[16px] tracking-wider">{value_}</div>
                                                      ) : row[type] === "green_url" ? (
                                                          <div className="flex justify-center items-center text-[#21B766] font-normal text-[16px] tracking-wider">{value_}</div>
                                                      ) : row[type] === "red_url" ? (
                                                          <div className="flex justify-center items-center text-[#FA7070] font-normal text-[16px] tracking-wider">{value_}</div>
                                                      ) : row[type] === "purple_url" ? (
                                                          <div className="flex justify-center items-center text-[#C58AFF] font-normal text-[16px] tracking-wider">{value_}</div>
                                                      ) : (
                                                          <div className="flex justify-center items-center text-[#696969] font-normal text-[16px] tracking-wider">{value_}</div>
                                                      )}
                                                  </td>
                                              )
                                            }
                                        }
                                        )}

                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                : <TableSkeleton />
            }
        </div>
    )
}

export default TableMtrChecking;