"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useState } from "react";
import { getService } from "@/utils/postService";
import { findRoleConfigByMenuName, formatDate, formatDateK, formatDateNoTime, formatDateTimeSec, formatSearchDate, generateUserPermission, toDayjs } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { InputSearch } from "@/components/other/SearchForm";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnExport from "@/components/other/btnExport";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import ModalComponent from "@/components/other/ResponseModal";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import getUserValue from "@/utils/getuserValue";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";

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

            const permission = findRoleConfigByMenuName('Mode/Zone Baseline Inventory', userDT)
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
    const { zoneMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);

    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, zoneMaster, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchMode, setSrchMode] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        const result = dataTable.filter((item: any) => {
            return (
                // (srchMode ? item?.mode?.id == srchMode : true) &&
                // (srchMode ? item?.mode.replace(/\s+/g, '').toLowerCase().trim().includes(srchMode.toLowerCase()) : true) &&
                // (srchZone ? item?.zone?.name == srchZone : true) &&
                // (srchMode ? item?.mode?.mode == srchMode : true) &&
                (srchZone?.length > 0 ? srchZone.includes(item?.zone?.name) : true) &&
                (srchMode?.length > 0 ? srchMode.includes(item?.mode?.mode) : true) &&
                (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchMode([])
        setSrchZone([])
        setSrchStartDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) =>
                item?.mode?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                item?.zone?.name?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
                item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) &&
                formatDate(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);
    const [modeMaster, setModeMaster] = useState<any>([]);

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/parameter/mode-zone-base-inventory`);

            setData(response);
            setFilteredDataTable(response);

            // DATA ZONE
            const data_zone = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneMasterZ(data_zone);

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
    // const paginatedData = Array.isArray(filteredDataTable)
    //     ? filteredDataTable.slice(
    //         (currentPage - 1) * itemsPerPage,
    //         currentPage * itemsPerPage
    //     )
    //     : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'mode', label: 'Mode', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
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
                accessorKey: "zone",
                header: "Zone",
                enableSorting: true,
                accessorFn: (row: any) => row?.zone?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.zone?.name ? row?.zone?.name : ''}</div>
                    )
                }
            },
            {
                accessorKey: "mode",
                header: "Mode",
                enableSorting: true,
                accessorFn: (row: any) => row?.mode?.mode || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.mode?.mode ? row?.mode?.mode : ''}</div>
                    )
                }
            },
            {
                accessorKey: "start_date",
                header: "Start Date",
                enableSorting: true,
                accessorFn: (row: any) => row?.start_date ? toDayjs(row.start_date).valueOf() : null,
                sortUndefined: 1, // ค่าว่างไปท้าย
                cell: (info) => {
                    const row: any = info?.row?.original;
                    return <div className="text-[#464255]">{row?.start_date ? formatDateK(row?.start_date) : ""}</div>;
                },
            },
            // {
            //     accessorKey: "start_date",
            //     header: "Start Date",
            //     enableSorting: true,
            //     // accessorFn: (row: any) => formatDateNoTime(row?.start_date) || '',
            //     accessorFn: (row: any) => row?.start_date ? dayjs(row.start_date).valueOf() : null,

            //     sortingFn: myCustomSortingByDateFn,
            //     // sortingFn: 'datetime', // recommended for date columns 
            //     // sortUndefined: -1,
            //     sortUndefined: 1,
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (
            //             // <div className={`text-[#464255]`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>
            //             <div className={`text-[#464255]`}>{row?.start_date ? formatDateK(row?.start_date) : ''}</div>
            //         )
            //     }
            // },
            {
                accessorKey: "create_by",
                header: "Created by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.create_date ? formatDateTimeSec(row?.create_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.create_date ? formatDateTimeSec(row?.create_date) : ''}</div>
                        </div>
                    )
                }
            },
        ], [])

    useEffect(() => {
        setModeMaster(Array.from(
            new Map(
                dataTable
                    // ?.filter((item: any) => srchZone ? item.zone.name === srchZone : true)
                    ?.filter((item: any) => srchZone?.length > 0 ? srchZone.includes(item?.zone?.name) : true)
                    .map((item: any) => [item?.mode?.mode, {
                        value: item?.mode?.mode,
                        label: item?.mode?.mode
                    }])
            ).values()))
    }, [dataTable, srchZone])

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchZone"
                        label="Zone"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchZone}
                        onChange={(e) => {
                            setSrchZone(e.target.value)
                            setSrchMode([])
                        }}
                        // options={zoneMaster?.data?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.name
                        // }))}
                        options={dataZoneMasterZ?.filter((itemx: any) => itemx.zone_name !== "EAST-WEST").map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <InputSearch
                        id="searchMode"
                        label="Mode"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchMode}
                        onChange={(e) => setSrchMode(e.target.value)}
                        // options={dataTable?.map((item: any) => ({
                        //     value: item?.mode?.id.toString(),
                        //     label: item?.mode?.mode
                        // }))}

                        // Filter Mode ยังไม่กรองตาม Zone https://app.clickup.com/t/86eu78f2c
                        // options={dataTable?.filter((item: any) => srchZone ? item.zone.name == srchZone : true).map((item: any) => ({
                        //     // value: item?.mode?.id.toString(),
                        //     value: item?.mode?.mode,
                        //     label: item?.mode?.mode
                        // }))}
                        options={modeMaster}
                    />

                    <DatePickaSearch
                        key={"start" + key}
                        label="Start Date "
                        placeHolder="Select Start Date "
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                {/* <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} /> */}
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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/mode-base-zone-inventory" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>
                <TableConfigModeZone
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    // tableData={filteredDataTable}
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
                        path="dam/mode-base-zone-inventory"
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
                description="Success."
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

            {/* <ModalComponent
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
            /> */}

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