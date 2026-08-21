"use client";
import { Button } from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { Search, Tune } from "@mui/icons-material"
import { getService, patchService, postService } from "@/utils/postService";
import SearchInput from "@/components/other/searchInput";
import ModalExecute from "./form/modalExecute";
import ConfirmModal from "@/components/other/confirmModal";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import TableAlloManage from "./form/table";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BtnExport from "@/components/other/btnExport";
import ModalHistory from "@/components/other/modalHistory";
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNoComma, generateUserPermission, getDateRangeForApi, groupDataAlloManage, toDayjs } from "@/utils/generalFormatter";
import ModalComment from "./form/modalComment";
import ModalRejectAllocReview from "./form/modalRejectAllocReview";
import PaginationComponent from "@/components/other/globalPagination";
import ModalSendEmail from "./form/modalSendEmail";
import { useFetchMasters } from "@/hook/fetchMaster";
import { decryptData } from "@/utils/encryptionData";
import dayjs from 'dayjs'; import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getUserValue from "@/utils/getuserValue";
import BtnReset from "@/components/other/btnReset";
import getCookieValue from "@/utils/getCookieValue";
import BtnGeneral from "@/components/other/btnGeneral";
import { epAllocationAllocationManagement } from "@/utils/exportFunc";
import { CustomTooltip } from "@/components/other/customToolTip";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok")


interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    // ############### Check Authen ###############
    const router = useRouter();
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    // useRestrictedPage(token);

    const searchParams = useSearchParams();
    const status_from_somewhere_else = searchParams.get("status");
    const start_date_from_somewhere_else = searchParams.get("start-date");
    const end_date_from_somewhere_else = searchParams.get("end-date");
    const [useParams, setuseParams] = useState<boolean>(false);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    const [haveAllocationModePermission, setHaveAllocationModePermission] = useState<boolean>(true);
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const [sortedData, setSortedData] = useState<any>([]);

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Allocation Management', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Allocation Management', userDT)
            if (permission) {
                setUserPermission(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            }

            const allocationModePermission = findRoleConfigByMenuName('Allocation Mode', userDT)
            if (allocationModePermission) {
                console.log('allocationModePermission', allocationModePermission);
                setHaveAllocationModePermission(allocationModePermission.b_manage);
            }
            else{
                let authorize_url = localStorage.getItem("o8g4z3q9f1v5e2n7k6t");
                authorize_url = authorize_url ? decryptData(authorize_url) : null;
                if(authorize_url?.includes('/en/authorization/allocation/alloManage')){
                    setHaveAllocationModePermission(false);
                }
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { allocationStatusMaster } = useFetchMasters();

    // ############### FIELD SEARCH ###############
    // const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(dayjs().add(1, 'day').toDate());
    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(dayjs().subtract(1, 'day').toDate());
    const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(dayjs().subtract(1, 'day').toDate());

    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchNomPoint, setSrchNomPoint] = useState<any>([]);
    const [srchStatus, setSrchStatus] = useState<any>([]);
    const [srchReviewCode, setSrchReviewCode] = useState('');

    // List : Filter Shipper Allocation ให้ Default เป็น incorrect ไว้ https://app.clickup.com/t/86et3mvzw
    // Incorrect คือ แสดงเฉพาะข้อมูลค่าที่เป็น แดง 
    // ค่าแดง หมายถึง ค่าของ Shipper Allocation Review และ ค่าของ Metering Value ไม่เท่ากัน มันจะแดงทั้งคู่ 
    // const [srchShipperAlloc, setSrchShipperAlloc] = useState("");
    const [srchShipperAlloc, setSrchShipperAlloc] = useState<any>([]);

    const [checkedData, setcheckedData] = useState<any>([])

    const getStartAndEndDateForApi = (gasDayFrom: any, gasDayTo: any) => {
        try {
            let from = srchGasDayFrom ? dayjs(srchGasDayFrom) : null;
            let to = srchGasDayTo ? dayjs(srchGasDayTo) : null;

            if (from && !to) {
                // ถ้าไม่มี to → set เป็นสิ้นปีเดียวกัน
                to = from.endOf("year");
            }

            if (to && !from) {
                // ถ้าไม่มี from → set เป็นต้นปีเดียวกัน
                from = to.startOf("year");
            }

            if (from && to) {
                // const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
                const { start_date, end_date } = getDateRangeForApi(from.toDate(), to.toDate());
                return {
                    start_date,
                    end_date
                }
            }
            return {
                start_date: from?.format("YYYY-MM-DD"),
                end_date: to?.format("YYYY-MM-DD")
            }
        } catch (error) {
            return {
                start_date: undefined,
                end_date: undefined
            }
        }
    }

    const funcSetDataContractCode = (res_alloc_mgn: any) => {
        const data_contract_code = Array.from(
            new Map(
                (res_alloc_mgn || [])?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group }])
            ).values()
        );
        if (data_contract_code?.length > 0) {
            setDataContract((prev: any[]) => {
                const existingModes = new Set(prev.map(item => item?.contract_code));
                const newUniqueItems = data_contract_code.filter((item: any) => !existingModes.has(item?.contract_code));
                return [...prev, ...newUniqueItems]; // เติมมันเข้าไป และเช็คซ้ำด้วย
            });
        }
    }

    // Instructed_Entry
    const funcSetDataNomPoint = (res_alloc_mgn: any) => {
        // concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wra
        const dataOnlyTargetPoint = filterConcept(res_alloc_mgn)
        const data_nom_point = Array.from(
            new Map(
                (dataOnlyTargetPoint || [])?.map((item: any) => [item.point, { concept_point: item.point }])
            ).values()
        );

        if (data_nom_point?.length > 0) {
            setDataNomConcept((prev: any[]) => {
                const existingModes = new Set(prev.map(item => item.concept_point));
                const newUniqueItems = data_nom_point.filter((item: any) => !existingModes.has(item.concept_point));
                return [...prev, ...newUniqueItems]; // เติมมันเข้าไป และเช็คซ้ำด้วย
            });
        }
    }

    const handleFieldSearch = async () => {
        setcheckedData([])
        console.log('...');
        setIsLoading(false);
        let filteredResult: any[] = [];
        let dataOnlyTargetPoint = []

        // v2.0.89 filter gas day แล้วข้อมูลไม่ขึ้น แม้ว่าตอนเข้ามามีค่า default แสดงอยู่ https://app.clickup.com/t/86eumvxdq
        const { start_date, end_date } = getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo);

        if (start_date && end_date) {
            const res_alloc_mgn: any = await getService(`/master/allocation/allocation-management?start_date=${start_date}&end_date=${end_date}&skip=0&limit=100`);
            if(res_alloc_mgn && Array.isArray(res_alloc_mgn)) {
            setDataBeforeGroup(res_alloc_mgn)

            // DATA CONTRACT CODE
            funcSetDataContractCode(res_alloc_mgn);

            // DATA NOM POINT / CONCEPT POINT
            funcSetDataNomPoint(res_alloc_mgn);

            filteredResult = res_alloc_mgn?.filter((item: any) => {

                const shipperAllocValue = parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review);
                const isCorrect = shipperAllocValue === item?.meteringValue;
                const hasReview = !!item?.allocation_management_shipper_review;

                return (
                    (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper) : true) &&
                    (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                    (srchNomPoint?.length > 0 ? srchNomPoint.includes(item?.point) : true) &&
                    (srchStatus?.length > 0 ? srchStatus.includes(item?.allocation_status?.id.toString()) : true) && // Filter Status ปรับเป็น Multi Select https://app.clickup.com/t/86eu498k6
                    // (srchShipperAlloc.includes('correct') ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) === item?.meteringValue : true) &&

                    // ถ้า item?.allocation_management_shipper_review เป็น null เป็น false 
                    // List : Filter Shipper Allocation เป็น Incorrect แล้วข้อมูลขึ้นไม่ถูก https://app.clickup.com/t/86eub6d0z
                    // (
                    //     srchShipperAlloc.includes('incorrect') ?
                    //         item?.allocation_management_shipper_review ? parseFloat(item.allocation_management_shipper_review[0]?.shipper_allocation_review) !== item?.meteringValue : false
                    //         : true
                    // ) &&

                    // --- ยุบเงื่อนไข ShipperAlloc รวมกันตรงนี้ ---
                    (() => {
                        if (srchShipperAlloc.length === 0) return true;

                        let matchCorrect = false;
                        let matchIncorrect = false;

                        if (srchShipperAlloc.includes('correct')) {
                            matchCorrect = hasReview && isCorrect;
                        }

                        if (srchShipperAlloc.includes('incorrect')) {
                            matchIncorrect = hasReview && !isCorrect;
                        }

                        return matchCorrect || matchIncorrect;
                    })() &&

                    (srchReviewCode ? item?.review_code?.replace(/\s+/g, '').toLowerCase().includes(srchReviewCode.replace(/\s+/g, '').toLowerCase()) : true)
                );
            });

            // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wqw
            dataOnlyTargetPoint = filterConcept(filteredResult)
            }
            else {
                setDataBeforeGroup([])
                funcSetDataContractCode([])
                funcSetDataNomPoint([])
                filteredResult = []
            }
        } else {

            filteredResult = dataTable?.filter((item: any) => {
                return (
                    (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper) : true) &&
                    (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                    (srchNomPoint?.length > 0 ? srchNomPoint.includes(item?.point) : true) &&
                    // (srchStatus ? item?.allocation_status?.id.toString() === srchStatus : true) &&
                    (srchStatus?.length > 0 ? srchStatus.includes(item?.allocation_status?.id.toString()) : true) && // Filter Status ปรับเป็น Multi Select https://app.clickup.com/t/86eu498k6
                    // (srchShipperAlloc === 'correct' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review || "0") === item?.meteringValue : true) &&
                    // (srchShipperAlloc === 'incorrect' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review || "0") !== item?.meteringValue : true) &&
                    (srchShipperAlloc === 'correct' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) === item?.meteringValue : true) &&
                    (srchShipperAlloc === 'incorrect' ? parseFloat(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review) !== item?.meteringValue : true) &&
                    (srchReviewCode ? item?.review_code?.replace(/\s+/g, '').toLowerCase().includes(srchReviewCode.replace(/\s+/g, '').toLowerCase()) : true)
                );
            });

            // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wqw
            dataOnlyTargetPoint = filterConcept(filteredResult)
        }

        setData(dataOnlyTargetPoint)
        setCurrentPage(1)
        const groupedByGasDayAndNominationPoint = groupDataAlloManage(dataOnlyTargetPoint);
        setFilteredDataTable(groupedByGasDayAndNominationPoint);

        setTimeout(() => {
            setIsLoading(true);
        }, 300);

    };

    const handleReset = () => {
        setKey((prevKey) => prevKey + 1);

        setSrchGasDayFrom(dayjs().subtract(1, 'day').toDate())
        setSrchGasDayTo(dayjs().subtract(1, 'day').toDate())

        setSrchShipperName([]);
        setSrchContractCode([]);
        setSrchNomPoint([]);
        setSrchStatus([]);
        setSrchReviewCode('');
        // setSrchShipperAlloc("");
        setSrchShipperAlloc([]);

        fetchData(); // Filter Gas Day From และ Gas Day To Reset ไม่ได้ https://app.clickup.com/t/86et8tw5b

        // const groupedByGasDayAndNominationPoint = groupDataAlloManage(dataTable);
        // setFilteredDataTable(groupedByGasDayAndNominationPoint);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const handleSearch = (query: string) => {
        
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.allocation_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.entry_exit?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.nominationValue?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.systemAllocation?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.intradaySystem?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.previousAllocationTPAforReview?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.allocation_management_shipper_review.length > 0 && item?.allocation_management_shipper_review[0]?.allocation_management_shipper_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.meteringValue?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.systemAllocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.intradaySystem)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.previousAllocationTPAforReview)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.allocation_management_shipper_review.length > 0 && formatNumberFourDecimal(item?.allocation_management_shipper_review[0]?.allocation_management_shipper_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.meteringValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimalNoComma(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.systemAllocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.intradaySystem)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.previousAllocationTPAforReview)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.allocation_management_shipper_review.length > 0 && formatNumberFourDecimalNoComma(item?.allocation_management_shipper_review[0]?.allocation_management_shipper_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.meteringValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.review_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        const groupedByGasDayAndNominationPoint = groupDataAlloManage(filtered);
        const group_na_bro = groupDataAlloManage(dataTable);

        const filtered2 = group_na_bro?.filter((item: any) => {
            return (
                // item?.shipper_allocation_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.point_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.entry_exit?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                item?.nomination_value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.system_allocation?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.intraday_system?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.previous_allocation_tpa_for_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.shipper_allocation_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                item?.metering_value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                formatNumberFourDecimal(item?.nomination_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimal(item?.system_allocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimal(item?.intraday_system)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimal(item?.previous_allocation_tpa_for_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimal(item?.shipper_allocation_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimal(item?.metering_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                formatNumberFourDecimalNoComma(item?.nomination_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimalNoComma(item?.system_allocation)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimalNoComma(item?.intraday_system)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimalNoComma(item?.previous_allocation_tpa_for_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimalNoComma(item?.shipper_allocation_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                formatNumberFourDecimalNoComma(item?.metering_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
            )
        })

        const final_data = [...groupedByGasDayAndNominationPoint, ...filtered2]

        setCurrentPage(1)
        // setFilteredDataTable(groupedByGasDayAndNominationPoint);

        const uniqueData = Array.from(
            new Map(final_data.map(item => [item.id, item])).values()
        );
        // setFilteredDataTable(final_data);
        setFilteredDataTable(uniqueData);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [closeBalanceData, setCloseBalanceData] = useState<any>();
    const [sendEmailData, setSendEmailData] = useState<any>();
    const [dataBeforeGroup, setDataBeforeGroup] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataNomConcept, setDataNomConcept] = useState<any>([]);

    function formatTimeZone(dateString: any) {
        return dayjs(dateString)
            .tz("Asia/Bangkok")
            .format("ddd MMM DD YYYY HH:mm:ss [GMT+0700] (เวลาอินโดจีน)");
    }

    const fetchMaster = async () => {
        // allocation-management/send-email

        try {
            // GET CLOSE BALANCE DATA
            const res_ = await getService(`/master/balancing/closed-balancing-report`)
            setCloseBalanceData(res_)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // GET SEND EMAIL DATA
            const res_send_email_data = await getService(`/master/allocation/allocation-management/send-email`)
            setSendEmailData(res_send_email_data)
            console.log('dataTable : ', dataTable);
            console.log('res_send_email_data : ', res_send_email_data);


        } catch (error) {

        }
    }

    // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wqw
    const filterConcept = (data?: any) => {
        const res_filter = data?.filter((item: any) => `${item?.point_type ?? ''}`.trim().toLowerCase() != 'concept' || ['East_to_RA6', 'West_to_RA6', 'East_to_BVW10', 'West_to_BVW10'].includes(item?.point))
        return res_filter || []
    }

    // const fetchData = async () => {
    //     try {
    //         setIsLoading(false);

    //         // กรณี shipper เข้ามาเห็นของตัวเอง
    //         if (userDT?.account_manage?.[0]?.user_type_id == 3) {
    //             setSrchShipperName([userDT?.account_manage?.[0]?.group?.id])
    //         }

    //         // const gas_day_from = dayjs(srchGasDayFrom).format("YYYY-MM-DD")
    //         // const gas_day_to = dayjs(srchGasDayTo).format("YYYY-MM-DD")

    //         // const gas_day_from = dayjs().format("YYYY-MM-DD")
    //         // const gas_day_to = dayjs().format("YYYY-MM-DD")

    //         // filter มัน default day - 1
    //         const gas_day_from = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
    //         const gas_day_to = dayjs().subtract(1, 'day').format('YYYY-MM-DD');

    //         // *** ตัวอย่างการใช้ limit offset อยู่ที่ metering —> metering retrieving --> page.tsx
    //         // const response: any = await getService(`/master/allocation/allocation-management?start_date=2025-01-01&end_date=2025-02-28&skip=100&limit=100`); // มีข้อมูล
    //         // เอาไว้จัดกรุ๊บตาม gas_day กับ nomination point

    //         //สำหรับ filter file ที่เกี่ยวข้องกับ URL
    //         const genFilterURL = (data: any) => {
    //             if (!useParams) {
    //                 const status: any = status_from_somewhere_else;
    //                 const findStatusMaster: any = allocationStatusMaster?.data?.find((item: any) => item?.name == status)?.id;
    //                 const resultFilter = data?.filter((item: any) => {
    //                     return (
    //                         (findStatusMaster ? item?.allocation_status?.id.toString() == findStatusMaster : true)
    //                     );
    //                 });
    //                 return resultFilter
    //             }

    //             return data
    //         }

    //         let res_API: any;
    //         if ((status_from_somewhere_else || start_date_from_somewhere_else || end_date_from_somewhere_else) && !useParams) {
    //             const status: any = status_from_somewhere_else;
    //             const start_date_URL: any = start_date_from_somewhere_else || gas_day_from;
    //             const end_date_URL: any = end_date_from_somewhere_else || gas_day_to;
    //             // filteredResult
    //             const findStatusMaster: any = allocationStatusMaster?.data?.find((item: any) => item?.name == status)?.id;

    //             if (findStatusMaster) {
    //                 setSrchStatus([findStatusMaster?.toString()]);
    //             }

    //             // if (start_date_from_somewhere_else) {
    //             //     const formatDate: any = formatTimeZone(start_date_from_somewhere_else);
    //             //     setSrchGasDayFrom(formatDate);
    //             // }

    //             // if (end_date_from_somewhere_else) {
    //             //     const formatDate: any = formatTimeZone(end_date_from_somewhere_else);
    //             //     setSrchGasDayTo(formatDate);
    //             // }
    //             if (start_date_from_somewhere_else) {
    //                 setSrchGasDayFrom(
    //                     dayjs.tz(start_date_from_somewhere_else, "Asia/Bangkok")
    //                         .startOf("day")
    //                         .toDate()
    //                 );
    //             }

    //             if (end_date_from_somewhere_else) {
    //                 setSrchGasDayTo(
    //                     dayjs.tz(end_date_from_somewhere_else, "Asia/Bangkok")
    //                         .startOf("day")
    //                         .toDate()
    //                 );
    //             }

    //             res_API = await getService(`/master/allocation/allocation-management?start_date=${start_date_URL}&end_date=${end_date_URL}&skip=0&limit=100`);
    //             setuseParams(true);
    //         } else {
    //             res_API = await getService(`/master/allocation/allocation-management?start_date=${gas_day_from}&end_date=${gas_day_to}&skip=0&limit=100`);
    //             defaultSelectStatus();
    //         }

    //         // if(res_API && Array.isArray(res_API)) {
    //         // const filteredResult = res_API?.filter((item: any) => [2, 3, 4, 5].includes(item?.allocation_status?.id)); // Default Filter แสดงข้อมูลผิด มัน default ไว้ไม่ให้แสดงสถานะ Not Review แต่ตอนนี้ระบบแสดงแต่ Not Review https://app.clickup.com/t/86ev70b68

    //         // // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wqw
    //         // let dataOnlyTargetPoint = []
    //         // dataOnlyTargetPoint = filterConcept(filteredResult)

    //         // if (userDT?.account_manage?.[0]?.user_type_id == 3) {
    //         //     const data_only_shipper = dataOnlyTargetPoint?.filter((item: any) => item?.group?.id === userDT?.account_manage?.[0]?.group?.id)

    //         //     let result: any = status_from_somewhere_else ? genFilterURL(data_only_shipper) : data_only_shipper;
    //         //     dataOnlyTargetPoint = result
    //         //     setData(result);
    //         //     setDataBeforeGroup(result)
    //         // } else {
    //         //     let result: any = status_from_somewhere_else ? genFilterURL(dataOnlyTargetPoint) : dataOnlyTargetPoint;
    //         //     setData(result);
    //         //     setDataBeforeGroup(result)
    //         // }

    //         // const groupedByGasDayAndNominationPoint = groupDataAlloManage(dataOnlyTargetPoint);
    //         // setFilteredDataTable(groupedByGasDayAndNominationPoint);

    //         // setIsLoading(true);

    //         // // DATA CONTRACT CODE
    //         // funcSetDataContractCode(res_API);

    //         // // DATA NOM POINT / CONCEPT POINT
    //         // funcSetDataNomPoint(res_API);
    //         // }

    //         if (res_API && Array.isArray(res_API)) {
    //         // ไม่แสดง Not Review
    //         const filteredResult = res_API.filter((item: any) =>
    //             [2, 3, 4, 5].includes(Number(item?.allocation_status?.id))
    //         );

    //         // กรอง Concept Point
    //         let finalResult = filterConcept(filteredResult);

    //         // Shipper เห็นเฉพาะข้อมูลของตัวเอง
    //         if (userDT?.account_manage?.[0]?.user_type_id === 3) {
    //             finalResult = finalResult.filter(
    //                 (item: any) =>
    //                     item?.group?.id ===
    //                     userDT?.account_manage?.[0]?.group?.id
    //             );
    //         }

    //         // กรอง Status จาก URL
    //         if (status_from_somewhere_else) {
    //             const statusId = allocationStatusMaster?.data?.find(
    //                 (item: any) =>
    //                     item?.name?.trim().toLowerCase() ===
    //                     status_from_somewhere_else.trim().toLowerCase()
    //             )?.id;

    //             if (statusId !== undefined && statusId !== null) {
    //                 finalResult = finalResult.filter(
    //                     (item: any) =>
    //                         String(item?.allocation_status?.id) ===
    //                         String(statusId)
    //                 );

    //                 setSrchStatus([String(statusId)]);
    //             }
    //         }

    //         // ทุก state ต้องใช้ finalResult ตัวเดียวกัน
    //         setData(finalResult);
    //         setDataBeforeGroup(finalResult);

    //         const groupedResult = groupDataAlloManage(finalResult);
    //         setFilteredDataTable(groupedResult);

    //         setCurrentPage(1);
    //         setIsLoading(true);

    //         // Master options
    //         funcSetDataContractCode(res_API);
    //         funcSetDataNomPoint(res_API);
    //     }

    //     } catch (err) {
    //         // setError(err.message);
    //     } finally {
    //         // setLoading(false);
    //     }
    // };

    const fetchData = async () => {
        try {
            setIsLoading(false);

            const defaultDate = dayjs()
                .subtract(1, "day")
                .format("YYYY-MM-DD");

            const startDate =
                start_date_from_somewhere_else || defaultDate;

            const endDate =
                end_date_from_somewhere_else || defaultDate;

            // ตั้งค่าวันที่บน UI
            if (start_date_from_somewhere_else) {
                setSrchGasDayFrom(
                    dayjs.tz(
                        start_date_from_somewhere_else,
                        "Asia/Bangkok"
                    ).startOf("day").toDate()
                );
            }

            if (end_date_from_somewhere_else) {
                setSrchGasDayTo(
                    dayjs.tz(
                        end_date_from_somewhere_else,
                        "Asia/Bangkok"
                    ).startOf("day").toDate()
                );
            }

            // หา Status ID จาก URL
            const statusId = status_from_somewhere_else
                ? allocationStatusMaster?.data?.find(
                    (item: any) =>
                        item?.name?.trim().toLowerCase() ===
                        status_from_somewhere_else.trim().toLowerCase()
                )?.id
                : null;

            if (statusId !== null && statusId !== undefined) {
                setSrchStatus([String(statusId)]);
            } else if (!status_from_somewhere_else) {
                defaultSelectStatus();
            }

            const res_API: any = await getService(
                `/master/allocation/allocation-management` +
                `?start_date=${startDate}` +
                `&end_date=${endDate}` +
                `&skip=0` +
                `&limit=100`
            );

            if (!Array.isArray(res_API)) {
                setData([]);
                setDataBeforeGroup([]);
                setFilteredDataTable([]);
                setIsLoading(true);
                return;
            }

            let finalResult = res_API.filter((item: any) =>
                [2, 3, 4, 5].includes(
                    Number(item?.allocation_status?.id)
                )
            );

            finalResult = filterConcept(finalResult);

            // Shipper filter
            if (
                userDT?.account_manage?.[0]?.user_type_id === 3
            ) {
                finalResult = finalResult.filter(
                    (item: any) =>
                        item?.group?.id ===
                        userDT?.account_manage?.[0]?.group?.id
                );

                setSrchShipperName([
                    userDT?.account_manage?.[0]?.group?.id_name
                ]);
            }

            // Status filter จาก URL
            if (statusId !== null && statusId !== undefined) {
                finalResult = finalResult.filter(
                    (item: any) =>
                        String(item?.allocation_status?.id) ===
                        String(statusId)
                );
            }

            setData(finalResult);
            setDataBeforeGroup(finalResult);
            setFilteredDataTable(
                groupDataAlloManage(finalResult)
            );

            setCurrentPage(1);

            funcSetDataContractCode(res_API);
            funcSetDataNomPoint(res_API);

            setIsLoading(true);
        } catch (error) {
            console.error("fetchData error:", error);

            setData([]);
            setDataBeforeGroup([]);
            setFilteredDataTable([]);
            setIsLoading(true);
        }
    };

    const defaultSelectStatus: any = () => {
        const filtered = allocationStatusMaster?.data?.filter((item: any) => item?.name !== 'Not Review');

        const result: any = [];
        filtered?.map((itemf: any) => {
            return result.push(itemf?.id.toString());
        })

        setSrchStatus(result);
    }

    // useEffect(() => {
    //     getPermission();
    //     fetchMaster();
    //     fetchData();
    // }, [resetForm]);

    useEffect(() => {
        getPermission();
        fetchMaster();
    }, []);

    useEffect(() => {
        if (!allocationStatusMaster?.data?.length) return;

        fetchData();
    }, [
        allocationStatusMaster?.data,
        status_from_somewhere_else,
        start_date_from_somewhere_else,
        end_date_from_somewhere_else,
        resetForm
    ]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        mode_account: '',
        id_name: '',
        role: '',
        system_login_account: [],
    };

    const [formData, setFormData] = useState(fdInterface);
    const [viewData, setViewData] = useState<any>();

    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setViewData(filteredData);
        setViewOpen(true);
    };

    // ############### REASON VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openReasonModal = (id: any, data: any, row: any) => {
        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [mdExcuteOpen, setMdExecuteOpen] = useState(false);
    const [mdSendEmail, setMdSendEmail] = useState(false);
    const [mdRejectOpen, setMdRejectOpen] = useState(false);
    const [mdEditOpen, setMdEditOpen] = useState(false);
    const [mdRejectSuccessOpen, setMdRejectSuccessOpen] = useState(false);
    const [mdEmailSentSuccessOpen, setMdEmailSentSuccessOpen] = useState(false);
    const [mdAcceptSuccessOpen, setMdAcceptSuccessOpen] = useState(false);
    const [executeLoading, setExecuteLoading] = useState(false);

    const handleFormSubmitUpdate = async (data: any) => {
        // setExecuteLoading(true)

       

        setMdEditOpen(false);
        setMdExecuteOpen(false);
        if (resetForm) resetForm();

        // setTimeout(() => {
            // setExecuteLoading(false)
            setModalSuccessOpen(true);
            // fetchData();
            // handleFieldSearch();
        // }, 500);
         try { 
            postService('/master/allocation/execute-data', { menu: 'Allocation Management' });
        } catch (error) {
            // error alloc and bal
        }
    }

    // MODAL EXECUTE OPEN
    const openExecuteForm = async () => {
        setTimeout(() => {
            setMdExecuteOpen(true);
        }, 300);
    };

    // GO TO PAGE CHANGE ALLOC MODE
    const gotoPageChangeAllocMode = () => {
        // setMdExecuteOpen(true);
        router.push("/en/authorization/dam/parameters/systemConfiguration/allocationMode");
    };

    // ============ MODAL ACCEPT OPEN ============
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [modalWarningOpen, setModalWarningOpen] = useState(false);
    const [modalWarningMsg, setModalWarningMsg] = useState('');

    const [isAcceptClick, setIsAcceptClick] = useState(false);
    const openAccpetModal = (id?: any, data?: any) => {
        setIsAcceptClick(true)
    };

    const acceptHandle = async () => {
        // let find_item = selectedItem.filter((item: any) => item?.parent == true)
        // find_item = find_item?.flatMap((item: any) => item?.id)
        // const result = dataBeforeGroup.filter((item: any) => find_item.includes(item.id));

        const flat_id_selected = selectedItem?.flatMap((item: any) => item?.id)
        const result = dataBeforeGroup?.filter((item: any) => flat_id_selected.includes(item.id));

        let dynamicBody = {
            "status": 3,
            "comment": "",
            "rowArray": result
        }

        const res_patch: any = await patchService('/master/allocation/allocation-manage-change-status', dynamicBody)
        const statusCodePatch = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
        const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

        if (statusCodePatch === 400 || statusCodePatch === 500) {
            // setModalErrorMsg(res_patch?.response?.data?.error ? res_patch?.response?.data?.error : 'Failed. Please try again later or contact support.');
            setModalErrorMsg(errorMsgPatch ? errorMsgPatch : 'Failed. Please try again later or contact support.');
            setModalErrorOpen(true)
        } else {
            setMdAcceptSuccessOpen(true);
        }

        setIsAcceptClick(false)
        setIsLoading(false)
        setselectedItem([])
        setModalWarningMsg('');
        setModalWarningOpen(false)

        // await fetchData();
        handleFieldSearch();
    };

    const validateHandle = async () => {
        // let find_item = selectedItem.filter((item: any) => item?.parent == true)
        // find_item = find_item?.flatMap((item: any) => item?.id)
        // const result = dataBeforeGroup.filter((item: any) => find_item.includes(item.id));

        const flat_id_selected = selectedItem?.flatMap((item: any) => item?.id)
        const result = dataBeforeGroup?.filter((item: any) => flat_id_selected.includes(item.id));

        let dynamicBody = {
            "status": 3,
            "comment": "",
            "rowArray": result
        }

        const resValidate: any = await patchService('/master/allocation/allocation-manage-change-status-validate', dynamicBody)
        const statusCodePatch = resValidate?.response?.data?.statusCode ?? resValidate?.response?.data?.status ?? resValidate?.status ?? resValidate?.statusCode ?? resValidate?.code ?? resValidate?.response?.status;
        const errorMsgPatch = resValidate?.response?.data?.error ?? resValidate?.data?.error ?? resValidate?.response?.error ?? resValidate?.error;

        // if (resValidate?.response?.data?.error) {
        if (statusCodePatch === 400 || statusCodePatch === 500) {
            // setModalWarningMsg(resValidate?.response?.data?.error);
            setModalWarningMsg(errorMsgPatch || '');
            setModalErrorMsg(errorMsgPatch || '');
            setModalWarningOpen(true)

            setIsAcceptClick(false)
        }
        else {
            acceptHandle()
        }
    };

    // ============ MODAL REJECT OPEN ============
    const [isRejectClick, setIsRejectClick] = useState(false);
    const openRejectModal = (id?: any, data?: any) => {
        setIsRejectClick(true)
    };
    const [dataReject, setDataReject] = useState([]);

    // #region reject handle
    const rejectHandle = async () => {
        const flat_id_selected = selectedItem?.flatMap((item: any) => item?.id)
        const result = dataBeforeGroup?.filter((item: any) => flat_id_selected.includes(item.id));

        setDataReject(result)
        setIsRejectClick(false)
        setMdRejectOpen(true)
    };

    const modalRejectAllocReview = async (data?: any) => {
        let dynamicBody = {
            "status": 5,
            "comment": data?.reason ? data?.reason : '',
            "rowArray": dataReject
        }
        const res_patch: any = patchService('/master/allocation/allocation-manage-change-status', dynamicBody)
        setMdRejectSuccessOpen(true)
        setMdRejectOpen(false)
        setselectedItem([])

        setTimeout(async () => {
            // await fetchData();
            handleFieldSearch();
        }, 1000);
    }

    // ============ EMAIL SEND ============
    // #region MODAL SEND EMAIL
    const openSendEmail = () => {
        setMdSendEmail(true);
    };

    const handleSendEmail = async (data?: any) => {
        setIsLoading(false)
        // .......
        //  initialColumns: initialColumns,
        // columnVisibility: columnVisibility, 
        // resData: sortedData,

        const res_user_type = await getService(`/master/balancing/balance-intraday-dashboard/user-type`);
        const filter_type = res_user_type?.filter((item: any) => item?.id == data?.user_type)
        const filter_group = filter_type[0]?.group?.filter((item: any) => data.group.includes(item?.id))

        // ลบข้อมูล filter_groupx.account.email ที่ email ไม่มีใน data.user_mail
        const userEmails = data.user_mail;
        const cleaned_group = filter_group.map((group: any) => ({
            ...group,
            account: group.account.filter((acc: any) => userEmails.includes(acc.email))
        }));

        const { start_date, end_date } = getStartAndEndDateForApi(srchGasDayFrom, srchGasDayTo);

        if (start_date && end_date) {
            const body_post = {
                "subject": data?.subject,
                "detail": data?.detail,
                "userType": data?.user_type,
                "sendEmailGroup": cleaned_group,
                // sortedDataId: sortedData?.flatMap((eId: any) => eId?.data?.map((eId_: any) => eId_?.id)), //  // https://app.clickup.com/t/86extxcvv
                sortedDataId: filteredDataTable?.flatMap((group: any) =>
                    Array.isArray(group?.data)
                        ? group.data.map((item: any) => item?.id)
                        : []
                )?.filter((id: any) => id !== null && id !== undefined),
                "exportFile": {
                    "bodys": {
                        "start_date": start_date,
                        "end_date": end_date,
                        "skip": 100,
                        "limit": 100
                    },
                    "filter": [
                        "Total",
                        "Status",
                        "Gas Day",
                        "Shipper Name",
                        "Contract Code",
                        "Nomination Point /Concept Point",
                        // "Entry / Exit",
                        "Nominated Value (MMBTU/D)",
                        "System Allocation (MMBTU/D)",
                        "Intraday System Allocation",
                        "Previous Allocation TPA for Review (MMBTU/D)",
                        "Shipper Allocation Review (MMBTU/D)",
                        "Metering Value (MMBTU/D)",
                        "Review Code",
                        "Comment"
                    ]
                }
            }

            try {
                const res_post_email: any = await postService('/master/allocation/allocation-management/send-email', body_post)
                if (res_post_email?.id) {
                    setMdEmailSentSuccessOpen(true)

                    // GET SEND EMAIL DATA
                    const res_send_email_data = await getService(`/master/allocation/allocation-management/send-email`)
                    setSendEmailData(res_send_email_data)
                }
                else {
                    setModalErrorMsg(res_post_email?.response?.data?.error ?? 'We could not send the email because the required data was not found. Please wait a moment and try again.')
                    setModalErrorOpen(true)
                }
                setMdSendEmail(false);
                setIsLoading(true)
            } catch (error) {

            }
        }
        else {
            setModalErrorMsg('Please select Gas Day From and Gas Day To before send email.');
            setModalErrorOpen(true)
        }
    }

    //state use
    const [key, setKey] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const initialColumns: any = [
        { key: 'total', label: 'Total', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper', label: 'Shipper Name', visible: true },
        { key: 'contract', label: 'Contract Code', visible: true },
        { key: 'nompoint', label: 'Nomination Point /Concept Point', visible: true },
        // { key: 'entryexit', label: 'Entry / Exit', visible: true }, // https://app.clickup.com/t/9018502823/86eub6dbb
        { key: 'nominatedval', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allo', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'intraday_allo', label: 'Intraday System Allocation (MMBTU/D)', visible: true },
        { key: 'previous_allo', label: 'Previous Allocation TPA for Review (MMBTU/D)', visible: true },
        { key: 'shipper_allo', label: 'Shipper Allocation Review (MMBTU/D)', visible: true },
        { key: 'metering_allo', label: 'Metering Value (MMBTU/D)', visible: true },
        { key: 'review', label: 'Review Code', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'intraday_system_allocation', label: 'Intraday System Allocation', visible: true },
        { key: 'shipper_review_allocation', label: 'Shipper Review Allocation (MMBTU/D)', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

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

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            // setPaginatedData(filteredDataTable)
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    const [selectedItem, setselectedItem] = useState<any>([]);

    // ############### HISTORY MODAL ###############
    const [historyOpen, setHistoryOpen] = useState(false);
    // const handleCloseHistoryModal = () => setHistoryOpen(false);
    const handleCloseHistoryModal = () => {
        setHistoryOpen(false);
        setTimeout(() => {
            setHistoryData(undefined);
        }, 300);
    }
    const [historyData, setHistoryData] = useState<any>();
    const [headData, setHeadData] = useState<any>();

    const openHistoryForm = async (id: any) => {
        try {

            // ปั้น data หัว history
            const filteredData = dataTable?.find((item: any) => item.id === id);
            const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == filteredData?.shipper)
            const res_for_header_of_history = [
                {
                    "title": "Shipper Name",
                    "value": find_shipper?.name
                },
                {
                    "title": "Gas Day",
                    "value": filteredData?.gas_day
                },
                {
                    "title": "Contract Code",
                    "value": filteredData?.contract
                },
                {
                    "title": "Nominations Point/Concept Point",
                    "value": filteredData?.point
                },
                {
                    "title": "Review Code",
                    "value": filteredData?.review_code
                }
            ]

            const response: any = await getService(`/master/account-manage/history?type=allocation-manage&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);
            // let mappings = [
            //     { key: "shipper", title: "Shipper Name" },
            //     { key: "gas_day", title: "Gas Day" },
            //     { key: "contract", title: "Contract Code" },
            //     { key: "point", title: "Nominations Point/Concept Point" },
            //     { key: "review_code", title: "Review Code" }, // ตอนแรกเริ่มมันก็มีอยู่ละ 040725 : History เพิ่มให้แสดง Review Code ด้วย https://app.clickup.com/t/86eu29aqk
            // ];
            // let result = mappings.map(({ key, title }) => {
            //     const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
            //     return {
            //         title,
            //         value: value || "",
            //     };
            // });

            const normalized = fillMissingUpdateByAccount(valuesArray);

            setHeadData(res_for_header_of_history)
            // setHistoryData(valuesArray);
            setHistoryData(normalized);
            setHistoryOpen(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

    // useEffect(() => {
    //     const startDate = srchGasDayFrom ? dayjs(srchGasDayFrom).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
    //     const endDate = srchGasDayTo ? dayjs(srchGasDayTo).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
    //     let apiUrl = `/master/daily-adjustment/shipper-data?start_date=${startDate}&end_date=${endDate}`;

    //     getService(apiUrl).then((res_shipper_approve: any) => {
    //         if(Array.isArray(res_shipper_approve)) {
    //             let selectedShipper = []
    //             if (userDT?.account_manage?.[0]?.user_type_id == 3) { // shipper
    //                 const targetGroupId = userDT?.account_manage?.[0]?.group?.id;
    //                 const existsInGroup = res_shipper_approve?.some((group: any) => group.id === targetGroupId);
    //                 if(!existsInGroup && userDT?.account_manage?.[0]?.group?.id && userDT?.account_manage?.[0]?.group?.name ){
    //                     res_shipper_approve.push({ id: userDT?.account_manage?.[0]?.group?.id, name: userDT?.account_manage?.[0]?.group?.name })
    //                 }
    //             }
    //             else{
    //                 if(Array.isArray(srchShipperName)){
    //                     selectedShipper = srchShipperName.filter(name => res_shipper_approve.some((group: any) => group.name === name))
    //                     setSrchShipperName(selectedShipper)
    //                 }
    //                 else if (!res_shipper_approve.some((group: any) => group.id === srchShipperName)){
    //                     setSrchShipperName([])
    //                 }
    //             }
    //             setDataShipper(res_shipper_approve);


    //             const selctedShipperList = (!selectedShipper || selectedShipper?.length == 0) ? res_shipper_approve : res_shipper_approve.filter((group: any) => selectedShipper?.includes(group.name));

    //             const contractCodeList = selctedShipperList.flatMap((shipper: any) => {
    //                 let reserve_balancing_gas_contract = []
    //                 if(shipper?.reserve_balancing_gas_contract && Array.isArray(shipper?.reserve_balancing_gas_contract) && shipper?.reserve_balancing_gas_contract?.length > 0){
    //                     reserve_balancing_gas_contract = shipper?.reserve_balancing_gas_contract.map((item: any) => {
    //                         return { ...item, contract_code: item?.res_bal_gas_contract }
    //                     })
    //                 }
    //                 return [...(shipper.contract_code || []), ...reserve_balancing_gas_contract]
    //             })

    //             const existingContractCodeInDataTable = dataTable.reduce((acc: any, item: any) => {
    //                 if(!contractCodeList.some((contract: any) => contract.contract_code === item?.contract) && !acc.some((existing: any) => existing.contract_code === item?.contract)){
    //                     const group = item?.group || item?.shipper
    //                     acc.push({
    //                         contract_code: item?.contract,
    //                         group: group,
    //                         group_id: group?.id
    //                     })
    //                 }
    //                 return acc
    //             }, [])
    //             contractCodeList.push(...existingContractCodeInDataTable)

    //             if(Array.isArray(srchContractCode)){
    //                 const selectedContractCode = srchContractCode.filter(code => contractCodeList.some((contract: any) => contract.contract_code === code))
    //                 setSrchContractCode(selectedContractCode)
    //             }
    //             else if (!contractCodeList.some((contract: any) => contract.contract_code === srchContractCode)){
    //                 setSrchContractCode([])
    //             }
    //             setDataContract(contractCodeList); 
    //         } else {
    //             setDataShipper([]);
    //             setDataContract([]);
    //         }
    //     });
    // }, [srchGasDayFrom, srchGasDayTo])

    return (
        <div className="space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    {/* <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        isDefaultYesterday={true}
                        onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                        customWidth={200}
                    /> */}
                    <DatePickaSearch
                        key={"gas_day_from" + key}
                        label="Gas Day From"
                        placeHolder="Select Gas Day From"
                        allowClear
                        defaultValue={srchGasDayFrom}
                        isDefaultYesterday={!start_date_from_somewhere_else}
                        onChange={(e: any) => setSrchGasDayFrom(e ?? null)}
                        customWidth={200}
                    />

                    <DatePickaSearch
                        key={"gas_day_to" + key}
                        label="Gas Day To"
                        placeHolder="Select Gas Day To"
                        allowClear
                        defaultValue={srchGasDayTo}
                        isDefaultYesterday={!end_date_from_somewhere_else}
                        onChange={(e: any) => setSrchGasDayTo(e ?? null)}
                        customWidth={200}
                    />

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 ?
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                // type="select"
                                type="select-multi-checkbox"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                // value={srchShipperName}
                                value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipperName}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                // options={dataShipper?.map((item: any) => ({
                                //     value: item?.id?.toString(),
                                //     label: item.name
                                // }))}
                                options={dataShipper?.length > 0 ? dataShipper?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                    userDT?.account_manage?.[0]?.user_type_id == 3
                                        ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                        : true
                                )
                                    .map((item: any) => ({
                                        value: item.id_name,
                                        label: item.name,
                                    })) : []
                                }
                            />
                            :
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select"
                                isDisabled={true}
                                value={userDT?.account_manage?.[0]?.group?.id_name}
                                onChange={(e) => setSrchShipperName(e.target.value)}
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
                            />
                    }

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        options={dataContract?.filter((contract: any) => srchShipperName?.length > 0 ? srchShipperName.includes(contract?.group?.id_name ?? '') : true).map((item: any) => ({
                            value: item?.contract_code,
                            label: item?.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchNomPoint"
                        label="Nomination Point / Concept Point"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchNomPoint}
                        onChange={(e) => setSrchNomPoint(e.target.value)}
                        options={dataNomConcept?.map((item: any) => ({
                            value: item.concept_point,
                            label: item.concept_point
                        }))}
                        placeholder="Search Nomination Point / Concept Point"
                    />

                    {/* Filter Status ปรับเป็น Multi Select https://app.clickup.com/t/86eu498k6 */}
                    {/* <InputSearch
                        id="searchStatus"
                        label="Status"
                        type="select"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={allocationStatusMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    /> */}

                    <InputSearch
                        id="searchStatus"
                        label="Status"
                        type="select-multi-checkbox"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={allocationStatusMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    <InputSearch
                        id="searchShipperAllo"
                        label="Shipper Allocation Checking"
                        // type="select"
                        type="select-multi-checkbox"
                        customWidth={270}
                        value={srchShipperAlloc}
                        onChange={(e) => setSrchShipperAlloc(e.target.value)}
                        options={[
                            { value: "correct", label: "Correct" },
                            { value: "incorrect", label: "Incorrect" },
                        ]}
                    />

                    <InputSearch
                        id="searchReviewCode"
                        label="Review Code"
                        value={srchReviewCode}
                        onChange={(e) => setSrchReviewCode(e.target.value)}
                        placeholder="Search Review Code"
                    />

                    <section className="mt-2 sm:mt-auto">
                        <Button
                            className="flex items-center justify-center gap-3 px-2 w-[35px] h-[35px] bg-[#00ADEF]"
                            onClick={handleFieldSearch}
                        >
                            <Search style={{ fontSize: "16px" }} />
                        </Button>
                    </section>

                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex gap-2">
                        {
                            userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                            <Button
                                className="flex items-center justify-center px-2 h-[44px] bg-[#1473A1] font-light w-[120px] text-center"
                                onClick={() => openSendEmail()}
                                disabled={!(userPermission?.f_approved || false)}
                            >
                            <span className="capitalize">{`Send Email`}</span>
                        </Button>
                        }
                        {
                            haveAllocationModePermission &&
                        <Button className="flex items-center justify-center px-2 h-[44px] bg-[#3582D5] font-light w-[155px] text-center" onClick={() => gotoPageChangeAllocMode()}>
                            <span className="capitalize">{`Change Alloc Mode`}</span>
                        </Button>
                        }
                        {
                            userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                            <Button
                                className="flex items-center justify-center px-2 h-[44px] bg-[#00ADEF] font-light w-[130px] text-center"
                                onClick={() => openExecuteForm()}
                                disabled={!(userPermission?.f_create || false)}
                            >
                            <span className="capitalize">{`Alloc & Bal`}</span>
                        </Button>
                        }
                    </div>
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start pb-4">
                        <div className="w-[50%] flex flex-column items-center justify-start gap-4">

                            {/* FAT-SPAIN เพิ่มคำอธิบาย Highligh เป็น tool tip ว่า "Red text mean Shipper Review is not equal to metering value" */}
                            <CustomTooltip
                                title={
                                    <div>
                                        <p className="text-[#464255] font-light">{`Red text mean Shipper Review is not equal to metering value`}</p>
                                    </div>
                                }
                                placement="top-end"
                                arrow
                            >
                                <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                                    <InfoOutlinedIcon
                                        style={{ fontSize: "11px", color: '#747474', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                    />
                                </div>
                            </CustomTooltip>

                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>

                            <button
                                onClick={() => openAccpetModal()}
                                className="flex justify-center items-center px-5 py-2 rounded-md duration-300"
                                style={{ cursor: selectedItem?.length == 0 ? 'not-allowed' : 'pointer', background: selectedItem?.length == 0 ? '#AEAEB2' : '#C2F5CA', color: selectedItem?.length == 0 ? '#FFF' : '#464255' }}
                                disabled={selectedItem?.length == 0 ? true : false}>
                                <span className="mr-4">{'Accept'}</span> <CheckIcon sx={{ fontSize: '15px' }} />
                            </button>

                            <button
                                onClick={() => openRejectModal()}
                                className="flex justify-center items-center px-5 py-2 rounded-md duration-300"
                                style={{
                                    cursor: selectedItem?.length == 0 ? 'not-allowed' : 'pointer',
                                    background: selectedItem?.length == 0 ? '#FFF' : '#FFF3C8',
                                    border: selectedItem?.length == 0 ? '1px solid #AEAEB2' : 'none',
                                    color: selectedItem?.length == 0 ? '#AEAEB2' : '#464255'
                                }}
                                disabled={selectedItem?.length == 0 ? true : false}
                            >
                                <span className="mr-4">{'Reject'}</span>
                                <CloseIcon sx={{ fontSize: '15px' }} />
                            </button>

                        </div>
                        <div className="w-[50%] flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                generalFunc={() => {
                                    epAllocationAllocationManagement({
                                        name: `Allocation Management`,
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility,
                                        // resData: sortedData,
                                        resData: filteredDataTable,
                                    })
                                }}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                            {/* <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                data2={getStartAndEndDateForApi((srchGasDayFrom ?? toDayjs().toISOString()), (srchGasDayTo ?? toDayjs().toISOString()))}
                                path="allocation/allocation-management"
                                specificMenu='allocation-mgn'
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificData={
                                    {
                                        // skip: ,
                                        // limit: 
                                    }
                                }
                            /> */}
                        </div>

                    </div>
                </div>
                <TableAlloManage
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    selectedItem={selectedItem}
                    setselectedItem={setselectedItem}
                    openHistoryForm={openHistoryForm}
                    openReasonModal={openReasonModal}
                    sortedData={sortedData}
                    setSortedData={setSortedData}
                    filteredDataTable={filteredDataTable}
                    setFilteredDataTable={setFilteredDataTable}
                    checkedData={checkedData} 
                    setcheckedData={setcheckedData}
                />
            </div>

            <PaginationComponent
                // totalItems={totalItems} // Use total count from API
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                
                currentPage={currentPage}
                // onPageChange={(page) => setCurrentPage(page)}
                // onItemsPerPageChange={(perPage) => {
                //     setItemsPerPage(perPage);
                //     setCurrentPage(1); // Reset to first page when items per page changes
                // }}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            {/* 1. กด execute */}
            <ModalExecute
                data={[]}
                dataCloseBal={closeBalanceData}
                isLoading={executeLoading}
                open={mdExcuteOpen}
                onClose={() => {
                    setMdExecuteOpen(false);
                    if (resetForm) resetForm();
                }}
                onSubmitUpdate={handleFormSubmitUpdate}
            />

            {/* 2. แสดง */}
            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                stat="process"
                title="Allocation and Balancing Execution"
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
                open={mdAcceptSuccessOpen}
                handleClose={() => setMdAcceptSuccessOpen(false)}
                title="Success"
                description={`Your selection have been accepted.`}
            />

            <ModalComponent
                open={mdRejectSuccessOpen}
                handleClose={() => setMdRejectSuccessOpen(false)}
                title="Success"
                description={`Your selection has been rejected.`}
            />

            <ModalComponent
                open={mdEmailSentSuccessOpen}
                handleClose={() => setMdEmailSentSuccessOpen(false)}
                title="Success"
                description={`The email has been sent.`}
            />

            <ConfirmModal
                open={isAcceptClick}
                handleClose={() => setIsAcceptClick(false)}
                handleConfirm={() => validateHandle()}
                // handleConfirm={() => closeConfirmModal()}
                // title={`${mdConfirmMsg}`}
                title="Confirm Acceptance"
                btnText='Accept'
                description="To proceed, click 'Accept'."
            />

            <ConfirmModal
                open={isRejectClick}
                handleClose={() => setIsRejectClick(false)}
                handleConfirm={() => rejectHandle()}
                // handleConfirm={() => closeConfirmModal()}
                // title={`${mdConfirmMsg}`}
                title="Confirm Rejection"
                btnText='Reject'
                description="To proceed, click 'Reject'."
            />

            <ConfirmModal
                open={modalWarningOpen}
                handleClose={() => setModalWarningOpen(false)}
                handleConfirm={() => acceptHandle()}
                stat='confirm'
                // handleConfirm={() => closeConfirmModal()}
                // title={`${mdConfirmMsg}`}
                title="Warning"
                btnText='Accept'
                description={modalWarningMsg}
            />

            <ModalRejectAllocReview
                open={mdRejectOpen}
                handleClose={() => setMdRejectOpen(false)}
                // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', 'reject')}
                onSubmitUpdate={(e: any) => modalRejectAllocReview(e)}
                data={dataReject}
                mode={'reject'}
            />

            <ModalSendEmail
                open={mdSendEmail}
                handleClose={() => setMdSendEmail(false)}
                // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', 'reject')}
                onSubmitUpdate={(e: any) => handleSendEmail(e)}
                data={sendEmailData}
                dataEmail={sendEmailData}
                mode={'xxxx'}
                isLoading={isLoading}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="allocation-management"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
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

        </div>
    )
}

export default ClientPage;