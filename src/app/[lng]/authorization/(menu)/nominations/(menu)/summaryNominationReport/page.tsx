"use client";
import { useEffect, useMemo, useState } from "react";
import { decorateRowsWithGroupSums, findRoleConfigByMenuName, generateUserPermission, getCurrentWeekSundayYyyyMmDd, getLastSunday, toDayjs } from '@/utils/generalFormatter';
import { getService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import BtnNomination from "@/components/other/btnNomination";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import CheckboxSearch2 from "@/components/other/SearchForm";
import FrameTable from "./form/frameTable";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Spinloading from "@/components/other/spinLoading";
import getUserValue from "@/utils/getuserValue";
import { useSearchParams } from "next/navigation";
import { tabPanel } from "@material-tailwind/react";

dayjs.extend(utc);
dayjs.extend(timezone);

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    const searchParams = useSearchParams();
    const filter_gas_day_from_somewhere_else: any = searchParams.get("filter_gas_day");
    const filter_tab_from_somewhere_else: any = searchParams.get("tab_filter");
    const mainTab: any = searchParams.get("mainTab");
    const subTab: any = searchParams.get("subTab");
    const [checkIsAllAreaImbalance, setCheckIsAllAreaImbalance] = useState<any>(false);

    const [tabIndexNomAreaTotal, setTabIndexNomAreaTotal] = useState(mainTab === "1" ? 1 : 0);
    const [tabIndexFrameTableMain, setTabIndexFrameTableMain] = useState<any>(mainTab === "1" ? 1 : 0); // ส่งเข้าไปใน FrameTable จะเอาไว้ดูว่ากด tab ไหน (tab หลัก 0 = Nomination, 1 = Area, 2 = Total System)
    const [tabIndexFrameTableSub, setTabIndexFrameTableSub] = useState<any>(subTab === "0" ? 0 : 0); // ส่งเข้าไปใน FrameTable จะเอาไว้ดูว่ากด tab ไหน (tab ย่อย 0 = MMSCF, 1 = MMBTU, Imbalance)
    const [filteredDataTable, setFilteredDataTable] = useState<any>(null);
    const [filteredDataTableWeekly, setFilteredDataTableWeekly] = useState<any>(null);
    const [filteredDataTableDaily, setFilteredDataTableDaily] = useState<any>(null);
    const [dataEva, setDataEva] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [dataNomPointMaster, setDataNomPointMaster] = useState<any>([]);
    const [nomDataK, setNomDataK] = useState<any>([]);
    const [f1, setf1] = useState(false)
    const [f2, setf2] = useState(false)
    const [f3, setf3] = useState(false)
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchStartDateWeekly, setSrchStartDateWeekly] = useState<Date | null>(filter_tab_from_somewhere_else === "1" ? dayjs(filter_gas_day_from_somewhere_else, "YYYY-MM-DD").toDate() : null);
    const [srchStartDateDaily, setSrchStartDateDaily] = useState<Date | null>(filter_tab_from_somewhere_else === "0" ? dayjs(filter_gas_day_from_somewhere_else, "YYYY-MM-DD").toDate() : null);
    const [srchCheckbox, setSrchCheckbox] = useState(false);
    const [isChangeSearchStartDate, setIsChangeSearchStartDate] = useState(false); // เอาไว้ใช้ตอนกดเสิช
    const [dataSearch, setDataSearch] = useState<any>([]);
    const [isResetClick, setIsResetClick] = useState<boolean>(false);
    const [dataNomCodeX, setDataNomCodeX] = useState<any>(null);
    const { zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const [dashboardObj, setDashboardObj] = useState<any>();
    const [tabIdxNomAreaTotal, setTabIdxNomAreaTotal] = useState<any>(mainTab === "1" ? 1 : 0); // case มาจากหน้า dashboard เอาไว้ fix เปิด tab area
    const [activeButton, setActiveButton] = useState<number | null>(filter_tab_from_somewhere_else === "1" ? 2 : filter_tab_from_somewhere_else === "0" ? 3 : 1); 
    const dispatch = useAppDispatch();
    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);
    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;
    

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Summary Nomination Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName(`Summary Nomination Report`, userDT)
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

    // ############### CHECK ว่ามาจากหน้า nomination dashboard ป่าว ###############

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
    }, [dispatch, forceRefetch, areaMaster, zoneMaster]); // Watch for forceRefetch changes


    
    const getNomPoint = async () => {
        const today = toDayjs();
        const response_nom_point: any = await getService(`/master/asset/nomination-point`);
        const activeNominationPoints = response_nom_point?.filter((point: any) => {
            const startDate = point?.start_date ? toDayjs(point?.start_date) : null;
            const endDate = point?.end_date ? toDayjs(point?.end_date) : null;

            if (startDate && today.isBefore(startDate, 'day')) {
                return false;
            }
            if (endDate && today.isAfter(endDate, 'day')) {
                return false;
            }
            return true;
        });
        setDataNomPointMaster(activeNominationPoints)
      }      

    const getNomData = async () => {
        const res_nom_data: any = await getService(`/master/summary-nomination-report/nomData`);
        const mod_nom = res_nom_data?.map((item: any) => {
            return {
                ...item,
                mmscf_max_cap: item?.maximum_capacity,
                // mmscf_max_cap: item?.maximum_capacity / 24,
            }
        })
        setNomDataK(mod_nom)
    }

    useEffect(() => {
        getNomPoint();
        getNomData();
        if(filter_gas_day_from_somewhere_else && filter_tab_from_somewhere_else){
            handleFieldSearch()
        }
    }, [])

    // ############### CHANGE TAB HANDLE ###############

    const handleClick = (id: number | undefined, row_id?: number) => {
        setActiveButton(id || null);
    };

    const buttons = useMemo(() => {
        const baseButtons = [
            { text: "All", id: 1 },
            { text: "Weekly", id: 2 },
            { text: "Daily", id: 3 }
        ];
        return [...baseButtons];
    }, [dataNomCodeX?.nomination_version[0].nomination_row_json]);

    // ############### FIELD SEARCH ###############


    const fetchSearch = async (is_reset_click?: any) => {
        setIsLoading(false);
        setIsResetClick(false)
       const srchStartDate_ = activeButton == 1 ? srchStartDate : activeButton == 2 ? srchStartDateWeekly : srchStartDateDaily
        // ====== ใหม่
        let gas_day_search: any = srchStartDate_ ? dayjs(srchStartDate_).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY");
        let gas_day_search_for_eva: any = srchStartDate_ ? dayjs(srchStartDate_).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");

        // ถ้าเป็น nom --> daily --> mmbtud เอามากรองหน้าบ้าน
        const total_over_cap = (tabIndexFrameTableMain == 0 && tabIndexFrameTableSub == 1 && activeButton == 3) ? false : srchCheckbox

        try {
            const tab = activeButton == 2 ? 'weekly' : activeButton == 3 ? 'daily' : 'all';
            const response: any = await getService(`/master/summary-nomination-report?gas_day_text=${gas_day_search}&tab=${tab}&overTotalCap=${total_over_cap}`);
            console.log('response : ', response);
            // เอา hv มาทำตัวแดง (อ่านคอมเม้นพี่แนนนะ)
            // https://app.clickup.com/t/86etzchd8
            // https://app.clickup.com/t/86etzchaq
            const res_eva: any = await getService(`/master/quality-evaluation?gasDay=${gas_day_search_for_eva}&contract_code=`);
            if (response) {
                // setDataSearch(response);
                setDataEva(res_eva);
            }
            setTimeout(() => setIsLoading(true), 1000);

            return response;
        } catch (error) {
            return null;
        }
    };

    const handleFieldSearch = async () => {

        const res_x = await fetchSearch();
        let filteredMockDataForFilter: any = res_x
        const pointCapacityMap = dataNomPointMaster?.reduce((map: any, point: any) => {

            map[point.nomination_point] = point?.maximum_capacity;
            return map;
        }, {} as Record<string, number>);

        if (srchCheckbox) {
            // case search over total cap
            // ยกมาจาก tableDailyNom เพราะตรงนั้นทำตัวแดงตาม issues ข้อนี้ https://app.clickup.com/t/86ev8tun8
            const data_nom_daily_mmbtud = decorateRowsWithGroupSums(res_x?.nomination.daily.MMBTUD);

            // 3. Filter ข้อมูลข้างใน mock_data_for_filter แต่ยังรักษาโครงสร้างเดิมไว้
            filteredMockDataForFilter = {
                ...res_x, // copy โครงสร้างเดิมไว้ก่อน
                nomination: {
                    ...res_x?.nomination,
                    daily: {
                        ...res_x?.nomination.daily,
                        MMSCFD: (res_x?.nomination.daily.MMSCFD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                       
                        MMBTUD: (data_nom_daily_mmbtud || []).filter((item: any) => {
                            // ข้อมูล 01/01/2026 daily --> nom --> mmbtu
                            // กรอง over cap ได้ 32 rec
                            // ไม่กรอง นับแดงได้ 54 rec

                            const find_validate = nomDataK?.find((item_nom_data: any) => item_nom_data?.nomination_point === item?.nomination_point);

                            const targetData = dataEva?.newDaily?.find((itemEva: any) => {
                                const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate?.area?.id : find_validate?.area?.supply_reference_quality_area;
                                return (
                                    itemEva.area.id === area_id &&
                                    itemEva.zone.name === find_validate?.zone?.name &&
                                    itemEva.parameter === "HV"
                                );
                            });

                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, "").trim() || "0");

                            // if (totalCapNumber === 0) return false;

                            const totalLimit = find_validate?.maximum_capacity * targetData?.valueBtuScf;
                            const hourlyLimit = (find_validate?.maximum_capacity * targetData?.valueBtuScf) / 24;

                            const isTotalOver = totalCapNumber > totalLimit;

                            const isAnyHourOver = Array.from({ length: 24 }, (_, i) => i + 1).some((hour) => {
                                const hValue = parseFloat(item?.[`sum_H${hour}`]?.toString().replace(/,/g, "").trim() || "0");
                                return hValue > hourlyLimit;
                            });

                            return isTotalOver || isAnyHourOver;
                        }),
                    },
                    all: {
                        ...res_x?.nomination.all,
                        MMSCFD: (res_x?.nomination.all.MMSCFD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                        MMBTUD: (res_x?.nomination.all.MMBTUD || []).filter((item: any) => {
                            const maxCap = pointCapacityMap[item?.nomination_point];
                            if (!maxCap) return false;
                            const totalCapNumber = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            if (totalCapNumber === 0) return false;

                            return totalCapNumber > maxCap;
                        }),
                    },
                    weekly: {
                        ...res_x?.nomination.weekly,

                    },
                },
                area: {
                    ...res_x?.area,
                    daily: {
                        ...res_x?.area.daily,
                        MMBTUD: (res_x?.area?.daily?.MMBTUD || []).filter((item: any) => {
                            // All > Area > MMBTU > Check Box Over Total Cap ยังไม่กรองข้อมูลให้ https://app.clickup.com/t/86etty0ze
                            const item_total_cap = parseFloat(item?.totalCap?.toString().replace(/,/g, '').trim() || "0");
                            const area_nom_cap = areaMaster?.data?.find((area: any) => area?.name == item?.area_text)
                            if (!item_total_cap) return false;
                            return item_total_cap > area_nom_cap?.area_nominal_capacity;
                        }),
                    }
                }
            };

        } else {
            // case default
            filteredMockDataForFilter = res_x
        }
    
        if(activeButton == 1){
            setFilteredDataTable(filteredMockDataForFilter);
            
        }else if(activeButton == 2){
            setFilteredDataTableWeekly(filteredMockDataForFilter)
            
        }else if(activeButton == 3){
            setFilteredDataTableDaily(filteredMockDataForFilter)
        }
    };


    // #region handle reset
    const handleReset = async (active_btn?: any) => {
        
        if(active_btn == 1 || activeButton == 1){
            setFilteredDataTable(null)
            // setSrchStartDate(null)
        }else if (active_btn == 2 || activeButton == 2) {
            setFilteredDataTableWeekly(null)
            // const last_sunday = getLastSunday();
            // setSrchStartDateWeekly(null);
        } else if(active_btn == 3 || activeButton == 3) {
            setFilteredDataTableDaily(null)
            // setSrchStartDateDaily(null)
        }

    };

    useEffect(() => {
        setSrchCheckbox(false);
    }, [activeButton]);

    return (<div>
        <div className="space-y-2 ">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                   
                        <div className={`${activeButton !== 1 && "hidden"}`}>
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Day"}
                                placeHolder={"Select Gas Day"}
                                defaultValue={srchStartDate}
                                isGasWeek={false}
                                isGasWeekPlusOne={false}
                                isDefaultTomorrow={false}
                                modeSearch={null}
                                allowClear
                                onChange={(e: any) => {
                                    setf1(true)
                                    setSrchStartDate(e ? e : null)
                                }}
                            />
                        </div>
                        <div className={`${activeButton !== 2 && "hidden"}`}>
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Week"}
                                placeHolder={"Select Gas Day"}
                                defaultValue={srchStartDateWeekly}
                                // isGasWeek={activeButton == 1 || activeButton == 3 ? false : true}
                                isGasWeek={false}
                                isGasWeekPlusOne={false}
                                isDefaultTomorrow={false}
                                modeSearch={'sunday'}
                                allowClear
                                onChange={(e: any) => {
                                    setf2(true)
                                    setSrchStartDateWeekly(e ? e : null)
                                }}
                            />
                        </div>
                        <div className={`${activeButton !== 3 && "hidden"}`}>
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Day"}
                                placeHolder={"Select Gas Day"}
                                defaultValue={srchStartDateDaily}
                                // isGasWeek={activeButton == 1 || activeButton == 3 ? false : true}
                                isGasWeek={false}
                                isGasWeekPlusOne={false}
                                isDefaultTomorrow={false}
                                modeSearch={null}
                                allowClear
                                onChange={(e: any) => {
                                    setf3(true)
                                    setSrchStartDateDaily(e ? e : null)
                                }}
                            />
                        </div>

                    {
                        !checkIsAllAreaImbalance && <div className="w-auto relative">
                            <CheckboxSearch2
                                id="checkbox_filter"
                                label="Over Total Cap"
                                type="single-line"
                                value={srchCheckbox ? srchCheckbox : false}
                                onChange={(e: any) => setSrchCheckbox(e?.target?.checked)}
                            />
                        </div>
                    }

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
            </div>
        </div>

        <div className="flex h-[calc(100vh-100px)] gap-2 pt-2 overflow-hidden">
            {/* Sidebar (15%) */}
            <div className="w-[15%] p-2 flex flex-col">
                {buttons?.map(({ text, id }) => (
                    <div key={id} className="pb-2">
                        <BtnNomination
                            idToggle={id}
                            btnText={text}
                            // disable={!userPermission?.f_view}
                            disable={false}
                            isActive={activeButton === id}
                            onClick={() => handleClick(id)}
                        />
                    </div>
                ))}
            </div>

            {/* Main Content (85%) */}
            <div className="w-[85%] h-[100vh] border-[#DFE4EA] gap-2 pt-2 rounded-xl  flex flex-col overflow-hidden relative">
                <Spinloading spin={!isLoading} rounded={20} />
                {/* Content Section - Takes full remaining height */}
                <div className="flex-1 px-4 overflow-hidden">
                    {buttons?.map((button) => {
                        if (activeButton === button.id) {
                            switch (button.text) {
                                case "All":
                                    return <FrameTable
                                        activeButton={activeButton}
                                        tableData={filteredDataTable}
                                        areaMaster={areaMaster}
                                        zoneMaster={zoneMaster}
                                        nomDataK={nomDataK}
                                        userPermission={userPermission}
                                        setCheckIsAllAreaImbalance={setCheckIsAllAreaImbalance}
                                        srchStartDate={srchStartDate} // ส่งไปใช้ใน all -> total system
                                        tabIdxNomAreaTotal={tabIdxNomAreaTotal} // case มาจากหน้า dashboard เอาไว้ fix เปิด tab area
                                        srchCheckbox={srchCheckbox} // เอาไว้ใช้ที่ export
                                        setTabIndexFrameTableMain={setTabIndexFrameTableMain}
                                        setTabIndexFrameTableSub={setTabIndexFrameTableSub}
                                        tabIndexNomAreaTotal={tabIndexNomAreaTotal} 
                                        setTabIndexNomAreaTotal={setTabIndexNomAreaTotal}
                                        checkIsAllAreaImbalance={checkIsAllAreaImbalance}
                                    />

                                case "Daily":
                                    return <FrameTable
                                        activeButton={activeButton}
                                        isLoading={true}
                                        tableData={filteredDataTableDaily}
                                        dataEva={dataEva}
                                        areaMaster={areaMaster}
                                        zoneMaster={zoneMaster}
                                        nomDataK={nomDataK}
                                        userPermission={userPermission}
                                        setCheckIsAllAreaImbalance={setCheckIsAllAreaImbalance}
                                        srchStartDate={srchStartDateDaily} // ส่งไปใช้ใน daily -> total system
                                        tabIdxNomAreaTotal={tabIdxNomAreaTotal} // case มาจากหน้า dashboard เอาไว้ fix เปิด tab area
                                        srchCheckbox={srchCheckbox} // เอาไว้ใช้ที่ export
                                        setTabIndexFrameTableMain={setTabIndexFrameTableMain}
                                        setTabIndexFrameTableSub={setTabIndexFrameTableSub}
                                        tabIndexNomAreaTotal={tabIndexNomAreaTotal} 
                                        setTabIndexNomAreaTotal={setTabIndexNomAreaTotal}
                                        checkIsAllAreaImbalance={checkIsAllAreaImbalance}
                                    />

                                case "Weekly":
                                    return <FrameTable
                                        activeButton={activeButton}
                                        isLoading={true}
                                        tableData={filteredDataTableWeekly}
                                        dataEva={dataEva}
                                        areaMaster={areaMaster}
                                        zoneMaster={zoneMaster}
                                        nomDataK={nomDataK}
                                        userPermission={userPermission}
                                        setCheckIsAllAreaImbalance={setCheckIsAllAreaImbalance}
                                        srchStartDate={srchStartDateWeekly} // ส่งไปใช้ใน weekly -> total system
                                        tabIdxNomAreaTotal={tabIdxNomAreaTotal} // case มาจากหน้า dashboard เอาไว้ fix เปิด tab area
                                        srchCheckbox={srchCheckbox} // เอาไว้ใช้ที่ export
                                        setTabIndexFrameTableMain={setTabIndexFrameTableMain}
                                        setTabIndexFrameTableSub={setTabIndexFrameTableSub}
                                        tabIndexNomAreaTotal={tabIndexNomAreaTotal} 
                                        setTabIndexNomAreaTotal={setTabIndexNomAreaTotal}
                                        checkIsAllAreaImbalance={checkIsAllAreaImbalance}
                                    />

                                default:

                                    // return <TableEachZone key={button.id} zoneText={button.text} tableData={mod_data_mock} isLoading={isLoading} columnVisibility={columnVisibilityEntryExit} />;
                                    return <></>
                            }
                        }
                        return null; // Render nothing if not active
                    })}
                </div>
            </div>
        </div>

    </div>
    );
};

export default ClientPage;