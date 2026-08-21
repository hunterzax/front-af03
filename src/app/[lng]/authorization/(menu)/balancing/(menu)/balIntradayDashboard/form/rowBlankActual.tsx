import { table_row_style } from "@/utils/styles"


const RowBlankActual = (columnVisibility?: any, row?: any) => {


    return (
        <tr
            key={row?.id}
            className={`${table_row_style}`}
        >

            {columnVisibility?.time && (<>
                <td className={`px-2 py-1 text-[#464255] text-center`} rowSpan={1} >
                    {''}
                </td>

                <td className={`px-2 py-1 text-[#464255] bg-[#EAF5F9]`}>
                    {''}
                </td>
            </>
            )}

            {/* under ENTRY mmbtu */}
            {columnVisibility?.entry_mmbtu && columnVisibility?.east_total_entry_mmbtud && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.entry_mmbtu && columnVisibility?.west_total_entry_mmbtud && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.entry_mmbtu && columnVisibility?.east_west_total_entry_mmbtud && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* under EXIT mmbtu */}
            {columnVisibility?.exit_mmbtu && columnVisibility?.east_total_exit_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.exit_mmbtu && columnVisibility?.west_total_exit_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.exit_mmbtu && columnVisibility?.east_west_total_exit_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER Balancing Gas */}
            {columnVisibility?.balancing_gas && columnVisibility?.east_total_balancing_gas && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.balancing_gas && columnVisibility?.west_total_balancing_gas && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.balancing_gas && columnVisibility?.east_west_total_balancing_gas && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER Park/Unpark */}
            {columnVisibility?.park_unpark && columnVisibility?.east_total_park_unpark && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.park_unpark && columnVisibility?.west_total_park_unpark && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER RA#6 */}
            {columnVisibility?.ra6 && columnVisibility?.ra6_ratio && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER BVW#10 */}
            {columnVisibility?.bvw10 && columnVisibility?.bvw10_ratio && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER Shrinkage Gas & Others */}
            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.east_total_shrinkage_gas_and_other && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.west_total_shrinkage_gas_and_other && (
                <td className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`} >
                    {''}
                </td>
            )}

            {columnVisibility?.shrinkage_gas_and_other && columnVisibility?.east_west_total_shrinkage_gas_and_other && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER Change Min. Inventory */}
            {columnVisibility?.change_min_inventory && columnVisibility?.east_total_change_min_inventory && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.change_min_inventory && columnVisibility?.west_total_change_min_inventory && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.change_min_inventory && columnVisibility?.east_west_total_change_min_inventory && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER Imbalance */}
            {columnVisibility?.imbalance && columnVisibility?.east_total_imbalance && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.imbalance && columnVisibility?.west_total_imbalance && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}


            {/* UNDER Acc. Imbalance (Meter) (MMBTU) */}
            {columnVisibility?.acc_imbalance_meter_mmbtu && columnVisibility?.east_total_acc_imbalance_meter_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.acc_imbalance_meter_mmbtu && columnVisibility?.west_total_acc_imbalance_meter_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}


            {/* UNDER Acc. Imbalance (Inventory) (MMBTU) */}
            {columnVisibility?.acc_imbalance_inventory_mmbtu && columnVisibility?.east_total_acc_imbalance_inventory_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right`}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.acc_imbalance_inventory_mmbtu && columnVisibility?.west_total_acc_imbalance_inventory_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}


            {/* UNDER Total Imbalance */}
            {columnVisibility?.total_imbalance && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER Percent Total Imbalance */}
            {columnVisibility?.percent_total_imbalance && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}


            {/* UNDER System Level (East) */}
            {columnVisibility?.system_level_east && columnVisibility?.level_system_level_east && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.system_level_east && columnVisibility?.percent_system_level_east && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER Order (East)  */}
            {columnVisibility?.order_east && columnVisibility?.order_east_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.order_east && columnVisibility?.order_east_mmscf && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER System Level (West) */}
            {columnVisibility?.system_level_west && columnVisibility?.level_system_level_west && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.system_level_west && columnVisibility?.percent_system_level_west && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER Order (West) */}
            {columnVisibility?.order_west && columnVisibility?.order_west_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {columnVisibility?.order_west && columnVisibility?.order_west_mmscf && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* Condition EAST */}
            {columnVisibility?.condition_east && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

            {/* Condition WEST */}
            {columnVisibility?.condition_west && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right bg-[#EAF5F9]`}
                >
                    {''}
                </td>
            )}

        </tr>
    )
}

export default RowBlankActual