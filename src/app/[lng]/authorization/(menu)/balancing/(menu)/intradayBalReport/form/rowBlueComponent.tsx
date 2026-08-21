import { formatNumberFourDecimal, formatNumberFourDecimalNom, getValidationColorClass, sumDetail } from "@/utils/generalFormatter";
import getUserValue from "@/utils/getuserValue";
import React from "react";

interface ContractRowProps {
    row: any;
    shipperItem: any;
    contract?: any;
    type?: any;
    shipperGroupData?: any;
    columnVisibility?: any;
    cIdx: number;
    index: number;
    table_row_style?: string;
}

const ContractRowBlueBase = ({
    row,
    shipperItem,
    contract,
    type,
    shipperGroupData,
    columnVisibility,
    cIdx,
    index,
    table_row_style = "",
}: ContractRowProps) => {
    const userDT: any = getUserValue();

    // let find_shipper_name = shipperGroupData?.find((item: any) => {
    //     let filtered = item?.id_name == shipperItem?.shipper
    //     return filtered
    // })

    const getColCustom: any = () => {
        let countCol: number = 0;
        let listInitial = [
            'gas_day',
            'gas_hour',
            'timestamp',
            'shipper_name',
        ]

        listInitial?.map((item: any) => {
            if (columnVisibility?.[item]) {
                countCol = countCol + 1
            }
        })

        return countCol
    }

    return (
        <tr
            key={`contract-${row?.request_number}-${cIdx}-${index}`}
            className={table_row_style}
        >

            {/* {
                userDT?.account_manage?.[0]?.user_type_id !== 3 &&
                <td className={` font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col"></td>
            } */}

            {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                // <td className={` font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col"></td>
                <td className={` border-r-[#c0c0c0] border-r-[1px] font-semibold  text-right text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">{``}</td>
            )}
            {columnVisibility.gas_day && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] whitespace-nowrap text-right  py-1 pl-1 font-semibold  text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">
                    {shipperItem ? `TOTAL : ${shipperItem?.gas_day_2}` : 'TOTAL :'}
                </td>
            )}
            {columnVisibility.gas_hour && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] py-1 pl-1 font-semibold  text-center text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">
                    {shipperItem ? shipperItem?.gas_hour : ''}
                </td>
            )}
            {columnVisibility.timestamp && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">
                    {shipperItem ? shipperItem?.timestamp : ''}
                </td>
            )}
            {columnVisibility.shipper_name && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">
                    {shipperItem ? shipperItem?.shipper_name : ''}
                </td>
            )}

            {columnVisibility.plan_actual && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">
                    {type == 'planning' ? 'TOTAL PLANNING' : 'TOTAL ACTUAL'}
                </td>
            )}

            {columnVisibility.contract_code && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#004762] bg-[#83DDFF33]`} colSpan={1} scope="col">
                    {''}
                </td>
            )}

            {/* UNDER Summary Pane */}
            {columnVisibility.summary_pane && (<>

                {/* "total_entry_east" */}
                {columnVisibility.east_total_entry_mmbtud && (
                    <td className={`${!columnVisibility.west_total_entry_mmbtud && !columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem?.total_entry_east)}
                    </td>
                )}

                {/* "total_entry_west" */}
                {columnVisibility.west_total_entry_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem?.total_entry_west)}
                    </td>
                )}

                {/* "total_entry_east-west" */}
                {columnVisibility.east_west_total_entry_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["total_entry_east-west"])}
                    </td>
                )}

                {/* "total_exit_east" */}
                {columnVisibility.east_total_exit_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_exit_mmbtud && !columnVisibility.west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["total_exit_east"])}
                    </td>
                )}

                {/* "total_exit_west" */}
                {columnVisibility.west_total_exit_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["total_exit_west"])}
                    </td>
                )}

                {/* "total_exit_east-west" */}
                {columnVisibility.east_west_total_exit_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["total_exit_east-west"])}
                    </td>
                )}

                {/* "imbZone_east" */}
                {columnVisibility.east_imbalance_zone_mmbtud && (
                    <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && !columnVisibility.west_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["imbZone_east"])}
                    </td>
                )}

                {/* "imbZone_west" */}
                {columnVisibility.west_imbalance_zone_mmbtud && (
                    <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["imbZone_west"])}
                    </td>
                )}

                {/* "imbZone_total" */}
                {columnVisibility.total_imbalance_zone_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["imbZone_total"])}
                    </td>
                )}

                {/* "InstructedFlow_east" */}
                {columnVisibility.east_instructed_flow_mmbtud && (
                    <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && !columnVisibility.west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["instructedFlow_east"])}
                    </td>
                )}

                {/* "InstructedFlow_west" */}
                {columnVisibility.west_instructed_flow_mmbtud && (
                    <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["instructedFlow_west"])}
                    </td>
                )}

                {/* ******************** "Instructed Flow EAST-WEST" ******************** */}
                {columnVisibility.east_west_instructed_flow_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["instructedFlow_east-west"])}
                    </td>
                )}

                {/* "shrinkage_east" */}
                {columnVisibility.east_shrinkage_volume_mmbtud && (
                    <td className={`${!columnVisibility.west_shrinkage_volume_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["shrinkage_east"])}
                    </td>
                )}

                {/* "shrinkage_west" */}
                {columnVisibility.west_shrinkage_volume_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["shrinkage_west"])}
                    </td>
                )}

                {/* "park_east" */}
                {columnVisibility.east_park_mmbtud && (
                    <td className={`${!columnVisibility.west_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["park_east"])}
                    </td>
                )}

                {/* "park_west" */}
                {columnVisibility.west_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["park_west"])}
                    </td>
                )}

                {/* "Unpark_east" */}
                {columnVisibility.east_unpark_mmbtud && (
                    <td className={`${!columnVisibility.west_unpark_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["Unpark_east"])}
                    </td>
                )}

                {/* "Unpark_west" */}
                {columnVisibility.west_unpark_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["Unpark_west"])}
                    </td>
                )}

                {/* "SodPark_east" */}
                {columnVisibility.east_sod_park_mmbtud && (
                    <td className={`${!columnVisibility.west_sod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["SodPark_east"])}
                    </td>
                )}

                {/* "SodPark_west" */}
                {columnVisibility.west_sod_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["SodPark_west"])}
                    </td>
                )}

                {/* "EodPark_east" */}
                {columnVisibility.east_eod_park_mmbtud && (
                    <td className={`${!columnVisibility.west_eod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["EodPark_east"])}
                    </td>
                )}

                {/* "EodPark_west" */}
                {columnVisibility.west_eod_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["EodPark_west"])}
                    </td>
                )}

                {/* "minInventoryChange_east" */}
                {columnVisibility.east_min_inventory_change_mmbtud && (
                    <td className={`${!columnVisibility.west_min_inventory_change_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["minInventoryChange_east"])}
                    </td>
                )}

                {/* "minInventoryChange_west" */}
                {columnVisibility.west_min_inventory_change_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["minInventoryChange_west"])}
                    </td>
                )}

                {/* "reserveBal_east" */}
                {columnVisibility.east_reserve_bal_mmbtud && (
                    <td className={`${!columnVisibility.west_reserve_bal_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["reserveBal_east"])}
                    </td>
                )}

                {/* "reserveBal_west" */}
                {columnVisibility.west_reserve_bal_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["reserveBal_west"])}
                    </td>
                )}

                {/* "adjustDailyImb_east" */}
                {columnVisibility.east_adjust_imbalance_mmbtud && (
                    <td className={`${!columnVisibility.west_adjust_imbalance_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["adjustDailyImb_east"])}
                    </td>
                )}

                {/* "adjustDailyImb_west" */}
                {columnVisibility.west_adjust_imbalance_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["adjustDailyImb_west"])}
                    </td>
                )}

                {/* "ventGas_east" */}
                {columnVisibility.east_vent_gas && (
                    <td className={`${!columnVisibility.west_vent_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["ventGas_east"])}
                    </td>
                )}

                {/* "ventGas_west" */}
                {columnVisibility.west_vent_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["ventGas_west"])}
                    </td>
                )}

                {/* "commissioningGas_east" */}
                {columnVisibility.east_commissioning_gas && (
                    <td className={`${!columnVisibility.west_commissioning_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["commissioningGas_east"])}
                    </td>
                )}

                {/* "commissioningGas_west" */}
                {columnVisibility.west_commissioning_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["commissioningGas_west"])}
                    </td>
                )}

                {/* "otherGas_east" */}
                {columnVisibility.east_other_gas && (
                    <td className={`${!columnVisibility.west_other_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["otherGas_east"])}
                    </td>
                )}

                {/* "otherGas_west" */}
                {columnVisibility.west_other_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["otherGas_west"])}
                    </td>
                )}

                {/* "dailyImb_east" */}
                {columnVisibility.east_daily_imb_mmbtud && (
                    <td className={`${!columnVisibility.west_daily_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["dailyImb_east"])}
                    </td>
                )}

                {/* "dailyImb_west" */}
                {columnVisibility.west_daily_imb_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["dailyImb_west"])}
                    </td>
                )}

                {/* "aip" */}
                {columnVisibility.total_aip_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["aip"])}
                    </td>
                )}

                {/* "AIN (MMBTU/D)" */}
                {columnVisibility.total_ain_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["ain"])}
                    </td>
                )}

                {/* "% IMB" */}
                {columnVisibility.total_percentage_imb && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["absimb"])}
                    </td>
                )}

                {/* "absimb" */}
                {columnVisibility.total_percentage_abslmb && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {/* {shipperItem["absimb"] ? formatNumberFourDecimalNom(Math.abs(shipperItem["absimb"])) : ''} */}
                        {shipperItem["absimb"] !== null && shipperItem["absimb"] !== undefined && !Number.isNaN(Math.abs(shipperItem["absimb"])) ? formatNumberFourDecimalNom(Math.abs(shipperItem["absimb"])) : ""}
                        
                        {/* {shipperItem ? formatNumberFourDecimal(shipperItem["absimb"]) : ''} */}
                    </td>
                )}

                {/* "accImbMonth_east" */}
                {columnVisibility.east_acc_imb_month_mmbtud && (
                    <td className={`${!columnVisibility.west_acc_imb_month_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["accImbMonth_east"])}
                    </td>
                )}

                {/* "accImbMonth_west" */}
                {columnVisibility.west_acc_imb_month_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["accImbMonth_west"])}
                    </td>
                )}


                {/* 
                    validation_accImb_east
                    validation_accImb_west
                    validation_accImbInv_east
                    validation_accImbInv_west 
                */}

                {/* "accImb_east" */}
                {columnVisibility.east_acc_imb_mmbtud && (
                    <td className={`${!columnVisibility.west_acc_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(shipperItem["validation_accImb_east"]?.toLowerCase(), 'bg-[#83DDFF33]')}`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["accImb_east"])}
                    </td>
                )}

                {/* "accImb_west" */}
                {columnVisibility.west_acc_imb_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(shipperItem["validation_accImb_west"]?.toLowerCase(), 'bg-[#83DDFF33]')}`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["accImb_west"])}
                    </td>
                )}

                {/* "accImbInv_east" */}
                {columnVisibility.east_acc_imb_inventory_mmbtud && (
                    <td className={`${!columnVisibility.west_acc_imb_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(shipperItem["validation_accImbInv_east"]?.toLowerCase(), 'bg-[#83DDFF33]')}`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["accImbInv_east"])}
                    </td>
                )}

                {/* "accImbInv_west" */}
                {columnVisibility.west_acc_imb_inventory_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(shipperItem["validation_accImbInv_west"]?.toLowerCase(), 'bg-[#83DDFF33]')}`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["accImbInv_west"])}
                    </td>
                )}

                {/* "minInventory_east" */}
                {columnVisibility.east_min_inventory_mmbtud && (
                    <td className={`${!columnVisibility.west_min_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["minInventory_east"])}
                    </td>
                )}

                {/* "minInventory_west" */}
                {columnVisibility.west_min_inventory_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                        {formatNumberFourDecimalNom(shipperItem["minInventory_west"])}
                    </td>
                )}

            </>)}



            {/* UNDER Detail Pane */}
            {columnVisibility.detail_pane && (
                <>
                    {/* "detail_entry_east_gsp" */}
                    {columnVisibility.gsp && (
                        <td className={`${!columnVisibility.others_east && !columnVisibility.lng && !columnVisibility.bypass_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east_gsp"])}
                        </td>
                    )}

                    {/* "detail_entry_east_bypassGas" */}
                    {columnVisibility.bypass_gas && (
                        <td className={`${!columnVisibility.others_east && !columnVisibility.lng && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east_bypassGas"])}
                        </td>
                    )}

                    {/* "detail_entry_east_lng" */}
                    {columnVisibility.lng && (
                        <td className={`${!columnVisibility.others_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east_lng"])}
                        </td>
                    )}

                    {/* "detail_entry_east_others" */}
                    {columnVisibility.others_east && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_entry_east_', ['gsp', 'bypassGas', 'lng', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_entry_west_yadana" */}
                    {columnVisibility.ydn && (
                        <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && !columnVisibility.ytg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_west_yadana"])}
                        </td>
                    )}

                    {/* "detail_entry_west_yetagun" */}
                    {columnVisibility.ytg && (
                        <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_west_yetagun"])}
                        </td>
                    )}

                    {/* "detail_entry_west_zawtika" */}
                    {columnVisibility.ztk && (
                        <td className={`${!columnVisibility.others_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_west_zawtika"])}
                        </td>
                    )}

                    {/* "detail_entry_west_others" */}
                    {columnVisibility.others_west && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_entry_west_', ['zawtika', 'yetagun', 'yadana', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6East" */}
                    {columnVisibility.ra6_east && (
                        <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && !columnVisibility.ra6_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_ra6East"])}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6West" */}
                    {columnVisibility.ra6_west && (
                        <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_ra6West"])}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10East" */}
                    {columnVisibility.bvw10_east && (
                        <td className={`${!columnVisibility.bvw10_West && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_bvw10East"])}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10West" */}
                    {columnVisibility.bvw10_West && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_entry_east-west_bvw10West"])}
                        </td>
                    )}

                    {/* "detail_exit_east_egat" */}
                    {columnVisibility.egat && (
                        <td className={`${!columnVisibility.others_east_exit && !columnVisibility.ipp && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_east_egat"])}
                        </td>
                    )}

                    {/* "detail_exit_east_ipp" */}
                    {columnVisibility.ipp && (
                        <td className={`${!columnVisibility.others_east_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_east_ipp"])}
                        </td>
                    )}

                    {/* "detail_exit_east_others" */}
                    {columnVisibility.others_east_exit && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_exit_east_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_west_egat" */}
                    {columnVisibility.egat_west && (
                        <td className={`${!columnVisibility.others_west_exit && !columnVisibility.ipp_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_west_egat"])}
                        </td>
                    )}

                    {/* "detail_exit_west_ipp" */}
                    {columnVisibility.ipp_west && (
                        <td className={`${!columnVisibility.others_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_west_ipp"])}
                        </td>
                    )}

                    {/* "detail_exit_west_others" */}
                    {columnVisibility.others_west_exit && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_exit_west_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_east-west_egat" */}
                    {columnVisibility.egat_east_west && (
                        <td className={`${!columnVisibility.others_east_west_exit && !columnVisibility.ipp_east_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_east-west_egat"])}
                        </td>
                    )}

                    {/* "detail_exit_east-west_ipp" */}
                    {columnVisibility.ipp_east_west && (
                        <td className={`${!columnVisibility.others_east_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_east-west_ipp"])}
                        </td>
                    )}

                    {/* "detail_exit_east-west_others" */}
                    {columnVisibility.others_east_west_exit && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(shipperItem, 'detail_exit_east-west_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_east_F2andG" */}
                    {columnVisibility.east_f2andg && (
                        <td className={`${!columnVisibility.west_f2andg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_east_F2andG"])}
                        </td>
                    )}

                    {/* "detail_exit_west_F2andG" */}
                    {columnVisibility.west_f2andg && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_west_F2andG"])}
                        </td>
                    )}

                    {/* "detail_exit_E_east" */}
                    {columnVisibility.east_e && (
                        <td className={`${!columnVisibility.west_e && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_E_east"])}
                        </td>
                    )}

                    {/* "detail_exit_E_west" */}
                    {columnVisibility.west_e && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#83DDFF33]`} scope="col">
                            {formatNumberFourDecimalNom(shipperItem["detail_exit_E_west"])}
                        </td>
                    )}

                </>)}
        </tr>
    );
};


export const ContractRowBlue = React.memo(
    ContractRowBlueBase,
    // areEqual  // (optional) comparator
);