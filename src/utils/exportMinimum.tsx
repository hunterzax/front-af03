import * as XLSX from "xlsx";

/** parse DD/MM/YYYY -> Date (local, Y-M-D) */
const parseDMY = (dmy: string) => {
    const [d, m, y] = dmy.split("/").map(Number);
    return new Date(y, m - 1, d);
};

/** กลุ่มตาม key */
const groupBy = <T, K extends string | number>(arr: T[], keyFn: (x: T) => K) => {
    const map = new Map<K, T[]>();
    for (const x of arr) {
        const k = keyFn(x);
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(x);
    }
    return map;
};

/** ปัดทศนิยม 3 ตำแหน่งแบบ number */
const to3 = (n: number | null | undefined) => (n == null ? null : Number((+n).toFixed(3)));

/** เขียนไฟล์ Excel “Minimum Inventory Summary (MMBTU)” */
export function exportMinimumInventoryXLSX(data_export: any[], fileName = "minimum_inventory.xlsx") {
    if (!Array.isArray(data_export) || data_export.length === 0) return;

    // 1) รวบรวมวันทั้งหมดที่โผล่ในข้อมูล แล้วเรียงตามวันที่จริง
    const allDaysSet = new Set<string>();
    for (const z of data_export) {
        for (const g of z.groupedByWeekly || []) {
            if (g.gas_day) allDaysSet.add(g.gas_day); // รูปแบบ "DD/MM/YYYY"
        }
    }
    const days = Array.from(allDaysSet);
    days.sort((a, b) => +parseDMY(a) - +parseDMY(b));

    // 2) เตรียมหัวตาราง 2 แถว
    const headerTop: any[] = ["Shipper Name", "Contract Code", "Zone"];
    const headerBottom: any[] = ["", "", ""];
    for (const d of days) {
        headerTop.push(d, "", ""); // เดี๋ยว merge 3 ช่อง
        headerBottom.push("Change Min Inventory", "Exchange Min Inventory", "Total");
    }
    headerTop.push("Total"); // grand total (ขวาสุด)
    headerBottom.push("Total");

    // 3) สร้างแถวข้อมูล
    // 1 แถว = zone + (shipper_name, contract_code) รวมค่าตามวัน
    // รูป data_export[*].groupedByWeekly: รายวันของ group เดียวกัน
    type Row = (string | number | null)[];
    const aoa: any[][] = [headerTop, headerBottom];

    for (const zoneEntry of data_export) {
        const zoneName: string = zoneEntry.zone;
        const weekly = zoneEntry.groupedByWeekly || [];

        // จัดกลุ่มอีกชั้น: (group name + contract_code) -> records(รายวัน)
        const byShipperContract: any = groupBy(weekly, (x:any) => `${x.group}||${x.contract_code}`);

        for (const [key, records] of byShipperContract) {
            const [shipperName, contractCode] = key.split("||");

            // ทำ map รายวัน -> {change, exchange}
            const dayMap = new Map<string, { change: number; exchange: number }>();
            for (const rec of records) {
                const day = rec.gas_day as string;
                const change = rec.data
                    .filter((d: any) => d.type === "Min_Inventory_Change")
                    .reduce((s: number, d: any) => s + Number(d.value || 0), 0);
                const exch = rec.data
                    .filter((d: any) => (d.type === "Exchange_Mininventory" || d.type === "Exchange_Min_Inventory"))
                    .reduce((s: number, d: any) => s + Number(d.value || 0), 0);
                dayMap.set(day, { change, exchange: exch });
            }

            const row: Row = [shipperName, contractCode, zoneName];

            let grandTotal = 0;
            for (const d of days) {
                const val = dayMap.get(d) || { change: 0, exchange: 0 };
                const change = to3(val.change) || 0;
                const exch = to3(val.exchange) || 0;
                const total = to3(change + exch) || 0;

                row.push(change, exch, total);
                grandTotal += total;
            }
            row.push(to3(grandTotal)); // grand total ต่อแถว

            aoa.push(row);
        }
    }

    // 4) ทำ sheet + merges + ความกว้างคอลัมน์ + number format
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // merges:  - หัวซ้าย 3 ช่อง (rowSpan 2)
    //          - แต่ละวัน (colSpan 3) ที่แถว headerTop
    const merges: XLSX.Range[] = [
        // "Shipper Name"
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        // "Contract Code"
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
        // "Zone"
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    ];

    // วันเริ่มที่คอลัมน์ 3
    let startCol = 3;
    for (let i = 0; i < days.length; i++) {
        merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 2 } });
        startCol += 3;
    }
    // "Total" ขวาสุด (rowSpan 2)
    merges.push({ s: { r: 0, c: startCol }, e: { r: 1, c: startCol } });

    (ws as any)["!merges"] = merges;

    // ความกว้างคอลัมน์
    const cols: XLSX.ColInfo[] = [];
    cols.push({ wch: 18 }); // Shipper Name
    cols.push({ wch: 18 }); // Contract Code
    cols.push({ wch: 12 }); // Zone
    for (let i = 0; i < days.length * 3; i++) cols.push({ wch: 14 });
    cols.push({ wch: 16 }); // Grand Total
    ws["!cols"] = cols;

    // รูปแบบตัวเลข "#,##0.000" ให้ทุกเซลล์ตัวเลข (ตั้งแต่แถวที่ 2 เป็นต้นไป)
    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let R = 2; R <= range.e.r; ++R) {
        for (let C = 3; C <= range.e.c; ++C) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (cell && typeof cell.v === "number") {
                cell.z = "#,##0.000";
            }
        }
    }

    // 5) ทำ workbook และบันทึกไฟล์
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Minimum Inventory");
    XLSX.writeFile(wb, fileName);
}
