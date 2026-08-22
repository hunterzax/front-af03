"use client";
// import Link from "next/link";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, patchService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import MasterPathFlow from "./form/flow";
import ModalUpdateStat from "./form/modalUpdateStat";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { checkEntryExitNodes, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, hasMatchingNodeIds, prioritizeNodeWithEntryExit } from "@/utils/generalFormatter";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import AppTable from "@/components/table/AppTable";
import React from "react";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import getUserValue from "@/utils/getuserValue";
import { sortDataPostByEdges } from "./form/functionSort";

// import { createRedisInstance } from "../../../../../../../../../../redis";
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

            const permission = findRoleConfigByMenuName('Config Master Path', userDT)
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
    const [srchStatus, setSrchStatus] = useState<any>([]);
    const [srchEntry, setSrchEntry] = useState<any>([]);
    const [srchExit, setSrchExit] = useState<any>([]);

    // modify this handleFieldSearch function to support find dataTable.revised_capacity_path.area.id that match srchEntry and srchExit
    // condition is 
    // 1. when srchEntry have value you should search dataTable.revised_capacity_path.area.id == srchEntry and dataTable.revised_capacity_path.area.entry_exit_id == 1
    // 1. when srchExit have value you should search dataTable.revised_capacity_path.area.id == srchExit and dataTable.revised_capacity_path.area.entry_exit_id == 2
    const handleFieldSearch = () => {
        // let stat = srchStatus === "1" ? true : false
        const statusFilter = srchStatus.map((s: any) => s === "1");

        // เดิมโรงงาน
        // const result = dataTable?.filter((item: any) => {
        //     // Check if revised_capacity_path contains matching areas
        //     const hasEntry = srchEntry
        //         ? item.revised_capacity_path.some(
        //             (path: any) => path.area.id == srchEntry && path.area.entry_exit_id === 1
        //         )
        //         : true;

        //     const hasExit = srchExit
        //         ? item.revised_capacity_path.some(
        //             (path: any) => path.area.id == srchExit && path.area.entry_exit_id === 2
        //         )
        //         : true;

        //     return hasEntry && hasExit && (srchStatus ? item.active === stat : true);
        // });

        // ใหม่ออลนิว
        const result = dataTable?.filter((item: any) => {
            // Check if revised_capacity_path contains matching areas
            const hasEntry = srchEntry?.length > 0
                ? item.revised_capacity_path.some(
                    (path: any) => srchEntry.includes(path?.area?.id?.toString()) && path.area.entry_exit_id === 1
                )
                : true;

            const hasExit = srchExit?.length > 0
                ? item.revised_capacity_path.some(
                    (path: any) => srchExit.includes(path?.area?.id?.toString()) && path.area.entry_exit_id === 2
                )
                : true;

            // return hasEntry && hasExit && (srchStatus ? item.active === stat : true);
            return hasEntry && hasExit && (statusFilter.length ? statusFilter.includes(item?.active) : true);
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setSrchStatus([]);
        setSrchEntry([])
        setSrchExit([]);
        setFilteredDataTable(dataTable);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const filtered = dataTable.filter((item: any) => {
            const topLevelMatch =
                item?.path_no?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
                item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
                item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

                // item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                // item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
                // item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

                // formatDateNoTime(item?.update_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                // formatTime(item?.update_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                // formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                formatDateNoTime(item?.create_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                formatTime(item?.create_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase().trim())
            // item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase());

            // หาไส้
            const nestedMatch = item?.revised_capacity_path?.some((subItem: any) =>
                subItem?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase())
            );

            return topLevelMatch || nestedMatch;
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataAreaMaster, setDataAreaMaster] = useState<any>([]);
    const [areaEntry, setAreaEntry] = useState<any>([]);
    const [areaExit, setAreaExit] = useState<any>([]);

    useEffect(() => {
        setAreaEntry(dataAreaMaster?.filter((item: any) => item.entry_exit_id == 1)) // entry
        setAreaExit(dataAreaMaster?.filter((item: any) => item.entry_exit_id == 2)) // exit
    }, [dataAreaMaster])

    const fetchMaster = async () => {
        // DATA AREA
        const res_area: any = await getService(`/master/asset/area`);
        setDataAreaMaster(res_area)
    }

    const fetchData = async () => {
        try {
            setIsLoading(false)

            fetchMaster();

            const response: any = await getService(`/master/asset/config-master-path`);

            // get 1st area of path
            // List : Column Revised Capacity Path เพิ่ม Sorting https://app.clickup.com/t/86err1dwf
            const updatedData = response.map((item: any) => ({
                ...item,
                first_path: item.revised_capacity_path?.[0]?.area || null,
                node_id: item.revised_capacity_path.map((node: any) => node.area_id) // เอาไว้ทำเช็คซ้ำตอน create หรือ duplicate
            }));

            setData(updatedData);
            setFilteredDataTable(updatedData);

            // setData(response);
            // setFilteredDataTable(response);
            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        getPermission();
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [isModalError, setisModalError] = useState<boolean>(false);
    const [ErrorMsg, setErrorMsg] = useState<any>(<div>
        <div className="text-center">
            {"Config Master Path cannot be save."}
        </div>
        <div className="text-center">
            {"Invalid data."}
        </div>
    </div>);

    const handleCloseModal = () => {
        setModalSuccessOpen(false);
        setdcModalSuccess('');
    }
    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        name: '',
        zone_id: '',
        description: '',
        entry_exit_id: '',
        area_nominal_capacity: null,
        supply_reference_quality_area: null,
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
        color: '',
    };
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        const newData = replaceEmptyStringsWithNull(data)

        data.area_nominal_capacity = parseFloat(data.area_nominal_capacity);
        data.supply_reference_quality_area = parseFloat(data.supply_reference_quality_area);

        switch (formMode) {
            case "create":
                await postService('/master/asset/config-master-path-create', data);
                setFormOpen(false);
                setModalSuccessOpen(true);
                setdcModalSuccess('Master path has been added.');
                break;
            case "edit":
                await putService(`/master/asset/config-master-path-edit/${selectedId}`, data);
                setFormOpen(false);
                setModalSuccessOpen(true);
                setdcModalSuccess('Update Successfully.');
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

    const [nodeEditData, setNodeEditData] = useState<any[]>([]);
    const [edgeEditData, setEdgeEditData] = useState<any[]>([]);
    const [pathNo, setPathNo] = useState<any[]>([]);

    const openEditForm = (id: any) => {
        setFormMode('edit');
        // fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setPathNo(filteredData?.path_no)
        // 1. map node
        // const nodeEditOrigin = filteredData?.revised_capacity_path.map((item:any, index:any) => ({
        //     id: item.area_id.toString(),
        //     data: {
        //         label: item.area.name,
        //         id: item.area_id,
        //         color: item.area.color
        //     },
        //     position: {
        //         x: -69 + (index * 100), 
        //         y: 266 + (index * 100)  
        //     },
        //     type: item.revised_capacity_path_type_id === 1 ? "entryNode" : "exitNode",
        //     width: 60, 
        //     height: 60,
        //     selected: false,
        //     positionAbsolute: {
        //         x: -69 + (index * 100), 
        //         y: 266 + (index * 100)  
        //     },
        //     dragging: false
        // }));

        setNodeEditData(filteredData?.revised_capacity_path.map((item: any, index: any) => ({
            id: item.area_id.toString(),
            data: {
                label: item.area.name,
                id: item.area_id,
                color: item.area.color,
            },
            position: {
                x: -69 + (index * 100),
                // y: 266 + (index * 100)
                y: 266
            },
            type: item.revised_capacity_path_type_id === 1 ? "entryNode" : "exitNode",
            width: 60,
            height: 60,
            selected: false,
            positionAbsolute: {
                x: -69 + (index * 100),
                // y: 266 + (index * 100)
                y: 266
            },
            dragging: false
        })))
        setEdgeEditData(filteredData?.revised_capacity_path_edges.map((edge: any) => ({
            source: edge.source_id.toString(),
            sourceHandle: null,
            target: edge.target_id.toString(),
            targetHandle: null,
            id: `reactflow__edge-${edge.source_id}-${edge.target_id}`
        })))
        setShowDiv2(true);
    };

    const openViewForm = (id: any) => {

    };

    const [nodeData, setNodeData] = useState<any[]>([]);
    const [edgeData, setEdgeData] = useState<any[]>([]);
    const [showDiv2, setShowDiv2] = useState(false);
    const [modeForm, setModeForm] = useState('');
    const [isEditDup, setIsEditDup] = useState(false); // เอาไว้เช็คว่ากด dup มาแล้วแก้ไขหรือยัง

    const handleCreateClick = () => {
        setModeForm('create');
        setShowDiv2(true);
    };

    const handleCancelClick = () => {
        setNodeEditData([])
        setEdgeEditData([])
        setSelectedId(null)
        setShowDiv2(false)
    };

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const checkRes = async (res: any, mode: 'create' | 'update') => {
        if (res?.response?.data?.status === 400) {
            setFormOpen(false);
            setModalErrorMsg(res?.response?.data?.error);
            setModalErrorOpen(true)
        } else {
            setFormOpen(false);
            setNodeEditData([]);
            setEdgeEditData([]);
            setSelectedId(null);
            setModalSuccessOpen(true);
            if (mode == 'create') {
                setdcModalSuccess('Master path has been added.');
            } else if (mode == 'update') {
                setdcModalSuccess('Update Successfully.');
            }
            await fetchData();
            if (resetForm) resetForm(); // reset form
            setShowDiv2(false)
        }
    }

    // #region POST
    const postDataFunc = async () => {
        const dataPost = {
            nodes: nodeData.map((node: any) => ({
                id: parseInt(node.id),
                // label: node.data.label 
            })),
            edges: edgeData.map((edge: any) => ({
                source_id: parseInt(edge.source),
                target_id: parseInt(edge.target)
            }))
        };

        // let data_post_indexed = prioritizeNodeWithEntryExit(dataPost, areaMaster?.data)
        // let check_have_both_entry_exit = checkEntryExitNodes(dataPost, areaMaster?.data);
        let data_post_indexed = prioritizeNodeWithEntryExit(dataPost, dataAreaMaster)
        let check_have_both_entry_exit = checkEntryExitNodes(dataPost, dataAreaMaster);

        // ห้ามสร้าง path ซ้ำ
        // New / Duplicate จะต้องเช็คกับข้อมูล Master Path ที่สร้างไว้ก่อนหน้าแล้ว จะต้องสร้างไม่ได้ (ในความหมายนี้คือ ห้ามเหมือนกันทุกตัว ถ้าเหมือนกับตัวที่เคยสร้างไปแล้วจะต้องบันทึกไม่ได้) https://app.clickup.com/t/86euzxxte
        const nodeIdsCreate = dataPost?.nodes.map((node: any) => node.id);
        const res_is_dup = hasMatchingNodeIds(dataTable, nodeIdsCreate);

        if (dataPost?.edges?.length <= 0 || dataPost?.nodes?.length <= 0 || !check_have_both_entry_exit) {
            // node not exist
            setisModalError(true)
        } else if (res_is_dup && (modeForm === 'create' || modeForm === 'duplicate')) {
            // node ซ้ำกับของเดิม
            setErrorMsg(<div>
                <div className="text-center">
                    {"Config Master Path cannot be save."}
                </div>
                <div className="text-center">
                    {"Duplicate path."}
                </div>
            </div>)
            setisModalError(true)
        } else {
            const nodeCount = dataPost?.nodes?.length;
            const edgeCount = dataPost?.edges?.length;
            const sortedDataPost = sortDataPostByEdges(dataPost);

            // Check if there are more than 1 node and fewer edges than nodes
            if (nodeCount > 1 && edgeCount < nodeCount - 1) {
                // edge missing
                setisModalError(true)
                // alert("The number of edges is less than the number of nodes, more than 1 edge required.");
            } else {
                // Validation passed.
                if (modeForm === 'edit') {
                    const res_edit = await putService(`/master/asset/config-master-path-edit/${selectedId}`, data_post_indexed);
                    checkRes(res_edit, 'update');
                } else if (modeForm === 'create') {
                    const res_create = await postService('/master/asset/config-master-path-create', sortedDataPost);
                    checkRes(res_create, 'create')
                } else if (modeForm === 'duplicate') {
                    const res_update = await postService('/master/asset/config-master-path-create', sortedDataPost);
                    checkRes(res_update, 'create')
                }
            }
        }
    }

    const [mdStatOpen, setMdStatOpen] = useState(false);
    const [formUpdateData, setFormUpdateData] = useState<any>();
    const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false);

    const openStatUpdate = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable?.find((item: any) => item?.id === id);

        setFormUpdateData(filteredData)
        setPathNo(filteredData?.path_no)
        setMdStatOpen(true)
    };

    const handleFormSubmitUpdate = async (data: any) => {

        setIsLoadingModal(true);


        const dataPost = {
            "active": data.status === "1" ? true : false,
        }
        await patchService(`/master/asset/config-master-path-status/${selectedId}`, dataPost);
        await fetchData();
        setMdStatOpen(false);

        setTimeout(() => {
            if (resetForm) resetForm();
            setdcModalSuccess('Update Successfully.');
            setModalSuccessOpen(true);
            setIsLoadingModal(false);
        }, 200);
    }

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'path_no', label: 'Path No.', visible: true },
        { key: 'revised_cap', label: 'Revised Capacity Path', visible: true },
        // { key: 'start_date', label: 'Start Date', visible: true },
        // { key: 'end_date', label: 'End Date', visible: true },
        { key: 'create_by', label: 'Created by', visible: true },
        // { key: 'update_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

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

    const [dcModalSuccess, setdcModalSuccess] = useState<any>('');

    const openStatFunc = (id: any, data?: any) => {
        openStatUpdate(id);
        setOpenPopoverId(null);
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "status",
                header: "Status",
                align: 'center',
                enableSorting: false,
                accessorFn: (row: any) => row?.active || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    const value = row?.active;
                    return (
                        <div>
                            <label className="relative inline-block w-11 h-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    className="sr-only peer"
                                    onClick={() => {
                                        openStatFunc(row?.id)
                                    }}
                                />
                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                            </label>
                        </div>
                    )
                },
            },
            {
                accessorKey: "path_no",
                header: "Path No.",
                enableSorting: true,
                accessorFn: (row: any) => row?.path_no || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.path_no ? row?.path_no : ''}</div>
                    )
                }
            },
            {
                accessorKey: "revised_cap",
                header: "Revised Capacity Path",
                enableSorting: true,
                accessorFn: (row: any) => {
                    return row?.revised_capacity_path?.map((item: any) => item?.area?.name).join(', ') || '';
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex px-2 py-1 items-center">
                            {row?.revised_capacity_path?.map((item: any, index: any) => (
                                <React.Fragment key={item.id}>
                                    <div
                                        className={`flex justify-center items-center`}
                                        style={{
                                            backgroundColor: item?.area?.color,
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: item?.revised_capacity_path_type_id === 1 ? '4px' : '50%',
                                        }}
                                    >
                                        {/* <span className="text-white">{item?.area?.name}</span> */}
                                        {/* <span className={`${item?.revised_capacity_path_type_id === 1 ? 'text-white' : 'text-black'} text-[13px]`}>{item?.area?.name}</span> */}
                                        <span className={`text-black text-[13px]`}>{item?.area?.name}</span>
                                    </div>

                                    {index < row?.revised_capacity_path?.length - 1 && (
                                        <span className="text-gray-500">{'→'}</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
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
            {
                accessorKey: "action",
                id: 'actions',
                header: "Action",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            disable={!userPermission?.f_edit && !userPermission?.f_create ? true : false}
                        />
                    )
                }
            },
        ], [dataTable, userPermission, user_permission]
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
                setModeForm('view');
                setAnchorPopover(null);
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                setModeForm('edit');
                setAnchorPopover(null);
                break;
            case "duplicate":
                openEditForm(id);
                setOpenPopoverId(null);
                setModeForm('duplicate');
                setAnchorPopover(null);
                break;
            case "update_stat":
                openStatUpdate(id);
                setOpenPopoverId(null);
                setAnchorPopover(null);
                break;
        }
    }

    return (
        <div className=" space-y-2">
            {!showDiv2 && (<>
                <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                    <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                        <InputSearch
                            id="searchEntry"
                            label="Entry Point"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchEntry}
                            onChange={(e) => setSrchEntry(e.target.value)}
                            options={areaEntry?.map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item.name
                            }))}
                        />

                        <InputSearch
                            id="searchExit"
                            label="Exit Point"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchExit}
                            onChange={(e) => setSrchExit(e.target.value)}
                            options={areaExit?.map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item.name
                            }))}
                        />

                        <InputSearch
                            id="searchStat"
                            label="Status"
                            type="select-multi-checkbox"
                            value={srchStatus}
                            onChange={(e) => setSrchStatus(e.target.value)}
                            options={[
                                { value: "1", label: "Active" },
                                { value: "2", label: "Inactive" },
                            ]}
                        />

                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                        <BtnReset handleReset={handleReset} />
                    </aside>
                    <aside className="mt-auto ml-1 w-full sm:w-auto">
                        <div className="flex flex-wrap gap-2 justify-end">
                            <BtnAddNew openCreateForm={handleCreateClick} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
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
                            path="dam/config-master-path"
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

            </>
            )}

            {showDiv2 && (
                <div
                    className="p-2 rounded-xl flex justify-between"
                    style={{ height: '70vh' }}
                >
                    <div style={{ height: '70vh' }} className='flex pt-4 w-full'>
                        {/* <MasterPathFlow /> */}
                        <div className="flex-1">
                            <div className='flex justify-between items-center'>
                                <div className='font-bold text-[#58585A]'>
                                    {/* {`New Config Master Path`} */}
                                    <div>{`${modeForm === "edit" ? 'Edit' : modeForm === "create" ? 'New' : 'Duplicate'} Config Master Path`}</div>
                                    {
                                        modeForm === "edit" && <div className='text-sm '>{`Path No. ${pathNo}`}</div>
                                    }
                                </div>

                                <div className="flex space-x-2 pt-6 ">
                                    <button
                                        type="button"
                                        // onClick={() => {setShowDiv2(false)}}
                                        onClick={handleCancelClick}
                                        className="w-[150px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                    >
                                        {`Cancel`}
                                    </button>

                                    {/* เมื่อ duplicate มาถ้าไม่ได้แก้ไขอะไรไม่ควรกด "save" ได้ (สีเทา) https://app.clickup.com/t/86erpqyk3 */}

                                    <button
                                        type="button"
                                        onClick={postDataFunc}
                                        disabled={!isEditDup && modeForm === "duplicate"}
                                        className={`w-[150px] font-light py-2 rounded-lg focus:outline-none ${!isEditDup && modeForm === "duplicate"
                                            ? "bg-gray-400 cursor-not-allowed" // Disabled state
                                            : "bg-[#00ADEF] text-white hover:bg-blue-600 focus:bg-blue-600"
                                            }`}
                                    >
                                        {`Save`}
                                    </button>

                                </div>
                            </div>
                            <MasterPathFlow
                                entryExitMaster={entryExitMaster?.data}
                                setNodeData={setNodeData}
                                setEdgeData={setEdgeData}
                                nodeEditData={nodeEditData}
                                edgeEditData={edgeEditData}
                                setIsEditDup={setIsEditDup}
                            />
                        </div>
                    </div>
                </div>
            )}

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Master path has been added."
                description={dcModalSuccess}
            />

            <ModalComponent
                open={isModalError}
                handleClose={() => {
                    setisModalError(false);
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                // description={
                //     <div>
                //         <div className="text-center">
                //             {"Config Master Path cannot be save."}
                //         </div>
                //         <div className="text-center">
                //             {"Invalid data."}
                //         </div>
                //     </div>
                // }
                description={ErrorMsg}
                stat="error"
            />

            <ModalUpdateStat
                data={formUpdateData}
                pathNo={pathNo}
                // dataRole={dataMdRole}
                open={mdStatOpen}
                onClose={() => {
                    setMdStatOpen(false);
                    if (resetForm) resetForm();

                    setTimeout(() => {
                        setSelectedId(null);
                        setFormUpdateData(null)
                        setPathNo([])
                    }, 300);
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
                isLoading={isLoadingModal}
                setisLoading={setIsLoadingModal}
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
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("update_stat", openPopoverId) }}><CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Update Status`}</li>
                        }
                        {
                            userPermission?.f_create && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("duplicate", openPopoverId) }}><ContentCopyIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Duplicate`}</li>
                        }
                    </ul>
                </div>
            </Popover>

        </div>
    );
};

export default ClientPage;
