import getCookieValue from "./getCookieValue";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatDate, formatNumberFourDecimal, formatNumberThreeDecimal, toNumber } from "./generalFormatter";
import {
  dcimal3,
  dcimal4,
  dcimal6,
  exportAllocationReportToExcel,
  exportDataToExcelWithMultiLevelHeaderNew,
  filterNestedData,
  formatNumberFourDecimalNom,
  getTodayNow,
  listToObject,
  parseToNumber,
} from "./exportMiddleNew";
import { getService } from "./postService";
import getUserValue from "./getuserValue";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const exportFunc = async (path: any, data: any) => {
  try {
    const ids = data.map((item: any) => item.id);
    let url = `${API_URL}/master/export-files/${path}?id=[${ids}]`;
    // window.open(`${API_URL}/master/export-files/${path}?id=[${ids}]`, '_blank');
    const link = document.createElement("a");
    link.href = url;
    link.download = "";
    link.click();
  } catch (error) {
    // Export error occurred
  }
};

export const newExportFunc = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  fileName?: string,
  specificData?: any
) => {
  // capacity/capacity-publication-detail

  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  let maxDay: dayjs.Dayjs | undefined;
  let minDay: dayjs.Dayjs | undefined;
  output = output.map((item: any) =>
    item === "Area Nominal Capacity (MMBTU/D)"
      ? "Area Nominal Capacity (MMBTH/D)"
      : item
  );

  Object.keys(columnVisibility).map((key) => {
    const day = dayjs(key, "MMM YYYY", true);
    if (day.isValid()) {
      if (maxDay == undefined || maxDay?.isBefore(day)) {
        maxDay = day;
      }
      if (minDay == undefined || minDay?.isAfter(day)) {
        minDay = day;
      }
    }
  });

  try {
    const ids = data.map((item: any) => item.id);
    const body = {
      id: ids,
      filter: output,
      bodys: specificData,
      maxDay: maxDay?.format("MMM YYYY"),
      minDay: minDay?.format("MMM YYYY"),
    };
    postExport(path, body, fileName);
  } catch (error) {
    // Export error occurred
  }
};

// ใช้กับ nomination quality planning, quality evaluation
export const exportNomiEvaluaAndPlanning = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  gasday?: any
) => {
  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);
  try {
    // const ids = data.map((item: any) => item.id);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    let startDate = dayjs(gasday, "DD/MM/YYYY");

    // let date_next_sunday = gasWeekFilter && isSearch ? formatDateYyyyMmDd(gasday) : oldGasWeekFilter && !isResetSearch ? formatDateYyyyMmDd(oldGasWeekFilter) : getCurrentWeekSundayYyyyMmDd()
    // let date_next_sunday = formatDateYyyyMmDd(gasday)

    // for (let i = 0; i < 7; i++) {
    //     const date = startDate.add(i, "day").format("DD/MM/YYYY");
    //     output.push(`${daysOfWeek[i]} ${date}`);
    // }

    for (let i = 0; i < 7; i++) {
      const current = startDate.add(i, "day");
      const dayName = current.format("dddd"); // Full day name (e.g., Sunday)
      const fullLabel = `${dayName} ${current.format("DD/MM/YYYY")}`;
      output.push(fullLabel);
    }

    let body = {
      gasday: gasday ? gasday : null,
      type: type,
      filter: output,
      data: data,
    };

    if (type == 2) {
      // type = 2 weekly
      // gasday = "21/09/2025"
      // เอาวันที่ gasday ไปต่อท้ายแบบ body ที่ส่งให้ดู
      const baseDate = dayjs(gasday, "DD/MM/YYYY"); // parse string -> dayjs

      body = {
        gasday: gasday,
        type: type,
        filter: [
          "Zone",
          "Area",
          "Parameter",
          "Unit",
          `Sunday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(0, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
          `Monday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(1, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
          `Tuesday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(2, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
          `Wednesday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(3, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
          `Thursday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(4, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
          `Friday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(5, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
          `Saturday${(dayjs(baseDate).isValid() &&
            ` ${baseDate.add(6, "day").format("DD/MM/YYYY")}`) ||
          ""
          }`,
        ],
        data: data,
      };
    }

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

// ใช้กับ allocation review
export const exportAllocReview = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any
) => {
  let flat_map_id = seletedId?.flatMap((item: any) => item?.id);

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    // const ids = data.map((item: any) => item.id);
    const body = {
      bodys: {
        start_date: data2?.start_date,
        end_date: data2?.end_date,
        skip: 100,
        limit: 100,
        idAr: flat_map_id,
      },
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportAllocMgn = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // let flat_map_id = data.flatMap((item: any) => item?.id)
  const flat_map_id = data
    .map((item: any) => item.data.map((d: any) => d.id))
    .flat();

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    // const ids = data.map((item: any) => item.id);
    const body = {
      bodys: {
        start_date: data2?.start_date,
        end_date: data2?.end_date,
        skip: 100,
        limit: 100,
        idAr: flat_map_id,
      },
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportAllocQuery = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  tabIndex?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    const ids = data.map((item: any) => item.id);
    const body = {
      bodys: {
        start_date: data2?.date?.start_date,
        end_date: data2?.date?.end_date,
        skip: 100,
        limit: 100,
        tab: tabIndex,
        idAr: ids,
        is_last_version: data2?.last_version,
      },
      filter: output,
    };
    // specificMenu == 'allocation-query'
    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportAllocReport = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  tabIndex?: any
) => {
  const EXCLUDED_KEYS = new Set(["action", "publication"]);
  const output = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  try {
    const ids = data.map((item: any) => item.id);
    const body = {
      bodys: {
        ...data2,
        // "start_date": "2025-01-01",
        // "end_date": "2025-02-28",
        // "skip": 100,
        // "limit": 100,
        tab: tabIndex,
        idAr: ids,
      },
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

// ใช้กับ balance --> adjustment --> adjust daily imbalance
export const exportAdjustDailyImbalance = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    bodys: {
      start_date: data2?.start_date,
      end_date: data2?.end_date,
      skip: 100,
      limit: 100,
    },
    filter: output,
  };
  postExport(path, body);
};

// ใช้กับ balance --> adjustment --> adjust accumulated imbalance
export const exportAdjustAccumulateImbalance = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any
) => {
  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);

  let filterx: string[] = [];
  columnVisibility.gas_day && filterx.push("Gas Day");
  columnVisibility.shipper_name && filterx.push("Shipper Name");
  columnVisibility.zone && filterx.push("Zone");
  columnVisibility.adjust_imbalance && filterx.push("Adjust Imbalance");
  columnVisibility.daily_initial_imbalance &&
    filterx.push("Daily Initial Imbalance");
  columnVisibility.daily_final_imbalance &&
    filterx.push("Daily Final Imbalance");
  columnVisibility.intraday_initial_imbalance &&
    filterx.push("Intraday Initial Imbalance");
  columnVisibility.intraday_final_imbalance &&
    filterx.push("Intraday Final Imbalance");
  columnVisibility.updated_by && filterx.push("Updated by");

  const body = {
    bodys: {
      start_date: data2?.start_date,
      end_date: data2?.end_date,
      skip: 100,
      limit: 100,
    },
    // filter: output
    filter: filterx,
  };

  postExport(path, body);
};

// ใช้กับ nomination dashboard
export const exportNomDashboard = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    const body = {
      key: type,
      gas_day: specificData?.gas_day,
      filter: output,
      tab: type == 1 ? "daily" : "weekly",
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportParkingAllocation = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  const formattedDate = dayjs(specificData).format("YYYY-MM-DD");
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    gas_day: formattedDate ? formattedDate : "2025-05-02",
    filter: output,
  };
  postExport(path, body);
};

export const exportAllocationMonthlyReport = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  const body = specificData;
  postExport(path, body);
  // postExportAllocMonthlyReport(path, body)
};

export const exportBalancingMonthlyReport = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  const body = specificData;
  postExport(path, body);
};

export const exportShipperNominationReport = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  let flat_map_id = data?.flatMap((item: any) => item?.id);
  let day: any = "sunday";

  switch (specificData?.day) {
    case 0:
      day = "sunday";
      break;
    case 1:
      day = "monday";
      break;
    case 2:
      day = "tuesday";
      break;
    case 3:
      day = "wednesday";
      break;
    case 4:
      day = "thursday";
      break;
    case 5:
      day = "friday";
      break;
    case 6:
      day = "saturday";
      break;
  }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    key: specificData?.tabIndex,
    day: day,
    id: flat_map_id,
    filter: output,
  };

  postExport(path, body);
};

export const exportCurtailsmentAlloc = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any,
  tabIndex?: any
) => {
  let flat_map_id = data?.flatMap((item: any) => item?.id);
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    bodys: {
      type: tabIndex,
      idAr: flat_map_id,
    },
    filter: output,
  };

  postExport(path, body);
};

export const exportHvForOperationFlow = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any
) => {
  let flat_map_id = data?.flatMap((item: any) => item?.id);

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    id: flat_map_id,
    filter: output,
  };

  postExport(path, body);
};

// intraday-acc-imbalance-inventory-original
export const exportIntradayAccImbalanceInventoryOriginal = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);

  const body = {
    bodys: specificData,
    filter: output,
  };

  postExport(path, body);
};

export const exportIntradayBaseInventory = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);

  const body = {
    bodys: specificData,
    // filter: output
    filter: [
      "Gas Day",
      "Gas Hour",
      "Timestamp",
      "Zone",
      "Mode",
      "HV (BTU/SCF)",
      "Base Inventory Value (MMBTU)",
      "High Max (MMBTU)",
      "High Difficult Day",
      "High Red (MMBTU)",
      "High Orange (MMBTU)",
      "Alert High (MMBTU)",
      "Alert Low (MMBTU)",
      "Low Orange (MMBTU)",
      "Low Red (MMBTU)",
      "Low Difficult Day",
      "Low Min (MMBTU)", // https://app.clickup.com/t/86eujrgt9
    ],
  };

  postExport(path, body);
};

export const exportIntradayBalancingReport = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // const output = initialColumns?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")?.map((item: any) => item.label);

  // เก็บไว้ดูนะ
  let xxx = {
    summary_pane: true,
    detail_pane: false,

    // หัวฝั่ง summary
    total_entry_mmbtud: true,
    total_exit_mmbtud: true,
    imbalance_zone_mmbtud: true,
    instructed_flow_mmbtud: false,
    shrinkage_volume_mmbtud: true,
    park_mmbtud: false,
    unpark_mmbtud: false,
    sod_park_mmbtud: false,
    eod_park_mmbtud: false,
    min_inventory_change_mmbtud: true,
    reserve_bal_mmbtud: false,
    adjust_imbalance_mmbtud: true,
    vent_gas: false,
    commissioning_gas: false,
    other_gas: false,
    daily_imb_mmbtud: true,
    aip_mmbtud: false,
    ain_mmbtud: false,
    percentage_imb: false,
    percentage_abslmb: false,
    acc_imb_month_mmbtud: false,
    acc_imb_mmbtud: true,
    acc_imb_inventory_mmbtud: false,
    min_inventory_mmbtud: false,

    // สองคีย์นี้เหมือนไม่มีใน filter
    east_acc_imb_inventory_mmbtud: false,
    west_acc_imb_inventory_mmbtud: false,

    // หัวฝั่ง detail
    entry: false,
    exit: false,
    east_entry_detail_pane: false,
    west_entry_detail_pane: false,
    east_west_entry_detail_pane: false,
    east_exit_detail_pane: false,
    west_exit_detail_pane: false,
    east_west_exit_detail_pane: false,
    f2_and_g: false,
    e: false,
  };

  let filterx: string[] = [];

  // ฝั่ง summary
  columnVisibility.publicate && filterx.push("Publicate");
  columnVisibility.gas_day && filterx.push("Gas Day");
  columnVisibility.gas_hour && filterx.push("Gas Hour");
  columnVisibility.timestamp && filterx.push("Timestamp");
  columnVisibility.shipper_name && filterx.push("Summary Pane.Shipper Name");
  columnVisibility.plan_actual && filterx.push("Summary Pane.Plan / Actual");
  columnVisibility.contract_code && filterx.push("Summary Pane.Contract Code");
  columnVisibility.east_total_entry_mmbtud &&
    filterx.push("Summary Pane.Total Entry (MMBTU/D).East");
  columnVisibility.west_total_entry_mmbtud &&
    filterx.push("Summary Pane.Total Entry (MMBTU/D).West");
  columnVisibility.east_west_total_entry_mmbtud &&
    filterx.push("Summary Pane.Total Entry (MMBTU/D).East-West");
  columnVisibility.east_total_exit_mmbtud &&
    filterx.push("Summary Pane.Total Exit (MMBTU/D).East");
  columnVisibility.west_total_exit_mmbtud &&
    filterx.push("Summary Pane.Total Exit (MMBTU/D).West");
  columnVisibility.east_west_total_exit_mmbtud &&
    filterx.push("Summary Pane.Total Exit (MMBTU/D).East-West");
  columnVisibility.east_imbalance_zone_mmbtud &&
    filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).East");
  columnVisibility.west_imbalance_zone_mmbtud &&
    filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).West");
  columnVisibility.total_imbalance_zone_mmbtud &&
    filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).Total");
  columnVisibility.east_instructed_flow_mmbtud &&
    filterx.push("Summary Pane.Instructed Flow (MMBTU/D).East");
  columnVisibility.west_instructed_flow_mmbtud &&
    filterx.push("Summary Pane.Instructed Flow (MMBTU/D).West");
  columnVisibility.east_west_instructed_flow_mmbtud &&
    filterx.push("Summary Pane.Instructed Flow (MMBTU/D).East-West");
  columnVisibility.east_shrinkage_volume_mmbtud &&
    filterx.push("Summary Pane.Shrinkage Volume (MMBTU/D).East");
  columnVisibility.west_shrinkage_volume_mmbtud &&
    filterx.push("Summary Pane.Shrinkage Volume (MMBTU/D).West");
  columnVisibility.east_park_mmbtud &&
    filterx.push("Summary Pane.Park (MMBTU/D).East");
  columnVisibility.west_park_mmbtud &&
    filterx.push("Summary Pane.Park (MMBTU/D).West");
  columnVisibility.east_unpark_mmbtud &&
    filterx.push("Summary Pane.Unpark (MMBTU/D).East");
  columnVisibility.west_unpark_mmbtud &&
    filterx.push("Summary Pane.Unpark (MMBTU/D).West");
  columnVisibility.east_sod_park_mmbtud &&
    filterx.push("Summary Pane.SOD Park (MMBTU/D).East");
  columnVisibility.west_sod_park_mmbtud &&
    filterx.push("Summary Pane.SOD Park (MMBTU/D).West");
  columnVisibility.east_eod_park_mmbtud &&
    filterx.push("Summary Pane.EOD Park (MMBTU/D).East");
  columnVisibility.west_eod_park_mmbtud &&
    filterx.push("Summary Pane.EOD Park (MMBTU/D).West");
  columnVisibility.east_min_inventory_change_mmbtud &&
    filterx.push("Summary Pane.Change Min Inventory (MMBTU/D).East");
  columnVisibility.west_min_inventory_change_mmbtud &&
    filterx.push("Summary Pane.Change Min Inventory (MMBTU/D).West");
  columnVisibility.east_reserve_bal_mmbtud &&
    filterx.push("Summary Pane.Reserve Bal. (MMBTU/D).East");
  columnVisibility.west_reserve_bal_mmbtud &&
    filterx.push("Summary Pane.Reserve Bal. (MMBTU/D).West");
  columnVisibility.east_adjust_imbalance_mmbtud &&
    filterx.push("Summary Pane.Adjust Imbalance (MMBTU/D).East");
  columnVisibility.west_adjust_imbalance_mmbtud &&
    filterx.push("Summary Pane.Adjust Imbalance (MMBTU/D).West");
  columnVisibility.east_vent_gas && filterx.push("Summary Pane.Vent Gas.East");
  columnVisibility.west_vent_gas && filterx.push("Summary Pane.Vent Gas.West");
  columnVisibility.east_commissioning_gas &&
    filterx.push("Summary Pane.Commissioning Gas.East");
  columnVisibility.west_commissioning_gas &&
    filterx.push("Summary Pane.Commissioning Gas.West");
  columnVisibility.east_other_gas &&
    filterx.push("Summary Pane.Other Gas.East");
  columnVisibility.west_other_gas &&
    filterx.push("Summary Pane.Other Gas.West");
  columnVisibility.east_daily_imb_mmbtud &&
    filterx.push("Summary Pane.Daily IMB (MMBTU/D).East");
  columnVisibility.west_daily_imb_mmbtud &&
    filterx.push("Summary Pane.Daily IMB (MMBTU/D).West");
  columnVisibility.total_aip_mmbtud &&
    filterx.push("Summary Pane.AIP (MMBTU/D).Total");
  columnVisibility.total_ain_mmbtud &&
    filterx.push("Summary Pane.AIN (MMBTU/D).Total");
  columnVisibility.total_percentage_imb &&
    filterx.push("Summary Pane.%Imb.Total");
  columnVisibility.total_percentage_abslmb &&
    filterx.push("Summary Pane.%Absimb.Total");
  columnVisibility.total_percentage_abslmb &&
    filterx.push("Summary Pane.%Absimb.Total");
  columnVisibility.east_acc_imb_month_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East");
  columnVisibility.west_acc_imb_month_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West");
  columnVisibility.east_acc_imb_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MMBTU/D).East");
  columnVisibility.west_acc_imb_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MMBTU/D).West");
  columnVisibility.east_acc_imb_inventory_mmbtud &&
    filterx.push("Summary Pane.Min. Inventory (MMBTU/D).East");
  // ตรงนี้มีคีย์หาย ของ summary

  columnVisibility.east_min_inventory_mmbtud &&
    filterx.push("Summary Pane.Min. Inventory (MMBTU/D).East");
  columnVisibility.west_min_inventory_mmbtud &&
    filterx.push("Summary Pane.Min. Inventory (MMBTU/D).West");

  // ฝั่ง detail
  columnVisibility.gsp && filterx.push("Detail Pane.Entry.East.GSP");
  columnVisibility.bypass_gas &&
    filterx.push("Detail Pane.Entry.East.Bypass Gas");
  columnVisibility.lng && filterx.push("Detail Pane.Entry.East.LNG");
  columnVisibility.others_east && filterx.push("Detail Pane.Entry.East.Others");
  columnVisibility.ydn && filterx.push("Detail Pane.Entry.West.YDN");
  columnVisibility.ytg && filterx.push("Detail Pane.Entry.West.YTG");
  columnVisibility.ztk && filterx.push("Detail Pane.Entry.West.ZTK");
  columnVisibility.others_west && filterx.push("Detail Pane.Entry.West.Others");
  columnVisibility.ra6_east &&
    filterx.push("Detail Pane.Entry.East-West.RA6 East");
  columnVisibility.ra6_west &&
    filterx.push("Detail Pane.Entry.East-West.RA6 West");
  columnVisibility.bvw10_east &&
    filterx.push("Detail Pane.Entry.East-West.BVW10 East");
  columnVisibility.bvw10_West &&
    filterx.push("Detail Pane.Entry.East-West.BVW10 West");
  columnVisibility.egat && filterx.push("Detail Pane.Exit.East.EGAT");
  columnVisibility.ipp && filterx.push("Detail Pane.Exit.East.IPP");
  columnVisibility.others_east_exit &&
    filterx.push("Detail Pane.Exit.East.Others");
  columnVisibility.egat_west && filterx.push("Detail Pane.Exit.West.EGAT");
  columnVisibility.ipp_west && filterx.push("Detail Pane.Exit.West.IPP");
  columnVisibility.others_west_exit &&
    filterx.push("Detail Pane.Exit.West.Others");
  columnVisibility.egat_east_west &&
    filterx.push("Detail Pane.Exit.East-West.EGAT");
  columnVisibility.ipp_east_west &&
    filterx.push("Detail Pane.Exit.East-West.IPP");
  columnVisibility.others_east_west_exit &&
    filterx.push("Detail Pane.Exit.East-West.Others");
  columnVisibility.east_f2andg && filterx.push("Detail Pane.Exit.F2&G.East");
  columnVisibility.west_f2andg && filterx.push("Detail Pane.Exit.F2&G.West");
  columnVisibility.east_e && filterx.push("Detail Pane.Exit.E.East");
  columnVisibility.west_e && filterx.push("Detail Pane.Exit.E.West");

  const body = {
    bodys: specificData,
    // filter: output
    filter: filterx,
    // filter: [
    //     "Publicate",
    //     "Gas Day",
    //     "Gas Hour",
    //     "Timestamp",
    //     "Summary Pane.Shipper Name",
    //     "Summary Pane.Plan / Actual",
    //     "Summary Pane.Contract Code",
    //     "Summary Pane.Total Entry (MMBTU/D).East",
    //     "Summary Pane.Total Entry (MMBTU/D).West",
    //     "Summary Pane.Total Entry (MMBTU/D).East-West",
    //     "Summary Pane.Total Exit (MMBTU/D).East",
    //     "Summary Pane.Total Exit (MMBTU/D).West",
    //     "Summary Pane.Total Exit (MMBTU/D).East-West",
    //     "Summary Pane.Imbalance Zone (MMBTU/D).East",
    //     "Summary Pane.Imbalance Zone (MMBTU/D).West",
    //     "Summary Pane.Imbalance Zone (MMBTU/D).Total",
    //     "Summary Pane.Instructed Flow (MMBTU/D).East",
    //     "Summary Pane.Instructed Flow (MMBTU/D).West",
    //     "Summary Pane.Instructed Flow (MMBTU/D).East-West",
    //     "Summary Pane.Shrinkage Volume (MMBTU/D).East",
    //     "Summary Pane.Shrinkage Volume (MMBTU/D).West",
    //     "Summary Pane.Park (MMBTU/D).East",
    //     "Summary Pane.Park (MMBTU/D).West",
    //     "Summary Pane.Unpark (MMBTU/D).East",
    //     "Summary Pane.Unpark (MMBTU/D).West",
    //     "Summary Pane.SOD Park (MMBTU/D).East",
    //     "Summary Pane.SOD Park (MMBTU/D).West",
    //     "Summary Pane.EOD Park (MMBTU/D).East",
    //     "Summary Pane.EOD Park (MMBTU/D).West",
    //     "Summary Pane.Change Min Inventory (MMBTU/D).East",
    //     "Summary Pane.Change Min Inventory (MMBTU/D).West",
    //     "Summary Pane.Reserve Bal. (MMBTU/D).East",
    //     "Summary Pane.Reserve Bal. (MMBTU/D).West",
    //     "Summary Pane.Adjust Imbalance (MMBTU/D).East",
    //     "Summary Pane.Adjust Imbalance (MMBTU/D).West",
    //     "Summary Pane.Vent Gas.East",
    //     "Summary Pane.Vent Gas.West",
    //     "Summary Pane.Commissioning Gas.East",
    //     "Summary Pane.Commissioning Gas.West",
    //     "Summary Pane.Other Gas.East",
    //     "Summary Pane.Other Gas.West",
    //     "Summary Pane.Daily IMB (MMBTU/D).East",
    //     "Summary Pane.Daily IMB (MMBTU/D).West",
    //     "Summary Pane.AIP (MMBTU/D).Total",
    //     "Summary Pane.AIN (MMBTU/D).Total",
    //     "Summary Pane.%Imb.Total",
    //     "Summary Pane.%Absimb.Total",
    //     "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East",
    //     "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West",
    //     "Summary Pane.Acc. IMB. (MMBTU/D).East",
    //     "Summary Pane.Acc. IMB. (MMBTU/D).West",
    //     "Summary Pane.Min. (MMBTU/D).East",
    //     "Summary Pane.Min. (MMBTU/D).West",

    //     "Detail Pane.Entry.East.GSP",
    //     "Detail Pane.Entry.East.Bypass GSP",
    //     "Detail Pane.Entry.East.LNG",
    //     "Detail Pane.Entry.East.Others",
    //     "Detail Pane.Entry.West.YDN",
    //     "Detail Pane.Entry.West.YTG",
    //     "Detail Pane.Entry.West.ZTK",
    //     "Detail Pane.Entry.West.Others",
    //     "Detail Pane.Entry.East-West.RA6 East",
    //     "Detail Pane.Entry.East-West.RA6 West",
    //     "Detail Pane.Entry.East-West.BVW10 East",
    //     "Detail Pane.Entry.East-West.BVW10 West",
    //     "Detail Pane.Exit.East.EGAT",
    //     "Detail Pane.Exit.East.IPP",
    //     "Detail Pane.Exit.East.Others",
    //     "Detail Pane.Exit.West.EGAT",
    //     "Detail Pane.Exit.West.IPP",
    //     "Detail Pane.Exit.West.Others",
    //     "Detail Pane.Exit.East-West.EGAT",
    //     "Detail Pane.Exit.East-West.IPP",
    //     "Detail Pane.Exit.East-West.Others",
    //     "Detail Pane.Exit.F2&G.East",
    //     "Detail Pane.Exit.F2&G.West",
    //     "Detail Pane.Exit.E.East",
    //     "Detail Pane.Exit.E.West"
    // ]
  };

  postExport(path, body);
};

export const exportIntradayBaseInvenShipper = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);

  const body = {
    bodys: specificData,
    // filter: output
    filter: [
      "Gas Day",
      "Gas Hour",
      "Timestamp",
      "Zone",
      "Mode",
      "Shipper Name",
      "HV (BTU/SCF)",
      "Base Inventory Value (MMBTU)",
      "High Max (MMBTU)",
      "High Difficult Day (MMBTU)",
      "High Red (MMBTU)",
      "High Orange (MMBTU)",
      "Alert High (MMBTU)",
      "Alert Low (MMBTU)",
      "Low Orange (MMBTU)",
      "Low Red (MMBTU)",
      "Low Difficult Day (MMBTU)",
      "Low Min (MMBTU)", // https://app.clickup.com/t/86eujrgt9
    ],
  };

  postExport(path, body);
};

export const exportBalanceIntradayDashboard = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "gas_day": "2025-02-28", // fixed ไว้ ของ mock eviden
  //         "skip": 0, // fixed ไว้ ของ mock eviden
  //         "limit": 100, // fixed ไว้ ของ mock eviden
  //         "shipper_id": null, // NGP-S01-002 str ไม่มีใส่ null
  //         "execute_timestamp": null // 1740687600 int ไม่มีใส่ null
  //     },
  //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
  //     ]
  // }

  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);
  const body = {
    bodys: specificData,
    filter: output
    // filter: [
    //   "Time",
    //   "Plan/Actual", //fixed ต้องมี

    //   "Entry(MMBTU)",
    //   "Entry(MMBTU).East",
    //   "Entry(MMBTU).West",
    //   "Entry(MMBTU).East-West",

    //   "Exit(MMBTU)",
    //   "Exit(MMBTU).East",
    //   "Exit(MMBTU).West",
    //   "Exit(MMBTU).East-West",

    //   "Balancing Gas",
    //   "Balancing Gas.East",
    //   "Balancing Gas.West",
    //   "Balancing Gas.East-West",

    //   "Park/Unpark",
    //   "Park/Unpark.East",
    //   "Park/Unpark.West",

    //   "RA#6",
    //   "RA#6.Ratio East",

    //   "BVW#10",
    //   "BVW#10.Ratio East ",

    //   "Shrinkage Gas & Others",
    //   "Shrinkage Gas & Others.East",
    //   "Shrinkage Gas & Others.West",
    //   "Shrinkage Gas & Others.East-West",

    //   "Change Min. Inventory",
    //   "Change Min. Inventory.East",
    //   "Change Min. Inventory.West",
    //   "Change Min. Inventory.East-West",

    //   "Imbalance",
    //   "Imbalance.East",
    //   "Imbalance.West",

    //   "Acc Imbalance (Meter) (MMBTU)",
    //   "Acc Imbalance (Meter) (MMBTU).East",
    //   "Acc Imbalance (Meter) (MMBTU).West",

    //   "Acc Imbalance (Inventory) (MMBTU)",
    //   "Acc Imbalance (Inventory) (MMBTU).East",
    //   "Acc Imbalance (Inventory) (MMBTU).West",

    //   "Total Imbalance",
    //   "% Total Imbalance",

    //   "System Level (East)",
    //   "System Level (East).Level",
    //   "System Level (East).%",

    //   "Order (East)",
    //   "Order (East).MMBTU",
    //   "Order (East).MMSCF",

    //   "System Level (West)",
    //   "System Level (West).Level",
    //   "System Level (West).%",

    //   "Order (West)",
    //   "Order (West).MMBTU",
    //   "Order (West).MMSCF",

    //   "Condition East",
    //   "Condition West",
    // ],
  };

  postExport(path, body);
};

export const exportBalanceIntradayDashboardShipper = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "gas_day": "2025-02-28", // fixed ไว้ ของ mock eviden
  //         "skip": 0, // fixed ไว้ ของ mock eviden
  //         "limit": 100, // fixed ไว้ ของ mock eviden
  //         "shipper_id": null, // NGP-S01-002 str ไม่มีใส่ null
  //         "execute_timestamp": null // 1740687600 int ไม่มีใส่ null
  //     },
  //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
  //     ]
  // }

  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);
  const body = {
    bodys: specificData,
    // filter: output
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

      // Export แล้ว Column Acc.Imbalance Invent เกินมา ที่เมนูนี้ไม่มี column นี้ https://app.clickup.com/t/86eujrgnt
      // "Acc Imbalance (Inventory) (MMBTU)",
      // "Acc Imbalance (Inventory) (MMBTU).East",
      // "Acc Imbalance (Inventory) (MMBTU).West",

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
      "Condition West",
    ],
  };

  postExport(path, body);
};

export const exportBalanceIntradayAccImbDashboard = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any,
  fileName?: string
) => {
  const body = {
    bodys: specificData,
    filter: [
      "Info",
      "Date",
      // "00:00",
      // "01:00",
      // "02:00",
      "03:00",
      // "04:00",
      // "05:00",
      "06:00",
      // "07:00",
      // "08:00",
      "09:00",
      // "10:00",
      // "11:00",
      "12:00",
      // "13:00",
      // "14:00",
      "15:00",
      // "16:00",
      // "17:00",
      "18:00",
      // "19:00",
      // "20:00",
      "21:00",
      // "22:00",
      // "23:00",
      "24:00",
    ],
  };

  postExport(path, body, fileName);
};

export const exportMeteringChecking = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // {
  //     "gasDay": "2025-03-30",
  //     "filter": [
  //         "Gas Day",
  //         "Metering Point ID",
  //         "00:00",
  //         "01:00",
  //         "02:00",
  //         "03:00",
  //         "04:00",
  //         "05:00",
  //         "06:00",
  //         "07:00",
  //         "08:00",
  //         "09:00",
  //         "10:00",
  //         "11:00",
  //         "12:00",
  //         "13:00",
  //         "14:00",
  //         "15:00",
  //         "16:00",
  //         "17:00",
  //         "18:00",
  //         "19:00",
  //         "20:00",
  //         "21:00",
  //         "22:00",
  //         "23:00",
  //         "24:00"
  //     ]
  // }

  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);
  const body = {
    gasDay: specificData,
    filter: output,
  };

  postExport(path, body);
};

export const exportBalanceReport = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "start_date": "2025-01-01", // fix วันนี้ไว้
  //         "end_date": "2025-02-28", // fix วันนี้ไว้
  //         "skip": 100,
  //         "limit": 100
  //     },
  //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
  //         "Gas Day",
  //         "Summary Pane.Shipper Name",
  //         "Summary Pane.Contract Code",
  //         "Summary Pane.Total Entry (MMBTU/D).East",
  //         "Summary Pane.Total Entry (MMBTU/D).West",
  //         "Summary Pane.Total Entry (MMBTU/D).East-West",
  //         "Summary Pane.Total Exit (MMBTU/D).East",
  //         "Summary Pane.Total Exit (MMBTU/D).West",
  //         "Summary Pane.Total Exit (MMBTU/D).East-West",
  //         "Summary Pane.Imbalance Zone (MMBTU/D).East",
  //         "Summary Pane.Imbalance Zone (MMBTU/D).West",
  //         "Summary Pane.Imbalance Zone (MMBTU/D).Total",
  //         "Summary Pane.Instructed Flow (MMBTU/D).East",
  //         "Summary Pane.Instructed Flow (MMBTU/D).West",
  //         "Summary Pane.Instructed Flow (MMBTU/D).East-West",
  //         "Summary Pane.Shrinkage Volume (MMBTU/D).East",
  //         "Summary Pane.Shrinkage Volume (MMBTU/D).West",
  //         "Summary Pane.Park (MMBTU/D).East",
  //         "Summary Pane.Park (MMBTU/D).West",
  //         "Summary Pane.Unpark (MMBTU/D).East",
  //         "Summary Pane.Unpark (MMBTU/D).West",
  //         "Summary Pane.SOD Park (MMBTU/D).East",
  //         "Summary Pane.SOD Park (MMBTU/D).West",
  //         "Summary Pane.EOD Park (MMBTU/D).East",
  //         "Summary Pane.EOD Park (MMBTU/D).West",
  //         "Summary Pane.Min. Inventory Change (MMBTU/D).East",
  //         "Summary Pane.Min. Inventory Change (MMBTU/D).West",
  //         "Summary Pane.Reserve Bal. (MMBTU/D).East",
  //         "Summary Pane.Reserve Bal. (MMBTU/D).West",
  //         "Summary Pane.Adjust Imbalance (MMBTU/D).East",
  //         "Summary Pane.Adjust Imbalance (MMBTU/D).West",
  //         "Summary Pane.Vent Gas.East",
  //         "Summary Pane.Vent Gas.West",
  //         "Summary Pane.Commissioning Gas.East",
  //         "Summary Pane.Commissioning Gas.West",
  //         "Summary Pane.Other Gas.East",
  //         "Summary Pane.Other Gas.West",
  //         "Summary Pane.Daily IMB (MMBTU/D).East",
  //         "Summary Pane.Daily IMB (MMBTU/D).West",
  //         "Summary Pane.AIP (MMBTU/D).Total",
  //         "Summary Pane.AIN (MMBTU/D).Total",
  //         "Summary Pane.%Imb.Total",
  //         "Summary Pane.%Absimb.Total",
  //         "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East",
  //         "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West",
  //         "Summary Pane.Acc. IMB. (MMBTU/D).East",
  //         "Summary Pane.Acc. IMB. (MMBTU/D).West",
  //         "Summary Pane.Min. (MMBTU/D).East",
  //         "Summary Pane.Min. (MMBTU/D).West",
  //         "Detail Pane.Entry.East.GSP",
  //         "Detail Pane.Entry.East.Bypass GSP",
  //         "Detail Pane.Entry.East.LNG",
  //         "Detail Pane.Entry.East.Others",
  //         "Detail Pane.Entry.West.YDN",
  //         "Detail Pane.Entry.West.YTG",
  //         "Detail Pane.Entry.West.ZTK",
  //         "Detail Pane.Entry.West.Others",
  //         "Detail Pane.Entry.East-West.RA6 East",
  //         "Detail Pane.Entry.East-West.RA6 West",
  //         "Detail Pane.Entry.East-West.BVW10 East",
  //         "Detail Pane.Entry.East-West.BVW10 West",
  //         "Detail Pane.Exit.East.EGAT",
  //         "Detail Pane.Exit.East.IPP",
  //         "Detail Pane.Exit.East.Others",
  //         "Detail Pane.Exit.West.EGAT",
  //         "Detail Pane.Exit.West.IPP",
  //         "Detail Pane.Exit.West.Others",
  //         "Detail Pane.Exit.East-West.EGAT",
  //         "Detail Pane.Exit.East-West.IPP",
  //         "Detail Pane.Exit.East-West.Others",
  //         "Detail Pane.Exit.F2&G.East",
  //         "Detail Pane.Exit.F2&G.West",
  //         "Detail Pane.Exit.E.East",
  //         "Detail Pane.Exit.E.West"
  //     ]
  // }

  const output = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);

  const body = {
    bodys: specificData,
    // filter: output
    filter: [],
  };

  postExport(path, body);
};

export const exportDailyAdjustSummary = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const updatedOutput = output.map((item: any) => {
    return item === "Total" ? "totalH1ToH24Adjust" : item;
  });

  // ลบ 00:00 - 01:00 หลัง H1
  // const cleanedOutput = output.map((item:any) => {
  //     const match = item.match(/^(H\d+)\s/);
  //     return match ? match[1] : item;
  // });

  const body = {
    checkAdjustment: specificData?.checkAdjustment, // true adjust YES only
    startDate: specificData?.startDate, // 27/03/2025 จะมี ข้อมูล YES ในเครื่อง SIT
    endDate: specificData?.endDate,
    contractCode: specificData?.contractCode, // ถ้าไม่ส่ง ให้ null หรือ ""
    filter: output,
  };
  postExport(path, body);
};

export const exportAllocationMonthlyReportDownload = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  const formattedDate = dayjs(specificData).format("YYYY-MM-DD");

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    bodys: specificData,
    filter: output,
  };
  postExport(path, body);
};

export const exportBalancingMonthlyReportDownload = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //      "idAr":[1]
  //     },
  //     "filter": [
  //         "Month",
  //         "Contract Code",
  //         "File",
  //         "Report Version",
  //         "Type Report",
  //         "Approved By"
  //     ]
  // }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    bodys: specificData,
    filter: output,
  };
  postExport(path, body);
};

export const exportMeteringRetriving = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys":{
  //         "limit":100,
  //         "offset":0,
  //         "startDate":"2025-06-27",
  //         "endDate":"2025-06-30",
  //         "metered_run_number_id": 6451
  //     },
  //     "filter": [
  //         "Gas Day",
  //         "Metering Retrieving ID",
  //         "Metering Point ID",
  //         "Energy (MMBTU)",
  //         "Timestamp",
  //         "Error Description"
  //     ]
  // }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    bodys: specificData,
    filter: output,
  };

  postExport(path, body);
};

export const exportMeteringDataCheck = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys":{
  //         "limit":100,
  //         "offset":0,
  //         "metered_run_number_id": 6451
  //     },
  //     "filter": [
  //         "Metering Point ID",
  //         "Met.Point Description"
  //     ]
  // }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const body = {
    bodys: specificData,
    filter: output,
  };

  postExport(path, body);
};

export const exportEventOffspecGas = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "eventCode": "",
  //         "eventDateFrom": "2025-08-13",
  //         "eventDateTo": "2025-08-13",
  //         "EventStatus": "",
  //         "offset": 0,
  //         "limit": 10
  //     },
  // "filter": [
  //   "Event Code",
  //   "Event Date",

  //   "Document 1",
  //   "Document 1.Status", // ถ้ามี Document 1
  //   "Document 2",
  //   "Document 2.Shipper", // ถ้ามี Document 2
  //   "Document 3",
  //   "Document 3.Shipper", // ถ้ามี Document 3
  //   "Created by",
  //   "Event Status"

  // ]
  // }

  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const removeList = ["Info", "Status", "Shipper"];
  output = output.filter((item: any) => !removeList.includes(item));

  // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
  let finalOutput: any = [];

  output.forEach((item: any) => {
    if (item === "Document 1") {
      finalOutput.push(item, "Document 1.Status");
    } else if (item === "Document 2") {
      finalOutput.push(item, "Document 2.Shipper");
    } else if (item === "Document 3") {
      finalOutput.push(item, "Document 3.Shipper");
    } else {
      finalOutput.push(item);
    }
  });

  const body = {
    bodys: specificData,
    filter: finalOutput,
  };

  postExport(path, body);
};

export const exportEventEmergencyDiffDay = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "eventCode": "",
  //         "eventDateFrom": "2025-01-01",
  //         "eventDateTo": "2025-08-15",
  //         "EventStatus": "",
  //         "offset": 0,
  //         "limit": 10
  //     },
  //     "filter": [
  //       "Event Code",
  //       "Event Date",

  //       "Document 3.9",
  //       "Document 3.9.Shipper",
  //       "Document 3.9.Status",
  //       "Document 3.9.Acknowledge",
  //       "Document 4",
  //       "Document 4.Shipper",
  //       "Document 4.Status",
  //       "Document 4.Acknowledge",
  //       "Document 5",
  //       "Document 5.Shipper",
  //       "Document 5.Status",
  //       "Document 5.Acknowledge",
  //       "Document 6",
  //       "Document 6.Shipper",
  //       "Document 6.Status",
  //       "Document 6.Acknowledge",
  //       "Created by",
  //       "Event Status"

  //     ]
  // }

  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const removeList = ["Info", "Status", "Shipper"];
  output = output.filter((item: any) => !removeList.includes(item));

  // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
  let finalOutput: any = [];

  output.forEach((item: any) => {
    if (item === "Emergency Doc.1") {
      finalOutput.push(
        item,
        "Emergency Doc.1.Shipper",
        "Emergency Doc.1.Status",
        "Emergency Doc.1.Acknowledge"
      );
      // finalOutput.push("Document 3.9.Status");
      // finalOutput.push("Document 3.9.Acknowledge");
    } else if (item === "Emergency Doc.2") {
      finalOutput.push(
        item,
        "Emergency Doc.2.Shipper",
        "Emergency Doc.2.Status",
        "Emergency Doc.2.Acknowledge"
      );
      // finalOutput.push("Document 4.Status");
      // finalOutput.push("Document 4.Acknowledge");
    } else if (item === "Emergency Doc.3") {
      finalOutput.push(
        item,
        "Emergency Doc.3.Shipper",
        "Emergency Doc.3.Status",
        "Emergency Doc.3.Acknowledge"
      );
      // finalOutput.push("Document 5.Status");
      // finalOutput.push("Document 5.Acknowledge");
    } else if (item === "Document 6") {
      finalOutput.push(
        item,
        "Document 6.Shipper",
        "Document 6.Status",
        "Document 6.Acknowledge"
      );
      // finalOutput.push("Document 6.Status");
      // finalOutput.push("Document 6.Acknowledge");
    } else {
      finalOutput.push(item);
    }
  });

  const body = {
    bodys: specificData,
    filter: finalOutput,
  };

  postExport(path, body);
};

export const exportEventOfo = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "eventCode": "",
  //         "eventDateFrom": "2025-01-01",
  //         "eventDateTo": "2025-08-15",
  //         "EventStatus": "",
  //         "offset": 0,
  //         "limit": 10
  //     },
  //     "filter": [
  //       "Event Code",
  //       "Event Date",

  //       "Document 7",
  //       "Document 7.Shipper",
  //       "Document 7.Status",
  //       "Document 7.Acknowledge",
  //       "Document 8",
  //       "Document 8.Shipper",
  //       "Document 8.Status",
  //       "Document 8.Acknowledge",

  //       "Created by",
  //       "Event Status"

  //     ]
  // }

  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const removeList = ["Info", "Status", "Shipper"];
  output = output.filter((item: any) => !removeList.includes(item));

  // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
  let finalOutput: any = [];

  output.forEach((item: any) => {
    if (item === "Document 7") {
      finalOutput.push(
        item,
        "Document 7.Shipper",
        "Document 7.Status",
        "Document 7.Acknowledge"
      );
    } else if (item === "Document 8") {
      finalOutput.push(
        item,
        "Document 8.Shipper",
        "Document 8.Status",
        "Document 8.Acknowledge"
      );
    } else {
      finalOutput.push(item);
    }
  });

  const body = {
    bodys: specificData,
    filter: finalOutput,
  };

  postExport(path, body);
};

export const exportTariffChargeReportMain = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // "bodys": {
  //     "month_year_charge": "", // 2025-08-01
  //     "id": "",
  //     "offset": 0,
  //     "limit": 10
  // },
  // "filter": [
  //   "Tariff ID",
  //   "Shipper Name",
  //   "Month/Year Charge",
  //   "Type",
  //   "Timestamp",
  //   "Invoice Sent",
  //   "Comment",
  //   "Created By",
  //   "Updated By"
  // ]

  // let flat_map_id = seletedId.flatMap((item: any) => item?.id)

  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย

  const body = {
    bodys: specificData,
    filter: output,
  };

  postExport(path, body);
};

export const exportTariffCreditDebitNote = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  seletedId?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "shipper_id": "",
  //         "month_year_charge": "", // 2025-08-01
  //         "cndn_id": "",
  //         "tariff_credit_debit_note_type_id": "",
  //         "tariff_type_charge_id": "",
  //         "offset": 0,
  //         "limit": 10
  //     },
  //     "filter": [
  //       "Shipper Name",
  //       "Month/Year",
  //       "CNCD ID",
  //       "Type Charge",
  //       "CNCD Type",
  //       "Comment"
  //     ]
  // }

  let output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  // 2. เตรียม array ใหม่สำหรับผลลัพธ์สุดท้าย
  const body = {
    bodys: specificData,
    filter: output,
  };

  postExport(path, body);
};

export const exportMeteringManagement = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  startDate?: any,
  endDate?: any
) => {
  // {
  //     "share": null,
  //     "start_date": "2025-03-10",
  //     "end_date": "2026-03-20",
  //     "filter": [
  //         "Gas Day",
  //         "Metering Point ID",
  //         "Zone",
  //         "Area",
  //         "Customer Type",
  //         "Volume (MMSCF)",
  //         "Heating Value (BTU/SCF)",
  //         "Energy (MMBTU)",
  //         "Received Timestamp",
  //         "TPA Insert Timestamp",
  //         "Metering Retrieving ID",
  //         "Source"
  //     ]
  // }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    const body = {
      share: null,
      // start_date: "2025-03-10",
      // end_date: "2026-03-20",
      start_date: startDate && dayjs(startDate).format("YYYY-MM-DD"),
      end_date: endDate && dayjs(endDate).format("YYYY-MM-DD"),
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSummaryNomReport = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const cleanedOutput = output.map((item: any) => {
    return item.match(/^H\d+\s/) ? item.split(" ")[0] : item;
  });

  // R1 : แถบ Weekly > Nomination > MMSCF : Export ยังไม่ตรงกับหน้า UI https://app.clickup.com/t/86et68p7e
  // ตรง weekly หัววัน Sunday ใส่วันมาตอส export ให้ด้วยพี่ "Sunday 20/02/2025" แบบนี้

  // แก้ไข updatedCleanOutput ให้จับจากคำ Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  // แล้วเติมวันที่แทน ตามฟังก์ชั่นปัจจุบัน
  // ORIGINAL
  const updatedCleanOutput = cleanedOutput.map((item: any, index: any) => {
    if (index === 0) return item; // "Nomination Point"

    const dateIndex = Math.floor((index - 1) / 2);
    const dayName = cleanedOutput[index - (index % 2 === 0 ? 1 : 0)];

    if (index % 2 === 1) {
      // Weekday label: append date
      return `${item} ${specificData[dateIndex] ? specificData[dateIndex] : specificData?.dateOnHeader?.[dateIndex]}`;
    } else {
      // Utilization label: prefix weekday
      return `${dayName} Utilization (%)`;
    }
  });

  const updatedOutput = [];

  for (let i = 0; i < updatedCleanOutput.length; i++) {
    const current = updatedCleanOutput[i];
    const next = updatedCleanOutput[i + 1];

    // If current is a day and next is Utilization (%)
    if (days.includes(current) && next === "Utilization (%)") {
      updatedOutput.push(current);
      // updatedOutput.push(`${current} `);
      updatedOutput.push(`${current} Utilization (%)`);
      i++; // Skip next since it's already added
    } else {
      updatedOutput.push(current);
    }
  }

  try {
    const body = {
      key: type,
      gas_day_text: specificData?.dateOnHeader?.[0],
      filter: updatedOutput,
      tab: specificData?.tab,
      overTotalCap: specificData?.over_total_cap,
    };
    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSummaryNomReportDailyTotalSystem = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const cleanedOutput = output.map((item: any) => {
    return item.match(/^H\d+\s/) ? item.split(" ")[0] : item;
  });

  const UpdatedFilter = cleanedOutput.map((h: any) =>
    h === "Total cap" ? "Total" : h
  ); // Total แทน Total Cap

  try {
    const body = {
      key: type,
      gas_day_text: specificData ? specificData : dayjs().format("DD/MM/YYYY"),
      // gas_day_text: '01/09/2025',
      // filter: cleanedOutput
      filter: UpdatedFilter,
    };
    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSummaryNomReportDailyArea = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const cleanedOutput = output.map((item: any) => {
    return item.match(/^H\d+\s/) ? item.split(" ")[0] : item;
  });

  // Daily > Area > MMBTU > Export Column Nomination Point เกินมา https://app.clickup.com/t/86etzchek
  const cleanedOutput2 = cleanedOutput.filter(
    (item: any) => item !== "Nomination Point"
  );

  try {
    const body = {
      key: type,
      gas_day_text: specificData?.gas_day_text,
      filter: cleanedOutput2,
      tab: specificData?.tab,
      overTotalCap: specificData?.over_total_cap,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSummaryNomReportAllNom = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  // export ส่งคีย์ tab และ overTotalCap ไปด้วย ชั้นนอก
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const cleanedOutput = output.map((item: any) => {
    return item.match(/^H\d+\s/) ? item.split(" ")[0] : item;
  });

  // All > Nomination > MMSCF > Excel File Column Total Cap ตัดคำว่า Cap ออก และ Head Column จัดกลาง และข้อมูลใน Row ถ้าเป็นตัวหนังสือชิดซ้าย พวกค่าจัดชิดขวา https://app.clickup.com/t/86euxuwqj
  const UpdatedFilter = cleanedOutput.map((h: any) =>
    h === "Total cap" ? "Total" : h
  ); // Total แทน Total Cap

  try {
    const body = {
      key: type,
      gas_day_text: specificData?.gas_day_text,
      // filter: cleanedOutput
      filter: UpdatedFilter,
      tab: specificData?.tab,
      overTotalCap: specificData?.over_total_cap,
    };
    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSummaryNomReportTotalWeekly = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const cleanedOutput = output.map((item: any) => {
    return item.match(/^H\d+\s/) ? item.split(" ")[0] : item;
  });

  const updatedCleanOutput = cleanedOutput.map((item: any, index: any) => {
    if (
      index === 0 ||
      index === 1 ||
      index === 2 ||
      index === 3 ||
      index === 4 ||
      index === 5 ||
      index === 6 ||
      index === 7 ||
      index === 8 ||
      index === 9
    )
      return item; // "Nomination Point"
    const dayName = cleanedOutput[index - (index % 2 === 0 ? 1 : 0)];

    // if (index % 2 === 1) {
    if (
      index == 10 ||
      index == 15 ||
      index == 20 ||
      index == 25 ||
      index == 30 ||
      index == 35 ||
      index == 40
    ) {
      let date_format;

      switch (index) {
        case 10:
          date_format = `${item} ${specificData[0]}`;
          return date_format;

        case 15:
          date_format = `${item} ${specificData[1]}`;
          return date_format;

        case 20:
          date_format = `${item} ${specificData[2]}`;
          return date_format;

        case 25:
          date_format = `${item} ${specificData[3]}`;
          return date_format;

        case 30:
          date_format = `${item} ${specificData[4]}`;
          return date_format;

        case 35:
          date_format = `${item} ${specificData[5]}`;
          return date_format;

        case 40:
          date_format = `${item} ${specificData[6]}`;
          return date_format;

        default:
          return date_format;
      }
    } else {
      switch (index) {
        case 11:
          return `${days[0]} Utilization (%)`;

        case 16:
          return `${days[1]} Utilization (%)`;

        case 21:
          return `${days[2]} Utilization (%)`;

        case 26:
          return `${days[3]} Utilization (%)`;

        case 31:
          return `${days[4]} Utilization (%)`;

        case 36:
          return `${days[5]} Utilization (%)`;

        case 41:
          return `${days[6]} Utilization (%)`;

        default:
          return `${dayName} Utilization (%)`;
      }
    }
  });

  try {
    const body = {
      key: type,
      gas_day_text: specificData?.[0],
      filter: updatedCleanOutput,
    };
    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSummaryNomReportWeeklyAreaMmbtu = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  type?: any,
  specificData?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const cleanedOutput = output.map((item: any) => {
    return item.match(/^H\d+\s/) ? item.split(" ")[0] : item;
  });

  // R1 : แถบ Weekly > Nomination > MMSCF : Export ยังไม่ตรงกับหน้า UI https://app.clickup.com/t/86et68p7e
  // ตรง weekly หัววัน Sunday ใส่วันมาตอส export ให้ด้วยพี่ "Sunday 20/02/2025" แบบนี้

  // แก้ไข updatedCleanOutput ให้จับจากคำ Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday
  // แล้วเติมวันที่แทน ตามฟังก์ชั่นปัจจุบัน
  // ORIGINAL
  const updatedCleanOutput = cleanedOutput.map((item: any, index: any) => {
    // if (index === 0 || index === 1) return item; // "Nomination Point"
    if (index === 0) return item; // "Nomination Point"

    // const dateIndex = Math.floor((index - 1) / 2);
    const dayName = cleanedOutput[index - (index % 2 === 0 ? 1 : 0)];

    // if (index % 2 === 1) {
    if (
      index == 2 ||
      index == 4 ||
      index == 6 ||
      index == 8 ||
      index == 10 ||
      index == 12 ||
      index == 14
    ) {
      let date_format;

      switch (index) {
        case 2:
          // date_format = `${item} ${specificData[0]}`;
          date_format = `${item}`;
          return date_format;

        case 4:
          // date_format = `${item} ${specificData[0]}`;
          date_format = `${item}`;
          return date_format;

        case 6:
          // date_format = `${item} ${specificData[1]}`;
          date_format = `${item}`;
          return date_format;

        case 8:
          // date_format = `${item} ${specificData[2]}`;
          date_format = `${item}`;
          return date_format;

        case 10:
          // date_format = `${item} ${specificData[3]}`;
          date_format = `${item}`;
          return date_format;

        case 12:
          // date_format = `${item} ${specificData[4]}`;
          date_format = `${item}`;
          return date_format;

        case 14:
          // date_format = `${item} ${specificData[5]}`;
          date_format = `${item}`;
          return date_format;

        default:
          return date_format;
      }
    } else {
      switch (index) {
        case 1:
          return `${days[0]} Utilization (%)`;

        case 3:
          return `${days[1]} Utilization (%)`;

        case 5:
          return `${days[2]} Utilization (%)`;

        case 7:
          return `${days[3]} Utilization (%)`;

        case 9:
          return `${days[4]} Utilization (%)`;

        case 11:
          return `${days[5]} Utilization (%)`;

        case 13:
          return `${days[6]} Utilization (%)`;

        default:
          return `${dayName} Utilization (%)`;
      }
    }
  });

  // Weekly > Area > MMBTU >  Export File Column Nomination Point เกินมา https://app.clickup.com/t/86etzche6
  const cleanedOutput2 = updatedCleanOutput.filter(
    (item: any) => item !== "Nomination Point Utilization (%)"
  );

  try {
    const body = {
      key: type,
      gas_day_text: specificData?.dateOnHeader?.[0],
      tab: specificData?.tab,
      overTotalCap: specificData?.over_total_cap,
      filter: cleanedOutput2,
    };

    // เอา body.gas_day_text ต่อท้าย body.filter. "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" โดย + วันไปทีละ 1

    const start = dayjs(body.gas_day_text, "DD/MM/YYYY");
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // ต่อท้าย gas_day_text + ชื่อวัน (เพิ่มทีละ 1 วัน)
    const withDates = daysOfWeek.map((day, i) => {
      const date = start.add(i, "day").format("DD/MM/YYYY");
      return `${day} ${date}`;
    });

    body.filter = [...body.filter, ...withDates];

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportCapacityRightTemplate = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any
) => {
  // {
  //     "id": [
  //         8,
  //         7,
  //         6,
  //         5
  //     ],
  //     "filter": [
  //         "Term",
  //         "File Recurring Start Date",
  //         "File Period",
  //         "Period Min", ---->
  //         "Period Max", ---->
  //         "Shadow Time",
  //         "Unit",
  //         "Start Date",
  //         "End Date"
  //     ]
  // }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    const ids = data.map((item: any) => item.id);
    const body = {
      id: ids,
      filter: output,
    };
    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportBalOperateAndInstruct = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // {
  //     "bodys": {
  //         "gas_day": "2025-02-28", // fixed ไว้ ของ mock eviden
  //         "skip": 0, // fixed ไว้ ของ mock eviden
  //         "limit": 100 // fixed ไว้ ของ mock eviden
  //     },
  //     "filter": [ // ยังไม่ได้กรอกจริง ไม่ต้องส่งมาก็ได้
  //     ]
  // }

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    // const ids = data.map((item: any) => item.id);
    const body = {
      bodys: specificData,
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportCapacityReleaseCapacityManagementDetail = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any
) => {
  // Convert array of objects to a single object for easier lookup
  const columnVisibilityMap = columnVisibility.reduce((acc: any, curr: any) => {
    return { ...acc, ...curr };
  }, {});

  const output = initialColumns
    .filter(
      (item: any) => columnVisibilityMap[item.key] && item.key !== "action"
    )
    .map((item: any) => item.label);

  try {
    const body = {
      data: data,
      filter: output,
      head_data: [
        {
          submission_time: data2?.submission_time
            ? formatDate(data2?.submission_time)
            : "",
          group: data2?.group ? data2?.group?.name : "",
          contract_code: data2?.contract_code
            ? data2?.contract_code?.contract_code
            : "",
          requested_code: data2?.requested_code ? data2?.requested_code : "",
        },
      ],
      head_column: [
        "Submission Time",
        "Shipper Name",
        "Contract Code",
        "Requested Code",
      ],
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

// ใช้กับ path mgn -> view -> export
export const newExportTest = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    const ids = data.map((item: any) => item.id);
    const body = {
      id: ids,
      idSub: data2,
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const newExportDivision = async (
  path: any,
  data: any,
  data2: any,
  columnVisibility?: any,
  initialColumns?: any
) => {
  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const ids = data.map((item: any) => item.id);

  try {
    const ids = data.map((item: any) => item.id);
    const body = {
      id: ids,
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportSpecific = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  // let arr_of_col_1 = Object.keys(columnVisibility).filter(key => columnVisibility[key] && key !== "action");
  // const filtered = initialColumns.filter((item:any) => arr_of_col_1.includes(item.key));
  // let output = filtered.map((item:any) => item.label);

  const output = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  try {
    // const ids = data.map((item: any) => item.id);
    const body = {
      contractCode: parseInt(specificData),
      filter: output,
    };

    postExport(path, body);
  } catch (error) {
    // Export error occurred
  }
};

export const exportCapaPublic = async (
  path: any,
  data: any,
  columnVisibility?: any,
  initialColumns?: any,
  specificData?: any
) => {
  try {
    let filteredColumnVisibility = Object.keys(columnVisibility)
      .filter((key) => columnVisibility[key] === true)
      .reduce((obj: any, key: any) => {
        obj[key] = columnVisibility[key];
        return obj;
      }, {});

    specificData.filter = [
      ...specificData.filter,
      ...Object.keys(filteredColumnVisibility)
        .filter(
          (key) =>
            filteredColumnVisibility[key] === true &&
            !["zone", "area", "avaliable_capacity_mmbtu_d"].includes(key)
        )
        .map((key) => key + " "), // Append space to each key
    ];

    // postExport(path, body)
    postExport(path, specificData);
  } catch (error) {
    // Export error occurred
  }
};

// อ่าน header Content-Disposition
// const disposition = response.headers.get("content-disposition");
// let fileNameFromHeader = null;

// if (disposition && disposition.includes("filename=")) {
//     // ดึงค่า filename= ออกมา
//     const fileNameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
//     if (fileNameMatch && fileNameMatch[1]) {
//         fileNameFromHeader = fileNameMatch[1].replace(/['"]/g, "");
//     }
// }

// #region postExport
export const postExport = async (path?: any, body?: any, fileName?: any) => {
  // ขึ้น Toast “กำลังส่งออก...”
  const toastId = toast.loading("Exporting...", {
    position: "bottom-right",
    closeOnClick: false,
    draggable: false,
  });

  try {
    const tenko = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    const response = await fetch(`${API_URL}/master/export-files/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tenko}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }
    // console.log('path : ', path);
    // console.log('body : ', body);
    let defaultFileName = path;
    if (path?.includes('audit-log')) {
      defaultFileName = `${path}`.split('?').shift();
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = path === "allocation/allocation-query" ? `${fileName || defaultFileName} - (${body?.bodys?.start_date} - ${body?.bodys?.end_date}).xlsx` : `${fileName || defaultFileName}.xlsx`; // Specify the file name (adjust extension as needed)
    document.body.appendChild(link);
    link.click();
    link.remove();

    // อัปเดต Toast → สำเร็จ
    toast.update(toastId, {
      render: "Export completed.",
      type: "success",
      isLoading: false,
      autoClose: 2000,
      closeOnClick: true,
    });
  } catch (error) {
    toast.update(toastId, {
      render: "Failed to export the file. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
    });

    // toast.error("Failed to export the file. Please try again.", {
    //   position: "bottom-right",
    //   autoClose: 3000,
    // });
  }
};

export const postExportNew = async (path?: any, body?: any, fileName?: any) => {
  // ขึ้น Toast “กำลังส่งออก...”
  const toastId = toast.loading("Exporting...", {
    position: "bottom-right",
    closeOnClick: false,
    draggable: false,
  });

  try {
    const tenko = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tenko}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || path}.xlsx`; // Specify the file name (adjust extension as needed)
    document.body.appendChild(link);
    link.click();
    link.remove();

    // อัปเดต Toast → สำเร็จ
    toast.update(toastId, {
      render: "Export completed.",
      type: "success",
      isLoading: false,
      autoClose: 2000,
      closeOnClick: true,
    });
  } catch (error) {
    toast.update(toastId, {
      render: "Failed to export the file. Please try again.",
      type: "error",
      isLoading: false,
      autoClose: 3000,
      closeOnClick: true,
    });

    // toast.error("Failed to export the file. Please try again.", {
    //   position: "bottom-right",
    //   autoClose: 3000,
    // });
  }
};

export const exportTariffChargeReport = async (
  path: any,
  body: any,
  file_name?: any
) => {
  postExport(path, body, file_name);
};

// แบงค์บอกไม่ต้องส่ง token
const postExportAllocMonthlyReport = async (path?: any, body?: any) => {
  try {
    const response = await fetch(`${API_URL}/master/export-files/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Export failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${path}.xlsx`; // Specify the file name (adjust extension as needed)
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    // Export error occurred
  }
};

// ------- new
export function epAllocationAllocationManagement(payload: any) {
  let { name, columnVisibility, initialColumns, resData } = payload;

  const filter = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const renderStatus: any = (data: any) => {

    let items: any = [
      {
        id: 0,
        label: "Shipper Reviewed",
        color: "#D0E5FD",
      },
      {
        id: 1,
        label: "Rejected",
        color: "#FFF1CE",
      },
      {
        id: 2,
        label: "Accepted",
        color: "#C8FFD7",
      },
      {
        id: 3,
        label: "Allocated",
        color: "#A7EFFF",
      },
      {
        id: 4,
        label: "Not Review",
        color: "#DEDEDE",
      },
    ];

    let m11: any = data?.filter(
      (item: any) => item?.allocation_status?.id == 2
    ); //shipper
    let m13: any = data?.filter(
      (item: any) => item?.allocation_status?.id == 3
    ); //accepted
    let m14: any = data?.filter(
      (item: any) => item?.allocation_status?.id == 4
    ); //allowcated
    let m12: any = data?.filter(
      (item: any) => item?.allocation_status?.id == 5
    ); //rejected

    let renderColor: any =
      m11?.length > 0
        ? items[0]?.color
        : m12?.length > 0
          ? items[1]?.color
          : m13?.length > 0
            ? items[2]?.color
            : m14?.length > 0
              ? items[3]?.color
              : items[4]?.color;
    let renderTxt: any =
      m11?.length > 0
        ? items[0]?.label
        : m12?.length > 0
          ? items[1]?.label
          : m13?.length > 0
            ? items[2]?.label
            : m14?.length > 0
              ? items[3]?.label
              : items[4]?.label;

    // return (<div className="w-[160px] p-1 text-center rounded-[50px]" style={{ background: renderColor }}>{renderTxt}</div>)
    // return { renderTxt, renderColor };
    return renderTxt;
  };

  const newNResData = resData
    ?.flatMap((e: any) => {
      //
      const rowData_ = e["data"]?.map((r: any) => {
        const lengthSubmission =
          (r["allocation_management_comment"]?.length > 0 &&
            r["allocation_management_comment"]
              .map(
                (allocation_management_comment: any) =>
                  `${allocation_management_comment?.remark}`
              )
              .join(",")) ||
          "";

        return {
          ["id"]: r["id"],
          ["Total"]: "",
          ["Status"]: r["allocation_status"]?.["name"] || "",
          ["Gas Day"]:
            (r["gas_day"] && getTodayNow(r["gas_day"]).format("DD/MM/YYYY")) ||
            "",
          ["Shipper Name"]: r["group"]?.["name"], // ""
          ["Contract Code"]: r["contract"] || "", // ""
          ["Nomination Point /Concept Point"]: r["point"] || "",
          ["Entry / Exit"]: r["entry_exit"]?.toUpperCase() || "",
          // ["Nominated Value (MMBTU/D)"]: (r["nominationValue"] !== null && dcimal4(parseToNumber(r["nominationValue"]))) || null, // value ""
          // ["System Allocation (MMBTU/D)"]: (r["systemAllocation"] !== null && dcimal4(parseToNumber(r["systemAllocation"]))) || null,
          // ["Intraday System Allocation"]: (r["intradaySystem"] !== null && dcimal4(parseToNumber(r["intradaySystem"]))) || null,
          // ["Previous Allocation TPA for Review (MMBTU/D)"]: (r["previousAllocationTPAforReview"] !== null && dcimal4(parseToNumber(r["previousAllocationTPAforReview"]))) || null,
          // ["Nominated Value (MMBTU/D)"]: r["nominationValue"] !== null && r["nominationValue"] !== undefined && r["nominationValue"] !== '' ? dcimal4(parseToNumber(r["nominationValue"])) : null, // value ""
          ["Nominated Value (MMBTU/D)"]: dcimal3(parseToNumber(r["nominationValue"] || 0)), // value ""
          ["System Allocation (MMBTU/D)"]: r["systemAllocation"] !== null && r["systemAllocation"] !== undefined && r["systemAllocation"] !== '' ? dcimal4(parseToNumber(r["systemAllocation"])) : null,
          ["Intraday System Allocation (MMBTU/D)"]: r["intradaySystem"] !== null && r["intradaySystem"] !== undefined && r["intradaySystem"] !== '' ? dcimal4(parseToNumber(r["intradaySystem"])) : null,
          ["Previous Allocation TPA for Review (MMBTU/D)"]: r["previousAllocationTPAforReview"] !== null && r["previousAllocationTPAforReview"] !== undefined && r["previousAllocationTPAforReview"] !== '' ? dcimal4(parseToNumber(r["previousAllocationTPAforReview"])) : null,
          ["Shipper Allocation Review (MMBTU/D)"]:
            r["allocation_management_shipper_review"]?.length > 0
              ? dcimal4(
                parseToNumber(
                  r["allocation_management_shipper_review"][0]
                    ?.shipper_allocation_review
                )
              )
              : "",
          // ["Metering Value (MMBTU/D)_temp"]: (r["meteringValue"] !== null && dcimal4(parseToNumber(r["meteringValue"]))) || null,
          ["Metering Value (MMBTU/D)_temp"]: r["meteringValue"] !== null && r["meteringValue"] !== undefined && r["meteringValue"] !== '' ? dcimal4(parseToNumber(r["meteringValue"])) : null,
          ["Metering Value (MMBTU/D)"]: "",
          ["Review Code"]: r["review_code"] || "", // ""
          ["Comment"]:
            lengthSubmission.length > 32767
              ? lengthSubmission.slice(0, 32700) + "เกินลิมิตแล้วโปรดดูที่เว็บ"
              : lengthSubmission, // ""
          ["tab"]: "",
        };
      });

      const rowData = rowData_;

      // ((row?.data?.length > 0 && genManoStatus(row?.data)) || [])?.filter((f:any) => f?.shipper_allocation_review !== null)?.length === 0
      // "Shipper Allocation Review (MMBTU/D)"

      const greenTabShipperAllocationReview = rowData_?.filter((f:any) => f?.["Shipper Allocation Review (MMBTU/D)"] !== "")?.length === 0 ? "" : (dcimal4(
        rowData?.reduce(
          (accumulator: any, currentValue: any) =>
            accumulator +
            parseToNumber(
              currentValue["Shipper Allocation Review (MMBTU/D)"] ?? 0
            ),
          0
        )
      ));

      const greenTabMeterValue = ((rowData?.[0]?.["Metering Value (MMBTU/D)_temp"] !== null &&
        dcimal4(
          parseToNumber(rowData?.[0]?.["Metering Value (MMBTU/D)_temp"])
        )) ||
      null);

      // green
      let setDataObjGreen = {
        ["Total"]: "Total",
        ["Status"]: renderStatus(e["data"]),
        ["Gas Day"]:
          (e["gas_day"] && getTodayNow(e["gas_day"]).format("DD/MM/YYYY")) ||
          "",
        ["Shipper Name"]: "", // ""
        ["Contract Code"]: "", // ""
        ["Nomination Point /Concept Point"]: e["point_text"] || "",
        ["Entry / Exit"]: e["entry_exit"]?.toUpperCase() || "",
        ["Nominated Value (MMBTU/D)"]: dcimal3(
          rowData?.reduce(
            (accumulator: any, currentValue: any) =>
              accumulator +
              parseToNumber(currentValue["Nominated Value (MMBTU/D)"] ?? 0),
            0
          )
        ), // ""
        ["System Allocation (MMBTU/D)"]: dcimal4(
          rowData?.reduce(
            (accumulator: any, currentValue: any) =>
              accumulator +
              parseToNumber(currentValue["System Allocation (MMBTU/D)"] ?? 0),
            0
          )
        ),
        ["Intraday System Allocation (MMBTU/D)"]: dcimal4(
          rowData?.reduce(
            (accumulator: any, currentValue: any) =>
              accumulator +
              parseToNumber(currentValue["Intraday System Allocation (MMBTU/D)"] ?? 0),
            0
          )
        ),
        ["Previous Allocation TPA for Review (MMBTU/D)"]: dcimal4(
          rowData?.reduce(
            (accumulator: any, currentValue: any) =>
              accumulator +
              parseToNumber(
                currentValue["Previous Allocation TPA for Review (MMBTU/D)"] ??
                0
              ),
            0
          )
        ),
        ["Shipper Allocation Review (MMBTU/D)"]: greenTabShipperAllocationReview,
        ["Metering Value (MMBTU/D)"]:
        // rowData_?.filter((f:any) => f?.["Shipper Allocation Review (MMBTU/D)"] !== "")?.length === 0 ? "" :
          greenTabMeterValue,
        ["Review Code"]: "", // ""
        ["Comment"]: "", // ""
        ["tab"]: "green",
        ["isValid"]: (rowData_?.filter((f:any) => f?.["Shipper Allocation Review (MMBTU/D)"] !== "")?.length > 0 && greenTabMeterValue != greenTabShipperAllocationReview) ? false : true
      };

      if (rowData?.length > 0) {
        return [...[setDataObjGreen], ...rowData];
      } else {
        return [];
      }
    })
    ?.flat();

  const formateData = newNResData.map((e: any) => {
    let setData: any = {
      ["Total"]: e["Total"],
      ["Status"]: e["Status"],
      ["Gas Day"]: e["Gas Day"],
      ["Shipper Name"]: e["Shipper Name"],
      ["Contract Code"]: e["Contract Code"],
      ["Nomination Point /Concept Point"]: e["Nomination Point /Concept Point"],
      ["Entry / Exit"]: e["Entry / Exit"],
      ["Nominated Value (MMBTU/D)"]: e["Nominated Value (MMBTU/D)"],
      ["System Allocation (MMBTU/D)"]: e["System Allocation (MMBTU/D)"],
      ["Intraday System Allocation (MMBTU/D)"]: e["Intraday System Allocation (MMBTU/D)"],
      ["Previous Allocation TPA for Review (MMBTU/D)"]:
        e["Previous Allocation TPA for Review (MMBTU/D)"],
      ["Shipper Allocation Review (MMBTU/D)"]:
        e["Shipper Allocation Review (MMBTU/D)"],
      ["Metering Value (MMBTU/D)"]: e["Metering Value (MMBTU/D)"],
      ["Review Code"]: e["Review Code"],
      ["Comment"]: e["Comment"],
      ["tab"]: e["tab"],
      ["isValid"]: e["isValid"],
    };
    let filteredData = Object.keys(setData).reduce((obj: any, key: any) => {
      obj[key] = setData[key];
      return obj;
    }, {});

    return filteredData;
  });

  // sort header
  // ทำไมถึงกรอง comment ออกน้า
  // const filterHeader =
  //   filter?.filter((f: any) => {
  //     return f !== "Comment";
  //   }) || [];
  const filterHeader = filter || [];

  const headerColorMap = {
    Total: "1573A1", // #1573A1
    Status: "1573A1", // #1573A1
    "Gas Day": "1573A1", // #1573A1
    "Shipper Name": "1573A1", // #1573A1
    "Contract Code": "1573A1", // #1573A1
    "Nomination Point /Concept Point": "1573A1", // #1573A1
    "Entry / Exit": "1573A1", // #1573A1
    "Nominated Value (MMBTU/D)": "1573A1", // #1573A1
    "System Allocation (MMBTU/D)": "1573A1", // #1573A1
    "Intraday System Allocation (MMBTU/D)": "1573A1", // #1573A1
    "Previous Allocation TPA for Review (MMBTU/D)": "b8e6ff", // #b8e6ff
    "Shipper Allocation Review (MMBTU/D)": "b8e6ff", // #b8e6ff
    "Metering Value (MMBTU/D)": "b8e6ff", // #b8e6ff
    "Review Code": "b8e6ff", // #b8e6ff
    "Comment": "b8e6ff", // #b8e6ff
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.["tab"] === "green") {
          result[key][i] = "e8ffee"; //#e8ffee
        }
      }
    }

    return result;
  }

  function generateCellTextColortMapMultiple(
    keys: string[],
    data: any[]
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.["tab"] === "green" && data[i]?.["isValid"] === false) {
          result[key][i] = "ed1B24"; //#ed1B24
        }
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const cellTextColorMap = generateCellTextColortMapMultiple(
    ["Shipper Allocation Review (MMBTU/D)", "Metering Value (MMBTU/D)"].filter((key: any) => filterHeader.includes(key)),
    formateData
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap,
    undefined,
    cellTextColorMap
  );
}

// export function epAllocationAllocationReport(payload: any) {
//   let { name, columnVisibility, initialColumns, resData, tabIndex } = payload;

//   // tabIndex 1 daily 2 intraday

//   const EXCLUDED_KEYS =
//     tabIndex === 0 ? new Set(["action", "publication"]) : new Set(["action"]);
//   const filter = initialColumns
//     .filter(
//       (item: any) =>
//         !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
//     )
//     .map((item: any) => item.label);

//   const formateData: any = resData?.map((e: any) => {
//     let setData: any = {
//       ...(tabIndex === 0
//         ? {}
//         : { Publication: e["publication"] ? "Public" : "Unpublic" }),
//       // Publication: e['publication'] ? 'Public' : 'Unpublic',
//       "Entry / Exit": e["entry_exit"],
//       "Gas Day": e["gas_day"],
//       Timestamp:
//         e["execute_timestamp"] &&
//         dayjs(e["execute_timestamp"] * 1000).format("DD/MM/YYYY HH:mm"),
//       "Shipper Name": e["group"]?.["name"],
//       "Contract Code": e["contract"],
//       "Contract Point": e["contract_point"],
//       "Capacity Right (MMBTU/D)": dcimal4(e["contractCapacity"]),
//       "Nominated Value (MMBTU/D)": dcimal4(e["nominationValue"]),
//       "System Allocation (MMBTU/D)": dcimal4(e["allocatedValue"]),
//       "Overusage (MMBTU/D)": dcimal4(e["overusage"]),
//     };

//     let filteredData = Object.keys(setData)
//       .filter((key) => filter.includes(key))
//       .reduce((obj: any, key: any) => {
//         obj[key] = setData[key];
//         return obj;
//       }, {});

//     return filteredData;
//   });

//   const filterHeader =
//     filter?.filter((f: any) => {
//       return f !== "Comment";
//     }) || [];

//   const headerColorMap = {
//     Publication: "1573A1", // #1573A1
//     Total: "1573A1", // #1573A1
//     Status: "1573A1", // #1573A1
//     "Gas Day": "1573A1", // #1573A1
//     Timestamp: "1573A1", // #1573A1
//     "Shipper Name": "1573A1", // #1573A1
//     "Contract Code": "1573A1", // #1573A1
//     "Contract Point": "1573A1", // #1573A1
//     "Capacity Right (MMBTU/D)": "1573A1", // #1573A1
//     "Nomination Point /Concept Point": "1573A1", // #1573A1
//     "Entry / Exit": "1573A1", // #1573A1
//     "Nominated Value (MMBTU/D)": "1573A1", // #1573A1
//     "System Allocation (MMBTU/D)": "1573A1", // #1573A1
//     "Overusage (MMBTU/D)": "1573A1", // #1573A1
//     "Intraday System Allocation": "1573A1", // #1573A1
//     "Previous Allocation TPA for Review (MMBTU/D)": "b8e6ff", // #b8e6ff
//     "Shipper Allocation Review (MMBTU/D)": "b8e6ff", // #b8e6ff
//     "Metering Value (MMBTU/D)": "b8e6ff", // #b8e6ff
//     "Review Code": "b8e6ff", // #b8e6ff
//     Comment: "b8e6ff", // #b8e6ff
//   };

//   function generateCellHighlightMapMultiple(
//     keys: string[],
//     data: any[],
//     color: string
//   ): Record<string, Record<number, string>> {
//     const result: Record<string, Record<number, string>> = {};

//     for (const key of keys) {
//       result[key] = {};
//       for (let i = 0; i < data.length; i++) {
//         if (data[i]?.["tab"] === "green") {
//           result[key][i] = "e8ffee"; //#e8ffee
//         }
//       }
//     }

//     return result;
//   }

//   const cellHighlightMap = generateCellHighlightMapMultiple(
//     filterHeader,
//     formateData,
//     "EAF5F8"
//   );

//   const result = filterNestedData(formateData, filterHeader);

//   return exportDataToExcelWithMultiLevelHeaderNew(
//     result,
//     name,
//     true,
//     headerColorMap,
//     cellHighlightMap
//   );
// }

export async function epAllocationAllocationReport(payload: any) {
  const userDT: any = getUserValue();
  const toExcelNumber = (v: any) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  let { name, columnVisibility, initialColumns, resData, tabIndex } = payload;

  // tabIndex 1 daily 2 intraday

  const EXCLUDED_KEYS =
    (tabIndex === 1 || tabIndex === '1') ? new Set(["action", "publication"]) : new Set(["action"]);
  const filter = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  const formateData = resData.map((e: any) => {
    const contractCapacity = toExcelNumber(e["contractCapacity"]);
    const nominationValue = toExcelNumber(e["nominationValue"]);
    const allocatedValue = toExcelNumber(e["allocatedValue"]);
    const overusage = toExcelNumber(e["overusage"]);
    return ({
    ...((tabIndex === 1 || tabIndex === '1')
      ? {}
      : userDT?.account_manage?.[0]?.user_type_id !== 3 ? { Publication: e["publication"] ? "Public" : "Unpublic" } : {}),
    // : { Publication: e["publication"] ? "Public" : "Unpublic" }),
    'Entry / Exit': e['entry_exit_obj']?.['name'],
    'Gas Day': e['gas_day']
      ? dayjs(e['gas_day']).format('DD/MM/YYYY')
      : '',
    ...((tabIndex === 1 || tabIndex === '1')
      ? {}
      : {
        'Gas Hour':
          e['gas_hour'] !== undefined
            ? `${e.gas_hour >= 10 ? e.gas_hour : '0' + e.gas_hour}:00`
            : '',
      }),
    Timestamp:
      e['execute_timestamp'] &&
      dayjs(e['execute_timestamp'] * 1000).format('DD/MM/YYYY HH:mm'),
    "Shipper Name": e["group"]?.["name"],
    "Contract Code": e["contract"],
    "Contract Point": e["contract_point"],
    // "Capacity Right (MMBTU/D)": dcimal4(e["contractCapacity"]),
    // "Nominated Value (MMBTU/D)": dcimal4(e["nominationValue"]),
    // "System Allocation (MMBTU/D)": dcimal4(e["allocatedValue"]),
    // "Overusage (MMBTU/D)": dcimal4(e["overusage"]),
    // "Capacity Right (MMBTU/D)": e["contractCapacity"] !== null && e["contractCapacity"] !== undefined && e["contractCapacity"] !== '' ? dcimal4(e["contractCapacity"]) : null,
    // "Nominated Value (MMBTU/D)": e["nominationValue"] !== null && e["nominationValue"] !== undefined && e["nominationValue"] !== '' ? dcimal4(e["nominationValue"]) : null,
    // "System Allocation (MMBTU/D)": e["allocatedValue"] !== null && e["allocatedValue"] !== undefined && e["allocatedValue"] !== '' ? dcimal4(e["allocatedValue"]) : null,
    // "Overusage (MMBTU/D)": e["overusage"] !== null && e["overusage"] !== undefined && e["overusage"] !== '' ? dcimal4(e["overusage"]) : null,
    // "Capacity Right (MMBTU/D)": toExcelNumber(e["contractCapacity"]),
    // "Nominated Value (MMBTU/D)": toExcelNumber(e["nominationValue"]),
    // "System Allocation (MMBTU/D)": toExcelNumber(e["allocatedValue"]),
    // "Overusage (MMBTU/D)": toExcelNumber(e["overusage"]),
      "Capacity Right (MMBTU/D)": (contractCapacity || contractCapacity == 0) ? dcimal3(contractCapacity) : null,
      "Nominated Value (MMBTU/D)": (nominationValue || nominationValue == 0) ? dcimal3(nominationValue) : null,
      "System Allocation (MMBTU/D)": (allocatedValue || allocatedValue == 0) ? dcimal4(allocatedValue) : null,
      "Overusage (MMBTU/D)": (overusage || overusage == 0) ? dcimal3(overusage) : null,
    })
  });

  const filterHeader =
    filter?.filter((f: any) => {
      return f !== "Comment";
    }) || [];

  const headerColorMap = {
    Publication: "1573A1", // #1573A1
    Total: "1573A1", // #1573A1
    Status: "1573A1", // #1573A1
    "Gas Day": "1573A1", // #1573A1
    "Gas Hour": "1573A1", // #1573A1
    Timestamp: "1573A1", // #1573A1
    "Shipper Name": "1573A1", // #1573A1
    "Contract Code": "1573A1", // #1573A1
    "Contract Point": "1573A1", // #1573A1
    "Capacity Right (MMBTU/D)": "1573A1", // #1573A1
    "Nomination Point /Concept Point": "1573A1", // #1573A1
    "Entry / Exit": "1573A1", // #1573A1
    "Nominated Value (MMBTU/D)": "1573A1", // #1573A1
    "System Allocation (MMBTU/D)": "1573A1", // #1573A1
    "Overusage (MMBTU/D)": "1573A1", // #1573A1
    "Intraday System Allocation": "1573A1", // #1573A1
    "Previous Allocation TPA for Review (MMBTU/D)": "b8e6ff", // #b8e6ff
    "Shipper Allocation Review (MMBTU/D)": "b8e6ff", // #b8e6ff
    "Metering Value (MMBTU/D)": "b8e6ff", // #b8e6ff
    "Review Code": "b8e6ff", // #b8e6ff
    Comment: "b8e6ff", // #b8e6ff
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.["tab"] === "green") {
          result[key][i] = "e8ffee"; //#e8ffee
        }
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  // const mainResult = this.filterNestedData(formateData, filterHeader);
  const mainResult = formateData;

  let url = `/master/allocation/allocation-report-view?skip=0&limit=0&tab=${tabIndex}`
  // หาวันที่ gas_day น้อยที่สุดและมากที่สุดของ resData
  let minGasDay: string | null = null;
  let maxGasDay: string | null = null;
  if (Array.isArray(resData) && resData.length > 0) {
    // กรองที่มีค่า gas_day
    const gasDays = resData
      .map((d: any) => d?.gas_day)
      .filter((v: any) => !!v);
    if (gasDays.length > 0) {
      // สมมติเป็น string format "YYYY-MM-DD" หรือ "YYYY/MM/DD"
      minGasDay = gasDays.reduce((min: string, cur: string) =>
        cur < min ? cur : min, gasDays[0]
      );
      maxGasDay = gasDays.reduce((max: string, cur: string) =>
        cur > max ? cur : max, gasDays[0]
      );
    }
  }

  if (minGasDay) {
    url += `&start_date=${minGasDay}`
  }

  if (maxGasDay) {
    url += `&end_date=${maxGasDay}`
  }

  let subSheetResData: any[] = []
  try {
    const response: any = await getService(url);
    subSheetResData = Array.isArray(response) ? response : [];
  } catch (error) {
    subSheetResData = []
  }

  const overusageDetailRows: any[] = [];

  subSheetResData.forEach((e: any) => {
    overusageDetailRows.push({
      'Gas Day': e['gas_day']
        ? dayjs(e['gas_day']).format('DD/MM/YYYY')
        : '',
      'Shipper Name': e['group']?.['name'],
      'Contract Code': e['contract'],
      'Nomination Point/Concept Point': e['point'],
      // 'Area': e['area'],
      'Entry / Exit': e['entry_exit_obj']?.['name'] || e['entry_exit'],
      'Contract Point': e['relation_point'],
      ...((tabIndex === 1 || tabIndex === '1')
        ? {}
        : {
          'Gas Hour':
            e['gas_hour'] !== undefined
              ? `${e.gas_hour >= 10 ? e.gas_hour : '0' + e.gas_hour}:00`
              : '',
        }),
      "Nominated Value (MMBTU/D)": dcimal3(e["nominationValue"]),
      "System Allocation (MMBTU/D)": (e["allocatedValue"] || e["allocatedValue"] == 0) ? dcimal4(e["allocatedValue"]) : '',
      // "Capacity Right (MMBTU/D)": dcimal4(e["contractCapacity"]),
      // "Overusage (MMBTU/D)": dcimal4(e["overusage"]),
      '': '',
      Timestamp:
        e['execute_timestamp'] &&
        dayjs(e['execute_timestamp'] * 1000).format('DD/MM/YYYY HH:mm'),
    });
  });

  let detailHeaderColorMap: {} = {}
  let detailHighlightMap: Record<string, Record<number, string>> = {};
  if (overusageDetailRows.length > 0) {
    const detailHeaders = Object.keys(overusageDetailRows[0]);

    detailHeaderColorMap = detailHeaders.reduce(
      (acc, k) => ({ ...acc, [k]: '1573A1' }),
      {},
    );

    detailHighlightMap = generateCellHighlightMapMultiple(
      detailHeaders,
      overusageDetailRows,
      'EAF5F8',
    );
  }


  return exportAllocationReportToExcel(
    mainResult,
    overusageDetailRows,
    name,
    true,
    headerColorMap,
    cellHighlightMap,
    detailHeaderColorMap,
    detailHighlightMap
  )
}

export function epBalancingBalanceReport(payload: any) {
  let {
    name,
    columnVisibility,
    initialColumns,
    resData,
    shipperGroupData,
    filterShowTotal,
    filterShowTotalAllShipper,
    isShipper
  } = payload;

  let filterx: string[] = [];

  // Min. (MMBTU/D)
  // Min. Inventory (MMBTU)

  // filterShowTotal true
  // filterShowTotalAllShipper false
  // สีฟ้า

  // filterShowTotal false
  // filterShowTotalAllShipper false
  // ขาว ฟ้า เหลือง

  // filterShowTotal false
  // filterShowTotalAllShipper true
  // เหลือง

  // filterShowTotal true
  // filterShowTotalAllShipper true
  // ฟ้า เหลือง

  // ฝั่ง summary
  columnVisibility.publicate && filterx.push("Publicate");
  columnVisibility.gas_day && filterx.push("Gas Day");
  columnVisibility.gas_hour && filterx.push("Gas Hour");
  columnVisibility.timestamp && filterx.push("Timestamp");
  columnVisibility.shipper_name && filterx.push("Summary Pane.Shipper Name");
  columnVisibility.plan_actual && filterx.push("Summary Pane.Plan / Actual");
  columnVisibility.contract_code && filterx.push("Summary Pane.Contract Code");
  columnVisibility.east_total_entry_mmbtud &&
    filterx.push("Summary Pane.Total Entry (MMBTU).East");
  columnVisibility.west_total_entry_mmbtud &&
    filterx.push("Summary Pane.Total Entry (MMBTU).West");
  columnVisibility.east_west_total_entry_mmbtud &&
    filterx.push("Summary Pane.Total Entry (MMBTU).East-West");
  columnVisibility.east_total_exit_mmbtud &&
    filterx.push("Summary Pane.Total Exit (MMBTU).East");
  columnVisibility.west_total_exit_mmbtud &&
    filterx.push("Summary Pane.Total Exit (MMBTU).West");
  columnVisibility.east_west_total_exit_mmbtud &&
    filterx.push("Summary Pane.Total Exit (MMBTU).East-West");
  columnVisibility.east_imbalance_zone_mmbtud &&
    filterx.push("Summary Pane.Imbalance Zone (MMBTU).East");
  columnVisibility.west_imbalance_zone_mmbtud &&
    filterx.push("Summary Pane.Imbalance Zone (MMBTU).West");
  columnVisibility.total_imbalance_zone_mmbtud &&
    filterx.push("Summary Pane.Imbalance Zone (MMBTU).Total");
  columnVisibility.east_instructed_flow_mmbtud &&
    filterx.push("Summary Pane.Instructed Flow (MMBTU).East");
  columnVisibility.west_instructed_flow_mmbtud &&
    filterx.push("Summary Pane.Instructed Flow (MMBTU).West");
  columnVisibility.east_west_instructed_flow_mmbtud &&
    filterx.push("Summary Pane.Instructed Flow (MMBTU).East-West");
  columnVisibility.east_shrinkage_volume_mmbtud &&
    filterx.push("Summary Pane.Shrinkage Volume (MMBTU).East");
  columnVisibility.west_shrinkage_volume_mmbtud &&
    filterx.push("Summary Pane.Shrinkage Volume (MMBTU).West");
  columnVisibility.east_park_mmbtud &&
    filterx.push("Summary Pane.Park (MMBTU).East");
  columnVisibility.west_park_mmbtud &&
    filterx.push("Summary Pane.Park (MMBTU).West");
  columnVisibility.east_unpark_mmbtud &&
    filterx.push("Summary Pane.Unpark (MMBTU).East");
  columnVisibility.west_unpark_mmbtud &&
    filterx.push("Summary Pane.Unpark (MMBTU).West");
  columnVisibility.east_sod_park_mmbtud &&
    filterx.push("Summary Pane.SOD Park (MMBTU).East");
  columnVisibility.west_sod_park_mmbtud &&
    filterx.push("Summary Pane.SOD Park (MMBTU).West");
  columnVisibility.east_eod_park_mmbtud &&
    filterx.push("Summary Pane.EOD Park (MMBTU).East");
  columnVisibility.west_eod_park_mmbtud &&
    filterx.push("Summary Pane.EOD Park (MMBTU).West");
  columnVisibility.east_min_inventory_change_mmbtud &&
    filterx.push("Summary Pane.Change Min Inventory (MMBTU).East");
  columnVisibility.west_min_inventory_change_mmbtud &&
    filterx.push("Summary Pane.Change Min Inventory (MMBTU).West");
  columnVisibility.east_reserve_bal_mmbtud &&
    filterx.push("Summary Pane.Reserve Bal. (MMBTU).East");
  columnVisibility.west_reserve_bal_mmbtud &&
    filterx.push("Summary Pane.Reserve Bal. (MMBTU).West");
  columnVisibility.east_adjust_imbalance_mmbtud &&
    filterx.push("Summary Pane.Adjust Imbalance (MMBTU).East");
  columnVisibility.west_adjust_imbalance_mmbtud &&
    filterx.push("Summary Pane.Adjust Imbalance (MMBTU).West");
  columnVisibility.east_vent_gas && filterx.push("Summary Pane.Vent Gas (MMBTU).East");
  columnVisibility.west_vent_gas && filterx.push("Summary Pane.Vent Gas (MMBTU).West");
  columnVisibility.east_commissioning_gas &&
    filterx.push("Summary Pane.Commissioning Gas (MMBTU).East");
  columnVisibility.west_commissioning_gas &&
    filterx.push("Summary Pane.Commissioning Gas (MMBTU).West");
  columnVisibility.east_other_gas &&
    filterx.push("Summary Pane.Other Gas (MMBTU).East");
  columnVisibility.west_other_gas &&
    filterx.push("Summary Pane.Other Gas (MMBTU).West");
  columnVisibility.east_daily_imb_mmbtud &&
    filterx.push("Summary Pane.Daily IMB (MMBTU).East");
  columnVisibility.west_daily_imb_mmbtud &&
    filterx.push("Summary Pane.Daily IMB (MMBTU).West");
  columnVisibility.total_aip_mmbtud &&
    filterx.push("Summary Pane.AIP (MMBTU).Total");
  columnVisibility.total_ain_mmbtud &&
    filterx.push("Summary Pane.AIN (MMBTU).Total");
  columnVisibility.total_percentage_imb &&
    filterx.push("Summary Pane.%Imb.Total");
  columnVisibility.total_percentage_abslmb &&
    filterx.push("Summary Pane.%Absimb.Total");
  columnVisibility.total_percentage_abslmb &&
    filterx.push("Summary Pane.%Absimb.Total");
  columnVisibility.east_acc_imb_month_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU).East");
  columnVisibility.west_acc_imb_month_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU).West");
  columnVisibility.east_acc_imb_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MMBTU).East");
  columnVisibility.west_acc_imb_mmbtud &&
    filterx.push("Summary Pane.Acc. IMB. (MMBTU).West");
  columnVisibility.east_acc_imb_inventory_mmbtud &&
    filterx.push("Summary Pane.Min. Inventory (MMBTU).East");
  // ตรงนี้มีคีย์หาย ของ summary

  columnVisibility.east_min_inventory_mmbtud &&
    filterx.push("Summary Pane.Min. Inventory (MMBTU).East");
  columnVisibility.west_min_inventory_mmbtud &&
    filterx.push("Summary Pane.Min. Inventory (MMBTU).West");



  // ฝั่ง detail
  columnVisibility.gsp && filterx.push("Detail Pane.Entry.East.GSP");
  columnVisibility.bypass_gas &&
    filterx.push("Detail Pane.Entry.East.Bypass Gas");
  columnVisibility.lng && filterx.push("Detail Pane.Entry.East.LNG");
  columnVisibility.others_east && filterx.push("Detail Pane.Entry.East.Others");
  columnVisibility.ydn && filterx.push("Detail Pane.Entry.West.YDN");
  columnVisibility.ytg && filterx.push("Detail Pane.Entry.West.YTG");
  columnVisibility.ztk && filterx.push("Detail Pane.Entry.West.ZTK");
  columnVisibility.others_west && filterx.push("Detail Pane.Entry.West.Others");
  columnVisibility.ra6_east &&
    filterx.push("Detail Pane.Entry.East-West.RA6 East");
  columnVisibility.ra6_west &&
    filterx.push("Detail Pane.Entry.East-West.RA6 West");
  columnVisibility.bvw10_east &&
    filterx.push("Detail Pane.Entry.East-West.BVW10 East");
  columnVisibility.bvw10_West &&
    filterx.push("Detail Pane.Entry.East-West.BVW10 West");
  columnVisibility.egat && filterx.push("Detail Pane.Exit.East.EGAT");
  columnVisibility.ipp && filterx.push("Detail Pane.Exit.East.IPP");
  columnVisibility.others_east_exit &&
    filterx.push("Detail Pane.Exit.East.Others");
  columnVisibility.egat_west && filterx.push("Detail Pane.Exit.West.EGAT");
  columnVisibility.ipp_west && filterx.push("Detail Pane.Exit.West.IPP");
  columnVisibility.others_west_exit &&
    filterx.push("Detail Pane.Exit.West.Others");
  columnVisibility.egat_east_west &&
    filterx.push("Detail Pane.Exit.East-West.EGAT");
  columnVisibility.ipp_east_west &&
    filterx.push("Detail Pane.Exit.East-West.IPP");
  columnVisibility.others_east_west_exit &&
    filterx.push("Detail Pane.Exit.East-West.Others");
  columnVisibility.east_f2andg && filterx.push("Detail Pane.Exit.F2&G.East");
  columnVisibility.west_f2andg && filterx.push("Detail Pane.Exit.F2&G.West");
  columnVisibility.east_e && filterx.push("Detail Pane.Exit.E.East");
  columnVisibility.west_e && filterx.push("Detail Pane.Exit.E.West");

  const EXCLUDED_KEYS = new Set(["action"]);
  const filter = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  const keyHead = [
    "custom_gas_day", // Gas Day
    "custom_shipper_name", // Shipper Name
    "custom_contract_code", // Contract Code
    "total_entry_east",
    "total_entry_west",
    "total_entry_east-west",
    "total_exit_east",
    "total_exit_west",
    "total_exit_east-west",
    "imbZone_east",
    "imbZone_west",
    "imbZone_total",
    "instructedFlow_east",
    "instructedFlow_west",
    "instructedFlow_east-west",
    "shrinkage_east",
    "shrinkage_west",
    "park_east",
    "park_west",
    "Unpark_east",
    "Unpark_west",
    "SodPark_east",
    "SodPark_west",
    "EodPark_east",
    "EodPark_west",
    "minInventoryChange_east",
    "minInventoryChange_west",
    "reserveBal_east",
    "reserveBal_west",
    "adjustDailyImb_east",
    "adjustDailyImb_west",
    "ventGas_east",
    "ventGas_west",
    "commissioningGas_east",
    "commissioningGas_west",
    "otherGas_east",
    "otherGas_west",
    "dailyImb_east",
    "dailyImb_west",
    "aip",
    "ain",
    "absimb",
    "custom_abs_absimb", //ABS(absimb)
    "accImbMonth_east",
    "accImbMonth_west",
    "accImb_east",
    "accImb_west",
    "percentage_abslmb",
    "minInventory_east",
    "minInventory_west",
    "detail_entry_east_gsp",
    "detail_entry_east_bypassGas",
    "detail_entry_east_lng",
    "custom_detail_entry_east_", //detail_entry_east_ อื่นบวกกัน other
    "detail_entry_west_yadana",
    "detail_entry_west_yetagun",
    "detail_entry_west_zawtika",
    "custom_detail_entry_west_", //detail_entry_west_ อื่นบวกกัน other
    "detail_entry_east-west_ra6East",
    "detail_entry_east-west_ra6West",
    "detail_entry_east-west_bvw10East",
    "detail_entry_east-west_bvw10West",
    "detail_exit_east_egat",
    "detail_exit_east_ipp",
    "custom_detail_exit_east_", //detail_exit_east_ อื่นบวกกัน other
    "detail_exit_west_egat",
    "detail_exit_west_ipp",
    "custom_detail_exit_west_", //detail_exit_west_ อื่นบวกกัน other
    "detail_exit_east-west_egat",
    "detail_exit_east-west_ipp",
    "custom_detail_exit_east-west_", //detail_exit_east-west_ อื่นบวกกัน other
    "detail_exit_east_F2andG",
    "detail_exit_west_F2andG",
    "detail_exit_E_east",
    "detail_exit_E_west",
  ];

  const sumDetail = (
    values: any[],
    startWithTag: string,
    excludedTags: string[]
  ) => {
    if (!Array.isArray(values)) return null;

    const sum = values
      .filter((item: any) => {
        const tag = item?.tag;
        return (
          tag &&
          tag.startsWith(startWithTag) &&
          !excludedTags.includes(tag.replace(startWithTag, ""))
        );
      })
      .reduce((acc: number | null, item: any) => {
        const raw = item?.value;

        if (raw === null || raw === undefined) return acc;

        const num = Number(raw);
        if (isNaN(num)) return acc;

        return acc === null ? num : acc + num;
      }, null);

    // 🔥 ถ้าไม่มีค่าเลย อย่า format
    if (sum === null) return null;

    return formatNumberFourDecimalNom(sum);
  };

  const newData = resData?.flatMap((e: any) => {
    const {
      values: valuesTotalAll,
      shipper_data,
      gas_day,
      request_number,
      execute_timestamp,
      ...nE
    } = e;
    const gasDay = dayjs(e["gas_day"], "YYYY-MM-DD").format("DD/MM/YYYY");

    // ขาว ฟ้า
    const totalShipper = shipper_data?.flatMap((sp: any) => {
      const { shipper, values: valuesTotalShipper, contract_data, ...nSp } = sp;

      // ขาว
      const contractData = contract_data?.map((cd: any) => {
        const { contract, values: valuesContract, ...nCd } = cd;

        const contractObj = listToObject(
          keyHead,
          [
            ...valuesContract,
            { tag: "custom_gas_day", value: gasDay || "" },
            { tag: "custom_shipper_name", value: shipperGroupData?.find((f: any) => {
              return f?.id_name === shipper;
            })?.name || "" },
            { tag: "custom_contract_code", value: contract || "" },
          ],
          shipperGroupData
        );

        return {
          ...contractObj,
          ["values_"]: valuesContract,
        };
      });


      const totalShipper = listToObject(
        keyHead,
        [
          ...valuesTotalShipper,
          {
            tag: "custom_gas_day",
            value: `TOTAL : `,
          },
          { tag: "custom_shipper_name", 
            value: `${shipperGroupData?.find((f: any) => {
              return f?.id_name === shipper;
            })?.name
              }(${gasDay})` },
          { tag: "custom_contract_code", value: "" },
        ],
        shipperGroupData
      );
      // ฟ้า
      const ntotalShipper = {
        ...totalShipper,
        ["values_"]: valuesTotalShipper,
      };

      if (filterShowTotal && filterShowTotalAllShipper) {
        // filterShowTotal true
        // filterShowTotalAllShipper true
        // ฟ้า เหลือง
        return [ntotalShipper];
      } else if (!filterShowTotal && filterShowTotalAllShipper) {
        // filterShowTotal false
        // filterShowTotalAllShipper true
        // เหลือง
        return [];
      } else if (!filterShowTotal && !filterShowTotalAllShipper) {
        // filterShowTotal false
        // filterShowTotalAllShipper false
        // ขาว ฟ้า เหลือง
        return [...contractData, ntotalShipper];
      } else if (filterShowTotal && !filterShowTotalAllShipper) {
        // filterShowTotal true
        // filterShowTotalAllShipper false
        // สีฟ้า
        return [ntotalShipper];
      }

      // return [...contractData, ntotalShipper];
    });

    const totalAll = listToObject(
      keyHead,
      [
        ...valuesTotalAll,
        { tag: "custom_gas_day", value: `TOTAL ALL : ` },
        { tag: "custom_shipper_name", value: `(${gasDay})` },
        { tag: "custom_contract_code", value: "" },
      ],
      shipperGroupData
    );


    // เหลือง
    // const ntotalAll = { ...totalAll, ["values_"]: valuesTotalAll };

    // ทำงี้เพราะไม่ให้ shipper กด export แล้วเห็น row เหลือง
    const ntotalAll = {
      ...(isShipper ? {} : totalAll),
      values_: valuesTotalAll,
    };

    if (filterShowTotal && filterShowTotalAllShipper) {
      // filterShowTotal true
      // filterShowTotalAllShipper true
      // ฟ้า เหลือง
      return [...totalShipper, ntotalAll];
    } else if (!filterShowTotal && filterShowTotalAllShipper) {
      // filterShowTotal false
      // filterShowTotalAllShipper true
      // เหลือง
      return [ntotalAll];
    } else if (!filterShowTotal && !filterShowTotalAllShipper) {
      // filterShowTotal false
      // filterShowTotalAllShipper false
      // ขาว ฟ้า เหลือง
      return [...totalShipper, ntotalAll];
    } else if (filterShowTotal && !filterShowTotalAllShipper) {
      // filterShowTotal true
      // filterShowTotalAllShipper false
      // สีฟ้า
      return [...totalShipper];
    }
  });

  const formateData = newData.map((e: any) => {
    let setData: any = {
      ["Gas Day"]: e["custom_gas_day"] || "",
      ["Summary Pane"]: {
        ["Shipper Name"]: e["custom_shipper_name"] || "",
        ["Contract Code"]: e["custom_contract_code"] || "",
        ["Total Entry (MMBTU)"]: {
          ["East"]: e["total_entry_east"] !== null && e["total_entry_east"] !== undefined ? formatNumberFourDecimalNom(e["total_entry_east"]) : '',
          ["West"]: e["total_entry_west"] !== null && e["total_entry_west"] !== undefined ? formatNumberFourDecimalNom(e["total_entry_west"]) : '',
          ["East-West"]: e["total_entry_east-west"] !== null && e["total_entry_east-west"] !== undefined ? formatNumberFourDecimalNom(e["total_entry_east-west"]) : '',
        },
        ["Total Exit (MMBTU)"]: {
          ["East"]: e["total_exit_east"] !== null && e["total_exit_east"] !== undefined ? formatNumberFourDecimalNom(e["total_exit_east"]) : '',
          ["West"]: e["total_exit_west"] !== null && e["total_exit_west"] !== undefined ? formatNumberFourDecimalNom(e["total_exit_west"]) : '',
          ["East-West"]: e["total_exit_east-west"] !== null && e["total_exit_east-west"] !== undefined ? formatNumberFourDecimalNom(e["total_exit_east-west"]) : '',
        },
        ["Imbalance Zone (MMBTU)"]: {
          ["East"]: e["imbZone_east"] !== null && e["imbZone_east"] !== undefined ? formatNumberFourDecimalNom(e["imbZone_east"]) : '',
          ["West"]: e["imbZone_west"] !== null && e["imbZone_west"] !== undefined ? formatNumberFourDecimalNom(e["imbZone_west"]) : '',
          ["Total"]: e["imbZone_total"] !== null && e["imbZone_total"] !== undefined ? formatNumberFourDecimalNom(e["imbZone_total"]) : '',
        },
        ["Instructed Flow (MMBTU)"]: {
          ["East"]: e["instructedFlow_east"] !== null && e["instructedFlow_east"] !== undefined ? formatNumberFourDecimalNom(e["instructedFlow_east"]) : '',
          ["West"]: e["instructedFlow_west"] !== null && e["instructedFlow_west"] !== undefined ? formatNumberFourDecimalNom(e["instructedFlow_west"]) : '',
          ["East-West"]: e["instructedFlow_east-west"] !== null && e["instructedFlow_east-west"] !== undefined ? formatNumberFourDecimalNom(e["instructedFlow_east-west"]) : '',
        },
        ["Shrinkage Volume (MMBTU)"]: {
          ["East"]: e["shrinkage_east"] !== null && e["shrinkage_east"] !== undefined ? formatNumberFourDecimalNom(e["shrinkage_east"]) : '',
          ["West"]: e["shrinkage_west"] !== null && e["shrinkage_west"] !== undefined ? formatNumberFourDecimalNom(e["shrinkage_west"]) : '',
        },
        ["Park (MMBTU)"]: {
          ["East"]: e["park_east"] !== null && e["park_east"] !== undefined ? formatNumberFourDecimalNom(e["park_east"]) : '',
          ["West"]: e["park_west"] !== null && e["park_west"] !== undefined ? formatNumberFourDecimalNom(e["park_west"]) : '',
        },
        ["Unpark (MMBTU)"]: {
          ["East"]: e["Unpark_east"] !== null && e["Unpark_east"] !== undefined ? formatNumberFourDecimalNom(e["Unpark_east"]) : '',
          ["West"]: e["Unpark_west"] !== null && e["Unpark_west"] !== undefined ? formatNumberFourDecimalNom(e["Unpark_west"]) : '',
        },
        ["SOD Park (MMBTU)"]: {
          ["East"]: e["SodPark_east"] !== null && e["SodPark_east"] !== undefined ? formatNumberFourDecimalNom(e["SodPark_east"]) : '',
          ["West"]: e["SodPark_west"] !== null && e["SodPark_west"] !== undefined ? formatNumberFourDecimalNom(e["SodPark_west"]) : '',
        },
        ["EOD Park (MMBTU)"]: {
          ["East"]: e["EodPark_east"] !== null && e["EodPark_east"] !== undefined ? formatNumberFourDecimalNom(e["EodPark_east"]) : '',
          ["West"]: e["EodPark_west"] !== null && e["EodPark_west"] !== undefined ? formatNumberFourDecimalNom(e["EodPark_west"]) : '',
        },
        ["Change Min Inventory (MMBTU)"]: {
          ["East"]: e["minInventoryChange_east"] !== null && e["minInventoryChange_east"] !== undefined ? formatNumberFourDecimalNom(e["minInventoryChange_east"]) : '',
          ["West"]: e["minInventoryChange_west"] !== null && e["minInventoryChange_west"] !== undefined ? formatNumberFourDecimalNom(e["minInventoryChange_west"]) : '',
        },
        ["Reserve Bal. (MMBTU)"]: {
          ["East"]: e["reserveBal_east"] !== null && e["reserveBal_east"] !== undefined ? formatNumberFourDecimalNom(e["reserveBal_east"]) : '',
          ["West"]: e["reserveBal_west"] !== null && e["reserveBal_west"] !== undefined ? formatNumberFourDecimalNom(e["reserveBal_west"]) : '',
        },
        ["Adjust Imbalance (MMBTU)"]: {
          ["East"]: e["adjustDailyImb_east"] !== null && e["adjustDailyImb_east"] !== undefined ? formatNumberFourDecimalNom(e["adjustDailyImb_east"]) : '',
          ["West"]: e["adjustDailyImb_west"] !== null && e["adjustDailyImb_west"] !== undefined ? formatNumberFourDecimalNom(e["adjustDailyImb_west"]) : '',
        }, 
        ["Vent Gas (MMBTU)"]: {
          ["East"]: e["ventGas_east"] !== null && e["ventGas_east"] !== undefined ? formatNumberFourDecimalNom(e["ventGas_east"]) : '',
          ["West"]: e["ventGas_west"] !== null && e["ventGas_west"] !== undefined ? formatNumberFourDecimalNom(e["ventGas_west"]) : '',
        },
        ["Commissioning Gas (MMBTU)"]: {
          ["East"]: e["commissioningGas_east"] !== null && e["commissioningGas_east"] !== undefined ? formatNumberFourDecimalNom(e["commissioningGas_east"]) : '',
          ["West"]: e["commissioningGas_west"] !== null && e["commissioningGas_west"] !== undefined ? formatNumberFourDecimalNom(e["commissioningGas_west"]) : '',
        },
        ["Other Gas (MMBTU)"]: {
          ["East"]: e["otherGas_east"] !== null && e["otherGas_east"] !== undefined ? formatNumberFourDecimalNom(e["otherGas_east"]) : '',
          ["West"]: e["otherGas_west"] !== null && e["otherGas_west"] !== undefined ? formatNumberFourDecimalNom(e["otherGas_west"]) : '',
        },
        ["Daily IMB (MMBTU)"]: {
          ["East"]: e["dailyImb_east"] !== null && e["dailyImb_east"] !== undefined ? formatNumberFourDecimalNom(e["dailyImb_east"]) : '',
          ["West"]: e["dailyImb_west"] !== null && e["dailyImb_west"] !== undefined ? formatNumberFourDecimalNom(e["dailyImb_west"]) : '',
        },
        ["AIP (MMBTU)"]: {
          ["Total"]: e["aip"] !== null && e["aip"] !== undefined ? formatNumberFourDecimalNom(e["aip"]) : '',
        },
        ["AIN (MMBTU)"]: {
          ["Total"]: e["ain"] !== null && e["ain"] !== undefined ? formatNumberFourDecimalNom(e["ain"]) : '',
        },
        ["%Imb"]: {
          ["Total"]: e["absimb"] !== null && e["absimb"] !== undefined ? formatNumberFourDecimalNom(e["absimb"]) : '',
        },
        ["%Absimb"]: {
          ["Total"]: e["absimb"] !== null && e["absimb"] !== undefined
            ? formatNumberFourDecimalNom(Math.abs(parseToNumber(e["absimb"]) ?? 0))
            : "",
        },
        ["Acc. IMB. (MONTH) (MMBTU)"]: {
          ["East"]: e["accImbMonth_east"] !== null && e["accImbMonth_east"] !== undefined ? formatNumberFourDecimalNom(e["accImbMonth_east"]) : '',
          ["West"]: e["accImbMonth_west"] !== null && e["accImbMonth_west"] !== undefined ? formatNumberFourDecimalNom(e["accImbMonth_west"]) : '',
        },
        ["Acc. IMB. (MMBTU)"]: {
          ["East"]: e["accImb_east"] !== null && e["accImb_east"] !== undefined ? formatNumberFourDecimalNom(e["accImb_east"]) : '',
          ["West"]: e["accImb_west"] !== null && e["accImb_west"] !== undefined ? formatNumberFourDecimalNom(e["accImb_west"]) : '',
        },
        ["Min. Inventory (MMBTU)"]: {
          ["East"]: (e["minInventory_east"] !== null && e["minInventory_east"] !== undefined) ? formatNumberFourDecimalNom(e["minInventory_east"]) : '',
          ["West"]: (e["minInventory_west"] !== null && e["minInventory_west"] !== undefined) ? formatNumberFourDecimalNom(e["minInventory_west"]) : '',
        },
      },
      ["Detail Pane"]: {
        ["Entry"]: {
          ["East"]: {
            ["GSP"]: e["detail_entry_east_gsp"],
            ["Bypass Gas"]: e["detail_entry_east_bypassGas"],
            ["LNG"]: e["detail_entry_east_lng"],
            ["Others"]:
              sumDetail(e?.["values_"], "detail_entry_east_", [
                "gsp",
                "bypassGas",
                "lng",
                "F2andG",
              ]) ?? "",
          },
          ["West"]: {
            ["YDN"]: e["detail_entry_west_yadana"],
            ["YTG"]: e["detail_entry_west_yetagun"],
            ["ZTK"]: e["detail_entry_west_zawtika"],
            ["Others"]:
              sumDetail(e?.["values_"], "detail_entry_west_", [
                "yadana",
                "yetagun",
                "zawtika",
                "F2andG",
              ]) ?? "",
          },
          ["East-West"]: {
            ["RA6 East"]: e["detail_entry_east-west_ra6East"],
            ["RA6 West"]: e["detail_entry_east-west_ra6West"],
            ["BVW10 East"]: e["detail_entry_east-west_bvw10East"],
            ["BVW10 West"]: e["detail_entry_east-west_bvw10West"],
          },
        },
        ["Exit"]: {
          ["East"]: {
            ["EGAT"]: e["detail_exit_east_egat"],
            ["IPP"]: e["detail_exit_east_ipp"],
            ["Others"]:
              sumDetail(e?.["values_"], "detail_exit_east_", [
                "egat",
                "ipp",
                "F2andG",
              ]) ?? "",
          },
          ["West"]: {
            ["EGAT"]: e["detail_exit_west_egat"],
            ["IPP"]: e["detail_exit_west_ipp"],
            ["Others"]:
              sumDetail(e?.["values_"], "detail_exit_west_", [
                "egat",
                "ipp",
                "F2andG",
              ]) ?? "",
          },
          ["East-West"]: {
            ["EGAT"]: e["detail_exit_east-west_egat"],
            ["IPP"]: e["detail_exit_east-west_ipp"],
            ["Others"]:
              sumDetail(e?.["values_"], "detail_exit_east-west_", [
                "egat",
                "ipp",
                "F2andG",
              ]) ?? "",
          },
          ["F2&G"]: {
            ["East"]: e["detail_exit_east_F2andG"],
            ["West"]: e["detail_exit_west_F2andG"],
          },
          ["E"]: {
            ["East"]: e["detail_exit_E_east"],
            ["West"]: e["detail_exit_E_west"],
          },
        },
      },
    };
    console.log('setData : ', setData);
    let filteredData = Object.keys(setData).reduce((obj: any, key: any) => {
      obj[key] = setData[key]; // เพิ่ม key และ value ที่ผ่านการกรอง
      return obj;
    }, {});

    return filteredData;
  });
  const filterHeader = filterx || [];
  console.log('filterHeader : ', filterHeader);

  const headerColorMap = {
    Publicate: "1573A1", // #1573A1
    "Gas Day": "1573A1", // #1573A1
    "Gas Hour": "1573A1", // #1573A1
    Timestamp: "1573A1", // #1573A1
    "Summary Pane": "DEA477", // #DEA477
    "Summary Pane.Shipper Name": "1573A1", // #1573A1
    "Summary Pane.Plan / Actual": "1573A1", // #1573A1
    "Summary Pane.Contract Code": "1573A1", // #1573A1
    "Summary Pane.Total Entry (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Total Entry (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Total Entry (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Total Entry (MMBTU).East-West": "A6F5BF", // #A6F5BF
    "Summary Pane.Total Exit (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Total Exit (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Total Exit (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Total Exit (MMBTU).East-West": "A6F5BF", // #A6F5BF
    "Summary Pane.Imbalance Zone (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Imbalance Zone (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Imbalance Zone (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Imbalance Zone (MMBTU).Total": "F2F2F2", // #F2F2F2
    "Summary Pane.Instructed Flow (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Instructed Flow (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Instructed Flow (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Instructed Flow (MMBTU).East-West": "A6F5BF", // #A6F5BF
    "Summary Pane.Shrinkage Volume (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Shrinkage Volume (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Shrinkage Volume (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Park (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Park (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Park (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Unpark (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Unpark (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Unpark (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.SOD Park (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.SOD Park (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.SOD Park (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.EOD Park (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.EOD Park (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.EOD Park (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Change Min Inventory (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Change Min Inventory (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Change Min Inventory (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Reserve Bal. (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Reserve Bal. (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Reserve Bal. (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Adjust Imbalance (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Adjust Imbalance (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Adjust Imbalance (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Vent Gas": "1573A1", // #1573A1
    "Summary Pane.Vent Gas.East": "DBE4FF", // #DBE4FF
    "Summary Pane.Vent Gas.West": "FCB3CE", // #FCB3CE
    "Summary Pane.Commissioning Gas": "1573A1", // #1573A1
    "Summary Pane.Commissioning Gas.East": "DBE4FF", // #DBE4FF
    "Summary Pane.Commissioning Gas.West": "FCB3CE", // #FCB3CE
    "Summary Pane.Vent Gas (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Vent Gas (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Vent Gas (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Commissioning Gas (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Commissioning Gas (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Commissioning Gas (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Other Gas (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Other Gas (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Other Gas (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Daily IMB (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Daily IMB (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Daily IMB (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.AIP (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.AIP (MMBTU).Total": "F2F2F2", // #F2F2F2
    "Summary Pane.AIN (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.AIN (MMBTU).Total": "F2F2F2", // #F2F2F2
    "Summary Pane.%Imb": "1573A1", // #1573A1
    "Summary Pane.%Imb.Total": "F2F2F2", // #F2F2F2
    "Summary Pane.%Absimb": "1573A1", // #1573A1
    "Summary Pane.%Absimb.Total": "F2F2F2", // #F2F2F2
    "Summary Pane.Acc. IMB. (MONTH) (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Acc. IMB. (MONTH) (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Acc. IMB. (MONTH) (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Acc. IMB. (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Acc. IMB. (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Acc. IMB. (MMBTU).West": "FCB3CE", // #FCB3CE
    "Summary Pane.Min. Inventory (MMBTU)": "1573A1", // #1573A1
    "Summary Pane.Min. Inventory (MMBTU).East": "DBE4FF", // #DBE4FF
    "Summary Pane.Min. Inventory (MMBTU).West": "FCB3CE", // #FCB3CE
    "Detail Pane": "6EA48D", // #6EA48D
    "Detail Pane.Entry": "1BB9CF", // #1573A1
    "Detail Pane.Entry.East": "DBE4FF", // #DBE4FF
    "Detail Pane.Entry.East.GSP": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East.Bypass Gas": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East.LNG": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East.Others": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.West": "FCB3CE", // #FCB3CE
    "Detail Pane.Entry.West.YDN": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.West.YTG": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.West.ZTK": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.West.Others": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East-West": "A6F5BF", // #A6F5BF
    "Detail Pane.Entry.East-West.RA6 East": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East-West.RA6 West": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East-West.BVW10 East": "E0E0E0", // ##E0E0E0
    "Detail Pane.Entry.East-West.BVW10 West": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit": "3B8FB8", // #1573A1 #3B8FB8
    "Detail Pane.Exit.East": "DBE4FF", // #DBE4FF
    "Detail Pane.Exit.East.EGAT": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.East.IPP": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.East.Others": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.West": "FCB3CE", // #FCB3CE
    "Detail Pane.Exit.West.EGAT": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.West.IPP": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.West.Others": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.East-West": "A6F5BF", // #A6F5BF
    "Detail Pane.Exit.East-West.EGAT": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.East-West.IPP": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.East-West.Others": "E0E0E0", // ##E0E0E0
    "Detail Pane.Exit.F2&G": "1573A1", // #1573A1
    "Detail Pane.Exit.F2&G.East": "E5EED9", // ##E5EED9
    "Detail Pane.Exit.F2&G.West": "DBE1F2", // ##DBE1F2
    "Detail Pane.Exit.E": "1573A1", // #1573A1
    "Detail Pane.Exit.E.East": "E5EED9", // ##E5EED9
    "Detail Pane.Exit.E.West": "DBE1F2", // ##DBE1F2
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};

      for (let i = 0; i < data.length; i++) {
        const gasDay = String(data[i]?.["Gas Day"] ?? "");

        if (gasDay.includes("TOTAL ALL :")) {
          result[key][i] = "FEFBEC";
        } else if (gasDay.includes("TOTAL :")) {
          result[key][i] = "E6F8FF";
        }
      }
    }

    return result;
  }

  // function generateCellHighlightMapMultiple(
  //   keys: string[],
  //   data: any[],
  //   color: string
  // ): Record<string, Record<number, string>> {
  //   const result: Record<string, Record<number, string>> = {};
  //   for (const key of keys) {
  //     result[key] = {};
  //     for (let i = 0; i < data.length; i++) {
  //       if (data[i]["Gas Day"].includes("TOTAL :")) {
  //         result[key][i] = "E6F8FF"; //#E6F8FF
  //       }

  //       // row เหลือง
  //       if (data[i]["Gas Day"].includes("TOTAL ALL :")) {
  //         result[key][i] = "FEFBEC"; //#FEFBEC
  //       }
  //     }
  //   }

  //   return result;
  // }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );

  //
}

export function epBalancingIntradayBalancingReport(payload: any) {
  let {
    name,
    columnVisibility,
    initialColumns,
    resData,
    shipperGroupData,
    filterShowTotal,
    filterShowTotalAllShipper,
  } = payload;

  // console.log('name : ', name);
  // console.log('columnVisibility : ', columnVisibility);
  // console.log('initialColumns : ', initialColumns);
  // console.log('resData : ', resData);
  // console.log('shipperGroupData : ', shipperGroupData);
  // console.log('filterShowTotal : ', filterShowTotal);
  // console.log('filterShowTotalAllShipper : ', filterShowTotalAllShipper);
  // console.log('- - - - -');

  let filterx: string[] = [];

  // filterShowTotal true
  // filterShowTotalAllShipper false
  // สีฟ้า

  // filterShowTotal false
  // filterShowTotalAllShipper false
  // ขาว ฟ้า เหลือง

  // filterShowTotal false
  // filterShowTotalAllShipper true
  // เหลือง

  // filterShowTotal true
  // filterShowTotalAllShipper true
  // ฟ้า เหลือง

  columnVisibility.publicate && filterx.push("Publicate");
  columnVisibility.gas_day && filterx.push("Gas Day");
  columnVisibility.gas_hour && filterx.push("Gas Hour");
  columnVisibility.timestamp && filterx.push("Timestamp");
  columnVisibility.shipper_name && filterx.push("Summary Pane.Shipper Name");
  columnVisibility.plan_actual && filterx.push("Summary Pane.Plan / Actual");
  columnVisibility.contract_code && filterx.push("Summary Pane.Contract Code");
  columnVisibility.east_total_entry_mmbtud && filterx.push("Summary Pane.Total Entry (MMBTU/D).East");
  columnVisibility.west_total_entry_mmbtud && filterx.push("Summary Pane.Total Entry (MMBTU/D).West");
  columnVisibility.east_west_total_entry_mmbtud && filterx.push("Summary Pane.Total Entry (MMBTU/D).East-West");
  columnVisibility.east_total_exit_mmbtud && filterx.push("Summary Pane.Total Exit (MMBTU/D).East");
  columnVisibility.west_total_exit_mmbtud && filterx.push("Summary Pane.Total Exit (MMBTU/D).West");
  columnVisibility.east_west_total_exit_mmbtud && filterx.push("Summary Pane.Total Exit (MMBTU/D).East-West");
  columnVisibility.east_imbalance_zone_mmbtud && filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).East");
  columnVisibility.west_imbalance_zone_mmbtud && filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).West");
  columnVisibility.total_imbalance_zone_mmbtud && filterx.push("Summary Pane.Imbalance Zone (MMBTU/D).Total");
  columnVisibility.east_instructed_flow_mmbtud && filterx.push("Summary Pane.Instructed Flow (MMBTU/D).East");
  columnVisibility.west_instructed_flow_mmbtud && filterx.push("Summary Pane.Instructed Flow (MMBTU/D).West");
  columnVisibility.east_west_instructed_flow_mmbtud && filterx.push("Summary Pane.Instructed Flow (MMBTU/D).East-West");
  columnVisibility.east_shrinkage_volume_mmbtud && filterx.push("Summary Pane.Shrinkage Volume (MMBTU/D).East");
  columnVisibility.west_shrinkage_volume_mmbtud && filterx.push("Summary Pane.Shrinkage Volume (MMBTU/D).West");
  columnVisibility.east_park_mmbtud && filterx.push("Summary Pane.Park (MMBTU/D).East");
  columnVisibility.west_park_mmbtud && filterx.push("Summary Pane.Park (MMBTU/D).West");
  columnVisibility.east_unpark_mmbtud && filterx.push("Summary Pane.Unpark (MMBTU/D).East");
  columnVisibility.west_unpark_mmbtud && filterx.push("Summary Pane.Unpark (MMBTU/D).West");
  columnVisibility.east_sod_park_mmbtud && filterx.push("Summary Pane.SOD Park (MMBTU/D).East");
  columnVisibility.west_sod_park_mmbtud && filterx.push("Summary Pane.SOD Park (MMBTU/D).West");
  columnVisibility.east_eod_park_mmbtud && filterx.push("Summary Pane.EOD Park (MMBTU/D).East");
  columnVisibility.west_eod_park_mmbtud && filterx.push("Summary Pane.EOD Park (MMBTU/D).West");
  columnVisibility.east_min_inventory_change_mmbtud && filterx.push("Summary Pane.Change Min Inventory (MMBTU/D).East");
  columnVisibility.west_min_inventory_change_mmbtud && filterx.push("Summary Pane.Change Min Inventory (MMBTU/D).West");
  columnVisibility.east_reserve_bal_mmbtud && filterx.push("Summary Pane.Reserve Bal. (MMBTU/D).East");
  columnVisibility.west_reserve_bal_mmbtud && filterx.push("Summary Pane.Reserve Bal. (MMBTU/D).West");
  columnVisibility.east_adjust_imbalance_mmbtud && filterx.push("Summary Pane.Adjust Imbalance (MMBTU/D).East");
  columnVisibility.west_adjust_imbalance_mmbtud && filterx.push("Summary Pane.Adjust Imbalance (MMBTU/D).West");
  columnVisibility.east_vent_gas && filterx.push("Summary Pane.Vent Gas.East");
  columnVisibility.west_vent_gas && filterx.push("Summary Pane.Vent Gas.West");
  columnVisibility.east_commissioning_gas && filterx.push("Summary Pane.Commissioning Gas.East");
  columnVisibility.west_commissioning_gas && filterx.push("Summary Pane.Commissioning Gas.West");
  columnVisibility.east_other_gas && filterx.push("Summary Pane.Other Gas.East");
  columnVisibility.west_other_gas && filterx.push("Summary Pane.Other Gas.West");
  columnVisibility.east_daily_imb_mmbtud && filterx.push("Summary Pane.Daily IMB (MMBTU/D).East");
  columnVisibility.west_daily_imb_mmbtud && filterx.push("Summary Pane.Daily IMB (MMBTU/D).West");
  columnVisibility.total_aip_mmbtud && filterx.push("Summary Pane.AIP (MMBTU/D).Total");
  columnVisibility.total_ain_mmbtud && filterx.push("Summary Pane.AIN (MMBTU/D).Total");
  columnVisibility.total_percentage_imb && filterx.push("Summary Pane.%Imb.Total");
  columnVisibility.total_percentage_abslmb && filterx.push("Summary Pane.%Absimb.Total");
  columnVisibility.total_percentage_abslmb && filterx.push("Summary Pane.%Absimb.Total");
  columnVisibility.east_acc_imb_month_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East");
  columnVisibility.west_acc_imb_month_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West");

  columnVisibility.east_acc_imb_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MMBTU/D).East");
  columnVisibility.west_acc_imb_mmbtud && filterx.push("Summary Pane.Acc. IMB. (MMBTU/D).West");

  columnVisibility.acc_imb_inventory_mmbtud && filterx.push("Summary Pane.Acc. IMB. Inventory (MMBTU/D)");
  columnVisibility.east_acc_imb_inventory_mmbtud && filterx.push("Summary Pane.Acc. IMB. Inventory (MMBTU/D).East");
  columnVisibility.west_acc_imb_inventory_mmbtud && filterx.push("Summary Pane.Acc. IMB. Inventory (MMBTU/D).West");
  // ตรงนี้มีคีย์หาย ของ summary

  columnVisibility.min_inventory_mmbtud && filterx.push("Summary Pane.Min. Inventory (MMBTU/D)");
  columnVisibility.east_min_inventory_mmbtud && filterx.push("Summary Pane.Min. Inventory (MMBTU/D).East");
  columnVisibility.west_min_inventory_mmbtud && filterx.push("Summary Pane.Min. Inventory (MMBTU/D).West");

  // ฝั่ง detail
  columnVisibility.gsp && filterx.push("Detail Pane.Entry.East.GSP");
  columnVisibility.bypass_gas && filterx.push("Detail Pane.Entry.East.Bypass Gas");
  columnVisibility.lng && filterx.push("Detail Pane.Entry.East.LNG");
  columnVisibility.others_east && filterx.push("Detail Pane.Entry.East.Others");
  columnVisibility.ydn && filterx.push("Detail Pane.Entry.West.YDN");
  columnVisibility.ytg && filterx.push("Detail Pane.Entry.West.YTG");
  columnVisibility.ztk && filterx.push("Detail Pane.Entry.West.ZTK");
  columnVisibility.others_west && filterx.push("Detail Pane.Entry.West.Others");
  columnVisibility.ra6_east && filterx.push("Detail Pane.Entry.East-West.RA6 East");
  columnVisibility.ra6_west && filterx.push("Detail Pane.Entry.East-West.RA6 West");
  columnVisibility.bvw10_east && filterx.push("Detail Pane.Entry.East-West.BVW10 East");
  columnVisibility.bvw10_West && filterx.push("Detail Pane.Entry.East-West.BVW10 West");
  columnVisibility.egat && filterx.push("Detail Pane.Exit.East.EGAT");
  columnVisibility.ipp && filterx.push("Detail Pane.Exit.East.IPP");
  columnVisibility.others_east_exit && filterx.push("Detail Pane.Exit.East.Others");
  columnVisibility.egat_west && filterx.push("Detail Pane.Exit.West.EGAT");
  columnVisibility.ipp_west && filterx.push("Detail Pane.Exit.West.IPP");
  columnVisibility.others_west_exit && filterx.push("Detail Pane.Exit.West.Others");
  columnVisibility.egat_east_west && filterx.push("Detail Pane.Exit.East-West.EGAT");
  columnVisibility.ipp_east_west && filterx.push("Detail Pane.Exit.East-West.IPP");
  columnVisibility.others_east_west_exit && filterx.push("Detail Pane.Exit.East-West.Others");
  columnVisibility.east_f2andg && filterx.push("Detail Pane.Exit.F2&G.East");
  columnVisibility.west_f2andg && filterx.push("Detail Pane.Exit.F2&G.West");
  columnVisibility.east_e && filterx.push("Detail Pane.Exit.E.East");
  columnVisibility.west_e && filterx.push("Detail Pane.Exit.E.West");

  // console.log('filterx : ', filterx);
  const EXCLUDED_KEYS = new Set(["action"]);

  const filter = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  const keyHead = [
    "custom_color",
    "custom_publication", // publication
    "custom_gas_day", // Gas Day
    "custom_gas_hour", // Gas Hour
    "custom_timestamp", // timestamp
    "custom_shipper_id", // Shipper
    "custom_shipper_name", // Shipper Name
    "custom_contract_code", // Contract Code
    "custom_plan_actual", // new
    "total_entry_east",
    "total_entry_west",
    "total_entry_east-west",
    "total_exit_east",
    "total_exit_west",
    "total_exit_east-west",
    "imbZone_east",
    "imbZone_west",
    "imbZone_total",
    "instructedFlow_east",
    "instructedFlow_west",
    "instructedFlow_east-west",
    "shrinkage_east",
    "shrinkage_west",
    "park_east",
    "park_west",
    "Unpark_east",
    "Unpark_west",
    "SodPark_east",
    "SodPark_west",
    "EodPark_east",
    "EodPark_west",
    "minInventoryChange_east",
    "minInventoryChange_west",
    "reserveBal_east",
    "reserveBal_west",
    "adjustDailyImb_east",
    "adjustDailyImb_west",
    "ventGas_east",
    "ventGas_west",
    "commissioningGas_east",
    "commissioningGas_west",
    "otherGas_east",
    "otherGas_west",
    "dailyImb_east",
    "dailyImb_west",
    "aip",
    "ain",
    "absimb",
    "custom_abs_absimb", //ABS(absimb)
    "accImbMonth_east",
    "accImbMonth_west",
    "accImb_east",
    "accImb_west",
    "accImbInv_east",
    "accImbInv_west",
    "minInventory_east",
    "minInventory_west",
    "detail_entry_east_gsp",
    "detail_entry_east_bypassGas",
    "detail_entry_east_lng",
    "custom_detail_entry_east_", //detail_entry_east_ อื่นบวกกัน other
    "detail_entry_west_yadana",
    "detail_entry_west_yetagun",
    "detail_entry_west_zawtika",
    "custom_detail_entry_west_", //detail_entry_west_ อื่นบวกกัน other
    "detail_entry_east-west_ra6East",
    "detail_entry_east-west_ra6West",
    "detail_entry_east-west_bvw10East",
    "detail_entry_east-west_bvw10West",
    "detail_exit_east_egat",
    "detail_exit_east_ipp",
    "custom_detail_exit_east_", //detail_exit_east_ อื่นบวกกัน other
    "detail_exit_west_egat",
    "detail_exit_west_ipp",
    "custom_detail_exit_west_", //detail_exit_west_ อื่นบวกกัน other
    "detail_exit_east-west_egat",
    "detail_exit_east-west_ipp",
    "custom_detail_exit_east-west_", //detail_exit_east-west_ อื่นบวกกัน other
    "detail_exit_east_F2andG",
    "detail_exit_west_F2andG",
    "detail_exit_E_east",
    "detail_exit_E_west",
  ];

  const valueDigitKeyPure = (pE: any) => {
    const resultKey = pE !== undefined && pE !== null ? dcimal4(pE) : null;

    return resultKey;
  };

  // const sumDetail = (
  //   values: any,
  //   startWithTag: string,
  //   excludedTags: string[]
  // ) => {
  //   if (!values) return 0.0;
  //   let numCalc: number | null = null;

  //   Object.keys(values)
  //     .filter(
  //       (key) =>
  //         key.startsWith(startWithTag) &&
  //         !excludedTags.includes(key.replace(startWithTag, ""))
  //     )
  //     .forEach((key) => {
  //       const kN = values[key];
  //       if (kN) {
  //         if (numCalc != null) {
  //           numCalc += kN;
  //         } else {
  //           numCalc = kN;
  //         }
  //       }
  //     });

  //   return numCalc != null ? dcimal4(numCalc) : null;
  // }; 

 const sumDetail = (
      values: any,
      startWithTag: string,
      excludedTags: string[]
  ): number | null => {
      if (!values || !Array.isArray(excludedTags) || excludedTags.length === 0) return null;
  
      let sum = 0;
      let hasNumber = false;
  
      Object.keys(values).filter(key => key.startsWith(startWithTag) && !excludedTags.includes(key.replace(startWithTag, ''))).forEach(key => {
          const n = toNumber(values[key]);
          if (n !== null) {
              sum += n;
              hasNumber = true;
          }
      })
  
      return hasNumber ? sum : null;
  };

  const listCustoms = (keys: any, valueObj: any) => {
    const result: any = {};
    keys.forEach((key: any) => {
      if (key === "custom_gas_day") {
        result[key] = valueObj[key];
      } else if (key === "custom_shipper_id") {
        result[key] = valueObj[key];
      } else if (key === "custom_shipper_name") {
        result[key] = valueObj[key];
      } else if (key === "custom_contract_code") {
        result[key] = valueObj[key];
      } else if (key === "custom_gas_hour") {
        result[key] = valueObj[key] || "";
      } else if (key === "custom_timestamp") {
        result[key] = valueObj[key] || "";
      } else if (key === "custom_plan_actual") {
        result[key] = valueObj[key];
      } else if (key === "custom_abs_absimb") {
        result[key] = Math.abs(valueObj["absimb"]) ?? "";
      } else if (key === "custom_detail_entry_east_") {
        result[key] = "";
      } else if (key === "custom_detail_entry_west_") {
        result[key] = "";
      } else if (key === "custom_detail_exit_east_") {
        result[key] = "";
      } else if (key === "custom_detail_exit_west_") {
        result[key] = "";
      } else if (key === "custom_detail_exit_east-west_") {
        result[key] = "";
      } else if (key === "custom_publication") {
        result[key] = valueObj[key] || "";
      } else if (key === "custom_color") {
        result[key] = valueObj[key] || "";
      } else {
        result[key] = valueDigitKeyPure(valueObj[key]);
      }
    });
    return result;
  };

  const newData = resData?.flatMap((e: any) => {
    const {
      totalAllPlanning,
      totalAllActual,
      shipperData,
      gas_day,
      request_number,
      execute_timestamp,
      ...nE
    } = e;
    
    const totalShipper = shipperData?.flatMap((sp: any) => {
      const {
        shipper,
        totalShipperPlanning,
        totalShipperActual,
        contractData: contract_data,
        ...nSp
      } = sp;
      const contractData = contract_data?.flatMap((cd: any) => {
        const contractObjPlanning = listCustoms(keyHead, {
          ...cd?.valueContractPlanning,
          custom_plan_actual: "Planning",
          custom_gas_day: cd?.valueContractPlanning?.gas_day || "",
          custom_shipper_id: shipper || "",
          custom_shipper_name: cd?.valueContractPlanning?.shipper_name || "",
          custom_contract_code: cd?.valueContractPlanning?.contract || "",
          custom_publication: cd?.valueContractPlanning?.publication
            ? "Public"
            : "Unpublic",
          custom_gas_hour: cd?.valueContractPlanning?.gas_hour, // Gas Hour
          custom_timestamp: cd?.valueContractPlanning?.timestamp, // timestamp
        });

        const contractObjActual = listCustoms(keyHead, {
          ...cd?.valueContractActual,
          custom_plan_actual: "Actual",
          custom_gas_day: cd?.valueContractActual?.gas_day || "",
          custom_shipper_id: shipper || "",
          custom_shipper_name: cd?.valueContractActual?.shipper_name || "",
          custom_contract_code: cd?.valueContractActual?.contract || "",
          custom_publication: cd?.valueContractActual?.publication
            ? "Public"
            : "Unpublic",
          custom_gas_hour: cd?.valueContractPlanning?.gas_hour, // Gas Hour
          custom_timestamp: cd?.valueContractPlanning?.timestamp, // timestamp
        });

        return [
          {
            ...contractObjPlanning,
            ["values_"]: cd?.valueContractPlanning,
          },
          {
            ...contractObjActual,
            ["values_"]: cd?.valueContractActual,
          },
        ];
      });

      const totalShipperPlanningData = listCustoms(keyHead, {
        ...totalShipperPlanning,
        custom_gas_day: totalShipperPlanning?.gas_day || "",
        custom_plan_actual: "TOTAL PLANNING",
        custom_shipper_id: "",
        custom_shipper_name: contract_data?.[0]?.valueContractPlanning?.shipper_name || "",
        custom_contract_code: "",
        custom_color: "TOTAL", // #e5f8ff
        custom_publication: "",
        custom_gas_hour: contract_data?.[0]?.valueContractPlanning?.gas_hour || "", // Gas Hour
        custom_timestamp: contract_data?.[0]?.valueContractPlanning?.timestamp || "", // timestamp
      });
      
      const totalShipperActualData = listCustoms(keyHead, {
        ...totalShipperActual,
        custom_gas_day: totalShipperActual?.gas_day || "",
        custom_plan_actual: "TOTAL ACTUAL",
        custom_shipper_id: "",
        custom_shipper_name: contract_data?.[0]?.valueContractPlanning?.shipper_name || "",
        custom_contract_code: "",
        custom_color: "TOTAL", // #e5f8ff
        custom_publication: "",
        custom_gas_hour: contract_data?.[0]?.valueContractPlanning?.gas_hour || "", // Gas Hour
        custom_timestamp: contract_data?.[0]?.valueContractPlanning?.timestamp || "", // timestamp
      });

      // ["values_"]: cd?.valueContractPlanning
      const ntotalShipperPlanningData = {
        ...totalShipperPlanningData,
        ["values_"]: totalShipperPlanning,
      };
      const ntotalShipperActualData = {
        ...totalShipperActualData,
        ["values_"]: totalShipperActual,
      };

      if (filterShowTotal && filterShowTotalAllShipper) {
        // filterShowTotal true
        // filterShowTotalAllShipper true
        // ฟ้า เหลือง
        return [ntotalShipperPlanningData, ntotalShipperActualData];
      } else if (!filterShowTotal && filterShowTotalAllShipper) {
        // filterShowTotal false
        // filterShowTotalAllShipper true
        // เหลือง
        return [ntotalShipperPlanningData, ntotalShipperActualData];
      } else if (!filterShowTotal && !filterShowTotalAllShipper) {
        // filterShowTotal false
        // filterShowTotalAllShipper false
        // ขาว ฟ้า เหลือง
        return [
          ...contractData,
          ntotalShipperPlanningData,
          ntotalShipperActualData,
        ];
      } else if (filterShowTotal && !filterShowTotalAllShipper) {
        // filterShowTotal true
        // filterShowTotalAllShipper false
        // สีฟ้า
        return [ntotalShipperPlanningData, ntotalShipperActualData];
      }
    });

    const totalAllPlanningData = listCustoms(keyHead, {
      ...totalAllPlanning,
      custom_gas_day: totalAllPlanning?.gas_day || "",
      custom_plan_actual: "NOMINATION",
      custom_shipper_id: "",
      custom_shipper_name: "",
      custom_contract_code: "",
      custom_color: "TOTAL ALL", // #fffbec
      custom_gas_hour: shipperData?.[0]?.contractData?.[0]?.valueContractPlanning?.gas_hour || "", // Gas Hour
      custom_timestamp: shipperData?.[0]?.contractData?.[0]?.valueContractPlanning?.timestamp || "", // timestamp
    });
    const totalAllActualData = listCustoms(keyHead, {
      ...totalAllActual,
      custom_gas_day: totalAllActual?.gas_day || "",
      custom_plan_actual: "TOTAL",
      custom_shipper_id: "",
      custom_shipper_name: "",
      custom_contract_code: "",
      custom_color: "TOTAL ALL", // #fffbec
      custom_gas_hour: shipperData?.[0]?.contractData?.[0]?.valueContractPlanning?.gas_hour || "", // Gas Hour
      custom_timestamp: shipperData?.[0]?.contractData?.[0]?.valueContractPlanning?.timestamp || "", // timestamp
    });
    const ntotalAllPlanningData = {
      ...totalAllPlanningData,
      ["values_"]: totalAllPlanning,
    };
    const ntotalAllActualData = {
      ...totalAllActualData,
      ["values_"]: totalAllActual,
    };

    if (filterShowTotal && filterShowTotalAllShipper) {
      // filterShowTotal true
      // filterShowTotalAllShipper true
      // ฟ้า เหลือง
      return [...totalShipper, ntotalAllPlanningData, ntotalAllActualData];
    } else if (!filterShowTotal && filterShowTotalAllShipper) {
      // filterShowTotal false
      // filterShowTotalAllShipper true
      // เหลือง
      return [ntotalAllPlanningData, ntotalAllActualData];
    } else if (!filterShowTotal && !filterShowTotalAllShipper) {
      // filterShowTotal false
      // filterShowTotalAllShipper false
      // ขาว ฟ้า เหลือง
      return [...totalShipper, ntotalAllPlanningData, ntotalAllActualData];
    } else if (filterShowTotal && !filterShowTotalAllShipper) {
      // filterShowTotal true
      // filterShowTotalAllShipper false
      // สีฟ้า
      return [...totalShipper];
    }
  });




  const formateData = newData.map((e: any) => {

    let setData: any = {
      ["Publicate"]: e["custom_publication"] || "",
      ["Gas Day"]: e["custom_gas_day"] || "",
      ["Gas Hour"]: e["custom_gas_hour"] || "",
      ["Timestamp"]: e["custom_timestamp"] || "",
      ["Summary Pane"]: {
        //   ['Shipper']: e['custom_shipper_name'] || '',
        ["Shipper Name"]: e["custom_shipper_name"] || "",
        ["Plan / Actual"]: e["custom_plan_actual"] || "",
        ["Contract Code"]: e["custom_contract_code"] || "",
        ["Total Entry (MMBTU/D)"]: {
          ["East"]: e["total_entry_east"] || "",
          ["West"]: e["total_entry_west"] || "",
          ["East-West"]: e["total_entry_east-west"] || "",
        },
        ["Total Exit (MMBTU/D)"]: {
          ["East"]: e["total_exit_east"] || "",
          ["West"]: e["total_exit_west"] || "",
          ["East-West"]: e["total_exit_east-west"] || "",
        },
        ["Imbalance Zone (MMBTU/D)"]: {
          ["East"]: e["imbZone_east"] || "",
          ["West"]: e["imbZone_west"] || "",
          ["Total"]: e["imbZone_total"] || "",
        },
        ["Instructed Flow (MMBTU/D)"]: {
          ["East"]: e["instructedFlow_east"] || "",
          ["West"]: e["instructedFlow_west"] || "",
          ["East-West"]: e["instructedFlow_east-west"] || "",
        },
        ["Shrinkage Volume (MMBTU/D)"]: {
          ["East"]: e["shrinkage_east"] || "",
          ["West"]: e["shrinkage_west"] || "",
        },
        ["Park (MMBTU/D)"]: {
          ["East"]: e["park_east"] || "",
          ["West"]: e["park_west"] || "",
        },
        ["Unpark (MMBTU/D)"]: {
          ["East"]: e["Unpark_east"] || "",
          ["West"]: e["Unpark_west"] || "",
        },
        ["SOD Park (MMBTU/D)"]: {
          ["East"]: e["SodPark_east"] || "",
          ["West"]: e["SodPark_west"] || "",
        },
        ["EOD Park (MMBTU/D)"]: {
          ["East"]: e["EodPark_east"] || "",
          ["West"]: e["EodPark_west"] || "",
        },
        ["Change Min Inventory (MMBTU/D)"]: {
          ["East"]: e["minInventoryChange_east"] || "",
          ["West"]: e["minInventoryChange_west"] || "",
        },
        ["Reserve Bal. (MMBTU/D)"]: {
          ["East"]: e["reserveBal_east"] || "",
          ["West"]: e["reserveBal_west"] || "",
        },
        ["Adjust Imbalance (MMBTU/D)"]: {
          ["East"]: e["adjustDailyImb_east"] || "",
          ["West"]: e["adjustDailyImb_west"] || "",
        },
        ["Vent Gas"]: {
          ["East"]: e["ventGas_east"] || "",
          ["West"]: e["ventGas_west"] || "",
        },
        ["Commissioning Gas"]: {
          ["East"]: e["commissioningGas_east"] || "",
          ["West"]: e["commissioningGas_west"] || "",
        },
        ["Other Gas"]: {
          ["East"]: e["otherGas_east"] || "",
          ["West"]: e["otherGas_west"] || "",
        },
        ["Daily IMB (MMBTU/D)"]: {
          ["East"]: e["dailyImb_east"] || "",
          ["West"]: e["dailyImb_west"] || "",
        },
        ["AIP (MMBTU/D)"]: {
          ["Total"]: e["aip"] || "",
        },
        ["AIN (MMBTU/D)"]: {
          ["Total"]: e["ain"] || "",
        },
        ["%Imb"]: {
          // ["Total"]: e["absimb"] || "",
          ["Total"]: e["absimb"] !== null && e["absimb"] !== undefined ? formatNumberFourDecimalNom(e["absimb"]) : '',
        },
        ["%Absimb"]: {
          // ["Total"]: e["absimb"] !== null && e["absimb"] !== undefined && !Number.isNaN(Math.abs(e["absimb"])) ? Math.abs(e["absimb"]) : "",
          ["Total"]: e["absimb"] !== null && e["absimb"] !== undefined ? formatNumberFourDecimalNom(Math.abs(Number(parseToNumber(e["absimb"])))) : "",
          // ["Total"]: `${e["absimb"]}`,
          // ["Total"]: e["absimb"] ? formatNumberFourDecimalNom(Math.abs(e["absimb"])) : '',
          // contract["absimb"] ? formatNumberFourDecimalNom(Math.abs(contract["absimb"])) : ''
          // ['Total']: e['custom_abs_absimb'] || '',
        },
        ["Acc. IMB. (MONTH) (MMBTU/D)"]: {
          ["East"]: e["accImbMonth_east"] || "",
          ["West"]: e["accImbMonth_west"] || "",
        },
        ["Acc. IMB. (MMBTU/D)"]: {
          ["East"]: e["accImb_east"] || "",
          ["West"]: e["accImb_west"] || "",
        },
        ["Acc. IMB. Inventory (MMBTU/D)"]: {
          ["East"]: e["accImbInv_east"] || "",
          ["West"]: e["accImbInv_west"] || "",
        },
        ["Min. Inventory (MMBTU/D)"]: {
          ["East"]: e["minInventory_east"] || "",
          ["West"]: e["minInventory_west"] || "",
        },
      },
      ["Detail Pane"]: {
        ["Entry"]: {
          ["East"]: {
            ["GSP"]: e["detail_entry_east_gsp"] || "",
            ["Bypass Gas"]: e["detail_entry_east_bypassGas"] || "",
            ["LNG"]: e["detail_entry_east_lng"] || "",
            ["Others"]:
              formatNumberFourDecimal(sumDetail(e?.["values_"], "detail_entry_east_", [
                "gsp",
                "bypassGas",
                "lng",
                "F2andG",
              ])),
          },
          ["West"]: {
            ["YDN"]: e["detail_entry_west_yadana"] || "",
            ["YTG"]: e["detail_entry_west_yetagun"] || "",
            ["ZTK"]: e["detail_entry_west_zawtika"] || "",
            ["Others"]:
              formatNumberFourDecimal(sumDetail(e?.["values_"], "detail_entry_west_", [
                "yadana",
                "yetagun",
                "zawtika",
                "F2andG",
              ])),
          },
          ["East-West"]: {
            ["RA6 East"]: e["detail_entry_east-west_ra6East"] || "",
            ["RA6 West"]: e["detail_entry_east-west_ra6West"] || "",
            ["BVW10 East"]: e["detail_entry_east-west_bvw10East"] || "",
            ["BVW10 West"]: e["detail_entry_east-west_bvw10West"] || "",
          },
        },
        ["Exit"]: {
          ["East"]: {
            ["EGAT"]: e["detail_exit_east_egat"] || "",
            ["IPP"]: e["detail_exit_east_ipp"] || "",
            ["Others"]:
              formatNumberFourDecimal(sumDetail(e?.["values_"], "detail_exit_east_", [
                "egat",
                "ipp",
                "F2andG",
              ])),
          },
          ["West"]: {
            ["EGAT"]: e["detail_exit_west_egat"] || "",
            ["IPP"]: e["detail_exit_west_ipp"] || "",
            ["Others"]:
              formatNumberFourDecimal(sumDetail(e?.["values_"], "detail_exit_west_", [
                "egat",
                "ipp",
                "F2andG",
              ])),
          },
          ["East-West"]: {
            ["EGAT"]: e["detail_exit_east-west_egat"] || "",
            ["IPP"]: e["detail_exit_east-west_ipp"] || "",
            ["Others"]:
              formatNumberFourDecimal(sumDetail(e?.["values_"], "detail_exit_east-west_", [
                "egat",
                "ipp",
                "F2andG",
              ])),
          },
          ["F2&G"]: {
            ["East"]: e["detail_exit_east_F2andG"] || "",
            ["West"]: e["detail_exit_west_F2andG"] || "",
          },
          ["E"]: {
            ["East"]: e["detail_exit_E_east"] || "",
            ["West"]: e["detail_exit_E_west"] || "",
          },
        },
      },
      ["custom_color"]: e["custom_color"] || "",
    };
    let filteredData = Object.keys(setData).reduce((obj: any, key: any) => {
      obj[key] = setData[key];
      return obj;
    }, {});

    return filteredData;
  });
  // console.log('formateData : ', formateData);

  // const filterHeader = filter || [];
  const filterHeader = filterx || [];

  // header color
  const headerColorMap = {
    Publicate: "1573A1", // #1573A1
    "Gas Day": "1573A1", // #1573A1
    "Gas Hour": "1573A1", // #1573A1
    Timestamp: "1573A1", // #1573A1
    "Summary Pane": "dea477", // #dea477
    "Summary Pane.Shipper Name": "1573A1", // #1573A1
    "Summary Pane.Plan / Actual": "1573A1", // #1573A1
    "Summary Pane.Contract Code": "1573A1", // #1573A1
    "Summary Pane.Total Entry (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Total Entry (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Total Entry (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Total Entry (MMBTU/D).East-West": "c8ffd7", // #c8ffd7
    "Summary Pane.Total Exit (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Total Exit (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Total Exit (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Total Exit (MMBTU/D).East-West": "c8ffd7", // #c8ffd7
    "Summary Pane.Imbalance Zone (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Imbalance Zone (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Imbalance Zone (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Imbalance Zone (MMBTU/D).Total": "f2f2f2", // #f2f2f2
    "Summary Pane.Instructed Flow (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Instructed Flow (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Instructed Flow (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Instructed Flow (MMBTU/D).East-West": "c8ffd7", // #c8ffd7
    "Summary Pane.Shrinkage Volume (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Shrinkage Volume (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Shrinkage Volume (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Park (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Park (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Park (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Unpark (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Unpark (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Unpark (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.SOD Park (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.SOD Park (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.SOD Park (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.EOD Park (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.EOD Park (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.EOD Park (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Change Min Inventory (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Change Min Inventory (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Change Min Inventory (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Reserve Bal. (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Reserve Bal. (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Reserve Bal. (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Adjust Imbalance (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Adjust Imbalance (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Adjust Imbalance (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.Vent Gas": "1573A1", // #1573A1
    "Summary Pane.Vent Gas.East": "dbe4fe", // #dbe4fe
    "Summary Pane.Vent Gas.West": "fdcee3", // #fdcee3
    "Summary Pane.Commissioning Gas": "1573A1", // #1573A1
    "Summary Pane.Commissioning Gas.East": "dbe4fe", // #dbe4fe
    "Summary Pane.Commissioning Gas.West": "fdcee3", // #fdcee3
    "Summary Pane.Other Gas": "1573A1", // #1573A1
    "Summary Pane.Other Gas.East": "dbe4fe", // #dbe4fe
    "Summary Pane.Other Gas.West": "fdcee3", // #fdcee3
    "Summary Pane.Daily IMB (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Daily IMB (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Daily IMB (MMBTU/D).West": "fdcee3", // #fdcee3
    "Summary Pane.AIP (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.AIP (MMBTU/D).Total": "e5e5e5", // #e5e5e5
    "Summary Pane.AIN (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.AIN (MMBTU/D).Total": "e5e5e5", // #e5e5e5
    "Summary Pane.%Imb": "1573A1", // #1573A1
    "Summary Pane.%Imb.Total": "e5e5e5", // #e5e5e5
    "Summary Pane.%Absimb": "1573A1", // #1573A1
    "Summary Pane.%Absimb.Total": "e5e5e5", // #e5e5e5
    "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).West": "fdcee3", // #fdcee3

    "Summary Pane.Acc. IMB. (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Acc. IMB. (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Acc. IMB. (MMBTU/D).West": "fdcee3", // #fdcee3

    "Summary Pane.Acc. IMB. Inventory (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Acc. IMB. Inventory (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Acc. IMB. Inventory (MMBTU/D).West": "fdcee3", // #fdcee3

    "Summary Pane.Min. Inventory (MMBTU/D)": "1573A1", // #1573A1
    "Summary Pane.Min. Inventory (MMBTU/D).East": "dbe4fe", // #dbe4fe
    "Summary Pane.Min. Inventory (MMBTU/D).West": "fdcee3", // #fdcee3

    "Detail Pane": "6ea48d", // #6ea48d
    "Detail Pane.Entry": "25b9d0", // #25b9d0
    "Detail Pane.Entry.East": "dbe4fe", // #dbe4fe
    "Detail Pane.Entry.East.GSP": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East.Bypass Gas": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East.LNG": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East.Others": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.West": "fdcee3", // #fdcee3
    "Detail Pane.Entry.West.YDN": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.West.YTG": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.West.ZTK": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.West.Others": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East-West": "c8ffd7", // #c8ffd7
    "Detail Pane.Entry.East-West.RA6 East": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East-West.RA6 West": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East-West.BVW10 East": "e5e5e5", // #e5e5e5
    "Detail Pane.Entry.East-West.BVW10 West": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit": "3a8fb8", // #3a8fb8
    "Detail Pane.Exit.East": "dbe4fe", // #dbe4fe
    "Detail Pane.Exit.East.EGAT": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.East.IPP": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.East.Others": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.West": "fdcee3", // #fdcee3
    "Detail Pane.Exit.West.EGAT": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.West.IPP": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.West.Others": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.East-West": "c8ffd7", // #c8ffd7
    "Detail Pane.Exit.East-West.EGAT": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.East-West.IPP": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.East-West.Others": "e5e5e5", // #e5e5e5
    "Detail Pane.Exit.F2&G": "1573A1", // #1573A1
    "Detail Pane.Exit.F2&G.East": "DBE4FF", // #DBE4FF
    "Detail Pane.Exit.F2&G.West": "FFCEE2", // #FFCEE2
    "Detail Pane.Exit.E": "1573A1", // #1573A1
    "Detail Pane.Exit.E.East": "DBE4FF", // #DBE4FF
    "Detail Pane.Exit.E.West": "FFCEE2", // #FFCEE2
  };
  {/* E5EED9  DBE1F2 */}
  {/* DBE4FF  FFCEE2 */}
  console.log('formateData : ', formateData);
  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.["custom_color"] === "TOTAL ALL") {
          result[key][i] = "fffbec"; //#fffbec
        } else if (data[i]?.["custom_color"] === "TOTAL") {
          result[key][i] = "e5f8ff"; //#e5f8ff
        }
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );
}

export function epBalancingIntradayAccImbalanceInventoryOriginal(payload: any) {
  let { name, columnVisibility, initialColumns, resData } = payload;

  const filter = initialColumns
    .filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    .map((item: any) => item.label);

  const formateData = resData.map((e: any) => {
    let setData: any = {
      ["Publicate"]: e["publication"] && "Public",
      ["Gas Day"]: dayjs(e["gas_day"], "YYYY-MM-DD").format("DD/MM/YYYY"),
      ["Gas Hour"]: e["gasHour"],
      ["Timestamp"]: e["timestamp"],
      ["Acc. Total Inventory (MMBTU)"]: {
        ["East"]: e?.east_totalInv !== null && e?.east_totalInv !== undefined ? formatNumberFourDecimal(e?.east_totalInv) : '',
        ["West"]: e?.west_totalInv !== null && e?.west_totalInv !== undefined ? formatNumberFourDecimal(e?.west_totalInv) : '',
      },
      ["Base Inventory (MMBTU)"]: {
        ["East"]: e?.east_baseInv !== null && e?.east_baseInv !== undefined ? formatNumberFourDecimal(e?.east_baseInv) : '',
        ["West"]: e?.west_baseInv !== null && e?.west_baseInv !== undefined ? formatNumberFourDecimal(e?.west_baseInv) : '',
      },
      ["Total Acc. IMB. (Inventory) (MMBTU)"]: {
        ["East"]: e?.east_totalAccImbInv !== null && e?.east_totalAccImbInv !== undefined ? formatNumberFourDecimal(e?.east_totalAccImbInv) : '',
        ["West"]: e?.west_totalAccImbInv !== null && e?.west_totalAccImbInv !== undefined ? formatNumberFourDecimal(e?.west_totalAccImbInv) : '',
      },
      ["Acc. IMB. Exclude PTT Shipper (MMBTU)"]: {
        ["East"]: e?.east_accImbExculdePTT !== null && e?.east_accImbExculdePTT !== undefined ? formatNumberFourDecimal(e?.east_accImbExculdePTT) : '',
        ["West"]: e?.west_accImbExculdePTT !== null && e?.west_accImbExculdePTT !== undefined ? formatNumberFourDecimal(e?.west_accImbExculdePTT) : '',
      },
      ["Others (MMBTU)"]: {
        ["East"]: e?.east_other !== null && e?.east_other !== undefined ? formatNumberFourDecimal(e?.east_other) : '',
        ["West"]: e?.west_other !== null && e?.west_other !== undefined ? formatNumberFourDecimal(e?.west_other) : '',
      },
      ["Acc. IMB. Inventory for PTT Shipper (MMBTU)"]: {
        ["East"]: e?.east_accImbInvPTT !== null && e?.east_accImbInvPTT !== undefined ? formatNumberFourDecimal(e?.east_accImbInvPTT) : '',
        ["West"]: e?.west_accImbInvPTT !== null && e?.west_accImbInvPTT !== undefined ? formatNumberFourDecimal(e?.west_accImbInvPTT) : '',
      },
      ["Mode/Zone"]: {
        ["East"]: e["east_mode_zone"],
        ["West"]: e["west_mode_zone"],
      },
    };
    let filteredData = Object.keys(setData)
      // .filter((key) => filter.includes(key))
      .reduce((obj: any, key: any) => {
        obj[key] = setData[key];
        return obj;
      }, {});

    return filteredData;
  });

  const filterHeader =
    filter?.filter((f: any) => {
      return f !== "Comment";
    }) || [];

  const headerColorMap = {
    Timestamp: "1573A1", // #1573A1
    "Gas Hour": "1573A1", // #1573A1
    "Gas Day": "1573A1", // #1573A1
    Publicate: "1573A1", // #1573A1
    "Acc. Total Inventory (MMBTU)": "1573A1", // #1573A1
    "Acc. Total Inventory (MMBTU).East": "DBE4FF", // #DBE4FF
    "Acc. Total Inventory (MMBTU).West": "FCB3CE", // #FCB3CE
    "Base Inventory (MMBTU)": "1573A1", // #1573A1
    "Base Inventory (MMBTU).East": "DBE4FF", // #DBE4FF
    "Base Inventory (MMBTU).West": "FCB3CE", // #FCB3CE
    "Total Acc. IMB. (Inventory) (MMBTU)": "1573A1", // #1573A1
    "Total Acc. IMB. (Inventory) (MMBTU).East": "DBE4FF", // #DBE4FF
    "Total Acc. IMB. (Inventory) (MMBTU).West": "FCB3CE", // #FCB3CE
    "Acc. IMB. Exclude PTT Shipper (MMBTU)": "1573A1", // #1573A1
    "Acc. IMB. Exclude PTT Shipper (MMBTU).East": "DBE4FF", // #DBE4FF
    "Acc. IMB. Exclude PTT Shipper (MMBTU).West": "FCB3CE", // #FCB3CE
    "Others (MMBTU)": "1573A1", // #1573A1
    "Others (MMBTU).East": "DBE4FF", // #DBE4FF
    "Others (MMBTU).West": "FCB3CE", // #FCB3CE
    "Acc. IMB. Inventory for PTT Shipper (MMBTU)": "1573A1", // #1573A1
    "Acc. IMB. Inventory for PTT Shipper (MMBTU).East": "DBE4FF", // #DBE4FF
    "Acc. IMB. Inventory for PTT Shipper (MMBTU).West": "FCB3CE", // #FCB3CE
    "Mode/Zone": "1573A1", // #1573A1
    "Mode/Zone.East": "DBE4FF", // #DBE4FF
    "Mode/Zone.West": "FCB3CE", // #FCB3CE
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        if (data[i]?.["tab"] === "green") {
          result[key][i] = "e8ffee"; //#e8ffee
        }
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );
}

export function epMeretingMeteringMeteringChecking(payload: any) {
  let { name, columnVisibility, initialColumns, resData, hindDefaultNodata, tabIndex } = payload;

  const filter = initialColumns
    ?.filter((item: any) => columnVisibility[item.key] && item.key !== "action")
    ?.map((item: any) => item.label);

    const formateDataTemp = resData.map((e: any) => {
      const cvValue = (pTime: any) => {
          return e[`type_${pTime}`] === "red_url"
            ? "×"
            : e[`type_${pTime}`] === "green_url"
              ? "✓"
              : e[`type_${pTime}`] === "purple_url"
                ? "-"
                : e[`type_${pTime}`] === "Div/0"
                  ? "Div/0"
                  : e[`type_${pTime}`] === "<%low"
                    ? "<%low"
                    : e[`type_${pTime}`] === ">%high"
                      ? ">%high"
                      : "N/A";
                      
      };

      // const value_ = (value_1 === null) ? "N/A" : value_1 === "-Infinity" || value_1 === "Infinity" ? "Div/0" : value_1

      let setData: any = {
        ["Gas Day"]: dayjs(e["gasDay"], "YYYY-MM-DD").format("DD/MM/YYYY"),
        ["Metering Point ID"]: e["meteringPointId"],
        ["Customer Type"]: e["customer_type"]?.["name"] || "",
        // ['00:00']: e['00:00'] || 'N/A',
        // ['00:00']: { f:`=IMAGE("${e['00:00']}")` },
        ["01:00"]: cvValue("00:00"),
        ["02:00"]: cvValue("01:00"),
        ["03:00"]: cvValue("02:00"),
        ["04:00"]: cvValue("03:00"),
        ["05:00"]: cvValue("04:00"),
        ["06:00"]: cvValue("05:00"),
        ["07:00"]: cvValue("06:00"),
        ["08:00"]: cvValue("07:00"),
        ["09:00"]: cvValue("08:00"),
        ["10:00"]: cvValue("09:00"),
        ["11:00"]: cvValue("10:00"),
        ["12:00"]: cvValue("11:00"),
        ["13:00"]: cvValue("12:00"),
        ["14:00"]: cvValue("13:00"),
        ["15:00"]: cvValue("14:00"),
        ["16:00"]: cvValue("15:00"),
        ["17:00"]: cvValue("16:00"),
        ["18:00"]: cvValue("17:00"),
        ["19:00"]: cvValue("18:00"),
        ["20:00"]: cvValue("19:00"),
        ["21:00"]: cvValue("20:00"),
        ["22:00"]: cvValue("21:00"),
        ["23:00"]: cvValue("22:00"),
        ["24:00"]: cvValue("23:00"),
        // ['24:00']: e['type_24:00'] || 'N/A',
      };
      let filteredData = Object.keys(setData)
        .filter((key) => filter.includes(key)) // กรอง key ที่ตรงกับ filter
        .reduce((obj: any, key: any) => {
          obj[key] = setData[key]; // เพิ่ม key และ value ที่ผ่านการกรอง
          return obj;
        }, {});
      // filter
      return filteredData;
    });

    const formateData = resData.map((e: any) => {
      const cvValue = (pTime: any) => {
        if(tabIndex === 0){
          return e[`type_${pTime}`] === "red_url"
            ? "×"
            : e[`type_${pTime}`] === "green_url"
              ? "✓"
              : e[`type_${pTime}`] === "purple_url"
                ? "-"
                : e[`type_${pTime}`] === "Div/0"
                  ? "Div/0"
                  : e[`type_${pTime}`] === "<%low"
                    ? "<%low"
                    : e[`type_${pTime}`] === ">%high"
                      ? ">%high"
                      : "N/A";
                      
        }else{
          const value1 = `calcCondition1_${pTime}`
          const value = `calcCondition2_${pTime}`
          const value_1 = Number.isNaN(Number(e[value] || e[value1])) ? null : formatNumberThreeDecimal(e[value] || e[value1])
          const value_ = (value_1 === null) ? "N/A" : value_1 === "-Infinity" || value_1 === "Infinity" ? "Div/0" : value_1
          
          return value_
                      
        }
      };

      // const value_ = (value_1 === null) ? "N/A" : value_1 === "-Infinity" || value_1 === "Infinity" ? "Div/0" : value_1

      let setData: any = {
        ["Gas Day"]: dayjs(e["gasDay"], "YYYY-MM-DD").format("DD/MM/YYYY"),
        ["Metering Point ID"]: e["meteringPointId"],
        ["Customer Type"]: e["customer_type"]?.["name"] || "",
        // ['00:00']: e['00:00'] || 'N/A',
        // ['00:00']: { f:`=IMAGE("${e['00:00']}")` },
        ["01:00"]: cvValue("00:00"),
        ["02:00"]: cvValue("01:00"),
        ["03:00"]: cvValue("02:00"),
        ["04:00"]: cvValue("03:00"),
        ["05:00"]: cvValue("04:00"),
        ["06:00"]: cvValue("05:00"),
        ["07:00"]: cvValue("06:00"),
        ["08:00"]: cvValue("07:00"),
        ["09:00"]: cvValue("08:00"),
        ["10:00"]: cvValue("09:00"),
        ["11:00"]: cvValue("10:00"),
        ["12:00"]: cvValue("11:00"),
        ["13:00"]: cvValue("12:00"),
        ["14:00"]: cvValue("13:00"),
        ["15:00"]: cvValue("14:00"),
        ["16:00"]: cvValue("15:00"),
        ["17:00"]: cvValue("16:00"),
        ["18:00"]: cvValue("17:00"),
        ["19:00"]: cvValue("18:00"),
        ["20:00"]: cvValue("19:00"),
        ["21:00"]: cvValue("20:00"),
        ["22:00"]: cvValue("21:00"),
        ["23:00"]: cvValue("22:00"),
        ["24:00"]: cvValue("23:00"),
        // ['24:00']: e['type_24:00'] || 'N/A',
      };
      let filteredData = Object.keys(setData)
        .filter((key) => filter.includes(key)) // กรอง key ที่ตรงกับ filter
        .reduce((obj: any, key: any) => {
          obj[key] = setData[key]; // เพิ่ม key และ value ที่ผ่านการกรอง
          return obj;
        }, {});
      // filter
      return filteredData;
    });

  // sort header
  // https://app.clickup.com/t/86ex2x7xq
  const rhindDefaultNodata = Object.keys(hindDefaultNodata).filter(key => hindDefaultNodata[key]);
  const filterHeader = (filter || [])?.filter((f:any) => !rhindDefaultNodata?.includes(f));

  // header color
  const headerColorMap = {
    "Gas Day": "1573A1", // #1573A1
    "Metering Point ID": "1573A1", // #1573A1
    "Customer Type": "1573A1", // #1573A1
    "00:00": "1573A1", // #1573A1
    "01:00": "1573A1", // #1573A1
    "02:00": "1573A1", // #1573A1
    "03:00": "1573A1", // #1573A1
    "04:00": "1573A1", // #1573A1
    "05:00": "1573A1", // #1573A1
    "06:00": "1573A1", // #1573A1
    "07:00": "1573A1", // #1573A1
    "08:00": "1573A1", // #1573A1
    "09:00": "1573A1", // #1573A1
    "10:00": "1573A1", // #1573A1
    "11:00": "1573A1", // #1573A1
    "12:00": "1573A1", // #1573A1
    "13:00": "1573A1", // #1573A1
    "14:00": "1573A1", // #1573A1
    "15:00": "1573A1", // #1573A1
    "16:00": "1573A1", // #1573A1
    "17:00": "1573A1", // #1573A1
    "18:00": "1573A1", // #1573A1
    "19:00": "1573A1", // #1573A1
    "20:00": "1573A1", // #1573A1
    "21:00": "1573A1", // #1573A1
    "22:00": "1573A1", // #1573A1
    "23:00": "1573A1", // #1573A1
    "24:00": "1573A1", // #1573A1
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    // >%high : #FC7E11
    // <%low : #FDC533
    // - : #C58AFF
    // ค่าติดลบ : #FA7070
    // ✓ : #C0FFA1
    // N/A : #D3D3D3
    // Div/0 : #696969
 
    const colorMap: any = {
      "×": { bg: "FA7070", font: "FA7070" }, //red_url #FA7070
      "✓": { bg: "C0FFA1", font: "C0FFA1" }, //green_url #C0FFA1
      "-": { bg: "C58AFF", font: "C58AFF" }, //purple_url #C58AFF
      "N/A": { bg: "D3D3D3", font: "D3D3D3" }, //gray_url #D3D3D3
      "Div/0": { bg: "5E5E5E", font: "5E5E5E" }, // #5E5E5E
      "<%low": { bg: "FDC533", font: "FDC533" }, // #FDC533
      ">%high": { bg: "FC7E11", font: "FC7E11" }, // #FC7E11
    };

    const hours = [];
    for (let h = 0; h <= 24; h++) {
      hours.push(h.toString().padStart(2, "0") + ":00");
    }

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        for (const hour of hours) {
          const cellValue = data[i]?.[hour];
          if (cellValue && colorMap[cellValue] && key === hour) {
            result[key][i] = colorMap[cellValue].bg;
          }
        }
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    // formateData,
    formateDataTemp,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );
}

export function epMeretingMeteringManagement(payload: any) {
  let { name, columnVisibility, initialColumns, resData } = payload;

  const EXCLUDED_KEYS = new Set(["action"]);
  const filter = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  const formateData = resData.map((e: any) => {
    let setData: any = {
      ["Gas Day"]: !!e["gasDay"] ? dayjs(e["gasDay"]).format("DD/MM/YYYY") : "",
      ["Metering Point ID"]: e["meteringPointId"],
      ["Zone"]: e["prop"]?.["zone"]?.["name"],
      ["Area"]: e["prop"]?.["area"]?.["name"],
      ["Customer Type"]: e["prop"]?.["customer_type"]?.["name"],
      ["Volume (MMSCF)"]: dcimal6(e["volume"]),
      ["Heating Value (BTU/SCF)"]: dcimal3(e["heatingValue"]),
      ["Energy (MMBTU)"]: dcimal3(e["energy"]),
      ["Received Timestamp"]:
        (!!e["registerTimestamp"] &&
          dayjs(e["registerTimestamp"]).format("DD/MM/YYYY HH:mm:ss")) ||
        null,
      // ["TPA Insert Timestamp"]: e["insert_timestamp"],
      ["TPA Insert Timestamp"]: (!!e["insert_timestamp"] &&
        dayjs(e["insert_timestamp"]).format("DD/MM/YYYY HH:mm:ss")) ||
        null,
      ["Metering Retrieving ID"]: e["metering_retrieving_id"],
      ["Source"]: e["datasource"],
    };
    let filteredData = Object.keys(setData)
      .filter((key) => filter.includes(key)) // กรอง key ที่ตรงกับ filter
      .reduce((obj: any, key: any) => {
        obj[key] = setData[key]; // เพิ่ม key และ value ที่ผ่านการกรอง
        return obj;
      }, {});
    return filteredData;
  });

  // sort header
  const filterHeader = filter || [];

  // header color
  const headerColorMap = {
    "Gas Day": "1573A1", // #1573A1
    "Metering Point ID": "1573A1", // #1573A1
    Zone: "1573A1", // #1573A1
    Area: "1573A1", // #1573A1
    "Customer Type": "1573A1", // #1573A1
    "Volume (MMSCF)": "1573A1", // #1573A1
    "Heating Value (BTU/SCF)": "1573A1", // #1573A1
    "Energy (MMBTU)": "1573A1", // #1573A1
    "Received Timestamp": "1573A1", // #1573A1
    "TPA Insert Timestamp": "1573A1", // #1573A1
    "Metering Retrieving ID": "1573A1", // #1573A1
    Source: "1573A1", // #1573A1
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        //
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );
}

export function epMeretingMeteringRetrievingMeteringDataCheck(payload: any) {
  let { name, columnVisibility, initialColumns, resData } = payload;

  const EXCLUDED_KEYS = new Set(["action"]);
  const filter = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  const formateData = resData.map((e: any) => {
    let setData: any = {
      ["Metering Point ID"]: e["data"]["meteringPointId"],
      ["Metered Point Description"]: e["description"],
    };
    let filteredData = Object.keys(setData)
      .filter((key) => filter.includes(key)) // กรอง key ที่ตรงกับ filter
      .reduce((obj: any, key: any) => {
        obj[key] = setData[key]; // เพิ่ม key และ value ที่ผ่านการกรอง
        return obj;
      }, {});
    // filter
    return filteredData;
  });

  // sort header
  const filterHeader = filter || [];

  // header color
  const headerColorMap = {
    "Metering Point ID": "1573A1", // #1573A1
    "Metered Point Description": "1573A1", // #1573A1
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        //
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );
}

export function epMeretingMeteringRetrievingRetrieving(
  payload: any,
) {
  let { name, columnVisibility, initialColumns, resData } = payload;

  const EXCLUDED_KEYS = new Set(["action"]);
  const filter = initialColumns
    .filter(
      (item: any) =>
        !!columnVisibility?.[item.key] && !EXCLUDED_KEYS.has(item.key)
    )
    .map((item: any) => item.label);

  const formateData = resData.map((e: any) => {
    let setData: any = {
      ['Gas Day']: !!e['data']['gasDay']
        ? dayjs(e['data']['gasDay']).format('DD/MM/YYYY')
        : '',
      ['Metering Retrieving ID']: e['data']['metering_retrieving_id'],
      ['Metering Point ID']: e['data']['meteringPointId'],
      ['Energy (MMBTU)']: e['data']['energy']
        ? dcimal3(e['data']['energy'])
        : null,
      ['Timestamp']:
        (!!e['data']['insert_timestamp'] &&
          dayjs(e['data']['insert_timestamp']).format('DD/MM/YYYY HH:mm:ss')) ||
        null,
      ['Error Description']: e['description'],
    };
    let filteredData = Object.keys(setData)
      .filter((key) => filter.includes(key)) // กรอง key ที่ตรงกับ filter
      .reduce((obj: any, key: any) => {
        obj[key] = setData[key]; // เพิ่ม key และ value ที่ผ่านการกรอง
        return obj;
      }, {});
    // filter
    return filteredData;
  });

  // sort header
  const filterHeader = filter || [];

  // header color
  const headerColorMap = {
    "Gas Day": "1573A1", // #1573A1
    "Metering Retrieving ID": "1573A1", // #1573A1
    "Metering Point ID": "1573A1", // #1573A1
    "Energy (MMBTU)": "1573A1", // #1573A1
    "Timestamp": "1573A1", // #1573A1
    "Error Description": "1573A1", // #1573A1
  };

  function generateCellHighlightMapMultiple(
    keys: string[],
    data: any[],
    color: string
  ): Record<string, Record<number, string>> {
    const result: Record<string, Record<number, string>> = {};

    for (const key of keys) {
      result[key] = {};
      for (let i = 0; i < data.length; i++) {
        //
      }
    }

    return result;
  }

  const cellHighlightMap = generateCellHighlightMapMultiple(
    filterHeader,
    formateData,
    "EAF5F8"
  );

  const result = filterNestedData(formateData, filterHeader);

  return exportDataToExcelWithMultiLevelHeaderNew(
    result,
    name,
    true,
    headerColorMap,
    cellHighlightMap
  );

}

export function intradayAccImbalanceDashboard(payload: any) {
    // const userId = 99999
    const {bodys, filter} = payload

    console.log('payload : ', payload);
    // const resData: any =
    //   await this.balancingService.intradayAccImbalanceDashboard(bodys, userId);
    // const resData: any = await this.balancingService.intradayAccImbalanceDashboard2(bodys, userId)
    const resData: any = bodys?.resData
    console.log('resData : ', resData);
    console.log('filter : ', filter);
    // const groupMasterCheck = await this.prisma.group.findFirst({
    //   where: {
    //     account_manage: {
    //       some: {
    //         account_id: Number(userId),
    //       },
    //     },
    //   },
    // });

    // const shipperIdName = groupMasterCheck?.id_name;
    // const userType = groupMasterCheck?.user_type_id;

    // const valueDigitKeyPure = (hourData: any, pE: any, nKey: any) => {
    //   const resultKey = hourData?.find((f: any) => f?.gas_hour_text === pE)?.value?.[nKey] !== undefined && hourData?.find((f: any) => f?.gas_hour_text === pE)?.value?.[nKey] !== null ? dcimal4(hourData?.find((f: any) => f?.gas_hour_text === pE)?.value?.[nKey]) : null

    //   return resultKey
    // }

    // // previous_date always have at least 1 data that is gas_day
    // const previousDate = bodys?.previous_date ?? (bodys?.gas_day ? [bodys.gas_day] : [])
    // const onlyPreviousDateData = resData?.data?.filter((f: any) => previousDate.includes(f?.gas_day)) ?? []
    // const nresData = []
    // for (let i = 0; i < onlyPreviousDateData.length; i++) {
    //   const nowData = resData?.data[i] || []
    //   const hourData = nowData?.hour
    //   const dataOfEachDate =
    //     resData?.templateLabelKeys?.map((e: any) => {
    //       // const valueDigitKeyTag = (pE: any, nKey: any) => {
    //       //   const baseValue = pE?.[nKey];
    //       //   const resultKey =
    //       //     baseValue !== undefined && baseValue !== null
    //       //       ? this.dcimal4(baseValue)
    //       //       : null;

    //       //   return resultKey;
    //       // };

    //       // gas_hour_text

    //       return {
    //         Info: e?.lebel || '',
    //         Date: nowData?.gas_day || '',
    //         // '00:00': valueDigitKeyPure(hourData, '00:00', e?.key),
    //         '01:00': valueDigitKeyPure(hourData, '01:00', e?.key),
    //         '02:00': valueDigitKeyPure(hourData, '02:00', e?.key),
    //         '03:00': valueDigitKeyPure(hourData, '03:00', e?.key),
    //         '04:00': valueDigitKeyPure(hourData, '04:00', e?.key),
    //         '05:00': valueDigitKeyPure(hourData, '05:00', e?.key),
    //         '06:00': valueDigitKeyPure(hourData, '06:00', e?.key),
    //         '07:00': valueDigitKeyPure(hourData, '07:00', e?.key),
    //         '08:00': valueDigitKeyPure(hourData, '08:00', e?.key),
    //         '09:00': valueDigitKeyPure(hourData, '09:00', e?.key),
    //         '10:00': valueDigitKeyPure(hourData, '10:00', e?.key),
    //         '11:00': valueDigitKeyPure(hourData, '11:00', e?.key),
    //         '12:00': valueDigitKeyPure(hourData, '12:00', e?.key),
    //         '13:00': valueDigitKeyPure(hourData, '13:00', e?.key),
    //         '14:00': valueDigitKeyPure(hourData, '14:00', e?.key),
    //         '15:00': valueDigitKeyPure(hourData, '15:00', e?.key),
    //         '16:00': valueDigitKeyPure(hourData, '16:00', e?.key),
    //         '17:00': valueDigitKeyPure(hourData, '17:00', e?.key),
    //         '18:00': valueDigitKeyPure(hourData, '18:00', e?.key),
    //         '19:00': valueDigitKeyPure(hourData, '19:00', e?.key),
    //         '20:00': valueDigitKeyPure(hourData, '20:00', e?.key),
    //         '21:00': valueDigitKeyPure(hourData, '21:00', e?.key),
    //         '22:00': valueDigitKeyPure(hourData, '22:00', e?.key),
    //         '23:00': valueDigitKeyPure(hourData, '23:00', e?.key),
    //         '00:00': valueDigitKeyPure(hourData, '24:00', e?.key)
    //       }
    //     }) ?? []

    //   nresData.push(...dataOfEachDate)
    // }

    // const formateData = nresData
    //   .sort((a: any, b: any) => dayjs(a?.['Date'], 'YYYY-MM-DD').valueOf() - dayjs(b?.['Date'], 'YYYY-MM-DD').valueOf())
    const formateData = resData?.map((e: any) => {
        let setData:any = {
          Info: e?.['info']?.["lebel"],
          Date: dayjs(e?.['date'], 'YYYY-MM-DD').format('DD/MM/YYYY'),
          '01:00': e?.['T1_00'] !== null && e?.['T1_00'] !== undefined ? formatNumberFourDecimal(e?.['T1_00']) : null,
          '02:00': e?.['T2_00'] !== null && e?.['T2_00'] !== undefined ? formatNumberFourDecimal(e?.['T2_00']) : null,
          '03:00': e?.['T3_00'] !== null && e?.['T3_00'] !== undefined ? formatNumberFourDecimal(e?.['T3_00']) : null,
          '04:00': e?.['T4_00'] !== null && e?.['T4_00'] !== undefined ? formatNumberFourDecimal(e?.['T4_00']) : null,
          '05:00': e?.['T5_00'] !== null && e?.['T5_00'] !== undefined ? formatNumberFourDecimal(e?.['T5_00']) : null,
          '06:00': e?.['T6_00'] !== null && e?.['T6_00'] !== undefined ? formatNumberFourDecimal(e?.['T6_00']) : null,
          '07:00': e?.['T7_00'] !== null && e?.['T7_00'] !== undefined ? formatNumberFourDecimal(e?.['T7_00']) : null,
          '08:00': e?.['T8_00'] !== null && e?.['T8_00'] !== undefined ? formatNumberFourDecimal(e?.['T8_00']) : null,
          '09:00': e?.['T9_00'] !== null && e?.['T9_00'] !== undefined ? formatNumberFourDecimal(e?.['T9_00']) : null,
          '10:00': e?.['T10_00'] !== null && e?.['T10_00'] !== undefined ? formatNumberFourDecimal(e?.['T10_00']) : null,
          '11:00': e?.['T11_00'] !== null && e?.['T11_00'] !== undefined ? formatNumberFourDecimal(e?.['T11_00']) : null,
          '12:00': e?.['T12_00'] !== null && e?.['T12_00'] !== undefined ? formatNumberFourDecimal(e?.['T12_00']) : null,
          '13:00': e?.['T13_00'] !== null && e?.['T13_00'] !== undefined ? formatNumberFourDecimal(e?.['T13_00']) : null,
          '14:00': e?.['T14_00'] !== null && e?.['T14_00'] !== undefined ? formatNumberFourDecimal(e?.['T14_00']) : null,
          '15:00': e?.['T15_00'] !== null && e?.['T15_00'] !== undefined ? formatNumberFourDecimal(e?.['T15_00']) : null,
          '16:00': e?.['T16_00'] !== null && e?.['T16_00'] !== undefined ? formatNumberFourDecimal(e?.['T16_00']) : null,
          '17:00': e?.['T17_00'] !== null && e?.['T17_00'] !== undefined ? formatNumberFourDecimal(e?.['T17_00']) : null,
          '18:00': e?.['T18_00'] !== null && e?.['T18_00'] !== undefined ? formatNumberFourDecimal(e?.['T18_00']) : null,
          '19:00': e?.['T19_00'] !== null && e?.['T19_00'] !== undefined ? formatNumberFourDecimal(e?.['T19_00']) : null,
          '20:00': e?.['T20_00'] !== null && e?.['T20_00'] !== undefined ? formatNumberFourDecimal(e?.['T20_00']) : null,
          '21:00': e?.['T21_00'] !== null && e?.['T21_00'] !== undefined ? formatNumberFourDecimal(e?.['T21_00']) : null,
          '22:00': e?.['T22_00'] !== null && e?.['T22_00'] !== undefined ? formatNumberFourDecimal(e?.['T22_00']) : null,
          '23:00': e?.['T23_00'] !== null && e?.['T23_00'] !== undefined ? formatNumberFourDecimal(e?.['T23_00']) : null,
          '00:00': e?.['T00_00'] !== null && e?.['T00_00'] !== undefined ? formatNumberFourDecimal(e?.['T00_00']) : null
        }
        let filteredData = Object.keys(setData).reduce((obj:any, key:any) => {
          obj[key] = setData[key]
          return obj
        }, {})

        //

        return filteredData
      })
   
    // ---------------- manage table excel

    // sort header
    const filterHeader = filter || []
    // Replace "24:00" with "00:00" in the filter header
    const index = filterHeader.indexOf('24:00')
    if (index !== -1) {
      filterHeader[index] = '00:00'
    }
    // const filterHeader = [
    //     "Info",
    //     "00:00",
    //     "01:00",
    //     "02:00",
    //     "03:00",
    //     "04:00",
    //     "05:00",
    //     "06:00",
    //     "07:00",
    //     "08:00",
    //     "09:00",
    //     "10:00",
    //     "11:00",
    //     "12:00",
    //     "13:00",
    //     "14:00",
    //     "15:00",
    //     "16:00",
    //     "17:00",
    //     "18:00",
    //     "19:00",
    //     "20:00",
    //     "21:00",
    //     "22:00",
    //     "23:00",
    //     "24:00",
    // ]

    // header color
    const headerColorMap = {
      Info: '1573A1', // #1573A1
      Date: '1573A1', // #1573A1
      '00:00': '1573A1', // #1573A1
      '01:00': '1573A1', // #1573A1
      '02:00': '1573A1', // #1573A1
      '03:00': '1573A1', // #1573A1
      '04:00': '1573A1', // #1573A1
      '05:00': '1573A1', // #1573A1
      '06:00': '1573A1', // #1573A1
      '07:00': '1573A1', // #1573A1
      '08:00': '1573A1', // #1573A1
      '09:00': '1573A1', // #1573A1
      '10:00': '1573A1', // #1573A1
      '11:00': '1573A1', // #1573A1
      '12:00': '1573A1', // #1573A1
      '13:00': '1573A1', // #1573A1
      '14:00': '1573A1', // #1573A1
      '15:00': '1573A1', // #1573A1
      '16:00': '1573A1', // #1573A1
      '17:00': '1573A1', // #1573A1
      '18:00': '1573A1', // #1573A1
      '19:00': '1573A1', // #1573A1
      '20:00': '1573A1', // #1573A1
      '21:00': '1573A1', // #1573A1
      '22:00': '1573A1', // #1573A1
      '23:00': '1573A1', // #1573A1
      '24:00': '1573A1' // #1573A1
    }

    function generateCellHighlightMapMultiple(keys: string[], data: any[], color: string): Record<string, Record<number, string>> {
      const result: Record<string, Record<number, string>> = {}

      for (const key of keys) {
        result[key] = {}
        for (let i = 0; i < data.length; i++) {}
      }

      return result
    }

     console.log('filterHeader : ', filterHeader);
    console.log('formateData : ', formateData);
    const cellHighlightMap = generateCellHighlightMapMultiple(filterHeader, formateData, 'EAF5F8')

    const result = filterNestedData(formateData, filterHeader)
    console.log('result : ', result);

    return exportDataToExcelWithMultiLevelHeaderNew(result, 'Intraday Acc Imbalance Dashboard', true, headerColorMap, cellHighlightMap)
  }