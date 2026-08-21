import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useEffect, useState } from "react";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import { useRouter } from "next/navigation";
import { handleSort } from "@/utils/sortTable";
import NodataTable from "@/components/other/nodataTable";
import dayjs from 'dayjs';

interface TableProps {
    tableData: any;
    systemData: any;
    isLoading: any;
    columnVisibility: any;
    tabIndex: any;
    fullDataD: any;
    fullDataW: any;
}

const TableNominationDashboard: React.FC<TableProps> = ({ tableData, systemData, isLoading, columnVisibility, tabIndex, fullDataD, fullDataW }) => {

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(tableData);
    const router = useRouter();

    useEffect(() => {
        if (tableData?.length > 0) {
            setSortedData(tableData);
        } else {
            setSortedData([])
        }
    }, [tableData]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState?.column === column && sortState?.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState?.column === column && sortState?.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    // ตอนเปลี่ยนหน้าหาทางเคลียร์
    // nom_dashboard_route_obj
    // nom_dashboard_route_obj_weekly
    // nom_dashboard_route_mix_quality_obj
    // nom_dashboard_route_quantity_obj

    const routeToPage = (data: any, mode: any) => {

        // เมื่อคลิกเครื่องหมายถูกผิดบนตาราง ของทุก column 
        // tab daily จะเปิดหน้า daily management พร้อม default filter gas_day และ contract_code ของ row ที่คลิก
        // tab weekly จะเปิดหน้า weekly management พร้อม default filter gas_day และ contract_code ของ row ที่คลิก

        // SET
        if (tabIndex == 0) {
            const nom_dashboard_route_obj = {
                gas_day: data?.gas_day,
                contract_code: data?.contract_code,
                group: data?.group,
                data: data
            };
            localStorage.setItem("nom_dashboard_route_obj", JSON.stringify(nom_dashboard_route_obj));

            setTimeout(() => {
                // router.push("/en/authorization/nominations/dailyManagement");
                // router.push(`/en/authorization/nominations/dailyManagement?filter_gas_day=${dayjs(data?.gas_day).format("YYYY-MM-DD")}&contract_code=${data?.contract_code?.id}&group_id=${data?.group?.id}`);
                router.push(`/en/authorization/nominations/dailyManagement?filter_gas_day=${dayjs(data?.gas_day).format("YYYY-MM-DD")}&contract_code=${data?.contract_code?.contract_code}&group_id=${data?.group?.id}`);
            }, 1000);
        } else {
            const nom_dashboard_route_obj_weekly = {
                gas_day: data?.gas_day,
                contract_code: data?.contract_code,
                data: data
            };
            localStorage.setItem("nom_dashboard_route_obj_weekly", JSON.stringify(nom_dashboard_route_obj_weekly));

            setTimeout(() => {
                // router.push("/en/authorization/nominations/weeklyManagement");
                // router.push(`/en/authorization/nominations/weeklyManagement?filter_gas_week=${dayjs(data?.gas_day).format("YYYY-MM-DD")}&contract_code=${data?.contract_code?.id}&group_id=${data?.group?.id}`); // Tab Weekly > Default Filter Gas Week และข้อมูลในตางรางกับที่กดมาจาก Nomination Dashboard ยังไม่ถูกต้อง (Menu Weekly Nomination) https://app.clickup.com/t/86etzch30
                router.push(`/en/authorization/nominations/weeklyManagement?filter_gas_week=${dayjs(data?.gas_day).format("YYYY-MM-DD")}&contract_code=${data?.contract_code?.contract_code}&group_id=${data?.group?.id}`); // Tab Weekly > Default Filter Gas Week และข้อมูลในตางรางกับที่กดมาจาก Nomination Dashboard ยังไม่ถูกต้อง (Menu Weekly Nomination) https://app.clickup.com/t/86etzch30
            }, 1000);
        }

        // if (tabIndex == 0) {
        //     router.push("/en/authorization/nominations/dailyManagement");
        // } else {
        //     router.push("/en/authorization/nominations/weeklyManagement");
        // }

        // GET ไปไว้หน้านู้น
        // const storedDashboard = localStorage.getItem("nom_dashboard_route_obj");
        // const dashboardObject = storedDashboard ? JSON.parse(storedDashboard) : null;
    }

    const routeToPageSystemQuality = (data: any, mode: any) => {

        // เมื่อคลิกเครื่องหมายถูกผิดบนตาราง System ที่ column Mix Quality
        // ระบบจะเปิดหน้า Quality Planning --> tab Daily
        // พร้อม filter Gas Day

        if (mode == 'mix_quality') {
            const nom_dashboard_route_mix_quality_obj = {
                // gas_day: data?.gas_day,
                gas_day: sortedData?.[0]?.gas_day,
                tab: tabIndex == 0 ? 'daily' : 'weekly'
                // tab: 'daily'
                // contract_code: data?.contract_code,
                // data: data
            };
            localStorage.setItem("nom_dashboard_route_mix_quality_obj", JSON.stringify(nom_dashboard_route_mix_quality_obj));
            // router.push("/en/authorization/nominations/qualityPlanning");
            router.push(`/en/authorization/nominations/qualityEvaluation?filter_gas_day=${dayjs(sortedData?.[0]?.gas_day).format("YYYY-MM-DD")}&tab_filter=${tabIndex == 0 ? '0' : '1'}`);

        }
    }

    const routeToPageSystemQuantity = (data: any, mode: any) => {
        // เมื่อคลิกเครื่องหมายถูกผิดบนตาราง System ที่ column Quantity
        // ระบบจะเปิดหน้า Summary Nomination Report --> tab Daily
        // พร้อม default filter Gas Day

        if (mode == 'quality') {
            const nom_dashboard_route_quantity_obj = {
                // gas_day: data?.gas_day,
                gas_day: sortedData?.[0]?.gas_day,
                tab: tabIndex == 0 ? 'daily' : 'weekly'
                // contract_code: data?.contract_code,
                // data: data
            };
            localStorage.setItem("nom_dashboard_route_quantity_obj", JSON.stringify(nom_dashboard_route_quantity_obj));
            // router.push("/en/authorization/nominations/summaryNominationReport");
            router.push(`/en/authorization/nominations/summaryNominationReport?filter_gas_day=${dayjs(sortedData?.[0]?.gas_day).format("YYYY-MM-DD")}&tab_filter=${tabIndex == 0 ? '0' : '1'}&mainTab=1&subTab=0`);
        }
    }


    const routeToPageSystemMinInven = (data: any, mode: any) => {

        // เมื่อคลิกเครื่องหมายถูกผิดบนตาราง System ที่ column Mix Quality
        // ระบบจะเปิดหน้า Quality Planning --> tab Daily
        // พร้อม filter Gas Day

        if (mode == 'mix_inven') {
            const nom_dashboard_route_min_inven_obj = {
                // gas_day: data?.gas_day,
                gas_day: sortedData?.[0]?.gas_day,
                tab: tabIndex == 0 ? 'daily' : 'weekly'
                // tab: 'daily'
                // contract_code: data?.contract_code,
                // data: data
            };
            localStorage.setItem("nom_dashboard_route_min_inven_obj", JSON.stringify(nom_dashboard_route_min_inven_obj));
            // router.push("/en/authorization/nominations/qualityPlanning");
            router.push(`/en/authorization/nominations/minimumInventorySummary?filter_gas_day=${dayjs(sortedData?.[0]?.gas_day).format("YYYY-MM-DD")}&tab_filter=${tabIndex == 0 ? '1' : '2'}`);

        }
    }

    useEffect(() => {
      console.log('fullDataD : ', fullDataD);
    }, [fullDataD])

    useEffect(() => {
      console.log('fullDataW : ', fullDataW);
    }, [fullDataW])
    

    return (
        <div className="h-[calc(100vh-480px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {
                isLoading ?
                    <div>
                        <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                            <thead className="text-xs text-[#ffffff] sticky top-0 z-10 bg-[#1473A1]">
                                <tr className="h-9">
                                    {columnVisibility?.contractcode && (
                                        <th scope="col"
                                            className={`${table_sort_header_style} text-left`}
                                            onClick={() => handleSort("contract_code.contract_code", sortState, setSortState, setSortedData, sortedData)}
                                        >
                                            {`Contract Code`}
                                            {getArrowIcon("contract_code.contract_code")}
                                        </th>
                                    )}
                                    {columnVisibility?.shipper && (
                                        <th scope="col"
                                            className={`${table_sort_header_style} text-left`}
                                            onClick={() => handleSort("group.name", sortState, setSortState, setSortedData, sortedData)}
                                        >
                                            {`Shipper Name`}
                                            {getArrowIcon("group.name")}
                                        </th>
                                    )}
                                    {columnVisibility?.entry_quality && (
                                        <th scope="col" className={`${table_header_style} text-center`}>
                                            {`Entry Quality`}
                                            {/* {getArrowIcon("")} */}
                                        </th>
                                    )}
                                    {columnVisibility?.overise_quality && (
                                        <th scope="col" className={`${table_header_style} text-center`}>
                                            {`Overuse Quantity`}
                                            {/* {getArrowIcon("")} */}
                                        </th>
                                    )}
                                    {columnVisibility?.over_maximum_hour && (
                                        <th scope="col" className={`${table_header_style} text-center`}>
                                            {`Over Maximum Hour Capacity Right`}
                                            {/* {getArrowIcon("")} */}
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {/* "true คือเกินให้ ✖ นอกนั้น ✔" */}
                                {sortedData && sortedData?.map((row: any, key: any) => {
                                    return (
                                        <tr
                                            key={'data-' + key}
                                            className={`${table_row_style}`}
                                        >
                                            {columnVisibility?.contractcode && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div>{row?.reserve_balancing_gas_contract ? row?.reserve_balancing_gas_contract?.res_bal_gas_contract : row?.contract_code?.contract_code || ''}</div>
                                                    {/* <div>{row?.contract_code ? row?.contract_code?.contract_code : ''}</div> */}
                                                </td>
                                            )}

                                            {columnVisibility?.shipper && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div>{row?.group ? row?.group?.name : ''}</div>
                                                </td>
                                            )}

                                            {columnVisibility?.entry_quality && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        {
                                                            row?.entry_quality == true ? <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                <CloseIcon
                                                                    sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                    onClick={() => routeToPage(row, 'close_entry_quality')}
                                                                />
                                                            </div>
                                                                : row?.entry_quality == false ? <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                    <CheckIcon
                                                                        sx={{ fontSize: 18, color: '#148750' }}
                                                                        onClick={() => routeToPage(row, 'check_entry_quality')}
                                                                    />
                                                                </div>
                                                                    : <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                        <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPage(row, 'check_entry_quality')}
                                                                        />
                                                                    </div>
                                                        }
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.overise_quality && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        {
                                                            row?.overuse_quantity == true ? <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                <CloseIcon
                                                                    sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                    onClick={() => routeToPage(row, 'close_overuse_quantity')}
                                                                />
                                                            </div>
                                                                : row?.overuse_quantity == false ? <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                    <CheckIcon
                                                                        sx={{ fontSize: 18, color: '#148750' }}
                                                                        onClick={() => routeToPage(row, 'close_overuse_quantity')}
                                                                    />
                                                                </div>
                                                                    : <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                        <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPage(row, 'close_overuse_quantity')}
                                                                        />
                                                                    </div>
                                                        }
                                                    </div>
                                                </td>
                                            )}

                                            {columnVisibility?.over_maximum_hour && (
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        {
                                                            row?.over_maximum_hour_capacity_right == true ? <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                <CloseIcon
                                                                    sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                    onClick={() => routeToPage(row, 'close_over_maximum_hour_capacity_right')}
                                                                />
                                                            </div>
                                                                : row?.over_maximum_hour_capacity_right == false ? <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                    <CheckIcon
                                                                        sx={{ fontSize: 18, color: '#148750' }}
                                                                        onClick={() => routeToPage(row, 'close_over_maximum_hour_capacity_right')}
                                                                    />

                                                                </div>
                                                                    : <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                                        <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPage(row, 'close_over_maximum_hour_capacity_right')}
                                                                        />
                                                                    </div>
                                                        }
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {
                            isLoading && sortedData?.length == 0 && <NodataTable />
                        }
                        {/* tabIndex == 0 */}
                        {/* fullData?.daily?.checkNom */}
                        {/* fullData?.weekly?.checkNom */}
                        { 
                            <>
                                <div className="h-[40px] bg-[#1473A1] text-white flex justify-center items-center font-bold text-[16px] mt-5 rounded-t-md">
                                    {`System`}
                                </div>
                                <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                                    <thead className="text-xs text-[#ffffff] sticky top-0 z-10 bg-[#00ADEF] hover:!bg-[#00ADEF]">
                                        <tr className="h-9">
                                            <th className={`relative whitespace-nowrap px-4 py-1 font-[600] justify-start cursor-pointer select-none text-center`}>
                                                {`Mix Quality`}
                                            </th>
                                            <th className={`relative whitespace-nowrap px-4 py-1 font-[600] justify-start cursor-pointer select-none text-center`}>
                                                {`Quantity`}
                                            </th>
                                            <th className={`relative whitespace-nowrap px-4 py-1 font-[600] justify-start cursor-pointer select-none text-center`}>
                                                {`Minimum Inventory`}
                                                {/* https://app.clickup.com/t/9018502823/86etzcgrx */}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            // tabIndex == 0 && fullDataD?.daily?.checkNom > 0 
                                            // tabIndex == 1 && fullDataW?.weekly?.checkNom > 0 &&
                                            // tabIndex == 1 && fullDataW?.weekly?.checkNom > 0 &&
                                            (tabIndex == 0 && fullDataD?.daily?.checkNom > 0) ?
                                            <tr
                                                key={'head-sub'}
                                                className={`${table_row_style}`}
                                            >
                                                {/* "true คือเกินให้ ✖ นอกนั้น ✔" */}
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                            {
                                                                systemData?.mixQuality == true ?
                                                                    <CloseIcon
                                                                        sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                        onClick={() => routeToPageSystemQuality(systemData, 'mix_quality')}
                                                                    />
                                                                    : systemData?.mixQuality == false ?
                                                                        <CheckIcon
                                                                            sx={{ fontSize: 18, color: '#148750' }}
                                                                            onClick={() => routeToPageSystemQuality(systemData, 'mix_quality')}
                                                                        />
                                                                        :
                                                                        <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPageSystemQuality(systemData, 'mix_quality')}
                                                                        />
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                            {
                                                                systemData?.quality == true ?
                                                                    <CloseIcon
                                                                        sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                        onClick={() => routeToPageSystemQuantity(systemData, 'quality')}

                                                                    />
                                                                    : systemData?.quality == false ?
                                                                        <CheckIcon
                                                                            sx={{ fontSize: 18, color: '#148750' }}
                                                                            onClick={() => routeToPageSystemQuantity(systemData, 'quality')}
                                                                        />
                                                                        : <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPageSystemQuantity(systemData, 'quality')}
                                                                        />
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                            {
                                                                systemData?.mixInven == true ?
                                                                    <CloseIcon
                                                                        sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                        onClick={() => routeToPageSystemMinInven(systemData, 'mix_inven')}

                                                                    />
                                                                    : systemData?.mixInven == false ?
                                                                        <CheckIcon
                                                                            sx={{ fontSize: 18, color: '#148750' }}
                                                                            onClick={() => routeToPageSystemMinInven(systemData, 'mix_inven')}
                                                                        />
                                                                        : <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPageSystemMinInven(systemData, 'mix_inven')}
                                                                        />
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            : (tabIndex == 1 && fullDataW?.weekly?.checkNom > 0) ?
                                            <tr
                                                key={'head-sub'}
                                                className={`${table_row_style}`}
                                            >
                                                {/* "true คือเกินให้ ✖ นอกนั้น ✔" */}
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                            {
                                                                systemData?.mixQuality == true ?
                                                                    <CloseIcon
                                                                        sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                        onClick={() => routeToPageSystemQuality(systemData, 'mix_quality')}
                                                                    />
                                                                    : systemData?.mixQuality == false ?
                                                                        <CheckIcon
                                                                            sx={{ fontSize: 18, color: '#148750' }}
                                                                            onClick={() => routeToPageSystemQuality(systemData, 'mix_quality')}
                                                                        />
                                                                        :
                                                                        <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPageSystemQuality(systemData, 'mix_quality')}
                                                                        />
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                            {
                                                                systemData?.quality == true ?
                                                                    <CloseIcon
                                                                        sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                        onClick={() => routeToPageSystemQuantity(systemData, 'quality')}

                                                                    />
                                                                    : systemData?.quality == false ?
                                                                        <CheckIcon
                                                                            sx={{ fontSize: 18, color: '#148750' }}
                                                                            onClick={() => routeToPageSystemQuantity(systemData, 'quality')}
                                                                        />
                                                                        : <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPageSystemQuantity(systemData, 'quality')}
                                                                        />
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-[#464255]">
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-[25px] h-[25px] rounded-md border border-[#DFE4EA] flex justify-center items-center cursor-pointer">
                                                            {
                                                                systemData?.mixInven == true ?
                                                                    <CloseIcon
                                                                        sx={{ fontSize: 18, color: '#ED1B24' }}
                                                                        onClick={() => routeToPageSystemMinInven(systemData, 'mix_inven')}

                                                                    />
                                                                    : systemData?.mixInven == false ?
                                                                        <CheckIcon
                                                                            sx={{ fontSize: 18, color: '#148750' }}
                                                                            onClick={() => routeToPageSystemMinInven(systemData, 'mix_inven')}
                                                                        />
                                                                        : <RemoveIcon
                                                                            sx={{ fontSize: 18, color: '#AEAEB2' }}
                                                                            onClick={() => routeToPageSystemMinInven(systemData, 'mix_inven')}
                                                                        />
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                             : <></>
                                        }
                                    </tbody>
                                </table>
                                {
                                    tabIndex == 0 && fullDataD?.daily?.checkNom == 0 && <NodataTable />
                                }
                                {
                                    tabIndex == 1 && fullDataW?.weekly?.checkNom == 0 && <NodataTable />
                                }

                            </>
                        }

                    </div>
                    :
                    <TableSkeleton />
            }
        </div>
    )
}

export default TableNominationDashboard;