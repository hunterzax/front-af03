import * as React from 'react';
import {
    Dialog,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from 'react';
import BtnGeneral from '@/components/other/btnGeneral';
import dayjs from 'dayjs';
import TableViewCapacityCharge from './tableViewCapacityCharge';
import TableViewCapacityOveruseCharge from './tableViewCapacityOveruseCharge';
import TableViewImbalanncePenaltyCharge from './tableViewImbalancesPenaltyCharge';
import NodataTable from '@/components/other/nodataTable';
import TableViewCommodityCharge from './tableViewCommodityCharge';
import { exportTariffChargeReport } from '@/utils/exportFunc';
import utc from "dayjs/plugin/utc";
import getUserValue from '@/utils/getuserValue';
import { isHasPTT } from '@/utils/generalFormatter';
dayjs.extend(utc);

interface ModalViewProps {
    open: boolean;
    handleClose: (value: any) => void;
    headData: any;
    viewDetailData: any;
    title?: string;
    tableType?: any
    tableTypeViewName?: any
    data?: any;
    initialColumns?: any
    userPermission?: any;
    dataShipper?: any;
}

const ModalView: React.FC<ModalViewProps> = ({ open, handleClose, headData, viewDetailData, title, data, tableType, initialColumns, userPermission, dataShipper, tableTypeViewName }) => {

    const userDT: any = getUserValue();

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>(data);

    // ############### COLUMN SHOW/HIDE ###############
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openPopOver = Boolean(anchorEl);
    const id = openPopOver ? 'column-toggle-popover' : undefined;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        initialColumns ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])) : {}
    );

    useEffect(() => {
        setFilteredDataTable(data)
    }, [data])

    const renderTable = (tableType: any, dataTable?: any) => {

        // switch (tableType) {
        //     case "Capacity Charge":
        //         return <TableViewCapacityCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

        //     case "Commodity Charge":
        //         return <TableViewCommodityCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

        //     case "Capacity Overuse Charge (Exit)":
        //         return <TableViewCapacityOveruseCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;
        //     case "Capacity Overuse Charge (Entry)":
        //         return <TableViewCapacityOveruseCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

        //     case "Imbalances Penalty Charge (Negative)":
        //         return <TableViewImbalanncePenaltyCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;
        //     case "Imbalances Penalty Charge (Positive)":
        //         return <TableViewImbalanncePenaltyCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

        //     default:
        //         return <NodataTable />;
        // }
        switch (tableType) {
            case 1:
                return <TableViewCapacityCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />; // Demand Charge (Td)

            case 2:
                return <TableViewCommodityCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

            case 6: // https://app.clickup.com/t/9018502823/86evh20hv
                return <TableViewCapacityOveruseCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;
            case 5: // https://app.clickup.com/t/9018502823/86evh20hv
                return <TableViewCapacityOveruseCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

            case 4:
                return <TableViewImbalanncePenaltyCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;
            case 3:
                return <TableViewImbalanncePenaltyCharge tableData={dataTable} columnVisibility={columnVisibility} headData={headData} />;

            default:
                return <NodataTable />;
        }
    };

    // const handleExport = (id?: any) => {
    //     let body: any = {}

    //     switch (tableType) {
    //         case "Capacity Charge":
    //             body = {
    //                 "bodys": {
    //                     "tariff_type_charge_id": 1 // fix 1 capacity-charged เท่านั้น
    //                 },
    //                 "filter": [
    //                     "Area",
    //                     "Capacity Right (MMBTU)"
    //                 ]
    //             }
    //             exportTariffChargeReport(`tariff/tariff-charge-report/capacity-charge/${viewDetailData?.id}`, body);
    //             break;


    //         case "Commodity Charge":
    //             // มันจะมี type a กับ b ต้องดูใน viewDetailData.tariff.tariff_type_ab_id (1 == A, 2 == B)
    //             body = {
    //                 "bodys": {
    //                     "tariff_type_charge_id": 2 // fix 2 Commonity Charge
    //                 },
    //                 "filter": [] // ใส่แค่ []
    //             }

    //             if (viewDetailData.tariff.tariff_type_ab_id == 1) { // A
    //                 // exportTariffChargeReport(`tariff/tariff-charge-report/commodity-charge-a-external/${viewDetailData?.id}`, body);
    //                 // exportTariffChargeReport(`tariff/tariff-charge-report/commodity-charge-a-internal/${viewDetailData?.id}`, body);

    //                 // body = {
    //                 //     "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
    //                 //     "shipperName": headData?.shipper?.name,
    //                 //     "month": dayjs(headData?.month_year_charge).format("MMM"),
    //                 //     "year": dayjs(headData?.month_year_charge).format("YYYY"),
    //                 //     "startDate": "2024-04-01",
    //                 //     "endDate": "2024-04-30"
    //                 // }

    //                 let body_type_a = {
    //                     "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
    //                     "shipperName": headData?.shipper?.name,
    //                     "year": dayjs(headData?.month_year_charge).format("YYYY"),
    //                     "month": dayjs(headData?.month_year_charge).format("MM"),
    //                     "startDate": "2024-04-01",
    //                     "endDate": "2024-04-30"
    //                 }
    //                 let body_type_a2 = {
    //                     "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
    //                     "zone": "zone3",
    //                     "month": dayjs(headData?.month_year_charge).format("MM"),
    //                     "year": dayjs(headData?.month_year_charge).format("YYYY"),
    //                 }

    //                 // let body_type_b = {
    //                 //     "id": "156",
    //                 //     "month": dayjs(headData?.month_year_charge).format("MMMM"),
    //                 //     "year": dayjs(headData?.month_year_charge).format("YYYY"),
    //                 //     "tariffId": headData?.tariff_id ? headData?.tariff_id : '',
    //                 //     "shipperName": headData?.shipper?.name,
    //                 //     "contractCode": filteredDataTable?.[0]?.data ? filteredDataTable?.[0]?.data?.contract : ''
    //                 // }

    //                 // exportTariffChargeReport(`tariff/commodity-charge-report-type-b`, body_type_b);
    //                 // exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a`, body_type_a, `tariff_${headData?.tariff_id}`); // external
    //                 // exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a2`, body_type_a2); // internal

    //                 // const hasPTT = isHasPTT(userDT)

    //                 // หา shipper จาก headData.id_name
    //                 const shipper = dataShipper?.find((item: any) => {
    //                     return (
    //                         String(item?.id_name ?? '').trim().toLowerCase() === String(headData?.shipper?.id_name ?? '').trim().toLowerCase()
    //                     )
    //                 });

    //                 // เช็คว่าเป็น ngp-s16-001 มั้ย 
    //                 const isNgpS16001 = String(headData?.shipper?.id_name ?? '').trim().toLowerCase() === 'ngp-s16-001';

    //                 // shipper 
    //                 if (!isNgpS16001 && shipper !== undefined) {
    //                     exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a`, body_type_a, `tariff_${headData?.tariff_id}`);  // external
    //                 } else {
    //                     // ngp-s16-001 || TSO เป้น internal
    //                     exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a2`, body_type_a2); // internal
    //                 }

    //                 // // ถ้า id_name มี ngp-s16-001 || type TSO || admin ให้ยิงเส้น internal
    //                 // if (hasPTT || userDT?.account_manage?.[0]?.user_type_id == 2 || userDT?.account_manage?.[0]?.user_type_id == 1) {
    //                 //     exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a2`, body_type_a2); // internal
    //                 // }

    //                 // // นอกนั้น external
    //                 // if (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) {
    //                 //     exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a`, body_type_a, `tariff_${headData?.tariff_id}`);  // external
    //                 // }

    //             } else { // B
    //                 exportTariffChargeReport(`tariff/tariff-charge-report/commodity-charge-b/${viewDetailData?.id}`, body);
    //             }
    //             break;

    //         case "Capacity Overuse Charge (Exit)":
    //             body = {
    //                 "bodys": {
    //                     "tariff_type_charge_id": 6 // 5 Entry, 6 Exit
    //                 },
    //                 "filter": [] // ใส่แค่ []
    //             }
    //             exportTariffChargeReport(`tariff/tariff-charge-report/capacity-overuse-charge-entry-exit/${viewDetailData?.id}`, body);
    //             break;
    //         case "Capacity Overuse Charge (Entry)":
    //             body = {
    //                 "bodys": {
    //                     "tariff_type_charge_id": 5 // 5 Entry, 6 Exit
    //                 },
    //                 "filter": [] // ใส่แค่ []
    //             }
    //             exportTariffChargeReport(`tariff/tariff-charge-report/capacity-overuse-charge-entry-exit/${viewDetailData?.id}`, body);
    //             break;

    //         case "Imbalances Penalty Charge (Negative)":
    //             // https://10.100.91.182:4001/master/export-files/tariff/imbalance-capacity-report
    //             body = {
    //                 "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
    //                 "companyName": "PTT Public Company Limited",
    //                 // "companyName": headData?.shipper?.name,
    //                 "shipperName": headData?.shipper?.name,
    //                 "month": dayjs(headData?.month_year_charge).format("MMM"),
    //                 "year": dayjs(headData?.month_year_charge).format("YYYY"),
    //                 "reportedBy": {
    //                     // "name": "Ms.Wipada Yenyin",
    //                     "name": "",
    //                     "position": "Senior Engineer",
    //                     "division": "Transmission Contracts & Regulatory Management Division"
    //                 },
    //                 "manager": {
    //                     // "name": "Ms. Tanatchaporn",
    //                     "name": "",
    //                     "position": "Manager of",
    //                     "division": "Transmission Contracts & Regulatory Management Division"
    //                 }
    //             }
    //             exportTariffChargeReport(`tariff/imbalance-capacity-report`, body);

    //             break;
    //         case "Imbalances Penalty Charge (Positive)":
    //             body = {
    //                 "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
    //                 "companyName": "PTT Public Company Limited",
    //                 // "companyName": headData?.shipper?.name,
    //                 "shipperName": headData?.shipper?.name,
    //                 "month": dayjs(headData?.month_year_charge).format("MMM"),
    //                 "year": dayjs(headData?.month_year_charge).format("YYYY"),
    //                 "reportedBy": {
    //                     // "name": "Ms.Wipada Yenyin",
    //                     "name": "",
    //                     "position": "Senior Engineer",
    //                     "division": "Transmission Contracts & Regulatory Management Division"
    //                 },
    //                 "manager": {
    //                     // "name": "Ms. Tanatchaporn",
    //                     "name": "",
    //                     "position": "Manager of",
    //                     "division": "Transmission Contracts & Regulatory Management Division"
    //                 }
    //             }
    //             exportTariffChargeReport(`tariff/imbalance-capacity-report`, body);

    //             break;

    //         default:
    //             return <NodataTable />;
    //     }
    // }

    const handleExport = (id?: any) => {
        let body: any = {}

        switch (tableType) {
            case 1:
                body = {
                    "bodys": {
                        "tariff_type_charge_id": 1 // fix 1 capacity-charged เท่านั้น
                    },
                    "filter": [
                        "Area",
                        "Capacity Right (MMBTU)"
                    ]
                }
                exportTariffChargeReport(`tariff/tariff-charge-report/capacity-charge/${viewDetailData?.id}`, body);
                break;


            case 2:
                // มันจะมี type a กับ b ต้องดูใน viewDetailData.tariff.tariff_type_ab_id (1 == A, 2 == B)
                body = {
                    "bodys": {
                        "tariff_type_charge_id": 2 // fix 2 Commonity Charge
                    },
                    "filter": [] // ใส่แค่ []
                }

                if (viewDetailData.tariff.tariff_type_ab_id == 1) { // A
                    // exportTariffChargeReport(`tariff/tariff-charge-report/commodity-charge-a-external/${viewDetailData?.id}`, body);
                    // exportTariffChargeReport(`tariff/tariff-charge-report/commodity-charge-a-internal/${viewDetailData?.id}`, body);

                    // body = {
                    //     "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
                    //     "shipperName": headData?.shipper?.name,
                    //     "month": dayjs(headData?.month_year_charge).format("MMM"),
                    //     "year": dayjs(headData?.month_year_charge).format("YYYY"),
                    //     "startDate": "2024-04-01",
                    //     "endDate": "2024-04-30"
                    // }

                    let body_type_a = {
                        "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
                        "shipperName": headData?.shipper?.name,
                        "year": dayjs(headData?.month_year_charge).format("YYYY"),
                        "month": dayjs(headData?.month_year_charge).format("MM"),
                        "startDate": "2024-04-01",
                        "endDate": "2024-04-30"
                    }
                    let body_type_a2 = {
                        "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
                        "zone": "zone3",
                        "month": dayjs(headData?.month_year_charge).format("MM"),
                        "year": dayjs(headData?.month_year_charge).format("YYYY"),
                    }

                    // หา shipper จาก headData.id_name
                    const shipper = dataShipper?.find((item: any) => {
                        return (
                            String(item?.id_name ?? '').trim().toLowerCase() === String(headData?.shipper?.id_name ?? '').trim().toLowerCase()
                        )
                    });

                    // เช็คว่าเป็น ngp-s16-001 มั้ย 
                    const isNgpS16001 = String(headData?.shipper?.id_name ?? '').trim().toLowerCase() === 'ngp-s16-001';

                    // shipper 
                    if (!isNgpS16001 && shipper !== undefined) {
                        exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a`, body_type_a, `tariff_${headData?.tariff_id}`);  // external
                    } else {
                        // ngp-s16-001 || TSO เป้น internal
                        exportTariffChargeReport(`tariff/gas-allocation-report/multisheet-type-a2`, body_type_a2); // internal
                    }

                } else { // B
                    exportTariffChargeReport(`tariff/tariff-charge-report/commodity-charge-b/${viewDetailData?.id}`, body);
                }
                break;

            case 6:
                body = {
                    "bodys": {
                        "tariff_type_charge_id": 6 // 5 Entry, 6 Exit
                    },
                    "filter": [] // ใส่แค่ []
                }
                exportTariffChargeReport(`tariff/tariff-charge-report/capacity-overuse-charge-entry-exit/${viewDetailData?.id}`, body);
                break;
            case 5:
                body = {
                    "bodys": {
                        "tariff_type_charge_id": 5 // 5 Entry, 6 Exit
                    },
                    "filter": [] // ใส่แค่ []
                }
                exportTariffChargeReport(`tariff/tariff-charge-report/capacity-overuse-charge-entry-exit/${viewDetailData?.id}`, body);
                break;

            case 4:
                body = {
                    "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
                    "companyName": "PTT Public Company Limited",
                    // "companyName": headData?.shipper?.name,
                    "shipperName": headData?.shipper?.name,
                    "month": dayjs(headData?.month_year_charge).format("MMM"),
                    "year": dayjs(headData?.month_year_charge).format("YYYY"),
                    "reportedBy": {
                        // "name": "Ms.Wipada Yenyin",
                        "name": "",
                        "position": "Senior Engineer",
                        "division": "Transmission Contracts & Regulatory Management Division"
                    },
                    "manager": {
                        // "name": "Ms. Tanatchaporn",
                        "name": "",
                        "position": "Manager of",
                        "division": "Transmission Contracts & Regulatory Management Division"
                    }
                }
                exportTariffChargeReport(`tariff/imbalance-capacity-report`, body);

                break;
            case 3:
                body = {
                    "id": viewDetailData?.id ? viewDetailData?.id.toString() : '',
                    "companyName": "PTT Public Company Limited",
                    // "companyName": headData?.shipper?.name,
                    "shipperName": headData?.shipper?.name,
                    "month": dayjs(headData?.month_year_charge).format("MMM"),
                    "year": dayjs(headData?.month_year_charge).format("YYYY"),
                    "reportedBy": {
                        // "name": "Ms.Wipada Yenyin",
                        "name": "",
                        "position": "Senior Engineer",
                        "division": "Transmission Contracts & Regulatory Management Division"
                    },
                    "manager": {
                        // "name": "Ms. Tanatchaporn",
                        "name": "",
                        "position": "Manager of",
                        "division": "Transmission Contracts & Regulatory Management Division"
                    }
                }
                exportTariffChargeReport(`tariff/imbalance-capacity-report`, body);

                break;

            default:
                return <NodataTable />;
        }
    }

    return (
        <>
            <Dialog open={open} onClose={handleClose} className="relative z-20">
                {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
                <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
                <div className="fixed inset-0 z-10 flex items-center justify-center">
                    <DialogPanel
                        transition
                        className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex flex-col items-center gap-2 p-9 w-[calc(100vw-100px)] h-[calc(100vh-80px)]">
                            <div className="w-full">
                                {/* <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{`Monthly Overview : ${tableType}`}</h2> */}
                                <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{`Monthly Overview : ${tableTypeViewName}`}</h2>
                                <div className='mb-4 w-full flex items-center'>

                                    <div className="w-[650px]">
                                        <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-10">
                                            {/* Month/Year */}
                                            <div className="flex flex-col">
                                                <p className="!text-[14px] font-semibold text-[#58585A]">{`Month/Year`}</p>
                                                <p className="!text-[14px] font-light text-[#757575]">{headData?.month_year_charge ? dayjs(headData?.month_year_charge).format("MMMM YYYY") : ''}</p>
                                                {/* <p className="!text-[14px] font-light text-[#757575]">{headData?.month_year_charge ? dayjs.utc(headData?.month_year_charge).format("MMMM YYYY") : ''}</p> */}
                                            </div>

                                            {/* Tariff ID */}
                                            <div className="flex flex-col">
                                                <p className="!text-[14px] font-semibold text-[#58585A]">{`Tariff ID`}</p>
                                                <p className="!text-[14px] font-light text-[#757575]">{headData?.tariff_id ? headData?.tariff_id : ''}</p>
                                            </div>

                                            {/* Shipper Name */}
                                            <div className="flex flex-col">
                                                <p className="!text-[14px] font-semibold text-[#58585A]">{`Shipper Name`}</p>
                                                <p className="!text-[14px] font-light text-[#757575]">{headData?.shipper ? headData?.shipper?.name : ''}</p>
                                            </div>

                                            {/* Contract Code */}
                                            <div className="flex flex-col">
                                                <p className="!text-[14px] font-semibold text-[#58585A]">{`Contract Code`}</p>
                                                {
                                                    tableType == 'Commodity Charge' ?
                                                        <p className="!text-[14px] font-light text-[#757575]">{filteredDataTable?.[0]?.data ? filteredDataTable?.[0]?.data?.contract : ''}</p>
                                                        :
                                                        <p className="!text-[14px] font-light text-[#757575]">{viewDetailData?.contract_code ? viewDetailData?.contract_code?.contract_code : ''}</p>
                                                }
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full pt-2 h-[75%]">
                                <div className="flex flex-wrap gap-2 justify-end">
                                    {/* <BtnGeneral
                                        bgcolor={"#24AB6A"}
                                        modeIcon={'export'}
                                        textRender={"Export"}
                                        generalFunc={() =>
                                            exportToExcel(filteredDataTable, tableType, columnVisibility)
                                        }
                                        can_export={userPermission ? userPermission?.f_export : false}
                                    /> */}

                                    <BtnGeneral
                                        bgcolor={"#24AB6A"}
                                        modeIcon={'export'}
                                        textRender={"Export"}
                                        // generalFunc={() => underDevelopment()}
                                        generalFunc={() => handleExport()}
                                        can_export={userPermission ? userPermission?.f_export : false}
                                    />
                                </div>

                                <div className='h-full pt-2'>
                                    {renderTable(tableType, filteredDataTable)}
                                </div>
                            </div>

                            <button
                                onClick={handleClose}
                                className="absolute bottom-9 right-9 w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 tracking-[1px]"
                            >
                                {'Close'}
                            </button>
                        </div>
                    </DialogPanel>
                </div >
            </Dialog >
        </>
    );
};

export default ModalView;