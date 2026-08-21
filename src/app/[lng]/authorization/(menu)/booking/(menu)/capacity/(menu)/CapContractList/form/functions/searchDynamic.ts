import dayjs from "dayjs";

const renderSearchItem: any = (initialColumns: any, start_date: any, end_date: any) => {
    //initialColumns == initialColumnsDynamicEntry_New
    //start_date == srchStartDate
    //end_date == srchEndDate

    //step 1 หา column ที่เป็น main ก่อน !parent_id
    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));
    const findMainColumn: any = initialColumns?.filter((item: any) => !item?.parent_id);

    //step 2 หา subcolumn ที่มี parent_id ตรงกับ key กับตัว main
    let reSult: any = [];

    for (let index = 0; index < findMainColumn?.length; index++) {
        const findSubColumn: any = initialColumns?.filter((item: any) => item?.parent_id == findMainColumn[index]?.key)

        if (findSubColumn?.length == 0) {
            reSult.push(findMainColumn[index])
        } else {
            let main: any = [findMainColumn[index]]
            let dateofType: any = [
                'capacity_daily_booking_mmbtu',
                'maximum_hour_booking_mmbtu',
                'capacity_daily_booking_mmscfd',
                'maximum_hour_booking_mmscfd'
            ]

            let checkType: boolean = dateofType?.some((item: string) => item === findMainColumn[index]?.key);

            // สำหรับ column ที่เป็นเดือน
            if (checkType == true) {
                const subcolumn: any = initialColumns?.filter((item: any) => item?.parent_id == findMainColumn[index]?.key && item?.label == dayjs(start_date)?.format('MMM YYYY'))
                main.push(...subcolumn)
                reSult.push(...main)
            } else if (checkType == false) {
                main.push(...findSubColumn)
                reSult.push(...main)
            }
        }
    }

    const columnVisibilityMerge = generateColumnVisibility(reSult);
    return null
}

export default renderSearchItem