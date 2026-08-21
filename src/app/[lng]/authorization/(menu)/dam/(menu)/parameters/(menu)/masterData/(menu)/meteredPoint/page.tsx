"use client";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Button } from "@material-tailwind/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterNomPointNonTpaPoint, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission, getContrastTextColor, toDayjs } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import ModalHistory from "@/components/other/modalHistory";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { useAppDispatch } from "@/utils/store/store";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import BtnGeneral from "@/components/other/btnGeneral";
import { ColumnDef, Row, VisibilityState } from "@tanstack/react-table";
import { MeteredPointData } from "@/app/types";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";

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

      const permission = findRoleConfigByMenuName('Metered Point', userDT)
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

  const [tk, settk] = useState<boolean>(true);

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
  const [srchCp, setSrchCp] = useState('');
  const [srchMeteredPointName, setSrchMeteredPointName] = useState('');
  const [srchEntryExit, setSrchEntryExit] = useState<any>([]);
  const [srchZone, setSrchZone] = useState<any>([]);
  const [srchArea, setSrchArea] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

  const handleFieldSearch = () => {
    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
    const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        (srchMeteredPointName ? item?.metered_point_name.toLowerCase().includes(srchMeteredPointName.toLowerCase()) : true) &&
        // (srchEntryExit ? item?.entry_exit_id && item?.entry_exit_id.toString().toLowerCase().includes(srchEntryExit.toLowerCase()) : true) &&
        // (srchZone ? item?.zone?.name == srchZone?.value : true) &&
        // (srchArea ? item?.area?.id == srchArea : true)
        // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
        // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)

        // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
        (srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit_id?.toString()) : true) &&
        (srchZone?.length > 0 ? srchZone?.includes(item?.zone?.id?.toString()) : true) &&
        (srchArea?.length > 0 ? srchArea?.includes(item?.area?.id?.toString()) : true)
      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    setSrchCp('')
    setSrchEntryExit([])
    // setSrchZone(undefined)
    setSrchZone([])
    setSrchArea([])
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
    settk(!tk);
  };

  // ############### LIKE SEARCH ###############
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [meterPointType, setMeterPointType] = useState<any>([]);
  const [customerType, setCustomerType] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();
  const [dataZoneMaster, setdataZoneMaster] = useState<any>([]);
  const fetchedRef = useRef(false);

  const fetchData = async () => {
    setIsLoading(false);

    try {
      // const response: any = await getService(`/master/asset/metering-point`);
      // const meter_point_type = await getService(`/master/asset/nomination-point-non-tpa-point`);
      // const customer_type = await getService(`/master/asset/customer-type`);

      const [response, meter_point_type, customer_type] = await Promise.all([
        getService(`/master/asset/metering-point`),
        getService(`/master/asset/nomination-point-non-tpa-point`),
        getService(`/master/asset/customer-type`),
      ]);

      // DATA ZONE แบบไม่ซ้ำ
      const result = Array.from(
        new Map(
          zoneMaster?.data?.map((item: any) => [item?.name, { zone_name: item?.name }])
        ).values()
      );
      setdataZoneMaster(result);

      // DAM > Metered Point Add,Edit : Field Point ให้กรองมาแค่เฉพาะ Point ที่ active อยู่ ณ ตอนนี้
      const filter_x = filterNomPointNonTpaPoint(meter_point_type)

      setMeterPointType(filter_x);
      setCustomerType(customer_type);
      setData(response);
      setFilteredDataTable(response);

    } catch (err) {
      // setError(err.message);
    } finally {
      // setLoading(false);
      setIsLoading(true);
    }

    // setTimeout(() => {
    //   setIsLoading(true);
    // }, 300);
  };
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetchData();
  }, []);

  // ############# NEW MODAL CREATE/EDIT/VIEW  #############
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const handleCloseModal = () => setModalSuccessOpen(false);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>('create');

  const [openPopoverId, setOpenPopoverId] = useState(null);
  const [anchorPopover, setAnchorPopover] = useState<any>(null);

  const fdInterface: any = {
    metered_point_name: '',
    description: '',
    point_type_id: '',
    entry_exit_id: '',
    customer_type_id: '',
    non_tpa_point_id: '',
    nomination_point_id: '',
    zone_id: '',
    area_id: '',
    ref_id: '',
    // start_date: new Date(),
    // end_date: new Date(),
    start_date: undefined,
    end_date: undefined,
  };

  const [formData, setFormData] = useState(fdInterface);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);

  // #region form submit
  const handleFormSubmit = async (data: any) => {
    const newData = replaceEmptyStringsWithNull(data)
    if (typeof newData.end_date !== 'string' || newData.end_date == 'Invalid Date') {
      newData.end_date = null;
    }

    setLoadingModal(true)

    switch (formMode) {
      case "create":
        const res_create = await postService('/master/asset/metering-point-create', newData);
        const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

        if (statusCode === 400 || statusCode === 500) {
          setFormOpen(false);
          setModalErrorMsg(errorMsg || '');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessMsg('Metering Point has been added.')
          setModalSuccessOpen(true);
        }

        setTimeout(() => {
          setLoadingModal(false)
        }, 300);
        break;
      case "period":
        const res_period = await postService('/master/asset/metering-point-new-period', newData);
        const statusCode2 = res_period?.response?.data?.statusCode ?? res_period?.response?.data?.status ?? res_period?.status ?? res_period?.statusCode ?? res_period?.code ?? res_period?.response?.status;
        const errorMsg2 = res_period?.response?.data?.error ?? res_period?.data?.error ?? res_period?.response?.error ?? res_period?.error;

        if (statusCode2 === 400 || statusCode2 === 500) {
          setFormOpen(false);
          // setModalErrorMsg(res_period?.response?.data?.error);
          setModalErrorMsg(errorMsg2 || '');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessMsg('Your changes have been saved.')
          setModalSuccessOpen(true);
        }
        setTimeout(() => {
          setLoadingModal(false)
        }, 300);
        break;
      case "edit":
        const res_edit = await putService(`/master/asset/metering-point-edit/${selectedId}`, newData);
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
        setTimeout(() => {
          setLoadingModal(false)
        }, 300);
        break;
    }
    await fetchData();
    if (resetForm) resetForm(); // reset form
  };

  const openCreateForm = (mode: any) => {
    if (mode == "create") {
      setFormMode('create');
    } else {
      setFormMode('period');
    }
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openEditForm = (id: any) => {
    //  fetchDataDiv(id);
    setSelectedId(id);
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.metered_point_name = filteredData.metered_point_name;
      fdInterface.description = filteredData.description;
      fdInterface.point_type_id = filteredData.point_type_id;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.customer_type_id = filteredData.customer_type_id;
      fdInterface.non_tpa_point_id = filteredData.non_tpa_point_id;
      fdInterface.nomination_point_id = filteredData.nomination_point_id;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.area_id = filteredData.area_id;
      fdInterface.ref_id = filteredData.ref_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
    }
    setFormMode('edit');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openViewForm = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.metered_point_name = filteredData.metered_point_name;
      fdInterface.description = filteredData.description;
      fdInterface.point_type_id = filteredData.point_type_id;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.customer_type_id = filteredData.customer_type_id;
      fdInterface.non_tpa_point_id = filteredData.non_tpa_point_id;
      fdInterface.nomination_point_id = filteredData.nomination_point_id;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.area_id = filteredData.area_id;
      fdInterface.ref_id = filteredData.ref_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
    }
    setFormMode('view');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const toggleMenu = (mode: any, id: any) => {
    setOpenPopoverId(null);
    setAnchorPopover(null)
    switch (mode) {
      case "view":
        openViewForm(id);
        break;
      case "edit":
        openEditForm(id);
        break;
      case "history":
        openHistoryForm(id);
        break;
    }
  }

  const handleActionPopoverClose = () => {
    setOpenPopoverId(null);
    setAnchorPopover(null)
  }

  const togglePopover = (id: any, anchorPopover: any) => {
    if (openPopoverId === id) {
      setOpenPopoverId(null); // Close the popover if it's already open
      setAnchorPopover(null)
    } else {
      setOpenPopoverId(id); // Open the popover for the clicked row
      setAnchorPopover(anchorPopover)
    }
  };

  const renderPermission: any = () => {
    let permission: any = undefined;
    try {
      // const updatedUserPermission = generateUserPermission(user_permission);
      // permission = updatedUserPermission;
      permission = findRoleConfigByMenuName('Metered Point', userDT)

    } catch (error) {
      // Failed to parse user_permission:
    }

    return permission
  }

  // ############### HISTORY MODAL ###############
  const [historyOpen, setHistoryOpen] = useState(false);
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
      const response: any = await getService(`/master/account-manage/history?type=metering-point&method=all&id_value=${id}`);
      const valuesArray = response.map((item: any) => item.value);

      let mappings = [
        // { key: "entry_exit.name", title: "Entry/Exit" },
        { key: "metered_id", title: "Metered ID" },
        { key: "metered_point_name", title: "Metered Point Name" },
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

  // ############### COLUMN SHOW/HIDE ###############
  const columns = useMemo<ColumnDef<MeteredPointData>[]>(() => [
    {
      accessorKey: "metered_id",
      accessorFn: (row: MeteredPointData) => row.metered_id || '',
      header: "Metered ID",
    },
    {
      accessorKey: "metered_point_name",
      accessorFn: (row: MeteredPointData) => row.metered_point_name || '',
      header: "Metered Point Name",
      cell: ({ row }) => (
        <div
          className="text-[#464255] whitespace-pre"
        >
          {row.original.metered_point_name}
        </div>
      ),
    },
    {
      accessorKey: "description",
      accessorFn: (row: MeteredPointData) => row.description || '',
      header: "Description",
      // enableResizing: false, //disable resizing for just this column
      // size: 300,
      cell: ({ row }) => (
        <div
          className="text-[#464255] whitespace-pre"
        >
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "entry_exit.name",
      accessorFn: (row: MeteredPointData) => row.entry_exit?.name || '',
      header: "Entry / Exit",
      cell: ({ row }) => {
        if (row?.original?.entry_exit_id) {
          return (
            <div
              className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]"
              style={{
                backgroundColor: row?.original?.entry_exit?.color || undefined,
                // color: getContrastTextColor(row?.original?.entry_exit?.color),
              }}>
              {`${row?.original?.entry_exit?.name}`}
            </div>
          )
        }
        else {
          return (<></>)
        }
      }
    },
    {
      accessorKey: "zone.name",
      accessorFn: (row: MeteredPointData) => row.zone?.name || '',
      header: "Zone",
      cell: (info) => {
        const row: any = info?.row?.original

        return (
          <div
            className="flex  w-[100px] justify-center rounded-full p-1 text-[#464255]"
            style={{
              backgroundColor: row?.zone?.color,
              color: getContrastTextColor(row?.zone?.color),
            }}
          >
            {row?.zone?.name}
          </div>
        )
      },
    },
    {
      accessorKey: "area.name",
      accessorFn: (row: MeteredPointData) => row.area?.name || '',
      header: "Area",
      cell: (info) => {
        const row: any = info?.row?.original
        return (
          <div className="flex justify-center">
            <div
              className={`flex justify-center items-center p-1 text-[#464255] ${row?.area?.entry_exit_id === 2 ? "rounded-full" : "rounded-lg"}`}
              style={{
                backgroundColor: row?.area?.color || undefined,
                width: "40px",
                height: "40px",
                color: getContrastTextColor(row?.area?.color),
              }}
            >
              {row?.area?.name}
            </div>
          </div>
        )
      },
      // cell: ({ row }) => (
      //   <div className="flex justify-center">
      //     <div
      //       className={`flex justify-center items-center p-1 text-[#464255] ${row.original.area?.entry_exit_id === 2
      //         ? "rounded-full"
      //         : "rounded-lg"
      //         }`}
      //       style={{
      //         backgroundColor: row.original?.area?.color || undefined,
      //         width: "40px",
      //         height: "40px",
      //       }}
      //     >
      //       {row.original.area?.name}
      //     </div>
      //   </div>
      // ),
    },
    {
      accessorKey: "customer_type.name",
      accessorFn: (row: MeteredPointData) => row.customer_type?.name || '',
      header: "Customer Type",
    },
    {
      accessorKey: "nomination_point.nomination_point",
      accessorFn: (row: MeteredPointData) => row.point_type_id == 1 ? (row.nomination_point?.nomination_point || '') : (row.non_tpa_point?.non_tpa_point_name || ''),
      header: "Nomination Point / Non TPA Point",
    },
    {
      accessorKey: "start_date",
      accessorFn: (row: MeteredPointData) => row.start_date ? formatDateNoTime(row.start_date) : '',
      sortingFn: myCustomSortingByDateFn,
      // sortingFn: 'datetime', // recommended for date columns 
      // sortUndefined: -1,
      header: "Start Date",
      size: 100
    },
    {
      accessorKey: "end_date",
      accessorFn: (row: MeteredPointData) => row.end_date ? formatDateNoTime(row.end_date) : '',
      sortingFn: myCustomSortingByDateFn,
      // sortingFn: 'datetime', // recommended for date columns 
      // sortUndefined: -1,
      header: "End Date",
      size: 100,
      cell: ({
        getValue,
        row,
      }: {
        getValue: () => any;
        row: Row<MeteredPointData>;
      }) => {
        const value = getValue();
        return (
          <span className="text-[#0DA2A2]">{value || ''}</span>
        );
      },
    },
    {
      accessorKey: "action",
      id: 'actions',
      header: "Action",
      size: 80,
      enableSorting: false,
      meta: {
        align: 'center',
      },
      cell: (info) => {
        const row: any = info?.row?.original;
        const getPermission: any = renderPermission();
        return (
          <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!getPermission?.f_view && !getPermission?.f_edit ? true : false} />
        )
      }
    },
  ], [])

  const initialColumns: any = [
    { key: 'metered_id', label: 'Metered ID', visible: true },
    { key: 'metered_point_name', label: 'Metered Point Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    { key: 'entry_exit_name', label: 'Entry / Exit', visible: true },
    { key: 'zone_name', label: 'Zone', visible: true },
    { key: 'area_name', label: 'Area', visible: true },
    { key: 'customer_type_name', label: 'Customer Type', visible: true },
    { key: 'nomination_point_non_tpa_point', label: 'Nomination Point / Non TPA Point', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    // { key: 'create_by', label: 'Created By', visible: true },
    // { key: 'updated_by', label: 'Updated by', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'metered_id', label: 'Metered ID', visible: true },
    { key: 'metered_point_name', label: 'Metered Point Name', visible: true },
    { key: 'description', label: 'Description', visible: true },
    // { key: 'entry_exit_name', label: 'Entry / Exit', visible: true },
    // { key: 'zone_name', label: 'Zone', visible: true },
    // { key: 'area_name', label: 'Area', visible: true },
    // { key: 'customer_type_name', label: 'Customer Type', visible: true },
    { key: 'nomination_point_non_tpa_point', label: 'Nomination Point / Non TPA Point', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'updated_by', label: 'Updated by', visible: true },
  ];

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const renderMasterZone = (identry_exit: any) => {
    //   DATA ZONE แบบไม่ซ้ำ
    const dataZone = Array.from(
      new Map(
        zoneMaster?.data?.filter((item: any) => identry_exit ? item?.entry_exit?.id == identry_exit : item?.entry_exit?.id !== null)?.map((item: any) => [item.name, { zone_name: item.name }])
      ).values()
    );
    setdataZoneMaster(dataZone);
  }

  // const webConfigLogin = async (email: string, password?: string) => {
  //   try {
  //     const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_WEB_CONFIG_API_PATH}/user/login`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         username: email,
  //         password: password || email,
  //       }),
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     return loginResponse;
  //   } catch (error) {
  //     return null;
  //   }
  // }

  // const webConfigGetAccessToken = async () => {
  //   let accessToken = 'No access token received from login';
  //   try {
  //     const userDT: any = getUserValue();
  //     const tmpLoginResponse = await webConfigLogin(userDT?.email);
  //     // Parse the JSON response to get the access token
  //     const tmpLoginData = await tmpLoginResponse?.json();

  //     if (tmpLoginData?.access_token) {
  //       accessToken = tmpLoginData.access_token
  //     }
  //     else {
  //       const loginResponse = await webConfigLogin(process.env.NEXT_PUBLIC_WEB_CONFIG_ADMIN || '', process.env.NEXT_PUBLIC_WEB_CONFIG_ADMIN_ACCESS || '');

  //       if (!loginResponse?.ok) {
  //         // Login failed:
  //       }

  //       const adminLoginData = await loginResponse?.json();
  //       const adminAccessToken = adminLoginData?.access_token || 'No access token received from login';

  //       if (!adminLoginData?.access_token) {
  //         // No access token received from login
  //       }
  //       const tmpCreateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_WEB_CONFIG_API_PATH}/user/create`, {
  //         method: 'POST',
  //         body: JSON.stringify({
  //           fullname: `${userDT?.first_name ? `${userDT?.first_name} ` : ''}${userDT?.last_name || ''}`,
  //           username: userDT?.email,
  //           email: userDT?.email,
  //           Approve: false,
  //           password: userDT?.email,
  //         }),
  //         headers: {
  //           'access-token': adminAccessToken, // original Beam
  //           // 'Authorization': `Bearer ${accessToken}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });

  //       const createdTmpLoginResponse = await webConfigLogin(userDT?.email);
  //       const createdTmpLoginData = await createdTmpLoginResponse?.json();
  //       if (createdTmpLoginData?.access_token) {
  //         accessToken = createdTmpLoginData.access_token
  //       }
  //     }
  //     return accessToken;
  //   } catch (error) {
  //     return accessToken;
  //   }
  // }

  // const openTPA = (magicToken?: any) => {
  //   const redirect = '/TPA_Webconfig/Manage/AllMeter';
  //   const url = `/api/webservice?token=${encodeURIComponent(magicToken)}&redirect=${encodeURIComponent(redirect)}`;
  //   window.open(url, '_blank'); // เซ็ต cookie แล้วเด้งไปหน้าเป้าหมาย
  // };

  return (

    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          <InputSearch
            id="searchCp"
            label="Metered Point Name"
            value={srchMeteredPointName}
            onChange={(e) => setSrchMeteredPointName(e.target.value)}
            placeholder="Search Metered Point Name"
            customWidth={220}
          />

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
              renderMasterZone(e.target.value)
            }}
            options={entryExitMaster?.data?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
          />

          {/* <InputSearch
            id="searchZoneMaster"
            label="Zone"
            type="select"
            value={srchZone ? srchZone?.value?.toString() : ''}
            // onChange={(e: any) => setSrchZone(e.target.value)}
            onChange={(e: any) => {
              if (e?.target?.value) {
                let findOriginal: any = dataZoneMaster?.find((item: any) => item?.zone_name == e?.target?.value);
                let item: any = { name: findOriginal?.zone_name, value: findOriginal?.zone_name }
                setSrchZone(item);
              } else {
                setSrchZone(undefined);
              }
            }}
            // options={zoneMaster?.data?.map((item: any) => ({
            //   value: item?.id?.toString(),
            //   label: item.name
            // }))}
            options={dataZoneMaster?.map((item: any) => ({
              // value: item?.id?.toString(),
              value: item?.zone_name,
              label: item?.zone_name
            }))}
          /> */}

          <InputSearch
            id="searchZoneMaster"
            label="Zone"
            // type="select"
            type="select-multi-checkbox"
            value={srchZone}
            onChange={(e) => {
              setSrchZone(e.target.value)
              setSrchArea([])
              settk(!tk)
            }}
            options={zoneMaster?.data?.filter((item: any) => srchEntryExit?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) : item?.entry_exit?.id !== null)?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item?.name + ' (' + item?.entry_exit?.name + ')'
            }))}
          />

          <InputSearch
            id="searchArea"
            key={'search_area_' + key}
            label="Area"
            // type="select"
            type="select-multi-checkbox"
            value={srchArea}
            onChange={(e) => setSrchArea(e.target.value)}
            // options={areaMaster?.data?.filter((item: any) =>
            //   srchEntryExit && srchZone ? (item?.entry_exit?.id == srchEntryExit && item?.zone?.name == srchZone?.name) :
            //     srchEntryExit || srchZone ? (item?.entry_exit?.id == srchEntryExit || item?.zone?.name == srchZone?.name) :
            //       item !== null)?.map((item: any) => (
            //         {
            //           value: item?.id?.toString(),
            //           label: item.name
            //         }))}
            options={areaMaster?.data?.filter((item: any) =>
              srchEntryExit?.length > 0 && srchZone?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) && srchZone.includes(item?.zone?.id?.toString()) :
                srchEntryExit?.length > 0 || srchZone?.length > 0 ? srchEntryExit.includes(item?.entry_exit?.id?.toString()) || srchZone.includes(item?.zone?.id?.toString()) :
                  item !== null)?.map((item: any) => (
                    {
                      value: item?.id?.toString(),
                      label: item.name
                    }))}
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

        <aside className="mt-auto pl-1">
          <div className="flex gap-2">

            {
              <BtnGeneral
                customWidthSpecific={150}
                bgcolor={"#A6CE39"}
                modeIcon={'webservice'}
                textRender={"Webservice"}
                generalFunc={async () => {
                  try {

                    const accessToken = await getService(`/master/asset/web-config-access-token`);

                    const url = process.env.NEXT_PUBLIC_WS_DOMAIN ?? ''
                    // const accessToken = await webConfigGetAccessToken();

                    // Add access token as URL parameter to avoid CORS issues
                    const urlWithToken = `${url}?access_token=${encodeURIComponent(accessToken)}`;

                    // Open URL directly in new window
                    window.open(urlWithToken, '_blank');

                    // // Create a form to submit with headers
                    // const form = document.createElement('form');
                    // form.method = 'POST';
                    // form.action = url;
                    // form.target = '_blank';

                    // // Add access token as hidden input
                    // const tokenInput = document.createElement('input');
                    // tokenInput.type = 'hidden';
                    // tokenInput.name = 'access-token';
                    // tokenInput.value = accessToken;
                    // form.appendChild(tokenInput);

                    // // Add form to document, submit it and remove it
                    // document.body.appendChild(form);
                    // form.submit();
                    // document.body.removeChild(form);
                    // Make request with access token in header

                    // Add feature
                    // if (url) {


                    //   // window.open(`${url}?access_token=${encodeURIComponent(await webConfigGetAccessToken())}`, '_blank');
                    //   // const response = await fetch(url, {
                    //   //   method: 'GET',
                    //   //   headers: {
                    //   //     'access-token': accessToken,
                    //   //     'Set-Cookie':"jwt_token="+accessToken
                    //   //   },
                    //   //   mode:'cors'
                    //   // });
                    //   // const axios = require('axios');



                    //   window.open("/api/meterservice", "_blank");


                    //   // try {
                    //   //     const res = await axios.get("/api/webservice", {withCredentials: false,
                    //   //       // responseType:'text'
                    //   //     });
                    //   //     const blob = new Blob([res.data], { type: 'text/html;charset=utf-8' });
                    //   //     const url = URL.createObjectURL(blob);
                    //   //     const tab = window.open(url, '_blank');
                    //   //     if (tab) {
                    //   //       setTimeout(() => URL.revokeObjectURL(url), 30_000); // เคลียร์ภายหลัง
                    //   //     } else {
                    //   //       alert('Pop-up ถูกบล็อก');
                    //   //     }
                    //   //   } catch (e) {
                    //   //     console.error(e);
                    //   //   }

                    // }

                    // End feature

                    //--- Old ---
                    // const response = await fetch(url, {
                    //   method: 'GET',
                    //   headers: {
                    //     'access-token': accessToken,
                    //     // 'Authorization': `Bearer ${accessToken}`,
                    //     'Content-Type': 'application/json',
                    //   },
                    //   // mode: 'cors'
                    //   mode: 'no-cors'
                    // });

                    // if (response.ok) {
                    //   const data = await response.text(); // or response.json() if expecting JSON

                    //   // Create a blob URL for the response data and open in new window
                    //   const blob = new Blob([data], { type: 'text/html' });
                    //   const blobUrl = URL.createObjectURL(blob);

                    //   const newWindow = window.open(blobUrl, '_blank');
                    //   if (newWindow) {
                    //     // Clean up the blob URL after a delay
                    //     setTimeout(() => {
                    //       URL.revokeObjectURL(blobUrl);
                    //     }, 1000);
                    //   }
                    //--- End old -----


                    // If you want to open the content in a new window
                    // const newWindow = window.open(url, '_blank');
                    // if (newWindow) {
                    //   newWindow.document.write(data);
                    //   newWindow.document.close();
                    // }


                  } catch (error) {
                    // Error making request
                  }
                }}
                can_create={userPermission ? userPermission?.f_create : false}
              />
            }

            {
              userPermission?.f_create && <>
                <Button className="flex items-center justify-center gap-3 px-2 h-[44px] w-[140px] bg-[#36B1AB] font-light normal-case" onClick={() => openCreateForm('create-period')}>
                  <span>{`New Period`}</span>
                  <AddCircleIcon style={{ fontSize: "20px" }} />
                </Button>

                <Button className="flex items-center justify-center gap-3 px-2 h-[44px] w-[120px] bg-[#00ADEF] font-light" onClick={() => openCreateForm('create')}>
                  <span className="font-light normal-case">{`New`}</span>
                  <AddCircleIcon style={{ fontSize: "20px" }} />
                </Button>
              </>
            }
          </div>
        </aside>
      </div>


      {/* ================== NEW TABLE ==================*/}
      <AppTable
        data={filteredDataTable}
        columns={columns}
        isLoading={isLoading}
        exportBtn={
          <BtnExport
            textRender={"Export"}
            data={dataExport}
            path="dam/metered-point"
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

      <ColumnVisibilityPopover
        open={!!anchorEl}
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
        onClose={handleActionPopoverClose}
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
        <div className="w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
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

      <ModalComponent
        open={isModalSuccessOpen}
        handleClose={handleCloseModal}
        title="Success"
        description={modalModalSuccessMsg}
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

      <ModalAction
        mode={formMode}
        data={formData}
        open={formOpen}
        dataTable={dataTable}
        zoneMasterData={zoneMaster?.data}
        areaMasterData={areaMaster?.data}
        entryExitMasterData={entryExitMaster?.data}
        meterPointType={meterPointType}
        customerType={customerType}
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

        loadingModal={loadingModal}
        setLoadingModal={setLoadingModal}

      />

      <ModalHistory
        open={historyOpen}
        handleClose={handleCloseHistoryModal}
        tableType="metering-point"
        title="History"
        data={historyData}
        head_data={headData}
        initialColumns={initialColumnsHistory}
        userPermission={userPermission}
      />

    </div>
  );
};

export default ClientPage;
