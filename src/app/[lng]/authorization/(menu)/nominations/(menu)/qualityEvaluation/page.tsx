"use client";
import { useEffect, useRef, useState } from "react";
import { Tune } from "@mui/icons-material";
import {
  findRoleConfigByMenuName,
  formatNumberFourDecimalNom,
  formatNumberFourDecimalNomNoComma,
  formatNumberThreeDecimal,
  formatNumberThreeDecimalNoComma,
  generateUserPermission,
  getCurrentWeekSundayYyyyMmDd,
  toDayjs,
} from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import { Tab, Tabs } from "@mui/material";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { useForm } from "react-hook-form";
import { GeneralTable } from "@/components/table/GeneralTable";
import { ColumnDef, Row, VisibilityState } from "@tanstack/react-table";
import { QualityPlanningData } from "@/app/types";
import { table_sort_header_style } from "@/utils/styles";
import { dayinWeek } from "@/utils/date/week";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";

interface ClientProps {
  params: {
    lng: string;
  };
}

const ClientPage: React.FC<ClientProps> = (props) => {
  const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
  const searchParams = useSearchParams();
  const filter_gas_day_from_somewhere_else: any = searchParams.get("filter_gas_day");

  const [dataTable, setDataTable] = useState<any>([]);
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [key, setKey] = useState(0);
  const [isResetClick, setIsResetClick] = useState<boolean>(false);
  const [srchContractCode, setSrchContractCode] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date>(filter_gas_day_from_somewhere_else ? dayjs(filter_gas_day_from_somewhere_else).toDate() : toDayjs().add(1, "day").toDate()); // วันที่ใช้ filter ข้อมูล default วันพรุ่งนี้
  const [displayGasDay, setDisplayGasDay] = useState<Date | null>(null); // วันที่แสดงใน datepicker
  const [displayGasDayInTabWeekly, setDisplayGasDayInTabWeekly] = useState<Date | undefined | null>(null); // วันที่แสดงใน tab weekly
  const [displaySrchContractCode, setDisplaySrchContractCode] = useState<any>([]);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [dataContractForFilter, setDataContractForFilter] = useState<any>([]);
  const [isFirstTime, setIsFirstTime] = useState<any>(false);
  const [tabIndex, setTabIndex] = useState(
    localStorage.getItem("nom_dashboard_route_mix_quality_obj")
      ? JSON.parse(
        localStorage.getItem("nom_dashboard_route_mix_quality_obj") || "{}"
      ).tab == "weekly"
        ? 1
        : 0
      : 0
  ); // 0=daily, 1=weekly
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [conditionColumns, setConditionColumns] = useState<Record<string, boolean>>({ gasday: true, valueBtuScf: true, unit: true, });

  // กำหนดการแสดง/ซ่อนคอลัมน์เริ่มต้น
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    zone_name: true,
    area_name: true,
    parameter: true,
  });

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
      //   const updatedUserPermission = generateUserPermission(user_permission);
      //   setUserPermission(updatedUserPermission);
      // } else {
      //   const permission = findRoleConfigByMenuName('Quality Evaluation', userDT)
      //   setUserPermission(permission);
      // }

      const permission = findRoleConfigByMenuName('Quality Evaluation', userDT)
      if (permission) {
        setUserPermission(permission);
      } else if (user_permission?.role_config) {
        const updatedUserPermission = generateUserPermission(user_permission);
        setUserPermission(updatedUserPermission);
      }
    } catch (error) {
      // Failed to parse user_permission:
    }
  };

  const contractActiveDate = async (gasDay: any) => {
    let url = `/master/quality-evaluation/contractActiveDate?gasDay=${(gasDay && dayjs(gasDay).format("YYYY-MM-DD")) || ""}`;
    const response: any = await getService(url);
    setDataContractForFilter(response || []);
    setDisplaySrchContractCode([]);
  };

  // #region handleFieldSearch
  // const handleFieldSearch = async (param?: {dataToFilter?: QualityPlanningData[];}) => {
  const handleFieldSearch = async (param?: any) => {
    setDisplayGasDayInTabWeekly(srchStartDate);
    setIsLoading(false);

    let contractCodeIDList: number[] = []
    let reserveBalancingGasContractIDList: number[] = []
    try {
      const indexList : number[] = (displaySrchContractCode && Array.isArray(displaySrchContractCode)) ? displaySrchContractCode : []
      indexList.map(index => {
        const dataItem = dataContractForFilter.find((item: any) => item?.index == index)
        if (dataItem) {
          if (dataItem.is_reserve_balancing_gas_contract == true) {
            reserveBalancingGasContractIDList.push(dataItem.id)
          }
          else{
            contractCodeIDList.push(dataItem.id)
          }
        }
      })
    }
    catch (error) {
      contractCodeIDList = []
      reserveBalancingGasContractIDList = []
    }
    
    let url = `/master/quality-evaluation?gasDay=${(srchStartDate && dayjs(srchStartDate).format("YYYY-MM-DD")) || ""}`;
    if(contractCodeIDList.length > 0) {
      url += `&contract_code=${contractCodeIDList.join(",")}`
    }
    if(reserveBalancingGasContractIDList.length > 0) {
      url += `&reserve_balancing_gas_contract=${reserveBalancingGasContractIDList.join(",")}`
    }
    const response: any = await getService(url);

    const dailyWithUnit = response?.newDaily?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF",
    }));

    const weeklyWithUnit = response?.newWeekly?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF",
    }));

    const dataToFilter =
      Array.isArray(param?.dataToFilter) && param.dataToFilter.length > 0
        ? param.dataToFilter
        : tabIndex === 0
          ? dailyWithUnit
          : weeklyWithUnit;

    const localDate = filter_gas_day_from_somewhere_else && !isFirstTime ? dayjs(filter_gas_day_from_somewhere_else, "YYYY-MM-DD").format("DD/MM/YYYY") : toDayjs(srchStartDate).tz("Asia/Bangkok").format("DD/MM/YYYY");

    const queryLower = searchQuery?.replace(/\s+/g, "")?.toLowerCase()?.trim();
    const result_2 = dataToFilter?.filter((item: any) => {

      return (
        // (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contractCodeId?.id) : true) &&
        (
          (contractCodeIDList?.length > 0 ? (contractCodeIDList.includes(item?.contractCodeId?.id) && item?.is_reserve_balancing_gas_contract == false) : true) ||
          (reserveBalancingGasContractIDList?.length > 0 ? (reserveBalancingGasContractIDList.includes(item?.contractCodeId?.id) && item?.is_reserve_balancing_gas_contract == true) : true)
        ) &&
        (localDate !== "Invalid Date" && !Array.isArray(param?.dataToFilter) ? localDate == item?.gasday : true) &&
        (queryLower
          ? item?.gasday?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.zone?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.area?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.parameter?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.unit?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

          item?.sunday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.monday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.tuesday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.wednesday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.thursday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.friday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.saturday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.valueBtuScf?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.sunday?.value) : formatNumberThreeDecimal(item?.sunday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.monday?.value) : formatNumberThreeDecimal(item?.monday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.tuesday?.value) : formatNumberThreeDecimal(item?.tuesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.wednesday?.value) : formatNumberThreeDecimal(item?.wednesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.thursday?.value) : formatNumberThreeDecimal(item?.thursday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.friday?.value) : formatNumberThreeDecimal(item?.friday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.saturday?.value) : formatNumberThreeDecimal(item?.saturday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.valueBtuScf) : formatNumberThreeDecimal(item?.valueBtuScf))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.sunday?.value) : formatNumberThreeDecimalNoComma(item?.sunday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.monday?.value) : formatNumberThreeDecimalNoComma(item?.monday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.tuesday?.value) : formatNumberThreeDecimalNoComma(item?.tuesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.wednesday?.value) : formatNumberThreeDecimalNoComma(item?.wednesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.thursday?.value) : formatNumberThreeDecimalNoComma(item?.thursday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.friday?.value) : formatNumberThreeDecimalNoComma(item?.friday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.saturday?.value) : formatNumberThreeDecimalNoComma(item?.saturday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.valueBtuScf) : formatNumberThreeDecimalNoComma(item?.valueBtuScf))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower)
          : true)
      );
    });
    setDataTable(result_2);
    setFilteredDataTable(result_2);

    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };


  const handleSearch = async (param?: any) => {
    const dataToFilter = dataTable;
    const queryLower = param?.replace(/\s+/g, "")?.toLowerCase()?.trim();
    const result_2 = dataToFilter?.filter((item: any) => {
      return (
        (queryLower
          ? item?.gasday?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.zone?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.area?.name?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.parameter?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.unit?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

          item?.sunday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.monday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.tuesday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.wednesday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.thursday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.friday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.saturday?.value?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          item?.valueBtuScf?.toString().replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.sunday?.value) : formatNumberThreeDecimal(item?.sunday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.monday?.value) : formatNumberThreeDecimal(item?.monday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.tuesday?.value) : formatNumberThreeDecimal(item?.tuesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.wednesday?.value) : formatNumberThreeDecimal(item?.wednesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.thursday?.value) : formatNumberThreeDecimal(item?.thursday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.friday?.value) : formatNumberThreeDecimal(item?.friday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.saturday?.value) : formatNumberThreeDecimal(item?.saturday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNom(item?.valueBtuScf) : formatNumberThreeDecimal(item?.valueBtuScf))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||

          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.sunday?.value) : formatNumberThreeDecimalNoComma(item?.sunday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.monday?.value) : formatNumberThreeDecimalNoComma(item?.monday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.tuesday?.value) : formatNumberThreeDecimalNoComma(item?.tuesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.wednesday?.value) : formatNumberThreeDecimalNoComma(item?.wednesday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.thursday?.value) : formatNumberThreeDecimalNoComma(item?.thursday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.friday?.value) : formatNumberThreeDecimalNoComma(item?.friday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.saturday?.value) : formatNumberThreeDecimalNoComma(item?.saturday?.value))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower) ||
          (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item?.valueBtuScf) : formatNumberThreeDecimalNoComma(item?.valueBtuScf))?.replace(/\s+/g, "").toLowerCase().trim().includes(queryLower)
          : true)
      );
    });

    setFilteredDataTable(result_2);

    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };



  const handleFieldSearchTabChange = async (date_to_filter?: any) => {
    setIsLoading(false);
    let url = tabIndex === 1 ?  `/master/quality-evaluation?contract_code=${displaySrchContractCode}&gasDay=${(dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0).format("YYYY-MM-DD"))}` : `/master/quality-evaluation?contract_code=${displaySrchContractCode}`;
    const response: any = await getService(url);

    const dailyWithUnit = response?.newDaily?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF",
    }));

    const weeklyWithUnit = response?.newWeekly?.map((item: any) => ({
      ...item,
      unit: item.parameter == "SG" ? "" : "BTU/SCF",
    }));

    const dataToFilter = tabIndex === 0 ? dailyWithUnit : weeklyWithUnit;
    const localDate =
      filter_gas_day_from_somewhere_else && !isFirstTime
        ? dayjs(filter_gas_day_from_somewhere_else, "YYYY-MM-DD").format(
          "DD/MM/YYYY"
        )
        : toDayjs(date_to_filter).tz("Asia/Bangkok").format("DD/MM/YYYY");

    const result_2 = dataToFilter?.filter((item: any) => {
      return (
        (srchContractCode?.length > 0
          ? srchContractCode.includes(`${item?.contractCodeId?.id}`)
          : true) &&
        (localDate !== "Invalid Date" ? localDate == item?.gasday : true)
      );
    });

    setFilteredDataTable(result_2);

    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };

  const handleReset = async () => {
    setIsLoading(false);
    setDisplaySrchContractCode([]);
    setSrchContractCode([]);
    let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());

    if (tabIndex === 0) {
      setSrchStartDate(toDayjs().add(1, "day").toDate());
      setDisplayGasDay(toDayjs().add(1, "day").toDate());
      setConditionColumns({ gasday: true, valueBtuScf: true, unit: true, });
    } else {
      setSrchStartDate(sun_day_fun_day);
      setDisplayGasDay(sun_day_fun_day);
      setConditionColumns({ gasday: false, valueBtuScf: false, unit: true, });
    }

    await fetchData(sun_day_fun_day);

    setTimeout(() => {
      setIsLoading(true);
    }, 400);

    setKey((prevKey) => prevKey + 1);
  };

  const fetchDataWithParams = async () => {
    try {
      let url = `/master/quality-evaluation`;

      if (filter_gas_day_from_somewhere_else) {
        const startDate = toDayjs(filter_gas_day_from_somewhere_else);
        url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : filter_gas_day_from_somewhere_else}&contract_code=${displaySrchContractCode}`;
      } else {
        url += `?contract_code=${displaySrchContractCode}`;
      }
      const response: any = await getService(url);

      handleFieldSearch({
        dataToFilter: tabIndex === 0 ? response?.newDaily : response?.newWeekly,
      });

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } catch (err) {
      setFilteredDataTable([]);

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } finally {
      // setLoading(false);
    }
  };

  const fetchData = async (reset_date?: any) => {
    if (reset_date) {
      setDisplayGasDay(reset_date);
      setDisplayGasDayInTabWeekly(reset_date);
    }

    try {
      let url = `/master/quality-evaluation`;
      if (srchStartDate) {
        const startDate = toDayjs(srchStartDate);
        url += `?gasDay=${startDate.isValid() ? startDate.format("YYYY-MM-DD") : srchStartDate}&contract_code=${displaySrchContractCode}`;
      } else {
        url += `?contract_code=${displaySrchContractCode}`;
      }

      handleFieldSearch();

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } catch (err) {
      setFilteredDataTable([]);

      setTimeout(() => {
        setIsLoading(true);
      }, 500);
    } finally {
      // setLoading(false);
    }

    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  };

  // แปลงค่าให้เป็น number หรือ null (รองรับ "0", มีคอมมา ฯลฯ)
  const toNumberOrNull = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  const myCustomSortingByDateFnK = (rowA: any, rowB: any, columnId: any) => {
    // ดึงค่าจริงจาก accessor (สำหรับคอลัมน์ day จะเป็น object { value: ... })
    const a = (rowA.getValue(columnId) as any)?.value ?? rowA.original?.[columnId]?.value;
    const b = (rowB.getValue(columnId) as any)?.value ?? rowB.original?.[columnId]?.value;

    const na = toNumberOrNull(a);
    const nb = toNumberOrNull(b);

    // เท่ากัน (รวมถึงทั้งคู่ null) → ไม่เปลี่ยนลำดับ
    if (na === nb) return 0;

    // ค่าว่างไปท้าย (ตอน ASC)
    if (na === null) return 1;
    if (nb === null) return -1;

    // เปรียบเทียบตัวเลขตรง ๆ (TanStack จะกลับสัญญาณเองตอน DESC)
    return na - nb;
  };

  // ############### COLUMN SHOW/HIDE ###############
  // ตัวช่วยเปลี่ยนเป็น number ให้ชัวร์
  const toNum = (v: unknown): number | null => {
    if (v == null) return null;
    const n = typeof v === 'number' ? v : Number(String(v).replace(/,/g, ''));
    return Number.isFinite(n) ? n : null;
  };

  const customNumberSort = (rowA: any, rowB: any, columnId: string) => {
    const a = toNum(rowA.getValue(columnId));
    const b = toNum(rowB.getValue(columnId));

    if (a == null && b == null) return 0;
    if (a == null) return 1;   // null ไปท้าย
    if (b == null) return -1;
    return a - b;
  };

  const columns: ColumnDef<QualityPlanningData>[] = [
    // {
    //   accessorKey: "gasday",
    //   header: "Gas Day",
    //   size: 120,
    // },
    {
      accessorKey: "gasday",
      header: "Gas Day",
      enableSorting: true,
      accessorFn: (row: any) => row?.gasday || "",
      sortingFn: myCustomSortingByDateFn,
      // sortUndefined: -1,
      cell: (info) => {
        const row: any = info?.row?.original;
        return <div>{row?.gasday ? row?.gasday : null}</div>;
      },
    },
    {
      accessorKey: "zone.name",
      header: "Zone",
      size: 120,
      cell: ({ row }) => (
        <div
          className="flex  w-[100px] justify-center rounded-full p-1 text-[#464255]"
          style={{ backgroundColor: row.original.zone?.color }}
        >
          {row.original.zone?.name}
        </div>
      ),
    },
    {
      accessorKey: "area.name",
      header: "Area",
      size: 100,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div
            className={`flex justify-center items-center p-1 text-[#464255] ${row.original.area?.entry_exit_id === 2
              ? "rounded-full"
              : "rounded-lg"
              }`}
            style={{
              backgroundColor: row.original.area?.color,
              width: "40px",
              height: "40px",
            }}
          >
            {row.original.area?.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "parameter",
      header: "Parameter",
      size: 120,
    },
    // {
    //   accessorKey: 'unit',
    //   header: 'Unit',
    //   size: 120,
    //   cell: (info) => {
    //     const row: any = info?.row?.original
    //     let unit_show = row?.parameter == "SG" ? '' : 'BTU/SCF'
    //     return (<div>{unit_show}</div>)
    //   }
    // },
    {
      accessorKey: "unit",
      header: "Unit",
      size: 120,
      accessorFn: (row: any) => {
        // ค่านี้จะถูกใช้ตอน sort/search
        return row?.parameter === "SG" ? "" : "BTU/SCF";
      },
      cell: (info) => {
        const row: any = info?.row?.original;
        let unit_show = row?.parameter === "SG" ? "" : "BTU/SCF";
        return <div>{unit_show}</div>;
      },
      enableSorting: true,
    },
    // {
    //   accessorKey: "valueBtuScf",
    //   header: "Value (BTU/SCF)",
    //   size: 120,
    //   sortingFn: customNumberSort,
    //   sortDescFirst: false,
    //   accessorFn: (row: any) => {
    //     const raw = row?.valueBtuScf;
    //     // const raw = getValue();
    //     if (!raw) return '';

    //     const fixed = formatNumberThreeDecimal(raw); // เช่น 10,000.0000
    //     const noComma = fixed.replace(/,/g, '');    // เช่น 10000.0000
    //     const rounded = parseFloat(raw).toString(); // เช่น 10000

    //     return `${fixed} ${noComma} ${rounded}`;
    //   },
    //   cell: (info) => {
    //     const row: any = info?.row?.original
    //     return (<div>{row?.valueBtuScf && formatNumberThreeDecimal(row?.valueBtuScf)}</div>)
    //   }
    // },
    {
      accessorKey: "valueBtuScf",         // ใช้ key ตรง ๆ ให้ getValue() ได้ "ตัวเลขจริง"
      header: "Value (BTU/SCF)",
      size: 120,
      enableSorting: true,
      sortingFn: customNumberSort,
      sortDescFirst: false,
      // ไม่ต้องมี accessorFn แล้ว (ปล่อยให้ table เก็บค่าจริงเป็น number)
      // cell: ({ row }) => {
      //   const v = row.original?.valueBtuScf;
      //   return v == null ? '' : formatNumberThreeDecimal(v);
      // },

      cell: ({ row }:any) => {
        const original = row.original;
        const v:any = original?.valueBtuScf;
        // ..... zoneExit // https://app.clickup.com/t/86ev29x3t
        const isRed =
          (original?.parameter === "HV" &&
            (v < original?.zoneExit?.zone_master_quality?.[0]?.v2_sat_heating_value_min ||
              v > original?.zoneExit?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
          (original?.parameter === "WI" &&
            (v < original?.zoneExit?.zone_master_quality?.[0]?.v2_wobbe_index_min ||
              v > original?.zoneExit?.zone_master_quality?.[0]?.v2_wobbe_index_max));
        // const isRed =
        //   (original?.parameter === "HV" &&
        //     (v < original?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_min ||
        //       v > original?.zone?.zone_master_quality?.[0]?.v2_sat_heating_value_max)) ||
        //   (original?.parameter === "WI" &&
        //     (v < original?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_min ||
        //       v > original?.zone?.zone_master_quality?.[0]?.v2_wobbe_index_max));

        return v == null ? (
          ""
        ) : (
          <span className={isRed ? "text-[#ED1B24]" : "text-[#464255]"}>
            {/* {formatNumberThreeDecimal(v)} */}
            {/* {v} */}
            {original?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(original?.valueBtuScf) : formatNumberThreeDecimalNoComma(original?.valueBtuScf)}
          </span>
        );
      },


      // ถ้าต้องการให้ค้นหาเจอรูปแบบทั้งมีคอมมา/ไม่มีคอมมา/เลขล้วน
      filterFn: (row, columnId, filterValue) => {
        const v = row.original?.valueBtuScf;
        if (v == null) return false;
        const q = String(filterValue).replace(/\s+/g, '').toLowerCase();

        const fixed = row?.original?.parameter === "SG" ? formatNumberFourDecimalNom(v).toLowerCase() : formatNumberThreeDecimal(v).toLowerCase(); // "10,000.000"
        const noComma = fixed.replace(/,/g, '');                   // "10000.000"
        const plain = String(Number(v));                         // "10000"

        return fixed.includes(q) || noComma.includes(q) || plain.includes(q);
      }
    },
    ...dayinWeek.map((day, index) => {
      return {
        accessorKey: day,
        header: () => {
          let dayName = "";
          if (typeof day !== "string" || day.length === 0) {
            dayName = day; // Handle non-string or empty input
          }
          dayName = day.charAt(0).toUpperCase() + day.slice(1);
          // const currentDate = toDayjs(displayGasDayInTabWeekly).add(index, "day");

          let currentDate;
          if (filter_gas_day_from_somewhere_else) {
            let to_day_js = toDayjs(
              filter_gas_day_from_somewhere_else
            ).toDate();
            currentDate = toDayjs(filter_gas_day_from_somewhere_else).add(
              index,
              "day"
            );
          } else {
            currentDate = toDayjs(displayGasDayInTabWeekly).add(index, "day");
          }

          let formattedDate = "";
          if (currentDate.isValid()) {
            formattedDate = currentDate.format("DD/MM/YYYY");
          }

          return (
            <div className={`${table_sort_header_style} text-center`}>
              <div>{dayName}</div>
              <div>{formattedDate}</div>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        sortDescFirst: false,
        cell: ({
          getValue,
          row,
        }: {
          getValue: () => any;
          row: Row<QualityPlanningData>;
        }) => {
          const value = getValue()?.value;
          return (
            <div className="w-full flex justify-end">
              <span
                className={`${isOutOfRange(value, row) ? "text-[#ED1B24]" : "text-[#464255]"
                  }`}
              >
                {value !== null && value !== undefined
                  ? (row?.original?.parameter === "SG" ? formatNumberFourDecimalNom(value) : formatNumberThreeDecimal(value))
                  : ""}
              </span>
            </div>
          );
        },
        sortingFn: myCustomSortingByDateFnK,
      };
    }),
  ];

  const isOutOfRange = (value: any, row: any) => {
    const parameter = row?.original.parameter || "";
    // const zoneMasterQuality = row?.original.zone?.zone_master_quality || [];
    const zoneMasterQuality = row?.original.zoneExit?.zone_master_quality || []
    if (zoneMasterQuality && zoneMasterQuality.length > 0) {
      if (parameter === "HV") {
        const minHV = zoneMasterQuality[0]?.v2_sat_heating_value_min;
        const maxHV = zoneMasterQuality[0]?.v2_sat_heating_value_max;
        return value ? value < minHV || value > maxHV : false;
      }

      if (parameter === "WI") {
        const minWI = zoneMasterQuality[0]?.v2_wobbe_index_min;
        const maxWI = zoneMasterQuality[0]?.v2_wobbe_index_max;
        return value ? value < minWI || value > maxWI : false;
      }
    }
    return false;
  };

  const initialColumns: any = [
    {
      key: "gasday",
      label: tabIndex == 0 ? "Gas Day" : "Gas Week",
      visible: true,
    },
    { key: "zone_name", label: "Zone", visible: true },
    { key: "area_name", label: "Area", visible: true },
    { key: "parameter", label: "Parameter", visible: true },
    { key: "unit", label: "Unit", visible: true },
    { key: "valueBtuScf", label: "Value (BTU/SCF)", visible: true },
    { key: "sunday", label: "Sunday", visible: true },
    { key: "monday", label: "Monday", visible: true },
    { key: "tuesday", label: "Tuesday", visible: true },
    { key: "wednesday", label: "Wednesday", visible: true },
    { key: "thursday", label: "Thursday", visible: true },
    { key: "friday", label: "Friday", visible: true },
    { key: "saturday", label: "Saturday", visible: true },
  ];

  // ฟังก์ชันจัดการการคลิกปุ่ม show/hide columns
  const handleVisibilityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleVisibilityClose = () => {
    setAnchorEl(null);
  };

  // ฟังก์ชันจัดการการแสดง/ซ่อนคอลัมน์
  const handleColumnVisibilityChange = (newVisibility: Record<string, boolean>) => {
    setColumnVisibility(newVisibility);
  };

  // ############### TAB ###############
  const handleChange = (event: any, newValue: any) => {
    setIsLoading(false);
    setTabIndex(newValue);
  };

  useEffect(() => {
    if (tabIndex == 0) {
      const tomorrow = toDayjs().add(1, "day");
      setSrchStartDate(tomorrow.toDate());
      setDisplayGasDay(tomorrow.toDate());
    } else if (tabIndex == 1) {
      let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());

      setSrchStartDate(sun_day_fun_day);
      setDisplayGasDay(sun_day_fun_day);
    }

    setTimeout(() => {
      setIsLoading(true);
    }, 300);
  }, [tabIndex]);

  useEffect(() => {
    if (filter_gas_day_from_somewhere_else && !isFirstTime) {
      fetchDataWithParams();
      setIsFirstTime(true);
    } else if (filter_gas_day_from_somewhere_else) {
      handleFieldSearch();
    } else {
      fetchData();
    }
  }, [filter_gas_day_from_somewhere_else]);

  useEffect(() => {
    const storedDashboard = localStorage.getItem(
      "nom_dashboard_route_mix_quality_obj"
    );
    const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;

    if (dashboardObject !== null) {
      let formattedGasDay = new Date(
        toDayjs(dashboardObject?.gas_day).format("YYYY-MM-DD")
      );
      setSrchStartDate(formattedGasDay);
      setDisplayGasDay(formattedGasDay);
      if (dashboardObject.tab == "weekly") {
        setTabIndex(1);
      }
      localStorage.removeItem("nom_dashboard_route_mix_quality_obj");
    }
  }, []);

  useEffect(() => {
    getPermission();
  }, []);

  const prevDateRef = useRef<any>(null);

  useEffect(() => {
    if (!srchStartDate) return;
    if (prevDateRef.current === srchStartDate) return;

    prevDateRef.current = srchStartDate;

    const fetchData = async () => {
      await contractActiveDate(srchStartDate);
    };

    fetchData();
  }, [srchStartDate]);

  useEffect(() => {
    let sun_day_fun_day = new Date(getCurrentWeekSundayYyyyMmDd());
    let date_to_filter: any;

    if (tabIndex === 0) {
      // Daily: filter gasDay = tomorrow
      const tomorrow = toDayjs().add(1, "day");
      setSrchStartDate(tomorrow.toDate());
      setDisplayGasDay(tomorrow.toDate());
      setConditionColumns({ gasday: true, valueBtuScf: true, unit: true, });

      date_to_filter = tomorrow.toDate();
    } else if (tabIndex == 1) {
      // ต้อง filter หา sunday.date == วันอาทิตย์ของสัปดาห์นี้

      setSrchStartDate(sun_day_fun_day);
      setDisplayGasDay(sun_day_fun_day);
      setDisplayGasDayInTabWeekly(sun_day_fun_day);
      setConditionColumns({ gasday: false, valueBtuScf: false, unit: true, });

      date_to_filter = sun_day_fun_day;
    }
    // fetchData();
    handleFieldSearchTabChange(date_to_filter);
  }, [tabIndex]);


  // api เส้นนี้เรียกแบบไม่ filter แล้วมาดึึงข้อมูลมาเยอะเกินกว่าที่เว็บจะรองรับได้ ทำให้ระบบพัง
  // เอามากรอง contract 
  const getNomData = async () => {
    // ต้องกรองตาม nom gas_day, gas_week ที่สถานะ nom ไม่ใช่ Rejected , Cancelled ด้วย 
    // 1. Filter Contract code ต้องกรองข้อมูลตาม Gas Day ที่เลือก (กรองทุกสถานะยกเว้น Rejected , Cancelled) 

    // query_shipper_nomination_status
    // 1 = Waiting For Response
    // 2 = Approved
    // 3 = Rejected
    // 4 = Cancelled
    // 5 = Approved by System

    const keep_stat = [1, 2, 5]
    const response: any = await getService(`/master/query-shipper-nomination-file`);
    let filtered_daily_weekly = []
    if (tabIndex == 0) {
      filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 1 && keep_stat.includes(item?.query_shipper_nomination_status?.id)) // 1 == Daily, 2 == Weekly
    } else {
      filtered_daily_weekly = response?.filter((item: any) => item?.nomination_type_id == 2 && keep_stat.includes(item?.query_shipper_nomination_status?.id)) // 1 == Daily, 2 == Weekly
    }

    // กรองตาม gas_day ที่เสิช
    const gasDay = srchStartDate ? toDayjs(srchStartDate) : undefined
    const tomorrowFormatted = (gasDay ? gasDay : (toDayjs().add(1, 'day'))).format('DD/MM/YYYY');
    const result_2 = filtered_daily_weekly?.filter((item: any) => {
      return (
        (tomorrowFormatted ? tomorrowFormatted == toDayjs(item?.gas_day).format("DD/MM/YYYY") : true)
      );
    });

    const uniqueContract = Array.from(
      new Map(result_2?.map((item: any) => {
        if (item?.reserve_balancing_gas_contract) {
          return [item?.reserve_balancing_gas_contract?.res_bal_gas_contract, { contract_code: item?.reserve_balancing_gas_contract?.res_bal_gas_contract }]
        } else {
          return [item?.contract_code.id, item?.contract_code]
        }
      }
      )).values()
    );

    setDataContractForFilter(uniqueContract)
  }

  useEffect(() => {
    setDataContractForFilter([])
  }, [tabIndex])

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          {tabIndex == 0 ? (
            <DatePickaSearch
              key={"start" + key}
              label={"Gas Day"}
              isGasWeek={false}
              placeHolder={"Select Gas Day"}
              allowClear
              defaultValue={
                filter_gas_day_from_somewhere_else && !isResetClick
                  ? filter_gas_day_from_somewhere_else
                  : srchStartDate
              }
              onChange={(e: any) => {
                // setDisplayGasDay(e ? e : null);
                setSrchStartDate(e ? e : null);
              }}
            />
          ) : (
            <DatePickaSearch
              key={"start" + key}
              label={"Gas Week"}
              // modeSearch={tabIndex == 0 ? "xx" : "sunday"}
              modeSearch={"sunday"}
              isGasWeek={true}
              placeHolder={"Select Gas Week"}
              allowClear
              defaultValue={
                filter_gas_day_from_somewhere_else && !isResetClick
                  ? filter_gas_day_from_somewhere_else
                  : srchStartDate
              }
              onChange={(e: any) => {
                setSrchStartDate(e ? e : null);
              }}
            />
          )}

          <InputSearch
            id="searchContractCode"
            label="Contract Code"
            type="select-multi-checkbox"
            isCheckAll={false}
            value={displaySrchContractCode}
            onChange={(e) => {
              setDisplaySrchContractCode(e.target.value);
            }}
            canReplaceOptionsWithEmpty={true}
            // options={dataContractN_?.map((item: any) => {
            //   return {
            //     value: item?.id,
            //     label: item?.contract_code,
            //   };
            // })}
            options={dataContractForFilter?.map((item: any) => {
              return {
                value: item?.index,
                label: item?.contract_code,
              };
            })}
          />

          <div className="pt-7">
            <BtnSearch
              handleFieldSearch={() => {
                setSrchContractCode(displaySrchContractCode);
                // setSrchStartDate(displayGasDay);
                setDisplayGasDayInTabWeekly(displayGasDay);
                handleFieldSearch();
              }}
            />
          </div>

          <div className="pt-7">
            <BtnReset
              handleReset={() => {
                setIsResetClick(true);
                handleReset();
              }}
            />
          </div>
        </aside>

        <aside className="mt-auto ml-1 w-full sm:w-auto">
          {/* <BtnGeneral
              bgcolor={"#00ADEF"}
              // modeIcon={'nom-accept'}
              textRender={"Simulation"}
              // generalFunc={() => handleAcceptReject(selectedRoles, 'accept')}
              can_create={userPermission ? userPermission?.f_create : false}
          // disable={selectedRoles?.length > 0 ? false : true}
          /> */}
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
        {["Daily", "Weekly"]?.map((label, index) => (
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

      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">
        <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          <div className="flex items-center space-x-2">
            <div onClick={handleVisibilityClick}>
              <Tune
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
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {/* <SearchInput
              onSearch={(query) => {
                const searchTerm = query.toLowerCase().trim();
                setSearchQuery(searchTerm);
              }}
            /> */}
            <SearchInput onSearch={handleSearch} />

            {/* &contract_code=${displaySrchContractCode} */}
            <BtnExport
              textRender={"Export"}
              specificMenu={"quality-evaluation"}
              data={filteredDataTable}
              type={tabIndex == 0 ? 1 : 2}
              gasDay={srchStartDate}
              path="nomination/quality-evaluation"
              can_export={userPermission ? userPermission?.f_export : false}
              columnVisibility={columnVisibility}
              initialColumns={initialColumns}

            />
          </div>
        </div>
        {/* ตารางแสดงข้อมูล */} 
        <GeneralTable
          data={filteredDataTable}
          columns={columns}
          anchorEl={anchorEl}
          isShowDayInWeek={tabIndex === 1}
          conditionColumns={conditionColumns}
          mainColumns={["area_name", "parameter"]}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onHandleVisibilityClose={handleVisibilityClose}
          isLoading={!isLoading}
        />
      </div>
    </div>
  );
};

export default ClientPage;
