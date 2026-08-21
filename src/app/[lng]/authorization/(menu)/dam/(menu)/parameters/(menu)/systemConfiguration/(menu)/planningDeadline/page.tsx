"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import ModalAction from "./form/modalAction";
import { canCreateByTermAndRange, fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
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

            const permission = findRoleConfigByMenuName('Planning Deadline', userDT)
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
    const { termTypeMaster } = useFetchMasters();

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchType, setSrchType] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
        const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
        // const result_2 = dataTabDownloadOriginal?.filter((item: any) => {
        //         return (
        //             (srchGasDay ? fullMonth == item?.monthText : true) &&
        //             // (srchContractCode ? srchContractCode == item?.contractCode : true) &&
        //             (srchContractCodeTabDownload?.length > 0 ? srchContractCodeTabDownload.includes(item?.contractCode) : true)
        //         );
        //     });
        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                (srchType?.length > 0 ? srchType?.includes(item?.term_type?.name) : true)
                // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = () => {
        setSrchType([])
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const filtered = dataTable.filter((item: any) => {
            const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
            return (
                item?.term_type?.name.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.day?.toString().includes(queryLower) ||
                item?.hour?.toString().includes(queryLower) ||
                item?.minute?.toString().includes(queryLower) ||
                // (item?.hour + ":" + item?.minute)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                ((item?.hour?.toString().padStart(2, '0') + ":" + item?.minute?.toString().padStart(2, '0'))?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                item?.before_month?.toString().includes(queryLower) ||
                formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
                formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower)
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
        getPermission();
        try {
            const response: any = await getService(`/master/parameter/planning-deadline`);
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
        day: '',
        before_month: '',
        term_type_id: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
    };
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        const newData = replaceEmptyStringsWithNull(data)
        if (typeof data.end_date !== 'string' || data.end_date == 'Invalid Date') {
            data.end_date = null;
        }
        // data.area_nominal_capacity = parseFloat(data.area_nominal_capacity);
        // data.supply_reference_quality_area = parseFloat(data.supply_reference_quality_area);
        data.before_month = parseInt(data.before_month)
        data.day = parseInt(data.day)

        // const res_check: any = canCreateByTermAndRange(data, dataTable, selectedId);

        // if (!res_check?.ok) {
        //     setFormOpen(false);
        //     setModalErrorMsg(res_check?.reason);
        //     setModalErrorOpen(true)
        //     return null
        // }

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/parameter/planning-deadline-create', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Planning Deadline has been added.')
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let res_update = await putService(`/master/parameter/planning-deadline-edit/${selectedId}`, data);
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
        if (resetForm) { // reset form
            setTimeout(() => {
                setFormData(null);
                resetForm();
            }, 200);
        }
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
            fdInterface.day = filteredData.day;
            fdInterface.before_month = filteredData.before_month;
            fdInterface.term_type_id = filteredData.term_type_id;
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
            fdInterface.day = filteredData.day;
            fdInterface.before_month = filteredData.before_month;
            fdInterface.term_type_id = filteredData.term_type_id;
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
            const response: any = await getService(`/master/account-manage/history?type=planning-deadline&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                { key: "term_type.name", title: "Term Type" },
                // { key: "name", title: "Zone Name" },
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

    // const paginatedData = filteredDataTable?.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    // );
    const paginatedData = Array.isArray(filteredDataTable)
        ? filteredDataTable.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
        : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        // { key: 'type', label: 'Type', visible: true },
        // { key: 'hour', label: 'Hour', visible: true },
        // { key: 'day', label: 'Day', visible: true },
        // { key: 'before_month', label: 'Before Month', visible: true },
        // { key: 'start_date', label: 'Start Date', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        // { key: 'action', label: 'Action', visible: true }

        { key: 'type', label: 'Term', visible: true },
        { key: 'hour', label: 'End Time', visible: true },
        { key: 'day', label: 'Date of Month', visible: true },
        { key: 'before_month', label: 'Before Month', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        // { key: 'type', label: 'Type', visible: true },
        // { key: 'hour', label: 'Hour', visible: true },
        // { key: 'day', label: 'Day', visible: true },
        // { key: 'before_month', label: 'Before Month', visible: true },
        // { key: 'start_date', label: 'Start Date', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        // // { key: 'create_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        // // { key: 'action', label: 'Action', visible: true }
        { key: 'term', label: 'Term', visible: true },
        { key: 'end_time', label: 'End Time', visible: true },
        { key: 'date_of_month', label: 'Date of Month', visible: true },
        { key: 'before_month', label: 'Before Month', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
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
                accessorKey: "term",
                header: "Term",
                enableSorting: true,
                accessorFn: (row: any) => row?.term_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            <div
                                className="flex w-[90%] min-w-[150px] max-w-[200px] !text-[14px] items-center justify-center rounded-full p-1 text-[#464255]"
                                style={{ backgroundColor: row?.term_type?.color }}
                            >
                                {`${row?.term_type?.name}`}
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "hour",
                header: "End Time",
                enableSorting: true,
                accessorFn: (row: any) => row?.custom_endtime || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.custom_endtime}</div>)
                }
            },
            {
                accessorKey: "day",
                header: "Date of Month",
                enableSorting: true,
                accessorFn: (row: any) => row?.day || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.day && row?.day}</div>)
                }
            },
            {
                accessorKey: "before_month",
                header: "Before Month",
                enableSorting: true,
                accessorFn: (row: any) => row?.before_month || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.before_month && row?.before_month}</div>)
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
        ], []
    )

    const [tk, settk] = useState(false);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

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

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('Planning Deadline', userDT)

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
                        id="searchTerm"
                        label="Term"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchType}
                        onChange={(e) => setSrchType(e.target.value)}
                        options={termTypeMaster?.data?.filter((item: any) => item.id !== 4).map((item: any) => ({
                            // value: item?.id?.toString(),
                            value: item.name,
                            label: item.name
                        }))}
                        placeholder="Select Term"

                    // {(termTypeMasterData || [])
                    //     .filter((item: any) => item.id !== 4)
                    //     .map((item: any) => (
                    //         <MenuItem key={item.id} value={item.id}>
                    //             {item.name}
                    //         </MenuItem>
                    //     ))}
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

            {/* ================== NEW TABLE ==================*/}
            <AppTable
                data={filteredDataTable}
                columns={columns}
                isLoading={isLoading}
                exportBtn={
                    <BtnExport
                        textRender={"Export"}
                        data={dataExport}
                        path="dam/planning-deadline"
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
                termTypeMasterData={termTypeMaster?.data}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                            setFormData(null);
                        }, 300);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Planning Deadline has been added."
                description={modalModalSuccessMsg}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="planning-deadline"
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
