import React, { useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { addPathName, exportToExcel, formatDate, formatDateNoTime, formatTime, sortRevisedCapacityPathByEdges } from "@/utils/generalFormatter";
import SearchInput from "@/components/other/searchInput";
import TuneIcon from "@mui/icons-material/Tune";
import RevisedCapacityPathRender from "@/components/other/pathRender";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import BtnGeneral from "@/components/other/btnGeneral";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";

type FormData = {
    name: string;
    ref: any;
    start_date: any;
    path_management_config: any;
    // start_date: Date;
    // end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    // data?: Partial<FormData>;
    data?: any;
    dataInfo?: any;
    open: boolean;
    initialColumns?: any
    userPermission?: any
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalPathMgnHistory: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    dataInfo,
    open,
    initialColumns,
    userPermission,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, } = useForm<any>({ defaultValues: data });
     
    const [dataMaster, setDataMaster] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    // const [reRenderByBank, setReRenderByBank] = useState(false)
    const prevDataStringRef = useRef<string>("");

    useEffect(() => {
        if (!data) return; // ป้องกัน undefined/null

        // แปลงเป็น string เพื่อตรวจสอบว่าข้อมูลเปลี่ยนแปลงจริงหรือไม่
        let newDataString = JSON.stringify(data);

        // ถ้าข้อมูลยังเหมือนเดิม ไม่ต้องอัปเดต state
        if (newDataString === prevDataStringRef.current) return;

        // อัปเดตค่า prevDataStringRef
        prevDataStringRef.current = newDataString;

        // Transform data into a flat array with keys
        const arrayData = Object.entries(data).flatMap(([key, values]: any) =>
            values.map((value: any) => ({
                ...value,
                key,
            }))
        );

        // เติมคีย์ path_name ที่เรียง nodes edges แล้ว
        const withPathName = addPathName(arrayData);

        // let res_sort = sortRevisedCapacityPathByEdges(arrayData)
        let res_sort = sortRevisedCapacityPathByEdges(withPathName)
        // setDataMaster(res_sort);
        // setFilteredDataTable(res_sort);
        setDataMaster(res_sort);
        setFilteredDataTable(res_sort);
    }, [data]);

    const isReadOnly = mode === "view";

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // clear state when closes
    const handleClose = () => {
        onClose();
    };

    const handleSearch = (query: string) => {
        const lowerCaseQuery = query.replace(/\s+/g, '')?.toLowerCase().trim();

        const filtered = dataMaster.filter((item: any) => {
            const pathMatches = item?.paths?.revised_capacity_path?.some((path: any) =>
                path?.area?.name?.toLowerCase().includes(lowerCaseQuery)
            );
            return (
                item?.exit_name_temp?.toLowerCase().includes(lowerCaseQuery) || // Match `exit_name_temp`
                item?.paths?.path_no?.toLowerCase().includes(lowerCaseQuery) || // Match `path_no`
                item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(lowerCaseQuery) ||
                item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(lowerCaseQuery) || // เผื่อ search นามสกุล
                item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(lowerCaseQuery) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
                formatTime(item?.create_date)?.toLowerCase().trim().includes(lowerCaseQuery) ||
                formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(lowerCaseQuery) ||
                pathMatches
            );
        });

        setFilteredDataTable(filtered);
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumnsHistory: any = [
        { key: 'exit', label: 'Exit', visible: true },
        { key: 'default_capacity_path', label: 'Default Capacity Path', visible: true },
        { key: 'activate_date', label: 'Activate Date', visible: true },
        { key: 'update_by', label: 'Updated by', visible: true },
        // { key: 'action', label: 'Action', visible: true }
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openPopOver = Boolean(anchorEl);
    const id = openPopOver ? 'column-toggle-popover' : undefined;

    // const [columnVisibility, setColumnVisibility] = useState<any>(
    //     initialColumns ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])) : {}
    // );

    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumnsHistory.map((column: any) => [column.key, column.visible]))
    );

    // useEffect(() => {
    //     setColumnVisibility(Object.fromEntries(initialColumnsHistory.map((column: any) => [column.key, column.visible])))
    // }, [])

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>(filteredDataTable);

    useEffect(() => {
        if (filteredDataTable && filteredDataTable.length > 0) {
            setSortedData(filteredDataTable);
        }
    }, [filteredDataTable]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-20">
                {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
                <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
                <div className="fixed inset-0 z-10 flex items-center justify-center">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >

                        <div className="flex flex-col bg-[#ffffff] rounded-[20px] items-center gap-2 p-9 w-[calc(100vw-100px)] h-[calc(100vh-80px)]">

                            {/* HEADER */}
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{"History"}</h2>
                                <div className='mb-4 w-full flex items-center'>
                                    <div className="mb-4 w-[60%]">
                                        <div className="grid grid-cols-3 text-sm font-semibold">
                                            <p>
                                                {`Version`}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 text-sm font-light">
                                            <p>
                                                {dataInfo?.version}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEARCH AND EXPORT */}
                            <div className=" w-full pt-2">
                                <div>
                                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                        <div onClick={handleTogglePopover}>
                                            <TuneIcon
                                                className="cursor-pointer rounded-lg"
                                                style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <SearchInput onSearch={handleSearch} />
                                            <BtnGeneral
                                                bgcolor={"#24AB6A"}
                                                modeIcon={'export'}
                                                textRender={"Export"}
                                                // generalFunc={() => exportToExcel(dataMaster, "path_config", columnVisibility)} 
                                                generalFunc={() => exportToExcel(filteredDataTable, "path_config", columnVisibility)}
                                                can_export={userPermission ? userPermission?.f_export : false}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RENDER TABLE */}
                                <div className={`h-[calc(100vh-420px)] overflow-y-auto block  rounded-t-md relative z-1`}>

                                    <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap ">
                                        {/* TABLE HEADER */}
                                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-2">
                                            <tr className="h-9">
                                                {columnVisibility.exit && (
                                                    <th
                                                        className={`${table_sort_header_style}`}
                                                        onClick={() => handleSort("key", sortState, setSortState, setSortedData, filteredDataTable)}
                                                    >
                                                        {`Exit`}
                                                        {getArrowIcon("key")}
                                                    </th>
                                                )}

                                                {columnVisibility.default_capacity_path && (
                                                    <th
                                                        className={`${table_sort_header_style}`}
                                                        onClick={() => handleSort("path_name", sortState, setSortState, setSortedData, filteredDataTable)}
                                                    >
                                                        {`Default Capacity Path`}
                                                        {getArrowIcon("path_name")}
                                                    </th>
                                                )}

                                                {columnVisibility.activate_date && (
                                                    <th
                                                        className={`${table_sort_header_style}`}
                                                        onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, filteredDataTable)}
                                                    >
                                                        {`Activate Date`}
                                                        {getArrowIcon("start_date")}
                                                    </th>
                                                )}

                                                {columnVisibility.update_by && (
                                                    <th
                                                        className={`${table_sort_header_style}`}
                                                        onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, filteredDataTable)}
                                                    >
                                                        {`Updated by`}
                                                        {getArrowIcon("create_by_account.first_name")}
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>

                                        {/* TABLE BODY */}
                                        <tbody>
                                            {
                                                sortedData && sortedData?.map((item: any) => {

                                                    return (
                                                        <tr
                                                            className={`${table_row_style}`}
                                                        >
                                                            {columnVisibility.exit && (
                                                                <td className="px-2 py-1 text-[#464255] ">
                                                                    {item.exit_name_temp ? item.exit_name_temp : ''}
                                                                </td>
                                                            )}

                                                            {columnVisibility.default_capacity_path && (
                                                                <td className="px-2 py-1 text-[#464255] ">
                                                                    {(() => {
                                                                        // render path แรกใน array
                                                                        if (item?.paths) {
                                                                            // const areaMap = item?.paths?.revised_capacity_path.reduce((acc: any, pathItem: any) => {
                                                                            //     acc[pathItem.area_id] = pathItem;
                                                                            //     return acc;
                                                                            // }, {});

                                                                            // const sortedRevisedCapacityPath = item?.paths?.revised_capacity_path
                                                                            //     ?.sort((a: any, b: any) => b.area.id - a.area.id) // Sort by area_id in ascending order
                                                                            //     .map((pathItem: any) => {
                                                                            //         const areaName = areaMap[pathItem.area.id];
                                                                            //         return areaName;
                                                                            //     })
                                                                            //     .filter((pathName: any) => pathName !== undefined);

                                                                            // const sortedRevisedCapacityPathByEntryExit = sortedRevisedCapacityPath.sort((a: any, b: any) => {
                                                                            //     const entryExitOrder: any = { 1: 0, 2: 1, 3: 2 }; // Priority order for entry_exit_id
                                                                            //     const aPriority = entryExitOrder[a.area.entry_exit_id] || 3; // Default priority is 3 if not defined
                                                                            //     const bPriority = entryExitOrder[b.area.entry_exit_id] || 3;

                                                                            //     if (aPriority !== bPriority) {
                                                                            //         return aPriority - bPriority;
                                                                            //     } else {
                                                                            //         return a.area.id - b.area.id;
                                                                            //     }
                                                                            // });

                                                                            return (
                                                                                // <RevisedCapacityPathRender sortedRevisedCapacityPath={sortedRevisedCapacityPathByEntryExit.reverse()} />
                                                                                <RevisedCapacityPathRender sortedRevisedCapacityPath={item?.paths?.revised_capacity_path} />
                                                                            );
                                                                        }
                                                                    })()}
                                                                </td>
                                                            )}

                                                            {columnVisibility.activate_date && (
                                                                <td className="px-2 py-1 text-[#464255]">{item?.start_date ? formatDateNoTime(item?.start_date) : ''}</td>
                                                            )}

                                                            {columnVisibility.update_by && (
                                                                <td className="px-2 py-1">
                                                                    <div>
                                                                        <span className="text-[#464255]">{item?.create_by_account?.first_name} {item?.create_by_account?.last_name}</span>
                                                                        <div className="text-gray-500 text-xs">{item?.create_date ? formatDate(item?.create_date) : ''}</div>
                                                                    </div>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    )

                                                })
                                            }

                                        </tbody>
                                    </table>
                                </div>

                                <div className="relative w-full pt-20">
                                    <button onClick={handleClose} className="absolute bottom-0 right-0 w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 tracking-[1px]">
                                        {'Close'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </DialogPanel>
                </div >
            </Dialog >

            <ColumnVisibilityPopover
                open={openPopOver}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            />
        </>
    );
};

export default ModalPathMgnHistory;