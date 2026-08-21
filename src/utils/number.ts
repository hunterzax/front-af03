export function parseToNumber(value: any) {
    try {
        let valueNumber : number | null = Number(`${value}`?.trim()?.replace(/,/g, ''));
        if (Number.isNaN(valueNumber)) {
            valueNumber = null;
        }
        return valueNumber;
    } catch (error) {
        return null;
    }
}