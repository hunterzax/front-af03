"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { Tune, Settings } from "@mui/icons-material"
import CheckboxSearch2, { InputSearch } from "@/components/other/SearchForm";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import TableMtrMgn from "./form/table";
import ModalAction from "./form/modalAction";
import ModalComponent from "@/components/other/ResponseModal";
import ModalViewDetail from "./form/modalViewDetail";
import { useAppDispatch } from "@/utils/store/store";
import { useFetchMasters } from "@/hook/fetchMaster";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { exportToExcel, findRoleConfigByMenuName, formatDate, formatDateYyyyMmDd, formatNumberSixDecimal, formatNumberSixDecimalNoComma, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatStringToDDMMYYYY, generateUserPermission, toDayjs } from "@/utils/generalFormatter";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import PaginationComponent from "@/components/other/globalPagination";
import dayjs from 'dayjs';
import timezone from "dayjs/plugin/timezone";
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import getUserValue from "@/utils/getuserValue";
import ConfirmModal from "@/components/other/confirmModal";
import BtnGeneral from "@/components/other/btnGeneral";
import { epMeretingMeteringManagement } from "@/utils/exportFunc";

dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Bangkok")

interface ClientProps { params: { lng: string } }

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    // const router = useRouter();
    // let isReadOnly = false;

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg";
    const btnActionClass = "h-[40px] px-[20px] py-[10px] text-[#fff] rounded-lg flex items-center justify-center";

    //state
    const [key, setKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const [selectedKey, setselectedKey] = useState<any>();
    const [formMode, setFormMode] = useState<'execute' | 'template' | 'view' | undefined>(undefined);

    const [formActionOpen, setformActionOpen] = useState(false); // open modal action
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalWarningOpen, setModalWarningOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Your file has been uploaded.');

    const handleCloseModal = () => {
        setModalSuccessOpen(false);
        setExecuteDisable(false)

        if (resetForm) {
            setTimeout(() => {
                setFormMode(undefined);
                resetForm();
            }, 200);
        }
    }

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Metering Management', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Metering Management', userDT)
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

    // ############### REDUX DATA ###############
    const { zoneMaster, areaMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (forceRefetch || !zoneMaster?.data) {
            dispatch(fetchZoneMasterSlice());
        }
        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }
        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [srchZone, setSrchZone] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [meteredPointIdMaster, setMeteredPointIdMaster] = useState<any>([]);
    const [srchMeteredPointId, setSrchMeteredPointId] = useState<any>([]);
    const [srchMeteringRetrievingId, setSrchMeteringRetrievingId] = useState('');

    const [triggerSrchDate, settriggerSrchDate] = useState(false);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(new Date);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(new Date);

    const [optionMRID, setoptionMRID] = useState<any[]>([]);
    const [tk, settk] = useState(false)

    const handleFieldSearch = async () => {
        setIsLoading(true);

        const filterMeterPointData = (data: any, zone: any, area: any) => {
            return data?.filter((item: any) => {
                const zoneName = String(item?.zone_obj?.name);
                const areaId = String(item?.area_obj?.id);
                return zone.includes(zoneName) && area.includes(areaId);
            });
        };

        // เอาไว้ filter data ที่ไม่ซ้ำ และ sort option ไปในตัว
        const removeDuplicatesAndSort = (arr: []) => {
            const uniqueValues = Array.from(new Set(arr));
            return uniqueValues.sort();  // จัดเรียง A-Z
        };

        // ใช้เพื่อเวลาที่ในกรณีไม่เลือกวันใหม่ แล้วจะ filter อื่นๆจะได้ไม่เสียเวลา load data //test by bangjuu
        let response: any;
        const isFilterRetrievingId = srchMeteringRetrievingId !== '' && srchMeteringRetrievingId && srchMeteringRetrievingId !== 'Last Retrieving'

        let onOrOff = watch('filter_sharing_meter') ? 'on' : 'off';
        if (isFilterRetrievingId == true) {
            const url = `/master/metering-management/getDataByRetrievingID?share=${onOrOff}&metering_retrieving_id=${srchMeteringRetrievingId}`;
            let retrievingIDResponse = await getService(url);
            const startDate = (srchStartDate ? dayjs(srchStartDate) : srchEndDate ? dayjs(srchEndDate) : dayjs()).startOf('day');
            const endDate = (srchEndDate ? dayjs(srchEndDate) : startDate).endOf('day');

            if (retrievingIDResponse && Array.isArray(retrievingIDResponse)) {
                if (startDate) {
                    retrievingIDResponse = retrievingIDResponse?.filter((item: any) => toDayjs(item?.gasDay, 'YYYY-MM-DD').isSameOrAfter(startDate, 'day'));
                }
                if (endDate) {
                    retrievingIDResponse = retrievingIDResponse?.filter((item: any) => toDayjs(item?.gasDay, 'YYYY-MM-DD').isSameOrBefore(endDate, 'day'));
                }
            }
            response = retrievingIDResponse;
        }
        else {
            const today = dayjs().format("YYYY-MM-DD");
            const startDate = srchStartDate ? formatDateYyyyMmDd(srchStartDate) : srchEndDate ? formatDateYyyyMmDd(srchEndDate) : today;
            const endDate = srchEndDate ? formatDateYyyyMmDd(srchEndDate) : startDate;
            const url = `/master/metering-management/getData?share=${onOrOff}&start_date=${startDate}&end_date=${endDate}`;
            response = await getService(url);
        }
        if(response && Array.isArray(response)) {
        settriggerSrchDate(false);
        const sortGasdayandIDx: any = sortByGasDayAndMeteringPoint(response);

        // let resultZoneArea = response?.filter((item: any) => {
        let resultZoneArea = sortGasdayandIDx?.filter((item: any) => {
            return (
                ((srchZone?.length > 0 && srchZone?.length < dataZoneMasterZ?.length) ? srchZone.includes(item?.prop?.zone?.name) : true) &&
                ((srchArea?.length > 0 && srchArea?.length < areaMaster?.data?.length) ? srchArea.includes(item?.prop?.area?.id.toString()) : true)
                // srchMeteringRetrievingId !== '' && srchMeteringRetrievingId ? srchMeteringRetrievingId == item?.metering_retrieving_id : true
            );
        });
        let resultFilter: any;


        // อย่าหาทำ เอา setstate มา อยู่ร่วมกับ state ในฟังชั่นเดียวกันมันทำให้ state ไม่ทัน #By bank comment!!
        resultFilter = resultZoneArea

        // if (isFilterRetrievingId) {
        //     const result_test = resultFilter?.filter((item: any) => item?.metering_retrieving_id == srchMeteringRetrievingId);
        //     resultFilter = result_test;
        // }

        // const meteredPointIdDatas = result_2?.map((item: any) => item?.id?.toString());
        // setSrchMeteredPointId(meteredPointIdDatas)

        if (srchMeteredPointId?.length > 0) {
            resultFilter = resultZoneArea?.filter((item: any) => srchMeteredPointId.includes(item?.meteringPointId?.toString()))
        }

        // ข้อมูลสำหรับ filter Metered Point ID
        const meter_point_id = Array.from(
            new Map(
                response?.map((item: any) => [item.meteringPointId, { id: item?.id?.toString(), name: item?.meteringPointId, zone_obj: item?.prop?.zone, area_obj: item?.prop?.area }])
            ).values()
        );
        setMeteredPointIdMaster(meter_point_id)

        // อย่าหาทำ เอา setstate มา อยู่ร่วมกับ state ในฟังชั่นเดียวกันมันทำให้ state ไม่ทัน #By bank comment!!

        // ถ้าเปิดตรงนี้ทำให้ตอนกดเสิช Metered Point ID มันจะกลายเป็น select all
        // เอา data ที่จะลง table มา map และ filter เฉพาะตัวที่มีค่า จากนั้น นำไปผ่าน function removeDuplicatesAndSort => ได้ option มาแว้ว
        // const resultFilterOption = removeDuplicatesAndSort(resultFilter?.map((item: any) => item?.meteringPointId)?.filter(Boolean));
        // setSrchMeteredPointId(resultFilterOption)

        // เรียงตาม gas_day น้อยไปมาก
        const sort_gas_day = resultFilter.sort((a: any, b: any) => dayjs(a.gasDay).valueOf() - dayjs(b.gasDay).valueOf());
        const sortGasdayandID: any = sortByGasDayAndMeteringPoint(sort_gas_day);

        setDataTable(resultFilter);
        // setoptionMRID(sort_gas_day)
        setFilteredDataTable(sortGasdayandID);

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        }
        setIsLoading(false)
    };

    const handleReset = () => {
        const zoneDatas = dataZoneMasterZ?.map((item: any) => item?.zone_name);
        const areaDatas = areaMaster?.data?.map((item: any) => item?.id?.toString());

        setSrchZone(zoneDatas)
        setSrchArea(areaDatas)
        setSrchMeteredPointId([]);
        setSrchMeteringRetrievingId('')
        setSrchStartDate(new Date);
        setSrchEndDate(new Date);

        fetchData();
        setKey((prevKey) => prevKey + 1);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

        const filtered = dataTable?.filter(
            (item: any) => {

                // let name_search = JSON.parse(item.reqUser).first_name + ' ' + JSON.parse(item.reqUser).last_name
                return (
                    item?.gasDay?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatStringToDDMMYYYY(item?.gasDay)?.toLowerCase().replace(/\s+/g, '')?.trim().includes(queryLower) ||
                    item?.meteringPointId?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.prop?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.prop?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.prop?.customer_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.volume?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.heatingValue?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.energy?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberSixDecimal(item?.volume)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.heatingValue)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.energy)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberSixDecimalNoComma(item?.volume)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.heatingValue)?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.energy)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||


                    // dayjs(item?.registerTimestamp)?.tz('Asia/Bangkok')?.format('DD/MM/YYYY HH:mm:ss')?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // dayjs(item?.registerTimestamp)?.tz('Asia/Bangkok')?.format('DD/MM/YYYY')?.toLowerCase().includes(queryLower) ||
                    // dayjs(item?.registerTimestamp)?.tz('Asia/Bangkok')?.format('HH:mm')?.toLowerCase().includes(queryLower) ||
                    // dayjs(item?.registerTimestamp)?.tz('Asia/Bangkok')?.format('DD/MM/YYYY HH:mm')?.toLowerCase().includes(queryLower) ||
                    dayjs(item?.registerTimestamp)?.format('DD/MM/YYYY HH:mm:ss')?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    dayjs(item?.registerTimestamp)?.format('DD/MM/YYYY')?.toLowerCase().includes(queryLower) ||
                    dayjs(item?.registerTimestamp)?.format('HH:mm')?.toLowerCase().includes(queryLower) ||
                    dayjs(item?.registerTimestamp)?.format('DD/MM/YYYY HH:mm')?.toLowerCase().includes(queryLower) ||


                    dayjs(item?.insert_timestamp, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Bangkok').format("DD/MM/YYYY HH:mm:ss")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    dayjs(item?.insert_timestamp)?.tz('Asia/Bangkok')?.format('DD/MM/YYYY')?.toLowerCase().includes(queryLower) ||
                    dayjs(item?.insert_timestamp)?.tz('Asia/Bangkok')?.format('HH:mm')?.toLowerCase().includes(queryLower) ||
                    dayjs(item?.insert_timestamp)?.tz('Asia/Bangkok')?.format('DD/MM/YYYY HH:mm')?.toLowerCase().includes(queryLower) ||

                    item?.metering_retrieving_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    typeof item?.datasource !== 'object' && item?.datasource?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        const sortGasdayandID: any = sortByGasDayAndMeteringPoint(filtered);
        setFilteredDataTable(sortGasdayandID);
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [executeDisable, setExecuteDisable] = useState(false);
    const [viewDetailOpen, setViewDetailOpen] = useState(false);
    const [viewDetailData, setViewDetailData] = useState<any>();

    const openViewForm = (id: any) => {
        const filteredData = filteredDataTable.find((item: any) => item?._id?.['$oid'] === id || item?.id === id);
        setViewDetailData(filteredData);
        setFormMode('view');
        setViewDetailOpen(true);
    };

    const handleFormSubmit = async (data: any) => {


        let body_post = {
            startDate: data?.start_date,
            endDate: data?.end_date,
        }

        switch (formMode) {
            case "execute":
                setExecuteDisable(true)
                postService('/master/metering-management/execution', body_post);
                setModalWarningOpen(true)
                // const res_create = await postService('/master/metering-management/execution', body_post);
                // const status = res_create?.response?.data?.status ?? res_create?.response?.data?.statusCode;

                // if ([400, 500].includes(status)) {
                //     setformActionOpen(false);
                //     setModalErrorMsg(res_create?.response?.data?.error ? res_create?.response?.data?.error : 'Execution failed due to an API issue. Please try again later or contact support.');
                //     setModalErrorOpen(true)

                //     await fetchData();
                // } else {
                //     // setformActionOpen(false);
                //     // setModalSuccessMsg('Metering Process has been executed.')
                //     // setModalSuccessOpen(true);
                //     await fetchData(true);
                // }

                break;
        }
        if (resetForm) resetForm(); // reset form
    }

    // ############### DATA TABLE ###############
    const [dataTable, setDataTable] = useState<any>([]);
    const [lastRetrieving, setLastRetrieving] = useState<any>('');
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [exportData, setExportData] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);
    const [dataMasterRetrivingId, setDataMasterRetrivingId] = useState<any>([]);

    const fetchData = async (success?: boolean) => {
        try {

            setIsLoading(true)
            let onOrOff = watch('filter_sharing_meter') ? 'on' : 'off'

            const today = dayjs().format("YYYY-MM-DD");
            const defaultStartDate = today;
            const defaultEndDate = today;

            const response: any = await getService(`/master/metering-management/getData?share=${onOrOff}&start_date=${defaultStartDate}&end_date=${defaultEndDate}`);
            // const retrievingIDresponse: any = await getService(`/master/metering-management/getRetrievingID?start_date=${srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : today}&end_date=${srchEndDate ? toDayjs(srchEndDate).format("YYYY-MM-DD") : today}`);
            // if (retrievingIDresponse && Array.isArray(retrievingIDresponse)) {
            //     setoptionMRID(retrievingIDresponse.map((item: any) => {
            //         return { metering_retrieving_id: item }
            //     }))
            // }

            const res_last: any = await getService(`/master/metering-management/last-retrieving`);

            // DATA ZONE แบบไม่ซ้ำ
            const data_zone_de_dup = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneMasterZ(data_zone_de_dup);

            // DATA METERING RETRIVE ID
            // const data_meter_retrive_id = await getService(`/master/metering-management/retrieving-number`);
            // setDataMasterRetrivingId(data_meter_retrive_id)

            // set ตอน default filter zone จะได้เป็น select all
            const zoneNames = data_zone_de_dup.map((item: any) => item?.zone_name);
            setSrchZone(zoneNames)

            const areaDatas = areaMaster?.data?.map((item: any) => item?.id?.toString());
            setSrchArea(areaDatas)

            if (response?.status !== 500) {
                setLastRetrieving(formatDate(res_last?.create_date))

                // เรียงตาม gas_day น้อยไปมาก
                const sort_gas_day = response.sort((a: any, b: any) => dayjs(a.gasDay).valueOf() - dayjs(b.gasDay).valueOf());

                let resultZoneArea = sort_gas_day?.filter((item: any) => {
                    return (
                        (srchZone?.length > 0 ? srchZone.includes(item?.prop?.zone?.name) : true) &&
                        (srchArea?.length > 0 ? srchArea.includes(item?.prop?.area?.id.toString()) : true)
                        // srchMeteringRetrievingId !== '' && srchMeteringRetrievingId ? srchMeteringRetrievingId == item?.metering_retrieving_id : true
                    );
                });

                const sortGasdayandID: any = sortByGasDayAndMeteringPoint(resultZoneArea);
                setDataTable(sortGasdayandID);
                setFilteredDataTable(sortGasdayandID);

                const filterMeterPointData = (data: any, zone: any, area: any) => {
                    return data?.filter((item: any) => {
                        const zoneName = String(item?.zone_obj?.name ?? '');
                        const areaId = String(item?.area_obj?.id ?? '');
                        return (zone.includes(zoneName) || !zoneName) && (area.includes(areaId) || !areaId);
                    });
                };

                // ข้อมูลสำหรับ filter Metered Point ID
                const meter_point_id = Array.from(
                    new Map(
                        response?.map((item: any) => [item.meteringPointId, { id: item?.id?.toString(), name: item?.meteringPointId, zone_obj: item?.prop?.zone, area_obj: item?.prop?.area }])
                    ).values()
                );

                // const resultFilter = filterMeterPointData(meter_point_id, zoneNames, areaDatas)?.map((item: any) => item?.id?.toString());
                const resultFilter = filterMeterPointData(meter_point_id, zoneNames, areaDatas)?.map((item: any) => item.name);
                setSrchMeteredPointId((pre: any) => resultFilter)
                setMeteredPointIdMaster(meter_point_id)
            }

            setTimeout(() => {
                if (success == true) {
                    setModalSuccessMsg('Metering Process has been executed.')
                    setModalSuccessOpen(true);
                    setformActionOpen(false);
                }

                setIsLoading(false)
                //smooth
            }, 1000);

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    const [load_, setLoad_] = useState(false)

    const fetchRetrievingId = async () => {
        try {
            setLoad_(true)
            // setIsLoading(true)
            const today = toDayjs().format("YYYY-MM-DD");
            const defaultStartDate = srchStartDate ? toDayjs(srchStartDate).format("YYYY-MM-DD") : today;
            const defaultEndDate = srchEndDate ? toDayjs(srchEndDate).format("YYYY-MM-DD") : today;
            const response: any = await getService(`/master/metering-management/getRetrievingID?start_date=${defaultStartDate}&end_date=${defaultEndDate}`);

            if (response && Array.isArray(response)) {
                setoptionMRID(response.map((item: any) => {
                    return { metering_retrieving_id: item }
                }))
                // setSrchMeteredPointId((pre: any) => response)
            }
            setLoad_(false)
            
        } catch (err) {
            setLoad_(false)
            // setError(err.message);
        } finally {
            setLoad_(false)
            // setIsLoading(false);
        }
    };

    //load data
    useEffect(() => {
        fetchData();
        fetchRetrievingId()
    }, []);

    const openExecuteForm = () => {
        setFormMode('execute');
        setformActionOpen(true);
    };

    const openTemplateForm = () => {
        setFormMode('template');
        setformActionOpen(true);
    };

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
            const data = filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
            setPaginatedData(data);
            setExportData(filteredDataTable);
            settk(!tk)
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'mtr_p_id', label: 'Metering Point ID', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'customer_type', label: 'Customer Type', visible: true },
        { key: 'volume', label: 'Volume (MMSCF)', visible: true },
        { key: 'heating_volume', label: 'Heating Value (BTU/SCF)', visible: true },
        { key: 'energy', label: 'Energy (MMBTU)', visible: true },
        { key: 'received_timestamp', label: 'Received Timestamp', visible: true },
        { key: 'insert_timestamp', label: 'TPA Insert Timestamp', visible: true },
        { key: 'mtr_r_id', label: 'Metering Retrieving ID', visible: true },
        { key: 'source', label: 'Source', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    useEffect(() => {
        if (srchZone?.length > 0) {
            // set ตอน select zone เปลี่ยน แล้วตรง filter area จะได้เป็น select all
            let area_by_zone = areaMaster?.data?.filter((item: any) => srchZone.includes(item?.zone?.name?.toString()))
            const areaDatas = area_by_zone?.map((item: any) => item?.id?.toString());
            setSrchArea(areaDatas)
        }
        else {
            setSrchArea([])
        }
    }, [srchZone])

    useEffect(() => {
        if (triggerSrchDate == true && srchStartDate) {
            fetchRetrievingId()
        }
    }, [triggerSrchDate, srchStartDate, srchEndDate])

    const sortByGasDayAndMeteringPoint = (data: any[]) => {
        return data?.sort((a, b) => {
            // เปรียบเทียบ gasDay ก่อน
            const gasDayA = new Date(a.gasDay);
            const gasDayB = new Date(b.gasDay);

            if (gasDayA.getTime() < gasDayB.getTime()) return -1;
            if (gasDayA.getTime() > gasDayB.getTime()) return 1;

            // ถ้า gasDay เท่ากัน ให้เปรียบเทียบ meteringPointId
            const meteringA = a.meteringPointId?.toUpperCase() || '';
            const meteringB = b.meteringPointId?.toUpperCase() || '';

            return meteringA.localeCompare(meteringB);
        });
    };

    return (
        <div className="space-y-2">
            <div className={`${cardClass} grid grid-cols-[82%_18%]`}>
                <div className="search-panel">
                    <aside className="flex flex-wrap sm:flex-row gap-y-5 gap-x-2 w-full ">
                        <DatePickaSearch
                            {...register('filter_start_date')}
                            key={"start" + key}
                            label="Gas Day From"
                            placeHolder="Select Gas Day From"
                            allowClear
                            // onChange={(e: any) => setValue("filter_start_date", e ? e : undefined)}
                            onChange={(e: any) => {
                                setSrchStartDate(e ? e : null)

                                //check ในกรณีกดเล่น หรือกดซ้ำ
                                if (e !== srchStartDate) {
                                    settriggerSrchDate(true);
                                }
                            }}
                            customWidth={145}
                            isDefaultToday={true}
                        />

                        <DatePickaSearch
                            {...register('filter_end_date')}
                            key={"end" + key}
                            label="Gas Day To"
                            placeHolder="Select Gas Day To"
                            min={srchStartDate}
                            allowClear
                            // onChange={(e: any) => setValue("filter_end_date", e ? e : undefined)}
                            onChange={(e: any) => {
                                setSrchEndDate(e ? e : null)

                                //check ในกรณีกดเล่น หรือกดซ้ำ
                                if (e !== srchEndDate) {
                                    settriggerSrchDate(true);
                                }
                            }}
                            customWidth={140}
                            isDefaultToday={true}
                        />

                        <InputSearch
                            id="searchZoneMaster"
                            label="Zone"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchZone}
                            onChange={(e) => {
                                setSrchZone(e.target.value)
                            }}
                            options={dataZoneMasterZ?.map((item: any) => ({
                                value: item.zone_name,
                                label: item.zone_name
                            }))}
                        />

                        <InputSearch
                            id="searchArea"
                            label="Area"
                            // type="select"
                            type="select-multi-checkbox"
                            value={srchArea}
                            onChange={(e) => {

                                setSrchArea(e.target.value)
                                // setSrchAreaName(e.target.label)
                            }}
                            options={
                                areaMaster?.data
                                    ?.filter((item: any) => srchZone.includes(item?.zone?.name?.toString()))
                                    ?.map((item: any) => ({
                                        value: item?.id?.toString(),
                                        label: item.name
                                    }))
                            }
                        />

                        <InputSearch
                            id="searchMeteringPointID"
                            label="Metered Point ID" // https://app.clickup.com/t/86eu0r9x8 ปรับคำว่า Metered Point Name เป็น Metered Point ID
                            type="select-multi-checkbox"
                            value={srchMeteredPointId}
                            // isCheckAll={true}
                            onChange={(e) => setSrchMeteredPointId(e.target.value)}
                            options={ // Filter Metered Point ID ยังไม่สัมพันธ์กับข้อมูลที่เลือกก่อนหน้า https://app.clickup.com/t/86eub6dba
                                (meteredPointIdMaster ? meteredPointIdMaster : [])
                                    ?.filter((item: any) => (srchZone?.length > 0 && srchZone?.lenght < dataZoneMasterZ.length) ? srchZone.includes(item?.zone_obj?.name?.toString()) : true)
                                    ?.filter((item: any) => (
                                        srchArea?.length > 0 &&
                                        srchArea?.length < areaMaster?.data?.length
                                    ) ? srchArea.includes(item?.area_obj?.id?.toString()) : true)
                                    .map((item: any) => ({
                                        // value: item.id,
                                        value: item.name,
                                        label: item.name || "",
                                    }))
                            }
                        />

                        <InputSearch
                            isDisabled={userDT?.account_manage?.[0]?.user_type_id === 3 ? true : false}
                            id="MeteringRetrievingID"
                            label={`Metering Retrieving ID`}
                            type="select"
                            customWidth={235}
                            // value={srchMeteringRetrievingId}
                            value={userDT?.account_manage?.[0]?.user_type_id === 3 ? 'Last Retrieving' : srchMeteringRetrievingId}
                            sortOptionBy="none"
                            onChange={(e) => {
                                setSrchMeteringRetrievingId(e.target.value)
                                // if (e.target.value == undefined) {
                                //     setoptionMRID((pre: any) => dataTable);
                                //     settk(!tk);
                                // }
                                if (e.target.value !== srchMeteringRetrievingId) {
                                    settriggerSrchDate(true);
                                }
                            }}
                            options={(() => {
                                const uniqueIds = new Set();
                                let choiceList = [
                                    {
                                        value: `Last Retrieving`,
                                        label: `Last Retrieving`,
                                    }
                                ];
                                (Array.isArray(optionMRID) ? optionMRID : [])
                                    .filter((item: any) => {
                                        if (item.metering_retrieving_id && !uniqueIds.has(item.metering_retrieving_id)) {
                                            uniqueIds.add(item.metering_retrieving_id);
                                            return true;
                                        }
                                        return false;
                                    })
                                    .map((item: any) => {
                                        const choiceItem = {
                                            value: item.metering_retrieving_id,
                                            label: item.metering_retrieving_id || "",
                                        }
                                        choiceList.push(choiceItem)
                                        return choiceItem
                                    });
                                return load_ ? [
                                    {
                                        value: `...waiting load process`,
                                        label: `...waiting load process`,
                                    }
                                ] : choiceList
                            })()}
                            // options={dataMasterRetrivingId?.map((item: any) => ({
                            //     value: item.metering_retrieving_id,
                            //     label: item.metering_retrieving_id || "",
                            // }))}
                            placeholder="Select Metering Retrieving ID"
                        />

                        <div className="w-auto relative">
                            <div className="text-[14px] text-[#58585A]">{"Last Retrieving Process"}</div>
                            <div className="py-[14px] text-[#17AC6B] text-[14px]">{lastRetrieving}</div>
                        </div>
                        <div className="w-auto relative">
                            <CheckboxSearch2
                                {...register('filter_sharing_meter')}
                                id="sharing_meterFilter"
                                label="Sharing Meter"
                                type="single-line"
                                value={watch('filter_sharing_meter') ? watch('filter_sharing_meter') : false}
                                onChange={(e: any) => setValue('filter_sharing_meter', e?.target?.checked)}
                            />
                        </div>

                        <div className="w-auto relative flex gap-2 items-center pl-[5px] -mt-6">
                            {/* <BtnSearch handleFieldSearch={handleFieldSearch} isDisabled={isLoading} />
                            <BtnReset handleReset={handleReset} isDisabled={isLoading} /> */}
                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                        </div>
                    </aside>
                </div>
                <div className="action-panel flex gap-3 items-end justify-end pb-[8px]">
                    <button
                        className={`${btnActionClass} bg-[#17AC6B] hover:bg-[#09995b] duration-200 ease-in-out`}
                        onClick={openTemplateForm}
                    >
                        {/* <span className="pr-[10px]">{"Template"}</span> */}
                        {/* <FileDownload sx={{ fontSize: 18, marginTop: "4px" }} /> */}

                        {/* List : เปลี่ยนปุ่มเป็น Upload  https://app.clickup.com/t/86eub6d5z */}
                        <span className="pr-[10px]">{"Upload"}</span>
                        <FileUploadRoundedIcon sx={{ fontSize: 18, marginTop: "4px" }} />
                    </button>
                    <button className={`${btnActionClass} bg-[#00ADEF] ${executeDisable && 'bg-[#AEAEAE]'}`} disabled={executeDisable}>
                        <span className="pr-[10px]"
                            onClick={openExecuteForm}
                        >
                            {"Execute"}
                        </span><Settings sx={{ fontSize: 18, marginTop: "2px" }} />
                    </button>
                </div>
            </div>

            <div className={`${cardClass}`}>
                <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    epMeretingMeteringManagement({
                                        name: 'Metering Management',
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility,
                                        // resData: paginatedData,
                                        resData: exportData,
                                    })
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                            {/* <BtnGeneral
                                textRender={"Export"}
                                iconNoRender={false}
                                modeIcon={'export'}
                                bgcolor={"#17AC6B"}
                                can_export={userPermission ? userPermission?.f_export : false}
                                // generalFunc={() => exportToExcel(filteredDataTable, "meter_mgn_export", columnVisibility)}
                                generalFunc={() => exportToExcel(exportData, "meter_mgn_export", columnVisibility)}
                            /> */}
                        </div>
                    </div>
                </div>
                <TableMtrMgn
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    filteredDataTable={filteredDataTable} // ส่งไป sort
                    setExportData={setExportData} // ส่งไป sort
                    setisLoading={setIsLoading}
                    selectedKey={selectedKey}
                    openViewForm={openViewForm}
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

            <ModalViewDetail
                mode={formMode}
                open={viewDetailOpen}
                data={viewDetailData}
                onClose={() => {
                    setViewDetailOpen(false);

                    if (resetForm) {
                        setTimeout(() => {
                            setViewDetailData(undefined);
                            setFormMode(undefined);
                            resetForm();
                        }, 200);
                    }
                }}
                setResetForm={setResetForm}
            />

            <ModalComponent
                open={isModalWarningOpen}
                handleClose={() => {
                    setExecuteDisable(false)
                    setModalWarningOpen(false)
                    setformActionOpen(false);
                }}
                stat="process"
                title="Metering Process Execution"
                description={
                    <div>
                        <div className="text-center text-[17px]">
                            {`Your request is currently being processed. `}
                        </div>
                        <div className="text-center text-[17px]">
                            {`You will be notified when it's finished.`}
                        </div>
                    </div>
                }
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

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />
        </div>
    )
}

export default ClientPage;