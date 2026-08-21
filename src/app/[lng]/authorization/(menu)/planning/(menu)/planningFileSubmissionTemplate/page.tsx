"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import ModalComponent from "@/components/other/ResponseModal";
import { fillMissingUpdateByAccount, filterStartEndDate, filterStartEndDateInRange, filterStartEndDateNewLogic, formatDate, formatDateNoTime, formatDateTimeSec, formatTime, generateUserPermission } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService, postService, putService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import PaginationComponent from "@/components/other/globalPagination";
import ModalHistory from "@/components/other/modalHistory";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchTermType } from "@/utils/store/slices/termTypeMasterSlice";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import ModalFiles from "./form/modalFiles";
import ModalViewPoint from "./form/modalViewPoint";
import TablePlanningFileSubmissionTemplate from "./form/table";
import BtnAddNew from "@/components/other/btnAddNew";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";

interface ClientProps {
  params: {
    lng: string;
  };
}

const ClientPage: React.FC<ClientProps> = (props) => {
  const userDT: any = getUserValue();

  // ############### Check Authen ###############
  const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
  useRestrictedPage(token);

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>();
  let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const getPermission = () => {
    if (user_permission) {
      try {
        user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
        const updatedUserPermission = generateUserPermission(user_permission);
        setUserPermission(updatedUserPermission);
      } catch (error) {
        // Failed to parse user_permission:
      }
    } else {
      // No user_permission found
    }
  }

  // ############### REDUX DATA ###############
  const { shipperGroupData, termTypeMaster, nominationPointData, entryExitMaster } = useFetchMasters();
  const [forceRefetch, setForceRefetch] = useState(true);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (forceRefetch || !shipperGroupData?.data) {
      dispatch(fetchShipperGroup());
    }
    if (forceRefetch || !termTypeMaster?.data) {
      dispatch(fetchTermType());
    }
    // Reset forceRefetch after fetching
    if (forceRefetch) {
      setForceRefetch(false); // Reset the flag after triggering the fetch
    }
    getPermission();
  }, [dispatch, nominationPointData, forceRefetch]); // Watch for forceRefetch changes

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [key, setKey] = useState(0);
  const [srchPlanningCode, setSrchPlanningCode] = useState('');
  const [srchShipper, setSrchShipper] = useState<any>([]);
  const [srchTermType, setSrchTermType] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

  const handleFieldSearch = () => {
    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
    const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed

    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        // (srchPlanningCode ? item?.id == srchPlanningCode : true) &&
        // (srchPlanningCode ? item?.id.toLowerCase().includes(srchPlanningCode.toLowerCase()) : true) &&
        // (srchShipper ? item?.group_id == srchShipper : true) &&
        // (srchTermType ? item?.term_type_id == srchTermType : true)

        // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
        (srchShipper?.length > 0 ? srchShipper.includes(item?.group_id) : true) &&
        (srchTermType?.length > 0 ? srchTermType.includes(item?.term_type_id.toString()) : true)
      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    setSrchShipper([])
    setSrchTermType([])
    setSrchPlanningCode('')
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {
    const filtered = dataTable.filter((item: any) => {
      const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();

      return (
        item?.term_type?.name?.replace(/\s+/g, '').trim().toLowerCase().includes(queryLower) ||
        item?.group?.name?.replace(/\s+/g, '').trim().toLowerCase().includes(queryLower) ||

        item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
        item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
        item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

        item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
        item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search นามสกุล
        item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

        formatTime(item?.create_date)?.toLowerCase().includes(queryLower) ||
        formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
        formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
        formatTime(item?.update_date)?.toLowerCase().includes(queryLower) ||
        formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
        formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

        formatDateNoTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
        formatTime(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
        formatDate(item?.start_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||

        formatDateNoTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
        formatTime(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase()) ||
        formatDate(item?.end_date)?.toLowerCase().includes(query.replace(/\s+/g, '')?.toLowerCase())
      )
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก

    setFilteredDataTable(filtered);
  };

  // ############### DATA TABLE ###############
  const [dataTable, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resetForm, setResetForm] = useState<() => void | null>();

  const fetchData = async () => {
    try {

      // ถ้า user เป็น shipper
      // https://app.clickup.com/t/86ert2k28 ตามที่คุยกัน หากเป็น shipper user ถ้ามี filter ชื่อ shipper ให้ค้างชื่อ shipper ตัวเองไว้เลย ไม่ต้องขึ้นเป็น dropdown ให้เลือก - ปรับทั้ง system
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {

        setSrchShipper(userDT?.account_manage?.[0]?.group?.id)
      }

      const response: any = await getService(`/master/planning-file-submission-template`);
      // shipper เห็นแค่ของตัวเอง
      if (userDT?.account_manage?.[0]?.user_type_id == 3) {
        let filter_response_only_own_shipper = response?.filter((item: any) => item?.group?.id === userDT?.account_manage?.[0]?.group?.id)
        setData(filter_response_only_own_shipper);
        setFilteredDataTable(filter_response_only_own_shipper);
      } else {
        setData(response);
        setFilteredDataTable(response);
      }

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
  const [msgSuccess, setMsgSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>();

  const fdInterface: any = {
    planning_file_submission_template_nom: [],
    group_id: '',
    term_type_id: '',
    // start_date: new Date(),
    // end_date: new Date(),
    start_date: undefined,
    end_date: undefined,
  };

  const [formData, setFormData] = useState(fdInterface);

  const handleFormSubmit = async (data: any) => {
    console.log('-');
    if (data && data.end_date === "Invalid Date") {
      data.end_date = null;
    }

    switch (formMode) {
      case "create":
        // nomination_point_entry
        const res_create = await postService('/master/planning-file-submission-template', {
          ...data,
          nomination_point: [...data?.nomination_point_entry, ...data?.nomination_point_exit]
        });
        const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
        const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

        if (statusCode === 400 || statusCode === 500) {
          setFormOpen(false);
          setModalErrorMsg(errorMsg || '');
          setModalErrorOpen(true)
        } else {
          setMsgSuccess('Planning file submission template has been added.')
          setFormOpen(false);
          setModalSuccessOpen(true);
        }
        break;
      case "edit":
        delete data.planning_file_submission_template_nom
        delete data.id
        const res_edit = await putService(`/master/planning-file-submission-template/edit/${selectedId}`, {
          ...data,
          nomination_point: [...data?.nomination_point_entry, ...data?.nomination_point_exit]
        });
        const statusCodePut = res_edit?.response?.data?.statusCode ?? res_edit?.response?.data?.status ?? res_edit?.status ?? res_edit?.statusCode ?? res_edit?.code ?? res_edit?.response?.status;
        const errorMsgPut = res_edit?.response?.data?.error ?? res_edit?.data?.error ?? res_edit?.response?.error ?? res_edit?.error;

        if (statusCodePut === 400 || statusCodePut === 500) {
          setFormOpen(false);
          setModalErrorMsg(errorMsgPut || '');
          setModalErrorOpen(true)
        } else {
          setMsgSuccess('Your changes have been saved.')
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
    setFormData(fdInterface)
    setFormOpen(true);
  };

  const openEditForm = (id: any) => {
    //  fetchDataDiv(id);
    setSelectedId(id);
    const filteredData = dataTable.find((item: any) => item.id === id);
    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.term_type_id = filteredData.term_type_id;
      fdInterface.group_id = filteredData.group_id;
      fdInterface.planning_file_submission_template_nom = filteredData.planning_file_submission_template_nom;
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
      fdInterface.term_type_id = filteredData.term_type_id;
      fdInterface.group_id = filteredData.group_id;
      fdInterface.planning_file_submission_template_nom = filteredData.planning_file_submission_template_nom;
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
      const response: any = await getService(`/master/account-manage/history?type=planning-file-submission-template&method=all&id_value=${id}`);
      const valuesArray = response.map((item: any) => item.value);
      let mappings = [
        // { key: "entry_exit.name", title: "Entry/Exit" },
        { key: "group.name", title: "Shipper Name" },
        { key: "term_type.name", title: "Term" },
        // { key: "description", title: "Description" },
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

  // ############### MODAL ALL FILES ###############
  const [mdFileView, setMdFileView] = useState<any>(false);
  const [dataFile, setDataFile] = useState<any>([]);

  const openAllFileModal = (id?: any, data?: any) => {
    const filtered = dataTable?.find((item: any) => item.id === id);
    setDataFile(filtered)
    setMdFileView(true)
  };

  // ############### MODAL VIEW POINT ###############
  const [mdViewPoint, setMdViewPoint] = useState<any>(false);

  const openViewPointModal = (id?: any, data?: any) => {
    const filtered = dataTable?.find((item: any) => item.id === id);
    setDataFile(filtered)
    setMdViewPoint(true)
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

  const paginatedData = Array.isArray(filteredDataTable)
    ? filteredDataTable.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : [];

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'term', label: 'Term', visible: true },
    { key: 'shipper_name', label: 'Shipper Name', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
    { key: 'created_by', label: 'Created by', visible: true },
    { key: 'updated_by', label: 'Updated by', visible: true },
    { key: 'action', label: 'Action', visible: true }
  ];

  const initialColumnsHistory: any = [
    { key: 'shipper_name', label: 'Shipper Name', visible: true },
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

          <InputSearch
            id="searchShipper"
            label="Shipper Name"
            // type="select"
            type="select-multi-checkbox"
            value={srchShipper}
            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
            onChange={(e) => setSrchShipper(e.target.value)}
            options={shipperGroupData?.data?.map((item: any) => ({
              value: item.id,
              label: item.name
            }))}
          />

          <InputSearch
            id="searchTermType"
            label="Term"
            // type="select"
            type="select-multi-checkbox"
            placeholder="Select Term"
            value={srchTermType}
            onChange={(e) => setSrchTermType(e.target.value)}
            options={termTypeMaster?.data?.filter((item: any) => item.id !== 4).map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
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

      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
        <div>
          <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
            <div onClick={handleTogglePopover}>
              <Tune
                className="cursor-pointer rounded-lg"
                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              <SearchInput onSearch={handleSearch} />
              <BtnExport
                textRender={"Export"}
                data={filteredDataTable}
                path="planning/planning-file-submission-template"
                can_export={userPermission ? userPermission?.f_export : false}
                columnVisibility={columnVisibility}
                initialColumns={initialColumns}
              />
            </div>
          </div>
        </div>

        <TablePlanningFileSubmissionTemplate
          openEditForm={openEditForm}
          openViewForm={openViewForm}
          openHistoryForm={openHistoryForm}
          openAllFileModal={openAllFileModal}
          openViewPointModal={openViewPointModal}
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
        // nominationPointData={nominationPointData?.data}
        nominationPointData={filterStartEndDateInRange(nominationPointData?.data)}
        entryExitMasterData={entryExitMaster?.data}
        termTypeMasterData={termTypeMaster?.data}
        shipperGroupData={shipperGroupData?.data}
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
        description={`${msgSuccess}`}
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
        tableType="planning-file-submission-template"
        title="History"
        data={historyData}
        head_data={headData}
        initialColumns={initialColumnsHistory}
        userPermission={userPermission}
      />

      <ModalFiles
        data={dataFile}
        // dataGroup={dataGroup}
        // setModalMsg={setModalMsg}
        setModalSuccessOpen={setModalSuccessOpen}
        // setModalSuccessMsg={setModalSuccessMsg}
        open={mdFileView}
        onClose={() => {
          setMdFileView(false);
        }}
      />

      <ModalViewPoint
        data={dataFile}
        // dataGroup={dataGroup}
        // setModalMsg={setModalMsg}
        setModalSuccessOpen={setModalSuccessOpen}
        // setModalSuccessMsg={setModalSuccessMsg}
        open={mdViewPoint}
        onClose={() => {
          setMdViewPoint(false);
        }}
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