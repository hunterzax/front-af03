"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, patchService, postService, putService } from "@/utils/postService";
import getCookieValue from "@/utils/getCookieValue";
import RoleMgnModal from "./form/modalPermission";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatTime, generateDuplicateFileName, generateDuplicateFileNameFindAll, generateUserPermission } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SupervisedUserCircleOutlinedIcon from '@mui/icons-material/SupervisedUserCircleOutlined';
import ModalactionRole from "./form/modalAction";
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

            const permission = findRoleConfigByMenuName('Roles', userDT)
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
    // const [srchUserType, setSrchUserType] = useState('');
    const [srchUserType, setSrchUserType] = useState<any>([]);

    const [srchRole, setSrchRole] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                // (srchUserType ? item?.user_type?.id == srchUserType : true) &&
                (srchUserType?.length > 0 ? srchUserType.includes(item?.user_type?.id?.toString()) : true) && // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
                // (item?.name.toLowerCase().includes(srchRole.toLowerCase()) && setSrchShwStartDate(true))
                (srchRole ? item?.name.toLowerCase().includes(srchRole.toLowerCase()) : true)
                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        // setSrchUserType('');
        setSrchUserType([]);

        setSrchRole('');
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

                return (
                    item?.user_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // // item?.create_by_account?.first_name?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    // // item?.create_by_account?.last_name?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    item?.update_by_account?.first_name?.replace(/\s+/g, '').trim().includes(queryLower) ||
                    item?.update_by_account?.last_name?.replace(/\s+/g, '').trim().includes(queryLower) ||
                    // item?.first_name && item?.last_name && (item?.first_name + ' ' + item?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    // item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||

                    item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query?.replace(/\s+/g, '').toLowerCase().trim()) ||
                    formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false);

    const fetchData = async () => {
        setIsLoading(false);
        try {
            const response: any = await getService(`/master/account-manage/role-master`);
            const makeResponse = response?.map((item: any) => ({
                ...item,
                // start_date: item?.start_date ? formatDateNoTime(item?.start_date) : null,
                // end_date: item?.end_date ? formatDateNoTime(item?.end_date) : null,
            }));

            // let reverseData = makeResponse?.reverse();

            setData(makeResponse);
            setFilteredDataTable(makeResponse);

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
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

    // SEARCH STATE
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalRoleOpen, setModalRoleOpen] = useState(false);
    const handleCloseRoleModal = async () => {
        fetchData();
        setModalRoleOpen(false)
    };

    const fdInterface: any = {
        id: '',
        user_type_id: '',
        name: '',
        // start_date: '',
        // end_date: '',
        start_date: undefined,
        end_date: undefined,
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [msgSuccess, setMsgSuccess] = useState('Role has been added.');
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'dup'>('create');
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        const { id, ...newData } = data
        // newData["start_date"] = dayjs(newData["start_date"]).format("YYYY-MM-DD HH:mm:ss")
        // newData["end_date"] = dayjs(newData["end_date"]).format("YYYY-MM-DD HH:mm:ss")
        if (typeof newData["end_date"] !== 'string') {
            newData["end_date"] = null;
        }

        if (newData["end_date"] === "Invalid Date") {
            newData["end_date"] = null;
        }
        switch (formMode) {
            case "create":
                let res_create = await postService('/master/account-manage/role-master-create', newData);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setMsgSuccess('Role has been added.');
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let res_update = await putService(`/master/account-manage/role-master-edit/${selectedId}`, newData);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setMsgSuccess('Your changes have been saved.');
                    setModalSuccessOpen(true);
                }
                break;
            case "dup":
                let res_dup = await patchService(`/master/account-manage/role-master-duplicate/${selectedId}`, newData);
                const statusCodePatch = res_dup?.response?.data?.statusCode ?? res_dup?.response?.data?.status ?? res_dup?.status ?? res_dup?.statusCode ?? res_dup?.code ?? res_dup?.response?.status;
                const errorMsgPatch = res_dup?.response?.data?.error ?? res_dup?.data?.error ?? res_dup?.response?.error ?? res_dup?.error;

                if (statusCodePatch === 400 || statusCodePatch === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPatch || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setMsgSuccess('Role has been duplicated.');
                    setModalSuccessOpen(true);
                }
                break;
        }
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData({
            id: '',
            user_type_id: '',
            name: '',
            start_date: undefined,
            end_date: undefined,
        });
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.name = filteredData.name;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setTimeout(() => {
            setFormOpen(true);
        }, 300);
    };

    const openViewForm = async (id: any) => {
        const filteredData = await dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.name = filteredData.name;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('view');
        setFormData(fdInterface);
        setTimeout(() => {
            setFormOpen(true);
        }, 300);
    };

    const openDupForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);

        // the next fileName should be 'KK [duplicate] [duplicate2]'
        // and if user duplicate fileName again the fileName should be 'KK [duplicate] [duplicate2] [duplicate3]'

        let fileName: any = generateDuplicateFileName(filteredData.name);

        // R : v1.0.90 เวลากด duplicate แล้วไม่ควรขึ้นชื่อเดียวกับที่มีในระบบ https://app.clickup.com/t/86erp01b8
        // หาชื่อ role name แล้ว include ดูทั้ง table ว่ามี dup กันกี่ตัว
        const fileName2 = generateDuplicateFileNameFindAll(fileName, dataTable);

        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.user_type_id = filteredData.user_type_id;
            // fdInterface.name = filteredData.name + ' [duplicate]';
            fdInterface.name = fileName2;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('dup');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    // ############# MODAL ROLE MGN  #############
    const [dataRoleMgn, setDataRoleMgn] = useState(null);
    const [dataRole, setDataRole] = useState(null);
    const openRoleModal = async (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setDataRole(filteredData);
        try {
            try {
                const response: any = await getService(`/master/account-manage/role-menu-permission?id=${id}`);
                setDataRoleMgn(response)
            } catch (error) {
                // Error updating API
            }
            // setData(response.data);
            // setDataRoleMgn(response)
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
        setModalRoleOpen(true);
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
            const response: any = await getService(`/master/account-manage/history?type=role&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                { key: "user_type.name", title: "User Type" },
                { key: "name", title: "Role" },
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

    // const paginatedData = filteredDataTable?.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    // );

    const paginatedData = Array.isArray(filteredDataTable)
        ? filteredDataTable.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
        : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'user_type_id', label: 'User Type', visible: true },
        { key: 'name', label: 'Role Name', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
        { key: 'update_permission_by_account', label: 'Updated Role Management', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];
    const initialColumnsHistory: any = [
        // { key: 'user_type_id', label: 'User Type', visible: true },
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'role_name', label: 'Role Name', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'update_permission_by_account', label: 'Updated Role Management', visible: true }
    ];
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: any) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            ...columnKey
        }));
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

            permission = findRoleConfigByMenuName('Roles', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            // {
            //     accessorKey: "user_type_id",
            //     header: "User Type",
            //     align: 'center',
            //     enableSorting: true,
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (
            //             <div className="flex justify-center items-center">
            //                 <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>
            //                     {row?.user_type.name}
            //                 </div>
            //             </div>
            //         )
            //     }
            // },
            {
                accessorKey: "user_type_id", // ไว้เป็น reference id
                accessorFn: (row: any) => row?.user_type?.name ?? "", // ใช้ชื่อแทนเวลา search/sort
                header: "User Type",
                align: "center",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div
                                className="flex w-[100px] justify-center !text-[14px] font-bold rounded-full p-1"
                                style={{
                                    backgroundColor: row?.user_type?.color,
                                    color: row?.user_type?.color_text,
                                }}
                            >
                                {row?.user_type?.name}
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "name",
                header: "Role Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.name}</div>)
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
                accessorKey: "update_by",
                header: "Updated by",
                width: 250,
                enableSorting: true,

                accessorFn: (row) => `${`${row?.update_by_account?.first_name} ` || ''}${row?.update_by_account?.last_name} ${row?.update_date ? formatDate(row?.update_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original;

                    const firstName = row?.update_by_account?.first_name;
                    const lastName = row?.update_by_account?.last_name;

                    if (!firstName && !lastName) return null;

                    return (
                        <div>
                            <span className="text-[#464255]">
                                {firstName} {lastName}
                            </span>
                            <div className="text-gray-500 text-xs">
                                {row?.update_date ? formatDate(row?.update_date) : ""}
                            </div>
                        </div>
                    );
                }
            },
            {
                accessorKey: "update_permission_by_account",
                header: "Updated Role Management",
                width: 250,
                enableSorting: true,

                accessorFn: (row) => `${`${row?.update_permission_by_account?.first_name} ` || ''}${row?.update_permission_by_account?.last_name} ${row?.update_permission_date ? formatDate(row?.update_permission_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.update_permission_by_account?.first_name} {row?.update_permission_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.update_permission_date ? formatDate(row?.update_permission_date) : ''}</div>
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
                    // const getPermission: any = renderPermission();
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false}
                        />
                    )
                }
            },
        ], [dataTable, userPermission, user_permission]
    )

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

    const getRowdata: any = (id: any) => {
        const findData: any = dataTable?.find((item: any) => item?.id == id);
        return findData
    }

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
            case "dup":
                openDupForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null)
                break;
            case "rolemgn":
                openRoleModal(id);
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
                    {/* <InputSearch
                        id="searchUserType"
                        label="User Type"
                        type="select"
                        value={srchUserType}
                        onChange={(e) => setSrchUserType(e.target.value)}
                        options={[
                            { value: "2", label: "TSO" },
                            { value: "3", label: "Shipper" },
                            { value: "4", label: "Other" },
                        ]}
                    /> */}

                    <InputSearch
                        id="searchUserType"
                        label="User Type"
                        type="select-multi-checkbox"
                        value={srchUserType}
                        onChange={(e) => setSrchUserType(e.target.value)}
                        options={[
                            { value: "2", label: "TSO" },
                            { value: "3", label: "Shipper" },
                            { value: "4", label: "Other" },
                        ]}
                        placeholder="Search User Type"
                    />

                    <InputSearch
                        id="searchRole"
                        label="Role Name"
                        value={srchRole}
                        onChange={(e) => setSrchRole(e.target.value)}
                        placeholder="Search Role Name"
                    />

                    <DatePickaSearch
                        key={"start" + key}
                        label="Start Date"
                        placeHolder="Select Start Date"
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <DatePickaSearch
                        key={"end" + key}
                        label="End Date"
                        placeHolder="Select End Date"
                        allowClear
                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                    />
                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"Add"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div>
                </aside>
            </div>

            {/* ================== DISABLE FOR NEW TABLE ==================*/}
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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/roles" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>
                <TableRole
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openDupForm={openDupForm}
                    openRoleModal={openRoleModal}
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
                        path="dam/roles"
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

            <ModalactionRole
                mode={formMode}
                data={formData}
                open={formOpen}
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
                isLoading={isLoadingModal}
                setisLoading={setIsLoadingModal}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Role has been added."
                description={msgSuccess}

            />

            <RoleMgnModal
                open={isModalRoleOpen}
                handleClose={handleCloseRoleModal}
                id={`${selectedId}`}
                data={dataRoleMgn}
                token={token}
                dataRole={dataRole}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="role-master"
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
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", getRowdata(openPopoverId)?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", getRowdata(openPopoverId)?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                        }
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("dup", getRowdata(openPopoverId)?.id) }}><ContentCopyIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Duplicate</li>
                        }
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("rolemgn", getRowdata(openPopoverId)?.id) }}><SupervisedUserCircleOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Role Management</li>
                        }
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", getRowdata(openPopoverId)?.id) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                        }
                    </ul>
                </div>
            </Popover>
        </div>
    );
};

export default ClientPage;