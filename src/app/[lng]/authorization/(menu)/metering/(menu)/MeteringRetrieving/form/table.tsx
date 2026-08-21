import { useEffect, useState } from "react";
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { handleSort, handleSortMeterRetriving } from "@/utils/sortTable";
import { formatDate, formatDateTimeSec, formatNumberThreeDecimal, formatStringToDDMMYYYY } from "@/utils/generalFormatter";

interface TableProps {
    tableData: any;
    isLoading?: boolean;
    setisLoading?: any;
    tabIndex?: any;
    columnVisibility?: any;
    columnVisibilityTab2?: any;
    selectedKey: any;
}

const TableMtrRetrieve: React.FC<TableProps> = ({
    tableData,
    isLoading = false,
    setisLoading,
    tabIndex,
    columnVisibility,
    columnVisibilityTab2,
    selectedKey
}) => {

    //state
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    //load data
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    //function
    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUp sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDown sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <div className="h-[calc(100vh-380px)] no-scrollbar overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
            {/* <Spinloading spin={isLoading} rounded={0} /> */}

            {isLoading && tabIndex == 0 ?
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">

                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                        {columnVisibility?.gas_day && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortMeterRetriving("gasDay", sortState, setSortState, setSortedData, tableData)}>
                                {`Gas Day`}
                                {getArrowIcon("gasDay")}
                            </th>
                        )}

                        {columnVisibility?.metering_retrieving_id && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortMeterRetriving("data.metering_retrieving_id", sortState, setSortState, setSortedData, tableData)}>
                                {`Metering Retrieving ID`}
                                {getArrowIcon("data.metering_retrieving_id")}
                            </th>
                        )}

                        {columnVisibility?.metering_point_id && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortMeterRetriving("data.meteringPointId", sortState, setSortState, setSortedData, tableData)}>
                                {`Metering Point ID`}
                                {getArrowIcon("data.meteringPointId")}
                            </th>
                        )}

                        {columnVisibility?.energy_mmbtu && (
                            <th scope="col" className={`${table_sort_header_style}  text-right`} onClick={() => handleSortMeterRetriving("data.energy", sortState, setSortState, setSortedData, tableData)}>
                                {`Energy (MMBTU)`}
                                {getArrowIcon("data.energy")}
                            </th>
                        )}

                        {columnVisibility?.timestamp && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortMeterRetriving("timestamp", sortState, setSortState, setSortedData, tableData)}>
                                {`Timestamp`}
                                {getArrowIcon("timestamp")}
                            </th>
                        )}

                        {columnVisibility?.error_description && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortMeterRetriving("description", sortState, setSortState, setSortedData, tableData)}>
                                {`Error Description`}
                                {getArrowIcon("description")}
                            </th>
                        )}
                    </thead>

                    <tbody>
                        {sortedData && sortedData.map((row: any, index: any) => (
                            <tr
                                key={row?.id}
                                className={`${table_row_style}`}
                            >
                                {columnVisibility?.gas_day && (
                                    // row?.data?.gasDay == "2025-04-02"
                                    // change format to dd/mm/yyyy
                                    // <td className={`px-2 py-1 text-[#464255]`}>{row?.data?.gasDay}</td>
                                    <td className={`px-2 py-1 text-[#464255]`}>{formatStringToDDMMYYYY(row?.data?.gasDay)}</td>
                                )}

                                {columnVisibility?.metering_retrieving_id && (
                                    <td className={`px-2 py-1 text-[#464255]`}>{row?.data?.metering_retrieving_id}</td>
                                )}

                                {columnVisibility?.metering_point_id && (
                                    <td className={`px-2 py-1 text-[#464255]`}>{row?.data?.meteringPointId}</td>
                                )}

                                {columnVisibility?.energy_mmbtu && (
                                    // <td className={`px-2 py-1 text-[#464255] text-right`}>{row?.data?.energy}</td>
                                    <td className={`px-2 py-1 text-[#464255] text-right`}>{row?.data?.energy ? formatNumberThreeDecimal(row?.data?.energy) : row?.data?.energy == 0 || row?.data?.energy == '0' ? '0.000' : ''}</td>
                                )}

                                {columnVisibility?.timestamp && (
                                    // <td className={`px-2 py-1 text-[#464255]`}>{row?.timestamp ? formatDate(row?.timestamp) : ''}</td>
                                    <td className={`px-2 py-1 text-[#464255]`}>{row?.timestamp ? formatDateTimeSec(row?.timestamp) : ''}</td> // Export : Gas Day ไม่เหมือนหน้า UI , Timestamp ยังไม่มีวินาที https://app.clickup.com/t/86eub6d8v
                                )}

                                {columnVisibility?.error_description && (
                                    <td className={`px-2 py-1 text-[#464255]`}>{row?.description}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                : isLoading && tabIndex == 1 ?

                    <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">

                            {columnVisibilityTab2?.met_point_code && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("metering_point_sys", sortState, setSortState, setSortedData, tableData)}>
                                    {/* {`Met. Point Code`} */}
                                    {`Metered Point ID`}
                                    {getArrowIcon("metering_point_sys")}
                                </th>
                            )}

                            {columnVisibilityTab2?.met_point_description && (
                                <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("description", sortState, setSortState, setSortedData, tableData)}>
                                    {`Metered Point Description`}
                                    {getArrowIcon("description")}
                                </th>
                            )}
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                    style={{ backgroundColor: !isLoading && selectedKey == row?.id ? "#f8f8f8" : "#fff" }}
                                >
                                    {columnVisibilityTab2?.met_point_code && (
                                        <td className={`px-2 py-1 text-[#464255]`}>{row?.data?.meteringPointId}</td>
                                    )}

                                    {columnVisibilityTab2?.met_point_description && (
                                        <td className={`px-2 py-1 text-[#464255]`}>{row?.description}</td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    :
                    <TableSkeleton />
            }

        </div>
    )
}

export default TableMtrRetrieve;