"use client";
import "@/app/globals.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Tab, Tabs } from "@mui/material";
import { getService } from "@/utils/postService";
import ChartLongTerm from "./form/chartLongTerm1";
import ChartLongTerm2 from "./form/chartLongTerm2";
import { assignColorsToGroups, exportToExcel, findRoleConfigByMenuId, generateUserPermission, getMinMaxMonth, keepLatestPerGroup, keepLatestPerGroupByPeriod, mergeDataByGroupAndArea, mergeDataByGroupMedTerm, mergeDataByGroupMedTermVersionTwo, mergeResMed, mergeResMedByDay, mergeSumByAreaAndDay, sumDataByAreaAndGroup, sumValuesByArea } from "@/utils/generalFormatter";
import ChartMedEachShipper from "./form/chartMedTermEachShipper";
import BtnGeneral from "@/components/other/btnGeneral";
import ChartShortTermAll from "./form/chartShortTermAll";
import ChartShortEachShipper from "./form/chartShortTermEachShipper";
import ModalFullView from "./form/modalFullView";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { InputSearch } from "@/components/other/SearchForm";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { useFetchMasters } from "@/hook/fetchMaster";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import { map60Year } from "../../../dam/(menu)/parameters/data";
import ChartSkeleton from "@/components/material_custom/ChartSkeleton";
import NodataTable from "@/components/other/nodataTable";
import { decryptData } from "@/utils/encryptionData";
import ChartMediumTermAll from "./form/chartMedTermAll";
import getUserValue from "@/utils/getuserValue";
import { prependMissingDaysFromCurrent, prependMissingMonthsFromCurrent } from "./form/functionPlanning";
import dayjs from "dayjs";
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra); // Extend Day.js with the plugin
// import ModalFullViewMedium from "./form/modalFullview_MEDIUM";
// import ModalFullViewShort from "./form/modalFullView_SHORT";

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
                // user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                // const updatedUserPermission = generateUserPermission(user_permission);
                // // setUserPermission(updatedUserPermission);

                // const permission = findRoleConfigByMenuId(1015, userDT)
                // setUserPermission(permission ? permission : updatedUserPermission);

                const permission = findRoleConfigByMenuId(1015, userDT)
                if (permission) {
                    setUserPermission(permission);
                } else if (user_permission?.role_config) {
                    const updatedUserPermission = generateUserPermission(user_permission);
                    setUserPermission(updatedUserPermission);
                }
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    // ############### REDUX DATA ###############
    const { shipperGroupData, areaMaster, entryExitMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
            dispatch(fetchAreaMaster());
            dispatch(fetchEntryExit());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, areaMaster, entryExitMaster, forceRefetch]);

    // ############### DATA CHART ###############
    const [isLoading, setIsLoading] = useState<any>(false);
    const [dataLongTermMain, setDataLongTermMain] = useState<any>([]);
    const [dataLongTerm, setDataLongTerm] = useState<any>([]);
    const [dataLongTerm2, setDataLongTerm2] = useState<any>();
    const [filterDataLongTerm, setFilterDataLongTerm] = useState<any>([]);


    const [dataMedTermOriginal, setDataMedTermOriginal] = useState<any>([]);
    const [dataMedTerm, setDataMedTerm] = useState<any>([]);
    const [dataMedTermEachGroup, setDataMedTermEachGroup] = useState<any>([]);
    const [filterDataMedTermEach, setFilterDataMedTermEach] = useState<any>([]);

    const handleFilterDataMedTermEachChange = useCallback((data: any) => {
        if (!data?.length) {
            setFilterDataMedTermEach([]);
            return;
        }

        setFilterDataMedTermEach(
            data.map((entry: any) => ({
                ...entry,
                data: entry.data.map((item: any) => ({
                    ...item,
                    month: [...item.month],
                    value: [...item.value],
                })),
            })),
        );
    }, []);
    const [filterDataMedTerm, setFilterDataMedTerm] = useState<any>([]);

    const [dataShortTermOriginal, setDataShortTermOriginal] = useState<any>([]);
    const [dataShortTerm, setDataShortTerm] = useState<any>([]);
    const [dataShortTermEachGroup, setDataShortTermEachGroup] = useState<any>([]);
    const [filterDataShortTerm, setFilterDataShortTerm] = useState<any>([]);
    const [filterDataShortTermEach, setFilterDataShortTermEach] = useState<any>([]);
    const [dataShortTermEachMain, setDataShortTermEachMain] = useState<any>([]);

    const [areaMasterData, setAreaMasterData] = useState<any>(areaMaster?.data);

    const fetchData = async () => {
        try {
            let res_long_term: any = await getService(`/master/planning-dashboard/long-term`);
            let res_med_term: any = await getService(`/master/planning-dashboard/medium-term`);
            let res_short_term: any = await getService(`/master/planning-dashboard/short-term`);

            // 🟠 ฝากดู Planning > Dashboard > Shipper login ต้องเห็นเฉพาะข้อมูลของตัวเอง ตอนนี้เห็นของทุกคน (กันส่งมา 2026-03-09)
            if (userDT?.account_manage?.[0]?.user_type?.id == 3) { // shipper
                const filter_long_term_only_shipper = res_long_term?.filter((item: any) => {
                    return item?.group?.id == userDT?.account_manage?.[0]?.group?.id
                })
                res_long_term = filter_long_term_only_shipper

                const filter_med_term_only_shipper = res_med_term?.filter((item: any) => {
                    return item?.group?.id == userDT?.account_manage?.[0]?.group?.id
                })
                res_med_term = filter_med_term_only_shipper

                const filter_short_term_only_shipper = res_short_term?.filter((item: any) => {
                    return item?.group?.id == userDT?.account_manage?.[0]?.group?.id
                })
                res_short_term = filter_short_term_only_shipper
            }

            // ถ้า data_res_long.group.id ซ้ำกัน กรอง data_res_long แค่ shipper_file_submission_date วันเวลาล่าสุดแค่ตัวเดียว
            // v1.0.90 ควรที่จะแสดงเป็นข้อมู lasted ของแต่ล่ะ shipper https://app.clickup.com/t/86ert2k27
            // const latestPerGroupLongTerm = keepLatestPerGroup(res_long_term);
            const latestPerGroupLongTerm = keepLatestPerGroupByPeriod(res_long_term);

            // console.log('latestPerGroupLongTerm : ', latestPerGroupLongTerm);
            let test_res_long_term = assignColorsToGroups(latestPerGroupLongTerm);
            // console.log('test_res_long_term : ', test_res_long_term);

            // ============ แปลงข้อมูล long term ============
            const res_sum_long = sumValuesByArea(test_res_long_term); // ข้อมูลกราฟหลัก long term
            let data_long_term_each_group = sumDataByAreaAndGroup(test_res_long_term); // ข้อมูลกราฟย่อย long term

            const groupedByArea = data_long_term_each_group?.reduce((acc, item) => {
                const areaId = item.area.id;
                if (!acc[areaId]) {
                    acc[areaId] = {
                        area: item.area,
                        years: item.years,
                        groups: []
                    };
                }
                acc[areaId].groups.push({
                    name: item.group.name,
                    sumValues: item.sumValues,
                    // color: item.area.color
                    color: item.group.color
                });
                return acc;
            }, {});

            // ============ set ข้อมูล long term ============
            setDataLongTerm(latestPerGroupLongTerm); // เอาไว้ filter
            // setDataLongTerm(test_res_long_term); // เอาไว้ filter fix

            const res_sum_long_2 = filterOnlyEntry(res_sum_long) // ให้ Default ค่าเป็น Entry ไว้ https://app.clickup.com/t/86ev16nj6
            setDataLongTermMain(res_sum_long_2); // ใช้กับ chart หลัก เดิมใช้ res_sum_long
            setFilterDataLongTerm(res_sum_long_2) // เดิมใช้ res_sum_long

            // ให้ Default ค่าเป็น Entry ไว้ https://app.clickup.com/t/86ev16nj6
            const area_master_only_entry_ids = (areaMaster?.data ?? [])
                ?.filter((it: any) => it?.entry_exit_id === 1)
                ?.map((it: any) => it?.id)
                ?.filter((id: any) => id != null);
            const idSet = new Set(area_master_only_entry_ids);

            const filterGroupedByAreaFlexible = (obj: Record<string, any>) => {
                return Object.fromEntries(
                    Object.entries(obj).map(([k, v]) => {
                        if (Array.isArray(v)) {
                            return [k, v.filter((it) => idSet.has(it?.area?.id))];
                        }
                        if (v && typeof v === "object") {
                            return idSet.has(v?.area?.id) ? [k, v] : [k, undefined];
                        }
                        return [k, v];
                    }).filter(([, v]) => v !== undefined)      // <<< ตัด undefined ออกที่นี่
                );
            };

            const res_ = filterGroupedByAreaFlexible(groupedByArea)

            // setDataLongTerm2(groupedByArea) // ใช้กับ chart ย่อยด้านล่าง
            setDataLongTerm2(res_) // ใช้กับ chart ย่อยด้านล่าง







            // ============ แปลงข้อมูล med term ============
            // เช็ค res_med_.group.id ที่ซ้ำกัน
            // จากนั้นเข้าไปเช็ค res_med_.data ของตัวที่ซ้ำว่า
            // 1. data.area.id ที่ซ้ำกันของแต่ละ res_med_ แล้วเช็ค key month ว่ามีซ้ำกันหรือไม่ ถ้ามีซ้ำ ให้เช็คว่า res_med_.shipper_file_submission_date อันไหนใหม่กว่า ให้เอา data.value ที่ index ตรงกับ month ที่ซ้ำของตัวที่ใหม่กว่ามาใช้
            // 2. แต่ละ object ที่ map ใหม่ต้องโครงสร้างเหมือนเดิม
            // 3. ให้เอาคีย์ month ที่น้อยที่สุดและมากที่สุดมา map ลงให้ถูกต้อง พร้อม value ที่ index ตรงกัน

            // R : ควรแสดงแค่ค่าของไฟล์ planning version ล่าสุด ตอนนี้เหมือนเอาทุก version มารวมกัน เอาค่าล่าสุดของเดือนนั้นๆมาแสดง https://app.clickup.com/t/86ev5f74b
            console.log('res_med_term : ', res_med_term);
            const test_result = mergeResMed(res_med_term, "latestValueByEachPlanningFile"); // ถ้า day ซ้ำกันให้เอาจาก shipper_file_submission_date ที่ใหม่กว่า 
            console.log('+ test_result : ', test_result);

            // const latestPerGroupMedTerm = keepLatestPerGroup(res_med_term);
            // const latestPerGroupMedTerm = keepLatestPerGroupByPeriod(res_med_term); // --> 20251021 เดิมเคยใช้อันนี้  
            // let modifiedDataMed = mergeDataByGroupMedTerm(res_med_term);
            // v1.0.90 ควรที่จะแสดงเป็นข้อมู lasted ของแต่ล่ะ shipper https://app.clickup.com/t/86ert2k27
            // let modifiedDataMed = mergeDataByGroupMedTerm(latestPerGroupMedTerm); // --> 20251021 เดิมเคยใช้อันนี้ 
            // let modifiedDataMedVersionTwo = mergeDataByGroupMedTermVersionTwo(latestPerGroupMedTerm); 

            // ============ set ข้อมูล medium term ============
            // setDataMedTerm(res_med_term);        // เดิม ๆ
            // setFilterDataMedTerm(res_med_term);  // เดิม ๆ

            // setDataMedTerm(latestPerGroupMedTerm);       // ใหม่ 1
            // setFilterDataMedTerm(latestPerGroupMedTerm); // ใหม่ 1

            // setDataMedTermEachGroup(modifiedDataMed)    // เดิม ๆ
            // setFilterDataMedTermEach(modifiedDataMed)   // เดิม ๆ

            // ผิด
            const test_result_2 = prependMissingMonthsFromCurrent(test_result)  // ฟังก์ชั่นนี้จะเพิ่ม label และข้อมูลของเดือนปัจจุบันมาให้ (กรณีไม่มีข้อมูลจริง ๆ จาก api อันที่เพิ่มไปจะเป็น null) v1.0.90 Graph ควรที่จะเริ่มพร้อมกัน https://app.clickup.com/t/86ert2k39
            console.log('test_result : ', test_result_2);
            console.log('____ test_result_2 : ', test_result_2);
            // med term only
            setDataMedTermOriginal(test_result_2);
            setDataMedTerm(test_result_2);        // --> ของ chart Total            เดิมใช้ test_result
            setFilterDataMedTerm(test_result_2);  // --> ของ chart Total            เดิมใช้ test_result
            setDataMedTermEachGroup(test_result_2)    // --> ของ chart each shipper เดิมใช้ test_result
            // filterDataMedTermEach จะถูก set จาก ChartMediumTermAll หลัง filter แล้ว


            // ============ แปลงข้อมูล short term ============
            // R : ควรแสดงแค่ค่าของไฟล์ planning version ล่าสุด ตอนนี้เหมือนเอาทุก version มารวมกัน เอาค่าล่าสุดของเดือนนั้นๆมาแสดง https://app.clickup.com/t/86ev5f74b
            const test_result_short = mergeResMedByDay(res_short_term, "latestValueByEachPlanningFile"); // โครงสร้างเหมือน res_med_ แต่ใช้ key "day" แทน "month"

            // // รวม data[].value ที่ area.id ซ้ำกัน (จับคู่ด้วย day เท่ากัน)
            // const res_short_term_sum_by_area = mergeSumByAreaAndDay(test_result_short)

            // const latestPerGroupShortTerm = keepLatestPerGroup(res_short_term);
            // const latestPerGroupShortTerm = keepLatestPerGroupByPeriod(res_short_term); // --> 20251021 เดิมเคยใช้อันนี้ 

            // let modifiedDataShort = mergeDataByGroupMedTerm(latestPerGroupShortTerm); // --> 20251021 เดิมเคยใช้อันนี้ 
            // let modifiedDataShort = mergeDataByGroupMedTermVersionTwo(latestPerGroupShortTerm); 

            // ============ set ข้อมูล short term ============
            // setDataShortTerm(res_short_term);        // เดิม ๆ
            // setFilterDataShortTerm(res_short_term);  // เดิม ๆ

            // setDataShortTerm(latestPerGroupShortTerm);       // ใหม่ 1
            // setFilterDataShortTerm(latestPerGroupShortTerm); // ใหม่ 1

            // setDataShortTermEachGroup(modifiedDataShort)     // เดิม ๆ
            // setFilterDataShortTermEach(modifiedDataShort)    // เดิม ๆ
            // setDataShortTermEachMain(modifiedDataShort)      // เดิม ๆ

            // setDataShortTerm(test_result_short);            // --> ของ chart Total
            // setFilterDataShortTerm(test_result_short);      // --> ของ chart Total
            // setDataShortTermEachGroup(test_result_short)    // --> ของ chart each shipper
            // setFilterDataShortTermEach(test_result_short)   // --> ของ chart each shipper
            // setDataShortTermEachMain(test_result_short)     // --> ของ chart each shipper

            // const res_short_term_processed = prependMissingDaysFromCurrent(res_short_term_sum_by_area) // ฟังก์ชั่นนี้จะเพิ่ม label และข้อมูลของเดือนปัจจุบันมาให้ (กรณีไม่มีข้อมูลจริง ๆ จาก api อันที่เพิ่มไปจะเป็น null) v1.0.90 Graph ควรที่จะเริ่มพร้อมกัน https://app.clickup.com/t/86ert2k39
            const res_short_term_processed = prependMissingDaysFromCurrent(test_result_short)
            console.log('res_short_term_processed : ', res_short_term_processed);
            setDataShortTermOriginal(res_short_term_processed)
            setDataShortTerm(res_short_term_processed);            // --> ของ chart Total         เดิมใช้ res_short_term_sum_by_area
            setFilterDataShortTerm(res_short_term_processed);      // --> ของ chart Total         เดิมใช้ res_short_term_sum_by_area
            setDataShortTermEachGroup(res_short_term_processed)    // --> ของ chart each shipper  เดิมใช้ res_short_term_sum_by_area
            setFilterDataShortTermEach(res_short_term_processed)   // --> ของ chart each shipper  เดิมใช้ res_short_term_sum_by_area
            setDataShortTermEachMain(res_short_term_processed)     // --> ของ chart each shipper  เดิมใช้ res_short_term_sum_by_area


            // get only groupedByArea.area.id to filter code below
            // const groupedAreaIds = Object.values(groupedByArea).map((group: any) => group.area.id);
            const groupedAreaIds = Object.values(data_long_term_each_group).map((group: any) => group.area.id);

            // filter area ที่มีในชุดข้อมูล
            let area_only = areaMaster?.data?.filter(
                (item: any) =>
                    // (srchEntryExit === "" || item.entry_exit_id === srchEntryExit) &&
                    groupedAreaIds.includes(item.id) // Ensure the item.id exists in groupedAreaIds
            );
            setAreaMasterData(area_only)


            setIsLoading(true)
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };


    const filterOnlyEntry = (data_to_filter: any) => {
        let filteredDataLong: any = data_to_filter

        // Filter Entry Exit นะ
        if (srchEntryExit) {
            filteredDataLong = data_to_filter?.filter((entry: any) => entry.entry_exit_id === srchEntryExit);
        }

        return filteredDataLong
    }

    useEffect(() => {
        if (!isLoading) {
            fetchData();
        }
        getPermission();
    }, []);

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
        setfilterList({
            month: null,
            shipper: null,
            entryExit: null,
            area: []
        })
    };

    const [openView, setOpenView] = useState<any>(false);
    const [isAll, setIsAll] = useState<any>(false);
    const [modeView, setModeView] = useState<any>();
    const [dataView, setDataView] = useState<any>();

    const handleOpenFullView = (mode?: any, data?: any, isAll?: any) => {
        setIsAll(isAll);
        setOpenView(true);
        setModeView(mode);
        setDataView(data);
    };

    // ############### SEARCH ###############
    const [key, setKey] = useState(0);
    // const [srchStartDate, setSrchStartDate] = useState<any>(null);
    const [srchStartYear, setSrchStartYear] = useState<any>('');
    const [srchStartYearMedTerm, setSrchStartYearMedTerm] = useState<any>('');
    const [srchStartYearShortTerm, setSrchStartYearShortTerm] = useState<any>('');
    const [srchStartDay, setSrchStartDay] = useState<any>('');
    const [srchArea, setSrchArea] = useState<any>([]);
    // const [srchEntryExit, setSrchEntryExit] = useState('');
    const [srchEntryExit, setSrchEntryExit] = useState<any>(1); // ให้ Default ค่าเป็น Entry ไว้ https://app.clickup.com/t/86ev16nj6

    const [filterList, setfilterList] = useState({
        month: null,
        shipper: null,
        entryExit: null,
        area: []
    })

    const compareYearOnly = (entryYear?: any, searchStartDate?: any): boolean => {
        const entryYearNum = parseInt(entryYear); // Ensure it's a number
        // const searchYearNum = parseInt(searchStartDate.split('/')[2]); // Extract year from DD/MM/YYYY
        const searchYearNum = parseInt(searchStartDate); // Extract year from DD/MM/YYYY
        return entryYearNum >= searchYearNum; // Compare only the years
    }

    // #region SEARCH LONG TERM
    // SEARCH LONG TERM
    const handleFieldSearch = () => {
        // let filteredDataLong: any
        let filteredDataLong: any = dataLongTerm

        // Filter Entry Exit นะ
        if (srchEntryExit) {
            filteredDataLong = filteredDataLong
                ?.map((dataObj: any) => {
                    const filteredData = dataObj?.data?.filter((entry: any) => entry?.entry_exit_id === srchEntryExit);
                    return filteredData.length > 0 ? { ...dataObj, data: filteredData } : null;
                })
                ?.filter(Boolean);
        }

        // Filter Year และ Area นะ
        const filteredResult = filteredDataLong?.map((item: any) => ({
            ...item,
            data: item.data
                ?.filter((entry: any) => {
                    // Extract year from srchStartDate
                    const searchYearFormatted = parseInt(srchStartYear);
                    const isYearMatch = srchStartYear !== '' ? Array.isArray(entry?.year) && entry?.year.some((entryYear: string) => compareYearOnly(entryYear, searchYearFormatted)) : true;
                    const isAreaMatch = srchArea?.length > 0 ? srchArea.includes(entry?.area?.name) : true; // New filter for area

                    return isAreaMatch && isYearMatch;
                    // return isEntryExitMatch && isAreaMatch && isYearMatch;
                })
                ?.map((entry: any) => {
                    // Check if srchStartYear is provided
                    if (!srchStartYear) {
                        return entry; // If empty, return entry unchanged
                    }

                    const searchYear = parseInt(srchStartYear);

                    // Get valid indices where year >= searchYear
                    const validIndices = entry.year
                        ?.map((year: string, index: number) => (parseInt(year) >= searchYear ? index : -1))
                        ?.filter((index: any) => index !== -1); // Remove -1 (invalid years)

                    return {
                        ...entry,
                        year: entry?.year?.filter((year: string) => parseInt(year) >= searchYear), // Keep valid years only
                        value: validIndices?.map((index: any) => entry.value[index]), // Keep only values at valid indices
                    };
                }),
        }));

        // ============ แปลงข้อมูลย่อย long term ============
        let data_long_term_each_group = sumDataByAreaAndGroup(filteredResult);
        const groupedByArea = data_long_term_each_group?.reduce((acc, item) => {

            const areaId = item.area.id;
            if (!acc[areaId]) {
                acc[areaId] = {
                    area: item.area,
                    years: item.years,
                    groups: []
                };
            }
            acc[areaId].groups.push({
                name: item.group.name,
                sumValues: item.sumValues,
                // color: item.area.color
                color: item.group.color
            });
            return acc;
        }, {});
        setDataLongTerm2(groupedByArea) // ใช้กับ chart ย่อยด้านล่าง

        // ============ แปลงข้อมูล long term ============
        const res_sum_long = sumValuesByArea(filteredResult); // ข้อมูลกราฟหลัก long term
        setFilterDataLongTerm(res_sum_long);
    };

    const handleReset = async () => {
        setSrchStartYear('');
        setSrchArea([]);
        // setSrchEntryExit('');
        setSrchEntryExit(1); // ให้ Default ค่าเป็น Entry ไว้ https://app.clickup.com/t/86ev16nj6
        // setFilterDataLongTerm(dataLongTermMain);
        // resetSubLongTermChart();

        await fetchData();
        setKey((prevKey) => prevKey + 1);
    };

    const resetSubLongTermChart = () => {
        let data_long_term_each_group = sumDataByAreaAndGroup(dataLongTerm);
        const groupedByArea = data_long_term_each_group?.reduce((acc, item) => {
            const areaId = item.area.id;
            if (!acc[areaId]) {
                acc[areaId] = {
                    area: item.area,
                    years: item.years,
                    groups: []
                };
            }
            acc[areaId].groups.push({
                name: item.group.name,
                sumValues: item.sumValues,
                // color: item.area.color
                color: item.group.color
            });
            return acc;
        }, {});
        setDataLongTerm2(groupedByArea) // ใช้กับ chart ย่อยด้านล่าง
    }
    // #endregion

    // #region map medium term ย่อย 
    // ============ map medium term ย่อย ============
    const mappedDataMedTermEach = useMemo(() => {
        if (!filterDataMedTermEach?.length) return [];

        const filter_length_ = filterDataMedTermEach.filter(
            (item: any) => item?.data?.length > 0,
        );

        return filter_length_.map((item: any, index: any) => (
            <div key={`${item?.group?.id ?? index}`} className="col-span-2 w-full h-auto border rounded-[6px] shadow-sm p-2">
                <div className="w-full h-full overflow-y-auto font-bold text-[#58585A]">
                    <div className="flex justify-between items-center w-full pb-2 pr-2">
                        <div className="py-[15px] pl-5">
                            <h2 className="text-[16px] font-bold text-[#58585A] ">{item?.group?.name}</h2>
                        </div>

                        <aside className="flex gap-2">
                            <BtnGeneral
                                textRender={"Full View"}
                                iconNoRender={false}
                                modeIcon={'full_view'}
                                bgcolor={"#00ADEF"}
                                can_view={true}
                                generalFunc={() => handleOpenFullView('Medium term', item, false)}
                            />
                            <BtnGeneral
                                textRender={"Export"}
                                iconNoRender={false}
                                modeIcon={'export'}
                                bgcolor={"#17AC6B"}
                                can_export={userPermission ? userPermission?.f_export : false}
                                generalFunc={() => exportToExcel(item, "medium_term_total")}
                            />
                        </aside>
                    </div>
                    <ChartMedEachShipper
                        dataChart={item}
                        userPermission={userPermission}
                        mode="layout"
                        areaMaster={areaMasterData}
                        srchStartYearMedTerm={filterList?.month || srchStartYearMedTerm}
                        dataAll={dataMedTerm}
                    />
                </div>
            </div>
        ));
    }, [filterDataMedTermEach, userPermission, areaMasterData, dataMedTerm]);


    // const [mappedDataMedTermEach, setMappedDataMedTermEach] = useState<any[]>([]);

    // useEffect(() => {
    //     // re-map medium term each
    //     if (filterDataMedTermEach?.length > 0) {
    //         const filter_length_ = filterDataMedTermEach?.filter((item: any) => item?.data?.length > 0)
    //         const newMappedData = filter_length_?.map((item: any, index: any) => {
    //             return (
    //                 <div key={index} className="col-span-2 w-full h-auto border rounded-[6px] shadow-sm p-2">
    //                     <div className="w-full h-full overflow-y-auto font-bold text-[#58585A]">
    //                         <div className="flex justify-between items-center w-full pb-2 pr-2">
    //                             <div className="py-[15px] pl-5">
    //                                 <h2 className="text-[16px] font-bold text-[#58585A] ">{item?.group?.name}</h2>
    //                             </div>

    //                             <aside className="flex gap-2">
    //                                 <BtnGeneral
    //                                     textRender={"Full View"}
    //                                     iconNoRender={false}
    //                                     modeIcon={'full_view'}
    //                                     bgcolor={"#00ADEF"}
    //                                     // can_view={userPermission ? userPermission?.f_view : false}
    //                                     can_view={true} //ถ้า user มีสิทธิดูหน้านี้ก็มีสิทธิดู fullview ได้
    //                                     generalFunc={() => handleOpenFullView('Medium term', item, false)}
    //                                 />
    //                                 <BtnGeneral
    //                                     textRender={"Export"}
    //                                     iconNoRender={false}
    //                                     modeIcon={'export'}
    //                                     bgcolor={"#17AC6B"}
    //                                     can_export={userPermission ? userPermission?.f_export : false}
    //                                     generalFunc={() => exportToExcel(item, "medium_term_total")}
    //                                 />
    //                             </aside>
    //                         </div>
    //                         <ChartMedEachShipper
    //                             dataChart={item}
    //                             userPermission={userPermission}
    //                             mode="layout"
    //                             areaMaster={areaMasterData}
    //                             srchStartYearMedTerm={srchStartYearMedTerm}
    //                             dataAll={dataMedTerm}
    //                         />
    //                     </div>
    //                 </div>
    //             )
    //         });

    //         setMappedDataMedTermEach(newMappedData);
    //     } else {
    //         setMappedDataMedTermEach([]);
    //     }
    // }, [filterDataMedTermEach]);
    // #endregion


    // #region map short term ย่อย 
    // ============ map short term ย่อย ============
    const [mappedDataShortTermEach, setMappedDataShortTermEach] = useState<any[]>([]);

    useEffect(() => {
        // re-map short term each
        if (filterDataShortTermEach.length > 0) {
            const filter_length_ = filterDataShortTermEach?.filter((item: any) => item?.data?.length > 0)

            const minmaxOfdata = getMinMaxMonth(filter_length_);

            const getMonthRange = (minDate: string, maxDate: string) => {
                if (!minDate || !maxDate) return null;

                const start = dayjs(minDate, "D/M/YYYY", true);
                const end = dayjs(maxDate, "D/M/YYYY", true);

                if (!start.isValid() || !end.isValid()) return null;

                if (end.isBefore(start)) return null;

                if (start.isSame(end, "month")) return 0;

                return end.diff(start, "month");
            };

            // const periodMinxmax = getMonthRange(minmaxOfdata?.min, minmaxOfdata?.max);
            const periodMinxmax = 3;


            const newMappedData = filter_length_?.map((item: any, index: any) => {

                if (item.data.length == 0) return null;

                let makeItem: any;

                if (srchStartDay) {
                    // const result = dayjs(srchStartDay).format("D/M/YYYY");
                    const result = dayjs(srchStartDay).format("DD/MM/BBBB");
                    makeItem = {
                        month: result,
                        data: [item],
                        period: periodMinxmax
                    }
                } else {
                    // แปลง data หาค่า [0] ของ data ทุกตัว เพื่อเอาวันที่เริ่มต้นของ graph
                    const trans = item?.data?.map((d: any) => d?.day?.[0]);

                    // หาเดือน แรกสุดใน data
                    const getMinDateBE = (dates: string[]) => {
                        if (!dates?.length) return null;

                        const minDate = dates.reduce((min, curr) => {
                            const [d1, m1, y1] = curr.split('/').map(Number);
                            const [d2, m2, y2] = min.split('/').map(Number);

                            const date1 = new Date(y1, m1 - 1, d1);
                            const date2 = new Date(y2, m2 - 1, d2);

                            return date1 < date2 ? curr : min;
                        });
                        
                        const minDayjs = dayjs(minDate, "DD/MM/YYYY");
                        const startOfMonth = dayjs().startOf('month');

                        const [day, month, year] = (minDayjs.isBefore(startOfMonth) ? startOfMonth.format("DD/MM/YYYY") : minDate).split('/').map(Number);
                        const yearBE = year + 543;

                        return `${day.toString().padStart(2, '0')}/${month
                            .toString()
                            .padStart(2, '0')}/${yearBE}`;
                    };

                    const result = getMinDateBE(trans);
                    makeItem = {
                        month: result,
                        data: [item],
                        period: periodMinxmax
                    }
                }

                return (
                    <div key={index} className="col-span-2 w-full h-auto border rounded-[6px] shadow-sm p-2">
                        <div className="w-full h-full overflow-y-auto font-bold text-[#58585A]">
                            <div className="flex justify-between items-center w-full pb-2 pr-2">
                                <div className="py-[15px] pl-5">
                                    <h2 className="text-[16px] font-bold text-[#58585A]">
                                        {item?.group?.name}
                                        {/* {`Planning no. ${item?.planning_code}`} */}
                                    </h2>
                                </div>

                                <aside className="flex gap-2">
                                    <BtnGeneral
                                        textRender={"Full View"}
                                        iconNoRender={false}
                                        modeIcon={'full_view'}
                                        bgcolor={"#00ADEF"}
                                        generalFunc={() => handleOpenFullView('Short term', item, false)}
                                        // can_view={userPermission ? userPermission?.f_view : false}
                                        can_view={true} //ถ้า user มีสิทธิดูหน้านี้ก็มีสิทธิดู fullview ได้
                                    />

                                    <BtnGeneral
                                        textRender={"Export"}
                                        iconNoRender={false}
                                        modeIcon={'export'}
                                        bgcolor={"#17AC6B"}
                                        can_export={userPermission ? userPermission?.f_export : false}
                                        // can_export={true}
                                        generalFunc={() => exportToExcel(makeItem, "short_term_total", '', { mode: 'each' })}
                                    />
                                </aside>
                            </div>

                            <ChartShortEachShipper
                                dataChart={item}
                                userPermission={userPermission}
                                srchStartDay={filterList?.month || srchStartDay}
                                areaMaster={areaMasterData}
                                dataAll={dataShortTerm}
                            />
                        </div>
                    </div>
                )
            }

            );

            setMappedDataShortTermEach(newMappedData);
        } else {
            setMappedDataShortTermEach([]); // Clear when filterDataShortTermEach is empty
        }
    }, [filterDataShortTermEach]);
    // #endregion


    useEffect(() => {
        switch (tabIndex) {
            case 0:
                // long term
                setAreaMasterData(areaMaster?.data?.filter((area: any) =>
                    filterDataLongTerm.some((data: any) => data.area.id === area.id)
                ))
                break;
            case 1:
                let filter_area_med = areaMaster?.data?.filter((area: any) =>
                    dataMedTermOriginal?.some((data: any) =>
                        data?.data?.some((entry: any) => entry?.area?.id === area?.id)
                    )
                )
                setAreaMasterData(filter_area_med);
                break;
            case 2:
                // short term
                let filter_area_short = areaMaster?.data?.filter((area: any) =>
                    dataShortTerm?.some((data: any) =>
                        data?.data?.some((entry: any) => entry?.area?.id === area?.id)
                    )
                )
                setAreaMasterData(filter_area_short);
                break;
        }

        resetArray(tabIndex)

    }, [tabIndex])

    const resetArray = (tab: number) => {

        // ทั้งหมดนี้คือการ reset data ก่อนจะลง chart เพื่อให้ reset ทั้ง filter / labels ที่ค้างไว้ เมื่อเปลี่ยน tabs
        switch (tab) {
            // rest set ค่า 
            case 0:
                setDataMedTerm([])
                setFilterDataMedTermEach([]);
                setSrchStartYearMedTerm("")
                break;
            case 1:
                // set ค่า 
                setDataMedTerm(dataMedTermOriginal)
                // filterDataMedTermEach จะถูกอัปเดตจาก ChartMediumTermAll.handleFieldSearchX

                // rest set ค่า 
                setDataShortTerm([]);
                setFilterDataShortTermEach([]);
                setSrchStartDay("")
                break;
            case 2:

                // set ค่า
                setDataShortTerm(dataShortTermOriginal)
                setFilterDataShortTermEach(dataShortTermOriginal)

                // rest set ค่า 
                setDataMedTerm([]);
                setFilterDataMedTermEach([]);
                setSrchStartYearMedTerm("")
                break;
        }
    }


    return (
        <div className="space-y-2">
            <div className="w-full h-[calc(100vh-160px)] flex flex-col  bg-center">

                <div className="tabPlanning">
                    <Tabs
                        value={tabIndex}
                        onChange={handleChange}
                        aria-label="tabs"
                        sx={{
                            marginBottom: '-19px !important',
                            '& .MuiTabs-indicator': {
                                display: 'none', // Remove the underline
                            },
                            '& .Mui-selected': {
                                color: '#58585A !important',
                            },
                        }}
                    >
                        {['Long Term Planning', 'Medium Term Planning', 'Short Term Planning'].map((label, index) => (
                            <Tab
                                key={label}
                                label={label}
                                id={`tab-${index}`}
                                sx={{
                                    fontFamily: 'Tahoma !important',
                                    border: '0.5px solid',
                                    borderColor: '#DFE4EA',
                                    borderBottom: 'none',
                                    borderTopLeftRadius: '9px',
                                    borderTopRightRadius: '9px',
                                    textTransform: 'none',
                                    padding: '8px 16px',
                                    // flex: 1, // Make tabs equally wide
                                    // minWidth: '150px !important', // Ensure the minimum width is applied
                                    // width: '300px !important', // Explicitly apply a fixed width
                                    backgroundColor: tabIndex === index ? '#FFFFFF' : '#9CA3AF1A',
                                    color: tabIndex === index ? '#58585A' : '#9CA3AF',
                                    '&:hover': {
                                        backgroundColor: '#F3F4F6',
                                    },
                                }}
                            />
                        ))}
                    </Tabs>
                </div>

                {/* Tab long term */}
                {
                    tabIndex == 0 && 
                    <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
                        {/* CHART 1 MAIN */}
                        <div className="col-span-2 w-full h-auto border rounded-[10px] shadow-sm p-2">
                            <div className="py-[15px] pl-5">
                                <h2 className="text-[16px] font-bold text-[#58585A] ">{`Long term`}</h2>
                            </div>

                            <aside className="flex flex-wrap sm:flex-row gap-2 pb-2 w-full pl-[20px]">
                                <InputSearch
                                    id="searchStartYear"
                                    label="Start Year"
                                    type="select"
                                    value={srchStartYear}
                                    onChange={(e) => setSrchStartYear(e.target.value)}
                                    options={map60Year?.map((item: any) => ({
                                        value: item.name,
                                        label: item.name
                                    }))}
                                />

                                <InputSearch
                                    id="searchEntryExit"
                                    label="Entry/Exit"
                                    type="select"
                                    value={srchEntryExit}
                                    onChange={(e) => setSrchEntryExit(e.target.value)}
                                    options={entryExitMaster?.data?.map((item: any) => ({
                                        value: item.id,
                                        label: item.name
                                    }))}
                                />

                                <InputSearch
                                    id="searchArea"
                                    label="Area"
                                    type="select-multi-checkbox"
                                    value={srchArea}
                                    onChange={(e) => setSrchArea(e.target.value)}
                                    options={areaMasterData
                                        ?.filter((item: any) => srchEntryExit === '' || item.entry_exit_id === srchEntryExit)
                                        .map((item: any) => ({
                                            value: item.name,
                                            label: item.name,
                                        }))
                                    }
                                />

                                <BtnSearch handleFieldSearch={handleFieldSearch} />
                                <BtnReset handleReset={handleReset} />
                            </aside>

                            <div className="w-full h-full ">
                                {
                                    isLoading ? (
                                        filterDataLongTerm?.length > 0 ?
                                            <ChartLongTerm
                                                dataChart={filterDataLongTerm}
                                                userPermission={userPermission}
                                            />
                                            :
                                            <NodataTable />
                                    ) : <ChartSkeleton />
                                }
                            </div>
                        </div>

                        {
                            isLoading && Object.values(dataLongTerm2).map((areaData: any, index: any) => {
                                let find_area = areaMaster?.data?.filter((item: any) => item.id === areaData?.area?.id);
                                return (
                                    <ChartLongTerm2
                                        key={index}
                                        dataChart={areaData}
                                        userPermission={userPermission}
                                        find_area={find_area}
                                    />
                                )
                            }
                            )
                        }
                    </div>
                }

                {/* Tab medium term */}
                {
                    tabIndex == 1 && <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
                        <div className="col-span-2 w-full h-auto border rounded-[6px] shadow-sm p-2">
                            <div className="w-full h-full ">
                                {
                                    isLoading ?
                                        dataMedTerm.length > 0 ?
                                            <ChartMediumTermAll
                                                areaMasterDataFilter={areaMasterData}
                                                dataChart={dataMedTerm}
                                                userPermission={userPermission}
                                                setFilterDataMedTerm={setFilterDataMedTerm}
                                                filterDataMedTerm={filterDataMedTerm}
                                                filterDataMedTermEach={filterDataMedTermEach} // เอาไป export มันเติมเดือน filter มาให้แล้ว ของดี
                                                setFilterDataMedTermEach={handleFilterDataMedTermEachChange}
                                                dataMedTermEachGroup={dataMedTermEachGroup}
                                                setSrchStartYearMedTerm={setSrchStartYearMedTerm}
                                                srchStartYearMedTerm={srchStartYearMedTerm} // เอาไว้ใช้ตอนกด full view ข้อมูลข้างในจะได้เหมือนข้างนอก
                                                setfilterList={setfilterList} // เอาไว้ใช้ที่ chart ลูก
                                                filterList={filterList}
                                            />
                                            : <NodataTable />
                                        :
                                        <ChartSkeleton />
                                }
                            </div>
                        </div>
                        

                        {/* Chart ย่อย */}
                        {mappedDataMedTermEach}
                    </div>
                }

                {/* Tab short term */}
                {
                    tabIndex == 2 && <div className="grid grid-cols-2 gap-4 pt-2 pb-2">
                        <div className="col-span-2 w-full h-auto border rounded-[6px] shadow-sm p-2">
                            <div className="w-full h-full ">
                                {
                                    isLoading ?
                                        dataShortTerm.length > 0 ?
                                            <ChartShortTermAll
                                                areaMasterDataFilter={areaMasterData}
                                                dataChart={dataShortTerm}
                                                userPermission={userPermission}
                                                setFilterDataShortTerm={setFilterDataShortTerm}
                                                filterDataShortTerm={filterDataShortTerm}
                                                dataShortTermEachMain={dataShortTermEachMain}
                                                filterDataShortTermEach={filterDataShortTermEach} // เอาไป export มันเติมเดือน filter มาให้แล้ว ของดี

                                                setFilterDataShortTermEach={setFilterDataShortTermEach}
                                                setDataShortTermEachGroup={setDataShortTermEachGroup}
                                                dataShortTermEachGroup={dataShortTermEachGroup}
                                                setSrchStartDay={setSrchStartDay}
                                                setfilterList={setfilterList} // เอาไว้ใช้ที่ chart ลูก
                                                filterList={filterList}
                                            />

                                            :
                                            <NodataTable />
                                        :
                                        <ChartSkeleton />
                                }

                            </div>
                        </div>

                        {/* Chart ย่อย */}
                        {mappedDataShortTermEach}
                    </div>
                }
            </div>

            <ModalFullView
                mode={modeView}
                data={dataView}
                isAll={isAll}
                open={openView}
                onClose={() => {
                    setOpenView(false);
                }}
                shipperGroupData={shipperGroupData}
                areaMaster={areaMasterData}
                entryExitMaster={entryExitMaster}
                filterList={filterList}
                dataOriginal={tabIndex == 1 ? dataMedTerm : tabIndex == 2 ? dataShortTerm : []}
            />


        </div>

    );
};

export default ClientPage;
