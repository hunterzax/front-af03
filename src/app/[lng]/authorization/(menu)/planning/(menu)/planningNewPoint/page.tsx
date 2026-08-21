"use client";
import { useEffect, useState } from "react";
import { Tune } from "@mui/icons-material"
import { filterStartEndDate, filterStartEndDateNewLogic, formatDate, formatDateNoTime, formatDateTimeSecNoPlusSeven, formatTime, generateUserPermission } from '@/utils/generalFormatter';
import { InputSearch } from '@/components/other/SearchForm';
import SearchInput from "@/components/other/searchInput";
import { getService } from "@/utils/postService";
import BtnExport from "@/components/other/btnExport";
import { useFetchMasters } from "@/hook/fetchMaster";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import PaginationComponent from "@/components/other/globalPagination";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { useAppDispatch } from "@/utils/store/store";
import { fetchTermType } from "@/utils/store/slices/termTypeMasterSlice";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import ModalFiles from "./form/modalFiles";
import TablePlanningNewPoint from "./form/table";
import ModalViewPoint from "./form/modalViewPoint";
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
  const { shipperGroupData, termTypeMaster, nominationPointData } = useFetchMasters();
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
  const [srchShipper, setSrchShipper] = useState<any>([]);
  const [srchTermType, setSrchTermType] = useState<any>([]);
  const [srchPlanningCode, setSrchPlanningCode] = useState<any>([]);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

  const handleFieldSearch = () => {
    // const result = filterDataTableByDateRange(dataTable, srchStartDate, srchEndDate);
    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate); // เดิมโรงงาน
    const res_filtered_date: any = filterStartEndDateNewLogic(dataTable, srchStartDate, srchEndDate); // v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed

    const result_2 = res_filtered_date?.filter((item: any) => {
      return (
        // (srchPlanningCode ? item?.id == srchPlanningCode : true) &&
        // // (srchPlanningCode ? item?.id.toLowerCase().includes(srchPlanningCode.toLowerCase()) : true) &&
        // (srchShipper ? item?.group_id == srchShipper : true) &&
        // (srchTermType ? item?.term_type_id == srchTermType : true)

        // ปรับ Filter ทุกเมนูให้เป็นแบบ Multi https://app.clickup.com/t/86eub6d11
        (srchPlanningCode?.length > 0 ? srchPlanningCode.includes(item?.id?.toString()) : true) &&
        (srchShipper?.length > 0 ? srchShipper.includes(item?.group_id) : true) &&
        (srchTermType?.length > 0 ? srchTermType.includes(item?.term_type_id?.toString()) : true)
      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    setSrchShipper([])
    setSrchTermType([])
    setSrchPlanningCode([])
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);
    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {
    const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
    const filtered = dataTable?.filter((item: any) => {
      return (
        item?.term_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.replace(/\s+/g, '')?.toLowerCase()) ||
        item?.planning_code?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.replace(/\s+/g, '')?.toLowerCase()) ||
        item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower.replace(/\s+/g, '')?.toLowerCase()) ||
        String(item?.newpoint_detail?.length) == queryLower.replace(/\s+/g, '')?.toLowerCase() ||
        String(item?.newpoint_file?.length) == queryLower.replace(/\s+/g, '')?.toLowerCase() ||

        formatDate(item?.shipper_file_submission_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '').toLowerCase()) ||
        formatTime(item?.shipper_file_submission_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '').toLowerCase()) ||
        formatDateNoTime(item?.shipper_file_submission_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '').toLowerCase()) ||
        formatDateTimeSecNoPlusSeven(item?.shipper_file_submission_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '').toLowerCase()) ||
        formatDateNoTime(item?.start_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '').toLowerCase()) ||
        formatDateNoTime(item?.end_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '').toLowerCase())
      )
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(filtered);
  };

  const [isModalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => setModalOpen(true);

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

      const response: any = await getService(`/master/newpoint`);

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
    { key: 'planning_code', label: 'Planning Code', visible: true },
    { key: 'shipper_name', label: 'Shipper Name', visible: true },
    { key: 'newpoint_detail', label: 'Point', visible: true },
    { key: 'file', label: 'File', visible: true },
    { key: 'shipper_file_date', label: 'Submitted Timestamp', visible: true },
    { key: 'start_date', label: 'Start Date', visible: true },
    { key: 'end_date', label: 'End Date', visible: true },
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

          <DatePickaSearch
            key={"start" + key}
            label="Start Date"
            placeHolder="Select Start Date"
            allowClear
            onChange={(e: any) => setSrchStartDate(e ? e : null)}
          />

          <InputSearch
            id="searchShipper"
            label="Shipper Name"
            // type="select"
            type="select-multi-checkbox"
            value={srchShipper}
            onChange={(e) => setSrchShipper(e.target.value)}
            isDisabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
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
            value={srchTermType}
            onChange={(e) => setSrchTermType(e.target.value)}
            options={termTypeMaster?.data?.filter((f: any) => f?.id !== 4)?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.name
            }))}
          />

          <InputSearch
            id="searchPlanningCode"
            label="Planning Code"
            // type="select"
            type="select-multi-checkbox"
            value={srchPlanningCode}
            onChange={(e) => setSrchPlanningCode(e.target.value)}
            placeholder="Select Planning Code"
            options={dataTable?.map((item: any) => ({
              value: item?.id?.toString(),
              label: item.planning_code
            }))}
          />

          <BtnSearch handleFieldSearch={handleFieldSearch} />
          <BtnReset handleReset={handleReset} />
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
                path="planning/new-point"
                can_export={userPermission ? userPermission?.f_export : false}
                columnVisibility={columnVisibility}
                initialColumns={initialColumns}
              />
            </div>
          </div>
        </div>

        <TablePlanningNewPoint
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

      <ModalFiles
        data={dataFile}
        setModalSuccessOpen={setModalSuccessOpen}
        open={mdFileView}
        onClose={() => {
          setMdFileView(false);
        }}
      />

      <ModalViewPoint
        data={dataFile}
        setModalSuccessOpen={setModalSuccessOpen}
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