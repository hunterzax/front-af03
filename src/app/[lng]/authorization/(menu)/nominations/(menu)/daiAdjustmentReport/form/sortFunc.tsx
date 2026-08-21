import dayjs from "dayjs";

type Direction = 'asc' | 'desc' | null;

// ค่าของ shipper ใต้ point ณ เวลา t
const getValueForPointShipper = (row: any, point: string, shipper: string, t: string): number | null => {
    const group = row.groups?.find((g: any) => g.point === point);
    if (!group) return null;
    const item = group.items?.find((it: any) => it.shipper_name === shipper);
    if (!item) return null;
    const found = item.timeShow?.find((x: any) => x.time === t);
    return found ? Number(found.value) : null;
};

// รวมค่าของทุก shipper ใต้ point ณ เวลา t
const getTotalForPoint = (row: any, point: string, t: string): number | null => {
    const group = row.groups?.find((g: any) => g.point === point);
    if (!group) return null;
    let hasAny = false;
    const sum = (group.items || []).reduce((acc: number, it: any) => {
        const f = it.timeShow?.find((x: any) => x.time === t);
        if (f && f.value != null) { hasAny = true; return acc + Number(f.value); }
        return acc;
    }, 0);
    return hasAny ? sum : null;
};

// รวมค่าของ shipper เดียวกันทุก point ณ เวลา t (fallback ถ้า key เป็นแค่ชื่อ shipper)
const getTotalForShipperAllPoints = (row: any, shipper: string, t: string): number | null => {
    let hasAny = false;
    const sum = (row.groups || []).reduce((acc: number, g: any) => {
        const it = (g.items || []).find((x: any) => x.shipper_name === shipper);
        if (!it) return acc;
        const f = it.timeShow?.find((x: any) => x.time === t);
        if (f && f.value != null) { hasAny = true; return acc + Number(f.value); }
        return acc;
    }, 0);
    return hasAny ? sum : null;
};

export const handleSortDailyAdjustment = (
    column: string,
    sortState: any,
    setSortState: (s: any) => void,
    setSortedData: (rows: any[]) => void,
    tableData: any[]
) => {
    // วงจร 3 จังหวะ: asc → desc → default
    let direction: Direction = 'asc';
    if (sortState.column === column) {
        direction = sortState.direction === 'asc' ? 'desc' : sortState.direction === 'desc' ? null : 'asc';
    }
    setSortState({ column, direction });

    if (!direction) {
        setSortedData(tableData);
        return;
    }

    // สร้าง accessor สำหรับคอลัมน์ที่คลิก
    const accessor = (row: any): number | string | null => {
        // คอลัมน์เวลา
        if (column === 'current_time') {
            // row.time เป็น 'HH:mm'
            const ts = dayjs(row.time, 'HH:mm', true);
            return ts.isValid() ? ts.valueOf() : row.time ?? null;
        }

        // point-total
        const totalMatch = column.match(/^(.+)-total$/);
        if (totalMatch) {
            const point = totalMatch[1];
            return getTotalForPoint(row, point, row.time);
        }

        // point|shipper
        const psMatch = column.match(/^(.+)\|(.+)$/);
        if (psMatch) {
            const point = psMatch[1];
            const shipper = psMatch[2];
            return getValueForPointShipper(row, point, shipper, row.time);
        }

        // shipper เดี่ยว (fallback)
        return getTotalForShipperAllPoints(row, column, row.time);
    };

    const cmp = (a: any, b: any) => {
        const av = accessor(a);
        const bv = accessor(b);

        // null-handling
        if (av == null && bv == null) return 0;
        if (av == null) return direction === 'asc' ? -1 : 1;
        if (bv == null) return direction === 'asc' ? 1 : -1;

        // ถ้าเป็นตัวเลข (timestamp หรือยอด)
        const aNum = typeof av === 'number' ? av : Number(av);
        const bNum = typeof bv === 'number' ? bv : Number(bv);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
            return direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // สุดท้ายเทียบสตริง
        const res = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
        return direction === 'asc' ? res : -res;
    };

    const sorted = [...tableData].sort(cmp);
    setSortedData(sorted);
};
