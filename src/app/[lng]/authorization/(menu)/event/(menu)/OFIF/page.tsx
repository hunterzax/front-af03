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
import { findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, generateUserPermission, getAcknowledgeStatus } from "@/utils/generalFormatter";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import dayjs from "dayjs";
import BtnGeneral from "@/components/other/btnGeneral";
import getUserValue from "@/utils/getuserValue";
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import DocumentViewer from "./form/documentViewer";
import { getService, patchService, postService, putService } from "@/utils/postService";
import HistoryViewer from "./form/historyViewer";
import TableOfIf from "./form/table";
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

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('OFO', userDT)
            //     setUserPermission(permission);
            // }

            // const permission = findRoleConfigByMenuName('OFO', userDT)
            const permission = findRoleConfigByMenuName('OFO/IF', userDT)
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
    const [srchEventType, setSrchEventType] = useState<any>('');
    const [srchEventStatus, setSrchEventStatus] = useState<any>('');

    const handleFieldSearch = async () => {
        setIsLoading(true)

        const eventDateFrom = srchStartDate ? dayjs(srchStartDate).format('YYYY-MM-DD') : '';
        const eventDateTo = srchEndDate ? dayjs(srchEndDate).format('YYYY-MM-DD') : '';
        let eventStat = srchEventStatus == 'Open' ? '1' : srchEventStatus == 'Close' ? '2' : ''
        let eventType = srchEventType ? srchEventType : ''

        // const res_main_data = await getService(`/master/event/ofo?eventCode=${srchEventCode}&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=${eventStat}&offset=0&limit=${itemsPerPage}`);
        const res_main_data = await getService(`/master/event/ofo?eventCode=${srchEventCode}&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=${eventStat}&event_doc_ofo_type_id=${eventType}&offset=0&limit=${itemsPerPage}`);
        setDataTableTotal(res_main_data?.total)
        // setDataTable(res_main_data?.data)
        // setFilteredDataTable(res_main_data?.data)
        let result_filter_type: any = res_main_data?.data

        // if (srchEventType) {
        //     result_filter_type = res_main_data?.data?.filter((item: any) => {
        //         return (
        //             (srchEventType ? srchEventType == item?.event_doc_ofo_type_id : true)
        //         );
        //     });
        // }

        // เอา row ที่มี generate ออก
        const filteredGenerateOutBro = (result_filter_type ?? []).filter((it: any) => {
            const is7Gen = Array.isArray(it?.document7) ? it.document7.some((d: any) => d?.event_doc_status?.id === 6) : it?.document7?.event_doc_status?.id === 6; // กันเหนียวเผื่อเป็น obj

            return !is7Gen;
        });

        if (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) {
            setDataTable(filteredGenerateOutBro)
            setFilteredDataTable(filteredGenerateOutBro)
        } else {
            setDataTable(result_filter_type)
            setFilteredDataTable(result_filter_type)
        }

        // setDataTable(result_filter_type)
        // setFilteredDataTable(result_filter_type)

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    };

    const handleReset = () => {
        setSrchEventType('')
        setSrchEventStatus('')
        setSrchStartDate(null);
        setSrchEndDate(null);
        fetchData(0, 10);
        setKey((prevKey) => prevKey + 1);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    };

    const norm = (s: any) => String(s ?? '').toLowerCase().replace(/\s+/g, '').trim();

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = dataTable?.filter(
            (item: any) => {

                //custom search
                //===================================================================================
                const itemdoc7: any = item?.document7;
                const datashiper7: any = getAcknowledgeStatus(itemdoc7);
                const doc7StatusMatch = itemdoc7.length > 0 && itemdoc7.some((d: any) => norm(d?.event_doc_status?.name).includes(queryLower));
                //===================================================================================
                const itemdoc8: any = item?.document8;
                const checkAcknowledge8: any = itemdoc8?.filter((items: any) => [5].includes(items?.event_doc_status_id))
                const datashiper8: any = checkAcknowledge8?.length + "/" + itemdoc8?.length;
                //===================================================================================


                // let name_search = JSON.parse(item.reqUser).first_name + ' ' + JSON.parse(item.reqUser).last_name
                return (
                    item?.event_nember?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.event_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.zone?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.event_doc_ofo_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.event_doc_ofo_type?.name_en?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatDate(item?.event_date)?.toLowerCase().includes(queryLower) ||
                    (item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
                    (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.document1?.event_doc_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    (itemdoc7?.length > 0 && datashiper7?.replace(/\s+/g, '').toLowerCase().trim()?.includes(queryLower)) ||
                    (itemdoc8?.length > 0 && datashiper8?.replace(/\s+/g, '').toLowerCase().trim()?.includes(queryLower)) ||
                    doc7StatusMatch

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
    const [dataEmerTypeMain, setDataEmerTypeMain] = useState<any>();
    const [dataStatusDocument, setDataStatusDocument] = useState<any>();
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);

    const fetchMaster = async () => {
        // DATA STATUS หลัก open, close
        const res_main_stat = await getService(`/master/event/ofo/event-status`)
        setDataStatusMain(res_main_stat)

        // DATA STATUS เอกสาร accept, reject, acknowledge, generate
        const res_document_stat = await getService(`/master/event/ofo/event-doc-status`)
        setDataStatusDocument(res_document_stat)

        // DATA TYPE หลัก difficult, emergency
        const res_emer_type = await getService(`/master/event/ofo/event-type`)
        setDataEmerTypeMain(res_emer_type)
    }

    function formatTimeZone(dateString: any) {
        return dayjs(dateString)
            .tz("Asia/Bangkok")
            .format("ddd MMM DD YYYY HH:mm:ss [GMT+0700] (เวลาอินโดจีน)");
    }

    const fetchData = async (offset?: any, limit?: any) => {
        setIsLoading(true)
        try {

            // DATA MAIN
            const eventDateFrom = dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'); // ต้นปี 1 ปีก่อน
            const eventDateTo = dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'); // สิ้นปีหน้า
            // const res_main_data = await getService(`/master/event/ofo?eventCode=&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=&event_doc_ofo_type_id=&offset=${offset}&limit=${limit}`);

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

                res_API = await getService(`/master/event/ofo?eventCode=&eventDateFrom=${start_date}&eventDateTo=${end_date}&EventStatus=${eventStatAPI}&event_doc_ofo_type_id=&offset=${offset}&limit=${limit}`);
                setuseParams(true);
            } else {
                res_API = await getService(`/master/event/ofo?eventCode=&eventDateFrom=${eventDateFrom}&eventDateTo=${eventDateTo}&EventStatus=&event_doc_ofo_type_id=&offset=${offset}&limit=${limit}`);
            }

            // แปลงพวก onshore east, west ให้เป็นชื่อโซน
            const withZoneName = res_API?.data?.map((item: any) => {
                let zone_name = item?.event_doc_emer_gas_tranmiss ?
                    item?.event_doc_ofo_gas_tranmiss?.name == "Onshore East" ? 'East'
                        : item?.event_doc_ofo_gas_tranmiss?.name == "Onshore West" ? 'West'
                            : item?.event_doc_ofo_gas_tranmiss?.name == "Onshore East - West" ? 'East - West'
                                : 'Other'
                    : ''

                return (
                    {
                        ...item,
                        zone: zone_name
                    }
                )
            });

            // 3. DOC3.9 & DOC4 : TSO > กด Gen Doc มาจาก Balance ตอนสถานะเอกสารยังเป็น generated Shipper ต้องยังไม่เห็นเอกสารอันนี้ จนกว่า TSO จะเปลี่ยนสถานะเป็น opend Shipper ถึงจะเห็นได้
            // กรอง withZoneName ที่มี document39.event_doc_status.id == 6 หรือ document41.event_doc_status.id == 6 ออกไปเลย
            // const filteredGenerateOutBro = (res_API?.data ?? []).filter((it: any) => {
            const filteredGenerateOutBro = (withZoneName ?? []).filter((it: any) => {
                const is7Gen = Array.isArray(it?.document7) ? it.document7.some((d: any) => d?.event_doc_status?.id === 6) : it?.document7?.event_doc_status?.id === 6; // กันเหนียวเผื่อเป็น obj

                return !is7Gen;
            });

            if (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) {
                setDataTable(filteredGenerateOutBro)
                setFilteredDataTable(filteredGenerateOutBro)
            } else {
                // setDataTable(res_API?.data)
                // setFilteredDataTable(res_API?.data)
                setDataTable(withZoneName)
                setFilteredDataTable(withZoneName)
            }

            // setDataTableTotal(res_API?.total)
            setDataTableTotal(withZoneName)
            // setDataTable(res_API?.data)
            // setFilteredDataTable(res_API?.data)



        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }

        setTimeout(() => {
            setIsLoading(false)
        }, 500);
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
    const [dataOpenDocument, setDataOpenDocument] = useState<any>({}); // ข้อมูลของ doc ตอนเปิด view, edit

    const openDocument = (document: String, mode?: String, id?: any) => {

        setmodePage('create');
        setWhichDocumentOpen(document)
        setModeOpenDocument(mode)
        setIsOpenDocument(true)
    }

    const handleFormSubmit = async (item?: any) => {
        const isTSO = userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4;
        setIsLoading(true)

        // document_1, document_2, document_3
        switch (WhichOpenDocument) {

            case 'document_7':
                if (modeOpenDocument == 'create') {
                    // TSO create DOC 7

                    let res_create = await postService(`/master/event/ofo/doc7`, item);
                    const status = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                    const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                    if ([400, 500].includes(status)) {
                        setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                        setModalErrorOpen(true)
                    } else {
                        // setFormOpen(false);
                        await fetchData(0, 10);
                        setModalSuccessMsg('Event document been submitted.')
                        setModalSuccessOpen(true);
                    }
                } else {
                    if (isTSO) {
                        // TSO edit DOC 7
                        // ตอน edit ให้ยิงเส้น create ใหม่
                        // payload tso edit doc 7 (ตอน edit ให้ยิงเส้น create ใหม่)

                        let res_create = await postService(`/master/event/ofo/doc7`, item);
                        const status = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                        if ([400, 500].includes(status)) {
                            setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                            setModalErrorOpen(true)
                        } else {
                            // setFormOpen(false);
                            await fetchData(0, 10);
                            setModalSuccessMsg('Event document been submitted.')
                            setModalSuccessOpen(true);
                        }

                    } else {
                        // Shipper edit DOC 7
                        const payload_shipperx = {
                            "event_doc_status_id": 5, // 5 Acknowledge
                            "doc_7_input_note_shipper": item?.doc_7_input_note_shipper
                        }

                        const res_edit_shipper = await putService(`/master/event/ofo/doc7/${item?.document_id}`, payload_shipperx);
                        const status = res_edit_shipper?.response?.data?.statusCode ?? res_edit_shipper?.response?.data?.status ?? res_edit_shipper?.status ?? res_edit_shipper?.statusCode ?? res_edit_shipper?.code ?? res_edit_shipper?.response?.status;
                        const errorMsgPut = res_edit_shipper?.response?.data?.error ?? res_edit_shipper?.data?.error ?? res_edit_shipper?.response?.error ?? res_edit_shipper?.error;

                        if ([400, 500].includes(status)) {
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


            case 'document_8':
                // submit doc 8
                if (modeOpenDocument == 'create') {
                    // TSO create DOC 8

                    let res_create = await postService(`/master/event/ofo/doc8`, item);
                    const status = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                    const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                    if ([400, 500].includes(status)) {
                        setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                        setModalErrorOpen(true)
                    } else {
                        // setFormOpen(false);
                        await fetchData(0, 10);
                        setModalSuccessMsg('Event document been submitted.')
                        setModalSuccessOpen(true);
                    }
                } else {
                    if (isTSO) {
                    console.log('tso edit : ', item);

                        // TSO edit DOC 8
                        // const payload_tso_edit = {
                        //     "longdo_dict": item?.longdo_dict,
                        //     "event_date": item?.event_date,
                        //     "doc_8_input_ref_doc_at": item?.doc_8_input_ref_doc_at, //doc8 ตามเอกสารเลขที่

                        //     "doc_8_input_date": item?.doc_8_input_date, //doc8 วันที่และเวลา วัน
                        //     "doc_8_input_time": item?.doc_8_input_time, //doc8 วันที่และเวลา เวลา
                        //     "doc_8_input_summary": item?.doc_8_input_summary, //doc8 สรุปการแก้ปัญหา
                        //     "doc_8_input_summary_gas": item?.doc_8_input_summary_gas, //doc8 สรุปผลกระทบด้านปริมาณและด้านคุณภาพก๊าซ
                        //     "doc_8_input_more": item?.doc_8_input_more, //doc8 ข้อมูลเพิ่มเติม
                        //     "file": item?.file, // ส่งมาแค่ 1 ถ้า หน้าบ้านอัพโหลด ส่าง url ใหม่ ถ้าไม่อัพส่ง url เก่ามา
                        //     "shipper": item?.shipper,


                        //     "email_event_for_shipper": item?.email_event_for_shipper,
                        //     "cc_email": item?.cc_email
                        // }

                        let res_tso_edit = await postService(`/master/event/ofo/doc8/edit/${item?.document_id}`, item);
                        const status = res_tso_edit?.response?.data?.statusCode ?? res_tso_edit?.response?.data?.status ?? res_tso_edit?.status ?? res_tso_edit?.statusCode ?? res_tso_edit?.code ?? res_tso_edit?.response?.status;
                        const errorMsg = res_tso_edit?.response?.data?.error ?? res_tso_edit?.data?.error ?? res_tso_edit?.response?.error ?? res_tso_edit?.error;

                        if ([400, 500].includes(status)) {
                            setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                            setModalErrorOpen(true)
                        } else {
                            // setFormOpen(false);
                            await fetchData(0, 10);
                            setModalSuccessMsg('Your changes have been saved.')
                            setModalSuccessOpen(true);
                        }
                    } else {
                        console.log('shipper', item);

                        // Shipper edit DOC 8
                        const payload_shipperx = {
                            "event_doc_status_id": 5, // 5 Acknowledge
                        }

                        const res_edit_shipper = await putService(`/master/event/ofo/doc8/${item?.document_id}`, payload_shipperx);
                        const status = res_edit_shipper?.response?.data?.statusCode ?? res_edit_shipper?.response?.data?.status ?? res_edit_shipper?.status ?? res_edit_shipper?.statusCode ?? res_edit_shipper?.code ?? res_edit_shipper?.response?.status;
                        const errorMsgPut = res_edit_shipper?.response?.data?.error ?? res_edit_shipper?.data?.error ?? res_edit_shipper?.response?.error ?? res_edit_shipper?.error;

                        if ([400, 500].includes(status)) {
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
        }

        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }

    const updateMainStat = async (data?: any) => {
        try {
            let body_patch = {
                "event_status_id": data.event_status_id // 1 Open, 2 Closed
            }
            let res_patch = await patchService(`/master/event/ofo/${data.id}`, body_patch);
            const statusCodePatch = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
            const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

            if (statusCodePatch === 400 || statusCodePatch === 500) {
                // setModalErrorMsg(res_patch?.response?.data?.error ? res_patch?.response?.data?.error : "Something went wrong.");
                setModalErrorMsg(errorMsgPatch || '');
                setModalErrorOpen(true)
            } else {
                // setFormOpen(false);
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
        setIsLoading(false)
    }, [currentPage, itemsPerPage]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'event_code', label: 'Event Code', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'event_date', label: 'Event Date', visible: true },

        { key: 'zone', label: 'Zone', visible: true },

        { key: 'document_7', label: 'Document 7', visible: true },
        { key: 'document_8', label: 'Document 8', visible: true },

        // sub of Document 7
        { key: 'info_document_7', label: 'Info', visible: true, parent_id: 'document_7' },
        { key: 'shipper_document_7', label: 'Shipper', visible: true, parent_id: 'document_7' },
        { key: 'status_document_7', label: 'Status', visible: true, parent_id: 'document_7' },
        { key: 'acknowledge_document_7', label: 'Acknowledge', visible: true, parent_id: 'document_7' }, // shipper เห็นอย่างเดียว

        // sub of Document 8
        { key: 'info_document_8', label: 'Info', visible: true, parent_id: 'document_8' },
        { key: 'shipper_document_8', label: 'Shipper', visible: true, parent_id: 'document_8' },
        { key: 'status_document_8', label: 'Status', visible: true, parent_id: 'document_8' },
        { key: 'acknowledge_document_8', label: 'Acknowledge', visible: true, parent_id: 'document_8' }, // shipper เห็นอย่างเดียว

        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'event_status', label: 'Event Status', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const filteredColumns = initialColumns?.filter((col: any) => {

        // ที่ shipper เห็น
        if (col.key === 'acknowledge_document_7' || col.key === 'acknowledge_document_8') {
            // เก็บเฉพาะเมื่อ user_type_id === 3
            return userDT?.account_manage?.[0]?.user_type_id === 3 || userDT?.account_manage?.[0]?.user_type_id === 4;
        }

        // ที่ tso เห็น
        if (col.key === 'shipper_document_7' || col.key === 'status_document_7' || col.key === 'shipper_document_8' || col.key === 'status_document_8') {
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
    const [maiHedDocJedLasted, setMaiHedDocJedLasted] = useState<any>();

    // New : Field หมายเหตุ ของทุก Doc ต้อง Default ข้อความตามเอกสาร (ในครั้งแรก) มาให้อัตโนมัติ และเมื่อมีการแก้ไข ให้ยึดตามล่าสุดเป็น Default ในครั้งถัดไป https://app.clickup.com/t/86eum0nwd
    useEffect(() => {
        if (paginatedData?.length > 0 && currentPage == 1) {

            const latestWithDoc7 = (paginatedData ?? []).reduce<any | null>((best, item) => {
                const hasDoc = Array.isArray(item?.document7) && item.document7.length > 0;
                if (!hasDoc) return best;
                if (!best || item.id > best.id) return item; // id มากสุดคือล่าสุด
                return best;
            }, null);

            setMaiHedDocJedLasted(latestWithDoc7 ? latestWithDoc7?.document7?.[0]?.doc_7_input_note : "")
        }
    }, [paginatedData])

    return (
        <div className="space-y-2">
            {
                !isOpenDocument && !isOpenHistory && <>

                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                            <DatePickaSearch
                                {...register('filter_start_date')}
                                key={"start" + key}
                                label="Event Date From"
                                placeHolder="Select Event Date From"
                                allowClear
                                // onChange={(e: any) => setValue("filter_start_date", e ? e : undefined)}
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                customWidth={145}
                                max={srchEndDate}
                                defaultValue={srchStartDate}
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
                                id="searchEventTypeMaster"
                                label="Type"
                                type="select"
                                value={srchEventType}
                                onChange={(e) => setSrchEventType(e.target.value)}
                                options={dataEmerTypeMain?.map((item: any) => ({
                                    value: item.id,
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchEventStatusMaster"
                                label="Event Status"
                                type="select"
                                value={srchEventStatus}
                                onChange={(e) => setSrchEventStatus(e.target.value)}
                                options={dataStatusMain?.map((item: any) => ({
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
                            {/* TSO เห็นปุ่ม create */}
                            {
                                (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && <>

                                    <div className="flex flex-wrap gap-2 justify-end">
                                        <BtnGeneral
                                            textRender={"New (Doc7)"}
                                            iconNoRender={true}
                                            bgcolor={"#00ADEF"}
                                            generalFunc={() => openDocument('document_7', 'create')}
                                            disable={false}
                                            customWidthSpecific={160}
                                            can_create={userPermission ? userPermission?.f_create : false}
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-end">
                                        <BtnGeneral
                                            textRender={"New (Doc8)"}
                                            iconNoRender={true}
                                            bgcolor={"#00ADEF"}
                                            generalFunc={() => openDocument('document_8', 'create')}
                                            disable={false}
                                            customWidthSpecific={160}
                                            can_create={userPermission ? userPermission?.f_create : false}
                                        />
                                    </div>
                                </>
                            }

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
                                        path="event/ofo"
                                        can_export={userPermission ? userPermission?.f_export : false}
                                        columnVisibility={columnVisibility}
                                        initialColumns={initialColumns}
                                        specificMenu={'event-ofo'}
                                        specificData={
                                            {
                                                "eventCode": srchEventCode,
                                                "eventDateFrom": srchStartDate ? dayjs(srchStartDate).format('YYYY-MM-DD') : dayjs().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),  // ต้นปี 1 ปีก่อน
                                                "eventDateTo": srchEndDate ? dayjs(srchEndDate).format('YYYY-MM-DD') : dayjs().add(1, 'year').endOf('year').format('YYYY-MM-DD'), // สิ้นปีหน้า
                                                "EventStatus": srchEventStatus,
                                                "event_doc_ofo_type_id": srchEventType ? srchEventType : '', // 1 = of, 2 = if, "" = all
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

                        <TableOfIf
                            tableData={paginatedData}
                            isLoading={isLoading}
                            columnVisibility={columnVisibility}
                            // initialColumns={
                            //     userDT?.account_manage?.[0]?.user_type_id == 3 ?
                            //         filteredColumns?.filter((item: any) => item?.key !== 'shipper_document_39' && item?.key !== 'status_document_39' && item?.key !== 'shipper_document_4' && item?.key !== 'status_document_4' && item?.key !== 'shipper_document_5' && item?.key !== 'status_document_5' && item?.key !== 'shipper_document_6' && item?.key !== 'status_document_6')
                            //         : filteredColumns?.filter((item: any) => item?.key !== 'acknowledge_document_39' && item?.key !== 'acknowledge_document_4' && item?.key !== 'acknowledge_document_5' && item?.key !== 'acknowledge_document_6')
                            // }
                            initialColumns={
                                (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ?
                                    filteredColumns?.filter((item: any) => item?.key !== 'shipper_document_7' && item?.key !== 'status_document_7' && item?.key !== 'shipper_document_8' && item?.key !== 'status_document_8')
                                    : filteredColumns?.filter((item: any) => item?.key !== 'acknowledge_document_7' && item?.key !== 'acknowledge_document_8')
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
                    onSubmit={handleFormSubmit}
                    setIsOpenHistory={setIsOpenHistory} // set เปิด-ปิด history
                    modePage={modePage}
                    maiHedDocJedLasted={maiHedDocJedLasted}
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
                        filteredColumns?.filter((item: any) => item?.key !== 'shipper_document_7' && item?.key !== 'status_document_7' && item?.key !== 'shipper_document_8' && item?.key !== 'status_document_8')
                        : filteredColumns?.filter((item: any) => item?.key !== 'acknowledge_document_7' && item?.key !== 'acknowledge_document_8')
                }
            />
        </div>
    )
}

export default ClientPage;