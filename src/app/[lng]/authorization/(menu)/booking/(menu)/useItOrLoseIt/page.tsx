"use client";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import { findRoleConfigByMenuName, formatNumberThreeDecimal, generateUserPermission } from "@/utils/generalFormatter";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { InputSearch } from "@/components/other/SearchForm";
import PaginationComponent from "@/components/other/globalPagination";
import ModalPathMgnHistory from "./form/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import TableUseItOrLoseIt from "./form/table";
import { useFetchMasters } from "@/hook/fetchMaster";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchSystemParamMaster } from "@/utils/store/slices/systemParamSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import { decryptData } from "@/utils/encryptionData";
import ColumnVisibilityPopoverMT from "@/components/other/popOverfor_mt_table";
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
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            console.log('***');
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Use it or Lose it', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Use it or Lose it', userDT)
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
    // const { termTypeMaster } = useFetchMasters();
    const { shipperGroupData, zoneMaster, areaMaster, sysParamMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchSystemParamMaster());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, zoneMaster, areaMaster, sysParamMaster, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchGroupName, setSrchGroupName] = useState('');
    const [srchShipper, setSrchShipper] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchQuery, setSrchQuery] = useState('');
    const [key, setKey] = useState(0);

    const handleFieldSearch = async () => {
        console.log('1');
        setIsLoading(true)

        const current_month = new Date();
        const formattedMonth = `${String((srchStartDate || current_month).getMonth() + 1).padStart(2, '0')}/${(srchStartDate || current_month).getFullYear()}`;
        let new_data: any = []
        let result = [];

        let url = `/master/use-it-or-lose-it?startDate=${formattedMonth}`
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            url += `&shipper=${userDT?.account_manage?.[0]?.group?.id}`
        }
        else
            if (srchShipper) {
                url += `&shipper=${srchShipper}`
                // const shipperName = shipperGroupData?.data?.find((item: any) => item.id == srchShipper)?.id_name
                // if(shipperName){
                //     url += `&shipper=${srchShipper}`
                // }
            }
        const response: any = await getService(url);
        if (response?.response?.data?.status !== 400) {
            new_data = response?.flatMap((item: any) =>
                item.data.map((dataItem: any) => ({
                    ...item,
                    data: [dataItem],
                }))
            );
        }

        // If a shipper is selected, filter the data
        if (srchShipper) {
            result = new_data.filter((item: any) => item?.group?.id == srchShipper);
        } else {
            result = new_data;
        }
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setData(result);
        setFilteredDataTable(result);
        setIsUpdateMutableDataTable(true);

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchGroupName('');
        setSrchShipper('');

        fetchData(); // กด reset แล้ว fetch ใหม่ซะเลย
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        setSrchQuery(query)
        const lowerCaseQuery = query.toLowerCase();


        const filtered = dataTable?.filter((item: any) => {
            // Check if the main item properties match the query
            const mainItemMatches =
                item?.contract_code?.toString().replace(/\s+/g, '').toLowerCase().includes(lowerCaseQuery) ||
                item?.group?.name?.toLowerCase().trim().replace(/\s+/g, '').includes(lowerCaseQuery)

            // Check if any release_summary_detail property matches the query
            const releaseDetailMatches =
                item?.data?.some((detail: any) =>
                    detail?.entryData?.area_text?.toLowerCase().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    detail?.entryData?.zone_text?.toLowerCase().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    detail?.entryData?.contracted_mmbtu_d?.toString().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    detail?.entryData?.contracted_mmscfd?.toString().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    Object.values(detail?.entryData?.valueBefor12Month || {}).some(({ value }: any) => String(value || '').trim().replace(/\s+/g, '').includes(lowerCaseQuery)) ||
                    Object.values(detail?.entryData?.valueBefor12Month || {}).some(({ value }: any) => formatNumberThreeDecimal(value).trim().replace(/\s+/g, '').includes(lowerCaseQuery)) ||

                    detail?.exitData?.area_text?.toLowerCase().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    detail?.exitData?.zone_text?.toLowerCase().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    detail?.exitData?.contracted_mmbtu_d?.toString().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    detail?.exitData?.contracted_mmscfd?.toString().trim().replace(/\s+/g, '').includes(lowerCaseQuery) ||
                    Object.values(detail?.exitData?.valueBefor12Month || {}).some(({ value }: any) => String(value || '').trim().replace(/\s+/g, '').includes(lowerCaseQuery)) ||
                    Object.values(detail?.exitData?.valueBefor12Month || {}).some(({ value }: any) => formatNumberThreeDecimal(value).trim().replace(/\s+/g, '').includes(lowerCaseQuery))
                );

            // Include the item if either the main item or any release detail matches
            return mainItemMatches || releaseDetailMatches;
        }) || [];

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
        handleUpdaleTable(filtered)
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataPathGroup, setDataPathGroup] = useState<any>([]);
    const [latestStartDate, setLatestStartDate] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // const [resetForm, setResetForm] = useState<() => void | null>();
    const [resetForm, setResetForm] = useState<(() => void) | null>(null);
    const hasFetchedRef = useRef(false);

    const [tk, settk] = useState<boolean>(false);

    const [combinedSortKey, setCombinedSortKey] = useState<{
        original: string;
        formatted: string;
    }[]>([]);
    const [isUpdateMutableDataTable, setIsUpdateMutableDataTable] = useState<boolean>(false);

    const fetchData = async () => {
        let current_month = new Date();
        let formattedMonth = `${String(current_month.getMonth() + 1).padStart(2, '0')}/${current_month.getFullYear()}`;
        console.log('2');
        try {
            setIsLoading(true);

            let url = `/master/use-it-or-lose-it?startDate=${formattedMonth}`
            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {

                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
                url += `&shipper=${userDT?.account_manage?.[0]?.group?.id}`
            }
            else if (srchShipper) {
                url += `&shipper=${srchShipper}`
            }

            const response: any = await getService(url);

            if (response?.response?.data?.status === 400) {
                // setModalErrorMsg(response?.response?.data?.error);
                // setModalErrorOpen(true)
                setIsLoading(true); // ใส่ไว้ชั่วคราว อย่าลืมเปิด setModalErrorMsg ข้างบนนะ
            } else {
                // Transforming master_data into new_data
                const new_data = response?.flatMap((item: any) => {
                    return item.data.map((dataItem: any) => ({
                        ...item,
                        data: [dataItem], // Wrap individual data item in an array
                    }));
                });
                setData(new_data);
                setFilteredDataTable(new_data);
                setIsUpdateMutableDataTable(true)
            }

            // const new_data = response.flatMap((item: any) => {
            //     return item.data.map((dataItem: any) => ({
            //         ...item,
            //         data: [dataItem], // Wrap individual data item in an array
            //     }));
            // });
            // setData(new_data);
            // setFilteredDataTable(new_data);
            // setIsLoading(true);

            settk(!tk);

        } catch (err) {
            // setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // useEffect(() => {
    //     // fetchData();
    //     // getPermission();

    // }, [resetForm]); // ตอนเริ่มมันทำงาน 2 รอบ


    useEffect(() => {
        if (hasFetchedRef.current) return;

        hasFetchedRef.current = true;
        console.log('- -');

        fetchData();
        getPermission();
    }, []);

    useEffect(() => {
        if (isUpdateMutableDataTable) {
            setIsUpdateMutableDataTable(false)
            handleSearch(srchQuery)
        }
    }, [isUpdateMutableDataTable])

    const handleUpdaleTable = (newDataTable: any) => {
        if (newDataTable) {

            const sortedKeys = newDataTable?.[0]?.data?.[0]?.entryData?.valueBefor12Month ? Object.keys(newDataTable[0].data[0].entryData.valueBefor12Month).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) : [];
            const newCombinedSortKey = sortedKeys.map((date) => {
                const [day, month, year] = date.split("/"); // Split the date string
                const formattedDate = new Date(`${year}-${month}-${day}`); // Create a Date object
                const formatted = formattedDate.toLocaleString("en-US", { month: "short", year: "numeric" }); // Format as "MMM YYYY"
                return {
                    original: date,
                    formatted, // Add formatted value
                };
            });
            // Add "Average" to the end
            newCombinedSortKey.push({ original: "Average", formatted: "Average" });
            setCombinedSortKey(newCombinedSortKey)
            setIsLoading(false);
        }
    }

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [openView, setOpenView] = useState(false);
    const [dataView, setDataView] = useState<any>();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'release'>('create');

    const fdInterface: any = {
        name: '',
        ref: '',
        start_date: '',
        path_management_config: {}
    };
    const [formData, setFormData] = useState(fdInterface);
    const [formDataInfo, setFormDataInfo] = useState<any>([]);

    const formatDateRange = (dateRange: any) => {
        // Split the range into start and end dates
        const dateRangeSplit = dateRange.split(" - ")
        const [start_date, end_date] = dateRangeSplit.map((date: any, index: any) => {
            // Parse the date string
            let parsedDate: Date | undefined = undefined;
            if (date.length < 3 && index + 1 < dateRangeSplit.length) {
                const endDate = new Date(dateRangeSplit[index + 1]);
                let startDay = 1
                try {
                    startDay = Number.parseInt(date)
                    if (Number.isNaN(startDay)) {
                        startDay = 1
                    }
                } catch (error) {
                    startDay = 1
                }
                parsedDate = new Date(endDate.getFullYear(), endDate.getMonth(), startDay)
            }
            else {
                parsedDate = new Date(date);
            }
            if (parsedDate) {
                // Format as DD/MM/YYYY
                const day = String(parsedDate.getDate()).padStart(2, "0");
                const month = String(parsedDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based
                const year = parsedDate.getFullYear();
                return `${day}/${month}/${year}`;
            }
            else {
                return undefined
            }
        });

        return { start_date, end_date };
    }

    const handleFormSubmit = async (data: any, groupData?: any) => {

        const dataPost: any = {
            contract_code_id: groupData?.contract_code_id || null,
            group_id: groupData?.group?.id || null,
            data: [], // Will populate this array
            useData: [
                // {
                //     booking_row_json_id: groupData?.data?.[0]?.pathMatch?.booking_version_id,
                //     temp_contract_point: groupData?.data?.[0]?.pathMatch?.contract_point,
                //     temp_zone: groupData?.data?.[0]?.pathMatch?.zone_text,
                //     temp_area: groupData?.data?.[0]?.pathMatch?.area_text,
                //     temp_start_date: null,
                //     temp_end_date: null,
                //     total_contracted_mmbtu_d: total_mmbtud,
                //     total_release_mmbtu_d: total_mmbtud,
                //     total_contracted_mmscfd: null,
                //     total_release_mmscfd: null,
                //     entry_exit_id: groupData?.data?.[0]?.pathMatch?.entry_exit_id,
                //     pathMatch: groupData?.data?.[0]?.pathMatch,
                //     path: groupData?.data?.[0]?.path,
                // }
            ]
        };

        for (const key in data) {
            if (!data.hasOwnProperty(key) || typeof data[key] !== "object" || !data[key].releaseValue || data[key].releaseValue == 0) continue;

            const block = data[key];
            const { start_date, end_date } = formatDateRange(block.dateRange);

            block.entryExitData.forEach((entryExit: any) => {
                const contractedMmbtud = entryExit.entry_exit_id == 2 ? block.exitValue : block.entryValue
                const contractedMmscfd = entryExit.entry_exit_id == 2 ? block.exitValueMmscfd : block.entryValueMmscfd
                dataPost.data.push({
                    id: entryExit.id,
                    start_date,
                    end_date,
                    total_contracted_mmbtu_d: contractedMmbtud,
                    total_release_mmbtu_d: block.releaseValue,
                    total_contracted_mmscfd: contractedMmscfd,
                    total_release_mmscfd: entryExit.entry_exit_id == 2 ? null : block.releaseValueMmscfd,
                    entry_exit_id: entryExit.entry_exit_id,
                    contract_point: entryExit.contract_point,
                    zone_text: entryExit.zone_text,
                    area_text: entryExit.area_text
                });
                dataPost.useData.push({
                    booking_row_json_id: groupData?.data?.[0]?.pathMatch?.booking_version_id ?? entryExit.id,
                    temp_contract_point: entryExit.contract_point,
                    temp_zone: entryExit.zone_text,
                    temp_area: entryExit.area_text,
                    temp_start_date: start_date,
                    temp_end_date: end_date,
                    total_contracted_mmbtu_d: contractedMmbtud,
                    total_release_mmbtu_d: block.releaseValue,
                    total_contracted_mmscfd: contractedMmscfd,
                    total_release_mmscfd: entryExit.entry_exit_id == 2 ? null : block.releaseValueMmscfd,
                    entry_exit_id: entryExit.entry_exit_id,
                    pathMatch: groupData?.data?.[0]?.pathMatch,
                    path: groupData?.data?.[0]?.path,
                });
            });
        }

        switch (formMode) {
            case "release":
                setIsLoading(true)
                console.log('3');
                let res_create = await postService('/master/use-it-or-lose-it/release', dataPost);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                setIsLoading(false)
                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    // setModalErrorMsg(res_create?.response?.data?.error);
                    setModalErrorMsg(errorMsg || '');
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

    // const openCreateForm = () => {
    //     setFormMode('create');
    //     // ส่ง dataPathGroup ไปหน้า create
    //     setFormData(dataPathGroup)
    //     // setFormData(fdInterface);
    //     setFormOpen(true);
    // };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.name = '';
            fdInterface.version = filteredData.version;
            fdInterface.path_management_config = filteredData.path_management_config;
            fdInterface.start_date = new Date(filteredData.start_date);
            // fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormDataInfo(fdInterface);
        setFormMode('edit');
        setFormData(dataPathGroup);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {

        // หาจาก contract_code, area entry, area exit
        // const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('release');
        setFormData(id);
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
    // const [headData, setHeadData] = useState<any>();

    const openHistoryForm = async (id: any) => {
        try {
            const response: any = await getService(`/master/path-management/path-management-log/${id}`);

            // const valuesArray = response.map((item: any) => item.value);
            // let mappings = [
            //     { key: "name", title: "Email Group Name" },
            // ];
            // let result = mappings.map(({ key, title }) => {
            //     const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
            //     return {
            //         title,
            //         value: value || "",
            //     };
            // });
            // setHeadData(result);

            setHistoryData(response);
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

    // ############### COLUMN SHOW/HIDE ###############
    const defaultColumns: any = [
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'entry_exit', label: 'Entry / Exit', visible: true },
        { key: 'used_cap', label: 'Used Cap (%)', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const [initialColumns, setInitialColumns] = useState<any[]>(defaultColumns);

    const getInitialColumns = (tabIndex?: number) => {
        let columns = [...defaultColumns]
        let dateCcolumns: any[] = []
        combinedSortKey?.forEach((year) => {
            dateCcolumns.push({
                key: year.formatted, // Use the 'original' key for column key
                label: year.formatted, // Use the 'formatted' key for column label
                visible: true, // Set visibility as required
                parent_id: 'used_cap'
            });
        });
        columns.splice(5, 0, ...dateCcolumns)

        return columns;
    };

    useEffect(() => {
        const newInitialColumns = getInitialColumns()
        setInitialColumns(newInitialColumns)
        setColumnVisibility(Object.fromEntries(newInitialColumns.map((column: any) => [column.key, column.visible])))
        setColumnVisibilityNew(Object.fromEntries(newInitialColumns.map((column: any) => [column.key, column.visible])))
    }, [combinedSortKey])

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const [columnVisibilityNew, setColumnVisibilityNew] = useState<any>(
        Object.fromEntries(
            initialColumns.map((column: any) => [column.key, column.visible])
        )
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

    const handleColumnToggleNew = (columnKey: string) => {
        const dataFilter = initialColumns;
        const childColumns = dataFilter.filter((col: any) => col.parent_id === columnKey);
        const currentColumn = dataFilter.find((col: any) => col.key === columnKey);

        // Toggle child columns if any exist
        if (childColumns.length > 0) {
            setColumnVisibilityNew((prev: any) => {
                const updatedVisibility = { ...prev };
                childColumns.forEach((col: any) => {
                    updatedVisibility[col.key] = !prev[columnKey];
                });
                return updatedVisibility;
            });
        }

        // Check if this column has a parent
        if (currentColumn?.parent_id) {
            const parentKey = currentColumn.parent_id;
            const isParentVisible = columnVisibilityNew[parentKey];
            const isCurrentVisible = columnVisibilityNew[columnKey];

            const siblings = dataFilter.filter((col: any) => col.parent_id === parentKey);

            // Count how many siblings are checked
            const checkedSiblingsCount = siblings.filter((col: any) => columnVisibilityNew[col.key]).length;

            setColumnVisibilityNew((prev: any) => ({
                ...prev,
                [parentKey]: checkedSiblingsCount === 1 && isCurrentVisible ? false : prev[parentKey],
            }));
        }

        // Toggle the clicked column itself
        setColumnVisibilityNew((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));

        settk((prev: any) => !prev);
    };

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* <DatePickaSearch
                        key={"start" + key}
                        label="Start Month"
                        placeHolder="Select Start Month"
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    /> */}

                    <MonthYearPickaSearch
                        key={"start" + key}
                        label={"Check Month"}
                        placeHolder={"Select Check Month"}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    // onChange={(e: any) => {
                    //     setSrchEndDate(e ? e : null);
                    //     // Calculate maxDate as e + 24 months
                    //     const maxDate = e ? addMonths(new Date(e), 24) : null;
                    //     setMaxDate(maxDate);
                    // }}
                    />

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        type="select"
                        value={srchShipper}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        onChange={(e) => setSrchShipper(e.target.value)}
                        // options={shipperGroupData?.data?.map((item: any) => ({
                        //     value: item.id,
                        //     label: item.name
                        // }))}
                        options={shipperGroupData?.data
                            ?.filter((item: any) =>
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                value: item.id,
                                label: item.name,
                            }))
                        }
                    />
                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                {/* <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New Version"} />
                    </div>
                </aside> */}
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
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
                            {/* <BtnGeneral bgcolor={"#24AB6A"} modeIcon={'export'} textRender={"Export"} generalFunc={() => exportToExcel(paginatedData, "use_it_or_lose_it")} can_export={userPermission ? userPermission?.f_export : false} /> */}
                            <BtnExport
                                specificData={{
                                    shipper: userDT?.account_manage?.[0]?.user_type_id == 3 ? userDT?.account_manage?.[0]?.group?.id : srchShipper ? srchShipper : '',
                                }}
                                textRender={"Export"}
                                data={paginatedData}
                                path="capacity/use-it-or-lose-it"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibilityNew} initialColumns={initialColumns}
                            />
                        </div>
                    </div>
                </div>

                <TableUseItOrLoseIt
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openViewModal={openViewModal}
                    openHistoryForm={openHistoryForm}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    combinedSortKey={combinedSortKey}
                    areaMaster={areaMaster}
                    zoneMaster={zoneMaster}
                    sysParam={sysParamMaster?.data?.filter((item: any) => item.system_parameter_id == 31)}
                    isLoading={isLoading}
                    // columnVisibility={columnVisibility}
                    columnVisibility={columnVisibilityNew}
                    userPermission={userPermission}
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
                dataInfo={formDataInfo}
                latestStartDate={latestStartDate}
                open={formOpen}
                isLoading={isLoading}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            {/* หน้า path management นี้ใช้ component แยกกับ history ตัวอื่น */}
            <ModalPathMgnHistory
                mode='view'
                data={historyData}
                open={historyOpen}
                dataInfo={formDataInfo}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                onClose={handleCloseHistoryModal}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description="UIOLI release has been submited."
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

            {/* <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            /> */}

            <ColumnVisibilityPopoverMT
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibilityNew}
                handleColumnToggle={handleColumnToggleNew}
                initialColumns={initialColumns}
            />
        </div>
    );
};

export default ClientPage;