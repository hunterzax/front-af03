import { table_row_style } from "@/utils/styles"

const RowBlankPlan = (columnVisibility?: any, row?: any) => {

    const col_visibility = columnVisibility?.columnVisibility
    const row_data = columnVisibility?.row

    return (
        <tr
            key={row?.id}
            className={`${table_row_style}`}
        >

            {col_visibility?.time && (<>
                <td className={`px-2 py-1 text-[#464255] text-center sticky left-0 bg-[#ffffff] z-[5]`} rowSpan={2}>
                    {row_data?.gas_hour ? row_data?.gas_hour : ''}
                </td>

                <td className={`px-2 py-1 text-[#464255] sticky left-14 bg-[#ffffff] z-[5]`}>
                    {/* {'Plan'} */}
                </td>
            </>
            )}

            {/* under ENTRY mmbtu */}
            {col_visibility?.entry_mmbtu && col_visibility?.east_total_entry_mmbtud && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.entry_mmbtu && col_visibility?.west_total_entry_mmbtud && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.entry_mmbtu && col_visibility?.east_west_total_entry_mmbtud && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {/* under EXIT mmbtu */}
            {col_visibility?.exit_mmbtu && col_visibility?.east_total_exit_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.exit_mmbtu && col_visibility?.west_total_exit_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.exit_mmbtu && col_visibility?.east_west_total_exit_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Balancing Gas */}
            {col_visibility?.balancing_gas && col_visibility?.east_total_balancing_gas && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.balancing_gas && col_visibility?.west_total_balancing_gas && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.balancing_gas && col_visibility?.east_west_total_balancing_gas && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Park/Unpark */}
            {col_visibility?.park_unpark && col_visibility?.east_total_park_unpark && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.park_unpark && col_visibility?.west_total_park_unpark && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER RA#6 */}
            {col_visibility?.ra6 && col_visibility?.ra6_ratio && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER BVW#10 */}
            {col_visibility?.bvw10 && col_visibility?.bvw10_ratio && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Shrinkage Gas & Others */}
            {col_visibility?.shrinkage_gas_and_other && col_visibility?.east_total_shrinkage_gas_and_other && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.shrinkage_gas_and_other && col_visibility?.west_total_shrinkage_gas_and_other && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.shrinkage_gas_and_other && col_visibility?.east_west_total_shrinkage_gas_and_other && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Change Min. Inventory */}
            {col_visibility?.change_min_inventory && col_visibility?.east_total_change_min_inventory && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.change_min_inventory && col_visibility?.west_total_change_min_inventory && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.change_min_inventory && col_visibility?.east_west_total_change_min_inventory && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Imbalance */}
            {col_visibility?.imbalance && col_visibility?.east_total_imbalance && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.imbalance && col_visibility?.west_total_imbalance && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Acc. Imbalance (Meter) (MMBTU) */}
            {col_visibility?.acc_imbalance_meter_mmbtu && col_visibility?.east_total_acc_imbalance_meter_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.acc_imbalance_meter_mmbtu && col_visibility?.west_total_acc_imbalance_meter_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Acc. Imbalance (Inventory) (MMBTU) */}
            {col_visibility?.acc_imbalance_inventory_mmbtu && col_visibility?.east_total_acc_imbalance_inventory_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {col_visibility?.acc_imbalance_inventory_mmbtu && col_visibility?.west_total_acc_imbalance_inventory_mmbtu && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER Total Imbalance */}
            {col_visibility?.total_imbalance && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {/* UNDER Percent Total Imbalance */}
            {col_visibility?.percent_total_imbalance && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}


            {/* UNDER System Level (East) */}
            {col_visibility?.system_level_east && col_visibility?.level_system_level_east && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {col_visibility?.system_level_east && col_visibility?.percent_system_level_east && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER Order (East)  */}
            {col_visibility?.order_east && col_visibility?.order_east_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {col_visibility?.order_east && col_visibility?.order_east_mmscf && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER System Level (West) */}
            {col_visibility?.system_level_west && col_visibility?.level_system_level_west && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {col_visibility?.system_level_west && col_visibility?.percent_system_level_west && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* UNDER Order (West) */}
            {col_visibility?.order_west && col_visibility?.order_west_mmbtu && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {col_visibility?.order_west && col_visibility?.order_west_mmscf && (
                <td
                    className={`px-2 py-1 text-[#464255] text-right `}
                >
                    {''}
                </td>
            )}

            {/* Condition EAST */}
            {col_visibility?.condition_east && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}

            {/* Condition WEST */}
            {col_visibility?.condition_west && (
                <td className={`px-2 py-1 text-[#464255] text-right`}>
                    {''}
                </td>
            )}
        </tr>
    )
}

export default RowBlankPlan