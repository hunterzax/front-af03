"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { anonymizeEmail, fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, iconButtonClass, maskLastFiveDigits, toDayjs } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, postServiceNoAuth, postServiceNoAuthNo, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import ModalRole from "./form/modalRole";
import ModalUpdateStat from "./form/modalUpdateStat";
import ModalReason from "./form/modalReason";
import ModalPassword from "./form/modalPassword";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import ModalSummary from "./form/modalSummary";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import TemplateMail from '@/components/other/rendermailTemplate';
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData, encryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn, sortingByDateFn } from "@/components/table/AppTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import { ColumnDef } from "@tanstack/react-table";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import { Popover } from "@mui/material";
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import getUserValue from "@/utils/getuserValue";
import UserTable from "@/components/table/UserTable";
import dayjs from "dayjs";

const LOGIN_PAGE_URL = process.env.NEXT_PUBLIC_API_URL_LOGIN_PAGE

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const [globalFilter, setGlobalFilter] = useState("");

    const [tikPage, settikPage] = useState(false)

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('User', userDT)
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
    const { userTypeMaster } = useFetchMasters();
    // const dispatch = useAppDispatch();
    // const userTypeMaster = useSelector((state: RootState) => state.usertype);
    // useEffect(() => {
    //     if (!userTypeMaster?.data) {
    //         dispatch(fetchUserType());
    //     }
    // }, [dispatch, userTypeMaster]);

    // ############### FIELD SEARCH ###############
    const [srchUserId, setSrchUserId] = useState('');
    const [srchUserName, setSrchUserName] = useState('');
    const [srchUserType, setSrchUserType] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchType, setSrchType] = useState<any>([]);
    const [srchLginMode, setSrchLginMode] = useState<any>([]);
    const [isFieldSearch, setIsFieldSearch] = useState<boolean>(false);

    // const handleFieldSearch = () => {
    //     const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate);
    //     const result_2 = res_filtered_date?.filter((item: any) => {
    //         return (
    //             (srchUserId ? item?.user_id?.toLowerCase().includes(srchUserId.toLowerCase()) : true) &&
    //             (srchUserName ? item?.first_name?.toLowerCase().includes(srchUserName.toLowerCase()) : true) &&

    //             (srchLginMode ? item?.account_manage[0]?.mode_account?.id == srchLginMode : true) &&

    //             (srchUserType?.length > 0 ? srchUserType.includes(item?.account_manage[0]?.user_type?.id?.toString()) : true) &&
    //             (srchType?.length > 0 ? srchType.includes(item?.type_account?.id?.toString()) : true)
    //         );
    //     });

    //     let resultFinal: any;
    //     if (smartquery?.length > 0) {
    //         resultFinal = result_2?.filter((item: any) => {
    //             const queryLower = smartquery?.replace(/\s+/g, '')?.toLowerCase().trim();
    //             return (
    //                 item?.email?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.account_manage[0]?.group?.name?.replace(/\s+/g, '')?.toLowerCase().includes(queryLower) ||
    //                 item?.account_manage?.[0]?.account_role?.[0].role?.name?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
    //                 item?.account_manage?.[0]?.division?.division_name?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
    //                 item?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

    //                 formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDateTimeSec(item?.start_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDateTimeSec(item?.end_date)?.toLowerCase().includes(queryLower) ||

    //                 formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
    //                 item?.updated_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.updated_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
    //                 item?.updated_by_account?.first_name && item?.updated_by_account?.last_name && (item?.updated_by_account?.first_name + item?.updated_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

    //                 formatTime(item?.login_logs?.[0]?.create_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDate(item?.login_logs?.[0]?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

    //                 item?.telephone?.toLowerCase().includes(queryLower) ||
    //                 item?.address?.toLowerCase().includes(queryLower) ||
    //                 item?.type_account?.name?.toLowerCase().includes(queryLower) ||
    //                 item?.user_id?.toLowerCase().includes(queryLower) ||
    //                 item?.detail?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
    //             );
    //         });
    //     } else {
    //         resultFinal = result_2
    //     }

    //     setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    //     setFilteredDataTable(resultFinal);
    //     setsmartSearchDataTable(resultFinal);
    //     settk(!tk);
    // };

    const handleFieldSearch = async (offset?: any, limit?: any) => {
        setIsFieldSearch(true)
        setIsLoading(false)

        const qTrim = (globalFilter ?? '').toString().trim();
        const queryLower = qTrim.toLowerCase()//.replace(/\s+/g, '');
       console.log('0');
        let url = `/master/account-manage/account?limit=${limit}&offset=${offset}${globalFilter ? `&q=${queryLower}` : ''}`

        if (srchUserId) {
            url += `&q=${srchUserId}`
        }

        if (srchUserName) {
            url += `&firstName=${srchUserName}`
        }

        if (srchUserType?.length > 0) {
            url += `&userType=${srchUserType}`
        }

        if (srchStartDate) {
            url += `&startDate=${dayjs(srchStartDate).format('YYYY-MM-DD')}`
        }

        if (srchEndDate) {
            url += `&endDate=${dayjs(srchEndDate).format('YYYY-MM-DD')}`
        }

        if (srchType?.length > 0) {
            url += `&type=${srchType}`
        }

        if (srchLginMode) {
            url += `&loginMode=${srchLginMode}`
        }

        try {
            const response: any = await getService(url);
            setDataTotal(response?.total)

            let data_res_user = response?.data?.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            let newData: any = [];

            for (let index = 0; index < data_res_user?.length; index++) {
                let findRole: any = data_res_user[index]?.account_manage[0]?.account_role[0]?.role;
                newData.push({
                    ...data_res_user[index],
                    role: findRole,
                    role_default: findRole?.name,
                    company: data_res_user[index]?.account_manage[0]?.group,
                    company_name: data_res_user[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user[index]?.account_manage[0]?.user_type,
                    division: data_res_user[index]?.account_manage[0]?.division,
                    division_name: data_res_user[index]?.account_manage[0]?.division?.division_name,
                    // start_date: data_res_user[index]?.start_date ? formatDateNoTime(data_res_user[index]?.start_date) : null,
                    // end_date: data_res_user[index]?.end_date ? formatDateNoTime(data_res_user[index]?.end_date) : null,
                })
            }

            setData(newData);
            setsmartSearchDataTable(newData)
            setFilteredDataTable(newData);
            // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
            // setCurrentPage(limit); // ตอน filter กลับไปหน้าแรก
            settk(!tk);
            setIsLoading(true);

        } catch (error) {

        }
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [smartSearchDataTable, setsmartSearchDataTable] = useState<any>([]);
    const [smartquery, setsmartquery] = useState<string>('');

    const handleReset = () => {
        setSrchUserId('');
        setSrchUserName('');
        setSrchUserType([]);
        setSrchUserName('');
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchType([]);
        setSrchLginMode('');

        setCurrentPage(1);
        fetchData(0, itemsPerPage);
        // setFilteredDataTable(dataTable);

        setKey((prevKey) => prevKey + 1);
        settk(!tk);
        setIsFieldSearch(false)

        if (smartquery?.length > 0) {
            handleSmartSearch(smartquery);
        } else {
            setsmartSearchDataTable(dataTable)
        }
    };

    const handleSmartSearch = (query: string) => {

        setsmartquery(query);

        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                (srchUserId ? item?.user_id?.toLowerCase().includes(srchUserId.toLowerCase()) : true) &&
                (srchUserName ? item?.first_name?.toLowerCase().includes(srchUserName.toLowerCase()) : true) &&
                (srchUserType ? item?.account_manage[0]?.user_type?.id == srchUserType : true) &&
                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true) &&
                (srchType ? item?.type_account?.id == srchType : true) &&
                (srchLginMode ? item?.account_manage[0]?.mode_account?.id == srchLginMode : true)
            );
        });

        const filtered = result_2?.filter((item: any) => {
            const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
            return (
                item?.email?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.account_manage[0]?.group?.name?.replace(/\s+/g, '')?.toLowerCase().includes(queryLower) ||
                item?.account_manage?.[0]?.account_role?.[0].role?.name?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                item?.account_manage?.[0]?.division?.division_name?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                item?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
                formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower) ||
                formatDateTimeSec(item?.start_date)?.toLowerCase().includes(queryLower) ||
                formatDateTimeSec(item?.end_date)?.toLowerCase().includes(queryLower) ||

                formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
                formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                item?.updated_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.updated_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
                item?.updated_by_account?.first_name && item?.updated_by_account?.last_name && (item?.updated_by_account?.first_name + item?.updated_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

                formatTime(item?.login_logs?.[0]?.create_date)?.toLowerCase().includes(queryLower) ||
                formatDate(item?.login_logs?.[0]?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

                item?.telephone?.toLowerCase().includes(queryLower) ||
                item?.address?.toLowerCase().includes(queryLower) ||
                item?.type_account?.name?.toLowerCase().includes(queryLower) ||
                item?.user_id?.toLowerCase().includes(queryLower) ||
                item?.detail?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                // (item?.user_id?.toLowerCase().includes(srchUserId.toLowerCase())) ||
                // (srchUserName ? item?.first_name?.toLowerCase().includes(srchUserName.toLowerCase()) : true) ||
                // (srchUserType ? item?.account_manage[0]?.user_type?.id == srchUserType : true)
                // (srchType ? item?.type_account?.id == srchType : true) ||
                // (srchLginMode ? item?.account_manage[0]?.mode_account?.id == srchLginMode : true)
            );
        });

        setsmartSearchDataTable(filtered);
        settk(!tk);
    };

    // cyberpunk
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const DEBOUNCE_MS = 350; // ปรับได้ เป็น ms

    const handleSearch = (query: string, currentPage_?:any) => {
        // เคลียร์งานเดิมก่อนเสมอ
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }
        setIsLoading(false)

        typingTimerRef.current = setTimeout(async () => {
            const qTrim = query.toString().trim();
            const queryLower = qTrim.toLowerCase()//.replace(/\s+/g, '');

            // ถ้า query ว่าง ให้รีเซ็ตผลและหยุด
            // if (!qTrim) {
            //     setCurrentPage(1);
            //     // setFilteredDataTable(dataTable ?? []);
            //     setIsLoading(true);
            //     return;
            // }
            let newOffset = currentPage_ ? (currentPage_ - 1) * itemsPerPage : (currentPage - 1) * itemsPerPage;
            console.log('2');
            const response: any = await getService(`/master/account-manage/account?limit=${itemsPerPage}&offset=${newOffset}&q=${queryLower}`);
            const responseAll: any = await getService(`/master/account-manage/account?limit=${1000}&offset=${0}&q=${queryLower}`);
           
            setDataTotal(response?.total)

            let data_res_user = response?.data?.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            let newData: any = [];

            for (let index = 0; index < data_res_user?.length; index++) {
                let findRole: any = data_res_user[index]?.account_manage[0]?.account_role[0]?.role;
                newData.push({
                    ...data_res_user[index],
                    role: findRole,
                    role_default: findRole?.name,
                    company: data_res_user[index]?.account_manage[0]?.group,
                    company_name: data_res_user[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user[index]?.account_manage[0]?.user_type,
                    division: data_res_user[index]?.account_manage[0]?.division,
                    division_name: data_res_user[index]?.account_manage[0]?.division?.division_name,
                    // start_date: data_res_user[index]?.start_date ? formatDateNoTime(data_res_user[index]?.start_date) : null,
                    // end_date: data_res_user[index]?.end_date ? formatDateNoTime(data_res_user[index]?.end_date) : null,
                })
            }

            setData(newData);
            setsmartSearchDataTable(newData)
            setFilteredDataTable(newData);
            // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
            // setCurrentPage(limit); // ตอน filter กลับไปหน้าแรก
            settk(!tk);
            setIsLoading(true);

            // ----- export -----
            let data_res_user_ex = responseAll?.data?.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            let newData_ex: any = [];

            for (let index = 0; index < data_res_user_ex?.length; index++) {
                let findRole: any = data_res_user_ex[index]?.account_manage[0]?.account_role[0]?.role;
                newData_ex.push({
                    ...data_res_user_ex[index],
                    role: findRole,
                    role_default: findRole?.name,
                    company: data_res_user_ex[index]?.account_manage[0]?.group,
                    company_name: data_res_user_ex[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user_ex[index]?.account_manage[0]?.user_type,
                    division: data_res_user_ex[index]?.account_manage[0]?.division,
                    division_name: data_res_user_ex[index]?.account_manage[0]?.division?.division_name,
                    // start_date: data_res_user[index]?.start_date ? formatDateNoTime(data_res_user[index]?.start_date) : null,
                    // end_date: data_res_user[index]?.end_date ? formatDateNoTime(data_res_user[index]?.end_date) : null,
                })
            }
            setDataExport(newData_ex || [])
            // ----- export -----


            // หน่วงนิดให้ UI smooth
            setTimeout(() => setIsLoading(true), 150);
        }, DEBOUNCE_MS);
    }

    useEffect(() => {
        console.log('globalFilter : ', globalFilter);
        console.log('itemsPerPage : ', itemsPerPage); 
        setCurrentPage(1);
        handleSearch(globalFilter, 1)
    }, [globalFilter])


    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataTableTotal, setDataTotal] = useState<any>();
    const [dataDivNotUse, setDataDivNotUse] = useState<any>([]);
    const [dataRole, setDataRole] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(true);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchMaster = async () => {
        const response_division = await getService(`/master/account-manage/division-not-use`);
        const response_role = await getService(`/master/account-manage/role-master`);
        setDataDivNotUse(response_division);
        setDataRole(response_role);
    }

    const fetchData = async (offset?: any, limit?: any) => {
        setIsLoading(false);

        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)

            const qTrim = (globalFilter ?? '').toString().trim();
            const queryLower = qTrim.toLowerCase()//.replace(/\s+/g, '');
            console.log('3');
            const response: any = await getService(`/master/account-manage/account?limit=${limit}&offset=${offset}${globalFilter ? `&q=${queryLower}` : ''}`);
            const responseAll: any = await getService(`/master/account-manage/account?limit=${1000}&offset=${0}${globalFilter ? `&q=${queryLower}` : ''}`);
            setDataTotal(response?.total)
            let data_res_user = response?.data?.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            let newData: any = [];

            for (let index = 0; index < data_res_user?.length; index++) {
                let findRole: any = data_res_user[index]?.account_manage[0]?.account_role[0]?.role;
                newData.push({
                    ...data_res_user[index],
                    role: findRole,
                    role_default: findRole?.name,
                    company: data_res_user[index]?.account_manage[0]?.group,
                    company_name: data_res_user[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user[index]?.account_manage[0]?.user_type,
                    division: data_res_user[index]?.account_manage[0]?.division,
                    division_name: data_res_user[index]?.account_manage[0]?.division?.division_name,
                    // start_date: data_res_user[index]?.start_date ? formatDateNoTime(data_res_user[index]?.start_date) : null,
                    // end_date: data_res_user[index]?.end_date ? formatDateNoTime(data_res_user[index]?.end_date) : null,
                })
            }

            setData(newData);
            setsmartSearchDataTable(newData)
            setFilteredDataTable(newData);


            // ----- export -----
            let data_res_user_ex = responseAll?.data?.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            let newData_ex: any = [];
            for (let index = 0; index < data_res_user_ex?.length; index++) {
                let findRole: any = data_res_user_ex[index]?.account_manage[0]?.account_role[0]?.role;
                newData_ex.push({
                    ...data_res_user_ex[index],
                    role: findRole,
                    role_default: findRole?.name,
                    company: data_res_user_ex[index]?.account_manage[0]?.group,
                    company_name: data_res_user_ex[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user_ex[index]?.account_manage[0]?.user_type,
                    division: data_res_user_ex[index]?.account_manage[0]?.division,
                    division_name: data_res_user_ex[index]?.account_manage[0]?.division?.division_name,
                })
            }
            setDataExport(newData_ex || [])
            // ----- export -----

            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        console.log('-');
        fetchMaster();
        fetchData(0, 10);
        getPermission();
    }, [resetForm]);

    const [key, setKey] = useState(0);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [modalSuccessMesage, setModalSuccessMesage] = useState('');
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => {
        setModalSuccessOpen(false)
        setModalSuccessMesage('')
    };
    const [modalSummaryOpen, setModalSummaryOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [dataUserToEdit, setDataUserToEdit] = useState();
    const [dataUserSummary, setDataUserSummary] = useState<any[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<any[]>([]);
    const [selectedDiv, setSelectedDiv] = useState<any[]>([]);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');

    const fdInterface: any = {
        id: '',
        email: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
        detail: '',
        address: '',
        first_name: '',
        last_name: '',
        telephone: '',
        user_id: '',
        status: '',
        mode_account_id: 2,
        division_id: '',
        user_type_id: 0,
        group_id: '',
        role_manage: [],
        account_manage: []
    };

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [formData, setFormData] = useState(fdInterface);

    const [formUpdateData, setFormUpdateData] = useState({
        status: '',
        reason: '',
    });

    // #region update status
    const handleFormSubmitUpdate = async (data: any) => {
        // EXAMPLE
        const dataPost = {
            "account_id": selectedId,
            "status": data.status === "1" ? true : false,
            "reason": data.reason
        }
        await postService('/master/account-manage/account-reason-create', dataPost);
        console.log('- -');
        await fetchData(0, 10);
        setMdStatOpen(false);
        if (resetForm) resetForm();
        setModalSuccessOpen(true);
    }

    // #region handleFormSubmit
    const handleFormSubmit = async (data: any) => {
        const { id, ...newData } = data

        if (newData.end_date == undefined || newData.end_date == "Invalid Date") {
            newData.end_date = null
        }

        if (typeof newData["end_date"] !== 'string') {
            newData["end_date"] = null;
        }
        newData["status"] = newData.status === "1" ? true : false
        let account_manage = {
            // "mode_account_id": newData.mode_account_id,
            "mode_account_id": formMode == 'create' ? 2 : newData.mode_account_id, // ถ้าเป็น create บังคับใส่ 2 == LOCAL
            "division_id": newData.division_id !== '' ? newData.division_id : null,
            "user_type_id": newData.user_type_id && parseInt(newData.user_type_id),
            "group_id": newData.group_id,
        }

        newData["role_manage"] = [{ id: newData.role_manage }]
        // CASE MULTISELECT
        // const transformedRoleManage = newData.role_manage.map((item: any) => ({ id: item }));
        // newData["role_manage"] = transformedRoleManage

        const newData2 = replaceEmptyStringsWithNull(newData)
        let dataPost = {
            ...newData2,
            account_manage: account_manage,
            f_t_and_c: null
        };

        let { mode_account_id, division_id, user_type_id, group_id, email, ...dataPost2 } = dataPost;
        let bypassreset: boolean = true; // เอาไว้สำหรับ ปิด reset form หาก failed || PATH:86er08t20

        switch (formMode) {
            case "create":
                delete dataPost.mode_account_id;
                delete dataPost.division_id;
                delete dataPost.user_type_id;
                delete dataPost.group_id;

                let res_create = await postService('/master/account-manage/account-register', dataPost);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    // setFormOpen(false);
                    bypassreset = false;
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true);
                    setIsModalLoading(false);
                } else {
                    // await handleFormSubmitEmail({ email });
                    setDataUserSummary([res_create, dataPost]);
                    setFormOpen(false);
                    setModalSummaryOpen(true);
                    setModalSuccessMesage('User has been added.')
                    await activateMailSend(email, [res_create, dataPost]);
                }

                break;
            case "edit":
                delete dataPost2.f_t_and_c

                dataPost.account_manage.mode_account_id = dataPost.account_manage.mode_account_id ? parseInt(dataPost.account_manage.mode_account_id, 10) : null;

                dataPost2 = {
                    ...dataPost2,
                    email: email
                }
                let res_update = await putService(`/master/account-manage/account-edit/${selectedId}`, dataPost2);

                let res_update_profile = await getService(`/master/account-manage/account-local-once`);
                // update first_name, last_name
                // v1.0.90 เปลี่ยนชื่อในแล้ว user profile ควรที่จะ update https://app.clickup.com/t/86ernzz0c
                localStorage.setItem("x9f3w1m8q2y0u5d7v1z", encryptData(res_update_profile?.account))

                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                    setIsModalLoading(false);
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                }

                break;
        }
        console.log('- - -');
        await fetchData(0, 10);
        if (resetForm && bypassreset == true) resetForm();

        // Handle form data submission (e.g., send to API, update state)
        // setFormOpen(false); // Close form after submission
    };

    const handleFormSubmitEmail = async (data: any) => {
        const resultLink: any = await postService('/master/account-manage/get-link', data);

        if (resultLink?.link) {
            const bodyMail = await TemplateMail({
                header: "Reset Your Password",
                description: "A request has been received to reset the password for your account. <br/> Please click the button below to reset your password",
                btntxt: "Reset Password",
                url: resultLink?.link,
                mode: "resetmail"
            });

            let body: any = {
                "to": data?.email,
                "subject": "Reset Your Password",
                "body": JSON.parse(bodyMail)
            }

            await postService('/mail/send-email', body);
        }
    };

    const activateMailSend = async (email: any, data: any) => {

        const bodyMail = await TemplateMail({
            header: "Activate Account",
            description: "Activate Account",
            btntxt: "Activate Account",
            url: LOGIN_PAGE_URL,
            mode: "createuser",
            // pwd: "2@!$1231278@#"
            pwd: data?.[0]?.passwordGen
        });


        let body: any = {
            // "to": 'komphakawat@gmail.com',
            "to": email,
            "subject": "Welcome to TPA System",
            "body": JSON.parse(bodyMail)
        }

        const res_mail = await postServiceNoAuthNo('/mail/send-email', body);
    }

    const handleCloseSummary = async () => {
        setModalSummaryOpen(false);
        setModalSuccessOpen(true);
    }

    const openCreateForm = () => {
        setFormMode('create');
        setFormData({
            email: '',
            // start_date: new Date(),
            // end_date: new Date(),
            start_date: undefined,
            end_date: undefined,
            detail: '',
            address: '',
            first_name: '',
            last_name: '',
            telephone: '',
            user_id: '',
            status: '',
            mode_account_id: 2,
            division_id: '',
            user_type_id: 0,
            group_id: '',
            // role_manage: [],
            role_manage: '',
        });
        setFormOpen(true);
    };

    // #region openEditForm
    const openEditForm = (id: any) => {
        const filteredData = dataTable?.find((item: any) => item.id === id);

        setDataUserToEdit(filteredData);
        const existingData: any = {
            login_mode: filteredData?.account_manage[0]?.mode_account?.name,
            mode_account_id: filteredData?.account_manage[0]?.mode_account?.id,
            user_id: filteredData?.user_id,
            // user_type: filteredData?.account_manage[0]?.user_type?.id,
            user_type_id: filteredData?.account_manage[0]?.user_type?.id,
            group_name: filteredData?.account_manage[0]?.group.name,
            division: filteredData?.account_manage[0]?.group?.division,
            role: filteredData?.account_manage[0]?.account_role,
            first_name: filteredData?.first_name,
            last_name: filteredData?.last_name,
            telephone: filteredData?.telephone,
            email: filteredData?.email,
            address: filteredData?.address,
            detail: filteredData?.detail,
            start_date: new Date(filteredData?.start_date),
            end_date: filteredData.end_date ? new Date(filteredData.end_date) : null,
            status: filteredData.status ? "1" : "2",
        };
        setSelectedId(id);

        setFormMode('edit');
        setFormData(existingData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setDataUserToEdit(filteredData);
        const existingData: any = {
            login_mode: filteredData?.account_manage[0]?.mode_account?.name,
            user_id: filteredData?.user_id,
            // user_type: filteredData?.account_manage[0]?.user_type?.id,
            user_type_id: filteredData?.account_manage[0]?.user_type?.id,
            group_name: filteredData?.account_manage[0]?.group.name,
            division: filteredData?.account_manage[0]?.group?.division,
            role: filteredData?.account_manage[0]?.account_role,
            first_name: filteredData?.first_name,
            last_name: filteredData?.last_name,
            telephone: filteredData?.telephone,
            email: filteredData?.email,
            address: filteredData?.address,
            detail: filteredData?.detail,
            start_date: new Date(filteredData?.start_date),
            end_date: filteredData.end_date ? new Date(filteredData.end_date) : null,
            status: filteredData.status ? "1" : "2",
        };

        setFormMode('view');
        setFormData(existingData);
        setFormOpen(true);
        settk(!tk);
    };

    const [dataUser, setDataUser] = useState<any>([]);
    const [dataMdRole, setDataMdRole] = useState<any>([]);
    const [mdRoleOpen, setMdRoleOpen] = useState(false);
    const [mdStatOpen, setMdStatOpen] = useState(false);

    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);

    const [dataPwGen, setDataPwGen] = useState<any>([]);
    const [mdPwGen, setMdPwGen] = useState(false);

    const openRole = (id: any, dataUser: any, dataRole: any) => {
        setSelectedId(id);
        setDataUser(dataUser);
        setDataMdRole(dataRole);
        setMdRoleOpen(true)
    };

    // REASON CREATE
    const openStat = (id: any, dataUser: any) => {
        setSelectedId(id);
        setDataUser(dataUser);
        setMdStatOpen(true)
    };

    // REASON VIEW
    const openReasonModal = (id: any, data: any) => {
        const sortedData = data.sort((a: any, b: any) => {
            const aDayjs = toDayjs(a.create_date)
            const bDayjs = toDayjs(b.create_date)
            if(aDayjs.isValid() && bDayjs.isValid()) {
                return bDayjs.diff(aDayjs)
            }
            return b.id - a.id
        })
        setDataReason(sortedData)
        setMdReasonView(true)
    };

    // Password Generate
    const openPwGen = (id: any, data: any) => {

        data["id"] = id
        setDataPwGen(data)
        setMdPwGen(true)
    };

    // ############### HISTORY MODAL ###############
    const [historyOpen, setHistoryOpen] = useState(false);
    // const handleCloseHistoryModal = () => setHistoryOpen(false);
    const handleCloseHistoryModal = () => {
        setHistoryOpen(false);
        setTimeout(() => {
            setHistoryData(undefined);
        }, 300);
    }
    const [historyData, setHistoryData] = useState<any>();
    const [headData, setHeadData] = useState<any>();


    // #region history
    const openHistoryForm = async (id: any) => {
        try {
            const response: any = await getService(`/master/account-manage/history?type=account&method=all&id_value=${id}`);

            const final_ = response?.map((item: any) => {
                return {
                    ...item,
                    update_by_mod: {
                        first_name: item?.reqUser ? item?.reqUser?.first_name : '',
                        last_name: item?.reqUser ? item?.reqUser?.last_name : '',
                    }
                }
            })

            // const valuesArray = response.map((item: any) => item.value);
            const valuesArray = final_?.map((item: any) => {
                return {
                    ...item.value,
                    update_by_mod: {
                        first_name: item?.update_by_mod ? item?.update_by_mod?.first_name : '',
                        last_name: item?.update_by_mod ? item?.update_by_mod?.last_name : '',
                    }
                }
            });

            let mappings = [
                { key: "user_id", title: "User ID" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                return {
                    title,
                    value: value || "",
                };
            });

            const normalized = fillMissingUpdateByAccount(valuesArray);

            setHeadData(result)
            // setHistoryData(valuesArray);
            setHistoryData(normalized);
            setHistoryOpen(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    // const paginatedData = Array.isArray(filteredDataTable)
    //     ? filteredDataTable.slice(
    //         (currentPage - 1) * itemsPerPage,
    //         currentPage * itemsPerPage
    //     )
    //     : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'login_mode', label: 'Login Mode', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'user_id', label: 'User ID', visible: true },
        { key: 'company_name', label: 'Company/Group Name', visible: true },
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'division_name', label: 'Division Name', visible: true },
        { key: 'first_name', label: 'First Name', visible: true },
        { key: 'last_name', label: 'Last Name', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'role_default', label: 'Role', visible: true },
        { key: 'telephone', label: 'Telephone', visible: true },
        { key: 'email', label: 'Email', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'reason', label: 'Reason', visible: true },
        { key: 'updated_by_account', label: 'Updated by', visible: true },
        { key: 'last_login', label: 'Lasted Login', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'login_mode', label: 'Login Mode', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'id_name', label: 'User ID', visible: true },
        { key: 'company_name', label: 'Company/Group Name', visible: true },
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'division_name', label: 'Division Name', visible: true },
        { key: 'first_name', label: 'First Name', visible: true },
        { key: 'last_name', label: 'Last Name', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'role_default', label: 'Role', visible: true },
        { key: 'telephone', label: 'Telephone', visible: true },
        { key: 'email', label: 'Email', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: any) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            ...columnKey
        }));
    };

    const [tk, settk] = useState(false);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;

            permission = findRoleConfigByMenuName('User', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    const toggleMenu = (mode: any, id: any) => {
        setAnchorPopover(null) // เคส table ใหม่ปุ่ม view ค้าง

        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                setAnchorPopover(null)
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null)
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null)
                break;
        }
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "login_mode",
                accessorFn: (row) => {
                    const mode = row?.account_manage?.[0]?.mode_account?.name;
                    if (!mode) return "";

                    const lower = mode.toLowerCase();

                    // คืนค่าพร้อมรูปแบบที่ user อาจค้นหา
                    return `${lower} ${lower} mode ${lower}mode ${lower} mode`;
                },
                header: "Login Mode",
                align: 'center',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    const generateLowercase: any = row?.account_manage[0]?.mode_account?.name == 'SSO' ? row?.account_manage[0]?.mode_account?.name : row?.account_manage[0]?.mode_account?.name?.toLowerCase();
                    return (
                        <div className="flex justify-start items-center absolute !w-auto" style={{ transform: 'translate(-8px, -13px)' }}>
                            <div
                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255] capitalize"
                                style={{ backgroundColor: row?.status ? row?.account_manage[0]?.mode_account.color : '#EFECEC' }}>{generateLowercase} Mode</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "status",
                header: "Status",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <label className="relative inline-block w-11 h-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={row?.status}
                                    className="sr-only peer"
                                    onClick={() => {
                                        openStatFunc(row?.id, { "user_id": row?.user_id, "company_name": row?.account_manage[0]?.group.name, "first_name": row?.first_name, "last_name": row?.last_name, "status": row?.status })
                                    }}
                                />
                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                            </label>
                        </div>
                    )
                },
            },
            {
                accessorKey: "user_id",
                accessorFn: (row) => row.user_id || '',
                header: "User ID",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    // return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px]`}>{row?.user_id ? row?.user_id : ''}</div>)
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px] whitespace-normal break-all leading-snug`}>
                            {row?.user_id ?? ''}
                        </div>
                    )
                }
            },
            {
                accessorKey: "company_name",
                accessorFn: (row) => row.company?.name || '',
                header: "Group Name",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    // return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.company ? row?.company?.name : ''}</div>)
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px] whitespace-normal break-all leading-snug`}>
                            {row?.company ? row?.company?.name : ''}
                        </div>
                    )
                }
            },
            {
                accessorKey: "user_type",
                accessorFn: (row) => row.user_type?.name || '',
                header: "User Type",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        row?.user_type &&
                        <div
                            className={`flex w-[100px] font-bold bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 bg-opacity-50`}
                            style={{
                                backgroundColor: row?.status ? row?.user_type?.color : '#EFECEC',
                                color: row?.status ? row?.user_type?.color_text : '#9CA3AF'
                            }}
                        >
                            {row?.user_type?.name}
                        </div>
                    )
                }
            },
            {
                accessorKey: "division_name",
                accessorFn: (row) => row.division?.division_name || '',
                header: "Division Name",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.division ? row?.division?.division_name : ''}</div>)
                }
            },
            {
                accessorKey: "first_name",
                accessorFn: (row) => row.first_name || '',
                header: "First Name",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.first_name ? row?.first_name : ''}</div>)
                }
            },
            {
                accessorKey: "last_name",
                accessorFn: (row) => row.last_name || '',
                header: "Last Name",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.last_name ? row?.last_name : ''}</div>)
                }
            },
            {
                accessorKey: "type",
                accessorFn: (row) => row?.user_type ? (row?.type_account?.name || '') : '',
                header: "Type",
                align: 'center',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        row?.user_type &&
                        <div
                            className={`flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 bg-opacity-50`}
                            style={{
                                // backgroundColor: row?.status ? row?.type_account?.color : '#EFECEC',
                                // color: row?.status ? row?.type_account?.color_text : '#9CA3AF'
                                backgroundColor: row?.status ? row?.type_account?.color : '#EFECEC',
                                color: row?.status ? row?.type_account?.color_text : '#9CA3AF'
                            }}
                        >
                            {row?.type_account?.name}
                        </div>
                    )
                }
            },
            {
                accessorKey: "role_default",
                accessorFn: (row) => row.role?.name || '',
                header: "Role",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.role ? row?.role?.name : ''}</div>)
                }
            },
            {
                accessorKey: "telephone",
                header: "Telephone",
                accessorFn: (row) => row?.telephone ? maskLastFiveDigits(row?.telephone) : '',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.telephone ? maskLastFiveDigits(row?.telephone) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "email",
                accessorFn: (row) => row?.email ? anonymizeEmail(row?.email) : '',
                header: "Email",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.email ? anonymizeEmail(row?.email) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "start_date",
                // accessorFn: (row) => row?.start_date ? formatDateTimeSec(row?.start_date) : '',
                accessorFn: (row) => row?.start_date ? formatDateNoTime(row?.start_date) : '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                header: "Start Date",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className={`w-[180px] ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.start_date ? formatDateTimeSec(row?.start_date) : ''}</div>
                        <div className={`w-[180px] ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "end_date",
                // accessorFn: (row) => row?.start_date ? formatDateTimeSec(row?.end_date) : '',
                accessorFn: (row) => row?.start_date ? formatDateNoTime(row?.end_date) : '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                header: "End Date",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className={`w-[180px] ${row?.status ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.end_date ? formatDateTimeSec(row?.end_date) : ''}</div>
                        <div className={`w-[180px] ${row?.status ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "reason",
                header: "Reasons",
                enableSorting: false,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative hover:text-white text-[#1473A1]"
                                onClick={() => openReasonModal(row?.id, row?.account_reason)}
                                disabled={row?.account_reason?.length <= 0 && true}
                            >
                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                            </button> */}

                            <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openReasonModal(row?.id, row?.account_reason)}
                                disabled={row?.account_reason?.length <= 0 && true}
                            >
                                <ChatBubbleOutlineOutlinedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.account_reason?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "updated_by_account",
                accessorFn: (row) => `${`${row?.updated_by_account?.first_name} ` || ''}${row?.updated_by_account?.last_name} ${row?.update_date ? formatDateTimeSec(row?.update_date) : ''}`,
                header: "Updated by",
                width: 250,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.updated_by_account?.first_name} {row?.updated_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "last_login",
                accessorFn: (row) => row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : '',
                sortingFn: (rowA, rowB, columnId) => {

                    if (rowA.original.login_logs?.length < 1 && rowB.original.login_logs?.length < 1) return 0;
                    if (rowA.original.login_logs?.length < 1) return 1; // Valid dates come before nulls
                    if (rowB.original.login_logs?.length < 1) return -1;  // Nulls come before valid dates

                    return sortingByDateFn(rowA.original.login_logs[0]?.create_date, rowB.original.login_logs[0]?.create_date)
                },
                header: "Lasted Login",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "action",
                id: 'actions',
                header: "Action",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={userPermission?.f_view == true && userPermission?.f_edit == true ? false : true}
                        />
                    )
                }
            },
        ],
        [userPermission, user_permission, dataTable]
    );

    const togglePopover = (id: any, anchor: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
            setAnchorPopover(null)
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
            if (anchor) {
                setAnchorPopover(anchor)
            }
            else {
                setAnchorPopover(null)
            }
        }

        settk(!tk)
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
            setAnchorPopover(null)
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    const getRowdata: any = (id: any) => {
        const findData: any = dataTable?.find((item: any) => item?.id == id);
        return findData
    }

    const openPwFunc = (id: any, data: any) => {
        openPwGen(id, { "user_id": id, "company_name": data?.company_name, "name": data?.name, "password_gen_flag": data?.password_gen_flag, "password_gen_origin": data?.password_gen_origin, "email": data?.email });
        setOpenPopoverId(null);
        setAnchorPopover(null) // เคส table ใหม่ปุ่ม view ค้าง
    }

    const openStatFunc = (id: any, data: any) => {
        openStat(id, { "user_id": data?.user_id, "company_name": data?.company_name, "first_name": data?.first_name, "last_name": data?.last_name, "status": data?.status });
        setOpenPopoverId(null);
        setAnchorPopover(null) // เคส table ใหม่ปุ่ม view ค้าง
    }

    // ############### PAGINATION ###############
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        let newOffset = (currentPage - 1) * itemsPerPage;
        // console.log('isFieldSearch : ', isFieldSearch);
        // console.log('tikPage : ', tikPage);
        if (isFieldSearch || !tikPage) {
            handleFieldSearch(newOffset, itemsPerPage);
        } else {
            if(tikPage){
                fetchData(newOffset, itemsPerPage);
                settikPage(false)
            }
        }
        setIsLoading(false)
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable) // ที่ใช้ยังงี้เพราะของที่ได้มาจาก service มันทำ pagination อยู่แล้ว
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                {/* <button type="button" onClick={() => testrenderMail()}>test</button> */}

                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <InputSearch
                        id="searchUserId"
                        label="User ID"
                        value={srchUserId}
                        onChange={(e) => setSrchUserId(e.target.value)}
                        placeholder="Search User ID"
                    />

                    <InputSearch
                        id="searchName"
                        label="First Name"
                        value={srchUserName}
                        onChange={(e) => setSrchUserName(e.target.value)}
                        placeholder="Search Name"
                    />

                    <InputSearch
                        id="searchUserType"
                        label="User Type"
                        type="select-multi-checkbox"
                        value={srchUserType}
                        onChange={(e) => setSrchUserType(e.target.value)}
                        options={[
                            { value: "2", label: "TSO" },
                            { value: "3", label: "Shipper" },
                            { value: "4", label: "Other" },
                        ]}
                        placeholder="Search User Type"
                    />

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
                        id="searchType"
                        label="Type"
                        type="select-multi-checkbox"
                        value={srchType}
                        onChange={(e) => setSrchType(e.target.value)}
                        options={[
                            { value: "1", label: "Manual" },
                            { value: "2", label: "PTT" },
                            { value: "3", label: "TPA Website" },
                        ]}
                        placeholder="Search Type"
                    />

                    <InputSearch
                        id="searchLginMode"
                        label="Login Mode"
                        type="select-multi-checkbox"
                        value={srchLginMode}
                        onChange={(e) => setSrchLginMode(e.target.value)}
                        options={[
                            { value: "1", label: "SSO Mode" },
                            { value: "2", label: "Local Mode" },
                        ]}
                        placeholder="Search Login mode"
                    />

                    {/* <BtnSearch handleFieldSearch={handleFieldSearch} /> */}
                    <BtnSearch handleFieldSearch={() => handleFieldSearch(0, itemsPerPage)} />
                    <BtnReset handleReset={handleReset} />

                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"Add"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div>
                </aside>
            </div>

            {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/users" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>
                <TableUser
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    // tableData={dataTable}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    openReason={openReasonModal}
                    openPwGen={openPwGen}
                    openRole={openRole}
                    openStat={openStat}
                    openReasonModal={openReasonModal}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                />
            </div> */}

            {/* <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

            {/* ================== NEW TABLE ==================*/}
            <UserTable 
                data={paginatedData}
                columns={columns}
                isLoading={isLoading}
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="dam/users"
                        can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                    />
                }
                initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                onFilteredDataChange={(filteredData: any) => {
                    const newData = filteredData || [];
                    // Check if the filtered data is different from current dataExport
                    // if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                    //     setDataExport(newData);
                    // }
                }}
                pagination={pagination}
                setPagination={setPagination}

                currentPage={currentPage}
                itemsPerPage={itemsPerPage}

                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}

                totalItems={dataTableTotal}

                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                fixHeight={true}
                settikPage={settikPage}
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                dataDivNotUse={dataDivNotUse}
                setSelectedCompany={setSelectedCompany}
                setSelectedDiv={setSelectedDiv}
                dataUserToEdit={dataUserToEdit}
                userTypeMasterData={userTypeMaster?.data}
                dataRole={dataRole}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                            setFormData(null);
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                isLoading={isModalLoading}
                setIsLoading={setIsModalLoading}
            />

            <ModalSummary
                dataUser={dataUserSummary}
                // dataRole={dataMdRole}
                open={modalSummaryOpen}
                selectedCompany={selectedCompany}
                selectedDiv={selectedDiv}
                handleClose={handleCloseSummary}
                onClose={() => {
                    setModalSummaryOpen(false);
                    setModalSuccessOpen(true);
                    // if (resetForm) resetForm();
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
            />

            <ModalRole
                dataUser={dataUser}
                dataRole={dataMdRole}
                open={mdRoleOpen}
                onClose={() => {
                    setMdRoleOpen(false);
                }}
            />

            <ModalUpdateStat
                dataUser={dataUser}
                data={formUpdateData}
                // dataRole={dataMdRole}
                open={mdStatOpen}
                // onClose={() => {
                //     setMdStatOpen(false);
                //     if (resetForm) resetForm();
                // }}
                onClose={() => {
                    setMdStatOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                            setDataUser(null);
                        }, 200);
                    }
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
                setResetForm={setResetForm}
            />

            <ModalReason
                data={dataReason}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            <ModalPassword
                data={dataPwGen}
                open={mdPwGen}
                onClose={() => {
                    setMdPwGen(false);
                    fetchData(0, 10);
                    // if (resetForm) resetForm();
                }}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalSuccessMesage ? modalSuccessMesage : "Your changes have been saved."}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="account"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
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
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            <Popover
                id="action-menu-popover"
                open={!!anchorPopover}
                anchorEl={anchorPopover}
                onClose={() => setAnchorPopover(null)}
                anchorOrigin={{
                    vertical: 'center', // เดิม top
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'center', // เดิม top
                    horizontal: 'right', // เดิม left
                }}
                sx={{
                    zIndex: 1300,
                    '& .MuiPaper-root': {
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,.14)',
                        // ขยับออกจากปุ่มไปทางซ้ายอีกเล็กน้อย (ไม่ทับขอบ)
                        transform: 'translateX(-8px)'
                    }
                }}
                className="z-50"
            >
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                        }
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", openPopoverId) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                        }
                        {
                            userPermission?.f_edit &&
                            <li
                                className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    openStatFunc(openPopoverId, { "user_id": getRowdata(openPopoverId)?.user_id, "company_name": getRowdata(openPopoverId)?.account_manage[0]?.group.name, "first_name": getRowdata(openPopoverId)?.first_name, "last_name": getRowdata(openPopoverId)?.last_name, "status": getRowdata(openPopoverId)?.status })
                                }}>
                                <CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Update User Status
                            </li>
                        }
                        {
                            (userPermission?.f_view && getRowdata(openPopoverId)?.account_manage[0]?.mode_account?.id == 2) &&
                            <li
                                className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    openPwFunc(openPopoverId, { "company_name": getRowdata(openPopoverId)?.account_manage[0]?.group.name, "name": `${getRowdata(openPopoverId)?.first_name + ' ' + getRowdata(openPopoverId)?.last_name}`, "password_gen_flag": getRowdata(openPopoverId)?.password_gen_flag, "password_gen_origin": getRowdata(openPopoverId)?.password_gen_origin, "email": getRowdata(openPopoverId)?.email })
                                }}
                            >
                                <VpnKeyOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Password
                            </li>
                        }
                    </ul>
                </div>
            </Popover>

        </div>
    )
}

export default ClientPage;