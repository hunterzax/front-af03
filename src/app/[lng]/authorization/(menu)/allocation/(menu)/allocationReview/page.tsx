"use client";
import { useEffect, useRef, useState } from "react";
import { Tune } from "@mui/icons-material"
import { fillMissingUpdateByAccount, filterTodayInRangeStartEndDate, findRoleConfigByMenuName, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNoComma, generateUserPermission, getDateRangeForApi, removeComma, toDayjs } from '@/utils/generalFormatter';
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, patchService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import ModalFiles from "./form/modalFiles";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import ModalComment from "./form/modalComment";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import ModalAcceptReject from "./form/modalAcceptReject";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import TableAllocationReview from "./form/table";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { useForm } from "react-hook-form";
import ModalImport from "./form/modalImport";
import ModalHistory from "@/components/other/modalHistory";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useSearchParams } from "next/navigation";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault("Asia/Bangkok")

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    const hasFetchedRef = useRef(false);
    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    const searchParams = useSearchParams();
    const status_from_somewhere_else = searchParams.get("status");
    const start_date_from_somewhere_else = searchParams.get("start-date");
    const end_date_from_somewhere_else = searchParams.get("end-date");
    const [useParams, setuseParams] = useState<boolean>(false);

    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataShipperThatHaveActiveContract, setDataShipperThatHaveActiveContract] = useState<any>([]);
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataContractForTemplate, setDataContractForTemplate] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [areaMasterMix, setAreaMasterMix] = useState<any>([]);
    const [dataNomConcept, setDataNomConcept] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);
    const [dataSystemParam, setDataSystemParam] = useState<any>();

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Allocation Review', userDT)
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
    const { nominationTypeMaster, areaMaster, zoneMaster, allocationStatusMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // if (forceRefetch || !shipperGroupData?.data) {
        //     dispatch(fetchShipperGroup());
        // }
        if (forceRefetch || !nominationTypeMaster?.data) {
            dispatch(fetchNominationType());
        }
        if (forceRefetch || !areaMaster?.data) {
            dispatch(fetchAreaMaster());
        }
        if (forceRefetch || !zoneMaster?.data) {
            dispatch(fetchZoneMasterSlice());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, nominationTypeMaster, areaMaster, zoneMaster]); // Watch for forceRefetch changes

    // ############### MODE SHOW DATA ###############
    // 1 = table, 2 = nomination code view
    const [divMode, setDivMode] = useState<any>('1'); // 1 == table, 2 == nom_code click

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState('');
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchTypeDocument, setSrchTypeDocument] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [srchStatus, setSrchStatus] = useState<any>([]);
    const [srchCheckbox, setSrchCheckbox] = useState(false);
    const [isUpload, setIsUpload] = useState(false);
    const [srchZone, setSrchZone] = useState<any>([]);
    const [srchArea, setSrchArea] = useState<any>([]);
    const [srchReviewCode, setSrchReviewCode] = useState('');
    const [srchNomConcept, setSrchNomConcept] = useState<any>([]);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);

    const getStartAndEndDateForApi = (gasDayFrom: any, gasDayTo: any) => {
        try {
            let from: any = gasDayFrom ? dayjs(gasDayFrom) : null;
            let to: any = gasDayTo ? dayjs(gasDayTo) : null;
            if (from && !to) {
                // ถ้าไม่มี to → set เป็นสิ้นปีเดียวกัน
                to = from.endOf("year");
            }

            if (to && !from) {
                // ถ้าไม่มี from → set เป็นต้นปีเดียวกัน
                from = to.startOf("year");
            }

            return getDateRangeForApi(from.toDate(), to.toDate());
        } catch (error) {
            return {
                start_date: undefined,
                end_date: undefined
            }
        }
    }

    const handleFieldSearch = async () => {
        console.log('1');
        setIsLoading(false);
        let dataOnlyTargetPoint = []

        // v2.0.89 filter gas day แล้วข้อมูลไม่ขึ้น แม้ว่าตอนเข้ามามีค่า default แสดงอยู่ https://app.clickup.com/t/86eumvxdq
        const { start_date, end_date } = getStartAndEndDateForApi(srchStartDate, srchEndDate);

        const skip = (currentPage - 1) * itemsPerPage
        const res_alloc_review: any = await getService(`/master/allocation/allocation-review?start_date=${start_date}&end_date=${end_date}&skip=${skip}&limit=100&ignoreDetail=true&share=${watch('filter_sharing_meter') ? 'on' : 'off'}`);

        // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wra
        dataOnlyTargetPoint = filterConcept(res_alloc_review)

        // let filtered_data_alloc: any = res_alloc_review
        let filtered_data_alloc: any = dataOnlyTargetPoint

        // if (watch('filter_sharing_meter')) {
        //     // /** รวม shipper ต่อ point */
        //     // const pointToShippers: Record<string, Set<string>> = {};
        //     // (filtered_data_alloc ?? []).forEach(({ point, shipper }: any) => { (pointToShippers[point] ??= new Set()).add(shipper); });

        //     // /** เก็บเฉพาะแถวที่ point นั้นมี shipper มากกว่า 1 ราย */
        //     // const sharingMeterRows = filtered_data_alloc.filter((row: any) => pointToShippers[row.point].size > 1);
        //     // filtered_data_alloc = sharingMeterRows

        //     // เอาใหม่ https://app.clickup.com/t/86ev29x12
        //     const pointToShippers: Record<string, Set<string>> = {};
        //     (filtered_data_alloc ?? []).forEach(({ relation_point, shipper }: any) => { (pointToShippers[relation_point] ??= new Set()).add(shipper); });

        //     const sharingMeterRows = filtered_data_alloc.filter((row: any) => pointToShippers[row.relation_point].size > 1);
        //     filtered_data_alloc = sharingMeterRows
        // }

        // ปั้น data add shipper
        const updatedDataAllocReview = addShipperToData(filtered_data_alloc)
        const srchAreaName = areaMaster?.data?.filter((item: any) => srchArea.includes(`${item.id}`))?.map((item: any) => `${item.name ?? ''}`.trim().toLowerCase()) ?? []
        const result_2 = updatedDataAllocReview?.filter((item: any) => {
            return (
                // (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true) &&
                (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper?.id_name) : true) && // Shipper ไม่เห็นข้อมูลอะไรเลย https://app.clickup.com/t/86eub6d4a
                (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract) : true) &&
                // (srchZone ? srchZone == item?.zone_obj?.name : true) &&
                // (srchArea ? item?.area_obj?.id == srchArea : true) &&

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                (srchZone?.length > 0 ? srchZone.includes(item?.zone) : true) &&
                (srchAreaName?.length > 0 ? srchAreaName.includes(`${item?.area_obj?.name ?? item?.area ?? ''}`.trim().toLowerCase()) : true) &&

                (srchNomConcept?.length > 0 ? srchNomConcept.includes(item?.point) : true) &&
                (srchStatus?.length > 0 ? srchStatus.includes(item?.allocation_status?.id.toString()) : true) &&
                (srchReviewCode !== '' ? item?.review_code?.replace(/\s+/g, '').toLowerCase().trim().includes(srchReviewCode.replace(/\s+/g, '').toLowerCase().trim()) : true)
            );
        });

        // DATA CONTRACT CODE
        const data_contract_code_de_dup = Array.from(
            new Map(dataOnlyTargetPoint?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group }])).values()
        );
        setDataContract(data_contract_code_de_dup);
        setDataContractOriginal(data_contract_code_de_dup)

        // DATA NOMI POINT CONCEPT POINT
        const data_nom_point_concept_point_de_dup = Array.from(
            new Map(dataOnlyTargetPoint?.map((item: any) => [item.point, { point_name: item.point, area: item.area_obj }])).values()
        );

        const fShip = dataShipper?.find((f: any) => f?.id === userDT?.account_manage?.[0]?.group_id)?.shipper_contract_point || []
        const f_data_nom_point_concept_point_de_dup = data_nom_point_concept_point_de_dup?.filter((f: any) => {
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                return fShip?.flatMap((fm: any) => fm?.contract_point?.nomination_point_list?.map((ifm: any) => ifm?.nomination_point))?.includes(f?.point_name)
            } else {
                const fShip_tso = srchShipperName?.length > 0 ? (dataShipper?.filter((f: any) => srchShipperName?.includes(f?.id_name))?.map((e_: any) => e_?.shipper_contract_point) || [])?.flat() : []
                return srchShipperName?.length > 0 ? fShip_tso?.flatMap((fm: any) => fm?.contract_point?.nomination_point_list?.map((ifm: any) => ifm?.nomination_point))?.includes(f?.point_name) : f
            }
        })
       
        if (data_nom_point_concept_point_de_dup?.length > 0) {
            const uniqueItems = Array.from(
                new Map(
                    (f_data_nom_point_concept_point_de_dup || []).map((item: any) => [
                        item.point_name,
                        item,
                    ])
                ).values()
            );

            setDataNomConcept(uniqueItems);
        } else {
            setDataNomConcept([]);
        }
       

        setIsLoading(true);
        setCurrentPage(1)
        // กรองเอาแค่ shipper
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            const data_only_shipper = result_2?.filter((item: any) => item?.group?.id === userDT?.account_manage?.[0]?.group?.id)
            setData(data_only_shipper);
            setFilteredDataTable(data_only_shipper);

        } else {
            setData(result_2);
            setFilteredDataTable(result_2);
        }

        // setData(result_2);
        // setFilteredDataTable(result_2);
    };

    const handleReset = async () => {
        setValue('filter_sharing_meter', false) // R : v2.0.27 คลิก refresh แล้ว ควรเคลียร์ checkbox sharing Meter ด้วย https://app.clickup.com/t/86et9k5bu
        setSrchShipper('');
        setSrchTypeDocument('');
        setSrchContractCode([]);
        setSrchStatus([]);
        setSrchZone([]);
        setSrchArea([]);
        setSrchCheckbox(false)
        setSrchNomConcept([])

        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            setSrchShipperName([])
        }

        setSrchReviewCode('')

        setSrchStartDate(null)
        setSrchEndDate(null)

        setDataContract(dataContractOriginal)
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);

        setIsLoading(false);
        fetchData();
    };

    useEffect(() => {
        if (isUpload) {
            handleFieldSearch();
            setIsUpload(false)
        }
    }, [isUpload])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
        const filtered = dataTable?.filter(
            (item: any) => {
                let nominationValue = item?.nominationValue;
                let systemAllocation = item?.systemAllocation;
                let previousAllocationTPAforReview = item?.previousAllocationTPAforReview;
                if (typeof item?.nominationValue === 'number') {
                    nominationValue = item?.nominationValue?.toString();
                }
                if (typeof item?.systemAllocation === 'number') {
                    systemAllocation = item?.systemAllocation?.toString();
                }
                if (typeof item?.previousAllocationTPAforReview === 'number') {
                    previousAllocationTPAforReview = item?.previousAllocationTPAforReview?.toString();
                }

                return (
                    item?.allocation_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // item?.entry_exit?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // https://app.clickup.com/t/9018502823/86eub6d0j
                    // item?.zone?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.zone_obj?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.area?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    nominationValue?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    removeComma(nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    systemAllocation?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(systemAllocation)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(systemAllocation)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    previousAllocationTPAforReview?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(previousAllocationTPAforReview)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(previousAllocationTPAforReview)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.review_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1)
        setFilteredDataTable(filtered);
    };



    // ############### DATA TABLE ###############




    const addShipperToData = (data: any, temp?: any) => {
        // ปั้น data add shipper
        const updatedDataDaily = data?.map((item: any) => {
            const find_shipper = ((temp || dataShipper) || [])?.find((itemx: any) => itemx?.id_name == item?.shipper)
            return {
                ...item,
                shipper: find_shipper,
            };
        });

        return updatedDataDaily
    }

    // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wra
    const filterConcept = (data?: any) => {
        const res_filter = data?.filter((item: any) => `${item?.point_type ?? ''}`.trim().toLowerCase() != 'concept' || ['East_to_RA6', 'West_to_RA6', 'East_to_BVW10', 'West_to_BVW10'].includes(item?.point))
        return res_filter || []
    }

    function formatTimeZone(dateString: any) {
        return dayjs(dateString)
            .tz("Asia/Bangkok")
            .format("ddd MMM DD YYYY HH:mm:ss [GMT+0700] (เวลาอินโดจีน)");
    }

    // filter ต้องเห็นแค่ของ shipper ตัวเองที่มีสิทธิ์เท่านั้น https://app.clickup.com/t/86ex1w2zz
    const findGroupAreaCaseShipper = async () => {
        const res_shipper: any = await getService(`/master/account-manage/group-master?user_type=3`);
        const data_only_your_shipper = res_shipper?.filter((item: any) => item?.id === userDT?.account_manage?.[0]?.group?.id)

        // เอา area จาก contract_point
        if (data_only_your_shipper?.length > 0) {
            const filter_area_from_contract_points = data_only_your_shipper?.[0]?.shipper_contract_point?.map((item: any) => {
                const area = item?.contract_point?.area;
                if (!area) return null;

                return {
                    "id": item?.contract_point?.area?.id,
                    "name": item?.contract_point?.area?.name,
                    "create_date": item?.contract_point?.area?.create_date,
                    "update_date": item?.contract_point?.area?.update_date,
                    "create_date_num": item?.contract_point?.area?.create_date_num,
                    "update_date_num": item?.contract_point?.area?.update_date_num,
                    "create_by": item?.contract_point?.area?.create_by,
                    "update_by": item?.contract_point?.area?.update_by,
                    "active": item?.contract_point?.area?.active,
                    "start_date": item?.contract_point?.area?.start_date,
                    "end_date": item?.contract_point?.area?.end_date,
                    "description": item?.contract_point?.area?.description,
                    "area_nominal_capacity": item?.contract_point?.area?.area_nominal_capacity,
                    "zone_id": item?.contract_point?.area?.zone_id,
                    "zone": item?.contract_point?.area?.zone,
                    "entry_exit_id": item?.contract_point?.area?.entry_exit_id,
                    "color": item?.contract_point?.area?.color,
                    "supply_reference_quality_area": item?.contract_point?.area?.supply_reference_quality_area
                }
            })
            ?.filter(Boolean) || [];


            const removed_duplicate_area = Array.from(
                new Map(
                    filter_area_from_contract_points.map((a: any) => {
                        const normalizedName = `${a?.name ?? ''}`.trim().toLowerCase();
                        const key = normalizedName ? `name:${normalizedName}` : `id:${a?.id ?? ''}`;
                        return [key, a];
                    })
                ).values()
            );

            setAreaMasterMix(removed_duplicate_area);
        }
    }

    const fetchData = async () => {
        try {
            // กรณี shipper เข้ามาเห็นของตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.id_name])

                findGroupAreaCaseShipper();
            }else{
                setAreaMasterMix(areaMaster?.data)
            }

            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)
            const res_shipper_that_have_active_contract = await getService(`/master/allocation/allocation-review-shipper-data`);
            console.log('res_shipper_that_have_active_contract : ', res_shipper_that_have_active_contract);
            setDataShipperThatHaveActiveContract(res_shipper_that_have_active_contract)

            const start_date = dayjs().format("YYYY-MM-DD")
            const end_date = dayjs().format("YYYY-MM-DD")

            // DATA MAIN
            //สำหรับ filter file ที่เกี่ยวข้องกับ URL
            const genFilterURL = (data: any) => {
                if (!useParams) {
                    const status: any = status_from_somewhere_else;
                    const findStatusMaster: any = allocationStatusMaster?.data?.find((item: any) => item?.name == status)?.id;
                    const resultFilter = data?.filter((item: any) => {
                        return (
                            (findStatusMaster ? item?.allocation_status?.id.toString() == findStatusMaster : true)
                        );
                    });
                    return resultFilter
                }

                return data
            }

            //ตัวแปร
            let res_API: any;
            if ((status_from_somewhere_else || start_date_from_somewhere_else || end_date_from_somewhere_else) && !useParams) {
                const status: any = status_from_somewhere_else;
                const start_date_URL: any = start_date_from_somewhere_else || start_date;
                const end_date_URL: any = end_date_from_somewhere_else || end_date;

                if (start_date_from_somewhere_else) {
                    const formatDate: any = formatTimeZone(start_date_from_somewhere_else);
                    setSrchStartDate(formatDate);
                }

                if (end_date_from_somewhere_else) {
                    const formatDate: any = formatTimeZone(end_date_from_somewhere_else);
                    setSrchEndDate(formatDate);
                }

                const findStatusMaster: any = allocationStatusMaster?.data?.find((item: any) => item?.name == status)?.id;
                setSrchStatus([findStatusMaster?.toString()]);
                console.log('2');
                res_API = await getService(`/master/allocation/allocation-review?start_date=${start_date_URL}&end_date=${end_date_URL}&skip=0&limit=100`);
                setuseParams(true);
            } else {
                console.log('3');
                res_API = await getService(`/master/allocation/allocation-review?start_date=${start_date}&end_date=${end_date}&skip=0&limit=100`);
            }

            let dataOnlyTargetPoint = []

            // เตรียมไว้ ---> concept point ให้ขึ้นแค่ point ของ East_to_RA6, West_to_RA6, East_to_BVW10, West_to_BVW10 https://app.clickup.com/t/86euz2wra
            dataOnlyTargetPoint = filterConcept(res_API)

            //result
            if (res_API?.status == 500) {
                setData([]);
                setFilteredDataTable([]);
            } else {

                const updatedDataAllocReview = addShipperToData(dataOnlyTargetPoint, res_shipper_name)

                if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                    const data_only_shipper = updatedDataAllocReview?.filter((item: any) => item?.group?.id === userDT?.account_manage?.[0]?.group?.id)

                    let result: any = status_from_somewhere_else ? genFilterURL(data_only_shipper) : data_only_shipper;

                    const data_only_shipper_ = result?.filter((f: any) => {
                        return f?.shipper?.shipper_contract_point?.flatMap((fm: any) => fm?.contract_point?.nomination_point_list?.map((ifm: any) => ifm?.nomination_point))?.includes(f?.point)
                    })

                    setData(data_only_shipper_);
                    setFilteredDataTable(data_only_shipper_);
                    // setData(data_only_shipper);
                    // setFilteredDataTable(result);

                } else {
                    let result: any = status_from_somewhere_else ? genFilterURL(updatedDataAllocReview) : updatedDataAllocReview;

                    const data_only_shipper_ = result?.filter((f: any) => {
                        return f?.shipper?.shipper_contract_point?.flatMap((fm: any) => fm?.contract_point?.nomination_point_list?.map((ifm: any) => ifm?.nomination_point))?.includes(f?.point)
                    })

                    setData(data_only_shipper_);
                    setFilteredDataTable(data_only_shipper_);
                    // setData(updatedDataAllocReview);
                    // setFilteredDataTable(result);
                }
            }

            // DATA GROUP
            // เอา List > Filter Shipper Name ให้กรองมาเฉพาะ Shipper ที่มีอยู่ในหน้านี้ https://app.clickup.com/t/86erwpj4q
            // const uniqueGroups = Array.from(
            //     new Map(response.map((item: any) => [item.group.id, item.group])).values()
            // );
            // setDataShipper(uniqueGroups);

            // DATA CONTRACT CODE
            const data_contract_code_de_dup = Array.from(
                // new Map(res_API?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group }])).values()
                new Map(dataOnlyTargetPoint?.map((item: any) => [item.contract, { contract_code: item.contract, group: item.group }])).values()
            );
            setDataContract(data_contract_code_de_dup);
            setDataContractOriginal(data_contract_code_de_dup)

            // DATA CONTRACT CODE สำหรับ TEMPLATE
            // const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
            // setDataContractForTemplate(res_contract_code);
            setDataContractForTemplate(res_shipper_that_have_active_contract.flatMap((item: any) => item.contract_code))

            // DATA NOMI POINT CONCEPT POINT
            const data_nom_point_concept_point_de_dup = Array.from(
                // new Map(res_API?.map((item: any) => [item.point, { point_name: item.point, area: item.area_obj }])).values()
                new Map(dataOnlyTargetPoint?.map((item: any) => [item.point, { point_name: item.point, area: item.area_obj }])).values()
            );

            const fShip = res_shipper_name?.find((f: any) => f?.id === userDT?.account_manage?.[0]?.group_id)?.shipper_contract_point || []

            const f_data_nom_point_concept_point_de_dup = data_nom_point_concept_point_de_dup?.filter((f: any) => {
                if (userDT?.account_manage?.[0]?.user_type_id == 3) {

                    return fShip?.flatMap((fm: any) => fm?.contract_point?.nomination_point_list?.map((ifm: any) => ifm?.nomination_point))?.includes(f?.point_name)
                } else {
                    return f
                }
            })

            setDataNomConcept(f_data_nom_point_concept_point_de_dup);
           


            // DATA ZONE แบบไม่ซ้ำ
            const data_zone_de_dup = Array.from(
                new Map(zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])).values()
            );
            setDataZoneMasterZ(data_zone_de_dup);

            // DATA SYSTEM PARAMETER
            // ที่หน้า alloc review
            // เช็ค param ชื่อ Onshore: Number of days after allocation when shipper can create allocation review
            // เอา value มาใช้ --> 
            // Value ที่ใส่มาหมายถึง : จำนวนวันที่ Shipper จะสามารถทำการ Review ค่าย้อนหลังได้ 
            // เช่น ถ้า Set DAM > Parameter ไว้เป็น 30 วัน TODAY คือ 01-07-2025 
            //      แสดงว่า Shipper จะเห็นปุ่ม edit ของรายการ Allocation ทั้งหมดตั้งแต่ today ย้อนหลังไป 30 วัน จนถึง01-06-2025 
            //      แต่ถ้าย้อนหลังไปไกลกว่า 30 วัน Shipper จะไม่สามารถทำการ edit เพื่อ allocated ค่าย้อนหลังได้แล้ว
            const res_system_parameter: any = await getService(`/master/parameter/system-parameter`);
            const filter_system_parameter = res_system_parameter?.filter((item: any) => item?.system_parameter?.name == "Onshore: Number of days after allocation when shipper can create allocation review")
            const res_filter_system_parameter = filterTodayInRangeStartEndDate(filter_system_parameter)
            console.log('res_filter_system_parameter : ', res_filter_system_parameter);
            setDataSystemParam(res_filter_system_parameter)

            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchData();
    // }, [resetForm]);

    useEffect(() => {
        if (hasFetchedRef.current) return;

        hasFetchedRef.current = true;

        void fetchData();
    }, []);

    // ############# RE-GENERATE  #############
    const [dataRegen, setDataReGen] = useState<any>([]);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

    const handleCloseModal = () => {
        setModalSuccessOpen(false);
    }

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);

    const handleFormSubmit = async (data: any) => {
        const url = `/master/allocation/shipper-allocation-review/${formData?.id}`;

        const dynamicFields = {
            shipper_allocation_review: data?.shipper_review_allocation,
            comment: data?.comment,
            row_data: formData
        };

        switch (formMode) {
            case "create":
                // nothing
                break;
            case "edit":
                let res_edit = await patchService(url, dynamicFields);
                const statusCodePatch = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                const errorMsgPatch = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

                if (statusCodePatch === 400 || statusCodePatch === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsgPatch || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Your changes have been saved.')
                    setModalSuccessOpen(true);
                }
                break;
        }
        await handleFieldSearch(); // 030725 : Edit ตอนใส่ข้อมูลเสร็จแล้วกด save ระบบออกมาหน้า list แต่ข้อมูลที่ filter ไว้ก่อนหน้าต้องยังอยู่ https://app.clickup.com/t/86eu21mfj
        if (resetForm) resetForm(); // reset form
    };


    

    const openEditForm = (id: any) => {
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('edit');
        setFormData(filteredData);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        setFormMode('view');
        setFormData(filteredData);
        setFormOpen(true);
    };

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAllFileModal = (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataFile(filtered)
        setMdFileView(true)
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

    // ############### MODAL SUBMISSION COMMENTS ###############
    // const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    // const [dataSubmission, setDataSubmission] = useState<any>([]);
    // const openSubmissionModal = (id?: any, data?: any) => {

    //     const filtered = dataTable?.find((item: any) => item.id === id);
    //     setDataSubmission(filtered)
    //     setMdSubmissionView(true)
    // };

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
        if (filteredDataTable && Array.isArray(filteredDataTable)) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            // setPaginatedData(filteredDataTable)
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'nom_point_concept_point', label: 'Nomination Point / Concept Point', visible: true },
        // { key: 'entry_exit', label: 'Entry / Exit', visible: true }, // https://app.clickup.com/t/9018502823/86eub6d0j
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'nominated_value', label: 'Nominated Value (MMBTU/D)', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'previous_allocation_tpa_for_review', label: 'Previous Allocation TPA for Review (MMBTU/D)', visible: true },
        { key: 'shipper_review_allocation', label: 'Shipper Review Allocation (MMBTU/D)', visible: true },
        { key: 'review_code', label: 'Review Code', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'status', label: 'Status', visible: true },
        { key: 'system_allocation', label: 'System Allocation (MMBTU/D)', visible: true },
        { key: 'previous_allocation_tpa_for_review', label: 'Previous Allocation TPA for Review (MMBTU/D)', visible: true },
        { key: 'shipper_review_allocation', label: 'Shipper Review Allocation (MMBTU/D)', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        // { key: 'created_by', label: 'Created by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

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

    // ############### ACCEPT REJECT ###############
    const [modeUpdateStat, setModeUpdateStat] = useState<any>('');
    const [mdStatType, setMdStatType] = useState<any>('all');
    const [mdUpdateStat, setMdUpdateStat] = useState(false);
    const [idUpdateStat, setIdUpdateStat] = useState([]);
    const [dataModalAcceptReject, setDataModalAcceptReject] = useState([]);

    const handleAcceptReject = async (id?: any, mode?: any) => {
        id = id.map((item: any) => item.id);
        if (id?.length > 1) {
            setMdStatType('all')
        } else {
            const filter_data_x = dataTable.filter((item: any) => item.id === id[0]);
            setDataModalAcceptReject(filter_data_x)
            setMdStatType('one')
        }
        setIdUpdateStat(id)
        setModeUpdateStat(mode)
        setMdUpdateStat(true)
    }

    const updateAcceptReject = async (data?: any) => {
        let body_post = {
            id: idUpdateStat,
            status: modeUpdateStat == 'accept' ? 2 : 3,
            comment: data.reason
        }

        try {
            const res_ = await postService('/master/daily-management/update-status', body_post);
            const statusCode = res_?.response?.data?.statusCode ?? res_?.response?.data?.status ?? res_?.status ?? res_?.statusCode ?? res_?.code ?? res_?.response?.status;
            const errorMsg = res_?.response?.data?.error ?? res_?.data?.error ?? res_?.response?.error ?? res_?.error;

            if (statusCode === 400 || statusCode === 500) {
                setFormOpen(false);
                setModalErrorMsg(errorMsg || '');
                setModalErrorOpen(true)
            } else {
                setFormOpen(false);

                const action = modeUpdateStat === 'accept' ? 'approved' : 'rejected';
                const fileType = mdStatType === 'all' ? 'All File' : 'File';

                setModalSuccessMsg(`${fileType} has been ${action}.`);
                setModalSuccessOpen(true);
                setMdUpdateStat(false);
                fetchData();
                setSelectedRoles([]) // clear ที่ select re-gen
            }
        } catch (error) {
            throw error
        }
    }

    const filterData = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);
        return filteredData
    }

    const [dataNomCode, setDataNomCode] = useState()

    const handleNomCodeClick = (id?: any) => {
        let data = filterData(id);

        // setDataContractTermType(data?.term_type)
        setDataNomCode(data)
        setDivMode('2');
        // localStorage.setItem("x2y77nvd3sw2v9b1r3z", encryptData('2')); // div mode
        // localStorage.setItem("w5j5u3kld1,7p1m4r6p", encryptData(Number(id))); // nom code id
    };


    // #region import
    // =================== MODAL IMPORT ===================
    const [formActionOpen, setformActionOpen] = useState(false); // open modal action
    const openTemplateForm = () => {
        setformActionOpen(true);
    };

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
            // const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == filteredData?.shipper)

            const res_for_header_of_history = [
                {
                    "title": "Shipper Name",
                    // "value": find_shipper?.name
                    "value": filteredData?.group ? filteredData?.group?.name : ''
                },
                {
                    "title": "Zone",
                    "value": filteredData?.zone
                }
            ]

            const response: any = await getService(`/master/account-manage/history?type=allocation-review&method=all&id_value=${id}`);
            const valuesArray = response.map((item: any) => item.value);

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
    //     const startDate = srchStartDate ? dayjs(srchStartDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
    //     const endDate = srchEndDate ? dayjs(srchEndDate).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
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
    // }, [srchStartDate, srchEndDate])
    

    return (<>
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day From"}
                        placeHolder={"Select Gas Day From"}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                        defaultValue={srchStartDate}
                    />

                    <DatePickaSearch
                        key={"end" + key}
                        label={"Gas Day To"}
                        placeHolder={"Select Gas Day To"}
                        allowClear
                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                        defaultValue={srchEndDate}
                    />

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 ?
                            <InputSearch
                                id="searchShipperName"
                                label="Shipper Name"
                                type="select-multi-checkbox"
                                isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipperName}
                                onChange={(e) => setSrchShipperName(e.target.value)}
                                options={dataShipper
                                    ?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                        userDT?.account_manage?.[0]?.user_type_id == 3
                                            ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                            : true
                                    )
                                    .map((item: any) => ({
                                        value: item.id_name,
                                        label: item.name,
                                    }))
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
                        type="select-multi-checkbox"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        options={dataContract?.filter((contract: any) =>
                            srchShipperName?.length > 0 ? srchShipperName?.includes(contract?.group?.id_name) : true
                        ).map((item: any) => ({
                            value: item?.contract_code,
                            label: item?.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchZone}
                        onChange={(e) => {
                            setSrchZone(e.target.value);
                            setSrchArea(''); //for clear relate data
                        }}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <InputSearch
                        id="searchAreaName"
                        label="Area"
                        value={srchArea}
                        // type="select"
                        type="select-multi-checkbox"
                        onChange={(e) => {
                            setSrchArea(e.target.value)
                            setSrchNomConcept([])
                        }}
                        placeholder="Select Area"
                        // options={areaMaster?.data?.filter((item: any) =>
                        //     srchZone?.length > 0 ? srchZone?.includes(item?.zone?.name) :
                        //         item !== null)?.map((item: any) => (
                        //             {
                        //                 value: item?.id?.toString(),
                        //                 label: item.name
                        //             })
                        //         )
                        // }
                        options={areaMasterMix?.filter((item: any) =>
                            srchZone?.length > 0 ? srchZone?.some((zoneName: any) => zoneName?.trim().toLowerCase() === item?.zone?.name?.trim().toLowerCase()) :
                                item !== null)?.map((item: any) => (
                                    {
                                        value: item?.id?.toString(),
                                        label: item.name
                                    })
                                )
                        }
                    />

                    <InputSearch
                        id="searchNomPointConceptPoint"
                        label="Nomination Point / Concept Point"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchNomConcept}
                        onChange={(e) => setSrchNomConcept(e.target.value)}
                        options={dataNomConcept?.filter((item: any) =>
                            // srchArea ? item?.area?.id?.toString() == srchArea :
                            srchArea?.length > 0 ? srchArea.includes(item?.area?.id?.toString()) :
                                item !== null)?.map((item: any) => (
                                    {
                                        value: item.point_name,
                                        label: item.point_name
                                    })
                                )
                        }
                    />

                    <InputSearch
                        id="searchStatus"
                        label="Status"
                        // type="select"
                        type="select-multi-checkbox" // Filter Status ปรับเป็น Multi https://app.clickup.com/t/86eub6d0k
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={allocationStatusMaster?.data?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    <InputSearch
                        id="searchReviewCode"
                        label="Review Code"
                        value={srchReviewCode}
                        onChange={(e) => setSrchReviewCode(e.target.value)}
                        placeholder="Search Review Code"
                    />

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

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    {/* BTN ADD */}
                </aside>
            </div>
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div className="flex items-center space-x-2">
                        <div onClick={handleTogglePopover}>
                            <Tune
                                className="cursor-pointer rounded-lg"
                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            data2={getStartAndEndDateForApi((srchStartDate ?? toDayjs().toISOString()), (srchEndDate ?? toDayjs().toISOString()))}
                            path="allocation/allocation-review"
                            can_export={userPermission ? userPermission?.f_export : false}
                            // can_export={userPermission?.f_export && selectedRoles?.length > 0 ? true : false}
                            disable={selectedRoles?.length > 0 ? false : true}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                            specificMenu='allocation-review'
                            seletedId={selectedRoles}
                        />

                        <BtnGeneral
                            bgcolor={"#00ADEF"}
                            modeIcon={'export'}
                            textRender={"Import"}
                            generalFunc={() => openTemplateForm()}
                            can_export={userPermission ? userPermission?.f_export : false}
                        />
                    </div>
                </div>
                <TableAllocationReview
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openAllFileModal={openAllFileModal}
                    openReasonModal={openReasonModal}
                    // openSubmissionModal={openSubmissionModal}
                    setDataReGen={setDataReGen}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                    handleNomCodeClick={handleNomCodeClick}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    allData={filteredDataTable}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                    dataSystemParam={dataSystemParam}
                    userDT={userDT}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                />
            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                // totalItems={paginatedData?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            // onItemsPerPageChange={(perPage) => {
            //     setItemsPerPage(perPage);
            //     setCurrentPage(1); // Reset to first page when items per page changes
            // }}
            />

        </div>

        <ModalAction
            mode={formMode}
            data={formData}
            open={formOpen}
            dataTable={dataTable}
            dataShipper={dataShipper}
            dataContractOriginal={dataContractOriginal}
            nominationTypeMaster={nominationTypeMaster?.data}
            onClose={() => {
                setFormOpen(false);
                if (resetForm) {
                    setTimeout(() => {
                        resetForm();
                        setFormData(null);
                    }, 200);
                }
            }}
            onSubmit={handleFormSubmit}
            setResetForm={setResetForm}
        />

        <ModalImport
            mode={'template'}
            open={formActionOpen}
            setformActionOpen={setformActionOpen}
            setModalErrorMsg={setModalErrorMsg}
            setModalErrorOpen={setModalErrorOpen}
            setModalSuccessOpen={setModalSuccessOpen}
            setModalSuccessMsg={setModalSuccessMsg}
            shipperGroupData={dataShipperThatHaveActiveContract}
            // dataContractOriginal={dataContractOriginal}
            // dataContractOriginal={dataContract}
            dataContractOriginal={dataContractForTemplate} // R1 : 020725 : Import > Template > Field Contract code ต้องเห็นเฉพาะของตัวเอง https://app.clickup.com/t/86eu1djuc
            userDT={userDT}
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
            setIsUpload={setIsUpload}
        />

        <ModalHistory
            open={historyOpen}
            handleClose={handleCloseHistoryModal}
            tableType="allocation-review"
            title="History"
            data={historyData}
            head_data={headData}
            initialColumns={initialColumnsHistory}
            userPermission={userPermission}
        />

        <ModalComponent
            open={isModalSuccessOpen}
            handleClose={handleCloseModal}
            title="Success"
            description={`${modalModalSuccessMsg}`}
        />

        <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
                setModalErrorOpen(false);
                if (resetForm) resetForm();
            }}
            title="Failed"
            description=
            {
                modalErrorMsg?.split('<br/>')?.length > 1 ?
                    <ul className="text-start list-disc">
                        {
                            modalErrorMsg.split('<br/>').map(item => {
                                return (
                                    <li>{item}</li>
                                )
                            })
                        }
                    </ul>
                    :
                    <div className="text-center">
                        {`${modalErrorMsg}`}
                    </div>
            }
            stat="error"
        />

        <ModalComment
            data={dataReason}
            dataRow={dataReasonRow}
            open={mdReasonView}
            onClose={() => {
                setMdReasonView(false);
            }}
        />

        {/* <ModalSubmissionDetails
            data={dataSubmission}
            open={mdSubmissionView}
            onClose={() => {
                setMdSubmissionView(false);
            }}
        /> */}

        <ModalFiles
            data={dataFile}
            // dataGroup={dataGroup}
            // setModalMsg={setModalMsg}
            setModalSuccessOpen={setModalSuccessOpen}
            // setModalSuccessMsg={setModalSuccessMsg}
            open={mdFileView}
            onClose={() => {
                setMdFileView(false);
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


        <ModalAcceptReject
            data={dataNomCode}
            dataModalAcceptReject={dataModalAcceptReject}
            mode={modeUpdateStat}
            open={mdUpdateStat}
            type={mdStatType}
            onClose={() => {
                setMdUpdateStat(false);
            }}
            // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', modeUpdateStat)}
            onSubmit={updateAcceptReject}
        />
    </>

    );
};

export default ClientPage;