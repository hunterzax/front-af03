"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { fillMissingUpdateByAccount, filterShipperGroupData, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService, uploadFileServiceWithAuth2, uploadFileServiceWithAuth2UploadTemplateForShipper } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import ModalFiles from "./form/modalFiles";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import TableNomUploadTemplateForShipper from "./form/table";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import ModalComment from "./form/modalComment";
import BtnAddNew from "@/components/other/btnAddNew";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";

interface ClientProps {
    params: {
        lng: string;
    };
}

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
            //     const permission = findRoleConfigByMenuName('Upload template for shipper', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName(`Upload template for shipper`, userDT)
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
        getPermission()
    }, [])

    // ############### REDUX DATA ###############
    const { nominationTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();

    useEffect(() => {

        if (forceRefetch || !nominationTypeMaster?.data) {
            dispatch(fetchNominationType());
        }

        // Reset forceRefetch after fetching
        if (forceRefetch) {
            setForceRefetch(false); // Reset the flag after triggering the fetch
        }
        getPermission();
    }, [dispatch, forceRefetch, nominationTypeMaster]); // Watch for forceRefetch changes

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [key, setKey] = useState(0);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchTypeDocument, setSrchTypeDocument] = useState<any>([]);

    const handleFieldSearch = () => {
        let _data: any = dataTable
        const result_2 = _data.filter((item: any) => {
            const contractId = item?.contract_code?.id?.toString();
            const groupId = item?.group?.id?.toString(); // Convert group ID to string
            return (
                (!srchContractCode.length || srchContractCode.includes(contractId)) && // Check contract ID if list isn't empty
                (!srchShipper.length || srchShipper.includes(groupId)) && // Check group ID if list isn't empty
                // (srchTypeDocument ? item?.nomination_type?.name == srchTypeDocument : true)

                // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                (srchTypeDocument?.length > 0 ? srchTypeDocument.includes(item?.nomination_type?.name) : true)
            );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_2);
    };

    const handleReset = async () => {
        setSrchShipper([]);
        setSrchTypeDocument([]);
        setSrchContractCode([]);
        setDataContract(dataContractOriginal)
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {

        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                return (
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.nomination_type?.document_type?.replace(/\s+/g, '')?.toLowerCase().trim().includes(queryLower) ||

                    formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    formatTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatDateNoTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||

                    formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
                    formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||


                    // item?.maximum_capacity?.toString().toLowerCase().includes(queryLower) ||
                    (item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                    (item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
                    (item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [dataContractOriginal, setDataContractOriginal] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);

    const fetchData = async () => {
        try {

            const res_shipper_approve = await getService(`/master/upload-template-for-shipper/shipper-contract-approved`);
            let filter_shipper = filterShipperGroupData(res_shipper_approve)
            setDataShipper(filter_shipper);

            const response: any = await getService(`/master/upload-template-for-shipper`);

            // DATA CONTRACT CODE
            const data_contract_code_de_dup = Array.from(
                new Map(
                    response?.map((item: any) => [item?.contract_code?.id, item?.contract_code])
                ).values()
            )
            let filter_contract_code = data_contract_code_de_dup?.filter((itemx: any) => itemx !== null);
            setDataContract(filter_contract_code);
            setDataContractOriginal(filter_contract_code)


            // List : Shipper เข้ามาแล้วต้องเห็นเฉพาะ Template ของตัวเอง https://app.clickup.com/t/86erwav1k
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                let filter_only_shipper_or_not: any = response?.filter((item: any) => {
                    return item?.group_id === userDT?.account_manage?.[0]?.group_id
                })
                setData(filter_only_shipper_or_not);
                setFilteredDataTable(filter_only_shipper_or_not);
            } else {
                setData(response);
                setFilteredDataTable(response);
            }
            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resetForm]);

    // ############# RE-GENERATE  #############
    const [dataRegen, setDataReGen] = useState<any>([]);
    const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>();
    const [formData, setFormData] = useState<any>([]);

    const handleFormSubmit = async (data: any) => {

        const url = '/master/upload-template-for-shipper/create';
        const urlEdit = `/master/upload-template-for-shipper/edit/${selectedId}`;
        // const urlEdit = `/master/upload-template-for-shipper/edit`;
        const dynamicFields = {
            shipper_id: data?.shipper_id,
            contract_code_id: data?.contract_code_id,
            nomination_type_id: data?.document_type,
            comment: data?.comment ? data?.comment : null,
        };

        switch (formMode) {
            case "create":
                // const res_create = await postService('/master/asset/nomination-point-create', data);
                let res_create = await uploadFileServiceWithAuth2(url, data?.file_upload, dynamicFields);
                if (res_create?.response?.data?.status === 400) {
                    setFormOpen(false);
                    setModalErrorMsg(res_create?.response?.data?.error);
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Template has been added.')
                    setModalSuccessOpen(true);
                }
                break;
            case "edit":
                // ORIGINAL
                // let res_edit = await uploadFileServiceWithAuth2(url, data?.file_upload, dynamicFields); // edit ให้ใช้เส้น upload เหมือนกัน by bank
                // if (res_edit?.response?.data?.status === 400) {
                //     setFormOpen(false);
                //     setModalErrorMsg(res_edit?.response?.data?.error);
                //     setModalErrorOpen(true)
                // } else {
                //     setFormOpen(false);
                //     setModalSuccessMsg('Your changes have been saved.')
                //     setModalSuccessOpen(true);
                // }

                if (data?.file_upload) {
                    let res_edit = await uploadFileServiceWithAuth2(urlEdit, data?.file_upload, dynamicFields); // edit ให้ใช้เส้น upload เหมือนกัน by bank
                    if (res_edit?.response?.data?.status === 400) {
                        setFormOpen(false);
                        setModalErrorMsg(res_edit?.response?.data?.error);
                        setModalErrorOpen(true)
                    } else {
                        setFormOpen(false);
                        setModalSuccessMsg('Your changes have been saved.')
                        setModalSuccessOpen(true);
                    }
                } else {
                    let res_edit = await uploadFileServiceWithAuth2UploadTemplateForShipper(urlEdit, null, dynamicFields); // edit ให้ใช้เส้น upload เหมือนกัน by bank
                    if (res_edit?.response?.data?.status === 400) {
                        setFormOpen(false);
                        setModalErrorMsg(res_edit?.response?.data?.error);
                        setModalErrorOpen(true)
                    } else {
                        setFormOpen(false);
                        setModalSuccessMsg('Your changes have been saved.')
                        setModalSuccessOpen(true);
                    }
                }

                break;
        }
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData([]);
        setFormOpen(true);
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
            const response: any = await getService(`/master/account-manage/history?type=upload-template-for-shipper&method=all&id_value=${id}`);

            let valuesArray = response.map((item: any) => item.value);
            // ปั้น data ลบคีย์
            let cleanedData: any = []
            if (valuesArray && valuesArray.length > 0) {
                cleanedData = valuesArray?.map(({ create_date, create_by, create_by_account, create_date_num, ...rest }: any) => rest);
            }

            let mappings = [
                // { key: "entry_exit.name", title: "Entry/Exit" },
                { key: "group.name", title: "Shipper Name" },
                { key: "contract_code.contract_code", title: "Contract Code" },
                // { key: "description", title: "Description" },
            ];
            let result = mappings.map(({ key, title }) => {
                const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
                return {
                    title,
                    value: value || "",
                };
            });

            const map = new Map<number, any>();
            for (const r of cleanedData) {
                const prev = map.get(r.id);
                if (!prev || (r.update_date_num ?? -Infinity) > (prev.update_date_num ?? -Infinity)) {
                    map.set(r.id, r);
                }
            }

            const normalized = fillMissingUpdateByAccount(valuesArray);

            // ทำไว้ทำไมหว่า
            const dedupLatest = Array.from(map.values());

            setHeadData(result)
            // setHistoryData(valuesArray);
            // setHistoryData(cleanedData);
            // setHistoryData(dedupLatest);
            setHistoryData(normalized);
            setHistoryOpen(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    }

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

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    // const paginatedData = Array.isArray(filteredDataTable)
    // ? filteredDataTable.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    // )
    // : [];

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
        }
    }, [filteredDataTable, currentPage, itemsPerPage])


    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'document_type', label: 'Document Type', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'created_by', label: 'Created by', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
        { key: 'action', label: 'Action', visible: true }
    ];

    const initialColumnsHistory: any = [
        { key: 'document_type', label: 'Document Type', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'comment', label: 'Comment', visible: true },
        { key: 'updated_by', label: 'Updated by', visible: true },
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

    const findContractCode = (id?: any, data?: any) => {
        const kkkkk = Array.from(
            new Map(
                dataTable?.map((item: any) => [item?.contract_code.id, item?.contract_code])
            ).values()
        );

        const filteredContract2 = kkkkk?.filter((contract: any) =>
            id.includes(contract?.group_id?.toString())
        );

        // เก่า
        // const filteredDataShipper = data.filter((shipper: any) => id.includes(String(shipper.id)));
        // const filteredContract = kkkkk?.filter((contract: any) =>
        //     filteredDataShipper?.some((shipper: any) =>
        //         shipper?.contract_code?.some((filtered: any) => filtered.id === contract.id)
        //     )
        // );

        setDataContract(filteredContract2);
    }

    const reGenerate = async (id?: any) => {
        setIsLoading(false);
        let id_map = id.map((item: any) => item.id);
        let body_regen = {
            id: id_map
        }
        // Template for shipper has been Re-Generated

        try {
            const res_re_gen = await postService('/master/upload-template-for-shipper/regenerate', body_regen);
            const statusCode = res_re_gen?.response?.data?.statusCode ?? res_re_gen?.response?.data?.status ?? res_re_gen?.status ?? res_re_gen?.statusCode ?? res_re_gen?.code ?? res_re_gen?.response?.status;
            const errorMsg = res_re_gen?.response?.data?.error ?? res_re_gen?.data?.error ?? res_re_gen?.response?.error ?? res_re_gen?.error;

            if (statusCode === 400 || statusCode === 500) {
                setFormOpen(false);
                setModalErrorMsg(errorMsg || '');
                setModalErrorOpen(true)
            } else {
                fetchData();
                setTimeout(() => {
                    setFormOpen(false);
                    setModalSuccessMsg('Template for shipper has been Re-Generated')
                    setModalSuccessOpen(true);
                    setSelectedRoles([]) // clear ที่ select re-gen
                }, 1000);

            }
        } catch (error) {
            // error
        }

        setTimeout(() => {
            setIsLoading(true);
        }, 300);
    }

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchShipper}
                        onChange={(e) => {
                            setSrchShipper(e.target.value)
                            findContractCode(e.target.value, dataShipper)
                        }}
                        options={dataShipper
                            ?.filter((item: any) =>
                                userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true // ถ้าเป็น shipper เอาแค่ของตัวเอง
                            )
                            .map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item.name,
                            }))
                        }
                    />

                    {/* <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        type="select"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        options={dataContract?.filter((item: any) => srchShipper ? item.group_id === srchShipper : true)
                            .map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item?.contract_code
                            }))
                        }
                    /> */}

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        value={srchContractCode}
                        type="select-multi-checkbox"
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // options={
                        //     dataContractOriginal
                        //         ?.filter((item: any) => srchShipper?.length > 0 ? srchShipper.includes(item?.group?.id?.toString()) : true)
                        //         .map((item: any) => ({
                        //             value: item?.id?.toString(),
                        //             label: item?.contract_code
                        //         }))
                        // }
                        options={
                            dataContract?.map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item?.contract_code
                            }))
                        }
                    />

                    <InputSearch
                        id="searchTypeDocument"
                        label="Document Type"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchTypeDocument}
                        onChange={(e) => setSrchTypeDocument(e.target.value)}
                        options={nominationTypeMaster?.data?.map((item: any) => ({
                            value: item.name,
                            label: item.document_type
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        <BtnAddNew openCreateForm={openCreateForm} textRender={"New"} can_create={userPermission ? userPermission?.f_create : false} />
                    </div>
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

                        {/* Shipper ไม่ต้องเห็นปุ่ม Re-Gen https://app.clickup.com/t/86erxdywx */}
                        {
                            userDT?.account_manage?.[0]?.user_type_id !== 3 && <BtnGeneral
                                bgcolor={"#2F56BA"}
                                modeIcon={'re-generate'}
                                textRender={"Re-Generate"}
                                generalFunc={() => reGenerate(selectedRoles)}
                                can_create={userPermission ? userPermission?.f_create : false}
                                disable={selectedRoles?.length > 0 ? false : true}
                            />
                        }

                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                        <SearchInput onSearch={handleSearch} />
                        <BtnExport
                            textRender={"Export"}
                            data={filteredDataTable}
                            path="nomination/upload-template-for-shipper"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                        />
                    </div>
                </div>

                <TableNomUploadTemplateForShipper
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    openHistoryForm={openHistoryForm}
                    openAllFileModal={openAllFileModal}
                    openReasonModal={openReasonModal}
                    setDataReGen={setDataReGen}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    userPermission={userPermission}
                />
            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                dataTable={dataTable}
                dataShipper={dataShipper}
                // dataContractOriginal={dataContractOriginal}
                dataContractOriginal={dataContract}
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
                description={
                    <div>
                        <div className="text-center">
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalHistory
                open={historyOpen}
                handleClose={handleCloseHistoryModal}
                tableType="nom-upload-template-for-shipper"
                title="History"
                data={historyData}
                head_data={headData}
                initialColumns={initialColumnsHistory}
                userPermission={userPermission}
            />

            <ModalComment
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

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
        </div>
    );
};

export default ClientPage;