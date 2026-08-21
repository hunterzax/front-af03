"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { findRoleConfigByMenuName, formatNumberThreeDecimal, generateUserPermission, removeComma } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import getUserValue from "@/utils/getuserValue";
import ModalComponent from "@/components/other/ResponseModal";
import { decryptData } from "@/utils/encryptionData";
import TableNomParkingAllocation from "./form/table";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from "dayjs";

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
            //     const permission = findRoleConfigByMenuName('Parking Allocation', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Parking Allocation', userDT)
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

    // ############### General ###############
    const addSumsToMockTableData = (dataArray: any[]) => {
        return dataArray.map(group => {
            let sumPark = 0;
            let sumUnpark = 0;
            let sumParkAllocate = 0;

            group.data?.forEach((entry: any) => {
                // 1. Sum Park values
                entry.data?.forEach((d: any) => {
                    const value = parseFloat((d?.value || "0").replace(/,/g, ""));
                    if (d.type === "Park") sumPark += value;
                    if (d.type === "Unpark") sumUnpark += value;
                });

                // 3. Sum parkAllocatedMMBTUD
                if (entry.parkAllocatedMMBTUD != null) {
                    const val = parseFloat(String(entry.parkAllocatedMMBTUD).replace(/,/g, ""));
                    if (!isNaN(val)) sumParkAllocate += val;
                }
            });

            return {
                ...group,
                sumPark,
                sumUnpark,
                sumParkAllocate,
            };
        }).sort((a: any, b: any) => {
            // Convert zone values to strings and use localeCompare for proper string comparison
            const zoneA = String(a.zone).toLowerCase();
            const zoneB = String(b.zone).toLowerCase();
            return zoneA.localeCompare(zoneB)
        });
    };


    // ############### REDUX DATA ###############
    const { zoneMaster, nominationTypeMaster } = useFetchMasters();
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
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [srchZone, setSrchZone] = useState<any>([]);

    const handleFieldSearch = async () => {

        try {
            setIsLoading(false);
            const today = dayjs().format('YYYY-MM-DD'); // Format today as 2025-04-10
            const searchDate = srchStartDate ? dayjs(srchStartDate).tz("Asia/Bangkok").format("YYYY-MM-DD") : today;
            // master/parking-allocation?gas_day=2025-02-20
            const response: any = await getService(`/master/parking-allocation?gas_day=${searchDate}`);
            let data_filter = response

            // ถ้า user เป็น shipper
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                data_filter = filterOnlyShipper(response, userDT?.account_manage?.[0]?.group?.id)
            }

            const result_2 = data_filter?.filter((item: any) => {
                return (
                    // (srchZone ? item?.prop?.zone?.id == srchZone : true) &&
                    // (srchArea ? item?.prop?.area?.id.toString() == srchArea : true) &&
                    // (srchMeteredPointId ? item?.id?.toString() == srchMeteredPointId : true)
                    // srchShipper.includes(area.group.id)

                    // (srchZone ? srchZone == item?.zone : true)

                    // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
                    (srchZone?.length > 0 ? srchZone.includes(item?.zone) : true)
                );
            });

            const updatedData = addSumsToMockTableData(result_2);
            setData(updatedData);
            setFilteredDataTable(updatedData);
            // setData(result_2);
            // setFilteredDataTable(result_2);

        }
        catch (err) {
            // handleFieldSearch error
        }
        setIsLoading(true);

        // let _data: any = dataTable
        // const result_2 = _data.filter((item: any) => {

        //     const searchDate = dayjs(srchStartDate).tz("Asia/Bangkok").format("YYYY-MM-DD");
        //     const gasDay = dayjs(item?.gas_day).tz("Asia/Bangkok").format("YYYY-MM-DD");

        //     return (
        //         (srchStartDate ? searchDate == gasDay : true) &&
        //         (srchZone ? item?.zone?.id == srchZone : true)
        //     );
        // });

        // setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        // setFilteredDataTable(result_2);
    };

    const handleReset = async () => {
        // setSrchStartDate(null)
        const tomorrow = dayjs().tz("Asia/Bangkok").add(1, "day").format("YYYY-MM-DD")
        setSrchStartDate(new Date(tomorrow))
        setSrchZone([])
        fetchData();

        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.replace(/\s+/g, '').toLowerCase().trim();

        const filtered = dataTable
            .map((item: any) => {
                // First, check top-level match
                const topLevelMatch =
                    // item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    item?.sumUnpark?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    item?.sumPark?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    item?.sumParkAllocate?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    item?.parkDefault?.value?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.sumUnpark)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.sumPark)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.sumParkAllocate)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    formatNumberThreeDecimal(item?.parkDefault?.value)?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                    item?.zoneObj?.name?.replace(/\s+/g, '').toLowerCase().includes(queryLower);

                // Then, deep filter each entry in item.data
                const filteredInnerData = item.data
                    .map((entry: any) => {
                        const secondLevelMatch = entry?.nomination_code?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                            entry?.EODPark?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                            entry?.parkAllocatedMMBTUD?.toString().replace(/\s+/g, '').toLowerCase().includes(queryLower)

                        const matchedSubData = entry.data?.filter((d: any) =>
                            d.group?.name?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                            d.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                            d.reserve_balancing_gas_contract?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                            d.version?.version?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
                            d.value?.replace(/\s+/g, '').toLowerCase().includes(queryLower) || // unpark nominations
                            removeComma(d.value)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) // unpark nominations
                        );

                        if (secondLevelMatch) {
                            return entry; // keep entire entry if nomination_code matches
                        }

                        if (matchedSubData && matchedSubData.length > 0) {
                            return { ...entry, data: matchedSubData };
                        }

                        return null;
                    })
                    .filter(Boolean); // Remove null entries

                if (topLevelMatch || filteredInnerData.length > 0) {
                    return {
                        ...item,
                        data: filteredInnerData.length > 0 ? filteredInnerData : item.data, // keep original data if top-level matched
                    };
                }

                return null;
            })
            .filter(Boolean); // Remove null items

        setFilteredDataTable(filtered);
    };


    // กรอง data_mock_park_[xx].data[xx].data[xx].group.id ที่ตรงกับ userDT?.account_manage?.[0]?.group?.id
    // ถ้า data ชั้นไหนเป็นว่างหมด เอาออกไปทั้ง object เลย
    const filterOnlyShipper = (data_: any, group_id: any) => {

        const filtered_data_mock_park_ = (data_ ?? [])
            .map((zoneItem: any) => {
                const filteredMainData = (zoneItem?.data ?? [])
                    .map((mainItem: any) => {
                        const filteredInnerData = (mainItem?.data ?? []).filter(
                            (innerItem: any) => innerItem?.group?.id == group_id
                        );

                        if (filteredInnerData.length === 0) return null;

                        return {
                            ...mainItem,
                            data: filteredInnerData,
                        };
                    })
                    .filter(Boolean);

                const filteredDataParkD1Data = (zoneItem?.["dataParkD-1"]?.data ?? [])
                    .map((parkItem: any) => {
                        const filteredInnerData = (parkItem?.data ?? []).filter(
                            (innerItem: any) => innerItem?.group?.id == group_id
                        );

                        if (filteredInnerData.length === 0) return null;

                        return {
                            ...parkItem,
                            data: filteredInnerData,
                        };
                    })
                    .filter(Boolean);

                const hasMainData = filteredMainData.length > 0;
                const hasDataParkD1Data = filteredDataParkD1Data.length > 0;

                if (!hasMainData && !hasDataParkD1Data) return null;

                return {
                    ...zoneItem,
                    data: filteredMainData,
                    "dataParkD-1": zoneItem?.["dataParkD-1"]
                        ? {
                            ...zoneItem["dataParkD-1"],
                            data: filteredDataParkD1Data,
                        }
                        : zoneItem?.["dataParkD-1"],
                };
            })
            .filter(Boolean);

        return filtered_data_mock_park_
    }


    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    // const [dataTableYesterday, setDataYesterday] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    // const [dataShipper, setDataShipper] = useState<any>([]);
    const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);

    const fetchData = async () => {
        try {
            setIsLoading(false);
            const tomorrow = dayjs().tz("Asia/Bangkok").add(1, "day").format("YYYY-MM-DD")

            if (!srchStartDate) {
                setSrchStartDate(new Date(tomorrow))
            }

            const response: any = await getService(`/master/parking-allocation?gas_day=${tomorrow}`);
            let data_filter = response

            // ถ้า user เป็น shipper
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                data_filter = filterOnlyShipper(response, userDT?.account_manage?.[0]?.group?.id)
            }

            const updatedData = addSumsToMockTableData(data_filter);
            setData(updatedData);
            setFilteredDataTable(updatedData);

            // setDataYesterday(addSumsToMockTableData(res_yesterday)) // เอาไว้ใช้แสดง Last User Park Value (MMBTU/D) :

            // DATA ZONE
            const data_zone = Array.from(
                new Map(
                    zoneMaster?.data?.map((item: any) => [item.name, { zone_name: item.name }])
                ).values()
            );
            setDataZoneMasterZ(data_zone);

        } catch (err) {
            // setError(err.message);
        } finally {
            setIsLoading(true);
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
        const body_alloc = {
            "zone_id": data?.zone,
            "gas_day": data?.gas_day ? dayjs(data?.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'),
            "total_parking_value": data?.value_mmbtu
        }

        switch (formMode) {
            case "create":
                const res_create = await postService('/master/parking-allocation/allocate', body_alloc);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessMsg('Nomination value has been allocated.')
                    setModalSuccessOpen(true);

                    await fetchData();

                    setTimeout(() => {
                        handleFieldSearch();
                    }, 500);
                }

                break;
        }
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
            setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'shipper_name', label: 'Shipper Name', visible: true },
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'nominations_code', label: 'Nominations Code', visible: true },
        { key: 'version', label: 'Version', visible: true },
        { key: 'eod_park', label: 'EOD Park (MMBTU)', visible: true },
        { key: 'unpark_nominations', label: 'Unpark Nominations (MMBTU)', visible: true },
        { key: 'park_nominations', label: 'Park Nominations (MMBTU)', visible: true },
        { key: 'park_allocation', label: 'Park Allocated (MMBTU)', visible: true },
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

                    <DatePickaSearch
                        key={"start" + key}
                        label={"Gas Day"}
                        placeHolder={"Select Gas Day"}
                        isDefaultTomorrow={true}
                        allowClear
                        onChange={(e: any) => setSrchStartDate(e ? e : null)}
                    />

                    <InputSearch
                        id="searchZoneMaster"
                        label="Zone"
                        // type="select"
                        type="select-multi-checkbox"
                        value={srchZone}
                        onChange={(e) => setSrchZone(e.target.value)}
                        // options={zoneMaster?.data?.map((item: any) => ({
                        //     value: item?.id?.toString(),
                        //     label: item.name
                        // }))}
                        options={dataZoneMasterZ?.map((item: any) => ({
                            value: item.zone_name,
                            label: item.zone_name
                        }))}
                    />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
                <aside className="mt-auto ml-1 w-full sm:w-auto">
                    <div className="flex flex-wrap gap-2 justify-end">
                        {/* <BtnAddNew openCreateForm={openCreateForm} textRender={"Allocate"} can_create={userPermission ? userPermission?.f_create : false} iconNoRender={true} /> */}
                        <BtnGeneral
                            // textRender={"Allocate"}
                            textRender={"Available Parking Calculation"} // เปลี่ยนชื่อปุ่มสีเขียว เป็น Available Parking Calculation https://app.clickup.com/t/86etzcgxp
                            iconNoRender={true}
                            bgcolor={"#00ADEF"}
                            generalFunc={openCreateForm}
                            can_create={userPermission ? userPermission?.f_edit : false}
                            customWidthSpecific={230}
                        />
                    </div>
                </aside>
            </div>

            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    {/* Group Tune and BtnGeneral */}
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
                            path="nomination/parking-allocation"
                            can_export={userPermission ? userPermission?.f_export : false}
                            columnVisibility={columnVisibility}
                            initialColumns={initialColumns}
                            specificMenu={'parking-allocation'}
                            specificData={srchStartDate ? srchStartDate : dayjs().format("YYYY-MM-DD")}
                        />
                    </div>
                </div>

                <TableNomParkingAllocation
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    setDataReGen={setDataReGen}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                    // dataTableYesterday={dataTableYesterday}
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
                // dataTable={dataTable}
                // dataTableYesterday={dataTableYesterday}
                // dataShipper={dataShipper}
                zoneMaster={zoneMaster}
                // nominationTypeMaster={nominationTypeMaster?.data}
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