"use client";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { Button } from "@material-tailwind/react";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateNewLogic, findRoleConfigByMenuName, formatDateNoTime, generateUserPermission } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import { useAppDispatch } from "@/utils/store/store";
import { getService, postService, putService } from "@/utils/postService";
import { replaceEmptyStringsWithNull } from "@/components/other/fillBlankWithNull";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
// import ModalAction from "./form/modalAction";
import ModalAction from "./form/modalAction";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import ModalLimit from "./form/modalLimit";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef, Row, VisibilityState } from "@tanstack/react-table";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Popover } from "@mui/material";
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

      const permission = findRoleConfigByMenuName('Concept Point', userDT)
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

  useEffect(() => {
    getPermission();
  }, [])

  // ############### REDUX DATA ###############
  // const [areaMasterFetch, setAreaMasterFetch] = useState<any>([]);
  const { shipperGroupData } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (forceRefetch) {
      dispatch(fetchShipperGroup());
      // dispatch(fetchTypeConceptPoint());
    }
    if (forceRefetch) {
      setForceRefetch(false);
    }
  }, [dispatch, shipperGroupData, forceRefetch]);


  // ############### REDUX DATA ###############
  const [typeConceptPointMaster, setTypeConceptPointMaster] = useState<any>([]);

  const handleGetMaster = async () => {

    try {
      // DATA CONCEPT POINT
      const res_type_concept_point: any = await getService(`/master/asset/type-concept-point`);
      setTypeConceptPointMaster(res_type_concept_point)

    } catch (error) {

    }
  }

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [dataExport, setDataExport] = useState<any>([]);
  const [srchConceptPoint, setSrchConceptPoint] = useState<any>([]);
  const [srchTypeConcept, setSrchTypeConcept] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

  const handleFieldSearch = () => {
    // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
    const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        // (srchConceptPoint ? item?.type_concept_point.toLowerCase().includes(srchConceptPoint.toLowerCase()) : true) &&
        // (srchConceptPoint ? item?.id == srchConceptPoint : true) &&
        // (srchTypeConcept ? item?.type_concept_point?.id == srchTypeConcept : true)
        // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
        // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)

        // Filter Master data ใน DAM อยากให้เพิ่ม Select แบบ Multi (ดูเป็นรายหน้า) https://app.clickup.com/t/86etzcgzr
        (srchConceptPoint?.length > 0 ? srchConceptPoint.includes(item?.id?.toString()) : true) &&
        (srchTypeConcept?.length > 0 ? srchTypeConcept.includes(item?.type_concept_point?.id?.toString()) : true)
      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    setSrchConceptPoint([])
    setSrchTypeConcept([])
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  // const handleSearch = (query: string) => {
  //   const filtered = dataTable.filter(
  //     (item: any) =>
  //       item?.concept_point?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
  //       item?.type_concept_point?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
  //       formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
  //       formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
  //   );
  //   setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
  //   setFilteredDataTable(filtered);
  // };

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [limitConceptPointData, setLimitConceptPointData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();

  const fetchData = async () => {
    try {
      // DATA AREA
      // const res_area: any = await getService('/master/asset/area')
      // setAreaMasterFetch(res_area)

      // DATA MASTER
      handleGetMaster();

      const response: any = await getService(`/master/asset/concept-point`);
      response?.reverse();
      const limit_concept_point_data = await getService(`/master/asset/limit-concept-point`);
      setLimitConceptPointData(limit_concept_point_data);
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
  const [formLimitOpen, setFormLimitOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'period'>('create');

  const fdInterface: any = {
    concept_point: '',
    type_concept_point_id: '',
    // start_date: new Date(),
    // end_date: new Date(),
    start_date: undefined,
    end_date: undefined,
  };

  const [formData, setFormData] = useState(fdInterface);
  const [limitDataPost, setLimitDataPost] = useState([]);
  const [modalErrorMsg, setModalErrorMsg] = useState('');
  const [isModalErrorOpen, setModalErrorOpen] = useState(false);
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

  const handleFormSubmit = async (data: any) => {

    const newData = replaceEmptyStringsWithNull(data)
    if (typeof newData.end_date !== 'string' || newData.end_date == 'Invalid Date') {
      newData.end_date = null;
    }

    let dataMap = {
      limitData: limitDataPost.map((item: any) => ({
        group_id: item.group_id,
        concept_point_id: item.concept_point_id
      }))
    };

    switch (formMode) {
      case "create":
        const res_create = await postService('/master/asset/concept-point-create', newData);
        const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

        if (statusCode === 400 || statusCode === 500) {
          setFormOpen(false);
          // setModalErrorMsg(res_create?.response?.data?.error);
          setModalErrorMsg(errorMsg || '');
          setModalErrorOpen(true)
        } else {
          setFormOpen(false);
          setModalSuccessMsg('Concept Point has been added.')
          setModalSuccessOpen(true);
        }

        break;
      case "period":
        const res_period = await postService('/master/asset/limit-concept-point-manage', dataMap);
        const statusCode2 = res_period?.response?.data?.statusCode ?? res_period?.response?.data?.status ?? res_period?.status ?? res_period?.statusCode ?? res_period?.code ?? res_period?.response?.status;
        const errorMsg2 = res_period?.response?.data?.error ?? res_period?.data?.error ?? res_period?.response?.error ?? res_period?.error;

        if (statusCode2 === 400 || statusCode2 === 500) {
          setFormOpen(false);
          // setModalErrorMsg(res_period?.response?.data?.error);
          setModalErrorMsg(errorMsg2 || '');
          setModalErrorOpen(true)
        } else {
          setFormLimitOpen(false)
          setModalSuccessMsg('Concept Point Limit has been updated.')
          setModalSuccessOpen(true);
        }

        break;
      case "edit":
        const res_edit = await putService(`/master/asset/concept-point-edit/${selectedId}`, newData);
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
    // if (resetForm) resetForm(); // reset form
    if (resetForm) {
      setTimeout(() => {
        resetForm();
        setFormData(null);
      }, 200);
    }
  };

  const openCreateForm = (mode: any) => {
    // if (mode == "create") {
    //   setFormMode('create');
    // } else {
    //   setFormMode('period');
    // }
    setFormMode('create');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openLimitForm = (mode: any) => {
    setFormMode('period');
    setFormData(fdInterface);
    setFormLimitOpen(true);
  };

  const openEditForm = (id: any) => {
    //  fetchDataDiv(id);
    setSelectedId(id);
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.concept_point = filteredData.concept_point;
      fdInterface.type_concept_point_id = filteredData.type_concept_point_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date !== null ? new Date(filteredData.end_date) : null;
    }
    setFormMode('edit');
    setFormData(fdInterface);
    setFormOpen(true);
  };

  const openViewForm = (id: any) => {
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.concept_point = filteredData.concept_point;
      fdInterface.type_concept_point_id = filteredData.type_concept_point_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
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
      const response: any = await getService(`/master/account-manage/history?type=concept-point&method=all&id_value=${id}`);
      const valuesArray = response.map((item: any) => item.value);

      let mappings = [
        // { key: "entry_exit.name", title: "Entry/Exit" },
        { key: "concept_point", title: "Concept Points" },
        { key: "type_concept_point.name", title: "Type Concept Points" },
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
  // const [itemsPerPage, setItemsPerPage] = useState(10);

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // const handleItemsPerPageChange = (itemsPerPage: number) => {
  //   setItemsPerPage(itemsPerPage);
  //   setCurrentPage(1);
  // };

  // const paginatedData = Array.isArray(filteredDataTable)
  //   ? filteredDataTable.slice(
  //     (currentPage - 1) * itemsPerPage,
  //     currentPage * itemsPerPage
  //   )
  //   : [];

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'name', label: 'Concept Points', visible: true },
    { key: 'type', label: 'Type Concept Points', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'concept_points', label: 'Concept Points', visible: true },
    { key: 'type_concept_points', label: 'Type Concept Points', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'updated_by', label: 'Updated by', visible: true }
  ];

  const initialColumnsLimitConceptPoint: any = [
    { key: 'shipper_name', label: 'Shipper Name', visible: true },
    { key: 'concept_point', label: 'Concept Point', visible: true },
    { key: 'created_by', label: 'Created by', visible: true },
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
        accessorKey: "name",
        header: "Concept Points",
        enableSorting: true,
        accessorFn: (row: any) => row?.concept_point || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.concept_point ? row?.concept_point : ''}</div>
          )
        }
      },
      {
        accessorKey: "type_concept_point.name",
        header: "Type Concept Points",
        enableSorting: true,
        // accessorFn: (row: any) => row?.type_concept_point?.name || '',
        cell: ({ getValue, row }: { getValue: () => any, row: Row<any> }) => {
          const value = getValue()
          return (
            <div>{value ? value : ''}</div>
          )
        },
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
      permission = findRoleConfigByMenuName('Concept Point', userDT)

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
        setOpenPopoverId(null); // close popover
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
            id="searchConceptPoint"
            label="Concept Point"
            // type="select"
            type="select-multi-checkbox"
            value={srchConceptPoint}
            onChange={(e) => {
              setSrchConceptPoint(e.target.value)
              setSrchTypeConcept([])
            }}
            options={dataTable?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.concept_point
            }))}
          />

          <InputSearch
            id="searchTypeConcept"
            label="Type Concept Point"
            // type="select"
            type="select-multi-checkbox"
            value={srchTypeConcept}
            onChange={(e) => setSrchTypeConcept(e.target.value)}
            // options={typeConceptPoint?.data?.map((item: any) => ({
            //   value: item?.id?.toString(),
            //   label: item.name
            // }))}
            options={typeConceptPointMaster?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
            customWidth={250}
          // customWidthPopup={180}
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
              userPermission?.f_create && <>
                <Button className="flex items-center justify-center gap-3 px-2  h-[44px] w-[190px] bg-[#36B1AB] font-light normal-case" onClick={() => openLimitForm('create-period')}>
                  <span>{`Concept Point Limit`}</span>
                  <AddCircleIcon style={{ fontSize: "16px" }} />
                </Button>

                <Button className="flex items-center justify-center gap-3 px-2  h-[44px] w-[100px] bg-[#00ADEF]" onClick={() => openCreateForm('create')}>
                  <span className="font-light normal-case">{`New`}</span>
                  <AddCircleIcon style={{ fontSize: "16px" }} />
                </Button>
              </>
            }
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
              <BtnExport textRender={"Export"} data={filteredDataTable} path="dam/concept-point" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={columnVisibility} initialColumns={initialColumns} />
            </div>
          </div>
        </div>

        <TableConceptPoint
          openEditForm={openEditForm}
          openViewForm={openViewForm}
          openHistoryForm={openHistoryForm}
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
            path="dam/concept-point"
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
            <div className="text-center">
              {`${modalErrorMsg}`}
            </div>
          </div>
        }
        stat="error"
      />

      <ModalAction
        mode={formMode}
        data={formData}
        open={formOpen}
        // typeConceptData={typeConceptPoint?.data}
        typeConceptData={typeConceptPointMaster}
        dataTable={dataTable}
        limitConceptPointData={limitConceptPointData}
        shipperGroupData={shipperGroupData?.data}
        setLimitDataPost={setLimitDataPost}
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

      <ModalLimit
        mode={formMode}
        data={formData}
        open={formLimitOpen}
        // typeConceptData={typeConceptPoint?.data}
        typeConceptData={typeConceptPointMaster}
        dataTable={dataTable}
        limitConceptPointData={limitConceptPointData}
        shipperGroupData={shipperGroupData?.data}
        setLimitDataPost={setLimitDataPost}
        onClose={() => {
          setFormLimitOpen(false);
          if (resetForm) {
            setTimeout(() => {
              resetForm();
              setFormData(null);
            }, 200);
          }
        }}
        onSubmit={handleFormSubmit}
        setResetForm={setResetForm}
        userPermission={userPermission}
        initialColumns={initialColumnsLimitConceptPoint}
      />

      <ModalHistory
        open={historyOpen}
        handleClose={handleCloseHistoryModal}
        tableType="concept-point"
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