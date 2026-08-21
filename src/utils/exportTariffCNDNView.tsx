// import * as XLSX from "xlsx-js-style";

// export const exportTariffCreditDebitNoteView = (
//     exportData: Record<string, any>[],
//     name: string,
//     extra_obj: Record<string, any>
// ) => {
//     if (!exportData?.length) return;

//     // 1) เตรียมแถวบน (Top block)
//     const topKeys = Object.keys(extra_obj || {});
//     const topVals = topKeys.map((k) => (extra_obj?.[k] ?? "") as string);

//     // 2) แปลง exportData เป็น AoA
//     const tmpSheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: false });
//     const dataAoA: any[][] = XLSX.utils.sheet_to_json(tmpSheet, { header: 1 });

//     const dataCols = dataAoA[0]?.length ?? 0;
//     const maxCols = Math.max(topKeys.length, dataCols);

//     const pad = (arr: any[], len: number) =>
//         Array.from({ length: len }, (_, i) => (arr[i] ?? ""));

//     const finalAoA = [
//         pad(topKeys, maxCols), // row1 header extra
//         pad(topVals, maxCols), // row2 data extra
//         Array.from({ length: maxCols }, () => ""), // blank row
//         ...dataAoA.map((r) => pad(r, maxCols)), // ตารางข้อมูล
//     ];

//     // 3) กำหนด style เบื้องต้น
//     const borderStyle = {
//         top: { style: "thin", color: { rgb: "000000" } },
//         bottom: { style: "thin", color: { rgb: "000000" } },
//         left: { style: "thin", color: { rgb: "000000" } },
//         right: { style: "thin", color: { rgb: "000000" } },
//     };

//     // 4) แปลง AoA → worksheet พร้อม style
//     const ws = XLSX.utils.aoa_to_sheet(finalAoA);

//     // ใส่ border + alignment ให้ทุก cell
//     const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
//     for (let R = range.s.r; R <= range.e.r; ++R) {
//         for (let C = range.s.c; C <= range.e.c; ++C) {
//             const addr = XLSX.utils.encode_cell({ r: R, c: C });
//             if (!ws[addr]) continue;
//             const v = ws[addr].v;
//             const isNumber =
//                 typeof v === "number" || (typeof v === "string" && !isNaN(Number(v)));
//             ws[addr].s = {
//                 border: borderStyle,
//                 alignment: {
//                     horizontal: isNumber ? "right" : "left",
//                     vertical: "middle",
//                 },
//             };

//             // ถ้าเป็น header row ของตารางข้อมูล (row 4)
//             if (R === 3) {
//                 ws[addr].s.font = { bold: true };
//                 ws[addr].s.fill = {
//                     patternType: "solid",
//                     fgColor: { rgb: "EEEEEE" },
//                 };
//                 ws[addr].s.alignment = { horizontal: "center", vertical: "middle" };
//             }
//         }
//     }

//     // 5) ปรับขนาดคอลัมน์อัตโนมัติ
//     const colWidths = Array.from({ length: maxCols }, (_, col) => {
//         let maxLen = 10;
//         for (let row = 0; row < finalAoA.length; row++) {
//             const val = finalAoA[row][col];
//             const len = (val ? String(val) : "").length;
//             if (len > maxLen) maxLen = len;
//         }
//         return { wch: Math.min(60, maxLen + 2) };
//     });
//     (ws as any)["!cols"] = colWidths;

//     // 6) สร้าง workbook และเขียนไฟล์
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
//     XLSX.writeFile(wb, `${name}.xlsx`);
// };


import * as XLSX from "xlsx-js-style";

type Border = NonNullable<NonNullable<XLSX.CellObject["s"]>["border"]>;

const thin: Border = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
};

function applyOutline(ws: XLSX.WorkSheet, r1: number, c1: number, r2: number, c2: number) {
    // top
    for (let C = c1; C <= c2; C++) {
        const addr = XLSX.utils.encode_cell({ r: r1, c: C });
        if (!ws[addr]) continue;
        ws[addr].s = {
            ...(ws[addr].s || {}),
            border: { ...(ws[addr].s?.border || {}), top: { style: "medium", color: { rgb: "000000" } } },
        };
    }
    // bottom
    for (let C = c1; C <= c2; C++) {
        const addr = XLSX.utils.encode_cell({ r: r2, c: C });
        if (!ws[addr]) continue;
        ws[addr].s = {
            ...(ws[addr].s || {}),
            border: { ...(ws[addr].s?.border || {}), bottom: { style: "medium", color: { rgb: "000000" } } },
        };
    }
    // left
    for (let R = r1; R <= r2; R++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: c1 });
        if (!ws[addr]) continue;
        ws[addr].s = {
            ...(ws[addr].s || {}),
            border: { ...(ws[addr].s?.border || {}), left: { style: "medium", color: { rgb: "000000" } } },
        };
    }
    // right
    for (let R = r1; R <= r2; R++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: c2 });
        if (!ws[addr]) continue;
        ws[addr].s = {
            ...(ws[addr].s || {}),
            border: { ...(ws[addr].s?.border || {}), right: { style: "medium", color: { rgb: "000000" } } },
        };
    }
}

const toExcelNumber = (value: any) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const cleanValue = String(value)
    .replace(/,/g, "") // ลบ comma เช่น 2,422,024.55
    .trim();

  if (cleanValue === "") return null;

  const num = Number(cleanValue);

  return Number.isNaN(num) ? null : num;
};

export const exportTariffCreditDebitNoteView = (
    exportData: Record<string, any>[],
    name: string,
    extra_obj: Record<string, any>
) => {
    if (!exportData?.length) return;

    // ----- เตรียมข้อมูลสองบล็อก -----
    const topKeys = Object.keys(extra_obj || {});
    const topVals = topKeys.map((k) => extra_obj?.[k] ?? "");

    // ใช้ json_to_sheet -> sheet_to_json(header:1) เพื่อได้ AoA พร้อมหัวตาราง
    const tmpSheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: false });
    const dataAoA: any[][] = XLSX.utils.sheet_to_json(tmpSheet, { header: 1 });

    // จำนวนคอลัมน์ "จริง" ของแต่ละบล็อก
    const topCols = topKeys.length;
    const dataCols = (dataAoA[0]?.length ?? 0);

    // ใช้ maxCols สำหรับสร้างชีทสี่เหลี่ยม (padding)
    const maxCols = Math.max(topCols, dataCols);
    const pad = (arr: any[], len: number) => Array.from({ length: len }, (_, i) => arr[i] ?? "");

    const finalAoA = [
        pad(topKeys, maxCols),                      // r=0
        pad(topVals, maxCols),                      // r=1
        Array.from({ length: maxCols }, () => ""),  // r=2 (แถวว่าง)
        ...dataAoA.map((r) => pad(r, maxCols)),     // r>=3
    ];

    const ws = XLSX.utils.aoa_to_sheet(finalAoA);

    // ----- สไตล์ header ของ data block (row index 3 = แถวที่ 4) เฉพาะ dataCols จริง -----
    const headerRowR = 3;
    for (let c = 0; c < dataCols; c++) {
        const addr = XLSX.utils.encode_cell({ r: headerRowR, c });
        if (!ws[addr]) continue;
        ws[addr].s = {
            ...(ws[addr].s || {}),
            font: { bold: true },
            fill: { patternType: "solid", fgColor: { rgb: "EEEEEE" } },
            alignment: { horizontal: "center", vertical: "middle" },
        };
    }

    // ----- ใส่เส้นใน (thin) และ alignment เฉพาะช่วงคอลัมน์จริงของแต่ละบล็อก -----
    // Top block: r=0..1, c=0..topCols-1
    for (let r = 0; r <= 1; r++) {
        for (let c = 0; c < topCols; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!ws[addr]) continue;
            // const v = ws[addr].v;
            // const isNumber =
            //     typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)));
            // ws[addr].s = {
            //     ...(ws[addr].s || {}),
            //     border: thin,
            //     alignment: { horizontal: isNumber ? "right" : "left", vertical: "middle" },
            // };
            const cell = ws[addr];
            const num = toExcelNumber(cell.v);
            const isNumber = num !== null;

            // แปลงเฉพาะแถว value ไม่แปลง header key
            if (r === 1 && isNumber) {
            cell.v = num;
            cell.t = "n";
            cell.z = Number.isInteger(num) ? "#,##0" : "#,##0.00";
            }

            cell.s = {
            ...(cell.s || {}),
            border: thin,
            alignment: {
                horizontal: r === 1 && isNumber ? "right" : "left",
                vertical: "middle",
            },
            };
        }
    }

    // Data block: r=3..lastRow, c=0..dataCols-1
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    const lastRow = range.e.r;
    for (let r = 3; r <= lastRow; r++) {
        for (let c = 0; c < dataCols; c++) {
            const addr = XLSX.utils.encode_cell({ r, c });
            if (!ws[addr]) continue;
            // const v = ws[addr].v;
            // const isNumber =
            //     typeof v === "number" || (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v)));
            // ws[addr].s = {
            //     ...(ws[addr].s || {}),
            //     border: thin,
            //     alignment: { horizontal: isNumber ? "right" : "left", vertical: "middle" },
            // };
            const cell = ws[addr];
            const num = toExcelNumber(cell.v);
            const isNumber = num !== null;

            // แปลงเฉพาะแถว value ไม่แปลง header key
            if (r === 1 && isNumber) {
            cell.v = num;
            cell.t = "n";
            cell.z = Number.isInteger(num) ? "#,##0" : "#,##0.00";
            }

            cell.s = {
            ...(cell.s || {}),
            border: thin,
            alignment: {
                horizontal: r === 1 && isNumber ? "right" : "left",
                vertical: "middle",
            },
            };
        }
    }

    // ----- ใส่ “ขอบนอก” แยกสองบล็อก โดยใช้จำนวนคอลัมน์จริง -----
    if (topCols > 0) {
        applyOutline(ws, 0, 0, 1, topCols - 1);       // top block outline
    }
    if (dataCols > 0 && lastRow >= 3) {
        applyOutline(ws, 3, 0, lastRow, dataCols - 1); // data block outline
    }

    // ----- ปรับความกว้างคอลัมน์: อิงคอลัมน์จริงของแต่ละบล็อก ไม่อิง maxCols -----
    const totalColsToMeasure = Math.max(topCols, dataCols);
    const colWidths = Array.from({ length: totalColsToMeasure }, (_, col) => {
        let maxLen = 10;
        // วัดจากค่าจริงของแต่ละบล็อกเท่านั้น
        for (let row = 0; row < finalAoA.length; row++) {
            // ข้ามคอลัมน์ที่อยู่นอกช่วงจริงของบล็อกนั้น ๆ
            const inTop = row <= 1 && col < topCols;
            const inData = row >= 3 && col < dataCols;
            const consider = inTop || inData;
            if (!consider) continue;

            const val = finalAoA[row][col];
            const len = (val ? String(val) : "").length;
            if (len > maxLen) maxLen = len;
        }
        return { wch: Math.min(60, maxLen + 2) };
    });
    (ws as any)["!cols"] = colWidths;

    // ----- เขียนไฟล์ -----
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${name}.xlsx`);
};