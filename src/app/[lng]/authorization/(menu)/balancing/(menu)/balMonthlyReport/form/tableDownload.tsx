import { useEffect } from "react";
import React, { useState } from 'react';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { formatDate, iconButtonClass } from "@/utils/generalFormatter";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { handleSort } from "@/utils/sortTable";
import { patchServiceDownload } from "@/utils/postService";
interface TableProps {
    openViewForm?: (id: any) => void;
    tableData: any;
    isLoading: any;
    setIsLoading: any;
    setModalErrorMsg: any;
    setModalErrorOpen: any;
    columnVisibility?: any
    userPermission?: any
    dataShipper?: any
}

const TableDownload: React.FC<TableProps> = ({ openViewForm, tableData, isLoading, columnVisibility, userPermission, dataShipper, setIsLoading, setModalErrorMsg, setModalErrorOpen }) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);

    useEffect(() => {
        if (tableData && tableData.length > 0) {

            setSortedData(tableData);
        } else {
            setSortedData(tableData || []);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const downloadFile = async (id: any, row?: any) => {
        try {
            setIsLoading?.(false);
            const response: any = await patchServiceDownload(
                `/master/balancing/balancing-monthly-report-download/${id}`,
                {},
                600000,
                'blob'
            );

            if(response?.status == 200 || response?.status == 201){
            // const file_name = `Allocation Monthly Report ${row?.monthText} (Rev.${row?.version?.split("V.")?.[1]})`
            // const file_name = `Allocation Monthly Report ${row?.monthText} (Rev.${row?.rev || "(Data Old Not Suport)"})`
            const file_name = row?.rev ? row?.file : `(Data Old Not Suport) Monthly Report ${row?.monthText} (Rev.${row?.rev || "(Data Old Not Suport)"})`
           
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // link.download = `balancing-monthly-report-${id}.xlsx`;
            link.download = `${file_name}.xlsx`;
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.remove();
            window.URL.revokeObjectURL(url);
            }
            else{
                throw new Error(`Download file failed. Please try again later.`);
            }
        } catch (error) {
            // Download failed
            setModalErrorMsg?.(error instanceof Error ? error.message : `Download file failed. Please try again later.`);
            setModalErrorOpen?.(true);
        }
        finally{
            setIsLoading?.(true);
        }
    };

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {/* <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap"> */}
            {
                isLoading ?
                    <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                            <tr className="h-9">

                                {columnVisibility?.month && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("monthText", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Month`}
                                        {getArrowIcon("monthText")}
                                    </th>
                                )}

                                {columnVisibility?.group && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("shipper_name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Shipper Name`}
                                        {getArrowIcon("shipper_name")}
                                    </th>
                                )}

                                {columnVisibility?.contract_code && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("contractCode", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Contract Code`}
                                        {getArrowIcon("contractCode")}
                                    </th>
                                )}

                                {columnVisibility?.file && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("file", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`File`}
                                        {getArrowIcon("file")}
                                    </th>
                                )}

                                {columnVisibility?.report_version && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-center`}
                                        onClick={() => handleSort("version", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Report Version`}
                                        {getArrowIcon("version")}
                                    </th>
                                )}

                                {columnVisibility?.type_report && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("typeReport", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Type Report`}
                                        {getArrowIcon("typeReport")}
                                    </th>
                                )}

                                {columnVisibility.approved_by && (
                                    <th scope="col"
                                        className={`${table_sort_header_style} text-left`}
                                        onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}
                                    >
                                        {`Approved by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                                {columnVisibility.download && (
                                    <th scope="col" className="px-2 py-1 text-center">
                                        {`Download`}
                                    </th>
                                )}

                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData.map((row: any, index: any) => {
                                const shipperName = row?.contractCode ? row?.group?.name : (dataShipper?.find((f:any) => f?.id_name === JSON.parse(row?.jsonData)?.typeReport)?.name || '')
                                return (
                                    <tr
                                        key={row?.id}
                                        // className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} h-12`}
                                        className={`${table_row_style}`}
                                    >

                                        {columnVisibility?.month && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.monthText ? row?.monthText : ''}</td>
                                        )}

                                        {columnVisibility?.group && (
                                            <td className="px-2 py-1 text-[#464255]">{shipperName}</td>
                                        )}

                                        {columnVisibility?.contract_code && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.contractCode ? row?.contractCode : ''}</td>
                                        )}

                                        {columnVisibility?.file && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                {row?.file ? <><InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} /> {row?.file}</> : ''}
                                            </td>
                                        )}

                                        {columnVisibility?.report_version && (
                                            <td className="px-2 py-1 text-[#464255] text-center">{row?.version ? row?.version : ''}</td>
                                        )}

                                        {columnVisibility?.type_report && (
                                            <td className="px-2 py-1 text-[#464255]">{row?.typeReport ? row?.typeReport : ''}</td>
                                        )}

                                        {columnVisibility.approved_by && (
                                            <td className="px-2 py-1 text-[#464255]">
                                                <div>
                                                    <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                    <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                                                </div>
                                            </td>
                                        )}

                                        {columnVisibility.download && (
                                            <td className="px-2 py-1 text-center justify-center">
                                                <div className="inline-flex items-center justify-center relative">

                                                    {/* ${!canDownload && "opacity-50 cursor-not-allowed"} */}
                                                    {/* <button
                                                    type="button"
                                                    className={`flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `}
                                                    onClick={() => downloadFile(row?.id, row?.file)}
                                                // disabled={!canDownload}
                                                >
                                                    <FileDownloadIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                </button> */}

                                                    <button
                                                        type="button"
                                                        className={iconButtonClass}
                                                        onClick={() => downloadFile(row?.id, row)}
                                                    >
                                                        <FileDownloadIcon
                                                            fontSize="inherit"
                                                            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                            sx={{ color: 'currentColor', fontSize: 18 }}
                                                        />
                                                    </button>
                                                </div>
                                            </td>
                                        )}

                                    </tr>
                                )
                            }

                            )}
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableDownload;