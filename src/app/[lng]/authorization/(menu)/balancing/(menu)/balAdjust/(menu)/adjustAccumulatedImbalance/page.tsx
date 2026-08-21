"use client";
import { useEffect, useRef, useState } from "react";
import { Tune } from "@mui/icons-material"
import ModalComponent from "@/components/other/ResponseModal";
import { exportToExcel, fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDate, formatDateTimeSec, formatNumberFourDecimal, formatTime, generateUserPermission, toDayjs } from '@/utils/generalFormatter';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import ModalAction from "./form/modalAction";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import BtnGeneral from "@/components/other/btnGeneral";
import ModalComment from "./form/modalComment";
import TableBalAdjustmentDailyImbalance from "./form/table";
import { InputSearch } from "@/components/other/SearchForm";
import getUserValue from "@/utils/getuserValue";
import ModalAllocAndBal from "@/components/other/modalAllocAndBal";
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import { handleSortWithoutUpdateSortState } from "@/utils/sortTable";

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
            //     const permission = findRoleConfigByMenuName('Adjust Accumulated Imbalance', userDT)
            //     setUserPermission(permission);
            // }

            // const permission = findRoleConfigByMenuName('Adjust Accumulated Imbalance', userDT)
            const permission = findRoleConfigByMenuName('Accumulated Imbalance Adjustment', userDT)
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
    const { zoneMaster, areaMaster, nominationPointData, contractPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchAreaMaster());
            dispatch(fetchNominationPoint());
            dispatch(fetchContractPoint());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, zoneMaster, areaMaster, nominationPointData, contractPointData, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);

    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);

    const handleFieldSearch = () => {
        const localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
        const result_2 = dataTable.filter((item: any) => {
            return (
                (srchStartDate ? localDate == item?.gas_day : true) &&
                // (srchShipperName ? srchShipperName == item?.group?.id : true) &&
                // (srchZone ? srchZone == item?.zone_obj?.id.toString() : true)
                // (srchZone ? srchZone == item?.zone_obj?.name : true)
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) &&
                (srchZone?.length > 0 ? srchZone.includes(item?.zone_obj?.name) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        // setFilteredDataTable(dataTable);
        setSrchShipperName([])
        setSrchZone([])

        fetchData('reset');
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
                return ((
                    item?.gas_day?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    toDayjs(item?.gas_day).format("DD/MM/YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zone_obj?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.adjust_imbalance?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.adjust_imbalance)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.dailyAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.dailyAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.finalDailyAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.finalDailyAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.intradayAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.intradayAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.finalIntradayAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.finalIntradayAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                    item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                    item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
                    formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '')?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
                )
                    &&
                    (
                        (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) &&
                        (srchZone?.length > 0 ? srchZone.includes(item?.zone_obj?.name) : true)
                    )
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // const [isModalOpen, setModalOpen] = useState(false);
    // const handleOpenModal = () => setModalOpen(true);

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [closeBalanceData, setCloseBalanceData] = useState<any>();
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);
    const sortRef = useRef<any>(null);

    const fetchData = async (mode?: string) => {
        try {
            setIsLoading(false)

            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id != 1 && userDT?.account_manage?.[0]?.user_type_id != 2) {
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.id])
            }

            // GET CLOSE BALANCE DATA
            const res_ = await getService(`/master/balancing/closed-balancing-report`)
            setCloseBalanceData(res_)

            // DATA ZONE
            const data_zone_master = Array.from(
                new Map(zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])).values()
            );
            setDataZoneMasterZ(data_zone_master);

            // DATA SHIPPER
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // // Group (2 = TSO, 3 = Shipper, 4 = Other)
            // const res_tso_name = await getService(`/master/account-manage/group-master?user_type=2`);
            // const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            // setDataShipper([...res_tso_name, ...res_shipper_name]);

            let startDate = toDayjs().startOf('month')
            let endDate = toDayjs().endOf('month')
            if (mode !== 'reset' && srchStartDate && toDayjs(srchStartDate).isValid()) {
                startDate = toDayjs(srchStartDate)
                endDate = toDayjs(srchStartDate)
            }

            const response: any = await getService(`/master/balancing/adjust-accumulated-imbalance?start_date=${startDate.format('YYYY-MM-DD')}&end_date=${endDate.format('YYYY-MM-DD')}&skip=100&limit=100`);

            const sortedGasDayData = response.sort((a: any, b: any) => toDayjs(b.gas_day).diff(toDayjs(a.gas_day))); // List > เอา Gas Day ล่าสุดอยู่บนสุด https://app.clickup.com/t/86euc9a2k

            // List > Shipper ต้องเห็นเฉพาะรายการของตัวเอง https://app.clickup.com/t/86et8dvg3
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                let filter_only_shipper_or_not: any = sortedGasDayData?.filter((item: any) => {
                    return item?.group?.id === userDT?.account_manage?.[0]?.group_id
                })
                setData(filter_only_shipper_or_not);
                setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
                const filteredData = (filter_only_shipper_or_not ?? []).filter((item: any) => {
                    return (
                        (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) &&
                        (srchZone?.length > 0 ? srchZone.includes(item?.zone_obj?.name) : true)
                    );
                });
                if (srchStartDate) {
                    const localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");
                    const result_2 = filteredData.filter((item: any) => {
                        return (
                            (srchStartDate ? localDate == item?.gas_day : true)
                        );
                    });
                    setFilteredDataTable(result_2);
                }
                else {
                    setFilteredDataTable(filteredData);
                }
            } else {
                setCurrentPage(1); // ตอน filter กลับไปหน้าแรก

                // ถ้าเสิช shipper name กับ zone เข้านี่
                if (srchShipperName?.length > 0 || srchZone?.length > 0) {
                    const result_2 = sortedGasDayData.filter((item: any) => {
                        return (
                            (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) && // Shipper ไม่เห็นข้อมูลอะไรเลย https://app.clickup.com/t/86eub6d4a
                            (srchZone?.length > 0 ? srchZone.includes(item?.zone_obj?.name) : true)
                        );
                    });
                    setData(result_2);
                    setFilteredDataTable(result_2);
                }
                else {
                    setData(sortedGasDayData);
                    setFilteredDataTable(sortedGasDayData);
                }
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

        let body_post = {
            "id": formData?.id,
            "adjustImbalance": data?.adjust_imbalance,
            // "start_date": "2025-01-01", // สำหรับทำ history
            // "end_date": "2025-02-28", // สำหรับทำ history
            // "start_date": dayjs().format('YYYY-MM-DD'), // สำหรับทำ history
            // "end_date": dayjs().format('YYYY-MM-DD'), // สำหรับทำ history
            "start_date": formData?.gas_day, // สำหรับทำ history
            "end_date": formData?.gas_day, // สำหรับทำ history
            "skip": "100", // สำหรับทำ history
            "limit": "100", // สำหรับทำ history
            "remark": data?.remark ? data?.remark : null
        }

        const body_comment = {
            "balancing_adjust_accumulated_imbalance_id": formData?.id,
            "remark": data?.remark ? data?.remark : null,
            "start_date": formData?.gas_day,
            "end_date": formData?.gas_day,
            "skip": 100, // ส่งแบบ หน้าเรียก table
            "limit": 100 // ส่งแบบ หน้าเรียก table
        }


        switch (formMode) {
            case "create":
                break;
            case "edit":
                setIsLoading(false)

                const res_edit = await postService('/master/balancing/adjust-accumulated-imbalance/adjust', body_post);
                const statusCode = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                const errorMsg = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {

                    try {
                        // เพิ่ม Field Comment ในหน้า List , Edit , History https://app.clickup.com/t/86eujrg8k
                        const res_comment = await postService('/master/balancing/adjust-accumulated-imbalance-comment', body_comment);
                    } catch (error) {

                    }

                    setFormOpen(false);
                    setModalSuccessMsg('Your changes have been saved.')
                    try {
                        await fetchData();
                    } catch (error) {
                    }
                    setModalSuccessOpen(true);
                }
                break;
        }
        await fetchData();
        if (resetForm) resetForm();
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('view');
        setFormData(filteredData);
        setFormOpen(true);
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

    const openHistoryForm = async (id: any) => {
        try {
            const response: any = await getService(`/master/account-manage/history?type=adjust-accumulated-imbalance&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "gas_day", title: "Gas Day" },
                // { key: "description", title: "Description" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                return {
                    title,
                    // value: value || "",
                    value: value ? toDayjs(value).format("DD/MM/YYYY") : '',
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

    // ############### DELETE MODAL ###############
    const [deleteOpen, setDeleteOpen] = useState(false);
    // const handleCloseDeleteModal = () => setDeleteOpen(false);
    const [deleteData, setDeleteData] = useState<any>();

    const openDeleteForm = async (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setDeleteData(filteredData);
        setDeleteOpen(true);
    }

    // ############### MODAL COMMENT ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {
        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
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

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'adjust_imbalance', label: 'Adjust Acc. Imbalance', visible: true },

        { key: 'daily_imbalance', label: 'Daily Acc. Imbalance', visible: true },
        // { key: 'daily_initial_imbalance', label: 'Daily Initial Imbalance', visible: true, parent_id: 'daily_imbalance' },
        // { key: 'daily_final_imbalance', label: 'Daily Final Imbalance', visible: true, parent_id: 'daily_imbalance' },
        { key: 'daily_initial_imbalance', label: 'Initial Acc. Imbalance', visible: true, parent_id: 'daily_imbalance' },
        { key: 'daily_final_imbalance', label: 'Final Acc. Imbalance', visible: true, parent_id: 'daily_imbalance' },

        { key: 'intraday_imbalance', label: 'Intraday Acc. Imbalance', visible: true },
        // { key: 'intraday_initial_imbalance', label: 'Intraday Initial Imbalance', visible: true, parent_id: 'intraday_imbalance' },
        // { key: 'intraday_final_imbalance', label: 'Intraday Final Imbalance', visible: true, parent_id: 'intraday_imbalance' },
        { key: 'intraday_initial_imbalance', label: 'Initial Acc. Imbalance', visible: true, parent_id: 'intraday_imbalance' },
        { key: 'intraday_final_imbalance', label: 'Final Acc. Imbalance', visible: true, parent_id: 'intraday_imbalance' },

        { key: 'comment', label: 'Comment', visible: true },  // เพิ่ม Field Comment ในหน้า List , Edit , History https://app.clickup.com/t/86eujrg8t
        { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'adjust_imbalance', label: 'Adjust Imbalance', visible: true },

        // { key: 'daily_imbalance', label: 'Daily Imbalance', visible: true },
        // { key: 'daily_initial_imbalance', label: 'Initial Imbalance', visible: true },
        // { key: 'daily_final_imbalance', label: 'Final Imbalance', visible: true },

        // { key: 'intraday_imbalance', label: 'Intraday Imbalance', visible: true },
        // { key: 'intraday_initial_imbalance', label: 'Initial Imbalance', visible: true },
        // { key: 'intraday_final_imbalance', label: 'Final Imbalance', visible: true },

        { key: 'daily_imbalance', label: 'Daily Acc. Imbalance', visible: true },
        // { key: 'daily_initial_imbalance', label: 'Daily Initial Imbalance', visible: true, parent_id: 'daily_imbalance' },
        // { key: 'daily_final_imbalance', label: 'Daily Final Imbalance', visible: true, parent_id: 'daily_imbalance' },
        { key: 'daily_initial_imbalance', label: 'Initial Acc. Imbalance', visible: true, parent_id: 'daily_imbalance' },
        { key: 'daily_final_imbalance', label: 'Final Acc. Imbalance', visible: true, parent_id: 'daily_imbalance' },

        { key: 'intraday_imbalance', label: 'Intraday Acc. Imbalance', visible: true },
        // { key: 'intraday_initial_imbalance', label: 'Intraday Initial Imbalance', visible: true, parent_id: 'intraday_imbalance' },
        // { key: 'intraday_final_imbalance', label: 'Intraday Final Imbalance', visible: true, parent_id: 'intraday_imbalance' },
        { key: 'intraday_initial_imbalance', label: 'Initial Acc. Imbalance', visible: true, parent_id: 'intraday_imbalance' },
        { key: 'intraday_final_imbalance', label: 'Final Acc. Imbalance', visible: true, parent_id: 'intraday_imbalance' },

        { key: 'comment', label: 'Comment', visible: true }, // เพิ่ม Field Comment ในหน้า List , Edit , History https://app.clickup.com/t/86eujrg8t
        { key: 'updated_by', label: 'Updated by', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    // const handleColumnToggle = (columnKey: string) => {
    //     setColumnVisibility((prev: any) => ({
    //         ...prev,
    //         [columnKey]: !prev[columnKey]
    //     }));
    // };
    const [tk, settk] = useState<boolean>(false);
    const handleColumnToggle = (columnKey: string) => {
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


    // ############### MODAL ALLOC AND BALANCE EXECUTE ###############
    const [mdExcuteOpen, setMdExecuteOpen] = useState(false);
    const [mdExcuteSuccessOpen, setMdExcuteSuccessOpen] = useState(false);
    const handleCloseModalExecute = () => setMdExcuteSuccessOpen(false);
    const handleExcute = async () => {

        setTimeout(() => {
            setMdExecuteOpen(true);
        }, 300);
    };

    // pop up allo&bal ต้องไม่รอ response ให้ขึ้น pop up สีเหลืองต่อได้เลย ส่วนผลการกดว่าผ่านหรือerror ให้ไปขึ้นใน noti แทน https://app.clickup.com/t/86ev5f735
    const handleExecuteAllocAndBal = async (data: any) => {
        setMdExcuteSuccessOpen(true)

        try {
            postService('/master/allocation/execute-data', { menu: 'Accumulated Imbalance Adjustment' });
        } catch (error) {
            // error alloc and bal
        }

        setTimeout(() => {
            // await fetchData();
            setMdExecuteOpen(false);
        }, 400);
    }

    const getDisplayData = () => {
        let sortState: { column: string | null | undefined, direction: "desc" | "asc" | null | undefined } | undefined = undefined
        if (sortRef?.current) {
            try {
                sortState = sortRef.current.getSort()
            } catch (error) {
                sortState = undefined
            }
        }

        const displayData = Array.isArray(filteredDataTable) ? filteredDataTable : []
        if (sortState) {
            return handleSortWithoutUpdateSortState(sortState, displayData)
        }
        else {
            return displayData
        }
    }

    const updatePaginationData = () => {
        const newList = getDisplayData().slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );

        setPaginatedData(newList)
    }

    useEffect(() => {
        updatePaginationData()
    }, [filteredDataTable, itemsPerPage, currentPage])

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox" // Filter Shipper Name และ Zone ปรับเป็น Multi Select https://app.clickup.com/t/86eue5dx3
                        value={srchShipperName}
                        // onChange={(e) => setSrchShipper(e.target.value)}
                        onChange={(e) => {
                            setSrchShipperName(e.target.value)
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
                        id="searchZoneMaster"
                        label="Zone"
                        // type="select"
                        type="select-multi-checkbox" // Filter Shipper Name และ Zone ปรับเป็น Multi Select https://app.clickup.com/t/86eue5dx3
                        value={srchZone}
                        onChange={(e) => setSrchZone(e.target.value)}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <BtnSearch handleFieldSearch={fetchData} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        {
                            // Shipper จะไม่เห็นปุ่ม Alloc & Bal https://app.clickup.com/t/86et8d33n
                            userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                            <BtnGeneral
                                textRender={"Alloc & Bal"}
                                iconNoRender={true}
                                bgcolor={"#00ADEF"}
                                generalFunc={handleExcute}
                                can_create={userPermission ? userPermission?.f_create : false}
                            />
                        }
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
                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    exportToExcel(getDisplayData(), 'adjustment-acc-imbalance', columnVisibility)
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                                disable={filteredDataTable?.length > 0 ? false : true}
                            />
                            {/* <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                data2={{
                                    start_date: srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : toDayjs().startOf('month').format("YYYY-MM-DD"),
                                    end_date: srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : toDayjs().endOf('month').format("YYYY-MM-DD"),
                                }}
                                path="balancing/adjust-accumulated-imbalance"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu={'adjustment-accumulated-imbalance'}
                            /> */}
                        </div>
                    </div>
                </div>

                <TableBalAdjustmentDailyImbalance
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                    openDeleteForm={openDeleteForm}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    zoneMaster={zoneMaster?.data}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    dataShipper={dataShipper}
                    userPermission={userPermission}
                    initialColumns={initialColumns}
                    closeBalanceData={closeBalanceData} // Function Edit ต้องสามารถ edit ได้เฉพาะรายการหลัง closing balance https://app.clickup.com/t/86eujrgd1
                    onSort={updatePaginationData}
                    ref={sortRef}
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

            <ModalComment
                data={dataReason}
                dataMain={dataReasonRow}
                setModalSuccessOpen={setModalSuccessOpen}
                open={mdReasonView}
                onClose={async () => {
                    setMdReasonView(false);
                    // await fetchData();
                }}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalSuccessMsg}
            />

            <ModalComponent
                open={mdExcuteSuccessOpen}
                handleClose={handleCloseModalExecute}
                title="Allocation and Balancing Execution"
                stat="process"
                // description="Non TPA Point has been added."
                description={
                    <div>
                        <div className="text-center text-[17px]">
                            {`Your request is currently being processed. `}
                        </div>
                        <div className="text-center text-[17px]">
                            {`You will be notified when it's finished.`}
                        </div>
                    </div>
                }
            />

            <ModalAllocAndBal
                data={[]}
                dataCloseBal={closeBalanceData}
                open={mdExcuteOpen}
                onClose={() => {
                    setMdExecuteOpen(false);
                    if (resetForm) resetForm();
                }}
                onSubmitUpdate={handleExecuteAllocAndBal}
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

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="adjustment-acc-imbalance"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            {/* <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            /> */}
            <ColumnVisibilityPopoverBalReport
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

        </div>
    );
};

export default ClientPage;