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

            {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] font-semibold  text-right text-[#004762] bg-[#FFEAA033]`} colSpan={1} scope="col">{``}</td>
            )}

            {columnVisibility.gas_day && (
                <td className={` border-r-[#c0c0c0] border-r-[1px] whitespace-nowrap text-right  py-1 pl-1 font-semibold text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? `TOTAL ALL : ${row?.gas_day_2}` : 'TOTAL ALL :'}
                </td>
            )}
            {columnVisibility.gas_hour && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-center text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? row?.gas_hour : ''}
                </td>
            )}
            {columnVisibility.timestamp && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? row?.timestamp : ''}
                </td>
            )}
            {columnVisibility.shipper_name && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {row ? row?.shipper_name : ''}
                </td>
            )}

            {/* <td className={`px-2 py-1 font-semibold text-[#5A4600] text-center bg-[#FFEAA033]`} colSpan={3} scope="col"></td> */}

            {columnVisibility.plan_actual && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {type == 'planning' ? 'NOMINATION' : 'TOTAL'}
                </td>
            )}

            {columnVisibility.contract_code && (
                <td className={` border-r-[#c0c0c0] border-r-[1px]  py-1 pl-1 font-semibold  text-left text-[#5A4600] bg-[#FFEAA033]`} colSpan={1} scope="col">
                    {''}
                </td>
            )}


            {/* UNDER Summary Pane */}
            {columnVisibility.summary_pane && (<>

                {/* "total_entry_east" */}
                {columnVisibility.east_total_entry_mmbtud && (
                    <td className={`${!columnVisibility.west_total_entry_mmbtud && !columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row?.total_entry_east)}
                    </td>
                )}

                {/* "total_entry_west" */}
                {columnVisibility.west_total_entry_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row?.total_entry_west)}
                    </td>
                )}

                {/* "total_entry_east-west" */}
                {columnVisibility.east_west_total_entry_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_entry_east-west"])}
                    </td>
                )}

                {/* "total_exit_east" */}
                {columnVisibility.east_total_exit_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_exit_mmbtud && !columnVisibility.west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_exit_east"])}
                    </td>
                )}

                {/* "total_exit_west" */}
                {columnVisibility.west_total_exit_mmbtud && (
                    <td className={`${!columnVisibility.east_west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_exit_west"])}
                    </td>
                )}

                {/* "total_exit_east-west" */}
                {columnVisibility.east_west_total_exit_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["total_exit_east-west"])}
                    </td>
                )}

                {/* "imbZone_east" */}
                {columnVisibility.east_imbalance_zone_mmbtud && (
                    <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && !columnVisibility.west_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["imbZone_east"])}
                    </td>
                )}

                {/* "imbZone_west" */}
                {columnVisibility.west_imbalance_zone_mmbtud && (
                    <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["imbZone_west"])}
                    </td>
                )}

                {/* "imbZone_total" */}
                {columnVisibility.total_imbalance_zone_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["imbZone_total"])}
                    </td>
                )}

                {/* "InstructedFlow_east" */}
                {columnVisibility.east_instructed_flow_mmbtud && (
                    <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && !columnVisibility.west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["instructedFlow_east"])}
                    </td>
                )}

                {/* "InstructedFlow_west" */}
                {columnVisibility.west_instructed_flow_mmbtud && (
                    <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
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
                        {formatNumberFourDecimalNom(row["shrinkage_east"])}
                    </td>
                )}

                {/* "shrinkage_west" */}
                {columnVisibility.west_shrinkage_volume_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["shrinkage_west"])}
                    </td>
                )}

                {/* "park_east" */}
                {columnVisibility.east_park_mmbtud && (
                    <td className={`${!columnVisibility.west_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["park_east"])}
                    </td>
                )}

                {/* "park_west" */}
                {columnVisibility.west_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["park_west"])}
                    </td>
                )}

                {/* "Unpark_east" */}
                {columnVisibility.east_unpark_mmbtud && (
                    <td className={`${!columnVisibility.west_unpark_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["Unpark_east"])}
                    </td>
                )}

                {/* "Unpark_west" */}
                {columnVisibility.west_unpark_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["Unpark_west"])}
                    </td>
                )}

                {/* "SodPark_east" */}
                {columnVisibility.east_sod_park_mmbtud && (
                    <td className={`${!columnVisibility.west_sod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["SodPark_east"])}
                    </td>
                )}

                {/* "SodPark_west" */}
                {columnVisibility.west_sod_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["SodPark_west"])}
                    </td>
                )}

                {/* "EodPark_east" */}
                {columnVisibility.east_eod_park_mmbtud && (
                    <td className={`${!columnVisibility.west_eod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["EodPark_east"])}
                    </td>
                )}

                {/* "EodPark_west" */}
                {columnVisibility.west_eod_park_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["EodPark_west"])}
                    </td>
                )}

                {/* "minInventoryChange_east" */}
                {columnVisibility.east_min_inventory_change_mmbtud && (
                    <td className={`${!columnVisibility.west_min_inventory_change_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventoryChange_east"])}
                    </td>
                )}

                {/* "minInventoryChange_west" */}
                {columnVisibility.west_min_inventory_change_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventoryChange_west"])}
                    </td>
                )}

                {/* "reserveBal_east" */}
                {columnVisibility.east_reserve_bal_mmbtud && (
                    <td className={`${!columnVisibility.west_reserve_bal_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["reserveBal_east"])}
                    </td>
                )}

                {/* "reserveBal_west" */}
                {columnVisibility.west_reserve_bal_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["reserveBal_west"])}
                    </td>
                )}

                {/* "adjustDailyImb_east" */}
                {columnVisibility.east_adjust_imbalance_mmbtud && (
                    <td className={`${!columnVisibility.west_adjust_imbalance_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["adjustDailyImb_east"])}
                    </td>
                )}

                {/* "adjustDailyImb_west" */}
                {columnVisibility.west_adjust_imbalance_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["adjustDailyImb_west"])}
                    </td>
                )}

                {/* "ventGas_east" */}
                {columnVisibility.east_vent_gas && (
                    <td className={`${!columnVisibility.west_vent_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["ventGas_east"])}
                    </td>
                )}

                {/* "ventGas_west" */}
                {columnVisibility.west_vent_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["ventGas_west"])}
                    </td>
                )}

                {/* "commissioningGas_east" */}
                {columnVisibility.east_commissioning_gas && (
                    <td className={`${!columnVisibility.west_commissioning_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["commissioningGas_east"])}
                    </td>
                )}

                {/* "commissioningGas_west" */}
                {columnVisibility.west_commissioning_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["commissioningGas_west"])}
                    </td>
                )}

                {/* "otherGas_east" */}
                {columnVisibility.east_other_gas && (
                    <td className={`${!columnVisibility.west_other_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["otherGas_east"])}
                    </td>
                )}

                {/* "otherGas_west" */}
                {columnVisibility.west_other_gas && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["otherGas_west"])}
                    </td>
                )}

                {/* "dailyImb_east" */}
                {columnVisibility.east_daily_imb_mmbtud && (
                    <td className={`${!columnVisibility.west_daily_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["dailyImb_east"])}
                    </td>
                )}

                {/* "dailyImb_west" */}
                {columnVisibility.west_daily_imb_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["dailyImb_west"])}
                    </td>
                )}

                {/* "aip" */}
                {columnVisibility.total_aip_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["aip"])}
                    </td>
                )}

                {/* "AIN (MMBTU/D)" */}
                {columnVisibility.total_ain_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["ain"])}
                    </td>
                )}

                {/* "% IMB" */}
                {columnVisibility.total_percentage_imb && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["absimb"])}
                    </td>
                )}

                {/* "absimb" */}
                {columnVisibility.total_percentage_abslmb && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {/* {row["absimb"] ? formatNumberFourDecimalNom(Math.abs(row["absimb"])) : ''} */}
                        {row["absimb"] !== null && row["absimb"] !== undefined && !Number.isNaN(Math.abs(row["absimb"])) ? formatNumberFourDecimalNom(Math.abs(row["absimb"])) : ""}
                        
                        {/* {row ? formatNumberFourDecimal(row["absimb"]) : ''} */}
                    </td>
                )}

                {/* "accImbMonth_east" */}
                {columnVisibility.east_acc_imb_month_mmbtud && (
                    <td className={`${!columnVisibility.west_acc_imb_month_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbMonth_east"])}
                    </td>
                )}

                {/* "accImbMonth_west" */}
                {columnVisibility.west_acc_imb_month_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbMonth_west"])}
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
                    <td className={`${!columnVisibility.west_acc_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_east"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImb_east"])}
                    </td>
                )}

                {/* "accImb_west" */}
                {columnVisibility.west_acc_imb_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImb_west"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImb_west"])}
                    </td>
                )}

                {/* "accImbInv_east" */}
                {columnVisibility.east_acc_imb_inventory_mmbtud && (
                    <td className={`${!columnVisibility.west_acc_imb_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImbInv_east"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbInv_east"])}
                    </td>
                )}

                {/* "accImbInv_west" */}
                {columnVisibility.west_acc_imb_inventory_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right ${getValidationColorClass(row["validation_accImbInv_west"]?.toLowerCase(), 'bg-[#FFEAA033]')}`} scope="col">
                        {formatNumberFourDecimalNom(row["accImbInv_west"])}
                    </td>
                )}


                {/* "minInventory_east" */}
                {columnVisibility.east_min_inventory_mmbtud && (
                    <td className={`${!columnVisibility.west_min_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventory_east"])}
                    </td>
                )}

                {/* "minInventory_west" */}
                {columnVisibility.west_min_inventory_mmbtud && (
                    <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                        {formatNumberFourDecimalNom(row["minInventory_west"])}
                    </td>
                )}

            </>)}



            {/* UNDER Detail Pane */}
            {columnVisibility.detail_pane && (
                <>
                    {/* "detail_entry_east_gsp" */}
                    {columnVisibility.gsp && (
                        <td className={`${!columnVisibility.others_east && !columnVisibility.lng && !columnVisibility.bypass_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east_gsp"])}
                        </td>
                    )}

                    {/* "detail_entry_east_bypassGas" */}
                    {columnVisibility.bypass_gas && (
                        <td className={`${!columnVisibility.others_east && !columnVisibility.lng && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east_bypassGas"])}
                        </td>
                    )}

                    {/* "detail_entry_east_lng" */}
                    {columnVisibility.lng && (
                        <td className={`${!columnVisibility.others_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east_lng"])}
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
                        <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && !columnVisibility.ytg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_west_yadana"])}
                        </td>
                    )}

                    {/* "detail_entry_west_yetagun" */}
                    {columnVisibility.ytg && (
                        <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_west_yetagun"])}
                        </td>
                    )}

                    {/* "detail_entry_west_zawtika" */}
                    {columnVisibility.ztk && (
                        <td className={`${!columnVisibility.others_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_west_zawtika"])}
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
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_ra6East"])}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6West" */}
                    {columnVisibility.ra6_west && (
                        <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_ra6West"])}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10East" */}
                    {columnVisibility.bvw10_east && (
                        <td className={`${!columnVisibility.bvw10_West && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_bvw10East"])}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10West" */}
                    {columnVisibility.bvw10_West && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_entry_east-west_bvw10West"])}
                        </td>
                    )}

                    {/* "detail_exit_east_egat" */}
                    {columnVisibility.egat && (
                        <td className={`${!columnVisibility.others_east_exit && !columnVisibility.ipp && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east_egat"])}
                        </td>
                    )}

                    {/* "detail_exit_east_ipp" */}
                    {columnVisibility.ipp && (
                        <td className={`${!columnVisibility.others_east_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east_ipp"])}
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
                            {formatNumberFourDecimalNom(row["detail_exit_west_egat"])}
                        </td>
                    )}

                    {/* "detail_exit_west_ipp" */}
                    {columnVisibility.ipp_west && (
                        <td className={`${!columnVisibility.others_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_west_ipp"])}
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
                            {formatNumberFourDecimalNom(row["detail_exit_east-west_egat"])}
                        </td>
                    )}

                    {/* "detail_exit_east-west_ipp" */}
                    {columnVisibility.ipp_east_west && (
                        <td className={`${!columnVisibility.others_east_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_east-west_ipp"])}
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
                            {formatNumberFourDecimalNom(row["detail_exit_east_F2andG"])}
                        </td>
                    )}

                    {/* "detail_exit_west_F2andG" */}
                    {columnVisibility.west_f2andg && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_west_F2andG"])}
                        </td>
                    )}

                    {/* "detail_exit_E_east" */}
                    {columnVisibility.east_e && (
                        <td className={`west_epx-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_E_east"])}
                        </td>
                    )}

                    {/* "detail_exit_E_west" */}
                    {columnVisibility.west_e && (
                        <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right bg-[#FFEAA033]`} scope="col">
                            {formatNumberFourDecimalNom(row["detail_exit_E_west"])}
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