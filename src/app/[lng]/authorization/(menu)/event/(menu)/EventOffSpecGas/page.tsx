"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { Tune } from "@mui/icons-material"
import { InputSearch } from "@/components/other/SearchForm";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import ModalComponent from "@/components/other/ResponseModal";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, generateUserPermission } from "@/utils/generalFormatter";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import dayjs from 'dayjs';
import BtnGeneral from "@/components/other/btnGeneral";
import getUserValue from "@/utils/getuserValue";
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import TableOffspecGas from "./form/table";
import DocumentViewer from "./form/documentViewer";
import { getService, patchService, postService, putService } from "@/utils/postService";
import HistoryViewer from "./form/historyViewer";
import { useSearchParams } from "next/navigation";

interface ClientProps { params: { lng: string } }

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    const userDT: any = getUserValue();

    // ############### Check Authen ###############
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    const searchParams = useSearchParams();
    const status_from_somewhere_else = searchParams.get("status");
    const start_date_from_somewhere_else = searchParams.get("start-date");
    const end_date_from_somewhere_else = searchParams.get("end-date");
    const [useParams, setuseParams] = useState<boolean>(false);

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg";

    //state
    const [key, setKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [selectedKey, setselectedKey] = useState<any>();
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Your file has been uploaded.');

    const handleCloseModal = () => {
        setModalSuccessOpen(false);
    }

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Off-spec Gas', userDT)
            if (permission) {
                setUserPermission(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    // const { zoneMaster, areaMaster, nominationPointData } = useFetchMasters();
    // const [forceRefetch, setForceRefetch] = useState(true);
    // const dispatch = useAppDispatch();

    // useEffect(() => {
    //     if (forceRefetch || !zoneMaster?.data) {
    //         dispatch(fetchZoneMasterSlice());
    //     }
    //     if (forceRefetch || !areaMaster?.data) {
    //         dispatch(fetchAreaMaster());
    //     }
    //     // Reset forceRefetch after fetching
    //     if (forceRefetch) {
    //         setForceRefetch(false); // Reset the flag after triggering the fetch
    //     }
    //     getPermission();
    // }, [dispatch, nominationPointData, forceRefetch]); // Watch for forceRefetch changes

    useEffect(() => {
        getPermission();
    }, [])

    // ############### FIELD SEARCH ###############
    const [srchEventCode, setSrchEventCode] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>();
    const [srchEndDate, setSrchEndDate] = useState<Date | null>();
    const [srchEventStatus, setSrchEventStatus] = useState<any>('');

    const handleFieldSearch = async () => {
        setIsLoading(true)

        const eventDateFrom = srchStartDate ? dayjs(srchStartDate).format('YYYY-MM-DD') : '';
        const eventDateTo = srchEndDate ? dayjs(srchEndDate).format('YYYY-MM-DD') : '';
        let eventStat = srchEventStatus == 'Open' ? '1' : srchEventStatus == 'Close' ? '2' : ''

        const res_main_data = await getService(`/master/event/offspec-gas?eventCode=${srchEventCode}&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=${eventStat}&offset=0&limit=${itemsPerPage}`); // คุณทำให้ผมเป็นแบบนี้ !!!
        setDataTableTotal(res_main_data?.total)
        setDataTable(res_main_data?.data)
        setFilteredDataTable(res_main_data?.data)

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchEventCode('');
        setSrchEventStatus('');

        fetchData(0, 10);
        setKey((prevKey) => prevKey + 1);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

        // const filtered = dataTable?.filter(
        const filtered = dataTableAll?.filter(
            (item: any) => {

                // let name_search = JSON.parse(item.reqUser).first_name + ' ' + JSON.parse(item.reqUser).last_name
                return (
                    item?.event_nember?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.event_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zone_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDate(item?.event_date)?.toLowerCase().includes(queryLower) ||
                    (item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
                    (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.document1?.event_doc_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [formMode, setFormMode] = useState<'execute' | 'template' | 'view' | undefined>(undefined);
    const [viewDetailOpen, setViewDetailOpen] = useState(false);
    const [viewDetailData, setViewDetailData] = useState<any>();

    const openViewForm = (id: any) => {
        const filteredData = filteredDataTable.find((item: any) => item.id === id);
        setViewDetailData(filteredData);
        setFormMode('view');
        setViewDetailOpen(true);
    };

    // ############### DATA TABLE ###############
    const [dataTableTotal, setDataTableTotal] = useState<any>(0);
    const [dataTable, setDataTable] = useState<any>([]);
    const [dataStatusMain, setDataStatusMain] = useState<any>([]);
    const [dataStatusDocument, setDataStatusDocument] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataTableAll, setDataTableAll] = useState<any>([]);

    const fetchMaster = async () => {
        // DATA STATUS หลัก
        const res_main_stat = await getService(`/master/event/event-status`)
        setDataStatusMain(res_main_stat)

        // DATA STATUS เอกสาร
        const res_document_stat = await getService(`/master/event/event-doc-status`)
        setDataStatusDocument(res_document_stat)
    }

    function formatTimeZone(dateString: any) {
        return dayjs(dateString)
            .tz("Asia/Bangkok")
            .format("ddd MMM DD YYYY HH:mm:ss [GMT+0700] (เวลาอินโดจีน)");
    }

    const fetchData = async (offset?: any, limit?: any) => {
        try {
            setIsLoading(true)

            // DATA MAIN
            const eventDateFrom = dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'); // ต้นปี 1 ปีก่อน
            const eventDateTo = dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'); // สิ้นปีหน้า
            const res_main_data_cyberpunk = await getService(`/master/event/offspec-gas?eventCode=&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=&offset=${offset}&limit=${limit + 100}`);

            let res_API: any;

            if ((status_from_somewhere_else || start_date_from_somewhere_else || end_date_from_somewhere_else) && !useParams) {
                const status: any = status_from_somewhere_else;
                const start_date: any = start_date_from_somewhere_else || eventDateFrom;
                const end_date: any = end_date_from_somewhere_else || eventDateTo;
                let eventStat = status == 'Opened' ? 'Open' : status == 'Closed' ? 'Close' : ''
                let eventStatAPI = eventStat == 'Open' ? '1' : eventStat == 'Close' ? '2' : ''

                if (start_date_from_somewhere_else) {
                    const formatDate: any = formatTimeZone(start_date_from_somewhere_else);
                    setSrchStartDate(formatDate);
                }

                if (end_date_from_somewhere_else) {
                    const formatDate: any = formatTimeZone(end_date_from_somewhere_else);
                    setSrchEndDate(formatDate);
                }

                setSrchEventStatus(eventStat);

                res_API = await getService(`/master/event/offspec-gas?eventCode=&eventDateFrom=${start_date}&eventDateTo=${end_date}&EventStatus=${eventStatAPI}&offset=${offset}&limit=${limit}`);
                setuseParams(true);
            } else {
                if (srchStartDate || srchEndDate || srchEventStatus) {
                    const start_date: any = srchStartDate || eventDateFrom;
                    const end_date: any = srchEndDate || eventDateTo;
                    let eventStatAPI = srchEventStatus == 'Open' ? '1' : srchEventStatus == 'Close' ? '2' : ''
                    res_API = await getService(`/master/event/offspec-gas?eventCode=&eventDateFrom=${start_date}&eventDateTo=${end_date}&EventStatus=${eventStatAPI}&offset=${offset}&limit=${limit}`);
                } else {
                    res_API = await getService(`/master/event/offspec-gas?eventCode=&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=&offset=${offset}&limit=${limit}`);
                }
            }

            setDataTable(res_API?.data)
            setFilteredDataTable(res_API?.data)
            setDataTableTotal(res_API?.total)

            setDataTableAll(res_main_data_cyberpunk?.data)

            // const res_ = await getService(`/master/balancing/closed-balancing-report`)

            setTimeout(() => {
                setIsLoading(false)
            }, 400);

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    //load data
    useEffect(() => {
        fetchData(0, 10);
        fetchMaster();
    }, [resetForm]);

    // ############### OPEN HISTORY ###############
    const [isOpenHistory, setIsOpenHistory] = useState<any>(''); // เปิดหรือปิด history


    // ############### OPEN DOCUMENT ###############
    const [WhichOpenDocument, setWhichDocumentOpen] = useState<any>(''); // บอกว่าเปิด document ไหนอยู่ 'document_1', 'document_2', 'document_3'
    const [modeOpenDocument, setModeOpenDocument] = useState<any>(''); // mode -> 'view', 'edit'
    const [isOpenDocument, setIsOpenDocument] = useState<any>(''); // เปิดหรือปิด
    const [dataOpenDocument, setDataOpenDocument] = useState<any>(); // ข้อมูลของ doc ตอนเปิด view, edit

    const openDocument = (document: String, mode?: String, id?: any) => {
        setWhichDocumentOpen(document)
        setModeOpenDocument(mode)
        setIsOpenDocument(true)
    }

    // #region handleFormSubmit
    const handleFormSubmit = async (item?: any) => {
        setIsLoading(true)

        // document_1, document_2, document_3
        switch (WhichOpenDocument) {
            case 'document_1':
                if (modeOpenDocument == 'create') {
                    // SHIPPER create DOC 1
                    let res_create = await postService(`/master/event/offspec-gas/doc1`, item);
                    const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                    const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                    if (statusCode === 400 || statusCode === 500) {
                        setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                        setModalErrorOpen(true)
                    } else {
                        // setFormOpen(false);
                        await fetchData(0, 10);
                        setModalSuccessMsg('Event document been submitted.')
                        setModalSuccessOpen(true);
                    }
                } else {
                    // TSO edit DOC 1 & Shipper submit
                    const payload = item?.event_doc_status_id === 2 ? {
                        ...item
                    } : {
                        event_doc_status_id: item.event_doc_status_id,
                        input_note: item.input_note
                    };

                    let res_edit = await putService(`/master/event/offspec-gas/doc1/${item?.document_id}`, payload);

                    const statusCodePut = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                    const errorMsgPut = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

                    if (statusCodePut === 400 || statusCodePut === 500) {
                        setModalErrorMsg(errorMsgPut ? errorMsgPut : "Something went wrong.");
                        setModalErrorOpen(true)
                    } else {
                        await fetchData(0, 10);
                        setModalSuccessMsg('Your changes have been saved.')
                        setModalSuccessOpen(true);
                    }
                }
                break;

            case 'document_2':
                if (modeOpenDocument == 'create') {
                    // TSO create DOC 2
                    let res_create = await postService(`/master/event/offspec-gas/doc2`, item);
                    const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                    const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                    if (statusCode === 400 || statusCode === 500) {
                        setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                        setModalErrorOpen(true)
                    } else {
                        // setFormOpen(false);
                        await fetchData(0, 10);
                        setModalSuccessMsg('Event document been submitted.')
                        setModalSuccessOpen(true);
                    }
                } else {
                    if (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) {
                        // TSO edit DOC 2

                        const payload = {
                            "event_date": item?.event_date, // เติมมาทีหลัง
                            "longdo_dict": item?.longdo_dict, //ใส่มาด้วย สำเนา
                            "file": item?.file,
                            "shipper": item?.shipper,
                            "email_event_for_shipper": item?.email_event_for_shipper,
                            "cc_email": item?.cc_email,
                            ...item,
                        }
                        const res_edit_tso = await postService(`/master/event/offspec-gas/doc2/edit/${item?.document_id}`, payload);
                        const statusCode = res_edit_tso?.response?.data?.statusCode ?? res_edit_tso?.response?.data?.status ?? res_edit_tso?.status ?? res_edit_tso?.statusCode ?? res_edit_tso?.code ?? res_edit_tso?.response?.status;
                        const errorMsg = res_edit_tso?.response?.data?.error ?? res_edit_tso?.data?.error ?? res_edit_tso?.response?.error ?? res_edit_tso?.error;

                        if (statusCode === 400 || statusCode === 500) {
                            setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                            setModalErrorOpen(true)
                        } else {
                            // setFormOpen(false);
                            await fetchData(0, 10);
                            setModalSuccessMsg('Your changes have been saved.')
                            setModalSuccessOpen(true);
                        }
                    } else {
                        // Shipper edit DOC 2
                        const payload_shipper = {
                            "event_doc_status_id": item?.event_doc_status_id, // 3 Accept, 4 Reject
                            "doc2_input_note": item?.doc2_input_note ? item?.doc2_input_note : null
                        }
                        const res_edit_shipper = await putService(`/master/event/offspec-gas/doc2/${item?.document_id}`, payload_shipper);
                        const statusCodePut = res_edit_shipper?.response?.data?.statusCode ?? res_edit_shipper?.response?.data?.status ?? res_edit_shipper?.status ?? res_edit_shipper?.statusCode ?? res_edit_shipper?.code ?? res_edit_shipper?.response?.status;
                        const errorMsgPut = res_edit_shipper?.response?.data?.error ?? res_edit_shipper?.data?.error ?? res_edit_shipper?.response?.error ?? res_edit_shipper?.error;

                        if (statusCodePut === 400 || statusCodePut === 500) {
                            // setModalErrorMsg(res_edit_shipper?.response?.data?.error ? res_edit_shipper?.response?.data?.error : "Something went wrong.");
                            setModalErrorMsg(errorMsgPut ? errorMsgPut : "Something went wrong.");
                            setModalErrorOpen(true)
                        } else {
                            // setFormOpen(false);
                            await fetchData(0, 10);
                            setModalSuccessMsg('Your changes have been saved.')
                            setModalSuccessOpen(true);
                        }
                    }
                }
                break;

            case 'document_3':
                // submit doc 3
                if (modeOpenDocument == 'create') {
                    // TSO or SHIPPER create DOC 3
                    // ถ้า shipper create อย่าลืมดู payload มันจะมี [] หรือ null ด้วย
                    let res_create_doc_3 = await postService(`/master/event/offspec-gas/doc3`, item);
                    const statusCode = res_create_doc_3?.response?.data?.statusCode ?? res_create_doc_3?.response?.data?.status ?? res_create_doc_3?.status ?? res_create_doc_3?.statusCode ?? res_create_doc_3?.code ?? res_create_doc_3?.response?.status;
                    const errorMsg = res_create_doc_3?.response?.data?.error ?? res_create_doc_3?.data?.error ?? res_create_doc_3?.response?.error ?? res_create_doc_3?.error;

                    if (statusCode === 400 || statusCode === 500) {
                        setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                        setModalErrorOpen(true)
                    } else {
                        // setFormOpen(false);
                        await fetchData(0, 10);
                        setModalSuccessMsg('Event document been submitted.')
                        setModalSuccessOpen(true);
                    }
                } else {
                    // EDIT
                    if (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) {

                        // TSO edit DOC 3

                        const payload_tso_edit = {
                            "ref_document": item?.ref_document, // id runnumber ไม่ ref null
                            "event_date": item?.event_date, //ใส่มาด้วย วันที่ออกเอกสารจาก doc 
                            "longdo_dict": item?.longdo_dict, //ใส่มาด้วย สำเนา

                            "doc3_input_notifyby": item?.doc3_input_notifyby, //แจ้งโดย
                            "doc3_input_shipper_cpn_name": item?.doc3_input_shipper_cpn_name, // shipper company name

                            "doc3_input_shipper_doc_number": item?.doc3_input_shipper_doc_number, // doc3 ผู้ใช้ เอกสารเลขที่
                            "doc3_input_shipper_doc_quality": item?.doc3_input_shipper_doc_quality, // doc3 ผู้ใช้ เอกสารแจ้งเตือนคุณภาพ
                            "doc3_input_shipper_down_date": item?.doc3_input_shipper_down_date, // doc3 ผู้ใช้ ลงวันที่
                            "doc3_input_shipper_time_event_start_date": item?.doc3_input_shipper_time_event_start_date, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม วัน
                            "doc3_input_shipper_time_event_start_time": item?.doc3_input_shipper_time_event_start_time, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ เริ่ม เวลา
                            "doc3_input_shipper_time_event_end_date": item?.doc3_input_shipper_time_event_end_date, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง วัน
                            "doc3_input_shipper_time_event_end_time": item?.doc3_input_shipper_time_event_end_time, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ ถึง เวลา
                            "doc3_input_shipper_time_event_summary": item?.doc3_input_shipper_time_event_summary, // doc3 ผู้ใช้ ช่วงเวลาของเหตุการณ์ สรุปการแก้ไข
                            "doc3_input_tso_doc_number": item?.doc3_input_tso_doc_number, // doc3 ผู้ให้ เอกสารเลขที่
                            "doc3_input_tso_down_date": item?.doc3_input_tso_down_date, // doc3 ผู้ให้ ลงวันที่
                            "doc3_input_tso_disapeared_date": item?.doc3_input_tso_disapeared_date, // doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ วัน
                            "doc3_input_tso_disapeared_time": item?.doc3_input_tso_disapeared_time, // doc3 ผู้ให้ โดยก๊าซที่ไม่อยู่ในกำหนด TSO Code ได้หมดไปจากระบบก๊าซฯ เมื่อวันที่ เวลา

                            "file": item?.file,
                            "shipper": item?.shipper,
                            "email_event_for_shipper": item?.email_event_for_shipper,
                            "cc_email": item?.cc_email,

                            "event_doc_status_id": item?.event_doc_status_id || 2
                        }

                        const res_edit_tso = await postService(`/master/event/offspec-gas/doc3/edit/${item?.document_id}`, payload_tso_edit);
                        const statusCode = res_edit_tso?.response?.data?.statusCode ?? res_edit_tso?.response?.data?.status ?? res_edit_tso?.status ?? res_edit_tso?.statusCode ?? res_edit_tso?.code ?? res_edit_tso?.response?.status;
                        const errorMsg = res_edit_tso?.response?.data?.error ?? res_edit_tso?.data?.error ?? res_edit_tso?.response?.error ?? res_edit_tso?.error;

                        if (statusCode === 400 || statusCode === 500) {
                            setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                            setModalErrorOpen(true)
                        } else {
                            // setFormOpen(false);
                            await fetchData(0, 10);
                            setModalSuccessMsg('Your changes have been saved.')
                            setModalSuccessOpen(true);
                        }
                    } else {
                        // shipper edit doc 3
                        const payload_shipper_acknow = {
                            ...item,
                            // "event_doc_status_id": 5 // 5 Acknowledge
                        }

                        const shipperCreateDraft = (userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4) && dataOpenDocument?.event_doc_status_id === 1 && modeOpenDocument == 'edit'

                        let res_shipper_acknow = await putService(`/master/event/offspec-gas/doc3/${item?.document_id}`, payload_shipper_acknow);
                        const statusCodePut = res_shipper_acknow?.response?.data?.statusCode ?? res_shipper_acknow?.response?.data?.status ?? res_shipper_acknow?.status ?? res_shipper_acknow?.statusCode ?? res_shipper_acknow?.code ?? res_shipper_acknow?.response?.status;
                        const errorMsgPut = res_shipper_acknow?.response?.data?.error ?? res_shipper_acknow?.data?.error ?? res_shipper_acknow?.response?.error ?? res_shipper_acknow?.error;

                        if (statusCodePut === 400 || statusCodePut === 500) {
                            // setModalErrorMsg(res_shipper_acknow?.response?.data?.error ? res_shipper_acknow?.response?.data?.error : "Something went wrong.");
                            setModalErrorMsg(errorMsgPut ? errorMsgPut : "Something went wrong.");
                            setModalErrorOpen(true)
                        } else {
                            // setFormOpen(false);
                            await fetchData(0, 10);
                            setModalSuccessMsg(shipperCreateDraft ? 'Event document been submitted.' : 'Event Document been acknowledged.')
                            setModalSuccessOpen(true);
                        }
                    }
                }
                break;
        }
    }

    const updateMainStat = async (data?: any) => {
        try {
            let body_patch = {
                ...data,
                "event_status_id": data.event_status_id // 1 Open, 2 Closed
            }
            let res_patch = await patchService(`/master/event/offspec-gas/${data.id}`, body_patch);
            const statusCodePatch = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
            const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

            if (statusCodePatch === 400 || statusCodePatch === 500) {
                setModalErrorMsg(errorMsgPatch || '');
                setModalErrorOpen(true)
            } else {
                await fetchData(0, 10);
                setModalSuccessMsg('Your changes have been saved.')
                setModalSuccessOpen(true);
            }
        } catch (error) {

        }
    }

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            // setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable) // ที่ใช้ยังงี้เพราะของที่ได้มาจาก service มันทำ pagination อยู่แล้ว
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    useEffect(() => {
        let newOffset = (currentPage - 1) * itemsPerPage;
        // setLimit(itemsPerPage)
        // setOffset(newOffset)

        fetchData(newOffset, itemsPerPage);
        setIsLoading(true)
    }, [currentPage, itemsPerPage]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'event_code', label: 'Event Code', visible: true },
        { key: 'event_date', label: 'Event Date', visible: true },

        { key: 'zone_text', label: 'Zone', visible: true },

        { key: 'document_1', label: 'Document 1', visible: true },
        { key: 'document_2', label: 'Document 2', visible: true },
        { key: 'document_3', label: 'Document 3', visible: true },

        // sub of Document 1
        { key: 'info_document_1', label: 'Info', visible: true, parent_id: 'document_1' },
        { key: 'status_document_1', label: 'Status', visible: true, parent_id: 'document_1' },

        // sub of Document 2
        { key: 'info_document_2', label: 'Info', visible: true, parent_id: 'document_2' },
        { key: 'status_document_2', label: 'Status', visible: true, parent_id: 'document_2' },
        { key: 'shipper_document_2', label: 'Shipper', visible: true, parent_id: 'document_2' },

        // sub of Document 3
        { key: 'info_document_3', label: 'Info', visible: true, parent_id: 'document_3' },
        { key: 'status_document_3', label: 'Status', visible: true, parent_id: 'document_3' },
        { key: 'shipper_document_3', label: 'Shipper', visible: true, parent_id: 'document_3' },

        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'event_status', label: 'Event Status', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const filteredColumns = initialColumns?.filter((col: any) => {
        if (col.key === 'status_document_2' || col.key === 'status_document_3') {
            // เก็บเฉพาะเมื่อ user_type_id === 3
            return userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4;
        }

        if (col.key === 'shipper_document_2' || col.key === 'shipper_document_3') {
            // เก็บเฉพาะเมื่อ user_type_id !== 3
            return userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4;
        }

        return true; // อื่น ๆ เก็บไว้ทั้งหมด
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [tk, settk] = useState<boolean>(false);
    const open = Boolean(anchorEl);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggleNew = (columnKey: string) => {
        const dataFilter = filteredColumns;

        const getDescendants = (key: string): string[] => {
            const children = dataFilter.filter((col: { key: string; parent_id?: string }) => col.parent_id === key);
            return children.reduce((acc: string[], child: any) => {
                return [...acc, child.key, ...getDescendants(child.key)];
            }, []);
        };

        const getAncestors = (key: string): string[] => {
            const column = dataFilter.find((col: any) => col.key === key);
            if (column?.parent_id) {
                return [column.parent_id, ...getAncestors(column.parent_id)];
            }
            return [];
        };

        const descendants = getDescendants(columnKey);
        const ancestors = getAncestors(columnKey);

        setColumnVisibility((prev: any) => {
            const newState = { ...prev };
            const currentChecked = prev[columnKey];
            const newChecked = !currentChecked;

            // Toggle current column
            newState[columnKey] = newChecked;

            // Toggle all descendant columns to match the newChecked state
            descendants.forEach((key: any) => {
                newState[key] = newChecked;
            });

            // Update parent visibility based on sibling states (bottom-up)
            ancestors.forEach(parentKey => {
                const siblings = dataFilter.filter((col: any) => col.parent_id === parentKey);
                const isAnySiblingChecked = siblings.some((col: any) => newState[col.key]);

                newState[parentKey] = isAnySiblingChecked;
            });

            return newState;
        });

        settk((prev: any) => !prev);
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const [dataHistory, setdataHistory] = useState<any>();
    const [modePage, setmodePage] = useState<any>();
    const [rowselected, setrowselected] = useState<any>();

    return (
        <div className="space-y-2">
            {
                !isOpenDocument && !isOpenHistory && <>

                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                            <InputSearch
                                id="searchEventCode"
                                label="Event Code"
                                value={srchEventCode}
                                type="text"
                                onChange={(e) => setSrchEventCode(e.target.value)}
                                placeholder="Search Event Code"
                            />

                            <DatePickaSearch
                                {...register('filter_start_date')}
                                key={"start" + key}
                                label="Event Date From"
                                placeHolder="Select Event Date From"
                                allowClear
                                max={srchEndDate}
                                // onChange={(e: any) => setValue("filter_start_date", e ? e : undefined)}
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                customWidth={145}
                                defaultValue={srchStartDate}
                            // isDefaultToday={true}
                            />

                            <DatePickaSearch
                                {...register('filter_end_date')}
                                key={"end" + key}
                                label="Event Date To"
                                placeHolder="Select Event Date To"
                                min={srchStartDate}
                                allowClear
                                // onChange={(e: any) => setValue("filter_end_date", e ? e : undefined)}
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                customWidth={140}
                                defaultValue={srchEndDate}
                            // isDefaultToday={true}
                            />

                            <InputSearch
                                id="searchEventStatusMaster"
                                label="Event Status"
                                type="select"
                                value={srchEventStatus}
                                onChange={(e) => setSrchEventStatus(e.target.value)}
                                options={(Array.isArray(dataStatusMain) ? dataStatusMain : [])?.map((item: any) => ({
                                    value: item.name,
                                    label: item.name
                                }))}
                            />

                            <div className="w-auto relative flex gap-2 items-center pl-[5px] -mt-6">
                                <BtnSearch handleFieldSearch={handleFieldSearch} />
                                <BtnReset handleReset={handleReset} />
                            </div>
                        </aside>

                        <div className="action-panel flex gap-3 items-end justify-end pb-[8px]">
                            {/* ถ้าเป็น shipper เห็น New Doc. 1, Close Doc. 3 */}
                            {/* ถ้าเป็น TSO เห็น New Doc. 2, Close Doc. 3 */}

                            {/* <div className="flex flex-wrap gap-2 justify-end">
                                <BtnGeneral
                                    textRender={"New Doc. 1"}
                                    iconNoRender={true}
                                    bgcolor={"#00ADEF"}
                                    generalFunc={() => openDocument('document_1', 'create')}
                                    disable={false}
                                    customWidthSpecific={130}
                                    can_create={userPermission ? userPermission?.f_create : false}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2 justify-end">
                                <BtnGeneral
                                    textRender={"New Doc. 2"}
                                    iconNoRender={true}
                                    bgcolor={"#00ADEF"}
                                    generalFunc={() => openDocument('document_2', 'create')}
                                    disable={false}
                                    customWidthSpecific={130}
                                    can_create={userPermission ? userPermission?.f_create : false}
                                />
                            </div> */}

                            {
                                (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) && <div className="flex flex-wrap gap-2 justify-end">
                                    <BtnGeneral
                                        textRender={"New Doc. 1"}
                                        iconNoRender={true}
                                        bgcolor={"#00ADEF"}
                                        generalFunc={() => openDocument('document_1', 'create')}
                                        disable={false}
                                        customWidthSpecific={130}
                                        can_create={userPermission ? userPermission?.f_create : false}
                                    />
                                </div>
                            }


                            {
                                (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && <div className="flex flex-wrap gap-2 justify-end">
                                    <BtnGeneral
                                        textRender={"New Doc. 2"}
                                        iconNoRender={true}
                                        bgcolor={"#00ADEF"}
                                        generalFunc={() => openDocument('document_2', 'create')}
                                        disable={false}
                                        customWidthSpecific={130}
                                        can_create={userPermission ? userPermission?.f_create : false}
                                    />
                                </div>
                            }

                            <div className="flex flex-wrap gap-2 justify-end">
                                <BtnGeneral
                                    textRender={"New Doc. 3"}
                                    iconNoRender={true}
                                    bgcolor={"#00ADEF"}
                                    generalFunc={() => openDocument('document_3', 'create')}
                                    disable={false}
                                    customWidthSpecific={130}
                                    can_create={userPermission ? userPermission?.f_create : false}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`${cardClass}`}>
                        <div>
                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                <div onClick={handleTogglePopover}>
                                    <Tune
                                        className="cursor-pointer rounded-lg"
                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 justify-end">
                                    <SearchInput onSearch={handleSearch} />
                                    <BtnExport
                                        textRender={"Export"}
                                        data={filteredDataTable}
                                        path="event/offspec-gas"
                                        can_export={userPermission ? userPermission?.f_export : false}
                                        columnVisibility={columnVisibility}
                                        initialColumns={initialColumns}
                                        specificMenu={'event-offspec-gas'}
                                        specificData={
                                            {
                                                "eventCode": srchEventCode,
                                                "eventDateFrom": srchStartDate ? dayjs(srchStartDate).format('YYYY-MM-DD') : dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),  // ต้นปี 1 ปีก่อน
                                                "eventDateTo": srchEndDate ? dayjs(srchEndDate).format('YYYY-MM-DD') : dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'), // สิ้นปีหน้า
                                                "EventStatus": srchEventStatus,
                                                "offset": currentPage - 1,
                                                "limit": itemsPerPage
                                            }
                                        }
                                        startDate={srchStartDate}
                                        endDate={srchEndDate}
                                    />
                                </div>
                            </div>
                        </div>

                        <TableOffspecGas
                            tableData={paginatedData}

                            isLoading={isLoading}
                            columnVisibility={columnVisibility}
                            initialColumns={
                                (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ?
                                    filteredColumns?.filter((item: any) => item?.key !== 'shipper_document_2' && item?.key !== 'shipper_document_3')
                                    : filteredColumns?.filter((item: any) => item?.key !== 'status_document_2' && item?.key !== 'status_document_3')
                            }
                            setisLoading={setIsLoading}
                            selectedKey={selectedKey}
                            openViewForm={openViewForm}
                            userPermission={userPermission}
                            userDT={userDT}
                            handleFormSubmit={handleFormSubmit}

                            setWhichDocumentOpen={setWhichDocumentOpen} // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
                            setModeOpenDocument={setModeOpenDocument}  // mode -> 'view', 'edit'
                            setIsOpenDocument={setIsOpenDocument}  // set เปิด-ปิด
                            setDataOpenDocument={setDataOpenDocument}  // ข้อมูลของ doc ตอนเปิด view, edit

                            setIsOpenHistory={setIsOpenHistory} // set เปิด-ปิด history

                            updateMainStat={updateMainStat}  // ฟังก์ชั่นอัพเดท stat ของ row หลัก ที่เป็น close หรือ open
                            setdataHistory={setdataHistory}
                            setmodePage={setmodePage}
                            setrowselected={setrowselected}
                        />
                    </div>

                    <PaginationComponent
                        // totalItems={filteredDataTable?.length}
                        totalItems={dataTableTotal}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </>
            }

            {
                isOpenDocument && <DocumentViewer
                    setIsOpenDocument={setIsOpenDocument} // set เปิด-ปิด
                    WhichOpenDocument={WhichOpenDocument} // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
                    modeOpenDocument={modeOpenDocument}  // mode -> 'view', 'edit'
                    setModeOpenDocument={setModeOpenDocument}
                    dataOpenDocument={dataOpenDocument}
                    setDataOpenDocument={setDataOpenDocument}
                    setIsOpenHistory={setIsOpenHistory} // set เปิด-ปิด history
                    onSubmit={handleFormSubmit}
                    modePage={modePage}
                />
            }

            {
                isOpenHistory && <HistoryViewer
                    setIsOpenHistory={setIsOpenHistory} // set เปิด-ปิด
                    WhichOpenDocument={WhichOpenDocument} // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
                    modeOpenDocument={modeOpenDocument}  // mode -> 'view', 'edit'
                    dataOpenDocument={dataOpenDocument}
                    onSubmit={handleFormSubmit}

                    setWhichDocumentOpen={setWhichDocumentOpen} // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
                    setModeOpenDocument={setModeOpenDocument}  // mode -> 'view', 'edit'
                    setIsOpenDocument={setIsOpenDocument}  // set เปิด-ปิด
                    setDataOpenDocument={setDataOpenDocument}  // ข้อมูลของ doc ตอนเปิด view, edit
                    dataHistory={dataHistory}
                    setdataHistory={setdataHistory}
                    modePage={modePage}
                    rowselected={rowselected}
                    setrowselected={setrowselected}
                />
            }

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalSuccessMsg}`}
                        </div>
                    </div>
                }
            />

            <ColumnVisibilityPopoverBalReport
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggleNew}
                // initialColumns={initialColumns}
                initialColumns={
                    (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ?
                        filteredColumns?.filter((item: any) => item?.key !== 'shipper_document_2' && item?.key !== 'shipper_document_3')
                        : filteredColumns?.filter((item: any) => item?.key !== 'status_document_2' && item?.key !== 'status_document_3')
                }

            />
        </div>
    )
}

export default ClientPage;