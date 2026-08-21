"use client";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { Tune } from "@mui/icons-material"
import SearchInput from "@/components/other/searchInput";
import { downloadService, getService, patchService, postService } from "@/utils/postService";
import { calculateSumEntries, calculateSumEntriesTwo, compareCapacityHeaders, compareFromKey7, filterStartEndDateBooking, findDateRangeBooking, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, iconButtonClass, isSameRange, sumFromKey7, toDayjs } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import ModalFiles from "./form/modalFiles";
import TablePathDetail from "./form/tablePathDetail";
import BtnGeneral from "@/components/other/btnGeneral";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CustomTooltip } from "@/components/other/customToolTip";
import ModeEditOutlineRoundedIcon from '@mui/icons-material/ModeEditOutlineRounded';
import ModalSync from "@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/divisions/form/modalSync";
import ModalUpdateStat from "./form/modalUpdateStat";
import ModalImport from "./form/modalImport";
import ModalBkComment from "./form/modalBookingVersionComment";
import { addDays, addMonths, addYears, isBefore, parseISO } from "date-fns";
import { useAppDispatch } from "@/utils/store/store";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import ModalExtend from "./form/modalExtend";
import ModalAmend from "./form/modalAmend";
import getUserValue from "@/utils/getuserValue";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import BtnExport from "@/components/other/btnExport";
import { useForm } from "react-hook-form";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import { decryptData, encryptData } from "@/utils/encryptionData";
import ColumnVisibilityPopoverMT from "@/components/other/popOverfor_mt_table";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import Spinloading from "@/components/other/spinLoading";
import TableEntry from "@/components/other/tableEntry";
import TableExit from "@/components/other/tableExit";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnSelectTable from "@/components/other/btnSelectOnTable";
import { Popover } from "@mui/material";
import BtnDetailTable from "@/components/other/btnDetailsOnTable";
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import LZString from "lz-string";

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps {
    params: {
        lng: string;
    };
}

type BookingData = {
    booking_full_json: Array<any>; // Adjust to match your data structure if needed
};

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, resetField, reset, formState: { errors }, watch, } = useForm<any>();
    const hasFetchedRef = useRef(false);
    // route มาจาก tariff
    const searchParams = useSearchParams();
    const contract_code_from_somewhere_else = searchParams.get("contract_code");
    const status_from_somewhere_else = searchParams.get("status");

    const [useParams, setuseParams] = useState<boolean>(false);

    const userDT: any = getUserValue();
    const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false);
    const [groupRowJsonState, setGroupRowJsonState] = useState<any>([])

    const [canSave, setCanSave] = useState(true); // เอาไว้เปิดปิดปุ่ม save ตอน edit tableEntry, tableExit

    // ############### Check Expand ###############
    // Contract Detail ถ้า Refresh ควรค้างอยู่ที่หน้าเดิม แต่ตอนนี้มันเด้งกลับมาที่หน้า List

    // ############### Check Authen ###############
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;
    const [userPermission, setUserPermission] = useState<any>();

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Capacity Contract Management', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Capacity Contract Management', userDT)
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

    useEffect(() => {
        getPermission();
    }, [])

    // ############### REDUX DATA ###############
    const { termTypeMaster, statCapReqMgn, areaMaster, zoneMaster, contractPointData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            // dispatch(fetchProcessType());
            // dispatch(fetchUserType());
            // dispatch(fetchNominationType());
            dispatch(fetchAreaMaster());
            dispatch(fetchZoneMasterSlice());
            dispatch(fetchContractPoint());
            // dispatch(fetchTermType());
            // dispatch(fetchStatCapReqMgnMaster());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, termTypeMaster, areaMaster, statCapReqMgn, zoneMaster, contractPointData, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);

    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

    // shipper name, contract code, contract type, contract status, status, type
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchTermType, setSrchTermType] = useState<any>([]); // contract type
    const [srchStatus, setSrchStatus] = useState<any>([]);
    const [srchContractStatus, setContractStatus] = useState<any>([]);
    const [srchType, setSrchType] = useState<any>([]);
    const [srchZone, setSrchZone] = useState('');
    const [srchArea, setSrchArea] = useState('');

    // =========== SEARCH PATH DETAIL ===========
    const [dataPeriod, setDataPeriod] = useState<any>([]);
    const [srchPeriod, setSrchPeriod] = useState<any>('');

    const [key, setKey] = useState(0);

    const renderOption: any = (data: any) => {
        let newData: any = [];
        for (let index = 0; index < data?.length; index++) {
            let checked: any = newData?.find((f: any) => f?.name == data[index]?.name);
            if (!checked) {
                newData.push({
                    id: data[index]?.id,
                    name: data[index]?.name
                })
            }
        }
        return newData
    }


    // #region confirm save
    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [modaConfirmSaveTable, setmodaConfirmSaveTable] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const handleSaveConfirm = async (data?: any) => {

        setDataSubmit(data)
        setModaConfirmSave(true)
    }

    const [optionZone, setoptionZone] = useState<any>(renderOption(zoneMaster?.data));

    // #region handleFieldSearch
    const handleFieldSearch = () => {
        let res_filtered_date: any = dataTable

        if (srchStartDate || srchEndDate) {
            res_filtered_date = filterStartEndDateBooking(dataTable, srchStartDate, srchEndDate);
        }

        const result_2 = res_filtered_date?.filter((item: any) => {
            return (
                // (srchShipper ? item?.group?.id_name == srchShipper : true) &&
                // (srchTermType ? item?.term_type_id == srchTermType : true) &&
                // (srchType ? item?.type_account_id == srchType : true) &&
                // (srchContractCode ? item?.id?.toString() == srchContractCode : true) &&
                // (srchContractStatus ? item?.status_capacity_request_management?.id == srchContractStatus : true) &&
                // (srchStatus ? item?.status_capacity_request_management_process_id == srchStatus : true)

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                (srchShipper?.length > 0 ? srchShipper.includes(item?.group?.id_name) : true) &&
                (srchTermType?.length > 0 ? srchTermType.includes(item?.term_type_id.toString()) : true) &&
                (srchType?.length > 0 ? srchType.includes(item?.type_account_id?.toString()) : true) &&
                (srchContractCode?.length > 0 ? srchContractCode.includes(item?.id?.toString()) : true) &&
                (srchContractStatus?.length > 0 ? srchContractStatus.includes(item?.status_capacity_request_management?.id?.toString()) : true) &&
                (srchStatus?.length > 0 ? srchStatus.includes(item?.status_capacity_request_management_process_id?.toString()) : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    // #region handleFieldSearchOnRoute
    const handleFieldSearchOnRoute = (contract_code: any, data_table: any) => {
        const result_2 = data_table?.filter((item: any) => {
            return (
                (contract_code ? item?.id?.toString() == contract_code : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const [dataPathDetail, setDataPathDetail] = useState<any>([]);
    const [dataPathDetailSearch, setDataPathDetailSearch] = useState<any>([]);

    const handleFieldSearchPathDetail = async () => {
        // const response_path: any = await getService(`/master/capacity/capacity-detail-period?id=${dataFile?.id}`);
        // if (!!srchPeriod && srchPeriod === "0" && srchPeriod !== "undefined" && srchPeriod !== "") {
        if (!!srchPeriod && srchPeriod !== "undefined" && srchPeriod !== "") {

            const response_path_filter = dataPathDetail?.filter((item: any) => {
                return (
                    (srchPeriod ? String(item?.period) == String(srchPeriod) : true)
                );
            });
            setDataPathDetailSearch(response_path_filter || []);
            setIsReset(false)
        } else {
            setDataPathDetailSearch([]);
            setIsReset(false)

        }
        // setIsLoading(true)
    };

    const handleReset = () => {
        setIsReset(true)
        setSrchShipper([])
        setSrchTermType([])
        setSrchType([])
        setSrchStatus([])
        setSrchArea('')
        setSrchZone('')
        setSrchContractCode([])
        setContractStatus([])
        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setSrchPeriod('')
        setDataPathDetailSearch([])
        setKey((prevKey) => prevKey + 1);
    };

    // const parseDate = (dateStr: string) => {
    //     if (!dateStr) return null;

    //     const parts = dateStr.split('/'); // Split by '/' to extract MM, DD, YYYY
    //     if (parts.length === 3) {
    //         const [month, day, year] = parts.map(Number); // Convert parts to numbers
    //         return new Date(year, month - 1, day); // Months are 0-based in JavaScript
    //     }

    //     return null; // Return null if the format is invalid
    // };

    // #region SEARCH MOTHER TABLE
    // ############### SEARCH MOTHER TABLE ###############
    const [testData, setTestData] = useState<any>([]);
    const [isReset, setIsReset] = useState<any>(false);
    const originalMomDataTable: any = useRef<BookingData | null>(null); // UseRef with type definition

    const handleSearchMotherTable = (data?: any, mode?: any, modeSearch?: any) => {

        // Store original data if it hasn't been stored yet
        if (!originalMomDataTable.current) {
            originalMomDataTable.current = { booking_full_json: [...data?.booking_full_json] }; // Store the original data with the booking_full_json
        }

        if (modeSearch === 'reset') {
            setIsReset(true)
            // Restore the original data to data.booking_full_json
            if (originalMomDataTable.current?.booking_full_json) {
                data.booking_full_json = [...originalMomDataTable.current.booking_full_json]; // Ensure deep copy if necessary
            }
            setFilteredDataTable(originalMomDataTable.current); // Reset the filtered data

            // Reset search fields
            setSrchArea('');
            setSrchZone('');
            setSrchContractCode('');
            setSrchStartDate(null);
            setSrchEndDate(null);
            setKey((prevKey) => prevKey + 1);
        } else {
            // ล่อ ลวง พราง
            setTestData(data?.booking_full_json.map((booking: any) => {
                const dataTemp = JSON.parse(booking.data_temp);
                const filteredEntryValue = dataTemp.entryValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);
                    let dateFrom: any = srchStartDate;
                    let dateTo: any = srchEndDate;

                    const condition1 = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const condition2 = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const condition3 = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                    const condition4 = (srchStartDate && !srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").format('ddd MMM DD YYYY') == dateFrom?.toDateString() : true;
                    const condition5 = (!srchStartDate && srchEndDate) ? dayjs(value["6"], "DD/MM/YYYY").format('ddd MMM DD YYYY') == dateTo?.toDateString() : true;
                    const condition6 = (srchStartDate && srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").format('ddd MMM D YYYY') >= dateFrom?.toDateString() && dayjs(value["6"], "DD/MM/YYYY").format('ddd MMM D YYYY') <= dateTo?.toDateString() : true;
                    return (condition1 && condition2 && condition3 && (condition4 || condition5 || condition6))
                }) || [];

                const filteredExitValue = dataTemp.exitValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);
                    let dateFrom: any = srchStartDate;
                    let dateTo: any = srchEndDate;

                    const condition1 = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const condition2 = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const condition3 = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;
                    const condition4 = (srchStartDate && !srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").format('ddd MMM DD YYYY') == dateFrom?.toDateString() : true;
                    const condition5 = (!srchStartDate && srchEndDate) ? dayjs(value["6"], "DD/MM/YYYY").format('ddd MMM DD YYYY') == dateTo?.toDateString() : true;
                    const condition6 = (srchStartDate && srchEndDate) ? dayjs(value["5"], "DD/MM/YYYY").format('ddd MMM D YYYY') >= dateFrom?.toDateString() && dayjs(value["6"], "DD/MM/YYYY").format('ddd MMM D YYYY') <= dateTo?.toDateString() : true;
                    return (condition1 && condition2 && condition3 && (condition4 || condition5 || condition6))
                }) || [];
                return {
                    ...booking,
                    data_temp: JSON.stringify({
                        ...dataTemp,
                        entryValue: filteredEntryValue,
                        exitValue: filteredExitValue,
                    }),
                };
            }))

            // >>>>>>>>>>>> TEST FILTER
            const filtered_data_booking_version = data?.booking_full_json?.map((booking: any) => {
                const dataTemp = JSON.parse(booking.data_temp);

                const filteredEntryValue = dataTemp.entryValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    const startFilter = srchStartDate ? dayjs(srchStartDate).startOf('day') : null;
                    const endFilter = srchEndDate ? dayjs(srchEndDate).endOf('day') : null;
                    const rowStart = dayjs(value["5"], "DD/MM/YYYY").startOf('day');
                    const rowEnd = dayjs(value["6"], "DD/MM/YYYY").startOf('day');

                    const condition1 = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const condition2 = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const condition3 = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;

                    let dateOk = true;
                    if (startFilter && !endFilter) {
                        dateOk = rowStart.isSameOrAfter(startFilter, 'day');
                    } else if (!startFilter && endFilter) {
                        dateOk = rowEnd.isSameOrBefore(endFilter, 'day');
                    } else if (startFilter && endFilter) {
                        dateOk = rowStart.isSameOrAfter(startFilter) && rowEnd.isSameOrBefore(endFilter); // range
                    }

                    return (condition1 && condition2 && condition3 && dateOk)
                }) || [];

                const filteredExitValue = dataTemp.exitValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);
                    const startFilter = srchStartDate ? dayjs(srchStartDate).startOf('day') : null;
                    const endFilter = srchEndDate ? dayjs(srchEndDate).endOf('day') : null;
                    const rowStart = dayjs(value["5"], "DD/MM/YYYY").startOf('day');
                    const rowEnd = dayjs(value["6"], "DD/MM/YYYY").startOf('day');

                    const condition1 = srchZone ? getOriginal?.zone?.name == srchZone : true;
                    const condition2 = srchArea ? getOriginal?.area?.name === srchArea : true;
                    const condition3 = srchContractCode ? getOriginal?.contract_point === srchContractCode : true;

                    let dateOk = true;
                    if (startFilter && !endFilter) {
                        dateOk = rowStart.isSameOrAfter(startFilter, 'day');
                    } else if (!startFilter && endFilter) {
                        dateOk = rowEnd.isSameOrBefore(endFilter, 'day');
                    } else if (startFilter && endFilter) {
                        dateOk = rowStart.isSameOrAfter(startFilter) && rowEnd.isSameOrBefore(endFilter); // range
                    }

                    return (condition1 && condition2 && condition3 && dateOk)

                }) || [];

                return {
                    ...booking,
                    data_temp: JSON.stringify({
                        ...dataTemp,
                        entryValue: filteredEntryValue,
                        exitValue: filteredExitValue,
                    }),
                };
            })

            data.booking_full_json = filtered_data_booking_version
        }
    }

    const getData = (data: any) => {
        const filter_contract_point = contractPointData?.data?.find((item: any) => item.contract_point === data?.trim());
        return filter_contract_point
    }

    const resetFieldsearch = () => {
        setSrchArea('');
        setSrchZone('');
        setSrchContractCode('');
        setSrchStartDate(null);
        setSrchEndDate(null);
        setKey((prevKey) => prevKey + 1);

        resetField('original_zone');
        resetField('original_area');
        resetField('summary_zone');
        resetField('summary_area');
    }

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [userData, setUserData] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [firstColStat, setFirstColStat] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataFile, setDataFile] = useState<any>([]);
    const [dataContractTermType, setDataContractTermType] = useState<any>([]);
    const [dataFileOriginal, setDataFileOriginal] = useState<any>([]);
    const [tk, settk] = useState<boolean>(false);

    const fetchData = async () => {
        console.log('1');
        try {
            setIsLoading(false)
            // fetchBookingTemplate(); // ใช้ยิงเอาข้อมูล แค่เฉพาะ modal extend

            // กรณี shipper เข้ามาเห็นของตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper(userDT?.account_manage?.[0]?.group?.id_name)
            }

            const response: any = await getService(`/master/capacity/capacity-request-management`);
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            const res_stat = await getService(`/master/capacity/status-capacity-request-management-process`);
            const res_contract_point = await getService(`/master/asset/contract-point`);
            setDataContract(res_contract_point);
            setFirstColStat(res_stat)
            setDataShipper(res_shipper_name)

            // route มาจาก tariff
            //#region LOAD DATA & FILTER
            if (contract_code_from_somewhere_else) {
                setSrchContractCode(contract_code_from_somewhere_else)
                setTimeout(() => {
                    handleFieldSearchOnRoute(contract_code_from_somewhere_else, response)
                }, 300);
            } else {
                const genFilterURL = (data: any) => {
                    if (!useParams) {

                        if (status_from_somewhere_else === "Waiting Approval" || status_from_somewhere_else === "Waiting For Approval") {
                            const status: any = status_from_somewhere_else;
                            const transferstatus: any = status == 'Waiting Approval' ? "Waiting For Approval" : status_from_somewhere_else;
                            const findStatusMaster: any = res_stat?.find((item: any) => item?.name == transferstatus)?.id;

                            const resultFilter = data?.filter((item: any) => {
                                return (
                                    (findStatusMaster ? item?.status_capacity_request_management_process_id == findStatusMaster : true)
                                );
                            });
                            return resultFilter

                        } else {
                            // Saved
                            // Confirmed
                            const status: any = status_from_somewhere_else;
                            const transferstatus: any = status == 'Saved' ? "1" : "4";

                            const resultFilter = data?.filter((item: any) => {
                                return (
                                    (transferstatus ? item?.status_capacity_request_management_id == transferstatus : true)
                                );
                            });
                            return resultFilter

                        }



                    }

                    return data
                }

                // กรองข้อมูล shipper ที่ตรงกับตัว login
                let filter_contract_only_shipper: any = []
                if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    filter_contract_only_shipper = response?.filter((item: any) => {
                        return item?.group_id === userDT?.account_manage?.[0]?.group_id
                    })

                    let result: any = status_from_somewhere_else ? genFilterURL(filter_contract_only_shipper) : filter_contract_only_shipper;

                    setData(filter_contract_only_shipper);
                    setFilteredDataTable(result);
                } else {
                    let result: any = status_from_somewhere_else ? genFilterURL(response) : response;

                    setData(response);
                    setFilteredDataTable(result);
                }

                if (status_from_somewhere_else && !useParams) {
                    if (status_from_somewhere_else === "Waiting Approval" || status_from_somewhere_else === "Waiting For Approval") {
                        const status: any = status_from_somewhere_else;
                        const transferstatus: any = status == 'Waiting Approval' ? "Waiting For Approval" : status_from_somewhere_else;
                        const findStatusMaster: any = res_stat?.find((item: any) => item?.name == transferstatus)?.id;

                        setSrchStatus(findStatusMaster?.toString());
                        setuseParams(true);

                    } else {
                        // Saved
                        // Confirmed
                        const status: any = status_from_somewhere_else;
                        const transferstatus: any = status == 'Saved' ? ["1"] : ["4"];

                        setContractStatus(transferstatus);
                        setuseParams(true);

                    }
                }
            }

            setTimeout(() => {
                setIsLoading(true);
            }, 300);

            settk(!tk);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // srchContractStatus
    // setContractStatus
    // statCapReqMgn

    // #region fetchAfterEdit
    // เอาไว้ใช้หลังจากกด edit ใน contract
    // เพื่อหา dataFile ตัวที่ update แล้วมาแสดงผล
    const fetchAfterEdit = async () => {
        console.log('2');
        setIsLoading(false)
        const response: any = await getService(`/master/capacity/capacity-request-management`);
        let id: any = localStorage.getItem("h593stk2fjcb82pa")

        let res_filtered = response?.find((item: any) => item?.id == id)
        // localStorage.setItem("h593stk2f0asc9c", JSON.stringify(res_filtered));

        // ใช้ lib lz-string บีบ เพราะบาง contract ขนาดเกิน
        const compressed = LZString.compressToUTF16(
            JSON.stringify(res_filtered)
        );
        localStorage.setItem("h593stk2f0asc9c", compressed);

        setDataFile(res_filtered)
        setDataContractTermType(res_filtered?.term_type)
    }

    // useEffect(() => {
    //     // const mode = localStorage.getItem("i0y7l2w4o8c5v9b1r3z");
    //     let mode = localStorage.getItem("i0y7l2w4o8c5v9b1r3z");
    //     mode = mode ? decryptData(mode) : null;

    //     if (mode == '"3"') {
    //         setShouldUpdateMotherTable(true)
    //         localStorage.removeItem('i0y7l2w4o8c5v9b1r3z')
    //     }
    //     console.log('.1');
    //     fetchData();
    //     setUserData(userDT?.account_manage?.[0]);
    // }, [resetForm]);


useEffect(() => {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    const initialFetch = async () => {
        let mode = localStorage.getItem("i0y7l2w4o8c5v9b1r3z");
        mode = mode ? decryptData(mode) : null;

        if (mode === '"3"') {
            setShouldUpdateMotherTable(true);
            localStorage.removeItem("i0y7l2w4o8c5v9b1r3z");
        }

        console.log(".1");

        setUserData(userDT?.account_manage?.[0]);

        await fetchData();
    };

    initialFetch();
}, []);

    // ############### LIKE SEARCH ###############
    const handleLikeSearch = (query: string, data?: any) => {
        const original_data: any = data;
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = original_data?.filter(
            (item: any) => {
                return (
                    item?.version?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.status_capacity_request_management?.name?.toLowerCase().includes(queryLower) ||
                    item?.type_account?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDate(item?.submitted_timestamp)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDateTimeSec(item?.submitted_timestamp)?.replace(/\s+/g, '')?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.contract_start_date)?.toLowerCase().includes(queryLower) ||
                    formatDateNoTime(item?.contract_end_date)?.toLowerCase().includes(queryLower)
                )
            }
        );

        setDataFile((prevDataFile: any) => ({
            ...prevDataFile,
            booking_version: filtered, // Update the `booking_version` field
        }));

        if (!query) {
            setDataFile(dataFileOriginal)
        }
        // setFilteredDataTable(filtered);
    };

    // useEffect(() => {
    //     setTimeout(() => {
    //         handleFieldSearchPathDetail()
    //     }, 100);
    // }, [])

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [modalMsg, setModalMsg] = useState<any>("");

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [formOpen, setFormOpen] = useState(false);
    const [modeShow, setModeShow] = useState<any>('');
    const [mdStatOpen, setMdStatOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const fdInterface: any = {
        hour: '',
        minute: '',
        before_gas_day: '',
        user_type_id: '',
        nomination_type_id: '',
        process_type_id: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
    };
    const [formData, setFormData] = useState(fdInterface);

    // #region update stat
    const handleFormSubmitUpdateStat = async (data: any) => {
        setIsLoadingModal(true);

        let data_patch = {
            "status_capacity_request_management_id": data?.stat_id,
            "terminate_date": data?.end_date ? data?.end_date : null,
            "shadow_time": data?.stat_id == 2 ? parseInt(data?.shadow_time) : null,
            "shadow_period": data?.stat_id == 2 ? parseInt(data?.shadow_period) : null,
            "reject_reasons": data?.reason ? data?.reason : null
        }

        try {
            // 2024-12-23 ถ้า ok โชว์ modal ให้ confirm อีกทีนึง
            let res_real_patch = await patchService(`/master/capacity/update-status-capacity-request-management/${selectedId}`, data_patch, 1200000);
            const statusCodePatch = res_real_patch?.response?.data?.statusCode ?? res_real_patch?.response?.data?.status ?? res_real_patch?.status ?? res_real_patch?.statusCode ?? res_real_patch?.code ?? res_real_patch?.response?.status;
            const errorMsgPatch = res_real_patch?.response?.data?.error ?? res_real_patch?.data?.error ?? res_real_patch?.response?.error ?? res_real_patch?.error;

            if (statusCodePatch === 400 || statusCodePatch === 500) {
                setMdStatOpen(false);
                setModalErrorMsg(errorMsgPatch || '');
                setModalErrorOpen(true);
            } else {
                const successMessages: any = {
                    4: "File has been confirmed.",
                    3: "File has been rejected.",
                    2: "File has been approved.",
                    5: "File has been terminated.",
                };
                setModalSuccessMsg(successMessages[data?.stat_id]);

                setMdStatOpen(false);
                setModalSuccessOpen(true);
            }

            if (resetForm) {
                setTimeout(() => {
                    resetForm();
                    setModeShow('')
                    setFormData(null);
                    setIsLoadingModal(false);
                }, 100);
            }
            console.log('.2');
            await fetchData();
        } catch (error) {

        }
       
    };

    // ############### CHANGE CONTRACT STATUS ###############
    const openStatForm = (mode: any, id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setModeShow(mode)
        setFormData(filteredData);
        setMdStatOpen(true)
    };

    // ############### MODAL SUBMISSION COMMENTS ###############
    const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    const [dataSubmission, setDataSubmission] = useState<any>([]);

    const openSubmissionModal = (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataSubmission(filtered ?? data)
        setMdSubmissionView(true)
    };

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);

    const openAllFileModal = (id?: any, data?: any) => {
        setDataFile(data || dataTable?.find((item: any) => item?.id == id));
        setMdFileView(true)
        settk(!tk);
    };

    // ############### MODE SHOW DATA ###############
    // 1 = table, 2 = path detail
    // const [divMode, setDivMode] = useState<any>(test_kub == '3' ? '3' : '1');
    const [divMode, setDivMode] = useState<any>('1');

    // #region open path detail
    const handlePathDetail = (id?: any, data?: any) => {
        setisLoadingPath(true);
        setSelectedId(id);
        setDataFile(data || dataTable?.find((item: any) => item?.id == id))
        setDivMode('2');
        localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('2'));
    };

    // #region contract code click
    const handleContractClick = (id?: any, row?: any) => { // โยน row เข้ามาด้วยเลย เดิมเอาแค่ id ไป filter
        if (row !== undefined) {
            // localStorage.setItem("h593stk2f0asc9c", JSON.stringify(row));
            // const sizeInBytes = new Blob([JSON.stringify(row)]).size;

            // ใช้ lib lz-string บีบ เพราะบาง contract ขนาดเกิน
            const compressed = LZString.compressToUTF16(
                JSON.stringify(row)
            );
            localStorage.setItem("h593stk2f0asc9c", compressed);
            localStorage.setItem("h593stk2fjcb82pa", id);
        }

        let data: any = { ...row };
        setDataContractTermType(data?.term_type)

        setDataFile(data)
        setDataFileOriginal(data) // เอาไว้คืนค่าเวลา like search

        // setSelectedBookingTemplate(bookingTemplateList?.find(item => item.term_type_id == data?.term_type_id)) // ย้ายไปเอาของข้างใน modal extend แทน
        setDivMode('3');
        localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('3'));
        localStorage.setItem("t9j5u3k2f0w7p1m4r6a", encryptData(Number(id)));
    };

    // ############### SYNC ###############
    const [openSync, setOpenSync] = useState<any>(false);
    const handleOpenSync = async () => {
        setOpenSync(true)

        try {
            const res_sync = await getService(`/master/capacity/sync-data-with-tpa-website`);
            if (res_sync.isSuccess) {

            }
            else {
                setModalErrorMsg(res_sync?.response?.data?.error?.message ?? "Data sync failed.");
                setModalErrorOpen(true)
            }

        } catch (err) {
            // setError(err.message);
            setModalErrorMsg("Data sync failed.");
            setModalErrorOpen(true)
        }
        finally {
            setOpenSync(false);
        }
    };

    // ############### MODAL IMPORT ###############
    const [mdImportOpen, setMdImportOpen] = useState<any>(false);
    const handleOpenImport = () => {
        setMdImportOpen(true);
    };

    // ############### MODAL AMEND ###############
    const [mdAmendOpen, setMdAmendOpen] = useState<any>(false);
    const [isAmendMode, setIsAmendMode] = useState<any>(false);
    const [amendNewContractStartDate, setAmendNewContractStartDate] = useState<any>();
    const [bookingTemplateList, setBookingTemplateList] = useState<any[]>([]);
    // const [selectedBookingTemplate, setSelectedBookingTemplate] = useState<any>();

    // #region Amend mode
    const handleAmend = async () => {
        // บังคับให้ expand version ก่อน ไม่งั้นแตก
        await handleExpand(dataFile?.booking_version?.[0]?.id)

        // แล้วค่อยเปิด modal amend
        setMdAmendOpen(true);
        // setMdImportOpen(true);
    };

    // ############### MODAL EXTEND ###############
    const [mdExtendOpen, setMdExtendOpen] = useState<any>(false);
    // #region extend contract
    const handleExtendContract = () => {
        setMdExtendOpen(true);
    };

    const present_date = new Date();
    const [isExtendEnabled, setIsExtendEnabled] = useState(false);
    const [maxDateAmendMode, setMaxDateAmendMode] = useState<any>();

    useEffect(() => {
        // if (!dataFile || Object.keys(dataFile).length === 0) {
        //     // No data in dataFile
        //     let encrypt_data_file: any = localStorage.getItem("h593stk2f0asc9c")

        //     // test ขอปิดไว้ก่อน
        //     setDataFile(JSON.parse(encrypt_data_file))
        //     return;
        // }

        if (!dataFile || Object.keys(dataFile).length === 0) {
            const raw = localStorage.getItem("h593stk2f0asc9c");

            if (!raw) {
                // ไม่มีใน storage
                // setDataFile({});
                return;
            }

            const decompressedStr = LZString.decompressFromUTF16(raw);

            if (!decompressedStr) {
                // decompress ไม่ได้ = ข้อมูลเสีย/โดนตัด/คู่ method ไม่ตรง
                localStorage.removeItem("h593stk2f0asc9c");
                // setDataFile({});
                return;
            }

            try {
                // parse ครั้งเดียวพอ (ผลลัพธ์เป็น object/array)
                const parsed = JSON.parse(decompressedStr);
                setDataFile(parsed);
            } catch (err) {
                localStorage.removeItem("h593stk2f0asc9c");
                // setDataFile({});
            }

            return;
        }

        {/* "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี */ }
        let shadowDate: any;
        // if (dataFile?.file_period_mode === 1) shadowDate = addDays(present_date, dataFile?.shadow_time);
        // if (dataFile?.file_period_mode === 2) shadowDate = addMonths(present_date, dataFile?.shadow_time);
        // if (dataFile?.file_period_mode === 3) shadowDate = addYears(present_date, dataFile?.shadow_time);

        // ถ้ามี extend_deadline ใช้ซะ, ถ้าไม่มีก็ใช้ contract_end_date
        // const extendDeadlineDate = dataFile?.extend_deadline ? parseISO(dataFile?.extend_deadline) : parseISO(dataFile?.contract_end_date);
        const extendDeadlineDate = dataFile?.extend_deadline ? parseISO(dataFile?.extend_deadline) : dataFile?.terminate_date ? parseISO(dataFile?.terminate_date) : parseISO(dataFile?.contract_end_date);
        // const isBeforeDeadline = isBefore(shadowDate, extendDeadlineDate);
        switch (dataFile?.file_period_mode) {
            case 1:
                shadowDate = addDays(extendDeadlineDate, -(dataFile?.shadow_time || 0));
                break;
            case 2:
                shadowDate = addMonths(extendDeadlineDate, -(dataFile?.shadow_time || 0));
                break;
            case 3:
                shadowDate = addYears(extendDeadlineDate, -(dataFile?.shadow_time || 0));
                break;
            default:
                shadowDate = extendDeadlineDate
                break;
        }

        // Enable button if shadowDate < extendDeadlineDate
        const isBeforeDeadline = isBefore(present_date, shadowDate)
        // // 2 == waiting for start date // 1 == Active
        const isStatusWaitForStartDate = dataFile?.status_capacity_request_management_process?.id == 2 || dataFile?.status_capacity_request_management_process?.id == 1;
        const isStatusApproved = dataFile?.status_capacity_request_management?.id === 2; // 2 == approve

        // V.2.0.109 ปุ่ม Extend จะต้อง Active ใน 2 กรณีคือ 
        // 1. สัญญา Approved แล้วแต่ยังไม่ถึง Start Date ต้องทำได้(ปัจจุบันทำได้) 
        // 2. คือสัญญาเริ่มไปแล้ว แต่ยังอยู่ในช่วงของ Shadow Time ปุ่ม Extend จะยังต้อง Active อยู่ (ปัจจุบันทำไม่ได้) และ จะต้องดูเรื่องของ Column ต่างๆด้วย จะต้องขยายตามระยะเวลาที่ Extend

        // setIsExtendEnabled(isBeforeDeadline && isStatusApproved);
        setIsExtendEnabled(isBeforeDeadline && isStatusApproved && isStatusWaitForStartDate);

        const select_booking_template = fetchBookingTemplate(); // ** ใช้นะ อย่าปิด **

        // เอาไว้ set max date period TO case Amend
        const max_date_amend = dataFile?.extend_deadline !== null
            ? dataFile?.extend_deadline
            : dataFile?.shadow_period
                ? dataFile?.status_capacity_request_management_process?.id == 1 // 1 == active
                    ? dayjs(dataFile?.contract_end_date).add(
                        dataFile?.shadow_period || 0,
                        dataFile?.term_type_id == 4
                            ? 'day'
                            : 'month'
                    ).toDate()
                    : dayjs(dataFile?.contract_start_date).add(
                        // data?.shadow_period || 0,
                        dataFile?.shadow_period || 0,
                        dataFile?.term_type_id == 4 ? 'day' : 'month' // 4 == short term non firm
                    ).add(
                        selectedBookingTemplate?.max || 0,
                        selectedBookingTemplate?.file_period_mode === 1
                            ? 'day'
                            : selectedBookingTemplate?.file_period_mode === 2
                                ? 'month'
                                : selectedBookingTemplate?.file_period_mode === 3
                                    ? 'year'
                                    : 'day' // Default to 'day' if file_period_mode is undefined
                    ).toDate()
                : dataFile?.contract_end_date

        setMaxDateAmendMode(max_date_amend)

    }, [dataFile]);

    // #region update extend
    const handleUpdateExtendContract = async (data: any) => {
        setIsLoading(false)

        // 1. Start Date ยังไม่ถึง แต่สถานะหลักขึ้น Active
        // 2. เรื่อง Extend
        // - Extend ยังไม่ถึง Start date » รัน version ใหม่
        // - Extend ที่เลย Start Date แล้ว » ขึ้น Amended

        // peyload = {
        //     "shadow_time": 1, // ของใหม่ตาม modal
        //     "shadow_period": 3, // ของใหม่ตาม modal
        //     "contract_start_date": "29/10/2025", // อันนี้ของเก่า (modal เปลี่ยนไม่ได้)
        //     "contract_end_date": "31/12/2025" // ของใหม่ตาม modal
        // }

        const { id, ...dataWithoutId } = data;
        dataWithoutId.contract_start_date = dayjs(dataWithoutId.contract_start_date, "YYYY-MM-DD").format("DD/MM/YYYY")
        dataWithoutId.contract_end_date = dayjs(dataWithoutId.contract_end_date, "YYYY-MM-DD").format("DD/MM/YYYY")

        // const raw = dataWithoutId?.contract_end_date;
        // const d = dayjs(raw, "YYYY-MM-DD", true); // parse แบบ strict
        // const isFirstOfMonth = d.date() === 1;

        // // ถ้าเป็น short term non firm ให้ -1 day
        // if (dataFile?.term_type_id == 4) {
        //     dataWithoutId.contract_end_date = d.subtract(1, "day").format("DD/MM/YYYY");
        // } else {
        //     // เช็คว่า dataWithoutId.contract_end_date เป็นวันที่ 1 ของเดือนหรือไม่ ถ้าใช่ให้ลบ 1 วัน
        //     dataWithoutId.contract_end_date = (isFirstOfMonth ? d.subtract(1, "day") : d).format("DD/MM/YYYY");
        // }

        let res_patch = await patchService(`/master/capacity/extend-capacity-request-management/${id}`, dataWithoutId);
        const statusCodePatch = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
        const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

        if (statusCodePatch === 400 || statusCodePatch === 500) {
            setMdExtendOpen(false);
            setModalErrorMsg(errorMsgPatch || '');
            setModalErrorOpen(true);
            setIsLoading(true)
        } else {
            // setModalSuccessMsg("Contract End Date has been extended.");
            setModalSuccessMsg("Contract has been extended.");
            setTimeout(() => {
                setMdExtendOpen(false);
                setModalSuccessOpen(true);
            }, 700);

            setTimeout(async () => {
                // หลังจากกด extend กลับไปหน้าแรกเลย
                setDivMode("1")
                // localStorage.setItem("i0y7l2w4o8c5v9b1r3z", '1');    
                localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('1'));
                console.log('.3');
                await fetchData();
                setIsLoading(true)
            }, 500);
        }
    }

    // #region booking template
    const [selectedBookingTemplate, setSelectedBookingTemplate] = useState<any>();

    const fetchBookingTemplate = async () => {
        try {
            const response: any = await getService(`/master/parameter/booking-template`);
            if (response && Array.isArray(response)) {
                const now = dayjs()
                const activeTemplate = response.filter(item => {
                    let isActive = true
                    const startDate = dayjs(item?.start_date)
                    isActive = toDayjs(item?.start_date).isSameOrBefore(now)
                    if (isActive == true && item?.end_date) {
                        isActive = toDayjs(item?.end_date).isSameOrAfter(now)
                    }
                    return isActive
                })
                setBookingTemplateList(activeTemplate);
                setSelectedBookingTemplate(activeTemplate?.find(item => item.term_type_id == dataFile?.term_type_id))

                return activeTemplate?.find(item => item.term_type_id == dataFile?.term_type_id)
            }
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // ############### MODAL BOOKING VERSION COMMENT ###############
    const [mdCommentOpen, setMdCommentOpen] = useState<any>(false);
    const [bookingVersionComment, setBookingVersionComment] = useState<any>([]);
    const [bookingVersionId, setBookingVersionId] = useState<any>('');
    const [commentLog, setCommentLog] = useState<any>([]);
    const handleCommentModal = (data?: any) => {
        setBookingVersionComment(data)
        setMdCommentOpen(true);
    };

    // ############### EXPAND MAIN ###############
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    // #region handle expand
    const handleExpand = (id: number) => {
        if (expandedRow !== id) {
            renderOptions(id);
        }

        setExpandedRow(expandedRow === id ? null : id);
        setSelectedButton('')

        setBookingVersionId(id)
        setSrchStartDate(null)
        setSrchEndDate(null)

        setExpandedEntry(null)
        setExpandedExit(null)
        setExpandedEntryExit(null)
    };

    // ############### EXPAND ENTRY EXIT ###############
    const [expandedEntryExit, setExpandedEntryExit] = useState<any>(null);
    const [expandedEntry, setExpandedEntry] = useState<any>(null);
    const [expandedExit, setExpandedExit] = useState<any>(null);

    // #region expand สองอัน
    const handleExpandEntryExit = (id: any, mode: any) => {
        setExpandedEntryExit(expandedEntryExit === id ? null : id);
        if (mode == 'entry') {
            setExpandedEntry(expandedEntry === id ? null : id)
            settrickerColumnEntry(false)
        } else {
            setExpandedExit(expandedExit === id ? null : id)
            settrickerColumnExit(false)
        }
    };

    // ############### BUTTON MODE ORIGINAL BOOK, SUMMARY BOOK ###############
    const [selectedButton, setSelectedButton] = useState<any>('');
    const handleButtonClick = (buttonType: any) => {
        setSelectedButton(buttonType);
        setExpandedEntry(null)
        setExpandedExit(null)
        setExpandedEntryExit(null)

        setSrchStartDate(null)
        setSrchEndDate(null)
        setKey((prevKey) => prevKey + 1);
        resetOption('all')
        // test ขอปิดไว้ก่อน
        setDataFile(dataFileOriginal)
        setIsEditing(false);
    };

    // ############### TEST DYNAMIC TABLE ###############
    const [isEditing, setIsEditing] = useState(false);
    const [isSaveClick, setIsSaveClick] = useState(false);
    const [isCancelClick, setIsCancelClick] = useState(false);
    const [modeEditing, setModeEditing] = useState<any>('');
    const [shouldUpdateMotherTable, setShouldUpdateMotherTable] = useState<boolean>(false);

    // #region handleEditClick
    const handleEditClick = (modeEdit: any, id?: any) => {
        setIstableLoading(true);

        // if (!modeEditing || modeEdit == modeEditing) {
        //     setIsEditing(!isEditing);
        //     setIsSaveClick(false)
        //     setIsAmendMode(false) // case กด amend แล้ว cancel
        // }

        setIsEditing(!isEditing);
        setIsSaveClick(false)
        setIsAmendMode(false) // case กด amend แล้ว cancel

        setModeEditing(modeEdit);

        // กด edit แล้ว expand ทั้งคู่เลย
        setExpandedEntry("entry" + id)
        setExpandedExit("exit" + id)
        setDataFile(dataFileOriginal);
        resetOption('all');

        setSrchStartDate(null)
        setSrchEndDate(null)
        setKey((prevKey) => prevKey + 1);

        setTimeout(() => {
            setIstableLoading(false);
        }, 300);

        // handleExpandEntryExit("entry" + id, 'entry')
        // handleExpandEntryExit("exit" + id, 'exit')
    };

    // #region handleCancelClick
    const handleCancelClick = (modeEdit: any) => {
        setIstableLoading(true);

        setIsSaveClick(false)
        setIsEditing(false)
        setIsAmendMode(false)
        setAmendNewContractStartDate(undefined)

        setIsCancelClick(true)
        setDataFile(dataFileOriginal)
        setModeEditing(modeEdit);

        setTimeout(() => {
            setIstableLoading(false);
        }, 300);
    };

    const [dataPostEntry, setDataPostEntry] = useState<any>([]);
    const [dataPostExit, setDataPostExit] = useState<any>([]);
    const [dataHeaderEntry, setDataHeaderEntry] = useState<any>([]);
    const [dataHeaderExit, setDataHeaderExit] = useState<any>([]);
    const [isDateChange, setIsDateChange] = useState<any>(false);
    const [isKeyAfter34Change, setIsKeyAfter34Change] = useState<any>(false);
    const [dataPostSumEntry, setDataPostSumEntry] = useState<any>(undefined);
    const [dataPostSumExit, setDataPostSumExit] = useState<any>(undefined);


    const dataPostEntryRef = useRef<any[]>([]);
    const dataPostExitRef = useRef<any[]>([]);
    const dataHeaderEntryRef = useRef<any>({});
    const dataHeaderExitRef = useRef<any>({});
    const dataPostSumEntryRef = useRef<any>();
    const dataPostSumExitRef = useRef<any>();

    const [dateFromToCheckEntry, setDateFromToCheckEntry] = useState<any>({}); // เอาไว้เก็บ from - to ของ table entry
    const [dateFromToCheckExit, setDateFromToCheckExit] = useState<any>({}); // เอาไว้เก็บ from - to ของ table exit

    useEffect(() => {
        if (shouldUpdateMotherTable) {
            let id: any = undefined
            try {
                // id = Number(localStorage.getItem("t9j5u3k2f0w7p1m4r6a"))
                id = localStorage.getItem("t9j5u3k2f0w7p1m4r6a")
                id = id ? Number(decryptData(id)) : null;

                // if (Number.isNaN(id)) {
                if (Number.isNaN(id)) {
                    id = undefined
                }
            } catch (error) {
                id = undefined
            }

            // test ขอปิดไว้ก่อน
            // handleContractClick(id || dataFile?.id)
            handleContractClick(id)
            setShouldUpdateMotherTable(false)
        }
    }, [dataTable])

    const [isLoadingCell, setisLoadingCell] = useState<boolean>(false);
    const confirmSaveClick = () => {
        setmodaConfirmSaveTable(true)
    }


    const updateDataPostEntry = (value: any) => {
        const nextValue =
            typeof value === "function"
                ? value(dataPostEntryRef.current)
                : value;

        dataPostEntryRef.current = nextValue;
        setDataPostEntry(nextValue);
    };

    const updateDataPostExit = (value: any) => {
        const nextValue =
            typeof value === "function"
                ? value(dataPostExitRef.current)
                : value;

        dataPostExitRef.current = nextValue;
        setDataPostExit(nextValue);
    };

    const updateDataHeaderEntry = (value: any) => {
        const nextValue =
            typeof value === "function"
                ? value(dataHeaderEntryRef.current)
                : value;

        dataHeaderEntryRef.current = nextValue;
        setDataHeaderEntry(nextValue);
    };

    const updateDataHeaderExit = (value: any) => {
        const nextValue =
            typeof value === "function"
                ? value(dataHeaderExitRef.current)
                : value;

        dataHeaderExitRef.current = nextValue;
        setDataHeaderExit(nextValue);
    };

    const updateDataPostSumEntry = (value: any) => {
        const nextValue =
            typeof value === "function"
                ? value(dataPostSumEntryRef.current)
                : value;

        dataPostSumEntryRef.current = nextValue;
        setDataPostSumEntry(nextValue);
    };

    const updateDataPostSumExit = (value: any) => {
        const nextValue =
            typeof value === "function"
                ? value(dataPostSumExitRef.current)
                : value;

        dataPostSumExitRef.current = nextValue;
        setDataPostSumExit(nextValue);
    };


    const toSafeNumber = (value: any): number => {
        if (
            value === null ||
            value === undefined ||
            String(value).trim() === ""
        ) {
            return 0;
        }

        const numberValue = Number(
            String(value)
                .replace(/,/g, "")
                .trim()
        );

        return Number.isFinite(numberValue) ? numberValue : 0;
    };

    const buildCapacityMap = (
        header: Record<string, any>,
        sumRow: Record<string, any>
    ) => {
        const result: Record<string, number> = {};

        // เทียบเฉพาะ Header ที่ Entry และ Exit มีเหมือนกัน
        const compareHeaders = [
            "Capacity Daily Booking (MMBTU/d)",
            "Maximum Hour Booking (MMBTU/h)",
        ];

        compareHeaders.forEach((groupName) => {
            const groupHeader = header?.[groupName];

            if (!groupHeader || typeof groupHeader !== "object") {
                return;
            }

            Object.entries(groupHeader).forEach(([periodName, config]) => {
                if (periodName === "key") return;

                const dataKey = (config as any)?.key;

                if (dataKey === null || dataKey === undefined) {
                    return;
                }

                const mapKey = `${groupName}__${periodName}`;

                result[mapKey] = toSafeNumber(
                    sumRow?.[String(dataKey)]
                );
            });
        });

        return result;
    };

    // #region save click
    // const handleSaveClick = async (modeEdit?: any) => {
    //     setisLoadingCell(true)
    //     setIsEditing(!isEditing);
    //     setIsSaveClick(true)

    const handleSaveClick = async (modeEdit?: any) => {
        setisLoadingCell(true);
        setIsSaveClick(true);

        // ใช้ค่าล่าสุดจาก ref ไม่ใช้ state จาก render เก่า
        const latestEntry = structuredClone(dataPostEntryRef.current || []);
        const latestExit = structuredClone(dataPostExitRef.current || []);

        const latestHeaderEntry = structuredClone(
            dataHeaderEntryRef.current || {}
        );

        const latestHeaderExit = structuredClone(
            dataHeaderExitRef.current || {}
        );

        const latestSumEntry = structuredClone(
            dataPostSumEntryRef.current ?? {}
        );

        const latestSumExit = structuredClone(
            dataPostSumExitRef.current ?? {}
        );

        // 15125 : Edit Original Capacity แก้ไขข้อมูลในคอลัมน์ Pressure Range และ Temperature Range แล้วระบบขึ้นแจ้งเตือน ซึ่งจริงๆแล้ว ค่าตรงนี้แก้เป็นเท่าไหร่ก็ได้ ไม่ต้องจับว่า Entry ต้องเท่ากับ Exit ไม่ต้องมีแจ้งเตือน https://app.clickup.com/t/86er96an6
        // เขียนเช็คว่าถ้าไม่ได้ edit ข้อมูลหลัง key 34 ให้ save ไปเลย

        let data_file_copy = JSON.parse(JSON.stringify(dataFile))
        // console.log('dataFileOriginal', dataFileOriginal);
        // console.log('dataHeaderEntry', dataHeaderEntry)
        // console.log('dataHeaderExit', dataHeaderExit)
        // console.log('dataPostEntry', dataPostEntry)
        // console.log('dataPostExit', dataPostExit)

        // const date_range_res = findDateRangeBooking(dataPostEntry, dataPostExit);
        const date_range_res = findDateRangeBooking(latestEntry, latestExit);
        const booking_version_find = data_file_copy?.booking_version?.find((item: any) => item?.id == bookingVersionId)

        let booking_full_json_data_temp = JSON.parse(booking_version_find?.booking_full_json?.[0]?.data_temp);

        // ENTRY
        // booking_full_json_data_temp.entryValue = dataPostEntry // ✅
        // // booking_full_json_data_temp.sumEntries = calculateSumEntriesTwo(dataPostEntry) // ✅
        // booking_full_json_data_temp.sumEntries = dataPostSumEntry

        booking_full_json_data_temp.entryValue = latestEntry;
        booking_full_json_data_temp.sumEntries = latestSumEntry;

        booking_full_json_data_temp.headerEntry = {
            "Period": { "From": { "key": "5" }, "To": { "key": "6" }, "key": "5" }, // ✅
            "Entry": {
                "Pressure Range": { "Max": { "key": "2" }, "Min": { "key": "1" }, "key": "1" }, // ✅
                "Temperature Range": { "Max": { "key": "4" }, "Min": { "key": "3" }, "key": "3" }, // ✅
                "key": "0" // ✅
            },
            // "Capacity Daily Booking (MMBTU/d)": dataHeaderEntry["Capacity Daily Booking (MMBTU/d)"], // ✅ 
            // "Maximum Hour Booking (MMBTU/h)": dataHeaderEntry["Maximum Hour Booking (MMBTU/h)"], // ✅
            // "Capacity Daily Booking (MMscfd)": dataHeaderEntry["Capacity Daily Booking (MMscfd)"], // ✅
            // "Maximum Hour Booking (MMscfh)": dataHeaderEntry["Maximum Hour Booking (MMscfh)"], // ✅
            "Capacity Daily Booking (MMBTU/d)":
                latestHeaderEntry["Capacity Daily Booking (MMBTU/d)"],

            "Maximum Hour Booking (MMBTU/h)":
                latestHeaderEntry["Maximum Hour Booking (MMBTU/h)"],

            "Capacity Daily Booking (MMscfd)":
                latestHeaderEntry["Capacity Daily Booking (MMscfd)"],

            "Maximum Hour Booking (MMscfh)":
                latestHeaderEntry["Maximum Hour Booking (MMscfh)"],
        }

        // EXIT
        // booking_full_json_data_temp.exitValue = dataPostExit // ✅
        // // booking_full_json_data_temp.sumExits = calculateSumEntriesTwo(dataPostExit) // ✅
        // booking_full_json_data_temp.sumExits = dataPostSumExit
        booking_full_json_data_temp.exitValue = latestExit;
        booking_full_json_data_temp.sumExits = latestSumExit;

        booking_full_json_data_temp.headerExit = {
            "Period": { "From": { "key": "5" }, "To": { "key": "6" }, "key": "5" }, // ✅
            "Exit": {
                "Pressure Range": { "Max": { "key": "2" }, "Min": { "key": "1" }, "key": "1" }, // ✅
                "Temperature Range": { "Max": { "key": "4" }, "Min": { "key": "3" }, "key": "3" }, // ✅
                "key": "0" // ✅
            },
            // "Capacity Daily Booking (MMBTU/d)": dataHeaderExit["Capacity Daily Booking (MMBTU/d)"], // ✅
            // "Maximum Hour Booking (MMBTU/h)": dataHeaderExit["Maximum Hour Booking (MMBTU/h)"], // ✅
            "Capacity Daily Booking (MMBTU/d)": latestHeaderExit["Capacity Daily Booking (MMBTU/d)"],
            "Maximum Hour Booking (MMBTU/h)": latestHeaderExit["Maximum Hour Booking (MMBTU/h)"],
        }

        let entryCount = 0
        let exitCount = 0
        let updatedBookingRowJson2 = JSON.parse(JSON.stringify(booking_version_find?.booking_row_json))?.map((item: any, index: any) => {
            const { entry_exit_id, contract_point, data_temp, area_text, zone_text, ...nItem } = item
            let ndata_temp = null;
            let narea_text = null;
            let nzone_text = null;
            let ncontract_point = null;

            if (entry_exit_id === 1) {
                let dataPostEntryIndex = entryCount;

                if (latestEntry[dataPostEntryIndex]) {
                    const currentEntry = latestEntry[dataPostEntryIndex];

                    const filter_contract_point = contractPointData?.data?.find(
                        (items: any) =>
                            items?.contract_point === currentEntry["0"]
                    );

                    ndata_temp = JSON.stringify(currentEntry);
                    narea_text = filter_contract_point?.area?.name || "nodata";
                    nzone_text = filter_contract_point?.zone?.name || "nodata";
                    ncontract_point = currentEntry["0"];
                }
                entryCount += 1
            } else if (entry_exit_id === 2) {
                let dataPostExitIndex = exitCount;

                // if (dataPostExit[dataPostExitIndex]) {
                //     const filter_contract_point = contractPointData?.data?.find((items: any) => items?.contract_point === dataPostExit[dataPostExitIndex]["0"]);

                //     ndata_temp = JSON.stringify(dataPostExit[dataPostExitIndex]);
                //     narea_text = filter_contract_point?.area ? filter_contract_point?.area?.name : 'nodata';
                //     nzone_text = filter_contract_point?.zone ? filter_contract_point?.zone?.name : 'nodata';
                //     ncontract_point = dataPostExit[dataPostExitIndex]["0"];

                // }
                if (latestExit[dataPostExitIndex]) {
                    const currentExit = latestExit[dataPostExitIndex];

                    const filter_contract_point = contractPointData?.data?.find(
                        (items: any) =>
                            items?.contract_point === currentExit["0"]
                    );

                    ndata_temp = JSON.stringify(currentExit);
                    narea_text = filter_contract_point?.area?.name || "nodata";
                    nzone_text = filter_contract_point?.zone?.name || "nodata";
                    ncontract_point = currentExit["0"];
                }
                exitCount += 1
            }

            return {
                ...nItem,
                data_temp: ndata_temp,
                area_text: narea_text,
                zone_text: nzone_text,
                contract_point: ncontract_point,
                entry_exit_id: entry_exit_id,
            };
        });

        // เอาไว้ POST
        // จัด data_post ตรงนี้เลย
        let body_post = {
            "flagFromTo": isDateChange, // ✅
            "terminateDate": isAmendMode ? amendNewContractStartDate : null, // ✅
            "fromDate": date_range_res?.minStartDate, // ✅
            "toDate": date_range_res?.maxEndDate, // ✅
            "booking_full_json": [
                {
                    "id": booking_version_find?.booking_full_json?.[0]?.id, // ✅
                    "data_temp": JSON.stringify(booking_full_json_data_temp), // ✅
                    "booking_version_id": booking_version_find?.booking_full_json?.[0]?.booking_version_id, // ✅
                    "create_date": booking_version_find?.booking_full_json?.[0]?.create_date, // ✅
                    "update_date": booking_version_find?.booking_full_json?.[0]?.update_date, // ✅
                    "create_date_num": booking_version_find?.booking_full_json?.[0]?.create_date_num, // ✅
                    "update_date_num": booking_version_find?.booking_full_json?.[0]?.update_date_num, // ✅
                    "create_by": booking_version_find?.booking_full_json?.[0]?.create_by, // ✅
                    "update_by": booking_version_find?.booking_full_json?.[0]?.update_by, // ✅
                    "flag_use": booking_version_find?.booking_full_json?.[0]?.flag_use // ✅
                }
            ],
            "booking_row_json": updatedBookingRowJson2 // ✅
        }

        // ======== ตรงนี้เอาไว้เช็คจำนวนเดือน Period Entry & Exit is NOT match ========
        // const entryObj = dataHeaderEntry["Capacity Daily Booking (MMBTU/d)"];
        // const exitObj = dataHeaderExit["Capacity Daily Booking (MMBTU/d)"];
        const entryObj =
            latestHeaderEntry["Capacity Daily Booking (MMBTU/d)"];

        const exitObj =
            latestHeaderExit["Capacity Daily Booking (MMBTU/d)"];

        const res_compare_entry_exit_period = compareCapacityHeaders(entryObj, exitObj);

        // ======== ตรงนี้เอาไว้เช็ค Total Entry & Total Exit is NOT match ========
        // // const sumEntryByKey = sumFromKey7(dataPostEntry);
        // // const sumExitByKey = sumFromKey7(dataPostExit);
        // // const sumEntryByKey = sumFromKey7([dataPostSumEntry]);
        // // const sumExitByKey = sumFromKey7([dataPostSumExit]);
        // const sumEntryByKey = sumFromKey7([latestSumEntry]);
        // const sumExitByKey = sumFromKey7([latestSumExit]);

        // // const commonKeys = Object.keys(sumEntryByKey).filter(k => k in sumExitByKey && k != '0'); // หาคีย์เท่าที่มีตรงกัน
        // // const isEqual = commonKeys.every(k => Math.trunc(sumEntryByKey[k]) === Math.trunc(sumExitByKey[k])); // เช็คว่าค่าเท่ากันหมดป่าว คร่าว ๆ ไม่เอาทศนิยม
        // const commonKeys = Object.keys(sumEntryByKey).filter(
        //     key => key !== "0" && key in sumExitByKey
        // );

        // const isEqual = commonKeys.every(key => {
        //     const entryValue = Number(sumEntryByKey[key] ?? 0);
        //     const exitValue = Number(sumExitByKey[key] ?? 0);

        //     return Math.trunc(entryValue) === Math.trunc(exitValue);
        // });
        const entryCapacityMap = buildCapacityMap(
            latestHeaderEntry,
            latestSumEntry
        );

        const exitCapacityMap = buildCapacityMap(
            latestHeaderExit,
            latestSumExit
        );

        // เทียบเฉพาะ key ที่มีอยู่ทั้ง Entry และ Exit
        const commonCompareKeys = Object.keys(entryCapacityMap).filter(
            (key) => key in exitCapacityMap
        );

        const mismatchList = commonCompareKeys
            .map((key) => {
                const entryValue = entryCapacityMap[key];
                const exitValue = exitCapacityMap[key];

                return {
                    key,
                    entryValue,
                    exitValue,
                    equal:
                        Math.abs(entryValue - exitValue) < 0.001,
                };
            })
            .filter((item) => !item.equal);

        const isEqual =
            commonCompareKeys.length > 0 &&
            mismatchList.length === 0;


        // ........ตรงนี้

        // ======== USE NA BRO
        if (!res_compare_entry_exit_period?.equal) {
            setModalErrorMsg("Period Entry & Exit is NOT match.");
            setModalErrorOpen(true)
            setisLoadingCell(false);

            return;
        }

        if (!isEqual) {
            // setModalErrorMsg("Total Entry & Total Exit is NOT match.");
            // setModalErrorOpen(true)
            console.table(mismatchList);
            const firstMismatch = mismatchList[0];

            const [capacityName, periodName] =
                firstMismatch.key.split("__");

            setModalErrorMsg(
                `${capacityName} (${periodName}) is NOT match. ` +
                `Entry: ${firstMismatch.entryValue.toLocaleString()} / ` +
                `Exit: ${firstMismatch.exitValue.toLocaleString()}`
            );

            setModalErrorOpen(true);
            setisLoadingCell(false);
            return;
        } else {

            let res_edit = await postService(`/master/capacity/edit-version/${expandedRow}`, body_post);
            const statusCode = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
            const errorMsg = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

            // if (res_edit?.response?.data?.status === 400 || res_edit?.response?.data?.status === 500 || res_edit?.response?.data?.statusCode === 500) {
            if ([400, 401, 403, 412, 500].includes(Number(statusCode))) {
                setFormOpen(false);
                // setModalErrorMsg(res_edit?.response?.data?.error ? res_edit?.response?.data?.error : "Total Entry & Total Exit is NOT match.");
                setModalErrorMsg(errorMsg ? errorMsg : "Total Entry & Total Exit is NOT match.");
                setModalErrorOpen(true)
            } else {
                // setFormOpen(false);
                setShouldUpdateMotherTable(true)
                setExpandedRow(null)
                setExpandedEntryExit(null)
                setExpandedEntry(null)
                setExpandedExit(null)
                console.log('.4');
                await fetchData();
                await fetchAfterEdit(); // เพื่อยัด dataFile ใหม่ ที่หน้าดู contract version จะได้มีของใหม่ขึ้นมา

                // setIsEditing(!isEditing);
                setIsEditing(false);
                setModalSuccessMsg('Your changes have been saved.')
                setModalSuccessOpen(true);
                setDataPostEntry([])
                setDataPostExit([])

                dataPostEntryRef.current = [];
                dataPostExitRef.current = [];
                dataPostSumEntryRef.current = undefined;
                dataPostSumExitRef.current = undefined;

                setDataPostEntry([]);
                setDataPostExit([]);
                setDataPostSumEntry(undefined);
                setDataPostSumExit(undefined);
            }
        }

        setIsAmendMode(false) // case กด amend แล้ว save
        setisLoadingCell(false);
    };

    const handleExportByVersion = async (version: any) => {
        // selectedButton == original || summary

        if (selectedButton == 'original') {
            try {
                const res_download = await downloadService(`/master/capacity/capacity-request-management-download/${version?.id}`, '', `${dataFile?.contract_code || ''}_${version?.version || ''}.xlsx`);
            } catch (error) {

            }
        } else {
            try {
                const res_download = await downloadService(`/master/capacity/capacity-request-management-download-summary/${version?.id}`, '', `${dataFile?.contract_code || ''}_${version?.version || ''}.xlsx`);
            } catch (error) {

            }
        }
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    // const [itemsPerPage, setItemsPerPage] = useState(10);
    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    // const paginatedData = Array.isArray(filteredDataTable)
    //     ? filteredDataTable.slice(
    //         (currentPage - 1) * itemsPerPage,
    //         currentPage * itemsPerPage
    //     )
    //     : [];

    // #region DUPLICATE
    // ############### DUPLICATE ###############
    const handleDuplicate = async (itemId: any) => {
        // Duplicate clicked
        let res_duplicate = await postService(`/master/capacity/duplicate-version/${itemId}`, {});
        const statusCode = res_duplicate?.response?.data?.statusCode ?? res_duplicate?.response?.data?.status ?? res_duplicate?.status ?? res_duplicate?.statusCode ?? res_duplicate?.code ?? res_duplicate?.response?.status;
        const errorMsg = res_duplicate?.response?.data?.error ?? res_duplicate?.data?.error ?? res_duplicate?.response?.error ?? res_duplicate?.error;

        if (statusCode === 400 || statusCode === 500) {
            setFormOpen(false);
            // setModalErrorMsg(res_duplicate?.response?.data?.error);
            setModalErrorMsg(errorMsg ? errorMsg : '');
            setModalErrorOpen(true)
        } else {
            console.log('.5');
            await fetchData();
            const response: any = await getService(`/master/capacity/capacity-request-management`);

            const filteredData = response?.find((item: any) => item.id === dataFile?.id);

            setFormOpen(false);
            setModalSuccessMsg('Successfully duplicated.')
            setModalSuccessOpen(true);

            setDataFile((prevData: any) => ({
                ...prevData,
                booking_version: filteredData?.booking_version,
            }));
        }
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'status', label: 'Contract Status', visible: true },
        { key: 'contract_type', label: 'Contract Type', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'submitted_ts', label: 'Submitted Timestamp', visible: true },
        { key: 'contract_start_date', label: 'Contract Start Date', visible: true },
        { key: 'contract_end_date', label: 'Contract End Date', visible: true },
        { key: 'terminate_date', label: 'Terminate Date', visible: true },
        { key: 'extend_deadline', label: 'Extend Deadline', visible: true },
        { key: 'id_name', label: 'Shipper ID', visible: true },
        { key: 'name', label: 'Shipper Name', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'contract_status', label: 'Action', visible: true },
        { key: 'update_contract_status', label: 'Update Contract Status', visible: true },
        { key: 'submission_comment', label: 'Submission Comment', visible: userData?.user_type_id == 3 ? false : true },
        { key: 'file', label: 'File', visible: true },
        { key: 'path_detail', label: 'Path Detail', visible: userData?.user_type_id == 3 ? false : true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // List ---> เฉพาะ Shipper จะไม่เห็น Column Submission Comment และ Path Detail https://app.clickup.com/t/86eqy9nt5
    const adjustedColumns = userData?.user_type_id == 3 ? initialColumns.filter((column: any) => !['submission_comment', 'path_detail'].includes(column.key)) : initialColumns;
    const [columnVisibility, setColumnVisibility] = useState<any>(
        // Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
        Object.fromEntries(adjustedColumns.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(adjustedColumns.map((column: any) => [column.key, column.visible])))
    }, [userData])

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ############### COLUMN SHOW/HIDE ###############
    const generateColumnVisibility = (columns: any) => Object.fromEntries(columns.map(({ key, visible }: any) => [key, visible]));

    const [initialColumnsDynamicEntry_New, setinitialColumnsDynamicEntry_New] = useState([
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'pressure_range', label: 'Pressure Range', visible: true },
        { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        { key: 'temperature_range', label: 'Temperature Range', visible: true },
        { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/D)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/H)', visible: true },
        { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMSCFD)', visible: true },
        { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMSCFH)', visible: true },
    ]);

    const [initialColumnsDynamicExit_New, setinitialColumnsDynamicExit_New] = useState([
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'contract_point', label: 'Contract Point', visible: true },
        { key: 'pressure_range', label: 'Pressure Range', visible: true },
        { key: 'Pressure Range.Min', label: 'Pressure Range Min', visible: true, parent_id: 'pressure_range' },
        { key: 'Pressure Range.Max', label: 'Pressure Range Max', visible: true, parent_id: 'pressure_range' },
        { key: 'temperature_range', label: 'Temperature Range', visible: true },
        { key: 'Temperature Range.Min', label: 'Temperature Range Min', visible: true, parent_id: 'temperature_range' },
        { key: 'Temperature Range.Max', label: 'Temperature Range Max', visible: true, parent_id: 'temperature_range' },
        { key: 'period', label: 'Period', visible: true },
        { key: 'From', label: 'Period From', visible: true, parent_id: 'period' },
        { key: 'To', label: 'Period To', visible: true, parent_id: 'period' },
        { key: 'capacity_daily_booking_mmbtu', label: 'Capacity Daily Booking (MMBTU/D)', visible: true },
        { key: 'maximum_hour_booking_mmbtu', label: 'Maximum Hour Booking (MMBTU/H)', visible: true },
        // { key: 'capacity_daily_booking_mmscfd', label: 'Capacity Daily Booking (MMscfd)', visible: true },
        // { key: 'maximum_hour_booking_mmscfd', label: 'Maximum Hour Booking (MMscfh)', visible: true },
    ])

    const [columnVisibilityEntry_New, setColumnVisibilityEntry_New] = useState(generateColumnVisibility(initialColumnsDynamicEntry_New));
    const [columnVisibilityExit_New, setColumnVisibilityExit_New] = useState(generateColumnVisibility(initialColumnsDynamicExit_New));
    const [anchorElEntry, setAnchorElEntry] = useState<null | HTMLElement>(null);
    const openEntry = Boolean(anchorElEntry);

    const [anchorElExit, setAnchorElExit] = useState<null | HTMLElement>(null);
    const openExit = Boolean(anchorElExit);

    const handleTogglePopoverEntry = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElEntry(anchorElEntry ? null : event.currentTarget);
    };

    const handleTogglePopoverExit = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElExit(anchorElExit ? null : event.currentTarget);
    };

    const handleColumnToggleEntry_New = (columnKey: string) => {
        let dataFilter: any = initialColumnsDynamicEntry_New;
        let filterCheckedparent: any = dataFilter?.filter((f: any) => f?.parent_id == columnKey);
        let checkAboutParant: any = dataFilter?.find((f: any) => f?.key == columnKey);
        if (filterCheckedparent?.length > 0) {
            for (let index = 0; index < filterCheckedparent?.length; index++) {
                let findIDX: any = dataFilter?.find((fx: any) => fx?.key == filterCheckedparent[index]?.key);
                if (findIDX) {
                    setColumnVisibilityEntry_New((prev: any) => ({
                        ...prev,
                        [findIDX?.key]: !prev[columnKey]
                    }));
                }
            }
        }

        if (checkAboutParant?.parent_id) {
            let getParent: any = checkAboutParant?.parent_id;
            let findAboutParent: any = columnVisibilityEntry_New[getParent];
            let findAboutThis: any = columnVisibilityEntry_New[columnKey];
            let filterAboutParent: any = dataFilter?.filter((f: any) => f?.parent_id == getParent);
            if (findAboutParent == true) {
                let checkedParentFalse: any = 0;
                for (let index = 0; index < filterAboutParent?.length; index++) {
                    let checkedItem: any = columnVisibilityEntry_New[filterAboutParent[index]?.key];
                    if (filterAboutParent[index]?.key == columnKey) {
                        checkedParentFalse = findAboutThis == true ? checkedParentFalse + 1 : checkedParentFalse;
                    } else {
                        checkedParentFalse = checkedItem == false ? checkedParentFalse + 1 : checkedParentFalse;
                    }
                }

                if (checkedParentFalse == filterAboutParent?.length) {
                    setColumnVisibilityEntry_New((prev: any) => ({
                        ...prev,
                        [getParent]: !prev[getParent]
                    }));
                }
            } else if (findAboutParent == false && findAboutThis == false) {
                setColumnVisibilityEntry_New((prev: any) => ({
                    ...prev,
                    [getParent]: !prev[getParent]
                }));
            }
        }

        setColumnVisibilityEntry_New((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
        settk(!tk);
    };

    const handleColumnToggleExit_New = (columnKey: string) => {
        let dataFilter: any = initialColumnsDynamicExit_New;
        let filterCheckedparent: any = dataFilter?.filter((f: any) => f?.parent_id == columnKey);
        let checkAboutParant: any = dataFilter?.find((f: any) => f?.key == columnKey);
        if (filterCheckedparent?.length > 0) {
            for (let index = 0; index < filterCheckedparent?.length; index++) {
                let findIDX: any = dataFilter?.find((fx: any) => fx?.key == filterCheckedparent[index]?.key);
                if (findIDX) {
                    setColumnVisibilityExit_New((prev: any) => ({
                        ...prev,
                        [findIDX?.key]: !prev[columnKey]
                    }));
                }
            }
        }

        if (checkAboutParant?.parent_id) {
            let getParent: any = checkAboutParant?.parent_id;
            let findAboutParent: any = columnVisibilityExit_New[getParent];
            let findAboutThis: any = columnVisibilityExit_New[columnKey];
            let filterAboutParent: any = dataFilter?.filter((f: any) => f?.parent_id == getParent);
            if (findAboutParent == true) {
                let checkedParentFalse: any = 0;
                for (let index = 0; index < filterAboutParent?.length; index++) {
                    let checkedItem: any = columnVisibilityExit_New[filterAboutParent[index]?.key];
                    if (filterAboutParent[index]?.key == columnKey) {
                        checkedParentFalse = findAboutThis == true ? checkedParentFalse + 1 : checkedParentFalse;
                    } else {
                        checkedParentFalse = checkedItem == false ? checkedParentFalse + 1 : checkedParentFalse;
                    }
                }

                if (checkedParentFalse == filterAboutParent?.length) {
                    setColumnVisibilityExit_New((prev: any) => ({
                        ...prev,
                        [getParent]: !prev[getParent]
                    }));
                }
            } else if (findAboutParent == false && findAboutThis == false) {
                setColumnVisibilityExit_New((prev: any) => ({
                    ...prev,
                    [getParent]: !prev[getParent]
                }));
            }
        }

        setColumnVisibilityExit_New((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
        settk(!tk);
    };

    // v1.0.90 Contract Management Filter รายการใน Contract detail ให้แสดง Zone/Area/Contract Point เฉพาะที่เกี่ยวข้องกับ Contract นั้น https://app.clickup.com/t/86ervrxh0
    const [dataZoneMaster, setDataZoneMaster] = useState<any>([]);
    const [dataAreaMaster, setDataAreaMaster] = useState<any>([]);
    const [dataContractMaster, setDataContractMaster] = useState<any>([]);

    useEffect(() => {
        // if (dataFile || Object?.keys(dataFile)?.length === 0) {
        if (!dataFile || Object.keys(dataFile).length === 0) {

            const areaTextsInUse = new Set(dataFile?.booking_version?.flatMap((version: any) => version.booking_row_json)?.map((row: any) => row.area_text));
            const filteredAreaMasterData = (areaMaster?.data && Array.isArray(areaMaster?.data) ? areaMaster?.data : []).filter((area: any) => areaTextsInUse.has(area.name));
            setDataAreaMaster(filteredAreaMasterData)

            const zoneTextsInUse = new Set(dataFile?.booking_version?.flatMap((version: any) => version.booking_row_json)?.map((row: any) => row.zone_text));
            const seenZone = new Set<string>();
            const filteredZoneMasterData = (zoneMaster?.data && Array.isArray(zoneMaster?.data) ? zoneMaster?.data : []).filter((item: any) => {
                const name = item?.name;
                if (zoneTextsInUse.has(name) && !seenZone.has(name)) {
                    seenZone.add(name);
                    return true;
                }
                return false;
            });

            setDataZoneMaster(filteredZoneMasterData)

            const contractPointTextsInUse = new Set(dataFile?.booking_version?.flatMap((version: any) => version.booking_row_json)?.map((row: any) => row.contract_point));
            const filteredContractPointMasterData = contractPointData?.data?.filter((item: any) => contractPointTextsInUse.has(item.contract_point));
            setDataContractMaster(filteredContractPointMasterData)
        }
    }, [dataFile])

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

    const togglePopover = (id: any, anchor: any) => {

        if (openPopoverId === id) {

            setOpenPopoverId(null); // Close the popover if it's already open
            setAnchorPopover(null)
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
            if (anchor) {
                setAnchorPopover(anchor)
            }
            else {
                setAnchorPopover(null)
            }
        }

        settk(!tk)
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
            setAnchorPopover(null)
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        openStatForm(mode, id);
        setOpenPopoverId(null);
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    const renderPermission: any = () => {
        let permission: any = undefined;
        try {
            // const updatedUserPermission = generateUserPermission(user_permission);
            // permission = updatedUserPermission;

            permission = findRoleConfigByMenuName('Capacity Contract Management', userDT)

        } catch (error) {
            // Failed to parse user_permission:
        }

        return permission
    }

    const getRowdata: any = (id: any) => {
        const findData: any = dataTable?.find((item: any) => item?.id == id);
        return findData
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "status",
                header: "Contract Status",
                // header: () => (
                //     <div className="text-center w-full">Status</div>
                // ),
                // meta: { title: 'Status' },
                width: 180,
                enableSorting: true,
                accessorFn: (row: any) => row?.status_capacity_request_management_process?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management_process?.color) }}>{row?.status_capacity_request_management_process?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "contract_type",
                header: "Contract Type",
                width: 120,
                enableSorting: true,
                accessorFn: (row: any) => row?.term_type?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            {row?.term_type &&
                                <div className="flex min-w-[180px] max-w-[250px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>
                                    {`${row?.term_type?.name}`}
                                </div>
                            }
                        </div>
                    )
                }
            },
            {
                accessorKey: "contract_code",
                header: "Contract Code",
                enableSorting: true,
                width: 200,
                accessorFn: (row: any) => row?.contract_code || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span
                                onClick={() => handleContractClick(row?.id, row)}
                                className="cursor-pointer underline text-[#1473A1]"
                            >
                                {row?.contract_code || '-'}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "submitted_ts",
                header: "Submitted Timestamp",
                enableSorting: true,
                accessorFn: (row: any) => formatDate(row?.submitted_timestamp) || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.submitted_timestamp ? formatDate(row?.submitted_timestamp) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "contract_start_date",
                header: "Contract Start Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.contract_start_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>{row?.contract_start_date ? formatDateNoTime(row?.contract_start_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "contract_end_date",
                header: "Contract End Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.contract_end_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-[#0DA2A2]">{row?.contract_end_date ? formatDateNoTime(row?.contract_end_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "terminate_date",
                header: "Terminate Date",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.terminate_date) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-[#0DA2A2]">{row?.terminate_date ? formatDateNoTime(row?.terminate_date) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "extend_deadline",
                header: "Extend Deadline",
                enableSorting: true,
                accessorFn: (row: any) => formatDateNoTime(row?.extend_deadline) || '',
                sortingFn: myCustomSortingByDateFn,
                // sortingFn: 'datetime', // recommended for date columns 
                // sortUndefined: -1,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="text-[#0DA2A2]">{row?.extend_deadline ? formatDateNoTime(row?.extend_deadline) : ''}</div>
                    )
                }
            },
            {
                accessorKey: "id_name",
                header: "Shipper ID",
                enableSorting: true,
                width: 150,
                accessorFn: (row: any) => row?.group?.id_name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group && row?.group?.id_name}</div>)
                }
            },
            {
                accessorKey: "name",
                header: "Shipper Name",
                enableSorting: true,
                width: 150,
                accessorFn: (row: any) => row?.group?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (<div>{row?.group && row?.group?.name}</div>)
                }
            },
            {
                accessorKey: "type",
                header: "Type",
                width: 100,
                enableSorting: true,
                accessorFn: (row: any) => row?.type_account?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center text-center">
                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.type_account?.color) }}>{row?.type_account?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "contract_status",
                header: "Action",
                width: 150,
                enableSorting: true,
                accessorFn: (row: any) => row?.status_capacity_request_management?.name || '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div className="flex justify-center items-center">
                            <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(row?.status_capacity_request_management?.color) }}>{row?.status_capacity_request_management?.name}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "update_contract_status",
                header: "Update Contract Status",
                width: 200,
                align: 'center',
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original;
                    // const getPermission: any = renderPermission();
                    return (
                        <div className="flex justify-center items-center">
                            <div className="relative inline-block text-left">
                                <BtnSelectTable
                                    togglePopover={togglePopover}
                                    row_id={row?.id}
                                    isDisable={row?.status_capacity_request_management.id == 3 || row?.status_capacity_request_management.id == 5 ? true : false}
                                />
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "submission_comment",
                header: "Submission Comment",
                width: 200,
                align: 'center',
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <div className="flex justify-center items-center">
                            <div className="relative inline-block text-left ">
                                <BtnDetailTable
                                    openSubmissionModal={(id: any) => openSubmissionModal(id, row)}
                                    row_id={row?.id}
                                    disable={getPermission?.f_view == true ? false : true}
                                />
                            </div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "file",
                header: "File",
                align: 'center',
                accessorFn: (row) => row?.file_capacity_request_management?.length || '',
                enableSorting: false,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <div
                            className="inline-flex items-center justify-center relative"
                        // onClick={() => {
                        //     if (getPermission?.f_view == true) {
                        //         openAllFileModal(row?.id, row)
                        //     }
                        // }}
                        >
                            {/* <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
                                disabled={getPermission?.f_view == true ? false : true}
                            >
                                <AttachFileRoundedIcon sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
                            </button> */}

                            <button
                                type="button"
                                aria-label="Open files"
                                onClick={() => openAllFileModal(row?.id, row)}
                                disabled={getPermission?.f_view == true ? false : true}
                                className={iconButtonClass}
                            >
                                <AttachFileRoundedIcon
                                    fontSize="inherit"
                                    className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                                    sx={{ color: 'currentColor', fontSize: 18 }}
                                />
                            </button>
                            <span className="px-2 text-[#464255]">
                                {row?.file_capacity_request_management?.length}
                            </span>
                        </div>
                    )
                }
            },
            {
                accessorKey: "path_detail",
                header: "Path Detail",
                width: 100,
                enableSorting: false,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original;
                    const getPermission: any = renderPermission();
                    return (
                        <div
                            className="w-full flex items-center justify-center relative"
                        >
                            <button
                                type="button"
                                className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#809F2C66] relative"
                                disabled={getPermission?.f_view == true ? false : true}
                                onClick={() => handlePathDetail(row?.id, row)}
                            >
                                <TimelineRoundedIcon sx={{ fontSize: 18, color: '#809F2C', '&:hover': { color: '#ffffff' } }} />
                            </button>
                        </div>
                    )
                }
            },
        ],
        []
    )

    useEffect(() => {
        if (dataPeriod?.length > 0) {
            setSrchPeriod(String(dataPeriod?.[0]?.value))
            if (dataPeriod?.[0]?.value || dataPeriod?.[0]?.value === 0) {

                const response_path_filter = dataPathDetail?.filter((item: any) => {
                    return (
                        (dataPeriod?.[0]?.value ? String(item?.period) == String(dataPeriod?.[0]?.value) : true)
                    );
                });
                setDataPathDetailSearch(response_path_filter || []);
                setIsReset(false)
            } else {
                setDataPathDetailSearch([]);
                setIsReset(false)

            }
        }
    }, [dataPeriod])


    // ใช้กับ popover
    const actions = React.useMemo(() => {
        const actionsMap: any = {
            1: { // Saved <--- status_capacity_request_management
                3: [
                    { label: "Approved", action: "approve" },
                    { label: "Rejected", action: "reject" },
                ],
                1: [
                    { label: "Confirmed", action: "confirm" },
                    { label: "Approved", action: "approve" },
                    { label: "Rejected", action: "reject" },
                ],
            },
            4: { // Confirmed <--- status_capacity_request_management
                1: [
                    { label: "Approved", action: "approve" },
                    { label: "Rejected", action: "reject" },
                ],
            },
            2: { // Approved <--- status_capacity_request_management
                3: [
                    { label: "Rejected", action: "reject" },
                    { label: "Terminated", action: "terminate" },
                ],
                1: [
                    { label: "Rejected", action: "reject" },
                    { label: "Terminated", action: "terminate" },
                ],
            },
        };

        const rowData = getRowdata(openPopoverId);
        const statusId = rowData?.status_capacity_request_management?.id;
        const accountId = rowData?.type_account?.id;

        const contractStartDate = new Date(rowData?.contract_start_date);
        const presentDate = new Date();

        let list = actionsMap[statusId]?.[accountId] || [];

        // V.2.0.109 กรณีที่สัญญายังไม่ start แล้วเป็นสถานะ approved ให้ขึ้นแค่ reject ไม่ต้องขึ้น terminate [terminate จะขึ้นแค่ตอนที่สัญญาเริ่มไปแล้วเท่านั้น] https://app.clickup.com/t/86euzxxgc
        if (rowData?.status_capacity_request_management?.id == 2 && rowData?.status_capacity_request_management_process?.id == 2) {
            list = list.filter((x: any) => x.action !== "terminate");
        }

        // หมายเหตุ: เงื่อนไขนี้คือ "ถ้าเริ่มสัญญาแล้ว (อดีต)" จะตัด reject ออก
        // ถ้าต้องการ "อนาคตจึงตัด" ให้สลับเป็น contractStartDate > presentDate
        if (contractStartDate < presentDate) {
            list = list.filter((x: any) => x.action !== "reject");
        }

        return list;
    }, [openPopoverId]);

    useEffect(() => {
        if (anchorPopover && actions.length === 0) {
            setAnchorPopover(null);
        }
    }, [anchorPopover, actions.length]);

    useEffect(() => {
        // divMode = 3 คือ click contract code
        if (divMode == '3') {
            // ถ้า dataFile ไม่มี ต้องไปหามาใส่
            // if (dataFile == undefined) {
            //     let encrypt_data_file: any = localStorage.getItem("h593stk2f0asc9c")
            //     // let decry_data_file = encrypt_data_file ? decryptData(encrypt_data_file) : null;

            //     // test ขอปิดไว้ก่อน
            //     setDataFile(JSON.parse(encrypt_data_file))
            // }

            if (dataFile === undefined) {
                const raw = localStorage.getItem("h593stk2f0asc9c");

                if (!raw) {
                    setDataFile({});
                    return;
                }

                const decompressedStr = LZString.decompressFromUTF16(raw);

                if (!decompressedStr) {
                    // decompress ไม่ได้ = ข้อมูลเสีย/โดนตัด/คู่ method ไม่ตรง
                    localStorage.removeItem("h593stk2f0asc9c");
                    setDataFile({});
                    return;
                }

                try {
                    const parsed = JSON.parse(decompressedStr);
                    setDataFile(parsed);
                } catch (e) {
                    localStorage.removeItem("h593stk2f0asc9c");
                    setDataFile({});
                }
            }
        }

    }, [divMode])

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

    const [istableLoading, setIstableLoading] = useState<boolean>(false);

    //#region SEARCH ITEM
    const handleSearchItem = async (
        dataItem: any,
        mode: 'entry' | 'exit' | 'all',
        modeSearch?: 'reset',
    ) => {
        const searchMode: any = mode;


        //#ห้ามลบ ==> อธิบาย {=====================================================
        // ใช้ state ตัวเดียวกัน แต่แยก type คือ entryValue | exitValue
        // มี state ที่ใช้ สำหรับ all คือ srchStartDate | srchEndDate ไว้ใช้สำหรับ search from กับ to
        // มี state ที่ใช้ คือ selectedZone | selectedArea | selectedContract สำหรับ filter แบบแยก Entry กับ Exit
        // =======================================================================}

        //ดึง data contractpoint
        const getData = (data: any) => {
            const filter_contract_point = contractPointData?.data?.find((item: any) => item?.contract_point === data?.trim());
            return filter_contract_point
        }

        //แปลง data เอาไว้ใช้เรนเดอร์ header
        const reMaping = (datamap: any) => {
            let result = datamap?.map(([columnName, subcolumnsObj]: any) => {
                return {
                    columns: columnName,
                    subcolumns: subcolumnsObj as any  // ให้เป็น object เดิม
                };
            });
            return result
        }

        //หา key ที่เกี่ยวข้อง
        const renderKey = (datamap: any, columns: any) => {
            // columns == dateTableColumns
            let keygen: any = [];
            datamap?.length > 0 && datamap?.map((item: any) => {
                let bypassColumns = [
                    'Capacity Daily Booking (MMBTU/d)',
                    'Capacity Daily Booking (MMscfd)',
                    'Maximum Hour Booking (MMBTU/h)',
                    'Maximum Hour Booking (MMscfh)',
                ]

                if (bypassColumns?.find((f: any) => f == item?.columns)) {
                    columns?.length > 0 && columns?.map((date: any) => {
                        keygen.push(item?.subcolumns[date]?.key)
                    })
                }
            })

            return keygen
        }

        function getDatesBetween(startDateStr: string, endDateStr: string, mode: 'date' | 'month'): string[] {
            const result: string[] = [];

            const [startDay, startMonth, startYear] = startDateStr?.split('/').map(Number);
            const [endDay, endMonth, endYear] = endDateStr?.split('/').map(Number);

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

        function convertHeaderArrayToObject(headerArray: any[]) {
            const result: Record<string, any> = {};

            headerArray.forEach(item => {
                if (item.columns && item.subcolumns) {
                    result[item.columns] = item.subcolumns;
                }
            });

            return result;
        }

        //หาวันจาก filter from กับ to
        function filterHeaderByDates(headerArray: any[], dateTableColumns: string[]) {
            return headerArray.map((item: any) => {
                const subcolumnsKeys = Object.keys(item.subcolumns);

                // ตรวจสอบว่าอย่างน้อย 1 key ใน subcolumns เป็นวันที่ที่อยู่ใน dateTableColumns
                const hasDateKeys = subcolumnsKeys.some(key => dateTableColumns.includes(key));

                // ถ้ามี key ที่ตรงกับ dateTableColumns → กรอง
                if (hasDateKeys) {
                    const filteredSubcolumns: Record<string, any> = {};

                    for (const dateKey of subcolumnsKeys) {
                        if (dateTableColumns.includes(dateKey)) {
                            filteredSubcolumns[dateKey] = item.subcolumns[dateKey];
                        }
                    }

                    return {
                        ...item,
                        subcolumns: {
                            ...filteredSubcolumns,
                            key: item?.subcolumns?.key
                        }
                    };
                }

                // ถ้าไม่มี key ที่เป็นวันที่เลย → return subcolumns เดิม
                return item;
            });
        }

        const newData: any = dataItem;
        const originalData: any = dataFileOriginal?.booking_version?.find((item: any) => item?.id == newData?.id)
        const dataTableItem: any = dataFile?.booking_version?.find((item: any) => item?.id == newData?.id)

        let originalBooking: any;

        // แยกดึง data ระหว่าง original | summary
        if (selectedButton == 'original') {
            originalBooking = originalData?.booking_full_json;
        } else if (selectedButton == 'summary') {
            originalBooking = originalData?.booking_full_json_release[0]?.data_temp ? originalData?.booking_full_json_release : originalData?.booking_full_json;
        }

        if (modeSearch == 'reset') {
            setIstableLoading(true);
            // handleResetField(resetMode == 'filterDate' ? 'filterDate' : 'filterSub');

            let resultFilter: any = [];

            if (mode == 'entry' || mode == 'exit') {
                if (mode == 'entry') {
                    resultFilter = originalBooking?.map((item: any) => {

                        const tempData = JSON?.parse(item?.data_temp);

                        let preiod_start: any = null //start date
                        let preiod_end: any = null //end date

                        const filteredValueENTRY = tempData?.entryValue

                        const filteredValueEXIT = tempData?.exitValue?.filter((value: any) => {
                            let getOriginal: any = getData(value["0"]);

                            let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                            let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                            preiod_start = srch_start_date || value["5"] //start date
                            preiod_end = srch_end_date || value["6"] //end date

                            const conditionZone = selectedZone['exitValue'] ? getOriginal?.zone?.name == selectedZone['exitValue'] : true;
                            const conditionArea = selectedArea['exitValue'] ? getOriginal?.area?.name === selectedArea['exitValue'] : true;
                            const conditionContract = selectedContract['exitValue'] ? getOriginal?.contract_point === selectedContract['exitValue'] : true;
                            return conditionZone && conditionArea && conditionContract
                        })

                        let dateTableColumns: any = [];

                        if (dataContractTermType?.id == 4) {
                            dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                        } else {
                            dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                        }

                        const headerDateColumnsENTRY = Object.entries(tempData?.headerEntry);
                        const headerDateColumnsEXIT = Object.entries(tempData?.headerExit);

                        const headerDateArrayENTRY = reMaping(headerDateColumnsENTRY);
                        const headerDateArrayEXIT = reMaping(headerDateColumnsEXIT);

                        const resultFilterDateArrayENTRY = filterHeaderByDates(headerDateArrayENTRY, dateTableColumns);
                        const resultFilterDateArrayEXIT = filterHeaderByDates(headerDateArrayEXIT, dateTableColumns);

                        let getKeydateColumnENTRY: any = renderKey(resultFilterDateArrayENTRY, dateTableColumns);
                        let getKeydateColumnEXIT: any = renderKey(resultFilterDateArrayEXIT, dateTableColumns);

                        const resultFilteredValueENTRY = filteredValueENTRY?.map((item: any) => {
                            return filterByKey([item], getKeydateColumnENTRY);
                        })

                        const resultFilteredValueEXIT = filteredValueEXIT?.map((item: any) => {
                            return filterByKey([item], getKeydateColumnEXIT);
                        })

                        const updateHeaderENTRY: any = convertHeaderArrayToObject(resultFilterDateArrayENTRY)
                        const updateHeaderEXIT: any = convertHeaderArrayToObject(resultFilterDateArrayEXIT)

                        return {
                            ...item,
                            data_temp: JSON.stringify({
                                ...tempData,
                                entryValue: resultFilteredValueENTRY,
                                exitValue: resultFilteredValueEXIT,
                                headerEntry: updateHeaderENTRY,
                                headerExit: updateHeaderEXIT,
                            }),
                        };
                    })

                    resetOption('entry')
                } else if (mode == 'exit') {
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

                            const conditionZone = selectedZone['entryValue'] ? getOriginal?.zone?.name == selectedZone['entryValue'] : true;
                            const conditionArea = selectedArea['entryValue'] ? getOriginal?.area?.name === selectedArea['entryValue'] : true;
                            const conditionContract = selectedContract['entryValue'] ? getOriginal?.contract_point === selectedContract['entryValue'] : true;
                            return conditionZone && conditionArea && conditionContract
                        })

                        const filteredValueEXIT = tempData?.exitValue;

                        let dateTableColumns: any = [];

                        if (dataContractTermType?.id == 4) {
                            dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                        } else {
                            dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                        }

                        const headerDateColumnsENTRY = Object.entries(tempData?.headerEntry);
                        const headerDateColumnsEXIT = Object.entries(tempData?.headerExit);

                        const headerDateArrayENTRY = reMaping(headerDateColumnsENTRY);
                        const headerDateArrayEXIT = reMaping(headerDateColumnsEXIT);

                        const resultFilterDateArrayENTRY = filterHeaderByDates(headerDateArrayENTRY, dateTableColumns);
                        const resultFilterDateArrayEXIT = filterHeaderByDates(headerDateArrayEXIT, dateTableColumns);

                        let getKeydateColumnENTRY: any = renderKey(resultFilterDateArrayENTRY, dateTableColumns);
                        let getKeydateColumnEXIT: any = renderKey(resultFilterDateArrayEXIT, dateTableColumns);

                        const resultFilteredValueENTRY = filteredValueENTRY?.map((item: any) => {
                            return filterByKey([item], getKeydateColumnENTRY);
                        })

                        const resultFilteredValueEXIT = filteredValueEXIT?.map((item: any) => {
                            return filterByKey([item], getKeydateColumnEXIT);
                        })

                        const updateHeaderENTRY: any = convertHeaderArrayToObject(resultFilterDateArrayENTRY)
                        const updateHeaderEXIT: any = convertHeaderArrayToObject(resultFilterDateArrayEXIT)

                        return {
                            ...item,
                            data_temp: JSON.stringify({
                                ...tempData,
                                entryValue: resultFilteredValueENTRY,
                                exitValue: resultFilteredValueEXIT,
                                headerEntry: updateHeaderENTRY,
                                headerExit: updateHeaderEXIT,
                            }),
                        };
                    })

                    resetOption('exit')
                }

                await setValueTable(resultFilter);

                if (mode == 'entry') {
                    settrickerColumnEntry(false);
                } else if (mode == 'exit') {
                    settrickerColumnExit(false);
                }
            } else if (mode == 'all') {
                resultFilter = originalBooking?.map((item: any) => {

                    const tempData = JSON?.parse(item?.data_temp);

                    const filteredValueENTRY = tempData?.entryValue?.filter((value: any) => {
                        let getOriginal: any = getData(value["0"]);

                        const conditionZone = selectedZone['entryValue'] ? getOriginal?.zone?.name == selectedZone['entryValue'] : true;
                        const conditionArea = selectedArea['entryValue'] ? getOriginal?.area?.name === selectedArea['entryValue'] : true;
                        const conditionContract = selectedContract['entryValue'] ? getOriginal?.contract_point === selectedContract['entryValue'] : true;
                        return conditionZone && conditionArea && conditionContract
                    })

                    const filteredValueEXIT = tempData?.exitValue?.filter((value: any) => {
                        let getOriginal: any = getData(value["0"]);

                        const conditionZone = selectedZone['exitValue'] ? getOriginal?.zone?.name == selectedZone['exitValue'] : true;
                        const conditionArea = selectedArea['exitValue'] ? getOriginal?.area?.name === selectedArea['exitValue'] : true;
                        const conditionContract = selectedContract['exitValue'] ? getOriginal?.contract_point === selectedContract['exitValue'] : true;
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

                await setValueTable(resultFilter);

                setSrchStartDate(null)
                setSrchEndDate(null)
                setKey((prevKey) => prevKey + 1);
            }

            await setValueTable(resultFilter);

            settrickerColumnEntry(false);
            settrickerColumnExit(false);

            setTimeout(() => {
                setIstableLoading(false);
            }, 300);
        } else if (searchMode == 'entry' || searchMode == 'exit') {
            setIstableLoading(true);
            let resultFilter: any = [];

            resultFilter = originalBooking?.map((item: any) => {

                const tempData = JSON?.parse(item?.data_temp);

                let preiod_start: any = null //start date
                let preiod_end: any = null //end date

                //หาค่าที่เกี่ยวข้องกับ filter ที่ Entry
                const filteredValueENTRY = tempData?.entryValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                    let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                    preiod_start = srch_start_date || value["5"] //start date
                    preiod_end = srch_end_date || value["6"] //end date

                    const conditionZone = selectedZone['entryValue'] ? getOriginal?.zone?.name == selectedZone['entryValue'] : true;
                    const conditionArea = selectedArea['entryValue'] ? getOriginal?.area?.name === selectedArea['entryValue'] : true;
                    const conditionContract = selectedContract['entryValue'] ? getOriginal?.contract_point === selectedContract['entryValue'] : true;
                    return conditionZone && conditionArea && conditionContract
                })

                //หาค่าที่เกี่ยวข้องกับ filter ที่ Exit
                const filteredValueEXIT = tempData?.exitValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                    let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                    preiod_start = srch_start_date || value["5"] //start date
                    preiod_end = srch_end_date || value["6"] //end date

                    const conditionZone = selectedZone['exitValue'] ? getOriginal?.zone?.name == selectedZone['exitValue'] : true;
                    const conditionArea = selectedArea['exitValue'] ? getOriginal?.area?.name === selectedArea['exitValue'] : true;
                    const conditionContract = selectedContract['exitValue'] ? getOriginal?.contract_point === selectedContract['exitValue'] : true;
                    return conditionZone && conditionArea && conditionContract
                })

                let dateTableColumns: any = [];

                // ถ้าเป็น short term(non-firm) จะเป็นรูปแบบวัน
                if (dataContractTermType?.id == 4) {
                    dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                } else {
                    dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                }

                const headerDateColumnsENTRY = Object.entries(tempData?.headerEntry);
                const headerDateColumnsEXIT = Object.entries(tempData?.headerExit);

                const headerDateArrayENTRY = reMaping(headerDateColumnsENTRY);
                const headerDateArrayEXIT = reMaping(headerDateColumnsEXIT);

                const resultFilterDateArrayENTRY = filterHeaderByDates(headerDateArrayENTRY, dateTableColumns);
                const resultFilterDateArrayEXIT = filterHeaderByDates(headerDateArrayEXIT, dateTableColumns);

                let getKeydateColumnENTRY: any = renderKey(resultFilterDateArrayENTRY, dateTableColumns);
                let getKeydateColumnEXIT: any = renderKey(resultFilterDateArrayEXIT, dateTableColumns);

                const resultFilteredValueENTRY = filteredValueENTRY?.map((item: any) => {
                    return filterByKey([item], getKeydateColumnENTRY);
                })

                const resultFilteredValueEXIT = filteredValueEXIT?.map((item: any) => {
                    return filterByKey([item], getKeydateColumnEXIT);
                })

                const updateHeaderENTRY: any = convertHeaderArrayToObject(resultFilterDateArrayENTRY)
                const updateHeaderEXIT: any = convertHeaderArrayToObject(resultFilterDateArrayEXIT)

                return {
                    ...item,
                    data_temp: JSON.stringify({
                        ...tempData,
                        entryValue: resultFilteredValueENTRY,
                        exitValue: resultFilteredValueEXIT,
                        headerEntry: updateHeaderENTRY,
                        headerExit: updateHeaderEXIT,
                    }),
                };
            })

            await setValueTable(resultFilter);

            setTimeout(() => {
                setIstableLoading(false);
            }, 300);

            //set-tricker
            if (mode == 'entry') {
                settrickerColumnEntry(false);
            } else if (mode == 'exit') {
                settrickerColumnExit(false);
            }
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

                    const conditionZone = selectedZone['entryValue'] ? getOriginal?.zone?.name == selectedZone['entryValue'] : true;
                    const conditionArea = selectedArea['entryValue'] ? getOriginal?.area?.name === selectedArea['entryValue'] : true;
                    const conditionContract = selectedContract['entryValue'] ? getOriginal?.contract_point === selectedContract['entryValue'] : true;
                    return conditionZone && conditionArea && conditionContract
                })

                const filteredValueEXIT = tempData?.exitValue?.filter((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    let srch_start_date = srchStartDate ? dayjs(srchStartDate).format('DD/MM/YYYY') : null
                    let srch_end_date = srchEndDate ? dayjs(srchEndDate).format('DD/MM/YYYY') : null

                    preiod_start = srch_start_date || value["5"] //start date
                    preiod_end = srch_end_date || value["6"] //end date

                    const conditionZone = selectedZone['exitValue'] ? getOriginal?.zone?.name == selectedZone['exitValue'] : true;
                    const conditionArea = selectedArea['exitValue'] ? getOriginal?.area?.name === selectedArea['exitValue'] : true;
                    const conditionContract = selectedContract['exitValue'] ? getOriginal?.contract_point === selectedContract['exitValue'] : true;
                    return conditionZone && conditionArea && conditionContract
                })

                let dateTableColumns: any = [];

                if (dataContractTermType?.id == 4) {
                    dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'date')
                } else {
                    dateTableColumns = getDatesBetween(preiod_start, preiod_end, 'month')
                }

                const headerDateColumnsENTRY = Object.entries(tempData?.headerEntry);
                const headerDateColumnsEXIT = Object.entries(tempData?.headerExit);

                const headerDateArrayENTRY = reMaping(headerDateColumnsENTRY);
                const headerDateArrayEXIT = reMaping(headerDateColumnsEXIT);

                const resultFilterDateArrayENTRY = filterHeaderByDates(headerDateArrayENTRY, dateTableColumns);
                const resultFilterDateArrayEXIT = filterHeaderByDates(headerDateArrayEXIT, dateTableColumns);

                let getKeydateColumnENTRY: any = renderKey(resultFilterDateArrayENTRY, dateTableColumns);
                let getKeydateColumnEXIT: any = renderKey(resultFilterDateArrayEXIT, dateTableColumns);

                const resultFilteredValueENTRY = filteredValueENTRY?.map((item: any) => {
                    return filterByKey([item], getKeydateColumnENTRY);
                })

                const resultFilteredValueEXIT = filteredValueEXIT?.map((item: any) => {
                    return filterByKey([item], getKeydateColumnEXIT);
                })

                const updateHeaderENTRY: any = convertHeaderArrayToObject(resultFilterDateArrayENTRY)
                const updateHeaderEXIT: any = convertHeaderArrayToObject(resultFilterDateArrayEXIT)

                return {
                    ...item,
                    data_temp: JSON.stringify({
                        ...tempData,
                        entryValue: resultFilteredValueENTRY,
                        exitValue: resultFilteredValueEXIT,
                        headerEntry: updateHeaderENTRY,
                        headerExit: updateHeaderEXIT,
                    }),
                };
            })

            await setValueTable(resultFilter);

            setTimeout(() => {
                setIstableLoading(false);
            }, 300);

            settrickerColumnEntry(false);
            settrickerColumnExit(false);
        }
    }

    const setValueTable = (resultFilter: any) => {
        const loadData = dataFileOriginal;

        // const findItemTable = loadData?.booking_version?.map((item: any) => {
        //     const checkMatch = item?.booking_full_json?.every((a: any) => resultFilter?.some((b: any) => b?.id === a?.id));
        //     if (checkMatch == true) {
        //         return {
        //             ...item,
        //             booking_full_json: resultFilter?.flat(),
        //         };
        //     } else {
        //         return item
        //     }
        // })

        const findItemTable = loadData?.booking_version?.map((item: any) => {
            if (selectedButton == 'original') {
                const checkMatch = item?.booking_full_json?.every((a: any) => resultFilter?.some((b: any) => b?.id === a?.id));
                if (checkMatch == true) {
                    return {
                        ...item,
                        booking_full_json: resultFilter?.flat(),
                    };
                } else {
                    return item
                }
            } else if (selectedButton == 'summary') {
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

        // setDataFile(loadData)
        settk((pre) => !pre)
        setTimeout(() => {
            setDataFile((prev: any) => ({
                ...prev,
                booking_version: findItemTable
            }));
        }, 0);
    }

    const [trickerColumnEntry, settrickerColumnEntry] = useState<any>(false);
    const [trickerColumnExit, settrickerColumnExit] = useState<any>(false);

    const [masterOptions, setmasterOptions] = useState<any>();

    type selectedType = {
        entryValue: any;
        exitValue: any;
    };

    const [selectedZone, setselectedZone] = useState<selectedType>({
        entryValue: undefined,
        exitValue: undefined
    });

    const [selectedArea, setselectedArea] = useState<selectedType>({
        entryValue: undefined,
        exitValue: undefined
    });

    const [selectedContract, setselectedContract] = useState<selectedType>({
        entryValue: undefined,
        exitValue: undefined
    });

    const [selectedkey, setselectedkey] = useState(0);

    const resetOption = (type: 'entry' | 'exit' | 'all') => {
        switch (type) {
            case "entry":
                setselectedZone((prev: selectedType) => ({
                    ...prev,
                    entryValue: undefined,
                    exitValue: prev?.exitValue
                }));

                setselectedArea((prev: selectedType) => ({
                    ...prev,
                    entryValue: undefined,
                    exitValue: prev?.exitValue
                }));

                setselectedContract((prev: selectedType) => ({
                    ...prev,
                    entryValue: undefined,
                    exitValue: prev?.exitValue
                }));
                break;
            case "exit":
                setselectedZone((prev: selectedType) => ({
                    ...prev,
                    entryValue: prev?.entryValue,
                    exitValue: undefined
                }));

                setselectedArea((prev: selectedType) => ({
                    ...prev,
                    entryValue: prev?.entryValue,
                    exitValue: undefined
                }));

                setselectedContract((prev: selectedType) => ({
                    ...prev,
                    entryValue: prev?.entryValue,
                    exitValue: undefined
                }));
                break;
            case "all":
                setselectedZone((prev: selectedType) => ({
                    ...prev,
                    entryValue: undefined,
                    exitValue: undefined
                }));

                setselectedArea((prev: selectedType) => ({
                    ...prev,
                    entryValue: undefined,
                    exitValue: undefined
                }));

                setselectedContract((prev: selectedType) => ({
                    ...prev,
                    entryValue: undefined,
                    exitValue: undefined
                }));
                break;
        }

        settk(!tk);
        setselectedkey((prevKey) => prevKey + 1);
    }

    const renderOptions = (id: any) => {
        const originalData: any = dataFile?.booking_version?.find((item: any) => item?.id == id);

        // / getmaster
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
            entryValue: {
                zoneOptions: [],
                areaOptions: [],
                contractOptions: [],
            },
            exitValue: {
                zoneOptions: [],
                areaOptions: [],
                contractOptions: [],
            }
        };

        //render option
        originalData?.booking_full_json?.length > 0 && originalData?.booking_full_json?.map((item: any) => {
            const tempData = JSON?.parse(item?.data_temp);

            const typeMaping = ['entryValue', 'exitValue'];

            typeMaping?.map((type: any) => {
                let typeValue: any = type == 'entryValue' ? 'entry' : type == 'exitValue' && 'exit'
                tempData[type] && tempData[type]?.map((value: any) => {
                    let getOriginal: any = getData(value["0"]);

                    let filterZoneOption = zoneMaster?.data?.filter((item: any) => item?.name == getOriginal?.zone?.name && item?.entry_exit?.name?.toLowerCase() == typeValue)
                    let filterAreaOption = areaMaster?.data?.filter((item: any) => item?.name == getOriginal?.area?.name && item?.entry_exit?.name?.toLowerCase() == typeValue)
                    let filterContractOption = contractPointData?.data?.filter((item: any) => item?.id == getOriginal?.id && item?.entry_exit?.name?.toLowerCase() == typeValue)

                    let checkZoneOption = checkdupOption(filterZoneOption, resultOption[type]?.zoneOptions, 'id')
                    let checkAreaOption = checkdupOption(filterAreaOption, resultOption[type]?.areaOptions, 'id')
                    let checkContractOption = checkdupOption(filterContractOption, resultOption[type]?.contractOptions, 'id')

                    if (checkZoneOption == false) {
                        resultOption[type].zoneOptions.push(...filterZoneOption?.flat())
                    }

                    if (checkAreaOption == false) {
                        resultOption[type].areaOptions.push(...filterAreaOption?.flat())
                    }

                    if (checkContractOption == false) {
                        resultOption[type].contractOptions.push(...filterContractOption?.flat())
                    }
                })
            })
        })

        setmasterOptions(resultOption);
    }

    // เอาไว้เช็คเปิดปิดปุ่ม save เคสเปลี่ยนวันที่แล้วดันไม่ตรงกัน
    useEffect(() => {
        const same = isSameRange(dateFromToCheckEntry, dateFromToCheckExit);
        setCanSave(same)
    }, [dateFromToCheckEntry, dateFromToCheckExit])

    const [isLoadingPath, setisLoadingPath] = useState<boolean>(true);

    // v1.0.90 เคส Amended โดยกด Import ตรง Contract detail พอขึ้น success แล้วของไม่ขึ้นทันที ต้อง refresh 
    useEffect(() => {
        if (modalSuccessMsg == 'File has been uploaded.') {
            const fetchDataAfterUpload = async () => {
                await fetchAfterEdit(); // เพื่อยัด dataFile ใหม่ ที่หน้าดู contract version จะได้มีของใหม่ขึ้นมา
            }
            fetchDataAfterUpload();
        }
    }, [modalSuccessMsg])

    useEffect(() => {
      console.log('dataFile : ', dataFile);
    }, [dataFile])

    useEffect(() => {
        console.log('isExtendEnabled : ', isExtendEnabled);
    }, [isExtendEnabled])
    

    return (
        <div className=" space-y-2">
            {/* MAIN TABLE */}
            {divMode === "1" && (
                <>
                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                            <DatePickaSearch
                                key={"start" + key}
                                label="Contract Start Date"
                                placeHolder="Select Contract Start Date"
                                allowClear
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                            />

                            <DatePickaSearch
                                key={"end" + key}
                                label="Contract End Date"
                                placeHolder="Select Contract End Date"
                                allowClear
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                            />

                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                // type="select"
                                type="select-multi-checkbox"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                value={srchShipper}
                                onChange={(e) => setSrchShipper(e.target.value)}
                                // options={dataShipper
                                //     ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                //         userDT?.account_manage?.[0]?.user_type_id == 3
                                //             ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                //             : true
                                //     )
                                //     .map((item: any) => ({
                                //         // value: item.name,
                                //         value: item.id_name,
                                //         label: item.name,
                                //     }))
                                // }
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        // value: item.name,
                                        value: item.id_name,
                                        label: item.name,
                                    }))
                                }
                            // options={Array.isArray(dataShipper) ? dataShipper
                            //     ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                            //         userDT?.account_manage?.[0]?.user_type_id == 3
                            //             ? item?.id === userDT?.account_manage?.[0]?.group?.id
                            //             : true
                            //     )
                            //     .map((item: any) => ({
                            //         value: item.id_name,
                            //         label: item.name,
                            //     }))
                            //     : []
                            // }
                            />

                            <InputSearch
                                id="searchContractCode"
                                label="Contract Code"
                                // type="select"
                                type="select-multi-checkbox"
                                value={srchContractCode}
                                onChange={(e) => setSrchContractCode(e.target.value)}
                                // options={dataTable
                                //     ?.filter((item: any) => {
                                //         return (
                                //             userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true &&
                                //                 srchShipper ? item?.group?.id_name == srchShipper : true
                                //         )
                                //     })
                                //     ?.map((item: any) => ({
                                //         value: item?.id?.toString(),
                                //         label: item?.contract_code
                                //     }))}

                                options={dataTable
                                    ?.filter((item: any) => {
                                        return (
                                            userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true &&
                                                srchShipper?.length > 0 ? srchShipper.includes(item?.group?.id_name) : true
                                        )
                                    })
                                    ?.map((item: any) => ({
                                        value: item?.id?.toString(),
                                        label: item?.contract_code
                                    }))
                                }
                            />

                            <InputSearch
                                id="searchTermType"
                                label="Contract Type"
                                // type="select"
                                type="select-multi-checkbox"
                                value={srchTermType}
                                onChange={(e) => setSrchTermType(e.target.value)}
                                options={termTypeMaster?.data?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchContractStatus"
                                label="Action"
                                // type="select"
                                type="select-multi-checkbox"
                                value={srchContractStatus}
                                onChange={(e) => setContractStatus(e.target.value)}
                                options={(statCapReqMgn?.data && Array.isArray(statCapReqMgn?.data) ? statCapReqMgn?.data : []).map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchStatus"
                                label="Contract Status"
                                // type="select"
                                type="select-multi-checkbox"
                                value={srchStatus}
                                onChange={(e) => setSrchStatus(e.target.value)}
                                options={firstColStat?.map((item: any) => ({
                                    value: item?.id?.toString(),
                                    label: item.name
                                }))}
                            />

                            <InputSearch
                                id="searchType"
                                label="Type"
                                // type="select"
                                type="select-multi-checkbox"
                                value={srchType}
                                onChange={(e) => setSrchType(e.target.value)}
                                options={[
                                    { value: "1", label: "Manual" },
                                    // { value: "2", label: "PTT" },
                                    { value: "3", label: "TPA Website" },
                                ]}
                                placeholder="Select Type"
                            />

                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                        </aside>
                        <aside className="mt-auto ml-1 w-full sm:w-auto">
                            <div className="flex flex-wrap gap-2 justify-end">
                                <BtnGeneral textRender={"Sync"} bgcolor={"#00ADEF"} modeIcon={'sync'} generalFunc={handleOpenSync} can_sync={userPermission ? userPermission?.f_create : false} />
                            </div>
                        </aside>
                    </div>

                    {/* ================== NEW TABLE ==================*/}
                    <AppTable
                        data={filteredDataTable}
                        columns={columns}
                        isLoading={isLoading}
                        haveTooltip={true}
                        tooltipMsg={
                            <div>
                                <p className="text-[#464255] font-light"><span className="font-bold mr-2">{'Contract Status:'}</span>{`บอกสถานะการใช้งานของสัญญา เริ่มตั้งแต่ Waiting for Approval, Waiting For Start Date, Close, Active และ End`}</p>
                                <p className="text-[#464255] font-light"><span className="font-bold mr-2">{'Action:'}</span>{`บอกสถานะที่ทาง TSO ดำเนินการ เริ่มตั้งแต่ Saved, Confirmed, Approved, Rejected และ Terminated`}</p>
                            </div>
                        }
                        // isTableLoading={istrLoading}
                        exportBtn={
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="capacity/capacity-contract-management"
                                can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
                            />
                        }
                        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
                        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
                    />
                </>
            )}

            {/* PATH DETAIL */}
            {divMode === "2" && (
                <div className="w-full relative">
                    <Spinloading spin={isLoadingPath} rounded={20} />
                    <div
                        className="text-[#464255] px-4 font-bold cursor-pointer pb-4 pt-4"
                        onClick={() => {
                            setDivMode("1")
                            // localStorage.setItem("i0y7l2w4o8c5v9b1r3z", '1');
                            localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('1'));
                            setisLoadingPath(false);
                        }}
                    >
                        <ArrowBackIos style={{ fontSize: "14px" }} />{` Back`}
                    </div>

                    <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                            <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-[30px]">
                                {/* Contract Code */}
                                <div className="flex flex-col">
                                    <p className="!text-[14px] font-bold text-[#58585A]">{`Contract Code`}</p>
                                    <p className="!text-[14px] font-light text-[#757575]">{dataFile?.contract_code || ''}</p>
                                </div>

                                <div className="flex flex-col">
                                    <InputSearch
                                        id="searchPeriod"
                                        placeholder="Select period From - To"
                                        label={<span className="!font-bold !text-[#58585A]">{"Period From - To"}</span>}
                                        type="select"
                                        value={srchPeriod}
                                        customWidth={200}
                                        onChange={(e) => {
                                            return setSrchPeriod(String(e.target.value))
                                        }}
                                        options={dataPeriod ?
                                            dataPeriod?.map((item: any) => ({
                                                value: String(item.value),
                                                label: item.label,
                                            }))
                                            : []
                                        }
                                    />
                                </div>

                                <div className="grid justify-center items-center grid-cols-2 gap-2 ml-[-20px]">
                                    <BtnSearch handleFieldSearch={handleFieldSearchPathDetail} />
                                    <BtnReset handleReset={handleReset} />
                                </div>
                            </section>

                        </aside>
                    </div>

                    <TablePathDetail
                        // tableData={dataPathDetail}
                        tableData={dataFile}
                        dataPeriod={dataPeriod}
                        setDataPeriod={setDataPeriod}
                        dataPathDetailSearch={dataPathDetailSearch}
                        dataPathDetail={dataPathDetail}
                        setDataPathDetail={setDataPathDetail}
                        isReset={isReset}
                        setIsReset={setIsReset}
                        selectedId={selectedId}
                        areaMaster={areaMaster?.data}
                        srchPeriod={srchPeriod}
                        setisLoadingPath={setisLoadingPath}
                        handleFieldSearchPathDetail={handleFieldSearchPathDetail}
                    />
                </div>
            )}

            {/* ############################################################################################################################################################### */}
            {/* ############################################################################################################################################################### */}


            {/* CLICK ON CONTRACT CODE */}
            {divMode === "3" && (
                <>
                    <div>
                        <div className="flex text-[#464255] px-4 text-[14px] font-bold  pb-4 z-0">
                            <div className="w-auto pt-6 cursor-pointer"
                                onClick={() => {
                                    setDivMode("1")
                                    localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('1'));
                                    setIsEditing(false) // ตอนกด back ปิด edit
                                    setExpandedRow(null)
                                    setBookingVersionId('')

                                    setExpandedEntry(null)
                                    setExpandedExit(null)
                                    setExpandedEntryExit(null)

                                    setMdExtendOpen(false)
                                    setIsAmendMode(false)
                                    setSelectedButton('')
                                    setAmendNewContractStartDate(undefined)
                                    setSrchStartDate(null)
                                    setSrchEndDate(null)
                                    setIsExtendEnabled(false)

                                    // setModeEditing(undefined)
                                    setModeEditing('')
                                    resetOption('all')

                                    setIsLoading(false);
                                    console.log('.6');
                                    fetchData()
                                }}
                            >
                                <ArrowBackIos style={{ fontSize: "14px" }} /> {` Back`}
                            </div>

                            <div className="w-full sm:w-auto flex justify-end sm:ml-auto gap-2 pt-6">
                                {/* วันปัจจุบัน + shadow_time ถ้าน้อยกว่า contract_end_date หรือถ้ามี extend_deadline คือกดได้ */}
                                {/* 
                                    if present day + dataFile?.shadow_time less than dataFile?.contract_end_date or if there's dataFile?.extend_deadline !== null then make <BtnGeneral> enabled
                                */}
                                {/* "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี */}
                                <BtnGeneral
                                    textRender={"Extend Contract"}
                                    iconNoRender={true}
                                    bgcolor={"#24AB6A"}
                                    generalFunc={handleExtendContract}
                                    // disable={(isExtendEnabled && dataFile?.status_capacity_request_management?.id == 2) && false} //Extend Contract : สัญญานั้นจะต้อง Approved ก่อนจึงจะสามารถกดปุ่ม Extend ได้ https://app.clickup.com/t/86er9vumv
                                    disable={!isExtendEnabled}
                                    // can_create={userPermission ? userPermission?.f_create : false}
                                    can_create={userPermission ? userPermission?.f_edit : false}
                                />

                                {/* ถ้าสัญญายังไม่ Active จะขึ้นให้ import version ใหม่ แต่ถ้า Active แล้วจะขึ้นให้กด Amend แทน */}
                                {
                                    (dataFile?.status_capacity_request_management_process?.id == 1 && dataFile?.status_capacity_request_management?.id == 2) ?
                                        <BtnGeneral
                                            textRender={"Amend"}
                                            iconNoRender={true}
                                            bgcolor={"#3582D5"}
                                            generalFunc={handleAmend}
                                            disable={(dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) || isAmendMode}
                                            // can_create={userPermission ? userPermission?.f_create : false}
                                            can_create={userPermission ? userPermission?.f_edit : false}
                                        />
                                        :
                                        <BtnGeneral
                                            textRender={"Import"}
                                            iconNoRender={false}
                                            modeIcon={'import'}
                                            bgcolor={"#00ADEF"}
                                            disable={(dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) ? true : false}
                                            generalFunc={handleOpenImport} can_create={userPermission ? userPermission?.f_import : false}
                                        // generalFunc={handleOpenImport} can_create={userPermission ? userPermission?.f_create : false}
                                        />
                                }
                            </div>
                        </div>

                        <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 mb-2">
                            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                                <section className="relative z-0 pr-4 flex flex-col sm:flex-row w-full gap-4">
                                    {/* Contract Code */}
                                    <div className="flex flex-col">
                                        <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Code`}</p>
                                        <p className="!text-[14px] font-light text-[#757575]">{dataFile?.contract_code || ''}</p>
                                    </div>

                                    {/* Shipper Name */}
                                    <div className="flex flex-col">
                                        <p className="!text-[14px] font-semibold text-[#58585A]">{`Shipper Name`}</p>
                                        <p className="!text-[14px] font-light text-[#757575]">{dataFile?.group?.name || ''}</p>
                                    </div>

                                    {/* Contract Type */}
                                    <div className="flex flex-col">
                                        <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Type`}</p>
                                        <p className="!text-[14px] font-light text-[#757575]">{dataFile?.term_type?.name || ''}</p>
                                    </div>
                                </section>
                            </aside>
                        </div>

                        <div className="flex flex-wrap gap-2 pb-2 justify-end pt-2 w-full sm:w-auto">
                            <SearchInput onSearch={(e: any) => handleLikeSearch(e, dataFileOriginal?.booking_version)} placeHolder={'Search Version Detail'} />
                        </div>

                        {/* ############################################################################################################################################################### */}
                        {/* ############################################################################################################################################################### */}

                        {/* แถบสีฟ้า ๆ เทา ๆ แสดง version */}
                        {/* {dataFile && dataFile?.book_capacity_request_management?.map((item: any, index: number) => ( */}
                        {
                            dataFile && dataFile?.booking_version?.map((item: any, index: number, arr: any) => {

                                try {
                                    // Helper functions for data processing
                                    const extractHeaderKeys = (headerObj: any): any[] => {
                                        const keys: any[] = [];
                                        if (typeof headerObj === 'object') {
                                            Object.values(headerObj).map((value: any) => {
                                                if (typeof value === 'object') {
                                                    Object.values(value).map((item: any) => {
                                                        if (typeof item === 'object') {
                                                            Object.values(item).map((headerKey: any) => {
                                                                if (typeof headerKey !== 'object') {
                                                                    keys.push(headerKey);
                                                                }
                                                            });
                                                        } else {
                                                            keys.push(item);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        return keys;
                                    };

                                    const addMissingKeysToValues = (values: any[], headerKeys: any[]): any[] => {
                                        return values.map((item: any) => {
                                            const itemKeys = Object.keys(item);
                                            const missingKeys = headerKeys.filter((key: any) => !itemKeys.includes(key));
                                            missingKeys.forEach((key: any) => {
                                                item[key] = ' ';
                                            });
                                            return item;
                                        });
                                    };

                                    const processBookingData = (jsonString: string) => {
                                        try {
                                            const data = JSON.parse(jsonString);

                                            // Process entry values
                                            const headerEntryKeys = extractHeaderKeys(data.headerEntry);
                                            if (data.entryValue) {
                                                data.entryValue = addMissingKeysToValues(data.entryValue, headerEntryKeys);
                                            }
                                            if(data.sumEntries){
                                                const newSum = addMissingKeysToValues([data.sumEntries], headerEntryKeys);
                                                if(newSum.length > 0){
                                                    data.sumEntries = newSum[0];
                                                }
                                            }

                                            // Process exit values
                                            const headerExitKeys = extractHeaderKeys(data.headerExit);
                                            if (data.exitValue) {
                                                data.exitValue = addMissingKeysToValues(data.exitValue, headerExitKeys);
                                            }
                                            if(data.sumExits){
                                                const newSum = addMissingKeysToValues([data.sumExits], headerExitKeys);
                                                if(newSum.length > 0){
                                                    data.sumExits = newSum[0];
                                                }
                                            }

                                            return data;
                                        } catch (error) {
                                            return JSON.parse(jsonString);
                                        }
                                    };

                                    // Process booking_full_json
                                    let data_table_val: any = null;
                                    let jsonString = item?.booking_full_json[0]?.data_temp;

                                    if (jsonString) {
                                        data_table_val = processBookingData(jsonString);
                                        item.booking_full_json[0].data_temp = JSON.stringify(data_table_val);
                                    }

                                    // Process booking_full_json_release
                                    const booking_full_json_release: any[] = item?.booking_full_json_release?.filter((item: any) => item?.flag_use == true) || [];
                                    if (booking_full_json_release.length > 0 && booking_full_json_release[0]?.data_temp) {
                                        let releaseJsonString = item?.booking_full_json_release[0]?.data_temp;
                                        if (releaseJsonString) {
                                            const releaseDataTableVal = processBookingData(releaseJsonString);
                                            item.booking_full_json_release[0].data_temp = JSON.stringify(releaseDataTableVal);
                                        }
                                    }
                                } catch (error) {
                                    // Failed to add missing keys
                                }

                                return (
                                    <div className="pb-2">
                                        <div
                                            className={`w-full h-[64px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 ${index === 0 ? 'bg-[#9EE4FF]' : 'bg-[#F3F4F7]'}`}
                                            onClick={() => handleExpand(item.id)}
                                        >
                                            <div className="flex items-center p-2 gap-5">

                                                {/* ถ้า stat เป็น terminated หรือ rejected ปิดปุ่มเลย */}
                                                {!(dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) && (
                                                    <>
                                                        <span
                                                            className="text-[#06A09B] underline cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent triggering handleExpand
                                                                handleDuplicate(item?.id);
                                                            }}
                                                        >
                                                            {`Duplicate`}
                                                        </span>
                                                        {/* Vertical Divider */}
                                                        <div className="w-[1px] bg-[#FFFFFF] border border-[#FFFFFF] dark:bg-white/10 h-[35px] ml-1 mr-1 z-10 opacity-[40%]"></div>
                                                    </>
                                                )}

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
                                                <span className="text-[#58585A] font-light text-[16px]">
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
                                                {expandedRow === item.id ? (
                                                    <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                ) : (
                                                    <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                )}
                                            </div>
                                        </div>

                                        {/* EXPAND แถบ Version */}
                                        {expandedRow === item.id && (
                                            <div className="flex mt-2 bg-[#ffffff] h-auto border border-[#DFE4EA] rounded-[8px] p-4 shadow-sm gap-2 flex-col relative">
                                                <Spinloading spin={isLoadingCell} rounded={20} />

                                                <div className="flex justify-between items-center w-full">
                                                    <div className="flex justify-center items-center">
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
                                                                    onClick={() => {
                                                                        handleButtonClick('original');
                                                                        resetFieldsearch();
                                                                    }}
                                                                    className={`w-[220px] ml-2 !h-[46px] ${selectedButton === 'original' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px]`}
                                                                >
                                                                    {`Original Capacity Right`}
                                                                </label>
                                                            </div>

                                                            <div>
                                                                <label
                                                                    onClick={() => {
                                                                        handleButtonClick('summary')
                                                                        resetFieldsearch();
                                                                    }}
                                                                    className={`w-[220px] ml-2 !h-[46px] ${selectedButton === 'summary' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px]`}
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
                                                            // can_create={userPermission ? userPermission?.f_create : false}
                                                            can_create={userPermission ? userPermission?.f_edit : false}
                                                        />
                                                    </div>
                                                </div>

                                                {
                                                    // TAB ORIGINAL CAPACITY RIGHT
                                                    selectedButton === 'original' && <div>
                                                        <div className="flex pb-2">
                                                            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                                                                <DatePickaSearch
                                                                    key={"start" + key}
                                                                    label="Start Date From"
                                                                    placeHolder="Select Start Date To"
                                                                    allowClear
                                                                    // max={srchEndDate}
                                                                    max={item?.contract_end_date} // R :v1.0.90 filter ใน contract detail ยังทำงานไม่ถูกต้อง https://app.clickup.com/t/86err0d6c
                                                                    onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                                    disabled={isEditing}
                                                                />

                                                                <DatePickaSearch
                                                                    key={"end" + key}
                                                                    label="End Date To"
                                                                    placeHolder="Select End Date To"
                                                                    allowClear
                                                                    // min={srchStartDate}
                                                                    min={item?.contract_start_date} // R :v1.0.90 filter ใน contract detail ยังทำงานไม่ถูกต้อง https://app.clickup.com/t/86err0d6c
                                                                    onChange={(e: any) => setSrchEndDate(e ? e : null)}
                                                                    disabled={isEditing}
                                                                />

                                                                <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'all')} isDisabled={isEditing} />
                                                                <BtnReset handleReset={() => handleSearchItem(item, 'all', 'reset')} isDisabled={isEditing} />

                                                                <div className="pt-6 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                                                                    {
                                                                        isEditing && modeEditing === 'entry' && (
                                                                            <div className="flex gap-3">
                                                                                <button
                                                                                    // onClick={handleSaveClick}
                                                                                    onClick={confirmSaveClick}
                                                                                    disabled={!canSave}
                                                                                    aria-disabled={!canSave}
                                                                                    // className="flex items-center justify-center gap-2 px-5 h-10 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-200"
                                                                                    className={`
                                                                                        flex items-center justify-center gap-2 px-5 h-10
                                                                                        bg-green-600 hover:bg-green-700 text-white text-sm font-semibold
                                                                                        rounded-lg shadow-md transition-all duration-200

                                                                                        disabled:bg-gray-300 disabled:text-gray-500
                                                                                        disabled:hover:bg-gray-300 disabled:shadow-none
                                                                                        disabled:opacity-60 disabled:cursor-not-allowed
                                                                                        disabled:pointer-events-none
                                                                                    `}
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                    Save
                                                                                </button>

                                                                                <button
                                                                                    onClick={handleCancelClick}
                                                                                    className="flex items-center justify-center gap-2 px-5 h-10 bg-white border border-gray-400 text-gray-700 hover:bg-gray-100 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                                    </svg>
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        )
                                                                    }

                                                                    {/* ถ้า stat เป็น terminated หรือ rejected ปิดปุ่มเลย */}
                                                                    {!(dataFile?.status_capacity_request_management?.id === 5 || dataFile?.status_capacity_request_management?.id === 3) && (
                                                                        (!isEditing) &&
                                                                            (dataFile?.status_capacity_request_management_process?.id == 1 && dataFile?.status_capacity_request_management?.id == 2) ? // [Pims Env 107] ถ้า Contract Approved และ Active แล้วปิดปุ่ม Edit ไปเลย เพราะ จะ Edit ได้ User ต้องกดจากปุ่ม Amend https://app.clickup.com/t/86euygd2e
                                                                            (
                                                                                <button
                                                                                    onClick={index === 0 ? () => handleEditClick('entry', item?.id) : undefined}
                                                                                    className={`flex items-center justify-center gap-3 px-2 h-[43px] min-w-[60px] w-[80px] rounded-[6px] hover:shadow-md transition opacity-50 text-[#ffffff] border border-[#AEAEB2] cursor-not-allowed !bg-[#AEAEB2]`}
                                                                                    disabled={true}
                                                                                >
                                                                                    <ModeEditOutlineRoundedIcon style={{ fontSize: "18px" }} />
                                                                                    Edit
                                                                                </button>
                                                                            )
                                                                            :
                                                                            (
                                                                                <button
                                                                                    onClick={index === 0 ? () => handleEditClick('entry', item?.id) : undefined}
                                                                                    // disabled={index !== 0}
                                                                                    disabled={index !== 0 || dayjs().isAfter(dayjs(item?.contract_start_date), "day")} // v2.0.16 Contract เริ่ม Start Date ไปแล้ว ควรจะต้องกด Edit ไม่ได้ https://app.clickup.com/t/86et2uway
                                                                                    // className={`flex items-center justify-center gap-3 px-2 h-[43px] min-w-[60px] w-[80px] rounded-[6px] transition ${index === 0 ? 'bg-[#f0f4ff] text-[#2B2A87] hover:bg-[#e0e6ff] border border-[#2B2A87]/20 cursor-pointer' : 'bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed'}`}
                                                                                    className={`flex items-center justify-center gap-3 px-2 h-[43px] min-w-[60px] w-[80px] rounded-[6px] hover:shadow-md transition 
                                                                                        ${index === 0 ? 'bg-[#00ADEF] text-[#FFFFFF] hover:bg-[#00ADEF]  cursor-pointer' : 'border border-[#AEAEB2] cursor-not-allowed !bg-[#AEAEB2]'}
                                                                                        ${dayjs().isAfter(dayjs(item?.contract_start_date), "day") && 'border border-[#AEAEB2] cursor-not-allowed !bg-[#AEAEB2]'}
                                                                                    `}
                                                                                >
                                                                                    <ModeEditOutlineRoundedIcon style={{ fontSize: "18px" }} />
                                                                                    Edit
                                                                                </button>
                                                                            )
                                                                    )}

                                                                    <BtnGeneral
                                                                        bgcolor={"#24AB6A"}
                                                                        modeIcon={'export'}
                                                                        textRender={"Export"}
                                                                        generalFunc={() => handleExportByVersion(item)}
                                                                        can_export={userPermission ? userPermission?.f_export : false}
                                                                    />
                                                                </div>
                                                            </aside>
                                                        </div>

                                                        {/* ENTRY แถบเขียว ๆ */}
                                                        <div
                                                            className={`w-full h-[58px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#C8FFD7] `}
                                                            onClick={() => handleExpandEntryExit("entry" + item.id, 'entry')}
                                                        >
                                                            <div className="flex items-center p-2 gap-5">
                                                                <span className="text-[#58585A] font-semibold">Entry</span>
                                                            </div>

                                                            {/* Expand Icon on the right side */}
                                                            <div className="flex items-center pr-2">
                                                                {expandedEntry === "entry" + item.id ? (
                                                                    <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                                ) : (
                                                                    <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {
                                                            expandedEntry === "entry" + item.id && (
                                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                                    <div className="p-2">
                                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                            {!isEditing && (
                                                                                <div onClick={handleTogglePopoverEntry}>
                                                                                    <Tune
                                                                                        className="cursor-pointer rounded-lg"
                                                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex gap-2 mt-3">
                                                                            <InputSearch
                                                                                {...register("original_zone_entry")}
                                                                                id="searchZone"
                                                                                key={'original_zone_entry' + selectedkey}
                                                                                label="Zone"
                                                                                type="select"
                                                                                value={selectedZone['entryValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;
                                                                                    setselectedZone((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: value,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: undefined,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: undefined,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['entryValue']['zoneOptions']?.map((item: any) => ({
                                                                                    value: item.name,
                                                                                    label: item.name
                                                                                }))}
                                                                                isDisabled={isEditing}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_area_entry")}
                                                                                id="searchArea"
                                                                                key={'original_area_entry' + selectedkey}
                                                                                label="Area"
                                                                                type="select"
                                                                                // value={srchArea}
                                                                                value={selectedArea['entryValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: value,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: undefined,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['entryValue']['areaOptions']?.filter((item: any) => selectedZone['entryValue'] ? item?.zone?.name === selectedZone['entryValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.name,
                                                                                        label: item.name
                                                                                    }))}
                                                                                isDisabled={isEditing}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_contract_entry")}
                                                                                id="searchContractPoint"
                                                                                key={'original_contract_entry' + selectedkey}
                                                                                label="Contract Point"
                                                                                type="select"
                                                                                // value={srchContractCode}
                                                                                value={selectedContract['entryValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: value,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['entryValue']['contractOptions']?.filter((item: any) => selectedArea['entryValue'] ? item?.area?.name === selectedArea['entryValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.contract_point,
                                                                                        label: item.contract_point
                                                                                    }))}
                                                                                isDisabled={isEditing}
                                                                            />

                                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'entry')} isDisabled={isEditing} />
                                                                            <BtnReset handleReset={() => handleSearchItem(item, 'entry', 'reset')} isDisabled={isEditing} />
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-2 relative w-full">
                                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}

                                                                        {istableLoading ?
                                                                            <TableSkeleton />
                                                                            :

                                                                            <TableEntry
                                                                                columnVisibility={columnVisibilityEntry_New}
                                                                                setcolumnVisibility={setColumnVisibilityEntry_New}
                                                                                initialColumnsDynamic={initialColumnsDynamicEntry_New}
                                                                                setinitialColumnsDynamic={setinitialColumnsDynamicEntry_New}
                                                                                setGroupRowJsonState={setGroupRowJsonState}
                                                                                dataTable={item}
                                                                                mode={'entry'}
                                                                                isEditing={isEditing}
                                                                                modeEditing={modeEditing}
                                                                                setDataPostExit={updateDataPostExit}
                                                                                setDataPostEntry={updateDataPostEntry}
                                                                                setDataHeaderEntry={updateDataHeaderEntry}
                                                                                setDataHeaderExit={updateDataHeaderExit}
                                                                                setIsKeyAfter34Change={setIsKeyAfter34Change}
                                                                                originOrSum={'ORIGIN'}
                                                                                isSaveClick={isSaveClick}

                                                                                isCancelClick={isCancelClick}
                                                                                setIsCancelClick={setIsCancelClick}

                                                                                isAmendMode={isAmendMode}
                                                                                setIsAmendMode={setIsAmendMode}
                                                                                maxDateAmend={maxDateAmendMode}
                                                                                amendNewContractStartDate={amendNewContractStartDate}
                                                                                dataContractTermType={dataContractTermType}

                                                                                setIsDateChange={setIsDateChange}
                                                                                isDateChange={isDateChange}
                                                                                isReset={isReset}
                                                                                setIsReset={setIsReset}
                                                                                trickerColumn={trickerColumnEntry}
                                                                                settrickerColumn={settrickerColumnEntry}

                                                                                selectedBookingTemplate={selectedBookingTemplate}
                                                                                termTypeId={dataFile?.term_type_id}
                                                                                shadowPeriod={dataFile?.shadow_period}

                                                                                setDateFromToCheckEntry={setDateFromToCheckEntry}

                                                                                sumValEdited={dataPostSumEntry}
                                                                                setSumValEdited={updateDataPostSumEntry}
                                                                            />}
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        {/* EXIT แถบเหลือง ๆ */}
                                                        <div
                                                            className={`w-full h-[58px] mt-2 border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#FFF3C8] `}
                                                            onClick={() => handleExpandEntryExit("exit" + item.id, 'exit')}
                                                        >
                                                            <div className="flex items-center p-2 gap-5">
                                                                <span className="text-[#58585A] font-semibold">Exit</span>
                                                            </div>

                                                            {/* Expand Icon on the right side */}
                                                            <div className="flex items-center pr-2">
                                                                {/* {expandedEntryExit === "exit" + item.id ? ( */}
                                                                {expandedExit === "exit" + item.id ? (
                                                                    <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                                ) : (
                                                                    <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {
                                                            // expandedEntryExit === "exit" + item.id && (
                                                            expandedExit === "exit" + item.id && (
                                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                                    <div className="p-2">
                                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                            {!isEditing && (
                                                                                <div onClick={handleTogglePopoverExit}>
                                                                                    <TuneIcon
                                                                                        className="cursor-pointer rounded-lg"
                                                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex gap-2 mt-3">
                                                                            <InputSearch
                                                                                {...register("original_zone_exit")}
                                                                                id="searchZone"
                                                                                key={'original_zone_exit' + selectedkey}
                                                                                label="Zone"
                                                                                type="select"
                                                                                value={selectedZone['exitValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedZone((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: value
                                                                                    }));

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: undefined
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: undefined
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['exitValue']['zoneOptions']?.map((item: any) => ({
                                                                                    value: item.name,
                                                                                    label: item.name
                                                                                }))}
                                                                                isDisabled={isEditing}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_area_exit")}
                                                                                id="searchArea"
                                                                                key={'original_area_exit' + selectedkey}
                                                                                label="Area"
                                                                                type="select"
                                                                                value={selectedArea['exitValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: value
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: undefined
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['exitValue']['areaOptions']?.filter((item: any) => selectedZone['exitValue'] ? item?.zone?.name === selectedZone['exitValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.name,
                                                                                        label: item.name
                                                                                    }))}
                                                                                isDisabled={isEditing}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_contract_exit")}
                                                                                id="searchContractPoint"
                                                                                key={'original_contract_exit' + selectedkey}
                                                                                label="Contract Point"
                                                                                type="select"
                                                                                value={selectedContract['exitValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: value
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['exitValue']['contractOptions']?.filter((item: any) => selectedArea['exitValue'] ? item?.area?.name === selectedArea['exitValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.contract_point,
                                                                                        label: item.contract_point
                                                                                    }))}
                                                                                isDisabled={isEditing}
                                                                            />

                                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'exit')} isDisabled={isEditing} />
                                                                            <BtnReset handleReset={() => handleSearchItem(item, 'exit', 'reset')} isDisabled={isEditing} />
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-2 relative w-full">
                                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}

                                                                        {istableLoading ?
                                                                            <TableSkeleton />
                                                                            :
                                                                            <TableExit
                                                                                columnVisibility={columnVisibilityExit_New}
                                                                                setcolumnVisibility={setColumnVisibilityExit_New}
                                                                                initialColumnsDynamic={initialColumnsDynamicExit_New}
                                                                                setinitialColumnsDynamic={setinitialColumnsDynamicExit_New}

                                                                                setGroupRowJsonState={setGroupRowJsonState}
                                                                                dataTable={item}
                                                                                mode={'exit'}
                                                                                isEditing={isEditing}
                                                                                modeEditing={modeEditing}
                                                                                setDataPostExit={updateDataPostExit}
                                                                                setDataPostEntry={updateDataPostEntry}
                                                                                setDataHeaderEntry={updateDataHeaderEntry}
                                                                                setDataHeaderExit={updateDataHeaderExit}
                                                                                setIsDateChange={setIsDateChange}
                                                                                setIsKeyAfter34Change={setIsKeyAfter34Change}
                                                                                originOrSum={'ORIGIN'}
                                                                                isSaveClick={isSaveClick}

                                                                                isAmendMode={isAmendMode}
                                                                                setIsAmendMode={setIsAmendMode}
                                                                                maxDateAmend={maxDateAmendMode}
                                                                                amendNewContractStartDate={amendNewContractStartDate}
                                                                                dataContractTermType={dataContractTermType}

                                                                                isDateChange={isDateChange}
                                                                                isReset={isReset}
                                                                                setIsReset={setIsReset}
                                                                                trickerColumn={trickerColumnExit}
                                                                                settrickerColumn={settrickerColumnExit}

                                                                                selectedBookingTemplate={selectedBookingTemplate}
                                                                                termTypeId={dataFile?.term_type_id}
                                                                                shadowPeriod={dataFile?.shadow_period}

                                                                                setDateFromToCheckExit={setDateFromToCheckExit}

                                                                                sumValEdited={dataPostSumExit}
                                                                                setSumValEdited={updateDataPostSumExit}
                                                                            />
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                }


                                                {
                                                    // TAB SUMMARY CAPACITY RIGHT (EDIT ไม่ได้)
                                                    selectedButton === 'summary' && <div>
                                                        <div className="flex pb-2">
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
                                                                <BtnReset handleReset={() => handleSearchItem(item, 'all', 'reset')} />

                                                                <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                                                                    <BtnGeneral bgcolor={"#24AB6A"} modeIcon={'export'} textRender={"Export"} generalFunc={() => handleExportByVersion(item)} can_export={userPermission ? userPermission?.f_export : false} />
                                                                    {/* <BtnExport textRender={"Export"} data={filteredDataTable} path="capacity/capacity-contract-management" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} /> */}
                                                                </div>
                                                            </aside>
                                                        </div>

                                                        {/* ENTRY แถบเขียว ๆ */}
                                                        <div
                                                            className={`w-full h-[58px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#C8FFD7] `}
                                                            onClick={() => handleExpandEntryExit("entry" + item.id, 'entry')}
                                                        >
                                                            <div className="flex items-center p-2 gap-5">
                                                                <span className="text-[#58585A] font-semibold">Entry</span>
                                                            </div>

                                                            {/* Expand Icon on the right side */}
                                                            <div className="flex items-center pr-2">
                                                                {expandedEntry === "entry" + item.id ? (
                                                                    <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                                ) : (
                                                                    <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {
                                                            // expandedEntryExit === "entry" + item.id && (
                                                            expandedEntry === "entry" + item.id && (
                                                                <div className="w-full h-auto border border-[#DFE4EA] rounded-lg p-2 mt-2">
                                                                    <div className="p-2">
                                                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                                                            <div
                                                                                onClick={handleTogglePopoverEntry}
                                                                            >
                                                                                <Tune
                                                                                    className="cursor-pointer rounded-lg"
                                                                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2 mt-3">
                                                                            <InputSearch
                                                                                {...register("original_zone_entry")}
                                                                                id="searchZone"
                                                                                key={'original_zone_entry' + selectedkey}
                                                                                label="Zone"
                                                                                type="select"
                                                                                value={selectedZone['entryValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;
                                                                                    setselectedZone((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: value,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: undefined,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: undefined,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['entryValue']['zoneOptions']?.map((item: any) => ({
                                                                                    value: item.name,
                                                                                    label: item.name
                                                                                }))}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_area_entry")}
                                                                                id="searchArea"
                                                                                key={'original_area_entry' + selectedkey}
                                                                                label="Area"
                                                                                type="select"
                                                                                // value={srchArea}
                                                                                value={selectedArea['entryValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: value,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: undefined,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['entryValue']['areaOptions']?.filter((item: any) => selectedZone['entryValue'] ? item?.zone?.name === selectedZone['entryValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.name,
                                                                                        label: item.name
                                                                                    }))}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_contract_entry")}
                                                                                id="searchContractPoint"
                                                                                key={'original_contract_entry' + selectedkey}
                                                                                label="Contract Point"
                                                                                type="select"
                                                                                // value={srchContractCode}
                                                                                value={selectedContract['entryValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: value,
                                                                                        exitValue: prev?.exitValue
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['entryValue']['contractOptions']?.filter((item: any) => selectedArea['entryValue'] ? item?.area?.name === selectedArea['entryValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.contract_point,
                                                                                        label: item.contract_point
                                                                                    }))}
                                                                            />

                                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'entry')} />
                                                                            <BtnReset handleReset={() => handleSearchItem(item, 'entry', 'reset')} />
                                                                        </div>
                                                                    </div>

                                                                    <div className="p-2 relative w-full">
                                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}

                                                                        {istableLoading ?
                                                                            <TableSkeleton />
                                                                            :
                                                                            <TableEntry
                                                                                columnVisibility={columnVisibilityEntry_New}
                                                                                setcolumnVisibility={setColumnVisibilityEntry_New}
                                                                                initialColumnsDynamic={initialColumnsDynamicEntry_New}
                                                                                setinitialColumnsDynamic={setinitialColumnsDynamicEntry_New}
                                                                                setGroupRowJsonState={setGroupRowJsonState}
                                                                                dataTable={item}
                                                                                mode={'entry'}
                                                                                isEditing={isEditing}
                                                                                modeEditing={modeEditing}
                                                                                setDataPostExit={updateDataPostExit}
                                                                                setDataPostEntry={updateDataPostEntry}
                                                                                setDataHeaderEntry={updateDataHeaderEntry}
                                                                                setDataHeaderExit={updateDataHeaderExit}
                                                                                setIsKeyAfter34Change={setIsKeyAfter34Change}
                                                                                originOrSum={'SUMMARY'}
                                                                                isSaveClick={isSaveClick}

                                                                                isCancelClick={isCancelClick}
                                                                                setIsCancelClick={setIsCancelClick}

                                                                                isAmendMode={isAmendMode}
                                                                                setIsAmendMode={setIsAmendMode}
                                                                                amendNewContractStartDate={amendNewContractStartDate}
                                                                                dataContractTermType={dataContractTermType}

                                                                                setIsDateChange={setIsDateChange}
                                                                                isDateChange={isDateChange}
                                                                                isReset={isReset}
                                                                                setIsReset={setIsReset}
                                                                                trickerColumn={trickerColumnEntry}
                                                                                settrickerColumn={settrickerColumnExit}

                                                                                setDateFromToCheckEntry={setDateFromToCheckEntry}

                                                                                sumValEdited={dataPostSumEntry}
                                                                                setSumValEdited={updateDataPostSumEntry}
                                                                            />
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        {/* EXIT แถบเหลือง ๆ */}
                                                        <div
                                                            className={`w-full h-[58px] mt-2 border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center justify-between gap-2 px-2 bg-[#FFF3C8] `}
                                                            onClick={() => handleExpandEntryExit("exit" + item.id, 'exit')}
                                                        >
                                                            <div className="flex items-center p-2 gap-5">
                                                                <span className="text-[#58585A] font-semibold">Exit</span>
                                                            </div>

                                                            {/* Expand Icon on the right side */}
                                                            <div className="flex items-center pr-2">
                                                                {/* {expandedEntryExit === "exit" + item.id ? ( */}
                                                                {expandedExit === "exit" + item.id ? (
                                                                    <ExpandLessRoundedIcon sx={{ fontSize: 30 }} />
                                                                ) : (
                                                                    <ExpandMoreRoundedIcon sx={{ fontSize: 30 }} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {
                                                            // expandedEntryExit === "exit" + item.id && (
                                                            expandedExit === "exit" + item.id && (
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
                                                                        <div className="flex gap-2 mt-3">
                                                                            <InputSearch
                                                                                {...register("original_zone_exit")}
                                                                                id="searchZone"
                                                                                key={'original_zone_exit' + selectedkey}
                                                                                label="Zone"
                                                                                type="select"
                                                                                value={selectedZone['exitValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedZone((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: value
                                                                                    }));

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: undefined
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: undefined
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['exitValue']['zoneOptions']?.map((item: any) => ({
                                                                                    value: item.name,
                                                                                    label: item.name
                                                                                }))}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_area_exit")}
                                                                                id="searchArea"
                                                                                key={'original_area_exit' + selectedkey}
                                                                                label="Area"
                                                                                type="select"
                                                                                value={selectedArea['exitValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedArea((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: value
                                                                                    }));

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: undefined
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['exitValue']['areaOptions']?.filter((item: any) => selectedZone['exitValue'] ? item?.zone?.name === selectedZone['exitValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.name,
                                                                                        label: item.name
                                                                                    }))}
                                                                            />

                                                                            <InputSearch
                                                                                {...register("original_contract_exit")}
                                                                                id="searchContractPoint"
                                                                                key={'original_contract_exit' + selectedkey}
                                                                                label="Contract Point"
                                                                                type="select"
                                                                                value={selectedContract['exitValue']}
                                                                                onChange={(e) => {
                                                                                    const value: any = e?.target?.value;

                                                                                    setselectedContract((prev: selectedType) => ({
                                                                                        ...prev,
                                                                                        entryValue: prev?.entryValue,
                                                                                        exitValue: value
                                                                                    }));

                                                                                    setselectedkey((prevKey) => prevKey + 1);
                                                                                }}
                                                                                options={masterOptions['exitValue']['contractOptions']?.filter((item: any) => selectedArea['exitValue'] ? item?.area?.name === selectedArea['exitValue'] : true)
                                                                                    ?.map((item: any) => ({
                                                                                        value: item.contract_point,
                                                                                        label: item.contract_point
                                                                                    }))}
                                                                            />

                                                                            <BtnSearch handleFieldSearch={() => handleSearchItem(item, 'exit')} />
                                                                            <BtnReset handleReset={() => handleSearchItem(item, 'exit', 'reset')} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-2 relative w-full">
                                                                        <Spinloading spin={istableLoading} rounded={10} /> {/* loading example here */}

                                                                        {istableLoading ?
                                                                            <TableSkeleton />
                                                                            :
                                                                            <TableExit
                                                                                columnVisibility={columnVisibilityExit_New}
                                                                                setcolumnVisibility={setColumnVisibilityExit_New}
                                                                                initialColumnsDynamic={initialColumnsDynamicExit_New}
                                                                                setinitialColumnsDynamic={setinitialColumnsDynamicExit_New}

                                                                                setGroupRowJsonState={setGroupRowJsonState}
                                                                                dataTable={item}
                                                                                mode={'exit'}
                                                                                isEditing={isEditing}
                                                                                modeEditing={modeEditing}
                                                                                setDataPostExit={updateDataPostExit}
                                                                                setDataPostEntry={updateDataPostEntry}
                                                                                setDataHeaderEntry={updateDataHeaderEntry}
                                                                                setDataHeaderExit={updateDataHeaderExit}
                                                                                setIsDateChange={setIsDateChange}
                                                                                setIsKeyAfter34Change={setIsKeyAfter34Change}
                                                                                originOrSum={'SUMMARY'}
                                                                                isSaveClick={isSaveClick}
                                                                                isAmendMode={isAmendMode}
                                                                                setIsAmendMode={setIsAmendMode}
                                                                                amendNewContractStartDate={amendNewContractStartDate}
                                                                                dataContractTermType={dataContractTermType}
                                                                                isDateChange={isDateChange}
                                                                                isReset={isReset}
                                                                                setIsReset={setIsReset}
                                                                                trickerColumn={trickerColumnExit}
                                                                                settrickerColumn={settrickerColumnEntry}

                                                                                setDateFromToCheckExit={setDateFromToCheckExit}

                                                                                sumValEdited={dataPostSumExit}
                                                                                setSumValEdited={updateDataPostSumExit}
                                                                            />
                                                                        }
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                }

                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        }
                    </div>
                </>
            )}

            <ModalSubmissionDetails
                data={dataSubmission}
                open={mdSubmissionView}
                onClose={() => {
                    setMdSubmissionView(false);
                }}
            />

            <ModalAmend
                data={dataFile}
                setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                setMdImportOpen={setMdImportOpen}
                setExpandedRow={setExpandedRow}
                setIsAmendMode={setIsAmendMode}
                setExpandedEntry={setExpandedEntry}
                setExpandedExit={setExpandedExit}
                setIsEditing={setIsEditing}
                setModeEditing={setModeEditing}
                setSelectedButton={setSelectedButton}
                setAmendNewContractStartDate={setAmendNewContractStartDate}
                open={mdAmendOpen}
                onSubmit={handleUpdateExtendContract}
                onClose={() => {
                    setMdAmendOpen(false);
                }}
            />

            <ModalUpdateStat
                data={formData}
                open={mdStatOpen}
                onClose={() => {
                    setMdStatOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                            setModeShow('')
                            setFormData(null);
                            setIsLoadingModal(false);
                        }, 100);
                    }
                }}
                modeShow={modeShow}
                onSubmit={handleFormSubmitUpdateStat}
                isLoading={isLoadingModal}
                setisLoading={setIsLoadingModal}
                setResetForm={setResetForm}
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        <div className="text-center">
                            {/* {"Data sync failed."} */}
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalSuccessMsg}`}
                        </div>
                    </div>
                }
            />

            <ModalImport
                open={mdImportOpen}
                data={dataFile}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}

                setModalErrorOpen={setModalErrorOpen}
                setModalErrorMsg={setModalErrorMsg}

                setMdAmendOpen={setMdAmendOpen}
                onClose={async () => {
                    fetchData();
                    setMdImportOpen(false);
                }}
                isAmendMode={isAmendMode}
            />

            <ModalFiles
                data={dataFile}
                // dataGroup={dataGroup}
                setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                open={mdFileView}
                onClose={() => {
                    setMdFileView(false);
                }}
            />

            <ModalExtend
                data={dataFile}
                // bookingTemplate={selectedBookingTemplate}
                isLoading={isLoading}
                setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                open={mdExtendOpen}
                // onSubmit={handleUpdateExtendContract}
                onSubmit={handleSaveConfirm} // Extend : หลังจากกดปุ่ม Extend จะต้องมี Modal Confirm Approve ก่อน https://app.clickup.com/t/86et6ez33
                onClose={() => {
                    setMdExtendOpen(false);
                }}
            />

            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);

                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            // await onSubmit(dataSubmit);
                            handleUpdateExtendContract(dataSubmit)
                        }, 100);
                    }
                }}
                title="Confirm Approve"
                description={
                    <div>
                        <div className="text-center">
                            {`If you approve, the system will generate.`}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Approve"
                btnsplit2="Cancel"
                stat="none"
            />

            {/* Confirm Save Table */}
            <ModalConfirmSave
                open={modaConfirmSaveTable}
                handleClose={(e: any) => {
                    setmodaConfirmSaveTable(false);

                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            handleSaveClick()
                        }, 100);
                    }
                }}
                title="Confirm Approve"
                description={
                    <div>
                        <div className="text-center">
                            {`If you approve, the system will generate. `}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                // btntxt="Save"
                btnsplit1="Save"
                btnsplit2="Cancel"
                stat="none"
            />


            <ModalBkComment
                data={bookingVersionComment}
                dataLog={commentLog}
                dataMain={dataFile}
                setModalMsg={setModalMsg}
                setModalSuccessOpen={setModalSuccessOpen}
                setModalSuccessMsg={setModalSuccessMsg}
                setCommentLog={setCommentLog}
                open={mdCommentOpen}
                onClose={() => {
                    setMdCommentOpen(false);
                }}
            />

            <ModalSync
                open={openSync}
                // handleClose={handleCloseModal}
                onClose={() => {
                    setOpenSync(false);
                }}
            // title="Success"
            // description="Operator has been added."
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumns}
                initialColumns={adjustedColumns}
            />

            <ColumnVisibilityPopoverMT
                open={openEntry}
                anchorEl={anchorElEntry}
                setAnchorEl={setAnchorElEntry}
                // columnVisibility={columnVisibilityEntry}
                columnVisibility={columnVisibilityEntry_New}
                // handleColumnToggle={handleColumnToggleEntry}
                handleColumnToggle={handleColumnToggleEntry_New}
                // initialColumns={initialColumns}
                initialColumns={initialColumnsDynamicEntry_New}
            />

            <ColumnVisibilityPopoverMT
                open={openExit}
                anchorEl={anchorElExit}
                setAnchorEl={setAnchorElExit}
                // columnVisibility={columnVisibilityExit}
                columnVisibility={columnVisibilityExit_New}
                // handleColumnToggle={handleColumnToggleExit}
                handleColumnToggle={handleColumnToggleExit_New}
                // initialColumns={initialColumns}
                // initialColumns={initialColumnsDynamicExit}
                initialColumns={initialColumnsDynamicExit_New}
            />

            <Popover
                id="select-menu-popover"
                open={Boolean(anchorPopover && actions.length > 0)}
                anchorEl={anchorPopover}
                onClose={() => setAnchorPopover(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                sx={{
                    overflow: 'hidden',
                    "& .MuiPopover-paper": { borderRadius: '10px' },
                }}
                className="z-50 !left-[-7.5rem] !top-[35px] !rounded-[10px]"
            >
                <div ref={popoverRef} className="w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {actions.map(({ label, action }: any, idx: number) => {
                            return (
                                <li
                                    key={idx}
                                    className="px-4 py-2 font-semibold text-sm text-[#637381] hover:bg-gray-100 hover:text-[#000000] cursor-pointer"
                                    onClick={() => toggleMenu(action, openPopoverId)}
                                >
                                    {label}
                                </li>
                            )
                        }
                        )}
                    </ul>
                </div>
            </Popover>

        </div>
    );
};

export default ClientPage;