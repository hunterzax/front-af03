"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { anonymizeEmail, fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDateNoTime, formatDateTimeSec, generateUserPermission, getNestedValue, iconButtonClass, maskLastFiveDigits } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import getCookieValue from "@/utils/getCookieValue";
import { getService, patchService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import TransferListDialog from "./form/modalTransfer";
import ModalDivision from "./form/modalDivision";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
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
import { ColumnDef, Row } from "@tanstack/react-table";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import SettingsIcon from '@mui/icons-material/Settings';
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import getUserValue from "@/utils/getuserValue";
import dayjs from "dayjs";

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

            const permission = findRoleConfigByMenuName('Shipper', userDT)
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
    const [srchId, setSrchId] = useState('');
    const [srchName, setSrchName] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchStatus, setSrchStatus] = useState<any>([]);

    const handleFieldSearch = () => {
        // let stat = srchStatus === "1" ? true : false
        const statusFilter = srchStatus.map((s: any) => s === "1");
        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                (srchId ? item?.id_name.toLowerCase().includes(srchId.toLowerCase()) : true) &&
                (srchName ? item?.name.toLowerCase().includes(srchName.toLowerCase()) : true) &&
                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true) &&
                // (srchStatus ? item?.status === stat : true)
                (statusFilter.length ? statusFilter.includes(item?.status) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchId('');
        setSrchName('');
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchStatus([]);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    // const handleSearch = (query: string) => {
    //     const filtered = dataTable.filter((item: any) => {
    //         const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
    //         return (
    //             item?.id_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //             item?.address?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //             (item?.role_default?.[0]?.role?.name || '').replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //             item?.bank_no?.toLowerCase().includes(queryLower) ||
    //             item?.company_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //             item?.telephone?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //             item?.email?.toLowerCase().includes(queryLower) ||
    //             formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
    //             formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower) ||
    //             formatDateTimeSec(item?.start_date)?.toLowerCase().includes(queryLower) ||
    //             formatDateTimeSec(item?.end_date)?.toLowerCase().includes(queryLower) ||
    //             item?.start_date?.toLowerCase().includes(queryLower) ||
    //             item?.end_date?.toLowerCase().includes(queryLower) ||
    //             item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //             item?.telephone?.toLowerCase().includes(queryLower)
    //         );
    //     });
    //     setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    //     setFilteredDataTable(filtered);
    // };

    // ############### DATA TABLE ###############

    const [dataTable, setData] = useState<any>([]);
    const [dataDivNotUse, setDataDivNotUse] = useState<any>([]);
    const [dataDefaultRole, setDataDefaultRole] = useState<any>([]);
    const [dataAreaContract, setDataAreaContract] = useState<any>([]);
    const [dataDiv, setDataDiv] = useState<any>([]);
    const [dataGroup, setDataGroup] = useState<any>([]);
    const [dataBank, setDataBank] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [divNotUseAndUsed, setDivNotUseAndUsed] = useState();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [istrLoading, settrIsLoading] = useState<boolean>(false);
    const [selectedKey, setselectedKey] = useState<any>();
    const [key, setKey] = useState(0);

    const fetchData = async () => {
        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const response: any = await getService(`/master/account-manage/group-master?user_type=3`);

            const updatedDataShipper = response.map((shipper: any) => ({
                ...shipper,
                role: shipper?.role_default?.[0]?.role || null,
                division_: shipper?.division_group_show?.map((d:any) => d?.division)
                // start_date: shipper?.start_date ? formatDateNoTime(shipper?.start_date) : '',
                // end_date: shipper?.end_date ? formatDateNoTime(shipper?.end_date) : '',
            }));

            setData(updatedDataShipper);
            setFilteredDataTable(updatedDataShipper);

            const response_division = await getService(`/master/account-manage/division-not-use`);
            const response_role: any = await getService(`/master/account-manage/role-master`);
            const response_bank = await getService(`/master/account-manage/banking-master`);
            const respones_area_contract = await getService(`/master/account-manage/area-contract`);

            const filterRole = response_role?.filter((item: any) => item.user_type.id === 3);

            // --- กรอง ที่ end ไปแล้วออกนะ
            const filteredRoles = filterRole.filter((r: any) => {
                if (!r?.end_date) return true; // null/undefined => ไม่กรอง
                return dayjs(r.end_date).isSameOrAfter(dayjs(), "second"); // ยังไม่หมดอายุ
            });

            setDataDefaultRole(filteredRoles);
            setDataBank(response_bank);
            setDataDivNotUse(response_division);

            setDataAreaContract(respones_area_contract)
            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const onReload = async () => {
        const response: any = await getService(`/master/account-manage/group-master?user_type=3`);
        const response_ = response.map((shipper: any) => ({
            ...shipper,
            role: shipper?.role_default?.[0]?.role || null,
            division_: shipper?.division_group_show?.map((d:any) => d?.division)
            // start_date: shipper?.start_date ? formatDateNoTime(shipper?.start_date) : '',
            // end_date: shipper?.end_date ? formatDateNoTime(shipper?.end_date) : '',
        }));

        setData(response_);
        setFilteredDataTable(response_);
        settrIsLoading(false);
        setselectedKey(null);
    }

    const fetchDataDiv = async (id: any) => {
        try {
            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const response: any = await getService(`/master/account-manage/division-not-use-way-edit/${id}`);
            setDivNotUseAndUsed(response);
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

    const [transferOpen, setTransferOpen] = useState(false);
    const [transferData, setTransferData] = useState<any>();

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [msgSuccess, setMsgSuccess] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [mdDivOpen, setMdDivOpen] = useState(false);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        id_name: '',
        name: '',
        company_name: '',
        user_type_id: '',
        telephone: '',
        email: '',
        address: '',
        bank_no: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
        status: '',
        bank_master_id: '',
        role_default: [],
        division: [],
    };

    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        const { id, ...newData } = data
        // newData["start_date"] = dayjs(newData["start_date"]).format("YYYY-MM-DD HH:mm:ss")
        // newData["end_date"] = dayjs(newData["end_date"]).format("YYYY-MM-DD HH:mm:ss")
        // newData["division"] = newData.division ? [{ "id": newData.division }] : [] // original
        newData["division"] = newData.division?.length > 0 ? newData.division.map((id: any) => ({ id })) : [];

        newData["role_default"] = [{ "id": newData.role_default }]
        newData["user_type_id"] = 3 // (2 = TSO, 3 = Shipper, 4 = Other)
        if (typeof newData["end_date"] !== 'string' || newData["end_date"] == "Invalid Date") {
            newData["end_date"] = null;
        }
        newData["status"] = newData.status === "1" ? true : false
        const updateData = replaceEmptyStringsWithNull(newData);

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/account-manage/group-create', updateData);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true);
                } else {
                    setMsgSuccess('Shipper has been added.')
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                    await fetchData();
                    if (resetForm) resetForm(); // reset form
                }
                break;
            case "edit":
                let res_update = await putService(`/master/account-manage/group-update/${selectedId}`, updateData);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;
                
                if (statusCodePut === 400 || statusCodePut === 500) {
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    setMsgSuccess('Your changes have been saved.')
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                    await fetchData();
                    if (resetForm) resetForm(); // reset form
                }
                break;
        }
        setIsModalLoading(false)
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData({
            id_name: '',
            name: '',
            company_name: '',
            user_type_id: '',
            telephone: '',
            email: '',
            address: '',
            bank_no: '',
            // start_date: new Date(),
            // end_date: new Date(),
            start_date: undefined,
            end_date: undefined,
            status: '',
            bank_master_id: '',
            role_default: [],
            division: [],
        });
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {

        fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);

        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.id_name = filteredData.id_name;
            fdInterface.name = filteredData.name;
            fdInterface.company_name = filteredData.company_name;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.telephone = filteredData.telephone;
            fdInterface.email = filteredData.email;
            fdInterface.address = filteredData.address;
            fdInterface.bank_no = filteredData.bank_no;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
            fdInterface.status = filteredData.status ? "1" : "2";
            fdInterface.active = filteredData.active;
            fdInterface.bank_master_id = filteredData.bank_master_id;
            fdInterface.bank_master = filteredData.bank_master;
            fdInterface.role_default = filteredData?.role_default[0]?.role?.id;
            // fdInterface.division = filteredData?.division[0]?.id;
            fdInterface.division = filteredData?.division;
            fdInterface.division_ = filteredData?.division_;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setFormOpen(true);
    };


    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.id_name = filteredData.id_name;
            fdInterface.name = filteredData.name;
            fdInterface.company_name = filteredData.company_name;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.telephone = filteredData.telephone;
            fdInterface.email = filteredData.email;
            fdInterface.address = filteredData.address;
            fdInterface.bank_no = filteredData.bank_no;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
            fdInterface.status = filteredData.status ? "1" : "2";
            fdInterface.active = filteredData.active;
            fdInterface.bank_master_id = filteredData.bank_master_id;
            fdInterface.bank_master = filteredData.bank_master;
            fdInterface.role_default = filteredData?.role_default[0]?.role?.id;
            // fdInterface.division = filteredData?.division[0]?.id;
            fdInterface.division = filteredData?.division;
            fdInterface.division_ = filteredData?.division_;
        }
        setFormMode('view');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openTransfer = async (id: any) => {
        const response: any = await getService(`/master/account-manage/group-master?user_type=3`);
        const filteredData = response?.find((item: any) => item.id === id);
        setTransferData(filteredData)
        setTransferOpen(true)
    };

    const openDiv = (id: any, dataDiv: any, dataGroup: any) => {
        setDataDiv(dataDiv);
        setDataGroup(dataGroup);
        setMdDivOpen(true)
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const handleActive = async (id: any, isActive: any) => {
        let data = {
            status: isActive,
            user_type_id: 3 // (2 = TSO, 3 = Shipper, 4 = Other)
        }

        const res_update = await patchService(`/master/account-manage/group-status/${id}`, data);
        onReload();
    }

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
            const response: any = await getService(`/master/account-manage/history?type=group-3&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "id_name", title: "Shipper ID" },
                { key: "name", title: "Shipper Name" },
                { key: "company_name", title: "Shipper Company Name" },
            ];
            let result = mappings.map(({ key, title }) => {
                // const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                const value = getNestedValue(valuesArray[0], key);

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

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;

            permission = findRoleConfigByMenuName('Shipper', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "status",
                header: "Status",
                align: 'center',
                enableSorting: false,
                cell: ({ getValue, row }: { getValue: () => any, row: Row<any> }) => {
                    const value = getValue()
                    return (
                        <div onClick={(e) => {
                            setselectedKey(row?.original?.id);
                            settrIsLoading(true);
                            handleActive(row?.original?.id, !value);
                        }}>
                            <label className="relative inline-block w-11 h-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    className="sr-only peer"
                                    disabled={!userPermission?.f_edit}
                                />
                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                            </label>
                        </div>
                    )
                },
            },
            {
                accessorKey: "id_name",
                header: "Shipper ID",
                width: 120,
                enableSorting: true,
                accessorFn: (row: any) => row?.id_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.id_name ? row?.id_name : ''}</div>)
                }
            },
            {
                accessorKey: "name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.name ? row?.name : ''}</div>)
                }
            },
            {
                accessorKey: "company_name",
                header: "Shipper Company Name",
                width: 300,
                enableSorting: true,
                accessorFn: (row: any) => row?.company_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.company_name ? row?.company_name : ''}</div>)
                }
            },
            {
                accessorKey: "division_name",
                header: "Division Name",
                align: 'center',
                enableSorting: false,
                size: 160,
                accessorFn: (row: any) => row?.division?.length || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openDiv(row?.id, row?.division, { "id_name": row?.id_name, "name": row?.name, "company_name": row?.company_name })}
                                // disabled={row?.division.length <= 0 && true}
                                disabled={!userPermission?.f_view || row?.system_login_account?.length <= 0}
                            >
                                <SupervisorAccountRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                className={iconButtonClass}
                                // onClick={() => openDiv(row?.id, row?.division, { "id_name": row?.id_name, "name": row?.name, "company_name": row?.company_name })}
                                onClick={() => openDiv(row?.id, (row?.division_group_show && row?.division_group_show?.length > 0 ? row?.division_group_show?.map((e:any) => e?.division) : row?.division), { "id_name": row?.id_name, "name": row?.name, "company_name": row?.company_name })}
                                disabled={!userPermission?.f_view || row?.system_login_account?.length <= 0}
                            >
                                <SupervisorAccountRoundedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.division_group_show && row?.division_group_show?.length > 0 ? row?.division_group_show?.length : row?.division?.length}
                                {/* {row?.division?.length} */}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "role_default",
                header: "Default Role",
                width: 150,
                enableSorting: true,
                accessorFn: (row: any) => row?.role?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.role ? row?.role?.name : ''}</div>)
                }
            },
            {
                accessorKey: "address",
                header: "Address",
                width: 500,
                enableSorting: false,
                accessorFn: (row: any) => row?.address || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.address ? row?.address : ''}</div>)
                }
            },
            {
                accessorKey: "telephone",
                header: "Telephone",
                enableSorting: true,
                accessorFn: (row: any) => row?.telephone || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.telephone ? maskLastFiveDigits(row?.telephone) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "email",
                header: "Email",
                enableSorting: true,
                accessorFn: (row: any) => row?.email || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.email ? anonymizeEmail(row?.email) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "bank_account",
                header: "Bank Account",
                enableSorting: true,
                accessorFn: (row: any) => row?.bank_no || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.bank_no ? maskLastFiveDigits(row?.bank_no) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "start_date",
                header: "Start Date",
                enableSorting: true,
                // accessorFn: (row: any) => formatDateTimeSec(row?.start_date) || '',
                accessorFn: (row: any) => formatDateNoTime(row?.start_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className={`w-[180px] ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.start_date ? formatDateTimeSec(row?.start_date) : ''}</div>
                        <div className={`w-[180px] ${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "end_date",
                header: "End Date",
                enableSorting: true,
                // accessorFn: (row: any) => formatDateTimeSec(row?.end_date) || '',
                accessorFn: (row: any) => formatDateNoTime(row?.end_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        // <div className={`w-[180px] ${row?.status ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.end_date ? formatDateTimeSec(row?.end_date) : ''}</div>
                        <div className={`w-[180px] ${row?.status ? "text-[#0DA2A2]" : "text-[#9CA3AF]"}`}>{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "group_id",
                header: "Group ID",
                align: 'center',
                width: 100,
                enableSorting: false,
                cell: ({ row }) => {
                    const original = row.original as any;
                    const { f_edit = false } = renderPermission() ?? {};

                    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        e.stopPropagation();
                        if (userPermission?.f_edit) {
                            openTransfer(original.id);
                        }
                    };

                    return (
                        <div className="w-full flex justify-center">
                            <button
                                type="button"
                                onClick={handleClick}
                                disabled={!userPermission?.f_edit}
                                /* ----- 2) บังคับ pointer-events:auto (สำคัญ!) ----- */
                                className={`
                                pointer-events-auto
                                flex items-center justify-center
                                px-[2px] py-[2px] rounded-md border border-[#DFE4EA]
                                ${userPermission?.f_edit ? 'text-[#00ADEF] hover:bg-blue-600 hover:text-white' : 'text-gray-400 cursor-not-allowed bg-gray-200'}`}
                            >
                                <SettingsIcon sx={{ fontSize: 18 }} />
                            </button>
                        </div>
                    );
                },

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
                        <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                    )
                }
            },
        ],
        [user_permission, userPermission, dataTable]
    );

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'id_name', label: 'Shipper ID', visible: true },
        { key: 'name', label: 'Shipper Name', visible: true },
        { key: 'company_name', label: 'Shipper Company Name', visible: true },
        { key: 'division_name', label: 'Division Name', visible: true },
        { key: 'role_default', label: 'Default Role', visible: true },
        { key: 'address', label: 'Address', visible: true },
        { key: 'telephone', label: 'Telephone', visible: true },
        { key: 'email', label: 'Email', visible: true },
        { key: 'bank_account', label: 'Bank Account', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'group_id', label: 'Group ID', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'name', label: 'Shipper Name', visible: true },
        { key: 'company_name', label: 'Shipper Company Name', visible: true },
        { key: 'division_name', label: 'Division Name', visible: true },
        { key: 'role_default', label: 'Default Role', visible: true },
        { key: 'address', label: 'Address', visible: true },
        { key: 'telephone', label: 'Telephone', visible: true },
        { key: 'email', label: 'Email', visible: true },
        { key: 'bank_no', label: 'Bank Account', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true }
    ];
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
        // Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible, column.label]))
    );

    const [tk, settk] = useState(false);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: any) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            ...columnKey
        }));
    };

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
                        id="searchShipperId"
                        label="Shipper ID"
                        value={srchId}
                        onChange={(e) => setSrchId(e.target.value)}
                        placeholder="Search Shipper ID"
                    />

                    <InputSearch
                        id="searchShipperName"
                        label="Shipper Name"
                        value={srchName}
                        onChange={(e) => setSrchName(e.target.value)}
                        placeholder="Search Shipper Name"
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

                    <InputSearch
                        id="searchStat"
                        label="Status"
                        type="select-multi-checkbox"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={[
                            { value: "1", label: "Active" },
                            { value: "2", label: "Inactive" },
                        ]}
                        placeholder="Select Status"
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
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/shipers-group" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>
                <TableShippersGroup
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    handleActive={handleActive}
                    openHistoryForm={openHistoryForm}
                    tableData={paginatedData}
                    openTransfer={openTransfer}
                    openDiv={openDiv}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    istrLoading={istrLoading}
                    settrIsLoading={settrIsLoading}
                    selectedKey={selectedKey}
                    setselectedKey={setselectedKey}
                    userPermission={userPermission}
                />

                
            </div> */}

            {/* ================== NEW TABLE ==================*/}
            <AppTable
                data={filteredDataTable}
                columns={columns}
                isLoading={isLoading}
                isTableLoading={istrLoading}
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="dam/shipers-group"
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

            {/* <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

            {/* <div>
                <InventoryTable data={dataTable} columns={columns} isLoading={isLoading} isTableLoading={istrLoading}/>
            </div> */}

            <ModalAction
                mode={formMode}
                dataForm={formData}
                dataDivNotUse={dataDivNotUse}
                dataDefaultRole={dataDefaultRole}
                dataBank={dataBank}
                divNotUseAndUsed={divNotUseAndUsed}
                open={formOpen}
                isLoading={isModalLoading}
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
                setIsLoading={setIsModalLoading}
            // fetchData={fetchData}  
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Shipper has been added."
                description={`${msgSuccess}`}
            />

            <ModalDivision
                dataDiv={dataDiv}
                dataGroup={dataGroup}
                open={mdDivOpen}
                onClose={() => {
                    setMdDivOpen(false);
                }}
                modeShowDiv="shipper"
            />

            <TransferListDialog
                open={transferOpen}
                transferData={transferData}
                dataAreaContract={dataAreaContract}
                onClose={async () => {
                    setTransferOpen(false);
                    setTransferData({});
                    await fetchData();
                }}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="group-3"
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
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        {
                            modalErrorMsg.split('<br/>').length > 1 ?
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
                                    {modalErrorMsg}
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
    )
}

export default ClientPage;