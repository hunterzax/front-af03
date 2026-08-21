"use client";
import "@/app/globals.css";
import TuneIcon from "@mui/icons-material/Tune";
import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, patchService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalSubmissionDetails from "./form/modalSubmissionDetail";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ModalAddDocument from "./form/modalAddDoc";
import TableReleaseCapMgn from "./form/table";
import ModalReason from "./form/modalReason";
import ModalUpdateStat from "./form/modalUpdateStat";
import { findRoleConfigByMenuName, formatDate, formatTime, generateUserPermission } from "@/utils/generalFormatter";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import { useSearchParams } from "next/navigation";
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

    const searchParams = useSearchParams();
    const status_from_somewhere_else = searchParams.get("status");
    const [useParams, setuseParams] = useState<boolean>(false);

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
            //     const permission = findRoleConfigByMenuName('Release Capacity Management', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Release Capacity Management', userDT)
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
    const { shipperGroupData } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, forceRefetch]);

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [srchShipper, setSrchShipper] = useState<any>([]);
    const [srchContractCode, setSrchContractCode] = useState<any>([]);
    const [srchStatus, setSrchStatus] = useState<any>([]);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const [dataPost, setDataPost] = useState<any>([]);

    const handleFieldSearch = async () => {
        const result = dataTable && dataTable?.filter((item: any) => {
            return (
                // (srchShipper ? item?.group_id == srchShipper : true) &&
                // (srchStatus ? item?.release_capacity_status_id.toString() == srchStatus : true) &&
                // (srchContractCode ? item?.contract_code_id && item?.contract_code_id.toString() == srchContractCode : true)

                // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
                (srchShipper?.length > 0 ? srchShipper.includes(item?.group_id) : true) &&
                (srchStatus?.length > 0 ? srchStatus.includes(item?.release_capacity_status_id.toString()) : true) &&
                (srchContractCode?.length > 0 && item?.contract_code_id ? srchContractCode.includes(item?.contract_code_id.toString()) : true)
            );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก

        setFilteredDataTable(result);
    };

    const handleReset = () => {
        setFilteredDataTable([]);

        setSrchContractCode([])
        setSrchShipper([])
        setSrchStatus([])

        setSrchStartDate(null);
        setSrchEndDate(null);
        setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataTable.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

                return (
                    formatDate(item?.submission_time)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatTime(item?.submission_time)?.toLowerCase().includes(queryLower) ||
                    item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.release_capacity_status?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.requested_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(filtered);
    };

    // ############### DATA TABLE ###############
    const [userData, setUserData] = useState<any>([]);
    const [dataTable, setData] = useState<any>([]);
    const [statCapMgn, setStatCapMgn] = useState<any>([]);
    const [dataContract, setDataContract] = useState<any>([]);
    const [isAllTotalZero, setIsAllTotalZero] = useState<any>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {
            setIsLoading(true);

            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
            }

            const response: any = await getService(`/master/release-capacity-management`);
            let filter_only_shipper = response?.filter((item: any) =>
                userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group_id === userDT?.account_manage?.[0]?.group?.id : true
            )
            const res_stat = await getService(`/master/release-capacity-management/status`);
            const res_contract_code = await getService(`/master/release-capacity-submission/contract-code`);
            setDataContract(res_contract_code);
            setStatCapMgn(res_stat)
            setData(filter_only_shipper);

            //#region LOAD DATA & FILTER
            if (status_from_somewhere_else && !useParams) {
                const status: any = status_from_somewhere_else;
                const findStatusMaster: any = res_stat?.find((item: any) => item?.name == status)?.id;

                setSrchStatus(findStatusMaster?.toString());
                const result_2 = response?.filter((item: any) => {
                    return (
                        (status ? item?.release_capacity_status_id.toString() == findStatusMaster : true)
                    );
                });

                setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
                setFilteredDataTable(result_2);
                setuseParams(true);
            } else {
                setFilteredDataTable(filter_only_shipper);
            }

            setTimeout(() => {
                setIsLoading(false);
            }, 300);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        getPermission();
        setUserData(userDT?.account_manage?.[0]);
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
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

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    const paginatedData = Array.isArray(filteredDataTable)
        ? filteredDataTable.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        )
        : [];

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'submission_time', label: 'Submission Time', visible: true },
        { key: 'group', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'detail', label: 'Detail', visible: true },
        { key: 'status', label: 'Status', visible: true },
        { key: 'reason', label: 'Reason', visible: true },
        { key: 'file', label: 'File', visible: true },
        { key: 'req_code', label: 'Requested Code', visible: true },
        { key: 'action', label: 'Action', visible: userData?.user_type_id == 3 ? false : true } // shipper ไม่เห็น action
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // List > เฉพาะ Shipper จะไม่เห็น Column action https://app.clickup.com/t/86ereurmq
    const adjustedColumns = userData?.user_type_id == 3 ? initialColumns.filter((column: any) => !['action'].includes(column.key)) : initialColumns;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        // Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
        Object.fromEntries(adjustedColumns.map((column: any) => [column.key, column.visible]))
    );

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(adjustedColumns.map((column: any) => [column.key, column.visible])))
    }, [userData])

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
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

    // ############### MODAL FILE ###############
    const [mdAddDoc, setMdAddDoc] = useState<any>(false);
    const [dataFile, setDataFile] = useState<any>([]);

    const openAddDocModal = (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataFile(filtered)
        setMdAddDoc(true)
    };

    // ############### MODAL UPDATE STAT ###############
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [modeUpdateStat, setModeUpdateStat] = useState<any>('');
    const [mdUpdateStat, setMdUpdateStat] = useState(false);

    const openUpdateStatModal = (id?: any, data?: any) => {
        const filtered = dataTable?.find((item: any) => item.id === id);
        setDataFile(filtered)
        setMdUpdateStat(true)
    };

    const handleSubmitAcceptReject = async (data: any) => {
        setIsLoading(true);
        // submit = 1, approve = 2, reject = 3
        let stat = modeUpdateStat == 'approve' ? 2 : 3
        setModalSuccessMsg(modeUpdateStat == 'approve' ? 'Your Capacity has been approved.' : 'Your Capacity has been rejected.')
        let data_patch = {
            "status": stat,
            "reasons": data?.reason
        }
        setMdUpdateStat(false);

        const res_patch = await patchService(`/master/release-capacity-management/status/${data?.id}`, data_patch)
        const statusCodePatch = res_patch?.response?.data?.statusCode ?? res_patch?.response?.data?.status ?? res_patch?.status ?? res_patch?.statusCode ?? res_patch?.code ?? res_patch?.response?.status;
        const errorMsgPatch = res_patch?.response?.data?.error ?? res_patch?.data?.error ?? res_patch?.response?.error ?? res_patch?.error;

        if (statusCodePatch === 400 || statusCodePatch == 500) {
            // setModalErrorMsg(res_patch?.response?.data?.error ? res_patch?.response?.data?.error : 'Release Value Alert: The Release value must not exceed the Contract value.');
            setModalErrorMsg(errorMsgPatch ? errorMsgPatch : 'Something went wrong.');
            setModalErrorOpen(true)
        } else {
            setModalSuccessOpen(true);
        }

        if (resetForm) resetForm();
        await fetchData();

        setTimeout(async () => {
            setIsLoading(false);
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
                        onChange={(e) => setSrchShipper(e.target.value)}
                        // options={shipperGroupData?.data?.map((item: any) => ({
                        //     value: item.id,
                        //     label: item.name
                        // }))}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        options={shipperGroupData?.data
                            ?.filter((item: any) => userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true)
                            .map((item: any) => ({
                                value: item.id,
                                label: item.name,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchContractCode"
                        label="Contract Code"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchContractCode}
                        onChange={(e) => setSrchContractCode(e.target.value)}
                        // options={dataContract?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item?.contract_code
                        // }))}
                        // options={dataContract
                        //     ?.filter((item: any) => {
                        //         return (
                        //             userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true &&
                        //                 srchShipper ? item?.group?.id == srchShipper : true &&
                        //             item?.term_type_id !== 4 // v1.0.90 ใน contract code filter ไม่ควรมี non-firm https://app.clickup.com/t/86erqt8g8
                        //         )
                        //     }
                        //     )
                        //     .map((item: any) => ({
                        //         value: item?.id?.toString(),
                        //         label: item?.contract_code,
                        //     }))
                        // }
                        options={dataContract
                            ?.filter((item: any) => {
                                return (
                                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.group?.id === userDT?.account_manage?.[0]?.group?.id : true &&
                                        srchShipper?.length > 0 ? srchShipper.includes(item?.group?.id) : true &&
                                    item?.term_type_id !== 4 // v1.0.90 ใน contract code filter ไม่ควรมี non-firm https://app.clickup.com/t/86erqt8g8
                                )
                            }
                            )
                            .map((item: any) => ({
                                value: item?.id?.toString(),
                                label: item?.contract_code,
                            }))
                        }
                    />

                    <InputSearch
                        id="searchStatus"
                        label="Status"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchStatus}
                        onChange={(e) => setSrchStatus(e.target.value)}
                        options={statCapMgn?.map((item: any) => ({
                            value: item?.id?.toString(),
                            label: item.name
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>

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
                            {/* <BtnGeneral bgcolor={"#24AB6A"} modeIcon={'export'} textRender={"Export"} generalFunc={() => exportToExcel(paginatedData, "capa_contract_mgn")} can_export={userPermission ? userPermission?.f_export : false} /> */}
                            <BtnExport textRender={"Export"} data={filteredDataTable} path="capacity/release-capacity-management" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
                        </div>
                    </div>
                </div>

                <TableReleaseCapMgn
                    setIsAllTotalZero={setIsAllTotalZero}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    setModeUpdateStat={setModeUpdateStat}
                    setMdUpdateStat={setMdUpdateStat}
                    openReasonModal={openReasonModal}
                    openAddDocModal={openAddDocModal}
                    openUpdateStatModal={openUpdateStatModal}
                    openSubmissionModal={openSubmissionModal}
                    setDataPost={setDataPost}
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

            <ModalSubmissionDetails
                data={dataSubmission}
                // file={dataFileArr}
                // mainData={dataDetail}
                open={mdSubmissionView}
                onClose={() => {
                    setMdSubmissionView(false);
                }}
                userPermission={userPermission}
            />

            <ModalAddDocument
                open={mdAddDoc}
                onClose={() => {
                    setMdAddDoc(false);
                }}
                data={dataFile}
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
                description={
                    <div>
                        <div className="text-center">
                            {`${modalSuccessMsg}`}
                        </div>
                    </div>
                }
            />

            <ModalReason
                data={dataReason}
                dataRow={dataReasonRow}
                open={mdReasonView}
                onClose={() => {
                    setMdReasonView(false);
                }}
            />

            <ModalUpdateStat
                data={dataFile}
                mode={modeUpdateStat}
                open={mdUpdateStat}
                onClose={() => {
                    setMdUpdateStat(false);
                }}
                // onSubmitUpdate={() => handleSubmitAcceptReject('xxx', modeUpdateStat)}
                onSubmit={handleSubmitAcceptReject}
            />

            <ColumnVisibilityPopover
                open={open}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={userDT?.account_manage?.[0]?.user_type_id == 3 ? initialColumns?.filter((item: any) => item?.key !== 'action') : initialColumns}
            // initialColumns={initialColumns}
            />
        </div>
    );
};

export default ClientPage;