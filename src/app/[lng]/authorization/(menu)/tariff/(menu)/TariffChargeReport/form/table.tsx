import { useEffect, useState } from "react";
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import Spinloading from "@/components/other/spinLoading";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { handleSort } from "@/utils/sortTable";
import { formatDateTimeSecPlusSeven, iconButtonClass, toDayjs } from "@/utils/generalFormatter";
import NodataTable from "@/components/other/nodataTable";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import 'react-toastify/dist/ReactToastify.css';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

interface TableProps {
    tableData: any;
    isLoading?: boolean;
    isSearchFilter?: boolean;
    setisLoading?: any;
    columnVisibility?: any;
    initialColumns?: any;
    handleTariffIdClick?: any;
    openViewForm: (id: any) => void;
    openReasonModal: (id?: any, data_comment?: any, row?: any) => void; // comment modal
    userPermission?: any;
    userDT?: any;
    handleFormSubmit?: any;
}

const class_btn_ = `flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `

const TableTariffChargeReport: React.FC<TableProps> = ({
    tableData,
    isLoading = false,
    isSearchFilter = false,
    setisLoading,
    openViewForm,
    openReasonModal,
    handleTariffIdClick,
    columnVisibility,
    initialColumns,
    userPermission,
    userDT,
    handleFormSubmit,
}) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const isShipper = userDT?.account_manage?.[0]?.user_type_id === 3;

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    // const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    useEffect(() => {
        if (tableData && tableData.length > 0) {
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
        <>
            <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
                <Spinloading spin={isLoading} rounded={0} />
                {!isLoading ?
                    <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">
                                {columnVisibility?.tariff_id && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("tariff_id", sortState, setSortState, setSortedData, tableData)}>
                                        {`Tariff ID`}
                                        {getArrowIcon("tariff_id")}
                                    </th>
                                )}

                                {columnVisibility?.shipper_name && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("shipper.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper.name")}
                                    </th>
                                )}

                                {columnVisibility?.month_year_charge && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("month_year_charge", sortState, setSortState, setSortedData, tableData)}>
                                        {`Month/Year Charge`}
                                        {getArrowIcon("month_year_charge")}
                                    </th>
                                )}

                                {columnVisibility?.type && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("tariff_type.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Type`}
                                        {getArrowIcon("tariff_type.name")}
                                    </th>
                                )}

                                {columnVisibility?.timestamp && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("create_date", sortState, setSortState, setSortedData, tableData)}>
                                        {`Timestamp`}
                                        {getArrowIcon("create_date")}
                                    </th>
                                )}

                                {columnVisibility?.invoice_sent && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("tariff_invoice_sent.id", sortState, setSortState, setSortedData, tableData)}>
                                        {`Invoice Sent`}
                                        {getArrowIcon("tariff_invoice_sent.id")}
                                    </th>
                                )}

                                {columnVisibility?.comment && (
                                    <th scope="col" className={`${table_header_style} `}>
                                        {`Comment`}
                                    </th>
                                )}

                                {columnVisibility?.created_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                                {columnVisibility?.updated_by && (
                                    <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Updated By`}
                                        {getArrowIcon("update_by_account.first_name")}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility?.tariff_id && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>
                                            <span
                                                onClick={() => handleTariffIdClick(row?.id)}
                                                className="cursor-pointer underline text-[#1473A1]"
                                            >
                                                {row?.tariff_id || '-'}
                                            </span>
                                        </td>
                                    )}

                                    {columnVisibility?.shipper_name && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.shipper?.name || '-'}</td>
                                    )}

                                    {columnVisibility?.month_year_charge && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.month_year_charge ? dayjs(row?.month_year_charge).format("MMMM YYYY") : '-'}</td>
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.month_year_charge ? toDayjs(row?.month_year_charge).format("MMMM YYYY") : '-'}</td>
                                    )}

                                    {columnVisibility?.type && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.tariff_type ? row?.tariff_type?.name : '-'}</td>
                                    )}

                                    {columnVisibility?.timestamp && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.create_date ? formatDate(row?.create_date) : ''}</td>
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.create_date ? formatDateTimeSecPlusSeven(row?.create_date) : ''}</td>
                                    )}

                                    {columnVisibility?.invoice_sent && (
                                        <td className="px-2 py-1  text-[#464255] min-w-[120px]">
                                            <div className="w-full flex justify-center items-center px-[20px]">
                                                <div
                                                    className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]"
                                                    style={{ backgroundColor: row?.tariff_invoice_sent?.color }}
                                                >
                                                    {`${row?.tariff_invoice_sent?.name ? row?.tariff_invoice_sent?.name : ''}`}
                                                </div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility?.comment && (
                                        <td className="px-2 py-1 text-[#464255] text-center ">
                                            <div className="inline-flex items-center justify-center relative">
                                                {/* <button
                                                    type="button"
                                                    className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                                    onClick={() => openReasonModal(row?.id, row?.tariff_comment, row)}
                                                >
                                                    <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                                </button> */}

                                                <button
                                                    type="button"
                                                    className={iconButtonClass}
                                                    onClick={() => openReasonModal(row?.id, row?.tariff_comment, row)}
                                                >
                                                    <ChatBubbleOutlineOutlinedIcon
                                                        fontSize="inherit"
                                                        className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                        sx={{ color: 'currentColor', fontSize: 18 }}
                                                    />
                                                </button>

                                                <span className="px-2 text-[#464255]">
                                                    {row?.tariff_comment ? row?.tariff_comment?.length : null}
                                                </span>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility.created_by && (
                                        <td className="px-2 py-1 text-[#464255]">
                                            <div>
                                                <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                {/* <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div> */}
                                                <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSecPlusSeven(row?.create_date) : ''}</div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility.updated_by && (
                                        <td className="px-2 py-1 text-[#464255]">
                                            <div>
                                                <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                                {/* <div className="text-gray-500 text-xs">{row?.update_date ? formatDate(row?.update_date) : ''}</div> */}
                                                <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSecPlusSeven(row?.update_date) : ''}</div>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
                }

                {
                    // !isLoading && sortedData?.length == 0 && <NodataTable />
                    !isLoading && sortedData?.length == 0 && !isSearchFilter && <NodataTable textRender={`Please select filter to view information.`} />
                }

                {
                    !isLoading && sortedData?.length == 0 && isSearchFilter && <NodataTable />
                }
            </div>

            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {

                    setModaConfirmSave(false);
                    if (e == "submit") {
                        // setIsLoading(true);
                        setTimeout(async () => {
                            // updateMainStat(dataSubmit);
                        }, 100);

                        // setTimeout(async () => {
                        //     handleClose();
                        // }, 1000);
                    }
                }}
                title="Confirm Close Document"
                description={
                    <div>
                        <div className="text-center">
                            {`Do you want to close this document?`}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Confirm"
                btnsplit2="Cancel"
                stat="none"
            />
        </>
    )
}

export default TableTariffChargeReport;