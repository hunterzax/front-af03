"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import TableNonTpa from "./form/table";
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
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
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Popover } from "@mui/material";
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

            const permission = findRoleConfigByMenuName('Non TPA Point', userDT)
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
    const { entryExitMaster, zoneMaster, areaMaster, nominationPointData, contractPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchAreaMaster());
            dispatch(fetchNominationPoint());
            dispatch(fetchContractPoint());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, zoneMaster, areaMaster, nominationPointData, contractPointData, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);

    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [sNomPointId, setSNomPointId] = useState<any>([]);
    const [srchNonTpa, setSrchNonTpa] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [tk, settk] = useState<boolean>(true)

    const handleFieldSearch = () => {

        // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                // (sNomPointId ? item?.nomination_point?.id == sNomPointId : true) &&
                // (srchNonTpa ? item?.id == srchNonTpa : true) &&
                // (srchArea ? item?.area_id == srchArea : true)

                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)


                // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
                (sNomPointId?.length > 0 ? sNomPointId?.includes(item?.nomination_point?.id?.toString()) : true) &&
                (srchNonTpa?.length > 0 ? srchNonTpa?.includes(item?.id?.toString()) : true) &&
                (srchArea?.length > 0 ? srchArea?.includes(item?.area_id?.toString()) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchArea([])
        setSNomPointId([])
        setSrchNonTpa([])

        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

                return (
                    item?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.non_tpa_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.nomination_point?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.start_date && formatDateNoTime(item?.start_date)?.toLowerCase()?.trim()?.includes(queryLower) ||
                    item?.end_date && formatDateNoTime(item?.end_date)?.toLowerCase()?.trim()?.includes(queryLower)
                    // formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
                    // formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower)
                )
            }
        );

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataNominationPoint, setDataNominationPoint] = useState<any>([]);
    const [dataArea, setDataArea] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/asset/non-tpa-point`);

            // ย้ายมาข้างบน เผื่อตอน map ข้อมูล filter มันติดอะไร จะได้มีข้อมูลเล่นในตาราง
            setData(response);
            setFilteredDataTable(response);
            setIsLoading(true);

            // DATA AREA
            const areaFromRes = Array.from(
                new Map(
                    response?.map((item: any) => [item.area, {
                        id: item.area.id,
                        name: item.area.name
                    }])
                ).values()
            );
            const uniqueAreaById = Array.from(new Map(areaFromRes.map((item: any) => [item.id, item])).values());
            setDataArea(uniqueAreaById);

            // DATA NOMINATION POINT
            const nomPointFromRes = Array.from(
                new Map(
                    response?.map((item: any) => [item.nomination_point, {
                        id: item.nomination_point.id,
                        name: item.nomination_point.nomination_point,
                        area: item.area
                    }])
                ).values()
            );
            const uniqueNomById = Array.from(new Map(nomPointFromRes.map((item: any) => [item.id, item])).values());
            setDataNominationPoint(uniqueNomById);

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // const [csrfToken, setCsrfToken] = useState<any>(null);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
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

    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        if (typeof data.end_date !== 'string' || data.end_date == 'Invalid Date') {
            data.end_date = null;
        }
        switch (formMode) {
            case "create":
                const res_create = await postService('/master/asset/non-tpa-point-create', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    // setModalErrorMsg(res_create?.response?.data?.error);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Non TPA Point has been added.')
                    setModalSuccessOpen(true);
                }

                break;
            case "edit":
                const res_edit = await putService(`/master/asset/non-tpa-point-edit/${selectedId}`, data);
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
        if (resetForm) resetForm();
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
            fdInterface.non_tpa_point_name = filteredData.non_tpa_point_name;
            fdInterface.description = filteredData.description;
            fdInterface.area_id = filteredData.area_id;
            fdInterface.nomination_point_id = filteredData.nomination_point_id;
            fdInterface.start_date = new Date(filteredData.start_date);
            fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
        }
        setFormMode('edit');
        setFormData(fdInterface);
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
        setFormData(fdInterface);
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
            const response: any = await getService(`/master/account-manage/history?type=non-tpa-point&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "non_tpa_point_name", title: "Non TPA Point Name" },
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
        { key: 'area', label: 'Area', visible: true },
        { key: 'name', label: 'Non TPA Point Name', visible: true },
        { key: 'desc', label: 'Description', visible: true },
        { key: 'nom_point', label: 'Nomination Point', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        // { key: 'create_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'area', label: 'Area', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'non_tpa_point_name', label: 'Non TPA Point Name', visible: true },
        { key: 'description', label: 'Description', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
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
                accessorKey: "area",
                header: "Area",
                enableSorting: true,
                accessorFn: (row: any) => row?.area?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            {
                                row?.area.entry_exit_id == 2 ?
                                    <div
                                        className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                        style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                    >
                                        {`${row?.area?.name}`}
                                    </div>
                                    :
                                    <div
                                        className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                        style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                    >
                                        {`${row?.area?.name}`}
                                    </div>
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "non_tpa_point_name",
                header: "Non TPA Point Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.non_tpa_point_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.non_tpa_point_name}</div>
                    )
                }
            },
            {
                accessorKey: "desc",
                header: "Description",
                enableSorting: true,
                accessorFn: (row: any) => row?.description || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.description ? row?.description : ''}</div>
                    )
                }
            },
            {
                accessorKey: "nomination_point",
                header: "Nomination Point",
                enableSorting: true,
                filterFn: 'includesString', // ค้นหาแบบ contains
                accessorFn: (row: any) => row?.nomination_point?.nomination_point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.nomination_point?.nomination_point}</div>
                    )
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
                accessorKey: "action",
                id: 'actions',
                header: "Action",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={getPermission?.f_view == true ? false : true}
                        />
                    )
                }
            },
        ]
        , [])

    const togglePopover = (id: any, anchor: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null); // close popover
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

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('Non TPA Point', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
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

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null);
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

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchArea"
                        label="Area"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchArea}
                        onChange={(e) => {
                            setSrchArea(e.target.value);
                            // setSNomPointId('');
                            // setSrchNonTpa('');
                            setSNomPointId([]);
                            setSrchNonTpa([]);
                            settk(!tk)
                        }}
                        options={dataArea?.map((item: any) => ({
                            value: item?.id.toString(),
                            label: item?.name
                        }))}
                        customWidth={180}
                        customWidthPopup={180}
                    />

                    <InputSearch
                        id="searchNomPoint"
                        label="Nomination Point"
                        // type="select"
                        type="select-multi-checkbox"
                        value={sNomPointId}
                        onChange={(e) => {
                            setSNomPointId(e.target.value)
                            setSrchNonTpa([])
                        }}
                        // options={nominationPointData?.data?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.nomination_point
                        // }))}

                        // options={dataTable?.map((item: any) => ({
                        //     value: item?.nomination_point?.id.toString(),
                        //     label: item?.nomination_point?.nomination_point
                        // }))}

                        // options={dataTable
                        //     ?.filter((item: any) => srchArea ?
                        //         item?.area_id?.toString() === srchArea : true
                        //     )?.map((item: any) => ({
                        //         value: item?.nomination_point?.id.toString(),
                        //         label: item?.nomination_point?.nomination_point
                        //     }))
                        // }

                        // Filter Nomination Point > ข้อมูลขึ้นซ้ำ https://app.clickup.com/t/86etby1gf
                        // options={dataNominationPoint
                        //     ?.filter((item: any) => srchArea ?
                        //         item?.area?.id?.toString() === srchArea : true
                        //     )?.map((item: any) => ({
                        //         value: item?.id?.toString(),
                        //         label: item?.name
                        //     }))
                        // }

                        options={dataNominationPoint
                            ?.filter((item: any) => srchArea?.length > 0 ?
                                srchArea.includes(item?.area?.id?.toString()) : true
                            )?.map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item?.name
                            }))
                        }

                        customWidth={220}
                        customWidthPopup={220}
                    />

                    <InputSearch
                        id="searchNonTpaPoint"
                        label="Non TPA Point Name"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchNonTpa}
                        onChange={(e) => {
                            setSrchNonTpa(e.target.value)
                            // setSrchNonTpa('');
                            settk(!tk)
                        }}
                        // options={filteredDataTable?.filter((i: any) => sNomPointId && sNomPointId !== '' ? i?.nomination_point_id == sNomPointId : i?.nomination_point_id)?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.non_tpa_point_name
                        // }))}

                        // options={dataTable?.sort((a: any, b: any) => a?.non_tpa_point_name?.localeCompare(b?.non_tpa_point_name))?.filter((i: any) => sNomPointId && sNomPointId !== '' ? i?.nomination_point_id == sNomPointId : i?.nomination_point_id)
                        //     ?.filter((item: any) => srchArea ?
                        //         item?.area_id?.toString() === srchArea : true
                        //     )
                        //     .map((item: any) => ({
                        //         value: item?.id.toString(),
                        //         label: item?.non_tpa_point_name
                        //     }))}

                        options={dataTable?.sort((a: any, b: any) => a?.non_tpa_point_name?.localeCompare(b?.non_tpa_point_name))?.filter((i: any) => sNomPointId?.length > 0 ? sNomPointId.includes(i?.nomination_point_id?.toString()) : i?.nomination_point_id)
                            ?.filter((item: any) => srchArea?.length > 0 ?
                                srchArea.includes(item?.area?.id?.toString()) : true
                            )
                            .map((item: any) => ({
                                value: item?.id.toString(),
                                label: item?.non_tpa_point_name
                            }))}
                        customWidth={240}
                        customWidthPopup={240}
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
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div>
                </aside>
            </div>

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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/non-tpa-point" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>

                <TableNonTpa
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    // tableData={filteredDataTable}
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
                        path="dam/non-tpa-point"
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

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                zoneMasterData={zoneMaster?.data}
                areaMasterData={areaMaster?.data}
                entryExitMasterData={entryExitMaster?.data}
                contractPointData={contractPointData?.data}
                nominationPointData={nominationPointData?.data}
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
                tableType="non-tpa-point"
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
    );
};

export default ClientPage;