import * as XLSX from "xlsx-js-style";

export function exportAccImbalanceReportStyled(
  data: any[],
  filename = "report.xlsx"
) {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  const parseExcelNumber = (
    value: any
  ): number | null => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value)
        ? value
        : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const normalized = value
      .trim()
      .replace(/,/g, "");

    if (
      !/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(
        normalized
      )
    ) {
      return null;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed)
      ? parsed
      : null;
  };

  const headerRow1 = [
    "Gas Day",
    "Shipper Name",
    "Zone",
    "Adjust Acc. Imbalance (MMBTU)",
    "Daily Acc. Imbalance (MMBTU)",
    "",
    "Intraday Acc. Imbalance (MMBTU)",
    "",
    "Comment",
    "Updated by",
  ];

  const headerRow2 = [
    "",
    "",
    "",
    "",
    "Initial Acc. Imbalance",
    "Final Acc. Imbalance",
    "Initial Acc. Imbalance",
    "Final Acc. Imbalance",
    "",
    "",
  ];

  /*
   * คอลัมน์ตัวเลข index 3-7
   * แปลงให้เป็น JavaScript number ก่อนสร้าง worksheet
   */
  const dataRows = data.map((row) => [
    row["Gas Day"] ?? "",
    row["Shipper Name"] ?? "",
    row["Zone"] ?? "",

    parseExcelNumber(
      row["Adjust Acc. Imbalance"]
    ) ?? "",

    parseExcelNumber(
      row["Daily Initial Acc. Imbalance"]
    ) ?? "",

    parseExcelNumber(
      row["Daily Final Acc. Imbalance"]
    ) ?? "",

    parseExcelNumber(
      row["Intraday Initial Acc. Imbalance"]
    ) ?? "",

    parseExcelNumber(
      row["Intraday Final Acc. Imbalance"]
    ) ?? "",

    row["Comment"] ?? "",
    row["Updated By"] ?? "",
  ]);

  const aoa = [
    headerRow1,
    headerRow2,
    ...dataRows,
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  /*
   * Merge
   */
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
    { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
    { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
    { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } },
    { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } },
    { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } },

    { s: { r: 0, c: 4 }, e: { r: 0, c: 5 } },
    { s: { r: 0, c: 6 }, e: { r: 0, c: 7 } },
  ];

  /*
   * Styles
   */
  const border = {
    top: {
      style: "thin",
      color: { rgb: "999999" },
    },
    bottom: {
      style: "thin",
      color: { rgb: "999999" },
    },
    left: {
      style: "thin",
      color: { rgb: "999999" },
    },
    right: {
      style: "thin",
      color: { rgb: "999999" },
    },
  };

  const headerTop = {
    font: {
      bold: true,
      color: { rgb: "FFFFFF" },
      sz: 12,
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    fill: {
      patternType: "solid",
      fgColor: { rgb: "1F6E8C" },
    },
    border,
  };

  const headerSub = {
    font: {
      bold: true,
      color: { rgb: "FFFFFF" },
      sz: 11,
    },
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: true,
    },
    fill: {
      patternType: "solid",
      fgColor: { rgb: "29A8DF" },
    },
    border,
  };

  const bodyLeft = {
    alignment: {
      horizontal: "left",
      vertical: "center",
      wrapText: true,
    },
    border,
  };

  const bodyRight = {
    alignment: {
      horizontal: "right",
      vertical: "center",
      wrapText: false,
    },
    border,
  };

  const bodyCenter = {
    alignment: {
      horizontal: "center",
      vertical: "center",
      wrapText: false,
    },
    border,
  };

  if (!ws["!ref"]) {
    return;
  }

  const range = XLSX.utils.decode_range(
    ws["!ref"]
  );

  /*
   * Style Header
   */
  for (
    let c = 0;
    c <= range.e.c;
    c++
  ) {
    const cell1 =
      XLSX.utils.encode_cell({
        r: 0,
        c,
      });

    const cell2 =
      XLSX.utils.encode_cell({
        r: 1,
        c,
      });

    if (ws[cell1]) {
      ws[cell1].s = headerTop;
    }

    if (ws[cell2]) {
      ws[cell2].s = headerSub;
    }
  }

  /*
   * กำหนดคอลัมน์ตัวเลข
   */
  const numericColumns:any = new Set([
    3,
    4,
    5,
    6,
    7,
  ]);

  /*
   * Style Body และบังคับ Number
   */
  for (
    let r = 2;
    r <= range.e.r;
    r++
  ) {
    for (
      let c = 0;
      c <= range.e.c;
      c++
    ) {
      const cellAddress =
        XLSX.utils.encode_cell({
          r,
          c,
        });

      const cell = ws[cellAddress];

      if (!cell) {
        continue;
      }

      if (numericColumns.has(c)) {
        const numericValue =
          parseExcelNumber(cell.v);

        if (numericValue !== null) {
          /*
           * Excel Number จริง
           */
          cell.v = numericValue;
          cell.t = "n";

          /*
           * แสดง 4 ทศนิยม
           */
          cell.z = "#,##0.0000";

          /*
           * ลบ cached formatted text
           */
          if ("w" in cell) {
            delete cell.w;
          }
        }

        cell.s = {
          ...(cell.s || {}),
          ...bodyRight,
        };

        continue;
      }

      if (c === 0 || c === 2) {
        cell.s = {
          ...(cell.s || {}),
          ...bodyCenter,
        };
      } else {
        cell.s = {
          ...(cell.s || {}),
          ...bodyLeft,
        };
      }
    }
  }

  /*
   * Row heights
   */
  ws["!rows"] = [
    { hpt: 28 },
    { hpt: 24 },
    ...dataRows.map(() => ({
      hpt: 22,
    })),
  ];

  /*
   * Column widths
   */
  ws["!cols"] = [
    { wch: 12 },
    { wch: 16 },
    { wch: 10 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 16 },
  ];

  /*
   * Debug ตรวจสอบ Number Cell
   * ลบภายหลังได้
   */
  const firstNumericCell = (() => {
    for (
      let r = 2;
      r <= range.e.r;
      r++
    ) {
      for (const c of numericColumns) {
        const address =
          XLSX.utils.encode_cell({
            r,
            c,
          });

        const cell = ws[address];

        if (cell?.t === "n") {
          return {
            address,
            cell,
          };
        }
      }
    }

    return null;
  })();

  console.log(
    "First numeric Excel cell:",
    firstNumericCell
  );

  /*
   * Workbook
   */
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Report"
  );

  XLSX.writeFile(
    wb,
    filename,
    {
      bookType: "xlsx",
      cellStyles: true,
    }
  );
}