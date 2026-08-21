import { formatNumberFourDecimal, formatNumberFourDecimalNom, toDayjs, toNumber } from "@/utils/generalFormatter";

interface ContractRowProps {
    row: any;
    shipperItem: any;
    contract?: any;
    shipperGroupData?: any;
    columnVisibility?: any;
    cIdx: number;
    index: number;
    table_row_style?: string;
}

export const ContractRowBlue = ({
    row,
    shipperItem,
    contract,
    shipperGroupData,
    columnVisibility,
    cIdx,
    index,
    table_row_style = "",
}: ContractRowProps) => {

    // Helper function to sum all tags except excluded ones
    // const sumDetail = (values: any[], startWithTag: string, excludedTags: string[]) => {
    //     if (!values || !Array.isArray(values)) return null;

    //     return values
    //         .filter((item: any) => {
    //             const tag = item?.tag;
    //             return tag &&
    //                 tag.startsWith(startWithTag) &&
    //                 !excludedTags.includes(tag.replace(startWithTag, ''));
    //         })
    //         .reduce((sum: number, item: any) => {
    //             const value = toNumber(item?.value ?? '');
    //             if (value !== null) {
    //                 if(sum !== null){
    //                     return sum + value;
    //                 } else {
    //                     return value;
    //                 }
    //             }
    //         }, null);
    // };

      const sumDetail = (
        values: any[],
        startWithTag: string,
        excludedTags: string[]
      ) => {
        if (!Array.isArray(values)) return null;
    
        const sum = values
          .filter((item: any) => {
            const tag = item?.tag;
            return (
              tag &&
              tag.startsWith(startWithTag) &&
              !excludedTags.includes(tag.replace(startWithTag, ""))
            );
          })
          .reduce((acc: number | null, item: any) => {
            const raw = item?.value;
    
            if (raw === null || raw === undefined) return acc;
    
            const num = Number(raw);
            if (isNaN(num)) return acc;
    
            return acc === null ? num : acc + num;
          }, null);
    
        // 🔥 ถ้าไม่มีค่าเลย อย่า format
        if (sum === null) return null;
    
        return formatNumberFourDecimalNom(sum);
      };

    // Helper function to get formatted value by tag
    const getFormattedValueByTag = (tag: string) => {
        const item = shipperItem?.values?.find((item: any) => item?.tag === tag);
        // return item ? formatNumberFourDecimal(item.value) : '';
        return item !== null && item !== undefined ? formatNumberFourDecimalNom(item.value) : '';
    };

    // Helper function to get formatted absolute value by tag
    const getFormattedAbsValueByTag = (tag: string) => {
        const item = shipperItem?.values?.find((item: any) => item?.tag === tag);
        // return item ? formatNumberFourDecimal(Math.abs(item.value)) : '';
        return item !== null && item !== undefined ? formatNumberFourDecimalNom(Math.abs(item.value)) : '';
    };

    let find_shipper_name = shipperGroupData?.find((item: any) => {
        let filtered = item?.id_name == shipperItem?.shipper
        return filtered
    })

    return (
        <tr
            key={`contract-${row.request_number}-${cIdx}-${index}`}
            className={`${table_row_style} !bg-[#E6F8FF]`}
        >
            {/* <td className={` py-1 pl-11 font-semibold  text-left text-[#004762] bg-[#E6F8FF]`} colSpan={3} scope="col">
                {`TOTAL : `}{find_shipper_name ? find_shipper_name?.name : shipperItem?.shipper} {`(`} {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''} {`)`}
            </td> */}

            {/* สามารถ Freeze column ถึง column ไหนได้ ซึ่งยังอยากให้เห็นข้อมูล ตรง  row total ครบอยู่ https://app.clickup.com/t/86eujrg5x */}
            {/* Show Hide/Unhide กด Hide หมด Row Total ทั้งฟ้าและเหลืองต้องหายไป https://app.clickup.com/t/86eudxy8h */}
            {columnVisibility.gas_day && (
                <td className={` py-1 pl-11 font-semibold  text-left text-[#004762] bg-[#E6F8FF] sticky left-0 z-[2]`} scope="col">
                    {`TOTAL : `}
                </td>
            )}

            {columnVisibility.shipper_name && (
                <td
                    // className={`px-2 py-1 font-semibold text-[#004762] text-left bg-[#E6F8FF] `} 
                    className={`px-2 py-1 font-semibold text-[#004762] text-left bg-[#E6F8FF] whitespace-nowrap sticky left-[120px] z-[2]  ${!columnVisibility.gas_day && '!left-[0px]'}`}
                    scope="col">
                    {find_shipper_name ? find_shipper_name?.name : shipperItem?.shipper} {`(`} {row?.gas_day ? toDayjs(row?.gas_day).format("DD/MM/YYYY") : ''} {`)`}
                </td>
            )}

            {columnVisibility.contract_code && (
                // <td className={`px-2 py-1 font-semibold text-[#004762] text-center bg-[#E6F8FF] sticky left-[301px] z-[2]`} scope="col">
                <td
                    // className={`px-2 py-1 font-semibold text-[#004762] text-center bg-[#E6F8FF] sticky left-[315px] z-[2]`} 
                    className={`px-2 py-1 font-semibold text-[#004762] text-center bg-[#E6F8FF] sticky z-[2] 
                        ${(columnVisibility?.gas_day && !columnVisibility.shipper_name) ? 'left-[120px]' // ถ้าไม่ปิด gas_day แต่ปิด shipper_name
                            : (!columnVisibility?.gas_day && columnVisibility.shipper_name) ? 'left-[216px]' // ถ้าปิด gas_day แต่ไม่ปิด shipper_name
                                : (!columnVisibility?.gas_day && !columnVisibility.shipper_name) ? 'left-0' // ถ้าปิดทั้งคู่
                                    : 'left-[352px]' // default
                        }
                    `}
                    scope="col"
                >
                </td>
            )}

            {/* UNDER Summary Pane */}
            {columnVisibility.summary_pane && (<>

                {/* "total_entry_east" */}
                {columnVisibility.east_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[0]?.value) : ''} */}
                        {getFormattedValueByTag('total_entry_east')}
                    </td>
                )}

                {/* "total_entry_west" */}
                {columnVisibility.west_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[1]?.value) : ''} */}
                        {getFormattedValueByTag('total_entry_west')}
                    </td>
                )}

                {/* "total_entry_east-west" */}
                {columnVisibility.east_west_total_entry_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[2]?.value) : ''} */}
                        {getFormattedValueByTag('total_entry_east-west')}
                    </td>
                )}

                {/* "total_exit_east" */}
                {columnVisibility.east_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[3]?.value) : ''} */}
                        {getFormattedValueByTag('total_exit_east')}
                    </td>
                )}

                {/* "total_exit_west" */}
                {columnVisibility.west_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[4]?.value) : ''} */}
                        {getFormattedValueByTag('total_exit_west')}
                    </td>
                )}

                {/* "total_exit_east-west" */}
                {columnVisibility.east_west_total_exit_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[5]?.value) : ''} */}
                        {getFormattedValueByTag('total_exit_east-west')}
                    </td>
                )}

                {/* "imbZone_east" */}
                {columnVisibility.east_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[63]?.value) : ''} */}
                        {getFormattedValueByTag('imbZone_east')}
                    </td>
                )}

                {/* "imbZone_west" */}
                {columnVisibility.west_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[64]?.value) : ''} */}
                        {getFormattedValueByTag('imbZone_west')}
                    </td>
                )}

                {/* "imbZone_total" */}
                {columnVisibility.total_imbalance_zone_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[65]?.value) : ''} */}
                        {getFormattedValueByTag('imbZone_total')}
                    </td>
                )}

                {/* "InstructedFlow_east" */}
                {columnVisibility.east_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[32]?.value) : ''} */}
                        {getFormattedValueByTag('instructedFlow_east')}
                    </td>
                )}

                {/* "InstructedFlow_west" */}
                {columnVisibility.west_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[33]?.value) : ''} */}
                        {getFormattedValueByTag('instructedFlow_west')}
                    </td>
                )}

                {/* ******************** "Instructed Flow EAST-WEST" ******************** */}
                {columnVisibility.east_west_instructed_flow_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {'no_data'} */}
                        {/* {``} */}
                        {getFormattedValueByTag('instructedFlow_east-west')}
                    </td>
                )}

                {/* "shrinkage_east" */}
                {columnVisibility.east_shrinkage_volume_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[6]?.value) : ''} */}
                        {getFormattedValueByTag('shrinkage_east')}
                    </td>
                )}

                {/* "shrinkage_west" */}
                {columnVisibility.west_shrinkage_volume_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[7]?.value) : ''} */}
                        {getFormattedValueByTag('shrinkage_west')}
                    </td>
                )}

                {/* "park_east" */}
                {columnVisibility.east_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[12]?.value) : ''} */}
                        {getFormattedValueByTag('park_east')}
                    </td>
                )}

                {/* "park_west" */}
                {columnVisibility.west_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[13]?.value) : ''} */}
                        {getFormattedValueByTag('park_west')}
                    </td>
                )}

                {/* "Unpark_east" */}
                {columnVisibility.east_unpark_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[15]?.value) : ''} */}
                        {getFormattedValueByTag('Unpark_east')}
                    </td>
                )}

                {/* "Unpark_west" */}
                {columnVisibility.west_unpark_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[16]?.value) : ''} */}
                        {getFormattedValueByTag('Unpark_west')}
                    </td>
                )}

                {/* "SodPark_east" */}
                {columnVisibility.east_sod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[20]?.value) : ''} */}
                        {getFormattedValueByTag('SodPark_east')}
                    </td>
                )}

                {/* "SodPark_west" */}
                {columnVisibility.west_sod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[21]?.value) : ''} */}
                        {getFormattedValueByTag('SodPark_west')}
                    </td>
                )}

                {/* "EodPark_east" */}
                {columnVisibility.east_eod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[23]?.value) : ''} */}
                        {getFormattedValueByTag('EodPark_east')}
                    </td>
                )}

                {/* "EodPark_west" */}
                {columnVisibility.west_eod_park_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[24]?.value) : ''} */}
                        {getFormattedValueByTag('EodPark_west')}
                    </td>
                )}

                {/* "minInventoryChange_east" */}
                {columnVisibility.east_min_inventory_change_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[9]?.value) : ''} */}
                        {getFormattedValueByTag('minInventoryChange_east')}
                    </td>
                )}

                {/* "minInventoryChange_west" */}
                {columnVisibility.west_min_inventory_change_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[10]?.value) : ''} */}
                        {getFormattedValueByTag('minInventoryChange_west')}
                    </td>
                )}

                {/* "reserveBal_east" */}
                {columnVisibility.east_reserve_bal_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[18]?.value) : ''} */}
                        {getFormattedValueByTag('reserveBal_east')}
                    </td>
                )}

                {/* "reserveBal_west" */}
                {columnVisibility.west_reserve_bal_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[19]?.value) : ''} */}
                        {getFormattedValueByTag('reserveBal_west')}
                    </td>
                )}

                {/* "adjustDailyImb_east" */}
                {columnVisibility.east_adjust_imbalance_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[66]?.value) : ''} */}
                        {getFormattedValueByTag('adjustDailyImb_east')}
                    </td>
                )}

                {/* "adjustDailyImb_west" */}
                {columnVisibility.west_adjust_imbalance_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[67]?.value) : ''} */}
                        {getFormattedValueByTag('adjustDailyImb_west')}
                    </td>
                )}

                {/* "ventGas_east" */}
                {columnVisibility.east_vent_gas && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[26]?.value) : ''} */}
                        {getFormattedValueByTag('ventGas_east')}
                    </td>
                )}

                {/* "ventGas_west" */}
                {columnVisibility.west_vent_gas && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[27]?.value) : ''} */}
                        {getFormattedValueByTag('ventGas_west')}
                    </td>
                )}

                {/* "commissioningGas_east" */}
                {columnVisibility.east_commissioning_gas && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[28]?.value) : ''} */}
                        {getFormattedValueByTag('commissioningGas_east')}
                    </td>
                )}

                {/* "commissioningGas_west" */}
                {columnVisibility.west_commissioning_gas && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[29]?.value) : ''} */}
                        {getFormattedValueByTag('commissioningGas_west')}
                    </td>
                )}

                {/* "otherGas_east" */}
                {columnVisibility.east_other_gas && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[30]?.value) : ''} */}
                        {getFormattedValueByTag('otherGas_east')}
                    </td>
                )}

                {/* "otherGas_west" */}
                {columnVisibility.west_other_gas && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[31]?.value) : ''} */}
                        {getFormattedValueByTag('otherGas_west')}
                    </td>
                )}

                {/* "dailyImb_east" */}
                {columnVisibility.east_daily_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[68]?.value) : ''} */}
                        {getFormattedValueByTag('dailyImb_east')}
                    </td>
                )}

                {/* "dailyImb_west" */}
                {columnVisibility.west_daily_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[69]?.value) : ''} */}
                        {getFormattedValueByTag('dailyImb_west')}
                    </td>
                )}

                {/* "aip" */}
                {columnVisibility.total_aip_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[72]?.value) : ''} */}
                        {getFormattedValueByTag('aip')}
                    </td>
                )}

                {/* "AIN (MMBTU/D)" */}
                {columnVisibility.total_ain_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {'no_data'} */}
                        {/* {``} */}
                        {getFormattedValueByTag('ain')}
                    </td>
                )}

                {/* "% IMB" */}
                {columnVisibility.total_percentage_imb && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {'no_data'} */}
                        {/* {``} */}
                        {getFormattedValueByTag('absimb')}
                    </td>
                )}

                {/* "absimb" */}
                {columnVisibility.total_percentage_abslmb && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[73]?.value) : ''} */}
                        {getFormattedAbsValueByTag('absimb')}
                    </td>
                )}

                {/* "accImbMonth_east" */}
                {columnVisibility.east_acc_imb_month_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[77]?.value) : ''} */}
                        {getFormattedValueByTag('accImbMonth_east')}
                    </td>
                )}

                {/* "accImbMonth_west" */}
                {columnVisibility.west_acc_imb_month_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[78]?.value) : ''} */}
                        {getFormattedValueByTag('accImbMonth_west')}
                    </td>
                )}

                {/* "accImb_east" */}
                {columnVisibility.east_acc_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[81]?.value) : ''} */}
                        {getFormattedValueByTag('accImb_east')}
                    </td>
                )}

                {/* "accImb_west" */}
                {columnVisibility.west_acc_imb_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[82]?.value) : ''} */}
                        {getFormattedValueByTag('accImb_west')}
                    </td>
                )}

                {/* "accImbInv_east" */}
                {columnVisibility.east_acc_imb_inv_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[81]?.value) : ''} */}
                        {getFormattedValueByTag('accImbInv_east')}
                    </td>
                )}

                {/* "accImbInv_west" */}
                {columnVisibility.west_acc_imb_inv_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[82]?.value) : ''} */}
                        {getFormattedValueByTag('accImbInv_west')}
                    </td>
                )}

                {/* "minInventory_east" */}
                {columnVisibility.east_min_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[74]?.value) : ''} */}
                        {getFormattedValueByTag('minInventory_east')}
                    </td>
                )}

                {/* "minInventory_west" */}
                {columnVisibility.west_min_inventory_mmbtud && (
                    <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                        {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[75]?.value) : ''} */}
                        {getFormattedValueByTag('minInventory_west')}
                    </td>
                )}

            </>)}





            {/* UNDER Detail Pane */}
            {columnVisibility.detail_pane && (
                <>

                    {/* "detail_entry_east_gsp" */}
                    {columnVisibility.gsp && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[34]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east_gsp')}
                        </td>
                    )}

                    {/* "detail_entry_east_bypassGas" */}
                    {columnVisibility.bypass_gas && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[35]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east_bypassGas')}
                        </td>
                    )}

                    {/* "detail_entry_east_lng" */}
                    {columnVisibility.lng && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[36]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east_lng')}
                        </td>
                    )}

                    {/* "detail_entry_east_others" */}
                    {columnVisibility.others_east && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {`no_data`} */}
                            {(sumDetail(shipperItem?.values, 'detail_entry_east_', ['gsp', 'bypassGas', 'lng', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_entry_west_yadana" */}
                    {columnVisibility.ydn && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[37]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_west_yadana')}
                        </td>
                    )}

                    {/* "detail_entry_west_yetagun" */}
                    {columnVisibility.ytg && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[38]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_west_yetagun')}
                        </td>
                    )}

                    {/* "detail_entry_west_zawtika" */}
                    {columnVisibility.ztk && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[39]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_west_zawtika')}
                        </td>
                    )}

                    {/* "detail_entry_west_others" */}
                    {columnVisibility.others_west && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {`no_data`} */}
                            {(sumDetail(shipperItem?.values, 'detail_entry_west_', ['yadana', 'yetagun', 'zawtika', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6East" */}
                    {columnVisibility.ra6_east && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[40]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east-west_ra6East')}
                        </td>
                    )}

                    {/* "detail_entry_east-west_ra6West" */}
                    {columnVisibility.ra6_west && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[41]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east-west_ra6West')}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10East" */}
                    {columnVisibility.bvw10_east && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[42]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east-west_bvw10East')}
                        </td>
                    )}

                    {/* "detail_entry_east-west_bvw10West" */}
                    {columnVisibility.bvw10_West && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[43]?.value) : ''} */}
                            {getFormattedValueByTag('detail_entry_east-west_bvw10West')}
                        </td>
                    )}

                    {/* "detail_exit_east_egat" */}
                    {columnVisibility.egat && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[44]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_east_egat')}
                        </td>
                    )}

                    {/* "detail_exit_east_ipp" */}
                    {columnVisibility.ipp && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[45]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_east_ipp')}
                        </td>
                    )}

                    {/* "detail_exit_east_others" */}
                    {columnVisibility.others_east_exit && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {`no_data`} */}
                            {(sumDetail(shipperItem?.values, 'detail_exit_east_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_west_egat" */}
                    {columnVisibility.egat_west && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[49]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_west_egat')}
                        </td>
                    )}

                    {/* "detail_exit_west_ipp" */}
                    {columnVisibility.ipp_west && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[50]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_west_ipp')}
                        </td>
                    )}

                    {/* "detail_exit_west_others" */}
                    {columnVisibility.others_west_exit && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {`no_data`} */}
                            {(sumDetail(shipperItem?.values, 'detail_exit_west_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_east-west_egat" */}
                    {columnVisibility.egat_east_west && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[54]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_east-west_egat')}
                        </td>
                    )}

                    {/* "detail_exit_east-west_ipp" */}
                    {columnVisibility.ipp_east_west && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[55]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_east-west_ipp')}
                        </td>
                    )}

                    {/* "detail_exit_east-west_others" */}
                    {columnVisibility.others_east_west_exit && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {`no_data`} */}
                            {(sumDetail(shipperItem?.values, 'detail_exit_east-west_', ['egat', 'ipp', 'F2andG']))}
                        </td>
                    )}

                    {/* "detail_exit_east_F2andG" */}
                    {columnVisibility.east_f2andg && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[59]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_east_F2andG')}
                        </td>
                    )}

                    {/* "detail_exit_west_F2andG" */}
                    {columnVisibility.west_f2andg && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[60]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_west_F2andG')}
                        </td>
                    )}

                    {/* "detail_exit_E_east" */}
                    {columnVisibility.east_e && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[61]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_E_east')}
                        </td>
                    )}

                    {/* "detail_exit_E_west" */}
                    {columnVisibility.west_e && (
                        <td className={`px-2 py-1 font-semibold text-right text-[#004762] bg-[#E6F8FF]`} scope="col">
                            {/* {shipperItem?.values ? formatNumberFourDecimal(shipperItem?.values?.[62]?.value) : ''} */}
                            {getFormattedValueByTag('detail_exit_E_west')}
                        </td>
                    )}


                </>)}
        </tr>
    );
};
