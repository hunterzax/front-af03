"use client";
// import Link from "next/link";
import "@/app/globals.css";
import { useEffect, useMemo, useState } from "react";
import { InputSearch } from '@/components/other/SearchForm';
import { getService } from "@/utils/postService";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { findRoleConfigByMenuName, formatDate, generateUserPermission, matchTypeWithMenu, renameMethod, toDayjs } from "@/utils/generalFormatter";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import BtnExport from "@/components/other/btnExport";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, SortingState, VisibilityState } from "@tanstack/react-table";
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

            const permission = findRoleConfigByMenuName('Audit Log', userDT)
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
    const { auditLogModule } = useFetchMasters();
    // const dispatch = useAppDispatch();
    // const auditLogModule = useSelector((state: RootState) => state.auditlogmodule);

    // useEffect(() => {
    //     if (!auditLogModule?.data) {
    //         dispatch(fetchAuditLogModule());
    //     }
    // }, [dispatch, auditLogModule]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchLogId, setSrchLogId] = useState<any>('');
    // const [srchAuditLogModuel, setSrchAuditLogModule] = useState('');
    const [srchAuditLogModuel, setSrchAuditLogModule] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [querySearch, setQuerySearch] = useState<string>('');
    const [urlPath, setUrlPath] = useState<string>('');

    const handleFieldSearch = () => {
        // const localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");

        // const result = dataTable?.filter((item: any) => {
        //     const createDate = toDayjs(item?.create_date).format("YYYY-MM-DD");

        //     const reqUser = JSON?.parse(item?.reqUser)
        //     const firstName = reqUser?.first_name
        //     const last_name = reqUser?.last_name
        //     const result = `${firstName ? `${firstName} ` : ''}${last_name}`

        //     return (
        //         // (srchLogId ? item?.id == srchLogId : true) &&
        //         (srchLogId ? result.toLowerCase().includes(srchLogId.toLowerCase()) : true) &&
        //         // (srchAuditLogModuel ? item?.module?.toLowerCase().includes(srchAuditLogModuel.toLowerCase()) : true) &&
        //         (srchAuditLogModuel?.length > 0 ? srchAuditLogModuel.includes(item?.module?.toLowerCase()) : true) && // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
        //         (srchStartDate ? localDate == createDate : true)
        //     );
        // });
        // // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        // setFilteredDataTable(result);

        const actionDate = srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : undefined;
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        fetchData({name: srchLogId, moduleList: srchAuditLogModuel?.length > 0 ? srchAuditLogModuel.join(',') : undefined, actionDate: actionDate});
    };

    const handleReset = () => {
        setSrchLogId('')
        // setSrchAuditLogModule('')
        setSrchAuditLogModule([])
        setSrchStartDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    const handleQueryOnChange = (query: string) => {
        setQuerySearch(query);
    };

    const handleQueryKeyPress = (query: string) => {
        setQuerySearch(query);
        const actionDate = srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : undefined;
        fetchData({name: srchLogId, moduleList: srchAuditLogModuel?.length > 0 ? srchAuditLogModuel.join(',') : undefined, actionDate: actionDate, query: query});
    };

    // ############### LIKE SEARCH ###############
    // const handleSearch = (query: string) => {

    //     const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
    //     const filtered = dataTable?.filter(
    //         (item: any) => {
    //             let name_search = JSON.parse(item.reqUser).first_name + ' ' + JSON.parse(item.reqUser).last_name
    //             let action_type = renameMethod(item?.method, item?.type)
    //             let menu_name = matchTypeWithMenu(item?.type)
    //             // let searchDescItem = action_type + menu_name
    //             let searchDescItem = (action_type + menu_name).replace(/\s+/g, '').toLowerCase().trim();

    //             return (
    //                 item?.id?.toString().includes(query) ||
    //                 item?.module?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 // item?.type?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 // item?.method?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 // item?.method + item?.type?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 searchDescItem.includes(queryLower) ||
    //                 name_search.replace(/\s+/g, '').replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
    //             )
    //         }
    //     );


    //     setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    //     setFilteredDataTable(filtered);
    // };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    // ############### PAGINATION (SERVER SIDE) ###############
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // ############### SORTING (SERVER SIDE) ###############
    const [sorting, setSorting] = useState<SortingState>([]);

    const fetchData = async ({offset, limit, name, moduleList, actionDate, query}: {offset?: number, limit?: number, name?: string, moduleList?: string, actionDate?: string, query?: string}) => {
        try {
            setIsLoading(false);
            const lim = typeof limit === 'number' ? limit : pagination.pageSize;
            const off = typeof offset === 'number' ? offset : (pagination.pageIndex * lim);

            let path = `audit-log?limit=${lim}&offset=${off}`;
            if(name) {
                path += `&name=${name}`;
            }
            if(moduleList) {
                path += `&module=${moduleList}`;
            }
            if(actionDate) {
                path += `&date=${actionDate}`;
            }
            if(query) {
                path += `&q=${query}`;
            }
            else if(querySearch) {
                path += `&q=${querySearch}`;
            }
            if (sorting?.length > 0) {
                const s = sorting[0];
                path += `&orderAtColumn=${encodeURIComponent(String(s.id))}&orderBy=${s.desc ? 'desc' : 'asc'}`;
            }
            setUrlPath(path);

            const response: any = await getService(`/master/parameter/${path}`);

            // รองรับทั้งกรณี API ส่งเป็น array (เดิม) และกรณีส่งเป็น { total, data }
            if (Array.isArray(response)) {
                setTotalItems(response.length);
                setData(response);
                setFilteredDataTable(response);
            } else {
                const rows = response?.data ?? [];
                const total = typeof response?.total === 'number' ? response.total : Array.isArray(rows) ? rows.length : 0;
                setTotalItems(total);
                setData(rows);
                setFilteredDataTable(rows);
            }
            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        getPermission();
    }, [resetForm]);

    useEffect(() => {
        const off = pagination.pageIndex * pagination.pageSize;
        const actionDate = srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : undefined;
        fetchData({
            offset: off,
            limit: pagination.pageSize,
            name: srchLogId || undefined,
            moduleList: srchAuditLogModuel?.length > 0 ? srchAuditLogModuel.join(',') : undefined,
            actionDate,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.pageIndex, pagination.pageSize, sorting]);

    // const paginatedData = Array.isArray(filteredDataTable)
    //     ? filteredDataTable.slice(
    //         (currentPage - 1) * itemsPerPage,
    //         currentPage * itemsPerPage
    //     )
    //     : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'id', label: 'ID', visible: true },
        { key: 'module', label: 'Module', visible: true },
        { key: 'create_date', label: 'Action Date', visible: true },
        { key: 'name', label: 'First Name / Last Name', visible: true },
        { key: 'desc', label: 'Description', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        // { key: 'create_by', label: 'Created by', visible: true },
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
                accessorKey: "id",
                header: "ID",
                enableSorting: true,
                accessorFn: (row: any) => row?.id || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.id}</div>)
                }
            },
            {
                accessorKey: "module",
                header: "Module",
                enableSorting: true,
                accessorFn: (row: any) => row?.module || '',
                // cell: (info) => {
                //     const row: any = info?.row?.original
                //     return (<div>{row?.module}</div>)
                // }
                cell: (info) => {
                    const row: any = info?.row?.original;
                    let moduleValue = row?.module;

                    // v2.0.63 Wording Nomination ไม่เหมือนกัน https://app.clickup.com/t/86eujxj4r
                    if (moduleValue === "NOMINATION") {
                        moduleValue =
                            moduleValue.charAt(0).toUpperCase() + moduleValue.slice(1).toLowerCase();
                    }

                    return <div>{moduleValue}</div>;
                }

            },
            {
                accessorKey: "create_date",
                header: "Action Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDate(row?.create_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.create_date ? formatDate(row?.create_date) : ''}</div>)
                }
            },
            {
                accessorKey: "name",
                header: "First Name / Last Name",
                enableSorting: true,
                accessorFn: (row: any) => {
                    const reqUser = row?.create_by_account || null
                    const firstName = reqUser?.first_name
                    const last_name = reqUser?.last_name
                    const result = `${firstName ? `${firstName} ` : ''}${last_name}`

                    return result || ''
                    // return JSON?.parse(row?.reqUser)?.first_name || JSON?.parse(row?.reqUser)?.last_name || JSON?.parse(row?.reqUser)?.first_name && JSON?.parse(row?.reqUser)?.last_name || (JSON?.parse(row?.reqUser)?.first_name + " " + JSON?.parse(row?.reqUser)?.last_name) || ''
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.create_by_account ? row?.create_by_account.first_name + ' ' + row?.create_by_account.last_name : ''}</div>)
                    // return (<div>{row?.reqUser ? JSON.parse(row?.reqUser).first_name + ' ' + JSON.parse(row?.reqUser).last_name : ''}</div>)
                }
            },
            {
                accessorKey: "desc",
                header: "Description",
                enableSorting: true,
                accessorFn: (row: any) => {
                    console.log('row : ', row);
                    const result = `${renameMethod(row?.method, row?.type)} ${matchTypeWithMenu(row?.type)}}`
                    return result || ''
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    // return (<div className="capitalize">{renameMethod(row?.method, row?.type)} {matchTypeWithMenu(row?.type)}</div>)
                    return (<div className="capitalize">{renameMethod(row?.method, row?.type)} / Menu {matchTypeWithMenu(row?.type)}</div>) // v2.0.98-test ปรับการแสดงผลของ description ให้เข้าใจง่าย https://app.clickup.com/t/86euzxxet
                }
            },
        ], []
    )

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* <InputSearch
                        id="searchId"
                        label="ID"
                        value={srchLogId}
                        onChange={(e) => setSrchLogId(e.target.value)}
                        placeholder="Enter ID"
                    /> */}

                    {/* v1.0.90 Filter ID อยากเปลี่ยนเป็น First/Last Name https://app.clickup.com/t/86ernzz0k */}
                    <InputSearch
                        id="searchId"
                        label="First/Last Name"
                        value={srchLogId}
                        onChange={(e) => setSrchLogId(e.target.value)}
                        placeholder="Enter First/Last Name"
                    />

                    <InputSearch
                        id="searchModule"
                        label="Module"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchAuditLogModuel}
                        onChange={(e) => setSrchAuditLogModule(e.target.value)}
                        options={(Array.isArray(auditLogModule?.data) ? auditLogModule.data : []).map((item: any) => ({
                            // value: item?.id?.toString(),
                            // value: item.name,
                            value: item.name.toLowerCase(),
                            label: item.name
                        }))}
                    />

                    <DatePickaSearch
                        key={"start" + key}
                        label="Action Date"
                        placeHolder="Select Action Date"
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
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
                                path="dam/audit-log"
                                // can_export={userPermission ? userPermission?.f_export : false}
                                can_export={userPermission ? userPermission?.f_view : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                            />
                        </div>
                    </div>
                </div>
                <TableAuditLog
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
                        path={`dam/${urlPath}`}
                        can_export={userPermission ? userPermission?.b_manage : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
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
                pagination={pagination}
                setPagination={setPagination}
                manualPagination={true}
                totalItems={totalItems}
                sorting={sorting}
                setSorting={(next) => {
                    setSorting(next);
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                }}
                onQueryChange={handleQueryOnChange}
                onQueryKeyDown={handleQueryKeyPress}
                onQueryBlur={handleQueryKeyPress}
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
