"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService } from "@/utils/postService";
import { Popover, Tab, Tabs } from '@mui/material';
import { TabTable } from '@/components/other/tabPanel';
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import getUserValue from "@/utils/getuserValue";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { decryptData } from "@/utils/encryptionData";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { useFetchMasters } from "@/hook/fetchMaster";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import { filterByDateRange, findRoleConfigByMenuName, formatDateNoTime, formatNumberFourDecimal, generateUserPermission, getDateRangeForApi } from "@/utils/generalFormatter";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ModalViewAllocReport from "./form/modalView";
import BtnExport from "@/components/other/btnExport";
import BtnAddNew from "@/components/other/btnAddNew";
import ModalAction from "./form/modalAction";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const [key, setKey] = useState(0);

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
            //     const permission = findRoleConfigByMenuName('Curtailments Allocation Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Curtailments Allocation Report', userDT)
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
    const { zoneMaster, areaMaster, nominationPointData } = useFetchMasters();
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
    }, [dispatch, zoneMaster, areaMaster, nominationPointData, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [srchCaseId, setSrchCaseId] = useState<any>('');
    const [srchNomPoint, setSrchNomPoint] = useState<any>([]);
    const [nomPointMaster, setNomPointMaster] = useState<any>([]);
    const [isAlreadyFilter, setIsAlreadyFilter] = useState<boolean>(false); // R1 : Filter ทั้งสองแถบ ทั้งเคยมีการ Filter ไว้ แล้วกดสลับแถบไปมา ข้อมูลในตารางของแต่ละแถบจะต้องคงเดิม จนกว่า user จะกด Reset Filter หรือ Refresh Brower https://app.clickup.com/t/86eu4np1u

    const handleFieldSearch = () => {
        let result_gasday_from_to: any = dataTable
        if (srchGasDayFrom || srchGasDayTo) {
            const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
            result_gasday_from_to = filterByDateRange(dataTable, start_date, end_date);
        }

        const normalizedSearch = srchCaseId?.replace(/\s+/g, '').toLowerCase().trim();
        const result = result_gasday_from_to.filter((item: any) => {
            const normalizedCaseId = item?.case_id?.replace(/\s+/g, '').toLowerCase().trim();
            return (
                (normalizedSearch ? normalizedCaseId.includes(normalizedSearch) : true) &&
                (srchArea?.length > 0 ? srchArea.includes(item?.areaObj?.id.toString()) : true) &&
                (srchNomPoint?.length > 0 ? srchNomPoint.includes(item?.nomination_point) : true)
                // (srchNomPoint ? item?.nomination_point == srchNomPoint : true)
            );
        });

        setIsAlreadyFilter(true)
        setCurrentPage(1)
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchCaseId('')
        setSrchNomPoint([]);
        setSrchArea([]);
        setSrchGasDayFrom(null);
        setSrchGasDayTo(null);
        setFilteredDataTable(dataTable);
        setIsAlreadyFilter(false)
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    // const handleSearch = (query: string) => {
    //     const filtered = dataTable?.filter(
    //         (item: any) => {
    //             const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
    //             return (
    //                 item?.case_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.area?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.max_capacity?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.max_capacity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.nomination_value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatNumberFourDecimal(item?.nomination_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.unit?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
    //             )
    //         }
    //     );
    //     setFilteredDataTable(filtered);
    // };

    // ############### DATA TABLE ###############

    const [tabIndex, setTabIndex] = useState(0);
    const [dataTable, setData] = useState<any>([]);
    // const [closeBalanceData, setCloseBalanceData] = useState<any>();
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [makeFetch, setMakeFetch] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);

    const fetchData = async () => {
        try {
            // DATA Nomination Point master
            const map_option = nominationPointData?.data?.map((item: any) => ({
                value: item.nomination_point,
                label: item.nomination_point
            }))
            setNomPointMaster(map_option)

            // GET CLOSE BALANCE DATA
            // const res_ = await getService(`/master/balancing/closed-balancing-report`)
            // setCloseBalanceData(res_)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // DATA MAIN TAB AREA
            if (tabIndex == 0) {
                const response: any = await getService(`/master/allocation/curtailments-allocation?type=1`);
                setData(response);
                setFilteredDataTable(response);

            } else {
                const response: any = await getService(`/master/allocation/curtailments-allocation?type=2`);
                setData(response);
                setFilteredDataTable(response);
            }

            // // Tab Daily / Tab Intraday : Shipper จะต้องเห็นแค่ของตัวเอง https://app.clickup.com/t/86et8d2wt
            // if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            //     let filter_response_only_own_shipper = response?.filter((item: any) =>
            //         userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true
            //     )
            //     setData(filter_response_only_own_shipper);
            //     setFilteredDataTable(filter_response_only_own_shipper);
            // } else {
            //     setData(response);
            //     setFilteredDataTable(response);
            // }
            // setData([]);
            // setFilteredDataTable([]);

            setMakeFetch(false)
            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        if (makeFetch) {
            setIsLoading(false)
            fetchData();
        }
    }, [makeFetch])

    const fetchK = async (tabIndex: any) => {
        setIsLoading(false);

        const response: any = await getService(`/master/allocation/curtailments-allocation?type=${tabIndex == 0 ? '1' : '2'}`);
        setData(response);
        setFilteredDataTable(response);

        setIsLoading(true);
    }

    useEffect(() => {
        if (!isAlreadyFilter) {  // R1 : Filter ทั้งสองแถบ ทั้งเคยมีการ Filter ไว้ แล้วกดสลับแถบไปมา ข้อมูลในตารางของแต่ละแถบจะต้องคงเดิม จนกว่า user จะกด Reset Filter หรือ Refresh Brower https://app.clickup.com/t/86eu4np1u
            fetchK(tabIndex);
        }
    }, [tabIndex])

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        mode_account: '',
        id_name: '',
        role: '',
        system_login_account: [],
    };

    const [formData, setFormData] = useState(fdInterface);
    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    // ############# MODAL VIEW #############
    const [viewOpen, setViewOpen] = useState(false);
    const [viewDataMain, setViewDataMain] = useState<any>([]);
    const [viewData, setViewData] = useState<any>([]);

    const openViewForm = async (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setViewDataMain(filteredData)

        setViewData(filteredData);
        setViewOpen(true);

        setAnchorPopover(null) // ทั้งสองแถบ :  กด View แล้ว Modal View ที่มาจากการกด Action ค้าง https://app.clickup.com/t/86eu4npp6
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('Curtailments Allocation has been saved.');

    // MODAL CREATE OPEN
    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'case_id', label: 'Case ID', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'maximum_capacity', label: 'Maximum Capacity', visible: true },
        { key: 'nominated_value', label: 'Nomination Value', visible: true },
        { key: 'units', label: 'Unit', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsNomination: any = [
        { key: 'case_id', label: 'Case ID', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'maximum_capacity', label: 'Maximum Capacity', visible: true },
        { key: 'nominated_value', label: 'Nomination Value', visible: true },
        { key: 'units', label: 'Unit', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsView: any = [
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'nomination_value', label: 'Nomination Value', visible: true },
        { key: 'remaining_capacity', label: 'Remaining Capacity', visible: true },
    ];

    const filteredColumns = tabIndex === 0 ? initialColumns : initialColumnsNomination;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible])))
    }, [tabIndex])

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    // const handleColumnToggle = (columnKey: string) => {
    //     setColumnVisibility((prev: any) => ({
    //         ...prev,
    //         [columnKey]: !prev[columnKey]
    //     }));
    // };

    const handleColumnToggle = (columnKey: string | VisibilityState) => {
        if (typeof columnKey === 'string') {
            // Handle string case - single column toggle
            setColumnVisibility((prev: any) => ({
                ...prev,
                [columnKey]: !prev[columnKey]
            }));
        } else if (typeof columnKey === 'object' && columnKey !== null) {
            // Handle VisibilityState object case - bulk column visibility update
            setColumnVisibility((prev: any) => ({
                ...prev,
                ...columnKey
            }));
        }
    };

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const handleFormSubmit = async (data: any) => {

        const res_ = await postService('/master/allocation/curtailments-allocation-calc-save', data);
        const statusCode = res_?.response?.data?.statusCode ?? res_?.response?.data?.status ?? res_?.status ?? res_?.statusCode ?? res_?.code ?? res_?.response?.status;
        const errorMsg = res_?.response?.data?.error ?? res_?.data?.error ?? res_?.response?.error ?? res_?.error;

        if (statusCode === 400 || statusCode === 500) {
            setFormOpen(false);
            setModalErrorMsg(errorMsg || '');
            setModalErrorOpen(true)
        } else {
            setFormOpen(false);

            setModalSuccessMsg(`Curtailments Allocation have been saved.`);
            setModalSuccessOpen(true);
            fetchData();
        }
    }

    // Filter ของทั้งสองแถบ ไม่ได้ใช้ร่วมกัน เมื่อเปลี่ยนแถบจะต้อง Reset หรือไม่ก็เป็นของแถบนั้นๆที่เคย Select ไว้ก่อนเปลี่ยนแถบ (เอาตามที่ทำไว้ครับ) https://app.clickup.com/t/86etcnk7x
    // useEffect(() => {
    //     setSrchCaseId('')
    //     setSrchNomPoint('')
    //     setSrchArea([]);
    //     setSrchGasDayFrom(null);
    //     setSrchGasDayTo(null);
    //     setFilteredDataTable(dataTable);
    //     setKey((prevKey) => prevKey + 1);
    // }, [tabIndex])

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('Curtailments Allocation Report', userDT)
        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    const [tk, settk] = useState(false);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);
    const [dataExport, setDataExport] = useState<any>([]);

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

    const columnsArea = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "case_id",
                header: "Case ID",
                enableSorting: true,
                accessorFn: (row: any) => row?.case_id || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.case_id ? row?.case_id : ''}</div>
                    )
                }
            },
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.gas_day) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "area",
                header: "Area",
                enableSorting: true,
                accessorFn: (row: any) => row?.areaObj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            {
                                row?.areaObj ?
                                    row?.areaObj?.entry_exit_id == 2 ?
                                        <div
                                            className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                            style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                        >
                                            {`${row?.areaObj?.name}`}
                                        </div>
                                        :
                                        <div
                                            className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                            style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                        >
                                            {`${row?.areaObj?.name}`}
                                        </div>
                                    : null
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "max_capacity",
                header: "Maximum Capacity",
                enableSorting: true,
                enableGlobalFilter: true,
                sortDescFirst: false, // 👈 สำคัญมาก
                accessorFn: (row: any) => {
                    const raw = row?.max_capacity;
                    if (raw === null || raw === undefined) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const noDecimal = fixed.split('.')[0];      // เช่น 10000.0000
                    const noCommaNoDecimal = noDecimal.replace(/,/g, ''); // 10000

                    return `${fixed} ${noComma} ${noDecimal} ${noCommaNoDecimal}`;
                },

                // 🔹 SORT แบบตัวเลขจริง
                sortingFn: (rowA, rowB, columnId) => {
                    const extractNumber = (value: unknown) => {
                        if (!value) return 0;

                        // เอาเฉพาะตัวแรกก่อน space
                        const first = String(value).split(' ')[0]; // "100,000.0000"
                        return Number(first.replace(/,/g, ''));    // 100000.0000
                    };

                    const a = extractNumber(rowA.getValue(columnId));
                    const b = extractNumber(rowB.getValue(columnId));

                    return a - b;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-right">{row?.max_capacity !== null && row?.max_capacity !== undefined ? formatNumberFourDecimal(row?.max_capacity) : null}</div>
                    )
                }
            },
            {
                accessorKey: "nomination_value",
                header: "Nomination Value",
                enableSorting: true,
                enableGlobalFilter: true,
                sortDescFirst: false, // 👈 สำคัญมาก
                accessorFn: (row: any) => {
                    const raw = row?.nomination_value;
                    if (raw === null || raw === undefined) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const noDecimal = fixed.split('.')[0];      // เช่น 10000.0000
                    const noCommaNoDecimal = noDecimal.replace(/,/g, ''); // 10000

                    return `${fixed} ${noComma} ${noDecimal} ${noCommaNoDecimal}`;
                },

                // 🔹 SORT แบบตัวเลขจริง
                sortingFn: (rowA, rowB, columnId) => {
                    const extractNumber = (value: unknown) => {
                        if (!value) return 0;

                        // เอาเฉพาะตัวแรกก่อน space
                        const first = String(value).split(' ')[0]; // "100,000.0000"
                        return Number(first.replace(/,/g, ''));    // 100000.0000
                    };

                    const a = extractNumber(rowA.getValue(columnId));
                    const b = extractNumber(rowB.getValue(columnId));

                    return a - b;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className="text-right">{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                        <div className="text-right">{row?.nomination_value !== null && row?.nomination_value !== undefined ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                    )
                }
            },
            {
                accessorKey: "units",
                header: "Unit",
                enableSorting: true,
                accessorFn: (row: any) => row?.unit || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.unit ? row?.unit : null}</div>
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
                    const getPermission: any = renderPermission();
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={getPermission?.f_view == true ? false : true}
                        />
                    )
                }
            },
        ],
        []
    );

    const columnsNomination = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "case_id",
                header: "Case ID",
                enableSorting: true,
                accessorFn: (row: any) => row?.case_id || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.case_id ? row?.case_id : ''}</div>
                    )
                }
            },
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.gas_day) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "area",
                header: "Area",
                enableSorting: true,
                accessorFn: (row: any) => row?.areaObj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            {
                                row?.areaObj ?
                                    row?.areaObj?.entry_exit_id == 2 ?
                                        <div
                                            className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                            style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                        >
                                            {`${row?.areaObj?.name}`}
                                        </div>
                                        :
                                        <div
                                            className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                            style={{ backgroundColor: row?.areaObj?.color, width: '40px', height: '40px' }}
                                        >
                                            {`${row?.areaObj?.name}`}
                                        </div>
                                    : null
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "nomination_point",
                header: "Nomination Point",
                enableSorting: true,
                accessorFn: (row: any) => row?.nomination_point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.nomination_point ? row?.nomination_point : null}</div>
                    )
                }
            },
            {
                accessorKey: "max_capacity",
                header: "Maximum Capacity",
                enableSorting: true,
                // accessorFn: (row: any) => formatNumberFourDecimal(row?.max_capacity) || '',
                accessorFn: (row: any) => {
                    const raw = row?.max_capacity;
                    if (!raw) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const rounded = parseFloat(raw).toString(); // เช่น 10000

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className="text-right">{row?.max_capacity ? formatNumberFourDecimal(row?.max_capacity) : null}</div>
                        <div className="text-right">{row?.max_capacity !== null && row?.max_capacity !== undefined ? formatNumberFourDecimal(row?.max_capacity) : null}</div>
                    )
                }
            },
            {
                accessorKey: "nomination_value",
                header: "Nomination Value",
                enableSorting: true,
                // accessorFn: (row: any) => formatNumberFourDecimal(row?.nomination_value) || '',
                accessorFn: (row: any) => {
                    const raw = row?.nomination_value;
                    if (!raw) return '';

                    const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
                    const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
                    const rounded = parseFloat(raw).toString(); // เช่น 10000

                    return `${fixed} ${noComma} ${rounded}`;
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className="text-right">{row?.nomination_value ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                        <div className="text-right">{row?.nomination_value !== null && row?.nomination_value !== undefined ? formatNumberFourDecimal(row?.nomination_value) : null}</div>
                    )
                }
            },
            {
                accessorKey: "units",
                header: "Unit",
                enableSorting: true,
                accessorFn: (row: any) => row?.unit || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.unit ? row?.unit : null}</div>
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
                    const getPermission: any = renderPermission();
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={getPermission?.f_view == true ? false : true}
                        />
                    )
                }
            },
        ],
        []
    );

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

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                break;
        }
    }

    return (
        <div className="space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchAreaName"
                        label="Case ID"
                        value={srchCaseId}
                        type="text"
                        onChange={(e) => setSrchCaseId(e.target.value)}
                        placeholder="Search Case ID"
                    />

                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        // isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        min={srchGasDayFrom}
                        // isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                    />

                    <InputSearch
                        id="searchAreaName"
                        label="Area"
                        value={srchArea}
                        type="select-multi-checkbox"
                        onChange={(e) => setSrchArea(e.target.value)}
                        placeholder="Select Area"
                        options={areaMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    {
                        // srchArea.includes(item?.areaObj?.id.toString())
                        tabIndex == 1 && <InputSearch
                            id="searchNomPointx"
                            label="Nomination Point"
                            value={srchNomPoint}
                            type="select-multi-checkbox" // https://app.clickup.com/t/86eu4pacr Tab Nomination : Filter Nomination ปรับให้เป็น Multi Select
                            onChange={(e) => setSrchNomPoint(e.target.value)}
                            placeholder="Select Nomination Point"
                            // options={nominationPointData?.data?.map((item: any) => ({
                            //     value: item.nomination_point,
                            //     label: item.nomination_point
                            // }))}

                            // กรองซ้ำ nominationPointData
                            options={nominationPointData?.data?.filter((item: any, index: any, self: any): any =>
                                index === self.findIndex((i: any) => i.nomination_point === item.nomination_point)
                            ).filter((itemx: any) => srchArea?.length > 0 ? srchArea.includes(itemx?.area?.id?.toString()) : true).map((item: any) => ({
                                value: item.nomination_point,
                                label: item.nomination_point
                            }))}

                        // options={nomPointMaster?.filter((itemx: any) => srchArea?.length > 0 ? srchArea.includes(itemx?.area?.id?.toString()) : true).map((item: any) => ({
                        //     value: item.nomination_point,
                        //     label: item.nomination_point
                        // }))}
                        // options={nominationPointData?.data}
                        />
                    }

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />

                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <div className="flex flex-wrap gap-2 justify-end">
                            <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
                        </div>
                    </div>
                </aside>
            </div>

            <Tabs
                value={tabIndex}
                onChange={handleChange}
                aria-label="tabs"
                sx={{
                    marginBottom: "-19px !important",
                    "& .MuiTabs-indicator": {
                        display: "none", // Remove the underline
                    },
                    "& .Mui-selected": {
                        color: "#58585A !important",
                    },
                }}
            >
                {["Area", "Nomination"].map((label, index) => (
                    <Tab
                        key={label}
                        label={label}
                        id={`tab-${index}`}
                        sx={{
                            fontFamily: "Tahoma !important",
                            border: "1px solid",
                            borderColor: "#DFE4EA",
                            borderBottom: "none",
                            borderTopLeftRadius: "9px",
                            borderTopRightRadius: "9px",
                            textTransform: "none",
                            padding: "8px 16px",
                            backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                            color: tabIndex === index ? "#58585A" : "#9CA3AF",
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            "&:hover": {
                                backgroundColor: "#F3F4F6",
                            },
                        }}
                    />
                ))}
            </Tabs>

            <div className="border-[#DFE4EA] border-[1px] p-2 rounded-tl-none rounded-tr-lg shadow-sm">
                {/* <div>
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
                                path="allocation/curtailments-allocation"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={tabIndex == 0 ? initialColumns : initialColumnsNomination}
                                specificMenu='curtailments-allocation'
                                tabIndex={tabIndex == 0 ? 1 : 2}
                            />
                        </div>
                    </div>
                </div> */}

                <TabTable value={tabIndex} index={0}>
                    {/* <TableAlloCurtailArea
                        openEditForm={openEditForm}
                        openViewForm={openViewForm}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        // tableData={dataTable}
                        tableData={paginatedData}
                        isLoading={isLoading}
                        setMakeFetch={setMakeFetch}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        userDT={userDT}
                    /> */}

                    {/* ================== NEW TABLE ==================*/}
                    <AppTable
                        data={filteredDataTable}
                        columns={columnsArea}
                        isLoading={isLoading}
                        exportBtn={
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="allocation/curtailments-allocation"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={tabIndex == 0 ? initialColumns : initialColumnsNomination}
                                specificMenu='curtailments-allocation'
                                tabIndex={tabIndex == 0 ? 1 : 2}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            const newData = filteredData || [];
                            // Check if the filtered data is different from current dataExport
                            if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                                setDataExport(newData);
                            }
                        }}
                        border={false}
                        fixHeight={false}
                    />
                </TabTable>

                <TabTable value={tabIndex} index={1}>
                    {/* <TableAlloCurtailNomination
                        openEditForm={openEditForm}
                        openViewForm={openViewForm}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        // tableData={dataTable}
                        setMakeFetch={setMakeFetch}
                        tableData={paginatedData}
                        // tableData={[]}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        userDT={userDT}
                    /> */}

                    {/* ================== NEW TABLE ==================*/}
                    <AppTable
                        data={filteredDataTable}
                        columns={columnsNomination}
                        isLoading={isLoading}
                        exportBtn={
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="allocation/curtailments-allocation"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={tabIndex == 0 ? initialColumns : initialColumnsNomination}
                                specificMenu='curtailments-allocation'
                                tabIndex={tabIndex == 0 ? 1 : 2}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            const newData = filteredData || [];
                            // Check if the filtered data is different from current dataExport
                            if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                                setDataExport(newData);
                            }
                        }}
                        border={false}
                        fixHeight={false}
                    />
                </TabTable>

            </div>

            {/* <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

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
                dataTable={dataTable}
                tabIndex={tabIndex}
                dataShipper={dataShipper}
                nominationPointData={nominationPointData?.data}
                areaMaster={areaMaster?.data}
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

            <ModalViewAllocReport
                open={viewOpen}
                handleClose={() => {
                    setViewOpen(false);
                    if (resetForm) resetForm();
                }}
                data={viewData}
                dataMain={viewDataMain}
                tabIndex={tabIndex}
                initialColumns={initialColumnsView}
                userPermission={userPermission}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumns}
                initialColumns={tabIndex == 0 ? initialColumns?.filter((item: any) => item?.key !== 'gas_hour') : initialColumns}
            />

            <Popover
                id="action-menu-popover"
                open={!!anchorPopover}
                anchorEl={anchorPopover}
                onClose={() => setAnchorPopover(null)}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                }}
                className="z-50"
            >
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }
                    </ul>
                </div>
            </Popover>

        </div>
    )
}

export default ClientPage;