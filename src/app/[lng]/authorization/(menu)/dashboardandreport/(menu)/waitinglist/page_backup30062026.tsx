"use client";
import { useTranslation } from "@/app/i18n/client";
import { useEffect, useMemo, useRef, useState } from "react";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import {
  exportToExcel,
  findRoleConfigByMenuName,
  formatDate,
  generateUserPermission,
  toDayjs,
} from "@/utils/generalFormatter";
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData, encryptData } from "@/utils/encryptionData";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Spinloading from "@/components/other/spinLoading";
import BtnExport from "@/components/other/btnExport";
import AppTable, { sortingByDateFn } from "@/components/table/AppTable";
import { InputSearch } from "@/components/other/SearchForm";
import { ColumnDef } from "@tanstack/react-table";
import BtnGeneral from "@/components/other/btnGeneral";
import NodataTable from "@/components/other/nodataTable";
import {
  originalMenu,
  originalMenuWaitingList,
} from "@/components/headers/menuData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";

import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Link from "next/link";
import { MenuItem } from "@material-tailwind/react";
import { setCookie } from "@/utils/cookie";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { TooltipWrapper } from "@/components/other/tooltipSideMenu";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";

const webVersion = process.env.NEXT_PUBLIC_WEB_VERSION;

dayjs.extend(isSameOrBefore);

const newKeysBook = [
  "Capacity Contract List (Saved)",
  "Capacity Contract List (Confirmed)",
  "Capacity Contract Management (Saved)",
  "Capacity Contract Management (Confirmed)",
]

const newKeysEvent = [
  "Offspec Gas (Acknowledge)",
  "Emergency/Difficult Day (Acknowledge)",
  "OFO/IF (Acknowledge)"
];

const initialColumns: any = [
  { key: "login_mode", label: "Login Mode", visible: true },
  { key: "user_id", label: "User ID", visible: true },
  { key: "first_name", label: "First Name", visible: true },
  { key: "last_name", label: "Last Name", visible: true },
  { key: "type", label: "Type", visible: true },
  { key: "company_name", label: "Company/Group Name", visible: true },
  { key: "last_login", label: "Lasted Login", visible: true },
  { key: "last_login_duration", label: "Last Login Duration", visible: true },
];
interface ClientProps {
  params: {
    lng: string;
  };
}

const WAITING_LIST_MENUS = [
  "Capacity Management",
  "Allocation",
  "Nominations",
  "Event",
];

const ClientPage: React.FC<ClientProps> = (props) => {
  const router = useRouter();

  const userDT: any = getUserValue();
  const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
  useRestrictedPage(token);
  const [userPermission, setUserPermission] = useState<any>();
  let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const searchParams = useSearchParams();
  const filter_menu: any = searchParams.get("menu");
  //   console.log("filter_menu : ", filter_menu);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subMenu, setSubMenu] = useState<any[]>([]);
  const [toggleNav, setToggleNav] = useState<boolean>(true);
  const [menu_config, setmenu_config] = useState<any>();
  const [waitingListData, setWaitingListData] = useState<any>({});
  const [dataTable, setDataTable] = useState<any>([]);
  const [resetForm, setResetForm] = useState<() => void | null>();
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [activeButtonData, setActiveButtonData] = useState<any>();
  const [key, setKey] = useState(0);
  const [srchLginMode, setSrchLginMode] = useState<any>("");
  const [srchGroup, setSrchGroup] = useState<any>([]);
  const [srchType, setSrchType] = useState<any>([]);
  const [dataExport, setDataExport] = useState<any>([]);

  const [smartquery, setsmartquery] = useState<string>("");
  const [clearSmartQuery, setClearSmartQuery] = useState<boolean>(false);

  const [columnVisibility, setColumnVisibility] = useState<any>(
    Object.fromEntries(
      initialColumns.map((column: any) => [column.key, column.visible]),
    ),
  );

  const handleClick = (
    id: number | undefined,
    res_:any,
    subRes_?:any,
    res_main_data?:any,
  ) => {
    console.log('id : ', id);
      setActiveButton(id || null);
      const menuName =
        ((subRes_?.length > 0 ? subRes_ : subMenu))
          ?.find((item: any) => item.id === id)
          ?.name?.trim()
          ?.toUpperCase() ?? "";

      if (menuName == "LOGIN TRACKING") {
      
      } else {
        handleUpdateActiveButtonData({
          isFetchData: true,
          menuName: `${menuName}`,
          res_,
          res_main_data
        });
      }
    // }
  };

  const getPermission = () => {
    if (user_permission) {
      try {
        user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON s

        const permission = findRoleConfigByMenuName(
          "Dashboard & Report",
          userDT,
        );
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
  };

  const getLastLoginDuration = (row: any) => {
    let text = "";
    if (row?.login_logs?.length > 0) {
      const lastLogin = toDayjs(row?.login_logs[0]?.create_date);
      const now = toDayjs();
      let duration = now.diff(lastLogin, "month");
      if (duration > 0) {
        if (duration >= 12) {
          duration = now.diff(lastLogin, "year");
          text = `${duration} ${duration == 1 ? "year" : "years"}`;
        } else {
          text = `${duration} ${duration == 1 ? "month" : "months"}`;
        }
      } else {
        duration = now.diff(lastLogin, "day");
        text = `${duration} ${duration == 1 ? "day" : "days"}`;
      }
    }
    return text;
  };

  const getWL = async (text_:any) => {
      // menuName "Capacity Management"
      // menuName "Allocation"
      // menuName "Nominations"
      // menuName "Event"
    const res_main_data = await getService(`/master/waiting-list/v2?menuName=${text_}`);
    setWaitingListData((pre:any) => ({...pre, ...res_main_data,}));
  }

  const fetchData = async () => {
    try {
      const response: any = await getService(`/master/account-manage/account`);
      const data_res_user = response?.data.sort(
        (a: { update_date: string }, b: { update_date: string }) => {
          return (
            new Date(b.update_date).getTime() -
            new Date(a.update_date).getTime()
          );
        },
      );

      const newData: any = [];

      for (let index = 0; index < data_res_user?.length; index++) {
        newData.push({
          ...data_res_user[index],
          company_id: data_res_user[index]?.account_manage[0]?.group?.id,
          company_name: data_res_user[index]?.account_manage[0]?.group?.name,
          user_type: data_res_user[index]?.account_manage[0]?.user_type,
          login_mode: data_res_user[index]?.account_manage[0]?.mode_account,
        });
      }
      let res_main_data:any = []
      // res_main_data = await getService(`/master/waiting-list`);
      //   // console.log('res_main_data : ', res_main_data);
      // setWaitingListData(res_main_data);

      // const text_ = "Capacity Management"
      // res_main_data = await getService(`/master/waiting-list/v2?menuName=${text_}`);
      // setWaitingListData((pre:any) => ({...pre, ...res_main_data,}));
      // // const text_ = "Allocation"
      // // res_main_data = await getService(`/master/waiting-list/v2?menuName=${text_}`);
      // // setWaitingListData((pre:any) => ({...pre, ...res_main_data,}));
      // const text_ = "Nominations"
      // res_main_data = await getService(`/master/waiting-list/v2?menuName=${text_}`);
      // setWaitingListData((pre:any) => ({...pre, ...res_main_data,}));
      // // const text_ = "Event"
      // // res_main_data = await getService(`/master/waiting-list/v2?menuName=${text_}`);
      // // setWaitingListData((pre:any) => ({...pre, ...res_main_data,}));

      // setDataTable(newData);
      // setFilteredDataTable(newData);

      return res_main_data
    } catch (err) {
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const fetchWaitingListByMenu = async (menuName: string) => {
  try {
    const response = await getService(
      `/master/waiting-list/v2?menuName=${encodeURIComponent(menuName)}`,
    );

    // ใช้ functional update ป้องกัน response แต่ละเส้นเขียนทับกัน
    setWaitingListData((prev: any) => ({
      ...prev,
      ...(response ?? {}),
    }));

    return response;
  } catch (error) {
    console.error(`Waiting List "${menuName}" error:`, error);
    throw error;
  }
};

const fetchAllWaitingLists = () => {
  // ไม่ await เพื่อไม่ให้ขวาง fetchData หรือ getInit
  void Promise.allSettled(
    WAITING_LIST_MENUS.map((menuName) =>
      fetchWaitingListByMenu(menuName),
    ),
  ).then((results) => {
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Cannot load ${WAITING_LIST_MENUS[index]}`,
          result.reason,
        );
      }
    });
  });
};

  const getPathDetail = (key: string) => {
    
    const getDetailPath: any = activeButtonData[key];
    if (
      key == "Daily Query Shipper Nomination File" ||
      key == "Weekly Query Shipper Nomination File"
    ) {
      let tabIndex: any =
        key == "Daily Query Shipper Nomination File" ? "0" : "1";
      return `?status=${getDetailPath?.status}&tabselected=${tabIndex}`;
    }

    if (getDetailPath) {
      if (
        getDetailPath?.status &&
        getDetailPath?.startDate &&
        getDetailPath?.endDate
      ) {
        return `?status=${getDetailPath?.status}&start-date=${getDetailPath?.startDate}&end-date=${getDetailPath?.endDate}`;
      }

      if (getDetailPath?.status) {
        return `?status=${getDetailPath?.status}`;
      }
      return;
    }

    return null;
  };

  const detailCard = (key: string) => {
    const listDetail: any = [
      {
        key: "Release Capacity Management",
        desc: "This status means the request has been submitted and is awaiting approval from the TSO.",
      },
      {
        key: "Capacity Contract Management",
        desc: "This status means the request is pending approval from the TSO.",
      },
      {
        key: "Capacity Contract Management (Saved)",
        desc: "This status means the request is pending Saved.",
      },
      {
        key: "Capacity Contract Management (Confirmed)",
        desc: "This status means the request is pending Confirmed.",
      },
      {
        key: "Capacity Contract List",
        desc: "This status means the request is pending approval from the TSO.",
      },
      {
        key: "Capacity Contract List (Saved)",
        desc: "This status means the request is pending Saved.",
      },
      {
        key: "Capacity Contract List (Confirmed)",
        desc: "This status means the request is pending Confirmed.",
      },

      {
        key: "Allocation Review",
        desc: "status means the Shipper has successfully reviewed and confirmed the Allocated values.",
      },
      {
        key: "Allocation Management",
        desc: "This status means the Shipper has completed the review of the Allocated values, and the request is now pending review by the TSO.",
      },
      {
        key: "Daily Management",
        desc: "This status means the Shipper has completed the submission, and the request is now pending review by the TSO.",
      },
      {
        key: "Daily Adjustment",
        desc: "This status means the Shipper has submitted an adjustment, and the request is now pending review by the TSO.",
      },
      {
        key: "Weekly Management",
        desc: "This status means the Shipper has completed the submission, and the request is now pending review by the TSO.",
      },
      {
        key: "Daily Query Shipper Nomination File",
        desc: "This status means the Shipper has completed the submission, and the request is now pending review by the TSO.",
      },
      {
        key: "Weekly Query Shipper Nomination File",
        desc: "This status means the Shipper has completed the submission, and the request is now pending review by the TSO.",
      },
      {
        key: "Offspec Gas",
        desc: "This status means the Event document is not yet completed and is pending closure by the TSO.",
      },
      {
        key: "Emergency/Difficult Day",
        desc: "This status means the Event document is not yet completed and is pending closure by the TSO.",
      },
      {
        key: "OFO/IF",
        desc: "This status means the Event document is not yet completed and is pending closure by the TSO.",
      },
      {
        key: "Offspec Gas (Acknowledge)",
        desc: "This status means the Event document is not yet acknowledged by the Shipper.",
      },
      {
        key: "Emergency/Difficult Day (Acknowledge)",
        desc: "This status means the Event document is not yet acknowledged by the Shipper.",
      },
      {
        key: "OFO/IF (Acknowledge)",
        desc: "This status means the Event document is not yet acknowledged by the Shipper.",
      },
    ];

    const getDetail: any =
      listDetail?.find((item: any) => item?.key == key)?.desc || null;

    return getDetail;
  };

  const handleReset = async () => {
    setIsLoading(true);
    setSrchLginMode("");
    setSrchGroup([]);
    setSrchType([]);

    setKey((prevKey) => prevKey + 1);
    setTimeout(() => {
      setFilteredDataTable(dataTable);
      setIsLoading(false);
    }, 300);
  };

  const handleFieldSearch = () => {
    setIsLoading(true);

    const result = dataTable?.filter((item: any) => {
      return (
        (srchLginMode || srchLginMode !== ""
          ? srchLginMode == item?.login_mode?.id
          : true) &&
        (srchGroup?.length > 0
          ? srchGroup.includes(item?.company_name || "")
          : true) &&
        (srchType?.length > 0
          ? srchType.includes(item?.type_account?.name || "")
          : true)
      );
    });

    setFilteredDataTable(result);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleColumnToggle = (columnKey: any) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      ...columnKey,
    }));
  };

  function handleUpdateActiveButtonData({
    isFetchData = true,
    newData,
    menuName,
    query,
    res_,
    res_main_data,
  }: {
    isFetchData?: boolean;
    newData?: any;
    menuName: string;
    query?: string;
    res_?: any
    res_main_data?: any
  }) {
    
    const menuConfig: any = res_ ? res_[menuName as keyof typeof res_] : menu_config[menuName as keyof typeof menu_config];
    if (!menuConfig) {
      return;
    }

    let data: any = {};
    const updateData = newData ?? (res_main_data || waitingListData);
   
    let keys = Object.keys(updateData);
    if (newData) {
      const newskeys = Object.keys(newData);
      keys.push(...newskeys);
      keys = Array.from(new Set(keys));
    }

    let otherObj: any = [];

    const menu_ =
      menuName === "CAPACITY MANAGEMENT" ? [...menuConfig?.keys, ...newKeysBook]
      : menuName === "EVENT" ? [...menuConfig?.keys, ...newKeysEvent]
      : [...menuConfig?.keys];
    

    menu_.map((key: string) => {
      const targetKey = keys.find(
        (k: string) => k.trim().toUpperCase() === key.trim().toUpperCase(),
      );
      if (targetKey) {
        const value = updateData[targetKey];

        if (query) {
          if (
            key.includes(query.trim().toUpperCase()) ||
            (value?.remainingTasks && `${value.remainingTasks}`.includes(query))
          ) {
            data[targetKey] = value;
          }
        } else {
          data[targetKey] = value;
        }
      } else {
        const getEndpoint = menuConfig?.endpoints?.find(
          (d: any) => d?.key.trim().toUpperCase() === key.trim().toUpperCase(),
        );
        otherObj.push([getEndpoint?.key, { remainingTasks: 0 }]);
      }
    });
    let dataArray = Object.entries(data);
    let combinedArray = [...dataArray, ...otherObj];
    let resultObj = Object.fromEntries(combinedArray);
    setActiveButtonData(resultObj);
    setWaitingListData((prev: any) => ({
      ...prev,
      ...resultObj,
    }));

    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "login_mode",
        accessorFn: (row) => row?.login_mode?.name + " Mode" || "",
        header: "Login Mode",
        align: "center",
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          const generateLowercase: any =
            row?.account_manage[0]?.mode_account?.name == "SSO"
              ? row?.account_manage[0]?.mode_account?.name
              : row?.account_manage[0]?.mode_account?.name?.toLowerCase();
          return (
            <div
              className="flex justify-start items-center absolute !w-auto"
              style={{ transform: "translate(-8px, -13px)" }}
            >
              <div
                className="flex w-[100px] justify-center rounded-full p-1 text-[#464255] capitalize"
                style={{
                  backgroundColor: row?.status
                    ? row?.account_manage[0]?.mode_account.color
                    : "#EFECEC",
                }}
              >
                {generateLowercase} Mode
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "user_id",
        accessorFn: (row) => row.user_id || "",
        header: "User ID",
        width: 150,
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          // return (<div className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px]`}>{row?.user_id ? row?.user_id : ''}</div>)
          return (
            <div
              className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"} w-[150px] whitespace-normal break-all leading-snug`}
            >
              {row?.user_id ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "first_name",
        accessorFn: (row) => row.first_name || "",
        header: "First Name",
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          return (
            <div
              className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}
            >
              {row?.first_name ? row?.first_name : ""}
            </div>
          );
        },
      },
      {
        accessorKey: "last_name",
        accessorFn: (row) => row.last_name || "",
        header: "Last Name",
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          return (
            <div
              className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}
            >
              {row?.last_name ? row?.last_name : ""}
            </div>
          );
        },
      },
      {
        accessorKey: "type",
        accessorFn: (row) =>
          row?.type_account ? row?.type_account?.name || "" : "",
        header: "Type",
        align: "center",
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          return (
            row?.user_type && (
              <div
                className={`flex w-[100px] bg-[#EEE4FF] justify-center !text-[14px] rounded-full p-1 bg-opacity-50`}
                style={{
                  backgroundColor: row?.status
                    ? row?.type_account?.color
                    : "#EFECEC",
                  color: row?.status
                    ? row?.type_account?.color_text
                    : "#9CA3AF",
                }}
              >
                {row?.type_account?.name}
              </div>
            )
          );
        },
      },
      {
        accessorKey: "company_name",
        accessorFn: (row) => row.company_name || "",
        header: "Company/Group Name",
        width: 180,
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          return (
            <div
              className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}
            >
              {row?.company_name ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "last_login",
        accessorFn: (row) =>
          row?.login_logs?.length > 0
            ? formatDate(row?.login_logs[0]?.create_date)
            : "",
        sortingFn: (rowA, rowB, columnId) => {
          const logsA = rowA.original.login_logs;
          const logsB = rowB.original.login_logs;

          if (!logsA?.length && !logsB?.length) return 0;
          if (!logsA?.length) return 1; // rowB มาก่อน
          if (!logsB?.length) return -1; // rowA มาก่อน

          // เรียงจากล่าสุด → เก่า
          return sortingByDateFn(logsB[0]?.create_date, logsA[0]?.create_date);
        },
        header: "Lasted Login",
        width: 150,
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          return (
            <div
              className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}
            >
              {row?.login_logs?.length > 0
                ? formatDate(row?.login_logs[0]?.create_date)
                : ""}
            </div>
          );
        },
      },
      {
        accessorKey: "last_login_duration",
        accessorFn: (row) => getLastLoginDuration(row),
        sortingFn: (rowA, rowB, columnId) => {
          if (
            rowA.original.login_logs?.length < 1 &&
            rowB.original.login_logs?.length < 1
          )
            return 0;
          if (rowA.original.login_logs?.length < 1) return 1; // Valid dates come before nulls
          if (rowB.original.login_logs?.length < 1) return -1; // Nulls come before valid dates

          return sortingByDateFn(
            rowA.original.login_logs[0]?.create_date,
            rowB.original.login_logs[0]?.create_date,
          );
        },
        header: "Last Login Duration",
        width: 180,
        enableSorting: true,
        cell: (info) => {
          const row: any = info?.row?.original;
          const duration = getLastLoginDuration(row);

          return (
            <div
              className={`${row?.status ? "text-[#464255]" : "text-[#9CA3AF]"}`}
            >
              {duration}
            </div>
          );
        },
      },
    ],
    [userPermission, user_permission, dataTable],
  );

  const getInit = async () => {
    getPermission();
    let userData: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
    userData = userData ? decryptData(userData) : null;

    let account_manage;
    try {
      const parsedUserData = userData ? JSON.parse(userData) : null;
      account_manage = parsedUserData?.account_manage;
    } catch (error) {
      account_manage = null;
    }

    const menus_config =
      account_manage?.[0]?.account_role?.[0]?.role?.menus_config ?? [];

    const res_main_data = await fetchData();
    const {res_, subRes_} = await transformMENU(menus_config);
    if(filter_menu){
        handleClick(Number(filter_menu), res_, subRes_, res_main_data);
    }
  };

  const transformMENU = (data: any) => {
    const usePath = [
      {
        path: "release-capacity-management",
        key: "Release Capacity Management",
      },
      { path: "nomination-adjustment", key: "Daily Adjustment" },
      { path: "allocation-review", key: "Allocation Review" },
      { path: "allocation-management", key: "Allocation Management" },
      { path: "offspec-gas", key: "Offspec Gas" },
      { path: "emer", key: "Emergency/Difficult Day" },
      { path: "ofo", key: "OFO/IF" },
    ];

    const getMasterMENU = Object.fromEntries(
      originalMenuWaitingList.map((item: any) => {
        const getLeafMenus = (menu: any[]): any[] => {
          return menu.flatMap((m) => {
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

        leafMenus = leafMenus.filter((m) => {
          const match = data?.find(
            (d: any) =>
              d?.menus_id === m?.menus_config_id && d?.b_manage === true,
          );
          return !!match; // เก็บเฉพาะที่เจอ match และ b_manage = true
        });

        if (leafMenus.length === 0)
          return [item?.name?.toUpperCase(), { keys: [], endpoints: [] }];

        if (item?.menu?.some((m: any) => m?.menus_config_id === 64)) {
          const dailyMenus = leafMenus.filter((m) =>
            m?.url?.toLowerCase()?.includes("daily"),
          );
          const weeklyMenus = leafMenus.filter((m) =>
            m?.url?.toLowerCase()?.includes("weekly"),
          );

          const allMenus = [
            ...leafMenus.filter(
              (m) =>
                !m?.url?.toLowerCase()?.includes("daily") &&
                !m?.url?.toLowerCase()?.includes("weekly"),
            ),
            ...dailyMenus,
            ...weeklyMenus,
          ];

          let keys = allMenus
            .map((m) => m?.name?.toUpperCase())
            .filter(Boolean);

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
              path: "nominations/queryShipperNominationFile",
            },
            {
              key: "Weekly Query Shipper Nomination File",
              path: "nominations/queryShipperNominationFile",
            },
          ];

          const find64: any = endpoints?.find(
            (i: any) => i?.menus_config_id == 64,
          );

          customPath?.map((item: any) => {
            keys.push(item?.key?.toUpperCase());
            endpoints.push({
              path: find64?.path || null,
              url: find64?.url || null,
              key: item?.key || null,
              menus_config_id: find64?.menus_config_id || null,
            });
          });

          const resultKey: any = keys?.filter(
            (item: any) => item !== "QUERY SHIPPER NOMINATION FILE",
          );
          const resultEndPoints: any = endpoints?.filter(
            (item: any) => item?.key !== "Query Shipper Nomination File",
          );

          return [
            item?.name?.toUpperCase(),
            { keys: resultKey, endpoints: resultEndPoints },
          ];
        }

        const keys = leafMenus
          .map((m) => m?.name?.toUpperCase())
          .filter(Boolean);
        const endpoints = leafMenus.map((m) => {
          const checkPath: any = usePath?.find((d: any) => d?.key == m?.name);
          return {
            path: checkPath?.path || null,
            url: m?.url || null,
            key: m?.name || null,
            menus_config_id: m?.menus_config_id || null,
          };
        });

        const newEnpoint_Book = [
          {
            path: null,
            url: "booking/capacity/CapReqMgn",
            key: "Capacity Contract Management (Saved)",
            menus_config_id: 50,
          },
          {
            path: null,
            url: "booking/capacity/CapReqMgn",
            key: "Capacity Contract Management (Confirmed)",
            menus_config_id: 50,
          },
          {
            path: null,
            url: "booking/capacity/CapContractList",
            key: "Capacity Contract List (Saved)",
            menus_config_id: 53,
          },
          {
            path: null,
            url: "booking/capacity/CapContractList",
            key: "Capacity Contract List (Confirmed)",
            menus_config_id: 53,
          },
        ];

        const newEnpoint_Event = [
          {
            path: null,
            url: "event/EventOffSpecGas",
            key: "Offspec Gas (Acknowledge)",
            menus_config_id: 107,
          },
          {
            path: null,
            url: "event/EmergencyDifficultDay",
            key: "Emergency/Difficult Day (Acknowledge)",
            menus_config_id: 106,
          },
          {
            path: null,
            url: "event/OFIF",
            key: "OFO/IF (Acknowledge)",
            menus_config_id: 1013,
          },
        ];

        if (item?.name?.toUpperCase() === "CAPACITY MANAGEMENT") {
          return [
            item?.name?.toUpperCase(),
            {
              keys: [...keys, ...newKeysBook].map((m) => m?.toUpperCase()),
              endpoints: [...endpoints, ...newEnpoint_Book],
            },
          ];
        } else if (item?.name?.toUpperCase() === "EVENT") {
          return [
            item?.name?.toUpperCase(),
            {
              keys: [...keys, ...newKeysEvent].map((m) => m?.toUpperCase()),
              endpoints: [...endpoints, ...newEnpoint_Event],
            },
          ];
        } else {
          return [item?.name?.toUpperCase(), { keys, endpoints }];
        }
      }),
    );

    const getMenuList = [
      ...data
        .filter(
          (d: any) =>
            d?.menus_id === 1021 && // menu login
            d?.b_manage === true,
        )
        .map((d: any) => ({
          id: d.menus_id,
          name: d.menus
            ? d?.menus?.name.replace(/^Waiting List\s*/i, "") + " Tracking"
            : "",
          menuId: null,
        })),

      ...originalMenuWaitingList
        .filter((item) => {
          return data.some(
            (d: any) =>
              d?.menus_id === item?.menus_config_id && d?.b_manage === true,
          );
        })
        .map((item) => {
          return {
            id: item?.menus_config_id || null,
            name: item?.name || "",
            menuId: item?.id || "",
          };
        }),
    ];

    setmenu_config(getMasterMENU);
    setSubMenu(getMenuList);
    //   if (getMenuList?.length > 0) {
    //     handleClick(getMenuList[0]?.id);
    //   }
    return {
        res_: getMasterMENU,
        subRes_: getMenuList,
    }
  };

  useEffect(() => {
    getInit();
  }, [filter_menu]);


  return (
    <div className="h-[calc(100dvh-10%)] overflow-hidden">
      <div className="flex h-full gap-2 overflow-hidden">
        <NavMenuCustom
          toggleNav={toggleNav}
          setToggleNav={setToggleNav}
          subMenu={subMenu}
          isLoading={isLoading}
          handleClick={handleClick}
          activeButton={activeButton}
        />

        <div className="w-[80%] h-full border-[#DFE4EA] gap-2 pt-2 rounded-xl  flex flex-col overflow-hidden relative">
          <Spinloading spin={isLoading} rounded={20} />
          <div className="flex-1 px-4 overflow-hidden">
            <div className="space-y-2 ">
              {subMenu
                ?.find((item: any) => item.id === activeButton)
                ?.name?.trim()
                ?.toUpperCase() === "LOGIN TRACKING" ? (
                <div>
                  <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 shadow-md">
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
                        options={Array.from(
                          new Map(
                            (dataTable ?? []).map((item: any) => [
                              item.company_name,
                              item,
                            ]),
                          ).values(),
                        ).map((item: any) => ({
                          value: item.company_name,
                          label: item.company_name,
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
                      data={filteredDataTable}
                      columns={columns}
                      isLoading={!isLoading}
                      exportBtn={
                        <BtnGeneral
                          bgcolor={"#24AB6A"}
                          modeIcon={"export"}
                          textRender={"Export"}
                          generalFunc={() =>
                            exportToExcel(
                              dataExport,
                              "login-tracking",
                              columnVisibility,
                            )
                          }
                          can_export={
                            userPermission ? userPermission?.f_export : false
                          }
                        />
                      }
                      initialColumns={Object.fromEntries(
                        initialColumns.map((column: any) => [
                          column.key,
                          column.visible,
                        ]),
                      )}
                      onColumnVisibilityChange={(columnKey: any) =>
                        handleColumnToggle(columnKey)
                      }
                      onFilteredDataChange={(filteredData: any) => {
                        const newData = filteredData || [];
                        if (
                          JSON.stringify(dataExport) !== JSON.stringify(newData)
                        ) {
                          setDataExport(newData);
                        }
                      }}
                      defaultSorting={"last_login"}
                      onSortDataChange={(e) => setDataExport(e)}
                    />
                  </div>
                </div>
              ) : (
                <div className={`relative`}>
                  <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-end pb-4">
                    <div className="flex flex-wrap gap-2 justify-end">
                      {(activeButton == 105 || activeButton == 1021) && (
                        <SearchInput
                          onSearch={setsmartquery}
                          clear={clearSmartQuery}
                          onClear={() => {
                            setClearSmartQuery(false);
                            setsmartquery("");
                          }}
                        />
                      )}

                      <BtnGeneral
                        bgcolor={"#24AB6A"}
                        modeIcon={"export"}
                        textRender={"Export"}
                        width={100}
                        generalFunc={() => {
                          const menuName =
                            subMenu
                              ?.find((item: any) => item.id === activeButton)
                              ?.name?.trim()
                              ?.toLowerCase()
                              ?.replaceAll(" ", "_") ?? "";

                          exportToExcel(
                            Object.keys(activeButtonData).map((key: any) => {
                              return {
                                Name: key,
                                "Remaining tasks":
                                  activeButtonData[key]?.remainingTasks,
                              };
                            }),
                            `waitinglist_${menuName}`,
                          );
                        }}
                        can_export={
                          userPermission ? userPermission?.f_export : false
                        }
                      />
                    </div>
                  </div>

                  {activeButtonData && (
                    <div
                      className={`max-h-[calc(100dvh-220px)] overflow-x-auto no-scrollbar grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4`}
                    >
                      {Object.keys(activeButtonData)?.map((key: any) => {
                        const getKey: any = subMenu?.find(
                          (item: any) => item?.id == activeButton,
                        )?.name;

                        const getPath: any = [
                          ...menu_config[getKey?.toUpperCase()]?.endpoints,
                        ]?.find((item: any) => item?.key == key);

                        return (
                          <div
                            className=" border-[#1C1D220F] border-[2px] p-4 rounded-xl overflow-hidden h-[250px] cursor-pointer hover:shadow-[1px_1px_1px_inset_rgba(20,115,161,1)] duration-200 ease-in-out"
                            onClick={() => {
                              const getFilter = getPathDetail(getPath?.key);
                              if (getFilter) {
                                router.push(
                                  `/en/authorization/${getPath?.url}${getFilter}`,
                                );
                              } else {
                                router.push(
                                  `/en/authorization/${getPath?.url}`,
                                );
                              }
                            }}
                          >
                            <div className="h-[70%] w-full">
                              <p className="font-bold text-md text-[#58585A] line-clamp-2">
                                {key == "OF/IF" ? "OFO/IF" : key}
                              </p>
                              {activeButtonData[key]?.status && (
                                <div className="mb-3">{`Status : ${activeButtonData[key]?.status}`}</div>
                              )}
                              {detailCard(getPath?.key) && (
                                <div className="mb-6 opacity-70 text-sm">
                                  {detailCard(getPath?.key)}
                                </div>
                              )}
                            </div>
                            <div className="h-[30%] flex flex-column sm:flex-row flex-wrap items-end justify-between">
                              <div className="w-full h-full flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FormatListBulletedIcon
                                    style={{ fontSize: "12px" }}
                                  />
                                  <span className="text-sm text-[#1473A1]">
                                    Remaining tasks
                                  </span>
                                </div>

                                <div className="flex flex-wrap justify-end items-center font-bold text-5xl text-[#1473A1]">
                                  {activeButtonData[key]?.remainingTasks}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;

const NavMenuCustom = ({
  toggleNav,
  setToggleNav,
  subMenu,
  isLoading,
  handleClick,
  activeButton,
}: any) => {
  return (
    <nav
      className={`relative h-[calc(100vh-135px)] border-[#DFE4EA] border-[1px] p-2 rounded-tr-xl ${toggleNav ? "w-[250px] text-sm" : "w-[92px] text-[0px]"} duration-200 ease-in-out space-y-2`}
    >
      <div
        className={`absolute top-[20px] right-[-9px] border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white `}
        onClick={() => setToggleNav(!toggleNav)}
      >
        {toggleNav ? (
          <KeyboardArrowLeftIcon
            style={{ fontSize: "20px", marginBottom: "1px" }}
          />
        ) : (
          <KeyboardArrowRightIcon
            style={{ fontSize: "20px", marginBottom: "1px" }}
          />
        )}
      </div>

      <header className="whitespace-nowrap flex items-center gap-2 pl-[20px] !my-[20px]">
        {!toggleNav ? (
          <div>
            <div>
              <PieChartOutlineOutlinedIcon />
            </div>
            <div className="my-3">
              <hr className="border-[2px] border-[#F6F6F6] w-full mx-auto" />
            </div>
          </div>
        ) : (
          <>
            <PieChartOutlineOutlinedIcon />
            <div className="w-[120px] break-words whitespace-normal ">
              <h1 className="font-bold text-[18px]">{`Dashboard & Report`}</h1>
              <span className="text-[12px]">v.{webVersion}</span>
            </div>
          </>
        )}
      </header>

      <div className="h-[calc(100vh-245px)] flex flex-col overflow-hidden">
        <div className="overflow-y-auto h-full scrollbar-hide">
          <section
            className={`${!toggleNav ? "pl-[15px]" : "pl-[5px]"} relative pt-2 `}
          >
            <header
              className={`
                    relative
                    ${toggleNav ? "grid grid-cols-[80%_20%]" : "flex"}
                    items-center
                    rounded-md
                    cursor-pointer
                    w-full
                    pl-[5px] pr-[5px]
                    bg-[#F6F6F6]
                    ${!toggleNav ? "py-[0px]" : "py-[10px]"}
                    `}
            >
              <section className="flex items-center gap-2 py-1">
                {(toggleNav && <ViewAgendaOutlinedIcon />) || null}
                {toggleNav ? (
                  <h1
                    className={`break-words whitespace-normal text-[#757575] text-[12px]`}
                  >
                    <div
                      className={`flex justify-center items-center px-2 h-[26px] text-[#000000] text-[14px]`}
                    >
                      Waiting List
                    </div>
                  </h1>
                ) : (
                  <TooltipWrapper text={"Waiting List"} placement="right">
                    <h1 className="text-[#757575]">
                      <ViewAgendaOutlinedIcon />
                    </h1>
                  </TooltipWrapper>
                )}
              </section>
            </header>

            {toggleNav &&
              subMenu?.map(({ id, name }: any) => {
                return (
                  <div key={id} className="pt-[10px] pl-[10px] ">
                    {/* <span
                            className="absolute mt-1 left-0 top-[11px] -translate-y-1/2 border-b-2 border-l-2 rounded-bl-lg border-gray-300"
                            style={{ width: "15px", height: "15px" }}
                            /> */}
                    <div
                      onClick={() => {
                        if (!isLoading) {
                          setTimeout(() => {
                            handleClick(id);
                          }, 300);
                        }
                      }}
                      className={`text-sm flex justify-start items-center w-full px-4 rounded-[8px]
                                            ${activeButton === id ? " font-bold text-[#3083AC]" : " font-normal text-[#1C1D2280] hover:bg-[#3083AC26] hover:text-[#3083AC]"}
                                            ${isLoading ? "!cursor-wait" : "cursor-pointer"}
                                        `}
                    >
                      {name ?? ""}
                    </div>
                  </div>
                );
              })}
          </section>
        </div>
      </div>
    </nav>
  );
};
