import React from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { exportToExcel, filterDataStartEnd, filterShipperGroupData, formatDate, formatFormDate, formatWatchFormDate } from "@/utils/generalFormatter";
import { InputSearch } from "@/components/other/SearchForm";
import { Button } from "@material-tailwind/react";
import { Search, Refresh, DeleteOutlineOutlined, Add } from "@mui/icons-material";
import Spinloading from "@/components/other/spinLoading";
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSort } from "@/utils/sortTable";
import PaginationComponent from "@/components/other/globalPagination";
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import BtnExport from "@/components/other/btnExport";
import BtnGeneral from "@/components/other/btnGeneral";

type FormData = {
    concept_point: string;
    type_concept_point_id: string;
    start_date: Date;
    end_date: Date;
};

type FormExampleProps = {
    mode: "create" | "edit" | "view" | "period";
    data?: Partial<FormData>;
    open: boolean;
    dataTable: any;
    typeConceptData: any;
    limitConceptPointData: any;
    shipperGroupData: any;
    setLimitDataPost: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    userPermission?: any;
    initialColumns?: any
};

const ModalLimit: React.FC<FormExampleProps> = ({
    mode = 'period',
    data = {},
    dataTable = {},
    typeConceptData = {},
    limitConceptPointData = {},
    shipperGroupData = {},
    setLimitDataPost = [],
    open,
    onClose,
    onSubmit,
    setResetForm,
    userPermission,
    initialColumns
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data });

    const pxpyClass = "px-2 py-1 text-[#464255]"
    const [srchShipperName, setSrchShipperName] = useState('');
    const [srchConceptPoint, setSrchConceptPoint] = useState('');
    const [dataSelectedConceptPoint, setDataSelectedConceptPoint] = useState<any>([]);

    const [isEdited, setIsEdited] = useState(false)

    const [limitConceptMaster, setLimitConceptMaster] = useState([]);
    const [limitConcept, setLimitConcept] = useState([]);
    const [requireFromNew, setRequireFormNew] = useState(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        initialColumns
            ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
            : {}
    );

    const handleFieldSearch = () => {
        if (srchConceptPoint || srchShipperName) {
            const result = limitConceptMaster.filter((item: any) => {
                return (
                    (srchConceptPoint ? item?.concept_point_id == srchConceptPoint : true) &&
                    (srchShipperName ? item?.group_id == srchShipperName : true)
                );
            });
            setFilteredDataTable(result);
        } else {
            setFilteredDataTable(limitConceptMaster);
        }
    };

    const handleReset = () => {
        setSrchConceptPoint('')
        setSrchShipperName('')
        setFilteredDataTable(limitConceptMaster);
    };

    //load data
    useEffect(() => {
        const fetchAndSetData = async () => {
            setLimitConcept(limitConceptPointData);
            setLimitConceptMaster(limitConceptPointData)
            setLimitDataPost(limitConceptPointData);
            setFilteredDataTable(limitConceptPointData);
            if (mode === 'period') {
                setIsLoading(false);
            }
            if (mode === "edit" || mode === "view") {
                setIsLoading(true);
                const formattedStartDate: any = formatFormDate(data?.start_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.end_date !== null) {
                    formattedEndDate = formatFormDate(data?.end_date);
                }
                setValue("end_date", formattedEndDate);
                setValue("concept_point", data?.concept_point || "");
                setValue("type_concept_point_id", data?.type_concept_point_id || "");
                setValue("start_date", formattedStartDate);

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
            setIsEdited(false)
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // const addLimit = () => {

    //     const selectedShipper = watch('shipper_name');
    //     const selectedConceptPoint = watch('concept_pointx');

    //     setRequireFormNew(false)
    //     // หา shipper
    //     const shipperGroup: any = shipperGroupData.find((item: any) => item?.id.toString() === selectedShipper);

    //     // หา concept point
    //     const conceptPoint: any = dataTable.find((item: any) => item?.id.toString() === selectedConceptPoint);

    //     if (shipperGroup && conceptPoint) {
    //         setLimitConcept((prev): any => [
    //             ...prev,
    //             {
    //                 id: limitConcept?.length + 10000,
    //                 concept_point: conceptPoint,
    //                 concept_point_id: conceptPoint?.id,
    //                 group: shipperGroup,
    //                 group_id: shipperGroup?.id,
    //             }
    //         ]);
    //     }

    //     setLimitDataPost((prev: any): any => [
    //         ...prev,
    //         {
    //             id: limitConcept?.length + 10000,
    //             concept_point: conceptPoint,
    //             concept_point_id: conceptPoint?.id,
    //             group: shipperGroup,
    //             group_id: shipperGroup?.id,
    //         }
    //     ]);

    //     setFilteredDataTable((prev: any): any => [
    //         {
    //             id: limitConcept?.length + 10000,
    //             concept_point: conceptPoint,
    //             concept_point_id: conceptPoint?.id,
    //             group: shipperGroup,
    //             group_id: shipperGroup?.id,
    //         },
    //         ...prev,
    //     ]);

    //     setValue('concept_pointx', null)
    //     setValue('shipper_name', null)

    //     setIsEdited(true)
    // };

    const addLimit = () => {
        const selectedShipper = watch('shipper_name');
        const selectedConceptPoints = dataSelectedConceptPoint; // array

        setRequireFormNew(false);

        // Find shipper group
        const shipperGroup: any = shipperGroupData.find((item: any) => item?.id.toString() === selectedShipper);

        // Guard clause if shipper is not selected
        if (!shipperGroup || !Array.isArray(selectedConceptPoints)) return;

        // Iterate through all selected concept points
        selectedConceptPoints.forEach((pointId: any, index: number) => {
            const conceptPoint: any = dataTable.find((item: any) => item?.id.toString() === pointId);
            if (!conceptPoint) return;

            const newItem = {
                id: (limitConcept?.length || 0) + 10000 + index,
                concept_point: conceptPoint,
                concept_point_id: conceptPoint?.id,
                group: shipperGroup,
                group_id: shipperGroup?.id,
            };

            setLimitConceptMaster((prev): any => [...prev, newItem]); //เพิ่ม data อย่างเดียว
            setLimitConcept((prev): any => [...prev, newItem]);
            setLimitDataPost((prev: any): any => [...prev, newItem]);
            setFilteredDataTable((prev: any): any => [newItem, ...prev]);
        });

        // Clear form fields
        setValue('concept_pointx', null);
        setValue('shipper_name', null);
        setDataSelectedConceptPoint([])
        setIsEdited(true);

    };

    const deleteLimit = (id: any) => {
        const limitConceptFilter = limitConceptMaster.filter((item: any) => {
            return (
                (srchConceptPoint ? item?.concept_point_id == srchConceptPoint : true) &&
                (srchShipperName ? item?.group_id == srchShipperName : true)
            );
        });

        setLimitConceptMaster(limitConceptMaster.filter((item: any) => item.id !== id));
        setLimitConcept(limitConceptFilter.filter((item: any) => item.id !== id));
        setLimitDataPost(limitConceptMaster.filter((item: any) => item.id !== id));
        setFilteredDataTable(limitConceptFilter.filter((item: any) => item.id !== id));
        setIsEdited(true)
    };

    // const filteredShipperGroupData: any = filterShipperGroupData(shipperGroupData);
    // const filteredDataConceptPoint: any = filterDataStartEnd(dataTable);
    const [filteredShipperGroupData, setFilteredShipperGroupData] = useState<any>([]);
    const [filteredDataConceptPoint, setFilteredDataConceptPoint] = useState<any>([]);

    useEffect(() => {
        setFilteredShipperGroupData(filterShipperGroupData(shipperGroupData));
    }, [shipperGroupData]);

    useEffect(() => {
        setFilteredDataConceptPoint(filterDataStartEnd(dataTable));
    }, [dataTable]);


    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    useEffect(() => {
        if (filteredDataTable && Array.isArray(filteredDataTable)) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
    }, [filteredDataTable, currentPage, itemsPerPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    // ############### SORTING ###############
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(paginatedData);
    useEffect(() => {
        if (paginatedData && paginatedData.length > 0) {
            setSortedData(paginatedData);
        }
        setSortedData(paginatedData);
    }, [paginatedData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setSrchConceptPoint('');
            setSrchShipperName('');
            setValue("shipper_name", undefined);
            setValue("concept_pointx", undefined);
            setDataSelectedConceptPoint([])
        }, 200);
    }

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
    }, [initialColumns])

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
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
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md w-[700px]">
                                <Spinloading spin={isLoading} rounded={20} />
                                <form
                                    className="bg-white p-8 rounded-[20px] shadow-lg w-full max-w"
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        setIsLoading(true);
                                        setTimeout(async () => {
                                            await onSubmit(data);
                                        }, 100);
                                    })}
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Concept Point` : mode == "edit" ? "Edit Concept Point" : mode == "period" ? "Concept Point Limit" : "View Concept Point"}</h2>

                                    <div className="">
                                        <div className="flex items-center space-x-2">
                                            <div className="">
                                                {/* Shipper Name Input */}
                                                <InputSearch
                                                    id="searchShipperName"
                                                    label="Shipper Name"
                                                    // type="select-new"
                                                    type="select"
                                                    value={srchShipperName}
                                                    onChange={(e) => setSrchShipperName(e.target.value)}
                                                    options={shipperGroupData?.length > 0 && shipperGroupData?.map((item: any) => ({
                                                        value: item.id,
                                                        label: item.name
                                                    }))}
                                                    customWidth={205}
                                                    customWidthPopup={205}
                                                />
                                            </div>
                                            <div className="">
                                                {/* Concept Point Input */}
                                                <InputSearch
                                                    id="searchTypeConcept"
                                                    label="Concept Point"
                                                    type="select"
                                                    value={srchConceptPoint}
                                                    onChange={(e) => setSrchConceptPoint(e.target.value)}
                                                    options={dataTable && dataTable?.map((item: any) => ({
                                                        value: item.id,
                                                        label: item.concept_point
                                                    }))}
                                                    customWidth={205}
                                                    customWidthPopup={205}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 mt-auto">
                                                <Button className="flex items-center justify-center px-2 h-[40px] w-[40px] bg-[#00ADEF]" onClick={handleFieldSearch}>
                                                    <Search style={{ fontSize: "20px" }} />
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    className="flex items-center justify-center px-2 h-[40px] w-[40px] border-[#00ADEF] text-[#00ADEF]"
                                                    onClick={handleReset}
                                                >
                                                    {/* <Refresh style={{ fontSize: "16px" }} /> */}
                                                    <ReplayOutlinedIcon style={{ fontSize: "20px", }} />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="border-[#DFE4EA] border-[1px] p-4 mt-4 rounded-xl flex flex-col justify-between shadow-sm">
                                            <aside className="flex flex-col sm:flex-row gap-2 pb-4">

                                                <div className="">
                                                    <InputSearch
                                                        id="inputShipperName"
                                                        label="Shipper Name"
                                                        type="select"
                                                        showRequire={true}
                                                        {...register("shipper_name")}
                                                        value={watch("shipper_name") || ""}
                                                        // value={srchShipperName}
                                                        onChange={(e) => {
                                                            const value: any = e.target.value;
                                                            setValue("shipper_name", value);

                                                            const filteredDataConceptPointXXX: any = filterDataStartEnd(dataTable);
                                                            if (value) {
                                                                // Step 1: Get selected group_id from watch('shipper_name')
                                                                const selectedGroupId = e.target.value;

                                                                // if (!selectedGroupId) return;

                                                                // Step 2: Find concept_point_id that are already in data_in_table for the selected group_id
                                                                const usedConceptPointIds = limitConceptMaster
                                                                    .filter((item: any) => item.group_id.toString() === selectedGroupId.toString())
                                                                    .map((item: any) => item.concept_point_id);

                                                                // Step 3: Remove master_cp_data items where concept_point_id exists in usedConceptPointIds
                                                                const filteredMasterCpData = filteredDataConceptPointXXX.filter(
                                                                    (item: any) => !usedConceptPointIds.includes(item.id)
                                                                );

                                                                setFilteredDataConceptPoint(filteredMasterCpData)
                                                            } else {
                                                                setFilteredDataConceptPoint(filteredDataConceptPointXXX)
                                                            }

                                                            setValue("concept_pointx", undefined);
                                                            setDataSelectedConceptPoint([])
                                                        }}
                                                        options={filteredShipperGroupData?.length > 0 && filteredShipperGroupData?.map((item: any) => ({
                                                            value: item?.id?.toString(),
                                                            label: item.name
                                                        }))}
                                                        customWidth={210}
                                                        customWidthPopup={210}
                                                    />
                                                </div>

                                                <div className="">
                                                    <InputSearch
                                                        id="inputTypeConcept"
                                                        label="Concept Point"
                                                        // type="select"
                                                        type="select-multi-checkbox"
                                                        showRequire={true}
                                                        {...register("concept_pointx")}
                                                        // value={watch("concept_pointx") || ""}
                                                        value={dataSelectedConceptPoint}
                                                        // onChange={(e) => setSrchConceptPoint(e.target.value)}
                                                        onChange={(e) => {
                                                            setValue("concept_pointx", e.target.value);
                                                            setDataSelectedConceptPoint(e.target.value)
                                                        }}
                                                        options={filteredDataConceptPoint?.map((item: any) => ({
                                                            value: item?.id?.toString(),
                                                            label: item.concept_point
                                                        }))}
                                                        customWidth={210}
                                                        customWidthPopup={210}
                                                    />
                                                </div>

                                                <Button
                                                    variant="outlined"
                                                    // className="flex items-center justify-center px-2 h-[40px] w-[40px] bg-[#24AB6A] border-none mt-auto"
                                                    className={`flex items-center justify-center px-2 h-[40px] w-[40px] bg-[#24AB6A] border-none mt-auto ${(!watch('concept_pointx') || !watch("shipper_name")) && 'bg-[#B6B6B6]'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    onClick={addLimit}
                                                    disabled={(!watch('concept_pointx') || !watch("shipper_name")) ? true : false}
                                                >
                                                    <Add style={{ fontSize: "16px", color: "#fff" }} />
                                                </Button>


                                                <BtnGeneral
                                                    bgcolor={"#24AB6A"}
                                                    modeIcon={'export'}
                                                    textRender={"Export"}
                                                    generalFunc={() => exportToExcel(filteredDataTable, 'concept_point_limit', columnVisibility)}
                                                    can_export={userPermission ? userPermission?.f_export : false}
                                                />

                                            </aside>

                                            {/* <div className="h-auto overflow-auto max-h-[300px] block rounded-t-md pt-3 mt-4"> */}
                                            <div className={`h-[calc(100vh-480px)] overflow-y-auto block  rounded-t-md relative z-1`}>

                                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                                    {/* <thead className="text-sm !h-[40px] text-[#ffffff] bg-[#1473A1] sticky top-0 z-10 rounded-tl-lg rounded-tr-lg"> */}
                                                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                                        <tr className="h-9">
                                                            <th
                                                                className={`rounded-tl-lg  px-2 ${table_sort_header_style}`}
                                                                onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, filteredDataTable)}
                                                            >
                                                                {`Shipper Name`}
                                                                {getArrowIcon("group.name")}
                                                            </th>
                                                            <th
                                                                className={` ${table_sort_header_style}`}
                                                                onClick={() => handleSort("concept_point.concept_point", sortState, setSortState, setSortedData, filteredDataTable)}
                                                            >
                                                                {`Concept Point`}
                                                                {getArrowIcon("concept_point.concept_point")}
                                                            </th>
                                                            {/* <th
                                                                className={` ${table_sort_header_style}`}
                                                                onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, filteredDataTable)}
                                                            >
                                                                {`Created by`}
                                                                {getArrowIcon("create_by_account.first_name")}
                                                            </th> */}
                                                            <th className={`rounded-tr-lg  ${table_header_style}`}>
                                                                {`Delete`}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredDataTable && sortedData?.map((item: any) => (
                                                            <tr key={item.id} className={`${table_row_style}`}>
                                                                <td className={pxpyClass}>{item.group?.name}</td>
                                                                <td className={pxpyClass}>{item.concept_point?.concept_point}</td>

                                                                {/* <td className={pxpyClass}>
                                                                    <div>
                                                                        <span className="text-[#464255]">
                                                                            {item.create_by_account ? `${item?.create_by_account?.first_name} ${item?.create_by_account?.last_name} ` : ''}
                                                                        </span>
                                                                        <div className="text-gray-500 text-xs">
                                                                            {item.create_date ? formatDate(item.create_date) : '-'}
                                                                        </div>
                                                                    </div>
                                                                </td> */}

                                                                <td className="px-2 py-1">
                                                                    <DeleteOutlineOutlined
                                                                        className="text-[#EA6060] bg-[#ffffff] border border-[#DFE4EA] rounded-md p-1 cursor-pointer"
                                                                        onClick={() => deleteLimit(item.id)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                <PaginationComponent
                                                    totalItems={filteredDataTable?.length}
                                                    itemsPerPage={itemsPerPage}
                                                    currentPage={currentPage}
                                                    onPageChange={handlePageChange}
                                                    onItemsPerPageChange={handleItemsPerPageChange}
                                                />
                                            </div>
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
                                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}

                                        {/* {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {
                                                    mode === "create" ? "Add" : "Save"
                                                }
                                            </button>
                                        )} */}

                                        {/* ถ้า filteredDataTable.length <= 0 disable ปุ่ม */}
                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className={`w-[167px] font-light py-2 rounded-lg focus:outline-none ${(filteredDataTable.length <= 0 || !isEdited) ? "bg-gray-400 cursor-not-allowed" : "bg-[#00ADEF] text-white hover:bg-blue-600 focus:bg-blue-600"}`}
                                                disabled={filteredDataTable.length <= 0 || !isEdited}
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
        </Dialog >
    );
};

export default ModalLimit;
