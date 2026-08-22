import * as React from 'react';
import {
  Dialog,
  DialogPanel,
} from "@headlessui/react";
import { InputSearch } from './SearchForm';
import DatePickaSearch from '../library/dateRang/dateSearch';
import BtnSearch from './btnSearch';
import BtnReset from './btnReset';
import { useEffect, useState } from 'react';
import { exportToExcel, filterByDateRange, filterByDateRangeKeyUpdateDate, filterStartEndDate, formatDate, formatDateNoTime, formatDateTimeSec, formatDateTimeSecPlusSeven, formatNumberFourDecimal, formatNumberFourDecimalNoComma, formatNumberThreeDecimal, formatNumberThreeDecimalNoComma, formatSearchDate, formatTime, getDateRangeForApi, removeComma, toDayjs } from '@/utils/generalFormatter';
import TuneIcon from "@mui/icons-material/Tune";
import SearchInput from './searchInput';
import PaginationComponent from './globalPagination';

import TableGroupTsoHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/group/(menu)/tso/form/tableHistory';
import TableGroupShipperHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/group/(menu)/shippers/form/tableHistory';
import TableGroupOtherHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/group/(menu)/other/form/tableHistory';
import TableUserHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/users/form/tableHistory';
import TableRoleHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/roles/form/tableHistory';
import TableSystemLoginHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/userManagement/(menu)/systemLogin/form/tableHistory';
import TableTablePathMgnHistory from '@/app/[lng]/authorization/(menu)/booking/(menu)/pathManagement/form/tableHistory';
import ColumnVisibilityPopover from './popOverShowHideCol';
import BtnGeneral from './btnGeneral';
import TableFileSubmissionTemplateHistory from '@/app/[lng]/authorization/(menu)/planning/(menu)/planningFileSubmissionTemplate/form/tableHistory';
import TableZoneHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/zone/form/tableHistory';
import TableAreaHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/area/form/tableHistory';
import TableContractPointHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/contractPoint/form/tableHistory';
import TableNonTpaPointHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/nonTpaPoint/form/tableHistory';
import TableMeteredPointHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/meteredPoint/form/tableHistory';
import TableConceptPointHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/conceptPoint/form/tableHistory';
import TableNomiDeadHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/nominationDeadline/form/tableHistory';
import TablePlanDeadHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/planningDeadline/form/tableHistory';
import TableAnnouncementHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/uxui/(menu)/announcement/form/tableHistory';
import TableSystemParamHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/systemParameter/form/tableHistory';
import TableEmailNotiMgnHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/emailNotiManage/form/tableHistory';
import TableUserGuideHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/uxui/(menu)/userGuide/form/tableHistory';
import TableTermAndCondiHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/uxui/(menu)/termAndCondition/form/tableHistory';
import TableBookingTemplateHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/capacityRightTemplate/form/tableHistory';
import TableMeteringCheckingCondiHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/uxui/(menu)/meteringCheckingCondition/form/tableHistory';
import TableConfigModeZoneBaseInvenHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/configModeZoneBaseInven/form/tableHistory';
import TableEmailGroupForEventHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/emailGroupForEvent/form/tableHistory';
import TableNomUploadTemplateForShipperHistory from '@/app/[lng]/authorization/(menu)/nominations/(menu)/uploadTemplateForShipper/form/tableHistory';
import TableNomPointHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/masterData/(menu)/nominationPoint/form/tableHistory';
import TableAllocationMGNHistory from '@/app/[lng]/authorization/(menu)/allocation/(menu)/alloManage/form/tableHistory';
import TableAllocationHistory from '@/app/[lng]/authorization/(menu)/allocation/(menu)/allocationReview/form/tableHistory';
import { useFetchMasters } from '@/hook/fetchMaster';
import TableBalIntradayAccImbalanceInventoryAdjustHistory from '@/app/[lng]/authorization/(menu)/balancing/(menu)/balAdjust/(menu)/intradayAccImbalanceInventoryAdjust/form/tableHistory';
import TableBalAdjustmentAccImbalanceHistory from '@/app/[lng]/authorization/(menu)/balancing/(menu)/balAdjust/(menu)/adjustAccumulatedImbalance/form/tableHistory';
import TableBalAdjustmentDailyImbalanceHistory from '@/app/[lng]/authorization/(menu)/balancing/(menu)/balAdjust/(menu)/adjustmentDailyImbalance/form/tableHistory';
import TableVentCommissioningOtherGasHistory from '@/app/[lng]/authorization/(menu)/balancing/(menu)/ventCommissioningOtherGas/form/tableHistory';
import TableBalOperateAndInstruct from '@/app/[lng]/authorization/(menu)/balancing/(menu)/balOperateFlowAndInstructedFlow/form/tableHistory';
import TableHvOperateFlowHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/systemConfiguration/(menu)/hvOperationFlow/form/tableHistory';
import TableTariffCreditDebitNoteHistory from '@/app/[lng]/authorization/(menu)/tariff/(menu)/TariffCreditDebitNote/form/tableHistory';
import TableCapPublicRemarkHistory from '@/app/[lng]/authorization/(menu)/dam/(menu)/parameters/(menu)/uxui/(menu)/capacityPublicRemarks/form/tableHistory';

interface ModalHistoryProps {
  open: boolean;
  handleClose: () => void;
  title?: string;
  description?: any;
  tableType?: any
  data?: any;
  head_data?: any;
  stat?: string;
  initialColumns?: any
  userPermission?: any;
}

const ModalHistory: React.FC<ModalHistoryProps> = ({ open, handleClose, title, data, tableType, head_data, initialColumns, description, stat = "success", userPermission }) => {

  // ############### REDUX DATA ###############
  const { allocationStatusMaster } = useFetchMasters();

  // #region field search
  // ############### FIELD SEARCH ###############
  const [filteredDataTable, setFilteredDataTable] = useState<any>(data);
  const [srchStartDate, setSrchStartDate] = useState<Date | null>(null);
  const [srchEndDate, setSrchEndDate] = useState<Date | null>(null);
  const [srchUpdateDate, setSrchUpdateDate] = useState<Date | null>(null);
  const [srchGasDayFrom, setSrchGasDayFrom] = useState<Date | null>(null);
  const [srchGasDayTo, setSrchGasDayTo] = useState<Date | null>(null);

  // user mgn
  const [srchType, setSrchType] = useState('');
  const [srchLginMode, setSrchLginMode] = useState('');

  const [key, setKey] = useState(0);

  const handleFieldSearch = () => {

    switch (tableType) {
      case 'bal-vent-commissioning-other':
        let result_gasday_from_to: any = data
        if (srchGasDayFrom || srchGasDayTo) {
          const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
          result_gasday_from_to = filterByDateRange(data, start_date, end_date);
        }
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_gasday_from_to);
        break;
      case 'nomination-point':
        let result_update_from_to: any = data

        if (srchGasDayFrom || srchGasDayTo) {
          const { start_date, end_date } = getDateRangeForApi(srchGasDayFrom, srchGasDayTo);
          result_update_from_to = filterByDateRangeKeyUpdateDate(data, start_date, end_date);
        }
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_update_from_to);
        break;
      case 'allocation-management':
        let data_alloc_mgn_filter: any = data
        const res_alloc_mgn_filter = data_alloc_mgn_filter.filter((item: any) => {
          return (
            (srchLginMode ? item?.allocation_status?.id.toString() === srchLginMode : true)
          );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(res_alloc_mgn_filter);
        break;

      case 'allocation-review':

        let data_alloc_review_filter: any = data
        const res_alloc_review_filter = data_alloc_review_filter.filter((item: any) => {
          return (
            (srchLginMode ? item?.allocation_status?.id.toString() === srchLginMode : true)
          );
        });
        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(res_alloc_review_filter);
        break;

      case 'hv-operation-flow':
        let dataLoad: any = data;

        const resultHV = dataLoad?.filter((item: any) => {
          return (
            (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true)
          );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(resultHV);
        break;

      case 'config-mode-zone-base-inventory':
        let data_config_mode_zone_base: any = data;
        const result_config_mode_zone_base = data_config_mode_zone_base?.filter((item: any) => {
          return (
            (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true)
          );
        });

        setCurrentPage(1); // ตอน filter กลับไปหน้าแรก
        setFilteredDataTable(result_config_mode_zone_base);
        break;
      default:
        // filter start_date, end_date ตามเงื่อนไขพิศดาร
        const res_filtered_date: any = filterStartEndDate(data, srchStartDate, srchEndDate);

        // const result = data.filter((item: any) => {
        const result = res_filtered_date.filter((item: any) => {
          const account = Array.isArray(item?.account_manage) && item.account_manage.length > 0 ? item.account_manage[0] : null;

          return (
            // (srchLogId ? item?.id == srchLogId : true) &&
            // (srchAuditLogModuel ? item?.module == srchAuditLogModuel : true) &&
            // (srchAuditLogModuel ? item?.module.toLowerCase().includes(srchAuditLogModuel.toLowerCase()) : true) &&
            // (srchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(srchStartDate) : true) &&
            // (srchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(srchEndDate) : true) &&
            // (srchType !== '' ? item?.account_manage[0]?.user_type_id.toString() == srchType : true) &&
            // (srchLginMode !== '' ? item?.account_manage[0]?.mode_account?.id == srchLginMode : true)
            (srchType !== '' ? account?.user_type_id?.toString() == srchType : true) &&
            (srchLginMode !== '' ? account?.mode_account?.id == srchLginMode : true)

          );
        });
        setFilteredDataTable(result);

        break;
    }
  };

  // เฉพาะ System login search เฉพาะ Update date
  const handlefindUpdate = () => {
    const result = data.filter((item: any) => {
      return (srchUpdateDate ? formatSearchDate(item?.update_date) === formatSearchDate(srchUpdateDate) : true);
    });
    setFilteredDataTable(result);
  };

  const handleReset = () => {
    // setSrchLogId('')
    // setSrchAuditLogModule('')
    setSrchStartDate(null);
    setSrchEndDate(null);
    setSrchGasDayFrom(null);
    setSrchGasDayTo(null);
    setSrchType('')
    setSrchLginMode('')
    setSrchStartDate(null);
    setFilteredDataTable(data);
    setKey((prevKey) => prevKey + 1);
  };

  // #region like search
  // ############### LIKE SEARCH ###############
  const handleSearch = (query: string) => {

    const filtered = data?.filter(
      (item: any) => {
        const queryLower = query.toLowerCase().replace(/\s+/g, '')?.trim();
        // booking template
        const filePeriodModeMap: Record<string, number> = {
          mo: 2, // Matches "mo", "mon", "mont", "month"
          da: 1, // Matches "da", "day"
          ye: 3, // Matches "ye", "year"
        };

        // booking template
        const fileStartModeMap: Record<string, number> = {
          ev: 1, // Matches Every Day
          fi: 2, // Matches Fix Day 1 Day
        };

        // for System Configuration search file rescurring start date
        if (
          queryLower.includes('everyday') ||
          queryLower.includes('fixdate') ||
          queryLower.includes('today+')
        ) {
          const modeString = (
            item?.file_start_date_mode == 1
              ? 'everyday'
              : item?.file_start_date_mode == 2
                ? `fixdate${item?.fixdayday}`
                : `today+${item?.todayday}day`
          ).replace(/\s+/g, '').toLowerCase().trim();

          return modeString.includes(queryLower);
        }

        // booking template กรองหา file period
        for (const [prefix, mode] of Object.entries(filePeriodModeMap)) {
          if (queryLower.startsWith(prefix) && item?.file_period_mode === mode) {
            return true;
          }
        }

        // booking template กรองหา file recurring start date
        for (const [prefix, mode] of Object.entries(fileStartModeMap)) {
          if (queryLower.startsWith(prefix) && item?.file_start_date_mode == mode) {
            return true;
          }
        }

        // ใช้หา active, inactive
        const filterStat: Record<string, any> = {
          ina: false, // Matches "inactive"
          ac: true, // Matches "active"
        };

        for (const [prefix, mode] of Object.entries(filterStat)) {
          if (queryLower.startsWith(prefix) && item?.status == mode) {
            return true;
          }
        }

        // balance operation flow and instructed flow
        let flow_type = ""
        switch (item?.level) {
          case "OFO":
            // flow_type = "OPERATION FLOW"
            flow_type = "OPERATION FLOW ORDER"
            break;
          case "DD":
            // flow_type = "DIFFICULT DAY FLOW"
            flow_type = "DIFFICULT DAY"
            break;
          case "IF":
            flow_type = "INSTRUCTED FLOW"
            break;
        }

        let val_to_string = item?.value?.toString();
        return (
          item?.hv_type?.type?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.metering_point?.metered_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          // item?.value?.replace(/\s+/g, '')?.toLowerCase()?.trim()?.includes(queryLower) || //for original filter data example 1200000
          // removeComma(item?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for remove comma example 1,200,000
          // formatNumberThreeDecimal(item?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1,200.000
          // formatNumberThreeDecimalNoComma(item?.value)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1200.000
          val_to_string?.replace(/\s+/g, '')?.toLowerCase()?.trim()?.includes(queryLower) || //for original filter data example 1200000
          removeComma(val_to_string)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for remove comma example 1,200,000
          formatNumberThreeDecimal(val_to_string)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1,200.000
          formatNumberThreeDecimalNoComma(val_to_string)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || //for make full value example 1200.000

          item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.document_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.file?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.bank_no?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.email?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.company_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.first_name && item?.last_name && (item?.first_name + item?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
          item?.address?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.telephone?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.user_id?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          formatDateNoTime(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatDate(item?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatDateTimeSec(item?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatTime(item?.create_date)?.toLowerCase().includes(queryLower.trim()) ||
          formatDateTimeSecPlusSeven(item?.create_date)?.toLowerCase().includes(queryLower.trim()) ||

          formatDateNoTime(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatDate(item?.update_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatDateTimeSec(item?.update_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatDateNoTime(item?.update_date)?.toLowerCase().trim().includes(queryLower) ||
          formatTime(item?.update_date)?.toLowerCase().includes(queryLower.trim()) ||
          formatDateTimeSecPlusSeven(item?.update_date)?.toLowerCase().includes(queryLower.trim()) ||

          formatDateNoTime(item?.start_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatDateNoTime(item?.end_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

          // formatDateTimeSec(item?.start_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          // formatDateTimeSec(item?.end_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

          toDayjs(item?.gas_day).format("DD/MM/YYYY")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.east?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.west?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.east)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.west)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          formatTime(item?.contract_point_start_date)?.toLowerCase().includes(queryLower) ||
          formatDate(item?.contract_point_start_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatTime(item?.contract_point_end_date)?.toLowerCase().includes(queryLower) ||
          formatDate(item?.contract_point_end_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||

          query.length !== 0 && item?.system_login_account?.length == (Number(queryLower)) ||
          item?.detail?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.concept_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.type_concept_point?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.description?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.remark?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.entry_exit?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.supply_reference_quality_area_by?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.area?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.zone?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.contract_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.contract_point?.contract_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.account_manage?.[0]?.group?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.account_manage?.[0]?.division?.division_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.role_default?.[0]?.role?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.mode_account?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.role?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.user_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.day?.toString().includes(queryLower) ||
          item?.before_month?.toString().includes(queryLower) ||
          item?.non_tpa_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          (typeof item?.nomination_point === 'string' ? item.nomination_point.replace(/\s+/g, '').toLowerCase().trim() : '').includes(queryLower) ||
          item?.nomination_point?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.maximum_capacity?.toString().includes(queryLower) ||
          item?.shadow_time?.toString().includes(queryLower) ||
          item?.min?.toString().includes(queryLower) ||
          item?.max?.toString().includes(queryLower) ||
          item?.hour?.toString().includes(queryLower) ||
          item?.shadow_time?.toString().includes(queryLower) ||
          item?.term_type?.name.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          item?.before_month?.toString().includes(queryLower) ||
          item?.area_nominal_capacity?.toString().includes(queryLower) ||
          formatNumberThreeDecimal(item?.area_nominal_capacity)?.toString().includes(queryLower) ||
          item?.topic?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.customer_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.url?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          ((item?.hour?.toString().padStart(2, '0') + ":" + item?.minute?.toString().padStart(2, '0'))?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||


          // alloc review && alloc mgn
          item?.allocation_status?.name?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.systemAllocation?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.previousAllocationTPAforReview?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.shipper_allocation_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.nominationValue?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.intradaySystem?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.allocation_management_shipper_review && item?.allocation_management_shipper_review?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.systemAllocation)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.previousAllocationTPAforReview)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.shipper_allocation_review)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.nominationValue)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.intradaySystem)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.allocation_management_shipper_review && formatNumberFourDecimal(item?.allocation_management_shipper_review[0]?.shipper_allocation_review)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.systemAllocation)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.previousAllocationTPAforReview)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.shipper_allocation_review)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.nominationValue)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.intradaySystem)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.allocation_management_shipper_review && formatNumberFourDecimalNoComma(item?.allocation_management_shipper_review[0]?.shipper_allocation_review)?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          // (item?.create?.create_by?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          // (item?.create?.create_by?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
          // (item?.create?.create_by?.first_name && item?.create?.create_by?.last_name && (item?.create?.create_by?.first_name + item?.create?.create_by?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน
          ((columnVisibility.updated_by || columnVisibility.update_by) && item?.create?.create_by?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          ((columnVisibility.updated_by || columnVisibility.update_by) && item?.create?.create_by?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
          ((columnVisibility.updated_by || columnVisibility.update_by) && item?.create?.create_by?.first_name && item?.create?.create_by?.last_name && (item?.create?.create_by?.first_name + item?.create?.create_by?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

          formatDateNoTime(item?.create?.create_date)?.replace(/\s+/g, '').toLowerCase().includes(queryLower) ||
          formatDate(item?.create?.create_date)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||



          // adjust daily imbalance & adjust accumulate imbalance
          item?.adjust_imbalance?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.adjust_imbalance)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.adjust_imbalance)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.dailyAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.dailyAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.dailyAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.finalDailyAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.finalDailyAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.finalDailyAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.intradayAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.intradayAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.intradayAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.finalIntradayAccIm?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.finalIntradayAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.finalIntradayAccIm)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          // balancing vent/commissioning/other gas
          item?.gas_day_text?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatDateNoTime(item?.gas_day_text)?.replace(/\s+/g, '').toLowerCase().trim().includes(query.replace(/\s+/g, '')?.toLowerCase().trim()) ||
          item?.vent_gas_value_mmbtud?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.commissioning_gas_value_mmbtud?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.other_gas_value_mmbtud?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||


          // balance operation flow and instructed flow
          item?.accImb_or_accImbInv?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.accImb_or_accImbInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.accImb_or_accImbInv)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.accMargin?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.accMargin)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.accMargin)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.energyAdjust?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.energyAdjust)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.energyAdjust)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.energyAdjustRate_mmbtuh?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.energyAdjustRate_mmbtuh)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.energyAdjustRate_mmbtuh)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.energyAdjustRate_mmbtud?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.energyAdjustRate_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.energyAdjustRate_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.volumeAdjust?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.volumeAdjust)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.volumeAdjust)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.volumeAdjustRate_mmscfh?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.volumeAdjustRate_mmscfh)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.volumeAdjustRate_mmscfh)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.volumeAdjustRate_mmscfd?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.volumeAdjustRate_mmscfd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.volumeAdjustRate_mmscfd)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.resolveHour?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.heatingValue?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.heatingValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.heatingValue)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          flow_type?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          // config mode/zone base inven
          item?.mode?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          // tariff credit debit note
          item?.cndn_id?.toString().replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||


          formatNumberFourDecimal(item?.vent_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.commissioning_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimal(item?.other_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          formatNumberFourDecimalNoComma(item?.vent_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.commissioning_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          formatNumberFourDecimalNoComma(item?.other_gas_value_mmbtud)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||

          // item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          // item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search นามสกุล
          // item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

          ((columnVisibility.updated_by || columnVisibility.update_by) && item?.update_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          ((columnVisibility.updated_by || columnVisibility.update_by) && item?.update_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
          ((columnVisibility.updated_by || columnVisibility.update_by) && item?.update_by_account?.first_name && item?.update_by_account?.last_name && (item?.update_by_account?.first_name + item?.update_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

          ((columnVisibility.created_by || columnVisibility.create_by) && item?.create_by_account?.first_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) ||
          ((columnVisibility.created_by || columnVisibility.create_by) && item?.create_by_account?.last_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search นามสกุล
          ((columnVisibility.created_by || columnVisibility.create_by) && item?.create_by_account?.first_name && item?.create_by_account?.last_name && (item?.create_by_account?.first_name + item?.create_by_account?.last_name)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower)) || // เผื่อ search ชื่อ - นามสกุล พร้อมกัน

          (item?.mode_account?.name + " Mode")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||  // ใช้ใน login mgn tools
          // 1 == SSO 2 == Local
          item?.process_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.nomination_type?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          (item?.nomination_type?.name + " Nomination")?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          item?.metered_point_name?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) ||
          (item?.file_start_date_mode == 1 ? ('Every Day')?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) : item?.file_start_date_mode == 2 ? (`Fix Date ${item?.fixdayday}`)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower) : (`Today + ${item?.todayday} Day`)?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower))
        )
      });

    setFilteredDataTable(filtered);
  };

  // ############### PAGINATION ###############
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedData, setPaginatedData] = useState<any[]>([]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (filteredDataTable?.length > 0) {
      setPaginatedData(filteredDataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
      // setPaginatedData(filteredDataTable)
    } else {
      setPaginatedData([])
    }
  }, [filteredDataTable, currentPage, itemsPerPage])

  // ############### COLUMN SHOW/HIDE ###############
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openPopOver = Boolean(anchorEl);
  const id = openPopOver ? 'column-toggle-popover' : undefined;

  const [columnVisibility, setColumnVisibility] = useState<any>(
    initialColumns ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])) : {}
  );

  const handleColumnToggle = (columnKey: string) => {
    setColumnVisibility((prev: any) => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  const gnrFirstLog: any = (logDT: any) => {
    let gnrData = logDT;

    if (gnrData) {
      const lastElement = gnrData?.length - 1;
      if (!gnrData[lastElement]?.update_by_account && gnrData?.length >= 2) {
        gnrData[lastElement].update_by_account = gnrData[lastElement]?.create_by_account
        gnrData[lastElement].update_date = gnrData[lastElement]?.create_date
      }

      return gnrData
    }

    return []
  }

  useEffect(() => {
    setFilteredDataTable(gnrFirstLog(data))
    setColumnVisibility(initialColumns ? Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible])) : {})
  }, [data])


  // #region render table
  const renderTable = (tableType: any, dataTable?: any) => {

    switch (tableType) {
      case "zone":
        return <TableZoneHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "area":
        return <TableAreaHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "contract-point":
        return <TableContractPointHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "nomination-point":
        return <TableNomPointHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "non-tpa-point":
        return <TableNonTpaPointHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "metering-point":
        return <TableMeteredPointHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "concept-point":
        return <TableConceptPointHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "group-2":
        return <TableGroupTsoHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "group-3":
        return <TableGroupShipperHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "group-4":
        return <TableGroupOtherHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "account":
        return <TableUserHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "role-master":
        return <TableRoleHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "system-login":
        return <TableSystemLoginHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "nomination-deadline":
        return <TableNomiDeadHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "planning-deadline":
        return <TablePlanDeadHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "announcement":
        return <TableAnnouncementHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "system-parameter":
        return <TableSystemParamHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "email-notification-management":
        return <TableEmailNotiMgnHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "user-guide":
        return <TableUserGuideHistory tableData={dataTable} columnVisibility={columnVisibility} userPermission={userPermission} />;
      case "term-and-condition":
        return <TableTermAndCondiHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "capacity-publication-remark":
        return <TableCapPublicRemarkHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "booking-template":
        return <TableBookingTemplateHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "checking-condition":
        return <TableMeteringCheckingCondiHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "config-mode-zone-base-inventory":
        return <TableConfigModeZoneBaseInvenHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "email-group-for-event":
        return <TableEmailGroupForEventHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "path-management":
        return <TableTablePathMgnHistory tableData={dataTable} />;
      case "planning-file-submission-template":
        return <TableFileSubmissionTemplateHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "nom-upload-template-for-shipper":
        return <TableNomUploadTemplateForShipperHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "allocation-management":
        return <TableAllocationMGNHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "allocation-review":
        return <TableAllocationHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "intraday-acc-bal-inventory-adjust":
        return <TableBalIntradayAccImbalanceInventoryAdjustHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "adjustment-acc-imbalance":
        return <TableBalAdjustmentAccImbalanceHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "adjustment-daily-imbalance":
        return <TableBalAdjustmentDailyImbalanceHistory tableData={dataTable} columnVisibility={columnVisibility} />;
      case "bal-vent-commissioning-other":
        return <TableVentCommissioningOtherGasHistory tableData={dataTable} columnVisibility={columnVisibility} userPermission={userPermission} />;
      case "bal-operate-and-instruct":
        return <TableBalOperateAndInstruct tableData={dataTable} columnVisibility={columnVisibility} userPermission={userPermission} />;
      case "hv-operation-flow":
        return <TableHvOperateFlowHistory tableData={dataTable} columnVisibility={columnVisibility} userPermission={userPermission} />;
      case "tariff-credit-debit-note":
        return <TableTariffCreditDebitNoteHistory tableData={dataTable} columnVisibility={columnVisibility} userPermission={userPermission} />;

      // case "contract-point":
      //   return <TableContractPointHistory tableData={paginatedData} />;
      default:
        return <div>No table available</div>;
    }
  };

  // #region ไม่แสดง filter start, end
  // ถ้ามีชื่อในนี้ ไม่แสดง filter start, end
  const disPlayStartEnd = [
    'bal-operate-and-instruct',
    'nomination-point',
    'user-guide',
    'nom-upload-template-for-shipper',
    'allocation-review',
    'allocation-management',
    'intraday-acc-bal-inventory-adjust',
    'adjustment-acc-imbalance',
    'adjustment-daily-imbalance',
    'bal-vent-commissioning-other',
    'config-mode-zone-base-inventory',
    'hv-operation-flow',
    'tariff-credit-debit-note'
  ]

  return (
    <>
      <Dialog open={open} onClose={handleClose} className="relative z-20">
        <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" />
        <div className="fixed inset-0 z-10 flex items-center justify-center">
          <DialogPanel
            transition
            className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className="flex flex-col items-center gap-2 p-9 w-[calc(100vw-100px)] h-[calc(100vh-80px)]">
              <div className="w-full">
                <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{title}</h2>
                <div className='mb-4 w-full flex items-center'>

                  {/* เดิม  calc(100% - ${8 - head_data?.length}0%)*/}
                  <div className={`relative`} style={{ width: head_data?.length >= 2 ? `calc(100% - ${(head_data?.length >= 5 ? 8 : 9) - head_data?.length}0%)` : '100%' }}>

                    {/* สำหรับ alloc manage โดยเฉพาะ */}
                    {
                      tableType !== 'allocation-management' ?
                        <div
                          className='grid text-sm gap-x-[20px] gap-y-[10px]'
                          style={{
                            // gridTemplateColumns:
                            //   head_data?.length == 1
                            //     ? "100%"
                            //     : head_data?.length == 2
                            //       ? "40% 40%"
                            //       : head_data?.length == 3
                            //         ? "33.3% 33.3% 33.3%"
                            //         : head_data?.length == 4
                            //           ? "25% 25% 25% 25%"
                            //           : "100%"
                            gridTemplateColumns:
                              head_data?.length === 1
                                ? "100%"
                                : head_data?.length === 2
                                  ? "40% 40%"
                                  : head_data?.length === 3
                                    ? "33.3% 33.3% 33.3%"
                                    : head_data?.length === 4
                                      ? "20% 20% 20% 20%"
                                      : head_data?.length === 5
                                        ? "20% 20% 20% 20% 20%"
                                        : "100%",
                          }}
                        >
                          {/* TITLE */}
                          {tableType == "group-3" ? (
                            head_data && head_data.length > 0 ? (head_data[0]?.title || "") : ("No Data Available")
                          ) : (
                            head_data?.map((item: any, index: number) => (<div className='w-full text-[#000000B2]' key={index}><span className='font-bold'>{item?.title || ""}</span></div>)) || "No Data Available"
                          )}

                          {/* VALUE */}
                          {tableType == "group-3" ? (
                            head_data && head_data.length > 0 ? (head_data[0]?.value || "") : ("No Data Available")
                          ) : (
                            head_data?.map((item: any, index: number) => (<div className=' w-full text-[#58585A]' key={index}><span>{item?.value || ""}</span></div>)) || "No Data Available"
                          )}

                        </div>
                        :
                        <div
                          className='grid text-sm gap-x-[20px] gap-y-[10px]'
                          style={{
                            gridTemplateColumns:
                              head_data?.length === 1
                                ? "100%"
                                : head_data?.length === 2
                                  ? "40% 40%"
                                  : head_data?.length === 3
                                    ? "33.3% 33.3% 33.3%"
                                    : head_data?.length === 4
                                      ? "25% 25% 25% 25%"
                                      : head_data?.length === 5
                                        ? "14% 13% 15% 30% 20%"
                                        : "100%",
                          }}
                        >
                          {/* TITLE */}
                          {tableType == "group-3" ? (
                            head_data && head_data.length > 0 ? (head_data[0]?.title || "") : ("No Data Available")
                          ) : (
                            head_data?.map((item: any, index: number) => (<div className='w-full text-[#000000B2]' key={index}><span className='font-bold'>{item?.title || ""}</span></div>)) || "No Data Available"
                          )}

                          {/* VALUE */}
                          {tableType == "group-3" ? (
                            head_data && head_data.length > 0 ? (head_data[0]?.value || "") : ("No Data Available")
                          ) : (
                            head_data?.map((item: any, index: number) => (<div className=' w-full text-[#58585A]' key={index}><span>{item?.value || ""}</span></div>)) || "No Data Available"
                          )}

                        </div>
                    }

                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full pt-2">
                <aside className="flex flex-wrap sm:flex-row gap-2 w-full">
                  {
                    tableType == 'system-login' ?
                      <>
                        <DatePickaSearch
                          key={"update" + key}
                          label="Date"
                          placeHolder="Select Date"
                          allowClear
                          onChange={(e: any) => setSrchUpdateDate(e ? e : null)}
                        />
                        <BtnSearch handleFieldSearch={handlefindUpdate} />
                        <BtnReset handleReset={handleReset} />
                      </>
                      :
                      <>
                        {
                          // Group (2 = TSO, 3 = Shipper, 4 = Other)
                          tableType == 'account' && <InputSearch
                            id="searchType"
                            label="Users Type"
                            type="select"
                            value={srchType}
                            onChange={(e) => setSrchType(e.target.value)}
                            options={[
                              { value: "2", label: "TSO" },
                              { value: "3", label: "Shipper" },
                              { value: "4", label: "Other" },
                            ]}
                            placeholder="Select User Type"
                          />
                        }

                        {
                          !disPlayStartEnd.includes(tableType) && (
                            <>
                              <DatePickaSearch
                                key={"start" + key}
                                label="Start Date"
                                placeHolder="Select Start Date"
                                allowClear
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                              />

                              <DatePickaSearch
                                key={"end" + key}
                                label="End Date"
                                placeHolder="Select End Date"
                                allowClear
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                              />
                            </>
                          )
                        }

                        {
                          tableType == 'hv-operation-flow' &&
                          <>
                            <DatePickaSearch
                              key={"start" + key}
                              label="Start Date"
                              placeHolder="Select Start Date"
                              allowClear
                              onChange={(e: any) => setSrchStartDate(e ? e : null)}
                              disabledTooltipInfo={false}
                            />

                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                          </>
                        }

                        {
                          tableType == 'nomination-point' && (
                            <>
                              <DatePickaSearch
                                key={"start" + key}
                                label="Update Date From"
                                placeHolder="Select Update Date From"
                                allowClear
                                onChange={(e: any) => setSrchStartDate(e ? e : null)}
                              />

                              <DatePickaSearch
                                key={"end" + key}
                                label="Update Date To"
                                placeHolder="Select Update Date To"
                                allowClear
                                onChange={(e: any) => setSrchEndDate(e ? e : null)}
                              />

                              <BtnSearch handleFieldSearch={handleFieldSearch} />
                              <BtnReset handleReset={handleReset} />

                            </>
                          )
                        }

                        {
                          tableType == 'account' && <InputSearch
                            id="searchLginMode"
                            label="Login Mode"
                            type="select"
                            value={srchLginMode}
                            onChange={(e) => setSrchLginMode(e.target.value)}
                            options={[
                              { value: "1", label: "SSO" },
                              { value: "2", label: "LOCAL" },
                            ]}
                            placeholder="Select Login Mode"
                          />
                        }

                        {
                          (tableType == 'allocation-review' || tableType == 'allocation-management') && <><InputSearch
                            id="searchStat"
                            label="Status"
                            type="select"
                            value={srchLginMode}
                            onChange={(e) => setSrchLginMode(e.target.value)}
                            options={allocationStatusMaster?.data?.map((item: any) => ({
                              value: item?.id?.toString(),
                              label: item.name
                            }))}
                            placeholder="Select Status"
                          />
                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                          </>
                        }

                        {
                          tableType == 'bal-vent-commissioning-other' && <>
                            {/* <DatePickaSearch
                              key={"gas_day_from" + key}
                              label="Gas Day From"
                              placeHolder="Select Gas Day From"
                              allowClear
                              onChange={(e: any) => setSrchGasDayFrom(e ? e : null)}
                              customWidth={200}
                            />

                            <DatePickaSearch
                              key={"gas_day_to" + key}
                              label="Gas Day To"
                              placeHolder="Select Gas Day To"
                              allowClear
                              onChange={(e: any) => setSrchGasDayTo(e ? e : null)}
                              customWidth={200}
                            />

                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} /> */}
                          </>
                        }

                        {
                          tableType == 'config-mode-zone-base-inventory' && <>
                            <DatePickaSearch
                              key={"start" + key}
                              label="Start Date "
                              placeHolder="Select Start Date "
                              allowClear
                              onChange={(e: any) => setSrchStartDate(e ? e : null)}
                            />

                            <BtnSearch handleFieldSearch={handleFieldSearch} />
                            <BtnReset handleReset={handleReset} />
                          </>
                        }

                        {
                          !disPlayStartEnd.includes(tableType) && (
                            <>
                              <BtnSearch handleFieldSearch={handleFieldSearch} />
                              <BtnReset handleReset={handleReset} />
                            </>
                          )
                        }
                      </>
                  }
                </aside>
              </div>

              <div className=" w-full pt-2">
                <div>
                  <div className="text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
                    <div onClick={handleTogglePopover}>
                      <TuneIcon
                        className="cursor-pointer rounded-lg"
                        style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      <SearchInput onSearch={handleSearch} />
                      <BtnGeneral
                        bgcolor={"#24AB6A"}
                        modeIcon={'export'}
                        textRender={"Export"}
                        generalFunc={() =>
                          // exportToExcel(paginatedData, tableType, columnVisibility)
                          exportToExcel(paginatedData, tableType, columnVisibility, head_data)
                        }
                        can_export={userPermission ? userPermission?.f_export : false}
                      />
                    </div>
                  </div>
                </div>
                {renderTable(tableType, paginatedData)}

              </div>

              <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />

              <div className="relative w-full pt-10">
                <button onClick={handleClose} className="absolute bottom-0 right-0 w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600 tracking-[1px]">
                  {'Close'}
                </button>
              </div>

            </div>
          </DialogPanel>
        </div >
      </Dialog >

      <ColumnVisibilityPopover
        open={openPopOver}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        columnVisibility={columnVisibility}
        handleColumnToggle={handleColumnToggle}
        initialColumns={initialColumns}
      />
    </>
  );
};

export default ModalHistory;