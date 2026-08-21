import { useEffect, useRef, useState } from "react";
import { ArrowDropUp, ArrowDropDown, RemoveRedEyeOutlined } from '@mui/icons-material';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import Spinloading from "@/components/other/spinLoading";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort } from "@/utils/sortTable";
import { formatNumberSixDecimal, formatNumberThreeDecimal, formatStringToDDMMYYYY } from "@/utils/generalFormatter";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Bangkok")

interface TableProps {
    tableData: any;
    isLoading?: boolean;
    setisLoading?: any;
    columnVisibility?: any;
    openViewForm: (id: any) => void;
    selectedKey: any;
    filteredDataTable: any;
    setExportData: any;
}

const TableMtrMgn: React.FC<TableProps> = ({
    tableData,
    isLoading = false,
    setisLoading,
    openViewForm,
    columnVisibility,
    selectedKey,
    filteredDataTable,
    setExportData
}) => {

    //state
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState([]);
    const [tk, settk] = useState(false)

    //popup actions
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    //load data
    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([]);
        }

        settk(!tk);
    }, [tableData]);

    //function
    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUp sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDown sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null);
                break;
        }
    }

    const sortByGasDayAndMeteringPoint = (data: any[]) => {
        return data?.sort((a, b) => {
            // เปรียบเทียบ gasDay ก่อน
            const gasDayA = new Date(a.gasDay);
            const gasDayB = new Date(b.gasDay);

            if (gasDayA.getTime() < gasDayB.getTime()) return -1;
            if (gasDayA.getTime() > gasDayB.getTime()) return 1;

            // ถ้า gasDay เท่ากัน ให้เปรียบเทียบ meteringPointId
            const meteringA = a.meteringPointId?.toUpperCase() || '';
            const meteringB = b.meteringPointId?.toUpperCase() || '';

            return meteringA.localeCompare(meteringB);
        });
    };

    //read me ============================
    // filteredDataTable คือ data ทั้งหมด ไม่นับตาม page 
    // ถ้าเอามาทำ sort ใส่ ExportData จะทำให้เวลา export ดึงมาทั้งหมด ไม่ตาม pageSIze

    const handleSortFunc = (column?:any) => {
        switch (column) {
            case 'gasDay':
                handleSort("gasDay", sortState, setSortState, setSortedData, tableData)
                handleSort("gasDay", sortState, setSortState, setExportData, tableData)
                break;
            case 'meteringPointId':
                handleSort("meteringPointId", sortState, setSortState, setSortedData, tableData)
                handleSort("meteringPointId", sortState, setSortState, setExportData, tableData)
                break;
            case 'prop.zone.name':
                handleSort("prop.zone.name", sortState, setSortState, setSortedData, tableData)
                handleSort("prop.zone.name", sortState, setSortState, setExportData, tableData)
                break;
            case 'prop.area.name':
                handleSort("prop.area.name", sortState, setSortState, setSortedData, tableData)
                handleSort("prop.area.name", sortState, setSortState, setExportData, tableData)
                break;
            case 'prop.customer_type.name':
                handleSort("prop.customer_type.name", sortState, setSortState, setSortedData, tableData)
                handleSort("prop.customer_type.name", sortState, setSortState, setExportData, tableData)
                break;
            case 'volume':
                handleSort("volume", sortState, setSortState, setSortedData, tableData)
                handleSort("volume", sortState, setSortState, setExportData, tableData)
                break;
            case 'heatingValue':
                handleSort("heatingValue", sortState, setSortState, setSortedData, tableData)
                handleSort("heatingValue", sortState, setSortState, setExportData, tableData)
                break;
            case 'energy':
                handleSort("energy", sortState, setSortState, setSortedData, tableData)
                handleSort("energy", sortState, setSortState, setExportData, tableData)
                break;
            case 'registerTimestamp':
                handleSort("registerTimestamp", sortState, setSortState, setSortedData, tableData)
                handleSort("registerTimestamp", sortState, setSortState, setExportData, tableData)
                break;
            case 'insert_timestamp':
                handleSort("insert_timestamp", sortState, setSortState, setSortedData, tableData)
                handleSort("insert_timestamp", sortState, setSortState, setExportData, tableData)
                break;
            case 'metering_retrieving_id':
                handleSort("metering_retrieving_id", sortState, setSortState, setSortedData, tableData)
                handleSort("metering_retrieving_id", sortState, setSortState, setExportData, tableData)
                break;
            case 'datasource':
                handleSort("datasource", sortState, setSortState, setSortedData, tableData)
                handleSort("datasource", sortState, setSortState, setExportData, tableData)
                break;
            default:
                break;
        }
    }


    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
            <Spinloading spin={isLoading} rounded={0} />
            {!isLoading ?
                <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">

                        {columnVisibility?.gas_day && (
                            // <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("gasDay", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSortFunc("gasDay")}>
                                {`Gas Day`}
                                {getArrowIcon("gasDay")}
                            </th>
                        )}
                        {columnVisibility?.mtr_p_id && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("meteringPointId", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("meteringPointId")}>
                                {/* {`Metering Point ID`} */}
                                {`Metered Point ID`}
                                {getArrowIcon("meteringPointId")}
                            </th>
                        )}
                        {columnVisibility?.zone && (
                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("prop.zone.name", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortFunc("prop.zone.name")}>
                                {`Zone`}
                                {getArrowIcon("prop.zone.name")}
                            </th>
                        )}
                        {columnVisibility?.area && (
                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("prop.area.name", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortFunc("prop.area.name")}>
                                {`Area`}
                                {getArrowIcon("prop.area.name")}
                            </th>
                        )}
                        {columnVisibility?.customer_type && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("prop.customer_type.name", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("prop.customer_type.name")}>
                                {`Customer Type`}
                                {getArrowIcon("prop.customer_type.name")}
                            </th>
                        )}
                        {columnVisibility?.volume && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("volume", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("volume")}>
                                {`Volume (MMSCF)`}
                                {getArrowIcon("volume")}
                            </th>
                        )}
                        {columnVisibility?.heating_volume && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("heatingValue", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("heatingValue")}>
                                {`Heating Value (BTU/SCF)`}
                                {getArrowIcon("heatingValue")}
                            </th>
                        )}
                        {columnVisibility?.energy && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("energy", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("energy")}>
                                {`Energy (MMBTU)`}
                                {getArrowIcon("energy")}
                            </th>
                        )}
                        {columnVisibility?.received_timestamp && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("registerTimestamp", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("registerTimestamp")}>
                                {`Received Timestamp`}
                                {getArrowIcon("registerTimestamp")}
                            </th>
                        )}
                        {columnVisibility?.insert_timestamp && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("insert_timestamp", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("insert_timestamp")}>
                                {`TPA Insert Timestamp`}
                                {getArrowIcon("insert_timestamp")}
                            </th>
                        )}
                        {columnVisibility?.mtr_r_id && (
                            // <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("metering_retrieving_id", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSortFunc("metering_retrieving_id")}>
                                {`Metering Retrieving ID`}
                                {getArrowIcon("metering_retrieving_id")}
                            </th>
                        )}
                        {columnVisibility?.source && (
                            // <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("datasource", sortState, setSortState, setSortedData, tableData)}>
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSortFunc("datasource")}>
                                {`Source`}
                                {getArrowIcon("datasource")}
                            </th>
                        )}
                        {columnVisibility.action && (
                            <th scope="col" className={`${table_header_style} text-center`}>
                                {`Action`}
                            </th>
                        )}
                    </thead>
                    <tbody>
                        {sortedData?.map((row: any, index: any) => {
                            let heatingValue: any = row?.heatingValue;
                            if (typeof heatingValue === "string") {
                                heatingValue = heatingValue.replaceAll(/,/g, '');
                            }

                            return (
                                <tr
                                    key={index}
                                    className={`${table_row_style}`}
                                // style={{ backgroundColor: !isLoading && selectedKey == row?.id ? "#f8f8f8" : "#fff" }}
                                >

                                    {columnVisibility?.gas_day && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.gasDay}</td>
                                        <td className={`px-2 py-1 text-[#464255]`}>{formatStringToDDMMYYYY(row?.gasDay)}</td>
                                    )}

                                    {columnVisibility?.mtr_p_id && (
                                        <td className={`px-2 py-1 text-[#464255]`}>{row?.meteringPointId}</td>
                                    )}

                                    {columnVisibility?.zone && (
                                        <td className={`px-2 py-1`}>
                                            <div className="w-full flex justify-center items-center px-[20px]">
                                                <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.prop?.zone?.color }}>{`${row?.prop?.zone?.name ? row?.prop?.zone?.name : ''}`}</div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility?.area && (
                                        <td className={`px-2 py-1 text-[#464255]`}>
                                            <div className="w-full flex justify-center items-center px-[20px]">
                                                <div className="flex w-[36px] h-[36px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.prop?.area?.color }}>{`${row?.prop?.area?.name ? row?.prop?.area?.name : ''}`}</div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility?.customer_type && (
                                        <td className={`px-2 py-1 text-[#464255]`}>{row?.prop?.customer_type ? row?.prop?.customer_type?.name : ''}</td>
                                    )}

                                    {columnVisibility?.volume && (
                                        // <td className={`px-2 py-1 text-right text-[#464255]`}>{row?.volume ? row?.volume : ''}</td>
                                        // <td className={`px-2 py-1 text-right text-[#464255]`}>{row?.volume ? formatNumberSixDecimal(row?.volume) : ''}</td>
                                        <td className={`px-2 py-1 text-right text-[#464255]`}>
                                            {(row?.volume || row?.volume == 0) ? formatNumberSixDecimal(typeof row?.volume !== "object" && row?.volume || 0) : ''}
                                        </td>
                                    )}

                                    {columnVisibility?.heating_volume && (
                                        <td className={`px-2 py-1 text-right text-[#464255]`}>
                                            {/* {typeof row?.heatingValue === "object" || isNaN(row?.heatingValue) ? "" : row?.heatingValue} */}
                                            {typeof heatingValue === "object" || isNaN(heatingValue) ? "" : formatNumberThreeDecimal(heatingValue)}
                                        </td>
                                    )}

                                    {columnVisibility?.energy && (
                                        // <td className={`px-2 py-1 text-right text-[#464255]`}>{row?.energy}</td>
                                        <td className={`px-2 py-1 text-right text-[#464255]`}>{(row?.energy || row?.energy == 0) ? formatNumberThreeDecimal(row?.energy) : ''}</td>
                                    )}

                                    {columnVisibility?.received_timestamp && (
                                        // <td className={`px-2 py-1 text-[#464255]`}>{row?.registerTimestamp ? formatDateTimeSec(row?.registerTimestamp) : ''}</td>
                                        // แก้ตรงนี้
                                        // <td className={`px-2 py-1 text-[#464255]`}>{row?.registerTimestamp ? dayjs(row?.registerTimestamp).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                                        // <td className={`px-2 py-1 text-[#464255]`}>  {row?.registerTimestamp ? dayjs(row.registerTimestamp).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm:ss') : ''}</td> // ไม่เอา +00 หรือ +01
                                        <td className={`px-2 py-1 text-[#464255]`}>  {row?.registerTimestamp ? dayjs(row.registerTimestamp).format('DD/MM/YYYY HH:mm:ss') : ''}</td>
                                    )}

                                    {columnVisibility?.insert_timestamp && (
                                        // <td className={`px-2 py-1 text-[#464255]`}>{row?.insert_timestamp ? row?.insert_timestamp : ''}</td>
                                        <td className={`px-2 py-1 text-[#464255]`}>{row?.insert_timestamp ? dayjs(row?.insert_timestamp, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Bangkok').format("DD/MM/YYYY HH:mm:ss") : ''}</td>
                                    )}

                                    {columnVisibility?.mtr_r_id && (
                                        <td className={`px-2 py-1 text-[#464255]`}>{row?.metering_retrieving_id ? row?.metering_retrieving_id : ''}</td>
                                    )}

                                    {columnVisibility?.source && (
                                        // <td className={`px-2 py-1 text-center text-[#464255]`}>{row?.datasource}</td>
                                        <td className={`px-2 py-1 text-center text-[#464255]`}>
                                            {typeof row?.datasource !== 'object' ? row?.datasource : ''}
                                        </td>
                                    )}

                                    {columnVisibility.action && (
                                        <td className="px-2 py-1">
                                            <div className="relative inline-flex justify-center items-center w-full">
                                                <BtnActionTable
                                                    togglePopover={togglePopover}
                                                    row_id={row?._id?.['$oid'] ?? row?.id}
                                                />
                                                {openPopoverId === (row?._id?.['$oid'] ?? row?.id) && (
                                                    <div ref={popoverRef}
                                                        className="absolute left-[-9rem] top-[-10px] mt-2 w-[180px] bg-white border border-gray-300 rounded-lg shadow-lg z-50"
                                                    >
                                                        <ul className="py-2">
                                                            <li
                                                                className="px-4 py-2 font-bold text-[14px] text-[#58585A] hover:bg-gray-100 cursor-pointer flex justify-center items-center"
                                                                onClick={() => { toggleMenu("view", row?._id?.['$oid'] ?? row?.id) }}
                                                            >
                                                                <RemoveRedEyeOutlined sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View Quality`}
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                :
                <TableSkeleton />
            }
        </div>
    )
}

export default TableMtrMgn;