"use client";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import SearchInput from "@/components/other/searchInput";
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import getLatestMatchingData, {
  fillMissingUpdateByAccount,
  filterStartEndDate,
  filterStartEndDateNewLogic,
  findRoleConfigByMenuName,
  formatDateNoTime,
  formatNumber,
  formatNumberThreeDecimal,
  formatNumberThreeDecimalNoComma,
  generateDayInMonth,
  generateNext10Years,
  generateNext12Months,
  generateUserPermission,
} from "@/utils/generalFormatter";
import { useFetchMasters } from "@/hook/fetchMaster";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import BtnGeneral from "@/components/other/btnGeneral";
import { Tab, Tabs } from "@mui/material";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import "./form/styles.css";
import GoogleMapComponent from "@/components/other/googleMap";
import TableCapPublic from "./form/table";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { InputSearch } from "@/components/other/SearchForm";
import { useAppDispatch } from "@/utils/store/store";
import ModalReason from "./form/modalReason";
import TableCapPublicDetail from "./form/tableDetail";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { addMonths } from "date-fns";
import BtnExport from "@/components/other/btnExport";
import YearPickaSearch from "@/components/library/dateRang/yearPicker";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import dayjs from "dayjs";
import { decryptData } from "@/utils/encryptionData";
import ColumnVisibilityPopoverMT from "@/components/other/popOverfor_mt_table";
import getUserValue from "@/utils/getuserValue";
import { exportAvailableCapacity, epCapacityPublicationYear, epCapacityPublicationMonth, epCapacityPublicationDay } from "@/utils/exportCapaPublication";
import Spinloading from "@/components/other/spinLoading";

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
  // let getuserDT: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
  // getuserDT = getuserDT ? decryptData(getuserDT) : null;
  // const userDT: any = getuserDT ? JSON.parse(getuserDT) : {};

  const [userMode, setUserMode] = useState<any>(
    userDT?.account_manage?.[0]?.user_type_id == "3" ? "view" : "edit"
  );

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>();
  let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

      // if (user_permission?.role_config) {
      //   const updatedUserPermission = generateUserPermission(user_permission);
      //   setUserPermission(updatedUserPermission);
      // } else {
      //   const permission = findRoleConfigByMenuName('Capacity Publication', userDT)
      //   setUserPermission(permission);
      // }

      const permission = findRoleConfigByMenuName('Capacity Publication', userDT)
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
  const { entryExitMaster, zoneMaster, areaMaster } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchEntryExit());
      dispatch(fetchZoneMasterSlice());
      dispatch(fetchAreaMaster());
    }
    if (forceRefetch) {
      setForceRefetch(false);
    }
  }, [dispatch, forceRefetch, entryExitMaster, zoneMaster, areaMaster]);

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [filteredDataTableDetail, setFilteredDataTableDetail] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  // const [maxDate, setMaxDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(addMonths(new Date(), 240));
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
  const [next10Years, setNext10Years] = useState<any>();
  const [next12Months, setNext12Months] = useState<any>();
  const [dayInMonth, setDayInMonth] = useState<any>();
  const [isSearch, setIsSearch] = useState<any>(false);
  const [key, setKey] = useState(0);

  const handleFieldSearch = async () => {
    console.log("handleFieldSearch");
    const requestedTab = tabIndex; // จำ tab ตอนเริ่ม fetch
    const currentYear = new Date().getFullYear()
    setIsLoading(false)
    // filter แล้วดึง api ใหม่เลย
    switch (tabIndex) {
      case 0:
        // const startYearSearch: any = srchStartDate ? new Date(srchStartDate).getFullYear() : null;
        // const endYearSearch: any = srchEndDate ? new Date(srchEndDate).getFullYear() : null;
        const startYearSearch: any = srchStartDate ? new Date(srchStartDate).getFullYear() : dayjs().format("YYYY");
        const endYearSearch: any = srchEndDate ? new Date(srchEndDate).getFullYear() : dayjs().add(10, "year").format("YYYY");
        const response_yearly: any = await getService(`/master/capacity-publication/yearly?startYear=${startYearSearch ? startYearSearch : currentYear}&endYear=${endYearSearch ? endYearSearch : startYearSearch}`);

        // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
        if (tabIndexRef.current !== requestedTab) return;
        
        setData(response_yearly);
        setFilteredDataTable(response_yearly);
        setTimeout(() => {
          setIsLoading(true)
        }, 300);
        break;
      case 1:
        const startMonthSearch = srchStartDate ? dayjs(srchStartDate).format("YYYY-MM") : null;
        const endMonthSearch = srchEndDate ? dayjs(srchEndDate).format("YYYY-MM") : null;
        // const startMonthSearch = srchStartDate ? new Date(srchStartDate).toISOString().slice(0, 7) : null;
        // const endMonthSearch = srchEndDate ? new Date(srchEndDate).toISOString().slice(0, 7) : null;

        const response_monthly: any = await getService(`/master/capacity-publication/monthly?startMonth=${startMonthSearch ? startMonthSearch : startMonth}&endMonth=${endMonthSearch ? endMonthSearch : endMonth}`);

        // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
        if (tabIndexRef.current !== requestedTab) return;
        
        setDataMonth(response_monthly);
        setFilteredDataTable(response_monthly);
        setTimeout(() => {
          setIsLoading(true)
        }, 300);
        break;
      case 2:
        let format_search = (srchStartDate ? dayjs(srchStartDate) : dayjs()).startOf("month").format("YYYY-MM-DD")
        const response_daily: any = await getService(`/master/capacity-publication/daily?date=${format_search}`);

        // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
        if (tabIndexRef.current !== requestedTab) return;
        
        setDataDaily(response_daily);
        setFilteredDataTable(response_daily)
  
        setTimeout(() => {
          setIsLoading(true)
        }, 300);
        break;
      default: // case 3
        // fetch detail

        const response_detail: any = await getService(`/master/capacity-publication/show-detail`);

        // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
        if (tabIndexRef.current !== requestedTab) return;
        
        setDataDetail(response_detail);

        // const res_filtered_date: any = filterStartEndDate(
        //   response_detail,
        //   srchStartDate,
        //   srchEndDate
        // );
        const res_filtered_date: any = filterStartEndDateNewLogic(response_detail, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTableDetail(res_filtered_date);

        setTimeout(() => {
          setIsLoading(true)
        }, 300);
        break;
    }

    // https://app.clickup.com/t/86er71e7q
    // Tab Yearly ถ้า Filter Start Date ปีไหน ในตารางต้องเรียง ค.ศ ตามนั้น +10 Y นับจากปีที่เลือก
    // ในกรณีไม่ได้เลือก End Year  แต่ถ้าเลือก Start - End ก็ต้องแสดงแค่ตามที่เลือก แต่ End ต้องเลือกสูงสุดได้ไม่เกิด +10 จาก Start
    // Tab Monthly Filter Start Month ในตารางเดือนต้องเริ่มตามเดือนที่เลือก https://app.clickup.com/t/86er71gva
    if (srchStartDate && !srchEndDate) {
      setNext10Years(generateNext10Years(srchStartDate));
      setNext12Months(generateNext12Months(srchStartDate));
      setDayInMonth(generateDayInMonth(srchStartDate));
    } else if (srchStartDate && srchEndDate) {
      setNext10Years(generateNext10Years(srchStartDate, srchEndDate));
      setNext12Months(generateNext12Months(srchStartDate, srchEndDate));
    }
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setIsSearch(true);

  };

  const handleReset = async (tricker?: any) => {
    console.log('handleReset');
    setNext10Years(generateNext10Years());
    setNext12Months(generateNext12Months());
    setDayInMonth(generateDayInMonth());
    setSrchStartDate(null);
    setSrchEndDate(null);

    setIsLoading(false)

    const requestedTab = tabIndex; // จำ tab ตอนเริ่ม fetch
    switch (tabIndex) {
      case 0: // Yearly
        setFilteredDataTable(dataTable);
        break;
      case 1: // Monthly
        setFilteredDataTable(dataTableMonth);
        break;
        case 2: // Daily
        setFilteredDataTable(dataTableDaily);

        // let format_query = dayjs().add(2, 'month').startOf("month").format("YYYY-MM-DD")

        // const preset_date_plus_two = new Date();
        // preset_date_plus_two.setMonth(preset_date_plus_two.getMonth() + 2);
        // setDayInMonth(generateDayInMonth(preset_date_plus_two));

        // const response_daily: any = await getService(`/master/capacity-publication/daily?date=${format_query}`);

        // // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
        // if (tabIndexRef.current !== requestedTab) return;

        // setDataDaily(response_daily);
        // setFilteredDataTable(response_daily);

        break;
      case 3: // detail
        const response_detail: any = await getService(`/master/capacity-publication/show-detail`);

        // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
        if (tabIndexRef.current !== requestedTab) return;
        
        setDataDetail(response_detail);
        setFilteredDataTableDetail(response_detail);

        // setFilteredDataTableDetail(dataTableDetail);
        break;
    }
    setIsSearch(false);

    if (tricker) {
      setTimeout(() => {
        setIsLoading(true)
      }, 500);
    }

    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {
    let dataFilter =
      tabIndex == 0
        ? dataTable
        : tabIndex == 1
          ? dataTableMonth
          : tabIndex == 2
            ? dataTableDaily
            : dataTableDetail;

    const filtered = dataFilter.filter((item: any) => {
      // V.2.0.109 Smart Search ยังไม่สามารถค้นหาค่าแบบไม่ใส่คอมม่าได้ https://app.clickup.com/t/86euzxxu3 
      const area_nom_cap_no_comma = item?.month_data?.flatMap((obj: any) => Object.values(obj).map((v: any) => v.area_nominal_capacity));
      const area_nom_cap_comma = item?.month_data?.flatMap((obj: any) => Object.values(obj).map((v: any) => formatNumberThreeDecimal(v.area_nominal_capacity)));
      const area_nom_cap_comma_decimal = item?.month_data?.flatMap((obj: any) => Object.values(obj).map((v: any) => formatNumberThreeDecimalNoComma(v.area_nominal_capacity)));

      const topLevelMatch =
        item?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        area_nom_cap_comma?.includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        area_nom_cap_no_comma?.includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        area_nom_cap_comma_decimal?.includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        item?.zone?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        item?.avaliable_capacity_mmbtu_d?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        formatNumberThreeDecimal(item?.avaliable_capacity_mmbtu_d)?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        formatNumberThreeDecimalNoComma(item?.avaliable_capacity_mmbtu_d)?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        item?.area?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase()) ||
        formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
        formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
        item?.area?.zone?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(query.replace(/\s+/g, "")?.toLowerCase());

      let nestedMatch;

      switch (tabIndex) {
        case 0:
          nestedMatch = item?.year_data?.some((subItem: any) => {
            return Object.entries(subItem).some(
              ([year, data]: [string, any]) => {
                return (
                  data?.area_nominal_capacity?.toString().replace(/\s+/g, "").trim().includes(query.replace(/\s+/g, "").trim()) ||
                  formatNumberThreeDecimal(data?.area_nominal_capacity)?.toString().includes(query.replace(/\s+/g, "").trim())
                )
              }
            );
          });
          break;

        case 1:
          nestedMatch = item?.month_data?.some((subItem: any) => {
            return Object.entries(subItem).some(
              ([year, data]: [string, any]) => {
                return (
                  data?.area_nominal_capacity?.toString().replace(/\s+/g, "").trim().includes(query.replace(/\s+/g, "").trim()) ||
                  formatNumberThreeDecimal(data?.area_nominal_capacity)?.toString().includes(query.replace(/\s+/g, "").trim())
                )
              }
            );
          });
          break;

        case 2:
          nestedMatch = item?.day_data?.some((subItem: any) => {
            return Object.entries(subItem).some(
              ([year, data]: [string, any]) => {
                return (
                  data?.area_nominal_capacity?.toString().replace(/\s+/g, "").trim().includes(query.replace(/\s+/g, "").trim()) ||
                  formatNumberThreeDecimal(data?.area_nominal_capacity)?.toString().includes(query.replace(/\s+/g, "").trim())
                )
              }
            );
          });
          break;
      }

      return topLevelMatch || nestedMatch;
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    if (tabIndex == 3) {
      setFilteredDataTableDetail(filtered);
    }
    setFilteredDataTable(filtered);
  };

  // ############### DATA TABLE ###############
  const [tabIndex, setTabIndex] = useState(1); // 0=yearly, 1=monthly, 2=daily Tab Monthly ต้อง Default M+2 นับจากเดือนปัจจุบัน ในกรณีที่ยังไม่ได้เลือก Filter และจะต้องแสดงเป็น Tab แรกเมื่อกดเข้ามาในเมนูนี้ https://app.clickup.com/t/86er7d7rj
  const tabIndexRef = useRef(tabIndex);
  const [dataTable, setData] = useState<any>([]);
  const [dataTableDetail, setDataDetail] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();

  const [dataTableMonth, setDataMonth] = useState<any>([]);
  const [dataTableDaily, setDataDaily] = useState<any>([]);

  const [tk, settk] = useState<boolean>(false);

  const handleChange = (event: any, newValue: any) => {
    // switch (newValue) {
    //   case 0:
    //     setFilteredDataTable(dataTable);
    //     break;
    //   case 1:
    //     setFilteredDataTable(dataTableMonth);
    //     break;
    //   case 2:
    //     setFilteredDataTable(dataTableDaily);
    //     break;
    //   default:
    //     break;
    // }
    setTabIndex(newValue);
  };

  const currentYear = new Date().getFullYear();
  const currentDate = new Date();
  const startMonth = currentDate.toISOString().slice(0, 7); // Format: "YYYY-MM"
  const endMonth = new Date(currentDate.setMonth(currentDate.getMonth() + 12))
    .toISOString()
    .slice(0, 7); // Format: "YYYY-MM"

  useEffect(() => {
    switch (tabIndex) {
      case 0:
        setFilteredDataTable(dataTable);
        break;
    }
  }, [dataTable])

  useEffect(() => {
    tabIndexRef.current = tabIndex;
  }, [tabIndex]);

  const fetchData = async () => {
    console.log('..');
    const requestedTab = tabIndex; // จำ tab ตอนเริ่ม fetch
    setIsLoading(false);
    setisLoadingTabs(true);

    try {
      setNext10Years(generateNext10Years());
      setNext12Months(generateNext12Months());
      setDayInMonth(generateDayInMonth());

      const preset_date_plus_two = new Date();
      preset_date_plus_two.setMonth(preset_date_plus_two.getMonth() + 2);
      setDayInMonth(generateDayInMonth(preset_date_plus_two));
      let format_query = dayjs().add(2, 'month').startOf("month").format("YYYY-MM-DD")

      const successLoad = () => {
        setIsLoading(true);
        setisLoadingTabs(false);
      }

      switch (tabIndex) {
        case 0:
          const response_yearly: any = await getService(`/master/capacity-publication/yearly?startYear=${currentYear}&endYear=${currentYear + 10}`);

          // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
          if (tabIndexRef.current !== requestedTab) return;
          
          setData(response_yearly);
          setFilteredDataTable(response_yearly);
          successLoad()
          break;
        case 1:
          const response_monthly: any = await getService(`/master/capacity-publication/monthly?startMonth=${startMonth}&endMonth=${endMonth}`);

          // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
          if (tabIndexRef.current !== requestedTab) return;
          
          setDataMonth(response_monthly);
          setFilteredDataTable(response_monthly);
          successLoad()
          break;
        case 2:
          const response_daily: any = await getService(`/master/capacity-publication/daily?date=${format_query}`);

          // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
          if (tabIndexRef.current !== requestedTab) return;
          
          setDataDaily(response_daily);
          successLoad()
          break;
        case 3:
          const response_detail: any = await getService(`/master/capacity-publication/show-detail`);

          // ถ้า user เปลี่ยน tab ไปแล้ว ให้ทิ้ง response นี้
          if (tabIndexRef.current !== requestedTab) return;
          
          setDataDetail(response_detail);
          setFilteredDataTableDetail(response_detail);
          successLoad()
          break;
      }

      settk(!tk);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (tabIndex == 2) {
      setFilteredDataTable(dataTableDaily);
    }
  }, [dataTableDaily, tabIndex])

  useEffect(() => {
    getPermission();
    fetchData();
  }, []);

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [modalMsg, setModalMsg] = useState<any>(
    "Your changes have been saved."
  );

  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const handleCloseModal = () => setModalSuccessOpen(false);
  const [modalErrorMsg, setModalErrorMsg] = useState("");
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  // const [dataFullExport, setdataFullExport] = useState([])
  const [sortedData, setSortedData] = useState<any>([]);
  const [sortedDataDetail, setSortedDataDetail] = useState<any>([]);

  const fdInterface: any = {
    area_id: "",
    zone_id: "",
    avaliable_capacitor_d: "",
    start_date: undefined,
    end_date: undefined,
  };
  const [formData, setFormData] = useState(fdInterface);

  const handleFormSubmit = async (data: any) => {
    delete data.zone_id;
    data.avaliable_capacitor_d = parseFloat(data.avaliable_capacitor_d);
    switch (formMode) {
      case "create":
        let res_create = await postService("/master/capacity-publication/detail", data);
        const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

        if (statusCode === 400 || statusCode === 500) {
          setFormOpen(false);
          setModalErrorMsg(errorMsg ? errorMsg : '');
          setModalErrorOpen(true);
        } else {
          setFormOpen(false);
          setModalMsg("Capacity adjusted.");
          setModalSuccessOpen(true);

          setIsLoading(false);
          await fetchData(); // fetch มันเยอะ ๆ fetch เข้าไป
        }

        break;
    }
    await fetchData(); // fetch มันเยอะ ๆ fetch เข้าไป
    if (resetForm) resetForm(); // reset form
  };

  // ############### UPDATE Remarks ###############
  const handleRemarkSubmit = async (data: any) => {

    switch (userMode) {
      case "edit":
        const { id, remark, start_date, end_date } = data;
        let body_post = {
          remark: remark,
          start_date: start_date + " 00:00:00",
          end_date: end_date + " 00:00:00",
        };

        let res_ = await putService(
          `/master/parameter/capacity-publication-remark-edit/${data?.id}`,
          body_post
        );
        const statusCodePut = res_?.response?.data?.statusCode ?? res_?.response?.data?.status ?? res_?.status ?? res_?.statusCode ?? res_?.code ?? res_?.response?.status;
        const errorMsgPut = res_?.response?.data?.error ?? res_?.data?.error ?? res_?.response?.error ?? res_?.error;

        if (statusCodePut === 400 || statusCodePut === 500) {
          setMdReasonView(false);
          setModalErrorMsg(errorMsgPut || '');
          setModalErrorOpen(true);
        } else {
          setMdReasonView(false);
          setModalMsg("Your Change has been saved.");
          setModalSuccessOpen(true);
        }
        break;
    }
    await fetchData();
    if (resetForm) resetForm(); // reset form
  };

  const openCreateForm = () => {
    setFormMode("create");
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openEditForm = (id: any) => { };
  const openViewForm = (id: any) => { };

  // ############### MODAL REASON ###############
  const [mdReasonView, setMdReasonView] = useState(false);
  const [dataReason, setDataReason] = useState<any>([]);

  // REASON VIEW
  const openReasonModal = async () => {
    const response: any = await getService(`/master/parameter/capacity-publication-remark`);
    response?.reverse();
    const result = getLatestMatchingData(response);

    setDataReason(result);
    setMdReasonView(true);
  };

  // ############### MODAL Adjust Available Capacity ###############
  const [mdAdjustCap, setMdAdjustCap] = useState(false);

  // REASON VIEW
  const openAdjustModal = async () => {
    setMdAdjustCap(true);
  };

  // ############### MODAL SUBMISSION COMMENTS ###############
  const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
  const [dataSubmission, setDataSubmission] = useState<any>([]);

  const openSubmissionModal = (id?: any, data?: any) => {
    const filtered = dataTable?.find((item: any) => item.id === id);
    setDataSubmission(filtered);
    setMdSubmissionView(true);
  };

  // ############### MODAL ALL FILES ###############
  const [mdFileView, setMdFileView] = useState<any>(false);
  const [dataFile, setDataFile] = useState<any>([]);

  const openAllFileModal = (id?: any, data?: any) => {
    const filtered = dataTable?.find((item: any) => item.id === id);
    setDataFile(filtered);
    setMdFileView(true);
  };

  // ############### HISTORY MODAL ###############
  const [historyOpen, setHistoryOpen] = useState(false);
  // const handleCloseHistoryModal = () => setHistoryOpen(false);
  const handleCloseHistoryModal = () => {
    setHistoryOpen(false);
    setTimeout(() => {
      setHistoryData(undefined);
    }, 300);
  }
  const [historyData, setHistoryData] = useState<any>();
  const [headData, setHeadData] = useState<any>();

  const openHistoryForm = async (id: any) => {
    try {
      const response: any = await getService(
        `/master/account-manage/history?type=nomination-deadline&method=all&id_value=${id}`
      );
      const valuesArray = response.map((item: any) => item.value);
      let mappings = [{ key: "process_type.name", title: "Process Type" }];
      let result = mappings.map(({ key, title }) => {
        const value = key
          .split(".")
          .reduce((acc, part) => acc && acc[part], valuesArray[0]);
        return {
          title,
          value: value || "",
        };
      });
      const normalized = fillMissingUpdateByAccount(valuesArray);

      setHeadData(result);
      // setHistoryData(valuesArray);
      setHistoryData(normalized);
      setHistoryOpen(true);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  };

  // ############### PAGINATION ###############
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const [paginatedData, setPaginatedData] = useState<any[]>([]);
  useEffect(() => {
    if (filteredDataTable && Array.isArray(filteredDataTable)) {
      setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    }
  }, [filteredDataTable, currentPage, itemsPerPage])

  const paginatedDataDetail = Array.isArray(filteredDataTableDetail)
    ? filteredDataTableDetail.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

  // ############### MODE SHOW DATA ###############
  // 1 = table, 2 = path detail
  const [divMode, setDivMode] = useState<any>("1");

  const filterData = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id);
    return filteredData;
  };

  const handlePathDetail = (id?: any) => {
    let data = filterData(id);
    setDataFile(data);
    setDivMode("2");
  };

  const handleContractClick = (id?: any) => {
    let data = filterData(id);
    setDataFile(data);
    setDivMode("3");
  };

  // ############### MAP SECTION ###############
  const [toggle, settoggle] = useState<boolean>(false);

  const bodyStyles: React.CSSProperties = {
    background: "url('/assets/image/map_bg_expand.png')",
    backgroundSize: "cover",
    backgroundPosition: "left",
    width: "100%",
    height: "65px",
    position: "relative",
    transition: "0.3s",
    borderRadius: "10px",
  };

  const overlayStyles: React.CSSProperties = {
    backgroundColor: "#00ADEF",
    opacity: 0.8, // Adjust opacity as needed for the tint effect
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    borderRadius: "10px",
  };

  const componentStyles: React.CSSProperties = {
    background: "#dedede",
    width: "100%",
    height: toggle ? "5px" : "300px",
    position: "relative",
    transition: "0.3s",
    marginTop: "30px",
    opacity: toggle ? "0%" : "100%",
    borderRadius: "10px",
  };

  const textStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    zIndex: 1, // Ensures text appears above the overlay
  };

  const getInitialColumns = (tabIndex: number) => {
    const initialColumns: any = [
      { key: "zone", label: "Zone", visible: true },
      { key: "area", label: "Area", visible: true },
      {
        key: "avaliable_capacity_mmbtu_d",
        label: "Available Capacity (MMBTU/D)",
        visible: true,
      },
      { key: "start_date", label: "Start Date", visible: true },
      { key: "end_date", label: "End Date", visible: true },
    ];

    // Add columns for the years in nnext10Years
    if (tabIndex == 0) {
      next10Years?.forEach((year: string) => {
        initialColumns.push({
          key: year,
          label: year,
          visible: true,
          parent_id: 'avaliable_capacity_mmbtu_d'
        });
      });
    } else if (tabIndex == 1) {
      next12Months?.forEach((month: string) => {
        initialColumns.push({
          key: month,
          label: month,
          visible: true,
          parent_id: 'avaliable_capacity_mmbtu_d'
        });
      });
    } else if (tabIndex == 2) {
      dayInMonth?.forEach((day: string) => {
        initialColumns.push({
          key: day,
          label: day,
          visible: true,
          parent_id: 'avaliable_capacity_mmbtu_d'
        });
      });
    }

    // Exclude 'start_date' and 'end_date' if tabIndex is 0, 1, or 2
    if ([0, 1, 2].includes(tabIndex)) {
      return initialColumns?.filter(
        (column: any) =>
          column.key !== "start_date" && column.key !== "end_date"
      );
    }

    return initialColumns;
  };

  let initialColumns = getInitialColumns(tabIndex);

  useEffect(() => {
    initialColumns = getInitialColumns(tabIndex);
    setColumnVisibility(
      Object.fromEntries(
        initialColumns.map((column: any) => [column.key, column.visible])
      )
    );

    setColumnVisibilityNew(
      Object.fromEntries(
        initialColumns.map((column: any) => [column.key, column.visible])
      )
    );

    setIsLoading(true)
    // tabIndex เปลี่ยน reset เลย
    // v1.0.85 ไม่ควรที่ blank ไปเฉยๆโดยที่ user ไม่ได้ทำอะไร https://app.clickup.com/t/86erm0qk0
    handleReset();
    fetchData();
  }, [tabIndex]);

  useEffect(() => {
    initialColumns = getInitialColumns(tabIndex);
    setColumnVisibility(
      Object.fromEntries(
        initialColumns.map((column: any) => [column.key, column.visible])
      )
    );

    setColumnVisibilityNew(
      Object.fromEntries(
        initialColumns.map((column: any) => [column.key, column.visible])
      )
    );

  }, [filteredDataTable]);

  useEffect(() => {
    initialColumns = getInitialColumns(tabIndex);
    setColumnVisibility(
      Object.fromEntries(
        initialColumns.map((column: any) => [column.key, column.visible])
      )
    );

    setColumnVisibilityNew(
      Object.fromEntries(
        initialColumns.map((column: any) => [column.key, column.visible])
      )
    );

  }, [isSearch]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = open ? "column-toggle-popover" : undefined;

  const [columnVisibility, setColumnVisibility] = useState<any>(
    Object.fromEntries(
      initialColumns.map((column: any) => [column.key, column.visible])
    )
  );

  const [columnVisibilityNew, setColumnVisibilityNew] = useState<any>(
    Object.fromEntries(
      initialColumns.map((column: any) => [column.key, column.visible])
    )
  );

  const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleColumnToggleNew = (columnKey: string) => {
    const dataFilter = initialColumns;
    const childColumns = dataFilter.filter((col: any) => col.parent_id === columnKey);
    const currentColumn = dataFilter.find((col: any) => col.key === columnKey);

    // Toggle child columns if any exist
    if (childColumns.length > 0) {
      setColumnVisibilityNew((prev: any) => {
        const updatedVisibility = { ...prev };
        childColumns.forEach((col: any) => {
          updatedVisibility[col.key] = !prev[columnKey];
        });
        return updatedVisibility;
      });
    }

    // Check if this column has a parent
    if (currentColumn?.parent_id) {
      const parentKey = currentColumn.parent_id;
      const isParentVisible = columnVisibilityNew[parentKey];
      const isCurrentVisible = columnVisibilityNew[columnKey];

      const siblings = dataFilter.filter((col: any) => col.parent_id === parentKey);

      // Count how many siblings are checked
      const checkedSiblingsCount = siblings.filter((col: any) => columnVisibilityNew[col.key]).length;

      setColumnVisibilityNew((prev: any) => ({
        ...prev,
        [parentKey]: checkedSiblingsCount === 1 && isCurrentVisible ? false : prev[parentKey],
      }));
    }

    // Toggle the clicked column itself
    setColumnVisibilityNew((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));

    // tab detail
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
    settk((prev: any) => !prev);
  };

  // ############### DRAWER ###############
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // const [selectedAreas, setSelectedAreas] = useState<any>([]);
  const [selectedAreas, setSelectedAreas] = useState<any>(areaMaster?.data?.map((area: any) => area.name));
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectArea = (name: any) => {
    if (selectedAreas.includes(name)) {
      setSelectedAreas(selectedAreas.filter((f: any) => f !== name));
    } else {
      setSelectedAreas([...selectedAreas, name]);
    }
  };

  const handleSelectAll = () => {
    // if (selectedAreas.length === dataTable?.length) {
    if (selectedAreas.length === areaMaster?.data?.length) {
      setSelectedAreas([]); // Deselect all
    } else {
      // setSelectedAreas(dataTable?.map((area: any) => area.name)); // Select all
      setSelectedAreas(areaMaster?.data?.map((area: any) => area.name)); // Select all
    }
  };

  const handleSelectAllCyberpunk = (filteredAreas?: any) => {
    // let filtered = areaMaster?.data?.filter((item:any) => filteredAreas.includes(item.name));

    setSelectedAreas(areaMaster?.data?.map((area: any) => area.name)); // Select all
    // setSelectedAreas(filtered)
  }

  const filteredAreas = areaMaster?.data?.filter((area: any) =>
    area.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const prevFilteredAreas = useRef(filteredAreas);

  useEffect(() => {
    // เช็คว่ามีการเปลี่ยนแปลงจริงก่อนเรียก handleSelectAll()
    if (JSON.stringify(prevFilteredAreas.current) !== JSON.stringify(filteredAreas)) {
      prevFilteredAreas.current = filteredAreas; // อัปเดตค่าใหม่
      handleSelectAllCyberpunk();
    }
  }, [filteredAreas]);

  const getLabels = (tabIndex: any) => {
    switch (tabIndex) {
      case 0: // Yearly
        return {
          startLabel: "Start Year",
          endLabel: "End Year",
          startplaceHolder: "Select Start Year",
          endplaceHolder: "Select End Year",
        };
      case 1: // Monthly
        return {
          startLabel: "Start Month",
          endLabel: "End Month",
          startplaceHolder: "Select Start Month",
          endplaceHolder: "Select End Month",
        };
      case 2: // Daily
        return {
          startLabel: "Start Month",
          endLabel: "",
          startplaceHolder: "Select Start Month",
          endplaceHolder: "Select End Month",
        }; // Only Start Month
      case 3: // Detail (Default to Yearly)
        return {
          startLabel: "Start Date",
          endLabel: "End Date",
          startplaceHolder: "Select Start Date",
          endplaceHolder: "Select End Date",
        };
      default:
        return {
          startLabel: "Start Year",
          endLabel: "End Year",
          startplaceHolder: "Select Start Year",
          endplaceHolder: "Select End Year",
        };
    }
  };

  const { startLabel, endLabel, startplaceHolder, endplaceHolder } =
    getLabels(tabIndex);

  const [bodyExport, setBodyExport] = useState({});

  useEffect(() => {
    const firstDayOfYear = dayjs().startOf("year").format('YYYY-MM-DD');
    const lastDayOfYear = dayjs().endOf("year").format('YYYY-MM-DD');;
    const lastDayOfYearInTenYears = dayjs().add(10, "year").endOf("year").format('YYYY-MM-DD');;

    // let format_start_search = srchStartDate ? dayjs(srchStartDate) : "2025-01-01"
    // let format_end_search = srchEndDate ? dayjs(srchEndDate) : tabIndex == 0 ? "2034-12-31" : "2025-12-31"
    let format_start_search = srchStartDate ? dayjs(srchStartDate) : firstDayOfYear
    let format_end_search = srchEndDate ? dayjs(srchEndDate) : tabIndex == 0 ? lastDayOfYearInTenYears : lastDayOfYear

    switch (tabIndex) {
      case 0:
        let startYearOnly = dayjs(format_start_search).format("YYYY");
        let endYearOnly = dayjs(format_end_search).format("YYYY");

        setBodyExport({
          "filter": [
            "Zone",
            "Area",
            "Available Capacity (MMBTU/D)"
          ],
          "startYear": startYearOnly, // YYYY
          "endYear": endYearOnly
        })
        break;
      case 1:
        let startYearMonthOnly = srchStartDate ? dayjs(format_start_search).format("YYYY-MM") : dayjs().startOf('month').add(0, 'month').format("YYYY-MM");
        let endYearMonthOnly = srchEndDate ? dayjs(format_end_search).format("YYYY-MM") : dayjs().startOf('month').add(12, 'month').format("YYYY-MM");

        setBodyExport({
          "filter": [
            "Zone",
            "Area",
            "Available Capacity (MMBTU/D)"
          ],
          "startMonth": startYearMonthOnly, // YYYY-MM
          "endMonth": endYearMonthOnly
        })
        break;
      case 2:
        let startYearMonthDayOnly = srchStartDate ? dayjs(format_start_search).format("YYYY-MM-DD") : dayjs().startOf('month').add(2, 'month').format("YYYY-MM-DD");

        setBodyExport({
          "filter": [
            "Zone",
            "Area",
            "Available Capacity (MMBTU/D)"
          ],
          "date": startYearMonthDayOnly // YYYY-MM-DD
        })

        break;
      case 3:
        setBodyExport({
          "filter": initialColumns?.map((item: any) => item.label),
          "id": filteredDataTableDetail?.map((item: any) => item.id)
        })

        break;
    }
  }, [tabIndex, srchEndDate, srchStartDate, filteredDataTableDetail])

  useEffect(() => {
    switch (tabIndex) {
      case 3:
        setBodyExport({
          filter: initialColumns
            .filter((item: any) => columnVisibility[item.key])
            .map((item: any) => item.label),
          id: filteredDataTableDetail?.map((item: any) => item.id),
        });
        break;
    }
  }, [columnVisibility, tabIndex])

  const getReason = async () => {
    const response: any = await getService(`/master/parameter/capacity-publication-remark`);
    response?.reverse();
    const result = getLatestMatchingData(response);
    setDataReason(result);
  }

  useEffect(() => {
    getReason();

    setTimeout(() => {
      // v1.0.90 remark ควรที่จะ แสดงผลเลยโดยไม่ต้องกด https://app.clickup.com/t/86erpqyjy
      setMdReasonView(true)

      // สิ่งที่ต้องดูเพิ่ม
      // 1.ข้อความต้องมาด้วย
      // 2.TSO ต้องเปิดให้แก้ได้เหมือนเดิม
      // 3.Shipper แก้ไม่ได้
      // setUserMode('view')
      setUserMode(userDT?.account_manage?.[0]?.user_type_id == "3" ? "view" : "edit")
    }, 1000);

  }, [])

  const [isLoadingTabs, setisLoadingTabs] = useState<boolean>(true);

  //   useEffect(() => {
  //   if (filteredDataTable && Array.isArray(filteredDataTable)) {
  //     setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
  //   }
  // }, [filteredDataTable, currentPage, itemsPerPage])


  return (
    <>
      <div className=" space-y-2">
        <>
          <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
            <aside className="flex flex-wrap sm:flex-row gap-2 w-full pt-6">
              <div className="flex flex-wrap gap-2 justify-end">
                <BtnGeneral
                  textRender={"Remarks"}
                  iconNoRender={true}
                  bgcolor={"#00ADEF"}
                  generalFunc={openReasonModal}
                  can_view={userPermission ? userPermission?.f_create : false}
                />
              </div>
            </aside>
            <aside className="mt-auto ml-1 w-full sm:w-auto">
              <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                {
                  userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                  <BtnGeneral
                    textRender={"Adjust Cap"}
                    iconNoRender={true}
                    bgcolor={"#3582D5"}
                    generalFunc={openCreateForm}
                    can_view={userPermission ? userPermission?.f_create : false}
                  />
                }

                <BtnGeneral
                  textRender={"All Area"}
                  iconNoRender={true}
                  bgcolor={"#1473A1"}
                  generalFunc={toggleDrawer}
                  can_view={userPermission ? userPermission?.f_create : false}
                />
              </div>
            </aside>

          </div>

          <div>
            <div style={bodyStyles}>
              <div style={overlayStyles}></div>
              <div style={textStyles}>View Map</div>
              <div className="indicator">
                <div className="icon-flag" onClick={() => settoggle(!toggle)}>
                  {toggle ? (
                    <KeyboardArrowDownRoundedIcon />
                  ) : (
                    <KeyboardArrowUpRoundedIcon />
                  )}
                </div>
              </div>
            </div>

            <div
              className={`w-full relative mt-5 rounded-lg z-1 bg-[#ffffff] overflow-hidden transition-all duration-500 ${toggle
                ? "max-h-[500px] opacity-100 translate-y-0"
                : "max-h-0 opacity-0 translate-y-[-20px]"
                }`}
            >
              <GoogleMapComponent AreaPos={selectedAreas} />
            </div>
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

            {(userDT?.account_manage?.[0]?.user_type_id == 3
              ? ["Yearly", "Monthly", "Daily"]
              : ["Yearly", "Monthly", "Daily", "Detail"]
            ).map((label, index) => (
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
            ))}
          </Tabs>

          <div className="border-[#DFE4EA] border-[1px] p-2 rounded-tl-none rounded-tr-lg shadow-sm">
            <aside className="flex flex-wrap sm:flex-row gap-2 w-full pl-2 pb-2 mt-5">

              {
                tabIndex == 0 ?
                  // maxDate = Thu Jan 01 2037 00:00:00 GMT+0700 (Indochina Time)

                  <YearPickaSearch
                    key={"start" + tabIndex + key}
                    label={startLabel}
                    placeHolder={startplaceHolder}
                    allowClear
                    max={maxDate || null} // Filter Start Month / End Month ต้องสามารถเลือกได้ max สุด 20 ปี แต่ตอนนี้มันเพิ่มขึ้นเรื่อยๆ https://app.clickup.com/t/86euzyw3r
                    onChange={(e: any) => {
                      setSrchStartDate(e ? e : null);
                      // แถบ yearly ถ้ามี start_date ช่อง end_date เลือกได้ไม่เกิน 20 ปีจาก start_date
                      // Calculate maxDate as e + 240 months
                      // const maxDate = e ? addMonths(new Date(e), 240) : null;
                      // setMaxDate(maxDate);
                    }}
                  />
                  : tabIndex == 1 ?
                    <MonthYearPickaSearch
                      key={"start" + tabIndex + key}
                      label={startLabel}
                      placeHolder={startplaceHolder}
                      allowClear
                      max={addMonths(new Date(), 24) || null} // Filter Start Month-End Month จะต้องสามารถเลือก Filter ได้มากสุดคือ 24 month ตอนนี้มันไหลไปเรื่อยๆ https://app.clickup.com/t/86euzz26z
                      onChange={(e: any) => {
                        setSrchStartDate(e ? e : null);
                        // Calculate maxDate as e + 24 months
                        // const maxDate = e ? addMonths(new Date(e), 24) : null;
                        // setMaxDate(maxDate);
                      }}
                    />
                    : tabIndex == 2 ?
                      <MonthYearPickaSearch
                        key={"start" + tabIndex + key}
                        label={startLabel}
                        placeHolder={startplaceHolder}
                        allowClear
                        onChange={(e: any) => {
                          setSrchStartDate(e ? e : null);
                          // Calculate maxDate as e + 24 months
                          const maxDate = e ? addMonths(new Date(e), 24) : null;
                          setMaxDate(maxDate);
                        }}
                      />
                      : <DatePickaSearch
                        key={"start" + tabIndex + key}
                        label={startLabel}
                        placeHolder={startplaceHolder}
                        allowClear
                        onChange={(e: any) => {
                          setSrchStartDate(e ? e : null);
                          // Calculate maxDate as e + 24 months
                          const maxDate = e ? addMonths(new Date(e), 24) : null;
                          setMaxDate(maxDate);
                        }}
                      />
              }

              {endLabel && (
                tabIndex == 0 ?
                  <YearPickaSearch
                    key={"end" + tabIndex + key}
                    label={endLabel}
                    placeHolder={endplaceHolder}
                    allowClear
                    max={maxDate || null} // Filter Start Month / End Month ต้องสามารถเลือกได้ max สุด 20 ปี แต่ตอนนี้มันเพิ่มขึ้นเรื่อยๆ https://app.clickup.com/t/86euzyw3r
                    min={srchStartDate}
                    onChange={(e: any) => {
                      setSrchEndDate(e ? e : null);
                      // แถบ yearly ถ้ามี start_date ช่อง end_date เลือกได้ไม่เกิน 10 ปีจาก start_date
                      // Calculate maxDate as e + 120 months
                      // const maxDate = e ? addMonths(new Date(e), 120) : null;
                      // setMaxDate(maxDate);
                    }}
                  />
                  : tabIndex == 1 ?
                    <MonthYearPickaSearch
                      key={"end" + tabIndex + key}
                      label={endLabel}
                      placeHolder={endplaceHolder}
                      allowClear
                      // max={maxDate || null}
                      max={addMonths(new Date(), 24) || null} // Filter Start Month-End Month จะต้องสามารถเลือก Filter ได้มากสุดคือ 24 month ตอนนี้มันไหลไปเรื่อยๆ https://app.clickup.com/t/86euzz26z
                      min={srchStartDate}
                      onChange={(e: any) => {
                        setSrchEndDate(e ? e : null);
                        // Calculate maxDate as e + 24 months
                        // const maxDate = e ? addMonths(new Date(e), 24) : null;
                        // setMaxDate(maxDate);
                      }}
                    />
                    : tabIndex == 2 ?
                      <MonthYearPickaSearch
                        key={"end" + tabIndex + key}
                        label={endLabel}
                        placeHolder={endplaceHolder}
                        allowClear
                        max={maxDate || null}
                        min={srchStartDate}
                        onChange={(e: any) => {
                          setSrchEndDate(e ? e : null);
                          // Calculate maxDate as e + 24 months
                          const maxDate = e ? addMonths(new Date(e), 24) : null;
                          setMaxDate(maxDate);
                        }}
                      />
                      : <DatePickaSearch
                        key={"end" + tabIndex + key}
                        label={endLabel}
                        placeHolder={endplaceHolder}
                        max={null}
                        min={srchStartDate}
                        allowClear
                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                      />
              )}

              <BtnSearch handleFieldSearch={handleFieldSearch} />
              <BtnReset handleReset={handleReset} />
            </aside>

            <div>
              <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                <div onClick={handleTogglePopover} className="pl-2">
                  <TuneIcon
                    className="cursor-pointer rounded-lg"
                    style={{
                      fontSize: "18px",
                      color: "#2B2A87",
                      borderRadius: "4px",
                      width: "22px",
                      height: "22px",
                      border: "1px solid rgba(43, 42, 135, 0.4)",
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <SearchInput onSearch={handleSearch} />
                  {/* {sortedData?.length}
                    {filteredDataTable?.length} */}
                  {
                    tabIndex !== 3 ?
                      <BtnGeneral
                        bgcolor={"#24AB6A"}
                        modeIcon={'export'}
                        textRender={"Export"}
                        generalFunc={() => {
                          if (tabIndex == 0) {
                            return epCapacityPublicationYear({
                              name: 'Capacity Publication Yearly',
                              specificData: bodyExport,
                              columnVisibility: columnVisibility,
                              resData: filteredDataTable,
                              // resData: sortedData,
                            }) // ของใหม่
                          } else if (tabIndex == 1) {
                            return epCapacityPublicationMonth({
                              name: 'Capacity Publication Monthly',
                              specificData: bodyExport,
                              columnVisibility: columnVisibility,
                              resData: filteredDataTable,
                              // resData: sortedData,
                            }) // ของใหม่
                          } else if (tabIndex == 2) {
                            return epCapacityPublicationDay({
                              name: 'Capacity Publication Daily',
                              specificData: bodyExport,
                              columnVisibility: columnVisibility,
                              resData: filteredDataTable,
                              // resData: sortedData,
                            }) // ของใหม่
                          }
                        }}
                        can_export={userPermission ? userPermission?.f_export : false}
                      />
                      :
                      <BtnExport
                        textRender={"Export"}
                        data={sortedDataDetail}
                        path={"capacity/capacity-publication-detail"}
                        can_export={
                          userPermission ? userPermission?.f_export : false
                        }
                        specificMenu={'capacity_publication'}
                        specificData={bodyExport}
                        columnVisibility={columnVisibilityNew}
                        initialColumns={initialColumns}
                      />
                  }

                </div>
              </div>
            </div>
            <div className="w-full relative z-10">
              <Spinloading spin={isLoadingTabs} rounded={0} />
              {tabIndex !== 3 ? (
                <TableCapPublic
                  openEditForm={openEditForm}
                  openViewForm={openViewForm}
                  openHistoryForm={openHistoryForm}
                  openSubmissionModal={openSubmissionModal}
                  openAllFileModal={openAllFileModal}
                  handlePathDetail={handlePathDetail}
                  handleContractClick={handleContractClick}
                  tableData={paginatedData}
                  isLoading={isLoading}
                  // columnVisibility={columnVisibility}
                  columnVisibility={columnVisibilityNew}
                  tabIndex={tabIndex}
                  srchStartDate={srchStartDate}
                  srchEndDate={srchEndDate}
                  next10Years={next10Years}
                  next12Months={next12Months}
                  dayInMonth={dayInMonth}
                  sortedData={sortedData}
                  setSortedData={setSortedData}
                />
              ) : (
                <TableCapPublicDetail
                  openEditForm={openEditForm}
                  openViewForm={openViewForm}
                  openHistoryForm={openHistoryForm}
                  openSubmissionModal={openSubmissionModal}
                  openAllFileModal={openAllFileModal}
                  handlePathDetail={handlePathDetail}
                  handleContractClick={handleContractClick}
                  tableData={paginatedDataDetail}
                  isLoading={isLoading}
                  columnVisibility={columnVisibility}
                  tabIndex={tabIndex}
                  sortedData={sortedDataDetail}
                  setSortedData={setSortedDataDetail}
                />
              )}
            </div>
          </div>

          <PaginationComponent
            totalItems={
              tabIndex == 3
                ? filteredDataTableDetail?.length
                : filteredDataTable?.length
            }
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>

        <ModalAction
          mode={formMode}
          data={formData}
          open={formOpen}
          zoneMasterData={zoneMaster?.data}
          areaMasterData={areaMaster?.data}
          entryExitMasterData={entryExitMaster?.data}
          onClose={() => {
            setFormOpen(false);
            if (resetForm) {
              setTimeout(() => {
                resetForm();
              }, 200);
            }
          }}
          onSubmit={handleFormSubmit}
          setResetForm={setResetForm}
        />

        <ModalHistory
          open={historyOpen}
          handleClose={handleCloseHistoryModal}
          tableType="nomination-deadline"
          title="History"
          data={historyData}
          head_data={headData}
          userPermission={userPermission}
        />

        <ModalComponent
          open={isModalSuccessOpen}
          handleClose={handleCloseModal}
          title="Success"
          description={modalMsg}
        />

        <ColumnVisibilityPopoverMT
          open={open}
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          columnVisibility={columnVisibilityNew}
          handleColumnToggle={handleColumnToggleNew}
          initialColumns={initialColumns}
        />
      </div>

      {/* Drawer */}
      {drawerOpen && (
        <div
          className="absolute !h-full inset-0 bg-[#000000] bg-opacity-45 transition-opacity z-20 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
          onClick={toggleDrawer}
        ></div>
      )}

      <div
        className={`fixed  top-0 right-0 h-full bg-white w-[550px] transform ${drawerOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out z-50`}
      >
        <div className="p-1 ">
          <button onClick={toggleDrawer} className="absolute top-4 left-4">
            <CloseOutlinedIcon sx={{ color: "#464255" }} />
          </button>
        </div>
        <div className="p-6 pt-8">
          <h2 className="text-xl font-bold text-[#00ADEF] pt-4">{`All Area`}</h2>
          <div className="pt-2 pb-2 flex flex-col sm:flex-row gap-2">
            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  // checked={selectedAreas.length === dataTable?.length}
                  checked={selectedAreas.length === areaMaster?.data?.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 mr-2 border border-gray-400 rounded-md checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                  style={{
                    accentColor: "#1473A1",
                  }}
                />
                <span>{`Select All Area`}</span>
              </div>
            </aside>

            <aside className="mt-auto ml-1 w-full sm:w-auto">
              <div className="flex justify-end">
                <InputSearch
                  id="searchName"
                  label=""
                  value={searchQuery}
                  mode={"drawer"}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                />
              </div>
            </aside>
          </div>

          {/* Map Area Items */}
          <div className="grid grid-cols-7 gap-2 pt-2">
            {filteredAreas?.map((area: any) => {
              return (<div key={area.id} className="flex items-center space-x-2 pt-3">
                <input
                  type="checkbox"
                  checked={selectedAreas.includes(area.name)}
                  onChange={() => handleSelectArea(area.name)}
                  className="h-4 w-4 border border-gray-400 rounded-full checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                  style={{
                    accentColor: "#1473A1",
                  }}
                />
                {area?.entry_exit_id == 2 ? (
                  <div
                    className="rounded-full p-1 text-[#464255] text-center"
                    style={{
                      backgroundColor: area?.color,
                      width: "34px",
                      height: "34px",
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {`${area?.name}`}
                  </div>
                ) : (
                  <div
                    className="rounded-lg p-1 text-[#464255] text-center"
                    style={{
                      backgroundColor: area?.color,
                      width: "34px",
                      height: "34px",
                      display: "inline-flex",
                      justifyContent: "center",
                      alignItems: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {`${area?.name}`}
                  </div>
                )}
              </div>
              )
            })}
          </div>
        </div>
      </div>

      <ModalComponent
        open={isModalErrorOpen}
        handleClose={() => {
          setModalErrorOpen(false);
          if (resetForm) resetForm();
        }}
        title="Failed"
        description={
          <div>
            <div className="text-center">{`${modalErrorMsg}`}</div>
          </div>
        }
        stat="error"
      />

      <ModalReason
        data={dataReason}
        open={mdReasonView}
        mode={userMode}
        onClose={() => {
          setMdReasonView(false);
          if (resetForm) {
            setTimeout(() => {
              resetForm();
            }, 200);
          }
        }}
        onSubmit={handleRemarkSubmit}
        setResetForm={setResetForm}
      />
    </>
  );
};

export default ClientPage;
