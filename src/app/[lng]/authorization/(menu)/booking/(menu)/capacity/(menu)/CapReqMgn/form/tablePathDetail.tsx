import { useEffect } from "react";
import React, { FC, useState } from 'react';
import { formatDateNoTime, formatNumberThreeDecimal, formatPaths } from '@/utils/generalFormatter';
import { table_header_style, table_row_style } from "@/utils/styles";
import { getService } from "@/utils/postService";
import Spinloading from "@/components/other/spinLoading";
import { CustomTooltip } from "@/components/other/customToolTip";
import TuneIcon from "@mui/icons-material/Tune";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";

const TablePathDetail: React.FC<any> = ({ tableData, dataPeriod, setDataPeriod, dataPathDetailSearch, isReset, setIsReset, dataPathDetail, setDataPathDetail, selectedId, areaMaster, srchPeriod, setisLoadingPath, handleFieldSearchPathDetail }) => {

    const [isLoading, setIsLoading] = useState(false);
    const [dataTableForGood, setDataTableForGood] = useState<any>([]); // render ข้อมูลในตาราง
    const [dataAll, setdataAll] = useState<any>([])
    const [pathMg, setpathMg] = useState<any>([])
    const [findPeriod, setFindPeriod] = useState<any>({})

    useEffect(() => {
        let find_period = dataPeriod?.find((item: any) => item?.value == srchPeriod)
        setFindPeriod(find_period)
    }, [srchPeriod])

    const fetchPathDetail = async (data: any) => {
        const response: any = await getService(`/master/capacity/capacity-detail-period?id=${data?.id}`);
        // ถ้า response มี status 500 หรือ code เป็น ERR_BAD_RESPONSE ให้หยุด
        if (response?.status === 500 || response?.code === "ERR_BAD_RESPONSE" || response?.code === "ERR_NETWORK") {
            toast.info("Cannot get path detail data.", {
                position: 'bottom-right',
                autoClose: 3000,
            });

            setTimeout(() => {
                setIsLoading(false);
            }, 400);
            return;
        }
        // ========================================================================
        // dataGroupArea
        const updatedDataXXX = response?.data?.map((periodItem: any) => ({
            ...periodItem,
            data: periodItem.data.map((areaItem: any) => ({
                ...areaItem,
                dataGroupArea: areaItem.dataGroupArea.map((groupAreaItem: any) => {
                    return ({
                        ...groupAreaItem,
                        path_display: groupAreaItem.capacity_detail_point?.path_temp ? JSON.parse(groupAreaItem.capacity_detail_point?.path_temp) : []
                        // path_display: []
                    })
                })
            }))
        })) ?? [];
        setpathMg(response?.pathManage || null)
        setdataAll(updatedDataXXX)
        setDataPeriod((prev: any) => {
            // return response.map((item: any) => {
            return updatedDataXXX.map((item: any) => {
                return {
                    value: item.period,
                    label: formatDateNoTime(item.startDate) + '-' + formatDateNoTime(item.endDate),
                    start_date: formatDateNoTime(item.startDate),
                    end_date: formatDateNoTime(item.endDate)
                };
            });
        });

        setDataPathDetail(updatedDataXXX);
        setTimeout(() => {
            setIsLoading(false);
            setisLoadingPath(false)

        }, 400);
    }

    useEffect(() => {
        setIsLoading(true)
        fetchPathDetail(tableData);
    }, [tableData])
    

    const calculateFields = (dataGroupArea: any[], areaName: any, item:any) => {
        let area_nominal_capacity = 0;
        let capacity_right = 0;
        let pre_available_capacity = 0;
        let released = 0; // Released/UIOLI is a static value in this case
        let available_capacity_right = 0;
        let assign = 0; // ย้่ายมาจากใน forEach
        const assignArray: number[] = []; // Array to store the sum of assign values for each group
        const pathKKKK: any[] = [];
        let releaseExit:any = []

        // Iterate through each item in dataGroupArea to calculate the fields
        dataGroupArea.forEach((group: any) => {
            // let assign = 0; // Sum for each dataGroupArea

            let min_pre_avail = Math.min(...group.data.map((item?: any) => {
                return (Number(item.adjust))
            }))

            let min_assign = Math.min(...group.data.map((item?: any) => {
                return (Number(item.value))
            }))

            let min_released = Math.max(...group.data.map((item?: any) => {
                return (Number(item.release))
            }))
            group.data.forEach((dataItem: any) => {
                area_nominal_capacity = parseFloat(dataItem.area_nominal_capacity) || 0; // ไม่ sum เอามาแค่ค่าเดียว
                pre_available_capacity = min_pre_avail || parseFloat(dataItem.area_nominal_capacity)
            });
            // const findPeriod = group?.path_display?.find((f:any) => f?.period === dataToUse?.period)?.pathConfig?.findExit || []

            if (areaName?.entry_exit?.name === "Entry") {
                // startDate
                // const fDate = group?.data[0]?.date
                // const fDate = dataToUse.startDate
                const fDate = dayjs(dataPathDetailSearch?.[0]?.startDate).format("DD/MM/YYYY")
                // const filterVal = group?.data?.filter((f:any) => f?.date === fDate)
                // for (let iEt = 0; iEt < dataAll.length; iEt++) {
                    const findAreaEntry = dataAll?.find((f: any) => f?.period === dataPathDetailSearch?.[0]?.period)?.data?.find((f: any) => f?.area?.name === areaName?.name)
                    if (findAreaEntry) {
                        capacity_right = findAreaEntry?.capacityRight
                        for (let iDg = 0; iDg < findAreaEntry.dataGroupArea.length; iDg++) {
                            const filterVal = findAreaEntry.dataGroupArea[iDg]?.data?.filter((f: any) => dayjs(f?.date).format("DD/MM/YYYY") === fDate)
                            filterVal?.map((entryValue: any) => {
                                released = entryValue?.release && Number(entryValue?.release) || 0
                                assignArray.push(Number(entryValue?.value))
                                return entryValue
                            })
                        }
                    }
                // }
            } else {
                ///
                // for (let iEt = 0; iEt < dataAll.length; iEt++) {
                    const findAreaExit = dataAll?.find((f: any) => f?.period === dataPathDetailSearch?.[0]?.period)?.data?.find((f: any) => f?.area?.name === areaName?.name)
                    capacity_right = findAreaExit?.capacityRight

                // }
                const findPeriod1 = pathMg?.path_temp_json?.filter((f: any) => f?.period === dataPathDetailSearch?.[0]?.period) || []
                const fDate = group?.data[0]?.date
                const filterVal = group?.data?.filter((f: any) => f?.date === fDate)
                released = filterVal?.reduce(
                    (accumulator:any, currentValue:any) => accumulator + (currentValue?.release && Number(currentValue?.release) || 0),
                    0,
                    );
                filterVal?.map((e: any) => {

                    const findPath = findPeriod1?.find((f: any) => f?.pathConfig?.path_id === e?.path_id)

                    assignArray.push(Number(e?.value))
                    if (findPath) {
                        pathKKKK.push(findPath?.pathConfig?.findExit)
                        // release
                        // path_id
                        // releaseExit.push(min_released) 
                    }
                    const fil = group?.data?.filter((f:any) => f?.path_id === e?.path_id)
                    let min_released_exit = ((fil?.filter((f:any) => f?.release !== null))?.map((item?: any) => {
                        return (Number(item.release))
                    }))
                    let nmin_released_exit = min_released_exit?.length > 0 ? Math.max(...min_released_exit) : 0
                    // releaseExit.push(nmin_released_exit) 
                    // released = entryValue?.release && Number(entryValue?.release) || 0

                    return e
                })

            } 

            // pathKKKK.push(findPeriod)
            // // pathKKKK.push(group?.path_display)
            // // Push the sum of assign for this group into the array
            // assignArray.push(assign);
        });

        // Calculate the final Available Capacity Right (subtract assign from available capacity)
        // available_capacity_right -= capacity_right;
        // available_capacity_right = pre_available_capacity - assign + released;
        const assignSum = assignArray.reduce((sum, value) => sum + value, 0);

        // if (areaName?.entry_exit?.name !== "Entry"){
        //     released = releaseExit?.reduce(
        //         (accumulator:any, currentValue:any) => accumulator + currentValue,
        //         0,
        //     );
        // }
        available_capacity_right = pre_available_capacity - assignSum + released;
        // Return the calculated values
        return {
            area_nominal_capacity,
            capacity_right,
            pre_available_capacity: area_nominal_capacity === 0 ? 0 : pre_available_capacity,
            assignArray: area_nominal_capacity === 0 ? assignArray?.map((e:any) => 0) : assignArray, // Now returns the array of summed `assign` values
            released,
            available_capacity_right: area_nominal_capacity === 0 ? 0 : available_capacity_right,
            pathKKKK: area_nominal_capacity === 0 ? [] : pathKKKK
        };
    };

    // const dataToUse = dataPathDetailSearch.length > 0 ? dataPathDetailSearch[0] : dataPathDetail?.[0];
    
    useEffect(() => {
        const dataToUse = dataPathDetailSearch.length > 0 ? dataPathDetailSearch[0] : [];

        // if (dataToUse) {
            const data_to_set = [
                {
                    data: dataToUse?.data?.map((item: any) => {
                        // Calculate fields based on item.dataGroupArea
                        const calculatedFields: any = calculateFields(item.dataGroupArea, item.area, item);

                        return {
                            area: {
                                name: item.area.name,
                                color: item.area.color,
                            },
                            path_display: calculatedFields.pathKKKK,
                            values: [
                                // Area Nominal Capacity (sum of all `area_nominal_capacity`)
                                calculatedFields.area_nominal_capacity,

                                // Capacity Right (sum of all `value`)
                                calculatedFields.capacity_right,

                                // Pre-Available Capacity (sum of all `adjust` or `area_nominal_capacity` if `adjust` is null)
                                calculatedFields.pre_available_capacity,

                                // Assign (sum of all `value`, may be an array for multiline)
                                calculatedFields.assignArray,

                                // Released/UIOLI ('released')
                                calculatedFields.released,

                                // Available Capacity Right (calculated field)
                                calculatedFields.available_capacity_right,
                            ],
                        };
                    }),
                },
            ]
            const data_added_area = fillMissingAreas(data_to_set, areaMaster)
            setDataTableForGood(data_added_area)
        // }

         if (dataPathDetail?.length > 0) {
            const map_area_name = dataPathDetail?.[0]?.data?.map((item: any) => ({
                key: `area_${item.area.id}`,
                label: item.area.name,
                visible: true,
                entry_exit: item.area.entry_exit.name // เติมมาเพื่อเอาไว้เรียงหัว column
            }));

            const all_spark = [...initialColumns, ...map_area_name];
            // setDynamicColumns(all_spark); // <== Save dynamic columns
            // setColumnVisibility(Object.fromEntries(all_spark.map((column: any) => [column.key, column.visible])));

            const data_filter_dynamic = fillMissingDynamicColumns(all_spark, areaMaster)
            // setDynamicColumns(data_filter_dynamic); // <== Save dynamic columns
            // setColumnVisibility(Object.fromEntries(data_filter_dynamic.map((column: any) => [column.key, column.visible])));

            // Path Detail : ให้เรียงลำดับ เอา Area ที่เป็น Entry ขึ้นมาแสดงก่อน แล้วค่อยไล่ไป Exit https://app.clickup.com/t/86ev0aqjc
            // เรียง data_filter_dynamic โดย
            // 1. key ที่มีค่าเป็น "scope" ไม่ต้องเรียง
            // 2. เอาคีย์ entry_exit ที่มีค่าเป็น "Entry" ขึ้นมาก่อนแล้วเรียง label ค่าน้อยไปมาก
            // 3. ตามด้วยคีย์ entry_exit ที่มีค่าเป็น "Exit"แล้วเรียง label ค่าน้อยไปมาก
            const sorted = [
                // 1. scope ไม่เรียง
                ...data_filter_dynamic.filter(d => d.key === "scope"),

                // 2. Entry เรียง label
                ...data_filter_dynamic
                    .filter(d => d.entry_exit === "Entry")
                    .sort((a, b) => a.label.localeCompare(b.label)),

                // 3. Exit เรียง label
                ...data_filter_dynamic
                    .filter(d => d.entry_exit === "Exit")
                    .sort((a, b) => a.label.localeCompare(b.label)),
            ];

            setDynamicColumns(sorted); // <== Save dynamic columns
            setColumnVisibility(Object.fromEntries(sorted.map((column: any) => [column.key, column.visible])));
        }



        // handleFieldSearchPathDetail()
    }, [dataPathDetail, areaMaster, srchPeriod, isReset, dataPathDetailSearch])


    const initialColumns: any = [
        { key: 'scope', label: 'Scope', visible: true },
    ];
    const [dynamicColumns, setDynamicColumns] = useState<any[]>(initialColumns);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // useEffect(() => {
    //     if (dataPathDetail?.length > 0) {
    //         const map_area_name = dataPathDetail?.[0]?.data?.map((item: any) => ({
    //             key: `area_${item.area.id}`,
    //             label: item.area.name,
    //             visible: true,
    //             entry_exit: item.area.entry_exit.name // เติมมาเพื่อเอาไว้เรียงหัว column
    //         }));

    //         const all_spark = [...initialColumns, ...map_area_name];
    //         // setDynamicColumns(all_spark); // <== Save dynamic columns
    //         // setColumnVisibility(Object.fromEntries(all_spark.map((column: any) => [column.key, column.visible])));

    //         const data_filter_dynamic = fillMissingDynamicColumns(all_spark, areaMaster)
    //         // setDynamicColumns(data_filter_dynamic); // <== Save dynamic columns
    //         // setColumnVisibility(Object.fromEntries(data_filter_dynamic.map((column: any) => [column.key, column.visible])));

    //         // Path Detail : ให้เรียงลำดับ เอา Area ที่เป็น Entry ขึ้นมาแสดงก่อน แล้วค่อยไล่ไป Exit https://app.clickup.com/t/86ev0aqjc
    //         // เรียง data_filter_dynamic โดย
    //         // 1. key ที่มีค่าเป็น "scope" ไม่ต้องเรียง
    //         // 2. เอาคีย์ entry_exit ที่มีค่าเป็น "Entry" ขึ้นมาก่อนแล้วเรียง label ค่าน้อยไปมาก
    //         // 3. ตามด้วยคีย์ entry_exit ที่มีค่าเป็น "Exit"แล้วเรียง label ค่าน้อยไปมาก
    //         const sorted = [
    //             // 1. scope ไม่เรียง
    //             ...data_filter_dynamic.filter(d => d.key === "scope"),

    //             // 2. Entry เรียง label
    //             ...data_filter_dynamic
    //                 .filter(d => d.entry_exit === "Entry")
    //                 .sort((a, b) => a.label.localeCompare(b.label)),

    //             // 3. Exit เรียง label
    //             ...data_filter_dynamic
    //                 .filter(d => d.entry_exit === "Exit")
    //                 .sort((a, b) => a.label.localeCompare(b.label)),
    //         ];

    //         setDynamicColumns(sorted); // <== Save dynamic columns
    //         setColumnVisibility(Object.fromEntries(sorted.map((column: any) => [column.key, column.visible])));
    //     }
    // }, [dataPathDetail, srchPeriod]);



    const findAreaNominalCap = (area_name?: any) => {

        // findPeriod = {
        //     "value": 1,
        //     "label": "01/10/2025-31/12/2025",
        //     "start_date": "01/10/2025",
        //     "end_date": "31/12/2025"
        // }

        // กรอง areaMaster ตาม find_period
        // areaMaster ทีั่มี end_date หลัง period find_period.start_date หรือ null
        // areaMaster ทีั่มี start_date ก่อน find_period.end_date หรือ null

        const find_area = areaMaster?.filter((item: any) => {
            const startDate = item.start_date ? dayjs(item.start_date, "DD/MM/YYYY") : null;
            const endDate = item.end_date ? dayjs(item.end_date, "DD/MM/YYYY") : null;

            const periodStart = dayjs(findPeriod?.start_date, "DD/MM/YYYY");
            const periodEnd = dayjs(findPeriod?.end_date, "DD/MM/YYYY");

            // rule1: end_date หลัง periodStart หรือเป็น null
            const validEnd = !endDate || endDate.isAfter(periodStart) || endDate.isSame(periodStart, "day");

            // rule2: start_date ก่อน periodEnd หรือเป็น null
            const validStart = !startDate || startDate.isBefore(periodEnd) || startDate.isSame(periodEnd, "day");

            return validEnd && validStart;
        });

        let find_area_2 = find_area?.find((item: any) => item?.name == area_name)

        if (find_area_2) {
            return find_area_2?.area_nominal_capacity
        } else {
            let find_area_nominal = areaMaster?.find((item: any) => item?.name == area_name)
            return find_area_nominal?.area_nominal_capacity
        }


    }


    // หาชื่อ area ที่ไม่มีใน dataTableX
    const fillMissingAreas = (dataTableX: any[], areaMaster: any[]) => {
        const existingAreaNames = dataTableX[0]?.data?.map((d: any) => d.area.name);

        // dam --> area start, end

        // กรอง areaMaster ตาม period from - to
        // area ทีั่มี end หลัง period from หรือ null
        // area ทีั่มี start ก่อน period to หรือ null

        // ถ้าเจอ > 1 row ให้เอาตัวที่มี area nominal น้อยสุดมาแสดง
        // if(!!!existingAreaNames) return []

        const missingAreas = areaMaster
            ?.filter((area: any) => !existingAreaNames?.includes(area.name))
            .map((area: any) => ({
                area: {
                    name: area.name,
                    color: '', // สี area
                },
                path_display: [],
                // values: [0, 0, 0, [0], 0, 0],
                // values: [area?.area_nominal_capacity, 0, 0, [0], 0, 0], // Path Detail : ให้แสดงค่า Area Nominal ของทุก Area จากที่ Set ไว้ใน DAM > Area  https://app.clickup.com/t/86ev0an0h
                values: [findAreaNominalCap(area.name), 0, 0, [0], 0, 0], // Path Detail : ให้แสดงค่า Area Nominal ของทุก Area จากที่ Set ไว้ใน DAM > Area  https://app.clickup.com/t/86ev0an0h
            }));

        // เพิ่ม missingAreas ต่อท้าย
        dataTableX[0].data = [...(dataTableX[0]?.data || []), ...missingAreas];

        return dataTableX;
    };

    // จัดกลุ่มหัว column เพิ่ม area เข้า
    const fillMissingDynamicColumns = (dynamicColumn: any[], areaMaster: any[]) => {
        const existingKeys = dynamicColumn.map((col) => col.key);

        const missingColumns = areaMaster?.map((area) => ({
            key: `area_${area.id}`,
            label: area.name,
            visible: true,
            entry_exit: area.entry_exit.name // เติมมาเพื่อเอาไว้เรียงหัว column
        }))
            .filter((col) => !existingKeys.includes(col.key));

        return [...dynamicColumn, ...missingColumns];
    };

    return (
        <div className="border-[#DFE4EA] border-[1px] p-4 mt-4 rounded-xl shadow-sm">
            <div>
                <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div onClick={handleTogglePopover}>
                        <TuneIcon
                            className="cursor-pointer rounded-lg"
                            style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                        />
                    </div>
        
                    <div className="flex flex-wrap gap-2 justify-end">
                        {/* <SearchInput onSearch={handleSearch} /> */}
                        {/* <BtnExport textRender={"Export"} /> */}
                    </div>
                </div>
            </div>

            {
                !isLoading ?
                    <div className={`h-[calc(100vh-420px)] overflow-y-auto block  rounded-t-md relative z-1`}>
                        {
                            dataPathDetail?.length > 0 ?
                                // tableDataX?.length > 0 ?
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                        <tr className="h-9">

                                            {columnVisibility.scope && (
                                                <th scope="col" className={`${table_header_style} sticky left-0 bg-[#1473A1]`}>
                                                    {``}
                                                </th>
                                            )}

                                            {dynamicColumns
                                                ?.filter((col: any) => col.key !== 'scope')
                                                .map((col: any) => (
                                                    columnVisibility[col.key] && (
                                                        <th key={col.key} scope="col" className={`${table_header_style} text-center`}>
                                                            {col.label}
                                                        </th>
                                                    )
                                                ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {[
                                            "Area Nominal Capacity",
                                            "Capacity Right",
                                            "Pre-Available Capacity",
                                            "Assigned",
                                            "Released/UIOLI",
                                            "Available Capacity Right",
                                        ].map((rowLabel, rowIndex) => (
                                            <tr key={rowIndex} className={`${table_row_style}`}>

                                                {columnVisibility.scope && (
                                                    <td className="px-2 py-1 min-w-[200px] text-[#464255] sticky left-0 bg-[#FFFFFF] z-10">
                                                        {rowLabel}
                                                    </td>
                                                )}

                                                {
                                                    dynamicColumns
                                                        ?.filter((col: any) => col.key !== 'scope')
                                                        .map((col: any, colIndex: number) => {
                                                            // const item = tableDataX[0]?.data?.find((d: any) => d.area.name === col.label);
                                                            const item = dataTableForGood[0]?.data?.find((d: any) => d.area.name === col.label);
                                                            return (
                                                                item && columnVisibility[col.key] && (

                                                                    <td
                                                                        key={colIndex}
                                                                        className={`px-2 py-1 text-right text-[#464255] ${rowIndex === 3 ? "cursor-pointer relative" : ""}`}
                                                                    >
                                                                        {rowIndex === 3 ? (
                                                                            <CustomTooltip
                                                                                title={
                                                                                    <div>
                                                                                        {/* path display */}

                                                                                        {/* เรียงถูกแล้วแต่หน้า path managements น่าจะเรียงไม่ถูกนะพี่คม */}
                                                                                        {item.path_display?.map((pathGroup: any, groupIndex: number) => {
                                                                                            let npathGroup = []
                                                                                            for (let isort = 0; isort < pathGroup.length; isort++) {
                                                                                                if (isort === 0) {
                                                                                                    let dPgEntry = pathGroup?.find((f: any) => f?.source_id === null)
                                                                                                    npathGroup.push(dPgEntry)
                                                                                                } else {
                                                                                                    let dPgExit = pathGroup?.find((f: any) => f?.source_id === npathGroup[npathGroup.length - 1]?.area?.id)
                                                                                                    npathGroup.push(dPgExit)
                                                                                                }
                                                                                            }
                                                                                            // pathGroup

                                                                                            return (
                                                                                                <div key={groupIndex} className="flex flex-wrap items-center gap-2 pt-2 pb-2">
                                                                                                    {(npathGroup || []).map((pathItem: any, index: number) => (
                                                                                                        <div key={index} className="flex items-center gap-2">
                                                                                                            <div
                                                                                                                className="flex justify-center items-center"
                                                                                                                style={{
                                                                                                                    backgroundColor: pathItem.area.color,
                                                                                                                    width: '30px',
                                                                                                                    height: '30px',
                                                                                                                    borderRadius: pathItem.area.entry_exit_id === 1 ? '4px' : '50%',
                                                                                                                }}
                                                                                                            >
                                                                                                                <span
                                                                                                                    className={`${pathItem.area.entry_exit_id === 1 ? 'text-white' : 'text-black'} text-[13px]`}
                                                                                                                >
                                                                                                                    {pathItem.area.name}
                                                                                                                </span>
                                                                                                            </div>
                                                                                                            {index < npathGroup.length - 1 && (
                                                                                                                <span className="text-gray-500 -mr-2 -ml-2">{'→'}</span>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            )
                                                                                        })}
                                                                                    </div>
                                                                                }
                                                                                placement="top-end"
                                                                                arrow
                                                                            >
                                                                                <div className="flex items-center justify-end space-x-2">
                                                                                    <span>
                                                                                        {item.values[rowIndex] instanceof Array ? (
                                                                                            item.values[rowIndex].map((assignValue: any, index: number) => {
                                                                                                const textColor = assignValue === "0.000" ? "#000000" : "#ff0000";
                                                                                                return (
                                                                                                    <div key={index} style={{ color: textColor }} className="text-right">
                                                                                                        {/* {formatNumberThreeDecimal(-Math.abs(parseFloat(assignValue)))} */}
                                                                                                        {formatNumberThreeDecimal(-Math.abs(Number(assignValue)))}
                                                                                                        {/* {JSON.stringify(assignValue)} */}
                                                                                                    </div>
                                                                                                );
                                                                                            })
                                                                                        ) : (
                                                                                            <div
                                                                                                style={{
                                                                                                    color:
                                                                                                        item.values[rowIndex] === "0.000"
                                                                                                            ? "#000000"
                                                                                                            : parseFloat(item.values[rowIndex]) < 0
                                                                                                                ? "#000000"
                                                                                                                : Number(rowIndex) === 5 && parseFloat(item.values[rowIndex]) >= 0
                                                                                                                    ? "#0E9C56"
                                                                                                                    : "#464255",
                                                                                                }}
                                                                                            >
                                                                                                {formatNumberThreeDecimal(item.values[rowIndex])}
                                                                                            </div>
                                                                                        )}
                                                                                    </span>
                                                                                </div>
                                                                            </CustomTooltip>
                                                                        ) : (
                                                                            item.values[rowIndex] instanceof Array ? (
                                                                                item.values[rowIndex].map((assignValue: any, index: number) => {
                                                                                    const textColor = assignValue === "0.000" ? "#000000" : "#ff0000";
                                                                                    return (
                                                                                        <div key={index} style={{ color: textColor }} className="text-right">
                                                                                            {formatNumberThreeDecimal(-Math.abs(parseFloat(assignValue)))}
                                                                                        </div>
                                                                                    );
                                                                                })
                                                                            ) : (
                                                                                <div
                                                                                    style={{
                                                                                        color:
                                                                                            item.values[rowIndex] === "0.000"
                                                                                                ? "#000000"
                                                                                                : parseFloat(item.values[rowIndex]) < 0
                                                                                                    ? "#000000"
                                                                                                    : rowIndex === 5 && parseFloat(item.values[rowIndex]) >= 0
                                                                                                        ? "#0E9C56"
                                                                                                        : "#464255",
                                                                                    }}
                                                                                >
                                                                                    {formatNumberThreeDecimal(item.values[rowIndex])}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </td>
                                                                )
                                                            );
                                                        })
                                                }

                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                :
                                <div>
                                    {/* <Spinloading spin={isLoading} rounded={20} /> */}
                                    <div className="flex flex-col justify-center items-center w-[100%] pt-24">
                                        <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                                        <div className="text-[16px] text-[#9CA3AF]">
                                            No data.
                                        </div>
                                    </div>
                                </div>
                        }
                    </div >
                    :
                    <TableSkeleton />
            }


            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={dynamicColumns}
            />
        </div >
    )
}

export default TablePathDetail;