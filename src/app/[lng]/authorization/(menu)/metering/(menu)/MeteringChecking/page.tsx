"use client";
import { useEffect, useState } from "react";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import { Tune } from "@mui/icons-material"
import { InputSearch } from "@/components/other/SearchForm";
import BtnExport from "@/components/other/btnExport";
import SearchInput from "@/components/other/searchInput";
import ModalComponent from "@/components/other/ResponseModal";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { findRoleConfigByMenuName, generateUserPermission, shiftTimeKeys, toDayjs } from "@/utils/generalFormatter";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { decryptData } from "@/utils/encryptionData";
import PaginationComponent from "@/components/other/globalPagination";
import TableMtrChecking from "./form/table";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { getService } from "@/utils/postService";
import getUserValue from "@/utils/getuserValue";
import BtnGeneral from "@/components/other/btnGeneral";
import { epMeretingMeteringMeteringChecking } from "@/utils/exportFunc";
import { Checkbox } from "@mui/material";
import { Tab, Tabs } from "@mui/material";

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { CustomTooltip } from "@/components/other/customToolTip";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps { params: { lng: string } }

const ClientPage: React.FC<ClientProps> = (props) => {

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    //state
    const [key, setKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [selectedKey, setselectedKey] = useState<any>();
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [modalSuccessMsg, setModalSuccessMsg] = useState('Your file has been uploaded.');
    const [srchMeterRetriveId, setSrchMeterRetriveId] = useState('');
    const handleCloseModal = () => setModalSuccessOpen(false);
    const open = Boolean(anchorEl);
    const open2 = Boolean(anchorEl2);
    const [tabIndex, setTabIndex] = useState(0); // 0=Retrieving, 1=metering data check

    const [hindDefaultNodata, sethindDefaultNodata] = useState({
            "01:00": false,
            "02:00": false,
            "03:00": false,
            "04:00": false,
            "05:00": false,
            "06:00": false,
            "07:00": false,
            "08:00": false,
            "09:00": false,
            "10:00": false,
            "11:00": false,
            "12:00": false,
            "13:00": false,
            "14:00": false,
            "15:00": false,
            "16:00": false,
            "17:00": false,
            "18:00": false,
            "19:00": false,
            "20:00": false,
            "21:00": false,
            "22:00": false,
            "23:00": false,
            "24:00": false,
        })

    const [hindWarning, sethindWarning] = useState({
            "01:00": false,
            "02:00": false,
            "03:00": false,
            "04:00": false,
            "05:00": false,
            "06:00": false,
            "07:00": false,
            "08:00": false,
            "09:00": false,
            "10:00": false,
            "11:00": false,
            "12:00": false,
            "13:00": false,
            "14:00": false,
            "15:00": false,
            "16:00": false,
            "17:00": false,
            "18:00": false,
            "19:00": false,
            "20:00": false,
            "21:00": false,
            "22:00": false,
            "23:00": false,
            "24:00": false,
        })

    const [checkWarning, setCheckWarning] = useState(false)

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
            //     const permission = findRoleConfigByMenuName('Metering Checking', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Metering Checking', userDT)
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

    //class css
    const cardClass = "border-[#DFE4EA] border-[1px] p-4 rounded-lg rounded-tl-none ";

    // ############### FIELD SEARCH ###############
    const [srchGasDay, setSrchGasDay] = useState<Date | null>(null);
    const [srchMeterPointId, setSrchMeterPointId] = useState<any>([]);

    const handleFieldSearch = async () => {
        setIsLoading(false)
        console.log('...');
        console.log('helperCheck : ', helperCheck);
        sethelperCheck(helperCheck)

        try {
            const today = dayjs().format("YYYY-MM-DD");
            const localDate = srchGasDay ? toDayjs(srchGasDay).format("YYYY-MM-DD") : today;

            const applyFilters = (data: any[]) => {
                return data?.filter((itemf: any) => {
                    return srchMeterPointId?.length > 0 ? srchMeterPointId?.find((item: any) => item == itemf?.meteringPointId) : true
                });
            };
            setCurrentPage(1);

            if (srchGasDay) {
                // master/metering-management/metering-checking?gasDay=2025-03-10
                const response: any = await getService(`/master/metering-management/metering-checking?gasDay=${localDate}`);

                // แปลง key ของ res_ ปกติเริ่ม 00:00 - 23:00 เป็น 01:00 - 24:00W
                const time_key_change = shiftTimeKeys(response)

                setDataTableByGasDay(time_key_change);
                const result_2 = applyFilters(time_key_change);
                usedData(result_2);
            } else {
                setDataTableByGasDay(dataTable);
                const result_2 = applyFilters(dataTable);
                usedData(result_2);
            }
        } catch (error) {
            // Error handling
            // Optionally show a user-friendly error message
        }


        setTimeout(() => {
            setIsLoading(true)
        }, 500);
    };

    const handleReset = () => {
        setSrchMeterPointId([])
        setSrchMeterRetriveId('')
        setSrchGasDay(null)
        setDataTableByGasDay(dataTable);
        usedData(dataTable);
        setKey((prevKey) => prevKey + 1);
    };

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [dataTableByGasDay, setDataTableByGasDay] = useState<any[]>([]);
    const fetchData = async () => {
        try {
            // DATA CUSTOMER TYPE
            // const res_cust_type: any = await getService(`/master/asset/customer-type`);

            // DATA 
            // const res_checking_condition_icon: any = await getService(`/master/parameter/checking-condition`);

            const today = dayjs().format("YYYY-MM-DD");
            const response: any = await getService(`/master/metering-management/metering-checking?gasDay=${today}`);

            // แปลง key ของ res_ ปกติเริ่ม 00:00 - 23:00 เป็น 01:00 - 24:00
            const time_key_change = shiftTimeKeys(response)

            const res_get_cust_type = time_key_change?.map((item: any) => ({
                ...item,
                customer_type_name: item.nomination_point?.customer_type?.name ?? null
            }));

            setData(res_get_cust_type);
            usedData(res_get_cust_type);

            setIsLoading(true);
            setDataTableByGasDay(res_get_cust_type)
        } catch (err) {
        } finally {
        }
    };

    useEffect(() => {
        getPermission();
        fetchData();
    }, [resetForm]);

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'gas_day', label: 'Gas Day', visible: true },
        { key: 'metering_point_id', label: 'Metering Point ID', visible: true },
        { key: 'customer_type', label: 'Customer Type', visible: true },
        // ...Array.from({ length: 25 }, (_, i) => ({ // 00:00 - 23:00
        //     key: `${i.toString().padStart(2, '0')}:00`,
        //     label: `${i.toString().padStart(2, '0')}:00`,
        //     visible: true
        // }))
        ...Array.from({ length: 24 }, (_, i) => {
            const hour = (i + 1).toString().padStart(2, '0'); // 01 … 24
            return {
                key: `${hour}:00`,
                label: `${hour}:00`,
                visible: true,
            };
        })
    ];

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };


    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        const filtered = (dataTableByGasDay?.length > 0 ? dataTableByGasDay : dataTable).filter(
            // const filtered = filteredDataTable.filter(
            (item: any) => {
                return (
                    item?.metered_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        usedData(filtered);
    };
 
    const usedData = (payload:any) => {
        let hindDefaultNodata_:any = {
            "01:00": false,
            "02:00": false,
            "03:00": false,
            "04:00": false,
            "05:00": false,
            "06:00": false,
            "07:00": false,
            "08:00": false,
            "09:00": false,
            "10:00": false,
            "11:00": false,
            "12:00": false,
            "13:00": false,
            "14:00": false,
            "15:00": false,
            "16:00": false,
            "17:00": false,
            "18:00": false,
            "19:00": false,
            "20:00": false,
            "21:00": false,
            "22:00": false,
            "23:00": false,
            "24:00": false,
        }

        Array.from({ length: 24 }, (_, i) => {
                const hour_type = i;
                const hour = i + 1;
                const find = payload?.filter((f:any) => f?.[`type_${hour_type.toString().padStart(2, "0")}:00`] !== "gray_url")
                if(find?.length === 0){
                hindDefaultNodata_[`${hour.toString().padStart(2, "0")}:00`] = true
                }
                return `${hour.toString().padStart(2, "0")}:00`;
            })     
        sethindDefaultNodata(hindDefaultNodata_)

        if(checkWarning){
            const payload_ = payload?.filter((f:any) => {
                let flarWarning = false
                Array.from({ length: 24 }, (_, i) => {
                    const hour_type = i;
                    const hour = i + 1;
                    if(f?.[`type_${hour_type.toString().padStart(2, "0")}:00`] !== "gray_url" && f?.[`type_${hour_type.toString().padStart(2, "0")}:00`] !== "green_url"){
                        flarWarning = true
                    }
                    return `${hour.toString().padStart(2, "0")}:00`;
                }) 
                return flarWarning
            })
            setFilteredDataTable(payload_);
        }else{
            setFilteredDataTable(payload);
        }

        // console.log('hindDefaultNodata_ : ', hindDefaultNodata_);
        // calcCondition1_02:00
        // 01:00 <-> type_00:00 "gray_url"
    }

    const handleFormSubmit = async (data: any) => { }

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
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    // useEffect(() => {
    //   console.log('hindDefaultNodata : ', hindDefaultNodata);
    // }, [hindDefaultNodata])
    
    // useEffect(() => {
    //   console.log('hindWarning : ', hindWarning);
    // }, [hindWarning])

    const [helperCheck, sethelperCheck] = useState<any>([])
    useEffect(() => {
        const helpCheck = async () => {
          const response: any = await getService(`/master/parameter/checking-condition`);
          const nHelpCheck = (response || [])?.map((e:any) => {

            return {
                start_date: e?.start_date || null,
                end_date: e?.end_date || null,
                data:[
                    {
                        url: null,
                        text: `ค่าที่โดนหารด้วย 0`,
                        value: null,
                        nValue: `Div/0`,
                        nColor: `#5E5E5E`,
                    },
                    {
                        url: e?.orange_url,
                        text: `สีส้ม ระบุค่ามากกว่า (%) หรือ ใช้สัญลักษณ์`,
                        value: e?.orange_value,
                        nValue: `>%high`,
                        nColor: `#EC6300`,
                    },
                    {
                        url: e?.yellow_url,
                        text: `สีเหลือง เมื่อมีค่าน้อยกว่า (%) หรือ ใช้สัญลักษณ์`,
                        value: e?.yellow_value,
                        nValue: `<%low`,
                        nColor: `#E8B125`,
                    },
                    {
                        url: e?.purple_url,
                        text: `สีม่วง กรณีค่าไม่เปลี่ยนแปลง`,
                        value: null,
                        nValue: null,
                        nColor: null,
                    },
                    {
                        url: e?.red_url,
                        text: `สีแดง กรณีค่าติดลบ`,
                        value: null,
                        nValue: null,
                        nColor: null,
                    },
                    {
                        url: e?.green_url,
                        text: `สีเขียว กรณี meter ปกติ`,
                        value: null,
                        nValue: null,
                        nColor: null,
                    },
                    {
                        url: e?.gray_url,
                        text: `สีเทา N/A กรณีค่าไม่เข้า`,
                        value: null,
                        nValue: null,
                        nColor: null,
                    },
                ]
            }
          })
        //   console.log('nHelpCheck : ', nHelpCheck);
          sethelperCheck(nHelpCheck)
      }
      helpCheck()

    }, [])

    
    
    // useEffect(() => {
    //     console.log('helperCheck : ', helperCheck);
    //     // const todayStart = dayjs().startOf('day');
    //     // const todayEnd = dayjs().endOf('day');
    //     // const test = helperCheck.find((item_:any) => {
    //     //     const start = dayjs(item_.start_date);
    //     //     const end = dayjs(item_.end_date);
    //     //     // return (srchGasDay ? dayjs(srchGasDay, "YYYY-MM-DD") : dayjs()).isAfter(start) && (srchGasDay ? dayjs(srchGasDay, "YYYY-MM-DD") : dayjs()).isBefore(end);
    //     //     const s_ = srchGasDay 
    //     //         ? dayjs(srchGasDay).isSameOrAfter(start)
    //     //         : todayStart.isSameOrAfter(start)
    //     //     const e_ = srchGasDay 
    //     //         ? dayjs(srchGasDay).isBefore(end) 
    //     //         : todayEnd.isBefore(end)

    //     //         console.log('s_ : ', s_);
    //     //         console.log('e_ : ', e_);
    //     //     if(item_.end_date){

    //     //         return s_;
    //     //     }else{

    //     //         return s_ && e_;
    //     //     }
    //     //     })
    //     // console.log('srchGasDay : ', srchGasDay);
    //     // console.log('test : ', test);


        
    //     const tt = helperCheck.find((item_: any) => {
    //             const targetDate = srchGasDay ? dayjs(srchGasDay).startOf("day") : dayjs().startOf("day");
    //             const startDate = dayjs(item_.start_date).startOf("day");

    //             if (targetDate.isBefore(startDate)) {
    //                 return false;
    //             }

    //             if (!item_.end_date) {
    //                 return true;
    //             }

    //             const endDate = dayjs(item_.end_date).endOf("day");

    //             return (
    //                 targetDate.isSameOrAfter(startDate) &&
    //                 targetDate.isSameOrBefore(endDate)
    //             );
    //         });
    //     console.log('tt : ', tt);
            
    // }, [helperCheck, srchGasDay])
    

    return (
        <div className="space-y-2">
            {/* <div className={`${cardClass} grid grid-cols-[82%_18%]`}> */}
            <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                    <DatePickaSearch
                        key={"start" + key}
                        label="Gas Day"
                        placeHolder="Select Gas Day"
                        allowClear
                        onChange={(e: any) => setSrchGasDay(e ? e : null)}
                    />

                    <InputSearch
                        id="meteringPointFilter"
                        label="Metering Point ID"
                        type="select-multi-checkbox"
                        value={srchMeterPointId}
                        onChange={(e) => setSrchMeterPointId(e.target.value)}
                        placeholder="Select Metering Point ID"
                        options={(dataTableByGasDay?.length > 0 ? dataTableByGasDay : dataTable?.length > 0 ? dataTable : [])?.map((item: any) => ({
                            value: item?.meteringPointId,
                            label: item?.meteringPointId
                        }))}
                    />
                    <div>
                        <div>{`Check Warning`}</div>
                        <div className="  mt-3 grid justify-center items-center">
                        <Checkbox checked={checkWarning} onChange={(e:any)=> {
                            return setCheckWarning(e?.target?.checked)
                        }} sx={{ padding: "0px", marginRight: "8px" }} />
                        </div>
                    </div>
                    
                    <BtnSearch handleFieldSearch={handleFieldSearch} />
                    <BtnReset handleReset={handleReset} />
                </aside>
            </div>
            <Tabs
                value={tabIndex}
                onChange={(event: any, newValue: any) => {
                    setTabIndex(newValue);
                }}
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
                {["Summary", "Detail"].map((label, index) => (
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
            {/* <div className={`${cardClass} rounded-tl-none`}> */}
            <div className={`${cardClass} `}>
                <div>
                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                        <div className="flex items-center gap-4">
                            <div onClick={handleTogglePopover}>
                                <Tune
                                    className="cursor-pointer rounded-lg"
                                    style={{
                                        fontSize: "18px",
                                        color: "#2B2A87",
                                        borderRadius: "4px",
                                        width: "22px",
                                        height: "22px",
                                        border: "1px solid rgba(43, 42, 135, 0.4)"
                                    }}
                                />
                            </div> 
                            <CustomTooltip
                                title={<div className=" space-y-5">
                                    {
                                        ((helperCheck.find((item_: any) => {
                                                const targetDate = srchGasDay ? dayjs(srchGasDay).startOf("day") : dayjs().startOf("day");
                                                const startDate = dayjs(item_.start_date).startOf("day");

                                                if (targetDate.isBefore(startDate)) {
                                                    return false;
                                                }

                                                if (!item_.end_date) {
                                                    return true;
                                                }

                                                const endDate = dayjs(item_.end_date).endOf("day");

                                                return (
                                                    targetDate.isSameOrAfter(startDate) &&
                                                    targetDate.isSameOrBefore(endDate)
                                                );
                                            }))?.data || [])?.map((e:any, ix:number) => {

                                            return (
                                                <div key={ix} className=" flex items-center gap-2">
                                                    <div className="w-20">
                                                        {e?.url ? <>
                                                        <img src={e?.url} className=" w-7 h-7" alt="" />
                                                        </> 
                                                        : <>
                                                        <div className={`text-[${e?.nColor}]`}>{`(${e?.nValue})`}</div>
                                                        </>}
                                                    </div>
                                                    <div>{e?.text || "-"}</div>
                                                </div>
                                            )
                                        })
                                    }
                                   
                                </div>}
                                placement="top-end"
                                arrow
                            >
                                <div className="w-[20px] h-[20px] flex items-center justify-center rounded-lg cursor-pointer">
                                    <InfoOutlinedIcon
                                        style={{ fontSize: "11px", color: '#747474', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                    />
                                </div>
                            </CustomTooltip>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-end">
                            <SearchInput onSearch={handleSearch} />
                            <BtnGeneral
                                    bgcolor={"#24AB6A"}
                                    modeIcon={'export'}
                                    textRender={"Export"}
                                    generalFunc={() => {epMeretingMeteringMeteringChecking({ 
                                        name: 'Metering Metering Checking',
                                        initialColumns: initialColumns,
                                        columnVisibility: columnVisibility, 
                                        // resData: paginatedData,
                                        resData: filteredDataTable, // https://app.clickup.com/t/86eub6d5c
                                        hindDefaultNodata: hindDefaultNodata,
                                        tabIndex: tabIndex,
                                        })}}
                                    can_export={userPermission ? userPermission?.f_export : false}
                                />
                            {/* <BtnExport
                                textRender={"Export"}
                                data={filteredDataTable}
                                path="metering/metering-data-check"
                                can_export={userPermission ? userPermission?.f_export : false}
                                columnVisibility={columnVisibility}
                                initialColumns={initialColumns}
                                specificData={srchGasDay ? dayjs(srchGasDay).format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD")}
                                specificMenu={'metering-checking'}
                            /> */}
                        </div>
                    </div>
                </div>

                <TableMtrChecking
                    tableData={paginatedData}
                    isLoading={isLoading}
                    columnVisibility={columnVisibility}
                    setisLoading={setIsLoading}
                    selectedKey={selectedKey}
                    tabIndex={tabIndex}
                    hindDefaultNodata={hindDefaultNodata}
                    hindWarning={hindWarning}
                />
            </div>

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={modalSuccessMsg}
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

            <PaginationComponent
                totalItems={filteredDataTable?.length}
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
                initialColumns={initialColumns}
            />

        </div>
    )
}

export default ClientPage;