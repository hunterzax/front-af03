import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { exportToExcel, formatDateNoTime, formatNumberThreeDecimal } from "@/utils/generalFormatter";
import TuneIcon from "@mui/icons-material/Tune";
import { table_col_arrow_sort_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import BtnGeneral from "@/components/other/btnGeneral";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import { handleSort } from "@/utils/sortTable";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

type FormData = {
    zone: any;
    entry_exit: any;
    area: any;
    nom_point: any;
    start_date: any;
    end_date: any;
    daily_reverse_cap: any;
    group_id: any;
    // start_date: Date;
    // end_date: Date;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "release";
    // data?: Partial<FormData>;
    data?: any;
    latestStartDate?: any;
    dataInfo?: any;
    dataShipper?: any;
    zoneMaster?: any;
    entryExitMaster?: any;
    setMdConfirmOpen?: any;
    userPermission?: any;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalView: React.FC<FormExampleProps> = ({
    mode = "view",
    data = {},
    dataShipper,
    zoneMaster,
    entryExitMaster,
    userPermission,
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUrl, setFileUrl] = useState<any>();
    const [dataInTable, setDataInTable] = useState<any>([]);

    useEffect(() => {
        setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))

        if (mode === "edit" || mode === "view") {
            setDataInTable([])
            setValue("res_bal_gas_contract", data?.res_bal_gas_contract || "");
            setValue("group_id", data?.group_id || "");
            setValue("url", data?.url?.[0]?.url || "");
            setValue("reserve_balancing_gas_contract_comment", data?.reserve_balancing_gas_contract_comment?.comment || "");

            const file_name: any = data?.url?.[0]?.url || ""
            setFileName(file_name)
            setFileUrl(file_name);

            setDataInTable((prev: any) => [
                ...prev,
                ...(Array.isArray(data?.reserve_balancing_gas_contract_detail) ? data?.reserve_balancing_gas_contract_detail.map((item: any) => ({
                    zone: item?.zone,
                    entry_exit: item?.entry_exit,
                    area: item?.area,
                    nom_point: item?.nomination_point,
                    start_date: item?.start_date,
                    end_date: item?.end_date,
                    daily_reverse_cap: item?.daily_reserve_cap_mmbtu_d,
                })) : [])
            ]);

            setSortedData((prev: any) => [
                ...prev,
                ...(Array.isArray(data?.reserve_balancing_gas_contract_detail) ? data?.reserve_balancing_gas_contract_detail.map((item: any) => ({
                    zone: item?.zone,
                    entry_exit: item?.entry_exit,
                    area: item?.area,
                    nom_point: item?.nomination_point,
                    start_date: item?.start_date,
                    end_date: item?.end_date,
                    daily_reverse_cap: item?.daily_reserve_cap_mmbtu_d,
                })) : [])
            ]);

        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // clear state when closes
    const handleClose = () => {

        onClose();
        setFileName("Maximum File 10 MB");
        setFileUrl('');
        setDataInTable([])
        setSortedData([])
        reset();
    };

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'zone', label: 'Zone', visible: true },
        { key: 'area', label: 'Area', visible: true },
        { key: 'entry_exit', label: 'Entry/Exit', visible: true },
        { key: 'nomination_point', label: 'Nomination Point', visible: true },
        { key: 'start_date', label: 'Start Date', visible: true },
        { key: 'end_date', label: 'End Date', visible: true },
        { key: 'daily_reserve_cap', label: 'Daily Reserve Cap (MMBTU/D)', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openToggle = Boolean(anchorEl);
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

    return (<>
        <Dialog
            open={open}
            // onClose={onClose} 
            onClose={() => handleClose()}
            className="relative z-20"
        >
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-full  overflow-y-auto">
                <div className="flex min-h-full items-end  justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                            <form
                                onSubmit={handleSubmit((data) => { // clear state when submit
                                    // onSubmit(groupedData, dataMaster);
                                    // setMdConfirmOpen(true);
                                    // handleSubmitForm()
                                })}
                                className=" p-6 md:p-8 rounded-[20px] shadow-lg bg-white max-w-[100%] w-[90vw] mx-auto"
                            >
                                <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "create" ? `New Reserve Balancing Gas Contract` : mode == "edit" ? "Edit Reserve Balancing Gas Contract" : "View Reserve Balancing Gas Contract"}</h2>
                                <div className="mb-4 w-[50%]">
                                    <div className="grid grid-cols-2 w-full text-sm font-semibold text-[#58585A]">
                                        <p>{`Res.Bal.Gas Contract`}</p>
                                        <p>{`Shipper Name`}</p>
                                    </div>
                                    <div className="grid grid-cols-2 text-sm font-light text-[#58585A]">
                                        <p>{data?.res_bal_gas_contract || ''}</p>
                                        <p>{data?.group?.name || ''}</p>
                                    </div>
                                </div>
                                <div className="w-full rounded-[10px] h-auto border border-[#DFE4EA] p-4">
                                    <div className="font-semibold text-[#464255] pb-4">
                                        {`Contract Details`}
                                    </div>
                                    <div>
                                        <div className="gap-2 flex flex-row justify-between items-center pb-2">
                                            <div>
                                                <div onClick={handleTogglePopover}>
                                                    <TuneIcon
                                                        className="cursor-pointer rounded-lg"
                                                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 justify-end">
                                                <BtnGeneral
                                                    bgcolor={"#24AB6A"}
                                                    modeIcon={'export'}
                                                    textRender={"Export"}
                                                    generalFunc={() => exportToExcel(dataInTable, "reserve_bal_gas_contract", columnVisibility)} 
                                                    can_export={userPermission ? userPermission?.f_export : false}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 relative h-auto overflow-auto block rounded-t-md pt-1">
                                        <div className="max-h-[200px] overflow-y-auto ">
                                            <table className="w-full max-h-[200px] text-sm text-center justify-center rtl:text-right text-gray-500 ">
                                                <thead className="text-sm rounded-tl-[10px] rounded-tr-[10px] text-[#ffffff] h-[35px] bg-[#1473A1] sticky z-1">
                                                    <tr>
                                                        {columnVisibility.zone && (
                                                            <th
                                                                // className="rounded-tl-[10px] text-center"
                                                                className={`${table_sort_header_style} !rounded-tl-[10px] `}
                                                                onClick={() => handleSort("zone.name", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`Zone`}
                                                                {getArrowIcon("zone.name")}
                                                            </th>
                                                        )}

                                                        {columnVisibility.area && (
                                                            <th
                                                                // className="text-left"
                                                                className={`${table_sort_header_style} `}
                                                                onClick={() => handleSort("area.name", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`Area`}
                                                                {getArrowIcon("area.name")}
                                                            </th>
                                                        )}

                                                        {columnVisibility.entry_exit && (
                                                            <th
                                                                // className="text-left"
                                                                className={`${table_sort_header_style} `}
                                                                onClick={() => handleSort("entry_exit.name", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`Entry/Exit`}
                                                                {getArrowIcon("entry_exit.name")}
                                                            </th>
                                                        )}

                                                        {columnVisibility.nomination_point && (
                                                            <th
                                                                // className="text-left"
                                                                className={`${table_sort_header_style} `}
                                                                onClick={() => handleSort("nom_point.nomination_point", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`Nomination Point`}
                                                                {getArrowIcon("nom_point.nomination_point")}
                                                            </th>
                                                        )}

                                                        {columnVisibility.start_date && (
                                                            <th
                                                                // className="text-left"
                                                                className={`${table_sort_header_style} `}
                                                                onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`Start Date`}
                                                                {getArrowIcon("start_date")}
                                                            </th>
                                                        )}

                                                        {columnVisibility.end_date && (
                                                            <th
                                                                // className="text-left"
                                                                className={`${table_sort_header_style} `}
                                                                onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`End Date`}
                                                                {getArrowIcon("end_date")}
                                                            </th>
                                                        )}

                                                        {columnVisibility.daily_reserve_cap && (
                                                            <th
                                                                // className="!rounded-tr-[10px] w-[20%] text-left"
                                                                className={`${table_sort_header_style} !rounded-tr-[10px] w-[20%] text-left`}
                                                                onClick={() => handleSort("daily_reverse_cap", sortState, setSortState, setSortedData, dataInTable)}
                                                            >
                                                                {`Daily Reserve Cap (MMBTU/D)`}
                                                                {getArrowIcon("daily_reverse_cap")}
                                                            </th>
                                                        )}

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* {dataInTable && dataInTable?.map((row: any, index: any) => ( */}
                                                    {sortedData && sortedData?.map((row: any, index: any) => (
                                                        <tr
                                                            key={row.id}
                                                            className={`${table_row_style}`}
                                                        >
                                                            {columnVisibility.zone && (
                                                                <td className="px-2 py-1 items-center text-center justify-center ">{row?.zone && <div className="flex w-[100px] items-center text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.zone?.color }}>{`${row?.zone?.name}`}</div>}</td>
                                                            )}

                                                            {columnVisibility.area && (
                                                                <td className="px-2 py-1 justify-center ">
                                                                    {
                                                                        row?.area?.entry_exit_id == 2 ?
                                                                            <div
                                                                                className="flex justify-center items-center rounded-full p-1 text-[#464255]"
                                                                                style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                                                            >
                                                                                {`${row?.area?.name ?? ''}`}
                                                                            </div>
                                                                            :
                                                                            <div
                                                                                className="flex justify-center items-center rounded-lg p-1 text-[#464255]"
                                                                                style={{ backgroundColor: row?.area?.color, width: '40px', height: '40px' }}
                                                                            >
                                                                                {`${row?.area?.name ?? ''}`}
                                                                            </div>
                                                                    }
                                                                </td>
                                                            )}

                                                            {columnVisibility.entry_exit && (
                                                                <td className="px-2 py-1  justify-center ">{row?.entry_exit && <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>{`${row?.entry_exit?.name}`}</div>}</td>
                                                            )}

                                                            {columnVisibility.nomination_point && (
                                                                <td className="px-2 py-1 text-[#464255]">{row?.nom_point && row?.nom_point?.nomination_point}</td>
                                                            )}

                                                            {columnVisibility.start_date && (
                                                                <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                                                            )}

                                                            {columnVisibility.end_date && (
                                                                <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                                                            )}

                                                            {columnVisibility.daily_reserve_cap && (
                                                                <td className="px-2 py-1 text-[#464255] text-right">{row?.daily_reverse_cap ? formatNumberThreeDecimal(row?.daily_reverse_cap) : ''}</td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {
                                                // dataInTable?.length <= 0 &&
                                                sortedData?.length <= 0 &&
                                                <div className="flex flex-col justify-center items-center w-[100%] pt-10">
                                                    <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                                                    <div className="text-[16px] text-[#9CA3AF]">
                                                        {`Please select contract details to view the information.`}
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6">
                                    {mode === "view" ? (
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                        >
                                            {`Close`}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                        >
                                            {`Cancel`}
                                        </button>
                                    )}

                                    {mode !== "view" && (
                                        <button
                                            type="submit"
                                            // type="button"
                                            // onClick={handleSubmit}
                                            className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                        >
                                            {mode === "create" ? "Add" : "Save"}
                                        </button>
                                    )}
                                </div>

                            </form>
                        </div>
                    </DialogPanel>
                </div >
            </div >
        </Dialog >

        <ColumnVisibilityPopover
            open={openToggle}
            anchorEl={anchorEl}
            setAnchorEl={setAnchorEl}
            columnVisibility={columnVisibility}
            handleColumnToggle={handleColumnToggle}
            initialColumns={initialColumns}
        />
    </>
    );
};
export default ModalView;