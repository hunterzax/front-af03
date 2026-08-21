export const replaceEmptyStringsWithNull = (obj:any) => {
    for (let key in obj) {
        if (obj[key] === "") {
            obj[key] = null;
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            // Recursively handle nested objects or arrays
            replaceEmptyStringsWithNull(obj[key]);
        }

        // If the key contains _min or _max, convert the value to a float
        if (key.includes('_min') || key.includes('_max')) {
            obj[key] = obj[key] !== null ? parseFloat(obj[key]) : null;
        }
    }
    return obj;
};