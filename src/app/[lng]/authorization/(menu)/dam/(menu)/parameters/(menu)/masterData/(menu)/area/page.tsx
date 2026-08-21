"use client";
// import Link from "next/link";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatNumberThreeDecimal, formatTime, generateUserPermission, getContrastTextColor } from "@/utils/generalFormatter";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import TableArea from "./form/table";
import ModalAction from "./form/modalAction";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { decryptData } from "@/utils/encryptionData";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
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
      const permission = findRoleConfigByMenuName('Area', userDT)
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
  const { entryExitMaster, zoneMaster, areaMaster } = useFetchMasters();

  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchZoneMasterSlice());
      dispatch(fetchAreaMaster());
    }
    if (forceRefetch) {
      setForceRefetch(false);
    }
    getPermission();
  }, [dispatch, entryExitMaster, zoneMaster, areaMaster, forceRefetch]);

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [dataExport, setDataExport] = useState<any>([]);
  const [srchAreaName, setSrchAreaName] = useState('');
  const [srchEntryExit, setSrchEntryExit] = useState<any>([]);
  const [srchZone, setSrchZone] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setSrchAreaName('')
    setSrchZone([])
    setSrchEntryExit([])
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
  };

  const handleFieldSearch = () => {
    const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed

    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        // (srchAreaName ? item?.id == srchAreaName : true) &&
        (srchAreaName ? item?.name?.toLowerCase().includes(srchAreaName.toLowerCase()) : true) &&
        // (srchEntryExit ? item?.entry_exit_id && item?.entry_exit_id.toString().toLowerCase().includes(srchEntryExit.toLowerCase()) : true) &&
        // (srchZone ? item?.zone?.id == srchZone : true)

        // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
        (srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit_id?.toString()) : true) &&
        (srchZone?.length > 0 ? srchZone?.includes(item?.zone?.id?.toString()) : true)

      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {
    const filtered = dataTable.filter(
      // const filtered = filteredDataTable.filter(
      (item: any) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        return (
          item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.entry_exit?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.area_nominal_capacity?.toString().includes(queryLower) ||
          formatNumberThreeDecimal(item?.area_nominal_capacity)?.toString().includes(queryLower) ||
          item?.supply_reference_quality_area_by?.name?.replace(/\s+/g, '').trim().toLowerCase().includes(queryLower) ||
          item?.supply_reference_quality_area?.toString().includes(queryLower) ||
          item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) ||
          item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search นามสกุล
          item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
          formatDateNoTime(item?.start_date)?.toLowerCase().includes(queryLower) ||
          formatDateNoTime(item?.end_date)?.toLowerCase().includes(queryLower) ||
          formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
          formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          // formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
          // formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

          item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
        )
      }
    );
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(filtered);
  };

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();

  const fetchData = async () => {
    try {
      const response: any = await getService(`/master/asset/area?includeInactive=true`);
      setData(response);
      setFilteredDataTable(response);
      setIsLoading(true);
    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
    }
  };


  useEffect(() => {
    fetchData();
  }, [resetForm]);

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const handleCloseModal = () => setModalSuccessOpen(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

  const fdInterface: any = {
    name: '',
    zone_id: '',
    description: '',
    entry_exit_id: '',
    area_nominal_capacity: null,
    supply_reference_quality_area: null,
    // start_date: new Date(),
    // end_date: new Date(),
    start_date: undefined,
    end_date: undefined,
    color: '',
    owner_area: null,
  };
  const [formData, setFormData] = useState(fdInterface);

  const handleFormSubmit = async (data: any) => {
    const newData = replaceEmptyStringsWithNull(data)

    if (typeof data.end_date !== 'string') {
      data.end_date = null;
    }

    if (data.end_date == 'Invalid Date') {
      data.end_date = null;
    }
    data.area_nominal_capacity = parseFloat(data.area_nominal_capacity);
    data.supply_reference_quality_area = (data.supply_reference_quality_area);
    data.east_supply_reference_quality_area = (data.east_supply_reference_quality_area);
    data.west_supply_reference_quality_area = (data.west_supply_reference_quality_area);

    switch (formMode) {
      case "create":
        const res_create = await postService('/master/asset/area-create', data);
        const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

        if (statusCode === 400 || statusCode === 500) {
          setFormOpen(false);
          // setModalErrorMsg(res_create?.response?.data?.error);
          setModalErrorMsg(errorMsg || '');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessMsg('Area has been added.')
          setModalSuccessOpen(true);
        }
        break;
      case "edit":
        const res_edit = await putService(`/master/asset/area-update/${selectedId}`, data);
        const statusCodePut = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
        const errorMsgPut = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

        if (statusCodePut === 400 || statusCodePut === 500) {
          setFormOpen(false);
          setModalErrorMsg(errorMsgPut || '');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessMsg('Your changes have been saved.')
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
    //  fetchDataDiv(id);
    setSelectedId(id);
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.name = filteredData.name;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.area_nominal_capacity = filteredData.area_nominal_capacity;
      fdInterface.supply_reference_quality_area = filteredData.supply_reference_quality_area;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.color = filteredData.color;
      fdInterface.owner_area = filteredData.owner_area;
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
      fdInterface.area_nominal_capacity = filteredData.area_nominal_capacity;
      fdInterface.supply_reference_quality_area = filteredData.supply_reference_quality_area;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.color = filteredData.color;
      fdInterface.owner_area = filteredData.owner_area;
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
      const response: any = await getService(`/master/account-manage/history?type=area&method=all&id_value=${id}`);

      const valuesArray = response.map((item: any) => item.value);

      let mappings = [
        { key: "entry_exit.name", title: "Entry/Exit" },
        { key: "name", title: "Area Name" },
        { key: "description", title: "Description" },
      ];
      let result = mappings.map(({ key, title }) => {
        const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
        return {
          title,
          value: value || "",
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

  const paginatedData = Array.isArray(filteredDataTable)
    ? filteredDataTable.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'entry_exit', label: 'Entry / Exit', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'name', label: 'Area Name', visible: true },
    { key: 'desc', label: 'Description', visible: true },
    { key: 'area_nom_cap', label: 'Area Nominal Capacity (MMBTU/D)', visible: true },
    { key: 'supply_ref_quality', label: 'Supply Reference Quality Area', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'create_by', label: 'Created by', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'entry_exit', label: 'Entry / Exit', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'name', label: 'Area Name', visible: true },
    { key: 'desc', label: 'Description', visible: true },
    { key: 'area_nom_cap', label: 'Area Nominal Capacity (MMBTU/D)', visible: true },
    { key: 'supply_ref_quality', label: 'Supply Reference Quality Area', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
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
        accessorKey: "zone",
        header: "Zone",
        enableSorting: true,
        accessorFn: (row: any) => row?.zone?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              {/* <div
                className="flex justify-center items-center rounded-full p-1 text-[#464255] text-center"
                style={{
                  backgroundColor: row?.zone?.color,
                  minWidth: '130px',
                  maxWidth: 'max-content',
                  wordWrap: 'break-word',
                  whiteSpace: 'normal',
                }}
              >
                {`${row?.zone?.name}`}
              </div> */}
              <div
                className="flex w-[140px] justify-center rounded-full p-1"
                style={{
                  backgroundColor: row?.zone?.color,
                  color: getContrastTextColor(row?.zone?.color), // Dynamic text color
                }}
              >
                {`${row?.zone?.name}`}
              </div>
            </div>
          )
        }
      },
      {
        accessorKey: "name",
        header: "Area Name",
        enableSorting: true,
        accessorFn: (row: any) => row?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              {
                row?.entry_exit_id == 2 ?
                  <div
                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                    style={{ backgroundColor: row?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.color) }}
                  >
                    {`${row?.name}`}
                  </div>
                  :
                  <div
                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                    style={{ backgroundColor: row?.color, width: '40px', height: '40px', color: getContrastTextColor(row?.color) }}
                  >
                    {`${row?.name}`}
                  </div>
              }
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
        accessorKey: "area_nom_cap",
        header: "Area Nominal Capacity (MMBTU/D)",
        enableSorting: true,
        accessorFn: (row: any) => formatNumberThreeDecimal(row?.area_nominal_capacity) || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="float-right">
              {/* {row?.area_nominal_capacity ? formatNumberThreeDecimal(row.area_nominal_capacity) : ''} */}
              {(row?.area_nominal_capacity || row?.area_nominal_capacity === 0) ? formatNumberThreeDecimal(row.area_nominal_capacity) : ''}
            </div>
          )
        }
      },
      {
        accessorKey: "supply_ref_quality",
        header: "Supply Reference Quality Area",
        enableSorting: true,
        accessorFn: (row: any) => row?.supply_reference_quality_area_by?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              {row?.zone?.name === "EAST-WEST" ?
                <div className=" flex items-center gap-5">
                  <div>
                    <div className=" text-xs text-center">{`EAST`}</div>
                    <div
                      className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                      style={{
                        backgroundColor: row?.owner_area?.[0]?.east_area?.color,
                        color: getContrastTextColor(row?.owner_area?.[0]?.east_area?.color),
                        width: '40px',
                        height: '40px',
                      }}
                    >
                      {row?.owner_area?.[0]?.east_area?.name || <span className=" text-xs text-center whitespace-nowrap" >No Config</span>}
                    </div>
                  </div>
                  <div>
                    <div className=" text-xs text-center">{`WEST`}</div>
                    <div
                      className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                      style={{
                        backgroundColor: row?.owner_area?.[0]?.west_area?.color,
                        color: getContrastTextColor(row?.owner_area?.[0]?.west_area?.color),
                        width: '40px',
                        height: '40px',
                      }}
                    >
                      {row?.owner_area?.[0]?.west_area?.name || <span className=" text-xs text-center whitespace-nowrap" >No Config</span>}
                    </div>
                  </div>
                </div>
                : row?.supply_reference_quality_area_by ? (
                  row?.supply_reference_quality_area_by?.entry_exit_id == 2 ? (
                    <div
                      className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                      style={{
                        backgroundColor: row?.supply_reference_quality_area_by?.color,
                        color: getContrastTextColor(row?.supply_reference_quality_area_by?.color),
                        width: '40px',
                        height: '40px',
                      }}
                    >
                      {row?.supply_reference_quality_area_by?.name}
                    </div>
                  ) : (
                    <div
                      className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                      style={{
                        backgroundColor: row?.supply_reference_quality_area_by?.color,
                        color: getContrastTextColor(row?.supply_reference_quality_area_by?.color),
                        width: '40px',
                        height: '40px',
                      }}
                    >
                      {row?.supply_reference_quality_area_by?.name}
                    </div>
                  )
                ) : null}
            </div>
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
  )

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
      permission = findRoleConfigByMenuName('Area', userDT)

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
            onChange={(e) => {
              setSrchEntryExit(e.target.value)
              setSrchZone([])
            }}
            options={entryExitMaster?.data?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
          />

          <InputSearch
            id="searchZoneMaster"
            label="Zone"
            // type="select"
            type="select-multi-checkbox"
            value={srchZone}
            onChange={(e) => setSrchZone(e.target.value)}
            // options={zoneMaster?.data?.filter((item: any) => srchEntryExit ? item?.entry_exit?.id == srchEntryExit : item?.entry_exit?.id !== null)?.map((item: any) => ({
            //   value: item?.id?.toString(),
            //   label: item.name
            // }))}
            options={zoneMaster?.data?.filter((item: any) => srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) : item?.entry_exit?.id !== null)?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item?.name + ' (' + item?.entry_exit?.name + ')'
            }))}
          />

          {/* <InputSearch
            id="searchAreaName"
            label="Area Name"
            value={srchAreaName}
            type="select"
            onChange={(e) => setSrchAreaName(e.target.value)}
            placeholder="Select Area"
            // options={areaMaster?.data?.map((item: any) => ({
            //   value: item?.id?.toString(),
            //   label: item.name
            // }))}
            options={areaMaster?.data?.filter((item: any) =>
              srchEntryExit && srchZone ? item?.entry_exit?.id == srchEntryExit && item?.zone?.id == srchZone :
                srchEntryExit || srchZone ? item?.entry_exit?.id == srchEntryExit || item?.zone?.id == srchZone :
                  item !== null)?.map((item: any) => (
                    {
                      value: item?.id?.toString(),
                      label: item.name
                    }))}
          /> */}

          {/* v2.0.98-test Filter Area เปลี่ยนเป็น Search https://app.clickup.com/t/86euzxxjf */}
          <InputSearch
            id="searchAreaNameText"
            label="Area Name"
            value={srchAreaName}
            onChange={(e) => setSrchAreaName(e.target.value)}
            placeholder="Search Area"
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
              <BtnExport
                textRender={"Export"}
                data={filteredDataTable}
                path="dam/area"
                can_export={userPermission ? userPermission?.f_export : false}
                columnVisibility={columnVisibility}
                initialColumns={initialColumns} />
            </div>
          </div>
        </div>
        <TableArea
          openEditForm={openEditForm}
          openViewForm={openViewForm}
          openHistoryForm={openHistoryForm}
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
            path="dam/area"
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
        // zoneMasterData={zoneMaster1}
        entryExitMasterData={entryExitMaster?.data}
        onClose={() => {
          setFormOpen(false);
          if (resetForm) {
            setTimeout(() => {
              resetForm();
              setFormData(null);
            }, 300);
          }
        }}
        onSubmit={handleFormSubmit}
        setResetForm={setResetForm}
      />

      <ModalComponent
        open={isModalSuccessOpen}
        handleClose={handleCloseModal}
        title="Success"
        // description="Area has been added."
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

      <ModalHistory
        open={historyOpen}
        handleClose={handleCloseHistoryModal}
        tableType="area"
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
        // sx={{
        //   overflow: 'hidden',
        //   "& .MuiPopover-paper": {
        //     borderRadius: '10px', // Transfer border
        //   },
        // }}
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
