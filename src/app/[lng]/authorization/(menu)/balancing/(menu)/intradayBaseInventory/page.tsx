"use client";
import { useEffect, useMemo, useState } from "react";
import { Tune } from "@mui/icons-material"
import ModalComponent from "@/components/other/ResponseModal";
import { findRoleConfigByMenuName, formatDate, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNoComma, generateUserPermission, removeComma } from '@/utils/generalFormatter';
import SearchInput from "@/components/other/searchInput";
import { postService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import ModalAction from "./form/modalAction";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import BtnGeneral from "@/components/other/btnGeneral";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getUserValue from "@/utils/getuserValue";
import TableBalanceIntradayBaseInventory from "./form/table";
import CheckboxSearch2, { InputSearch } from "@/components/other/SearchForm";
import { useForm } from "react-hook-form";
import ModalImport from "./form/modalImport";
import { ColumnDef } from "@tanstack/react-table";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

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
            //     const permission = findRoleConfigByMenuName('Intraday Base Inventory', userDT)
            //     setUserPermission(permission);
            // }

            // const permission = findRoleConfigByMenuName('Intraday Base Inventory', userDT)
            const permission = findRoleConfigByMenuName('Intraday Base Inventory Management', userDT)
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
    const { zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchAreaMaster());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, zoneMaster, areaMaster, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

    const [key, setKey] = useState(0);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchZone, setSrchZone] = useState('');
    const [srchMode, setSrchMode] = useState('');
    const [srchTimeStamp, setSrchTimeStamp] = useState('');
    const [bodySearch, setBodySearch] = useState<any>({});

    const handleFieldSearch = async () => {
        setIsLoading(false)

        let body_post = {
            gas_day: srchStartDate ? dayjs(srchStartDate).tz("Asia/Bangkok").format("YYYY-MM-DD") : dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD"), // YYYY-MM-DD ไม่เลือก ส่ง ว่าง "" || เข้ามาแล้วกด search เลยให้ default today
            zone: srchZone ? srchZone : "", // ไม่เลือก ส่ง ว่าง ""
            mode: srchMode ? srchMode : "", // ไม่เลือก ส่ง ว่าง ""
            active_mode: watch('active_mode'), // กำลังทำ ****
            latest_daily_version: watch('last_daily_version'),  // กำลังทำ ****
            latest_hourly_version: watch('last_hourly_version'),  // กำลังทำ ****
            timestamp: srchTimeStamp ? srchTimeStamp : "", // ไม่เลือก ส่ง ว่าง ""
            skip: 0, //part 1 = 0, part 2 = 100
            limit: 100
        }
        setBodySearch(body_post)

        const response = await postService('/master/balancing/intraday-base-inentory', body_post);
        setData(response?.data || response);
        setFilteredDataTable(response?.data || response);

        // DATA TIMESTAMP || DATA MODE 
        handleGetDataFilter(response?.data || response)

        setCurrentPage(1);

        setTimeout(() => {
            setIsLoading(true)
        }, 300);

    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchZone('')
        setSrchMode('')
        setSrchTimeStamp('')
        // setFilteredDataTable(dataTable);

        setValue('active_mode', false)
        setValue('last_daily_version', false)
        setValue('last_hourly_version', false)

        setData([])
        setFilteredDataTable([]);

        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    // const handleSearch = (query: string) => {
    //     const filtered = dataTable.filter(
    //         (item: any) => {
    //             const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
    //             return (
    //                 formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.gas_hour?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 (item?.gas_hour + ':00')?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.timestamp?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatDate(item?.timestamp)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.zone_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.mode?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

    //                 formatNumberFourDecimal(item?.hv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.base_inventory_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.high_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.high_difficult_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.high_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.high_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.alert_high)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.alert_low)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.low_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.low_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.low_difficult_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.low_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

    //                 formatNumberFourDecimalNoComma(item?.hv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.base_inventory_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.high_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.high_difficult_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.high_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.high_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.alert_high)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.alert_low)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.low_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.low_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.low_difficult_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimalNoComma(item?.low_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

    //                 removeComma(item?.hv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.base_inventory_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.high_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.high_difficult_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.high_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.high_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.alert_high)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.alert_low)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.low_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.low_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.low_difficult_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 removeComma(item?.low_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
    //             )
    //         }
    //     );
    //     setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    //     setFilteredDataTable(filtered);
    // };
        const handleSearch = (query: string) => {

        const filtered = dataTable?.filter(
            (item: any) => {
                const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
                return (
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.gas_hour?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // (item?.gas_hour + ':00')?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    ((item?.gas_hour ? item.gas_hour.toString().padStart(2, '0') + ':00' : '')).replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เติม 0 ด้านหน้าให้เป็น 2 หลัก แล้วตามด้วย ':00'
                    formatDate(item?.timestamp)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.timestamp?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zoneObj?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.groupObj?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.mode?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.heatingValue_base)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.high_dd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.high_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.high_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.high_alert)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.low_alert)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.low_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.low_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.low_dd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.low_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.high_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimalNoComma(item?.heatingValue_base)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.high_dd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.high_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.high_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.high_alert)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.low_alert)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.low_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.low_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.low_dd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.low_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.high_max)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)


                    // removeComma(item?.heatingValue_base)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.high_dd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.high_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.high_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.high_alert)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.low_alert)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.low_orange)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.low_red)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // removeComma(item?.low_dd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);
    const [dataTimestamp, setDataTimestamp] = useState<any>([]);
    const [dataMode, setDataMode] = useState<any>([]);

    const fetchData = async () => {
        setIsLoading(false)
        try {

            setValue('active_mode', true)
            setValue('last_daily_version', false)
            setValue('last_hourly_version', false)

            let body_post = {
                gas_day: dayjs().tz("Asia/Bangkok").format("YYYY-MM-DD"), // YYYY-MM-DD ไม่เลือก ส่ง ว่าง ""
                zone: srchZone ? srchZone : "", // ไม่เลือก ส่ง ว่าง ""
                mode: srchMode ? srchMode : "", // ไม่เลือก ส่ง ว่าง ""
                active_mode: watch('active_mode'), // กำลังทำ ****
                latest_daily_version: watch('last_daily_version'),  // กำลังทำ ****
                latest_hourly_version: watch('last_hourly_version'),  // กำลังทำ ****
                timestamp: srchTimeStamp ? srchTimeStamp : "", // ไม่เลือก ส่ง ว่าง ""
                skip: 0, //part 1 = 0, part 2 = 100
                limit: 100
            }
            setBodySearch(body_post)

            const response = await postService('/master/balancing/intraday-base-inentory', body_post);
            setData(response?.data || response);
            setFilteredDataTable(response?.data || response);

            setTimeout(() => {
                setIsLoading(true);
            }, 300);

            // DATA TIMESTAMP || DATA MODE 
            handleGetDataFilter(response?.data || response)

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }

        setTimeout(() => {
            setIsLoading(true);
        }, 300);
    };

    const handleGetDataFilter = (data?: any) => {

        // DATA TIMESTAMP
        const data_timestamp = Array.from(
            new Map(
                // data?.map((item: any) => [item.timestamp, { timestamp: formatDate(item.timestamp) }])
                data?.map((item: any) => [item.timestamp, { timestamp: item.timestamp }])
            ).values()
        );
        setDataTimestamp(data_timestamp);

        // DATA MODE
        const data_mode = Array.from(
            new Map(
                data?.map((item: any) => [item.mode, { mode: item?.mode, zone: item?.zone_text }])
            ).values()
        );
        setDataMode(data_mode);

        // DATA ZONE แบบไม่ซ้ำ
        const data_zone_de_dup = Array.from(
            new Map(
                zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
            ).values()
        );
        setDataZoneMasterZ(data_zone_de_dup);

    }

    useEffect(() => {
      console.log('dataZoneMasterZ : ', dataZoneMasterZ);
      const tdataMode = dataMode?.filter((itemx: any) => srchZone !== undefined ? srchZone.toLocaleLowerCase() == itemx?.zone.toLocaleLowerCase() : true)
      console.log('tdataMode : ', tdataMode);
    }, [dataZoneMasterZ])
    
    useEffect(() => {
        console.log('dataMode : ', dataMode);
        console.log('srchZone : ', srchZone);
        const tdataMode = dataMode?.filter((itemx: any) => (srchZone !== undefined && srchZone !== "") ? srchZone.toLocaleLowerCase() == itemx?.zone.toLocaleLowerCase() : true)
        console.log('tdataMode_ : ', tdataMode);
    }, [dataMode])
    
    

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>('create');

    const [formData, setFormData] = useState<any>([]);

    const handleFormSubmit = async (data: any) => {
        // switch (formMode) {
        //     case "create":

        //         break;
        //     case "edit":

        //         break;
        //     default:
        //         break;
        // }
        await fetchData();
        if (resetForm) resetForm();
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        // setFormData(fdInterface);
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('view');
        // setFormData(fdInterface);
        setFormData(filteredData);
        setFormOpen(true);
    };

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
        if (filteredDataTable && Array.isArray(filteredDataTable)) {
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            // setPaginatedData(filteredDataTable)
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // const paginatedData = Array.isArray(filteredDataTable)
    //     ? filteredDataTable.slice(
    //         (currentPage - 1) * itemsPerPage,
    //         currentPage * itemsPerPage
    //     )
    //     : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'gas_hour', label: 'Gas Hour', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'mode', label: 'Mode', visible: true },
        { key: 'hv', label: 'HV (BTU/SCF)', visible: true },
        { key: 'base_inventory_value', label: 'Base Inventory Value (MMBTU)', visible: true },
        { key: 'high_max', label: 'High Max (MMBTU)', visible: true },
        { key: 'high_difficult_day', label: 'High Difficult Day', visible: true },
        { key: 'high_red', label: 'High Red (MMBTU)', visible: true },
        { key: 'high_orange', label: 'High Orange (MMBTU)', visible: true },
        { key: 'alert_high', label: 'Alert High (MMBTU)', visible: true },
        { key: 'alert_low', label: 'Alert Low (MMBTU)', visible: true },
        { key: 'low_orange', label: 'Low Orange (MMBTU)', visible: true },
        { key: 'low_red', label: 'Low Red (MMBTU)', visible: true },
        { key: 'low_difficult_day', label: 'Low Difficult Day', visible: true },
        { key: 'low_max', label: 'Low Min (MMBTU)', visible: true }, // https://app.clickup.com/t/86eujrgt9
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

    // =================== MODAL IMPORT ===================
    const [formActionOpen, setformActionOpen] = useState(false); // open modal action
    const openTemplateForm = () => {
        setformActionOpen(true);
    };

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "gas_day_text_DDMMYY",
                header: "Gas Day",
                align: 'center',
            },
            {
                accessorKey: "gas_hour",
                header: "Gas Hour",
                align: 'center',
            },
            {
                accessorKey: "timestamp",
                header: "Timestamp",
                align: 'center',
                accessorFn: (row) => row.timestamp, // เก็บ string ไว้ใช้แสดง
                cell: (info) => info.getValue(),
                sortingFn: (rowA, rowB, columnId) => {
                    const a = dayjs(rowA.getValue(columnId), "DD/MM/YYYY HH:mm").valueOf();
                    const b = dayjs(rowB.getValue(columnId), "DD/MM/YYYY HH:mm").valueOf();
                    return a - b; // asc
                },
                width: 150
            },
            {
                accessorKey: "zoneObj.name",
                header: "Zone",
                align: 'center',
                cell: (info) => {
                    return (
                        <div
                            className="flex w-[120px] justify-center rounded-full px-1 py-2 text-[#464255]"
                            style={{ backgroundColor: info?.row?.original?.zoneObj?.color }}
                        >
                            {info?.row?.original?.zoneObj?.name ?? "-"}
                        </div>
                    )
                },
            },
            {
                accessorKey: "mode",
                header: "Mode",
            },
            {
                accessorKey: "hv",
                header: "HV (BTU/SCF)",
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.hv || 0),
            },
            {
                accessorKey: "base_inventory_value",
                header: "Base Inventory Value (MMBTU)",
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.base_inventory_value),
            },
            {
                accessorKey: "high_max",
                header: "High Max (MMBTU)",
                headerColor: "#606060",
                cellColor: "#c9c9c9",
                textStyle: 'bold',
                textColor: '#4b4b4b',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.high_max),
            },
            {
                accessorKey: "high_difficult_day",
                header: "High Difficult Day",
                headerColor: "#A855C5",
                cellColor: "#A855C51A",
                textStyle: 'bold',
                textColor: '#A855C5',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.high_difficult_day),
            },
            {
                accessorKey: "high_red",
                header: "High Red (MMBTU)",
                headerColor: "#EB484F",
                cellColor: "#EB484F1A",
                textStyle: 'bold',
                textColor: '#ED1B24',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.high_red),
            },
            {
                accessorKey: "high_orange",
                header: "High Orange (MMBTU)",
                headerColor: "#EF8538",
                cellColor: "#EF85381A",
                textStyle: 'bold',
                textColor: '#F06500',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.high_orange),
            },
            {
                accessorKey: "alert_high",
                header: "Alert High (MMBTU)",
                headerColor: "#EAC12E",
                cellColor: "#EAC12E1A",
                textStyle: 'bold',
                textColor: '#DFB419',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.alert_high),
            },
            {
                accessorKey: "alert_low",
                header: "Alert Low (MMBTU)",
                headerColor: "#EAC12E",
                cellColor: "#EAC12E1A",
                textStyle: 'bold',
                textColor: '#DFB419',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.alert_low),
            },
            {
                accessorKey: "low_orange",
                header: "Low Orange (MMBTU)",
                headerColor: "#EF8538",
                cellColor: "#EF85381A",
                textStyle: 'bold',
                textColor: '#F06500',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.low_orange),
            },
            {
                accessorKey: "low_red",
                header: "Low Red (MMBTU)",
                headerColor: "#EB484F",
                cellColor: "#EB484F1A",
                textStyle: 'bold',
                textColor: '#ED1B24',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.high_max),
            },
            {
                accessorKey: "low_difficult_day",
                header: "Low Difficult Day",
                headerColor: "#A855C5",
                cellColor: "#A855C51A",
                textStyle: 'bold',
                textColor: '#A855C5',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.low_difficult_day),
            },
            {
                accessorKey: "low_max",
                header: "Low Min (MMBTU)", // https://app.clickup.com/t/86eujrgt9
                headerColor: "#606060",
                cellColor: "#c9c9c9",
                textStyle: 'bold',
                textColor: '#4b4b4b',
                align: 'right',
                cell: (info) => formatNumberFourDecimal(info?.row?.original?.low_max),
            },
        ],
        []
    );

    const handleModeZone = async (data: any) => {
        // console.log('data : ', data);
        setIsLoading(false)
        let body_post = {
            "mode_text": data?.mode,
            "zone_text": data?.zone_text,
            "start_date": data?.gas_day_text + " " + data?.gas_hour + ":00"
        }

        let res_create = await postService('/master/parameter/mode-zone-base-inventory-create-text', body_post);
        const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        // console.log('res_create : ', res_create);
        // console.log('statusCode : ', statusCode);
        if (statusCode === 400 || statusCode === 500) {
            setIsLoading(true)
        } else {
            
        }
        await handleFieldSearch()
    };

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        isDefaultToday={true}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        type="select"
                        value={srchZone}
                        // onChange={(e) => setSrchZone(e.target.value)}
                        // options={zoneMaster?.data?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.name
                        // }))}
                        onChange={(e) => {
                            setSrchZone(e.target.value)
                        }}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <InputSearch
                        id="searchMode"
                        label="Mode"
                        type="select"
                        value={srchMode}
                        onChange={(e) => setSrchMode(e.target.value)}
                        // options={dataMode?.map((item: any) => ({
                        //     value: item.mode,
                        //     label: item.mode
                        // }))}
                        // options={dataMode?.filter((itemx: any) => srchZone !== undefined ? srchZone.toLocaleLowerCase() == itemx?.zone.toLocaleLowerCase() : true).map((item: any) => ({
                        options={dataMode?.filter((itemx: any) => (srchZone !== undefined && srchZone !== "") ? srchZone.toLocaleLowerCase() == itemx?.zone.toLocaleLowerCase() : true).map((item: any) => ({
                            value: item.mode,
                            label: item.mode
                        }))}
                    />

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('active_mode')}
                            id="active_mode"
                            label="Active Mode"
                            type="single-line"
                            value={watch('active_mode') ? watch('active_mode') : false}
                            onChange={(e: any) => setValue('active_mode', e?.target?.checked)}
                        />
                    </div>

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('last_daily_version')}
                            id="last_daily_version"
                            label="Latest Daily Version"
                            type="single-line"
                            value={watch('last_daily_version') ? watch('last_daily_version') : false}
                            onChange={(e: any) => setValue('last_daily_version', e?.target?.checked)}
                        />
                    </div>

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('last_hourly_version')}
                            id="last_hourly_version"
                            label="Latest Hourly Version"
                            type="single-line"
                            value={watch('last_hourly_version') ? watch('last_hourly_version') : false}
                            onChange={(e: any) => setValue('last_hourly_version', e?.target?.checked)}
                        />
                    </div>

                    <InputSearch
                        id="searchTimestamp"
                        // label="Timestamp"
                        label="Timestamp (Metering Retrieving)" // FAT-SPAIN ปรับ dropdown Timestamp  เป็น Timestamp (Metering Retrieving)
                        placeholder="Select Timestamp"
                        type="select"
                        value={srchTimeStamp}
                        onChange={(e) => setSrchTimeStamp(e.target.value)}
                        options={dataTimestamp?.map((item: any) => ({
                            value: item.timestamp,
                            label: item.timestamp
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />

                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnGeneral
                            bgcolor={"#00ADEF"}
                            modeIcon={'export'}
                            textRender={"Import"}
                            generalFunc={() => openTemplateForm()}
                            can_export={userPermission ? userPermission?.f_create : false} // R : import : ตรงข้างๆปุ่ม choose file มันขึ้นชื่อไฟล์เก่าที่เคยเลือกค้างอยู่ https://app.clickup.com/t/86etd7qv4 || ปุ่ม Import หายครับ User Type TSO ต้องเห็น
                        />
                    </div>
                </aside>

            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
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

                            {/* // อันบนไม่ใช้ */}
                            {/* <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => exportToExcel(paginatedData, 'intraday-base-inventory', columnVisibility)}
                                can_export={userPermission ? userPermission?.f_export : false}
                            /> */}

                            {/* // ใช้อันนี้ */}
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="balancing/intraday-base-inentory"
                                can_export={userPermission ? userPermission?.f_view : false} // ปรับสถานะกลับมาเป็น Q&A ได้เลยครับถ้าเห็นปุ่ม Export แล้วของ User Type TSO ครับ https://app.clickup.com/t/86etd84qp
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu={'intraday-base-inentory'}
                                specificData={bodySearch}
                            />
                        </div>
                    </div>
                </div>

                <TableBalanceIntradayBaseInventory
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    zoneMaster={zoneMaster?.data}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                    handleModeZone={handleModeZone}
                />

            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                zoneMasterData={zoneMaster?.data}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            <ModalImport
                mode={'template'}
                open={formActionOpen}
                setformActionOpen={setformActionOpen}
                setModalErrorMsg={setModalErrorMsg}
                setModalErrorOpen={setModalErrorOpen}
                setModalSuccessOpen={(open: boolean) => {
                    setModalSuccessOpen(open)
                    if (open) {
                        setformActionOpen(false)
                        handleFieldSearch()
                    }
                }}
                setModalSuccessMsg={setModalSuccessMsg}
                // shipperGroupData={shipperGroupData}
                // dataContractOriginal={dataContractOriginal}
                userDT={userDT}
                onClose={() => {
                    setformActionOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            // setFormMode(undefined);
                            resetForm();
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
                // description="Non TPA Point has been added."
                description={modalSuccessMsg}
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
                        {
                            modalErrorMsg?.split('<br/>').length > 1 ?
                                <ul className="text-start list-disc">
                                    {
                                        modalErrorMsg.split('<br/>').map(item => {
                                            return (
                                                <li>{item}</li>
                                            )
                                        })
                                    }
                                </ul>
                                :
                                <div className="text-center">
                                    {`${modalErrorMsg}`}
                                </div>
                        }
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
                // initialColumns={tabIndex == 0 ? initialColumns?.filter((item: any) => item?.key !== 'gas_hour') : initialColumns}
                initialColumns={initialColumns}
            />

        </div>
    );
};

export default ClientPage;