//#region ICON
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TuneIcon from "@mui/icons-material/Tune";
import { ArrowBackIos } from "@mui/icons-material";
//=================================================================

import { InputSearch } from "@/components/other/SearchForm";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import { downloadService } from "@/utils/postService";
import SearchInput from "@/components/other/searchInput";
import { filterStartEndDateBooking, formatDate, formatDateNoTime, formatSearchDate, formatTime, generateUserPermission } from "@/utils/generalFormatter";
import { useEffect, useState } from "react";
import { CustomTooltip } from "@/components/other/customToolTip";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import ColumnVisibilityPopoverMT from '@/components/other/popOverfor_mt_table';
import FatherTable from '@/components/other/fatherDynamicTable';
import Spinloading from '@/components/other/spinLoading';
import { useFetchMasters } from '@/hook/fetchMaster';
import TableSkeleton from '@/components/material_custom/DefaultSkeleton';
import dayjs from 'dayjs';
import FatherTableModify from '@/components/other/fatherDynamicModify';
import ModalBkComment from './form/modalBookingVersionComment';
import ModalFiles from './form/modalFiles';

type Props = {
    data?: any;
    dataContract: any
    getBack: () => void
    handleSearch: (query: string) => void
    zoneMaster: any
    areaMaster: any
    contractMaster: any
    permission: any
};

const buttonClass = "border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px] duration-200 ease-in-out"

const ContractDetail: React.FC<Props> = ({
    data = undefined,
    dataContract = undefined,
    getBack,
    handleSearch,
    zoneMaster = [],
    areaMaster = [],
    contractMaster = [],
    permission
}) => {

    const [dataTable, setdataTable] = useState<any>(data || undefined);
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchZone, setSrchZone] = useState<any>(null);
    const [srchArea, setSrchArea] = useState<any>(null);
    const [srchContractCode, setSrchContractCode] = useState<any>(null);
    const [tk, settk] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [istableLoading, setIstableLoading] = useState<boolean>(false);

    const [optionZone, setoptionZone] = useState(zoneMaster);
    const [optionArea, setoptionArea] = useState(areaMaster);
    const [optionContractPoint, setoptionContractPoint] = useState(contractMaster);

    //#region SELECT BUTTON TYPE
    const [selectedType, setSelectedType] = useState<any>('');
    const handleButtonType = (buttonType: any) => {
        setIsLoading(true)
        setKey((prevKey) => prevKey + 1);
        setSelectedType(buttonType);
        setExpandedEntryExit(null);
        handleResetField('filterAll');

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    // ############### EXPAND MAIN ###############
    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const handleExpand = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
        setSelectedType('');
        setlogSearch(original_logSearch);
        setdataTable(data);
    };

    //#region RESET FORM
    const handleGetback = () => {
        setExpandedRow(null);
        setTimeout(() => {
            getBack() //back to list
        }, 200);
    }

    //RESET ITEM
    const handleResetField = async (mode?: 'filterDate' | 'filterSub' | 'filterAll') => {
        if (mode == 'filterDate') {
            setKey((prevKey) => prevKey + 1);
            setSrchStartDate(null);
            setSrchEndDate(null);
        } else if (mode == 'filterSub') {
            setSrchContractCode(null);
            setSrchZone(null);
            setSrchArea(null);
        } else if (mode == 'filterAll') {
            setKey((prevKey) => prevKey + 1);
            setSrchContractCode(null);
            setSrchZone(null);
            setSrchArea(null);
            setSrchStartDate(null);
            setSrchEndDate(null);

            setdataTable(data)
            settk((pre) => !pre)
            setlogSearch(original_logSearch);
            setlogPeriod({
                from: null,
                to: null
            })
        }
    }

    // ############### EXPAND ENTRY EXIT ###############
    const [expandedEntryExit, setExpandedEntryExit] = useState<any>(null);
    const handleExpandEntryExit = (id: any, id_expanded: any, mode: 'entry' | 'exit', type: 'original' | 'summary') => {

        setExpandedEntryExit(expandedEntryExit === id_expanded ? expandedEntryExit : id_expanded);

        if (expandedEntryExit !== id_expanded) {
            renderOptions(id, mode);

            let getOption: any = logSearch[type]?.[mode];
            setSrchZone(getOption?.zone_option)
            setSrchArea(getOption?.area_option)
            setSrchContractCode(getOption?.contract_option)


            //fetch initial
            setinitialColumnsDynamicEntry(masterColumnsDynamicEntry)
            setinitialColumnsDynamicExit(masterColumnsDynamicExit)
            setColumnVisibilityEntry(generateColumnVisibility(masterColumnsDynamicEntry))
            setColumnVisibilityExit(generateColumnVisibility(masterColumnsDynamicExit))
            settrickerColumn(false);
        }
    };

    const renderOptions = (id: any, mode: 'entry' | 'exit') => {
        const originalData: any = data?.booking_version?.find((item: any) => item?.id == id);
        // let originalData: any;
        // if(selectedType == 'original'){
        //     originalData = data?.booking_version?.find((item: any) => item?.id == id);
        // }else if(selectedType == 'summary'){
        //     originalData = data?.booking_version?.find((item: any) => item?.id == id);
        // }

        // getmaster
        const getData = (data: any) => {
            const filter_contract_point = contractPointData?.data?.find((item: any) => item?.contract_point === data?.trim());
            return filter_contract_point
        }

        //de dup
        const checkdupOption = (option_new: any[], options: any[], path: any) => {
            if (!options || options.length === 0 || !option_new || option_new.length === 0) return false;

            // ตรวจสอบแต่ละค่าจาก option_new ว่ามีค่าซ้ำกับ options หรือไม่
            return option_new.some((newOption: any) => {
                // เปรียบเทียบแต่ละ option ใน option_new กับ options (ใช้ id หรือ attribute อื่น ๆ ที่ต้องการ)
                return options.some((option: any) => option[path] === newOption[path]);
            });
        };


        let resultOption: any = {
            zoneOptions: [],
            areaOptions: [],
            contractOptions: [],
        };

        let typeValue: any = mode == 'entry' ? 'entryValue' : mode == 'exit' && 'exitValue'
        let originalBooking: any;

        if (selectedType == 'original') {
            originalBooking = originalData?.booking_full_json;
        } else if (selectedType == 'summary') {
            // originalBooking = originalData?.booking_full_json_release[0]?.data_temp ? originalData?.booking_full_json_release : data?.booking_full_json; // เดิมโรงงาน
            const find_release = originalData?.booking_full_json_release?.find((item: any) => item.flag_use == true)
            originalBooking = find_release ? find_release : data?.booking_full_json;
        }

        //render option
        // let originalData: any;
        originalBooking?.length > 0 && originalBooking?.map((item: any) => {
            const tempData = JSON?.parse(item?.data_temp);

            tempData[typeValue] && tempData[typeValue]?.map((value: any) => {
                let getOriginal: any = getData(value["0"]);

                let filterZoneOption = zoneMaster?.filter((item: any) => item?.name == getOriginal?.zone?.name)
                let filterAreaOption = areaMaster?.filter((item: any) => item?.name == getOriginal?.area?.name)
                let filterContractOption = contractMaster?.filter((item: any) => item?.id == getOriginal?.id)

                let checkZoneOption = checkdupOption(filterZoneOption, resultOption?.zoneOptions, 'id')
                let checkAreaOption = checkdupOption(filterAreaOption, resultOption?.areaOptions, 'id')
                let checkContractOption = checkdupOption(filterContractOption, resultOption?.contractOptions, 'id')

                if (checkZoneOption == false) {
                    resultOption.zoneOptions.push(...filterZoneOption?.flat())
                }

                if (checkAreaOption == false) {
                    resultOption.areaOptions.push(...filterAreaOption?.flat())
                }

                if (checkContractOption == false) {
                    resultOption.contractOptions.push(...filterContractOption?.flat())
                }
            })
        })

        setoptionZone(resultOption?.zoneOptions?.length > 0 ? resultOption?.zoneOptions : [])
        setoptionArea(resultOption?.areaOptions?.length > 0 ? resultOption?.areaOptions : [])
        setoptionContractPoint(resultOption?.contractOptions?.length > 0 ? resultOption?.contractOptions : [])
    }

    const handleTogglePopoverEntry = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElEntry(anchorElEntry ? null : event.currentTarget);
    };

    const handleTogglePopoverExit = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElExit(anchorElExit ? null : event.currentTarget);
    };

    const [anchorElEntry, setAnchorElEntry] = useState<null | HTMLElement>(null);
    const openEntry = Boolean(anchorElEntry);

    const [anchorElExit, setAnchorElExit] = useState<null | HTMLElement>(null);
    const openExit = Boolean(anchorElExit);

    const { contractPointData } = useFetchMasters();

    let original_logSearch = {
        original: {
            entry: {
                zone_option: '',
                area_option: '',
                contract_option: ''
            },
            exit: {
                zone_option: '',
                area_option: '',
                contract_option: ''
            }
        },
        summary: {
            entry: {
                zone_option: '',
                area_option: '',
                contract_option: ''
            },
            exit: {
                zone_option: '',
                area_option: '',
                contract_option: ''
            }
        }
    }

    const [logSearch, setlogSearch] = useState<any>(original_logSearch);
    const [logPeriod, setlogPeriod] = useState<any>({
        from: null,
        to: null
    })

    //#region SEARCH ITEM
    const handleSearchItem = async (
        dataItem: any,
        mode: 'entry' | 'exit' | 'all',
        modeSearch?: 'reset',
        resetMode?: 'filterDate' | 'filterSub',
    ) => {

        const searchMode: any = mode;

        const getData = (data: any) => {
            const filter_contract_point = contractPointData?.data?.find((item: any) => item?.contract_point === data?.trim());
            return filter_contract_point
        }

        function getDatesBetween(startDateStr: string, endDateStr: string, mode: 'date' | 'month'): string[] {
            const result: string[] = [];

            const [startDay, startMonth, startYear] = startDateStr.split('/').map(Number);
            const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number);

            let currentDate = new Date(startYear, startMonth - 1, startDay);
            const endDate = new Date(endYear, endMonth - 1, endDay);

            if (mode === 'date') {
                // รายวัน
                while (currentDate <= endDate) {
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const year = currentDate.getFullYear();

                    result.push(`${day}/${month}/${year}`);

                    currentDate.setDate(currentDate.getDate() + 1);
                }
            } else if (mode === 'month') {
                // รายเดือน — ให้ return เป็น “01/MM/YYYY”
                // เริ่มต้นให้วันที่เป็นวันที่ 1 ของเดือนแรก
                currentDate.setDate(1);

                while (currentDate <= endDate) {
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const year = currentDate.getFullYear();

                    result.push(`01/${month}/${year}`);

                    // ไปเดือนถัดไป
                    // แต่ก่อนเพิ่มเดือน ควรรักษาวันไว้ (คือวันที่ 1) เพราะว่า .setMonth อาจเปลี่ยนวันโดยอัตโนมัติถ้าเดือนใหม่ไม่มีวันนั้น
                    currentDate.setMonth(currentDate.getMonth() + 1);
                    currentDate.setDate(1);
                }
            }

            return result;
        }

        function filterByKey(objArray: any[], keyArray: any[]): any {
            if (!objArray || objArray.length === 0 || !keyArray || keyArray.length === 0) {
                // Invalid input
                return {};
            }

            const startKey = keyArray[0];
            const startIndex = keyArray.indexOf(startKey);

            if (startIndex === -1) {
                // Start key not found in keyArray
                return {};
            }

            // ✅ คงไว้เสมอ: "0", "1" ถึง "6"
            const fixedKeys = ["0", ...Array.from({ length: 6 }, (_, i) => (i + 1).toString())];

            // ✅ รวม keys จาก keyArray ตั้งแต่ startKey เป็นต้นไป
            const dynamicKeys = keyArray.slice(startIndex);

            // ✅ สร้าง Set ของ key ที่ต้องเก็บไว้
            const keysToKeep = new Set([...fixedKeys, ...dynamicKeys]);

            // ✅ ดึง object แรกจาก array
            const targetObj = objArray[0];
            const result: any = {};

            for (const [key, value] of Object.entries(targetObj)) {
                if (keysToKeep.has(key)) {
                    result[key] = value;
                }
            }

            return result;
        }


        const newData: any = dataItem;
        const originalData: any = data?.booking_version?.find((item: any) => item?.id == newData?.id)

        const dataTableItem: any = dataTable?.booking_version?.find((item: any) => item?.id == newData?.id)

        let originalBooking: any;

        if (selectedType == 'original') {
            originalBooking = originalData?.booking_full_json;
        } else if (selectedType == 'summary') {
            // originalBooking = originalData?.booking_full_json_release[0]?.data_temp ? originalData?.booking_full_json_release : originalData?.booking_full_json;// เดิมโรงงาน
            const find_release = originalData?.booking_full_json_release?.find((item: any) => item.flag_use == true)
            originalBooking = find_release ? find_release : originalData?.booking_full_json;
        }

        if (modeSearch == 'reset') {
            setIstableLoading(true);
            handleResetField(resetMode == 'filterDate' ? 'filterDate' : 'filterSub');

            let resultFilter: any = [];

            if (mode == 'entry' || mode == 'exit') {
                if (resetMode == 'filterSub') {
                    setLogOption('zone_option', searchMode, undefined, selectedType)
                    setLogOption('area_option', searchMode, undefined, selectedType)
                    setLogOption('contract_option', searchMode, undefined, selectedType)



                    if (mode == 'entry') {
                        resultFilter = originalBooking?.map((item: any) => {

                            const tempData = JSON?.parse(item?.data_temp);

                            let preiod_start: any = null //start date
                            let preiod_end: any = null //end date

                            const filteredValue = tempData?.entryValue?.filter((value: any) => {
                                let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                                let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                                preiod_start = srch_start_date || value["5"] //start date
                                preiod_end = srch_end_date || value["6"] //end date

                                return value
                            })

                            // filtered data opposite ==> เอา data ฝั่งตรงข้าม [entry, exit]
                            const getOpposite = dataTableItem?.booking_full_json?.map((item: any) => {
                                const tempData = JSON?.parse(item?.data_temp)?.exitValue;
                                return tempData
                            })

                            let dateTableColumns: any = [];

                            if (dataContract?.id == 4) {
                                dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                            } else {
                                dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                            }

                            const headerDateColumns = Object.entries(tempData?.headerEntry);

                            const headerDateArray = headerDateColumns?.map(([columnName, subcolumnsObj]) => {
                                return {
                                    columns: columnName,
                                    subcolumns: subcolumnsObj as any  // ให้เป็น object เดิม
                                };
                            });

                            let getKeydateColumn: any = [];


                            headerDateArray?.map((item: any) => {
                                let bypassColumns = [
                                    'Capacity Daily Booking (MMBTU/d)',
                                    'Capacity Daily Booking (MMscfd)',
                                    'Maximum Hour Booking (MMBTU/h)',
                                    'Maximum Hour Booking (MMscfh)',
                                ]

                                if (bypassColumns?.find((f: any) => f == item?.columns)) {
                                    dateTableColumns?.length > 0 && dateTableColumns?.map((date: any) => {
                                        getKeydateColumn.push(item?.subcolumns[date]?.key)
                                    })
                                }
                            })

                            const resultFilteredValue = filteredValue?.map((item: any) => {
                                return filterByKey([item], getKeydateColumn);
                            })

                            return {
                                ...item,
                                data_temp: JSON.stringify({
                                    ...tempData,
                                    entryValue: resultFilteredValue,
                                    exitValue: getOpposite?.flat()
                                }),
                            };
                        })
                    } else if (mode == 'exit') {
                        resultFilter = originalBooking?.map((item: any) => {

                            const tempData = JSON?.parse(item?.data_temp);

                            let preiod_start: any = null //start date
                            let preiod_end: any = null //end date

                            const filteredValue = tempData?.exitValue?.filter((value: any) => {
                                let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                                let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                                preiod_start = srch_start_date || value["5"] //start date
                                preiod_end = srch_end_date || value["6"] //end date

                                return value
                            })


                            // filtered data opposite ==> เอา data ฝั่งตรงข้าม [entry, exit]
                            const getOpposite = dataTableItem?.booking_full_json?.map((item: any) => {
                                const tempData = JSON?.parse(item?.data_temp)?.entryValue;
                                return tempData
                            })

                            let dateTableColumns: any = [];

                            if (dataContract?.id == 4) {
                                dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                            } else {
                                dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                            }

                            const headerDateColumns = Object.entries(tempData?.headerExit);

                            const headerDateArray = headerDateColumns?.map(([columnName, subcolumnsObj]) => {
                                return {
                                    columns: columnName,
                                    subcolumns: subcolumnsObj as any  // ให้เป็น object เดิม
                                };
                            });

                            let getKeydateColumn: any = [];

                            headerDateArray?.map((item: any) => {
                                let bypassColumns = [
                                    'Capacity Daily Booking (MMBTU/d)',
                                    'Capacity Daily Booking (MMscfd)',
                                    'Maximum Hour Booking (MMBTU/h)',
                                    'Maximum Hour Booking (MMscfh)',
                                ]

                                if (bypassColumns?.find((f: any) => f == item?.columns)) {
                                    dateTableColumns?.length > 0 && dateTableColumns?.map((date: any) => {
                                        getKeydateColumn.push(item?.subcolumns[date]?.key)
                                    })
                                }
                            })

                            const resultFilteredValue = filteredValue?.map((item: any) => {
                                return filterByKey([item], getKeydateColumn);
                            })

                            return {
                                ...item,
                                data_temp: JSON.stringify({
                                    ...tempData,
                                    exitValue: resultFilteredValue,
                                    entryValue: getOpposite?.flat()
                                }),
                            };
                        })
                    }

                    await setValueTable(resultFilter);
                }
            } else if (mode == 'all') {

                resultFilter = originalBooking?.map((item: any) => {

                    const tempData = JSON?.parse(item?.data_temp);

                    const filteredValueENTRY = tempData?.entryValue?.filter((value: any) => {
                        let getOriginal: any = getData(value["0"]);

                        const conditionZone = srchZone ? getOriginal?.zone?.name == srchZone : true;
                        const conditionArea = srchArea ? getOriginal?.area?.name === srchArea : true;
                        const conditionContract = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                        return conditionZone && conditionArea && conditionContract
                    })

                    const filteredValueEXIT = tempData?.exitValue?.filter((value: any) => {
                        let getOriginal: any = getData(value["0"]);

                        const conditionZone = srchZone ? getOriginal?.zone?.name == srchZone : true;
                        const conditionArea = srchArea ? getOriginal?.area?.name === srchArea : true;
                        const conditionContract = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                        return conditionZone && conditionArea && conditionContract
                    })

                    return {
                        ...item,
                        data_temp: JSON.stringify({
                            ...tempData,
                            entryValue: filteredValueENTRY,
                            exitValue: filteredValueEXIT
                        }),
                    };
                })

                // await setValueTable(resultFilter);

                setlogPeriod((pre: any) => ({
                    ...pre,
                    from: null,
                    to: null
                }))
            }

            await setValueTable(resultFilter);

            setTimeout(() => {
                setIstableLoading(false);
            }, 300);
        } else if (searchMode == 'entry' || searchMode == 'exit') {
            setIstableLoading(true);
            let resultFilter: any = [];

            if (mode == 'entry') {
                resultFilter = originalBooking?.map((item: any) => {

                    const tempData = JSON?.parse(item?.data_temp);

                    let preiod_start: any = null //start date
                    let preiod_end: any = null //end date

                    const filteredValue = tempData?.entryValue?.filter((value: any) => {
                        let getOriginal: any = getData(value["0"]);

                        let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                        let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                        preiod_start = srch_start_date || value["5"] //start date
                        preiod_end = srch_end_date || value["6"] //end date

                        const conditionZone = srchZone ? getOriginal?.zone?.name == srchZone : true;
                        const conditionArea = srchArea ? getOriginal?.area?.name === srchArea : true;
                        const conditionContract = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                        return conditionZone && conditionArea && conditionContract
                    })

                    const getOpposite = dataTableItem?.booking_full_json?.map((item: any) => {
                        const tempData = JSON?.parse(item?.data_temp)?.exitValue;
                        return tempData
                    })

                    let dateTableColumns: any = [];

                    if (dataContract?.id == 4) {
                        dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                    } else {
                        dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                    }

                    const headerDateColumns = Object.entries(tempData?.headerEntry);

                    const headerDateArray = headerDateColumns?.map(([columnName, subcolumnsObj]) => {
                        return {
                            columns: columnName,
                            subcolumns: subcolumnsObj as any  // ให้เป็น object เดิม
                        };
                    });

                    let getKeydateColumn: any = [];

                    headerDateArray?.map((item: any) => {
                        let bypassColumns = [
                            'Capacity Daily Booking (MMBTU/d)',
                            'Capacity Daily Booking (MMscfd)',
                            'Maximum Hour Booking (MMBTU/h)',
                            'Maximum Hour Booking (MMscfh)',
                        ]

                        if (bypassColumns?.find((f: any) => f == item?.columns)) {
                            dateTableColumns?.length > 0 && dateTableColumns?.map((date: any) => {
                                getKeydateColumn.push(item?.subcolumns[date]?.key)
                            })
                        }
                    })

                    const resultFilteredValue = filteredValue?.map((item: any) => {
                        return filterByKey([item], getKeydateColumn);
                    })

                    return {
                        ...item,
                        data_temp: JSON.stringify({
                            ...tempData,
                            entryValue: resultFilteredValue,
                            exitValue: getOpposite?.flat()
                        }),
                    };
                })
            } else if (mode == 'exit') {
                resultFilter = originalBooking?.map((item: any) => {

                    const tempData = JSON?.parse(item?.data_temp);

                    let preiod_start: any = null //start date
                    let preiod_end: any = null //end date

                    const filteredValue = tempData?.exitValue?.filter((value: any) => {
                        let getOriginal: any = getData(value["0"]);

                        let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                        let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                        preiod_start = srch_start_date || value["5"] //start date
                        preiod_end = srch_end_date || value["6"] //end date

                        const conditionZone = srchZone ? getOriginal?.zone?.name == srchZone : true;
                        const conditionArea = srchArea ? getOriginal?.area?.name === srchArea : true;
                        const conditionContract = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                        return conditionZone && conditionArea && conditionContract
                    })

                    // filtered data opposite ==> เอา data ฝั่งตรงข้าม [entry, exit]
                    const getOpposite = dataTableItem?.booking_full_json?.map((item: any) => {
                        const tempData = JSON?.parse(item?.data_temp)?.entryValue;
                        return tempData
                    })

                    let dateTableColumns: any = [];

                    if (dataContract?.id == 4) {
                        dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                    } else {
                        dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                    }

                    const headerDateColumns = Object.entries(tempData?.headerExit);

                    const headerDateArray = headerDateColumns?.map(([columnName, subcolumnsObj]) => {
                        return {
                            columns: columnName,
                            subcolumns: subcolumnsObj as any  // ให้เป็น object เดิม
                        };
                    });

                    let getKeydateColumn: any = [];

                    headerDateArray?.map((item: any) => {
                        let bypassColumns = [
                            'Capacity Daily Booking (MMBTU/d)',
                            'Capacity Daily Booking (MMscfd)',
                            'Maximum Hour Booking (MMBTU/h)',
                            'Maximum Hour Booking (MMscfh)',
                        ]

                        if (bypassColumns?.find((f: any) => f == item?.columns)) {
                            dateTableColumns?.length > 0 && dateTableColumns?.map((date: any) => {
                                getKeydateColumn.push(item?.subcolumns[date]?.key)
                            })
                        }
                    })

                    const resultFilteredValue = filteredValue?.map((item: any) => {
                        return filterByKey([item], getKeydateColumn);
                    })

                    return {
                        ...item,
                        data_temp: JSON.stringify({
                            ...tempData,
                            exitValue: resultFilteredValue,
                            entryValue: getOpposite?.flat()
                        }),
                    };
                })
            }

            await setValueTable(resultFilter);

            setLogOption('zone_option', searchMode, srchZone || undefined, selectedType)
            setLogOption('area_option', searchMode, srchArea || undefined, selectedType)
            setLogOption('contract_option', searchMode, srchContractCode || undefined, selectedType)

            setTimeout(() => {
                setIstableLoading(false);
            }, 300);
        } else if (mode == 'all') {
            setIstableLoading(true);
            let resultFilter: any = [];

            resultFilter = originalBooking?.map((item: any) => {

                const tempData = JSON?.parse(item?.data_temp);

                let preiod_start: any = null //start date
                let preiod_end: any = null //end date

                const filteredValueENTRY = tempData?.entryValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                    let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                    preiod_start = srch_start_date || value["5"] //start date
                    preiod_end = srch_end_date || value["6"] //end date

                    const conditionZone = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const conditionArea = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const conditionContract = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                    return conditionZone && conditionArea && conditionContract
                })

                const filteredValueEXIT = tempData?.exitValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                    let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                    preiod_start = srch_start_date || value["5"] //start date
                    preiod_end = srch_end_date || value["6"] //end date

                    const conditionZone = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const conditionArea = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const conditionContract = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                    return conditionZone && conditionArea && conditionContract
                })

                let dateTableColumns: any = [];

                if (dataContract?.id == 4) {
                    dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                } else {
                    dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                }

                const reMaping = (datamap: any) => {
                    let result = datamap?.map(([columnName, subcolumnsObj]: any) => {
                        return {
                            columns: columnName,
                            subcolumns: subcolumnsObj as any  // ให้เป็น object เดิม
                        };
                    });
                    return result
                }

                const renderKey = (datamap: any) => {
                    let keygen: any = [];
                    datamap?.length > 0 && datamap?.map((item: any) => {
                        let bypassColumns = [
                            'Capacity Daily Booking (MMBTU/d)',
                            'Capacity Daily Booking (MMscfd)',
                            'Maximum Hour Booking (MMBTU/h)',
                            'Maximum Hour Booking (MMscfh)',
                        ]

                        if (bypassColumns?.find((f: any) => f == item?.columns)) {
                            dateTableColumns?.length > 0 && dateTableColumns?.map((date: any) => {
                                keygen.push(item?.subcolumns[date]?.key)
                            })
                        }
                    })

                    return keygen
                }

                const headerDateColumnsENTRY = Object.entries(tempData?.headerEntry);
                const headerDateColumnsEXIT = Object.entries(tempData?.headerExit);

                const headerDateArrayENTRY = reMaping(headerDateColumnsENTRY);
                const headerDateArrayEXIT = reMaping(headerDateColumnsEXIT);

                let getKeydateColumnENTRY: any = renderKey(headerDateArrayENTRY);
                let getKeydateColumnEXIT: any = renderKey(headerDateArrayEXIT);

                const resultFilteredValueENTRY = filteredValueENTRY?.map((item: any) => {
                    return filterByKey([item], getKeydateColumnENTRY);
                })

                const resultFilteredValueEXIT = filteredValueEXIT?.map((item: any) => {
                    return filterByKey([item], getKeydateColumnEXIT);
                })

                return {
                    ...item,
                    data_temp: JSON.stringify({
                        ...tempData,
                        entryValue: resultFilteredValueENTRY,
                        exitValue: resultFilteredValueEXIT
                    }),
                };
            })

            await setValueTable(resultFilter);

            setlogPeriod((pre: any) => ({
                ...pre,
                from: srchStartDate || null,
                to: srchEndDate || null
            }))

            setTimeout(() => {
                setIstableLoading(false);
            }, 300);
        }

        settrickerColumn(false);
    }

    const setValueTable = (resultFilter: any) => {
        const loadData = data;

        const findItemTable = loadData?.booking_version?.map((item: any) => {
            if (selectedType == 'original') {
                const checkMatch = item?.booking_full_json?.every((a: any) => resultFilter?.some((b: any) => b?.id === a?.id));
                if (checkMatch == true) {
                    return {
                        ...item,
                        booking_full_json: resultFilter?.flat(),
                    };
                } else {
                    return item
                }
            } else if (selectedType == 'summary') {
                const checkMatch = item?.booking_full_json_release?.every((a: any) => resultFilter?.some((b: any) => b?.id === a?.id));
                if (checkMatch == true) {
                    return {
                        ...item,
                        booking_full_json_release: resultFilter?.flat(),
                    };
                } else {
                    return item
                }
            }
        })

        setdataTable(data)
        settk((pre) => !pre)
        setTimeout(() => {
            setdataTable((prev: any) => ({
                ...prev,
                booking_version: findItemTable
            }));
        }, 0);
    }

    const setLogOption = (path: any, mode: 'entry' | 'exit', value: any, type: 'original' | 'summary') => {
        let logOption: any = logSearch[type]?.[mode];

        logOption[path] = value || "";

        if (mode == 'entry') {
            setlogSearch((pre: any) => ({
                ...pre,
                [type]: {
                    entry: logOption,
                    exit: pre[type]?.exit
                }
            }))
        } else if (mode == 'exit') {
            setlogSearch((pre: any) => ({
                ...pre,
                [type]: {
                    exit: logOption,
                    entry: pre[type]?.entry,
                }
            }))
        }
    }

    const handleExportByVersion = async (version: any,) => {
        try {
            const res_edit = await downloadService(`/master/capacity/capacity-request-management-download/${version?.id}`, '', `${data?.contract_code || ''}_${version?.version || ''}.xlsx`);
        } catch (error) {

        }
    };

    //============================================================================================================

    const [mdCommentOpen, setMdCommentOpen] = useState<any>(false);
    const [bookingVersionComment, setBookingVersionComment] = useState<any>([]);

    const handleCommentModal = (data?: any) => {
        setBookingVersionComment(data)
        setMdCommentOpen(true);
    };

    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));

    let masterColumnsDynamicEntry = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        // {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */ }
        // { key: 'pressure_range', label: 'Pressure Range', visible: true },
        // { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        // { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        // { key: 'temperature_range', label: 'Temperature Range', visible: true },
        // { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        // { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/d)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/h)', visible: true },
        { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMscfd)', visible: true },
        { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMscfh)', visible: true },
    ];

    let masterColumnsDynamicExit = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        // {/* Template Booking และในหน้า UI ไม่อยากให้มี Pressure กับ Temp ไม่อยากให้ Shipper ใส่ค่าได้ https://app.clickup.com/t/86evh203h */ }
        // { key: 'pressure_range', label: 'Pressure Range', visible: true },
        // { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        // { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        // { key: 'temperature_range', label: 'Temperature Range', visible: true },
        // { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        // { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/d)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/h)', visible: true },
    ]

    const [initialColumnsDynamicEntry, setinitialColumnsDynamicEntry] = useState(masterColumnsDynamicEntry);

    const [initialColumnsDynamicExit, setinitialColumnsDynamicExit] = useState(masterColumnsDynamicExit);

    const [columnVisibilityEntry, setColumnVisibilityEntry] = useState(generateColumnVisibility(initialColumnsDynamicEntry));
    const [columnVisibilityExit, setColumnVisibilityExit] = useState(generateColumnVisibility(initialColumnsDynamicExit));

    const handleColumnToggleEntry = (columnKey: string) => {
        let dataFilter: any = initialColumnsDynamicEntry;
        let filterCheckedparent: any = dataFilter?.filter((f: any) => f?.parent_id == columnKey);
        let checkAboutParant: any = dataFilter?.find((f: any) => f?.key == columnKey);
        if (filterCheckedparent?.length > 0) {
            for (let index = 0; index < filterCheckedparent?.length; index++) {
                let findIDX: any = dataFilter?.find((fx: any) => fx?.key == filterCheckedparent[index]?.key);
                if (findIDX) {
                    setColumnVisibilityEntry((prev: any) => ({
                        ...prev,
                        [findIDX?.key]: !prev[columnKey]
                    }));
                }
            }
        }

        if (checkAboutParant?.parent_id) {
            let getParent: any = checkAboutParant?.parent_id;
            let findAboutParent: any = columnVisibilityEntry[getParent];
            let findAboutThis: any = columnVisibilityEntry[columnKey];
            let filterAboutParent: any = dataFilter?.filter((f: any) => f?.parent_id == getParent);
            if (findAboutParent == true) {
                let checkedParentFalse: any = 0;
                for (let index = 0; index < filterAboutParent?.length; index++) {
                    let checkedItem: any = columnVisibilityEntry[filterAboutParent[index]?.key];
                    if (filterAboutParent[index]?.key == columnKey) {
                        checkedParentFalse = findAboutThis == true ? checkedParentFalse + 1 : checkedParentFalse;
                    } else {
                        checkedParentFalse = checkedItem == false ? checkedParentFalse + 1 : checkedParentFalse;
                    }
                }

                if (checkedParentFalse == filterAboutParent?.length) {
                    setColumnVisibilityEntry((prev: any) => ({
                        ...prev,
                        [getParent]: !prev[getParent]
                    }));
                }
            } else if (findAboutParent == false && findAboutThis == false) {
                setColumnVisibilityEntry((prev: any) => ({
                    ...prev,
                    [getParent]: !prev[getParent]
                }));
            }
        }

        setColumnVisibilityEntry((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
        settk(!tk);
    };

    const handleColumnToggleExit = (columnKey: string) => {
        let dataFilter: any = initialColumnsDynamicExit;
        let filterCheckedparent: any = dataFilter?.filter((f: any) => f?.parent_id == columnKey);
        let checkAboutParant: any = dataFilter?.find((f: any) => f?.key == columnKey);
        if (filterCheckedparent?.length > 0) {
            for (let index = 0; index < filterCheckedparent?.length; index++) {
                let findIDX: any = dataFilter?.find((fx: any) => fx?.key == filterCheckedparent[index]?.key);
                if (findIDX) {
                    setColumnVisibilityExit((prev: any) => ({
                        ...prev,
                        [findIDX?.key]: !prev[columnKey]
                    }));
                }
            }
        }

        if (checkAboutParant?.parent_id) {
            let getParent: any = checkAboutParant?.parent_id;
            let findAboutParent: any = columnVisibilityExit[getParent];
            let findAboutThis: any = columnVisibilityExit[columnKey];
            let filterAboutParent: any = dataFilter?.filter((f: any) => f?.parent_id == getParent);
            if (findAboutParent == true) {
                let checkedParentFalse: any = 0;
                for (let index = 0; index < filterAboutParent?.length; index++) {
                    let checkedItem: any = columnVisibilityExit[filterAboutParent[index]?.key];
                    if (filterAboutParent[index]?.key == columnKey) {
                        checkedParentFalse = findAboutThis == true ? checkedParentFalse + 1 : checkedParentFalse;
                    } else {
                        checkedParentFalse = checkedItem == false ? checkedParentFalse + 1 : checkedParentFalse;
                    }
                }

                if (checkedParentFalse == filterAboutParent?.length) {
                    setColumnVisibilityExit((prev: any) => ({
                        ...prev,
                        [getParent]: !prev[getParent]
                    }));
                }
            } else if (findAboutParent == false && findAboutThis == false) {
                setColumnVisibilityExit((prev: any) => ({
                    ...prev,
                    [getParent]: !prev[getParent]
                }));
            }
        }

        setColumnVisibilityExit((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
        settk(!tk);
    };

    const [trickerColumn, settrickerColumn] = useState<any>(false);

    //#region COMMENT
    const [commentLog, setCommentLog] = useState<any>([]);
    const [dataFile, setDataFile] = useState<any>([]);
    const [modalMsg, setModalMsg] = useState<any>("");

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [mdFileView, setMdFileView] = useState<any>(false);

    return (
        <div>
            <div
                className="text-[#464255] px-4 font-bold cursor-pointer pb-4"
                onClick={handleGetback}
            >
                <ArrowBackIos style={{ fontSize: "14px" }} />{` Back`}
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 mb-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <section className="relative z-10 pr-4 flex flex-col sm:flex-row w-full gap-4">
                        {/* Contract Code */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Code`}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{data?.contract_code || ''}</p>
                        </div>

                        {/* Shipper Name */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Shipper Name`}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{data?.group?.name || ''}</p>
                        </div>

                        {/* Contract Type */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Type`}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{data?.term_type?.name || ''}</p>
                        </div>
                    </section>
                </aside>
            </div>

            <div className="flex flex-wrap gap-2 pb-2 justify-end pt-2 w-full sm:w-auto">
                <SearchInput onSearch={handleSearch} />
            </div>

            {dataTable && dataTable?.booking_version?.map((item: any, index: number) => {
                return (
                    <div className="pb-2" key={index}>
                        <div
                            className={`w-full h-[64px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 ${index === 0 ? 'bg-[#9EE4FF]' : 'bg-[#F3F4F7]'}`}
                            onClick={() => handleExpand(item?.id)}
                        >
                            <div className="flex items-center p-2 gap-5">
                                <span className="text-[#58585A] font-[700] text-[16px] uppercase">{item?.version}</span>

                                {/* Vertical Divider */}
                                <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                <div className="flex flex-col">
                                    <p className="!text-[12px] font-semibold text-[#58585A]">{`Submitted Timestamp`}</p>
                                    <p className="!text-[14px] font-light text-[#58585A]">{item?.submitted_timestamp ? formatDate(item?.submitted_timestamp) : ''}</p>
                                </div>

                                {/* Vertical Divider */}
                                <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                <div className="flex flex-col">
                                    <p className="!text-[12px] font-semibold text-[#58585A]">{`Contract Start Date`}</p>
                                    <p className="!text-[14px] font-light text-[#58585A]">{item?.contract_start_date ? formatDateNoTime(item?.contract_start_date) : ''}</p>
                                </div>

                                {/* Vertical Divider */}
                                <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                <div className="flex flex-col">
                                    <p className="!text-[12px] font-semibold text-[#58585A]">{`Contract End Date`}</p>
                                    <p className="!text-[14px] font-light text-[#58585A]">{item?.contract_end_date ? formatDateNoTime(item?.contract_end_date) : ''}</p>
                                </div>

                                {/* Vertical Divider */}
                                <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                <span className="text-[#58585A] font-light text-[16px] whitespace-nowrap">
                                    {
                                        <div className="flex w-[120px] justify-center rounded-full p-1 text-[#464255] whitespace-nowrap" style={{ backgroundColor: String(item?.type_account?.color) }}>{item?.type_account?.name}</div>
                                    }
                                </span>

                                {/* Vertical Divider */}
                                <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                <span className="text-[#58585A] font-light text-[16px]">
                                    {
                                        <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.status_capacity_request_management?.color) }}>{item?.status_capacity_request_management?.name}</div>
                                    }
                                </span>
                            </div>

                            {/* Expand Icon on the right side */}
                            <div className="flex items-center pr-2">
                                {expandedRow === item?.id ? (
                                    <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                ) : (
                                    <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                )}
                            </div>
                        </div>

                        {expandedRow === item?.id && (
                            <div className="flex mt-2 bg-[#ffffff] h-auto border border-[#DFE4EA] rounded-[8px] p-4 shadow-sm gap-2 flex-col">

                                <div className="flex justify-between items-center w-full">

                                    <div className="flex justify-start items-center w-full">
                                        <div className="flex items-center">
                                            <CustomTooltip
                                                title={
                                                    <div>
                                                        <p className="text-[#464255]">
                                                            <span className="font-semibold">Original : </span>ค่า Capacity Right และรายละเอียดตาม Capacity Right ที่เอาเข้ามาจาก Bulletin หรือ TPA Website
                                                        </p>
                                                        <p className="text-[#464255]">
                                                            <span className="font-semibold">Summary Capacity Right : </span>ค่า Capacity Right ที่ถูกปรับค่ามาจากเมนู Release/UIOLI Summary Management (ยอดจาก Column Confirm Capacity) และค่าจากนี้ จะส่งไปที่เมนู Tariff และเมนูอื่นๆ ที่ต้องใช้ค่า Capacity Right
                                                        </p>
                                                    </div>
                                                }
                                                placement="top-end"
                                                arrow
                                            >
                                                <div className="w-[30px] h-[30px] flex items-center justify-center border border-[#B6B6B6] rounded-lg">
                                                    <InfoOutlinedIcon sx={{ fontSize: 22 }} />
                                                </div>
                                            </CustomTooltip>
                                        </div>

                                        <div className="flex items-center justify-center gap-2 py-2">
                                            <div>
                                                <label
                                                    onClick={() => handleButtonType('original')}
                                                    className={`w-[220px] ml-2 !h-[46px] ${selectedType === 'original' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} ${buttonClass}`}
                                                >
                                                    {`Original Capacity Right`}
                                                </label>
                                            </div>

                                            <div>
                                                <label
                                                    onClick={() => handleButtonType('summary')}
                                                    className={`w-[220px] ml-2 !h-[46px] ${selectedType === 'summary' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} ${buttonClass}`}
                                                >
                                                    {`Summary Capacity Right`}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <BtnGeneral
                                            textRender={"Comment"}
                                            iconNoRender={true}
                                            bgcolor={"#00ADEF"}
                                            // ที่ปิดไปเพราะข้อนี้ (อ่านคอมเม้น) R : v1.0.90 ที่ Tab Summary ไม่มีปุ่ม Comment และ Export https://app.clickup.com/t/86ervrxh4
                                            // disable={
                                            //     (dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) && true
                                            // }
                                            disable={false}
                                            generalFunc={() => handleCommentModal(item)}
                                            can_create={permission ? permission?.f_view : false}
                                        />
                                    </div>
                                </div>

                                {/* FILTER  */}
                                {(selectedType === 'original' || selectedType === 'summary') &&
                                    <div className="flex pb-2" id='filter-bar'>
                                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                                            <DatePickaSearch
                                                key={"start" + key}
                                                label="Start Date From"
                                                placeHolder="Select Start Date To"
                                                allowClear
                                                // max={srchEndDate}
                                                max={item?.contract_end_date} // R :v1.0.90 filter ใน contract detail ยังทำงานไม่ถูกต้อง https://app.clickup.com/t/86err0d6c
                                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                            />

                                            <DatePickaSearch
                                                key={"end" + key}
                                                label="End Date To"
                                                placeHolder="Select End Date To"
                                                allowClear
                                                // min={srchStartDate}
                                                min={item?.contract_start_date} // R :v1.0.90 filter ใน contract detail ยังทำงานไม่ถูกต้อง https://app.clickup.com/t/86err0d6c
                                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                            />

                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'all')} />
                                            <BtnReset handleReset={() => handleSearchItem(item, 'all', 'reset', 'filterDate')} />

                                            <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                                                {/* <BtnGeneral
                                                    textRender={"Comment"}
                                                    iconNoRender={true}
                                                    bgcolor={"#00ADEF"}
                                                    disable={
                                                        (data?.status_capacity_request_management?.id === 5 || data?.status_capacity_request_management?.id === 3) && true
                                                    }
                                                    generalFunc={() => handleCommentModal(item)}
                                                    can_create={permission ? permission?.f_view : false}
                                                /> */}
                                                <BtnGeneral
                                                    bgcolor={"#24AB6A"}
                                                    modeIcon={'export'}
                                                    textRender={"Export"}
                                                    generalFunc={() => handleExportByVersion(item)}
                                                    can_export={permission ? permission?.f_export : false}
                                                />
                                            </div>
                                        </aside>
                                    </div>
                                }

                                <div className='relative w-full'>
                                    <Spinloading spin={isLoading} rounded={10} /> {/* loading example here */}
                                    {selectedType === 'original' && (
                                        <div key={`contract-detail-${item?.id}`}>
                                            {/* ENTRY แถบเขียว ๆ */}
                                            <div
                                                className={`w-full h-[58px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#C8FFD7] `}
                                                onClick={() => handleExpandEntryExit(item?.id, "entry" + item?.id, 'entry', selectedType)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Entry</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "entry" + item?.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {expandedEntryExit === "entry" + item?.id && (
                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                    <div className="p-2">
                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                            <div onClick={handleTogglePopoverEntry}>
                                                                <TuneIcon
                                                                    className="cursor-pointer rounded-lg"
                                                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className='flex gap-2 mt-5'>
                                                            <InputSearch
                                                                id="searchZone"
                                                                label="Zone"
                                                                type="select"
                                                                value={srchZone}
                                                                onChange={(e) => {
                                                                    setSrchZone(e.target.value);
                                                                    setSrchArea(null)
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionZone?.map((item: any) => ({
                                                                    value: item?.name,
                                                                    label: item?.name
                                                                }))}
                                                            />

                                                            <InputSearch
                                                                id="searchArea"
                                                                label="Area"
                                                                type="select"
                                                                value={srchArea}
                                                                onChange={(e) => {
                                                                    setSrchArea(e.target.value);
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionArea
                                                                    ?.filter((item: any) => srchZone ? item?.zone?.name === srchZone : true)
                                                                    .map((item: any) => ({
                                                                        value: item?.name,
                                                                        label: item?.name,
                                                                    }))
                                                                }
                                                            />

                                                            <InputSearch
                                                                id="searchContractPoint"
                                                                label="Contract Point"
                                                                type="select"
                                                                value={srchContractCode}
                                                                onChange={(e) => setSrchContractCode(e.target.value)}
                                                                options={optionContractPoint?.filter((item: any) => srchArea ? item?.area?.name === srchArea : item)
                                                                    .map((item: any) => ({
                                                                        value: item?.contract_point,
                                                                        label: item?.contract_point,
                                                                    }))
                                                                }
                                                            />

                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'entry')} />
                                                            <BtnReset handleReset={() => handleSearchItem(item, 'entry', 'reset', 'filterSub')} />
                                                        </div>
                                                    </div>

                                                    <div className="p-2 relative w-full">
                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}

                                                        {istableLoading ?
                                                            <TableSkeleton />
                                                            :
                                                            <FatherTableModify
                                                                columnVisibility={columnVisibilityEntry}
                                                                setcolumnVisibility={setColumnVisibilityEntry}
                                                                initialColumnsDynamic={initialColumnsDynamicEntry}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicEntry}

                                                                data={item}
                                                                mode={'entry'}
                                                                originOrSum={'original'}
                                                                dataContract={dataContract}
                                                                srchStartdate={logPeriod?.from}
                                                                srchEnddate={logPeriod?.to}
                                                                trickerColumn={trickerColumn}
                                                                settrickerColumn={settrickerColumn}
                                                                masterColumnsDynamicEntry={masterColumnsDynamicEntry}
                                                                masterColumnsDynamicExit={masterColumnsDynamicExit}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            {/* EXIT แถบเหลือง ๆ */}
                                            <div
                                                className={`w-full h-[58px] mt-2 border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#FFF3C8] `}
                                                onClick={() => handleExpandEntryExit(item?.id, "exit" + item.id, 'exit', selectedType)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Exit</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "exit" + item.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {expandedEntryExit === "exit" + item?.id && (
                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                    <div className="p-2">
                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                            <div onClick={handleTogglePopoverExit}>
                                                                <TuneIcon
                                                                    className="cursor-pointer rounded-lg"
                                                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className='flex gap-2 mt-5'>
                                                            <InputSearch
                                                                id="searchZone"
                                                                label="Zone"
                                                                type="select"
                                                                value={srchZone}
                                                                onChange={(e) => {
                                                                    setSrchZone(e.target.value);
                                                                    setSrchArea(null)
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionZone?.map((item: any) => ({
                                                                    value: item?.name,
                                                                    label: item?.name
                                                                }))}
                                                            />

                                                            <InputSearch
                                                                id="searchArea"
                                                                label="Area"
                                                                type="select"
                                                                value={srchArea}
                                                                onChange={(e) => {
                                                                    setSrchArea(e.target.value);
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionArea?.filter((item: any) => srchZone ? item?.zone?.name === srchZone : true)
                                                                    .map((item: any) => ({
                                                                        value: item?.name,
                                                                        label: item?.name,
                                                                    }))
                                                                }
                                                            />

                                                            <InputSearch
                                                                id="searchContractPoint"
                                                                label="Contract Point"
                                                                type="select"
                                                                value={srchContractCode}
                                                                onChange={(e) => setSrchContractCode(e.target.value)}
                                                                options={optionContractPoint?.filter((item: any) => srchArea ? item?.area?.name === srchArea : true)
                                                                    .map((item: any) => ({
                                                                        value: item?.contract_point,
                                                                        label: item?.contract_point,
                                                                    }))
                                                                }
                                                            />

                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'exit')} />
                                                            <BtnReset handleReset={() => handleSearchItem(item, 'exit', 'reset', 'filterSub')} />
                                                        </div>
                                                    </div>

                                                    <div className="p-2 relative w-full">
                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}
                                                        {istableLoading ?
                                                            <TableSkeleton />
                                                            :
                                                            <FatherTableModify
                                                                columnVisibility={columnVisibilityExit}
                                                                setcolumnVisibility={setColumnVisibilityExit}
                                                                initialColumnsDynamic={initialColumnsDynamicExit}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicExit}

                                                                data={item}
                                                                mode={'exit'}
                                                                originOrSum={'original'}
                                                                dataContract={dataContract}
                                                                srchStartdate={logPeriod?.from}
                                                                srchEnddate={logPeriod?.to}
                                                                trickerColumn={trickerColumn}
                                                                settrickerColumn={settrickerColumn}
                                                                masterColumnsDynamicEntry={masterColumnsDynamicEntry}
                                                                masterColumnsDynamicExit={masterColumnsDynamicExit}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {selectedType === 'summary' && (
                                        <div key={`contract-detail-${item?.id}`}>
                                            {/* ENTRY แถบเขียว ๆ */}
                                            <div
                                                className={`w-full h-[58px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#C8FFD7] `}
                                                onClick={() => handleExpandEntryExit(item?.id, "entry" + item?.id, 'entry', selectedType)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Entry</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "entry" + item?.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {expandedEntryExit === "entry" + item?.id && (
                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                    <div className="p-2">
                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                            <div onClick={handleTogglePopoverEntry}>
                                                                <TuneIcon
                                                                    className="cursor-pointer rounded-lg"
                                                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className='flex gap-2 mt-5'>
                                                            <InputSearch
                                                                id="searchZone"
                                                                label="Zone"
                                                                type="select"
                                                                value={srchZone}
                                                                onChange={(e) => {
                                                                    setSrchZone(e.target.value);
                                                                    setSrchArea(null)
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionZone?.map((item: any) => ({
                                                                    value: item?.name,
                                                                    label: item?.name
                                                                }))}
                                                            />

                                                            <InputSearch
                                                                id="searchArea"
                                                                label="Area"
                                                                type="select"
                                                                value={srchArea}
                                                                onChange={(e) => {
                                                                    setSrchArea(e.target.value);
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionArea
                                                                    ?.filter((item: any) => srchZone ? item?.zone?.name === srchZone : true)
                                                                    .map((item: any) => ({
                                                                        value: item?.name,
                                                                        label: item?.name,
                                                                    }))
                                                                }
                                                            />

                                                            <InputSearch
                                                                id="searchContractPoint"
                                                                label="Contract Point"
                                                                type="select"
                                                                value={srchContractCode}
                                                                onChange={(e) => setSrchContractCode(e.target.value)}
                                                                options={optionContractPoint?.filter((item: any) => srchArea ? item?.area?.name === srchArea : item)
                                                                    .map((item: any) => ({
                                                                        value: item?.contract_point,
                                                                        label: item?.contract_point,
                                                                    }))
                                                                }
                                                            />

                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'entry')} />
                                                            <BtnReset handleReset={() => handleSearchItem(item, 'entry', 'reset', 'filterSub')} />
                                                        </div>
                                                    </div>

                                                    <div className="p-2 relative w-full">
                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}

                                                        {istableLoading ?
                                                            <TableSkeleton />
                                                            :
                                                            <FatherTableModify
                                                                columnVisibility={columnVisibilityEntry}
                                                                setcolumnVisibility={setColumnVisibilityEntry}
                                                                initialColumnsDynamic={initialColumnsDynamicEntry}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicEntry}

                                                                data={item}
                                                                mode={'entry'}
                                                                originOrSum={'summary'}
                                                                dataContract={dataContract}
                                                                srchStartdate={logPeriod?.from}
                                                                srchEnddate={logPeriod?.to}
                                                                trickerColumn={trickerColumn}
                                                                settrickerColumn={settrickerColumn}
                                                                masterColumnsDynamicEntry={masterColumnsDynamicEntry}
                                                                masterColumnsDynamicExit={masterColumnsDynamicExit}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            {/* EXIT แถบเหลือง ๆ */}
                                            <div
                                                className={`w-full h-[58px] mt-2 border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#FFF3C8] `}
                                                onClick={() => handleExpandEntryExit(item?.id, "exit" + item.id, 'exit', selectedType)}
                                            >
                                                <div className="flex items-center p-2 gap-5">
                                                    <span className="text-[#58585A] font-semibold">Exit</span>
                                                </div>

                                                {/* Expand Icon on the right side */}
                                                <div className="flex items-center pr-2">
                                                    {expandedEntryExit === "exit" + item.id ? (
                                                        <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                    ) : (
                                                        <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                    )}
                                                </div>
                                            </div>

                                            {expandedEntryExit === "exit" + item?.id && (
                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                    <div className="p-2">
                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                            <div onClick={handleTogglePopoverExit}>
                                                                <TuneIcon
                                                                    className="cursor-pointer rounded-lg"
                                                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className='flex gap-2 mt-5'>
                                                            <InputSearch
                                                                id="searchZone"
                                                                label="Zone"
                                                                type="select"
                                                                value={srchZone}
                                                                onChange={(e) => {
                                                                    setSrchZone(e.target.value);
                                                                    setSrchArea(null)
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionZone?.map((item: any) => ({
                                                                    value: item?.name,
                                                                    label: item?.name
                                                                }))}
                                                            />

                                                            <InputSearch
                                                                id="searchArea"
                                                                label="Area"
                                                                type="select"
                                                                value={srchArea}
                                                                onChange={(e) => {
                                                                    setSrchArea(e.target.value);
                                                                    setSrchContractCode(null)
                                                                }}
                                                                options={optionArea?.filter((item: any) => srchZone ? item?.zone?.name === srchZone : true)
                                                                    .map((item: any) => ({
                                                                        value: item?.name,
                                                                        label: item?.name,
                                                                    }))
                                                                }
                                                            />

                                                            <InputSearch
                                                                id="searchContractPoint"
                                                                label="Contract Point"
                                                                type="select"
                                                                value={srchContractCode}
                                                                onChange={(e) => setSrchContractCode(e.target.value)}
                                                                options={optionContractPoint?.filter((item: any) => srchArea ? item?.area?.name === srchArea : true)
                                                                    .map((item: any) => ({
                                                                        value: item?.contract_point,
                                                                        label: item?.contract_point,
                                                                    }))
                                                                }
                                                            />

                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'exit')} />
                                                            <BtnReset handleReset={() => handleSearchItem(item, 'exit', 'reset', 'filterSub')} />
                                                        </div>
                                                    </div>

                                                    <div className="p-2 relative w-full">
                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}
                                                        {istableLoading ?
                                                            <TableSkeleton />
                                                            :
                                                            <FatherTableModify
                                                                columnVisibility={columnVisibilityExit}
                                                                setcolumnVisibility={setColumnVisibilityExit}
                                                                initialColumnsDynamic={initialColumnsDynamicExit}
                                                                setinitialColumnsDynamic={setinitialColumnsDynamicExit}

                                                                data={item}
                                                                mode={'exit'}
                                                                originOrSum={'summary'}
                                                                dataContract={dataContract}
                                                                srchStartdate={logPeriod?.from}
                                                                srchEnddate={logPeriod?.to}
                                                                trickerColumn={trickerColumn}
                                                                settrickerColumn={settrickerColumn}
                                                                masterColumnsDynamicEntry={masterColumnsDynamicEntry}
                                                                masterColumnsDynamicExit={masterColumnsDynamicExit}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* =============================================================================== */}

                                <ModalFiles
                                    data={dataFile}
                                    setModalMsg={setModalMsg}
                                    setModalSuccessOpen={setModalSuccessOpen}
                                    setModalSuccessMsg={setModalSuccessMsg}
                                    open={mdFileView}
                                    onClose={() => {
                                        setMdFileView(false);
                                    }}
                                />

                                <ModalBkComment
                                    data={bookingVersionComment}
                                    dataLog={commentLog}
                                    // dataMain={dataFile}
                                    dataMain={dataTable}
                                    setModalMsg={setModalMsg}
                                    setModalSuccessOpen={setModalSuccessOpen}
                                    setModalSuccessMsg={setModalSuccessMsg}
                                    setCommentLog={setCommentLog}
                                    open={mdCommentOpen}
                                    onClose={() => {
                                        setMdCommentOpen(false);
                                    }}
                                />

                                {/* POPUP TUNE */}
                                <ColumnVisibilityPopoverMT
                                    open={openEntry}
                                    anchorEl={anchorElEntry}
                                    setAnchorEl={setAnchorElEntry}
                                    columnVisibility={columnVisibilityEntry}
                                    handleColumnToggle={handleColumnToggleEntry}
                                    initialColumns={initialColumnsDynamicEntry}
                                />

                                <ColumnVisibilityPopoverMT
                                    open={openExit}
                                    anchorEl={anchorElExit}
                                    setAnchorEl={setAnchorElExit}
                                    columnVisibility={columnVisibilityExit}
                                    handleColumnToggle={handleColumnToggleExit}
                                    initialColumns={initialColumnsDynamicExit}
                                />
                            </div>
                        )
                        }
                    </div >
                )
            })}
        </div >
    )
}

export default ContractDetail;