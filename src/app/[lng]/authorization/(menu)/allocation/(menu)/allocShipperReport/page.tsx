"use client";

import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import { Tune } from "@mui/icons-material"
import { getService, postService } from "@/utils/postService";
import SearchInput from "@/components/other/searchInput";
import { Tab, Tabs } from '@mui/material';
import { TabTable } from '@/components/other/tabPanel';
import TableReport from "./form/tableReport";
import TableDownload from "./form/tableDownload";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { exportToExcel, filterNomPointMasterData, filterPointsByShipperId, formatDate, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatTime, generateUserPermission, transformNomPointData, toDayjs, filterByGasDayFromTo, exportALLOShipperREPORT, findRoleConfigByMenuName, mapShipperNames } from "@/utils/generalFormatter";
import PaginationComponent from "@/components/other/globalPagination";
import NodataTable from "@/components/other/nodataTable";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import { useFetchMasters } from "@/hook/fetchMaster";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import Spinloading2 from "@/components/other/spinLoading2";
import { useForm } from "react-hook-form";
import dayjs from "dayjs";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

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
            //     const permission = findRoleConfigByMenuName('Allocation Shipper Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Allocation Shipper Report', userDT)
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
    const { areaMaster, nominationPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const [nomPointMasterData, setNomPointMasterData] = useState<any>([]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, areaMaster]); // Watch for forceRefetch changes

    // remove duplicate by check nominationPointData?.data
    // สำหรับทำ option ให้ filter nom point
    useEffect(() => {
        const uniqueNominationPoints = Array.from(
            new Map(
                (nominationPointData?.data || []).map((item: any) => [item.nomination_point, item])
            ).values()
        );
        setNomPointMasterData(uniqueNominationPoints)
    }, [nominationPointData])

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);
    const [isFilter, setIsFilter] = useState<any>(false);
    const [bodyForApprove, setBodyForApprove] = useState<any>('');
    const [disableApprove, setDisableApprove] = useState(true);
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [sNomPointId, setSNomPointId] = useState<any>([]);
    const [masterNomPoint2, setMasterNomPoint2] = useState<any>([]);
    const [masterNomPoint3, setMasterNomPoint3] = useState<any>([]);

    const handleFieldSearch = async () => {

        if (tabIndex == 0) {
            setIsLoading(false)
            let body_get_service = {
                // (เส้นนี้ช้ามาก เพราะต้องเรียก allocation report eviden แล้ว ต้องไป loop หาใน view eviden เพื่อจะได้ nompoint | แล้วต้องดึง meter อีก )
                // ต้องกรอก nom , shipper, share
                // "start_date": "2025-01-01", // fixed ไว้ ของ mock eviden
                // "end_date": "2025-02-28", // fixed ไว้ ของ mock eviden
                // "skip": "100", // fixed ไว้ ของ mock eviden
                // "limit": "100", // fixed ไว้ ของ mock eviden
                // "nomination_point_arr": [], // ["LMPT1", "LMPT2"]
                // "shipper_arr": [], // ส่ง shipper_id ["NGP-S01-001"]
                // "share": "off" // on คือ แชร์ [ติ้ก], off คือ ไม่แชร์ [ไม่ติ้ก] *** มีผลกับ meter
                "skip": (currentPage - 1) * itemsPerPage,
                "limit": itemsPerPage,
                // "start_date": srchGasDayFrom ? toDayjs(srchGasDayFrom).format("YYYY-MM-DD") : "2025-01-01", // fixed ไว้ ของ mock eviden
                // "end_date": srchGasDayTo ? toDayjs(srchGasDayTo).format("YYYY-MM-DD") : "2025-02-28", // fixed ไว้ ของ mock eviden
                "start_date": srchGasDayFrom ? toDayjs(srchGasDayFrom).format("YYYY-MM-DD") : dayjs().startOf("year").format("YYYY-MM-DD"),
                "end_date": srchGasDayTo ? toDayjs(srchGasDayTo).format("YYYY-MM-DD") : dayjs().endOf("year").format("YYYY-MM-DD"),
                "nomination_point_arr": sNomPointId, // ["LMPT1", "LMPT2"]
                "shipper_arr": srchShipperName, // ส่ง shipper_id ["NGP-S01-001"]
                "share": watch("filter_sharing_meter") ? "on" : "off" // on คือ แชร์ [ติ้ก], off คือ ไม่แชร์ [ไม่ติ้ก] *** มีผลกับ meter
            }
 
            setBodyForApprove(body_get_service)

            try {
                setIsLoading(false)
                let res_ = await postService("/master/allocation/allocation-shipper-report", body_get_service);

                if (Array.isArray(res_)){
                // // Filter Sharing Meter ยังใช้งานไม่ได้ ต้องขึ้นเฉพาะ Nom ที่มีหลาย Shipper https://app.clickup.com/t/86eub6dcw
                // let filtered_share_meter = res_
                // if (watch("filter_sharing_meter")) {
                //     filtered_share_meter = (res_ ?? []).map((day: any) => ({
                //         ...day,
                //         nomPoint: (day?.nomPoint ?? []).filter((p:any) => Array.isArray(p?.data) && p.data.length !== 1),
                //     }));
                // }

                // หา shipper_name จาก id_name แล้วยัดเข้าคีย์เดิม 
                // ระบบต้องแสดงข้อมูลเป็นชื่อ Shipper ซึ่ง ID ของ Shipper ที่แสดงอยู่มันตรงกับ ID ใน DAM แล้ว https://app.clickup.com/t/86ev6zp97
                const result: any = mapShipperNames(res_, dataShipper);
                // const result: any = mapShipperNames(filtered_share_meter, dataShipper);

                setData(result);
                setFilteredDataTable(result);

                // const res_master_point = transformNomPointData(res_)
                const res_master_point = transformNomPointData(result)
                setMasterNomPoint2(res_master_point)

                if (srchGasDayFrom == null || srchGasDayTo == null || sNomPointId?.length <= 0 || srchShipperName?.length <= 0 || res_?.length <= 0) {
                    setDisableApprove(true)
                } else {
                    setDisableApprove(false)
                }

                // setData(data_for_like_search);
                // setFilteredDataTable(data_for_like_search);
                }
            } finally {
                setIsLoading(true);
                setIsFilter(true)
            }
        } else {

            let gas_day_from: any = undefined
            let gas_day_to: any = undefined
            if (srchGasDayFrom) {
                gas_day_from = dayjs(srchGasDayFrom).format("YYYY-MM-DD")
            }

            if (srchGasDayTo) {
                gas_day_to = dayjs(srchGasDayTo).format("YYYY-MM-DD")
            }

            const result = filterByGasDayFromTo(dataTabDownload, gas_day_from, gas_day_to); // filter ช่วงเวลา
            setFilteredDataTableDownload(result)
        }

    };

    const handleReset = () => {
        setSrchGasDayFrom(null)
        setSrchGasDayTo(null)
        setSNomPointId([])
        setSrchShipperName([])
        // setValue("filter_sharing_meter", false)

        setIsFilter(false)
        setDisableApprove(true)

        setFilteredDataTableDownload(dataTabDownload)

        setFilteredDataTable([]);
        setKey((prevKey) => prevKey + 1);
    };

    const findNomPointByShipperId = (id: any) => {

        // กรองเอา point จาก masterNomPoint2 ที่มี shipper.id_name ตรงกับ id
        const filtered = filterPointsByShipperId(masterNomPoint2, id);

        // แล้วเอาผลลัพที่ได้มากรอง nomPointMasterData.nomination_point ที่มีอยู่ใน filtered.point
        const finalResult = filterNomPointMasterData(filtered, nomPointMasterData);

        setMasterNomPoint3(finalResult)
    }

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filteredDataTableDownload, setFilteredDataTableDownload] = useState<any>([]);

    // Version 2
    const handleSearch = (query: string) => {
        const queryLower = query?.replace(/\s+/g, '')?.toLowerCase().trim();

        if (tabIndex == 0) {

            if (query === '') {
                setFilteredDataTable(dataTable);
                return;
            }
            const normalizedQuery = query.replace(/\s+/g, '').toLowerCase();

            const filtered = dataTable?.map((entry: any) => {
                const gasDayMatch = formatDateNoTime(entry.gas_day)?.toLowerCase().includes(normalizedQuery);

                // If gasDay matches, keep the full entry with original structure
                if (gasDayMatch) {
                    return entry;
                }

                // Else, do deeper filtering
                const filteredNomPoints = entry?.nomPoint?.map((point: any) => {
                    const pointTotalMatch = point.total?.toString().toLowerCase().includes(normalizedQuery);
                    const meterValueMatch = point.meterValue?.toString().toLowerCase().includes(normalizedQuery);

                    const pointTotalMatchFormatted = formatNumberFourDecimal(point.total)?.toString().toLowerCase().includes(normalizedQuery);
                    const pointTotalMatchFormattedNoComma = formatNumberFourDecimalNoComma(point.total)?.toString().toLowerCase().includes(normalizedQuery);
                    const meterValueMatchFormatted = formatNumberFourDecimal(point.meterValue)?.toString().toLowerCase().includes(normalizedQuery);
                    const meterValueMatchFormattedNoComma = formatNumberFourDecimalNoComma(point.meterValue)?.toString().toLowerCase().includes(normalizedQuery);

                    const filteredData = point?.data?.filter((dataItem: any) => {
                        return (
                            dataItem.allocatedValue?.toString().toLowerCase().includes(normalizedQuery) ||
                            dataItem.gas_day?.toLowerCase().includes(normalizedQuery) ||
                            formatNumberFourDecimal(dataItem.allocatedValue)?.toString().toLowerCase().includes(normalizedQuery) ||
                            formatNumberFourDecimalNoComma(dataItem.allocatedValue)?.toString().toLowerCase().includes(normalizedQuery)
                            // dataItem.shipper_name?.toLowerCase().includes(normalizedQuery)
                        );
                    });

                    if (
                        pointTotalMatch || meterValueMatch ||
                        pointTotalMatchFormatted || meterValueMatchFormatted || pointTotalMatchFormattedNoComma || meterValueMatchFormattedNoComma ||
                        (filteredData && filteredData.length > 0)
                    ) {
                        return {
                            ...point,
                            data: filteredData,
                        };
                    }

                    return null;
                }).filter(Boolean); // remove nulls


                if (filteredNomPoints?.length > 0) {
                    return {
                        ...entry,
                        // nomPoint: filteredNomPoints,
                    };
                }

                return null;
            }).filter(Boolean); // remove nulls

            setFilteredDataTable(filtered);
        } else {
            if (!queryLower) {
                setFilteredDataTableDownload(dataTabDownload);
                return;
            }

            const filtered = dataTabDownload.filter(
                (item: any) => {
                    return (
                        item?.gas_day_from?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        toDayjs(item?.gas_day_from, "YYYY-MM-DD").format("DD/MM/YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.gas_day_to?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        toDayjs(item?.gas_day_to, "YYYY-MM-DD").format("DD/MM/YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                        item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                        item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                        formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
                        formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
                    )
                }
            );
            setFilteredDataTableDownload(filtered)
        }
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0);
    const [dataTable, setData] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataTabDownload, setDataTabDownload] = useState<any>([]);
    const [tk, settk] = useState<boolean>(false);

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    const fetchData = async () => {
        try {
            setValue('filter_sharing_meter', true)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // DATA TAB DOWNLAOD
            const res_tab_download = await getService(`/master/allocation/allocation-shipper-report-download-get`);
            setDataTabDownload(res_tab_download)
            setFilteredDataTableDownload(res_tab_download)

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

    // #############  APPROVE  #############
    const fetchDataTabDownload = async () => {
        const res_tab_download = await getService(`/master/allocation/allocation-shipper-report-download-get`);
        setDataTabDownload(res_tab_download)
        setFilteredDataTableDownload(res_tab_download)
    }

    const openApproveModal = (id: any, data: any) => {
        setIsLoading(false)

        setTimeout(() => {
            approveAllocationShipperReport();
        }, 2000);

        setTimeout(() => {
            // กด Approved แล้วไม่มีไฟล์ขึ้นต้อง refresh 1 ที ของถึงจะมา https://app.clickup.com/t/86etg09dt
            fetchDataTabDownload();
            setModalSuccessOpen(true);
            setIsLoading(true)
            setTabIndex(1)
        }, 15000); // ยื้อไว้อีกหน่อย
    };

    const approveAllocationShipperReport = async () => {
        let res_ = await postService("/master/allocation/allocation-shipper-report-download", bodyForApprove);
    }

    // ############
    const [headerMap, setHeaderMap] = useState<any>([]);

    useEffect(() => {
        if (filteredDataTable && filteredDataTable.length > 0) {
            const headerStructure: any = extractUniqueShippersAsArray(filteredDataTable)?.sort((a, b) => {
                // ตรวจสอบว่าทั้ง a?.point และ b?.point เป็น string
                const pointA = a?.point || ""; // ใช้ค่าเริ่มต้นเป็น "" ถ้าไม่มี point
                const pointB = b?.point || ""; // ใช้ค่าเริ่มต้นเป็น "" ถ้าไม่มี point

                // การเปรียบเทียบเพื่อจัดเรียง
                if (pointA < pointB) {
                    return -1;  // a มาก่อน b
                }
                if (pointA > pointB) {
                    return 1;   // b มาก่อน a
                }
                return 0;       // ถ้าเท่ากัน
            });

            setHeaderMap(headerStructure);
        }
    }, [filteredDataTable])

    function extractUniqueShippersAsArray(tableData: any) {
        const tempResult: any = {};

        tableData.forEach((entry: any) => {
            entry.nomPoint.forEach((nom: any) => {
                const point = nom?.point;
                nom?.data?.map((item: any) => {
                    let shipperName = item?.shipper_name;

                    if (point && shipperName) {
                        if (!tempResult[point]) {
                            tempResult[point] = new Set();
                        }
                        tempResult[point].add(shipperName);
                    }
                });
            });
        });

        // แปลงจาก object เป็น array ตามรูปแบบที่ต้องการ
        const finalResult = Object.entries(tempResult).map(([point, shippersSet]: any) => ({
            point,
            shippers: Array.from(shippersSet)
        }));

        return finalResult;
    }

    const generateInitialColumnsDownload = (headerMap: any[]): any[] => {
        const columns: any[] = [
            { key: 'gas_day', label: 'Gas Day', visible: true },
        ];

        headerMap.forEach((point: any) => {
            columns.push({
                key: `${point?.point}`,
                label: `${point?.point}`,
                visible: true,
            });
            point?.shippers?.sort((a: any, b: any) => {
                const pointA = a || "";
                const pointB = b || "";

                if (pointA < pointB) {
                    return -1;
                }
                if (pointA > pointB) {
                    return 1;
                }
                return 0;
            })?.forEach((shipper: string) => {
                columns.push({
                    key: `${point?.point}-${shipper}`,
                    label: `${point?.point} / ${shipper}`,
                    visible: true,
                    parent_id: point?.point
                });
            });

            columns.push({
                key: `${point?.point}-total`,
                label: `${point?.point} / Total`,
                visible: true,
                parent_id: point?.point
            });

            columns.push({
                key: `${point?.point}-meter`,
                label: `${point?.point} / Metering`,
                visible: true,
                parent_id: point?.point
            });
        });

        return columns;
    };
    const initialColumnsReport = generateInitialColumnsDownload(headerMap);

    // Sync visibility state when headerMap changes
    useEffect(() => {
        const newColumns = generateInitialColumnsDownload(headerMap);
        setColumnVisibility(
            Object.fromEntries(newColumns.map((col: any) => [col.key, col.visible]))
        );
    }, [headerMap]);

    const initialColumnsDownload: any = [
        // { key: 'month', label: 'Month', visible: true },
        { key: 'gas_day_from', label: 'Gas Day From', visible: true },
        { key: 'gas_day_to', label: 'Gas Day To', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'approved_by', label: 'Approved by', visible: true },
        { key: 'download', label: 'Download', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumnsReport.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggleReport = (columnKey: string) => {
        const dataFilter = initialColumnsReport;

        const getDescendants = (key: string): string[] => {
            const children = dataFilter.filter((col: { key: string; parent_id?: string }) => col.parent_id === key);
            return children.reduce((acc: string[], child: any) => {
                return [...acc, child.key, ...getDescendants(child.key)];
            }, []);
        };

        const getAncestors = (key: string): string[] => {
            const column = dataFilter.find((col: any) => col.key === key);
            if (column?.parent_id) {
                return [column.parent_id, ...getAncestors(column.parent_id)];
            }
            return [];
        };

        const descendants = getDescendants(columnKey);
        const ancestors = getAncestors(columnKey);

        setColumnVisibility((prev: any) => {
            const newState = { ...prev };
            const currentChecked = prev[columnKey];
            const newChecked = !currentChecked;

            // Toggle current column
            newState[columnKey] = newChecked;

            // Toggle all descendant columns to match the newChecked state
            descendants.forEach((key: any) => {
                newState[key] = newChecked;
            });

            // Update parent visibility based on sibling states (bottom-up)
            ancestors.forEach(parentKey => {
                const siblings = dataFilter.filter((col: any) => col.parent_id === parentKey);
                const isAnySiblingChecked = siblings.some((col: any) => newState[col.key]);

                newState[parentKey] = isAnySiblingChecked;
            });

            return newState;
        });

        settk((prev: any) => !prev);
    };

    const handleColumnToggleDownload = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    useEffect(() => {
        if (tabIndex == 0) {
            // setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
            setColumnVisibility(Object.fromEntries(initialColumnsReport.map((column: any) => [column.key, column.visible])))
        } else {
            setColumnVisibility(Object.fromEntries(initialColumnsDownload.map((column: any) => [column.key, column.visible])))
        }
    }, [tabIndex])

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
            if (tabIndex == 0) {
                setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            } else if (tabIndex == 1) {
                setPaginatedData(filteredDataTable)
            }
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### EXPORT ###############
    const exportTableReport = async (data: any) => {
        const data_to_export = data
        regenarateExportReport(data_to_export)
        // exportCyberpunk(data_to_export)
        // exportCyberpunk2(data_to_export)
        // exportCyberpunk3(data_to_export)
        // exportCyberpunk4(data_to_export)
    };

    const regenarateExportReport = (data: any) => {
        if (data && data?.length > 0) {
            const filteredData = data?.map((item: any) => {
                const npdata = item?.nomPoint;

                if (npdata && npdata.length > 0) {
                    const filteredNomPoint = npdata
                        .map((npItem: any) => {
                            const pointKey = npItem?.point;
                            const getKeyNP = initialColumnsReport?.find((f: any) => f?.key == pointKey);

                            const getKeyTOTAL = initialColumnsReport?.find((f: any) => f?.key == `${pointKey}-total`);
                            const getKeyMETERING = initialColumnsReport?.find((f: any) => f?.key == `${pointKey}-meter`);

                            // Filter inner shipper data
                            const filteredData = (npItem?.data || [])
                                .map((npsItem: any) => {
                                    const getKeyNPS = initialColumnsReport?.find((f: any) => f?.key == `${pointKey}-${npsItem?.shipper_name}`);
                                    if (columnVisibility[getKeyNPS?.key]) {
                                        return npsItem;
                                    }
                                    return null
                                })
                                .filter(Boolean);


                            // ถ้า data ว่าง หรือ point ไม่อยู่ใน visibility → ตัดทิ้ง
                            if (filteredData.length > 0 && columnVisibility[getKeyNP?.key]) {
                                const clonedNPItem = {
                                    ...npItem,
                                    data: filteredData?.sort((a: any, b: any) => {
                                        const pointA = a?.shipper_name || "";
                                        const pointB = b?.shipper_name || "";

                                        if (pointA < pointB) {
                                            return -1;  // a มาก่อน b
                                        }
                                        if (pointA > pointB) {
                                            return 1;   // b มาก่อน a
                                        }
                                        return 0;       // ถ้าเท่ากัน
                                    })
                                };

                                // เปลี่ยนค่าเป็น 'disabled' แทนการลบ
                                if (!columnVisibility[getKeyTOTAL?.key]) {
                                    clonedNPItem.total = 'disabled';
                                }

                                if (!columnVisibility[getKeyMETERING?.key]) {
                                    clonedNPItem.meterValue = 'disabled';
                                }

                                return clonedNPItem;
                            } else if (columnVisibility[getKeyNP?.key]) {
                                const clonedNPItem = npItem;

                                // if (!columnVisibility[getKeyTOTAL?.key]) {
                                //     clonedNPItem.total = 'disabled';
                                // }

                                // if (!columnVisibility[getKeyMETERING?.key]) {
                                //     clonedNPItem.meterValue = 'disabled';
                                // }

                                return {
                                    ...npItem, data: []
                                }
                            }

                            return null;
                        })
                        .filter(Boolean);

                    if (filteredNomPoint.length > 0) {
                        return {
                            ...item,
                            nomPoint: filteredNomPoint?.sort((a: any, b: any) => {
                                // ตรวจสอบว่าทั้ง a?.point และ b?.point เป็น string
                                const pointA = a?.point || ""; // ใช้ค่าเริ่มต้นเป็น "" ถ้าไม่มี point
                                const pointB = b?.point || ""; // ใช้ค่าเริ่มต้นเป็น "" ถ้าไม่มี point

                                // การเปรียบเทียบเพื่อจัดเรียง
                                if (pointA < pointB) {
                                    return -1;  // a มาก่อน b
                                }
                                if (pointA > pointB) {
                                    return 1;   // b มาก่อน a
                                }
                                return 0;       // ถ้าเท่ากัน
                            }),
                        };
                    } else {
                        return {
                            ...item,
                            nomPoint: [],
                        };
                    }
                }

                return null;
            }).filter(Boolean);

            exportALLOShipperREPORT(filteredData)

        }

        return []
    }

    useEffect(() => {
        setFilteredDataTableDownload(dataTabDownload)
    }, [dataTabDownload])
    

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">

                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                    />

                    {
                        tabIndex == 0 && // แถบ Download : Filter ยังใช้ไม่ได้ Filter ไหนที่ดึงข้อมูลในหน้านี้มาแสดงไม่ได้ก็ hide ไปเลย เมื่อเลือกมาที่แถบ Download https://app.clickup.com/t/86eu4qdu5
                        <InputSearch
                            id="searchShipper"
                            label="Shipper Name"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchShipperName}
                            onChange={(e: any) => {

                                setSrchShipperName(e.target.value)
                                findNomPointByShipperId(e.target.value);
                            }}
                            options={dataShipper?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            ).map((item: any) => ({
                                value: item.id_name,
                                label: item.name,
                            }))
                            }
                        />
                    }

                    {
                        tabIndex == 0 && // แถบ Download : Filter ยังใช้ไม่ได้ Filter ไหนที่ดึงข้อมูลในหน้านี้มาแสดงไม่ได้ก็ hide ไปเลย เมื่อเลือกมาที่แถบ Download https://app.clickup.com/t/86eu4qdu5
                        <InputSearch
                            id="searchNomPoint"
                            label="Nomination Point"
                            // type="select"
                            type="select-multi-checkbox"
                            value={sNomPointId}
                            onChange={(e: any) => setSNomPointId(e.target.value)}
                            // options={nominationPointData?.data?.map((item: any) => ({
                            //     value: item.nomination_point,
                            //     label: item.nomination_point,
                            // }))}
                            options={
                                srchShipperName?.length > 0 ?
                                (nomPointMasterData?.filter((f: any) =>
                                    f?.contract_point_list?.some((ff: any) =>
                                        ff?.shipper_contract_point?.some((fff: any) =>
                                        srchShipperName?.includes(fff?.group?.id_name)
                                        )
                                    )
                                    ))?.map((item: any) => ({
                                    value: item.nomination_point,
                                    label: item.nomination_point,
                                }))
                                :
                                nomPointMasterData?.map((item: any) => ({
                                    value: item.nomination_point,
                                    label: item.nomination_point,
                                }))
                                }
                            // options={
                            //     srchShipperName?.length > 0 ?
                            //         masterNomPoint3?.map((item: any) => ({
                            //             value: item.nomination_point,
                            //             label: item.nomination_point,
                            //         }))
                            //         :
                            //         nomPointMasterData?.map((item: any) => ({
                            //             value: item.nomination_point,
                            //             label: item.nomination_point,
                            //         }))
                            // }
                        />
                    }

                    {
                        tabIndex == 0 && // แถบ Download : Filter ยังใช้ไม่ได้ Filter ไหนที่ดึงข้อมูลในหน้านี้มาแสดงไม่ได้ก็ hide ไปเลย เมื่อเลือกมาที่แถบ Download https://app.clickup.com/t/86eu4qdu5
                        <div className="w-auto relative">
                            <CheckboxSearch2
                                {...register('filter_sharing_meter')}
                                id="sharing_meterFilter"
                                label="Sharing Meter"
                                type="single-line"
                                value={watch('filter_sharing_meter') ? watch('filter_sharing_meter') : false}
                                onChange={(e: any) => setValue('filter_sharing_meter', e?.target?.checked)}
                            />
                        </div>
                    }

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Approve"}
                            iconNoRender={true}
                            bgcolor={"#C8FFD7"}
                            generalFunc={() => openApproveModal('x', 'x')}
                            // disable={urlForApprove == '' ? true : false} 
                            // disable={disableApprove} // List > ปุ่ม Approve จะ active ก็ต่อเมื่อ ต้องเลือกข้อมูล Gas Month,Shipper Name, Contract code ให้ครบก่อน https://app.clickup.com/t/86etb03zm
                            disable={disableApprove} // ปุ่ม Approved จะ active ก็ต่อเมื่อ เลือก filter ทุก filter ให้ครบก่อน https://app.clickup.com/t/86eu2djwm
                            // disable={filteredDataTable?.length > 0 ? false : true}
                            can_create={userPermission ? userPermission?.f_approved : false}
                        />
                    </div>
                </aside>
            </div>

            <Tabs
                value={tabIndex}
                onChange={handleChange}
                aria-label="tabs"
                sx={{
                    marginBottom: "-19px !important",
                    "& .MuiTabs-indicator": {
                        display: "none", // Remove the underline
                    },
                    "& .Mui-selected": {
                        color: "#58585A !important",
                    },
                }}
            >
                {
                    ["Report", "Download"]?.map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            id={`tab-${index}`}
                            sx={{
                                fontFamily: "Tahoma !important",
                                border: "0.5px solid",
                                borderColor: "#DFE4EA",
                                borderBottom: "none",
                                borderTopLeftRadius: "9px",
                                borderTopRightRadius: "9px",
                                textTransform: "none",
                                padding: "8px 16px",
                                backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                                color: tabIndex === index ? "#58585A" : "#9CA3AF",
                                "&:hover": {
                                    backgroundColor: "#F3F4F6",
                                },
                            }}
                        />
                    ))
                }
            </Tabs>

            <div className="border-[#DFE4EA] border-[1px] p-2 rounded-tl-none rounded-tr-lg shadow-sm">
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

                            {
                                tabIndex == 0 &&
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    // generalFunc={() => exportTableReport(filteredDataTable)}
                                    generalFunc={() => exportTableReport(dataTable)} // v2.0.40 แถบ report เมื่อ export file แล้ว ข้อมูลเกินหน้า UI https://app.clickup.com/t/86etnehq5
                                    // can_export={userPermission ? userPermission?.f_export : false}
                                    can_export={true}
                                    // disable={filteredDataTable?.length > 0 ? false : true}
                                    disable={dataTable?.length > 0 ? false : true}
                                />
                            }

                            {
                                tabIndex == 1 &&
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    generalFunc={() => exportToExcel(filteredDataTableDownload, 'allocation-summary-shipper-report', columnVisibility)} // v2.0.40 แถบ download ขึ้น gas day from - to ไม่สัมพันธ์กับวันที่เลือกไว้หน้า report และปรับชื่อ export file เป็น Allocation Summary Shipper Report เหมือนหน้า UI https://app.clickup.com/t/86etnehq7
                                    // can_export={userPermission ? userPermission?.f_export : false}
                                    can_export={true}
                                    disable={filteredDataTableDownload?.length > 0 ? false : true}

                                />
                            }

                        </div>
                    </div>
                </div>

                {/* add condition if isLoading == false then show only Spinloading2 */}
                {
                    isLoading == false ? <Spinloading2 spin={isLoading ? false : true} rounded={20} /> :

                        (!isFilter && tabIndex == 0) || (tabIndex == 0 && paginatedData?.length === 0) ? <NodataTable textRender={'Please select filter to view the information.'} /> : <>
                            <TabTable value={tabIndex} index={0}>
                                <TableReport
                                    tableData={paginatedData}
                                    isLoading={isLoading}
                                    columnVisibility={columnVisibility}
                                    userPermission={userPermission}
                                    areaMaster={areaMaster}
                                    initialColumns={initialColumnsReport}
                                />
                            </TabTable>
                        </>
                }

                <TabTable value={tabIndex} index={1}>
                    <TableDownload
                        // tableData={dataTabDownload}
                        tableData={filteredDataTableDownload}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                    />
                </TabTable>
            </div>

            <PaginationComponent
                // totalItems={tabIndex == 0 ? filteredDataTable[0] ? filteredDataTable[0]?.data?.length : [] : dataTabDownload?.length}
                // totalItems={tabIndex == 0 ? filteredDataTable[0] ? filteredDataTable[0]?.data?.length : [] : filteredDataTableDownload?.length}
                totalItems={tabIndex == 0 ? filteredDataTable ? filteredDataTable?.length : [] : filteredDataTableDownload?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Approved"
                description="Your report has been approved."
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={tabIndex == 0 ? handleColumnToggleReport : handleColumnToggleDownload}
                // initialColumns={tabIndex == 0 ? initialColumns : initialColumnsDownload}
                initialColumns={tabIndex == 0 ? initialColumnsReport : initialColumnsDownload}
                parentMode={true}
            />

        </div>
    )
}

export default ClientPage;