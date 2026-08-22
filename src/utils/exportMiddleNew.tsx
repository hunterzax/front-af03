import * as XLSX from "xlsx-js-style";

import dayjs from "dayjs";

// ----------- ฟังชั่นกลาง export

export function formatNumberThreeDecimal(number: any) {
  const n = Number(number);
  if (!Number.isFinite(n)) return number;

  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  const truncated = Math.floor(abs * 1000) / 1000;

  const [i, d = ""] = truncated.toString().split(".");
  const intWithComma = i?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const dec = d.padEnd(3, "0"); // ให้ครบ 3 หลักเสมอ

  return `${sign}${intWithComma}.${dec}`;
}

export function dcimal4(number: any) {
  let numbers = number ?? 0;
  if (isNaN(numbers)) return numbers;

  if (numbers == 0) {
    return "0.0000"; // special case for zero
  }

  const fixedNumber = parseFloat(numbers).toFixed(4); // Keep 4 decimal places
  const [intPart, decimalPart] = fixedNumber.split(".");

  const withCommas = intPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${withCommas}.${decimalPart}`;
}

// digit3
export function dcimal3(number: any) {
  let numbers = number ?? 0;
  if (isNaN(numbers)) return numbers;

  if (numbers == 0) {
    return '0.000'; // special case for zero
  }

  const fixedNumber = parseFloat(numbers).toFixed(3); // Keep 4 decimal places
  const [intPart, decimalPart] = fixedNumber.split('.');

  const withCommas = intPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${withCommas}.${decimalPart}`;
};

// digit6
export function dcimal6(number: any) {
  let numbers = number ?? 0;
  if (isNaN(numbers)) return numbers;

  if (numbers == 0) {
    return '0.000000'; // special case for zero
  }

  const fixedNumber = parseFloat(numbers).toFixed(6); // Keep 4 decimal places
  const [intPart, decimalPart] = fixedNumber.split('.');

  const withCommas = intPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${withCommas}.${decimalPart}`;
};

export function filterNestedObjectByPaths(
  obj: any,
  allowedPaths: string[],
  prefix = ""
): any {
  if (typeof obj !== "object" || obj === null) return obj;

  const result: any = {};

  for (const key of Object.keys(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;

    const isExactMatch = allowedPaths.includes(currentPath);
    const hasChildrenMatch = allowedPaths.some((path) =>
      path.startsWith(`${currentPath}.`)
    );

    if (isExactMatch && !hasChildrenMatch) {
      result[key] = obj[key];
    } else if (hasChildrenMatch) {
      const nested = filterNestedObjectByPaths(
        obj[key],
        allowedPaths,
        currentPath
      );
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    }
  }

  return result;
}

export function filterNestedData(data: any[], allowedPaths: string[]): any[] {
  return data.map((item) => filterNestedObjectByPaths(item, allowedPaths));
}

export function flattenObjectNew(
  obj: any,
  prefix = "",
  result: any = {},
  pathArray: string[][] = [],
  currentPath: string[] = []
) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const newPath = [...currentPath, key];

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      flattenObjectNew(
        value,
        prefix ? `${prefix}.${key}` : key,
        result,
        pathArray,
        newPath
      );
    } else {
      const flatKey = prefix ? `${prefix}.${key}` : key;
      result[flatKey] = value;
      pathArray.push(newPath);
    }
  }

  return { result, pathArray };
}

export function buildHeaderRowsNew(paths: string[][]): string[][] {
  const maxDepth: any =
    (paths && Math.max(...paths?.map((p) => p.length))) || null;
  const rows: string[][] = Array.from({ length: maxDepth }, () => []);

  for (const path of paths) {
    const padded = [...path];
    while (padded.length < maxDepth) padded.push("");

    for (let i = 0; i < maxDepth; i++) {
      rows[i].push(padded[i]);
    }
  }

  return rows;
}

export function getFontColor(fillColor: string) {
  return fillColor?.toUpperCase() === "24ADEC" || //#24adec
    fillColor?.toUpperCase() === "3A8FB8" || //#3A8FB8
    fillColor?.toUpperCase() === "25B9D0" || //#25B9D0
    fillColor?.toUpperCase() === "6EA48D" || //#6EA48D
    fillColor?.toUpperCase() === "DEA477" || //#DEA477
    fillColor?.toUpperCase() === "1573A1" || //#1573A1
    fillColor?.toUpperCase() === "606060" || //#606060
    fillColor?.toUpperCase() === "A656C4" || //#A656C4
    fillColor?.toUpperCase() === "E94A4C" || //#E94A4C
    fillColor?.toUpperCase() === "F0843A" || //#F0843A
    fillColor?.toUpperCase() === "EAC12A" //#EAC12A
    ? "FFFFFFFF" //#FFFFFFFF
    : fillColor?.toUpperCase() === "B8E6FF" //#B8E6FF
      ? "177590" //#177590
      : "000000"; //#000000
}


// new Number
const normalizeExcelNumberText = (value: any): string => {
  return String(value ?? '')
    .trim()
    .replace(/,/g, '');
};
// new Number
const isExcelNumericValue = (value: any): boolean => {
  if (typeof value === 'number') {
    return Number.isFinite(value);
  }

  if (typeof value !== 'string') {
    return false;
  }

  const normalized = normalizeExcelNumberText(value);

  if (!normalized) {
    return false;
  }

  if (/^-?0\d+$/.test(normalized)) {
    return false
  }
  return /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized);
};
// new Number
const parseExcelNumber = (value: any): number | null => {
  if (!isExcelNumericValue(value)) {
    return null;
  }

  const parsed = Number(normalizeExcelNumberText(value));

  return Number.isFinite(parsed) ? parsed : null;
};
// new Number
const getDecimalPlacesFromValue = (value: any): number => {
  if (typeof value !== 'string') {
    return 0;
  }

  const normalized = normalizeExcelNumberText(value);
  const decimalPart = normalized.split('.')[1];

  return decimalPart?.length ?? 0;
};

// new Number
const getExcelNumberFormat = (decimal: number): string => {
  const safeDecimal = Math.max(
    0,
    Number.isFinite(Number(decimal))
      ? Number(decimal)
      : 0
  );

  if (safeDecimal === 0) {
    return '#,##0';
  }

  return `#,##0.${'0'.repeat(safeDecimal)}`;
};
// new Number
export function setWorkSheetDataAndStyle({
  ws,
  headerRows,
  rowOffset,
  flatData,
  headers,
  headerColorMap,
  cellHighlightMap,
  keyAndDecimalMap,
  extraHeader,
  cellTextColorMap,
}: {
  ws: XLSX.WorkSheet;
  headerRows: string[][];
  rowOffset: number;
  flatData: {
    result: any;
    pathArray: string[][];
  }[];
  headers: string[];
  headerColorMap: any;
  cellHighlightMap: any;
  keyAndDecimalMap?: {
    [key: string]: {
      index: number;
      decimal: number;
    }[];
  };
  extraHeader?: string[][];
  cellTextColorMap?: any;
}) {
  let extraHeaderRowOffset = 0;

  const isBlank = (value: any) => {
    return (
      value === '' ||
      value === undefined ||
      value === null
    );
  };

  /**
   * หา decimal จาก keyAndDecimalMap
   * โดยอิง key ของ header และ index ของแถวข้อมูล
   */
  const getDecimalConfig = (
    key: string,
    rowIndex: number
  ): number | undefined => {
    const configList = keyAndDecimalMap?.[key];

    if (!Array.isArray(configList)) {
      return undefined;
    }

    const matched = configList.find(
      (item: any) =>
        Number(item?.index) === Number(rowIndex)
    );

    if (
      matched?.decimal === undefined ||
      matched?.decimal === null
    ) {
      return undefined;
    }

    const decimal = Number(matched.decimal);

    if (!Number.isFinite(decimal)) {
      return undefined;
    }

    return Math.max(0, decimal);
  };

  /**
   * เพิ่ม Extra Header
   */
  if (extraHeader && extraHeader.length > 0) {
    XLSX.utils.sheet_add_aoa(ws, extraHeader, {
      origin: rowOffset,
    });

    const extraHeaderStartRow = rowOffset;

    extraHeaderRowOffset = extraHeader.length;

    for (
      let extraRowIndex = 0;
      extraRowIndex < extraHeader.length;
      extraRowIndex++
    ) {
      const extraRow = extraHeader[extraRowIndex] ?? [];

      for (let C = 0; C < extraRow.length; C++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: extraHeaderStartRow + extraRowIndex,
          c: C,
        });

        const cell = ws[cellAddress];

        if (!cell) continue;

        const headerValue = extraRow[C];

        const fillColor =
          headerColorMap?.[headerValue] ||
          'F4F4F4';

        const fontColor = getFontColor(fillColor);

        cell.s = {
          ...cell.s,
          font: {
            ...cell.s?.font,
            bold: true,
            color: {
              rgb: fontColor,
            },
          },
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: true,
          },
          fill: {
            patternType: 'solid',
            fgColor: {
              rgb: fillColor,
            },
          },
          border: {
            top: {
              style: 'thin',
              color: { rgb: '999999' },
            },
            bottom: {
              style: 'thin',
              color: { rgb: '999999' },
            },
            left: {
              style: 'thin',
              color: { rgb: '999999' },
            },
            right: {
              style: 'thin',
              color: { rgb: '999999' },
            },
          },
        };
      }
    }
  }

  /**
   * เพิ่ม Header หลัก
   */
  const headerStartRow =
    rowOffset + extraHeaderRowOffset;

  XLSX.utils.sheet_add_aoa(ws, headerRows, {
    origin: headerStartRow,
  });

  /**
   * เตรียมข้อมูลต้นฉบับ
   */
  const jsonData = flatData.map(
    (item) => item.result
  );

  const originalRows = jsonData.map((row) =>
    headers.map((key) => row?.[key])
  );

  /**
   * แปลงค่าที่หน้าตาเป็นตัวเลขให้เป็น JavaScript Number
   * ก่อนส่งเข้า sheet_add_aoa
   */
  const rows = originalRows.map((row) =>
    row.map((originalValue) => {
      const numericValue =
        parseExcelNumber(originalValue);

      if (numericValue !== null) {
        return numericValue;
      }

      return originalValue;
    })
  );

  /**
   * เพิ่มข้อมูลลง Worksheet
   */
  const dataStartRow =
    headerStartRow + headerRows.length;

  XLSX.utils.sheet_add_aoa(ws, rows, {
    origin: dataStartRow,
  });

  /**
   * Style Header
   */
  for (
    let R = 0;
    R < headerRows.length;
    R++
  ) {
    for (
      let C = 0;
      C < headers.length;
      C++
    ) {
      const cellAddress = XLSX.utils.encode_cell({
        r: headerStartRow + R,
        c: C,
      });

      const cell = ws[cellAddress];

      if (!cell) continue;

      const headerValue =
        headerRows?.[R]?.[C];

      const fullPath = headerRows
        .slice(0, R + 1)
        .map((row) => row?.[C])
        .filter((value) => !isBlank(value))
        .join('.');

      const fillColor =
        headerColorMap?.[fullPath] ||
        headerColorMap?.[headerValue] ||
        'F4F4F4';

      const fontColor =
        getFontColor(fillColor);

      cell.s = {
        ...cell.s,
        font: {
          ...cell.s?.font,
          bold: true,
          color: {
            rgb: fontColor,
          },
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
          wrapText: true,
        },
        fill: {
          patternType: 'solid',
          fgColor: {
            rgb: fillColor,
          },
        },
        border: {
          top: {
            style: 'thin',
            color: { rgb: '999999' },
          },
          bottom: {
            style: 'thin',
            color: { rgb: '999999' },
          },
          left: {
            style: 'thin',
            color: { rgb: '999999' },
          },
          right: {
            style: 'thin',
            color: { rgb: '999999' },
          },
        },
      };
    }
  }

  /**
   * กำหนดประเภท Number, Number Format,
   * สีพื้นหลัง และสีตัวอักษรของ Data Cell
   */
  for (
    let r = dataStartRow;
    r < dataStartRow + rows.length;
    r++
  ) {
    const rowIndex = r - dataStartRow;

    for (
      let c = 0;
      c < headers.length;
      c++
    ) {
      const cellAddress =
        XLSX.utils.encode_cell({
          r,
          c,
        });

      const cell = ws[cellAddress];

      if (!cell) continue;

      const key = headers[c];

      const originalValue =
        originalRows?.[rowIndex]?.[c];

      const numericValue =
        parseExcelNumber(originalValue);

      /**
       * ถ้าค่าเป็นตัวเลข
       */
      if (numericValue !== null) {
        const configuredDecimal =
          getDecimalConfig(key, rowIndex);

        /**
         * ถ้ามี keyAndDecimalMap ให้ใช้ค่าที่กำหนด
         * ถ้าไม่มี ให้ตรวจจำนวนทศนิยมจากค่าต้นฉบับ
         */
        const decimal =
          configuredDecimal ??
          getDecimalPlacesFromValue(originalValue);

        cell.v = numericValue;
        cell.t = 'n';
        cell.z = getExcelNumberFormat(decimal);

        /**
         * ลบ cached formatted text เดิม
         * เพื่อไม่ให้ Excel ใช้ค่า format เก่า
         */
        if ('w' in cell) {
          delete cell.w;
        }
      }

      const bgColor =
        cellHighlightMap?.[key]?.[rowIndex] ??
        null;

      const textColorValue =
        cellTextColorMap?.[key]?.[rowIndex] ??
        null;

      cell.s = {
        ...cell.s,
        alignment: {
          ...cell.s?.alignment,
          horizontal:
            cell.t === 'n'
              ? 'right'
              : cell.s?.alignment?.horizontal ??
                'left',
          vertical:
            cell.s?.alignment?.vertical ??
            'center',
        },

        ...(bgColor
          ? {
              fill: {
                patternType: 'solid',
                fgColor: {
                  rgb: bgColor,
                },
              },
            }
          : {}),

        ...(textColorValue
          ? {
              font: {
                ...cell.s?.font,
                color: {
                  /*
                   * ถ้า map ส่งรหัสสีมาให้ใช้รหัสนั้น
                   * ถ้าเดิมส่ง boolean ให้ใช้สีแดง
                   */
                  rgb:
                    typeof textColorValue ===
                    'string'
                      ? textColorValue.replace(
                          '#',
                          ''
                        )
                      : 'FF0000',
                },
              },
            }
          : {}),
      };
    }
  }

  /**
   * Merge Header
   */
  const merges: XLSX.Range[] = [];

  const lastHeaderRow =
    headerRows.length - 1;

  const isSameRange = (
    a: XLSX.Range,
    b: XLSX.Range
  ) => {
    return (
      a.s.r === b.s.r &&
      a.s.c === b.s.c &&
      a.e.r === b.e.r &&
      a.e.c === b.e.c
    );
  };

  const isOverlap = (
    a: XLSX.Range,
    b: XLSX.Range
  ) => {
    return !(
      a.e.r < b.s.r ||
      a.s.r > b.e.r ||
      a.e.c < b.s.c ||
      a.s.c > b.e.c
    );
  };

  const addMerge = (
    range: XLSX.Range
  ) => {
    /**
     * ไม่ merge cell เดียว
     */
    if (
      range.s.r === range.e.r &&
      range.s.c === range.e.c
    ) {
      return;
    }

    const duplicated = merges.some(
      (merge) =>
        isSameRange(merge, range)
    );

    if (duplicated) {
      return;
    }

    const overlapped = merges.some(
      (merge) =>
        isOverlap(merge, range)
    );

    if (overlapped) {
      return;
    }

    merges.push(range);
  };

  const getParentKey = (
    rowIndex: number,
    colIndex: number
  ) => {
    return headerRows
      .slice(0, rowIndex)
      .map((row) => row?.[colIndex])
      .filter((value) => !isBlank(value))
      .join('||');
  };

  /**
   * Merge แนวนอน
   * เฉพาะค่าหัวตารางที่เหมือนกันและอยู่ Parent เดียวกัน
   */
  for (
    let R = 0;
    R < headerRows.length;
    R++
  ) {
    let startC = 0;

    while (startC < headers.length) {
      const startValue =
        headerRows?.[R]?.[startC];

      if (isBlank(startValue)) {
        startC++;
        continue;
      }

      const parentKey =
        getParentKey(R, startC);

      let endC = startC;

      while (
        endC + 1 < headers.length &&
        headerRows?.[R]?.[endC + 1] ===
          startValue &&
        getParentKey(R, endC + 1) ===
          parentKey
      ) {
        endC++;
      }

      if (endC > startC) {
        addMerge({
          s: {
            r: headerStartRow + R,
            c: startC,
          },
          e: {
            r: headerStartRow + R,
            c: endC,
          },
        });
      }

      startC = endC + 1;
    }
  }

  /**
   * Merge แนวตั้ง
   * สำหรับ Header ที่ไม่มี Header ชั้นล่างต่อ
   */
  for (
    let C = 0;
    C < headers.length;
    C++
  ) {
    let leafRow = -1;

    for (
      let R = 0;
      R < headerRows.length;
      R++
    ) {
      const value =
        headerRows?.[R]?.[C];

      if (!isBlank(value)) {
        leafRow = R;
      }
    }

    if (
      leafRow >= 0 &&
      leafRow < lastHeaderRow
    ) {
      addMerge({
        s: {
          r: headerStartRow + leafRow,
          c: C,
        },
        e: {
          r:
            headerStartRow +
            lastHeaderRow,
          c: C,
        },
      });
    }
  }

  /**
   * Row Height
   */
  const totalRows =
    dataStartRow + rows.length;

  ws['!rows'] = Array.from(
    { length: totalRows },
    (_, rowIndex) => {
      const isHeaderRow =
        rowIndex < dataStartRow;

      return {
        hpx: isHeaderRow ? 40 : 30,
      };
    }
  );

  /**
   * ซ่อนแถวแรก
   */
  if (ws['!rows']?.[0]) {
    ws['!rows'][0] = {
      ...ws['!rows'][0],
      hidden: true,
    };
  }

  /**
   * Column Width
   */
  const colWidths = headers.map(
    (_, colIndex) => {
      const values = [
        ...headerRows.map(
          (row) =>
            String(row?.[colIndex] ?? '')
        ),
        ...originalRows.map(
          (row) =>
            String(row?.[colIndex] ?? '')
        ),
      ];

      const maxLength = Math.max(
        0,
        ...values.map(
          (value) => value.length
        )
      );

      return {
        wch: Math.min(
          Math.max(maxLength + 5, 10),
          40
        ),
      };
    }
  );

  ws['!cols'] = colWidths;
  ws['!merges'] = merges;

  /**
   * ใช้ตรวจสอบระหว่างทดสอบ
   * สามารถลบออกได้ภายหลัง
   */
  const firstNumericCell: {
    address: string;
    cell: any;
  } | null = (() => {
    for (
      let r = dataStartRow;
      r < dataStartRow + rows.length;
      r++
    ) {
      for (
        let c = 0;
        c < headers.length;
        c++
      ) {
        const address =
          XLSX.utils.encode_cell({
            r,
            c,
          });

        const cell = ws[address];

        if (cell?.t === 'n') {
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
    'First numeric Excel cell:',
    firstNumericCell
  );
}

export function exportDataToExcelWithMultiLevelHeaderNew(
  data: any[],
  nameFile: string,
  skipFirstRow: boolean,
  headerColorMap: any,
  cellHighlightMap: any,
  keyAndDecimalMap?: { [key: string]: { index: number; decimal: number }[] },
  cellTextColorMap?: any
): void {

  data = data?.filter((item: any) => item?.["Gas Day"] !== '')

  const wb = XLSX.utils.book_new();
  const flatData = data.map((d) => flattenObjectNew(d));
  const allKeys = flatData[0]?.result;
  const allPaths = flatData[0]?.pathArray;

  const headers = (allKeys && Object.keys(allKeys)) || null;
  const headerRows = allPaths && buildHeaderRowsNew(allPaths);
  const ws = XLSX.utils.aoa_to_sheet([]);

  const rowOffset = 1; // ซ่อนแถวแรกไว้ ไม่ใช่ซ่อนมันคือเริ่มเขียนจาก row ที่สอง (ข้าม row แรก)

  setWorkSheetDataAndStyle({
    ws,
    headerRows,
    rowOffset,
    flatData,
    headers,
    headerColorMap,
    cellHighlightMap,
    keyAndDecimalMap,
    cellTextColorMap,
  });

  const headerDepth = headerRows?.length || 0;
  const dataStartRow = rowOffset + headerDepth;

  const groupIgnore = [
    "Summary Pane.Total Entry (MMBTU/D).",
    "Summary Pane.Total Exit (MMBTU/D).",
    "Summary Pane.Imbalance Zone (MMBTU/D).",
    "Summary Pane.Instructed Flow (MMBTU/D).",
    "Detail Pane.Entry.East.",
    "Detail Pane.Entry.West.",
    "Detail Pane.Exit.East.",
    "Detail Pane.Exit.West.",
    "Detail Pane.Exit.East-West.",

    "Summary Pane.Shrinkage Volume (MMBTU/D).",

    "Summary Pane.Park (MMBTU/D).",

    "Summary Pane.Unpark (MMBTU/D).",

    "Summary Pane.SOD Park (MMBTU/D).",

    "Summary Pane.EOD Park (MMBTU/D).",

    "Summary Pane.Change Min Inventory (MMBTU/D).",

    "Summary Pane.Reserve Bal. (MMBTU/D).",

    "Summary Pane.Adjust Imbalance (MMBTU/D).",

    "Summary Pane.Vent Gas.",

    "Summary Pane.Commissioning Gas.",

    "Summary Pane.Other Gas.",

    "Summary Pane.Daily IMB (MMBTU/D).",

    "Summary Pane.Acc. IMB. (MONTH) (MMBTU/D).",

    "Summary Pane.Acc. IMB. (MMBTU/D).",

    "Summary Pane.Acc. IMB. Inventory (MMBTU/D).",

    "Summary Pane.Min. Inventory (MMBTU/D).",

    "Detail Pane.Entry.East-West.",

    "Detail Pane.Entry.East-West.",

    "Detail Pane.Exit.F2&G.",

    "Detail Pane.Exit.E.",
  ]

  const fnFilIG = (header_:any, igKey:any) => {
    const matchedHeaders = header_?.map((header: string, index: number) => ({
      header,
      index,
    }))?.filter((item: any) =>
      item.header.includes(igKey)
    );
    return matchedHeaders?.length > 1 ? matchedHeaders?.map((h_:any) => h_?.header)?.slice(0, -1) : []
  }
  let dataIgnoreGroup:any = []
  for (let ig_ = 0; ig_ < groupIgnore.length; ig_++) {
    const fig_ = fnFilIG(headers, groupIgnore?.[ig_])
    dataIgnoreGroup = [...dataIgnoreGroup, ...fig_]
  }

  const excludeRightBorderKeys = new Set([
    ...dataIgnoreGroup,
  ]);

data.forEach((row: any, index: number) => {
  const sheetRowIndex = dataStartRow + index; // 0-based
  const gasDay = String(row?.["Gas Day"] ?? "");

  let fillColor = "";

  if (gasDay.includes("TOTAL ALL :")) {
    fillColor = "FEFBEC";
  } else if (gasDay.includes("TOTAL :")) {
    fillColor = "E6F8FF";
  }

  for (let col = 0; col < headers.length; col++) {
    const cellRef = XLSX.utils.encode_cell({
      r: sheetRowIndex,
      c: col,
    });

    if (!ws[cellRef]) {
      ws[cellRef] = { t: "s", v: "" };
    }

    const currentStyle = ws[cellRef].s || {};
    const currentBorder = currentStyle.border || {};
    const headerKey = headers[col];

    const nextBorder = { ...currentBorder };

    if (excludeRightBorderKeys.has(headerKey)) {
      delete nextBorder.right;
    } else {
      nextBorder.right = {
        style: "thin",
        color: { rgb: "999999" },
      };
    }

    ws[cellRef].s = {
      ...currentStyle,

      // ใส่สีเฉพาะ TOTAL / TOTAL ALL เท่านั้น
      ...(fillColor
        ? {
            fill: {
              patternType: "solid",
              fgColor: { rgb: fillColor },
            },
          }
        : {}),

      border: nextBorder,
    };
  }
});

  // Metering Metering Checking
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  if(nameFile === "Metering Metering Checking"){
    // Helper Sheet
    const helperRows = [
      ["ค่าที่เจอหารด้วย 0"],
      ["สีส้ม ระบุค่ามากกว่า (%) หรือ ใช้สัญลักษณ์"],
      ["สีเหลือง เมื่อมีค่าน้อยกว่า (%) หรือ ใช้สัญลักษณ์"],
      ["สีม่วง กรณีค่าไม่เปลี่ยนแปลง"],
      ["สีแดง กรณีค่าติดลบ"],
      ["สีเขียว กรณี meter ปกติ"],
      ["สีเทา N/A กรณีค่าไม่เข้า"],
    ];

    const helperWs = XLSX.utils.aoa_to_sheet(helperRows);

    // ปรับความกว้าง column A
    helperWs["!cols"] = [{ wch: 60 }];

//     >%high : #fc7e11

// <%low : #fdc533

// - : #c58aff

// ค่าติดลบ : #fa7070

// ✓ : #c0ffa1

// N/A : #D3D3D3

// Div/0 : #696969
   
    const helperColors = [
      "696969", // 
      "fc7e11", // สีส้ม
      "fdc533", // สีเหลือง
      "c58aff", // สีม่วง
      "fa7070", // สีแดง
      "c0ffa1", // สีเขียว
      "D3D3D3", // สีเทา
    ];

    helperRows.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: index, c: 0 });

      if (!helperWs[cellRef]) return;

      helperWs[cellRef].s = {
        fill: {
          patternType: "solid",
          fgColor: { rgb: helperColors[index] },
        },
        font: {
          bold: true,
          color: {
            rgb: index === 0 || index === 3 || index === 4 ? "FFFFFFFF" : "FF000000",
          },
        },
        alignment: {
          vertical: "center",
          horizontal: "left",
          wrapText: true,
        },
      };
    });

    // ปรับความสูง row
    helperWs["!rows"] = helperRows.map(() => ({ hpt: 28 }));

    XLSX.utils.book_append_sheet(wb, helperWs, "Helper");
  }
  XLSX.writeFile(wb, `${nameFile}.xlsx`);
}

const NUMBER_FORMAT_4_DECIMAL = '#,##0.0000';

function applyNumberFormatByHeader(
  ws: XLSX.WorkSheet,
  headerNames: string[],
) {
  if (!ws['!ref']) return;

  const range = XLSX.utils.decode_range(ws['!ref']);
  const targetColumns = new Set<number>();
  let headerRow = -1;

  // ค้นหาตำแหน่ง Header และ Column ที่ต้องการ
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      const value = ws[address]?.v;

      if (headerNames.includes(String(value ?? '').trim())) {
        targetColumns.add(col);
        headerRow = Math.max(headerRow, row);
      }
    }
  }

  if (headerRow === -1 || targetColumns.size === 0) return;

  // กำหนด Number Format ให้ข้อมูลใต้ Header
  targetColumns.forEach((col) => {
    for (let row = headerRow + 1; row <= range.e.r; row++) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = ws[address];

      if (
        !cell ||
        cell.v === null ||
        cell.v === undefined ||
        cell.v === ''
      ) {
        continue;
      }

      const numberValue =
        typeof cell.v === 'number'
          ? cell.v
          : Number(String(cell.v).replace(/,/g, ''));

      if (!Number.isFinite(numberValue)) continue;

      cell.v = numberValue;
      cell.t = 'n';
      cell.z = NUMBER_FORMAT_4_DECIMAL;
      cell.s = {
        ...(cell.s ?? {}),
        numFmt: NUMBER_FORMAT_4_DECIMAL,
      };
    }
  });
}

export function exportAllocationReportToExcel(
  mainResult: any[],
  overusageDetailRows: any[],
  nameFile: string,
  skipFirstRow: boolean,
  headerColorMap: any,
  cellHighlightMap: any,
  detailHeaderColorMap: any,
  detailHighlightMap: any,
): void {
  const mainResultM = Array.from(
    new Set(mainResult?.map((m: any) => m?.["Shipper Name"]))
  )
  const mainResultC = Array.from(
    new Set(mainResult?.map((m: any) => m?.["Contract Code"]))
  )
  const mainResultCP = Array.from(
    new Set(mainResult?.map((m: any) => m?.["Contract Point"]))
  )

  const noverusageDetailRows_ = overusageDetailRows?.filter((f: any) => mainResultM?.includes(f?.["Shipper Name"]))
  const noverusageDetailRows_2 = noverusageDetailRows_?.filter((f: any) => mainResultC?.includes(f?.["Contract Code"]))
  const noverusageDetailRows = noverusageDetailRows_2?.filter((f: any) => mainResultCP?.includes(f?.["Contract Point"]))

  // ---------------------------------------------------
  // WORKBOOK + MAIN SHEET
  // ---------------------------------------------------
  const wb = XLSX.utils.book_new();
  const flatMainData = mainResult.map((d) => flattenObjectNew(d));
  const mainHeaders = Object.keys(flatMainData[0].result);
  const mainHeaderRows = buildHeaderRowsNew(flatMainData[0].pathArray);

  const mainWs = XLSX.utils.aoa_to_sheet([]);
  setWorkSheetDataAndStyle({
    ws: mainWs,
    headerRows: mainHeaderRows,
    rowOffset: 1,
    flatData: flatMainData,
    headers: mainHeaders,
    headerColorMap,
    cellHighlightMap,
  });

  applyNumberFormatByHeader(mainWs, [
    'Capacity Right (MMBTU/D)',
    'Nominated Value (MMBTU/D)',
    'System Allocation (MMBTU/D)',
    'Overusage (MMBTU/D)',
  ]);

  XLSX.utils.book_append_sheet(wb, mainWs, 'Overusage Main');

  // ---------------------------------------------------
  // DETAIL (AGGREGATED SUBSHEET)
  // ---------------------------------------------------

  if (noverusageDetailRows.length > 0) {

    const flatDetailData = noverusageDetailRows.map((d) =>
      flattenObjectNew(d),
    );

    const detailWs = XLSX.utils.aoa_to_sheet([]);
    const detailHeaderRows = buildHeaderRowsNew(
      flatDetailData[0].pathArray,
    );

    setWorkSheetDataAndStyle({
      ws: detailWs,
      headerRows: detailHeaderRows,
      rowOffset: 1, // ข้าม row แรก
      flatData: flatDetailData,
      headers: Object.keys(flatDetailData[0].result),
      headerColorMap: detailHeaderColorMap,
      cellHighlightMap: detailHighlightMap,
    });

    applyNumberFormatByHeader(detailWs, [
      'Nominated Value (MMBTU/D)',
      'System Allocation (MMBTU/D)',
    ]);

    XLSX.utils.book_append_sheet(wb, detailWs, 'Overusage Detail');
  }

  XLSX.writeFile(wb, `${nameFile}.xlsx`);
}

export function getTodayNow(date: any = undefined) {
  return dayjs(date); // เวลาวันนี้
}

export function parseToNumber(value: any) {
  try {
    let valueString = `${value}`?.trim()?.replace(/,/g, "");
    // Check if value is wrapped in parentheses and convert to negative
    if (
      valueString &&
      valueString.startsWith("(") &&
      valueString.endsWith(")")
    ) {
      valueString = "-" + valueString.slice(1, -1); // Remove parentheses and add negative sign
    }
    let valueNumber: number | null = Number(valueString);
    if (Number.isNaN(valueNumber)) {
      valueNumber = null;
    }
    return valueNumber;
  } catch (error) {
    return null;
  }
}

export function listToObject(keys: any, valueArr: any, groupMaster: any) {
  const result: any = {};
  keys.forEach((key: any) => {
    //

    if (key === "custom_gas_day") {
      result[key] =
        valueArr?.find((f: any) => {
          return f?.tag === key;
        })?.value ?? "";
    } else if (key === "custom_shipper_name") {
      result[key] =
        valueArr?.find((f: any) => {
          return f?.tag === key;
        })?.value ?? "";
      // const shipperIdName =
      //   valueArr?.find((f: any) => {
      //     return f?.tag === key;
      //   })?.value ?? "";

      // const findShipperName =
      //   groupMaster?.find((f: any) => {
      //     return f?.id_name === shipperIdName;
      //   })?.name || "";

      // result[key] = findShipperName;
    } else if (key === "custom_contract_code") {
      result[key] =
        valueArr?.find((f: any) => {
          return f?.tag === key;
        })?.value ?? "";
    } else {
      // result[key] =
      //   dcimal4(
      //     valueArr?.find((f: any) => {
      //       return f?.tag === key;
      //     })?.value
      //   ) ?? "";

      const xxx = valueArr?.find((f: any) => { return f?.tag === key; })?.value
      result[key] = xxx !== null && xxx !== undefined ? formatNumberFourDecimalNom(xxx) : null;
    }
  });

  return result;
}

export function formatNumberFourDecimalNom(number: any) {
  if (isNaN(number)) return number; // Handle invalid numbers gracefully

  if (number === 0 || number === "0") {
    return "0.0000"; // special case for zero
  }

  if (number == null || number === undefined || number === "") {
    return "";
  }

  const strNumber = String(number);
  const [integerPart, decimalPart = ""] = strNumber.split(".");

  let trimmedDecimal = decimalPart?.substring(0, 4); // ตัดแค่  หลัก

  if (trimmedDecimal.length === 1) {
    trimmedDecimal = trimmedDecimal + "000";
  } else if (trimmedDecimal.length === 2) {
    trimmedDecimal = trimmedDecimal + "00";
  } else if (trimmedDecimal.length === 3) {
    trimmedDecimal = trimmedDecimal + "0";
  } else if (trimmedDecimal.length === 0) {
    trimmedDecimal = "0000";
  }

  const formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${formattedInteger}.${trimmedDecimal}`;
}
