"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, generateUserPermission, iconButtonClass } from "@/utils/generalFormatter";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { InputSearch } from "@/components/other/SearchForm";
import ModalViewEmailGroup from "./form/modalView";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnExport from "@/components/other/btnExport";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable from "@/components/table/AppTable";
import { Popover } from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import BtnActionTable from "@/components/other/btnActionInTable";
import { useFetchMasters } from "@/hook/fetchMaster";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
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
    // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Email Group For Event', userDT)
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

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);

    const [srchUsertype, setSrchUsertype] = useState<any>([])
    const [srchGroupName, setSrchGroupName] = useState('');
    const [srchGroupNameforEvent, setSrchGroupNameforEvent] = useState('');

    const handleFieldSearch = () => {
        const result_2 = dataTable?.filter((item: any) => {
            return (
                (srchUsertype?.length > 0 ? srchUsertype.includes(item?.user_type_id?.toString()) : true) &&
                (srchGroupName !== '' ? item?.group?.name?.toLowerCase().includes(srchGroupName.toLowerCase()) : true) &&
                (srchGroupNameforEvent !== '' ? item?.name?.toLowerCase().includes(srchGroupNameforEvent.toLowerCase()) : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchGroupName('');
        setSrchUsertype([])
        setSrchGroupNameforEvent('')
        setFilteredDataTable(dataTable);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) =>
                item?.topic?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                item?.detail?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
                item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/parameter/email-group-for-event`);
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

    const [openView, setOpenView] = useState(false);
    const [dataView, setDataView] = useState<any>();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        name: '',
        email: '',
        email_arr: []
    };
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        // {
        //     "name":"Group1",
        //     "email": ["new1@gmail.com", "new2@gmail.com"]
        // }
        let email = data?.email || []
        if (email.length <= 0) {
            email = data?.email_arr
        }
        let dataPost = {
            name: data?.name,
            email: email,
            user_type_id: data?.user_type_id,
            group_id: data?.group_id,
        }

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/parameter/email-group-for-event-create', dataPost);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let res_update = await putService(`/master/parameter/email-group-for-event-edit/${selectedId}`, dataPost);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                }
                break;
        }

        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);

        if (filteredData) {
            const emails = filteredData?.edit_email_group_for_event_match?.map((item: any) => item.email);

            fdInterface.id = filteredData.id;
            fdInterface.name = filteredData.name;
            fdInterface.email = emails;
            fdInterface.email_arr = emails;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.group_id = filteredData.group_id;

            // fdInterface.start_date = new Date(filteredData.start_date);
            // fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);

        if (filteredData) {
            const emails = filteredData?.edit_email_group_for_event_match?.map((item: any) => item.email);

            fdInterface.id = filteredData.id;
            fdInterface.name = filteredData.name;
            fdInterface.email = emails;
            fdInterface.email_arr = emails;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.group_id = filteredData.group_id;

            // fdInterface.start_date = new Date(filteredData.start_date);
            // fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('view');
        setFormData(fdInterface);
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
    const [headData, setHeadData] = useState<any>();

    const openHistoryForm = async (id: any) => {
        try {
            const response: any = await getService(`/master/account-manage/history?type=email-group-for-event&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);
            let mappings = [
                { key: "name", title: "Email Group Name" },
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
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'group', label: 'Group Name', visible: true },
        { key: 'name', label: 'Email Group Name For Event', visible: true },
        { key: 'person', label: 'Email', visible: true },
        // { key: 'start_date', label: 'Start Date', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'group', label: 'Group Name', visible: true },
        { key: 'name', label: 'Email Group Name For Event', visible: true },
        { key: 'person', label: 'Email', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
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
                accessorKey: "user_type",
                header: "User Type",
                enableSorting: true,
                accessorFn: (row: any) => row?.user_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            {
                                row?.user_type &&
                                <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>{row?.user_type?.name}</div>
                            }
                        </div>
                    )
                },
                width: 150,
                align: 'center'
            },
            {
                accessorKey: "group",
                header: "Group Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group ? row?.group?.name : ''}</div>)
                },
                width: 300,
            },
            {
                accessorKey: "name",
                header: "Email Group Name For Event",
                enableSorting: true,
                accessorFn: (row: any) => row?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.name && row?.name}</div>)
                },
                width: 400,
            },
            {
                accessorKey: "person",
                header: "Email",
                enableSorting: false,
                accessorFn: (row: any) => row?.edit_email_group_for_event_match?.length || '',
                size: 60,
                meta: {
                    align: 'center'
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openViewModal(row)}
                                disabled={row?.edit_email_group_for_event_match.length <= 0 && true}
                            >
                                <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openViewModal(row)}
                                disabled={row?.edit_email_group_for_event_match.length <= 0 && true}
                            >
                                <SupervisorAccountRoundedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>

                            <span className="px-2 text-[#464255]">
                                {row?.edit_email_group_for_event_match?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "create_by",
                header: "Created by",
                width: 150,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.create_date ? formatDate(row?.create_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
                        </div>
                    )
                },
            },
            {
                accessorKey: "update_by",
                header: "Updated by",
                width: 150,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.update_by_account?.first_name} ` || ''}${row?.update_by_account?.last_name} ${row?.update_date ? formatDateTimeSec(row?.update_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
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
        ]
        , []
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
            permission = findRoleConfigByMenuName('Email Group For Event', userDT)

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

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchUserType"
                        label="User Type"
                        value={srchUsertype}
                        type="select-multi-checkbox"
                        onChange={(e) => setSrchUsertype(e?.target?.value)}
                        placeholder="Select User Type"
                        options={[
                            { value: "2", label: "TSO" },
                            { value: "3", label: "Shipper" },
                            { value: "4", label: "Other" },
                        ]}
                    />

                    <InputSearch
                        id="searchGroupname"
                        label="Group Name"
                        value={srchGroupName}
                        onChange={(e) => setSrchGroupName(e.target.value)}
                        placeholder="Search Group Name"
                    />

                    <InputSearch
                        id="searchGroupnameforEvent"
                        label="Email Group Name For Event"
                        value={srchGroupNameforEvent}
                        onChange={(e) => setSrchGroupNameforEvent(e.target.value)}
                        placeholder="Search Email Group Name"
                        customWidth={250}
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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/email-group-for-event" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>

                <TableNomiDeadline
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openViewModal={openViewModal}
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
                        path="dam/email-group-for-event"
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
                // userTypeMaster={userTypeMaster?.data?.filter((item: any) => item?.name !== 'Other')}
                userTypeMaster={userTypeMaster?.data}
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
                description={`Email Group for Event has been ${formMode === "create" ? "added" : "saved"}.`}
            />

            <ModalViewEmailGroup
                data={dataView}
                open={openView}
                onClose={() => {
                    setOpenView(false);
                }}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="email-group-for-event"
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
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
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
