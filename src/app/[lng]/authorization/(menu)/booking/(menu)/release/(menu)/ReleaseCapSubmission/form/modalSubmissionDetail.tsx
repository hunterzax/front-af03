import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDateNoTime, formatNumberThreeDecimal, toDayjs } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_header_style, table_row_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { postService, uploadFileService } from '@/utils/postService';
import { addDays, parse } from 'date-fns';
import Spinloading from '@/components/other/spinLoading';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';


type FormExampleProps = {
    data?: any;
    mainData?: any;
    open: boolean;
    onClose: () => void;
    setModalErrorMsg?: any;
    setModalMsg?: any;
    setModalErrorOpen?: any;
    setModalSuccessOpen?: any;
    setMdSubmissionView?: any;
    setDataFileArr?: any;
};

const ModalSubmissionDetails: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    mainData,
    setModalErrorMsg,
    setModalMsg,
    setModalErrorOpen,
    setModalSuccessOpen,
    setMdSubmissionView,
    setDataFileArr
}) => {
    // const emails = data?.edit_email_group_for_event_match?.map((item: any) => item.email);

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(data?.data || []);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (data?.data && data.data.length > 0) {
            setSortedData(data.data);
        }
        setSortedData(data?.data || []);
    }, [data]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>();

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                // Invalid file type:'
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                // File size too large:
                return;
            }

            try {
                setIsLoading(true)
                const response: any = await uploadFileService('/files/uploadfile/', file);

                setFileUrl(response?.file?.url)
            } catch (error) {
                // File upload failed:
            }
            finally {
                setIsLoading(false)
            }

            setFileName(file.name);
            setFileUpload(file);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }
    };

    const handleSubmit = async () => {
        try {
            const flattenData = data?.data?.reduce((accumulator: any[], value: any) => accumulator.concat(value), []) || []

            let data_post: any = {
                ...data,
                url: fileUrl ? [fileUrl] : null
            }
            data_post.data = flattenData

            setIsLoading(true)
            const res_submit = await postService('/master/release-capacity-submission/submission', data_post)
            const statusCode = res_submit?.response?.data?.statusCode ?? res_submit?.response?.data?.status ?? res_submit?.status ?? res_submit?.statusCode ?? res_submit?.code ?? res_submit?.response?.status;
            const errorMsg = res_submit?.response?.data?.error ?? res_submit?.data?.error ?? res_submit?.response?.error ?? res_submit?.error;

            if (statusCode === 400 || statusCode === 500) {
                // setModalErrorMsg(res_submit?.response?.data?.error || "Something wrong");
                setModalErrorMsg(errorMsg || "Something wrong");
                setModalErrorOpen(true);
            } else {
                setMdSubmissionView(false);
                setModalMsg("Submission Success");
                setModalSuccessOpen(true);
                setDataFileArr([]);
            }
            setIsLoading(false)
        } catch (error) {
            setModalErrorMsg("Something wrong");
            setModalErrorOpen(true);
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20 w-full">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <Spinloading spin={isLoading} rounded={20} />
                    <div className="flex flex-col items-center gap-2 p-9 w-full">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Submit`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-3 text-sm font-semibold text-[#58585A]">
                                    <p>{`Contract Code`}</p>
                                    {/* <p>{`Shipper Name`}</p>
                                    <p>{`Submitted Timestamp`}</p> */}
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                                    <p>{mainData?.contract_code || '-'}</p>
                                    {/* <p>{data?.group?.name || '-'}</p>
                                    <p>{formatDate(data?.submitted_timestamp) || '-'}</p> */}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%] h-[350px] border border-[#DFE4EA] rounded-[10px] overflow-auto">
                            <div className="text-[#464255] font-light text-[14px] w-full">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                        <tr className="h-9">
                                            <th scope="col" className={`${table_header_style}`}
                                            // onClick={() => handleSort("temp_contract_point", sortState, setSortState, setSortedData, data?.data || [])}
                                            >
                                                {`Point`}
                                                {/* {getArrowIcon("temp_contract_point")} */}
                                            </th>
                                            {/* <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, data)}>
                                                {`Entry / Exit`}
                                                {getArrowIcon("entry_exit_id")}
                                            </th> */}
                                            <th scope="col" className={`${table_header_style}`}
                                            // onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, data?.data || [])}
                                            >
                                                {`Start Date`}
                                                {/* {getArrowIcon("start_date")} */}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}
                                            // onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, data?.data || [])}
                                            >
                                                {`End Date`}
                                                {/* {getArrowIcon("end_date")} */}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}
                                            // onClick={() => handleSort("contracted_mmbtu_d", sortState, setSortState, setSortedData, data?.data || [])}
                                            >
                                                {`Contracted (MMBTU/D)`}
                                                {/* {getArrowIcon("contracted_mmbtu_d")} */}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}
                                            // onClick={() => handleSort("contracted_mmscfd", sortState, setSortState, setSortedData, data?.data || [])}
                                            >
                                                {`Contracted (MMSCFD)`}
                                                {/* {getArrowIcon("contracted_mmscfd")} */}
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
                                        {sortedData && sortedData.length > 0 &&
                                            sortedData?.map((row: any, index: any) => {
                                                const subRow = row?.map((subRow: any, subRowIndex: any) => {
                                                    const name = (subRow?.entry_exit?.name?.toLowerCase()) || (subRowIndex == 0 ? 'entry' : 'exit')
                                                    return <tr key={`${index}-${name}`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 text-[#464255]">{subRow?.temp_contract_point || ''}</td>
                                                        <td className={`px-2 py-1 ${subRow?.temp_start_date ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{subRow?.temp_start_date || ''}</td>

                                                        <td className={`px-2 py-1 ${subRow?.temp_end_date ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{subRow?.temp_end_date ? formatDateNoTime(addDays(parse(subRow?.temp_end_date, 'dd/MM/yyyy', new Date()), 1).toISOString()) : ''}</td>
                                                        {/* <td className={`px-2 py-1 ${subRow?.temp_end_date ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{subRow?.temp_end_date ? formatDateNoTime(toDayjs(subRow?.temp_end_date, 'DD/MM/YYYY').add(1, 'day').toISOString()) : ''}</td> */}

                                                        <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_contracted_mmbtu_d && formatNumberThreeDecimal(subRow.total_contracted_mmbtu_d)}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_contracted_mmscfd && formatNumberThreeDecimal(subRow.total_contracted_mmscfd)}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_release_mmscfd ? formatNumberThreeDecimal(subRow.total_release_mmscfd) : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{subRow?.total_release_mmbtu_d && formatNumberThreeDecimal(subRow.total_release_mmbtu_d)}</td>
                                                    </tr>
                                                }) || (<></>)

                                                return (<React.Fragment key={`line_${index}`}>
                                                    {/* ENTRY & EXIT */}
                                                    {subRow}

                                                    {/* TOTAL */}

                                                    <tr key={`${row?.id}-total`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={6}>
                                                            {`Total`}
                                                        </td>
                                                        <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right`}>{"0.000"}</td>
                                                    </tr>
                                                </React.Fragment>
                                                )
                                            }
                                            )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex w-full">
                            <div className='w-full'>
                                {/* "Choose File" button */}
                                <label
                                    className="block mb-2 text-sm font-light pb-1 text-[#58585A]"
                                >
                                    {`File (Optional)`}
                                </label>

                                <div className="flex items-center">
                                    <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[15%] !h-[40px] px-5 py-2 cursor-pointer `}> {/* ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} */}
                                        {`Choose File`}
                                        <input
                                            id="url"
                                            type="file"
                                            className="hidden"
                                            accept=".xls, .xlsx"
                                            // readOnly={isReadOnly}
                                            // disabled={isReadOnly}
                                            onChange={handleFileChange}
                                        />
                                    </label>

                                    {/* Filename display */}
                                    {/* <div className={`bg-white text-[#9CA3AF] text-sm w-[30%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden `}> 
                                        {fileName}
                                    </div> */}

                                    {/* <div className="bg-white text-[#9CA3AF] text-sm w-[40%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                        <span className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</span>
                                        {fileName !== "Maximum File 10 MB" && (
                                            <CloseOutlinedIcon
                                                onClick={handleRemoveFile}
                                                className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                sx={{ color: '#323232', fontSize: 18 }}
                                                style={{ fontSize: 18 }}
                                            />
                                        )}
                                    </div> */}

                                    <div className="bg-white text-[#9CA3AF] text-sm w-[40%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                        <span className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'}`}>
                                            {fileName}
                                        </span>
                                        {fileName !== "Maximum File 10 MB" && (
                                            <CloseOutlinedIcon
                                                onClick={handleRemoveFile}
                                                className="cursor-pointer text-[#9CA3AF] z-10 ml-auto"
                                                sx={{ color: '#323232', fontSize: 18 }}
                                            />
                                        )}
                                    </div>

                                </div>

                                {/* <div className="flex items-center col-span-2 pt-3">
                                    <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[46px] px-2 cursor-pointer`}>
                                        {`Choose File`}
                                        <input
                                            id="url"
                                            type="file"
                                            className="hidden"
                                            {...register('upload_tranform')}
                                            accept=".xls, .xlsx"
                                            onChange={(e: any) => {
                                                handleFileChange(e)
                                            }}
                                        />
                                    </label>

                                    <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[46px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                        <span className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</span>
                                        {fileName !== "Maximum File 10 MB" && (
                                            <CloseOutlinedIcon
                                                onClick={handleRemoveFile}
                                                className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                sx={{ color: '#323232', fontSize: 18 }}
                                                style={{ fontSize: 18 }}
                                            />
                                        )}
                                    </div>
                                </div> */}


                            </div>
                            {/* "Upload" button */}
                            {/* <label className={`
                                ${fileName === "Maximum File 10 MB" ? 'bg-[#E5E7EB] !text-[#9CA3AF] pointer-events-none' : 'hover:bg-[#2c6582]'}
                                w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] `}> 
                                {`Upload`}
                                <input
                                    type="button"
                                    className="hidden"
                                    // accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    // disabled={isReadOnly}
                                    onClick={handleClickUpload}
                                />
                            </label> */}
                        </div>
                        <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span>

                        <div className="w-full flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                            >
                                {`Cancel`}
                            </button>

                            <button
                                // type="submit"
                                type="button"
                                onClick={handleSubmit}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                            >
                                {`Submit`}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalSubmissionDetails;