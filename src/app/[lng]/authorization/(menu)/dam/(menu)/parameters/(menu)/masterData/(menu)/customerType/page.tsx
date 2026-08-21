"use client";
import { useEffect, useMemo, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnReset from "@/components/other/btnReset";
import BtnSearch from "@/components/other/btnSearch";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { findRoleConfigByMenuName, formatDate, formatTime, generateUserPermission } from "@/utils/generalFormatter";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import AppTable from "@/components/table/AppTable";
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
            user_permission = user_permission ? JSON.parse(user_permission) : null;

            const permission = findRoleConfigByMenuName('Customer Type', userDT)
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
    const { entryExitMaster } = useFetchMasters();

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchEntryExit, setSrchEntryExit] = useState<any>([]);
    const [srchCustType, setSrchCustType] = useState('');

    const handleFieldSearch = () => {
        // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
        const result = dataTable.filter((item: any) => {
            return (
                // (srchEntryExit ? item?.id_name.toLowerCase().includes(srchEntryExit.toLowerCase()) : true) &&
                // (srchCustType ? item?.id == srchCustType : true) &&
                (srchCustType ? item?.name?.toLowerCase().includes(srchCustType.toLowerCase()) : true) &&
                // (srchEntryExit ? item?.entry_exit_id == srchEntryExit : true)
                (srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit_id?.toString()) : true) // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchCustType('')
        setSrchEntryExit([])
        setFilteredDataTable(dataTable);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                return (
                    item?.entry_exit?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
                    item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
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

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/asset/customer-type`);
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

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const fdInterface: any = {
        name: '',
        entry_exit_id: '',
    };

    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        // const newData = replaceEmptyStringsWithNull(data)
        switch (formMode) {
            case "create":
                const res = await postService('/master/asset/customer-type-create', data);
                const statusCode = res?.response?.data?.statusCode ?? res?.response?.data?.status ?? res?.status ?? res?.statusCode ?? res?.code ?? res?.response?.status;
                const errorMsg = res?.response?.data?.error ?? res?.data?.error ?? res?.response?.error ?? res?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    // setModalErrorMsg(res?.response?.data?.error);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                }

                break;
            case "edit":
                setFormOpen(false);
                setModalSuccessOpen(true);
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
            fdInterface.id = filteredData.id;
            fdInterface.name = filteredData.name;
            fdInterface.entry_exit_id = filteredData.entry_exit_id;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.name = filteredData.name;
            fdInterface.entry_exit_id = filteredData.entry_exit_id;
        }
        setFormMode('view');
        setFormData(fdInterface);
        setFormOpen(true);
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
        { key: 'entry_exit', label: 'Entry / Exit', visible: true },
        { key: 'cust_type', label: 'Customer Type', visible: true },
        // { key: 'start_date', label: 'Start Date', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
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
                accessorKey: "entry_exit",
                header: "Entry / Exit",
                enableSorting: true,
                accessorFn: (row: any) => row?.entry_exit?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-start items-center">
                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>
                                {row?.entry_exit?.name}
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "cust_type",
                header: "Customer Type",
                enableSorting: true,
                accessorFn: (row: any) => row?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.name ? row?.name : ''}</div>
                    )
                }
            },
            {
                accessorKey: "create_by",
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
        ]
        , []
    )

    return (
        <div className=" space-y-2">
            <div className="bo
            Xrder-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchEntryExit"
                        label="Entry/Exit"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchEntryExit}
                        onChange={(e) => setSrchEntryExit(e.target.value)}
                        options={entryExitMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    {/* <InputSearch
                        id="searchCustType"
                        label="Customer Type"
                        type="select"
                        value={srchCustType}
                        onChange={(e) => setSrchCustType(e.target.value)}
                        // options={dataTable?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.name
                        // }))}
                        options={dataTable?.filter((itemx: any) => srchEntryExit ? itemx?.entry_exit_id?.toString() == srchEntryExit : true).map((item: any) => ({ // v2.0.98 Filter Customer Type ไม่กรองให้ตาม Filter Entry/Exit https://app.clickup.com/t/86euzxxmx 
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    /> */}

                    {/* V.2.0.98 Filter Customer Type เปลี่ยนเป็น Search https://app.clickup.com/t/86euzxxmy */}
                    <InputSearch
                        id="searchCustTypeText"
                        label="Customer Type"
                        value={srchCustType}
                        onChange={(e) => setSrchCustType(e.target.value)}
                        placeholder="Search Customer Type"
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
                                path="dam/customer-type"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                            />
                        </div>
                    </div>
                </div>

                <TableCustomerType
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
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
                        path="dam/customer-type"
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

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description="Customer Type has been add."
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                entryExitMasterData={entryExitMaster?.data}
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

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
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


        </div>
    );
};

export default ClientPage;