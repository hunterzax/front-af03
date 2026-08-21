"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { exportToExcel, findRoleConfigByMenuName, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, generateUserPermission, splitByGroupCopyCat } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
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
import TableAll from "./form/tableTabAll";
import TableWeekly from "./form/tableTabWeekly";
import BtnGeneral from "@/components/other/btnGeneral";
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import { exportMinInventoryWeekly } from "@/utils/exportMinimumInventoryWeek";
import { useSearchParams } from "next/navigation";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    const [tk, settk] = useState<boolean>(false);

    const searchParams = useSearchParams();
    const filter_gas_day: any = searchParams.get("filter_gas_day");
    const filter_tab: any = searchParams.get("tab_filter");

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
            //     const permission = findRoleConfigByMenuName('Minimum Inventory Summary', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Minimum Inventory Summary', userDT)
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
    const { zoneMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
    }, [dispatch, forceRefetch]); // Watch for forceRefetch changes

    // ############### General ###############
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const [dataTableWeekly, setDataTableWeekly] = useState<any>([]);

    const moveValueToRoot = (dataArray: any[]) => {
        return dataArray.map(group => {
            const minEntry = group ? group.minInven : (group.data?.find((entry: any) => entry.type === "Min_Inventory_Change")?.value);
            const exchangeEntry = group ? group.exchangeMinInven : (group.data?.find((entry: any) => (entry.type === "Exchange_Mininventory" || entry.type === "Exchange_Min_Inventory"))?.value);
            const totalAll = minEntry + exchangeEntry

            return {
                ...group,
                // minInvenChange: minEntry?.value || 0,
                // exchangeMinInven: exchangeEntry?.value || 0,
                minInvenChange: minEntry,
                exchangeMinInven: exchangeEntry,
                totalAll: totalAll || 0,
            };
        });
    };

    const getContractCode = async () => {
        // DATA CONTRACT CODE
        // const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
        // const res_contract_code: any = await getService(`/master/capacity/capacity-request-management`);
        const res_contract_code: any = await getService(`/master/capacity/pure-contract`);
        setDataContractOriginal(res_contract_code);
        settk(!tk);

        return res_contract_code
    }

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filteredDataTableWeekly, setFilteredDataTableWeekly] = useState<any>([]);
    const [key, setKey] = useState(0);
    // const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    // const [srchStartDate, setSrchStartDate] = useState<any>(dayjs().tz("Asia/Bangkok").add(1, "day").toDate());
    // const [srchStartDate, setSrchStartDate] = useState<any>(filter_gas_day ? dayjs(filter_gas_day, "YYYY-MM-DD").tz("Asia/Bangkok").toDate() : dayjs().tz("Asia/Bangkok").add(1, "day").toDate());
    // const [srchStartDate, setSrchStartDate] = useState<any>(filter_gas_day ? dayjs(filter_gas_day, "YYYY-MM-DD").tz("Asia/Bangkok").toDate() : (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0).format("YYYY-MM-DD")));

    const [tabIndex, setTabIndex] = useState(
        filter_tab ? Number(filter_tab) : 0
    );

    const getDefaultDateByTab = (tab: number) => {
        // if (filter_gas_day) {
        //     return dayjs(filter_gas_day, "YYYY-MM-DD")
        //         .tz("Asia/Bangkok")
        //         .startOf("day");
        // }
        if (filter_gas_day) {
            setSrchStartDate(
                dayjs(filter_gas_day, "YYYY-MM-DD")
                    .tz("Asia/Bangkok")
                    .startOf("day")
            );
        }

        if (tab === 0 || tab === 1) {
            return dayjs()
                .tz("Asia/Bangkok")
                .add(1, "day")
                .startOf("day");
        }

        const now = dayjs().tz("Asia/Bangkok");

        return now.day() === 5 || now.day() === 6
            ? now.add(1, "week").day(0).startOf("day")
            : now.day(0).startOf("day");
    };

    const [srchStartDate, setSrchStartDate] = useState<any>(() =>
        getDefaultDateByTab(filter_tab ? Number(filter_tab) : 0)
    );
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);

    function getSundayOfWeek(date: any) {
        return dayjs(date).startOf('week');  // ใช้ startOf('week') เพื่อหาวันอาทิตย์ในสัปดาห์นั้น
    }

    const handleFieldSearch = async (
        tab: number = tabIndex,
        dateValue: any = srchStartDate
    ) => {
        setIsLoading(false)

        const selectedDate = dateValue ?? getDefaultDateByTab(tab);

        const gasDay =
            tab === 2
                ? dayjs(getSundayOfWeek(selectedDate)).format("YYYY-MM-DD")
                : dayjs(selectedDate)
                    .tz("Asia/Bangkok")
                    .format("YYYY-MM-DD");
        const res_ = await getService(
            `/master/minimum-inventory-summary?gas_day=${gasDay}`
        );

        const localDate = dayjs(selectedDate)
            .tz("Asia/Bangkok")
            .format("DD/MM/YYYY");
      
        // const res_ = await getService(`/master/minimum-inventory-summary?gas_day=${
        //     srchStartDate && (tab == 0 || tab == 1) 
        //     ? dayjs(srchStartDate).format("YYYY-MM-DD") 
        //     : srchStartDate && tab == 2 
        //     ? dayjs(getSundayOfWeek(srchStartDate)).format("YYYY-MM-DD") 
        //     : ( tab === 2 ? (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0)) : dayjs().add(1, 'day'))
        // }`);
        // const localDate = dayjs(srchStartDate).tz("Asia/Bangkok").format("DD/MM/YYYY");

        const result_2 = res_
            // .filter((item: any) => srchZone ? item.zone == srchZone : true)
            ?.filter((item: any) => srchZone?.length > 0 ? srchZone.includes(item.zone) : true)
            ?.map((item: any) => {
                const filteredGrouped = item?.groupedByAll?.filter((entry: any) => {
                    const findShipper = dataShipper?.filter((item: any) => srchShipperName.includes(item?.id)).map((item: any) => item.name)
                    // const matchShipper = srchShipperName?.length > 0 ? srchShipperName.includes(entry.group) : true;
                    const matchShipper = srchShipperName?.length > 0 ? findShipper.includes(entry.group) : true;
                    const matchContract = srchContractCode?.length > 0 ? srchContractCode.includes(entry.contract_code) : true;
                    return matchShipper && matchContract;
                });

                return {
                    ...item,
                    groupedByAll: filteredGrouped,
                };
            })
            .filter((item: any) => item.groupedByAll.length > 0);

        if (tab == 0) { // ALL
            // groupedByAll
            const mappedGroupedByAll = result_2?.flatMap((zoneEntry: any) => {
                return zoneEntry.groupedByAll.map((groupedItem: any) => ({
                    ...groupedItem,
                    zoneObj: zoneEntry.zoneObj
                }));
            });

            const filter_gas_day = mappedGroupedByAll?.filter((item: any) => {
                return (
                    (srchStartDate ? localDate == item?.gas_day : true)
                );
            });

            const data_ = moveValueToRoot(filter_gas_day)
            // const filtered_data = data_?.filter((item: any) => !(item?.exchangeMinInven == null && item?.minInvenChange == null)); // https://app.clickup.com/t/86ewd17ry
            // setFilteredDataTable(filtered_data);
            // setData(filtered_data)
            setFilteredDataTable(data_);
            setData(data_) // https://app.clickup.com/t/86ex2a2t3

            setIsLoading(true)

            // DATA CONTRACT CODE
            // Tab All > Filter Contract code ต้องแสดงเฉพาะข้อมูลที่มีตามหน้า UI https://app.clickup.com/t/86etzcgw6
            const contractCodesInTable = new Set(filter_gas_day.map((item: any) => item?.contract_code));
            const filteredContractMaster = dataContractOriginal?.filter((item: any) =>
                contractCodesInTable.has(item?.contract_code)
            );
            setDataContract(filteredContractMaster);
        } else if (tab == 1) { // DAILY
            const mappedGroupedByDaily = result_2.flatMap((zoneEntry: any) => {
                return zoneEntry.groupedByDaily.map((groupedItem: any) => ({
                    ...groupedItem,
                    zoneObj: zoneEntry.zoneObj
                }));
            });

            const filter_gas_day_daily = mappedGroupedByDaily.filter((item: any) => {
                return (
                    (srchStartDate ? localDate == item?.gas_day : true)
                );
            });

            setFilteredDataTable(moveValueToRoot(filter_gas_day_daily));
            setData(moveValueToRoot(filter_gas_day_daily))

            setIsLoading(true)

            // DATA CONTRACT CODE
            // Tab All > Filter Contract code ต้องแสดงเฉพาะข้อมูลที่มีตามหน้า UI https://app.clickup.com/t/86etzcgw6
            const contractCodesInTable = new Set(filter_gas_day_daily?.map((item: any) => item?.contract_code));
            const filteredContractMaster = dataContractOriginal?.filter((item: any) =>
                contractCodesInTable.has(item?.contract_code)
            );
            setDataContract(filteredContractMaster);
            // setDataContractOriginal(filteredContractMaster)
        } else if (tab == 2) { // WEEKLY

            const filtered = res_
                .filter((item: any) => srchZone?.length > 0 ? srchZone.includes(item.zone) : true)
                .map((zoneEntry: any) => {
                    const filteredGrouped = zoneEntry?.groupedByWeekly?.filter((weekly: any) => {
                        const matchShipper = srchShipperName?.length > 0 ? srchShipperName.includes(weekly?.group) : true;
                        const matchContract = srchContractCode?.length > 0 ? srchContractCode.includes(weekly?.contract_code) : true;
                        return matchShipper && matchContract;
                    });

                    if (filteredGrouped?.length > 0) {
                        // No zone match, but children matched: return only those
                        return {
                            ...zoneEntry,
                            groupedByWeekly: filteredGrouped
                        };
                    }

                    // No match at all
                    return null;
                }).filter((zoneEntry: any) => zoneEntry !== null); // กรองค่า null ออก

            setIsLoading(true)

            // DATA CONTRACT CODE
            if (filtered?.length > 0) {
                const resultOption: any = getUniqueContractCodes(filtered, 'weekly');
                const getOption: any = getCommonElements(resultOption, dataContractOriginal)

                setDataContract(getOption);
            } else {
                setDataContract([]);
            }

            setFilteredDataTableWeekly(filtered)
            setDataWeeklyOriginal(filtered)
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 300);

        setCurrentPage(1);
    };

    function getCommonElements(array1: any[], array2: any[]): any[] {
        return (array2 || [])?.filter(item => array1?.includes(item?.contract_code)) || [];
    }

    function getUniqueContractCodes(dataArray: any, mode: 'all' | 'daily' | 'weekly') {
        const uniqueContractCodes = new Set();

        switch (mode) {
            case "all":
                dataArray?.forEach((group: any) => {
                    group?.groupedByAll?.forEach((item: any) => {
                        if (item?.contract_code) {
                            uniqueContractCodes.add(item?.contract_code);
                        }
                    });
                });
                break;
            case "daily":
                dataArray?.forEach((group: any) => {
                    group?.groupedByDaily?.forEach((item: any) => {
                        if (item?.contract_code) {
                            uniqueContractCodes.add(item?.contract_code);
                        }
                    });
                });
                break;
            case "weekly":
                dataArray?.forEach((group: any) => {
                    group?.groupedByWeekly?.forEach((item: any) => {
                        if (item?.contract_code) {
                            uniqueContractCodes.add(item?.contract_code);
                        }
                    });
                });
                break;
        }

        // แปลง Set กลับเป็น Array
        return Array.from(uniqueContractCodes);
    }

    const handleReset = async (tab?: any) => {
        setSrchStartDate(null)
        setSrchShipperName([])
        setSrchZone([])
        setSrchContractCode([])

        // fetchData(tab);
        // handleFieldSearch(tab);
        // setFilteredDataTable([])
        // setFilteredDataTableWeekly([]);
        setKey((prevKey) => prevKey + 1);
    };

    // const handleResetHotfix = async (tab?: any) => {
    //     setSrchShipperName([])
    //     setSrchZone([])
    //     setSrchContractCode([])
    //     fetchData(tab);
    //     setKey((prevKey) => prevKey + 1);
    // };
    const handleResetHotfix = async () => {
        const defaultDate = getDefaultDateByTab(tabIndex);

        setSrchStartDate(defaultDate);
        setSrchShipperName([]);
        setSrchZone([]);
        setSrchContractCode([]);
        setCurrentPage(1);

        // บังคับ DatePicker ให้ render ค่า default ใหม่
        setKey(prev => prev + 1);

        // ส่ง tab และวันที่โดยตรง เพราะ setState ยังไม่อัปเดตทันที
        await fetchData(tabIndex, defaultDate);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        // const dataToFilter = tabIndex === 1 ? dataDailyOriginal : dataTable;

        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        const filtered = dataTable?.filter(
            (item: any) => {
                let min = item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value || 0
                let exchange = item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value || 0
                let total = min + exchange

                return (
                    item?.gas_day?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zoneObj?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberThreeDecimal(item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value)?.toString().toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value)?.toString().toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value)?.toString().toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value)?.toString().toLowerCase().trim().includes(queryLower) ||
                    total?.toString().toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(total)?.toString().toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(total)?.toString().toLowerCase().trim().includes(queryLower)

                )
            }
        );

        setFilteredDataTable(filtered);
    };

    const handleSearchWeekly = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();


        const filtered = dataTableWeeklyOriginal
            .map((zoneEntry: any) => {

                // ใช้ในกรณีที่ record มาไม่ถึง 7 หรือ 14 
                const chunkArray = (arr: any[], size: number) => {
                    const chunks = [];
                    for (let i = 0; i < arr.length; i += size) {
                        chunks.push(arr.slice(i, i + size));
                    }
                    return chunks;
                };

                const weeksRaw = chunkArray(zoneEntry?.groupedByWeekly, 7);

                const weeks = weeksRaw.map(week => {
                    const padded = [...week];
                    while (padded.length < 7) padded.push(null);
                    return padded;
                });

                let totalResult: any = weeks
                    ?.map((weekData: any[], weekIndex: number) => {
                        const totalAllDays = weekData.reduce((sum: number, day: any) => {
                            const min = day?.minInven ?? day?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ?? 0;
                            const exchange = day?.exchangeMinInven ?? day?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value ?? 0;
                            return sum + min + exchange;
                        }, 0);

                        // แปลงเป็น string ที่มีทศนิยม 3 ตำแหน่ง
                        const totalWith3Decimals = totalAllDays.toFixed(3);

                        // ลบคอมม่าออกจาก queryLower เพื่อเปรียบเทียบ
                        const queryLowerWithoutComma = queryLower?.replace(/,/g, '');

                        // ถ้า queryLower มีค่า → เทียบโดยใช้ includes
                        if (queryLowerWithoutComma) {
                            return totalWith3Decimals.includes(queryLowerWithoutComma) ? weeks[weekIndex] : null; //return week ที่มี data ที่ตรงออกมาเป็น week
                        }

                        // ถ้าไม่มี queryLower → คืนค่าปกติแบบมีทศนิยม 3 ตำแหน่ง
                        return totalWith3Decimals;
                    })
                    .filter(result => result !== null); // กรองค่าที่ไม่ตรงออก

                const zoneMatch = zoneEntry.zone?.toLowerCase().includes(queryLower);

                const filteredGrouped = zoneEntry.groupedByWeekly.filter((weekly: any) => {
                    const contractMatch = weekly.contract_code?.toLowerCase().includes(queryLower);
                    const groupMatch = weekly.group?.toLowerCase().includes(queryLower);
                    const dataMatch = weekly.data.some((d: any) =>
                        formatNumberThreeDecimal(d?.value)?.toString()?.toLowerCase().includes(queryLower)
                    );
                    const dataMatch2 = weekly.data.some((d: any) =>
                        d?.value?.toString()?.toLowerCase().includes(queryLower)
                    );
                    return contractMatch || groupMatch || dataMatch || dataMatch2;
                });

                if (zoneMatch) {
                    // Match on zone: return all groupedByWeekly untouched
                    return {
                        ...zoneEntry,
                        groupedByWeekly: zoneEntry.groupedByWeekly
                    };
                } else if (filteredGrouped?.length > 0 || totalResult?.length > 0) {
                    // No zone match, but children matched: return only those
                    return {
                        ...zoneEntry,
                        groupedByWeekly: filteredGrouped?.length > 0 ? filteredGrouped : totalResult?.length > 0 ? totalResult.flat() : []
                    };
                }

                // No match at all
                return null;
            })
            .filter(Boolean);

        setFilteredDataTableWeekly(filtered);
    };

    // ############### DATA TABLE ###############

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataTable, setData] = useState<any>([]);
    const [dataTableWeeklyOriginal, setDataWeeklyOriginal] = useState<any>([]);
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);

    const fetchData = async (
        tab: number = tabIndex,
        dateValue: any = srchStartDate
    ) => {
        try {
            setIsLoading(false);

            const res_shipper_name = await getService(
                `/master/account-manage/group-master?user_type=3`
            );

            setDataShipper(res_shipper_name);

            const selectedDate = dateValue ?? getDefaultDateByTab(tab);

            const todayJS =
                tab === 2
                    ? dayjs(getSundayOfWeek(selectedDate)).format("YYYY-MM-DD")
                    : dayjs(selectedDate)
                        .tz("Asia/Bangkok")
                        .format("YYYY-MM-DD");

            const contractData = await getContractCode();

            const res_ = await getService(
                `/master/minimum-inventory-summary?gas_day=${todayJS}`
            );


            // let todayJS: any

            // if (tab == 0) {
            //     todayJS = dayjs().add(1, 'day').format("YYYY-MM-DD")
            // } else if(tab == 1){
            //     todayJS = filter_gas_day ? dayjs(filter_gas_day, "YYYY-MM-DD").format("YYYY-MM-DD") : dayjs().add(1, 'day').format("YYYY-MM-DD")
            // }else if (tab == 2) {
            //     // todayJS = filter_gas_day ? dayjs(filter_gas_day, "YYYY-MM-DD").format("YYYY-MM-DD") : dayjs(getSundayOfWeek(new Date())).format("YYYY-MM-DD")
            //     todayJS = filter_gas_day ? dayjs(filter_gas_day, "YYYY-MM-DD").format("YYYY-MM-DD") : (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0).format("YYYY-MM-DD"))
            // } else {
            //     todayJS = (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0).format("YYYY-MM-DD"))
            // }

            if(filter_gas_day){
                setSrchStartDate(dayjs(filter_gas_day, "YYYY-MM-DD").format("YYYY-MM-DD"))
            }

            // const contractData = await getContractCode();
            // const res_ = await getService(`/master/minimum-inventory-summary?gas_day=${todayJS}`);

            // groupedByAll
            const mappedGroupedByAll = res_?.flatMap((zoneEntry: any) => {
                return zoneEntry.groupedByAll.map((groupedItem: any) => ({
                    ...groupedItem,
                    zoneObj: zoneEntry.zoneObj
                }));
            });

            setData(mappedGroupedByAll);
            setFilteredDataTable(mappedGroupedByAll);

            setFilteredDataTableWeekly(res_)
            setDataWeeklyOriginal(res_)

            setTimeout(() => {
                setIsLoading(true);
            }, 300);


            // ข้างล่างนี่ทำ contract code filter option
            if (tab == 0 || tab == undefined) {
                if (mappedGroupedByAll?.length > 0) {
                    const resultOption: any = getUniqueContractCodes(res_, 'all');
                    const getOption: any = getCommonElements(resultOption, contractData)
                    setDataContract(getOption);
                } else {
                    setDataContract([]);
                }
            } else if (tab == 1) {
                if (mappedGroupedByAll?.length > 0) {
                    const resultOption: any = getUniqueContractCodes(res_, 'daily');
                    const getOption: any = getCommonElements(resultOption, contractData)
                    setDataContract(getOption);
                } else {
                    setDataContract([]);
                }
            } else if (tab == 2) {
                if (mappedGroupedByAll?.length > 0) {
                    const resultOption: any = getUniqueContractCodes(res_, 'weekly');
                    const getOption: any = getCommonElements(resultOption, contractData)
                    setDataContract(getOption);
                } else {
                    setDataContract([]);
                }
            }

            if (mappedGroupedByAll?.length > 0) {
                const resultOption: any = getUniqueContractCodes(res_, 'all');
                const getOption: any = getCommonElements(resultOption, contractData)
                setDataContract(getOption);
            } else {
                setDataContract([]);
            }

            settk(!tk);

            // DATA ZONE แบบไม่ซ้ำ
            const zone_de_dup = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneMasterZ(zone_de_dup);


        } catch (err) {
            // setError(err.message);
            setData([]);
            setFilteredDataTable([]);
        } finally {
            // setLoading(false);
        }
    };

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
    const [paginatedDataTabWeekly, setPaginatedDataTabWeekly] = useState<any[]>([]);
    const [dataForSorting, setDataForSorting] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        // switch (tabIndex) {
        //     case 2:
        //         // setPaginatedData(filteredDataTableWeekly.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        //         setPaginatedData(dataTableWeekly?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        //         break;

        //     default:
        //         setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        //         break;
        // }

        if (tabIndex !== 2) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))

            const flattened = filteredDataTable?.map((item: any) => ({
                ...item,
                min_inventory_change_value: item?.minInven ?? item?.data?.find((d: any) => d.type === "Min_Inventory_Change")?.value ?? null,
                exchange_min_inventory: item?.exchangeMinInven ?? item?.data?.find((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))?.value ?? null
            }));

            const updated_total_rows = flattened?.map((obj: any) => ({
                ...obj,
                total_row: (obj.min_inventory_change_value || 0) + (obj.exchange_min_inventory || 0),
            }));
            setDataForSorting(updated_total_rows)
        }

    }, [filteredDataTable, filteredDataTableWeekly, currentPage, itemsPerPage])

    useEffect(() => {
        if (tabIndex == 2) {
            // setPaginatedData(dataTableWeekly?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedDataTabWeekly(dataTableWeekly?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setDataForSorting(dataTableWeekly)
        }
    }, [dataTableWeekly, currentPage, itemsPerPage])


    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'change_min_inventory', label: 'Change Min Inventory (MMBTU/D)', visible: true },
        { key: 'exchange_min_invent', label: 'Exchange Min Inventory (MMBTU)', visible: true }, // Tab All > Column Exchange Min Invent (MMBTU) ปรับเป็น Exchange Min Inventory (MMBTU) https://app.clickup.com/t/86etzcgtg
        { key: 'total', label: 'Total', visible: true },
    ];

    const initialColumnsWeekly: any = [
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'mmbtud', label: 'Minimum Inventory Summary (MMBTU)', visible: true },

        { key: 'sunday', label: 'Sunday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_sunday', label: 'Change Min Inventory ', visible: true, parent_id: 'sunday' },
        { key: 'exchange_min_invent_sunday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'sunday' },
        { key: 'total_sunday', label: 'Total', visible: true, parent_id: 'sunday' },

        { key: 'monday', label: 'Monday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_monday', label: 'Change Min Inventory ', visible: true, parent_id: 'monday' },
        { key: 'exchange_min_invent_monday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'monday' },
        { key: 'total_monday', label: 'Total', visible: true, parent_id: 'monday' },

        { key: 'tuesday', label: 'Tuesday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_tuesday', label: 'Change Min Inventory ', visible: true, parent_id: 'tuesday' },
        { key: 'exchange_min_invent_tuesday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'tuesday' },
        { key: 'total_tuesday', label: 'Total', visible: true, parent_id: 'tuesday' },

        { key: 'wednesday', label: 'Wednesday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_wednesday', label: 'Change Min Inventory ', visible: true, parent_id: 'wednesday' },
        { key: 'exchange_min_invent_wednesday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'wednesday' },
        { key: 'total_wednesday', label: 'Total', visible: true, parent_id: 'wednesday' },

        { key: 'thursday', label: 'Thursday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_thursday', label: 'Change Min Inventory ', visible: true, parent_id: 'thursday' },
        { key: 'exchange_min_invent_thursday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'thursday' },
        { key: 'total_thursday', label: 'Total', visible: true, parent_id: 'thursday' },

        { key: 'friday', label: 'Friday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_friday', label: 'Change Min Inventory ', visible: true, parent_id: 'friday' },
        { key: 'exchange_min_invent_friday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'friday' },
        { key: 'total_friday', label: 'Total', visible: true, parent_id: 'friday' },

        { key: 'saturday', label: 'Saturday', visible: true, parent_id: 'mmbtud' },
        { key: 'change_min_inventory_saturday', label: 'Change Min Inventory ', visible: true, parent_id: 'saturday' },
        { key: 'exchange_min_invent_saturday', label: 'Exchange Min Inventory ', visible: true, parent_id: 'saturday' },
        { key: 'total_saturday', label: 'Total', visible: true, parent_id: 'saturday' },

        { key: 'total', label: 'Total', visible: true, parent_id: 'mmbtud' },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibilityNew, setColumnVisibilityNew] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const filteredColumns = (tabIndex === 0 || tabIndex === 1) ? initialColumns : initialColumnsWeekly;

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible])))

        setColumnVisibilityNew(Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible])))
    }, [tabIndex])

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    // ############### TAB ###############
    // const handleChange = (event: any, newValue: any) => {
    //     // setIsLoading(false);
    //     setTabIndex(newValue);
    //     handleReset(newValue);
    // };
  
    const handleChange = async (_event: any, newValue: number) => {
        const newDefaultDate = getDefaultDateByTab(newValue);

        setTabIndex(newValue);
        setSrchStartDate(newDefaultDate);
        setSrchShipperName([]);
        setSrchZone([]);
        setSrchContractCode([]);
        setCurrentPage(1);
        setKey(prev => prev + 1);

        await handleFieldSearch(newValue, newDefaultDate);
    };

    const handleColumnToggleNew = (columnKey: string) => {
        const dataFilter = tabIndex === 0 || tabIndex === 1 ? initialColumns : initialColumnsWeekly;

        // สร้าง Map สำหรับ lookup parent/child
        const childMap = dataFilter.reduce((acc: any, col: any) => {
            if (col.parent_id) {
                if (!acc[col.parent_id]) acc[col.parent_id] = [];
                acc[col.parent_id].push(col.key);
            }
            return acc;
        }, {});

        const toggleWithChildren = (key: string, visible: boolean, visibilityState: any): void => {
            visibilityState[key] = visible;
            const children = childMap[key] || [];
            children.forEach((childKey: any) => toggleWithChildren(childKey, visible, visibilityState));
        };

        setColumnVisibilityNew((prev: any) => {
            const newVisibility = { ...prev };
            const isCurrentlyVisible = !!prev[columnKey];
            const newVisibleState = !isCurrentlyVisible;

            // ปรับ root และลูกทั้งหมด
            toggleWithChildren(columnKey, newVisibleState, newVisibility);

            // ถ้า column นี้มี parent — ต้องเช็คสถานะพี่น้อง
            const currentColumn = dataFilter.find((col: any) => col.key === columnKey);
            if (currentColumn?.parent_id) {
                const siblings = dataFilter.filter((col: any) => col.parent_id === currentColumn.parent_id);
                const anySiblingVisible = siblings.some((col: any) => newVisibility[col.key]);
                // อัปเดต parent ถ้าทุก sibling ปิด
                if (!anySiblingVisible) {
                    newVisibility[currentColumn.parent_id] = false;
                } else {
                    newVisibility[currentColumn.parent_id] = true;
                }
            }

            return newVisibility;
        });

        settk((prev: any) => !prev);
    };

    // useEffect(() => {
    //     filter_tab ? fetchData(Number(filter_tab)) : fetchData();
    // }, []);

    useEffect(() => {
        fetchData(filter_tab ? Number(filter_tab) : 0);
    }, []);

    useEffect(() => {
        getPermission();
    }, [])

    // useEffect(() => {
    //     handleFieldSearch(tabIndex);
    // }, [tabIndex])


    // ย้ายมาจาก tableTabWeekly เพื่อทำ pagination
    const [columnHeadDate, setColumnHeadDate] = useState<any>([]);
    const getWeeklyTotalsByType = (group_weekly: any[]) => {
        const result: any = {};

        group_weekly?.forEach(weekGroup => {
            weekGroup?.groupedByWeekly?.forEach((dayEntry: any) => {
                dayEntry?.data?.forEach((item: any) => {
                    const day = item.nomType;
                    const type = item.type;

                    if (!result[day]) {
                        result[day] = {};
                    }

                    if (!result[day][type]) {
                        result[day][type] = 0;
                    }

                    result[day][type] += item.value;
                });
            });
        });
        console.log('group_weekly : ', group_weekly);
        const groupedByWeekly = group_weekly[0]?.groupedByWeekly || [];
        const output = groupedByWeekly.slice(0, 7).map((entry: any, index: any) => ({
            day: dayNames[index],
            gas_day: entry.gas_day,
        }));
        console.log('output : ', output);
        setColumnHeadDate(output)

        return result
    };

    // ย้ายมาจาก tableTabWeekly เพื่อทำ pagination
    useEffect(() => {

        if (tabIndex == 2) {
            const output_data = splitByGroupCopyCat(filteredDataTableWeekly);
            getWeeklyTotalsByType(output_data);

            let newTableData: any = [];
            const chunkArray = (arr: any[], size: number) => {
                const chunks = [];
                for (let i = 0; i < arr?.length; i += size) {
                    chunks.push(arr.slice(i, i + size));
                }
                return chunks;
            };

            // filteredDataTableWeekly?.length > 0 && filteredDataTableWeekly?.map((item: any) => {
            //     const weeksRaw = chunkArray(item?.groupedByWeekly, 7);
            //     const checkAllValuesEqual = (arr: any, obj?: any) => {
            //         if (arr?.length === 0) return null;

            //         const firstValue = arr[0]?.[obj];
            //         // เช็คว่าแต่ละค่าทั้งหมดใน array เท่ากับ firstValue หรือไม่
            //         return arr.every((value: any) => value?.[obj] === firstValue) ? firstValue : null;
            //     };
                
            //     console.log('weeksRaw : ', weeksRaw);
            //     weeksRaw?.map((week: any) => {
            //         let contract: any = checkAllValuesEqual(week, 'contract_code') ?? checkAllValuesEqual(week, 'reserve_balancing_gas_contract');
            //         let group: any = checkAllValuesEqual(week, 'group');
            //         console.log('week : ', week);
            //         console.log('contract : ', contract);
            //         const dataAsObject = week?.reduce((acc: any, item: any, index: number) => {
            //             const dayName = dayNames[index];

            //             const dataArray = item?.data || [];

            //             // หา object ที่ type ตรงตามต้องการ
            //             const minItem = dataArray.find(
            //                 (d: any) => d?.type === "Min_Inventory_Change"
            //             );
            //             const exchangeItem = dataArray.find(
            //                 (d: any) => (d?.type === "Exchange_Mininventory" || d?.type === "Exchange_Min_Inventory")
            //             );

            //             // ดึง value ถ้ามี ไม่มีก็ให้ null
            //             const min_val = minItem?.value ?? null;
            //             const exchange_val = exchangeItem?.value ?? null;

            //             // ถ้ามีค่าใดค่าหนึ่งไม่เป็น null → คำนวณ total
            //             const total =
            //                 min_val !== null || exchange_val !== null
            //                     ? (min_val ?? 0) + (exchange_val ?? 0)
            //                     : null;

            //             acc[dayName] = {
            //                 ...item,
            //                 min_val,
            //                 exchange_val,
            //                 total,
            //             };

            //             return acc;
            //         }, {});

            //         function calculateWeeklyTotals(dataByDay: Record<string, any>) {
            //             let sumMin = 0;
            //             let sumExchange = 0;

            //             Object.values(dataByDay).forEach((dayData: any) => {
            //                 if (typeof dayData?.min_val === 'number') {
            //                     sumMin += dayData.min_val;
            //                 }

            //                 if (typeof dayData?.exchange_val === 'number') {
            //                     sumExchange += dayData.exchange_val;
            //                 }
            //             });

            //             const total = sumMin + sumExchange;

            //             return total || null;
            //         }

            //         const weeklyTotals = calculateWeeklyTotals(dataAsObject);

            //         return (
            //             newTableData.push({
            //                 zone: item?.zone,
            //                 zoneObj: item?.zoneObj,
            //                 ...dataAsObject,
            //                 data: dataAsObject, // data จริง
            //                 week: week, // ใช้แค่ทำหัว columns
            //                 contract_code: contract,
            //                 group: group,
            //                 totalWeek: weeklyTotals || null
            //             })
            //         )
            //     })
            // })
            filteredDataTableWeekly?.forEach((item: any) => {
                const rawData = Array.isArray(item?.groupedByWeekly)
                    ? item.groupedByWeekly
                    : [];

                /**
                 * แยกข้อมูลตาม:
                 * 1. สัปดาห์ gas_day_main
                 * 2. Contract
                 * 3. Group
                 */
                const groupedRows = rawData.reduce(
                    (acc: Record<string, any>, current: any) => {
                        const weekKey = current?.gas_day_main ?? 'NO_WEEK';

                        const contract =
                            current?.contract_code ??
                            current?.reserve_balancing_gas_contract ??
                            null;

                        const group = current?.group ?? null;

                        const rowKey = [
                            weekKey,
                            contract ?? 'NO_CONTRACT',
                            group ?? 'NO_GROUP',
                        ].join('__');

                        if (!acc[rowKey]) {
                            acc[rowKey] = {
                                weekKey,
                                contract_code: contract,
                                group,
                                items: [],
                            };
                        }

                        acc[rowKey].items.push(current);

                        return acc;
                    },
                    {}
                );

                Object.values(groupedRows).forEach((rowGroup: any) => {
                    const dataAsObject: Record<string, any> = {};

                    // กำหนดทุกวันไว้ก่อน
                    dayNames.forEach((dayName: string) => {
                        dataAsObject[dayName] = null;
                    });

                    rowGroup.items.forEach((dayItem: any) => {
                        /**
                         * gas_day เป็น DD/MM/YYYY
                         * สร้าง Date แบบไม่ให้ browser parse ผิด
                         */
                        const [day, month, year] = String(
                            dayItem?.gas_day ?? ''
                        )
                            .split('/')
                            .map(Number);

                        if (!day || !month || !year) return;

                        const date = new Date(year, month - 1, day);

                        // 0 = Sunday, 1 = Monday, ... 6 = Saturday
                        const dayIndex = date.getDay();
                        const dayName = dayNames[dayIndex];

                        if (!dayName) return;

                        const dataArray = Array.isArray(dayItem?.data)
                            ? dayItem.data
                            : [];

                        const minItem = dataArray.find(
                            (dataItem: any) =>
                                dataItem?.type === 'Min_Inventory_Change'
                        );

                        const exchangeItem = dataArray.find(
                            (dataItem: any) =>
                                dataItem?.type === 'Exchange_Mininventory' ||
                                dataItem?.type === 'Exchange_Min_Inventory'
                        );

                        /**
                         * รองรับทั้ง number และ string เช่น "100.25"
                         */
                        const parseValue = (value: any): number | null => {
                            if (
                                value === null ||
                                value === undefined ||
                                value === ''
                            ) {
                                return null;
                            }

                            const parsed = Number(
                                String(value).replaceAll(',', '')
                            );

                            return Number.isFinite(parsed) ? parsed : null;
                        };

                        const min_val = parseValue(minItem?.value);
                        const exchange_val = parseValue(exchangeItem?.value);

                        const total =
                            min_val !== null || exchange_val !== null
                                ? (min_val ?? 0) + (exchange_val ?? 0)
                                : null;

                        dataAsObject[dayName] = {
                            ...dayItem,
                            min_val,
                            exchange_val,
                            total,
                        };
                    });

                    let weeklyTotals: number | null = null;

                    Object.values(dataAsObject).forEach((dayData: any) => {
                        if (!dayData) return;

                        if (typeof dayData?.min_val === 'number') {
                            weeklyTotals =
                                (weeklyTotals ?? 0) + dayData.min_val;
                        }

                        if (typeof dayData?.exchange_val === 'number') {
                            weeklyTotals =
                                (weeklyTotals ?? 0) + dayData.exchange_val;
                        }
                    });

                    /**
                     * ทำ week 7 ตำแหน่งให้ตรง Sunday-Saturday
                     */
                    const separatedWeek = dayNames.map(
                        (dayName: string) => dataAsObject[dayName]
                    );

                    newTableData.push({
                        zone: item?.zone,
                        zoneObj: item?.zoneObj,

                        ...dataAsObject,

                        data: dataAsObject,
                        week: separatedWeek,

                        gas_day_main: rowGroup.weekKey,
                        contract_code: rowGroup.contract_code,
                        group: rowGroup.group,

                        totalWeek: weeklyTotals,
                    });
                });
            });
            console.log('filteredDataTableWeekly : ', filteredDataTableWeekly);
            console.log('newTableData : ', newTableData);
            // เอา newTableData ส่งเข้าไปที่ TableWeekly
            setDataTableWeekly(newTableData)
        }

    }, [filteredDataTableWeekly])


    // dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0)
    useEffect(() => {
        console.log('paginatedDataTabWeekly : ', paginatedDataTabWeekly);
      
    }, [paginatedDataTabWeekly])
    
    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    {
                        tabIndex == 0 || tabIndex == 1 ?
                            // <DatePickaSearch
                            //     key={"start" + key}
                            //     label={"Gas Day"}
                            //     placeHolder={"Select Gas Day"}
                            //     isDefaultTomorrow={true}
                            //     allowClear
                            //     defaultValue={srchStartDate}
                            //     onChange={(e: any) => setSrchStartDate(e ? e : null)}
                            // />
                            <DatePickaSearch
                                key={`start-${key}-${tabIndex}`}
                                label="Gas Day"
                                placeHolder="Select Gas Day"
                                allowClear
                                defaultValue={srchStartDate}
                                onChange={(e: any) => setSrchStartDate(e ?? null)}
                            />
                            :
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Week"}
                                placeHolder={"Select Gas Week"}
                                isGasWeek={true}
                                modeSearch={'sunday'}
                                allowClear
                                defaultValue={srchStartDate}
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                            />
                    }

                    <InputSearch
                        id="searchShipperName"
                        label="Shipper Name"
                        // type="select"
                        // value={srchShipperName}
                        type="select-multi-checkbox"
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id] : srchShipperName}
                        placeholder="Select Shipper Name"
                        onChange={(e) => setSrchShipperName(e?.target?.value)}
                        options={dataShipper
                            ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                value: item.id,
                                // value: item.name,
                                label: item.name,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // options={dataContract?.filter((item: any) => srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.name) : true)?.map((item: any) => ({
                        options={dataContract?.filter((item: any) => srchShipperName?.length > 0 ? srchShipperName.includes(item?.group_id) : true)?.map((item: any) => ({
                            value: item?.contract_code,
                            label: item?.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchZone}
                        onChange={(e) => setSrchZone(e.target.value)}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <BtnSearch handleFieldSearch={() => handleFieldSearch(tabIndex)} />
                    {/* <BtnReset handleReset={handleReset} /> */}
                    <BtnReset handleReset={handleResetHotfix} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BtnGeneral */}
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
                    ["All", "Daily", "Weekly"]?.map((label, index) => (
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
                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-4">
                        {/* <div onClick={tabIndex === 0 ? handleTogglePopoverIntraday : tabIndex === 1 ? handleTogglePopover : handleTogglePopoverWeekly}> */}
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={tabIndex == 2 ? handleSearchWeekly : handleSearch} />
                        {
                            tabIndex !== 2 ? // all, daily
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    disable={filteredDataTable.length == 0 ? true : false}
                                    generalFunc={() => {
                                        exportToExcel(filteredDataTable, 'minimum-tab-all-daily', columnVisibility)
                                    }}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                                :
                                <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    disable={!(filteredDataTableWeekly?.some((dataTable: any) => (dataTable?.groupedByWeekly || []).length > 0) || false)}
                                    generalFunc={() => {
                                        exportMinInventoryWeekly(filteredDataTableWeekly, 'Minimum_Inventory_Summary.xlsx');
                                    }}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                        }

                    </div>
                </div>
                {
                    tabIndex == 0 || tabIndex == 1 ? (<> {/* TAB DETAIL */}
                        <TableAll
                            tableData={paginatedData}
                            isLoading={isLoading}
                            columnVisibility={columnVisibilityNew}
                            userPermission={userPermission}
                            dataForSorting={dataForSorting}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                        />
                    </>
                    ) : tabIndex == 2 && (
                        <>
                            <TableWeekly
                                // tableData={paginatedData}
                                tableData={paginatedDataTabWeekly}
                                dataForSorting={dataForSorting}
                                columnHeadDate={columnHeadDate}
                                isLoading={isLoading}
                                columnVisibility={columnVisibilityNew}
                                userPermission={userPermission}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                            />
                        </>
                    )
                }

            </div>

            <PaginationComponent
                // totalItems={tabIndex == 0 || tabIndex == 1 ? filteredDataTable?.length : filteredDataTableWeekly?.length}
                totalItems={tabIndex == 0 || tabIndex == 1 ? filteredDataTable?.length : dataTableWeekly?.length}
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
                initialColumns={(tabIndex == 0 || tabIndex == 1) ? initialColumns : initialColumnsWeekly}
            />
        </div>
    );
};

export default ClientPage;