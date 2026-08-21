"use client";
import { useEffect, useState } from "react";
import {
  findRoleConfigByMenuName,
  generateUserPermission,
} from "@/utils/generalFormatter";
import { postService } from "@/utils/postService";
import { useFetchMasters } from "@/hook/fetchMaster";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import getUserValue from "@/utils/getuserValue";
import { useForm } from "react-hook-form";
import ChartSystem from "./form/chart";

import { Tab, Tabs } from '@mui/material';


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps {
  params: {
    lng: string;
  };
}

const ClientPage: React.FC<ClientProps> = (props) => {
  const today: any = dayjs().format("YYYY-MM-DD");
  const [tabIndex, setTabIndex] = useState(0);

  // ############### Check Authen ###############
  const userDT: any = getUserValue();
  const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
  useRestrictedPage(token);

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>();
  let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

      const permission = findRoleConfigByMenuName(
        "System Acc. Imbalance Inventory",
        userDT,
      );
      if (permission) {
        setUserPermission(permission);
      } else if (user_permission?.role_config) {
        const updatedUserPermission = generateUserPermission(user_permission);
        setUserPermission(updatedUserPermission);
      }
    } catch (error) {
    }
  };

  // ############### REDUX DATA ###############
  const { zoneMaster, areaMaster } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchZoneMasterSlice());
      dispatch(fetchAreaMaster());
      dispatch(fetchNominationPoint());
      dispatch(fetchContractPoint());
    }
    if (forceRefetch) {
      setForceRefetch(false);
    }
    getPermission();
  }, [dispatch, zoneMaster, areaMaster, forceRefetch]);

  // ############### FIELD SEARCH ###############
  const {
    register,
    setValue,
    reset,
    formState: { errors },
    watch,
    getValues,
  } = useForm<any>();

  const [key, setKey] = useState(0);
  const [srchStartDate, setSrchDate] = useState<Date | null>(null);

  const handleFieldSearchSys = async () => {
    setIsLoading(true);
    fetchDataSys(srchStartDate);

    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [dataTableEast, setDataEast] = useState<any>([]);
  const [dataTableWest, setDataWest] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();

  const fetchDataSys = async (date: any) => {
    try {
      const body_main = {
        gas_day: dayjs(date).format("YYYY-MM-DD"),
        start_hour: 1,
        end_hour: 24,
        skip: 0,
        limit: 100,
      };

      // MAIN DATA
      const response = await postService(
        "/master/balancing/system-acc-imbalance-inventory",
        body_main,
      );

      if (userDT?.account_manage?.[0]?.user_type_id == 3) {

         const nDataEast = {
            data: response?.data?.map((e:any) => {
                const { hour, ...nE } = e
                const hour_ = hour?.map((v:any) => {
                    const { valueOfEachZone, ...nV } = v
                    return {
                        ...nV,
                        valueOfEachZone: {
                            EAST: valueOfEachZone?.EAST
                        }
                    }
                })

                return {
                    ...nE,
                    hour: hour_
                }
            }),
            templateLabelKeys: response?.templateLabelKeys?.filter((f:any) => {
              return (
                f?.lebel !== "WEST" &&
                f?.key !== "high_max_percentage" &&
                f?.key !== "low_max_percentage"
              )
            })
        }
        const nDataWest = {
            data: response?.data?.map((e:any) => {
                const { hour, ...nE } = e
                const hour_ = hour?.map((v:any) => {
                    const { valueOfEachZone, ...nV } = v
                    return {
                        ...nV,
                        valueOfEachZone: {
                            WEST: valueOfEachZone?.WEST
                        }
                    }
                })

                return {
                    ...nE,
                    hour: hour_
                }
            }),
            templateLabelKeys: response?.templateLabelKeys?.filter((f:any) => {
              return (
                f?.lebel !== "EAST" &&
                f?.key !== "high_max_percentage" &&
                f?.key !== "low_max_percentage"
              )
            })
        }
        setDataEast(nDataEast);
        setDataWest(nDataWest);

      } else {
      
        const nDataEast = {
            data: response?.data?.map((e:any) => {
                const { hour, ...nE } = e
                const hour_ = hour?.map((v:any) => {
                    const { valueOfEachZone, ...nV } = v
                    return {
                        ...nV,
                        valueOfEachZone: {
                            EAST: valueOfEachZone?.EAST
                        }
                    }
                })

                return {
                    ...nE,
                    hour: hour_
                }
            }),
            templateLabelKeys: response?.templateLabelKeys?.filter((f:any) => f?.lebel !== "WEST")
        }
        const nDataWest = {
            data: response?.data?.map((e:any) => {
                const { hour, ...nE } = e
                const hour_ = hour?.map((v:any) => {
                    const { valueOfEachZone, ...nV } = v
                    return {
                        ...nV,
                        valueOfEachZone: {
                            WEST: valueOfEachZone?.WEST
                        }
                    }
                })

                return {
                    ...nE,
                    hour: hour_
                }
            }),
            templateLabelKeys: response?.templateLabelKeys?.filter((f:any) => f?.lebel !== "EAST")
        }
        setDataEast(nDataEast);
        setDataWest(nDataWest);
      }
    } catch (error) {}
  };

  useEffect(() => {
    setSrchDate(today);
    fetchDataSys(today);
  }, [resetForm]);

  const handleResetSys = () => {
    setSrchDate(today);
    fetchDataSys(today);
    setKey((prevKey) => prevKey + 1);
  };

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap gap-2 w-full">
          <DatePickaSearch
            key={"start" + key}
            label={"Gas Day"}
            placeHolder={"Select Gas Day"}
            isDefaultToday={true}
            allowClear
            onChange={(e: any) =>
              setSrchDate(e ? dayjs(e).format("YYYY-MM-DD") : today)
            }
            max={today}
          />

          <BtnSearch handleFieldSearch={handleFieldSearchSys} />
          <BtnReset handleReset={handleResetSys} />
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
            {
                ["EAST", "WEST"]?.map((label, index) => (
                    <Tab
                        key={label}
                        label={label}
                        id={`tab-${index}`}
                        sx={{
                            fontFamily: "Tahoma !important",
                            border: "0.5px solid",
                            borderColor: "#DFE4EA",
                            borderBottom: "none",
                            borderTopLeftRadius: "9px",
                            borderTopRightRadius: "9px",
                            textTransform: "none",
                            padding: "8px 16px",
                            backgroundColor: tabIndex === index ? "#FFFFFF" : "#9CA3AF1A",
                            color: tabIndex === index ? "#58585A" : "#9CA3AF",
                            "&:hover": {
                                backgroundColor: "#F3F4F6",
                            },
                        }}
                    />
                ))
            }
        </Tabs>
     {
        tabIndex === 0 &&
        <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl rounded-tl-none shadow-sm h-full">
            <ChartSystem data={dataTableEast} />
        </div>
     }
     {
        tabIndex === 1 && 
        <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl rounded-tl-none shadow-sm h-full">
            <ChartSystem data={dataTableWest} />
        </div>
     }
    </div>
  );
};

export default ClientPage;
