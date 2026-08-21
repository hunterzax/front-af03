import * as XLSX from "xlsx-js-style";
import dayjs from "dayjs";
import "dayjs/locale/en"; // ใช้ย่อเดือน EN
import { exportDataToExcelWithMultiLevelHeaderNew, filterNestedData, formatNumberThreeDecimal } from "./exportMiddleNew";
dayjs.locale("en");


const data_to_export = [
    {
        "id": 21,
        "entry_exit": {
            "id": 2,
            "name": "Exit",
            "color": "#FFF3C8"
        },
        "zone": {
            "id": 2,
            "name": "EAST",
            "color": "#c8ffd7"
        },
        "month_data": [
            {
                "2025-12": {
                    "area_nominal_capacity": 695000
                }
            },
            {
                "2026-01": {
                    "area_nominal_capacity": 915000
                }
            },
            {
                "2026-02": {
                    "area_nominal_capacity": 795000
                }
            },
            {
                "2026-03": {
                    "area_nominal_capacity": 710000
                }
            },
            {
                "2026-04": {
                    "area_nominal_capacity": 905000
                }
            },
            {
                "2026-05": {
                    "area_nominal_capacity": 1610000
                }
            },
            {
                "2026-06": {
                    "area_nominal_capacity": 1610000
                }
            },
            {
                "2026-07": {
                    "area_nominal_capacity": 1610000
                }
            },
            {
                "2026-08": {
                    "area_nominal_capacity": 1610000
                }
            },
            {
                "2026-09": {
                    "area_nominal_capacity": 1730000
                }
            },
        ]
    },
    {
        "id": 20,
        "name": "A2",
        "entry_exit": {
            "id": 2,
            "name": "Exit",
            "color": "#FFF3C8"
        },
        "zone": {
            "id": 2,
            "name": "EAST",
            "color": "#c8ffd7"
        },
        "month_data": [
            {
                "2025-12": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-01": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-02": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-03": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-04": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-05": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-06": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-07": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-08": {
                    "area_nominal_capacity": 1760000
                }
            },
            {
                "2026-09": {
                    "area_nominal_capacity": 1760000
                }
            },
        ]
    },
    {
        "id": 19,
        "name": "A3",
        "entry_exit": {
            "id": 2,
            "name": "Exit",
            "color": "#FFF3C8"
        },
        "zone": {
            "id": 2,
            "name": "EAST",
            "color": "#c8ffd7"
        },
        "month_data": [
            {
                "2025-12": {
                    "area_nominal_capacity": 560000
                }
            },
            {
                "2026-01": {
                    "area_nominal_capacity": 570000
                }
            },
            {
                "2026-02": {
                    "area_nominal_capacity": 570000
                }
            },
            {
                "2026-03": {
                    "area_nominal_capacity": 530000
                }
            },
            {
                "2026-04": {
                    "area_nominal_capacity": 590000
                }
            },
            {
                "2026-05": {
                    "area_nominal_capacity": 740000
                }
            },
            {
                "2026-06": {
                    "area_nominal_capacity": 740000
                }
            },
            {
                "2026-07": {
                    "area_nominal_capacity": 740000
                }
            },
            {
                "2026-08": {
                    "area_nominal_capacity": 740000
                }
            },
            {
                "2026-09": {
                    "area_nominal_capacity": 740000
                }
            },
        ]
    }
]

type RowIn = typeof data_to_export[number];

// ===== helper =====
const numFmt = "#,##0.000";
const borderThin = {
    top: { style: "thin", color: { rgb: "E0E0E0" } },
    bottom: { style: "thin", color: { rgb: "E0E0E0" } },
    left: { style: "thin", color: { rgb: "E0E0E0" } },
    right: { style: "thin", color: { rgb: "E0E0E0" } },
};

const headBlue = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" as const },
    fill: { patternType: "solid", fgColor: { rgb: "00AEEF" } }, // ฟ้าเข้มแบบในภาพ
    border: borderThin,
};

const subHeadBlue = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" as const, wrapText: true },
    fill: { patternType: "solid", fgColor: { rgb: "08B9F5" } }, // ฟ้าอ่อนหัวเดือน
    border: borderThin,
};

const zonePill = {
    fill: { patternType: "solid", fgColor: { rgb: "C8FFD7" } }, // เขียวพาสเทล
    font: { bold: true, color: { rgb: "3B3B3B" } },
    alignment: { horizontal: "center", vertical: "center" as const },
    border: borderThin,
};

const areaBadge = {
    fill: { patternType: "solid", fgColor: { rgb: "EFD7FF" } }, // ม่วงพาสเทลให้คล้าย badge
    font: { bold: true, color: { rgb: "4A4A4A" } },
    alignment: { horizontal: "center", vertical: "center" as const },
    border: borderThin,
};

const cellNumberStyle = {
    alignment: { horizontal: "right", vertical: "center" as const },
    border: borderThin,
    numFmt,
};

function setCell(ws: XLSX.WorkSheet, addr: string, v: any, s?: any) {
    ws[addr] = { t: typeof v === "number" ? "n" : "s", v, z: s?.numFmt, s };
}

function addr(colIdx: number, rowIdx: number) {
    // colIdx,rowIdx are 0-based
    return XLSX.utils.encode_cell({ c: colIdx, r: rowIdx });
}

function collectSortedMonths(data: RowIn[]) {
    const set = new Set<string>();
    data.forEach((r) =>
        r.month_data.forEach((obj) => {
            const key = Object.keys(obj)[0]; // "YYYY-MM"
            set.add(key);
        })
    );
    // sort ascending YYYY-MM
    return Array.from(set).sort();
}

function labelMMMYYYY(key: string) {
    return dayjs(key + "-01").format("MMM YYYY");
}

// ===== main export ===== 
export function exportAvailableCapacity(data: RowIn[], filename = "Available_Capacity.xlsx") {

    const trimFirstTwo = (arr: any) =>
        (arr ?? []).map((item: any) => ({
            ...item,
            month_data: Array.isArray(item.month_data)
                ? item.month_data.slice(2) // ตัดสองตำแหน่งแรก
                : [],
        }));

    const result_data_trim = trimFirstTwo(data);


    const months = collectSortedMonths(result_data_trim);
    const aoa: any[][] = [];

    // Header rows
    // Row 0: ["Zone","Area","Available Capacity (MMBTU/D)" ... merged over month count]
    const topRow = ["Zone", "Area", "Available Capacity (MMBTU/D)", ...Array(months.length - 1).fill("")];
    aoa.push(topRow);

    // Row 1: ["", "", ... months]
    const monthsRow = ["", "", ...months.map(labelMMMYYYY)];
    aoa.push(monthsRow);

    // Data rows
    result_data_trim.forEach((r:any) => {
        const zone = r.zone?.name ?? "";
        const area = r.name ?? `A${r.id ?? ""}`;
        const row: any[] = [zone, area];

        const monthValueMap = new Map<string, number>();
        r.month_data.forEach((obj: any) => {
            const k = Object.keys(obj)[0];
            const v = obj[k]?.area_nominal_capacity ?? null;
            if (typeof v === "number") monthValueMap.set(k, v);
        });

        months.forEach((m) => {
            const v = monthValueMap.get(m);
            row.push(typeof v === "number" ? v : null);
        });

        aoa.push(row);
    });

    // Build sheet
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merges
    // A1:A2 & B1:B2 vertical; C1 : (C1 + months-1) horizontal
    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 0, c: 2 + (months.length - 1) } },
    ];

    // Column widths (ปรับให้คล้ายภาพ)
    ws["!cols"] = [
        { wch: 10 }, // Zone
        { wch: 10 }, // Area
        ...months.map(() => ({ wch: 16 })), // months
    ];

    // Freeze panes: top 2 rows + left 2 cols
    (ws as any)["!freeze"] = { xSplit: 2, ySplit: 2 };

    // Style headers
    setCell(ws, addr(0, 0), "Zone", headBlue);
    setCell(ws, addr(1, 0), "Area", headBlue);
    setCell(ws, addr(2, 0), "Available Capacity (MMBTU/D)", headBlue);

    months.forEach((_, i) => {
        const c = 2 + i;
        setCell(ws, addr(c, 1), labelMMMYYYY(months[i]), subHeadBlue);
    });

    // Style data cells
    const startDataRow = 2; // 0-based
    result_data_trim.forEach((r:any, idx:any) => {
        const rr = startDataRow + idx;

        // Zone
        setCell(ws, addr(0, rr), r.zone?.name ?? "", zonePill);
        // Area (ทำให้คล้าย badge)
        setCell(ws, addr(1, rr), r.name ?? `A${r.id ?? ""}`, areaBadge);

        // Values
        months.forEach((m, i) => {
            const c = 2 + i;
            // read back value from ws (already placed by aoa_to_sheet), but we want style & number format
            const raw = ws[addr(c, rr)]?.v ?? null;
            if (raw === null || raw === undefined || raw === "") {
                setCell(ws, addr(c, rr), "", { alignment: { horizontal: "right", vertical: "center" }, border: borderThin });
            } else {
                // ค่าเป็นพัน = 695000 => ต้องแสดง 695,000.000 (ตามภาพเป็น MMBTU/D มี .000)
                setCell(ws, addr(c, rr), Number(raw), cellNumberStyle);
            }
        });
    });

    // Apply borders for remaining header cells (A2,B2)
    setCell(ws, addr(0, 1), "", headBlue);
    setCell(ws, addr(1, 1), "", headBlue);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "capacity_publication_monthly");

    XLSX.writeFileXLSX(wb, filename); // triggers download in browser
}

// ----------- ฟังชั่น export ใหม่

export function epCapacityPublicationYear(payload: any) {
    let { name, columnVisibility, specificData, resData } = payload;

    let filteredColumnVisibility = Object.keys(columnVisibility)
            .filter(key => columnVisibility[key] === true)
            .reduce((obj: any, key: any) => {
                obj[key] = columnVisibility[key];
                return obj;
            }, {});

        specificData.filter = [
            ...specificData.filter,
            ...Object.keys(filteredColumnVisibility)
                .filter(key => filteredColumnVisibility[key] === true && !["zone", "area", "avaliable_capacity_mmbtu_d"].includes(key))
                .map(key => key + " ") 
        ];
  
    const formateData = resData.map((e: any) => {
      const formattedData2 = e?.year_data.reduce((acc:any, item:any) => {
        const [year, data]:any = Object.entries(item)[0];
        acc[`${year} `] =
          data['area_nominal_capacity'] !== null ? formatNumberThreeDecimal(data['area_nominal_capacity']) : "";
        return acc;
      }, {});

      let setData:any = {
        ['Zone']: e['zone']?.['name'],
        ['Area']: e['name'],
        ['Available Capacity (MMBTU/D)']: {
          ...formattedData2,
        },
      };
     
      let filteredData = Object.keys(setData)
        .filter((key) => specificData.filter.includes(key))
        .reduce((obj:any, key:any) => {
          obj[key] = setData[key];
          return obj;
        }, {});

      return filteredData;
    });

    const filterHeader = specificData.filter || [];
    const headerColorMap = specificData.filter.reduce((a:any, v:any) => ({ ...a, [v]: '1573A1'}), {}) 
    // const headerColorMap = {
    //   "Zone": '1573A1', // #1573A1
    //   "Area": '1573A1', // #1573A1
    // };
    function generateCellHighlightMapMultiple(
      keys: string[],
      data: any[],
      color: string,
    ): Record<string, Record<number, string>> {
      const result: Record<string, Record<number, string>> = {};

      for (const key of keys) {
        result[key] = {};
        for (let i = 0; i < data.length; i++) {
            // result[key][i] = 'E6F8FF'; //#E6F8FF
        }
      }

      return result;
    }

    const cellHighlightMap = generateCellHighlightMapMultiple(
      filterHeader,
      formateData,
      'EAF5F8',
    );

    const result = filterNestedData(formateData, filterHeader);

    exportDataToExcelWithMultiLevelHeaderNew(
      result,
      name,
      true,
      headerColorMap,
      cellHighlightMap,
    );

}

export function  epCapacityPublicationDay(payload: any) {
    let { name, columnVisibility, specificData, resData } = payload;

     let filteredColumnVisibility = Object.keys(columnVisibility)
            .filter(key => columnVisibility[key] === true)
            .reduce((obj: any, key: any) => {
                obj[key] = columnVisibility[key];
                return obj;
            }, {});

        specificData.filter = [
            ...specificData.filter,
            ...Object.keys(filteredColumnVisibility)
                .filter(key => filteredColumnVisibility[key] === true && !["zone", "area", "avaliable_capacity_mmbtu_d"].includes(key))
                .map(key => key + " ") 
        ];

    const formateData = resData.map((e: any) => {
      const formattedData2 = e['day_data'].reduce((acc:any, item:any) => {
        const [days, data]:any = Object.entries(item)[0]; 
        acc[`${dayjs(days, 'YYYY-MM-DD').format('DD/MM/YYYY')} `] =
          data['area_nominal_capacity'] !== null ? formatNumberThreeDecimal(data['area_nominal_capacity']) : ""; 
        return acc;
      }, {});

      let setData:any = {
        ['Zone']: e['zone']?.['name'],
        ['Area']: e['name'],
        ['Available Capacity (MMBTU/D)']: {
          ...formattedData2,
        },
      };

      let filteredData:any = Object.keys(setData)
        .filter((key) => specificData?.filter.includes(key))
        .reduce((obj:any, key:any) => {
          obj[key] = setData[key];
          return obj;
        }, {});

      return filteredData;
    });
  
    const filterHeader = specificData.filter || [];
    const headerColorMap = specificData.filter.reduce((a:any, v:any) => ({ ...a, [v]: '1573A1'}), {}) 
  
    function generateCellHighlightMapMultiple(
      keys: string[],
      data: any[],
      color: string,
    ): Record<string, Record<number, string>> {
      const result: Record<string, Record<number, string>> = {};

      for (const key of keys) {
        result[key] = {};
        for (let i = 0; i < data.length; i++) {
            // result[key][i] = 'E6F8FF'; //#E6F8FF
        }
      }

      return result;
    }

    const cellHighlightMap = generateCellHighlightMapMultiple(
      filterHeader,
      formateData,
      'EAF5F8',
    );

    const result = filterNestedData(formateData, filterHeader);

    exportDataToExcelWithMultiLevelHeaderNew(
      result,
      name,
      true,
      headerColorMap,
      cellHighlightMap,
    );
}

export function epCapacityPublicationMonth(payload: any) {
    let { name, columnVisibility, specificData, resData } = payload;

     let filteredColumnVisibility = Object.keys(columnVisibility)
            .filter(key => columnVisibility[key] === true)
            .reduce((obj: any, key: any) => {
                obj[key] = columnVisibility[key];
                return obj;
            }, {});

        specificData.filter = [
            ...specificData.filter,
            ...Object.keys(filteredColumnVisibility)
                .filter(key => filteredColumnVisibility[key] === true && !["zone", "area", "avaliable_capacity_mmbtu_d"].includes(key))
                .map(key => key + " ") 
        ];
    const formateData = resData.map((e: any) => {
      const formattedData2 = e['month_data'].reduce((acc:any, item:any) => {
        const [month, data]:any = Object.entries(item)[0];
        acc[`${dayjs(month, 'YYYY-MM').format('MMM YYYY')} `] =
          data['area_nominal_capacity'] !== null ? formatNumberThreeDecimal(data['area_nominal_capacity']) : "";
        return acc;
      }, {});
   
      let setData:any = {
        ['Zone']: e['zone']?.['name'],
        ['Area']: e['name'],
        ['Available Capacity (MMBTU/D)']: {
          ...formattedData2,
        },
      };

      let filteredData = Object.keys(setData)
        .filter((key) => specificData.filter.includes(key))
        .reduce((obj:any, key:any) => {
          obj[key] = setData[key];
          return obj;
        }, {});

      return filteredData;
    });

    const filterHeader = specificData.filter || [];
    const headerColorMap = specificData.filter.reduce((a:any, v:any) => ({ ...a, [v]: '1573A1'}), {}) 
  
    function generateCellHighlightMapMultiple(
      keys: string[],
      data: any[],
      color: string,
    ): Record<string, Record<number, string>> {
      const result: Record<string, Record<number, string>> = {};

      for (const key of keys) {
        result[key] = {};
        for (let i = 0; i < data.length; i++) {
            // result[key][i] = 'E6F8FF'; //#E6F8FF
        }
      }

      return result;
    }

    const cellHighlightMap = generateCellHighlightMapMultiple(
      filterHeader,
      formateData,
      'EAF5F8',
    );

    const result = filterNestedData(formateData, filterHeader);

    exportDataToExcelWithMultiLevelHeaderNew(
      result,
      name,
      true,
      headerColorMap,
      cellHighlightMap,
    );
}