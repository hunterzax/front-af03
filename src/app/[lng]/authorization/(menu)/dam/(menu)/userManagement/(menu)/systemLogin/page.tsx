"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import ModalView from "./form/modalView";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, iconButtonClass } from "@/utils/generalFormatter";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ModalUserView from "./form/modalUserView";
import TemplateMail from '@/components/other/rendermailTemplate';
import ModalComponent from "@/components/other/ResponseModal";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
    // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Login Management Tool', userDT)
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
    // const [srchLginMode, setSrchLginMode] = useState('');
    const [srchLginMode, setSrchLginMode] = useState<any>([]);
    const [srchRole, setSrchRole] = useState('');

    const handleFieldSearch = () => {
        const result = dataTable.filter((item: any) => {
            return (
                // (srchLginMode ? item?.mode_account?.id == srchLginMode : true) &&
                (srchLginMode?.length > 0 ? srchLginMode.includes(item?.mode_account?.id?.toString()) : true) && // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
                (srchRole ? item?.role?.name.toLowerCase().includes(srchRole.toLowerCase()) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        // setSrchLginMode('');
        setSrchLginMode([]);
        setSrchRole('');
        setFilteredDataTable(dataTable);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const handleSearch = (query: string) => {

        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

                return (
                    item?.role?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
                    item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
                    formatDateNoTime(item?.update_date)?.toLowerCase().includes(query.replace(/\s+/g, '').toLowerCase()) ||
                    formatTime(item?.update_date)?.toLowerCase().includes(query.replace(/\s+/g, '').toLowerCase().trim()) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '').toLowerCase()) ||
                    formatTime(item?.create_date)?.toLowerCase().includes(query.replace(/\s+/g, '').toLowerCase().trim()) ||
                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '').toLowerCase()) ||
                    item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    (item?.mode_account?.name + " Mode")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) // ใช้ใน login mgn tools
                )
            }
            // item?.mode_account?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase())
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataDefaultRole, setDataDefaultRole] = useState<any>([]);
    const [dataDefaultRoleMaster, setDataDefaultRoleMaster] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const apiRoles = async () => {
        const response_role: any = await getService(`/master/account-manage/system-login-role`);
        const response_role_master: any = await getService(`/master/account-manage/role-master`);
        setDataDefaultRole(response_role);
        setDataDefaultRoleMaster(response_role_master)
    }

    const fetchData = async () => {
        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const response: any = await getService(`/master/account-manage/system-login`);
            let resFetch = response.reverse()
            setData(resFetch);
            setFilteredDataTable(resFetch);

            await apiRoles();

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
        // test modal หลังจาก create
        // setViewCreate(true)
        // openViewForm(9);

    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [dataPost, setDataPost] = useState<any>([]);
    const [modeLogin, setModeLogIn] = useState<any>();

    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');

    const fdInterface: any = {
        mode_account: '',
        id_name: '',
        role: '',
        system_login_account: '',
    };

    const [formData, setFormData] = useState(fdInterface);
    const [viewData, setViewData] = useState<any>();
    const [viewCreate, setViewCreate] = useState<any>(false);

    const handleFormSubmitEmail = async (data: any) => {

        try {
            const resultLink: any = await postService('/master/account-manage/get-link', data);
            if (resultLink?.link) {
                const bodyMail = await TemplateMail({
                    header: "Reset Your Password",
                    description: "A request has been received to reset the password for your account. <br/> Please click the button below to reset your password",
                    btntxt: "Reset Password",
                    url: resultLink?.link,
                    mode: "resetmail"
                });

                let body: any = {
                    "to": data?.email,
                    "subject": "Reset Your Password",
                    "body": JSON.parse(bodyMail)
                }
                await postService('/mail/send-email', body);
            }
        } catch (error) {

        }

    };

    const handleFormSubmit = async (data: any) => {
        const { id, ...newData } = data
        const newDataPost = dataPost.map((e: any) => e)
        const editDataPut = selectedItems.map((e: any) => e)

        const dataPostReal = {
            // role_id: newDataPost[0]?.role,
            role_id: data?.role,
            mode_account_id: 2, // 1 == SSO, 2 == Local
            system_login_account: newDataPost.length > 0 ? newDataPost.map((user: any) => ({
                account_id: user?.user_data?.id,
                mode_account_id: user?.mode_account_id,
                password_gen_flag: user?.user_data?.password_gen_flag,
                password_gen_origin: user?.user_data?.password_gen_origin
            })) : []
        };


        const dataPut = {
            // role_id: newDataPost[0]?.role,
            // role_id: data?.role,
            role_id: data?.role?.id,
            // mode_account_id: 2, // 1 == SSO, 2 == Local
            // mode_account_id: data?.mode_account == "SSO Login" ? 1 : 2, // 1 == SSO, 2 == Local
            mode_account_id: modeLogin == "SSO Login" ? 1 : 2, // 1 == SSO, 2 == Local
            system_login_account: editDataPut.length > 0 ? editDataPut?.map((user: any) => ({
                account_id: user?.user_data?.id,
                // mode_account_id: dataPost[0]?.mode_account_id,
                // mode_account_id: data?.mode_account == "SSO Login" ? 1 : 2,
                mode_account_id: modeLogin == "SSO Login" ? 1 : 2,
                password_gen_flag: user?.user_data?.password_gen_flag,
                password_gen_origin: user?.user_data?.password_gen_origin
            })) : []
        };

        // Remove duplicates based on account_id
        dataPut.system_login_account = dataPut.system_login_account.filter(
            (item: { account_id: any; }, index: any, self: any[]) =>
                index === self.findIndex((t) => t.account_id === item.account_id)
        );

        switch (formMode) {
            case "create":

                let arrOkc: any = []
                selectedItems.map((e: any) => {
                    const find = selectedItemsTemp.find((f: any) => { return f?.user === e?.user })
                    if (!find) {
                        // arrOkc.push(e?.user_data?.email)
                        if (e?.mode_account_id !== 2) {
                            arrOkc.push(e?.user_data?.email)
                        }
                    }
                    return e
                })

                let res_create = await postService('/master/account-manage/system-logi-config', dataPostReal);
                if (res_create?.response?.data?.status === 400) {

                    setFormOpen(false);
                    setModalErrorMsg(res_create?.response?.data?.error);
                    setModalErrorOpen(true)
                } else {
                    if (arrOkc.length > 0) {
                        for (let i = 0; i < arrOkc.length; i++) {
                            await handleFormSubmitEmail({ email: arrOkc[i] })
                        }
                    }

                    await fetchData();

                    if (resetForm) resetForm();

                    setTimeout(() => {
                        setFormOpen(false);
                        setViewCreate(true)
                        openViewForm(res_create?.data?.id);
                        // openViewForm(res_create?.data);
                    }, 700);
                }

                if (arrOkc.length > 0) {
                    for (let i = 0; i < arrOkc.length; i++) {
                        await handleFormSubmitEmail({ email: arrOkc[i] })
                    }
                }

                await fetchData();
                if (resetForm) resetForm();

                setTimeout(() => {
                    setFormOpen(false);
                    setViewCreate(true)
                    openViewForm(res_create?.data?.id);
                }, 700);

                break;
            case "edit":
                let arrOk: any = []

                selectedItems.map((e: any) => {
                    const find = selectedItemsTemp.find((f: any) => { return f?.user === e?.user })
                    if (!find) {
                        // R : Local Login  ไม่ควรได้รับ  email
                        // case > กด edit แล้ว add user ที่เป็น local อยู่แล้วเข้าไป ระบบยังส่งเมล์ให้ reset password อยู่ค่ะ https://app.clickup.com/t/86er0fngf
                        if (e?.mode_account_id !== 2) {
                            arrOk.push(e?.user_data?.email)
                        }
                    }
                    return e
                })

                const res_update = await putService(`/master/account-manage/system-logi-config-edit/${selectedId}`, dataPut);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    // send email to new user
                    if (arrOk.length > 0) {
                        for (let i = 0; i < arrOk.length; i++) {
                            await handleFormSubmitEmail({ email: arrOk[i] })
                        }
                    }
                    setFormOpen(false);
                    setModalSuccessMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }

                break;
        }
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    // ****** ย้ายมาจาก modalAction ******
    const [systemLoginAccount, setSystemLoginAccount] = useState([]);
    const [roleDefaultUse, setRoleDefaultUse] = useState<any>([]);
    const [userData, setUserData] = useState([]);
    const [selectedItems, setSelectedItems] = useState<any>([]);
    const [selectedItemsTemp, setSelectedItemsTemp] = useState<any>([]);

    // #region fetchDataViewEdit
    const fetchDataViewEdit = async (id: any) => {
        try {
            const filteredData = dataTable.find((item: any) => item.id === id);

            // เอาแค่ role ที่เลือก edit
            const response: any = await getService(`/master/account-manage/system-login-role-use/${filteredData?.id}`);

            const filterRole: any = response?.filter((item: any) => item?.id === filteredData?.role_id);

            setSystemLoginAccount(filterRole[0]?.system_login[0]?.system_login_account) // ตัวแสดงผล user เก่า อาจจะไม่ใช้แล้ว
            getUserUnderRoleUse({ name: '', value: filterRole[0]?.id, dataRole: filterRole });
            // setValue('role', filterRole[0]?.id || '');
            setRoleDefaultUse(filterRole);

            const selectedUser = filteredData?.system_login_account.map((item: any) => ({
                role: filterRole[0]?.id,
                user: item?.account?.id,
                user_data: {
                    id: item?.account?.id,
                    email: item?.account?.email,
                    first_name: item?.account?.first_name ? item?.account?.first_name : null,
                    last_name: item?.account?.last_name ? item?.account?.last_name : null,
                    status: item?.account?.status,
                    mode_account: item?.account?.account_manage?.[0]?.mode_account,
                    password_gen_flag: item?.account?.password_gen_flag,
                    password_gen_origin: item?.account?.password_gen_origin
                },
                mode_account_id: filteredData?.mode_account_id
            }));

            setSelectedItems(selectedUser); // ---> user ที่เลือกไว้แล้ว
            setSelectedItemsTemp(selectedUser);
            setDataPost(selectedUser);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const getUserUnderRoleUse = async (data: any) => {
        const { name, value, dataRole } = data
        const filterRole: any = dataRole?.filter((item: any) => item.id === value);
        // -----
        setUserData(filterRole[0]?.account_role)
        // setRoleDefault(filterComp[0]?.role_default)
    };

    const mixData = async () => {
        setUserData((pre: any) => {
            let arrs: any = []
            pre?.map((e: any) => {
                const findId = selectedItems.find((f: any) => { return f?.user_data?.id === e?.account_manage?.account?.id })
                if (!findId) {
                    arrs.push(e)
                }
                return e
            })
            return arrs
        })
    }

    useEffect(() => {
        mixData()
    }, [selectedItems])

    const openCreateForm = async () => {
        await apiRoles()
        setSelectedItems([])
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        fetchDataViewEdit(id)
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = async (id: any) => {
        const res_system_login: any = await getService(`/master/account-manage/system-login`);
        const filteredData = res_system_login.find((item: any) => item.id === id);
        setViewData(filteredData);
        setViewOpen(true);
    };


    const [mdUserViewOpen, setMdUserViewOpen] = useState(false);
    const [dataUser, setDataUser] = useState<any>([]);

    const openUserView = (id: any, data: any) => {
        setDataUser(data);
        setMdUserViewOpen(true)
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
            const response: any = await getService(`/master/account-manage/history?type=system-login&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                { key: "mode_account.name", title: "Login Mode" },
                { key: "create_date", title: "Create Date" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);

                const isIsoString = typeof value === 'string' && !isNaN(Date.parse(value));

                return {
                    title,
                    // value: value || "",
                    value: isIsoString ? formatDateNoTime(value) : value || "",
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
        { key: 'login_mode', label: 'Login Mode', visible: true },
        { key: 'role', label: 'Role Name', visible: true },
        { key: 'user', label: 'Users', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'login_mode', label: 'Login Mode', visible: true },
        { key: 'role', label: 'Role Name', visible: true },
        { key: 'user', label: 'User', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true }
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

            permission = findRoleConfigByMenuName('Login Management Tool', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "login_mode",
                header: "Login Mode",
                enableSorting: true,
                accessorFn: (row: any) => row?.mode_account?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    const generateLowercase: any = row?.mode_account?.name == 'SSO' ? row?.mode_account?.name : row?.mode_account?.name?.toLowerCase();
                    return (
                        <div className="w-auto flex justify-start items-center absolute" style={{ transform: 'translate(-8px, -13px)' }}>
                            <div
                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255] capitalize"
                                style={{ backgroundColor: row?.mode_account?.color }}>{generateLowercase} Mode</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "role",
                header: "Role Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.role?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.role?.name}</div>
                    )
                }
            },
            {
                accessorKey: "user",
                header: "Users",
                align: 'center',
                accessorFn: (row: any) => row?.system_login_account?.length || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openUserView(row?.id, row?.system_login_account)}
                                disabled={(userPermission?.f_view == false ? true : row?.system_login_account?.length <= 0) && true}
                            >
                                <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}
                            <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openUserView(row?.id, row?.system_login_account)}
                                disabled={(userPermission?.f_view == false ? true : row?.system_login_account?.length <= 0) && true}
                            >
                                <SupervisorAccountRoundedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.system_login_account?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "create_by",
                header: "Created by",
                enableSorting: true,
                accessorFn: (row: any) => row?.create_by_account?.first_name || row?.create_by_account?.last_name || formatDate(row?.create_date) || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "updated_by",
                header: "Updated by",
                enableSorting: true,
                accessorFn: (row: any) => row?.update_by_account?.first_name || row?.update_by_account?.last_name || formatDateTimeSec(row?.update_date) || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
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
    );

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

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
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
                setAnchorPopover(null);
                break;
        }
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

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <InputSearch
                        id="searchUserType"
                        label="Login Mode"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchLginMode}
                        onChange={(e) => setSrchLginMode(e.target.value)}
                        options={[
                            { value: "1", label: "SSO Mode" },
                            { value: "2", label: "Local Mode" },
                        ]}
                        placeholder="Select log in mode"
                    />

                    <InputSearch
                        id="searchName"
                        label="Role Name"
                        value={srchRole}
                        onChange={(e) => setSrchRole(e.target.value)}
                        placeholder="Search Role Name"
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"Config"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div>
                </aside>
            </div>

            {/* ================== DISABLE FOR NEW TABLE ==================*/}
            {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/login-management-tool" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>
                <TableSystemLogin
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openUserView={openUserView}
                    // tableData={dataTable}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                />
            </div> */}

            {/* <PaginationComponent
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
                        path="dam/login-management-tool"
                        // can_export={userPermission ? userPermission?.f_export : false} 
                        can_export={true}
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
                dataForm={formData}
                dataDefaultRole={dataDefaultRole}
                dataPost={dataPost}
                setDataPost={setDataPost}
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            setFormData(null);
                            setSelectedItems([]);
                            setRoleDefaultUse([]);
                            resetForm();
                        }, 300);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                setSystemLoginAccount={setSystemLoginAccount}
                setRoleDefaultUse={setRoleDefaultUse}
                setUserData={setUserData}
                setSelectedItems={setSelectedItems}
                systemLoginAccount={systemLoginAccount}
                roleDefaultUse={roleDefaultUse}
                userData={userData}
                selectedItems={selectedItems}
                setModeLogIn={setModeLogIn}
                srchLginMode={srchLginMode}
            />

            <ModalUserView
                dataUser={dataUser}
                open={mdUserViewOpen}
                onClose={() => {
                    setMdUserViewOpen(false);
                }}
            />

            <ModalView
                data={viewData}
                open={viewOpen}
                onClose={() => {
                    setViewOpen(false);
                }}
                viewCreate={viewCreate}
                setViewCreate={setViewCreate}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="system-login"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Area has been added."
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
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                        }
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", openPopoverId) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
                        }
                    </ul>
                </div>
            </Popover>
        </div>
    )
}

export default ClientPage;