import { useEffect, useRef, useState } from "react";
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import Spinloading from "@/components/other/spinLoading";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort } from "@/utils/sortTable";
import { formatDate, pad4, toDayjs } from "@/utils/generalFormatter";
import NodataTable from "@/components/other/nodataTable";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { getService, getServiceArrayBuffer } from "@/utils/postService";
import dayjs from 'dayjs';
import 'react-toastify/dist/ReactToastify.css';
import Tooltip from '@mui/material/Tooltip';
import Zoom from "@mui/material/Zoom";

interface TableProps {
    tableData: any;
    isLoading?: boolean;
    setisLoading?: any;
    columnVisibility?: any;
    initialColumns?: any;
    openViewForm: (id: any) => void;
    selectedKey: any;
    userPermission?: any;
    userDT?: any;
    handleFormSubmit?: any;
    setWhichDocumentOpen?: any; // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
    setModeOpenDocument?: any; // mode -> 'view', 'edit'
    setIsOpenDocument?: any;  // set เปิด-ปิด
    setDataOpenDocument?: any; // ข้อมูลของ doc ตอนเปิด view, edit
    updateMainStat?: any; // ฟังก์ชั่นอัพเดท stat ของ row หลัก ที่เป็น close หรือ open
    setIsOpenHistory?: any;  // set เปิด-ปิด history
    setdataHistory?: any
    setmodePage?: any
    setrowselected?: any
}

const class_btn_ = `flex items-center justify-center px-[2px] py-[2px] border border-[#EAECF0] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative `

const TableOffspecGas: React.FC<TableProps> = ({
    tableData,
    isLoading = false,
    setisLoading,
    openViewForm,
    columnVisibility,
    initialColumns,
    selectedKey,
    userPermission,
    userDT,
    handleFormSubmit,
    setWhichDocumentOpen,
    setModeOpenDocument,
    setIsOpenDocument,
    setDataOpenDocument,
    updateMainStat,
    setIsOpenHistory,
    setdataHistory,
    setmodePage,
    setrowselected
}) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const isShipper = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4);

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

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
                // openViewForm(id);
                // setOpenPopoverId(null);
                break;
            case "edit":
                let data_ = {
                    "id": id,
                    "event_status_id": 2 // 1 Open, 2 Closed
                }
                setDataSubmit(data_)
                setTimeout(() => {
                    {/* Confirm Save */ }
                    setModaConfirmSave(true)
                }, 300);
                // updateMainStat(id, 2)  // 1 Open, 2 Closed
                break;
        }
    }


    // ############### OPEN DOCUMENT ###############
    const getDataDocument = async (id: String, doc_no: any) => {
        try {
            const res_document_data = await getService(`/master/event/offspec-gas/doc${doc_no}/${id}`)
            return res_document_data
        } catch (error) {
            // error fetch doc 2
        }
    }

    const openDocument = async (document: String, mode?: String, data?: any) => {
      
        // data?.event_status_id === 1
        setWhichDocumentOpen(document)
        setModeOpenDocument(mode)
        setmodePage(mode)

        if (document == 'document_1') {
            setDataOpenDocument(data)
        } else if (document == 'document_2') {
            const data_doc_2 = await getDataDocument(data.id, 2)
            setDataOpenDocument(data_doc_2)
        } else if (document == 'document_3') {
            const data_doc_3 = await getDataDocument(data.id, 3)
            setDataOpenDocument(data_doc_3)
        }

        setIsOpenDocument(true)
    }

    // #region history
    // ############### OPEN DOCUMENT HISTORY ###############
    const getDataDocumentHistory = async (id: String, doc_no: any) => {
        try {
            // master/event/offspec-gas/doc1/history/13
            let url = `/master/event/offspec-gas/doc${doc_no}/history/${id}`
            if ((doc_no == 2 || doc_no == 3) && !isShipper) {
                url += '?tso=true'
            }

            // const res_document_data_history = await getService(`/master/event/offspec-gas/doc${doc_no}/history/${id}`)
            const res_document_data_history = await getService(`${url}`)
            return res_document_data_history
        } catch (error) {
            // error fetch doc 2
        }
    }

    const openDocumentHistory = async (document: String, mode?: String, data?: any) => {

        setrowselected(data)

        setWhichDocumentOpen(document)
        setModeOpenDocument(mode)
        setmodePage(mode)

        if (document == 'document_1') {
            const data_doc_1 = await getDataDocumentHistory(data?.document1?.id, 1)
            setDataOpenDocument(data_doc_1)
            setdataHistory(data_doc_1);
        } else if (document == 'document_2') {
            const data_doc_2 = await getDataDocumentHistory(data.id, 2)
            setDataOpenDocument(data_doc_2)
            setdataHistory(data_doc_2);
        } else if (document == 'document_3') {
            const data_doc_3 = await getDataDocumentHistory(data.id, 3)
            setDataOpenDocument(data_doc_3)
            setdataHistory(data_doc_3);
        }

        setIsOpenHistory(true)
    }

    const isShowDoc3Action = (row: any) => {
        // มันทำงานได้ใช้ไปก่อน
        if(row?.document3 && (row?.document3?.event_doc_status_id === 1 && (row?.document3?.user_type_id === 2 || row?.document3?.user_type_id === 1))){
            return true
        }else if(row?.document3 && (row?.document3?.[0]?.event_doc_status_id === 1 && (row?.document3?.user_type_id === 3 || row?.document3?.user_type_id === 4)) ){
            return true
        }else if((row?.document3?.event_doc_status_id === 2 || row?.document3?.event_doc_status_id === 3 || row?.document3?.event_doc_status_id === 4 || row?.document3?.event_doc_status_id === 5)) {
            return true
        }else{
            if(!isShipper && row?.document3?.find((f:any) => f?.user_type_id === userDT?.account_manage?.[0]?.user_type_id && f?.event_doc_status_id === 1)){
                return true
            }else if(isShipper && (row?.document3?.create_by_account?.account_manage?.[0]?.user_type_id === 3 || row?.document3?.create_by_account?.account_manage?.[0]?.user_type_id === 4)){
                return true
            }else if(!isShipper && row?.document3?.find((f:any) => f?.event_doc_status_id !== 1)){
                return true
            }
        }
        return false
    }

    // ############### DOWNLOAD PDF ###############
    const handleDownloadPDF = async (doc_no: any, document_id: any) => {

        try {
            const res_pdf = await getServiceArrayBuffer(`/master/event/offspec-gas/${doc_no}/pdf/${document_id}`);
            const buffer = new Uint8Array(res_pdf.data);
            let fileExtension = 'bin'; // fallback
            let mimeType = 'application/octet-stream';

            // ถ้ามี content-type
            const contentType = res_pdf.headers?.['content-type'];
            if (contentType === 'application/pdf') {
                fileExtension = 'pdf';
                mimeType = 'application/pdf';
            } else if (contentType === 'application/zip' || contentType === 'application/x-zip-compressed') {
                fileExtension = 'zip';
                mimeType = 'application/zip';
            } else {
                // ใช้ magic number เดา
                if (buffer[0] === 0x25 && buffer[1] === 0x50) {
                    // %PDF
                    fileExtension = 'pdf';
                    mimeType = 'application/pdf';
                } else if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
                    // PK = ZIP
                    fileExtension = 'zip';
                    mimeType = 'application/zip';
                }
            }

            const blob = new Blob([buffer], { type: mimeType });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            // a.download = `document_${document_id}.${fileExtension}`;
            // a.download = `document_${doc_no}.${fileExtension}`;
            a.download = `${dayjs().format("YYYY")}_OSG_${pad4(document_id)}.${fileExtension}`;

            document.body.appendChild(a);
            a.click();
            a.remove();

            URL.revokeObjectURL(url);
        } catch (err) {
            // Download error
        }
    };

    const renderSectionBorder = (key: string, section?: 'section1' | 'section2', parentID?: string) => {
        // เคสพิเศษ: ถ้า key คือ 'zone'
        if (section == 'section1') {

            if (key === 'zone_text') {
                if (columnVisibility[key]) {
                    return { borderRight: '1px solid #eeeeee' };
                }
                return { border: 'none' };
            }

            const zoneIndex = initialColumns.findIndex((col: any) => col.key === 'zone_text');
            if (zoneIndex === -1 || columnVisibility['zone_text']) {
                return { border: 'none' };
            }

            // หา column แรก (ก่อนหน้า zone_text) ที่เปิดอยู่
            for (let i = zoneIndex - 1; i >= 0; i--) {
                const currentKey = initialColumns[i]?.key;
                if (columnVisibility[currentKey]) {
                    // เจอ column ที่เปิด → ถ้า key นี้คือ key ที่ถูกส่งเข้ามา → return border
                    if (currentKey === key) {
                        return { borderRight: '1px solid #eeeeee' };
                    } else {
                        // ตัวอื่นที่ไม่ใช่ตัวแรกที่เปิดอยู่ → ไม่ต้องมี border
                        return { border: 'none' };
                    }
                }
            }


            if (key === 'event_date') {
                if (columnVisibility[key]) {
                    return { borderRight: '1px solid #eeeeee' };
                }
                return { border: 'none' };
            }

            const colIndex = initialColumns.findIndex((col: any) => col.key === 'event_date');
            if (colIndex === -1 || columnVisibility['event_date']) {
                return { border: 'none' };
            }

            // หา column แรก (ก่อนหน้า zone) ที่เปิดอยู่
            for (let i = colIndex - 1; i >= 0; i--) {
                const currentKey = initialColumns[i]?.key;
                if (columnVisibility[currentKey]) {
                    // เจอ column ที่เปิด → ถ้า key นี้คือ key ที่ถูกส่งเข้ามา → return border
                    if (currentKey === key) {
                        return { borderRight: '1px solid #eeeeee' };
                    } else {
                        // ตัวอื่นที่ไม่ใช่ตัวแรกที่เปิดอยู่ → ไม่ต้องมี border
                        return { border: 'none' };
                    }
                }
            }
        } else if (section == 'section2') {
            // master
            if (!parentID) {
                let findMaster = initialColumns?.find((item: any) => item?.key == key)
                if (columnVisibility[findMaster?.key]) {
                    return { borderRight: '1px solid #eeeeee' };
                }
                return { border: 'none' };
            }

            // 2. ถ้ามี parentID → เป็น child column ของ master
            const parentList = initialColumns.filter(
                (col: any) => col.parent_id === parentID
            );

            // วนถอยหลังจากตัวท้ายสุด
            for (let i = parentList.length - 1; i >= 0; i--) {
                const currentKey = parentList[i]?.key;
                if (columnVisibility[currentKey]) {
                    return currentKey === key
                        ? { borderRight: '1px solid #eeeeee' }
                        : { border: 'none' };
                }
            }

            // ถ้าไม่มีตัวไหนเปิดอยู่เลย
            return { border: 'none' };
        }

        return { border: 'none' }; // ไม่มี column ไหนเปิดอยู่เลย
    };

    return (
        <>
            <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
                <Spinloading spin={isLoading} rounded={0} />
                {!isLoading ?
                    <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">

                            <tr className="h-9">
                                {columnVisibility?.event_code && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} `}
                                        rowSpan={2}
                                        onClick={() => handleSort("event_nember", sortState, setSortState, setSortedData, tableData)}
                                        style={renderSectionBorder('event_code', 'section1')}
                                    >
                                        {`Event Code`}
                                        {getArrowIcon("event_nember")}
                                    </th>
                                )}

                                {columnVisibility?.event_date && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style}`}
                                        rowSpan={2}
                                        onClick={() => handleSort("event_date", sortState, setSortState, setSortedData, tableData)}
                                        style={renderSectionBorder('event_date', 'section1')}
                                    >
                                        {`Event Date`}
                                        {getArrowIcon("event_date")}
                                    </th>
                                )}

                                {columnVisibility?.zone_text && (
                                    <th
                                        scope="col"
                                        className={`${table_sort_header_style} text-center duration-200 ease-in-out`}
                                        rowSpan={2}
                                        onClick={() => handleSort("zone_text", sortState, setSortState, setSortedData, tableData)}
                                        style={renderSectionBorder('zone_text', 'section1')}
                                    >
                                        {`Zone`}
                                        {getArrowIcon("zone_text")}
                                    </th>
                                )}
                                

                                {columnVisibility?.document_1 && (
                                    <th
                                        scope="col"
                                        className={`${table_header_style} text-center`}
                                        colSpan={getVisibleChildCount("document_1")}
                                        style={renderSectionBorder('document_1', 'section2')}
                                    >
                                        {`Document 1`}
                                    </th>
                                )}

                                {columnVisibility?.document_2 && (
                                    <th
                                        scope="col"
                                        className={`${table_header_style} text-center`}
                                        colSpan={getVisibleChildCount("document_2")}
                                        style={renderSectionBorder('document_2', 'section2')}
                                    >
                                        {`Document 2`}
                                    </th>
                                )}

                                {columnVisibility?.document_3 && (
                                    <th
                                        scope="col"
                                        className={`${table_header_style} text-center`}
                                        colSpan={getVisibleChildCount("document_3")}
                                        style={renderSectionBorder('document_3', 'section2')}
                                    >
                                        {`Document 3`}
                                    </th>
                                )}

                                {!isShipper && columnVisibility?.created_by && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} rowSpan={2} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Created by`}
                                        {getArrowIcon("create_by_account.first_name")}
                                    </th>
                                )}

                                {columnVisibility?.event_status && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} rowSpan={2} onClick={() => handleSort("event_status_id", sortState, setSortState, setSortedData, tableData)}>
                                        {`Event Status`}
                                        {getArrowIcon("event_status_id")}
                                    </th>
                                )}

                                {/* SHIPPER ไม่เห็น column action */}
                                {/* กันบอกให้จับจากสิทธิไม่ใช่ user_type */}
                                {/* {columnVisibility.action && userPermission?.f_approve && ( */}
                                {columnVisibility.action && !isShipper && (
                                    <th scope="col" className={`${table_header_style} text-center`} rowSpan={2}>
                                        {`Action`}
                                    </th>
                                )}
                            </tr>

                            <tr className="h-9 !bg-[#00ADEF]">

                                {columnVisibility?.document_1 && (<>
                                    {columnVisibility?.info_document_1 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('info_document_1', 'section2', 'document_1')}
                                        >
                                            {`Info`}
                                        </th>
                                    )}

                                    {columnVisibility?.status_document_1 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('status_document_1', 'section2', 'document_1')}
                                        >
                                            {`Status`}
                                        </th>
                                    )}
                                </>
                                )}

                                {columnVisibility?.document_2 && (<>
                                    {columnVisibility?.info_document_2 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('info_document_2', 'section2', 'document_2')}
                                        >
                                            {`Info`}
                                        </th>
                                    )}

                                    {columnVisibility?.status_document_2 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('status_document_2', 'section2', 'document_2')}
                                        >
                                            {`Status`}
                                        </th>
                                    )}

                                    {columnVisibility?.shipper_document_2 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('shipper_document_2', 'section2', 'document_2')}
                                        >
                                            {`Shipper`}
                                        </th>
                                    )}
                                </>
                                )}

                                {columnVisibility?.document_3 && (<>
                                    {columnVisibility?.info_document_3 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('info_document_3', 'section2', 'document_3')}
                                        >
                                            {`Info`}
                                        </th>
                                    )}

                                    {columnVisibility?.status_document_3 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('status_document_3', 'section2', 'document_3')}
                                        >
                                            {`Status`}
                                        </th>
                                    )}

                                    {columnVisibility?.shipper_document_3 && (
                                        <th
                                            scope="col"
                                            className={`${table_header_style} text-center`}
                                            style={renderSectionBorder('shipper_document_3', 'section2', 'document_3')}
                                        >
                                            {`Shipper`}
                                        </th>
                                    )}
                                </>
                                )}
                            </tr>

                        </thead>
                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => {
                                
                                return (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility?.event_code && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] min-w-[120px] `}
                                            style={renderSectionBorder('event_code', 'section1')}
                                        >
                                            {row?.event_nember}
                                        </td>
                                    )}

                                    {columnVisibility?.event_date && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] min-w-[120px] `}
                                            style={renderSectionBorder('event_date', 'section1')}
                                        >
                                            {row?.event_date ? toDayjs(row?.event_date).format("DD/MM/YYYY") : ''}
                                        </td>
                                    )}


                                    {columnVisibility?.zone_text && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] min-w-[120px] text-center`}
                                            style={renderSectionBorder('zone_text', 'section1')}
                                        >
                                            {
                                                row?.zone_text || ''
                                            }
                                        </td>
                                    )}


                                    {/* ======================== DOCUMENT 1 ======================== */}
                                    {/* UNDER DOC 1 */}
                                    {columnVisibility?.info_document_1 && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('info_document_1', 'section2', 'document_1')}
                                        >

                                            {
                                                
                                                row?.document1 &&
                                                <div className="flex gap-2 items-center text-center justify-center">
                                                    {
                                                        isShipper && row?.document1?.event_doc_status_id === 1 ?
                                                        <>
                                                            <Tooltip
                                                                title="Edit"
                                                                placement="top"
                                                                arrow
                                                                slots={{
                                                                    transition: Zoom,
                                                                }}
                                                                slotProps={{
                                                                    transition: { timeout: 300 },
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    disabled={!userPermission?.f_edit}
                                                                    className={`${class_btn_} ${!userPermission?.f_edit ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                    onClick={() => openDocument('document_1', 'edit', row)}
                                                                >
                                                                    <EditOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                </button>
                                                            </Tooltip>
                                                        </>
                                                        : !isShipper && row?.document1?.event_doc_status_id === 1 ? <></>
                                                        : (!isShipper && row?.document1?.event_doc_status_id === 2) ? 
                                                        <>
                                                            <Tooltip
                                                                title="Edit"
                                                                placement="top"
                                                                arrow
                                                                slots={{
                                                                    transition: Zoom,
                                                                }}
                                                                slotProps={{
                                                                    transition: { timeout: 300 },
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    disabled={!userPermission?.f_edit}
                                                                    className={`${class_btn_} ${!userPermission?.f_edit ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                    onClick={() => openDocument('document_1', 'edit', row)}
                                                                >
                                                                    <EditOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                </button>
                                                            </Tooltip>
                                                        </>
                                                        : <>
                                                            <Tooltip
                                                                title="View"
                                                                placement="top"
                                                                arrow
                                                                slots={{
                                                                    transition: Zoom,
                                                                }}
                                                                slotProps={{
                                                                    transition: { timeout: 300 },
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    disabled={!userPermission?.f_view}
                                                                    className={`${class_btn_} ${!userPermission?.f_view ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                    onClick={() => openDocument('document_1', 'view', row)}
                                                                >
                                                                    <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                </button>
                                                            </Tooltip>
                                                        </>
                                                    }
                                                    {
                                                        !isShipper && row?.document1?.event_doc_status_id === 1 ? <></>
                                                        :  <Tooltip
                                                            title="Download"
                                                            placement="top"
                                                            arrow
                                                            slots={{
                                                                transition: Zoom,
                                                            }}
                                                            slotProps={{
                                                                transition: { timeout: 300 },
                                                            }}
                                                        >
                                                            <button type="button" className={class_btn_} disabled={false}
                                                                onClick={() => handleDownloadPDF('doc1', row?.document1?.id)}
                                                            >
                                                                <FileDownloadIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                            </button>
                                                        </Tooltip>
                                                    }


                                                    {
                                                        !isShipper && row?.document1?.event_doc_status_id === 1 ? <></>
                                                        : <Tooltip
                                                            title="History"
                                                            placement="top"
                                                            arrow
                                                            slots={{
                                                                transition: Zoom,
                                                            }}
                                                            slotProps={{
                                                                transition: { timeout: 300 },
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                // className={class_btn_} 
                                                                // disabled={false}
                                                                disabled={!userPermission?.f_view}
                                                                className={`${class_btn_} ${!userPermission?.f_view ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                // onClick={() => underDevelopment()}
                                                                onClick={() => openDocumentHistory('document_1', 'history', row)}
                                                            >
                                                                <HistoryOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                            </button>
                                                        </Tooltip>
                                                    }
                                                </div>
                                            }
                                        </td>
                                    )}

                                    {/* UNDER DOC 1 */}
                                    {columnVisibility?.status_document_1 && (
                                        // status ของเอกสารจะแสดงแค่ Accepted (id 3), Rejected (id 4), Acknowledge (id 5) เท่านั้น
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('status_document_1', 'section2', 'document_1')}
                                        >
                                            {
                                                row?.document1 &&
                                                ((isShipper && row?.document1?.event_doc_status_id === 1) || row?.document1?.event_doc_status_id === 3 || row?.document1?.event_doc_status_id === 4 || row?.document1?.event_doc_status_id === 5) ? (
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document1?.event_doc_status?.color }}>
                                                        {row?.document1?.event_doc_status?.name ?? ''}
                                                    </div>
                                                )
                                                :
                                                ((!isShipper && row?.document1?.event_doc_status_id === 1) &&
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document1?.event_doc_status?.color }}>
                                                        {(row?.document1?.group?.name && row.document1.group.name.length < 5) ? `${row?.document1?.group?.name} ` : ''}{row?.document1?.event_doc_status?.name ?? ''}
                                                    </div>
                                                )
                                            }
                                        </td>
                                    )}







                                    {/* ======================== DOCUMENT 2 ======================== */}
                                    {/* UNDER DOC 2 */}
                                    {columnVisibility?.info_document_2 && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('info_document_2', 'section2', 'document_2')}
                                        >
                                            { !(isShipper && row?.document2?.event_doc_status_id === 1) && (() => {
                                                const isTSO = !isShipper;
                                                const eventStatus = row?.event_status_id; // stat ของ main row (open, close)
                                                const docStatus = row?.document2?.event_doc_status_id;
                                                const hasDocument2 = Array.isArray(row?.document2) ? row.document2.length > 0 : !!row?.document2;
                                                const canShipperView = [3, 4, 5].includes(docStatus); // Accepted / Rejected / Cancelled 

                                                const shouldShowViewButton = eventStatus === 2 || (isShipper && canShipperView);
                                                const shouldShowEditButton = (isShipper && !canShipperView) || (isTSO && hasDocument2);

                                                const commonButtons = (
                                                    <>
                                                        <Tooltip
                                                            title="Download"
                                                            placement="top"
                                                            arrow
                                                            slots={{
                                                                transition: Zoom,
                                                            }}
                                                            slotProps={{
                                                                transition: { timeout: 300 },
                                                            }}
                                                        >
                                                            <button type="button" className={class_btn_} disabled={false}
                                                                // onClick={() => handleDownloadPDF('doc2', row?.document2?.[0]?.id)}
                                                                // onClick={() => handleDownloadPDF('doc2', row?.document2TSOID)}
                                                                onClick={() => handleDownloadPDF('doc2', !isShipper ? row?.document2TSOID : row?.document2?.id)}
                                                            >
                                                                <FileDownloadIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                            </button>
                                                        </Tooltip>

                                                        {
                                                            !isShipper &&
                                                            <Tooltip
                                                                title="History"
                                                                placement="top"
                                                                arrow
                                                                slots={{
                                                                    transition: Zoom,
                                                                }}
                                                                slotProps={{
                                                                    transition: { timeout: 300 },
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    // className={class_btn_} 
                                                                    // disabled={false}
                                                                    disabled={!userPermission?.f_view}
                                                                    className={`${class_btn_} ${!userPermission?.f_view ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                    // onClick={() => underDevelopment()}
                                                                    onClick={() => openDocumentHistory('document_2', 'history', row)}
                                                                >
                                                                    <HistoryOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                </button>
                                                            </Tooltip>
                                                        }
                                                    </>
                                                );

                                                if (!hasDocument2) return null; // ถ้าไม่มี document2 ไม่โชว์ปุ่มนะ

                                                if (shouldShowViewButton) {
                                                    return (
                                                        <div className="flex gap-2 items-center text-center justify-center">
                                                            <Tooltip
                                                                title="View"
                                                                placement="top"
                                                                arrow
                                                                slots={{
                                                                    transition: Zoom,
                                                                }}
                                                                slotProps={{
                                                                    transition: { timeout: 300 },
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    // className={class_btn_}
                                                                    disabled={!userPermission?.f_view}
                                                                    className={`${class_btn_} ${!userPermission?.f_view ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                    onClick={() => openDocument('document_2', 'view', row)}
                                                                >
                                                                    <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                </button>
                                                            </Tooltip>
                                                            {commonButtons}
                                                        </div>
                                                    );
                                                }

                                                if (shouldShowEditButton) {
                                                    return (
                                                        <div className="flex gap-2 items-center text-center justify-center">
                                                            <Tooltip
                                                                title="Edit"
                                                                placement="top"
                                                                arrow
                                                                slots={{
                                                                    transition: Zoom,
                                                                }}
                                                                slotProps={{
                                                                    transition: { timeout: 300 },
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    // className={class_btn_}
                                                                    disabled={!userPermission?.f_edit}
                                                                    className={`${class_btn_} ${!userPermission?.f_edit ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                    onClick={() => openDocument('document_2', 'edit', row)}
                                                                >
                                                                    <EditOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                </button>
                                                            </Tooltip>
                                                            {commonButtons}
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })()}

                                        </td>
                                    )}

                                    {/* UNDER DOC 2 STATUS (ของ SHIPPER) */}
                                    {columnVisibility?.status_document_2 && (
                                        // status ของเอกสารจะแสดงแค่ Accepted (id 3), Rejected (id 4), Acknowledge (id 5) เท่านั้น
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('status_document_2', 'section2', 'document_2')}
                                        >
                                            {
                                                row?.document2 && row?.document2?.event_doc_status_id !== 1 &&
                                                (row?.document2?.event_doc_status_id === 3 || row?.document2?.event_doc_status_id === 4 || row?.document2?.event_doc_status_id === 5) && (
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document2?.event_doc_status?.color }}>
                                                        {row?.document2?.event_doc_status?.name ?? ''}
                                                    </div>
                                                )
                                            }
                                        </td>
                                    )}
    
                                    {/* UNDER DOC 2 SHIPPER (ของ TSO) */}
                                    {columnVisibility?.shipper_document_2 && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('shipper_document_2', 'section2', 'document_2')}
                                        >
                                            
                                            {(() => {
                                                if (row?.document2?.length > 0) {
                                                    if(row.document2?.[0].event_doc_status_id === 1){
                                                        return <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document2?.[0]?.event_doc_status?.color }}>
                                                                {row?.document2?.[0]?.event_doc_status?.name ?? ''}
                                                            </div>
                                                    }else{
                                                        // count จำนวนที่ shipper accept หรือ reject
                                                        const count_document_2_shipper_edited = row?.document2?.filter((item: any) => [3, 4].includes(item.event_doc_status_id)) // 3 = Accepted / 4= Rejected 
                                                        return `${count_document_2_shipper_edited?.length}/${row?.document2?.length}`
                                                    }
                                                }

                                                return ''
                                            })()}
                                        </td>
                                    )}

                                    {/* ======================== DOCUMENT 3 ======================== */}

                                    {/* UNDER DOC 3 */}
                                    {columnVisibility?.info_document_3 && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('info_document_3', 'section2', 'document_3')}
                                        >
                                         

                                            {(() => {
                                                const res_ = () => {
                                                        const isTSO = !isShipper;
                                                        const eventStatus = row?.event_status_id; // stat ของ main row (open, close)
                                                        const docStatus = row?.document3?.event_doc_status_id;
                                                        const hasDocument3 = Array.isArray(row?.document3) ? row.document3.length > 0 : !!row?.document3;
                                                        const canShipperView = [3, 4, 5].includes(docStatus); // Accepted / Rejected / Cancelled 
    
                                                        const shouldShowViewButton = eventStatus === 2 || (isShipper && canShipperView);
                                                        const shouldShowEditButton = (isShipper && !canShipperView) || (isTSO && hasDocument3);
    
                                                        const commonButtons = (
                                                            <>
                                                                <Tooltip
                                                                    title="Download"
                                                                    placement="top"
                                                                    arrow
                                                                    slots={{
                                                                        transition: Zoom,
                                                                    }}
                                                                    slotProps={{
                                                                        transition: { timeout: 300 },
                                                                    }}
                                                                >
                                                                    <button type="button" className={class_btn_} disabled={false}
                                                                        // onClick={() => downloadFile(row?.id)}
                                                                        // onClick={() => handleDownloadPDF('doc3', row?.document3?.[0]?.id)}
                                                                        // onClick={() => handleDownloadPDF('doc3', row?.document3TSOID)}
                                                                        onClick={() => handleDownloadPDF('doc3', !isShipper ? row?.document3TSOID : row?.document3?.id)}
                                                                    >
                                                                        <FileDownloadIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                    </button>
                                                                </Tooltip>
    
                                                                {
                                                                    !isShipper &&
                                                                    <Tooltip
                                                                        title="History"
                                                                        placement="top"
                                                                        arrow
                                                                        slots={{
                                                                            transition: Zoom,
                                                                        }}
                                                                        slotProps={{
                                                                            transition: { timeout: 300 },
                                                                        }}
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            // className={class_btn_} 
                                                                            // disabled={false}
                                                                            disabled={!userPermission?.f_view}
                                                                            className={`${class_btn_} ${!userPermission?.f_view ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                            // onClick={() => underDevelopment()}
                                                                            onClick={() => openDocumentHistory('document_3', 'history', row)}
                                                                        >
                                                                            <HistoryOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                        </button>
                                                                    </Tooltip>
                                                                }
                                                            </>
                                                        );
    
                                                        if (!hasDocument3) return null; // ถ้าไม่มี document3 ไม่โชว์ปุ่มนะ
    
                                                        if (shouldShowViewButton) {
                                                            return (
                                                                <div className="flex gap-2 items-center text-center justify-center">
                                                                    <Tooltip
                                                                        title="View"
                                                                        placement="top"
                                                                        arrow
                                                                        slots={{
                                                                            transition: Zoom,
                                                                        }}
                                                                        slotProps={{
                                                                            transition: { timeout: 300 },
                                                                        }}
                                                                    >
                                                                        <button
                                                                            type="button"
                                                                            // className={class_btn_}
                                                                            disabled={!userPermission?.f_view}
                                                                            className={`${class_btn_} ${!userPermission?.f_view ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                            onClick={() => openDocument('document_3', 'view', row)}
                                                                        >
                                                                            <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                        </button>
                                                                    </Tooltip>
                                                                    {commonButtons}
                                                                </div>
                                                            );
                                                        }
    
                                                        if (shouldShowEditButton) {
                                                            const shipeye =
                                                                (
                                                                    !!row?.document3 &&
                                                                    isShipper &&
                                                                    row?.document3?.event_doc_status_id === 2
                                                                ) &&
                                                                userDT?.account_manage?.[0]?.group_id === row?.document3?.create_by_account?.account_manage?.[0]?.group_id &&
                                                                !!!row.document3.event_document_action.some((item: any) => (item.user_type_id == 1 || item.user_type_id == 2) && item.event_doc_status_id == 2);
                                                            return (
                                                                <div className="flex gap-2 items-center text-center justify-center">
                                                                        <Tooltip
                                                                            title="Edit"
                                                                            placement="top"
                                                                            arrow
                                                                            slots={{
                                                                                transition: Zoom,
                                                                            }}
                                                                            slotProps={{
                                                                                transition: { timeout: 300 },
                                                                            }}
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                // className={class_btn_}
                                                                                disabled={!userPermission?.f_edit}
                                                                                className={`${class_btn_} ${!userPermission?.f_edit ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`}
                                                                                onClick={() => openDocument('document_3', 'edit', row)}
                                                                            >
                                                                                {
                                                                                    shipeye ?
                                                                                    <RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }}  />
                                                                                    :
                                                                                <EditOutlinedIcon sx={{ fontSize: 20, color: '#1473A1' }} />
                                                                                }
                                                                            </button>
                                                                        </Tooltip>
                                                                    {commonButtons}
                                                                </div>
                                                            );
                                                        }
    
                                                        return null;
                                                    }

                                                
                                                    
                                                if(isShowDoc3Action(row)){
                                                    return <>{res_()}</>
                                                }
                                               
                                            })()}

                                        </td>
                                    )}

                                    {/* UNDER DOC 3 STATUS (ของ SHIPPER) */}
                                    {columnVisibility?.status_document_3 && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('status_document_3', 'section2', 'document_3')}
                                        >
                                            {
                                                  
                                                row?.document3 && (row?.document3?.event_doc_status_id === 1 && (row?.document3?.create_by_account?.account_manage?.[0]?.user_type_id === 3 || row?.document3?.create_by_account?.account_manage?.[0]?.user_type_id === 4)) ? (
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document3?.event_doc_status?.color }}>
                                                        {row?.document3?.event_doc_status?.name ?? ''}
                                                    </div>
                                                ) :
                                                row?.document3 && (row?.document3?.event_doc_status_id === 3 || row?.document3?.event_doc_status_id === 4 || row?.document3?.event_doc_status_id === 5) && (
                                                    <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document3?.event_doc_status?.color }}>
                                                        {row?.document3?.event_doc_status?.name ?? ''}
                                                    </div>
                                                )
                                            }
                                        </td>
                                    )}

                                    {/* UNDER DOC 3 SHIPPER (ของ TSO) */}
                                    {columnVisibility?.shipper_document_3 && (
                                        <td
                                            className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}
                                            style={renderSectionBorder('shipper_document_3', 'section2', 'document_3')}
                                        >

                                            {(() => {
                                                if (row?.document3?.length > 0) {

                                                    // กรณีที่ Shipper เป็นคนสร้าง มันจะยังไม่สามารถนับ acknowledge ได้ https://app.clickup.com/t/86eucvmzk
                                                    if (row?.document3?.[row?.document3?.length - 1].event_doc_status_id !== 1) {
                                                        // count จำนวนที่ shipper accept หรือ reject
                                                        const count_document_2_shipper_edited = row?.document3?.filter((item: any) => [5].includes(item.event_doc_status_id)) // 3 = Accepted / 4= Rejected  / 5=Acknowledge
                                                        // const isTsoSubmitAfterShipperCreateDoc3 = (
                                                        //     !row?.document3?.some((item: any) => item.user_type_id == 1 || item.user_type_id == 2) &&
                                                        //     row?.document2?.some((item: any) => item.event_doc_status_id != 1) &&
                                                        //     row?.document1?.event_doc_status_id != 1
                                                        // )
                                                        // if(row?.id == 19){
                                                        //     console.log('document3 ', row?.document3 ,row?.document3?.some((item: any) => item.user_type_id == 1 || item.user_type_id == 2));
                                                        //     console.log('document2 ', row?.document2 ,row?.document2?.some((item: any) => item.event_doc_status_id != 1 ));
                                                        //     console.log('isTsoSubmitAfterShipperCreateDoc3 ', isTsoSubmitAfterShipperCreateDoc3);
                                                        // }
                                                        // return `${(row?.document3?.length > 1 ? row?.document3?.length - 1 : 0) === 0 ? 0 : count_document_2_shipper_edited?.length}/${isTsoSubmitAfterShipperCreateDoc3 ? (row?.document3?.length || 0) : row?.document3?.length > 1 ? row?.document3?.length - 1 : 0}`
                                                        const isShipperCreateDoc3 = row?.document3?.find((item: any) => !item.ref_document && item.user_type_id != 1 && item.user_type_id != 2 && item.event_doc_status_id != 1);
                                                        return `${(row?.document3?.length > 1 ? row?.document3?.length - 1 : 0) === 0 ? 0 : isShipperCreateDoc3 ? count_document_2_shipper_edited?.filter((item: any) => item.group_id != isShipperCreateDoc3.group_id).length : count_document_2_shipper_edited?.length}/${row?.document3?.length > 1 ? row?.document3?.length - 1 : 0}`
                                                    }else if(row?.document3?.[row?.document3?.length - 1]?.user_type_id === userDT?.account_manage?.[0]?.user_type_id || isShowDoc3Action(row)){
                                                        // userDT?.account_manage?.[0]?.user_type_id
                                                        
                                                        return (
                                                            <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.document3?.[row?.document3?.length - 1]?.event_doc_status?.color }}>
                                                                {row?.document3?.[row?.document3?.length - 1]?.event_doc_status?.name ?? ''}
                                                            </div>
                                                        )
                                                    }
                                                }

                                                return ''
                                            })()}
                                        </td>
                                    )}

                                    {!isShipper && columnVisibility.created_by && (
                                        // status ของเอกสารจะแสดงแค่ Accepted (id 3), Rejected (id 4), Acknowledge (id 5) เท่านั้น
                                        <td className="px-2 py-1 text-[#464255]">
                                            <div>
                                                <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                                <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility?.event_status && (
                                        <td className={`px-2 py-1 text-[#464255] text-center min-w-[120px] `}>
                                            <div className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]" style={{ backgroundColor: row?.event_status?.color }}>
                                                {row?.event_status?.name ?? ''}
                                            </div>
                                        </td>
                                    )}

                                    {/* SHIPPER ไม่เห็น column action */}
                                    {/* กันบอกให้จับจากสิทธิไม่ใช่ user_type */}
                                    {columnVisibility.action && userPermission?.f_approved && !isShipper && (
                                        // {columnVisibility.action && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                                        <td className="px-2 py-1">
                                            <div className="relative inline-flex justify-center items-center w-full">
                                                <BtnActionTable
                                                    togglePopover={togglePopover}
                                                    row_id={row?.id}
                                                    disable={row?.event_status_id == 2 ? true : false}
                                                />
                                                {openPopoverId === row?.id && (
                                                    <div ref={popoverRef} className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50" >
                                                        <ul className="py-2">
                                                            {
                                                                userPermission?.f_approved && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><CancelOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Close`}</li>
                                                                // userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><CancelOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Close`}</li>
                                                            }
                                                        </ul>
                                                    </div>
                                                )}
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

                {
                    !isLoading && sortedData?.length == 0 && <NodataTable />
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
                            updateMainStat(dataSubmit);
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

export default TableOffspecGas;