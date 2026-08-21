import React, { useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { addPathName, addPathNameTest, createNodeEdges, formatFormDate, sortRevisedCapacityPathBlocks } from "@/utils/generalFormatter";
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import dayjs from "dayjs";
import SearchInput from "@/components/other/searchInput";
import RevisedCapacityPathRender from "@/components/other/pathRender";
import BtnExport from "@/components/other/btnExport";
import { table_col_arrow_sort_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSort } from "@/utils/sortTable";
import Spinloading from "@/components/other/spinLoading";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

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
    latestStartDate?: any;
    dataInfo?: any;
    userPermission?: any;
    columnVisibility?: any;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    isLoading?: any;
    setIsLoading?: any;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    latestStartDate,
    dataInfo,
    open,
    userPermission,
    columnVisibility,
    onClose,
    onSubmit,
    setResetForm,
    isLoading = false,
    setIsLoading
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });

    const labelClass = "block mb-2 text-sm font-light";
    const textErrorClass = "text-red-500 text-sm";
    // const [isLoading, setIsLoading] = useState<boolean>(false);

    // const isReadOnly = mode === "view";
    const isReadOnly = mode === "view" || (dataInfo?.start_date ? dayjs(dataInfo?.start_date).isBefore(dayjs(), "day") : false); // ถ้าเลย dataInfo?.start_date edit ไม่ได้
    const selectedPathsShowOnExpandRef = useRef<any>({});

    const [dataMaster, setDataMaster] = useState<any>([]);
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [filteredIdSub, setFilteredIdSub] = useState<any>([]);

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()

    // SORTING
    const [sortState, setSortState] = useState({ column: null, direction: null });
    // const [sortedData, setSortedData] = useState(filteredDataTable);
    const [sortedData, setSortedData] = useState<any>([]);

    const [expandedRow, setExpandedRow] = useState<number | null>(null);
    const [selectedPaths, setSelectedPaths] = useState<any>({});
    const [selectedPathsShowOnExpand, setSelectedPathsShowOnExpand] = useState<any>([]);

    const [IsRadioChange, setIsRadioChange] = useState<boolean>(false);

    useEffect(() => {
        // setDataMaster(data)
        // setFilteredDataTable(data);

        // ทำ node ให้เป็น text ตัว option จะได้เอาไป sort ง่าย ๆ
        let withPathName = data
        let sortData = data
        if (data?.length > 0) {
            withPathName = addPathNameTest(data);

            // sort path_data.pathConfigs.path_name ตามตัวอักษร น้อยไปมาก
            sortData = (withPathName ?? []).map((area: any) => ({
                ...area,
                pathConfigs: [...(area.pathConfigs ?? [])].sort((a, b) => {
                    const aa = a?.path_name ?? "";
                    const bb = b?.path_name ?? "";
                    // undefined/ว่าง ไปท้ายเสมอ
                    if (!aa && !bb) return 0;
                    if (!aa) return 1;
                    if (!bb) return -1;
                    return aa.localeCompare(bb, undefined, { sensitivity: "base", numeric: true });
                }),
            }));

            let sortedFinal: any = sortByName(sortData)
            setSortedData(sortedFinal)
            setDataMaster(sortedFinal)
            setFilteredDataTable(sortedFinal);

            let id_sub = data?.name !== '' ? data?.map((item: any) => item?.name) : []
            // let id_sub = dataInfo ? dataInfo?.path_management_config?.map((item: any) => item?.id) : []
            setFilteredIdSub(id_sub)
        }

    }, [data, open, dataInfo])

    useEffect(() => {
        setValue('start_date', null) // แก้ activate date ค้างตอนเปิดใหม่

        if (mode === "edit" || mode === "view") {
            const formattedStartDate: any = formatFormDate(dataInfo?.start_date);
            setValue('start_date', formattedStartDate);

            setSelectedPaths((prevState: any) => ({
                ...dataInfo?.path_management_config?.reduce((acc: any, config: any) => {
                    acc[config.exit_id_temp] = {
                        config_master_path_id: config.config_master_path_id, // ID of path in exit
                        exit_id_temp: config.exit_id_temp, // ID of group exit
                        exit_name_temp: config.exit_name_temp, // Name of group exit
                    };
                    return acc;
                }, {})
            }));
        }
        // }, [dataInfo, data, mode, setValue, open]);
    }, [dataInfo, data, mode, open]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    //#region handleSearch version 2
    const handleSearch = (query: string) => {
        const normalizedQuery = query.replace(/\s+/g, '').toLowerCase().trim();

        //filter เฉพาะ path ที่โดนเลือกเท่านั้น คุยกับ PO แล้ว https://app.clickup.com/t/86ervrxgy
        // if (mode == 'view') {
        if (mode == 'view' || mode == 'edit') {
            // const filtered = dataMaster.filter((item: any) => {
            //     return item?.pathConfigs?.some((config: any) =>
            //         config?.revised_capacity_path?.some((path: any) =>
            //             path?.area?.name?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery)
            //         )
            //     );
            // });

            const filtered = dataMaster?.map((item: any) => {
                return {
                    ...item,
                    pathConfigs: item?.pathConfigs?.filter((config: any) => {
                        // กรอง revised_capacity_path ให้เหลือเฉพาะที่ตรงกับ normalizedQuery
                        const filteredRevisedPaths = config?.revised_capacity_path?.filter((path: any) => {
                            return path?.area?.name?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery.toLowerCase());
                        });

                        // ถ้ามี revised_capacity_path ที่ตรงกับ normalizedQuery
                        // ไม่ต้องอัปเดตค่า revised_capacity_path, แค่เช็คว่า config นี้มี revised_capacity_path ที่ตรงหรือไม่
                        return filteredRevisedPaths?.length > 0; // ถ้ามีให้เก็บ pathConfig นี้ไว้
                    })
                };
            }).filter((item: any) => item.pathConfigs?.length > 0);  // กรองเอา item ที่ไม่มี pathConfigs ที่ตรงออก

            let dataPush: any = [];

            // for (let index = 0; index < filtered?.length; index++) {
            //     let res_item = dataInfo?.path_management_config?.find((config: any) => config?.exit_id_temp === filtered[index]?.id);

            //     let temps = res_item?.temps ? JSON.parse(res_item.temps)?.revised_capacity_path : null;

            //     let check = temps?.find((item: any) => item?.area?.name?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery))
            //     if (check) {
            //         dataPush.push(filtered[index]);
            //     }
            // }

            const id_sub = filtered?.map((item: any) => item.name);

            setFilteredIdSub(id_sub);
            setFilteredDataTable(filtered);
            setSortedData(filtered);

        } else {
            // ของเดิม
            // const filtered = dataMaster?.filter((item: any) => {
            //     return item?.pathConfigs?.some((config: any) =>
            //         config?.revised_capacity_path?.some((path: any) =>
            //             path?.area?.name?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery)
            //         )
            //     );
            // });

            const filtered = dataMaster?.map((item: any) => {
                return {
                    ...item,
                    pathConfigs: item?.pathConfigs?.filter((config: any) => {
                        // กรอง revised_capacity_path ให้เหลือเฉพาะที่ตรงกับ normalizedQuery
                        const filteredRevisedPaths = config?.revised_capacity_path?.filter((path: any) => {
                            return path?.area?.name?.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery.toLowerCase());
                        });

                        // ถ้ามี revised_capacity_path ที่ตรงกับ normalizedQuery
                        // ไม่ต้องอัปเดตค่า revised_capacity_path, แค่เช็คว่า config นี้มี revised_capacity_path ที่ตรงหรือไม่
                        return filteredRevisedPaths?.length > 0; // ถ้ามีให้เก็บ pathConfig นี้ไว้
                    })
                };
            }).filter((item: any) => item.pathConfigs?.length > 0);  // กรองเอา item ที่ไม่มี pathConfigs ที่ตรงออก

            const id_sub = filtered?.map((item: any) => item.name);
            setFilteredIdSub(id_sub);
            setFilteredDataTable(filtered);
            setSortedData(filtered);

        }
    };

    const handleExpand = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    //#region Select Capacity Path
    const handleRadioChange: any = (configIndex: any, pathItem: any, item_id: any, item_name: any) => {
        setIsRadioChange(true)
        const data_node = createNodeEdges(pathItem?.revised_capacity_path, pathItem?.revised_capacity_path_edges)
        const idOrder = data_node?.nodes?.map((node: any) => node.id);

        const areaMap = pathItem?.revised_capacity_path.reduce((acc: any, pathItem: any) => {
            acc[pathItem.area_id] = pathItem;
            return acc;
        }, {});

        const sortedRevisedCapacityPath = pathItem?.revised_capacity_path
            ?.sort((a: any, b: any) => b.area.id - a.area.id) // Sort by area_id in ascending order
            .map((pathItem: any) => {
                const areaName = areaMap?.[pathItem?.area?.id] || '';

                return areaName;
            })
            .filter((pathName: any) => pathName !== undefined);

        const sortedRevisedCapacityPathByEntryExit = sortRevisedCapacityPathBlocks(sortedRevisedCapacityPath);

        const sortedResult = sortedRevisedCapacityPathByEntryExit.sort((a: any, b: any) => {
            return idOrder.indexOf(a.area_id) - idOrder.indexOf(b.area_id);
        });

        setSelectedPaths((prevState: any) => ({
            ...prevState,
            [item_id]: { // id ของ EXIT
                ...prevState[item_id],
                "config_master_path_id": pathItem.id, // id ของ master path
                "exit_id_temp": item_id, // id ของ area exit
                "exit_name_temp": item_name, // name ของ area exit
            },
        }));

        setSelectedPathsShowOnExpand((prevState: any) => {
            const newState = {
                ...prevState,
                [item_id]: { // id ของ EXIT
                    ...prevState[item_id],
                    "config_master_path_id": pathItem.id, // id ของ path ใน exit
                    "exit_id_temp": item_id, // id ของ group exit
                    "exit_name_temp": item_name, // name ของ group exit
                    "path_render": sortedResult
                },
            };
            return newState;
        });
    };

    useEffect(() => {
        selectedPathsShowOnExpandRef.current = selectedPathsShowOnExpand; // อัปเดตค่า ref ล่าสุด
    }, [selectedPathsShowOnExpand]);

    useEffect(() => {
        if (mode === 'edit') {
            setValue("path_management_config", selectedPaths)
        } else {
            setValue("path_management_config", selectedPathsShowOnExpand)
        }
    }, [selectedPathsShowOnExpand, selectedPaths, mode])

    // clear state when closes
    const handleClose = () => {
        onClose();
        setValue('start_date', null)
        setExpandedRow(null);
    };

    // useEffect(() => {
    //     if (filteredDataTable && filteredDataTable.length > 0) {
    //         let sortExit: any = sortByName(filteredDataTable)
    //         setSortedData(sortExit);
    //     } else {
    //         setSortedData([]);
    //     }
    //     // setSortedData(filteredDataTable);
    // }, [filteredDataTable]);

    const sortByName = (data: any) => {
        return data.sort((a: any, b: any) => {
            // เปรียบเทียบชื่อในลักษณะตัวอักษร A-Z และตัวเลข
            if (a?.name < b?.name) return -1;
            if (a?.name > b?.name) return 1;
            return 0;
        });
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const findByKey = (keyToFind: any) => {
        for (const [key, value] of Object.entries(selectedPaths)) {
            if (key === keyToFind.toString()) {
                return value;
            }
        }
        return null; // Return null if the key is not found
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'exit', label: 'Exit', visible: true },
        { key: 'default_cap_path', label: 'Default Capacity Path', visible: true },
    ];

    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {
        if (mode == 'create') {
            setIsLoading(true);
            await onSubmit(data);

            setTimeout(() => {
                setValue('start_date', null)
                setExpandedRow(null);
                // setSelectedPaths({});
                // setSelectedPathsShowOnExpand([]);
                // setDataMaster([]);
                // setIsLoading(false)
            }, 500);

        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    // อย่าหาเปิด
    useEffect(() => {
        if (Array.isArray(sortedData) && mode === "create") {
            sortedData.forEach((item: any) => {
                item?.pathConfigs?.forEach((configItem: any, configIndex: number) => {
                    if (configIndex === 0) {
                        handleRadioChange(configIndex, configItem, item.id, item.name);
                    }
                });
            });
        }
    }, [sortedData]);

    return (<>
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
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md">
                                <Spinloading spin={isLoading} rounded={20} />
                                <form
                                    // onSubmit={handleSubmit((data) => { // clear state when submit
                                    //     setIsLoading(true);
                                    //     onSubmit(data);

                                    //     setTimeout(() => {
                                    //         setValue('start_date', null)
                                    //         setExpandedRow(null);
                                    //         // setSelectedPaths({});
                                    //         // setSelectedPathsShowOnExpand([]);
                                    //         // setDataMaster([]);
                                    //         // setIsLoading(false)
                                    //     }, 500);
                                    // })}
                                    onSubmit={handleSubmit(handleSaveConfirm)} // TOP : Path Management > Edit ตอนกด Save ขาดโหลดดิ่ง และ ไม่มีมอดอลคอนเฟิมเซฟ
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w !w-[1000px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">
                                        {mode == "create" ?
                                            <span className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{`New Version`}</span>
                                            : mode == "edit" ?
                                                <span className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{`Edit Version `}<span className="uppercase text-xl font-bold">{dataInfo?.version}</span></span>
                                                :
                                                <span className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{`View Version `}<span className="uppercase text-xl font-bold">{dataInfo?.version}</span></span>
                                        }
                                    </h2>
                                    <div className="grid grid-cols-1 gap-2">

                                        <div>
                                            <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                                <div className="pb-2 w-[25%]">
                                                    <label className={labelClass}>
                                                        {
                                                            mode !== "view" && <span className="text-red-500">*</span>
                                                        }
                                                        {`Activate Date`}
                                                    </label>
                                                    <DatePickaForm
                                                        {...register('start_date', { required: "Select Activate Date" })}
                                                        readOnly={isReadOnly}
                                                        placeHolder="Select Activate Date"
                                                        mode={mode}
                                                        valueShow={watch("start_date") && dayjs(watch("start_date")).format("DD/MM/YYYY")}
                                                        min={dayjs().add(1, 'day').toDate()}
                                                        allowClear
                                                        isError={errors.start_date && !watch("start_date") ? true : false}
                                                        onChange={(e: any) => { setValue('start_date', formatFormDate(e)), e == undefined && setValue('start_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                                    />
                                                    {errors.start_date && !watch("start_date") && <p className={`${textErrorClass}`}>{'Select Activate Date'}</p>}
                                                </div>

                                                <div className="flex pt-6 flex-wrap gap-2 justify-end">
                                                    <SearchInput onSearch={handleSearch} />
                                                    {
                                                        mode == 'view' && <BtnExport textRender={"Export"} data={dataInfo?.id ? [{ id: dataInfo.id }] : []} data2={filteredIdSub} path="capacity/view-path-management" can_export={userPermission ? userPermission?.f_export : false} columnVisibility={{ exit: true, default_cap_path: true }} initialColumns={initialColumns} specificMenu={'path_mgn'} />
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`${sortedData?.length > 10 ? 'max-h-[600px] overflow-y-auto' : ''} relative h-auto overflow-auto block rounded-t-md`}>

                                            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-2">
                                                    <tr>

                                                        <th className={`rounded-tl-[6px] font-light px-2 ${table_sort_header_style}`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, filteredDataTable)} >
                                                            {`Exit`}
                                                            {getArrowIcon("name")}
                                                        </th>

                                                        <th className="font-light">{`Default Capacity Path`}</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {sortedData?.name !== '' && sortedData?.map((item: any) => {
                                                        return (
                                                            <tr key={item.id} className="border-b border-gray-300">

                                                                <td className="px-2 py-1 text-[#464255] !w-[12%]">
                                                                    {item.name ? item.name : ''}
                                                                </td>

                                                                <td className="px-2 py-1">
                                                                    {item.name ? (
                                                                        <div
                                                                            className={`w-full h-[44px] border border-[#DFE4EA] rounded-[8px] cursor-pointer flex items-center gap-2 px-2 justify-between ${isReadOnly && 'bg-[#EFECEC]'}`}
                                                                            onClick={() => {
                                                                                if (!isReadOnly) {
                                                                                    handleExpand(item.id);
                                                                                }
                                                                            }}
                                                                        >
                                                                            {
                                                                                <CbankUi item={item} mode={mode} data={data} dataInfo={dataInfo} findByKey={findByKey} selectedPathsShowOnExpand={selectedPathsShowOnExpand} IsRadioChange={IsRadioChange} setIsRadioChange={setIsRadioChange} />
                                                                            }

                                                                            {mode !== 'view' &&
                                                                                <div className="flex items-center">
                                                                                    {expandedRow === item.id ? (
                                                                                        <ExpandLessRoundedIcon />
                                                                                    ) : (
                                                                                        <ExpandMoreRoundedIcon />
                                                                                    )}
                                                                                </div>
                                                                            }
                                                                        </div>

                                                                    ) : ''}

                                                                    {/* Expanded content inside the same <td> */}
                                                                    {expandedRow === item.id && (
                                                                        <div className="ml-2 mt-2 bg-[#ffffff] border border-[#DFE4EA] rounded-[8px] p-2">

                                                                            {item?.pathConfigs?.map((configItem: any, configIndex: any) => {

                                                                                const areaMap = configItem?.revised_capacity_path.reduce((acc: any, pathItem: any) => {
                                                                                    acc[pathItem.area_id] = pathItem;
                                                                                    return acc;
                                                                                }, {});

                                                                                const sortedRevisedCapacityPath = configItem?.revised_capacity_path
                                                                                    ?.sort((a: any, b: any) => b.area.id - a.area.id) // Sort by area_id in ascending order
                                                                                    .map((pathItem: any) => {
                                                                                        // const areaName = areaMap[pathItem.area.id];
                                                                                        const areaName = areaMap?.[pathItem?.area?.id]
                                                                                        return areaName;
                                                                                    })
                                                                                    .filter((pathName: any) => pathName !== undefined);

                                                                                // sort node edges
                                                                                const sortedRevisedCapacityPathByEntryExit = sortRevisedCapacityPathBlocks(sortedRevisedCapacityPath);

                                                                                return (
                                                                                    <div key={configIndex} className="flex items-center gap-2 pt-2 pb-2">
                                                                                        <input
                                                                                            type="radio"
                                                                                            name={`pathConfig-${item.id}`}
                                                                                            className="mr-2"
                                                                                            value={configItem?.id}
                                                                                            // checked={selectedPaths[item.id]?.config_master_path_id === configItem?.id}
                                                                                            checked={selectedPaths[item.id]?.config_master_path_id === configItem?.id}
                                                                                            onChange={() => handleRadioChange(configIndex, configItem, item.id, item.name)}
                                                                                        />

                                                                                        <RevisedCapacityPathRender sortedRevisedCapacityPath={sortedRevisedCapacityPathByEntryExit.sort((a: any, b: any) => a.id - b.id)} />
                                                                                    </div>
                                                                                );
                                                                            })}

                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        {mode === "view" ? (
                                            <button
                                                type="button"
                                                // onClick={onClose}
                                                onClick={handleClose}
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Close`}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                // onClick={onClose}
                                                onClick={handleClose}
                                                className="w-[167px] font-light bg-slate-100 !text-[#464255] py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {mode === "create" ? "Add" : "Save"}
                                            </button>
                                        )}
                                    </div>

                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div >
            </div >
        </Dialog>

        {/* Confirm Save */}
        <ModalConfirmSave
            open={modaConfirmSave}
            handleClose={(e: any) => {
                setModaConfirmSave(false);
                if (e == "submit") {
                    setIsLoading(true);
                    onSubmit(dataSubmit);

                    setTimeout(() => {
                        setValue('start_date', null)
                        setExpandedRow(null);
                    }, 500);
                }
            }}
            title="Confirm Save"
            description={
                <div>
                    <div className="text-center">
                        {`Do you want to save the changes ?`}
                    </div>
                </div>
            }
            menuMode="confirm-save"
            btnmode="split"
            btnsplit1="Save"
            btnsplit2="Cancel"
            stat="none"
        />
    </>
    );
};

export default ModalAction;

const CbankUi = ({ item, mode, data, dataInfo, findByKey, selectedPathsShowOnExpand, selectedPathsShowOnExpandR, IsRadioChange, setIsRadioChange }: any) => {
    const [sortedPaths, setSortedPaths] = useState<any[]>([]);

    useEffect(() => {
        if (!item || !mode) return;

        let sortedRevisedCapacityPathByEntryExit: any = [];

        // โหมด create แสดง default ตัวแรก คืออันข้างล่างนี่
        if (mode == 'create') { // original
            const pathDataShow = !!selectedPathsShowOnExpand[item?.id] ? selectedPathsShowOnExpand[item?.id]?.path_render : item?.pathConfigs[0]?.revised_capacity_path
            const areaMap = pathDataShow.reduce((acc: any, pathItem: any) => {
                acc[pathItem.area_id] = pathItem;
                return acc;
            }, {});

            // const sortedRevisedCapacityPath = item?.pathConfigs[0]?.revised_capacity_path_edges?.map((edge: any) => areaMap[edge.source_id]).filter((pathItem: any) => pathItem !== undefined);
            const sortedRevisedCapacityPath = pathDataShow
                ?.sort((a: any, b: any) => b.area.id - a.area.id) // Sort by area_id in ascending order
                .map((pathItem: any) => {
                    // const areaName = areaMap[pathItem.area.id];
                    const areaName = areaMap?.[pathItem?.area?.id]
                    return areaName;
                })
                .filter((pathName: any) => pathName !== undefined);

            // sort node edges
            sortedRevisedCapacityPathByEntryExit = sortRevisedCapacityPathBlocks(sortedRevisedCapacityPath);

        } else if (mode == 'edit') {
            // ============ ORIGINAL KOM =============
            // โหมด edit แสดงอันที่เลือกไว้
            let res_item = dataInfo?.path_management_config?.find((config: any) => config?.exit_id_temp === item?.id)
            let temps = res_item?.temps ? JSON.parse(res_item.temps)?.revised_capacity_path : null;

            // ถ้า isRadioChange == true ให้ใช้ selectedPathsShowOnExpand[item?.id]?.path_render
            // ถ้าไม่ ให้ใช้ temps
            const pathDataShow = !!selectedPathsShowOnExpand[item?.id] && IsRadioChange ? selectedPathsShowOnExpand[item?.id]?.path_render : temps
            sortedRevisedCapacityPathByEntryExit = pathDataShow // original

            setIsRadioChange(false)
            // ของใหม่
            // sortedRevisedCapacityPathByEntryExit = temps


            // ============ NEW BANK =============
            // โหมด edit แสดงอันที่เลือกไว้
            // let res_item = dataInfo?.path_management_config?.find((config: any) => config?.exit_id_temp === item?.id)
            // // let res_item = dataInfo?.path_management_config?.find((config: any) => config?.config_master_path_id === item?.id)
            // // let temps = JSON.parse(res_item?.temps)?.revised_capacity_path
            // let temps = res_item?.temps ? JSON.parse(res_item.temps) : null;
            // sortedRevisedCapacityPathByEntryExit = temps // new

        } else if (mode == 'view') {
            // ============ ORIGINAL KOM =============
            // //โหมด view แสดงอันที่เลือกไว้
            let res_item = dataInfo?.path_management_config?.find((config: any) => config?.exit_id_temp === item?.id)
            // let res_item = dataInfo?.path_management_config?.find((config: any) => config?.config_master_path_id === item?.id)

            // let temps = JSON.parse(res_item?.temps)?.revised_capacity_path
            let temps = res_item?.temps ? JSON.parse(res_item.temps)?.revised_capacity_path : null;
            sortedRevisedCapacityPathByEntryExit = temps


            // ============ NEW BANK =============
            // โหมด view แสดงอันที่เลือกไว้
            // let res_item = dataInfo?.path_management_config?.find((config: any) => config?.exit_id_temp === item?.id)
            // let temps = res_item?.temps ? JSON.parse(res_item.temps) : null;
            // sortedRevisedCapacityPathByEntryExit = temps
        }

        setSortedPaths((sortedRevisedCapacityPathByEntryExit || []).sort((a: any, b: any) => a.id - b.id));

    }, [item, mode, data, dataInfo, selectedPathsShowOnExpand]);


    // return (
    //     <div>
    //         <RevisedCapacityPathRender sortedRevisedCapacityPath={sortedPaths} />
    //     </div>
    // );

    return (
        <div>
            <RevisedCapacityPathRender sortedRevisedCapacityPath={sortedPaths} />
            {/* <RevisedCapacityPathRenderNew sortedRevisedCapacityPath={sortedPaths} /> */}
        </div>
    );
}

const RevisedCapacityPathRenderNew = ({ sortedRevisedCapacityPath }: any) => {

    return (
        <div className="flex items-center gap-2">

            {sortedRevisedCapacityPath?.length > 0 ? (
                sortedRevisedCapacityPath.map((pathItem: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 pt-2 pb-2">
                        <div
                            className="flex justify-center items-center"
                            style={{
                                backgroundColor: pathItem.area.color,
                                width: '30px',
                                height: '30px',
                                borderRadius: pathItem.revised_capacity_path_type_id === 1 ? '4px' : '50%',
                            }}
                        >
                            <span
                                className={`${pathItem.revised_capacity_path_type_id === 1 ? 'text-white' : 'text-black'} text-[13px]`}
                            >
                                {pathItem.area.name}
                            </span>
                        </div>
                        {index < sortedRevisedCapacityPath.length - 1 && (
                            <span className="text-gray-500 -mr-2 -ml-2">{'→'}</span>
                        )}
                    </div>
                ))
            ) : (
                <div>Click to expand</div>
            )}
        </div>
    );
};