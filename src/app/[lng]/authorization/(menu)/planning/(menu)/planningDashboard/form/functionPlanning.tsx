import dayjs from "dayjs";

const parseMonthDDMMYYYY = (s: string) => {
    // // "01/05/2026" -> Date(2026, 4, 1)
    // const [dd, mm, yyyy] = s.split("/").map(Number);
    // // return new Date(yyyy, mm - 1, 1);
    // return new Date(yyyy, mm, 1);

    return dayjs(s, 'DD/MM/YYYY').startOf('month').toDate();
};

const formatMonthDDMMYYYY = (d: Date) => {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `01/${mm}/${yyyy}`;
};

const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);

/**
 * เติมเดือนด้านหน้าให้เริ่มจากเดือนปัจจุบัน (ถ้าเดิมเริ่ม "หลัง" เดือนปัจจุบัน)
 * - ถ้าเดิม month ว่าง -> จะสร้าง 1 เดือนคือเดือนปัจจุบัน และ value=[null]
 */
export const prependMissingMonthsFromCurrent = (data_medium_term: any[]) => {
    const now = new Date();
    const current = monthStart(now); // เดือนปัจจุบัน

    const result_ =  data_medium_term.map((group) => ({
        ...group,
        data: (group.data ?? []).map((item: any) => {
            const months = item.month ?? [];
            const values = item.value ?? [];

            // กัน edge case: month ว่าง
            if (months.length === 0) {
                return {
                    ...item,
                    month: [formatMonthDDMMYYYY(current)],
                    value: [null],
                };
            }

            const firstMonthDate = parseMonthDDMMYYYY(months[0]);

            // ถ้าเดือนปัจจุบัน "ไม่ก่อน" เดือนแรกเดิม -> ไม่ต้องเติม (ตาม requirement นี้)
            if (current >= firstMonthDate) {
                return item;
            }
            // สร้าง list เดือนที่ต้องเติม: current..(เดือนก่อน firstMonthDate)
            const prependMonths: string[] = [];
            let cursor = current;

            while (cursor < firstMonthDate) {
                prependMonths.push(formatMonthDDMMYYYY(cursor));
                cursor = addMonths(cursor, 1);
            }

            const prependNulls = new Array(prependMonths.length).fill(null);

            return {
                ...item,
                month: [...prependMonths, ...months],
                value: [...prependNulls, ...values],
            };
        }),
    }));

    return result_
};



// ===================
// ของ short term
// ===================

// const parseDayDDMMYYYY = (s: string) => {
//     // "02/03/2026" -> Date(2026, 2, 2)
//     const [dd, mm, yyyy] = s.split("/").map(Number);
//     return new Date(yyyy, mm - 1, dd);
// };

// const formatDayDDMMYYYY = (d: Date) => {
//     const dd = String(d.getDate()).padStart(2, "0");
//     const mm = String(d.getMonth() + 1).padStart(2, "0");
//     const yyyy = d.getFullYear();
//     return `${dd}/${mm}/${yyyy}`;
// };

// const dayStart = (d: Date) =>
//     new Date(d.getFullYear(), d.getMonth(), d.getDate());

// const addDays = (d: Date, n: number) =>
//     new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// /**
//  * เติมวันด้านหน้าให้เริ่มจาก "วันนี้"
//  * ถ้า day[0] > วันนี้ → จะเติมวันก่อนหน้าจนถึงวันก่อน day[0]
//  */
// export const prependMissingDaysFromCurrent = (data_short_term: any[]) => {
//     const now = new Date();
//     const current = dayStart(now); // วันนี้

//     return data_short_term.map((group) => ({
//         ...group,
//         data: (group.data ?? []).map((item:any) => {
//             const days = item.day ?? [];
//             const values = item.value ?? [];

//             // ถ้าไม่มีข้อมูลเดิมเลย
//             if (days.length === 0) {
//                 return {
//                     ...item,
//                     day: [formatDayDDMMYYYY(current)],
//                     value: [null],
//                 };
//             }

//             const firstDayDate = parseDayDDMMYYYY(days[0]);

//             // ถ้าวันนี้ >= วันแรกเดิม → ไม่ต้องเติม
//             if (current >= firstDayDate) {
//                 return item;
//             }

//             // สร้างวันใหม่ที่ต้องเติม
//             const prependDays: string[] = [];
//             let cursor = current;

//             while (cursor < firstDayDate) {
//                 prependDays.push(formatDayDDMMYYYY(cursor));
//                 cursor = addDays(cursor, 1);
//             }

//             const prependNulls = new Array(prependDays.length).fill(null);

//             return {
//                 ...item,
//                 day: [...prependDays, ...days],
//                 value: [...prependNulls, ...values],
//             };
//         }),
//     }));
// };


// ===================
// ของ short term
// ===================

const parseDayDDMMYYYY = (s: string) => {
    const [dd, mm, yyyy] = s.split("/").map(Number);
    return new Date(yyyy, mm - 1, dd);
};

const formatDayDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

const dayStart = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());

const addDays = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const monthStartX = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), 1);

/**
 * เติมวันด้านหน้าให้เริ่มจาก "วันแรกของเดือนปัจจุบัน"
 * ถ้า day[0] > วันแรกของเดือนปัจจุบัน → จะเติมวันก่อนหน้าจนถึงวันก่อน day[0]
 * ถ้าวันแรกของเดือนปัจจุบัน >= วันแรกเดิม → ไม่ต้องเติม
 */
export const prependMissingDaysFromCurrent = (data_short_term: any[]) => {
    const now = new Date();
    const currentMonthStart = dayStart(monthStartX(now));

    return data_short_term.map((group) => ({
        ...group,
        data: (group.data ?? []).map((item: any) => {
            const days = item.day ?? [];
            const values = item.value ?? [];

            // ถ้าไม่มีข้อมูลเดิมเลย
            if (days.length === 0) {
                return {
                    ...item,
                    day: [formatDayDDMMYYYY(currentMonthStart)],
                    value: [null],
                };
            }

            const firstDayDate = dayStart(parseDayDDMMYYYY(days[0]));

            // ถ้าวันต้นเดือน >= วันแรกเดิม → ไม่ต้องเติม
            if (currentMonthStart >= firstDayDate) {
                return item;
            }

            const prependDays: string[] = [];
            let cursor = currentMonthStart;

            while (cursor < firstDayDate) {
                prependDays.push(formatDayDDMMYYYY(cursor));
                cursor = addDays(cursor, 1);
            }

            const prependNulls = new Array(prependDays.length).fill(null);

            return {
                ...item,
                day: [...prependDays, ...days],
                value: [...prependNulls, ...values],
            };
        }),
    }));
};