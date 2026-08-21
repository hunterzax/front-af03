import { useEffect, useRef } from "react";
import React, { FC, useState } from 'react';
import { fillMissingUpdateByAccount, formatDate, formatDateNoTime, formatDateTimeSec, formatNumber, getContrastTextColor } from '@/utils/generalFormatter';

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import { handleSort } from "@/utils/sortTable";
import BtnActionTable from "@/components/other/btnActionInTable";
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import ModalAction from "./modalAction";
import { useFetchMasters } from "@/hook/fetchMaster";

interface TableProps {
    tableData: any;
    isLoading?: any;
    columnVisibility?: any;
}

const TableZoneHistory: React.FC<TableProps> = ({ tableData, isLoading, columnVisibility }) => {
     
      const fdInterface: any = {
        name: '',
        zone_id: '',
        description: '',
        entry_exit_id: '',
        // start_date: new Date(),
        // end_date: new Date(),
        start_date: undefined,
        end_date: undefined,
        color: '',
    
        v2_wobbe_index_min: null,
        v2_wobbe_index_max: null,
        v2_methane_min: null,
        v2_methane_max: null,
        v2_oxygen_min: null,
        v2_oxygen_max: null,
        v2_carbon_dioxide_nitrogen_min: null,
        v2_carbon_dioxide_nitrogen_max: null,
        v2_total_sulphur_min: null,
        v2_total_sulphur_max: null,
        v2_hydrocarbon_dew_min: null,
        v2_hydrocarbon_dew_max: null,
        v2_sat_heating_value_min: null,
        v2_sat_heating_value_max: null,
        v2_c2_plus_min: null,
        v2_c2_plus_max: null,
        v2_nitrogen_min: null,
        v2_nitrogen_max: null,
        v2_carbon_dioxide_min: null,
        v2_carbon_dioxide_max: null,
        v2_hydrogen_sulfide_min: null,
        v2_hydrogen_sulfide_max: null,
        v2_mercury_min: null,
        v2_mercury_max: null,
        v2_moisture_min: null,
        v2_moisture_max: null,
      };
      const [formData, setFormData] = useState(fdInterface);
    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState<any>([]);
      const [formMode, setFormMode] = useState<'view'>('view');
        const [formOpen, setFormOpen] = useState(false);
          const [resetForm, setResetForm] = useState<() => void | null>();
        
            const { entryExitMaster, zoneMaster } = useFetchMasters();
          
      
    // useEffect(() => {
    //     if (tableData && tableData.length > 0) {
    //         setSortedData(tableData);
    //     } else {
    //         setSortedData([]);
    //     }
    // }, [tableData]);
const openViewForm = (id: any) => {
    const filteredData = tableData.find((item: any) => item.id === id);


    if (filteredData) {
      fdInterface.id = filteredData.id;
      fdInterface.name = filteredData.name;
      fdInterface.zone_id = filteredData.zone_id;
      fdInterface.description = filteredData.description;
      fdInterface.entry_exit_id = filteredData.entry_exit_id;
      fdInterface.start_date = new Date(filteredData.start_date);
      fdInterface.end_date = filteredData.end_date ? new Date(filteredData.end_date) : null;
      fdInterface.color = filteredData.color;

      fdInterface.v2_wobbe_index_min = filteredData?.zone_master_quality[0]?.v2_wobbe_index_min;
      fdInterface.v2_wobbe_index_max = filteredData?.zone_master_quality[0]?.v2_wobbe_index_max;

      fdInterface.v2_methane_min = filteredData?.zone_master_quality[0]?.v2_methane_min;
      fdInterface.v2_methane_max = filteredData?.zone_master_quality[0]?.v2_methane_max;

      fdInterface.v2_oxygen_min = filteredData?.zone_master_quality[0]?.v2_oxygen_min;
      fdInterface.v2_oxygen_max = filteredData?.zone_master_quality[0]?.v2_oxygen_max;

      fdInterface.v2_carbon_dioxide_nitrogen_min = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_nitrogen_min;
      fdInterface.v2_carbon_dioxide_nitrogen_max = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_nitrogen_max;

      fdInterface.v2_total_sulphur_min = filteredData?.zone_master_quality[0]?.v2_total_sulphur_min;
      fdInterface.v2_total_sulphur_max = filteredData?.zone_master_quality[0]?.v2_total_sulphur_max;

      fdInterface.v2_hydrocarbon_dew_min = filteredData?.zone_master_quality[0]?.v2_hydrocarbon_dew_min;
      fdInterface.v2_hydrocarbon_dew_max = filteredData?.zone_master_quality[0]?.v2_hydrocarbon_dew_max;

      fdInterface.v2_sat_heating_value_min = filteredData?.zone_master_quality[0]?.v2_sat_heating_value_min;
      fdInterface.v2_sat_heating_value_max = filteredData?.zone_master_quality[0]?.v2_sat_heating_value_max;

      fdInterface.v2_c2_plus_min = filteredData?.zone_master_quality[0]?.v2_c2_plus_min;
      fdInterface.v2_c2_plus_max = filteredData?.zone_master_quality[0]?.v2_c2_plus_max;

      fdInterface.v2_nitrogen_min = filteredData?.zone_master_quality[0]?.v2_nitrogen_min;
      fdInterface.v2_nitrogen_max = filteredData?.zone_master_quality[0]?.v2_nitrogen_max;

      fdInterface.v2_carbon_dioxide_min = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_min;
      fdInterface.v2_carbon_dioxide_max = filteredData?.zone_master_quality[0]?.v2_carbon_dioxide_max;

      fdInterface.v2_hydrogen_sulfide_min = filteredData?.zone_master_quality[0]?.v2_hydrogen_sulfide_min;
      fdInterface.v2_hydrogen_sulfide_max = filteredData?.zone_master_quality[0]?.v2_hydrogen_sulfide_max;

      fdInterface.v2_mercury_min = filteredData?.zone_master_quality[0]?.v2_mercury_min;
      fdInterface.v2_mercury_max = filteredData?.zone_master_quality[0]?.v2_mercury_max;

      fdInterface.v2_moisture_min = filteredData?.zone_master_quality[0]?.v2_moisture_min;
      fdInterface.v2_moisture_max = filteredData?.zone_master_quality[0]?.v2_moisture_max;

    }
    setFormMode('view');
    setFormData(fdInterface);
    setFormOpen(true);
  };

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            const normalized = fillMissingUpdateByAccount(tableData);
            setSortedData(normalized);
        } else {
            setSortedData([]);
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = (id: any) => {
        if (openPopoverId === id) {
        setOpenPopoverId(null);
        } else {
        setOpenPopoverId(id);
        }
    };

const toggleMenu = (mode: any, id: any) => {
    switch (mode) {
      case "view":
        openViewForm(id);
        setOpenPopoverId(null);
        break;
    }
  }

    return (
        <div className={`h-[calc(100vh-500px)] overflow-y-auto block  rounded-t-md relative z-1`}>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                    <tr className="h-9">

                        {columnVisibility.entry_exit && (
                            <th scope="col" className={`${table_sort_header_style} text-center`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Entry / Exit`}
                                {getArrowIcon("entry_exit_id")}
                            </th>
                        )}

                        {columnVisibility.zone_name && (
                            <th scope="col" className={`${table_sort_header_style}  text-center`} onClick={() => handleSort("name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Zone Name`}
                                {getArrowIcon("name")}
                            </th>
                        )}

                        {columnVisibility.description && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("description", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Description`}
                                {getArrowIcon("description")}
                            </th>
                        )}

                        {columnVisibility.start_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Start Date`}
                                {getArrowIcon("start_date")}
                            </th>
                        )}

                        {columnVisibility.end_date && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`End Date`}
                                {getArrowIcon("end_date")}
                            </th>
                        )}

                        {columnVisibility.created_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Created by`}
                                {getArrowIcon("create_by_account.first_name")}
                            </th>
                        )}

                        {columnVisibility.updated_by && (
                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("update_by_account.first_name", sortState, setSortState, setSortedData, fillMissingUpdateByAccount(tableData))}>
                                {`Updated by`}
                                {getArrowIcon("update_by_account.first_name")}
                            </th>
                        )}

                        {(
                            <th scope="col" className={`${table_header_style} text-center`}>
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
                            {columnVisibility.entry_exit && (
                                <td className="px-2 py-1 justify-center ">
                                    {row?.entry_exit &&
                                        <div className="flex justify-center items-center">
                                            <div className="flex w-auto min-w-[100px] max-w-[150px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entry_exit?.color }}>
                                                {`${row?.entry_exit?.name}`}
                                            </div>
                                        </div>
                                    }
                                </td>
                            )}

                            {columnVisibility.zone_name && (
                                <td className="px-2 py-1 justify-center ">
                                    {row?.name &&
                                        <div className="flex justify-center items-center">
                                            <div className="flex w-[90%] max-w-[200px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.color, color: getContrastTextColor(row?.color) }}>
                                                {`${row?.name}`}
                                            </div>
                                        </div>
                                    }
                                </td>
                            )}

                            {columnVisibility.description && (
                                <td className="px-2 py-1 text-[#464255] w-[450px]">{row?.description ? row?.description : ''}</td>
                            )}

                            {columnVisibility.start_date && (
                                <td className="px-2 py-1 text-[#464255]">{row?.start_date ? formatDateNoTime(row?.start_date) : ''}</td>
                            )}

                            {columnVisibility.end_date && (
                                <td className="px-2 py-1 text-[#0DA2A2]">{row?.end_date ? formatDateNoTime(row?.end_date) : ''}</td>
                            )}

                            {columnVisibility.created_by && (
                                <td className="px-2 py-1 text-[#464255]">
                                    <div>
                                        <span className="text-[#464255]">{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{formatDate(row?.create_date)}</div>
                                    </div>
                                </td>
                            )}

                            {columnVisibility.updated_by && (
                                <td className="px-2 py-1 text-[#464255]">
                                    <div>
                                        <span className="text-[#464255]">{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                                        <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                                    </div>
                                </td>
                            )}

                            {(
                                <td className="px-2 py-1">
                                {/* <div className="relative inline-block text-left "> */}
                                <div className="relative inline-flex justify-center items-center w-full">
                                    <BtnActionTable togglePopover={togglePopover} row_id={row?.id} />
                                    {openPopoverId === row?.id && (
                                    <div ref={popoverRef} className="absolute left-[-8rem] top-[-10px] mt-2 w-36 bg-white border border-gray-300 rounded-lg shadow-lg z-50" >
                                        <ul className="py-2">
                                        {
                                            <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("view", row?.id) }}><RemoveRedEyeOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`View`}</li>
                                        }
                                        </ul>
                                    </div>
                                    )}
                                </div>
                                </td>
                            )}

                        </tr>
                    ))}
                </tbody>
            </table>
    <ModalAction
        mode={formMode}
        data={formData}
        open={formOpen}
        zoneMasterData={zoneMaster?.data}
        entryExitMasterData={entryExitMaster?.data}
        onClose={() => {
          setFormOpen(false);
          if (resetForm) {
            setTimeout(() => {
              resetForm();
              setFormData(null);
            }, 100);
          }
        }}
        onSubmit={()=>{}}
        setResetForm={setResetForm}
      />
        </div>
    )
}

export default TableZoneHistory;