"use client";
// import { useTranslation } from "@/app/i18n/client";
import { useState, useEffect } from "react";
import { getService } from "@/utils/postService";
import { QualityPlanningData } from "@/app/types";
import { QualityPlanningTabs } from "./components/QualityPlanningTabs";
import { HourRangeTabs } from "./components/HourRangeTabs";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from "dayjs";
import { getCurrentWeekSundayYyyyMmDd, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, generateUserPermission, toDayjs, findRoleConfigByMenuName, formatNumberFourDecimalNom, formatNumberFourDecimalNomNoComma } from "@/utils/generalFormatter";
import SearchInput from "@/components/other/searchInput";
import BtnExport from "@/components/other/btnExport";
import getUserValue from "@/utils/getuserValue";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Tune } from "@mui/icons-material";
import { dayinWeek } from "@/utils/date/week";
import { table_sort_header_style } from "@/utils/styles";
import { GeneralTable } from "@/components/table/GeneralTable";

import customParseFormat from 'dayjs/plugin/customParseFormat';
import Spinloading2 from "@/components/other/spinLoading2";
dayjs.extend(customParseFormat);

// ประกาศ interface สำหรับ props ที่รับเข้ามา
interface ClientProps {
  params: {
    lng: string;  // รับภาษาจาก URL parameter
  };
}

// ประกาศ interface สำหรับข้อมูล Weekly ที่ extend จาก QualityPlanningData
interface WeeklyData extends QualityPlanningData {
  sunday?: {
    date: string;
    value: number;
  };
}

export default function ClientPage({ params: { lng } }: ClientProps) {
  // const { t } = useTranslation(lng, "mainPage");

  // สถานะสำหรับการจัดการ tab และข้อมูล
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabIndex, setTabIndex] = useState(0);  // 0: Intraday, 1: Daily, 2: Weekly
  const [subTabIndex, setSubTabIndex] = useState(0);  // สำหรับช่วงเวลาใน Intraday
  const [responseFromService, setResponseFromService] = useState<any>();  // ข้อมูลจาก service
  const [data, setData] = useState<QualityPlanningData[]>([]);  // ข้อมูลทั้งหมด
  const [filteredData, setFilteredData] = useState<QualityPlanningData[]>([]);  // ข้อมูลที่ผ่านการกรอง
  const [filteredDataCopycat, setFilteredDataCopycat] = useState<QualityPlanningData[]>([]);  // ข้อมูลที่ผ่านการกรอง
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);  // สถานะการโหลดข้อมูล
  const [displayGasDay, setDisplayGasDay] = useState<Date | null>(null);  // วันที่แสดงใน datepicker
  const [gasDay, setGasDay] = useState<Date | null>(null);  // วันที่ใช้ตอนค้นหา
  const [displayGasDayInTabWeekly, setDisplayGasDayInTabWeekly] = useState<Date | undefined | null>(null);  // วันที่แสดงใน tab weekly
  const [hourRange, setHourRange] = useState<[number, number] | undefined>(undefined);  // ช่วงเวลาใน Intraday

  // กำหนดคอลัมน์ของตาราง
  const columns: ColumnDef<QualityPlanningData>[] = [
    {
      accessorKey: 'gasday',
      header: 'Gas Day',
      size: 120
    },
    {
      accessorKey: 'zone.name',
      header: 'Zone',
      size: 120,
      cell: ({ row }) => (
        <div
          className="flex  w-[100px] justify-center rounded-full p-1 text-[#464255]"
          style={{ backgroundColor: row.original.zone?.color }}
        >
          {row.original.zone?.name}
        </div>
      ),
    },
    {
      accessorKey: 'area.name',
      header: 'Area',
      size: 100,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div
            className={`flex justify-center items-center p-1 text-[#464255] ${row.original.area?.entry_exit_id === 2 ? 'rounded-full' : 'rounded-lg'}`}
            style={{
              backgroundColor: row.original.area?.color,
              width: '40px',
              height: '40px',
            }}
          >
            {row.original.area?.name}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'parameter',
      header: 'Parameter',
      size: 120,
    },
    // สร้างคอลัมน์ชั่วโมงตามช่วงที่กำหนด (เฉพาะเมื่อ hourRange ถูกกำหนด)
    ...(Array.from(
      { length: 24 },
      (_, i) => {
        const hour = i + 1;
        return {
          accessorKey: `h${hour}`,
          header: () => (
            <div className={`${table_sort_header_style} text-center`}>
              <div>{`H${hour}`}</div>
              <div>
                {`${String(hour - 1).padStart(2, '0')}:01 - ${String(hour).padStart(2, '0')}:00`}
              </div>
            </div>
          ),
          size: 130,
          cell: ({ getValue, row }: { getValue: () => any, row: Row<QualityPlanningData> }) => {
            const value = getValue()
            return <span className={`${isOutOfRange(value, row) ? "text-[#ED1B24]" : "text-[#464255]"}`}>
              {/* {value ? formatNumberThreeDecimal(value) : ''} */}
              {value !== null && value !== undefined ? (row.original?.parameter === "SG" ? formatNumberFourDecimalNom(value) : formatNumberThreeDecimal(value)) : ''}
            </span>
          },
        };
      }
    )),
    // {
    //   accessorKey: '',
    //   header: 'Unit',
    //   size: 120,
    //   cell: (info) => {
    //     const row: any = info?.row?.original
    //     let unit_show = row?.parameter == "SG" ? '' : 'BTU/SCF'
    //     return (<div>{unit_show}</div>)
    //   }
    // },

    {
      id: 'unit', // ต้องมี id หรือ accessorKey
      header: 'Unit',
      size: 120,
      accessorFn: (row: any) => {
        // คืนค่าที่เอาไว้ให้ search/filter
        return row?.parameter === "SG" ? '' : 'BTU/SCF';
      },
      cell: (info) => {
        const row: any = info?.row?.original;
        let unit_show = row?.parameter === "SG" ? '' : 'BTU/SCF';
        return <div>{unit_show}</div>;
      },
    },
    {
      accessorKey: 'valueBtuScf',
      // header: 'Value (BTU/SCF)',
      header: 'Value', // R1 : Tab Daily : เพิ่ม Column Unit https://app.clickup.com/t/86etzch21
      size: 120,
      cell: ({ getValue, row }: { getValue: () => any, row: Row<QualityPlanningData> }) => {
        const value = getValue()
        return <span className={`${isOutOfRange(value, row) ? "text-[#ED1B24]" : "text-[#464255]"}`}>
          {value ? (row.original?.parameter === "SG" ? formatNumberFourDecimalNom(value) : formatNumberThreeDecimal(value)) : ''}
        </span>
      },
      sortingFn: (a, b, columnId) => {
        const aVal = Number(a.getValue(columnId) ?? 0)
        const bVal = Number(b.getValue(columnId) ?? 0)
        return aVal === bVal ? 0 : aVal > bVal ? 1 : -1
      },
      sortDescFirst: false,
    },
    ...dayinWeek.map((day, index) => {
      return {
        accessorKey: day,
        header: () => {
          let dayName = ''
          if (typeof day !== 'string' || day.length === 0) {
            dayName = day; // Handle non-string or empty input
          }
          dayName = day.charAt(0).toUpperCase() + day.slice(1);

          const currentDate = dayjs(displayGasDayInTabWeekly).add(index, "day");
          let formattedDate = ''
          if (currentDate.isValid()) {
            formattedDate = currentDate.format("DD/MM/YYYY")
          }

          return (
            <div className={`${table_sort_header_style} text-center`}>
              <div>{dayName}</div>
              <div>{formattedDate}</div>
            </div>
          )
        },
        size: 120,
        cell: ({ getValue, row }: { getValue: () => any, row: Row<QualityPlanningData> }) => {
          const value = getValue()?.value
          return <span className={`${isOutOfRange(value, row) ? "text-[#ED1B24]" : "text-[#464255]"}`}>
            {value ? (row.original?.parameter === "SG" ? formatNumberFourDecimalNom(value) : formatNumberThreeDecimal(value)) : ''}
          </span>
        },
        sortingFn: (rowA: any, rowB: any, columnId: string) => {
          const valueA = rowA.original[columnId]?.value
          const valueB = rowB.original[columnId]?.value
          const numA = valueA ? Number(valueA) : Number.NaN
          const numB = valueB ? Number(valueB) : Number.NaN
          return numA - numB
        },
      }
    }),
  ];

  const [conditionColumns, setConditionColumns] = useState<
    Record<string, boolean>
  >({});

  // กำหนดการแสดง/ซ่อนคอลัมน์เริ่มต้น
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    'zone_name': true,
    'area_name': true,
    parameter: true,
  });

  // กำหนดคอลัมน์ทั้งหมดสำหรับการ export
  const initialColumns = [
    { key: 'gasday', label: 'Gas Day' },
    { key: 'zone_name', label: 'Zone' },
    { key: 'area_name', label: 'Area' },
    { key: 'parameter', label: 'Parameter' },
    { key: "valueBtuScf", label: "Value (BTU/SCF)", visible: true },
    ...Array.from({ length: 24 }, (_, i) => {
      const hour = i + 1;
      return {
        key: `h${hour}`,
        label: `H${hour} (${String(hour - 1).padStart(2, '0')}:01 - ${String(hour).padStart(2, '0')}:00)`,
      };
    }),
    { key: 'sunday', label: 'Sunday', visible: true },
    { key: 'monday', label: 'Monday', visible: true },
    { key: 'tuesday', label: 'Tuesday', visible: true },
    { key: 'wednesday', label: 'Wednesday', visible: true },
    { key: 'thursday', label: 'Thursday', visible: true },
    { key: 'friday', label: 'Friday', visible: true },
    { key: 'saturday', label: 'Saturday', visible: true },
  ];

  // การตรวจสอบสิทธิ์และการเข้าถึง
  const userDT = getUserValue();
  const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
  useRestrictedPage(token);
  const [userPermission, setUserPermission] = useState<any>();


  const getDefaultGasDayByTab = (tab: number) => {
    const now = dayjs().tz("Asia/Bangkok");

    // Intraday: วันนี้
    if (tab === 0) {
      return now.startOf("day").toDate();
    }

    // Daily: พรุ่งนี้
    if (tab === 1) {
      return now.add(1, "day").startOf("day").toDate();
    }

    // Weekly: วันอาทิตย์
    if (tab === 2) {
      const sunday =
        now.day() === 5 || now.day() === 6
          ? now.add(1, "week").day(0)
          : now.day(0);

      return sunday.startOf("day").toDate();
    }

    return now.startOf("day").toDate();
  };

  // โหลดข้อมูลสิทธิ์ผู้ใช้เมื่อเริ่มต้น
  useEffect(() => {
    const user_permission = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    if (user_permission) {
      try {
        const decryptedPermission = decryptData(user_permission);
        if (decryptedPermission) {
          const parsedPermission = JSON.parse(decryptedPermission);
          const updatedUserPermission = generateUserPermission(parsedPermission);
          setUserPermission(updatedUserPermission);

          // const permission = findRoleConfigByMenuName('Quality Planning', userDT)
          // setUserPermission(permission ? permission : updatedUserPermission);
        }
      } catch (error) {
        // Failed to parse user permissions
      }
    }
    // fetchData(0)
  }, []);

  useEffect(() => {
    const initialTab = 0;
    const initialDate = getDefaultGasDayByTab(initialTab);

    setTabIndex(initialTab);
    setDisplayGasDay(initialDate);
    setGasDay(initialDate);
    setDisplayGasDayInTabWeekly(initialDate);
    setConditionColumns({
      gasday: true,
      valueBtuScf: false,
    });
    setHourRange([1, 24]);

    brandNewFieldSearch(initialTab, initialDate);
  }, []);

  // กำหนดวันเริ่มต้นตาม tab ที่เลือก
  // useEffect(() => {
  //   const targetDate = defaultGasDay()
  //   setGasDay(targetDate)
  //   handleFieldSearch({ filterDate: targetDate, query: searchQuery })
  //   switch (tabIndex) {
  //     case 0:
  //       setConditionColumns({ gasday: true, valueBtuScf: false });
  //       setHourRange(getHourRange())
  //       break;
  //     case 1:
  //       setConditionColumns({ gasday: true, valueBtuScf: true });
  //       setHourRange(undefined)
  //       break;
  //     case 2:
  //       setConditionColumns({ gasday: false, valueBtuScf: false });
  //       setHourRange(undefined)
  //       break;
  //   }
  // }, [tabIndex]);
  // useEffect(() => {
  //   const targetDate = defaultGasDay()
  //   setGasDay(targetDate)
  //   handleFieldSearch({ filterDate: targetDate, query: searchQuery })

  //   // ...
  // }, [tabIndex]);

  // กำหนดวันเริ่มต้นตาม ชั่วโมง หรือ วันในสัปดาห์ ที่เลือก
  useEffect(() => {
    setHourRange(getHourRange())
  }, [subTabIndex])

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchData = async (tabIndex: any) => {
    try {
      setIsLoading(true);
      const response = await getService(`/master/quality-planning?gasDay=${dayjs().format("YYYY-MM-DD")}&tab=${tabIndex}`);

      let newData;
      switch (tabIndex) {
        case 0: // Intraday - แสดงข้อมูลรายชั่วโมงของวันนี้
          if (response?.intraday) {
            setResponseFromService(response)
          }
          // newData = response?.intraday || [];
          // if (newData.length > 0) {
          //   // const validData = newData.filter((item: QualityPlanningData) => item.gasday !== null && item.gasday !== undefined);
          //   // const filteredDataLast7 = filterLast7Days(validData, "gasday") || [];

          //   setData(newData);
          //   // setFilteredData(filteredDataLast7);
          handleFieldSearch({ filterDate: new Date() })
          // }
          break;
        case 1: // Daily - แสดงข้อมูลรายวันล่วงหน้า 7 วัน

          if (response?.newDaily) {
            setResponseFromService(response)
          }
          newData = response?.newDaily || [];

          if (gasDay) {
            const tomorrow = dayjs().add(1, "day").format("DD/MM/YYYY");
            const daysRange = Array.from({ length: 7 }, (_, i) =>
              dayjs(tomorrow, "DD/MM/YYYY")
                .add(i, "day")
                .format("DD/MM/YYYY")
            );
            const filteredData = newData.filter((item: QualityPlanningData) =>
              daysRange.includes(item.gasday)
            );

            // หน้า list วันที่ Gas Day ยังไม่เรียง มันต้องเรียง 22,23,24,25,26 https://app.clickup.com/t/86euy4vdu
            const sortedGasDay = [...filteredData].sort((a, b) => {
              const da = dayjs(a.gasday, "DD/MM/YYYY");
              const db = dayjs(b.gasday, "DD/MM/YYYY");
              return da.valueOf() - db.valueOf(); // น้อยไปมาก
            });

            // setData(filteredData);
            // setFilteredData(filteredData);
            // setFilteredDataCopycat(filteredData);

            // ยัด unit เข้า
            // row?.parameter === "SG" ? '' : 'BTU/SCF';
            // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
            // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
            const withUnit = sortedGasDay?.map((item: any) => ({
              ...item,
              unit: item.parameter == "SG" ? "" : "BTU/SCF"
            }));

            setData(withUnit);
            setFilteredData(withUnit);
            setFilteredDataCopycat(withUnit);
            setIsLoading(false);
          }

          break;
        case 2: // Weekly - แสดงข้อมูลรายสัปดาห์
          if (response?.newWeekly) {
            setResponseFromService(response)
          }

          // ยัด unit เข้า
          // row?.parameter === "SG" ? '' : 'BTU/SCF';
          // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
          // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
          const withUnit = response?.newWeekly?.map((item: any) => ({
            ...item,
            unit: item.parameter == "SG" ? "" : "BTU/SCF"
          }));


          // newData = response?.newWeekly || [];
          newData = withUnit || [];
          if (gasDay) {
            const sundayDate = getCurrentWeekSundayYyyyMmDd();
            const defaultDate = dayjs().format("YYYY-MM-DD");
            const sundayFormatted = dayjs(sundayDate || defaultDate, "YYYY-MM-DD").format("DD/MM/YYYY");
            const filteredData = (newData as WeeklyData[]).filter((item) =>
              item.sunday?.date === sundayFormatted
            );

            setData(filteredData);
            setFilteredData(filteredData);
            setFilteredDataCopycat(filteredData);
            setIsLoading(false);
          }
          break;
      }
    } catch (error) {
      // Error fetching data
      setResponseFromService(undefined)
      setData([]);
      setFilteredData([]);
      setFilteredDataCopycat([])
      setIsLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchData(tabIndex)
  // }, [tabIndex])

  // ฟังก์ชันสำหรับดึงช่วงเวลาตาม subTabIndex
  const getHourRange = (): [number, number] => {
    // switch (subTabIndex) {
    //   case 0: return [1, 6];    // 1-6 ชั่วโมง
    //   case 1: return [7, 12];   // 7-12 ชั่วโมง
    //   case 2: return [13, 18];  // 13-18 ชั่วโมง
    //   case 3: return [19, 24];  // 19-24 ชั่วโมง
    //   case 4: return [1, 24];   // ทั้งวัน
    //   default: return [1, 6];
    // }

    // Tab Intraday and Tab Daily : ย้ายแถบ All day มาอยู่แถบแรก และ Default แสดงแถบนี้ไว้ https://app.clickup.com/t/86etzcgyw
    switch (subTabIndex) {
      case 0: return [1, 24];   // ทั้งวัน
      case 1: return [1, 6];    // 1-6 ชั่วโมง
      case 2: return [7, 12];   // 7-12 ชั่วโมง
      case 3: return [13, 18];  // 13-18 ชั่วโมง
      case 4: return [19, 24];  // 19-24 ชั่วโมง
      default: return [1, 6];
    }
  };
  const [key, setKey] = useState(0);

  const defaultGasDay = () => {
    const now = new Date();
    if (tabIndex === 0) {
      // Intraday: วันนี้
      setDisplayGasDay(now);
      setKey((prevKey) => prevKey + 1);
      return now;
    } else if (tabIndex === 1) {
      // Daily: พรุ่งนี้
      const tomorrow = dayjs().add(1, 'day').toDate();
      setDisplayGasDay(tomorrow);
      setKey((prevKey) => prevKey + 1);
      return tomorrow;
    } else if (tabIndex === 2) {
      // Weekly: วันอาทิตย์ของสัปดาห์นี้
      const sundayDate = getCurrentWeekSundayYyyyMmDd();
      const defaultDate = dayjs().format("YYYY-MM-DD");

      let baseDate = dayjs(defaultDate); // ใช้วันนี้เป็นตัวตัดสิน
      const dayOfWeek = baseDate.day(); // 0 = อาทิตย์, 5 = ศุกร์, 6 = เสาร์

      let sunday;
      // ถ้าเป็น ศุกร์ (5) หรือ เสาร์ (6) → เอาอาทิตย์สัปดาห์หน้า
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        sunday = baseDate.add(1, 'week').day(0).toDate(); // ไปอาทิตย์สัปดาห์หน้า
      } else {
        sunday = dayjs(sundayDate || defaultDate, "YYYY-MM-DD").toDate()
      }


      setDisplayGasDay(sunday);
      setKey((prevKey) => prevKey + 1);
      return sunday;
    }

    return now;
  }

  const isOutOfRange = (value: any, row: any) => {
    //  // ..... zoneExit // https://app.clickup.com/t/86ev29x3t
    const parameter = row?.original.parameter || ''
    // const zoneMasterQuality = row?.original.zone?.zone_master_quality || []
    const zoneMasterQuality = row?.original.zoneExit?.zone_master_quality || []
    if (zoneMasterQuality && zoneMasterQuality.length > 0) {
      if (parameter === "HV") {
        const minHV = zoneMasterQuality[0]?.v2_sat_heating_value_min
        const maxHV = zoneMasterQuality[0]?.v2_sat_heating_value_max
        return value ? (
          value < minHV ||
          value > maxHV
        ) : false
      }

      if (parameter === "WI") {
        const minWI = zoneMasterQuality[0]?.v2_wobbe_index_min
        const maxWI = zoneMasterQuality[0]?.v2_wobbe_index_max
        return value ? (
          value < minWI ||
          value > maxWI
        ) : false
      }
    }
    return false
  }

  // ฟังก์ชันสำหรับค้นหาข้อมูล
  const handleSearch = (query: string, dataToFilter?: QualityPlanningData[]) => {

    // dataToFilter = filteredData
    dataToFilter = filteredDataCopycat
    if (!query) {
      setFilteredData(dataToFilter || data);
      setFilteredDataCopycat(dataToFilter || data);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    setSearchQuery(searchTerm);

    const keys: string[] = []
    for (let i = 1; i <= 24; i++) {
      const key = `h${i}`
      keys.push(key)
    }

    keys.push(...dayinWeek);

    // row?.parameter === "SG" ? '' : 'BTU/SCF';

    const filtered = (dataToFilter || data).filter((item) => {
      // const paramUnitMatch = searchTerm.includes('BTU') || searchTerm.includes('SCF')
      // const paramUnitMatch = (searchTerm.includes('btu') || searchTerm.includes('scf')) && item?.parameter?.toLowerCase() !== 'sg'; // SG = ไม่มี unit

      return (
        item?.gasday.toLowerCase().includes(searchTerm) ||
        item?.zone?.name.toLowerCase().includes(searchTerm) ||
        item?.area?.name.toLowerCase().includes(searchTerm) ||
        item?.parameter.toLowerCase().includes(searchTerm) ||

        item?.unit?.toLowerCase().includes(searchTerm) ||

        item?.valueBtuScf?.toString().toLowerCase().includes(searchTerm) ||
        (item?.parameter === "SG" ? formatNumberFourDecimalNom(item.valueBtuScf) : formatNumberThreeDecimal(item.valueBtuScf))?.toString().toLowerCase().includes(searchTerm) ||
        (item?.parameter === "SG" ? formatNumberFourDecimalNomNoComma(item.valueBtuScf) : formatNumberThreeDecimalNoComma(item.valueBtuScf))?.toString().toLowerCase().includes(searchTerm) ||
        keys.some(key => {
          const value = item[key as keyof QualityPlanningData];
          if (typeof value === 'object' && value !== null && 'value' in value) {
            // return value.value?.toString()?.toLowerCase()?.includes(searchTerm) || false;
            return (
              value.value?.toString()?.toLowerCase()?.includes(searchTerm) ||
              formatNumberThreeDecimal(value.value)?.toString()?.toLowerCase()?.includes(searchTerm) ||
              formatNumberThreeDecimalNoComma(value.value)?.toString()?.toLowerCase()?.includes(searchTerm) ||
              false
            );
          }
          // return value?.toString()?.toLowerCase()?.includes(searchTerm) || false;
          return (
            value?.toString()?.toLowerCase()?.includes(searchTerm) ||
            formatNumberThreeDecimal(value)?.toString()?.toLowerCase()?.includes(searchTerm) ||
            formatNumberThreeDecimalNoComma(value)?.toString()?.toLowerCase()?.includes(searchTerm) ||
            false
          );
        })
      );
    });
    if (!dataToFilter && gasDay) {
      handleFieldSearch({ filterDate: gasDay, dataToFilter: filtered });
    }
    else {
      setFilteredData(filtered);
    }
  };

  const handleFieldSearch = async (param?: { filterDate?: Date, query?: string, dataToFilter?: QualityPlanningData[] }) => {
    const gasDate: Date | undefined | null = param?.filterDate || gasDay
    setDisplayGasDayInTabWeekly(gasDate)
    let newData;
    if (param?.dataToFilter) {
      newData = param?.dataToFilter
    }
    else {
      switch (tabIndex) {
        case 0: // Intraday - แสดงข้อมูลรายชั่วโมงของวันนี้
          let sort_gas_day = responseFromService?.intraday.sort(
            (a: any, b: any) => dayjs(a.gasday, 'DD/MM/YYYY').valueOf() - dayjs(b.gasday, 'DD/MM/YYYY').valueOf()
          );

          newData = responseFromService?.intraday || data;
          // newData = sort_gas_day || data;
          break;
        case 1: // Daily - แสดงข้อมูลรายวันล่วงหน้า 7 วัน
          newData = responseFromService?.newDaily || data;


          break;
        case 2: // Weekly - แสดงข้อมูลรายสัปดาห์
          newData = responseFromService?.newWeekly || data;
          break;
      }
    }

    if (gasDate && tabIndex == 0) {
      setIsLoading(true);
      const response = await getService(`/master/quality-planning?gasDay=${dayjs(gasDate).format("YYYY-MM-DD")}&tab=${tabIndex}`);
      if (response?.intraday) {
        newData = response?.intraday;
      }
    }

    // Format the search date to DD/MM/YYYY
    const localDate = gasDate ? toDayjs(gasDate).format("DD/MM/YYYY") : toDayjs().format("DD/MM/YYYY");

    // เสิชย้อนหลัง 7 วัน tab intraday
    // เสิชเดินหน้า 7 วัน tab daily
    const daysRange = Array.from({ length: 7 }, (_, i) =>
      dayjs(localDate, "DD/MM/YYYY")
        .add(tabIndex === 1 || tabIndex === 2 ? i : -i, "day") // Add days for tabIndex = 1, subtract for others
        .format("DD/MM/YYYY")
    );

    // ของเดิมบีม
    // const result_2 = newData?.filter((item: any) => {
    //   return (
    //     (gasDate ? daysRange.includes(item?.gasday) : false) ||
    //     (gasDate ? localDate == item?.gasday : true)
    //   );
    // }).sort((a: any, b: any) => {
    //   return dayjs(b.gasday, "DD/MM/YYYY").diff(dayjs(a.gasday, "DD/MM/YYYY")); // เรียงวันที่
    // });

    const result_2 = newData?.filter((item: any) => {
      return (
        (gasDate ? daysRange.includes(item?.gasday) : false) ||
        (gasDate ? localDate == item?.gasday : true)
      );
    })

    const key = (s: string) => {
      const [d, m, y] = s.split('/').map(Number);
      return y * 1e4 + m * 1e2 + d; // YYYYMMDD เป็นตัวเลข
    };

    const sortedDesc = [...result_2].sort((a, b) => key(b.gasday) - key(a.gasday));

    if (param?.query) {
      // handleSearch(param.query, result_2)
      handleSearch(param.query, sortedDesc)
    }
    else {
      // setFilteredData(result_2);
      // setFilteredDataCopycat(result_2);
      setFilteredData(sortedDesc);
      setFilteredDataCopycat(sortedDesc);
    }
    if (gasDate && tabIndex == 0) {
      setIsLoading(false);
    }
  };

  // const handleReset = async () => {
  //   // when call handleReset set setSrchStartDate with current week Sunday date in this format ---> Sun Mar 16 2025 16:59:54 GMT+0700 (Indochina Time)
  //   const targetDate = defaultGasDay()
  //   setGasDay(targetDate)
  //   handleFieldSearch({ filterDate: targetDate, query: searchQuery })
  //   if (tabIndex !== 0) {
  //     setHourRange(undefined)
  //   } else {
  //     setHourRange(getHourRange())
  //   }
  // };

  const handleReset = async () => {
    const defaultDate = getDefaultGasDayByTab(tabIndex);

    setDisplayGasDay(defaultDate);
    setGasDay(defaultDate);
    setSearchQuery(undefined);
    setSubTabIndex(0);
    setKey(prev => prev + 1);

    if (tabIndex === 0) {
      setHourRange([1, 24]);
    } else {
      setHourRange(undefined);
    }

    await brandNewFieldSearch(tabIndex, defaultDate);
  };

  // ฟังก์ชันจัดการการคลิกปุ่ม show/hide columns
  const handleVisibilityClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleVisibilityClose = () => {
    setAnchorEl(null);
  };

  // ฟังก์ชันจัดการการแสดง/ซ่อนคอลัมน์
  const handleColumnVisibilityChange = (newVisibility: Record<string, boolean>) => {
    setColumnVisibility(newVisibility);
  };

  // ===================== อยากจะทำเสิชใหม่มาก ๆ =====================
  // const brandNewFieldSearch = async (tabIndex_?:any) => {
  //   try {
  //     const tabIndexUse = tabIndex_ ? tabIndex_ : tabIndex
  //     setIsLoading(true);
      
  //     let url = `/master/quality-planning?tab=${tabIndexUse ?? 0}`;
  //     if (displayGasDay) {
  //       if(tabIndex_){
  //         if(tabIndex_ === 2){
  //           url += `&gasDay=${(dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0).format("YYYY-MM-DD") : dayjs().day(0).format("YYYY-MM-DD"))}`;
  //         }else{
  //           console.log(`___ : `, (dayjs().day() === 5 || dayjs().day() === 6 ? dayjs().add(1, 'week').day(0).format("YYYY-MM-DD") : dayjs().day(0).format("YYYY-MM-DD")));
  //           url += `&gasDay=${dayjs().add(1, "day").format("YYYY-MM-DD")}`;

  //         }
  //       }else{
  //         url += `&gasDay=${dayjs(displayGasDay).format("YYYY-MM-DD")}`;
  //       }
  //       setDisplayGasDayInTabWeekly(displayGasDay)
  //     }
  //     console.log('url _ : ', url);
  //     let newData: any[] = [];
  //     switch (tabIndexUse) {
  //       case 0: // Intraday - แสดงข้อมูลรายชั่วโมงของวันนี้
  //         // if (response?.intraday) {
  //         //   setResponseFromService(response)
  //         // }
  //         // newData = response?.intraday || [];
  //         // if (newData.length > 0) {
  //         //   setData(newData);
  //         //   // setFilteredData(filteredDataLast7);
  //         if (displayGasDay) {
  //           handleFieldSearch({ filterDate: displayGasDay })
  //         }
  //         else {
  //           handleFieldSearch({ filterDate: new Date() })
  //         }
  //         // }
  //         break;
  //       case 1: // Daily - แสดงข้อมูลรายวันล่วงหน้า 7 วัน
  //         const response = await getService(url);
  //         if (response?.newDaily) {
  //           setResponseFromService(response)
  //         }
  //         newData = response?.newDaily || [];

  //         const gasDayBro = dayjs(displayGasDay).format("DD/MM/YYYY");
  //         const daysRange = Array.from({ length: 7 }, (_, i) => dayjs(gasDayBro, "DD/MM/YYYY").add(i, "day").format("DD/MM/YYYY"));
  //         const filteredData = newData?.filter((item: QualityPlanningData) => daysRange.includes(item.gasday));

  //         // หน้า list วันที่ Gas Day ยังไม่เรียง มันต้องเรียง 22,23,24,25,26 https://app.clickup.com/t/86euy4vdu
  //         const sortedGasDay = [...filteredData].sort((a, b) => {
  //           const da = dayjs(a.gasday, "DD/MM/YYYY");
  //           const db = dayjs(b.gasday, "DD/MM/YYYY");
  //           return da.valueOf() - db.valueOf(); // น้อยไปมาก
  //         });

  //         // ยัด unit เข้า
  //         // row?.parameter === "SG" ? '' : 'BTU/SCF';
  //         // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
  //         // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
  //         const withUnit = sortedGasDay?.map((item: any) => ({
  //           ...item,
  //           unit: item.parameter == "SG" ? "" : "BTU/SCF"
  //         }));

  //         setData(withUnit);
  //         setFilteredData(withUnit);
  //         setFilteredDataCopycat(withUnit);
  //         setIsLoading(false);
  //         break;
  //       case 2: // Weekly - แสดงข้อมูลรายสัปดาห์
  //         const response2 = await getService(url);
  //         if (response2?.newWeekly) {
  //           setResponseFromService(response2)
  //         }

  //         // ยัด unit เข้า
  //         // row?.parameter === "SG" ? '' : 'BTU/SCF';
  //         // ถ้าเจอ parameter ที่ไม่ใช่ SG เพิ่มคีย์ "unit" แล้ว value คือ 'BTU/SCF'
  //         // ถ้าไม่ใช่ เพิ่มคีย์ unit แล้ว value เป็น ''
  //         const withUnit2 = response2?.newWeekly?.map((item: any) => ({
  //           ...item,
  //           unit: item.parameter == "SG" ? "" : "BTU/SCF"
  //         }));

  //         // newData = response?.newWeekly || [];
  //         newData = withUnit2 || [];
  //         console.log('gasDay : ', gasDay);
  //         console.log('newData : ', newData);
  //         // if (gasDay) {
  //         //   // const sundayDate = getCurrentWeekSundayYyyyMmDd();
  //         //   // const defaultDate = dayjs().format("YYYY-MM-DD");
  //         //   // const gasDayBro = dayjs(displayGasDay);
  //         //   // const sundayFormatted = dayjs(sundayDate || defaultDate, "YYYY-MM-DD").format("DD/MM/YYYY");
  //         //   // const filteredData = (newData as WeeklyData[]).filter((item) =>
  //         //   //   item.sunday?.date === ((displayGasDay && gasDayBro.isValid()) ? gasDayBro.format("DD/MM/YYYY") : sundayFormatted)
  //         //   // );

  //         // }
  //         setData(newData);
  //         setFilteredData(newData);
  //         setFilteredDataCopycat(newData);
  //         setIsLoading(false);
  //         break;
  //     }
  //   } catch (error) {
  //     // Error fetching data
  //     setResponseFromService(undefined)
  //     setData([]);
  //     setFilteredData([]);
  //     setFilteredDataCopycat([])
  //     setIsLoading(false);
  //   }
  // }
  // ===============================================================

  const setCurrentDataByTab = (
    currentTab: number,
    selectedDate: Date
  ) => {
    setDisplayGasDayInTabWeekly(selectedDate);

    if (currentTab === 0) {
      setConditionColumns({
        gasday: true,
        valueBtuScf: false,
      });

      setHourRange(getHourRange());
      return;
    }

    if (currentTab === 1) {
      setConditionColumns({
        gasday: true,
        valueBtuScf: true,
      });

      setHourRange(undefined);
      return;
    }

    setConditionColumns({
      gasday: false,
      valueBtuScf: false,
    });

    setHourRange(undefined);
  };

  const brandNewFieldSearch = async (
    tabValue: number = tabIndex,
    dateValue?: Date | null
  ) => {
    try {
      setIsLoading(true);

      const tabIndexUse = tabValue ?? tabIndex;

      const selectedDate =
        dateValue ??
        displayGasDay ??
        getDefaultGasDayByTab(tabIndexUse);

      const gasDayParam =
        tabIndexUse === 2
          ? dayjs(selectedDate)
              .startOf("week")
              .format("YYYY-MM-DD")
          : dayjs(selectedDate)
              .tz("Asia/Bangkok")
              .format("YYYY-MM-DD");

      const url =
        `/master/quality-planning` +
        `?gasDay=${gasDayParam}` +
        `&tab=${tabIndexUse}`;

      console.log("quality planning request:", {
        tabIndexUse,
        selectedDate,
        gasDayParam,
        url,
      });

      const response = await getService(url);

      setResponseFromService(response);
      setDisplayGasDayInTabWeekly(selectedDate);

      let newData: any[] = [];

      if (tabIndexUse === 0) {
        newData = response?.intraday ?? [];

        // Intraday เอาเฉพาะวันที่ที่เลือก
        const localDate = dayjs(selectedDate).format("DD/MM/YYYY");

        newData = newData.filter(
          (item: QualityPlanningData) =>
            item?.gasday === localDate
        );
      }

      if (tabIndexUse === 1) {
        newData = response?.newDaily ?? [];

        const startDate = dayjs(selectedDate);

        const daysRange = Array.from({ length: 7 }, (_, index) =>
          startDate.add(index, "day").format("DD/MM/YYYY")
        );

        newData = newData
          .filter((item: QualityPlanningData) =>
            daysRange.includes(item?.gasday)
          )
          .sort((a: QualityPlanningData, b: QualityPlanningData) => {
            return (
              dayjs(a.gasday, "DD/MM/YYYY").valueOf() -
              dayjs(b.gasday, "DD/MM/YYYY").valueOf()
            );
          });
      }

      if (tabIndexUse === 2) {
        newData = response?.newWeekly ?? [];
      }

      const withUnit = newData.map((item: any) => ({
        ...item,
        unit: item?.parameter === "SG" ? "" : "BTU/SCF",
      }));

      setData(withUnit);
      setFilteredData(withUnit);
      setFilteredDataCopycat(withUnit);
      setCurrentDataByTab(tabIndexUse, selectedDate);

    } catch (error) {
      console.error("Quality Planning API error:", error);

      setResponseFromService(undefined);
      setData([]);
      setFilteredData([]);
      setFilteredDataCopycat([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = async (newTab: number) => {
    const newDefaultDate = getDefaultGasDayByTab(newTab);

    setTabIndex(newTab);
    setDisplayGasDay(newDefaultDate);
    setGasDay(newDefaultDate);
    setSearchQuery(undefined);
    setSubTabIndex(0);

    // ทำให้ DatePicker render วันที่ใหม่
    setKey(prev => prev + 1);

    await brandNewFieldSearch(newTab, newDefaultDate);
  };

  return (
    <div className="space-y-2">
      
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl  flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

          {/* Tab Weekly : Filter Gas Week Default Sunday of current week https://app.clickup.com/t/86erz1k4v */}
          <DatePickaSearch
            // key="gas-day-picker"
            key={"gas-day-picker" + key}
            label={(tabIndex == 0 || tabIndex == 1) ? "Gas Day" : "Gas Week"}
            modeSearch={(tabIndex == 0 || tabIndex == 1) ? "xx" : "sunday"}
            placeHolder={(tabIndex == 0 || tabIndex == 1) ? "Select Gas Day" : "Select Gas Week"}
            allowClear
            // isGasWeek={dashboardObj ? false : tabIndex == 2 ? true : false}
            // isGasDay={dashboardObj ? false : tabIndex == 1 ? true : false}
            // isFixDay={dashboardObj ? true : false}
            dateToFix={displayGasDay}
            isFixDay={!!displayGasDay}
            isDefaultTomorrow={tabIndex == 1 ? true : false}
            // isGasDay={tabIndex == 1 || tabIndex == 0 ? true : false}
            // isToday={tabIndex == 0 ? true : false}
            onChange={(date: any) => setDisplayGasDay(date)}
          />


          {/* <BtnSearch handleFieldSearch={() => {
            if (displayGasDay) {
              setGasDay(displayGasDay)
              handleFieldSearch({ filterDate: displayGasDay, query: searchQuery })
            }
          }}/> */}


          {/* <BtnSearch handleFieldSearch={() => brandNewFieldSearch()} /> */}
          <BtnSearch
            handleFieldSearch={() =>
              brandNewFieldSearch(
                tabIndex,
                displayGasDay ?? getDefaultGasDayByTab(tabIndex)
              )
            }
          />
          <BtnReset handleReset={handleReset} />
        </aside>
        <aside className="mt-auto ml-1 w-full sm:w-auto">
        </aside>
      </div>
      <>
        {
          isLoading && 
          <div className="absolute w-full h-full z-[10] pt-[150px]">
            <Spinloading2 spin={isLoading} rounded={20} />
          </div>
        }
        {/* แท็บหลัก */}
        {/* <QualityPlanningTabs
          tabIndex={tabIndex}
          // onTabChange={setTabIndex}
          onTabChange={(e:any)=>{
            setTabIndex(e)
            brandNewFieldSearch(e)
          }}
        /> */}
        <QualityPlanningTabs
          tabIndex={tabIndex}
          onTabChange={handleTabChange}
        />
      

        {/* ส่วนเนื้อหาหลัก */}
        <div className="border-[#DFE4EA] border-[1px] p-4 rounded-tl-none rounded-xl shadow-sm">
          <div className=" text-sm flex flex-wrap items-center justify-between pb-4">
            <div className="flex items-center space-x-4">
              <div onClick={handleVisibilityClick}>
                <Tune
                  className="cursor-pointer rounded-lg"
                  style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                />
              </div>

              {tabIndex === 0 && (
                <HourRangeTabs
                  subTabIndex={subTabIndex}
                  onSubTabChange={setSubTabIndex}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <SearchInput onSearch={handleSearch} />

              <BtnExport
                textRender={"Export"}
                specificMenu={'quality-planning'}
                data={filteredData}
                type={tabIndex === 1 ? 1 : tabIndex === 2 ? 2 : 3}
                path="nomination/quality-planning"
                gasDay={displayGasDay ?? gasDay}
                can_export={userPermission ? userPermission?.f_export : false}
                columnVisibility={columnVisibility}
                initialColumns={initialColumns}
              />

            </div>
          </div>

          {/* ตารางแสดงข้อมูล */}
          <GeneralTable
            // data={sortByZoneAndAreaName(filteredData)}
            data={filteredData}
            columns={columns}
            anchorEl={anchorEl}
            isShowDayInWeek={tabIndex === 2}
            hourRange={hourRange}
            conditionColumns={conditionColumns}
            mainColumns={['zone_name', 'area_name', 'parameter']}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onHandleVisibilityClose={handleVisibilityClose}
            isLoading={isLoading}
          />
        </div>
      </>
    </div>
  );
}