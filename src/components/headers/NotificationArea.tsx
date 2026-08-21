"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
} from "@mui/material";
import {
  VisibilityOutlined,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import AppTable, { myCustomSortingByDateFn } from "@/components/table/AppTable";
import { ColumnDef } from "@tanstack/react-table";
import BtnGeneral from "@/components/other/btnGeneral";
import { iconButtonClass, toDayjs } from "@/utils/generalFormatter";
import { getStoredNotifications, markAllAsRead, markAsRead } from "@/components/other/notifyStorage";
import ModalNotification from "./form/modalNoti";
import { getService, postService } from "@/utils/postService";
import ModalConfirmSave from "../other/modalConfirmSave";
import ModalComponent from "../other/ResponseModal";
import tempMenu from "./tempMenu";
import getUserValue from "@/utils/getuserValue";
 
// const moduleTabs = [
//   { name: "DAM" },
//   { name: "Capacity Management" },
//   { name: "Planning" },
//   { name: "Nominations" },
//   { name: "Metering" },
//   { name: "Allocation" },
//   { name: "Balancing" },
//   { name: "Tariff" },
//   { name: "Event" },
// ];

const NotificationArea = React.forwardRef<HTMLDivElement, { data: any[], onUpdateBadge?: () => void, setUnreadCount?: any }>(({ data, onUpdateBadge, setUnreadCount }, ref) => {
  const userDT: any = getUserValue();

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 10, //default page size
  });

  const initialColumns: any = [
    { key: 'isread', label: 'Acknowledge', visible: true },
    { key: 'id', label: 'ID', visible: true },
    { key: 'module', label: 'Module', visible: true },
    { key: 'message', label: 'Message', visible: true },
    { key: 'view', label: 'View', visible: true },
    { key: 'createdDate', label: 'Created Date', visible: true }
  ];

  const [columnVisibility, setColumnVisibility] = useState<any>(
    Object.fromEntries(initialColumns.filter((item: any) => item?.key !== 'gas_hour')?.map((column: any) => [column.key, column.visible]))
  );

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const menu_authorization = tempMenu();

  const [notifications, setNotifications] = useState<any[]>(data ?? []);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [activeModule, setActiveModule] = useState("");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const handleCloseModal = () => setModalSuccessOpen(false);
  const [detailnotiOpen, setdetailnotiOpen] = useState(false);
  const [detailnotiData, setdetailnotiData] = useState<any>();
  const [finalData, setFinalData] = useState<any>([]);
  const [finalDataByTabModule, setFinalDataByTabModule] = useState<any>([]);
  const [tabList, settabList] = useState<any>([]);

  const [ckList, setCkList] = useState<any>([]);

  const checkRole = async () => {
    const menusConfig = userDT?.account_manage?.[0]?.account_role?.[0]?.role?.menus_config
    // const parentMain = menusConfig?.filter((f:any) => f?.parent === 0)
    let menu = [
        { id: 9, name: "DAM" },
        { id: 49, name: "Capacity Management" },
        { id: 44, name: "Planning" },
        { id: 61, name: "Nominations" },
        { id: 76, name: "Metering" },
        { id: 80, name: "Allocation" },
        { id: 87, name: "Balancing" },
        { id: 102, name: "Tariff" },
        { id: 105, name: "Event" },
      ]
    const menu_ = menu?.filter((f:any) => {
      // const parentSub = menusConfig?.filter((mc:any) => mc?.menus?.parent === f?.id)?.find((ck_:any) => ck_?.f_noti_inapp === 1)
      const parentSub = menusConfig?.filter((mc:any) => mc?.menus?.parent === f?.id)?.find((ck_:any) => ck_?.f_noti_inapp === 1)
      return !!parentSub
    })
    // console.log('menusConfig : ', menusConfig); 
    // console.log('menu_ : ', menu_);
    setActiveModule(menu_?.[0]?.name || "")
    setCkList(menu_)
  }
  useEffect(() => {
    checkRole()
  }, [])

  {/* Confirm Save */ }
  const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
  const [modaConfirmSaveAll, setModaConfirmSaveAll] = useState<any>(false)
  const [modeAcknowledge, setModeAcknowledge] = useState<any>('')

  // Handle individual notification selection
  const handleNotificationSelect = (id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id)
        ? prev.filter(notificationId => notificationId !== id)
        : [...prev, id]
    );
  };

  // Handle select all notifications
  const handleSelectAll = (module_name?: any) => {
    let menu_check = module_name !== "NO_DATA" ? module_name : activeModule

    // const data_noti_selected = notifications?.filter((notification: any) => (notification.title === activeModule))
    const data_noti_selected = notifications?.filter((notification: any) => (notification.title === menu_check))

    // if (selectedNotifications.length === notifications.length) {
    if (selectedNotifications.length === data_noti_selected.length) {
      setSelectedNotifications([]);
    } else {
      // setSelectedNotifications(notifications.map(n => n.id));
      setSelectedNotifications(data_noti_selected.map(n => n.id));
    }
  };

  // #region acknowledge one by one
  // Handle acknowledge selected notifications
  const handleAcknowledge = async () => {
    await markAsRead(selectedNotifications)
    onUpdateBadge?.()
    // setNotifications(prev =>
    //   prev.map(notification =>
    //     selectedNotifications.includes(notification.id)
    //       ? { ...notification, isRead: true }
    //       : notification
    //   )
    // );
    setSelectedNotifications([]);

    // เอาไว้ใช้ตอน acknowledge
    // const readIds = new Set((selectedNotifications ?? []).map((x:any) => x?.id));
    const payload = {
      // data:[1, 2, 4]
      data: selectedNotifications
    }

    try {
      const res_data_readed = await postService(`/master/account-manage/noti-read`, payload);

      if (res_data_readed) {
        setModalSuccessMsg('Notifications has been acknowledged.')
        setModalSuccessOpen(true);
      }

    } catch (error) {

    }
  };

  const confirmAcknowledge = (mode: any) => {
    setModeAcknowledge(mode)

    if (mode == 'all') {
      setModaConfirmSaveAll(true)
    } else {
      setModaConfirmSave(true)
    }
  }

  // #region acknowledge all
  // Handle acknowledge all notifications
  const handleAcknowledgeAll = async () => {
    await markAllAsRead()
    onUpdateBadge?.()
    // setNotifications(prev =>
    //   prev.map(notification => ({ ...notification, isRead: true }))
    // );
    setSelectedNotifications([]);

    // const id_all_noti = new Set((notification ?? []).map((x:any) => x?.id));
    const id_all_noti = (finalData ?? []).map((x: any) => x?.id);

    const payload = {
      // data:[1, 2, 4]
      data: id_all_noti
    }

    try {
      const res_data_readed = await postService(`/master/account-manage/noti-read`, payload);

      if (res_data_readed) {
        setModalSuccessMsg('All module notifications have been acknowledged.')
        setModalSuccessOpen(true);
      }
    } catch (error) {

    }
  };

  // Handle view notification
  const handleViewNotification = (id: number) => {
    const findDT: any = notifications?.find((item: any) => item?.id == id)
    if (findDT) {
      setdetailnotiOpen(true)
      setdetailnotiData(findDT)
    }
  };

  // Handle scroll left
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  // Handle scroll right
  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "isRead",
        // header: (info) => {
        header: ({ table }) => {

          const visibleRows = table.getFilteredRowModel().rows;
          let module_name = "NO_DATA"
          if (visibleRows?.length > 0) {
            module_name = visibleRows?.[0]?.original?.title
          }

          return (
            <div className="flex gap-2">
              <input
                type="checkbox"
                // checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                // checked={selectedNotifications.length === notifications?.filter((notification: any) => (notification.title == activeModule)).length && notifications.length > 0}
                checked={selectedNotifications.length === notifications?.filter((notification: any) => (notification.title == activeModule)).length && notifications.length > 0}
                onChange={() => handleSelectAll(module_name)}
                className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
              />
              <div>
                {/* {`Acknowledge`} */}
                {`Ack.`}
              </div>
            </div>
          )
        },
        enableSorting: false,
        accessorFn: (row: any) => selectedNotifications.includes(row.id) ? 'Acknowledged' : 'Not Acknowledged',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            <input
              type="checkbox"
              checked={selectedNotifications.includes(row.id)}
              onChange={() => handleNotificationSelect(row.id)}
              className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed ml-[-8px]"
            />
          )
        }
      },
      {
        accessorKey: "id",
        header: "ID",
        enableSorting: false,
        // accessorFn: (row: any) => row.id || '',
        // sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{row?.gas_day ? toDayjs(row?.gas_day).format('DD/MM/YYYY') : null}</div>)
        // }
      },
      // {
      //   accessorKey: "title",
      //   header: "Menu",
      //   enableSorting: false,
      //   meta: {
      //     width: 100,
      //   },
      //   // accessorFn: (row: any) => row?.module || '',
      //   // cell: (info) => {
      //   //     const row: any = info?.row?.original
      //   //     return (<div>{''}</div>)
      //   // }
      // },
      {
        accessorKey: "extras.menus_name",
        header: "Menu",
        enableSorting: false,
        meta: {
          width: 100,
        },
        accessorFn: (row: any) => row?.extras?.menus_name ?? "",
        cell: (info) => {
          const row: any = info?.row?.original
          return (<div>{row?.extras?.menus_name || ""}</div>)
        }
      },
      {
        accessorKey: "message",
        header: "Message",
        enableSorting: false,
        // accessorFn: (row: any) => row?.message || '',
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{row?.message ? row?.message : null}</div>)
        // }
        cell: (info) => {
          const row: any = info?.row?.original
          return (<div className="two-line-ellipsis">{row?.message}</div>)
        }
      },
      {
        accessorKey: "view",
        header: "View",
        enableSorting: false,
        accessorFn: (row: any) => '',
        cell: (info) => {
          const row: any = info?.row?.original
          return (
            // <button
            //   type="button"
            //   className="flex items-center justify-center px-[2px] py-[2px] rounded-md hover:bg-blue-600 border border-[#DFE4EA] relative"
            //   onClick={() => handleViewNotification(row.id)}
            // >
            //   <VisibilityOutlined sx={{ fontSize: 18, color: '#1473A1', '&:hover': { color: '#ffffff' } }} />
            // </button>

            <button
              type="button"
              className={iconButtonClass}
              onClick={() => handleViewNotification(row.id)}
            >
              <VisibilityOutlined
                fontSize="inherit"
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                sx={{ color: 'currentColor', fontSize: 18 }}
              />
            </button>
          )
        }
      },
      {
        accessorKey: "date",
        header: "Created Date",
        enableSorting: false,
        meta: {
          width: 150,
        },
        accessorFn: (row: any) => row.date ? toDayjs(row.date).format('DD/MM/YYYY HH:mm:ss') : '',
        sortingFn: myCustomSortingByDateFn,
        // sortingFn: 'datetime', // recommended for date columns 
        // sortUndefined: -1,
        // cell: (info) => {
        //     const row: any = info?.row?.original
        //     return (<div>{row?.", ? toDayjs(row?.",).format('DD/MM/YYYY HH:mm:ss') : null}</div>)
        // }
      },
    ], [selectedNotifications]
  )

  const getReadedNoti = async (data_noti?: any) => {
    try {
      const res_readed_data = await getService(`/master/account-manage/noti-read`);

      // กรองข้อมูลอ่านแล้วออกไปซะ
      const readIds = new Set((res_readed_data ?? [])?.map((x: any) => x?.id_noti));
      // const readIds = (res_readed_data ?? []).map((x: any) => x?.id_noti);

      const filtered = (data_noti ?? []).filter((x: any) => !readIds.has(x?.id));
      setFinalData(filtered) // ----> กรองอ่านแล้วออก
      // กรอง noti เกี่ยวกับ login ออก
      const clearOnlyLogin = filtered?.filter((item: any) => item?.title !== 'login')
      
      // หาข้อมูลที่เกี่ยวกับกับเมนูที่ user สามารถเห็นได้ 
      const nameSet = new Set(menu_authorization.map((item: any) => item.name));
      const result = clearOnlyLogin?.filter((item: any) => {
        if(item.title === "Nomination"){

          return nameSet.has(item.title + "s")
        }else{

          return nameSet.has(item.title)
        }
      });
      const tabFilter = ckList?.filter((item: any) =>
        nameSet.has(item.name)
      );
      console.log('ckList : ', ckList);
      console.log('tabFilter : ', tabFilter);

      settabList(tabFilter)
      // settabList
      // เอาไว้ทำเลขเหนือกระดิ่ง
      const count_noti = result?.length > 0 ? result?.length : 0
      setUnreadCount(count_noti)
     
      const data_ = result?.filter((notification: any) => notification.title === activeModule)

      setFinalDataByTabModule(data_)

    } catch (error) {

    }
  }

  useEffect(() => {
    const fn_ = async () => {
      const storedNotification = await getStoredNotifications()
      setNotifications(storedNotification)
      getReadedNoti(storedNotification);
    }
    fn_()
    // getReadedNoti(data);
  }, [data, isModalSuccessOpen, ckList])

  useEffect(() => {
    setSelectedNotifications([])
    const data_ = finalData?.filter((notification: any) => notification.title === activeModule)
    setFinalDataByTabModule(data_)
  }, [activeModule])  

  return (<>

    <div className="flex !w-[1050px] border-none rounded-[20px]">
      <Box ref={ref} className="p-6 bg-white w-full  border-none z-40 rounded-[20px]">
        {/* <Box ref={ref} sx={style}> */}
        {/* Header */}
        <div className="mb-5">
          <div className="text-[#00ADEF] text-lg font-bold">
            Notification
          </div>
          <div className="flex justify-end">
            <BtnGeneral
              textRender={"Acknowledge All"}
              iconNoRender={true}
              bgcolor={"#00ADEF"}
              // generalFunc={() => handleAcknowledgeAll()}
              generalFunc={() => confirmAcknowledge('all')}
              disable={false}
              customWidthSpecific={140}
              // can_create={userPermission ? userPermission?.f_create : false}
              can_create={true}
            />
          </div>
        </div>

        {/* Module Navigation Tabs */}
        <Box className="mb-2">
          <Box className="flex items-center">
            <div
              className={`border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white flex-shrink-0`}
              onClick={handleScrollLeft}
            >
              <KeyboardArrowLeft style={{ fontSize: "20px", marginBottom: "1px" }} />
            </div>

            <Box
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto no-scrollbar flex-1 px-4"
            >
              {tabList?.map((tab: any, index: any) => (
                <Box
                  key={index}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer flex-shrink-0 ${tab.name === activeModule ? "border-b-2 border-[#464255]" : ""}`}
                  onClick={() => {
                    setActiveModule(tab.name)
                  }}
                >
                  <div className={`text-sm text-[#37352F] ${tab.name === activeModule ? "font-bold" : "font-normal"}`}>
                    {tab.name}
                  </div>
                  {/* {
                    notifications?.some((notification: any) => (notification.title === tab.name) && (notification.isRead != true)) &&
                    <div
                      className={`flex items-center justify-center py-0.5 px-1.5 rounded-[6px] text-white ${tab.name === activeModule ? "bg-[#EB5757]" : "bg-[#9CA3AF]"}`}
                    >
                      <span className="font-bold text-center normal-case text-xs">
                        {`${notifications.filter((notification: any) => (notification.title === tab.name) && (notification.isRead != true)).length > 99 ? '99+' : notifications.filter((notification: any) => (notification.title === tab.name) && (notification.isRead != true)).length}`}
                      </span>
                    </div>
                  } */}
                  {
                    finalData?.some((notification: any) => (notification.title === tab.name)) &&
                    <div className={`flex items-center justify-center py-0.5 px-1.5 rounded-[6px] text-white ${tab.name === activeModule ? "bg-[#EB5757]" : "bg-[#9CA3AF]"}`}>
                      <span className="font-bold text-center normal-case text-xs">
                        {`${finalData.filter((notification: any) => (notification.title === tab.name)).length > 99 ? '99+' : finalData.filter((notification: any) => (notification.title === tab.name)).length}`}
                      </span>
                    </div>
                  }
                </Box>
              ))}
            </Box>

            <div
              className={`border-[#DFE4EA] border-[1px] rounded-md cursor-pointer bg-white flex-shrink-0`}
              onClick={handleScrollRight}
            >
              <KeyboardArrowRight style={{ fontSize: "20px", marginBottom: "1px" }} />
            </div>
          </Box>
        </Box>

        {/* Notification Table */}
        <div className="h-auto overflow-auto">
          <AppTable
            // data={notifications.filter((notification: any) => notification.title === activeModule)}
            // data={finalData.filter((notification: any) => notification.title === activeModule)}
            data={finalDataByTabModule}
            columns={columns}
            isLoading={true}
            exportBtn={
              <BtnGeneral
                textRender={"Acknowledge"}
                iconNoRender={true}
                bgcolor={"#24AB6A"}
                // generalFunc={() => handleAcknowledge()}
                generalFunc={() => confirmAcknowledge('one')}

                disable={selectedNotifications.length === 0}
                customWidthSpecific={120}
                // can_create={userPermission ? userPermission?.f_create : false}
                can_create={true}
              />
            }
            initialColumns={Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))}
            onColumnVisibilityChange={(columnKey: any) => handleColumnToggle(columnKey)}
            // onFilteredDataChange={(filteredData: any) => {
            //     const newData = filteredData || [];
            //     // Check if the filtered data is different from current dataExport
            //     if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
            //         setDataExport(newData);
            //     }
            // }}
            pagination={pagination}
            setPagination={setPagination}
            border={false}
            fixHeight={true}
            fullWidth={true}
            tuneOption={false}
            showPagesize={true}
          />
        </div>
      </Box>

      <ModalNotification
        data={detailnotiData}
        open={detailnotiOpen}
        onClose={() => {
          setdetailnotiOpen(false)
          setTimeout(() => {
            setdetailnotiData(null)
          }, 300);
        }}
      />
    </div>

    {/* Confirm Save */}
    <ModalConfirmSave
      open={modaConfirmSave}
      handleClose={(e: any) => {
        setModaConfirmSave(false);
        if (e == "submit") {

          if (modeAcknowledge == 'all') {
            handleAcknowledgeAll();
          } else {
            handleAcknowledge();
          }
        }
      }}
      title={modeAcknowledge == 'all' ? 'Acknowledge All' : 'Confirm Acknowledge'}
      description={
        modeAcknowledge == 'all' ?
          <div>
            <div className="text-center">
              {`Do you want to acknowledge all modules now ?`}
            </div>
          </div >
          : <div>
            <div className="text-center">
              {`Do you want to acknowledge now ?`}
            </div>
          </div>
      }
      menuMode="confirm-save"
      btnmode="split"
      btnsplit1={modeAcknowledge == 'all' ? "Yes" : "Acknowledge"}
      btnsplit2="Cancel"
      stat="none"
    />


    {/* Confirm Save ALL */}
    <ModalComponent
      open={modaConfirmSaveAll}
      handleClose={(e: any) => {
        setModaConfirmSaveAll(false);
        if (e == "submit") {
          if (modeAcknowledge == 'all') {
            handleAcknowledgeAll();
          } else {
            handleAcknowledge();
          }
        }
      }}
      title={`Confirm Acknowledge All Modules`}
      description={
        <div>
          <div className="text-center">
            {`Do you want to acknowledge all modules now ?`}
          </div>
        </div>
      }
      btnmode="split"
      btnsplit1="Yes"
      btnsplit2="No"
      stat="confirm"
    />


    {/* success modal */}
    <ModalComponent
      open={isModalSuccessOpen}
      handleClose={handleCloseModal}
      title="Success"
      // description="Non TPA Point has been added."
      description={modalSuccessMsg}
    />

  </>

  );
});

NotificationArea.displayName = 'NotificationArea';

export default NotificationArea;
