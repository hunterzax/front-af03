"use client";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import { filterStartEndDateBookingRelease, formatDateNoTime, formatDateNoTimeNoPlusSeven, formatDateTimeNoPlusSeven, formatNumber, formatNumberThreeDecimal, formatNumberThreeDecimalNom, generateUserPermission, removeComma, toDayjs } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { InputSearch } from "@/components/other/SearchForm";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useFetchMasters } from "@/hook/fetchMaster";
import TableReleaseSumMgn from "./form/table";
import ModalComment from "./form/modalComment";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
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
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
                // const permission = findRoleConfigByMenuName('Release/UIOLI Summary Report', userDT)
                // setUserPermission(permission ? permission : updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    // ############### REDUX DATA ###############
    // const { termTypeMaster } = useFetchMasters();
    const { shipperGroupData, zoneMaster, areaMaster } = useFetchMasters();
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
    const [srchGroupName, setSrchGroupName] = useState('');
    const [srchQuery, setSrchQuery] = useState('');
    const [srchArea, setSrchArea] = useState('');
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]); // contract point
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const [isLoading_, setIsLoading_] = useState<boolean>(false);


    const handleFieldSearch = () => {

        const resFilteredShipper = dataTable?.filter((item: any) => {
            return (
                // // (srchType ? item?.term_type?.id == srchType : true) &&
                // (srchShipper ? item?.group_id == srchShipper : true) &&
                // // (srchGroupName ? item?.version?.toLowerCase().includes(srchGroupName.toLowerCase()) : true) &&
                // (srchContractCode ? item?.release_summary_detail?.filter((detail: any) => detail?.temp_contract_point == srchContractCode).length > 0 : true)

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                (srchShipper?.length > 0 ? srchShipper?.includes(item?.group_id) : true) &&
                (srchContractCode?.length > 0 ? item?.release_summary_detail?.filter((detail: any) => srchContractCode.includes(detail?.temp_contract_point)).length > 0 : true)

            );
        });
        const result = resFilteredShipper.map((item: any) => {
            const filteredDate = filterStartEndDateBookingRelease(item.release_summary_detail, srchStartDate, srchEndDate)

            return {
                ...item,
                release_summary_detail: filteredDate
            };
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result);
        handleSearch(srchQuery, result)
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setSrchGroupName('');
        setSrchArea('');
        setSrchShipper([]);
        setSrchContractCode([])

        setFilteredDataTable(dataTable);
        handleSearch(srchQuery, dataTable)
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH NESTED ARRAY ###############
    const handleSearch = (query: string, data?: any[]) => {
        setSrchQuery(query)
        // const lowerCaseQuery = query.replace(/\s+/g, '')?.toLowerCase();
        const lowerCaseQuery = query.trim()?.toLowerCase();
        const Query = query.replace(/\s+/g, '')?.toLowerCase().trim();

        const filtered = (data || dataTable).filter((item: any) => {
            // const filtered = dataEachMonth?.filter((item: any) => {
            // Check if the main item properties match the query
            const mainItemMatches =
                item?.version?.toString().replace(/\s+/g, '').toLowerCase().includes(lowerCaseQuery) ||
                item?.create_by_account?.first_name?.toLowerCase().includes(lowerCaseQuery) ||
                item?.create_by_account?.last_name?.toLowerCase().includes(lowerCaseQuery) ||
                item?.release_type?.name?.toLowerCase().includes(lowerCaseQuery) ||
                item?.contract_code?.contract_code?.toLowerCase().includes(lowerCaseQuery) ||
                item?.group?.name?.toLowerCase().includes(lowerCaseQuery) ||
                item?.start_date?.toLowerCase().includes(lowerCaseQuery) ||
                item?.end_date?.toLowerCase().includes(lowerCaseQuery) ||

                item?.entryContractPoint?.toLowerCase().includes(lowerCaseQuery) ||
                item?.entryContractedMmbtud?.toLowerCase().includes(lowerCaseQuery) ||
                item?.entryContractedMmscfd?.toLowerCase().includes(lowerCaseQuery) ||
                item?.entryReleaseEndDate?.toLowerCase().includes(lowerCaseQuery) ||
                item?.entryReleaseMmbtud?.toLowerCase().includes(lowerCaseQuery) ||
                item?.entryReleaseMmscfd?.toLowerCase().includes(lowerCaseQuery) ||
                item?.entryReleaseStartDate?.toLowerCase().includes(lowerCaseQuery) ||
                item?.exitContractPoint?.toLowerCase().includes(lowerCaseQuery) ||
                item?.exitContractedMmbtud?.toLowerCase().includes(lowerCaseQuery) ||

                item?.exitReleaseEndDate?.toLowerCase().includes(lowerCaseQuery) ||
                item?.exitReleaseMmbtud?.toLowerCase().includes(lowerCaseQuery) ||
                item?.exitReleaseMmscfd?.toLowerCase().includes(lowerCaseQuery) ||
                item?.exitReleaseStartDate?.toLowerCase().includes(lowerCaseQuery) ||

                (item?.release_start_date ? formatDateNoTime(item.release_start_date) : '').replace(/\s+/g, '')?.toLowerCase().trim().includes(Query) ||
                (item?.release_end_date ? formatDateNoTime(item.release_end_date) : '').replace(/\s+/g, '')?.toLowerCase().trim().includes(Query) ||
                (item?.submitted_timestamp ? formatDateTimeNoPlusSeven(item.submitted_timestamp) : '').toLowerCase().includes(lowerCaseQuery);

            // Check if any release_summary_detail property matches the query
            const releaseDetailMatches =
                item?.release_summary_detail?.some((detail: any, index: any) => {

                    return (
                        detail?.temp_contract_point?.toLowerCase().trim().includes(lowerCaseQuery) ||

                        detail?.total_contracted_mmbtu_d?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumber(detail?.total_contracted_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(detail?.total_contracted_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(removeComma(detail?.total_contracted_mmbtu_d))?.toLowerCase().trim().includes(lowerCaseQuery) ||

                        formatNumberThreeDecimal(detail?.total_contracted_mmscfd)?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(removeComma(detail?.total_contracted_mmscfd))?.toLowerCase().trim().includes(lowerCaseQuery) ||

                        detail?.total_release_mmbtu_d?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumber(detail?.total_release_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||

                        formatNumberThreeDecimal(detail?.total_release_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(detail?.total_release_mmbtu_d)?.toLowerCase().trim().includes(formatNumberThreeDecimal(lowerCaseQuery)) ||
                        formatNumberThreeDecimal(detail?.total_release_mmscfd)?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(detail?.total_release_mmscfd)?.toLowerCase().trim().includes(formatNumberThreeDecimal(lowerCaseQuery)) ||

                        formatNumberThreeDecimal(removeComma(detail?.total_release_mmbtu_d))?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(removeComma(detail?.total_release_mmbtu_d))?.toLowerCase().trim().includes(formatNumberThreeDecimal(lowerCaseQuery)) ||
                        formatNumberThreeDecimal(removeComma(detail?.total_release_mmscfd))?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        formatNumberThreeDecimal(removeComma(detail?.total_release_mmscfd))?.toLowerCase().trim().includes(formatNumberThreeDecimal(lowerCaseQuery)) ||

                        detail?.create_date?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        (detail?.release_start_date ? formatDateNoTime(detail.release_start_date) : '').replace(/\s+/g, '')?.toLowerCase().trim().includes(lowerCaseQuery) ||

                        (detail?.release_end_date ? formatDateNoTime(detail.release_end_date) : '').replace(/\s+/g, '')?.toLowerCase().trim().includes(lowerCaseQuery) ||
                        (detail?.release_end_date ? formatDateNoTime(toDayjs(detail.release_end_date).add(1, 'day')) : '')?.toLowerCase().trim().includes(lowerCaseQuery)
                    )
                }
                );

            // Include the item if either the main item or any release detail matches
            return mainItemMatches || releaseDetailMatches;
        });

        // const filteredResult: any = filtered?.map((item: any, idx: any) => {
        //     const itemDetail: any = item?.release_summary_detail?.filter((detail: any) => {
        //         return (
        //             detail?.temp_contract_point?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             detail?.total_contracted_mmbtu_d?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             formatNumber(detail?.total_contracted_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             formatNumberThreeDecimal(detail?.total_contracted_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             detail?.total_release_mmbtu_d?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             formatNumber(detail?.total_release_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             formatNumberThreeDecimal(detail?.total_release_mmbtu_d)?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             formatNumberThreeDecimal(detail?.total_release_mmbtu_d)?.toLowerCase().trim().includes(formatNumberThreeDecimal(lowerCaseQuery)) ||
        //             formatNumberThreeDecimal(detail?.total_release_mmscfd)?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             formatNumberThreeDecimal(detail?.total_release_mmscfd)?.toLowerCase().trim().includes(formatNumberThreeDecimal(lowerCaseQuery)) ||
        //             detail?.create_date?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             (detail?.release_start_date ? formatDateNoTime(detail.release_start_date) : '').replace(/\s+/g, '')?.toLowerCase().trim().includes(lowerCaseQuery) ||

        //             (detail?.release_end_date ? formatDateNoTime(detail.release_end_date) : '').replace(/\s+/g, '')?.toLowerCase().trim().includes(lowerCaseQuery) ||
        //             (detail?.release_end_date ? formatDateNoTime(toDayjs(detail.release_end_date).add(1, 'day')) : '')?.toLowerCase().trim().includes(lowerCaseQuery)
        //         )
        //     })

        //     return { ...item, release_summary_detail: itemDetail }
        // })

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
        handleUpdaleTable(filtered)
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataPathGroup, setDataPathGroup] = useState<any>([]);
    const [latestStartDate, setLatestStartDate] = useState<any>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataEachMonth, setDataEachMonth] = useState<any[]>([]);
    const [isUpdateMutableDataTable, setIsUpdateMutableDataTable] = useState<boolean>(false);

    const fetchData = async () => {
        try {
            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
            }

            const response: any = await getService(`/master/release-uioli-summary-management`);
            const res_contract_point = await getService(`/master/asset/contract-point`);
            if (Array.isArray(res_contract_point)) {
                setDataContract(res_contract_point);
            }

            setData(response);
            setFilteredDataTable(response);
            setIsUpdateMutableDataTable(true)
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

    useEffect(() => {
        if (isUpdateMutableDataTable) {
            setIsUpdateMutableDataTable(false)
            handleFieldSearch()
        }
    }, [isUpdateMutableDataTable])

    const handleUpdaleTable = (newDataTable: any) => {
        if (newDataTable) {
            const newData = newDataTable.map((row: any, index: any) => {
                if (row?.release_summary_detail && row?.release_summary_detail?.length > 0) {
                    const groupedData = (row?.release_summary_detail ?? []).reduce(
                        (acc: any, subRow: any) => {
                            let temp_date = subRow.release_start_date
                            try {
                                temp_date = new Date(subRow.release_start_date).getMonth()
                            } catch (error) {
                                temp_date = subRow.release_start_date
                            }
                            const key = `${row.id}_${subRow.path_management_config_id}_${temp_date}`;
                            if (!acc[key]) {
                                acc[key] = [];
                            }
                            acc[key].push(subRow);
                            return acc;
                        },
                        {}
                    );

                    return Object.entries(groupedData).map(([pathId, subRows]: any, subRowIndex: any) => {
                        return {
                            ...row,
                            key: pathId,
                            subRows: subRows,
                            entryReleaseStartDate: subRows?.length > 0 && subRows[0].release_start_date ? formatDateNoTime(subRows[0].release_start_date) : '',
                            exitReleaseStartDate: subRows?.length > 1 && subRows[1].release_start_date ? formatDateNoTime(subRows[1].release_start_date) : '',
                            entryReleaseEndDate: subRows?.length > 0 && subRows[0].release_end_date ? formatDateNoTime(subRows[0].release_end_date) : '',
                            exitReleaseEndDate: subRows?.length > 1 && subRows[1].release_end_date ? formatDateNoTime(subRows[1].release_end_date) : '',
                            // entryReleaseStartDate: subRows?.length > 0 && subRows[0].release_start_date ? formatDateNoTimeNoPlusSeven(subRows[0].release_start_date) : '',
                            // exitReleaseStartDate: subRows?.length > 1 && subRows[1].release_start_date ? formatDateNoTimeNoPlusSeven(subRows[1].release_start_date) : '',
                            // entryReleaseEndDate: subRows?.length > 0 && subRows[0].release_end_date ? formatDateNoTimeNoPlusSeven(subRows[0].release_end_date) : '',
                            // exitReleaseEndDate: subRows?.length > 1 && subRows[1].release_end_date ? formatDateNoTimeNoPlusSeven(subRows[1].release_end_date) : '',
                            entryContractPoint: subRows?.length > 0 && subRows[0].temp_contract_point,
                            exitContractPoint: subRows?.length > 1 ? subRows[1].temp_contract_point : '',
                            entryContractedMmbtud: subRows?.length > 0 && subRows[0].total_contracted_mmbtu_d && formatNumber(subRows[0].total_contracted_mmbtu_d),
                            exitContractedMmbtud: subRows?.length > 1 && subRows[1].total_contracted_mmbtu_d && formatNumber(subRows[1].total_contracted_mmbtu_d),
                            // entryContractedMmscfd: subRows?.length > 0 && subRows[0].total_contracted_mmscfd && subRows[0].total_contracted_mmscfd !== 'undefined' && subRows[0].total_contracted_mmscfd !== 'null' ? formatNumber(subRows[0].total_contracted_mmscfd) : '-',
                            // exitContractedMmscfd: subRows?.length > 1 && subRows[1].total_contracted_mmscfd && subRows[1].total_contracted_mmscfd !== 'undefined' && subRows[1].total_contracted_mmscfd !== 'null' ? formatNumber(subRows[1].total_contracted_mmscfd) : '-',
                            // entryReleaseMmbtud: subRows?.length > 0 && subRows[0].total_release_mmbtu_d && subRows[0].total_release_mmbtu_d !== 'undefined' && subRows[0].total_release_mmbtu_d !== 'null' ? formatNumber(subRows[0].total_release_mmbtu_d) : '-',
                            // exitReleaseMmbtud: subRows?.length > 1 && subRows[1].total_release_mmbtu_d && subRows[1].total_release_mmbtu_d !== 'undefined' && subRows[1].total_release_mmbtu_d !== 'null' ? formatNumber(subRows[1].total_release_mmbtu_d) : '-',
                            // entryReleaseMmscfd: subRows?.length > 0 && subRows[0].total_release_mmscfd && subRows[0].total_release_mmscfd !== 'undefined' && subRows[0].total_release_mmscfd !== 'null' ? formatNumber(subRows[0].total_release_mmscfd) : '-',
                            // exitReleaseMmscfd: subRows?.length > 1 && subRows[1].total_release_mmscfd && subRows[1].total_release_mmscfd !== 'undefined' && subRows[1].total_release_mmscfd !== 'null' ? formatNumber(subRows[1].total_release_mmscfd) : '-',
                            entryContractedMmscfd: subRows?.length > 0 && subRows[0].total_contracted_mmscfd && subRows[0].total_contracted_mmscfd !== 'undefined' && subRows[0].total_contracted_mmscfd !== 'null' ? formatNumberThreeDecimalNom(subRows[0].total_contracted_mmscfd) : '-',
                            exitContractedMmscfd: subRows?.length > 1 && subRows[1].total_contracted_mmscfd && subRows[1].total_contracted_mmscfd !== 'undefined' && subRows[1].total_contracted_mmscfd !== 'null' ? formatNumberThreeDecimalNom(subRows[1].total_contracted_mmscfd) : '-',
                            entryReleaseMmbtud: subRows?.length > 0 && subRows[0].total_release_mmbtu_d && subRows[0].total_release_mmbtu_d !== 'undefined' && subRows[0].total_release_mmbtu_d !== 'null' ? formatNumberThreeDecimalNom(subRows[0].total_release_mmbtu_d) : '-',
                            exitReleaseMmbtud: subRows?.length > 1 && subRows[1].total_release_mmbtu_d && subRows[1].total_release_mmbtu_d !== 'undefined' && subRows[1].total_release_mmbtu_d !== 'null' ? formatNumberThreeDecimalNom(subRows[1].total_release_mmbtu_d) : '-',
                            entryReleaseMmscfd: subRows?.length > 0 && subRows[0].total_release_mmscfd && subRows[0].total_release_mmscfd !== 'undefined' && subRows[0].total_release_mmscfd !== 'null' ? formatNumberThreeDecimalNom(subRows[0].total_release_mmscfd) : '-',
                            exitReleaseMmscfd: subRows?.length > 1 && subRows[1].total_release_mmscfd && subRows[1].total_release_mmscfd !== 'undefined' && subRows[1].total_release_mmscfd !== 'null' ? formatNumberThreeDecimalNom(subRows[1].total_release_mmscfd) : '-',
                        }
                    })
                }
                return []
            })
            const targetData = newData.reduce((accumulator: any[], value: any) => accumulator.concat(value), [])
            setDataEachMonth(targetData)
        }
    }

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

    const fdInterface: any = {
        id: '',
        mmbtu_d: '',
        mmscfd_d: '',
    };
    const [formData, setFormData] = useState(fdInterface);
    const [formDataInfo, setFormDataInfo] = useState<any>([]);
    const [dataConfirmCap, setDataConfirmCap] = useState<any>();

    const confirmCapacity = async () => {
        let res_create = await postService('/master/release-uioli-summary-management/confirm-capacity', { ...dataConfirmCap, id: formData?.id });
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
        }
    }

    const handleFormSubmit = async (data: any, groupData?: any) => {

        // switch (formMode) {
        //     case "create":

        //         break;
        //     case "edit":

        //         break;
        //     default:
        //         break;
        // }

        await fetchData();
        // if (resetForm) resetForm(); // reset form
    };

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
        setFormMode('release');
        setFormData(id);
        setFormOpen(true);
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

    const openHistoryForm = async (id: any) => {
        try {
            const response: any = await getService(`/master/path-management/path-management-log/${id}`);

            // setHistoryData(response);
            // setHistoryOpen(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

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
        if (dataEachMonth) {
            setPaginatedData(dataEachMonth.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [dataEachMonth, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'release_start_date', label: 'Release Start Date', visible: true },
        { key: 'release_end_date', label: 'Release End Date', visible: true },
        { key: 'submitted_timestamp', label: 'Submitted Timestamp', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'group', label: 'Shipper Name', visible: true },
        { key: 'point', label: 'Point', visible: true },
        { key: 'contracted_mmbtu_d', label: 'Contracted (MMBTU/D)', visible: true },
        { key: 'contracted_mmscfd', label: 'Contracted (MMSCFD)', visible: true },
        { key: 'release_mmbtu_d', label: 'Release (MMBTU/D)', visible: true },
        { key: 'release_mmscfd', label: 'Release (MMSCFD)', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'release_type', label: 'Type', visible: true },
        { key: 'action', label: 'Action', visible: true }
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
                        options={shipperGroupData?.data
                            ?.filter((item: any) => userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true)
                            ?.map((item: any) => ({
                            value: item.id,
                            label: item.name
                        }))}
                    />

                    {/* v1.0.77 ควรเปลี่ยน Area เป็น Contract Point (เฉพาะ Exit) เนื้อจาก area ไม่สามารถใช้ filter ได้ https://app.clickup.com/t/86ereurvn */}
                    <InputSearch
                        id="searchContractPoint"
                        label="Contract Point"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // .filter((item: any) => item.area.name === srchArea)
                        options={dataContract?.filter((item: any) => item.entry_exit_id === 2).map((item: any) => ({
                            value: item.contract_point,
                            label: item.contract_point,
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
                            {/* <BtnGeneral bgcolor={"#24AB6A"} modeIcon={'export'} textRender={"Export"} generalFunc={() => exportToExcel(paginatedData, "release_summary_mgn")} can_export={userPermission ? userPermission?.f_export : false} /> */}
                            <BtnExport textRender={"Export"} data={paginatedData} path="capacity/release-uioli-summary" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>

                <TableReleaseSumMgn
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openViewModal={openViewModal}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    areaMaster={areaMaster}
                    zoneMaster={zoneMaster}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                />
            </div>

            <PaginationComponent
                // totalItems={filteredDataTable?.length}
                totalItems={dataEachMonth?.length}
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
                setDataConfirmCap={setDataConfirmCap}
                setMdConfirmOpen={setMdConfirmOpen}
                open={formOpen}
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
                isLoading={isLoading_}
                setIsLoading={setIsLoading_}
            />

            <ModalComment
                data={dataReason}
                dataMain={dataReasonRow}
                setModalSuccessOpen={setModalSuccessOpen}
                open={mdReasonView}
                onClose={async () => {
                    await fetchData();
                    setMdReasonView(false);
                }}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description="Capacity Value has been confirmed."
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
                        confirmCapacity();
                    }
                    setMdConfirmOpen(false);
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
        </div>
    );
};

export default ClientPage;
