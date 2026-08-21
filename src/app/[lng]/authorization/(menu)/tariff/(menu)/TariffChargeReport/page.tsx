"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Tune } from "@mui/icons-material"
import { InputSearch } from "@/components/other/SearchForm";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import ModalComponent from "@/components/other/ResponseModal";
import { useAppDispatch } from "@/utils/store/store";
import { useFetchMasters } from "@/hook/fetchMaster";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, generateUserPermission } from "@/utils/generalFormatter";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import dayjs from 'dayjs';
import BtnGeneral from "@/components/other/btnGeneral";
import getUserValue from "@/utils/getuserValue";
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import { getService, postService } from "@/utils/postService";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CustomTooltip } from "@/components/other/customToolTip";
import TableTariffChargeReport from "./form/table";
import ModalComment from "./form/modalComment";
import { useRouter } from "next/navigation";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import ModalRunTariff from "./form/modalRunTariff";

interface ClientProps { params: { lng: string } }

const ClientPage: React.FC<ClientProps> = (props) => {
    const { register, setValue, reset, formState: { errors }, watch, getValues } = useForm<any>();
    const router = useRouter();

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg";

    //state
    const [key, setKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSearchFilter, setIsSearchFilter] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalRunTariffCompleateOpen, setIsModalRunTariffCompleateOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Your file has been uploaded.');
    const endOfMonth = dayjs().endOf('month').format('YYYY-MM-DD');

    const handleCloseModal = () => {
        setModalSuccessOpen(false);
    }

    // #region close เหลือง ๆ
    const handleCloseModalProcess = () => { // tariff run process
        setIsModalRunTariffCompleateOpen(false);

        setTimeout(async () => {
            await fetchData(0, 10);
        }, 500);

        // หลังจากดึงข้อมูลใหม่ ให้ฟิลเตอร์ user จะได้เห็นของ
        setTimeout(() => {
            handleFieldSearch();
        }, 500);
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
            //     const permission = findRoleConfigByMenuName('Tariff Charge Report', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName(`Tariff Charge Report`, userDT)
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
    const [srchStartDate, setSrchStartDate] = useState<Date | null>();
    // const [srchTariffId, setSrchTariffId] = useState<any>('');
    const [srchTariffId, setSrchTariffId] = useState<any>([]);
    const [is1stTimeLoad, setIs1stTimeLoad] = useState<boolean>(true);

    const handleFieldSearch = async () => {
        let newOffset = (currentPage - 1) * itemsPerPage;

        setIsLoading(true)
        setIsSearchFilter(true)
        setIs1stTimeLoad(false)
        // let url = `/master/tariff/tariffChargeReport/tariffChargeReportFindAll?limit=${itemsPerPage}&offset=0`
        let url = `/master/tariff/tariffChargeReport/tariffChargeReportFindAll?limit=${itemsPerPage}&offset=${newOffset}`
        if (srchStartDate !== undefined && srchStartDate !== null) {
            url += `&month_year_charge=${dayjs(srchStartDate).format("YYYY-MM-DD")}`
        }

        if (srchTariffId?.length > 0) {
            url += `&id=[${srchTariffId}]`
        }

        const res_main_data = await getService(url);

        // setDataTableTotal(res_main_data?.total)
        // setDataTable(res_main_data?.data)
        // setFilteredDataTable(res_main_data?.data)

        // List > Shipper จะเห็นเฉพาะรายการที่โดน Invoice Sent มาเท่านั้น เห็นแค่รายการที่ Yes https://app.clickup.com/t/86euq773g
        let res_filtered: any = res_main_data?.data
        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            res_filtered = (Array.isArray(res_main_data?.data) ? res_main_data?.data : []).filter((item: any) => item?.shipper?.id === userDT?.account_manage?.[0]?.group?.id).filter((itemx: any) => itemx?.tariff_invoice_sent_id == 1)
        }

        if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            setDataTableTotal(res_filtered?.length)
        } else {
            setDataTableTotal(res_main_data.total)
        }

        // setDataTableTotal(res_filtered?.length)
        setDataTable(res_filtered)
        setFilteredDataTable(res_filtered)

        // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    };

    const handleReset = () => {
        // setSrchTariffId('');
        setSrchTariffId([]);
        setSrchStartDate(null);
        setKey((prevKey) => prevKey + 1);
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setIsSearchFilter(false)

        setTimeout(() => {

            setDataTableTotal(0)
            setDataTable([])
            setFilteredDataTable([])

            fetchData(0, 10);

        }, 200);
    };
    
    useEffect(() => {
        let url = `/master/tariff/tariffChargeReport/tariffChargeReportFindId`
        if (srchStartDate !== undefined && srchStartDate !== null) {
            url += `?month_year_charge=${dayjs(srchStartDate).format("YYYY-MM-DD")}`
        }
        else{
            url += `?month_year_charge=${dayjs().startOf('month').format("YYYY-MM-DD")}`
        }

        if(userDT?.account_manage?.[0]?.user_type_id == 3){
            url += `&shipper_id=${userDT?.account_manage?.[0]?.group?.id}`
        }
        getService(url).then((res_tariff_id: any) => {
            if(res_tariff_id && Array.isArray(res_tariff_id)){
                setDataTariffId(res_tariff_id)
            }
        });
    }, [srchStartDate]);

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = dataTable?.filter(
            (item: any) => {

                return (
                    item?.tariff_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.shipper?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    dayjs(item?.month_year_charge).format("MMMM YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tariff_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.tariff_invoice_sent?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    (item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
                    (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    (item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
                    (item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    formatDateNoTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)

                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [formMode, setFormMode] = useState<'execute' | 'template' | 'view' | undefined>(undefined);
    const [viewDetailOpen, setViewDetailOpen] = useState(false);
    const [viewDetailData, setViewDetailData] = useState<any>();

    const openViewForm = (id: any) => {
        const filteredData = filteredDataTable.find((item: any) => item.id === id);
        setViewDetailData(filteredData);
        setFormMode('view');
        setViewDetailOpen(true);
    };

    // ############### DATA TABLE ###############
    const [dataTableTotal, setDataTableTotal] = useState<any>(0);
    const [dataTable, setDataTable] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataStatusMain, setDataStatusMain] = useState<any>([]);
    const [dataStatusDocument, setDataStatusDocument] = useState<any>([]);
    const [dataContractCode, setDataContractCode] = useState<any>([]);
    const [dataTariffId, setDataTariffId] = useState<any>([]);

    const fetchMaster = async () => {
        // DATA STATUS หลัก
        const res_main_stat = await getService(`/master/event/event-status`)
        setDataStatusMain(res_main_stat)

        // DATA STATUS เอกสาร
        const res_document_stat = await getService(`/master/event/event-doc-status`)
        setDataStatusDocument(res_document_stat)
    }

    // #region FETCH
    const fetchData = async (offset?: any, limit?: any) => {
        try {
            setIsLoading(true)

            // DATA CONTRAC CODE เอามาใช้กับข้อนี้ --> Run Tariff : Shipper Name Select ยังขึ้นไม่ถูกต้อง https://app.clickup.com/t/86euna6ga
            // หา contract start-end ที่อยู่ในช่วงเดือนที่เลือก
            // ไม่เอา contract stat reject
            // จากนั้นเอารายชื่อ shipper จาก contract พวกนั้น
            const res_contract: any = await getService(`/master/capacity/capacity-request-management`);
            const filter_1 = res_contract?.filter((item: any) => item?.status_capacity_request_management_id !== 3) // 3 == Rejected
            setDataContractCode(filter_1)

            // DATA TARIFF ID
            // // tariff/tariffChargeReport/tariffChargeReportFindId
            // const res_tariff_id = await getService(`/master/tariff/tariffChargeReport/tariffChargeReportFindId`)
            // setDataTariffId(res_tariff_id)

            // ที่ปิดไว้เพราะ List > เข้ามาหน้าแรก ต้องขึ้นเป็นให้ Filter ข้อมูล เพราะคิดว่าข้อมูลจริงมันจะเยอะมากๆ เลยต้องให้ filter เลือกข้อมูลที่ต้องการก่อน https://app.clickup.com/t/86eupydpt

            // DATA MAIN
            // let url = `/master/tariff/tariffChargeReport/tariffChargeReportFindAll?limit=${limit}&offset=${offset}`
            // // if (srchStartDate !== undefined && srchStartDate !== null) {
            // //     url += `&month_year_charge=${srchStartDate}`
            // // }
            // // if (srchTariffId !== '') {
            // //     url += `&id=${srchTariffId}`
            // // }

            // const res_main_data = await getService(url);
            // setDataTableTotal(res_main_data?.total)
            // setDataTable(res_main_data?.data)
            // setFilteredDataTable(res_main_data?.data)

            setTimeout(() => {
                setIsLoading(false)
            }, 500);

        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    //load data
    useEffect(() => {
        fetchData(0, 10);
        // fetchMaster();
    }, [resetForm]);

    // #region RUN TARIFF
    // ############### RUN TARIFF ###############
    const [isModalRunTariffOpen, setIsModalRunTariffOpen] = useState<any>(false); // เปิดหรือปิด

    const handleRunTariff = () => {
        // run tariff
        setIsModalRunTariffOpen(true)
    }

    const handleFormSubmit = async (item?: any) => {

    }

    const handleRunTariffSubmit = async (data: any) => {
        // setIsLoading(true)
        setIsModalRunTariffCompleateOpen(true)
        setIsModalRunTariffOpen(false);
        const res_create = await postService('/master/tariff/tariffChargeReport/runtariff', data);
        const status = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

        // if ([400, 500].includes(status)) {
        //     setIsModalRunTariffOpen(false);
        //     setModalErrorMsg(errorMsg ? errorMsg : 'Cannot run Tariff');
        //     setModalErrorOpen(true)
        // } else {
        //     setIsModalRunTariffOpen(false);
        //     setModalSuccessMsg('Tariff ID Compare has been confirmed.')
        //     // setModalSuccessOpen(true);
        //     setIsModalRunTariffCompleateOpen(true)

        //     // ย้ายไปอยู่ตอนปิดโมดอลเหลือง ๆ 
        //     // setTimeout(async () => {
        //     //     await fetchData(0, 10);
        //     // }, 500);
        // }

        // await fetchData(0, 10);
        if (resetForm) resetForm();
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
            // setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
            setPaginatedData(filteredDataTable) // ที่ใช้ยังงี้เพราะของที่ได้มาจาก service มันทำ pagination อยู่แล้ว
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    useEffect(() => {

        if (!is1stTimeLoad) {
            let newOffset = (currentPage - 1) * itemsPerPage;
            // fetchData(newOffset, itemsPerPage);

            handleFieldSearch();
            setIsLoading(false)
        }
    }, [currentPage, itemsPerPage]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'tariff_id', label: 'Tariff ID', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'month_year_charge', label: 'Month/Year Charge', visible: true },
        { key: 'type', label: 'Type', visible: true },
        { key: 'timestamp', label: 'Timestamp', visible: true },
        { key: 'invoice_sent', label: 'Invoice Sent', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'created_by', label: 'Created By', visible: true },
        { key: 'updated_by', label: 'Updated By', visible: true },
    ];

    const filteredColumns = initialColumns?.filter((col: any) => {
        if ((col.key === 'tariff_id' || col.key === 'timestamp' || col.key === 'comment') && userDT?.account_manage?.[0]?.user_type_id === 3) { // shipper เห็นแค่สามคอลัม
            return true;
        } else if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            return true;
        }
    });

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [tk, settk] = useState<boolean>(false);
    const open = Boolean(anchorEl);
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggleNew = (columnKey: string) => {
        const dataFilter = filteredColumns;

        const getDescendants = (key: string): string[] => {
            const children = dataFilter.filter((col: { key: string; parent_id?: string }) => col.parent_id === key);
            return children.reduce((acc: string[], child: any) => {
                return [...acc, child.key, ...getDescendants(child.key)];
            }, []);
        };

        const getAncestors = (key: string): string[] => {
            const column = dataFilter.find((col: any) => col.key === key);
            if (column?.parent_id) {
                return [column.parent_id, ...getAncestors(column.parent_id)];
            }
            return [];
        };

        const descendants = getDescendants(columnKey);
        const ancestors = getAncestors(columnKey);

        setColumnVisibility((prev: any) => {
            const newState = { ...prev };
            const currentChecked = prev[columnKey];
            const newChecked = !currentChecked;

            // Toggle current column
            newState[columnKey] = newChecked;

            // Toggle all descendant columns to match the newChecked state
            descendants.forEach((key: any) => {
                newState[key] = newChecked;
            });

            // Update parent visibility based on sibling states (bottom-up)
            ancestors.forEach(parentKey => {
                const siblings = dataFilter.filter((col: any) => col.parent_id === parentKey);
                const isAnySiblingChecked = siblings.some((col: any) => newState[col.key]);

                newState[parentKey] = isAnySiblingChecked;
            });

            return newState;
        });

        settk((prev: any) => !prev);
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    // ############### COMMENT VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openCommentModal = (id: any, data: any, row: any) => {

        setDataReason(data)
        setDataReasonRow(row)
        setMdReasonView(true)
    };

    // #region ROUTE
    const handleTariffIdClick = (id?: any, row?: any) => { // โยน row เข้ามาด้วยเลย เดิมเอาแค่ id ไป filter
        setIsLoading(true)
        router.push(`/en/authorization/tariff/TariffChargeReport/${id}`);
    };

    return (
        <div className="space-y-2">

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <MonthYearPickaSearch
                        key={"start" + key}
                        label={'Month/Year Charge'}
                        placeHolder={'Select Month/Year Charge'}
                        allowClear
                        // min={dataTable?.date_balance}
                        // max={endOfMonth} 
                        customWidth={230}
                        // customHeight={35}
                        onChange={(e: any) => {
                            // const formattedDate = dayjs(e).format('DD-MM-YYYY');
                            // setSrchGasDay(e ? formattedDate : null);
                            setSrchStartDate(e ? e : null)
                        }}
                    />

                    <InputSearch
                        id="searchTariffId"
                        label="Tariff ID"
                        // type="select"
                        type="select-multi-checkbox"
                        customWidth={280}
                        value={srchTariffId}
                        onChange={(e) => setSrchTariffId(e.target.value)}
                        options={dataTariffId?.map((item: any) => ({
                            value: item.id,
                            label: item.tariff_id
                        }))}
                    />

                    <div className="w-auto relative flex gap-2 items-center pl-[5px] -mt-6">
                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                        <BtnReset handleReset={handleReset} />
                    </div>
                </aside>

                <div className="action-panel flex gap-3 items-end justify-end pb-[8px]">

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                        <div className="flex flex-wrap gap-2 justify-end">
                            <BtnGeneral
                                textRender={"Run Tariff"}
                                iconNoRender={true}
                                bgcolor={"#00ADEF"}
                                generalFunc={() => handleRunTariff()}
                                disable={false}
                                customWidthSpecific={130}
                                can_create={userPermission ? userPermission?.f_create : false}
                            />
                        </div>
                    }
                </div>
            </div>

            <div className={`${cardClass}`}>
                <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <CustomTooltip
                                title={
                                    <div>
                                        <p className="text-[#464255]">
                                            {`Tariff ID-A รวมค่า Nomination Point ของทั้งเดือนแล้วปัดทศนิยมแบบ Round ราย Nomination Point แล้วรวมค่าทุก Nomination Point`}
                                        </p>
                                        <p className="text-[#464255]">
                                            {`Tariff ID-B รวมค่าทุก Nomination Point รายวันแล้วปัดทศนิยมแบบ Round รายวัน จากนั้นรวมค่าทั้งเดือน`}
                                        </p>
                                    </div>
                                }
                                placement="top-end"
                                arrow
                            >
                                <div className="w-[24px] h-[24px] flex items-center justify-center border border-[#B6B6B6] rounded-[6px]">
                                    <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                                </div>
                            </CustomTooltip>

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
                                path="tariff/tariff-charge-report"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu={'tariff-charge-report'}
                                specificData={
                                    {
                                        // "eventDateFrom": srchStartDate ? dayjs(srchStartDate).format('YYYY-MM-DD') : dayjs().subtract(3, 'year').startOf('year').format('YYYY-MM-DD'),  // ต้นปี 3 ปีก่อน
                                        "month_year_charge": srchStartDate ? dayjs(srchStartDate).format('YYYY-MM-DD') : "", // 2025-08-01
                                        "id": srchTariffId?.length > 0 ? srchTariffId : '',  // [0] ทำไว้กันแตกก่อน
                                        // "offset": currentPage,
                                        "offset": currentPage - 1,
                                        "limit": itemsPerPage
                                    }
                                }
                            />
                        </div>
                    </div>
                </div>

                <TableTariffChargeReport
                    tableData={paginatedData}
                    isLoading={isLoading}
                    isSearchFilter={isSearchFilter}
                    columnVisibility={columnVisibility}
                    initialColumns={filteredColumns}
                    setisLoading={setIsLoading}
                    userPermission={userPermission}
                    userDT={userDT}
                    handleFormSubmit={handleFormSubmit}
                    openViewForm={openViewForm}
                    openReasonModal={openCommentModal}
                    handleTariffIdClick={handleTariffIdClick}
                />
            </div>

            <PaginationComponent
                // totalItems={filteredDataTable?.length}
                totalItems={dataTableTotal}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
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
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalComponent
                open={isModalRunTariffCompleateOpen}
                handleClose={handleCloseModalProcess}
                title="Tariff Processing"
                stat="process"
                // description="Non TPA Point has been added."
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
                description={
                    <div>
                        <div className="text-center">
                            {`${modalSuccessMsg}`}
                        </div>
                    </div>
                }
            />

            <ModalRunTariff
                data={{}}
                open={isModalRunTariffOpen}
                dataTariffId={[]}
                dataContractCode={dataContractCode}
                onClose={() => {
                    setIsModalRunTariffOpen(false);
                    // if (resetForm) {
                    //     setTimeout(() => {
                    //         resetForm();
                    //         setFormData({})
                    //     }, 200);
                    // }
                }}
                onSubmit={handleRunTariffSubmit}
                setResetForm={setResetForm}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                // dataShipperGroup={dataShipperGroup}
                dataShipperGroup={[]}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                    handleFieldSearch(); // comment แล้ว fetch ใหม่
                }}
            />

            <ColumnVisibilityPopoverBalReport
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggleNew}
                // initialColumns={initialColumns}
                initialColumns={filteredColumns}
            />
        </div >
    )
}

export default ClientPage;