"use client";
// import { useTranslation } from "@/app/i18n/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { Tune } from "@mui/icons-material"
import { InputSearch } from "@/components/other/SearchForm";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import ModalComponent from "@/components/other/ResponseModal";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { filterByGasDayRange, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatStringToDDMMYYYY, formatTime, generateUserPermission, toDayjs } from "@/utils/generalFormatter";
import TableMtrRetrieve from "./form/table";
import { Tab, Tabs } from "@mui/material";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { decryptData } from "@/utils/encryptionData";
import PaginationComponent from "@/components/other/globalPagination";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import dayjs from "dayjs";
import getUserValue from "@/utils/getuserValue";
import BtnGeneral from "@/components/other/btnGeneral";
import { epMeretingMeteringRetrievingMeteringDataCheck, epMeretingMeteringRetrievingRetrieving } from "@/utils/exportFunc";

interface ClientProps { params: { lng: string } }

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    let isReadOnly = false;

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Metering Retrieving', userDT)
            if (permission) {
                setUserPermission(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    //state
    const [key, setKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
    const [selectedKey, setselectedKey] = useState<any>();
    const [formMode, setFormMode] = useState<'execute' | 'template' | undefined>(undefined);
    const [formActionOpen, setformActionOpen] = useState(false); // open modal action
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Your file has been uploaded.');
    const [srchMeterRetriveId, setSrchMeterRetriveId] = useState<any>([]);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const open = Boolean(anchorEl);
    const open2 = Boolean(anchorEl2);
    const [tabIndex, setTabIndex] = useState(0); // 0=Retrieving, 1=metering data check

    const handleChange = (event: any, newValue: any) => {
        setMasterMeteringRetrievingId([])
        setTabIndex(newValue);
    };

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg ";

    // ############### FIELD SEARCH ###############
    const handleFieldSearch = async () => {
        
        setIsLoading(false)
        const start_data = watch("filter_start_date") ? dayjs(watch("filter_start_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
        const end_data = watch("filter_end_date") ? dayjs(watch("filter_end_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")

        let response: any = undefined;
        let result = []
        if (tabIndex == 0) {
            response = await getService(`/master/metering-management/metering-retrieving?limit=20000&offset=0&startDate=${start_data}&endDate=${end_data}`);
            // result = filterByGasDayRange(response?.data ? response.data : dataTable, start_data, end_data); // filter ช่วงเวลา
            result = response?.data
        } else {
            response = await getService(`/master/metering-management/metering-retrieving-data-check?limit=10&offset=0&startDate=${start_data}&endDate=${end_data}`);
            result = (response?.data ? response.data : dataTable).filter((item: any) => {
                const gasDay = toDayjs(item.gas_day ?? item.gasDay);

                const isAfterStart = start_data ? gasDay.isSameOrAfter(toDayjs(start_data), 'day') : true;
                const isBeforeEnd = end_data ? gasDay.isSameOrBefore(toDayjs(end_data), 'day') : true;

                return isAfterStart && isBeforeEnd;
            });
        }
        // const response: any = await getService(`/master/metering-management/metering-retrieving?limit=${itemsPerPage}&offset=0&startDate=${start_data}&endDate=${end_data}&metered_run_number_id=${srchMeterRetriveId}`); // v2.0.29 Filter Gas day ไม่ขึ้น data ใน record https://app.clickup.com/t/86etrq93y
        const result_2 = result?.filter((item: any) => {
            return (
                // (srchMeterRetriveId ? item?.metering_point_sys == srchMeterRetriveId : true)
                // (srchMeterRetriveId ? item?.data?.metering_retrieving_id == srchMeterRetriveId : true)

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                (srchMeterRetriveId?.length > 0 ? srchMeterRetriveId.includes(item?.data?.metering_retrieving_id) : true) ||
                (srchMeterRetriveId?.length > 0 ? srchMeterRetriveId.includes(item?.metering_point_sys) : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setData(result_2);
        setFilteredDataTable(result_2);

        if (tabIndex == 0) {
            // tab retrieving
            setDataTab1(result_2)
        } else {
            // tab data check
            setDataTab2(result_2)
        }

        setTimeout(() => {
            setIsLoading(true)
        }, 400);

        // DATA METERING ID 2
        // const data_meter_point_de_dup = Array.from(
        //     new Map(
        //         result_2?.map((item: any) => [item.data.metering_retrieving_id, { metering_point_sys: item.data.metering_retrieving_id, type: item.type }])
        //     ).values()
        // );

        let data_meter_point_de_dup

        if (tabIndex == 0) {
            data_meter_point_de_dup = Array.from(
                new Map(
                    // response?.data?.map((item: any) => [item.metering_point_sys, { metering_point_sys: item.metering_point_sys, type: item.type }])
                    result?.map((item: any) => [item.data.metering_retrieving_id, { metering_point_sys: item.data.metering_retrieving_id, type: item.type }])
                ).values()
            );
        } else {
            data_meter_point_de_dup = Array.from(
                new Map(
                    // response?.data?.map((item: any) => [item.metering_point_sys, { metering_point_sys: item.metering_point_sys, type: item.type }])
                    result?.map((item: any) => [item.metering_point_sys, { metering_point_sys: item.metering_point_sys, type: item.type }])
                ).values()
            );
        }

        let optionX = data_meter_point_de_dup?.map((item: any) => ({
            value: item.metering_point_sys,
            label: item.metering_point_sys || "",
        }))

        if (tabIndex == 0) {
            setMasterMeteringRetrievingId(optionX)
        } else {
            setMasterMeteringRetrievingId((prev: any[]) => {
                const existingModes = new Set(prev.map(item => item.value));
                const newUniqueItems = optionX.filter((item: any) => !existingModes.has(item.value));
                return [...prev, ...newUniqueItems]; // เติมมันเข้าไป และเช็คซ้ำด้วย
            });
        }
    };

    const handleReset = () => {
        setValue("filter_start_date", null)
        setValue("filter_end_date", null)
        setSrchMeterRetriveId([])
        // setFilteredDataTable(dataTable);
        fetchData();
        setKey((prevKey) => prevKey + 1);
    };


    // ############### DATA TABLE ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataTable, setData] = useState<any>([]);
    const [dataTab1, setDataTab1] = useState<any>([]);
    const [dataTab2, setDataTab2] = useState<any>([]);
    const [dataMeterIDAll, setDataMeterIDAll] = useState<any>([]);
    const [lastRetrieving, setLastRetrieving] = useState<any>('');
    const [masterMeteringRetrievingId, setMasterMeteringRetrievingId] = useState<any>([]);

    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0); // Store total count
    const [is1stTime, setIs1stTime] = useState<any>(true);

    const fetchData = async () => {
        setIsLoading(false)
        try {
            const res_last: any = await getService(`/master/metering-management/last-retrieving`);
            setLastRetrieving(res_last);

            setValue("filter_start_date", dayjs());
            setValue("filter_end_date", dayjs());

            const start_data = watch("filter_start_date") ? dayjs(watch("filter_start_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
            const end_data = watch("filter_end_date") ? dayjs(watch("filter_end_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")

            const response: any = await getService(`/master/metering-management/metering-retrieving?limit=20000&offset=0&startDate=${start_data}&endDate=${end_data}`); // เดิม ๆ
            // const response: any = await getService(`/master/metering-management/metering-retrieving?limit=10&offset=0&startDate=${''}&endDate=${''}`); // v2.0.29 Filter Gas day ไม่ขึ้น data ใน record https://app.clickup.com/t/86etrq93y
            // const response: any = await getService(`/master/metering-management/metering-retrieving?limit=10&offset=0&startDate=${''}&endDate=${''}&metered_run_number_id=`); // v2.0.29 Filter Gas day ไม่ขึ้น data ใน record https://app.clickup.com/t/86etrq93y
            const res_check_data: any = await getService(`/master/metering-management/metering-retrieving-data-check?limit=10&offset=0&startDate=${start_data}&endDate=${end_data}`);

            // ADD BLANK
            // const mod_res_tab1 = addBlankRecords(response);
            // const mod_res_tab2 = addBlankRecords(res_check_data);
            // setDataTab1(mod_res_tab1?.data);
            // setDataTab2(mod_res_tab2?.data);
            // setData(mod_res_tab1?.data);
            // setFilteredDataTable(mod_res_tab1?.data);
            // setTotalItems(mod_res_tab1?.total || 0); // Get total count from API

            // ============================================================
            // const result_only_today = filterByGasDayRange(response?.data, start_data, end_data); // filter ช่วงเวลา
            // ============================================================

            // ORIGINAL
            setDataTab1(response?.data);
            // setDataTab2(res_check_data?.data); 
            setDataTab2([]); // ตอนเข้ามาที่หน้านี้จะไม่มีข้อมูลใน Table แสดงเลย ต้อง Filter From-To ก่อน เพื่อตรวจสอบว่ามี Point ไหนบ้างที่มีอยู่ในระบบเรา

            setData(response?.data);
            setFilteredDataTable(response?.data);
            // setFilteredDataTable(result_only_today);
            setTotalItems(response?.total || 0); // Get total count from API


            setIsLoading(true);
            setIs1stTime(false);


            // ============================================================================================
            // DATA METERING ID
            // const res_meter_id: any = await getService(`/master/metering-management/all-id`);
            // let option = res_meter_id?.map((item: any) => ({
            //     value: item?.id?.toString(),
            //     label: item.metering_retrieving_id || "",
            // }))
            // setMasterMeteringRetrievingId(option)
            // setDataMeterIDAll(res_meter_id)


            // DATA METERING ID 2
            const data_meter_point_de_dup = Array.from(
                new Map(
                    // response?.data?.map((item: any) => [item.metering_point_sys, { metering_point_sys: item.metering_point_sys, type: item.type }])
                    response?.data?.map((item: any) => [item.data.metering_retrieving_id, { metering_point_sys: item.data.metering_retrieving_id, type: item.type }])
                ).values()
            );

            let optionX = data_meter_point_de_dup?.map((item: any) => ({
                value: item.metering_point_sys,
                label: item.metering_point_sys || "",
            }))

            setMasterMeteringRetrievingId(optionX)


        } catch (err) {
            // Error fetching data:
        }
    };

    const checkDataCall = async () => {
        let res_post = await postService('/master/metering-management/metering-retrieving/check-data', {})
    }

    useEffect(() => {

        // tab check data
        if (tabIndex == 1) {
            setData(dataTab2);
            setFilteredDataTable(dataTab2);
        } else {
            // tab retrieving
            setData(dataTab1);
            setFilteredDataTable(dataTab1);
        }
    }, [tabIndex])

    useEffect(() => {
        getPermission();
        fetchData();
    }, [resetForm]);


    // ############### LIKE SEARCH ###############
    // cyberpunk
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const DEBOUNCE_MS = 350; // ปรับได้ เป็น ms

    const handleSearch = (query: string) => {
        // เคลียร์งานเดิมก่อนเสมอ
        if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
        }

        setIsLoading(false)

        // เดิมโรงงาน
        // const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        // const filtered = dataTable?.filter(
        //     (item: any) => {

        //         return (
        //             item?.data?.gasDay?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
        //             formatStringToDDMMYYYY(item?.data?.gasDay)?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
        //             item?.data?.metering_retrieving_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        //             item?.data?.meteringPointId?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
        //             item?.data?.energy?.toString().trim().includes(query.toString().trim()) ||

        //             formatDateNoTime(item?.timestamp)?.toLowerCase().includes(queryLower) ||
        //             formatTime(item?.timestamp)?.toLowerCase().includes(queryLower) ||
        //             formatDate(item?.timestamp)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
        //             item?.description?.toString().trim().includes(query.toString().trim())
        //         )
        //     }
        // );

        // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        // setFilteredDataTable(filtered);
        // setTimeout(() => {
        //     setIsLoading(true);
        // }, 300);

        if (tabIndex == 0) {
            typingTimerRef.current = setTimeout(() => {
                const qTrim = query.toString().trim();
                const queryLower = qTrim.toLowerCase().replace(/\s+/g, '');

                // ถ้า query ว่าง ให้รีเซ็ตผลและหยุด
                if (!qTrim) {
                    setCurrentPage(1);
                    setFilteredDataTable(dataTable ?? []);
                    setIsLoading(true);
                    return;
                }


                const filtered = (dataTable ?? []).filter((item: any) => {
                    return (
                        item?.data?.gasDay?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                        formatStringToDDMMYYYY(item?.data?.gasDay)?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                        item?.data?.metering_retrieving_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.data?.meteringPointId?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        (item?.data?.energy ?? '').toString().trim().includes(qTrim) ||
                        formatNumberThreeDecimal(item?.data?.energy)?.replace(/\s+/g, "").toLowerCase().trim().includes(qTrim) ||
                        formatNumberThreeDecimalNoComma(item?.data?.energy)?.replace(/\s+/g, "").toLowerCase().trim().includes(qTrim) ||
                        (formatDateNoTime(item?.timestamp) ?? '').toLowerCase().includes(queryLower) ||
                        (formatTime(item?.timestamp) ?? '').toLowerCase().includes(queryLower) ||
                        (formatDate(item?.timestamp) ?? '').replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                        (item?.description ?? '').toString().trim().includes(qTrim)
                    )
                })

                setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
                setFilteredDataTable(filtered);

                // หน่วงนิดให้ UI smooth
                setTimeout(() => setIsLoading(true), 150);
            }, DEBOUNCE_MS);
        } else {

            typingTimerRef.current = setTimeout(() => {
                const qTrim = query.toString().trim();
                const queryLower = qTrim.toLowerCase().replace(/\s+/g, '');

                // ถ้า query ว่าง ให้รีเซ็ตผลและหยุด
                if (!qTrim) {
                    setCurrentPage(1);
                    setFilteredDataTable(dataTable ?? []);
                    setIsLoading(true);
                    return;
                }

                const filtered = (dataTable ?? []).filter((item: any) => {
                    return (
                        item?.data?.meteringPointId?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        (item?.description ?? '').toString().trim().includes(qTrim)
                    )
                })

                setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
                setFilteredDataTable(filtered);

                // หน่วงนิดให้ UI smooth
                setTimeout(() => setIsLoading(true), 150);
            }, DEBOUNCE_MS);
        }
    };

    // กัน memory leak เวลา unmount
    useEffect(() => {
        return () => {
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        };
    }, []);


    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'metering_retrieving_id', label: 'Metering Retrieving ID', visible: true },
        { key: 'metering_point_id', label: 'Metering Point ID', visible: true },
        { key: 'energy_mmbtu', label: 'Energy (MMBTU)', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'error_description', label: 'Error Description', visible: true },
    ];

    const initialColumnsMeteringDataCheck: any = [
        { key: 'met_point_code', label: 'Metering Point ID', visible: true },
        { key: 'met_point_description', label: 'Metered Point Description', visible: true },
    ];

    //action state columns
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const [columnVisibilityTab2, setColumnVisibilityTab2] = useState<any>(
        Object.fromEntries(initialColumnsMeteringDataCheck.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleColumnToggleTab2 = (columnKey: string) => {
        setColumnVisibilityTab2((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {

        if (tabIndex == 0) {
            setAnchorEl(anchorEl ? null : event.currentTarget);
        } else {
            setAnchorEl2(anchorEl2 ? null : event.currentTarget);
        }
    };

    const handleFormSubmit = async (data: any) => { }

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            // setPaginatedData(filteredDataTable)
        }
    }, [filteredDataTable, currentPage, itemsPerPage])


    // const fetchK = async (limit?: any, offset?: any) => {
    //     // const response: any = await getService(`/master/metering-management/metering-retrieving?limit=${limit}&offset=${offset}`);
    //     const start_data = watch("filter_start_date") ? dayjs(watch("filter_start_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
    //     const end_data = watch("filter_end_date") ? dayjs(watch("filter_end_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
    //     // const response: any = await getService(`/master/metering-management/metering-retrieving?limit=${limit}&offset=${offset}&startDate=${start_data}&endDate=${end_data}`);

    //     const response: any = await getService(`/master/metering-management/metering-retrieving?limit=${itemsPerPage}&offset=${offset}&startDate=${start_data}&endDate=${end_data}&metered_run_number_id=${srchMeterRetriveId}`);
    //     const res_check_data: any = await getService(`/master/metering-management/metering-retrieving-data-check?limit=${limit}&offset=${offset}&startDate=${start_data}&endDate=${end_data}`);

    //     // ADD BLANK
    //     // const mod_res_tab1 = addBlankRecords(response);
    //     // const mod_res_tab2 = addBlankRecords(res_check_data);
    //     // setDataTab1(mod_res_tab1?.data);
    //     // setDataTab2(mod_res_tab2?.data);
    //     // setData(mod_res_tab1?.data);
    //     // setFilteredDataTable(mod_res_tab1?.data);
    //     // setTotalItems(mod_res_tab1?.total || 0);
    //     // ============================================================

    //     // ORIGINAL
    //     setDataTab1(response?.data);
    //     setDataTab2(res_check_data?.data);
    //     setData(response?.data);
    //     setFilteredDataTable(response?.data);
    //     setTotalItems(response?.total || 0);

    //     setIsLoading(true);
    // }

    // useEffect(() => {
    //     let newOffset = (currentPage - 1) * itemsPerPage;

    //     if (is1stTime) {
    //         newOffset = 0
    //     }

    //     setOffset(newOffset);
    //     setLimit(itemsPerPage);
    //     setIsLoading(false)
    //     // fetchData();
    //     fetchK(itemsPerPage, newOffset);
    //     // fetchDataTab1();
    // }, [currentPage, itemsPerPage]);

    // ############### CHECK DATA ###############

    const handleCheckDataClick = (data?: any) => {

        setIsLoading(false)

        checkDataCall();
        setTimeout(() => {
            handleFieldSearch();
        }, 2000);
    };

    // เอาไว้ทำ option metering retriving ID (อ่านคอมเม้นนะ)
    // https://app.clickup.com/t/86euzxxhu
    const fetchOption = async () => {

        try {
            const start_data = watch("filter_start_date") ? dayjs(watch("filter_start_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
            const end_data = watch("filter_end_date") ? dayjs(watch("filter_end_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")

            const response: any = await getService(`/master/metering-management/metering-retrieving?limit=20000&offset=0&startDate=${start_data}&endDate=${end_data}`); // เดิม ๆ

            // DATA METERING ID 2
            const data_meter_point_de_dup = Array.from(
                new Map(
                    // response?.data?.map((item: any) => [item.metering_point_sys, { metering_point_sys: item.metering_point_sys, type: item.type }])
                    response?.data?.map((item: any) => [item.data.metering_retrieving_id, { metering_point_sys: item.data.metering_retrieving_id, type: item.type }])
                ).values()
            );

            let optionX = data_meter_point_de_dup?.map((item: any) => ({
                value: item.metering_point_sys,
                label: item.metering_point_sys || "",
            }))

            setMasterMeteringRetrievingId(optionX)

        } catch (error) {

        }
    }

    useEffect(() => {
        if (tabIndex !== 1) {
            fetchOption();
        }
    }, [watch("filter_start_date"), watch("filter_end_date")])

    return (
        <div className="space-y-2">
            <div className={`${cardClass} grid grid-cols-[82%_18%]`}>
                <div className="search-panel">
                    <aside className="flex flex-wrap sm:flex-row gap-y-5 gap-x-2 w-full">
                        <DatePickaSearch
                            {...register('filter_start_date')}
                            key={"start" + key}
                            label="Generate From"
                            placeHolder="Select Generate From"
                            allowClear
                            onChange={(e: any) => setValue("filter_start_date", e ? e : undefined)}
                            customWidth={145}
                            isDefaultToday={true}
                        />

                        <DatePickaSearch
                            {...register('filter_end_date')}
                            key={"end" + key}
                            label="Generate To"
                            placeHolder="Select Generate To"
                            allowClear
                            onChange={(e: any) => setValue("filter_end_date", e ? e : undefined)}
                            customWidth={140}
                            isDefaultToday={true}
                        />

                        <InputSearch
                            id="MeteringRetrievingIdFilter"
                            label={tabIndex === 0 ?"Metering Retrieving ID" : "Metered Point ID"} 
                            // type="select"
                            type="select-multi-checkbox"
                            customWidth={225}
                            value={srchMeterRetriveId}
                            onChange={(e) => setSrchMeterRetriveId(e.target.value)}
                            options={masterMeteringRetrievingId || []}
                            // options={dataTable
                            //     ?.filter((item: any) => item.id !== null && item.data?.metering_retrieving_id !== null)
                            //     ?.map((item: any) => ({
                            //         value: item?.id?.toString(), // Convert id to string
                            //         label: item.data?.metering_retrieving_id || "", // Fallback label
                            //     }))
                            // }

                            placeholder={tabIndex === 0 ? "Select Metering Retrieving ID" : "Select Metered Point ID"}
                        />

                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                        <BtnReset handleReset={handleReset} />
                    </aside>
                </div>
                <div className="action-panel flex gap-3 items-end justify-end pb-[8px]">

                </div>
            </div>

            <div className={`${cardClass} `}>
                <div className="search-panel">
                    <span className="flex justify-start items-center pt-2 pb-2 gap-4">
                        <div className="font-semibold text-[14px] text-[#464255]">
                            {`Metering Retrieving ID :`}
                        </div>
                        <div>
                            {lastRetrieving ? lastRetrieving?.metering_retrieving_id : ''}
                        </div>

                        <div className="font-semibold text-[14px] text-[#464255]">
                            {`Last Modif. Date :`}
                        </div>
                        <div>
                            {lastRetrieving ? formatDate(lastRetrieving?.create_date) : ''}
                        </div>

                        {/* <div className="font-semibold text-[14px] text-[#464255]">
                            {`Status :`}
                        </div>
                        <div>
                            {'Finish'}
                        </div> */}

                        {/* <div>
                            <button
                                type="button"
                                disabled={false}
                                className="w-[167px] h-[46px] font-normal text-white rounded-lg focus:outline-none text-[16px] bg-[#36B1AB] hover:bg-[#29938e] "
                            >
                                {`Template`}
                                <DownloadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: '8px' }} />
                            </button>
                        </div> */}
                    </span>
                </div>
            </div>

            <Tabs
                value={tabIndex}
                onChange={handleChange}
                aria-label="tabs"
                sx={{
                    marginBottom: "-19px !important",
                    "& .MuiTabs-indicator": {
                        display: "none", // Remove the underline
                    },
                    "& .Mui-selected": {
                        color: "#58585A !important",
                    },
                }}
            >
                {["Retrieving", "Metering Data Check"].map((label, index) => (
                    <Tab
                        key={label}
                        label={label}
                        id={`tab-${index}`}
                        sx={{
                            fontFamily: "Tahoma !important",
                            border: "1px solid",
                            borderColor: "#DFE4EA",
                            borderBottom: "none",
                            borderTopLeftRadius: "9px",
                            borderTopRightRadius: "9px",
                            textTransform: "none",
                            padding: "8px 16px",
                            backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                            color: tabIndex === index ? "#58585A" : "#9CA3AF",
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            "&:hover": {
                                backgroundColor: "#F3F4F6",
                            },
                        }}
                    />
                ))}
            </Tabs>

            <div className={`${cardClass} rounded-tl-none`}>
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{
                                        fontSize: "18px",
                                        color: "#2B2A87",
                                        borderRadius: "4px",
                                        width: "22px",
                                        height: "22px",
                                        border: "1px solid rgba(43, 42, 135, 0.4)"
                                    }}
                                />
                            </div>

                            {/* {
                                tabIndex == 1 &&
                                <BtnGeneral
                                    bgcolor={"#00ADEF"}
                                    textRender={"Check Data"}
                                    generalFunc={() => handleCheckDataClick()}
                                    can_create={userPermission ? userPermission?.f_create : false}
                                />
                            } */}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            {/*  */}
                            {
                                tabIndex == 0 ?
                                    <BtnGeneral
                                        bgcolor={"#24AB6A"}
                                        modeIcon={'export'}
                                        textRender={"Export"}
                                        generalFunc={() => {
                                            epMeretingMeteringRetrievingRetrieving({
                                                name: 'Metering Retrieving Retrieving',
                                                initialColumns: initialColumns,
                                                columnVisibility: columnVisibility,
                                                // resData: paginatedData,
                                                resData: filteredDataTable, // Check v2.2.4.0 pre-prod - column timestamp ตรงแล้ว แต่ export ข้อมูลออกมาไม่ครบ https://app.clickup.com/t/86eub6d8v
                                            })
                                        }}
                                        can_export={userPermission ? userPermission?.f_export : false}
                                    />
                                    : <BtnGeneral
                                        bgcolor={"#24AB6A"}
                                        modeIcon={'export'}
                                        textRender={"Export"}
                                        generalFunc={() => {
                                            epMeretingMeteringRetrievingMeteringDataCheck({
                                                name: 'Metering Retrieving Metering Data Check',
                                                initialColumns: initialColumnsMeteringDataCheck,
                                                columnVisibility: columnVisibilityTab2,
                                                resData: paginatedData,
                                            })
                                        }}
                                        can_export={userPermission ? userPermission?.f_export : false}
                                    />
                            }
                            {/* <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path={tabIndex == 0 ? "metering/metering-retrieving/retrieving" : "metering/metering-retrieving/metering-data-check"}
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={tabIndex == 0 ? columnVisibility : columnVisibilityTab2}
                                initialColumns={tabIndex == 0 ? initialColumns : initialColumnsMeteringDataCheck}
                                specificMenu={tabIndex == 0 ? "metering-retrieving" : "metering-data-check"}
                                specificData={
                                    tabIndex == 0 ?
                                        {
                                            // "limit": itemsPerPage,
                                            // "offset": (currentPage - 1) * itemsPerPage,
                                            "limit": 40000,
                                            "offset": 0,
                                            "startDate": watch("filter_start_date") ? dayjs(watch("filter_start_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                                            "endDate": watch("filter_end_date") ? dayjs(watch("filter_end_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                                            "metered_run_number_id": srchMeterRetriveId ? srchMeterRetriveId : null
                                        }
                                        :
                                        {
                                            "limit": itemsPerPage,
                                            "offset": (currentPage - 1) * itemsPerPage,
                                            "startDate": watch("filter_start_date") ? dayjs(watch("filter_start_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                                            "endDate": watch("filter_end_date") ? dayjs(watch("filter_end_date")).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"),
                                            "metered_run_number_id": srchMeterRetriveId ? srchMeterRetriveId : null
                                        }
                                }
                            /> */}
                        </div>
                    </div>
                </div>

                <TableMtrRetrieve
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    columnVisibilityTab2={columnVisibilityTab2}
                    setisLoading={setIsLoading}
                    selectedKey={selectedKey}
                    tabIndex={tabIndex}
                />
            </div>

            <ModalAction
                mode={formMode}
                open={formActionOpen}
                setformActionOpen={setformActionOpen}
                setModalErrorMsg={setModalErrorMsg}
                setModalErrorOpen={setModalErrorOpen}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                onClose={() => {
                    setformActionOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            setFormMode(undefined);
                            resetForm();
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalSuccessMsg}
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            {/* <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

            <PaginationComponent
                // totalItems={totalItems} // Use total count from API
                totalItems={filteredDataTable?.length} // Use total count from API
                // totalItems={4000} // ใส่ 5000 ไว้ก่อน เพราะมากกว่านี้หลังบ้านส่ง [] กลับมาให้ *ข้อมูล total จริง ๆ มี 300000 กว่า
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
                onItemsPerPageChange={(perPage) => {
                    setItemsPerPage(perPage);
                    setCurrentPage(1); // Reset to first page when items per page changes
                }}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            <ColumnVisibilityPopover
                open={open2}
                anchorEl={anchorEl2}
                setAnchorEl={setAnchorEl2}
                columnVisibility={columnVisibilityTab2}
                handleColumnToggle={handleColumnToggleTab2}
                initialColumns={initialColumnsMeteringDataCheck}
            />
        </div>
    )
}

export default ClientPage;