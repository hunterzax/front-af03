"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { findRoleConfigByMenuName, formatDate, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNom, generateUserPermission, getDateRangeForApi, toDayjs } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from 'dayjs';
import { useForm } from "react-hook-form";
import TableMain from "./form/table";
import { CustomTooltip } from "@/components/other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import { useSearchParams } from "next/navigation";
import BtnGeneral from "@/components/other/btnGeneral";
import { epBalancingBalanceReport } from "@/utils/exportFunc";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    // route มาจาก tariff
    const searchParams = useSearchParams();
    const gas_day_from_somewhere_else: any = searchParams.get("from");
    const gas_day_to_from_somewhere_else: any = searchParams.get("to");

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
            //     const permission = findRoleConfigByMenuName('Balance Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Balance Report', userDT)
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
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !shipperGroupData?.data) {
            dispatch(fetchShipperGroup());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, shipperGroupData]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(() => { return dayjs().startOf('month').toDate(); });
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(() => { return dayjs().toDate(); });
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [bodyExport, setBodyExport] = useState<any>([]);

    const [showTotal, setShowTotal] = useState<any>(true);
    const [showTotalAllShipper, setShowTotalAllShipper] = useState<any>(true);

    const [sortedData, setSortedData] = useState<any>([]);

    // const handleFieldSearch = async () => {
    //     setIsLoading(false);

    //     setShowTotal(watch('filter_show_total'))
    //     setShowTotalAllShipper(watch('filter_show_total_all_shipper'))

    //     const { start_date, end_date } = getDateRangeForApi(srchStartDate, srchEndDate);

    //     const body_main = {
    //         "start_date": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), 
    //         "end_date": srchEndDate ? dayjs(srchEndDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), 
    //         "skip": "100",
    //         "limit": "100"
    //     }

    //     const body_export = {
    //         "start_date": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), 
    //         "end_date": srchEndDate ? dayjs(srchEndDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), 
    //         "skip": 100,
    //         "limit": 100
    //     }

    //     setBodyExport(body_export)
    //     // MAIN DATA 
    //     const res_ = await postService('/master/balancing/balance-report', body_main);

    //     // If dates are null, use today
    //     const start = start_date ? dayjs(start_date).startOf("day") : dayjs().startOf("day");
    //     const end = end_date ? dayjs(end_date).endOf("day") : dayjs().endOf("day");

    //     let srchShipperName_ = srchShipperName
    //     if (userDT?.account_manage?.[0]?.user_type_id == 3) {
    //         srchShipperName_ = [userDT?.account_manage?.[0]?.group?.id_name]
    //     }

    //     // const result = dataTable
    //     const result = res_?.data?.filter((item: any) => {
    //         const gasDay = toDayjs(item.gas_day);
    //         return gasDay.isBetween(start, end, null, "[]"); // inclusive range
    //     }).map((item: any) => {
    //         // If no filter for shipper name, return all
    //         if (!srchShipperName_ || srchShipperName_.length === 0) return item;

    //         const filteredShipperData = item.shipper_data.filter((sd: any) =>
    //             srchShipperName_.includes(sd.shipper)
    //         );

    //         if (filteredShipperData.length === 0) return null;

    //         return {
    //             ...item,
    //             shipper_data: filteredShipperData,
    //         };
    //     }).filter(Boolean); // remove nulls

    //     const latestByGasDay = (result?.length ? Object.values(
    //         result.reduce((acc: Record<string, any>, curr: any) => {
    //             const gasDay = curr.gas_day;
    //             if (!acc[gasDay] || curr.execute_timestamp > acc[gasDay].execute_timestamp) {
    //                 acc[gasDay] = curr;
    //             }
    //             return acc;
    //         }, {})
    //     ) : []).sort((a: any, b: any) => dayjs(b.gas_day).diff(dayjs(a.gas_day)));

    //     setTimeout(() => {
    //         setIsLoading(true);
    //     }, 1000);

    //     setData(latestByGasDay)
    //     setFilteredDataTable(latestByGasDay)
    //     setCurrentPage(1);
    //     setdataExport_(latestByGasDay)

    //     // userDT?.account_manage?.[0]?.user_type_id == 3
    //     //                             ? item?.id === userDT?.account_manage?.[0]?.group?.id
    //     //                             : true
    // };

    const handleFieldSearch = async (override?: {
    startDate?: Date | null;
    endDate?: Date | null;
    shipperName?: any[];
    filterShowTotal?: boolean;
    filterShowTotalAllShipper?: boolean;
}) => {
    setIsLoading(false);

    const startDate = override?.startDate !== undefined ? override.startDate : srchStartDate;
    const endDate = override?.endDate !== undefined ? override.endDate : srchEndDate;
    const shipperName = override?.shipperName !== undefined ? override.shipperName : srchShipperName;

    const filterShowTotal =
        override?.filterShowTotal !== undefined
            ? override.filterShowTotal
            : watch('filter_show_total');

    const filterShowTotalAllShipper =
        override?.filterShowTotalAllShipper !== undefined
            ? override.filterShowTotalAllShipper
            : watch('filter_show_total_all_shipper');

    setShowTotal(filterShowTotal);
    setShowTotalAllShipper(filterShowTotalAllShipper);

    const start_date = startDate
        ? dayjs(startDate).format("YYYY-MM-DD")
        : dayjs().startOf('month').format("YYYY-MM-DD");

    const end_date = endDate
        ? dayjs(endDate).format("YYYY-MM-DD")
        : dayjs().format("YYYY-MM-DD");

    const body_main = {
        start_date,
        end_date,
        skip: "100",
        limit: "100"
    };

    const body_export = {
        start_date,
        end_date,
        skip: 100,
        limit: 100
    };

    setBodyExport(body_export);

    const res_ = await postService('/master/balancing/balance-report', body_main);

    const start = dayjs(start_date).startOf("day");
    const end = dayjs(end_date).endOf("day");

    let srchShipperName_ = shipperName;

    if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        srchShipperName_ = [userDT?.account_manage?.[0]?.group?.id_name];
    }

    const result = res_?.data?.filter((item: any) => {
        const gasDay = toDayjs(item.gas_day);
        return gasDay.isBetween(start, end, null, "[]");
    }).map((item: any) => {
        if (!srchShipperName_ || srchShipperName_.length === 0) return item;

        const filteredShipperData = item.shipper_data.filter((sd: any) =>
            srchShipperName_.includes(sd.shipper)
        );

        if (filteredShipperData.length === 0) return null;

        return {
            ...item,
            shipper_data: filteredShipperData,
        };
    }).filter(Boolean);

    const latestByGasDay = (result?.length ? Object.values(
        result.reduce((acc: Record<string, any>, curr: any) => {
            const gasDay = curr.gas_day;
            if (!acc[gasDay] || curr.execute_timestamp > acc[gasDay].execute_timestamp) {
                acc[gasDay] = curr;
            }
            return acc;
        }, {})
    ) : []).sort((a: any, b: any) => dayjs(b.gas_day).diff(dayjs(a.gas_day)));

    setTimeout(() => {
        setIsLoading(true);
    }, 1000);

    setData(latestByGasDay);
    setFilteredDataTable(latestByGasDay);
    setCurrentPage(1);
    setdataExport_(latestByGasDay);
};
    
    // const handleReset = async () => {
    //     setSrchStartDate(null)
    //     setSrchEndDate(null)
    //     setSrchShipperName([])
    //     setValue('filter_show_total', true)
    //     // setValue('filter_show_total_all_shipper', true)

    //     {/* shipper ต้องไม่เห็นค่า Show Total All Shippers ทั้ง UI และ Export https://app.clickup.com/t/86ex0kb53 */ }
    //     if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
    //         setValue('filter_show_total_all_shipper', true)
    //         setShowTotalAllShipper(true)
    //     } else {
    //         setValue('filter_show_total_all_shipper', false)
    //         setShowTotalAllShipper(false)
    //     }

    //     setShowTotal(true)
    //     // setShowTotalAllShipper(true)

    //     // setFilteredDataTable(dataTable)
    //     fetchData(); // Reset Filter คืนแค่ใน Filter แต่ในตารางไม่ถูกเปลี่ยน https://app.clickup.com/t/86eudxwg4

    //     setKey((prevKey) => prevKey + 1);
    // };

    const handleReset = async () => {
    const defaultStartDate = dayjs().startOf('month').toDate();
    const defaultEndDate = dayjs().toDate();

    const defaultShipperName =
        userDT?.account_manage?.[0]?.user_type_id == 3
            ? [userDT?.account_manage?.[0]?.group?.id_name]
            : [];

    const defaultShowTotal = true;
    const defaultShowTotalAllShipper =
        userDT?.account_manage?.[0]?.user_type_id !== 3;

    setSrchStartDate(defaultStartDate);
    setSrchEndDate(defaultEndDate);
    setSrchShipperName(defaultShipperName);

    setValue('filter_show_total', defaultShowTotal);
    setValue('filter_show_total_all_shipper', defaultShowTotalAllShipper);

    setShowTotal(defaultShowTotal);
    setShowTotalAllShipper(defaultShowTotalAllShipper);

    setKey((prevKey) => prevKey + 1);

    await handleFieldSearch({
        startDate: defaultStartDate,
        endDate: defaultEndDate,
        shipperName: defaultShipperName,
        filterShowTotal: defaultShowTotal,
        filterShowTotalAllShipper: defaultShowTotalAllShipper,
    });
};
    
    const toPlain = (v: any) => v != null ? v.toString().replace(/[\s,]/g, '').toLowerCase() : '';

    // เดิมโรงงาน
    // const handleSearch = (query: string) => {
    //     const q = toPlain(query);
    //     if (!q) {
    //         setFilteredDataTable(dataTable); // แสดงทั้งหมดถ้า query ว่าง
    //         return;
    //     }

    //     /* ── 1. เตรียม map id_name → name ของ shipperGroup เพื่อ lookup เร็ว ── */
    //     const shipperMap = new Map(
    //         shipperGroupData?.data?.map((d: any) => [toPlain(d.id_name), d.name ?? ''])
    //     );

    //     /* ── 2. ฟิลเตอร์ระดับ top ── */
    //     const filtered = dataTable?.map((row: any) => {

    //         /* 2.1 gasDay */
    //         const gasDayMatch = toPlain(formatDateNoTime(row.gas_day)).includes(q);

    //         // ถ้าเจอ gas_day return ไปเบย
    //         if (gasDayMatch) {
    //             return { ...row };
    //         }

    //         /* 2.2 top‑level numeric values */
    //         const topValMatch = row.values?.some((v: any) => {
    //             toPlain(formatNumberFourDecimal(v.value) ?? v.value).includes(q)
    //         });

    //         /* 2.3 shipper_data (ลึก 3 ชั้น) */
    //         const filteredShippers = row.shipper_data?.map((ship: any) => { // row blue 
    //             const shipKey = toPlain(ship.shipper); // -----> id_name

    //             let find_shipper_name = shipperGroupData?.data?.find((item: any) => {
    //                 let filtered = item?.id_name?.replace(/\s+/g, '').toLowerCase().trim() == shipKey
    //                 return filtered
    //             })

    //             /* ชื่อ shipper (ตรง + mapping) */
    //             // const nameMatch = shipKey.includes(q) || toPlain(shipperMap.get(shipKey)).includes(q);
    //             const nameMatch = find_shipper_name?.name.toLowerCase().trim().includes(q);


    //             //BLUE PANEL
    //             /* ค่า value ของ shipper */
    //             const shipValMatch = ship.values?.some((v: any) => {
    //                 toPlain(formatNumberFourDecimal(v.value) ?? v.value).includes(q)
    //             });

    //             /* contract_data */
    //             let filteredContracts = [];

    //             if (nameMatch) {
    //                 filteredContracts = ship.contract_data ?? [];
    //             } else {
    //                 filteredContracts = ship.contract_data?.map((ct: any) => { // row white 
    //                     const ctNameMatch = toPlain(ct.contract).includes(q);
    //                     const ctValMatch = ct.values?.some((v: any) => {
    //                         return toPlain(formatNumberFourDecimalNom(v.value) ?? v.value).includes(q)
    //                     });

    //                     return ctNameMatch || ctValMatch ? ct : null;
    //                 }).filter(Boolean);
    //             }

    //             const anyCt = filteredContracts.length > 0;

    //             /* เก็บ shipper นี้ถ้ามีอย่างใดอย่างหนึ่ง match */
    //             if (nameMatch || shipValMatch || anyCt) {
    //                 return { ...ship, contract_data: filteredContracts };
    //             }
    //             return null;
    //         }).filter(Boolean);

    //         const anyShipper = filteredShippers.length > 0;

    //         /* 2.4 ถ้าชั้นใดชั้นหนึ่ง match → เก็บ row นี้ */
    //         if (gasDayMatch || topValMatch || anyShipper) {
    //             // if (gasDayMatch || anyShipper) {
    //             return { ...row, shipper_data: filteredShippers };
    //         }
    //         return null;
    //     }).filter(Boolean);

    //     setFilteredDataTable(filtered);
    // };


    const handleSearch = (query: string) => {
        const q = toPlain(query);
        if (!q) {
            setFilteredDataTable(dataTable);
            return;
        }

        const shipperMap = new Map(
            shipperGroupData?.data?.map((d: any) => [toPlain(d.id_name), d.name ?? ''])
        );

        const filtered = dataTable?.map((row: any) => {

            // R2 : Smart Search : ยังขึ้นข้อมูลไม่ถูก https://app.clickup.com/t/86eujrg8c
            // row.shipper_data.contract_data : row ขาว
            // row.shipper_data.values : row ฟ้า
            // row.values : row เหลือง

            let hasMatchedDataRowYellow = false; // ตัวแปรเก็บ State ว่าใน Row นี้มีข้อมูลที่ตรงกับ query ป่าว เอาไว้แสดง row เหลือง
            let hasMatchedDataRowBlue = false; // ตัวแปรเก็บ State ว่าใน Row นี้มีข้อมูลที่ตรงกับ query ป่าว เอาไว้แสดง row ฟ้า

            // 2.1 gasDay Match?
            // const gasDayMatch = toPlain(formatDateNoTime(row.gas_day)).includes(q);
            // const gasDayMatch = toPlain(toDayjs(row?.gas_day).format("DD/MM/YYYY")).includes(q);
            const gasDayMatch = dayjs(row?.gas_day, 'YYYY-MM-DD').format("DD/MM/YYYY").includes(q);

            // 2.2 top‑level numeric values Match? (แก้ไข: เพิ่ม return ใน .some)
            // row เหลือง
            const topValMatch = row.values?.some((v: any) =>
                toPlain(formatNumberFourDecimal(v.value) ?? v.value).includes(q)
            );

            /* 2.3 shipper_data (ลึก 3 ชั้น) */
            // --- เริ่มเช็ค Shipper Data ---
            if (topValMatch) { // row เหลือง
                hasMatchedDataRowYellow = true
            }

            if (gasDayMatch) {
                const return_obj = {
                    ...row,
                    matchDataRowYellow: true,
                    matchDataRowBlue: true
                };

                return return_obj
            }

            const filteredShippers = row.shipper_data?.map((ship: any) => {
                const shipKey = toPlain(ship.shipper);
                let find_shipper_name = shipperGroupData?.data?.find((item: any) =>
                    item?.id_name?.replace(/\s+/g, '').toLowerCase().trim() === shipKey
                );

                const nameMatch = find_shipper_name?.name.toLowerCase().trim().includes(q);

                // เช็คข้อมูลใน shipper_data.values (row ฟ้า)
                const shipValMatch = ship.values?.some((v: any) =>
                    toPlain(formatNumberFourDecimal(v.value) ?? v.value).includes(q)
                );

                if (shipValMatch) { // row ฟ้า
                    hasMatchedDataRowBlue = true
                }

                // row ขาว
                let filteredContracts = [];
                if (nameMatch) {
                    filteredContracts = ship.contract_data ?? [];
                } else {
                    // เช็คข้อมูลใน shipper_data.contract_data (row ขาว)
                    filteredContracts = ship.contract_data?.map((ct: any) => {
                        const ctNameMatch = toPlain(ct.contract).includes(q);
                        const ctValMatch = ct.values?.some((v: any) =>
                            toPlain(formatNumberFourDecimalNom(v.value) ?? v.value).includes(q)
                        );
                        return ctNameMatch || ctValMatch ? ct : null;
                    }).filter(Boolean);
                }

                const anyCt = filteredContracts.length > 0;

                if (nameMatch || shipValMatch || anyCt) {
                    // hasMatchedDataRowBlue = true; // <--- พบจุดที่ Match ในระดับ Shipper หรือ Contract
                    return {
                        ...ship,
                        contract_data: filteredContracts,
                        isMatched: true // ใส่ flag ไว้ที่ตัว Shipper ด้วยถ้าต้องการ highlight
                    };
                }
                return null;
            }).filter(Boolean);

            const anyShipper = filteredShippers.length > 0;

            // 2.4 ตัดสินใจเก็บ Row และพ่วง State การ Match ไปด้วย
            if (gasDayMatch || topValMatch || anyShipper) {

                const return_obj = {
                    ...row,
                    shipper_data: filteredShippers,
                    matchDataRowYellow: hasMatchedDataRowYellow,
                    matchDataRowBlue: hasMatchedDataRowBlue
                };

                return return_obj
            }
            return null;
        }).filter(Boolean);

        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataTable, setData] = useState<any>([]);
    const [lastRetrieving, setLastRetrieving] = useState<any>('');

    useEffect(() => {
        if (gas_day_from_somewhere_else) {
            const date_from = dayjs(gas_day_from_somewhere_else).toDate();
            const date_to = dayjs(gas_day_to_from_somewhere_else).toDate();

            setSrchStartDate(new Date(date_from))
            setSrchEndDate(new Date(date_to))
        }
    }, [gas_day_from_somewhere_else])


    const fetchData = async () => {

        setIsLoading(false)
        setValue('filter_show_total', true)
        // setValue('filter_show_total_all_shipper', true)

        {/* shipper ต้องไม่เห็นค่า Show Total All Shippers ทั้ง UI และ Export https://app.clickup.com/t/86ex0kb53 */ }
        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            setValue('filter_show_total_all_shipper', true)
        } else {
            setValue('filter_show_total_all_shipper', false)
        }

        try {

            // DATA Shipper Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.id_name])
            }

            // DATA LAST EXECUTE
            const res_last: any = await getService(`/master/balancing/last-retrieving-new`);
            setLastRetrieving(res_last?.execute_timestamp ? dayjs.unix(res_last.execute_timestamp).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm') : formatDate(res_last?.timestamp, 'YYYY-MM-DD HH:mm:ss'))

            let from: any = srchStartDate ? dayjs(srchStartDate).startOf('month').format('YYYY-MM-DD') : null;
            let to: any = srchEndDate ? dayjs(srchEndDate).format('YYYY-MM-DD') : null;
            if (gas_day_from_somewhere_else) {
                from = dayjs(gas_day_from_somewhere_else);
                to = dayjs(gas_day_to_from_somewhere_else);
            }

            const body_main = {
                // "start_date": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), // "2025-01-01" fixed ไว้ ของ mock eviden
                // "end_date": srchEndDate ? dayjs(srchEndDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), // "2025-02-28" fixed ไว้ ของ mock eviden

                // ที่ใส่ start_date, end_date แบบนี้เพราะ default หน้ามันเป็นยังงี้
                // ตอน field search เดวมันยิง api ใหม่ตามวันที่เสิช
                // "start_date": dayjs().startOf('month').format('YYYY-MM-DD'), // วันแรกของเดือน
                // "end_date": dayjs().format('YYYY-MM-DD'), // วันที่ปัจจุบัน
                "start_date": from, // วันแรกของเดือน
                "end_date": to, // วันที่ปัจจุบัน
                "skip": "100", 
                "limit": "100" 
            }

            const body_export = {
                "start_date": from, // YYYY-MM-DD
                "end_date": to, // YYYY-MM-DD
                "skip": 100, 
                "limit": 100 
            }
            setBodyExport(body_export)

            // await handleFieldSearch()
            await handleFieldSearch({
                startDate: from ? dayjs(from).toDate() : dayjs().startOf('month').toDate(),
                endDate: to ? dayjs(to).toDate() : dayjs().toDate(),
                shipperName:
                    userDT?.account_manage?.[0]?.user_type_id == 3
                        ? [userDT?.account_manage?.[0]?.group?.id_name]
                        : srchShipperName,
                filterShowTotal: true,
                filterShowTotalAllShipper: userDT?.account_manage?.[0]?.user_type_id !== 3,
            });
           
        } catch (err) {
            // setError(err.message);
            setData([]);
            setFilteredDataTable([]);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############### PAGINATION DETAIL TOTAL ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const [dataExport_, setdataExport_] = useState<any>([])

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [

        // เปลี่ยนจาก MMBTU/D เป็น MMBTU ==> SHEET SPRINT4 NO.9
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'summary_pane', label: 'Summary Pane', visible: true },
        { key: 'detail_pane', label: 'Detail Pane', visible: false },

        { key: 'shipper_name', label: 'Shipper Name', visible: true, parent_id: 'summary_pane' },
        { key: 'contract_code', label: 'Contract Code', visible: true, parent_id: 'summary_pane' },

        { key: 'total_entry_mmbtud', label: 'Total Entry (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'total_exit_mmbtud', label: 'Total Exit (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'imbalance_zone_mmbtud', label: 'Imbalance Zone (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'instructed_flow_mmbtud', label: 'Instructed Flow (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'shrinkage_volume_mmbtud', label: 'Shrinkage Volume (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'park_mmbtud', label: 'Park (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'unpark_mmbtud', label: 'Unpark (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'sod_park_mmbtud', label: 'SOD Park (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'eod_park_mmbtud', label: 'EOD Park (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'min_inventory_change_mmbtud', label: 'Change Min Inventory (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'reserve_bal_mmbtud', label: 'Reserve Bal. (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'adjust_imbalance_mmbtud', label: 'Adjust Imbalance (MMBTU)', visible: true, parent_id: 'summary_pane' },
        // { key: 'vent_gas', label: 'Vent Gas', visible: false, parent_id: 'summary_pane' },
        // { key: 'commissioning_gas', label: 'Commissioning Gas', visible: false, parent_id: 'summary_pane' },
        // { key: 'other_gas', label: 'Other Gas', visible: false, parent_id: 'summary_pane' },
        { key: 'vent_gas', label: 'Vent Gas (MMBTU)', visible: false, parent_id: 'summary_pane' }, // Column ตามภาพ เพิ่มหน่วย (MMBTU) https://app.clickup.com/t/86eujrg8e
        { key: 'commissioning_gas', label: 'Commissioning Gas (MMBTU)', visible: false, parent_id: 'summary_pane' }, // Column ตามภาพ เพิ่มหน่วย (MMBTU) https://app.clickup.com/t/86eujrg8e
        { key: 'other_gas', label: 'Other Gas (MMBTU)', visible: false, parent_id: 'summary_pane' }, // Column ตามภาพ เพิ่มหน่วย (MMBTU) https://app.clickup.com/t/86eujrg8e
        { key: 'daily_imb_mmbtud', label: 'Daily IMB. (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'aip_mmbtud', label: 'AIP (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'ain_mmbtud', label: 'AIN (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'percentage_imb', label: '%Imb', visible: false, parent_id: 'summary_pane' },
        { key: 'percentage_abslmb', label: '%Abslmb', visible: false, parent_id: 'summary_pane' },
        { key: 'acc_imb_month_mmbtud', label: 'Acc. IMB. (MONTH) (MMBTU)', visible: false, parent_id: 'summary_pane' },
        { key: 'acc_imb_mmbtud', label: 'Acc. IMB. (MMBTU)', visible: true, parent_id: 'summary_pane' },
        { key: 'min_inventory_mmbtud', label: 'Min. Inventory (MMBTU)', visible: false, parent_id: 'summary_pane' },


        // sub of Summary Pane --> Total Entry (MMBTU/D)
        { key: 'east_total_entry_mmbtud', label: 'East', visible: true, parent_id: 'total_entry_mmbtud' },
        { key: 'west_total_entry_mmbtud', label: 'West', visible: true, parent_id: 'total_entry_mmbtud' },
        { key: 'east_west_total_entry_mmbtud', label: 'East-West', visible: false, parent_id: 'total_entry_mmbtud' },

        // sub of Summary Pane --> Total Exit (MMBTU/D)
        { key: 'east_total_exit_mmbtud', label: 'East', visible: true, parent_id: 'total_exit_mmbtud' },
        { key: 'west_total_exit_mmbtud', label: 'West', visible: true, parent_id: 'total_exit_mmbtud' },
        { key: 'east_west_total_exit_mmbtud', label: 'East-West', visible: true, parent_id: 'total_exit_mmbtud' },

        // sub of Summary Pane --> Imbalance Zone (MMBTU/D)
        { key: 'east_imbalance_zone_mmbtud', label: 'East', visible: true, parent_id: 'imbalance_zone_mmbtud' },
        { key: 'west_imbalance_zone_mmbtud', label: 'West', visible: true, parent_id: 'imbalance_zone_mmbtud' },
        { key: 'total_imbalance_zone_mmbtud', label: 'Total', visible: true, parent_id: 'imbalance_zone_mmbtud' },

        // sub of Summary Pane --> Instructed flow (MMBTU)
        { key: 'east_instructed_flow_mmbtud', label: 'East', visible: false, parent_id: 'instructed_flow_mmbtud' },
        { key: 'west_instructed_flow_mmbtud', label: 'West', visible: false, parent_id: 'instructed_flow_mmbtud' },
        { key: 'east_west_instructed_flow_mmbtud', label: 'East-West', visible: false, parent_id: 'instructed_flow_mmbtud' },

        // sub of Summary Pane --> Shrinkage Volume (MMBTU/D)
        { key: 'east_shrinkage_volume_mmbtud', label: 'East', visible: true, parent_id: 'shrinkage_volume_mmbtud' },
        { key: 'west_shrinkage_volume_mmbtud', label: 'West', visible: true, parent_id: 'shrinkage_volume_mmbtud' },

        // sub of Summary Pane --> Park (MMBTU/D)
        { key: 'east_park_mmbtud', label: 'East', visible: false, parent_id: 'park_mmbtud' },
        { key: 'west_park_mmbtud', label: 'West', visible: false, parent_id: 'park_mmbtud' },

        // sub of Summary Pane --> Unpark (MMBTU/D)
        { key: 'east_unpark_mmbtud', label: 'East', visible: false, parent_id: 'unpark_mmbtud' },
        { key: 'west_unpark_mmbtud', label: 'West', visible: false, parent_id: 'unpark_mmbtud' },

        // sub of Summary Pane --> SOD Park (MMBTU/D)
        { key: 'east_sod_park_mmbtud', label: 'East', visible: false, parent_id: 'sod_park_mmbtud' },
        { key: 'west_sod_park_mmbtud', label: 'West', visible: false, parent_id: 'sod_park_mmbtud' },

        // sub of Summary Pane --> EOD Park (MMBTU/D)
        { key: 'east_eod_park_mmbtud', label: 'East', visible: false, parent_id: 'eod_park_mmbtud' },
        { key: 'west_eod_park_mmbtud', label: 'West', visible: false, parent_id: 'eod_park_mmbtud' },

        // sub of Summary Pane --> Min. Inventory Change (MMBTU/D)
        { key: 'east_min_inventory_change_mmbtud', label: 'East', visible: true, parent_id: 'min_inventory_change_mmbtud' },
        { key: 'west_min_inventory_change_mmbtud', label: 'West', visible: true, parent_id: 'min_inventory_change_mmbtud' },

        // sub of Summary Pane --> Reserve Bal. (MMBTU/D)
        { key: 'east_reserve_bal_mmbtud', label: 'East', visible: false, parent_id: 'reserve_bal_mmbtud' },
        { key: 'west_reserve_bal_mmbtud', label: 'West', visible: false, parent_id: 'reserve_bal_mmbtud' },

        // sub of Summary Pane --> Adjust Imbalance (MMBTU/D)
        { key: 'east_adjust_imbalance_mmbtud', label: 'East', visible: true, parent_id: 'adjust_imbalance_mmbtud' },
        { key: 'west_adjust_imbalance_mmbtud', label: 'West', visible: true, parent_id: 'adjust_imbalance_mmbtud' },

        // sub of Summary Pane --> Vent Gas
        { key: 'east_vent_gas', label: 'East', visible: false, parent_id: 'vent_gas' },
        { key: 'west_vent_gas', label: 'West', visible: false, parent_id: 'vent_gas' },

        // sub of Summary Pane --> Commissioning Gas
        { key: 'east_commissioning_gas', label: 'East', visible: false, parent_id: 'commissioning_gas' },
        { key: 'west_commissioning_gas', label: 'West', visible: false, parent_id: 'commissioning_gas' },

        // sub of Summary Pane --> Other Gas
        { key: 'east_other_gas', label: 'East', visible: false, parent_id: 'other_gas' },
        { key: 'west_other_gas', label: 'West', visible: false, parent_id: 'other_gas' },

        // sub of Summary Pane --> Daily IMB (MMBTU/D)
        { key: 'east_daily_imb_mmbtud', label: 'East', visible: true, parent_id: 'daily_imb_mmbtud' },
        { key: 'west_daily_imb_mmbtud', label: 'West', visible: true, parent_id: 'daily_imb_mmbtud' },

        // sub of Summary Pane --> AIP (MMBTU/D)
        { key: 'total_aip_mmbtud', label: 'Total', visible: false, parent_id: 'aip_mmbtud' },

        // sub of Summary Pane --> AIN (MMBTU/D)
        { key: 'total_ain_mmbtud', label: 'Total', visible: false, parent_id: 'ain_mmbtud' },

        // sub of Summary Pane --> %Imb
        { key: 'total_percentage_imb', label: 'Total', visible: false, parent_id: 'percentage_imb' },

        // sub of Summary Pane --> %Abslmb
        { key: 'total_percentage_abslmb', label: 'Total', visible: false, parent_id: 'percentage_abslmb' },

        // sub of Summary Pane --> Acc. IMB. (MONTH) (MMBTU/D)
        { key: 'east_acc_imb_month_mmbtud', label: 'East', visible: false, parent_id: 'acc_imb_month_mmbtud' },
        { key: 'west_acc_imb_month_mmbtud', label: 'West', visible: false, parent_id: 'acc_imb_month_mmbtud' },

        // sub of Summary Pane --> Acc. IMB. (MMBTU/D)
        { key: 'east_acc_imb_mmbtud', label: 'East', visible: true, parent_id: 'acc_imb_mmbtud' },
        { key: 'west_acc_imb_mmbtud', label: 'West', visible: true, parent_id: 'acc_imb_mmbtud' },

        // sub of Summary Pane -->  Min. Inventory (MMBTU)
        { key: 'east_min_inventory_mmbtud', label: 'East', visible: false, parent_id: 'min_inventory_mmbtud' },
        { key: 'west_min_inventory_mmbtud', label: 'West', visible: false, parent_id: 'min_inventory_mmbtud' },


        { key: 'entry', label: 'Entry', visible: false, parent_id: 'detail_pane' },
        { key: 'exit', label: 'Exit', visible: false, parent_id: 'detail_pane' },


        // sub of Detail Pane ---> Entry
        { key: 'east_entry_detail_pane', label: 'East', visible: false, parent_id: 'entry' },
        { key: 'west_entry_detail_pane', label: 'West', visible: false, parent_id: 'entry' },
        { key: 'east_west_entry_detail_pane', label: 'East-West', visible: false, parent_id: 'entry' },

        // sub of Detail Pane ---> Exit
        { key: 'east_exit_detail_pane', label: 'East', visible: false, parent_id: 'exit' },
        { key: 'west_exit_detail_pane', label: 'West', visible: false, parent_id: 'exit' },
        { key: 'east_west_exit_detail_pane', label: 'East-West', visible: false, parent_id: 'exit' },
        { key: 'f2_and_g', label: 'F2&G', visible: false, parent_id: 'exit' },
        { key: 'e', label: 'E', visible: false, parent_id: 'exit' },

        // sub of Detail Pane ---> Entry ---> East
        { key: 'gsp', label: 'GSP', visible: false, parent_id: 'east_entry_detail_pane' },
        { key: 'bypass_gas', label: 'Bypass Gas', visible: false, parent_id: 'east_entry_detail_pane' },
        { key: 'lng', label: 'LNG', visible: false, parent_id: 'east_entry_detail_pane' },
        { key: 'others_east', label: 'Others', visible: false, parent_id: 'east_entry_detail_pane' },


        // sub of Detail Pane ---> Entry ---> West
        { key: 'ydn', label: 'YDN', visible: false, parent_id: 'west_entry_detail_pane' },
        { key: 'ytg', label: 'YTG', visible: false, parent_id: 'west_entry_detail_pane' },
        { key: 'ztk', label: 'ZTK', visible: false, parent_id: 'west_entry_detail_pane' },
        { key: 'others_west', label: 'Others', visible: false, parent_id: 'west_entry_detail_pane' },


        // sub of Detail Pane ---> Entry ---> East-West
        { key: 'ra6_east', label: 'RA6 East', visible: false, parent_id: 'east_west_entry_detail_pane' },
        { key: 'ra6_west', label: 'RA6 West', visible: false, parent_id: 'east_west_entry_detail_pane' },
        { key: 'bvw10_east', label: 'BVW10 East', visible: false, parent_id: 'east_west_entry_detail_pane' },
        { key: 'bvw10_West', label: 'BVW10 West', visible: false, parent_id: 'east_west_entry_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> East
        { key: 'egat', label: 'EGAT', visible: false, parent_id: 'east_exit_detail_pane' },
        { key: 'ipp', label: 'IPP', visible: false, parent_id: 'east_exit_detail_pane' },
        { key: 'others_east_exit', label: 'Others', visible: false, parent_id: 'east_exit_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> West
        { key: 'egat_west', label: 'EGAT', visible: false, parent_id: 'west_exit_detail_pane' },
        { key: 'ipp_west', label: 'IPP', visible: false, parent_id: 'west_exit_detail_pane' },
        { key: 'others_west_exit', label: 'Others', visible: false, parent_id: 'west_exit_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> East-West
        { key: 'egat_east_west', label: 'EGAT', visible: false, parent_id: 'east_west_exit_detail_pane' },
        { key: 'ipp_east_west', label: 'IPP', visible: false, parent_id: 'east_west_exit_detail_pane' },
        { key: 'others_east_west_exit', label: 'Others', visible: false, parent_id: 'east_west_exit_detail_pane' },


        // sub of Detail Pane ---> EXIT ---> F2&G
        { key: 'east_f2andg', label: 'East', visible: false, parent_id: 'f2_and_g' },
        { key: 'west_f2andg', label: 'West', visible: false, parent_id: 'f2_and_g' },

        // sub of Detail Pane ---> EXIT ---> E
        { key: 'east_e', label: 'East', visible: false, parent_id: 'e' },
        { key: 'west_e', label: 'West', visible: false, parent_id: 'e' },

    ];

    const [tk, settk] = useState<boolean>(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibilityNew, setColumnVisibilityNew] = useState<any>(
        Object.fromEntries(
            initialColumns.map((column: any) => [column.key, column.visible])
        )
    );

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const filteredColumns = initialColumns;

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible])))

        setColumnVisibilityNew(Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible])))
    }, [])

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggleNew = (columnKey: string) => {
        const dataFilter = initialColumns;

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

        setColumnVisibilityNew((prev: any) => {
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

    useEffect(() => {
        // setdataExport_(sortedData)
    }, [filteredDataTable, sortedData])

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* default 1st date of month */}
                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day From"}
                        placeHolder={"Select Gas Day From"}
                        allowClear
                        isDefaultFirstDayOfMonth={gas_day_from_somewhere_else ? false : true}
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        defaultValue={gas_day_from_somewhere_else ? gas_day_from_somewhere_else : null}
                    />

                    {/* default today */}
                    <DatePickaSearch
                        key={"end" + key}
                        label={"Gas Day To"}
                        placeHolder={"Select Gas Day To"}
                        allowClear
                        isDefaultToday={gas_day_to_from_somewhere_else ? false : true}
                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                        defaultValue={gas_day_to_from_somewhere_else ? gas_day_to_from_somewhere_else : null}
                    />
                    {/* // userDT?.account_manage?.[0]?.user_type_id == 3
        //                             ? item?.id === userDT?.account_manage?.[0]?.group?.id
        //                             : true */}
                    <InputSearch
                        id="searchShipperName"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchShipperName}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        onChange={(e) => setSrchShipperName(e.target.value)}
                        // options={dataShipper?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.name
                        // }))}
                        options={dataShipper
                            ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                // value: item.id,
                                value: item.id_name,
                                label: item.name,
                            }))
                        }
                    />

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('filter_show_total')}
                            id="filter_show_total"
                            label="Show Only Total"
                            type="single-line"
                            value={watch('filter_show_total') ? watch('filter_show_total') : false}
                            onChange={(e: any) => setValue('filter_show_total', e?.target?.checked)}
                        />
                    </div>

                    {/* shipper ต้องไม่เห็นค่า Show Total All Shippers ทั้ง UI และ Export https://app.clickup.com/t/86ex0kb53 */}
                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                        <div className="-mb-2">
                            <CheckboxSearch2
                                {...register('filter_show_total_all_shipper')}
                                id="filter_show_total_all_shipper"
                                label="Show Only Total All Shippers"
                                type="single-line"
                                value={watch('filter_show_total_all_shipper') ? watch('filter_show_total_all_shipper') : false}
                                onChange={(e: any) => setValue('filter_show_total_all_shipper', e?.target?.checked)}
                            />
                        </div>

                    }


                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BtnGeneral */}
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">
                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <CustomTooltip
                            title={
                                <div>
                                    <p className="text-[#464255] font-light">{`Acc. = Accumulated`}</p>
                                    <p className="text-[#464255] font-light">{`IMB. = Imbalance`}</p>
                                    <p className="text-[#464255] font-light">{`SOD Park = Start of the day Park`}</p>
                                    <p className="text-[#464255] font-light">{`EOD Park = End of the day Park`}</p>
                                    <p className="text-[#464255] font-light">{`Bal. = Balance`}</p>
                                    <p className="text-[#464255] font-light">{`AIP = Absolute Imbalance Positive`}</p>
                                    <p className="text-[#464255] font-light">{`AIN = Absolute Imbalance Negative`}</p>
                                    <p className="text-[#464255] font-light">{`Abslmb = Absolute Imbalance`}</p>

                                    <p className="text-[#464255] font-light">{`YDN = YADANA`}</p>
                                    <p className="text-[#464255] font-light">{`YTG = YETAGUN`}</p>
                                    <p className="text-[#464255] font-light">{`ZTK = ZAWTIKA`}</p>
                                </div>
                            }
                            placement="top-end"
                            arrow
                        >
                            <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                                <InfoOutlinedIcon
                                    // sx={{ fontSize: 14 }}
                                    style={{ fontSize: "11px", color: '#747474', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>
                        </CustomTooltip>

                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className="font-semibold text-[14px] text-[#464255]">
                            {`Last Execute Version :`}
                        </div>
                        <div className="text-[14px] text-[#464255]">
                            {lastRetrieving ? lastRetrieving : ''}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnGeneral
                            bgcolor={"#24AB6A"}
                            modeIcon={'export'}
                            textRender={"Export"}
                            generalFunc={() => {
                                epBalancingBalanceReport({
                                    name: 'Balance Report',
                                    initialColumns: initialColumns,
                                    // columnVisibility: columnVisibility,
                                    columnVisibility: columnVisibilityNew,
                                    resData: dataExport_,
                                    shipperGroupData: shipperGroupData?.data || [],
                                    filterShowTotal: showTotal,
                                    filterShowTotalAllShipper: showTotalAllShipper,
                                    isShipper: userDT?.account_manage?.[0]?.user_type_id == 3
                                })
                            }}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                        {/* <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="balancing/balance-report"
                            can_export={userPermission ? userPermission?.f_export : false}
                            // can_export={userPermission?.f_export && selectedRoles?.length > 0 ? true : false}
                            disable={filteredDataTable?.length > 0 ? false : true}
                            // columnVisibility={columnVisibility}
                            columnVisibility={columnVisibilityNew}
                            initialColumns={initialColumns}
                            specificMenu='balance-report'
                            specificData={bodyExport}
                        /> */}
                    </div>
                </div>

                <TableMain
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibilityNew}
                    initialColumns={initialColumns}
                    userPermission={userPermission}
                    // showTotal={watch('filter_show_total')}
                    // showTotalAllShipper={watch('filter_show_total_all_shipper')}
                    // isBothFalse={!watch('filter_show_total_all_shipper') && !watch('filter_show_total') ? true : false}
                    showTotal={showTotal}
                    showTotalAllShipper={showTotalAllShipper}
                    isBothFalse={!showTotal && !showTotalAllShipper ? true : false}
                    shipperGroupData={shipperGroupData?.data}
                    sortedData={sortedData}
                    setSortedData={setSortedData}
                    isShipper={userDT?.account_manage?.[0]?.user_type_id == 3}
                />

            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
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

            <ColumnVisibilityPopoverBalReport
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibilityNew}
                handleColumnToggle={handleColumnToggleNew}
                //  handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

        </div>
    );
};

export default ClientPage;