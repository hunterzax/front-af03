"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { exportToExcelDailyAdjustReport, exportToExcelDailyAdjustReportTabDetail, filterItemsAllNullMmscfd, filterItemsAllNullMmscfd2, findRoleConfigByMenuName, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, generateUserPermission, groupByTimeAndPoint, groupByTimeAndPointTabTotal, keepEarliestPerValue, keepEarliestPerValueForZzz } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import { Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from 'dayjs';
import { useForm } from "react-hook-form";
import TableTabDetail from "./form/tableTabDetail";
import TableTabTotal from "./form/tableTabTotal";
import BtnGeneral from "@/components/other/btnGeneral";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";

// แปลง "HH:MM" -> จำนวนนาทีตั้งแต่ 00:00
const toMinutes = (t?: string | null) => {
    if (!t) return Number.POSITIVE_INFINITY; // ไม่มีค่า => ไปท้ายสุด
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

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
            //     const permission = findRoleConfigByMenuName('Daily Adjustment Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Daily Adjustment Report', userDT)
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
    const { zoneMaster, nominationPointData ,entryExitMaster} = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !zoneMaster?.data) {
            dispatch(fetchZoneMasterSlice());
        }
        if (forceRefetch || !entryExitMaster?.data) {
            dispatch(fetchEntryExit());
        }
        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, zoneMaster]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(new Date());
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchEntryExit, setSrchEntryExit] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);
    const [checkAdjustment, setCheckAdjustment] = useState<boolean>(false);
    const [srchNomConcept, setSrchNomConcept] = useState<any>(['LMPT1', 'LMPT2', 'GMTP']); // Filter Nomination Point : Default Filter เฉพาะ LMPT1 / LMPT2 / GMTP https://app.clickup.com/t/86etzch6z
    // const [srchNomConcept, setSrchNomConcept] = useState<any>([]); // Filter Nomination Point : Default Filter เฉพาะ LMPT1 / LMPT2 / GMTP https://app.clickup.com/t/86etzch6z

    const [dataDetailFilter, setDataDetailFilter] = useState<any>([]);
    const [dataDetailFilterOriginal, setDataDetailOriginal] = useState<any>([]);
    const [dataTotalFilter, setDataTotalFilter] = useState<any>([]);
    const [dataTotalFilterForSearch, setDataTotalFilterForSearch] = useState<any>([]);
    const [dataTotalFilterForDropdownChoice, setDataTotalFilterForDropdownChoice] = useState<any[]>([]);
    const [dataTabTotalMerge, setDataTabTotalMerge] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // ถ้า user เป็น shipper
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName(userDT?.account_manage?.[0]?.group?.name)
            }

            // DATA ZONE แบบไม่ซ้ำ
            const zone_master_de_dup = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );

            setDataZoneMasterZ(zone_master_de_dup);

            const body_main = {
                "checkAdjustment": false, // true adjust YES only 
                "startDate": dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
                "endDate": dayjs().format("DD/MM/YYYY"),
                // "startDate": '27/03/2025', // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
                // "endDate": '27/03/2025',
                "contractCode": ""
            }

            const res_ = await postService('/master/daily-adjustment/daily-adjustment-report', body_main);

            postService('/master/daily-adjustment/daily-adjustment-report-now', body_main).then(res_now => {
                const result_now = (res_now && Array.isArray(res_now) ? res_now : []).filter((item: any) => {
                    return (
                        (srchShipperName?.length > 0 ? srchShipperName.some((shipper : any) => `${shipper}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                        (userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name].some((group : any) => `${group}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                        (srchZone?.length > 0 ? srchZone.some((zone : any) => `${zone}`.trim().toLowerCase()  == `${item?.zone_text}`.trim().toLowerCase()) : true) &&
                        (srchNomConcept?.length > 0 ? srchNomConcept.some((nompoint : any) => `${nompoint}`.trim().toLowerCase()  == `${item?.point}`.trim().toLowerCase()) : true) &&
                        ((checkAdjustment == true) ? ((!item?.timeShow || !Array.isArray(item?.timeShow)) ? false : item?.timeShow?.some((time: any) => time?.isAdjust == true)) : true) &&
                        (tabIndex == 0 ? (srchEntryExit?.length > 0 ? srchEntryExit.some((entryExit : any) => `${entryExit}`.trim().toLowerCase()  == `${item?.entry_exit_name}`.trim().toLowerCase()) : true) : true)
                    );
                });

                // ------- ข้อมูลตารางบน tab total
                const groupedData = groupByTimeAndPoint(result_now);
                const sortedCurrent = groupedData?.map(row => ({
                    ...row,
                    groups: [...row.groups].sort((a, b) =>
                        a.point.localeCompare(b.point, 'en', { sensitivity: 'base' })
                    )
                }));

                // กรอง point ที่ไม่มี valueMmscfd ออกไปเลย
                const filtered_data_table_current = filterItemsAllNullMmscfd2(sortedCurrent, tabMain == 1 ? 'MMBTUD' : 'MMSCFD')
                // setDataCurrentTotal(filtered_data_table_current)
                // setDataCurrentTotalFilter(filtered_data_table_current)

                const updatedDataCurrent = filtered_data_table_current?.map((item: any) => {
                    return {
                        ...item,
                        isNow: true,
                    };
                });
                setDataCurrentTotal(updatedDataCurrent)
                setDataCurrentTotalFilter(updatedDataCurrent)
            });


            const makeATimeShow: any = ((res_ && Array.isArray(res_)) ? res_ : []).map((item: any) => {
                return ({
                    ...item,
                    timeShowZero: item?.timeShow[0]?.time
                })
            })

            const result_2 = makeATimeShow?.filter((item: any) => {
                return (
                    (srchShipperName?.length > 0 ? srchShipperName.some((shipper : any) => `${shipper}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                    (userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name].some((group : any) => `${group}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                    (srchZone?.length > 0 ? srchZone.some((zone : any) => `${zone}`.trim().toLowerCase()  == `${item?.zone_text}`.trim().toLowerCase()) : true) &&
                    (srchNomConcept?.length > 0 ? srchNomConcept.some((nompoint : any) => `${nompoint}`.trim().toLowerCase()  == `${item?.point}`.trim().toLowerCase()) : true) &&
                    ((checkAdjustment == true) ? ((!item?.timeShow || !Array.isArray(item?.timeShow)) ? false : item?.timeShow?.some((time: any) => time?.isAdjust == true)) : true) &&
                    (tabIndex == 0 ? (srchEntryExit?.length > 0 ? srchEntryExit.some((entryExit : any) => `${entryExit}`.trim().toLowerCase()  == `${item?.entry_exit_name}`.trim().toLowerCase()) : true) : true)
                );
            });

            setData(res_)
            setDataCurrent(res_)
            setDataRoot(res_)

            let mode: any = tabIndex == 0 ? 'detail' : tabIndex == 1 && 'total';

            if (mode == 'detail') {
                const res_filter_hour_val = keepEarliestPerValue(result_2)
                const resForDropdown = keepEarliestPerValue(makeATimeShow)
                setDataDetailFilter(res_filter_hour_val)
                setDataDetailOriginal(resForDropdown)
            } else if (mode == 'total') {

                // ------- ข้อมูลตารางล่าง tab total
                const groupedDataTotal = groupByTimeAndPointTabTotal(result_2);
                const sortedTotal = groupedDataTotal?.map((row: any) => ({
                    ...row,
                    groups: [...row.groups].sort((a, b) =>
                        a.point.localeCompare(b.point, "en", { sensitivity: "base" })
                    )
                }));

                // กรอง point ที่ไม่มี valueMmscfd ออกไปเลย
                const filtered_data_table_total = filterItemsAllNullMmscfd(sortedTotal, tabMain == 1 ? 'MMBTUD' : 'MMSCFD')

                // data_zzz นี้ก็เงื่อนไขเดียวกัน แต่โครงสร้างข้อมูลไม่เหมือนกัน ต้องกรองออกมาแล้วโครงสร้างเหมือนเดิม
                // ต้องเทียบ  
                // 1. data_zzz.groups.items.shipper_name
                // 2. data_zzz.groups.items.timeShow.valueMmscfd
                // แล้วก็ดู data_zzz.groups.items.timeShow.time 
                // ถ้าชั่วโมงต่อไปของ data_zzz.groups.items.shipper_name นี้ ค่าซ้ำ เราจะเอาข้อมูลของชั่วโมงเก่าสุดเท่านั้น
                // const filter_zzzzzzzz = keepEarliestPerValueForZzz(filtered_data_table_total)

                setDataTotalFilter(filtered_data_table_total)
                setDataTotalFilterForSearch(filtered_data_table_total)
            }

            const getOption = logSearch['detail'];
            handleFieldSearch('detail', getOption);

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        } catch (err) {
        } finally {
            // setLoading(false);
        }
    };

    const [logDate, setlogDate] = useState<any>();

    // #region handleFieldSearch
    const handleFieldSearch = async (tab: any, option: any) => {
        // master/daily-adjustment/daily-adjustment-report
        setIsLoading(false)

        let mode: any = tab == 0 ? 'detail' : tab == 1 && 'total';
        let getOption = logSearch[mode];

        // if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        //     getOption = logSearch[mode]?.map((item: any) => ({
        //         ...item,
        //         shipper: [userDT?.account_manage?.[0]?.group?.name]
        //     }))
        // }

        const dateLog = getOption?.date
        const shipperLog = getOption?.shipper
        const zoneLog = getOption?.zone
        const nompointLog = getOption?.nompoint
        const checkAdjustmentLog = getOption?.checkAdjustmentLog
        const entryExitLog = getOption?.entryExit

        const body_ = {
            "checkAdjustment": false, // true adjust YES only 
            "startDate": dateLog ? dayjs(dateLog).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
            "endDate": dateLog ? dayjs(dateLog).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
            "contractCode": ""
        }
        const res_ = await postService('/master/daily-adjustment/daily-adjustment-report', body_);

        if(res_ && Array.isArray(res_)){
            setData(res_)
        }

        const makeATimeShow: any = ((res_ && Array.isArray(res_)) ? res_ : []).map((item: any) => {
            return ({
                ...item,
                timeShowZero: item?.timeShow[0]?.time
            })
        })

        const result_2 = makeATimeShow?.filter((item: any) => {

            return (
                (shipperLog ? Array.isArray(shipperLog) ? shipperLog?.length > 0 ? shipperLog.some((shipper : any) => `${shipper}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true : `${shipperLog}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase() : true) &&
                (userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name].some((group : any) => `${group}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                (zoneLog?.length > 0 ? zoneLog.some((zone : any) => `${zone}`.trim().toLowerCase()  == `${item?.zone_text}`.trim().toLowerCase()) : true) &&
                (nompointLog?.length > 0 ? nompointLog.some((nompoint : any) => `${nompoint}`.trim().toLowerCase()  == `${item?.point}`.trim().toLowerCase()) : true) &&
                ((checkAdjustmentLog == true) ? ((!item?.timeShow || !Array.isArray(item?.timeShow)) ? false : item?.timeShow?.some((time: any) => time?.isAdjust == true)) : true) &&
                (tabIndex == 0 ? (entryExitLog?.length > 0 ? entryExitLog.some((entryExit : any) => `${entryExit}`.trim().toLowerCase()  == `${item?.entry_exit_name}`.trim().toLowerCase()) : true) : true)
            );
        });


        // tab detail data current
        const result_3 = dataRoot?.filter((item: any) => {
            return (
                (shipperLog ? Array.isArray(shipperLog) ? shipperLog?.length > 0 ? shipperLog.some((shipper : any) => `${shipper}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true : `${shipperLog}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase() : true) &&
                (userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name].some((group : any) => `${group}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                (zoneLog?.length > 0 ? zoneLog.some((zone : any) => `${zone}`.trim().toLowerCase()  == `${item?.zone_text}`.trim().toLowerCase()) : true) &&
                (nompointLog?.length > 0 ? nompointLog.some((nompoint : any) => `${nompoint}`.trim().toLowerCase()  == `${item?.point}`.trim().toLowerCase()) : true) &&
                ((checkAdjustment == true) ? ((!item?.timeShow || !Array.isArray(item?.timeShow)) ? false : item?.timeShow?.some((time: any) => time?.isAdjust == true)) : true)
            );
        });

        setDataCurrent(result_3)

        setCurrentPage(1);

        if (mode == 'detail') {
            const res_filter_hour_val = keepEarliestPerValue(result_2)
            const resForDropdown = keepEarliestPerValue(makeATimeShow)

            setDataDetailFilter(res_filter_hour_val)
            setDataDetailOriginal(resForDropdown)
        } else if (mode == 'total') {
            // ------- ข้อมูลตารางล่าง tab total
            const groupedDataTotal = groupByTimeAndPointTabTotal(result_2);
            const sortedTotal = groupedDataTotal?.map((row: any) => ({
                ...row,
                groups: [...row.groups].sort((a, b) =>
                    a.point.localeCompare(b.point, "en", { sensitivity: "base" })
                )
            }));

            // กรอง point ที่ไม่มี valueMmscfd ออกไปเลย
            let filtered_data_table_total = filterItemsAllNullMmscfd(sortedTotal, tabMain == 1 ? 'MMBTUD' : 'MMSCFD')
            // setDataTotalFilter(filtered_data_table_total)
            // setDataTotalFilterForSearch(filtered_data_table_total)

            // ต้องเทียบ  
            // 1. data_zzz.groups.items.shipper_name
            // 2. data_zzz.groups.items.timeShow.valueMmscfd
            // แล้วก็ดู data_zzz.groups.items.timeShow.time 
            // ถ้าชั่วโมงต่อไปของ data_zzz.groups.items.shipper_name นี้ ค่าซ้ำ เราจะเอาข้อมูลของชั่วโมงเก่าสุดเท่านั้น
            // const filter_zzzzzzzz = keepEarliestPerValueForZzz(filtered_data_table_total)

            // ถ้า groups ของทุกชั่วโมงเป็น array เปล่าให้เคลียร์ทั้ง filtered_data_table_total
            // ไม่งั้นมันจะได้ตารางที่มีคอลัม Time เปล่า ๆ โผล่มา
            if (Array.isArray(filtered_data_table_total) && filtered_data_table_total.every(it => Array.isArray(it.groups) && it.groups.length === 0)) {
                filtered_data_table_total = [];
            }

            setDataTotalFilter(filtered_data_table_total)


            const groupedDataTotalForDropdownChoice = groupByTimeAndPointTabTotal(makeATimeShow);
            const sortedTotalForDropdownChoice = groupedDataTotalForDropdownChoice?.map((row: any) => ({
                ...row,
                groups: [...row.groups].sort((a, b) =>
                    a.point.localeCompare(b.point, "en", { sensitivity: "base" })
                )
            }));
            // กรอง point ที่ไม่มี valueMmscfd ออกไปเลย
            let filteredDataTableTotalForDropdownChoice = filterItemsAllNullMmscfd(sortedTotalForDropdownChoice, tabMain == 1 ? 'MMBTUD' : 'MMSCFD')
            if (Array.isArray(filteredDataTableTotalForDropdownChoice) && filteredDataTableTotalForDropdownChoice.every(it => Array.isArray(it.groups) && it.groups.length === 0)) {
                filteredDataTableTotalForDropdownChoice = [];
            }
            setDataTotalFilterForDropdownChoice(filteredDataTableTotalForDropdownChoice)

            // 🔥ไม่ควร set ตัว ForSearch ทุกครั้งใหม่เพราะมันคือ Master ของ Data ที่ผ่านแค่วันที่เท่านั้น
            if (dataTotalFilterForSearch?.length == 0 || (dataTotalFilterForSearch?.length > 0 && dateLog !== logDate)) {
                setDataTotalFilterForSearch(filtered_data_table_total)
                setlogDate(dateLog)
            }

            // TAB TOTAL DATA CURRRENT
            // แถบ Total > Filter ยังไม่มีผลกับตารางบน และมีบาง filter ที่พอกด Filter แล้วทำให้ตารางแหว่ง https://app.clickup.com/t/86etu4pju
            const body_main = {
                "checkAdjustment": false, // true adjust YES only 
                "startDate": dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT.
                "endDate": dayjs().format("DD/MM/YYYY"),
                "contractCode": ""
            }

            if(dayjs(dateLog).isSame(dayjs(), 'day')) {
            postService('/master/daily-adjustment/daily-adjustment-report-now', body_main).then(res_now => {
                const result_now = (res_now && Array.isArray(res_now) ? res_now : []).filter((item: any) => {
                    return (
                        (shipperLog ? Array.isArray(shipperLog) ? shipperLog?.length > 0 ? shipperLog.some((shipper : any) => `${shipper}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true : `${shipperLog}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase() : true) &&
                        (userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name].some(group => `${group}`.trim().toLowerCase()  == `${item?.shipper_name}`.trim().toLowerCase()) : true) &&
                        (zoneLog?.length > 0 ? zoneLog.some((zone : any) => `${zone}`.trim().toLowerCase()  == `${item?.zone_text}`.trim().toLowerCase()) : true) &&
                        (nompointLog?.length > 0 ? nompointLog.some((nompoint : any) => `${nompoint}`.trim().toLowerCase()  == `${item?.point}`.trim().toLowerCase()) : true) &&
                        ((checkAdjustment == true) ? ((!item?.timeShow || !Array.isArray(item?.timeShow)) ? false : item?.timeShow?.some((time: any) => time?.isAdjust == true)) : true) &&
                        (tabIndex == 0 ? (entryExitLog?.length > 0 ? entryExitLog.some((entryExit : any) => `${entryExit}`.trim().toLowerCase()  == `${item?.entry_exit_name}`.trim().toLowerCase()) : true) : true)
                        
                    );
                });

                // ------- ข้อมูลตารางบน tab total
                const groupedDataCurrent = groupByTimeAndPoint(result_now);

                const sortedCurrent = groupedDataCurrent?.map(row => ({
                    ...row,
                    groups: [...row.groups].sort((a, b) =>
                        a.point.localeCompare(b.point, 'en', { sensitivity: 'base' })
                    )
                }));

                // กรอง point ที่ไม่มี valueMmscfd ออกไปเลย
                const filtered_data_table_current = filterItemsAllNullMmscfd2(sortedCurrent, tabMain == 1 ? 'MMBTUD' : 'MMSCFD')
                // setDataCurrentTotal(filtered_data_table_current)
                // setDataCurrentTotalFilter(filtered_data_table_current)

                const updatedDataCurrent = filtered_data_table_current?.map((item: any) => {
                    return {
                        ...item,
                        isNow: true,
                    };
                });
                setDataCurrentTotal(updatedDataCurrent)
                setDataCurrentTotalFilter(updatedDataCurrent)
            });
            }
            else{
                setDataCurrentTotal([])
            }
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    const handleReset = async (tab: any) => {
        setDataTotalFilter([])
        setDataDetailFilter([])

        setKey((prevKey) => prevKey + 1);
        let mode: any = tab == 0 ? 'detail' : tab == 1 && 'total';
        const getOption = logSearch[mode];

        if (mode == 'detail') {
            getOption.date = new Date();
            getOption.shipper = [];
            getOption.zone = [];
            getOption.nompoint = ['LMPT1', 'LMPT2', 'GMTP'];
            getOption.checkAdjustmentLog = false;
            getOption.entryExit = [];

            setlogSearch((pre: any) => ({
                ...pre,
                [mode]: original_logSearch[mode]
            }))

            setSrchStartDate(new Date())
            setSrchShipperName([])
            setSrchZone([])
            setSrchNomConcept(['LMPT1', 'LMPT2', 'GMTP'])
            setSrchEntryExit([])
            setCheckAdjustment(false)
        } else if (mode == 'total') {
            getOption.date = new Date();
            getOption.shipper = [];
            getOption.zone = [];
            getOption.nompoint = ['LMPT1', 'LMPT2'];
            getOption.checkAdjustmentLog = false;
            getOption.entryExit = [];

            setlogSearch((pre: any) => ({
                ...pre,
                [mode]: original_logSearch[mode]
            }))

            setSrchStartDate(new Date())
            setSrchShipperName([])
            setSrchZone([])
            setSrchNomConcept([])
            setSrchEntryExit([])
            setCheckAdjustment(false)
        }
        handleFieldSearch(tab, getOption);
    };

    // #region LIKE SEARCH
    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        // const dataToFilter = tabIndex === 1 ? dataDailyOriginal : dataTable;

        // ######################## TABLE 1 ########################
        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.timeShow[0]?.time?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.timeShow?.value)?.toLowerCase()?.trim()?.includes(queryLower)
                )
            }
        );
        setDataCurrent(filtered);

        // ######################## TABLE 2 ########################
        const filteredTable2 = dataDetailFilterOriginal
            .map((item: any) => {
                const shipperMatch = item?.shipper_name?.replace(/\s+/g, '').toLowerCase().includes(queryLower);
                const pointMatch = item?.point?.replace(/\s+/g, '').toLowerCase().includes(queryLower);

                // Filter timeShow based on query
                const filteredTimeShow = item?.timeShow?.filter((ts: any) => {
                    const timeMatch = ts?.time?.replace(/\s+/g, '').toLowerCase().includes(queryLower);
                    // const valueMatch = formatNumberThreeDecimal(ts?.value)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower);
                    const valueMmscfMatch = formatNumberThreeDecimal(ts?.valueMmscfd)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower);

                    return timeMatch || valueMmscfMatch;
                });

                // const filteredValue = filteredTimeShow?.filter((ts: any) => {
                //     const valueMatch = formatNumberThreeDecimal(ts?.value)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower);
                //     return valueMatch;
                // });

                // Case 1: Matches shipper or point → include all timeShow
                if (shipperMatch || pointMatch) {
                    return { ...item };
                }

                // Case 2: Only matches timeShow → include filtered timeShow
                if (filteredTimeShow.length > 0) {
                    return {
                        ...item,
                        timeShow: filteredTimeShow
                    };
                }

                // Case 3: No match at all → exclude
                return null;
            }).filter(Boolean); // remove nulls

        setDataDetailFilter(filteredTable2);

    };

    const formatNumberWithComma = (num: number) => {
        return num.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
        });
    };

    const handleSearchTabTotal = (query: string) => {
        const q = (query ?? "").toString().replace(/\s+/g, "").toLowerCase().trim();

        // ไม่มีคำค้น ⇒ รีเซ็ต
        if (!q) {
            setDataTotalFilter(dataTotalFilterForSearch);
            return;
        }

        // helper: normalize string (ลบช่องว่าง + toLowerCase)
        const norm = (v: any) => (v ?? "")
            .toString()
            .replace(/\s+/g, "")
            .toLowerCase()
            .trim();

        // เก็บ time ที่มี match จาก valueMmscfd
        const matchedTimes = new Set<string>();

        // สแกนหาค่าที่ match
        for (const row of dataTotalFilterForSearch ?? []) {
            for (const group of row?.groups ?? []) {
                for (const item of group?.items ?? []) {
                    for (const ts of item?.timeShow ?? []) {
                        const val = ts?.valueMmscfd;

                        // ข้ามเคสที่ไม่ใช่ตัวเลข
                        if (val === null || val === undefined || Number.isNaN(Number(val))) continue;

                        // ทำ candidate เป็นหลายฟอร์แมตให้ครอบคลุม
                        const candidates = [
                            // norm(val), // raw toString
                            norm(formatNumberThreeDecimalNoComma(val)), // "1234.567"
                            norm(formatNumberThreeDecimal(val)),        // "1,234.567"
                            norm(formatNumberWithComma(val)),           // "1,234.567" หรือรูปแบบมีคอมมา
                        ];

                        if (candidates.some(s => s.includes(q))) {
                            matchedTimes.add(ts?.time);   // เก็บ time ที่เจอค่า
                        }
                    }
                }
            }
        }

        // 1) ถ้าคำค้นดันไปตรงกับ "ข้อความเวลา" เช่น "01:00" → ให้ผ่านด้วย
        const timeMatched = (t: string) => norm(t).includes(q);

        // 2) รวมเงื่อนไข: แถวไหนจะถูกเก็บ ถ้า
        //    - time เองตรงกับคำค้น  หรือ
        //    - time อยู่ในกลุ่มที่เจอ valueMmscfd ที่ match
        const filtered = (dataTotalFilterForSearch ?? []).filter((row: any) =>
            timeMatched(row?.time) || matchedTimes.has(row?.time)
        );

        setDataTotalFilter(filtered);
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(1); // 0=detail, 1=total
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataTable, setData] = useState<any>([]);
    const [dataRoot, setDataRoot] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);

    const [dataCurrent, setDataCurrent] = useState<any>([]);
    const [dataCurrentTotal, setDataCurrentTotal] = useState<any>([]);
    const [dataCurrentTotalFilter, setDataCurrentTotalFilter] = useState<any>([]); // เอาไว้ก่อน ถ้าได้ทำ filter current time เดียวมายำต่อ

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############### PAGINATION TAB DETAIL CURRENT ###############
    const [currentPageCurrent, setCurrentPageCurrent] = useState(1);
    const [itemsPerPageCurrent, setItemsPerPageCurrent] = useState(10);
    const [paginatedDataCurrent, setPaginatedDataCurrent] = useState<any[]>([]);

    const handlePageChangeCurrent = (page: number) => {
        setCurrentPageCurrent(page);
    };

    const handleItemsPerPageChangeCurrent = (itemsPerPage: number) => {
        setItemsPerPageCurrent(itemsPerPage);
        setCurrentPageCurrent(1);
    };

    // ############### PAGINATION DETAIL TOTAL ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [dataForSorting, setDataForSorting] = useState<any[]>([]); // เอาไว้ส่งไปทำ sorting
    const [paginatedDataRender, setPaginatedDataRender] = useState<any[]>([]);
    const [totalData, setTotalData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {

        // SET PAGINATION CURRENT TAB DETAIL
        if (dataCurrent && Array.isArray(dataCurrent) && tabIndex == 0) {
            setPaginatedDataCurrent(dataCurrent.slice((currentPageCurrent - 1) * itemsPerPageCurrent, currentPageCurrent * itemsPerPageCurrent))
        }

        if (tabIndex == 0) {

            // const test_find_EAST = dataDetailFilter?.filter((item: any) => item?.zone_text == 'EAST');
            // const test_find_WEST = dataDetailFilter?.filter((item: any) => item?.zone_text == 'WEST');
            // const test_find_EAST_WEST = dataDetailFilter?.filter((item: any) => item?.zone_text == 'EAST-WEST');

            const flatTimeRows = dataDetailFilter.flatMap((row: any) =>
                (row.timeShow || []).map((item: any) => ({
                    ...row,       // copy shipper info (point, shipper_name, etc.)
                    time: item.time,
                    value: item.value,
                    valueMmscfd: item.valueMmscfd,
                }))
            );

            // const flatTimeRows = dataDetailFilter.flatMap((row: any) => {
            //     if (row.timeShow?.length > 0) {
            //         return row.timeShow.map((item: any) => ({
            //             ...row,
            //             time: item.time,
            //             value: item.value,
            //             valueMmscfd: item.valueMmscfd,
            //         }))
            //     } else {
            //         return [{
            //             ...row,
            //             time: row?.timeShowZero,
            //             value: null,
            //             valueMmscfd: null,
            //         }]
            //     }
            // })

            const sorted_time = [...flatTimeRows].sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
            setTotalData(sorted_time)
            setPaginatedDataRender(sorted_time.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))

            setPaginatedData(dataDetailFilter.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setDataForSorting(sorted_time)
        }
        // if (dataDetailFilter && tabIndex == 1) {
        //     // setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        // }

    }, [dataCurrent, dataDetailFilter, currentPage, itemsPerPage, currentPageCurrent, itemsPerPageCurrent])


    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'current_time', label: 'Current Time', visible: true },
        { key: 'time', label: 'Time', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'nomination_value', label: 'Nomination Value (MMSCFD)', visible: true },
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

    // ############### TAB ###############
    const [tabMain, setTabMain] = useState(0);
    const handleChangeTabMain = (event: any, newValue: any) => {
        setTabMain(newValue);
    };
    const handleTabChange = (event: any, newValue: any) => {
        setTabIndex(newValue);

        let mode: any = newValue == 0 ? 'detail' : newValue == 1 && 'total';
        const getOption = logSearch[mode];

        setSrchStartDate((pre: any) => getOption?.date)

        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            setSrchShipperName((pre: any) => getOption?.shipper)
        }
        setSrchZone((pre: any) => getOption?.zone)
        const nomPointNameOptions = nomPointOptions().map((option: any) => option.nomination_point)
        setSrchNomConcept((pre: any) => (getOption?.nompoint ?? []).filter((item: any) => nomPointNameOptions.includes(item)))
        setCheckAdjustment(getOption?.checkAdjustmentLog ?? false)
        setSrchEntryExit((pre: any) => getOption?.entryExit)

        handleFieldSearch(newValue, getOption);
    };

    const original_logSearch: any = {
        detail: {
            date: new Date(),
            shipper: [],
            entryExit: [],
            zone: [],
            nompoint: ['LMPT1', 'LMPT2', 'GMTP'],
            checkAdjustmentLog: false,
        },
        total: {
            date: new Date(),
            shipper: [],
            entryExit: [],
            zone: [],
            nompoint: ['LMPT1', 'LMPT2'],
            checkAdjustmentLog: false,
        }
    }

    const [logSearch, setlogSearch] = useState<any>(original_logSearch);
    const updateDynamiclogSearch = (tab: any) => {
        let mode: any = tab == 0 ? 'detail' : tab == 1 && 'total';

        const dateLog = srchStartDate
        const shipperLog = srchShipperName
        const zoneLog = srchZone
        const nompointLog = srchNomConcept
        const checkAdjustmentLog = checkAdjustment
        const entryExitLog = srchEntryExit

        const getOption = logSearch[mode];

        getOption.date = dateLog;
        getOption.shipper = shipperLog;
        getOption.zone = zoneLog;
        getOption.nompoint = nompointLog;
        getOption.checkAdjustmentLog = checkAdjustmentLog;
        getOption.entryExit = entryExitLog;

        setlogSearch((pre: any) => ({
            ...pre,
            [mode]: {
                date: dateLog,
                shipper: shipperLog,
                zone: zoneLog,
                nompoint: nompointLog,
                checkAdjustment: checkAdjustmentLog,
                entryExit: entryExitLog,
            }
        }))

        handleFieldSearch(tab, getOption);
    }

    const extractPointsFromTotalFilter = (
        data: any[],
        tabIndex: number
    ) => {
        const pointSet = new Set<string>()
        const zoneSet = new Set(srchZone ?? [])

        // 🔹 tab 0 : ใช้ timeShow
        if (tabIndex === 0) {
            data?.forEach((item: any) => {
                if (item?.timeShow?.length > 0 && item?.point) {
                    pointSet.add(item.point)
                }
            })
        }

        // 🔹 tab 1 : ใช้ groups / items
        if (tabIndex === 1) {
            data?.forEach((record: any) => {
                record?.groups?.forEach((group: any) => {
                    // group level
                    if (
                        group?.point &&
                        (!zoneSet.size || zoneSet.has(group?.zone_text))
                    ) {
                        pointSet.add(group.point)
                    }

                    // item level
                    group?.items?.forEach((item: any) => {
                        if (
                            item?.point &&
                            (!zoneSet.size || zoneSet.has(item?.zone_text))
                        ) {
                            pointSet.add(item.point)
                        }
                    })
                })
            })
        }

        return pointSet
    }

    const nomPointOptions = () => {
        if (!nominationPointData?.data) return []
        const sourceData =
            tabIndex === 0
                ? dataDetailFilterOriginal
                : dataTotalFilterForDropdownChoice?.length > 0 ? dataTotalFilterForDropdownChoice : dataCurrentTotalFilter

        // 🔥 สร้าง set ของ shipper_name ที่มี timeShow ไม่ว่าง
        const validShipperSet = extractPointsFromTotalFilter(sourceData, tabIndex);

        const result = nominationPointData.data
            // unique nomination_point
            .filter((item: any, index: number, self: any[]) =>
                index === self.findIndex((i: any) =>
                    i.nomination_point === item.nomination_point
                )
            )
            // filter zone and entry exit
            .filter((item: any) => {
                if(tabIndex == 0) { // detail
                    if(srchEntryExit?.length > 0 && !srchEntryExit.includes(item?.entry_exit?.name)) {
                        return false
                    }
                }
                if(srchZone?.length > 0 && !srchZone.includes(item?.zone?.name)) {
                    return false
                }
                return true
            })
            // 🔥 filter ตาม timeShow
            .filter((item: any) =>
                validShipperSet.has(item?.nomination_point)
            )
            // sort A-Z
            .sort((a: any, b: any) =>
                a.nomination_point.localeCompare(b.nomination_point)
            )

        return result
    }

    const normalizeTimeShow = (data: any[]) => {
        return data.map((d) => ({
            ...d,
            groups: d.groups?.map((g: any) => ({
                ...g,
                items: g.items?.map((it: any) => ({
                    ...it,
                    timeShow: Array.isArray(it.timeShow)
                        ? it.timeShow
                        : it.timeShow
                            ? [it.timeShow]
                            : [],
                })),
            })),
        }));
    };

    useEffect(() => {
        const normalizedDataCurrentTotal = dataCurrentTotal?.length > 0 ? normalizeTimeShow(dataCurrentTotal) : [];

        // ปรับรูปแบบตาราง อยากให้รวม Table ทั้งบนและล่าง เพื่อป้องกันการสับสนของ filter https://app.clickup.com/t/86etzch74
        const merged = [...normalizedDataCurrentTotal, ...dataTotalFilter];
        setDataTabTotalMerge(merged)
    }, [dataTotalFilter, dataCurrentTotal])

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        defaultValue={srchStartDate}
                        onChange={(e: any) => {
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    <InputSearch
                        id="searchShipperName"
                        label="Shipper Name"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchShipperName}
                        placeholder="Select Shipper Name"
                        onChange={(e) => setSrchShipperName(e?.target?.value)}
                        isDisabled={(userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ? true : false}
                        options={(Array.isArray(dataShipper) ? dataShipper : [])
                            .filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4)
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                // value: item.id,
                                value: item.name,
                                label: item.name,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchZone}
                        onChange={(e) => {
                            setSrchZone(e.target.value)

                            // v2.0.114 Filter เมื่อเลือก Zone Wording ตรง Select nom point หายไป ควรจะขึ้น Default ไว้ เมื่อ select nom point ยังไม่ได้เลือก https://app.clickup.com/t/86ev03wuu
                            if (e.target.value.length == 0) {
                                if (tabIndex == 0) {
                                    setSrchNomConcept(original_logSearch.detail.nompoint)
                                } else {
                                    setSrchNomConcept(original_logSearch.total.nompoint)
                                }
                            } else {
                                setSrchNomConcept([])
                            }
                            setSrchEntryExit([])
                        }}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            // value: item?.id?.toString(),
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    {
                        tabIndex == 0 && (
                    <InputSearch
                        id="searchEntryExit"
                        label="Entry/Exit"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchEntryExit}
                        onChange={(e) => {
                            setSrchEntryExit(e.target.value)

                            if (e.target.value.length == 0) {
                                if (tabIndex == 0) {
                                    setSrchNomConcept(original_logSearch.detail.nompoint)
                                } else {
                                    setSrchNomConcept(original_logSearch.total.nompoint)
                                }
                            } else {
                                setSrchNomConcept([])
                            }
                        }}
                        options={(entryExitMaster?.data && Array.isArray(entryExitMaster?.data) ? entryExitMaster?.data : []).map((item: any) => ({
                            value: item.name,
                            label: item.name
                        })).sort((a: any, b: any) =>
                            a.label.localeCompare(b.label)
                        )}
                    />
                        )
                    }


                    <InputSearch
                        id="searchNomPointConceptPoint"
                        label="Nomination Point"
                        type="select-multi-checkbox" // Filter ทั้งหมดปรับเป็น Multi Select https://app.clickup.com/t/86etzch70
                        value={srchNomConcept}
                        onChange={(e) => setSrchNomConcept(e.target.value)}

                        // Filter Nomination จะต้องขึ้นแค่ชื่อเดียว https://app.clickup.com/t/86etzchbk
                        options={nomPointOptions()?.map((item: any) => ({
                            value: item.nomination_point,
                            label: item.nomination_point
                        })).sort((a: any, b: any) =>
                            a.label.localeCompare(b.label)
                        )}
                    />



                    <div className="w-auto relative">
                        <CheckboxSearch2
                            {...register('check_adjustment')}
                            id="check_adjustment"
                            label="Check Adjustment"
                            type="single-line"
                            value={checkAdjustment ? checkAdjustment : false}
                            onChange={(e: any) => setCheckAdjustment(e?.target?.checked)}
                        />
                    </div>

                    <BtnSearch handleFieldSearch={() => updateDynamiclogSearch(tabIndex)} />
                    <BtnReset handleReset={() => handleReset(tabIndex)} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BtnGeneral */}
                </aside>
            </div>

            <Tabs
                value={tabIndex}
                onChange={handleTabChange}
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
                    ["Detail", "Total"]?.map((label, index) => (
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

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">

                <div className="pb-2 -ml-5">
                    <Tabs
                        value={tabMain}
                        onChange={handleChangeTabMain}
                        aria-label="unit selection tabs"
                        sx={{
                            '& .Mui-selected': {
                                color: '#00ADEF !important',
                                fontWeight: 'bold !important',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#00ADEF !important',
                                width: tabMain === 0 ? '90px !important' : '110px !important',
                                transform: tabMain === 0 ? 'translateX(30%)' : 'translateX(15%)',
                                bottom: '10px',
                            },
                            '& .MuiTab-root': {
                                minWidth: 'auto !important',
                            },
                        }}
                    >
                        {['MMSCFD', 'MMBTU/D'].map((label, index) => (
                            <Tab
                                key={label}
                                label={label}
                                id={`subTab-${index}`}
                                sx={{
                                    fontFamily: 'Tahoma !important',
                                    textTransform: 'none',
                                    padding: '8px 16px',
                                    minWidth: '50px',
                                    maxWidth: '140px',
                                    flexShrink: 0,
                                    color: tabMain === index ? '#58585A' : '#9CA3AF',
                                }}
                            />
                        ))}
                    </Tabs>
                </div>

                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-4">
                        {/* <div onClick={tabIndex === 0 ? handleTogglePopoverIntraday : tabIndex === 1 ? handleTogglePopover : handleTogglePopoverWeekly}> */}
                        {
                            tabIndex == 0 && (<div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>)
                        }
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={tabIndex == 0 ? handleSearch : handleSearchTabTotal} />

                        {
                            tabIndex == 0 && ( // EXPORT TAB DETAIL
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    // disable={paginatedDataCurrent.length == 0 || dataDetailFilter.length == 0 ? true : false}
                                    disable={paginatedDataCurrent.length == 0 && dataDetailFilter.length == 0 ? true : false}
                                    // generalFunc={() => exportToExcelDailyAdjustReport(dataCurrentTotal, paginatedData, 'tab-detail', columnVisibility)}
                                    // generalFunc={() => exportToExcelDailyAdjustReport(dataCurrentTotal, totalData, 'tab-detail', columnVisibility)}
                                    generalFunc={() => exportToExcelDailyAdjustReportTabDetail(dataCurrentTotal, totalData, 'tab-detail', columnVisibility, {displayUnit: tabMain == 1 ? 'MMBTUD' : 'MMSCFD'})}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                            )
                        }

                        {
                            tabIndex == 1 && (  // EXPORT TAB TOTAL
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    disable={dataCurrentTotal.length == 0 && dataTotalFilter.length == 0 ? true : false}
                                    generalFunc={() => exportToExcelDailyAdjustReport(dataCurrentTotal, dataTotalFilter, 'tab-total', columnVisibility, {displayUnit: tabMain == 1 ? 'MMBTUD' : 'MMSCFD'})}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                            )
                        }

                    </div>
                </div>

                {
                    tabIndex == 0 ? (<> {/* TAB DETAIL */}

                        {/* ++++++++++++++++ TABLE ALL ++++++++++++++++ */}
                        <TableTabDetail
                            tableDataAll={paginatedData}
                            tableDataRender={paginatedDataRender}
                            isLoading={isLoading}
                            columnVisibility={columnVisibility}
                            userPermission={userPermission}
                            tableType={'all'}
                            dataForSorting={dataForSorting}
                            displayUnit={tabMain == 1 ? 'MMBTUD' : 'MMSCFD'}
                        />
                        <PaginationComponent
                            // totalItems={dataDetailFilter?.length}
                            totalItems={totalData?.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                            onItemsPerPageChange={handleItemsPerPageChange}
                        />
                    </>
                    ) : tabIndex == 1 && (
                        <div>
                            {/* ตารางบน */}
                            {/* TAB TOTAL TABLE CURRENT*/}
                            {/* <TableTabTotal
                                tableDataCurrent={dataCurrentTotal}
                                isLoading={isLoading}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tableType={'current'}
                                autoHeight={true}
                            /> */}

                            {/* ตัด pagination ทั้ง Table บนและ Table ล่าง https://app.clickup.com/t/86etzch92 */}
                            {/* <PaginationComponent
                                totalItems={dataCurrentTotal?.length}
                                itemsPerPage={itemsPerPageCurrent}
                                currentPage={currentPageCurrent}
                                onPageChange={handlePageChangeCurrent}
                                onItemsPerPageChange={handleItemsPerPageChangeCurrent}
                            /> */}

                            {/* ตารางล่าง */}
                            {/* TAB TOTAL TABLE ALL*/}
                            {/* <TableTabTotal
                                tableDataAll={dataTotalFilter}
                                isLoading={isLoading}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tableType={'all'}
                            /> */}

                            {/* ตัด pagination ทั้ง Table บนและ Table ล่าง https://app.clickup.com/t/86etzch92 */}
                            {/* <PaginationComponent
                                totalItems={dataTotalFilter?.length}
                                itemsPerPage={itemsPerPageCurrent}
                                currentPage={currentPageCurrent}
                                onPageChange={handlePageChangeCurrent}
                                onItemsPerPageChange={handleItemsPerPageChangeCurrent}
                            /> */}

                            {/* <TableDaily
                                tableData={paginatedData}
                                isLoading={isLoading}
                                gasWeekFilter={srchStartDate}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tabIndex={tabIndex}
                                openViewForm={openViewForm}
                            /> */}





                            <TableTabTotal
                                tableDataAll={dataTabTotalMerge}
                                isLoading={isLoading}
                                columnVisibility={columnVisibility}
                                userPermission={userPermission}
                                tableType={'all'}
                                displayUnit={tabMain == 1 ? 'MMBTUD' : 'MMSCFD'}
                            />
                        </div>
                    )
                }

            </div>

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