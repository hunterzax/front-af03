import * as XLSX from "xlsx-js-style";

// export const exportMinimumTabAllAndDaily = (
//     exportData: Record<string, any>[],
//     name: string,
//     extra_obj: Record<string, any>
// ) => {
//     if (!exportData?.length) return;

//     const parseNum = (str: string) => parseFloat(str?.replace(/,/g, '') || "0");

//     const keysToSum = [
//         "Change Min Inventory (MMBTU)",
//         "Exchange Min Invent (MMBTU)",
//         "Total"
//     ];

//     // สร้าง summary row
//     let summaryRow: Record<string, any> = {};
//     keysToSum.forEach(key => {
//         summaryRow[key] = exportData
//             .map(row => parseNum(row[key]))
//             .reduce((sum, val) => sum + val, 0)
//             .toLocaleString(undefined, { minimumFractionDigits: 3 });
//     });

//     const allKeys = Object.keys(exportData[0] || {});

//     // ใส่ค่า "Total" ไว้ในคอลัมน์แรกของ summary row
//     summaryRow[allKeys[0]] = "Total";

//     // เติม key อื่นให้ครบ
//     allKeys.forEach(key => {
//         if (!(key in summaryRow)) summaryRow[key] = "";
//     });

//     // เพิ่มเข้าไปใน exportData
//     exportData.push(summaryRow);

//     // สร้าง sheetData สำหรับ AOA (array of arrays)
//     const sheetData = [
//         allKeys, // Header
//         ...exportData.map(obj => allKeys.map(key => obj[key]))
//     ];

//     // ใส่ style ให้แถวสุดท้าย (summary)
//     const styledSheetData = sheetData.map((row, rowIndex) => {
//         const isSummary = rowIndex === sheetData.length - 1;
//         return row.map(cellValue => ({
//             v: cellValue,
//             s: isSummary
//                 ? {
//                     fill: {
//                         patternType: "solid",
//                         fgColor: { rgb: "D0F2FE" },
//                     },
//                     font: {
//                         bold: true,
//                     },
//                 }
//                 : {},
//         }));
//     });

//     const worksheet = XLSX.utils.aoa_to_sheet(styledSheetData);

//     // ปรับความกว้างคอลัมน์
//     const columnWidths = allKeys.map((key) => ({
//         wch: Math.max(
//             key.length,
//             ...exportData.map((row) =>
//                 row[key] ? row[key].toString().length : 0
//             )
//         ),
//     }));
//     worksheet["!cols"] = columnWidths;

//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
//     XLSX.writeFile(workbook, `${name}.xlsx`);
// };

export const exportMinimumTabAllAndDaily = (
    exportData: Record<string, any>[],
    name: string,
    extra_obj: Record<string, any>
) => {
    if (!exportData?.length) return;

    const parseNum = (str: string) => parseFloat(str || "0");

    const keysToSum = [
        "Change Min Inventory (MMBTU)",
        "Exchange Min Inventory (MMBTU)",
        "Total"
    ];
    console.log('keysToSum : ', keysToSum);

    // ✅ สร้าง summary row
    let summaryRow: Record<string, any> = {};
    keysToSum.forEach(key => {
        summaryRow[key] = exportData
            .map(row => typeof row[key] === 'string' ? parseNum(row[key]?.replace(/,/g, '')) : parseNum(row[key]))
            .reduce((sum, val) => sum + val, 0)
            .toLocaleString(undefined, { minimumFractionDigits: 3 });
    });

    const allKeys = Object.keys(exportData[0] || {});
    console.log('exportData[0] : ', exportData[0]);

    // ✅ ใส่ค่า "Total" ไว้ในคอลัมน์แรกของ summary row
    summaryRow[allKeys[0]] = "Total";

    // ✅ เติม key อื่นให้ครบ
    allKeys.forEach(key => {
        if (!(key in summaryRow)) summaryRow[key] = "";
    });

    // ✅ เพิ่มเข้าไปใน exportData
    exportData.push(summaryRow);

    // ✅ แปลงเป็น AOA และแทน null/undefined ด้วย ""
    // const sheetData = [
    //     allKeys, // Header
    //     ...exportData.map(obj =>
    //         allKeys.map(key => {
    //             const val = obj[key];
    //             return val === null || val === undefined ? "" : val;
    //         })
    //     )
    // ];

    const sheetData = [
        allKeys, // Header
        ...exportData.map(obj =>
            allKeys.map(key => {
                const val = obj[key];

                if (val === null || val === undefined || val === "") {
                    return "";
                }

                // เช็คเฉพาะ 2 คีย์นี้ ให้เติม format , และทศนิยม
                if (key === "Change Min Inventory (MMBTU)" || key === "Exchange Min Inventory (MMBTU)") {
                    const num = typeof val === "number" ? val : parseFloat(val.toString().replace(/,/g, ""));
                    if (!isNaN(num)) {
                        return num.toLocaleString(undefined, {
                            minimumFractionDigits: 3,
                            maximumFractionDigits: 3,
                        });
                    }
                }

                // คีย์อื่น return ตามเดิม
                return val;
            })
        )
    ];
    console.log('allKeys : ', allKeys);
    console.log('exportData : ', exportData);
    console.log('sheetData : ', sheetData);


    // ✅ ใส่ style ให้แถวสุดท้าย (summary)
    const styledSheetData = sheetData.map((row, rowIndex) => {
        const isSummary = rowIndex === sheetData.length - 1;
        return row.map(cellValue => ({
            v: cellValue,
            s: isSummary
                ? {
                    fill: {
                        patternType: "solid",
                        fgColor: { rgb: "D0F2FE" },
                    },
                    font: {
                        bold: true,
                    },
                }
                : {},
        }));
    });

    const worksheet = XLSX.utils.aoa_to_sheet(styledSheetData);

    // ✅ ปรับความกว้างคอลัมน์
    const columnWidths = allKeys.map((key) => ({
        wch: Math.max(
            key.length,
            ...exportData.map((row) =>
                row[key] ? row[key].toString().length : 0
            )
        ),
    }));
    worksheet["!cols"] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${name}.xlsx`);
};
