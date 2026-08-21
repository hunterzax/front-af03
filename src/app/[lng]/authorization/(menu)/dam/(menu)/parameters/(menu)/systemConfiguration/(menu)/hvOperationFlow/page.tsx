"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission } from "@/utils/generalFormatter";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import TableHvForOperationFlow from "./form/table";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Popover } from "@mui/material";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";

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

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('HV for Operation Flow and Instructed Flow', userDT)
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
    const { zoneMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, zoneMaster, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchType, setSrchType] = useState<any>([]);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        const result = dataTable.filter((item: any) => {
            return (
                // (srchType ? item?.hv_type_id == srchType : true) &&
                (srchType?.length > 0 ? srchType.includes(item?.hv_type_id.toString()) : true) &&
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true)
                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchShipperName([])
        setSrchType([])
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = dataTable.filter(
            (item: any) => {
                return (
                    item?.hv_type?.type?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.metering_point?.metered_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.start_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                    item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                    item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
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
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataHvType, setDataHvType] = useState<any>([]);
    const [dataHvMeter, setDataHvMeter] = useState<any>([]);
    const [dataHvConcept, setDataHvConcept] = useState<any>([]);
    const [dataTypeMC, setDataTypeMC] = useState<any>([]);
    const [dataZone, setDataZone] = useState<any[]>([]);
    const fetchedRef = useRef(false);

    const fetchData = async () => {
        try {

            const [response, res_shipper_name, res_hv_meter_point, res_hv_type, res_hv_concept_point, metering_concept_type, zone] = await Promise.all([
                getService(`/master/hv-for-peration-flow-and-instructed-flow`),
                getService(`/master/account-manage/group-master?user_type=3`),
                getService(`/master/hv-for-peration-flow-and-instructed-flow/metering-point`),
                getService(`/master/hv-for-peration-flow-and-instructed-flow/hv-type`),
                getService(`/master/hv-for-peration-flow-and-instructed-flow/concept-point`),
                getService(`/master/hv-for-peration-flow-and-instructed-flow/metering-concept-type`),
                getService(`/master/asset/zone?entry_exit_id=1&onlyActive=true`),
            ]);
            let filtered_meter_point = res_hv_meter_point?.filter((items: any) => items?.entry_exit_id == 1)

            setDataHvType(res_hv_type)
            setDataHvMeter(filtered_meter_point)
            setDataHvConcept(res_hv_concept_point)
            setDataTypeMC(metering_concept_type)
            setDataShipper(res_shipper_name)
            setDataZone(zone)
            setData(response);
            setFilteredDataTable(response);
            // setIsLoading(true);

        } catch (err) {
            // setError(err.message);
        } finally {
            setIsLoading(true);
        }
    };

    const getDataThenFilter = async () => {
        setIsLoading(false);
        try {
            const response = await getService(`/master/hv-for-peration-flow-and-instructed-flow`);
            if(response && Array.isArray(response)) {
                setData(response);
                const result = response.filter((item: any) => {
                    return (
                        // (srchType ? item?.hv_type_id == srchType : true) &&
                        (srchType?.length > 0 ? srchType.includes(item?.hv_type_id.toString()) : true) &&
                        (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true)
                        // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true)
                    );
                });
        
                setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
                setFilteredDataTable(result);
            }
        } catch (error) {
            console.log('error getData : ', error);
        } finally {
            setIsLoading(true);
        }
    }

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        fetchData();
        // getPermission();
    }, []);

    useEffect(() => {
        getPermission();
    }, []);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [formData, setFormData] = useState<any>();

    const handleFormSubmit = async (data: any) => {

        let body_post = {
            "hv_type_id": data?.hv_type_id, //1 System, 2 Shipper
            "group_id": data?.hv_type_id == 1 ? null : data?.group_id, // hv_type_id 1 ใส่ null | hv_type_id 2 ใส่ id shipper
            "meter_concept_type_id": data?.meter_concept_type,
            "metering_point_id": data?.meter_point || null,
            "concept_point_id": data?.concept_point || null,
            "start_date": data?.start_date
        }

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/hv-for-peration-flow-and-instructed-flow', body_post);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    getDataThenFilter()
                    setFormOpen(false);
                    setModalSuccessMsg('HV for Operation Flow and Instructed Flow has been added.')
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let res_update = await putService(`/master/hv-for-peration-flow-and-instructed-flow/${selectedId}`, body_post);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    getDataThenFilter()
                    setFormOpen(false);
                    setModalSuccessMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }
                break;
        }

        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(undefined);
        setFormOpen(true);
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
            const response: any = await getService(`/master/account-manage/history?type=hv-for-peration-flow-and-instructed-flow&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);
            let mappings = []

            if (valuesArray[0]?.hv_type_id == 1) {
                setColHistory([
                    { key: 'type', label: 'Type', visible: true },
                    { key: 'type_meter_concept', label: 'Type Meter/Concept', visible: true },
                    { key: 'meter_point', label: 'Meter Point', visible: true },
                    { key: 'concept_point', label: 'Concept Point', visible: true },
                    { key: 'start_date', label: 'Start Date', visible: true },
                    { key: 'created_by', label: 'Created by', visible: true },
                    { key: 'updated_by', label: 'Updated by', visible: true },
                ])
                mappings = [
                    { key: "hv_type.type", title: "Type" },
                ];
            } else {
                setColHistory([
                    { key: 'type', label: 'Type', visible: true },
                    { key: 'shipper_name', label: 'Shipper Name', visible: true },
                    { key: 'type_meter_concept', label: 'Type Meter/Concept', visible: true },
                    { key: 'meter_point', label: 'Meter Point', visible: true },
                    { key: 'concept_point', label: 'Concept Point', visible: true },
                    { key: 'start_date', label: 'Start Date', visible: true },
                    { key: 'created_by', label: 'Created by', visible: true },
                    { key: 'updated_by', label: 'Updated by', visible: true },
                ])
                mappings = [
                    { key: "hv_type.type", title: "Type" },
                    { key: "group.name", title: "Shipper Name" },
                    // { key: "description", title: "Description" },
                ];
            }

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
        { key: 'type', label: 'Type', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'type_meter_concept', label: 'Type Meter/Concept', visible: true },
        { key: 'meter_point', label: 'Meter Point', visible: true },
        { key: 'concept_point', label: 'Concept Point', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const [colHistory, setColHistory] = useState<any>([]);
    const initialColumnsHistory: any = [
        { key: 'type', label: 'Type', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'type_meter_concept', label: 'Type Meter/Concept', visible: true },
        { key: 'meter_point', label: 'Meter Point', visible: true },
        { key: 'concept_point', label: 'Concept Point', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

    // ใช้อันนี้เพราะข้อนี้เลย
    // History ของ Type System : Heading Detail และ Column ตัด Shipper Name ออก (รวมถึงในไฟล์ Export ด้วยนะ) https://app.clickup.com/t/86eudx24z
    useEffect(() => {
        setColHistory(initialColumnsHistory)
    }, [])


    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

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

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "type",
                header: "Type",
                align: 'center',
                enableSorting: true,
                accessorFn: (row: any) => row?.hv_type?.type || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center h-full">
                            {row?.hv_type && (
                                <div
                                    className="flex items-center font-semibold justify-center w-[140px] h-[30px] rounded-full p-1"
                                    style={{
                                        backgroundColor: row?.hv_type?.color,
                                        color: row?.hv_type_id == 1 ? '#0DA2A2' : '#2F9ADC',
                                    }}
                                >
                                    {row?.hv_type?.type}
                                </div>
                            )}
                        </div>
                    )
                }
            },
            {
                accessorKey: "shipper_name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group ? row?.group?.name : ''}</div>)
                }
            },
            {
                accessorKey: "type_meter_concept",
                header: "Type Meter/Concept",
                enableSorting: true,
                // accessorFn: (row: any) => row?.metering_point?.metered_point_name || '',
                accessorFn: (row: any) => (row?.meter_concept_type_id === 1 || row?.meter_concept_type_id === null) ? ("Meter Point") : ("Concept Poin (Type Meter)"),
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{(row?.meter_concept_type_id === 1 || row?.meter_concept_type_id === null) ? ("Meter Point") : ("Concept Poin (Type Meter)")}</div>)
                    // return (<div>{row?.metering_point ? row?.metering_point?.metered_point_name : ''}</div>)
                }
            },
            {
                accessorKey: "meter_point",
                header: "Meter Point",
                enableSorting: true,
                // accessorFn: (row: any) => row?.metering_point?.metered_point_name || '',
                accessorFn: (row: any) => row?.metering_point?.metered_point_name || "",
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.metering_point?.metered_point_name || ""}</div>)
                    // return (<div>{row?.metering_point ? row?.metering_point?.metered_point_name : ''}</div>)
                }
            },
            {
                accessorKey: "concept_point",
                header: "Concept Point",
                enableSorting: true,
                // accessorFn: (row: any) => row?.metering_point?.metered_point_name || '',
                accessorFn: (row: any) => row?.concept_point?.concept_point || "",
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.concept_point?.concept_point || ""}</div>)
                    // return (<div>{row?.metering_point ? row?.metering_point?.metered_point_name : ''}</div>)
                }
            },
            {
                accessorKey: "start_date",
                header: "Start Date",
                // header: () => (
                //     <div className="text-center">Start Date</div>
                // ),
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.start_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`text-[#464255]`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "create_by",
                header: "Created by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.create_date ? formatDateTimeSec(row?.create_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
                        </div>
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
    )

    const togglePopover = (id: any, anchor: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // close popover
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

    const [tk, settk] = useState(false);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('HV for Operation Flow and Instructed Flow', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

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
                setOpenPopoverId(null);
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


    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        type="select-multi-checkbox"
                        value={srchShipperName}
                        onChange={(e: any) => {
                            setSrchShipperName(e.target.value)
                            setSrchType([])
                        }}
                        options={dataShipper
                            ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                value: item.id_name,
                                label: item.name,
                            }))
                        }
                    />

                    {/* 200625 : Filter Type ปรับเป็น Multi Select https://app.clickup.com/t/86etwecyk */}
                    {/* <InputSearch
                        id="searchType"
                        label="Type"
                        type="select"
                        value={srchType}
                        onChange={(e) => setSrchType(e.target.value)}
                        options={dataHvType?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.type
                        }))}
                    /> */}

                    <InputSearch
                        id="searchType"
                        label="Type"
                        type="select-multi-checkbox"
                        value={srchType}
                        onChange={(e) => setSrchType(e.target.value)}
                        options={dataHvType?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.type
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div>
                </aside>
            </div>

            {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div onClick={handleTogglePopover}>
                            <TuneIcon
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="dam/hv-for-peration-flow-and-instructed-flow"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu={'hv-for-operation-flow'}
                            />
                        </div>
                    </div>
                </div>

                <TableHvForOperationFlow
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
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
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="dam/hv-for-peration-flow-and-instructed-flow"
                        can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
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
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                dataShipper={dataShipper}
                dataHvType={dataHvType}
                dataHvMeter={dataHvMeter}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            // setFormData(undefined)
                            setFormData(null)
                            resetForm();
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                dataHvConcept={dataHvConcept}
                dataTypeMC={dataTypeMC}
                dataZone={dataZone}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalSuccessMsg}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="hv-operation-flow"
                title="History"
                data={historyData}
                head_data={headData}
                // initialColumns={initialColumnsHistory}
                initialColumns={colHistory}
                userPermission={userPermission}
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
                <div ref={popoverRef} className="w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
                        }
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li>
                        }
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", openPopoverId) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History</li>
                        }
                    </ul>
                </div>
            </Popover>
        </div>
    );
};

export default ClientPage;