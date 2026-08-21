import { formatGasHour, formatNumberFourDecimal, formatNumberFourDecimalNom, sumDetail } from "@/utils/generalFormatter";
import getUserValue from "@/utils/getuserValue";
import { postService } from "@/utils/postService";
import React from "react";

interface ContractRowProps {
  row: any;
  shipperItem: any;
  contract: any;
  type?: any;
  shipperGroupData?: any;
  columnVisibility?: any;
  setCheckPublic?: any;
  cIdx: number;
  index: number;
  table_row_style?: string;
}

export const ContractRowWhiteBase = ({
  row,
  shipperItem,
  contract,
  shipperGroupData,
  type,
  columnVisibility,
  setCheckPublic,
  cIdx,
  index,
  table_row_style = "",
}: ContractRowProps) => {

  const userDT: any = getUserValue();

  // let find_shipper_name = shipperGroupData?.find((item: any) => {
  //   let filtered = item?.id_name == shipperItem?.shipper
  //   return filtered
  // })

  //   const handleSelectRow = (id: any) => {
  //      
  //     // ส่งตัวเดียว
  //     const find_ = sortedData.find((role: any) => role.id === id);
  //     postPublicationCenter(find_)
  //     setMakeFetch(true)

  //     const existingRole = selectedRoles.find((role: any) => role.id === id);
  //     if (existingRole) {
  //         // Deselect the role
  //         setSelectedRoles(selectedRoles.filter((role: any) => role.id !== id));
  //     } else {
  //         // Select the role
  //         setSelectedRoles([...selectedRoles, { id }]);
  //     }
  // };

  const postPublicationCenter = async (data: any) => {
    // master/allocation/publication-center
    const body_post = {
      "execute_timestamp": data?.execute_timestamp,
      "gas_day": data?.gas_day,
      "gas_hour": data?.gas_hour
    }
    const res_ = await postService('/master/allocation/publication-center', body_post);
    setCheckPublic(true)
  }

  return (
    <tr
      key={`contract-${row?.request_number}-${cIdx}-${index}`}
      className={table_row_style}
    >

      {columnVisibility.publicate && userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4 && (
        <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] text-center" colSpan={1}>

          <input
            type="checkbox"
            checked={contract?.publication}
            // disabled={row.query_shipper_nomination_status_id !== 1}
            // onChange={() => handleSelectRow(row)}
            onChange={() => {
              if (contract?.execute_timestamp && contract?.gas_day_text && contract?.gas_hour_num) {
                postPublicationCenter({
                  "execute_timestamp": contract?.execute_timestamp,
                  "gas_day": contract?.gas_day_text,
                  "gas_hour": contract?.gas_hour_num
                })
              }
              else {
                postPublicationCenter(row)
              }
            }}
            // className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1]"
            className="form-checkbox w-5 h-5 border rounded-[8px] accent-[#1473A1] focus:ring-[#1473A1] disabled:opacity-100 disabled:cursor-not-allowed "
          />
        </td>
      )}

      {columnVisibility.gas_day && (
        <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] text-center" colSpan={1}>
          {contract?.gas_day ? contract?.gas_day : ""}
        </td>
      )}

      {columnVisibility.gas_hour && (
        <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] text-center" colSpan={1}>
          {/* {contract?.gas_hour ? contract?.gas_hour : ""} */}
          {contract?.gas_hour ? formatGasHour(contract?.gas_hour) : ""}

          {/* 
            format เวลาควรเป็น HH:mm ถ้ามันมี 0 เกินมาข้างหน้าตัดออกให้หน่อย
            gas_hour = "010:00" 
          */}
        </td>
      )}

      {columnVisibility.timestamp && (
        <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] text-center" colSpan={1}>
          {contract?.timestamp ? contract?.timestamp : ""}
          {/* {contract?.timestamp ? contract?.gas_day + ' ' + contract?.gas_hour : ""} */}
        </td>
      )}

      {/* UNDER Summary Pane */}
      {columnVisibility.summary_pane && (<>

        {columnVisibility.shipper_name && (
          <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] " colSpan={1}>
            {contract?.shipper_name ? contract?.shipper_name : ''}
            {/* {find_shipper_name ? find_shipper_name : ''} */}
          </td>
        )}

        {columnVisibility.plan_actual && (
          <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] " colSpan={1}>
            {/* {type == 'planning' ? 'Planning (Nomination)' : 'Actual (Metering)'} */}
            {/* เอาวงเล็บหลังชื่อ Planning / Actual ออก https://app.clickup.com/t/86eujrg4m */}
            {type == 'planning' ? 'Planning' : 'Actual'}
          </td>
        )}

        {columnVisibility.contract_code && (
          <td className=" border-r-[#c0c0c0] border-r-[1px] px-2 py-1 text-[#5A4600] text-center" colSpan={1}>
            {contract?.contract || ""}
          </td>
        )}

        {/* "total_entry_east" */}
        {columnVisibility.east_total_entry_mmbtud && (
          <td className={`${!columnVisibility.west_total_entry_mmbtud && !columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract?.total_entry_east !== null && contract?.total_entry_east !== undefined ? formatNumberFourDecimalNom(contract?.total_entry_east) : ''}
          </td>
        )}

        {/* "total_entry_west" */}
        {columnVisibility.west_total_entry_mmbtud && (
          <td className={`${!columnVisibility.east_west_total_entry_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract?.total_entry_west !== null && contract?.total_entry_west !== undefined ? formatNumberFourDecimalNom(contract?.total_entry_west) : ''}
          </td>
        )}

        {/* "total_entry_east-west" */}
        {columnVisibility.east_west_total_entry_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["total_entry_east-west"] !== null && contract["total_entry_east-west"] !== undefined ? formatNumberFourDecimalNom(contract["total_entry_east-west"]) : ''}
          </td>
        )}

        {/* "total_exit_east" */}
        {columnVisibility.east_total_exit_mmbtud && (
          <td className={`${!columnVisibility.east_west_total_exit_mmbtud && !columnVisibility.west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["total_exit_east"] !== null && contract["total_exit_east"] !== undefined ? formatNumberFourDecimalNom(contract["total_exit_east"]) : ''}
          </td>
        )}

        {/* "total_exit_west" */}
        {columnVisibility.west_total_exit_mmbtud && (
          <td className={`${!columnVisibility.east_west_total_exit_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["total_exit_west"] !== null && contract["total_exit_west"] !== undefined ? formatNumberFourDecimalNom(contract["total_exit_west"]) : ''}
          </td>
        )}

        {/* "total_exit_east-west" */}
        {columnVisibility.east_west_total_exit_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["total_exit_east-west"])}
          </td>
        )}

        {/* "imbZone_east" */}
        {columnVisibility.east_imbalance_zone_mmbtud && (
          <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && !columnVisibility.west_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["imbZone_east"])}
          </td>
        )}

        {/* "imbZone_west" */}
        {columnVisibility.west_imbalance_zone_mmbtud && (
          <td className={`${!columnVisibility.total_imbalance_zone_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["imbZone_west"])}
          </td>
        )}

        {/* "imbZone_total" */}
        {columnVisibility.total_imbalance_zone_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["imbZone_total"])}
          </td>
        )}

        {/* "InstructedFlow_east" */}
        {columnVisibility.east_instructed_flow_mmbtud && (
          <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && !columnVisibility.west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["instructedFlow_east"])}
          </td>
        )}

        {/* "InstructedFlow_west" */}
        {columnVisibility.west_instructed_flow_mmbtud && (
          <td className={`${!columnVisibility.east_west_instructed_flow_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["instructedFlow_west"])}
          </td>
        )}

        {/* ******************** "Instructed Flow EAST-WEST" ******************** */}
        {columnVisibility.east_west_instructed_flow_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["instructedFlow_east-west"])}
          </td>
        )}

        {/* "shrinkage_east" */}
        {columnVisibility.east_shrinkage_volume_mmbtud && (
          <td className={`${!columnVisibility.west_shrinkage_volume_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["shrinkage_east"] !== null && contract["shrinkage_east"] !== undefined ? formatNumberFourDecimalNom(contract["shrinkage_east"]) : ''}
          </td>
        )}

        {/* "shrinkage_west" */}
        {columnVisibility.west_shrinkage_volume_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["shrinkage_west"] !== null && contract["shrinkage_west"] !== undefined ? formatNumberFourDecimalNom(contract["shrinkage_west"]) : ''}
          </td>
        )}

        {/* "park_east" */}
        {columnVisibility.east_park_mmbtud && (
          <td className={`${!columnVisibility.west_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["park_east"] !== null && contract["park_east"] !== undefined ? formatNumberFourDecimalNom(contract["park_east"]) : ''}
          </td>
        )}

        {/* "park_west" */}
        {columnVisibility.west_park_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["park_west"] !== null && contract["park_west"] !== undefined ? formatNumberFourDecimalNom(contract["park_west"]) : ''}
          </td>
        )}

        {/* "Unpark_east" */}
        {columnVisibility.east_unpark_mmbtud && (
          <td className={`${!columnVisibility.west_unpark_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["Unpark_east"] !== null && contract["Unpark_east"] !== undefined ? formatNumberFourDecimalNom(contract["Unpark_east"]) : ''}
          </td>
        )}

        {/* "Unpark_west" */}
        {columnVisibility.west_unpark_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["Unpark_west"] !== null && contract["Unpark_west"] !== undefined ? formatNumberFourDecimalNom(contract["Unpark_west"]) : ''}
          </td>
        )}

        {/* "SodPark_east" */}
        {columnVisibility.east_sod_park_mmbtud && (
          <td className={`${!columnVisibility.west_sod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["SodPark_east"] !== null && contract["SodPark_east"] !== undefined ? formatNumberFourDecimalNom(contract["SodPark_east"]) : ''}
          </td>
        )}

        {/* "SodPark_west" */}
        {columnVisibility.west_sod_park_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["SodPark_west"] !== null && contract["SodPark_west"] !== undefined ? formatNumberFourDecimalNom(contract["SodPark_west"]) : ''}
          </td>
        )}

        {/* "EodPark_east" */}
        {columnVisibility.east_eod_park_mmbtud && (
          <td className={`${!columnVisibility.west_eod_park_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["EodPark_east"] !== null && contract["EodPark_east"] !== undefined ? formatNumberFourDecimalNom(contract["EodPark_east"]) : ''}
          </td>
        )}

        {/* "EodPark_west" */}
        {columnVisibility.west_eod_park_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["EodPark_west"] !== null && contract["EodPark_west"] !== undefined ? formatNumberFourDecimalNom(contract["EodPark_west"]) : ''}
          </td>
        )}

        {/* "minInventoryChange_east" */}
        {columnVisibility.east_min_inventory_change_mmbtud && (
          <td className={`${!columnVisibility.west_min_inventory_change_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["minInventoryChange_east"] !== null && contract["minInventoryChange_east"] !== undefined ? formatNumberFourDecimalNom(contract["minInventoryChange_east"]) : ''}
          </td>
        )}

        {/* "minInventoryChange_west" */}
        {columnVisibility.west_min_inventory_change_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["minInventoryChange_west"] !== null && contract["minInventoryChange_west"] !== undefined ? formatNumberFourDecimalNom(contract["minInventoryChange_west"]) : ''}
          </td>
        )}

        {/* "reserveBal_east" */}
        {columnVisibility.east_reserve_bal_mmbtud && (
          <td className={`${!columnVisibility.west_reserve_bal_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["reserveBal_east"] !== null && contract["reserveBal_east"] !== undefined ? formatNumberFourDecimalNom(contract["reserveBal_east"]) : ''}
          </td>
        )}

        {/* "reserveBal_west" */}
        {columnVisibility.west_reserve_bal_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["reserveBal_west"] !== null && contract["reserveBal_west"] !== undefined ? formatNumberFourDecimalNom(contract["reserveBal_west"]) : ''}
          </td>
        )}

        {/* "adjustDailyImb_east" */}
        {columnVisibility.east_adjust_imbalance_mmbtud && (
          <td className={`${!columnVisibility.west_adjust_imbalance_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["adjustDailyImb_east"] !== null && contract["adjustDailyImb_east"] !== undefined ? formatNumberFourDecimalNom(contract["adjustDailyImb_east"]) : ''}
          </td>
        )}

        {/* "adjustDailyImb_west" */}
        {columnVisibility.west_adjust_imbalance_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["adjustDailyImb_west"] !== null && contract["adjustDailyImb_west"] !== undefined ? formatNumberFourDecimalNom(contract["adjustDailyImb_west"]) : ''}
          </td>
        )}

        {/* "ventGas_east" */}
        {columnVisibility.east_vent_gas && (
          <td className={`${!columnVisibility.west_vent_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["ventGas_east"] !== null && contract["ventGas_east"] !== undefined ? formatNumberFourDecimalNom(contract["ventGas_east"]) : ''}
          </td>
        )}

        {/* "ventGas_west" */}
        {columnVisibility.west_vent_gas && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["ventGas_west"] !== null && contract["ventGas_west"] !== undefined ? formatNumberFourDecimalNom(contract["ventGas_west"]) : ''}
          </td>
        )}

        {/* "commissioningGas_east" */}
        {columnVisibility.east_commissioning_gas && (
          <td className={`${!columnVisibility.west_commissioning_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["commissioningGas_east"] !== null && contract["commissioningGas_east"] !== undefined ? formatNumberFourDecimalNom(contract["commissioningGas_east"]) : ''}
          </td>
        )}

        {/* "commissioningGas_west" */}
        {columnVisibility.west_commissioning_gas && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {contract["commissioningGas_west"] !== null && contract["commissioningGas_west"] !== undefined ? formatNumberFourDecimalNom(contract["commissioningGas_west"]) : ''}
          </td>
        )}

        {/* "otherGas_east" */}
        {columnVisibility.east_other_gas && (
          <td className={`${!columnVisibility.west_other_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["otherGas_east"])}
          </td>
        )}

        {/* "otherGas_west" */}
        {columnVisibility.west_other_gas && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["otherGas_west"])}
          </td>
        )}

        {/* "dailyImb_east" */}
        {columnVisibility.east_daily_imb_mmbtud && (
          <td className={`${!columnVisibility.west_daily_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["dailyImb_east"])}
          </td>
        )}

        {/* "dailyImb_west" */}
        {columnVisibility.west_daily_imb_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["dailyImb_west"])}
          </td>
        )}

        {/* "aip" */}
        {columnVisibility.total_aip_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["aip"])}
          </td>
        )}

        {/* "AIN (MMBTU/D)" */}
        {columnVisibility.total_ain_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["ain"])}
          </td>
        )}

        {/* "% IMB" */}
        {columnVisibility.total_percentage_imb && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {/* {contract["absimb"] ? formatNumberFourDecimal(contract["absimb"]) : ''} */}
            {/* {formatNumberFourDecimalNom(contract["absimb"])} */}
            {contract["absimb"] !== null && contract["absimb"] !== undefined ? formatNumberFourDecimalNom(contract["absimb"]) : ''}
          </td>
        )}

        {/* "absimb" */}
        {columnVisibility.total_percentage_abslmb && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {/* {contract["absimb"] ? formatNumberFourDecimalNom(Math.abs(contract["absimb"])) : ''} */}
            {contract["absimb"] !== null && contract["absimb"] !== undefined && !Number.isNaN(Math.abs(contract["absimb"])) ? formatNumberFourDecimalNom(Math.abs(contract["absimb"])) : ""}
            
            {/* {contract ? formatNumberFourDecimal(contract["absimb"]) : ''} */}
          </td>
        )}

        {/* "accImbMonth_east" */}
        {columnVisibility.east_acc_imb_month_mmbtud && (
          <td className={`${!columnVisibility.west_acc_imb_month_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["accImbMonth_east"])}
          </td>
        )}

        {/* "accImbMonth_west" */}
        {columnVisibility.west_acc_imb_month_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["accImbMonth_west"])}
          </td>
        )}

        {/* "accImb_east" */}
        {columnVisibility.east_acc_imb_mmbtud && (
          <td className={`${!columnVisibility.west_acc_imb_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["accImb_east"])}
          </td>
        )}

        {/* "accImb_west" */}
        {columnVisibility.west_acc_imb_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["accImb_west"])}
          </td>
        )}

        {/* "accImbInv_east" */}
        {columnVisibility.east_acc_imb_inventory_mmbtud && (
          <td className={`${!columnVisibility.west_acc_imb_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1 font-semibold text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["accImbInv_east"])}
          </td>
        )}

        {/* "accImbInv_west" */}
        {columnVisibility.west_acc_imb_inventory_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1 font-semibold text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["accImbInv_west"])}
          </td>
        )}

        {/* "minInventory_east" */}
        {columnVisibility.east_min_inventory_mmbtud && (
          <td className={`${!columnVisibility.west_min_inventory_mmbtud && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["minInventory_east"])}
          </td>
        )}

        {/* "minInventory_west" */}
        {columnVisibility.west_min_inventory_mmbtud && (
          <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right `} scope="col">
            {formatNumberFourDecimalNom(contract["minInventory_west"])}
          </td>
        )}
      </>)}


      {/* UNDER Detail Pane */}
      {columnVisibility.detail_pane && (
        <>
          {/* "detail_entry_east_gsp" */}
          {columnVisibility.gsp && (
            <td className={`${!columnVisibility.others_east && !columnVisibility.lng && !columnVisibility.bypass_gas && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east_gsp"])}
            </td>
          )}

          {/* "detail_entry_east_bypassGas" */}
          {columnVisibility.bypass_gas && (
            <td className={`${!columnVisibility.others_east && !columnVisibility.lng && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east_bypassGas"])}
            </td>
          )}

          {/* "detail_entry_east_lng" */}
          {columnVisibility.lng && (
            <td className={`${!columnVisibility.others_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east_lng"])}
            </td>
          )}

          {/* "detail_entry_east_others" */}
          {columnVisibility.others_east && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimal(sumDetail(contract, 'detail_entry_east_', ['gsp', 'bypassGas', 'lng', 'F2andG']))}
            </td>
          )}

          {/* "detail_entry_west_yadana" */}
          {columnVisibility.ydn && (
            <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && !columnVisibility.ytg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_west_yadana"])}
            </td>
          )}

          {/* "detail_entry_west_yetagun" */}
          {columnVisibility.ytg && (
            <td className={`${!columnVisibility.others_west && !columnVisibility.ztk && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_west_yetagun"])}
            </td>
          )}

          {/* "detail_entry_west_zawtika" */}
          {columnVisibility.ztk && (
            <td className={`${!columnVisibility.others_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_west_zawtika"])}
            </td>
          )}

          {/* "detail_entry_west_others" */}
          {columnVisibility.others_west && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimal(sumDetail(contract, 'detail_entry_west_', ['yadana', 'yetagun', 'zawtika', 'F2andG']))}
            </td>
          )}

          {/* "detail_entry_east-west_ra6East" */}
          {columnVisibility.ra6_east && (
            <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && !columnVisibility.ra6_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east-west_ra6East"])}
            </td>
          )}

          {/* "detail_entry_east-west_ra6West" */}
          {columnVisibility.ra6_west && (
            <td className={`${!columnVisibility.bvw10_West && !columnVisibility.bvw10_east && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east-west_ra6West"])}
            </td>
          )}

          {/* "detail_entry_east-west_bvw10East" */}
          {columnVisibility.bvw10_east && (
            <td className={`${!columnVisibility.bvw10_West && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east-west_bvw10East"])}
            </td>
          )}

          {/* "detail_entry_east-west_bvw10West" */}
          {columnVisibility.bvw10_West && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_entry_east-west_bvw10West"])}
            </td>
          )}

          {/* "detail_exit_east_egat" */}
          {columnVisibility.egat && (
            <td className={`${!columnVisibility.others_east_exit && !columnVisibility.ipp && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_east_egat"])}
            </td>
          )}

          {/* "detail_exit_east_ipp" */}
          {columnVisibility.ipp && (
            <td className={`${!columnVisibility.others_east_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_east_ipp"])}
            </td>
          )}

          {/* "detail_exit_east_others" */}
          {columnVisibility.others_east_exit && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimal(sumDetail(contract, 'detail_exit_east_', ['egat', 'ipp', 'F2andG']))}
            </td>
          )}

          {/* "detail_exit_west_egat" */}
          {columnVisibility.egat_west && (
            <td className={`${!columnVisibility.others_west_exit && !columnVisibility.ipp_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_west_egat"])}
            </td>
          )}

          {/* "detail_exit_west_ipp" */}
          {columnVisibility.ipp_west && (
            <td className={`${!columnVisibility.others_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_west_ipp"])}
            </td>
          )}

          {/* "detail_exit_west_others" */}
          {columnVisibility.others_west_exit && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimal(sumDetail(contract, 'detail_exit_west_', ['egat', 'ipp', 'F2andG']))}
            </td>
          )}

          {/* "detail_exit_east-west_egat" */}
          {columnVisibility.egat_east_west && (
            <td className={`${!columnVisibility.others_east_west_exit && !columnVisibility.ipp_east_west && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_east-west_egat"])}
            </td>
          )}

          {/* "detail_exit_east-west_ipp" */}
          {columnVisibility.ipp_east_west && (
            <td className={`${!columnVisibility.others_east_west_exit && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_east-west_ipp"])}
            </td>
          )}

          {/* "detail_exit_east-west_others" */}
          {columnVisibility.others_east_west_exit && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimal(sumDetail(contract, 'detail_exit_east-west_', ['egat', 'ipp', 'F2andG']))}
            </td>
          )}

          {/* "detail_exit_east_F2andG" */}
          {columnVisibility.east_f2andg && (
            <td className={`${!columnVisibility.west_f2andg && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_east_F2andG"])}
            </td>
          )}

          {/* "detail_exit_west_F2andG" */}
          {columnVisibility.west_f2andg && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_west_F2andG"])}
            </td>
          )}

          {/* "detail_exit_E_east" */}
          {columnVisibility.east_e && (
            <td className={`${!columnVisibility.west_e && " border-r-[#c0c0c0] border-r-[1px] "} px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_E_east"])}
            </td>
          )}

          {/* "detail_exit_E_west" */}
          {columnVisibility.west_e && (
            <td className={` border-r-[#c0c0c0] border-r-[1px] px-2 py-1  text-[#5A4600] text-right`} scope="col">
              {formatNumberFourDecimalNom(contract["detail_exit_E_west"])}
            </td>
          )}

        </>)}

    </tr>
  );
};

export const ContractRowWhite = React.memo(
  ContractRowWhiteBase,
  // areEqual  // (optional) comparator
);