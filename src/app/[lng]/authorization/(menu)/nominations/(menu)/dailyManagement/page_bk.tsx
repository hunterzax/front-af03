import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { filterActiveToday, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatTime, generateUserPermission, toDayjs } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import ModalFiles from "./form/modalFiles";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import ModalComment from "./form/modalComment";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import TableNomDailyMgn from "./form/table";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import NomCodeView from "./nomCodeView/nomCodeView";
import ModalAcceptReject from "./form/modalAcceptReject";
import { useSearchParams } from "next/navigation";
import dayjs from 'dayjs';

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    const [dataTable, setData] = useState<any>([]);
    const [IsSearchClick, setIsSearchClick] = useState<boolean>(false)

    // route มาจาก nomination dashboard
    const searchParams = useSearchParams();
    const filter_gas_day_from_somewhere_else: any = searchParams.get("filter_gas_day");
    const filter_contract_code_from_somewhere_else: any = searchParams.get("contract_code");
    const filter_group_id_from_somewhere_else: any = searchParams.get("group_id");

    const f_filter_gas_day: any = searchParams.get("filter_gas_day");
    const f_contract_code: any = searchParams.get("contract_code");
    const f_group_id: any = searchParams.get("group_id");


    const status_from_somewhere_else = searchParams.get("status");
    const [useParams, setuseParams] = useState<boolean>(false);

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    // ############### CHECK ว่ามาจากหน้า nomination dashboard ป่าว ###############
    const [dashboardObj, setDashboardObj] = useState<any>();

    // ############### REDUX DATA ###############
    const { nominationTypeMaster, nominationStatMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    // ############### MODAL SUBMISSION COMMENTS ###############
    const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    const [dataSubmission, setDataSubmission] = useState<any>([]);

    // ############### MODE SHOW DATA ###############
    // 1 = table, 2 = nomination code view
    const [divMode, setDivMode] = useState<any>('1'); // 1 == table, 2 == nom_code click

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState<any>(f_group_id ? [Number(f_group_id)] : []);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchStatus, setSrchStatus] = useState<any>([]);

    const [srchTypeDocument, setSrchTypeDocument] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(f_filter_gas_day ? dayjs(f_filter_gas_day).toDate() : toDayjs().add(1, 'day').toDate());
    const [logsrchDate, setlogsrcDate] = useState<any>();
    const [srchCheckbox, setSrchCheckbox] = useState(false);

    // ############# RE-GENERATE  #############
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

    // ############### DATA TABLE ###############
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataMasterZone, setDataMasterZone] = useState<any>([]);
    const [dataNomDeadline, setDataNomDeadline] = useState<any>([]);
    const [dataConceptPoint, setDataConceptPoint] = useState<any[]>([]);

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [dataTableTotal, setDataTotal] = useState<any>();

    // 
    const getAboutDT = async (offset?: any, limit?: any) => {

        let searchDayjs = toDayjs(srchStartDate);
        const searchDate = searchDayjs.format("YYYY-MM-DD");

        let selectdate = toDayjs(srchStartDate).format("YYYY-MM-DD");
        if (srchStartDate && searchDate != 'Invalid Date') {
            selectdate = searchDate;
        } else if (filter_gas_day_from_somewhere_else) {
            const date_from = dayjs(filter_gas_day_from_somewhere_else).toDate();
            setSrchStartDate(new Date(date_from))
            selectdate = toDayjs(new Date(date_from)).format("YYYY-MM-DD");
        }

        const newOffset = offset - 1;

        const getContractID = (options: any) => {
            const find = options?.map((item: any) => {
                const result = dataContractOriginal?.find((f: any) => item == f?.contract_code)
                return result
            })

            return find
        }

        const contractID = getContractID(srchContractCode)?.map((item: any) => item?.id);

        const body = {
            nomination_type_id: 1,
            offset: newOffset,
            limit: limit,
            gas_day: selectdate,
            shipper_id_arr: srchShipper,
            contract_id_arr: contractID?.length > 0 ? contractID : [],
            status_id_arr: srchStatus?.length > 0 ? srchStatus.map(Number) : [],
            search: ""
        }
        const res_api: any = await postService(`/master/query-shipper-nomination-file/v2`, body);
        return res_api
    }

    const renderOption = (response: any) => {
        let contract_code_search: any = filter_contract_code_from_somewhere_else

        const contractCodeId = contract_code_search

        // DATA GROUP
        // เอา List > Filter Shipper Name ให้กรองมาเฉพาะ Shipper ที่มีอยู่ในหน้านี้ https://app.clickup.com/t/86erwpj4q
        const uniqueGroups = Array.from(
            new Map(response?.map((item: any) => [item.group.id, item.group])).values()
        );

        if (logsrchDate !== srchStartDate || srchShipper?.length == 0) {
            setDataShipper(uniqueGroups);
        }

        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            setDataShipper([userDT?.account_manage?.[0]?.group]) // https://app.clickup.com/t/86ewwu518 ที่มา set ยังงี้เพราะ master ที่เอาไว้ทำ option มันได้มาจากข้อมูล ถ้าไม่มี ชื่อ shipper จะไม่ขึ้น
            setSrchShipper([userDT?.account_manage?.[0]?.group?.id])
        }

        type Pair = [string, any];
        const uniqueContract = (() => {
            const pairs: Pair[] = (response ?? [])
                .map((item: any): Pair | null => {
                    const reservebalCode = item?.reserve_balancing_gas_contract?.res_bal_gas_contract;
                    const ccCode = item?.contract_code?.contract_code;

                    // ถ้ามี reserve_balancing ให้ใช้เป็น priority ก่อน 
                    if (reservebalCode) {
                        return [String(reservebalCode), { contract_code: reservebalCode }];
                    }
                    // ถ้าไม่มี reserve แต่มี contract_code ก็ใช้ตัวนั้น
                    if (ccCode) {
                        return [String(ccCode), item?.contract_code];
                    }
                    return null;
                })
                .filter((p: any): p is Pair => !!p);

            return Array.from(new Map<string, any>(pairs).values());
        })();

        setDataContract(uniqueContract);
        if (logsrchDate !== srchStartDate || srchContractCode?.length == 0) {
            setDataContractOriginal(uniqueContract)
        }

        if (contractCodeId && uniqueContract?.some((item: any) => item.id == Number(contractCodeId))) {
            setSrchContractCode(contractCodeId)
        }

        setlogsrcDate(srchStartDate)
    }

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Daily Management', userDT)
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

    useEffect(() => {
        getPermission();
    }, [])

    useEffect(() => {
        const storedDashboard = localStorage.getItem("nom_dashboard_route_obj");
        const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

        if (dashboardObject) {

            // มาถึง filter เสร็จสรรพ ลบทิ้งเลย
            localStorage.removeItem("nom_dashboard_route_obj")
            setDashboardObj(dashboardObject)

            let formattedGasDay = new Date(toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD"));

            setSrchStartDate(formattedGasDay)
        }
    }, [dataTable])

    useEffect(() => {

        if (forceRefetch || !nominationTypeMaster?.data) {
            dispatch(fetchNominationType());
        }
        if (forceRefetch || !nominationStatMaster?.data) {
            dispatch(fetchNominationType());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
    }, [dispatch, forceRefetch, nominationTypeMaster, nominationStatMaster]); // Watch for forceRefetch changes

    const handleGetMaster = async () => {
        // DATA NOMINATION DEADLINE
        const res_nom_deadline: any = await getService(`/master/parameter/nomination-deadline`);

        // type weekly, user_type == userDT
        // process_type -> "Validity response of renomination" กับ "Management" 
        // process_type = "Validity response of renomination" ใช้กับ row ที่ renom = yes
        // process_type = "Management" ใช้กับ row ที่ renom = no
        let filtered_nom_daily = res_nom_deadline?.filter((item: any) => item?.nomination_type_id == 1) // เอาแค่ type daily 

        // filter USER TYPE
        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            filtered_nom_daily = res_nom_deadline?.filter((item: any) => (item?.process_type_id === 2 || item?.process_type_id === 4) && item?.nomination_type_id == 1 && item?.user_type?.id !== 3)
        } else {
            filtered_nom_daily = res_nom_deadline?.filter((item: any) => (item?.process_type_id === 2 || item?.process_type_id === 4) && item?.nomination_type_id == 1 && item?.user_type?.id == 3)
        }

        // กรอง filtered_nom_daily ที่วันปัจจุบันอยู่ในช่วง start_date และ end_date
        const activeNomDaily = filterActiveToday(filtered_nom_daily);
        setDataNomDeadline(activeNomDaily)

        // DATA ZONE
        const res_zone: any = await getService(`/master/asset/zone`);
        setDataMasterZone(res_zone)
    }

    useEffect(() => {
        // แก้เรื่อง refresh หน้ามาแล้วค้างข้อมูลเดิม
        localStorage.removeItem("h593stkin2xqa9m");
    }, [])

    const handleFieldSearch = async () => {

        setIsLoading(false)
        handleGetMaster();
        // กรณีที่ Filter ไว้แล้วกดเข้าไปในรายละเอียด เมื่อกดกลับมาที่หน้า List จะต้องค้าง Filter เดิมอยู่ (ปัจจุบันระบบจะ Reset Filter แล้วกลายเป็น Default Filter) https://app.clickup.com/t/86etzcgta
        setIsSearchClick(true)
        let filter_keep = {
            "gas_day": srchStartDate,
            "shipper_name": srchShipper,
            "contract_code": srchContractCode,
            "status": srchStatus,
            "check_box": srchCheckbox,
        }
        localStorage.setItem("h593stkin2xqa9m", JSON.stringify(filter_keep));

        let localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
        if (filter_gas_day_from_somewhere_else) {
            const date_from = dayjs(filter_gas_day_from_somewhere_else).toDate();
            setSrchStartDate(new Date(date_from))
            localDate = toDayjs(new Date(date_from)).format("YYYY-MM-DD");
        }

        // 🔥 DATA MAIN -- original 🔥
        // let url = '/master/query-shipper-nomination-file?nomination_type_id=1';
        // if (srchStartDate) {
        //     url += `&gas_day=${localDate}`;
        // }
        // const response: any = await getService(url);

        const res_api = await getAboutDT(currentPage, itemsPerPage)
        const response = res_api?.data;
        setDataTotal(res_api?.total);

        // const response: any = await getService(url);
        // let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 1) // 1 == Daily, 2 == Weekly

        // const result_2 = dataTable?.filter((item: any) => {
        const result_2 = response?.filter((item: any) => {
            // const localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
            // const gasDay = toDayjs(item?.gas_day).format("YYYY-MM-DD");

            return (
                // (srchShipper ? item?.group_id == srchShipper : true) &&
                // (srchContractCode ? item?.reserve_balancing_gas_contract ? (item?.reserve_balancing_gas_contract?.res_bal_gas_contract == srchContractCode) : (item?.contract_code?.contract_code == srchContractCode) : true) &&
                // (srchStatus ? item?.query_shipper_nomination_status?.id.toString() == srchStatus : true) &&

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                // (srchShipper?.length > 0 ? srchShipper.includes(item?.group_id) : true) &&
                // (srchContractCode?.length > 0 ? item?.reserve_balancing_gas_contract ? (srchContractCode.includes(item?.reserve_balancing_gas_contract?.res_bal_gas_contract)) : (srchContractCode.include(item?.contract_code?.contract_code)) : true) &&
                // (srchStatus?.length > 0 ? srchStatus.includes(item?.query_shipper_nomination_status?.id.toString()) : true) &&

                // (!srchCheckbox || (item?.submission_comment_query_shipper_nomination_file?.length > 0)) &&
                (srchCheckbox ? item?.submission_comment_query_shipper_nomination_file?.length > 0 : true) &&
                // (srchContractCode ? item?.contract_code?.id.toString() == srchContractCode : true) &&
                // (srchTypeDocument ? item?.nomination_type?.name == srchTypeDocument : true) &&
                // (srchStartDate ? localDate == gasDay : true) &&
                (filter_contract_code_from_somewhere_else ? item?.contract_code?.id.toString() == filter_contract_code_from_somewhere_else : true) &&
                (filter_group_id_from_somewhere_else ? item?.group_id?.toString() == filter_group_id_from_somewhere_else : true)
            );
        });

        await renderOption(response)

        setCurrentPage(1)
        setData(result_2);
        setFilteredDataTable(result_2);

        try {
            // CONCEPT POINT type Other
            let url = '/master/asset/concept-point-query?type_concept_point_id=3'
            if (srchStartDate && localDate) {
                url += `&start_date=${localDate}`
                url += `&end_date=${localDate}`
            }
            getService(url).then(conceptPointList => {
                if (conceptPointList && Array.isArray(conceptPointList)) {
                    setDataConceptPoint(conceptPointList)
                }
            });
        } catch (error) {
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 1000);
    };

    const handleReset = async () => {
        setIsSearchClick(false)
        localStorage.removeItem("h593stkin2xqa9m");

        await fetchData();

        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            setSrchShipper([]);
        }

        setSrchStartDate(toDayjs().add(1, 'day').toDate())

        setSrchTypeDocument('');
        setSrchContractCode([]);
        setSrchStatus([]);
        setSrchCheckbox(false)
        setDataContract(dataContractOriginal)
        setKey((prevKey) => prevKey + 1);
    };

    // #region LIKE SEARCH
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        const filtered = dataTable.filter(
            (item: any) => {
                return (
                    item?.nomination_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // formatDate(item?.gas_day)?.toLowerCase().includes(queryLower) ||
                    // formatTime(item?.gas_day)?.toLowerCase().includes(queryLower) ||
                    item?.query_shipper_nomination_file_renom?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.query_shipper_nomination_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.nomination_version[0]?.version?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // item?.reserve_balancing_gas_contract?.res_bal_gas_contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.reserve_balancing_gas_contract?.res_bal_gas_contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.latestSubmittedTimestamp ?? item?.submitted_timestamp)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDate(item?.latestSubmittedTimestamp ?? item?.submitted_timestamp)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatTime(item?.latestSubmittedTimestamp ?? item?.submitted_timestamp)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setFilteredDataTable(filtered);
    };

    // #region fetch-Data
    const fetchData = async () => {
        try {
            setIsLoading(false);
            handleGetMaster(); // DATA NOM DEADLINE || ZONE

            const storedFilter = localStorage.getItem("h593stkin2xqa9m");
            const filterObj = storedFilter ? JSON.parse(storedFilter) : null;

            if (IsSearchClick) {
                setSrchStartDate(filterObj?.gas_day ? toDayjs(filterObj?.gas_day).toDate() : toDayjs().add(1, 'day').toDate())
            }

            // ====== เดิม ๆ
            // const contractCodeId = dashboardObject?.contract_code?.id?.toString()
            // const groupId = dashboardObject?.group?.id
            // const gasDay = dashboardObject?.gas_day ? toDayjs(dashboardObject?.gas_day) : undefined

            // ====== ใหม่ 1
            // const contractCodeId = filter_contract_code_from_somewhere_else
            // const groupId = filter_group_id_from_somewhere_else
            // const gasDay = filter_gas_day_from_somewhere_else ? toDayjs(filter_gas_day_from_somewhere_else) : undefined

            // ====== ใหม่ 2
            let gas_day_search: any = filter_gas_day_from_somewhere_else
            let group_search: any = filter_group_id_from_somewhere_else
            let contract_code_search: any = filter_contract_code_from_somewhere_else
            if (filterObj?.gas_day) {
                gas_day_search = filterObj?.gas_day
            }
            if (filterObj?.shipper_name !== "") {
                group_search = filterObj?.shipper_name
            }
            if (filterObj?.contract_code !== "") {
                contract_code_search = filterObj?.contract_code
            }

            const contractCodeId = contract_code_search
            const groupId = group_search
            const gasDay = gas_day_search ? toDayjs(gas_day_search) : undefined

            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (groupId?.length > 0 || userDT?.account_manage?.[0]?.user_type_id == 3) {
                if (groupId?.length > 0) {
                    setSrchShipper([Number(groupId)])
                } else if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    setDataShipper([userDT?.account_manage?.[0]?.group]) // https://app.clickup.com/t/86ewwu518 ที่มา set ยังงี้เพราะ master ที่เอาไว้ทำ option มันได้มาจากข้อมูล ถ้าไม่มี ชื่อ shipper จะไม่ขึ้น
                    setSrchShipper([userDT?.account_manage?.[0]?.group?.id])
                } else {
                    setSrchShipper([])
                }
            }

            // DATA MAIN
            const tomorrow = (gasDay ? gasDay : (toDayjs().add(1, 'day')))

            const res_api = await getAboutDT(currentPage, itemsPerPage)
            const response = res_api?.data;
            setDataTotal(res_api?.total);

            // const response: any = await getService(`/master/query-shipper-nomination-file?nomination_type_id=1&gas_day=${tomorrow?.format('YYYY-MM-DD')}`);


            let filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 1) // 1 == Daily, 2 == Weekly // REAL ONE

            // v2.0.16 Daily management ให้ default gas day เป็น d+1 https://app.clickup.com/t/86et2uwa4
            const tomorrowFormatted = tomorrow.format('DD/MM/YYYY');
            const result_2 = filtered_daily_weekly?.filter((item: any) => {
                return (
                    (tomorrowFormatted ? tomorrowFormatted == toDayjs(item?.gas_day).format("DD/MM/YYYY") : true)
                    // (filter_contract_code_from_somewhere_else ? contractCodeId == item?.contract_code?.contract_code : true) && // ถ้ามี contract code มาจาก params บน url
                    // (filter_group_id_from_somewhere_else ? groupId == item?.group?.id?.toString() : true) // ถ้ามี group id มาจาก params บน url
                );
            });

            const genFilterURL = (data: any) => {
                if (!useParams) {
                    const status: any = status_from_somewhere_else;
                    const findStatusMaster: any = nominationStatMaster?.data?.find((item: any) => item?.name == status)?.id;
                    const resultFilter = data?.filter((item: any) => {
                        return (
                            (findStatusMaster ? item?.query_shipper_nomination_status?.id.toString() == findStatusMaster : true)
                        );
                    });
                    return resultFilter
                }

                return data
            }

            if (groupId?.length > 0 || userDT?.account_manage?.[0]?.user_type_id == 3) {
                // ในกรณี Shipper เข้ามาจะต้องเห็นเฉพาะรายการของตัวเอง https://app.clickup.com/t/86et6833h
                // let filter_only_shipper_or_not: any = filtered_daily_weekly?.filter((item: any) => { return item?.group?.id === (groupId || userDT?.account_manage?.[0]?.group_id) })
                let filter_shipper_and_gas_day = filtered_daily_weekly?.filter((item: any) => {
                    return (
                        (tomorrowFormatted ? tomorrowFormatted == toDayjs(item?.gas_day).format("DD/MM/YYYY") : true)
                    );
                });

                let result: any = status_from_somewhere_else ? genFilterURL(filter_shipper_and_gas_day) : filter_shipper_and_gas_day;

                setData(filter_shipper_and_gas_day);
                setFilteredDataTable(result); // filter gas_day + 1

            } else {
                let result: any = status_from_somewhere_else ? genFilterURL(result_2) : result_2;

                setData(result_2);  // filter gas_day + 1
                setFilteredDataTable(result); // filter gas_day + 1
            }

            if (status_from_somewhere_else && !useParams) {
                const status: any = status_from_somewhere_else;
                const findStatusMaster: any = nominationStatMaster?.data?.find((item: any) => item?.name == status)?.id;
                setSrchStatus(findStatusMaster?.toString());
                setuseParams(true);
            }


            // ย้ายมาก่อน map พวกข้อมูลที่เอาไปทำ filter
            setIsLoading(true);

            await renderOption(response)

            try {
                // CONCEPT POINT type Other
                const tomorrowString = tomorrow.format('YYYY-MM-DD')
                getService(`/master/asset/concept-point-query?type_concept_point_id=3&start_date=${tomorrowString}&end_date=${tomorrowString}`)
                    .then(conceptPointList => {
                        if (conceptPointList && Array.isArray(conceptPointList)) {
                            setDataConceptPoint(conceptPointList)
                        }
                    });
            } catch (error) {
            }

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        if (filter_group_id_from_somewhere_else) {
            // case have params
            handleFieldSearch();
        } else if (IsSearchClick) {

            // case back from nom view
            fetchData();
        } else {
            // case normal
            fetchData();
        }

    }, [divMode])



    const handleCloseModal = () => {
        setModalSuccessOpen(false);
    }

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);

    // #region handleFormSubmit
    // ไม่ใช้นะ
    const handleFormSubmit = async (data: any) => {
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    // #region openAllFileModal
    const openAllFileModal = async (id?: any, data?: any) => {
        const data_file: any = await getService(`/master/query-shipper-nomination-file/query_shipper_nomination_file_url/${id}`);
        const filtered = dataTable?.find((item: any) => item.id === id);
        const map_data = {
            ...filtered,
            query_shipper_nomination_file_url: data_file
        }
        setDataFile(map_data)
        setMdFileView(true)
    };

    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    // #region openReasonModal
    const openReasonModal = async (id: any, data: any, row: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        const data_comment: any = await getService(`/master/query-shipper-nomination-file/query_shipper_nomination_file_comment/${id}`);
        setDataReason(data_comment)
        setDataReasonRow(filtered)
        setMdReasonView(true)
    };

    // #region openSubmissionModal
    const openSubmissionModal = async (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        const data_submission: any = await getService(`/master/query-shipper-nomination-file/submission_comment_query_shipper_nomination_file/${id}`);
        const map_data = {
            ...filtered,
            submission_comment_query_shipper_nomination_file: data_submission
        }
        setDataSubmission(map_data)
        setMdSubmissionView(true)
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'check_box', label: 'Check Box', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'nominations_code', label: 'Nomination Code', visible: true },
        { key: 'renominations', label: 'Renominations', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'version', label: 'Version', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'submitted_timestamp', label: 'Submitted Timestamp', visible: true },
        { key: 'submission_comment', label: 'Submission Comment', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'shipper_file', label: 'Shipper File', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // #region accept reject
    // ############### ACCEPT REJECT ###############
    const [modeUpdateStat, setModeUpdateStat] = useState<any>('');
    const [mdStatType, setMdStatType] = useState<any>('all');
    const [mdUpdateStat, setMdUpdateStat] = useState(false);

    const [idUpdateStat, setIdUpdateStat] = useState([]);
    const [dataModalAcceptReject, setDataModalAcceptReject] = useState([]);

    const handleAcceptReject = async (id?: any, mode?: any) => {
        id = id.map((item: any) => item.id);
        if (id?.length > 1) {
            setMdStatType('all')
        } else {
            const filter_data_x = dataTable?.filter((item: any) => item.id === id[0]);
            setDataModalAcceptReject(filter_data_x)
            setMdStatType('one')
        }
        setIdUpdateStat(id)
        setModeUpdateStat(mode)
        setMdUpdateStat(true)
    }

    const updateAcceptReject = async (data?: any) => {

        let body_post = {
            id: idUpdateStat,
            status: modeUpdateStat == 'accept' ? 2 : 3,
            comment: data.reason
        }

        try {
            const res_ = await postService('/master/daily-management/update-status', body_post);
            const statusCode = res_?.response?.data?.statusCode ?? res_?.response?.data?.status ?? res_?.status ?? res_?.statusCode ?? res_?.code ?? res_?.response?.status;
            const errorMsg = res_?.response?.data?.error ?? res_?.data?.error ?? res_?.response?.error ?? res_?.error;

            if (statusCode === 400 || statusCode === 500) {
                setFormOpen(false);
                setModalErrorMsg(errorMsg || '');
                setModalErrorOpen(true)
            } else {
                setFormOpen(false);

                const action = modeUpdateStat === 'accept' ? 'approved' : 'rejected';
                const fileType = mdStatType === 'all' ? 'All File' : 'File';

                setModalSuccessMsg(`${fileType} has been ${action}.`);
                setModalSuccessOpen(true);
                setMdUpdateStat(false);
                handleFieldSearch();  // เอาไว้เช็คหลังจากกด approve, reject จะให้ fetch ด้วย gas_day เดิม

                setSelectedRoles([]) // clear ที่ select re-gen
            }
        } catch (error) {
            // error
        }
    }

    const filterData = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        return filteredData
    }

    // #region nom code click
    const [dataNomCode, setDataNomCode] = useState()
    const handleNomCodeClick = (id?: any) => {
        let data = filterData(id);
        setDataNomCode(data)
        setDivMode('2');
    };

    const fetchPage = async () => {
        setIsLoading(false)

        const res_api = await getAboutDT(currentPage, itemsPerPage)
        const response = res_api?.data;
        setDataTotal(res_api?.total);

        setData(response);
        setPaginatedData(response);
        setFilteredDataTable(response);

        setIsLoading(true)
    }

    useEffect(() => {
        if (filteredDataTable) {
            // setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable) // ไม่ต้องสไลสเล้ยอะไรแล้ว เพราะ api ทำ pagination มาแล้ว
        }
        // }, [filteredDataTable, currentPage, itemsPerPage])
    }, [filteredDataTable])

    useEffect(() => {
        fetchPage();
    }, [currentPage, itemsPerPage])

    return (<>
        {/* ============== MAIN TABLE ============== */}
        {divMode === "1" && (
            <div className=" space-y-2">
                <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                    <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                        <DatePickaSearch
                            key={"start" + key}
                            label={"Gas Day"}
                            placeHolder={"Select Gas Day"}
                            allowClear
                            // isFixDay={dashboardObj ? true : false}
                            // dateToFix={dashboardObj && srchStartDate}
                            isFixDay={dashboardObj ? true : false}
                            dateToFix={srchStartDate}
                            onChange={(e: any) => setSrchStartDate(e ? e : null)}
                            isDefaultTomorrow={true}
                            defaultValue={srchStartDate}
                        />

                        {/* let filter_string = `${userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? idsArray : userDT?.account_manage?.[0]?.group_id}` // ถ้าเป็น TSO เอา id shipper ทั้งหมดมาแสดง ถ้าเป็น shipper เอาแค่ของตัวเอง */}
                        <InputSearch
                            id="searchShipper"
                            label="Shipper Name"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchShipper}
                            // onChange={(e) => setSrchShipper(e.target.value)}
                            onChange={(e) => {
                                setSrchShipper(e.target.value)
                                // findContractCode(e.target.value, dataShipper)
                            }}
                            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                            options={dataShipper
                                ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                    userDT?.account_manage?.[0]?.user_type_id == 3
                                        ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                        : true
                                )
                                .map((item: any) => ({
                                    value: item.id,
                                    label: item.name,
                                }))
                            }
                        />

                        <InputSearch
                            id="searchContractCode"
                            label="Contract Code"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchContractCode}
                            onChange={(e,) => setSrchContractCode(e.target.value)}
                            options={
                                dataContractOriginal?.filter((item: any) =>
                                    srchShipper.length > 0
                                        ? srchShipper.includes(item.group_id)
                                        : true
                                )
                                    .map((item: any) => ({
                                        // value: item?.id?.toString(),
                                        value: item?.contract_code,
                                        label: item?.contract_code
                                    }))
                            }
                        />

                        <InputSearch
                            id="searchStatus"
                            label="Status"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchStatus}
                            onChange={(e) => setSrchStatus(e.target.value)}
                            options={nominationStatMaster?.data?.map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item.name
                            }))}
                        />

                        <div className="w-auto relative">
                            <CheckboxSearch2
                                id="checkbox_filter"
                                label="Nominations With Submission Comment"
                                type="single-line"
                                value={srchCheckbox ? srchCheckbox : false}
                                onChange={(e: any) => setSrchCheckbox(e?.target?.checked)}
                            />
                        </div>

                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                        <BtnReset handleReset={handleReset} />
                    </aside>
                    <aside className="mt-auto ml-1 w-full sm:w-auto">
                        {/* <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div> */}
                    </aside>
                </div>

                <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        {/* Group Tune and BtnGeneral */}
                        <div className="flex items-center space-x-2">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>

                            {/* ต้องสามารถ management (Approved,Reject,Edit) รายการ nom ได้ หากยังไม่เกินเวลา deadline ที่กำหนด https://app.clickup.com/t/86etzcgtn */}
                            {
                                // ในกรณี Shipper เข้ามาจะต้องไม่เห็นปุ่ม Accept และ Reject https://app.clickup.com/t/86et682wa
                                userDT && userDT?.account_manage?.[0]?.user_type_id !== 3 && <>
                                    <BtnGeneral
                                        bgcolor={"#00ADEF"}
                                        modeIcon={'nom-accept'}
                                        textRender={"Approve"}
                                        generalFunc={() => handleAcceptReject(selectedRoles, 'accept')}
                                        // can_create={userPermission ? userPermission?.f_approved : false}
                                        // can_create={userPermission ? userPermission?.f_edit : false}
                                        can_create={true}
                                        disable={selectedRoles?.length > 0 ? false : true}
                                    />

                                    <BtnGeneral
                                        bgcolor={"#FFFFFF"}
                                        modeIcon={'nom-reject'}
                                        textRender={"Reject"}
                                        generalFunc={() => handleAcceptReject(selectedRoles, 'reject')}
                                        // can_create={userPermission ? userPermission?.f_approved : false}
                                        // can_create={userPermission ? userPermission?.f_edit : false}
                                        can_create={true}
                                        disable={selectedRoles?.length > 0 ? false : true}
                                    />
                                </>
                            }

                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="nomination/daily-management"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                            />
                        </div>
                    </div>

                    <TableNomDailyMgn
                        openAllFileModal={openAllFileModal}
                        openReasonModal={openReasonModal}
                        openSubmissionModal={openSubmissionModal}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        handleNomCodeClick={handleNomCodeClick}
                        // tableData={filteredDataTable}
                        tableData={paginatedData}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        dataNomDeadline={dataNomDeadline}
                        userDT={userDT}
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
            </div>
        )}

        {/* ============== NOMINATION CODE CLICK ============== */}
        {divMode == "2" && (
            <NomCodeView setDivMode={setDivMode} dataNomCode={dataNomCode} dataMasterZone={dataMasterZone} dataNomDeadline={dataNomDeadline} dataConceptPoint={dataConceptPoint} />
        )}

        <ModalAction
            mode={formMode}
            data={formData}
            open={formOpen}
            dataTable={dataTable}
            dataShipper={dataShipper}
            dataContractOriginal={dataContractOriginal}
            nominationTypeMaster={nominationTypeMaster?.data}
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
        />

        <ModalComponent
            open={isModalSuccessOpen}
            handleClose={handleCloseModal}
            title="Success"
            description={`${modalModalSuccessMsg}`}
        />

        <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
                setModalErrorOpen(false);
                if (resetForm) resetForm();
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

        <ModalComment
            data={dataReason}
            dataRow={dataReasonRow}
            open={mdReasonView}
            onClose={() => {
                setMdReasonView(false);
            }}
        />

        <ModalSubmissionDetails
            data={dataSubmission}
            open={mdSubmissionView}
            onClose={() => {
                setMdSubmissionView(false);
            }}
            version={undefined}
            setVersion={undefined}
            setDataSubmission={undefined}
        />

        <ModalFiles
            data={dataFile}
            // dataGroup={dataGroup}
            // setModalMsg={setModalMsg}
            setModalSuccessOpen={setModalSuccessOpen}
            // setModalSuccessMsg={setModalSuccessMsg}
            open={mdFileView}
            onClose={() => {
                setMdFileView(false);
            }}
        />

        <ColumnVisibilityPopover
            open={open}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            columnVisibility={columnVisibility}
            handleColumnToggle={handleColumnToggle}
            initialColumns={initialColumns}
        />

        <ModalAcceptReject
            data={dataNomCode}
            dataModalAcceptReject={dataModalAcceptReject}
            mode={modeUpdateStat}
            open={mdUpdateStat}
            type={mdStatType}
            onClose={() => {
                setMdUpdateStat(false);
            }}
            // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', modeUpdateStat)}
            onSubmit={updateAcceptReject}
        />
    </>

    );
};

export default ClientPage;