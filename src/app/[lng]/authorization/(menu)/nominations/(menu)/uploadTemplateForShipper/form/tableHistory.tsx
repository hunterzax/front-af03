import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDateTimeSec, iconButtonClass } from '@/utils/generalFormatter';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import ModalComment from "./modalComment";
import ModalFiles from "./modalFiles";

interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableNomUploadTemplateForShipperHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     } else {
    //         setSortedData([]);
    //     }
    // }, [tableData]);

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const normalized = fillMissingUpdateByAccount(tableData);
            setSortedData(normalized);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAllFileModal = (idx?: any, data?: any) => {
        const filtered = sortedData?.find((item: any, index: any) => index === idx);
        setDataFile(filtered)
        setMdFileView(true)
    };

    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {
        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

    return (<>
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.document_type && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("nomination_type.document_type", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Document Type`}
                                {getArrowIcon("nomination_type.document_type")}
                            </th>
                        )}

                        {columnVisibility.file && (
                            <th scope="col" className={`${table_header_style} text-center`} >
                                {`File`}
                            </th>
                        )}

                        {columnVisibility.comment && (
                            <th scope="col" className={`${table_header_style} text-center`}>
                                {`Comment`}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated by`}
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
                            {columnVisibility.document_type && (
                                <td className="pl-2 py-1 text-center">
                                    {row?.nomination_type && (
                                        <div
                                            className="flex w-[140px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]"
                                            style={{ backgroundColor: row?.nomination_type?.color }}
                                        >
                                            {`${row?.nomination_type?.document_type ? row?.nomination_type?.document_type : row?.nomination_type?.name}`}
                                        </div>
                                    )}
                                </td>
                            )}

                            {columnVisibility.file && (
                                <td className="px-2 py-1 text-center">
                                    <div className="inline-flex items-center justify-center relative">
                                        <button
                                            type="button"
                                            aria-label="Open files"
                                            onClick={() => openAllFileModal(index)}
                                            className={iconButtonClass}
                                            // disabled={row?.file_capacity_request_management.length <= 0 && true}
                                            // disabled={!userPermission?.f_view || row?.upload_template_for_shipper_file.length <= 0}
                                        >
                                            <AttachFileRoundedIcon
                                                fontSize="inherit"
                                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                sx={{ color: 'currentColor', fontSize: 18 }}
                                            />
                                        </button>
                                        <span className="px-2 text-[#464255]">
                                            {/* {row?.upload_template_for_shipper_file.length} */}
                                            {/* History : File แสดง 1 เสมอไม่ต้อง Count https://app.clickup.com/t/86etzch6b */}
                                            {`1`}
                                        </span>
                                    </div>
                                </td>
                            )}

                            {columnVisibility.comment && (
                                <td className="px-2 py-1 text-center">
                                    <div className="inline-flex items-center justify-center relative">
                                        <button
                                            type="button"
                                            className={iconButtonClass}
                                            onClick={() => openReasonModal(row?.id, row?.upload_template_for_shipper_comment, row)}
                                        >
                                            <ChatBubbleOutlineOutlinedIcon
                                                fontSize="inherit"
                                                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                                sx={{ color: 'currentColor', fontSize: 18 }}
                                            />
                                        </button>

                                        <span className="px-2 text-[#464255]">
                                            {row?.upload_template_for_shipper_comment?.length}
                                        </span>
                                    </div>
                                </td>
                            )}

                            {columnVisibility.updated_by && (
                                <td className="px-2 py-1 text-[#464255]">
                                    <div>
                                        <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                    </div>
                                </td>
                            )}

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <ModalComment
            data={dataReason}
            dataRow={dataReasonRow}
            open={mdReasonView}
            onClose={() => {
                setMdReasonView(false);
            }}
        />

        <ModalFiles
            data={dataFile}
            // dataGroup={dataGroup}
            // setModalMsg={setModalMsg}
            // setModalSuccessOpen={setModalSuccessOpen}
            // setModalSuccessMsg={setModalSuccessMsg}
            open={mdFileView}
            onClose={() => {
                setMdFileView(false);
            }}
        />
    </>
    )
}

export default TableNomUploadTemplateForShipperHistory;