"use client";
import { useEffect, useRef, useState } from "react";
import { Tune } from "@mui/icons-material"
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, generateUserPermission } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, patchService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import ModalComment from "./form/modalComment";
import BtnAddNew from "@/components/other/btnAddNew";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import TableTariffCreditDebitNote from "./form/table";

dayjs.extend(isSameOrBefore);

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    // const { params: { lng } } = props;
    // const { t } = useTranslation(lng, "mainPage");

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
            //     const permission = findRoleConfigByMenuName('Credit/Debit Note', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName(`Credit/Debit Note`, userDT)
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

    // #region FIELD SEARCH
    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    // const [srchStartDate, setSrchStartDate] = useState<any>(null);
    // const [srchStartDate, setSrchStartDate] = useState<any>(toDayjs().toDate());
    const [srchStartDate, setSrchStartDate] = useState<any>(null);
    const [srchCndnId, setSrchCndnId] = useState('');
    const [srchCNDNType, setSrchCNDNType] = useState<any>('');
    const [srchTypeCharge, setSrchTypeCharge] = useState<any>('');

    const handleFieldSearch = async () => {
        let url_ = `/master/tariff/tariffCreditDebitNote/findAllTariffCreditDebitNote?offset=0&limit=${itemsPerPage}`

        if (srchShipper.length > 0) {
            url_ += `&shipper_id=[${srchShipper}]`
        }

        if (srchStartDate !== undefined && srchStartDate !== null) {
            url_ += `&month_year_charge=${dayjs(srchStartDate).format('YYYY-MM-DD')}`
        }

        if (srchCndnId) {
            url_ += `&cndn_id=${srchCndnId}`
        }

        if (srchCNDNType) {
            url_ += `&tariff_credit_debit_note_type_id=${srchCNDNType}`
        }

        if (srchTypeCharge) {
            url_ += `&tariff_type_charge_id=${srchTypeCharge}`
        }

        // MAIN DATA
        // tariff/tariffCreditDebitNote/findAllTariffCreditDebitNote?limit=100&offset=0
        const res_main_data = await getService(url_);

        // เติมของเข้า obj array
        const main_data_with_format = res_main_data?.data?.map((item: any) => ({
            ...item,
            month_year_charge_format: dayjs(item.month_year_charge).format("MMMM YYYY")
        }));

        setDataTableTotal(res_main_data?.total)
        // setDataTable(res_main_data?.data)
        // setFilteredDataTable(res_main_data?.data)
        setDataTable(main_data_with_format)
        setFilteredDataTable(main_data_with_format)

        setCurrentPage(1)
    };

    const handleReset = async () => {
        setSrchShipper([]);
        setSrchStartDate(null)
        setSrchCndnId('')
        setSrchTypeCharge('')
        setSrchCNDNType('')
        fetchData(0, 10);

        setKey((prevKey) => prevKey + 1);
    };

    // #region LIKE SEARCH
    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        const filtered = dataTable.filter(
            (item: any) => {
                return (
                    // item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.cndn_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    dayjs(item?.month_year_charge).format("MMMM YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tariff_type_charge?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tariff_credit_debit_note_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTableTotal, setDataTableTotal] = useState<any>(0);
    const [dataTable, setDataTable] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataCndnType, setDataCndnType] = useState<any>([]);
    const [dataTypeCharge, setDataTypeCharge] = useState<any>([]);

    // #region ON LOAD
    const fetchData = async (offset?: any, limit?: any) => {
        try {
            setIsLoading(false);

            // MAIN DATA
            // tariff/tariffCreditDebitNote/findAllTariffCreditDebitNote?limit=100&offset=0
            const res_main_data = await getService(`/master/tariff/tariffCreditDebitNote/findAllTariffCreditDebitNote?offset=${offset}&limit=${limit}`);

            // เติมของเข้า obj array
            const main_data_with_format = res_main_data?.data?.map((item: any) => ({
                ...item,
                month_year_charge_format: dayjs(item.month_year_charge).format("MMMM YYYY")
            }));

            setDataTableTotal(res_main_data?.total)
            // setDataTable(res_main_data?.data)
            // setFilteredDataTable(res_main_data?.data)
            setDataTable(main_data_with_format)
            setFilteredDataTable(main_data_with_format)

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const fetchMaster = async () => {
        // DATA TYPE Charge
        // tariff/tariffCreditDebitNote/typeCharge
        const res_type_charge = await getService(`/master/tariff/tariffCreditDebitNote/typeCharge`);
        setDataTypeCharge(res_type_charge)

        // DATA SHIPPER
        const res_shipper_name = await getService(`/master/tariff/tariffCreditDebitNote/selectShipper`);
        setDataShipper(res_shipper_name)

        // DATA CNDN TYPE
        // tariff/tariffCreditDebitNote/selectCNDNType
        const res_cndn_type = await getService(`/master/tariff/tariffCreditDebitNote/selectCNDNType`);
        setDataCndnType(res_cndn_type)
    }

    useEffect(() => {
        fetchData(0, 10);
    }, [resetForm]);

    useEffect(() => {
        fetchMaster();
        getPermission();
    }, [])

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    // const handleCloseModal = () => setModalSuccessOpen(false);
    const handleCloseModal = () => {
        // fetchData(0, 10);
        setModalSuccessOpen(false);
    }
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);


    const handleFormSubmit = async (data: any) => {

        switch (formMode) {
            case "create":

                const payload = {
                    ...data,
                    detail: (data.detail ?? []).map((item: any) => ({
                        ...item,
                        amount: String(item?.amount ?? ""),
                    })),
                };

                // Credit/Debit Note has been added.
                let res_create = await postService(`/master/tariff/tariffCreditDebitNote/create`, payload);
                const status = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if ([400, 500].includes(status)) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg ? errorMsg : "Something went wrong.");
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    await fetchData(0, 10);
                    setModalSuccessMsg('Credit/Debit Note has been added.')
                    setModalSuccessOpen(true);
                }

                break;
            case "edit":

                const payload_edit = {
                    // "shipper_id": data?.shipper_id,
                    // "month_year_charge": data?.month_year_charge, // YYYY-MM-01
                    "cndn_id": data?.cndn_id,
                    "filter_tariff_id": data?.filter_tariff_id,
                    // "tariff_credit_debit_note_type_id": data?.tariff_credit_debit_note_type_id, // 1 credit note | 2 debit note
                    // "tariff_type_charge_id": data?.tariff_type_charge_id,
                    "detail": data?.detail,
                    "comments": data?.comments
                }

                const payload_ = {
                    ...payload_edit,
                    detail: (payload_edit.detail ?? []).map((item: any) => ({
                        ...item,
                        amount: String(item?.amount ?? ""),
                    })),
                };

                let res_edit = await patchService(`/master/tariff/tariffCreditDebitNote/edit/${selectedId}`, payload_);
                const status_edit = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                const errorMsgPatch = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

                if ([400, 500].includes(status_edit)) {
                    setFormOpen(false);
                    // setModalErrorMsg(res_edit?.response?.data?.error ? res_edit?.response?.data?.error : "Something went wrong.");
                    setModalErrorMsg(errorMsgPatch || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    await fetchData(0, 10);
                    setModalSuccessMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }

                break;
        }

        // if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    // #region OPEN EDIT
    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    // #region OPEN VIEW
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
            const response: any = await getService(`/master/account-manage/history?type=tariff/tariffCreditDebitNote&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                { key: "shipper.name", title: "Shipper Name" },
                { key: "month_year_charge", title: "Month/Year" },
                { key: "tariff_credit_debit_note_type.name", title: "CNDN Type" },
                { key: "tariff_type_charge.name", title: "Type Charge" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                return {
                    title,
                    value: value || "",
                };
            });

            // ถ้า title เป็น Month/Year ให้ format value dayjs().format("MMMM YYYY")
            const formattedRes = result?.map((item) => {
                if (item.title === "Month/Year") {
                    return {
                        ...item,
                        value: dayjs(item.value).format("MMMM YYYY"), // 👉 Jan 2025
                    };
                }
                return item;
            });

            const normalized = fillMissingUpdateByAccount(valuesArray);

            setHeadData(formattedRes);
            // setHistoryData(valuesArray);
            setHistoryData(normalized);
            setHistoryOpen(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

    // #region OPEN COMMENT
    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {

        // setDataReason(data)
        setDataReason(data.reverse())
        setDataReasonRow(row)
        setMdReasonView(true)
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
            // setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable) // ที่ใช้ยังงี้เพราะของที่ได้มาจาก service มันทำ pagination อยู่แล้ว
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    useEffect(() => {
        let newOffset = (currentPage - 1) * itemsPerPage;
        fetchData(newOffset, itemsPerPage);
        setIsLoading(false)
    }, [currentPage, itemsPerPage]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'month_year', label: 'Month/Year', visible: true },
        { key: 'cndn_id', label: 'CNDN ID', visible: true },
        { key: 'type_charge', label: 'Type Charge', visible: true },
        { key: 'cndn_type', label: 'CNDN Type', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        // { key: 'shipper_name', label: 'Shipper Name', visible: true },
        // { key: 'month_year', label: 'Month/Year', visible: true },
        // { key: 'type_charge', label: 'Type Charge', visible: true },
        // { key: 'cndn_type', label: 'CNDN Type', visible: true },
        { key: 'cndn_id', label: 'CNDN ID', visible: true },
        { key: 'tariff_id', label: 'Tariff ID', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
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
                        id="searchShipper"
                        label="Shipper Name"
                        type="select-multi-checkbox"
                        value={srchShipper}
                        onChange={(e) => {
                            setSrchShipper(e.target.value)
                        }}
                        options={dataShipper
                            ?.filter((item: any) =>
                                userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true // ถ้าเป็น shipper เอาแค่ของตัวเอง
                            )
                            .map((item: any) => ({
                                value: item.id,
                                label: item.name,
                            }))
                        }
                    />

                    <MonthYearPickaSearch
                        key={"start" + key}
                        label={'Month/Year Charge'}
                        placeHolder={'Select Month/Year Charge'}
                        allowClear
                        customWidth={230}
                        onChange={(e: any) => {
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    <InputSearch
                        id="searchCndnId"
                        label="CNDN ID"
                        value={srchCndnId}
                        type="text"
                        onChange={(e) => setSrchCndnId(e.target.value)}
                        placeholder="Search CNDN ID"
                    />

                    <InputSearch
                        id="searchCndnType"
                        label="CNDN Type"
                        type="select"
                        value={srchCNDNType}
                        onChange={(e) => setSrchCNDNType(e.target.value)}
                        options={dataCndnType?.map((item: any) => ({
                            value: item.id,
                            label: item.name
                        }))}
                    />

                    <InputSearch
                        id="searchTypeCharge"
                        label="Type Charge"
                        type="select"
                        value={srchTypeCharge}
                        onChange={(e) => setSrchTypeCharge(e.target.value)}
                        options={dataTypeCharge?.map((item: any) => ({
                            value: item.id,
                            label: item.name
                        }))}
                        customWidth={245}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew
                            openCreateForm={openCreateForm}
                            textRender={"New"}
                            can_create={userPermission ? userPermission?.f_create : false}
                        />
                    </div>
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#1473A1', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="tariff/tariff-credit-debit-note"
                            // can_export={userPermission ? userPermission?.f_export : false}
                            can_export={true}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                            specificMenu={'tariff-credit-debit-note'}
                            specificData={
                                {
                                    // "shipper_id": srchShipper?.length > 0 ? srchShipper[0] : '', // [0] ทำไว้กันแตกก่อน
                                    "shipper_id": srchShipper?.length > 0 ? srchShipper : '', // [0] ทำไว้กันแตกก่อน
                                    // "shipper_id": '',
                                    "month_year_charge": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : '', // 2025-08-01
                                    "cndn_id": srchCndnId ? srchCndnId : '',
                                    "tariff_credit_debit_note_type_id": srchCNDNType ? srchCNDNType.toString() : '',
                                    "tariff_type_charge_id": srchTypeCharge ? srchTypeCharge.toString() : '',
                                    "offset": currentPage - 1,
                                    "limit": itemsPerPage
                                }
                            }
                        />
                    </div>
                </div>

                <TableTariffCreditDebitNote
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                    userDT={userDT}
                />
            </div>

            <PaginationComponent
                totalItems={dataTableTotal}
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
                dataCndnType={dataCndnType}
                dataTypeCharge={dataTypeCharge}
                isModalErrorOpen={isModalErrorOpen}
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
                userPermission={userPermission}
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
                tableType="tariff-credit-debit-note"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                dataShipper={dataShipper}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
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

        </div>
    );
};

export default ClientPage;