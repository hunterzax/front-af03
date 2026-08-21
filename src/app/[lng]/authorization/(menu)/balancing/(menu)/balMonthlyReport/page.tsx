"use client";

import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { Tune } from "@mui/icons-material"
import { getService } from "@/utils/postService";
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
import BtnExport from "@/components/other/btnExport";
import { findRoleConfigByMenuName, formatDate, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatTime, generateUserPermission, sleep, toDayjs } from "@/utils/generalFormatter";
import PaginationComponent from "@/components/other/globalPagination";
import NodataTable from "@/components/other/nodataTable";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import { useFetchMasters } from "@/hook/fetchMaster";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import dayjs from 'dayjs';
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import TableReportExpanded from "./form/tableReport_Expanded";


interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const userDT: any = getUserValue();
    const [tk, settk] = useState<boolean>(true);

    // ############### Check Authen ###############
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
            //     const permission = findRoleConfigByMenuName('Monthly Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Monthly Report', userDT)
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


    //ใช้สำหรับแปลง data เข้า tableExpanded อันใหม่
    const transformDataExpanded = (data: any[]) => {
        let map: Record<string, any> = {};

        try {
            const isAllNull = (obj: any) => {
                if (!obj) return true;
                return Object.values(obj).every(
                    (v) => v === null || v === undefined
                );
            };

            data.forEach((item) => {
                const day = item.gas_day;

                if (!map[day]) {
                    map[day] = {
                        day,
                        value: [],
                        sum: {},
                    };
                }

                item?.data?.shipperData?.forEach((shipperData: any) => {
                    const currentData = shipperData.shipperAccumulated ?? shipperData.shipperSummary ?? {};

                    // 🔥 filter null object
                    if (isAllNull(currentData)) return;

                    map[day].value.push({
                        key: shipperData.shipperName ?? shipperData.shipper,
                        data: currentData,
                    });
                });

                map[day].sum = item?.data?.accumulated ?? item?.data?.summary ?? {};

                map[day].value.sort((a: any, b: any) => {
                    return a.key.localeCompare(b.key);
                });
            });
        } catch (error) {
            map = {};
        }

        return Object.values(map);
    };

    // ############### REDUX DATA ###############
    const { areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
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

    // ############### FIELD SEARCH ###############
    const [key, setKey] = useState(0);
    const [isFilter, setIsFilter] = useState<any>(false);
    // const [srchGasDay, setSrchGasDay] = useState<any>(null);
    // const [srchGasDayTabDownlaod, setSrchGasDayTabDownlaod] = useState<any>(null);
    const [srchGasDay, setSrchGasDay] = useState<any>(dayjs().toISOString());
    const [srchGasDayTabDownlaod, setSrchGasDayTabDownlaod] = useState<any>(dayjs());
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState('');
    const [dataContractFiltered, setDataContractFiltered] = useState<any[]>([])
    const [srchVersion, setSrchVersion] = useState('');
    const [urlForApprove, setUrlForApprove] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [disableApprove, setDisableApprove] = useState(true);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filteredDataTableExpanded, setFilteredDataTableExpanded] = useState<any>([]);
    const [dataSummary, setDataSummary] = useState<any>({});

    const handleFieldSearch = async (day: any) => {
        setIsLoading(false)
        setIsFilter(true)

        // TABLE REPORT
        // if (srchGasDay !== null && tabIndex == 0) {
        if (tabIndex == 0) {

            // const month = srchGasDay ? String(srchGasDay.getMonth() + 1).padStart(2, '0') : dayjs().format("MM");
            // const year = srchGasDay ? String(srchGasDay.getFullYear()) : dayjs().format("YYYY");
            const month = day ? String(dayjs(day).month() + 1).padStart(2, '0') : srchGasDay ? String(dayjs(srchGasDay).month() + 1).padStart(2, '0') : dayjs().format("MM");
            const year = day ? String(dayjs(day).year()) : srchGasDay ? String(dayjs(srchGasDay).year()) : dayjs().format("YYYY");
            setMonth(month)
            setYear(year)

            let new_url = `/master/balancing/balancing-monthly-report?skip=0&limit=100` // skip, limit fix ของ eviden
            let new_url_approve = `/master/balancing/balancing-monthly-report-approved?skip=0&limit=100`
            if (srchShipperName?.length > 1) {
                new_url += `&shipperIdList=${srchShipperName?.join(',')}`
                new_url_approve += `&shipperIdList=${srchShipperName?.join(',')}`

                // ถ้าไม่เลือก shipper ห้ามส่ง contract
                if (srchContractCode) {
                    new_url += `&contractCode=${srchContractCode}`
                    new_url_approve += `&contractCode=${srchContractCode}`
                }
            }
            else if (srchShipperName?.length === 1) {
                new_url += `&shipperId=${srchShipperName?.[0]}`
                new_url_approve += `&shipperId=${srchShipperName?.[0]}`

                // ถ้าไม่เลือก shipper ห้ามส่ง contract
                if (srchContractCode) {
                    new_url += `&contractCode=${srchContractCode}`
                    new_url_approve += `&contractCode=${srchContractCode}`
                }
            }
            new_url += `&month=${month}`
            new_url += `&year=${year}`
            new_url_approve += `&month=${month}`
            new_url_approve += `&year=${year}`
            setUrlForApprove(new_url_approve)

            const res_new_data = await getService(new_url.replace('#', 'HashNumberSign'));
            

            // เวอร์ชั่น expanded
            setDataExpanded(transformDataExpanded(res_new_data?.gasDayShipperData ?? []));
            setFilteredDataTableExpanded(transformDataExpanded(res_new_data?.gasDayShipperData ?? []));

            if (res_new_data?.setDataUse?.length > 0) {

                // ถ้า res_new_data.typeReport == "Summary" แสดงว่าไม่ได้กรอง shipper มา
                // ให้หา res_new_data.setDataUse.key ที่เท่ากับ res_new_data.typeReport แล้วเอาไปแสดงผล
                if (srchShipperName?.length !== 1 && srchContractCode == '') { // ไม่ได้เสิช shipper กับ contract
                    let filter_summary: any = res_new_data?.setDataUse?.filter((item: any) => item.keys == "Summary")

                    // หา sum เพื่อเอาไปแสดงผล total
                    // "gas_day": "sum" คือแถบเขียว
                    let find_data_sum = filter_summary?.[0]?.value?.find((item: any) => item.gas_day == 'sum')
                    setDataSummary(find_data_sum)

                    // กันแตก
                    if (!Array.isArray(filter_summary)) filter_summary = [];
                    if (!filter_summary[0]) filter_summary[0] = { value: [] };

                    // ลบ sum ออกจาก filter_summary
                    filter_summary[0].value = filter_summary?.[0]?.value?.filter((row: any) => row.gas_day !== 'sum');

                    // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                    const flatData = filter_summary?.[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                    setData(flatData)
                    setFilteredDataTable(flatData);

                } else {

                    let type_report = res_new_data.typeReport;
                    let filter_shipper_or_contract: any = res_new_data?.setDataUse?.filter((item: any) => item.keys == type_report);

                    // หา sum เพื่อเอาไปแสดงผล total
                    let find_data_sum = filter_shipper_or_contract?.[0]?.value?.find((item: any) => item.gas_day == 'sum');
                    setDataSummary(find_data_sum);

                    // ลบ sum ออกจาก filter_shipper_or_contract
                    if (filter_shipper_or_contract?.length > 0) {
                        filter_shipper_or_contract[0].value = filter_shipper_or_contract?.[0]?.value?.filter((row: any) => row.gas_day !== 'sum');

                        // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                        const flatData = filter_shipper_or_contract?.[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                        setData(flatData);
                        setFilteredDataTable(flatData);
                    } else {
                        setData([]);
                        setFilteredDataTable([]);
                    }

                }

                // Active เมื่อ filter Gas Month และ Shipper Name 
                // if (srchGasDay == null || srchShipperName == '' || res_new_data?.setDataUse?.length <= 0) {
                // if (srchShipperName == '' || res_new_data?.setDataUse?.length <= 0) {
                // console.log('srchShipperName : ', srchShipperName);
                // console.log('srchShipperName.length : ', srchShipperName.length);
                if (srchShipperName.length !== 1 || res_new_data?.setDataUse?.length <= 0) {
                    setDisableApprove(true)
                } else {
                    setDisableApprove(false)
                }

            } else {
                setData([]);
                setFilteredDataTable([]);

                setDataSummary({})
                if (srchShipperName.length !== 1) {
                    setDisableApprove(true)
                } else {
                    setDisableApprove(false)
                }
            }

            setIsFilter(true)
        } else { // table download
            const localDate = srchGasDayTabDownlaod ? toDayjs(srchGasDayTabDownlaod).format("MMMM YYYY") : toDayjs().format("MMMM YYYY");

            const result_2 = dataTabDownloadOriginal.filter((item: any) => {
                if (srchShipperName?.length === dataShipper?.length || srchShipperName?.length === 0) {
                    return (
                        (srchGasDayTabDownlaod ? localDate == item?.monthText : true) &&
                        (srchContractCode ? srchContractCode == item?.contractCode : true)
                    );
                } else {
                    const shipperName = item?.contractCode ? item?.group?.id_name : (dataShipper?.find((f: any) => f?.id_name === JSON.parse(item?.jsonData)?.typeReport)?.id_name || '')
                    const fShipper = srchShipperName?.find((f: any) => f === shipperName)
                    return (
                        (srchGasDayTabDownlaod ? localDate == item?.monthText : true) &&
                        (srchContractCode ? srchContractCode == item?.contractCode : true) &&
                        !!fShipper
                    );
                }
            });

            setDataTabDownload(result_2)
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    const handleReset = (tabIndexParam?: any) => {
        setIsLoading(false);

        setIsFilter(false)
        // setSrchGasDay(null);
        // setSrchGasDayTabDownlaod(null);
        setSrchContractCode('')
        setSrchShipperName([])
        setSrchVersion('')
        setUrlForApprove('')
        setDisableApprove(true)
        setSrchGasDay(dayjs())

        // setFilteredDataTable([]);
        // setFilteredDataTableExpanded([]);

        // เดิมโรงงาน
        // if (tabIndex == 1) {
        //     const localDate = toDayjs().format("MMMM");
        //     const fitered_current_month = dataTabDownloadOriginal.filter((item: any) => {
        //         return (
        //             (localDate ? localDate == item?.monthText : true)
        //         );
        //     });
        //     setDataTabDownload(fitered_current_month)
        // }

        // if (tabIndexParam == 1 || tabIndex == 1) {
        if (tabIndexParam == 1) {
            // const localDate = srchGasDayTabDownlaod ? toDayjs(srchGasDayTabDownlaod).format("MMMM YYYY") : toDayjs().format("MMMM YYYY");
            // const fitered_current_month = dataTabDownloadOriginal.filter((item: any) => {
            //     return (
            //         (srchGasDayTabDownlaod ? localDate == item?.monthText : true)
            //     );
            // });
            // setDataTabDownload(fitered_current_month)
            setDataTabDownload(dataTabDownloadOriginal)
            setTimeout(() => {
                setIsLoading(true);
            }, 500);

        } else {
            fetchDataTabChange()
        }
        setKey((prevKey) => prevKey + 1);
    };

    const fetchShipperAndContract = async () => {
      const defaultMonth = dayjs().startOf('month')
      const gasDay = tabIndex == 0 ? srchGasDay : srchGasDayTabDownlaod
      const month = gasDay ? dayjs(gasDay).startOf('day') : defaultMonth
      let apiUrl = `/master/daily-adjustment/shipper-data?month=${month.isValid() ? month.format('YYYY-MM-DD') : defaultMonth.format('YYYY-MM-DD')}`
      const res_: any = await getService(apiUrl)
  
      if (res_ && Array.isArray(res_)) {
        setDataShipper(res_)
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
          const uniqueContract = res_.filter((f: any) => f?.id === userDT?.account_manage?.[0]?.group?.id)?.flatMap((fm: any) => fm?.contract_code)
          setDataContract(uniqueContract)
        } else {
          const uniqueContract = res_.flatMap((fm: any) => fm?.contract_code)
          setDataContract(uniqueContract)
        }
      }
    }

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query?.replace(/\s+/g, '')?.toLowerCase().trim();

        // table report
        if (tabIndex == 0) {
            if (!queryLower) {
                setFilteredDataTable(dataTable);
                setFilteredDataTableExpanded(dataTableExpanded);
                return;
            }

            const searchData = (data: any[], query: string) => {
                const queryLower = query.toLowerCase().trim().replace(/\s+/g, "");

                const checkMatch = (item: any) => {
                    return (
                        item["Entry Point"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Exit"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Entry - Exit"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Fuel Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Balancing Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Change Min Inventory"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Shrinkagate"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Commissioning"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Gas Vent"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Other Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Imbalance"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Acc. Imbqalance"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        item["Min Inventory"]?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

                        formatNumberFourDecimal(item["Entry Point"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Entry - Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Fuel Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Balancing Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Change Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Shrinkagate"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Commissioning"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Gas Vent"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Other Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Imbalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Acc. Imbqalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimal(item["Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

                        formatNumberFourDecimalNoComma(item["Entry Point"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Entry - Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Fuel Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Balancing Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Change Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Shrinkagate"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Commissioning"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Gas Vent"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Other Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Imbalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Acc. Imbqalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
                    );
                };

                return data
                    .map((item) => {
                        // 🔥 STEP 1: เช็ค sum ก่อน
                        if (checkMatch(item.sum)) {
                            return item; // ✅ ผ่านทั้งก้อน ไม่ต้องยุ่ง value
                        }

                        // 🔥 STEP 2: ค่อย filter value
                        const filteredValue = item.value.filter((v: any) => {
                            return (
                                v.key?.toLowerCase().includes(queryLower) ||
                                checkMatch(v.data)
                            );
                        });

                        return {
                            ...item,
                            value: filteredValue,
                        };
                    })
                    // 🔥 STEP 3: ลบ record ที่ value ว่าง
                    .filter((item) => item.value.length > 0);
            };

            const filtered = dataTable?.filter(
                (item: any) => {

                    return (
                        item?.gas_day?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Entry Point"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Exit"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Entry - Exit"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Fuel Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Balancing Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Change Min Inventory"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Shrinkagate"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Commissioning"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Gas Vent"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Other Gas"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Imbalance"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["ImbalancePercen"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Acc. Imbqalance"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item["Min Inventory"]?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimal(item["Entry Point"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Entry - Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Fuel Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Balancing Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Change Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Shrinkagate"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Commissioning"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Gas Vent"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Other Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Imbalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["ImbalancePercen"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Acc. Imbqalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimal(item["Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        formatNumberFourDecimalNoComma(item["Entry Point"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Entry - Exit"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Fuel Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Balancing Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Change Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Shrinkagate"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Commissioning"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Gas Vent"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Other Gas"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Imbalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["ImbalancePercen"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Acc. Imbqalance"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberFourDecimalNoComma(item["Min Inventory"])?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                    )
                }
            );

            // const filterdExpanded 

            setFilteredDataTable(filtered);
            setFilteredDataTableExpanded(searchData(dataTableExpanded, queryLower))
        } else { // table download
            if (!queryLower) {
                setDataTabDownload(dataTabDownloadOriginal);
                return;
            }

            const filtered = dataTabDownloadOriginal?.filter(
                (item: any) => {
                    return (
                        item?.monthText?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.contractCode?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.version?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.typeReport?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
                        item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
                        item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                        formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
                        formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower)
                    )
                }
            );

            setDataTabDownload(filtered)
        }
    };

    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0);
    const [dataTable, setData] = useState<any>([]);
    const [dataTableExpanded, setDataExpanded] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataTabDownloadOriginal, setDataTabDownloadOriginal] = useState<any>([]);
    const [dataTabDownload, setDataTabDownload] = useState<any>([]);
    const [dataVersion, setDataVersion] = useState<any>([]);

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
        handleReset(newValue);
    };
    

    const fetchData = async () => {
        try {
            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName(userDT?.account_manage?.[0]?.group?.id_name)
            }

            fetchShipperAndContract()
            // // Group (2 = TSO, 3 = Shipper, 4 = Other)
            // const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            // setDataShipper(res_shipper_name)

            // DATA SELECT VERSION
            const res_master_version = await getService(`/master/allocation/version-exe`);
            setDataVersion(res_master_version)

            // DATA CONTRACT CODE
            const res_contract_code: any = await getService(`/master/capacity/pure-contract`);
            setDataContract(res_contract_code);
            setDataContractOriginal(res_contract_code)

            // DATA TAB DOWNLAOD
            const res_tab_download = await getService(`/master/balancing/balancing-monthly-report-download`);
            // setDataTabDownloadOriginal(res_tab_download)
            // setDataTabDownload(res_tab_download)

            // map shipper เข้า 
            let updatedData = res_tab_download?.map((item: any) => {
                const matchContract = res_contract_code?.find((itemx: any) => itemx.contract_code === item.contractCode);
                if (matchContract) {
                    return {
                        ...item,
                        group: matchContract?.group,
                        shipper_name: matchContract?.group?.name
                    };
                }
                return item;
            });
            setDataTabDownloadOriginal(updatedData)
            setDataTabDownload(updatedData)

            // DATA MAIN
            let new_url = `/master/balancing/balancing-monthly-report?skip=0&limit=100` // skip, limit fix ของ eviden
            const monthx = dayjs().format('MM');   // 01‑12 มี 0 นำหน้า
            const yearx = dayjs().format('YYYY'); // 4 หลัก

            new_url += `&month=${monthx}`
            new_url += `&year=${yearx}`

            const res_new_data = await getService(new_url);

            // เวอร์ชั่น expanded
            setDataExpanded(transformDataExpanded(res_new_data?.gasDayShipperData ?? []));
            setFilteredDataTableExpanded(transformDataExpanded(res_new_data?.gasDayShipperData ?? []));
            setIsFilter(true)

            if (res_new_data?.setDataUse?.length > 0) {
                let filter_summary: any = res_new_data?.setDataUse?.filter((item: any) => item.keys == "Summary")

                // หา sum เพื่อเอาไปแสดงผล total
                // "gas_day": "sum" คือแถบเขียว
                let find_data_sum = filter_summary[0]?.value?.find((item: any) => item.gas_day == 'sum')

                setDataSummary(find_data_sum)

                // กันแตก
                if (!Array.isArray(filter_summary)) filter_summary = [];
                if (!filter_summary[0]) filter_summary[0] = { value: [] };

                // ลบ sum ออกจาก filter_summary
                filter_summary[0].value = filter_summary[0]?.value?.filter((row: any) => row.gas_day !== 'sum');

                // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                const flatData = filter_summary[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                // เวอร์ชั่นไม่ expanded
                setData(flatData)
                setFilteredDataTable(flatData);
            } else {
                setData([]);
                setFilteredDataTable([]);
                setDataSummary({})
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const fetchDataTabChange = async () => {
        try {
            setIsLoading(false);

            // DATA MAIN
            let new_url = `/master/balancing/balancing-monthly-report?skip=0&limit=100` // skip, limit fix ของ eviden
            const monthx = dayjs().format('MM');   // 01‑12 มี 0 นำหน้า
            const yearx = dayjs().format('YYYY');; // 4 หลัก
            

            new_url += `&month=${monthx}`
            new_url += `&year=${yearx}`

            const res_new_data = await getService(new_url);

            setDataExpanded(transformDataExpanded(res_new_data?.gasDayShipperData ?? []));
            setFilteredDataTableExpanded(transformDataExpanded(res_new_data?.gasDayShipperData ?? []));
            setIsFilter(true);

            if (res_new_data?.setDataUse?.length > 0) {
                let filter_summary: any = res_new_data?.setDataUse?.filter((item: any) => item.keys == "Summary")

                // หา sum เพื่อเอาไปแสดงผล total
                // "gas_day": "sum" คือแถบเขียว
                let find_data_sum = filter_summary[0]?.value?.find((item: any) => item.gas_day == 'sum')
                setDataSummary(find_data_sum)

                // กันแตก
                if (!Array.isArray(filter_summary)) filter_summary = [];
                if (!filter_summary[0]) filter_summary[0] = { value: [] };

                // ลบ sum ออกจาก filter_summary
                filter_summary[0].value = filter_summary[0]?.value?.filter((row: any) => row.gas_day !== 'sum');

                // ทำให้ value อยู่ชั้นเดียวกับ gas_day
                const flatData = filter_summary[0]?.value.map(({ gas_day, value }: any) => ({ gas_day, ...value }));

                setData(flatData)
                setFilteredDataTable(flatData);
                setIsLoading(true);
            } else {
                setData([]);
                setFilteredDataTable([]);

                // เวอร์ชั่น expanded
                setDataExpanded([]);
                setFilteredDataTableExpanded([])
                setDataSummary({})
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const fetchDataDownload = async () => {
        // DATA TAB DOWNLOAD
        try {
            const res_tab_download = await getService(`/master/balancing/balancing-monthly-report-download`);
            // setDataTabDownloadOriginal(res_tab_download)
            // setDataTabDownload(res_tab_download)

            // map shipper เข้า 
            let updatedData = res_tab_download?.map((item: any) => {
                const matchContract = dataContractOriginal?.find((itemx: any) => itemx.contract_code === item.contractCode);
                if (matchContract) {
                    return {
                        ...item,
                        group: matchContract?.group,
                        shipper_name: matchContract?.group?.name
                    };
                }
                return item;
            });
            setDataTabDownloadOriginal(updatedData)
            setDataTabDownload(updatedData)

            settk(!tk);

        } catch (error) {
            setDataTabDownloadOriginal([])
            setDataTabDownload([])
        }
    }

    useEffect(() => {
        fetchData();
        getPermission();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    // const openApproveModal = (id: any, data: any) => {
    //     setIsLoading(false)
    //     setDisableApprove(true)

    //     approveMonthlyReport();

    //     setTimeout(() => { // ยื้อเวลาให้มันทำงานหน่อย
    //         fetchDataDownload();
    //     }, 2000);

    //     setTimeout(() => {
    //         setModalSuccessOpen(true);
    //         setIsLoading(true)
    //         setTabIndex(1)
    //     }, 1000);
    // };

    const openApproveModal = async (id: any, data: any) => {
        setIsLoading(false);
        setDisableApprove(true);

        try {
            const resApprove = await approveMonthlyReport();
            await sleep(800);
            await fetchDataDownload();

            setModalSuccessOpen(true);
            setTabIndex(1);

            await sleep(400);
            setIsLoading(true)
        } catch (err) {
            // approve failed
            // TODO: แจ้ง error ให้ผู้ใช้ เช่น toast/error state
        } finally {
            // approve ok
            settk(!tk);
            setIsLoading(true);
            setDisableApprove(false);
        }

        try {
            const res_tab_download = await getService(`/master/balancing/balancing-monthly-report-download`);
            // setDataTabDownloadOriginal(res_tab_download)
            // setDataTabDownload(res_tab_download)

            // map shipper เข้า 
            let updatedData = res_tab_download?.map((item: any) => {
                const matchContract = dataContractOriginal?.find((itemx: any) => itemx.contract_code === item.contractCode);
                if (matchContract) {
                    return {
                        ...item,
                        group: matchContract?.group,
                        shipper_name: matchContract?.group?.name
                    };
                }
                return item;
            });
            setDataTabDownloadOriginal(updatedData)
            setDataTabDownload(updatedData)

        } catch (error) {
        }

        setTimeout(() => {
            handleFieldSearch(null);
        }, 1000);
    };

    const approveMonthlyReport = async () => {
        // const res_approve = await getService(urlForApprove);
        return await getService(urlForApprove);
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'date', label: 'Date', visible: true },
        { key: 'entry_point', label: 'Entry Point', visible: true },
        { key: 'exit_point', label: 'Exit Point', visible: true },
        { key: 'entry_exit', label: 'Entry - Exit', visible: true },
        { key: 'fuel_gas', label: 'Fuel Gas', visible: true },
        { key: 'balancing_gas', label: 'Balancing Gas', visible: true },
        { key: 'change_min_inventory', label: 'Change Min Inventory', visible: true },
        { key: 'shrinkagate', label: 'Shrinkage', visible: true },
        { key: 'commissioning', label: 'Commissioning', visible: true },
        { key: 'gas_vent', label: 'Gas Vent', visible: true },
        { key: 'other_gas', label: 'Other Gas', visible: true },
        { key: 'imbalance', label: 'Imbalance', visible: true },
        { key: 'ImbalancePercen', label: 'Imbalance (%)', visible: true },
        { key: 'acc_imbalance', label: 'Acc. Imbalance', visible: true },
        { key: 'min_inventory', label: 'Min Inventory', visible: true },
        { key: 'instructed_flow', label: 'Instructed Flow', visible: true },
    ];

    const initialColumnsDownload: any = [
        { key: 'month', label: 'Month', visible: true },
        { key: 'group', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'report_version', label: 'Report Version', visible: true },
        { key: 'type_report', label: 'Type Report', visible: true },
        { key: 'approved_by', label: 'Approved by', visible: true },
        { key: 'download', label: 'Download', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        if (tabIndex == 0) {
            setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
        } else {
            setColumnVisibility(Object.fromEntries(initialColumnsDownload.map((column: any) => [column.key, column.visible])))
        }
    }, [tabIndex])

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
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [paginatedDataExpanded, setPaginatedDataExpanded] = useState<any[]>([]);
    const [paginatedDataDownload, setPaginatedDataDownload] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            // setPaginatedData(filteredDataTable)
        }

        if (tabIndex == 1) {
            setPaginatedDataDownload(dataTabDownload?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage, dataTabDownload])

    useEffect(() => {
        if (filteredDataTableExpanded) {
            setPaginatedDataExpanded(filteredDataTableExpanded?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTableExpanded, currentPage, itemsPerPage, dataTabDownload])


    useEffect(() => {
        if (tabIndex == 1) {
            const localDate = srchGasDayTabDownlaod ? toDayjs(srchGasDayTabDownlaod).format("MMMM YYYY") : toDayjs().format("MMMM YYYY");
            const fitered_current_month = dataTabDownloadOriginal.filter((item: any) => {
                return (
                    (srchGasDayTabDownlaod ? localDate == item?.monthText : true)
                );
            });
            setDataTabDownload(fitered_current_month)
        }

    }, [tabIndex])


    // useEffect(() => {
    //   const contractSelect = dataContract
    //   ?.filter((f:any) => f?.status_capacity_request_management_id !== 3)
    //   ?.filter((contract: any) => {
    //                         let isShipper = true;
    //                         let isActive = true;
    //                         if (srchShipperName?.length > 0) {
    //                             isShipper = srchShipperName?.includes(contract?.group?.id_name)
    //                         }

    //                         const endDate = contract.terminate_date ?? contract.extend_deadline ?? contract.contract_end_date
    //                         if (tabIndex == 0 && srchGasDay) {
    //                             const gasDayMonth = toDayjs(srchGasDay).startOf("month")
    //                             if (contract.contract_start_date) {
    //                                 const contractStartMonth = toDayjs(
    //                                     contract.contract_start_date
    //                                 ).startOf("month");

    //                                 isActive =
    //                                     isActive &&
    //                                     gasDayMonth.isSameOrAfter(
    //                                         contractStartMonth,
    //                                         "month"
    //                                     );
    //                             }

    //                             if (endDate) {
    //                                 const contractEndMonth = toDayjs(endDate).subtract(1, "day").startOf(
    //                                     "month"
    //                                 );

    //                                 isActive =
    //                                     isActive &&
    //                                     (
    //                                         gasDayMonth.isSame(
    //                                             contractEndMonth,
    //                                             "month"
    //                                         ) ||
    //                                         gasDayMonth.isBefore(
    //                                             contractEndMonth,
    //                                             "month"
    //                                         )
    //                                     );
    //                             }
    //                         }

    //                         if (tabIndex == 1 && srchGasDayTabDownlaod) {
    //                             const gasDayDownloadMonth = toDayjs(
    //                                 srchGasDayTabDownlaod
    //                             ).startOf("month");

    //                             if (contract?.contract_start_date) {
    //                                 const contractStartMonth = toDayjs(
    //                                     contract.contract_start_date
    //                                 ).startOf("month");

    //                                 // เดือนค้นหา ต้องเท่ากับหรือหลังเดือนเริ่มสัญญา
    //                                 isActive =
    //                                     isActive &&
    //                                     gasDayDownloadMonth.isSameOrAfter(
    //                                         contractStartMonth,
    //                                         "month"
    //                                     );
    //                             }

    //                             if (endDate) {
    //                                 const contractEndMonth = toDayjs(endDate).subtract(1, "day").startOf(
    //                                     "month"
    //                                 );

    //                                 // เดือนค้นหา ต้องเท่ากับหรือก่อนเดือนสิ้นสุดสัญญา
    //                                 isActive =
    //                                     isActive &&
    //                                     (
    //                                         gasDayDownloadMonth.isSame(
    //                                             contractEndMonth,
    //                                             "month"
    //                                         ) ||
    //                                         gasDayDownloadMonth.isBefore(
    //                                             contractEndMonth,
    //                                             "month"
    //                                         )
    //                                     );
    //                             }
    //                         }

    //                         return isShipper && isActive
    //                     })
    //                     ?.map((item: any) => ({ // กรอง contract ตาม shipper
    //                         value: item?.contract_code,
    //                         label: item?.contract_code
    //                     }))
    //     console.log('[PTT] dataContract : ', dataContract?.filter((f:any) => f?.group?.name === "PTT"));
    //     // 2026-CSF-T002
    //     console.log('dataContract : ', dataContract);
    //     console.log('contractSelect : ', contractSelect);
    // }, [srchShipperName, srchGasDayTabDownlaod, srchGasDay]) // test
    


    useEffect(() => {
        fetchShipperAndContract()
    }, [srchGasDay, srchGasDayTabDownlaod])

  useEffect(() => {
    const dataContract_ = dataContract?.filter((item: any) => (srchShipperName?.length > 0 ? srchShipperName?.includes(item?.group?.id_name) : true)) || [];

    const gasDay = tabIndex == 0 ? srchGasDay : srchGasDayTabDownlaod
    const fromDate = dayjs(gasDay).startOf('month')

    const toDate = dayjs(gasDay).endOf('month')

    const filteredContract =
      dataContract_?.filter((contract: any) => {
        if (!contract?.contract_start_date) return false

        const contractStart = dayjs(contract.contract_start_date)
        const contractEndDate = contract?.terminate_date || contract?.extend_deadline || contract?.contract_end_date
        const contractEnd = contractEndDate ? dayjs(contractEndDate).subtract(1, 'day') : null

        if (!contractStart.isValid()) return false

        // contract_start_date <= วันที่สิ้นสุดที่ค้นหา
        const startIsValid = !contractStart.isAfter(toDate)

        // contract_end_date >= วันที่เริ่มต้นที่ค้นหา
        // ถ้า contract_end_date เป็น null ให้ถือว่าสัญญายังไม่สิ้นสุด
        const endIsValid = !contractEnd || !contractEnd.isBefore(fromDate)

        return startIsValid && endIsValid
      }) || []

    setDataContractFiltered(filteredContract)
  }, [srchGasDay, srchGasDayTabDownlaod, tabIndex, srchShipperName, dataContract])
    


    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {/* <MonthYearPickaSearch
                        key={"start" + key}
                        label={'Gas Month'}
                        placeHolder={'Select Gas Month'}
                        allowClear
                        min={dataTable?.date_balance}
                        isDefaultCurrentMonth={true}
                        // max={endOfMonth(new Date())} // เลือกได้สูงสุดคือ เดือนปีปัจจุบัน นับจากเดือน ที่ close ล่าสุด
                        // customWidth={200}
                        // customHeight={35}
                        onChange={(e: any) => {
                            // const formattedDate = dayjs(e).format('DD-MM-YYYY');
                            // setSrchGasDay(e ? formattedDate : null);
                            setSrchGasDay(e ? e : null)
                        }}
                    /> */}

                    {
                        tabIndex == 0 ?
                            <MonthYearPickaSearch
                                key={"start" + key}
                                label={'Gas Month'}
                                placeHolder={'Select Gas Month'}
                                allowClear
                                min={dataTable?.date_balance}
                                isDefaultCurrentMonth={false}
                                valueShow={srchGasDay}
                                onChange={(e: any) => {
                                    setSrchGasDay(e ? e : null)
                                }}
                            />
                            :
                            <MonthYearPickaSearch
                                key={"start" + key}
                                label={'Gas Month'}
                                placeHolder={'Select Gas Month'}
                                allowClear
                                min={dataTable?.date_balance}
                                isDefaultCurrentMonth={false}
                                valueShow={srchGasDayTabDownlaod}
                                onChange={(e: any) => {
                                    setSrchGasDayTabDownlaod(e ? e : null)
                                }}
                            />
                    }

                    {/* {
                        tabIndex == 0 && <InputSearch
                            id="searchShipper"
                            label="Shipper Name"
                            type="select"
                            value={srchShipperName}
                            // onChange={(e) => setSrchShipper(e.target.value)}
                            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                            onChange={(e) => {
                                setSrchContractCode('')
                                if (e.target.value == undefined) {
                                    setSrchShipperName('')
                                } else {
                                    setSrchShipperName(e.target.value)
                                }
                            }}
                            options={dataShipper
                                ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true
                                )
                                .map((item: any) => ({
                                    value: item.id_name,
                                    label: item.name,
                                }))
                            }
                        />
                    } */}

                    {
                        // tabIndex == 0 && 
                        <InputSearch
                            id="searchShipper"
                            label="Shipper Name"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchShipperName}
                            onChange={(e: any) => {
                                if (e.target.value == undefined) {
                                    if (srchShipperName) {
                                        setSrchContractCode('')
                                    }
                                    setSrchShipperName([])
                                } else {
                                    if (e.target.value != srchShipperName) {
                                        setSrchContractCode('')
                                    }
                                setSrchShipperName(e.target.value)
                                }
                            }}
                            options={dataShipper?.filter((item: any) => {
                                let isShipper = true;
                                let isActive = true;
                                if (userDT?.account_manage?.[0]?.user_type_id == 3) {// เห็นแค่ชื่อตัวเอง
                                    isShipper = item?.id === userDT?.account_manage?.[0]?.group?.id
                                }



                                if (srchGasDay) {
                                    const gasDayjs = toDayjs(srchGasDay)
                                    if (item.start_date) {
                                        isActive = isActive && gasDayjs.isSameOrAfter(toDayjs(item.start_date))
                                    }

                                    if (item.end_date) {
                                        isActive = isActive && gasDayjs.isBefore(toDayjs(item.end_date))
                                    }
                                }

                                if (srchGasDayTabDownlaod) {
                                    const gasDayjs = toDayjs(srchGasDayTabDownlaod)
                                    if (item.start_date) {
                                        isActive = isActive && gasDayjs.isSameOrAfter(toDayjs(item.start_date))
                                    }

                                    if (item.end_date) {
                                        isActive = isActive && gasDayjs.isBefore(toDayjs(item.end_date))
                                    }
                                }

                                return isShipper && isActive
                            }
                            ).map((item: any) => ({
                                value: item.id_name,
                                label: item.name,
                            }))
                            }
                        />
                    }

                    {/* <InputSearch
                        id="searchVersion"
                        label="Version"
                        type="select"
                        value={srchVersion}
                        onChange={(e) => setSrchVersion(e.target.value)}
                        options={dataVersion?.map((item: any) => ({
                            value: item?.execute_timestamp,
                            label: dayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm')
                        }))}
                    /> */}

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select"
                        value={srchContractCode}
                        isDisabled={Array.isArray(srchShipperName) && srchShipperName?.length < 1}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // options={dataContract
                        //     ?.filter((f:any) => f?.status_capacity_request_management_id !== 3)
                        //     ?.filter((contract: any) => {
                        //     let isShipper = true;
                        //     let isActive = true;
                        //     if (srchShipperName?.length > 0) {
                        //         isShipper = srchShipperName?.includes(contract?.group?.id_name)
                        //     }

                        //     const endDate = contract.terminate_date ?? contract.extend_deadline ?? contract.contract_end_date
                        //     if (tabIndex == 0 && srchGasDay) {
                        //         const gasDayMonth = toDayjs(srchGasDay).startOf("month")
                        //         if (contract.contract_start_date) {
                        //             const contractStartMonth = toDayjs(
                        //                 contract.contract_start_date
                        //             ).startOf("month");

                        //             isActive =
                        //                 isActive &&
                        //                 gasDayMonth.isSameOrAfter(
                        //                     contractStartMonth,
                        //                     "month"
                        //                 );
                        //         }

                        //         if (endDate) {
                        //             const contractEndMonth = toDayjs(endDate).subtract(1, "day").startOf(
                        //                 "month"
                        //             );

                        //             isActive =
                        //                 isActive &&
                        //                 (
                        //                     gasDayMonth.isSame(
                        //                         contractEndMonth,
                        //                         "month"
                        //                     ) ||
                        //                     gasDayMonth.isBefore(
                        //                         contractEndMonth,
                        //                         "month"
                        //                     )
                        //                 );
                        //         }
                        //     }

                        //     if (tabIndex == 1 && srchGasDayTabDownlaod) {
                        //         const gasDayDownloadMonth = toDayjs(
                        //             srchGasDayTabDownlaod
                        //         ).startOf("month");

                        //         if (contract?.contract_start_date) {
                        //             const contractStartMonth = toDayjs(
                        //                 contract.contract_start_date
                        //             ).startOf("month");

                        //             // เดือนค้นหา ต้องเท่ากับหรือหลังเดือนเริ่มสัญญา
                        //             isActive =
                        //                 isActive &&
                        //                 gasDayDownloadMonth.isSameOrAfter(
                        //                     contractStartMonth,
                        //                     "month"
                        //                 );
                        //         }

                        //         if (endDate) {
                        //             const contractEndMonth = toDayjs(endDate).subtract(1, "day").startOf(
                        //                 "month"
                        //             );

                        //             // เดือนค้นหา ต้องเท่ากับหรือก่อนเดือนสิ้นสุดสัญญา
                        //             isActive =
                        //                 isActive &&
                        //                 (
                        //                     gasDayDownloadMonth.isSame(
                        //                         contractEndMonth,
                        //                         "month"
                        //                     ) ||
                        //                     gasDayDownloadMonth.isBefore(
                        //                         contractEndMonth,
                        //                         "month"
                        //                     )
                        //                 );
                        //         }
                        //     }

                        //     return isShipper && isActive
                        // })
                        // ?.map((item: any) => ({ // กรอง contract ตาม shipper
                        //     value: item?.contract_code,
                        //     label: item?.contract_code
                        // }))
                        options={dataContractFiltered?.map((item: any) => ({ // กรอง contract ตาม shipper
                            value: item?.contract_code,
                            label: item?.contract_code
                        }))
                        }
                    // options={dataContract?.filter((contract: any) => srchShipperName !== '' ? contract?.group?.id_name === srchShipperName : true).map((item: any) => ({ // กรอง contract ตาม shipper
                    //     value: item?.contract_code,
                    //     label: item?.contract_code
                    // }))}
                    />

                    <BtnSearch handleFieldSearch={()=> handleFieldSearch(null)} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <aside className="mt-auto ml-1 w-full sm:w-auto ">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnGeneral
                            textRender={"Approve"}
                            iconNoRender={true}
                            bgcolor={"#C8FFD7"}
                            generalFunc={() => openApproveModal('x', 'x')}
                            disable={disableApprove} // Active เมื่อ filter Gas Month และ Shipper Name
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
                                <BtnExport
                                    textRender={"Export"}
                                    data={filteredDataTable}
                                    path="balancing/balancing-monthly-report"
                                    can_export={userPermission ? userPermission?.f_export : false}
                                    columnVisibility={columnVisibility}
                                    initialColumns={initialColumns}
                                    disable={srchShipperName?.length === 0 || srchShipperName?.length === 1 || (srchShipperName?.length === dataShipper?.length) ? (isFilter ? false : true) : true}
                                    specificMenu={'balancing-monthly-report'}
                                    specificData={{
                                        "skip": 0, //fix
                                        "limit": 100,  //fix
                                        "month": month ? month : dayjs().format("MM"),
                                        "year": year ? year : dayjs().format("YYYY"),
                                        "shipperId": srchShipperName, //NGP-S01-001
                                        "contractCode": srchContractCode !== '' ? srchContractCode : "Summary" // Summary หรือ 2025-CNF-002 .....
                                    }}
                                />
                            }

                            {
                                tabIndex == 1 && <BtnExport
                                    textRender={"Export"}
                                    data={dataTabDownload}
                                    path="balancing/balancing-monthly-report-download"
                                    can_export={userPermission ? userPermission?.f_export : false}
                                    columnVisibility={columnVisibility}
                                    initialColumns={initialColumnsDownload}
                                    specificMenu={'balancing-monthly-report-download'}
                                    disable={dataTabDownload?.length > 0 ? false : true}
                                    specificData={{
                                        "idAr": dataTabDownload?.flatMap((item: any) => item?.id)
                                    }}
                                />
                            }

                        </div>
                    </div>
                </div>

                {
                    isLoading ?
                        !isFilter && tabIndex == 0 ? <NodataTable textRender={'Please select filter to view the information.'} /> : <>
                            <TabTable value={tabIndex} index={0}>
                                {/* <TableReport
                                    tableData={paginatedData}
                                    allData={filteredDataTable}
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    dataSummary={dataSummary}
                                    isLoading={isLoading}
                                    columnVisibility={columnVisibility}
                                    userPermission={userPermission}
                                    areaMaster={areaMaster}
                                /> */}

                                <TableReportExpanded
                                    tableData={paginatedDataExpanded}
                                    allData={filteredDataTableExpanded}
                                    currentPage={currentPage}
                                    itemsPerPage={itemsPerPage}
                                    dataSummary={dataSummary}
                                    isLoading={isLoading}
                                    columnVisibility={columnVisibility}
                                    userPermission={userPermission}
                                    areaMaster={areaMaster}
                                />
                            </TabTable>
                        </>
                        : <TableSkeleton />
                }

                <TabTable value={tabIndex} index={1}>
                    <TableDownload
                        // tableData={dataTable}
                        // tableData={dataTabDownload}
                        // tableData={dataTabDownload ? paginatedDataDownload : []}
                        tableData={paginatedDataDownload ? paginatedDataDownload : []}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        setModalErrorMsg={setModalErrorMsg}
                        setModalErrorOpen={setModalErrorOpen}
                        columnVisibility={columnVisibility}
                        userPermission={userPermission}
                        dataShipper={dataShipper}
                    />
                </TabTable>
            </div>

            <PaginationComponent
                // totalItems={tabIndex == 0 ? filteredDataTable ? filteredDataTable?.length : [] : dataTabDownload?.length}
                totalItems={tabIndex == 0 ? filteredDataTableExpanded ? filteredDataTableExpanded?.length : [] : dataTabDownload?.length}
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

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    if (resetForm) resetForm();
                }}
                title="Failed"
                description=
                {
                    modalErrorMsg?.split('<br/>')?.length > 1 ?
                        <ul className="text-start list-disc">
                            {
                                modalErrorMsg.split('<br/>').map(item => {
                                    return (
                                        <li>{item}</li>
                                    )
                                })
                            }
                        </ul>
                        :
                        <div className="text-center">
                            {`${modalErrorMsg}`}
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
                initialColumns={tabIndex == 0 ? initialColumns : initialColumnsDownload}
            />

        </div>
    )
}

export default ClientPage;