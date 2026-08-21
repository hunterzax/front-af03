"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService } from "@/utils/postService";
import { Popover, Tab, Tabs } from '@mui/material';
import { TabTable } from '@/components/other/tabPanel';
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import getUserValue from "@/utils/getuserValue";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { decryptData } from "@/utils/encryptionData";
import { deduplicate, filterByDateRange, findRoleConfigByMenuName, formatDateNoTime, formatNumberFourDecimal, formatNumberThreeDecimal, generateUserPermission, getDateRangeForApi, sortAlloReport, toDayjs } from "@/utils/generalFormatter";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ModalViewAllocReport from "./form/modalView";
import BtnExport from "@/components/other/btnExport";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import AppTable, { myCustomSortingByDateFn, sortingByDateFn } from "@/components/table/AppTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import BtnGeneral from "@/components/other/btnGeneral";
import { epAllocationAllocationReport } from "@/utils/exportFunc";
import equal from "fast-deep-equal";
import TableExpanded from "./form/tableExpanded";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const [key, setKey] = useState(0);

    // route มาจาก tariff
    const searchParams = useSearchParams();
    const gas_day_from_somewhere_else: any = searchParams.get("from");
    const gas_day_to_from_somewhere_else: any = searchParams.get("to");
    const shipper_from_somewhere_else: any = searchParams.get("shipper");
    const contract_from_somewhere_else: any = searchParams.get("contract_code");
    const [dataSort_, setdataSort_] = useState<any>([])
    const [dataExport_, setdataExport_] = useState<any>([])

    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchContractPoint, setSrchContractPoint] = useState<any>([]);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);

    const [tabIndex, setTabIndex] = useState(0);
    const [dataTable, setData] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [makeFetch, setMakeFetch] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataContractPoint, setDataContractPoint] = useState<any>([]);
    const [dataContractPointAll, setDataContractPointAll] = useState<any>([]);
    const [dataContractPointAllForFilter, setDataContractPointForFilter] = useState<any>([]);
    const [dataContractCode, setDataContractCode] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const [openRequestNo, setOpenRequestNo] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const [appliedFilter, setAppliedFilter] = useState({
        gasDayFrom: null as Date | null,
        gasDayTo: null as Date | null,
        contractCode: [] as any[],
        contractPoint: [] as any[],
        shipperName: [] as any[],
    });

    // ############### PAGINATION ###############
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const dataExportRef = useRef<any[]>([]);

    useEffect(() => {
        setSrchShipperName(Number(shipper_from_somewhere_else))
    }, [shipper_from_somewhere_else])

    useEffect(() => {
        setSrchContractCode(contract_from_somewhere_else)
    }, [contract_from_somewhere_else])

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;
    const [userPermission, setUserPermission] = useState<any>();

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null;

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Allocation Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Allocation Report', userDT)
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

    useEffect(() => {
        getPermission();
    }, [])

    // const filteredDataTable = useMemo(() => {
    //     let result_gasday_from_to: any[] = Array.isArray(dataTable) ? dataTable : [];

    //     if (srchGasDayFrom || srchGasDayTo) {
    //         const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
    //         result_gasday_from_to = filterByDateRange(result_gasday_from_to, start_date, end_date);
    //     }

    //     const result = result_gasday_from_to.filter((item: any) => {
    //         return (
    //             (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper?.id) : true) &&
    //             (srchContractPoint?.length > 0 ? srchContractPoint.includes(item?.contract_point) : true) &&
    //             (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true)
    //         );
    //     });
    //     return sortAlloReport(result);
    // }, [
    //     dataTable,
    //     srchGasDayFrom,
    //     srchGasDayTo,
    //     srchShipperName,
    //     srchContractPoint,
    //     srchContractCode,
    // ]);

    const filteredDataTable = useMemo(() => {
        let result: any[] = Array.isArray(dataTable) ? dataTable : [];

        const {
            gasDayFrom,
            gasDayTo,
            shipperName,
            contractPoint,
            contractCode,
        } = appliedFilter;

        if (gasDayFrom || gasDayTo) {
            const { start_date, end_date } = getDateRangeForApi(
                gasDayFrom,
                gasDayTo
            );

            result = filterByDateRange(result, start_date, end_date);
        }

        result = result.filter((item: any) => {
            const shipperId = item?.shipper?.id ?? item?.group?.id;

            return (
                (
                    shipperName?.length > 0
                        ? shipperName.includes(shipperId)
                        : true
                ) &&
                (
                    contractPoint?.length > 0
                        ? contractPoint.includes(item?.contract_point)
                        : true
                ) &&
                (
                    contractCode?.length > 0
                        ? contractCode.includes(item?.contract)
                        : true
                )
            );
        });

        return sortAlloReport(result);
    }, [dataTable, appliedFilter]);
    
    const paginatedData = useMemo(() => {
        const { pageIndex, pageSize } = pagination;
        const start = pageIndex * pageSize;
        const end = start + pageSize;
        return (filteredDataTable ?? []).slice(start, end);
    }, [filteredDataTable, pagination.pageIndex, pagination.pageSize]);


    // ############### FIELD SEARCH ###############


    // #region filter
    const handleFilter = () => {
        let result_gasday_from_to: any = dataTable
        if (srchGasDayFrom || srchGasDayTo) {
            // case 1
            const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
            result_gasday_from_to = filterByDateRange(dataTable, start_date, end_date);
        }

        const result = result_gasday_from_to?.filter((item: any) => {
            return (
                // (srchShipperName ? srchShipperName.toString().toLowerCase().trim() == item?.group?.id : true) &&
                // (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) && // ของแทร่
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper?.id) : true) && // ไทยประดิษฐ์
                (srchContractPoint?.length > 0 ? srchContractPoint.includes(item?.contract_point) : true) &&
                (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true)
            );
        });
        const sorted = sortAlloReport(result);
        // setFilteredDataTable(sorted);
    };

    // const handleFieldSearch = () => {
    //     fetchData();
    // };
    // const handleFieldSearch = async () => {
    //     setPagination((prev) => ({
    //         ...prev,
    //         pageIndex: 0,
    //     }));

    //     setAppliedFilter({
    //         gasDayFrom: srchGasDayFrom,
    //         gasDayTo: srchGasDayTo,
    //         contractCode: Array.isArray(srchContractCode)
    //             ? [...srchContractCode]
    //             : [],
    //         contractPoint: Array.isArray(srchContractPoint)
    //             ? [...srchContractPoint]
    //             : [],
    //         shipperName: Array.isArray(srchShipperName)
    //             ? [...srchShipperName]
    //             : [],
    //     });

    //     await fetchData();
    // };

    const handleFieldSearch = async () => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));

        setAppliedFilter({
            gasDayFrom: srchGasDayFrom,
            gasDayTo: srchGasDayTo,
            contractCode: Array.isArray(srchContractCode)
                ? [...srchContractCode]
                : [],
            contractPoint: Array.isArray(srchContractPoint)
                ? [...srchContractPoint]
                : [],
            shipperName: Array.isArray(srchShipperName)
                ? [...srchShipperName]
                : [],
        });

        await fetchData({
            gasDayFrom: srchGasDayFrom,
            gasDayTo: srchGasDayTo,
        });
    };

    // const handleReset = () => {
    //     setSrchShipperName([]);
    //     setSrchContractCode([]);
    //     setSrchContractPoint([]);
    //     setSrchGasDayFrom(null);
    //     setSrchGasDayTo(null);

    //     // setFilteredDataTable(dataTable);
    //     // setFilteredDataTable([]); // กดปุ่ม Reset Filter แล้วข้อมูลต้องกลับมาเป็นแบบตอนเข้าเมนูครั้งแรก (ทั้งสองแถบ) https://app.clickup.com/t/86eu4b94q

    //     fetchData();

    //     setKey((prevKey) => prevKey + 1);
    // };

    const handleReset = async () => {
        setSrchShipperName([]);
        setSrchContractCode([]);
        setSrchContractPoint([]);
        setSrchGasDayFrom(null);
        setSrchGasDayTo(null);

        setAppliedFilter({
            gasDayFrom: null,
            gasDayTo: null,
            contractCode: [],
            contractPoint: [],
            shipperName: [],
        });

        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));

        setKey((prevKey) => prevKey + 1);

        await fetchData({
            gasDayFrom: null,
            gasDayTo: null,
        });
    };
    
    const getFilterToExport = () => {
        // const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
        let from = srchGasDayFrom ? dayjs(srchGasDayFrom).format("YYYY-MM-DD") : dayjs().startOf("month").format("YYYY-MM-DD");
        let to = srchGasDayTo ? dayjs(srchGasDayTo).format("YYYY-MM-DD") : dayjs().endOf("month").format("YYYY-MM-DD");

        const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize
        return {
            // start_date,
            // end_date,
            from,
            to,
            start_date: from,
            end_date: to,
            skip,
            limit: filteredDataTable?.length > 0 ? pagination.pageSize : '100',
            // tab: tabIndex == 0 ? '1' : '2'
            tab: tabIndex == 0 ? 1 : 2
        }
    }

    // ############### LIKE SEARCH ###############
    // const [filteredDataTable, setFilteredDataTable] = useState<any>([]);

    // ############### DATA TABLE ###############


    useEffect(() => {
        if (gas_day_from_somewhere_else) {
            const date_from = dayjs(gas_day_from_somewhere_else).toDate();
            const date_to = dayjs(gas_day_to_from_somewhere_else).toDate();

            // setSrchGasDayFrom(date_from)
            // setSrchGasDayTo(date_to)

            setSrchGasDayFrom(new Date(date_from))
            setSrchGasDayTo(new Date(date_to))
        }
    }, [gas_day_from_somewhere_else])

    const addShipperToData = (data: any) => {
        // ปั้น data add shipper
        const updatedDataDaily = data?.map((item: any) => {
            const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == item?.shipper)
            return {
                ...item,
                shipper: find_shipper,
            };
        });

        return updatedDataDaily
    }

    // #region fetchData
    // const fetchData = async () => {
    //     try {
    //         setIsLoading(false);

    //         // ถ้า user เป็น shipper
    //         // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
    //         if (userDT?.account_manage?.[0]?.user_type_id == 3) {
    //             setSrchShipperName([userDT?.account_manage?.[0]?.group?.id])
    //         }

    //         // NX เข้ามาแล้วข้อมูลไม่ขึ้น Filter แค่ Gas Day From ก็ข้อมูลไม่ขึ้น ต้องเลือกทั้ง from ทั้ง to ข้อมูลถึงจะมา https://app.clickup.com/t/86eun9wp7
    //         let from = srchGasDayFrom ? dayjs(srchGasDayFrom) : dayjs().startOf("month");
    //         let to = srchGasDayTo ? dayjs(srchGasDayTo) : dayjs().endOf("month");
    const fetchData = async (override?: {
        gasDayFrom?: Date | null;
        gasDayTo?: Date | null;
    }) => {
        try {
            setIsLoading(false);

            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName([
                    userDT?.account_manage?.[0]?.group?.id
                ]);
            }

            const gasDayFrom =
                override && "gasDayFrom" in override
                    ? override.gasDayFrom
                    : srchGasDayFrom;

            const gasDayTo =
                override && "gasDayTo" in override
                    ? override.gasDayTo
                    : srchGasDayTo;

            let from = gasDayFrom
                ? dayjs(gasDayFrom)
                : dayjs().startOf("month");

            let to = gasDayTo
                ? dayjs(gasDayTo)
                : dayjs().endOf("month");

            // โค้ด fetch ส่วนที่เหลือเหมือนเดิม
            
            if (gas_day_from_somewhere_else) {
                from = dayjs(gas_day_from_somewhere_else);
                to = dayjs(gas_day_to_from_somewhere_else);
            }

            if (from && !to) {
                // ถ้าไม่มี to → set เป็นสิ้นปีเดียวกัน
                to = from.endOf("month");
            }

            if (to && !from) {
                // ถ้าไม่มี from → set เป็นต้นปีเดียวกัน
                from = to.startOf("month");
            }

            if (from && to) {
                const { start_date, end_date } = getDateRangeForApi(from.toDate(), to.toDate());
                const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize

                // TAB DAILY
                // const response: any = await getService(`/master/allocation/allocation-report?start_date=2025-01-01&end_date=2025-02-28&skip=100&limit=100&tab=1`);
                const response: any = await getService(`/master/allocation/allocation-report?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=${filteredDataTable?.length > 0 ? pagination.pageSize : '100'}&tab=${tabIndex == 0 ? '1' : '2'}`);

                // ปั้น data add shipper
                const updatedDataDaily = addShipperToData(response)

                // Tab Daily / Tab Intraday ปรับ Default Display ตอนเข้าครั้งแรกให้เรียงตาม Timestamp > Entry/Exit (เอา Entryก่อน) > Contract Point (เรียงตามตัวอักษร) https://app.clickup.com/t/86et8d4cb
                // const sorted = sortAlloReport(response);
                const sorted = sortAlloReport(updatedDataDaily);

                // DATA CONTRACT CODE
                const data_contract_code_de_dup = Array.from(
                    new Map(
                        sorted?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group ? item.group : item.shipper, contract_point: item.contract_point }])
                    ).values()
                );
                setDataContractCode(data_contract_code_de_dup);

                // DATA CONTRACT POINT
                const data_contract_point_de_dup = Array.from(
                    new Map(
                        sorted?.map((item: any) => [item.contract_point, { contract_point: item.contract_point, group: item.group ? item.group : item.shipper, contract: item.contract }])
                    ).values()
                );
                setDataContractPoint(data_contract_point_de_dup);
                setDataContractPointAll(sorted);

                // Tab Daily / Tab Intraday : Shipper จะต้องเห็นแค่ของตัวเอง https://app.clickup.com/t/86et8d2wt
                if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    let filter_response_only_own_shipper = sorted?.filter((item: any) =>
                        userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true
                    )
                    setData(filter_response_only_own_shipper);
                    // setFilteredDataTable(filter_response_only_own_shipper);
                    setDataExport(filter_response_only_own_shipper) // --> for export

                    // const onlyPublication = filter_response_only_own_shipper?.filter((item: any) => item?.publication == true);
                    // setSelectedRoles(onlyPublication);
                } else {
                    setData(sorted);
                    // setFilteredDataTable(sorted);
                    setDataExport(sorted) // --> for export

                    // const onlyPublication = sorted?.filter((item: any) => item?.publication == true);
                    // setSelectedRoles(onlyPublication);
                }
            }

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    

    // #region fetchK
    const fetchK = async (tabIndex: any) => {
        setIsLoading(false);

        let from = srchGasDayFrom ? dayjs(srchGasDayFrom) : dayjs().startOf("month");
        let to = srchGasDayTo ? dayjs(srchGasDayTo) : dayjs().endOf("month");
        if (from && !to) {
            // ถ้าไม่มี to → set เป็นสิ้นปีเดียวกัน
            to = from.endOf("month");
        }

        if (to && !from) {
            // ถ้าไม่มี from → set เป็นต้นปีเดียวกัน
            from = to.startOf("month");
        }
        const { start_date, end_date } = getDateRangeForApi(from.toDate(), to.toDate());

        if (from && to) {

            const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize

            if (tabIndex == 0) {
                const response: any = await getService(`/master/allocation/allocation-report?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=${pagination.pageSize}&tab=1`);
                // ปั้น data add shipper
                const updatedDataDaily = addShipperToData(response)

                // Tab Daily / Tab Intraday ปรับ Default Display ตอนเข้าครั้งแรกให้เรียงตาม Timestamp > Entry/Exit (เอา Entryก่อน) > Contract Point (เรียงตามตัวอักษร) https://app.clickup.com/t/86et8d4cb
                // const sorted = sortAlloReport(response);
                const sorted = sortAlloReport(updatedDataDaily);

                // Tab Daily / Tab Intraday : Shipper จะต้องเห็นแค่ของตัวเอง https://app.clickup.com/t/86et8d2wt
                if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    let filter_response_only_own_shipper = sorted?.filter((item: any) =>
                        userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true
                    )

                    setData(filter_response_only_own_shipper);
                    // setFilteredDataTable(filter_response_only_own_shipper);

                    const onlyPublication = filter_response_only_own_shipper?.filter((item: any) => item?.publication == true);
                    setSelectedRoles(onlyPublication);
                } else {

                    setData(sorted);
                    // setFilteredDataTable(sorted);

                    const onlyPublication = sorted?.filter((item: any) => item?.publication == true);
                    setSelectedRoles(onlyPublication);
                }

            } else {
                // console.log('intra');
                // const res_intra: any = await getService(`/master/allocation/allocation-report?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=${pagination.pageSize}&tab=2`);
                const res_intra: any = await getService(`/master/allocation/allocation-report?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=${filteredDataTable?.length > 0 ? pagination.pageSize : '100'}&tab=2`);
                // ปั้น data add shipper
                const updatedDataDaily = addShipperToData(res_intra)
                // console.log('-1');
                // Tab Daily / Tab Intraday ปรับ Default Display ตอนเข้าครั้งแรกให้เรียงตาม Timestamp > Entry/Exit (เอา Entryก่อน) > Contract Point (เรียงตามตัวอักษร) https://app.clickup.com/t/86et8d4cb
                const sorted = sortAlloReport(updatedDataDaily);
                // console.log('-2');

                // Tab Daily / Tab Intraday : Shipper จะต้องเห็นแค่ของตัวเอง https://app.clickup.com/t/86et8d2wt
                if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    // let filter_res_intra_only_own_shipper = sorted?.filter((item: any) =>
                    //     userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true
                    // )

                    // setData(filter_res_intra_only_own_shipper);
                    // // setFilteredDataTable(filter_res_intra_only_own_shipper);
                    // setDataExport(filter_res_intra_only_own_shipper) // --> for export

                    const ownShipperData = sorted?.filter((item: any) =>
                        item?.group?.id === userDT?.account_manage?.[0]?.group?.id
                    );

                    setData(ownShipperData);

                    // const onlyPublication = filter_res_intra_only_own_shipper?.filter((item: any) => item?.publication == true);
                    // setSelectedRoles(onlyPublication);
                } else {
                    // const sorted_ = sorted.slice(0, 30000)
                    // const sorted_ = sorted
                    // console.log('-2.1');
                    // setData(sorted_);
                    // console.log('-2.2');
                    // setFilteredDataTable(sorted_);
                    // console.log('-2.3');
                    // setDataExport(sorted_) // --> for export
                    // console.log('-2.4');
                    const sorted_ = Array.isArray(sorted) ? sorted : [];
                    setData(sorted_);

                    // const onlyPublication = sorted?.filter((item: any) => item?.publication == true);
                    // setSelectedRoles(onlyPublication);
                }
                // console.log('-3');

            }
        }

        setTimeout(() => {
            setMakeFetch(false)
            setIsLoading(true);
        }, 500);
    }

    useEffect(() => {
        if (makeFetch) {
            // fetchData();
            fetchK(tabIndex);
            handleFilter();
        }
    }, [makeFetch])

    useEffect(() => {
        fetchK(tabIndex);
    }, [tabIndex])

    //     useEffect(() => {
    //     if (makeFetch) {
    //         fetchK(tabIndex).finally(() => setMakeFetch(false));
    //     }
    // }, [makeFetch, tabIndex]);

    useEffect(() => {
        fetchData();
    }, []);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    // ############# MODAL VIEW #############
    const [viewOpen, setViewOpen] = useState(false);
    const [viewDataMain, setViewDataMain] = useState<any>([]);
    const [viewData, setViewData] = useState<any>([]);

    const openViewForm = async (id: any) => {
        const split = id.split('_');

        // const filteredData = dataTable?.find((item: any) => item.id === id);
        // const filteredData = filteredDataTable?.find((item: any) => item.id === id);
        const filteredData = filteredDataTable?.find((item: any) => item?.id + '_' + item?.request_number === id);
        setViewDataMain(filteredData)

        // ของเดิม
        // if (srchGasDayFrom && srchGasDayTo) {
        //     const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);

        //     const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize
        //     // const response: any = await getService(`/master/allocation/allocation-report-view?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=${pagination.pageSize}&tab=${tabIndex == 0 ? '1' : '2'}&contract=${filteredData?.contract}&shipper=${filteredData?.group?.id_name}&gas_day=${filteredData?.gas_day}&id=${id}`);
        //     // const response: any = await getService(`/master/allocation/allocation-report-view?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=100&tab=${tabIndex == 0 ? '1' : '2'}&contract=${filteredData?.contract}&shipper=${filteredData?.group?.id_name}&gas_day=${filteredData?.gas_day}&id=${id}`);

        //     const response: any = await getService(`/master/allocation/allocation-report-view?start_date=${dayjs().startOf("year").format("YYYY-MM-DD")}&end_date=${dayjs().endOf("year").format("YYYY-MM-DD")}&skip=${skip}&limit=100&tab=${tabIndex == 0 ? '1' : '2'}&contract=${filteredData?.contract}&shipper=${filteredData?.group?.id_name}&gas_day=${filteredData?.gas_day}&id=${id}`);
        //     setViewData(response);
        //     setViewOpen(true);
        // }

        // ของใหม่
        const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize
        // let url = `/master/allocation/allocation-report-view?skip=${skip}&limit=100&id=${id}`
        let url = `/master/allocation/allocation-report-view?skip=${skip}&limit=100&id=${split[0]}`
        if (tabIndex == 0) {
            url += '&tab=1'
        }
        else {
            url += '&tab=2'
        }

        if (filteredData?.contract) {
            url += `&contract=${filteredData?.contract}`
        }
        if (filteredData?.group?.id_name) {
            url += `&shipper=${filteredData?.group?.id_name}`
        }
        if (filteredData?.gas_day) {
            url += `&gas_day=${filteredData?.gas_day}`
            url += `&start_date=${filteredData?.gas_day}`
            url += `&end_date=${filteredData?.gas_day}`
        }
        if (filteredData?.execute_timestamp) {
            url += `&execute_timestamp=${filteredData?.execute_timestamp}`
        }
        if (filteredData?.request_number) {
            url += `&request_number=${filteredData?.request_number}`
        }
        if (filteredData?.gas_hour) {
            url += `&gas_hour=${filteredData?.gas_hour}`
        }

        try {
            // const response: any = await getService(`/master/allocation/allocation-report-view?start_date=${dayjs().startOf("year").format("YYYY-MM-DD")}&end_date=${dayjs().format("YYYY-MM-DD")}&skip=${skip}&limit=100&tab=${tabIndex == 0 ? '1' : '2'}&contract=${filteredData?.contract}&shipper=${filteredData?.group?.id_name}&gas_day=${filteredData?.gas_day}&id=${id}`);
            const response: any = await getService(url);
            setViewData(Array.isArray(response) ? response : []);
            setViewOpen(true);
        } catch (error) {

        }
    };

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
        setSelectAll(false);

        let newColumnVisibility: any = {}
        if (newValue == 0) {
            columnsDaily.map((item: any) => {
                newColumnVisibility[item.accessorKey] = true
            })
        } else {
            columnsIntraday.map((item: any) => {
                newColumnVisibility[item.accessorKey] = true
            })
        }
        setColumnVisibility(newColumnVisibility)
        setDetailMap({});
        setLoadingMap({});
    };

    // ############### MODAL ALLOC AND BALANCE EXECUTE ###############
    // const handleExcute = () => {
    //     setMdExecuteOpen(true);
    // };

    // #region PUBLICATION
    // ############# PUBLICATION  #############
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    // #region select all
    const handleSelectAll = async () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const onlyFalse = paginatedData?.filter((item: any) => !item?.publication);
        const onlyTrue = paginatedData?.filter((item: any) => item.publication);

        // ตรงนี้ select all
        // เอาแค่ที่เป็น false
        if (onlyFalse?.length > 0) {
            const notPublishedBody = deduplicate(onlyFalse);
            if (notPublishedBody?.length > 0) {
                (async () => {
                    try {
                        // Wait for all postPublicationCenter calls to complete
                        await Promise.all(
                            notPublishedBody?.map(item => postPublicationCenter(item))
                        );
                        // After all posts are done
                        setMakeFetch(true);
                    } catch (error) {
                        // Error during de-selection:
                    }
                })();
            }

            // Select all roles
            const allNotPublic = filteredDataTable?.map((item: any) => ({ id: item.id }));
            setSelectedRoles(allNotPublic);
        }

        // ตรงนี้ de-select all
        // ถ้าเป็น true หมดค่อยเข้า
        if (onlyTrue?.length == paginatedData?.length) {
            const deSelectBody = deduplicate(onlyTrue);

            if (deSelectBody?.length > 0) {
                // Wrap in an async IIFE if you're inside a non-async function
                (async () => {
                    try {
                        // Wait for all postPublicationCenter calls to complete
                        await Promise.all(
                            deSelectBody?.map(item => postPublicationCenter(item))
                        );

                        // After all posts are done
                        setMakeFetch(true);
                        setSelectedRoles([]);
                    } catch (error) {
                        // Error during de-selection:
                    }
                })();
            }
        }


        // ------------------------------------------------------------------------------------------------

        // if (newSelectAll) {
        //     const onlyFalse = filteredDataTable?.filter((item: any) => !item?.publication);
        //     // const onlyTrue = sortedData?.filter((item: any) => item.publication);

        //     // const publishedBody = deduplicate(onlyTrue);
        //     const notPublishedBody = deduplicate(onlyFalse);

        //     if (notPublishedBody?.length > 0) {
        //         (async () => {
        //             try {
        //                 // Wait for all postPublicationCenter calls to complete
        //                 await Promise.all(
        //                     notPublishedBody?.map(item => postPublicationCenter(item))
        //                 );
        //                 // After all posts are done
        //                 setMakeFetch(true);
        //             } catch (error) {
        //                 // Error during de-selection:
        //             }
        //         })();
        //     }

        //     // Select all roles
        //     const allNotPublic = filteredDataTable?.map((item: any) => ({ id: item.id }));
        //     setSelectedRoles(allNotPublic);

        // } else {
        //     // ตรงนี้ de-select all
        //     const onlyTrue = filteredDataTable?.filter((item: any) => item.publication);
        //     const deSelectBody = deduplicate(onlyTrue);

        //     // Wrap in an async IIFE if you're inside a non-async function
        //     (async () => {
        //         try {
        //             // Wait for all postPublicationCenter calls to complete
        //             await Promise.all(
        //                 deSelectBody.map(item => postPublicationCenter(item))
        //             );

        //             // After all posts are done
        //             setMakeFetch(true);
        //             setSelectedRoles([]);
        //         } catch (error) {
        //             // Error during de-selection:
        //         }
        //     })();
        // }

        settk(!tk);
    };

    // #region select row one
    const handleSelectRow = (id: any, execute_ts: any, gas_hour: any, contract: any) => {

        // ส่งตัวเดียว
        // const find_ = filteredDataTable?.find((item: any) => item.id === id);

        // const find_ = paginatedData?.find((item: any) => (item.id === id && item.execute_timestamp === execute_ts));
        const find_ = filteredDataTable?.find((item: any) => (item.id === id && item.execute_timestamp === execute_ts && item.gas_hour === gas_hour && item.contract === contract));

        postPublicationCenter(find_)
        setMakeFetch(true)

        const existingRole = selectedRoles?.find((role: any) => role?.id === id);

        if (existingRole) {
            // Deselect the role
            setSelectedRoles(selectedRoles?.filter((role: any) => role.id !== id));

        } else {
            // Select the role
            setSelectedRoles([...selectedRoles, { id }]);
        }
    };

    const postPublicationCenter = async (data: any) => {
        const body_post = {
            "execute_timestamp": data?.execute_timestamp,
            "gas_day": data?.gas_day,
            "gas_hour": data?.gas_hour
        }
        try {
            const res_ = await postService('/master/allocation/publication-center', body_post);
        } catch (error) {

        }
    }


    // const [paginatedData, setPaginatedData] = useState<any[]>([]);

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    // useEffect(() => {
    //     if (filteredDataTable) {
    //         const sorted = sortAlloReport(filteredDataTable);

    //         // setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    //         // setPaginatedData(sorted?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    //         const { pageIndex, pageSize } = pagination;
    //         const start = pageIndex * pageSize;
    //         const end = start + pageSize;
    //         setPaginatedData((sorted ?? []).slice(start, end));
    //     }

    // }, [currentPage, itemsPerPage, makeFetch, pagination.pageIndex, pagination.pageSize])
    // }, [filteredDataTable, currentPage, itemsPerPage, makeFetch, pagination.pageIndex, pagination.pageSize])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = userDT?.account_manage?.[0]?.user_type_id !== 3 ? [
        { key: 'publication', label: 'Publication', visible: true },
        { key: 'entry_exit', label: 'Entry / Exit', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'gas_hour', label: 'Gas Hour', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'nomination_point_concept_point', label: 'Nomination Point/Concept Point', visible: true },
        { key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'overusage', label: 'Overusage (MMBTU/D)', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ] : [
        { key: 'entry_exit', label: 'Entry / Exit', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'gas_hour', label: 'Gas Hour', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'nomination_point_concept_point', label: 'Nomination Point/Concept Point', visible: true },
        { key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'overusage', label: 'Overusage (MMBTU/D)', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.filter((item: any) => item.key !== 'gas_hour').map((column: any) => [column.key, column.visible]))
    );

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    //     setAnchorEl(anchorEl ? null : event.currentTarget);
    // };

    // const handleColumnToggle = (columnKey: string) => {
    //     setColumnVisibility((prev: any) => ({
    //         ...prev,
    //         [columnKey]: !prev[columnKey]
    //     }));
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

    // ของหน้า View
    const initialColumnsHistory: any = [
        { key: 'entry_exit', label: 'Entry / Exit', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'nomination_point_concept_point', label: 'Nomination Point/Concept Point', visible: true },
        // { key: 'capacity_right', label: 'Capacity Right (MMBTU/D)', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
    ];

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

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                setAnchorPopover(null)
                break;
            case "edit":
                break;
        }
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

    // #region columns
    const columnsDaily = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "entry_exit",
                header: "Entry / Exit",
                enableSorting: true,
                accessorFn: (row: any) => row?.entry_exit_obj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>
                        {row?.entry_exit_obj &&
                            <div
                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                style={{ backgroundColor: row?.entry_exit_obj?.color }}
                            >
                                {`${row?.entry_exit_obj?.name}`}
                            </div>
                        }
                    </div>)
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
                    return (<div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>)
                }
            },
            {
                accessorKey: "timestamp",
                header: "Timestamp",
                width: 150,
                enableSorting: true,
                accessorFn: (row: any) => toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') || '',
                sortingFn: (rowA, rowB, columnId) => {
                    return sortingByDateFn(rowA?.original?.execute_timestamp * 1000, rowB?.original?.execute_timestamp * 1000)
                },
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>)
                }
            },
            {
                accessorKey: "shipper_name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    // return (<div>{row?.group ? row?.group?.name : null}</div>)
                    return (<div>{row?.group ? row?.group?.name : row?.shipper ? row?.shipper?.name : null}</div>)
                }
            },
            {
                accessorKey: "contract_code",
                header: "Contract Code",
                enableSorting: true,
                accessorFn: (row: any) => row?.contract || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.contract ? row?.contract : null}</div>)
                }
            },
            {
                accessorKey: "contract_point",
                header: "Contract Point",
                enableSorting: true,
                accessorFn: (row: any) => row?.contract_point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.contract_point ? row?.contract_point : null}</div>)
                }
            },
            {
                accessorKey: "nomination_point_concept_point",
                header: "Nomination Point/Concept Point",
                enableSorting: true,
                accessorFn: (row: any) => row?.point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.point ? row?.point : null}</div>)
                }
            },
            // {
            //     accessorKey: "contractCapacity",
            //     header: "Capacity Right (MMBTU/D)",
            //     enableSorting: true,
            //     // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
            //     // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
            //     accessorFn: (row: any) => {
            //         const val = row?.contractCapacity;
            //         if (val === null || val === undefined || val === '') return '';

            //         const rawNumber = Number(val);
            //         const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"

            //         // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
            //         return `${rawNumber} ${formatted}`;
            //     },
            //     // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
            //     sortingFn: (rowA, rowB, columnId) => {
            //         const getVal = (row: any) => {
            //             const str = row.getValue(columnId);
            //             if (!str) return Number.NEGATIVE_INFINITY;
            //             // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
            //             const firstPart = str.split(' ')[0];
            //             return Number(firstPart);
            //         };

            //         const valA = getVal(rowA);
            //         const valB = getVal(rowB);

            //         if (valA === valB) return 0;
            //         return valA > valB ? 1 : -1;
            //     },
            //     cell: (info) => {
            //         // console.log(">>> info?.row?.original", info?.row?.original)
            //         // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
            //         // const val: string = `${info.getValue<string>() || ''}`;
            //         // if (!val) return <div className="text-right"></div>;

            //         // if (val.includes(" ")) {
            //         //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
            //         //     return <div className="text-right">{displayVal}</div>;
            //         // }
            //         // return formatNumberFourDecimal(val)
            //         const realVal = info?.row?.original?.contractCapacity;
            //         return <div className="text-right w-full">{realVal && realVal == 0 ? formatNumberFourDecimal(realVal) : null}</div>
            //     }
            // },
            {
                accessorKey: "nominated_value",
                header: "Nominated Value (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.nominationValue;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    // const formatted = formatNumberFourDecimal(rawNumber); // "6374 6,374.0000"
                    const formatted = formatNumberThreeDecimal(rawNumber); // "6374 6,374.000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val: string = `${info.getValue<string>() || ''}`;
                    // if (!val) return <div className="text-right"></div>;

                    // if (val.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    // return formatNumberFourDecimal(val)
                    const realVal = info?.row?.original?.nominationValue;
                    // return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                    return <div className="text-right w-full">{realVal ? formatNumberThreeDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },
            {
                accessorKey: "allocatedValue",
                header: "System Allocation (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.allocatedValue;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val: string = `${info.getValue<string>() || ''}`;
                    // if (!val) return <div className="text-right"></div>;

                    // if (val.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    // return formatNumberFourDecimal(val)
                    const realVal = info?.row?.original?.allocatedValue;
                    return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },
            {
                accessorKey: "overusage",
                header: "Overusage (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.overusage;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    // const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"
                    const formatted = formatNumberThreeDecimal(rawNumber); // "6,374.000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val: string = `${info.getValue<string>() || ''}`;
                    // if (!val) return <div className="text-right"></div>;

                    // if (val.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    // return formatNumberFourDecimal(val)
                    const realVal = info?.row?.original?.overusage;
                    // return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                    return <div className="text-right w-full">{realVal ? formatNumberThreeDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },
            // {
            //     accessorKey: "action",
            //     id: 'actions',
            //     header: "Action",
            //     align: 'center',
            //     enableSorting: false,
            //     size: 100,
            //     cell: (info) => {
            //         const row: any = info?.row?.original;
            //         return (
            //             <BtnActionTable
            //                 togglePopover={togglePopover}
            //                 // row_id={row?.id}
            //                 row_id={row?.id + '_' + row?.request_number}
            //                 disable={userPermission?.f_view == true ? false : true}
            //             />
            //         )
            //     }
            // },
        ], [selectAll, dataExport, selectedRoles, userPermission, user_permission]
    )

    const columnsIntraday = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "publication",
                meta: {
                    specialHeader: "Publication", // ตัวอย่างพารามิเตอร์พิเศษ
                },
                header: (info) => {
                    return (
                        <div className="flex gap-2 w-30 justify-end items-center">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={(e) => {
                                    e.stopPropagation();
                                    handleSelectAll();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
                                className="w-5 h-5 border border-gray-400 rounded-[8px] checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                            />
                            <div className="pt-[2px]">
                                {`Publication`}
                            </div>
                        </div>
                    )
                },
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original

                    return (
                        <div className="relative" style={{ transform: 'translate(10px, 0)' }}>
                            <input
                                type="checkbox"
                                // checked={selectedRoles?.some((role: any) => role?.id === row?.id)}
                                checked={row?.publication}
                                // onChange={() => handleSelectRow(row?.id, row?.execute_timestamp)}
                                // onChange={() => handleSelectRow(row?.id, row?.execute_timestamp, row?.gas_hour, row?.contract)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                    e.stopPropagation();

                                    handleSelectRow(row?.id, row?.execute_timestamp, row?.gas_hour, row?.contract)
                                }}
                                className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    )
                }
            },
            {
                accessorKey: "entry_exit",
                header: "Entry / Exit",
                enableSorting: true,
                accessorFn: (row: any) => row?.entry_exit_obj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>
                        {row?.entry_exit_obj &&
                            <div
                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
                                style={{ backgroundColor: row?.entry_exit_obj?.color }}
                            >
                                {`${row?.entry_exit_obj?.name}`}
                            </div>
                        }
                    </div>)
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
                    return (<div>{row?.gas_day ? formatDateNoTime(row?.gas_day) : ''}</div>)
                }
            },
            {
                accessorKey: "gas_hour",
                header: "Gas Hour",
                enableSorting: true,
                accessorFn: (row: any) => row?.gas_hour + ':00' || '',
                align: 'center',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.gas_hour ? row?.gas_hour + ':00' : ''}</div>)
                }
            },
            {
                accessorKey: "timestamp",
                header: "Timestamp",
                width: 150,
                enableSorting: true,
                accessorFn: (row: any) => toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') || '',
                sortingFn: (rowA, rowB, columnId) => {
                    return sortingByDateFn(rowA?.original?.execute_timestamp * 1000, rowB?.original?.execute_timestamp * 1000)
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>)
                }
            },
            {
                accessorKey: "shipper_name",
                header: "Shipper Name",
                enableSorting: true,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group ? row?.group?.name : row?.shipper ? row?.shipper?.name : null}</div>)
                }
            },
            {
                accessorKey: "contract_code",
                header: "Contract Code",
                enableSorting: true,
                accessorFn: (row: any) => row?.contract || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.contract ? row?.contract : null}</div>)
                }
            },
            {
                accessorKey: "contract_point",
                header: "Contract Point",
                enableSorting: true,
                accessorFn: (row: any) => row?.contract_point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.contract_point ? row?.contract_point : null}</div>)
                }
            },
            {
                accessorKey: "nomination_point_concept_point",
                header: "Nomination Point/Concept Point",
                enableSorting: true,
                accessorFn: (row: any) => row?.point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.point ? row?.point : null}</div>)
                }
            },
            // {
            //     accessorKey: "capacity_right",
            //     header: "Capacity Right (MMBTU/D)",
            //     enableSorting: true,
            //     // accessorFn: (row: any) => row?.contract || '',
            //     accessorFn: (row: any) => {
            //         const raw = row?.contractCapacity;
            //         if (!raw) return '';

            //         const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
            //         const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
            //         const rounded = parseFloat(raw).toString(); // เช่น 10000

            //         return `${fixed} ${noComma} ${rounded}`;
            //     },
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (<div className="text-right">{row?.contractCapacity !== null && row?.contractCapacity !== undefined ? formatNumberFourDecimal(row?.contractCapacity) : null}</div>)
            //     }
            // },
            {
                accessorKey: "capacity_right",
                header: "Capacity Right (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.contractCapacity;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    // const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"
                    const formatted = formatNumberThreeDecimal(rawNumber); // "6,374.000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val = info.getValue<string>();
                    // if (!val) return <div className="text-right"></div>;

                    // if (val.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    const realVal = info?.row?.original?.contractCapacity;
                    // return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                    return <div className="text-right w-full">{realVal ? formatNumberThreeDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },

            // {
            //     accessorKey: "nominated_value",
            //     header: "Nominated Value (MMBTU/D)",
            //     enableSorting: true,
            //     // accessorFn: (row: any) => formatNumberFourDecimal(row?.nominationValue) || '',
            //     accessorFn: (row: any) => {
            //         const raw = row?.nominationValue;
            //         if (!raw) return '';

            //         const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
            //         const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
            //         const rounded = parseFloat(raw).toString(); // เช่น 10000

            //         return `${fixed} ${noComma} ${rounded}`;
            //     },
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (<div className="text-right">{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberFourDecimal(row?.nominationValue) : null}</div>)
            //     }
            // },
            {
                accessorKey: "nominated_value",
                header: "Nominated Value (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.nominationValue;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    // const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"
                    const formatted = formatNumberThreeDecimal(rawNumber); // "6,374.000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    const realVal = info?.row?.original?.nominationValue;
                    // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val = info.getValue<string>();
                    // if (!val) return <div className="text-right"></div>;

                    // if (val.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    // return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                    return <div className="text-right w-full">{realVal ? formatNumberThreeDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },


            // {
            //     accessorKey: "allocatedValue",
            //     header: "System Allocation (MMBTU/D)",
            //     enableSorting: true,
            //     // accessorFn: (row: any) => formatNumberFourDecimal(row?.allocatedValue) || '',
            //     accessorFn: (row: any) => {
            //         const raw = row?.allocatedValue;
            //         if (!raw) return '';

            //         const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
            //         const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
            //         const rounded = parseFloat(raw).toString(); // เช่น 10000

            //         return `${fixed} ${noComma} ${rounded}`;
            //     },
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (<div className="text-right">{row?.allocatedValue !== null && row?.allocatedValue !== undefined ? formatNumberFourDecimal(row?.allocatedValue) : null}</div>)
            //     }
            // },
            {
                accessorKey: "allocatedValue",
                header: "System Allocation (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.allocatedValue;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    // console.log(">>> info", info)
                    const realVal = info?.row?.original?.allocatedValue;
                    // // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val = info.getValue<string>();
                    // if (!val) return <div className="text-right"></div>;

                    // console.log(">>> val", val)
                    // if (val?.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },

            // {
            //     accessorKey: "overusage",
            //     header: "Overusage (MMBTU/D)",
            //     enableSorting: true,
            //     // accessorFn: (row: any) => formatNumberFourDecimal(row?.overusage) || '',
            //     accessorFn: (row: any) => {
            //         const raw = row?.overusage;
            //         if (!raw) return '';

            //         const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
            //         const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
            //         const rounded = parseFloat(raw).toString(); // เช่น 10000

            //         return `${fixed} ${noComma} ${rounded}`;
            //     },
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         return (<div className="text-right">{row?.overusage !== null && row?.overusage !== undefined ? formatNumberFourDecimal(row?.overusage) : null}</div>)
            //     }
            // },
            {
                accessorKey: "overusage",
                header: "Overusage (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.overusage;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    // const formatted = formatNumberFourDecimal(rawNumber); // "6,374.0000"
                    const formatted = formatNumberThreeDecimal(rawNumber); // "6,374.000"

                    // ส่งกลับเป็น String ที่ซ่อนค่าไว้เสิร์ช (แต่เราจะไปดัดตอน Sort แทน)
                    return `${rawNumber} ${formatted}`;
                },
                // บังคับ Sorting ให้กลับไปใช้ค่าตัวเลขจริง ๆ (โดยการแกะออกจาก String)
                sortingFn: (rowA, rowB, columnId) => {
                    const getVal = (row: any) => {
                        const str = row.getValue(columnId);
                        if (!str) return Number.NEGATIVE_INFINITY;
                        // แยกเอาเฉพาะเลขตัวแรกสุด (rawNumber) มาใช้ sort
                        const firstPart = str.split(' ')[0];
                        return Number(firstPart);
                    };

                    const valA = getVal(rowA);
                    const valB = getVal(rowB);

                    if (valA === valB) return 0;
                    return valA > valB ? 1 : -1;
                },
                cell: (info) => {
                    const realVal = info?.row?.original?.overusage;

                    // ตอนแสดงผล: ดึงเฉพาะส่วนที่เป็น format (หลังช่องว่าง) มาโชว์
                    // const val = info.getValue<string>();
                    // if (!val) return <div className="text-right"></div>;

                    // if (val.includes(" ")) {
                    //     const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    //     return <div className="text-right">{displayVal}</div>;
                    // }
                    // return formatNumberFourDecimal(val)
                    // return <div className="text-right w-full">{realVal ? formatNumberFourDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                    return <div className="text-right w-full">{realVal ? formatNumberThreeDecimal(realVal) : realVal == 0 ? '0.000' : null}</div>
                }
            },


            // {
            //     accessorKey: "action",
            //     id: 'actions',
            //     header: "Action",
            //     align: 'center',
            //     enableSorting: false,
            //     size: 100,
            //     cell: (info) => {
            //         const row: any = info?.row?.original;
            //         return (
            //             <BtnActionTable
            //                 togglePopover={togglePopover}
            //                 // row_id={row?.id}
            //                 row_id={row?.id + '_' + row?.request_number}
            //                 // disable={userPermission?.f_view == true && userPermission?.f_edit == true ? false : true}
            //                 disable={userPermission?.f_view == true ? false : true}
            //             />
            //         )
            //     }
            // },
        ], [selectAll, dataExport, selectedRoles, userPermission, user_permission]
        // ], [selectAll, filteredDataTable, dataExport, selectedRoles, userPermission, user_permission]
    )

    // useEffect(() => {
    //     fetchK(tabIndex);
    // }, [tabIndex])

    const handleRerenderOptionContractPoint = () => {

    }

    // useEffect(() => {
    //     handleFilter();
    // }, [dataTable])



    useEffect(() => {
        if (selectedRoles?.length == 0) {
            setSelectAll(false);
        }
    }, [selectedRoles])

    useEffect(() => {
        const publication_yeah = paginatedData?.filter((item: any) => item.publication == true)

        setSelectedRoles(publication_yeah);

        if (paginatedData?.length == publication_yeah?.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [paginatedData, tabIndex])
    // }, [paginatedData, filteredDataTable, tabIndex])


    useEffect(() => {
        setdataExport_(dataExport)
    }, [dataExport, dataSort_])


    // (อ่านคอมเม้นนะ) https://app.clickup.com/t/86ewxeuqe Filter Contract Point ขึ้นไม่ครบ ในตารางมี แต่ใน Filter ไม่ขึ้น
    useEffect(() => {

        if (srchShipperName?.length > 0 || srchContractCode?.length > 0) {
            const contractPointFilter = dataContractPointAll
                ?.filter(
                    (contract: any) =>
                        (srchContractCode?.length > 0 ? srchContractCode.includes(contract?.contract) : true) &&
                        (srchShipperName?.length > 0 ? srchShipperName.includes(contract?.group?.id) : true)
                )

            const data_contract_point_de_dup = Array.from(
                new Map(
                    contractPointFilter?.map((item: any) => [item.contract_point, { contract_point: item.contract_point, group: item.group ? item.group : item.shipper, contract: item.contract }])
                ).values()
            );

            const map_contract_point_option = data_contract_point_de_dup?.map((item: any) => ({
                value: item?.contract_point,
                label: item?.contract_point
            }))

            setDataContractPointForFilter(map_contract_point_option)
        }
    }, [srchShipperName, srchContractCode])

    const [detailMap, setDetailMap] = useState<Record<string, any[]>>({});
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleExpand = async (id: string) => {
        // กันยิงซ้ำ
        if (detailMap[id]) return;

        try {
            setLoadingMap(prev => ({ ...prev, [id]: true }));

            const res = await getDetail(id); // 👈 ใช้ function ของมึง

            setDetailMap(prev => ({
                ...prev,
                [id]: Array.isArray(res) ? res : []
            }));

        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMap(prev => ({ ...prev, [id]: false }));
        }
    };

    const getDetail = async (id: any) => {
        const split = id.split('_');

        // const filteredData = dataTable?.find((item: any) => item.id === id);
        // const filteredData = filteredDataTable?.find((item: any) => item.id === id);
        const filteredData = filteredDataTable?.find((item: any) => item?.id + '_' + item?.request_number === id);

        // ของใหม่
        const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize
        // let url = `/master/allocation/allocation-report-view?skip=${skip}&limit=100&id=${id}`
        let url = `/master/allocation/allocation-report-view?skip=${skip}&limit=100&id=${split[0]}`
        if (tabIndex == 0) {
            url += '&tab=1'
        }
        else {
            url += '&tab=2'
        }

        if (filteredData?.contract) {
            url += `&contract=${filteredData?.contract}`
        }
        if (filteredData?.group?.id_name) {
            url += `&shipper=${filteredData?.group?.id_name}`
        }
        if (filteredData?.gas_day) {
            url += `&gas_day=${filteredData?.gas_day}`
            url += `&start_date=${filteredData?.gas_day}`
            url += `&end_date=${filteredData?.gas_day}`
        }
        if (filteredData?.execute_timestamp) {
            url += `&execute_timestamp=${filteredData?.execute_timestamp}`
        }
        if (filteredData?.request_number) {
            url += `&request_number=${filteredData?.request_number}`
        }
        if (filteredData?.gas_hour) {
            url += `&gas_hour=${filteredData?.gas_hour}`
        }

        try {
            const response: any = await getService(url);

            const shipper_id = filteredData?.shipper ? filteredData?.shipper?.id_name : filteredData?.group?.id_name

            const filter_under_this_contract = response?.filter((item: any) =>
                item?.contract == filteredData?.contract &&
                item?.shipper == shipper_id &&
                item?.relation_point == filteredData?.contract_point &&
                item?.entry_exit == filteredData?.entry_exit &&
                item?.gas_hour == filteredData?.gas_hour &&
                item?.gas_day == filteredData?.gas_day
            )

            return filter_under_this_contract;
        } catch (error) {

        }
    };



    return (
        <div className="space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        // isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                        defaultValue={gas_day_from_somewhere_else ? gas_day_from_somewhere_else : null}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        // isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                        defaultValue={gas_day_to_from_somewhere_else ? gas_day_to_from_somewhere_else : null}

                    />

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        type="select-multi-checkbox" // Filter Shipper Name ปรับให้เป็น Multi Select (ทั้งสองแถบ) https://app.clickup.com/t/86eu4b8vc
                        value={srchShipperName}
                        // onChange={(e) => setSrchShipper(e.target.value)}
                        onChange={(e) => {
                            setSrchShipperName(e.target.value)
                            setSrchContractCode([])
                            // findContractCode(e.target.value, dataShipper)
                        }}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        options={dataShipper
                            ?.filter((item: any) => // เห็นแค่ชื่อตัวเองs
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

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select-multi-checkbox" // Filter Contract Code ปรับให้เป็น Multi Select (ทั้งสองแถบ) https://app.clickup.com/t/86eu4ba9x
                        value={srchContractCode}
                        onChange={(e) => {
                            setSrchContractCode(e.target.value)
                            // findContractPoint(e.target.value)
                        }}
                        options={
                            dataContractCode?.filter(
                                // (contract: any) => !srchShipperName?.length || srchShipperName.includes(contract?.group?.id)
                                (contract: any) => srchShipperName?.length > 0 ? srchShipperName.includes(contract?.group?.id) : true
                            ).map((item: any) => ({
                                value: item?.contract_code,
                                label: item?.contract_code,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchContractPoint"
                        label="Contract Point"
                        type="select-multi-checkbox" // Filter Contract Point ปรับให้เป็น Multi Select (ทั้งสองแถบ) https://app.clickup.com/t/86eu4b9f1
                        value={srchContractPoint}
                        onChange={(e) => {
                            setSrchContractPoint(e.target.value)
                            handleRerenderOptionContractPoint()
                        }}
                        // options={
                        //     dataContractPoint?.filter(
                        //         (contract: any) =>
                        //             (!srchContractCode?.length || srchContractCode.includes(contract?.contract)) &&
                        //             (!srchShipperName?.length || srchShipperName.includes(contract?.group?.id))
                        //     ).map((item: any) => ({
                        //         value: item.contract_point,
                        //         label: item.contract_point,
                        //     }))
                        // }

                        // options={dataContractPoint?.filter(
                        //     (contract: any) =>
                        //         (srchContractCode?.length > 0 ? srchContractCode.includes(contract?.contract) : true) &&
                        //         (srchShipperName?.length > 0 ? srchShipperName.includes(contract?.group?.id) : true)
                        // ).map((item: any) => ({
                        //     value: item?.contract_point,
                        //     label: item?.contract_point
                        // }))}

                        options={
                            (
                                (srchContractCode?.length > 0 || srchShipperName?.length > 0) ?
                                    dataContractPointAllForFilter
                                    :
                                    dataContractPoint?.map((item: any) => ({
                                        value: item?.contract_point,
                                        label: item?.contract_point
                                    }))
                            )
                        }

                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                {/* เอาปุ่ม Alloc&Bal ออก https://app.clickup.com/t/86eub6dbv */}

                {/* <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        {
                            // Shipper จะไม่เห็นปุ่ม Alloc & Bal https://app.clickup.com/t/86et8d33n
                            userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                            <BtnGeneral
                                textRender={"Alloc & Bal"}
                                iconNoRender={true}
                                bgcolor={"#00ADEF"}
                                generalFunc={handleExcute}
                                can_create={userPermission ? userPermission?.f_view : false}
                            />
                        }
                    </div>
                </aside> */}
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
                {["Daily", "Intraday"].map((label, index) => (
                    <Tab
                        key={label}
                        label={label}
                        id={`tab-${index}`}
                        sx={{
                            fontFamily: "Tahoma !important",
                            border: "1px solid",
                            borderColor: "#DFE4EA",
                            borderBottom: "none",
                            borderTopLeftRadius: "9px",
                            borderTopRightRadius: "9px",
                            textTransform: "none",
                            padding: "8px 16px",
                            backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                            color: tabIndex === index ? "#58585A" : "#9CA3AF",
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            "&:hover": {
                                backgroundColor: "#F3F4F6",
                            },
                        }}
                    />
                ))}
            </Tabs>

            <div className="border-[#DFE4EA] border-[1px] p-2 rounded-tl-none rounded-tr-lg shadow-sm">
                {/* <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">

                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="allocation/allocation-report"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu='allocation-report'
                                tabIndex={tabIndex == 0 ? '1' : '2'}
                            />
                        </div>
                    </div>
                </div> */}

                <TabTable value={tabIndex} index={0}>
                    {/* <TableAlloReportDaily
                        openEditForm={openEditForm}
                        openViewForm={openViewForm}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        // tableData={dataTable}
                        tableData={paginatedData}
                        isLoading={isLoading}
                        setMakeFetch={setMakeFetch}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        userDT={userDT}
                    /> */}

                    {/* ================== NEW TABLE ==================*/}
                    <TableExpanded
                        data={filteredDataTable}
                        columns={columnsDaily}
                        isLoading={isLoading}
                        onSortDataChange={(e) => {
                            setdataSort_(e || [])
                        }}
                        exportBtn={

                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    epAllocationAllocationReport({
                                        name: 'Allocation Report',
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility,
                                        // resData: dataExport,
                                        resData: dataExportRef.current?.length > 0 ? dataExportRef.current : filteredDataTable,
                                        tabIndex: tabIndex == 0 ? '1' : '2'
                                    })
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            dataExportRef.current = filteredData || [];
                        }}
                        pagination={pagination}
                        setPagination={setPagination}
                        expandedType="multi"
                        onExpandRow={handleExpand}
                        detailMap={detailMap}
                        loadingMap={loadingMap}
                    />
                    {/* <AppTable
                        data={filteredDataTable}
                        columns={columnsDaily}
                        isLoading={isLoading}
                        onSortDataChange={(e) => {
                            setdataSort_(e || [])
                        }}
                        exportBtn={

                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    epAllocationAllocationReport({
                                        name: 'Allocation Report',
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility,
                                        // resData: dataExport,
                                        resData: dataExportRef.current?.length > 0 ? dataExportRef.current : filteredDataTable,
                                        tabIndex: tabIndex == 0 ? '1' : '2'
                                    })
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            dataExportRef.current = filteredData || [];
                        }}
                        pagination={pagination}
                        setPagination={setPagination}
                        border={false}
                        fixHeight={false}
                    /> */}
                </TabTable>

                <TabTable value={tabIndex} index={1}>
                    {/* <TableAlloReportIntraday
                        openEditForm={openEditForm}
                        openViewForm={openViewForm}
                        selectedRoles={selectedRoles}
                        setSelectedRoles={setSelectedRoles}
                        // tableData={dataTable}
                        setMakeFetch={setMakeFetch}
                        tableData={paginatedData}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        userDT={userDT}
                    /> */}

                    <TableExpanded
                        data={filteredDataTable}
                        columns={userDT?.account_manage?.[0]?.user_type_id !== 3 ? columnsIntraday : columnsIntraday?.filter((f: any) => f?.accessorKey !== "publication")}
                        isLoading={isLoading}
                        onSortDataChange={(e) => {
                            setdataSort_(e || [])
                        }}
                        exportBtn={
                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    epAllocationAllocationReport({
                                        name: 'Allocation Report',
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility,
                                        // resData: dataExport,
                                        resData: dataExportRef.current?.length > 0 ? dataExportRef.current : filteredDataTable,
                                        tabIndex: tabIndex == 0 ? '1' : '2'
                                    })
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            dataExportRef.current = filteredData || [];
                        }}
                        pagination={pagination}
                        setPagination={setPagination}
                        expandedType="multi"
                        onExpandRow={handleExpand}
                        detailMap={detailMap}
                        loadingMap={loadingMap}
                    />

                    {/* ================== NEW TABLE ==================*/}
                    {/* <AppTable
                        data={filteredDataTable}
                        columns={userDT?.account_manage?.[0]?.user_type_id !== 3 ? columnsIntraday : columnsIntraday?.filter((f: any) => f?.accessorKey !== "publication")}
                        isLoading={isLoading}
                        exportBtn={
                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    epAllocationAllocationReport({
                                        name: 'Allocation Report',
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility,
                                        // resData: dataExport,
                                        resData: dataExportRef.current?.length > 0 ? dataExportRef.current : filteredDataTable,
                                        tabIndex: tabIndex == 0 ? '1' : '2'
                                    })
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                            // <BtnExport
                            //     textRender={"Export"}
                            //     data={dataExport}
                            //     data2={getFilterToExport()}
                            //     path="allocation/allocation-report"
                            //     can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                            //     specificMenu='allocation-report'
                            //     tabIndex={tabIndex == 0 ? '1' : '2'}
                            // />

                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            dataExportRef.current = filteredData || [];
                        }}
                        pagination={pagination}
                        setPagination={setPagination}
                        border={false}
                        fixHeight={false}
                    /> */}
                </TabTable>

            </div>

            {/* <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Allocation and Balancing Execution"
                stat="process"
                // description="Non TPA Point has been added."
                description={
                    <div>
                        <div className="text-center text-[17px]">
                            {`Your request is currently being processed. `}
                        </div>
                        <div className="text-center text-[17px]">
                            {`You will be notified when it's finished.`}
                        </div>
                    </div>
                }
            />

            <ModalViewAllocReport
                open={viewOpen}
                handleClose={() => {
                    setViewOpen(false);
                    if (resetForm) resetForm();
                }}
                data={viewData}
                dataMain={viewDataMain}
                tabIndex={tabIndex}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />


            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumns}
                initialColumns={tabIndex == 0 ? initialColumns?.filter((item: any) => item?.key !== 'gas_hour') : initialColumns}
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
                    overflow: 'hidden',
                    "& .MuiPopover-paper": {
                        borderRadius: '10px', // Transfer border
                    },
                }}
                className="z-50"
            >
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                        }
                    </ul>
                </div>
            </Popover>

        </div>
    )
}

export default ClientPage;