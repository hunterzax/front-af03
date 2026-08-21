import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatDate, formatDateNoTime, formatSearchDate } from "@/utils/generalFormatter";
import SearchInput from "@/components/other/searchInput";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import BtnSearch from "@/components/other/btnSearch";
import BtnReset from "@/components/other/btnReset";
import BtnExport from "@/components/other/btnExport";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import RevisedCapacityPathRender from "@/components/other/pathRender";

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
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalPathMgnHistory: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    dataInfo,
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
    });

    const [dataMaster, setDataMaster] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);

    useEffect(() => {
        // Transform data into a flat array with keys
        const arrayData = Object.entries(data)?.flatMap(([key, values]: any) =>
            values.map((value: any) => ({
                ...value,
                key,
            }))
        );

        // Group the transformed data by config_master_path_id
        const groupedData = arrayData.reduce((acc: any, item: any) => {
            const group = acc.find(
                (group: { config_master_path_id: any }) =>
                    group.config_master_path_id === item.config_master_path_id
            );

            if (group) {
                group.data.push(item);
            } else {
                acc.push({
                    config_master_path_id: item.config_master_path_id,
                    exit_name_temp: item.exit_name_temp,
                    data: [item],
                });
            }

            return acc;
        }, []);

        // Check if the transformed data is different from the current state
        const isDataEqual = JSON.stringify(groupedData) === JSON.stringify(dataMaster);

        // Update state only if the data has changed
        if (!isDataEqual) {
            setDataMaster(groupedData);
            setFilteredDataTable(groupedData);
        }
    }, [data]);

    // ############### FIELD SEARCH ###############
    const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
    const [key, setKey] = useState(0);

    const handleFieldSearch = () => {
        const result = data.filter((item: any) => {
            return (
                // (srchLogId ? item?.id == srchLogId : true) &&
                // (srchAuditLogModuel ? item?.module == srchAuditLogModuel : true) &&
                // (srchAuditLogModuel ? item?.module.toLowerCase().includes(srchAuditLogModuel.toLowerCase()) : true) &&
                (srchStartDate ? formatSearchDate(item?.create_date) === formatSearchDate(srchStartDate) : true)
            );
        });
        setFilteredDataTable(result);
    };

    const handleReset = () => {
        // setSrchLogId('')
        // setSrchAuditLogModule('')
        setSrchStartDate(null);
        setFilteredDataTable(data);
        setKey((prevKey) => prevKey + 1);
    };

    const isReadOnly = mode === "view";

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            // const formattedStartDate: any = formatFormDate(dataInfo?.start_date);
            // setValue('start_date', formattedStartDate);
            // setSelectedPaths((prevState: any) => ({
            //     ...prevState,
            //     ...dataInfo.path_management_config.reduce((acc: any, config:any) => {
            //         acc[config.exit_id_temp] = {
            //             config_master_path_id: config.config_master_path_id, // ID of path in exit
            //             exit_id_temp: config.exit_id_temp, // ID of group exit
            //             exit_name_temp: config.exit_name_temp, // Name of group exit
            //         };
            //         return acc;
            //     }, {})
            // }));
        }
    }, [dataInfo, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // clear state when closes
    const handleClose = () => {
        onClose();
        // setEmailGroup([]);
        setSelectedPaths({});
        setSelectedPathsShowOnExpand([]);
        setExpandedRow(null);
    };

    const handleSearch = (query: string) => {
        const filtered = dataMaster.filter(
            (item: any) =>
                item?.name?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.toLowerCase()) ||
                item?.description?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.toLowerCase()) ||
                item?.area_nominal_capacity?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(query.toLowerCase()) ||
                item?.create_by_account?.first_name?.toString().includes(query.toLowerCase()) ||
                item?.create_by_account?.last_name?.toString().includes(query.toLowerCase()) ||
                item?.start_date?.toLowerCase().includes(query.toLowerCase())
            // item?.end_date?.toLowerCase().includes(query.toLowerCase())
        );
         
        setFilteredDataTable(filtered);
    };

    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [selectedPaths, setSelectedPaths] = useState<any>({});
    const [selectedPathsShowOnExpand, setSelectedPathsShowOnExpand] = useState<any>([]);

    const handleExpand = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    const handleRadioChange: any = (configIndex: any, pathItem: any, item_id: any, item_name: any) => {
        const areaMap = pathItem?.revised_capacity_path.reduce((acc: any, pathItem: any) => {
            acc[pathItem.area_id] = pathItem;
            return acc;
        }, {});

        const sortedRevisedCapacityPath = pathItem?.revised_capacity_path_edges.map((edge: any) => areaMap[edge.source_id]).filter((pathItem: any) => pathItem !== undefined);

        setSelectedPaths((prevState: any) => ({
            ...prevState,
            [item_id]: { // id ของ EXIT
                ...prevState[item_id],
                // [configIndex]: pathItem.id,
                "config_master_path_id": pathItem.id, // id ของ path ใน exit
                "exit_id_temp": item_id, // id ของ group exit
                "exit_name_temp": item_name, // name ของ group exit
            },
        }));

        setSelectedPathsShowOnExpand((prevState: any) => ({
            ...prevState,
            [item_id]: { // id ของ EXIT
                ...prevState[item_id],
                // [configIndex]: pathItem.id,
                "config_master_path_id": pathItem.id, // id ของ path ใน exit
                "exit_id_temp": item_id, // id ของ group exit
                "exit_name_temp": item_name, // name ของ group exit
                "path_render": sortedRevisedCapacityPath
            },
        }))
    };

    return (
        <Dialog
            open={open}
            // onClose={onClose} 
            onClose={handleClose}
            className="relative z-20"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md ">
                                <form
                                    onSubmit={handleSubmit((data) => { // clear state when submit
                                        // setEmailGroup([]);
                                        setSelectedPaths({});
                                        setSelectedPathsShowOnExpand([]);
                                        setExpandedRow(null);
                                        onSubmit(data);
                                    })}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w !w-[1000px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Version` : mode == "edit" ? "Edit Version " + dataInfo?.version : "History"}</h2>
                                    <div className="w-full">
                                        {/* <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{title}</h2> */}
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
                                    <div className="grid grid-cols-1 gap-2">

                                        <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                                            <aside className="flex flex-wrap sm:flex-row gap-2 w-full">

                                                <DatePickaSearch
                                                    key={"start" + key}
                                                    label="Start Date"
                                                    placeHolder="Select Date"
                                                    allowClear
                                                    onChange={(e: any) => setSrchStartDate(e ? e : null)}
                                                />

                                                <BtnSearch handleFieldSearch={handleFieldSearch} />
                                                <BtnReset handleReset={handleReset} />
                                            </aside>
                                        </div>

                                        <div className=" w-full pt-2">
                                            <div>
                                                <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                                    <TuneIcon
                                                        className="cursor-pointer rounded-lg"
                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                    />
                                                    <div className="flex flex-wrap gap-2 justify-end">
                                                        <SearchInput onSearch={handleSearch} />
                                                        <BtnExport textRender={"Export"} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative h-auto overflow-auto block rounded-t-md">
                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-2">
                                                    <tr>
                                                        <th className="rounded-tl-[6px] font-light px-2">{`Exit`}</th>
                                                        <th className="font-light">{`Default Capacity Path`}</th>
                                                        <th className="font-light">{`Start Date`}</th>
                                                        <th className="font-light">{`Updated by`}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* {data?.name !== '' && data?.map((item: any) => ( */}
                                                    {filteredDataTable?.exit_name_temp !== '' && filteredDataTable?.map((item: any) => (
                                                        <tr key={item.config_master_path_id} className="border-b border-gray-300">

                                                            <td className="px-2 py-1 text-[#464255] !w-[12%]">
                                                                {item.exit_name_temp ? item.exit_name_temp : ''}
                                                            </td>

                                                            <td className="px-2 py-1">
                                                                <div
                                                                    className={`w-full h-[44px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center gap-2 px-2 justify-between ${isReadOnly && 'bg-[#DFE4EA]'}`}
                                                                    onClick={() => {
                                                                        // if (!isReadOnly) {
                                                                        // }
                                                                        handleExpand(item.config_master_path_id);
                                                                    }}
                                                                >
                                                                    {(() => {
                                                                        // render path แรกใน array
                                                                        if (item?.data?.length > 0) {
                                                                            const areaMap = item?.data[0]?.paths?.revised_capacity_path.reduce((acc: any, pathItem: any) => {
                                                                                acc[pathItem.area_id] = pathItem;
                                                                                return acc;
                                                                            }, {});
                                                                            const sortedRevisedCapacityPath = item?.data[0]?.paths?.revised_capacity_path_edges?.map((edge: any) => areaMap[edge.source_id]).filter((pathItem: any) => pathItem !== undefined);
                                                                            return (
                                                                                <RevisedCapacityPathRender sortedRevisedCapacityPath={sortedRevisedCapacityPath} />
                                                                            );
                                                                        }

                                                                    })()}

                                                                    <div className="flex items-center">
                                                                        {expandedRow === item.config_master_path_id ? (
                                                                            <ExpandLessRoundedIcon />
                                                                        ) : (
                                                                            <ExpandMoreRoundedIcon />
                                                                        )}
                                                                    </div>
                                                                </div>


                                                                {expandedRow === item.config_master_path_id && (
                                                                    <div className="ml-2 mt-2 bg-[#DFE4EA] border border-[#DFE4EA] rounded-[8px] p-2">

                                                                        {item?.data?.map((configItem: any, configIndex: any) => {
                                                                            const areaMap = configItem?.paths.revised_capacity_path.reduce((acc: any, pathItem: any) => {
                                                                                acc[pathItem.area_id] = pathItem;
                                                                                return acc;
                                                                            }, {});

                                                                            const sortedRevisedCapacityPath = configItem?.paths.revised_capacity_path_edges.map((edge: any) => areaMap[edge.source_id]).filter((pathItem: any) => pathItem !== undefined);
                                                                            return (
                                                                                <div key={configIndex} className="flex items-center gap-2 pt-2 pb-2">

                                                                                    {sortedRevisedCapacityPath.map((pathItem: any, pathIndex: any) => (
                                                                                        <React.Fragment key={pathItem.id}>
                                                                                            <div
                                                                                                className="flex justify-center items-center"
                                                                                                style={{
                                                                                                    backgroundColor: pathItem?.area?.color,
                                                                                                    width: pathItem?.revised_capacity_path_type_id === 1 ? '30px' : '30px',
                                                                                                    height: pathItem?.revised_capacity_path_type_id === 1 ? '30px' : '30px',
                                                                                                    borderRadius: pathItem?.revised_capacity_path_type_id === 1 ? '4px' : '50%',
                                                                                                }}
                                                                                            >
                                                                                                <span
                                                                                                    className={`${pathItem?.revised_capacity_path_type_id === 1
                                                                                                        ? 'text-white'
                                                                                                        : 'text-black'
                                                                                                        } text-[13px]`}
                                                                                                >
                                                                                                    {pathItem?.area?.name}
                                                                                                </span>
                                                                                            </div>

                                                                                            {pathIndex < sortedRevisedCapacityPath.length - 1 && (
                                                                                                <span className="text-gray-500 -mr-2 -ml-2">{'→'}</span>
                                                                                            )}
                                                                                        </React.Fragment>
                                                                                    ))}
                                                                                </div>
                                                                            );
                                                                        })}

                                                                    </div>
                                                                )}
                                                            </td>

                                                            <td className="px-2 py-1 text-[#464255] !w-[12%]">
                                                                {formatDateNoTime(item.data[0]?.start_date)}
                                                            </td>

                                                            <td className="px-2 py-1 text-[#464255]">
                                                                <div>
                                                                    <span className="text-[#464255]">{item.data[0]?.create_by_account?.first_name} {item.data[0]?.create_by_account?.last_name}</span>
                                                                    {/* <div className="text-gray-500 text-xs">{formatDate(row?.update_date)}</div> */}
                                                                    <div className="text-gray-500 text-xs">{item.data[0]?.create_date && formatDate(item.data[0]?.create_date)}</div>
                                                                </div>
                                                            </td>

                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>


                                    <div className="flex justify-end pt-6">
                                        {mode === "view" ? (
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Close`}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="w-[167px] font-light bg-slate-100 !text-[#464255] py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div >
            </div >
        </Dialog >
    );
};

export default ModalPathMgnHistory;
