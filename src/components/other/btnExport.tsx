import React from 'react';
import { Button } from "@material-tailwind/react";
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { exportAdjustAccumulateImbalance, exportAdjustDailyImbalance, exportAllocationMonthlyReport, exportAllocationMonthlyReportDownload, exportAllocMgn, exportAllocQuery, exportAllocReport, exportAllocReview, exportBalanceIntradayAccImbDashboard, exportBalanceIntradayDashboard, exportBalanceIntradayDashboardShipper, exportBalancingMonthlyReport, exportBalancingMonthlyReportDownload, exportBalOperateAndInstruct, exportCapacityReleaseCapacityManagementDetail, exportCapacityRightTemplate, exportCapaPublic, exportCurtailsmentAlloc, exportDailyAdjustSummary, exportEventEmergencyDiffDay, exportEventOffspecGas, exportEventOfo, exportFunc, exportHvForOperationFlow, exportIntradayBalancingReport, exportIntradayBaseInvenShipper, exportIntradayBaseInventory, exportMeteringChecking, exportMeteringDataCheck, exportMeteringManagement, exportMeteringRetriving, exportNomDashboard, exportNomiEvaluaAndPlanning, exportParkingAllocation, exportShipperNominationReport, exportSpecific, exportSummaryNomReport, exportSummaryNomReportAllNom, exportSummaryNomReportDailyArea, exportSummaryNomReportDailyTotalSystem, exportSummaryNomReportTotalWeekly, exportSummaryNomReportWeeklyAreaMmbtu, exportTariffChargeReportMain, exportTariffCreditDebitNote, newExportDivision, newExportFunc, newExportTest } from '@/utils/exportFunc';
import dayjs from 'dayjs';
interface BtnExportProps {
    // exportFunction: (path:any, data:any) => void;
    // exportFunction?: (path: any, data: any) => Promise<void>;
    path?: any,
    data?: any,
    data2?: any,
    textRender: any
    can_export?: any
    columnVisibility?: any
    initialColumns?: any
    specificMenu?: any
    specificData?: any
    type?: any
    gasDay?: any
    startDate?: any
    endDate?: any
    disable?: any
    seletedId?: any
    tabIndex?: any
    fileName?: string
}

const BtnExport: React.FC<BtnExportProps> = ({ path, data, data2, textRender, can_export, columnVisibility, initialColumns, specificMenu, specificData, type, gasDay, disable = false, seletedId, startDate, endDate, tabIndex, fileName }) => {
    const modified_k = "flex items-center justify-center gap-3 px-4 h-[43px] w-[100px] bg-[#24AB6A] rounded-[6px]"

    return (
        can_export ? (
            <Button
                className={`${modified_k} ${data?.length <= 0 && 'bg-[#5e5e5e]'} ${disable && 'bg-[#5e5e5e]'}`}
                disabled={data?.length <= 0 || disable}
                onClick={() => {
                    if (specificMenu === 'release_cap_submission') {
                        exportSpecific(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'release_cap_management_detail') {
                        exportCapacityReleaseCapacityManagementDetail(path, data, data2, columnVisibility, initialColumns);
                    } else if (specificMenu == 'capacity_publication') {
                        exportCapaPublic(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu === 'path_mgn') {
                        newExportTest(path, data, data2, columnVisibility, initialColumns);
                    } else if (specificMenu === 'division') {
                        newExportDivision(path, data, data2, columnVisibility, initialColumns);
                    } else if (specificMenu == 'quality-evaluation') {
                        let gasday = gasDay ? dayjs(gasDay).format("DD/MM/YYYY") : null
                        exportNomiEvaluaAndPlanning(path, data, columnVisibility, initialColumns, type, gasday);
                    } else if (specificMenu == 'quality-planning') {
                        let gasday = gasDay ? dayjs(gasDay).format("DD/MM/YYYY") : null
                        exportNomiEvaluaAndPlanning(path, data, columnVisibility, initialColumns, type, gasday);
                    } else if (specificMenu == 'allocation-review') {
                        exportAllocReview(path, data, data2, columnVisibility, initialColumns, type, seletedId);
                    } else if (specificMenu == 'allocation-mgn') {
                        exportAllocMgn(path, data, data2, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'allocation-query') {
                        exportAllocQuery(path, data, data2, columnVisibility, initialColumns, type, seletedId, tabIndex);
                    } else if (specificMenu == 'allocation-report') {
                        exportAllocReport(path, data, data2, columnVisibility, initialColumns, type, seletedId, tabIndex);
                    } else if (specificMenu == 'nomination-dashboard') {
                        exportNomDashboard(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'summary-nomination-report') {
                        exportSummaryNomReport(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'summary-nomination-report-daily-total') {
                        exportSummaryNomReportDailyTotalSystem(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'summary-nomination-report-daily-area') {
                        exportSummaryNomReportDailyArea(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'summary-nomination-report-all-nomi') {
                        exportSummaryNomReportAllNom(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'summary-nomination-report-total-weekly') {
                        exportSummaryNomReportTotalWeekly(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'summary-nomination-report-weekly-area-mmbtu') {
                        exportSummaryNomReportWeeklyAreaMmbtu(path, data, columnVisibility, initialColumns, type, specificData);
                    } else if (specificMenu == 'metering-management') {
                        exportMeteringManagement(path, data, columnVisibility, initialColumns, type, startDate, endDate);
                    } else if (specificMenu == 'adjustment-daily-imbalance') {
                        exportAdjustDailyImbalance(path, data, data2, columnVisibility, initialColumns, type, seletedId);
                    } else if (specificMenu == 'adjustment-accumulated-imbalance') {
                        exportAdjustAccumulateImbalance(path, data, data2, columnVisibility, initialColumns, type, seletedId);
                    } else if (specificMenu == 'parking-allocation') {
                        exportParkingAllocation(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'allocation-monthly-report') {
                        exportAllocationMonthlyReport(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'allocation-monthly-report-download') {
                        exportAllocationMonthlyReportDownload(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'shipper-nomination-report') {
                        exportShipperNominationReport(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'curtailments-allocation') {
                        exportCurtailsmentAlloc(path, data, columnVisibility, initialColumns, type, seletedId, specificData, tabIndex);
                    } else if (specificMenu == 'daily-adjustment-summary') {
                        exportDailyAdjustSummary(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'intraday-base-inentory') {
                        exportIntradayBaseInventory(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'intraday-base-inentory-shipper') {
                        exportIntradayBaseInvenShipper(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'intraday-acc-imbalance-inventory-original') {
                        exportIntradayBaseInvenShipper(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'balance-report') {
                        exportIntradayBalancingReport(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'capacity-right-template') {
                        exportCapacityRightTemplate(path, data, columnVisibility, initialColumns);
                    } else if (specificMenu == 'bal-operate-and-instruct') {
                        exportBalOperateAndInstruct(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'hv-for-operation-flow') {
                        exportHvForOperationFlow(path, data, columnVisibility, initialColumns);
                    } else if (specificMenu == 'balance-intraday-dashboard') {
                        exportBalanceIntradayDashboard(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'balance-intraday-dashboard-shipper') {
                        exportBalanceIntradayDashboardShipper(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'metering-checking') {
                        exportMeteringChecking(path, data, columnVisibility, initialColumns, specificData);
                    } else if (specificMenu == 'intraday-acc-imbalance-dashboard') {
                        exportBalanceIntradayAccImbDashboard(path, data, columnVisibility, initialColumns, specificData, fileName);
                    } else if (specificMenu == 'balancing-monthly-report') {
                        exportBalancingMonthlyReport(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'balancing-monthly-report-download') {
                        exportBalancingMonthlyReportDownload(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'metering-retrieving') {
                        exportMeteringRetriving(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'metering-data-check') {
                        exportMeteringDataCheck(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'event-offspec-gas') {
                        exportEventOffspecGas(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'event-emergency-difficult-day') {
                        exportEventEmergencyDiffDay(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'event-ofo') {
                        exportEventOfo(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'tariff-charge-report') {
                        exportTariffChargeReportMain(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else if (specificMenu == 'tariff-credit-debit-note') {
                        exportTariffCreditDebitNote(path, data, columnVisibility, initialColumns, type, seletedId, specificData);
                    } else {
                        // default
                        newExportFunc(path, data, columnVisibility, initialColumns, fileName, specificData);
                    }
                }}
            >
                {/* <Button className="flex items-center justify-center text-center gap-3 px-2 h-[46px] w-[141px] bg-[#24AB6A] "> */}
                <span className="!font-extra-thin text-[16px] normal-case">{`${textRender}`}</span>
                <DescriptionOutlinedIcon
                    className={` text-[#ffffff]`}
                    style={{
                        fontSize: "17px",
                        // color: data.length <= 0 ? "#5e5e5e" : "#ffffff",
                    }}
                />
            </Button>
        ) : null
    );
};

export default BtnExport;