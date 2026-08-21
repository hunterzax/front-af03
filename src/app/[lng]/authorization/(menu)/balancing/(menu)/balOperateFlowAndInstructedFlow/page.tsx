"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ModalComponent from "@/components/other/ResponseModal";
import CheckboxSearch2, { InputSearch } from '@/components/other/SearchForm';
import { Tune } from "@mui/icons-material"
import { getService, postService, putService } from "@/utils/postService";
import SearchInput from "@/components/other/searchInput";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnExport from "@/components/other/btnExport";
import ModalHistory from "@/components/other/modalHistory";
import { fillMissingUpdateByAccount, findRoleConfigByMenuName, formatNumberFourDecimal, formatNumberFourDecimalNoComma, generateUserPermission } from "@/utils/generalFormatter";
import ModalComment from "./form/modalComment";
import PaginationComponent from "@/components/other/globalPagination";
import { useFetchMasters } from "@/hook/fetchMaster";
import { decryptData } from "@/utils/encryptionData";
import TableBalOperateAndInstructFlow from "./form/table";
import BtnGeneral from "@/components/other/btnGeneral";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { useForm } from "react-hook-form";
import getUserValue from "@/utils/getuserValue";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import dayjs from "dayjs";
import ModalAction from "./form/modalAction";
import ModalFiles from "./form/modalFiles";
import TableBalOperateAndInstructFlowShipper from "./form/tableForShipper";


// กันส่งมา 2026-01-23
// 2. Operation Flow and Instructed Flow > เปลี่ยนหน่วยของ Volume Adjust เป็น MMSCF
// ทั้งในหน้า 
// - List 
// - View
// - Edit 
// - History 
// - Export 
// - Show/Hide Column
//  **ทำให้ครบทุกหน้านะ**

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const router = useRouter();
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();

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

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Operation Flow and Instructed Flow Order', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Operation Flow and Instructed Flow Order', userDT)
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
    const { zoneMaster } = useFetchMasters();

    // ############### FIELD SEARCH ###############
    const [checkPublic, setCheckPublic] = useState<boolean>(false);
    const [bodyExport, setBodyExportAndPost] = useState<any>(null);

    const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [srchZone, setSrchZone] = useState<any>([]);
    const [srchTimeStamp, setSrchTimeStamp] = useState('');

    useEffect(() => {
        if (checkPublic) {
            handleFieldSearch();
            setTimeout(() => {
                setCheckPublic(false)
            }, 300);
        } else {
            setTimeout(() => {
                handleFieldSearch();
            }, 300);
        }
    }, [checkPublic])

    const handleFieldSearch = async () => {
        setIsLoading(false);

        const body_post: any = {
            "gas_day": srchGasDayFrom ? dayjs(srchGasDayFrom).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD"), 
            "skip": 0, 
            "limit": 100 
        }

        if (watch('filter_last_version')) {
            body_post.last_version = true
        }


        setBodyExportAndPost(body_post)
        const response: any = await postService(`/master/balancing/instructed-operation-flow-shippers`, body_post);

        // v2.0.61 แสดงแค่ Flow Type ที่เป็น Difficult  Day, Operation Flow Order และ Instructed Flow เท่านั้น ไม่ต้องแสดง Normal และ Alert https://app.clickup.com/t/86eu6uqt6
        let filtered_data: any = Array.isArray(response) ? response?.filter((item: any) => !['NORMAL', 'Normal', 'ALERT', 'Alert'].includes(item?.level)) : [];
        // let filtered_data: any = response

        // // กรองเฉพาะที่มี execute_timestamp ล่าสุด
        // // หา lasted version
        // if (watch('filter_last_version')) {
        //     const maxTimestamp = Math.max(...response?.map((item: any) => item.execute_timestamp));
        //     filtered_data = response?.filter((item: any) => item.execute_timestamp === maxTimestamp);
        // }

        const filtered = filtered_data?.map((entry: any) => {
            const zoneMatch = srchZone.length ? srchZone.includes(entry?.zone) : true;
            const timestampMatch = srchTimeStamp ? entry?.valuesData?.timestamp === srchTimeStamp : true;

            const filteredShipperData = entry.shipperData?.filter((shipperGroup: any) => {
                const shipperNameMatch = srchShipperName.length > 0 ? srchShipperName.includes(shipperGroup?.shipperName) : true;
                return shipperNameMatch;
            }) || [];

            if ((zoneMatch && timestampMatch) && filteredShipperData?.length > 0) {
                return {
                    ...entry,
                    shipperData: filteredShipperData,
                };
            }

            return null;
        }).filter(Boolean);



        const filteredFlow2 = () => {
            if (Array.isArray(srchFlowType) && srchFlowType.length > 0) {
                const result = Array.isArray(filtered)
                    ? filtered.filter((item) =>
                        srchFlowType.includes(item?.valuesData?.flow_type)
                    )
                    : [];


                return result;
            }

            return Array.isArray(filtered) ? filtered : [];
        };

        setCurrentPage(1)
        setData(filteredFlow2());
        setFilteredDataTable(filteredFlow2());

        // DATA TIMESTAMP
        const data_timestamp = Array.from(
            new Map(
                filtered_data?.map((item: any) => [item?.valuesData?.timestamp, { timestamp: item?.valuesData?.timestamp }])
            ).values()
        );
        setDataTimestamp(data_timestamp);

        setTimeout(() => {
            setIsLoading(true);
        }, 300);
    };

    const handleReset = () => {
        setValue('filter_last_version', true)
        setSrchFlowType([]);
        setSrchGasDayFrom(null)
        setSrchShipperName([]);
        setSrchZone([]);
        setBodyExportAndPost(null)
        setSrchTimeStamp('')
        fetchData();
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const normalize = (val: any) => val?.toString()?.replace(/\s+/g, '')?.toLowerCase()?.trim() || '';

    const handleSearch = (query: string) => {
        const queryLower = normalize(query);

        const filtered = dataTable?.map((entry: any) => {
            const timestampMatch = normalize(entry?.valuesData?.timestamp).includes(queryLower);
            const hourlyMatch = normalize(entry?.valuesData?.gas_hour).includes(queryLower);
            const zoneMatch = normalize(entry?.valuesData?.zone).includes(queryLower);

            // เสิชแบบมีทศนิยมและคอมม่า
            const accImb_or_accImbInvMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.accImb_or_accImbInv)).includes(queryLower);
            const accMarginMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.accMargin)).includes(queryLower);
            const energyAdjustMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.energyAdjust)).includes(queryLower);
            const energyAdjustRate_mmbtudMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.energyAdjustRate_mmbtud)).includes(queryLower);
            const energyAdjustRate_mmbtuhMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.energyAdjustRate_mmbtuh)).includes(queryLower);

            // เสิชแบบมีทศนิยมและไม่มีคอมม่า
            const accImb_or_accImbInvMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.accImb_or_accImbInv)).includes(queryLower);
            const accMarginMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.accMargin)).includes(queryLower);
            const energyAdjustMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.energyAdjust)).includes(queryLower);
            const energyAdjustRate_mmbtudMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.energyAdjustRate_mmbtud)).includes(queryLower);
            const energyAdjustRate_mmbtuhMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.energyAdjustRate_mmbtuh)).includes(queryLower);

            const flow_typeMatch = normalize(entry?.valuesData?.flow_type).includes(queryLower);
            const resolveHourMatch = normalize(entry?.valuesData?.resolveHour).includes(queryLower);

            // เสิชแบบมีทศนิยมและคอมม่า
            const heatingValueMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.heatingValue)).includes(queryLower);
            const volumeAdjustMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.volumeAdjust)).includes(queryLower);
            const volumeAdjustRate_mmscfdMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.volumeAdjustRate_mmscfd)).includes(queryLower);
            const volumeAdjustRate_mmscfhMatch = normalize(formatNumberFourDecimal(entry?.valuesData?.volumeAdjustRate_mmscfh)).includes(queryLower);

            // เสิชแบบมีทศนิยมและไม่มีคอมม่า
            const heatingValueMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.heatingValue)).includes(queryLower);
            const volumeAdjustMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.volumeAdjust)).includes(queryLower);
            const volumeAdjustRate_mmscfdMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.volumeAdjustRate_mmscfd)).includes(queryLower);
            const volumeAdjustRate_mmscfhMatch_no_comma = normalize(formatNumberFourDecimalNoComma(entry?.valuesData?.volumeAdjustRate_mmscfh)).includes(queryLower);

            const filteredShipperData = entry.shipperData?.map((shipperGroup: any) => {
                const find_shipper = dataShipperGroup?.find((itemx: any) => itemx?.name.toString()?.replace(/\s+/g, '')?.toLowerCase()?.trim().includes(queryLower))
                const shipperNameMatch = normalize(shipperGroup?.shipperName) == find_shipper?.id_name?.toString()?.replace(/\s+/g, '')?.toLowerCase()?.trim();
                // const shipperNameMatch = normalize(shipperGroup?.shipperName).includes(queryLower); 
                const timestampMatch = normalize(shipperGroup?.timestamp).includes(queryLower);
                const hourlyMatch = normalize(shipperGroup?.gas_hour).includes(queryLower);
                const zoneMatch = normalize(shipperGroup?.zone).includes(queryLower);

                // เสิชแบบมีทศนิยมและคอมม่า
                const accImb_or_accImbInvMatch = normalize(formatNumberFourDecimal(shipperGroup?.accImb_or_accImbInv)).includes(queryLower);
                const accMarginMatch = normalize(formatNumberFourDecimal(shipperGroup?.accMargin)).includes(queryLower);
                const energyAdjustMatch = normalize(formatNumberFourDecimal(shipperGroup?.energyAdjust)).includes(queryLower);
                const energyAdjustRate_mmbtudMatch = normalize(formatNumberFourDecimal(shipperGroup?.energyAdjustRate_mmbtud)).includes(queryLower);
                const energyAdjustRate_mmbtuhMatch = normalize(formatNumberFourDecimal(shipperGroup?.energyAdjustRate_mmbtuh)).includes(queryLower);

                // เสิชแบบมีทศนิยมและไม่มีคอมม่า
                const accImb_or_accImbInvMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.accImb_or_accImbInv)).includes(queryLower);
                const accMarginMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.accMargin)).includes(queryLower);
                const energyAdjustMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.energyAdjust)).includes(queryLower);
                const energyAdjustRate_mmbtudMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.energyAdjustRate_mmbtud)).includes(queryLower);
                const energyAdjustRate_mmbtuhMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.energyAdjustRate_mmbtuh)).includes(queryLower);

                const flow_typeMatch = normalize(shipperGroup?.flow_type).includes(queryLower);
                const resolveHourMatch = normalize(shipperGroup?.resolveHour).includes(queryLower);

                // เสิชแบบมีทศนิยมและคอมม่า
                const heatingValueMatch = normalize(formatNumberFourDecimal(shipperGroup?.heatingValue)).includes(queryLower);
                const volumeAdjustMatch = normalize(formatNumberFourDecimal(shipperGroup?.volumeAdjust)).includes(queryLower);
                const volumeAdjustRate_mmscfdMatch = normalize(formatNumberFourDecimal(shipperGroup?.volumeAdjustRate_mmscfd)).includes(queryLower);
                const volumeAdjustRate_mmscfhMatch = normalize(formatNumberFourDecimal(shipperGroup?.volumeAdjustRate_mmscfh)).includes(queryLower);

                // เสิชแบบมีทศนิยมและไม่มีคอมม่า
                const heatingValueMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.heatingValue)).includes(queryLower);
                const volumeAdjustMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.volumeAdjust)).includes(queryLower);
                const volumeAdjustRate_mmscfdMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.volumeAdjustRate_mmscfd)).includes(queryLower);
                const volumeAdjustRate_mmscfhMatch_no_comma = normalize(formatNumberFourDecimalNoComma(shipperGroup?.volumeAdjustRate_mmscfh)).includes(queryLower);

                if (shipperNameMatch ||
                    timestampMatch ||
                    hourlyMatch ||
                    zoneMatch ||
                    accImb_or_accImbInvMatch ||
                    accMarginMatch ||
                    energyAdjustMatch ||
                    energyAdjustRate_mmbtudMatch ||
                    energyAdjustRate_mmbtuhMatch ||
                    accImb_or_accImbInvMatch_no_comma ||
                    accMarginMatch_no_comma ||
                    energyAdjustMatch_no_comma ||
                    energyAdjustRate_mmbtudMatch_no_comma ||
                    energyAdjustRate_mmbtuhMatch_no_comma ||
                    flow_typeMatch ||
                    heatingValueMatch ||
                    resolveHourMatch ||
                    volumeAdjustMatch ||
                    volumeAdjustRate_mmscfdMatch ||
                    volumeAdjustRate_mmscfhMatch ||
                    heatingValueMatch_no_comma ||
                    volumeAdjustMatch_no_comma ||
                    volumeAdjustRate_mmscfdMatch_no_comma ||
                    volumeAdjustRate_mmscfhMatch_no_comma
                ) {
                    return {
                        ...shipperGroup,
                    };
                }

                return null;
            }).filter(Boolean);

            if (
                timestampMatch ||
                hourlyMatch ||
                zoneMatch ||
                accImb_or_accImbInvMatch ||
                accMarginMatch ||
                energyAdjustMatch ||
                energyAdjustRate_mmbtudMatch ||
                energyAdjustRate_mmbtuhMatch ||
                accImb_or_accImbInvMatch_no_comma ||
                accMarginMatch_no_comma ||
                energyAdjustMatch_no_comma ||
                energyAdjustRate_mmbtudMatch_no_comma ||
                energyAdjustRate_mmbtuhMatch_no_comma ||
                flow_typeMatch ||
                heatingValueMatch ||
                resolveHourMatch ||
                volumeAdjustMatch ||
                volumeAdjustRate_mmscfdMatch ||
                volumeAdjustRate_mmscfhMatch ||
                heatingValueMatch_no_comma ||
                volumeAdjustMatch_no_comma ||
                volumeAdjustRate_mmscfdMatch_no_comma ||
                volumeAdjustRate_mmscfhMatch_no_comma ||
                filteredShipperData.length > 0
            ) {
                return {
                    ...entry,
                    shipperData: filteredShipperData,
                };
            }

            return null;
        }).filter(Boolean);



        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [closeBalanceData, setCloseBalanceData] = useState<any>();
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataTso, setDataTso] = useState<any>([]);
    const [dataTimestamp, setDataTimestamp] = useState<any>([]);
    const [dataShipperGroup, setDataShipperGroup] = useState<any>([]);
    const [isUploaded, setIsUploaded] = useState<any>(false);

    const [srchFlowType, setSrchFlowType] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false)
            setValue('filter_last_version', true)

            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.id_name])
            }

            // DATA SHIPPER
            const res_shipper_group = await getService(`/master/account-manage/group-master?user_type=3`)
            setDataShipperGroup(res_shipper_group)

            // GET CLOSE BALANCE DATA
            const res_ = await getService(`/master/balancing/closed-balancing-report`)
            setCloseBalanceData(res_)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_tso_name = await getService(`/master/account-manage/group-master?user_type=2`);
            setDataTso(res_tso_name)

            // *** ตัวอย่างการใช้ limit offset อยู่ที่ metering —> metering retrieving --> page.tsx
            const body_post: any = {
                "gas_day": dayjs().format("YYYY-MM-DD"), 
                "skip": 0, 
                "limit": 100 
            }


            if (watch('filter_last_version')) {
                body_post.last_version = true
            }

            setBodyExportAndPost(body_post)
            const response: any = await postService(`/master/balancing/instructed-operation-flow-shippers`, body_post);

            // v2.0.61 แสดงแค่ Flow Type ที่เป็น Difficult  Day, Operation Flow Order และ Instructed Flow เท่านั้น ไม่ต้องแสดง Normal และ Alert https://app.clickup.com/t/86eu6uqt6
            let filtered_data: any = Array.isArray(response) ? response?.filter((item: any) => !['NORMAL', 'Normal', 'ALERT', 'Alert'].includes(item?.level)) : [];

            const filtered = filtered_data?.map((entry: any) => {

                if (entry.shipperData?.length > 0) {
                    return {
                        ...entry,
                        shipperData: entry.shipperData,
                    };
                }

                return null;
            }).filter(Boolean);

            const filteredFlow2 = () => {
                if (Array.isArray(srchFlowType) && srchFlowType.length > 0) {
                    const result = Array.isArray(filtered)
                        ? filtered.filter((item) =>
                            srchFlowType.includes(item?.valuesData?.flow_type)
                        )
                        : [];


                    return result;
                }

                return Array.isArray(filtered) ? filtered : [];
            };

            setData(filteredFlow2());
            setFilteredDataTable(filteredFlow2());

            // DATA TIMESTAMP
            const data_timestamp = Array.from(
                new Map(
                    filtered_data?.map((item: any) => [item?.valuesData?.timestamp, { timestamp: item?.valuesData?.timestamp }])
                ).values()
            );
            setDataTimestamp(data_timestamp);

            setTimeout(() => {
                setIsLoading(true);
            }, 500);

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        if (bodyExport !== null) {
            handleFieldSearch()
        } else {
            fetchData();
        }
        getPermission();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [modalMsg, setModalMsg] = useState<any>("");
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const fdInterface: any = {
        mode_account: '',
        id_name: '',
        role: '',
        system_login_account: [],
    };

    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {

        {/* {
            "accImb_or_accImbInv": "-43758.71",
            "accMargin": "-21807.16",
            "flow_type": "OFO", // DD = DIFFICULT DAY FLOW,OFO = OPERATION FLOW, IF = INSTRACTED FLOW

            "energyAdjust": "0",
            "energyAdjustRate_mmbtuh": "4421.676666666665",
            "energyAdjustRate_mmbtud": "106120.23999999996",

            "volumeAdjust": "24.447522263505537",
            "volumeAdjustRate_mmscfh": "4.889504452701107",
            "volumeAdjustRate_mmscfd": "117.34810686482656",
            "resolveHour": "5",
            "heatingValue": "904.32"
        } */}

        let dataPut = {
            "accImb_or_accImbInv": String(data?.accImb_or_accImbInv),
            "accMargin": String(data?.accMargin),
            "flow_type": data?.flow_type, // DD = DIFFICULT DAY FLOW,OFO = OPERATION FLOW, IF = INSTRACTED FLOW

            "energyAdjust": String(data?.energyAdjust),
            "energyAdjustRate_mmbtuh": String(data?.energyAdjustRate_mmbtuh),
            "energyAdjustRate_mmbtud": String(data?.energyAdjustRate_mmbtud),

            "volumeAdjust": String(data?.volumeAdjust),
            "volumeAdjustRate_mmscfh": String(data?.volumeAdjustRate_mmscfh),
            "volumeAdjustRate_mmscfd": String(data?.volumeAdjustRate_mmscfd),
            "resolveHour": String(data?.resolveHour),
            "heatingValue": String(data?.heatingValue)
        }
        // console.log('data : ', data);
        // console.log('data?.heatingValue?.toString() : ', data?.heatingValue?.toString());
        // console.log('dataPut : ', dataPut);

        switch (formMode) {
            case "create":
                // // await postService('/master/account-manage/system-logi-config', dataPostReal);
                // setFormOpen(false);
                // setModalSuccessOpen(true);
                break;
            case "edit":
                let res_ = await putService(`/master/balancing/instructed-operation-flow-shippers/${selectedId}`, dataPut);
                setModalMsg('Your changes have been saved.')
                setFormOpen(false);
                setModalSuccessOpen(true);


                handleFieldSearch();
                break;
        }
        // await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openEditForm = (id: any, id_main: any) => {
        setSelectedId(id);
        setFormMode('edit');
        const filteredData = filteredDataTable.find((item: any) => item.id === id_main);
        const filteredData2 = filteredData?.shipperData?.find((item: any) => item.id === id);
        setFormData(filteredData2);
        setFormOpen(true);
    };

    const openViewForm = (id: any, id_main: any) => {
        setFormMode('view');
        const filteredData = filteredDataTable.find((item: any) => item.id === id_main);
        const filteredData2 = filteredData?.shipperData?.find((item: any) => item.id === id);
        setFormData(filteredData2);
        setFormOpen(true);
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

    // ############### MODAL ALL FILES ###############
    const [mdFileView, setMdFileView] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAllFileModal = (id?: any, main_id?: any, data?: any) => {

        const filteredData = filteredDataTable.find((item: any) => item.id === main_id);
        setFormData(filteredData);
        const filteredData2 = filteredData?.shipperData?.find((item: any) => item.id === id);
        setDataFile(filteredData2)
        setMdFileView(true)
    };

    // ############### CONFIG HV ###############
    const gotoPageHv = () => {
        // router.push("/en/authorization/dam");
        router.push("/en/authorization/dam/parameters/systemConfiguration/hvOperationFlow");
    };

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    //state use
    const [key, setKey] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const initialColumns: any = [
        { key: 'publicate', label: 'Publicate', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'hourly', label: 'Hourly', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'acc_imbalance', label: 'Acc. Imbalance / Acc. Imbalance Inventory (MMBTU)', visible: true },
        { key: 'acc_margin', label: 'Acc.Margin (MMBTU)', visible: true },
        { key: 'flow_type', label: 'Flow Type', visible: true },
        { key: 'energy_adjustment_mmbtu', label: 'Energy Adjustment (MMBTU)', visible: true },
        { key: 'energy_flow_rate_adjustment_mmbtuh', label: 'Energy Flow Rate Adjustment (MMBTU/H)', visible: true },
        { key: 'energy_flow_rate_adjustment_mmbtud', label: 'Energy Flow Rate Adjustment (MMBTU/D)', visible: true },
        // { key: 'volume_adjustment_mmbtu', label: 'Volume Adjustment (MMBTU)', visible: true },
        { key: 'volume_adjustment_mmbtu', label: 'Volume Adjustment (MMSCF)', visible: true },
        { key: 'volume_flow_rate_adjustment_mmscfh', label: 'Volume Flow Rate Adjustment (MMSCF/H)', visible: true },
        { key: 'volume_flow_rate_adjustment_mmscfd', label: 'Volume Flow Rate Adjustment (MMSCFD)', visible: true },
        { key: 'resolvedTime_hr', label: 'ResolvedTime (Hr.)', visible: true },
        { key: 'hv_btu_scf', label: 'HV (BTU/SCF)', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'acc_imbalance', label: 'Acc. Imbalance / Acc. Imbalance Inventory (MMBTU)', visible: true },
        { key: 'acc_margin', label: 'Acc.Margin (MMBTU)', visible: true },
        { key: 'flow_type', label: 'Flow Type', visible: true },
        // { key: 'operation_instructed_flow_order_mmscf', label: 'Operation / Instructed Flow Order (MMSCF)', visible: true },
        // { key: 'operation_instructed_flow_order_mmscfh', label: 'Operation / Instructed Flow Order (MMSCF/H)', visible: true },
        { key: 'energy_adjustment_mmbtu', label: 'Energy Adjustment (MMBTU)', visible: true },
        { key: 'energy_flow_rate_adjustment_mmbtuh', label: 'Energy Flow Rate Adjustment (MMBTU/H)', visible: true },
        { key: 'energy_flow_rate_adjustment_mmbtud', label: 'Energy Flow Rate Adjustment (MMBTU/D)', visible: true },
        // { key: 'volume_adjustment_mmbtu', label: 'Volume Adjustment (MMBTU)', visible: true },
        { key: 'volume_adjustment_mmbtu', label: 'Volume Adjustment (MMSCF)', visible: true },
        { key: 'volume_flow_rate_adjustment_mmscfh', label: 'Volume Flow Rate Adjustment (MMSCF/H)', visible: true },
        { key: 'volume_flow_rate_adjustment_mmscfd', label: 'Volume Flow Rate Adjustment (MMSCFD)', visible: true },
        { key: 'resolvedTime_hr', label: 'ResolvedTime (Hr.)', visible: true },
        { key: 'hv_btu_scf', label: 'HV (BTU/SCF)', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
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
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
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

            const data_row = paginatedData?.flatMap((item: any) => item?.shipperData?.filter((itemx: any) => itemx?.id == id));

            const response: any = await getService(`/master/account-manage/history?type=instructed-operation-flow-shippers&method=all&id_value=${id}`);

            const valuesArray = response.map((item: any) => item.value);


            let mappings = [
                { key: "timestamp", title: "Timestamp" },
                { key: "gas_hour", title: "Hourly" },
                { key: "shipper", title: "Shipper Name" },
                { key: "zone", title: "Zone" },
                // { key: "review_code", title: "Review Code" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                return {
                    title,
                    value: value || "",
                };
            });

            // ปั้น data หัว history
            // const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == result[2]?.value)
            const find_shipper = dataShipper?.find((itemx: any) => itemx?.id_name == data_row?.[0]?.shipperName)

            // const find_tso = dataTso?.find((itemx: any) => itemx?.id_name == result[2]?.value)
            const find_tso = dataTso?.find((itemx: any) => itemx?.id_name == data_row?.[0]?.shipperName)

            const res_for_header_of_history = [
                {
                    "title": "Timestamp",
                    "value": result[0]?.value ? result[0]?.value : data_row?.[0]?.timestamp
                },
                {
                    "title": "Hourly",
                    "value": result[1]?.value ? result[1]?.value : data_row?.[0]?.gas_hour
                },
                {
                    "title": "Shipper Name",
                    "value": find_shipper?.name ? find_shipper?.name : find_tso?.name
                },
                {
                    "title": "Zone",
                    "value": result[3]?.value ? result[3]?.value : data_row?.[0]?.zone
                }
            ]

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

    useEffect(() => {
        if (isUploaded) {
            setModalMsg('File has been uploaded.')
            setModalSuccessOpen(true);
            setIsUploaded(false)
        }
    }, [isUploaded])


    return (
        <div className="space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <DatePickaSearch
                        key={"gas_day_" + key}
                        label="Gas Day"
                        placeHolder="Select Gas Day"
                        allowClear
                        isDefaultToday={true}
                        onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                        customWidth={200}
                    />

                    <InputSearch
                        id="searchShipperName"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchShipperName}
                        onChange={(e) => setSrchShipperName(e.target.value)}
                        isDisabled={(userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) ? true : false}
                        options={ (Array.isArray(dataShipper) ? dataShipper : []).filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4)
                                    ? item?.id === userDT?.account_manage?.[0]?.group?.id
                                    : true
                            )
                            .map((item: any) => ({
                                // value: item.id,
                                value: item.id_name,
                                label: item.name,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchZone}
                        onChange={(e) => setSrchZone(e.target.value)}
                        // options={zoneMaster?.data?.map((item: any) => ({
                        //     value: item.name.toString(),
                        //     label: item.name
                        // }))}

                        options={
                            Array.from(
                                new Map(
                                    (zoneMaster?.data || []).map((item: any) => [item.name, item])
                                ).values()
                            ).map((item: any) => ({
                                value: item.name.toString(),
                                label: item.name
                            }))
                        }

                    />

                    <InputSearch
                        id="searchTimestamp"
                        label="Timestamp"
                        type="select"
                        value={srchTimeStamp}
                        onChange={(e) => setSrchTimeStamp(e.target.value)}
                        options={dataTimestamp?.map((item: any) => ({
                            value: item.timestamp,
                            label: item.timestamp
                        }))}
                    />

                    <InputSearch
                        id="searchFlowType"
                        label="Flow Type"
                        type="select-multi-checkbox"
                        value={srchFlowType}
                        onChange={(e) => setSrchFlowType(e.target.value)}
                        options={[
                            { value: "DIFFICULT DAY", label: "DIFFICULT DAY" },
                            { value: "OPERATION FLOW ORDER", label: "OPERATION FLOW ORDER" },
                            { value: "INSTRUCTED FLOW", label: "INSTRUCTED FLOW" },
                        ]}
                        placeholder="Search Flow Type"
                    />

                    <div className="-mb-2">
                        <CheckboxSearch2
                            {...register('filter_last_version')}
                            id="filter_last_version"
                            label="Lasted version"
                            type="single-line"
                            isDisable={userDT?.account_manage?.[0]?.user_type_id !== 3 ? false : true} // Shipper จะไม่เห็น row เขียวตัดออกไปเลย ส่วนตรง filter lasted version ให้ขึ้น disable เทาไปเลย shipper ไม่สามารถเอาออกได้ มันจะเห็นล่าสุดอยู่แล้ว https://app.clickup.com/t/86eue43ev
                            value={watch('filter_last_version') ? watch('filter_last_version') : false}
                            onChange={(e: any) => setValue('filter_last_version', e?.target?.checked)}
                        />
                    </div>

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />

                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex gap-2">
                        <BtnGeneral
                            textRender={"Config HV"}
                            iconNoRender={true}
                            bgcolor={"#3582D5"}
                            generalFunc={() => gotoPageHv()}
                            // disable={urlForApprove == '' ? true : false} 
                            disable={false}
                            can_view={userPermission ? userPermission?.b_manage : false}
                        />
                    </div>
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start pb-4">
                        <div className="w-[50%] flex flex-column items-center justify-start gap-4">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>
                        </div>
                        <div className="w-[50%] flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="balancing/instructed-operation-flow-shippers"
                                specificMenu='bal-operate-and-instruct'
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificData={bodyExport}
                            />
                        </div>
                    </div>
                </div>

                {
                    userDT?.account_manage?.[0]?.user_type_id !== 3 ?
                        <TableBalOperateAndInstructFlow
                            openEditForm={openEditForm}
                            openViewForm={openViewForm}
                            tableData={paginatedData}
                            openAllFileModal={openAllFileModal}
                            isLoading={isLoading}
                            columnVisibility={columnVisibility}
                            selectedItem={selectedItem}
                            setselectedItem={setselectedItem}
                            openHistoryForm={openHistoryForm}
                            openReasonModal={openReasonModal}
                            closeBalanceData={closeBalanceData}
                            userDT={userDT}
                            userPermission={userPermission}
                            dataShipperGroup={dataShipperGroup}
                            setCheckPublic={setCheckPublic}
                            setIsLoading={setIsLoading}
                        />
                        :
                        <TableBalOperateAndInstructFlowShipper
                            openEditForm={openEditForm}
                            openViewForm={openViewForm}
                            tableData={paginatedData}
                            openAllFileModal={openAllFileModal}
                            isLoading={isLoading}
                            columnVisibility={columnVisibility}
                            selectedItem={selectedItem}
                            setselectedItem={setselectedItem}
                            openHistoryForm={openHistoryForm}
                            openReasonModal={openReasonModal}
                            closeBalanceData={closeBalanceData}
                            userDT={userDT}
                            userPermission={userPermission}
                            dataShipperGroup={dataShipperGroup}
                            setCheckPublic={setCheckPublic}
                        />
                }



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

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Your changes have been saved."
                description={modalMsg}
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
                dataShipperGroup={dataShipperGroup}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                    handleFieldSearch(); // Comment : ถ้าเพิ่มคอมเม้นไปแล้วตอนกด Close ออกมาให้หน้า List Count จำนวนเลยได้มั้ย (ตอนนี้ต้องกด Refresh ตัวเลขถึงจะเปลี่ยน) https://app.clickup.com/t/86etuywuw
                }}
                userPermission={userPermission}
            />

            <ModalFiles
                data={dataFile}
                dataMain={formData}
                setModalSuccessOpen={setModalSuccessOpen}
                setIsUploaded={setIsUploaded}
                open={mdFileView}
                onClose={() => {
                    setMdFileView(false);
                    handleFieldSearch();
                }}

            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                dataTable={dataTable}
                dataShipperGroup={dataShipperGroup}
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

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="bal-operate-and-instruct"
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