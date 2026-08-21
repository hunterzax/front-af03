"use client";
import { useTranslation } from "@/app/i18n/client";
// import Link from "next/link";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { downloadService, getService } from "@/utils/postService";
import { filterStartEndDateBooking, formatDate, formatDateNoTime, formatSearchDate, formatTime, generateUserPermission } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import ModalFiles from "./form/modalFiles";
// import TablePathDetail from "./form/tablePathDetail";
import BtnGeneral from "@/components/other/btnGeneral";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CustomTooltip } from "@/components/other/customToolTip";
import { addDays, addMonths, addYears, isBefore, parseISO } from "date-fns";
import { fetchProcessType } from "@/utils/store/slices/processTypeSlice";
import { fetchUserType } from "@/utils/store/slices/userTypeMasterSlice";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import TableCapContractList from "./form/table";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import getUserValue from "@/utils/getuserValue";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import FatherTable from "@/components/other/fatherDynamicTable";
import { Tune } from "@mui/icons-material";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import { decryptData } from "@/utils/encryptionData";
import ColumnVisibilityPopoverMT from "@/components/other/popOverfor_mt_table";
import ModalBkComment from "./form/modalBookingVersionComment";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnDetailTable from "@/components/other/btnDetailsOnTable";
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import renderSearchItem from "./form/functions/searchDynamic";
import ContractDetail from "./page-detail";
import TablePathDetail from "../CapReqMgn/form/tablePathDetail";

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface ClientProps {
    params: {
        lng: string;
    };
}

type BookingData = {
    booking_full_json: Array<any>; // Adjust to match your data structure if needed
};

const ClientPage: React.FC<ClientProps> = (props) => {
    const {
        params: { lng },
    } = props;
    const { t } = useTranslation(lng, "mainPage");
    const userDT: any = getUserValue();


    // ############### Check Authen ###############
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
// let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    // ############### REDUX DATA ###############
    const { termTypeMaster, statCapReqMgn, areaMaster, zoneMaster, contractPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    // Fetch data only when forceRefetch is true
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchContractPoint());
            dispatch(fetchProcessType());
            dispatch(fetchUserType());
            dispatch(fetchNominationType());
            dispatch(fetchAreaMaster());
            dispatch(fetchZoneMasterSlice());
            setForceRefetch(false); // Move inside to avoid running on dependency updates
        }
    }, [dispatch, forceRefetch, contractPointData]);

    // Ensure fetch doesn't re-trigger due to state updates
    useEffect(() => {
        if (!forceRefetch) return; // Prevent unnecessary updates
    }, [dispatch, termTypeMaster, areaMaster, statCapReqMgn, zoneMaster]);


    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchContractCode, setSrchContractCode] = useState('');
    const [srchZone, setSrchZone] = useState('');
    const [srchArea, setSrchArea] = useState('');
    const [srchTermType, setSrchTermType] = useState('');
    const [srchStatus, setSrchStatus] = useState('');
    const [srchContractStatus, setContractStatus] = useState('');
    const [srchType, setSrchType] = useState('');
    const [key, setKey] = useState(0);

    // =========== SEARCH PATH DETAIL ===========
    const [dataPeriod, setDataPeriod] = useState<any>([]);
    const [srchPeriod, setSrchPeriod] = useState<any>('');

    const handleFieldSearch = () => {
        // const res_filtered_date: any = filterStartEndDateBooking(dataTable, srchStartDate, srchEndDate);

        let res_filtered_date: any = dataTable
        if (srchStartDate || srchEndDate) {
            res_filtered_date = filterStartEndDateBooking(dataTable, srchStartDate, srchEndDate);
        }

        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                (srchShipper ? item?.group?.id_name == srchShipper : true) &&
                (srchTermType ? item?.term_type_id == srchTermType : true) &&
                (srchType ? item?.type_account_id == srchType : true) &&
                (srchContractCode ? item?.id?.toString() == srchContractCode : true) &&
                (srchContractStatus ? item?.status_capacity_request_management?.id == srchContractStatus : true) &&
                (srchStatus ? item?.status_capacity_request_management_process_id == srchStatus : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const [dataPathDetail, setDataPathDetail] = useState<any>([]);
    const [dataPathDetailSearch, setDataPathDetailSearch] = useState<any>([]);

    const handleFieldSearchPathDetail = async () => {
        const response_path_filter = dataPathDetail?.filter((item: any) => {
            return (
                (srchPeriod ? item?.period == srchPeriod : true)
            );
        });

        setDataPathDetailSearch(response_path_filter);
        setIsReset(false)
        setIsLoading(false)
    };

    const handleReset = () => {
        setIsReset(true)

        setSrchShipper('')
        setSrchTermType('')
        setSrchType('')
        setSrchPeriod('')
        setSrchStatus('')
        setSrchContractCode('')
        setContractStatus('')
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // const parseDate = (dateStr: string) => {
    //     if (!dateStr) return null;

    //     const parts = dateStr.split('/'); // Split by '/' to extract MM, DD, YYYY
    //     if (parts.length === 3) {
    //         const [month, day, year] = parts.map(Number); // Convert parts to numbers
    //         return new Date(year, month - 1, day); // Months are 0-based in JavaScript
    //     }

    //     return null; // Return null if the format is invalid
    // };

    // ############### SEARCH MOTHER TABLE ###############
    const [tk, settk] = useState<boolean>(true);
    const [testData, setTestData] = useState<any>([]);
    const originalMomDataTable: any = useRef<BookingData | null>(null); // UseRef with type definition
    const [isReset, setIsReset] = useState<any>(false);

    const handleSearchMotherTable = (data?: any, mode?: any, modeSearch?: any) => {

        // Store original data if it hasn't been stored yet
        if (!originalMomDataTable.current) {
            originalMomDataTable.current = { booking_full_json: [...data?.booking_full_json] }; // Store the original data with the booking_full_json
        }

        if (modeSearch === 'reset') {
            // Restore the original data to data.booking_full_json
            if (originalMomDataTable.current?.booking_full_json) {
                data.booking_full_json = [...originalMomDataTable.current.booking_full_json]; // Ensure deep copy if necessary
            }

            setFilteredDataTable(originalMomDataTable.current); // Reset the filtered data

            // Reset search fields
            setSrchArea('');
            setSrchZone('');
            setSrchContractCode('');
            setSrchStartDate(null);
            setSrchEndDate(null);
            setKey((prevKey) => prevKey + 1);
        } else {
            // ล่อ ลวง พราง
            // let test: any = renderSearchItem()

            // setinitialColumnsDynamicEntry_New

            data.booking_full_json = data?.booking_full_json.map((booking: any) => {
                const dataTemp = JSON.parse(booking.data_temp);

                const filteredEntryValue = dataTemp.entryValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);
                    let dateFrom: any = srchStartDate;
                    let dateTo: any = srchEndDate;
                    const condition1 = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const condition2 = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const condition3 = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                    const condition4 = (srchStartDate && !srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").isSame(dayjs(dateFrom), 'day') : true;
                    const condition5 = (!srchStartDate && srchEndDate) ? dayjs(value["6"], "DD/MM/YYYY").isSame(dayjs(dateTo), 'day') : true;
                    const condition6 = (srchStartDate && srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").isSameOrAfter(dayjs(srchStartDate), 'day') && dayjs(value["6"], "DD/MM/YYYY").isSameOrBefore(dayjs(srchEndDate), 'day') : true;
                    return condition1 && condition2 && condition3 && condition4 && condition5 && condition6
                }) || [];

                const filteredExitValue = dataTemp.exitValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);
                    let dateFrom: any = srchStartDate;
                    let dateTo: any = srchEndDate;
                    const condition1 = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const condition2 = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const condition3 = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                    const condition4 = (srchStartDate && !srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").isSame(dayjs(dateFrom), 'day') : true;
                    const condition5 = (!srchStartDate && srchEndDate) ? dayjs(value["6"], "DD/MM/YYYY").isSame(dayjs(dateTo), 'day') : true;
                    const condition6 = (srchStartDate && srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").isSameOrAfter(dayjs(srchStartDate), 'day') && dayjs(value["6"], "DD/MM/YYYY").isSameOrBefore(dayjs(srchEndDate), 'day') : true;
                    return condition1 && condition2 && condition3 && condition4 && condition5 && condition6
                }) || [];

                return {
                    ...booking,
                    data_temp: JSON.stringify({
                        ...dataTemp,
                        entryValue: filteredEntryValue,
                        exitValue: filteredExitValue,
                    }),
                };
            });

            settk(!tk);
        }
    }

    const getData = (data: any) => {
        const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === data?.trim());
        return filter_contract_point
    }

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
         

        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
                return (
                    item?.status_capacity_request_management_process?.name?.toLowerCase().includes(queryLower) ||
                    item?.term_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.submitted_timestamp)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // formatDate(item?.submitted_timestamp)?.toLowerCase().includes(queryLower) ||
                    formatTime(item?.submitted_timestamp)?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.contract_start_date)?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.contract_end_date)?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.terminate_date)?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.extend_deadline)?.toLowerCase().includes(queryLower) ||
                    item?.group?.id_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.type_account?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.status_capacity_request_management?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
         
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [firstColStat, setFirstColStat] = useState<any>([]);
    const [userData, setUserData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContractTermType, setDataContractTermType] = useState<any>([]);

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/capacity/capacity-request-management`);
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            const res_stat = await getService(`/master/capacity/status-capacity-request-management-process`);
            const res_contract_point = await getService(`/master/asset/contract-point`);

            setDataContract(res_contract_point);
            setFirstColStat(res_stat)
            setDataShipper(res_shipper_name)

            // กรองข้อมูล shipper ที่ตรงกับตัว login
            let filter_contract_only_shipper: any = []
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                filter_contract_only_shipper = response?.filter((item: any) => {
                    return item?.group_id === userDT?.account_manage?.[0]?.group_id
                })
                setData(filter_contract_only_shipper);
                setFilteredDataTable(filter_contract_only_shipper);
            } else {
                setData(response);
                setFilteredDataTable(response);
            }

             
            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        getPermission();
        setUserData(userDT?.account_manage?.[0]);
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [modalMsg, setModalMsg] = useState<any>("");

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);

    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    // ############### MODAL SUBMISSION COMMENTS ###############
    const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    const [dataSubmission, setDataSubmission] = useState<any>([]);

    const openSubmissionModal = (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
         
        // setDataSubmission(filtered)
        setDataSubmission(filtered ?? data)
        setMdSubmissionView(true)
    };

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAllFileModal = (id?: any, data?: any) => {
        setDataFile(data || dataTable?.find((item: any) => item?.id == id));
        setMdFileView(true)
        settk(!tk);
    };

    // ############### MODE SHOW DATA ###############
    // 1 = table, 2 = path detail
    const [divMode, setDivMode] = useState<any>("1");

    const filterData = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        // setDataFile(filteredData)
        return filteredData
    }

    const handlePathDetail = (id?: any, data?: any) => {
        setDataFile(data || dataTable?.find((item: any) => item?.id == id))
        setDivMode('2');
    };

    // const handleContractClick = (id?: any) => {
    const handleContractClick = (id?: any, row?: any) => { // โยน row เข้ามาด้วยเลย เดิมเอาแค่ id ไป filter

        // let data = filterData(id);
        let data = row;
        setDataContractTermType(data?.term_type)
        setDataFile(data)
         
        setDivMode('3');

    };

    // ############### MODAL IMPORT ###############
    const [mdImportOpen, setMdImportOpen] = useState<any>(false);

    const handleOpenImport = () => {
        setMdImportOpen(true);
    };

    // ############### MODAL BOOKING VERSION COMMENT ###############
    const [mdCommentOpen, setMdCommentOpen] = useState<any>(false);
    const [bookingVersionComment, setBookingVersionComment] = useState<any>([]);
    const [commentLog, setCommentLog] = useState<any>([]);

    const handleCommentModal = (data?: any) => {
        setBookingVersionComment(data)
        setMdCommentOpen(true);
    };

    // ############### EXPAND MAIN ###############
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const handleExpand = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // ############### EXPAND ENTRY EXIT ###############
    const [expandedEntryExit, setExpandedEntryExit] = useState<any>(null);
    const handleExpandEntryExit = (id: any) => {
        setExpandedEntryExit(expandedEntryExit === id ? null : id);
    };

    // ############### BUTTON MODE ORIGINAL BOOK, SUMMARY BOOK ###############
    const [selectedButton, setSelectedButton] = useState<any>(''); // year
    const handleButtonClick = (buttonType: any) => {
        setSelectedButton(buttonType);
    };


    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    const paginatedData = Array.isArray(filteredDataTable)
        ? filteredDataTable.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
        : [];

    const present_date = new Date();
    const [isExtendEnabled, setIsExtendEnabled] = useState(false);

    useEffect(() => {
        if (!dataFile || Object.keys(dataFile).length === 0) {
            // No data in dataFile
            return;
        }

        {/* "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี */ }
        let shadowDate: any;
        if (dataFile?.file_period_mode === 1) shadowDate = addDays(present_date, dataFile?.shadow_time);
        if (dataFile?.file_period_mode === 2) shadowDate = addMonths(present_date, dataFile?.shadow_time);
        if (dataFile?.file_period_mode === 3) shadowDate = addYears(present_date, dataFile?.shadow_time);

        // ถ้ามี extend_deadline ใช้ซะ, ถ้าไม่มีก็ใช้ contract_end_date
        const comparisonDate = dataFile?.extend_deadline ? parseISO(dataFile?.extend_deadline) : parseISO(dataFile?.contract_end_date);

        // Enable button if shadowDate < comparisonDate
        setIsExtendEnabled(isBefore(shadowDate, comparisonDate));
    }, [dataFile]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'contract_type', label: 'Contract Type', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'submitted_ts', label: 'Submitted Timestamp', visible: true },
        { key: 'contract_start_date', label: 'Contract Start Date', visible: true },
        { key: 'contract_end_date', label: 'Contract End Date', visible: true },
        { key: 'terminate_date', label: 'Terminate Date', visible: true },
        { key: 'extend_deadline', label: 'Extend Deadline', visible: true },
        { key: 'id_name', label: 'Shipper ID', visible: true },
        { key: 'name', label: 'Shipper Name', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'contract_status', label: 'Contract Status', visible: true },
        { key: 'update_contract_status', label: 'Update Contract Status', visible: true },
        { key: 'submission_comment', label: 'Submission Comment', visible: userData?.user_type_id == 3 ? false : true },
        { key: 'file', label: 'File', visible: true },
        { key: 'path_detail', label: 'Path Detail', visible: userData?.user_type_id == 3 ? false : true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // List > เฉพาะ Shipper จะไม่เห็น Column Submission Comment และ Path Detail https://app.clickup.com/t/86eqy9nt5
    const adjustedColumns = userData?.user_type_id == 3 ? initialColumns.filter((column: any) => !['submission_comment', 'path_detail'].includes(column.key)) : initialColumns;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        // Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
        Object.fromEntries(adjustedColumns.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(adjustedColumns.map((column: any) => [column.key, column.visible])))
    }, [userData])

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### COLUMN SHOW/HIDE ###############
    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));
    const initialColumnsDynamicEntry: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'pressure_range', label: 'Pressure Range', visible: true },
        { key: 'temperature_range', label: 'Temperature Range', visible: true },
        { key: 'period', label: 'Period', visible: true },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/d)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/h)', visible: true },
        { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMscfd)', visible: true },
        { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMscfh)', visible: true },
    ];

    const initialColumnsDynamicExit: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'pressure_range', label: 'Pressure Range', visible: true },
        { key: 'temperature_range', label: 'Temperature Range', visible: true },
        { key: 'period', label: 'Period', visible: true },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/d)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/h)', visible: true },
    ];

    const [initialColumnsDynamicEntry_New, setinitialColumnsDynamicEntry_New] = useState([
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'pressure_range', label: 'Pressure Range', visible: true },
        { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        { key: 'temperature_range', label: 'Temperature Range', visible: true },
        { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/d)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/h)', visible: true },
        { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMscfd)', visible: true },
        { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMscfh)', visible: true },
    ]);

    const [initialColumnsDynamicExit_New, setinitialColumnsDynamicExit_New] = useState([
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'pressure_range', label: 'Pressure Range', visible: true },
        { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        { key: 'temperature_range', label: 'Temperature Range', visible: true },
        { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/d)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/h)', visible: true },
        // { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMscfd)', visible: true },
        // { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMscfh)', visible: true },
    ]);

    const [columnVisibilityEntry, setColumnVisibilityEntry] = useState(generateColumnVisibility(initialColumnsDynamicEntry));
    const [columnVisibilityExit, setColumnVisibilityExit] = useState(generateColumnVisibility(initialColumnsDynamicExit));
    const [columnVisibilityEntry_New, setColumnVisibilityEntry_New] = useState(generateColumnVisibility(initialColumnsDynamicEntry_New));
    const [columnVisibilityExit_New, setColumnVisibilityExit_New] = useState(generateColumnVisibility(initialColumnsDynamicExit_New));

    const [anchorElEntry, setAnchorElEntry] = useState<null | HTMLElement>(null);
    const openEntry = Boolean(anchorElEntry);

    const [anchorElExit, setAnchorElExit] = useState<null | HTMLElement>(null);
    const openExit = Boolean(anchorElExit);

    const handleTogglePopoverEntry = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElEntry(anchorElEntry ? null : event.currentTarget);
    };

    const handleTogglePopoverExit = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElExit(anchorElExit ? null : event.currentTarget);
    };

    const handleColumnToggleEntry = (columnKey: string) => {
        setColumnVisibilityEntry((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleColumnToggleExit = (columnKey: string) => {
        setColumnVisibilityExit((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleColumnToggleEntry_New = (columnKey: string) => {
        let dataFilter: any = initialColumnsDynamicEntry_New;
        let filterCheckedparent: any = dataFilter?.filter((f: any) => f?.parent_id == columnKey);
        let checkAboutParant: any = dataFilter?.find((f: any) => f?.key == columnKey);
        if (filterCheckedparent?.length > 0) {
            for (let index = 0; index < filterCheckedparent?.length; index++) {
                let findIDX: any = dataFilter?.find((fx: any) => fx?.key == filterCheckedparent[index]?.key);
                if (findIDX) {
                    setColumnVisibilityEntry_New((prev: any) => ({
                        ...prev,
                        [findIDX?.key]: !prev[columnKey]
                    }));
                }
            }
        }

        if (checkAboutParant?.parent_id) {
            let getParent: any = checkAboutParant?.parent_id;
            let findAboutParent: any = columnVisibilityEntry_New[getParent];
            let findAboutThis: any = columnVisibilityEntry_New[columnKey];
            let filterAboutParent: any = dataFilter?.filter((f: any) => f?.parent_id == getParent);
            if (findAboutParent == true) {
                let checkedParentFalse: any = 0;
                for (let index = 0; index < filterAboutParent?.length; index++) {
                    let checkedItem: any = columnVisibilityEntry_New[filterAboutParent[index]?.key];
                    if (filterAboutParent[index]?.key == columnKey) {
                        checkedParentFalse = findAboutThis == true ? checkedParentFalse + 1 : checkedParentFalse;
                    } else {
                        checkedParentFalse = checkedItem == false ? checkedParentFalse + 1 : checkedParentFalse;
                    }
                }

                if (checkedParentFalse == filterAboutParent?.length) {
                    setColumnVisibilityEntry_New((prev: any) => ({
                        ...prev,
                        [getParent]: !prev[getParent]
                    }));
                }
            } else if (findAboutParent == false && findAboutThis == false) {
                setColumnVisibilityEntry_New((prev: any) => ({
                    ...prev,
                    [getParent]: !prev[getParent]
                }));
            }
        }

        setColumnVisibilityEntry_New((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
        settk(!tk);
    };

    const handleColumnToggleExit_New = (columnKey: string) => {
        let dataFilter: any = initialColumnsDynamicExit_New;
        let filterCheckedparent: any = dataFilter?.filter((f: any) => f?.parent_id == columnKey);
        let checkAboutParant: any = dataFilter?.find((f: any) => f?.key == columnKey);
        if (filterCheckedparent?.length > 0) {
            for (let index = 0; index < filterCheckedparent?.length; index++) {
                let findIDX: any = dataFilter?.find((fx: any) => fx?.key == filterCheckedparent[index]?.key);
                if (findIDX) {
                    setColumnVisibilityExit_New((prev: any) => ({
                        ...prev,
                        [findIDX?.key]: !prev[columnKey]
                    }));
                }
            }
        }

        if (checkAboutParant?.parent_id) {
            let getParent: any = checkAboutParant?.parent_id;
            let findAboutParent: any = columnVisibilityExit_New[getParent];
            let findAboutThis: any = columnVisibilityExit_New[columnKey];
            let filterAboutParent: any = dataFilter?.filter((f: any) => f?.parent_id == getParent);
            if (findAboutParent == true) {
                let checkedParentFalse: any = 0;
                for (let index = 0; index < filterAboutParent?.length; index++) {
                    let checkedItem: any = columnVisibilityExit_New[filterAboutParent[index]?.key];
                    if (filterAboutParent[index]?.key == columnKey) {
                        checkedParentFalse = findAboutThis == true ? checkedParentFalse + 1 : checkedParentFalse;
                    } else {
                        checkedParentFalse = checkedItem == false ? checkedParentFalse + 1 : checkedParentFalse;
                    }
                }

                if (checkedParentFalse == filterAboutParent?.length) {
                    setColumnVisibilityExit_New((prev: any) => ({
                        ...prev,
                        [getParent]: !prev[getParent]
                    }));
                }
            } else if (findAboutParent == false && findAboutThis == false) {
                setColumnVisibilityExit_New((prev: any) => ({
                    ...prev,
                    [getParent]: !prev[getParent]
                }));
            }
        }

        setColumnVisibilityExit_New((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
        settk(!tk);
    };

    const handleExportByVersion = async (version: any,) => {
        try {
            const res_edit = await downloadService(`/master/capacity/capacity-request-management-download/${version?.id}`, '', `${dataFile?.contract_code || ''}_${version?.version || ''}.xlsx`);
        } catch (error) {

        }
    };


    // v1.0.90 Contract Management Filter รายการใน Contract detail ให้แสดง Zone/Area/Contract Point เฉพาะที่เกี่ยวข้องกับ Contract นั้น https://app.clickup.com/t/86errdagg
    const [dataZoneMaster, setDataZoneMaster] = useState<any>([]);
    const [dataAreaMaster, setDataAreaMaster] = useState<any>([]);
    const [dataContractMaster, setDataContractMaster] = useState<any>([]);

    useEffect(() => {
        // if (dataFile || Object?.keys(dataFile)?.length === 0) {
        // if (dataFile || Object?.keys(dataFile)?.length === 0) {

        // if (!dataFile || Object.keys(dataFile).length === 0) {
        if (dataFile) {
            const areaTextsInUse = new Set(dataFile?.booking_version?.flatMap((version: any) => version.booking_row_json)?.map((row: any) => row.area_text));
            const filteredAreaMasterData = areaMaster?.data?.filter((area: any) => areaTextsInUse.has(area.name));
            setDataAreaMaster(filteredAreaMasterData)

            const zoneTextsInUse = new Set(dataFile?.booking_version?.flatMap((version: any) => version.booking_row_json)?.map((row: any) => row.zone_text));
            // const filteredZoneMasterData = zoneMaster?.data?.filter((item: any) => zoneTextsInUse.has(item.name));
            const seenZone = new Set<string>();
            const filteredZoneMasterData = zoneMaster?.data?.filter((item: any) => {
                const name = item.name;
                if (zoneTextsInUse.has(name) && !seenZone.has(name)) {
                    seenZone.add(name);
                    return true;
                }
                return false;
            });
            setDataZoneMaster(filteredZoneMasterData)

            const contractPointTextsInUse = new Set(dataFile?.booking_version?.flatMap((version: any) => version.booking_row_json)?.map((row: any) => row.contract_point));
            const filteredContractPointMasterData = contractPointData?.data?.filter((item: any) => contractPointTextsInUse.has(item.contract_point));
            setDataContractMaster(filteredContractPointMasterData)

        }
    }, [dataFile])

    // { key: 'status', label: 'Status', visible: true },
    // { key: 'contract_type', label: 'Contract Type', visible: true },
    // { key: 'contract_code', label: 'Contract Code', visible: true },
    // { key: 'submitted_ts', label: 'Submitted Timestamp', visible: true },
    // { key: 'contract_start_date', label: 'Contract Start Date', visible: true },
    // { key: 'contract_end_date', label: 'Contract End Date', visible: true },
    // { key: 'terminate_date', label: 'Terminate Date', visible: true },
    // { key: 'extend_deadline', label: 'Extend Deadline', visible: true },
    // { key: 'id_name', label: 'Shipper ID', visible: true },
    // { key: 'name', label: 'Shipper Name', visible: true },
    // { key: 'type', label: 'Type', visible: true },
    // { key: 'contract_status', label: 'Contract Status', visible: true },
    // { key: 'update_contract_status', label: 'Update Contract Status', visible: true },
    // { key: 'submission_comment', label: 'Submission Comment', visible: userData?.user_type_id == 3 ? false : true },
    // { key: 'file', label: 'File', visible: true },
    // { key: 'path_detail', label: 'Path Detail', visible: userData?.user_type_id == 3 ? false : true },

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "status",
                // header: "Status",
                header: () => (
                    <div className="text-center w-full">Status</div>
                ),
                width: 180,
                enableSorting: true,
                accessorFn: (row: any) => row?.status_capacity_request_management_process?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management_process?.color) }}>{row?.status_capacity_request_management_process?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "contract_type",
                header: "Contract Type",
                width: 120,
                enableSorting: true,
                accessorFn: (row: any) => row?.term_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            {row?.term_type &&
                                <div className="flex min-w-[180px] max-w-[250px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>
                                    {`${row?.term_type?.name}`}
                                </div>
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "contract_code",
                header: "Contract Code",
                enableSorting: true,
                width: 200,
                accessorFn: (row: any) => row?.contract_code || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span
                                // onClick={() => handleContractClick(row?.id)}
                                onClick={() => handleContractClick(row?.id, row)}
                                className="cursor-pointer underline text-[#1473A1]"
                            >
                                {row?.contract_code || '-'}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "submitted_ts",
                header: "Submitted Timestamp",
                enableSorting: true,
                accessorFn: (row: any) => formatDate(row?.submitted_timestamp) || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.submitted_timestamp ? formatDate(row?.submitted_timestamp) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "contract_start_date",
                header: "Contract Start Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.contract_start_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.contract_start_date ? formatDateNoTime(row?.contract_start_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "contract_end_date",
                header: "Contract End Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.contract_end_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-[#0DA2A2]">{row?.contract_end_date ? formatDateNoTime(row?.contract_end_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "terminate_date",
                header: "Terminate Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.terminate_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-[#0DA2A2]">{row?.terminate_date ? formatDateNoTime(row?.terminate_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "extend_deadline",
                header: "Extend Deadline",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.extend_deadline) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-[#0DA2A2]">{row?.extend_deadline ? formatDateNoTime(row?.extend_deadline) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "id_name",
                header: "Shipper ID",
                enableSorting: true,
                width: 150,
                accessorFn: (row: any) => row?.group?.id_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group && row?.group?.id_name}</div>)
                }
            },
            {
                accessorKey: "name",
                header: "Shipper Name",
                enableSorting: true,
                width: 150,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group && row?.group?.name}</div>)
                }
            },
            {
                accessorKey: "type",
                header: "Type",
                width: 100,
                enableSorting: true,
                accessorFn: (row: any) => row?.type_account?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.type_account?.color) }}>{row?.type_account?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "contract_status",
                header: "Contract Status",
                width: 150,
                enableSorting: true,
                accessorFn: (row: any) => row?.status_capacity_request_management?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management?.color) }}>{row?.status_capacity_request_management?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "submission_comment",
                header: "Submission Comment",
                width: 200,
                align: 'center',
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <div className="flex justify-center items-center">
                            <div className="relative inline-block text-left ">
                                <BtnDetailTable
                                    openSubmissionModal={(id: any) => openSubmissionModal(id, row)}
                                    row_id={row?.id}
                                    disable={getPermission?.f_view == true ? false : true}
                                />
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "file",
                header: "File",
                align: 'center',
                accessorFn: (row) => row?.file_capacity_request_management?.length || '',
                enableSorting: false,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <div
                            className="inline-flex items-center justify-center relative"
                            onClick={() => {
                                if (getPermission?.f_view == true) {
                                    openAllFileModal(row?.id, row)
                                }
                            }}
                        >
                            <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                disabled={getPermission?.f_view == true ? false : true}
                            >
                                <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.file_capacity_request_management?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "path_detail",
                header: "Path Detail",
                width: 100,
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <div
                            className="w-full flex items-center justify-center relative"

                        >
                            <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#809F2C66] relative"
                                disabled={getPermission?.f_view == true ? false : true}
                                onClick={() => handlePathDetail(row?.id, row)}
                            >
                                <TimelineRoundedIcon sx={{ fontSize: 18, color: '#809F2C', '&:hover': { color: '#ffffff' } }} />
                            </button>
                        </div>
                    )
                }
            },
        ], []
    )

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            const updatedUserPermission = generateUserPermission(user_permission);
            permission = updatedUserPermission;
        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    useEffect(() => {
        if (dataPeriod?.length > 0) {
            setSrchPeriod(dataPeriod?.[0]?.value)
        }
    }, [dataPeriod])

    return (
        <div className=" space-y-2">

            {/* MAIN TABLE */}
            {divMode === "1" && (
                <>
                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                            <DatePickaSearch
                                key={"start" + key}
                                label="Contract Start Date"
                                placeHolder="Select Contract Start Date"
                                allowClear
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                            />

                            <DatePickaSearch
                                key={"end" + key}
                                label="Contract End Date"
                                placeHolder="Select Contract End Date"
                                allowClear
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                            />

                            {/* <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                value={srchShipper}
                                onChange={(e) => setSrchShipper(e.target.value)}
                                // options={dataShipper?.map((item: any) => ({
                                //     value: item?.id?.toString(),
                                //     label: item.name
                                // }))}
                                options={dataShipper
                                    ?.filter((item: any) => {
                                        return userDT?.account_manage?.[0]?.user_type_id !== 3 || item.id === userDT?.account_manage?.[0]?.group?.id;
                                    })
                                    .map((item: any) => ({
                                        value: item?.id?.toString(),
                                        label: item.name,
                                    }))
                                }
                            /> */}

                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                value={srchShipper}
                                onChange={(e) => setSrchShipper(e.target.value)}
                                // options={dataShipper?.map((item: any) => ({
                                //     value: item?.id?.toString(),
                                //     label: item.name
                                // }))}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        // value: item.name,
                                        value: item.id_name,
                                        label: item.name,
                                    }))
                                }
                            />

                            <InputSearch
                                id="searchContractCode"
                                label="Contract Code"
                                type="select"
                                value={srchContractCode}
                                onChange={(e) => setSrchContractCode(e.target.value)}
                                options={dataTable?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item?.contract_code
                                }))}
                            />

                            <InputSearch
                                id="searchTermType"
                                label="Contract Type"
                                type="select"
                                value={srchTermType}
                                onChange={(e) => setSrchTermType(e.target.value)}
                                options={termTypeMaster?.data?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchContractStatus"
                                label="Contract Status"
                                type="select"
                                value={srchContractStatus}
                                onChange={(e) => setContractStatus(e.target.value)}
                                options={statCapReqMgn?.data?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchStatus"
                                label="Status"
                                type="select"
                                value={srchStatus}
                                onChange={(e) => setSrchStatus(e.target.value)}
                                options={firstColStat?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchType"
                                label="Type"
                                type="select"
                                value={srchType}
                                onChange={(e) => setSrchType(e.target.value)}
                                options={[
                                    { value: "1", label: "Manual" },
                                    // { value: "2", label: "PTT" },
                                    { value: "3", label: "TPA Website" },
                                ]}
                                placeholder="Select Type"
                            />

                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                        </aside>
                        <aside className="mt-auto ml-1 w-full sm:w-auto">
                            {/* <div className="flex flex-wrap gap-2 justify-end">
                                <BtnGeneral textRender={"Sync"} bgcolor={"#00ADEF"} modeIcon={'sync'} generalFunc={handleOpenSync} can_sync={userPermission ? userPermission?.f_create : false} />
                            </div> */}
                        </aside>
                    </div>

                    {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
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
                                    <BtnExport textRender={"Export"} data={filteredDataTable} path="capacity/capacity-contract-list" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                                </div>
                            </div>
                        </div>

                        <TableCapContractList
                            openSubmissionModal={openSubmissionModal}
                            openAllFileModal={openAllFileModal}
                            handlePathDetail={handlePathDetail}
                            handleContractClick={handleContractClick}
                            columnVisibility={columnVisibility}
                            tableData={paginatedData}
                            isLoading={isLoading}
                            userPermission={userPermission}
                        />
                    </div>

                    <PaginationComponent
                        totalItems={filteredDataTable?.length}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    /> */}

                    {/* ================== NEW TABLE ==================*/}
                    <AppTable
                        data={filteredDataTable}
                        columns={columns}
                        isLoading={isLoading}
                        // isTableLoading={istrLoading}
                        exportBtn={
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="capacity/capacity-contract-list"
                                can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                    />
                </>
            )}

            {/* PATH DETAIL */}
            {divMode === "2" && (
                <div>
                    <div
                        className="text-[#464255] px-4 font-bold cursor-pointer pb-4"
                        onClick={() => setDivMode("1")}
                    >
                        <ArrowBackIos style={{ fontSize: "14px" }} />{` Back`}
                    </div>

                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                            <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-[30px]">
                                {/* Contract Code */}
                                <div className="flex flex-col">
                                    <p className="!text-[14px] font-bold text-[#58585A]">{`Contract Code`}</p>
                                    <p className="!text-[14px] font-light text-[#757575]">{dataFile?.contract_code || ''}</p>
                                </div>

                                <div className="flex flex-col">

                                    <InputSearch
                                        id="searchPeriod"
                                        placeholder="Select period From - To"
                                        label={<span className="!font-bold !text-[#58585A]">{"Period From - To"}</span>}
                                        type="select"
                                        value={srchPeriod}
                                        customWidth={200}
                                        onChange={(e) => setSrchPeriod(e.target.value)}
                                        sortOptionBy="desc"
                                        options={dataPeriod ?
                                            dataPeriod?.map((item: any) => ({
                                                value: item.value,
                                                label: item.label,
                                            }))
                                            : []
                                        }
                                    />
                                </div>

                                <div className="grid justify-center items-center grid-cols-2 gap-2 ml-[-20px]">
                                    <BtnSearch handleFieldSearch={handleFieldSearchPathDetail} />
                                    <BtnReset handleReset={handleReset} />
                                </div>
                            </section>
                        </aside>
                    </div>

                    {/* <div className="border-[#DFE4EA] border-[1px] p-4 mt-4 rounded-xl shadow-sm">
                        <div>
                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                <TuneIcon
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                                <div className="flex flex-wrap gap-2 justify-end">
                                   
                                </div>
                            </div>
                        </div>

                        <TablePathDetail
                            // tableData={dataPathDetail}
                            tableData={dataFile}
                            dataPeriod={dataPeriod}
                            setDataPeriod={setDataPeriod}
                            dataPathDetailSearch={dataPathDetailSearch}
                            dataPathDetail={dataPathDetail}
                            setDataPathDetail={setDataPathDetail}
                            isReset={isReset}
                            setIsReset={setIsReset}
                            selectedId={selectedId}
                        />
                    </div> */}

                    {/* เรียกใช้ของหน้า capa management นะ */}
                    <TablePathDetail
                        // tableData={dataPathDetail}
                        tableData={dataFile}
                        dataPeriod={dataPeriod}
                        setDataPeriod={setDataPeriod}
                        dataPathDetailSearch={dataPathDetailSearch}
                        dataPathDetail={dataPathDetail}
                        setDataPathDetail={setDataPathDetail}
                        isReset={isReset}
                        setIsReset={setIsReset}
                        selectedId={selectedId}
                        areaMaster={areaMaster?.data}
                    />

                </div>
            )}

            {/* CLICK ON CONTRACT CODE */}
            {divMode === "3" && (
                <div>
                    <div className="text-[#464255] px-4 text-[14px] font-bold cursor-pointer pb-4">
                        <div onClick={() => setDivMode("1")}>
                            <ArrowBackIos style={{ fontSize: "16px" }} />{` Back`}
                        </div>
                        <div className="w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                            {/* ที่อยู่ปุ่ม */}
                        </div>
                    </div>


                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 mb-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                            <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-4">
                                {/* Contract Code */}
                                <div className="flex flex-col">
                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Code`}</p>
                                    <p className="!text-[14px] font-light text-[#757575]">{dataFile?.contract_code || ''}</p>
                                </div>

                                {/* Shipper Name */}
                                <div className="flex flex-col">
                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Shipper Name`}</p>
                                    <p className="!text-[14px] font-light text-[#757575]">{dataFile?.group?.name || ''}</p>
                                </div>

                                {/* Contract Type */}
                                <div className="flex flex-col">
                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Type`}</p>
                                    <p className="!text-[14px] font-light text-[#757575]">{dataFile?.term_type?.name || ''}</p>
                                </div>
                            </section>
                        </aside>
                    </div>

                    <div className="flex flex-wrap gap-2 pb-2 justify-end pt-2 w-full sm:w-auto">
                        <SearchInput onSearch={handleSearch} />
                    </div>

                    {/* {dataFile && dataFile?.book_capacity_request_management?.map((item: any, index: number) => ( */}
                    {dataFile && dataFile?.booking_version?.map((item: any, index: number) => (
                        <div className="pb-2">
                            <div
                                className={`w-full h-[64px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 ${index === 0 ? 'bg-[#9EE4FF]' : 'bg-[#F3F4F7]'}`}
                                onClick={() => handleExpand(item.id)}
                            >
                                <div className="flex items-center p-2 gap-5">
                                    <span className="text-[#58585A] font-[700] text-[16px] uppercase">{item?.version}</span>

                                    {/* Vertical Divider */}
                                    <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                    <div className="flex flex-col">
                                        <p className="!text-[12px] font-semibold text-[#58585A]">{`Submitted Timestamp`}</p>
                                        <p className="!text-[14px] font-light text-[#58585A]">{item?.submitted_timestamp ? formatDate(item?.submitted_timestamp) : ''}</p>
                                    </div>

                                    {/* Vertical Divider */}
                                    <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                    <div className="flex flex-col">
                                        <p className="!text-[12px] font-semibold text-[#58585A]">{`Contract Start Date`}</p>
                                        <p className="!text-[14px] font-light text-[#58585A]">{item?.contract_start_date ? formatDateNoTime(item?.contract_start_date) : ''}</p>
                                    </div>

                                    {/* Vertical Divider */}
                                    <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                    <div className="flex flex-col">
                                        <p className="!text-[12px] font-semibold text-[#58585A]">{`Contract End Date`}</p>
                                        <p className="!text-[14px] font-light text-[#58585A]">{item?.contract_end_date ? formatDateNoTime(item?.contract_end_date) : ''}</p>
                                    </div>

                                    {/* Vertical Divider */}
                                    <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                    <span className="text-[#58585A] font-light text-[16px]">
                                        {
                                            // <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(dataFile?.type_account?.color) }}>{dataFile?.type_account?.name}</div>
                                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.type_account?.color) }}>{item?.type_account?.name}</div>

                                        }
                                    </span>

                                    {/* Vertical Divider */}
                                    <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                    <span className="text-[#58585A] font-light text-[16px]">
                                        {
                                            // <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(dataFile?.status_capacity_request_management?.color) }}>{dataFile?.status_capacity_request_management?.name}</div>
                                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.status_capacity_request_management?.color) }}>{item?.status_capacity_request_management?.name}</div>
                                        }
                                    </span>
                                </div>

                                {/* Expand Icon on the right side */}
                                <div className="flex items-center pr-2">
                                    {expandedRow === item.id ? (
                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                    ) : (
                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                    )}
                                </div>
                            </div>

                            {/* EXPAND แถบ Version */}
                            {expandedRow === item.id && (
                                <div className="flex mt-2 bg-[#ffffff] h-auto border border-[#DFE4EA] rounded-[8px] p-4 shadow-sm gap-2 flex-col">
                                    {/* First Row with Tooltip and Buttons */}
                                    <div className="flex justify-start items-center w-full">
                                        <div className="flex items-center">
                                            <CustomTooltip
                                                title={
                                                    <div>
                                                        <p className="text-[#464255]">
                                                            <span className="font-semibold">Original : </span>ค่า Capacity Right และรายละเอียดตาม Capacity Right ที่เอาเข้ามาจาก Bulletin หรือ TPA Website
                                                        </p>
                                                        <p className="text-[#464255]">
                                                            <span className="font-semibold">Summary Capacity Right : </span>ค่า Capacity Right ที่ถูกปรับค่ามาจากเมนู Release/UIOLI Summary Management (ยอดจาก Column Confirm Capacity) และค่าจากนี้ จะส่งไปที่เมนู Tariff และเมนูอื่นๆ ที่ต้องใช้ค่า Capacity Right
                                                        </p>
                                                    </div>
                                                }
                                                placement="top-end"
                                                arrow
                                            >
                                                <div className="w-[30px] h-[30px] flex items-center justify-center border border-[#B6B6B6] rounded-lg">
                                                    <InfoOutlinedIcon sx={{ fontSize: 22 }} />
                                                </div>
                                            </CustomTooltip>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 py-2">
                                            <div>
                                                <label
                                                    onClick={() => handleButtonClick('original')}
                                                    className={`w-[220px] ml-2 !h-[46px] ${selectedButton === 'original' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px]`}
                                                >
                                                    {`Original Capacity Right`}
                                                </label>
                                            </div>

                                            <div>
                                                <label
                                                    onClick={() => handleButtonClick('summary')}
                                                    className={`w-[220px] ml-2 !h-[46px] ${selectedButton === 'summary' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px]`}
                                                >
                                                    {`Summary Capacity Right`}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {
                                        // TAB ORIGINAL CAPACITY RIGHT
                                        selectedButton === 'original' && <div>
                                            <div className="flex pb-2">
                                                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                                                    <DatePickaSearch
                                                        key={"start" + key}
                                                        label="Start Date"
                                                        placeHolder="Select Start Date"
                                                        allowClear
                                                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                    />

                                                    <DatePickaSearch
                                                        key={"end" + key}
                                                        label="End Date"
                                                        placeHolder="Select End Date"
                                                        allowClear
                                                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                                    />

                                                    <InputSearch
                                                        id="searchZone"
                                                        label="Zone"
                                                        type="select"
                                                        value={srchZone}
                                                        // onChange={(e) => setSrchZone(e.target.value)}
                                                        onChange={(e) => {
                                                            setSrchZone(e.target.value);
                                                            setSrchArea('')
                                                        }}
                                                        options={dataZoneMaster?.map((item: any) => ({
                                                            // value: item?.id?.toString(),
                                                            value: item.name,
                                                            label: item.name
                                                        }))}
                                                    />

                                                    <InputSearch
                                                        id="searchArea"
                                                        label="Area"
                                                        type="select"
                                                        value={srchArea}
                                                        onChange={(e) => setSrchArea(e.target.value)}
                                                        options={dataAreaMaster
                                                            ?.filter((item: any) => srchZone ? item.zone.name === srchZone : true)
                                                            .map((item: any) => ({
                                                                value: item.name,
                                                                label: item.name,
                                                            }))
                                                        }
                                                    />

                                                    <InputSearch
                                                        id="searchContractPoint"
                                                        label="Contract Point"
                                                        type="select"
                                                        value={srchContractCode}
                                                        onChange={(e) => setSrchContractCode(e.target.value)}
                                                        options={dataContractMaster?.filter((item: any) => item.area.name === srchArea)
                                                            .map((item: any) => ({
                                                                value: item.contract_point,
                                                                label: item.contract_point,
                                                            }))
                                                        }
                                                    />

                                                    <BtnSearch handleFieldSearch={() => handleSearchMotherTable(item, 'entry')} />
                                                    <BtnReset handleReset={() => handleSearchMotherTable(item, 'entry', 'reset')} />

                                                    <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                                                        <BtnGeneral
                                                            textRender={"Comment"}
                                                            iconNoRender={true}
                                                            bgcolor={"#00ADEF"}
                                                            disable={
                                                                (dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) && true
                                                            }
                                                            generalFunc={() => handleCommentModal(item)}
                                                            can_create={userPermission ? userPermission?.f_view : false}
                                                        />
                                                        <BtnGeneral
                                                            bgcolor={"#24AB6A"}
                                                            modeIcon={'export'}
                                                            textRender={"Export"}
                                                            generalFunc={() => handleExportByVersion(item)}
                                                            can_export={userPermission ? userPermission?.f_view : false}
                                                        />
                                                    </div>
                                                </aside>
                                            </div>

                                            {/* ENTRY แถบเขียว ๆ */}
                                            <div
                                                className={`w-full h-[58px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#C8FFD7] `}
                                                onClick={() => handleExpandEntryExit("entry" + item.id)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Entry</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "entry" + item.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {
                                                expandedEntryExit === "entry" + item.id && (
                                                    <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                        <div className="p-2">
                                                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                <div onClick={handleTogglePopoverEntry}>
                                                                    <TuneIcon
                                                                        className="cursor-pointer rounded-lg"
                                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-2">
                                                            <FatherTable
                                                                // columnVisibility={columnVisibilityEntry}
                                                                columnVisibility={columnVisibilityEntry_New}
                                                                setcolumnVisibility={setColumnVisibilityEntry_New}
                                                                initialColumnsDynamic={initialColumnsDynamicEntry_New}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicEntry_New}

                                                                dataTable={item}
                                                                mode={'entry'}
                                                                originOrSum={'ORIGINAL'}
                                                                dataContractTermType={dataContractTermType}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            {/* EXIT แถบเหลือง ๆ */}
                                            <div
                                                className={`w-full h-[58px] mt-2 border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#FFF3C8] `}
                                                onClick={() => handleExpandEntryExit("exit" + item.id)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Exit</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "exit" + item.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {
                                                expandedEntryExit === "exit" + item.id && (
                                                    <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                        <div className="p-2">
                                                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                <div onClick={handleTogglePopoverExit}>
                                                                    <TuneIcon
                                                                        className="cursor-pointer rounded-lg"
                                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-2">
                                                            <FatherTable
                                                                // columnVisibility={columnVisibilityExit}
                                                                columnVisibility={columnVisibilityExit_New}
                                                                setcolumnVisibility={setColumnVisibilityExit_New}
                                                                initialColumnsDynamic={initialColumnsDynamicExit_New}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicExit_New}

                                                                dataTable={item}
                                                                mode={'exit'}
                                                                originOrSum={'ORIGINAL'}
                                                                dataContractTermType={dataContractTermType}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    }

                                    {
                                        // TAB SUMMARY CAPACITY RIGHT (EDIT ไม่ได้)
                                        selectedButton === 'summary' && <div>
                                            <div className="flex pb-2">
                                                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                                                    <DatePickaSearch
                                                        key={"start" + key}
                                                        label="Start Date"
                                                        placeHolder="Select Start Date"
                                                        allowClear
                                                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                    />

                                                    <DatePickaSearch
                                                        key={"end" + key}
                                                        label="End Date"
                                                        placeHolder="Select End Date"
                                                        allowClear
                                                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                                    />

                                                    <InputSearch
                                                        id="searchZone"
                                                        label="Zone"
                                                        type="select"
                                                        value={srchZone}
                                                        onChange={(e) => setSrchZone(e.target.value)}
                                                        // options={zoneMaster?.data?.map((item: any) => ({
                                                        //     // value: item?.id?.toString(),
                                                        //     value: item.name,
                                                        //     label: item.name
                                                        // }))}
                                                        options={dataZoneMaster?.map((item: any) => ({
                                                            // value: item?.id?.toString(),
                                                            value: item.name,
                                                            label: item.name
                                                        }))}
                                                    />

                                                    <InputSearch
                                                        id="searchArea"
                                                        label="Area"
                                                        type="select"
                                                        value={srchArea}
                                                        onChange={(e) => setSrchArea(e.target.value)}
                                                        options={areaMaster?.data
                                                            ?.filter((item: any) => item.zone.name === srchZone)
                                                            .map((item: any) => ({
                                                                value: item.name,
                                                                label: item.name,
                                                            }))
                                                        }
                                                    />

                                                    <InputSearch
                                                        id="searchContractPoint"
                                                        label="Contract Point"
                                                        type="select"
                                                        value={srchContractCode}
                                                        onChange={(e) => setSrchContractCode(e.target.value)}
                                                        options={dataContract?.filter((item: any) => item.area.name === srchArea)
                                                            .map((item: any) => ({
                                                                value: item.contract_point,
                                                                label: item.contract_point,
                                                            }))
                                                        }
                                                    />

                                                    <BtnSearch handleFieldSearch={() => handleSearchMotherTable(item, 'entry')} />
                                                    <BtnReset handleReset={() => handleSearchMotherTable(item, 'entry', 'reset')} />

                                                    {/* <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                                                        <BtnGeneral textRender={"Comment"} iconNoRender={true} bgcolor={"#00ADEF"} generalFunc={() => handleCommentModal(item)} />
                                                        <BtnGeneral textRender={"Export"} iconNoRender={true} bgcolor={"#24AB6A"} />
                                                    </div> */}

                                                    <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                                                        <BtnGeneral
                                                            textRender={"Comment"}
                                                            iconNoRender={true}
                                                            bgcolor={"#00ADEF"}
                                                            disable={
                                                                (dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) && true
                                                            }
                                                            generalFunc={() => handleCommentModal(item)}
                                                            can_create={userPermission ? userPermission?.f_create : false}
                                                        />
                                                        <BtnGeneral bgcolor={"#24AB6A"} modeIcon={'export'} textRender={"Export"} generalFunc={() => handleExportByVersion(item)} can_export={userPermission ? userPermission?.f_export : false} />
                                                        {/* <BtnExport textRender={"Export"} data={filteredDataTable} path="capacity/capacity-contract-management" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} /> */}
                                                    </div>
                                                </aside>
                                            </div>

                                            {/* ENTRY แถบเขียว ๆ */}
                                            <div
                                                className={`w-full h-[58px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#C8FFD7] `}
                                                // onClick={() => handleExpandEntryExit("entry" + item.id, 'entry')}
                                                onClick={() => handleExpandEntryExit("entry" + item.id)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Entry</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "entry" + item.id ? (
                                                        // {expandedEntry === "entry" + item.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {
                                                expandedEntryExit === "entry" + item.id && (
                                                    // expandedEntry === "entry" + item.id && (
                                                    <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                        <div className="p-2">
                                                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                <div onClick={handleTogglePopoverEntry}>
                                                                    <TuneIcon
                                                                        className="cursor-pointer rounded-lg"
                                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-2">
                                                            <FatherTable
                                                                // columnVisibility={columnVisibilityEntry}
                                                                columnVisibility={columnVisibilityEntry_New}
                                                                setcolumnVisibility={setColumnVisibilityEntry_New}
                                                                initialColumnsDynamic={initialColumnsDynamicEntry_New}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicEntry_New}

                                                                dataTable={item}
                                                                mode={'entry'}
                                                                originOrSum={'SUMMARY'}
                                                                dataContractTermType={dataContractTermType}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            {/* EXIT แถบเหลือง ๆ */}
                                            <div
                                                className={`w-full h-[58px] mt-2 border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#FFF3C8] `}
                                                // onClick={() => handleExpandEntryExit("exit" + item.id, 'exit')}
                                                onClick={() => handleExpandEntryExit("exit" + item.id)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Exit</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "exit" + item.id ? (
                                                        // {expandedExit === "exit" + item.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {
                                                expandedEntryExit === "exit" + item.id && (
                                                    // expandedExit === "exit" + item.id && (
                                                    <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                        <div className="p-2">
                                                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                <div onClick={handleTogglePopoverExit}>
                                                                    <TuneIcon
                                                                        className="cursor-pointer rounded-lg"
                                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="p-2">
                                                            <FatherTable
                                                                // columnVisibility={columnVisibilityExit}
                                                                columnVisibility={columnVisibilityExit_New}
                                                                setcolumnVisibility={setColumnVisibilityExit_New}
                                                                initialColumnsDynamic={initialColumnsDynamicExit_New}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicExit_New}

                                                                dataTable={item}
                                                                mode={'exit'}
                                                                originOrSum={'SUMMARY'}
                                                                dataContractTermType={dataContractTermType}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    }
                                </div>
                            )}
                        </div>
                    ))}

                    <ContractDetail
                        data={dataFile}
                        dataContract={dataContractTermType}
                        getBack={() => setDivMode("1")}
                        handleSearch={handleSearch}
                        zoneMaster={dataZoneMaster}
                        areaMaster={dataAreaMaster}
                        contractMaster={dataContractMaster}
                        permission={userPermission}
                    />

                </div>
            )}

            <ModalSubmissionDetails
                data={dataSubmission}
                open={mdSubmissionView}
                onClose={() => {
                    setMdSubmissionView(false);
                }}
            />

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
                            {/* {"Data sync failed."} */}
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalFiles
                data={dataFile}
                // dataGroup={dataGroup}
                setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                open={mdFileView}
                onClose={() => {
                    setMdFileView(false);
                }}
            />

            <ModalBkComment
                data={bookingVersionComment}
                dataLog={commentLog}
                dataMain={dataFile}
                setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                setCommentLog={setCommentLog}
                open={mdCommentOpen}
                onClose={() => {
                    setMdCommentOpen(false);
                }}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumns}
                initialColumns={adjustedColumns}
            />

            {/* <ColumnVisibilityPopover
                open={openEntry}
                anchorEl={anchorElEntry}
                setAnchorEl={setAnchorElEntry}
                columnVisibility={columnVisibilityEntry}
                handleColumnToggle={handleColumnToggleEntry}
                // initialColumns={initialColumns}
                initialColumns={initialColumnsDynamicEntry}
            />

            <ColumnVisibilityPopover
                open={openExit}
                anchorEl={anchorElExit}
                setAnchorEl={setAnchorElExit}
                columnVisibility={columnVisibilityExit}
                handleColumnToggle={handleColumnToggleExit}
                // initialColumns={initialColumns}
                initialColumns={initialColumnsDynamicExit}
            /> */}

            {/* <ColumnVisibilityPopover */}
            <ColumnVisibilityPopoverMT
                open={openEntry}
                anchorEl={anchorElEntry}
                setAnchorEl={setAnchorElEntry}
                // columnVisibility={columnVisibilityEntry}
                columnVisibility={columnVisibilityEntry_New}
                // handleColumnToggle={handleColumnToggleEntry}
                handleColumnToggle={handleColumnToggleEntry_New}
                // initialColumns={initialColumns}
                initialColumns={initialColumnsDynamicEntry_New}
            />

            {/* <ColumnVisibilityPopover */}
            <ColumnVisibilityPopoverMT
                open={openExit}
                anchorEl={anchorElExit}
                setAnchorEl={setAnchorElExit}
                // columnVisibility={columnVisibilityExit}
                columnVisibility={columnVisibilityExit_New}
                // handleColumnToggle={handleColumnToggleExit}
                handleColumnToggle={handleColumnToggleExit_New}
                // initialColumns={initialColumns}
                // initialColumns={initialColumnsDynamicExit}
                initialColumns={initialColumnsDynamicExit_New}
            />

        </div>
    );
};

export default ClientPage;