"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import { findRoleConfigByMenuName, formatDate, formatDateNoTime, formatSearchDate, generateUserPermission } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { InputSearch } from "@/components/other/SearchForm";
import PaginationComponent from "@/components/other/globalPagination";
import TablePathMgn from "./form/table";
import ModalPathMgnHistory from "./form/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import AppTable, { sortingByDateFn } from "@/components/table/AppTable";
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import getUserValue from "@/utils/getuserValue";

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
            //     const permission = findRoleConfigByMenuName('Path Management', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Path Management', userDT)
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
    const [srchGroupName, setSrchGroupName] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        const result = dataTable.filter((item: any) => {
            return (
                // (srchType ? item?.term_type?.id == srchType : true) &&
                (srchGroupName ? item?.version?.toLowerCase().includes(srchGroupName.toLowerCase()) : true) &&
                (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchGroupName('');
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    // const handleSearch = (query: string) => {
    //     const filtered = dataTable.filter(
    //         (item: any) => {
    //             const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

    //             return (
    //                 item?.version?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 // item?.detail?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.toLowerCase()) ||
    //                 item?.create_by_account?.first_name?.toString().includes(queryLower) ||
    //                 item?.create_by_account?.last_name?.toString().includes(queryLower) ||
    //                 item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
    //                 formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
    //                 formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

    //                 item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
    //                 item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
    //                 formatDateNoTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
    //                 formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

    //                 formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower)
    //             )
    //         }
    //     );
    //     setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    //     setFilteredDataTable(filtered);
    // };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataPathGroup, setDataPathGroup] = useState<any>([]);
    const [latestStartDate, setLatestStartDate] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {
            setIsLoading(false);

            const response: any = await getService(`/master/path-management`);
            const res_path_group: any = await getService(`/master/path-management/group-paths`);

            const latestPathConfig = response?.sort((a: any, b: any) => b.id - a.id)[0];
            setLatestStartDate(latestPathConfig?.start_date || null)
            // const latestStartDate = latestPathConfig.start_date;
            setData(response || []);
            setDataPathGroup(res_path_group || [])
            setFilteredDataTable(response || []);

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        } catch (err) {
            // setError(err.message);
            setIsLoading(false);
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
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isSuccessMsg, setIsSuccesMsg] = useState('');
    const [openView, setOpenView] = useState(false);
    const [dataView, setDataView] = useState<any>();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    // const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>();
    const [modalLoading, setModalLoading] = useState(false);

    const fdInterface: any = {
        name: '',
        ref: '',
        start_date: '',
        path_management_config: {}
    };
    const [formData, setFormData] = useState(fdInterface);
    const [formDataInfo, setFormDataInfo] = useState<any>([]);

    // #reguib handleFormSubmit
    const handleFormSubmit = async (data: any) => {

        const path_management_config = Object.values(data?.path_management_config).map((item: any) => ({
            exit_id_temp: item.exit_id_temp, // 36
            exit_name_temp: item.exit_name_temp, // C4
            config_master_path_id: item.config_master_path_id // 34
        }));

        let dataPost = {
            start_date: data?.start_date, //2024-10-20T00:00:00.000Z
            ref: data?.ref === "" ? null : data?.ref, //กรณี duplicate ใส่ id มา
            path_management_config: path_management_config
        }

        switch (formMode) {
            case "create":

                // if (dataPost?.path_management_config?.length <= 0 || dataPost?.path_management_config?.length !== dataPathGroup?.length) {

                //     setModalErrorMsg('Please select all path.');
                //     setModalErrorOpen(true)
                // } else {
                //     let res_create = await postService('/master/path-management/path-management-create', dataPost);
                //     if (res_create?.response?.data?.status === 400) {
                //          
                //         setFormOpen(false);
                //         setModalErrorMsg(res_create?.response?.data?.error);
                //         setModalErrorOpen(true)
                //     } else {
                //         setFormOpen(false);
                //         setModalSuccessOpen(true);
                //         setIsSuccesMsg('The new version has been added.')
                //     }
                // }

                // ===============================
                let res_create = await postService('/master/path-management/path-management-create', dataPost);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    // setModalErrorMsg(res_create?.response?.data?.error);
                    setModalErrorMsg(statusCode ? statusCode : '');
                    setModalErrorOpen(true)
                } else {
                    setModalLoading(false)
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                    setIsSuccesMsg('The new version has been added.')
                }
                break;
            case "edit":
                // mode edit ไม่ต้องมี ref
                delete dataPost.ref;

                let res_update = await putService(`/master/path-management/path-management-edit/${selectedId}`, dataPost);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    setModalLoading(false)
                    setFormOpen(false);
                    setIsSuccesMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }
                break;
        }

        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        // ส่ง dataPathGroup ไปหน้า create
        setFormData(dataPathGroup)
        // setFormData(fdInterface);
        setFormOpen(true);
    };

    // #region openEditForm
    const openEditForm = async (id: any) => {
        setSelectedId(id);

        const response: any = await getService(`/master/path-management`);
        const res_path_group: any = await getService(`/master/path-management/group-paths`);

        // const filteredData = dataTable.find((item: any) => item.id === id);
        const filteredData = response?.find((item: any) => item.id === id);

        setSelectedData(filteredData)
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.name = '';
            fdInterface.version = filteredData.version;
            fdInterface.path_management_config = filteredData.path_management_config;
            fdInterface.start_date = new Date(filteredData.start_date);
            // fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormDataInfo(fdInterface);
        setFormMode('edit');

        // setFormData(dataPathGroup);
        setFormData(res_path_group);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);

        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.name = '';
            fdInterface.version = filteredData.version;
            fdInterface.path_management_config = filteredData.path_management_config;
            fdInterface.start_date = new Date(filteredData.start_date);
            // fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }

        // const newTempPath = fdInterface?.path_management_config.map((es: any) => {
        //     let newTemps = JSON.parse(es['temps'])
        //     return { ...es, newTemps }
        // })

        setFormDataInfo(fdInterface);
        setFormMode('view');
        setFormData(dataPathGroup);
        setFormOpen(true);
    };

    // MODAL VIEW
    const openViewModal = (data: any) => {

        setDataView(data)
        setOpenView(true)
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

    const openHistoryForm = async (id: any) => {
        setAnchorPopover(null) // เคส table ใหม่ปุ่ม view ค้าง ให้มา

        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.name = '';
            fdInterface.version = filteredData.version;
            fdInterface.path_management_config = filteredData.path_management_config;
            fdInterface.start_date = new Date(filteredData.start_date);
            // fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormDataInfo(fdInterface);

        try {
            const response: any = await getService(`/master/path-management/path-management-log/${id}`);

            setHistoryData(response);
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
        { key: 'version', label: 'Version', visible: true },
        { key: 'activate_date', label: 'Activate Date', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
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

    // ############### COLUMN SHOW/HIDE HISTORY ###############
    const initialColumnsHistory: any = [
        { key: 'exit', label: 'Exit', visible: true },
        { key: 'default_capacity_path', label: 'Default Capacity Path', visible: true },
        { key: 'activate_date', label: 'Activate Date', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "version",
                header: "Version",
                enableSorting: true,
                accessorFn: (row: any) => row?.version || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.version}</div>)
                }
            },
            {
                accessorKey: "activate_date",
                header: "Activate Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.start_date) || '',
                sortingFn: (rowA, rowB, columnId) => {
                    return sortingByDateFn(rowA?.original?.start_date, rowB?.original?.start_date)
                },
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>)
                }
            },
            {
                accessorKey: "update_by",
                header: "Created by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.create_date ? formatDate(row?.create_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "create_by",
                header: "Updated by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.update_by_account?.first_name} ` || ''}${row?.update_by_account?.last_name} ${row?.create_date ? formatDate(row?.update_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDate(row?.update_date) : ''}</div>
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

    const [tk, settk] = useState(false);

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

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('Path Management', userDT)
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
                setAnchorPopover(null);
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null);
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
                break;
            default:
                break;
        }
    }

    const [dataExport, setDataExport] = useState<any>([]);

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <InputSearch
                        id="searchUserId"
                        label="Version"
                        value={srchGroupName}
                        onChange={(e) => setSrchGroupName(e.target.value)}
                        placeholder="Enter Version"
                    />
                    <DatePickaSearch
                        key={"start" + key}
                        label="Activate Date"
                        placeHolder="Select Activate Date"
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />
                    <BtnSearch handleFieldSearch={handleFieldSearch} marginL={true} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New Version"} can_create={userPermission ? userPermission?.f_create : false} />
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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="capacity/path-management" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>

                <TablePathMgn
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openViewModal={openViewModal}
                    openHistoryForm={openHistoryForm}
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
                        path="capacity/path-management"
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
                dataInfo={formDataInfo}
                latestStartDate={latestStartDate}
                open={formOpen}
                isLoading={modalLoading}
                setIsLoading={setModalLoading}
                onClose={() => {
                    setFormOpen(false);

                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                        }, 200);
                    }

                    // หลักจาก edit v.003 แล้ว ถ้าเช็คแค่ view ของ v.001, 002 path ไม่ได้เปลี่ยนตาม แต่เมื่อเลือก edit ของ v.001, 002 path ที่แสดงจะไปเหมือนกัน v.003 ที่ถูก edit ไป ไม่เหมือนตอน view https://app.clickup.com/t/86erpqyjv
                    // เป็นเรื่อง modalAction ค้าง

                    setTimeout(() => {
                        setFormData(null)
                        setFormDataInfo([])
                        setFormMode(undefined);

                        // fetchData();
                    }, 300);
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                userPermission={userPermission}
                columnVisibility={columnVisibility}
            />

            {/* หน้า path management นี้ใช้ component แยกกับ history ตัวอื่น */}
            <ModalPathMgnHistory
                mode='view'
                data={historyData}
                open={historyOpen}
                dataInfo={formDataInfo}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                onClose={handleCloseHistoryModal}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="The new version has been added."
                description={isSuccessMsg}
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
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{
                    overflow: 'hidden',
                    "& .MuiPopover-paper": {
                        borderRadius: '10px', // Transfer border
                    },
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
                    </ul>
                </div>
            </Popover>
        </div>
    );
};

export default ClientPage;
