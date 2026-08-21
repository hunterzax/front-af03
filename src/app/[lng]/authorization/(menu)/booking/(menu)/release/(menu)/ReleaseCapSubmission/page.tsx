"use client";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import React, { useEffect, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import BtnGeneral from "@/components/other/btnGeneral";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ModalAddDocument from "./form/modalAddDoc";
import { exportToExcel, findRoleConfigByMenuName, formatNumberThreeDecimal, generateUserPermission, shouldFilterOut, toDayjs } from "@/utils/generalFormatter";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import TableReleaseCapSubEachMonth from "./form/tableEachMonth";
import { decryptData } from "@/utils/encryptionData";

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

interface ClientProps {
    params: {
        lng: string;
    };
}

// status_capacity_request_management_id = [
//     {
//         "id": 1,
//         "name": "Saved",
//         "color": "#D0E5FD"
//     },
//     {
//         "id": 2,
//         "name": "Approved",
//         "color": "#C2F5CA"
//     },
//     {
//         "id": 3,
//         "name": "Rejected",
//         "color": "#FFF1CE"
//     },
//     {
//         "id": 4,
//         "name": "Confirmed",
//         "color": "#EEDEFF"
//     },
//     {
//         "id": 5,
//         "name": "Terminated",
//         "color": "#FDD0D0"
//     }
// ]


// status_capacity_request_management_process_id = [
//     {
//         "id": 1,
//         "name": "Active",
//         "color": "#C2F5CA"
//     },
//     {
//         "id": 2,
//         "name": "Waiting For Start Date",
//         "color": "#D0E5FD"
//     },
//     {
//         "id": 3,
//         "name": "Waiting For Approval",
//         "color": "#EEDEFF"
//     },
//     {
//         "id": 4,
//         "name": "End",
//         "color": "#FDD0D0"
//     },
//     {
//         "id": 5,
//         "name": "Close",
//         "color": "#FDD0D0"
//     }
// ]

// term_type = [
//     {
//         "id": 1,
//         "name": "Long Term",
//         "color": "#FFDDCE"
//     },
//     {
//         "id": 2,
//         "name": "Medium Term",
//         "color": "#D0F0FD"
//     },
//     {
//         "id": 3,
//         "name": "Short Term",
//         "color": "#C2F5E9"
//     },
//     {
//         "id": 4,
//         "name": "Short Term (Non-firm)",
//         "color": "#F2C831"
//     }
// ]

const ClientPage: React.FC<ClientProps> = (props) => {

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
            //     const permission = findRoleConfigByMenuName('Release Capacity Submission', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Release Capacity Submission', userDT)
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
    // const { processTypeMaster, userTypeMaster, nominationTypeMaster, termTypeMaster, statCapReqMgn } = useFetchMasters();

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>('');
    const [srchPoint, setSrchPoint] = useState<any>([]);
    const [srchQuery, setSrchQuery] = useState('');
    const [srchStatus, setSrchStatus] = useState('');
    const [srchShipper, setSrchShipper] = useState('');
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [contractStartDate, setContractStartDate] = useState<Date | undefined>(undefined);
    const [contractEndDate, setContractEndDate] = useState<Date | undefined>(undefined);
    const [contractPointOptions, setContractPointOptions] = useState<{
        value: string;
        label: string;
    }[]>([]);
    const [key, setKey] = useState(0);

    const [dataPost, setDataPost] = useState<any>();
    const [dataDetail, setDataDetail] = useState<any>([]);
    const [dataFileArr, setDataFileArr] = useState<any[]>([]);

    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');

    const filterContractPointUnderContract = async (contract_code?: any) => {
        try {
            const selectedContract = dataContract.find((item: any) => item.id == contract_code)
            if (selectedContract) {
                if (selectedContract?.contract_start_date) {
                    setContractStartDate(toDayjs(selectedContract.contract_start_date).toDate())
                }

                if (selectedContract?.terminate_date) {
                    setContractEndDate(toDayjs(selectedContract.terminate_date).toDate())
                }
                else if (selectedContract?.extend_date) {
                    setContractEndDate(toDayjs(selectedContract.extend_date).toDate())
                }
                else if (selectedContract?.contract_end_date) {
                    setContractEndDate(toDayjs(selectedContract.contract_end_date).toDate())
                }
            }
        } catch (error) {

        }

        try {
            const response: any = await getService(`/master/release-capacity-submission?contract_code_id=${contract_code}`);
            const contractPoints = Array.from(
                new Set(
                    response?.data?.flatMap((data: any) => [
                        data.entryData?.contract_point,
                        data.exitData?.contract_point
                    ]).filter(Boolean) // Remove null or undefined values
                )
            );

            // Map contractPoints into options for the InputSearch component
            const options: any = contractPoints.map((point) => ({
                value: point,
                label: point,
            }));
            setContractPointOptions(options)
        } catch (error) {

        }
    }

    const handleFieldSearch = async () => {
        try {
            setIsLoading(true);
            setIsResetForm(true)
            const response: any = await getService(`/master/release-capacity-submission?contract_code_id=${srchContractCode}`);

            if (response?.response?.data?.status === 400) {
                setModalErrorMsg(response?.response?.data?.error);
                setModalErrorOpen(true)
                setIsDisableDocument(true)
            } else {
                const responseApproved: any = await getService(`/master/release-capacity-submission/approved-release-capacity-submission-detail?contract_code_id=${srchContractCode}`);
                setApprovedRelease(responseApproved)

                if (response?.data) {
                    // Extract unique contract points from the dataTable
                    const contractPoints = Array.from(
                        new Set(
                            response?.data?.flatMap((data: any) => [
                                data.entryData?.contract_point,
                                data.exitData?.contract_point
                            ]).filter(Boolean) // Remove null or undefined values
                        )
                    );

                    // Map contractPoints into options for the InputSearch component
                    const options: any = contractPoints.map((point) => ({
                        value: point,
                        label: point,
                    }));
                    setContractPointOptions(options)
                }

                if (response?.contract_code_id && response?.group?.id) {
                    setDataPost({
                        "contract_code_id": response.contract_code_id,
                        "group_id": response.group.id,
                        "data": []
                    })
                }
                if (srchPoint?.length > 0) {
                    let filter_point = response.data.filter((item?: any) =>
                        (srchPoint.includes(item.exitData.contract_point) || srchPoint.includes(item.entryData.contract_point))
                    );
                    response.data = filter_point
                }

                setData(response?.data || []);
                setFilteredDataTable(response?.data || []);
                setIsUpdateMutableDataTable(true)
                setDataDetail(response)
                setIsDisableDocument(false)
            }

            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            setIsLoading(false);
            setIsDisableDocument(true)
        }
    };

    const handleReset = () => {
        setDataPost({ ...dataPost, data: [] })
        setIsResetForm(true)
        setIsUpdateMutableDataTable(true)
        setData([])
        setFilteredDataTable([]);
        setContractPointOptions([])

        setSrchContractCode('')
        setSrchShipper('')
        setSrchStatus('')

        setSrchPoint([])

        setSrchStartDate(null);
        setSrchEndDate(null);
        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
        setIsLoading(false);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        setSrchQuery(query);

        const queryLower = query.toLowerCase().replace(/\s+/g, "").trim();
        let filtered: any = [];

        if (queryLower !== '') {
            for (let i = 0; i < dataEachMonth?.length; i++) {
                let findItem: any = dataEachMonth[i]?.filter((item: any) => {
                    return (
                        item?.temp_contract_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.entry_exit?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.temp_start_date?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.temp_end_date?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.total_contracted_mmbtu_d?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberThreeDecimal(item?.total_contracted_mmbtu_d)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                        item?.total_contracted_mmscfd?.toString()?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        formatNumberThreeDecimal(item?.total_contracted_mmscfd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                })

                if (findItem?.length > 0) {
                    filtered.push([...findItem]);
                }
            }
        } else {
            filtered = dataEachMonth;
        }

        setPaginatedData(filtered?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataEachMonth, setDataEachMonth] = useState<any[]>([]);
    const [approvedRelease, setApprovedRelease] = useState<any>([]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isUpdateMutableDataTable, setIsUpdateMutableDataTable] = useState<boolean>(false);
    const [isDisableSubmit, setIsDisableSubmit] = useState<boolean>(true);
    const [isDisableDocument, setIsDisableDocument] = useState<boolean>(true);
    const [isResetForm, setIsResetForm] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {

            // const res_contract_code: any = await getService(`/master/capacity/capacity-request-management`);
            // const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`); // มันมีเงื่อนไขการกรองเพิ่ม เลยไม่ได้ใช้เส้นนี้
            const res_contract_code: any = await getService(`/master/capacity/pure-contract`);
            
            if (Array.isArray(res_contract_code)) {
                // ของเดิม
                // let filter_contract_code = res_contract_code.filter((item: any) => item?.status_capacity_request_management_process_id == 1 && item?.term_type_id != 4);
                // let filter_terminated_but_still_active = res_contract_code.filter((item: any) => item?.status_capacity_request_management_process_id == 1 && item?.status_capacity_request_management_id == 5);
                // const combined = [...filter_contract_code, ...filter_terminated_but_still_active];
                // // v2.0.26 สัญญาที่ terminated แล้วแต่ยัง active อยู่ ต้องสามารถเลือกเพื่อทำการ release ได้ https://app.clickup.com/t/86etjye01
                // // เอา stat status_capacity_request_management_id
                // setDataContract(combined);


                // ของใหม่
                // กรณีที่ Contract นั้นโดน Terminated ไปแล้ว แต่ยังไม่ถึงวันที่ Terminated ต้องยังสามารถ Release ค่าได้ [จับจากสถานะใหญ่ Active ถ้ายัง Active อยู่ยังต้อง release ได้ ; 
                // ส่วนระยะเวลา date ที่สามารถ release ได้ให้ดูจาก start date > terminated date > extend date > end date ไล่การเช็คข้อมูลแบบนี้] https://app.clickup.com/t/86ev09euk
                // และไม่เอา term_type = Short Term (Non-firm)
                let filter_only_approve_terminate = res_contract_code?.filter((item: any) => (item?.status_capacity_request_management_id == 2 || item?.status_capacity_request_management_id == 5) && item?.term_type_id != 4);


                // รายชื่อ contract ต้องดูว่า contract จบหรือยัง เช็คจาก 3 key เรียงเป็น priority ตามนี้ terminated_date --> extend_date --> contract_end_date
                // 1. ถ้ามี terminate_date ให้ดูว่า today > terminate_date หรือยัง ถ้ามากกว่าให้กรองออก
                // 2. ถ้ามี extend_date ให้ดูว่า today > extend_date หรือยัง ถ้ามากกว่าให้กรองออก
                // 3. เคสสุดท้าย ถ้าผ่านมาถึง contract_end_date ให้ดูว่า today > contract_end_date หรือยัง ถ้ามากกว่าให้กรองออก
                const filtered = filter_only_approve_terminate?.filter(c => !shouldFilterOut(c));

                setDataContract(filtered)

            }
            // setData(response);
            // setFilteredDataTable(response);
            setFilteredDataTable([]);

            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ถ้าจะเปิด region หาทุก exit ในทุก entry ไปเปิด servive getReleaseGroupByEntryAreaAndDate, ReleaseCapManagement ModalSubmissionDetails กับ TableReleaseCapSubEachMonth ด้วย
    // #region หาทุก exit ในทุก entry
    // const handleUpdateValue = (rowData: any, unit: any, float: number) => {
    //     try {
    //         let subRowIndex = -1
    //         const dataIndex = dataTable.findIndex((item: any) => {
    //             subRowIndex = item.findIndex((subRow: any) => {
    //                 return subRow.booking_row_json_id == rowData?.booking_row_json_id &&
    //                 subRow.temp_start_date == rowData?.temp_start_date &&
    //                 subRow.temp_end_date == rowData?.temp_end_date &&
    //                 subRow.temp_date == rowData?.temp_date
    //             })
    //             return subRowIndex > -1
    //         })

    //         if (dataIndex > -1) {

    //             const updateData = dataTable

    //             switch (unit) {
    //                 case 'mmbtud':
    //                     updateData[dataIndex][subRowIndex].total_release_mmbtu_d = float
    //                     break;

    //                 default:
    //                     updateData[dataIndex][subRowIndex].total_release_mmscfd = float
    //                     break;
    //             }
    //             setData(updateData)
    //             setIsUpdateMutableDataTable(true)
    //         }
    //     } catch (error) {
    //     }
    // }

    // const handleUpdaleTable = (newDataTable?: any) => {
    //     const targetDataTable = newDataTable || dataTable
    //     if (targetDataTable) {
    //         let totalItem = 0
    //         let totalRelease = 0
    //         setTotalItem(targetDataTable.length)

    //         // Filter logic with null checks
    //         const startDate = toDayjs(srchStartDate);
    //         const endDate = toDayjs(srchEndDate);

    //         let terminateDate: dayjs.Dayjs | undefined
    //         const contract = dataContract.find((item: any) => item.id == srchContractCode)
    //         if (contract?.terminate_date) {
    //             terminateDate = toDayjs(contract.terminate_date);
    //         }
    //         const filteredData = targetDataTable?.filter((row: any) => {
    //             const filteredByDate = row?.filter((item: any) => {
    //                 let result = true
    //                 const tempStartDate = toDayjs(item.temp_start_date, 'DD/MM/YYYY');
    //                 const tempEndDate = toDayjs(item.temp_end_date, 'DD/MM/YYYY');

    //                 // check start date
    //                 if (result == true && startDate.isValid()) {
    //                     if (result == true && tempStartDate.isValid()) {
    //                         result = tempStartDate.isSameOrBefore(startDate)
    //                     }
    //                 }

    //                 // check end date
    //                 if (result == true && endDate.isValid()) {
    //                     if (result == true && tempEndDate.isValid()) {
    //                         // result = tempEndDate.isBefore(endDate);
    //                         result = tempEndDate.isSameOrAfter(endDate);
    //                     }
    //                 }


    //                 if (result == true && terminateDate && terminateDate.isValid()) {
    //                     if (result == true && tempStartDate.isValid()) {
    //                         result = tempStartDate.isBefore(terminateDate)
    //                     }

    //                     if (result == true && tempEndDate.isValid()) {
    //                         if (tempEndDate.isAfter(terminateDate)) {
    //                             item.temp_end_date = terminateDate.format('DD/MM/YYYY')
    //                             item.is_terminate = true
    //                         }
    //                     }
    //                 }

    //                 if (result) {
    //                     return item
    //                 }
    //                 return result
    //             });
    //             return filteredByDate.length == row.length
    //         })

    //         setDataEachMonth(filteredData)
    //         let canSubmit = totalRelease == 0
    //         if (filteredData) {
    //             const onlyReleaseArray = filteredData.filter((row: any) => {
    //                 const canReleaseRow = row?.filter((subRow: any) => {
    //                     let haveMmbtud = false
    //                     let haveMmscfd = false
    //                     if (subRow?.entry_exit_id == 2) {
    //                         haveMmscfd = true
    //                         totalRelease -= subRow?.total_release_mmbtu_d ?? 0
    //                     }
    //                     else {
    //                         haveMmscfd = subRow?.total_release_mmscfd != undefined
    //                         totalRelease += subRow?.total_release_mmbtu_d ?? 0
    //                     }

    //                     haveMmbtud = subRow?.total_release_mmbtu_d != undefined
    //                     return haveMmbtud && haveMmscfd
    //                 })
    //                 if (canSubmit == true && canReleaseRow.length > 0 && canReleaseRow.length != row.length) {
    //                     canSubmit = false
    //                 }
    //                 return canReleaseRow.length == row.length
    //             })
    //             // const flattenData = onlyReleaseArray.reduce((accumulator: any[], value: any) => accumulator.concat(value), [])
    //             if (onlyReleaseArray.length < 1) {
    //                 canSubmit = false
    //             }
    //             setDataPost({ ...dataPost, data: onlyReleaseArray })
    //         }
    //         setIsDisableSubmit(!canSubmit)
    //     }
    // }
    // #endregion หาทุก exit ในทุก entry



    // #region ของเดิมบีม 20250927
    const handleUpdateValue = (contractPoint: any, pathMatch: any, date: any, unit: any, float: number) => {
        try {
            let type = 'exit'
            const dataIndex = filteredDataTable.findIndex((item: any) => {
                const isEntry = item?.pathMatchEntry?.contract_point == contractPoint
                const isExit = item?.pathMatchExit?.contract_point == contractPoint
                if (
                    (
                        isEntry ||
                        isExit
                    )
                    && item?.pathMatch?.id == pathMatch?.id
                    && item?.entryData?.area_text == pathMatch?.entry?.name
                    && item?.exitData?.area_text == pathMatch?.exit?.name) {
                    type = isExit ? 'exit' : 'entry'
                    return true
                }
            })
            if (dataIndex > -1) {
                let targetData: any
                let releaseArray = []

                switch (type) {
                    case 'exit':
                        targetData = filteredDataTable[dataIndex]?.exitData
                        break;
                    default:
                        targetData = filteredDataTable[dataIndex]?.entryData
                        break;
                }

                switch (unit) {
                    case 'mmbtud':
                        releaseArray = targetData?.release_mmbtu_d_array || []
                        break;

                    default:
                        releaseArray = targetData?.release_mmscfd_array || []
                        break;
                }

                const releaseIndex = releaseArray.findIndex((item: any) => item.date == date)
                if (releaseIndex > -1) {
                    releaseArray[releaseIndex].value = float
                }
                else {
                    releaseArray.push({ date: date, value: float })
                }

                const updateData = filteredDataTable
                switch (type) {
                    case 'exit':
                        switch (unit) {
                            case 'mmbtud':
                                updateData[dataIndex].exitData.release_mmbtu_d_array = releaseArray
                                break;

                            default:
                                updateData[dataIndex].exitData.release_mmscfd_array = releaseArray
                                break;
                        }
                        break;
                    default:
                        switch (unit) {
                            case 'mmbtud':
                                updateData[dataIndex].entryData.release_mmbtu_d_array = releaseArray
                                break;

                            default:
                                updateData[dataIndex].entryData.release_mmscfd_array = releaseArray
                                break;
                        }
                        break;
                }
                setFilteredDataTable(updateData)
                setIsUpdateMutableDataTable(true)
            }
        } catch (error) {
            // 
        }
    }
    // #endregion ของเดิมบีม 20250927


    // #region ของเดิมบีม 20250927
    // const handleUpdaleTable = (newDataTable?: any) => {
    //     const dataTable = newDataTable || filteredDataTable
    //     if (dataTable) {
    //         let totalItem = 0
    //         let totalRelease = 0

    //         const newData = dataTable?.map((item: any) => {
    //             const entryEachMonth = item?.entryData?.contracted_mmbtu_d_array?.filter((contracted: any) => contracted.value) || []
    //             const exitEachMonth = item?.exitData?.contracted_mmbtu_d_array?.filter((contracted: any) => contracted.value) || []

    //             const entrySameMonth = entryEachMonth.filter((entry: any) => exitEachMonth.some((exit: any) => exit.date == entry.date) == true)

    //             const exitSameMonth = exitEachMonth.filter((exit: any) => entryEachMonth.some((entry: any) => exit.date == entry.date) == true)

    //             const targetList = exitSameMonth.map((exit: any) => {
    //                 const targetMapEntry = entrySameMonth?.find((entry: any) => exit.date == entry.date)
    //                 const targetEntryMmscfd = item?.entryData?.contracted_mmscfd_array?.find((entryMmscfd: any) => targetMapEntry?.date == entryMmscfd.date)
    //                 const targetExitMmscfd = item?.exitData?.contracted_mmscfd_array?.find((exitMmscfd: any) => exit.date == exitMmscfd.date)
    //                 const targetMapReleaseEntry = item?.entryData?.release_mmbtu_d_array?.find((entry: any) => exit.date == entry.date)
    //                 const targetReleaseEntryMmscfd = item?.entryData?.release_mmscfd_array?.find((entryMmscfd: any) => targetMapReleaseEntry?.date == entryMmscfd.date)
    //                 const targetMapReleaseExit = item?.exitData?.release_mmbtu_d_array?.find((entry: any) => exit.date == entry.date)

    //                 let releaseEntryValue = 0
    //                 let releaseExitValue = 0
    //                 try {
    //                     const entryValue = Number(targetMapReleaseEntry?.value)
    //                     if (isNaN(entryValue)) {
    //                         releaseEntryValue = 0
    //                     }
    //                     else {
    //                         releaseEntryValue = entryValue
    //                     }
    //                 } catch (error) {
    //                     releaseEntryValue = 0
    //                 }
    //                 try {
    //                     const exitValue = Number(targetMapReleaseExit?.value)
    //                     if (isNaN(exitValue)) {
    //                         releaseExitValue = 0
    //                     }
    //                     else {
    //                         releaseExitValue = exitValue
    //                     }
    //                 } catch (error) {
    //                     releaseExitValue = 0
    //                 }

    //                 const approvedReleaseEntry = approvedRelease.filter((approvedReleaseItem: any) => {
    //                     const approvedReleaseStart = toDayjs(approvedReleaseItem.temp_start_date).format('DD/MM/YYYY')
    //                     const approvedReleaseEnd = toDayjs(approvedReleaseItem.temp_end_date).format('DD/MM/YYYY')
    //                     return approvedReleaseItem.temp_contract_point == item.pathMatchEntry?.contract_point &&
    //                         approvedReleaseItem.entry_exit_id == item.pathMatchEntry?.entry_exit_id &&
    //                         approvedReleaseItem.temp_area == item.pathMatchEntry?.area_text &&
    //                         approvedReleaseItem.temp_zone == item.pathMatchEntry?.zone_text &&
    //                         approvedReleaseStart == targetMapEntry?.start_date &&
    //                         approvedReleaseEnd == targetMapEntry?.end_date
    //                 })

    //                 const approvedReleaseExit = approvedRelease.filter((approvedReleaseItem: any) => {
    //                     const approvedReleaseStart = toDayjs(approvedReleaseItem.temp_start_date).format('DD/MM/YYYY')
    //                     const approvedReleaseEnd = toDayjs(approvedReleaseItem.temp_end_date).format('DD/MM/YYYY')
    //                     return approvedReleaseItem.temp_contract_point == item.pathMatchExit?.contract_point &&
    //                         approvedReleaseItem.entry_exit_id == item.pathMatchExit?.entry_exit_id &&
    //                         approvedReleaseItem.temp_area == item.pathMatchExit?.area_text &&
    //                         approvedReleaseItem.temp_zone == item.pathMatchExit?.zone_text &&
    //                         approvedReleaseStart == exit?.start_date &&
    //                         approvedReleaseEnd == exit?.end_date
    //                 })


    //                 const approvedReleaseEntryTotal: {
    //                     total_release_mmbtu_d: number | null | undefined,
    //                     total_release_mmscfd: number | null | undefined
    //                 } = approvedReleaseEntry.reduce((accumulator: any, value: any) => {
    //                     let releaseMmbtuD: number | null | undefined = null
    //                     try {
    //                         releaseMmbtuD = parseFloat(`${value.total_release_mmbtu_d}`?.trim()?.replace(/,/g, ''))
    //                         if (isNaN(releaseMmbtuD)) {
    //                             releaseMmbtuD = null
    //                         }
    //                     } catch (error) {
    //                         releaseMmbtuD = null
    //                     }

    //                     let releaseMmscfd: number | null | undefined = null
    //                     try {
    //                         releaseMmscfd = parseFloat(`${value.total_release_mmscfd}`?.trim()?.replace(/,/g, ''))
    //                         if (isNaN(releaseMmscfd)) {
    //                             releaseMmscfd = null
    //                         }
    //                     } catch (error) {
    //                         releaseMmscfd = null
    //                     }
    //                     return {
    //                         total_release_mmbtu_d: accumulator.total_release_mmbtu_d ? accumulator.total_release_mmbtu_d + (releaseMmbtuD ?? 0) : releaseMmbtuD,
    //                         total_release_mmscfd: accumulator.total_release_mmscfd ? accumulator.total_release_mmscfd + (releaseMmscfd ?? 0) : releaseMmscfd
    //                     }
    //                 }, {
    //                     total_release_mmbtu_d: null,
    //                     total_release_mmscfd: null
    //                 })

    //                 const approvedReleaseExitTotal: {
    //                     total_release_mmbtu_d: number | null | undefined,
    //                     total_release_mmscfd: number | null | undefined
    //                 } = approvedReleaseExit.reduce((accumulator: any, value: any) => {
    //                     let releaseMmbtuD: number | null | undefined = null
    //                     try {
    //                         releaseMmbtuD = parseFloat(`${value.total_release_mmbtu_d}`?.trim()?.replace(/,/g, ''))
    //                         if (isNaN(releaseMmbtuD)) {
    //                             releaseMmbtuD = null
    //                         }
    //                     } catch (error) {
    //                         releaseMmbtuD = null
    //                     }

    //                     let releaseMmscfd: number | null | undefined = null
    //                     try {
    //                         releaseMmscfd = parseFloat(`${value.total_release_mmscfd}`?.trim()?.replace(/,/g, ''))
    //                         if (isNaN(releaseMmscfd)) {
    //                             releaseMmscfd = null
    //                         }
    //                     } catch (error) {
    //                         releaseMmscfd = null
    //                     }
    //                     return {
    //                         total_release_mmbtu_d: accumulator.total_release_mmbtu_d ? accumulator.total_release_mmbtu_d + (releaseMmbtuD ?? 0) : releaseMmbtuD,
    //                         total_release_mmscfd: accumulator.total_release_mmscfd ? accumulator.total_release_mmscfd + (releaseMmscfd ?? 0) : releaseMmscfd
    //                     }
    //                 }, {
    //                     total_release_mmbtu_d: null,
    //                     total_release_mmscfd: null
    //                 })

    //                 let entryContractedMmbtuD: number | null | undefined = null
    //                 let entryContractedMmscfd: number | null | undefined = null
    //                 let exitContractedMmbtuD: number | null | undefined = null

    //                 try {
    //                     entryContractedMmbtuD = parseFloat(`${targetMapEntry?.value}`?.trim()?.replace(/,/g, ''))
    //                     if (isNaN(entryContractedMmbtuD)) {
    //                         entryContractedMmbtuD = targetMapEntry?.value
    //                     }
    //                     else {
    //                         entryContractedMmbtuD -= approvedReleaseEntryTotal.total_release_mmbtu_d ?? 0
    //                     }
    //                 } catch (error) {
    //                     entryContractedMmbtuD = targetMapEntry?.value
    //                 }

    //                 try {
    //                     entryContractedMmscfd = parseFloat(`${targetEntryMmscfd?.value}`?.trim()?.replace(/,/g, ''))
    //                     if (isNaN(entryContractedMmscfd)) {
    //                         entryContractedMmscfd = targetEntryMmscfd?.value
    //                     }
    //                     else {
    //                         entryContractedMmscfd -= approvedReleaseEntryTotal.total_release_mmscfd ?? 0
    //                     }
    //                 } catch (error) {
    //                     entryContractedMmscfd = targetEntryMmscfd?.value
    //                 }

    //                 try {
    //                     exitContractedMmbtuD = parseFloat(`${exit?.value}`?.trim()?.replace(/,/g, ''))
    //                     if (isNaN(exitContractedMmbtuD)) {
    //                         exitContractedMmbtuD = exit?.value
    //                     }
    //                     else {
    //                         exitContractedMmbtuD -= approvedReleaseExitTotal.total_release_mmbtu_d ?? 0
    //                     }
    //                 } catch (error) {
    //                     exitContractedMmbtuD = exit?.value
    //                 }


    //                 const entryObj = {
    //                     "booking_row_json_id": item.pathMatchEntry?.id,
    //                     "temp_contract_point": item.pathMatchEntry?.contract_point,
    //                     "temp_zone": item.pathMatchEntry?.zone_text,
    //                     "temp_area": item.pathMatchEntry?.area_text,

    //                     "temp_start_date": targetMapEntry?.start_date,
    //                     "temp_end_date": targetMapEntry?.end_date,

    //                     "total_contracted_mmbtu_d": entryContractedMmbtuD ?? targetMapEntry?.value,
    //                     "total_release_mmbtu_d": targetMapReleaseEntry?.value,
    //                     "total_contracted_mmscfd": entryContractedMmscfd ?? targetEntryMmscfd?.value,
    //                     "total_release_mmscfd": targetReleaseEntryMmscfd?.value,

    //                     "temp_date": targetMapEntry.date,
    //                     "temp_from_date": item.entryData.start_date,
    //                     "temp_to_date": item.entryData.end_date,

    //                     "entry_exit_id": item.pathMatchEntry?.entry_exit_id,
    //                     "entry_exit": item.pathMatchEntry?.entry_exit,
    //                     "pathMatch": {
    //                         "id": item.pathMatch?.id,
    //                         "entry": {
    //                             "name": item.entryData.area_text
    //                         },
    //                         "exit": {
    //                             "name": item.exitData.area_text
    //                         }
    //                     },
    //                     "path": item.path
    //                 }
    //                 const exitObj = {
    //                     "booking_row_json_id": item.pathMatchExit?.id,
    //                     "temp_contract_point": item.pathMatchExit?.contract_point,
    //                     "temp_zone": item.pathMatchExit?.zone_text,
    //                     "temp_area": item.pathMatchExit?.area_text,

    //                     "temp_start_date": exit?.start_date,
    //                     "temp_end_date": exit?.end_date,

    //                     "total_contracted_mmbtu_d": exitContractedMmbtuD ?? exit?.value,
    //                     "total_release_mmbtu_d": targetMapReleaseExit?.value,
    //                     "total_contracted_mmscfd": targetExitMmscfd?.value,
    //                     // "total_release_mmscfd": 100,

    //                     "temp_date": exit.date,
    //                     "temp_from_date": item.exitData.start_date,
    //                     "temp_to_date": item.exitData.end_date,

    //                     "entry_exit_id": item.pathMatchExit?.entry_exit_id,
    //                     "entry_exit": item.pathMatchExit?.entry_exit,
    //                     "pathMatch": {
    //                         "id": item.pathMatch?.id,
    //                         "entry": {
    //                             "name": item.entryData.area_text
    //                         },
    //                         "exit": {
    //                             "name": item.exitData.area_text
    //                         }
    //                     },
    //                     "path": item.path
    //                 }
    //                 totalItem++
    //                 totalRelease += releaseEntryValue
    //                 totalRelease -= releaseExitValue
    //                 return [entryObj, exitObj]
    //             })

    //             return targetList
    //             // return targetList.reduce((accumulator: any[], value: any) => accumulator.concat(value), [])
    //         })

    //         setTotalItem(totalItem)
    //         const targetData = newData.reduce((accumulator: any[], value: any) => accumulator.concat(value), [])

    //         // Filter logic with null checks
    //         const startDate = toDayjs(srchStartDate);
    //         const endDate = toDayjs(srchEndDate);

    //         let terminateDate: dayjs.Dayjs | undefined
    //         const contract = dataContract.find((item: any) => item.id == srchContractCode)
    //         if (contract?.terminate_date) {
    //             terminateDate = toDayjs(contract.terminate_date);
    //         }

    //         const filteredData = targetData?.filter((row: any) => {
    //             const filteredByDate = row?.filter((item: any) => {
    //                 let result = true
    //                 const tempStartDate = toDayjs(item.temp_start_date, 'DD/MM/YYYY');
    //                 const tempEndDate = toDayjs(item.temp_end_date, 'DD/MM/YYYY').add(1, 'day').startOf('day');

    //                 // check start date
    //                 if (result == true && startDate.isValid()) {
    //                     if (result == true && tempStartDate.isValid()) {
    //                         result = tempStartDate.isSameOrBefore(startDate)
    //                     }
    //                 }

    //                 // check end date
    //                 if (result == true && endDate.isValid()) {
    //                     if (result == true && tempEndDate.isValid()) {
    //                         // result = tempEndDate.isBefore(endDate);
    //                         result = tempEndDate.isSameOrAfter(endDate);
    //                     }
    //                 }


    //                 if (result == true && terminateDate && terminateDate.isValid()) {
    //                     if (result == true && tempStartDate.isValid()) {
    //                         result = tempStartDate.isBefore(terminateDate)
    //                     }

    //                     if (result == true && tempEndDate.isValid()) {
    //                         if (tempEndDate.isAfter(terminateDate)) {
    //                             item.temp_end_date = terminateDate.format('DD/MM/YYYY')
    //                             item.is_terminate = true
    //                         }
    //                     }
    //                 }

    //                 if (result) {
    //                     return item
    //                 }
    //                 return result
    //             });
    //             return filteredByDate.length == row.length
    //         })

    //         setDataEachMonth(filteredData)

    //         let canSubmit = totalRelease == 0

    //         if (filteredData) {

    //             const onlyReleaseArray = filteredData.filter((row: any) => {
    //                 const canReleaseRow = row?.filter((subRow: any) => {
    //                     let haveMmbtud = false
    //                     let haveMmscfd = false
    //                     if (subRow?.total_contracted_mmscfd == undefined) {
    //                         haveMmscfd = true
    //                     }
    //                     else {
    //                         haveMmscfd = subRow?.total_release_mmscfd != undefined
    //                     }

    //                     haveMmbtud = subRow?.total_release_mmbtu_d != undefined
    //                     return haveMmbtud && haveMmscfd
    //                 })
    //                 if (canSubmit == true && canReleaseRow.length > 0 && canReleaseRow.length != row.length) {
    //                     canSubmit = false
    //                 }
    //                 return canReleaseRow.length == row.length
    //             })

    //             // const flattenData = onlyReleaseArray.reduce((accumulator: any[], value: any) => accumulator.concat(value), [])
    //             if (onlyReleaseArray.length < 1) {
    //                 canSubmit = false
    //             }
    //             setDataPost({ ...dataPost, data: onlyReleaseArray })
    //         }

    //         setIsDisableSubmit(!canSubmit)
    //     }
    // }
    // #endregion ของเดิมบีม 20250927


    // #region ของใหม่ kom test เผื่อเร็วขึ้น
    // =======
    const isRunningRef = useRef(false);
    const jobIdRef = useRef(0);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // เรียกตัวนี้แทน handleUpdaleTable เดิม
    const scheduleHandleUpdaleTable = (newDataTable?: any, delay = 150) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const myJobId = ++jobIdRef.current;
            handleUpdaleTableCore(newDataTable, myJobId);
        }, delay);
    };


    // ====== ใช้แทน handleUpdaleTable เดิม ======
    const handleUpdaleTableCore = async (newDataTable?: any, myJobId?: number) => {
        // กันซ้อน / กันลูป
        if (isRunningRef.current) {
            // ปล่อยให้รอบเก่าจบเฟรม แล้วค่อยรันรอบล่าสุด (ลดค้าง UI)
            await new Promise<void>((r) => requestAnimationFrame(() => r()));
        }
        isRunningRef.current = true;

        // helper
        const isStale = () => myJobId != null && myJobId !== jobIdRef.current;
        const safeNum = (v: any): number | null => {
            if (v == null) return null;
            const n = parseFloat(String(v).trim().replace(/,/g, ''));
            return Number.isNaN(n) ? null : n;
        };
        const dmy = (d: any) => toDayjs(d).format('DD/MM/YYYY');
        const arKey = (cp: any, eeid: any, area: any, zone: any, startDMY: any, endDMY: any) => `${cp}|${eeid}|${area}|${zone}|${startDMY}|${endDMY}`;

        try {
            const dataTable = newDataTable || filteredDataTable;
            if (!dataTable || isStale()) return;

            // ------- index approvedRelease (sum) -------
            const approvedIndex = new Map<string, { total_release_mmbtu_d: number; total_release_mmscfd: number }>();
            for (const it of approvedRelease || []) {
                const key = arKey(
                    it.temp_contract_point,
                    it.entry_exit_id,
                    it.temp_area,
                    it.temp_zone,
                    dmy(it.temp_start_date),
                    dmy(it.temp_end_date)
                );
                const acc = approvedIndex.get(key) || { total_release_mmbtu_d: 0, total_release_mmscfd: 0 };
                acc.total_release_mmbtu_d += safeNum(it.total_release_mmbtu_d) ?? 0;
                acc.total_release_mmscfd += safeNum(it.total_release_mmscfd) ?? 0;
                approvedIndex.set(key, acc);
            }
            if (isStale()) return;

            let totalItem = 0;
            let totalRelease = 0;

            // ---------- newData (โครงสร้างเดิม) ----------
            const newData = dataTable.map((item: any) => {
                const entryMMBTU = (item?.entryData?.contracted_mmbtu_d_array || []).filter((x: any) => x?.value != null);
                const exitMMBTU = (item?.exitData?.contracted_mmbtu_d_array || []).filter((x: any) => x?.value != null);

                const entryByDate = new Map(entryMMBTU.map((x: any) => [x.date, x]));
                const exitByDate = new Map(exitMMBTU.map((x: any) => [x.date, x]));

                const entryMmscfdByDate = new Map((item?.entryData?.contracted_mmscfd_array || []).map((x: any) => [x.date, x]));
                const exitMmscfdByDate = new Map((item?.exitData?.contracted_mmscfd_array || []).map((x: any) => [x.date, x]));

                const entryRelMmbtuByDate = new Map((item?.entryData?.release_mmbtu_d_array || []).map((x: any) => [x.date, x]));
                const exitRelMmbtuByDate = new Map((item?.exitData?.release_mmbtu_d_array || []).map((x: any) => [x.date, x]));
                const entryRelMmscfdByDate = new Map((item?.entryData?.release_mmscfd_array || []).map((x: any) => [x.date, x]));

                const entrySameMonth = entryMMBTU.filter((e: any) => exitByDate.has(e.date));
                // entrySameMonth.length 239
                const exitSameMonth = exitMMBTU.filter((x: any) => entryByDate.has(x.date));

                const targetList = exitSameMonth.map((exit: any) => {
                    const targetMapEntry: any = entryByDate.get(exit.date);
                    const targetEntryMmscfd: any = entryMmscfdByDate.get(targetMapEntry?.date);
                    const targetExitMmscfd: any = exitMmscfdByDate.get(exit.date);

                    const targetMapReleaseEntry: any = entryRelMmbtuByDate.get(exit.date);
                    const targetReleaseEntryMmscfd: any = entryRelMmscfdByDate.get(targetMapReleaseEntry?.date ?? exit.date);
                    const targetMapReleaseExit: any = exitRelMmbtuByDate.get(exit.date);

                    const releaseEntryValue = safeNum(targetMapReleaseEntry?.value) ?? 0;
                    const releaseExitValue = safeNum(targetMapReleaseExit?.value) ?? 0;

                    const entryKey = arKey(
                        item.pathMatchEntry?.contract_point,
                        item.pathMatchEntry?.entry_exit_id,
                        item.pathMatchEntry?.area_text,
                        item.pathMatchEntry?.zone_text,
                        targetMapEntry?.start_date,
                        targetMapEntry?.end_date
                    );
                    const exitKey = arKey(
                        item.pathMatchExit?.contract_point,
                        item.pathMatchExit?.entry_exit_id,
                        item.pathMatchExit?.area_text,
                        item.pathMatchExit?.zone_text,
                        exit?.start_date,
                        exit?.end_date
                    );
                    const approvedEntry = approvedIndex.get(entryKey) || { total_release_mmbtu_d: 0, total_release_mmscfd: 0 };
                    const approvedExit = approvedIndex.get(exitKey) || { total_release_mmbtu_d: 0, total_release_mmscfd: 0 };

                    const eVal = safeNum(targetMapEntry?.value);
                    const entryContractedMmbtuD = eVal == null ? targetMapEntry?.value : eVal - (approvedEntry.total_release_mmbtu_d ?? 0);

                    const eMmscfd = safeNum(targetEntryMmscfd?.value);
                    const entryContractedMmscfd = eMmscfd == null ? targetEntryMmscfd?.value : eMmscfd - (approvedEntry.total_release_mmscfd ?? 0);

                    const xVal = safeNum(exit?.value);
                    const exitContractedMmbtuD = xVal == null ? exit?.value : xVal - (approvedExit.total_release_mmbtu_d ?? 0);

                    const entryObj = {
                        booking_row_json_id: item.pathMatchEntry?.id,
                        temp_contract_point: item.pathMatchEntry?.contract_point,
                        temp_zone: item.pathMatchEntry?.zone_text,
                        temp_area: item.pathMatchEntry?.area_text,

                        temp_start_date: targetMapEntry?.start_date,
                        temp_end_date: targetMapEntry?.end_date,

                        total_contracted_mmbtu_d: entryContractedMmbtuD ?? targetMapEntry?.value,
                        total_release_mmbtu_d: targetMapReleaseEntry?.value,
                        total_contracted_mmscfd: entryContractedMmscfd ?? targetEntryMmscfd?.value,
                        total_release_mmscfd: targetReleaseEntryMmscfd?.value,

                        temp_date: targetMapEntry?.date,
                        temp_from_date: item.entryData?.start_date,
                        temp_to_date: item.entryData?.end_date,

                        entry_exit_id: item.pathMatchEntry?.entry_exit_id,
                        entry_exit: item.pathMatchEntry?.entry_exit,
                        pathMatch: {
                            id: item.pathMatch?.id,
                            entry: { name: item.entryData?.area_text },
                            exit: { name: item.exitData?.area_text },
                        },
                        path: item.path,
                    };

                    const exitObj = {
                        booking_row_json_id: item.pathMatchExit?.id,
                        temp_contract_point: item.pathMatchExit?.contract_point,
                        temp_zone: item.pathMatchExit?.zone_text,
                        temp_area: item.pathMatchExit?.area_text,

                        temp_start_date: exit?.start_date,
                        temp_end_date: exit?.end_date,

                        total_contracted_mmbtu_d: exitContractedMmbtuD ?? exit?.value,
                        total_release_mmbtu_d: targetMapReleaseExit?.value,
                        total_contracted_mmscfd: targetExitMmscfd?.value,

                        temp_date: exit?.date,
                        temp_from_date: item.exitData?.start_date,
                        temp_to_date: item.exitData?.end_date,

                        entry_exit_id: item.pathMatchExit?.entry_exit_id,
                        entry_exit: item.pathMatchExit?.entry_exit,
                        pathMatch: {
                            id: item.pathMatch?.id,
                            entry: { name: item.entryData?.area_text },
                            exit: { name: item.exitData?.area_text },
                        },
                        path: item.path,
                    };

                    totalItem++;
                    totalRelease += releaseEntryValue;
                    totalRelease -= releaseExitValue;

                    return [entryObj, exitObj];
                });

                return targetList;
            });

            if (isStale()) return;

            const targetData = newData.reduce((acc: any[], row: any) => acc.concat(row), []);

            // ---------- Filter (no mutation) ----------
            const startDate = toDayjs(srchStartDate);
            const endDate = toDayjs(srchEndDate);

            let terminateDate: dayjs.Dayjs | undefined;
            const contractFound = dataContract.find((it: any) => it.id == srchContractCode);
            if (contractFound?.terminate_date) terminateDate = toDayjs(contractFound.terminate_date);

            const filteredData = targetData?.filter((row: any[]) => {
                const filteredByDate = row?.map((it: any) => {
                    let result = true;
                    const tmpStart = toDayjs(it?.temp_start_date, 'DD/MM/YYYY');
                    const tmpEnd = toDayjs(it?.temp_end_date, 'DD/MM/YYYY').add(1, 'day').startOf('day');

                    if (result && startDate.isValid() && tmpStart.isValid()) result = tmpStart.isSameOrBefore(startDate);
                    if (result && endDate.isValid() && tmpEnd.isValid()) result = tmpEnd.isSameOrAfter(endDate);

                    if (result && terminateDate?.isValid()) {
                        if (tmpStart.isValid()) result = tmpStart.isBefore(terminateDate);
                    }

                    // **ไม่ mutate**: ถ้าต้อง clamp end → คืนสำเนาใหม่
                    if (result && terminateDate?.isValid()) {
                        if (tmpEnd.isValid() && tmpEnd.isAfter(terminateDate)) {
                            return {
                                ...it,
                                temp_end_date: terminateDate.format('DD/MM/YYYY'),
                                is_terminate: true,
                            };
                        }
                    }
                    return result ? it : null;
                }).filter(Boolean);

                return filteredByDate.length == row.length;
            });

            if (isStale()) return;

            // ---------- canSubmit ----------
            let canSubmit = totalRelease === 0;
            let onlyReleaseArray: any[] = [];

            if (filteredData) {
                onlyReleaseArray = filteredData.filter((row: any[]) => {
                    const canReleaseRow = row?.filter((subRow: any) => {
                        const haveMmbtud = subRow?.total_release_mmbtu_d != undefined;
                        const needMmscfd = subRow?.total_contracted_mmscfd != undefined;
                        const haveMmscfd = !needMmscfd || subRow?.total_release_mmscfd != undefined;
                        return haveMmbtud && haveMmscfd;
                    });
                    if (canSubmit && canReleaseRow.length > 0 && canReleaseRow.length != row.length) {
                        canSubmit = false;
                    }
                    return canReleaseRow.length == row.length;
                });

                if (onlyReleaseArray.length < 1) canSubmit = false;
            }

            if (isStale()) return;

            // ---------- อัปเดต state ทีเดียว (ลด re-render/loop) ----------
            React.startTransition?.(() => {
                setTotalItem(totalItem);
                setDataEachMonth(filteredData);
                setDataPost((prev: any) => ({ ...prev, data: onlyReleaseArray }));
                setIsDisableSubmit(!canSubmit);
            });
        } catch (e) {
            // error
        } finally {
            isRunningRef.current = false;
        }
    };
    // #endregion ของใหม่ kom test เผื่อเร็วขึ้น



    // ของใหม่ komtest
    useEffect(() => {
        if (isUpdateMutableDataTable) {
            setIsUpdateMutableDataTable(false);
            scheduleHandleUpdaleTable(dataTable, 150); // หน่วง 150ms กันยิงรัว ๆ แล้วค้าง
        }
    }, [isUpdateMutableDataTable]);


    // ของเก่า 20250927
    // useEffect(() => {
    //     if (isUpdateMutableDataTable) {
    //         setIsUpdateMutableDataTable(false)
    //         handleUpdaleTable(dataTable);
    //         // handleSearch(srchQuery)
    //     }
    // }, [isUpdateMutableDataTable])


    useEffect(() => {
        if (srchContractCode) {
            try {
                getService(`/master/release-capacity-submission?contract_code_id=${srchContractCode}`).then(response => {
                    if (response?.data) {
                        // Extract unique contract points from the dataTable
                        const contractPoints = Array.from(
                            new Set(
                                response?.data?.flatMap((data: any) => [
                                    data.entryData?.contract_point,
                                    data.exitData?.contract_point
                                ]).filter(Boolean) // Remove null or undefined values
                            )
                        );

                        // Map contractPoints into options for the InputSearch component
                        const options: any = contractPoints.map((point) => ({
                            value: point,
                            label: point,
                        }));
                        setContractPointOptions(options)
                    }
                });
            } catch (error) {
            }
        }
    }, [srchContractCode])

    useEffect(() => {
        fetchData();
        getPermission();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [modalMsg, setModalMsg] = useState<any>("");

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    // ############### MODAL SUBMISSION COMMENTS ###############
    const [mdSubmissionView, setMdSubmissionView] = useState<any>(false);
    const [dataSubmission, setDataSubmission] = useState<any>([]);

    const openSubmissionModal = (id?: any, data?: any) => {

        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataSubmission(filtered)
        setMdSubmissionView(true)
    };

    // ############### MODAL ADD DOCS ###############
    const [mdAddDoc, setMdAddDoc] = useState<any>(false);

    const openAddDocModal = (id?: any, data?: any) => {

        // const filtered = dataTable?.find((item: any) => item.id === id);
        // setDataSubmission(filtered)
        setMdAddDoc(true)
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItem, setTotalItem] = useState(0);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (dataEachMonth) {
            setPaginatedData(dataEachMonth.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [dataEachMonth, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'contract_point', label: 'Point', visible: true },
        { key: 'entry_exit', label: 'Entry / Exit', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'contracted_mmbtu_d', label: 'Contracted (MMBTU/D)', visible: true },
        { key: 'contracted_mmscfd', label: 'Contracted (MMSCFD)', visible: true },
        { key: 'release_mmscfd', label: 'Release (MMSCFD)', visible: true },
        { key: 'release_mmbtud', label: 'Release (MMBTU/D)', visible: true },
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

    return (
        <div className=" space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select"
                        value={srchContractCode}
                        // onChange={(e) => setSrchContractCode(e.target.value)}
                        onChange={(e) => {
                            setSrchContractCode(e.target.value)
                            filterContractPointUnderContract(e.target.value)
                            setSrchPoint([])
                        }}
                        options={dataContract
                            ?.filter((item: any) => {
                                return userDT?.account_manage?.[0]?.user_type_id !== 3 || item?.group_id === userDT?.account_manage?.[0]?.group?.id;
                            })
                            .map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item?.contract_code,
                            }))
                        }
                    />

                    {/* v1.0.77 Contract Point filter ควรที่จะเป็น multi select โดย default เป็น select all  https://app.clickup.com/t/86ereurvd */}
                    <InputSearch
                        id="searchPoint"
                        label="Contract Point"
                        type="select-multi-checkbox"
                        value={srchPoint}
                        onChange={(e) => setSrchPoint(e.target.value)}
                        options={contractPointOptions || []}
                    />

                    <DatePickaSearch
                        key={"start" + key}
                        label="Start Date"
                        placeHolder="Select Start Date"
                        allowClear
                        min={contractStartDate}
                        max={contractEndDate}
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <DatePickaSearch
                        key={"end" + key}
                        label="End Date"
                        placeHolder="Select End Date"
                        allowClear
                        min={contractStartDate}
                        max={contractEndDate}
                        onChange={(e: any) => setSrchEndDate(e ? e : null)}
                    />
                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

                <div className="pt-2 w-full sm:w-auto flex justify-end sm:ml-auto gap-2">
                    {
                        userPermission?.f_create && <>
                            <BtnGeneral
                                textRender={"Document"}
                                bgcolor={"#17AC6B"}
                                iconNoRender={true}
                                // disable={isDisableDocument}
                                disable={paginatedData?.length > 0 ? false : true}
                                generalFunc={openAddDocModal}
                                can_create={userPermission ? userPermission?.f_create : false}
                            />
                            <BtnGeneral
                                textRender={"Submit"}
                                bgcolor={"#00ADEF"}
                                iconNoRender={true}
                                disable={isDisableSubmit}
                                generalFunc={openSubmissionModal}
                                can_create={userPermission ? userPermission?.f_create : false}
                            />
                        </>
                    }
                </div>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div onClick={handleTogglePopover}>
                            <TuneIcon
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
                                generalFunc={() => exportToExcel(paginatedData, "release-capacity-submission", columnVisibility)}
                                can_export={userPermission ? userPermission?.f_export : false}
                                disable={paginatedData?.length > 0 ? false : true}
                            />
                        </div>
                    </div>
                </div>

                <TableReleaseCapSubEachMonth
                    tableData={paginatedData}
                    callBack={handleUpdateValue}
                    isLoading={isLoading}
                    isResetForm={isResetForm}
                    isResetFormCallBack={() => setIsResetForm(false)}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                />
            </div>

            <PaginationComponent
                totalItems={totalItem}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ModalSubmissionDetails
                data={dataPost}
                mainData={dataDetail}
                open={mdSubmissionView}
                setModalErrorMsg={setModalErrorMsg}
                setModalErrorOpen={setModalErrorOpen}
                setModalSuccessOpen={setModalSuccessOpen}
                setMdSubmissionView={(isOpen: boolean) => {
                    setMdSubmissionView(isOpen)
                    handleFieldSearch()
                }}
                setModalMsg={setModalMsg}
                setDataFileArr={setDataFileArr}
                onClose={() => {
                    setMdSubmissionView(false);
                }}
            />

            <ModalAddDocument
                open={mdAddDoc}
                specificData={srchContractCode}
                setModalErrorMsg={setModalErrorMsg}
                setModalErrorOpen={setModalErrorOpen}
                onClose={() => {
                    setMdAddDoc(false);
                }}
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalMsg}
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

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />
        </div>
    );
};

export default ClientPage;