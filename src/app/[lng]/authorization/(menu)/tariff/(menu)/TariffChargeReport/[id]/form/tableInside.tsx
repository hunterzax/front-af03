import { useEffect, useRef, useState } from "react";
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import Spinloading from "@/components/other/spinLoading";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import BtnActionTable from "@/components/other/btnActionInTable";
import { handleSort } from "@/utils/sortTable";
import { calcTotalTariffDetail, formatNumberFourDecimalNom, formatNumberTwoDecimal, formatNumberTwoDecimalNom, formatNumberTwoDecimalNomRound, roundNumber } from "@/utils/generalFormatter";
import NodataTable from "@/components/other/nodataTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import 'react-toastify/dist/ReactToastify.css';
import { TariffTotalRow } from "./totalRow";

interface TableProps {
    openEditForm: (id: any) => void;
    tableData: any;
    isLoading?: boolean;
    setisLoading?: any;
    columnVisibility?: any;
    initialColumns?: any;
    openViewForm: (id: any) => void;
    userPermission?: any;
    userDT?: any;
    handleFormSubmit?: any;
}

const TableTariffChargeReportInside: React.FC<TableProps> = ({
    openEditForm,
    tableData,
    isLoading = false,
    setisLoading,
    openViewForm,
    columnVisibility,
    initialColumns,
    userPermission,
    userDT,
    handleFormSubmit,
}) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const [openPopoverId, setOpenPopoverId] = useState(null);
    const isShipper = userDT?.account_manage?.[0]?.user_type_id === 3;
    const popoverRef = useRef<HTMLDivElement>(null);

    // เอาไว้ span column แบบ dynamic เคสเปิด ปิดไส้ใน
    // const getVisibleChildCount = (parentKey: string) => initialColumns?.filter((col: any) => col.parent_id === parentKey && columnVisibility[col.key]).length || 1;

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    // const [dataSubmit, setDataSubmit] = useState<any>()
    const [dataTotal, setDataTotal] = useState<any>({})

    useEffect(() => {
        // tableData inside -->

        if (tableData && tableData.length > 0) {
            // ของเดิม
            // const totalRow = calcTotalTariffDetail(tableData);
            // setDataTotal(totalRow)
            // setSortedData(tableData);

            // หา tableData.tariff_type_charge_id == 7 แล้วเอาไว้ตัวสุดท้ายของ array
            const non7 = tableData.filter((item: any) => item.tariff_type_charge_id !== 7);
            const only7 = tableData.filter((item: any) => item.tariff_type_charge_id === 7);
            const damage_charge_last = [...non7, ...only7];

            const totalRow = calcTotalTariffDetail(damage_charge_last);
            
            // เรียงข้อมูล sort_data.tariff_type_charge_id ตาม priority ดังนี้ 1 2 5 6 3 4 7
            const order = [1, 2, 5, 6, 3, 4, 7];
            const rank = new Map(order.map((v, i) => [v, i])); // tariff_type_charge_id -> ลำดับ

            const sorted_charge = [...damage_charge_last]
                .map((item, idx) => ({ item, idx })) // เก็บ index เดิมไว้ให้ sort เสถียร
                .sort((a, b) => {
                    const ra = rank.get(a.item.tariff_type_charge_id) ?? Number.POSITIVE_INFINITY; // id แปลกๆ ไปท้าย
                    const rb = rank.get(b.item.tariff_type_charge_id) ?? Number.POSITIVE_INFINITY;
                    return ra - rb || a.idx - b.idx; // ถ้า rank เท่ากัน รักษาลำดับเดิม
                })
                .map(x => x.item);

            setDataTotal(totalRow)
            // setSortedData(damage_charge_last);
            setSortedData(sorted_charge);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUp sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDown sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
            setOpenPopoverId(null);
        } else {
            setOpenPopoverId(id);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setOpenPopoverId(null);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popoverRef]);

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
            case "view":
                openViewForm(id);
                setOpenPopoverId(null); // close popover
                break;
            case "edit":
                openEditForm(id);
                setOpenPopoverId(null);
                break;
        }
    }

    return (
        <>
            <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md relative z-1">
                <Spinloading spin={isLoading} rounded={0} />
                {!isLoading ?
                    <table className="min-w-full text-sm text-left rtl:text-right text-gray-500 whitespace-nowrap">
                        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">

                            <tr className="h-9">
                                {columnVisibility?.type_charge && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("tariff_type_charge.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Type Charge`}
                                        {getArrowIcon("tariff_type_charge.name")}
                                    </th>
                                )}

                                {columnVisibility?.contract_code && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("contract_code.contract_code", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Code`}
                                        {getArrowIcon("contract_code.contract_code")}
                                    </th>
                                )}

                                {columnVisibility?.contract_type && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("term_type.name", sortState, setSortState, setSortedData, tableData)}>
                                        {`Contract Type`}
                                        {getArrowIcon("term_type.name")}
                                    </th>
                                )}

                                {columnVisibility?.quantity_operator && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("quantity_operator", sortState, setSortState, setSortedData, tableData)}>
                                        {`Quantity Operator`}
                                        {getArrowIcon("quantity_operator")}
                                    </th>
                                )}

                                {columnVisibility?.quantity && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("quantity", sortState, setSortState, setSortedData, tableData)}>
                                        {`Quantity`}
                                        {getArrowIcon("quantity")}
                                    </th>
                                )}

                                {columnVisibility?.unit && (
                                    <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("unit", sortState, setSortState, setSortedData, tableData)}>
                                        {`Unit`}
                                        {getArrowIcon("unit")}
                                    </th>
                                )}

                                {/* {columnVisibility?.co_efficient && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("co_efficient", sortState, setSortState, setSortedData, tableData)}>
                                        {`Co-Efficient (%)`}
                                        {getArrowIcon("co_efficient")}
                                    </th>
                                )} */}

                                {columnVisibility?.fee && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("fee", sortState, setSortState, setSortedData, tableData)}>
                                        {`Fee (Baht/MMBTU)`}
                                        {getArrowIcon("fee")}
                                    </th>
                                )}

                                {columnVisibility?.amount_baht && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("amount", sortState, setSortState, setSortedData, tableData)}>
                                        {`Amount (Baht)`}
                                        {getArrowIcon("amount")}
                                    </th>
                                )}

                                {columnVisibility?.amount_operator_baht && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("amount_operator", sortState, setSortState, setSortedData, tableData)}>
                                        {`Amount Operator (Baht)`}
                                        {getArrowIcon("amount_operator")}
                                    </th>
                                )}

                                {columnVisibility?.amount_compare_baht && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("amount_compare", sortState, setSortState, setSortedData, tableData)}>
                                        {`Amount Compare (Baht)`}
                                        {getArrowIcon("amount_compare")}
                                    </th>
                                )}

                                {columnVisibility?.difference && (
                                    <th scope="col" className={`${table_sort_header_style} `} onClick={() => handleSort("difference", sortState, setSortState, setSortedData, tableData)}>
                                        {`Difference`}
                                        {getArrowIcon("difference")}
                                    </th>
                                )}

                                {columnVisibility.action && (
                                    <th scope="col" className={`${table_header_style} !min-w-[100px] text-center`}>
                                        {`Action`}
                                    </th>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {sortedData && sortedData?.map((row: any, index: any) => (
                                <tr
                                    key={row?.id}
                                    className={`${table_row_style}`}
                                >

                                    {columnVisibility?.type_charge && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.tariff_type_charge ? row?.tariff_type_charge?.name : ''}</td>
                                    )}

                                    {columnVisibility?.contract_code && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] `}>{row?.contract_code ? row?.contract_code?.contract_code : ''}</td>
                                    )}

                                    {columnVisibility?.contract_type && (
                                        <td className="px-2 py-1 justify-center ">
                                            <div className="flex justify-center items-center">
                                                {row?.term_type &&
                                                    <div className="flex min-w-[180px] max-w-[250px] justify-center text-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.term_type?.color }}>
                                                        {`${row?.term_type?.name}`}
                                                    </div>
                                                }
                                            </div>
                                        </td>
                                    )}

                                    {columnVisibility?.quantity_operator && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.quantity_operator ? formatNumberTwoDecimalNom(row?.quantity_operator) : ''}</td>
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.quantity_operator !== null && row?.quantity_operator !== undefined ? roundNumber(row?.quantity_operator) : ''}</td>
                                    )}

                                    {columnVisibility?.quantity && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.quantity ? formatNumberThreeDecimal(row?.quantity) : ''}</td>
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.quantity !== null && row?.quantity !== undefined ? roundNumber(row?.quantity) : ''}</td>
                                    )}

                                    {columnVisibility?.unit && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-center`}>{row?.unit ? row?.unit : ''}</td>
                                    )}

                                    {/* {columnVisibility?.co_efficient && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.co_efficient !== null && row?.co_efficient !== undefined ? formatNumberThreeDecimal(row?.co_efficient) : ''}</td>
                                    )} */}

                                    {columnVisibility?.fee && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.fee !== null && row?.fee !== undefined ? formatNumberTwoDecimalNom(row?.fee) : ''}</td>
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.fee !== null && row?.fee !== undefined ? formatNumberFourDecimalNom(row?.fee) : ''}</td>
                                    )}

                                    {columnVisibility?.amount_baht && (
                                        // <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.amount !== null && row?.amount !== undefined ? formatNumberTwoDecimalNom(row?.amount) : ''}</td>
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.amount !== null && row?.amount !== undefined ? formatNumberTwoDecimalNomRound(row?.amount) : ''}</td> // Column Amount (Baht) คำนวณไม่ถูก มันต้องเอาค่าจำนวนเต็มของ Quantity ที่แสดงตรงหน้า UI มา x กับ ค่า Fee แล้วถ้าทศนิยมมันเกิน 2 ตำแหน่ง จะต้องปัดให้เหลือ 2 ตำแหน่ง (ปัดขึ้นปัดลงตามปกติ) https://app.clickup.com/t/86evh20ju
                                    )}

                                    {columnVisibility?.amount_operator_baht && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.amount_operator !== null && row?.amount_operator !== undefined ? formatNumberTwoDecimalNom(row?.amount_operator) : ''}</td>
                                    )}

                                    {columnVisibility?.amount_compare_baht && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.amount_compare !== null && row?.amount_compare !== undefined ? formatNumberTwoDecimalNom(row?.amount_compare) : ''}</td>
                                    )}

                                    {columnVisibility?.difference && (
                                        <td className={`px-2 py-1 text-[#464255] min-w-[120px] text-right`}>{row?.difference !== null && row?.difference !== undefined ? formatNumberTwoDecimalNom(row?.difference) : ''}</td>
                                    )}

                                    {columnVisibility.action && (
                                        <td className="px-2 py-1">
                                            <div className="relative inline-flex justify-center items-center w-full">
                                                <BtnActionTable togglePopover={togglePopover} row_id={row?.id} disable={!userPermission?.f_view && !userPermission?.f_edit ? true : false} />
                                                {openPopoverId === row?.id && (
                                                    <div ref={popoverRef}
                                                        className="absolute left-[-6.6rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                                                        <ul className="py-2">
                                                            {
                                                                // damage charge ไม่มี view
                                                                userPermission?.f_view && row?.tariff_type_charge?.name !== 'Damage Charge' && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                                            }
                                                            {
                                                                userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("edit", row?.id) }}><EditOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Edit`}</li>
                                                            }
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}

                            {
                                sortedData?.length > 0 &&
                                <TariffTotalRow
                                    dataTotal={dataTotal}
                                    columnVisibility={columnVisibility}
                                />
                            }
                        </tbody>
                    </table>
                    :
                    <TableSkeleton />
                }

                {
                    !isLoading && sortedData?.length == 0 && <NodataTable /> // v2.0.98 No data ขึ้นติดมาด้วย ตอน search value Total https://app.clickup.com/t/86euw5fzj 
                }

            </div>


            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {

                    setModaConfirmSave(false);
                    if (e == "submit") {
                        // setIsLoading(true);
                        setTimeout(async () => {
                            // updateMainStat(dataSubmit);
                        }, 100);

                        // setTimeout(async () => {
                        //     handleClose();
                        // }, 1000);
                    }
                }}
                title="Confirm Close Document"
                description={
                    <div>
                        <div className="text-center">
                            {`Do you want to close this document?`}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Confirm"
                btnsplit2="Cancel"
                stat="none"
            />
        </>
    )
}

export default TableTariffChargeReportInside;