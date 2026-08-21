import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, formatDateNoTime, formatNumber } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from '@/utils/sortTable';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

type FormExampleProps = {
    data?: any;
    mainData?: any;
    file?: any;
    open: boolean;
    onClose: () => void;
};

interface RowData {
    id: number;
    entry_exit_id: number;
    temp_contract_point: string;
    temp_start_date: string;
    temp_end_date: string;
    total_contracted_mmbtu_d: string;
    total_release_mmbtu_d: string;
    [key: string]: any; // Optional, for additional fields
}

const ModalSubmissionDetails: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    file,
    mainData
}) => {
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(data);

    useEffect(() => {
        if (data && data.length > 0) {
            setSortedData(data);
        }else{
            setSortedData([]);
        }
    }, [data]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const groupedData = (sortedData?.release_capacity_submission_detail ?? []).reduce(
        (acc: any, row: any) => {
            const key = row.path_management_config_id;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(row);
            return acc;
        },
        {}
    );

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20 w-full">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-full">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Release Capacity Submission Detail`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                    <p>{`Submission Time`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Contract Code`}</p>
                                    <p>{`Requested Code`}</p>
                                </div>

                                <div className="grid grid-cols-4 text-sm font-light text-[#58585A]">
                                    <p>{data?.submission_time ? formatDate(data?.submission_time) : ''}</p>
                                    <p>{data?.group ? data?.group?.company_name : ''}</p>
                                    <p>{data?.contract_code ? data?.contract_code?.contract_code : ''}</p>
                                    <p>{data?.requested_code ? data?.requested_code : ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%] h-[350px] border border-[#DFE4EA] rounded-[10px] overflow-auto">
                            <div className="text-[#464255] font-light text-[14px] w-full">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                        <tr className="h-9">
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_point", sortState, setSortState, setSortedData, data)}>
                                                {`Point`}
                                                {getArrowIcon("contract_point")}
                                            </th>
                                            {/* <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, data)}>
                                                {`Entry / Exit`}
                                                {getArrowIcon("entry_exit_id")}
                                            </th> */}
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, data)}>
                                                {`Start Date`}
                                                {getArrowIcon("start_date")}
                                            </th>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, data)}>
                                                {`End Date`}
                                                {getArrowIcon("end_date")}
                                            </th>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contracted_mmbtu_d", sortState, setSortState, setSortedData, data)}>
                                                {`Contracted (MMBTU/D)`}
                                                {getArrowIcon("contracted_mmbtu_d")}
                                            </th>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contracted_mmscfd", sortState, setSortState, setSortedData, data)}>
                                                {`Contracted (MMSCFD)`}
                                                {getArrowIcon("contracted_mmscfd")}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}>
                                                {`Release (MMSCFD)`}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}>
                                                {`Release (MMBTU/D)`}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* entry_exit_id >>>> 1 = entry, 2 = exit */}
                                        {/* {sortedData?.release_capacity_submission_detail?.length > 0 &&
                                            sortedData?.release_capacity_submission_detail?.map((row: any, index: any) => (
                                                <>
                                                    {
                                                        row?.entry_exit_id == 1 ?
                                                            <tr key={`${index}-entry`} className={`${table_row_style}`}>
                                                                <td className="px-2 py-1 text-[#464255]">{row?.temp_contract_point}</td>
                                                                <td className={`px-2 py-1 ${row?.temp_start_date ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{row?.temp_start_date ? formatDateNoTime(row?.temp_start_date) : ''}</td>
                                                                <td className={`px-2 py-1 ${row?.temp_end_date ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{row?.temp_end_date ? formatDateNoTime(row?.temp_end_date) : ''}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_contracted_mmbtu_d && formatNumber(row?.total_contracted_mmbtu_d)}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_contracted_mmbtu_d && formatNumber(row?.total_contracted_mmbtu_d)}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_release_mmbtu_d ? row?.total_release_mmbtu_d : ''}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_release_mmbtu_d}</td>
                                                            </tr>
                                                            :
                                                            <tr key={`${index}-exit`} className={`${table_row_style}`}>
                                                                <td className="px-2 py-1 text-[#464255]">{row?.temp_contract_point}</td>
                                                                <td className={`px-2 py-1 ${row?.temp_start_date ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{row?.temp_start_date ? formatDateNoTime(row?.temp_start_date) : ''}</td>
                                                                <td className={`px-2 py-1 ${row?.temp_end_date ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{row?.temp_end_date ? formatDateNoTime(row?.temp_end_date) : ''}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_contracted_mmbtu_d && formatNumber(row?.total_contracted_mmbtu_d)}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_contracted_mmbtu_d && formatNumber(row?.total_contracted_mmbtu_d)}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_release_mmbtu_d ? row?.total_release_mmbtu_d : ''}</td>
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.total_release_mmbtu_d}</td>
                                                            </tr>
                                                    }

                                                    <tr key={`${row?.id}-total`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={6}>
                                                            {`Total`}
                                                        </td>
                                                        <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right`}>{"0.000"}</td>
                                                    </tr>
                                                </>
                                            ))} */}
                                        {Object.entries(groupedData).map(([pathId, rows]: any) => (
                                            <React.Fragment key={pathId}>
                                                {rows.map((row: any, index: any) => (
                                                    <tr key={`${index}-${row.entry_exit_id === 1 ? 'entry' : 'exit'}`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 text-[#464255]">{row.temp_contract_point}</td>
                                                        <td className={`px-2 py-1 ${row.temp_start_date ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>
                                                            {row.temp_start_date ? formatDateNoTime(row.temp_start_date) : ''}
                                                        </td>
                                                        <td className={`px-2 py-1 ${row.temp_end_date ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>
                                                            {row.temp_end_date ? formatDateNoTime(row.temp_end_date) : ''}
                                                        </td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">
                                                            {row.total_contracted_mmbtu_d && formatNumber(row.total_contracted_mmbtu_d)}
                                                        </td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">
                                                            {row.total_contracted_mmbtu_d && formatNumber(row.total_contracted_mmbtu_d)}
                                                        </td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">
                                                            {row.total_release_mmbtu_d ? row.total_release_mmbtu_d : ''}
                                                        </td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row.total_release_mmbtu_d}</td>
                                                    </tr>
                                                ))}
                                                {/* Total Row for This Path */}
                                                <tr key={`${pathId}-total`} className={`${table_row_style}`}>
                                                    <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={6}>
                                                        {/* {`Total for Path ${pathId}`} */}
                                                        {`Total`}
                                                    </td>
                                                    {/* <td className="px-2 py-1 font-semibold text-[#464255] text-right">
                                                        {rows.reduce((sum:any, row:any) => sum + parseFloat(row.total_release_mmbtu_d || "0"), 0).toFixed(3)}
                                                    </td> */}
                                                    <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right`}>{"0.000"}</td>
                                                </tr>
                                            </React.Fragment>
                                        ))}

                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="w-full flex justify-end pt-6">
                            <button
                                onClick={onClose}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalSubmissionDetails;