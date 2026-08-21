"use client";
import TableContractPoint from "./form/table"
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission, getContrastTextColor } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import ModalAction from "./form/modalAction";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnAddNew from "@/components/other/btnAddNew";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import { useAppDispatch } from "@/utils/store/store";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { sortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
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

  // SEARCH STATE
  const [key, setKey] = useState(0);

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>();
  // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

      const permission = findRoleConfigByMenuName('Contract Point', userDT)
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
  const [areaMasterFetch, setAreaMasterFetch] = useState<any>([]);

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
  const [srchCp, setSrchCp] = useState('');
  const [srchEntryExit, setSrchEntryExit] = useState<any>([]);
  const [srchZone, setSrchZone] = useState<any>([]);
  const [srchArea, setSrchArea] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
  const [srchQuery, setSrchQuery] = useState('');
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

  const handleFieldSearch = (e?: any) => {
    let data = dataTable
    if (Array.isArray(e)) {
      data = e
    }

    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate);

    // const res_filtered_date: any = filterStartEndDate(data, srchStartDate, srchEndDate); // R : v1.0.90 filter กับ smart search ควรใช้ร่วมกันได้ https://app.clickup.com/t/86erqt8en
    const res_filtered_date: any = filterStartEndDateNewLogic(data, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        (srchCp ? item?.contract_point?.toLowerCase().includes(srchCp.toLowerCase()) : true) &&
        // (srchEntryExit ? item?.entry_exit_id.toString().toLowerCase().includes(srchEntryExit.toLowerCase()) : true) &&
        // (srchZone ? item?.zone?.id == srchZone : true) &&
        // (srchArea ? item?.area?.id == srchArea : true)

        // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
        (srchEntryExit?.length > 0 ? srchEntryExit?.includes(item?.entry_exit_id?.toString()) : true) && 
        (srchZone?.length > 0 ? srchZone?.includes(item?.zone?.id?.toString()) : true) &&
        (srchArea?.length > 0 ? srchArea?.includes(item?.area?.id?.toString()) : true)

      );
    });

    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    if (data) {
      setFilteredDataTable(result_2);
    }
    else {
      handleSearch(srchQuery, result_2)
    }
  };

  const handleReset = () => {
    setSrchCp('')
    setSrchEntryExit([])
    setSrchZone([])
    setSrchArea([])
    setSrchStartDate(null);
    setSrchEndDate(null);
    // setFilteredDataTable(dataTable);
    handleSearch(srchQuery, dataTable)
    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string, data?: any[]) => {
    setSrchQuery(query)
    // const filtered = (data || dataTable).filter(
    const filtered = (data || dataTable).filter( // R : v1.0.90 filter กับ smart search ควรใช้ร่วมกันได้ https://app.clickup.com/t/86erqt8en
      (item: any) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        return (
          item?.contract_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.entry_exit?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
          item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

          formatDateNoTime(item?.contract_point_start_date)?.toLowerCase().includes(queryLower) ||
          formatDateNoTime(item?.contract_point_end_date)?.toLowerCase().includes(queryLower) ||

          formatDateNoTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
          formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
          formatDate(item?.create_date)?.replace(/\s+/g, '')?.toLowerCase().includes(queryLower)
        )
      }
    );
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก

    if (query !== '') {  // R : v1.0.90 filter กับ smart search ควรใช้ร่วมกันได้ https://app.clickup.com/t/86erqt8en
      if (data) {
        setFilteredDataTable(filtered);
      }
      else {
        handleFieldSearch(filtered)
      }
    } else {
      if (data) {
        setFilteredDataTable(dataTable);
      }
      else {
        handleFieldSearch(dataTable)
      }
    }
  };

  // const [isModalOpen, setModalOpen] = useState(false);
  // const handleOpenModal = () => setModalOpen(true);

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();
  const [tk, settk] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      // DATA AREA
      const res_area: any = await getService('/master/asset/area')
      setAreaMasterFetch(res_area)

      const response: any = await getService(`/master/asset/contract-point`);
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

  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');

  const fdInterface: any = {
    id: '',
    contract_point: '',
    description: '',
    entry_exit_id: '',
    zone_id: '',
    area_id: '',
    // contract_point_start_date: new Date(),
    // contract_point_end_date: new Date(),
    contract_point_start_date: undefined,
    contract_point_end_date: undefined,
    // nomination_point_start_date: new Date(),
    // nomination_point_end_date: new Date(),
    nomination_point_list: [],
  };

  const [formData, setFormData] = useState(fdInterface);

  const handleFormSubmit = async (data: any) => {

    const newData = replaceEmptyStringsWithNull(data)
    let newArray = data.contract_nomination_point?.length > 0 ? data.contract_nomination_point.map((item: any) => ({
      id: item.id,
      ref_id: item.ref_id,
      nomination_point: item.nomination_point,
      start_date: item.start_date,
      end_date: item.end_date
    })) : [];

    data.contract_nomination_point = newArray
    const { id, nomination_point, ...updateData } = data

    if (typeof data.contract_point_end_date !== 'string' || data.contract_point_end_date == 'Invalid Date') {
      data.contract_point_end_date = null;
    }

    const dataCreate = {
      contract_point: data?.contract_point,
      description: data?.description,
      entry_exit_id: data?.entry_exit_id,
      zone_id: data?.zone_id,
      area_id: data?.area_id,
      contract_point_start_date: data?.contract_point_start_date,
      contract_point_end_date: data?.contract_point_end_date,
      contract_nomination_point: data?.contract_nomination_point
    }

    if (formMode == 'edit') {
      if (typeof updateData.contract_point_end_date !== 'string' || updateData.contract_point_end_date == 'Invalid Date') {
        updateData.contract_point_end_date = null;
      }

      // delete updateData.nomination_point_end_date
      // delete updateData.nomination_point_start_date
      // delete updateData.nomination_point_list
    }

    switch (formMode) {
      case "create":
        const res = await postService('/master/asset/contract-point-create', dataCreate);
        if (res?.id) {
          await fetchData();
          if (resetForm) resetForm(); // reset form
          setFormOpen(false);
          setModalSuccessMsg('Contract Point has been added.')
          setModalSuccessOpen(true);
        }
        else {
          setFormOpen(true);
          setModalErrorMsg(res?.response?.data?.error || "Something wrong");
          setModalErrorOpen(true)
        }
        break;
      case "edit":
        if (typeof updateData.contract_point_end_date !== 'string' || updateData.contract_point_end_date == 'Invalid Date') {
          updateData.contract_point_end_date = null;
        }

        const resEdit = await putService(`/master/asset/contract-point-edit/${selectedId}`, updateData);
        if (resEdit?.id) {
          await fetchData();
          if (resetForm) resetForm(); // reset form
          setFormOpen(false);
          setModalSuccessMsg('Your changes have been saved.')
          setModalSuccessOpen(true);
        }
        else {
          setFormOpen(true);
          setModalErrorMsg(resEdit?.response?.data?.error || "Something wrong");
          setModalErrorOpen(true)
        }
        break;
    }
    setIsModalLoading(false)
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
      fdInterface.contract_point = filteredData.contract_point;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.area_id = filteredData.area_id;
      fdInterface.contract_point_start_date = new Date(filteredData.contract_point_start_date);
      fdInterface.contract_point_end_date = filteredData.contract_point_end_date ? new Date(filteredData.contract_point_end_date) : null;
      // fdInterface.nomination_point_start_date = filteredData.nomination_point_start_date ? new Date(filteredData.nomination_point_start_date) : null;
      // fdInterface.nomination_point_end_date = filteredData.nomination_point_end_date ? new Date(filteredData.nomination_point_end_date) : null;
      fdInterface.nomination_point_list = filteredData.nomination_point_list
    }
    setFormMode('edit');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openViewForm = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.contract_point = filteredData.contract_point;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.area_id = filteredData.area_id;
      fdInterface.contract_point_start_date = new Date(filteredData.contract_point_start_date);
      fdInterface.contract_point_end_date = filteredData.contract_point_end_date ? new Date(filteredData.contract_point_end_date) : null;
      // fdInterface.nomination_point_start_date = filteredData.nomination_point_start_date ? new Date(filteredData.nomination_point_start_date) : null;
      // fdInterface.nomination_point_end_date = filteredData.nomination_point_end_date ? new Date(filteredData.nomination_point_end_date) : null;
      fdInterface.nomination_point_list = filteredData.nomination_point_list
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
      const response: any = await getService(`/master/account-manage/history?type=contract-point&method=all&id_value=${id}`);
      const valuesArray = response.map((item: any) => item.value);
      let mappings = [
        // { key: "entry_exit.name", title: "Entry/Exit" },
        // { key: "name", title: "Zone Name" },
        { key: "create_date", title: "Created Date" },
      ];
      let result = mappings.map(({ key, title }) => {
        const value = key.split('.').reduce((acc, part) => acc && acc[part], valuesArray[0]);
        return {
          title,
          value: formatDateNoTime(value) || "",
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
    ) : [];

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'entry_exit', label: 'Entry/Exit', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'area', label: 'Area', visible: true },
    { key: 'contract_point', label: 'Contract Point', visible: true },
    { key: 'desc', label: 'Description', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'create_by', label: 'Created by', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'entry_exit', label: 'Entry/Exit', visible: true },
    { key: 'zone', label: 'Zone', visible: true },
    { key: 'area', label: 'Area', visible: true },
    { key: 'contract_point', label: 'Contract Point', visible: true },
    { key: 'desc', label: 'Description', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'updated_by', label: 'Updated by', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    // { key: 'action', label: 'Action', visible: true }
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
            <div className="flex justify-start items-center">
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
        accessorKey: "area",
        header: "Area",
        enableSorting: true,
        accessorFn: (row: any) => row?.area?.name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className="flex justify-center items-center">
              {
                row?.area.entry_exit_id == 2 ?
                  <div
                    className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                    style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                  >
                    {`${row?.area?.name}`}
                  </div>
                  :
                  <div
                    className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                    style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                  >
                    {`${row?.area?.name}`}
                  </div>
              }
            </div>
          )
        }
      },
      {
        accessorKey: "contract_point",
        header: "Contract Point",
        enableSorting: true,
        accessorFn: (row: any) => row?.contract_point || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.contract_point ? row?.contract_point : ''}</div>
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
            <div>{row?.description ? row?.description : ''}</div>
          )
        }
      },
      {
        accessorKey: "start_date",
        header: "Start Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.contract_point_start_date) || '',
        sortingFn: (rowA, rowB, columnId) => {
          return sortingByDateFn(rowA?.original?.contract_point_start_date, rowB?.original?.contract_point_start_date)
        },
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#464255]`}>{row?.contract_point_start_date ? formatDateNoTime(row?.contract_point_start_date) : ''}</div>
          )
        }
      },
      {
        accessorKey: "end_date",
        header: "End Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDateNoTime(row?.contract_point_end_date) || '',
        sortingFn: (rowA, rowB, columnId) => {
          return sortingByDateFn(rowA?.original?.contract_point_end_date, rowB?.original?.contract_point_end_date)
        },
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#0DA2A2]`}>{row?.contract_point_end_date ? formatDateNoTime(row?.contract_point_end_date) : ''}</div>
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
    ]
    , []
  )

  const togglePopover = (id: any, anchor: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null); // close popover
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
      permission = findRoleConfigByMenuName('Contract Point', userDT)
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

  const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case "view":
        openViewForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null)
        break;
      case "edit":
        openEditForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null)
        break;
      case "history":
        openHistoryForm(id);
        setOpenPopoverId(null);
        setAnchorPopover(null)
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
              setSrchArea([])
              settk(!tk)
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
            onChange={(e) => {
              setSrchZone(e.target.value)
              // setSrchArea('')
              setSrchArea([])
              settk(!tk)
            }}
            // options={zoneMaster?.data?.filter((item: any) => srchEntryExit ? item?.entry_exit?.id == srchEntryExit : item?.entry_exit?.id !== null)?.map((item: any) => ({
            //   value: item?.id?.toString(),
            //   label: item.name
            // }))}
            options={zoneMaster?.data?.filter((item: any) => srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) : item?.entry_exit?.id !== null)?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item?.name + ' (' + item?.entry_exit?.name + ')'
            }))}
          />

          <InputSearch
            id="searchArea"
            label="Area"
            // type="select"
            type="select-multi-checkbox"
            value={srchArea}
            onChange={(e) => setSrchArea(e.target.value)}
            // options={areaMasterFetch?.filter((item: any) => // R2 : Add > สร้าง Area มาใหม่ แล้วไม่ขึ้นใน Dropdown Area https://app.clickup.com/t/86erwzg48
            //   srchEntryExit && srchZone ? item?.entry_exit?.id == srchEntryExit && item?.zone?.id == srchZone :
            //     srchEntryExit || srchZone ? item?.entry_exit?.id == srchEntryExit || item?.zone?.id == srchZone :
            //       item !== null)?.map((item: any) => (
            //         {
            //           value: item?.id?.toString(),
            //           label: item.name
            //         }))}

            options={areaMasterFetch?.filter((item: any) => 
              srchEntryExit?.length > 0 && srchZone?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) && srchZone.includes(item?.zone?.id?.toString()) :
                srchEntryExit?.length > 0 || srchZone?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) || srchZone.includes(item?.zone?.id?.toString()) :
                  item !== null)?.map((item: any) => (
                    {
                      value: item?.id?.toString(),
                      label: item.name
                    }))}
          />

          <InputSearch
            id="searchCp"
            label="Contract Point"
            value={srchCp}
            onChange={(e) => setSrchCp(e.target.value)}
            placeholder="Search Contract Point"
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
              <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/contract-point" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
            </div>
          </div>
        </div>

        <TableContractPoint
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
            path="dam/contract-point"
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

      <ModalComponent
        open={isModalSuccessOpen}
        handleClose={handleCloseModal}
        title="Success"
        // description="Contract point has been added."
        description={modalModalSuccessMsg}
      />
      {/* Your changes have been saved. */}

      <ModalComponent
        open={isModalErrorOpen}
        handleClose={() => {
          setModalErrorOpen(false);
        }}
        title="Failed"
        description={
          <div>
            {
              modalErrorMsg.split('<br/>').length > 1 ?
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
                  {modalErrorMsg}
                </div>
            }
          </div>
        }
        stat="error"
      />

      <ModalAction
        mode={formMode}
        data={formData}
        open={formOpen}
        isLoading={isModalLoading}
        zoneMasterData={zoneMaster?.data}
        // areaMasterData={areaMaster?.data}
        areaMasterData={areaMasterFetch}
        entryExitMasterData={entryExitMaster?.data}
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
        setIsLoading={setIsModalLoading}
      />

      <ModalHistory
        open={historyOpen}
        handleClose={handleCloseHistoryModal}
        tableType="contract-point"
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
        className="z-50"
      >
        <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <ul className="py-2">
            {
              userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", openPopoverId) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> View</li>
            }
            {
              userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", openPopoverId) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> Edit</li>
            }
            {
              userPermission?.f_view && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("history", openPopoverId) }}><RestoreOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> History</li>
            }
          </ul>
        </div>
      </Popover>

    </div>
  );
};

export default ClientPage;