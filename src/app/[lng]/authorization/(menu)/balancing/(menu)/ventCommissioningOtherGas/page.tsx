"use client";
import { useEffect, useRef, useState } from "react";
import { Tune } from "@mui/icons-material"
import { fillMissingUpdateByAccount, filterByDateRange, findRoleConfigByMenuName, formatDateNoTime, formatNumberFourDecimal, generateUserPermission, getDateRangeForApi } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { deleteServiceWithPayload, getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import ModalComment from "./form/modalComment";
import BtnAddNew from "@/components/other/btnAddNew";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import TableVentCommissioningOtherGas from "./form/table";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import ModalExecute from "../../../allocation/(menu)/alloManage/form/modalExecute";
import ModalConfirmDel from "./form/modalConfirmDel";
import ModalImport from "./form/modalImport";
import dayjs from 'dayjs';

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
            //     const permission = findRoleConfigByMenuName('Vent/Commissioning/Other Gas', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Vent/Commissioning/Other Gas', userDT)
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
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !shipperGroupData?.data) {
            dispatch(fetchShipperGroup());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch]); // Watch for forceRefetch changes


    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchTypeDocument, setSrchTypeDocument] = useState('');
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);

    const handleFieldSearch = () => {
        let result_gasday_from_to: any = dataTable
        if (srchGasDayFrom || srchGasDayTo) {
            const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
            result_gasday_from_to = filterByDateRange(dataTable, start_date, end_date);
        }

        const result_2 = result_gasday_from_to.filter((item: any) => {
            const groupId = item?.group?.id?.toString(); // Convert group ID to string
            return (
                // (!srchShipper.length || srchShipper.includes(groupId)) && // Check group ID if list isn't empty
                (srchShipper.length ? srchShipper.includes(groupId) : true) &&
                // (srchShipper ? srchShipper == groupId : true) &&
                (srchTypeDocument ? item?.nomination_type?.name == srchTypeDocument : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = async () => {
        // setSrchShipper([]);
        setSrchShipper([]);
        setSrchGasDayFrom(null)
        setSrchGasDayTo(null)
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                return (
                    item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day_text)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.vent_gas_value_mmbtud?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.commissioning_gas_value_mmbtud?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.other_gas_value_mmbtud?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.vent_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.commissioning_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.other_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataZone, setDataZone] = useState<any>([]);
    const [closeBalanceData, setCloseBalanceData] = useState<any>();


    const fetchData = async () => {
        try {
            const today = dayjs();

            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
            }

            // GET CLOSE BALANCE DATA
            const res_close_balance_data = await getService(`/master/balancing/closed-balancing-report`)
            setCloseBalanceData(res_close_balance_data)

            // GET SHIPPER DATA
            // const res_shipper_approve = await getService(`/master/upload-template-for-shipper/shipper-contract-approved`);
            // let filter_shipper = filterShipperGroupData(res_shipper_approve)
            // setDataShipper(filter_shipper);
            const res_balance_shipper = await getService(`/master/balancing/shipper`)
            let filter_shipper_ = res_balance_shipper?.filter((item: any) => item?.status == true)
            setDataShipper(filter_shipper_);

            // GET ZONE DATA
            const res_balance_zone = await getService(`/master/balancing/zone`)
            const filteredZoneMaster = res_balance_zone.filter((zone: any) => {
                const startDate = dayjs(zone.start_date);
                const endDate = zone.end_date ? dayjs(zone.end_date) : null;
                const isInDateRange = startDate.isBefore(today.add(1, 'day')) && (!endDate || today.isBefore(endDate.add(1, 'day')));
                const isValidName = ['WEST', 'EAST', 'EAST-WEST'].includes(zone.name);

                return isInDateRange && isValidName;
            });

            // เหลือชื่อไม่ซ้ำ โดยเลือก zone ที่ update_date ล่าสุดของแต่ละ name
            const uniqueZones = Object.values(
                filteredZoneMaster.reduce((acc: any, zone: any) => {
                    const name = zone.name;
                    if (!acc[name] || dayjs(zone.update_date).isAfter(dayjs(acc[name].update_date))) {
                        acc[name] = zone;
                    }
                    return acc;
                }, {})
            );
            setDataZone(uniqueZones)

            const response: any = await getService(`/master/balancing/vent-commissioning-other-gas`);
            // List : Shipper เข้ามาแล้วต้องเห็นเฉพาะ Template ของตัวเอง https://app.clickup.com/t/86erwav1k
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                let filter_only_shipper_or_not: any = response?.filter((item: any) => {
                    return item?.group_id === userDT?.account_manage?.[0]?.group_id
                })
                setData(filter_only_shipper_or_not);
                setFilteredDataTable(filter_only_shipper_or_not);
            } else {
                setData(response);
                setFilteredDataTable(response);
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

    // ############# RE-GENERATE  #############
    const [dataRegen, setDataReGen] = useState<any>([]);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [isModalSuccessAllocBalOpen, setModalSuccessAllocBalOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const handleCloseAllocBalModal = () => setModalSuccessAllocBalOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);

    const handleFormSubmit = async (data: any) => {
        switch (formMode) {
            case "create":
                const res_create = await postService('/master/balancing/vent-commissioning-other-gas', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    // setModalErrorMsg(res_create?.error);
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Vent/Commissioning/Other Gas has been added.')
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let body_edit = {
                    "vent_gas_value_mmbtud": data?.vent_gas_value_mmbtud,
                    "commissioning_gas_value_mmbtud": data?.commissioning_gas_value_mmbtud,
                    "other_gas_value_mmbtud": data?.other_gas_value_mmbtud,
                    "remark": data?.remark // ไม่มีใส่ ""
                }
                let res_edit = await putService(`/master/balancing/vent-commissioning-other-gas/${selectedId}`, body_edit);
                const statusCodePut = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                const errorMsgPut = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

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
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
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
            const response: any = await getService(`/master/account-manage/history?type=vent-commissioning-other-gas&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "group.name", title: "Shipper Name" },
                { key: "zone.name", title: "Zone" },
                // { key: "description", title: "Description" },
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

    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {
        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

    // ############### REASON VIEW ###############
    const [mdConfirmDelOpen, setMdConfirmDelOpen] = useState(false);
    const [dataConfirmDel, setDataConfirmDel] = useState<any>([]);

    const openConfirmDelModal = (data: any) => {
        const ids = data.map((item: any) => item.id);
        const filter_data_table = dataTable.filter((item: any) => ids.includes(item.id));
        setDataConfirmDel(filter_data_table)
        setMdConfirmDelOpen(true)
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

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### MODAL ALLOC AND BALANCE EXECUTE ###############
    const [mdExcuteOpen, setMdExecuteOpen] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);

    const handleExcute = async () => {
        setTimeout(() => {
            setMdExecuteOpen(true);
        }, 300);
    };

    const handleFormSubmitUpdate = async (data: any) => { // submit alloc and bal
        setExecuteLoading(true)
        try {
            postService('/master/allocation/execute-data', { menu: 'Vent/Commissioning/Other Gas' });
        } catch (error) {
            // error alloc and bal
        }

        setExecuteLoading(false)

        await fetchData();
        // setMdEditOpen(false);
        setMdExecuteOpen(false);
        if (resetForm) resetForm();
        setModalSuccessAllocBalOpen(true);
    }

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'vent_gas', label: 'Vent Gas (MMBTU)', visible: true },
        { key: 'commissioning_gas', label: 'Commissioning Gas (MMBTU)', visible: true },
        { key: 'other_gas', label: 'Other Gas (MMBTU)', visible: true },
        { key: 'comment', label: 'Comment', visible: true }, // <=== จาก Remarks เป็น Comment SHEET Sprint 4 NO.128
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'vent_gas', label: 'Vent Gas (MMBTU)', visible: true },
        { key: 'commissioning_gas', label: 'Commissioning Gas (MMBTU)', visible: true },
        { key: 'other_gas', label: 'Other Gas (MMBTU)', visible: true },
        { key: 'comment', label: 'Comment', visible: true }, // <=== จาก Remarks เป็น Comment SHEET Sprint 4 NO.128
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

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### HANDLE DELETE ###############
    const handleDelete = async (data?: any) => {
        const dataDel = {
            id: dataConfirmDel.map((item: any) => item.id)
        };

        const res_del: any = await deleteServiceWithPayload(`/master/balancing/vent-commissioning-other-gas`, dataDel);
        if (res_del?.response?.data?.status === 400 || res_del?.response?.status === 400 || res_del?.status === 400) {
            setFormOpen(false);
            setModalErrorMsg(res_del?.response?.data?.error);
            setModalErrorOpen(true)
        } else {
            setFormOpen(false);
            setModalSuccessMsg('Data has been deleted.')
            setModalSuccessOpen(true);
            setTimeout(() => {
                // setDeleteOpen(false)
                setDataConfirmDel([])
                setSelectedRoles([])
                setMdConfirmDelOpen(false);
            }, 200);
        }

        await fetchData();
        if (resetForm) resetForm();
    }

    // =================== MODAL IMPORT ===================
    const [formActionOpen, setformActionOpen] = useState(false); // open modal action
    const openTemplateForm = () => {
        setformActionOpen(true);
    };

    // ที่ทำ interval ไว้เพราะข้อนี้ (อ่านคอมเม้นนะ)
    // R : Delete : ต้องไม่สามารถ Delete รายการก่อน Closed Balance ได้ ให้ disable ไปเลย https://app.clickup.com/t/86eujrgq1
    useEffect(() => {
        let cancelled = false;
        let timer: any = null;

        const loop = async () => {
            try {
                const res = await getService(`/master/balancing/closed-balancing-report`);
                if (!cancelled) setCloseBalanceData(res);

                timer = setTimeout(loop, 15_000);
            } catch (e) {
                // ถ้า error ให้ถอยไป 60 วิ
                timer = setTimeout(loop, 60_000);
            }
        };

        loop();

        return () => {
            cancelled = true;
            if (timer) clearTimeout(timer);
        };
    }, []);

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                    />

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox" // Filter Shipper Name ปรับเป็น Multi Select https://app.clickup.com/t/86eue3tt0
                        // value={srchShipper}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipper}
                        onChange={(e) => setSrchShipper(e.target.value)}
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

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex gap-2">
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
                        <div className="flex flex-wrap gap-2 justify-end">
                            <BtnAddNew
                                openCreateForm={openCreateForm}
                                textRender={"New"}
                                can_create={userPermission ? userPermission?.f_create : false}
                            />
                        </div>
                    </div>
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    {/* Group Tune and BtnGeneral */}
                    <div className="flex items-center space-x-2">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>

                        {/* Shipper ไม่ต้องเห็นปุ่ม Delete */}
                        {
                            userDT?.account_manage?.[0]?.user_type_id !== 3 && <BtnGeneral
                                bgcolor={"#E46969"}
                                modeIcon={'delete'}
                                textRender={"Delete"}
                                generalFunc={() => openConfirmDelModal(selectedRoles)}
                                can_create={userPermission ? userPermission?.f_create : false}
                                disable={selectedRoles?.length > 0 ? false : true}
                            />
                        }

                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="balancing/vent-commissioning-other-gas"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                        />

                        <BtnGeneral
                            bgcolor={"#00ADEF"}
                            modeIcon={'export'}
                            textRender={"Import"}
                            generalFunc={() => openTemplateForm()}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                    </div>
                </div>

                <TableVentCommissioningOtherGas
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                    setDataReGen={setDataReGen}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                    closeBalanceData={closeBalanceData}
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
                dataTable={dataTable}
                dataShipper={dataShipper}
                closeBalanceData={closeBalanceData}
                // zoneMasterData={zoneMaster?.data}
                zoneMasterData={dataZone}
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
                userDT={userDT}
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

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="bal-vent-commissioning-other"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            {/* Confirm delete */}
            <ModalConfirmDel
                data={dataConfirmDel}
                open={mdConfirmDelOpen}
                onClose={() => {
                    setMdConfirmDelOpen(false);
                }}
                onSubmitDel={() => {
                    handleDelete();
                    // setMdConfirmDelOpen(false);
                }}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            {/* ALLOC AND BAL */}
            <ModalExecute
                data={[]}
                dataCloseBal={closeBalanceData}
                isLoading={executeLoading}
                open={mdExcuteOpen}
                onClose={() => {
                    setMdExecuteOpen(false);
                    if (resetForm) resetForm();
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
            />

            {/* ALLOC AND BAL Success */}
            <ModalComponent
                open={isModalSuccessAllocBalOpen}
                handleClose={handleCloseAllocBalModal}
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

            <ModalImport
                mode={'template'}
                open={formActionOpen}
                setformActionOpen={setformActionOpen}
                setModalErrorMsg={setModalErrorMsg}
                setModalErrorOpen={setModalErrorOpen}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                // shipperGroupData={shipperGroupData}
                // dataContractOriginal={dataContractOriginal}
                userDT={userDT}
                onClose={() => {
                    setformActionOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            setFormMode(undefined);
                            resetForm();
                        }, 200);
                    }
                }}
                // onSubmit={handleFormSubmit}
                onSubmit={async () => {
                    await fetchData();
                }}
                setResetForm={setResetForm}
            />
        </div>
    );
};

export default ClientPage;