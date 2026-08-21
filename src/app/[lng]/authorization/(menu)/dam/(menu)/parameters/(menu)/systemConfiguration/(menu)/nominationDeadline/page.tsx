"use client";
import "@/app/globals.css";
import { useAppDispatch } from "@/utils/store/store";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import ModalAction from "./form/modalAction";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission, toDayjs } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { fetchProcessType } from "@/utils/store/slices/processTypeSlice";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import { fetchUserType } from "@/utils/store/slices/userTypeMasterSlice";
import BtnAddNew from "@/components/other/btnAddNew";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnExport from "@/components/other/btnExport";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
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

            const permission = findRoleConfigByMenuName('Nomination Deadline', userDT)
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
    const { processTypeMaster, userTypeMaster, nominationTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchNominationType());
            dispatch(fetchUserType());
            dispatch(fetchProcessType());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
        getPermission();
    }, [dispatch, processTypeMaster, userTypeMaster, nominationTypeMaster, forceRefetch]);


    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchNomiType, setSrchNomiType] = useState<any>([]);
    const [srchPrcessType, setSrchProcessType] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {

        // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed

        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                // (srchPrcessType ? item?.process_type?.id == srchPrcessType : true) &&
                // (srchNomiType ? item?.nomination_type?.id == srchNomiType : true)

                // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
                (srchPrcessType?.length > 0 ? srchPrcessType.includes(item?.process_type?.id?.toString()) : true) &&
                (srchNomiType?.length > 0 ? srchNomiType.includes(item?.nomination_type?.id?.toString()) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchNomiType([])
        setSrchProcessType([])
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) => {
                return (
                    item?.nomination_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    (item?.nomination_type?.name + 'Nomination')?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    item?.user_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    item?.process_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    item?.before_gas_day?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    item?.hour?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    item?.minute?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    // (item?.hour + ':' + item?.minute)?.toString().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    (`${item?.hour}:${String(item?.minute).padStart(2, '0')}`).toString().includes(query.replace(/\s+/g, '').toLowerCase()) ||
                    formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                    formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
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
            const response: any = await getService(`/master/parameter/nomination-deadline`);

            let rescutom: any = [];
            for (let index = 0; index < response?.length; index++) {
                let data: any = response[index];
                let configEndtime: any = `${String(data?.hour !== undefined && String(data?.hour).padStart(2, '0')) + ":" + String(data?.minute !== undefined && String(data?.minute).padStart(2, '0'))}`
                let newDT: any = { ...data, ...{ custom_endtime: configEndtime } };
                let pushDT: any = newDT
                rescutom.push(pushDT);
            }

            setData(rescutom);
            setFilteredDataTable(rescutom);

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
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        hour: '',
        minute: '',
        before_gas_day: '',
        user_type_id: '',
        nomination_type_id: '',
        process_type_id: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
    };
    const [formData, setFormData] = useState(fdInterface);

    // #region submit
    const handleFormSubmit = async (data: any) => {
        const newData = replaceEmptyStringsWithNull(data)
        if (typeof data.end_date !== 'string' || data.end_date == 'Invalid Date') {
            data.end_date = null;
        }
        // data.area_nominal_capacity = parseFloat(data.area_nominal_capacity);
        // data.supply_reference_quality_area = parseFloat(data.supply_reference_quality_area);
        data.before_gas_day = parseInt(data.before_gas_day)

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/parameter/nomination-deadline-create', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Nomination Deadline has been added.')
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":

                // New : เพิ่มเงื่อนไขการ lock sequence ของ Process Type เช่น ไม่ให้เวลา management เริ่มก่อนเวลา submission อยากให้ lock sequence
                // โดยจะต้องเรียงตาม Process Type แล้วช่วงเวลาก็จะไล่ลำดับตามไป โดยไม่ให้ระบุเวลาได้เลยเวลาก่อนหน้า(ไล่จากบรรทัดบนลงล่าง)


                // ลำดับการสร้างหรือแก้ไขจะมีความสำคัญดังนี้

                // 1.Submission 
                // 2.Management
                // 3.Reception Of Renomination
                // 4.Validate Response of renomination

                // โดยลำดับที่น้อยกว่าจะไม่สามารถสร้างหรือแก้ไขข้อมูลวันเวลาก่อนหน้าลำดับก่อนหน้าได้


                let res_update = await putService(`/master/parameter/nomination-deadline-edit/${selectedId}`, data);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

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
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.hour = filteredData.hour;
            fdInterface.minute = filteredData.minute;
            fdInterface.before_gas_day = filteredData.before_gas_day;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.nomination_type_id = filteredData.nomination_type_id;
            fdInterface.process_type_id = filteredData.process_type_id;
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
            fdInterface.id = filteredData.id;
            fdInterface.hour = filteredData.hour;
            fdInterface.minute = filteredData.minute;
            fdInterface.before_gas_day = filteredData.before_gas_day;
            fdInterface.user_type_id = filteredData.user_type_id;
            fdInterface.nomination_type_id = filteredData.nomination_type_id;
            fdInterface.process_type_id = filteredData.process_type_id;
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
            const response: any = await getService(`/master/account-manage/history?type=nomination-deadline&method=all&id_value=${id}`);
            const valuesArray = response?.map((item: any) => item.value);

            let mappings = [
                { key: "process_type.name", title: "Process Type" },
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

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

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
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'process_type', label: 'Process Type', visible: true },
        { key: 'nom_type', label: 'Nomination Type', visible: true },
        { key: 'time', label: 'Time', visible: true },
        { key: 'before_gas', label: 'Before Gas Day', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        // { key: 'create_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'user_type', label: 'User Type', visible: true },
        { key: 'process_type', label: 'Process Type', visible: true },
        { key: 'nom_type', label: 'Nomination Type', visible: true },
        { key: 'time', label: 'Time', visible: true },
        { key: 'before_gas', label: 'Before Gas Day', visible: true },
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
                accessorKey: "user_type",
                header: "User Type",
                enableSorting: true,
                accessorFn: (row: any) => row?.user_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            {
                                row?.user_type &&
                                <div className="flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] font-bold rounded-full p-1" style={{ backgroundColor: row?.user_type?.color, color: row?.user_type?.color_text }}>{row?.user_type?.name}</div>
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "process_type",
                header: "Process Type",
                enableSorting: true,
                accessorFn: (row: any) => row?.process_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.process_type && row?.process_type?.name}</div>)
                }
            },
            {
                accessorKey: "nom_type",
                header: "Nomination Type",
                enableSorting: true,
                accessorFn: (row: any) => row?.nomination_type?.document_type || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            <div className="w-[200px] text-center py-1 rounded-[20px]" style={{ background: row?.nomination_type?.color }}>{row?.nomination_type && row?.nomination_type?.document_type}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "time",
                header: "Time",
                enableSorting: true,
                accessorFn: (row: any) => row?.custom_endtime || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.custom_endtime}</div>)
                }
            },
            {
                accessorKey: "before_gas",
                header: "Before Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => row?.before_gas_day || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.before_gas_day && row?.before_gas_day}</div>)
                }
            },
            {
                accessorKey: "start_date",
                header: "Start Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.start_date),
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
                accessorFn: (row: any) => toDayjs(row?.end_date).isValid() ? formatDateNoTime(row?.end_date) : '',
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
        ], []
    )

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

    const [tk, settk] = useState(false);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('Nomination Deadline', userDT)
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
                        id="searchProcessType"
                        label="Process Type"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchPrcessType}
                        onChange={(e) => setSrchProcessType(e.target.value)}
                        options={processTypeMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                        customWidth={250}
                        customWidthPopup={250}
                    />

                    <InputSearch
                        id="searchNomiType"
                        label="Nomination Type"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchNomiType}
                        customWidth={190}
                        onChange={(e) => setSrchNomiType(e.target.value)}
                        options={nominationTypeMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name + ' Nomination'
                        }))}
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
                            <TuneIcon
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/nomination-deadline" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>
                <TableNomiDeadline
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
                        path="dam/nomination-deadline"
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
                haveTooltip={true}
                tooltipMsg={
                    <div>
                        <p className="text-[#464255] font-semibold">{`Actions must follow this order`}</p>
                        <p className="text-[#464255] font-light">{`1. Submission`}</p>
                        <p className="text-[#464255] font-light">{`2. Management`}</p>
                        <p className="text-[#464255] font-light">{`3. Reception of Renomination`}</p>
                        <p className="text-[#464255] font-light">{`4. Validate Response of Renomination`}</p>
                        <p className="text-[#464255] font-light">{`Any step may not be created or updated to a date/time that precedes any step earlier in the sequence.`}</p>
                        <p className="text-[#464255] font-light">{`Separate by each nomination type.`}</p>
                    </div>
                }
            />



            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                nominationTypeMasterData={nominationTypeMaster?.data}
                processTypeMasterData={processTypeMaster?.data}
                userTypeMasterData={userTypeMaster?.data}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            setFormData(null);
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
                description={modalModalSuccessMsg}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="nomination-deadline"
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