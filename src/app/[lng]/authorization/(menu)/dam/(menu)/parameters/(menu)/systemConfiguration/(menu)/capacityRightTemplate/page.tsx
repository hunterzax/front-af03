"use client";
// import Link from "next/link";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import ModalAction from "./form/modalAction";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDate, formatDateNoTime, generateUserPermission } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Popover } from "@mui/material";
import getUserValue from "@/utils/getuserValue";
// import { createRedisInstance } from "../../../../../../../../../../redis";

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

    // ############### REDUX DATA ###############
    const { termTypeMaster } = useFetchMasters();

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Capacity Right Template', userDT)
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

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchType, setSrchType] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed

        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                // (srchType ? item?.term_type?.id == srchType : true),
                (srchType?.length > 0 ? srchType.includes(item?.term_type?.id?.toString()) : true)
                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchType([])
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const normalizedQuery = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = dataTable.filter((item: any) => {
            // If query matches "mo", "mon", "mont", or "month", filter by file_period_mode
            // Mapping for partial query matches to file_period_mode values
            const filePeriodModeMap: Record<string, number> = {
                mo: 2, // Matches "mo", "mon", "mont", "month"
                da: 1, // Matches "da", "day"
                ye: 3, // Matches "ye", "year"
            };

            const fileStartModeMap: Record<string, number> = {
                ev: 1, // Matches Every Day
                fi: 2, // Matches Fix Day 1 Day
            };

            // กรองหา file period
            for (const [prefix, mode] of Object.entries(filePeriodModeMap)) {
                if (normalizedQuery.startsWith(prefix) && item?.file_period_mode === mode) {
                    return true;
                }
            }

            // กรองหา file recurring start date
            for (const [prefix, mode] of Object.entries(fileStartModeMap)) {
                if (normalizedQuery.startsWith(prefix) && item?.file_start_date_mode == mode) {
                    return true;
                }
            }

            return (
                item?.term_type?.name.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery) ||
                item?.day?.toString().includes(normalizedQuery) ||
                item?.min?.toString().includes(normalizedQuery) ||
                item?.max?.toString().includes(normalizedQuery) ||
                item?.hour?.toString().includes(normalizedQuery) ||
                item?.shadow_time?.toString().includes(normalizedQuery) ||
                item?.todayday?.toString().includes(normalizedQuery) ||
                item?.minute?.toString().includes(normalizedQuery) ||
                item?.before_month?.toString().includes(normalizedQuery) ||
                // formatTime(item?.start_date)?.toLowerCase().includes(normalizedQuery) ||
                formatDate(item?.start_date)?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery) ||
                // formatTime(item?.end_date)?.toLowerCase().includes(normalizedQuery) ||
                formatDate(item?.end_date)?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery) ||
                item?.start_date?.toLowerCase().includes(normalizedQuery) ||
                item?.end_date?.toLowerCase().includes(normalizedQuery)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/parameter/booking-template`);
            setData(response);
            setFilteredDataTable(response);
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
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        term_type_id: '',
        file_period: '',
        file_period_mode: '',
        file_start_date_mode: '',
        fixdayday: '',
        todayday: '',
        shadow_time: '',
        shadow_period: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
    };
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        const newData = replaceEmptyStringsWithNull(data)
        if (typeof data.end_date !== 'string' || data.end_date == 'Invalid Date') {
            data.end_date = null;
        }

        switch (data?.file_start_date_mode) {
            case "1":
                data.fixdayday = null;
                data.todayday = null;
                break;
            case "2":
                data.todayday = null;
                break;
            case "3":
                data.fixdayday = null;
                break;
        }// ใช้สำหรับล้างค่าในกรณีที่ user เปลี่ยน file_start_date_mode จะ clear data เก่าทิ้ง

        delete data.file_period
        // data.file_period = parseInt(data.file_period)
        data.max = parseInt(data.max)
        data.min = parseInt(data.min)
        data.file_start_date_mode = parseInt(data.file_start_date_mode)
        data.shadow_time = parseInt(data.shadow_time)
        // data.shadow_period = parseInt(data.shadow_period)
        data.shadow_period = null // req ใหม่เขาให้เอา shadow_period ออก
        delete data.shadow_period;

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/parameter/booking-template-create', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Capacity Right Template has been added.')
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let res_update = await putService(`/master/parameter/booking-template-edit/${selectedId}`, data);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
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

    const openCreateForm = () => {
        if (resetForm) resetForm();
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.term_type_id = filteredData.term_type_id;
            // fdInterface.file_period = filteredData.file_period;
            fdInterface.min = filteredData.min;
            fdInterface.max = filteredData.max;
            fdInterface.file_period_mode = filteredData.file_period_mode;
            fdInterface.file_start_date_mode = filteredData.file_start_date_mode;
            fdInterface.fixdayday = filteredData.fixdayday;
            fdInterface.todayday = filteredData.todayday;
            fdInterface.shadow_time = filteredData.shadow_time;
            fdInterface.shadow_period = filteredData.shadow_period;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.term_type_id = filteredData.term_type_id;
            // fdInterface.file_period = filteredData.file_period;
            fdInterface.min = filteredData.min;
            fdInterface.max = filteredData.max;
            fdInterface.file_period_mode = filteredData.file_period_mode;
            fdInterface.file_start_date_mode = filteredData.file_start_date_mode;
            fdInterface.fixdayday = filteredData.fixdayday;
            fdInterface.todayday = filteredData.todayday;
            fdInterface.shadow_time = filteredData.shadow_time;
            fdInterface.shadow_period = filteredData.shadow_period;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('view');
        setFormData(fdInterface);
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
            const response: any = await getService(`/master/account-manage/history?type=booking-template&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                { key: "term_type.name", title: "Term" },
                // { key: "file_period", title: "Period" },
                { key: "file_period_mode", title: "Period" },
                // { key: "description", title: "Description" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                let valX = ""
                if (key == 'file_period_mode') {
                    switch (value) {
                        case 1:
                            valX = 'Days'
                            break;
                        case 2:
                            valX = 'Months'
                            break;
                        case 3:
                            valX = 'Years'
                            break;
                    }
                }
                return {
                    title,
                    value: valX !== "" ? valX : value,
                    // value: isIsoString ? formatDateNoTime(value) : value || "",
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

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'term', label: 'Term', visible: true },
        // { key: 'file_period', label: 'File Recurring Period', visible: true },
        { key: 'file_period', label: 'File Period', visible: true },
        { key: 'min', label: 'Period Min', visible: true },
        { key: 'max', label: 'Period Max', visible: true },
        { key: 'file_start_date', label: 'File Recurring Start Date', visible: true },
        { key: 'shadow_time', label: 'Shadow Time', visible: true },
        { key: 'shadow_period', label: 'Shadow Period', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        // { key: 'create_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'term', label: 'Term', visible: true },
        { key: 'file_period', label: 'File Period', visible: true },
        { key: 'min', label: 'Period Min', visible: true },
        { key: 'max', label: 'Period Max', visible: true },
        { key: 'file_start_date', label: 'File Recurring Start Date', visible: true },
        { key: 'shadow_time', label: 'Shadow Time', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'shadow_period', label: 'Shadow Period', visible: true },
    ];

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
                accessorKey: "term",
                header: "Term",
                enableSorting: true,
                align: 'center',
                accessorFn: (row: any) => row?.term_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            <div
                                className="flex w-[90%] min-w-[150px] max-w-[200px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]"
                                style={{ backgroundColor: row?.term_type?.color }}
                            >
                                {`${row?.term_type?.name}`}
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "file_period",
                header: "File Period",
                enableSorting: true,
                accessorFn: (row: any) => {
                    const result: any = row?.file_period_mode == 1 ? `${`Day${row?.file_period !== 1 && 's'}`}` : row?.file_period_mode == 2 ? `${`Month${row?.file_period !== 1 && 's'}`}` : `Year${row?.file_period !== 1 && 's'}`;
                    return result
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{
                            row?.file_period_mode == 1 ? // 1 = วัน
                                <div>{`Day${row?.file_period !== 1 && 's'}`}</div>
                                : row?.file_period_mode == 2 ? // 2 = เดือน
                                    <div>{`Month${row?.file_period !== 1 && 's'}`}</div>
                                    : // 3 = ปี
                                    <div>{`Year${row?.file_period !== 1 && 's'}`}</div>
                        }</div>
                    )
                }
            },
            {
                accessorKey: "min",
                header: "Period Min",
                enableSorting: true,
                sortDescFirst: false,
                accessorFn: (row: any) => row?.min || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.min ? row?.min : ''}</div>)
                }
            },
            {
                accessorKey: "max",
                header: "Period Max",
                enableSorting: true,
                sortDescFirst: false,
                accessorFn: (row: any) => row?.max || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.max ? row?.max : ''}</div>)
                }
            },
            {
                accessorKey: "file_start_date",
                header: "File Recurring Start Date",
                enableSorting: true,
                accessorFn: (row: any) => {
                    const result: any = row?.file_start_date_mode == 1 ? `${`Every Day`}` : row?.file_start_date_mode == 2 ? `${`Fix Date ${row?.fixdayday}`}` : `Today + ${row?.todayday} Day`;
                    return result
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            {
                                row?.file_start_date_mode == 1 ? // 1 = every day
                                    <div>{`Every Day`}</div>
                                    : row?.file_start_date_mode == 2 ? // 2 = fix day
                                        <div>{`Fix Date ${row?.fixdayday}`}</div> // v1.0.90 ปรับ wording จาก "Fix day 1 day" เป็น "Fix date 1" ทั้งใน modal และ List https://app.clickup.com/t/86err0d6f
                                        : // 3 = to day+
                                        <div>{`Today + ${row?.todayday} Day`}</div>
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "shadow_time",
                header: "Shadow Time",
                enableSorting: true,
                sortDescFirst: false,
                accessorFn: (row: any) => row?.shadow_time || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className="text-right">{row?.shadow_time ? row?.shadow_time : '0'}</div>)
                }
            },
            {
                accessorKey: "unit",
                header: "Unit",
                enableSorting: true,
                accessorFn: (row: any) => {
                    const result: any = row?.term_type_id === 4 ? 'Days' : row?.term_type_id < 4 ? 'Months' : '';
                    return result
                },
                align: 'center',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{(row?.term_type_id === 4) ? <span>{'Days'}</span> : (row?.term_type_id < 4) ? <span>{'Months'}</span> : ''}</div>)
                }
            },
            {
                accessorKey: "start_date",
                header: "Start Date",
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
                accessorKey: "end_date",
                header: "End Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.end_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`text-[#0DA2A2]`}>{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</div>
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
        ], [])

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
            permission = findRoleConfigByMenuName('Capacity Right Template', userDT)
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
                        id="searchType"
                        label="Term"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchType}
                        onChange={(e) => setSrchType(e.target.value)}
                        options={termTypeMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    <DatePickaSearch
                        key={"start" + key}
                        label="Start Date"
                        placeHolder="Select Start Date"
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
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
                                path="dam/capacity-right-template"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu={'capacity-right-template'}
                            />
                        </div>
                    </div>
                </div>
                <TableBookingTemplate
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
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
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="dam/capacity-right-template"
                        specificMenu={'capacity-right-template'}
                        can_export={userPermission ? userPermission?.f_export : false}
                        columnVisibility={columnVisibility}
                        initialColumns={initialColumns}
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
                termTypeMasterData={termTypeMaster?.data}
                onClose={() => {
                    setFormOpen(false);
                    // if (resetForm) {
                    //     setTimeout(() => {
                    //         resetForm();
                    //         setFormData(null);
                    //     }, 100);
                    // }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Capacity Right Template has been added."
                description={modalModalSuccessMsg}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="booking-template"
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
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
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