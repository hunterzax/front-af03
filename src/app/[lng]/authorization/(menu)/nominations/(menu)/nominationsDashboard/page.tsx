"use client";

import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import { Tab, Tabs } from '@mui/material';
import TableNominationDashboard from "./form/table";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { getService } from "@/utils/postService";
import { decryptData } from "@/utils/encryptionData";
import { findRoleConfigByMenuName, generateUserPermission, getCurrentWeekSundayYyyyMmDd } from "@/utils/generalFormatter";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import dayjs from 'dayjs';
import CheckboxSearch2, { InputSearch } from "@/components/other/SearchForm";
import getUserValue from "@/utils/getuserValue";

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
            //     const permission = findRoleConfigByMenuName('Nomination Dashboard', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Nomination Dashboard', userDT)
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

    const [key, setKey] = useState(0);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [tabIndex, setTabIndex] = useState(0);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [srchGasDay, setSrchGasDay] = useState<any>(null);
    const [srchGasWeek, setSrchGasWeek] = useState<any>(null);
    const [srchStartDateTwo, setSrchStartDateTwo] = useState<any>(undefined);

    const [dataTable, setData] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataSystem, setDataSystem] = useState<any>([]);

    const [dataTableWeekly, setDataWeekly] = useState<any>([]);
    const [filteredDataTableWeekly, setFilteredDataTableWeekly] = useState<any>([]);
    const [dataSystemWeekly, setDataSystemWeekly] = useState<any>([]);
    // const [srchShipperName, setSrchShipperName] = useState<any>('');
    const [srchShipperName, setSrchShipperName] = useState<any>([]);
    const [dataShipper, setDataShipper] = useState<any>([]);

    const [filterRowX, setfilterRowX] = useState(false)

    const [fullDataD, setfullDataD] = useState<any>(null)
    const [fullDataW, setfullDataW] = useState<any>(null)

    useEffect(() => {
        fetchData();
        getPermission();

        // ตอนเปลี่ยนหน้าหาทางเคลียร์
        // nom_dashboard_route_obj
        // nom_dashboard_route_obj_weekly
        // nom_dashboard_route_mix_quality_obj
        // nom_dashboard_route_quantity_obj

        localStorage.removeItem("nom_dashboard_route_obj")
        localStorage.removeItem("nom_dashboard_route_obj_weekly")
        localStorage.removeItem("nom_dashboard_route_mix_quality_obj")
        localStorage.removeItem("nom_dashboard_route_quantity_obj")

    }, [resetForm]);

    const fetchData = async () => {
        setIsLoading(false)

        try {
            // ถ้า user เป็น shipper
            // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                // setSrchShipperName(userDT?.account_manage?.[0]?.group?.id_name)
                setSrchShipperName([userDT?.account_manage?.[0]?.group?.id])
            }

            // Group (2 = TSO, 3 = Shipper, 4 = Other)
            const res_shipper_name = await getService(`/master/account-manage/group-master?user_type=3`);
            setDataShipper(res_shipper_name)
            let sun_day_fun_day = getCurrentWeekSundayYyyyMmDd();

            let today: any = dayjs().format('YYYY-MM-DD'); // Format today as 2025-04-10
            if (tabIndex == 0) {
                today = dayjs().add(1, 'day').format('YYYY-MM-DD');
            } else {
                today = sun_day_fun_day
            }

            const response: any = await getService(`/master/nomination-dashboard?gas_day=${today}&tab=${tabIndex == 0 ? 'daily' : 'weekly'}`);
            const response_weekly: any = await getService(`/master/nomination-dashboard?gas_day=${sun_day_fun_day}&tab=weekly`);

            setfullDataD(response?.data || null)
            setfullDataW(response_weekly?.data || null)
            
            // 
            // console.log('filterRowX : ', filterRowX);

            // ถ้าเป็น shipper --> filter only shipper ตัวเอง
            if (userDT?.account_manage?.[0]?.user_type_id == 3) {
                const filter_daily_only_your_shipper = response?.data?.daily?.table?.filter((item: any) => item?.group?.id == userDT?.account_manage?.[0]?.group?.id)
                const filter_weekly_only_your_shipper = response_weekly?.data?.weekly?.table?.filter((item: any) => item?.group?.id == userDT?.account_manage?.[0]?.group?.id)
                
                if(filterRowX){
                    // DAILY
                    const ffilter_daily_only_your_shipper = filter_daily_only_your_shipper?.filter((f:any) => {
                        return (
                            f?.entry_quality ||
                            f?.overuse_quantity ||
                            f?.over_maximum_hour_capacity_right
                        )
                    })
                    setData(ffilter_daily_only_your_shipper);
                    setFilteredDataTable(ffilter_daily_only_your_shipper);

                    // WEEKLY
                    const ffilter_weekly_only_your_shipper = filter_weekly_only_your_shipper?.filter((f:any) => {
                        return (
                            f?.entry_quality ||
                            f?.overuse_quantity
                        )
                    })
                    setDataWeekly(ffilter_weekly_only_your_shipper);
                    setFilteredDataTableWeekly(ffilter_weekly_only_your_shipper);
                }else{
                    // DAILY
                    setData(filter_daily_only_your_shipper);
                    setFilteredDataTable(filter_daily_only_your_shipper);
                    // WEEKLY
                    setDataWeekly(filter_weekly_only_your_shipper);
                    setFilteredDataTableWeekly(filter_weekly_only_your_shipper);
                }

            } else {
                if(filterRowX){
                    // DAILY
                    const ffilter_daily_only_your_shipper = (response?.data?.daily?.table || [])?.filter((f:any) => {
                        return (
                            f?.entry_quality ||
                            f?.overuse_quantity ||
                            f?.over_maximum_hour_capacity_right
                        )
                    })
                    setData(ffilter_daily_only_your_shipper);
                    setFilteredDataTable(ffilter_daily_only_your_shipper);
                    // WEEKLY
                    const ffilter_weekly_only_your_shipper = (response_weekly?.data?.weekly?.table || [])?.filter((f:any) => {
                        return (
                            f?.entry_quality ||
                            f?.overuse_quantity
                        )
                    })
                    setDataWeekly(ffilter_weekly_only_your_shipper);
                    setFilteredDataTableWeekly(ffilter_weekly_only_your_shipper);
                }else{
                    // DAILY
                    setData(response?.data?.daily?.table);
                    setFilteredDataTable(response?.data?.daily?.table);
                    // WEEKLY
                    setDataWeekly(response_weekly?.data?.weekly?.table);
                    setFilteredDataTableWeekly(response_weekly?.data?.weekly?.table)
                }

            }

            setDataSystem(response?.data?.daily?.system)
            setDataSystemWeekly(response_weekly?.data?.weekly?.system)

            setSrchGasDay(today)

            setTimeout(() => {
                setIsLoading(true);
            }, 300);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // ที่ปิดไว้เพราะ
    // ทั้งแถบ Daily และ แถบ Weekly ถ้า Filter ไว้แล้วกดเปลี่ยนแถบไปมา Filter และข้อมูลในตารางจะยังต้องคงแบบเดิมไว้ จนกว่าจะกด Reset Filter (ของแถบนั้นๆ) หรือกด Refresh Browser หรือเปลี่ยนเมนู ถึงจะ Clear Filter ที่เคยกด https://app.clickup.com/t/86euxqdw7
    // useEffect(() => {
    //     fetchData();
    // }, [tabIndex])

    const fetchByFieldSearch = async () => {
        if(tabIndex === 0){
             const current_sunday = getCurrentWeekSundayYyyyMmDd();
            setSrchStartDateTwo(srchGasDay)

            const today = dayjs().format('YYYY-MM-DD'); // Format today as 2025-04-10
            const searchDate = srchGasDay ? dayjs(srchGasDay).tz("Asia/Bangkok").format("YYYY-MM-DD") : today;
            const searchDateWeek = srchGasWeek ? dayjs(srchGasWeek).tz("Asia/Bangkok").format("YYYY-MM-DD") : current_sunday; // kom
        
            const response: any = await getService(`/master/nomination-dashboard?gas_day=${searchDate}&tab=daily`);
            setfullDataD(response?.data || null)

            const result_daily_table = response?.data?.daily?.table?.filter((item: any) => {
                return (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true);
            });


            if(filterRowX){
                const fresult_daily_table = result_daily_table?.filter((f:any) => {
                    return (
                        f?.entry_quality ||
                        f?.overuse_quantity ||
                        f?.over_maximum_hour_capacity_right
                    )
                })
                setData(fresult_daily_table);
                setFilteredDataTable(fresult_daily_table);
                setDataSystem(response?.data?.daily?.system)
                
            }else{

                setData(result_daily_table);
                setFilteredDataTable(result_daily_table);
                setDataSystem(response?.data?.daily?.system)
        
            }

            setIsLoading(true);
        }else{
             const current_sunday = getCurrentWeekSundayYyyyMmDd();
                setSrchStartDateTwo(srchGasDay)

                const today = dayjs().format('YYYY-MM-DD'); // Format today as 2025-04-10
                const searchDate = srchGasDay ? dayjs(srchGasDay).tz("Asia/Bangkok").format("YYYY-MM-DD") : today;
                const searchDateWeek = srchGasWeek ? dayjs(srchGasWeek).tz("Asia/Bangkok").format("YYYY-MM-DD") : current_sunday; // kom
            
                const response_week: any = await getService(`/master/nomination-dashboard?gas_day=${searchDateWeek}&tab=week`);

                setfullDataW(response_week?.data || null)
              
                const result_weekly_table = response_week?.data?.weekly?.table?.filter((item: any) => {
                    return (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true);
                });

                if(filterRowX){
                    
                    const fresult_weekly_table = result_weekly_table?.filter((f:any) => {
                        return (
                            f?.entry_quality ||
                            f?.overuse_quantity
                        )
                    })
                    setDataWeekly(fresult_weekly_table);
                    setFilteredDataTableWeekly(fresult_weekly_table)
                    setDataSystemWeekly(response_week?.data?.weekly?.system)
                }else{

                    setDataWeekly(result_weekly_table);
                    setFilteredDataTableWeekly(result_weekly_table)
                    setDataSystemWeekly(response_week?.data?.weekly?.system)
                }

                setIsLoading(true);
        }

        // const current_sunday = getCurrentWeekSundayYyyyMmDd();
        // setSrchStartDateTwo(srchGasDay)

        // const today = dayjs().format('YYYY-MM-DD'); // Format today as 2025-04-10
        // const searchDate = srchGasDay ? dayjs(srchGasDay).tz("Asia/Bangkok").format("YYYY-MM-DD") : today;
        // const searchDateWeek = srchGasWeek ? dayjs(srchGasWeek).tz("Asia/Bangkok").format("YYYY-MM-DD") : current_sunday; // kom
       
        // const response: any = await getService(`/master/nomination-dashboard?gas_day=${searchDate}&tab=daily`);
        // const response_week: any = await getService(`/master/nomination-dashboard?gas_day=${searchDateWeek}&tab=week`);


        // const result_daily_table = response?.data?.daily?.table?.filter((item: any) => {
        //     return (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true);
        // });

        // const result_weekly_table = response_week?.data?.weekly?.table?.filter((item: any) => {
        //     return (srchShipperName?.length > 0 ? srchShipperName.includes(item?.group?.id_name) : true);
        // });

        // if(filterRowX){
        //     const fresult_daily_table = result_daily_table?.filter((f:any) => {
        //         return (
        //             f?.entry_quality ||
        //             f?.overuse_quantity ||
        //             f?.over_maximum_hour_capacity_right
        //         )
        //     })
        //     setData(fresult_daily_table);
        //     setFilteredDataTable(fresult_daily_table);
        //     setDataSystem(response?.data?.daily?.system)
            
        //      const fresult_weekly_table = result_weekly_table?.filter((f:any) => {
        //         return (
        //             f?.entry_quality ||
        //             f?.overuse_quantity
        //         )
        //     })
        //     setDataWeekly(fresult_weekly_table);
        //     setFilteredDataTableWeekly(fresult_weekly_table)
        //     setDataSystemWeekly(response_week?.data?.weekly?.system)
        // }else{

        //     setData(result_daily_table);
        //     setFilteredDataTable(result_daily_table);
        //     setDataSystem(response?.data?.daily?.system)
    
        //     setDataWeekly(result_weekly_table);
        //     setFilteredDataTableWeekly(result_weekly_table)
        //     setDataSystemWeekly(response_week?.data?.weekly?.system)
        // }

        // setIsLoading(true);
    }

    // ############### FIELD SEARCH ###############
    const handleFieldSearch = () => {
        setIsLoading(false)
        // tabIndex == 0
        fetchByFieldSearch();

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleReset = () => {
        setSrchGasDay(null);
        setSrchGasWeek(null);
        setSrchStartDateTwo(undefined)

        fetchData();

        if (userDT?.account_manage?.[0]?.user_type_id !== 3) {
            // setSrchShipperName('')
            setSrchShipperName([]);
        }

        // setFilteredDataTable(dataTable);
        setKey((prevKey) => prevKey + 1);
    }

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        let filtered: any
        if (tabIndex == 0) {
            filtered = dataTable.filter(
                (item: any) => {
                    const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                    return (
                        item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                }
            );
            setFilteredDataTable(filtered);
        } else {
            filtered = dataTableWeekly?.filter(
                (item: any) => {
                    const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                    return (
                        item?.contract_code?.contract_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                        item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                    )
                }
            );
            setFilteredDataTableWeekly(filtered);
        }
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    }

    const initialColumns: any = [
        { key: 'contractcode', label: 'Contract Code', visible: true },
        { key: 'shipper', label: 'Shipper Name', visible: true },
        { key: 'entry_quality', label: 'Entry Quality', visible: true },
        { key: 'overise_quality', label: 'Overuse Quantity', visible: true },
        { key: 'over_maximum_hour', label: 'Over Maximum Hour Capacity Right', visible: true },
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

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);

        if (newValue == 0) {
            setColumnVisibility(Object.fromEntries(initialColumns?.map((column: any) => [column.key, column.visible])))
        } else if (newValue == 1) {
            setColumnVisibility(Object.fromEntries(initialColumns?.filter((item: any) => item?.key !== 'over_maximum_hour')?.map((column: any) => [column.key, column.visible])))
        }
    }


    
    useEffect(() => {
        const lastSunday = (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0))
         const gas_day = tabIndex == 0 ?
            srchGasDay ? dayjs(srchGasDay).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
            :
            srchGasWeek ? dayjs(srchGasWeek).format("YYYY-MM-DD") : (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0)).format("YYYY-MM-DD")
            console.log('srchGasDay : ', srchGasDay);
            console.log('srchGasWeek : ', srchGasWeek);
            console.log('gas_day : ', gas_day);
    }, [tabIndex])
    

    return (
        <div className="space-y-2">
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2 mb-5">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    {
                        tabIndex == 0 ?
                            <DatePickaSearch
                                key={"gas_day_" + key}
                                label="Gas Day"
                                placeHolder="Select Gas Day"
                                allowClear
                                // isFixDay={true}
                                isFixDay={srchStartDateTwo ? false : true}
                                dateToFix={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                                onChange={(e: any) => setSrchGasDay(e ? e : null)}
                                customWidth={200}
                                defaultValue={srchStartDateTwo ? srchStartDateTwo : srchGasDay} // R1 : ทั้งแถบ Daily และ แถบ Weekly ถ้า Filter ไว้แล้วกดเปลี่ยนแถบไปมา Filter และข้อมูลในตารางจะยังต้องคงแบบเดิมไว้ จนกว่าจะกด Reset Filter (ของแถบนั้นๆ) หรือกด Refresh Browser หรือเปลี่ยนเมนู ถึงจะ Clear Filter ที่เคยกด https://app.clickup.com/t/86euxqdw7
                            />
                            :
                            <DatePickaSearch
                                key={"start" + key}
                                label={"Gas Week"}
                                placeHolder={"Select Gas Week"}
                                isGasWeek={true}
                                modeSearch={'sunday'}
                                allowClear
                                defaultValue={srchGasWeek}
                                // onChange={(e: any) => setSrchGasDay(e ? e : null)}
                                onChange={(e: any) => setSrchGasWeek(e ? e : null)}
                            />
                    }

                    <InputSearch
                        id="searchShipper"
                        label="Shipper Name"
                        // type="select"
                        // value={srchShipperName}
                        type="select-multi-checkbox"
                        value={userDT?.account_manage?.[0]?.user_type_id == 3 ? [userDT?.account_manage?.[0]?.group?.id_name] : srchShipperName}
                        isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                        onChange={(e) => {
                            if (e.target.value == undefined) {
                                setSrchShipperName('')
                            } else {
                                setSrchShipperName(e.target.value)
                            }
                        }}
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

                    <CheckboxSearch2
                                id="filter_row_x"
                                label="Over Total Cap" // https://app.clickup.com/t/9018502823/86etzch6j
                                type="single-line"
                                value={filterRowX}
                                onChange={(e: any) => setfilterRowX(e?.target?.checked)}
                            />

                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
            </div>

            <Tabs
                value={tabIndex}
                onChange={handleChange}
                aria-label="tabs"
                sx={{
                    marginBottom: "-19px !important",
                    "& .MuiTabs-indicator": {
                        display: "none", // Remove the underline
                    },
                    "& .Mui-selected": {
                        color: "#58585A !important",
                    },
                }}
            >
                {["Daily", "Weekly"].map((label, index) => (
                    <Tab
                        key={label}
                        label={label}
                        id={`tab-${index}`}
                        sx={{
                            fontFamily: "Tahoma !important",
                            border: "1px solid",
                            borderColor: "#DFE4EA",
                            borderBottom: "none",
                            borderTopLeftRadius: "9px",
                            borderTopRightRadius: "9px",
                            textTransform: "none",
                            padding: "8px 16px",
                            backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                            color: tabIndex === index ? "#58585A" : "#9CA3AF",
                            whiteSpace: "nowrap",
                            minWidth: "auto",
                            "&:hover": {
                                backgroundColor: "#F3F4F6",
                            },
                        }}
                    />
                ))}
            </Tabs>
            <div className="border-[#DFE4EA] border-[1px] p-4 shadow-sm rounded-b-xl rounded-r-xl">
                <div className="mb-5">
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start">
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

                            {/* <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/metering-checking-condition" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} /> */}
                            <BtnExport
                                textRender={"Export"}
                                data={tabIndex == 0 ? filteredDataTable : filteredDataTableWeekly}
                                path="nomination/nomination-dashboard"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificMenu='nomination-dashboard'
                                type={tabIndex == 0 ? 1 : 2}
                                specificData={
                                    {
                                        gas_day: tabIndex == 0 ?
                                            srchGasDay ? dayjs(srchGasDay).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")
                                            :
                                            srchGasWeek ? dayjs(srchGasWeek).format("YYYY-MM-DD") : (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0) : dayjs().day(0)).format("YYYY-MM-DD")
                                    }
                                }
                            />
                        </div>
                    </div>
                </div>

                <TableNominationDashboard
                    tableData={tabIndex == 0 ? filteredDataTable : filteredDataTableWeekly}
                    systemData={tabIndex == 0 ? dataSystem : dataSystemWeekly}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    tabIndex={tabIndex}
                    fullDataD={fullDataD}
                    fullDataW={fullDataW}
                /> 

                <PaginationComponent
                    totalItems={tabIndex == 0 ? filteredDataTable?.length : filteredDataTableWeekly?.length}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />

                <ColumnVisibilityPopover
                    open={open}
                    anchorEl={anchorEl}
                    setAnchorEl={setAnchorEl}
                    columnVisibility={columnVisibility}
                    handleColumnToggle={handleColumnToggle}
                    // initialColumns={initialColumns}
                    initialColumns={tabIndex == 1 ? initialColumns?.filter((item: any) => item?.key !== 'over_maximum_hour') : initialColumns}
                />
            </div>
        </div>
    )
}

export default ClientPage;
