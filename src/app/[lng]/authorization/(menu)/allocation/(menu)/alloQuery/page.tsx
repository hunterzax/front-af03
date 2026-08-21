"use client";

import { useEffect, useMemo, useState } from "react";
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import { getService } from "@/utils/postService";
import { Tab, Tabs } from '@mui/material';
import { TabTable } from '@/components/other/tabPanel';
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { useFetchMasters } from "@/hook/fetchMaster";
import { useAppDispatch } from "@/utils/store/store";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { decryptData } from "@/utils/encryptionData";
import { filterByDateRange, findRoleConfigByMenuName, formatNumberFourDecimal, formatNumberFourDecimalEpsilon, formatNumberFourDecimalNoComma, formatNumberThreeDecimal, formatNumberThreeDecimalEpsilon, generateUserPermission, getDateRangeForApi, removeComma, toDayjs } from "@/utils/generalFormatter";
import BtnExport from "@/components/other/btnExport";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import dayjs from "dayjs";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { useForm } from "react-hook-form";
import getUserValue from "@/utils/getuserValue";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { ColumnDef } from "@tanstack/react-table";
import AppTable, { myCustomSortingByDateFn, sortingByDateFn } from "@/components/table/AppTable";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import equal from "fast-deep-equal";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues, resetField } = useForm<any>();

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
            //     const permission = findRoleConfigByMenuName('Allocation Query', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Allocation Query', userDT)
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

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filteredDataTableIntraDay, setFilteredDataTableIntraDay] = useState<any>([]);
    const [nominationPointList, setNominationPointList] = useState<any[]>([]);
    
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [srchGenerateFrom, setSrchGenerateFrom] = useState<Date | null>(null);
    const [srchGenerateTo, setSrchGenerateTo] = useState<Date | null>(null);
    const [srchVersion, setSrchVersion] = useState<any>([]);
    const [srchNomConcept, setSrchNomConcept] = useState<any>([]);

    //  data: array
    //  form: คือ start_date (string)
    //  to: คือ end_date (string)
    const filterGenerate = (data: any[], form: any, to: any) => {
        const start_date = form;
        const end_date = to;

        return data.filter((row) => {
            const execDate = toDayjs(row?.execute_timestamp * 1000); // ใช้ global toDayjs() หรือ import ด้านนอก

            if (start_date && !end_date) {
                // มีแค่ start_date → ถึงวันนี้
                const start = toDayjs(new Date(start_date).getTime()).startOf('day');
                const now = toDayjs(Date.now()).endOf('day');
                return execDate.isBetween(start, now, null, '[]');
            }

            if (!start_date && end_date) {
                // มีแค่ end_date → เฉพาะวัน end
                const end = toDayjs(new Date(end_date).getTime());
                return execDate.isSame(end, 'day');
            }

            if (start_date && end_date) {
                // มีทั้ง start และ end → ครอบช่วงเวลา
                const start = toDayjs(new Date(start_date).getTime()).startOf('day');
                const end = toDayjs(new Date(end_date).getTime()).endOf('day');
                return execDate.isBetween(start, end, null, '[]');
            }

            return true;
        });
    };

    // #region filter
    const handleFilter = () => {

        let result_gasday_from_to: any = dataTable
        if (srchGasDayFrom || srchGasDayTo) {
            const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
            result_gasday_from_to = filterByDateRange(dataTable, start_date, end_date);
        }

        if (srchGenerateFrom || srchGenerateTo) {
            const genarateResult = filterGenerate(result_gasday_from_to, srchGenerateFrom, srchGenerateTo)
            result_gasday_from_to = genarateResult;
        }

        const result = result_gasday_from_to.filter((item: any) => {
            return (
                // (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) && // ของแทร่
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper?.id) : true) && // ไทยประดิษฐ์
                (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                (srchZone?.length > 0 ? srchZone.includes(item?.zone_obj?.name) : true) &&
                (srchArea?.length > 0 ? srchArea.includes(item?.area_obj?.id.toString()) : true) &&
                (srchNomConcept?.length > 0 ? srchNomConcept.includes(item?.point) : true)
                // (srchVersion?.length > 0 ? srchVersion.includes(item?.execute_timestamp) : true) // มันหามาจาก api แล้วไม่ต้องกรอง
            );
        });

        // มันหามาจาก api แล้วไม่ต้องกรอง
        // let filtered_by_gen_from_to: any = result
        // if (srchGenerateFrom || srchGenerateTo) {
        //     const { start_date: x1, end_date: x2 } = getDateRangeForApi(srchGenerateFrom, srchGenerateTo);
        //     filtered_by_gen_from_to = filterByDateRange(result, x1, x2);
        // }
        // let filtered_data: any = filtered_by_gen_from_to
        // มันหามาจาก api แล้วไม่ต้องกรอง
        // if (watch('last_version')) {
        //     // หา last version
        //     const maxTimestamp = Math.max(...filtered_by_gen_from_to?.map((item: any) => item.execute_timestamp));
        //     filtered_data = filtered_by_gen_from_to?.filter((item: any) => item.execute_timestamp === maxTimestamp);
        // }


        setFilteredDataTable(result);
    }

    const handleFilterIntraday = () => {
        setFilteredDataTableIntraDay([])
        let result_gasday_from_to: any = dataIntraDay

        if (srchGasDayFrom || srchGasDayTo) {
            const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
            result_gasday_from_to = filterByDateRange(dataIntraDay, start_date, end_date);
        }

        if (srchGenerateFrom || srchGenerateTo) {
            const genarateResult = filterGenerate(result_gasday_from_to, srchGenerateFrom, srchGenerateTo)
            result_gasday_from_to = genarateResult;
        }

        const result = result_gasday_from_to.filter((item: any) => {
            return (
                // (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id) : true) && // ของแทร่
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper?.id) : true) && // ไทยประดิษฐ์
                (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                (srchZone?.length > 0 ? srchZone.includes(item?.zone_obj?.name) : true) &&
                (srchArea?.length > 0 ? srchArea.includes(item?.area_obj?.id.toString()) : true) &&
                (srchNomConcept?.length > 0 ? srchNomConcept.includes(item?.point) : true)
                // (srchVersion?.length > 0 ? srchVersion.includes(item?.execute_timestamp) : true) // มันหามาจาก api แล้วไม่ต้องกรอง
            );
        });

        // มันหามาจาก api แล้วไม่ต้องกรอง
        // let filtered_by_gen_from_to: any = result
        // if (srchGenerateFrom || srchGenerateTo) {
        //     const { start_date: x1, end_date: x2 } = getDateRangeForApi(srchGenerateFrom, srchGenerateTo);
        //     filtered_by_gen_from_to = filterByDateRange(result, x1, x2);
        // }
        // let filtered_data: any = filtered_by_gen_from_to
        // if (watch('last_version')) {
        //     // หา last version
        //     const maxTimestamp = Math.max(...filtered_by_gen_from_to?.map((item: any) => item.execute_timestamp));
        //     filtered_data = filtered_by_gen_from_to?.filter((item: any) => item.execute_timestamp === maxTimestamp);
        // }

        setFilteredDataTableIntraDay(result)
    }

    const handleFieldSearch = () => {
        fetchData();
    };

    const handleReset = () => {
        setSrchShipperName([])
        setSrchContractCode([]);
        setSrchZone([]);
        setSrchArea([]);
        setSrchGenerateFrom(null)
        setSrchGenerateTo(null)
        setSrchVersion([])
        setSrchNomConcept([])

        // setFilteredDataTable(dataTable); // v2.0.29 หน้า intraday หลังจากใช้ filter แล้ว กดรีเฟรช ข้อมูลไม่กลับมา https://app.clickup.com/t/86etc028g
        // setFilteredDataTableIntraDay(dataIntraDay); // v2.0.29 หน้า intraday หลังจากใช้ filter แล้ว กดรีเฟรช ข้อมูลไม่กลับมา https://app.clickup.com/t/86etc028g

        setFilteredDataTable([]); // Tad Daily / Tab Intraday Reset Filter แล้วข้อมูลไม่กลับไปเป็นตามเดิม https://app.clickup.com/t/86eu40je0
        setFilteredDataTableIntraDay([]); // Tad Daily / Tab Intraday Reset Filter แล้วข้อมูลไม่กลับไปเป็นตามเดิม https://app.clickup.com/t/86eu40je0

        setDataContract(dataContractOriginal)
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
                const execute_timestamp = toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm');

                return (
                    item?.entry_exit?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                    // item?.checkDb?.gas_day_text?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                    toDayjs(item?.gas_day).format('DD/MM/YYYY')?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                    item?.group?.name?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                    item?.contract?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                    item?.point?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||

                    item?.nominationValue?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for original filter data example 1200000
                    removeComma(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for remove comma example 1,200,000
                    formatNumberFourDecimal(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1,200.000
                    formatNumberFourDecimalNoComma(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1200.000

                    item?.systemAllocation?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for original filter data example 1200000
                    removeComma(item?.systemAllocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for remove comma example 1,200,000
                    formatNumberFourDecimal(item?.systemAllocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1,200.000
                    formatNumberFourDecimalNoComma(item?.systemAllocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1200.000

                    execute_timestamp?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower)
                )
            }
        );

        if (tabIndex == 0) {
            setFilteredDataTable(filtered);
        } else {
            setFilteredDataTableIntraDay(filtered)
        }
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0);
    const [dataTable, setData] = useState<any>([]);
    const [dataIntraDay, setDataIntraDay] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataContractFiltered, setDataContractFiltered] = useState<any[]>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);
    const [dataVersion, setDataVersion] = useState<any>([]);

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
        fetchData(newValue);

        if (newValue == 0) {
            setColumnVisibility(Object.fromEntries(initialColumns?.filter((item: any) => item?.key !== 'gas_hour')?.map((column: any) => [column.key, column.visible])))
        } else if (newValue == 1) {
            setColumnVisibility(Object.fromEntries(initialColumns?.map((column: any) => [column.key, column.visible])))
        }
    };

    const getShipperName = async () => {
        // Group (2 = TSO, 3 = Shipper, 4 = Other)
        const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
        setDataShipper(res_shipper_name)
    }

    useEffect(() => {
        getShipperName();
    }, [])

    useEffect(() => {
        setValue('last_version', true) // https://app.clickup.com/t/86et8r6z3 เข้ามาจะต้อง Default Check Box Last Version
    }, [])

    const getStartAndEndDateForApi = (gasDayFrom: any, gasDayTo: any) => {
        try {
            let from = gasDayFrom ? dayjs(gasDayFrom) : null;
            let to = gasDayTo ? dayjs(gasDayTo) : null;

            if (from && !to) {
                // // ถ้าไม่มี to → set เป็นสิ้นปีเดียวกัน
                // to = from.endOf("year");
                // ถ้าไม่มี to → set เป็นสิ้นเดือนเดียวกัน เพื่อไม่่ให้ eviden out of memory
                to = from.endOf("month");
            }

            if (to && !from) {
                // ถ้าไม่มี from → set เป็นต้นปีเดียวกัน
                // from = to.startOf("year");
                // ถ้าไม่มี from → set เป็นต้นเดือนเดียวกัน เพื่อไม่่ให้ eviden out of memory
                from = to.startOf("month");
            }

            if (from && to) {
                // const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
                const { start_date, end_date } = getDateRangeForApi(from.toDate(), to.toDate());
                return {
                    start_date,
                    end_date
                }
            }
            return {
                start_date: from?.format("YYYY-MM-DD"),
                end_date: to?.format("YYYY-MM-DD")
            }
        } catch (error) {
            return {
                start_date: undefined,
                end_date: undefined
            }
        }
    }

    const fetchData = async (tab?: number) => {
        try {
            setIsLoading(false);

            // // DATA SELECT VERSION
            // const res_master_version = await getService(`/master/allocation/version-exe`);
            // setDataVersion(res_master_version)

            // NX เข้ามาแล้วข้อมูลไม่ขึ้น Filter แค่ Gas Day From ก็ข้อมูลไม่ขึ้น ต้องเลือกทั้ง from ทั้ง to ข้อมูลถึงจะมา https://app.clickup.com/t/86eunajd7
            const { start_date, end_date } = getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo);

            if (start_date && end_date) {
                const skip = (pagination.pageIndex <= 0 ? 0 : pagination.pageIndex - 1) * pagination.pageSize

                let queryString = `start_date=${start_date}&end_date=${end_date}`
                if (watch('last_version')) {
                    queryString += `&is_last_version=${watch('last_version')}`
                } else {
                    queryString += `&version=${srchVersion}`
                }

                if ((tab ?? tabIndex) != 1) {
                    const response: any = await getService(`/master/allocation/allocation-query?${queryString}&skip=${skip}&limit=${filteredDataTable.length == 0 ? 100 : pagination.pageSize}&tab=1`);
                    let res_filtered_daily = (Array.isArray(response) ? response : []).filter((item: any) => // เห็นแค่ชื่อตัวเอง
                        userDT?.account_manage?.[0]?.user_type_id == 3
                            ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id
                            : true
                    )

                    // ปั้น data add shipper
                    const updatedDataDaily = res_filtered_daily?.map((item: any) => {
                        const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == item?.shipper)
                        return {
                            ...item,
                            shipper: find_shipper,
                        };
                    });

                    setData(updatedDataDaily);
                    setFilteredDataTable(updatedDataDaily);

                    // // DATA CONTRACT CODE
                    // const data_contract_code_de_dup = Array.from(
                    //     new Map(
                    //         response?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group }])
                    //     ).values()
                    // );
                    // setDataContract(data_contract_code_de_dup);
                    // setDataContractOriginal(data_contract_code_de_dup)
                }
                else {
                    const res_tab_intraday: any = await getService(`/master/allocation/allocation-query?${queryString}&skip=${skip}&limit=${itemsPerPage}&tab=2`);
                    let res_filtered_intraday = res_tab_intraday?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                        userDT?.account_manage?.[0]?.user_type_id == 3
                            ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id
                            : true
                    )

                    const updatedDataIntraday = res_filtered_intraday?.map((item: any) => {
                        const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == item?.shipper)
                        return {
                            ...item,
                            shipper: find_shipper,
                        };
                    });
                    setDataIntraDay(updatedDataIntraday);
                    setFilteredDataTableIntraDay(updatedDataIntraday);

                    // setDataIntraDay([])
                    // setFilteredDataTableIntraDay([])
                }
            }

            // DATA ZONE
            const data_zone_de_dup = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneMasterZ(data_zone_de_dup);


            // DATA CONTRACT CODE
            const res_contract_code_: any = await getService(`/master/capacity/pure-contract`);
            // console.log('res_contract_code_ : ', res_contract_code_);
            const res_contract_code = res_contract_code_?.filter((f:any) => f?.status_capacity_request_management_id !== 3)
            // console.log('res_contract_code : ', res_contract_code);
            setDataContract(res_contract_code);
            setDataContractOriginal(res_contract_code)

            // ของอิง
            // setData(mockDT);
            // setFilteredDataTable(mockDT);

            // setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
            setIsLoading(true);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    const [key, setKey] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const { nominationPointData, areaMaster, zoneMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    const initialColumns: any = [
        { key: 'entryexit', label: 'Entry / Exit', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'gas_hour', label: 'Gas Hour', visible: true },
        { key: 'shipper', label: 'Shipper Name', visible: true },
        { key: 'contract', label: 'Contract Code', visible: true },
        { key: 'nompoint', label: 'Nomination Point / Concept Point', visible: true },
        { key: 'nominatedval', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allo', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
    ];

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.filter((item: any) => item?.key !== 'gas_hour')?.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }
        if (forceRefetch || !zoneMaster?.data) {
            dispatch(fetchZoneMasterSlice());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, nominationPointData, forceRefetch, areaMaster, zoneMaster]); // Watch for forceRefetch changes

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### PAGINATION ###############
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 10, //default page size
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const columnsTabDaily = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "entryexit",
                header: "Entry / Exit",
                enableSorting: true,
                accessorFn: (row: any) => row?.entry_exit_obj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            {
                                row?.entry_exit_obj?.name ?
                                    <div
                                        className="w-[120px] p-1 text-center rounded-[50px]"
                                        style={{ background: row?.entry_exit_obj ? row?.entry_exit_obj?.color : '#FFF1CE' }}>
                                        {row?.entry_exit_obj && row?.entry_exit_obj?.name}
                                    </div>
                                    : null
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "zone",
                header: "Zone",
                enableSorting: true,
                accessorFn: (row: any) => row?.zone_obj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            {
                                row?.zone_obj?.name ?
                                    <div
                                        className="w-[120px] p-1 text-left rounded-[50px]"
                                        // style={{ background: row?.zone_obj ? row?.zone_obj?.color : '#FFF1CE' }}
                                        >
                                        {row?.zone_obj && row?.zone_obj?.name}
                                    </div>
                                    : null
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => toDayjs(row?.gas_day).format('DD/MM/YYYY') || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.gas_day ? toDayjs(row?.gas_day).format('DD/MM/YYYY') : null}</div>)
                }
            },
            {
                accessorKey: "shipper",
                header: "Shipper Name",
                enableSorting: true,
                // accessorFn: (row: any) => row?.group?.name || '',
                accessorFn: (row: any) => row?.shipper?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    // return (<div>{row?.group ? row?.group?.name : null}</div>)
                    return (<div>{row?.group ? row?.group?.name : row?.shipper ? row?.shipper?.name : null}</div>)
                }
            },
            {
                accessorKey: "contract",
                header: "Contract Code",
                enableSorting: true,
                accessorFn: (row: any) => row?.contract || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.contract ? row?.contract : null}</div>)
                }
            },
            {
                accessorKey: "nompoint",
                header: "Nomination Point / Concept Point",
                enableSorting: true,
                accessorFn: (row: any) => row?.point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.point ? row?.point : null}</div>)
                }
            },

            // {
            //     accessorKey: "nominationValue",
            //     header: "Nominated Value (MMBTU/D)",
            //     enableSorting: true,
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
            //         return (<div className="text-right">{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberFourDecimal(Number(String(row?.nominationValue ?? "").replace(/[^\d.-]/g, ""))) : null}</div>)
            //     }
            // },

            // {
            //     accessorKey: "systemAllocation",
            //     header: "System Allocation (MMBTU/D)",
            //     enableSorting: true,
            //     // accessorFn: (row: any) => formatNumberThreeDecimal(row?.systemAllocation) || '',
            //     accessorFn: (row: any) => {
            //         const raw = row?.systemAllocation;
            //         if (!raw) return '';

            //         const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
            //         const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
            //         const rounded = parseFloat(raw).toString(); // เช่น 10000

            //         return `${fixed} ${noComma} ${rounded}`;
            //     },
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         // return (<div className="text-right">{row?.systemAllocation ? formatNumberFourDecimal(row?.systemAllocation) : null}</div>)
            //         return (<div className="text-right">{row?.systemAllocation !== null && row?.systemAllocation !== undefined ? formatNumberFourDecimal(Number(String(row?.systemAllocation ?? "").replace(/[^\d.-]/g, ""))) : null}</div>)

            //     }
            // },


            // tanstack เสิช 6,374 ไม่เจอ แต่ 6374 แล้วเจอ
            // {
            //     accessorKey: "nominationValue",
            //     header: "Nominated Value (MMBTU/D)",
            //     enableSorting: true,
            //     // 1. ส่งค่าออกไปเป็น Number ปกติ (ถ้าไม่มีค่าให้ส่ง null)
            //     accessorFn: (row: any) => {
            //         const val = row?.nominationValue;
            //         if (val === null || val === undefined || val === '') return null;
            //         return Number(val);
            //     },
            //     // 2. เขียน Custom Sorting เองเพื่อจัดการ null/undefined
            //     sortingFn: (rowA, rowB, columnId) => {
            //         let a = rowA.getValue(columnId);
            //         let b = rowB.getValue(columnId);

            //         // กำหนดค่า "ต่ำเตี้ยเรี่ยดิน" ให้กับ null/undefined
            //         // ใช้ Number.NEGATIVE_INFINITY เพื่อให้มันน้อยกว่าค่าติดลบทุกตัวบนโลก
            //         const valA = (a === null || a === undefined) ? Number.NEGATIVE_INFINITY : a;
            //         const valB = (b === null || b === undefined) ? Number.NEGATIVE_INFINITY : b;

            //         if (valA === valB) return 0;
            //         return valA > valB ? 1 : -1;
            //     },
            //     cell: (info) => {
            //         const val = info.getValue<number>();
            //         return (
            //             <div className="text-right">
            //                 {val !== null ? formatNumberFourDecimal(val) : ""}
            //             </div>
            //         );
            //     }
            // },


            {
                accessorKey: "nominationValue",
                header: "Nominated Value (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.nominationValue || '0';
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
                    const val = info.getValue<string>();
                    if (!val) return <div className="text-right"></div>;

                    const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    return <div className="text-right">{displayVal}</div>;
                }
            },
            {
                accessorKey: "systemAllocation",
                header: "System Allocation (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.systemAllocation;
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
                    const val = info.getValue<string>();
                    if (!val) return <div className="text-right"></div>;

                    const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    return <div className="text-right">{displayVal}</div>;
                }
            },





            {
                accessorKey: "timestamp",
                header: "Timestamp",
                width: 150,
                enableSorting: true,
                accessorFn: (row: any) => toDayjs(row?.execute_timestamp * 1000)?.format('DD/MM/YYYY HH:mm') || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>)
                }
            },
        ],
        []
    );

    const columnsTabIntraday = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "entryexit",
                header: "Entry / Exit",
                enableSorting: true,
                accessorFn: (row: any) => row?.entry_exit_obj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            {
                                row?.entry_exit_obj?.name ?
                                    <div
                                        className="w-[120px] p-1 text-center rounded-[50px]"
                                        style={{ background: row?.entry_exit_obj ? row?.entry_exit_obj?.color : '#FFF1CE' }}>
                                        {row?.entry_exit_obj && row?.entry_exit_obj?.name}
                                    </div>
                                    : null
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "zone",
                header: "Zone",
                enableSorting: true,
                accessorFn: (row: any) => row?.zone_obj?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex items-center justify-center">
                            {
                                row?.zone_obj?.name ?
                                    <div
                                        className="w-[120px] p-1 text-left rounded-[50px]"
                                        // style={{ background: row?.zone_obj ? row?.zone_obj?.color : '#FFF1CE' }}
                                        >
                                        {row?.zone_obj && row?.zone_obj?.name}
                                    </div>
                                    : null
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "gas_day",
                header: "Gas Day",
                enableSorting: true,
                accessorFn: (row: any) => toDayjs(row?.gas_day).format('DD/MM/YYYY') || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.gas_day ? toDayjs(row?.gas_day).format('DD/MM/YYYY') : null}</div>)
                }
            },
            {
                accessorKey: "gas_hour",
                header: "Gas Hour",
                enableSorting: true,
                accessorFn: (row: any) => row?.gas_hour + ":00" || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.gas_hour ? row?.gas_hour + ":00" : null}</div>)
                }
            },
            {
                accessorKey: "shipper",
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
                accessorKey: "contract",
                header: "Contract Code",
                enableSorting: true,
                accessorFn: (row: any) => row?.contract || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.contract ? row?.contract : null}</div>)
                }
            },
            {
                accessorKey: "nompoint",
                header: "Nomination Point / Concept Point",
                enableSorting: true,
                sortDescFirst: true,
                accessorFn: (row: any) => row?.point || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.point ? row?.point : null}</div>)
                }
            },

            // {
            //     accessorKey: "nominationValue",
            //     header: "Nominated Value (MMBTU/D)",
            //     enableSorting: true,
            //     sortDescFirst: true,
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
            //         // return (<div className="text-right">{row?.nominationValue ? formatNumberFourDecimal(row?.nominationValue) : null}</div>)
            //         return (<div className="text-right">{row?.nominationValue !== null && row?.nominationValue !== undefined ? formatNumberFourDecimal(Number(String(row?.nominationValue ?? "").replace(/[^\d.-]/g, ""))) : null}</div>)
            //     }
            //     // cell: (info) => {
            //     //     const raw = info?.row?.original?.nominationValue ?? '';
            //     //     return (
            //     //         <div className="text-right">
            //     //             {formatNumberFourDecimal(String(raw).trim())}
            //     //         </div>
            //     //     );
            //     // }
            // },
            // {
            //     accessorKey: "systemAllocation",
            //     header: "System Allocation (MMBTU/D)",
            //     enableSorting: true,
            //     sortDescFirst: true,
            //     // accessorFn: (row: any) => formatNumberThreeDecimal(row?.systemAllocation) || '',
            //     accessorFn: (row: any) => {
            //         const raw = row?.systemAllocation;
            //         if (!raw) return '';

            //         const fixed = formatNumberFourDecimal(raw); // เช่น 10,000.0000
            //         const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
            //         const rounded = parseFloat(raw).toString(); // เช่น 10000

            //         return `${fixed} ${noComma} ${rounded}`;
            //     },
            //     cell: (info) => {
            //         const row: any = info?.row?.original
            //         // return (<div className="text-right">{row?.systemAllocation ? formatNumberFourDecimal(row?.systemAllocation) : null}</div>)
            //         // return (<div className="text-right">{row?.systemAllocation ? formatNumberFourDecimal(row?.systemAllocation) : null}</div>)
            //         return (<div className="text-right">{row?.systemAllocation !== null && row?.systemAllocation !== undefined ? formatNumberFourDecimal(Number(String(row?.systemAllocation ?? "").replace(/[^\d.-]/g, ""))) : null}</div>)
            //     }
            // },


            {
                accessorKey: "nominationValue",
                header: "Nominated Value (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.nominationValue;
                    if (val === null || val === undefined || val === '') return '';

                    const rawNumber = Number(val);
                    // const formatted = formatNumberFourDecimalEpsilon(rawNumber); // "6,374.0000"
                    const formatted = formatNumberThreeDecimalEpsilon(rawNumber); // "6,374.000"

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
                    const val = info.getValue<string>();
                    if (!val) return <div className="text-right"></div>;

                    const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"

                    return <div className="text-right">{displayVal}</div>;
                }
            },
            {
                accessorKey: "systemAllocation",
                header: "System Allocation (MMBTU/D)",
                enableSorting: true,
                // คืนค่าเป็น String ที่มีทั้งแบบ 'เลขดิบ' และ 'เลขมีคอมม่า'
                // เพื่อให้ Global Filter มองเห็นทั้งสองร่าง
                accessorFn: (row: any) => {
                    const val = row?.systemAllocation;
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
                    const val = info.getValue<string>();
                    if (!val) return <div className="text-right"></div>;

                    const displayVal = val.split(' ')[1]; // หยิบ "6,374.0000"
                    return <div className="text-right">{displayVal}</div>;
                }
            },


            {
                accessorKey: "execute_timestamp",
                header: "Timestamp",
                enableSorting: true,
                width: 120,
                accessorFn: (row: any) => toDayjs(row?.execute_timestamp * 1000)?.format('DD/MM/YYYY HH:mm') || '',
                sortingFn: (rowA, rowB, columnId) => {
                    return sortingByDateFn(rowA?.original?.execute_timestamp * 1000, rowB?.original?.execute_timestamp * 1000)
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className="text-right">{row?.execute_timestamp ? toDayjs(row?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</div>)
                }
            },
        ],
        []
    )

    const [dataExport, setDataExport] = useState<any>([]);
    const [dataVerSionFilter, setDataVerSionFilter] = useState<any>([]);

    useEffect(() => {
        setDataVerSionFilter(dataVersion)
        setValue('data_version_filter', dataVersion)
    }, [dataVersion])

    // srchGenerateFrom = Tue Jul 01 2025 00:00:00 GMT+0700 (Indochina Time)
    // srchGenerateTo = Tue Jul 01 2025 00:00:00 GMT+0700 (Indochina Time)

    // ถ้า mode == 'from' ให้หา dataVersion2.gas_day >= srchGenerateFrom
    // ถ้า mode == 'to' ให้หา dataVersion2.gas_day <= srchGenerateTo

    // ถ้า srchGenerateFrom หรือ srchGenerateTo เป็น null ให้กรองแค่อันที่มี
    // ถ้าเป็น null คู่ ไม่ต้องกรอง

    const filterVersion = async (mode?: any, date?: any) => {
        let from = srchGenerateFrom ? toDayjs(watch('generate_from')).startOf('day') : null;
        let to = srchGenerateTo ? toDayjs(watch('generate_to')).startOf('day') : null;

        const istoday: any = toDayjs(new Date()).startOf('day');
        const isStartMonth: any = toDayjs(new Date()).startOf('month');

        if (from && to == null) {
            // ถ้า from มีค่าแค่อย่างเดียว to ต้องเท่ากับวันปัจจุบัน
            to = istoday;
        } else if (from == null && to) {
            // ถ้า to มีค่าแค่อย่างเดียว from ต้องเท่ากับ to
            from = to
        } else if (from == null && to == null) {
            // ถ้า from กับ to ไม่มีค่าเลย ให้ from เป็น ต้นเดือน และ to เป็นวันปัจจุบัน
            from = isStartMonth
            to = istoday;
        }

        // DATA SELECT VERSION
        let fromString = ''
        let toString = ''
        if ((!from || !to) && srchGasDayFrom && srchGasDayTo) {
            const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
            if (!from) {
                fromString = start_date
            }
            if (!to) {
                toString = end_date
            }
        }

        let versionList = dataVersion
        const res_master_version = await getService(`/master/allocation/allocation-query-version?start_date=${from?.format('YYYY-MM-DD') || fromString}&end_date=${to?.format('YYYY-MM-DD') || toString}`);

        if (res_master_version && Array.isArray(res_master_version)) {
            // setDataVersion(res_master_version)
            versionList = res_master_version
        }

        const result = versionList?.filter((item: any) => {
            const gasDate = toDayjs(item.gas_day).startOf('day');

            /* ── เงื่อนไขกรอง ──────────────────────────
               1. ไม่มี from และ to  →  ไม่ต้องกรอง
               2. มี from อย่างเดียว  →  ≥ from
               3. มี to   อย่างเดียว  →  ≤ to
               4. มีทั้งสอง           →  ≥ from AND ≤ to
            */
            if (!from && !to) return true;

            if (from && to) return gasDate.isSameOrAfter(from) && gasDate.isSameOrBefore(to);
            if (from) return gasDate.isSameOrAfter(from);
            /* เหลือแค่กรณีมี to อย่างเดียว */
            return gasDate.isSameOrBefore(to);
        });

        const res_2 = result?.map((item: any) => {
            return {
                ...item,
                version_ts: toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm'),
                version_filter: toDayjs(item?.execute_timestamp * 1000).format('YYYY-MM-DD')
            }
        }).filter((item: any) => {
            const gasDate = toDayjs(item.version_filter).startOf('day');

            /* ── เงื่อนไขกรอง ──────────────────────────
               1. ไม่มี from และ to  →  ไม่ต้องกรอง
               2. มี from อย่างเดียว  →  ≥ from
               3. มี to   อย่างเดียว  →  ≤ to
               4. มีทั้งสอง           →  ≥ from AND ≤ to
            */
            if (!from && !to) return true;

            if (from && to) return gasDate.isSameOrAfter(from) && gasDate.isSameOrBefore(to);
            if (from) return gasDate.isSameOrAfter(from);
            /* เหลือแค่กรณีมี to อย่างเดียว */
            return gasDate.isSameOrBefore(to);
        })

        setValue('data_version_filter', res_2)
        setDataVerSionFilter(res_2);
    };

    useEffect(() => {
        filterVersion();
    }, [watch('generate_from'), watch('generate_to')])

    useEffect(() => {
        handleFilter();
        handleFilterIntraday();
    }, [dataIntraDay, dataTable])


    const dateContract = (dataContract_:any) => {
        const fromDate = dayjs(srchGasDayFrom).startOf("day");

            const toDate = srchGasDayTo
            ? dayjs(srchGasDayTo).endOf("day")
            : dayjs(srchGasDayFrom).endOf("day");

            const filteredContract = dataContract_?.filter((contract: any) => {
            if (!contract?.contract_start_date) return false;

            const contractStart = dayjs(contract.contract_start_date);
            const contractEndDate = contract?.terminate_date || contract?.extend_deadline || contract?.contract_end_date
            const contractEnd = contractEndDate
                ? dayjs(contractEndDate).subtract(1, "day")
                : null;

            if (!contractStart.isValid()) return false;

            // contract_start_date <= วันที่สิ้นสุดที่ค้นหา
            const startIsValid = !contractStart.isAfter(toDate);

            // contract_end_date >= วันที่เริ่มต้นที่ค้นหา
            // ถ้า contract_end_date เป็น null ให้ถือว่าสัญญายังไม่สิ้นสุด
            const endIsValid = !contractEnd || !contractEnd.isBefore(fromDate);

            return startIsValid && endIsValid;
            }) || [];

            console.log("filteredContract :", filteredContract);
            setDataContractFiltered(filteredContract);
            return filteredContract
    }

    useEffect(() => {
        dateContract(dataContract?.filter((item: any) => srchShipperName?.length > 0 ? srchShipperName?.includes(item?.group?.id) : true) || []);
    }, [srchGasDayFrom, srchGasDayTo, srchShipperName, dataContract])

    useEffect(() => {
        if(nominationPointData && Array.isArray(nominationPointData.data) && nominationPointData.data.length > 0) {
            let additionalPoint: { nomination_point: any; }[] = [];
            const defaultAdditionalPoint = [{nomination_point: 'East_to_RA6'}, {nomination_point: 'West_to_RA6'}, {nomination_point: 'East_to_BVW10'}, {nomination_point: 'West_to_BVW10'}];
            if(tabIndex == 0) {
                if(dataTable && Array.isArray(dataTable) && dataTable.length > 0) {
                    dataTable.map((item: any) => {
                        if(!nominationPointData.data.find((nominationPoint: any) => item.point == nominationPoint.nomination_point)) {
                            additionalPoint.push({nomination_point: item.point})
                        }
                    })
                }
                else{
                    additionalPoint = defaultAdditionalPoint;
                }
            }
            else{
                if(dataIntraDay && Array.isArray(dataIntraDay) && dataIntraDay.length > 0) {
                    dataIntraDay.map((item: any) => {
                        if(!nominationPointData.data.find((nominationPoint: any) => item.point == nominationPoint.nomination_point)) {
                            additionalPoint.push({nomination_point: item.point})
                        }
                    })
                }
                else{
                    additionalPoint = defaultAdditionalPoint;
                }
            }

            const filteredNominationPoint = [...nominationPointData.data, ...additionalPoint].filter((item: any, index: any, self: any): any =>
                index === self.findIndex((i: any) => i.nomination_point === item.nomination_point)
            )
            .filter((itemx: any) => srchZone?.length > 0 ? itemx?.zone ? srchZone.includes(itemx.zone.name) : srchZone.some((zone: any) => itemx.nomination_point.toLowerCase().includes(zone.toLowerCase())) : true)
            .filter((itemx: any) => srchArea?.length > 0 ? srchArea.includes(itemx?.area?.id?.toString()) : true)
    
            setNominationPointList(filteredNominationPoint)
        }
    }, [dataTable, dataIntraDay, nominationPointData, tabIndex, srchZone, srchArea])
    
    useEffect(() => {
      console.log('_filteredDataTable : ', filteredDataTable);
    }, [filteredDataTable])
    

    return (
        <div className="space-y-2">
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
                        userDT?.account_manage?.[0]?.user_type_id !== 3 ?
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select-multi-checkbox"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id] : srchShipperName}
                                onChange={(e) => {
                                    setSrchShipperName(e?.target?.value)
                                }}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        value: item?.id,
                                        label: item?.name,
                                    }))
                                }
                            />
                            :
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                isDisabled={true}
                                value={userDT?.account_manage?.[0]?.group?.id}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        // value: item.name,
                                        value: item.id,
                                        label: item.name,
                                    }))
                                }
                            />
                    }

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select-multi-checkbox" // Tab Daily / Tab Intraday Filter Contract Code ปรับให้เป็น Select Multi https://app.clickup.com/t/86eu3ynk9
                        value={srchContractCode}
                        placeholder="Select Contract Code"
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // options={dataContract?.map((item: any) => ({
                        //     value: item?.contract_code,
                        //     label: item?.contract_code
                        // }))}
                        // options={dataContract?.filter((item: any) => srchShipperName?.length > 0 ? srchShipperName?.includes(item?.group?.id) : true).map((item: any) => ({ // Tab Daily / Tab Intraday : Filter Contract Code หากมีการเลือก Filter Shipper มาก่อนจะต้องกรอง Contract Code ให้ตรงกับ Shipper นั้นด้วย (ถ้าไม่ได้เลือก Filter Shipper Name มา ให้แสดงทุก Contract Code ที่มีใน Table) https://app.clickup.com/t/86eu3ykrj
                        options={dataContractFiltered.map((item: any) => ({ // Tab Daily / Tab Intraday : Filter Contract Code หากมีการเลือก Filter Shipper มาก่อนจะต้องกรอง Contract Code ให้ตรงกับ Shipper นั้นด้วย (ถ้าไม่ได้เลือก Filter Shipper Name มา ให้แสดงทุก Contract Code ที่มีใน Table) https://app.clickup.com/t/86eu3ykrj
                            value: item?.contract_code,
                            label: item?.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        type="select-multi-checkbox"
                        value={srchZone}
                        onChange={(e) => setSrchZone(e.target.value)}
                        // options={zoneMaster?.data?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.name
                        // }))}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                        customWidth={200}
                        customWidthPopup={200}
                    />

                    <InputSearch
                        id="searchAreaName"
                        label="Area"
                        value={srchArea}
                        type="select-multi-checkbox" // Tab Daily / Tab Intraday Filter Area ปรับให้เป็น Select Multi https://app.clickup.com/t/86eu3yp19
                        onChange={(e) => setSrchArea(e.target.value)}
                        placeholder="Select Area"
                        options={areaMaster?.data?.filter((item: any) =>
                            srchZone?.length > 0 ? srchZone.includes(item?.zone?.name)
                                : item !== null)?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))
                        }
                        customWidth={200}
                        customWidthPopup={200}
                    />

                    <InputSearch
                        id="searchNomPointConceptPoint"
                        label="Nomination Point / Concept Point"
                        type="select-multi-checkbox" // Tab Daily / Tab Intraday Filter Nomination Point/Concept Point ปรับให้เป็น Select Multi https://app.clickup.com/t/86eu3ypa1
                        value={srchNomConcept}
                        onChange={(e) => setSrchNomConcept(e.target.value)}
                        // options={nominationPointData?.data
                        //     ?.filter((item: any) => srchArea?.length > 0 ? srchArea.includes(item.area.id.toString()) : true) // ถ้าไม่ได้กด search area ไม่ต้องกรอง
                        //     .map((item: any) => ({
                        //         // value: item?.id?.toString(),
                        //         value: item.nomination_point,
                        //         label: item.nomination_point,
                        //     }))
                        // }
                        // กรองซ้ำ nominationPointData
                        options={nominationPointList.map((item: any) => ({
                            value: item.nomination_point,
                            label: item.nomination_point
                        }))}
                    />

                    <DatePickaSearch
                        key={"generate_from_" + key}
                        label="Generate From"
                        placeHolder="Select Generate From"
                        allowClear
                        onChange={(e: any) => {
                            setSrchGenerateFrom(e ? e : null)
                            setValue('generate_from', e)
                        }}
                        customWidth={200}
                        // disabled={true}
                        disabled={watch('last_version') ? true : false}
                        isFixDay={true}
                        dateToFix={srchGenerateFrom}
                    />

                    <DatePickaSearch
                        key={"generate_to_" + key}
                        label="Generate To"
                        placeHolder="Select Generate To"
                        allowClear
                        onChange={(e: any) => {
                            setSrchGenerateTo(e ? e : null)
                            setValue('generate_to', e)
                        }}
                        customWidth={200}
                        // disabled={true}
                        disabled={watch('last_version') ? true : false}
                        isFixDay={true}
                        dateToFix={srchGenerateTo}
                    />

                    {/* https://app.clickup.com/t/86et8ar8h  Filter Version จะเป็น Timestamp ที่มาจากการกด Execute */}
                    <InputSearch
                        id="searchVersion"
                        label="Version"
                        type="select-multi-checkbox"
                        value={srchVersion}
                        isDisabled={watch('last_version') || srchGenerateFrom == null ? true : false} // ถ้า Check Box Last Version อยู่ Filter Version เทา https://app.clickup.com/t/86et8aqb1
                        onChange={(e) => setSrchVersion(e.target.value)}
                        options={watch('data_version_filter') ? watch('data_version_filter')?.map((item: any) => ({
                            value: item?.execute_timestamp,
                            label: toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm')
                        })) : []}
                        sortOptionBy="dateMax"
                    />

                    <div className="w-auto relative">
                        <CheckboxSearch2
                            {...register('last_version')}
                            id="last_version_filter"
                            label="Last Version"
                            type="single-line"
                            value={watch('last_version') ? watch('last_version') : false}
                            // onChange={(e: any) => setValue('last_version', e?.target?.checked)}
                            onChange={(e: any) => {
                                if(e?.target?.checked) {
                                    resetField(`generate_from_${key}`)
                                    resetField(`generate_to_${key}`)
                                    resetField('generate_from')
                                    resetField('generate_to')
                                    resetField('searchVersion_${key}')
                                    setSrchGenerateFrom(null)
                                    setSrchGenerateTo(null)
                                    setSrchVersion([])
                                }
                                setValue('last_version', e?.target?.checked)
                                // handleCheckboxChange(e.target, "f_view", e.target.checked)
                            }}
                        />
                    </div>

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
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
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start pb-4">
                        <div className="w-[50%] flex flex-column items-center justify-start gap-4">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>
                        </div>
                        <div className="w-[50%] flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="allocation/allocation-query"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu='allocation-query'
                                tabIndex={tabIndex == 0 ? '1' : '2'}
                            />
                        </div>
                    </div>
                </div> */}

                <TabTable value={tabIndex} index={0}>
                    {/* <TableAlloQuery
                        // tableData={dataTable}
                        // tableData={filteredDataTable}
                        tableData={paginatedData}
                        isLoading={isLoading}
                        columnVisibility={columnVisibility}
                    /> */}

                    {/* ================== NEW TABLE ==================*/}
                    <AppTable
                        data={filteredDataTable}
                        columns={columnsTabDaily}

                        isLoading={isLoading}
                        exportBtn={
                            <BtnExport
                                textRender={"Export"}
                                data={dataExport}
                                // data2={getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo)}
                                data2={
                                    {
                                        "date": getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo),
                                        "last_version": watch('last_version')
                                    }
                                }
                                path="allocation/allocation-query"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu='allocation-query'
                                tabIndex={'1'}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            const newData = filteredData || [];

                            // Check if the filtered data is different from current dataExport
                            // if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                            //     setDataExport(newData);
                            // }

                            // ถ้าข้อมูลใหญ่ อย่าใช้ stringify เทียบกัน ให้ใช้ equal จาก fast-deep-equal
                            // import equal from "fast-deep-equal";
                            if (!equal(dataExport, newData)) {
                                setDataExport(newData);
                            }
                        }}
                        pagination={pagination}
                        setPagination={setPagination}
                        border={false}
                        fixHeight={false}
                    />
                </TabTable>

                <TabTable value={tabIndex} index={1}>
                    {/* ================== NEW TABLE ==================*/}
                    <AppTable
                        data={filteredDataTableIntraDay}
                        columns={columnsTabIntraday}
                        isLoading={isLoading}
                        exportBtn={
                            <BtnExport
                                textRender={"Export"}
                                data={dataExport}
                                data2={
                                    {
                                        "date": getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo),
                                        "last_version": watch('last_version')
                                    }
                                }
                                path="allocation/allocation-query"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu='allocation-query'
                                tabIndex={'2'}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                        onFilteredDataChange={(filteredData: any) => {
                            const newData = filteredData || [];
                            // Check if the filtered data is different from current dataExport
                            function sameByKeys(a: any[], b: any[]) {
                                if (a === b) return true;
                                if (!a || !b || a.length !== b.length) return false;

                                for (let i = 0; i < a.length; i++) {
                                    if (a[i].id !== b[i].id) return false;
                                }
                                return true;
                            }
                            // if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                            if (!sameByKeys(dataExport, newData)) {
                                setDataExport(newData);
                            }
                        }}
                        pagination={isLoading ? pagination : { pageIndex: 0, pageSize: 0 }}
                        setPagination={setPagination}
                        border={false}
                        fixHeight={false}
                    />
                </TabTable>
            </div>

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={tabIndex == 0 ? initialColumns?.filter((item: any) => item?.key !== 'gas_hour') : initialColumns}
            />
        </div>
    )
}

export default ClientPage;