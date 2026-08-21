import {format, addMonths, addYears, addDays, differenceInMonths, differenceInYears} from 'date-fns'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'
import XLSXStyle from 'xlsx-js-style'
import {setCookie} from './cookie'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import {
  transformAlloManage,
  transformAllocationReport,
  transformAllocationReview,
  transformAllocationShipperReportDownload,
  transformAnnouncement,
  transformArea,
  transformBalanceAdjustAccumulateImbalance,
  transformBalanceAdjustDailyImbalance,
  transformBalanceOperationFlowAndInstructedFlow,
  transformBookingTemplate,
  transformCapaPublicRemark,
  transformChartArea,
  transformConceptPoint,
  transformConceptPointLimit,
  transformConfigModeZoneBaseInventory,
  transformContractPoint,
  transformContractPointModalView,
  transformCurtailmentAlloc,
  transformDailyAdjust,
  transformDailyAdjust2ForTable2,
  transformDailyAdjustTabDetail,
  transformEmailNotificationManagement,
  transformEventEmergencyDiffDay,
  transformEventOfIf,
  transformEventOffspecGas,
  transformGroupOthers,
  transformGroupShippers,
  transformGroupTSO,
  transformHvOperationFlow,
  transformIntradayAccImbalInvenAdjust,
  transformIntradayBaseInventory,
  transformIntradayBaseInventoryShipper,
  transformKeys,
  transformLoginTracking,
  transformMeteringCheckingCondition,
  transformMeteringManagement,
  transformMeteringPoint,
  transformMinimumTabDaily,
  transformMinimumTabDailyKeys,
  transformNomUploadTemplateForShipper,
  transformNominationDeadline,
  transformNominationPoint,
  transformNonTpaPoint,
  transformPathConfig,
  transformPlanningDeadLine,
  transformPlanningFileSubmissionTemplate,
  transformReleaseSubmission,
  transformReserveBalGasContractView,
  transformRoleMgn,
  transformShipperNomReport,
  transformShipperNomReportDetail,
  transformShipperNomReportTabWeekly,
  transformShipperNomReportTabZero,
  transformShipperNomReportView,
  transformSumNomReportWeeklyAreaImbal,
  transformSumNomReportWeeklyAreaMmbtu,
  transformSystemLogin,
  transformSystemParameter,
  transformTariffCrDrNoteHistory,
  transformTariffCrDrNoteView,
  transformTariffDetailPage,
  transformTariffDetailPageKeys,
  transformTermCondition,
  transformUser,
  transformUserGuide,
  transformVentCommissioningOtherGas,
  transformZone
} from './transformHistoryData'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import weekday from 'dayjs/plugin/weekday'
import {exportMinimumTabAllAndDaily} from './exportFuncWithStyle'
import {toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {getService, getServiceArrayBuffer} from './postService'
import {exportTariffCreditDebitNoteView} from './exportTariffCNDNView'
import {exportDailyAdjustReportTabTotal} from './exportDailyAdjustReportTotal'
import {exportMinInventoryWeekly} from './exportMinimumInventoryWeek'

import ExcelJS from 'exceljs'
import {saveAs} from 'file-saver'
import {exportAccImbalanceReportStyled} from './exportBalAccImbalanceAdjust'

const ALLOWED_IP_LIST = process.env.NEXT_PUBLIC_ALLOW_IP

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isBetween) // Extend Day.js with isBetween plugin
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)
dayjs.extend(weekday)
dayjs.tz.setDefault('Asia/Bangkok')

// export const iconButtonClass = "group relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#DFE4EA] bg-white/70 backdrop-blur text-[#1473A1] transition-all duration-200 ease-out hover:bg-[#1473A1] hover:text-white hover:shadow-lg hover:shadow-[#1473A1]/30 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1473A1] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border-[#E2E8F0] disabled:shadow-none disabled:backdrop-blur-0 disabled:hover:bg-[#F1F5F9] disabled:hover:text-[#94A3B8] disabled:hover:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none";

// อันนี้ดี
// export const iconButtonClass = "group relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#DFE4EA] bg-white/70  text-[#1473A1]  hover:bg-[#1473A1] hover:text-white hover:shadow-lg hover:shadow-[#1473A1]/30  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1473A1] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border-[#E2E8F0] disabled:shadow-none  disabled:hover:bg-[#F1F5F9] disabled:hover:text-[#94A3B8] disabled:hover:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none";

// อันนี้ก็ดี
export const iconButtonClass =
  'group relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#DFE4EA] bg-white/70  text-[#1473A1]  hover:bg-[#1473A1] hover:text-white hover:shadow-lg hover:shadow-[#1473A1]/30  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1473A1] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border-[#E2E8F0] disabled:shadow-none  disabled:hover:bg-[#F1F5F9] disabled:hover:text-[#94A3B8] disabled:hover:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none transition duration-200 ease-in-out'
export const iconButtonClassBtnGeneral =
  'group relative inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#DFE4EA] bg-white/70  text-[#000]  hover:bg-[#1473A1] hover:text-white hover:shadow-lg hover:shadow-[#1473A1]/30  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1473A1] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border-[#E2E8F0] disabled:shadow-none  disabled:hover:bg-[#F1F5F9] disabled:hover:text-[#94A3B8] disabled:hover:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none transition duration-200 ease-in-out'

const errorStatusCodes = [401, 500, 412, 403]
const color_chart = ['#A8EAFF', '#E69F00', '#823E00', '#9FD695', '#F29D7F', '#F2657D', '#3ECBC4', '#FFC43F', '#3E70FF']

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// เติม 0 ด้านซ้ายให้ครบ 4 หลัก
export const pad4 = (v: number | string) =>
  String(v ?? '')
    .replace(/\D/g, '') // ถ้ามีอักขระอื่นปน จะดึงเฉพาะตัวเลข (เอาออกได้ถ้าไม่ต้องการ)
    .padStart(4, '0')

export const defaultSwitchCase = (x: never): never => {
  throw new Error(`Unhandled case: ${x as any}`)
}

export const toastNotiError = (msg: any) => {
  toast.error(msg, {
    position: 'bottom-right',
    autoClose: 3000
  })
}

// helper: แปลงค่าเป็น number (รองรับ " 24,000.000 " หรือ "20000")
export const toNumberGeneral = (v: any): number | null => {
  if (v === null || v === undefined) return null
  if (typeof v === 'number') return isNaN(v) ? null : v
  const n = Number(String(v).replace(/,/g, '').trim())
  return isNaN(n) ? null : n
}

export const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * color_chart.length)
  return color_chart[randomIndex]
}

const getRandomColorForGroupInChart = (usedColors: Set<string>) => {
  // Get available colors (not already assigned)
  const availableColors = color_chart.filter((color) => !usedColors.has(color))

  // If all colors are used, allow repetition (fallback)
  if (availableColors.length === 0) return color_chart[Math.floor(Math.random() * color_chart.length)]

  // Pick a random available color
  const randomIndex = Math.floor(Math.random() * availableColors.length)
  return availableColors[randomIndex]
}

// sort วันที่เวลาคีย์ create_date มาไปน้อย
export const sortCreateDate = (o: any) => (o?.create_date ? Date.parse(o.create_date) : -Infinity) // ไม่มีวันที่ให้ไปท้าย

// sort key id มากไปน้อย
export const sortByIdDesc = (arr: any) => {
  const toNum = (v: any) => (v == null || Number.isNaN(Number(v)) ? -Infinity : Number(v))

  return [...arr].sort((a, b) => {
    const nb = toNum(b.id)
    const na = toNum(a.id)
    if (nb === na) return 0 // เท่ากันไม่ขยับลำดับเดิม
    return nb - na // มาก → น้อย
  })
}

// เอาไว้ยัด color ใน group หน้า chart ต่าง ๆ
export const assignColorsToGroups = (groupData?: any[]) => {
  if (!groupData || !Array.isArray(groupData)) {
    // groupData is invalid
    return []
  }

  const colorSHIPPER = [
    {
      id_name: 'NGP-S16-001',
      name: 'PTT',
      color: '#26275F'
    },
    {
      id_name: 'NGP-S17-002',
      name: 'EGAT',
      color: '#FFCA0B'
    },
    {
      id_name: 'NGP-S20-005',
      name: 'HKH',
      color: '#80BC04'
    },
    {
      id_name: 'NGP-S20-004',
      name: 'B.GRIMM',
      color: '#FF6829'
    },
    {
      id_name: 'NGP-S20-003',
      name: 'GULF',
      color: '#014A99'
    },
    //========================================
    {
      id_name: 'NGP-S21-006',
      name: 'EGGO',
      color: '#409A3C'
    },
    {
      id_name: 'NGP-S21-007',
      name: 'PTTGL',
      color: '#0BA2ED'
    },
    {
      id_name: 'NGP-S21-008',
      name: 'SCG',
      color: '#009989'
    }
  ]

  const colorMap = new Map(colorSHIPPER.map((item) => [item.id_name, item.color]))

  const groupColors: Record<number, string> = {}
  const usedColors = new Set<string>()

  groupData?.forEach((item: any) => {
    if (!item.group || !item.group.id) return

    const groupId = item.group.id
    const idName = item.group.id_name

    // ถ้า id_name ตรงกับ colorSHIPPER
    if (idName && colorMap.has(idName)) {
      const fixedColor = colorMap.get(idName)!
      groupColors[groupId] = fixedColor
      usedColors.add(fixedColor)
      item.group.color = fixedColor
      return
    }

    if (!groupColors[groupId]) {
      let newColor = getRandomColorForGroupInChart(usedColors)

      // กันกรณี สุ่มละไปชนสีกับตัวด้านบน
      while (usedColors.has(newColor)) {
        newColor = getRandomColorForGroupInChart(usedColors)
      }

      groupColors[groupId] = newColor
      usedColors.add(newColor)
    }

    item.group.color = groupColors[groupId]
  })
  return groupData
}

// เอาไว้หาว่า user มีสิทธิในเมนูนั้น ๆ หรือเปล่า
// โยน menu_name ชื่อเต็มและ userDT เข้ามา
export const findRightByMenuName = (menu_name: string, user_dt: any) => {
  const find_role_menu = user_dt?.account_manage[0]?.account_role[0]?.role?.menus_config.find((item: any) => item.menus.name == menu_name)
  if (find_role_menu) {
    return find_role_menu.b_manage
  } else {
    return false
  }
}

// เอาไว้หาว่า user มีสิทธิในเมนูนั้น ๆ หรือเปล่า
// แล้ว return เป็นสิทธิของหน้าเมนูไป
// จริง ๆ มันเหมือนอันข้างบนเลยแฮะ
export const findRoleConfigByMenuName = (menu_name: string, user_dt: any) => {
  const find_role_menu = user_dt?.account_manage[0]?.account_role[0]?.role?.menus_config.find((item: any) => item.menus.name == menu_name)
  if (find_role_menu) {
    return {
      ...find_role_menu,
      f_view: find_role_menu.f_view === 1,
      f_create: find_role_menu.f_create === 1,
      f_edit: find_role_menu.f_edit === 1,
      f_import: find_role_menu.f_import === 1,
      f_export: find_role_menu.f_export === 1,
      f_approved: find_role_menu.f_approved === 1,
      f_noti_inapp: find_role_menu.f_noti_inapp === 1,
      f_noti_email: find_role_menu.f_noti_email === 1
    }
  } else {
    return null
  }
}

export const findRoleConfigByMenuId = (menu_id: number, user_dt: any) => {
  const find_role_menu = user_dt?.account_manage[0]?.account_role[0]?.role?.menus_config.find((item: any) => item.menus.id == menu_id)
  if (find_role_menu) {
    return {
      ...find_role_menu,
      f_view: find_role_menu.f_view === 1,
      f_create: find_role_menu.f_create === 1,
      f_edit: find_role_menu.f_edit === 1,
      f_import: find_role_menu.f_import === 1,
      f_export: find_role_menu.f_export === 1,
      f_approved: find_role_menu.f_approved === 1,
      f_noti_inapp: find_role_menu.f_noti_inapp === 1,
      f_noti_email: find_role_menu.f_noti_email === 1
    }
  } else {
    return null
  }
}

// TARIFF CHARGE REPORT --> modal view
// เอาไว้หาว่า ใน group มีคำว่า ptt อยู่ป่าว
export const isHasPTT = (userDT: any): boolean => {
  // const name = userDT?.account_manage?.[0]?.group?.name;
  // return typeof name === 'string' && name.toLowerCase().includes('ptt');
  const name = userDT?.account_manage?.[0]?.group?.id_name
  return typeof name === 'string' && name.toLowerCase().includes('ngp-s16-001')
}

// caculate date หน้า bulletin board ปุ่ม period
export const calDatePeriod = (date: any, period: any, type: any, mode: any, term_type?: any) => {
  // 1 = วัน, 2 = เดือน, 3 = ปี

  // const parsedDate = dayjs(date);
  const format = 'DD/MM/YYYY'

  // date == 14/01/2025 parsedDate got Invalid
  // const parsedDate = dayjs(date);
  const parsedDate = toDayjs(date, format)

  if (mode === 'end_date') {
    if (type === 'year') {
      return parsedDate.subtract(period, 'year').format('DD/MM/YYYY')
    } else if (type === 'month') {
      return parsedDate.subtract(period, 'month').format('DD/MM/YYYY')
    } else if (type === 'day') {
      return parsedDate.subtract(period, 'day').format('DD/MM/YYYY')
    }
  } else if (mode === 'start_date') {
    switch (type) {
      case 'year':
        if (term_type?.[0].file_period_mode == 1) {
          // day
          // change period from year to day
          let cal_period = period * 365
          if (term_type?.[0].max >= cal_period) {
            return parsedDate.add(cal_period, 'day').format('DD/MM/YYYY')
          } else if (cal_period > term_type?.[0].max) {
            return parsedDate.add(term_type?.[0].max, 'day').format('DD/MM/YYYY')
          }
        } else if (term_type[0].file_period_mode == 2) {
          // month
          // period = 1 year
          // change period to month
          // Convert year to months (1 year = 12 months)
          let cal_period = period * 12
          if (term_type?.[0].max >= cal_period) {
            return parsedDate.add(cal_period, 'month').format('DD/MM/YYYY')
          } else {
            return parsedDate.add(term_type?.[0].max, 'month').format('DD/MM/YYYY')
          }
        } else if (term_type[0].file_period_mode == 3) {
          // year
          if (term_type?.[0].max >= period) {
            return parsedDate.add(period, 'year').format('DD/MM/YYYY')
          } else {
            return parsedDate.add(term_type?.[0].max, 'year').format('DD/MM/YYYY')
          }
        }

        break

      case 'day':
        if (term_type?.[0].file_period_mode == 1) {
          // day
          if (term_type?.[0].max >= period) {
            return parsedDate.add(period, 'day').format('DD/MM/YYYY')
          } else if (period > term_type?.[0].max) {
            return parsedDate.add(term_type?.[0].max, 'day').format('DD/MM/YYYY')
          }
        } else if (term_type[0].file_period_mode == 2) {
          // month
          // Convert days to months (approximate: 30 days = 1 month)
          let cal_period = Math.floor(period / 30)
          if (term_type?.[0].max >= cal_period) {
            return parsedDate.add(cal_period, 'month').format('DD/MM/YYYY')
          } else {
            return parsedDate.add(term_type?.[0].max, 'month').format('DD/MM/YYYY')
          }
        } else if (term_type[0].file_period_mode == 3) {
          // year
          // Convert days to years (approximate: 365 days = 1 year)
          let cal_period = Math.floor(period / 365)
          if (term_type?.[0].max >= cal_period) {
            return parsedDate.add(cal_period, 'year').format('DD/MM/YYYY')
          } else {
            return parsedDate.add(term_type?.[0].max, 'year').format('DD/MM/YYYY')
          }
        }

        break
    }
  }

  return null
}

// เอาไว้เช็ค {} ว่ามันว่างอ้ะป่าว
export const isNonEmptyObject = (val: any): boolean => {
  return typeof val === 'object' && val !== null && !Array.isArray(val) && Object.keys(val).length > 0
}

{
  /* v2.0.29 ต้องไม่ให้ใส่ข้อมูล release ของเดือนที่ผ่านมาแล้วกับเดือนปัจจุบันได้ ให้ disable ช่องไว้เลย ตอนทดสอบยังให้ใส่ได้ แต่ submit ไม่ได้ และขึ้น error mesg ผิด https://app.clickup.com/t/86etjye00 */
}
export const isInPastOrCurrentMonth = (start: string, end: string) => {
  if (!start || !end) return false

  const startDate = dayjs(start, 'DD/MM/YYYY')
  const endDate = dayjs(end, 'DD/MM/YYYY')
  const now = dayjs()

  const currentMonth = now.month() // 0-11
  const currentYear = now.year()

  // ตรวจสอบว่า start หรือ end อยู่ในเดือนก่อนหรือเดือนนี้
  const startIsPastOrCurrent = startDate.isSameOrBefore(now, 'month') && startDate.year() <= currentYear

  const endIsPastOrCurrent = endDate.isSameOrBefore(now, 'month') && endDate.year() <= currentYear

  return startIsPastOrCurrent || endIsPastOrCurrent
}

// Convert the month from "01/08/2025" to "Aug 2025"
export const formatMonth = (monthString: any) => {
  if (monthString) {
    const [day, month, year] = monthString.split('/')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }
}

// Convert the month from "01/08/2025" to "01 Aug 2025"
export const formatDay = (dayString: any) => {
  if (dayString) {
    const [day, month, year] = dayString.split('/')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    // Format day to ensure it stays two digits
    const formattedDay = day.padStart(2, '0')
    return `${formattedDay} ${monthNames[parseInt(month) - 1]} ${year}`
    // return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
  }
}

export function toDayjs(date?: any, format?: string, strict?: boolean) {
  return dayjs.utc(date, format, strict).tz('Asia/Bangkok')
}

export const formatStringToDDMMYYYY = (data?: any) => {
  let formattedDay = toDayjs(data).format('DD/MM/YYYY')
  return formattedDay
}

// เช็คว่าเวลาเกินปัจจุบันอะป่าว
export const checkExceedTime = (date: any, hour: string, minute: string) => {
  const selectedTime = dayjs(date).hour(Number(hour)).minute(Number(minute)).second(0)
  const now = dayjs()
  if (selectedTime.isBefore(now)) {
    return 'Change Mode/Zone exceeds the selected time. Please select the next time period.'
  }
  return null
}

export const exportChartToExcel = (datasets?: any, labels?: any, chartName?: any) => {
  // ========== ใช้ month เป็น column ==========
  // Header row: first column "Label", then the months as columns
  let headers = ['Area', ...labels]

  // Each row should start with dataset label followed by its values
  let excelData = [
    headers, // Header row
    ...datasets.map((ds: any) => [
      ds.label, // First column is dataset label
      ...ds.data // Followed by data for each month
    ])
  ]

  // Convert to worksheet
  const ws = XLSXStyle.utils.aoa_to_sheet(excelData)

  // Create a new workbook
  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'DataExport') // ตั้งชื่อ sheet

  // Export to file
  XLSXStyle.writeFile(wb, `${chartName}.xlsx`)
}

export const exportToExcelDailyAdjustReport = (data_current: any, data_filter: any, name: any, column?: any, extra_obj?: any) => {
  let exportDataCurrent = data_current // ตารางบน
  let exportDataFilter = data_filter // ตารางล่าง

  // let payloadToSend = exportDataCurrent?.map((item: any) => {
  //     let time: string | null = null;

  //     if (item.time) {
  //         time = dayjs().format('HH:mm')
  //     }

  //     return {
  //         ...item,
  //         time
  //     };
  // });

  // exportDataCurrent = payloadToSend

  switch (name) {
    case 'tab-detail':
      // Exporting tab-detail

      // ต้องแปลง timeShow แยก array
      let grouppppp = separateTimeShow(data_filter)

      let exportData1: any = exportDataCurrent?.length > 0 ? transformDailyAdjust(exportDataCurrent, column) : []
      exportData1 = transformKeys(exportData1)
      exportData1 = exportData1?.map(({['Nomination Value']: point, ...rest}: any) => ({
        ...rest,
        'Nomination Value MMSCFD': point
      }))

      let exportData2: any = exportDataFilter?.length > 0 ? transformDailyAdjust2ForTable2(grouppppp, column) : []
      exportData2 = transformKeys(exportData2)
      // ลบ Current Time และเปลี่ยนชื่อ Nomination Value เป็น Nomination Value MMSCFD
      exportData2 = exportData2?.map(({['Current Time']: _, ['Nomination Value']: val, ...rest}: any) => ({
        ...rest,
        // "Nomination Value MMSCFD": val
        'Nomination Value (MMSCFD)': val
      }))

      // ORIGINAL ที่มีสอง TABLE
      // // Create worksheet from JSON data
      // const worksheet1 = XLSX.utils.json_to_sheet(exportData1, { skipHeader: false });
      // const worksheet2 = XLSX.utils.json_to_sheet(exportData2, { skipHeader: false });

      // // Convert worksheets to array format
      // const sheetData1: any[][] = XLSX.utils.sheet_to_json(worksheet1, { header: 1 });
      // const sheetData2: any[][] = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });

      // // Insert a blank row between the two datasets (optional)
      // sheetData1.push([]); // Adds an empty row as a separator

      // // Append second dataset
      // sheetData1.push(...sheetData2);

      // // Convert combined array back to worksheet
      // const newWorksheet = XLSX.utils.aoa_to_sheet(sheetData1);

      // // Auto adjust column widths
      // const allData = [...exportData1, ...exportData2];
      // const columnWidths = Object.keys(allData[0] || {}).map((key) => ({
      //     wch: Math.max(
      //         key.length,
      //         ...allData.map((row?: any) => row[key] ? row[key].toString().length : 0)
      //     )
      // }));
      // newWorksheet["!cols"] = columnWidths;

      // // Create workbook and export
      // const workbook1: any = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook1, newWorksheet, "Sheet1");
      // // XLSX.writeFile(workbook1, `${name}.xlsx`);
      // XLSX.writeFile(workbook1, `Daily Adjustment Report_Detail.xlsx`);

      // ของใหม่เหลือตารางเดียว
      const worksheet1 = XLSXStyle.utils.json_to_sheet(exportData2, {skipHeader: false})
      const sheetData: any = XLSXStyle.utils.sheet_to_json(worksheet1, {header: 1})

      // Insert a blank row at the first position
      sheetData.unshift([]) // Adds an empty row at the beginning

      const newWorksheet1 = XLSXStyle.utils.aoa_to_sheet(sheetData)
      const workbook1: any = XLSXStyle.utils.book_new()

      // Auto adjust column widths
      const columnWidths = Object.keys(exportData2[0] || {}).map((key) => ({
        wch: Math.max(
          key.length, // Header width
          ...exportData2.map((row?: any) => (row[key] ? row[key].toString().length : 0)) // Max content width
        )
      }))
      newWorksheet1['!cols'] = columnWidths // Set column widths

      XLSXStyle.utils.book_append_sheet(workbook1, newWorksheet1, 'Sheet1')
      XLSXStyle.writeFile(workbook1, `Daily Adjustment Report_Detail.xlsx`)

      break
    case 'tab-total':
      // exportDataCurrent ตารางบน
      // exportDataFilter ตารางล่าง

      // exportTabTotal(exportDataFilter) // เดิม ตารางล่างอย่างเดียว
      // exportTabTotal(exportDataFilter, "daily_adjustment_report_total.xlsx", exportDataCurrent); // xlsx เฉย ๆ
      const exportDataFilterNotTotal = exportDataFilter.filter((item: any) => item.time != 'Total')
      const exportDataFilterTotal = exportDataFilter.filter((item: any) => item.time == 'Total')
      exportDailyAdjustReportTabTotal([...exportDataFilterNotTotal, ...exportDataFilterTotal], 'daily_adjustment_report_total.xlsx', exportDataCurrent, extra_obj?.displayUnit) // xlsx style

      // // Export
      // XLSX.writeFile(workbook, 'combined_export.xlsx');
      break
  }
}
// เก่า
// export const exportToExcelDailyAdjustReportTabDetail = (data_current: any, data_filter: any, name: any, column?: any, extra_obj?: any) => {

//     let exportDataFilter = data_filter; // ตารางล่าง

//     let exportData: any = exportDataFilter?.length > 0 ? transformDailyAdjustTabDetail(exportDataFilter, column, extra_obj?.displayUnit) : [];
//     exportData = transformKeys(exportData);

//     // Create worksheet from JSON data
//     const worksheet = XLSXStyle.utils.json_to_sheet(exportData, { skipHeader: false });

//     // Convert worksheet to array format
//     const sheetData: any = XLSXStyle.utils.sheet_to_json(worksheet, { header: 1 });

//     // Insert a blank row at the first position
//     // sheetData.unshift([]); // Adds an empty row at the beginning

//     // Convert array back to worksheet
//     const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData);
//     const workbook: any = XLSXStyle.utils.book_new();

//     // Auto adjust column widths
//     const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
//         wch: Math.max(
//             key.length, // Header width
//             ...exportData.map((row?: any) => row[key] ? row[key].toString().length : 0) // Max content width
//         )
//     }));
//     newWorksheet["!cols"] = columnWidths; // Set column widths

//     XLSXStyle.utils.book_append_sheet(workbook, newWorksheet, "Sheet1");
//     XLSXStyle.writeFile(workbook, `${name}.xlsx`);
// }

const normalizeExcelNumberText = (value: any): string => {
  return String(value ?? '')
    .trim()
    .replace(/,/g, '')
}

const parseExcelNumber = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = normalizeExcelNumberText(value)

  if (!normalized) {
    return null
  }

  // ป้องกัน code เช่น 001, 000123
  if (/^-?0\d+$/.test(normalized)) {
    return null
  }

  if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    return null
  }

  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

const getDecimalPlacesFromValue = (value: any): number | null => {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = normalizeExcelNumberText(value)
  const decimalPart = normalized.split('.')[1]

  return decimalPart !== undefined ? decimalPart.length : 0
}

const getExcelNumberFormat = (decimal: number): string => {
  const safeDecimal = Math.max(0, Number.isFinite(Number(decimal)) ? Number(decimal) : 0)

  return safeDecimal === 0 ? '#,##0' : `#,##0.${'0'.repeat(safeDecimal)}`
}

export const exportToExcelDailyAdjustReportTabDetail = (data_current: any, data_filter: any, name: any, column?: any, extra_obj?: any) => {
  const exportDataFilter = Array.isArray(data_filter) ? data_filter : []

  let exportData: any[] = exportDataFilter.length > 0 ? transformDailyAdjustTabDetail(exportDataFilter, column, extra_obj?.displayUnit) : []

  exportData = transformKeys(exportData)

  if (!Array.isArray(exportData) || exportData.length === 0) {
    return
  }

  const headers = Object.keys(exportData[0])

  /*
   * เก็บค่าต้นฉบับเอาไว้
   * เพื่อใช้ตรวจจำนวนทศนิยมภายหลัง
   */
  const originalRows = exportData.map((row: any) => headers.map((key) => row?.[key]))

  /*
   * สร้างข้อมูลแบบ AOA
   * แถวแรกคือ Header
   */
  const sheetData: any[][] = [
    headers,
    ...originalRows.map((row) =>
      row.map((originalValue) => {
        const numericValue = parseExcelNumber(originalValue)

        return numericValue !== null ? numericValue : originalValue
      })
    )
  ]

  const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData)

  const workbook: any = XLSXStyle.utils.book_new()

  /*
   * Header อยู่แถว 0
   * Data เริ่มแถว 1
   */
  const dataStartRow = 1

  for (let rowIndex = 0; rowIndex < originalRows.length; rowIndex++) {
    const sheetRowIndex = dataStartRow + rowIndex

    for (let columnIndex = 0; columnIndex < headers.length; columnIndex++) {
      const cellAddress = XLSXStyle.utils.encode_cell({
        r: sheetRowIndex,
        c: columnIndex
      })

      const cell = newWorksheet[cellAddress]

      if (!cell) {
        continue
      }

      const originalValue = originalRows[rowIndex][columnIndex]

      const numericValue = parseExcelNumber(originalValue)

      if (numericValue !== null) {
        const decimalFromOriginal = getDecimalPlacesFromValue(originalValue)

        cell.v = numericValue
        cell.t = 'n'

        /*
         * ถ้าต้นฉบับเป็น string:
         * "152,100.000" -> 3 ตำแหน่ง
         *
         * ถ้าต้นฉบับเป็น number:
         * ใช้ทศนิยมแบบยืดหยุ่นสูงสุด 10 ตำแหน่ง
         */
        cell.z = decimalFromOriginal !== null ? getExcelNumberFormat(decimalFromOriginal) : '#,##0.##########'

        /*
         * ลบ cached formatted value เดิม
         */
        if ('w' in cell) {
          delete cell.w
        }
      }

      cell.s = {
        ...cell.s,
        alignment: {
          ...cell.s?.alignment,
          horizontal: cell.t === 'n' ? 'right' : 'left',
          vertical: 'center'
        }
      }
    }
  }

  /*
   * Style Header
   */
  headers.forEach((_, columnIndex) => {
    const cellAddress = XLSXStyle.utils.encode_cell({
      r: 0,
      c: columnIndex
    })

    const cell = newWorksheet[cellAddress]

    if (!cell) {
      return
    }

    cell.s = {
      ...cell.s,
      font: {
        ...cell.s?.font,
        bold: true
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center',
        wrapText: true
      },
      fill: {
        patternType: 'solid',
        fgColor: {
          rgb: 'F4F4F4'
        }
      },
      border: {
        top: {
          style: 'thin',
          color: {
            rgb: '999999'
          }
        },
        bottom: {
          style: 'thin',
          color: {
            rgb: '999999'
          }
        },
        left: {
          style: 'thin',
          color: {
            rgb: '999999'
          }
        },
        right: {
          style: 'thin',
          color: {
            rgb: '999999'
          }
        }
      }
    }
  })

  /*
   * Auto adjust column widths
   * ใช้ค่าต้นฉบับในการคำนวณ
   */
  const columnWidths = headers.map((key, columnIndex) => {
    const maxLength = Math.max(key.length, ...originalRows.map((row) => String(row?.[columnIndex] ?? '').length))

    return {
      wch: Math.min(Math.max(maxLength + 2, 10), 40)
    }
  })

  newWorksheet['!cols'] = columnWidths

  /*
   * Row Height
   */
  newWorksheet['!rows'] = [
    {hpx: 40},
    ...originalRows.map(() => ({
      hpx: 30
    }))
  ]

  XLSXStyle.utils.book_append_sheet(workbook, newWorksheet, 'Sheet1')

  /*
   * Debug ลบภายหลังได้
   */
  const firstNumberCell = (() => {
    for (let r = dataStartRow; r < dataStartRow + originalRows.length; r++) {
      for (let c = 0; c < headers.length; c++) {
        const address = XLSXStyle.utils.encode_cell({
          r,
          c
        })

        if (newWorksheet[address]?.t === 'n') {
          return {
            address,
            cell: newWorksheet[address]
          }
        }
      }
    }

    return null
  })()

  console.log('First numeric cell:', firstNumberCell)

  XLSXStyle.writeFile(workbook, `${name}.xlsx`, {
    bookType: 'xlsx',
    cellStyles: true
  })
}

// ===== ของหน้า daily adjust report tab total =====

const uniq = <T, K extends keyof any>(arr: T[], by: (x: T) => K) => {
  const set = new Set<K>()
  return arr.filter((x) => (set.has(by(x)) ? false : (set.add(by(x)), true)))
}

const valueAtTime = (item: any, t: string): number | null => {
  const f = Array.isArray(item?.timeShow) ? item?.timeShow?.find((x: any) => x.time === t) : item?.timeShow && item?.timeShow?.time === t ? item.timeShow : null
  return f ? Number(f.value) : null
}

const to3 = (n: number | null | undefined) => (n == null ? null : Number((+n).toFixed(3)))

/** สร้าง AOA + merge blocks จาก data_table_* (รูปแบบเดียวกับที่โชว์) */
function buildAOASection(
  data_table_: any[],
  timeHeaderLabel: string
): {
  aoa: any[][]
  blocks: {point: string; startCol: number; endCol: number}[]
  colCount: number
} {
  if (!Array.isArray(data_table_) || data_table_.length === 0) {
    return {aoa: [], blocks: [], colCount: 0}
  }

  // ลำดับ point เอาจาก groups ของแถวแรก
  const firstRowGroups = data_table_[0]?.groups ?? []
  const points: string[] = firstRowGroups?.map((g: any) => g.point)

  // map point → [shipper1, shipper2, ...] (unique และคงลำดับ)
  const pointToShippers: Record<string, string[]> = {}
  for (const tRow of data_table_) {
    for (const g of tRow.groups || []) {
      const names = (g.items || [])?.map((it: any) => it.shipper_name || '')
      const uniqNames = uniq(names, (x: any) => x)
      if (!pointToShippers[g.point]) pointToShippers[g.point] = []
      for (const n of uniqNames) {
        if (n && !pointToShippers[g.point].includes(n)) {
          pointToShippers[g.point].push(n)
        }
      }
    }
  }

  // ---------- สร้างหัวตาราง 2 แถว ----------
  const headerTop: any[] = [timeHeaderLabel]
  const headerBottom: any[] = ['']

  type BlockInfo = {point: string; startCol: number; endCol: number}
  const blocks: BlockInfo[] = []

  let colCursor = 1 // c0 = Time
  for (const p of points) {
    const shippers = pointToShippers[p] && pointToShippers[p].length > 0 ? pointToShippers[p] : ['Shipper'] // fallback (กันค่าว่าง)

    const subCols = shippers.length + 1 // +1 = Total

    headerTop.push(p, ...Array(subCols - 1).fill(''))
    for (const s of shippers) headerBottom.push(s)
    headerBottom.push('Total')

    blocks.push({point: p, startCol: colCursor, endCol: colCursor + subCols - 1})
    colCursor += subCols
  }

  const aoa: any[][] = [headerTop, headerBottom]

  const times: string[] = data_table_.map((r) => r.time)
  for (const t of times) {
    const rowForTime = data_table_.find((r) => r.time === t)
    const row: any[] = [t]

    for (const p of points) {
      const group = rowForTime?.groups?.find((g: any) => g.point === p)
      const shippers = pointToShippers[p] && pointToShippers[p].length > 0 ? pointToShippers[p] : ['Shipper']

      let total = 0
      let hasAny = false

      for (const s of shippers) {
        const item = group?.items?.find((it: any) => (s === 'Shipper' ? true : it.shipper_name === s))
        const val = valueAtTime(item, t)
        const n = val == null ? null : to3(val)
        if (n != null) {
          total += n
          hasAny = true
        }
        row.push(n)
      }

      row.push(hasAny ? to3(total) : null)
    }

    aoa.push(row)
  }

  return {aoa, blocks, colCount: colCursor} // colCursor เป็นจำนวนคอลัมน์ทั้งหมด (รวม Time)
}

/**
 * รวม top (Current Time) + เว้น 1 แถว + ตารางเดิม (Time)
 * ใช้ได้แบบเดิม: exportTabTotal(exportDataFilter)
 * ถ้ามีตัวแปร globalThis.data_table_top อยู่ จะดึงมาแทรกให้เอง
 */
const exportTabTotal = (
  data_table_: any[],
  fileName = 'table.xlsx',
  // รองรับทั้งการส่งเข้ามา หรือถ้าไม่ส่งจะลองอ่านจาก globalThis เพื่อให้ signature เดิมยังใช้ได้
  _topData: any[] | null = (globalThis as any)?.data_table_top ?? null
) => {
  if (!Array.isArray(data_table_) || data_table_.length === 0) return

  // ===== สร้างส่วนบน (Current Time) ถ้ามี =====
  const hasTop = Array.isArray(_topData) && _topData.length > 0
  const topSec = hasTop ? buildAOASection(_topData, 'Current Time') : {aoa: [], blocks: [], colCount: 0}

  // ===== สร้างส่วนล่าง (ตารางเดิม) =====
  const bottomSec = buildAOASection(data_table_, 'Time')

  // ===== รวม AOA =====
  const combinedAOA: any[][] = []
  const merges: XLSXStyle.Range[] = []

  // 1) top section
  let rowCursor = 0
  if (hasTop) {
    combinedAOA.push(...topSec.aoa)
    // merges ของหัว top (แถว 0..1)
    merges.push(
      {s: {r: 0, c: 0}, e: {r: 1, c: 0}}, // merge "Current Time"
      ...topSec.blocks.map((b) => ({
        s: {r: 0, c: b.startCol},
        e: {r: 0, c: b.endCol}
      }))
    )
    rowCursor = topSec.aoa.length
    // 2) blank row
    combinedAOA.push([])
    rowCursor += 1
  }

  // base row index ของหัว bottom
  const bottomBaseRow = rowCursor

  // 3) bottom section (ตารางเดิม)
  combinedAOA.push(...bottomSec.aoa)

  // merges ของหัว bottom (ชดเชยด้วย bottomBaseRow)
  merges.push(
    {s: {r: bottomBaseRow + 0, c: 0}, e: {r: bottomBaseRow + 1, c: 0}}, // merge "Time"
    ...bottomSec.blocks.map((b) => ({
      s: {r: bottomBaseRow + 0, c: b.startCol},
      e: {r: bottomBaseRow + 0, c: b.endCol}
    }))
  )

  // ===== ทำ sheet จากทั้งก้อน =====
  const ws = XLSXStyle.utils.aoa_to_sheet(combinedAOA)

  // merges
  ws['!merges'] = merges

  // ความกว้างคอลัมน์ (อิงจำนวนคอลัมน์ของส่วนล่างถ้ามี ไม่งั้นของส่วนบน)
  const totalCols = Math.max(topSec.colCount || 0, bottomSec.colCount || 0) || bottomSec.colCount || 1
  const cols: XLSXStyle.ColInfo[] = []
  for (let c = 0; c < totalCols; c++) {
    cols.push({wch: c === 0 ? 8 : 12}) // Time/Current Time = 8, ที่เหลือ 12
  }
  ws['!cols'] = cols

  // ใส่ number format "#,##0.000" ให้ทุก cell ที่เป็น number
  const ref = ws['!ref']
  if (ref) {
    const range = XLSXStyle.utils.decode_range(ref)
    for (let R = 0; R <= range.e.r; ++R) {
      for (let C = 0; C <= range.e.c; ++C) {
        const addr = XLSXStyle.utils.encode_cell({r: R, c: C})
        const cell = ws[addr]
        if (cell && typeof cell.v === 'number') {
          cell.z = '#,##0.000'
        }
      }
    }
  }

  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Export')
  XLSXStyle.writeFile(wb, fileName)
}

export const exportToExcel = (data: any, name: any, column?: any, extra_obj?: any) => {
  let exportData = data
  switch (name) {
    case 'group-2':
      // Exporting history for TSO
      exportData = transformGroupTSO(data, column)
      exportData = transformKeys(exportData)
      break
    case 'group-3':
      // Exporting history for Shippers
      exportData = transformGroupShippers(data, column)
      exportData = transformKeys(exportData)
      break
    case 'group-4':
      // Exporting history for Others
      exportData = transformGroupOthers(data, column)
      exportData = transformKeys(exportData)
      break
    case 'login-tracking':
      // Exporting history for Others
      exportData = transformLoginTracking(data, column)
      exportData = transformKeys(exportData)

      const keyMapLoginTracking: Record<string, string> = {
        'Company Name': 'Company/Group Name',
        'Last Login': 'Lasted Login'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapLoginTracking[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'area':
      // Exporting history for Area
      exportData = transformArea(data, column)
      exportData = transformKeys(exportData)

      const keyMapArea: Record<string, string> = {
        'Entry Exit': 'Entry / Exit',
        Name: 'Area Name',
        Desc: 'Description',
        'Area Nom Cap': 'Area Nominal Capacity (MMBTU/D)',
        'Supply Ref Quality': 'Supply Reference Quality Area'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapArea[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'contract-point':
      // Exporting history for Area
      exportData = transformContractPoint(data, column)
      exportData = transformKeys(exportData)

      const keyMapContractPoint: Record<string, string> = {
        'Entry Exit': 'Entry / Exit',
        Desc: 'Description'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapContractPoint[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'role-master':
      // Exporting role-mgn
      exportData = transformRoleMgn(data, column)
      exportData = transformKeys(exportData)
      break
    case 'system-login':
      // Exporting system-login
      exportData = transformSystemLogin(data, column)
      exportData = transformKeys(exportData)

      const keyMapSystemLGN: Record<string, string> = {
        Role: 'Role Name',
        User: 'Users'
      }

      // เปลี่ยนคีย์เว่ย
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapSystemLGN[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'chart_area':
      // Exporting chart_area
      exportData = transformChartArea(data, column)
      exportData = transformKeys(exportData)
      break
    case 'chart_entry':
      // Exporting chart_entry
      exportData = transformChartArea(data, column)
      exportData = transformKeys(exportData)
      break
    case 'chart_exit':
      // Exporting chart_exit
      exportData = transformChartArea(data, column)
      exportData = transformKeys(exportData)
      break
    case 'path_config':
      // Exporting path_config
      exportData = transformPathConfig(data, column)
      exportData = transformKeys(exportData)
      break
    case 'planning-file-submission-template':
      // Exporting planning-file-submission-template
      exportData = transformPlanningFileSubmissionTemplate(data, column)
      exportData = transformKeys(exportData)
      break
    case 'planning-deadline':
      // Exporting planning-deadline
      exportData = transformPlanningDeadLine(data, column)
      exportData = transformKeys(exportData)
      break
    case 'term-and-condition':
      // Exporting term-and-condition
      exportData = transformTermCondition(data, column)
      exportData = transformKeys(exportData)
      break
    case 'announcement':
      // Exporting announcement
      exportData = transformAnnouncement(data, column)
      exportData = transformKeys(exportData)
      break
    case 'account':
      // Exporting account
      exportData = transformUser(data, column)
      exportData = transformKeys(exportData)

      const keyMapUser: Record<string, string> = {
        'Id Name': 'User ID',
        'Company Name': 'Group Name',
        'Role Default': 'Role',
        'Update By': 'Updated By'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapUser[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'allocation-management':
      // Exporting allocation-management
      exportData = transformAlloManage(data, column)
      exportData = transformKeys(exportData)

      // เติมคำหลังคีย์
      const key_allocation_management = ['Nominated Value', 'System Allocation', 'Shipper Review Allocation']
      exportData = appendUnitToKeys(exportData, key_allocation_management, '(MMBTU/D)')
      break
    case 'config-mode-zone-base-inventory':
      exportData = transformConfigModeZoneBaseInventory(data, column)
      exportData = transformKeys(exportData)
      break
    case 'bal-operate-and-instruct':
      exportData = transformBalanceOperationFlowAndInstructedFlow(data, column)
      exportData = transformKeys(exportData)

      // เปลี่ยนคีย์ ตามนี้
      const keyMapBal: Record<string, string> = {
        'Acc Imbalance': 'Acc. Imbalance Inventory (MMBTU)',
        'Acc Margin': 'Acc. Margin (MMBTU)',
        'Flow Type': 'Flow Type',
        'Energy Adjustment Mmbtu': 'Energy Adjustment (MMBTU)',
        'Energy Flow Rate Adjustment Mmbtuh': 'Energy Flow Rate Adjustment (MMBTU/H)',
        'Energy Flow Rate Adjustment Mmbtud': 'Energy Flow Rate Adjustment (MMBTU/D)',
        'Volume Adjustment Mmbtu': 'Volume Adjustment (MMBTU)',
        'Volume Flow Rate Adjustment Mmscfh': 'Volume Flow Rate Adjustment (MMSCF/H)',
        'Volume Flow Rate Adjustment Mmscfd': 'Volume Flow Rate Adjustment (MMSCFD)',
        'ResolvedTime Hr': 'Resolved Time (Hr.)',
        'Hv Btu Scf': 'HV (BTU/SCF)',
        'Updated By': 'Updated By'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapBal[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })

      break
    case 'email-notification-management':
      exportData = transformEmailNotificationManagement(data, column)
      exportData = transformKeys(exportData)
      break
    case 'nomination-point':
      // Exporting nomination-point
      exportData = transformNominationPoint(data, column)
      exportData = transformKeys(exportData)

      // https://app.clickup.com/t/86et66xag
      // R : History : Export ปรับหัว Column ให้แสดงข้อความเต็มแบบหน้าตาราง มีคำว่า Desc ปรับเป็น Description และ Max Cap ปรับเป็น Maximum Capacity (MMSCFD)
      const keyMapNominationPoint: Record<string, string> = {
        'Entry Exit': 'Entry / Exit',
        'Maximum Capacity': 'Maximum Capacity (MMSCFD)'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapNominationPoint[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'nomination-deadline':
      // Exporting nomination-deadline
      exportData = transformNominationDeadline(data, column)
      exportData = transformKeys(exportData)
      break
    case 'non-tpa-point':
      // Exporting non-tpa-point
      exportData = transformNonTpaPoint(data, column)
      exportData = transformKeys(exportData)

      exportData = exportData.map((obj: any) => {
        const newObj: any = {}
        for (const [k, v] of Object.entries(obj)) {
          if (k === 'Non Tpa Point Name') {
            newObj['Non TPA Point Name'] = v
          } else {
            newObj[k] = v
          }
        }
        return newObj
      })

      break
    case 'metering-point':
      // Exporting non-tpa-point
      exportData = transformMeteringPoint(data, column)
      exportData = transformKeys(exportData)
      break
    case 'checking-condition':
      // Exporting capacity-publication-remark
      exportData = transformMeteringCheckingCondition(data, column)
      exportData = transformKeys(exportData)
      break
    case 'concept-point':
      // Exporting concept-point
      exportData = transformConceptPoint(data, column)
      exportData = transformKeys(exportData)
      break
    case 'contract-point-view-modal':
      // Exporting contract-point-view-modal
      exportData = transformContractPointModalView(data, column)
      exportData = transformKeys(exportData)
      break
    case 'nom-upload-template-for-shipper':
      // Exporting nom-upload-template-for-shipper
      exportData = transformNomUploadTemplateForShipper(data, column)
      exportData = transformKeys(exportData)
      break
    case 'release-capacity-submission':
      // Exporting release-capacity-submission
      exportData = transformReleaseSubmission(data, column)
      exportData = transformKeys(exportData)

      const keyMapReleaseCapSubmission: Record<string, string> = {
        'Contract Point': 'Point',
        'Contracted Mmbtu D': 'Contracted (MMBTU/D)',
        'Contracted Mmscfd': 'Contracted (MMSCFD)',
        'Release Mmbtud': 'Release (MMBTU/D)',
        'Release Mmscfd': 'Release (MMSCFD)'
      }

      const export_data_output_release_cap_submission = exportData?.map((row: any) => {
        const newRow: Record<string, any> = {}
        for (const key in row) {
          const newKey = keyMapReleaseCapSubmission[key] || key
          newRow[newKey] = row[key]
        }
        return newRow
      })

      exportData = export_data_output_release_cap_submission

      break
    case 'capacity-publication-remark':
      // Exporting capacity-publication-remark
      exportData = transformCapaPublicRemark(data, column)
      exportData = transformKeys(exportData)
      break
    case 'booking-template':
      // Exporting booking-template
      exportData = transformBookingTemplate(data, column)
      exportData = transformKeys(exportData)

      const keyMapCapaRightTempplate: Record<string, string> = {
        Min: 'Period Min',
        Max: 'Period Max',
        'File Start Date': 'File Recurring Start Date'
      }

      // เปลี่ยนคีย์เว่ย
      const export_data_output_capa_right_template = exportData?.map((row: any) => {
        const newRow: Record<string, any> = {}
        for (const key in row) {
          const newKey = keyMapCapaRightTempplate[key] || key
          newRow[newKey] = row[key]
        }
        return newRow
      })

      exportData = export_data_output_capa_right_template

      break
    case 'user-guide':
      // Exporting user-guide
      exportData = transformUserGuide(data, column)
      exportData = transformKeys(exportData)

      // เปลี่ยนชื่อคีย์ ตอนออก excel จะได้ตรง
      exportData = exportData.map((item: any) => {
        const {
          ['Document Name']: _remove, // ลบ key นี้
          Desc,
          'Create By': createBy,
          'Update By': updateBy,
          ...rest
        } = item

        return {
          ...rest,
          Description: Desc,
          'Created By': createBy,
          'Updated By': updateBy
        }
      })

      break
    case 'system-parameter':
      // Exporting system-parameter
      exportData = transformSystemParameter(data, column)
      exportData = transformKeys(exportData)
      break
    case 'hv-operation-flow':
      // Exporting system-parameter
      exportData = transformHvOperationFlow(data, column)
      exportData = transformKeys(exportData)
      break
    case 'intraday-acc-bal-inventory-adjust':
      // Exporting intraday-acc-bal-inventory-adjust
      exportData = transformIntradayAccImbalInvenAdjust(data, column)
      exportData = transformKeys(exportData)

      // เติมคำหลังคีย์
      const key_intraday_acc_bal_inventory_adjust = ['East', 'West']
      exportData = appendUnitToKeys(exportData, key_intraday_acc_bal_inventory_adjust, '(MMBTU)')

      break
    case 'zone':
      // Exporting user-guide
      exportData = transformZone(data, column)
      exportData = transformKeys(exportData)

      const keyMapZone: Record<string, string> = {
        'Entry Exit': 'Entry / Exit'
      }

      // func เปลี่ยนคีย์
      exportData = exportData?.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapZone[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })
      break
    case 'adjustment-acc-imbalance':
      // Exporting adjustment-acc-imbalance
      exportData = transformBalanceAdjustAccumulateImbalance(data, column)
      exportData = transformKeys(exportData)

      // Export ทั้งในหน้า list และ ในหน้า History > ปรับชื่อ Column https://app.clickup.com/t/86euc96eh
      // เปลี่ยนชื่อคีย์ Adjust Imbalance เป็น Adjust Acc. Imbalance
      exportData = exportData?.map((item: any) => {
        const newItem: any = {}
        for (const key in item) {
          if (key === 'Adjust Imbalance') {
            newItem['Adjust Acc. Imbalance'] = item[key]
          } else {
            newItem[key] = item[key]
          }
        }
        return newItem
      })

      // R2 : v2.0.33 Export ใน History ขึ้นข้อมูล update by ไม่ถูกต้อง https://app.clickup.com/t/86etetbv5
      const keyMapAdjustAccImbal: Record<string, string> = {
        'Daily Imbalance': 'Daily Initial Acc. Imbalance',
        'Daily Final Imbalance': 'Daily Final Acc. Imbalance',
        'Intraday Imbalance': 'Intraday Initial Acc. Imbalance',
        'Intraday Final Imbalance': 'Intraday Final Acc. Imbalance'
      }

      // เปลี่ยนคีย์เว่ย
      const export_data_output_adjust_acc_imbal = exportData?.map((row: any) => {
        const newRow: Record<string, any> = {}
        for (const key in row) {
          const newKey = keyMapAdjustAccImbal[key] || key
          newRow[newKey] = row[key]
        }
        return newRow
      })

      exportData = export_data_output_adjust_acc_imbal
      break
    case 'adjustment-daily-imbalance':
      // Exporting adjustment-daily-imbalance
      exportData = transformBalanceAdjustDailyImbalance(data, column)
      exportData = transformKeys(exportData)
      break
    case 'allocation_report':
      // Exporting allocation_report
      exportData = transformAllocationReport(data, column)
      exportData = transformKeys(exportData)

      // R1 : Tab Daily / Tab Intraday View : Export ข้อมูลยังไม่ตรง UI https://app.clickup.com/t/86et8cd7y
      // View Export ฝากหัวคอลัมน์คำให้ครบตาม UI ครับ
      const keyMap: Record<string, string> = {
        'Entry Exit': 'Entry / Exit',
        'Gas Day': 'Gas Day',
        Timestamp: 'Timestamp',
        'Nomination Point Concept Point': 'Nomination Point / Concept Point',
        // "Capacity Right": "Capacity Right (MMBTU/D)",
        'Nominated Value': 'Nominated Value (MMBTU/D)',
        'System Allocation': 'System Allocation (MMBTU/D)'
      }

      // เปลี่ยนคีย์เว่ย
      const export_data_output = exportData?.map((row: any) => {
        const newRow: Record<string, any> = {}
        for (const key in row) {
          const newKey = keyMap[key] || key
          newRow[newKey] = row[key]
        }
        return newRow
      })
      exportData = export_data_output

      break
    case 'allocation-shipper-report':
      // Exporting allocation-shipper-report
      exportData = transformAllocationShipperReportDownload(data, column)
      exportData = transformKeys(exportData)
      break
    case 'shipper-nom-report':
      // Exporting shipper-nom-report
      exportData = transformShipperNomReport(data, column, extra_obj)
      exportData = transformKeys(exportData)
      break
    case 'shipper-nom-report-view':
      // Exporting shipper-nom-report-view
      exportData = transformShipperNomReportView(data, column, extra_obj)
      exportData = transformKeys(exportData)

      // เปลี่ยนคีย์ ตามนี้
      const keyMapShipperNomReportView: Record<string, string> = {
        'Capacity Right Mmbtud': 'Capacity Right (MMBTU/D)',
        'Nominated Value Mmbtud': 'Nominated Value (MMBTU/D)',
        'Overusage Mmbtud': 'Overusage (MMBTU/D)'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapShipperNomReportView[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })

      break
    case 'shipper-nom-report-detail':
      exportData = transformShipperNomReportDetail(data, column, extra_obj)
      exportData = transformKeys(exportData)
      console.log('exportData : ', exportData)

      // เปลี่ยนคีย์ ตามนี้
      const keyMapBalx: Record<string, string> = {
        'Week Day': `${extra_obj?.day_text}-${extra_obj?.date}`,
        'Concept Id': 'Concept ID'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapBalx[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })

      break
    case 'bal-vent-commissioning-other':
      // Exporting bal-vent-commissioning-other;
      exportData = transformVentCommissioningOtherGas(data, column)
      exportData = transformKeys(exportData)
      break
    case 'curtailsment-allocation-view':
      // Exporting curtailsment-allocation-view;

      exportData = transformCurtailmentAlloc(data, column)
      exportData = transformKeys(exportData)

      let totals: any = {}

      const totalNominationValue = data?.reduce((sum: number, row: any) => sum + (parseFloat(row.nomination_value) || 0), 0)
      const totalRemainingCapacity = data?.reduce((sum: number, row: any) => sum + (parseFloat(row.remaining_capacity) || 0), 0)

      // เพิ่ม total
      totals = {
        'Shipper Name': 'Total',
        'Contract Code': '',
        // "Nomination Value": totalNominationValue,
        // "Remaining Capacity": totalRemainingCapacity
        'Nomination Value': formatNumberFourDecimal(totalNominationValue),
        'Remaining Capacity': formatNumberFourDecimal(totalRemainingCapacity)
      }

      exportData.push(totals)
      break
    case 'intraday-base-inventory':
      // Exporting intraday-base-inventory
      exportData = transformIntradayBaseInventory(data, column)
      exportData = transformKeys(exportData)

      const key_intraday_base_inventory = [
        'Base Inventory Value',
        'High Red',
        'High Orange',
        'High Max',
        'Alert High',
        'Alert Low',
        'Low Orange',
        'Low Red',
        'Low Difficult Day',
        'Low Min' // https://app.clickup.com/t/86eujrgt9
      ]

      exportData = appendUnitToKeys(exportData, key_intraday_base_inventory, '(MMBTU)')
      break
    case 'intraday-base-inventory-shipper':
      // Exporting intraday-base-inventory-shipper
      exportData = transformIntradayBaseInventoryShipper(data, column)
      exportData = transformKeys(exportData)

      const key_intraday_base_inventory_shipper = [
        'Base Inventory Value',
        'High Red',
        'High Orange',
        'High Max',
        'Alert High',
        'Alert Low',
        'Low Orange',
        'Low Red',
        'Low Difficult Day',
        'Low Min' // https://app.clickup.com/t/86eujrgt9
      ]

      exportData = appendUnitToKeys(exportData, key_intraday_base_inventory_shipper, '(MMBTU)')
      break
    case 'minimum-tab-all-daily':
      // Exporting minimum-tab-all-daily
      exportData = transformMinimumTabDaily(data, column)
      exportData = transformMinimumTabDailyKeys(exportData)

      break
    case 'minimum-tab-weekly':
      // Exporting minimum-tab-weekly
      exportMinInventoryWeekly(data, 'Minimum_Inventory_Summary.xlsx')
      break

    case 'summary-nomination-report-weekly-area-imbal':
      // Exporting summary-nomination-report-weekly-area-imbal
      exportData = transformSumNomReportWeeklyAreaImbal(data, column)
      exportData = transformKeys(exportData)

      // Weekly > Area > Imbalance > Export Column Imbalance (%) ปรับให้ตรงหน้า UI https://app.clickup.com/t/86eug54j3
      // เปลี่ยนคีย์ ตามนี้
      const keyMapNomWeeklyAreaImbal: Record<string, string> = {
        'Imbalance Percent': 'Imbalance (%)'
      }

      // func เปลี่ยนคีย์
      exportData = exportData.map((obj: any) => {
        const newObj: Record<string, any> = {}
        Object.keys(obj).forEach((k) => {
          const newKey = keyMapNomWeeklyAreaImbal[k] || k
          newObj[newKey] = obj[k]
        })
        return newObj
      })

      break
    case 'summary-nomination-report-weekly-area-mbtu':
      // Exporting summary-nomination-report-weekly-area-mbtu
      exportData = transformSumNomReportWeeklyAreaMmbtu(data, column)
      exportData = transformKeys(exportData)
      break
    case 'allocation-review':
      // Exporting allocation-review
      exportData = transformAllocationReview(data, column)
      exportData = transformKeys(exportData)

      // เติมคำหลังคีย์
      const key_allocation_review = ['System Allocation', 'Previous Allocation Tpa For Review', 'Shipper Review Allocation']
      exportData = appendUnitToKeys(exportData, key_allocation_review, '(MMBTU/D)')

      break
    case 'history-offspec-gas':
      // Exporting history-offspec-gas
      exportData = transformEventOffspecGas(data, column)
      exportData = transformKeys(exportData)
      break
    case 'history-emer-diff':
      // Exporting history-emer-diff
      exportData = transformEventEmergencyDiffDay(data, column)
      exportData = transformKeys(exportData)
      break
    case 'history-event-of-if':
      // Exporting history-event-of-if

      exportData = transformEventOfIf(data, column)
      exportData = transformKeys(exportData)
      break
    case 'view_credit_debit_note':
      // Exporting view_credit_debit_note
      exportData = transformTariffCrDrNoteView(data, column, extra_obj)
      exportData = transformKeys(exportData)
      break
    case 'tariff-credit-debit-note':
      // Exporting tariff-credit-debit-note history
      exportData = transformTariffCrDrNoteHistory(data, column)
      exportData = transformKeys(exportData)
      break

    case 'tariff-detail-page':
      // Exporting tariff-detail-page
      exportData = transformTariffDetailPage(data, column)
      exportData = transformTariffDetailPageKeys(exportData)

      const totalRow = calcTotalTariffDetail(data)

      // เพิ่ม total
      let totalsTariffDetail: any = {}
      totalsTariffDetail = {
        'Type Charge': 'TOTAL :',
        'Contract Code': null,
        'Contract Type': null,
        'Quantity Operator': null,
        Quantity: null,
        Unit: null,
        // "Co Efficient (%)": null,
        'Fee (Baht/MMBTU)': null,
        'Amount (Baht)': totalRow ? formatNumberTwoDecimalNom(totalRow?.amount) : '',
        'Amount Operator (Baht)': totalRow ? formatNumberTwoDecimalNom(totalRow?.amount_operator) : '',
        'Amount Compare (Baht)': totalRow ? formatNumberTwoDecimalNom(totalRow?.amount_compare) : '',
        Difference: totalRow ? formatNumberTwoDecimalNom(totalRow?.difference) : ''
      }
      exportData.push(totalsTariffDetail)
      break
    case 'shipper-nom-report-tab-0':
      // Exporting shipper-nom-report-tab-0
      exportData = transformShipperNomReportTabZero(data, column)
      exportData = transformKeys(exportData)
      break
    case 'shipper-nom-report-tab-weekly':
      exportData = transformShipperNomReportTabWeekly(data, column, extra_obj)
      exportData = transformKeys(exportData)
      break
    case 'reserve_bal_gas_contract':
      // Exporting reserve_bal_gas_contract
      exportData = transformReserveBalGasContractView(data, column)
      exportData = transformKeys(exportData)
      break
    case 'meter_mgn_export':
      // Exporting meter_mgn_export
      exportData = transformMeteringManagement(data, column)
      exportData = transformKeys(exportData)
      break
    case 'concept_point_limit':
      // Exporting meter_mgn_export
      exportData = transformConceptPointLimit(data, column)
      exportData = transformKeys(exportData)
      break
    default:
      // Unknown export group, exporting raw data
      exportData = data
      break
  }

  if (name == 'medium_term_total') {
    // export med term
    exportChartPlanning(exportData, extra_obj)
  } else if (name == 'short_term_total') {
    exportChartPlanningShortX(exportData, extra_obj?.mode)
  } else if (name == 'shipper-nom-report-detail') {
    exportShipperNomReportAll(exportData, name, extra_obj)
  } else if (name == 'view_credit_debit_note') {
    // ข้อมูลแถวบน
    // ด้านบน
    const top_data: any = {
      'Shipper Name': extra_obj?.shipper_name,
      'Month/Year Charge': extra_obj?.month_year_change,
      'CNDN ID': extra_obj?.cndn_id,
      'CNDN Type': extra_obj?.cndn_type,
      'Type Charge': extra_obj?.type_change,
      'Tariff ID': extra_obj?.tariff_id,
      Comment: extra_obj?.comment
    }

    // เปลี่ยนคีย์ ตามนี้
    const keyMapBal: Record<string, string> = {
      'Fee Baht': 'Fee Baht (Baht/MMBTU)',
      'Amount Baht': 'Amount (Baht)'
    }

    // func เปลี่ยนคีย์
    exportData = exportData.map((obj: any) => {
      const newObj: Record<string, any> = {}
      Object.keys(obj).forEach((k) => {
        const newKey = keyMapBal[k] || k
        newObj[newKey] = obj[k]
      })
      return newObj
    })

    const formatQuantity = (val: string) => {
      if (!val) return val
      // ลบคอมม่าทิ้งก่อน
      const num = parseFloat(val.replace(/,/g, ''))
      if (isNaN(num)) return val
      // แปลงกลับเป็น string พร้อมคอมม่า + fixed(3)
      return num.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})
    }

    // map ข้อมูลใหม่
    let exportData2 = exportData.map((item: any) => ({
      ...item,
      Quantity: formatQuantity(item.Quantity)
    }))

    // ท่อนบนติดมาด้วย
    // exportAllocReview(exportData, name, top_data) // ขอยืมให้ฟังก์ชั่นหน่อย
    exportTariffCreditDebitNoteView(exportData2, name, top_data)
  } else if (name == 'tariff-detail-page') {
    // ข้อมูลแถวบน
    // ด้านบน
    const top_data: any = {
      'Shipper Name': extra_obj?.shipper ? extra_obj?.shipper?.name : '',
      'Month/Year': extra_obj?.month_year_charge ? dayjs(extra_obj?.month_year_charge).format('MMMM YYYY') : '',
      'Tariff ID': extra_obj?.tariff_id ? extra_obj?.tariff_id : '',
      'Tariff ID (Compare)': Array.isArray(extra_obj?.tariff_compare) && extra_obj?.tariff_compare?.length > 0 ? (extra_obj.tariff_compare[0].compare_with?.tariff_id ?? '-') : '-',
      'Invoice Sent': extra_obj?.tariff_invoice_sent ? extra_obj?.tariff_invoice_sent?.name : ''
    }

    // ท่อนบนติดมาด้วย
    exportTariffCreditDebitNoteView(exportData, name, top_data)
  } else if (name == 'tariff-credit-debit-note') {
    // ข้อมูลแถวบน
    // ด้านบน
    const top_data: any = {
      'Shipper Name': extra_obj?.[0]?.value,
      'Month/Year': extra_obj?.[1]?.value,
      'CNDN Type': extra_obj?.[2]?.value,
      'Type Charge': extra_obj?.[3]?.value
    }

    // เปลี่ยนคีย์ ตามนี้
    const keyMapTariffCreditDebitNote: Record<string, string> = {
      'Cndn Id': 'CNDN ID',
      'Tariff Id': 'Tariff ID'
    }

    // func เปลี่ยนคีย์
    exportData = exportData.map((obj: any) => {
      const newObj: Record<string, any> = {}
      Object.keys(obj).forEach((k) => {
        const newKey = keyMapTariffCreditDebitNote[k] || k
        newObj[newKey] = obj[k]
      })
      return newObj
    })

    // ท่อนบนติดมาด้วย
    exportAllocReview(exportData, name, top_data) // ขอยืมให้ฟังก์ชั่นหน่อย
  } else if (name == 'shipper-nom-report-view') {
    exportShipperNomReportView(exportData, name, extra_obj)
  } else if (name == 'allocation-review') {
    // original 'allocation-review' ที่ไม่ให้เข้าตรงนี้เพราะข้อนี้  https://app.clickup.com/t/86eu48m2u R1 : History : Export ข้อมูลยังออกไม่ครบตาม UI (ตามภาพกรอบแดงคือที่ยังไม่ออก)

    // ข้อมูลแถวบน
    // ด้านบน
    const top_data: any = {
      // "Shipper Name": data[0]?.group?.name,
      'Shipper Name': extra_obj[0]?.value,
      Zone: extra_obj[1]?.value
    }
    // History : Export ข้อมูลยังไม่ตรงกับหน้า UI https://app.clickup.com/t/86eu4bm7n
    // ท่อนบนติดมาด้วย
    exportAllocReview(exportData, name, top_data)
  } else if (name == 'curtailsment-allocation-view') {
    // ข้อมูลแถวบน
    // ด้านบน
    let top_data: any = {}

    if (extra_obj?.tab == 'area') {
      top_data = {
        'Gas Day': extra_obj?.gas_day_text,
        Area: extra_obj?.area,
        Unit: extra_obj?.unit
      }
    } else {
      top_data = {
        'Gas Day': extra_obj?.gas_day_text,
        Area: extra_obj?.area,
        'Nomination Point': extra_obj?.nomination_point, // View : Export Row Total หายไป และมีข้อมูล Nomination Point เกินมา https://app.clickup.com/t/86eub6dgh
        Unit: extra_obj?.unit
      }
    }

    // ท่อนบนติดมาด้วย
    exportAllocReview(exportData, name, top_data) // ขอยืมให้ฟังก์ชั่นหน่อย
  } else if (name == 'minimum-tab-all-daily') {
    exportMinimumTabAllAndDaily(exportData, name, extra_obj)
  } else if (name == 'adjustment-daily-imbalance') {
    exportHistoryDailyAdjustImbal(exportData, name, extra_obj)
  } else if (name == 'adjustment-acc-imbalance') {
    exportAccImbalanceReportStyled(exportData, 'acc_imbalance_adjust.xlsx')
  } else if (name == 'reserve_bal_gas_contract') {
    // เปลี่ยนคีย์ ตามนี้
    const keyMapReserveBalGasContract: Record<string, string> = {
      'Daily Reserve Cap': 'Daily Reserve Cap (MMBTU/D)'
    }

    // func เปลี่ยนคีย์
    exportData = exportData.map((obj: any) => {
      const newObj: Record<string, any> = {}
      Object.keys(obj).forEach((k) => {
        const newKey = keyMapReserveBalGasContract[k] || k
        newObj[newKey] = obj[k]
      })
      return newObj
    })

    exportToXlsxWithNumericDetection(exportData, name)
  } else if (name === 'contract-point-view-modal') {
    exportContractPointViewModal(exportData, extra_obj?.nomination_points ?? [], name)
  } else {
    // ===================== ของเดิม ก่อนจะสร้าง row blank =====================
    // const worksheet = XLSX.utils.json_to_sheet(exportData); // เดิม ๆ
    // const workbook: any = XLSX.utils.book_new();

    // // auto จัดขนาด width column fit content
    // const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
    //     wch: Math.max(
    //         key.length, // Header width
    //         ...exportData.map((row?: any) => row[key] ? row[key].toString().length : 0) // Max content width
    //     )
    // }));
    // worksheet["!cols"] = columnWidths; // Set column widths

    // XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    // XLSX.writeFile(workbook, `${name}.xlsx`);

    // ================================================================================

    // originalExport(exportData, name);
    exportToXlsxWithNumericDetection(exportData, name)
  }
}

const formatExcelDate = (value: any): string => {
  if (!value) return ''

  const date = dayjs(value)

  return date.isValid() ? date.format('DD/MM/YYYY') : ''
}

const formatExcelDateTime = (value: any): string => {
  if (!value) return ''

  const date = dayjs(value)

  return date.isValid() ? date.format('DD/MM/YYYY HH:mm') : ''
}

const getFullName = (account: any): string => {
  if (!account) return ''

  const firstName = account?.first_name ?? account?.firstname ?? ''

  const lastName = account?.last_name ?? account?.lastname ?? ''

  return `${firstName} ${lastName}`.trim()
}

const getExcelColumnWidths = (rows: any[] = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return []
  }

  const keys = Object.keys(rows[0])

  return keys.map((key) => {
    const headerLength = key.length

    const maxContentLength = Math.max(...rows.map((row: any) => (row?.[key] == null ? 0 : String(row[key]).length)))

    return {
      // จำกัดไม่ให้ column กว้างเกินไป
      wch: Math.min(Math.max(headerLength, maxContentLength) + 2, 40)
    }
  })
}

const exportContractPointViewModal = (contractPointData: any[] = [], nominationPointData: any[] = [], fileName: string = 'contract-point-view-modal') => {
  const workbook = XLSXStyle.utils.book_new()

  // =========================
  // Sheet 1: Contract Point
  // =========================
  const contractPointRows = Array.isArray(contractPointData) ? contractPointData : []

  const contractPointWorksheet = XLSXStyle.utils.json_to_sheet(contractPointRows)

  contractPointWorksheet['!cols'] = getExcelColumnWidths(contractPointRows)

  XLSXStyle.utils.book_append_sheet(workbook, contractPointWorksheet, 'Contract Point')

  // =========================
  // Sheet 2: Nomination Point
  // =========================
  const nominationPointRows = (Array.isArray(nominationPointData) ? nominationPointData : []).map((item: any, index: number) => ({
    'Nomination Point Start Date': formatExcelDate(item?.nomination_point_start_date ?? item?.start_date),

    'Nomination Point End Date': formatExcelDate(item?.nomination_point_end_date ?? item?.end_date),

    'Nomination Point': item?.nomination_point ?? '',

    'Created By': getFullName(item?.create_by_account ?? item?.created_by_account ?? item?.account),

    'Created Date': formatExcelDateTime(item?.create_date ?? item?.created_date ?? item?.created_at)
  }))

  /*
   * json_to_sheet([]) จะไม่ได้ header
   * จึงกำหนด header ไว้เพื่อให้ Sheet 2 ยังมีหัวตาราง
   * แม้ไม่มีข้อมูล
   */
  const nominationPointWorksheet = XLSXStyle.utils.json_to_sheet(nominationPointRows, {
    header: ['Nomination Point Start Date', 'Nomination Point End Date', 'Nomination Point', 'Created By', 'Created Date']
  })

  nominationPointWorksheet['!cols'] = [{wch: 30}, {wch: 28}, {wch: 28}, {wch: 25}, {wch: 22}]

  XLSXStyle.utils.book_append_sheet(workbook, nominationPointWorksheet, 'Nomination Points')

  XLSXStyle.writeFile(workbook, `${fileName}.xlsx`)
}

const calculateRowHeight = (row: any[], columnWidths: {wch: number}[], baseHeight = 20) => {
  let maxLines = 1

  row.forEach((value, colIndex) => {
    if (value == null) return

    const text = String(value)
    const columnWidth = columnWidths[colIndex]?.wch || 10

    // แยกบรรทัดจาก \n / \r\n
    const explicitLines = text.split(/\r?\n/)

    let totalLines = 0

    explicitLines.forEach((line) => {
      // ประมาณจำนวนบรรทัดถ้าข้อความยาวเกินความกว้าง column
      const wrappedLines = Math.max(1, Math.ceil(line.length / Math.max(columnWidth, 1)))

      totalLines += wrappedLines
    })

    maxLines = Math.max(maxLines, totalLines)
  })

  return Math.max(baseHeight, maxLines * baseHeight)
}

export const exportToXlsxWithNumericDetection = (exportData: any[], name = 'Export.xlsx') => {
  if (!Array.isArray(exportData) || exportData.length === 0) return

  // =========================================================
  // 1) JSON -> worksheet
  // =========================================================
  const worksheet = XLSXStyle.utils.json_to_sheet(exportData, {
    skipHeader: false
  })

  // =========================================================
  // 2) worksheet -> AOA
  // =========================================================
  const sheetData: any[][] = XLSXStyle.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: ''
  })

  // =========================================================
  // 3) AOA -> worksheet ใหม่
  // =========================================================
  const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData)

  const workbook: any = XLSXStyle.utils.book_new()

  // =========================================================
  // 4) Header
  // =========================================================
  const headers: string[] = (sheetData[0] || []) as string[]

  // =========================================================
  // 5) Auto column width
  //
  // ถ้ามี \n จะใช้ความยาวของ "บรรทัดที่ยาวที่สุด"
  // ไม่ใช่ความยาว string ทั้งก้อน
  // =========================================================
  const columnWidths = headers.map((key) => {
    const headerLength = String(key || '').length

    const contentLengths = exportData.map((row?: any) => {
      const value = row?.[key]

      if (value == null) {
        return 0
      }

      const lines = String(value).split(/\r?\n/)

      return Math.max(0, ...lines.map((line) => line.length))
    })

    const maxLength = Math.max(headerLength, ...contentLengths)

    return {
      // ป้องกัน column กว้างมากเกินไป
      wch: Math.min(Math.max(maxLength + 2, 10), 80)
    }
  })

  newWorksheet['!cols'] = columnWidths

  // =========================================================
  // 6) Styling / Numeric detection
  // =========================================================
  if (newWorksheet['!ref']) {
    const range = XLSXStyle.utils.decode_range(newWorksheet['!ref'])

    newWorksheet['!rows'] = newWorksheet['!rows'] || []

    // =====================================================
    // HEADER STYLE
    // =====================================================
    const headerRowIndex = 0

    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSXStyle.utils.encode_cell({
        r: headerRowIndex,
        c
      })

      const cell = newWorksheet[addr]

      if (!cell) continue

      cell.s = {
        ...(cell.s || {}),
        alignment: {
          ...(cell.s?.alignment || {}),
          horizontal: 'center',
          vertical: 'center',
          wrapText: true
        },
        font: {
          ...(cell.s?.font || {}),
          bold: true
        }
      }
    }

    newWorksheet['!rows'][headerRowIndex] = {
      hpt: 20
    }

    // =====================================================
    // BODY
    // เปิด wrapText + dynamic row height
    // =====================================================
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const rowData = sheetData[r] || []

      // คำนวณความสูง row
      const rowHeight = calculateRowHeight(rowData, columnWidths, 20)

      newWorksheet['!rows'][r] = {
        hpt: rowHeight
      }

      // เปิด wrap text ทุก cell
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSXStyle.utils.encode_cell({
          r,
          c
        })

        const cell = newWorksheet[addr]

        if (!cell) continue

        cell.s = {
          ...(cell.s || {}),
          alignment: {
            ...(cell.s?.alignment || {}),
            vertical: 'top',
            wrapText: true
          }
        }
      }
    }

    // =====================================================
    // Numeric column detection
    // =====================================================
    type ColMeta = {
      isNumeric: boolean
      maxFrac: number
    }

    const colMeta = new Map<string, ColMeta>()

    for (const h of headers) {
      // เบอร์โทร ห้าม detect เป็น number
      if (isTelephoneKey(h)) {
        colMeta.set(h, {
          isNumeric: false,
          maxFrac: 0
        })

        continue
      }

      const values = exportData.map((row: any) => row?.[h]).filter((value: any) => value !== null && value !== undefined && String(value).trim() !== '')

      // ต้องมีข้อมูลอย่างน้อย 1 ค่า
      // และทุกค่าต้องเป็น numeric-like
      const isNumericCol = values.length > 0 && values.every((value: any) => isNumericLike(value))

      let maxFrac = 0

      if (isNumericCol) {
        for (const row of exportData) {
          const raw = row?.[h]

          if (raw === null || raw === undefined || String(raw).trim() === '') {
            continue
          }

          // ใช้ raw string เพื่อนับทศนิยมจริง
          // เช่น 10.0000 => 4
          const frac = countFractionDigitsFromString(raw)

          if (frac > maxFrac) {
            maxFrac = frac
          }
        }
      }

      colMeta.set(h, {
        isNumeric: isNumericCol,
        maxFrac
      })
    }

    // =====================================================
    // Apply telephone / numeric formatting
    // =====================================================
    for (let c = range.s.c; c <= range.e.c; c++) {
      const key = headers[c]

      // =================================================
      // TELEPHONE
      // =================================================
      if (isTelephoneKey(key)) {
        for (let r = range.s.r + 1; r <= range.e.r; r++) {
          const addr = XLSXStyle.utils.encode_cell({
            r,
            c
          })

          const cell = newWorksheet[addr]

          if (!cell) continue

          // บังคับเป็น string
          cell.v = cell.v != null ? String(cell.v) : ''
          ;(cell as any).t = 's'

          // ลบ number format
          delete (cell as any).z

          cell.s = {
            ...(cell.s || {}),
            alignment: {
              ...(cell.s?.alignment || {}),
              horizontal: 'left',
              vertical: 'top',
              wrapText: true
            }
          }
        }

        continue
      }

      // =================================================
      // NUMERIC
      // =================================================
      const meta = colMeta.get(key)

      if (!meta || !meta.isNumeric) {
        continue
      }

      const numFmt = buildNumberFormat(meta.maxFrac)

      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        const addr = XLSXStyle.utils.encode_cell({
          r,
          c
        })

        const cell = newWorksheet[addr]

        if (!cell) continue

        // ชิดขวา
        // แต่ยังคง wrapText ไว้
        cell.s = {
          ...(cell.s || {}),
          alignment: {
            ...(cell.s?.alignment || {}),
            horizontal: 'right',
            vertical: 'top',
            wrapText: true
          }
        }

        // String numeric -> Number
        if (typeof cell.v === 'string' && isNumericLike(cell.v)) {
          const n = parseNumericLike(cell.v)

          if (n != null) {
            cell.v = n
            ;(cell as any).t = 'n'

            cell.z = numFmt
          }
        }

        // เป็น number อยู่แล้ว
        else if (typeof cell.v === 'number') {
          cell.z = numFmt
        }
      }
    }
  }

  // =========================================================
  // 7) Append sheet
  // =========================================================
  XLSXStyle.utils.book_append_sheet(workbook, newWorksheet, 'Sheet1')

  // =========================================================
  // 8) Export
  // =========================================================
  XLSXStyle.writeFile(workbook, name.endsWith('.xlsx') ? name : `${name}.xlsx`)
}

// export const exportToXlsxWithNumericDetection = (exportData: any[], name = "Export.xlsx") => {
//     if (!Array.isArray(exportData) || exportData.length === 0) return;
//     // 1) JSON -> worksheet
//     const worksheet = XLSXStyle.utils.json_to_sheet(exportData, { skipHeader: false });

//     // 2) worksheet -> AOA
//     const sheetData: any[][] = XLSXStyle.utils.sheet_to_json(worksheet, { header: 1 });

//     // 3) AOA -> worksheet ใหม่ที่จะปรับสไตล์
//     const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData);
//     const workbook: any = XLSXStyle.utils.book_new();

//     // 4) ชื่อคอลัมน์ + ออโต้ความกว้าง
//     const headers: string[] = (sheetData[0] || []) as string[];
//     const columnWidths = headers.map((key) => ({
//         wch: Math.max(
//             String(key || "").length,
//             ...exportData.map((row?: any) => (row && row[key] != null ? String(row[key]).length : 0))
//         ),
//     }));
//     newWorksheet["!cols"] = columnWidths;

//     if (newWorksheet["!ref"]) {
//         const range = XLSXStyle.utils.decode_range(newWorksheet["!ref"]);

//         // 5) จัดกลางหัวตาราง + ตัวหนา
//         const headerRowIndex = 0;
//         for (let c = range.s.c; c <= range.e.c; c++) {
//             const addr = XLSXStyle.utils.encode_cell({ r: headerRowIndex, c });
//             const cell = newWorksheet[addr];
//             if (!cell) continue;
//             cell.s = {
//                 ...(cell.s || {}),
//                 alignment: { ...(cell.s?.alignment || {}), horizontal: "center", vertical: "center" },
//                 font: { ...(cell.s?.font || {}), bold: true },
//             };
//         }
//         newWorksheet["!rows"] = newWorksheet["!rows"] || [];
//         newWorksheet["!rows"][headerRowIndex] = { hpt: 20 };

//         // 6) ระบุคอลัมน์ที่เป็น numeric-like และคำนวณ "จำนวนทศนิยมสูงสุด" ต่อคอลัมน์จาก raw exportData
//         type ColMeta = { isNumeric: boolean; maxFrac: number };
//         const colMeta = new Map<string, ColMeta>();

//         for (const h of headers) {
//             if (isTelephoneKey(h)) {                // ⬅️ โทรศัพท์ไม่ใช่ numeric
//                 colMeta.set(h, { isNumeric: false, maxFrac: 0 });
//                 continue;
//             }

//             const isNumericCol = exportData.every((row: any) => isNumericLike(row?.[h]));
//             let maxFrac = 0;

//             if (isNumericCol) {
//                 for (const row of exportData) {
//                     const raw = row?.[h];
//                     // ใช้ raw string เพื่อนับทศนิยมจริง (จะคง .0000 ได้)
//                     const frac = countFractionDigitsFromString(raw);
//                     if (frac > maxFrac) maxFrac = frac;
//                 }
//             }
//             colMeta.set(h, { isNumeric: isNumericCol, maxFrac });
//         }

//         // 7) ชิดขวา + แปลง numeric-like string -> number + ใส่ number format ตาม maxFrac ของคอลัมน์ (คง .0000)
//         for (let c = range.s.c; c <= range.e.c; c++) {
//             const key = headers[c];

//             // เบอร์โทร บังคับเป็น string และไม่ใส่ comma
//             if (isTelephoneKey(key)) {
//                 for (let r = range.s.r + 1; r <= range.e.r; r++) {
//                     const addr = XLSXStyle.utils.encode_cell({ r, c });
//                     const cell = newWorksheet[addr];
//                     if (!cell) continue;

//                     // บังคับเป็นข้อความเสมอ (กัน Excel แปลงเป็นตัวเลข)
//                     cell.v = cell.v != null ? String(cell.v) : '';
//                     (cell as any).t = 's';
//                     delete (cell as any).z; // ไม่ใช้ number format
//                     cell.s = {
//                         ...(cell.s || {}),
//                         alignment: { ...(cell.s?.alignment || {}), horizontal: 'left' }, // โทรศัพท์มักชิดซ้าย
//                     };
//                 }
//                 continue; // ⬅️ ข้าม logic numeric
//             }

//             const meta = colMeta.get(key);
//             if (!meta || !meta.isNumeric) continue;

//             const numFmt = buildNumberFormat(meta.maxFrac); // เช่น "#,##0.0000" ถ้า maxFrac=4

//             for (let r = range.s.r + 1; r <= range.e.r; r++) {
//                 const addr = XLSXStyle.utils.encode_cell({ r, c });
//                 const cell = newWorksheet[addr];
//                 if (!cell) continue;

//                 // ชิดขวา
//                 cell.s = {
//                     ...(cell.s || {}),
//                     alignment: { ...(cell.s?.alignment || {}), horizontal: "right" },
//                 };

//                 // แปลงค่าเป็น number เมื่อเป็นสตริงตัวเลข เพื่อให้ Excel ใช้ number format และคำนวณได้
//                 if (typeof cell.v === "string" && isNumericLike(cell.v)) {
//                     const n = parseNumericLike(cell.v);
//                     if (n != null) {
//                         cell.v = n;
//                         (cell as any).t = "n";
//                         cell.z = numFmt; // ใช้ฟอร์แมตตามจำนวนทศนิยมสูงสุดของคอลัมน์
//                     }
//                 } else if (typeof cell.v === "number") {
//                     cell.z = numFmt;
//                 }
//             }
//         }
//     }

//     // 8) Append & write
//     XLSXStyle.utils.book_append_sheet(workbook, newWorksheet, "Sheet1");
//     XLSXStyle.writeFile(workbook, name.endsWith(".xlsx") ? name : `${name}.xlsx`);
// }

// helper: ระบุคีย์โทรศัพท์
const isTelephoneKey = (h?: string) => {
  if (!h) return false
  const norm = String(h).toLowerCase().replace(/\s+|_/g, '')
  return /^(tel|telephone|phone|mobile|mobilephone|contactphone)$/.test(norm)
}

export const exportAllocReview = (exportData: Record<string, any>[], name: string, extra_obj: Record<string, any>) => {
  if (!exportData?.length) return

  const topKeys = Object.keys(extra_obj || {})
  const topHeaderRow = topKeys
  const topDataRow = topKeys.map((key) => extra_obj?.[key] ?? '')

  const worksheetFromData = XLSXStyle.utils.json_to_sheet(exportData, {skipHeader: false})
  const dataAsArray: any[][] = XLSXStyle.utils.sheet_to_json(worksheetFromData, {header: 1})

  const finalData = [topHeaderRow, topDataRow, [], ...dataAsArray]

  // แปลง Array ธรรมดาให้เป็น Worksheet พร้อมใส่ Style
  const finalWorksheet = XLSXStyle.utils.aoa_to_sheet(finalData)

  // วนลูปเช็คทุก Cell เพื่อจัดชิดขวา
  const range = XLSXStyle.utils.decode_range(finalWorksheet['!ref']!)
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = XLSXStyle.utils.encode_cell({r: R, c: C})
      if (!finalWorksheet[cell_address]) continue

      const value = finalWorksheet[cell_address].v

      // ตรวจสอบว่าเป็นตัวเลข หรือ String ที่ดูเหมือนตัวเลข (มี comma, มีจุดทศนิยม)
      const isNumber = typeof value === 'number'
      const isNumericString = typeof value === 'string' && /^-?\d{1,3}(,\d{3})*(\.\d+)?$/.test(value.trim())

      if (isNumber || isNumericString) {
        // ใส่ Style ให้ชิดขวา
        finalWorksheet[cell_address].s = {
          alignment: {
            horizontal: 'right',
            vertical: 'center'
          }
        }
      }
    }
  }

  // ปรับขนาดคอลัมน์อัตโนมัติ (เหมือนเดิม)
  const columnWidths = finalData[0].map((_, colIndex) => {
    const maxLen = Math.max(...finalData.map((r) => (r[colIndex] ? r[colIndex].toString().length : 0)))
    return {wch: maxLen + 5} // เผื่อระยะขอบนิดหน่อย
  })
  finalWorksheet['!cols'] = columnWidths

  const workbook = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(workbook, finalWorksheet, 'Sheet1')
  XLSXStyle.writeFile(workbook, `${name}.xlsx`)
}

export const exportShipperNomReportAll = (exportData?: any, name?: any, extra_obj?: any) => {
  // ที่ row 1 เพิ่ม 3 column 1. Gas Day 2.Shipper Name 3.Area
  // ที่ row 2 ใช้ข้อมูลจาก extra_obj เรียงตามนี้ 1.extra_obj.gas_day 2.extra_obj.shipper_name 3.extra_obj.area_text

  const worksheet = XLSXStyle.utils.json_to_sheet(exportData, {skipHeader: false})
  const sheetData: any[][] = XLSXStyle.utils.sheet_to_json(worksheet, {header: 1})

  // ✅ ข้อมูลข้างบน
  const customHeaderRow = ['Gas Day', 'Shipper Name', 'Area']
  // const customDataRow = [extra_obj?.tableData?.gas_day, extra_obj?.tableData?.shipper_name, extra_obj?.tableData?.area_text];
  const customDataRow = [extra_obj?.date ? extra_obj?.date : extra_obj?.tableData?.gas_day, extra_obj?.tableData?.shipper_name, extra_obj?.tableData?.area_text] // https://app.clickup.com/t/86etzchbz
  const emptyRow: any = []

  // ✅ แทรกแถวก่อนข้อมูลจริง
  sheetData.unshift(emptyRow) // แถวว่าง (แถว 3)
  sheetData.unshift(customDataRow) // ข้อมูล (แถว 2)
  sheetData.unshift(customHeaderRow) // หัวข้อ (แถว 1)

  const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData)

  // ✅ ปรับขนาดคอลัมน์อัตโนมัติ
  const columnWidths = sheetData[0].map((_, colIndex) => {
    const colValues = sheetData.map((row) => (row[colIndex] ? row[colIndex].toString() : ''))
    const maxLength = Math.max(...colValues.map((val) => val.length))
    return {wch: maxLength}
  })
  newWorksheet['!cols'] = columnWidths

  // ✅ สร้างไฟล์
  const workbook: any = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(workbook, newWorksheet, 'Sheet1')
  XLSXStyle.writeFile(workbook, `${name}.xlsx`)
}

export const exportShipperNomReportView = (exportData?: any, name?: any, extra_obj?: any) => {
  // ที่ row 1 เพิ่ม 3 column 1. Gas Day 2.Shipper Name 3.Area
  // ที่ row 2 ใช้ข้อมูลจาก extra_obj เรียงตามนี้ 1.extra_obj.gas_day 2.extra_obj.shipper_name 3.extra_obj.area_text

  const worksheet = XLSXStyle.utils.json_to_sheet(exportData, {skipHeader: false})
  const sheetData: any[][] = XLSXStyle.utils.sheet_to_json(worksheet, {header: 1})

  // ✅ เตรียมแถวพิเศษ
  const customHeaderRow = ['Gas Day', 'Shipper Name']
  // item?.weeklyDay?.[["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][extra_obj?.subTabIndex]]?.gas_day_text
  const customDataRow = [extra_obj?.tableData?.weeklyDay?.[['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][extra_obj?.subTabIndex]]?.gas_day_text, extra_obj?.tableData?.shipper_name]
  const emptyRow: any = []

  // ✅ แทรกแถวก่อนข้อมูลจริง
  sheetData.unshift(emptyRow) // แถวว่าง (แถว 3)
  sheetData.unshift(customDataRow) // ข้อมูล (แถว 2)
  sheetData.unshift(customHeaderRow) // หัวข้อ (แถว 1)

  const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData)

  // ✅ ปรับขนาดคอลัมน์อัตโนมัติ
  const columnWidths = sheetData[0].map((_, colIndex) => {
    const colValues = sheetData.map((row) => (row[colIndex] ? row[colIndex].toString() : ''))
    const maxLength = Math.max(...colValues.map((val) => val.length))
    return {wch: maxLength}
  })
  newWorksheet['!cols'] = columnWidths

  // ✅ สร้างไฟล์
  const workbook: any = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(workbook, newWorksheet, 'Sheet1')
  XLSXStyle.writeFile(workbook, `${name}.xlsx`)
}

const capitalize = (word: string) => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

// ใช้เฉพาะกิจ export allocation --> allocation shipper report
export const exportCyberpunk = (data_to_export?: any) => {
  const workbook = XLSXStyle.utils.book_new()
  const header = ['Gas Day']

  // Gather all unique points and shipper names
  const allPoints: any = {}
  data_to_export?.forEach((entry: any) => {
    entry?.nomPoint?.forEach((point: any) => {
      const pointName = point.point
      if (!allPoints[pointName]) allPoints[pointName] = new Set()
      point?.data?.forEach((shipper: any) => {
        allPoints[pointName].add(shipper.shipper_name)
      })
    })
  })

  // Build header row
  const pointHeaders: any = []
  Object.keys(allPoints).forEach((point) => {
    allPoints[point] = Array.from(allPoints[point])
    allPoints[point].forEach((shipper: any) => {
      header.push(`${point} - ${shipper}`)
      pointHeaders.push({point, shipper})
    })
    header.push(`${point} - Total`)
    pointHeaders.push({point, type: 'total'})
    header.push(`${point} - Metering`)
    pointHeaders.push({point, type: 'meter'})
  })

  // Fill data rows
  const rows: any = []
  data_to_export.forEach((entry: any) => {
    const row = [entry.gas_day]
    pointHeaders.forEach(({point, shipper, type}: any) => {
      const foundPoint = entry.nomPoint.find((p: any) => p.point === point)
      if (!foundPoint) {
        row.push('')
        return
      }

      if (type === 'total') {
        row.push(foundPoint.total || 0)
      } else if (type === 'meter') {
        row.push(foundPoint.meterValue || 0)
      } else {
        const shipperData = foundPoint.data.find((d: any) => d.shipper_name === shipper)
        row.push(shipperData ? shipperData.allocatedValue : 0)
      }
    })
    rows.push(row)
  })

  // Add total row at the bottom
  const totalRow = ['Total']
  for (let i = 1; i < header.length; i++) {
    const sum = rows.reduce((acc: any, row: any) => acc + (typeof row[i] === 'number' ? row[i] : 0), 0)
    totalRow.push(sum)
  }
  rows.push(totalRow)

  // Combine header and rows
  const sheetData = [header, ...rows]
  const worksheet = XLSXStyle.utils.aoa_to_sheet(sheetData)
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Gas Allocation')
  XLSXStyle.writeFile(workbook, 'gas_allocation.xlsx')
}

// ใช้เฉพาะกิจ export allocation --> allocation shipper report
export const exportCyberpunk2 = (data?: any) => {
  const points: any = {}
  data?.forEach((entry: any) => {
    entry?.nomPoint?.forEach((point: any) => {
      if (!points[point.point]) points[point.point] = new Set()
      point.data.forEach((d: any) => points[point.point].add(d.shipper_name))
    })
  })

  const orderedPoints = Object.keys(points)
  const pointShippers: any = {}
  orderedPoints.forEach((p) => {
    pointShippers[p] = Array.from(points[p])
  })

  // Build first header row
  const headerRow1 = ['Gas Day']
  orderedPoints.forEach((point) => {
    const colSpan = pointShippers[point].length + 2 // shipper columns + total + metering
    for (let i = 0; i < colSpan; i++) {
      headerRow1.push(point)
    }
  })
  headerRow1.push('Total')

  // Build second header row
  const headerRow2 = ['Gas Day']
  orderedPoints.forEach((point) => {
    pointShippers[point].forEach((shipper: any) => {
      headerRow2.push(shipper)
    })
    headerRow2.push('Total')
    headerRow2.push('Metering')
  })
  headerRow2.push('Total')

  const rows = [headerRow1, headerRow2]

  // Build data rows
  data?.forEach((entry: any) => {
    const row = [entry.gas_day]
    let rowTotal = 0

    orderedPoints.forEach((point) => {
      const pointEntry = entry.nomPoint.find((p: any) => p.point === point)
      const shipperMap: any = {}
      ;(pointEntry?.data || []).forEach((d: any) => {
        shipperMap[d.shipper_name] = d.allocatedValue
      })

      pointShippers[point].forEach((shipper: any) => {
        const val = shipperMap[shipper] || 0
        row.push(val)
        rowTotal += val
      })

      const pointTotal = pointEntry?.total || 0
      row.push(pointTotal)
      rowTotal += pointTotal

      row.push(pointEntry?.meterValue ?? null)
    })

    row.push(rowTotal)
    rows.push(row)
  })

  // Convert to worksheet
  const worksheet = XLSXStyle.utils.aoa_to_sheet(rows)

  // Create workbook
  const workbook = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Gas Allocation')

  // Export
  XLSXStyle.writeFile(workbook, 'Allocation_shipper_report_download.xlsx')
}

// ใช้เฉพาะกิจ export allocation --> allocation shipper report
// อันนี้ไม่เว้น row แรก
export const exportCyberpunk3 = (data?: any) => {
  const points: any = {}
  data?.forEach((entry: any) => {
    entry.nomPoint.forEach((point: any) => {
      if (!points[point.point]) points[point.point] = new Set()
      point?.data?.forEach((d: any) => points[point.point].add(d.shipper_name))
    })
  })

  const orderedPoints = Object.keys(points)
  const pointShippers: any = {}
  orderedPoints.forEach((p) => {
    pointShippers[p] = Array.from(points[p])
  })

  const headerRow1 = ['Gas Day']
  const headerRow2 = ['']
  const merges = []

  let colIndex = 1

  orderedPoints.forEach((point) => {
    const colSpan = pointShippers[point].length + 2 // shipper + total + metering

    // Create merge instruction for row 0 (first row)
    merges.push({
      s: {r: 0, c: colIndex}, // start: row 0, column colIndex
      e: {r: 0, c: colIndex + colSpan - 1} // end: row 0, column colIndex + span
    })

    // Push header cells
    for (let i = 0; i < pointShippers[point].length; i++) {
      headerRow2.push(pointShippers[point][i])
    }
    headerRow2.push('Total')
    headerRow2.push('Metering')

    for (let i = 0; i < colSpan; i++) {
      headerRow1.push(point)
    }

    colIndex += colSpan
  })

  headerRow1.push('Total')
  headerRow2.push('Total')
  merges.push({
    s: {r: 0, c: colIndex}, // Merge "Total" at end
    e: {r: 1, c: colIndex}
  })

  const rows = [headerRow1, headerRow2]

  // Data rows
  data?.forEach((entry: any) => {
    // const row = [entry.gas_day];
    const row = [toDayjs(entry.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY')]
    let rowTotal: any = 0

    orderedPoints.forEach((point) => {
      const pointEntry = entry.nomPoint.find((p: any) => p.point === point)
      const shipperMap: any = {}
      ;(pointEntry?.data || []).forEach((d: any) => {
        shipperMap[d.shipper_name] = d.allocatedValue
      })

      pointShippers[point].forEach((shipper: any) => {
        const val = shipperMap[shipper] || 0
        row.push(formatNumberFourDecimal(val))
        rowTotal += val
      })

      const pointTotal = pointEntry?.total || 0
      row.push(pointTotal ? formatNumberFourDecimal(pointTotal) : '0.000')
      rowTotal += pointTotal

      row.push(pointEntry?.meterValue ? formatNumberFourDecimal(pointEntry?.meterValue) : '0.000')
    })

    row.push(rowTotal)
    rows.push(row)
  })

  const worksheet = XLSXStyle.utils.aoa_to_sheet(rows)
  worksheet['!merges'] = merges

  const workbook = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Gas Allocation')
  XLSXStyle.writeFile(workbook, 'Gas_Allocation_MergedHeader.xlsx')
}

/** ตรวจว่า value เป็นตัวเลขหรือ "สตริงที่เป็นตัวเลข" เช่น "1,234.56", "-49,797.4251" */
const isNumericLike = (v: any): boolean => {
  if (v == null) return true
  if (typeof v === 'number') return true
  if (typeof v !== 'string') return false
  const s = v.trim()
  if (!s) return true
  const re = /^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/
  return re.test(s)
}

/** แปลง "สตริงตัวเลข" -> number (ปลอดภัย) */
const parseNumericLike = (v: any): number | null => {
  if (typeof v === 'number') return v
  if (typeof v !== 'string') return null
  const s = v.trim().replace(/,/g, '')
  if (s === '' || isNaN(Number(s))) return null
  return Number(s)
}

// นับจำนวนหลักทศนิยมของสตริงตัวเลข (จาก raw string เพื่อคง .0000)
const countFractionDigitsFromString = (v: any): number => {
  if (typeof v !== 'string') return 0
  const s = v.trim().replace(/,/g, '')
  const idx = s.indexOf('.')
  return idx === -1 ? 0 : Math.max(0, s.length - idx - 1)
}

// สร้างรูปแบบฟอร์แมตตามจำนวนทศนิยมสูงสุดของคอลัมน์
const buildNumberFormat = (maxFrac: number) => (maxFrac > 0 ? `#,##0.${'0'.repeat(maxFrac)}` : '#,##0')

export const exportHistoryDailyAdjustImbal = (exportData: Record<string, any>[], name: string, extra_obj: Record<string, any>) => {
  // 1) JSON -> worksheet
  const ws0 = XLSXStyle.utils.json_to_sheet(exportData, {skipHeader: false})

  // 2) worksheet -> AOA
  const sheetData: any[][] = XLSXStyle.utils.sheet_to_json(ws0, {header: 1})
  const newWorksheet = XLSXStyle.utils.aoa_to_sheet(sheetData)

  // 3) auto width
  const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...exportData.map((row?: any) => {
        const v = row?.[key]
        return v == null ? 0 : String(v).length
      })
    )
  }))
  newWorksheet['!cols'] = columnWidths

  if (newWorksheet['!ref']) {
    const range = XLSXStyle.utils.decode_range(newWorksheet['!ref'])
    const headers: string[] = (sheetData[0] || []) as string[]

    // 4) จัดกลางหัวคอลัมน์
    const headerRowIndex = 0
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSXStyle.utils.encode_cell({r: headerRowIndex, c})
      const cell = newWorksheet[addr]
      if (!cell) continue
      cell.s = {
        ...(cell.s || {}),
        alignment: {...(cell.s?.alignment || {}), horizontal: 'center', vertical: 'center'},
        font: {...(cell.s?.font || {}), bold: true}
      }
    }
    newWorksheet['!rows'] = newWorksheet['!rows'] || []
    newWorksheet['!rows'][headerRowIndex] = {hpt: 20}

    // 5) หา "คอลัมน์ตัวเลข" = ทุกค่าที่ไม่ว่างเป็น number หรือนิยาม numeric-like
    const numericKeys = new Set(headers.filter((h) => exportData.every((row: any) => isNumericLike(row?.[h]))))

    // 6) ชิดขวา + (ตัวเลือก) แปลงเป็น number + ใส่ number format
    for (let c = range.s.c; c <= range.e.c; c++) {
      const key = headers[c]
      if (!numericKeys.has(key)) continue

      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        const addr = XLSXStyle.utils.encode_cell({r, c})
        const cell = newWorksheet[addr]
        if (!cell) continue

        // จัดชิดขวา
        cell.s = {
          ...(cell.s || {}),
          alignment: {...(cell.s?.alignment || {}), horizontal: 'right'}
        }

        // ถ้าเป็นสตริงตัวเลข ให้แปลงเป็น number เพื่อใช้ number format ได้ใน Excel
        if (typeof cell.v === 'string' && isNumericLike(cell.v)) {
          const n = parseNumericLike(cell.v)
          if (n != null) {
            cell.v = n
            ;(cell as any).t = 'n' // บอก Excel ว่านี่คือ number
            cell.z = cell.z || '#,##0.####' // ฟอร์แมตตัวเลข (ปรับตามต้องการ)
          }
        } else if (typeof cell.v === 'number') {
          cell.z = cell.z || '#,##0.####'
        }
      }
    }
  }

  // 7) write
  const wb = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(wb, newWorksheet, 'Sheet1')
  XLSXStyle.writeFile(wb, name.endsWith('.xlsx') ? name : `${name}.xlsx`)
}

// ใช้เฉพาะกิจ export allocation --> allocation shipper report
// อันนี้เว้น row แรก
export const exportCyberpunk4 = async (data?: any) => {
  const points: any = {}
  data?.forEach((entry: any) => {
    entry?.nomPoint?.forEach((point: any) => {
      if (!points[point.point]) points[point.point] = new Set()
      point?.data?.forEach((d: any) => points[point.point].add(d.shipper_name))
    })
  })

  const orderedPoints = Object.keys(points)
  const pointShippers: any = {}
  orderedPoints.forEach((p) => {
    pointShippers[p] = Array.from(points[p])
  })

  const headerRow1 = ['Gas Day']
  const headerRow2 = ['']
  const merges = []

  let colIndex = 1

  orderedPoints.forEach((point) => {
    const colSpan = pointShippers[point].length + 2 // shipper + total + metering
    merges.push({
      s: {r: 1, c: colIndex}, // start: row 0, column colIndex
      e: {r: 1, c: colIndex + colSpan - 1} // end: row 0, column colIndex + span
    })

    // Push header cells
    for (let i = 0; i < pointShippers[point].length; i++) {
      headerRow2.push(pointShippers[point][i])
    }
    headerRow2.push('Total')
    headerRow2.push('Metering')

    for (let i = 0; i < colSpan; i++) {
      headerRow1.push(point)
    }

    colIndex += colSpan
  })

  headerRow1.push('Total')
  headerRow2.push('Total')
  merges.push({
    s: {r: 1, c: colIndex},
    e: {r: 2, c: colIndex}
  })

  const rows = [[''] /* blank row */, headerRow1, headerRow2]

  // Data rows
  data?.forEach((entry: any) => {
    // const row = [entry.gas_day];
    const row = [toDayjs(entry.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY')]
    let rowTotal: any = 0

    orderedPoints.forEach((point) => {
      const pointEntry = entry.nomPoint.find((p: any) => p.point === point)
      const shipperMap: any = {}
      ;(pointEntry?.data || []).forEach((d: any) => {
        shipperMap[d.shipper_name] = d.allocatedValue
      })

      pointShippers[point].forEach((shipper: any) => {
        const val = shipperMap[shipper] || 0
        row.push(formatNumberFourDecimal(val))
        rowTotal += val
      })

      const pointTotal = pointEntry?.total || 0
      row.push(pointTotal ? formatNumberFourDecimal(pointTotal) : '0.000')
      rowTotal += pointTotal

      row.push(pointEntry?.meterValue ? formatNumberFourDecimal(pointEntry?.meterValue) : '0.000')
    })

    row.push(rowTotal)
    rows.push(row)
  })

  const worksheet = XLSXStyle.utils.aoa_to_sheet(rows)
  worksheet['!merges'] = merges

  const workbook = XLSXStyle.utils.book_new()
  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Gas Allocation')
  XLSXStyle.writeFile(workbook, 'allocation-summary-shipper-report.xlsx')
}

function dataUrlToImageBuffer(input: string) {
  if (!input) return null

  const s = String(input).trim()

  // รับทั้ง dataURL และ raw base64
  const m = s.match(/^data:image\/(png|jpe?g);base64,([\s\S]+)$/i)
  const extRaw = (m?.[1] || 'png').toLowerCase().replace('jpg', 'jpeg')
  const extension = (extRaw === 'jpeg' ? 'jpeg' : 'png') as 'png' | 'jpeg'
  const b64 = (m?.[2] || s).replace(/\s/g, '') // ล้าง \n/space

  // base64 -> Uint8Array (browser)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)

  return {buffer: bytes, extension}
}

export const exportCyberpunk4_2 = async (data?: any, originRow?: any) => {
  const signature_base_64 = originRow?.create_by_account?.signature_base_64 || null

  const points: any = {}
  data?.forEach((entry: any) => {
    entry?.nomPoint?.forEach((point: any) => {
      if (!points[point.point]) points[point.point] = new Set()
      point?.data?.forEach((d: any) => points[point.point].add(d.shipper_name))
    })
  })

  const orderedPoints = Object.keys(points)
  const pointShippers: any = {}
  orderedPoints.forEach((p) => (pointShippers[p] = Array.from(points[p])))

  const headerRow1 = ['Gas Day']
  const headerRow2 = ['']
  const merges: any[] = []
  let colIndex = 1

  orderedPoints.forEach((point) => {
    const colSpan = pointShippers[point].length + 2
    merges.push({
      s: {r: 1, c: colIndex},
      e: {r: 1, c: colIndex + colSpan - 1}
    })

    for (let i = 0; i < pointShippers[point].length; i++) headerRow2.push(pointShippers[point][i])
    headerRow2.push('Total')
    headerRow2.push('Metering')

    for (let i = 0; i < colSpan; i++) headerRow1.push(point)

    colIndex += colSpan
  })

  headerRow1.push('Total')
  headerRow2.push('Total')
  merges.push({s: {r: 1, c: colIndex}, e: {r: 2, c: colIndex}})

  const rows: any[] = [[''], headerRow1, headerRow2]

  data?.forEach((entry: any) => {
    const row = [toDayjs(entry.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY')]
    let rowTotal: any = 0

    orderedPoints.forEach((point) => {
      const pointEntry = entry.nomPoint.find((p: any) => p.point === point)
      const shipperMap: any = {}
      ;(pointEntry?.data || []).forEach((d: any) => (shipperMap[d.shipper_name] = d.allocatedValue))

      pointShippers[point].forEach((shipper: any) => {
        const val = shipperMap[shipper] || 0
        row.push(formatNumberFourDecimal(val))
        rowTotal += val
      })

      const pointTotal = pointEntry?.total || 0
      row.push(pointTotal ? formatNumberFourDecimal(pointTotal) : '0.000')
      rowTotal += pointTotal

      row.push(pointEntry?.meterValue ? formatNumberFourDecimal(pointEntry?.meterValue) : '0.000')
    })

    row.push(rowTotal)
    rows.push(row)
  })

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Gas Allocation')

  rows.forEach((r) => ws.addRow(r))

  merges.forEach((m) => {
    ws.mergeCells(m.s.r + 1, m.s.c + 1, m.e.r + 1, m.e.c + 1)
  })

  // ===== STYLE TABLE =====
  const lastCol = ws.columnCount
  const lastDataRow = rows.length // แถวข้อมูลก่อน signature

  // สี header น้ำเงิน
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {argb: 'FF0B2A66'} // น้ำเงินเข้ม
  }

  const borderStyle = {
    top: {style: 'thin', color: {argb: 'FF000000'}},
    left: {style: 'thin', color: {argb: 'FF000000'}},
    bottom: {style: 'thin', color: {argb: 'FF000000'}},
    right: {style: 'thin', color: {argb: 'FF000000'}}
  }

  // ใส่เส้นตารางทุก cell ในตาราง
  for (let r = 2; r <= lastDataRow; r++) {
    const row = ws.getRow(r)

    for (let c = 1; c <= lastCol; c++) {
      const cell: any = row.getCell(c)

      cell.border = borderStyle
      cell.alignment = {
        vertical: 'middle',
        horizontal: r <= 3 ? 'center' : c === 1 ? 'center' : 'right'
      }

      // header row 2-3
      if (r === 2 || r === 3) {
        cell.fill = headerFill as any
        cell.font = {
          color: {argb: 'FFFFFFFF'},
          bold: true
        }
      }
    }
  }

  // ปรับความสูง header
  ws.getRow(2).height = 22
  ws.getRow(3).height = 22

  // ปรับความกว้าง column
  ws.columns.forEach((col: any, index: number) => {
    col.width = index === 0 ? 14 : 16
  })
  // -----

  ws.addRow([]) // เว้น 1 บรรทัด
  // const sigRow = ws.addRow([`( ${originRow?.create_by_account?.first_name} ${originRow?.create_by_account?.last_name} )`]);
  // ws.mergeCells(sigRow.number, 1, sigRow.number, 4);

  // const imgInfo: any = signature_base_64 ? dataUrlToImageBuffer(signature_base_64) : null;
  // if (imgInfo) {
  //     const imgStartRow = ws.rowCount + 1;

  //     for (let i = 0; i < 7; i++) ws.addRow([]);
  //     for (let r = imgStartRow; r < imgStartRow + 7; r++) ws.getRow(r).height = 20;

  //     const imageId = wb.addImage({
  //         buffer: imgInfo.buffer,
  //         extension: imgInfo.extension,
  //     });

  //     ws.addImage(imageId, `A${imgStartRow}:D${imgStartRow + 6}`);
  // }

  const signerName = `${originRow?.create_by_account?.first_name || ''} ${originRow?.create_by_account?.last_name || ''}`.trim()

  const sigStartRow = ws.rowCount + 2

  const sigEndCol = lastCol
  const sigStartCol = Math.max(1, lastCol - 1) // ขวาสุด 2 columns

  for (let i = 0; i < 8; i++) {
    ws.addRow([])
    ws.getRow(sigStartRow + i).height = 22
  }

  // รูปลายเซ็น
  const imgInfo: any = signature_base_64 ? dataUrlToImageBuffer(signature_base_64) : null

  if (imgInfo) {
    const imageId = wb.addImage({
      buffer: imgInfo.buffer,
      extension: imgInfo.extension
    })
    console.log('sigStartCol : ', sigStartCol)
    ws.addImage(imageId, {
      tl: {
        // col: sigStartCol - 1 + 0.35,
        // row: sigStartRow - 1 + 0.2,
        col: sigStartCol,
        row: sigStartRow
      },
      ext: {
        width: 130,
        height: 60
      }
    })
  }

  // เส้นเซ็น
  const lineRow = sigStartRow + 4
  ws.mergeCells(lineRow, sigStartCol, lineRow, sigEndCol)
  ws.getCell(lineRow, sigStartCol).value = `( ........................................ )`
  ws.getCell(lineRow, sigStartCol).alignment = {
    horizontal: 'center',
    vertical: 'middle'
  }

  // ชื่อ
  const nameRow = sigStartRow + 5
  ws.mergeCells(nameRow, sigStartCol, nameRow, sigEndCol)
  ws.getCell(nameRow, sigStartCol).value = signerName
  ws.getCell(nameRow, sigStartCol).alignment = {
    horizontal: 'center',
    vertical: 'middle'
  }

  const out = await wb.xlsx.writeBuffer()
  saveAs(
    new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }),
    'allocation-summary-shipper-report.xlsx'
  )
}

// export const exportALLOShipperREPORT = (data?: any) => {
//     const original_data: any = data;

//     const points: any = {};
//     original_data?.forEach((entry: any) => {
//         entry?.nomPoint?.forEach((point: any) => {
//             if (!points[point.point]) points[point.point] = new Set();
//             point?.data?.forEach((d: any) => points[point.point].add(d.shipper_name));
//         });
//     });

//     const transferPoint = Object.keys(points);

//     const orderedPoints = transferPoint?.sort((a: any, b: any) => {
//         const pointA = a || "";
//         const pointB = b || "";

//         if (pointA < pointB) {
//             return -1;  // a มาก่อน b
//         }
//         if (pointA > pointB) {
//             return 1;   // b มาก่อน a
//         }
//         return 0;       // ถ้าเท่ากัน
//     });

//     const pointShippers: any = {};
//     orderedPoints.forEach(p => {
//         pointShippers[p] = Array.from(points[p]);
//     });

//     const headerRow1 = ["Gas Day"];
//     const headerRow2 = [""];
//     const merges = [];

//     // สร้างแถวข้อมูล
//     const rows = [[""] /* blank row */, headerRow1, headerRow2];

//     function convertObjectToArray(pointShippers: any) {
//         const resultArray = Object.entries(pointShippers).map(([key, value]) => {
//             return { key, value };  // สามารถเก็บ key และ value ได้ใน array แบบนี้
//         });
//         return resultArray;
//     }

//     let colIndex = 1;
//     orderedPoints.forEach((point: any) => {
//         let dataItem: any;
//         data?.forEach((entry: any) => {
//             dataItem = entry?.nomPoint?.find((p: any) => p?.point === point);
//         });

//         const startCol = colIndex;

//         // 1. เพิ่มชื่อ shippers ลงทั้ง 2 แถว
//         pointShippers[point].forEach((shipper: any) => {
//             headerRow1.push(point);          // แถวบนใส่ชื่อ point
//             headerRow2.push(shipper);        // แถวล่างใส่ชื่อ shipper
//             colIndex++;
//         });

//         // 2. ถ้ามี Total
//         if (dataItem?.total !== 'disabled') {
//             headerRow1.push(point);
//             headerRow2.push("Total");
//             colIndex++;
//         }

//         // 3. ถ้ามี Metering
//         if (dataItem?.meterValue !== 'disabled') {
//             headerRow1.push(point);
//             headerRow2.push("Metering");
//             colIndex++;
//         }

//         // 4. Merge หัวตาราง (แถวบน) ให้ครอบช่วงของ point นั้นๆ
//         merges.push({
//             s: { r: 1, c: startCol },        // row 1 = แถวที่ 2 จริง (0-based index)
//             e: { r: 1, c: colIndex - 1 }
//         });
//     });

//     const pointShipperArray = convertObjectToArray(pointShippers);

//     data?.forEach((entry: any) => {
//         const row = [toDayjs(entry.gas_day, "YYYY-MM-DD").format("DD/MM/YYYY")]; // แถวแรก: Gas Day
//         for (let index = 0; index < pointShipperArray?.length; index++) {
//             const dataKey: any = pointShipperArray[index]?.key;
//             const dataRow: any = pointShipperArray[index]?.value;

//             const checkRow: any = entry?.nomPoint?.find((items: any) => items?.point == dataKey);

//             if (checkRow) {
//                 if (checkRow?.data?.length == dataRow?.length) {
//                     checkRow?.data?.map((items: any) => {
//                         const allocatedValue = (items?.allocatedValue !== null && items?.allocatedValue !== undefined) ? formatNumberFourDecimal(items?.allocatedValue) : "";
//                         row.push(allocatedValue)
//                     })
//                 } else {
//                     dataRow?.map((item: any) => {
//                         const getCol: any = checkRow?.data?.find((items: any) => items?.shipper_name == item)
//                         if (getCol) {
//                             const allocatedValue = (getCol?.allocatedValue !== null && getCol?.allocatedValue !== undefined) ? formatNumberFourDecimal(getCol?.allocatedValue) : "";
//                             row.push(allocatedValue)
//                         } else {
//                             row.push("")
//                         }
//                     })
//                 }

//                 if (checkRow?.total !== 'disabled') {
//                     const pointTotal = (checkRow?.total !== null && checkRow?.total !== undefined) ? formatNumberFourDecimal(checkRow?.total) : "";
//                     row.push(pointTotal);
//                 }

//                 if (checkRow?.meterValue !== 'disabled') {
//                     // const pointMeterValue = (checkRow?.meterValue !== null && checkRow?.meterValue !== undefined) ? formatNumberFourDecimal(checkRow?.meterValue) : "";
//                     const pointMeterValue = (checkRow?.meterValue !== null && checkRow?.meterValue !== undefined) ? formatNumberThreeDecimalNom(checkRow?.meterValue) : "";
//                     row.push(pointMeterValue);
//                 }
//             } else {
//                 dataRow?.map(() => {
//                     row.push("")
//                 })
//                 row.push("")
//                 row.push("")
//             }
//         }

//         rows.push(row);
//     })

//     // ใส่ merge ของ "Gas Day" ให้ดูสวยงามด้วย (ครอบ 2 แถวแรก)
//     merges.push({
//         s: { r: 1, c: 0 },
//         e: { r: 2, c: 0 }
//     });

//     // สร้าง worksheet และตั้งค่า merges
//     const worksheet = XLSXStyle.utils.aoa_to_sheet(rows);
//     worksheet["!merges"] = merges;

//     const headerStyle = {
//         font: {
//             bold: true,
//             color: { rgb: "000000" },
//         },
//         alignment: {
//             horizontal: "center",
//             vertical: "center",
//             wrapText: true,
//         },
//         border: {
//             top: { style: "thin", color: { rgb: "999999" } },
//             bottom: { style: "thin", color: { rgb: "999999" } },
//             left: { style: "thin", color: { rgb: "999999" } },
//             right: { style: "thin", color: { rgb: "999999" } },
//         },
//     };

//     const setCellStyle = (r: number, c: number, style: any) => {
//         const cellRef = XLSXStyle.utils.encode_cell({ r, c });

//         if (!worksheet[cellRef]) {
//             worksheet[cellRef] = { t: "s", v: "" };
//         }

//         worksheet[cellRef].s = {
//             ...(worksheet[cellRef].s || {}),
//             ...style,
//         };
//     };

//     // header อยู่ row 1 และ row 2
//     const headerStartRow = 1;
//     const headerEndRow = 2;
//     const totalCols = headerRow1.length;

//     for (let r = headerStartRow; r <= headerEndRow; r++) {
//         for (let c = 0; c < totalCols; c++) {
//             setCellStyle(r, c, headerStyle);
//         }
//     }

//     // สำคัญ: style cell ที่อยู่ใน merge range ด้วย
//     merges.forEach((merge: any) => {
//         for (let r = merge.s.r; r <= merge.e.r; r++) {
//             for (let c = merge.s.c; c <= merge.e.c; c++) {
//                 setCellStyle(r, c, headerStyle);
//             }
//         }
//     });

//     // ปรับความสูง header
//     worksheet["!rows"] = worksheet["!rows"] || [];
//     worksheet["!rows"][1] = { hpt: 24 };
//     worksheet["!rows"][2] = { hpt: 24 };

//     // สร้าง workbook และบันทึกไฟล์
//     const workbook = XLSXStyle.utils.book_new();
//     XLSXStyle.utils.book_append_sheet(workbook, worksheet, "Gas Allocation");
//     XLSXStyle.writeFile(workbook, "allocation-summary-shipper-report.xlsx");
// }
export const exportALLOShipperREPORT = (data?: any) => {
  const originalData: any[] = Array.isArray(data) ? data : []

  if (originalData.length === 0) {
    return
  }

  /*
   * แปลงค่าเป็น JavaScript number
   * รองรับ:
   * 1000
   * "1000"
   * "1,000.0000"
   * "-1,000.0000"
   */
  const parseExcelNumber = (value: any): number | null => {
    if (value === null || value === undefined || value === '') {
      return null
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null
    }

    if (typeof value !== 'string') {
      return null
    }

    const normalized = value.trim().replace(/,/g, '')

    if (!/^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
      return null
    }

    const parsed = Number(normalized)

    return Number.isFinite(parsed) ? parsed : null
  }

  const getExcelNumberFormat = (decimal: number): string => {
    const safeDecimal = Math.max(0, Number(decimal) || 0)

    return safeDecimal === 0 ? '#,##0' : `#,##0.${'0'.repeat(safeDecimal)}`
  }

  /*
   * เก็บ Point และรายชื่อ Shipper ของแต่ละ Point
   */
  const points: Record<string, Set<string>> = {}

  originalData.forEach((entry: any) => {
    ;(entry?.nomPoint ?? []).forEach((point: any) => {
      if (!points[point?.point]) {
        points[point?.point] = new Set<string>()
      }

      ;(point?.data ?? []).forEach((item: any) => {
        if (item?.shipper_name) {
          points[point.point].add(item.shipper_name)
        }
      })
    })
  })

  /*
   * เรียง Point
   */
  const orderedPoints = Object.keys(points).sort((a, b) => String(a).localeCompare(String(b)))

  const pointShippers: Record<string, string[]> = {}

  orderedPoints.forEach((point) => {
    pointShippers[point] = Array.from(points[point])
  })

  /*
   * Header
   */
  const headerRow1: any[] = ['Gas Day']
  const headerRow2: any[] = ['']

  const merges: any[] = []

  /*
   * เก็บจำนวนทศนิยมตาม Column
   *
   * key   = column index แบบ 0-based
   * value = จำนวนทศนิยม
   */
  const columnDecimalMap = new Map<number, number>()

  /*
   * แถวแรกเป็น Blank Row
   * Header อยู่แถว index 1 และ 2
   */
  const rows: any[][] = [[''], headerRow1, headerRow2]

  let columnIndex = 1

  orderedPoints.forEach((point: string) => {
    /*
     * ตรวจสอบว่า Point นี้มี Total/Metering หรือไม่
     * จากทุก Gas Day
     */
    const pointRecords = originalData.map((entry: any) => (entry?.nomPoint ?? []).find((item: any) => item?.point === point)).filter(Boolean)

    const hasTotal = pointRecords.some((item: any) => item?.total !== 'disabled')

    const hasMetering = pointRecords.some((item: any) => item?.meterValue !== 'disabled')

    const startColumn = columnIndex

    /*
     * Shipper columns
     * แสดง 4 ทศนิยม
     */
    ;(pointShippers[point] ?? []).forEach((shipper: string) => {
      headerRow1.push(point)
      headerRow2.push(shipper)

      columnDecimalMap.set(columnIndex, 4)

      columnIndex++
    })

    /*
     * Total
     * แสดง 4 ทศนิยม
     */
    if (hasTotal) {
      headerRow1.push(point)
      headerRow2.push('Total')

      columnDecimalMap.set(columnIndex, 4)

      columnIndex++
    }

    /*
     * Metering
     * แสดง 3 ทศนิยม
     */
    if (hasMetering) {
      headerRow1.push(point)
      headerRow2.push('Metering')

      columnDecimalMap.set(columnIndex, 3)

      columnIndex++
    }

    /*
     * Merge ชื่อ Point ใน Header แถวบน
     */
    if (columnIndex > startColumn) {
      merges.push({
        s: {
          r: 1,
          c: startColumn
        },
        e: {
          r: 1,
          c: columnIndex - 1
        }
      })
    }
  })

  /*
   * สร้างข้อมูลแต่ละ Gas Day
   */
  originalData.forEach((entry: any) => {
    const row: any[] = [entry?.gas_day ? toDayjs(entry.gas_day, 'YYYY-MM-DD').format('DD/MM/YYYY') : '']

    orderedPoints.forEach((point: string) => {
      const shipperList = pointShippers[point] ?? []

      const pointRecords = originalData.map((sourceEntry: any) => (sourceEntry?.nomPoint ?? []).find((item: any) => item?.point === point)).filter(Boolean)

      const hasTotal = pointRecords.some((item: any) => item?.total !== 'disabled')

      const hasMetering = pointRecords.some((item: any) => item?.meterValue !== 'disabled')

      const checkRow = (entry?.nomPoint ?? []).find((item: any) => item?.point === point)

      /*
       * Shipper values
       */
      shipperList.forEach((shipperName: string) => {
        const matched = (checkRow?.data ?? []).find((item: any) => item?.shipper_name === shipperName)

        const numericValue = parseExcelNumber(matched?.allocatedValue)

        row.push(numericValue ?? '')
      })

      /*
       * Total
       */
      if (hasTotal) {
        const numericTotal = checkRow?.total !== 'disabled' ? parseExcelNumber(checkRow?.total) : null

        row.push(numericTotal ?? '')
      }

      /*
       * Metering
       */
      if (hasMetering) {
        const numericMetering = checkRow?.meterValue !== 'disabled' ? parseExcelNumber(checkRow?.meterValue) : null

        row.push(numericMetering ?? '')
      }
    })

    rows.push(row)
  })

  /*
   * Merge Gas Day ให้ครอบ Header 2 แถว
   */
  merges.push({
    s: {
      r: 1,
      c: 0
    },
    e: {
      r: 2,
      c: 0
    }
  })

  /*
   * สร้าง Worksheet
   */
  const worksheet = XLSXStyle.utils.aoa_to_sheet(rows)

  worksheet['!merges'] = merges

  /*
   * Header Style
   */
  const headerStyle = {
    font: {
      bold: true,
      color: {
        rgb: '000000'
      }
    },
    alignment: {
      horizontal: 'center',
      vertical: 'center',
      wrapText: true
    },
    fill: {
      patternType: 'solid',
      fgColor: {
        rgb: 'F4F4F4'
      }
    },
    border: {
      top: {
        style: 'thin',
        color: {
          rgb: '999999'
        }
      },
      bottom: {
        style: 'thin',
        color: {
          rgb: '999999'
        }
      },
      left: {
        style: 'thin',
        color: {
          rgb: '999999'
        }
      },
      right: {
        style: 'thin',
        color: {
          rgb: '999999'
        }
      }
    }
  }

  const dataCellStyle = {
    alignment: {
      horizontal: 'right',
      vertical: 'center',
      wrapText: false
    },
    border: {
      top: {
        style: 'thin',
        color: {
          rgb: 'D9D9D9'
        }
      },
      bottom: {
        style: 'thin',
        color: {
          rgb: 'D9D9D9'
        }
      },
      left: {
        style: 'thin',
        color: {
          rgb: 'D9D9D9'
        }
      },
      right: {
        style: 'thin',
        color: {
          rgb: 'D9D9D9'
        }
      }
    }
  }

  const setCellStyle = (rowIndex: number, colIndex: number, style: any) => {
    const cellReference = XLSXStyle.utils.encode_cell({
      r: rowIndex,
      c: colIndex
    })

    if (!worksheet[cellReference]) {
      worksheet[cellReference] = {
        t: 's',
        v: ''
      }
    }

    worksheet[cellReference].s = {
      ...(worksheet[cellReference].s || {}),
      ...style
    }
  }

  /*
   * Style Header
   */
  const headerStartRow = 1
  const headerEndRow = 2
  const totalColumns = headerRow1.length

  for (let rowIndex = headerStartRow; rowIndex <= headerEndRow; rowIndex++) {
    for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
      setCellStyle(rowIndex, colIndex, headerStyle)
    }
  }

  /*
   * Style ทุก cell ใน Merge Range
   */
  merges.forEach((merge: any) => {
    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex++) {
      for (let colIndex = merge.s.c; colIndex <= merge.e.c; colIndex++) {
        setCellStyle(rowIndex, colIndex, headerStyle)
      }
    }
  })

  /*
   * บังคับ Data Cell ให้เป็น Number จริง
   *
   * Data เริ่มที่แถว index 3
   */
  const dataStartRow = 3
  const dataEndRow = rows.length - 1

  for (let rowIndex = dataStartRow; rowIndex <= dataEndRow; rowIndex++) {
    for (let colIndex = 0; colIndex < totalColumns; colIndex++) {
      const cellReference = XLSXStyle.utils.encode_cell({
        r: rowIndex,
        c: colIndex
      })

      const cell = worksheet[cellReference]

      if (!cell) {
        continue
      }

      /*
       * Gas Day เป็นข้อความ
       */
      if (colIndex === 0) {
        cell.t = 's'

        cell.s = {
          ...(cell.s || {}),
          alignment: {
            horizontal: 'center',
            vertical: 'center',
            wrapText: false
          }
        }

        continue
      }

      const numericValue = parseExcelNumber(cell.v)

      if (numericValue !== null) {
        const decimal = columnDecimalMap.get(colIndex) ?? 4

        /*
         * บังคับให้เป็น Number
         */
        cell.v = numericValue
        cell.t = 'n'

        /*
         * กำหนดจำนวนทศนิยม
         */
        cell.z = getExcelNumberFormat(decimal)

        /*
         * ลบ cached formatted value
         */
        if ('w' in cell) {
          delete cell.w
        }

        cell.s = {
          ...(cell.s || {}),
          ...dataCellStyle,
          alignment: {
            horizontal: 'right',
            vertical: 'center',
            wrapText: false
          }
        }
      } else {
        cell.s = {
          ...(cell.s || {}),
          alignment: {
            horizontal: 'right',
            vertical: 'center',
            wrapText: false
          }
        }
      }
    }
  }

  /*
   * ปรับ Row Height
   */
  worksheet['!rows'] = worksheet['!rows'] || []

  worksheet['!rows'][0] = {
    hidden: true
  }

  worksheet['!rows'][1] = {
    hpt: 24
  }

  worksheet['!rows'][2] = {
    hpt: 24
  }

  for (let rowIndex = dataStartRow; rowIndex <= dataEndRow; rowIndex++) {
    worksheet['!rows'][rowIndex] = {
      hpt: 22
    }
  }

  /*
   * ปรับความกว้าง Column
   */
  const columnWidths = Array.from(
    {
      length: totalColumns
    },
    (_, colIndex) => {
      const maxLength = Math.max(...rows.map((row) => String(row?.[colIndex] ?? '').length))

      return {
        wch: colIndex === 0 ? 15 : Math.min(Math.max(maxLength + 3, 14), 25)
      }
    }
  )

  worksheet['!cols'] = columnWidths

  /*
   * Debug ตรวจสอบ Number Cell
   * ลบภายหลังได้
   */
  const firstNumericCell = (() => {
    for (let rowIndex = dataStartRow; rowIndex <= dataEndRow; rowIndex++) {
      for (let colIndex = 1; colIndex < totalColumns; colIndex++) {
        const cellReference = XLSXStyle.utils.encode_cell({
          r: rowIndex,
          c: colIndex
        })

        const cell = worksheet[cellReference]

        if (cell?.t === 'n') {
          return {
            address: cellReference,
            cell
          }
        }
      }
    }

    return null
  })()

  console.log('First numeric Excel cell:', firstNumericCell)

  /*
   * สร้าง Workbook
   */
  const workbook = XLSXStyle.utils.book_new()

  XLSXStyle.utils.book_append_sheet(workbook, worksheet, 'Gas Allocation')

  XLSXStyle.writeFile(workbook, 'allocation-summary-shipper-report.xlsx', {
    bookType: 'xlsx',
    cellStyles: true
  })
}

function buildMonthRangeFromData(data_x: any[]): string[] {
  // รวบรวม month ทั้งหมดจากทุก node
  const allMonths: string[] = (data_x ?? []).flatMap((g) => (g?.data ?? []).flatMap((it: any) => it?.month ?? []))

  // เคสไม่มีข้อมูล
  if (!allMonths.length) return []

  // แปลงเป็น dayjs (strict) และคัดเฉพาะที่ parse ได้จริง
  const parsed = allMonths.map((m) => dayjs(m, 'DD/MM/YYYY', true)).filter((d) => d.isValid())

  if (!parsed.length) return []

  // หา min/max
  const minDate = parsed.reduce((a, b) => (b.isBefore(a) ? b : a))
  const maxDate = parsed.reduce((a, b) => (b.isAfter(a) ? b : a))

  // วนเพิ่มทีละเดือน ตั้งแต่ต้นเดือนของ min ถึงต้นเดือนของ max
  const out: string[] = []
  let cur = minDate.startOf('month')
  const last = maxDate.startOf('month')

  while (cur.isSame(last) || cur.isBefore(last)) {
    out.push(cur.format('DD/MM/YYYY')) // ให้เป็น DD/MM/YYYY
    cur = cur.add(1, 'month')
  }

  return out
}

// Medium Term
const exportChartPlanning = (data_to_export?: any, extra_obj?: any) => {
  const exportData: any[] = []
  // const monthRange = buildMonthRangeFromData(data_to_export);
  const monthRange = buildMonthRangeFromData(data_to_export?.length >= 1 ? data_to_export : [data_to_export])
  const limitedMonthRange = monthRange.slice(0, 24) // หน้า chart มันแสดงผล max 24 เดือน

  if (data_to_export?.length >= 1) {
    data_to_export?.forEach((item: any) => {
      item?.data?.forEach((entry: any) => {
        const row: any = {
          Nomination_Point: entry.nomination_point,
          Customer: entry.customer,
          Area: entry.area?.name,
          Unit: entry.unit,
          Entry_Exit: entry.entry_exit,
          Planning_Code: entry.planning_code || item.planning_code,
          Group_Name: item.group?.name,
          Group_Company_Name: item.group?.company_name,
          Start_Date: formatDateTimeSec(entry.start_date || item.start_date),
          End_Date: formatDateTimeSec(entry.end_date || item.end_date),
          Shipper_File_Submission_Date: formatDateTimeSec(entry.shipper_file_submission_date || item.shipper_file_submission_date)
        }

        // Flatten the month and value arrays into the row
        if (entry.month && entry.value) {
          // monthRange?.forEach((month: string, index: number) => {
          limitedMonthRange?.forEach((month: string, index: number) => {
            // if (month && entry.value[index] !== null) {
            if (month) {
              // row[`Month_${month}`] = entry.value[index];
              let format_month = formatMonth(month)
              // row[`${format_month}`] = entry.value[index]; // v1.0.90 Medium Export: ข้อมูลตรง "Month_dd/mm/yyyy" เป็น "mmm-yyyy" https://app.clickup.com/t/86ert2k2p
              // row[`${format_month}`] = entry.value[index] ? entry.value[index] : '';
              row[`${format_month}`] = entry.value[index] !== null && entry.value[index] !== undefined ? formatNumberThreeDecimal(entry.value[index]) : '' // (อ่านคอมเม้นนะ) https://app.clickup.com/t/86ev5f6zk
            }
          })
        }

        exportData.push(row)
      })
    })
  } else {
    data_to_export?.data?.forEach((entry: any) => {
      const row: any = {
        Nomination_Point: entry.nomination_point,
        Customer: entry.customer,
        Area: entry.area?.name,
        Unit: entry.unit,
        Entry_Exit: entry.entry_exit,
        Planning_Code: entry.planning_code || data_to_export.planning_code,
        Group_Name: data_to_export.group?.name,
        Group_Company_Name: data_to_export.group?.company_name,
        Start_Date: formatDateTimeSec(entry.start_date || data_to_export.start_date),
        End_Date: formatDateTimeSec(entry.end_date || data_to_export.end_date),
        Shipper_File_Submission_Date: formatDateTimeSec(entry.shipper_file_submission_date || data_to_export.shipper_file_submission_date)
      }

      // Flatten the month and value arrays into the row
      if (entry.month && entry.value) {
        entry.month.forEach((month: string, index: number) => {
          // if (month && entry.value[index] !== null) {
          if (month) {
            // row[`Month_${month}`] = entry.value[index];
            let format_month = formatMonth(month)
            // row[`${format_month}`] = entry.value[index]; // v1.0.90 Medium Export: ข้อมูลตรง "Month_dd/mm/yyyy" เป็น "mmm-yyyy" https://app.clickup.com/t/86ert2k2p
            // row[`${format_month}`] = entry.value[index] ? entry.value[index] : '';
            row[`${format_month}`] = entry.value[index] !== null && entry.value[index] !== undefined ? formatNumberThreeDecimal(entry.value[index]) : '' // (อ่านคอมเม้นนะ) https://app.clickup.com/t/86ev5f6zk
          }
        })
      }

      exportData.push(row)
    })
  }

  // Create a worksheet from the data
  const ws = XLSXStyle.utils.json_to_sheet(exportData)

  // Create a workbook with the worksheet
  const wb = XLSXStyle.utils.book_new()

  // auto จัดขนาด width column fit content
  const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: Math.max(
      key.length, // Header width
      ...exportData.map((row?: any) => (row[key] ? row[key].toString().length : 0)) // Max content width
    )
  }))
  ws['!cols'] = columnWidths // Set column widths

  XLSXStyle.utils.book_append_sheet(wb, ws, 'Export Data')

  // Export to Excel
  XLSXStyle.writeFile(wb, 'planning_medium_term.xlsx')
}

function buildDayRangeFromData(data_x: any[], dayField: string = 'day'): string[] {
  // รวบรวมวันทั้งหมดจากทุก node
  const allDays: string[] = (data_x ?? [])?.flatMap((g) => (g?.data ?? []).flatMap((it: any) => it?.[dayField] ?? []))

  if (!allDays.length) return []

  // แปลงเป็น dayjs (strict) และเก็บเฉพาะที่ parse ได้จริง
  const parsed = allDays.map((d) => dayjs(d, 'DD/MM/YYYY', true)).filter((d) => d.isValid())

  if (!parsed.length) return []

  // หา min/max
  const minDate = parsed.reduce((a, b) => (b.isBefore(a) ? b : a))
  const maxDate = parsed.reduce((a, b) => (b.isAfter(a) ? b : a))

  // วนเพิ่มทีละ 1 วัน ตั้งแต่ min ถึง max
  const out: string[] = []
  let cur = minDate.startOf('day')
  const last = maxDate.startOf('day')

  while (cur.isSame(last) || cur.isBefore(last)) {
    out.push(cur.format('DD/MM/YYYY'))
    cur = cur.add(1, 'day')
  }

  return out
}

// util เอาไว้ export short term
const padDaysToMax = (data_to_export: any[]) => {
  // 1) หา row ที่มี day ยาวสุด (จะใช้เป็นแม่แบบ day)
  let maxDayRow: any | null = null
  for (const g of data_to_export ?? []) {
    for (const r of g.data ?? []) {
      if (!maxDayRow || (r.day?.length ?? 0) > (maxDayRow.day?.length ?? 0)) {
        maxDayRow = r
      }
    }
  }

  const maxDays = maxDayRow?.day ?? []
  const maxLen = maxDays.length

  // 2) คืนค่าใหม่: เติม day/value ของที่สั้นกว่าให้ยาวเท่ากัน
  return (data_to_export ?? []).map((g) => ({
    ...g,
    data: (g.data ?? []).map((r: any) => {
      const day = Array.isArray(r.day) ? [...r.day] : []
      const value = Array.isArray(r.value) ? [...r.value] : []

      // กัน value สั้นกว่า day เดิม (เช่น example S_GSP1 มี day 7 แต่ value 6)
      while (value.length < day.length) value.push(null)

      // เติมส่วนที่ขาด "ต่อท้าย" โดยอิงแม่แบบ maxDays
      if (day.length < maxLen) {
        const missingDays = maxDays.slice(day.length) // เอาวันที่เหลือมาต่อท้าย
        day.push(...missingDays)
        value.push(...new Array(missingDays.length).fill(null))
      }

      // กันพลาด: ถ้ายาวเกิน (ไม่ควรเกิด แต่กันไว้)
      if (day.length > maxLen) day.length = maxLen
      if (value.length > maxLen) value.length = maxLen

      return {...r, day, value}
    })
  }))
}

export const ensureOneYearOneMonth = (dateRange: string[]) => {
  if (!Array.isArray(dateRange) || dateRange.length === 0) return []

  const format = 'DD/MM/YYYY'

  const startDate = dayjs(dateRange[0], format)
  const endLimit = startDate.add(1, 'year').add(2, 'month').subtract(1, 'day')

  const existingSet = new Set(dateRange)

  const result: string[] = []

  let cursor = startDate

  while (cursor.isSameOrBefore(endLimit, 'day')) {
    const formatted = cursor.format(format)
    result.push(formatted)
    cursor = cursor.add(1, 'day')
  }

  return result
}

// Short Term
const exportChartPlanningShortX = (data_to_export?: any, mode?: any) => {
  // mode == all, each
  const exportData: any[] = []

  const data_ = data_to_export?.data?.flatMap((d: any) => d?.data)

  // const earliestDay: any = getEarliestFirstDay(data_); // หาวันที่น้อยที่สุด จะได้เอามาทำ label
  // const lastestDay: any = getLatestFirstDay(data_); // หาวันที่มากที่สุด จะได้เอามาทำ label
  // const month_count = monthDiffInclusive(earliestDay, lastestDay); // หาจำนวนเดือนระหว่างวันที่
  const month_count = 4

  if (!data_to_export) return

  // 🔥 build range 15 เดือน (รวม start)
  const build15MonthRange = (startMonth: string) => {
    const start = dayjs(startMonth, 'D/M/YYYY').startOf('month')
    // const end = start.add(14, "month").endOf("month"); // ✅ FIX สำคัญ
    const end = start.add(data_to_export?.period ? data_to_export?.period : mode == 'each' ? month_count : month_count - 1, 'month').endOf('month')

    const dates: string[] = []
    let current = start

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('DD/MM/YYYY'))
      current = current.add(1, 'day')
    }

    return dates
  }

  // 🔥 format header = ค.ศ.
  const formatExcelHeader = (date: string) => {
    const [day, month, year] = date.split('/').map(Number)

    const yearCE = year > 2400 ? year - 543 : year // 🔥 แปลง พ.ศ. → ค.ศ.

    const d = dayjs(`${yearCE}-${month}-${day}`)

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // return `${String(day).padStart(2, "0")} ${monthNames[d.month()]} ${yearCE}`;
    // return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year - 543}` // https://app.clickup.com/t/86ert2k3d
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}` // https://app.clickup.com/t/86ert2k3d https://app.clickup.com/t/86ev5f6zk
  }

  // ✅ เอา month จาก root
  const month = data_to_export?.month
  if (!month) return
  const newRange = build15MonthRange(month)

  // ✅ ใช้ data จาก .data
  const mainData = data_to_export?.data || []

  mainData.forEach((item: any) => {
    item?.data?.forEach((entry: any) => {
      const row: any = {
        Nomination_Point: entry.nomination_point,
        Customer: entry.customer,
        Area: entry.area?.name,
        Unit: entry.unit,
        Entry_Exit: entry.entry_exit,
        Planning_Code: entry.planning_code || item.planning_code,
        Group_Name: item.group?.name,
        Group_Company_Name: item.group?.company_name,
        Start_Date: formatDateTimeSec(entry.start_date || item.start_date),
        End_Date: formatDateTimeSec(entry.end_date || item.end_date),
        Shipper_File_Submission_Date: formatDateTimeSec(entry.shipper_file_submission_date || item.shipper_file_submission_date)
      }

      if (entry.day && entry.value) {
        const valueByDay = new Map<string, any>()

        entry.day.forEach((d: string, i: number) => {
          const [day, month, year] = d.split('/').map(Number)
          // const yearCE = year > 2400 ? year - 543 : year;
          const yearCE = year

          const key = dayjs(`${yearCE}-${month}-${day}`).format('DD/MM/YYYY') // 🔥 normalize

          valueByDay.set(key, entry.value?.[i])
        })

        newRange.forEach((d: string) => {
          const [day, month, year] = d.split('/').map(Number)
          // const yearCE = year > 2400 ? year - 543 : year;
          const yearCE = year

          const normalized = dayjs(`${yearCE}-${month}-${day}`).format('DD/MM/YYYY')
          const [d_, m_, y_] = normalized.split('/')
          const normalized_ = dayjs(`${d_}/${m_}/${Number(y_) - 543}`, 'DD/MM/YYYY').format('DD/MM/YYYY')

          // console.log('normalized : ', normalized);
          // console.log('valueByDay : ', valueByDay);
          // const key = formatExcelHeader(d); // เอาไว้เป็น header
          const key_ = normalized_ // เอาไว้เป็น header
          const val = valueByDay.get(normalized_)

          // row[key] = val == null ? "" : val;
          // row[key] = val == null ? "" : formatNumberThreeDecimal(val);
          row[key_] = val == null ? '' : formatNumberThreeDecimal(val)
        })
      }

      exportData.push(row)
    })
  })
  // console.log('mainData : ', mainData);
  // console.log('exportData : ', exportData);

  // return

  const ws = XLSXStyle.utils.json_to_sheet(exportData)
  const wb = XLSXStyle.utils.book_new()

  const columnWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...exportData.map((row?: any) => (row[key] ? row[key].toString().length : 0)))
  }))

  ws['!cols'] = columnWidths

  XLSXStyle.utils.book_append_sheet(wb, ws, 'Export Data')
  XLSXStyle.writeFile(wb, 'planning_short_term.xlsx')
}

export const exportArrayDataToExcel = (data: any[], fileName: string = 'export', sheetName: string = 'Sheet1', headers?: {key: string; title: string}[]) => {
  if (!data || !data.length) {
    // No data provided for export
    return
  }

  // Transform data to match custom headers if provided
  let transformedData = data

  if (headers) {
    transformedData = data.map((item) =>
      headers.reduce(
        (acc, header) => {
          acc[header.title] = item[header.key] ?? '' // Use title as the column name
          return acc
        },
        {} as Record<string, any>
      )
    )
  }

  // Create worksheet
  const worksheet = XLSXStyle.utils.json_to_sheet(transformedData)

  // Auto-adjust column width
  const columnWidths = headers ? headers.map((header) => ({wch: header.title.length + 5})) : Object.keys(data[0]).map((key) => ({wch: key.length + 5}))
  worksheet['!cols'] = columnWidths

  // Create workbook
  const workbook = XLSXStyle.utils.book_new()

  XLSXStyle.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Ensure proper file extension
  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`

  // Write file
  XLSXStyle.writeFile(workbook, safeFileName)
}

export const generateUserPermission = (permission: any) => {
  // localStorage.setItem("i0y7l2w4o8c5v9b1r3z", '1');
  // localStorage.setItem("i0y7l2w4o8c5v9b1r3z", encryptData('1'));

  // original
  // const updatedUserPermission = {
  //   ...user_permission?.role_config,
  //   f_view: user_permission?.role_config.f_view === 1,
  //   f_create: user_permission?.role_config.f_create === 1,
  //   f_edit: user_permission?.role_config.f_edit === 1,
  //   f_import: user_permission?.role_config.f_import === 1,
  //   f_export: user_permission?.role_config.f_export === 1,
  //   f_approved: user_permission?.role_config.f_approved === 1,
  //   f_noti_inapp: user_permission?.role_config.f_noti_inapp === 1,
  //   f_noti_email: user_permission?.role_config.f_noti_email === 1,
  // };

  // กันเหนียวเผื่อเปิดเป็น true หมด
  // return {
  //     ...permission?.role_config,
  //     f_view: true,
  //     f_create: true,
  //     f_edit: true,
  //     f_import: true,
  //     f_export: true,
  //     f_approved: true,
  //     f_noti_inapp: true,
  //     f_noti_email: true,
  // };

  return {
    ...permission?.role_config,
    f_view: permission?.role_config.f_view === 1,
    f_create: permission?.role_config.f_create === 1,
    f_edit: permission?.role_config.f_edit === 1,
    f_import: permission?.role_config.f_import === 1,
    f_export: permission?.role_config.f_export === 1,
    f_approved: permission?.role_config.f_approved === 1,
    f_noti_inapp: permission?.role_config.f_noti_inapp === 1,
    f_noti_email: permission?.role_config.f_noti_email === 1
  }
}

export const subtractDateByOneDay = (calculatedDate: any) => {
  let [day, month, year] = calculatedDate.split('/')
  let date = new Date(year, month - 1, day) // Month is 0-indexed in JavaScript

  // Subtract 1 day
  date.setDate(date.getDate() - 1)

  // Format the date back to "DD/MM/YYYY"
  let newDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`

  return newDate
}

export const formatTime = (isoString: any) => {
  return toDayjs(isoString).format('HH:mm')
}

export const formatDate = (isoString: any, format?: string) => {
  return toDayjs(isoString, format).format('DD/MM/YYYY HH:mm')
}

export const formatDateK = (isoString: any) => {
  // return toDayjs(isoString).format('DD/MM/YYYY HH:mm');
  return toDayjs(isoString.replace('Z', '')).format('DD/MM/YYYY HH:mm') // ใช้แบบนี้แล้วตรง
}

export const formatDateTimeSec = (isoString: any) => {
  if (!isoString) return '' // หรือ return null, หรือค่า default อื่น ๆ

  // return toDayjs(isoString).format('DD/MM/YYYY HH:mm:ss');

  // เพื่อนรักบอกมา ->
  // ชัดเลยว่าปัญหาไม่ได้อยู่ที่ dayjs แต่ ค่าที่ backend ส่งมา (2025-08-08T11:10:03.175Z) ไม่ได้ตรงกับเวลาจริงที่เกิดขึ้น
  // เพราะถ้าคุณ ดู log new Date(update_date) แล้วได้

  // Fri Aug 08 2025 20:40:31 GMT+0700 (Indochina Time)
  // แปลว่า 11:10:03 UTC ≡ 18:10:03 ICT ไม่ใช่ 20:40:31 — แต่ตอนนี้กลับกลายเป็น 20:40:31 เลย หมายความว่าเวลาต้นทางมันเพี้ยนไปตั้งแต่ backend แล้ว

  // สาเหตุที่เจอบ่อย:
  // ฝั่ง server เอาเวลาที่เป็น local (ICT) แล้วใส่ "Z" ต่อท้าย ซึ่งทำให้ browser คิดว่าเป็น UTC แล้วบวก offset อีกที → เวลาโดดไป 7 ชั่วโมง
  // หรือ database/timezone setting ผิด ทำให้เวลา export มาไม่ใช่ UTC จริง

  // วิธีแก้
  // ฝั่ง backend
  // ให้เก็บและส่งเวลาเป็น UTC จริง (เช่น Date.toISOString() ใน JS, หรือ AT TIME ZONE 'UTC' ใน SQL)
  // ถ้าค่าเป็นเวลาของ Bangkok อยู่แล้ว → อย่าใส่ "Z" เพราะ "Z" หมายถึง UTC

  return toDayjs(isoString.replace('Z', '')).format('DD/MM/YYYY HH:mm:ss') // ใช้แบบนี้แล้วตรง
}

export const formatDateTimeSecNoPlusSeven = (isoString: any) => {
  if (!isoString) return ''
  return dayjs.utc(isoString).format('DD/MM/YYYY HH:mm:ss') // 03/09/2025 16:09:52
}

export const formatDateTimeSecPlusSeven = (isoString: any) => {
  if (!isoString) return ''
  return dayjs
    .utc(isoString) // treat input as UTC
    .add(7, 'hour') // add 7 hours
    .format('DD/MM/YYYY HH:mm:ss')
}

// แปลง format 01/05/2025 (DD/MM/YYYY) เป็น 2025-05-01 (YYYY-MM-DD)
export const formatDateYearMonthDay = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/')
  return `${year}-${month}-${day}`
}

// format YYYY-MM-DD
export const formatDateYyyyMmDd = (date: any) => {
  // const formattedDate = date.toISOString().split('T')[0];
  const formattedDate = date
    .toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .replace(/\//g, '-')

  return formattedDate
}

// ใช้กับ capacity chart
// format month to (MMM YYYY)
export const parseMonth = (label: any) => {
  if (label == undefined) {
    return null
  }
  const [month, year] = label?.split(' ')
  const monthIndex = new Date(`${month} 1, 2025`).getMonth() // Get the month index from a fixed year (just for comparison)
  return new Date(year, monthIndex, 1) // Return Date with day 1
}

// 2025-02-10 - ของเดิม original
// isoString = "2025-02-21T17:53:48.334Z" but I got 22/02/2025 it should be 21/02/2025
// isoString = "2025-03-18T17:00:00.000Z" but I got 19/03/2025 it should be 18/03/2025
export const formatDateNoTime = (isoString: any) => {
  // 2025-02-23 เหทิอนจะเวลา +7 แปลก ๆ
  return toDayjs(isoString).format('DD/MM/YYYY')

  // 2025-03-18 ลองตัวใหม่
  // return dayjs.utc(isoString).format('DD/MM/YYYY'); // Keep UTC date
}

export const formatDateNoTimeNoPlusSeven = (isoString: any) => {
  // return toDayjs(isoString).format('DD/MM/YYYY');
  return dayjs.utc(isoString).format('DD/MM/YYYY')
}

export const formatDateTimeNoPlusSeven = (isoString: any) => {
  return toDayjs(isoString).format('DD/MM/YYYY HH:mm')
  // return dayjs.utc(isoString).format('DD/MM/YYYY HH:mm');
}

// 2025-02-10 - ของใหม่ แก้ไขเมื่อเจอ invalid date ให้ return null
// แตกถ้าใช้กับพวก format ใน data
// export const formatDateNoTime = (isoString: any) => {
//     const date = dayjs.utc(isoString);
//     return date.isValid() ? date.tz('Asia/Bangkok').format('DD/MM/YYYY') : null;
// };

export const isISOString = (value: any) => {
  // Regex to match basic ISO date patterns
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
  return typeof value === 'string' && isoRegex.test(value)
}

export const formatDateMonthName = (isoString: any) => {
  return toDayjs(isoString).format('DD MMM, YYYY')
}

export const formatDateMonthNameWithTime = (isoString: any) => {
  return toDayjs(isoString).format('DD MMM YYYY HH:mm')
}

export const cutUploadFileName = (url: any) => {
  // return dayjs(isoString).tz('Asia/Bangkok').format('DD/MM/YYYY HH:mm');
  const cutString = url?.substring(url.indexOf('_') + 1)
  console.log('cutString : ', cutString)
  return cutString
}

export const formatDateToMonthYear = (dateStr: any) => {
  // Regular expression to check for a valid date format "DD/MM/YYYY"
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/

  // If dateStr does not match the date pattern, return it as is
  if (!dateRegex.test(dateStr)) {
    return dateStr
  }

  // Split and format date if it is in valid format
  const [day, month, year] = dateStr.split('/')
  const date = new Date(`${year}-${month}-${day}`)

  // Format the date to "MMM YYYY"
  // return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date).toUpperCase();
  return new Intl.DateTimeFormat('en-US', {month: 'short', year: 'numeric'}).format(date)
}

export const formatDateToMonthYearContractList = (dateStr: any) => {
  // Regular expression to check for a valid date format "DD/MM/YYYY"
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/

  // If dateStr does not match the date pattern, return it as is
  if (!dateRegex.test(dateStr)) {
    return dateStr
  }

  // Split and format date if it is in valid format
  const [day, month, year] = dateStr.split('/')
  const date = new Date(`${year}-${month}-${day}`)

  // Format the date to "MMM YYYY"
  // return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date).toUpperCase();
  return new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric'}).format(date)
}

export const formatDateToDayMonthYear = (dateStr: any) => {
  // Regular expression to check for a valid date format "DD/MM/YYYY"
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/

  // If dateStr does not match the date pattern, return it as is
  if (!dateRegex.test(dateStr)) {
    return dateStr
  }

  // Split and format date if it is in a valid format
  const [day, month, year] = dateStr.split('/')
  const date = new Date(`${year}-${month}-${day}`)

  // Format the date to "DD MMM YYYY"
  // en-US "Mar 28, 2025"
  // en-GB "28 Mar 2025"
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
    // timeZone: 'UTC'
  }).format(date)
}

export const validatePhoneNumber = (value: any) => {
  if (!value) return true

  if (value.length < 8) {
    return 'Telephone number must be at least 8 digits long.'
  }

  if (!/^\d+$/.test(value)) {
    return 'Telephone number must contain only numbers.'
  }

  return true // Validation passes
}

export const getNestedValue = (obj: any, path: any) => {
  const value = path.split('.').reduce((acc: any, part: string) => {
    if (!acc) return undefined

    // Handle array notation like 'role_default[0]'
    const match = part.match(/(\w+)\[(\d+)\]/)
    if (match) {
      const [, arrayKey, index] = match
      return acc[arrayKey] && acc[arrayKey][parseInt(index, 10)]
    }

    return acc[part]
  }, obj)

  return value !== undefined ? value : ''
}

export const generateDayInMonth = (start_date?: any) => {
  const headers: string[] = []

  // Use the provided start_date or default to the current date
  const startDate = start_date ? new Date(start_date) : new Date()

  // Get the first and last day of the month for the specified start_date
  const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

  // Loop through each day of the month
  for (let date = firstDayOfMonth; date <= lastDayOfMonth; date = addDays(date, 1)) {
    const formattedDate = format(date, 'dd/MM/yyyy') // Format as "DD/MM/YYYY"
    headers.push(formattedDate)
  }

  return headers
}

export const generateNext12Months = (start_date?: any, end_date?: any) => {
  const headers = []
  let startDate = addMonths(new Date(), 0) // Default to current date

  if (start_date) {
    startDate = new Date(start_date)
  }

  let monthCount = 12
  if (end_date) {
    const endDate = new Date(end_date)
    monthCount = differenceInMonths(endDate, startDate)
    // monthCount = differenceInMonths(endDate, startDate) + 1;
  }

  for (let i = 0; i <= monthCount; i++) {
    const monthDate = addMonths(startDate, i)
    const formattedMonth = format(monthDate, 'MMM yyyy') // Format as "MMM YYYY"
    headers.push(formattedMonth)
  }

  return headers
}

export const generateNext10Years = (start_date?: any, end_date?: any) => {
  const headers = []
  let startDate = new Date() // Default to current date

  if (start_date) {
    startDate = new Date(start_date)
  }

  let yearCount = 10 // Default to 10 years
  if (end_date) {
    const endDate = new Date(end_date)
    yearCount = differenceInYears(endDate, startDate) // Include the end year
    // yearCount = differenceInYears(endDate, startDate) + 1; // Include the end year
  }

  for (let i = 0; i <= yearCount; i++) {
    const yearDate = addYears(startDate, i)
    const formattedYear = format(yearDate, 'yyyy') // Format as "YYYY"
    headers.push(formattedYear)
  }

  return headers
}

// NEW
export const generateDuplicateFileName = (fileName: string): string => {
  // Match pattern: [duplicate], [duplicate1], [duplicate 1], [duplicate23], etc.
  const duplicateRegex = /\s*\[duplicate\s*(\d*)\]$/i

  const match = fileName.match(duplicateRegex)
  let baseName = fileName
  let nextNumber = 1

  if (match) {
    baseName = fileName.replace(duplicateRegex, '') // remove old duplicate tag
    const existingNumber = match[1] ? parseInt(match[1], 10) : 1
    nextNumber = existingNumber + 1
  }

  return `${baseName} [duplicate ${nextNumber}]`
}

// write a function to check if mock_data_role_name.name already have "Pims-003 [duplicate 1]" then change it to "Pims-003 [duplicate 2]"
// but if table already have "Pims-003 [duplicate 2]" then change it to "Pims-003 [duplicate 3]"
// loop check until end of mock_data_role_name.name
export const generateDuplicateFileNameFindAll = (fileName: string, data: any[]) => {
  // Extract base name before "[duplicate X]"
  const baseNameMatch = fileName.match(/^(.+?)(?: \[duplicate \d+\])?$/)
  if (!baseNameMatch) return fileName

  const baseName = baseNameMatch[1].trim()

  // Regex to match all names with the same base and optional "[duplicate X]"
  const pattern = new RegExp(`^${baseName}( \\[duplicate (\\d+)\\])?$`)

  let maxDuplicate = 0

  data?.forEach((item) => {
    const match = item.name.match(pattern)
    if (match) {
      const dupNumber = match[2] ? parseInt(match[2], 10) : 0
      if (dupNumber > maxDuplicate) {
        maxDuplicate = dupNumber
      }
    }
  })

  const nextDuplicate = maxDuplicate + 1
  return `${baseName} [duplicate ${nextDuplicate}]`
}

export const formatWatchFormDate = (data: any) => {
  // ของเดิม ไม่ +1 วัน
  // const formatted = data
  //     ? new Date(data).toISOString().split('T')[0]
  //     : undefined;

  if (!data) return undefined

  // +1 วัน
  const date = new Date(data)
  date.setDate(date.getDate() + 1)
  const formatted = date.toISOString().split('T')[0]

  return formatted
}

export const formatFormDate = (data: any) => {
  const formatted: any = data ? format(new Date(data), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  // const formatted: any = data ? format(new Date(data), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
  return formatted
}

export const formatFormDateForBulletin = (data: any) => {
  // const formatted: any = data ? format(new Date(data), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const formatted: any = data ? format(new Date(data), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')
  return formatted
}

export const formatDateBulletin = (valueShow: any) => {
  if (!valueShow) return '' // Check if valueShow exists

  const dateParts = valueShow.split('-')
  if (dateParts.length === 3) {
    // Rearrange the parts to "DD/MM/YYYY"
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`
  }

  return valueShow // Return the original if the format doesn't match
}

// Utility function to format a date to DD/MM/YYYY
export const formatSearchDate = (date: any) => {
  const d = new Date(date)
  const day = ('0' + d.getDate()).slice(-2)
  const month = ('0' + (d.getMonth() + 1)).slice(-2)
  const year = d.getFullYear()

  return `${day}/${month}/${year}`
}

// filter start - end แบบสับ
// จาก issues Filter start date - end date เป็น period ไม่ได้ ระบบแสดงเฉพาะวัน start date ที่ตรงกันเท่านั้น https://app.clickup.com/t/86er07k7r
// case 1 start_date อย่างเดียว ให้หา record ที่ <= start_date ลงไป
// case 2 end_date อย่างเดียว ให้หา record ที่ >= end_date ขึ้นไป
// case 3 เลือกทั้ง start_date และ end_date ให้ทำ case 1 และ case 2 แล้วเอา output ที่ได้มาแสดง
export const filterStartEndDate = (dataTable: any[], schStartDate: any, schEndDate: any) => {
  const normalizeDate = (date: any) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0) // Set time to midnight
    return d
  }

  const formattedSchStartDate = schStartDate ? normalizeDate(schStartDate) : null
  const formattedSchEndDate = schEndDate ? normalizeDate(schEndDate) : null

  if (formattedSchStartDate && formattedSchEndDate) {
    // Case 3: Filter by both start_date and end_date
    return dataTable?.filter((item) => {
      const itemStartDate = normalizeDate(item.start_date || item.contract_point_start_date || item.contract_start_date)
      const itemEndDate = normalizeDate(item.end_date || item.contract_point_end_date || item.contract_end_date)
      return itemStartDate <= formattedSchStartDate && itemEndDate >= formattedSchEndDate
    })
  } else if (formattedSchStartDate && !formattedSchEndDate) {
    // Case 1: Filter by start_date only
    return dataTable?.filter((item) => {
      // const itemStartDate = normalizeDate(item.start_date);
      const itemStartDate = normalizeDate(item.start_date || item.contract_point_start_date || item.contract_start_date)
      return itemStartDate <= formattedSchStartDate
    })
  } else if (!formattedSchStartDate && formattedSchEndDate) {
    // Case 2: Filter by end_date only
    return dataTable?.filter((item) => {
      // const itemEndDatex = item.end_date ? normalizeDate(item.end_date) : null;
      const itemEndDate = item?.end_date || item.contract_point_end_date || item.contract_end_date ? normalizeDate(item?.end_date || item?.contract_point_end_date || item.contract_end_date) : null
      // If end_date is null, include the item
      if (itemEndDate === null) return true
      return itemEndDate >= formattedSchEndDate

      // const itemEndDate = normalizeDate(item.end_date);
      // return itemEndDate >= formattedSchEndDate;
    })
  } else {
    // Default: Return all data
    return dataTable
  }
}

// v1.0.90 ปรับ logic filter start date และ end date https://app.clickup.com/t/86erqt8ed
// อ้างอิงจาก https://docs.google.com/spreadsheets/d/1fHZ692T057Nto6rVd6VwBtB6boaSZZhm/edit?gid=742530898#gid=742530898

// Case 1: Filter by start_date only
// ให้เอา param schStartDate ที่ <= item?.end_date หรือ item?.end_date == null

// Case 2: Filter by end_date only
// ให้เอา item?.start_date <= param schEndDate หรือ param schEndDate == null

// Case 3: Filter by both start_date and end_date
// เอาข้อมูล ที่ case 1 กับ 2 เป็น true
type IFilterStartEnd = {
  start_date?: string | Date | null
  end_date?: string | Date | null
  contract_point_start_date?: string | Date | null
  contract_point_end_date?: string | Date | null
  contract_start_date?: string | Date | null
  contract_end_date?: string | Date | null
}

export const filterStartEndDateNewLogic = (dataTable: IFilterStartEnd[], schStartDate?: string | Date | null, schEndDate?: string | Date | null) => {
  // ----------------- ไม่อยากเอาไว้ข้างนอก -----------------
  const TZ = 'Asia/Bangkok'
  // แปลงเป็น dayjs และปัดเวลาให้เป็นต้นวัน
  const toTHDay = (d: string | Date | null | undefined) => (d == null ? null : dayjs(d).tz(TZ).startOf('day'))

  // ดึง start/end จากหลายฟิลด์ที่เป็นไปได้
  const pickStart = (r: IFilterStartEnd) => toTHDay(r.start_date ?? r.contract_point_start_date ?? r.contract_start_date)
  const pickEnd = (r: IFilterStartEnd) => toTHDay(r.end_date ?? r.contract_point_end_date ?? r.contract_end_date)
  // ---------------------------------------------------

  const sParam = schStartDate ? dayjs(schStartDate).tz(TZ).startOf('day') : null
  const eParam = schEndDate ? dayjs(schEndDate).tz(TZ).startOf('day') : null

  // Case 3: มีทั้ง start และ end → ต้องผ่านทั้ง Case 1 และ Case 2 (intersection)
  if (sParam && eParam) {
    return (dataTable ?? []).filter((row) => {
      const sItem = pickStart(row) // อาจเป็น null
      const eItem = pickEnd(row) // อาจเป็น null (ตีความว่าเปิดยาวไปอนาคต)

      // Case 1: sParam <= eItem || eItem == null
      const ok1 = eItem ? sParam.isSame(eItem) || sParam.isBefore(eItem) : true

      // Case 2: sItem <= eParam  (ถ้า sItem == null ถือว่าไม่ผ่าน เพราะไม่รู้จุดเริ่ม)
      const ok2 = sItem ? sItem.isSame(eParam) || sItem.isBefore(eParam) : false

      // case 3 นี้จะ return เมื่อ case 1, 2 เป็น true
      return ok1 && ok2
    })
  }

  // Case 1: มี start อย่างเดียว → sParam <= eItem || eItem == null
  if (sParam && !eParam) {
    return (dataTable ?? []).filter((row) => {
      const eItem = pickEnd(row)
      return eItem ? sParam.isSame(eItem) || sParam.isBefore(eItem) : true
    })
  }

  // Case 2: มี end อย่างเดียว → sItem <= eParam
  if (!sParam && eParam) {
    return (dataTable ?? []).filter((row) => {
      const sItem = pickStart(row)
      return sItem ? sItem.isSame(eParam) || sItem.isBefore(eParam) : false
    })
  }

  // ไม่ใส่เงื่อนไขใด ๆ → คืนทั้งหมด
  return dataTable ?? []
}

// filter start - end แบบหาจาก today อยู่ในช่วง start - end
// key start_date, end_date
// หาข้อมูล data_system ที่ today ยังอยู่ในช่วง start_date กับ end_date
// แต่ถ้าเจออันที่ end_date = null และ start_date ได้ผ่าน today มาแล้วให้เอาอันนั้น
export const filterTodayInRangeStartEndDate = (data?: any) => {
  const today = dayjs() // หรือระบุเป็น dayjs('2025-07-12') ถ้าต้องการกำหนดเอง

  const activeEntry = data.find((entry: any) => {
    const start = toDayjs(entry.start_date)
    const end = entry.end_date ? toDayjs(entry.end_date) : null

    // กรณีมีทั้ง start และ end
    if (end) {
      return today.isSameOrAfter(start) && today.isSameOrBefore(end)
    }

    // กรณี end_date = null
    return today.isSameOrAfter(start)
  })

  return activeEntry
}

export const filterTodayInRangeStartEndDatetoArray = (data?: any) => {
  const today = dayjs() // หรือระบุเป็น dayjs('2025-07-12') ถ้าต้องการกำหนดเอง

  const activeEntry = data?.filter((entry: any) => {
    const start = dayjs(entry.start_date)
    const end = entry.end_date ? dayjs(entry.end_date) : null

    // กรณีมีทั้ง start และ end
    if (end) {
      return today.isSameOrAfter(start) && today.isSameOrBefore(end)
    }

    // กรณี end_date = null
    return today.isSameOrAfter(start)
  })

  return activeEntry
}

/**
 * คำนวณว่า gas_day อยู่ในช่วง [today - resValue วัน] ถึง today หรือไม่
 * @param todayStr - วันที่ปัจจุบันในรูปแบบ "DD/MM/YYYY"
 * @param gas_day - วันที่ gas_day เช่น "2025-01-05"
 * @param resValueStr - จำนวนวันที่ย้อนหลัง เช่น "90.000"
 * @returns true ถ้า gas_day อยู่นอกช่วง → ปุ่ม disable
 *          false ถ้า gas_day อยู่ในช่วง → ปุ่ม enable
 */
export const calculateIsDisableBtn = (todayStr: any, gas_day: string, resValueStr: string): boolean => {
  // const today = toDayjs(todayStr, 'DD/MM/YYYY');
  const today = todayStr
  const gasDay = toDayjs(gas_day)
  const days = parseFloat(resValueStr) // เช่น "90.000" → 90
  const startRange = today.subtract(days, 'day')

  const isWithinRange = gasDay.isSameOrAfter(startRange) && gasDay.isSameOrBefore(today)
  return !isWithinRange // อยู่นอกช่วง = true (disable), อยู่ในช่วง = false (enable)
}

export const filterStartEndDateBooking = (dataTable: any[], srchStartDate?: Date | string | null, srchEndDate?: Date | string | null) => {
  // แปลงเป็น YYYY-MM-DD แบบ "โลคอล" ไม่ใช่ UTC
  const toLocalYMD = (date?: Date | string | null) => {
    if (!date) return null
    const d = new Date(date)
    if (isNaN(d.getTime())) return null
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0') // 1-12
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}` // เทียบแบบสตริงได้
  }

  const sY = toLocalYMD(srchStartDate)
  const eY = toLocalYMD(srchEndDate)

  if (sY && eY) {
    // ต้อง "อยู่ในช่วง" [sY, eY] แบบ inclusive
    return dataTable.filter((item) => {
      const start = toLocalYMD(item.contract_start_date)
      const end = toLocalYMD(item.contract_end_date)
      return !!start && !!end && start >= sY && end <= eY
    })
  }

  if (sY && !eY) {
    // มีแต่ start → ตรงวัน start
    return dataTable.filter((item) => toLocalYMD(item.contract_start_date) === sY)
  }

  if (!sY && eY) {
    // มีแต่ end → ตรงวัน end
    return dataTable.filter((item) => toLocalYMD(item.contract_end_date) === eY)
  }

  return dataTable
}

export const filterStartEndDateBookingRelease = (dataTable: any[], schStartDate: any, schEndDate: any) => {
  const normalizeDate = (date: any) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0) // Set time to midnight
    return d
  }

  const formattedSchStartDate = schStartDate ? normalizeDate(schStartDate) : null
  const formattedSchEndDate = schEndDate ? normalizeDate(schEndDate) : null

  if (formattedSchStartDate && formattedSchEndDate) {
    // Case 3: Filter by both start_date and end_date
    return dataTable.filter((item) => {
      const itemStartDate = normalizeDate(item.release_start_date)
      const itemEndDate = addDays(normalizeDate(item.release_end_date), 1)
      return itemStartDate <= formattedSchStartDate && itemEndDate >= formattedSchEndDate
    })
  } else if (formattedSchStartDate && !formattedSchEndDate) {
    // Case 1: Filter by start_date only
    return dataTable.filter((item) => {
      const itemStartDate = normalizeDate(item.release_start_date)
      return itemStartDate <= formattedSchStartDate
    })
  } else if (!formattedSchStartDate && formattedSchEndDate) {
    // Case 2: Filter by end_date only
    return dataTable.filter((item) => {
      const itemEndDate = item.release_end_date ? addDays(normalizeDate(item.release_end_date), 1) : null
      // If end_date is null, include the item
      if (itemEndDate === null) return true
      return itemEndDate >= formattedSchEndDate

      // const itemEndDate = normalizeDate(item.end_date);
      // return itemEndDate >= formattedSchEndDate;
    })
  } else {
    // Default: Return all data
    return dataTable
  }
}

export const filterByGasDayRange = (data: any[], start_data?: string, end_data?: string) => {
  return data.filter((item) => {
    const gasDay = toDayjs(item.gasDay)

    const isAfterStart = start_data ? gasDay.isSameOrAfter(toDayjs(start_data), 'day') : true
    const isBeforeEnd = end_data ? gasDay.isSameOrBefore(toDayjs(end_data), 'day') : true

    return isAfterStart && isBeforeEnd
  })
}

// ถ้ามี gas_day_from อย่างเดียว ให้กรองหา data.gas_day_from >= gas_day_from
// ถ้ามี gas_day_to อย่างเดียว ให้กรองหา data.gas_day_to <= gas_day_to
// ถ้ามีทั้งคู่ กรองหาช่วง data.gas_day_from ถึง data.gas_day_to ที่ตรงกับ gas_day_from, gas_day_to
// ถ้าไม่มี ไม่ต้องกรอง
export const filterByGasDayFromTo = (data: any[], gas_day_from?: string, gas_day_to?: string) => {
  // กรณีมีแต่ from
  if (gas_day_from && !gas_day_to) {
    return data.filter((item) => dayjs(item.gas_day_from).isSameOrAfter(dayjs(gas_day_from)))
  }

  // กรณีมีแต่ to
  if (!gas_day_from && gas_day_to) {
    return data.filter((item) => dayjs(item.gas_day_to).isSameOrBefore(dayjs(gas_day_to)))
  }

  // กรณีมีทั้งคู่
  if (gas_day_from && gas_day_to) {
    return data.filter((item) => dayjs(item.gas_day_from).isSameOrAfter(dayjs(gas_day_from)) && dayjs(item.gas_day_to).isSameOrBefore(dayjs(gas_day_to)))
  }

  // ถ้าไม่มีอะไรเลย → ไม่กรอง
  return data
}

// if schStartDate or schEndDate then filter only one that's have value
// no need to check isRange
export const filterDataTableByDateRange = (dataTable: any[], schStartDate: any, schEndDate: any) => {
  // const formatSearchDate = (date: string) => new Date(date).toISOString().split('T')[0]; // Convert to YYYY-MM-DD
  const formatSearchDate = (date: string | Date, addDays: number = 0) => {
    const parsedDate = typeof date === 'string' ? new Date(date) : date
    parsedDate.setDate(parsedDate.getDate() + addDays) // Add specified number of days
    const year = parsedDate.getFullYear()
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
    const day = String(parsedDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}` // Return formatted date in YYYY-MM-DD
  }

  const formattedSchStartDate = schStartDate ? formatSearchDate(schStartDate) : null
  const formattedSchEndDate = schEndDate ? formatSearchDate(schEndDate) : null

  if (formattedSchStartDate && formattedSchEndDate) {
    return dataTable.filter((item: any) => {
      // if (!item.start_date || !item.end_date) {
      if (!item.start_date && !item.end_date) return false

      const itemStartDate = formatSearchDate(item.start_date)
      const itemEndDate = formatSearchDate(item.end_date)

      const isInRange =
        // (!formattedSchStartDate || itemEndDate >= formattedSchStartDate) &&
        // (!formattedSchEndDate || itemStartDate <= formattedSchEndDate) &&
        (!formattedSchStartDate || formattedSchStartDate <= itemStartDate) && (!formattedSchEndDate || formattedSchEndDate >= itemEndDate)

      return isInRange
    })
  } else if (formattedSchStartDate && !formattedSchEndDate) {
    // หาแค่ start_date
    return dataTable.filter((item: any) => {
      return formattedSchStartDate ? formatSearchDate(item?.start_date) === formatSearchDate(formattedSchStartDate) : true
    })
  } else if (!formattedSchStartDate && formattedSchEndDate) {
    // หาแค่ end_date
    return dataTable.filter((item: any) => {
      return formattedSchEndDate ? formatSearchDate(item?.end_date) === formatSearchDate(formattedSchEndDate) : true
    })
  } else {
    // return all
    return dataTable
  }
}

export const roundNumber = (qtyStr: any) => {
  // const num = parseFloat(qtyStr);   // แปลงจาก string → number
  // return Math.round(num);           // ปัดเศษเป็นจำนวนเต็ม

  const num = Number(qtyStr)
  return Math.round(num).toLocaleString()
}

// add thousand separator
export const formatNumber = (number: any) => {
  if (number === null || number === undefined) return ''
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatNumberNoDecimal = (number: any) => {
  // if (isNaN(number)) return '';

  if (number == null || number == undefined) {
    return ''
  }

  if (number == 0) {
    return '0' // special case for zero
  }

  // Convert number to a fixed 3-decimal format
  const fixedNumber = parseFloat(number)

  // Add thousand separators
  // return fixedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const string_num = fixedNumber.toLocaleString('en-US')

  return string_num // "1,050,000"
}

// export const roundTo3 = (value: any) => {
//   const num = Number(value)
//   if (Number.isNaN(num)) return 0
//   return Math.round((num + Number.EPSILON) * 1000) / 1000
// }

export const roundTo2 = (value: any) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export const roundTo3 = (value: any) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 1000) / 1000
}

export const roundTo4 = (value: any) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 10000) / 10000
}

export const roundTo6 = (value: any) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 1000000) / 1000000
}

export const roundTo9 = (value: any) => {
  const num = Number(value)
  if (Number.isNaN(num)) return 0
  return Math.round((num + Number.EPSILON) * 1000000000) / 1000000000
}

// เติมทศนิยม 3 ตำแหน่ง
export const formatNumberThreeDecimal = (number: any) => {
  // เช็ค empty ก่อน
  if (number === null || number === undefined || number === '') {
    return ''
  }

  // แปลงเป็น string แล้ว trim กันช่องว่าง
  const str = String(number).trim()

  // กัน case "   "
  if (str === '') return ''

  // ถ้าไม่ใช่ตัวเลข
  if (isNaN(Number(str))) return number

  const num = Number(str)

  // 0 ต้องเป็น 0.000
  if (num === 0) {
    return '0.000'
  }

  const fixedNumber = num.toFixed(3)

  return fixedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
// export const formatNumberThreeDecimal = (number: any) => {

//     if (isNaN(number)) return number;

//     if (number == null || number == undefined) {
//         return "";
//     }

//     if (number == 0) {
//         return "0.000"; // special case for zero
//     }

//     // Convert number to a fixed 3-decimal format
//     const fixedNumber = parseFloat(number).toFixed(3);

//     // Add thousand separators
//     return fixedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// };

export const formatNumberThreeDecimalNoComma = (value: any) => {
  // คืนค่าเดิมถ้าเป็น null/undefined หรือสตริงว่าง
  if (value === null || value === undefined) return value

  // ถ้าเป็น number ตรง ๆ
  if (typeof value === 'number') {
    return Number.isNaN(value) ? value : value.toFixed(3)
  }

  // แปลงเป็นสตริงเพื่อล้างฟอร์แมต
  const raw = String(value).trim()
  if (raw === '') return raw

  // รองรับรูปแบบลบแบบวงเล็บ เช่น "(1,234.5)"
  const isParenNegative = /^\(.*\)$/.test(raw)

  // ล้างช่องว่าง/คอมมา/อักขระอื่น ๆ ให้เหลือเฉพาะตัวเลข จุด และลบ
  const cleaned = raw
    .replace(/[\s\u00A0]/g, '') // ช่องว่างรวม non-breaking space
    .replace(/,/g, '') // ตัดคอมมาทศนิยม/หลักพันออก
    .replace(/[^\d.-]/g, '') // เหลือแค่ 0-9 . และ -

  const num = parseFloat(cleaned)
  if (Number.isNaN(num)) return value // พาร์สไม่ได้ → คืนค่าเดิม

  const signed = isParenNegative && !/^-/.test(cleaned) ? -num : num
  return signed.toFixed(3) // ไม่มีคอมมาในผลลัพธ์
}

export const formatNumberFourDecimalNomNoComma = (value: any) => {
  // คืนค่าเดิมถ้าเป็น null/undefined หรือสตริงว่าง
  if (value === null || value === undefined) return value

  // ถ้าเป็น number ตรง ๆ
  if (typeof value === 'number') {
    return Number.isNaN(value) ? value : value.toFixed(4)
  }

  // แปลงเป็นสตริงเพื่อล้างฟอร์แมต
  const raw = String(value).trim()
  if (raw === '') return raw

  // รองรับรูปแบบลบแบบวงเล็บ เช่น "(1,234.5)"
  const isParenNegative = /^\(.*\)$/.test(raw)

  // ล้างช่องว่าง/คอมมา/อักขระอื่น ๆ ให้เหลือเฉพาะตัวเลข จุด และลบ
  const cleaned = raw
    .replace(/[\s\u00A0]/g, '') // ช่องว่างรวม non-breaking space
    .replace(/,/g, '') // ตัดคอมมาทศนิยม/หลักพันออก
    .replace(/[^\d.-]/g, '') // เหลือแค่ 0-9 . และ -

  const num = parseFloat(cleaned)
  if (Number.isNaN(num)) return value // พาร์สไม่ได้ → คืนค่าเดิม

  const signed = isParenNegative && !/^-/.test(cleaned) ? -num : num
  return signed.toFixed(4) // ไม่มีคอมมาในผลลัพธ์
}

// เติมทศนิยม 6 ตำแหน่ง
export const formatNumberSixDecimal = (value: any): string => {
  if (value === null || value === undefined || value === '') return ''

  const n = Number(value)
  if (!Number.isFinite(n)) return String(value) // กัน NaN/Infinity

  const absFixed = Math.abs(n).toFixed(6) // "1234.567890"
  const [intPart, decPart] = absFixed.split('.')

  const intWithCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const sign = n < 0 ? '-' : ''

  return `${sign}${intWithCommas}.${decPart}`
}

export const formatNumberSixDecimalNoComma = (number: any) => {
  if (isNaN(number)) return number

  // Convert number to a fixed 3-decimal format
  const fixedNumber = parseFloat(number).toFixed(6)

  // Add thousand separators
  return fixedNumber
}
export const formatNumberTwoDecimalNom = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  const number = Number(String(value).replace(/,/g, ''))

  if (!Number.isFinite(number)) {
    return value
  }

  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
// export const formatNumberTwoDecimalNom = (number: any) => {
//     if (isNaN(number)) return number;

//     if (number == 0) {
//         return "0.00"; // special case for zero
//     }

//     if (number == null || number == undefined) {
//         return "";
//     }

//     const strNumber = String(number);
//     const [integerPart, decimalPart = ""] = strNumber.split(".");

//     let trimmedDecimal = decimalPart?.substring(0, 2); // ตัดแค่ 2 หลัก

//     if (trimmedDecimal.length === 1) {
//         trimmedDecimal = trimmedDecimal + "0";
//     } else if (trimmedDecimal.length === 2) {
//         trimmedDecimal = trimmedDecimal;
//     } else if (trimmedDecimal.length === 0) {
//         trimmedDecimal = "00";
//     }

//     const formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ","); // ใส่ comma

//     return `${formattedInteger}.${trimmedDecimal}`;
// };

export const formatNumberTwoDecimalNomRound = (number: any) => {
  if (isNaN(number)) return number

  if (number == 0) {
    return '0.00' // special case for zero
  }

  if (number == null || number == undefined) {
    return ''
  }

  const num = Number(number)
  if (Number.isNaN(num)) return 0
  let fixedNumber = (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2)
  const [intPart, decimalPart] = fixedNumber.split('.')

  // return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
  const formattedInteger = intPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // ใส่ comma

  return `${formattedInteger}.${decimalPart}`
}

export const formatNumberThreeDecimalNom = (number: any) => {
  if (isNaN(number)) return number // Handle invalid numbers gracefully

  const strNumber = String(number)
  const [integerPart, decimalPart = ''] = strNumber.split('.')

  let trimmedDecimal = decimalPart?.substring(0, 3) // ตัดแค่ 3 หลัก

  if (trimmedDecimal.length === 1) {
    trimmedDecimal = trimmedDecimal + '00'
  } else if (trimmedDecimal.length === 2) {
    trimmedDecimal = trimmedDecimal + '0'
  } else if (trimmedDecimal.length === 0) {
    trimmedDecimal = '000'
  }

  const formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${formattedInteger}.${trimmedDecimal}`
}

export const formatNumberThreeDecimalNomRound = (number: any) => {
  if (number == null || number === '') return ''
  const num = Number(number)
  if (Number.isNaN(num)) return number

  // round 3 ตำแหน่ง
  const rounded = Math.round((num + Number.EPSILON) * 1000) / 1000

  // แยก integer / decimal
  const [integerPart, decimalPart = ''] = rounded.toString().split('.')

  // เติม 0 ให้ครบ 3 ตำแหน่ง
  const fixedDecimal = decimalPart.padEnd(3, '0')

  // ใส่ comma
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${formattedInteger}.${fixedDecimal}`
}

// ทศนิยม 4 ตำแหน่งเอาไว้ใช้กับ nomination || balance
// มันจะไม่ปัดทศนิยมขึ้น
export const formatNumberFourDecimalNom = (number: any) => {
  if (isNaN(number)) return number // Handle invalid numbers gracefully

  if (number)
    if (number == 0) {
      return '0.0000' // special case for zero
    }

  if (number == null || number == undefined) {
    return ''
  }

  const strNumber = String(number)
  const [integerPart, decimalPart = ''] = strNumber.split('.')

  let trimmedDecimal = decimalPart?.substring(0, 4) // ตัดแค่  หลัก

  if (trimmedDecimal.length === 1) {
    trimmedDecimal = trimmedDecimal + '000'
  } else if (trimmedDecimal.length === 2) {
    trimmedDecimal = trimmedDecimal + '00'
  } else if (trimmedDecimal.length === 3) {
    trimmedDecimal = trimmedDecimal + '0'
  } else if (trimmedDecimal.length === 0) {
    trimmedDecimal = '0000'
  }

  const formattedInteger = integerPart?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${formattedInteger}.${trimmedDecimal}`
}

// ทุกค่าที่มีหน่วยเป็น MMSCF ให้แสดงทศนิยม 6 ตำแหน่ง https://app.clickup.com/t/86eub6d1w
// ทศนิยม 6 ตำแหน่งเอาไว้ใช้กับ nomination || balance ที่เป็น MMSCF
// มันจะไม่ปัดทศนิยมขึ้น
export const formatNumberSixDecimalNom = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  let str = String(value).replace(/,/g, '').trim()

  if (isNaN(Number(str))) return value

  const isNegative = str.startsWith('-')
  if (isNegative) str = str.slice(1)

  const [intPart, decPart = ''] = str.split('.')

  const truncatedDecimal = (decPart + '000000').slice(0, 6)

  const result = `${isNegative ? '-' : ''}${intPart}.${truncatedDecimal}`

  return Number(result).toLocaleString('en-US', {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6
  })
}

export const formatNumberFourDecimalNomRound = (number: any) => {
  if (number == null || number === '') return ''
  const num = formatNumberSixDecimalNomRound_pass(Number(number))

  if (Number.isNaN(num)) return number

  // round 3 ตำแหน่ง
  const rounded = Math.round((num + Number.EPSILON) * 10000) / 10000

  // แยก integer / decimal
  const [integerPart, decimalPart = ''] = rounded.toString().split('.')

  // เติม 0 ให้ครบ 3 ตำแหน่ง
  const fixedDecimal = decimalPart.padEnd(4, '0')

  // ใส่ comma
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${formattedInteger}.${fixedDecimal}`
}

export const formatNumberSixDecimalNomRound_pass = (number: any) => {
  if (number == null || number === '') return ''
  const num = Number(number)
  if (Number.isNaN(num)) return number

  const rounded = Math.round((num + Number.EPSILON) * 1000000) / 1000000

  return rounded
}

export const formatNumberSixDecimalNomRound = (number: any) => {
  if (number == null || number === '') return ''
  const num = Number(number)

  if (Number.isNaN(num)) return number

  const rounded = Math.round((num + Number.EPSILON) * 1000000) / 1000000

  // แยก integer / decimal
  const [integerPart, decimalPart = ''] = rounded.toString().split('.')

  const fixedDecimal = decimalPart.padEnd(6, '0')

  // ใส่ comma
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${formattedInteger}.${fixedDecimal}`
}

// เติมทศนิยม 4 ตำแหน่ง
export const formatNumberFourDecimal = (number: any) => {
  if (isNaN(number)) return ''

  if (number == 0) {
    return '0.0000' // special case for zero
  }

  if (number == null || number == undefined) {
    return ''
  }

  const fixedNumber = parseFloat(number).toFixed(4) // Keep 4 decimal places
  const [intPart, decimalPart] = fixedNumber.split('.')
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${withCommas}.${decimalPart}`
}

// ที่ส่งเข้ามาแล้วมันไม่ปัดเศษ เช่น ส่งเข้าไป 0.00675 ได้ออกมาเป็น 0.0067
// อันนี้เกิดจาก floating point ของ JavaScript
// แม้ตามคณิตศาสตร์ 0.00675 ดูเหมือนควรปัดเป็น 0.0068
// แต่ใน JS ค่าที่เก็บจริงอาจเป็นประมาณนี้:
// 0.006749999999...
export const formatNumberFourDecimalEpsilon = (number: any) => {
  if (isNaN(number)) return ''

  const n = Number(number)

  if (number == 0) {
    return '0.0000' // special case for zero
  }

  if (number == null || number == undefined) {
    return ''
  }

  const rounded = Math.round((n + Number.EPSILON) * 10000) / 10000
  const fixedNumber = rounded.toFixed(4)
  const [intPart, decimalPart] = fixedNumber.split('.')

  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${withCommas}.${decimalPart}`
}
export const formatNumberThreeDecimalEpsilon = (number: any) => {
  if (isNaN(number)) return ''

  const n = Number(number)

  if (number == 0) {
    return '0.000' // special case for zero
  }

  if (number == null || number == undefined) {
    return ''
  }

  const rounded = Math.round((n + Number.EPSILON) * 1000) / 1000
  const fixedNumber = rounded.toFixed(3)
  const [intPart, decimalPart] = fixedNumber.split('.')

  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${withCommas}.${decimalPart}`
}

// ทศนิยม 4 ตำแหน่งแบบไม่มีคอมม่า มีแต่โคม่า
export const formatNumberFourDecimalNoComma = (number: any) => {
  if (isNaN(number)) return number

  if (number == 0) {
    return '0.0000' // special case for zero
  }

  if (number == null) {
    return '' // special case for zero
  }

  const fixedNumber = parseFloat(number).toFixed(4) // Keep 4 decimal places
  const [intPart, decimalPart] = fixedNumber.split('.')

  return `${intPart}.${decimalPart}`
}

// เติมทศนิยม 2 ตำแหน่ง
// export const formatNumberTwoDecimal = (number: any) => {
//     if (isNaN(number)) return number;

//     if (number == 0) {
//         return "0.00"; // special case for zero
//     }

//     if (number == null) {
//         return ""; // special case for zero
//     }

//     const fixedNumber = parseFloat(number).toFixed(2);
//     const [intPart, decimalPart] = fixedNumber.split(".");

//     const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//     return `${withCommas}.${decimalPart}`;
// };

export const formatNumberTwoDecimal = (number: any) => {
  const n = Number(number)
  if (!Number.isFinite(n)) return number

  const factor = 100
  const adjusted = Math.trunc((n + (n >= 0 ? 1e-10 : -1e-10)) * factor) / factor

  const sign = adjusted < 0 ? '-' : ''
  const abs = Math.abs(adjusted)

  const [i, d = ''] = abs.toString().split('.')
  const intWithComma = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const dec = d.padEnd(2, '0')

  return `${sign}${intWithComma}.${dec}`
}

export const parseObjToFloat = (data: any) => {
  return Object.keys(data).reduce((parsed: any, key: any) => {
    // If the value is not null, parse it to float
    parsed[key] = data[key] !== null ? parseFloat(data[key]) : null
    return parsed
  }, {})
}

// เปลี่ยนท้าย telephone เป็น xxx
export function maskLastFiveDigits(value: string): string {
  if (value.length <= 5) {
    return 'X'.repeat(value.length)
  }
  const visiblePart = value.slice(0, -5)
  const maskedPart = 'X'.repeat(5)
  return visiblePart + maskedPart
}

// เปลี่ยนท้าย email เป็น xxx
export function anonymizeEmail(email: string) {
  return email.replace(/([^@]{3})@/, 'xxx@')
}

export const handleInputNumberChange = (e: {target: {value: any}}, setValue: (arg0: any) => void, setErrors: (arg0: {(prevErrors: any): any; (prevErrors: any): any}) => void, fieldName: any) => {
  const value = e.target.value

  // Remove all non-numeric characters except for the period
  const numericValue = value.replace(/[^0-9.]/g, '')

  // Split the input into whole and decimal parts
  const [wholePart, decimalPart] = numericValue.split('.')

  // Format the whole part with commas
  const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // Combine the whole and decimal parts, limiting decimals to two digits
  const formattedValue = decimalPart !== undefined ? `${formattedWholePart}.${decimalPart.substring(0, 2)}` : `${formattedWholePart}.00`

  // Set the formatted value
  setValue(formattedValue)

  // Optional: Clear error when input is valid
  if (setErrors && fieldName) {
    setErrors((prevErrors) => ({...prevErrors, [fieldName]: null}))
  }
}

export const groupDataCapacityPublication = (data: any) => {
  return data.map((entry: any) => {
    const yearly: any = {}
    const monthly: any = {}

    entry?.day_data?.forEach((item: any) => {
      const [date, {area_nominal_capacity}]: any = Object.entries(item)[0]
      const [day, month, year] = date.split('/')

      // Summing by year
      yearly[year] = (yearly[year] || 0) + area_nominal_capacity

      // Summing by month in "YYYY-MM" format
      const monthKey = `${year}-${month}`
      monthly[monthKey] = (monthly[monthKey] || 0) + area_nominal_capacity
    })

    // Convert yearly and monthly objects to arrays of objects
    const year_data = Object.entries(yearly).map(([year, value]) => ({[year]: value}))
    const month_data = Object.entries(monthly).map(([month, value]) => ({[month]: value}))

    // Return new object with all original attributes, plus year_data and month_data
    return {
      ...entry,
      year_data,
      month_data
    }
  })
}

export const hexToRgba = (hex: any, alpha = 1) => {
  if (!hex || typeof hex !== 'string' || !hex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
    // Return white if hex is null, undefined, or invalid
    return `rgba(255, 255, 255, ${alpha})`
  }

  const matches = hex.match(/\w\w/g)
  if (!matches) {
    // Fallback in case the match unexpectedly fails
    return `rgba(255, 255, 255, ${alpha})`
  }

  const [r, g, b] = matches.map((x: any) => parseInt(x, 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const generateData = (data: any) => {
  const currentYear = dayjs().year()
  const startDate = toDayjs(`${currentYear}-01-01`) // 01/01/yyyy
  const endDate = startDate.add(10, 'year') // 10 ปีข้างหน้า

  return data.map((item: any) => {
    const dayData = []
    let currentDate = startDate

    while (currentDate.isBefore(endDate)) {
      const formattedDate = currentDate.format('YYYY-MM-DD') // dd/MM/yyyy
      let valueAd = item.area_nominal_capacity
      if (item?.capacity_publication.length > 0) {
        const finds = item?.capacity_publication[0]?.capacity_publication_date.find((f: any) => {
          return toDayjs(f.date_day).format('YYYY-MM-DD') === formattedDate
        })
        if (!!finds) {
          if (!!finds?.value_adjust_use) {
            valueAd = finds?.value_adjust_use
          } else if (!!finds?.value_adjust) {
            valueAd = finds?.value_adjust
          } else if (!!finds?.value) {
            valueAd = finds?.value
          }
        }
      }
      dayData.push({
        [formattedDate]: {area_nominal_capacity: Number(valueAd)}
      })
      currentDate = currentDate.add(1, 'day') // เพิ่มวันทีละ 1 วัน
    }

    return {
      ...item,
      day_data: dayData
    }
  })
}

export const isDifferenceMoreThan15Minutes = (date1: any, date2: any) => {
  const dateTime1 = dayjs(date1)
  const dateTime2 = dayjs(date2)

  const differenceInMinutes = Math.abs(dateTime1.diff(dateTime2, 'minute'))

  return differenceInMinutes > 15
}

export const splitCamelCase = (input: any) => {
  if (!input) return ''
  return input.replace(/([a-z])([A-Z])/g, '$1 $2')
}

export const isIPAllowed = (clientIP: string | undefined): boolean => {
  const allowedIPs = ALLOWED_IP_LIST ? ALLOWED_IP_LIST : ['171.100.219.40', '234.234.234.234']

  if (!clientIP) {
    return false
  }

  const extractedIP = clientIP.split(',')[0].trim()

  return allowedIPs.includes(extractedIP)
}

export const clearCookiesAndLocalStorage = (clear?: any) => {
  // Clearing cookies and local storage...

  // Clear cookies
  setCookie('v4r2d9z5m3h0c1p0x7l', null, 0)
  if (clear) {
    setCookie('redirectAfterLogin', null, 0)
  }
  setCookie('k3a9r2b6m7t0x5w1s8j', null, 0)

  localStorage.removeItem('dev_mode_token')

  // Clear local storage
  localStorage.removeItem('x9f3w1m8q2y0u5d7v1z')
  localStorage.removeItem('v4r2d9z5m3h0c1p0x7l')
  localStorage.removeItem('p5n3b7j2k9s1a6wq8t0')
  localStorage.removeItem('cxv2ao10xumw84vi0')

  // clear page capacity mgn
  localStorage.removeItem('i0y7l2w4o8c5v9b1r3z')
  localStorage.removeItem('t9j5u3k2f0w7p1m4r6a')

  // clear page nom daily mgn
  localStorage.removeItem('x2y77nvd3sw2v9b1r3z')
  localStorage.removeItem('w5j5u3kld1,7p1m4r6p')
  localStorage.removeItem('h593stkin2xqa9m')

  // clear nom dasboard route
  localStorage.removeItem('nom_dashboard_route')
  localStorage.removeItem('nom_dashboard_route_obj')
  localStorage.removeItem('nom_dashboard_route_obj_weekly')
  localStorage.removeItem('nom_dashboard_route_mix_quality_obj')
  localStorage.removeItem('nom_dashboard_route_quantity_obj')

  //
  localStorage.removeItem('o8g4z3q9f1v5e2n7k6t')
  localStorage.removeItem('k3a9r2b6m7t0x5w1s8j')
  localStorage.removeItem('i0y77nvd3sw2v9b1r3z')

  // clear signature
  localStorage.removeItem('sigUrl')

  // Cookies and local storage cleared.
}

export const calculateMonthRange = (startDate: Date, endDate: Date) => {
  if (!startDate || !endDate) return 0 // Return 0 if either date is invalid

  const monthRange = differenceInMonths(endDate, startDate)
  return monthRange
}

// เอาไว้เรียง node กะ edges
export const createNodeEdges = (revised_capacity_path: any, revised_capacity_path_edges: any) => {
  // ดึง node เริ่มต้นที่ area.entry_exit_id === 1
  const startNode = revised_capacity_path?.find((area: any) => {
    return area?.area?.entry_exit_id === 1
  })

  if (!startNode) {
    // config master path Entry missing
    // throw new Error("ไม่พบ node เริ่มต้นที่มี entry_exit_id === 1");
  }

  const resultNodeEdges: any = {
    nodes: [],
    edges: []
  }

  // สร้าง map สำหรับ edges เพื่อเชื่อมโยง source_id -> target_id
  const edgesMap = new Map()
  revised_capacity_path_edges.forEach((edge: any) => {
    edgesMap.set(edge.source_id, edge.target_id)
  })

  // ไล่โหนดตาม chain
  let currentNodeId = startNode?.area?.id
  while (currentNodeId) {
    // ดึงข้อมูล node ปัจจุบัน
    const currentNode = revised_capacity_path.find((area: any) => area.area.id === currentNodeId)

    if (currentNode) {
      // เพิ่ม node เข้า result
      resultNodeEdges.nodes.push({
        id: currentNode.area.id,
        name: currentNode.area.name,
        ...currentNode.area // เพิ่มข้อมูลอื่นๆ ของ area
      })

      // ดึง target_id สำหรับโหนดต่อไป
      const nextNodeId = edgesMap.get(currentNodeId)

      // เพิ่ม edge เข้า result
      if (nextNodeId) {
        resultNodeEdges.edges.push({
          source: currentNodeId,
          target: nextNodeId
        })
      }

      // เดินหน้าไปยังโหนดถัดไป
      currentNodeId = nextNodeId
    } else {
      // หากไม่พบ node ปัจจุบันใน revised_capacity_path หยุด
      break
    }
  }

  return resultNodeEdges
}

// ใช้ใน capacity publication modal remark
export default function getLatestMatchingData(data: any) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // แก้ไขเผื่อ end_date == null
  const filteredData = data.filter((item: any) => {
    const startDate = new Date(item.start_date)
    startDate.setHours(0, 0, 0, 0)
    const endDate = item.end_date ? new Date(item.end_date) : null
    if (endDate) endDate.setHours(0, 0, 0, 0)
    return now >= startDate && (endDate === null || now <= endDate)
  })

  // If multiple matches, find the one with the latest id
  if (filteredData.length > 0) {
    return filteredData.reduce((latest: any, item: any) => {
      return item.id > latest.id ? item : latest
    })
  }

  // Return null if no matches
  return null
}

export const generateMonthlyRange = (startDate: any, endDate: any) => {
  const dates = []
  let currentDate = toDayjs(startDate, 'DD/MM/YYYY').startOf('month')
  let end = toDayjs(endDate, 'DD/MM/YYYY').startOf('month')

  // เคสที่เป็น long, med, short term มันจะใส่ end_date เป็นวันต้นเดือน
  // เลยทำ subtract ไป 1 วันเพื่อไม่ให้แสดงคอลัมเกิน
  if (end.date() === 1) {
    end = end.subtract(1, 'day')
  }

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    dates.push(currentDate.format('DD/MM/YYYY'))
    currentDate = currentDate.add(1, 'month') // Increment by 1 month
  }

  return dates
}

//#region for booking => Capacity Contract List
export const generateMonthlyRangeNotfix = (startDate: any, endDate: any) => {
  const dates = []
  let currentDate = toDayjs(startDate, 'DD/MM/YYYY').startOf('month')
  let end = toDayjs(endDate, 'DD/MM/YYYY').startOf('month')

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    dates.push(currentDate.format('DD/MM/YYYY'))
    currentDate = currentDate.add(1, 'month') // Increment by 1 month
  }

  return dates
}

export const generateDailyRange = (startDate: any, endDate: any) => {
  const dates = []
  let currentDate = toDayjs(startDate, 'DD/MM/YYYY').startOf('day')
  const end = toDayjs(endDate, 'DD/MM/YYYY').startOf('day').subtract(1, 'day')

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    dates.push(currentDate.format('DD/MM/YYYY'))
    currentDate = currentDate.add(1, 'day') // Increment by 1 day
  }

  return dates
}

export const arraysAreEqual = (arr1: any[], arr2: any[]) => {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false
  }
  return true
}

export const sortNodesByEdges = (nodes: any, edges: any) => {
  // Create a map to store nodes by their IDs for quick lookup
  const nodeMap = nodes.reduce((map: any, node: any) => {
    map[node.id] = node
    return map
  }, {})

  // Create a graph adjacency list
  const adjacencyList: any = {}
  edges.forEach((edge: any) => {
    if (!adjacencyList[edge.source]) {
      adjacencyList[edge.source] = []
    }
    adjacencyList[edge.source].push(edge.target)
  })

  // Perform topological sort
  const visited = new Set()
  const result: any = []

  function dfs(nodeId: any) {
    if (visited.has(nodeId)) return
    visited.add(nodeId)

    const neighbors = adjacencyList[nodeId] || []
    neighbors.forEach((neighbor: any) => {
      dfs(neighbor)
    })

    result.push(nodeId)
  }

  // Start DFS from each node that exists in the edges
  Object.keys(adjacencyList).forEach((nodeId) => dfs(nodeId))

  // Reverse result to get correct topological order
  result.reverse()

  // Map the sorted IDs to their corresponding nodes
  const sortedNodes = result.map((nodeId: any) => nodeMap[nodeId])
  const sortAndAdustPos = adjustNodePositions(sortedNodes)

  return sortAndAdustPos

  // Include any nodes that are not connected (not part of edges)
  const unconnectedNodes = nodes.filter((node: any) => !result.includes(node.id))
  return [...sortedNodes, ...unconnectedNodes]
}

const adjustNodePositions = (nodes: any) => {
  const startX = 0 // Fixed x value
  const startY = 300 // Starting y value
  const incrementY = 120 // Increment y by 20 for each node

  // return nodes.map((node:any, index:any) => {
  //     if (index === 0) {
  //         // Keep the first node's position unchanged
  //         return node;
  //     }
  //     // Update the position.y by adding 25 to the previous node's position.y
  //     const previousNode = nodes[index - 1];
  //     return {
  //         ...node,
  //         position: {
  //             ...node.position,
  //             x: previousNode.position.x + 120,
  //             y: previousNode.position.y + 1
  //         }
  //     };
  // });

  return nodes.map((node: any, index: any) => ({
    ...node,
    position: {
      // x: startX,
      // y: startY + index * incrementY,
      x: startX + index * incrementY,
      y: startY
    }
  }))
}

export const findDateRanges = (data: any) => {
  if (!data.length) return {}

  const maxReleaseStartDate = data.reduce((max: any, item: any) => {
    const currentStartDate = new Date(item.release_start_date)
    return currentStartDate > max ? currentStartDate : max
  }, new Date(data[0].release_start_date))

  const minReleaseEndDate = data.reduce((min: any, item: any) => {
    const currentEndDate = new Date(item.release_end_date)
    return currentEndDate < min ? currentEndDate : min
  }, new Date(data[0].release_end_date))

  return {
    maxReleaseStartDate: maxReleaseStartDate.toISOString(),
    minReleaseEndDate: minReleaseEndDate.toISOString()
  }
}

export const transformDataDonut = (dataFromBank?: any) => {
  // Calculate total number of contract_code across all items
  const totalContractCount = dataFromBank?.reduce((total: any, item: any) => total + item?.contract_code.length, 0)

  // Transform into required format
  const transformedData = {
    labels: dataFromBank?.map((item: any) => item.name), // Extract names for labels
    datasets: [
      {
        label: 'Shipper Contract',
        data: dataFromBank?.map((item: any) => item?.contract_code.length), // Extract contract_code lengths
        backgroundColor: dataFromBank?.map((item: any) => item.color), // Extract colors
        borderWidth: 1
      }
    ]
  }

  // Calculate percentages for each category
  const percentages = dataFromBank?.map((item: any) => ({
    name: item.name,
    percentage: totalContractCount > 0 ? ((item?.contract_code.length / totalContractCount) * 100).toFixed(2) : 0
  }))

  return {transformedData, percentages}
  // }
}

export const normalizeDate = (date: any) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0) // Set time to midnight
  return d
}

const INF_END = dayjs('9999-12-31')
const endOrInf = (d: any) => d ?? INF_END

export const filterCapChart = (data: any[], srchStartDate: any = null, srchEndDate: any = null) => {
  const formattedSchStartDate: any = srchStartDate ? normalizeDate(srchStartDate) : null
  const formattedSchEndDate: any = srchEndDate ? normalizeDate(srchEndDate) : null

  const rangesOverlap = (aStart: any, aEnd: any, bStart: any, bEnd: any) => {
    const aE = endOrInf(aEnd)
    return aStart <= bEnd && bStart <= aE
  }

  return (data ?? []).map((category: any) => {
    const filteredContracts = (category?.contract_code ?? []).filter((contract: any) => {
      const itemStart = normalizeDate(contract?.contract_start_date)
      const itemEnd = normalizeDate(contract?.contract_end_date) // อาจเป็น null

      if (!itemStart) return false

      // 1) มีทั้งช่วงค้นหาเริ่มและจบ -> ใช้ตรรกะ "ทับซ้อนกัน"
      if (formattedSchStartDate && formattedSchEndDate) {
        return rangesOverlap(itemStart, itemEnd, formattedSchStartDate, formattedSchEndDate)
      }

      // 2) มีแค่ start ของช่วงค้นหา -> ต้องยัง active ตั้งแต่วันนั้นขึ้นไป
      if (formattedSchStartDate && !formattedSchEndDate) {
        const check_start = itemStart >= formattedSchStartDate
        // return endOrInf(itemEnd) >= formattedSchStartDate;
        return check_start
      }

      // 3) มีแค่ end ของช่วงค้นหา -> ต้องเริ่มก่อนหรือเท่ากับวันสิ้นสุด
      if (!formattedSchStartDate && formattedSchEndDate) {
        // return itemStart <= formattedSchEndDate;
        return endOrInf(itemEnd) <= formattedSchEndDate
      }

      // 4) ไม่กำหนดช่วง -> ผ่านทั้งหมด
      return true
    })

    return {
      ...category,
      contract_code: filteredContracts
    }
  })
}

// 2025-01-22 ตอนนี้ใช้กับ chart donut
export const filterByShipper = (data: any, srchShipper: any = null) => {
  return data.map((category: any) => {
    // Filter contract_code based on srchShipper
    const filteredContracts = category.contract_code.filter((contract: any) => {
      return srchShipper ? contract.group_id === srchShipper : true
    })

    // Return the updated category with the filtered contract_code
    return {
      ...category,
      contract_code: filteredContracts
    }
  })
}

// 2026-01-19 ตอนนี้ใช้กับ chart donut แบบรองรับ shipper เป็น arr
export const filterByShipperArr = (data: any, srchShipper: any = null) => {
  return data.map((category: any) => {
    const filteredContracts = category.contract_code.filter((contract: any) => {
      return srchShipper?.length > 0 ? srchShipper.includes(contract.group_id) : true
    })

    return {
      ...category,
      contract_code: filteredContracts
    }
  })
}

export const calculateMonthDifference = (startDate: any, endDate: any) => {
  // Check if either date is undefined
  if (!startDate || !endDate) {
    // Both startDate and endDate must be provided
    return 0
  }
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate the year and month difference
  const yearDifference = end.getFullYear() - start.getFullYear()
  const monthDifference = end.getMonth() - start.getMonth()

  // Total months difference
  return yearDifference * 12 + monthDifference
}

// ใช้กับ planning dashboard --> tab Long term --> chart แรกบนสุด
export const sumValuesByArea = (dataLong: any) => {
  let areaMap = new Map()

  dataLong?.forEach(({data}: any) => {
    data?.forEach((item: any) => {
      const areaId = item.area.id
      if (!areaMap.has(areaId)) {
        areaMap.set(areaId, {
          ...item,
          value: [...item.value] // Clone array เพื่อหลีกเลี่ยง mutation
        })
      } else {
        let existing = areaMap.get(areaId)
        existing.value = existing.value.map((val: any, index: any) => {
          if (item.value[index] || item.value[index] == 0) {
            if (val) {
              return val + item.value[index]
            } else {
              return item.value[index]
            }
          }
          return val
        })
        areaMap.set(areaId, existing)
      }
    })
  })

  // เรียงลำดับเอา Entry มาแสดงก่อนแล้วตามด้วย Exit https://app.clickup.com/t/86ev16nhm
  const result = Array.from(areaMap.values()).sort((a: any, b: any) => Number(a?.entry_exit_id ?? 0) - Number(b?.entry_exit_id ?? 0))

  return result
  // return Array.from(areaMap.values());
}

// ใช้กับ planning dashboard --> tab Long term --> chart ย่อยด้านล่าง
export const mergeDataByGroupAndArea = (dataLong: any) => {
  let groupMap = new Map()

  dataLong?.forEach(({data, group, ...rest}: any) => {
    const groupId = group.id
    if (!groupMap.has(groupId)) {
      groupMap.set(groupId, {
        group: {...group},
        dataMap: new Map(), // ใช้ Map เพื่อรวม area.id
        meta: {...rest} // เก็บ metadata อื่น ๆ
      })
    }

    let groupEntry = groupMap.get(groupId)

    data?.forEach((item: any) => {
      const areaId = item.area.id

      if (!groupEntry.dataMap.has(areaId)) {
        groupEntry.dataMap.set(areaId, {
          ...item,
          value: [...item.value] // Clone array ป้องกัน mutation
        })
      } else {
        let existing = groupEntry.dataMap.get(areaId)
        existing.value = existing.value.map(
          (val: any, index: number) => (val ?? 0) + (item.value[index] ?? 0) // Handle null values
        )
        groupEntry.dataMap.set(areaId, existing)
      }
    })

    groupMap.set(groupId, groupEntry)
  })

  // แปลง dataMap ให้เป็น array และคืนค่า
  return Array.from(groupMap.values()).map(({dataMap, ...rest}: any) => ({
    ...rest,
    data: Array.from(dataMap.values())
  }))
}

// test sum and group
export const sumDataByAreaAndGroup = (dataLong: any[]) => {
  let areaGroupMap = new Map()

  dataLong?.forEach(({data, group}) => {
    data?.forEach((item: any) => {
      const areaId = item.area.id
      const groupId = group.id
      const key = `${areaId}-${groupId}` // Unique key for (area, group)

      if (!areaGroupMap.has(key)) {
        areaGroupMap.set(key, {
          area: {...item.area},
          entry_exit: {...item.entry_exit_id}, // เติมมา
          group: {id: group.id, name: group.name, color: group.color},
          years: [...item.year], // Take years from first item
          sumValues: Array(item.year.length).fill(null) // Initialize sums
        })
      }

      let entry = areaGroupMap.get(key)

      item.value.forEach((val: number | null, index: number) => {
        if (val || val == 0) {
          if (entry.sumValues[index] == null) {
            entry.sumValues[index] = val
          } else {
            entry.sumValues[index] += val ?? 0 // Sum up values, handle nulls
          }
        }
      })

      areaGroupMap.set(key, entry)
    })
  })

  return Array.from(areaGroupMap.values())
}

// รวมค่า area ที่ซ้ำ
// สำหรับ chart ย่อย ที่ map data ของ medium term หน้า planning dashboard
export const mergeDataByGroupMedTerm = (data_med_term_each?: any) => {
  const groupedData: any = {}

  data_med_term_each?.forEach((entry: any) => {
    const groupId = entry.group.id
    if (!groupedData[groupId]) {
      groupedData[groupId] = {...entry, data: []}
    }

    entry?.data?.forEach((newData: any) => {
      let existingData = groupedData[groupId].data.find((d: any) => d.area.id === newData.area.id)

      if (existingData) {
        existingData.value = existingData.value.map((val: any, idx: any) => val + newData.value[idx])
      } else {
        groupedData[groupId].data.push({...newData})
      }
    })
  })

  return Object.values(groupedData)
}

// สำหรับ chart ย่อย ที่ map data ของ medium term หน้า planning dashboard

// ปรับ mergeDataByGroupMedTerm ให้เช็คด้วยว่าที่ lasted_data.group.id เดียวกัน
// ใน lasted_data.data แต่ละตัว ให้หา area.id ที่ซ้ำกันในแต่ละ lasted_data.data
// แล้วเช็ค day กับ value โดย day กับ value เนี่ยจะ index ตรงกัน
// ถ้าที่หามามี day ที่ overlap กัน ให้เอาของตัวที่ lasted_data.shipper_file_submission_date ใหม่กว่ามา

type AreaRow = {
  area: {id: number | string; name?: string; color?: string}
  day: string[] // "DD/MM/YYYY"
  value: (number | null | undefined)[]
  [k: string]: any // field อื่น ๆ
}

export const mergeDataByGroupMedTermVersionTwo = (data_med_term_each?: any[]) => {
  if (!Array.isArray(data_med_term_each) || data_med_term_each.length === 0) return []

  // กลุ่มตาม group.id
  const groups: any = new Map<string | number, any>()

  for (const entry of data_med_term_each) {
    const groupId = entry?.group?.id
    if (groupId == null) continue

    if (!groups.has(groupId)) {
      groups.set(groupId, {
        ...entry, // เก็บ meta ของ group ใส่ไว้ก่อน
        data: [] // จะสร้างใหม่จากการ merge
      })
    }

    const accGroup = groups.get(groupId)
    const subDate = new Date(entry?.shipper_file_submission_date ?? 0).getTime()

    // สำหรับภายใน group: รวมตาม area.id
    // โครงสร้างสะสม: areaId -> { daysMap, latestMeta, latestMetaDate }
    if (!accGroup._areaMerge) accGroup._areaMerge = new Map()

    for (const row of entry?.data ?? []) {
      const areaId = row?.area?.id
      if (areaId == null) continue

      // เตรียมตัวสะสมของ area นี้
      if (!accGroup._areaMerge.has(areaId)) {
        accGroup._areaMerge.set(areaId, {
          daysMap: new Map<string, {value: number; sourceDate: number}>(),
          latestMeta: {...row}, // เก็บ meta (เช่น nomination_point, unit, ฯลฯ) จาก row ล่าสุด
          latestMetaDate: subDate
        })
      }

      const slot = accGroup._areaMerge.get(areaId)

      // อัปเดต meta ถ้า entry นี้ใหม่กว่า
      if (subDate >= (slot.latestMetaDate ?? 0)) {
        slot.latestMeta = {...row}
        slot.latestMetaDate = subDate
      }

      // รวมค่าแบบ day->value โดยให้ของใหม่ overwrite ถ้าวันซ้ำ
      const len = Math.max(row.day?.length ?? 0, row.value?.length ?? 0)
      for (let i = 0; i < len; i++) {
        const d = row.day?.[i]
        if (!d) continue

        const vRaw = row.value?.[i]
        const v = Number(vRaw ?? 0)
        if (!Number.isFinite(v)) continue

        const existed = slot.daysMap.get(d)
        if (!existed) {
          slot.daysMap.set(d, {value: v, sourceDate: subDate})
        } else {
          // ถ้าวันซ้ำ ให้เลือกตัวที่ shipper_file_submission_date ใหม่กว่า
          if (subDate > existed.sourceDate) {
            slot.daysMap.set(d, {value: v, sourceDate: subDate})
          }
        }
      }
    }
  }

  // แปลงผลลัพธ์กลับเป็นรูปแบบเดิม: ภายในแต่ละ group -> data: AreaRow[]
  const result: any[] = []
  for (const [, g] of groups) {
    const outRows: AreaRow[] = []

    for (const [, slot] of g._areaMerge ?? []) {
      // sort day ตามเวลา (DD/MM/YYYY)
      const days = Array.from(slot.daysMap.keys()).sort((a: any, b: any) => {
        const [da, ma, ya] = a.split('/').map(Number)
        const [db, mb, yb] = b.split('/').map(Number)
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime()
      })

      const values = days.map((d) => slot.daysMap.get(d)!.value)

      // ใช้ meta ล่าสุด แล้วแทนที่ day/value เป็นของที่ merge แล้ว
      const {day: _ignoredDay, value: _ignoredValue, ...restMeta} = slot.latestMeta ?? {}
      outRows.push({
        ...restMeta,
        day: days,
        value: values
      })
    }

    const {_areaMerge, data: _ignoredData, ...groupMeta} = g
    result.push({
      ...groupMeta,
      data: outRows
    })
  }

  return result
}
export type PlanningGetValueMode = 'latestValueByEachPlanningFile' | 'latestValueByEachNominationPoint'

// ใช้กับ Planning medium term
type ResMed = {
  data: Array<{
    area: {id: number; name: string; color: string}
    customer: string
    month: (string | null)[]
    id: number
    nomination_point: string
    unit: string
    entry_exit_id: number
    entry_exit: string
    value: number[]
    // บาง flow (เช่น export) ต้องการอ่าน field meta ต่อ nomination_point จาก item โดยตรง
    // เลยทำให้ optional เพื่อไม่กระทบ payload/API shape เดิม
    planning_code_id?: number
    planning_code?: string
    start_date?: string
    end_date?: string
    shipper_file_submission_date?: string
  }>
  planning_code_id: number
  planning_code: string
  group: {id: number; id_name: string; name: string; company_name: string}
  start_date: string
  end_date: string
  shipper_file_submission_date: string
}

export function mergeResMed(res_med_: ResMed[], getValueMode: PlanningGetValueMode = 'latestValueByEachNominationPoint'): ResMed[] {
  // ---- helpers ----
  const parseDMY = (dmy: string) => {
    // "DD/MM/YYYY" -> Date
    const [dd, mm, yyyy] = dmy.split('/').map(Number)
    return new Date(yyyy, mm - 1, dd)
  }

  const cmpDate = (a: string, b: string) => {
    return parseDMY(a).getTime() - parseDMY(b).getTime()
  }

  const isNonNullMonth = (m: string | null): m is string => m !== null && m !== undefined

  // ---- group by group.id ----
  const byGroup: any = new Map<number, ResMed[]>()
  for (const doc of res_med_) {
    const gid = doc.group.id
    if (!byGroup.has(gid)) byGroup.set(gid, [])
    byGroup.get(gid)!.push(doc)
  }

  const result: ResMed[] = []

  for (const [gid, docs] of byGroup.entries()) {
    if (docs.length === 1) {
      // ไม่มีซ้ำก็ผ่านเลย แต่ normalize ตัด month=null
      const only = JSON.parse(JSON.stringify(docs[0])) as ResMed
      only.data = only.data.map((it) => {
        const months = it.month.filter(isNonNullMonth)
        const values: number[] = []
        const idxMap = new Map(months.map((m, i) => [m, i]))
        // map value ตาม index เดิม (เดาถูกต้องตามโครงสร้างเดิม)
        for (const m of months) {
          const idx = idxMap.get(m)!
          values.push(it.value[idx] ?? null)
        }
        return {
          ...it,
          month: months,
          value: values,
          planning_code_id: only.planning_code_id,
          planning_code: only.planning_code,
          start_date: only.start_date,
          end_date: only.end_date,
          shipper_file_submission_date: only.shipper_file_submission_date
        }
      })
      result.push(only)
      continue
    }

    // มีหลายเอกสารใน group เดียวกัน ⇒ ต้องรวม
    // เลือกเอกสารที่ shipper_file_submission_date ใหม่สุดเป็น base metadata
    const newest = docs.reduce((a: any, b: any) => (new Date(a.shipper_file_submission_date) > new Date(b.shipper_file_submission_date) ? a : b))

    // เก็บ meta "ล่าสุด" ต่อ nomination_point (อิง shipper_file_submission_date)
    // เพื่อให้ item ที่ merge แล้วสามารถอ้างอิง start/end/planning_code ล่าสุดได้
    const latestMetaByNomPoint = new Map<string, ResMed>()
    for (const meta of docs) {
      const ts = Date.parse(meta.shipper_file_submission_date ?? '')
      for (const it of meta.data) {
        const np = it.nomination_point
        const prev = latestMetaByNomPoint.get(np)
        if (!prev) {
          latestMetaByNomPoint.set(np, meta)
          continue
        }
        const prevTs = Date.parse(prev.shipper_file_submission_date ?? '')
        if (Number.isFinite(ts) && (!Number.isFinite(prevTs) || ts > prevTs)) {
          latestMetaByNomPoint.set(np, meta)
        }
      }
    }

    // สร้าง index ของรายการ data ทั้งหมดจากทุกเอกสาร โดยคีย์ = nomination_point + area.id + entry_exit_id
    type DataWithMeta = {
      meta: ResMed
      item: ResMed['data'][number]
    }

    const bucket: any = new Map<string, DataWithMeta[]>()

    for (const meta of docs) {
      for (const item of meta.data) {
        // normalize: ตัด month = null พร้อม value index ที่คู่กัน (ถ้ามี)
        const months: string[] = []
        const values: number[] = []
        item.month.forEach((m: any, i: any) => {
          if (isNonNullMonth(m)) {
            months.push(m)
            values.push(item.value[i] ?? null)
          }
        })
        const latestMeta = latestMetaByNomPoint.get(item.nomination_point) ?? meta
        const normItem = {
          ...item,
          month: months,
          value: values,
          planning_code_id: latestMeta.planning_code_id,
          planning_code: latestMeta.planning_code,
          start_date: latestMeta.start_date,
          end_date: latestMeta.end_date,
          shipper_file_submission_date: latestMeta.shipper_file_submission_date
        }

        const key = `${normItem.nomination_point}__area:${normItem.area.id}__ee:${normItem.entry_exit_id}`
        if (!bucket.has(key)) bucket.set(key, [])
        bucket.get(key)!.push({meta, item: normItem})
      }
    }

    const groupAllMonths: string[] | null = getValueMode === 'latestValueByEachPlanningFile' ? Array.from(new Set<string>(docs.flatMap((doc: ResMed) => doc.data.flatMap((it) => (it.month ?? []).filter(isNonNullMonth))))).sort(cmpDate) : null
    const monthToWinningDoc = getValueMode === 'latestValueByEachPlanningFile' && groupAllMonths ? buildDateToWinningDoc(docs, 'month', groupAllMonths) : null

    // รวมแต่ละ key
    const mergedData: ResMed['data'] = []

    for (const [key, arr] of bucket.entries()) {
      let allMonths: string[]
      let mergedValues: (number | null)[]

      if (getValueMode === 'latestValueByEachPlanningFile' && groupAllMonths && monthToWinningDoc) {
        allMonths = []
        mergedValues = []
        for (const m of groupAllMonths) {
          const winner = monthToWinningDoc.get(m)
          if (!winner) continue
          const val = getValueFromDocForDate(winner, key, m, 'month')
          if (val === undefined) continue
          allMonths.push(m)
          mergedValues.push(val)
        }
      } else {
        // latestValueByEachNominationPoint: รวม set ของทุกเดือน แล้วเลือกค่าล่าสุดต่อ nomination_point
        const allMonthsSet = new Set<string>()
        for (const {item} of arr) {
          for (const m of item.month as string[]) allMonthsSet.add(m)
        }
        allMonths = Array.from(allMonthsSet).sort(cmpDate)

        const monthToValue = new Map<string, number | null>()
        for (const m of allMonths) {
          const candidates = arr.filter(({item}: any) => (item.month as string[]).includes(m))
          candidates.sort((a: any, b: any) => new Date(b.meta.shipper_file_submission_date).getTime() - new Date(a.meta.shipper_file_submission_date).getTime())
          const chosen = candidates[0]
          const idx = (chosen.item.month as string[]).indexOf(m)
          const val = chosen.item.value[idx] ?? null
          monthToValue.set(m, val)
        }

        mergedValues = allMonths.map((m) => monthToValue.get(m) ?? null)
      }

      if (allMonths.length === 0) continue

      // ใช้เมตาดาต้า item จากเอกสารที่ "ใหม่สุด" ของ key นี้เป็นโครง
      const newestForKey = arr.reduce((a: any, b: any) => (new Date(a.meta.shipper_file_submission_date) > new Date(b.meta.shipper_file_submission_date) ? a : b))

      const baseItem = newestForKey.item
      mergedData.push({
        ...baseItem,
        // อัปเดตเป็นช่วง month ใหม่ (min..max) พร้อม value ที่ตรง index
        month: allMonths,
        value: mergedValues
      })
    }

    // ประกอบเอกสารถูกโครงสร้างเดิม โดยอ้างอิงเมทาดาต้าจาก newest
    const mergedDoc: ResMed = {
      ...newest,
      data: mergedData
    }

    result.push(mergedDoc)
  }

  return result
}

// ดึงค่าล่าสุดของแต่ละ nomination_point ออกมา
export function mergeResMedBackUp(res_med_: ResMed[]): ResMed[] {
  // ---- helpers ----
  const parseDMY = (dmy: string) => {
    // "DD/MM/YYYY" -> Date
    const [dd, mm, yyyy] = dmy.split('/').map(Number)
    return new Date(yyyy, mm - 1, dd)
  }

  const cmpDate = (a: string, b: string) => {
    return parseDMY(a).getTime() - parseDMY(b).getTime()
  }

  const isNonNullMonth = (m: string | null): m is string => m !== null && m !== undefined

  // ---- group by group.id ----
  const byGroup: any = new Map<number, ResMed[]>()
  for (const doc of res_med_) {
    const gid = doc.group.id
    if (!byGroup.has(gid)) byGroup.set(gid, [])
    byGroup.get(gid)!.push(doc)
  }

  const result: ResMed[] = []

  for (const [gid, docs] of byGroup.entries()) {
    if (docs.length === 1) {
      // ไม่มีซ้ำก็ผ่านเลย แต่ normalize ตัด month=null
      const only = JSON.parse(JSON.stringify(docs[0])) as ResMed
      only.data = only.data.map((it) => {
        const months = it.month.filter(isNonNullMonth)
        const values: number[] = []
        const idxMap = new Map(months.map((m, i) => [m, i]))
        // map value ตาม index เดิม (เดาถูกต้องตามโครงสร้างเดิม)
        for (const m of months) {
          const idx = idxMap.get(m)!
          values.push(it.value[idx] ?? null)
        }
        return {
          ...it,
          month: months,
          value: values,
          planning_code_id: only.planning_code_id,
          planning_code: only.planning_code,
          start_date: only.start_date,
          end_date: only.end_date,
          shipper_file_submission_date: only.shipper_file_submission_date
        }
      })
      result.push(only)
      continue
    }

    // มีหลายเอกสารใน group เดียวกัน ⇒ ต้องรวม
    // เลือกเอกสารที่ shipper_file_submission_date ใหม่สุดเป็น base metadata
    const newest = docs.reduce((a: any, b: any) => (new Date(a.shipper_file_submission_date) > new Date(b.shipper_file_submission_date) ? a : b))

    // เก็บ meta "ล่าสุด" ต่อ nomination_point (อิง shipper_file_submission_date)
    // เพื่อให้ item ที่ merge แล้วสามารถอ้างอิง start/end/planning_code ล่าสุดได้
    const latestMetaByNomPoint = new Map<string, ResMed>()
    for (const meta of docs) {
      const ts = Date.parse(meta.shipper_file_submission_date ?? '')
      for (const it of meta.data) {
        const np = it.nomination_point
        const prev = latestMetaByNomPoint.get(np)
        if (!prev) {
          latestMetaByNomPoint.set(np, meta)
          continue
        }
        const prevTs = Date.parse(prev.shipper_file_submission_date ?? '')
        if (Number.isFinite(ts) && (!Number.isFinite(prevTs) || ts > prevTs)) {
          latestMetaByNomPoint.set(np, meta)
        }
      }
    }

    // สร้าง index ของรายการ data ทั้งหมดจากทุกเอกสาร โดยคีย์ = nomination_point + area.id + entry_exit_id
    type DataWithMeta = {
      meta: ResMed
      item: ResMed['data'][number]
    }

    const bucket: any = new Map<string, DataWithMeta[]>()

    for (const meta of docs) {
      for (const item of meta.data) {
        // normalize: ตัด month = null พร้อม value index ที่คู่กัน (ถ้ามี)
        const months: string[] = []
        const values: number[] = []
        item.month.forEach((m: any, i: any) => {
          if (isNonNullMonth(m)) {
            months.push(m)
            values.push(item.value[i] ?? null)
          }
        })
        const latestMeta = latestMetaByNomPoint.get(item.nomination_point) ?? meta
        const normItem = {
          ...item,
          month: months,
          value: values,
          planning_code_id: latestMeta.planning_code_id,
          planning_code: latestMeta.planning_code,
          start_date: latestMeta.start_date,
          end_date: latestMeta.end_date,
          shipper_file_submission_date: latestMeta.shipper_file_submission_date
        }

        const key = `${normItem.nomination_point}__area:${normItem.area.id}__ee:${normItem.entry_exit_id}`
        if (!bucket.has(key)) bucket.set(key, [])
        bucket.get(key)!.push({meta, item: normItem})
      }
    }

    // รวมแต่ละ key
    const mergedData: ResMed['data'] = []

    for (const [key, arr] of bucket.entries()) {
      // รวม set ของทุกเดือน
      const allMonthsSet = new Set<string>()
      for (const {item} of arr) {
        for (const m of item.month as string[]) allMonthsSet.add(m)
      }
      // เรียงเดือนจากน้อยไปมาก
      const allMonths = Array.from(allMonthsSet).sort(cmpDate)

      // map เดือน -> value (เลือกจาก meta ที่ shipper_file_submission_date ใหม่สุดเมื่อมีซ้ำ)
      const monthToValue = new Map<string, number | null>()
      for (const m of allMonths) {
        // หา candidates ที่มีเดือน m
        const candidates = arr.filter(({item}: any) => (item.month as string[]).includes(m))
        // เลือก meta ใหม่สุด
        candidates.sort((a: any, b: any) => new Date(b.meta.shipper_file_submission_date).getTime() - new Date(a.meta.shipper_file_submission_date).getTime())
        const chosen = candidates[0]
        // หา index ของเดือน m ใน chosen
        const idx = (chosen.item.month as string[]).indexOf(m)
        const val = chosen.item.value[idx] ?? null
        monthToValue.set(m, val)
      }

      const mergedValues = allMonths.map((m) => monthToValue.get(m) ?? null)

      // ใช้เมตาดาต้า item จากเอกสารที่ "ใหม่สุด" ของ key นี้เป็นโครง
      const newestForKey = arr.reduce((a: any, b: any) => (new Date(a.meta.shipper_file_submission_date) > new Date(b.meta.shipper_file_submission_date) ? a : b))

      const baseItem = newestForKey.item
      mergedData.push({
        ...baseItem,
        // อัปเดตเป็นช่วง month ใหม่ (min..max) พร้อม value ที่ตรง index
        month: allMonths,
        value: mergedValues
      })
    }

    // ประกอบเอกสารถูกโครงสร้างเดิม โดยอ้างอิงเมทาดาต้าจาก newest
    const mergedDoc: ResMed = {
      ...newest,
      data: mergedData
    }

    result.push(mergedDoc)
  }

  return result
}

// ใช้กับ Planning short term
type ResMedDayItem = {
  id: number
  nomination_point: string
  customer: string
  area: any
  unit: string
  entry_exit_id: number
  entry_exit: string
  day: (string | null)[]
  value: (number | null)[]
}

type ResMedDay = {
  data: ResMedDayItem[]
  planning_code_id: number
  planning_code: string
  group: {id: number; id_name: string; name: string; company_name: string}
  start_date: string
  end_date: string
  shipper_file_submission_date: string // ISO
}

// ---------------- Utilities ----------------
const parseDMYX = (dmy: string) => {
  // รองรับรูปแบบ "DD/MM/YYYY"
  const [dd, mm, yyyy] = dmy.split('/').map(Number)
  return new Date(yyyy, mm - 1, dd)
}
const cmpDateDMY = (a: string, b: string) => parseDMYX(a).getTime() - parseDMYX(b).getTime()
const isNonNull = (m: string | null | undefined): m is string => m !== null && m !== undefined

type DateField = 'month' | 'day'

// แยก bucket key กลับเป็น nomination_point + area.id + entry_exit_id
// รูปแบบ key: "{nomination_point}__area:{areaId}__ee:{entry_exit_id}"
const parseResMedBucketKey = (key: string) => {
  const [nomination_point, areaPart, eePart] = key.split('__')
  return {
    nomination_point,
    areaId: Number(areaPart.replace('area:', '')),
    entry_exit_id: Number(eePart.replace('ee:', ''))
  }
}

// เช็คว่า doc นี้มีข้อมูลในวัน/เดือน (dateField) ที่ระบุหรือไม่ (อย่างน้อย 1 รายการใน data)
function docHasDateFieldValue(doc: {data: Array<Record<string, any>>}, dateField: DateField, date: string): boolean {
  return doc.data.some((it) => ((it[dateField] as (string | null)[]) ?? []).includes(date))
}

// เลือก doc ที่ shipper_file_submission_date ใหม่ที่สุดจากรายการ candidates
function pickNewestDocBySubmission<T extends {shipper_file_submission_date: string}>(docs: T[]): T {
  return docs.reduce((a, b) => (new Date(a.shipper_file_submission_date) > new Date(b.shipper_file_submission_date) ? a : b))
}

// สร้าง map วัน/เดือน → doc ที่ "ชนะ" สำหรับ getValueMode = latestValueByEachPlanningFile
// แต่ละวัน: หา docs ที่มีข้อมูลวันนั้น แล้วเลือกตัวที่ shipper_file_submission_date ใหม่สุด
// ตัวอย่าง: วันที่ 01/04/2026 ถ้าไฟล์ล่าสุดไม่มี HKP → HKP จะไม่ได้ค่าของวันนั้น (แม้ไฟล์เก่าจะมี)
function buildDateToWinningDoc<T extends {shipper_file_submission_date: string; data: Array<Record<string, any>>}>(docs: T[], dateField: DateField, allDates: string[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const date of allDates) {
    const candidates = docs.filter((doc) => docHasDateFieldValue(doc, dateField, date))
    if (candidates.length) map.set(date, pickNewestDocBySubmission(candidates))
  }
  return map
}

// ดึง value ของ nomination_point (ตาม bucket key) ในวัน/เดือนที่ระบุ จาก doc ที่กำหนด
// คืน undefined ถ้า doc ไม่มีรายการนี้ หรือไม่มีวัน/เดือนนั้นในรายการ
function getValueFromDocForDate<T extends {data: Array<Record<string, any>>}>(doc: T, key: string, date: string, dateField: DateField): number | null | undefined {
  const {nomination_point, areaId, entry_exit_id} = parseResMedBucketKey(key)
  const item = doc.data.find((it) => it.nomination_point === nomination_point && it.area?.id === areaId && it.entry_exit_id === entry_exit_id)
  if (!item) return undefined
  const dates = (item[dateField] as (string | null)[]) ?? []
  const idx = dates.indexOf(date)
  if (idx === -1) return undefined
  return item.value[idx] ?? null
}

// ---------------- Generic merger (month/day) ----------------
// รวม planning data หลายไฟล์ (หลาย shipper_file_submission_date) ใน group เดียวกัน
// รองรับ 2 โหมดการเลือกค่า (getValueMode):
//   - latestValueByEachNominationPoint (default): ต่อวัน/เดือน + ต่อ nomination_point
//       เลือกค่าจาก doc ล่าสุดที่ "มี nomination_point นั้น" ในวันนั้น
//       → รวมช่วงวันจากทุกไฟล์ได้ (NP อาจมีค่าวันที่ไฟล์ล่าสุดไม่มี ถ้าไฟล์เก่ามี)
//   - latestValueByEachPlanningFile: ต่อวัน/เดือน
//       เลือก doc ล่าสุดที่มีข้อมูลวันนั้น (ไม่สน NP) แล้วเอาเฉพาะ NP ที่อยู่ในไฟล์ชนะเท่านั้น
//       → สะท้อน snapshot ของไฟล์ planning version ล่าสุดต่อวัน
function mergeResMedByDateField<T extends {[k in DateField]?: (string | null)[]}>(
  res_med_: Array<{
    data: Array<
      {
        id: number
        nomination_point: string
        customer: string
        area: any
        unit: string
        entry_exit_id: number
        entry_exit: string
        value: (number | null)[]
      } & T
    >
    planning_code_id: number
    planning_code: string
    group: {id: number; id_name: string; name: string; company_name: string}
    start_date: string
    end_date: string
    shipper_file_submission_date: string
  }>,
  dateField: DateField, // 'day' (short term) หรือ 'month' (medium term)
  getValueMode: PlanningGetValueMode = 'latestValueByEachNominationPoint'
) {
  type Doc = (typeof res_med_)[number]
  type Item = Doc['data'][number]

  // จัดกลุ่มตาม group.id (shipper/group เดียวกัน) — แต่ละ group merge แยกกัน
  const byGroup: any = new Map<number, Doc[]>()
  for (const doc of res_med_) {
    const gid = doc.group.id
    if (!byGroup.has(gid)) byGroup.set(gid, [])
    byGroup.get(gid)!.push(doc)
  }

  const out: Doc[] = []

  for (const [, docs] of byGroup) {
    // เรียง docs ใหม่ → เก่า (ใช้ตอนเลือกค่าล่าสุดและ meta ของเอกสาร)
    docs.sort((a: any, b: any) => {
      const tA = new Date(a.shipper_file_submission_date).getTime()
      const tB = new Date(b.shipper_file_submission_date).getTime()
      if (!Number.isFinite(tA) && !Number.isFinite(tB)) return 0
      if (!Number.isFinite(tA)) return -1
      if (!Number.isFinite(tB)) return 1
      return tB - tA
    })

    if (docs.length === 1) {
      // group มีไฟล์เดียว: ไม่ต้อง merge แค่ normalize ตัด null ออกจาก day/month array
      const only = structuredClone(docs[0])
      only.data = only.data.map((it: any) => {
        const dates = (it[dateField] ?? []).filter(isNonNull)
        const values: (number | null)[] = []
        // map index ตามเดิม (ค่าที่ตำแหน่งเดียวกับวันที่หลังกรอง null)
        ;(it[dateField] ?? []).forEach((d: any, i: any) => {
          if (isNonNull(d)) values.push(it.value[i] ?? null)
        })
        return {...it, [dateField]: dates, value: values} as Item
      })
      out.push(only)
      continue
    }

    // มีหลายเอกสารใน group เดียวกัน → ต้อง merge
    // ใช้ meta ระดับเอกสารจากไฟล์ที่ submit ล่าสุดของ group เป็นตัวแทน output
    const newestMetaDoc = docs.reduce((a: any, b: any) => (new Date(a.shipper_file_submission_date) > new Date(b.shipper_file_submission_date) ? a : b))

    // เก็บ doc ล่าสุดต่อ nomination_point (อิง shipper_file_submission_date)
    // ใช้แนบ planning_code, start_date, end_date ลงในแต่ละ item สำหรับ export/แสดงผล
    const latestMetaByNomPoint = new Map<string, Doc>()
    for (const meta of docs) {
      const ts = Date.parse(meta.shipper_file_submission_date ?? '')
      for (const it of meta.data as any[]) {
        const np = it?.nomination_point
        if (!np) continue
        const prev = latestMetaByNomPoint.get(np)
        if (!prev) {
          latestMetaByNomPoint.set(np, meta)
          continue
        }
        const prevTs = Date.parse(prev.shipper_file_submission_date ?? '')
        if (Number.isFinite(ts) && (!Number.isFinite(prevTs) || ts > prevTs)) {
          latestMetaByNomPoint.set(np, meta)
        }
      }
    }

    // bucket: จัดกลุ่มรายการที่เป็นตัวเดียวกัน (nomination_point + area + entry_exit) จากทุก doc
    const bucket: any = new Map<string, Array<{meta: Doc; item: Item}>>()
    for (const meta of docs) {
      for (const raw of meta.data) {
        // normalize: กรอง null ออกจาก day/month โดยคง index ของ value ให้ตรงกับวันที่ที่เหลือ
        const filteredDates: string[] = []
        const filteredValues: (number | null)[] = []
        ;(raw[dateField] ?? []).forEach((d: any, i: any) => {
          if (isNonNull(d)) {
            filteredDates.push(d)
            filteredValues.push(raw.value[i] ?? null)
          }
        })
        const latestMeta = latestMetaByNomPoint.get((raw as any).nomination_point) ?? meta
        // แนบ meta ล่าสุดของ nomination_point ลง item (optional fields)
        const item: Item = {
          ...raw,
          [dateField]: filteredDates,
          value: filteredValues,
          planning_code_id: (latestMeta as any).planning_code_id,
          planning_code: (latestMeta as any).planning_code,
          start_date: (latestMeta as any).start_date,
          end_date: (latestMeta as any).end_date,
          shipper_file_submission_date: (latestMeta as any).shipper_file_submission_date
        } as Item

        const key = `${item.nomination_point}__area:${item.area.id}__ee:${item.entry_exit_id}`
        if (!bucket.has(key)) bucket.set(key, [])
        bucket.get(key)!.push({meta, item})
      }
    }

    // --- เตรียมข้อมูลสำหรับโหมด latestValueByEachPlanningFile เท่านั้น ---
    // groupAllDates = union วัน/เดือนทั้งหมดใน group (ใช้เป็น timeline กลาง)
    const groupAllDates: string[] | null = getValueMode === 'latestValueByEachPlanningFile' ? Array.from(new Set<string>(docs.flatMap((doc: Doc) => doc.data.flatMap((it: Item) => ((it[dateField] as (string | null)[]) ?? []).filter(isNonNull))))).sort(cmpDateDMY) : null
    // dateToWinningDoc = แต่ละวัน/เดือน map ไปยัง planning file ที่ชนะ (submit ล่าสุดในวันนั้น)
    const dateToWinningDoc = getValueMode === 'latestValueByEachPlanningFile' && groupAllDates ? buildDateToWinningDoc(docs, dateField, groupAllDates) : null

    const mergedData: Item[] = []

    // รวมแต่ละ bucket (1 nomination_point + area + entry_exit) เป็น 1 แถวใน output
    for (const [key, arr] of bucket) {
      let allDates: string[]
      let values: (number | null)[]

      if (getValueMode === 'latestValueByEachPlanningFile' && groupAllDates && dateToWinningDoc) {
        // โหมด planning file: วน timeline กลาง แล้วเอาเฉพาะวันที่ NP นี้อยู่ในไฟล์ชนะของวันนั้น
        allDates = []
        values = []
        for (const d of groupAllDates) {
          const winner = dateToWinningDoc.get(d)
          if (!winner) continue
          const val = getValueFromDocForDate(winner, key, d, dateField)
          if (val === undefined) continue // NP ไม่อยู่ในไฟล์ชนะ → ข้ามวันนี้
          allDates.push(d)
          values.push(val)
        }
      } else {
        // โหมด nomination point (default): union วันของ NP นี้จากทุกไฟล์
        // ถ้าวันซ้ำ เลือกค่าจาก doc ที่ submit ล่าสุด "ที่มี NP นี้ในวันนั้น"
        const allDatesSet = new Set<string>()
        for (const {item} of arr) for (const d of (item[dateField] as string[]) ?? []) allDatesSet.add(d)
        allDates = Array.from(allDatesSet).sort(cmpDateDMY)

        const dateToValue = new Map<string, number | null>()
        for (const d of allDates) {
          const candidates = arr.filter(({item}: any) => ((item[dateField] as string[]) ?? []).includes(d))
          candidates.sort((a: any, b: any) => new Date(b.meta.shipper_file_submission_date).getTime() - new Date(a.meta.shipper_file_submission_date).getTime())
          const chosen = candidates[0]
          const idx = ((chosen.item[dateField] as string[]) ?? []).indexOf(d)
          dateToValue.set(d, chosen.item.value[idx] ?? null)
        }

        values = allDates.map((d) => dateToValue.get(d) ?? null)
      }

      // ไม่มีวันที่เหลือหลัง merge (เช่น NP ไม่เคยอยู่ในไฟล์ชนะเลย) → ไม่ push แถวนี้
      if (allDates.length === 0) continue

      // ใช้โครงสร้าง item (customer, area, unit ฯลฯ) จาก doc ล่าสุดที่เคยมี NP นี้ใน bucket
      const newestForKey = arr.reduce((a: any, b: any) => (new Date(a.meta.shipper_file_submission_date) > new Date(b.meta.shipper_file_submission_date) ? a : b))

      mergedData.push({
        ...newestForKey.item,
        [dateField]: allDates,
        value: values
      } as Item)
    }

    // ประกอบ output doc: meta จาก newestMetaDoc + data ที่ merge แล้ว
    out.push({
      ...newestMetaDoc,
      data: mergedData
    })
  }

  return out
}

// ดึงค่าล่าสุดของแต่ละ nomination_point ออกมา
function mergeResMedByDateFieldBackUp<T extends {[k in DateField]?: (string | null)[]}>(
  res_med_: Array<{
    data: Array<
      {
        id: number
        nomination_point: string
        customer: string
        area: any
        unit: string
        entry_exit_id: number
        entry_exit: string
        value: (number | null)[]
      } & T
    >
    planning_code_id: number
    planning_code: string
    group: {id: number; id_name: string; name: string; company_name: string}
    start_date: string
    end_date: string
    shipper_file_submission_date: string
  }>,
  dateField: DateField // 'day' หรือ 'month'
) {
  type Doc = (typeof res_med_)[number]
  type Item = Doc['data'][number]

  // group by group.id
  const byGroup: any = new Map<number, Doc[]>()
  for (const doc of res_med_) {
    const gid = doc.group.id
    if (!byGroup.has(gid)) byGroup.set(gid, [])
    byGroup.get(gid)!.push(doc)
  }

  const out: Doc[] = []

  for (const [, docs] of byGroup) {
    if (docs.length === 1) {
      // normalize null ออก
      const only = structuredClone(docs[0])
      only.data = only.data.map((it: any) => {
        const dates = (it[dateField] ?? []).filter(isNonNull)
        const values: (number | null)[] = []
        // map index ตามเดิม (ค่าที่ตำแหน่งเดียวกับวันที่หลังกรอง null)
        ;(it[dateField] ?? []).forEach((d: any, i: any) => {
          if (isNonNull(d)) values.push(it.value[i] ?? null)
        })
        return {...it, [dateField]: dates, value: values} as Item
      })
      out.push(only)
      continue
    }

    // มีหลายเอกสารใน group เดียวกัน → รวม
    const newestMetaDoc = docs.reduce((a: any, b: any) => (new Date(a.shipper_file_submission_date) > new Date(b.shipper_file_submission_date) ? a : b))

    // เก็บ meta ล่าสุดต่อ nomination_point เพื่อแนบ field สำคัญลง item (ใช้ต่อใน export/แสดงผล)
    const latestMetaByNomPoint = new Map<string, Doc>()
    for (const meta of docs) {
      const ts = Date.parse(meta.shipper_file_submission_date ?? '')
      for (const it of meta.data as any[]) {
        const np = it?.nomination_point
        if (!np) continue
        const prev = latestMetaByNomPoint.get(np)
        if (!prev) {
          latestMetaByNomPoint.set(np, meta)
          continue
        }
        const prevTs = Date.parse(prev.shipper_file_submission_date ?? '')
        if (Number.isFinite(ts) && (!Number.isFinite(prevTs) || ts > prevTs)) {
          latestMetaByNomPoint.set(np, meta)
        }
      }
    }

    // bucket ตามตัวตนของรายการ
    const bucket: any = new Map<string, Array<{meta: Doc; item: Item}>>()
    for (const meta of docs) {
      for (const raw of meta.data) {
        // normalize: กรอง null ออก โดยคง index value ให้ตรงกับวันที่ที่เหลือ
        const filteredDates: string[] = []
        const filteredValues: (number | null)[] = []
        ;(raw[dateField] ?? []).forEach((d: any, i: any) => {
          if (isNonNull(d)) {
            filteredDates.push(d)
            filteredValues.push(raw.value[i] ?? null)
          }
        })
        const latestMeta = latestMetaByNomPoint.get((raw as any).nomination_point) ?? meta
        const item: Item = {
          ...raw,
          [dateField]: filteredDates,
          value: filteredValues,
          planning_code_id: (latestMeta as any).planning_code_id,
          planning_code: (latestMeta as any).planning_code,
          start_date: (latestMeta as any).start_date,
          end_date: (latestMeta as any).end_date,
          shipper_file_submission_date: (latestMeta as any).shipper_file_submission_date
        } as Item

        const key = `${item.nomination_point}__area:${item.area.id}__ee:${item.entry_exit_id}`
        if (!bucket.has(key)) bucket.set(key, [])
        bucket.get(key)!.push({meta, item})
      }
    }

    const mergedData: Item[] = []

    for (const [, arr] of bucket) {
      // ยูเนียนวันทั้งหมด
      const allDatesSet = new Set<string>()
      for (const {item} of arr) for (const d of (item[dateField] as string[]) ?? []) allDatesSet.add(d)
      const allDates = Array.from(allDatesSet).sort(cmpDateDMY)

      // เลือก value ตามวัน โดยถ้าวันซ้ำ เลือกจาก doc ที่ submission ใหม่กว่า
      const dateToValue = new Map<string, number | null>()
      for (const d of allDates) {
        const candidates = arr.filter(({item}: any) => ((item[dateField] as string[]) ?? []).includes(d))
        candidates.sort((a: any, b: any) => new Date(b.meta.shipper_file_submission_date).getTime() - new Date(a.meta.shipper_file_submission_date).getTime())
        const chosen = candidates[0]
        const idx = ((chosen.item[dateField] as string[]) ?? []).indexOf(d)
        dateToValue.set(d, chosen.item.value[idx] ?? null)
      }

      const values = allDates.map((d) => dateToValue.get(d) ?? null)

      // ใช้โครงจากเอกสารที่ใหม่สุดในชุดนี้
      const newestForKey = arr.reduce((a: any, b: any) => (new Date(a.meta.shipper_file_submission_date) > new Date(b.meta.shipper_file_submission_date) ? a : b))

      mergedData.push({
        ...newestForKey.item,
        [dateField]: allDates,
        value: values
      } as Item)
    }

    out.push({
      ...newestMetaDoc,
      data: mergedData
    })
  }

  return out
}

// ---------------- Public wrapper: ใช้กับ "day" ----------------
export function mergeResMedByDay(res_med_: ResMedDay[], getValueMode: PlanningGetValueMode = 'latestValueByEachNominationPoint'): ResMedDay[] {
  // ใช้ generic ตัวเดียวกับ month แต่กำหนด dateField เป็น 'day'
  return mergeResMedByDateField(res_med_ as any, 'day', getValueMode) as ResMedDay[]
}

// srchStartDate = "Fri Apr 04 2025 00:00:00 GMT+0700 (Indochina Time)"
export const generateNext24Months = (srchStartDate?: any) => {
  const months = []
  const date = srchStartDate ? new Date(srchStartDate) : new Date()

  for (let i = 0; i < 24; i++) {
    const month = date.toLocaleString('en-US', {month: 'short'})
    const year = date.getFullYear()
    months.push(`${month} ${year}`)

    // Move to the next month
    date.setMonth(date.getMonth() + 1)
  }

  return months
}

export const generateDaysFromFutureMonth = (srchStartDate?: any, rangeMonth?: any) => {
  const today = srchStartDate ? new Date(srchStartDate) : new Date()
  today.setDate(1) // Set the date to the 1st of the current month
  const result: string[] = []

  const loop_month = rangeMonth ? rangeMonth : 4

  for (let i = 0; i < loop_month; i++) {
    const year = today.getFullYear()
    const month = today.getMonth() // 0-indexed (Jan = 0, Feb = 1, etc.)
    const daysInMonth = new Date(year, month + 1, 0).getDate() // Get total days in the month

    for (let day = 1; day <= daysInMonth; day++) {
      const dayFormatted = String(day).padStart(2, '0') // Format as "01", "02", etc.
      const monthName = today.toLocaleString('en-US', {month: 'short'}) // "Feb", "Mar", etc.
      result.push(`${dayFormatted} ${monthName} ${year}`)
    }

    // Move to the first day of the next month
    today.setMonth(today.getMonth() + 1)
  }

  return result
}

// ใช้กับ planning dashboard สำหรับ compare month
export const compareMonthYearTest = (entryMonth: string, searchStartDate: string): boolean => {
  const [entryDayPart, entryMonthPart, entryYear] = entryMonth.split('/')
  const [searchDay, searchMonth, searchYear] = searchStartDate.split('/')

  const entryDateValue = parseInt(entryYear) * 12 + parseInt(entryMonthPart) // MM/YYYY format as a number
  const searchDateValue = parseInt(searchYear) * 12 + parseInt(searchMonth) // MM/YYYY format as a number

  return entryDateValue >= searchDateValue // Return true if entryMonth is equal or greater than searchStartDate
}

// ใช้กับ planning dashboard สำหรับ compare day
export const compareDayMonthYear = (entryDay: string, searchStartDate: string): boolean => {
  // Ensure the format is DD/MM/YYYY and split it correctly
  const [entryDayPart, entryMonthPart, entryYear] = entryDay.split('/').map(Number)
  const [searchDayPart, searchMonthPart, searchYear] = searchStartDate.split('/').map(Number)

  // Construct a date string in YYYY-MM-DD format to avoid misinterpretation
  const entryDateStr = `${entryYear}-${String(entryMonthPart).padStart(2, '0')}-${String(entryDayPart).padStart(2, '0')}`
  const searchDateStr = `${searchYear}-${String(searchMonthPart).padStart(2, '0')}-${String(searchDayPart).padStart(2, '0')}`

  const entryDate = new Date(entryDateStr)
  const searchDate = new Date(searchDateStr)

  return entryDate >= searchDate // Correctly compare the two dates
}

// เอาไว้ใช้ gen labels ของ chart เป็นรายวัน
export const generateMonthLabels = (startDate: string, monthsToAdd: number = 4): string[] => {
  const labels: string[] = []
  const [dd, mm, yyyy] = startDate.split('/').map(Number)
  if (!dd || !mm || !yyyy) return labels

  // เริ่มที่วันแรกของเดือนของ startDate
  const cursor = new Date(yyyy, mm - 1, 1)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  for (let k = 0; k < monthsToAdd; k++) {
    const y = cursor.getFullYear()
    const m = cursor.getMonth() // 0-11
    const daysInMonth = new Date(y, m + 1, 0).getDate()

    for (let day = 1; day <= daysInMonth; day++) {
      const formattedDay = String(day).padStart(2, '0')
      labels.push(`${formattedDay} ${monthNames[m]} ${y}`)
    }

    // ขยับไปเดือนถัดไป
    cursor.setMonth(m + 1, 1)
  }

  return labels
}

// ใช้ใน config master path
// สำหรับเช็คว่าที่กดสร้างมามี entry และ exit จริง ๆ
export const checkEntryExitNodes = (data_post: any, area_master: any) => {
  // Extract node IDs from data_post
  const nodeIds = new Set(data_post.nodes.map((node: any) => node.id))

  // Filter area_master for matching nodes
  const matchingAreas = area_master.filter((area: any) => nodeIds.has(area.id))

  // Check if there is at least one entry_exit_id = 1 and at least one entry_exit_id = 2
  const hasEntry = matchingAreas.some((area: any) => area.entry_exit_id === 1)
  const hasExit = matchingAreas.some((area: any) => area.entry_exit_id === 2)

  return hasEntry && hasExit
}

// ใช้กับ config master path โหมด edit เอาไว้วาง node ที่เป็น entry ไว้ index แรก
export const prioritizeNodeWithEntryExit = (data_post: any, area_master: any) => {
  // Find the node that has the same id as area_master where entry_exit_id is 1
  const targetNode = data_post.nodes.find((node: any) => area_master.some((area: any) => area.id === node.id && area.entry_exit_id === 1))

  if (targetNode) {
    // Remove the found node from its current position
    data_post.nodes = data_post.nodes.filter((node: any) => node.id !== targetNode.id)
    // Insert it at the beginning
    data_post.nodes.unshift(targetNode)
  } else {
    return false // ถ้าไม่เจอ entry
  }

  return data_post
}

// ใช้กับ filter audit log สำหรับฟิลเดอร์หาวัน ๆ เดียว
export const isSameDateUTC = (utcDateStr: string, localDate: Date) => {
  const utcDate = new Date(utcDateStr) // Convert string to Date
  const localConverted = new Date(utcDate.toLocaleString('en-US', {timeZone: 'Asia/Bangkok'}))

  // Get only the date part (reset time to midnight for accurate comparison)
  const localDateStart = new Date(localDate)
  localDateStart.setHours(0, 0, 0, 0)

  const localConvertedStart = new Date(localConverted)
  localConvertedStart.setHours(0, 0, 0, 0)

  return localConvertedStart.getTime() === localDateStart.getTime()
}

export const formatISOToDDMMYYYY = (isoString: string) => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-GB', {
    timeZone: 'Asia/Bangkok' // Ensures GMT+7 timezone
  })
}

// ======================================================================
// >>>>>>>>>>>>>>>>>>>>>>>>>>>> BOOKING <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// ======================================================================

// ใช้กับ capacity contract mgn
// motherDynamicTable
// เอาไว้ update ชุดข้อมูลในตาราง กรณีมีการเพิ่ม period from-to
export const updateEntryValWithNewKeys = (entryVal: any, updatedHeaders: any) => {
  // 1. updatedHeaders x Update keys ------>', updatedHeaders
  // 2. entryVal ก่อนเพิ่มหรือลด key

  // Extract the last `dates2` array from the updated headers
  const lastDates2 = updatedHeaders[updatedHeaders.length - 1]?.dates2 || []
  const lastKey = lastDates2[lastDates2.length - 1]?.key

  // Find the max key in the current `entryVal`
  // const maxExistingKey = Math.max(...Object.keys(entryVal[0]).map(Number));
  const maxExistingKey: any = Array.isArray(entryVal) && entryVal.length > 0 ? Math.max(...Object.keys(entryVal[0]).map(Number)) : null // or a default value

  // if lastKey < maxExistingKey then trim down entryVal key = lastKey
  if (lastKey < maxExistingKey) {
    // เงื่อนไขนี้ลดวันน้อยกว่าเดิม
    entryVal = entryVal?.map((row: any) => {
      // Filter out keys greater than lastKey
      return Object.keys(row)
        .filter((key) => Number(key) <= lastKey)
        .reduce((trimmedRow: any, key) => {
          trimmedRow[key] = row[key]
          return trimmedRow
        }, {})
    })
  } else {
    // เงื่อนไขนี้เพิ่มวันมากกว่าเดิม
    // Prepare new keys to add
    // const newKeys = lastDates2
    //     .filter((item: any) => Number(item.key) > maxExistingKey)
    //     .map((item: any) => item.key);

    // original เดิม
    // // Add new keys to entryVal with value "0"
    // if (entryVal && entryVal[0]) {
    //     newKeys.forEach((key: any) => {
    //         // entryVal[0][key] = "0";

    //         // add 0 to new key na
    //         entryVal.forEach((item: any) => {
    //             item[key] = "0.000";
    //         });

    //     });
    // } else {
    // }

    // ใช้ได้ 1 แต่ value มันต่อข้างหลัง
    // entryVal.forEach((entry: any) => {
    //     updatedHeaders.forEach((header: any) => {
    //         header?.dates2 && header?.dates2?.forEach((dateObj: any) => {

    //             // compare dateObj.key to entry
    //             const key = dateObj.key;
    //             if (!(key in entry)) {
    //                 entry[key] = "0.000";
    //             }
    //         });
    //     });
    // });

    // ใช้ได้ 2 value ต่อท้ายแต่ละ group
    if (updatedHeaders[3]?.diff_date > 0) {
      let entryAfterDivide: any

      if (updatedHeaders[3]?.is_entry) {
        entryAfterDivide = transformEntry(entryVal, updatedHeaders, updatedHeaders[3].diff_date, updatedHeaders[3].is_entry)
      } else {
        entryAfterDivide = transformExit(entryVal, updatedHeaders, updatedHeaders[3].diff_date, updatedHeaders[3].is_entry)
      }
      return entryAfterDivide
    }
  }

  return entryVal
}

const transformEntry = (entryBefore: any, dataHeaderToMap: any, diffDate: any, isEntry: any) => {
  let divide_by = isEntry ? 4 : 2

  return entryBefore.map((original: any) => {
    let transformed: any = {}

    // Copy keys 0 to 6 (static keys)
    for (let key = 0; key <= 6; key++) {
      if (original[key] !== undefined) {
        transformed[key] = original[key]
      }
    }

    let keysToProcess = Object.keys(original)
      .map(Number)
      .filter((k) => k >= 7) // Get all keys starting from 7
      .sort((a, b) => a - b) // Sort numerically

    let totalKeys = keysToProcess.length

    let groupSize = Math.ceil(totalKeys / 4) // Adjust the divisor if needed
    let nextKey = 7 // Start from key 7

    // Process in groups of 4
    // for (let i = 0; i < keysToProcess.length; i += 4) {
    for (let i = 0; i < keysToProcess.length; i += groupSize) {
      // let group = keysToProcess.slice(i, i + 4); // Take 4 keys at a time
      let group = keysToProcess.slice(i, i + groupSize) // Take 4 keys at a time

      // Copy the 4 values to new positions
      group.forEach((oldKey) => {
        transformed[nextKey++] = original[oldKey]
      })

      // Add extra `0.000` values based on `diffDate`
      for (let j = 0; j < diffDate; j++) {
        transformed[nextKey++] = '0.000'
      }
    }

    return transformed
  })
}

const transformExit = (entryBefore: any, dataHeaderToMap: any, diffDate: any, isEntry: any) => {
  return entryBefore.map((original: any) => {
    let transformed: any = {}

    // Copy keys 0 to 6 (static keys)
    for (let key = 0; key <= 6; key++) {
      if (original[key] !== undefined) {
        transformed[key] = original[key]
      }
    }

    let keysToProcess = Object.keys(original)
      .map(Number)
      .filter((k) => k >= 7) // Get all keys starting from 7
      .sort((a, b) => a - b) // Sort numerically

    let totalKeys = keysToProcess.length
    let groupSize = Math.ceil(totalKeys / 2) // Adjust the divisor if needed

    let nextKey = 7 // Start from key 7

    // Process in groups of 2
    for (let i = 0; i < keysToProcess.length; i += groupSize) {
      let group = keysToProcess.slice(i, i + groupSize)

      // Copy the 2 values to new positions
      group.forEach((oldKey) => {
        transformed[nextKey++] = original[oldKey]
      })

      // Add extra `0.000` values based on `diffDate`
      for (let j = 0; j < diffDate; j++) {
        transformed[nextKey++] = '0.000'
      }
    }

    return transformed
  })
}

interface HeaderEntry {
  key?: string // Optional key property
  Max?: {
    key: string // Key for Max
  }
  Min?: {
    key: string // Key for Min
  }
  [date: string]: {key: string} | string | undefined // For date-based values
}

interface ValueEntry {
  key: string
}

export const generateHeaders = (data: {[key: string]: HeaderEntry}, prefix = '') => {
  const headers: any[] = []
  for (const [label, value] of Object.entries(data)) {
    // Check if the current value is an object
    if (typeof value === 'object' && value !== null) {
      const subHeaders = []
      // Handle Max and Min keys if they exist
      if ('Min' in value) {
        const minValue = value.Min as {key: string}
        subHeaders.push({label: 'Min', key: `${prefix}${label}.Min`, value: minValue.key})
      }

      if ('Max' in value) {
        const maxValue = value.Max as {key: string}
        subHeaders.push({label: 'Max', key: `${prefix}${label}.Max`, value: maxValue.key})
      }

      // Handle date-based sub-columns
      const dates = Object.keys(value).filter((key) => key !== 'key' && key !== 'Max' && key !== 'Min')

      const dateKeyValuePairs = Object.entries(value)
        .filter(([key]) => key !== 'key' && key !== 'Max' && key !== 'Min') // Filter out unwanted keys
        .map(([key, entry]) => {
          // Check if the entry is of type ValueEntry
          const valueKey = (entry as ValueEntry).key
          return {date: key, value: valueKey}
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date

      if (dates.length > 0) {
        let dates2 = []
        for (let index = 0; index < dateKeyValuePairs.length; index++) {
          dates2.push({label: dateKeyValuePairs[index]?.date, key: dateKeyValuePairs[index]?.value, value: dateKeyValuePairs[index]?.date})
        }
        headers.push({
          label,
          key: value.key || `${prefix}${label}`,
          subHeaders,
          dates,
          dates2
        })
      } else {
        headers.push({label, key: value.key || `${prefix}${label}`, subHeaders})
      }
    } else {
      // If it's a simple value, just add it
      headers.push({label, key: `${prefix}${label}`})
    }
  }

  return headers.sort((a, b) => parseInt(a.key) - parseInt(b.key))
  // return headers;
}

export const calculateSumAfterLastDate = (data: any[]) => {
  return data?.reduce((acc: any, entry: any) => {
    const region = entry['0']
    let lastDateKey: any = null

    // Regular expression for detecting dates in "MM/DD/YYYY" or "DD/MM/YYYY" format
    const dateRegex = /^(0[1-9]|1[0-9]|2[0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/

    // Find the last date key (valid date format using regex)
    Object.keys(entry).forEach((key) => {
      const value = entry[key]
      if (dateRegex.test(value)) {
        lastDateKey = key
      }
    })

    // Ensure the region is initialized in the accumulator
    if (!acc[region]) {
      acc[region] = {region}
    }

    // Sum numeric values after the last date key
    let summing = false
    Object.keys(entry).forEach((key) => {
      const value = entry[key]

      // Start summing after the last date key
      if (lastDateKey && key === lastDateKey) {
        summing = true
        return // Skip the last date key itself
      }

      if (summing) {
        if (!isNaN(value)) {
          acc[region][key] = (acc[region][key] || 0) + Number(value)
        } else {
          // Skipping non-numeric value at ${key}: ${value}
        }
      }
    })

    return acc
  }, {})
}

// เอาไว้ sum ค่าของ sum แต่ละ zone
// ใช้กับ motherDynamicTable
export const sumValuesByKey = (data: any[]) => {
  const result: {[key: string]: number} = {}

  data?.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'region') {
        if (result[key]) {
          result[key] += item[key]
        } else {
          result[key] = item[key]
        }
      }
    })
  })

  return result
}

// Utility ทำให้สีเข้มกว่าเดิม
export const darkenColor = (color: string, percent: number) => {
  let r, g, b

  if (color?.startsWith('#')) {
    // Convert hex to RGB
    r = parseInt(color.substring(1, 3), 16)
    g = parseInt(color.substring(3, 5), 16)
    b = parseInt(color.substring(5, 7), 16)
  } else if (color?.startsWith('rgb')) {
    // Extract RGB values
    const rgb = color?.match(/\d+/g)?.map(Number) || [0, 0, 0]
    ;[r, g, b] = rgb
  } else {
    return color // Return original color if not recognized
  }

  // Darken the color
  r = Math.max(0, Math.floor(r * (1 - percent / 100)))
  g = Math.max(0, Math.floor(g * (1 - percent / 100)))
  b = Math.max(0, Math.floor(b * (1 - percent / 100)))

  return `rgb(${r}, ${g}, ${b})`
}

export const sumByZone = (outputEntries: any[], contractPointData: any) => {
  let groupedData: any = {}

  outputEntries.forEach((entry) => {
    // Find the contract point mapping to get zoneId
    const contractPoint = contractPointData?.data?.find((item: any) => entry['0'] && typeof entry['0'] === 'string' && item.contract_point === entry['0'].trim())

    // if (!contractPoint || !contractPoint.zone) return; // Skip if no zone found // ปิดไปเพราะถ้าไม่มีค่าแล้ว return null จะทำให้ row total แหว่ง

    // const zone = contractPoint.zone;
    const zone = contractPoint !== null && contractPoint !== undefined ? contractPoint.zone : undefined
    const zoneId = zone !== null && zone !== undefined ? zone.id : ''
    const zoneName = zone !== null && zone !== undefined ? zone.name : 'no data'

    if (!groupedData[zoneId]) {
      groupedData[zoneId] = {region: zoneName, zone} // Initialize zone group
    }

    Object.keys(entry).forEach((key: any) => {
      if (key >= 7) {
        // let num = parseFloat(entry[key].replace(/,/g, '').trim()) || 0;
        let num = entry[key] ? parseFloat(entry[key].toString().replace(/,/g, '').trim()) || 0 : 0

        groupedData[zoneId][key] = (groupedData[zoneId][key] || 0) + num
      } else {
        if (!(key in groupedData[zoneId])) {
          groupedData[zoneId][key] = entry[key].trim() // Keep first entry's metadata
        }
      }
    })
  })

  return Object.values(groupedData)
}

// เอาไว้ใช้ format label ใน chart planning
export const formatMonthX = (dates: any) => {
  // 1.Filter Month เลือกเดือน Feb
  // สิ่งที่เกิดขึ้น > ระบบไม่เปลี่ยนแปลงเดือนตามที่เลือก ยังขึ้นเป็นเดือน May
  // สิ่งที่ต้องการ > ต้องเปลี่ยนเป็นเดือน Feb และบวกไปจนถึง 24 เดือน (นับเดือนเริ่มด้วยนะครับ)
  if (dates?.length > 0) {
    const base = toDayjs(dates?.[0], 'DD/MM/YYYY').subtract(1, 'month')

    let formatter: any = Array.from(
      {length: 24},
      (_: any, i: any) => toDayjs(dates[0], 'DD/MM/YYYY').add(i, 'month').format('MMM YYYY')
      // base.add(i, 'month').format('MMM YYYY')
    )

    return formatter
  } else {
    let formatter: any = Array.from({length: 24}, (_: any, i: any) => toDayjs().add(i, 'month').format('MMM YYYY'))

    return formatter
  }
}

export const formatMonthY = (data: any[]) => {
  const getEarliestMonth = (data: any[]) => {
    let min: any = null
    data?.forEach((item: any) => {
      item?.data?.forEach((d: any) => {
        d?.month?.forEach((m: string) => {
          const date = dayjs(m, 'DD/MM/YYYY')
          if (!min || date.isBefore(min)) {
            min = date
          }
        })
      })
    })
    return min ? min.format('DD/MM/YYYY') : null
  }
  const min = getEarliestMonth(data)

  if (!min) return []

  const start = dayjs(min, 'DD/MM/YYYY')

  return Array.from({length: 24}, (_, i) => start.add(i, 'month').format('MMM YYYY'))
}

export const getMinMaxMonth = (data: any[]) => {
  let min: any = null
  let max: any = null

  data?.forEach((item: any) => {
    item?.data?.forEach((d: any) => {
      d?.day?.forEach((m: string) => {
        const date = dayjs(m, ['D/M/YYYY', 'DD/MM/YYYY'], true)

        if (!date.isValid()) return

        if (!min || date.isBefore(min)) {
          min = date
        }

        if (!max || date.isAfter(max)) {
          max = date
        }
      })
    })
  })

  return {
    min: min ? min.format('D/M/YYYY') : null,
    max: max ? max.format('D/M/YYYY') : null
  }
}

// DAM > Metered Point Add,Edit : Field Point ให้กรองมาแค่เฉพาะ Point ที่ active อยู่ ณ ตอนนี้
export const filterNomPointNonTpaPoint = (data: any) => {
  const today = dayjs().startOf('day')

  const filtered_meter_point_type = data.map((group: any) => {
    const filteredData = group.data.filter((item: any) => {
      const start = toDayjs(item.start_date).startOf('day')
      const end = item.end_date ? toDayjs(item.end_date).startOf('day') : null

      if (end) {
        return today.isSameOrAfter(start) && today.isSameOrBefore(end)
      } else {
        return today.isSameOrAfter(start)
      }
    })

    return {
      ...group,
      data: filteredData
    }
  })

  return filtered_meter_point_type
}

// ใช้ filter หาพวก master data ที่อยู่ในช่วงเวลา ยังไม่หมดอายุ
export const filterStartEndDateInRange = (data?: any) => {
  const today = new Date().toISOString().split('T')[0]

  let filtered = data.filter((item: any) => {
    const startDate = item.start_date?.split('T')[0] // Extract "YYYY-MM-DD"
    const endDate = item.end_date ? item.end_date.split('T')[0] : null // Extract if exists

    if (!startDate) return false // If start_date is missing, exclude

    // If end_date is null, check only start_date
    if (!endDate) {
      return today >= startDate
    }

    // Normal case: start_date ≤ today ≤ end_date
    return today >= startDate && today <= endDate
  })

  return filtered
}

// เอาไว้ contrast สี bg กับ text
// export const getContrastTextColor = (hex: string) => {
//     if (!hex) return "#000"; // Default to black if color is missing

//     // Convert hex to RGB
//     const r = parseInt(hex.slice(1, 3), 16);
//     const g = parseInt(hex.slice(3, 5), 16);
//     const b = parseInt(hex.slice(5, 7), 16);

//     // Calculate relative luminance (WCAG formula)
//     const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

//     // Return black for light backgrounds, white for dark backgrounds
//     // return luminance > 0.5 ? "#000000" : "#FFFFFF";
//     return luminance > 0.5 ? "#464255" : "#FFFFFF";
// };

// ปรับใหม่เป็น คำนวณตาม WCAG contrast ratio แล้วเลือกระหว่างสีเข้มกับสีขาวว่าอันไหน contrast สูงกว่า
export const getContrastTextColor = (backgroundColor?: string) => {
  if (!backgroundColor) return '#1F2937'

  let hex = backgroundColor.replace('#', '')

  // รองรับ #FFF
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('')
  }

  if (hex.length !== 6) return '#1F2937'

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const getLuminance = (value: number) => {
    const sRGB = value / 255

    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  }

  const luminance = 0.2126 * getLuminance(r) + 0.7152 * getLuminance(g) + 0.0722 * getLuminance(b)

  const whiteContrast = 1.05 / (luminance + 0.05)
  const darkContrast = (luminance + 0.05) / 0.05

  return whiteContrast > darkContrast ? '#FFFFFF' : '#1F2937'
}

export const sortByMonthYear = (arr?: any) => {
  const monthOrder: any = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12
  }

  return arr.sort((a: any, b: any) => {
    const [monthA, yearA] = a.key.split(' ')
    const [monthB, yearB] = b.key.split(' ')

    const numYearA: any = parseInt(yearA, 10)
    const numYearB: any = parseInt(yearB, 10)

    if (numYearA !== numYearB) {
      return numYearA - numYearB // Sort by year first
    }
    return monthOrder[monthA] - monthOrder[monthB] // Then sort by month
  })
}

// filter shipper ที่หมดอายุออก หรือไม่ active
export const filterShipperGroupData = (shipperGroupData: any[]) => {
  const today = new Date()

  return shipperGroupData.filter((item) => {
    const startDate = new Date(item.start_date)
    const endDate = item.end_date ? new Date(item.end_date) : null

    return (
      startDate <= today && // Start date must be before or equal to today
      (!endDate || endDate > today) && // End date must be in the future (or null)
      item.status === true && // Status must be true
      item.active === true // Active must be true
    )
  })
}

// filter ข้อมูลทั่่วไป ที่มีฟิลด์ start_date, end_date ที่หมดอายุออก
export const filterDataStartEnd = (shipperGroupData: any[]) => {
  const today = new Date()

  return shipperGroupData.filter((item) => {
    const startDate = new Date(item.start_date)
    const endDate = item.end_date ? new Date(item.end_date) : null

    return (
      startDate <= today && // Start date must be before or equal to today
      (!endDate || endDate > today) // End date must be in the future (or null)
    )
  })
}

// หาวันอาทิตย์ สัปดาห์หน้า
export const getNextWeekSundayYyyyMmDd = (): string => {
  return toDayjs().day(7).format('YYYY-MM-DD')
}

// // หาวันอาทิตย์ สัปดาห์ปัจจุบัน
// export const getCurrentWeekSundayYyyyMmDd = (): string => {
//     return toDayjs().day(0).isAfter(toDayjs()) ? toDayjs().subtract(1, 'week').day(0).format("YYYY-MM-DD") : toDayjs().day(0).format("YYYY-MM-DD");
// };

// หาวันอาทิตย์ สัปดาห์ปัจจุบัน
export const getCurrentWeekSundayYyyyMmDd = (): string => {
  const defaultDate = dayjs().format('YYYY-MM-DD')
  let baseDate = dayjs(defaultDate) // ใช้วันนี้เป็นตัวตัดสิน
  const dayOfWeek = baseDate.day() // 0 = อาทิตย์, 5 = ศุกร์, 6 = เสาร์

  // ถ้าเป็น ศุกร์ (5) หรือ เสาร์ (6) → เอาอาทิตย์สัปดาห์หน้า
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    return baseDate.add(1, 'week').day(0).format('YYYY-MM-DD') // ไปอาทิตย์สัปดาห์หน้า
  } else {
    return toDayjs().day(0).isAfter(toDayjs()) ? toDayjs().subtract(1, 'week').day(0).format('YYYY-MM-DD') : toDayjs().day(0).format('YYYY-MM-DD')
  }
}

// หาวันที่ให้สัปดาห์ เริ่มจากวันอาทิตย์ return เป็น array
export const getCurrentWeekDatesYyyyMmDd = (): string[] => {
  return Array.from({length: 7}, (_, i) => toDayjs().startOf('week').add(i, 'day').format('DD/MM/YYYY'))
}

export const getCurrentWeekDatesYyyyMmDdFromDate = (gas_day_text?: any): string[] => {
  return Array.from({length: 7}, (_, i) => toDayjs(gas_day_text, 'DD/MM/YYYY').startOf('week').add(i, 'day').format('DD/MM/YYYY'))
}
// แก้ getCurrentWeekDatesYyyyMmDdFromDate ให้รับ parameter gas_day_text == "11/05/2025"
// แล้ว gen วันที่ต่อจากนี้ 7 วัน

// หาวันที่ให้สัปดาห์ วันเริ่มรับจาก param startDate เริ่มจากวันอาทิตย์ return เป็น array
export const getWeekDatesFromStartDate = (startDate: Date): string[] => {
  const base = toDayjs(startDate)

  // หา 'วันอาทิตย์' ของสัปดาห์นั้น
  const sunday = base.startOf('week') // dayjs .startOf('week') ใช้ locale "Sunday" เป็น default

  return Array.from({length: 7}, (_, i) => sunday.add(i, 'day').format('DD/MM/YYYY'))
}

export const getNextWeekSundayIsoString = (): any => {
  return dayjs().day(7).toISOString()
}

// Filter data เอาแค่วันปัจจุบันและย้อนหลัง 7 วัน
export const filterLast7Days = (data: any[], dateField: string) => {
  const today = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(today.getDate() - 7)

  // Convert "DD/MM/YYYY" to a Date object
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split('/').map(Number)
    return new Date(year, month - 1, day)
  }

  return data.filter((entry) => {
    if (!entry[dateField]) return false // Skip if field is missing
    const entryDate = parseDate(entry[dateField])
    return entryDate >= sevenDaysAgo && entryDate <= today
  })
}

// ของ audit log บีมเขียนไว้
export const matchTypeWithMenu = (type: any) => {
  if (type) {
    switch (type) {
      case 'group-2':
        return 'Group TSO'
      case 'group-3':
        return 'Group Shippers'
      case 'group-4':
        return 'Group Other'
      case 'booking-template':
        return 'Capacity Right Template'
      case 'setup-background':
        return 'Main Menu Background'
      case 'account':
        return 'Users'
      case 'term-and-condition':
        return 'Terms & Conditions'
      case 'systemLogin':
        return 'Login Management Tool'
      case 'limit-concept-point':
        return 'concept point'
      default:
        return type.replaceAll('-', ' ')
    }
  }
  return ''
}

export const renameMethod = (method: any, type: any) => {
  if (method) {
    switch (method) {
      case 'changeFromAccount':
        return 'edit'
      case 'duplicate-new':
        return 'duplicate'
      case 'reason-account':
        return 'edit reason'
      case 'status':
        return 'update status'
      case 'reset':
        switch (type) {
          case 'system-login':
          case 'account':
            return 'reset password'
          default:
            return method
        }
      case 'signature':
        return 'update signature'
      case 'change':
        switch (type) {
          case 'account':
            return 'edited from login management tool'
          default:
            return method
        }
      default:
        return method
    }
  }
  return ''
}

// เอาไว้หาว่่าวันที่เสิชอยู่ในวีคเดียวกับวันที่จะหาหรือเปล่า
export const isSameWeekByK = (gasDay: string, searchDate: string) => {
  const searchStartOfWeek = toDayjs(searchDate).startOf('week') // Start of week (Sunday)
  const searchEndOfWeek = searchStartOfWeek.endOf('week') // End of week (Saturday)

  return toDayjs(gasDay).isBetween(searchStartOfWeek, searchEndOfWeek, null, '[]')
}

export const formatPaths = (paths: any) => {
  return paths.map((path: any) => path.map((item: any) => item.area.name).join(' -> ')).join(' | ') // If there are multiple paths, separate them with "|"
}

// priority status allocation
const priorityMap: any = {
  2: 1, // Highest priority
  3: 2,
  4: 3,
  5: 4,
  1: 5 // Lowest priority
}

// const generateRandomId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

// ของ Allocation Management แบบรวม Total
// intraday_system, metering_value, nomination_value, previous_allocation_tpa_for_review, shipper_allocation_review, system_allocation ของข้อมูลชั้นนอก ต้องเป็นการ sum จากข้อมูลใน data
export const groupDataAlloManage = (data: any[]) => {
  const grouped: any = data.reduce(
    (acc, item) => {
      const key = `${item.gas_day}-${item.point}`

      if (!acc[key]) {
        acc[key] = {
          // id: generateRandomId(),
          id: item?.point + '_' + item.gas_day,
          gas_day: item.gas_day,
          point_text: item?.point,
          entry_exit: item?.entry_exit_obj?.name,

          nomination_value: 0,
          system_allocation: 0,
          intraday_system: 0,
          previous_allocation_tpa_for_review: 0,
          shipper_allocation_review: 0,
          metering_value: 0,

          data: [],
          priorityStatus: item?.allocation_status?.id ?? 999
        }
      }

      acc[key].data.push(item)

      // Sum
      // acc[key].nomination_value += Number(item?.nominationValue ?? 0);
      acc[key].nomination_value = (acc[key].nomination_value ?? 0) + toNum(item?.nominationValue)
      acc[key].system_allocation += Number(item?.systemAllocation ?? 0)

      if (item?.intradaySystem !== null) {
        acc[key].intraday_system += Number(item?.intradaySystem ?? 0)
      }

      acc[key].previous_allocation_tpa_for_review += Number(item?.previousAllocationTPAforReview ?? 0)
      // acc[key].metering_value += Number(item?.meteringValue ?? 0);
      acc[key].metering_value = Number(item?.meteringValue ?? 0)

      const shipperReview = item?.allocation_management_shipper_review?.[0]?.shipper_allocation_review ?? item?.shipperAllocationReview ?? 0
      acc[key].shipper_allocation_review += Number(shipperReview)

      // Update priority status if item has higher priority
      const currentPriority = priorityMap[acc[key].priorityStatus] ?? 999
      const itemPriority = priorityMap[item.allocation_status?.id] ?? 999

      if (itemPriority < currentPriority) {
        acc[key].priorityStatus = item.allocation_status?.id
      }

      return acc
    },
    {} as Record<string, any>
  )

  return Object.values(grouped).map(({priorityStatus, ...rest}: any) => rest)
}

// แปลงพวก value ที่ควรจะเป็น number แต่ดันเป็น string แล้วมี space เช่น  " 24,000.000 "
const toNum = (v: any): number => {
  if (v === null || v === undefined || v === '') return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0

  // รองรับรูปแบบ " 24,000.000 "
  const s = String(v).replace(/\s+/g, '').replace(/,/g, '')
  // (ถ้าต้องการรองรับ "(1,234.56)" แบบบัญชี ให้เพิ่ม:
  // const neg = /^\(.*\)$/.test(s); const core = s.replace(/[()]/g,''); const n = Number(core); return Number.isFinite(n) ? (neg ? -n : n) : 0;
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

// เอาไว้ handle null สำหรับ limit, offset api
export const getDateRangeForApi = (start: any, end: any) => {
  // if srchStartDate or srchEndDate is null then make it today
  // if srchStartDate is null and srchEndDate have value make srchStartDate 1 month before srchEndDate
  // if srchEndDate is null and srchStartDate have value make srchEndDate 1 month after srchStartDate
  // if both have value then do nothing

  const today = dayjs().tz('Asia/Bangkok')

  let startDate = start ? toDayjs(start) : null
  let endDate = end ? toDayjs(end) : null

  if (!startDate && !endDate) {
    startDate = today
    endDate = today
  } else if (!startDate && endDate) {
    startDate = toDayjs(endDate).subtract(1, 'month')
  } else if (startDate && !endDate) {
    endDate = toDayjs(startDate).add(1, 'month')
  }

  const format_start_date = toDayjs(startDate).format('YYYY-MM-DD')
  const format_end_date = toDayjs(endDate).format('YYYY-MM-DD')

  return {
    start_date: format_start_date,
    end_date: format_end_date
  }
}

// ใช้กับ shipper nom report -> tab weekly -> tab ย่อย all
export const flattenWeeklyDay = (data: any[]) => {
  return data?.map((item) => {
    const flattened: any = {...item} // ข้อมูลเดิม

    const weeklyDay = item.weeklyDay
    if (weeklyDay) {
      Object.entries(weeklyDay).forEach(([day, values]: any) => {
        Object.entries(values).forEach(([key, val]) => {
          flattened[`${day}_${key}`] = val
        })
      })
    }

    return flattened
  })
}

// filter gas_day แบบ range
export const filterByDateRange = (data: any, startDate?: string | Date, endDate?: string | Date) => {
  if (!data) return []

  const start = startDate ? toDayjs(startDate).format('YYYY-MM-DD') : null
  const end = endDate ? toDayjs(endDate).format('YYYY-MM-DD') : null

  // return data.filter((item: any) => {
  //     const itemDate = dayjs(item.gas_day).tz("Asia/Bangkok").format("YYYY-MM-DD");
  //     if (!start || !end) return true; // ถ้าไม่ได้เลือกช่วงวัน ก็คืนทั้งหมด
  //     return itemDate >= start && itemDate <= end;
  // });

  return data.filter((item: any) => {
    if (!item.gas_day) return false

    const gasDay = toDayjs(item.gas_day)
    const itemDate = gasDay.isValid() ? gasDay.format('YYYY-MM-DD') : null

    if (!itemDate) return false

    if (!start || !end) return true // ถ้าไม่ได้เลือกช่วงวัน ก็คืนทั้งหมด

    return itemDate >= start && itemDate <= end
  })
}

export const filterByDateRangeKeyUpdateDate = (data: any, startDate?: string | Date, endDate?: string | Date) => {
  if (!data) return []

  const start = startDate ? toDayjs(startDate).format('YYYY-MM-DD') : null
  const end = endDate ? toDayjs(endDate).format('YYYY-MM-DD') : null

  return data.filter((item: any) => {
    if (!item.update_date) return false

    const itemDate = toDayjs(item.update_date).isValid() ? toDayjs(item.update_date).format('YYYY-MM-DD') : null

    if (!itemDate) return false

    if (!start || !end) return true // ถ้าไม่ได้เลือกช่วงวัน ก็คืนทั้งหมด

    return itemDate >= start && itemDate <= end
  })
}

// alloc report
export const deduplicate = (arr: any[]) => {
  const seen = new Set()
  return arr
    .filter((item) => {
      // const key = `${item.execute_timestamp}-${item.gas_day}`;
      const key = `${item.execute_timestamp}-${item.gas_day}-${item.gas_hour}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((item) => ({
      execute_timestamp: item.execute_timestamp,
      gas_day: item.gas_day,
      gas_hour: item.gas_hour
    }))
}

// -----------

export const sumDataNomShipperReportOLD = (data_for_sum: any[]) => {
  if (!Array.isArray(data_for_sum) || data_for_sum.length === 0) {
    return []
  }

  const keysToMatch = ['1', '2', '3', '6', '9']

  // รวมเฉพาะ key 14 - 37 ก่อน ยังไม่รวม key 38
  const keysToSum = Array.from({length: 37 - 14 + 1}, (_, index) => String(index + 14))

  const wiKey = '11'
  const hvKey = '12'
  const sgKey = '13'
  const totalKey = '38'

  const norm = (value: any) => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value))

  const hasNumericValue = (value: any): boolean => {
    if (value === null || value === undefined) {
      return false
    }

    if (typeof value === 'string') {
      const text = value.replace(/,/g, '').trim()

      if (text === '' || text === '-') {
        return false
      }

      return Number.isFinite(Number(text))
    }

    return typeof value === 'number' && Number.isFinite(value)
  }

  const toNumber = (value: any): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }

    if (typeof value !== 'string') {
      return 0
    }

    const text = value.replace(/,/g, '').trim()

    if (text === '' || text === '-') {
      return 0
    }

    const numberValue = Number(text)

    return Number.isFinite(numberValue) ? numberValue : 0
  }

  const fmt3 = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })

  /**
   * รวม key 14 - 37
   */
  const sumKey14To37 = (dataTemp: any): number => {
    return keysToSum.reduce((total, key) => {
      return total + toNumber(dataTemp?.[key])
    }, 0)
  }

  const grouped = new Map<string, any>()

  const hvSgGrouped = new Map()

  const numDay_ = (gasDay: any) => {
    const dayMap: Record<number, number> = {
      0: 14, // Sunday
      1: 15, // Monday
      2: 16, // Tuesday
      3: 17, // Wednesday
      4: 18, // Thursday
      5: 19, // Friday
      6: 20 // Saturday
    }

    return dayMap[dayjs(gasDay, 'DD/MM/YYYY').day()]
  }

  /*
   * ขั้นตอนที่ 1
   * จัดกลุ่มและรวม key 14 - 37 ให้เสร็จก่อน
   */
  for (const item of data_for_sum) {
    const dt = item?.data_temp ?? {}
    const dayKey = String(numDay_(item?.gas_day))

    /*
     * Daily ใช้ผลรวม key 14 - 37 ของ row ปัจจุบัน
     * Weekly ใช้ค่าตามวัน เช่น Sunday = key 14
     */
    const viValue = roundTo3(item?.nom?.nomination_type_id === 1 ? sumKey14To37(dt) : toNumber(dt?.[dayKey]))

    const hasHv = hasNumericValue(dt?.[hvKey])
    const hasSg = hasNumericValue(dt?.[sgKey])

    const hvValue = hasHv ? roundTo3(toNumber(dt?.[hvKey])) : null

    const sgValue = hasSg ? roundTo4(toNumber(dt?.[sgKey])) : null

    const hvMultilyByVolumn = hvValue === null ? 0 : hvValue * viValue

    const sgMultilyByVolumn = sgValue === null ? 0 : sgValue * viValue

    // const test_ = "S_GSP3"
    // if(item?.data_temp?.[3] === test_){
    //     // 0.982596
    //     console.log(`- - start :  ${test_} - -`);
    //     console.log('item : ', item);
    //     console.log('item?.data_temp?.[3] : ', item?.data_temp?.[3]);
    //     console.log('dt : ', dt);
    //     console.log('viValue : ', viValue);
    //     console.log('hvValue : ', hvValue);
    //     console.log('sgValue : ', sgValue);
    //     console.log(`- - end : ${test_} - -`);
    // }

    const groupKey = JSON.stringify(keysToMatch.map((key) => norm(dt?.[key])))

    if (!grouped.has(groupKey)) {
      const newItem = JSON.parse(JSON.stringify(item))

      grouped.set(groupKey, newItem)

      hvSgGrouped.set(groupKey, {
        sumHvMultilyByVolumn: hvMultilyByVolumn,
        sumSgMultilyByVolumn: sgMultilyByVolumn,

        // เก็บเฉพาะ volume ของแถวที่มีค่า HV/SG
        hvVolume: hasHv ? viValue : 0,
        sgVolume: hasSg ? viValue : 0,

        hasHv,
        hasSg
      })

      continue
    }

    const existing = grouped.get(groupKey)
    const existingHvSg: any = hvSgGrouped.get(groupKey)

    existingHvSg.sumHvMultilyByVolumn += hvMultilyByVolumn

    existingHvSg.sumSgMultilyByVolumn += sgMultilyByVolumn

    if (hasHv) {
      existingHvSg.hvVolume += viValue
      existingHvSg.hasHv = true
    }

    if (hasSg) {
      existingHvSg.sgVolume += viValue
      existingHvSg.hasSg = true
    }

    // รวมเฉพาะ key 14 - 37
    for (const key of keysToSum) {
      const existingValue = toNumber(existing?.data_temp?.[key])

      const currentValue = toNumber(dt?.[key])

      existing.data_temp[key] = fmt3(existingValue + currentValue)
    }

    grouped.set(groupKey, existing)
  }

  /*
   * ขั้นตอนที่ 2
   * เมื่อรวมทุก row เสร็จแล้ว
   * ค่อยคำนวณ key 38 จาก key 14 - 37
   */
  console.log('# data_for_sum : ', data_for_sum)
  console.log('# grouped : ', grouped)
  console.log(
    '#[S_GSP3] data_for_sum : ',
    data_for_sum?.filter((f: any) => f?.data_temp?.[3] === 'S_GSP3')
  )
  console.log(
    '#[S_GSP3][MMSCFD] data_for_sum : ',
    data_for_sum?.filter((f: any) => f?.data_temp?.[3] === 'S_GSP3' && f?.data_temp?.[9] === 'MMSCFD')
  )
  //   "MMSCFD"
  console.log('hvSgGrouped : ', hvSgGrouped)

  grouped.forEach((existing, groupKey) => {
    const totalValue = sumKey14To37(existing?.data_temp)

    existing.data_temp[totalKey] = fmt3(totalValue)

    grouped.set(groupKey, existing)
  })

  hvSgGrouped.forEach((value, groupKey) => {
    const existing = grouped.get(groupKey)

    if (!existing) return

    const dayKey = String(numDay_(existing?.gas_day))

    const viAll = existing?.nom?.nomination_type_id === 1 ? toNumber(existing?.data_temp?.[totalKey]) : toNumber(existing?.data_temp?.[dayKey])

    /*
     * HV
     * ถ้าไม่มีแถวไหนมีค่า HV ให้เป็น null
     */
    existing.data_temp[hvKey] = value.hasHv && value.hvVolume !== 0 ? value.sumHvMultilyByVolumn / value.hvVolume : null

    /*
     * SG
     * ถ้าไม่มีแถวไหนมีค่า SG ให้เป็น null
     */
    existing.data_temp[sgKey] = value.hasSg && value.sgVolume !== 0 ? value.sumSgMultilyByVolumn / value.sgVolume : null

    /*
     * WI ต้องมีทั้ง HV และ SG
     */
    if (!value.hasHv || !value.hasSg || viAll === 0 || value.sumSgMultilyByVolumn === 0) {
      existing.data_temp[wiKey] = null
    } else {
      //   existing.data_temp[wiKey] = value.sumHvMultilyByVolumn / 0.982596 / Math.sqrt(value.sumSgMultilyByVolumn * viAll)
      existing.data_temp[wiKey] = roundTo3(value.sumHvMultilyByVolumn / 0.982596 / Math.sqrt(value.sumSgMultilyByVolumn * viAll))
      const test_ = 'S_GSP3....'
      if (existing?.data_temp?.[3] === test_) {
        // 40.402
        // 23.239
        // 144.529
        // 0.982596
        console.log(`- - start :  ${test_} - -`)
        console.log('existing : ', existing)
        console.log('value.sumHvMultilyByVolumn : ', value.sumHvMultilyByVolumn)
        console.log('viAll : ', viAll)
        console.log('Math.sqrt(value.sumSgMultilyByVolumn * viAll) : ', Math.sqrt(value.sumSgMultilyByVolumn * viAll))
        console.log('HV : ', value.sumHvMultilyByVolumn / 0.982596 / Math.sqrt(value.sumSgMultilyByVolumn * viAll))

        console.log('1 : ', value.sumHvMultilyByVolumn / 0.982596)
        console.log('2 : ', Math.sqrt(value.sumSgMultilyByVolumn * viAll))

        // console.log('dt : ', dt);
        // console.log('viValue : ', viValue);
        // console.log('hvValue : ', hvValue);
        // console.log('sgValue : ', sgValue);
        console.log(`- - end : ${test_} - -`)
      }
    }

    grouped.set(groupKey, existing)
  })

  return Array.from(grouped.values())
}

export const sumDataNomShipperReport = (data_for_sum: any[]) => {
  if (!Array.isArray(data_for_sum) || data_for_sum.length === 0) {
    return []
  }

  const keysToMatch = ['1', '2', '3', '6', '9']

  // รวมเฉพาะ key 14 - 37 ก่อน ยังไม่รวม key 38
  const keysToSum = Array.from({length: 37 - 14 + 1}, (_, index) => String(index + 14))

  const wiKey = '11'
  const hvKey = '12'
  const sgKey = '13'
  const totalKey = '38'

  const norm = (value: any) => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value))

  const hasNumericValue = (value: any): boolean => {
    if (value === null || value === undefined) {
      return false
    }

    if (typeof value === 'string') {
      const text = value.replace(/,/g, '').trim()

      if (text === '' || text === '-') {
        return false
      }

      return Number.isFinite(Number(text))
    }

    return typeof value === 'number' && Number.isFinite(value)
  }

  const toNumber = (value: any): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }

    if (typeof value !== 'string') {
      return 0
    }

    const text = value.replace(/,/g, '').trim()

    if (text === '' || text === '-') {
      return 0
    }

    const numberValue = Number(text)

    return Number.isFinite(numberValue) ? numberValue : 0
  }

  const fmt3 = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })

  /**
   * รวม key 14 - 37
   */
  const sumKey14To37 = (dataTemp: any): number => {
    return keysToSum.reduce((total, key) => {
      return total + toNumber(dataTemp?.[key])
    }, 0)
  }

  const grouped = new Map<string, any>()

  const hvSgGrouped = new Map()

  const numDay_ = (gasDay: any) => {
    const dayMap: Record<number, number> = {
      0: 14, // Sunday
      1: 15, // Monday
      2: 16, // Tuesday
      3: 17, // Wednesday
      4: 18, // Thursday
      5: 19, // Friday
      6: 20 // Saturday
    }

    return dayMap[dayjs(gasDay, 'DD/MM/YYYY').day()]
  }

  /*
   * ขั้นตอนที่ 1
   * จัดกลุ่มและรวม key 14 - 37 ให้เสร็จก่อน
   */
  for (const item of data_for_sum) {
    const dt = item?.data_temp ?? {}
    const dayKey = String(numDay_(item?.gas_day))

    /*
     * Daily ใช้ผลรวม key 14 - 37 ของ row ปัจจุบัน
     * Weekly ใช้ค่าตามวัน เช่น Sunday = key 14
     */
    const viValue = roundTo3(item?.nom?.nomination_type_id === 1 ? sumKey14To37(dt) : toNumber(dt?.[dayKey]))

    const hasHv = hasNumericValue(dt?.[hvKey])
    const hasSg = hasNumericValue(dt?.[sgKey])

    const hvValue = hasHv ? roundTo3(toNumber(dt?.[hvKey])) : null

    const sgValue = hasSg ? roundTo4(toNumber(dt?.[sgKey])) : null

    const hvMultilyByVolumn = hvValue === null ? 0 : hvValue * viValue

    const sgMultilyByVolumn = sgValue === null ? 0 : sgValue * viValue

    // 0.982596

    // const test_ = "S_GSP3"
    // if(item?.data_temp?.[3] === test_){
    //     // 0.982596
    //     console.log(`- - start :  ${test_} - -`);
    //     console.log('item : ', item);
    //     console.log('item?.data_temp?.[3] : ', item?.data_temp?.[3]);
    //     console.log('dt : ', dt);
    //     console.log('viValue : ', viValue);
    //     console.log('hvValue : ', hvValue);
    //     console.log('sgValue : ', sgValue);
    //     console.log(`- - end : ${test_} - -`);
    // }

    const groupKey = JSON.stringify(keysToMatch.map((key) => norm(dt?.[key])))

    if (!grouped.has(groupKey)) {
      const newItem = JSON.parse(JSON.stringify(item))

      grouped.set(groupKey, newItem)

      hvSgGrouped.set(groupKey, {
        sumHvMultilyByVolumn: hvMultilyByVolumn,
        sumSgMultilyByVolumn: sgMultilyByVolumn,

        // เก็บเฉพาะ volume ของแถวที่มีค่า HV/SG
        hvVolume: hasHv ? viValue : 0,
        sgVolume: hasSg ? viValue : 0,

        hasHv,
        hasSg
      })

      continue
    }

    const existing = grouped.get(groupKey)

    /*
     * รวม key 14 - 37
     */
    for (const key of keysToSum) {
      const existingValue = toNumber(existing?.data_temp?.[key])
      const currentValue = toNumber(dt?.[key])

      existing.data_temp[key] = fmt3(existingValue + currentValue)
    }

    /*
     * สำคัญ:
     * สะสม HV / SG Weighted Value ของ row ถัด ๆ ไปด้วย
     */
    const hvSgExisting = hvSgGrouped.get(groupKey)

    if (hvSgExisting) {
      if (hasHv) {
        hvSgExisting.sumHvMultilyByVolumn += hvMultilyByVolumn
        hvSgExisting.hvVolume += viValue
        hvSgExisting.hasHv = true
      }

      if (hasSg) {
        hvSgExisting.sumSgMultilyByVolumn += sgMultilyByVolumn
        hvSgExisting.sgVolume += viValue
        hvSgExisting.hasSg = true
      }

      hvSgGrouped.set(groupKey, hvSgExisting)
    }

    grouped.set(groupKey, existing)
  }

  /*
   * ขั้นตอนที่ 2
   * เมื่อรวมทุก row เสร็จแล้ว
   * ค่อยคำนวณ key 38 จาก key 14 - 37
   */
  //   data_temp
  //   console.log('# data_for_sum : ', data_for_sum);
  //   console.log('#[S_GSP3] data_for_sum : ', data_for_sum?.filter((f:any) => f?.data_temp?.[3] === "S_GSP3"));
  //   console.log('#[S_GSP3][MMSCFD] data_for_sum : ', data_for_sum?.filter((f:any) => f?.data_temp?.[3] === "S_GSP3" && f?.data_temp?.[9] === "MMSCFD"));
  //   console.log('# grouped : ', grouped);
  //     //   "MMSCFD"
  //   console.log('hvSgGrouped : ', hvSgGrouped);

  grouped.forEach((existing, groupKey) => {
    const totalValue = sumKey14To37(existing?.data_temp)

    existing.data_temp[totalKey] = fmt3(totalValue)

    grouped.set(groupKey, existing)
  })

  hvSgGrouped.forEach((value, groupKey) => {
    const existing = grouped.get(groupKey)

    if (!existing) return

    /*
     * Weighted Average HV
     */
    const avgHv = value.hasHv && value.hvVolume !== 0 ? value.sumHvMultilyByVolumn / value.hvVolume : null

    /*
     * Weighted Average SG
     */
    const avgSg = value.hasSg && value.sgVolume !== 0 ? value.sumSgMultilyByVolumn / value.sgVolume : null

    existing.data_temp[hvKey] = avgHv !== null ? roundTo3(avgHv) : null

    existing.data_temp[sgKey] = avgSg !== null ? roundTo4(avgSg) : null

    /*
     * WI
     *
     * WI = HV / 0.982596 / sqrt(SG)
     *
     * ใช้ HV และ SG หลัง Weighted Average
     */
    if (avgHv === null || avgSg === null || avgSg <= 0) {
      existing.data_temp[wiKey] = null
    } else {
      existing.data_temp[wiKey] = roundTo3(avgHv / 0.982596 / Math.sqrt(avgSg))
    }

    grouped.set(groupKey, existing)
  })

  return Array.from(grouped.values())
}

// / 24
export const sumDataNomShipperReportNo = (data_for_sum: any[]) => {
  if (!Array.isArray(data_for_sum) || data_for_sum.length === 0) {
    return []
  }

  const keysToMatch = ['1', '2', '3', '6', '9']

  const keysToSum = Array.from({length: 37 - 14 + 1}, (_, index) => String(index + 14))

  const wiKey = '11'
  const hvKey = '12'
  const sgKey = '13'
  const totalKey = '38'

  const norm = (value: any) => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value))

  const hasNumericValue = (value: any): boolean => {
    if (value === null || value === undefined) {
      return false
    }

    if (typeof value === 'string') {
      const text = value.replace(/,/g, '').trim()

      if (text === '' || text === '-') {
        return false
      }

      return Number.isFinite(Number(text))
    }

    return typeof value === 'number' && Number.isFinite(value)
  }

  const toNumber = (value: any): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }

    if (typeof value !== 'string') {
      return 0
    }

    const text = value.replace(/,/g, '').trim()

    if (text === '' || text === '-') {
      return 0
    }

    const numberValue = Number(text)

    return Number.isFinite(numberValue) ? numberValue : 0
  }

  const fmt3 = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })

  const sumKey14To37 = (dataTemp: any): number => {
    return keysToSum.reduce((total, key) => {
      return total + toNumber(dataTemp?.[key])
    }, 0)
  }

  const grouped = new Map<string, any>()

  const hvSgGrouped = new Map<
    string,
    {
      sumHvMultilyByVolumn: number
      sumSgMultilyByVolumn: number
      hvVolume: number
      sgVolume: number
      hasHv: boolean
      hasSg: boolean
    }
  >()

  /**
   * เก็บ Total Volume จริง
   *
   * สำคัญสำหรับ Weekly -> Daily
   * เพราะไม่ควรใช้:
   *
   * round(daily / 24) * 24
   *
   * ในการหา key 38
   */
  const totalVolumeGrouped = new Map<string, number>()

  const numDay_ = (gasDay: any) => {
    const dayMap: Record<number, number> = {
      0: 14, // Sunday
      1: 15, // Monday
      2: 16, // Tuesday
      3: 17, // Wednesday
      4: 18, // Thursday
      5: 19, // Friday
      6: 20 // Saturday
    }

    return dayMap[dayjs(gasDay, 'DD/MM/YYYY').day()]
  }

  /*
   * ============================================
   * STEP 1
   * ============================================
   */
  for (const item of data_for_sum) {
    const originalDt = item?.data_temp ?? {}

    const dayKey = String(numDay_(item?.gas_day))

    const isDaily = item?.nom?.nomination_type_id === 1
    console.log('isDaily : ', isDaily);
    if (!isDaily) {
    console.log('========== WEEKLY ORIGINAL START ==========')

    console.log('gas_day :', item?.gas_day)
    console.log('nomination_type_id :', item?.nom?.nomination_type_id)

    console.log('dayKey :', dayKey)

    console.log('original data_temp :', originalDt)

    console.log('Weekly Day Values :', {
        Sunday_14: originalDt?.['14'],
        Monday_15: originalDt?.['15'],
        Tuesday_16: originalDt?.['16'],
        Wednesday_17: originalDt?.['17'],
        Thursday_18: originalDt?.['18'],
        Friday_19: originalDt?.['19'],
        Saturday_20: originalDt?.['20']
    })

    console.log(
        'selected weekly value originalDt[dayKey] :',
        originalDt?.[dayKey]
    )

    console.log(
        'selected weekly value toNumber :',
        toNumber(originalDt?.[dayKey])
    )

    console.log('========== WEEKLY ORIGINAL END ==========')
    }

    /*
        * Daily
        * - 14-37 เป็นรายชั่วโมงอยู่แล้ว
        *
        * Weekly
        * - originalDt[dayKey] ถูก /24 มาแล้วจากต้นทาง
        * - ดังนั้นค่าที่ได้คือ hourly volume อยู่แล้ว
        */
        const selectedVolume = isDaily
        ? sumKey14To37(originalDt)
        : toNumber(originalDt?.[dayKey])

        /*
        * ส่วนนี้คง logic เดิมไว้
        * เพื่อไม่กระทบ HV / SG / WI ที่ตอนนี้ถูกแล้ว
        */
        const viValue = roundTo3(selectedVolume)

        const dt = {
        ...originalDt
        }

        if (!isDaily) {
        /*
        * ห้าม /24 ซ้ำ
        */
        const hourlyVolume = selectedVolume

        for (const key of keysToSum) {
            dt[key] = hourlyVolume
        }
        }

    const hasHv = hasNumericValue(originalDt?.[hvKey])

    const hasSg = hasNumericValue(originalDt?.[sgKey])

    const hvValue = hasHv ? roundTo3(toNumber(originalDt?.[hvKey])) : null

    const sgValue = hasSg ? roundTo4(toNumber(originalDt?.[sgKey])) : null

    const hvMultilyByVolumn = hvValue === null ? 0 : hvValue * viValue

    const sgMultilyByVolumn = sgValue === null ? 0 : sgValue * viValue

    const groupKey = JSON.stringify(keysToMatch.map((key) => norm(dt?.[key])))

    /*
     * ==========================================
     * ROW แรกของ Group
     * ==========================================
     */
    if (!grouped.has(groupKey)) {
      const newItem = JSON.parse(JSON.stringify(item))

      /*
       * สำคัญ
       *
       * ใช้ dt ที่ Weekly -> Daily แล้ว
       */
      newItem.data_temp = {
        ...newItem.data_temp,
        ...dt
      }

      grouped.set(groupKey, newItem)

      /*
       * เก็บ Total จริง
       *
       * Weekly จะเก็บค่า dailyVolume ก่อน /24
       */
      const totalVolume = isDaily
        ? selectedVolume
        : selectedVolume * 24

        totalVolumeGrouped.set(
        groupKey,
        totalVolume
        )

      hvSgGrouped.set(groupKey, {
        sumHvMultilyByVolumn: hvMultilyByVolumn,

        sumSgMultilyByVolumn: sgMultilyByVolumn,

        hvVolume: hasHv ? viValue : 0,

        sgVolume: hasSg ? viValue : 0,

        hasHv,
        hasSg
      })

      continue
    }

    /*
     * ==========================================
     * ROW ถัดไปใน Group
     * ==========================================
     */
    const existing = grouped.get(groupKey)

    /*
     * รวม Hour 14-37
     *
     * Daily:
     * เอาค่า hour จริงมารวม
     *
     * Weekly:
     * เป็น dailyVolume / 24 แล้ว
     */
    // for (const key of keysToSum) {
    //   const existingValue = toNumber(existing?.data_temp?.[key])

    //   const currentValue = toNumber(dt?.[key])

    //   /*
    //    * เก็บเป็น number ไปก่อน
    //    *
    //    * อย่า fmt3 ตอนนี้
    //    * ป้องกัน rounding error สะสม
    //    */
    //   existing.data_temp[key] = existingValue + currentValue
    // }
    for (const key of keysToSum) {
    const existingValue = toNumber(existing?.data_temp?.[key])
    const currentValue = toNumber(dt?.[key])

    const resultValue =
        existingValue + currentValue

    if (key === '14') {
        console.log('========== SUM KEY 14 ==========')

        console.log('groupKey:', groupKey)

        console.log('item:', {
        gas_day: item?.gas_day,
        nomination_type_id:
            item?.nom?.nomination_type_id,

        key1: dt?.['1'],
        key2: dt?.['2'],
        key3: dt?.['3'],
        key6: dt?.['6'],
        key9: dt?.['9']
        })

        console.log('isDaily:', isDaily)

        console.log(
        'originalDt[14]:',
        originalDt?.['14']
        )

        console.log(
        'selectedVolume:',
        selectedVolume
        )

        console.log(
        'dt[14] currentValue:',
        currentValue
        )

        console.log(
        'existing.data_temp[14] BEFORE:',
        existingValue
        )

        console.log(
        'RESULT key14:',
        resultValue
        )

        console.log(
        '================================'
        )
    }

    existing.data_temp[key] =
        resultValue
    }

    /*
     * Total จริง
     */
    const totalVolume = isDaily
        ? selectedVolume
        : selectedVolume * 24

        totalVolumeGrouped.set(
        groupKey,
        (totalVolumeGrouped.get(groupKey) ?? 0) + totalVolume
        )

    /*
     * Weighted HV / SG
     */
    const hvSgExisting = hvSgGrouped.get(groupKey)

    if (hvSgExisting) {
      if (hasHv) {
        hvSgExisting.sumHvMultilyByVolumn += hvMultilyByVolumn

        hvSgExisting.hvVolume += viValue

        hvSgExisting.hasHv = true
      }

      if (hasSg) {
        hvSgExisting.sumSgMultilyByVolumn += sgMultilyByVolumn

        hvSgExisting.sgVolume += viValue

        hvSgExisting.hasSg = true
      }

      hvSgGrouped.set(groupKey, hvSgExisting)
    }

    grouped.set(groupKey, existing)
  }

  /*
   * ============================================
   * STEP 2
   * Format Volume 14-37 + Total 38
   * ============================================
   */
  grouped.forEach((existing, groupKey) => {
    /*
     * Hour 14-37
     *
     * ค่อย round ตอนสุดท้าย
     */
    for (const key of keysToSum) {
      existing.data_temp[key] = fmt3(toNumber(existing?.data_temp?.[key]))
    }

    /*
     * key 38
     *
     * ใช้ Total จริง
     * ไม่ใช่ sum ค่า hourly หลัง round
     */
    const totalValue = totalVolumeGrouped.get(groupKey) ?? 0

    existing.data_temp[totalKey] = fmt3(totalValue)

    grouped.set(groupKey, existing)
  })

  /*
   * ============================================
   * STEP 3
   * Weighted HV / SG / WI
   * ============================================
   */
  hvSgGrouped.forEach((value, groupKey) => {
    const existing = grouped.get(groupKey)

    if (!existing) return

    /*
     * Weighted Average HV
     */
    const avgHv = value.hasHv && value.hvVolume !== 0 ? value.sumHvMultilyByVolumn / value.hvVolume : null

    /*
     * Weighted Average SG
     */
    const avgSg = value.hasSg && value.sgVolume !== 0 ? value.sumSgMultilyByVolumn / value.sgVolume : null

    existing.data_temp[hvKey] = avgHv !== null ? roundTo3(avgHv) : null

    existing.data_temp[sgKey] = avgSg !== null ? roundTo4(avgSg) : null

    /*
     * WI
     */
    if (avgHv === null || avgSg === null || avgSg <= 0) {
      existing.data_temp[wiKey] = null
    } else {
      existing.data_temp[wiKey] = roundTo3(avgHv / 0.982596 / Math.sqrt(avgSg))
    }

    grouped.set(groupKey, existing)
  })

  return Array.from(grouped.values())
}

export const sumDataNomShipperReportConcept = (data_for_sum: any[]) => {
  if (!Array.isArray(data_for_sum) || data_for_sum.length === 0) {
    return []
  }

  const keysToMatch = ['3', '4', '5', '9']

  // รวมเฉพาะ key 14 - 37
  // key 38 จะคำนวณใหม่ภายหลัง
  const keysToSum = Array.from({length: 37 - 14 + 1}, (_, index) => String(index + 14))

  const totalKey = '38'

  const norm = (value: any) => (typeof value === 'string' ? value.trim() : value == null ? '' : String(value))

  const toNumber = (value: any): number => {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }

    if (typeof value !== 'string') {
      return 0
    }

    const text = value.replace(/,/g, '').trim()

    if (text === '' || text === '-') {
      return 0
    }

    const numberValue = Number(text)

    return Number.isFinite(numberValue) ? numberValue : 0
  }

  const fmt3 = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })

  /**
   * รวมค่า key 14 - 37
   */
  const sumKey14To37 = (dataTemp: any): number => {
    return keysToSum.reduce((total, key) => total + toNumber(dataTemp?.[key]), 0)
  }

  const grouped = new Map<string, any>()

  /*
   * ขั้นตอนที่ 1
   * จัดกลุ่มและรวม key 14 - 37
   */
  for (const item of data_for_sum) {
    const dt = item?.data_temp ?? {}

    const groupKey = JSON.stringify(keysToMatch.map((key) => norm(dt?.[key])))

    if (!grouped.has(groupKey)) {
      const clonedItem = JSON.parse(JSON.stringify(item))

      grouped.set(groupKey, clonedItem)
      continue
    }

    const existing = grouped.get(groupKey)

    if (!existing.data_temp) {
      existing.data_temp = {}
    }

    // รวมเฉพาะ key 14 - 37
    for (const key of keysToSum) {
      const existingValue = toNumber(existing?.data_temp?.[key])

      const currentValue = toNumber(dt?.[key])

      existing.data_temp[key] = fmt3(existingValue + currentValue)
    }

    grouped.set(groupKey, existing)
  }

  /*
   * ขั้นตอนที่ 2
   * หลังจากรวมทุก row เสร็จแล้ว
   * ค่อยคำนวณ key 38 จาก key 14 - 37
   */
  grouped.forEach((existing, groupKey) => {
    if (!existing.data_temp) {
      existing.data_temp = {}
    }

    const totalValue = sumKey14To37(existing.data_temp)

    existing.data_temp[totalKey] = fmt3(totalValue)

    grouped.set(groupKey, existing)
  })

  return Array.from(grouped.values())
}

export const removeComma = (value: string): string => {
  return value?.trim().replace(/,/g, '')
}

/**
 * Adds a unit label (e.g., "(MMBTU)") to specified keys in an array of objects.
 *
 * @param data - The input array of objects to update.
 * @param keys - An array of keys to append the unit to.
 * @param unit - The unit string to append, e.g., "(MMBTU)".
 * @returns A new array with updated keys.
 */
export const appendUnitToKeys = (data: Array<Record<string, any>>, keys: string[], unit: string = '(MMBTU)'): Array<Record<string, any>> =>
  data.map((item) => {
    const updatedItem: Record<string, any> = {}

    Object.entries(item).forEach(([key, value]) => {
      const newKey = keys.includes(key) ? `${key} ${unit}` : key
      updatedItem[newKey] = value
    })

    return updatedItem
  })

// daily adjustment report
export const groupByTimeAndPoint = (data: any) => {
  const timeMap: any = new Map()

  data?.forEach((item: any) => {
    // const time = item?.timeShow[0]?.time;
    const time = item?.timeShow?.time
    const point = item?.point

    if (!time || !point) return

    if (!timeMap.has(time)) {
      timeMap.set(time, new Map())
    }
    const pointMap = timeMap.get(time)

    if (!pointMap.has(point)) {
      pointMap.set(point, [])
    }
    pointMap.get(point).push(item)
  })

  const result = []

  for (const [time, pointMap] of timeMap.entries()) {
    const groups = []

    for (const [point, items] of pointMap.entries()) {
      // const total = items.reduce(
      //     // (sum: any, item: any) => sum + (item.timeShow[0]?.value || 0),
      //     (sum: any, item: any) => sum + (item.timeShow?.value || 0),
      //     0
      // );
      let summmm = 0
      const total: number | undefined = items.reduce((sum: number | undefined, item: any) => {
        if (item?.timeShow?.valueMmscfd !== null) {
          summmm = summmm + item.timeShow.valueMmscfd
        }
        return summmm
      }, undefined)
      groups.push({point, total, items})
    }
    result.push({time, groups})
  }

  return result
}

// แปลง "HH:mm" -> จำนวน นาที (int) เร็วกว่า dayjs มาก
const timeToMin = (t: string) => {
  const [h, m] = (t ?? '0:0').split(':').map(Number)
  return (h | 0) * 60 + (m | 0)
}

// รวมเวลาทั้งหมดแล้ว sort ครั้งเดียว
const collectSortedTimes = (data: any[]) => {
  const set = new Set<string>()
  for (const it of data ?? []) {
    const ts = it?.timeShow
    if (Array.isArray(ts)) for (const x of ts) if (x?.time) set.add(x.time)
  }
  // sort ด้วยตัวเลขนาทีแทน dayjs
  return Array.from(set).sort((a, b) => timeToMin(a) - timeToMin(b))
}

// forward-fill timeShow ของ item ให้ครบทุก time
const buildForwardFilled = (item: any, times: string[]) => {
  const byTime = new Map<string, any>()
  for (const x of item?.timeShow ?? []) if (x?.time) byTime.set(x.time, x)

  const out: any[] = new Array(times.length)
  // carrier เก็บค่าล่าสุด
  let last: any = null

  for (let i = 0; i < times.length; i++) {
    const t = times[i]
    const cur = byTime.get(t)
    if (cur) {
      last = cur
      // clone บางส่วนพอใช้ (หลีกเลี่ยงของหนัก)
      out[i] = {
        time: t,
        value: cur.value ?? null,
        valuePerHour: cur.valuePerHour ?? null,
        valueMmscfd: cur.valueMmscfd ?? null,
        valueMmscfh: cur.valueMmscfh ?? null,
        heatingValueFromMeter: cur.heatingValueFromMeter ?? [],
        heatingValueFromAdjust: cur.heatingValueFromAdjust ?? null,
        volumeFromMeter: cur.volumeFromMeter ?? [],
        volumeFromAdjust: cur.volumeFromAdjust ?? null,
        isAdjust: cur.isAdjust ?? false
      }
    } else if (last) {
      // forward fill
      out[i] = {
        time: t,
        value: last.value ?? null,
        valuePerHour: last.valuePerHour ?? null,
        valueMmscfd: last.valueMmscfd ?? null,
        valueMmscfh: last.valueMmscfh ?? null,
        heatingValueFromMeter: last.heatingValueFromMeter ?? [],
        heatingValueFromAdjust: last.heatingValueFromAdjust ?? null,
        volumeFromMeter: last.volumeFromMeter ?? [],
        volumeFromAdjust: last.volumeFromAdjust ?? null,
        isAdjust: last.isAdjust ?? false
      }
    } else {
      // ยังไม่มีค่าใด ๆ ก่อนหน้า
      out[i] = {
        time: t,
        value: null,
        valuePerHour: null,
        valueMmscfd: null,
        valueMmscfh: null,
        heatingValueFromMeter: [],
        heatingValueFromAdjust: null,
        volumeFromMeter: [],
        volumeFromAdjust: null,
        isAdjust: false
      }
    }
  }
  return out
}

/**
 * กลุ่มข้อมูลแบบเร็ว:
 * input: [{ point, timeShow: [...] }, ...]
 * output: [{ time, groups: [{ point, total, items }, ...] }, ...]
 */
export const groupByTimeAndPointTabTotal = (data: any[]) => {
  const rows = Array.isArray(data) ? data : []
  if (rows.length === 0) return []

  // 1) รวบรวมเวลาทั้งหมด + sort ครั้งเดียว
  const times = collectSortedTimes(rows)
  const T = times.length

  // 2) เตรียม forward-fill ของแต่ละ item ครั้งเดียว
  //    และจัดกลุ่ม point ราย time ไปพร้อมกัน
  // structure: timeIndex -> point -> items[]
  const timeBuckets: Map<number, Map<string, any[]>> = new Map()

  for (const item of rows) {
    const ff = buildForwardFilled(item, times) // length = T

    // push ตัว item พร้อม snapshot ตามเวลา
    // เพื่อ total เร็ว ๆ เราจะอ่านค่า value จาก snapshot ที่ index นั้น
    for (let ti = 0; ti < T; ti++) {
      const tmap = timeBuckets.get(ti) ?? new Map<string, any[]>()
      if (!timeBuckets.has(ti)) timeBuckets.set(ti, tmap)

      const point = item?.point
      if (!point) continue

      const arr = tmap.get(point) ?? []
      if (!tmap.has(point)) tmap.set(point, arr)

      // เก็บ item “พร้อม snapshot ที่เวลา ti” (ไม่ mutate item เดิม)
      arr.push({
        ...item,
        // แนบเฉพาะ snapshot ของเวลานี้เพื่อให้คำนวณเร็ว
        _snapshot: ff[ti] // มี { time, value, valueMmscfd, ... }
      })
    }
  }

  // 3) สร้างผลลัพธ์ตามรูปแบบ เดิน times ตามลำดับเดียว (ไม่ต้อง sort เพิ่ม)
  const result: any[] = new Array(T)
  for (let ti = 0; ti < T; ti++) {
    const t = times[ti]
    const pmap: any = timeBuckets.get(ti)
    const groups: any[] = []

    if (pmap) {
      for (const [point, items] of pmap.entries()) {
        // total = sum ของ value ณ เวลา t (จาก snapshot)
        let total = 0
        for (const it of items) {
          const v = it?._snapshot?.value ?? 0
          total += typeof v === 'number' ? v : Number(v) || 0
        }
        // สร้าง group
        groups.push({
          point,
          total,
          // ถ้าต้องการ timeShow = snapshot เดียวในเวลานี้:
          // หรือเก็บ item/timeShow เดิมตามที่ต้องใช้ภายนอก
          items: items.map((it: any) => ({
            ...it,
            isAdjust: it._snapshot?.isAdjust ?? false,
            timeShow: [it._snapshot] // ลดขนาด payload ให้เล็ก/เร็ว
          }))
        })
      }
    }
    result[ti] = {time: t, groups}
  }

  return result
}

export const extractGroupedByWeeklyByGroup = (original_data?: any) => {
  return original_data.map((zoneEntry: any) => {
    const groupedMap = new Map()

    for (const entry of zoneEntry.groupedByWeekly) {
      const key = `${entry.nomination_code}|${entry.gas_day_main}|${entry.group}|${entry.contract_code}`
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          nomination_code: entry.nomination_code,
          gas_day_main: entry.gas_day_main,
          group: entry.group,
          contract_code: entry.contract_code,
          data: []
        })
      }
      groupedMap.get(key).data.push(...entry.data)
    }

    return {
      ...zoneEntry,
      groupedByWeekly: Array.from(groupedMap.values())
    }
  })
}

export const splitByGroup = (data_origin?: any) => {
  const output: any = []

  for (const entry of data_origin) {
    const groupMap: any = {}

    for (const item of entry.gasWeek) {
      if (!groupMap[item.group]) {
        groupMap[item.group] = []
      }
      groupMap[item.group].push(item)
    }

    for (const [group, items] of Object.entries(groupMap)) {
      output.push({
        zone: entry.zone,
        gasWeek: items
      })
    }
  }

  return output
}

export const splitByGroupCopyCat = (data_origin?: any) => {
  const output: any = []

  for (const entry of data_origin) {
    const groupMap: any = {}
    if (Array.isArray(entry?.groupedByWeekly)) {
      for (const item of entry?.groupedByWeekly) {
        if (!groupMap[item.group]) {
          groupMap[item.group] = []
        }
        groupMap[item.group].push(item)
      }
    }

    for (const [group, items] of Object.entries(groupMap)) {
      output.push({
        groupedByAll: entry.groupedByAll,
        groupedByDaily: entry.groupedByDaily,
        zoneObj: entry.zoneObj,
        zone: entry.zone,
        groupedByWeekly: items
      })
    }
  }

  return output
}

export const separateTimeShow = (data_origin?: any) => {
  const output: any = []

  for (const entry of data_origin) {
    // const groupMap: any = {};
    const groupMap: any = []
    if (Array.isArray(entry?.timeShow)) {
      for (const item of entry?.timeShow) {
        if (!groupMap[item.time]) {
          groupMap[item.time] = []
        }
        groupMap[item.time].push(item)
      }
    }

    for (const [group, items] of Object.entries(groupMap)) {
      output.push({
        dailyAdjustFindPoint: entry.dailyAdjustFindPoint,
        adjustment: entry.adjustment,
        rowId: entry.rowId,
        nomination_code: entry.nomination_code,
        HV: entry.HV,
        contract: entry.contract,
        gasDayUse: entry.gasDayUse,
        shipper_name: entry.shipper_name,
        zone_text: entry.zone_text,
        area_text: entry.area_text,
        unit: entry.unit,
        point: entry.point,
        entryExit: entry.entryExit,
        total: entry.total,
        totalType: entry.totalType,
        contract_code_id: entry.contract_code_id,
        areaObj: entry.areaObj,
        entryExitObj: entry.entryExitObj,
        term: entry.term,
        nomination_type_id: entry.nomination_type_id,
        timeShow: items
      })
    }
  }

  return output
}

// หน้า intraday balance report
// ใช้กับฟิลเตอร์ filter_last_daily_version
export const getLatestPerShipper = (data: any[]): any[] => {
  const shipperMap: any = new Map<string, {entry: any; shipperGroup: any}>()

  for (const entry of data) {
    const timestamp = entry.execute_timestamp

    for (const shipperGroup of entry.shipperData) {
      for (const contract of shipperGroup.contractData) {
        const shipper = contract.shipper
        const current = shipperMap.get(shipper)

        if (!current || timestamp > current.entry.execute_timestamp) {
          shipperMap.set(shipper, {
            entry,
            shipperGroup
          })
        }
      }
    }
  }

  // Now build the result structure, grouping by request_number
  const requestMap = new Map<number, any>()

  for (const {entry, shipperGroup} of shipperMap.values()) {
    const existing = requestMap.get(entry.request_number)
    if (existing) {
      // Append shipperGroup if not already present
      existing.shipperData.push(shipperGroup)
    } else {
      requestMap.set(entry.request_number, {
        ...entry,
        shipperData: [shipperGroup] // only latest group per shipper
      })
    }
  }

  return Array.from(requestMap.values())
}

// หน้า intraday balance report
// ใช้กับฟิลเตอร์ filter_last_hourly_version
export const getLatestByPrevHourPerShipper = (data: any[]): any[] => {
  const shipperMap: any = new Map<string, {entry: any; shipperGroup: any}>()

  for (const entry of data) {
    const prevHour = entry.request_number_previous_hour

    for (const shipperGroup of entry.shipperData) {
      for (const contract of shipperGroup.contractData) {
        const shipper = contract.shipper
        const existing = shipperMap.get(shipper)

        if (!existing || prevHour > existing.entry.request_number_previous_hour) {
          shipperMap.set(shipper, {
            entry,
            shipperGroup
          })
        }
      }
    }
  }

  // Group results by request_number
  const requestMap = new Map<number, any>()

  for (const {entry, shipperGroup} of shipperMap.values()) {
    const existing = requestMap.get(entry.request_number)
    if (existing) {
      existing.shipperData.push(shipperGroup)
    } else {
      requestMap.set(entry.request_number, {
        ...entry,
        shipperData: [shipperGroup]
      })
    }
  }

  return Array.from(requestMap.values())
}

// ใช้กับ intraday acc imbalance inventory
export const filterLatestData = (data: any[], filterLastDaily: boolean, filterLastHourly: boolean) => {
  if (filterLastDaily) {
    // Filter the latest entry per `gas_day` by max `execute_timestamp`
    const groupedByGasDay = data.reduce((acc: any, item) => {
      const key = item.gas_day
      if (!acc[key] || item.execute_timestamp > acc[key].execute_timestamp) {
        acc[key] = item
      }
      return acc
    }, {})
    return Object.values(groupedByGasDay)
  }

  // โค้ดเดิม เอามาแต่ชั่วโมงล่าสุด
  // if (filterLastHourly) {
  //     // Filter latest `gasHour` per `gas_day` by max `gasHour`
  //     const groupedByGasDay: Record<string, any[]> = {};

  //     data?.forEach((item) => {
  //         const key = item.gas_day;
  //         if (!groupedByGasDay[key]) groupedByGasDay[key] = [];
  //         groupedByGasDay[key].push(item);
  //     });

  //     const result = Object.values(groupedByGasDay).map((entries) => {
  //         // Sort descending by gasHour ("06:00" > "05:00" > "02:00")
  //         return entries.sort((a, b) => b.gasHour.localeCompare(a.gasHour))[0];
  //     });

  //     return result;
  // }

  // โค้ดใหม่ กรอง execute timestamp ของแต่ละ gas hour
  if (filterLastHourly) {
    // Group by gas_day + gasHour
    const groupedByDayHour: Record<string, any[]> = {}

    data?.forEach((item) => {
      const key = `${item.gas_day} ${item.gasHour}`
      if (!groupedByDayHour[key]) groupedByDayHour[key] = []
      groupedByDayHour[key].push(item)
    })

    // Get item with latest execute_timestamp from each group
    const result = Object.values(groupedByDayHour).map((entries) => {
      return entries.reduce((latest, current) => {
        return current.execute_timestamp > latest.execute_timestamp ? current : latest
      })
    })

    return result
  }

  // Default: return all data if no filter
  return data
}

// หน้า PATH DETAIL
// add condition path.revised_capacity_path.revised_capacity_path_type_id == 1 must be 1st in sorting
// sort revised_capacity_path ในหน้า path detail
export const sortRevisedCapacityPathByEdges = (data: any) => {
  return data.map((item: any) => {
    const path = item.paths
    const nodes = path.revised_capacity_path
    const edges = path.revised_capacity_path_edges

    // Create map of area_id to node
    const areaIdToNode = new Map<number, any>()
    nodes.forEach((node: any) => {
      areaIdToNode.set(node.area_id, node)
    })

    // Create a map of source_id -> target_id
    const graphMap = new Map<number, number>()
    const reverseMap = new Map<number, number>()
    edges.forEach((edge: any) => {
      graphMap.set(edge.source_id, edge.target_id)
      reverseMap.set(edge.target_id, edge.source_id)
    })

    // Force starting node as the one with revised_capacity_path_type_id === 1
    const startNode = nodes.find((node: any) => node.revised_capacity_path_type_id === 1)
    if (!startNode) {
      // No start node with revised_capacity_path_type_id === 1 found.
      return item
    }

    // Walk the path starting from the forced start node
    const orderedNodes: any[] = []
    let currentId: number | undefined = startNode.area_id
    while (currentId !== undefined) {
      const node = areaIdToNode.get(currentId)
      if (node) {
        orderedNodes.push(node)
      }
      currentId = graphMap.get(currentId)
    }

    return {
      ...item,
      paths: {
        ...item.paths,
        revised_capacity_path: orderedNodes
      }
    }
  })
}

// filter data by start_date and end_date in range
export const filterMasterDataByDate = (mode_master: any[]) => {
  const today = dayjs().format('YYYY-MM-DD')

  const filtered = mode_master.filter((item) => {
    const start = toDayjs(item.start_date).format('YYYY-MM-DD')
    const end = item.end_date
      ? toDayjs(item.end_date).add(1, 'day').format('YYYY-MM-DD') // รวมวันที่ end_date ด้วย
      : null

    return end ? start <= today && today < end : start <= today
  })

  return filtered
}

// เอา timestamp จาก master/balancing/intraday-balancing-report
export const extractUniqueTimestamps = (data?: any) => {
  const timestampSet = new Set()

  data?.forEach((entry: any) => {
    entry?.shipperData?.forEach((shipper: any) => {
      shipper?.contractData?.forEach((contract: any) => {
        // if (contract.timestamp) {
        if (contract.valueContractActual.timestamp) {
          // timestampSet.add(contract.timestamp);
          timestampSet.add(contract.valueContractActual.timestamp)
        }
      })
    })
  })

  // return timestampSet
  return Array.from(timestampSet).map((timestamp) => ({timestamp}))
}

export const filterByShipperIntradayBalanceReport = (data?: any, shipperName?: any) => {
  return data
    ?.map((entry: any) => {
      // กรอง shipperData ที่ shipper ตรงกับ shipperName
      const filteredShipperData = entry.shipperData?.filter((shipperEntry: any) => shipperEntry.shipper === shipperName)

      if (!filteredShipperData || filteredShipperData.length === 0) return null

      return {
        ...entry,
        shipperData: filteredShipperData
      }
    })
    .filter(Boolean)
}

// v1.0.90 end เมื่อเลยแล้วควรแก้ได้แค่เป็น today+1 เป็นต้นไป https://app.clickup.com/t/86erp0grx
export const getMinDate = (formattedStartDate: any) => {
  const start = toDayjs(formattedStartDate).startOf('day')
  const today = dayjs().startOf('day')

  // If start date is before today, return tomorrow
  if (start.isBefore(today)) {
    return today.add(1, 'day').format('YYYY-MM-DD')
  }

  // Else, return the original start date
  return start.format('YYYY-MM-DD')
}

// capacity contract management
export const mapEntryWithDate = (entryArray: any, header: any, contractPoint?: any) => {
  return entryArray.map((entry: any) => {
    const newEntry: any = {}
    const headerLen = header.length

    Object.entries(entry).forEach(([key, value], idx) => {
      const keyNum = Number(key)

      if (keyNum >= 7) {
        const dateIdx = (keyNum - 7) % headerLen
        newEntry[key] = {
          value: value,
          date: header[dateIdx]
        }
      } else if (keyNum == 0) {
        const filter_contract_point = contractPoint?.find((item: any) => item.contract_point === value)
        // let zone_text = rowIndex === ixData ? filter_contract_point?.zone?.name : itemData["zone_text"];
        // let area_text = rowIndex === ixData ? filter_contract_point?.area?.name : itemData["area_text"];

        newEntry[key] = {
          value: value,
          zone: filter_contract_point ? filter_contract_point?.zone?.name : 'no data',
          zone_color: filter_contract_point ? filter_contract_point?.zone?.color : 'no data',
          area: filter_contract_point ? filter_contract_point?.area?.name : 'no data'
        }
      } else {
        newEntry[key] = value
      }
    })

    return newEntry
  })
}

// summary capacity contract management
export const summarizeDataByZone = (data_for_summary: any) => {
  const zoneMap: any = {}

  data_for_summary.forEach((item: any) => {
    const zone: any = item['0']?.zone
    const zoneObj: any = item['0']
    // const zone: any = item["0"];
    if (!zone) return

    if (!zoneMap[zone]) {
      zoneMap[zone] = {'0': {zoneObj}} // base structure
    }

    Object.entries(item).forEach(([key, value]: any) => {
      const keyNum = Number(key)
      // if (keyNum > 6 && typeof value === "object" && value?.value) { // อันนี้ถ้า value เป็น '' มันข้ามอะ
      if (keyNum > 6 && typeof value === 'object' && 'value' in value) {
        const rawValue = value.value
        const isBlank = rawValue === null || rawValue === undefined || (typeof rawValue === 'string' && rawValue.trim() === '')
        // const num = parseFloat(value.value) || 0; // เดิม ๆ 1
        // const num = parseFloat(value.value.replace(/,/g, "")) || 0; // เดิม ๆ 2

        // const num = typeof value?.value === "number" ? value.value : Number((value?.value ?? "").toString().replace(/,/g, "").trim()) || 0;

        if (!zoneMap[zone][key]) {
          zoneMap[zone][key] = {
            value: '',
            date: value.date // take the first date
          }
        }
        if (isBlank) return
        const num = typeof rawValue === 'number' ? rawValue : Number(String(rawValue).replace(/,/g, '').trim())
        // zoneMap[zone][key].value += num;
        const currentValue = zoneMap[zone][key].value
        zoneMap[zone][key].value = (currentValue === '' ? 0 : Number(currentValue)) + num
      }
    })
  })

  // Format to array and convert values to strings (optional)
  const result = Object.values(zoneMap).map((entry: any) => {
    const newEntry = {...entry}
    Object.keys(newEntry).forEach((key) => {
      if (Number(key) > 6 && newEntry[key]?.value !== undefined) {
        newEntry[key].value = newEntry[key].value !== '' ? newEntry[key].value.toFixed(3) : ''
      }
    })
    return newEntry
  })

  return result
}

// helper: เป็นคีย์แก้ไข (คอลัมน์วันที่) ไหม
const isEditableKey = (k: string | number) => {
  const n = typeof k === 'number' ? k : parseInt(k as string, 10)
  return Number.isFinite(n) && n >= 7
}

// NEW
// ใช้ entryValEdited นำไปอัพเดท dataRowAfterFromTo ตรงคีย์ที่ไม่เท่ากัน ข้อมูล dataRowAfterFromTo ต้องมีคีย์เท่ากับ entryValEdited (เช็คตั้งแต่คีย์ที่ 7 เป็นต้นไป คีย์ 0 - 6 ไม่ต้อง)
export const updateDataRowAfterFromTo = (entryValEdited: any[], dataRowAfterFromTo: any[]) => {
  return dataRowAfterFromTo.map((row: any, rowIndex: number) => {
    const edited = entryValEdited?.[rowIndex] ?? {}
    const updatedRow: any = {...row}

    // 1) อัปเดต/สร้างตาม edited
    for (const key of Object.keys(edited)) {
      const keyNum = parseInt(key, 10)
      if (!Number.isFinite(keyNum) || keyNum < 7) continue

      const editedVal = edited[key]
      const current = updatedRow[key]

      if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, 'value')) {
        updatedRow[key] = {...current, value: editedVal}
      } else {
        updatedRow[key] = {value: editedVal, date: null}
      }
    }

    // 2) กรณีลดช่วง: ลบคีย์ที่ไม่อยู่ใน edited (แต่เป็นคีย์แก้ไขได้)
    const keepKeys = new Set(
      Object.keys(edited)
        .map((k) => parseInt(k, 10))
        .filter((n) => Number.isFinite(n) && n >= 7)
        .map(String)
    )

    for (const key of Object.keys(updatedRow)) {
      if (isEditableKey(key) && !keepKeys.has(String(key))) {
        delete updatedRow[key] // ตัดคีย์ส่วนเกินที่อยู่นอกช่วงใหม่
      }
    }

    return updatedRow
  })
}

// สำหรับ sum booking capacity request mgn
export const grandTotalSumCapaContractMgn = (summary_each?: any) => {
  const grand_total: any = {}

  // Loop each entry (row)
  summary_each.forEach((item: any) => {
    Object.keys(item).forEach((key) => {
      const numKey = Number(key)
      if (numKey >= 7) {
        // const value = parseFloat(item[key].value || "0");

        const rawValue = item[key].value

        const isBlank = rawValue === null || rawValue === undefined || (typeof rawValue === 'string' && rawValue.trim() === '')

        if (!grand_total[key]) {
          grand_total[key] = {
            value: '',
            date: item[key].date // just take the first date found
          }
        }

        if (isBlank) return

        const num = typeof rawValue === 'number' ? rawValue : Number(String(rawValue).replace(/,/g, '').trim())

        // ข้อมูลไม่ใช่ตัวเลข ให้ข้าม
        if (Number.isNaN(num)) return
        const currentValue = grand_total[key].value

        // grand_total[key].value += value;
        grand_total[key].value = (currentValue === '' ? 0 : Number(currentValue)) + num
      }
    })
  })

  // Format values to fixed decimal
  Object.keys(grand_total).forEach((key) => {
    grand_total[key].value = grand_total[key].value !== '' ? grand_total[key].value.toFixed(3) : ''
  })

  // Optional: push zone info if needed
  grand_total['0'] = {
    zoneObj: {
      zone: 'GRAND TOTAL',
      zone_color: '#eeeeee'
    }
  }

  return grand_total
}

// headerEntryDateCapDailyBookingMmbtu = ["01/05/2025", "01/06/2025", "01/07/2025", "01/08/2025"]
// edit headerEntryDateCapDailyBookingMmbtu base on date
// if date = 16/10/2025 then headerEntryDateCapDailyBookingMmbtu should add "01/09/2025" and "01/10/2025" like ["01/05/2025", "01/06/2025", "01/07/2025", "01/08/2025", "01/09/2025", "01/10/2025"]
export const parseDateHeader = (d: string) => {
  // const [day, month, year] = d?.split('/').map(Number); // original
  // const { day, month, year, valid } = parseDMY(d); // new 1

  const parts = String(d ?? '')
    .trim()
    .split('/') // new 2 รับรองว่าเป็น string เสมอ
  const day = Number(parts[0])
  const month = Number(parts[1])
  const year = Number(parts[2])

  return new Date(year, month - 1, day)
}

const formatDateHeader = (date: Date) => {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yyyy = date.getFullYear()
  return `01/${mm}/${yyyy}`
}

// Generic updater with mode: 'FROM' (prepend) or 'TO' (append)
export const extendHeaderDates = (setter: React.Dispatch<React.SetStateAction<string[]>>, targetDate: Date, mode: 'FROM' | 'TO') => {
  setter((prev) => {
    // let newHeaders = [...prev];
    // let oldHeaders = [...prev];

    const base = Array.isArray(prev) ? prev : [] // กัน undefined/null/object
    let newHeaders = [...base]
    let oldHeaders = [...base]

    const tgt = toDateOnly(targetDate)

    if (mode === 'TO') {
      const lastDate: any = parseDateHeader(newHeaders[newHeaders.length - 1])
      const current = new Date(lastDate)
      current.setMonth(current.getMonth() + 1)

      // ของเดิม
      // while (current <= targetDate) {
      //     const formatted = formatDateHeader(current);
      //     newHeaders.push(formatted);
      //     current.setMonth(current.getMonth() + 1);
      // }

      // ของใหม่
      // เคสเพิ่มวัน
      const last = toDateOnly(newHeaders[newHeaders.length - 1])

      if (tgt > last) {
        // เพิ่มวัน
        while (current <= targetDate) {
          const formatted = formatDateHeader(current)
          newHeaders.push(formatted)
          current.setMonth(current.getMonth() + 1)
        }
      } else if (tgt < last) {
        // ลดวัน
        while (newHeaders.length && toDateOnly(newHeaders[newHeaders.length - 1]) > tgt) {
          newHeaders.pop()
        }
      }
    } else if (mode === 'FROM') {
      // Get first of month from targetDate
      const startMonthDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)

      // Remove earlier months
      newHeaders = newHeaders.filter((dateStr) => parseDateHeader(dateStr) >= startMonthDate)

      // Check if the earliest date is after targetDate → prepend missing months
      const firstExistingDate = parseDateHeader(newHeaders[0])
      const current = new Date(firstExistingDate)
      current.setMonth(current.getMonth() - 1)

      const datesToPrepend: string[] = []
      while (current >= startMonthDate) {
        datesToPrepend.unshift(formatDateHeader(current))
        current.setMonth(current.getMonth() - 1)
      }

      newHeaders = [...datesToPrepend, ...newHeaders]
    }

    return newHeaders
  })
}

// เอาไว้ตัด 0 ออกจาก gas_hour = "010:00"
// format เวลาควรเป็น HH:mm ถ้ามันมี 0 เกินมาข้างหน้าตัดออกให้หน่อย
export const formatGasHour = (gas_hour: any) => {
  const [hour, minute] = gas_hour.split(':')
  // แปลง hour เป็นเลข แล้วกลับไปเป็น string เพื่อเอา 0 ที่เกินออก
  const formattedHour = String(Number(hour))
  return `${formattedHour.padStart(2, '0')}:${minute}`
}

// แปลงจาก "01/05/2025" → Date object
const parseDateHeaderTypeFour = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day) // JS month is 0-indexed
}

// แปลงจาก Date object → "01/05/2025"
const formatDateHeaderTypeFour = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const toDateOnly = (d: Date | string): Date => {
  // กรณีเป็น Date อยู่แล้ว -> ตัดเวลาให้เหลือแค่วัน
  if (d instanceof Date && !isNaN(d.valueOf())) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
  }

  // กรณีเป็นสตริง DD/MM/YYYY
  const m = String(d ?? '').match(/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/)
  if (!m) return new Date(NaN) // รูปแบบไม่ถูกต้อง

  const day = Number(m[1])
  const monthIndex = Number(m[2]) - 1 // 0 = Jan
  const year = Number(m[3])

  // new Date(y, m, d) จะได้เวลา 00:00 ตาม local timezone (เช่น Asia/Bangkok)
  return new Date(year, monthIndex, day)
}

// จากเดิม คำนวน newHeaders และ return เป็นทุกวันที่ 1 ของเดือน
// เปลี่ยนเป็นคำนวนให้ได้ทุกวัน ตามเงื่อนไขเดิม
export const extendHeaderDatesForTypeFour = (setter: React.Dispatch<React.SetStateAction<string[]>>, targetDate: Date, mode: 'FROM' | 'TO') => {
  setter((prev) => {
    let newHeaders = [...prev].map(parseDateHeaderTypeFour) // แปลงให้เป็น Date ทั้งหมดก่อน
    const tgt = toDateOnly(targetDate)

    // กรณี TO: ขยายวันจากวันสุดท้าย ไปจนถึง targetDate แบบรายวัน
    if (mode === 'TO') {
      // const lastDate = new Date(newHeaders[newHeaders.length - 1]);
      // const current = new Date(lastDate);
      // current.setDate(current.getDate() + 1); // เริ่มวันถัดจากวันสุดท้าย

      // while (current <= targetDate) {
      //     newHeaders.push(new Date(current));
      //     current.setDate(current.getDate() + 1);
      // }

      // เคสขยายไปข้างหน้า
      const last = toDateOnly(newHeaders[newHeaders.length - 1])
      if (tgt > last) {
        // กรณีขยายไปข้างหน้า
        const current = new Date(last)
        current.setDate(current.getDate() + 1)
        while (current <= tgt) {
          newHeaders.push(new Date(current))
          current.setDate(current.getDate() + 1)
        }
      }
      // กรณี "ลดจำนวนวัน": ตัดวันท้ายที่เกิน target ทิ้ง
      else if (tgt < last) {
        // ลดจำนวนวัน
        while (newHeaders.length && toDateOnly(newHeaders[newHeaders.length - 1]) > tgt) {
          newHeaders.pop()
        }
      }

      // กรณี FROM: ย้อนวันจากวันแรก ไปจนถึง targetDate แบบรายวัน
    } else if (mode === 'FROM') {
      const startDate = new Date(targetDate)
      startDate.setHours(0, 0, 0, 0)

      newHeaders = newHeaders.filter((date) => date >= startDate)

      const firstDate = newHeaders[0]
      const current = new Date(firstDate)
      current.setDate(current.getDate() - 1)

      const prependDates: Date[] = []
      while (current >= startDate) {
        prependDates.unshift(new Date(current))
        current.setDate(current.getDate() - 1)
      }

      newHeaders = [...prependDates, ...newHeaders]
    }

    // แปลง Date กลับเป็น string
    const result = newHeaders.map(formatDateHeaderTypeFour)
    return result
  })
}

const getMonthCountDiff = (newHeaders: string[], oldHeaders: string[], direction: 'FROM' | 'TO') => {
  let count = 0

  if (direction === 'FROM') {
    for (const date of newHeaders) {
      if (!oldHeaders.includes(date)) count++
      else break
    }
  } else {
    // count = newHeaders.length - oldHeaders.length;

    // นับเฉพาะค่าที่ "อยู่ใน newHeaders แต่ไม่อยู่ใน oldHeaders"
    const addedFromEnd = newHeaders.filter((h) => !oldHeaders.includes(h))
    count = addedFromEnd.length

    // for (let i = oldHeaders.length - 1; i >= 0; i--) {
    //     if (!newHeaders.includes(oldHeaders[i])) count++;
    //     else break;
    // }
  }

  return count
}

// helper: คืน array ที่มีค่า "ตัวสุดท้ายของกลุ่ม" ซ้ำ count ครั้ง
const makeFillWithLast = (arr: string[], count: number) => {
  const last = arr.length ? arr[arr.length - 1] : '0'
  return Array.from({length: count}, () => last)
}

const makeFillWithFirst = (arr: string[], count: number) => {
  const first = arr.length ? arr[0] : '0'
  return Array.from({length: count}, () => first)
}

const countAfter6 = (obj: Record<string, any>) => Object.keys(obj).filter((k) => Number(k) > 6).length

/**
 * สร้างแถวข้อมูลใหม่เมื่อช่วงวันที่ (header) เปลี่ยน โดยคงค่าเดิมของวันที่ที่ยังมีอยู่
 * และเติม "ค่าตัวสุดท้ายของกลุ่ม" ให้วันที่ที่เพิ่มมาใหม่หรือค่าที่ว่าง
 *
 * โครงสร้างแถว:
 *   key 0-6  = metadata (จุดเข้า/ออก, ค่าคงที่, วันที่เริ่ม-สิ้นสุด ฯลฯ)
 *   key 7+   = ค่าตัวเลขแบ่งเป็นกลุ่ม (เช่น qty, daily) กลุ่มละ oldHeaders.length ค่า
 *              แต่ละค่าในกลุ่มตรงกับวันที่ 1 วันตามลำดับ header
 *
 * ใช้เป็น fallback ของ updateRow / updateRowExit เมื่อ mode = 'TO'
 * และจำนวน key หลัง remap ไม่ตรงกับ newHeaders.length * numberOfGroups
 *
 * @param example_data    แถวข้อมูลเดิม (object ที่ key เป็นเลขลำดับ)
 * @param numberOfGroups  จำนวนกลุ่มค่าตัวเลขต่อแถว (เช่น 4 = qty / daily / ... ต่อจุด)
 * @param newHeaders      รายการวันที่ใหม่หลังเปลี่ยนช่วง
 * @param oldHeaders      รายการวันที่เดิมก่อนเปลี่ยนช่วง
 */
const generateRowsFromLast = (
    {example_data, numberOfGroups, newHeaders, oldHeaders}:
    {example_data: any[], numberOfGroups: number, newHeaders: any[], oldHeaders: any[]}
) => {

    const baseKey = 7; // ค่าตัวเลขเริ่มที่ key 7 (หลัง metadata 0-6)
    const keysPerGroup = oldHeaders.length; // จำนวนค่าต่อกลุ่ม = จำนวนวันที่เดิม
    let firstHeader : dayjs.Dayjs | undefined
    let lastHeader : dayjs.Dayjs | undefined
    if(oldHeaders.length > 0){
        firstHeader = toDayjs(oldHeaders[0], 'DD/MM/YYYY')
        lastHeader = toDayjs(oldHeaders[oldHeaders.length - 1], 'DD/MM/YYYY')
    }

  const newData = example_data.map((row: any) => {
    const newRow: any = {}

    // คัดลอก metadata (key 0-6) ไปแถวใหม่ตามเดิม
    for (let i = 0; i < baseKey; i++) {
      newRow[i] = row[i]
    }

        let runningKey = baseKey;
        for (let g = 0; g < numberOfGroups; g++) {
            // ช่วง key ของกลุ่มนี้ในแถวเดิม เช่น กลุ่ม 0 = 7..10, กลุ่ม 1 = 11..14
            const firstKey = baseKey + (keysPerGroup * g)
            const lastKey = baseKey + (keysPerGroup * (g + 1)) - 1
            const firstValue = row[firstKey] // ค่าวันแรกของกลุ่ม ใช้เติมวันที่ใหม่ / ค่าว่าง
            const lastValue = row[lastKey] // ค่าวันสุดท้ายของกลุ่ม ใช้เติมวันที่ใหม่ / ค่าว่าง

            newHeaders.map((newHeader: any) => {
                let defaultValue = lastValue
                const newHeaderDayjs = toDayjs(newHeader, 'DD/MM/YYYY')
                if(newHeaderDayjs.isValid()){
                    if(firstHeader?.isValid() && newHeaderDayjs.isBefore(firstHeader)){
                        defaultValue = firstValue
                    }
                }
                const index = oldHeaders.findIndex((oldHeader: any) => oldHeader == newHeader)
                if(index > -1) {
                    // วันที่นี้มีใน header เดิม → ใช้ค่าเดิมของวันนั้น
                    const exitsValue = row[firstKey + index]
                    if(exitsValue){
                        newRow[runningKey] = exitsValue
                    }
                    else{
                        // ค่าเดิมว่าง → เติมด้วยค่าวันสุดท้ายของกลุ่ม
                        newRow[runningKey] = defaultValue
                    }
                }
                else{
                    // วันที่ใหม่ที่ยังไม่มีใน header เดิม → เติมด้วยค่าวันสุดท้ายของกลุ่ม
                    newRow[runningKey] = defaultValue
                }
                runningKey++
            })
        }

    return newRow
  })

  return newData
}

// updatedExampleData ได้จาก case ลดช่วงเวลา
export const updateRow = (mode: 'FROM' | 'TO', new_header: any, old_header: any, example_data: any, entryExit?: number) => {
  if (mode !== 'FROM' && mode !== 'TO') return

  // mode: 'FROM' | 'TO' คือแก้วันที่ FROM หรือ TO

  // let new_header = [
  //     "01/08/2025",
  //     "01/09/2025",
  //     "01/10/2025",
  // ]

  // let old_header = [
  //     "01/09/2025",
  //     "01/10/2025",
  // ]

  // const example_data = [
  //     {
  //         "0": "Entry-X1-PTT",
  //         "1": "900",
  //         "2": "1000",
  //         "3": "85",
  //         "4": "90",
  //         "5": "10/06/2025",
  //         "6": "03/10/2025",

  //         "7": "15000",
  //         "8": "10000",
  //         "9": "10000",
  //         "10": "10000",

  //         "11": "625",
  //         "12": "416.667",
  //         "13": "416.667",
  //         "14": "416.667",

  //         "15": "15",
  //         "16": "10",
  //         "17": "10",
  //         "18": "10",

  //         "19": "0.625",
  //         "20": "0.417",
  //         "21": "0.417",
  //         "22": "0.417"
  //     },
  //     {
  //         "0": "Entry-Y-PTT",
  //         "1": "900",
  //         "2": "1000",
  //         "3": "85",
  //         "4": "90",
  //         "5": "30/05/2025",
  //         "6": "30/08/2025",

  //         "7": "0",
  //         "8": "5000",
  //         "9": "5000",
  //         "10": "5000",

  //         "11": "0",
  //         "12": "208.333",
  //         "13": "208.333",
  //         "14": "208.333",

  //         "15": "0",
  //         "16": "5",
  //         "17": "5",
  //         "18": "5",

  //         "19": "0",
  //         "20": "0.208",
  //         "21": "0.208",
  //         "22": "0.208"
  //     }
  // ]

  const newHeaders = new_header
  const oldHeaders = old_header

  // oldHeaders = [ "01/05/2025", "01/06/2025", "01/07/2025","01/08/2025"]
  // newHeaders = ["01/07/2025", "01/08/2025"]
  // ถ้า newHeaders มีน้อยกว่า oldHeaders ให้ลบ ข้อมูลตาม example_data ไปด้วย

  const addedMonths = getMonthCountDiff(newHeaders, oldHeaders, mode)

  // if (addedMonths === 0) return;
  if (addedMonths === 0) {
    // case นี้คือลดช่วงเวลา period from, to
    const updatedExampleData = trimRowByHeaderChange(
      oldHeaders,
      newHeaders,
      mode, // 'FROM' หรือ 'TO'
      example_data,
      entryExit || 1 // 1 == entry, 2 == exit
    )

    // newHeaders = 84
    // count_row_key = 76
    // ถ้าตัวเลขไม่ตรงกัน ให้เติมข้อมูลลง updatedExampleData ให้จำนวนคีย์เท่ากับ newHeaders
    // โดยเอา updatedExampleData ตั้งแต่คีย์ 7 เป็นต้นไป หารด้วย 4 แล้วเติมข้อมูลลงท้ายในแต่ละกลุ่มด้วยค่าของคีย์ก่อนหน้า
    // แล้ว return ออกมาเป็นข้อมูลโครงสร้างเหมือน updatedExampleData

    // ----- ใช้งานกับตัวอย่าง -----
    // const updated = padRowToHeaders(updatedExampleData[0], newHeaders.length * 4, 4, 7);
    // updated มีคีย์ 7.. ครบ 84 ช่อง (เดิม 76) โดยแต่ละกลุ่มถูกเติมท้ายด้วยค่าก่อนหน้า

    // ตัวอย่างใช้กับแถวเดียว
    // const fixed = normalizeRowToHeaders(updateExampleData[0], 84, { groups: 4, metaCount: 7, cutMode: "TO" });

    // ทั้งอาเรย์
    // const result = updateExampleData.map(r => normalizeRowToHeaders(r, 84, { groups: 4, metaCount: 7, cutMode: "TO" }));

    // updatedExampleData ได้จาก case ลดช่วงเวลา ---> updatedExampleData
    const count_row_key = countAfter6(updatedExampleData[0]) // 12

        // safe guard
        let resultArray: any = updatedExampleData
        // ถ้าจะวิ่งทั้งอาร์เรย์:
        const groups = entryExit === 2 ? 2 : 4;
        if (newHeaders.length * groups !== count_row_key || ((newHeaders.length * groups) == count_row_key && newHeaders.some((newHeader: any) => !oldHeaders.includes(newHeader)))) {
            if(mode == 'FROM') {
                const newData = generateRowsFromLast({example_data, numberOfGroups: groups, newHeaders, oldHeaders});
                resultArray = newData
            }
            else{
            resultArray = updatedExampleData.map(r => normalizeRowToHeaders(r, newHeaders.length * groups, { groups: groups, metaCount: 7, cutMode: "TO" }));
            }
        }

    return resultArray
  } else {
    // case นี้เพิ่มช่วงเวลา period from, to
    const groups = entryExit === 2 ? 2 : 4
    const keysPerGroup = oldHeaders.length
    const newKeysPerGroup = newHeaders.length
    const keysToAddPerGroup = newKeysPerGroup - keysPerGroup

    // เติม 0 ลงคีย์ใหม่
    // const updatedData = example_data.map((row: any) => {
    //     const newRow: any = {};

    //     // คัดลอก key 0-6
    //     for (let i = 0; i <= 6; i++) {
    //         newRow[i] = row[i];
    //     }

    //     // จัดกลุ่มข้อมูล 4 กลุ่ม
    //     const groupData: string[][] = Array.from({ length: groups }, () => []);
    //     let baseKey = 7;
    //     for (let g = 0; g < groups; g++) {
    //         for (let i = 0; i < keysPerGroup; i++) {
    //             const key = String(baseKey++);
    //             groupData[g].push(row[key] ?? "0");
    //         }
    //     }

    //     if (mode === 'FROM') {
    //         // เพิ่ม "0" ด้านหน้าแต่ละกลุ่ม
    //         for (let g = 0; g < groups; g++) {
    //             const zeros = Array(keysToAddPerGroup).fill("0");
    //             groupData[g] = [...zeros, ...groupData[g]];
    //         }
    //     } else if (mode === 'TO') {
    //         // เพิ่ม "0" ด้านหลังแต่ละกลุ่ม
    //         for (let g = 0; g < groups; g++) {
    //             const zeros = Array(keysToAddPerGroup).fill("0");
    //             groupData[g] = [...groupData[g], ...zeros];
    //         }
    //     }

    //     // แปลงกลับเป็น flat key/value
    //     let newKeyIndex = 7;
    //     for (const group of groupData) {
    //         for (const val of group) {
    //             newRow[newKeyIndex++] = val;
    //         }
    //     }

    //     return newRow;
    // });

    // เติมค่าสุดท้ายของ row ลงคีย์ใหม่

    const updatedData = example_data.map((row: any) => {
      const newRow: any = {}

      // คัดลอก key 0-6
      for (let i = 0; i <= 6; i++) {
        newRow[i] = row[i]
      }

      // ดึงข้อมูลเป็น 4 กลุ่ม
      const groupData: string[][] = Array.from({length: groups}, () => [])

      let baseKey = 7
      for (let g = 0; g < groups; g++) {
        for (let i = 0; i < keysPerGroup; i++) {
          const key = String(baseKey++)
          groupData[g].push(row[key] ?? '0')
        }
      }

      if (mode === 'FROM') {
        // เติมค่าตัวสุดท้ายไว้ "ด้านหน้า" ของแต่ละกลุ่ม
        for (let g = 0; g < groups; g++) {
          const fill = makeFillWithFirst(groupData[g], keysToAddPerGroup) // เอาค่าของตัวแรกมาใส่ ที่จะย้อนหลังวัน
          groupData[g] = [...fill, ...groupData[g]]
        }
      } else if (mode === 'TO') {
        // เติมค่าตัวสุดท้ายไว้ "ด้านหลัง" ของแต่ละกลุ่ม
        for (let g = 0; g < groups; g++) {
          const fill = makeFillWithLast(groupData[g], keysToAddPerGroup) // เอาค่าของตัวสุดท้ายมาใส่ ที่จะเพิ่มวัน
          groupData[g] = [...groupData[g], ...fill]
        }
      }

      // แปลงกลับเป็น flat key/value
      let newKeyIndex = 7
      for (const group of groupData) {
        for (const val of group) {
          newRow[newKeyIndex++] = val
        }
      }

      return newRow
    })

    // safe guard กันเหนียว
    const count_row_key = countAfter6(updatedData[0]) // 12
    let resultArray: any = updatedData
    if (newHeaders.length * groups !== count_row_key || (newHeaders.length * groups == count_row_key && newHeaders.some((newHeader: any) => !oldHeaders.includes(newHeader)))) {
      // let isOverMaxOldDate = false
      // try {
      //     const maxOldDate = toDayjs(oldHeaders[oldHeaders.length - 1], 'DD/MM/YYYY')
      //     isOverMaxOldDate = newHeaders.some((newHeader: any) => {
      //         if(toDayjs(newHeader, 'DD/MM/YYYY').isAfter(maxOldDate)) {
      //             return newHeader
      //         }
      //     })
      // } catch (error) {
      //     isOverMaxOldDate = false
      // }

      if (mode == 'TO') {
        const newData = generateRowsFromLast({example_data, numberOfGroups: groups, newHeaders, oldHeaders})
        resultArray = newData
      } else {
        resultArray = updatedData.map((r: any) => normalizeRowToHeaders(r, newHeaders.length * groups, {groups: groups, metaCount: 7, cutMode: 'TO'}))
      }
    }

    return resultArray
  }

  // หากต้องการเซฟ: setExampleData(updatedData);
}

// ของเดิม
// export const updateRowExit = (mode: 'FROM' | 'TO', new_header: any, old_header: any, example_data: any) => {
//     if (mode !== 'FROM' && mode !== 'TO') return;

//     const newHeaders = new_header;
//     const oldHeaders = old_header;

//     // oldHeaders = [ "01/05/2025", "01/06/2025", "01/07/2025","01/08/2025"]
//     // newHeaders = ["01/07/2025", "01/08/2025"]
//     // ถ้า newHeaders มีน้อยกว่า oldHeaders ให้ลบ ข้อมูลตาม example_data ไปด้วย

//     const addedMonths = getMonthCountDiff(newHeaders, oldHeaders, mode);

//     // if (addedMonths === 0) return;
//     if (addedMonths === 0) {
//         // case นี้คือลดช่วงเวลา period from, to
//         const updatedExampleData = trimRowByHeaderChange(
//             oldHeaders,
//             newHeaders,
//             mode, // 'FROM' หรือ 'TO'
//             example_data
//         );

//         return updatedExampleData
//     } else {
//         // case นี้เพิ่มช่วงเวลา period from, to

//         const groups = 2;
//         const keysPerGroup = oldHeaders.length;
//         const newKeysPerGroup = newHeaders.length;
//         const keysToAddPerGroup = newKeysPerGroup - keysPerGroup;

//         const updatedData = example_data.map((row: any) => {
//             const newRow: any = {};

//             // คัดลอก key 0-6
//             for (let i = 0; i <= 6; i++) {
//                 newRow[i] = row[i];
//             }

//             // จัดกลุ่มข้อมูล 2 กลุ่ม
//             const groupData: string[][] = Array.from({ length: groups }, () => []);
//             let baseKey = 7;
//             for (let g = 0; g < groups; g++) {
//                 for (let i = 0; i < keysPerGroup; i++) {
//                     const key = String(baseKey++);
//                     groupData[g].push(row[key] ?? "0");
//                 }
//             }

//             if (mode === 'FROM') {
//                 // เพิ่ม "0" ด้านหน้าแต่ละกลุ่ม
//                 for (let g = 0; g < groups; g++) {
//                     const zeros = Array(keysToAddPerGroup).fill("0");
//                     groupData[g] = [...zeros, ...groupData[g]];
//                 }
//             } else if (mode === 'TO') {
//                 // เพิ่ม "0" ด้านหลังแต่ละกลุ่ม
//                 for (let g = 0; g < groups; g++) {
//                     const zeros = Array(keysToAddPerGroup).fill("0");
//                     groupData[g] = [...groupData[g], ...zeros];
//                 }
//             }

//             // แปลงกลับเป็น flat key/value
//             let newKeyIndex = 7;
//             for (const group of groupData) {
//                 for (const val of group) {
//                     newRow[newKeyIndex++] = val;
//                 }
//             }

//             return newRow;
//         });

//         return updatedData
//     }

//     // หากต้องการเซฟ: setExampleData(updatedData);
// };

// ของใหม่
export const updateRowExit = (
    mode: 'FROM' | 'TO',
    new_header: any[],
    old_header: any[],
    example_data: any[],
) => {
    if (mode !== 'FROM' && mode !== 'TO') return;

    const newHeaders = new_header;
    const oldHeaders = old_header;
    const groups = 2;

  // ถ้า newHeaders มีน้อยกว่า oldHeaders -> ตัดข้อมูลทิ้งตามช่วงหัวท้าย
  const addedMonths = getMonthCountDiff(newHeaders, oldHeaders, mode)

  if (addedMonths === 0) {
    // ลดช่วงเวลา period from/to
    const updatedExampleData = trimRowByHeaderChange(
      oldHeaders,
      newHeaders,
      mode, // 'FROM' | 'TO'
      example_data,
      2
    )

    const count_row_key = countAfter6(updatedExampleData[0]) // 12

        // safe guard
        let resultArray: any = updatedExampleData
        // ถ้าจะวิ่งทั้งอาร์เรย์:
        if (newHeaders.length * 2 !== count_row_key || ((newHeaders.length * groups) == count_row_key && newHeaders.some((newHeader: any) => !oldHeaders.includes(newHeader)))) {
            if(mode == 'FROM') {
                const newData = generateRowsFromLast({example_data, numberOfGroups: groups, newHeaders, oldHeaders});
                resultArray = newData
            }
            else{
            resultArray = updatedExampleData.map(r => normalizeRowToHeaders(r, newHeaders.length * 2, { groups: 2, metaCount: 7, cutMode: "TO" }));
            }
        }
        return resultArray;
    } else {
        // case เพิ่มช่วงเวลา period from/to
        const keysPerGroup = oldHeaders.length;
        const newKeysPerGroup = newHeaders.length;
        const keysToAddPerGroup = newKeysPerGroup - keysPerGroup;

    // เผื่อเคสเผลอส่งมาไม่ถูก (เช่น ติดลบ) ก็ไม่ต้องทำอะไร
    // if (keysToAddPerGroup <= 0) return example_data;

    // helpers
    // const fillWithFirst = (arr: string[], count: number) => {
    //     const first = arr.length ? arr[0] : "0";
    //     return Array.from({ length: count }, () => first);
    // };
    // const fillWithLast = (arr: string[], count: number) => {
    //     const last = arr.length ? arr[arr.length - 1] : "0";
    //     return Array.from({ length: count }, () => last);
    // };

    const updatedData = example_data.map((row: any) => {
      const newRow: any = {}

      // คัดลอก key 0-6
      for (let i = 0; i <= 6; i++) newRow[i] = row[i]

      // แตกข้อมูลเป็น 2 กลุ่ม (ตามคีย์ต่อเนื่องตั้งแต่ 7)
      const groupData: string[][] = Array.from({length: groups}, () => [])

      let baseKey = 7
      for (let g = 0; g < groups; g++) {
        for (let i = 0; i < keysPerGroup; i++) {
          const key = String(baseKey++)
          groupData[g].push(row[key] ?? '0')
        }
      }

      if (mode === 'FROM') {
        // เติม “ค่าตัวแรก” ไว้ด้านหน้าแต่ละกลุ่ม
        for (let g = 0; g < groups; g++) {
          // const fill = fillWithFirst(groupData[g], keysToAddPerGroup);
          const fill = makeFillWithFirst(groupData[g], keysToAddPerGroup) // เอาค่าของตัวแรกมาใส่ ที่จะย้อนหลังวัน

          groupData[g] = [...fill, ...groupData[g]]
        }
      } else if (mode === 'TO') {
        // เติม “ค่าตัวสุดท้าย” ไว้ด้านหลังแต่ละกลุ่ม
        for (let g = 0; g < groups; g++) {
          // const fill = fillWithLast(groupData[g], keysToAddPerGroup);
          const fill = makeFillWithLast(groupData[g], keysToAddPerGroup) // เอาค่าของตัวสุดท้ายมาใส่ ที่จะเพิ่มวัน

          groupData[g] = [...groupData[g], ...fill]
        }
      }

      // flatten กลับเป็นคีย์ต่อเนื่อง
      let newKeyIndex = 7
      for (const group of groupData) {
        for (const val of group) newRow[newKeyIndex++] = val
      }

      return newRow
    })

    // safe guard กันเหนียว
    const count_row_key = countAfter6(updatedData[0]) // 12
    let resultArray: any = updatedData

    if (newHeaders.length * groups !== count_row_key || (newHeaders.length * groups == count_row_key && newHeaders.some((newHeader: any) => !oldHeaders.includes(newHeader)))) {
      if (mode == 'TO') {
        const newData = generateRowsFromLast({example_data, numberOfGroups: groups, newHeaders, oldHeaders})
        resultArray = newData
      } else {
        resultArray = updatedData.map((r: any) => normalizeRowToHeaders(r, newHeaders.length * 2, {groups: 2, metaCount: 7, cutMode: 'TO'}))
      }
    }

    return resultArray
  }
}

// ตัวอย่างใช้กับแถวเดียว
// const fixed = normalizeRowToHeaders(updateExampleData[0], 84, { groups: 4, metaCount: 7, cutMode: "TO" });

// ทั้งอาเรย์
// const result = updateExampleData.map(r => normalizeRowToHeaders(r, 84, { groups: 4, metaCount: 7, cutMode: "TO" }));
/**
 * ปรับจำนวนคีย์หลัง 6 ให้ตรงกับ newHeaders เสมอ
 * - แบ่งค่าหลังคีย์ 6 เป็น groups กลุ่ม (ปกติ 4)
 * - ถ้าน้อยกว่า → เติมท้ายแต่ละกลุ่มด้วย "ค่าก่อนหน้า" ของกลุ่มนั้น
 * - ถ้าเกิน      → ตัดตามโหมด cutMode: 'TO' (ตัดท้าย) หรือ 'FROM' (ตัดหัว)
 */
function normalizeRowToHeaders(row: Record<string, any>, newHeaders: number, {groups = 4, metaCount = 7, cutMode = 'TO' as 'TO' | 'FROM'} = {}) {
  // 1) คัดลอกเมตา 0..6
  const out: Record<string, any> = {}
  for (let i = 0; i < metaCount; i++) out[i] = row[i]

  // 2) ดึงค่า (คีย์ 7 ขึ้นไป) ตามลำดับคีย์
  const valueKeys = Object.keys(row)
    .map(Number)
    .filter((k) => k >= metaCount)
    .sort((a, b) => a - b)

  const values = valueKeys.map((k) => row[String(k)])

  // 3) ถ้าจำนวนตรงแล้ว ใส่กลับและจบ
  if (values.length === newHeaders) {
    values.forEach((v, i) => (out[metaCount + i] = v))
    return out
  }

  // helper: กระจายขนาดกลุ่มแบบสมดุล (แจกเศษให้กลุ่มต้น ๆ)
  const splitSizes = (total: number, parts: number) => {
    const base = Math.floor(total / parts)
    const rem = total % parts
    return Array.from({length: parts}, (_, i) => base + (i < rem ? 1 : 0))
  }

  // 4) ผ่าค่าปัจจุบันเป็น groups กลุ่ม (สมดุล)
  const curSizes = splitSizes(values.length, groups)
  const chunks: any[][] = []
  let off = 0
  for (let g = 0; g < groups; g++) {
    const sz = curSizes[g]
    chunks.push(values.slice(off, off + sz))
    off += sz
  }

  // 5) ขนาดกลุ่มเป้าหมายจาก newHeaders
  const tgtSizes = splitSizes(newHeaders, groups)

  // 6) สร้างกลุ่มใหม่ตามเป้า: ถ้าน้อย → เติม, ถ้าเกิน → ตัด
  const rebuilt = chunks.map((chunk, i) => {
    const need = tgtSizes[i]
    if (chunk.length === need) return chunk.slice()

    if (chunk.length < need) {
      // เติมท้ายด้วยค่าก่อนหน้า (ถ้ากลุ่มว่างให้เติม "" หรือ 0 ตามที่ต้องการ)
      const last = chunk.length > 0 ? chunk[chunk.length - 1] : ''
      return chunk.concat(Array.from({length: need - chunk.length}, () => last))
    } else {
      // เกิน → ตัดตามทิศทาง
      const cut = chunk.length - need
      return cutMode === 'FROM'
        ? chunk.slice(cut) // ตัดหัว
        : chunk.slice(0, need) // ตัดท้าย (ค่าเริ่มต้น)
    }
  })

  // 7) ใส่กลับเป็นคีย์ 7.. ให้ครบ newHeaders
  const flat = rebuilt.flat().slice(0, newHeaders)
  flat.forEach((v, i) => (out[metaCount + i] = v))
  return out
}

// ORIGINAL KOM
// const trimRowByHeaderChange = (
//     oldHeaders: string[],
//     newHeaders: string[],
//     mode: 'FROM' | 'TO',
//     data: any[],
//     entryExit: number // 1 == entry, 2 == exit
// ) => {
//     const oldLength = oldHeaders.length;
//     const newLength = newHeaders.length;
//     const diff = oldLength - newLength;

//     if (diff <= 0) return data; // no trimming needed

//     // const groups = 4; // 4 groups of values
//     const groups = entryExit === 1 ? 4 : 2;
//     const totalKeysToRemove = diff * groups;

//     return data.map((row) => {
//         const newRow: any = {};
//         // copy keys 0–6
//         for (let i = 0; i <= 6; i++) {
//             newRow[i] = row[i];
//         }

//         // collect value blocks (grouped)
//         const values: string[] = [];
//         const valueStart = 7;
//         let keyIndex = valueStart;
//         while (row[keyIndex] !== undefined) {
//             values.push(row[keyIndex]);
//             keyIndex++;
//         }

//         if (mode === 'FROM') {
//             // remove from start
//             values.splice(0, totalKeysToRemove);
//         } else {
//             // remove from end
//             values.splice(values.length - totalKeysToRemove, totalKeysToRemove);
//         }

//         // assign trimmed values back to keys 7+
//         values.forEach((val, i) => {
//             newRow[i + 7] = val;
//         });

//         return newRow;
//     });
// };

// BANK DEV
// const trimRowByHeaderChange = (
//     oldHeaders: string[],
//     newHeaders: string[],
//     mode: 'FROM' | 'TO',
//     data: any[],
//     entryExit: number // 1 == entry, 2 == exit
// ) => {

//     function chunkIntoParts<T>(xs: T[], parts: number): T[][] {
//         const size = Math.ceil(xs.length / parts);
//         return Array.from({ length: parts }, (_, i) => xs.slice(i * size, (i + 1) * size));
//     }

//     const groups = entryExit === 1 ? 4 : 2;
//     // const out = chunkIntoParts(data, 4)

//     const oldLength = oldHeaders.length;
//     const newLength = newHeaders.length;
//     const diff = oldLength - newLength;

//     if (diff <= 0) return data; // no trimming needed

//     const totalKeysToRemove = diff * groups;

//     // return data.map((row) => {
//     //     const newRow: any = {};
//     //     // copy keys 0–6
//     //     for (let i = 0; i <= 6; i++) {
//     //         newRow[i] = row[i];
//     //     }

//     //     // collect value blocks (grouped)
//     //     let values: string[] = [];
//     //     const valueStart = 7;
//     //     let keyIndex = valueStart;
//     //     while (row[keyIndex] !== undefined) {
//     //         values.push(row[keyIndex]);
//     //         keyIndex++;
//     //     }

//     //     if (mode === 'FROM') {
//     //         const cutValues = chunkIntoParts(values, groups)
//     //         const baseCut = Math.floor(totalKeysToRemove / groups);
//     //         const extra = totalKeysToRemove % groups; // ส่วนเกินแจกให้ก้อนแรกๆ ทีละ 1
//     //         const ncutValues = cutValues.map((chunk, i) => {
//     //             const cut = baseCut + (i < extra ? 1 : 0); // กระจายส่วนเกิน
//     //             return chunk.slice(cut); // ใช้ slice เพื่อไม่ mutate ต้นฉบับ
//     //         });
//     //         values = ncutValues?.flat()
//     //     } else {
//     //         const cutValues = chunkIntoParts(values, groups)
//     //         const baseCut = Math.floor(totalKeysToRemove / groups);
//     //         const extra = totalKeysToRemove % groups;
//     //         const ncutValues = cutValues.map((chunk, i) => {
//     //             const cut = Math.min(chunk.length, baseCut + (i < extra ? 1 : 0)); // จำนวนที่จะตัดจากท้าย
//     //             const keepLen = Math.max(0, chunk.length - cut);                   // ความยาวที่เหลือ
//     //             return chunk.slice(0, keepLen);                                    // ← ตัดท้าย
//     //         });
//     //         values = ncutValues?.flat()
//     //     }

//     //     // assign trimmed values back to keys 7+
//     //     values.forEach((val, i) => {
//     //         newRow[i + 7] = val;
//     //     });

//     //     return newRow;
//     // });

//     let res_ = data.map((row) => {
//         const newRow: any = {};
//         // copy keys 0–6
//         for (let i = 0; i <= 6; i++) {
//             newRow[i] = row[i];
//         }

//         // collect value blocks (grouped)
//         let values: string[] = [];
//         const valueStart = 7;
//         let keyIndex = valueStart;
//         while (row[keyIndex] !== undefined) {
//             values.push(row[keyIndex]);
//             keyIndex++;
//         }

//         if (mode === 'FROM') {
//             const cutValues = chunkIntoParts(values, groups)
//             const baseCut = Math.floor(totalKeysToRemove / groups);
//             const extra = totalKeysToRemove % groups; // ส่วนเกินแจกให้ก้อนแรกๆ ทีละ 1
//             const ncutValues = cutValues.map((chunk, i) => {
//                 const cut = baseCut + (i < extra ? 1 : 0); // กระจายส่วนเกิน
//                 return chunk.slice(cut); // ใช้ slice เพื่อไม่ mutate ต้นฉบับ
//             });
//             values = ncutValues?.flat()
//         } else {
//             const cutValues = chunkIntoParts(values, groups)
//             const baseCut = Math.floor(totalKeysToRemove / groups);
//             const extra = totalKeysToRemove % groups;
//             const ncutValues = cutValues.map((chunk, i) => {
//                 const cut = Math.min(chunk.length, baseCut + (i < extra ? 1 : 0)); // จำนวนที่จะตัดจากท้าย
//                 const keepLen = Math.max(0, chunk.length - cut);                   // ความยาวที่เหลือ
//                 return chunk.slice(0, keepLen);                                    // ← ตัดท้าย
//             });
//             values = ncutValues?.flat()
//         }

//         // assign trimmed values back to keys 7+
//         values.forEach((val, i) => {
//             newRow[i + 7] = val;
//         });

//         return newRow;
//     });

//     return res_
// };

// *** กำลัง debug
// oldHeaders = ['01/03/2026', '01/04/2026', '01/05/2026', '01/06/2026', '01/07/2026', '01/08/2026', '01/09/2026', '01/10/2026', '01/11/2026', '01/12/2026', '01/01/2027', '01/02/2027', '01/03/2027', '01/04/2027']
// newHeaders = ['01/04/2027', '01/05/2027', '01/06/2027', '01/07/2027']
// mode = "FROM"
// data = [{0: 'Exit-A1', 5: '01/03/2026', 6: '01/04/2027', 7: '5000', 8: '5000', 9: '5000', 10: '5000', 11: '5000', 14: '5500', 15: '5500', 16: '5500', 17: '5500', 18: '5500', 19: '5500', 20: '208.333', 21: '208.333', 22: '208.333', 23: '208.333', 24: '208.333', 27: '229.166', 28: '229.166', 29: '229.166', 30: '229.166', 31: '229.166', 32: '229.166'}]
// entryExit = 2

// output ของ trimRowByHeaderChange ที่คาดว่าจะได้คือ
// output = {0: 'Exit-A1', 1: undefined, 2: undefined, 3: undefined, 4: undefined, 5: '01/03/2026', 6: '01/04/2027', 7: '5000', 8: '5000', 9: '5000', 10: '5000', 11: '229.166', 12: '229.166', 13: '229.166', 14: '229.166'}

// ---------- KOM V.2 ----------
// const trimRowByHeaderChange = (
//     oldHeaders: string[],
//     newHeaders: string[],
//     mode: 'FROM' | 'TO',
//     data: any[],
//     entryExit: number // 1 == entry, 2 == exit
// ) => {

//     const groups = entryExit === 1 ? 4 : 2;
//     const oldLength = oldHeaders.length;
//     const newLength = newHeaders.length;
//     const diff = oldLength - newLength;

//     // ไม่มีอะไรให้ตัด
//     if (diff <= 0) return data.map(r => ({ ...r }));

//     // จำนวนที่จะตัด "ต่อกลุ่ม" = diff (เพราะแต่ละกลุ่มมี oldLength ช่อง)
//     const cutPerGroup = Math.max(0, Math.min(diff, oldLength)); // กันเกิน

//     const META_COUNT = 7; // คอลัมน์เมตา 0..6

//     return data.map((row) => {
//         const newRow: any = {};

//         // คัดลอกเมตา
//         for (let i = 0; i < META_COUNT; i++) newRow[i] = row[i];

//         // ดึงค่าจริงตามจำนวนที่คาดหวัง (ถ้าขาด ให้หยุดที่มี)
//         const values: any[] = [];
//         for (let i = 0; i < groups * oldLength; i++) {
//             const v = row[META_COUNT + i];
//             if (v === undefined) break;
//             values.push(v);
//         }

//         // แบ่งเป็นกลุ่มละ oldLength (ตรงตำแหน่งแน่นอน)
//         const trimmedGroups: any[][] = [];
//         for (let g = 0; g < groups; g++) {
//             const start = g * oldLength;
//             const end = start + oldLength;
//             const chunk = values.slice(start, end);

//             let kept: any[];
//             if (mode === 'FROM') {
//                 kept = chunk.slice(cutPerGroup);                 // ตัดหัว
//             } else {
//                 kept = chunk.slice(0, Math.max(0, oldLength - cutPerGroup)); // ตัดท้าย
//             }
//             trimmedGroups.push(kept);
//         }

//         const flattened = trimmedGroups.flat();
//         // ใส่กลับตั้งแต่คีย์ 7
//         flattened.forEach((val, i) => {
//             newRow[META_COUNT + i] = val;
//         });

//         return newRow;
//     });
// };

// ---------- KOM V.3 ----------
const trimRowByHeaderChangeOld = (
  oldHeaders: string[],
  newHeaders: string[],
  mode: 'FROM' | 'TO',
  data: any[],
  entryExit: number // 1 == entry, 2 == exit
) => {
  const groups = entryExit === 1 ? 4 : 2
  const oldLength = oldHeaders.length
  const newLength = newHeaders.length
  const META_COUNT = 7

  if (newLength <= 0) return data.map((r) => ({...r}))

  return data.map((row) => {
    const newRow: any = {}

    // copy meta 0..6
    for (let i = 0; i < META_COUNT; i++) {
      newRow[i] = row[i]
    }

    const resultValues: any[] = []

    for (let g = 0; g < groups; g++) {
      const startKey = META_COUNT + g * oldLength
      const endKey = startKey + oldLength - 1

      // เก็บค่าที่มีจริงใน group นี้
      const existingValues: any[] = []
      for (let key = startKey; key <= endKey; key++) {
        if (row[key] !== undefined) {
          existingValues.push(row[key])
        }
      }

      let kept: any[] = []

      if (mode === 'FROM') {
        if (oldLength > newLength) {
          const diff = oldLength - newLength
          kept = existingValues.slice(diff)
        } else {
          // กลุ่มแรกเอาหัว กลุ่มถัดไปเอาท้าย เพื่อให้ตรง output ที่ต้องการ
          if (g === 0) {
            kept = existingValues.slice(0, newLength)
          } else {
            kept = existingValues.slice(-newLength)
          }
        }
      } else {
        // TO: กลุ่มแรกเอาท้าย กลุ่มถัดไปเอาหัว
        if (g === 0) {
          kept = existingValues.slice(-newLength)
        } else {
          kept = existingValues.slice(0, newLength)
        }
      }

      resultValues.push(...kept)
    }

    resultValues.forEach((val, idx) => {
      newRow[META_COUNT + idx] = val
    })

    return newRow
  })
}

const trimRowByHeaderChange = (
  oldHeaders: string[],
  newHeaders: string[],
  mode: 'FROM' | 'TO',
  data: any[],
  entryExit: number // 1 == entry, 2 == exit
) => {
  const groups = entryExit === 1 ? 4 : 2
  const oldLength = oldHeaders.length
  const newLength = newHeaders.length
  const META_COUNT = 7

  if (newLength <= 0) return data.map((r) => ({...r}))

  return data.map((row) => {
    const newRow: any = {}

    // copy meta 0..6
    for (let i = 0; i < META_COUNT; i++) {
      newRow[i] = row[i]
    }
    let runningKey = META_COUNT

    for (let g = 0; g < groups; g++) {
      const startKey = META_COUNT + g * oldLength
      const endKey = startKey + oldLength - 1
      // ช่วง key ของกลุ่มนี้ในแถวเดิม เช่น กลุ่ม 0 = 7..10, กลุ่ม 1 = 11..14
      const firstValue = row[startKey] // ค่าวันแรกของกลุ่ม ใช้เติมวันที่ใหม่ / ค่าว่าง
      const lastValue = row[endKey] // ค่าวันสุดท้ายของกลุ่ม ใช้เติมวันที่ใหม่ / ค่าว่าง
      const defaultValue = mode === 'FROM' ? firstValue : lastValue

      // เก็บค่าที่มีจริงใน group นี้
      const existingValues: any[] = []
      for (let key = startKey; key <= endKey; key++) {
        if (row[key] !== undefined) {
          existingValues.push(row[key])
        }
      }

      newHeaders.map((newHeader: any) => {
        const index = oldHeaders.findIndex((oldHeader: any) => oldHeader == newHeader)
        if (index > -1) {
          // วันที่นี้มีใน header เดิม → ใช้ค่าเดิมของวันนั้น
          const exitsValue = row[startKey + index]
          if (exitsValue) {
            newRow[runningKey] = exitsValue
          } else {
            // ค่าเดิมว่าง → เติมด้วยค่าวันสุดท้ายของกลุ่ม
            newRow[runningKey] = defaultValue
          }
        } else {
          // วันที่ใหม่ที่ยังไม่มีใน header เดิม → เติมด้วยค่าวันสุดท้ายของกลุ่ม
          newRow[runningKey] = defaultValue
        }
        runningKey++
      })
    }

    return newRow
  })
}

export const calculateSumEntries = (dataPostEntry: any) => {
  const sumEntries: any = {'0': 'Sum Entry'}

  if (dataPostEntry.length === 0) return sumEntries

  // หาคีย์สูงสุดจาก object แรก
  const maxKey = Math.max(
    ...Object.keys(dataPostEntry[0])
      .map(Number)
      .filter((key) => key >= 7)
  )

  for (let i = 7; i <= maxKey; i++) {
    let sum = 0

    dataPostEntry.forEach((entry: any) => {
      const val = parseFloat(entry[i]) || 0
      sum += val
    })

    // เก็บผลรวมไว้ 3 ทศนิยม
    sumEntries[i] = sum.toFixed(3)
  }

  return sumEntries
}

const toNumberSafeTwo = (v: any): number => {
  if (v == null) return 0
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0

  if (typeof v === 'string') {
    let s = v.trim()
    if (s === '' || s === '-' || s === '-' || s.toLowerCase() === 'nan') return 0

    let negative = false
    const m = s.match(/^\((.*)\)$/) // "(123)" = -123
    if (m) {
      negative = true
      s = m[1]
    }

    // ลบคอมมา + เว้นวรรคทั้งหมด (รวม NBSP) แล้วเก็บเฉพาะเลข/จุด/±/e
    s = s
      .replace(/,/g, '')
      .replace(/\s|\u00A0/g, '')
      .replace(/[^0-9.+\-eE]/g, '')
    const num = parseFloat(s)
    if (!Number.isFinite(num)) return 0
    return negative ? -num : num
  }

  return 0
}

export const calculateSumEntriesTwo = (dataPostEntry: any[]): Record<string, string> => {
  const sumEntries: Record<string, string> = {'0': 'Sum Entry'}
  if (!Array.isArray(dataPostEntry) || dataPostEntry.length === 0) return sumEntries

  // หา max key (เป็นเลข >= 7) จากทุกแถว เผื่อบางแถวยาวกว่า
  const allNumericKeys: number[] = []
  for (const row of dataPostEntry) {
    for (const k of Object.keys(row)) {
      const n = Number(k)
      if (Number.isFinite(n) && n >= 7) allNumericKeys.push(n)
    }
  }

  if (allNumericKeys.length === 0) return sumEntries

  const maxKey = Math.max(...allNumericKeys)

  for (let i = 7; i <= maxKey; i++) {
    let sum = 0
    for (const entry of dataPostEntry) {
      sum += toNumberSafeTwo(entry?.[i])
    }
    // เก็บเป็นสตริง 3 ทศนิยมตามที่ต้องการ
    sumEntries[String(i)] = sum.toFixed(3)
  }

  return sumEntries
}

// เอาไว้หาวัน start ที่น้อยที่สุด และวัน end ที่มากที่สุด
export const findDateRangeBooking = (data_entry: any, data_exit: any) => {
  // รวมข้อมูลทั้งหมด
  const allData = [...data_entry, ...data_exit]

  // ดึงวันที่จาก key["5"] และ key["6"]
  const startDates: any = allData.map((item) => item['5'])
  const endDates: any = allData.map((item) => item['6'])

  // แปลงเป็น Date แล้วหา min/max
  const minStartDate = new Date(Math.min(...startDates.map((d: any) => new Date(d.split('/').reverse().join('-')))))
  const maxEndDate = new Date(Math.max(...endDates.map((d: any) => new Date(d.split('/').reverse().join('-')))))

  // แปลงกลับเป็นรูปแบบ DD/MM/YYYY
  const formatDate = (date: any) => {
    const d = date.getDate().toString().padStart(2, '0')
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
  }

  return {
    minStartDate: formatDate(minStartDate),
    maxEndDate: formatDate(maxEndDate)
  }
}

// let sumEntries = {
//     "0": "Sum Entry", // เป็นคำนี้เสมอ
//     "7": ผลรวมของ dataPostEntry คีย์ 7
//     "8": ผลรวมของ dataPostEntry คีย์ 8
//     ...
//     จนคีย์สุดท้ายของ dataPostEntry
// }
export const calculateSumExit = (dataPostEntry: any) => {
  const sumEntries: any = {'0': 'Sum Exit'}

  if (dataPostEntry.length === 0) return sumEntries

  // หาคีย์สูงสุดจาก object แรก
  const maxKey = Math.max(
    ...Object.keys(dataPostEntry[0])
      .map(Number)
      .filter((key) => key >= 7)
  )

  for (let i = 7; i <= maxKey; i++) {
    let sum = 0

    dataPostEntry.forEach((entry: any) => {
      const val = parseFloat(entry[i]) || 0
      sum += val
    })

    // เก็บผลรวมไว้ 3 ทศนิยม
    sumEntries[i] = sum.toFixed(3)
  }

  return sumEntries
}

/**
 * รวมวันที่กับเวลาเข้าด้วยกันเป็น Date object
 * @param timeStr - เวลาในรูปแบบ 'HH:mm' เช่น '07:51'
 * @param dateInput - วันที่ในรูปแบบ Date หรือ string
 * @returns Date object ที่รวมวันและเวลา
 */
export const convertTimeStringToDate = (timeStr: string, dateInput?: Date | string): Date => {
  const dateFormatted = dayjs().format('YYYY-MM-DD')
  // ตรงนี้ไม่ต้องใช้ toDayjs
  const combined = dayjs(`${dateFormatted} ${timeStr}`, 'YYYY-MM-DD HH:mm')
  return combined.toDate()
}

type ResData = {
  gas_day: string
  nomPoint: {
    point: string
    data: {
      gas_day: string
      shipper_id: string
      shipper_name: string
      allocatedValue: number
    }[]
  }[]
}

export const underDevelopment = () => {
  toast.warning('Under development...', {
    position: 'bottom-right',
    autoClose: 3000,
    // hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined
  })
}

// ############### EVENT DOWNLOAD PDF  TSO VIEW Offspec ###############
export const handleDownloadPDFTsoView = async (doc_no: any, document_id: any, user_id: any, shipper_id: any) => {
  try {
    const res_pdf = await getServiceArrayBuffer(`/master/event/offspec-gas/${doc_no}/pdf/tsoview/${document_id}?userId=${user_id ? user_id : '0'}&shipperId=${shipper_id}`)
    const blob = new Blob([res_pdf.data], {type: 'application/pdf'})

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document_${document_id}.pdf` // ตั้งชื่อไฟล์
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  } catch (err) {
    // Download error
  }
}

// ############### EVENT DOWNLOAD PDF  TSO VIEW EMERGENCY ###############
export const handleDownloadPDFTsoViewEmer = async (doc_no: any, document_id: any, user_id: any, shipper_id: any) => {
  try {
    // master/event/emer/doc39/pdf/tsoview/30?userId=0&shipperId=62
    const res_pdf = await getServiceArrayBuffer(`/master/event/emer/${doc_no}/pdf/tsoview/${document_id}?userId=${user_id ? user_id : '0'}&shipperId=${shipper_id}`)
    const blob = new Blob([res_pdf.data], {type: 'application/pdf'})

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document_${document_id}.pdf` // ตั้งชื่อไฟล์
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  } catch (err) {
    // Download error
  }
}

// ############### EVENT DOWNLOAD PDF  TSO VIEW OF/IF ###############
export const handleDownloadPDFTsoViewOfIf = async (doc_no: any, document_id: any, user_id: any, shipper_id: any) => {
  try {
    // master/event/emer/doc39/pdf/tsoview/30?userId=0&shipperId=62
    const res_pdf = await getServiceArrayBuffer(`/master/event/ofo/${doc_no}/pdf/tsoview/${document_id}?userId=${user_id ? user_id : '0'}&shipperId=${shipper_id}`)
    const blob = new Blob([res_pdf.data], {type: 'application/pdf'})

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document_${document_id}.pdf` // ตั้งชื่อไฟล์
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  } catch (err) {
    // Download error
  }
}

// ############### EVENT DOWNLOAD PDF OR ZIP IN MAIN TABLE ###############
export const handleDownloadPDF = async (doc_no: any, document_id: any) => {
  try {
    const res_pdf = await getServiceArrayBuffer(`/master/event/offspec-gas/${doc_no}/pdf/${document_id}`)
    const buffer = new Uint8Array(res_pdf.data)
    let fileExtension = 'bin' // fallback
    let mimeType = 'application/octet-stream'

    // ถ้ามี content-type
    const contentType = res_pdf.headers?.['content-type']
    if (contentType === 'application/pdf') {
      fileExtension = 'pdf'
      mimeType = 'application/pdf'
    } else if (contentType === 'application/zip' || contentType === 'application/x-zip-compressed') {
      fileExtension = 'zip'
      mimeType = 'application/zip'
    } else {
      // ใช้ magic number เดา
      if (buffer[0] === 0x25 && buffer[1] === 0x50) {
        // %PDF
        fileExtension = 'pdf'
        mimeType = 'application/pdf'
      } else if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
        // PK = ZIP
        fileExtension = 'zip'
        mimeType = 'application/zip'
      }
    }

    const blob = new Blob([buffer], {type: mimeType})
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `document_${document_id}.${fileExtension}`

    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  } catch (err) {
    // Download error
  }
}

// ############### EVENT DOWNLOAD PDF OR ZIP IN MAIN TABLE EMERGENCY ###############
export const handleDownloadPDFEmer = async (doc_no: any, document_id: any) => {
  try {
    const res_pdf = await getServiceArrayBuffer(`/master/event/emer/${doc_no}/pdf/${document_id}`)

    const buffer = new Uint8Array(res_pdf.data)
    let fileExtension = 'bin' // fallback
    let mimeType = 'application/octet-stream'

    // ถ้ามี content-type
    const contentType = res_pdf.headers?.['content-type']
    if (contentType === 'application/pdf') {
      fileExtension = 'pdf'
      mimeType = 'application/pdf'
    } else if (contentType === 'application/zip' || contentType === 'application/x-zip-compressed') {
      fileExtension = 'zip'
      mimeType = 'application/zip'
    } else {
      // ใช้ magic number เดา
      if (buffer[0] === 0x25 && buffer[1] === 0x50) {
        // %PDF
        fileExtension = 'pdf'
        mimeType = 'application/pdf'
      } else if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
        // PK = ZIP
        fileExtension = 'zip'
        mimeType = 'application/zip'
      }
    }

    const blob = new Blob([buffer], {type: mimeType})
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    // a.download = `document_${document_id}.${fileExtension}`;
    a.download = `${dayjs().format('YYYY')}_EMER_${pad4(document_id)}.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  } catch (err) {
    // Download error
  }
}

// ############### EVENT DOWNLOAD PDF OR ZIP IN MAIN TABLE OF/IF ###############
export const handleDownloadPDFOfIf = async (doc_no: any, document_id: any) => {
  try {
    const res_pdf = await getServiceArrayBuffer(`/master/event/ofo/${doc_no}/pdf/${document_id}`)
    const buffer = new Uint8Array(res_pdf.data)
    let fileExtension = 'bin' // fallback
    let mimeType = 'application/octet-stream'

    // ถ้ามี content-type
    const contentType = res_pdf.headers?.['content-type']
    if (contentType === 'application/pdf') {
      fileExtension = 'pdf'
      mimeType = 'application/pdf'
    } else if (contentType === 'application/zip' || contentType === 'application/x-zip-compressed') {
      fileExtension = 'zip'
      mimeType = 'application/zip'
    } else {
      // ใช้ magic number เดา
      if (buffer[0] === 0x25 && buffer[1] === 0x50) {
        // %PDF
        fileExtension = 'pdf'
        mimeType = 'application/pdf'
      } else if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
        // PK = ZIP
        fileExtension = 'zip'
        mimeType = 'application/zip'
      }
    }

    const blob = new Blob([buffer], {type: mimeType})
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    // a.download = `document_${doc_no}.${fileExtension}`;
    a.download = `${dayjs().format('YYYY')}_OFIF_${pad4(document_id)}.${fileExtension}`
    document.body.appendChild(a)
    a.click()
    a.remove()

    URL.revokeObjectURL(url)
  } catch (err) {
    // Download error
  }
}

// ############### EVENT นับจำนวน shipper acknowledge ###############
// "1/2"
// (เลขหน้านับจาก event_doc_status_id == 5 ของ group_id เดียวกันจากทุก array ถ้าเป็น 5 หมด นับเป็น 1 )
// (เลขหลังนับจาก array group_id เดียวกัน นับเป็น 1)
export const getAcknowledgeStatus = (docArray: any) => {
  const only_shipper_data = docArray?.filter((item: any) => item?.user_type_id !== 2)

  // จัดกลุ่มตาม group_id
  const groups: any = only_shipper_data.reduce((acc: any, item: any) => {
    const key = item.group_id
    acc[key] = acc[key] || []
    acc[key].push(item)
    return acc
  }, {})

  let totalGroups = 0
  let fullyAcknowledgedGroups = 0

  let group: any
  for (group of Object.values(groups)) {
    totalGroups += 1
    const allStatus5 = group.every((item: any) => item.event_doc_status_id === 5) // เอาแค่ acknowledge
    if (allStatus5) fullyAcknowledgedGroups += 1
  }

  return `${fullyAcknowledgedGroups}/${totalGroups}`
}

// เอาไว้แปลงตอนโหลด pdf
// export const hexToUint8Array = (hex: string) => {
//     const bytes = new Uint8Array(hex.length / 2);
//     for (let i = 0; i < hex.length; i += 2) {
//         bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
//     }
//     return bytes;
// };

/**
 * รวม point จาก res_data (array) แล้วกรอง shipper ซ้ำ
 * @param resArr  อาร์เรย์ของ ResData
 * @returns       อาร์เรย์ตามรูปแบบ output ที่ต้องการ
 */
export const transformNomPointData = (resArr: ResData[]) => {
  const pointMap = new Map<
    string, // point
    Map<
      string,
      {
        // shipper_id → object
        name: string
        id_name: string
      }
    >
  >()

  // วนทุกก้อนใน res_data
  resArr.forEach(({nomPoint}) => {
    nomPoint.forEach(({point, data}) => {
      // เตรียม Map สำหรับ point นี้ (ถ้ายังไม่มี)
      if (!pointMap.has(point)) {
        pointMap.set(point, new Map())
      }
      const shipperMap = pointMap.get(point)!

      // วน shipper ใต้ point นั้น ๆ
      data.forEach(({shipper_id, shipper_name}) => {
        // กรองซ้ำด้วย shipper_id
        if (!shipperMap.has(shipper_id)) {
          shipperMap.set(shipper_id, {
            name: shipper_name,
            id_name: shipper_id
          })
        }
      })
    })
  })

  // แปลงเป็นอาร์เรย์ผลลัพธ์
  return Array.from(pointMap.entries()).map(([point, shippers]) => ({
    point,
    shipper: Array.from(shippers.values())
  }))
}

export const filterPointsByShipperId = (masterNomPoint2: any, idList: any) => {
  return masterNomPoint2.filter((pointItem: any) => pointItem.shipper.some((shipper: any) => idList.includes(shipper.id_name)))
}

export const filterNomPointMasterData = (filtered: any, nomPointMasterData: any) => {
  const filteredPoints = new Set(filtered.map((item: any) => item.point))
  return nomPointMasterData.filter((np: any) => filteredPoints.has(np.nomination_point))
}

// แปลงคีย์ metering checking จากเดิมเริ่ม 00:00 - 23:00 เป็น 01:00 - 24:00
export const shiftTimeKeys = (data: any) => {
  return data.map((row: any) => {
    const newRow: any = {}

    for (const key in row) {
      const value = row[key]

      // ตรวจสอบว่า key เป็นเวลาหรือไม่ (รูปแบบ HH:00)
      const match = key.match(/^(\d{2}):00$/)
      if (match) {
        let hour = parseInt(match[1], 10)
        if (hour >= 0 && hour <= 23) {
          const newHour = (hour + 1).toString().padStart(2, '0') // shift +1
          const newKey = `${newHour}:00`
          newRow[newKey] = value
        } else {
          // เวลาเกินขอบเขต → ข้าม
        }
      } else {
        // ไม่ใช่ key เวลา → คงไว้เดิม
        newRow[key] = value
      }
    }

    return newRow
  })
}

export const mapShipperData = (data_post: any, data_post_real: any) => {
  // รวม key จาก shipper ทุกตัวใน data_post_real
  const keysAllowed = data_post_real.shipper.reduce((acc: any, shipperObj: any) => {
    Object.keys(shipperObj).forEach((key) => {
      if (!acc.includes(key)) acc.push(key)
    })
    return acc
  }, [] as string[])

  // ตรวจเครื่องหมายของ energyAdjust ใน valuesData
  const signCheck = Math.sign(data_post.valuesData.energyAdjust)

  const mappedShipper = data_post.shipperData.reduce((acc: any[], s: any) => {
    // ถ้า energyAdjust ไม่ใช่ null และ sign ไม่ตรง -> ข้าม
    if (s.energyAdjust !== null && Math.sign(s.energyAdjust) !== signCheck) {
      return acc
    }

    let obj: any = {}
    let energyAdjustVal: number | null = null

    keysAllowed.forEach((k: any) => {
      if (k === 'energyAdjust' || k === 'accImb_or_accImbInv' || k === 'volumeAdjust' || k === 'volumeAdjustRate_mmscfd' || k === 'volumeAdjustRate_mmscfh') {
        const val = parseInt(s[k])
        const safeVal = Number.isNaN(val) ? null : val
        obj[k] = safeVal
        if (k === 'energyAdjust') {
          energyAdjustVal = safeVal
        }
      } else {
        obj[k] = s[k] ?? null
      }
    })

    // ถ้า energyAdjust เป็น null -> ไม่ push
    if (energyAdjustVal !== null) {
      acc.push(obj)
    }

    return acc
  }, [])

  // คืนค่าข้อมูลใหม่
  return {
    ...data_post_real,
    shipper: mappedShipper
  }
}

// เอาไว้หา execute timestamp ล่าสุด
export const getLatestByExecuteTimestamp = (data: any) => {
  if (!data || data.length === 0) return null
  return data.reduce((latest: any, item: any) => (item.execute_timestamp > latest.execute_timestamp ? item : latest))
}

// ใช้หน้า detail --> tariff charge report
// export const calcTotalTariffDetail = (data: any) => {
//     return data.reduce(
//         (acc: any, cur: any) => {
//             acc.fee += Number(cur.fee ?? 0);
//             acc.amount += Number(cur.amount ?? 0);
//             acc.amount_operator += Number(cur.amount_operator ?? 0);
//             acc.amount_compare += Number(cur.amount_compare ?? 0);
//             acc.difference += Number(cur.difference ?? 0);
//             return acc;
//         },
//         { amount: 0, amount_operator: 0, amount_compare: 0, difference: 0 }
//     );
// }

const toNumber_ = (value: any) => {
  const num = Number(
    String(value ?? 0)
      .replace(/,/g, '')
      .trim()
  )
  return Number.isNaN(num) ? 0 : num
}

const toCents_ = (value: any) => {
  return Math.round((toNumber_(value) + Number.EPSILON) * 100)
}

export const calcTotalTariffDetail = (data: any[]) => {
  const total = data.reduce(
    (acc: any, cur: any) => {
      acc.fee += toNumber_(cur.fee)

      // amount ให้ round เป็น 2 ตำแหน่งก่อนรวม
      acc.amountCents += toCents_(cur.amount)

      acc.amount_operator += toNumber_(cur.amount_operator)
      acc.amount_compare += toNumber_(cur.amount_compare)
      acc.difference += toNumber_(cur.difference)

      return acc
    },
    {
      fee: 0,
      amountCents: 0,
      amount_operator: 0,
      amount_compare: 0,
      difference: 0
    }
  )

  return {
    fee: total.fee,
    amount: total.amountCents / 100,
    amount_operator: Number(total.amount_operator.toFixed(2)),
    amount_compare: Number(total.amount_compare.toFixed(2)),
    difference: Number(total.difference.toFixed(2))
  }
}

// export const calcTotalTariffDetail = (data: any[]) => {
//   const total = data.reduce(
//     (acc: any, cur: any) => {
//       acc.fee += Number(cur.fee ?? 0);
//       acc.amount += Number(cur.amount ?? 0);
//       acc.amount_operator += Number(cur.amount_operator ?? 0);
//       acc.amount_compare += Number(cur.amount_compare ?? 0);
//       acc.difference += Number(cur.difference ?? 0);

//       return acc;
//     },
//     {
//       fee: 0,
//       amount: 0,
//       amount_operator: 0,
//       amount_compare: 0,
//       difference: 0,
//     }
//   );
//   console.log('total : ', total);
//   return {
//     ...total,
//     amount: Number(total.amount.toFixed(2)),
//   };
// };

// เอา sort_revise_path.paths.revised_capacity_path.area.name มาใส่คีย์ใหม่เป็นชื่อ path_name : "A1-E-F2-G-X3"
// แต่การเรียงต้องดูจาก sort_revise_path.paths.revised_capacity_path_edges ตาม source_id และ target_id
// โดย source_id และ target_id คือ id ของ sort_revise_path.paths.revised_capacity_path.area.id
type RevPathNode = {
  id: number
  area_id: number
  revised_capacity_path_type_id: number
  area: {id: number; name: string}
}

type Edge = {id: number; source_id: number; target_id: number}

export const addPathName = (list: any[]) => {
  return list.map((item) => {
    const nodes: RevPathNode[] = item?.paths?.revised_capacity_path ?? []
    const edges: Edge[] = item?.paths?.revised_capacity_path_edges ?? []
    const exitId: number | undefined = item?.exit_id_temp

    // --- สร้าง map ต่าง ๆ ---
    const idToName = new Map<number, string>() // areaId -> name
    const idToNode = new Map<number, RevPathNode>() // areaId -> node object
    const allAreaIds: number[] = []

    nodes.forEach((n) => {
      const aid = n.area.id
      idToName.set(aid, n.area.name)
      idToNode.set(aid, n)
      allAreaIds.push(aid)
    })

    const next = new Map<number, number>() // source -> target
    const prev = new Map<number, number>() // target -> source
    edges.forEach((e) => {
      next.set(e.source_id, e.target_id)
      prev.set(e.target_id, e.source_id)
    })

    // --- หา head (จุดเริ่มของเส้นทางตามกราฟ) ---
    let head: number | undefined
    const sources: any = new Set<number>(edges.map((e) => e.source_id))
    const targets = new Set<number>(edges.map((e) => e.target_id))
    head = [...sources].find((s) => !targets.has(s))

    // fallback: ถ้าหา head ไม่ได้ (เช่นกราฟวน), ใช้ area แรก ๆ
    if (head === undefined && allAreaIds.length) head = allAreaIds[0]

    // --- เดินไปข้างหน้าเอาลำดับเต็มตามกราฟ ---
    const forwardOrder: number[] = []
    const seen = new Set<number>()
    let cur = head

    while (cur !== undefined && !seen.has(cur)) {
      seen.add(cur)
      forwardOrder.push(cur)
      cur = next.get(cur)
    }

    // กรณีมี node โดด ๆ ที่ไม่ได้อยู่ใน edges ให้ต่อท้าย (ตามเดิม)
    if (forwardOrder.length < allAreaIds.length) {
      const missing = allAreaIds.filter((id) => !seen.has(id))
      forwardOrder.push(...missing)
    }

    // --- ถ้ามี exit_id_temp ให้ "หมุน" ลิสต์ให้เริ่มที่จุดนั้น (คงทิศทางเดิม) ---
    let orderedByAnchor = forwardOrder
    if (exitId && idToName.has(exitId)) {
      const idx = forwardOrder.indexOf(exitId)
      if (idx >= 0) {
        orderedByAnchor = [...forwardOrder.slice(idx), ...forwardOrder.slice(0, idx)]
      }
    }

    // --- สร้าง path_name ---
    const pathName = orderedByAnchor
      .map((id) => idToName.get(id))
      .filter(Boolean)
      .join('-')

    // --- เรียง revised_capacity_path ตามลำดับที่คำนวณได้ ---
    const sortedNodes = orderedByAnchor.map((id) => idToNode.get(id)).filter(Boolean) as RevPathNode[]

    return {
      ...item,
      path_name: pathName,
      paths: {
        ...item.paths,
        revised_capacity_path: sortedNodes // เรียงใหม่ตามกราฟแล้ว
      }
    }
  })
}

export const addPathNameTest = (list: any[]) => {
  return (list ?? []).map((item) => {
    const exitId: number | undefined = item?.exit_id_temp

    const newPathConfigs = (item?.pathConfigs ?? []).map((cfg: any) => {
      const nodes: RevPathNode[] = cfg?.revised_capacity_path ?? []
      const edges: Edge[] = cfg?.revised_capacity_path_edges ?? []

      // --- สร้าง map ต่าง ๆ ---
      const idToName = new Map<number, string>() // areaId -> name
      const idToNode = new Map<number, RevPathNode>() // areaId -> node object
      const allAreaIds: number[] = []

      nodes.forEach((n) => {
        const aid = n?.area?.id
        if (aid != null) {
          idToName.set(aid, n.area.name)
          idToNode.set(aid, n)
          allAreaIds.push(aid)
        }
      })

      const next = new Map<number, number>() // source -> target
      const prev = new Map<number, number>() // target -> source
      edges.forEach((e) => {
        if (e?.source_id != null && e?.target_id != null) {
          next.set(e.source_id, e.target_id)
          prev.set(e.target_id, e.source_id)
        }
      })

      // --- หา head (จุดเริ่มตามกราฟ) ---
      let head: number | undefined
      const sources: any = new Set<number>(edges.map((e: Edge) => e.source_id))
      const targets = new Set<number>(edges.map((e: Edge) => e.target_id))
      head = [...sources].find((s) => !targets.has(s))

      // fallback: ถ้าหา head ไม่ได้ (กราฟวน/ข้อมูลไม่ครบ) ใช้ node แรก
      if (head === undefined && allAreaIds.length) head = allAreaIds[0]

      // --- เดินตามกราฟไปข้างหน้าเพื่อได้ลำดับเต็ม ---
      const forwardOrder: number[] = []
      const seen = new Set<number>()
      let cur = head

      while (cur !== undefined && !seen.has(cur)) {
        seen.add(cur)
        forwardOrder.push(cur)
        cur = next.get(cur)
      }

      // เผื่อมี node ที่ไม่ได้ถูกพาด้วย edges ให้ต่อท้าย
      if (forwardOrder.length < allAreaIds.length) {
        const missing = allAreaIds.filter((id) => !seen.has(id))
        forwardOrder.push(...missing)
      }

      // --- หมุนลิสต์ให้เริ่มที่ exitId (anchor) ถ้ามี ---
      let orderedByAnchor = forwardOrder
      if (exitId && idToName.has(exitId)) {
        const idx = forwardOrder.indexOf(exitId)
        if (idx >= 0) {
          orderedByAnchor = [...forwardOrder.slice(idx), ...forwardOrder.slice(0, idx)]
        }
      }

      // --- path_name ของ config นี้ ---
      const path_name = orderedByAnchor
        .map((id) => idToName.get(id))
        .filter(Boolean)
        .join('-')

      // --- เรียง nodes ของ config นี้ตามลำดับที่คำนวณได้ ---
      const sortedNodes = orderedByAnchor.map((id) => idToNode.get(id)).filter(Boolean) as RevPathNode[]

      // คืน config เดิม แต่เพิ่ม path_name และอัปเดตลำดับ revised_capacity_path
      return {
        ...cfg,
        path_name,
        revised_capacity_path: sortedNodes
      }
    })

    // คืน item เดิม แต่แทนที่ pathConfigs ด้วยของที่คำนวณแล้ว
    // (ไม่ไปยุ่ง field อื่น ๆ)
    return {
      ...item,
      pathConfigs: newPathConfigs
    }
  })
}

// PATH MANAGEMENT เรียง node กับ edges
type PathItem = {
  id: number
  area_id: number
  revised_capacity_path_type_id: number
}

type Edges = {
  id: number
  source_id: number
  target_id: number
}

type PathConfig = {
  id: number | string
  path_no: string
  revised_capacity_path: PathItem[]
  revised_capacity_path_edges: Edges[]
}

type AreaBlock = {
  id: number | string
  name: string
  pathConfigs: PathConfig[]
}

export const sortRevisedCapacityPathBlocks = (blocks: AreaBlock[]): AreaBlock[] => {
  return (blocks ?? []).map((block) => ({
    ...block,
    pathConfigs: (block.pathConfigs ?? []).map((cfg) => {
      const items = cfg?.revised_capacity_path ?? []
      const edges = cfg?.revised_capacity_path_edges ?? []

      if (!items.length || !edges.length) {
        // ยังบ sorting ไม่ได้ (ไม่มี item หรือ edge) — แต่อยากคง rule ข้อ 1 ไว้
        const type1Idx = items.findIndex((it) => it?.revised_capacity_path_type_id === 1)
        if (type1Idx > 0) {
          const arr = [...items]
          const [type1] = arr.splice(type1Idx, 1)
          arr.unshift(type1)
          return {...cfg, revised_capacity_path: arr}
        }
        return cfg
      }

      // map area_id -> item
      const itemByArea = new Map<number, PathItem>(items?.map((it) => [it.area_id, it]))

      // สร้าง next map และชุด source/target
      const next = new Map<number, number>()
      const sources: any = new Set<number>()
      const targets = new Set<number>()
      for (const e of edges) {
        if (e?.source_id != null && e?.target_id != null) {
          next.set(e.source_id, e.target_id)
          sources.add(e.source_id)
          targets.add(e.target_id)
        }
      }

      // หา "หัวเส้นทาง" = source ที่ไม่เคยเป็น target
      let start: number | undefined = [...sources]?.find((s) => !targets.has(s))

      // ถ้าไม่เจอ start ให้ fallback เป็น node ที่ type_id == 1
      const type1Item = items?.find((it) => it.revised_capacity_path_type_id === 1)
      const type1AreaId = type1Item?.area_id
      if (start == null && type1AreaId != null) start = type1AreaId

      // เดินตามเส้นทาง start -> next -> next -> ...
      const orderAreaIds: number[] = []
      const visited = new Set<number>()
      let cur = start

      while (cur != null && !visited.has(cur)) {
        visited.add(cur)
        orderAreaIds.push(cur)
        cur = next.get(cur)
      }

      // เผื่อมี node ที่ไม่ถูกเชื่อมใน edges — ใส่ต่อท้ายตามลำดับเดิม
      for (const it of items) {
        if (!orderAreaIds?.includes(it.area_id)) orderAreaIds.push(it.area_id)
      }

      // บังคับให้ node type_id==1 อยู่หน้าเสมอ (ถ้าไม่ได้อยู่หน้าแล้ว)
      if (type1AreaId != null) {
        const idx = orderAreaIds?.indexOf(type1AreaId)
        if (idx > 0) {
          orderAreaIds?.splice(idx, 1)
          orderAreaIds?.unshift(type1AreaId)
        }
      }

      // สร้างลิสต์ item ตามลำดับ area_id ที่คำนวณได้
      const sortedItems = orderAreaIds?.map((aid) => itemByArea.get(aid))?.filter(Boolean) as PathItem[]

      return {...cfg, revised_capacity_path: sortedItems}
    })
  }))
}

// ใช้เช็คตอน edit หน้า capacity management ว่าค่าของ entry และ exit เท่ากันหรือไม่
export const compareFromKey7 = (entryObj: any, exitObj: any) => {
  // หา key ที่ ≥ 7 ในแต่ละ object
  const entryKeys = Object.keys(entryObj).filter((k) => Number(k) >= 7)
  const exitKeys = Object.keys(exitObj).filter((k) => Number(k) >= 7)

  // รวม key ทั้งหมด (ไม่ให้ตกหล่นเพราะยาวไม่เท่ากัน)
  const allKeys = Array.from(new Set([...entryKeys, ...exitKeys]))

  // ตรวจสอบทีละ key
  for (const key of allKeys) {
    const valEntry = entryObj[key]
    const valExit = exitObj[key]
    if (valEntry !== valExit) {
      return false // เจอซักค่าที่ไม่ตรง → false ทันที
    }
  }

  return true // ถ้าครบ loop แล้วยังไม่ false → ทุกค่าตรง
}

const toNumberSafe = (v: any): number | null => {
  // รองรับกรณีเป็นอ็อบเจกต์ { value: " 12,500.000 " }
  if (v && typeof v === 'object' && 'value' in v) v = (v as any).value

  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v !== 'string') return null

  const s = v.trim().replace(/,/g, '') // ตัด space + ลบคอมมา
  if (s === '' || s === '-') return null // กันค่าว่าง/ขีด
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

// ใช้หน้า capacity management สำหรับรวม dataPostEntry และ dataPostExit
// เพื่อเช็คว่าค่าเท่ากันหรือไม่ ถ้าไม่ จะได้ไม่ post ไป
export const sumFromKey7 = (arr: any[]) => {
  const result: Record<string, number> = {}

  for (const obj of arr ?? []) {
    for (const k of Object.keys(obj ?? {})) {
      const keyNum = Number(k)
      if (!Number.isFinite(keyNum) || keyNum < 7) continue

      const n = toNumberSafe(obj[k])
      if (n != null) {
        result[k] = (result[k] || 0) + n
      }
    }
  }
  return result
}

export const sumFromKey7AllKey = (arr: any[]) => {
  return arr.reduce((sum, obj) => {
    const keys = Object.keys(obj).filter((k) => Number(k) >= 7)
    for (const key of keys) {
      const val = parseFloat(obj[key])
      if (!isNaN(val)) {
        sum += val
      }
    }
    return sum
  }, 0)
}

// ใช้กับหน้า releaseCapSubmission
type Contract = {
  terminate_date?: string | null
  extend_date?: string | null // เผื่อบางชุดใช้ extend_date
  extend_deadline?: string | null // ตัวอย่างใน data ใช้คีย์นี้
  contract_end_date?: string | null
  [k: string]: any
}

// เช็ค >
const isPast = (dateStr?: string | null) => {
  if (!dateStr) return false
  const d = dayjs(dateStr)
  if (!d.isValid()) return false
  // today > date ?  → เทียบระดับ "วัน" แบบ local time
  return d.isBefore(dayjs(), 'day')
}

// เช็ค >=
const isExpired = (dateStr?: string | null) => {
  if (!dateStr) return false
  const d = dayjs(dateStr)
  if (!d.isValid()) return false
  const today = dayjs()
  return d.isSame(today, 'day') || d.isBefore(today, 'day') // ← inclusive
}

export const shouldFilterOut = (c: Contract) => {
  // 1) priority: terminate_date
  if (c.terminate_date && isPast(c.terminate_date)) return true
  // if (c.terminate_date && isExpired(c.terminate_date)) return true;

  // 2) priority: extend_date / extend_deadline (รองรับทั้งสองชื่อคีย์)
  const extendDate = c.extend_date ?? c.extend_deadline
  if (extendDate && isPast(extendDate)) return true
  // if (extendDate && isExpired(extendDate)) return true;

  // 3) priority: contract_end_date
  if (c.contract_end_date && isPast(c.contract_end_date)) return true
  // if (c.contract_end_date && isExpired(c.contract_end_date)) return true;

  return false // ถ้าไม่เข้าเงื่อนไข ไม่ต้องกรองออก
}

// check create overlap ของ planning deadline
type Row = {
  term_type_id: number
  start_date: string | Date
  end_date: string | Date | null
  id?: number | string
}
type Payload = Row
const INF = dayjs('9999-12-31') // ใช้แทนอนันต์เมื่อ end_date เป็น null

function toRange(start: string | Date, end: string | Date | null) {
  const s = dayjs(start).startOf('day')
  // ถ้า end เป็น null → ใช้ INF, ถ้าไม่ null ให้ตีความเป็น inclusive แล้ว +1 วันเป็น exclusive
  const e = end ? dayjs(end).startOf('day').add(1, 'day') : INF
  return {s, e}
}

// ช่วง A กับ B ซ้อนกันถ้าและเฉพาะถ้า: A.start < B.end && B.start < A.end
function isOverlap(a: {s: dayjs.Dayjs; e: dayjs.Dayjs}, b: {s: dayjs.Dayjs; e: dayjs.Dayjs}) {
  return a.s.isBefore(b.e) && b.s.isBefore(a.e)
}

/**
 * เช็ค overlap
 * return { ok: boolean, reason?: string, conflicts?: (id|index)[] }
 */
const sameId = (a: any, b: any) => a !== null && a !== undefined && b !== null && b !== undefined && a === b

export function canCreateByTermAndRange(payload: Payload, dataTable_: Row[], payloadId: any) {
  const sameTerm = dataTable_.filter((r) => r.term_type_id === payload.term_type_id)

  // ถ้ามีเรคคอร์ด term เดียวกันที่ end_date เป็น null → บล็อก
  // const openEnded = sameTerm.find(r => r.end_date == null);
  // if (openEnded) {
  //     return {
  //         ok: false,
  //         // reason: `มีเรคคอร์ด term_type_id=${payload.term_type_id} ที่ไม่มี end_date (id=${openEnded.id ?? "?"})`,
  //         reason: `Start Date and End Date should not overlap`,
  //         conflicts: [openEnded.id ?? dataTable_.indexOf(openEnded)],
  //     };
  // }

  // ถ้ามีเรคคอร์ด term เดียวกันที่ end_date เป็น null → บล็อก
  // ยกเว้นกรณี payload.end_date < openEnded.start_date (ไม่คาบเกี่ยว) หรือเป็นเรคคอร์ดเดียวกัน
  const openEnded = sameTerm?.find((r) => r.end_date == null && !sameId(r.id, payloadId))
  if (openEnded) {
    const pe = payload.end_date ? dayjs(payload.end_date) : null
    const os = dayjs(openEnded.start_date)

    // ไม่คาบเกี่ยวเมื่อ payload.end_date < openEnded.start_date (strict before)
    const safeNoOverlap = !!pe && pe.isBefore(os, 'day')

    if (!safeNoOverlap) {
      return {
        ok: false,
        reason: `Start Date and End Date should not overlap 1`,
        conflicts: [openEnded.id ?? dataTable_.indexOf(openEnded)]
      }
    }
    // else: ผ่านได้ (ปล่อยให้ไปเช็คส่วนอื่นต่อ)
  }

  // ช่วงของ payload
  const pr = toRange(payload.start_date, payload.end_date)
  const withoutPayloadTerm = sameTerm?.filter((itemx: any) => itemx?.id !== payloadId)

  // หาเรคคอร์ดที่ซ้อนทับ
  const conflictIds: (number | string)[] = []
  // for (const r of sameTerm) {
  for (const r of withoutPayloadTerm) {
    const rr = toRange(r.start_date, r.end_date) // ช่วงของ term ที่เอามาเทียบ
    if (isOverlap(pr, rr)) {
      conflictIds.push(r.id ?? dataTable_.indexOf(r))
    }
  }

  if (conflictIds.length > 0) {
    return {
      ok: false,
      // reason: `ช่วงวันที่ของ payload ซ้อนทับกับเรคคอร์ด term_type_id=${payload.term_type_id}`,
      reason: `Start Date and End Date should not overlap 2`,
      conflicts: conflictIds
    }
  }

  return {ok: true}
}

// ใช้กับหน้า shipper nomination report tab daily/weekly
type WeeklyDay = {
  gas_day: string
  gas_day_text: string
  capacityRightMMBTUD: number
  nominatedValueMMBTUD: number
  overusageMMBTUD: number
  imbalanceMMBTUD: number
}

export function liftWeeklyForDate<T extends {nomination_type?: any; weeklyDay?: Record<string, WeeklyDay>; dataRow?: any}>(arr: T[], localDate: string): T[] {
  const localDayjs = dayjs(localDate)
  const dayOfWeek = localDayjs.isValid() ? parseInt(localDayjs.format('d')) : null // The day of the week, with Sunday as 0

  const dataTempFirstValueKey = 14
  const dataTempWholeDayKey = 38

  return arr.map((item) => {
    const isWeekly = item?.nomination_type?.id === 2 && item?.weeklyDay
    if (!isWeekly) return item

    // ตรงนี้จะหาวีคเดที่ตรงกัน จะได้เอาค่ามาข้างนอก
    const dayEntry = Object.values(item?.weeklyDay!).find((d) => d?.gas_day_text == localDate)
    if (!dayEntry) return item

    // ตรงนี้จะเอา weeklyDay ใน dataRow
    // console.log('item?.dataRow : ', item?.dataRow);
    const dataRow = item?.dataRow?.map((itemx: any) => {
      const dayEntryRow: any = Object.values(itemx.weeklyDay!).find((d: any) => d?.gas_day_text === localDate)
      if (!dayEntryRow) return itemx

      const {capacityRightMMBTUD, nominatedValueMMBTUD, overusageMMBTUD, imbalanceMMBTUD, gas_day_text} = dayEntryRow

      //   console.log('nominatedValueMMBTUD : ', nominatedValueMMBTUD);

      if (dayOfWeek) {
        itemx.nominaionPointZone?.map((nominaionPointZone: any) => {
          nominaionPointZone.zone?.map((zone: any) => {
            const weekDataTemp = typeof zone.data_temp == 'string' ? JSON.parse(zone.data_temp) : zone.data_temp
            const wholeDayValue = weekDataTemp[dataTempFirstValueKey + dayOfWeek]
            weekDataTemp[dataTempWholeDayKey] = wholeDayValue

            let wholeDayValueNumber = null
            try {
              let valueString = `${wholeDayValue}`?.trim()?.replace(/,/g, '')
              // Check if value is wrapped in parentheses and convert to negative
              if (valueString && valueString.startsWith('(') && valueString.endsWith(')')) {
                valueString = '-' + valueString.slice(1, -1) // Remove parentheses and add negative sign
              }
              let valueNumber: number | null = Number(valueString)
              if (Number.isNaN(valueNumber)) {
                valueNumber = null
              }
              wholeDayValueNumber = valueNumber
            } catch (error) {
              wholeDayValueNumber = null
            }

            if (wholeDayValueNumber || wholeDayValueNumber == 0) {
              for (let i = dataTempFirstValueKey; i < dataTempWholeDayKey; i++) {
                weekDataTemp[i] = wholeDayValueNumber / 24
              }
            }

            zone.data_temp = weekDataTemp
          })
        })
      }

      return {
        ...itemx,
        capacityRightMMBTUD,
        nominatedValueMMBTUD,
        overusageMMBTUD,
        imbalanceMMBTUD,
        gas_day_text
      }
    })
    // console.log('.@ dataRow : ', dataRow);
    const {capacityRightMMBTUD, nominatedValueMMBTUD, overusageMMBTUD, imbalanceMMBTUD, gas_day, gas_day_text} = dayEntry

    // ยกค่าขึ้นมาที่ชั้นบน (คง weeklyDay ไว้ตามเดิม)
    return {
      ...item,
      capacityRightMMBTUD,
      nominatedValueMMBTUD,
      overusageMMBTUD,
      imbalanceMMBTUD,
      gas_day,
      gas_day_text,
      dataRow
    }
  })
}

export const addTotalPerRow = <T extends Record<string, any>>(rows: T[]) =>
  rows?.map((row) => {
    const n = (v: any) => (v == null || v === '' ? 0 : Number(v)) || 0
    const sum = n(row.capacityRightMMBTUD) + n(row.nominatedValueMMBTUD) + n(row.overusageMMBTUD)

    return {
      ...row,
      total: Number(sum.toFixed(3)) // ปัดทศนิยม 3 ตำแหน่งเป็น number
    }
  })

// #region Check overlap
// CHECK OVERLAP
// เช็คว่า payload มี start_date และ end_date overlap กับ dataTableX หรือเปล่า
// ถ้า dataTableX มีซักตัวที่ end_date เป็น null หรือ payload มัน overlap ให้ return true
type RowType = {
  start_date: string // ISO หรือ YYYY-MM-DD
  end_date: string | null // ISO/วันที่ หรือ null = เปิดอยู่
}

type PayloadType = {start_date: string; end_date: string | null}

const parseDate = (s: string, asEnd = false): number => {
  // ถ้าเป็นรูปแบบ YYYY-MM-DD ให้ตีความเป็นต้นวัน/สิ้นวันแบบ local-agnostic (ใช้ UTC แล้วเลื่อนเวลา)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number)
    const date = new Date(Date.UTC(y, m - 1, d, asEnd ? 23 : 0, asEnd ? 59 : 0, asEnd ? 59 : 0, asEnd ? 999 : 0))
    return date.getTime()
  }
  // กรณีเป็น ISO (มีเวลา/Z) ปล่อยให้ Date parse ตามปกติ (UTC-safe)
  return new Date(s).getTime()
}

const toRangeK = (start: string, end: string | null) => {
  const s = parseDate(start, false)
  const e = end == null ? Number.POSITIVE_INFINITY : parseDate(end, true)
  return [s, e] as const
}

// ถ้า dataTableX มีสักตัว end_date == null หรือช่วงของ payload ซ้อนทับกับช่วงของรายการไหนสักตัว ⇒ true
export const hasAnyOpenOrOverlap = (payload: PayloadType, dataTableX: RowType[]): boolean => {
  const [pStart, pEnd] = toRangeK(payload.start_date, payload.end_date)

  for (const row of dataTableX) {
    if (row.end_date == null) return true // มีรายการเปิดอยู่ทันทีผ่านเงื่อนไข

    const [rStart, rEnd] = toRangeK(row.start_date, row.end_date)

    // เช็ค overlap แบบ inclusive: [a1,b1] ∩ [a2,b2] ≠ ∅  ⇔  a1 <= b2 && a2 <= b1
    const overlap = pStart <= rEnd && rStart <= pEnd
    if (overlap) return true
  }
  return false
}

// #region checkbox daily mgn
// สำหรับเช็ค nom deadline
type Deadline = {
  before_gas_day?: number // กี่วันก่อน gas_day
  hour?: number // ชั่วโมงเดดไลน์ (0-23)
  minute?: number // นาทีเดดไลน์ (0-59)
}

type Options = {
  now?: any // inject เวลา now (สำหรับเทสต์), default = dayjs()
  tzOffsetHours?: number // ชดเชยเวลาให้ gas_day (เดิมเพื่อนใช้ +7 ชั่วโมง), default = 7
}

/**
 * คำนวณ isDisable
 * - today < baseDate => false
 * - today > baseDate => true
 * - today == baseDate => now > deadlineTime ? true : false
 */
export function shouldDisableByDeadline(rowGasDay: string | any, dl?: Deadline | null, opts: Options = {}): boolean {
  if (!dl) return false

  const now = opts.now ?? dayjs()
  const tz = opts.tzOffsetHours ?? 7

  // gas_day ของฝั่งระบบบางทีเป็น "YYYY-MM-DD" ให้ชดเชย +7 ชม. ตามโค้ดเดิม
  const gd = (dayjs.isDayjs(rowGasDay) ? rowGasDay : dayjs(rowGasDay)).add(tz, 'hour')

  // วันฐาน = gas_day - before_gas_day (เวลา 00:00)
  const baseDate = gd.subtract(dl.before_gas_day ?? 0, 'day').startOf('day')

  const todayDate = now.startOf('day')

  if (todayDate.isBefore(baseDate)) {
    // ยังไม่ถึงวันฐาน → อนุญาต
    return false
  }
  if (todayDate.isAfter(baseDate)) {
    // เลยวันฐานไปแล้ว → ไม่อนุญาต
    return true
  }

  // วันนี้เป็นวันฐาน → เช็คเวลาเดดไลน์
  const deadlineTime = baseDate
    .hour(dl.hour ?? 0)
    .minute(dl.minute ?? 0)
    .second(0)
    .millisecond(0)

  // เลยเวลาเดดไลน์แล้วให้ disable = true
  return now.isAfter(deadlineTime)
}

// #region check case terminate
// nom daily mgn

// เช็คว่า dataNomCode.contract_code มีข้อมูลวันจบสัญญาตามระดับความสำคัญนี้หรือไม่
// 1. dataNomCode.contract_code.terminate_date
// 2. dataNomCode.contract_code.extend_deadline
// 3. dataNomCode.contract_code.contract_end_date

// แล้วมาเช็คกับ dataNomCode.gas_day ถ้า dataNomCode.gas_day เกินวันจบสัญญา ให้ set isDisable == true
type ContractCode = {
  terminate_date?: string | null
  extend_deadline?: string | null
  contract_end_date?: string | null
}

type DataNomCode = {
  gas_day: string // ISO
  contract_code?: ContractCode | null
}

type CheckResult = {
  isDisableAction: boolean
  endDateKey: 'terminate_date' | 'extend_deadline' | 'contract_end_date' | null
  endDateISO: string | null // วันที่ที่ถูกใช้ (ISO เดิม)
  gasDayLocalDate: string // YYYY-MM-DD ในเขตเวลา +07 (เพื่อดีบัก)
  endDateLocalDate: string | null // YYYY-MM-DD ในเขตเวลา +07 (เพื่อดีบัก)
}

/** แปลงเป็นต้นวัน/สิ้นวันแบบ Local (+tz ชั่วโมง) */
const toLocalStartOfDay = (iso: string, tzOffsetHours = 7) => dayjs(iso).add(tzOffsetHours, 'hour').startOf('day')
const toLocalEndOfDay = (iso: string, tzOffsetHours = 7) => dayjs(iso).add(tzOffsetHours, 'hour').endOf('day')

/**
 * เลือกวันจบสัญญาตามลำดับความสำคัญ แล้วเช็คว่า gas_day > end_of_day(endDateUsed) หรือไม่
 * ถ้าใช่ => isDisable = true
 */
export function isDisabledByContractEnd(dataNomCode: DataNomCode, tzOffsetHours = 7): CheckResult {
  const cc = dataNomCode?.contract_code ?? null

  // เลือกคีย์ตาม priority
  const endDateKey = (cc?.terminate_date && 'terminate_date') || (cc?.extend_deadline && 'extend_deadline') || (cc?.contract_end_date && 'contract_end_date') || null

  const endISO = endDateKey ? ((cc as any)[endDateKey] as string) : null

  const gasStartLocal = toLocalStartOfDay(dataNomCode.gas_day, tzOffsetHours)

  if (!endISO) {
    // ไม่มีวันจบสัญญาให้เทียบ => ไม่ disable (หรือจะบังคับให้ true ก็เปลี่ยนตรงนี้ได้)
    return {
      isDisableAction: false,
      endDateKey: null,
      endDateISO: null,
      gasDayLocalDate: gasStartLocal.format('YYYY-MM-DD'),
      endDateLocalDate: null
    }
  }

  // เทียบแบบ inclusive: ถ้า gas_day (ต้นวัน) "เกิน" สิ้นวันของ endDate => disable
  const endLocal = toLocalEndOfDay(endISO, tzOffsetHours)
  const isDisableAction = gasStartLocal.isAfter(endLocal)

  return {
    isDisableAction,
    endDateKey,
    endDateISO: endISO,
    gasDayLocalDate: gasStartLocal.format('YYYY-MM-DD'),
    endDateLocalDate: endLocal.format('YYYY-MM-DD')
  }
}

type RowLike = {
  gas_day: string
  contract_code?: {
    status_capacity_request_management_id?: number | null
    terminate_date?: string | null
    extend_deadline?: string | null
    contract_end_date?: string | null
  } | null
  // ...ฟิลด์อื่น ๆ ที่มีใน sortedData
}

// ---- ฟังก์ชันที่มีอยู่แล้ว (ย่อชื่อคืนค่า isDisable ให้ชัดเจน) ----
// isDisabledByContractEnd(row, tzOffsetHours) -> { isDisable, endDateKey, ... }
// shouldDisableByDeadline(row.gas_day, dl, { tzOffsetHours, now? }) -> boolean
export function filterSortedDataByDisable(sortedData: RowLike[], dataNomDeadline: Deadline[] | null | undefined, tzOffsetHours = 7) {
  const dl = dataNomDeadline?.[0] ?? null

  const isRowDisabled = (row: RowLike): boolean => {
    // 1) สัญญา terminate (priority terminate -> extend -> contract_end_date)
    if (row?.contract_code?.status_capacity_request_management_id == 5) {
      const {isDisableAction} = isDisabledByContractEnd(row as any, tzOffsetHours)
      if (isDisableAction) return true // short-circuit: ถ้า true แล้ว ไม่ต้องเช็คข้อ 2
    }

    // 2) deadline (เฉพาะเมื่อยังไม่ถูกข้อ 1 ทำให้ disable)
    if (dl) {
      const byDeadline = shouldDisableByDeadline(row.gas_day, dl, {tzOffsetHours})
      if (byDeadline) return true
    }

    return false
  }

  const kept: RowLike[] = []
  const removed: RowLike[] = []

  for (const row of sortedData) {
    if (isRowDisabled(row)) removed.push(row)
    else kept.push(row)
  }

  return {
    filtered: kept, // เอาอันนี้ไปใช้ต่อ
    removed, // เก็บไว้ดูเหตุผล/ดีบักถ้าต้องการ
    count: {kept: kept.length, removed: removed.length, total: sortedData.length}
  }
}

// เอาไว้ใส่สี bg balance intraday bal report
export const getValidationColorClass = (validation?: string, rowColor?: any): string => {
  // original
  // const map: Record<string, string> = {
  //     max: 'bg-[#BEEB8E]',
  //     normal: 'bg-[#BEEB8E]',
  //     alert: 'bg-[#F8F889]',
  //     ofo: 'bg-[#FFC9C9]',
  //     dd: 'bg-[#E9D2FF]',
  //     if: 'bg-[#FD9965]',
  // };

  // const map: Record<string, string> = {
  //     max: 'bg-[#F1E3FF]',
  //     normal: 'bg-[#E9FFD6]', // เขียว
  //     alert: 'bg-[#FFFFC4]', // เหลือง
  //     ofo: 'bg-[#FFC9C9]',
  //     dd: 'bg-[#E9D2FF]',
  //     if: 'bg-[#FFCEB5]',
  // };

  const map: Record<string, string> = {
    max: 'bg-[#E9D2FF]',
    // normal: 'bg-[#E9FFD6]', // เขียว // alert กับ normal ไม่ต้องแสดงสี by P'Nan
    // alert: 'bg-[#FFFFC4]', // เหลือง // alert กับ normal ไม่ต้องแสดงสี by P'Nan
    ofo: 'bg-[#FFC9C9]',
    dd: 'bg-[#E9D2FF]',
    if: 'bg-[#FFCEB5]'
  }

  return map[validation?.toLowerCase() ?? ''] ?? rowColor // bg-[#EAF5F9] สีพื้นหลังเดิมของ actual
}

// ของ history
// เอาไว้ยัด create_by_account ลง update_by_account
type Account = {
  id: number
  email: string
  first_name: string
  last_name: string
}

type HistoryData = {
  create_by_account?: Account | null
  update_by_account?: Account | null
  create_by?: number | null
  update_by?: number | null
  create_date?: string | null // ISO string
  update_date?: string | null // ISO string
}

export const fillMissingUpdateByAccount = <T extends HistoryData>(arr: T[]): T[] => {
  if (!Array.isArray(arr)) return arr

  return arr.map((item) => {
    const shouldCopyAccount = item?.create_by_account && !item?.update_by_account
    const shouldCopyDate = item?.create_date && !item?.update_date

    if (!shouldCopyAccount && !shouldCopyDate) return item

    return {
      ...item,
      ...(shouldCopyAccount && {
        update_by_account: {...item.create_by_account!},
        update_by: item.update_by ?? item.create_by ?? null
      }),
      ...(shouldCopyDate && {
        update_date: item.create_date!
        // ถ้าต้องการ sync ตัวเลข timestamp ด้วย (ถ้ามีฟิลด์พวกนี้)
        // @ts-ignore
        // update_date_num: item.update_date_num ?? item.create_date_num ?? null,
      })
    }
  })
}

export const fillFileName = (arr: any[]): any[] => {
  if (!Array.isArray(arr)) return arr

  return arr.map((item) => {
    return {
      ...item,
      file_name: item?.file && cutUploadFileName(item?.file)
    }
  })
}

// ตอนนี้ใช้แค่กับ userGuide
export const normalizeHistoryData = <T extends HistoryData & {file?: any}>(arr: T[]): T[] => {
  if (!Array.isArray(arr)) return arr

  return arr.map((item) => {
    const shouldCopyAccount = item?.create_by_account && !item?.update_by_account

    const shouldCopyDate = item?.create_date && !item?.update_date

    return {
      ...item,

      // -------- sync update_by_account ----------
      ...(shouldCopyAccount && {
        update_by_account: {...item.create_by_account!},
        update_by: item.update_by ?? item.create_by ?? null
      }),

      // -------- sync update_date ----------
      ...(shouldCopyDate && {
        update_date: item.create_date!
        // ถ้าจะ sync timestamp num ด้วย
        // update_date_num:
        //   item.update_date_num ?? item.create_date_num ?? null,
      }),

      // -------- file_name ----------
      ...(item?.file && {
        file_name: cutUploadFileName(item.file)
      })
    }
  })
}

// intra bal report for shipper
// ลบทั้งคีย์
// ทำกรองคำว่า planning, actual
type QueryMode = 'planning' | 'actual' | 'none'

const detectMode = (q: string | undefined): QueryMode => {
  const s = (q ?? '').toLowerCase()
  if (/act/.test(s)) return 'actual' // รองรับ 'actu', 'actual'
  if (/plan/.test(s)) return 'planning' // รองรับ 'plan', 'plann', 'planning'
  return 'none'
}

export const filterDataIntraBalReport = (data: any[], query?: string) => {
  const mode = detectMode(query)
  if (mode === 'none') return data

  return data?.map((day) => {
    const base: any = {gas_day: day.gas_day}

    if (mode === 'planning') {
      base.shipperData = (day.shipperData || []).map((s: any) => ({
        shipper: s.shipper,
        contractData: (s.contractData || []).map((c: any) => ({
          // เก็บเฉพาะ Planning
          valueContractPlanning: c.valueContractPlanning
        })),
        totalShipperPlanning: s.totalShipperPlanning
      }))
      base.totalAllPlanning = day.totalAllPlanning
    } else {
      // actual
      base.shipperData = (day.shipperData || []).map((s: any) => ({
        shipper: s.shipper,
        contractData: (s.contractData || []).map((c: any) => ({
          // เก็บเฉพาะ Actual
          valueContractActual: c.valueContractActual
        })),
        totalShipperActual: s.totalShipperActual
      }))
      base.totalAllActual = day.totalAllActual
    }

    return base
  })
}

export function keepMaxSeqByVersion<T extends {version_text: any; seq: any}>(rows: T[]): T[] {
  const byVer = new Map<string, T>()

  for (const r of rows) {
    const ver = String(r.version_text)
    const prev = byVer.get(ver)
    // เก็บตัวที่ seq มากกว่าเสมอ (ถ้าเท่ากันจะคงตัวเดิมไว้)
    if (!prev || Number(r.seq) > Number(prev.seq)) {
      byVer.set(ver, r)
    }
  }

  return Array.from(byVer.values())
}

export function formatToUTC(input: any): string | null | undefined {
  if (input === null || input === undefined || input == 'Invalid Date' || !input || input == 'undefined/undefined/Invalid Date') return undefined

  let date: Date

  // ถ้าเป็น string ที่เป็น dd/mm/yyyy → แปลงเอง
  if (typeof input === 'string') {
    const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
    const match = input.match(ddmmyyyyRegex)

    if (match) {
      const [, day, month, year] = match.map(Number)
      date = new Date(Date.UTC(year, month - 1, day))
    } else {
      // พยายาม parse string รูปแบบอื่น
      date = new Date(input)
    }
  } else if (typeof input === 'number') {
    // ถ้าเป็น timestamp
    date = new Date(input)
  } else if (input instanceof Date) {
    date = input
  } else {
    // ไม่รู้จัก type นี้
    return undefined
  }

  if (isNaN(date.getTime())) return undefined // invalid date

  return date.toISOString() // แปลงเป็น UTC ISO string
}

// planning dashboard
// v1.0.90 ควรที่จะแสดงเป็นข้อมู lasted ของแต่ล่ะ shipper https://app.clickup.com/t/86ert2k27
export function keepLatestPerGroup<
  T extends {
    group?: {id?: number | string}
    shipper_file_submission_date?: string
  }
>(rows: T[]): T[] {
  const best = new Map<number | string, T>()

  for (const r of rows ?? []) {
    const gid = r?.group?.id
    const ts = Date.parse(r?.shipper_file_submission_date ?? '')

    if (gid == null || !Number.isFinite(ts)) continue // ข้ามถ้าไม่มี group.id หรือวันที่ไม่ valid

    const prev = best.get(gid)
    if (!prev) {
      best.set(gid, r)
    } else {
      const prevTs = Date.parse(prev.shipper_file_submission_date ?? '')
      if (ts > prevTs) best.set(gid, r) // เก็บตัวที่ใหม่กว่า
    }
  }

  return Array.from(best.values())
}

// planning dashboard
// เก็บ "ตัวล่าสุด" ต่อ 1 คีย์ (group.id + start_date + end_date)
// กรณีที่คีย์ไม่ครบ/ไม่เหมือนกัน จะไม่กรอง (ปล่อยผ่านทุกตัว)
export function keepLatestPerGroupByPeriod<
  T extends {
    group?: {id?: number | string} | null
    start_date?: string | null
    end_date?: string | null
    shipper_file_submission_date?: string | null
    id?: number | string
  }
>(rows: T[]): T[] {
  if (!Array.isArray(rows) || rows.length === 0) return []

  const latestByKey = new Map<string, {row: T; ts: number; order: number}>()
  const passThrough: {row: T; order: number}[] = []

  // helper: สร้างคีย์จาก group+ช่วงวัน (ถ้าขาดชิ้นส่วนไหน จะถือว่า "ไม่มีคีย์" -> ไม่กรอง)
  const makeKey = (r: T): string | null => {
    const gid = r?.group?.id
    const s = r?.start_date
    const e = r?.end_date
    if (gid == null || s == null || e == null) return null // ไม่ครบ -> ไม่กรอง
    return `${gid}__${s}__${e}`
  }

  rows?.forEach((r, idx) => {
    const key = makeKey(r)
    if (!key) {
      // คีย์ไม่ครบ -> ไม่กรอง เก็บไว้ผ่านตรง ๆ
      passThrough.push({row: r, order: idx})
      return
    }

    const ts = Date.parse(r?.shipper_file_submission_date ?? '')
    // ถ้าวัน-เวลาไม่ valid ก็ถือว่าไม่มี timestamp -> ไม่กรอง
    if (!Number.isFinite(ts)) {
      passThrough.push({row: r, order: idx})
      return
    }

    const prev = latestByKey.get(key)
    if (!prev) {
      latestByKey.set(key, {row: r, ts, order: idx})
    } else {
      // เก็บตัวที่ "ใหม่กว่า"; ถ้าเท่ากัน ให้เอา id มากกว่าเป็นตัวตัดสินใจ (กัน tie)
      const prevTs = prev.ts
      if (ts > prevTs) {
        latestByKey.set(key, {row: r, ts, order: prev.order}) // คง order แรกที่เจอ key นี้
      } else if (ts === prevTs) {
        const curId = Number((r as any)?.id)
        const prevId = Number((prev.row as any)?.id)
        if (Number.isFinite(curId) && Number.isFinite(prevId) && curId > prevId) {
          latestByKey.set(key, {row: r, ts, order: prev.order})
        }
      }
      // ถ้าเก่ากว่า -> ไม่ทำอะไร (ตัดทิ้ง)
    }
  })

  // รวมผล: รายการที่ “ต้องกรอง” (มีคีย์ครบ) -> เอาเฉพาะล่าสุด / รายการที่ “ไม่ต้องกรอง” -> ใส่ทั้งหมด
  const reduced = Array.from(latestByKey.values())?.map((v) => ({row: v.row, order: v.order}))
  const all = [...reduced, ...passThrough]

  // เรียงตามลำดับการปรากฏเดิม (สวยงาม/คงที่)
  all?.sort((a, b) => a.order - b.order)

  return all?.map((x) => x.row)
}

// intra bal report for shipper
// ลบ value

export const stripKeysInPlace = (data: any[], query?: string) => {
  const mode = detectMode(query)
  if (mode === 'none') return data

  const removeForPlanning = ['totalAllActual']
  const removeForActual = ['totalAllPlanning']

  data.forEach((day) => {
    // root totals
    if (mode === 'planning') removeForPlanning.forEach((k) => delete day[k])
    else removeForActual.forEach((k) => delete day[k])
    ;(day.shipperData || []).forEach((s: any) => {
      // shipper totals
      if (mode === 'planning') delete s.totalShipperActual
      else
        delete s.totalShipperPlanning

        // contractData
      ;(s.contractData || []).forEach((c: any) => {
        if (mode === 'planning') delete c.valueContractActual
        else delete c.valueContractPlanning
      })
    })
  })

  return data
}

// capacity chart กราฟล่าง ที่เป็น entry - exit
type FilterOptions = {
  // เปรียบเทียบแบบรวมขอบ (inclusive) ที่ระดับ 'day' (ค่าเดิม) หรือ 'month'
  compareUnit?: 'day' | 'month'
  // หลังกรอง ถ้า nsetData ว่าง ให้ลบ item ใน data ทิ้ง
  removeEmptyDataItem?: boolean
  // หลังกรอง ถ้า conditions ว่าง ให้ลบทิ้ง
  removeEmptyConditions?: boolean
}

/**
 * กรอง data_chart_for_filter.area.term_type.data[].nsetData และ term_type.conditions
 * โดยใช้คีย์ month (รูปแบบ "MMM YYYY" เช่น "Jan 2026") ให้อยู่ในช่วง start-end (DD/MM/YYYY)
 * จะคืนค่าใหม่ (ไม่แก้ object เดิม)
 */
export function filterDataChartByMonthRange(
  input: any,
  startStr: string, // "DD/MM/YYYY" เช่น "04/01/2010"
  endStr: string, // "DD/MM/YYYY" เช่น "31/12/2026"
  opts: FilterOptions = {}
) {
  const {compareUnit = 'day', removeEmptyDataItem = false, removeEmptyConditions = false} = opts
  // แปลงช่วงเป็น Dayjs แบบ strict
  const start = dayjs(startStr, 'DD/MM/YYYY', true)
  const end = dayjs(endStr, 'DD/MM/YYYY', true)
  if (!start.isValid() || !end.isValid()) {
    // กันพัง: ถ้า parse ไม่ได้ คืน input เดิม
    return input
  }

  // helper: แปลง "Jan 2026" -> dayjs (invalid ถ้ารูปแบบผิด/ว่าง)
  const parseMonthLabel = (m?: string) => dayjs(m ?? '', 'MMM YYYY', true)

  // อยู่ในช่วง (รวมขอบ) โดยเทียบตาม compareUnit ('day' หรือ 'month')
  const inRange = (m?: string) => {
    const d = parseMonthLabel(m)
    if (!d.isValid()) return false
    return !d.isBefore(start, compareUnit) && !d.isAfter(end, compareUnit)
  }

  // เดินโครงสร้างและกรอง
  const output = {
    ...input,
    area: (input?.area ?? []).map((a: any) => {
      const newTermType = (a?.term_type ?? []).map((t: any) => {
        // กรอง data[].nsetData
        let newData = (t?.data ?? []).map((d: any) => {
          const filteredNset = (d?.nsetData ?? []).filter((row: any) => inRange(row?.month))
          return {...d, nsetData: filteredNset}
        })

        if (removeEmptyDataItem) {
          newData = newData.filter((d: any) => Array.isArray(d?.nsetData) && d.nsetData.length > 0)
        }
        // กรอง conditions[]
        let newConditions = (t?.conditions ?? []).filter((c: any) => inRange(c?.month))
        if (removeEmptyConditions && newConditions.length === 0) {
          newConditions = []
        }

        return {
          ...t,
          data: newData,
          conditions: newConditions
        }
      })

      return {
        ...a,
        term_type: newTermType
      }
    })
  }

  return output
}

// หน้า cap mgn
// ยัดวันที่ from - to ลงชุดข้อมูลที่จะใช้
export const applyDatesToData = (data: any, exitValEdited: any[]) => {
  const val5 = exitValEdited?.[0]?.['5']
  const val6 = exitValEdited?.[0]?.['6']

  return data.map((row: any) => ({
    ...row,
    '5': val5 ?? row['5'],
    '6': val6 ?? row['6']
  }))
}

// หน้า cap mgn
// format หัววันที่
export const formatMonthYear = (dateStr: string): string => {
  const [day, month, year] = dateStr.split('/')
  const date = new Date(`${year}-${month}-${day}`) // แปลงเป็น ISO format: yyyy-MM-dd

  const options: Intl.DateTimeFormatOptions = {month: 'long', year: 'numeric'}
  return date.toLocaleDateString('en-US', options) // เช่น "October 2025"
}

const normalizeHeader = (arr: any[]) =>
  (arr ?? [])
    .map((v) => dayjs(v).format('YYYY-MM-DD')) // normalize รูปแบบวัน
    .join('|') // แปลงเป็นสตริงเดียวเพื่อเทียบ

export const isSameHeader = (a?: any, b?: any) => normalizeHeader(a) === normalizeHeader(b)

// เทียบ period ระหว่าง entry, exit ของ capa mgn
type DayEntry = {key?: string; [k: string]: any}
type CapHeader = Record<string, DayEntry> // map "DD/MM/YYYY" -> { key: "..." }

const isDateKey = (k: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(k)

export function compareCapacityHeaders(entryCap: CapHeader, exitCap: CapHeader) {
  const entryDates = Object.keys(entryCap || {}).filter(isDateKey)
  const exitDates = Object.keys(exitCap || {}).filter(isDateKey)

  // วันไหนมีใน entry แต่ไม่มีใน exit / และกลับกัน
  const missingInExit = entryDates.filter((d) => !exitDates.includes(d))
  const missingInEntry = exitDates.filter((d) => !entryDates.includes(d))

  // วันไหนมีทั้งคู่ แต่ค่า key ไม่เท่ากัน
  const commonDates = entryDates.filter((d) => exitDates.includes(d))
  const mismatched = commonDates
    .map((d) => {
      const entryKey = entryCap[d]?.key ?? null
      const exitKey = exitCap[d]?.key ?? null
      return entryKey === exitKey ? null : {date: d, entryKey, exitKey}
    })
    .filter(Boolean) as Array<{date: string; entryKey: string | null; exitKey: string | null}>

  const equal = missingInExit.length === 0 && missingInEntry.length === 0 && mismatched.length === 0

  return {equal, missingInExit, missingInEntry, mismatched}
}

// VALIDATE DAILY MANAGEMENT
// รวมข้อมูล H1,H2 ... ที่ contract point และ unit เดียวกัน
// แล้วเอามาเทียบกับ valueBook
// type RowDailyMgn = Record<string, any>;

const norm = (v: any) =>
  String(v ?? '')
    .trim()
    .replace(/\s+/g, ' ') // รวมช่องว่างซ้ำ
    .toUpperCase() // กันพิมพ์เล็ก-ใหญ่ไม่ตรง

// ---- new
type RowDailyMgn = {
  unit_text?: string
  nomination_point_text?: string
  contract_point_list?: {contract_point?: string}[]
  newObj?: Record<string, any>
  total?: number | string // <-- ใช้สำหรับรวม total ต่อกลุ่ม
  [k: string]: any // H1..Hn
}

/** เก็บดัชนี H* ที่มีอยู่จริง เช่น [1..24] */
const collectHIndices = (rows: RowDailyMgn[]): number[] => {
  const set = new Set<number>()
  for (const r of rows) {
    for (const k of Object.keys(r)) {
      const m = /^H(\d+)$/.exec(k)
      if (m) set.add(parseInt(m[1], 10))
    }
  }
  const list = Array.from(set).filter((x) => Number.isFinite(x) && x > 0)
  list.sort((a, b) => a - b)
  return list.length ? list : Array.from({length: 24}, (_, i) => i + 1)
}

/** คืนลิสต์ point (normalized & unique) จาก contract_point_list เท่านั้น (ไม่ fallback) */
const getContractPointsOnly = (row: RowDailyMgn): string[] => {
  const arr = Array.isArray(row?.contract_point_list) ? row.contract_point_list : []
  const uniq = new Set<string>()
  for (const it of arr) {
    const p = norm(it?.contract_point)
    if (p) uniq.add(p)
  }
  return Array.from(uniq)
}

/** ใช้สำหรับการ group/validate: ถ้าไม่มี contract point จะ fallback เป็น __NO_POINT__ */
const getPointsForGrouping = (row: RowDailyMgn): string[] => {
  const points = getContractPointsOnly(row)
  if (points.length === 0) return ['__NO_POINT__']
  return points
}

/** อ่าน cap (valueBook) สำหรับ H-index จากแถวตัวอย่าง: H1 -> newObj["14"], H2 -> "15", ... */
const getCapForH = (sample: RowDailyMgn, hIndex: number): number => {
  const key = String(13 + hIndex)
  const vb = sample?.newObj?.[key]?.valueBook
  const n = toNum(vb)
  return Number.isFinite(n) && n > 0 ? n : Infinity // ไม่มี/ผิดรูป = ไม่จำกัด
}

/** อ่าน cap รวมของ total (ถ้าไม่มี/ผิดรูป = ไม่จำกัด) */
const getCapForTotal = (sample: RowDailyMgn): number => {
  const vb = sample?.newObj?.[38]?.valueBook // สมมติ cap total เก็บที่นี่
  const n = toNum(vb)
  return Number.isFinite(n) && n > 0 ? n : Infinity
}

// validateHByPoint VALIDATE DAILY MANAGEMENT
// รวมข้อมูล H1,H2 ... ที่ contract point และ unit เดียวกัน
// แล้วเอามาเทียบกับ valueBook

//  * - ซ้ำ & เกิน cap --> true
//  * - ซ้ำ & ไม่เกิน cap --> false
//  * - ไม่ซ้ำ หรือไม่มี contract_point --> null

export function validateHByPoint(data_: RowDailyMgn[]): RowDailyMgn[] {
  if (!Array.isArray(data_) || data_.length === 0) return data_

  const Hs = collectHIndices(data_)

  // 1) สร้างกลุ่ม (POINT__UNIT) และ mapping แถว -> กลุ่ม
  const groups: any = new Map<string, RowDailyMgn[]>()
  const rowGroups = new Map<RowDailyMgn, string[]>()

  for (const row of data_) {
    const unit = norm(row?.unit_text)
    const points = getPointsForGrouping(row)
    for (const p of points) {
      const key = `${p}__${unit}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)

      const list = rowGroups.get(row) ?? []
      list.push(key)
      rowGroups.set(row, list)
    }
  }

  // เก็บขนาดกลุ่มไว้เช็คว่า "ซ้ำ" หรือไม่
  const groupSizes = new Map<string, number>()
  for (const [k, rows] of groups) groupSizes.set(k, rows.length)

  // 2) สร้างผล validate ต่อกลุ่ม (เฉพาะใช้ตอนรวมผลแถว)
  const groupValidations = new Map<string, Record<string, boolean>>()

  for (const [groupKey, rows] of groups) {
    if (!rows.length) continue

    // sum ต่อ H
    const sums: Record<string, number> = {}
    for (const h of Hs) {
      const hKey = `H${h}`
      let s = 0
      for (const r of rows) s += toNum(r?.[hKey])
      sums[hKey] = s
    }

    // sum ของ total ต่อกลุ่ม
    let sumTotal = 0
    for (const r of rows) sumTotal += toNum(r?.total)
    sums['total'] = sumTotal

    // cap ต่อ H (ใช้แถวแรกเป็น sample)
    const sample = rows[0]
    const caps: Record<string, number> = {}
    for (const h of Hs) caps[`H${h}`] = getCapForH(sample, h)
    caps['total'] = getCapForTotal(sample)

    // validate ต่อ H/total (เกิน cap = true)
    const v: Record<string, boolean> = {}
    for (const h of Hs) {
      const hKey = `H${h}`
      v[hKey] = sums[hKey] > caps[hKey]
    }
    v['total'] = sums['total'] > caps['total']

    groupValidations.set(groupKey, v)
  }

  // 3) ผูกผล validate กลับแถว: เฉพาะกรณี "ซ้ำ" เท่านั้น; ไม่ซ้ำ => null
  const out: RowDailyMgn[] = data_.map((row) => {
    const groupsOfRow = rowGroups.get(row) ?? []

    // มี contract_point จริงไหม (ไม่เอา __NO_POINT__)
    const realPoints = getContractPointsOnly(row)
    const hasRealPoint = realPoints.length > 0

    // เลือกเฉพาะกลุ่มที่มี point จริง (ตัด __NO_POINT__)
    const realPointGroups = groupsOfRow.filter((g) => !g.startsWith('__NO_POINT__'))

    // ตรวจว่ามี "ซ้ำ" มั้ย (อย่างน้อย 1 กลุ่มที่ size > 1)
    const hasDuplicate = hasRealPoint && realPointGroups.some((g) => (groupSizes.get(g) ?? 0) > 1)

    // ถ้าไม่มี contract point เลย หรือไม่มีซ้ำเลย -> set validate_H* และ validate_total = null
    if (!hasRealPoint || !hasDuplicate) {
      const withNulls: RowDailyMgn = {...row}
      for (const h of Hs) withNulls[`validate_H${h}`] = null
      withNulls['validate_total'] = null // <-- เพิ่ม
      return withNulls
    }

    // รวมผลเฉพาะในกลุ่มที่ "ซ้ำ" เท่านั้น (AND)
    const combined: Record<string, boolean> = {}
    for (const h of Hs) combined[`H${h}`] = true
    combined['total'] = true // <-- เพิ่ม

    for (const g of realPointGroups) {
      if ((groupSizes.get(g) ?? 0) <= 1) continue // ข้ามกลุ่มที่ไม่ซ้ำ
      const v = groupValidations.get(g)
      if (!v) continue
      for (const h of Hs) {
        const key = `H${h}`
        combined[key] = combined[key] && (v[key] ?? false)
      }
      combined['total'] = combined['total'] && (v['total'] ?? false) // <-- เพิ่ม
    }

    const withFlags: RowDailyMgn = {...row}
    for (const h of Hs) withFlags[`validate_H${h}`] = combined[`H${h}`]
    withFlags['validate_total'] = combined['total'] // <-- เพิ่ม
    return withFlags
  })

  return out
}

// ---------------------- WEEKLY MGN ----------------------
const DAY_KEYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** สแกนหาวันที่มีอยู่จริงในข้อมูล (ถ้าไม่เจอเลย ใช้ทั้ง 7 วัน) */
const collectDayKeys = (rows: RowDailyMgn[]): string[] => {
  const present = new Set<string>()
  for (const r of rows) {
    for (const d of DAY_KEYS) if (d in r) present.add(d)
  }
  const list = DAY_KEYS.filter((d) => present.has(d))
  return list.length ? list : [...DAY_KEYS]
}

/** Sunday -> "14", Monday -> "15", ... Saturday -> "20" */
const getCapForDay = (sample: RowDailyMgn, dayKey: string): number => {
  const idx = DAY_KEYS.indexOf(dayKey) // 0..6
  if (idx < 0) return Infinity
  const key = String(14 + idx)
  const vb = sample?.newObj?.[key]?.valueBook
  const n = toNum(vb)
  return Number.isFinite(n) && n > 0 ? n : Infinity
}

/**
 * validate ตามวันในสัปดาห์: กลุ่ม (POINT__UNIT) → sum รายวัน → เทียบ cap จาก newObj["14".."20"]
 * - ซ้ำ & เกิน cap --> true
 * - ซ้ำ & ไม่เกิน cap --> false
 * - ไม่ซ้ำ หรือไม่มี contract_point --> null
 * คืน object ใหม่พร้อมคีย์ validate_<Day> เช่น validate_Sunday
 */
export function validateWeekdaysByPoint(data_: RowDailyMgn[]): RowDailyMgn[] {
  if (!Array.isArray(data_) || data_.length === 0) return data_

  const days = collectDayKeys(data_)

  // 1) group และ mapping แถว -> กลุ่ม
  const groups: any = new Map<string, RowDailyMgn[]>()
  const rowGroups = new Map<RowDailyMgn, string[]>()

  for (const row of data_) {
    const unit = norm(row?.unit_text)
    const points = getPointsForGrouping(row)
    for (const p of points) {
      const key = `${p}__${unit}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)

      const list = rowGroups.get(row) ?? []
      list.push(key)
      rowGroups.set(row, list)
    }
  }

  // ขนาดกลุ่มไว้เช็ค “ซ้ำ”
  const groupSizes = new Map<string, number>()
  for (const [k, rows] of groups) groupSizes.set(k, rows.length)

  // 2) validate ต่อกลุ่ม
  const groupValidations = new Map<string, Record<string, boolean>>()
  for (const [groupKey, rows] of groups) {
    if (!rows.length) continue

    // sum ต่อวัน
    const sums: Record<string, number> = {}
    for (const d of days) {
      let s = 0
      for (const r of rows) s += toNum(r?.[d])
      sums[d] = s
    }

    // cap ต่อวัน (ใช้แถวแรกเป็น sample)
    const sample = rows[0]
    const caps: Record<string, number> = {}
    for (const d of days) caps[d] = getCapForDay(sample, d)

    // เกิน cap = true
    const v: Record<string, boolean> = {}
    for (const d of days) v[d] = sums[d] > caps[d]
    groupValidations.set(groupKey, v)
  }

  // 3) กลับใส่แถว: ไม่มีซ้ำ/ไม่มี contract_point => null, มีซ้ำ => AND เฉพาะกลุ่มที่ซ้ำ
  const out: RowDailyMgn[] = data_.map((row) => {
    const groupsOfRow = rowGroups.get(row) ?? []

    const realPoints = getContractPointsOnly(row)
    const hasRealPoint = realPoints.length > 0

    const realPointGroups = groupsOfRow.filter((g) => !g.startsWith('__NO_POINT__'))
    const hasDuplicate = hasRealPoint && realPointGroups.some((g) => (groupSizes.get(g) ?? 0) > 1)

    // ไม่มี point หรือไม่มีซ้ำ ⇒ null
    if (!hasRealPoint || !hasDuplicate) {
      const withNulls: RowDailyMgn = {...row}
      for (const d of days) withNulls[`validate_${d}`] = null
      return withNulls
    }

    // รวมผลเฉพาะกลุ่มที่ “ซ้ำ” (AND)
    const combined: Record<string, boolean> = {}
    for (const d of days) combined[d] = true

    for (const g of realPointGroups) {
      if ((groupSizes.get(g) ?? 0) <= 1) continue
      const v = groupValidations.get(g)
      if (!v) continue
      for (const d of days) combined[d] = combined[d] && (v[d] ?? false)
    }

    const withFlags: RowDailyMgn = {...row}
    for (const d of days) withFlags[`validate_${d}`] = combined[d]
    return withFlags
  })

  return out
}

// PLANNING DASHBOARD
// เอาไว้ sum datasets ที่ area ซ้ำกัน
type DataSet = {
  label: string
  data: (number | null | undefined)[]
  [k: string]: any // props อื่น ๆ (borderColor, fill, ฯลฯ)
}

export const mergeDataSetsByLabel = (arr: DataSet[]): DataSet[] => {
  const byLabel = new Map<string, DataSet>()

  if (Array.isArray(arr)) {
    for (const item of arr) {
      const key = item.label ?? '__undefined__'

      if (!byLabel.has(key)) {
        byLabel.set(key, {
          ...item,
          data: [...item.data]
        })
        continue
      }

      const acc = byLabel.get(key)!
      const maxLen = Math.max(acc.data.length, item.data.length)

      const merged: any[] = Array.from({length: maxLen}, (_, i) => {
        const a = acc.data[i]
        const b = item.data[i]

        const hasA = a !== null && a !== undefined
        const hasB = b !== null && b !== undefined

        // 🔥 ไม่มีข้อมูลทั้งคู่ → null
        if (!hasA && !hasB) return null

        // 🔥 มีข้อมูลฝั่งใดฝั่งหนึ่ง
        const valA = hasA ? Number(a) : 0
        const valB = hasB ? Number(b) : 0

        return (isFinite(valA) ? valA : 0) + (isFinite(valB) ? valB : 0)
      })

      acc.data = merged
    }
  }

  return Array.from(byLabel.values())
}

// Allocation report
// Tab Daily / Tab Intraday ปรับ Default Display ตอนเข้าครั้งแรกให้เรียงตาม Timestamp > Entry/Exit (เอา Entryก่อน) > Contract Point (เรียงตามตัวอักษร) https://app.clickup.com/t/86et8d4cb
export const sortAlloReport = (data_: any) => {
  const sorted = data_?.sort((a: any, b: any) => {
    // 1. Sort by execute_timestamp (desc)
    if (b.execute_timestamp !== a.execute_timestamp) {
      return b.execute_timestamp - a.execute_timestamp
    }

    // 2. Sort by entry_exit_obj.name: "Entry" comes before "Exit"
    const aIsEntry = a.entry_exit_obj?.name?.toLowerCase() === 'entry'
    const bIsEntry = b.entry_exit_obj?.name?.toLowerCase() === 'entry'
    if (aIsEntry !== bIsEntry) {
      return bIsEntry ? 1 : -1 // Entry first
    }

    // 3. Sort by contract (A-Z)
    return a.contract.localeCompare(b.contract)
  })

  return sorted
}

export const toNumber = (v: any): number | null => {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v !== 'string') return null
  const s = v.trim().replace(/,/g, '')
  if (s === '' || s === '-') return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export const sumDetail = (values: any, startWithTag: string, excludedTags: string[]): number | null => {
  if (!values || !Array.isArray(excludedTags) || excludedTags.length === 0) return null

  let sum = 0
  let hasNumber = false

  Object.keys(values)
    .filter((key) => key.startsWith(startWithTag) && !excludedTags.includes(key.replace(startWithTag, '')))
    .forEach((key) => {
      const n = toNumber(values[key])
      if (n !== null) {
        sum += n
        hasNumber = true
      }
    })

  return hasNumber ? sum : null
}

// ใช้กับ alloc shipper report
// หา shipper name ไปใส่แทน id_name
// ปั้นข้อมูล data_x.nomPoint.data.shipper_name ในแต่ละ object โดยเอา shipper_name ไปหาใน dataShipper
// const find_shipper = dataShipper?.find((item: any) => item.id_name == data_x.nomPoint.data.shipper_name)
// แล้วเอา find_shipper.name ไปแทนที่ data_x.nomPoint.data.shipper_name
type ShipperRef = {
  id_name: string // NGP-S16-001
  name: string // PTT
}

type DataItem = {
  gas_day: string
  shipper_id: string | null
  shipper_name: string | null // จะถูกแทนค่าด้วยชื่อเต็ม
  allocatedValue: number
}

type NomPoint = {
  point: string
  data: DataItem[]
  total: number
  meterValue: number
}

type GasDayBlock = {
  gas_day: string
  nomPoint: NomPoint[]
}

export function mapShipperNames(data: GasDayBlock[], dataShipper: ShipperRef[]): GasDayBlock[] {
  if (!Array.isArray(data) || !Array.isArray(dataShipper)) return data ?? []

  // ทำ index lookup O(1)
  const byIdName = new Map<string, string>()
  for (const s of dataShipper) {
    if (!s?.id_name) continue
    byIdName.set(s.id_name.trim().toLowerCase(), (s.name ?? '').trim())
  }

  // สร้างสำเนาใหม่ (ไม่ mutate ของเดิม)
  return data.map((gd) => ({
    ...gd,
    nomPoint: (gd.nomPoint ?? []).map((np) => ({
      ...np,
      data: (np.data ?? []).map((row) => {
        const shipperId = (row?.shipper_id ?? '').trim().toLowerCase()
        const shipperNameRaw = (row?.shipper_name ?? '').trim().toLowerCase()

        // 1) พยายามจับคู่ด้วย shipper_id ก่อน (ถ้ามี)
        let prettyName = shipperId ? byIdName.get(shipperId) : undefined

        // 2) ถ้าไม่ได้ ลองใช้ shipper_name เดิมเป็นกุญแจค้นใน id_name
        if (!prettyName && shipperNameRaw) {
          prettyName = byIdName.get(shipperNameRaw)
        }

        return {
          ...row,
          shipper_name: prettyName ?? row.shipper_name // ถ้าไม่เจอ ให้คงค่าเดิม
        }
      })
    }))
  }))
}

type RowTypeB = {
  gas_day: string // "YYYY-MM-DD"
  value: any[]
  totalRoundRound: number | null
  totalNotRound: number | null
}

/**
 * Tariff Charge Report --> comoddity charge type B view
 * เติมข้อมูลให้ครบทั้งเดือน
 * - ถ้าไม่ส่ง year/month จะอิงจากเรคคอร์ดแรกใน data
 * - คงค่ารายการเดิมไว้ ถ้าวันนั้นมีอยู่แล้ว
 * - วันไหนไม่มี จะสร้างอ็อบเจ็กต์ใหม่ที่ value=[], totalRoundRound=null, totalNotRound=null
 */
export function fillMonthDays(
  data: RowTypeB[],
  opts?: {year?: number; month?: number} // month = 1..12 (ถ้าระบุ)
): RowTypeB[] {
  const src = Array.isArray(data) ? data : []

  // หาปี/เดือนอ้างอิง
  let y: number | undefined = opts?.year
  let m: number | undefined = opts?.month // 1..12

  if (y == null || m == null) {
    const first = src[0]?.gas_day ? src[0]?.gas_day : dayjs().format('YYYY-MM-DD')
    if (!first) throw new Error('fillMonthDays: missing base month (data ว่าง และไม่ได้ระบุ year/month)')
    const d = new Date(first)
    if (Number.isNaN(d.getTime())) throw new Error('fillMonthDays: gas_day รูปแบบไม่ถูกต้อง (ควรเป็น YYYY-MM-DD)')
    y = d.getUTCFullYear()
    m = d.getUTCMonth() + 1 // JS month is 0..11
  }

  // จำนวนวันในเดือน
  // const daysInMonth = new Date(y!, m!, 0).getUTCDate(); // วันที่ 0 ของเดือนถัดไป = วันสุดท้ายของเดือนนี้
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate() // 31 ตามที่ต้องการ

  // ทำดัชนีรายการเดิมตาม gas_day (กันซ้ำ)
  const byDate = new Map<string, RowTypeB>()
  for (const it of src) {
    const key = toYmd(it.gas_day)
    if (!byDate.has(key)) {
      byDate.set(key, {
        gas_day: key,
        value: Array.isArray(it.value) ? it.value : [],
        totalRoundRound: it.totalRoundRound ?? null,
        totalNotRound: it.totalNotRound ?? null
      })
    }
  }

  // สร้างผลลัพธ์ครบทุกวัน
  const out: RowTypeB[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${y}-${pad2(m)}-${pad2(day)}`
    const exist = byDate.get(key)
    if (exist) {
      out.push(exist)
    } else {
      out.push({
        gas_day: key,
        value: [],
        totalRoundRound: null,
        totalNotRound: null
      })
    }
  }

  // เรียงเพื่อความชัวร์ (น้อย→มาก)
  out.sort((a, b) => (a.gas_day < b.gas_day ? -1 : a.gas_day > b.gas_day ? 1 : 0))
  return out
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}
function toYmd(s: string): string {
  // normalize เป็น YYYY-MM-DD
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s // ถ้าพาร์สไม่ได้ คืนเดิม (แต่ควรส่งรูปแบบถูก)
  const y = d.getUTCFullYear()
  const m = d.getUTCMonth() + 1
  const day = d.getUTCDate()
  return `${y}-${pad2(m)}-${pad2(day)}`
}

type RowTypePenalty = {
  gas_day: string // "YYYY-MM-DD"
  value: any[]
  balancing_gas: number | null
  change_in_ivent: number | null
  commissioning: number | null
  entry: number | null
  exit: number | null
  fuel_gas: number | null
  gas_vent: number | null
  imbalance: number | null
  imbalance_over_5_percen: number | null
  other_gas: number | null
  shrinkage: number | null
}

export function fillMonthDaysPenalty(
  data: RowTypePenalty[],
  opts?: {year?: number; month?: number} // month = 1..12 (ถ้าระบุ)
): RowTypePenalty[] {
  const src = Array.isArray(data) ? data : []

  // หาปี/เดือนอ้างอิง
  let y: number | undefined = opts?.year
  let m: number | undefined = opts?.month // 1..12

  if (y == null || m == null) {
    const first = src[0]?.gas_day ? src[0]?.gas_day : dayjs().format('YYYY-MM-DD')
    if (!first) throw new Error('fillMonthDays: missing base month (data ว่าง และไม่ได้ระบุ year/month)')
    const d = new Date(first)
    if (Number.isNaN(d.getTime())) throw new Error('fillMonthDays: gas_day รูปแบบไม่ถูกต้อง (ควรเป็น YYYY-MM-DD)')
    y = d.getUTCFullYear()
    m = d.getUTCMonth() + 1 // JS month is 0..11
  }

  // จำนวนวันในเดือน
  // const daysInMonth = new Date(y!, m!, 0).getUTCDate(); // วันที่ 0 ของเดือนถัดไป = วันสุดท้ายของเดือนนี้
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate() // 31 ตามที่ต้องการ

  // ทำดัชนีรายการเดิมตาม gas_day (กันซ้ำ)
  const byDate: any = new Map<string, RowTypePenalty>()
  for (const it of src) {
    const key = toYmd(it.gas_day)
    if (!byDate.has(key)) {
      byDate.set(key, {
        gas_day: key,
        balancing_gas: it.balancing_gas ?? null,
        change_in_ivent: it.change_in_ivent ?? null,
        commissioning: it.commissioning ?? null,
        entry: it.entry ?? null,
        exit: it.exit ?? null,
        fuel_gas: it.fuel_gas ?? null,
        gas_vent: it.gas_vent ?? null,
        imbalance: it.imbalance ?? null,
        imbalance_over_5_percen: it.imbalance_over_5_percen ?? null,
        other_gas: it.other_gas ?? null,
        shrinkage: it.shrinkage ?? null
      })
    }
  }

  // สร้างผลลัพธ์ครบทุกวัน
  const out: any = []
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${y}-${pad2(m)}-${pad2(day)}`
    const exist = byDate.get(key)
    if (exist) {
      out.push(exist)
    } else {
      out.push({
        gas_day: key,
        balancing_gas: null,
        change_in_ivent: null,
        commissioning: null,
        entry: null,
        exit: null,
        fuel_gas: null,
        gas_vent: null,
        imbalance: null,
        imbalance_over_5_percen: null,
        other_gas: null,
        shrinkage: null
      })
    }
  }

  // เรียงเพื่อความชัวร์ (น้อย→มาก)
  out.sort((a: any, b: any) => (a.gas_day < b.gas_day ? -1 : a.gas_day > b.gas_day ? 1 : 0))
  return out
}

export const filterActiveToday = (rows: any[]) => {
  const today = dayjs().startOf('day') // วันปัจจุบัน (ตัดเวลา)

  return rows.filter((it) => {
    const start = dayjs(it?.start_date)
    const end = it?.end_date ? dayjs(it.end_date) : dayjs('9999-12-31')

    // เงื่อนไข: start <= today <= end (เทียบระดับวัน)
    return start.isSameOrBefore(today, 'day') && end.isSameOrAfter(today, 'day')
  })
}

export const adjustDateIfTO = (mode: string, dateStr: string) => {
  const fmt = 'DD/MM/YYYY'
  const d = dayjs(dateStr, fmt, true) // parse เคร่งครัดตามฟอร์แมต
  if (!d.isValid()) return dateStr // ถ้าอ่านไม่ได้ก็คืนเดิม

  if (mode === 'TO' && d.date() === 1) {
    return d.subtract(1, 'day').format(fmt) // ย้อน 1 วัน
  }
  return dateStr // เงื่อนไขไม่เข้า คืนเดิม
}

export const adjustDateIfTOShortTerm = (mode: string, dateStr: string) => {
  const fmt = 'DD/MM/YYYY'
  const d = dayjs(dateStr, fmt, true) // parse เคร่งครัดตามฟอร์แมต
  if (!d.isValid()) return dateStr // ถ้าอ่านไม่ได้ก็คืนเดิม

  if (mode === 'TO') {
    return d.subtract(1, 'day').format(fmt) // ย้อน 1 วัน
  }
  return dateStr // เงื่อนไขไม่เข้า คืนเดิม
}

// รวม data_for_sum ในแต่ละคีย์ H1, H2, ... H24 ที่มีี area_text, nomination_point ซ้ำกัน
// ตั้งเป็นคีย์ใหม่ชื่อ sum_H1, sum_H2 ... sum_H24

// sum เพื่อ validate summary nom report
type RowX = Record<string, any>
const H_KEYS = Array.from({length: 24}, (_, i) => `H${i + 1}`)
const SUM_KEYS = H_KEYS.map((k) => `sum_${k}`)

export const decorateRowsWithGroupSums = (data_for_sum: RowX[], groupKeys: Array<keyof RowX> = ['area_text', 'nomination_point']) => {
  // 1) รวมก่อนแบบใช้ map (เหมือนแบบ A)
  const groupSummary = new Map<string, RowX>()
  for (const row of data_for_sum ?? []) {
    const key = groupKeys.map((k) => String(row?.[k] ?? '')).join('||')
    if (!groupSummary.has(key)) {
      const base: RowX = {}
      for (const hk of H_KEYS) base[`sum_${hk}`] = 0
      groupSummary.set(key, base)
    }
    const acc = groupSummary.get(key)!
    for (const hk of H_KEYS) {
      acc[`sum_${hk}`] += toNumber(row?.[hk])
    }
  }

  // 2) กระจาย sum กลับไปยังแต่ละแถว (ไม่ mutate ของเดิม)
  return (data_for_sum ?? []).map((row) => {
    const key = groupKeys.map((k) => String(row?.[k] ?? '')).join('||')
    const sums = groupSummary.get(key) || {}
    return {...row, ...sums}
  })
}

const parseDMYPlanning = (s: string): number => {
  const [dd, mm, yyyy] = s.split('/').map(Number)
  return new Date(yyyy, mm - 1, dd).getTime()
}

// หาจำนวนเดือน ระหว่างวันที่
export const monthDiffInclusive = (start: string, end: string) => {
  const s = dayjs(start, 'DD/MM/YYYY')
  const e = dayjs(end, 'DD/MM/YYYY')
  if (!s.isValid() || !e.isValid() || e.isBefore(s)) return 0
  return (e.year() - s.year()) * 12 + (e.month() - s.month()) + 1
}

// หาจำนวนวัน ระหว่างวันที่
export const dayDiff = (start: string, end: string, opts: {inclusive?: boolean} = {inclusive: true}) => {
  const s = dayjs(start, 'DD/MM/YYYY', true)
  const e = dayjs(end, 'DD/MM/YYYY', true)
  if (!s.isValid() || !e.isValid() || e.isBefore(s)) return 0

  const diff = e.diff(s, 'day')
  return opts.inclusive ? diff + 1 : diff
}

// เติม null เข้า datasets --> planning dashboard --> short term each modal
export const padFrontWithNulls = (arr: any, days_count: number) => {
  if (!Array.isArray(arr) || days_count <= 0) return arr

  const pad = Array.from({length: days_count}, () => null)

  return arr.map((item) => ({
    ...item,
    data: pad.concat(item.data ?? [])
  }))
}

// ชอร์ทคัตแบบรวมวันสุดท้ายเสมอ (เหมือน monthDiffInclusive)
export const dayDiffInclusive = (start: string, end: string) => dayDiff(start, end, {inclusive: true})

// ใช้กับ planning short term หาวันที่น้อยที่สุดในข้อมูล
export const getEarliestFirstDay = (rows: any[]): string | null => {
  let best: {ts: number; date: string} | null = null

  if (Array.isArray(rows)) {
    for (const r of rows) {
      if (!Array.isArray(r.day) || r.day.length === 0) continue
      const d0 = r.day[0]
      const ts = parseDMYPlanning(d0)
      if (!best || ts < best.ts) best = {ts, date: d0}
    }
  }

  return best ? best.date : null
}

// ใช้กับ planning short term หาวันที่มากที่สุดในข้อมูล
export const getLatestFirstDay = (rows: any[]): string | null => {
  let best: {ts: number; date: string} | null = null

  if (Array.isArray(rows)) {
    for (const r of rows) {
      if (!Array.isArray(r.day) || r.day.length === 0) continue
      const d0 = r.day[r.day.length - 1]
      const ts = parseDMYPlanning(d0)
      if (!Number.isFinite(ts)) continue // กันกรณี parse แล้วไม่ใช่ตัวเลข
      if (!best || ts > best.ts) best = {ts, date: d0}
    }
  }

  return best ? best.date : null
}

// นับจำนวนเดือนใน arr day
// ผลลัพธ์: จำนวนเดือนแบบรวมหัว-ท้าย (เช่น ต.ค.→ธ.ค. = 3)
// ถ้าไม่มีข้อมูลที่พอคำนวณ คืน null
export const countMonthSpanInclusive = (rows: Array<{day?: string[]}>): number | null => {
  let startTs: number | null = null // earliest of day[0]
  let endTs: number | null = null // latest   of day[last]

  for (const r of rows ?? []) {
    if (!Array.isArray(r.day) || r.day.length === 0) continue

    const first = r.day[0]
    const last = r.day[r.day.length - 1]

    const tFirst = parseDMYPlanning(first)
    const tLast = parseDMYPlanning(last)

    if (!Number.isFinite(tFirst) || !Number.isFinite(tLast)) continue

    if (startTs === null || tFirst < startTs) startTs = tFirst
    if (endTs === null || tLast > endTs) endTs = tLast
  }

  if (startTs === null || endTs === null) return null

  const s = new Date(startTs)
  const e = new Date(endTs)

  const startYM = {y: s.getFullYear(), m: s.getMonth()} // m: 0..11
  const endYM = {y: e.getFullYear(), m: e.getMonth()}

  const diffInclusive = (endYM.y - startYM.y) * 12 + (endYM.m - startYM.m) + 1

  return diffInclusive
}

type ContractCodeNomUploadForShp = {
  extend_deadline?: string | null
  terminate_date?: string | null
  contract_end_date?: string | null
}

type CheckResultNomUploadForShp = {
  effectiveDeadline: string | null // วันที่ที่ถูกเลือกตาม priority (ISO เดิม)
  hasPassed: boolean // true=ผ่านแล้ว, false=ยัง, null=ไม่มีวันที่ให้เช็ค
}

// หาว่า today ผ่านพวก extend_deadline --> terminate_date --> contract_end_date ยัง
export function hasPassedEffectiveEndDate(contract?: ContractCodeNomUploadForShp): CheckResultNomUploadForShp {
  if (!contract) return {effectiveDeadline: null, hasPassed: false}

  const effective = contract.extend_deadline ?? contract.terminate_date ?? contract.contract_end_date ?? null

  if (!effective) return {effectiveDeadline: null, hasPassed: false}

  const today = dayjs() // เวลาปัจจุบัน (โซนเครื่อง)
  const deadline = dayjs(effective) // ISO มี 'Z' -> แปลงเป็นเวลาท้องถิ่นอัตโนมัติ

  // “ผ่านมาแล้วหรือยัง” (เทียบระดับวัน):
  // - ถ้าอยากให้ "วันนี้" ยังนับว่ายังไม่ผ่าน → ใช้ isAfter(deadline, 'day')
  // - ถ้าอยากให้ "ถึงวันนั้น" ก็ถือว่าผ่านแล้ว → ใช้ isSameOrAfter(deadline, 'day')
  const passed = today.isAfter(deadline, 'day')

  // hasPassed: true = วันนี้เลยวันสิ้นสุด (ตาม priority) มาแล้ว
  // effectiveDeadline: คือวันที่ที่นำมาใช้จริง (อาจเป็น extend_deadline/terminate_date/contract_end_date)
  return {effectiveDeadline: effective, hasPassed: passed}
}

// --- ใช้กับ planning short term ตอน filter month
// --- ตัวนี้ถ้าเป็น array เปล่า ไม่ return
// --- อันนี้จะกรองตั้งแต่วัน srchStartDate เป็นต้นไป เท่าที่มี
export const filterDataShortByMonth = (data_short: any[], srchStartDate: any) => {
  // normalize start date to midnight
  const start = new Date(srchStartDate?.getFullYear(), srchStartDate?.getMonth(), srchStartDate?.getDate()).getTime()

  const parseDMYToTime = (s: string): number | null => {
    if (!s || typeof s !== 'string') return null
    const [dd, mm, yyyy] = s.split('/').map(Number)
    if (!dd || !mm || !yyyy) return null
    const t = new Date(yyyy, mm - 1, dd).getTime()
    return Number.isFinite(t) ? t : null
  }

  const out = data_short
    .map((grp) => {
      const newData = (grp.data ?? [])
        .map((row: any) => {
          const days: string[] = row.day ?? []
          const vals: any[] = row.value ?? []

          const day2: string[] = []
          const val2: any[] = []

          days.forEach((d, i) => {
            const t = parseDMYToTime(d)
            if (t !== null && t >= start) {
              day2.push(d)
              val2.push(vals[i])
            }
          })

          // ถ้า day เป็น array ว่าง -> ไม่เอาแถวนี้
          if (day2.length === 0) return null

          return {...row, day: day2, value: val2}
        })
        .filter((r: any) => r !== null) // ตัดแถวที่ว่าง

      // ถ้ากลุ่มนี้ไม่มีแถวเหลือ -> ตัดกลุ่มทิ้ง
      if (newData.length === 0) return null

      return {...grp, data: newData}
    })
    .filter((g: any) => g !== null)

  return out
}

// แปลง "DD/MM/YYYY" -> Date
const parseDMYShortTwo = (s: string) => {
  const [dd, mm, yyyy] = s.split('/').map(Number)
  return new Date(yyyy, mm - 1, dd)
}

// รองรับค่าที่อาจเป็นสตริงมีคอมมา/ช่องว่าง
const toNumShortTwo = (v: any): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  if (typeof v !== 'string') return 0
  const s = v.replace(/,/g, '').trim()
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

/**
 * รวม data[].value ที่ area.id ซ้ำกัน (จับคู่ด้วย day เท่ากัน)
 * คืนโครงสร้างเดิม แต่ใน data จะเหลือ 1 แถวต่อ 1 area.id
 */
export const mergeSumByAreaAndDay = (test_result_short_: any[]) => {
  if (!Array.isArray(test_result_short_) || test_result_short_.length === 0) return []

  return test_result_short_?.map((group) => {
    const data = Array.isArray(group?.data) ? group.data : []

    // กลุ่มตาม area.id
    const areaMap = new Map<number, {base: any; daySum: Record<string, number | undefined>}>()

    for (const row of data) {
      const areaId = row?.area?.id
      if (areaId == null) continue

      // สร้างกลุ่มถ้ายังไม่มี
      if (!areaMap.has(areaId)) {
        areaMap.set(areaId, {
          base: {...row, day: [], value: []}, // เก็บ metadata แถวแรกของ area นี้
          daySum: {} // เก็บผลรวมแยกตามวัน
        })
      }

      const grp = areaMap.get(areaId)!
      const days: string[] = Array.isArray(row.day) ? row.day : []
      const vals: any[] = Array.isArray(row.value) ? row.value : []

      // รวมค่าตามวัน (ใช้สตริงวันเป็นกุญแจ)
      for (let i = 0; i < days.length; i++) {
        const d = days[i]
        const v = toNumShortTwo(vals[i])
        if (!d) continue
        if (vals[i] || (typeof vals[i] == 'number' && vals[i] == 0)) {
          grp.daySum[d] = (grp.daySum[d] ?? 0) + v
        } else {
          grp.daySum[d] = grp.daySum[d] || undefined
        }
      }
    }

    // สร้างแถวรวมต่อ area โดยเรียงวันตามเวลา
    const mergedRows = Array.from(areaMap.values()).map(({base, daySum}) => {
      const daysSorted = Object.keys(daySum).sort((a, b) => +parseDMYShortTwo(a) - +parseDMYShortTwo(b))
      return {
        ...base,
        day: daysSorted,
        value: daysSorted.map((d) => daySum[d])
      }
    })

    return {...group, data: mergedRows}
  })
}

// Shipper Nomiantion Report
// ========================= Types (ย่อส่วนเท่าที่จำเป็น) =========================
type WeekKey = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

type WeekObj = Record<
  WeekKey,
  {
    gas_day_text: string
    capacityRightMMBTUD?: number | boolean
    nominatedValueMMBTUD?: number | boolean
    overusageMMBTUD?: number | boolean
    imbalanceMMBTUD?: number | boolean // มีในระดับบน ไม่ใช้ใน dataRow
  }
>

type DataRow = {
  gas_day: string
  shipper_name: string
  area_text: string
  zone_text: string
  contract_code_id_arr: number[]
  capacityRightMMBTUD?: number | boolean
  nominatedValueMMBTUD?: number | boolean
  overusageMMBTUD?: number | boolean
  weeklyDay: WeekObj
  zoneObj?: any
  areaObj?: any
}

type Item = {
  capacityRightMMBTUD?: number
  contractAll: number[]
  dataRow: DataRow[]
  gas_day: string
  gas_day_text: string
  id: number
  imbalanceMMBTUD?: number
  nominatedValueMMBTUD?: number
  nomination_type: {id: 1 | 2; name: string; document_type: string; color: string}
  overusageMMBTUD?: number
  shipper_name: string
  weeklyDay: WeekObj
}

// =============== Helpers ===============
const weekKeys: WeekKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const num = (v: number | boolean | null | undefined): number => (typeof v === 'number' ? v : 0)
const deepClone = <T>(x: T): T => (typeof structuredClone === 'function' ? structuredClone(x) : JSON.parse(JSON.stringify(x)))
const getShipperKey = (it: {shipper_name?: string; shipper?: string}) => it.shipper_name ?? it.shipper ?? '__'

// มีสักตัวเดียวที่ซ้ำกันระหว่างสองอาร์เรย์
const hasAnyOverlap = (a?: number[], b?: number[]) => {
  if (!a?.length || !b?.length) return false
  const sa = new Set(a)
  for (const x of b) if (sa.has(x)) return true
  return false
}

// หา key ใน weeklyDay ที่ gas_day_text (ชั้นใน) == target
const findWeekKeyByGasDayText = (weeklyDay: WeekObj, target: string): WeekKey | null => {
  for (const k of weekKeys) if (weeklyDay?.[k]?.gas_day_text === target) return k
  return null
}

// บวก 4 ฟิลด์เข้า target (รองรับ undefined/boolean)
const add4 = (target: any, src: any) => {
  target.capacityRightMMBTUD = num(target.capacityRightMMBTUD) + num(src?.capacityRightMMBTUD)
  target.nominatedValueMMBTUD = num(target.nominatedValueMMBTUD) + num(src?.nominatedValueMMBTUD)
  target.overusageMMBTUD = num(target.overusageMMBTUD) + num(src?.overusageMMBTUD)
  target.imbalanceMMBTUD = num(target.imbalanceMMBTUD) + num(src?.imbalanceMMBTUD)
}

/**
 * Logic:
 * - group ตาม shipper/shipper_name
 * - match Daily(1) กับ Weekly(2) ถ้า contractAll overlap ≥ 1
 * - ชั้นนอกของ Daily: ใช้ daily.gas_day_text หาใน weekly.weeklyDay[..].gas_day_text แล้วบวก 4 ค่าเข้า daily (outer)
 * - dataRow:
 *    1) จับคู่ area_text แล้วใช้ daily.dataRow.gas_day หาใน weeklyRow.weeklyDay[..].gas_day_text บวก 4 ค่าเข้าแถว Daily
 *    2) ถ้า area_text ของ Weekly “ไม่มี” ใน Daily → push ทั้ง obj ของแถวนั้นเข้า daily.dataRow
 */
export function mergeDaily_AddOuterAndRowsFromWeekly(response: Item[]): Item[] {
  const out = deepClone(response)

  const dataTempFirstValueKey = 14
  const dataTempWholeDayKey = 38

  // group ตาม shipper
  const groups: any = new Map<string, Item[]>()
  for (const it of out) {
    const k = getShipperKey(it)
    if (!groups.has(k)) groups.set(k, [])
    groups.get(k)!.push(it)
  }

  for (const [, items] of groups) {
    const dailies = items.filter((i: any) => i.nomination_type?.id === 1)
    const weeklies = items.filter((i: any) => i.nomination_type?.id === 2)
    if (!dailies.length || !weeklies.length) continue

    for (const daily of dailies) {
      const wOverlap = weeklies.filter((w: any) => hasAnyOverlap(daily.contractAll, w.contractAll))

      if (!wOverlap.length) continue

      // ---------- ชั้นนอกของ Daily ----------
      for (const weekly of wOverlap) {
        const wkKey = findWeekKeyByGasDayText(weekly.weeklyDay, daily.gas_day_text)
        if (!wkKey) continue
        const srcTop = weekly.weeklyDay[wkKey]
        add4(daily, srcTop) // บวกเข้า outer fields ของ Daily
      }

      let dailyDate = dayjs(daily.gas_day_text, 'DD/MM/YYYY')
      if (!dailyDate.isValid()) {
        dailyDate = dayjs(daily.gas_day, 'DD/MM/YYYY')
      }
      const dayOfWeek = dailyDate.isValid() ? parseInt(dailyDate.format('d')) : null // The day of the week, with Sunday as 0

      // ---------- รวม + เติม dataRow ----------
      if (!Array.isArray(daily.dataRow)) daily.dataRow = []

      // ใช้ Set เพื่อกัน push แถวซ้ำ (กรณี Weekly หลายตัวมี area_text เดียวกันที่ Daily ไม่มี)
      const existingAreas = new Set<string>(daily.dataRow.map((r: any) => r.area_text))

      for (const weekly of wOverlap) {
        if (!Array.isArray(weekly.dataRow) || weekly.dataRow.length === 0) continue

        // 1) รวมกับแถวที่ area_text ตรงกัน
        for (const dRow of daily.dataRow) {
          const wRow = weekly.dataRow.find((r: any) => r.area_text === dRow.area_text)
          if (!wRow) continue

          const rowKey = findWeekKeyByGasDayText(wRow.weeklyDay, dRow.gas_day)
          if (!rowKey) continue

          const srcRow = wRow.weeklyDay[rowKey]
          add4(dRow, srcRow)

          if (dRow.nominaionPointZone && Array.isArray(dRow.nominaionPointZone) && dRow.nominaionPointZone.length > 0 && dRow.nominaionPointZone[0].zone && Array.isArray(dRow.nominaionPointZone[0].zone) && dayOfWeek !== null) {
            wRow.nominaionPointZone?.map((weekNominaionPointZone: any) => {
              weekNominaionPointZone?.zone?.map((weekNominaionPointInZone: any) => {
                const weekDataTemp = typeof weekNominaionPointInZone.data_temp == 'string' ? JSON.parse(weekNominaionPointInZone.data_temp) : weekNominaionPointInZone.data_temp
                const wholeDayValue = weekDataTemp[dataTempFirstValueKey + dayOfWeek]
                let eachHourValue = undefined
                if (wholeDayValue || wholeDayValue == 0) {
                  const wholeDayValueNumber = Number(wholeDayValue)
                  if (!Number.isNaN(wholeDayValueNumber)) {
                    eachHourValue = wholeDayValueNumber / 24
                  }
                }
                const dailyDataTempFromWeekly: any = {}
                let i = 0
                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = weekDataTemp[key]
                  i++
                } while (i < dataTempFirstValueKey)

                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = `${eachHourValue}`
                  i++
                } while (i < dataTempWholeDayKey)
                dailyDataTempFromWeekly[dataTempWholeDayKey] = wholeDayValue

                dRow.nominaionPointZone[0].zone.push({
                  ...weekNominaionPointInZone,
                  data_temp: dailyDataTempFromWeekly
                })
              })
            })
          }

          if (dRow.conceptPointZone && Array.isArray(dRow.conceptPointZone) && dRow.conceptPointZone.length > 0 && dRow.conceptPointZone[0].zone && Array.isArray(dRow.conceptPointZone[0].zone) && dayOfWeek !== null) {
            wRow.conceptPointZone?.map((weekConceptPointZone: any) => {
              weekConceptPointZone?.zone?.map((weekConceptPointZoneInZone: any) => {
                const weekDataTemp = typeof weekConceptPointZoneInZone.data_temp == 'string' ? JSON.parse(weekConceptPointZoneInZone.data_temp) : weekConceptPointZoneInZone.data_temp
                const wholeDayValue = weekDataTemp[dataTempFirstValueKey + dayOfWeek]
                let eachHourValue = undefined
                if (wholeDayValue || wholeDayValue == 0) {
                  const wholeDayValueNumber = Number(wholeDayValue)
                  if (!Number.isNaN(wholeDayValueNumber)) {
                    eachHourValue = wholeDayValueNumber / 24
                  }
                }
                const dailyDataTempFromWeekly: any = {}
                let i = 0
                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = weekDataTemp[key]
                  i++
                } while (i < dataTempFirstValueKey)

                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = `${eachHourValue}`
                  i++
                } while (i < dataTempWholeDayKey)
                dailyDataTempFromWeekly[dataTempWholeDayKey] = wholeDayValue

                dRow.conceptPointZone[0].zone.push({
                  ...weekConceptPointZone,
                  data_temp: dailyDataTempFromWeekly
                })
              })
            })
          }
        }

        // 2) เติมแถวที่ Daily ไม่มี area_text นี้ → push ทั้ง obj --> สำหรับหน้า view
        for (const wRow of weekly.dataRow) {
          if (existingAreas.has(wRow.area_text)) continue // มีแล้ว ไม่ต้องยัดซ้ำ
          if (dayOfWeek) {
            const dailyNominaionPointZoneFromWeekly = wRow.nominaionPointZone?.map((weekNominaionPointZone: any) => {
              return weekNominaionPointZone?.zone?.map((weekNominaionPointInZone: any) => {
                const weekDataTemp = typeof weekNominaionPointInZone.data_temp == 'string' ? JSON.parse(weekNominaionPointInZone.data_temp) : weekNominaionPointInZone.data_temp
                const wholeDayValue = weekDataTemp[dataTempFirstValueKey + dayOfWeek]
                let eachHourValue = undefined
                if (wholeDayValue || wholeDayValue == 0) {
                  const wholeDayValueNumber = Number(wholeDayValue)
                  if (!Number.isNaN(wholeDayValueNumber)) {
                    eachHourValue = wholeDayValueNumber / 24
                  }
                }
                const dailyDataTempFromWeekly: any = {}
                let i = 0
                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = weekDataTemp[key]
                  i++
                } while (i < dataTempFirstValueKey)

                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = `${eachHourValue}`
                  i++
                } while (i < dataTempWholeDayKey)
                dailyDataTempFromWeekly[dataTempWholeDayKey] = wholeDayValue

                return {
                  ...weekNominaionPointInZone,
                  data_temp: dailyDataTempFromWeekly
                }
              })
            })

            const dailyConceptPointZoneFromWeekly = wRow.conceptPointZone?.map((weekConceptPointZone: any) => {
              return weekConceptPointZone?.zone?.map((weekConceptPointInZone: any) => {
                const weekDataTemp = typeof weekConceptPointInZone.data_temp == 'string' ? JSON.parse(weekConceptPointInZone.data_temp) : weekConceptPointInZone.data_temp
                const wholeDayValue = weekDataTemp[dataTempFirstValueKey + dayOfWeek]
                let eachHourValue = undefined
                if (wholeDayValue || wholeDayValue == 0) {
                  const wholeDayValueNumber = Number(wholeDayValue)
                  if (!Number.isNaN(wholeDayValueNumber)) {
                    eachHourValue = wholeDayValueNumber / 24
                  }
                }
                const dailyDataTempFromWeekly: any = {}
                let i = 0
                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = weekDataTemp[key]
                  i++
                } while (i < dataTempFirstValueKey)

                do {
                  const key = `${i}`
                  dailyDataTempFromWeekly[key] = `${eachHourValue}`
                  i++
                } while (i < dataTempWholeDayKey)
                dailyDataTempFromWeekly[dataTempWholeDayKey] = wholeDayValue

                return {
                  ...weekConceptPointInZone,
                  data_temp: dailyDataTempFromWeekly
                }
              })
            })

            daily.dataRow.push({
              ...wRow,
              nominaionPointZone: dailyNominaionPointZoneFromWeekly,
              conceptPointZone: dailyConceptPointZoneFromWeekly
            })
          } else {
            daily.dataRow.push(deepClone(wRow)) // ยัดทั้ง obj เข้าไป
          }
          existingAreas.add(wRow.area_text)
        }
      }
    }
  }

  return out
}

export const isAllWeekly = (list: Array<{nomination_type?: {id?: number}}>) => list.length > 0 && list.every((item) => item?.nomination_type?.id === 2)
export const isAllDaily = (list: Array<{nomination_type?: {id?: number}}>) => list.length > 0 && list.every((item) => item?.nomination_type?.id === 1)

// const KEY_FIELDS = [0, 1, 2, 3, 6, 9] as const;
const KEY_FIELDS = [0, 1, 2, 9] as const
const HOUR_KEYS = Array.from({length: 24}, (_, i) => 14 + i) // 14..37

const toStringNoExp = (n: number) => {
  let s = n.toFixed(10)
  s = s.replace(/\.?0+$/, '') // ตัดศูนย์เกิน
  return s === '' ? '0' : s
}

const toNumberSafeX = (v: any): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'number') return isFinite(v) ? v : 0
  if (typeof v === 'string') {
    const s = v.trim().replace(/,/g, '')
    const n = parseFloat(s)
    return isFinite(n) ? n : 0
  }
  return 0
}

const makeGroupKey = (row: any) => KEY_FIELDS.map((idx) => row.newObj?.[idx]?.value ?? '').join('|')

export function sumValidateCutByGroup(input: any[]): any[] {
  // 1) รวมยอดต่อกลุ่ม
  const groupSum = new Map<string, {sums: Record<number, number>}>()

  for (const row of input) {
    const gk = makeGroupKey(row)
    if (!groupSum.has(gk)) {
      const init: Record<number, number> = {}
      HOUR_KEYS.forEach((k) => (init[k] = 0))
      groupSum.set(gk, {sums: init})
    }
    const bucket = groupSum.get(gk)!
    for (const k of HOUR_KEYS) {
      const cellVal = row.newObj?.[k]?.value
      bucket.sums[k] += toNumberSafeX(cellVal)
    }
  }

  // 2) กระจายผลรวมกลับ “ตำแหน่งเดิม” ของทุกแถวในกลุ่ม
  //    (คงจำนวนแถวและโครงสร้างเดิมไว้)
  return input.map((row) => {
    const gk = makeGroupKey(row)
    const sums = groupSum.get(gk)!.sums

    // clone ตื้น ๆ + clone newObj เฉพาะส่วนที่แก้
    const newRow: any = {
      ...row,
      newObj: {...row.newObj}
    } as Row

    for (const k of HOUR_KEYS) {
      const oldCell = row.newObj?.[k] ?? {}
      // คง header/valueBook/valueBookDay/min/max เดิมไว้ เปลี่ยนเฉพาะ value
      newRow.newObj[k] = {
        ...oldCell,
        value: toStringNoExp(sums[k])
      }
    }
    return newRow
  })
}

export const addSumPerRow = (data_new?: any) => {
  const addSumPerRow = (data_new ?? []).map((row: any) => {
    const {dataRow, ...nrow} = row

    // dataRow คือข้อมูลที่เป็น area ๆ ตอนกด view เข้ามาจากหน้า list

    // รวม capacityRightMMBTUD ของทุกตัวใน dataRow
    const sum = (dataRow ?? []).reduce((acc: number, it: any) => acc + toNum(it?.capacityRightMMBTUD), 0)

    // finalTotalUsage เทียบผลรวมกับ row.nominatedValueMMBTUD
    // sum > nominatedValueMMBTUD ---> ไม่ถือว่า overuse ให้เป็น 0
    // sum < nominatedValueMMBTUD ---> เอาค่าส่วนต่างแบบบวกเก็บไว้
    const tmpOverUseage = sum - row?.nominatedValueMMBTUD
    let finalTotalUsage = tmpOverUseage > 0 ? 0 : Math.abs(tmpOverUseage)

    // คำนวณ overusageMMBTUD รายรายการย่อยใน dataRow
    let overusageMMBTUD = 0
    let ndataRow = dataRow?.map((e_: any) => {
      const {overusageMMBTUD: overusageMMBTUD_old, ..._nE} = e_
      let overusageMMBTUD_ = _nE?.capacityRightMMBTUD - _nE?.nominatedValueMMBTUD
      let noverusageMMBTUD_ = overusageMMBTUD_ > 0 ? 0 : Math.abs(overusageMMBTUD_)
      overusageMMBTUD += noverusageMMBTUD_
      return {
        overusageMMBTUD: noverusageMMBTUD_,
        ..._nE
      }
    })

    // return { ...nrow, tmpSumCapacityRightMMBTUD: sum, overusageMMBTUD, dataRow: ndataRow };
    return {...nrow, tmpSumCapacityRightMMBTUD: sum, tmpOverUseage: finalTotalUsage, overusageMMBTUD, dataRow: ndataRow}
  })
  return addSumPerRow
}

export const filterItemsAllNullMmscfd = (data_for_filter: any, displayUnit?: string) =>
  (data_for_filter ?? []).map((block: any) => {
    const groups = (block?.groups ?? [])
      .map((g: any) => ({
        ...g,
        items: (g?.items ?? []).filter((it: any) => {
          const ts = it?.timeShow
          if (!Array.isArray(ts) || ts.length === 0) return true
          return !ts.every((t: any) => (displayUnit == 'MMBTUD' ? t?.value === null : t?.valueMmscfd === null))
        })
      }))
      .filter((g: any) => (g.items ?? []).length > 0) // ลบ group ว่าง

    return {...block, groups}
  })

export const filterItemsAllNullMmscfd2 = (data_for_filter: any, displayUnit?: string) =>
  (data_for_filter ?? []).map((block: any) => {
    const groups = (block?.groups ?? [])
      .map((g: any) => ({
        ...g,
        items: (g?.items ?? []).filter((it: any) => {
          const ts = it?.timeShow
          return displayUnit == 'MMBTUD' ? ts?.value !== null : ts?.valueMmscfd !== null
        })
      }))
      .filter((g: any) => (g.items ?? []).length > 0)

    return {...block, groups}
  })

type WeeklyDayX = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'
export const findWeeklyByGasDay = (weeklyDay: Record<string, any> | undefined, gasDayFilter: string | undefined): {dayKey: WeeklyDayX; data: any} | null => {
  if (!weeklyDay || !gasDayFilter) return null

  for (const [dayKey, data] of Object.entries(weeklyDay)) {
    if (data?.gas_day_text === gasDayFilter) {
      return {dayKey: dayKey as WeeklyDayX, data}
    }
  }
  return null
}

// แปลง "HH:mm" -> นาทีเพื่อเทียบเวลา
const timeToMinX = (t: string) => {
  const [h, m] = String(t ?? '0:0')
    .split(':')
    .map(Number)
  return (h | 0) * 60 + (m | 0)
}

/**
 * คืน array ใหม่ที่คงไว้เฉพาะรายการ "ชั่วโมงแรกสุด" ต่อ key = shipper_name|point|valueMmscfd
 * - ภายใน item เดียว: ถ้าค่า valueMmscfd เท่าเดิมหลายชั่วโมง → เก็บชั่วโมงแรกสุดเท่านั้น
 * - ข้าม item: ถ้า key เดียวกันชนกัน → เก็บอันที่ชั่วโมงน้อยสุดของทั้งก้อน
 */
export const keepEarliestPerValue = (data_xxx: any[] = []) => {
  // เก็บ earliest global ต่อ key (shipper|point|valueMmscfd)
  const globalEarliestMin: Map<string, number> = new Map()

  // รอบแรก: หา earliest ข้ามทุกไอเท็ม
  for (const it of data_xxx) {
    const shipper = it?.shipper_name ?? ''
    const point = it?.point ?? ''
    const ts = Array.isArray(it?.timeShow) ? it.timeShow : []
    for (const rec of ts) {
      const v = rec?.valueMmscfd
      if (v == null) continue // ข้าม null/undefined
      const key = `${shipper}|${point}|${v}`
      const mm = timeToMinX(rec?.time)
      const cur = globalEarliestMin.get(key)
      if (cur == null || mm < cur) globalEarliestMin.set(key, mm)
    }
  }

  // รอบสอง: สร้างผลลัพธ์ใหม่
  return data_xxx.map((it) => {
    const shipper = it?.shipper_name ?? ''
    const point = it?.point ?? ''
    const ts = (Array.isArray(it?.timeShow) ? it.timeShow.filter((timeShowItem: any) => timeShowItem?.time != 'Total') : []).slice()

    // sort เวลาเผื่อกรณีข้อมูลไม่เรียง
    ts.sort((a: any, b: any) => timeToMinX(a?.time) - timeToMinX(b?.time))

    const seenLocal = new Set<string>() // กันซ้ำภายใน item เดียวกัน
    const filtered: any[] = []

    for (const rec of ts) {
      const v = rec?.valueMmscfd
      if (v == null) continue

      const key = `${shipper}|${point}|${v}`
      const mm = timeToMinX(rec?.time)

      // เงื่อนไข:
      // 1) ต้องเป็นชั่วโมงแรกสุดของ value นี้ "ในภาพรวม" (เทียบ global)
      // 2) และยังไม่เคยเก็บค่าตัวนี้ในไอเท็มเดียวกัน
      const earliest = globalEarliestMin.get(key)
      if (earliest != null && mm === earliest && !seenLocal.has(key)) {
        filtered.push(rec)
        seenLocal.add(key)
      }
      // ถ้าอยาก “เก็บ earliest เฉพาะใน item ตัวเอง” ไม่สน global:
      // if (!seenLocal.has(key)) { filtered.push(rec); seenLocal.add(key); }
    }

    return {
      ...it,
      timeShow: filtered,
      // อัพเดต timeShowZero เป็นตัวแรกที่เหลือ (ถ้ามี)
      timeShowZero: filtered[0]?.time ?? it?.timeShowZero ?? null
    }
  })
}

/**
 * กรองให้เหลือเฉพาะเรคคอร์ดที่เป็น "ชั่วโมงแรกสุด"
 * ต่อ key = shipper_name | valueMmscfd (ไม่สน point)
 * - หา earliest ข้ามทั้งชุดข้อมูลก่อน
 * - จากนั้นกรอง timeShow ในแต่ละ item ให้เหลือเฉพาะชั่วโมงนั้น
 * - คงโครงสร้าง time -> groups -> items
 * - อัปเดต timeShowZero เป็น time ตัวแรกที่เหลือ (ถ้ามี)
 */
export const keepEarliestPerValueForZzz = (data_zzz: any[] = []) => {
  const globalEarliestMin: Map<string, number> = new Map()

  // รอบ 1: หา earliest นาทีสำหรับแต่ละ (shipper_name, valueMmscfd)
  for (const t of data_zzz ?? []) {
    for (const grp of t?.groups ?? []) {
      for (const it of grp?.items ?? []) {
        const shipper = it?.shipper_name ?? ''
        for (const rec of it?.timeShow ?? []) {
          const v = rec?.valueMmscfd
          if (v == null) continue // ข้าม null/undefined
          const key = `${shipper}|${v}`
          const mm = timeToMinX(rec?.time)
          const cur = globalEarliestMin.get(key)
          if (cur == null || mm < cur) globalEarliestMin.set(key, mm)
        }
      }
    }
  }

  // รอบ 2: คงโครงสร้างเดิม แต่กรอง timeShow ให้เหลือเฉพาะ earliest global
  return (data_zzz ?? []).map((t) => {
    const groups = (t?.groups ?? []).map((grp: any) => {
      const items = (grp?.items ?? []).map((it: any) => {
        const shipper = it?.shipper_name ?? ''
        const ts = Array.isArray(it?.timeShow) ? [...it.timeShow] : []

        // เผื่อข้อมูลไม่เรียงเวลา
        ts.sort((a, b) => timeToMinX(a?.time) - timeToMinX(b?.time))

        // กันซ้ำภายใน item ตัวเดียวกัน (กรณีมีหลายเรคคอร์ดที่ time เดียวกัน)
        const seenLocal = new Set<string>()
        const filtered = ts.filter((rec: any) => {
          const v = rec?.valueMmscfd
          if (v == null) return false
          const key = `${shipper}|${v}`
          const earliest = globalEarliestMin.get(key)
          if (earliest == null) return false
          const mm = timeToMinX(rec?.time)
          if (mm !== earliest) return false // เก็บเฉพาะชั่วโมงแรกสุดของคู่ (shipper, v)
          if (seenLocal.has(key)) return false // กันซ้ำใน item
          seenLocal.add(key)
          return true
        })

        return {
          ...it,
          timeShow: filtered
          // timeShowZero: filtered[0]?.time ?? it?.timeShowZero ?? null,
        }
      })

      return {...grp, items}
    })

    return {...t, groups}
  })
}

// เมนู cap contract mgn
// เอาไว้เช็คว่าวันที่ from-to tableEntry และ tableExit เท่ากันมั้ย
// ถ้าไม่เท่าจะไม่ให้กด save
export const isSameRange = (a?: {from?: string; to?: string}, b?: {from?: string; to?: string}) => !!a && !!b && a.from === b.from && a.to === b.to

// ------------------------------------------------------
// แปลง "DD/MM/YYYY" -> จำนวนเต็ม YYYYMM เพื่อเทียบเดือนแบบเร็ว ๆ
const ymKey = (dmy: string): number => {
  const [d, m, y] = dmy.split('/').map(Number)
  return y * 100 + m // ไม่สนวัน
}

// ------------------------------------------------------
// เมนู planning dashboard
// สำหรับ medium term each shipper

// helpers สำหรับจัดการเดือน "DD/MM/YYYY" (ถือว่าเป็นวันแรกของเดือน)
const parseDMY = (s: string) => {
  const [dd, mm, yyyy] = s.split('/').map(Number)
  return {y: yyyy, m: mm}
}
const fmtDMY = (y: number, m: number) => `01/${String(m).padStart(2, '0')}/${String(y).padStart(4, '0')}`

const monthBefore = (dmy: string) => {
  let {y, m} = parseDMY(dmy)
  m -= 1
  if (m < 1) {
    m = 12
    y -= 1
  }
  return fmtDMY(y, m)
}
const monthRangeInclusive = (startDMY: string, endDMY: string) => {
  const out: string[] = []
  let {y: ys, m: ms} = parseDMY(startDMY)
  const {y: ye, m: me} = parseDMY(endDMY)
  while (ys < ye || (ys === ye && ms <= me)) {
    out.push(fmtDMY(ys, ms))
    ms += 1
    if (ms > 12) {
      ms = 1
      ys += 1
    }
  }
  return out
}

export function filterByMonthFrom(data: any[], srchMonth: string) {
  const targetYM = ymKey(srchMonth)

  return (data ?? []).map((block) => {
    const newData = (block?.data ?? [])
      .map((it: any) => {
        let months: string[] = Array.isArray(it?.month) ? it.month.slice() : []
        let values: (number | null | undefined)[] = Array.isArray(it?.value) ? it.value.slice() : []

        // กัน length ไม่เท่ากัน → pad values ด้วย null ให้เท่ากับ months
        if (values.length < months.length) {
          values = values.concat(Array(months.length - values.length).fill(null))
        }

        if (months.length === 0) {
          // ไม่มีเดือนเดิม → เริ่มจาก srchMonth ด้วยค่า null
          return {
            ...it,
            month: [srchMonth],
            value: [null]
          }
        }

        const first = months[0]
        const last = months[months.length - 1]

        // กรณี srchMonth ก่อนเดือนแรก → เติมย้อนหลังจนถึงเดือนก่อน first
        if (targetYM < ymKey(first)) {
          const endFill = monthBefore(first)
          // ถ้า srchMonth == first (เชิงคณิตไม่เข้าเงื่อนไขนี้อยู่แล้ว) จะไม่เติม
          const monthsToPrepend = monthRangeInclusive(srchMonth, endFill)
          const addCount = monthsToPrepend.length

          const monthSliced = [...monthsToPrepend, ...months]
          const valueSliced = [...Array(addCount).fill(null), ...values]

          return {
            ...it,
            month: monthSliced,
            value: valueSliced.slice(0, monthSliced.length)
          }
        }

        // หา index แรกที่ it.month >= srchMonth (พฤติกรรมเดิม)
        let startIdx = -1
        for (let i = 0; i < months.length; i++) {
          if (ymKey(months[i]) >= targetYM) {
            startIdx = i
            break
          }
        }

        if (startIdx === -1) {
          // ไม่มีเดือนใด >= srchMonth (แปลว่า srchMonth > last) → ทิ้ง item นี้
          return null
        }

        // slice ทั้ง month และ value ให้ตรงกัน
        const monthSliced = months.slice(startIdx)
        const valueSliced = values.slice(startIdx, startIdx + monthSliced.length)

        return {
          ...it,
          month: monthSliced,
          value: valueSliced
        }
      })
      .filter(Boolean) // ลบ item ที่ถูกตัดจนว่าง

    return {
      ...block,
      data: newData
    }
  })
}

// PLANNING SHORT TERM
// --- Helpers สำหรับรายวัน ---
const dKey = (ddmmyyyy: string) => Number(dayjs(ddmmyyyy, 'DD/MM/YYYY', true).format('YYYYMMDD'))

const dayBefore = (ddmmyyyy: string) => dayjs(ddmmyyyy, 'DD/MM/YYYY', true).subtract(1, 'day').format('DD/MM/YYYY')

const dayRangeInclusive = (startDDMMYYYY: string, endDDMMYYYY: string) => {
  const start = dayjs(startDDMMYYYY, 'DD/MM/YYYY', true)
  const end = dayjs(endDDMMYYYY, 'DD/MM/YYYY', true)
  if (!start.isValid() || !end.isValid() || start.isAfter(end)) return []
  const out: string[] = []
  for (let d = start; !d.isAfter(end); d = d.add(1, 'day')) {
    out.push(d.format('DD/MM/YYYY'))
  }
  return out
}

// --- ฟังก์ชันหลัก: กรอง/เติมด้วย “วัน” แทน “เดือน” ---
export const filterByDayFrom = (data: any[], srchDay: string) => {
  const targetD = dKey(srchDay)

  return (data ?? []).map((block) => {
    const newData = (block?.data ?? [])
      .map((it: any) => {
        // ใช้คีย์ day แทน month
        let days: string[] = Array.isArray(it?.day) ? it.day.slice() : []
        let values: (number | null | undefined)[] = Array.isArray(it?.value) ? it.value.slice() : []

        // pad ให้ length เท่ากัน (values สั้นกว่า days → เติม null)
        if (values.length < days.length) {
          values = values.concat(Array(days.length - values.length).fill(null))
        }

        // เคสไม่มีวันเดิมเลย → เริ่มด้วย srchDay และค่า null
        if (days.length === 0) {
          return {
            ...it,
            day: [srchDay],
            value: [null]
          }
        }

        const first = days[0]
        const last = days[days.length - 1]

        // ถ้า srchDay มาก่อนวันแรก → เติมย้อนหลังตั้งแต่ srchDay ถึงวันก่อน first
        if (targetD < dKey(first)) {
          const endFill = dayBefore(first)
          const daysToPrepend = dayRangeInclusive(srchDay, endFill)
          const addCount = daysToPrepend.length

          const daySliced = [...daysToPrepend, ...days]
          const valueSliced = [...Array(addCount).fill(null), ...values]

          return {
            ...it,
            day: daySliced,
            value: valueSliced.slice(0, daySliced.length)
          }
        }

        // หา index แรกที่ it.day >= srchDay
        let startIdx = -1
        for (let i = 0; i < days.length; i++) {
          if (dKey(days[i]) >= targetD) {
            startIdx = i
            break
          }
        }

        if (startIdx === -1) {
          // ไม่มีวันใด >= srchDay (เช่น srchDay > last) → ตัดทิ้ง item นี้
          return null
        }

        // slice ทั้ง day และ value ให้ตรงกัน
        const daySliced = days.slice(startIdx)
        const valueSliced = values.slice(startIdx, startIdx + daySliced.length)

        return {
          ...it,
          day: daySliced,
          value: valueSliced
        }
      })
      .filter(Boolean) // ลบ item ที่กลายเป็น null

    return {
      ...block,
      data: newData
    }
  })
}

// ------------------------------------------------------
// ------------------------------------------------------
// เมนู planning dashboard
// สำหรับ medium term each shipper

// แปลงทุกค่า NaN ให้เป็น null (รองรับซ้อนหลายชั้นและ array)
export const nanToNullDeep = (input: any): any => {
  if (input === null) return null

  // ถ้าเป็น primitive
  if (typeof input !== 'object') {
    return Number.isNaN(input) ? null : input
  }

  // ถ้าเป็น Array
  if (Array.isArray(input)) {
    return input.map(nanToNullDeep)
  }

  // ถ้าเป็น Object
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(input)) {
    out[k] = nanToNullDeep(v)
  }
  return out
}

export const decodeBase64JsonK = (data: unknown) => {
  if (typeof data !== 'string' || !data.trim()) return null

  // 1) normalize URL-safe base64 & add padding
  let b64 = data.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '')
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : ''
  b64 += pad

  // 2) base64 -> binary string (browser) หรือ utf8 (Node)
  let binary: string
  if (typeof atob === 'function') {
    binary = atob(b64)
  } else {
    // Node/SSR
    return parsePossiblyDoubleEncoded(Buffer.from(b64, 'base64').toString('utf8'))
  }

  // 3) binary -> utf8 string (แก้ปัญหา UTF-8)
  const utf8 = decodeURIComponent(Array.prototype.map.call(binary, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''))

  // 4) parse อัตโนมัติ เผื่อ double-encoded
  return parsePossiblyDoubleEncoded(utf8)
}

const parsePossiblyDoubleEncoded = (s: string) => {
  let v: any = s.trim()
  for (let i = 0; i < 3; i++) {
    if (typeof v === 'string') {
      try {
        const parsed = JSON.parse(v)
        v = parsed
      } catch {
        break // ไม่ใช่ JSON แล้ว
      }
    } else {
      break // กลายเป็น object/array แล้ว
    }
  }
  return v
}

// New / Duplicate จะต้องเช็คกับข้อมูล Master Path ที่สร้างไว้ก่อนหน้าแล้ว จะต้องสร้างไม่ได้ (ในความหมายนี้คือ ห้ามเหมือนกันทุกตัว ถ้าเหมือนกับตัวที่เคยสร้างไปแล้วจะต้องบันทึกไม่ได้) https://app.clickup.com/t/86euzxxte
// ใช้กับ config master path
// เทียบสองอาเรย์แบบ "สมาชิกเท่ากัน" ไม่สนลำดับ รองรับ duplicate
const sameMembers = (a: number[] = [], b: number[] = []) => {
  if (a.length !== b.length) return false
  const freq = new Map<number, number>()
  for (const x of a) freq.set(x, (freq.get(x) ?? 0) + 1)
  for (const y of b) {
    const c = freq.get(y)
    if (!c) return false
    c === 1 ? freq.delete(y) : freq.set(y, c - 1)
  }
  return freq.size === 0
}

export const hasMatchingNodeIds = (data_node: Array<{id: number; node_id: number[]}>, target: number[]) => {
  if (!Array.isArray(target)) return false
  return (data_node ?? []).some((row) => sameMembers(row?.node_id ?? [], target))
}

// หาวันที่ของวันอาทิตย์ที่ผ่านมา
// เอาไว้ใช้กับ DatePickaSearch
export const getLastSunday = () => {
  const nowBKK = dayjs().tz('Asia/Bangkok')
  // วันอาทิตย์ = 0 ใน dayjs
  const daysToSubtract = nowBKK.day() === 0 ? 7 : nowBKK.day()
  const lastSundayBKK = nowBKK.startOf('day').subtract(daysToSubtract, 'day')

  // ได้ Date ของ BKK ที่เป็นวันอาทิตย์ที่ผ่านมา
  const defaultDate = lastSundayBKK.toDate()

  return defaultDate
}

// ใช้กับหน้า Query Shipper Nomination File --> Tab Weekly
// เอาไว้ปรับ srchEndDate เคสที่เสิช gasweek from-to แล้ว start-end มันเป็นวันเดียวกัน
// ฟังชั่นนี้จะเปลี่ยน srchEndDate เป็นวันอาทิตย์วีคหน้า
export const adjustEndDateForTab = (tab: string | number, srchStartDate: Date | null, srchEndDate: Date | null): Date | null => {
  if (tab !== 1 || !srchStartDate || !srchEndDate) {
    return srchEndDate
  }

  const isSameDay = dayjs(srchStartDate).isSame(dayjs(srchEndDate), 'day')

  if (!isSameDay) {
    return srchEndDate
  }

  const nextSunday = dayjs(srchEndDate)
    .add(1, 'week')
    .subtract(1, 'day')
    .day(0) // Sunday
    .startOf('day')
    .toDate()

  return nextSunday
}

// ใช้กับ planning dashboard short term
// เอาไว้ตัด 0 หัวท้าย array เปลี่ยนเป็น null
export const trimEdgeZerosToNull = (data: number[]) => {
  let start = 0
  let end = data.length - 1

  // หา index ตัวแรกที่ไม่ใช่ 0
  while (start <= end && data[start] === 0) start++

  // หา index ตัวท้ายที่ไม่ใช่ 0
  while (end >= start && data[end] === 0) end--

  return data.map((v, i) => {
    if ((i < start || i > end) && v === 0) return null
    return v
  })
}

export const isRowOverCap = (row: any, tabIndex2ndTab: number, nomData: any[], dataEva: any) => {
  const findValidate = nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)

  const targetData = dataEva?.newDaily?.find((item: any) => {
    const area_id = findValidate?.area?.entry_exit_id == 1 ? findValidate?.area?.id : findValidate?.area?.supply_reference_quality_area

    return item.area.id === area_id && item.zone.name === findValidate?.zone?.name && item.parameter === 'HV'
  })

  let hourlyLimit = 0
  let totalLimit = 0

  if (tabIndex2ndTab == 0) {
    hourlyLimit = Number(findValidate?.mmscf_max_cap ?? 0)
    totalLimit = hourlyLimit * 24
  } else {
    const hv = Number(targetData?.valueBtuScf ?? 0)
    const maxCap = Number(findValidate?.maximum_capacity ?? 0)

    hourlyLimit = (maxCap * hv) / 24
    totalLimit = maxCap * hv
  }

  const totalValue = Number(row?.totalCap ?? 0)
  const isTotalOver = totalValue >= totalLimit

  const isAnyHourOver = Array.from({length: 24}, (_, i) => i + 1).some((hour) => {
    const hourValue = Number(row?.[`sum_H${hour}`] ?? 0)
    return hourValue >= hourlyLimit
  })

  return isTotalOver || isAnyHourOver
}
