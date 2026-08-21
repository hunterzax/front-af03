import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { addDays, format, parse, subDays } from "date-fns";
import { NumericFormat } from "react-number-format";
import Spinloading from "@/components/other/spinLoading";
import dayjs from "dayjs";

type FormData = {
    name: string;
    ref: any;
    start_date: any;
    path_management_config: any;
    // start_date: Date;
    // end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "release";
    // data?: Partial<FormData>;
    data?: any;
    latestStartDate?: any;
    dataInfo?: any;
    open: boolean;
    isLoading: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    latestStartDate,
    dataInfo,
    open,
    isLoading,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
    });
     
    const [dataMaster, setDataMaster] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [disableSubmit, setDisableSubmit] = useState<boolean>(true);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    useEffect(() => {
        setDataMaster(data)
        setFilteredDataTable(data);
        // setGroupedDataX(data?.data?.length > 0 ? processData(data?.data[0]) : processData(null))
        // const { minDate, maxDate, entrySum, exitSum, grouped, originalData } = processData(datakk);
        const { minDate, maxDate, entrySum, exitSum, grouped, originalData, groupedDateRange } = data?.data?.length > 0 ? processData(data?.data[0]) : processData(null);
        setGroupedData(groupedDateRange)
    }, [data])

    const inputClass = "text-sm !font-light block md:w-full p-2 ps-5 pe-10 h-[40px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // const handleSearch = (query: string) => {
    //     const filtered = dataMaster.filter(
    //         (item: any) =>
    //             item?.name?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
    //             item?.description?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
    //             item?.area_nominal_capacity?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
    //             // item?.create_by_account?.first_name?.toString().includes(query.toLowerCase()) ||
    //             // item?.create_by_account?.last_name?.toString().includes(query.toLowerCase()) ||
    //             item?.start_date?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
    //         // item?.end_date?.toLowerCase().includes(query.toLowerCase())
    //     );
    //      
    //     setFilteredDataTable(filtered);
    // };

    // clear state when closes
    const handleClose = () => {
        onClose();
        // setEmailGroup([]);
        // setSelectedPaths({});
        // setSelectedPathsShowOnExpand([]);
        // setExpandedRow(null);
    };

    const handleFieldSearch = () => {
        // const result = dataTable.filter((item: any) => {
        //     return (
        //         // (srchType ? item?.term_type?.id == srchType : true) &&
        //         (srchGroupName ? item?.version?.toLowerCase().includes(srchGroupName.toLowerCase()) : true) &&
        //         (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
        //         (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
        //     );
        // });
        // setFilteredDataTable(result);
        const { minDate, maxDate, entrySum, exitSum, grouped, originalData, groupedDateRange } = data?.data?.length > 0 ? processData(data?.data[0]) : processData(null);
        setGroupedData(groupedDateRange)
    };

    const handleReset = () => {
        setSrchStartDate(null);
        setSrchEndDate(null);
        setKey((prevKey) => prevKey + 1);
        // setSrchGroupName('');
        // setFilteredDataTable(dataTable);
        // setKey((prevKey) => prevKey + 1);
    };

    const processData = (data: any) => {

        if (!data || typeof data !== "object") {
            return {
                minDate: null,
                maxDate: null,
                entrySum: 0,
                exitSum: 0,
                grouped: {},
                originalData: null,
            };
        }

        const allValues = { ...data.entryData.value, ...data.exitData.value };

        // Parse dates into `Date` objects
        const dates: any = Object.keys(allValues).map((date) =>
            parse(date, "dd/MM/yyyy", new Date())
        );

        // Calculate minimum and maximum dates
        const entryStartDate = parse(data.entryData.start_date, "dd/MM/yyyy", new Date()).getTime()
        const exitStartDate  = parse(data.exitData.start_date, "dd/MM/yyyy", new Date()).getTime()
        const entryEndDate  = parse(data.entryData.end_date, "dd/MM/yyyy", new Date()).getTime()
        const exitEndDate  = parse(data.exitData.end_date, "dd/MM/yyyy", new Date()).getTime()
        const minFromDates = Math.min(...dates)
        const startDateList = [entryStartDate,exitStartDate,minFromDates]
        const endDateList = [entryEndDate,exitEndDate,minFromDates]
        if(srchStartDate){
            startDateList.push(srchStartDate.getTime())
        }
        const maxStartDate = Math.max(...startDateList)
        let maxEndDate = Math.max(...endDateList)
        if(srchEndDate){
            // maxEndDate = Math.min(...[maxEndDate, srchEndDate.getTime()])
            maxEndDate = Math.min(...[maxEndDate, srchEndDate.getTime()]) - 86400000
        }
        const minDate = format(maxStartDate, "dd MMMM yyyy");
        const maxDate = format(maxEndDate, "dd MMMM yyyy");
        const startDate = parse(minDate, "dd MMMM yyyy", new Date())
        const endDate = parse(maxDate, "dd MMMM yyyy", new Date())

        // Group values by their `value` field
        const grouped: any = {};
        const groupedDateRange: any = {};
        
        // Process entry and exit data
        let entryEachMonth = Object.entries(data.entryData.value)?.filter(([date, obj]: any) => (obj.value || obj.value === 0)) || []
        let exitEachMonth = Object.entries(data.exitData.value)?.filter(([date, obj]: any) => (obj.value || obj.value === 0)) || []

        if(srchStartDate){
            const dateForFilter = parse(format(srchStartDate, "MM/yyyy"), "MM/yyyy", new Date())
  
            entryEachMonth = entryEachMonth.filter(([entryDate, entryObj]: any)  => parse(format(parse(entryDate, "dd/MM/yyyy", new Date()), "MM/yyyy"), "MM/yyyy", new Date()) >= dateForFilter)
            exitEachMonth = exitEachMonth.filter(([exitDate, entryObj]: any)  => parse(format(parse(exitDate, "dd/MM/yyyy", new Date()), "MM/yyyy"), "MM/yyyy", new Date()) >= dateForFilter)
        }
        if(srchEndDate){
            const dateForFilter = parse(format(srchEndDate, "MM/yyyy"), "MM/yyyy", new Date())

            entryEachMonth = entryEachMonth.filter(([entryDate, entryObj]: any)  => parse(format(parse(entryDate, "dd/MM/yyyy", new Date()), "MM/yyyy"), "MM/yyyy", new Date()) <= dateForFilter)
            exitEachMonth = exitEachMonth.filter(([exitDate, entryObj]: any)  => parse(format(parse(exitDate, "dd/MM/yyyy", new Date()), "MM/yyyy"), "MM/yyyy", new Date()) <= dateForFilter)
        }

        const entrySameMonth = entryEachMonth.filter(([entryDate, entryObj]: any)  => exitEachMonth.some(([exitDate, exitObj]: any) => exitDate == entryDate) == true )
        const exitSameMonth = exitEachMonth.filter(([exitDate, exitObj]: any) => entryEachMonth.some(([entryDate, entryObj]: any) => exitDate == entryDate) == true )

        exitSameMonth.map(([exitDate, exitObj]: any) => {
            const targetMapEntry = entrySameMonth?.find(([entryDate, entryObj]: any) => exitDate == entryDate)
            const targetEntryMmscfd = data.entryData.contracted_mmscfd_array?.find((entry: any) => exitDate == entry.date)
            const targetExitMmscfd = data.exitData.contracted_mmscfd_array?.find((entry: any) => exitDate == entry.date)
            const entryObj = (targetMapEntry?.[1] as any)
            const exitValue = exitObj.value;
            const entryValue = entryObj.value;
            const key = `${entryValue}_${exitValue}_${targetEntryMmscfd?.value}_${targetExitMmscfd?.value}`
            if (!grouped[key]) {
                grouped[key] = {
                    total: 0,
                    entryTotal: 0,
                    dates: [],
                    original: [],
                    entryValue: entryValue,
                    exitValue: exitValue,
                    entryValueMmscfd: targetEntryMmscfd?.value,
                    exitValueMmscfd: targetExitMmscfd?.value,
                };
            }
            grouped[key].total += parseFloat(exitValue);
            grouped[key].entryTotal += parseFloat(entryValue);
            grouped[key].dates.push(exitDate);
            grouped[key].original.push({ ...exitObj, type: "exitData", date: exitDate });
            grouped[key].original.push({ ...entryObj, type: "entryData", date: exitDate });
            grouped[key].entryExitData = [data.entryData, data.exitData];

        })
        // Calculate date ranges for each grouped value
        Object.keys(grouped).forEach((value) => {
            const parsedDates = grouped[value].dates
                .map((date: any) => parse(date, "dd/MM/yyyy", new Date()))
                .sort((a: any, b: any) => a.getTime() - b.getTime());

                const groupedDates: string[][] = [];
                let currentGroup: string[] = [];
              
                if (parsedDates.length > 0) { // Handle the case where there are dates
                    currentGroup.push(`${parsedDates[0].getDate().toString().padStart(2, '0')}/${(parsedDates[0].getMonth() + 1).toString().padStart(2, '0')}/${parsedDates[0].getFullYear()}`);
                    for (let i = 1; i < parsedDates.length; i++) {
                        const prevDate = parsedDates[i - 1];
                        const currentDate = parsedDates[i];
              
                        if (currentDate.getMonth() === prevDate.getMonth() || // Same month
                            (currentDate.getMonth() === (prevDate.getMonth() + 1) % 12 && // Consecutive month
                                currentDate.getFullYear() === prevDate.getFullYear() || // Same year
                                (currentDate.getMonth() === 0 && prevDate.getMonth() === 11 && currentDate.getFullYear() === prevDate.getFullYear() + 1))) { // Year rollover
                          currentGroup.push(`${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`);
                        } else {
                          groupedDates.push(currentGroup);
                          currentGroup = [`${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`];
                        }
                    }
                    groupedDates.push(currentGroup);
                }
            groupedDates.map((consecutiveMonths: any) => {
                const firstDate = parse(consecutiveMonths[0], "dd/MM/yyyy", new Date());
                const lastDate = parse(consecutiveMonths[consecutiveMonths.length - 1], "dd/MM/yyyy", new Date());
                const endOfMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 0,0,0,0,0); // Last day of current month
                const maxStart = firstDate > startDate ? firstDate : startDate
                const maxEnd = endOfMonth > endDate ? endDate : endOfMonth
                const displayEnd = addDays(maxEnd, (format(maxEnd, "dd MMMM yyyy") === (srchEndDate ? format(srchEndDate, "dd MMMM yyyy") : '')) ? 0 : 1)

                let dateRange = ''
                let dateRangeDisplay = ''
                if (
                    format(maxStart, "MMMM yyyy") === format(maxEnd, "MMMM yyyy")
                ) {
                    // Same month and year
                    dateRange = `${format(maxStart, "dd")} - ${format(
                        maxEnd,
                        "dd MMMM yyyy"
                    )}`;
                } else {
                    // Different month or year
                    dateRange =  `${format(maxStart, "dd MMMM yyyy")} - ${format(
                        maxEnd,
                        "dd MMMM yyyy"
                    )}`;
                }
                if (
                    format(maxStart, "MMMM yyyy") === format(displayEnd, "MMMM yyyy")
                ) {
                    // Same month and year
                    dateRangeDisplay = `${format(maxStart, "dd")} - ${format(
                        displayEnd,
                        "dd MMMM yyyy"
                    )}`;
                } else {
                    // Different month or year
                    dateRangeDisplay =  `${format(maxStart, "dd MMMM yyyy")} - ${format(
                        displayEnd,
                        "dd MMMM yyyy"
                    )}`;
                }
                groupedDateRange[`${value}_${dateRange}`] = {...grouped[value], dateRange, dateRangeDisplay}
            })


            // delete grouped[value].dates;
        });

        // Calculate total sums for entry and exit values
        const entrySum = Object.values(data.entryData.value).reduce(
            (acc: number, { value }: any) => acc + parseFloat(value),
            0
        );
        const exitSum = Object.values(data.exitData.value).reduce(
            (acc: number, { value }: any) => acc + parseFloat(value),
            0
        );

        return {
            minDate,
            maxDate,
            entrySum,
            exitSum,
            grouped, // Contains grouped data with original references
            originalData: data, // Keep original `datakk` data
            groupedDateRange
        };
    };

    const [groupedData, setGroupedData] = useState<any>();
    // const [groupedDataX, setGroupedDataX] = useState<any>({
    //     minDate: null,
    //     maxDate: null,
    //     entrySum: 0,
    //     exitSum: 0,
    //     grouped: {},
    //     originalData: null,
    // });

    const updateGroupValue = (key: string, newValue: number, isMmscfd: boolean = false) => {
        if(isMmscfd == true){
            setGroupedData((prev: any) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    releaseValueMmscfd: newValue, // Add or update the release value for this group
                },
            }));
        }
        else{
            setGroupedData((prev: any) => ({
                ...prev,
                [key]: {
                    ...prev[key],
                    releaseValue: newValue, // Add or update the release value for this group
                },
            }));
        }
    };

    useEffect(() => {
        if(groupedData){
            const atLeastOneRelease = Object.entries(groupedData).find(([value, group]: any) => group.releaseValue)
            if(atLeastOneRelease){
                setDisableSubmit(false)
            }
            else{
                setDisableSubmit(true)
            }
        }
        else{
            setDisableSubmit(true)
        }
    }, [groupedData])

    useEffect(() => {
        if(key){
            const { minDate, maxDate, entrySum, exitSum, grouped, originalData, groupedDateRange } = data?.data?.length > 0 ? processData(data?.data[0]) : processData(null);
            setGroupedData(groupedDateRange)
        }
    }, [key])
    

    return (
        <Dialog
            open={open}
            // onClose={onClose} 
            onClose={handleClose}
            className="relative z-20"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <Spinloading spin={isLoading} rounded={20}/>
                        <div className="flex flex-col items-center justify-center gap-2 rounded-md ">

                            <div className="flex flex-col gap-2 p-9 w-full bg-white rounded-[20px]">

                                <h2 className="text-xl  font-bold  text-[#00ADEF] mb-4 pb-5">{mode == "release" ? `Release UIOLI` : mode == "edit" ? "Edit Version " + dataInfo?.version : "View Version " + dataInfo?.version}</h2>

                                <div className="mb-2 w-[100%]">
                                    <div className="grid grid-cols-6 text-sm font-semibold text-[#58585A]">
                                        <p>{`Shipper`}</p>
                                        <p>{`Contract Code`}</p>
                                        <p>{`Entry Point`}</p>
                                        <p>{`Exit Point`}</p>
                                    </div>

                                    <div className="grid grid-cols-6 text-sm font-light text-[#58585A]">
                                        <p>{data?.group ? data?.group?.name : '-'}</p>
                                        <p>{data?.contract_code ? data?.contract_code : '-'}</p>
                                        <p>{data?.data ? data?.data[0]?.entryData?.area_text : '-'}</p>
                                        <p>{data?.data ? data?.data[0]?.exitData?.area_text : '-'}</p>
                                    </div>

                                    <div className="flex flex-col items-start mt-10">
                                        <div>
                                            <div className="pb-2 rounded-xl flex flex-col sm:flex-row sm:gap-2 gap-4 items-start">
                                                <DatePickaSearch
                                                    key={"start" + key}
                                                    label="Start Date"
                                                    placeHolder="Select Start Date"
                                                    allowClear
                                                    onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                />

                                                <DatePickaSearch
                                                    key={"end" + key}
                                                    label="End Date"
                                                    placeHolder="Select End Date"
                                                    allowClear
                                                    onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                                />

                                                <BtnSearch handleFieldSearch={handleFieldSearch} />
                                                <BtnReset handleReset={handleReset} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <form
                                    // onSubmit={handleSubmit((data) => { // clear state when submit
                                    //     // setEmailGroup([]);
                                    //     // setSelectedPaths({});
                                    //     // setSelectedPathsShowOnExpand([]);
                                    //     // setExpandedRow(null);
                                    //     onSubmit(groupedData, dataMaster);
                                    // })}
                                    className="bg-white p-2 rounded-[20px] max-w !w-[1200px]"
                                >

                                    {/* Horizon Divider */}
                                    <div className="my-1 col-span-2">
                                        <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {/* <div>
                                            <div className="pb-2 rounded-xl flex flex-col sm:flex-row gap-2">

                                                <DatePickaSearch
                                                    key={"start"}
                                                    label="Start Date"
                                                    placeHolder="Select Start Date"
                                                    allowClear
                                                    // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                    onChange={(e: any) => { 
                                                    }}
                                                />

                                                <DatePickaSearch
                                                    key={"end"}
                                                    label="End Date"
                                                    placeHolder="Select End Date"
                                                    allowClear
                                                    // onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                    onChange={(e: any) => { 
                                                    }}
                                                />

                                                <BtnSearch handleFieldSearch={handleFieldSearch} />
                                                <BtnReset handleReset={handleReset} />
                                            </div>
                                        </div> */}

                                        {/* Horizon Divider */}
                                        {/* <div className="my-2 col-span-2">
                                            <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
                                        </div> */}

                                        {/* <div className="relative h-auto overflow-auto block rounded-t-md">
                                        </div> */}

                                        {/* <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A] gap-2">
                                            <p className="mt-2">{`${minDate} - ${maxDate}`}</p>

                                            <NumericFormat
                                                id="entry"
                                                value={entrySum}
                                                placeholder="0.000"
                                                readOnly={true}
                                                className={`${inputClass} !bg-[#EFECEC] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            />

                                            <NumericFormat
                                                id="exit"
                                                value={exitSum}
                                                placeholder="0.000"
                                                readOnly={true}
                                                className={`${inputClass} !bg-[#EFECEC] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            />

                                            <NumericFormat
                                                id="exit"
                                                value=""
                                                placeholder="0.000"
                                                max={exitSum}
                                                min={0}
                                                readOnly={false}
                                                className={`${inputClass} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            />
                                        </div> */}
                                    </div>

                                    <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A] gap-2">
                                        <p className="mt-2">{``}</p>
                                        <p className="mt-2">{`Entry - Capacity Right (MMBTU/D)`}</p>
                                        <p className="mt-2">{`Exit - Capacity Right (MMBTU/D)`}</p>
                                        <p className="mt-2">{`Release (MMBTU/D)`}</p>
                                    </div>

                                    {groupedData !== undefined && Object.entries(groupedData).map(([value, group]: any) => {
                                        return (
                                        <div key={value} className="grid grid-cols-4 text-sm font-medium text-[#58585A] gap-2 mt-4">
                                            {/* 1st Column: Group Date Range */}
                                            <p className="mt-2 font-semibold">{group.dateRangeDisplay}</p>

                                            {/* 2nd Column: Total Value for the Group */}
                                            <NumericFormat
                                                id={`group-entry-${value}`}
                                                // value={group.total}
                                                value={group.entryValue}
                                                readOnly={true}
                                                className={`${inputClass} !bg-[#EFECEC] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            />

                                            {/* 3rd Column: Empty or Custom Placeholder */}
                                            <NumericFormat
                                                id={`group-exit-${value}`}
                                                value={group.exitValue}
                                                placeholder="0.000"
                                                readOnly={true}
                                                className={`${inputClass} !bg-[#EFECEC] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            />

                                            {/* 4th Column: Editable Input */}
                                            <NumericFormat
                                                id={`group-release-${value}`}
                                                value={group.releaseValue || ""}
                                                placeholder="0.000"
                                                readOnly={false}
                                                className={`${inputClass} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { floatValue } = values;
                                                    if (floatValue === undefined || (floatValue <= group.exitValue && floatValue <= group.entryValue)) {
                                                        updateGroupValue(value, floatValue || 0);
                                                    }
                                                }}
                                                isAllowed={(values) => {
                                                    const { floatValue } = values;
                                                    return floatValue === undefined || (floatValue < group.exitValue && floatValue < group.entryValue);
                                                }}
                                            />

                                            {/* 1st mmscf Column: Group Date Range */}
                                            {/* <p className="mt-2 font-semibold">{}</p> */}

                                            {/* 2nd mmscf Column: Total Value for the Group */}
                                            {/* <NumericFormat
                                                id={`group-entry-${value}`}
                                                // value={group.total}
                                                value={group.entryValueMmscfd}
                                                readOnly={true}
                                                className={`${inputClass} !bg-[#EFECEC] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            /> */}

                                            {/* 3rd mmscf Column: Empty or Custom Placeholder */}
                                            {/* <NumericFormat
                                                id={`group-exit-${value}`}
                                                value={group.exitValueMmscfd}
                                                placeholder="0.000"
                                                readOnly={true}
                                                className={`${inputClass} !bg-[#EFECEC] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                            /> */}

                                            {/* 4th mmscf Column: Editable Input */}
                                            {/* <NumericFormat
                                                id={`group-release-${value}`}
                                                value={group.releaseValueMmscfd || ""}
                                                placeholder="0.000"
                                                readOnly={false}
                                                className={`${inputClass} text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                                onValueChange={(values) => {
                                                    const { floatValue } = values;
                                                    if (floatValue === undefined || floatValue <= group.entryValueMmscfd) {
                                                        updateGroupValue(value, floatValue || 0, true);
                                                    }
                                                }}
                                                isAllowed={(values) => {
                                                    const { floatValue } = values;
                                                    return floatValue === undefined || floatValue < group.entryValueMmscfd;
                                                }}
                                            /> */}
                                        </div>
                                    )}
                                    )}

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="button"
                                            // onClick={onClose}
                                            onClick={handleClose}
                                            className="w-[167px] font-light bg-slate-100 !text-[#464255] py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                        >
                                            {`Cancel`}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                onSubmit(groupedData, dataMaster);
                                            }}
                                            disabled={disableSubmit}
                                            className={`w-[167px] font-semibold text-white py-2 rounded-lg focus:outline-none ${disableSubmit ? "bg-[#9CA3AF]" : "bg-[#00ADEF] hover:bg-blue-600  focus:bg-blue-600"}`}
                                        >
                                            {mode === "create" ? "Add" : "Submit"}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div >
            </div >
        </Dialog >
    );
};

export default ModalAction;
