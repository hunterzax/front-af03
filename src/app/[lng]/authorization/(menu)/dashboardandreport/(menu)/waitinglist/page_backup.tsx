import { useTranslation } from "@/app/i18n/client";
import { useEffect, useMemo, useState } from "react";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { exportToExcel, formatDate, generateUserPermission, toDayjs } from '@/utils/generalFormatter';
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import dayjs from "dayjs";
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import Spinloading from "@/components/other/spinLoading";
import BtnExport from "@/components/other/btnExport";
import AppTable, { sortingByDateFn } from "@/components/table/AppTable";
import { InputSearch } from "@/components/other/SearchForm";
import { ColumnDef } from "@tanstack/react-table";
import BtnGeneral from "@/components/other/btnGeneral";
import NodataTable from "@/components/other/nodataTable";
import { originalMenu, originalMenuWaitingList } from "@/components/headers/menuData";
import { useRouter } from "next/navigation";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";

dayjs.extend(isSameOrBefore);

interface ClientProps {
    params: {
        lng: string;
    };
}

// const menuForDisplayNotUse = [
//     // Module Capacity Management
//     'Capacity Contract Management', // Status : Waiting Approval
//     'Capacity Contract List',       // Status : Waiting Approval
//     'Path Management',
//     'Capacity Publication',
//     'Capacity Chart',
//     'Release Capacity Submission',
//     'Use it or Lose it',
//     'Release/UIOLI Summary Management',
//     'Reserve Balancing Gas Contracts',
//     'Release Capacity Management', // Status : Submitted

//     // Module Planning
//     'Planning File Submission Template',
//     `Query Shippers' Planning Files`,
//     'Planning Submission File',
//     'Dashboard',
//     'New Point',

//     // Module Nominaiton
//     'Nominations Dashboard',
//     'Submission File',
//     `Daily Query Shipper' Nomination File`,     // Status : Waiting For Response
//     `Weekly Query Shipper' Nomination File`,    // Status : Waiting For Response
//     'Daily Management',                         // Status : Waiting For Response
//     'Weekly Management',                        // Status : Waiting For Response
//     'Shipper Nomination Report',
//     'Daily Adjustment',                         // Status : Submitted
//     'Daily Adjustment Summary',
//     'Daily Adjustment Report',
//     'Parking Allocation',
//     'Upload Template For Shipper',
//     'Quality Planning',
//     'Quality Evaluation',
//     'Summary Nomination Report',
//     'Minimum Invetory Summary',

//     // Module Metering
//     'Metering Management',
//     'Metering Retrieving',
//     'Metering Checking',

//     // Module Allocation
//     'Allocation Review',            // Status : Shipper Reviewed
//     'Allocation Management',        // Status : Shipper Reviewed ตามแถวเขียว
//     'Allocation Query',
//     'Allocation Report',
//     'Curtailments Allocation',
//     'Allocation Monthly Report',
//     'Allocation Shipper Report',

//     // Module Balancing
//     'Vent/Commissioning/Other Gas',
//     'Operation Flow and Instructed Flow',
//     'Intraday Dashboard for Shipper',
//     'Intraday Dashboard',
//     'Closed Balancing Report',
//     'Intraday Balancing Report For Shipper',
//     'Intraday Balancing Report',
//     'Balance Report',
//     'Intraday Acc. Imbalance Inventory',
//     'Intraday Base Inventory',
//     'Intraday Base Inventory Shipper',
//     'Intraday Acc. Imbalance Dashboard',
//     'System Acc. Imbalance Inventory',
//     'Intraday Acc. Imbalance Inventory Adjust',
//     'Adjustment Daily Imbalance',
//     'Adjustment Accumulated Imbalance',
//     'Monthly Report',

//     // Module Tariff
//     'Tariff Charge Report',
//     'Credit/Debit Note',

//     // Module Event
//     'Offspec Gas',              // Event Status : Opened
//     'Emergency/Difficult Day',  // Event Status : Opened
//     'OF/IF',                    // Event Status : Opened
// ]

const ClientPage: React.FC<ClientProps> = (props) => {
    // const { params: { lng } } = props;
    // const { t } = useTranslation(lng, "mainPage");
    const router = useRouter();

    // #region CHECK AUTHEN
    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);
    // #endregion CHECK AUTHEN

    // #region PERMISSION
    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
// let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON s
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }
    // #endregion PERMISSION


    // #region CHANGE TAB HANDLE
    // ############### CHANGE TAB HANDLE ###############
    const [activeButtonData, setActiveButtonData] = useState<any>();
    const [activeButton, setActiveButton] = useState<number | null>(null);
    const [subMenu, setSubMenu] = useState<any[]>([]);

    const [menu_config, setmenu_config] = useState<any>();

    const handleClick = (id: number | undefined, row_id?: number) => {
        if (id !== activeButton) {
            setIsLoading(true);
            handleReset();

            setActiveButton(id || null);
            setsmartquery('')
            setClearSmartQuery(true)

            const menuName = subMenu?.find((item: any) => item.id === id)?.name?.trim()?.toUpperCase() ?? ''
            if (menuName == "LOGIN TRACKING") {
                setDataTable([]);
                setFilteredDataTable([]);
                fetchData();
            } else if (menuName && menuName !== "") {
                setActiveButtonData(undefined);
                handleUpdateActiveButtonData({
                    isFetchData: true,
                    menuName: `${menuName}`
                })
            }
        }
    };

    async function getSubMenu() {
        let userData: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
        userData = userData ? decryptData(userData) : null;

        let account_manage;
        try {
            const parsedUserData = userData ? JSON.parse(userData) : null;
            account_manage = parsedUserData?.account_manage;
        } catch (error) {
            // Failed to parse userData
            account_manage = null;
        }

        const menus_config = account_manage?.[0]?.account_role?.[0]?.role?.menus_config ?? [];

        await transformMENU(menus_config);
    }

    //#region TRANSFORM MENU
    const transformMENU = (data: any) => { // <---- data = ข้อมูลที่มากับ account
        const disabledMENU: string[] = [
            "PMIS GRAPHICS",
            "DASHBOARD & REPORT"
        ];

        //path api ที่มีอยู่แล้ว
        const usePath = [
            { path: 'release-capacity-management', key: 'Release Capacity Management' },
            { path: 'nomination-adjustment', key: 'Daily Adjustment' },
            { path: 'allocation-review', key: 'Allocation Review' },
            { path: 'allocation-management', key: 'Allocation Management' },
            { path: 'offspec-gas', key: 'Offspec Gas' },
            { path: 'emer', key: 'Emergency/Difficult Day' },
            { path: 'ofo', key: 'OF/IF' }
        ]

        // menu ที่จะเอาไว้
        // ตามรายละเอียด ---> https://docs.google.com/spreadsheets/d/1PpPmcGAo6dDe6orEyGzwLw4Z5PVuc9BpAgufAy7pegU/edit?pli=1&gid=0#gid=0
        const menuForDisplay = [
            // Module Capacity Management
            'Capacity Contract Management', // Status : Waiting Approval
            'Capacity Contract List',       // Status : Waiting Approval
            'Release Capacity Management', // Status : Submitted

            // Module Nominaiton
            `Query Shipper' Nomination File`,   // Status : Waiting For Response ---> ทั้ง tab daily, weekly
            'Daily Management',                 // Status : Waiting For Response
            'Weekly Management',                // Status : Waiting For Response
            'Daily Adjustment',                 // Status : Submitted

            // Module Allocation
            'Allocation Review',        // Status : Shipper Reviewed
            'Allocation Management',    // Status : Shipper Reviewed ตามแถวเขียว

            // Module Event
            'Off-spec Gas',         // Event Status : Opened
            'Emergency/Difficult Day',  // Event Status : Opened
            'OFO',                      // Event Status : Opened
        ]

        //สำหรับ render item ใน menu
        const getMasterMENU = Object.fromEntries(
            originalMenuWaitingList
                // 🔹 กรองเมนูระดับบนสุดที่ไม่อยู่ใน disabledMENU
                // .filter((item: any) => !disabledMENU.includes(item?.name?.toUpperCase()))
                .map((item: any) => {
                    // 🔹 ฟังก์ชันช่วยขุดหาเมนูที่ไม่มีลูก (และไม่อยู่ใน disabledMENU)
                    const getLeafMenus = (menu: any[]): any[] => {
                        return menu.flatMap((m) => {
                            // if (disabledMENU.includes(m?.name?.toUpperCase())) return [];

                            if (!m.menu || m.menu.length === 0) {
                                return [m];
                            }

                            return getLeafMenus(m.menu);
                        });
                    };

                    let leafMenus: any[] = [];

                    if (!item.menu || item.menu.length === 0) {
                        leafMenus = [item];
                    } else {
                        leafMenus = getLeafMenus(item.menu);
                    }

                    // 🔹 ฟิลเตอร์กันพลาด
                    // leafMenus = leafMenus.filter(
                    //     (m) => !disabledMENU.includes(m?.name?.toUpperCase())
                    // );

                    // 🔹 ตรวจสอบว่าใน data มี b_manage = true และ menus_id ตรงกันหรือไม่
                    leafMenus = leafMenus.filter((m) => {
                        const match = data?.find(
                            (d: any) =>
                                // d?.menus_id === m?.menus_config_id && d?.b_manage === true && d?.f_view === 1
                                d?.menus_id === m?.menus_config_id && d?.b_manage === true
                        );
                        return !!match; // เก็บเฉพาะที่เจอ match และ b_manage = true
                    });

                    // ถ้าไม่มีเมนูผ่านเงื่อนไขเลย ก็ไม่ต้อง return อะไร
                    if (leafMenus.length === 0) return [item?.name?.toUpperCase(), { keys: [], endpoints: [] }];

                    // ✅ เงื่อนไขพิเศษ: ถ้า menus_config_id = 64 → รวม daily / weekly เข้า NOMINATIONS เดิม
                    if (item?.menu?.some((m: any) => m?.menus_config_id === 64)) {

                        const dailyMenus = leafMenus.filter((m) =>
                            m?.url?.toLowerCase()?.includes("daily")
                        );
                        const weeklyMenus = leafMenus.filter((m) =>
                            m?.url?.toLowerCase()?.includes("weekly")
                        );

                        // รวมทั้งหมด (ทั้ง daily + weekly + อื่น ๆ)
                        const allMenus = [
                            ...leafMenus.filter(
                                (m) =>
                                    !m?.url?.toLowerCase()?.includes("daily") &&
                                    !m?.url?.toLowerCase()?.includes("weekly")
                            ),
                            ...dailyMenus,
                            ...weeklyMenus,
                        ];

                        let keys = allMenus.map((m) => m?.name?.toUpperCase()).filter(Boolean);

                        let endpoints = allMenus.map((m) => {
                            const checkPath: any = usePath?.find((d: any) => d?.key == m?.name);
                            return {
                                path: checkPath?.path || null,
                                url: m?.url || null,
                                key: m?.name || null,
                                menus_config_id: m?.menus_config_id || null,
                            };
                        });

                        let customPath: any = [
                            {
                                key: "Daily Query Shipper Nomination File",
                                path: 'nominations/queryShipperNominationFile'
                            },
                            {
                                key: "Weekly Query Shipper Nomination File",
                                path: 'nominations/queryShipperNominationFile'
                            }
                        ]

                        const find64: any = endpoints?.find((i: any) => i?.menus_config_id == 64);

                        customPath?.map((item: any) => {
                            keys.push(item?.key?.toUpperCase())
                            endpoints.push({
                                path: find64?.path || null,
                                url: find64?.url || null,
                                key: item?.key || null,
                                menus_config_id: find64?.menus_config_id || null,
                            })
                        });

                        const resultKey: any = keys?.filter((item: any) => item !== "QUERY SHIPPER NOMINATION FILE");
                        const resultEndPoints: any = endpoints?.filter((item: any) => item?.key !== "Query Shipper Nomination File");

                        return [item?.name?.toUpperCase(), { keys: resultKey, endpoints: resultEndPoints }];
                        // return [item?.name?.toUpperCase(), { keys, endpoints }];
                    }


                    // 🔹 สร้าง keys และ endpoints
                    const keys = leafMenus.map((m) => m?.name?.toUpperCase()).filter(Boolean);
                    const endpoints = leafMenus.map((m) => {
                        const checkPath: any = usePath?.find((d: any) => d?.key == m?.name)
                        return ({
                            path: checkPath?.path || null,
                            url: m?.url || null,
                            key: m?.name || null,
                            menus_config_id: m?.menus_config_id || null
                        })
                    });

                    return [item?.name?.toUpperCase(), { keys, endpoints }];
                })
        );

        //สำหรับ render menu
        const getMenuList = [
            ...data
                .filter((d: any) =>
                    d?.menus_id === 1021 && // menu login 
                    d?.b_manage === true
                    // d?.f_view === 1
                )
                .map((d: any) => ({
                    id: d.menus_id,
                    name: d.menus ? d?.menus?.name.replace(/^Waiting List\s*/i, "") + " Tracking" : ""
                })),

            ...originalMenuWaitingList
                // .filter(item => !disabledMENU.includes(item?.name?.toUpperCase()))
                .filter(item => {
                    return data.some((d: any) =>
                        d?.menus_id === item?.menus_config_id &&
                        d?.b_manage === true
                        // d?.f_view === 1
                    );
                })
                .map(item => {
                    return {
                        id: item?.menus_config_id || null,
                        name: item?.name || ""
                    };
                }),
            // เพิ่มรายการพิเศษจาก data ที่ไม่มีใน originalMenu (menus_id = 1021)
        ];

        setmenu_config(getMasterMENU)
        setSubMenu(getMenuList)
        if (getMenuList?.length > 0) {
            handleClick(getMenuList[0]?.id)
        }
    };

    function handleUpdateActiveButtonData({
        isFetchData = true,
        newData,
        menuName,
        query
    }: { isFetchData?: boolean, newData?: any, menuName: string, query?: string }) {
        const menuConfig = menu_config[menuName as keyof typeof menu_config];
        // const menuConfig = MENU_CONFIG[menuName as keyof typeof MENU_CONFIG];
        if (!menuConfig) {
            return;
        }

        if (isFetchData == true) {
            fetchSubMenuData(menuName, menuConfig?.endpoints);
        } else {
            let data: any = {};
            const updateData = newData ?? waitingListData;

            let keys = Object.keys(waitingListData)
            if (newData) {
                const newskeys = Object.keys(newData)
                keys.push(...newskeys)
                keys = Array.from(new Set(keys))
            }

            let otherObj: any = [];

            // Filter and map data based on configuration
            menuConfig?.keys.map((key: string) => {
                const targetKey = keys.find((k: string) => k.trim().toUpperCase() === key)
                if (targetKey) {
                    const value = updateData[targetKey] ?? waitingListData[targetKey]

                    if (query) {
                        if (key.includes(query.trim().toUpperCase()) || (value?.remainingTasks && `${value.remainingTasks}`.includes(query))) {
                            // data[targetKey] = value;
                            data[targetKey] = value;
                        }
                    }
                    else {
                        data[targetKey] = value;
                    }

                } else {
                    //BANGJU EDIT
                    const getEndpoint = menuConfig?.endpoints?.find((d: any) => d?.key.trim().toUpperCase() === key);
                    otherObj.push(
                        [getEndpoint?.key, { "remainingTasks": 0 }]
                    )
                }
            });

            let dataArray = Object.entries(data);
            let combinedArray = [...dataArray, ...otherObj];
            let resultObj = Object.fromEntries(combinedArray);

            setActiveButtonData(resultObj);
            setWaitingListData((prev: any) => ({
                ...prev,
                ...resultObj
            }));

            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }
    }
    // #endregion CHANGE TAB HANDLE

    // #region FIELD SEARCH
    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchLginMode, setSrchLginMode] = useState<any>('');
    const [srchGroup, setSrchGroup] = useState<any>([]);
    const [srchType, setSrchType] = useState<any>([]);


    const handleFieldSearch = () => {
        const result = dataTable?.filter((item: any) => {
            return (
                (srchLginMode || srchLginMode !== '' ? srchLginMode == item?.login_mode?.id : true) &&
                (srchGroup?.length > 0 ? srchGroup.includes(item?.company_name || '') : true) &&
                (srchType?.length > 0 ? srchType.includes(item?.type_account?.name || '') : true)
            );
        });

        setFilteredDataTable(result);
    };

    const handleReset = async () => {
        setIsLoading(true);
        setSrchLginMode('');
        setSrchGroup([]);
        setSrchType([])

        setKey((prevKey) => prevKey + 1);
        setTimeout(() => {
            setFilteredDataTable(dataTable);
            setIsLoading(false);
        }, 300);
    };

    // #endregion FIELD SEARCH



    // #region LIKE SEARCH
    // ############### LIKE SEARCH ###############
    const [smartquery, setsmartquery] = useState<string>('');
    const [clearSmartQuery, setClearSmartQuery] = useState<boolean>(false);

    useEffect(() => {
        const menuName = subMenu?.find((item: any) => item.id === activeButton)?.name?.trim()?.toUpperCase() ?? ''
        if (menuName && menuName !== "") {
            handleUpdateActiveButtonData({
                isFetchData: false,
                menuName: `${menuName}`,
                query: smartquery
            })
        }
    }, [smartquery])

    // #endregion LIKE SEARCH


    // #region DATA TABLE
    // ############### DATA TABLE ###############
    const [waitingListData, setWaitingListData] = useState<any>({});
    const [dataTable, setDataTable] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    // #region ON LOAD
    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/account-manage/account`);
            const data_res_user = response.sort((a: { update_date: string }, b: { update_date: string }) => {
                return new Date(b.update_date).getTime() - new Date(a.update_date).getTime();
            });

            const newData: any = [];

            for (let index = 0; index < data_res_user?.length; index++) {
                // item?.account_manage?.[0]?.mode_account?.name
                // let findRole: any = data_res_user[index]?.account_manage[0]?.account_role[0]?.role;
                newData.push({
                    ...data_res_user[index],
                    company_id: data_res_user[index]?.account_manage[0]?.group?.id,
                    company_name: data_res_user[index]?.account_manage[0]?.group?.name,
                    user_type: data_res_user[index]?.account_manage[0]?.user_type,
                    login_mode: data_res_user[index]?.account_manage[0]?.mode_account
                })
            }

            setDataTable(newData);
            setFilteredDataTable(newData);

            // MAIN DATA
            await getService(`/master/waiting-list`).then((res_main_data) => {
                setWaitingListData(res_main_data)
            })
            // const res_main_data = await getService(`/master/waiting-list`);
            // setWaitingListData(res_main_data)

        } catch (err) {
            // setError(err.message);
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    useEffect(() => {
        getPermission();
        getSubMenu()
    }, [])
    // #endregion ON LOAD

    const fetchSubMenuData = async (menuName: string, endPoint: any) => {
        const menuConfig = menu_config[menuName as keyof typeof menu_config];
        if (!menuConfig) return;

        try {
            // ใช้ Promise.all เพื่อรอให้ทุก request เสร็จพร้อมกัน
            const responses = await Promise.all(
                endPoint.map(async ({ path }: any) => {
                    const endpointConfig = menuConfig?.endpoints?.find((ep: any) => ep?.path && ep?.path === path);
                    if (!endpointConfig) return null;

                    try {
                        const res = await getService(`/master/waiting-list/${path}`);
                        if (res?.status !== 404) {
                            // ถ้ามี key ให้ wrap
                            if (endpointConfig.key) {
                                if (res == "" || res == undefined || res == null) {
                                    return { [endpointConfig.key]: null };
                                }
                                return { [endpointConfig.key]: res };
                            } else {
                                return res;
                            }
                        }
                        return null;
                    } catch (err) {
                        return null;
                    }
                })
            );


            // กรองค่าที่เป็น null ออก
            const newData = responses.filter(Boolean);

            // Update the data
            handleUpdateActiveButtonData({
                isFetchData: false,
                newData: newData,
                menuName: menuName,
            });
            return newData; // return เมื่อได้ครบทุก response แล้ว

        } catch (error) {
            return [];
        }

    };

    // #endregion DATA TABLE

    // #region COLUMN SHOW/HIDE POPOVER
    // ############### COLUMN SHOW/HIDE POPOVER ###############
    const initialColumns: any = [
        { key: 'login_mode', label: 'Login Mode', visible: true },
        { key: 'user_id', label: 'User ID', visible: true },
        { key: 'first_name', label: 'First Name', visible: true },
        { key: 'last_name', label: 'Last Name', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'company_name', label: 'Company/Group Name', visible: true },
        { key: 'last_login', label: 'Lasted Login', visible: true },
        { key: 'last_login_duration', label: 'Last Login Duration', visible: true }
    ];

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggle = (columnKey: any) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            ...columnKey
        }));
    };

    const getLastLoginDuration = (row: any) => {
        let text = ''
        if (row?.login_logs?.length > 0) {
            const lastLogin = toDayjs(row?.login_logs[0]?.create_date)
            const now = toDayjs()
            let duration = now.diff(lastLogin, 'month')
            if (duration > 0) {
                if (duration >= 12) {
                    duration = now.diff(lastLogin, 'year')
                    text = `${duration} ${duration == 1 ? 'year' : 'years'}`
                }
                else {
                    text = `${duration} ${duration == 1 ? 'month' : 'months'}`
                }
            }
            else {
                duration = now.diff(lastLogin, 'day')
                text = `${duration} ${duration == 1 ? 'day' : 'days'}`
            }
        }
        return text
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "login_mode",
                accessorFn: (row) => row?.login_mode?.name + " Mode" || '',
                header: "Login Mode",
                align: 'center',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    const generateLowercase: any = row?.account_manage[0]?.mode_account?.name == 'SSO' ? row?.account_manage[0]?.mode_account?.name : row?.account_manage[0]?.mode_account?.name?.toLowerCase();
                    return (
                        <div className="flex justify-start items-center absolute !w-auto" style={{ transform: 'translate(-8px, -13px)' }}>
                            <div
                                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255] capitalize"
                                style={{ backgroundColor: row?.status ? row?.account_manage[0]?.mode_account.color : '#EFECEC' }}>{generateLowercase} Mode</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "user_id",
                accessorFn: (row) => row.user_id || '',
                header: "User ID",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px]`}>{row?.user_id ? row?.user_id : ''}</div>)
                }
            },
            {
                accessorKey: "first_name",
                accessorFn: (row) => row.first_name || '',
                header: "First Name",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.first_name ? row?.first_name : ''}</div>)
                }
            },
            {
                accessorKey: "last_name",
                accessorFn: (row) => row.last_name || '',
                header: "Last Name",
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.last_name ? row?.last_name : ''}</div>)
                }
            },
            {
                accessorKey: "type",
                accessorFn: (row) => row?.type_account ? (row?.type_account?.name || '') : '',
                header: "Type",
                align: 'center',
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        row?.user_type &&
                        <div
                            className={`flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 bg-opacity-50`}
                            style={{
                                backgroundColor: row?.status ? row?.type_account?.color : '#EFECEC',
                                color: row?.status ? row?.type_account?.color_text : '#9CA3AF'
                            }}
                        >
                            {row?.type_account?.name}
                        </div>
                    )
                }
            },
            {
                accessorKey: "company_name",
                accessorFn: (row) => row.company_name || '',
                header: "Company/Group Name",
                width: 180,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.company_name ?? ''}</div>)
                }
            },
            {
                accessorKey: "last_login",
                accessorFn: (row) => row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : '',
                sortingFn: (rowA, rowB, columnId) => {

                    const logsA = rowA.original.login_logs;
                    const logsB = rowB.original.login_logs;

                    if (!logsA?.length && !logsB?.length) return 0;
                    if (!logsA?.length) return 1;  // rowB มาก่อน
                    if (!logsB?.length) return -1; // rowA มาก่อน

                    // เรียงจากล่าสุด → เก่า
                    return sortingByDateFn(logsB[0]?.create_date, logsA[0]?.create_date);
                },
                header: "Lasted Login",
                width: 150,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>{row?.login_logs?.length > 0 ? formatDate(row?.login_logs[0]?.create_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "last_login_duration",
                accessorFn: (row) => getLastLoginDuration(row),
                sortingFn: (rowA, rowB, columnId) => {

                    if (rowA.original.login_logs?.length < 1 && rowB.original.login_logs?.length < 1) return 0;
                    if (rowA.original.login_logs?.length < 1) return 1; // Valid dates come before nulls
                    if (rowB.original.login_logs?.length < 1) return -1;  // Nulls come before valid dates

                    return sortingByDateFn(rowA.original.login_logs[0]?.create_date, rowB.original.login_logs[0]?.create_date)
                },
                header: "Last Login Duration",
                width: 180,
                enableSorting: true,
                cell: (info) => {
                    const row: any = info?.row?.original
                    const duration = getLastLoginDuration(row)

                    return (
                        <div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}>
                            {duration}
                        </div>
                    )
                }
            }
        ],
        [userPermission, user_permission, dataTable]
    );
    // #endregion COLUMN SHOW/HIDE POPOVER

    const getPathDetail = (key: string) => {
        const getDetailPath: any = activeButtonData[key]
        //กรณีมี tab ด้วย
        if (key == "Daily Query Shipper Nomination File" || key == "Weekly Query Shipper Nomination File") {
            let tabIndex: any = key == "Daily Query Shipper Nomination File" ? '0' : '1'
            return `?status=${getDetailPath?.status}&tabselected=${tabIndex}`
        }

        // const getPathFilter = pathFilter?.find((item: any) => item?.key == key);
        if (getDetailPath) {
            //ถ้ามี start date กับ end date
            if (getDetailPath?.status && getDetailPath?.startDate && getDetailPath?.endDate) {
                return `?status=${getDetailPath?.status}&start-date=${getDetailPath?.startDate}&end-date=${getDetailPath?.endDate}`
            }

            if (getDetailPath?.status) {
                return `?status=${getDetailPath?.status}`
            }
            //ถ้ามีแค่ status อย่างเดียว
            return;
        }

        return null
    }

    const detailCard = (key: string) => {
        const listDetail: any = [
            {
                test2:'This status means the request has been submitted and is awaiting approval from the TSO.',
                test:'This status means the request is pending approval from the TSO.'
            }
        ]
    }

    return (
        <div className="h-[calc(100vh-135px)] overflow-hidden">
            <div className="flex h-full gap-2 overflow-hidden">
                {/* Sidebar (20%) */}
                <div className="w-[20%] border-[#DFE4EA] border-[1px] rounded-xl p-8 m-[4px] flex flex-col shadow-lg">
                    <div className="font-bold text-lg text-[#58585A] mb-8">{'Menu list'}</div>
                    {subMenu?.map(({ id, name }) => (
                        <div key={id} className="pb-2">
                            <div
                                // onClick={() => handleClick(id)}
                                onClick={() => {
                                    if (!isLoading) {
                                        setIsLoading(true)
                                        setTimeout(() => {
                                            handleClick(id)
                                        }, 300);
                                    }
                                }}
                                className={`flex justify-start items-center w-full h-[42px] px-4 rounded-[8px]
                                ${activeButton === id ? "bg-[#3083AC26] font-bold text-[#3083AC]" : "bg-[#FAFAFA] font-normal text-[#1C1D2280] hover:bg-[#3083AC26] hover:text-[#3083AC]"}
                                ${isLoading ? "!cursor-wait" : "cursor-pointer"}
                            `}
                            >
                                {name ?? ''}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content (80%) */}
                <div className="w-[80%] h-full border-[#DFE4EA] gap-2 pt-2 rounded-xl  flex flex-col overflow-hidden relative">
                    <Spinloading spin={isLoading} rounded={20} />
                    <div className="flex-1 px-4 overflow-hidden">
                        <div className="space-y-2 ">
                            {
                                subMenu?.find((item: any) => item.id === activeButton)?.name?.trim()?.toUpperCase() === "LOGIN TRACKING" ?
                                    <div>
                                        <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 shadow-md">
                                            {/* <button type="button" onClick={() => testrenderMail()}>test</button> */}

                                            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                                                <InputSearch
                                                    id="searchLginMode"
                                                    label="Login Mode"
                                                    type="select"
                                                    value={srchLginMode}
                                                    onChange={(e) => setSrchLginMode(e.target.value)}
                                                    options={[
                                                        { value: "1", label: "SSO" },
                                                        { value: "2", label: "LOCAL" },
                                                    ]}
                                                    placeholder="Select Login Mode"
                                                />

                                                <InputSearch
                                                    id="searchGroup"
                                                    label="Company/Group Name"
                                                    type="select-multi-checkbox"
                                                    value={srchGroup}
                                                    onChange={(e) => setSrchGroup(e.target.value)}
                                                    options={Array.from(new Map(
                                                        (dataTable ?? []).map((item: any) => [item.company_name, item])
                                                    ).values()).map((item: any) => ({
                                                        value: item.company_name,
                                                        label: item.company_name
                                                    }))}
                                                    placeholder="Select Company/Group Name"
                                                    customWidth={250}
                                                />

                                                <InputSearch
                                                    id="searchType"
                                                    label="Type"
                                                    type="select-multi-checkbox"
                                                    value={srchType}
                                                    onChange={(e) => setSrchType(e.target.value)}
                                                    options={[
                                                        { value: "Manual", label: "Manual" },
                                                        { value: "PTT", label: "PTT" },
                                                        { value: "TPA Website", label: "TPA Website" },
                                                    ]}
                                                    placeholder="Select Type"
                                                />

                                                <BtnSearch handleFieldSearch={handleFieldSearch} />
                                                <BtnReset handleReset={handleReset} />
                                            </aside>
                                        </div>

                                        <div className="h-[calc(100dvh-255px)] overflow-x-auto">
                                            <AppTable
                                                // border={false}
                                                data={filteredDataTable}
                                                columns={columns}
                                                isLoading={!isLoading}
                                                exportBtn={
                                                    <BtnExport
                                                        textRender={"Export"}
                                                        data={dataExport}
                                                        path="dam/users"
                                                        can_export={userPermission ? userPermission?.f_export : false}
                                                        columnVisibility={columnVisibility}
                                                        initialColumns={initialColumns}
                                                        fileName="waitinglist_login"
                                                    />
                                                }
                                                initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                                                onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                                                onFilteredDataChange={(filteredData: any) => {
                                                    const newData = filteredData || [];
                                                    // Check if the filtered data is different from current dataExport
                                                    if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                                                        setDataExport(newData);
                                                    }
                                                }}
                                                defaultSorting={'last_login'}
                                            />
                                        </div>
                                    </div>
                                    :
                                    <div className={`relative`}>
                                        <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-end pb-4">
                                            <div className="flex flex-wrap gap-2 justify-end">
                                                {(activeButton == 105 || activeButton == 1021) &&
                                                    <SearchInput
                                                        onSearch={setsmartquery}
                                                        clear={clearSmartQuery}
                                                        onClear={() => {
                                                            setClearSmartQuery(false)
                                                            setsmartquery('')
                                                        }}
                                                    />
                                                }

                                                <BtnGeneral
                                                    bgcolor={"#24AB6A"}
                                                    modeIcon={'export'}
                                                    textRender={"Export"}
                                                    width={100}
                                                    generalFunc={
                                                        () => {
                                                            const menuName =
                                                                subMenu
                                                                    ?.find((item: any) => item.id === activeButton)
                                                                    ?.name?.trim()
                                                                    ?.toLowerCase()
                                                                    ?.replaceAll(" ", "_") ?? "";


                                                            exportToExcel(
                                                                Object.keys(activeButtonData).map((key: any) => {
                                                                    return {
                                                                        'Name': key,
                                                                        'Remaining tasks': activeButtonData[key]?.remainingTasks,
                                                                    }
                                                                }),
                                                                `waitinglist_${menuName}`
                                                            )
                                                        }
                                                    }
                                                    can_export={userPermission ? userPermission?.f_export : false}
                                                />
                                            </div>
                                        </div>


                                        {/* {isLoading && Object.keys(activeButtonData).length == 0 && <NodataTable />} */}
                                        {activeButtonData &&
                                            (
                                                <div className={`max-h-[calc(100dvh-220px)] overflow-x-auto no-scrollbar grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`}>
                                                    {
                                                        Object.keys(activeButtonData)?.map((key: any) => {
                                                            return (
                                                                <div
                                                                    className=" border-[#1C1D220F] border-[2px] p-4 rounded-xl overflow-hidden h-[180px] cursor-pointer hover:shadow-[1px_1px_1px_inset_rgba(20,115,161,1)] duration-200 ease-in-out"
                                                                    onClick={() => {
                                                                        const getKey: any = subMenu?.find((item: any) => item?.id == activeButton)?.name;
                                                                        const getPath: any = menu_config[getKey?.toUpperCase()]?.endpoints?.find((item: any) => item?.key == key);

                                                                        const getFilter = getPathDetail(getPath?.key)
                                                                        if (getFilter) {
                                                                            router.push(`/en/authorization/${getPath?.url}${getFilter}`);
                                                                            // window.open(`/en/authorization/${getPath?.url}${getFilter}`, '_blank', 'noopener,noreferrer'); //TEST BLANK
                                                                        } else {
                                                                            router.push(`/en/authorization/${getPath?.url}`);
                                                                            // window.open(`/en/authorization/${getPath?.url}`); //TEST BLANK
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="h-[50%] w-full">
                                                                        <p className="font-bold text-md text-[#58585A] line-clamp-2">
                                                                            {key}
                                                                        </p>
                                                                        {activeButtonData[key]?.status && <div className="mb-8">{`Status : ${activeButtonData[key]?.status}`}</div>}
                                                                    </div>
                                                                    <div className="h-[50%] flex flex-column sm:flex-row flex-wrap items-end justify-between">
                                                                        <div className="w-full h-full flex items-center justify-between">
                                                                            <div className="flex items-center space-x-2">
                                                                                <FormatListBulletedIcon style={{ fontSize: "12px" }} />
                                                                                <span className="text-sm text-[#1473A1]">Remaining tasks</span>
                                                                            </div>

                                                                            <div className="flex flex-wrap justify-end items-center font-bold text-5xl text-[#1473A1]">
                                                                                {activeButtonData[key]?.remainingTasks}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                </div>
                                            )}
                                    </div>
                            }
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ClientPage;