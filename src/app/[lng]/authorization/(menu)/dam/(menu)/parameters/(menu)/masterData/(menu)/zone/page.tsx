"use client";
import React, { useMemo, useRef } from "react";
/* @ts-ignore */
import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatTime, generateUserPermission, getContrastTextColor, nanToNullDeep, parseObjToFloat } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import ModalAction from "./form/modalAction";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import BtnActionTable from "@/components/other/btnActionInTable";
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
  // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

      const permission = findRoleConfigByMenuName('Zone', userDT)
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
  const { entryExitMaster, zoneMaster } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchZoneMasterSlice());
    }
    if (forceRefetch) {
      setForceRefetch(false);
    }
    getPermission();
  }, [dispatch, zoneMaster, forceRefetch]);


  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [dataExport, setDataExport] = useState<any>([]);
  // const [srchId, setSrchId] = useState('');
  // const [srchName, setSrchName] = useState('');
  const [srchEntryExit, setSrchEntryExit] = useState<any>([]);
  const [srchZone, setSrchZone] = useState('');
  const [srchName, setSrchName] = useState('');
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
  const [key, setKey] = useState(0);

  const handleFieldSearch = () => {
    // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
    const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed

    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        // (srchEntryExit ? item?.entry_exit_id && item?.entry_exit_id.toString().toLowerCase().includes(srchEntryExit.toLowerCase()) : true) &&
        // (srchEntryExit ? item?.entry_exit_id && item?.entry_exit_id.toString().toLowerCase().includes(srchEntryExit.toLowerCase()) : true) &&
        (srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit_id?.toString()) : true) && // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr

        // (srchZone ? item?.name === srchZone : true) &&
        (srchZone ? item?.name?.toLowerCase().includes(srchZone.toLowerCase()) : true) &&
        (srchName ? item?.description?.toLowerCase().includes(srchName.toLowerCase()) : true)
      );
    });

    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    // setSrchEntryExit('')
    setSrchEntryExit([])
    setSrchZone('')
    setSrchName('');
    setSrchStartDate(null);
    setSrchEndDate(null);
    // setFilteredDataTable(dataTable);
    setFilteredDataTable(filterActiveByCurrentDate(dataTable));
    setCurrentPage(1);
    setKey((prevKey) => prevKey + 1);
  };


  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {

    const filtered = dataTable?.filter(
      (item: any) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        return (
          item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
          formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower) ||
          item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
          item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

          formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
          formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
          formatTime(item?.create_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
          formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||

          item?.entry_exit?.name?.toLowerCase().includes(queryLower) ||
          item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
        )
      }
    );
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(filtered);
  };

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // false ตอนนี้เป็น load (จริงๆควรให้ true เป็น load นะ)
  const [resetForm, setResetForm] = useState<() => void | null>();
  const [dataZoneMasterZ, setDataZoneMasterZ] = useState<any>([]);

  const filterActiveByCurrentDate = (data: any[] = []) => {
    const now = new Date();

    return data.filter((item: any) => {
      if (!item?.start_date) return false;

      const startDate = new Date(item.start_date);
      const endDate = item?.end_date
        ? new Date(item.end_date)
        : null;

      // ป้องกันข้อมูลวันที่ไม่ถูกต้อง
      if (Number.isNaN(startDate.getTime())) return false;
      if (endDate && Number.isNaN(endDate.getTime())) return false;

      const hasStarted = startDate.getTime() <= now.getTime();
      const hasNotEnded =
        endDate === null || endDate.getTime() >= now.getTime();

      return hasStarted && hasNotEnded;
    });
  };

  const fetchData = async () => {
    try {
      setIsLoading(false);

      const response: any = await getService(`/master/asset/zone`);

      const allData = Array.isArray(response)
        ? [...response].reverse()
        : [];

      // ข้อมูลทั้งหมด เอาไว้ใช้ตอนค้นหา/กรอง
      setData(allData);

      // ตอนเปิดหน้าครั้งแรก แสดงเฉพาะข้อมูลที่ Active ตามช่วงวันที่
      const activeData = filterActiveByCurrentDate(allData);
      setFilteredDataTable(activeData);

      // DATA ZONE แบบไม่ซ้ำ
      const dataZoneDeDup = Array.from(
        new Map(
          allData.map((item: any) => [
            item.name,
            { zone_name: item.name },
          ])
        ).values()
      );

      setDataZoneMasterZ(dataZoneDeDup);
    } catch (err) {
      console.error("Fetch zone error:", err);
      setData([]);
      setFilteredDataTable([]);
    } finally {
      setIsLoading(true);
    }
  };
  useEffect(() => {
    fetchData();
  }, [resetForm]);

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const handleCloseModal = () => setModalSuccessOpen(false);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);

  const fdInterface: any = {
    name: '',
    zone_id: '',
    description: '',
    entry_exit_id: '',
    // start_date: new Date(),
    // end_date: new Date(),
    start_date: undefined,
    end_date: undefined,
    color: '',

    v2_wobbe_index_min: null,
    v2_wobbe_index_max: null,
    v2_methane_min: null,
    v2_methane_max: null,
    v2_oxygen_min: null,
    v2_oxygen_max: null,
    v2_carbon_dioxide_nitrogen_min: null,
    v2_carbon_dioxide_nitrogen_max: null,
    v2_total_sulphur_min: null,
    v2_total_sulphur_max: null,
    v2_hydrocarbon_dew_min: null,
    v2_hydrocarbon_dew_max: null,
    v2_sat_heating_value_min: null,
    v2_sat_heating_value_max: null,
    v2_c2_plus_min: null,
    v2_c2_plus_max: null,
    v2_nitrogen_min: null,
    v2_nitrogen_max: null,
    v2_carbon_dioxide_min: null,
    v2_carbon_dioxide_max: null,
    v2_hydrogen_sulfide_min: null,
    v2_hydrogen_sulfide_max: null,
    v2_mercury_min: null,
    v2_mercury_max: null,
    v2_moisture_min: null,
    v2_moisture_max: null,
  };
  const [formData, setFormData] = useState(fdInterface);

  const handleFormSubmit = async (data: any) => {
    // const newData = replaceEmptyStringsWithNull(data)
    const { name, description, entry_exit_id, start_date, end_date, color, ...quality } = data
    if (typeof data.end_date !== 'string' || data.end_date == "Invalid Date") {
      data.end_date = null;
    }

    const dataCreate = {
      name: name.toUpperCase(),
      description: description,
      entry_exit_id: entry_exit_id,
      start_date: start_date,
      end_date: data.end_date,
      color: color
    }
    const { zone_id, ...newQuality } = quality;
    let dataQuality = parseObjToFloat(newQuality);
    const qualityClean = nanToNullDeep(dataQuality)

    switch (formMode) {
      case "create":
        const res = await postService('/master/asset/zone-master-create', dataCreate);
        const statusCode = res?.response?.data?.statusCode ?? res?.response?.data?.status ?? res?.status ?? res?.statusCode ?? res?.code ?? res?.response?.status;
        const errorMsg = res?.response?.data?.error ?? res?.data?.error ?? res?.response?.error ?? res?.error;

        if (statusCode === 400 || statusCode === 500) {
          setFormOpen(false);
          setModalErrorMsg(errorMsg || '');
          setModalErrorOpen(true)
        } else {
          delete qualityClean.supply_reference_quality_area
          // ค่อยเอา res.id มาอัพ quality
          await putService(`/master/asset/zone-master-quality-update/${res.id}`, qualityClean);
          setFormOpen(false);
          setModalSuccessOpen(true);
        }

        break;
      case "edit":
        const res_edit = await putService(`/master/asset/zone-master-update/${selectedId}`, dataCreate);
        if (res_edit?.response?.data?.status === 400) {
          setFormOpen(false);
          setModalErrorMsg(res_edit?.response?.data?.error);
          setModalErrorOpen(true)
        } else {
          // ค่อยเอา res_edit.id มาอัพ quality
          await putService(`/master/asset/zone-master-quality-update/${selectedId}`, qualityClean);
          setFormOpen(false);
          setModalSuccessOpen(true);
        }

        break;
    }

    await fetchData();
    if (resetForm) resetForm(); // reset form
  };

  const openCreateForm = () => {
    setFormMode('create');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openEditForm = (id: any) => {
    setSelectedId(id);
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {

      fdInterface.id = filteredData.id;
      fdInterface.name = filteredData.name;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.color = filteredData.color;

      fdInterface.v2_wobbe_index_min = filteredData?.zone_master_quality[0]?.v2_wobbe_index_min;
      fdInterface.v2_wobbe_index_max = filteredData?.zone_master_quality[0]?.v2_wobbe_index_max;

      fdInterface.v2_methane_min = filteredData?.zone_master_quality[0]?.v2_methane_min;
      fdInterface.v2_methane_max = filteredData?.zone_master_quality[0]?.v2_methane_max;

      fdInterface.v2_oxygen_min = filteredData?.zone_master_quality[0]?.v2_oxygen_min;
      fdInterface.v2_oxygen_max = filteredData?.zone_master_quality[0]?.v2_oxygen_max;

      fdInterface.v2_carbon_dioxide_nitrogen_min = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_nitrogen_min;
      fdInterface.v2_carbon_dioxide_nitrogen_max = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_nitrogen_max;

      fdInterface.v2_total_sulphur_min = filteredData?.zone_master_quality[0]?.v2_total_sulphur_min;
      fdInterface.v2_total_sulphur_max = filteredData?.zone_master_quality[0]?.v2_total_sulphur_max;

      fdInterface.v2_hydrocarbon_dew_min = filteredData?.zone_master_quality[0]?.v2_hydrocarbon_dew_min;
      fdInterface.v2_hydrocarbon_dew_max = filteredData?.zone_master_quality[0]?.v2_hydrocarbon_dew_max;

      fdInterface.v2_sat_heating_value_min = filteredData?.zone_master_quality[0]?.v2_sat_heating_value_min;
      fdInterface.v2_sat_heating_value_max = filteredData?.zone_master_quality[0]?.v2_sat_heating_value_max;

      fdInterface.v2_c2_plus_min = filteredData?.zone_master_quality[0]?.v2_c2_plus_min;
      fdInterface.v2_c2_plus_max = filteredData?.zone_master_quality[0]?.v2_c2_plus_max;

      fdInterface.v2_nitrogen_min = filteredData?.zone_master_quality[0]?.v2_nitrogen_min;
      fdInterface.v2_nitrogen_max = filteredData?.zone_master_quality[0]?.v2_nitrogen_max;

      fdInterface.v2_carbon_dioxide_min = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_min;
      fdInterface.v2_carbon_dioxide_max = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_max;

      fdInterface.v2_hydrogen_sulfide_min = filteredData?.zone_master_quality[0]?.v2_hydrogen_sulfide_min;
      fdInterface.v2_hydrogen_sulfide_max = filteredData?.zone_master_quality[0]?.v2_hydrogen_sulfide_max;

      fdInterface.v2_mercury_min = filteredData?.zone_master_quality[0]?.v2_mercury_min;
      fdInterface.v2_mercury_max = filteredData?.zone_master_quality[0]?.v2_mercury_max;

      fdInterface.v2_moisture_min = filteredData?.zone_master_quality[0]?.v2_moisture_min;
      fdInterface.v2_moisture_max = filteredData?.zone_master_quality[0]?.v2_moisture_max;

    }
    setFormMode('edit');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openViewForm = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id);

    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.name = filteredData.name;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.color = filteredData.color;

      fdInterface.v2_wobbe_index_min = filteredData?.zone_master_quality[0]?.v2_wobbe_index_min;
      fdInterface.v2_wobbe_index_max = filteredData?.zone_master_quality[0]?.v2_wobbe_index_max;

      fdInterface.v2_methane_min = filteredData?.zone_master_quality[0]?.v2_methane_min;
      fdInterface.v2_methane_max = filteredData?.zone_master_quality[0]?.v2_methane_max;

      fdInterface.v2_oxygen_min = filteredData?.zone_master_quality[0]?.v2_oxygen_min;
      fdInterface.v2_oxygen_max = filteredData?.zone_master_quality[0]?.v2_oxygen_max;

      fdInterface.v2_carbon_dioxide_nitrogen_min = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_nitrogen_min;
      fdInterface.v2_carbon_dioxide_nitrogen_max = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_nitrogen_max;

      fdInterface.v2_total_sulphur_min = filteredData?.zone_master_quality[0]?.v2_total_sulphur_min;
      fdInterface.v2_total_sulphur_max = filteredData?.zone_master_quality[0]?.v2_total_sulphur_max;

      fdInterface.v2_hydrocarbon_dew_min = filteredData?.zone_master_quality[0]?.v2_hydrocarbon_dew_min;
      fdInterface.v2_hydrocarbon_dew_max = filteredData?.zone_master_quality[0]?.v2_hydrocarbon_dew_max;

      fdInterface.v2_sat_heating_value_min = filteredData?.zone_master_quality[0]?.v2_sat_heating_value_min;
      fdInterface.v2_sat_heating_value_max = filteredData?.zone_master_quality[0]?.v2_sat_heating_value_max;

      fdInterface.v2_c2_plus_min = filteredData?.zone_master_quality[0]?.v2_c2_plus_min;
      fdInterface.v2_c2_plus_max = filteredData?.zone_master_quality[0]?.v2_c2_plus_max;

      fdInterface.v2_nitrogen_min = filteredData?.zone_master_quality[0]?.v2_nitrogen_min;
      fdInterface.v2_nitrogen_max = filteredData?.zone_master_quality[0]?.v2_nitrogen_max;

      fdInterface.v2_carbon_dioxide_min = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_min;
      fdInterface.v2_carbon_dioxide_max = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_max;

      fdInterface.v2_hydrogen_sulfide_min = filteredData?.zone_master_quality[0]?.v2_hydrogen_sulfide_min;
      fdInterface.v2_hydrogen_sulfide_max = filteredData?.zone_master_quality[0]?.v2_hydrogen_sulfide_max;

      fdInterface.v2_mercury_min = filteredData?.zone_master_quality[0]?.v2_mercury_min;
      fdInterface.v2_mercury_max = filteredData?.zone_master_quality[0]?.v2_mercury_max;

      fdInterface.v2_moisture_min = filteredData?.zone_master_quality[0]?.v2_moisture_min;
      fdInterface.v2_moisture_max = filteredData?.zone_master_quality[0]?.v2_moisture_max;

    }
    setFormMode('view');
    setFormData(fdInterface);
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
      const response: any = await getService(`/master/account-manage/history?type=zone&method=all&id_value=${id}`);

      const valuesArray = response.map((item: any) => item.value);

      let mappings = [
        { key: "entry_exit.name", title: "Entry/Exit" },
        { key: "name", title: "Zone Name" },
        { key: "description", title: "Description" },
      ];
      let result = mappings.map(({ key, title }) => {

        const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
        // const isIsoString = typeof value === 'string' && !isNaN(Date.parse(value));

        return {
          title,
          value: value || "",
          // value: isIsoString ? formatDateNoTime(value) : value || "",

        };
      });

      const normalized = fillMissingUpdateByAccount(valuesArray);

      setHeadData(result)
      // setHistoryData(valuesArray);
      setHistoryData(normalized);
      setHistoryOpen(true);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  }

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

  // const paginatedData = filteredDataTable?.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );
  const paginatedData = Array.isArray(filteredDataTable)
    ? filteredDataTable.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'entry_exit', label: 'Entry / Exit', visible: true },
    { key: 'name', label: 'Zone Name', visible: true },
    { key: 'desc', label: 'Description', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'create_by', label: 'Created by', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'entry_exit', label: 'Entry / Exit', visible: true },
    { key: 'zone_name', label: 'Zone Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'created_by', label: 'Created by', visible: true },
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

  const handleColumnToggle = (columnKey: string | VisibilityState) => {
    if (typeof columnKey === 'string') {
      // Handle string case - single column toggle
      setColumnVisibility((prev: any) => ({
        ...prev,
        [columnKey]: !prev[columnKey]
      }));
    } else if (typeof columnKey === 'object' && columnKey !== null) {
      // Handle VisibilityState object case - bulk column visibility update
      setColumnVisibility((prev: any) => ({
        ...prev,
        ...columnKey
      }));
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "entry_exit",
        header: "Entry / Exit",
        enableSorting: true,
        accessorFn: (row: any) => row?.entry_exit?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>
                {row?.entry_exit?.name}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "name",
        header: "Zone Name",
        enableSorting: true,
        accessorFn: (row: any) => row?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              <div
                className="flex w-[140px] justify-center rounded-full p-1"
                style={{
                  backgroundColor: row?.color,
                  color: getContrastTextColor(row?.color), // Dynamic text color
                }}
              >
                {`${row?.name}`}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "desc",
        header: "Description",
        enableSorting: true,
        accessorFn: (row: any) => row?.description || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.description}</div>
          )
        }
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.start_date) || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#464255]`}>{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</div>
          )
        }
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.end_date) || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#0DA2A2]`}>{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</div>
          )
        }
      },
      {
        accessorKey: "create_by",
        header: "Created by",
        width: 250,
        enableSorting: true,
        accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.create_date ? formatDate(row?.create_date) : ''}`,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>
              <span className={`text-[#464255]`}>{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
              <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
            </div>
          )
        }
      },
      {
        accessorKey: "action",
        id: 'actions',
        header: "Action",
        align: 'center',
        enableSorting: false,
        size: 100,
        cell: (info) => {
          const row: any = info?.row?.original;
          const getPermission: any = renderPermission();
          return (
            <BtnActionTable
              togglePopover={togglePopover}
              row_id={row?.id}
              disable={getPermission?.f_view == true ? false : true}
            />
          )
        }
      },
    ], []
  );

  const [tk, settk] = useState(false);

  const togglePopover = (id: any, anchor: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null); // Close the popover if it's already open
      setAnchorPopover(null)
    } else {
      setOpenPopoverId(id); // Open the popover for the clicked row
      if (anchor) {
        setAnchorPopover(anchor)
      }
      else {
        setAnchorPopover(null)
      }
    }

    settk(!tk)
  };


  const [openPopoverId, setOpenPopoverId] = useState(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);

  const renderPermission: any = () => {
    let permission: any = undefined;
    try {
      // const updatedUserPermission = generateUserPermission(user_permission);
      // permission = updatedUserPermission;
      permission = findRoleConfigByMenuName('Zone', userDT)

    } catch (error) {
      // Failed to parse user_permission:
    }

    return permission
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
      setOpenPopoverId(null);
      setAnchorPopover(null)
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);

  const getRowdata: any = (id: any) => {
    const findData: any = dataTable?.find((item: any) => item?.id == id);
    return findData
  }

  const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case "view":
        openViewForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null);
        break;
      case "edit":
        openEditForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null);
        break;
      case "history":
        openHistoryForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null);
        break;
    }
  }

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          <InputSearch
            id="searchEntryExit"
            label="Entry/Exit"
            // type="select"
            type="select-multi-checkbox"
            value={srchEntryExit}
            onChange={(e) => setSrchEntryExit(e.target.value)}
            options={entryExitMaster?.data?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
          />

          {/* <InputSearch
            id="searchZoneMaster"
            label="Zone Name"
            type="select"
            value={srchZone}
            onChange={(e) => {
              setSrchZone(e.target.value)
            }}
            options={dataZoneMasterZ?.map((item: any) => ({
              value: item.zone_name,
              label: item.zone_name
            }))}
          /> */}

          {/* v2.0.98 Filter Zone ปรับให้เป็น Search https://app.clickup.com/t/86euzxxhc */}
          <InputSearch
            id="searchZoneMasterText"
            label="Zone Name"
            value={srchZone}
            onChange={(e) => setSrchZone(e.target.value)}
            placeholder="Search Zone"
          />

          <InputSearch
            id="searchName"
            label="Description"
            value={srchName}
            onChange={(e) => setSrchName(e.target.value)}
            placeholder="Search Description"
          />

          <DatePickaSearch
            key={"start" + key}
            label="Start Date"
            placeHolder="Select Start Date"
            allowClear
            onChange={(e: any) => setSrchStartDate(e ? e : null)}
          />

          <DatePickaSearch
            key={"end" + key}
            label="End Date"
            placeHolder="Select End Date"
            allowClear
            onChange={(e: any) => setSrchEndDate(e ? e : null)}
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

      {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
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
              <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/zone" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
            </div>
          </div>
        </div>

        <TableZone
          openEditForm={openEditForm}
          openViewForm={openViewForm}
          openHistoryForm={openHistoryForm}
          // tableData={filteredDataTable}
          tableData={paginatedData}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
          userPermission={userPermission}
        />

      </div> */}

      {/* <PaginationComponent
        totalItems={filteredDataTable?.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      /> */}

      {/* ================== NEW TABLE ==================*/}
      <AppTable
        data={filteredDataTable}
        columns={columns}
        isLoading={isLoading}
        exportBtn={
          <BtnExport
            textRender={"Export"}
            data={dataExport}
            path="dam/zone"
            can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns}
          />
        }
        initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
        onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
        onFilteredDataChange={(filteredData: any) => {
          const newData = filteredData || [];
          // Check if the filtered data is different from current dataExport
          if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
            setDataExport(newData);
          }
        }}
      />

      <ModalAction
        mode={formMode}
        data={formData}
        open={formOpen}
        zoneMasterData={zoneMaster?.data}
        entryExitMasterData={entryExitMaster?.data}
        // onClose={() => {
        //   setFormOpen(false);
        //   if (resetForm) resetForm();
        // }}
        onClose={() => {
          setFormOpen(false);
          if (resetForm) {
            setTimeout(() => {
              resetForm();
              setFormData(null);
            }, 100);
          }
        }}
        onSubmit={handleFormSubmit}
        setResetForm={setResetForm}
      />

      <ModalComponent
        open={isModalSuccessOpen}
        handleClose={handleCloseModal}
        title="Success"
        // description="Zone/Quality has been added."
        description={formMode == 'create' ? 'Zone/Quality has been added.' : 'Your changes have been saved.'}
      />

      <ModalHistory
        open={historyOpen}
        handleClose={handleCloseHistoryModal}
        tableType="zone"
        title="History"
        data={historyData}
        head_data={headData}
        initialColumns={initialColumnsHistory}
        userPermission={userPermission}
      />

      <ColumnVisibilityPopover
        open={open}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        columnVisibility={columnVisibility}
        handleColumnToggle={handleColumnToggle}
        initialColumns={initialColumns}
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
            {
              modalErrorMsg?.split('<br/>').length > 1 ?
                <ul className="text-start list-disc">
                  {
                    modalErrorMsg.split('<br/>').map(item => {
                      return (
                        <li>{item}</li>
                      )
                    })
                  }
                </ul>
                :
                <div className="text-center">
                  {`${modalErrorMsg}`}
                </div>
            }
          </div>
        }
        stat="error"
      />

      <Popover
        id="action-menu-popover"
        open={!!anchorPopover}
        anchorEl={anchorPopover}
        onClose={() => setAnchorPopover(null)}
        anchorOrigin={{
          vertical: 'center', // เดิม top
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'center', // เดิม top
          horizontal: 'right', // เดิม left
        }}
        sx={{
          zIndex: 1300,
          '& .MuiPaper-root': {
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,.14)',
            // ขยับออกจากปุ่มไปทางซ้ายอีกเล็กน้อย (ไม่ทับขอบ)
            transform: 'translateX(-8px)'
          }
        }}
        className="z-50"
      >
        <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <ul className="py-2">
            {
              userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
            }
            {
              userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
            }
            {
              userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", openPopoverId) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`History`}</li>
            }
          </ul>
        </div>
      </Popover>

    </div>
  );
};

export default ClientPage;
