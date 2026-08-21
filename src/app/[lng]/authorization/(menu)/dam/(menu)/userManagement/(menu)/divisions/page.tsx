"use client";
import { useEffect, useMemo, useState } from "react";
import {
  findRoleConfigByMenuName,
  formatDate,
  generateUserPermission,
  toDayjs,
} from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnExport from "@/components/other/btnExport";
import { getService, postService } from "@/utils/postService";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnGeneral from "@/components/other/btnGeneral";
import ModalSync from "./form/modalSync";
import ModalComponent from "@/components/other/ResponseModal";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
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
  const [dataTable, setData] = useState<any>([]);

  // ############### PERMISSION ###############
  const [userPermission, setUserPermission] = useState<any>();
  // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
  let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
  user_permission = user_permission ? decryptData(user_permission) : null;

  const getPermission = () => {
    try {
      user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

      const permission = findRoleConfigByMenuName('Division Master', userDT)
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

  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
  const [dataExport, setDataExport] = useState<any>([]);

  const [srchDivName, setSrchDivName] = useState("");
  const [srchDivShrtName, setSrchDivShrtName] = useState("");
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);

  const [dateNew, setDateNew] = useState<any>(null);
  const [key, setKey] = useState(0);

  const handleFieldSearch = () => {
    // const res_filtered_date: any = filterStartEndDate(dataTable, srchStartDate, srchEndDate);
    const localDate = toDayjs(srchStartDate).format("YYYY-MM-DD");

    const result_2 = dataTable?.filter((item: any) => {
      const createDate = toDayjs(item?.create_date).format("YYYY-MM-DD");

      return (
        (srchDivName ? item?.division_name.toLowerCase().includes(srchDivName.toLowerCase()) : true) &&
        (srchDivShrtName ? item?.division_short_name.toLowerCase().includes(srchDivShrtName.toLowerCase()) : true) &&
        (srchStartDate ? localDate == createDate : true)
        // (srchStartDate ? formatSearchDate(item?.create_date) === formatSearchDate(srchStartDate) : true) &&
        // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true)
      );
    });
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(result_2);
  };

  const handleReset = () => {
    setSrchDivName("");
    setSrchDivShrtName("");
    setSrchStartDate(null);
    setSrchEndDate(null);
    setFilteredDataTable(dataTable);

    // ---
    setDateNew(null);
    setKey((prevKey) => prevKey + 1);
  };

  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {

    const filtered = dataTable.filter(
      (item: any) => {
        const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();

        return (
          item?.division_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.division_id?.toLowerCase().includes(queryLower) ||
          formatDate(item?.create_date)?.toLowerCase().includes(queryLower) ||
          item?.division_short_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
          // item?.id?.toLowerCase().includes(query.toLowerCase())
        )
      }
    );
    setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
    setFilteredDataTable(filtered);
  };

  // ############### DATA TABLE ###############
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const response: any = await getService(`/master/account-manage/division-master`);
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
    getPermission();
  }, []);

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

  // const paginatedData = filteredDataTable?.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // const paginatedData = Array.isArray(filteredDataTable)
  //   ? filteredDataTable.slice(
  //     (currentPage - 1) * itemsPerPage,
  //     currentPage * itemsPerPage
  //   )
  //   : [];

  // ############### SYNC ###############
  const [openSync, setOpenSync] = useState<any>(false);
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
  const [isModalFailedOpen, setModalFailedOpen] = useState(false);
  const [modalFailedMsg, setModalFailedMsg] = useState('Data sync failed.');

  const handleOpenSync = async () => {
    setOpenSync(true)

    try {
      const res_sync = await postService('/master/account-manage/division-sync', {});
      // const status = res_sync?.response?.data?.status ?? res_sync?.response?.data?.statusCode;
      const status = res_sync?.response?.data?.statusCode ?? res_sync?.response?.data?.status ?? res_sync?.status ?? res_sync?.statusCode ?? res_sync?.code ?? res_sync?.response?.status;
      const errorMessage = res_sync?.response?.data?.message ?? res_sync?.response?.data?.error ?? res_sync?.message ?? res_sync?.error ?? "Data sync failed.";
      if (status >= 400) {
        setOpenSync(false);
        setModalFailedMsg(errorMessage);
        setModalFailedOpen(true)
      } else {
        setOpenSync(false);
        setModalSuccessMsg("Data has been synced.")
        setModalSuccessOpen(true)

        await fetchData();
      }

    } catch (error) {
      setOpenSync(false);
      setModalFailedMsg("Data sync failed.");
      setModalFailedOpen(true)
    }
  };

  // ############### COLUMN SHOW/HIDE ###############
  const initialColumns: any = [
    { key: 'division_id', label: 'Division ID', visible: true },
    { key: 'division_name', label: 'Division Name', visible: true },
    { key: 'division_short_name', label: 'Division Short Name', visible: true },
    { key: 'create_date', label: 'Create Date', visible: true },
    // { key: 'start_date', label: 'Start Date', visible: true },
    // { key: 'end_date', label: 'End Date', visible: true },
    // { key: 'create_by', label: 'Created by', visible: true },
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

  const handleColumnToggle = (columnKey: any) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      ...columnKey
    }));
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "division_id",
        header: "Division ID",
        enableSorting: true,
        accessorFn: (row: any) => row?.division_id || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.division_id}</div>
          )
        }
      },
      {
        accessorKey: "division_name",
        header: "Division Name",
        enableSorting: true,
        accessorFn: (row: any) => row?.division_name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.division_name}</div>
          )
        }
      },
      {
        accessorKey: "division_short_name",
        header: "Division Short Name",
        enableSorting: true,
        accessorFn: (row: any) => row?.division_short_name || '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div>{row?.division_short_name}</div>
          )
        }
      },
      {
        accessorKey: "create_date",
        header: "Create Date",
        enableSorting: true,
        accessorFn: (row: any) => formatDate(row?.create_date) || '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <div className={`text-[#464255]`}>{row?.create_date ? formatDate(row?.create_date) : ''}</div>
          )
        }
      },
    ], []
  )

  return (
    <div className=" space-y-2">
      <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl flex flex-col sm:flex-row gap-2">
        <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
          <InputSearch
            id="searchName"
            label="Division Name"
            value={srchDivName}
            onChange={(e) => setSrchDivName(e.target.value)}
            placeholder="Search Division Name"
          />

          <InputSearch
            id="searchShortName"
            label="Division Short Name"
            value={srchDivShrtName}
            onChange={(e) => setSrchDivShrtName(e.target.value)}
            placeholder="Search Division Short Name"
            customWidth={240}
          />

          {/* <div className="mr-3"> */}
          <DatePickaSearch
            key={"start" + key}
            label="Create Date"
            placeHolder="Select Create Date"
            allowClear
            onChange={(e: any) => setSrchStartDate(e ? e : null)}
          />
          {/* </div> */}
          <BtnSearch handleFieldSearch={handleFieldSearch} />
          <BtnReset handleReset={handleReset} />
        </aside>
        <aside className="mt-auto ml-1 w-full sm:w-auto">
          <div className="flex flex-wrap gap-2 justify-end">
            <BtnGeneral textRender={"Sync"} bgcolor={"#00ADEF"} modeIcon={'sync'} generalFunc={handleOpenSync} can_sync={userPermission ? userPermission?.f_create : false} />
          </div>
        </aside>
      </div>

      {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
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
                data={filteredDataTable} path="dam/division"
                can_export={userPermission ? userPermission?.f_export : false}
                columnVisibility={columnVisibility} initialColumns={initialColumns}
                specificMenu={'division'}
              />
            </div>
          </div>
        </div>
        <TableDivision
          dataTable={paginatedData}
          isLoading={isLoading}
          columnVisibility={columnVisibility}
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
            path="dam/division"
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

      <ModalSync
        open={openSync}
        // handleClose={handleCloseModal}
        onClose={() => {
          setOpenSync(false);
        }}
      // title="Success"
      // description="Operator has been added."
      />

      <ModalComponent
        open={isModalFailedOpen}
        handleClose={() => {
          setModalFailedOpen(false);
          // if (resetForm) resetForm();
        }}
        title="Failed"
        description={
          <div>
            <div className="text-center">
              {modalFailedMsg}
            </div>
            {/* <div className="text-center">
              {" Please contact administrator."}
            </div> */}
          </div>
        }
        stat="error"
      />

      <ModalComponent
        open={isModalSuccessOpen}
        handleClose={() => {
          setModalSuccessOpen(false);
        }}
        title="Success"
        description={modalModalSuccessMsg}
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
