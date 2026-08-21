"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { findRoleConfigByMenuName, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatNumberTwoDecimalNom, generateUserPermission, toDayjs } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
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
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import TableMain from "./form/table";
import ModalSendEmail from "./form/modalSendEmail";
import BtnGeneral from "@/components/other/btnGeneral";
import { useRouter } from "next/navigation";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const router = useRouter();

    const [mdSendEmail, setMdSendEmail] = useState(false);
    const [mdEmailSentSuccessOpen, setMdEmailSentSuccessOpen] = useState(false);
    const [dataSendEmail, setDataSendEmail] = useState<any>({});
    const [fillModal, setFillModal] = useState<any>(null)


    

    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    const [tk, settk] = useState<boolean>(false);

    const [uiFilter_, setUiFilter_] = useState({
        gasDay: dayjs().format("DD/MM/YYYY"),
        type: "System",
        shipperName: ""
    })

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
            //     const permission = findRoleConfigByMenuName('Intraday Dashboard for Shipper', userDT)
            //     setUserPermission(permission);
            // }

            // const permission = findRoleConfigByMenuName('Intraday Dashboard for Shipper', userDT)
            const permission = findRoleConfigByMenuName('Intraday Dashboard', userDT)
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

    const [userPermissionDash, setUserPermissionDash] = useState<any>();

    const getPermissionDash = () => {
        try {
            const permission = findRoleConfigByMenuName('Intraday Acc. Imbalance Dashboard', userDT)
       
            if (permission) {
                setUserPermissionDash(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermissionDash(updatedUserPermission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<any>(toDayjs().toDate());
    const [bodyExport, setBodyExport] = useState<any>([]);
    const [srchTimeStamp, setSrchTimeStamp] = useState('');
    const [srchType, setSrchType] = useState<any>('Shipper');
    const [srchShipperName, setSrchShipperName] = useState<any>('');
    const [filterList, setFilterList] = useState<{
        srchStartDate: Date | null,
        srchType: string,
        srchShipperName: string
    }>({
        srchStartDate: null,
        srchType: '',
        srchShipperName: ''
    });


    // ############### DATA TABLE ###############
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isIncludePtt, setIsIncludePtt] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataTable, setData] = useState<any>([]);
    const [dataTimestamp, setDataTimestamp] = useState<any>([]);
    const [dataHvType, setDataHvType] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);

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


        const getLastEmail = async () => {
        try {
            const res_send_email_data = await getService(`/master/balancing/balance-intraday-dashboard/send-email`);
            setDataSendEmail(res_send_email_data)
        } catch (error) {

        }
    }


        const openSendEmail = () => {
            setFillModal(uiFilter_)
            
           
            setFillModal({
                gasDay: srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                type: srchType,
                shipperName: srchShipperName,
            })
    
    
            getLastEmail()
            setMdSendEmail(true)
        };

        const handleSendEmail = async (data?: any) => {
        setIsLoading(false)

        data.exportFile = {
            bodys: bodyExport,
            filter: [
                "Time",
                "Plan/Actual", //fixed ต้องมี
                "Entry(MMBTU)",
                "Entry(MMBTU).East",
                "Entry(MMBTU).West",
                "Entry(MMBTU).East-West",
                "Exit(MMBTU)",
                "Exit(MMBTU).East",
                "Exit(MMBTU).West",
                "Exit(MMBTU).East-West",
                "Balancing Gas",
                "Balancing Gas.East",
                "Balancing Gas.West",
                "Balancing Gas.East-West",
                "Park/Unpark",
                "Park/Unpark.East",
                "Park/Unpark.West",
                "RA#6",
                "RA#6.Ratio East",
                "BVW#10",
                "BVW#10.Ratio East",
                "Shrinkage Gas & Others",
                "Shrinkage Gas & Others.East",
                "Shrinkage Gas & Others.West",
                "Shrinkage Gas & Others.East-West",
                "Change Min. Inventory",
                "Change Min. Inventory.East",
                "Change Min. Inventory.West",
                "Change Min. Inventory.East-West",
                "Imbalance",
                "Imbalance.East",
                "Imbalance.West",
                "Acc Imbalance (Meter) (MMBTU)",
                "Acc Imbalance (Meter) (MMBTU).East",
                "Acc Imbalance (Meter) (MMBTU).West",
                "Acc Imbalance (Inventory) (MMBTU)",
                "Acc Imbalance (Inventory) (MMBTU).East",
                "Acc Imbalance (Inventory) (MMBTU).West",
                "Total Imbalance",
                "% Total Imbalance",
                "System Level (East)",
                "System Level (East).Level",
                "System Level (East).%",
                "Order (East)",
                "Order (East).MMBTU",
                "Order (East).MMSCF",
                "System Level (West)",
                "System Level (West).Level",
                "System Level (West).%",
                "Order (West)",
                "Order (West).MMBTU",
                "Order (West).MMSCF",
                "Condition East",
                "Condition West"
            ]
        }

        try {
            const res_post_email: any = postService('/master/balancing/balance-intraday-dashboard/send-email', data)
            setTimeout(() => {
                setMdEmailSentSuccessOpen(true)
                setIsLoading(true)
                setMdSendEmail(false);
            }, 500);
        } catch (error) {

        }
    }

    // ############### REDUX DATA ###############
    useEffect(() => {
        if (forceRefetch || !shipperGroupData?.data) {
            dispatch(fetchShipperGroup());
        }

        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
        getPermissionDash();
    }, [dispatch, forceRefetch, shipperGroupData]);

    // #region FIELD SEARCH
    // ############### FIELD SEARCH ###############
    const handleFieldSearch = async () => {
        setUiFilter_({
            gasDay: srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
            type: srchType || "",
            shipperName: (userDT?.account_manage?.[0]?.group && userDT?.account_manage?.[0]?.user_type_id == 3) ? userDT?.account_manage?.[0]?.group?.id_name : srchShipperName || ""
        })
        setIsLoading(false);

        setFilterList({
            srchStartDate: srchStartDate,
            srchType: srchType,
            srchShipperName: (userDT?.account_manage?.[0]?.group && userDT?.account_manage?.[0]?.user_type_id == 3) ? userDT?.account_manage?.[0]?.group?.id_name : srchShipperName
        });

        // key shipper_id ---> 270625 : กรณีที่ TSO เข้ามาที่เมนูนี้ ให้เห็นเฉพาะข้อมูลของ Shipper (ที่เป็นรวม Shipper ทั้งหมด) ดูเป็นภาพรวม https://app.clickup.com/t/86etzbehm
        const body_main = {
            "gas_day": srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
            "skip": 0,
            "limit": 100,
            // "shipper_id": (userDT?.account_manage?.[0]?.group && userDT?.account_manage?.[0]?.user_type_id == 3) ? userDT?.account_manage?.[0]?.group?.id_name : null, // NGP-S01-002 str ไม่มีใส่ null
            "shipper_id": (userDT?.account_manage?.[0]?.group && userDT?.account_manage?.[0]?.user_type_id == 3) ? userDT?.account_manage?.[0]?.group?.id_name : srchShipperName, // NGP-S01-002 str ไม่มีใส่ null
            "execute_timestamp": srchTimeStamp ? srchTimeStamp : null,  // 1740687600 int ไม่มีใส่ null
            "lasted_version": true,
            "uiFilter": {
                gasDay: srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
                type: srchType || "",
                shipperName:(userDT?.account_manage?.[0]?.group && userDT?.account_manage?.[0]?.user_type_id == 3) ? userDT?.account_manage?.[0]?.group?.id_name : srchShipperName,
            }
        }

        setBodyExport(body_main)

        // MAIN DATA 
        const res_ = await postService('/master/balancing/balance-intraday-dashboard', body_main);

        // DATA TIMESTAMP
        const data_timestamp = Array.from(
            new Map(
                res_?.map((item: any) => [item.execute_timestamp, { timestamp: toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm'), execute_timestamp: item?.execute_timestamp }])
            ).values()
        );

        if (data_timestamp?.length > 0) {
            setDataTimestamp((prev: any[]) => {
                const existingModes = new Set(prev.map(item => item.timestamp));
                const newUniqueItems = data_timestamp.filter((item: any) => !existingModes.has(item.timestamp));
                return [...prev, ...newUniqueItems]; // เติมมันเข้าไป และเช็คซ้ำด้วย
            });
        }

        // หา lasted version
        let filtered_data: any = res_
        // กรองเฉพาะที่มี execute_timestamp ล่าสุด
        // if (watch('filter_last_version')) {
        //     const maxTimestamp = Math.max(...res_?.map((item: any) => item.execute_timestamp));
        //     filtered_data = res_?.filter((item: any) => item.execute_timestamp === maxTimestamp);
        // }

        setData(filtered_data)
        setFilteredDataTable(filtered_data)
        setCurrentPage(1);
        setTimeout(() => {
            setIsLoading(true);
        }, 1000);
    };

    const handleReset = async () => {
        setSrchStartDate(null)
        setSrchTimeStamp('')
        setSrchShipperName('')
        setValue('filter_last_version', false)

        fetchData();
        // setFilteredDataTable(dataTable)
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const planKeys = [
        "total_entry_east.value",
        "total_entry_west.value",
        "total_entry_east-west.value",
        "total_exit_east.value",
        "total_exit_west.value",
        "total_exit_east-west.value",
        "revserveBal_east.value",
        "revserveBal_west.value",
        "revserveBal_east-west.value",
        "park/unpark_east",
        "park/unpark_west",
        "park/unpark_east-west",
        "detail_entry_east-west_ra6Ratio.value",
        "detail_entry_east-west_bvw10Ratio.value",
        "shrinkage_others_east",
        "shrinkage_others_west",
        "shrinkage_others_east-west",
        "minInventoryChange_east.value",
        "minInventoryChange_west.value",
        "minInventoryChange_east-west.value",
        "dailyImb_east.value",
        "dailyImb_west.value",
        "accImb_east.value",
        "accImb_west.value",
        "dailyImb_total.value",
        "absimb.value",
        "system_level_east",
        "level_percentage_east.value",
        "energyAdjustIFOFO_east.value",
        "volumeAdjustIFOFO_east.value",
        "system_level_west",
        "level_percentage_west.value",
        "energyAdjustIFOFO_west.value",
        "volumeAdjustIFOFO_west.value",
        "condition_east.value",
        "condition_west.value"
    ];
    const actualKeys = [...planKeys];
    const normalize = (value: any): string => (typeof value === 'number' ? formatNumberFourDecimal(value) : value ?? "").toString().replace(/\s+/g, "").toLowerCase().trim();
    const normalize2 = (value: any): string => (typeof value === 'number' ? value : value ?? "").toString().replace(/\s+/g, "").toLowerCase().trim();
    const normalize3 = (value: any): string => (typeof value === 'number' ? formatNumberFourDecimalNoComma(value) : value ?? "").toString().replace(/\s+/g, "").toLowerCase().trim();
    const getNestedValue = (obj: any, path: string) => path.split(".").reduce((acc, key) => acc?.[key], obj);
    const normalizePercent = (value: any): string => {
        if (typeof value === 'number') {
            return (formatNumberFourDecimalNoComma(value) + '%')
                .toLowerCase()
                .replace(/\s+/g, '')
                .trim();
        }
        return (value ?? "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '')
            .trim();
    };

    const handleSearch = (query: string) => {
        const queryLower = query?.replace(/\s+/g, '')?.toLowerCase().trim();

        //fix for ==> https://app.clickup.com/t/86etnehq4 ให้สามารถ search คำว่า actual / plan ได้
        let srchtxtPlan: any = 'plan';
        let srchtxtActual: any = 'actual';

        const isSearchingActual = srchtxtActual?.toLowerCase().trim().includes(queryLower); // เกิด user search คำว่า actual
        const isSearchingPlan = srchtxtPlan?.toLowerCase().trim().includes(queryLower);  // เกิด user search คำว่า plan

        if (isSearchingActual == true && isSearchingPlan == false) {
            setFilteredDataTable(dataTable?.map((item: any) => { return ({ ...item, plan_: undefined }) }));
            return;
        } else if (isSearchingPlan == true && isSearchingActual == false) {
            setFilteredDataTable(dataTable?.map((item: any) => { return ({ ...item, actual_: undefined }) }));
            return;
        }

        //===================================================================================================

        if (!queryLower) {
            setFilteredDataTable(dataTable);
            return;
        }

        const filtered = dataTable?.filter((item: any) => {
            const normalizedQuery = queryLower;

            // gas_hour check
            if (normalize(item?.gas_hour).includes(normalizedQuery)) return true;

            // หาใน plan_
            if (planKeys.some((key) => normalize(getNestedValue(item?.plan_, key)).includes(normalizedQuery))) {
                return true;
            }
            if (planKeys.some((key) => normalize2(getNestedValue(item?.plan_, key)).includes(normalizedQuery))) {
                return true;
            }
            if (planKeys.some((key) => normalize3(getNestedValue(item?.plan_, key)).includes(normalizedQuery))) {
                return true;
            }

            // หาใน actual_
            if (actualKeys.some((key) => normalize(getNestedValue(item?.actual_, key)).includes(normalizedQuery))) {
                return true;
            }
            if (actualKeys.some((key) => normalize2(getNestedValue(item?.actual_, key)).includes(normalizedQuery))) {
                return true;
            }
            if (actualKeys.some((key) => normalize3(getNestedValue(item?.actual_, key)).includes(normalizedQuery))) {
                return true;
            }

            return false;
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // const handleSearchZ = (query: string) => {
    //     const queryLower = query
    //         ?.replace(/,/g, '')        // 🔥 FIX: กัน comma
    //         ?.replace(/\s+/g, '')
    //         ?.replace('%', '')
    //         ?.toLowerCase()
    //         .trim();

    //     let srchtxtPlan: any = 'plan';
    //     let srchtxtActual: any = 'actual';

    //     const isSearchingActual = srchtxtActual.includes(queryLower);
    //     const isSearchingPlan = srchtxtPlan.includes(queryLower);

    //     if (isSearchingActual && !isSearchingPlan) {
    //         setFilteredDataTable(dataTable?.map((item: any) => ({
    //             ...item,
    //             plan_: undefined
    //         })));
    //         return;
    //     } else if (isSearchingPlan && !isSearchingActual) {
    //         setFilteredDataTable(dataTable?.map((item: any) => ({
    //             ...item,
    //             actual_: undefined
    //         })));
    //         return;
    //     }

    //     if (!queryLower) {
    //         setFilteredDataTable(dataTable);
    //         return;
    //     }

    //     const isNumericSearch = !isNaN(Number(queryLower));

    //     // 🔥 FIX: match number ครบทุก format
    //     const matchNumber = (value: any) => {
    //         if (value === null || value === undefined) return false;

    //         const normalize = (val: any) =>
    //             String(val).replace(/,/g, '').trim();

    //         const stripZero = (val: string) =>
    //             val.replace(/\.?0+$/, '');

    //         const valueRaw = normalize(value);
    //         const valueStr = stripZero(valueRaw);

    //         const queryRaw = normalize(queryLower);
    //         const queryStr = stripZero(queryRaw);

    //         const hasDecimal = queryRaw.includes('.');

    //         // 🔥 decimal search
    //         if (hasDecimal) {
    //             const alt1 = queryStr.replace(/^0\./, '.');
    //             const alt2 = queryStr.replace(/^\./, '0.');

    //             return (
    //                 valueStr.includes(queryStr) ||
    //                 valueStr.includes(alt1) ||
    //                 valueStr.includes(alt2)
    //             );
    //         }
    //         //เช็ค . 🔥
    //         const decimalTail = valueStr.split('.')[1] || '';

    //         return (
    //             valueStr.startsWith(queryStr) ||
    //             decimalTail.startsWith(queryStr)
    //         );
    //     };

    //     const matchValue = (value: any) => {
    //         if (value === null || value === undefined) return false;

    //         if (isNumericSearch) {
    //             return matchNumber(value);
    //         }

    //         return (
    //             normalize(value)?.replace(/,/g, '').includes(queryLower) ||
    //             normalize3(value)?.replace(/,/g, '').includes(queryLower) ||
    //             normalizePercent(value)?.replace(/,/g, '').includes(queryLower)
    //         );
    //     };

    //     const result = dataTable
    //         ?.map((item: any) => {

    //             // ✅ gas_hour
    //             const gasHourMatch = normalize(item?.gas_hour)
    //                 ?.replace(':', '')
    //                 ?.includes(queryLower.replace(':', ''));

    //             if (gasHourMatch) {
    //                 return item;
    //             }

    //             // 🔥 absimb priority (%)
    //             const planAbsimb = getNestedValue(item?.plan_, "absimb.value");
    //             const actualAbsimb = getNestedValue(item?.actual_, "absimb.value");

    //             const isPercentSearch = query.includes('%');

    //             if (isPercentSearch) {
    //                 const planMatch = matchValue(planAbsimb);
    //                 const actualMatch = matchValue(actualAbsimb);

    //                 if (!planMatch && !actualMatch) return null;

    //                 return {
    //                     ...item,
    //                     plan_: planMatch ? item.plan_ : undefined,
    //                     actual_: actualMatch ? item.actual_ : undefined
    //                 };
    //             }

    //             // 🔍 normal
    //             const planMatch = planKeys.some((key) =>
    //                 matchValue(getNestedValue(item?.plan_, key))
    //             );

    //             const actualMatch = actualKeys.some((key) =>
    //                 matchValue(getNestedValue(item?.actual_, key))
    //             );

    //             if (!planMatch && !actualMatch) return null;

    //             return {
    //                 ...item,
    //                 plan_: planMatch ? item.plan_ : undefined,
    //                 actual_: actualMatch ? item.actual_ : undefined
    //             };
    //         })
    //         .filter(Boolean);

    //     setCurrentPage(1);
    //     setFilteredDataTable(result);
    // };

    // ############### DATA TABLE ###############
    
        const handleSearchZ = (query: string) => {
        const queryLower = query
            ?.replace(/,/g, '')        // 🔥 FIX: กัน comma
            ?.replace(/\s+/g, '')
            ?.replace('%', '')
            ?.toLowerCase()
            .trim();

        let srchtxtPlan: any = 'plan';
        let srchtxtActual: any = 'actual';

        const isSearchingActual = srchtxtActual.includes(queryLower);
        const isSearchingPlan = srchtxtPlan.includes(queryLower);

        if (isSearchingActual && !isSearchingPlan) {
            setFilteredDataTable(dataTable?.map((item: any) => ({
                ...item,
                plan_: undefined
            })));
            return;
        } else if (isSearchingPlan && !isSearchingActual) {
            setFilteredDataTable(dataTable?.map((item: any) => ({
                ...item,
                actual_: undefined
            })));
            return;
        }

        if (!queryLower) {
            setFilteredDataTable(dataTable);
            return;
        }

        const isNumericSearch = !isNaN(Number(queryLower));

        // 🔥 FIX: match number ครบทุก format
        // const matchNumber = (value: any) => {
        //     if (value === null || value === undefined) return false;

        //     const normalize = (val: any) =>
        //         String(val).replace(/,/g, '').trim();

        //     const stripZero = (val: string) =>
        //         val.replace(/\.?0+$/, '');

        //     const valueRaw = normalize(value);
        //     const valueStr = stripZero(valueRaw);

        //     const queryRaw = normalize(queryLower);
        //     const queryStr = stripZero(queryRaw);

        //     const hasDecimal = queryRaw.includes('.');

        //     // 🔥 decimal search
        //     if (hasDecimal) {
        //         const alt1 = queryStr.replace(/^0\./, '.');
        //         const alt2 = queryStr.replace(/^\./, '0.');

        //         return (
        //             valueStr.includes(queryStr) ||
        //             valueStr.includes(alt1) ||
        //             valueStr.includes(alt2)
        //         );
        //     }
        //     //เช็ค . 🔥
        //     const decimalTail = valueStr.split('.')[1] || '';

        //     return (
        //         valueStr.startsWith(queryStr) ||
        //         decimalTail.startsWith(queryStr)
        //     );
        // };
        const matchNumber = (value: any): boolean => {
            if (value === null || value === undefined || value === '') {
                return false;
            }

            const cleanNumberText = (val: any): string => {
                return String(val)
                    .replace(/,/g, '')
                    .replace(/%/g, '')
                    .replace(/\s+/g, '')
                    .trim();
            };

            const removeTrailingZero = (val: string): string => {
                if (!val.includes('.')) return val;

                return val
                    .replace(/0+$/, '') // ตัด 0 ด้านหลัง
                    .replace(/\.$/, ''); // ถ้าเหลือจุดท้ายสุดให้ตัดออก
            };

            const queryRaw = cleanNumberText(queryLower);
            const queryWithoutZero = removeTrailingZero(queryRaw);

            const numericValue = Number(cleanNumberText(value));

            if (Number.isNaN(numericValue)) {
                return false;
            }

            /*
            * สร้างรูปแบบตัวเลขทั้งหมดที่หน้า UI อาจแสดง
            *
            * ตัวอย่าง value = -8.7978
            * raw       = -8.7978
            * 2 decimal = -8.80
            * 4 decimal = -8.7978
            * 6 decimal = -8.797800
            */
            const candidates = [
                cleanNumberText(value),
                numericValue.toString(),
                numericValue.toFixed(2),
                numericValue.toFixed(4),
                numericValue.toFixed(6),

                // กรณี formatter ใส่ comma
                cleanNumberText(formatNumberTwoDecimalNom(numericValue)),
                cleanNumberText(formatNumberFourDecimal(numericValue)),
                cleanNumberText(formatNumberFourDecimalNoComma(numericValue)),
            ];

            return candidates.some((candidate) => {
                const candidateRaw = cleanNumberText(candidate);
                const candidateWithoutZero = removeTrailingZero(candidateRaw);

                return (
                    // ค้นตามค่าที่แสดงตรง ๆ เช่น -8.80
                    candidateRaw.includes(queryRaw) ||

                    // รองรับค้น -8.8 แล้วเจอ -8.80
                    candidateWithoutZero.includes(queryWithoutZero)
                );
            });
        };

        const matchValue = (value: any) => {
            if (value === null || value === undefined) return false;

            if (isNumericSearch) {
                return matchNumber(value);
            }

            return (
                normalize(value)?.replace(/,/g, '').includes(queryLower) ||
                normalize3(value)?.replace(/,/g, '').includes(queryLower) ||
                normalizePercent(value)?.replace(/,/g, '').includes(queryLower)
            );
        };

        console.log(">>> dataTable", dataTable)
        const dataTable_ = dataTable?.map((d:any) => {

            return {
                ...d,
                actual_: {
                    ...d?.actual_,
                    system_level_east_: formatText(d?.actual_?.system_level_east),
                    system_level_west_: formatText(d?.actual_?.system_level_west),
                },
                plan_: {
                    ...d?.plan_,
                    system_level_east_: formatText(d?.plan_?.system_level_east),
                    system_level_west_: formatText(d?.plan_?.system_level_west),
                },
            }
        })
        // DIFFICULT DAY
        // formatText
        // system_level_east
        // : 
        // "DD"
        // system_level_west
        // : 
        // "IF"


        const result = dataTable_
            ?.map((item: any) => {

                // ✅ gas_hour
                const gasHourMatch = normalize(item?.gas_hour)
                    ?.replace(':', '')
                    ?.includes(queryLower.replace(':', ''));

                if (gasHourMatch) {
                    return item;
                }

                // 🔥 absimb priority (%)
                const planAbsimb = getNestedValue(item?.plan_, "absimb.value");
                const actualAbsimb = getNestedValue(item?.actual_, "absimb.value");

                const isPercentSearch = query.includes('%');

                if (isPercentSearch) {
                    const planMatch = matchValue(planAbsimb);
                    const actualMatch = matchValue(actualAbsimb);

                    if (!planMatch && !actualMatch) return null;

                    return {
                        ...item,
                        plan_: planMatch ? item.plan_ : undefined,
                        actual_: actualMatch ? item.actual_ : undefined
                    };
                }

                // 🔍 normal
                const deepSearch = (obj: any): boolean => {
                    if (obj === null || obj === undefined) return false;

                    // primitive
                    if (typeof obj !== "object") {
                        return matchValue(obj);
                    }

                    // array
                    if (Array.isArray(obj)) {
                        return obj.some((item) => deepSearch(item));
                    }

                    // object
                    return Object.values(obj).some((value) => deepSearch(value));
                };

                const planMatch =
                    planKeys.some((key) =>
                        matchValue(getNestedValue(item?.plan_, key))
                    ) || deepSearch(item?.plan_);

                const actualMatch =
                    actualKeys.some((key) =>
                        matchValue(getNestedValue(item?.actual_, key))
                    ) || deepSearch(item?.actual_);

                if (!planMatch && !actualMatch) return null;

                return {
                    ...item,
                    plan_: planMatch ? item.plan_ : undefined,
                    actual_: actualMatch ? item.actual_ : undefined
                };
            })
            .filter(Boolean);
        console.log('result : ', result);
        setCurrentPage(1);
        setFilteredDataTable(result);
    };

        const formatText = (text?: any) => {
        // DD = DIFFICULT DAY FLOW,OFO = OPERATION FLOW, IF = INSTRACTED FLOW

        switch (text) {
            case 'DD':
                // return "DIFFICULT DAY FLOW"
                return "DIFFICULT DAY"
            case 'OFO':
                // return "OPERATION FLOW"
                return "OPERATION FLOW ORDER"
            case 'IF':
                return "INSTRACTED FLOW"
            default:
                return text
        }
    }

    const fetchData = async () => {
        setValue('filter_last_version', true)

        try {
            setIsLoading(false)

            // DATA HV TYPE
            const res_hv_type = await getService(`/master/hv-for-peration-flow-and-instructed-flow/hv-type`); // shipper, system
            setDataHvType(res_hv_type)

            // DATA Shipper Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // key shipper_id ---> 270625 : กรณีที่ TSO เข้ามาที่เมนูนี้ ให้เห็นเฉพาะข้อมูลของ Shipper (ที่เป็นรวม Shipper ทั้งหมด) ดูเป็นภาพรวม https://app.clickup.com/t/86etzbehm
            const body_main = {
                "gas_day": dayjs().format("YYYY-MM-DD"),
                "skip": 0,
                "limit": 100,
                // "shipper_id": userDT?.account_manage?.[0]?.group ? userDT?.account_manage?.[0]?.group?.id_name : null, // NGP-S01-002 str ไม่มีใส่ null
                "shipper_id": (userDT?.account_manage?.[0]?.group && userDT?.account_manage?.[0]?.user_type_id == 3) ? userDT?.account_manage?.[0]?.group?.id_name : null, // NGP-S01-002 str ไม่มีใส่ null
                "execute_timestamp": null,  // 1740687600 int ไม่มีใส่ null
                "lasted_version": true,
                "uiFilter": {
                    gasDay: srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY"),
                    type: srchType || "",
                    shipperName: userDT?.account_manage?.[0]?.group?.id_name || "",
                }
            }
            setBodyExport(body_main)

            // MAIN DATA
            const response = await postService('/master/balancing/balance-intraday-dashboard', body_main);

            // DATA TIMESTAMP
            const data_timestamp = Array.from(
                new Map(
                    response?.map((item: any) => [item.execute_timestamp, { timestamp: toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm'), execute_timestamp: item?.execute_timestamp }])
                ).values()
            );
            if (data_timestamp?.length > 0) {
                setDataTimestamp(data_timestamp);
            }

            // https://app.clickup.com/t/86etye55p 250625 : Default Checkbox Lasted Version
            let filtered_data: any = response
            // กรองเฉพาะที่มี execute_timestamp ล่าสุด

            // if (watch('filter_last_version')) {
            //     const maxTimestamp = Math.max(...response?.map((item: any) => item.execute_timestamp));
            //     filtered_data = response?.filter((item: any) => item.execute_timestamp === maxTimestamp);
            // }

            setData(filtered_data);
            setFilteredDataTable(filtered_data);

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

    // ############### PAGINATION DETAIL TOTAL ###############
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        // { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'time', label: 'Time', visible: true },

        // Entry(MMBTU)
        { key: 'entry_mmbtu', label: 'Entry (MMBTU)', visible: true },
        { key: 'east_total_entry_mmbtud', label: 'East', visible: true, parent_id: 'entry_mmbtu' },
        { key: 'west_total_entry_mmbtud', label: 'West', visible: true, parent_id: 'entry_mmbtu' },
        { key: 'east_west_total_entry_mmbtud', label: 'East-West', visible: true, parent_id: 'entry_mmbtu' },

        //  Exit (MMBTU)
        { key: 'exit_mmbtu', label: 'Exit (MMBTU)', visible: true },
        { key: 'east_total_exit_mmbtu', label: 'East', visible: true, parent_id: 'exit_mmbtu' },
        { key: 'west_total_exit_mmbtu', label: 'West', visible: true, parent_id: 'exit_mmbtu' },
        { key: 'east_west_total_exit_mmbtu', label: 'East-West', visible: true, parent_id: 'exit_mmbtu' },

        //  Balancing Gas
        { key: 'balancing_gas', label: 'Balancing Gas', visible: true },
        { key: 'east_total_balancing_gas', label: 'East', visible: true, parent_id: 'balancing_gas' },
        { key: 'west_total_balancing_gas', label: 'West', visible: true, parent_id: 'balancing_gas' },
        { key: 'east_west_total_balancing_gas', label: 'East-West', visible: true, parent_id: 'balancing_gas' },

        //  Park/Unpark
        { key: 'park_unpark', label: 'Park/Unpark', visible: true },
        { key: 'east_total_park_unpark', label: 'East', visible: true, parent_id: 'park_unpark' },
        { key: 'west_total_park_unpark', label: 'West', visible: true, parent_id: 'park_unpark' },

        { key: 'ra6', label: 'RA#6', visible: true },
        { key: 'ra6_ratio', label: 'Ratio East', visible: true, parent_id: 'ra6' },

        { key: 'bvw10', label: 'BVW#10', visible: true },
        { key: 'bvw10_ratio', label: 'Ratio East ', visible: true, parent_id: 'bvw10' },

        //  Shrinkage Gas & Others
        { key: 'shrinkage_gas_and_other', label: 'Shrinkage Gas & Others', visible: true },
        { key: 'east_total_shrinkage_gas_and_other', label: 'East', visible: true, parent_id: 'shrinkage_gas_and_other' },
        { key: 'west_total_shrinkage_gas_and_other', label: 'West', visible: true, parent_id: 'shrinkage_gas_and_other' },
        { key: 'east_west_total_shrinkage_gas_and_other', label: 'East-West', visible: true, parent_id: 'shrinkage_gas_and_other' },

        //  Shrinkage Gas & Others
        { key: 'change_min_inventory', label: 'Change Min. Inventory', visible: true },
        { key: 'east_total_change_min_inventory', label: 'East', visible: true, parent_id: 'change_min_inventory' },
        { key: 'west_total_change_min_inventory', label: 'West', visible: true, parent_id: 'change_min_inventory' },
        { key: 'east_west_total_change_min_inventory', label: 'East-West', visible: true, parent_id: 'change_min_inventory' },

        //  Shrinkage Gas & Others
        { key: 'imbalance', label: 'Imbalance', visible: true },
        { key: 'east_total_imbalance', label: 'East', visible: true, parent_id: 'imbalance' },
        { key: 'west_total_imbalance', label: 'West', visible: true, parent_id: 'imbalance' },

        //  Acc. Imbalance (Meter) (MMBTU)
        { key: 'acc_imbalance_meter_mmbtu', label: 'Acc. Imbalance (Meter) (MMBTU)', visible: true },
        { key: 'east_total_acc_imbalance_meter_mmbtu', label: 'East', visible: true, parent_id: 'acc_imbalance_meter_mmbtu' },
        { key: 'west_total_acc_imbalance_meter_mmbtu', label: 'West', visible: true, parent_id: 'acc_imbalance_meter_mmbtu' },

        { key: 'total_imbalance', label: 'Total Imbalance', visible: true },
        { key: 'percent_total_imbalance', label: '% Total Imbalance', visible: true },

        { key: 'system_level_east', label: 'System Level (East)', visible: true },
        { key: 'level_system_level_east', label: 'Level', visible: true, parent_id: 'system_level_east' },
        { key: 'percent_system_level_east', label: '%', visible: true, parent_id: 'system_level_east' },

        { key: 'order_east', label: 'Order (East)', visible: true },
        { key: 'order_east_mmbtu', label: 'MMBTU', visible: true, parent_id: 'order_east' },
        { key: 'order_east_mmscf', label: 'MMSCF', visible: true, parent_id: 'order_east' },

        { key: 'system_level_west', label: 'System Level (West)', visible: true },
        { key: 'level_system_level_west', label: 'Level', visible: true, parent_id: 'system_level_west' },
        { key: 'percent_system_level_west', label: '%', visible: true, parent_id: 'system_level_west' },

        { key: 'order_west', label: 'Order (West)', visible: true },
        { key: 'order_west_mmbtu', label: 'MMBTU', visible: true, parent_id: 'order_west' },
        { key: 'order_west_mmscf', label: 'MMSCF', visible: true, parent_id: 'order_west' },

        { key: 'condition_east', label: 'Condition East', visible: true },
        { key: 'condition_west', label: 'Condition West', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibilityNew, setColumnVisibilityNew] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );
    const filteredColumns = initialColumns;

    useEffect(() => {
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
            newState[columnKey] = newChecked;

            descendants.forEach((key: any) => {
                newState[key] = newChecked;
            });

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
        setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }, [filteredDataTable, currentPage, itemsPerPage])

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    useEffect(() => {
        // เช็คว่าชื่อ shipper มีคำว่า ptt อยู่หรือไม่ จะเอาไป validate สีคอลัม Order east west
        if (srchShipperName) {
            const find_shipper = dataShipper?.find((item: any) => item.id_name == srchShipperName)
            // const hasPTT = (find_shipper?.name ?? '').toLowerCase().includes('ptt');
            const hasPTT = (find_shipper?.id_name ?? '').trim().toLowerCase() === 'ngp-s16-001';

            setIsIncludePtt(hasPTT)
        }
    }, [srchShipperName])

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        isDefaultToday={true}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <InputSearch
                        id="searchType"
                        label="Type"
                        type="select"
                        value={srchType}
                        isDisabled={true}
                        onChange={(e) => setSrchType(e.target.value)}
                        options={dataHvType?.map((item: any) => ({
                            value: item.type,
                            label: item.type
                        }))}
                    />
 
                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 ?
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                value={srchShipperName}
                                isDisabled={srchType == undefined || srchType == '' || srchType == 'System' ? true : false}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        value: item.id_name,
                                        label: item.name,
                                    }))
                                }
                            />
                            :
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                isDisabled={true}
                                value={userDT?.account_manage?.[0]?.group?.id_name}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        // value: item.name,
                                        value: item.id_name,
                                        label: item.name,
                                    }))
                                }
                            />
                    }


                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                

                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* https://app.clickup.com/t/86eujrggq */}
                    {/* <BtnGeneral
                        textRender={"Send Email"}
                        iconNoRender={true}
                        bgcolor={"#1473A1"}
                        disable={paginatedData?.length <= 0 ? true : false}
                        generalFunc={() => openSendEmail()}
                        // can_create={userPermission ? userPermission?.f_export : false} // เดวปรับเป็น user_type = 2 (TSO) ให้เห็นตลอด
                        can_create={userDT ? userDT?.account_manage?.[0]?.user_type_id == 1 || userDT?.account_manage?.[0]?.user_type_id == 2 ? true : false : false} // เดวปรับเป็น user_type = 2 (TSO) ให้เห็นตลอด
                    /> */}

                    <BtnGeneral
                        textRender={"System Level"}
                        iconNoRender={true}
                        bgcolor={"#1473A1"}
                        generalFunc={() => {
                            router.push(`/en/authorization/balancing/balIntraAccImbDashboard?date=${dayjs(srchStartDate).format("YYYY-MM-DD")}`)
                        }}
                        can_create={userPermissionDash?.b_manage}
                    /> 
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4  rounded-xl shadow-sm">
                <div className="text-sm flex flex-wrap items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className=" text-xs">
                            {
                                userDT?.account_manage?.[0]?.user_type_id == 3 ?
                                `Gas Day: ${srchStartDate ? dayjs(srchStartDate).format("DD/MM/YYYY") : dayjs().format("DD/MM/YYYY")} | Type: Shipper | Shipper Name: ${userDT?.account_manage?.[0]?.group?.name || ""}`
                                :`Gas Day: ${uiFilter_?.gasDay || ""} | Type: Shipper | Shipper Name: ${dataShipper?.find((f: any) => f?.id_name === uiFilter_?.shipperName)?.name || ""}`
                            }
                            
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearchZ} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="balancing/balance-intraday-dashboard"
                            can_export={userPermission ? userPermission?.f_export : false}
                            disable={filteredDataTable?.length > 0 ? false : true}
                            columnVisibility={columnVisibilityNew}
                            initialColumns={initialColumns}
                            specificMenu='balance-intraday-dashboard-shipper'
                            specificData={bodyExport}

                        />
                    </div>
                </div>

                <TableMain
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibilityNew}
                    initialColumns={initialColumns}
                    userPermission={userPermission}
                    shipperGroupData={shipperGroupData?.data}
                    isIncludePtt={isIncludePtt}
                    // srchType={filterList?.srchShipperName ? filterList?.srchType : 'System'}
                    srchType={`Shipper`}
                    uiFilter_={uiFilter_?.shipperName}
                />

            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ModalSendEmail
                open={mdSendEmail}
                isLoading={isLoading}
                handleClose={() => setMdSendEmail(false)}
                onSubmitUpdate={(e: any) => handleSendEmail(e)}
                // data={dataReject}
                data={[]}
                dataEmail={dataSendEmail}
                mode={'xxxx'}
                fillModal={fillModal}
            />

            <ModalComponent
                open={mdEmailSentSuccessOpen}
                handleClose={() => setMdEmailSentSuccessOpen(false)}
                title="Success"
                description={`The email has been sent.`}
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
                initialColumns={initialColumns}
            />

        </div>
    );
};

export default ClientPage;