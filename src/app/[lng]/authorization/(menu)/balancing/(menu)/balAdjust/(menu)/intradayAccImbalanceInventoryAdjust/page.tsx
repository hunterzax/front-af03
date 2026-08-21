"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterByDateRange, findRoleConfigByMenuName, formatDate, formatDateTimeSec, formatNumberFourDecimal, formatTime, generateUserPermission, getDateRangeForApi, toDayjs } from '@/utils/generalFormatter';
import SearchInput from "@/components/other/searchInput";
import { deleteService, getService, postService } from "@/utils/postService";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
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
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import TableBalIntradayAccImbalanceInventoryAdjust from "./form/table";
import BtnGeneral from "@/components/other/btnGeneral";
import ModalComment from "./form/modalComment";
import ModalDelete from "./form/modalDelete";
import getUserValue from "@/utils/getuserValue";
import ModalExecute from "@/app/[lng]/authorization/(menu)/allocation/(menu)/alloManage/form/modalExecute";

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
            //     const permission = findRoleConfigByMenuName('Intraday Acc. Imbalance Inventory Adjust', userDT)
            //     setUserPermission(permission);
            // }

            // const permission = findRoleConfigByMenuName('Intraday Acc. Imbalance Inventory Adjust', userDT)
            const permission = findRoleConfigByMenuName('Acc. Imbalance Inventory Adjustment', userDT)
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
    const { zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchAreaMaster());
            // dispatch(fetchNominationPoint());
            // dispatch(fetchContractPoint());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, zoneMaster, areaMaster, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);

    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

    const handleFieldSearch = () => {
        const { start_date, end_date } = getDateRangeForApi(srchStartDate, srchEndDate);
        const result = filterByDateRange(dataTable, start_date, end_date);

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.gas_day?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    toDayjs(item?.gas_day).format("DD/MM/YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.east?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.west?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.east)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.west)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                    item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                    item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

                    item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                    item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                    item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
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
    const [closeBalanceData, setCloseBalanceData] = useState<any>();

    const fetchData = async () => {
        try {
            // GET CLOSE BALANCE DATA
            const res_ = await getService(`/master/balancing/closed-balancing-report`)
            setCloseBalanceData(res_)

            // ดูชื่อเส้นกับเมนูดี ๆ มันไม่ตรงกัน
            const response: any = await getService(`/master/balancing/intraday-acc-imbalance-inventory`);

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
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    // const handleCloseModalExecute = () => setMdExecuteOpen(false);
    const handleCloseModalExecute = () => setModalExecuteSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>('create');
    const fdInterface: any = {
        non_tpa_point_name: '',
        description: '',
        area_id: '',
        nomination_point_id: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
    };

    const [formData, setFormData] = useState<any>([]);

    const handleFormSubmit = async (data: any) => {
        // let body_comment = {
        //     "gas_day": data?.gas_day,
        //     "remark": data?.remark
        // }

        let body_post = {
            "gas_day": data?.gas_day,
            "zone": data?.zone_id,
            "value": data?.value_mmbtu,
            "remark": data?.remark ? data?.remark : null
        }

        switch (formMode) {
            case "create":

                const res_create = await postService('/master/balancing/intraday-acc-imbalance-inventory', body_post);
                // const res_create_comment = await postService('/master/balancing/intraday-acc-imbalance-inventory-comment', body_comment);

                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('The Intraday Acc. Imbalance Inventory Adjust has been added.')
                    setModalSuccessOpen(true);
                }

                break;
            case "edit":

                const res_edit = await postService('/master/balancing/intraday-acc-imbalance-inventory', body_post);
                // const res_edit_comment = await postService('/master/balancing/intraday-acc-imbalance-inventory-comment', body_comment);
                const statusCodeEdit = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                const errorMsgEdit = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

                if (statusCodeEdit === 400) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgEdit);
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }
                break;
        }
        await fetchData();
        if (resetForm) resetForm();
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.non_tpa_point_name = filteredData.non_tpa_point_name;
            fdInterface.description = filteredData.description;
            fdInterface.area_id = filteredData.area_id;
            fdInterface.nomination_point_id = filteredData.nomination_point_id;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('edit');
        // setFormData(fdInterface);
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.non_tpa_point_name = filteredData.non_tpa_point_name;
            fdInterface.description = filteredData.description;
            fdInterface.area_id = filteredData.area_id;
            fdInterface.nomination_point_id = filteredData.nomination_point_id;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('view');
        // setFormData(fdInterface);
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
            const response: any = await getService(`/master/account-manage/history?type=intraday-acc-imbalance-inventory&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);
            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "gas_day", title: "Gas Day" },
                // { key: "description", title: "Description" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);

                // History : Head Detail ปรับ Format วันที่เป็น DD/MM/YYYY https://app.clickup.com/t/86etfpwhf
                return {
                    title,
                    value: value ? toDayjs(value, 'YYYY-MM-DD').format("DD/MM/YYYY") : "",
                };
            });

            const normalized = fillMissingUpdateByAccount(valuesArray);

            setHeadData(result)
            // setHistoryData(valuesArray);
            setHistoryData(normalized);

            setTimeout(() => {
                setHistoryOpen(true);
            }, 300);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

    // ############### DELETE MODAL ###############
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteData, setDeleteData] = useState<any>();

    const openDeleteForm = async (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setDeleteData(filteredData);
        setDeleteOpen(true);
    }

    const handleDelete = async (data: any) => {
        const res_del: any = await deleteService(`/master/balancing/intraday-acc-imbalance-inventory?gas_day=${deleteData?.gas_day}`);
        if (res_del?.response?.data?.status === 400) {
            setFormOpen(false);
            setModalErrorMsg(res_del?.response?.data?.error);
            setModalErrorOpen(true)
        } else {
            setFormOpen(false);
            setModalSuccessMsg('Data has been deleted.')
            setModalSuccessOpen(true);
            setTimeout(() => {
                setDeleteOpen(false)
            }, 200);
        }

        await fetchData();
        if (resetForm) resetForm();
    }

    // ############### MODAL ALLOC AND BALANCE EXECUTE ###############
    const [mdExecuteOpen, setMdExecuteOpen] = useState<any>(false);
    const [modalExecuteSuccessOpen, setModalExecuteSuccessOpen] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);

    const handleExcute = async () => {
        setTimeout(() => {
            setMdExecuteOpen(true);
        }, 300);
    };

    const handleFormSubmitUpdate = async (data: any) => {
        // setExecuteLoading(true)

        // await fetchData();
        // setMdEditOpen(false);
        // setMdExecuteOpen(false);
        // if (resetForm) resetForm();
        // setModalSuccessOpen(true);

      
        // setTimeout(() => {
            // setExecuteLoading(false)
            setMdExecuteOpen(false)
            setModalExecuteSuccessOpen(true);
        // }, 500);

          try {
                postService('/master/allocation/execute-data', { menu: 'Acc. Imbalance Inventory Adjustment' });
            } catch (error) {
                // error alloc and bal
            }

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
        { key: 'gas_day', label: 'Gas Day', visible: true },
        // ...zoneMaster?.data?.map((zone: any) => ({
        //     key: zone.name.toLowerCase().replace(/[^a-z0-9]/g, "_"), // Convert to lowercase and replace symbols with _
        //     label: `${zone.name} (MMBTU)`,
        //     visible: true
        // })),
        { key: 'east', label: 'East (MMBTU)', visible: true },
        { key: 'west', label: 'West (MMBTU)', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        // ...zoneMaster?.data?.map((zone: any) => ({
        //     key: zone.name.toLowerCase().replace(/[^a-z0-9]/g, "_"), // Convert to lowercase and replace symbols with _
        //     label: `${zone.name} (MMBTU)`,
        //     visible: true
        // })),
        { key: 'east', label: 'EAST (MMBTU)', visible: true },
        { key: 'west', label: 'WEST (MMBTU)', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        // { key: 'create_by', label: 'Created by', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
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

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day From"}
                        placeHolder={"Select Gas Day From"}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <DatePickaSearch
                        key={"end" + key}
                        label={"Gas Day To"}
                        placeHolder={"Select Gas Day To"}
                        allowClear
                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
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
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
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
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="balancing/intraday-acc-imbalance-inventory-adjust"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                            />
                        </div>
                    </div>
                </div>

                <TableBalIntradayAccImbalanceInventoryAdjust
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
                    userPermission={userPermission}
                    dataCloseBal={closeBalanceData}
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
                            setFormData({})
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            <ModalDelete
                data={deleteData}
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                        }, 200);
                    }
                }}
                onSubmit={handleDelete}
                setResetForm={setResetForm}
            />

            <ModalComment
                data={dataReason}
                dataMain={dataReasonRow}
                setModalSuccessOpen={setModalSuccessOpen}
                open={mdReasonView}
                onClose={async () => {
                    await fetchData();
                    setMdReasonView(false);
                }}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Non TPA Point has been added."
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

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="intraday-acc-bal-inventory-adjust"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            {/* 1. กด execute */}
            <ModalExecute
                data={[]}
                dataCloseBal={closeBalanceData}
                isLoading={executeLoading}
                open={mdExecuteOpen}
                onClose={() => {
                    setMdExecuteOpen(false);
                    if (resetForm) resetForm();
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
            />

            {/* 2. แสดง */}
            <ModalComponent
                open={modalExecuteSuccessOpen}
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

        </div>
    );
};

export default ClientPage;