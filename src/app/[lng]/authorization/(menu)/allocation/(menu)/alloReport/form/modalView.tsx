"use client";
import * as React from 'react';
import {
    Dialog,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from 'react';
import { exportToExcel, formatDateNoTime, formatNumberFourDecimal, formatNumberFourDecimalNoComma, toDayjs } from '@/utils/generalFormatter';
import TuneIcon from "@mui/icons-material/Tune";
import SearchInput from '@/components/other/searchInput';
import BtnGeneral from '@/components/other/btnGeneral';
import PaginationComponent from '@/components/other/globalPagination';
import ColumnVisibilityPopover from '@/components/other/popOverShowHideCol';
import TableViewAllocReport from './tableView';

interface ModalHistoryProps {
    open: boolean;
    handleClose: () => void;
    tableType?: any
    data?: any;
    dataMain?: any;
    initialColumns?: any
    tabIndex?: any
    userPermission?: any;
}

const ModalViewAllocReport: React.FC<ModalHistoryProps> = ({ open, handleClose, data, tableType, initialColumns, userPermission, dataMain, tabIndex }) => {

    useEffect(() => {
        // ทั้งสองแถบ View : พอกด Hide/unhide แล้วกลับเข้ามา Tab Daily View อีกรอบคอลัมน์ไม่ Reset กลับมา กระทบ Row อื่นด้วย https://app.clickup.com/t/86eu4bg7b
        setColumnVisibility(Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])))
    }, [initialColumns])

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>(data);
    const [dataForFilter, setDataForFilter] = useState<any>(data);

    useEffect(() => {
        const shipper_id = dataMain?.shipper ? dataMain?.shipper?.id_name : dataMain?.group?.id_name

        // v2.0.33 ข้อมูลใน View แสดงผิด ต้องแสดงเฉพาะข้อมูล nomination point ที่อยู่ภายใต้ contract point ที่คลิกเข้ามาเท่านั้น https://app.clickup.com/t/86etetawv
        // setDataForFilter(data);

        console.log(">>> data", data)
        const filter_under_this_contract = data?.filter((item: any) =>
            item?.contract == dataMain?.contract &&
            item?.shipper == shipper_id &&
            item?.relation_point == dataMain?.contract_point &&
            item?.entry_exit == dataMain?.entry_exit &&
            item?.gas_hour == dataMain?.gas_hour &&
            item?.gas_day == dataMain?.gas_day
            // item?.execute_timestamp == dataMain?.execute_timestamp
        )

        console.log(">>> filter_under_this_contract", filter_under_this_contract)

        setDataForFilter(filter_under_this_contract);
        setFilteredDataTable(filter_under_this_contract)
    }, [data]);

    // useEffect(() => {
    //     const filter_under_this_contract = data?.filter((item: any) =>
    //         item?.contract == dataMain?.contract &&
    //             item?.shipper == dataMain?.shipper ? dataMain?.shipper : dataMain?.group?.name &&
    //             item?.relation_point == dataMain?.contract_point &&
    //             item?.entry_exit == dataMain?.entry_exit &&
    //             item?.gas_hour == dataMain?.gas_hour &&
    //             item?.gas_day == dataMain?.gas_day &&
    //         item?.execute_timestamp == dataMain?.execute_timestamp
    //     )

    //     setFilteredDataTable(filter_under_this_contract)
    // }, [data])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataForFilter?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                return (
                    item?.entry_exit_obj?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatDateNoTime(item?.gas_day)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    toDayjs(item?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm').replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimal(item?.contractCapacity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.allocatedValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    formatNumberFourDecimalNoComma(item?.contractCapacity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.nominationValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.allocatedValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );

        setFilteredDataTable(filtered);
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (filteredDataTable) {
            setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
        // setPaginatedData(filteredDataTable)
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openPopOver = Boolean(anchorEl);

    const [columnVisibility, setColumnVisibility] = useState<any>(
        initialColumns
            ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
            : {}
    );

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleCloseModal = () => {
        handleClose();
        setTimeout(() => {
            setCurrentPage(1)
            setItemsPerPage(10)
        }, 200);
    };

    return (
        <>
            <Dialog open={open} onClose={handleCloseModal} className="relative z-20">
                {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
                <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
                <div className="fixed inset-0 z-10 flex items-center justify-center">
                    <DialogPanel
                        transition
                        className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex flex-col items-center gap-2 p-9 w-[calc(100vw-100px)] h-[calc(100vh-80px)]">
                            <div className="w-full">
                                <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{`View`}</h2>
                                <div className="mb-4 w-[70%]">

                                    <div className="grid grid-cols-5 w-full text-sm font-semibold text-[#58585A] pb-2">
                                        <p>{`Shipper Name`}</p>
                                        <p>{`Contract Code`}</p>
                                        <p>{`Contract Point`}</p>
                                        {tabIndex == 1 && <p>{`Gas Hour`}</p>}
                                        <p>{`Timestamp`}</p>
                                    </div>

                                    <div className="grid grid-cols-5 text-sm font-light text-[#58585A]">
                                        <p>{dataMain?.group?.name || ''}</p>
                                        <p>{dataMain?.contract || ''}</p>
                                        <p>{dataMain?.contract_point || ''}</p>
                                        {tabIndex == 1 && <p>{dataMain?.gas_hour ? dataMain?.gas_hour + ':00' : ''}</p>}
                                        <p>{dataMain?.execute_timestamp ? toDayjs(dataMain?.execute_timestamp * 1000).format('DD/MM/YYYY HH:mm') : null}</p>
                                    </div>

                                </div>
                            </div>

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
                                                // generalFunc={() => exportToExcel(paginatedData, 'allocation_report', columnVisibility)}
                                                generalFunc={() => exportToExcel(filteredDataTable, 'allocation_report', columnVisibility)}
                                                can_export={userPermission ? userPermission?.f_export : false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <TableViewAllocReport tableData={paginatedData} columnVisibility={columnVisibility} />
                            </div>

                            <PaginationComponent
                                totalItems={filteredDataTable?.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />

                            <div className="relative w-full pt-20">
                                <button onClick={handleCloseModal} className="absolute bottom-0 right-0 w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 tracking-[1px]">
                                    {'Close'}
                                </button>
                            </div>

                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

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

export default ModalViewAllocReport;