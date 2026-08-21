"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import { findRoleConfigByMenuName, generateUserPermission, iconButtonClass } from "@/utils/generalFormatter";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { InputSearch } from "@/components/other/SearchForm";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useFetchMasters } from "@/hook/fetchMaster";
import ModalComment from "./form/modalComment";
import TableReserveBalGas from "./form/table";
import ModalFile from "./form/modalFile";
import ModalView from "./form/modalView";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import BtnActionTable from "@/components/other/btnActionInTable";
import AppTable from "@/components/table/AppTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
            //     const permission = findRoleConfigByMenuName('Reserve Balancing Gas Contracts', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Reserve Balancing Gas Contracts', userDT)
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
    const { entryExitMaster, shipperGroupData, zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            dispatch(fetchZoneMasterSlice());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, zoneMaster, areaMaster, forceRefetch]);


    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        const result = dataTable?.filter((item: any) => {
            return (
                // (srchShipper ? item?.group_id == srchShipper : true)

                (srchShipper ? srchShipper?.includes(item?.group_id) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchShipper([]);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter((item: any) => {
            const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
            return (
                item?.res_bal_gas_contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.group?.name?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataPathGroup, setDataPathGroup] = useState<any>([]);
    const [dataAreaMaster, setDataAreaMaster] = useState<any>([]);
    const [dataNomPointMaster, setDataNomPointMaster] = useState<any>([]);
    const [latestStartDate, setLatestStartDate] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {

            // DATA AREA
            const res_area: any = await getService(`/master/asset/area`);
            setDataAreaMaster(res_area)

            // DATA NOM POINT
            const res_nom_point: any = await getService(`/master/asset/nomination-point`);
            setDataNomPointMaster(res_nom_point)

            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
            }
            const response: any = await getService(`/master/reserve-balancing-gas-contract`);

            // ถ้าเป็น shipper --> filter only shipper ตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                let filter_response_only_own_shipper = response?.filter((item: any) =>
                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true
                )
                setData(filter_response_only_own_shipper);
                setFilteredDataTable(filter_response_only_own_shipper);
            } else {
                setData(response);
                setFilteredDataTable(response);
            }

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
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [mdConfirmOpen, setMdConfirmOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [openView, setOpenView] = useState(false);
    const [dataView, setDataView] = useState<any>();
    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'release'>('create');
    const [isModalLoading, setisModalLoading] = useState<boolean>(false);

    const fdInterface: any = {
        reserve_balancing_gas_contract_comment: '',
        url: '',
        res_bal_gas_contract: '',
        group_id: '',
    };

    const [formData, setFormData] = useState(fdInterface);
    const [formDataView, setFormDataView] = useState(fdInterface);
    const [formDataInfo, setFormDataInfo] = useState<any>([]);

    const handleFormSubmit = async (data: any, groupData?: any) => {

        // ถ้าไม่มี comment ให้ clear ทิ้งเลย
        if (data && Array.isArray(data.reserve_balancing_gas_contract_comment) && data.reserve_balancing_gas_contract_comment[0] === '') {
            data.reserve_balancing_gas_contract_comment = [];
        }

        switch (formMode) {
            case "create":
                let res_create = await postService('/master/reserve-balancing-gas-contract/create', data);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    // setModalErrorMsg(res_create?.response?.data?.error);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                    setIsLoading(false)
                    fetchData();
                }
                break;
            case "edit":
                let res_update = await putService(`/master/reserve-balancing-gas-contract/edit/${selectedId}`, data);
                const statusCodePut = res_update?.response?.data?.statusCode ?? res_update?.response?.data?.status ?? res_update?.status ?? res_update?.statusCode ?? res_update?.code ?? res_update?.response?.status;
                const errorMsgPut = res_update?.response?.data?.error ?? res_update?.data?.error ?? res_update?.response?.error ?? res_update?.error;

                if (statusCodePut === 400 || statusCodePut === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPut || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                    setIsLoading(false)
                    fetchData();
                }
                break;
        }

        setisModalLoading(false);
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setisModalLoading(false);
        setFormMode('create');
        // ส่ง dataPathGroup ไปหน้า create
        setFormData(dataPathGroup)
        // setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable?.find((item: any) => item.id === id);
        setisModalLoading(true);
        setFormData(filteredData);
        setFormMode('edit');
        // setFormData(dataPathGroup);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable?.find((item: any) => item.id === id);
        setFormMode('view');
        setFormDataView(filteredData);
        setOpenView(true);
    };

    // ############### MODAL VIEW FILE ###############
    const [mdAddDoc, setMdAddDoc] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>();

    const openAddDocModal = (id?: any, data?: any) => {

        setDataFile(data)
        // const filtered = dataTable?.find((item: any) => item.id === id);
        // setDataSubmission(filtered)
        setMdAddDoc(true)
    };

    // ############### MODAL VIEW ###############
    const openViewModal = (data: any) => {

        setDataView(data)
        setOpenView(true)
    };

    // ############### HISTORY MODAL ###############
    // const [historyOpen, setHistoryOpen] = useState(false);
    // const handleCloseHistoryModal = () => setHistoryOpen(false);
    // const handleCloseHistoryModal = () => {
    //     setHistoryOpen(false);
    //     setTimeout(() => {
    //         setHistoryData(undefined);
    //     }, 300);
    // }
    // const [historyData, setHistoryData] = useState<any>();
    // const [headData, setHeadData] = useState<any>();

    // const openHistoryForm = async (id: any) => {
    //     try {
    //         const response: any = await getService(`/master/path-management/path-management-log/${id}`);

    //         // const valuesArray = response.map((item: any) => item.value);
    //         // let mappings = [
    //         //     { key: "name", title: "Email Group Name" },
    //         // ];
    //         // let result = mappings.map(({ key, title }) => {
    //         //     const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
    //         //     return {
    //         //         title,
    //         //         value: value || "",
    //         //     };
    //         // });
    //         // setHeadData(result);

    //         setHistoryData(response);
    //         setHistoryOpen(true);
    //     } catch (err) {
    //         // setError(err.message);
    //     } finally {
    //         // setLoading(false);
    //     }
    // }

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
    // const [itemsPerPage, setItemsPerPage] = useState(10);

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    // const paginatedData = Array.isArray(filteredDataTable)
    //     ? filteredDataTable.slice(
    //         (currentPage - 1) * itemsPerPage,
    //         currentPage * itemsPerPage
    //     )
    //     : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'res_bal_gas_contract', label: 'Reserve Bal. Contract Code', visible: true },
        { key: 'group', label: 'Shipper Name', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    // const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    //     setAnchorEl(anchorEl ? null : event.currentTarget);
    // };

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
                accessorKey: "res_bal_gas_contract",
                header: "Reserve Bal. Contract Code",
                enableSorting: true,
                accessorFn: (row: any) => row?.res_bal_gas_contract || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.res_bal_gas_contract ? row?.res_bal_gas_contract : ''}</div>)
                }
            },
            {
                accessorKey: "group",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group ? row?.group?.name : ''}</div>)
                }
            },
            {
                accessorKey: "comment",
                header: "Comment",
                enableSorting: false,
                accessorFn: (row: any) => row?.reserve_balancing_gas_contract_comment?.length || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    const getPermission: any = renderPermission();
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative "
                                onClick={() => openReasonModal(row?.id, row?.reserve_balancing_gas_contract_comment, row)}
                                disabled={getPermission?.f_view == true ? false : true || row?.reserve_balancing_gas_contract_comment?.length <= 0}
                            >
                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openReasonModal(row?.id, row?.reserve_balancing_gas_contract_comment, row)}
                                disabled={getPermission?.f_view == true ? false : true || row?.reserve_balancing_gas_contract_comment?.length <= 0}
                            >
                                <ChatBubbleOutlineOutlinedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>

                            <span className="px-2 text-[#464255]">
                                {row?.reserve_balancing_gas_contract_comment?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "file",
                header: "File",
                enableSorting: false,
                accessorFn: (row: any) => row?.reserve_balancing_gas_contract_files.length || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    const getPermission: any = renderPermission();
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openAddDocModal(row?.id, row)}
                                disabled={getPermission?.f_view == true ? false : true || row?.reserve_balancing_gas_contract_files.length <= 0}
                            >
                                <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                aria-label="Open files"
                                onClick={() => openAddDocModal(row?.id, row)}
                                disabled={getPermission?.f_view == true ? false : true || row?.reserve_balancing_gas_contract_files.length <= 0}
                                className={iconButtonClass}
                            >
                                <AttachFileRoundedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.reserve_balancing_gas_contract_files.length}
                            </span>
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
        ],
        [])

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

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;
            permission = findRoleConfigByMenuName('Reserve Balancing Gas Contracts', userDT)

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
                setAnchorPopover(null);
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null);
                break;
        }
    }

    const [dataExport, setDataExport] = useState<any>([]);

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchShipper}
                        onChange={(e) => setSrchShipper(e.target.value)}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
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
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="capacity/reserve-balancing-gas-contracts" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>

                <TableReserveBalGas
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openViewModal={openViewModal}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                    openAddDocModal={openAddDocModal}
                    tableData={paginatedData}
                    areaMaster={areaMaster}
                    zoneMaster={zoneMaster}
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
                        path="capacity/reserve-balancing-gas-contracts"
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
                dataShipper={shipperGroupData}
                dataInfo={formDataInfo}
                entryExitMaster={entryExitMaster}
                zoneMaster={zoneMaster}
                dataAreaMaster={dataAreaMaster}
                dataNomPointMaster={dataNomPointMaster}
                latestStartDate={latestStartDate}
                setMdConfirmOpen={setMdConfirmOpen}
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
                isModalLoading={isModalLoading}
                setisModalLoading={setisModalLoading}
            />

            <ModalView
                mode={formMode}
                data={formDataView}
                dataShipper={shipperGroupData}
                dataInfo={formDataInfo}
                entryExitMaster={entryExitMaster}
                zoneMaster={zoneMaster}
                latestStartDate={latestStartDate}
                setMdConfirmOpen={setMdConfirmOpen}
                userPermission={userPermission}
                open={openView}
                onClose={() => {
                    // setFormOpen(false);
                    setOpenView(false)
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                            setFormDataView(null);
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            <ModalComment
                data={dataReason}
                dataMain={dataReasonRow}
                setModalSuccessOpen={setModalSuccessOpen}
                open={mdReasonView}
                onClose={() => {
                    setTimeout(async () => {
                        await fetchData()
                    }, 500);
                    setMdReasonView(false);
                }}
            />

            <ModalFile
                open={mdAddDoc}
                onClose={() => {
                    setMdAddDoc(false);
                }}
                data={dataFile}
            // setDataFileArr={setDataFileArr}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Reserve Balancing Gas Contract has been added."
                description={formMode == 'create' ? "Reserve Balancing Gas Contract has been added." : "Your changes have been saved."}
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

            <ModalComponent
                open={mdConfirmOpen}
                handleClose={(e: any) => {
                    if (e == "submit") {
                        // mutateLogout()
                    } else {
                        setMdConfirmOpen(false);
                    }
                }}
                title="Confirm Capacity Value"
                description={
                    <div className="text-center text-[16px]">
                        {"Please confirm to proceed."}
                    </div>
                }
                stat="confirm"
                btnmode="split"
                btnsplit1="Confirm"
                btnsplit2="Cancel"
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
                // anchorOrigin={{
                //     vertical: 'top',
                //     horizontal: 'right',
                // }}
                // transformOrigin={{
                //     vertical: 'top',
                //     horizontal: 'left',
                // }}
                // sx={{
                //     overflow: 'hidden',
                //     "& .MuiPopover-paper": {
                //         borderRadius: '10px', // Transfer border
                //     },
                // }}
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
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                        }
                    </ul>
                </div>
            </Popover>
        </div>
    );
};

export default ClientPage;