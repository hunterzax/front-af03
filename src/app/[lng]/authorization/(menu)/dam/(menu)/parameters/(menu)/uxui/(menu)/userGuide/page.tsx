"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import ModalAction from "./form/modalAction";
import { InputSearch } from "@/components/other/SearchForm";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { cutUploadFileName, exportToExcel, fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission } from "@/utils/generalFormatter";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import AppTable from "@/components/table/AppTable";
import { Popover } from "@mui/material";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const userDT: any = getUserValue();

    // ############### Check Authen ###############
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

            const permission = findRoleConfigByMenuName('User Guide', userDT)
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
    // const { userGuideRole } = useFetchMasters();
    // const [userGuideRole, setuserGuideRole] = useState<any>([]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [srchDocName, setSrchDocName] = useState('');
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        const result = dataTable.filter((item: any) => {
            return (
                (srchDocName ? item?.document_name.toLowerCase().includes(srchDocName.toLowerCase()) : true)
                // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchDocName('')
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    // const handleSearch = (query: string) => {

    //     const filtered = dataTable.filter(
    //         (item: any) => {
    //             const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

    //             return (
    //                 item?.document_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
    //                 item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
    //                 item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
    //                 item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
    //                 item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

    //                 formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
    //                 formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

    //                 formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
    //                 formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower)
    //             )
    //         }
    //     );
    //     setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    //     setFilteredDataTable(filtered);
    // };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {

            // v2.0.98 New กรณีที่ไม่ได้เลือก User Role เลย แล้วจะทำยังไงให้เห็นข้อมูล เพราะถ้าไม่ได้เลือกใครเลย ข้อมูลจะหายไป [Role Super Admin] ควรเห็นทุกรายการ https://app.clickup.com/t/86euzxxnn
            let response: any = []
            // if (userDT?.account_manage?.[0]?.user_type_id == 1) { // see all
            //     response = await getService(`/master/parameter/user-guide-role-all`); // เส้นนี้เห็นทั้งหมด
            // } else {
            //     response = await getService(`/master/parameter/user-guide`); // เส้นนี้เห็นของแค่ role ของใครของมัน
            // }

            response = await getService(`/master/parameter/user-guide`);

            const userRoleId = userDT?.account_manage?.[0]?.account_role?.[0]?.role_id;

            // filter ให้เห็นเฉพาะ role ตัวเอง
            let filteredDataUserGuide: any = response
            // if (userRoleId !== 1) { // ไม่ใช่ super admin
           
            if (userDT?.account_manage?.[0]?.user_type_id !== 1) { // ไม่ใช่ super admin
                filteredDataUserGuide = response?.filter((item: any) => {
                    return (
                        item?.user_guide_match.some((match: any) => match.role_id === userRoleId) ||
                        item?.create_by === userDT?.id // https://app.clickup.com/t/9018502823/86euzxxnn
                    )
                });
            }

            setData(filteredDataUserGuide);
            setFilteredDataTable(filteredDataUserGuide);
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
        document_name: '',
        file: '',
        description: '',
        role: [],
    };
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        const newData = replaceEmptyStringsWithNull(data)

        // เอาไว้ใช้เผื่อเส้น upload พังแล้วอยากจะเทส
        // if (!data?.file) {
        //     data.file = "https://www.sampledocs.in/DownloadFiles/SampleFile?filename=SampleDocs-sample-pdf-file&ext=pdf";
        // }

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/parameter/user-guide-create', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                let res_update = await putService(`/master/parameter/user-guide-edit/${selectedId}`, data);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
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

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable?.find((item: any) => item.id === id);
        let data_role = filteredData?.user_guide_match?.map((item: any) => ({
            id: item.role?.id
        }));

        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.document_name = filteredData.document_name;
            fdInterface.file = filteredData.file;
            fdInterface.description = filteredData.description;
            fdInterface.role = data_role;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);

        let data_role = filteredData?.user_guide_match?.map((item: any) => ({
            id: item.role?.id
        }));

        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.document_name = filteredData.document_name;
            fdInterface.file = filteredData.file;
            fdInterface.description = filteredData.description;
            fdInterface.role = data_role;
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
            const response: any = await getService(`/master/account-manage/history?type=user-guide&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);

            let mappings = [
                { key: "document_name", title: "Document Name" },
                // { key: "name", title: "Zone Name" },
                // { key: "description", title: "Description" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                // const isIsoString = typeof value === 'string' && !isNaN(Date.parse(value));

                return {
                    title,
                    value: value || "",
                    // value: isIsoString ? formatDateNoTime(value) : value || "",
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
    // const [itemsPerPage, setItemsPerPage] = useState(10);

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
        { key: 'name', label: 'Document Name', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'desc', label: 'Description', visible: true },
        { key: 'download', label: 'Download', visible: true },
        // { key: 'start_date', label: 'Start Date', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'document_name', label: 'Document Name', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'desc', label: 'Description', visible: true },
        { key: 'download', label: 'Download', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
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

    const getPermissionDownload: any = (item: any) => {

        const account = userDT?.account_manage?.[0];
        // f_export
        if (account?.user_type_id == 1) { // super admin โหลดได้หมด
            return true
        } else if (item?.user_guide_match?.some((match: any) => match?.role_id === account?.account_role?.[0]?.role_id) && userPermission?.f_export) { // ถ้าตรง role ตัวเอง และมีสิทธิ edit ถึงจะโหลดได้
            return true
        } else {
            return false
        }
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Document Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.document_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.document_name}</div>)
                }
            },
            {
                accessorKey: "file",
                header: "File",
                enableSorting: false,
                // size: 150,
                width: 400,
                accessorFn: (row: any) => cutUploadFileName(row?.file) || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center">
                            <img className="w-[20px] h-[20px] mr-2" src="/assets/image/pdf_icon.png" alt="pdf icon" />
                            <span>{row?.file && cutUploadFileName(row?.file)}</span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "desc",
                header: "Description",
                enableSorting: true,
                width: 400,
                accessorFn: (row: any) => row?.description || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.description}</div>)
                }
            },
            {
                accessorKey: "download",
                header: "Download",
                enableSorting: false,
                accessorFn: (row: any) => '',
                meta: {
                    align: 'center'
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    let canDownload = getPermissionDownload(row);
                    return (
                        <div className="inline-flex items-center justify-center relative justify-items-center">
                            <button
                                type="button"
                                className={`flex items-center justify-center px-[2px] py-[2px] border border-[#555479] rounded-md hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA] relative ${!canDownload && "opacity-50 cursor-not-allowed !border-[#555479]"}`}
                                onClick={() => canDownload && downloadFile(row?.file)}
                                disabled={!canDownload}
                            >
                                <FileDownloadOutlinedIcon sx={{ fontSize: 18, color: '#2B2A87' }} />
                            </button>
                        </div>
                    )
                }
            },
            {
                accessorKey: "create_by",
                header: "Created by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.update_date ? formatDate(row?.create_date) : ''}`,
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
            {
                accessorKey: "update_by",
                header: "Updated by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.update_by_account?.first_name} ` || ''}${row?.update_by_account?.last_name} ${row?.update_date ? formatDateTimeSec(row?.update_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                        </div>
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
                    // const getPermission: any = renderPermission();
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false}
                        />
                    )
                }
            },
        ],
        [dataTable, userPermission, user_permission]
        // dataTable, userPermission, user_permission, userDT
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

            permission = findRoleConfigByMenuName('User Guide', userDT)

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

    const downloadFile = (fileUrl: string) => {
        if (!fileUrl) {
            // File URL is invalid
            return;
        }
        window.open(fileUrl, '_blank');
    };

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <InputSearch
                        id="searchId"
                        label="Document Name"
                        value={srchDocName}
                        onChange={(e) => setSrchDocName(e.target.value)}
                        placeholder="Search Document Name"
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
                        path="dam/user-guide"
                        can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                    />
                }
                initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                onFilteredDataChange={(filteredData: any) => {
                    const newData = filteredData || [];
                    if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                        setDataExport(newData);
                    }
                }}
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
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

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description="User Guide has been added."
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="user-guide"
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