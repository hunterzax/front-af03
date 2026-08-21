"use client";
import { useEffect, useRef, useState } from "react";
import { Tune } from "@mui/icons-material"
import { extractUniqueTimestamps, filterDataIntraBalReport, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatNumberFourDecimal, generateUserPermission } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from 'dayjs';
import { useForm } from "react-hook-form";
import TableMain from "./form/table";
import { CustomTooltip } from "@/components/other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import { map24hourStartFromOne } from "../../../dam/(menu)/parameters/data";
import utc from 'dayjs/plugin/utc';
import BtnGeneral from "@/components/other/btnGeneral";
import { epBalancingIntradayBalancingReport } from "@/utils/exportFunc";

dayjs.extend(utc);

interface ClientProps {
    params: {
        lng: string;
    };
}

{/* หน้า intraday bal reportfor shipper  --  payload = {
    "gas_day": "2025-09-01",
    "start_hour": 1,
    "end_hour": 24,
    "skip": 0,
    "limit": 100,
    "latest_daily_version": false,
    "latest_hourly_version": true,
    "show_total": false,
    "show_total_all_shipper": false,
    "only_public": false,
    "shipper": []
} */}

{/* หน้า intraday bal report -- payload {
    "gas_day": "2025-09-01",
    "start_hour": 0,
    "end_hour": 24,
    "skip": 0,
    "limit": 100,
    "latest_daily_version": false,
    "latest_hourly_version": false,
    "show_total": false,
    "show_total_all_shipper": false,
    "only_public": false,
    "shipper": []
} */}

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

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
            //     const permission = findRoleConfigByMenuName('Intraday Balancing Report For Shipper', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Intraday Balancing Report For Shipper', userDT)
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
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !shipperGroupData?.data) {
            dispatch(fetchShipperGroup());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, shipperGroupData]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [checkPublic, setCheckPublic] = useState<boolean>(false);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    // const [srchStartDate, setSrchStartDate] = useState<Date | null>(() => { return dayjs().startOf('month').toDate(); });
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(() => { return dayjs().toDate(); });
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(() => { return dayjs().toDate(); });
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [bodyExport, setBodyExport] = useState<any>([]);
    const [srchTimeStamp, setSrchTimeStamp] = useState('');
    const [srchGasHourFrom, setSrchGasHourFrom] = useState('');
    const [srchGasHourTo, setSrchGasHourTo] = useState('');
    const [dataTimestamp, setDataTimestamp] = useState<any>([]);
    const [dataTimestampMaster, setDataTimestampMaster] = useState<any>([]);

    const [showTotal, setShowTotal] = useState<any>(true);
    const [showTotalAllShipper, setShowTotalAllShipper] = useState<any>(true);

    const timeToMinutes = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const hourStringToInt = (time: string): number => {
        if (time == '00:00') {
            time = '01:00'
        }
        // "00:00"  →  ["00","00"]  →  0
        // "13:00"  →  ["13","00"]  →  13
        const [h] = time?.split(":");
        return Number(h);
    }

    const handleFieldSearch = async () => {
        setIsLoading(false);

        const from = hourStringToInt(srchGasHourFrom ? srchGasHourFrom : '1');
        const to = hourStringToInt(srchGasHourTo ? srchGasHourTo : '24');

        setFilteredDataTable([]) // clear ก่อนซักที
        setShowTotal(watch('filter_show_total'))
        setShowTotalAllShipper(watch('filter_show_total_all_shipper'))

        // body เดิมก่อนแก้ api 01/07/2025
        // const body_main = {
        //     "gas_day": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
        //     "skip": 0, 
        //     "limit": 100 
        // }

        const body_main = {
            "gas_day": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            "start_hour": from,
            "end_hour": to !== 0 ? to : 24,
            "skip": 0,
            "limit": 100,
            "latest_daily_version": watch('filter_last_daily_version'),
            "latest_hourly_version": watch('filter_last_hourly_version'),
            "show_total": watch('filter_show_total'),
            "show_total_all_shipper": watch('filter_show_total_all_shipper'),
            "only_public": (userDT?.account_manage?.[0]?.user_type_id !== 3) ? watch('filter_only_public') : true, // shipper เห็นแค่เฉพาะ public
            // "shipper": userDT?.account_manage?.[0]?.user_type_id !== 3 ? [] : [userDT?.account_manage?.[0]?.group?.id_name]  // ["NGP-S01-002"]
            "shipper": (userDT?.account_manage?.[0]?.user_type_id !== 3) ? srchShipperName : [userDT?.account_manage?.[0]?.group?.id_name] // ["NGP-S01-002"]
        }

        setBodyExport(body_main)

        // FETCH DATA
        let res_ = await postService('/master/balancing/intraday-balancing-report', body_main);
        // let res_: any = new_data_with_actual_planning // data ใหม่ เบิ้ลสอง row

        if (res_?.response?.data?.status !== 400 && res_?.status !== 500 && res_?.status !== 403 && res_?.statusCode !== 500) {

            // ไปใช้ filter จาก service แทน
            // if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            //     const res_filter_only_shipper = filterByShipperIntradayBalanceReport(res_, userDT?.account_manage?.[0]?.group?.id_name)
            //     res_ = res_filter_only_shipper
            // }

            // DATA TIMESTAMP
            const data_timestamp = extractUniqueTimestamps(res_)
            setDataTimestamp(data_timestamp);
            setDataTimestampMaster(data_timestamp);

            // ไปใช้ filter จาก service แทน
            // // filter วันล่าสุดของ shipper นั้น ๆ
            // if (watch('filter_last_daily_version')) {
            //     res_ = getLatestPerShipper(res_);
            // }

            // ไปใช้ filter จาก service แทน
            // // filter ชั่วโมงล่าสุดของ shipper นั้น ๆ
            // if (watch('filter_last_hourly_version')) {
            //     res_ = getLatestByPrevHourPerShipper(res_);
            // }

            const fromMinutes = srchGasHourFrom ? timeToMinutes(srchGasHourFrom) : null;
            const toMinutes = srchGasHourTo ? timeToMinutes(srchGasHourTo) : null;

            let res_filtered = res_?.map((item: any) => {
                if (!srchShipperName?.length && !srchTimeStamp?.length && !srchGasHourFrom && !srchGasHourTo && !watch('filter_only_public')) return item;

                const filteredShipperData = item.shipperData?.map((sd: any) => {

                    const filteredContracts = sd?.contractData?.filter((cd: any) => {
                        const actual = cd?.valueContractActual;

                        // actual = {
                        //     "publication": false,
                        //     "gas_day": "01/02/2025",
                        //     "gas_hour": "20:00",
                        //     "shipper": "EGAT-A",
                        //     "contract": "2025-CNF-002",
                        //     "timestamp": "01/02/2025 21:20",
                        // }

                        const matchShipper = srchShipperName?.length > 0 ? srchShipperName.includes(actual.shipper) : true;
                        const matchTimestamp = srchTimeStamp ? srchTimeStamp == actual.timestamp : true;
                        const matchPublicate = watch('filter_only_public') ? actual.publication == true : true;

                        const gasHourMin = timeToMinutes(actual.gas_hour || "00:00");
                        const matchGasHour = fromMinutes !== null && toMinutes !== null
                            ? gasHourMin >= fromMinutes && gasHourMin <= toMinutes
                            : true;

                        return matchShipper && matchTimestamp && matchGasHour && matchPublicate;
                        // return matchShipper || matchTimestamp || matchGasHour || matchPublicate;
                    }) || [];

                    if (filteredContracts.length === 0) return null;

                    return {
                        ...sd,
                        contractData: filteredContracts
                    };
                }).filter(Boolean);

                if (filteredShipperData.length === 0) return null;

                return {
                    ...item,
                    shipperData: filteredShipperData
                };
            }).filter(Boolean);

            setData(res_filtered) // for DEV MODE
            setFilteredDataTable(res_filtered)
        }

        setTimeout(() => {
            setIsLoading(true);
        }, 1000);

        setCurrentPage(1);
    };

    const handleReset = async () => {
        setSrchStartDate(null)
        setSrchEndDate(null)
        setSrchShipperName([])
        setSrchGasHourFrom('')
        setSrchGasHourTo('')
        setDataTimestamp([])

        setValue('filter_only_public', false)
        setValue('filter_show_total', true)

        {/* v2.0.46 Shipper ต้องไม่มี checkboxes 'Show Total All Shippers' https://app.clickup.com/t/86etym1pq */ }
        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            setValue('filter_show_total_all_shipper', true)
        } else {
            setValue('filter_show_total_all_shipper', false)
        }

        setShowTotal(true)
        setShowTotalAllShipper(true)

        // setFilteredDataTable(dataTable)
        setFilteredDataTable([])
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############

    // version 5
    // debounce เทคนิค
    const debounceRef = useRef<any>(null);
    const normalize = (val: any) => val?.toString()?.replace(/\s+/g, '')?.toLowerCase()?.trim() || '';

    const keyValues = [
        'total_entry_east',
        'total_entry_west',
        'total_entry_east-west',
        'total_exit_east',
        'total_exit_west',
        'total_exit_east-west',
        'imbZone_east',
        'imbZone_west',
        'imbZone_total',
        'InstructedFlow_east',
        'InstructedFlow_west',
        'shrinkage_east',
        'shrinkage_west',
        'park_east',
        'park_west',
        'Unpark_east',
        'Unpark_west',
        'SodPark_east',
        'SodPark_west',
        'EodPark_east',
        'EodPark_west',
        'minInventoryChange_east',
        'minInventoryChange_west',
        'reserveBal_east',
        'reserveBal_west',
        'adjustDailyImb_east',
        'adjustDailyImb_west',
        'ventGas_east',
        'ventGas_west',
        'commissioningGas_east',
        'commissioningGas_west',
        'otherGas_east',
        'otherGas_west',
        'dailyImb_east',
        'dailyImb_west',
        'aip',
        'ain',
        'absimb',
        'accImbMonth_east',
        'accImbMonth_west',
        'accImb_east',
        'accImb_west',
        'minInventory_east',
        'minInventory_west',
        'detail_entry_east_gsp',
        'detail_entry_east_bypassGas',
        'detail_entry_east_lng',
        'detail_entry_west_yadana',
        'detail_entry_west_yetagun',
        'detail_entry_west_zawtika',
        'detail_entry_east-west_ra6East',
        'detail_entry_east-west_ra6West',
        'detail_entry_east-west_bvw10East',
        'detail_entry_east-west_bvw10West',
        'detail_exit_east_egat',
        'detail_exit_east_ipp',
        'detail_exit_west_egat',
        'detail_exit_west_ipp',
        'detail_exit_east-west_egat',
        'detail_exit_east-west_ipp',
        'detail_exit_east_F2andG',
        'detail_exit_west_F2andG',
        'detail_exit_E_east',
        'detail_exit_E_west',
    ];

    const handleSearch = (query: string) => {
        setIsLoading(false)

        let filter_plan_actual = dataTable
        const q = (query ?? '').toLowerCase().trim();
        // เอาไว้กรอง planning หรือ actual
        // R1 : Smart Search ยังใช้ไม่ได้ https://app.clickup.com/t/86eujrg8m 
        if (q.startsWith('plan') || q.startsWith('act')) {
            if (q.startsWith('plan')) {
                // เหลือเฉพาะ Planning
                filter_plan_actual = filterDataIntraBalReport(dataTable, 'planning');
            } else if (q.startsWith('act')) {
                // เหลือเฉพาะ Actual
                filter_plan_actual = filterDataIntraBalReport(dataTable, 'actual');
            } else {
                // ไม่เข้าเคสใด ๆ ก็ไม่กรอง หรือทำดีฟอลต์ตามต้องการ
                filter_plan_actual = dataTable;
            }

            setFilteredDataTable(filter_plan_actual);
            setTimeout(() => {
                setIsLoading(true)
            }, 500);
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
            const queryLower = normalize(query);

            if (!queryLower) {
                setFilteredDataTable(dataTable);
                return;
            }

            // const filtered = dataTable?.map((entry: any) => {
            const filtered = filter_plan_actual?.map((entry: any) => {
                const gasDayMatch = normalize(formatDateNoTime(entry.gas_day)).includes(queryLower);
                const totalAllMatch = normalize(entry?.totalAllPlanning?.gas_day).includes(queryLower);
                const totalAllMatchActual = normalize(entry?.totalAllActual?.gas_day).includes(queryLower);
                const totalAllMatch2 = keyValues.some((key) => normalize(formatNumberFourDecimal(entry?.totalAllPlanning?.[key])).includes(queryLower));
                const totalAllMatch2Actual = keyValues.some((key) => normalize(formatNumberFourDecimal(entry?.totalAllActual?.[key])).includes(queryLower));

                const filteredShipperData = entry.shipperData?.map((shipperGroup: any) => {
                    const totalShipperMatch = normalize(shipperGroup?.totalShipperPlanning?.gas_day).includes(queryLower);
                    const totalShipperMatchActual = normalize(shipperGroup?.totalShipperActual?.gas_day).includes(queryLower);

                    const totalShipperMatch2 = keyValues.some((key) =>
                        normalize(formatNumberFourDecimal(shipperGroup?.totalShipperPlanning?.[key])).includes(queryLower)
                    );
                    const totalShipperMatch2Actual = keyValues.some((key) =>
                        normalize(formatNumberFourDecimal(shipperGroup?.totalShipperActual?.[key])).includes(queryLower)
                    );

                    const filteredContracts = shipperGroup.contractData?.filter((contract: any) => {
                        const planning = contract.valueContractPlanning || {};
                        const actual = contract.valueContractActual || {};

                        const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == planning?.shipper)
                        const find_shipper_actual = dataShipper?.find((itemx: any) => itemx?.id_name == actual?.shipper)

                        const matches = [
                            // planning.shipper,
                            find_shipper?.name,
                            planning.contract,
                            planning.gas_hour,
                            planning.timestamp,
                            // actual.shipper,
                            find_shipper_actual?.name,
                            actual.contract,
                            actual.gas_hour,
                            actual.timestamp,
                        ].some((val) => normalize(val).includes(queryLower));

                        const valueMatch = keyValues.some((key) =>
                            normalize(formatNumberFourDecimal(planning[key])).includes(queryLower)
                        );
                        const valueMatchActual = keyValues.some((key) =>
                            normalize(formatNumberFourDecimal(actual[key])).includes(queryLower)
                        );

                        return matches || valueMatch || valueMatchActual;
                    }) || [];

                    if (
                        totalShipperMatch ||
                        totalShipperMatchActual ||
                        totalShipperMatch2 ||
                        totalShipperMatch2Actual ||
                        filteredContracts.length > 0
                    ) {
                        return {
                            ...shipperGroup,
                            contractData: filteredContracts,
                        };
                    }

                    return null;
                }).filter(Boolean);

                if (
                    gasDayMatch ||
                    totalAllMatch ||
                    totalAllMatchActual ||
                    totalAllMatch2 ||
                    totalAllMatch2Actual ||
                    filteredShipperData.length > 0
                ) {
                    return {
                        ...entry,
                        shipperData: filteredShipperData,
                    };
                }

                return null;
            }).filter(Boolean);

            setFilteredDataTable(filtered);
        }, 300); // debounce delay

        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    // ############### DATA TABLE ###############
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataTable, setData] = useState<any>([]);

    const fetchData = async () => {
        setValue('filter_show_total', true)
        setValue('filter_last_hourly_version', true) // default ไว้เลย เอาออกไม่ได้
        if(userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4){
            setValue('filter_only_public', true)
        }
        {/* v2.0.46 Shipper ต้องไม่มี checkboxes 'Show Total All Shippers' https://app.clickup.com/t/86etym1pq */ }
        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            setValue('filter_show_total_all_shipper', true)
        } else {
            setValue('filter_show_total_all_shipper', false)
        }

        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)


            const body_main = {
                "gas_day": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                "start_hour": 0, 
                "end_hour": 24, 
                "skip": 0, 
                "limit": 100, 
                "latest_daily_version": watch('filter_last_daily_version'),
                "latest_hourly_version": watch('filter_last_hourly_version'),
                "show_total": watch('filter_show_total'),
                "show_total_all_shipper": watch('filter_show_total_all_shipper'),
                "only_public": (userDT?.account_manage?.[0]?.user_type_id !== 3) ? watch('filter_only_public') : true, // shipper เห็นแค่เฉพาะ public
                "shipper": (userDT?.account_manage?.[0]?.user_type_id !== 3) ? [] : [userDT?.account_manage?.[0]?.group?.id_name] // ["NGP-S01-002"]
            }

            setBodyExport(body_main)

            // MAIN DATA 
            const response = await postService('/master/balancing/intraday-balancing-report', body_main);
            if (response?.response?.data?.status !== 400 && response?.status !== 500 && response?.status !== 403 && response?.statusCode !== 500) {

                // setData(response?.data);
                // setFilteredDataTable(response?.data);
                setData(response);
                setFilteredDataTable(response);
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
            setData([]);
            setFilteredDataTable([]);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############### PAGINATION DETAIL TOTAL ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(2);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setIsLoading(false);
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setIsLoading(false);
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        setTimeout(() => {
            setIsLoading(true);
        }, 500);
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [

        { key: 'publicate', label: 'Publicate', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'gas_hour', label: 'Gas Hour', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },

        { key: 'summary_pane', label: 'Summary Pane', visible: true },
        { key: 'detail_pane', label: 'Detail Pane', visible: false },

        { key: 'shipper_name', label: 'Shipper Name', visible: true, parent_id: 'summary_pane' },
        { key: 'plan_actual', label: 'Plan / Actual', visible: true, parent_id: 'summary_pane' },
        { key: 'contract_code', label: 'Contract Code', visible: true, parent_id: 'summary_pane' },

        { key: 'total_entry_mmbtud', label: 'Total Entry (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'total_exit_mmbtud', label: 'Total Exit (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'imbalance_zone_mmbtud', label: 'Imbalance Zone (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'instructed_flow_mmbtud', label: 'Instructed Flow (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'shrinkage_volume_mmbtud', label: 'Shrinkage Volume (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'park_mmbtud', label: 'Park (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'unpark_mmbtud', label: 'Unpark (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'sod_park_mmbtud', label: 'SOD Park (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'eod_park_mmbtud', label: 'EOD Park (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'min_inventory_change_mmbtud', label: 'Change Min Inventory (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'reserve_bal_mmbtud', label: 'Reserve Bal. (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'adjust_imbalance_mmbtud', label: 'Adjust Imbalance (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'vent_gas', label: 'Vent Gas', visible: false, parent_id: 'summary_pane' },
        { key: 'commissioning_gas', label: 'Commissioning Gas', visible: false, parent_id: 'summary_pane' },
        { key: 'other_gas', label: 'Other Gas', visible: false, parent_id: 'summary_pane' },
        { key: 'daily_imb_mmbtud', label: 'Daily IMB. (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'aip_mmbtud', label: 'AIP (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'ain_mmbtud', label: 'AIN (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'percentage_imb', label: '%Imb', visible: false, parent_id: 'summary_pane' },
        { key: 'percentage_abslmb', label: '%Abslmb', visible: false, parent_id: 'summary_pane' },
        { key: 'acc_imb_month_mmbtud', label: 'Acc. IMB. (MONTH) (MMBTU/D)', visible: false, parent_id: 'summary_pane' },
        { key: 'acc_imb_mmbtud', label: 'Acc. IMB. (MMBTU/D)', visible: true, parent_id: 'summary_pane' },
        { key: 'min_inventory_mmbtud', label: 'Min. Inventory (MMBTU/D)', visible: false, parent_id: 'summary_pane' },


        // sub of Summary Pane --> Total Entry (MMBTU/D)
        { key: 'east_total_entry_mmbtud', label: 'East', visible: true, parent_id: 'total_entry_mmbtud' },
        { key: 'west_total_entry_mmbtud', label: 'West', visible: true, parent_id: 'total_entry_mmbtud' },
        { key: 'east_west_total_entry_mmbtud', label: 'East-West', visible: false, parent_id: 'total_entry_mmbtud' },

        // sub of Summary Pane --> Total Exit (MMBTU/D)
        { key: 'east_total_exit_mmbtud', label: 'East', visible: true, parent_id: 'total_exit_mmbtud' },
        { key: 'west_total_exit_mmbtud', label: 'West', visible: true, parent_id: 'total_exit_mmbtud' },
        { key: 'east_west_total_exit_mmbtud', label: 'East-West', visible: true, parent_id: 'total_exit_mmbtud' },

        // sub of Summary Pane --> Imbalance Zone (MMBTU/D)
        { key: 'east_imbalance_zone_mmbtud', label: 'East', visible: true, parent_id: 'imbalance_zone_mmbtud' },
        { key: 'west_imbalance_zone_mmbtud', label: 'West', visible: true, parent_id: 'imbalance_zone_mmbtud' },
        { key: 'total_imbalance_zone_mmbtud', label: 'Total', visible: true, parent_id: 'imbalance_zone_mmbtud' },

        // sub of Summary Pane --> Instructed flow (MMBTU)
        { key: 'east_instructed_flow_mmbtud', label: 'East', visible: false, parent_id: 'instructed_flow_mmbtud' },
        { key: 'west_instructed_flow_mmbtud', label: 'West', visible: false, parent_id: 'instructed_flow_mmbtud' },
        { key: 'east_west_instructed_flow_mmbtud', label: 'East-West', visible: false, parent_id: 'instructed_flow_mmbtud' },

        // sub of Summary Pane --> Shrinkage Volume (MMBTU/D)
        { key: 'east_shrinkage_volume_mmbtud', label: 'East', visible: true, parent_id: 'shrinkage_volume_mmbtud' },
        { key: 'west_shrinkage_volume_mmbtud', label: 'West', visible: true, parent_id: 'shrinkage_volume_mmbtud' },

        // sub of Summary Pane --> Park (MMBTU/D)
        { key: 'east_park_mmbtud', label: 'East', visible: false, parent_id: 'park_mmbtud' },
        { key: 'west_park_mmbtud', label: 'West', visible: false, parent_id: 'park_mmbtud' },

        // sub of Summary Pane --> Unpark (MMBTU/D)
        { key: 'east_unpark_mmbtud', label: 'East', visible: false, parent_id: 'unpark_mmbtud' },
        { key: 'west_unpark_mmbtud', label: 'West', visible: false, parent_id: 'unpark_mmbtud' },

        // sub of Summary Pane --> SOD Park (MMBTU/D)
        { key: 'east_sod_park_mmbtud', label: 'East', visible: false, parent_id: 'sod_park_mmbtud' },
        { key: 'west_sod_park_mmbtud', label: 'West', visible: false, parent_id: 'sod_park_mmbtud' },

        // sub of Summary Pane --> EOD Park (MMBTU/D)
        { key: 'east_eod_park_mmbtud', label: 'East', visible: false, parent_id: 'eod_park_mmbtud' },
        { key: 'west_eod_park_mmbtud', label: 'West', visible: false, parent_id: 'eod_park_mmbtud' },

        // sub of Summary Pane --> Min. Inventory Change (MMBTU/D)
        { key: 'east_min_inventory_change_mmbtud', label: 'East', visible: true, parent_id: 'min_inventory_change_mmbtud' },
        { key: 'west_min_inventory_change_mmbtud', label: 'West', visible: true, parent_id: 'min_inventory_change_mmbtud' },

        // sub of Summary Pane --> Reserve Bal. (MMBTU/D)
        { key: 'east_reserve_bal_mmbtud', label: 'East', visible: false, parent_id: 'reserve_bal_mmbtud' },
        { key: 'west_reserve_bal_mmbtud', label: 'West', visible: false, parent_id: 'reserve_bal_mmbtud' },

        // sub of Summary Pane --> Adjust Imbalance (MMBTU/D)
        { key: 'east_adjust_imbalance_mmbtud', label: 'East', visible: true, parent_id: 'adjust_imbalance_mmbtud' },
        { key: 'west_adjust_imbalance_mmbtud', label: 'West', visible: true, parent_id: 'adjust_imbalance_mmbtud' },

        // sub of Summary Pane --> Vent Gas
        { key: 'east_vent_gas', label: 'East', visible: false, parent_id: 'vent_gas' },
        { key: 'west_vent_gas', label: 'West', visible: false, parent_id: 'vent_gas' },

        // sub of Summary Pane --> Commissioning Gas
        { key: 'east_commissioning_gas', label: 'East', visible: false, parent_id: 'commissioning_gas' },
        { key: 'west_commissioning_gas', label: 'West', visible: false, parent_id: 'commissioning_gas' },

        // sub of Summary Pane --> Other Gas
        { key: 'east_other_gas', label: 'East', visible: false, parent_id: 'other_gas' },
        { key: 'west_other_gas', label: 'West', visible: false, parent_id: 'other_gas' },

        // sub of Summary Pane --> Daily IMB (MMBTU/D)
        { key: 'east_daily_imb_mmbtud', label: 'East', visible: true, parent_id: 'daily_imb_mmbtud' },
        { key: 'west_daily_imb_mmbtud', label: 'West', visible: true, parent_id: 'daily_imb_mmbtud' },

        // sub of Summary Pane --> AIP (MMBTU/D)
        { key: 'total_aip_mmbtud', label: 'Total', visible: false, parent_id: 'aip_mmbtud' },

        // sub of Summary Pane --> AIN (MMBTU/D)
        { key: 'total_ain_mmbtud', label: 'Total', visible: false, parent_id: 'ain_mmbtud' },

        // sub of Summary Pane --> %Imb
        { key: 'total_percentage_imb', label: 'Total', visible: false, parent_id: 'percentage_imb' },

        // sub of Summary Pane --> %Abslmb
        { key: 'total_percentage_abslmb', label: 'Total', visible: false, parent_id: 'percentage_abslmb' },

        // sub of Summary Pane --> Acc. IMB. (MONTH) (MMBTU/D)
        { key: 'east_acc_imb_month_mmbtud', label: 'East', visible: false, parent_id: 'acc_imb_month_mmbtud' },
        { key: 'west_acc_imb_month_mmbtud', label: 'West', visible: false, parent_id: 'acc_imb_month_mmbtud' },

        // sub of Summary Pane --> Acc. IMB. (MMBTU/D)
        { key: 'east_acc_imb_mmbtud', label: 'East', visible: true, parent_id: 'acc_imb_mmbtud' },
        { key: 'west_acc_imb_mmbtud', label: 'West', visible: true, parent_id: 'acc_imb_mmbtud' },

        // sub of Summary Pane -->  Min. Inventory (MMBTU)
        { key: 'east_min_inventory_mmbtud', label: 'East', visible: false, parent_id: 'min_inventory_mmbtud' },
        { key: 'west_min_inventory_mmbtud', label: 'West', visible: false, parent_id: 'min_inventory_mmbtud' },




        { key: 'entry', label: 'Entry', visible: false, parent_id: 'detail_pane' },
        { key: 'exit', label: 'Exit', visible: false, parent_id: 'detail_pane' },



        // sub of Detail Pane ---> Entry
        { key: 'east_entry_detail_pane', label: 'East', visible: false, parent_id: 'entry' },
        { key: 'west_entry_detail_pane', label: 'West', visible: false, parent_id: 'entry' },
        { key: 'east_west_entry_detail_pane', label: 'East-West', visible: false, parent_id: 'entry' },

        // sub of Detail Pane ---> Exit
        { key: 'east_exit_detail_pane', label: 'East', visible: false, parent_id: 'exit' },
        { key: 'west_exit_detail_pane', label: 'West', visible: false, parent_id: 'exit' },
        { key: 'east_west_exit_detail_pane', label: 'East-West', visible: false, parent_id: 'exit' },
        { key: 'f2_and_g', label: 'F2&G', visible: false, parent_id: 'exit' },
        { key: 'e', label: 'E', visible: false, parent_id: 'exit' },

        // sub of Detail Pane ---> Entry ---> East
        { key: 'gsp', label: 'GSP', visible: false, parent_id: 'east_entry_detail_pane' },
        { key: 'bypass_gas', label: 'Bypass Gas', visible: false, parent_id: 'east_entry_detail_pane' },
        { key: 'lng', label: 'LNG', visible: false, parent_id: 'east_entry_detail_pane' },
        { key: 'others_east', label: 'Others', visible: false, parent_id: 'east_entry_detail_pane' },


        // sub of Detail Pane ---> Entry ---> West
        { key: 'ydn', label: 'YDN', visible: false, parent_id: 'west_entry_detail_pane' },
        { key: 'ytg', label: 'YTG', visible: false, parent_id: 'west_entry_detail_pane' },
        { key: 'ztk', label: 'ZTK', visible: false, parent_id: 'west_entry_detail_pane' },
        { key: 'others_west', label: 'Others', visible: false, parent_id: 'west_entry_detail_pane' },


        // sub of Detail Pane ---> Entry ---> East-West
        { key: 'ra6_east', label: 'RA6 East', visible: false, parent_id: 'east_west_entry_detail_pane' },
        { key: 'ra6_west', label: 'RA6 West', visible: false, parent_id: 'east_west_entry_detail_pane' },
        { key: 'bvw10_east', label: 'BVW10 East', visible: false, parent_id: 'east_west_entry_detail_pane' },
        { key: 'bvw10_West', label: 'BVW10 West', visible: false, parent_id: 'east_west_entry_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> East
        { key: 'egat', label: 'EGAT', visible: false, parent_id: 'east_exit_detail_pane' },
        { key: 'ipp', label: 'IPP', visible: false, parent_id: 'east_exit_detail_pane' },
        { key: 'others_east_exit', label: 'Others', visible: false, parent_id: 'east_exit_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> West
        { key: 'egat_west', label: 'EGAT', visible: false, parent_id: 'west_exit_detail_pane' },
        { key: 'ipp_west', label: 'IPP', visible: false, parent_id: 'west_exit_detail_pane' },
        { key: 'others_west_exit', label: 'Others', visible: false, parent_id: 'west_exit_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> East-West
        { key: 'egat_east_west', label: 'EGAT', visible: false, parent_id: 'east_west_exit_detail_pane' },
        { key: 'ipp_east_west', label: 'IPP', visible: false, parent_id: 'east_west_exit_detail_pane' },
        { key: 'others_east_west_exit', label: 'Others', visible: false, parent_id: 'east_west_exit_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> F2&G
        { key: 'east_f2andg', label: 'East', visible: false, parent_id: 'f2_and_g' },
        { key: 'west_f2andg', label: 'West', visible: false, parent_id: 'f2_and_g' },

        // sub of Detail Pane ---> EXIT ---> E
        { key: 'east_e', label: 'East', visible: false, parent_id: 'e' },
        { key: 'west_e', label: 'West', visible: false, parent_id: 'e' },


    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibilityNew, setColumnVisibilityNew] = useState<any>(
        Object.fromEntries(
            initialColumns.map((column: any) => [column.key, column.visible])
        )
    );

    const filteredColumns = initialColumns;

    useEffect(() => {
        setColumnVisibilityNew(Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible])))
    }, [])

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const [tk, settk] = useState<boolean>(false);

    const handleColumnToggleNew = (columnKey: string) => {
        const dataFilter = initialColumns;

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

        setColumnVisibilityNew((prev: any) => {
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

    useEffect(() => {
        if (checkPublic) {
            handleFieldSearch();
            setTimeout(() => {
                setCheckPublic(false)
            }, 300);
        } else {
            setTimeout(() => {
                handleFieldSearch();
            }, 300);
        }
    }, [checkPublic])

    // filter timestamp จาก hour
    const toMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        return h * 60 + m;
    };

    // R1 : List > Filter Timestamp ต้องกรองตาม Gas Hour From , Gas Hour To ด้วย ถ้ามีการเลือก 2 filter นี้ แต่ถ้าไม่ได้ filter ก็จะเห็นหมดตาม Gas Day https://app.clickup.com/t/86eu1w4zf
    useEffect(() => {
        const fromMinutes = srchGasHourFrom ? toMinutes(srchGasHourFrom) : null;
        const toMinutesLimit = srchGasHourTo ? toMinutes(srchGasHourTo) : null;

        const filtered = dataTimestampMaster?.filter((item: any) => {
            const timePart = item.timestamp.split(" ")[1];
            const currentMinutes = toMinutes(timePart);

            if (fromMinutes !== null && toMinutesLimit !== null) {
                return currentMinutes >= fromMinutes && currentMinutes <= toMinutesLimit;
            } else if (fromMinutes !== null) {
                return currentMinutes >= fromMinutes;
            } else if (toMinutesLimit !== null) {
                return currentMinutes <= toMinutesLimit;
            } else {
                return true; // ไม่กรองเลย
            }
        });
        setDataTimestamp(filtered)
    }, [srchGasHourFrom, srchGasHourTo])

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* List > กรณีที่เป็น Shipper ตรง Filter Shipper ต้องขึ้นเป็นชื่อ Shipper นั้นเลย https://app.clickup.com/t/86eu1wepa */}
                    {/* เลยทำเป็นถ้าตัวเล่่นเป็น shipper ก็แสดง selectbox แบบไม่ใช่มัลติ */}
                    {
                        (userDT?.account_manage?.[0]?.user_type_id !== 3) ?
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select-multi-checkbox"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipperName}
                                onChange={(e) => setSrchShipperName(e.target.value)}
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
                            :
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                isDisabled={true}
                                value={userDT?.account_manage?.[0]?.user_type_id == 3 ? userDT?.account_manage?.[0]?.group?.id_name : srchShipperName}
                                onChange={(e) => setSrchShipperName(e.target.value)}
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
                    }


                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        allowClear
                        // isDefaultFirstDayOfMonth={true}
                        isDefaultToday={true} // Default Filter Gas Day ให้เป็น Today เหมือนของ Intraday Balancing Report https://app.clickup.com/t/86eudjtx5
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <InputSearch
                        id="searchGasHourFrom"
                        label="Gas Hour From"
                        type="select"
                        value={srchGasHourFrom}
                        // onChange={(e) => setSrchGasHourFrom(e.target.value)}
                        onChange={(e) => {
                            setSrchGasHourFrom(e.target.value)
                            setSrchGasHourTo('')
                        }}
                        // options={map24HourVersionEviden?.map((item: any) => ({
                        //     // value: item.id,
                        //     value: item.name + ':00',
                        //     label: item.name + ':00',
                        // }))}
                        options={map24hourStartFromOne?.map((item: any) => ({
                            // value: item.id,
                            value: item.name + ':00',
                            label: item.name + ':00',
                        }))}
                    />

                    <InputSearch
                        id="searchGasHourTo"
                        label="Gas Hour To"
                        type="select"
                        value={srchGasHourTo}
                        onChange={(e) => setSrchGasHourTo(e.target.value)}
                        // options={map24HourVersionEviden
                        //     ?.filter((item: any) => {
                        //         if (!srchGasHourFrom) return true; // ไม่มี from => ไม่กรอง
                        //         const fromHour = parseInt(srchGasHourFrom.split(':')[0], 10);
                        //         const toHour = parseInt(item.name, 10);
                        //         return toHour > fromHour; // กรองเฉพาะที่มากกว่า from
                        //     })
                        //     .map((item: any) => ({
                        //         // value: item.id,
                        //         value: item.name + ':00',
                        //         label: item.name + ':00',
                        //     }))}
                        options={map24hourStartFromOne
                            ?.filter((item: any) => {
                                if (!srchGasHourFrom) return true; // ไม่มี from => ไม่กรอง
                                const fromHour = parseInt(srchGasHourFrom.split(':')[0], 10);
                                const toHour = parseInt(item.name, 10);
                                return toHour > fromHour; // กรองเฉพาะที่มากกว่า from
                            })
                            .map((item: any) => ({
                                // value: item.id,
                                value: item.name + ':00',
                                label: item.name + ':00',
                            }))}
                    />

                    <InputSearch
                        id="searchTimestamp"
                        label="Timestamp"
                        type="select"
                        value={srchTimeStamp}
                        onChange={(e) => setSrchTimeStamp(e.target.value)}
                        options={dataTimestamp?.map((item: any) => ({
                            value: item.timestamp,
                            label: item.timestamp
                        }))}
                    />

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('filter_last_daily_version')}
                            id="filter_last_daily_version"
                            label="Last Daily Version"
                            type="single-line"
                            value={watch('filter_last_daily_version') ? watch('filter_last_daily_version') : false}
                            onChange={(e: any) => setValue('filter_last_daily_version', e?.target?.checked)}
                        />
                    </div>
                    {
                        (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && 
                        <div className="-mb-2">
                            <CheckboxSearch2
                                {...register('filter_last_hourly_version')}
                                id="filter_last_hourly_version"
                                label="Last Hourly Version"
                                type="single-line"
                                // isDisable={true} 
                                isDisable={(userDT?.account_manage?.[0]?.user_type_id == 2 || userDT?.account_manage?.[0]?.user_type_id == 1) ? false : true} // v2.0.68 Role TSO ตรง Checkbox  Last Hourly Version ปลด Disable ออก https://app.clickup.com/t/86eu77v3k 
                                // value={watch('filter_last_hourly_version') ? watch('filter_last_hourly_version') : false}
                                // value={true} // default ไว้เลย เอาออกไม่ได้
                                value={watch('filter_last_hourly_version')} // default ไว้เลย เอาออกไม่ได้
                                onChange={(e: any) => setValue('filter_last_hourly_version', e?.target?.checked)}
                            />
                        </div>
                    }

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('filter_show_total')}
                            id="filter_show_total"
                            label="Show Only Total"
                            type="single-line"
                            value={watch('filter_show_total') ? watch('filter_show_total') : false}
                            onChange={(e: any) => setValue('filter_show_total', e?.target?.checked)}
                        />
                    </div>

                    {/* v2.0.46 Shipper ต้องไม่มี checkboxes 'Show Total All Shippers' https://app.clickup.com/t/86etym1pq */}
                    {
                        (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && <div className="-mb-2">
                            <CheckboxSearch2
                                {...register('filter_show_total_all_shipper')}
                                id="filter_show_total_all_shipper"
                                label="Show Only Total All Shippers"
                                type="single-line"
                                value={watch('filter_show_total_all_shipper') ? watch('filter_show_total_all_shipper') : false}
                                onChange={(e: any) => setValue('filter_show_total_all_shipper', e?.target?.checked)}
                            />
                        </div>
                    }

                    {
                        (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && <div className="-mb-2">
                            <CheckboxSearch2
                                {...register('filter_only_public')}
                                id="filter_only_public"
                                label="Only Public"
                                type="single-line"
                                value={watch('filter_only_public') ? watch('filter_only_public') : false}
                                onChange={(e: any) => setValue('filter_only_public', e?.target?.checked)}
                            />
                        </div>
                    }

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BtnGeneral */}
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <CustomTooltip
                            title={
                                <div>
                                    <p className="text-[#464255] font-light">{`Acc. = Accumulated`}</p>
                                    <p className="text-[#464255] font-light">{`IMB. = Imbalance`}</p>
                                    <p className="text-[#464255] font-light">{`SOD. Park = Start of the day Park`}</p>
                                    <p className="text-[#464255] font-light">{`EOD. Park = End of the day Park`}</p>
                                    <p className="text-[#464255] font-light">{`Bal. = Balance`}</p>
                                    <p className="text-[#464255] font-light">{`AIP. = Absolute Imbalance Positive`}</p>
                                    <p className="text-[#464255] font-light">{`AIN. = Absolute Imbalance Negative`}</p>
                                    <p className="text-[#464255] font-light">{`Abslmb. = Absolute Imbalance`}</p>
                                    <p className="text-[#464255] font-light">{`YDN = YADANA`}</p>
                                    <p className="text-[#464255] font-light">{`YTG = YETAGUN`}</p>
                                    <p className="text-[#464255] font-light">{`ZTK = ZAWTIKA`}</p>
                                </div>
                            }
                            placement="top-end"
                            arrow
                        >
                            <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                                <InfoOutlinedIcon
                                    // sx={{ fontSize: 14 }}
                                    style={{ fontSize: "11px", color: '#747474', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>
                        </CustomTooltip>

                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        {/* <div className="font-semibold text-[14px] text-[#464255]">
                            {`Last Execute Version :`}
                        </div>
                        <div className="text-[14px] text-[#464255]">
                            {lastRetrieving ? lastRetrieving : ''}
                        </div> */}
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        {/*  */}
                        <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {epBalancingIntradayBalancingReport({ 
                                    name: 'Intraday Balance Report',
                                    initialColumns: initialColumns,
                                    columnVisibility: columnVisibilityNew, 
                                    resData: filteredDataTable,
                                    // resData: dataExport_,
                                    shipperGroupData: shipperGroupData?.data || [],
                                    filterShowTotal: showTotal,
                                    filterShowTotalAllShipper: showTotalAllShipper
                                    })}}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                        {/* <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="balancing/intraday-balancing-report"
                            can_export={userPermission ? userPermission?.f_export : false}
                            // can_export={userPermission?.f_export && selectedRoles?.length > 0 ? true : false}
                            disable={filteredDataTable?.length > 0 ? false : true}
                            columnVisibility={columnVisibilityNew}
                            initialColumns={initialColumns}
                            specificMenu='balance-report'
                            specificData={bodyExport}
                        /> */}
                    </div>
                </div>

                <TableMain
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibilityNew}
                    initialColumns={initialColumns}
                    userPermission={userPermission}
                    setCheckPublic={setCheckPublic}
                    // showTotal={watch('filter_show_total')}
                    // showTotalAllShipper={watch('filter_show_total_all_shipper')}
                    // isBothFalse={!watch('filter_show_total_all_shipper') && !watch('filter_show_total') ? true : false}
                    showTotal={showTotal}
                    showTotalAllShipper={showTotalAllShipper}
                    isBothFalse={!showTotal && !showTotalAllShipper ? true : false}
                    shipperGroupData={shipperGroupData?.data}
                />

            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                // itemsPerPage={itemsPerPage}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
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

            <ColumnVisibilityPopoverBalReport
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibilityNew}
                handleColumnToggle={handleColumnToggleNew}
                //  handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumns}
                initialColumns={userDT?.account_manage?.[0]?.user_type_id == 3 ? initialColumns?.filter((item: any) => item?.key !== 'publicate') : initialColumns}

            />

        </div>
    );
};

export default ClientPage;