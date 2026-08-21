"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, iconButtonClass, toDayjs } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import ModalFiles from "./form/modalFiles";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import ModalComment from "./form/modalComment";
import BtnAddNew from "@/components/other/btnAddNew";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import ModalViewGroup from "./form/modalViewGroup";
import ModalViewPoint from "./form/modalViewPoint";
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useSearchParams } from "next/navigation";

dayjs.extend(isSameOrBefore);


// modal update stat
// accept = 2
// reject = 3
interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    // const {
    //     params: { lng },
    // } = props;
    // const { t } = useTranslation(lng, "mainPage");

    const searchParams = useSearchParams();
    const status_from_somewhere_else = searchParams.get("status");

    const [useParams, setuseParams] = useState<boolean>(false);

    const daily_adjust_stat = [
        {
            "id": 1,
            "name": "Submitted",
            "color": "#D0E5FD"
        },
        {
            "id": 2,
            "name": "Approved",
            "color": "#C2F5CA"
        },
        {
            "id": 3,
            "name": "Rejected",
            "color": "#FFF1CE"
        }
    ]

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
            //     const permission = findRoleConfigByMenuName('Daily Adjustment', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Daily Adjustment', userDT)
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
    const { entryExitMaster, areaMaster, nominationPointData, nominationTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {

        if (!nominationPointData?.data) {
            dispatch(fetchNominationPoint());
        }
        if (forceRefetch || !nominationTypeMaster?.data) {
            dispatch(fetchNominationType());
        }
        if (forceRefetch || !entryExitMaster?.data) {
            dispatch(fetchEntryExit());
        }
        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }
        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, nominationPointData, forceRefetch, nominationTypeMaster, entryExitMaster, areaMaster]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    // const [srchStartDate, setSrchStartDate] = useState<any>(null);
    const [srchStartDate, setSrchStartDate] = useState<any>(toDayjs().toDate());
    const [srchStatus, setSrchStatus] = useState<any>([]);

    const handleFieldSearch = async () => {
        setIsLoading(false)
        let _data: any = dataTable
        const searchDate = toDayjs(srchStartDate).tz("Asia/Bangkok").format("YYYY-MM-DD");
        let apiUrl = `/master/daily-adjustment`;
        if (searchDate && searchDate != 'Invalid Date') {
            apiUrl += `?gas_day=${searchDate}`;
        }
        const res_ = await getService(apiUrl)
        const responseData = (res_ && Array.isArray(res_)) ? res_ : [];
        // const filteredRes = responseData.filter((item: any) =>
        //     item?.daily_adjustment_group?.some((group: any) => group.group_id === userDT?.account_manage?.[0]?.group_id)
        // );

        if (Array.isArray(srchShipper) && srchShipper.length > 0) {
            // let filtered_shipper = dataTable.filter((item: any) =>
            // let filtered_shipper = filteredRes?.filter((item: any) =>
            let filtered_shipper = responseData.filter((item: any) =>
                Array.isArray(item?.daily_adjustment_group) &&
                item.daily_adjustment_group.some((group: any) =>
                    srchShipper.includes(group.group_id)
                )
            );
            _data = filtered_shipper;
        }
        else if (searchDate && searchDate != 'Invalid Date') {
            _data = responseData;
        }


        const result_2 = _data.filter((item: any) => {
            const gasDay = toDayjs(item?.gas_day).format("YYYY-MM-DD");

            return (
                (srchStartDate ? searchDate == gasDay : true) &&
                // (srchStatus ? item?.daily_adjustment_status_id.toString() == srchStatus : true)

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                ((srchStatus && srchStatus.length > 0) ? srchStatus.includes(item?.daily_adjustment_status_id.toString()) : true)
            );
        });

        setCurrentPage(1)
        setData(res_);
        setFilteredDataTable(result_2);

        setTimeout(() => {
            setIsLoading(true)
        }, 300);
    };

    const handleReset = async () => {
        setSrchShipper([]);
        setSrchStatus([])
        // setSrchStartDate(null)
        setSrchStartDate(toDayjs().toDate())
        fetchData(); // Daily Adjustment กดเข้ามา Filter Gas Day > Reset Filter > แล้วกด Filter อีกรอบเลย มัน Filter ไม่ได้
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        const filtered = dataTable.filter(
            (item: any) => {
                return (
                    // item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.daily_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.time?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.daily_adjustment_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    // item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // item?.nomination_type?.document_type?.replace(/\s+/g, '')?.toLowerCase().trim().includes(queryLower) ||

                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    formatTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatDateNoTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    // item?.maximum_capacity?.toString().toLowerCase().includes(queryLower) ||
                    (item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

                    (item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [isInclude, setIsInclude] = useState<any>(false);

    const fetchData = async () => {
        try {
            // กรณี shipper เข้ามาเห็นของตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper([userDT?.account_manage?.[0]?.group?.id])
            }

            let apiUrl = `/master/daily-adjustment`;
            // let apiShipperDataUrl = `/master/daily-adjustment/shipper-data?excludeReverseBal=false`;
            let apiShipperDataUrl = `/master/daily-adjustment/shipper-data`;
            const searchDate = toDayjs(srchStartDate).tz("Asia/Bangkok").format("YYYY-MM-DD");
            if (searchDate && searchDate != 'Invalid Date') {
                apiUrl += `?gas_day=${searchDate}`;
                apiShipperDataUrl += `?gas_day=${searchDate}`;
            }
            const res_ = await getService(apiUrl)

            const filteredRes = res_?.filter((item: any) =>
                item?.daily_adjustment_group?.some((group: any) => group.group_id === userDT?.account_manage?.[0]?.group_id)
            );

            const genFilterURL = (data: any) => {
                if (!useParams) {
                    const status: any = status_from_somewhere_else;
                    const findStatusMaster: any = daily_adjust_stat?.find((item: any) => item?.name == status)?.id;
                    const resultFilter = data?.filter((item: any) => {
                        return (
                            (findStatusMaster ? item?.daily_adjustment_status_id.toString() == findStatusMaster : true)
                        );
                    });
                    return resultFilter
                }

                return data
            }

            // เพิ่ม Default Filter Gas Day เป็น Today https://app.clickup.com/t/86etzch94
            const today = toDayjs().format("YYYY-MM-DD");

            // case SHIPPER
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                const filter_today = res_?.filter((item: any) => {
                    const row_gas_day = toDayjs(item.gas_day).format("YYYY-MM-DD")
                    return row_gas_day == today
                });

                let result: any = status_from_somewhere_else ? genFilterURL(filter_today) : filter_today;

                setData(filteredRes);
                setFilteredDataTable(result);
                setDataExport(result);
                // setFilteredDataTable(filteredRes);
            } else {
                // case TSO, OTHER, SUPER ADMIN
                const filter_today = res_?.filter((item: any) => {
                    const row_gas_day = toDayjs(item.gas_day).format("YYYY-MM-DD")
                    return row_gas_day == today
                });

                let result: any = status_from_somewhere_else ? genFilterURL(filter_today) : filter_today;

                setData(res_);
                setFilteredDataTable(result);
                setDataExport(result);
            }

            if (status_from_somewhere_else && !useParams) {
                const status: any = status_from_somewhere_else;
                const findStatusMaster: any = daily_adjust_stat?.find((item: any) => item?.name == status)?.id;
                setSrchStatus(findStatusMaster?.toString());
                setuseParams(true);
            }

            const res_shipper_approve = await getService(apiShipperDataUrl);
            if(Array.isArray(res_shipper_approve)) {
            if (userDT?.account_manage?.[0]?.user_type_id == 3) { // shipper
                // เช็คว่า userDT?.account_manage?.[0]?.group?.id มีอยู่ใน data_group อ้ะป่าว
                const targetGroupId = userDT?.account_manage?.[0]?.group?.id;
                const existsInGroup = res_shipper_approve?.some((group: any) => group.id === targetGroupId);
                setIsInclude(existsInGroup)
                if(!existsInGroup && userDT?.account_manage?.[0]?.group?.id && userDT?.account_manage?.[0]?.group?.name ){
                    res_shipper_approve.push({ id: userDT?.account_manage?.[0]?.group?.id, name: userDT?.account_manage?.[0]?.group?.name })
                }
            }

            setDataShipper(res_shipper_approve);
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
    }, [resetForm]);

    // ############# RE-GENERATE  #############
    // const [dataRegen, setDataReGen] = useState<any>([]);
    // const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    // const handleCloseModal = () => setModalSuccessOpen(false);
    const handleCloseModal = () => {
        fetchData();
        setTimeout(() => {
            setModalSuccessOpen(false);
        }, 500);
    }
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);

    const [mdUpdateOpen, setMdUpdateOpen] = useState(false);
    const [mdUpdateMode, setMdUpdateMode] = useState<any>();

    const handleFormSubmit = async (data: any) => {

        const currentTime = toDayjs().format("HH:mm");
        const today = toDayjs().format("YYYY-MM-DD");
        const gasDay = data.gas_day; // Assuming gas_day is in "YYYY-MM-DD" format
        const selectedTime = `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`;

        // Check if gas_day is today and if the selected time has passed
        if ((userDT?.account_manage?.[0]?.user_type_id == 3) && gasDay === today && currentTime > selectedTime) {
            setModalErrorMsg('The Daily adjustment exceeds the selected time. Please select the next time period.');
            setModalErrorOpen(true);
            return;
        }

        let body_post = {
            ...data, // Keep existing properties
            time: `${String(data.hour).padStart(2, '0')}:${String(data.minute).padStart(2, '0')}`, // Convert hour and minute to "HH:MM"
            nom: data?.rows?.map((row: any) => ({
                nomination_point_id: row.nomination_point_id,
                nomination_point: row.nomination_point, // Ensure this field exists in the original object
                heating_value: row.heating_value,
                valumeMMSCFD: row.unit2 == "MMBTU/D" ? `${row.volume}` : null, // ถ้าเลือก D ตัว H ต้องเป็น null
                valumeMMSCFH: row.unit2 == "MMBTU/H" ? `${row.volume}` : null,  // ถ้าเลือก H ตัว D ต้องเป็น null

                // valumeMMSCFD2: row.unit2 === "MMBTU/H" ? (row.volume * 24).toString() : row.volume,
                // valumeMMSCFH2: row.unit2 === "MMBTU/D" ? (row.volume / 24).toString() : row.volume

                // valumeMMSCFD2: row.unit2 == "MMBTU/D" ? formatNumberThreeDecimal(row.cal_volume).toString() : null,
                // valumeMMSCFH2: row.unit2 == "MMBTU/H" ? formatNumberThreeDecimal(row.cal_volume).toString() : null

                valumeMMSCFD2: row.unit2 == "MMBTU/D" ? row.cal_volume.toString() : null,
                valumeMMSCFH2: row.unit2 == "MMBTU/H" ? row.cal_volume.toString() : null
            }))
        };

        delete body_post.hour;
        delete body_post.minute;
        delete body_post.rows;

        switch (formMode) {
            case "create":

                const res_create = await postService('/master/daily-adjustment/create', body_post);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Daily Adjustment Submitted.')
                    setModalSuccessOpen(true);
                }
                break;
        }

        await fetchData();

        setTimeout(async () => {
            await handleFieldSearch();
        }, 400);

        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
    };

    // update stat
    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable?.find((item: any) => item.id === id);
        setMdUpdateMode('update');
        setFormData(filteredData);
        setMdUpdateOpen(true);
    };

    const handleFormSubmitUpdate = async (data: any) => {

        const dataPost = {
            "status": Number(data.status),
            "reason": data.reason
        }
        const res_update = await putService(`/master/daily-adjustment/update-status/${formData?.id}`, dataPost);
        await fetchData();
        setModalSuccessMsg('Status has been updated.')
        if (resetForm) resetForm();
        setMdUpdateOpen(false);
        setModalSuccessOpen(true);
    }

    // view
    const openViewForm = (id: any) => {
        const filteredData = dataTable?.find((item: any) => item.id === id);
        setMdUpdateMode('view');
        setFormData(filteredData);
        setMdUpdateOpen(true);
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
            const response: any = await getService(`/master/account-manage/history?type=upload-template-for-shipper&method=all&id_value=${id}`);

            const valuesArray = response?.map((item: any) => item.value);

            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "group.name", title: "Shipper Name" },
                { key: "contract_code.contract_code", title: "Contract Code" },
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

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);
    // const openAllFileModal = (id?: any, data?: any) => {
    //      
    //     const filtered = dataTable?.find((item: any) => item.id === id);
    //     setDataFile(filtered)
    //     setMdFileView(true)
    // };

    // ############### MODAL GROUP VIEW ###############
    const [mdShipperView, setMdShipperView] = useState<any>(false);
    const [dataShipperModal, setDataShipperModal] = useState<any>([]);

    // #region openShipperModal
    const openShipperModal = async (id?: any, group_data?: any, data?: any) => {
        const res_ = await getService(`/master/daily-adjustment`)
        const filtered = res_?.find((item: any) => item.id === id);

        setDataShipperModal(filtered)
        setMdShipperView(true)
    };

    // ############### REASON VIEW ###############
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
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])


    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'time', label: 'Time', visible: true },
        { key: 'daily_adjustment_code', label: 'Daily Adjustment Code', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'reasons', label: 'Reasons', visible: true },
        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'document_type', label: 'Document Type', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
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

    const [dataExport, setDataExport] = useState<any>([]);
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

    useEffect(() => {
        // let apiUrl = `/master/daily-adjustment/shipper-data?excludeReverseBal=false`;
        let apiUrl = `/master/daily-adjustment/shipper-data`;
        if(srchStartDate){
            const gasDay = toDayjs(srchStartDate);
            if(gasDay.isValid()){
                apiUrl += `?gas_day=${gasDay.format('YYYY-MM-DD')}`;
                getService(apiUrl).then((res_shipper_approve: any) => {
                    if(Array.isArray(res_shipper_approve)) {
                        if (userDT?.account_manage?.[0]?.user_type_id == 3) { // shipper
                            // เช็คว่า userDT?.account_manage?.[0]?.group?.id มีอยู่ใน data_group อ้ะป่าว
                            const targetGroupId = userDT?.account_manage?.[0]?.group?.id;
                            const existsInGroup = res_shipper_approve?.some((group: any) => group.id === targetGroupId);
                            setIsInclude(existsInGroup)
                            if(!existsInGroup && userDT?.account_manage?.[0]?.group?.id && userDT?.account_manage?.[0]?.group?.name ){
                                res_shipper_approve.push({ id: userDT?.account_manage?.[0]?.group?.id, name: userDT?.account_manage?.[0]?.group?.name })
                            }
                        }
                        else{
                            if(Array.isArray(srchShipper)){
                                const newFilterShipper = srchShipper.filter(id => res_shipper_approve.some((group: any) => group.id === id))
                                setSrchShipper(newFilterShipper)
                            }
                            else if (!res_shipper_approve.some((group: any) => group.id === srchShipper)){
                                setSrchShipper([])
                            }
                        }
                        setDataShipper(res_shipper_approve);
                    } else {
                        setDataShipper([]);
                    }
                });
            }
        }
    }, [srchStartDate])

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                accessorFn: (row: any) => row?.daily_adjustment_status?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div
                            className="flex min-w-[130px] max-w-[190px] w-auto text-center justify-center rounded-full p-1 text-[#464255]"
                            style={{ backgroundColor: String(row?.daily_adjustment_status?.color) }}
                        >
                            {row?.daily_adjustment_status?.name}
                        </div>
                    )
                }
            },
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.gas_day) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "time",
                header: "Time",
                enableSorting: true,
                accessorFn: (row: any) => row?.time || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.time ? row?.time : ''}</div>
                    )
                }
            },
            {
                accessorKey: "daily_adjustment_code",
                header: "Daily Adjustment Code",
                enableSorting: true,
                accessorFn: (row: any) => row?.daily_code || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.daily_code ? row?.daily_code : ''}</div>
                    )
                }
            },
            // {
            //     accessorKey: "shipper_name",
            //     header: "Shipper Name",
            //     enableSorting: false,
            //     accessorFn: (row: any) => '',
            //     align: 'center',
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (
            //             row?.daily_adjustment_group?.length == 1 ?
            //                 row?.daily_adjustment_group[0]?.group?.company_name + " " + `(${row?.daily_adjustment_group[0]?.group?.name})`
            //                 :
            //                 <div className="inline-flex items-center justify-center relative">
            //                     <button
            //                         type="button"
            //                         className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
            //                         onClick={() => openShipperModal(row?.id, row?.daily_adjustment_group, row)}
            //                         disabled={!userPermission?.f_view}
            //                     >
            //                         <PeopleAltRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
            //                     </button>
            //                     <span className="px-2 text-[#464255]">
            //                         {row?.daily_adjustment_group?.length}
            //                     </span>
            //                 </div>
            //         )
            //     }
            // },
            {
                id: 'shipper_name',
                header: 'Shipper Name',
                // ทำสตริงสำหรับค้นหา (single = "Company (Group)"; multi = "Company1 (G1) | Company2 (G2)")
                accessorFn: (row: any) => {
                    const groups = row?.daily_adjustment_group ?? [];
                    if (groups.length === 0) return '';
                    if (groups.length === 1) {
                        const g = groups[0]?.group ?? {};
                        return g.name || ''
                        // return [g.company_name, g.name ? `(${g.name})` : null]
                        //     .filter(Boolean).join(' ');
                    }
                    return groups
                        .map((x: any) => {
                            const g = x?.group ?? {};
                            return [g.company_name, g.name ? `(${g.name})` : null]
                                .filter(Boolean).join(' ');
                        })
                        .join(' | ');
                },
                // เรนเดอร์ UI ตามเดิม (ไม่กระทบ search)
                cell: (info: any) => {
                    const row = info?.row?.original;
                    return (
                        row?.daily_adjustment_group?.length == 1
                            // ? `${row?.daily_adjustment_group?.[0]?.group?.company_name} (${row?.daily_adjustment_group?.[0]?.group?.name})`
                            ? row?.daily_adjustment_group?.[0]?.group?.name || ''
                            : (
                                <div className="inline-flex items-center justify-center relative">
                                    <button
                                        type="button"
                                        className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                        onClick={() => openShipperModal(row?.id, row?.daily_adjustment_group, row)}
                                        disabled={!userPermission?.f_view}
                                    >
                                        <PeopleAltRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                                    </button>
                                    <span className="px-2 text-[#464255]">
                                        {row?.daily_adjustment_group?.length}
                                    </span>
                                </div>
                            )
                    );
                },
                enableSorting: false, // คงเดิม
                filterFn: 'includesString',
                enableGlobalFilter: true,
            },
            {
                accessorKey: "reasons",
                header: "Reasons",
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="inline-flex items-center justify-center relative">
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] bg-white rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                onClick={() => openReasonModal(row?.id, row?.daily_adjustment_reason, row)}
                                disabled={!userPermission?.f_view}
                            >
                                <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                className={iconButtonClass}
                                onClick={() => openReasonModal(row?.id, row?.daily_adjustment_reason, row)}
                                disabled={!userPermission?.f_view}
                            >
                                <ChatBubbleOutlineOutlinedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.daily_adjustment_reason?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "created_by",
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
                accessorKey: "updated_by",
                header: "Updated by",
                align: 'center',
                enableSorting: true,
                accessorFn: (row: any) => row?.update_by_account?.first_name || row?.update_by_account?.last_name || formatDateTimeSec(row?.update_date) || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
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
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            // disable={userPermission?.f_view == true && userPermission?.f_edit == true ? false : true}
                            disable={userPermission?.f_view ? false : true}
                        />
                    )
                }
            },
        ],
        [userPermission, user_permission]
    )

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                setAnchorPopover(null);
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null);
                break;
            case "history":
                openHistoryForm(id);
                setOpenPopoverId(null);
                setAnchorPopover(null);
                break;
        }
    }

    const getRowdata: any = (id: any) => {
        const findData: any = dataTable?.find((item: any) => item?.id == id);
        return findData
    }

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* เพิ่ม Default Filter Gas Day เป็น Today  https://app.clickup.com/t/86etzch94 */}
                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        isDefaultToday={true}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        type="select-multi-checkbox"
                        // value={srchShipper}
                        value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id] : srchShipper}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3? true : false}
                        onChange={(e) => {
                            setSrchShipper(e.target.value)
                            // findContractCode(e.target.value, dataShipper)
                        }}
                        options={dataShipper
                            ?.filter((item: any) =>
                                userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true // ถ้าเป็น shipper เอาแค่ของตัวเอง
                            )
                            .map((item: any) => ({
                                value: item.id,
                                label: item.name,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchStatus"
                        label="Status"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={daily_adjust_stat?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">

                        {/* กรณีที่ Shipper Adjust เข้ามา แล้วข้อมูลไม่ขึ้นที่ฝั่ง Shipper  แต่พอเข้ามาดูที่ฝั่ง TSO ตรง Modal Shipper มันขึ้นเป้น 0 https://app.clickup.com/t/86etzch97 */}
                        {/* เพราะ shipper ตัวที่กด ไม่มีใน contract approve เดวทำเป็นถ้าไม่มี shipper ที่ตรงกับตัวเอง ให้ปิดปุ่ม new ไปเลย จะได้กดมาไม่ได้ */}
                        {(() => {
                            const userTypeId = userDT?.account_manage?.[0]?.user_type_id;
                            const canCreate = userPermission?.f_create ?? false;
                            const showBtnAdd = (userTypeId !== 3 || (userTypeId === 3  && isInclude));

                            return showBtnAdd ? (
                                <BtnAddNew
                                    openCreateForm={openCreateForm}
                                    textRender="New"
                                    can_create={canCreate}
                                />
                            ) : null;
                        })()}

                        {/* <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} /> */}
                    </div>
                </aside>
            </div>

            {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>

                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="nomination/daily-adjustment"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                        />
                    </div>
                </div>

                <TableNomDailyAdjustment
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openAllFileModal={openAllFileModal}
                    openShipperModal={openShipperModal}
                    openReasonModal={openReasonModal}
                    setDataReGen={setDataReGen}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                    userDT={userDT}
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
                        path="nomination/daily-adjustment"
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
                dataTable={dataTable}
                dataShipper={dataShipper}
                entryExitMasterData={(entryExitMaster?.data || []).filter((item: any) => !(process.env.NEXT_PUBLIC_DISABLE_ENTRY_EXIT_IN_NEW_DAILY_ADJUSTMENT || '').toLowerCase().includes(item?.name?.toLowerCase()))}
                nominationPointData={nominationPointData?.data?.filter((item: any) => {
                    // Initialize flags to track start and end date validity
                    let isStart = false
                    let isEnd = false
                    // Parse the start date using dayjs
                    let startDate = toDayjs(item.start_date);
                    // Check if start date is valid and if it's today or in the past
                    if (startDate.isValid()) {
                        startDate = startDate.startOf('day')
                        isStart = startDate.isSameOrBefore(toDayjs().startOf('day'))
                    }
                    // Check if end date exists and validate it
                    if (item.end_date) {
                        let endDate = toDayjs(item.end_date);
                        if (endDate.isValid()) {
                            endDate = endDate.startOf('day')
                            // Check if end date is today or in the past
                            isEnd = endDate.isSameOrBefore(toDayjs().startOf('day'));
                        }
                        else {
                            // If end date is invalid, consider it as ended
                            isEnd = true
                        }
                    }
                    // Return true if the item has started (isStart) but hasn't ended (!isEnd)
                    return isStart && !isEnd;
                })}
                areaMaster={areaMaster?.data}
                nominationTypeMaster={nominationTypeMaster?.data}
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
                description={`${modalModalSuccessMsg}`}
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
                tableType="nom-upload-template-for-shipper"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            <ModalViewGroup
                data={dataShipperModal}
                open={mdShipperView}
                onClose={() => {
                    setMdShipperView(false);
                }}
            />

            <ModalViewPoint
                data={formData}
                // setModalMsg={setModalMsg}
                mode={mdUpdateMode}
                setModalSuccessOpen={setModalSuccessOpen}
                onSubmitUpdate={handleFormSubmitUpdate}
                // setModalSuccessMsg={setModalSuccessMsg}
                open={mdUpdateOpen}
                onClose={() => {
                    setMdUpdateOpen(false);
                }}
            />

            <ModalFiles
                data={dataFile}
                // dataGroup={dataGroup}
                // setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                // setModalSuccessMsg={setModalSuccessMsg}
                open={mdFileView}
                onClose={() => {
                    setMdFileView(false);
                }}
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
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                }}
                className="z-50"
            >
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }

                        {
                            (getRowdata(openPopoverId)?.daily_adjustment_status_id !== 2 && getRowdata(openPopoverId)?.daily_adjustment_status_id !== 3) &&
                            userDT?.account_manage?.[0]?.user_type_id !== 3 && userPermission?.f_edit && getRowdata(openPopoverId) && (
                                <li
                                    className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer"
                                    onClick={() => toggleMenu("edit", openPopoverId)}
                                >
                                    <CheckCircleRoundedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} />
                                    {`Update Status`}
                                </li>
                            )
                        }
                    </ul>
                </div>
            </Popover>
        </div>
    );
};

export default ClientPage;