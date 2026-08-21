"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { filterMasterDataByDate, findRoleConfigByMenuName, formatNumberFourDecimal, formatNumberFourDecimalNoComma, generateUserPermission } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import { useAppDispatch } from "@/utils/store/store";
import { fetchTermType } from "@/utils/store/slices/termTypeMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from 'dayjs';
import TableBalIntradayAccImbalanceInventory from "./form/table";
import BtnGeneral from "@/components/other/btnGeneral";
import { useForm } from "react-hook-form";
import { CustomTooltip } from "@/components/other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import ModalAction from "./form/modalAction";
import { epBalancingIntradayAccImbalanceInventoryOriginal } from "@/utils/exportFunc";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    const [sortedData, setSortedData] = useState<any>([]);

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
            //     const permission = findRoleConfigByMenuName('Intraday Acc. Imbalance inventory', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Intraday Acc. Imbalance inventory', userDT)
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
    const { termTypeMaster, zoneMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {

        if (forceRefetch || !termTypeMaster?.data) {
            dispatch(fetchTermType());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch]); // Watch for forceRefetch changes


    // ############### FIELD SEARCH ###############
    const [checkPublic, setCheckPublic] = useState<boolean>(false);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchTimeStamp, setSrchTimeStamp] = useState('');

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

    const handleFieldSearch = async () => {
        setIsLoading(false);

        let body_post = {
            "gas_day": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            timestamp: srchTimeStamp,
            latest_daily_version: watch('filter_last_daily_version'),
            latest_hourly_version: watch('filter_last_hourly_version'),
            "skip": 0, 
            "limit": 100 
        }
        setBodyExport(body_post)
        const response = await postService('/master/balancing/intraday-acc-imbalance-inventory-original', body_post);

        // ข้อมูลที่แสดงในฝั่ง shipper จะเป็นเฉพาะรายการที่ถูกเลือก public ไว้จากฝั่ง TSO  ไม่ใช่ขึ้นทุกรายการ https://app.clickup.com/t/86eud8tq9
        let res_na: any = response
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            // เป็น shipper เอามาแค่ publication == true
            res_na = res_na?.filter((item: any) => item.publication == true)
        }

        // DATA TIMESTAMP
        const data_timestamp = Array.from(
            new Map(res_na?.map((item: any) => [item.timestamp, { timestamp: item.timestamp }])).values()
        );
        setDataTimestamp(data_timestamp);

        const result_2 = res_na?.filter((item: any) => {
            return (
                (srchTimeStamp ? item?.timestamp == srchTimeStamp : true)
            );
        });

        // const filtered_final = filterLatestData(result_2, watch("filter_last_daily_version"), watch("filter_last_hourly_version"));

        setCurrentPage(1)
        // setData(filtered_final)
        // setFilteredDataTable(filtered_final);
        setData(result_2)
        setFilteredDataTable(result_2);

        setTimeout(() => {
            setIsLoading(true);
        }, 300);

    };

    const handleReset = async () => {

        setValue('filter_last_daily_version', false)
        setValue('filter_last_hourly_version', false)

        setSrchTimeStamp('')
        setSrchStartDate(null)
        setData([])
        setFilteredDataTable([]);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        const filtered = dataTable.filter(
            (item: any) => {

                return (
                    item?.timestamp?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.gasHour?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.east_totalInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_totalInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.east_baseInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_baseInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.east_totalAccImbInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_totalAccImbInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.east_accImbExculdePTT?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_accImbExculdePTT?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.east_other?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_other?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.east_accImbInvPTT?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_accImbInvPTT?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.east_mode_zone?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west_mode_zone?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.east_totalInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_totalInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.east_baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.east_totalAccImbInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_totalAccImbInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.east_accImbExculdePTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_accImbExculdePTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.east_other)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_other)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.east_accImbInvPTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_accImbInvPTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.east_mode_zone)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west_mode_zone)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimalNoComma(item?.east_totalInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_totalInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.east_baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_baseInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.east_totalAccImbInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_totalAccImbInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.east_accImbExculdePTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_accImbExculdePTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.east_other)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_other)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.east_accImbInvPTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_accImbInvPTT)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.east_mode_zone)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.west_mode_zone)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0); // 0=daily, 1=weekly
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataModeZone, setDataModeZone] = useState<any>([]);
    const [dataTimestamp, setDataTimestamp] = useState<any>([]);
    const [bodyExport, setBodyExport] = useState<any>([]);
    const [dataZoneNoDup, setDataZoneNoDup] = useState<any>([]);

    const fetchData = async () => {
        try {
            setValue('filter_last_hourly_version', true) // v2.0.46 เข้ามาแล้วยังไม่ได้ Default Check boxes Last Hourly Version https://app.clickup.com/t/86etym1pn

            const zone_no_dup = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneNoDup(zone_no_dup);

            let res_mode: any = await getService(`/master/parameter/config-mode-zone-base-inventory`);

            const validModes = filterMasterDataByDate(res_mode);
            // Filter data to get only the latest start_date for each zone_id and mode combination
            if (validModes && Array.isArray(validModes) && validModes.length > 0) {
                // Group by zone_id and mode combination
                const grouped = validModes.reduce((acc: any, item: any) => {
                    const key = `${item.zone_id}_${item.mode}`;
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(item);
                    return acc;
                }, {});

                // For each group, find the item with the latest start_date
                const latestItems = Object.values(grouped).map((group: any) => {
                    return group.reduce((latest: any, current: any) => {
                        const currentDate = new Date(current.start_date);
                        const latestDate = new Date(latest.start_date);
                        return currentDate > latestDate ? current : latest;
                    });
                });
                setDataModeZone(latestItems)
            } else {
                setDataModeZone(validModes)
            }

            let body_post = {
                "gas_day": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                timestamp: srchTimeStamp,
                latest_daily_version: watch('filter_last_daily_version'),
                latest_hourly_version: watch('filter_last_hourly_version'),
                "skip": 0,
                "limit": 100
            }
            setBodyExport(body_post)
            const response = await postService('/master/balancing/intraday-acc-imbalance-inventory-original', body_post);
            setData(response);
            setFilteredDataTable(response)

            // DATA TIMESTAMP
            const data_timestamp = Array.from(
                new Map(
                    response?.map((item: any) => [item.timestamp, { timestamp: item.timestamp }])
                ).values()
            );
            setDataTimestamp(data_timestamp);

            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
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
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [

        { key: 'publicate', label: 'Publicate', visible: true },
        { key: 'gas_hour', label: 'Gas Hour', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },

        { key: 'acc_total_inventory_mmbtu', label: 'Acc. Total Inventory (MMBTU)', visible: true },
        { key: 'base_inventory', label: 'Base Inventory (MMBTU)', visible: true },
        { key: 'total_acc_imb_inventory_mmbtu', label: 'Total Acc. IMB. (Inventory) (MMBTU)', visible: true },
        { key: 'acc_imb_exclude_ptt_shipper_mmbtu', label: 'Acc. IMB. Exclude PTT Shipper (MMBTU)', visible: true },
        { key: 'other_mmbtu', label: 'Others (MMBTU)', visible: true },
        { key: 'acc_imb_inventory_for_ptt_shipper_mmbtu', label: 'Acc. IMB. Inventory for PTT Shipper (MMBTU)', visible: true },
        { key: 'mode_zone', label: 'Mode/Zone', visible: true },

        // sub of Acc. Total Inventory (MMBTU)
        { key: 'east_acc_total_inventory_mmbtu', label: 'East', visible: true, parent_id: 'acc_total_inventory_mmbtu' },
        { key: 'west_acc_total_inventory_mmbtu', label: 'West', visible: true, parent_id: 'acc_total_inventory_mmbtu' },

        // sub of Base Inventory (MMBTU)
        { key: 'east_base_inventory', label: 'East', visible: true, parent_id: 'base_inventory' },
        { key: 'west_base_inventory', label: 'West', visible: true, parent_id: 'base_inventory' },

        // sub of Total Acc. IMB. (Inventory) (MMBTU)
        { key: 'east_total_acc_imb_inventory_mmbtu', label: 'East', visible: true, parent_id: 'total_acc_imb_inventory_mmbtu' },
        { key: 'west_total_acc_imb_inventory_mmbtu', label: 'West', visible: true, parent_id: 'total_acc_imb_inventory_mmbtu' },

        // sub of Acc. IMB. Exclude PTT Shipper (MMBTU)
        { key: 'east_acc_imb_exclude_ptt_shipper_mmbtu', label: 'East', visible: true, parent_id: 'acc_imb_exclude_ptt_shipper_mmbtu' },
        { key: 'west_acc_imb_exclude_ptt_shipper_mmbtu', label: 'West', visible: true, parent_id: 'acc_imb_exclude_ptt_shipper_mmbtu' },

        // sub of Others (MMBTU)
        { key: 'east_other_mmbtu', label: 'East', visible: true, parent_id: 'other_mmbtu' },
        { key: 'west_other_mmbtu', label: 'West', visible: true, parent_id: 'other_mmbtu' },

        // sub of Acc. IMB. Inventory for PTT Shipper (MMBTU)
        { key: 'east_acc_imb_inventory_for_ptt_shipper_mmbtu', label: 'East', visible: true, parent_id: 'acc_imb_inventory_for_ptt_shipper_mmbtu' },
        { key: 'west_acc_imb_inventory_for_ptt_shipper_mmbtu', label: 'West', visible: true, parent_id: 'acc_imb_inventory_for_ptt_shipper_mmbtu' },

        // sub of Mode/Zone
        { key: 'east_mode_zone', label: 'East', visible: true, parent_id: 'mode_zone' },
        { key: 'west_mode_zone', label: 'West', visible: true, parent_id: 'mode_zone' },
    ];

    const [tk, settk] = useState<boolean>(false);
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

    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [formOpen, setFormOpen] = useState(false);
    const [formData, setFormData] = useState<any>([]);

    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data: any) => {
        let find_mode = dataModeZone?.find((item: any) => item?.id == data?.mode)
        const formattedHour = String(data?.hour).padStart(2, '0');
      
        let body_post = {
            "mode_id": data?.mode,
            "zone_id": find_mode?.zone_id,
            // "start_date": data?.start_date + ' ' + formattedHour + ':' + data?.minute + ':00'
            "start_date": data?.start_date + ' ' + data?.hour + ':' + data?.minute + ':00'
        }

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/parameter/mode-zone-base-inventory-create', body_post);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }
                break;
        }

        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        isDefaultToday={true}
                        allowClear
                        // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        onChange={(e: any) => {
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    <InputSearch
                        id="searchTimestamp"
                        // label="Timestamp"
                        label="Timestamp (Allocation)" // FAT SPAIN ปรับ dropdown Timestamp  เป็น Timestamp (Allocation)
                        placeholder="Select Timestamp"
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

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('filter_last_hourly_version')}
                            id="filter_last_hourly_version"
                            label="Last Hourly Version"
                            type="single-line"
                            value={watch('filter_last_hourly_version') ? watch('filter_last_hourly_version') : false}
                            onChange={(e: any) => setValue('filter_last_hourly_version', e?.target?.checked)}
                        />
                    </div>

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                {/* <aside className="mt-auto ml-1 w-full sm:w-auto">

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 && <div className="flex flex-wrap gap-2 justify-end">
                            <BtnGeneral
                                textRender={"Change Mode/Zone"}
                                iconNoRender={true}
                                bgcolor={"#3582D5"}
                                generalFunc={openCreateForm}
                                disable={false}
                                customWidthSpecific={170}
                                can_create={userPermission ? userPermission?.f_create : false}
                            />
                        </div>
                    }
                </aside> */}
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <CustomTooltip
                            title={
                                <div>
                                    <p className="text-[#464255] font-light">{`Acc. = Accumulate`}</p>
                                    <p className="text-[#464255] font-light">{`IMB. = Imbalance`}</p>
                                </div>
                            }
                            placement="top-end"
                            arrow
                        >
                            <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                                <InfoOutlinedIcon
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
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnGeneral
                            bgcolor={"#24AB6A"}
                            modeIcon={'export'}
                            textRender={"Export"}
                            generalFunc={() => {epBalancingIntradayAccImbalanceInventoryOriginal({ 
                                name: 'Intraday Acc Imbalance Inventory',
                                initialColumns: initialColumns,
                                columnVisibility: columnVisibilityNew, 
                                resData: sortedData,
                                })}}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                        {/* <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="balancing/intraday-acc-imbalance-inventory-original"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibilityNew}
                            initialColumns={initialColumns}
                            specificMenu={'intraday-acc-imbalance-inventory-original'}
                            specificData={bodyExport}
                        /> */}
                    </div>
                </div>

                <TableBalIntradayAccImbalanceInventory
                    tableData={paginatedData}
                    isLoading={isLoading}
                    gasWeekFilter={srchStartDate}
                    columnVisibility={columnVisibilityNew}
                    userPermission={userPermission}
                    tabIndex={tabIndex}
                    initialColumns={initialColumns}
                    setCheckPublic={setCheckPublic}
                    userDT={userDT}
                    sortedData={sortedData} 
                    setSortedData={setSortedData}
                />

            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
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

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                termTypeMasterData={termTypeMaster?.data}
                // zoneMasterData={zoneMaster?.data}
                zoneMasterData={dataZoneNoDup}
                dataModeZone={dataModeZone}
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