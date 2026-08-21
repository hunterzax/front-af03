import { formatNumberFourDecimal, formatNumberFourDecimalNom, getValidationColorClass, sumDetail } from "@/utils/generalFormatter";
import getUserValue from "@/utils/getuserValue";
import React from "react";

interface ContractRowProps {
    row: any;
    shipperItem?: any;
    contract?: any;
    type?: any;
    shipperGroupData?: any;
    columnVisibility?: any;
    cIdx?: number;
    index: number;
    table_row_style?: string;
}

export const ContractRowYellowBase = ({
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

    const getColCustom: any = () => {
        let countCol: number = 0;
        // let listInitial = [
        //     'gas_day',
        //     'gas_hour',
        //     'timestamp',
        //     'shipper_name',
        //     'plan_actual',
        // ]
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
                userDT?.account_manage?.[0]?.user_type_id !== 3 && <td className={` font-semibold  text-left text-[#004762] bg-[#FFEAA033]`} colSpan={1} scope="col"></td>
            } */}

            {/* {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                <td className={` font-semibold  text-left text-[#004762] bg-[#FFEAA033]`} colSpan={1} scope="col"></td>
            )}

            <td className={`px-2 py-1 pl-1 font-semibold text-[#5A4600] text-center bg-[#FFEAA033]`} colSpan={2} scope="col">
                {row ? row?.gas_day : ''}
            </td>

            <td className={`px-2 py-1 font-semibold text-[#5A4600] text-center bg-[#FFEAA033]`} colSpan={2} scope="col"></td>

            {columnVisibility.plan_actual && (
                <td className={` py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {type == 'planning' ? 'NOMINATION' : 'TOTAL'}
                </td>
            )}

            {columnVisibility.contract_code && (
                <td className={` py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {''}
                </td>
            )} */}

            {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                <td className={`  border-r-[#c0c0c0] border-r-[1px] font-semibold  text-right text-[#004762] bg-[#FFEAA033]`} colSpan={1} scope="col">{``}</td>
            )}

            {columnVisibility.gas_day && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] whitespace-nowrap text-right py-1 pl-1 font-semibold text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? `TOTAL ALL : ${row?.gas_day_2}` : 'TOTAL ALL :'}
                </td>
            )}
            {columnVisibility.gas_hour && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] py-1 pl-1 font-semibold  text-center text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? row?.gas_hour : ''}
                </td>
            )}
            {columnVisibility.timestamp && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? row?.timestamp : ''}
                </td>
            )}
            {columnVisibility.shipper_name && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? row?.shipper_name : ''}
                </td>
            )}

            {columnVisibility.plan_actual && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {type == 'planning' ? 'NOMINATION' : 'TOTAL'}
                </td>
            )}

            {columnVisibility.contract_code && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {''}
                </td>
            )}


            {/* UNDER Summary Pane */}
            {columnVisibility.summary_pane && (<>

                {/* "total_entry_east" */}
                {columnVisibility.east_total_entry_mmbtud && (
                    <td className={`${!columnVisibility.west_total_entry_mmbtud && !columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row?.total_entry_east) : ''} */}
                        {row?.total_entry_east !== null && row?.total_entry_east !== undefined ? formatNumberFourDecimalNom(row?.total_entry_east) : ''}
                    </td>
                )}

                {/* "total_entry_west" */}
                {columnVisibility.west_total_entry_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row?.total_entry_west) : ''} */}
                        {row?.total_entry_west !== null && row?.total_entry_west !== undefined ? formatNumberFourDecimalNom(row?.total_entry_west) : ''}
                    </td>
                )}

                {/* "total_entry_east-west" */}
                {columnVisibility.east_west_total_entry_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["total_entry_east-west"]) : ''} */}
                        {row["total_entry_east-west"] !== null && row["total_entry_east-west"] !== undefined ? formatNumberFourDecimalNom(row["total_entry_east-west"]) : ''}
                    </td>
                )}

                {/* "total_exit_east" */}
                {columnVisibility.east_total_exit_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_exit_mmbtud && !columnVisibility.west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["total_exit_east"]) : ''} */}
                        {row["total_exit_east"] !== null && row["total_exit_east"] !== undefined ? formatNumberFourDecimalNom(row["total_exit_east"]) : ''}
                    </td>
                )}

                {/* "total_exit_west" */}
                {columnVisibility.west_total_exit_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["total_exit_west"]) : ''} */}
                        {row["total_exit_west"] !== null && row["total_exit_west"] !== undefined ? formatNumberFourDecimalNom(row["total_exit_west"]) : ''}
                    </td>
                )}

                {/* "total_exit_east-west" */}
                {columnVisibility.east_west_total_exit_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["total_exit_east-west"]) : ''} */}
                        {row["total_exit_east-west"] !== null && row["total_exit_east-west"] !== undefined ? formatNumberFourDecimalNom(row["total_exit_east-west"]) : ''}
                    </td>
                )}

                {/* "imbZone_east" */}
                {columnVisibility.east_imbalance_zone_mmbtud && (
                    <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && !columnVisibility.west_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["imbZone_east"]) : ''} */}
                        {row["imbZone_east"] !== null && row["imbZone_east"] !== undefined ? formatNumberFourDecimalNom(row["imbZone_east"]) : ''}
                    </td>
                )}

                {/* "imbZone_west" */}
                {columnVisibility.west_imbalance_zone_mmbtud && (
                    <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["imbZone_west"]) : ''} */}
                        {row["imbZone_west"] !== null && row["imbZone_west"] !== undefined ? formatNumberFourDecimalNom(row["imbZone_west"]) : ''}
                    </td>
                )}

                {/* "imbZone_total" */}
                {columnVisibility.total_imbalance_zone_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["imbZone_total"]) : ''} */}
                        {row["imbZone_total"] !== null && row["imbZone_total"] !== undefined ? formatNumberFourDecimalNom(row["imbZone_total"]) : ''}
                    </td>
                )}

                {/* "InstructedFlow_east" */}
                {columnVisibility.east_instructed_flow_mmbtud && (
                    <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && !columnVisibility.west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["InstructedFlow_east"]) : ''} */}
                        {/* {row["InstructedFlow_east"] !== null && row["InstructedFlow_east"] !== undefined ? formatNumberFourDecimalNom(row["InstructedFlow_east"]) : ''} */}
                        {formatNumberFourDecimalNom(row["instructedFlow_east"])}
                    </td>
                )}

                {/* "InstructedFlow_west" */}
                {columnVisibility.west_instructed_flow_mmbtud && (
                    <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["InstructedFlow_west"]) : ''} */}
                        {/* {row["InstructedFlow_west"] !== null && row["InstructedFlow_west"] !== undefined ? formatNumberFourDecimalNom(row["InstructedFlow_west"]) : ''} */}
                        {formatNumberFourDecimalNom(row["instructedFlow_west"])}
                    </td>
                )}

                {/* ******************** "Instructed Flow EAST-WEST" ******************** */}
                {columnVisibility.east_west_instructed_flow_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["instructedFlow_east-west"])}
                    </td>
                )}

                {/* "shrinkage_east" */}
                {columnVisibility.east_shrinkage_volume_mmbtud && (
                    <td className={`${!columnVisibility.west_shrinkage_volume_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["shrinkage_east"]) : ''} */}
                        {row["shrinkage_east"] !== null && row["shrinkage_east"] !== undefined ? formatNumberFourDecimalNom(row["shrinkage_east"]) : ''}
                    </td>
                )}

                {/* "shrinkage_west" */}
                {columnVisibility.west_shrinkage_volume_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["shrinkage_west"]) : ''} */}
                        {row["shrinkage_west"] !== null && row["shrinkage_west"] !== undefined ? formatNumberFourDecimalNom(row["shrinkage_west"]) : ''}
                    </td>
                )}

                {/* "park_east" */}
                {columnVisibility.east_park_mmbtud && (
                    <td className={`${!columnVisibility.west_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["park_east"]) : ''} */}
                        {row["park_east"] !== null && row["park_east"] !== undefined ? formatNumberFourDecimalNom(row["park_east"]) : ''}
                    </td>
                )}

                {/* "park_west" */}
                {columnVisibility.west_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["park_west"]) : ''} */}
                        {row["park_west"] !== null && row["park_west"] !== undefined ? formatNumberFourDecimalNom(row["park_west"]) : ''}
                    </td>
                )}

                {/* "Unpark_east" */}
                {columnVisibility.east_unpark_mmbtud && (
                    <td className={`${!columnVisibility.west_unpark_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["Unpark_east"]) : ''} */}
                        {row["Unpark_east"] !== null && row["Unpark_east"] !== undefined ? formatNumberFourDecimalNom(row["Unpark_east"]) : ''}
                    </td>
                )}

                {/* "Unpark_west" */}
                {columnVisibility.west_unpark_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["Unpark_west"]) : ''} */}
                        {row["Unpark_west"] !== null && row["Unpark_west"] !== undefined ? formatNumberFourDecimalNom(row["Unpark_west"]) : ''}
                    </td>
                )}

                {/* "SodPark_east" */}
                {columnVisibility.east_sod_park_mmbtud && (
                    <td className={`${!columnVisibility.west_sod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["SodPark_east"]) : ''} */}
                        {row["SodPark_east"] !== null && row["SodPark_east"] !== undefined ? formatNumberFourDecimalNom(row["SodPark_east"]) : ''}
                    </td>
                )}

                {/* "SodPark_west" */}
                {columnVisibility.west_sod_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["SodPark_west"]) : ''} */}
                        {row["SodPark_west"] !== null && row["SodPark_west"] !== undefined ? formatNumberFourDecimalNom(row["SodPark_west"]) : ''}
                    </td>
                )}

                {/* "EodPark_east" */}
                {columnVisibility.east_eod_park_mmbtud && (
                    <td className={`${!columnVisibility.west_eod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["EodPark_east"]) : ''} */}
                        {row["EodPark_east"] !== null && row["EodPark_east"] !== undefined ? formatNumberFourDecimalNom(row["EodPark_east"]) : ''}
                    </td>
                )}

                {/* "EodPark_west" */}
                {columnVisibility.west_eod_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["EodPark_west"]) : ''} */}
                        {row["EodPark_west"] !== null && row["EodPark_west"] !== undefined ? formatNumberFourDecimalNom(row["EodPark_west"]) : ''}
                    </td>
                )}

                {/* "minInventoryChange_east" */}
                {columnVisibility.east_min_inventory_change_mmbtud && (
                    <td className={`${!columnVisibility.west_min_inventory_change_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["minInventoryChange_east"]) : ''} */}
                        {row["minInventoryChange_east"] !== null && row["minInventoryChange_east"] !== undefined ? formatNumberFourDecimalNom(row["minInventoryChange_east"]) : ''}
                    </td>
                )}

                {/* "minInventoryChange_west" */}
                {columnVisibility.west_min_inventory_change_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["minInventoryChange_west"]) : ''} */}
                        {row["minInventoryChange_west"] !== null && row["minInventoryChange_west"] !== undefined ? formatNumberFourDecimalNom(row["minInventoryChange_west"]) : ''}
                    </td>
                )}

                {/* "reserveBal_east" */}
                {columnVisibility.east_reserve_bal_mmbtud && (
                    <td className={`${!columnVisibility.west_reserve_bal_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["reserveBal_east"]) : ''} */}
                        {row["reserveBal_east"] !== null && row["reserveBal_east"] !== undefined ? formatNumberFourDecimalNom(row["reserveBal_east"]) : ''}
                    </td>
                )}

                {/* "reserveBal_west" */}
                {columnVisibility.west_reserve_bal_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["reserveBal_west"]) : ''} */}
                        {row["reserveBal_west"] !== null && row["reserveBal_west"] !== undefined ? formatNumberFourDecimalNom(row["reserveBal_west"]) : ''}
                    </td>
                )}

                {/* "adjustDailyImb_east" */}
                {columnVisibility.east_adjust_imbalance_mmbtud && (
                    <td className={`${!columnVisibility.west_adjust_imbalance_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["adjustDailyImb_east"]) : ''} */}
                        {row["adjustDailyImb_east"] !== null && row["adjustDailyImb_east"] !== undefined ? formatNumberFourDecimalNom(row["adjustDailyImb_east"]) : ''}
                    </td>
                )}

                {/* "adjustDailyImb_west" */}
                {columnVisibility.west_adjust_imbalance_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["adjustDailyImb_west"]) : ''} */}
                        {row["adjustDailyImb_west"] !== null && row["adjustDailyImb_west"] !== undefined ? formatNumberFourDecimalNom(row["adjustDailyImb_west"]) : ''}
                    </td>
                )}

                {/* "ventGas_east" */}
                {columnVisibility.east_vent_gas && (
                    <td className={`${!columnVisibility.west_vent_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["ventGas_east"]) : ''} */}
                        {row["ventGas_east"] !== null && row["ventGas_east"] !== undefined ? formatNumberFourDecimalNom(row["ventGas_east"]) : ''}
                    </td>
                )}

                {/* "ventGas_west" */}
                {columnVisibility.west_vent_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["ventGas_west"]) : ''} */}
                        {row["ventGas_west"] !== null && row["ventGas_west"] !== undefined ? formatNumberFourDecimalNom(row["ventGas_west"]) : ''}

                    </td>
                )}

                {/* "commissioningGas_east" */}
                {columnVisibility.east_commissioning_gas && (
                    <td className={`${!columnVisibility.west_commissioning_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["commissioningGas_east"]) : ''} */}
                        {row["commissioningGas_east"] !== null && row["commissioningGas_east"] !== undefined ? formatNumberFourDecimalNom(row["commissioningGas_east"]) : ''}

                    </td>
                )}

                {/* "commissioningGas_west" */}
                {columnVisibility.west_commissioning_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["commissioningGas_west"]) : ''} */}
                        {row["commissioningGas_west"] !== null && row["commissioningGas_west"] !== undefined ? formatNumberFourDecimalNom(row["commissioningGas_west"]) : ''}

                    </td>
                )}

                {/* "otherGas_east" */}
                {columnVisibility.east_other_gas && (
                    <td className={`${!columnVisibility.west_other_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["otherGas_east"]) : ''} */}
                        {row["otherGas_east"] !== null && row["otherGas_east"] !== undefined ? formatNumberFourDecimalNom(row["otherGas_east"]) : ''}
                    </td>
                )}

                {/* "otherGas_west" */}
                {columnVisibility.west_other_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["otherGas_west"]) : ''} */}
                        {row["otherGas_west"] !== null && row["otherGas_west"] !== undefined ? formatNumberFourDecimalNom(row["otherGas_west"]) : ''}
                    </td>
                )}

                {/* "dailyImb_east" */}
                {columnVisibility.east_daily_imb_mmbtud && (
                    <td className={`${!columnVisibility.west_daily_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["dailyImb_east"]) : ''} */}
                        {row["dailyImb_east"] !== null && row["dailyImb_east"] !== undefined ? formatNumberFourDecimalNom(row["dailyImb_east"]) : ''}
                    </td>
                )}

                {/* "dailyImb_west" */}
                {columnVisibility.west_daily_imb_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["dailyImb_west"]) : ''} */}
                        {row["dailyImb_west"] !== null && row["dailyImb_west"] !== undefined ? formatNumberFourDecimalNom(row["dailyImb_west"]) : ''}
                    </td>
                )}

                {/* "aip" */}
                {columnVisibility.total_aip_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["aip"]) : ''} */}
                        {row["aip"] !== null && row["aip"] !== undefined ? formatNumberFourDecimalNom(row["aip"]) : ''}

                    </td>
                )}

                {/* "AIN (MMBTU/D)" */}
                {columnVisibility.total_ain_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["ain"]) : ''} */}
                        {row["ain"] !== null && row["ain"] !== undefined ? formatNumberFourDecimalNom(row["ain"]) : ''}

                    </td>
                )}

                {/* "% IMB" */}
                {columnVisibility.total_percentage_imb && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["absimb"]) : ''} */}
                        {row["absimb"] !== null && row["absimb"] !== undefined ? formatNumberFourDecimalNom(row["absimb"]) : ''}

                    </td>
                )}

                {/* "absimb" */}
                {columnVisibility.total_percentage_abslmb && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row?.totalAll ? formatNumberFourDecimal(row?.totalAll["absimb"]) : ''} */}
                        {/* {``}  */}
                        {row["absimb"] !== null && row["absimb"] !== undefined && !Number.isNaN(Math.abs(row["absimb"])) ? formatNumberFourDecimalNom(Math.abs(row["absimb"])) : ""}

                        {/* {row ? formatNumberFourDecimal(row["absimb"]) : ''} */}
                    </td>
                )}

                {/* "accImbMonth_east" */}
                {columnVisibility.east_acc_imb_month_mmbtud && (
                    <td className={`${!columnVisibility.west_acc_imb_month_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["accImbMonth_east"]) : ''} */}
                        {row["accImbMonth_east"] !== null && row["accImbMonth_east"] !== undefined ? formatNumberFourDecimalNom(row["accImbMonth_east"]) : ''}

                    </td>
                )}

                {/* "accImbMonth_west" */}
                {columnVisibility.west_acc_imb_month_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["accImbMonth_west"]) : ''} */}
                        {row["accImbMonth_west"] !== null && row["accImbMonth_west"] !== undefined ? formatNumberFourDecimalNom(row["accImbMonth_west"]) : ''}

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
                    <td className={`${!columnVisibility.west_acc_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right  ${getValidationColorClass(row["validation_accImb_east"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["accImb_east"]) : ''} */}
                        {row["accImb_east"] !== null && row["accImb_east"] !== undefined ? formatNumberFourDecimalNom(row["accImb_east"]) : ''}

                    </td>
                )}

                {/* "accImb_west" */}
                {columnVisibility.west_acc_imb_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_west"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["accImb_west"]) : ''} */}
                        {row["accImb_west"] !== null && row["accImb_west"] !== undefined ? formatNumberFourDecimalNom(row["accImb_west"]) : ''}
                    </td>
                )}


                {/* "minInventory_east" */}
                {columnVisibility.east_min_inventory_mmbtud && (
                    <td className={`${!columnVisibility.west_min_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["minInventory_east"]) : ''} */}
                        {row["minInventory_east"] !== null && row["minInventory_east"] !== undefined ? formatNumberFourDecimalNom(row["minInventory_east"]) : ''}
                    </td>
                )}

                {/* "minInventory_west" */}
                {columnVisibility.west_min_inventory_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row ? formatNumberFourDecimal(row["minInventory_west"]) : ''} */}
                        {row["minInventory_west"] !== null && row["minInventory_west"] !== undefined ? formatNumberFourDecimalNom(row["minInventory_west"]) : ''}
                    </td>
                )}
            </>)}



            {/* UNDER Detail Pane */}
            {columnVisibility.detail_pane && (
                <>
                    {/* "detail_entry_east_gsp" */}
                    {columnVisibility.gsp && (
                        <td className={`${!columnVisibility.others_east && !columnVisibility.lng && !columnVisibility.bypass_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east_gsp"]) : ''} */}
                            {row["detail_entry_east_gsp"] !== null && row["detail_entry_east_gsp"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east_gsp"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_east_bypassGas" */}
                    {columnVisibility.bypass_gas && (
                        <td className={`${!columnVisibility.others_east && !columnVisibility.lng && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east_bypassGas"]) : ''} */}
                            {row["detail_entry_east_bypassGas"] !== null && row["detail_entry_east_bypassGas"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east_bypassGas"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_east_lng" */}
                    {columnVisibility.lng && (
                        <td className={`${!columnVisibility.others_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east_lng"]) : ''} */}
                            {row["detail_entry_east_lng"] !== null && row["detail_entry_east_lng"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east_lng"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_east_others" */}
                    {columnVisibility.others_east && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(row, 'detail_entry_east_', ['gsp', 'bypassGas', 'lng', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_entry_west_yadana" */}
                    {columnVisibility.ydn && (
                        <td className={`${!columnVisibility.others_west && !columnVisibility.ztk &&  !columnVisibility.ytg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_west_yadana"]) : ''} */}
                            {row["detail_entry_west_yadana"] !== null && row["detail_entry_west_yadana"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_west_yadana"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_west_yetagun" */}
                    {columnVisibility.ytg && (
                        <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_west_yetagun"]) : ''} */}
                            {row["detail_entry_west_yetagun"] !== null && row["detail_entry_west_yetagun"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_west_yetagun"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_west_zawtika" */}
                    {columnVisibility.ztk && (
                        <td className={`${!columnVisibility.others_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_west_zawtika"]) : ''} */}
                            {row["detail_entry_west_zawtika"] !== null && row["detail_entry_west_zawtika"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_west_zawtika"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_west_others" */}
                    {columnVisibility.others_west && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(row, 'detail_entry_west_', ['zawtika', 'yetagun', 'yadana', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6East" */}
                    {columnVisibility.ra6_east && (
                        <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && !columnVisibility.ra6_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east-west_ra6East"]) : ''} */}
                            {row["detail_entry_east-west_ra6East"] !== null && row["detail_entry_east-west_ra6East"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east-west_ra6East"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6West" */}
                    {columnVisibility.ra6_west && (
                        <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east-west_ra6West"]) : ''} */}
                            {row["detail_entry_east-west_ra6West"] !== null && row["detail_entry_east-west_ra6West"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east-west_ra6West"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10East" */}
                    {columnVisibility.bvw10_east && (
                        <td className={`${!columnVisibility.bvw10_West && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east-west_bvw10East"]) : ''} */}
                            {row["detail_entry_east-west_bvw10East"] !== null && row["detail_entry_east-west_bvw10East"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east-west_bvw10East"]) : ''}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10West" */}
                    {columnVisibility.bvw10_West && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_entry_east-west_bvw10West"]) : ''} */}
                            {row["detail_entry_east-west_bvw10West"] !== null && row["detail_entry_east-west_bvw10West"] !== undefined ? formatNumberFourDecimalNom(row["detail_entry_east-west_bvw10West"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_east_egat" */}
                    {columnVisibility.egat && (
                        <td className={`${!columnVisibility.others_east_exit && !columnVisibility.ipp && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_east_egat"]) : ''} */}
                            {row["detail_exit_east_egat"] !== null && row["detail_exit_east_egat"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_east_egat"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_east_ipp" */}
                    {columnVisibility.ipp && (
                        <td className={`${!columnVisibility.others_east_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_east_ipp"]) : ''} */}
                            {row["detail_exit_east_ipp"] !== null && row["detail_exit_east_ipp"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_east_ipp"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_east_others" */}
                    {columnVisibility.others_east_exit && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(row, 'detail_exit_east_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_west_egat" */}
                    {columnVisibility.egat_west && (
                        <td className={`${!columnVisibility.others_west_exit && !columnVisibility.ipp_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_west_egat"]) : ''} */}
                            {row["detail_exit_west_egat"] !== null && row["detail_exit_west_egat"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_west_egat"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_west_ipp" */}
                    {columnVisibility.ipp_west && (
                        <td className={`${!columnVisibility.others_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_west_ipp"]) : ''} */}
                            {row["detail_exit_west_ipp"] !== null && row["detail_exit_west_ipp"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_west_ipp"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_west_others" */}
                    {columnVisibility.others_west_exit && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(row, 'detail_exit_west_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_east-west_egat" */}
                    {columnVisibility.egat_east_west && (
                        <td className={`${!columnVisibility.others_east_west_exit && !columnVisibility.ipp_east_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row?.totalAll ? formatNumberFourDecimal(row?.totalAll["detail_exit_east-west_egat"]) : ''} */}
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_east-west_egat"]) : ''} */}
                            {row["detail_exit_east-west_egat"] !== null && row["detail_exit_east-west_egat"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_east-west_egat"]) : ''}

                        </td>
                    )}

                    {/* "detail_exit_east-west_ipp" */}
                    {columnVisibility.ipp_east_west && (
                        <td className={`${!columnVisibility.others_east_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_east-west_ipp"]) : ''} */}
                            {row["detail_exit_east-west_ipp"] !== null && row["detail_exit_east-west_ipp"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_east-west_ipp"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_east-west_others" */}
                    {columnVisibility.others_east_west_exit && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimal(sumDetail(row, 'detail_exit_east-west_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_east_F2andG" */}
                    {columnVisibility.east_f2andg && (
                        <td className={`${!columnVisibility.west_f2andg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_east_F2andG"]) : ''} */}
                            {row["detail_exit_east_F2andG"] !== null && row["detail_exit_east_F2andG"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_east_F2andG"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_west_F2andG" */}
                    {columnVisibility.west_f2andg && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_west_F2andG"]) : ''} */}
                            {row["detail_exit_west_F2andG"] !== null && row["detail_exit_west_F2andG"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_west_F2andG"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_E_east" */}
                    {columnVisibility.east_e && (
                        <td className={`${!columnVisibility.west_e && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_E_east"]) : ''} */}
                            {row["detail_exit_E_east"] !== null && row["detail_exit_E_east"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_E_east"]) : ''}
                        </td>
                    )}

                    {/* "detail_exit_E_west" */}
                    {columnVisibility.west_e && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {/* {row ? formatNumberFourDecimal(row["detail_exit_E_west"]) : ''} */}
                            {row["detail_exit_E_west"] !== null && row["detail_exit_E_west"] !== undefined ? formatNumberFourDecimalNom(row["detail_exit_E_west"]) : ''}
                        </td>
                    )}
                </>)}

        </tr>
    );
};

export const ContractRowYellow = React.memo(
    ContractRowYellowBase,
    // areEqual  // (optional) comparator
);