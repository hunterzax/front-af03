"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import { InputSearch } from "@/components/other/SearchForm";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { getService, patchService } from "@/utils/postService";
import BtnGeneral from "@/components/other/btnGeneral";
import { decryptData } from "@/utils/encryptionData";
import { exportToExcel, findRightByMenuName, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatNumberTwoDecimalNom, generateUserPermission, roundNumber, underDevelopment } from "@/utils/generalFormatter";
import getUserValue from "@/utils/getuserValue";
import { useForm } from "react-hook-form";
import SearchInput from "@/components/other/searchInput";
import { Tune } from "@mui/icons-material"
import TableTariffChargeReportInside from "./form/tableInside";
import ModalComment from "../form/modalComment";
import ModalComponent from "@/components/other/ResponseModal";
import ModalCalBac from "./form/modalCalBac";
import ModalAction from "./form/modalAction";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopoverBalReport from "@/components/other/popOverShowHideForBalReport";
import ModalView from "./form/modalView";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import getCookieValue from "@/utils/getCookieValue";
dayjs.extend(utc);
interface ComponentProps {
    data?: any;
}

const DocumentPage: React.FC<any> = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);
    const [flagInit, setFlagInit] = useState(false)
    const [tempTotal, setTempTotal] = useState(0);


    // const { control, register, handleSubmit, setValue, reset, formState: { errors }, clearErrors, watch, } = useForm<any>({ defaultValues: data, });
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, clearErrors, watch, } = useForm<any>();
    const router = useRouter();
    const pathname = usePathname();
    const id = pathname.split("/")[5]; // get id
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingCal, setIsLoadingCal] = useState<boolean>(false);
    const [headData, setHeadData] = useState<any>();

    const [isShipperSentInv, setIsShipperSentInv] = useState<boolean>(false);
    const [dataIsSentInv, setDataIsSentInv] = useState<{ name: string; month_year_charge: string }[]>([]);

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg";

    const [dataTableTotal, setDataTableTotal] = useState<any>(0);
    const [dataTable, setDataTable] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    // const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataTariffType, setDataTariffType] = useState<any>([]);
    const [resetForm, setResetForm] = useState<() => void | null>();

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    // const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    // useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);

            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    {/* CAL BAC */ }
    const [modalCalOpen, setModalCalOpen] = useState<any>(false)

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Invoice has been sent.');

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | undefined>(undefined);
    const [viewDetailData, setViewDetailData] = useState<any>();
    const [viewTableData, setViewTableData] = useState<any>();
    const [tableTypeView, setTableTypeView] = useState<any>();
    const [tableTypeViewName, setTableTypeViewName] = useState<any>();
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState<any>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [dataShipper, setDataShipper] = useState([]);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    // #region OPEN VIEW
    const openViewForm = async (id: any) => {
        const filteredData = filteredDataTable.find((item: any) => item.id === id);
        const res_data_view_table = await getService(`/master/tariff/tariffChargeReport/chargeView?id=${id}`);

        setViewTableData(res_data_view_table)
        // setTableTypeView(filteredData?.tariff_type_charge?.name)
        setTableTypeView(filteredData?.tariff_type_charge?.id)
        setTableTypeViewName(filteredData?.tariff_type_charge?.name)
        setViewDetailData(filteredData);
        setFormMode('view');
        setViewOpen(true)
    };

    const openEditForm = async (id: any) => {
        const filteredData = filteredDataTable.find((item: any) => item.id === id);
        const res_data_edit = await getService(`/master/tariff/tariffChargeReport/chargeView?id=${id}`);

        setFormMode('edit');
        setFormData(res_data_edit);
        setViewDetailData(filteredData);
        // setSelectedId(res_data_edit[0]?.id);
        setSelectedId(res_data_edit[0]?.tariff_charge_id ? res_data_edit[0]?.tariff_charge_id : res_data_edit[0]?.tariff_charge?.id);
        setFormOpen(true);
    };

    // #region EDIT SUBMIT
    const handleFormSubmit = async (data: any) => {
        switch (formMode) {
            case "create":

                break;
            case "edit":
                // let payload = {
                //     quantity_operator: String(parseInt(data?.quantity_operator, 10)),
                //     amount_operator: String(parseInt(data?.amount_operator, 10))
                // };

                // const res_edit = await patchService(`/master/tariff/tariffChargeReport/chargeEdit/${selectedId}`, payload);
                const res_edit = await patchService(`/master/tariff/tariffChargeReport/chargeEdit/${selectedId}`, data);
                const status = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
                const errorMsgPatch = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

                if ([400, 500].includes(status)) {
                    setFormOpen(false);
                    // setModalErrorMsg(res_edit?.response?.data?.error ? res_edit?.response?.data?.error : "Something went wrong.");
                    setModalErrorMsg(errorMsgPatch ? errorMsgPatch : "Something went wrong.");
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setTimeout(() => {
                        setModalSuccessMsg('Your changes have been saved.')
                        setModalSuccessOpen(true);
                    }, 300);
                }
                break;
        }

        await fetchData(0, 10);
        if (resetForm) resetForm();
    };

    // ############### COMMENT VIEW ###############
    const [mdReasonView, setMdReasonView] = useState(false);
    const [dataReason, setDataReason] = useState<any>([]);
    const [dataReasonRow, setDataReasonRow] = useState<any>([]);

    const openCommentModal = (id?: any, data?: any, row?: any) => {
        setDataReason(headData?.tariff_comment)
        setDataReasonRow(headData)
        setMdReasonView(true)
    };

    // #region FIELD SEARCH
    // ############### FIELD SEARCH ###############
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchTypeCharge, setSrchTypeCharge] = useState<any>([]);
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataTariffId, setDataTariffId] = useState<any>([]);

    const [dataAllEx, setdataAllEx] = useState<any>([])

    const handleFieldSearch = async () => {
        setIsLoading(true)
        let url = `/master/tariff/tariffChargeReport/chargeFindAll?id=${id}&limit=${itemsPerPage}&offset=0`
        url += srchContractCode?.length > 0 ? `&contractCode=[${srchContractCode}]` : `&contractCode=[]`
        if (watch('filter_comodity')) {
            url += `&comodity=${watch('filter_comodity')}`
        }

        const res_main_data = await getService(url);
        const result_2 = res_main_data?.data?.filter((item: any) => {
            return (
                // (srchShipperName?.length > 0 ? srchShipperName.includes(item?.shipper) : true) &&
                (srchTypeCharge?.length > 0 ? srchTypeCharge.includes(item?.tariff_type_charge?.id) : true)
                // (srchContractCode?.length > 0 ? srchContractCode.includes(item?.contract_code?.contract_code) : true)
                // (srchZone ? item?.zone_obj.id == srchZone : true) &&
            );
        });

        if (srchTypeCharge?.length > 0) {
            setDataTableTotal(result_2.length)
        } else {
            setDataTableTotal(res_main_data.total)
        }

        setDataTable(result_2)
        setFilteredDataTable(result_2)

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setTimeout(() => {
            setIsLoading(false)
        }, 500);


        // ----
        let url_ex = `/master/tariff/tariffChargeReport/chargeFindAll?id=${id}&limit=${1000}&offset=0`
        url_ex += srchContractCode?.length > 0 ? `&contractCode=[${srchContractCode}]` : `&contractCode=[]`
        if (watch('filter_comodity')) {
            url_ex += `&comodity=${watch('filter_comodity')}`
        }

        const res_main_data_ex = await getService(url_ex);
        const result_2_ex = res_main_data_ex?.data?.filter((item: any) => {
            return (
                (srchTypeCharge?.length > 0 ? srchTypeCharge.includes(item?.tariff_type_charge?.id) : true)
            );
        });
        const result_2_ex_ = result_2_ex?.map((e:any) => {
                const { amount, ...nE } = e

                const toNumber = (value: any) => {
                const num = Number(String(value ?? 0).replace(/,/g, '').trim())
                return Number.isNaN(num) ? 0 : num
                }

                const quantity = Math.round(toNumber(e?.quantity)) // ทศนิยม 0
                const fee = Number(toNumber(e?.fee).toFixed(3)) // ทศนิยม 3

                const amount๘ = quantity * fee
                return {
                    ...nE,
                    amount: amount๘
                }
            })
        setdataAllEx(result_2_ex_)
    };

    const handleReset = () => {
        setSrchContractCode([])
        setSrchTypeCharge([])
        setValue("filter_comodity", null)

        fetchData(0, itemsPerPage);

        // setKey((prevKey) => prevKey + 1);
        // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = dataTable?.filter(
            (item: any) => {
                return (
                    item?.tariff_type_charge?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.term_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.quantity_operator?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberTwoDecimalNom(item?.quantity_operator)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    roundNumber(item?.quantity_operator)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.quantity?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.quantity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.quantity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    roundNumber(item?.quantity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.unit?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    // item?.co_efficient?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // formatNumberThreeDecimal(item?.co_efficient)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    // formatNumberThreeDecimalNoComma(item?.co_efficient)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.fee?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberTwoDecimalNom(item?.fee)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.fee)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.amount?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberTwoDecimalNom(item?.amount)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.amount)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.amount_operator?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberTwoDecimalNom(item?.amount_operator)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.amount_operator)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.amount_compare?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberTwoDecimalNom(item?.amount_compare)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.amount_compare)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.difference?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.difference)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberThreeDecimalNoComma(item?.difference)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    const handleChangeComodity = (e: any, mode: any) => {
        switch (mode) {
            case 'contract':
                setValue("filter_comodity", 1)
                break;
            case 'shipper':
                setValue("filter_comodity", 2)
                break;
        }
    };

    // #region ON LOAD
    const fetchData = async (offset?: any, limit?: any) => {
        setIsLoading(true)
        try {

            // DATA TARIFF TYPE
            // tariff/tariffChargeReport/tariffChargeType
            const res_tariff_type = await getService(`/master/tariff/tariffChargeReport/tariffChargeType`);
            setDataTariffType(res_tariff_type)

            // กรณี shipper เข้ามาเห็นของตัวเอง
            // if (userDT?.account_manage?.[0]?.user_type_id == 3) {
            //     setSrchShipperName([userDT?.account_manage?.[0]?.group?.id_name])
            // }

            // DATA SHIPPER NAME
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)

            // DATA MAIN
            let url = `/master/tariff/tariffChargeReport/chargeFindAll?id=${id}&limit=${limit}&offset=${offset}`
            url += `&contractCode=[]` // ตอน fetch ใหม่ ไม่ต้องกรอง contract code

            if (watch('filter_comodity')) {
                url += `&comodity=${watch('filter_comodity')}`
            }
            const res_main_data = await getService(url);

            setDataTableTotal(res_main_data?.total)
            setDataTable(res_main_data?.data)
            setFilteredDataTable(res_main_data?.data)

            if (res_main_data?.data?.length > 0) {
                setHeadData(res_main_data?.data?.[0]?.tariff)

                checkIsShipperSendInv(res_main_data?.data?.[0]?.tariff?.month_year_charge, res_main_data?.data?.[0]?.tariff)
            }

            // DATA CONTRACT CODE
            const data_contract_code_de_dup = Array.from(
                new Map(
                    res_main_data?.data
                        ?.filter((item: any) => item?.contract_code) // กรอง null/undefined
                        .map((item: any) => [item?.contract_code.id, { contract_code: item?.contract_code }])
                ).values()
            );

            setDataContract(data_contract_code_de_dup);
            setDataContractOriginal(data_contract_code_de_dup)

            // DATA TARIFF ID
            const res_tariff_id = await getService(`/master/tariff/tariffChargeReport/tariffChargeReportFindId?month_year_charge=${dayjs(res_main_data?.data?.[0]?.tariff?.month_year_charge).format("YYYY-MM-DD")}&shipper_id=${headData?.shipper ? headData?.shipper?.id : ''}`);
            const filter_only_this_shipper = res_tariff_id?.filter((item: any) => item.shipper_id == headData?.shipper_id)
            setDataTariffId(filter_only_this_shipper)

            setTimeout(() => {
                setIsLoading(false);
                setIsLoadingCal(false)
            }, 200);

            // ----
            let url_ex = `/master/tariff/tariffChargeReport/chargeFindAll?id=${id}&limit=${1000}&offset=0`
            url_ex += srchContractCode?.length > 0 ? `&contractCode=[${srchContractCode}]` : `&contractCode=[]`
            if (watch('filter_comodity')) {
                url_ex += `&comodity=${watch('filter_comodity')}`
            }

            const res_main_data_ex = await getService(url_ex);

            if(!flagInit){
                setTempTotal(res_main_data_ex?.total || 10)
                setItemsPerPage(res_main_data_ex?.total || 10)
            }
            const result_2_ex = res_main_data_ex?.data?.filter((item: any) => {
                return (
                    (srchTypeCharge?.length > 0 ? srchTypeCharge.includes(item?.tariff_type_charge?.id) : true)
                );
            });
            const result_2_ex_ = result_2_ex?.map((e:any) => {
                const { amount, ...nE } = e

                const toNumber = (value: any) => {
                const num = Number(String(value ?? 0).replace(/,/g, '').trim())
                return Number.isNaN(num) ? 0 : num
                }

                const quantity = Math.round(toNumber(e?.quantity)) // ทศนิยม 0
                const fee = Number(toNumber(e?.fee).toFixed(3)) // ทศนิยม 3

                const amount๘ = quantity * fee
                return {
                    ...nE,
                    amount: amount๘
                }
            })
            setdataAllEx(result_2_ex_)
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // #region CAL BAC
    const handleCalBac = () => {
        setModalCalOpen(true)
    }

    const handleCalBacSubmit = async (data: any) => {
        // cal bac save data
        setIsLoadingCal(true)

        const res_patch = await patchService(`/master/tariff/tariffChargeReport/bacCalc/${data?.tariff_id}/${id}`, {});
        const status = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
        const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

        if ([400, 500].includes(status)) {
            setModalCalOpen(false);
            // setModalErrorMsg(res_patch?.response?.data?.error);
            setModalErrorMsg(errorMsgPatch || '');
            setModalErrorOpen(true)
        } else {
            setTimeout(() => {
                setModalCalOpen(false);
                setModalSuccessMsg('Tariff ID Compare has been confirmed.')
                setModalSuccessOpen(true);
            }, 200);
        }

        setTimeout(async () => {
            await fetchData(0, 10);
        }, 700);
        // if (resetForm) resetForm();
    };


    const checkIsShipperSendInv = async (month_year_charge: any, head_data: any) => {
        // Invoice Sent > กรณีที่เคย Sent Shipper Name นั้น Month/Year นั้นไปแล้ว ถ้าจะกด sent อีกรอบที่ข้อมูลเดียวกัน ระบบจะขึ้น Modal แจ้งสีเหลืองเป็นคำพูดแบบนี้ https://app.clickup.com/t/86euq7acj

        // 1. หาว่าใน shipper และเดือนนั้นมี .tariff_invoice_sent_id == 1 หรือเปล่า
        let url = `/master/tariff/tariffChargeReport/tariffChargeReportFindAll?limit=1000&offset=0`
        url += `&month_year_charge=${dayjs(month_year_charge).format("YYYY-MM-DD")}`

        const res_main_data = await getService(url);
        const result = res_main_data?.data
            // .filter((item: any) => item.tariff_invoice_sent?.id === 1)
            .filter((item: any) => item.tariff_invoice_sent?.id === 1 && item?.shipper?.id == head_data?.shipper?.id)
            .map((item: any) => ({
                name: item.shipper.name,
                month_year_charge: item.month_year_charge,
            }));

        if (result?.length > 0) {
            setIsShipperSentInv(true)
            setDataIsSentInv(result);
        } else {
            setIsShipperSentInv(false)
        }
    }

    // #region INVOICE SENT
    {/* Confirm Save */ }
    const handleInvoiceSent = (data?: any, type?: any) => {
        setDataSubmit(data)
        setModaConfirmSave(true)
    }

    const handleInvoiceSentSubmit = async () => {
        const res_patch = await patchService(`/master/tariff/tariffChargeReport/invoiceSent/${headData?.id}`, {});
        const status = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
        const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

        if ([400, 500].includes(status)) {
            setModalCalOpen(false);
            // setModalErrorMsg(res_patch?.response?.data?.error);
            setModalErrorMsg(errorMsgPatch || '');
            setModalErrorOpen(true)
        } else {
            setIsLoading(true)
            setModalCalOpen(false);
            setModalSuccessMsg('Invoice has been sent.')
            // setModalSuccessOpen(true);
            setTimeout(() => {
                setModalSuccessOpen(true);
            }, 200);
        }
        await fetchData(0, 10);
    }

    // #region COLUMN SHOW/HIDE
    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'type_charge', label: 'Type Charge', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'contract_type', label: 'Contract Type', visible: true },
        { key: 'quantity_operator', label: 'Quantity Operator', visible: true },
        { key: 'quantity', label: 'Quantity', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        // { key: 'co_efficient', label: 'Co-Efficient (%)', visible: true },
        { key: 'fee', label: 'Fee (Baht/MMBTU)', visible: true },
        { key: 'amount_baht', label: 'Amount (Baht)', visible: true },
        { key: 'amount_operator_baht', label: 'Amount Operator (Baht)', visible: true },
        { key: 'amount_compare_baht', label: 'Amount Compare (Baht)', visible: true },
        { key: 'difference', label: 'Difference', visible: true },
        { key: 'action', label: 'Action', visible: true },
    ];

    const filteredColumns = initialColumns?.filter((col: any) => {
        if ((col.key === 'type_charge' ||
            col.key === 'contract_code' ||
            col.key === 'contract_type' ||
            col.key === 'quantity_operator' ||
            col.key === 'quantity' ||
            col.key === 'unit' ||
            // col.key === 'co_efficient' ||
            col.key === 'fee' ||
            col.key === 'amount_baht' ||
            col.key === 'amount_operator_baht' ||
            col.key === 'action'
        ) && userDT?.account_manage?.[0]?.user_type_id === 3
        ) { // shipper ไม่เห็น amount_compare_baht กับ difference
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

    // #region PAGINATION
    // ############### PAGINATION ###############


    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if(flagInit){
            let newOffset = (currentPage - 1) * itemsPerPage;
            fetchData(newOffset, itemsPerPage);
        }
        setIsLoading(false)
    }, [currentPage, itemsPerPage]);

    useEffect(() => {
        if (filteredDataTable) {
            const filteredDataTable_ = filteredDataTable?.map((e:any) => {
                const { amount, ...nE } = e

                const toNumber = (value: any) => {
                const num = Number(String(value ?? 0).replace(/,/g, '').trim())
                return Number.isNaN(num) ? 0 : num
                }

                const quantity = Math.round(toNumber(e?.quantity)) // ทศนิยม 0
                const fee = Number(toNumber(e?.fee).toFixed(3)) // ทศนิยม 3

                const amount๘ = quantity * fee
                return {
                    ...nE,
                    amount: amount๘
                }
            })
            setPaginatedData(filteredDataTable_) // ที่ใช้ยังงี้เพราะของที่ได้มาจาก service มันทำ pagination อยู่แล้ว
            // quantity
            // fee

            // amount
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    const initApi = async () => {
       await fetchData(0, 10);
        setFlagInit(true)

    }

    useEffect(() => {
        getPermission();
        initApi()
    }, [id])


    const getTariffId = async () => {
        // DATA TARIFF ID
        // const res_tariff_id = await getService(`/master/tariff/tariffChargeReport/tariffChargeReportFindId`);
        const res_tariff_id = await getService(`/master/tariff/tariffChargeReport/tariffChargeReportFindId?month_year_charge=${dayjs(headData?.month_year_charge).format("YYYY-MM-DD")}&shipper_id=${headData?.shipper ? headData?.shipper?.id : ''}`);
        const filter_only_this_shipper = res_tariff_id?.filter((item: any) => item.shipper_id == headData?.shipper_id)
        const filter_only_not_in_head_data = filter_only_this_shipper?.filter((item: any) => item.tariff_id !== headData?.tariff_id)

        setDataTariffId(filter_only_not_in_head_data)
    }

    useEffect(() => {
        getTariffId();
    }, [headData])

    return (
        <div className="space-y-2">
            <div className="text-[#464255] px-4 text-[14px] font-bold pb-4">
                <div className="cursor-pointer" onClick={() => {
                    router.push("/en/authorization/tariff/TariffChargeReport");
                }}
                >
                    <ArrowBackIos style={{ fontSize: "14px" }} /> {` Back`}
                </div>
            </div>

            {/* 1 ข้อมูลด้านบน */}
            <div className="border-[#DFE4EA] border-[1px] h-[80px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 mb-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                    <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-10">
                        {/* Shipper Name */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Shipper Name`}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{headData?.shipper ? headData?.shipper?.name : ''}</p>
                        </div>

                        {/* Month/Year */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Month/Year`}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{headData?.month_year_charge ? dayjs(headData?.month_year_charge).format("MMMM YYYY") : ''}</p>
                            {/* <p className="!text-[14px] font-light text-[#757575]">{headData?.month_year_charge ? dayjs.utc(headData?.month_year_charge).format("MMMM YYYY") : ''}</p> */}

                        </div>

                        {/* Tariff ID */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Tariff ID`}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{headData?.tariff_id ? headData?.tariff_id : ''}</p>
                        </div>

                        {/* Tariff ID (Compare) */}
                        {/* ต้องมีขึ้นมาตอนที่มีการกด compare ถ้ายังไม่ compare ขึ้นเป็น - */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Tariff ID (Compare)`}</p>
                            {/* <p className="!text-[14px] font-light text-[#757575]">{'20241020-TAR-0001-A (00:00:20)'}</p> */}
                            <p className="!text-[14px] font-light text-[#757575]">{(Array.isArray(headData?.tariff_compare) && headData?.tariff_compare?.length > 0) ? headData.tariff_compare[0].compare_with?.tariff_id ?? '-' : '-'}</p>
                        </div>

                        {/* Invoice Sent  */}
                        <div className="flex flex-col">
                            <p className="!text-[14px] font-semibold text-[#58585A]">{`Invoice Sent `}</p>
                            <p className="!text-[14px] font-light text-[#757575]">{headData?.tariff_invoice_sent ? headData?.tariff_invoice_sent?.name : ''}</p>
                        </div>
                    </section>
                </aside>
            </div>


            {/* 2 filter และปุ่มต่าง ๆ */}
            <div className="border border-[#DFE4EA] p-4 rounded-xl flex flex-col lg:flex-row gap-4 mb-2 w-full">

                <aside className="flex flex-wrap gap-2 w-full lg:w-2/3">
                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select-multi-checkbox"
                        customWidth={180}
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        options={dataContract?.map((item: any) => ({
                            value: item?.contract_code?.id,
                            label: item?.contract_code?.contract_code
                        }))}
                    />

                    <InputSearch
                        id="searchTypeCharge"
                        label="Type Charge"
                        type="select-multi-checkbox"
                        customWidth={180}
                        value={srchTypeCharge}
                        onChange={(e) => setSrchTypeCharge(e.target.value)}
                        options={dataTariffType?.map((item: any) => ({
                            value: item.id,
                            label: item.name
                        }))}
                    />

                    <div className="w-auto relative flex items-center pl-1 pt-7">
                        <label className="mr-6 text-[#58585A] text-sm sm:text-base">
                            <input
                                type="radio"
                                {...register("filter_comodity", { required: false })}
                                value="1"
                                disabled={false}
                                checked={watch("filter_comodity") === 1 || watch("filter_comodity") === "1"}
                                onChange={(e) => { handleChangeComodity(e, 'contract') }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Commodity by contract`}
                        </label>

                        <label className="mr-6 text-[#58585A] text-sm sm:text-base">
                            <input
                                type="radio"
                                {...register("filter_comodity", { required: false })}
                                value="2"
                                disabled={false}
                                checked={watch("filter_comodity") === 2 || watch("filter_comodity") === "2"}
                                onChange={(e) => { handleChangeComodity(e, 'shipper') }}
                                className="mr-1 accent-[#1473A1]"
                            />
                            {`Commodity by shipper`}
                        </label>
                    </div>

                    <div className="flex gap-2 items-center pl-1">
                        <BtnSearch handleFieldSearch={handleFieldSearch} />
                        <BtnReset handleReset={handleReset} />
                    </div>
                </aside>

                <div className="action-panel flex flex-wrap gap-3 items-end justify-end w-full lg:w-1/3">

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 && <BtnGeneral
                            textRender={"BAC Calc"}
                            iconNoRender={true}
                            bgcolor={"#3582D5"}
                            generalFunc={() => handleCalBac()}
                            disable={false}
                            customWidthSpecific={120}
                            can_create={userPermission ? userPermission?.f_create : false}
                        />
                    }

                    <BtnGeneral
                        textRender={"Comment"}
                        iconNoRender={true}
                        bgcolor={"#00ADEF"}
                        generalFunc={() => openCommentModal()}
                        disable={false}
                        customWidthSpecific={120}
                        can_create={userPermission ? userPermission?.f_create : false}
                    />

                    {
                        userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                        <BtnGeneral
                            textRender={"Invoice Sent"}
                            iconNoRender={true}
                            bgcolor={"#556BB6"}
                            generalFunc={() => handleInvoiceSent()}
                            disable={headData?.tariff_invoice_sent?.name == "YES" ? true : false}
                            customWidthSpecific={120}
                            can_create={userPermission ? userPermission?.f_create : false}
                        />
                    }
                </div>
            </div>


            <div className={`${cardClass}`}>
                <div>
                    <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div className="flex items-center gap-2">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />

                            <BtnGeneral
                                bgcolor={"#24AB6A"}
                                modeIcon={'export'}
                                textRender={"Export"}
                                // generalFunc={() => underDevelopment()}
                                generalFunc={() => exportToExcel(dataAllEx, 'tariff-detail-page', columnVisibility, headData)}
                                can_export={userPermission ? userPermission?.f_export : false}
                            />
                        </div>
                    </div>
                </div>

                <TableTariffChargeReportInside
                    openEditForm={openEditForm}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    // isLoading={false}
                    columnVisibility={columnVisibility}
                    initialColumns={filteredColumns}
                    setisLoading={setIsLoading}
                    userPermission={userPermission}
                    userDT={userDT}
                    openViewForm={openViewForm}
                />
            </div>

            <PaginationComponent 
                // totalItems={filteredDataTable?.length}
                totalItems={dataTableTotal}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                tempTotal={tempTotal}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                dataShipperGroup={[]}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                    // handleFieldSearch(); // comment แล้ว fetch ใหม่
                }}
            />

            <ModalComponent
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        // setIsLoading(true);
                        setTimeout(async () => {
                            // await onSubmit(dataSubmit);
                            handleInvoiceSentSubmit()
                        }, 300);
                    }
                    // if (resetForm) resetForm();
                }}
                title={`Confirm Invoice Submission`}
                description={
                    <div>
                        <div className="text-center">
                            {
                                isShipperSentInv ? <>
                                    {`Tariff For ${dataIsSentInv[0]?.name} Month/Year ${dayjs(dataIsSentInv[0]?.month_year_charge).format("MMMM YYYY")} is already send, Please Confirm to send new Tariff ID.`}
                                </>
                                    : <>
                                        {`Are you sure you want to send the invoice for this Tariff ID ?`}
                                    </>
                            }

                        </div>
                    </div>
                }
                // menuMode="daily-adjust"
                btnmode="split"
                btnsplit1="Confirm"
                btnsplit2="Cancel"
                stat="confirm"
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setTimeout(() => {
                            resetForm();
                            setFormData({})
                        }, 200);
                    }
                }}
                onSubmit={handleFormSubmit}
                setResetForm={setResetForm}
                headData={headData}
                viewDetailData={viewDetailData}
            />

            <ModalView
                open={viewOpen}
                // tableType={tableType}
                // data={viewDetailOpen}
                data={viewTableData}
                dataShipper={dataShipper}
                handleClose={() => {
                    setViewOpen(false);
                    // if (resetForm) resetForm();
                }}
                headData={headData}
                viewDetailData={viewDetailData}
                tableType={tableTypeView}
                tableTypeViewName={tableTypeViewName}
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

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Your changes have been saved."
                description={modalSuccessMsg}
            />

            <ModalCalBac
                data={formData}
                open={modalCalOpen}
                isLoading={isLoadingCal}
                dataTariffId={dataTariffId}
                onClose={() => {
                    setModalCalOpen(false);
                    // if (resetForm) {
                    //     setTimeout(() => {
                    //         resetForm();
                    //         setFormData({})
                    //     }, 200);
                    // }
                }}
                onSubmit={handleCalBacSubmit}
                setResetForm={setResetForm}
                headData={headData}
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
        </div>

    );
}

export default DocumentPage;