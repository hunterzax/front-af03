"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, generateUserPermission, getCurrentWeekSundayYyyyMmDd, toDayjs } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
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
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import TableDailyAdjustmentSummary from "./form/table";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const [dataTable, setData] = useState<any>([]);
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
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    // ############### REDUX DATA ###############
    const { nominationPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchNomPoint, setSrchNomPoint] = useState<any>([]);
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);

    const handleFieldSearch = async () => {
        setIsLoading(false)

        let body_post = {
            checkAdjustment: watch('check_adjustment') ? true : false, // true = YES, false = NO 
            startDate: srchGasDayFrom ? dayjs(srchGasDayFrom).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT
            endDate: srchGasDayTo ? dayjs(srchGasDayTo).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
            // contractCode: srchContractCode // ถ้าไม่ส่ง ให้ null หรือ ""
            contractCode: null // ถ้าไม่ส่ง ให้ null หรือ ""
        }

        const response = await postService('/master/daily-adjustment/daily-adjustment-summary', body_post);
        const result = (response && Array.isArray(response)) ? response.filter((item: any) => {
            return (
                // (srchNomPoint ? item?.point == srchNomPoint : true) &&
                // (srchShipperName ? item?.shipper_name == srchShipperName : true)
                (srchNomPoint?.length > 0 ? srchNomPoint.includes(item?.point) : true) &&
                (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper_name) : true)
            );
        }) : [];

        setCurrentPage(1)
        setData(result)
        setFilteredDataTable(result);

        setTimeout(() => {
            setIsLoading(true)
        }, 300);

    };

    const handleReset = async () => {
        setSrchGasDayFrom(null)
        setSrchGasDayTo(null)
        setSrchContractCode([])
        setSrchNomPoint([])
        setValue('check_adjustment', true)
        setSrchShipperName([])

        let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());
        setSrchStartDate(sun_day_fun_day)

        // setFilteredDataTable(dataTable)
        setFilteredDataTable([])

        // List > Reset Filter แล้วยังไม่คืนค่า Default Filter https://app.clickup.com/t/86ettm90p
        fetchData();
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        /** ช่วยดูว่าเป็น “จำนวนเต็ม” หรือไม่ */
        // const isIntegerLike = (v: unknown) =>
        //     v !== null && v !== undefined && /^\d+$/.test(v.toString().trim());

        // /** แปลงตัวเลขให้เป็น 3 ทศนิยมเสมอ (เช่น 5 → 5.000) */
        // const toThreeDecimal = (v: unknown) => {
        //     const n = Number(v);
        //     return Number.isFinite(n)            // เป็นตัวเลขจริงหรือไม่
        //         ? n.toFixed(3)                     // 3 ทศนิยม
        //         : v?.toString() ?? "";
        // };

        /** ล้างสตริงก่อนเทียบ (ลบ space + lowercase) */
        const clean = (v: unknown) => v?.toString().replace(/\s+/g, "").toLowerCase().trim() ?? "";

        /** key ของ H1…H24 */
        const hourKeys = Array.from({ length: 24 }, (_, i) => `H${i + 1}` as const);

        const filtered = dataTable?.filter((item: any) => {
            /** อาร์เรย์ค่าทั่วไปที่ไม่ใช่ H1…H24 */
            const baseValues = [
                item.gasDayUse,
                item.nomination_code,
                item.entryExitObj?.name,
                item.adjustment,
                item.contract,
                item.shipper_name,
                item.point,
                item.totalH1ToH24Adjust,
                formatNumberThreeDecimal(item.totalH1ToH24Adjust),
                formatNumberThreeDecimalNoComma(item.totalH1ToH24Adjust), // R1 : Smart Search ยัง search ทศนิยมไม่ได้ https://app.clickup.com/t/86etzchag
                item.valueBtuScf,
                formatNumberThreeDecimal(item.valueBtuScf),
                formatNumberThreeDecimalNoComma(item.valueBtuScf),
            ];

            /** ค่า H1‑H24 ดิบ + เวอร์ชัน 3 ทศนิยม */
            const hourValues = hourKeys.flatMap((k) => {
                const raw = item[k];
                return [
                    raw,                               // ค่าปกติ
                    // toThreeDecimal(raw),               // บังคับ 3 ทศนิยม (.000)
                    formatNumberThreeDecimal(raw),
                    formatNumberThreeDecimalNoComma(raw),
                ];
            });

            /** รวมทั้งหมด */
            const searchPool = [...baseValues, ...hourValues];

            /** มีค่าไหนแมตช์กับ query ไหม? */
            return searchPool.some((v) => clean(v).includes(queryLower));
        });

        setCurrentPage(1)
        setFilteredDataTable(filtered);
    };


    // ############### DATA TABLE ###############
    const [tabIndex, setTabIndex] = useState(0); // 0=daily, 1=weekly
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContract, setDataContract] = useState<any>([]);
    // const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataNomPointMaster, setDataNomPointMaster] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false)
            setValue('check_adjustment', true)

            // // Group (2 = TSO, 3 = Shipper, 4 = Other)
            // const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            // setDataShipper(res_shipper_name)

            // กรณี shipper เข้ามาเห็นของตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.name])
            }

            // // DATA CONTRACT CODE
            // // const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
            // const res_contract_code: any = await getService(`/master/capacity/capacity-request-management`);

            // // Filter Contract Code : Shipper ต้องเห็นเฉพาะ สัญญาของตัวเอง https://app.clickup.com/t/86etd63ym
            // if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            //     let filter_response_only_own_shipper = res_contract_code?.filter((item: any) =>
            //         userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true
            //     )
            //     setDataContract(filter_response_only_own_shipper);
            //     setDataContractOriginal(filter_response_only_own_shipper)


            // } else {
            //     setDataContract(res_contract_code);
            //     setDataContractOriginal(res_contract_code)
            // }

            // สำคัญ
            // contract, shipper_name, gasDayUse ที่เหมือนกัน มันจะมีเป็นคู่
            // เขียนฟังก์ชั่นจับคู่

            // DATA TABLE
            let body_post = {
                checkAdjustment: true, // true = YES, false = NO 
                startDate: dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT
                endDate: dayjs().format("DD/MM/YYYY"),
                contractCode: "" // ถ้าไม่ส่ง ให้ null หรือ ""
            }
            const response = await postService('/master/daily-adjustment/daily-adjustment-summary', body_post);

            // Shipper ต้องเห็นเฉพาะรายการของตัวเอง https://app.clickup.com/t/86etd62kv
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                let filter_response_only_own_shipper = response?.filter((item: any) =>
                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.shipper_name === userDT?.account_manage?.[0]?.group?.name : true
                )
                setData(filter_response_only_own_shipper);
                setFilteredDataTable(filter_response_only_own_shipper);
                setDataShipper([userDT?.account_manage?.[0]?.group]) // https://app.clickup.com/t/86ewwu518 ที่มา set ยังงี้เพราะ master ที่เอาไว้ทำ option มันได้มาจากข้อมูล ถ้าไม่มี ชื่อ shipper จะไม่ขึ้น

            } else {
                setData(response);
                setFilteredDataTable(response);
            }

            // setData(response);
            // setFilteredDataTable(response);

            setTimeout(() => {
                setIsLoading(true);
            }, 500);
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
        if (filteredDataTable && Array.isArray(filteredDataTable)) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ===================== TABLE HEADER MAP =====================
    const hours = Array.from({ length: 24 }, (_, i) => ({
        key: `h${i + 1}`,
        label: `H${i + 1}`,
        timeRange: `${String(i).padStart(2, "0")}:01 - ${String(i + 1).padStart(2, "0")}:00`
    }));

    // ############### TAB HR ###############
    const [subTabIndex, setSubTabIndex] = useState(4);
    const handleChangeSubTab = (event: any, newValue: any) => {
        // 0 = 1-6 Hr
        // 1 = 7-12 Hr
        // 2 = 13-18 Hr
        // 3 = 19-24 Hr
        // 4 = All Day
        setSubTabIndex(newValue);
    };

    const getVisibleHours = () => {
        switch (subTabIndex) {
            case 0: return hours.slice(0, 6);  // H1 - H6
            case 1: return hours.slice(6, 12); // H7 - H12
            case 2: return hours.slice(12, 18); // H13 - H18
            case 3: return hours.slice(18, 24); // H19 - H24
            case 4: return hours; // All hours
            default: return [];
        }
    };

    useEffect(() => {
        getVisibleHours();
    }, [subTabIndex])

    // ############### COLUMN SHOW/HIDE INTRADAY ###############
    const initialColumnsTabIntraday: any = [

        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'nominations_code', label: 'Nominations Code', visible: true },
        { key: 'entry_exit', label: 'Entry/Exit', visible: true },
        { key: 'adjustment', label: 'Adjustment', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },

        { key: 'h1', label: 'H1 00:00 - 01:00', visible: true }, // show if tabIndex = 0
        { key: 'h2', label: 'H2 01:01 - 02:00', visible: true }, // show if tabIndex = 0
        { key: 'h3', label: 'H3 02:01 - 03:00', visible: true }, // show if tabIndex = 0
        { key: 'h4', label: 'H4 03:01 - 04:00', visible: true }, // show if tabIndex = 0
        { key: 'h5', label: 'H5 04:01 - 05:00', visible: true }, // show if tabIndex = 0
        { key: 'h6', label: 'H6 05:01 - 06:00', visible: true }, // show if tabIndex = 0

        { key: 'h7', label: 'H7 06:01 - 07:00', visible: true }, // show if tabIndex = 1
        { key: 'h8', label: 'H8 07:01 - 08:00', visible: true }, // show if tabIndex = 1
        { key: 'h9', label: 'H9 08:01 - 09:00', visible: true }, // show if tabIndex = 1
        { key: 'h10', label: 'H10 09:01 - 10:00', visible: true }, // show if tabIndex = 1
        { key: 'h11', label: 'H11 10:01 - 11:00', visible: true }, // show if tabIndex = 1
        { key: 'h12', label: 'H12 11:01 - 12:00', visible: true }, // show if tabIndex = 1

        { key: 'h13', label: 'H13 12:01 - 13:00', visible: true }, // show if tabIndex = 2
        { key: 'h14', label: 'H14 13:01 - 14:00', visible: true }, // show if tabIndex = 2
        { key: 'h15', label: 'H15 14:01 - 15:00', visible: true }, // show if tabIndex = 2
        { key: 'h16', label: 'H16 15:01 - 16:00', visible: true }, // show if tabIndex = 2
        { key: 'h17', label: 'H17 16:01 - 17:00', visible: true }, // show if tabIndex = 2
        { key: 'h18', label: 'H18 17:01 - 18:00', visible: true }, // show if tabIndex = 2

        { key: 'h19', label: 'H19 18:01 - 19:00', visible: true }, // show if tabIndex = 3
        { key: 'h20', label: 'H20 19:01 - 20:00', visible: true }, // show if tabIndex = 3
        { key: 'h21', label: 'H21 20:01 - 21:00', visible: true }, // show if tabIndex = 3
        { key: 'h22', label: 'H22 21:01 - 22:00', visible: true }, // show if tabIndex = 3
        { key: 'h23', label: 'H23 22:01 - 23:00', visible: true }, // show if tabIndex = 3
        { key: 'h24', label: 'H24 23:01 - 24:00', visible: true }, // show if tabIndex = 3

        { key: 'total', label: 'Total', visible: true }, // always show

    ];

    const filterColumnsByTabIndex = (subTabIndex: number) => {
        return initialColumnsTabIntraday.filter((col: any) => {
            // Always show these columns
            const alwaysVisibleKeys = [
                "gas_day", "nominations_code", "entry_exit", "adjustment", "contract_code", "shipper_name", "nomination_point", "total"
            ];

            if (alwaysVisibleKeys.includes(col.key)) {
                return true;
            }

            if (subTabIndex === 4) {
                return true; // Show all columns if tabIndex = 4
            }

            // Define hourly column visibility based on tab index
            const hourColumnMapping: { [key: number]: string[] } = {
                0: ["h1", "h2", "h3", "h4", "h5", "h6"],
                1: ["h7", "h8", "h9", "h10", "h11", "h12"],
                2: ["h13", "h14", "h15", "h16", "h17", "h18"],
                3: ["h19", "h20", "h21", "h22", "h23", "h24"],
            };

            return hourColumnMapping[subTabIndex]?.includes(col.key) ?? false;
        });
    };

    const visibleColumns = filterColumnsByTabIndex(subTabIndex);
    const getInitialColumnsIntraday = () => visibleColumns;

    const [anchorElIntraday, setAnchorElIntraday] = useState<null | HTMLElement>(null);
    const openIntraday = Boolean(anchorElIntraday);

    const [columnVisibilityIntraday, setColumnVisibilityIntraday] = useState<any>(
        Object.fromEntries(getInitialColumnsIntraday().map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibilityIntraday(Object.fromEntries(getInitialColumnsIntraday().map((column: any) => [column.key, column.visible])))
    }, [subTabIndex])

    const handleTogglePopoverIntraday = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElIntraday(anchorElIntraday ? null : event.currentTarget);
    };

    const handleColumnToggleIntraday = (columnKey: string) => {
        setColumnVisibilityIntraday((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };


    useEffect(() => {
        const seen = new Set<string>();
        const dedup = nominationPointData?.data?.filter((o: any) => {
            const k = o.nomination_point; // ถ้าจะกันช่องว่าง/ตัวเล็กใหญ่: o.nomination_point.trim().toUpperCase()
            if (seen.has(k)) return false;
            seen.add(k);
            return true;
        });
        setDataNomPointMaster(dedup)
    }, [nominationPointData])

    useEffect(() => {
        const startDate = srchGasDayFrom ? dayjs(srchGasDayFrom).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
        const endDate = srchGasDayTo ? dayjs(srchGasDayTo).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
        let apiUrl = `/master/daily-adjustment/shipper-data?start_date=${startDate}&end_date=${endDate}`;

        getService(apiUrl).then((res_shipper_approve: any) => {
            if(Array.isArray(res_shipper_approve)) {
                let selectedShipper = []
                if (userDT?.account_manage?.[0]?.user_type_id == 3) { // shipper
                    const targetGroupId = userDT?.account_manage?.[0]?.group?.id;
                    const existsInGroup = res_shipper_approve?.some((group: any) => group.id === targetGroupId);
                    if(!existsInGroup && userDT?.account_manage?.[0]?.group?.id && userDT?.account_manage?.[0]?.group?.name ){
                        res_shipper_approve.push({ id: userDT?.account_manage?.[0]?.group?.id, name: userDT?.account_manage?.[0]?.group?.name })
                    }
                }
                else{
                    if(Array.isArray(srchShipperName)){
                        selectedShipper = srchShipperName.filter(name => res_shipper_approve.some((group: any) => group.name === name))
                        setSrchShipperName(selectedShipper)
                    }
                    else if (!res_shipper_approve.some((group: any) => group.id === srchShipperName)){
                        setSrchShipperName([])
                    }
                }
                setDataShipper(res_shipper_approve);


                const selctedShipperList = (!selectedShipper || selectedShipper?.length == 0) ? res_shipper_approve : res_shipper_approve.filter((group: any) => selectedShipper?.includes(group.name));

                const contractCodeList = selctedShipperList.flatMap((shipper: any) => {
                    let reserve_balancing_gas_contract = []
                    if(shipper?.reserve_balancing_gas_contract && Array.isArray(shipper?.reserve_balancing_gas_contract) && shipper?.reserve_balancing_gas_contract?.length > 0){
                        reserve_balancing_gas_contract = shipper?.reserve_balancing_gas_contract.map((item: any) => {
                            return { ...item, contract_code: item?.res_bal_gas_contract }
                        })
                    }
                    return [...(shipper.contract_code || []), ...reserve_balancing_gas_contract]
                })

                if(Array.isArray(srchContractCode)){
                    const selectedContractCode = srchContractCode.filter(code => contractCodeList.some((contract: any) => contract.contract_code === code))
                    setSrchContractCode(selectedContractCode)
                }
                else if (!contractCodeList.some((contract: any) => contract.contract_code === srchContractCode)){
                    setSrchContractCode([])
                }
                setDataContract(contractCodeList); 
            } else {
                setDataShipper([]);
                setDataContract([]);
            }
        });
    }, [srchGasDayFrom, srchGasDayTo])

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        isDefaultToday={true}
                        allowClear
                        // isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        isDefaultToday={true}
                        allowClear
                        // isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                    />

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox"
                        // value={srchShipperName}
                        value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name] : srchShipperName}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        onChange={(e: any) => {
                            setSrchShipperName(e.target.value)
                            if(Array.isArray(e.target.value)){
                                if(e.target.value.length > 0){
                                    const contractCodeList = (dataContract || []).filter((item: any) => {
                                        const selectedShipper = e.target.value
                                        if(selectedShipper.length > 0){
                                            return selectedShipper.includes(item?.group?.name)
                                        }
                                        else{
                                            return true
                                        }
                                    })
                                    const newSelectedContractCode = (srchContractCode || []).filter((code: any) => contractCodeList.some((item: any) => item.contract_code === code))
                                    setSrchContractCode(newSelectedContractCode)
                                }
                            }
                            else if (!dataContract.some((item: any) => item.group?.name === e.target.value)){
                                setSrchContractCode([])
                            }
                        }}
                        options={dataShipper
                            ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                userDT?.account_manage?.[0]?.user_type_id == 3
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                value: item.name,
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
                        options={
                            (dataContract || []).filter((item: any) => {
                                const selectedShipper = (userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.name] : srchShipperName)
                                if(selectedShipper.length > 0){
                                    return selectedShipper.includes(item?.group?.name)
                                }
                                else{
                                    return true
                                }
                            })
                            .map((item: any) => ({
                                value: item?.contract_code,
                                label: item?.contract_code
                            }))
                        }
                    />

                    <InputSearch
                        id="searchNomPoint"
                        label="Nomination Point"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchNomPoint}
                        onChange={(e) => setSrchNomPoint(e.target.value)}
                        // options={nominationPointData?.data?.map((item: any) => ({
                        //     // value: item?.id?.toString(),
                        //     value: item.nomination_point,
                        //     label: item.nomination_point,
                        // }))}
                        options={dataNomPointMaster?.map((item: any) => ({
                            // value: item?.id?.toString(),
                            value: item.nomination_point,
                            label: item.nomination_point,
                        }))}
                    />

                    <div className="w-auto relative">
                        <CheckboxSearch2
                            {...register('check_adjustment')}
                            id="check_adjustment"
                            label="Check Adjustment"
                            type="single-line"
                            value={watch('check_adjustment') ? watch('check_adjustment') : false}
                            onChange={(e: any) => setValue('check_adjustment', e?.target?.checked)}
                        />
                    </div>

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BtnGeneral */}
                </aside>
            </div>

            <Tabs
                value={subTabIndex}
                onChange={handleChangeSubTab}
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
                {['1-6 Hr.', '7-12 Hr.', '13-18 Hr.', '19-24 Hr.', 'All Day'].map((label, index) => (
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
                            minWidth: '80px',
                            maxWidth: '80px',
                            flexShrink: 0, // Prevents shrinking
                            backgroundColor: subTabIndex === index ? '#FFFFFF' : '#9CA3AF1A',
                            color: subTabIndex === index ? '#58585A' : '#9CA3AF',
                            '&:hover': {
                                backgroundColor: '#F3F4F6',
                            },
                        }}
                    />
                ))}
            </Tabs>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">

                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-4">
                        <div onClick={handleTogglePopoverIntraday}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            specificMenu={'daily-adjustment-summary'}
                            // type={tabIndex === 1 ? 1 : tabIndex === 2 ? 2 : 3}
                            path="nomination/daily-adjustment-summary"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibilityIntraday}
                            initialColumns={visibleColumns}
                            specificData={
                                {
                                    checkAdjustment: watch('check_adjustment') ? true : false, // true = YES, false = NO 
                                    startDate: srchGasDayFrom ? dayjs(srchGasDayFrom).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"), // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT
                                    endDate: srchGasDayTo ? dayjs(srchGasDayTo).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
                                    contractCode: srchContractCode?.length > 0 ? srchContractCode : "" // ถ้าไม่ส่ง ให้ null หรือ ""
                                }
                            }
                            disable={filteredDataTable?.length > 0 ? false : true}
                        />
                    </div>
                </div>

                {
                    !isLoading ? (
                        <TableSkeleton />
                    ) : tabIndex == 0 && (
                        <TableDailyAdjustmentSummary
                            tableData={paginatedData}
                            isLoading={isLoading}
                            gasWeekFilter={srchStartDate}
                            columnVisibility={columnVisibilityIntraday}
                            userPermission={userPermission}
                            subTabIndex={subTabIndex}
                        />
                    )
                }

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

            <ColumnVisibilityPopover
                open={openIntraday}
                anchorEl={anchorElIntraday}
                setAnchorEl={setAnchorElIntraday}
                columnVisibility={columnVisibilityIntraday}
                handleColumnToggle={handleColumnToggleIntraday}
                // initialColumns={initialColumnsTabIntraday}
                initialColumns={visibleColumns}
            />

        </div>
    );
};

export default ClientPage;