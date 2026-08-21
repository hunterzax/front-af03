"use client";
import * as React from 'react';
import {
    Dialog,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from 'react';
import { exportToExcel, formatNumberFourDecimal, formatNumberFourDecimalNoComma } from '@/utils/generalFormatter';
import SearchInput from '@/components/other/searchInput';
import BtnGeneral from '@/components/other/btnGeneral';
import TableViewCurtailsmentAlloc from './tableView';

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

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>(data?.curtailments_allocation_calc);
    const [dataForFilter, setDataForFilter] = useState<any>(data);

    useEffect(() => {
        setFilteredDataTable(data?.curtailments_allocation_calc)
        setDataForFilter(data?.curtailments_allocation_calc);
    }, [data])

    // ############### LIKE SEARCH ###############
    const handleSearch = (query: string) => {
        const filtered = dataForFilter?.filter(
            (item: any) => {
                const queryLower = query.replace(/\s+/g, '')?.toLowerCase().trim();
                return (
                    item?.shipper_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.contract?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

                    item?.nomination_value?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.nomination_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.nomination_value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    item?.remaining_capacity?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimal(item?.remaining_capacity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
                    formatNumberFourDecimalNoComma(item?.remaining_capacity)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)
                )
            }
        );
        setFilteredDataTable(filtered);
    };

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedData, setPaginatedData] = useState<any[]>([]);

    // const handlePageChange = (page: number) => {
    //     setCurrentPage(page);
    // };

    // const handleItemsPerPageChange = (itemsPerPage: number) => {
    //     setItemsPerPage(itemsPerPage);
    //     setCurrentPage(1);
    // };

    useEffect(() => {
        // if (filteredDataTable) {
        //     // setPaginatedData(filteredDataTable.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        // }
        setPaginatedData(filteredDataTable)
    }, [filteredDataTable, currentPage, itemsPerPage])

    // ############### COLUMN SHOW/HIDE ###############
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openPopOver = Boolean(anchorEl);
    const id = openPopOver ? 'column-toggle-popover' : undefined;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        initialColumns
            ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
            : {}
    );

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-20">
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

                                    <div className="grid grid-cols-[120px_80px_170px_140px] w-full text-sm font-semibold text-[#58585A] pb-2">
                                        <p>{`Gas Day`}</p>
                                        <p>{`Area`}</p>
                                        {tabIndex == 1 && <p>{`Nomination Point`}</p>}
                                        <p>{`Unit`}</p>
                                    </div>

                                    <div className="grid grid-cols-[120px_80px_170px_140px] text-sm font-light text-[#58585A]">
                                        <p>{data?.gas_day_text ? data?.gas_day_text : ''}</p>
                                        <p>{data?.area ? data?.area : ''}</p>
                                        {tabIndex == 1 && <p>{data?.nomination_point || ''}</p>}
                                        <p>{dataMain?.unit ? dataMain?.unit : ''}</p>
                                    </div>
                                </div>
                            </div>

                            <div className=" w-full pt-2">
                                <div>
                                    <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                                        <div >

                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            <SearchInput onSearch={handleSearch} />
                                            <BtnGeneral
                                                bgcolor={"#24AB6A"}
                                                modeIcon={'export'}
                                                textRender={"Export"}
                                                generalFunc={() => exportToExcel(
                                                    paginatedData,
                                                    'curtailsment-allocation-view',
                                                    columnVisibility,
                                                    {
                                                        "gas_day_text": data?.gas_day_text,
                                                        "area": data?.area,
                                                        "nomination_point": data?.nomination_point, // View : Export Row Total หายไป และมีข้อมูล Nomination Point เกินมา https://app.clickup.com/t/86eub6dgh
                                                        "unit": data?.unit,
                                                        "tab": tabIndex == 0 ? 'area' : 'nomination_point'
                                                    }
                                                )}
                                                can_export={userPermission ? userPermission?.f_export : false}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <TableViewCurtailsmentAlloc tableData={paginatedData} columnVisibility={columnVisibility} />
                            </div>

                            {/* 
                            <PaginationComponent
                                totalItems={filteredDataTable?.length}
                                itemsPerPage={itemsPerPage}
                                currentPage={currentPage}
                                onPageChange={handlePageChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            /> */}

                            <div className="relative w-full pt-20">
                                <button onClick={handleClose} className="absolute bottom-0 right-0 w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 tracking-[1px]">
                                    {'Close'}
                                </button>
                            </div>

                        </div>
                    </DialogPanel>
                </div>
            </Dialog>

            {/* <ColumnVisibilityPopover
                open={openPopOver}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                initialColumns={initialColumns}
            /> */}
        </>
    );
};

export default ModalViewAllocReport;