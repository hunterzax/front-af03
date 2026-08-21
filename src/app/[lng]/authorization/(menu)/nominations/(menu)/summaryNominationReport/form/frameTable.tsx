import { useEffect } from "react";
import React, { useState } from 'react';
import { Tab, Tabs } from "@mui/material";
import TableAllNomination from "./tableAll/tableAllNom";
import TableAllArea from "./tableAll/tableAllArea";
import TableAllTotalSystem from "./tableAll/tableAllTotalSystem";
import TableWeeklyNomination from "./tableWeekly/tableWeeklyNom";
import TableWeeklyArea from "./tableWeekly/tableWeeklyArea";
import TableWeeklyTotalSystem from "./tableWeekly/tableWeeklyTotalSystem";
import TableDailyNomination from "./tableDaily/tableDailyNom";
import TableDailyArea from "./tableDaily/tableDailyArea";
import TableDailyTotalSystem from "./tableDaily/tableDailyTotalSystem";
import NodataTable from "@/components/other/nodataTable";
import ModalSubmissionDetails from "../../../../allocation/(menu)/allocationReview/form/modalSubmissionDetail";
import ModalSubmissionDetailsSum from "./modalSubmissionDetail";
import { formatNumberSixDecimalNom, formatNumberThreeDecimalNom, formatNumberThreeDecimalNomRound } from "@/utils/generalFormatter";

import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { parseToNumber } from "@/utils/exportMiddleNew";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");


// ********************************************************************************************************************
// ทุก Tab ของเมนูนี้ Column Utilization แสดงทศนิยมแค่สองตำแหน่ง ทั้งหน้า UI และใน Excel https://app.clickup.com/t/86etzcgv7
// ********************************************************************************************************************


// หน้านี้มี Tab Nomination, Area, Total System
// tab MMSCF, MMBTU
// tab hour ['All Day' ,'1-6 Hr.' , '7-12 Hr.' , '13-18 Hr.' , '19-24 Hr.']

const FrameTable: React.FC<any> = ({ checkIsAllAreaImbalance, tabIndexNomAreaTotal, setTabIndexNomAreaTotal, activeButton, tableData, dataEva, isLoading, userPermission, zoneText, tempData, setTempData, tempDataConcept, setTempDataConcept, areaMaster, zoneMaster, entryExitMaster, setIsEdited, tabEntry, tabConcept, setCheckIsAllAreaImbalance, srchStartDate, tabIdxNomAreaTotal, nomDataK, srchCheckbox, setTabIndexFrameTableMain, setTabIndexFrameTableSub }) => {
    // ############### TAB NOM, AREA, TOTAL SYSTEM ###############
    // const [tabIndexNomAreaTotal, setTabIndexNomAreaTotal] = useState(0);
    const [mdSubmissionView, setMdSubmissionView] = useState(false);
    const [warningMessage, setWarningMessage] = useState([]);
    // console.log('data : ', data);
    // process 
    // All - nomination MMSCF (เสร็จ)
    // All - nomination MMBTU (เสร็จ)
    // All - area MMBTU (เสร็จ)
    // X All - area Imvalance (UI ไม่มี valiedate - ไม่ต้องทำ)
    // X All - totalsystem (UI ไม่มี valiedate - ไม่ต้องทำ)
    // Weekly - nomination MMSCF (เสร็จ)
    // Weekly - nomination MMBTU (เสร็จ)
    // Weekly - area MMBTU (เสร็จ)
    // X Weekly - area Imvalance (UI ไม่มี valiedate - ไม่ต้องทำ)
    // X Weekly - totalsystem (UI ไม่มี valiedate - ไม่ต้องทำ)
    // Daily - nomination MMSCF (เสร็จ)
    // Daily - nomination MMBTU (เสร็จ)
    // Daily - area MMBTU (เสร็จ)
    // X Daily - area Imvalance (UI ไม่มี valiedate - ไม่ต้องทำ)
    // X Daily - totalsystem (UI ไม่มี valiedate - ไม่ต้องทำ)
    const openWarning = (data:any) => {
        // console.log('data : ', data);
        // console.log('tableData : ', tableData);
        // console.log('tableData : ', tableData.nomination?.all?.MMBTUD);
        // console.log('tableData : ', tableData.nomination?.all?.MMSCFD);

        // ***เงื่อนไข validate เอามาจาก UI เดิมทั้งหมด
        let messageWarning:any = []
        
        if(data?.type === "TableAllNomination"){
            // [...tableData.nomination?.all?.MMBTUD, ...tableData.nomination?.all?.MMSCFD]
            const allNomdata = activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 ? [...tableData.nomination?.all?.MMSCFD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1) : [...tableData.nomination?.all?.MMBTUD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)
            // data?.paginatedData?.length > 0 && data?.paginatedData?.map((row: any, index: any) => {
            allNomdata?.map((row: any, index: any) => {

                let find_validate = data?.nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)

                let total_max_cap = null
                let hr_max_cap = null

                let validate
                let validate_total
                if (data?.tabIndex2ndTab == 0) { // MMSCF 
                    
                    validate_total = find_validate?.mmscf_max_cap
                    validate = find_validate?.mmscf_max_cap / 24

                    total_max_cap = find_validate?.mmscf_max_cap
                    hr_max_cap = find_validate?.mmscf_max_cap / 24
                   
                } else { // MMBTU
                    
                    if(row?.zone_text === "EAST-WEST"){
                        validate_total = row?.hv * find_validate?.maximum_capacity
                        validate = (row?.hv * find_validate?.maximum_capacity) / 24

                        total_max_cap = find_validate?.mmscf_max_cap
                        hr_max_cap = find_validate?.mmscf_max_cap / 24
                    }else{
                        validate_total = find_validate?.maximum_capacity * row?.hv
                        validate = (find_validate?.maximum_capacity * row?.hv) / 24

                        total_max_cap = find_validate?.find_validate?.maximum_capacity * row?.hv
                        hr_max_cap = (find_validate?.maximum_capacity * row?.hv) / 24
                    }
                }
              
                // if(!Number.isFinite(validate) || !Number.isFinite(validate)){
                //     return row
                // }

                let total_cap_validate = validate_total > row?.totalCap
                let h1_validate = validate > row?.H1
                let h2_validate = validate > row?.H2
                let h3_validate = validate > row?.H3
                let h4_validate = validate > row?.H4
                let h5_validate = validate > row?.H5
                let h6_validate = validate > row?.H6
                let h7_validate = validate > row?.H7
                let h8_validate = validate > row?.H8
                let h9_validate = validate > row?.H9
                let h10_validate = validate > row?.H10
                let h11_validate = validate > row?.H11
                let h12_validate = validate > row?.H12
                let h13_validate = validate > row?.H13
                let h14_validate = validate > row?.H14
                let h15_validate = validate > row?.H15
                let h16_validate = validate > row?.H16
                let h17_validate = validate > row?.H17
                let h18_validate = validate > row?.H18
                let h19_validate = validate > row?.H19
                let h20_validate = validate > row?.H20
                let h21_validate = validate > row?.H21
                let h22_validate = validate > row?.H22
                let h23_validate = validate > row?.H23
                let h24_validate = validate > row?.H24
         
                // const validateValTotal = `${formatNumberThreeDecimalNom(Number(String(validate_total).replace(/,/g, '').trim()))}`
                // const validateVal = `${formatNumberThreeDecimalNom(Number(String(validate).replace(/,/g, '').trim()))}`
                const validateValTotal = `${formatNumberThreeDecimalNomRound(Number(String(validate_total).replace(/,/g, '').trim()))}`
                const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(validate).replace(/,/g, '').trim()))}`

                if(!total_cap_validate){
                    const msgValue = row?.totalCap !== null && row?.totalCap !== undefined ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.totalCap) : formatNumberThreeDecimalNom(row?.totalCap) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) Total volume ${msgValue} exceeds max cap value ${validateValTotal}`
                    messageWarning.push(messageText)
                }
                if(!h1_validate){
                    const msgValue = row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H1`
                    messageWarning.push(messageText)
                }
                if(!h2_validate){
                    const msgValue = row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H2`
                    messageWarning.push(messageText)
                }
                if(!h3_validate){
                    const msgValue = row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H3`
                    messageWarning.push(messageText)
                }
                if(!h4_validate){
                    const msgValue = row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H4`
                    messageWarning.push(messageText)
                }
                if(!h5_validate){
                    const msgValue = row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H5`
                    messageWarning.push(messageText)
                }
                if(!h6_validate){
                    const msgValue = row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H6`
                    messageWarning.push(messageText)
                }
                if(!h7_validate){
                    const msgValue = row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H7`
                    messageWarning.push(messageText)
                }
                if(!h8_validate){
                    const msgValue = row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H8`
                    messageWarning.push(messageText)
                }
                if(!h9_validate){
                    const msgValue = row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H9`
                    messageWarning.push(messageText)
                }
                if(!h10_validate){
                    const msgValue = row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H10`
                    messageWarning.push(messageText)
                }
                if(!h11_validate){
                    const msgValue = row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H11`
                    messageWarning.push(messageText)
                }
                if(!h12_validate){
                    const msgValue = row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H12`
                    messageWarning.push(messageText)
                }
                if(!h13_validate){
                    const msgValue = row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H13`
                    messageWarning.push(messageText)
                }
                if(!h14_validate){
                    const msgValue = row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H14`
                    messageWarning.push(messageText)
                }
                if(!h15_validate){
                    const msgValue = row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H15`
                    messageWarning.push(messageText)
                }
                if(!h16_validate){
                    const msgValue = row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H16`
                    messageWarning.push(messageText)
                }
                if(!h17_validate){
                    const msgValue = row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H17`
                    messageWarning.push(messageText)
                }
                if(!h18_validate){
                    const msgValue = row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H18`
                    messageWarning.push(messageText)
                }
                if(!h19_validate){
                    const msgValue = row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H19`
                    messageWarning.push(messageText)
                }
                if(!h20_validate){
                    const msgValue = row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H20`
                    messageWarning.push(messageText)
                }
                if(!h21_validate){
                    const msgValue = row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H21`
                    messageWarning.push(messageText)
                }
                if(!h22_validate){
                    const msgValue = row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H22`
                    messageWarning.push(messageText)
                }
                if(!h23_validate){
                    const msgValue = row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H23`
                    messageWarning.push(messageText)
                }
                if(!h24_validate){
                    const msgValue = row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H24`
                    messageWarning.push(messageText)
                }

                return row
            })
        }else if(data?.type === "TableAllArea"){
            console.log('activeButton : ', activeButton);
            console.log('tabIndexNomAreaTotal : ', tabIndexNomAreaTotal);
            console.log('tabIndex2ndTab : ', tabIndex2ndTab);
            const allNomdata = activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 ? [...tableData?.area?.all?.MMBTUD] : []

            //  data?.paginatedData.length > 0 && data?.paginatedData?.map((row: any, index: any) => {
             allNomdata.length > 0 && allNomdata?.map((row: any, index: any) => {

                let find_validate = data?.areaMaster?.data?.find((item: any) => item?.name === row?.area_text)
                const area_nominal_capacity = find_validate?.area_nominal_capacity
                let total_cap_validate = area_nominal_capacity > row?.totalCap
                let h1_validate = (area_nominal_capacity / 24) > row?.H1
                let h2_validate = (area_nominal_capacity / 24) > row?.H2
                let h3_validate = (area_nominal_capacity / 24) > row?.H3
                let h4_validate = (area_nominal_capacity / 24) > row?.H4
                let h5_validate = (area_nominal_capacity / 24) > row?.H5
                let h6_validate = (area_nominal_capacity / 24) > row?.H6
                let h7_validate = (area_nominal_capacity / 24) > row?.H7
                let h8_validate = (area_nominal_capacity / 24) > row?.H8
                let h9_validate = (area_nominal_capacity / 24) > row?.H9
                let h10_validate = (area_nominal_capacity / 24) > row?.H10
                let h11_validate = (area_nominal_capacity / 24) > row?.H11
                let h12_validate = (area_nominal_capacity / 24) > row?.H12
                let h13_validate = (area_nominal_capacity / 24) > row?.H13
                let h14_validate = (area_nominal_capacity / 24) > row?.H14
                let h15_validate = (area_nominal_capacity / 24) > row?.H15
                let h16_validate = (area_nominal_capacity / 24) > row?.H16
                let h17_validate = (area_nominal_capacity / 24) > row?.H17
                let h18_validate = (area_nominal_capacity / 24) > row?.H18
                let h19_validate = (area_nominal_capacity / 24) > row?.H19
                let h20_validate = (area_nominal_capacity / 24) > row?.H20
                let h21_validate = (area_nominal_capacity / 24) > row?.H21
                let h22_validate = (area_nominal_capacity / 24) > row?.H22
                let h23_validate = (area_nominal_capacity / 24) > row?.H23
                let h24_validate = (area_nominal_capacity / 24) > row?.H24
                
                if(data?.tabIndex2ndTab === 0){
                    // const validateValTotal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    const validateValTotal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    if(!total_cap_validate){
                        const msgValue = row?.totalCap !== null && row?.totalCap !== undefined ? formatNumberThreeDecimalNom(row?.totalCap) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateValTotal}`
                        messageWarning.push(messageText)
                    }
                    if(!h1_validate){
                        const msgValue = row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H1`
                        messageWarning.push(messageText)
                    }
                    if(!h2_validate){
                        const msgValue = row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H2`
                        messageWarning.push(messageText)
                    }
                    if(!h3_validate){
                        const msgValue = row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H3`
                        messageWarning.push(messageText)
                    }
                    if(!h4_validate){
                        const msgValue = row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H4`
                        messageWarning.push(messageText)
                    }
                    if(!h5_validate){
                        const msgValue = row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H5`
                        messageWarning.push(messageText)
                    }
                    if(!h6_validate){
                        const msgValue = row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H6`
                        messageWarning.push(messageText)
                    }
                    if(!h7_validate){
                        const msgValue = row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H7`
                        messageWarning.push(messageText)
                    }
                    if(!h8_validate){
                        const msgValue = row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H8`
                        messageWarning.push(messageText)
                    }
                    if(!h9_validate){
                        const msgValue = row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H9`
                        messageWarning.push(messageText)
                    }
                    if(!h10_validate){
                        const msgValue = row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H10`
                        messageWarning.push(messageText)
                    }
                    if(!h11_validate){
                        const msgValue = row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H11`
                        messageWarning.push(messageText)
                    }
                    if(!h12_validate){
                        const msgValue = row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H12`
                        messageWarning.push(messageText)
                    }
                    if(!h13_validate){
                        const msgValue = row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H13`
                        messageWarning.push(messageText)
                    }
                    if(!h14_validate){
                        const msgValue = row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H14`
                        messageWarning.push(messageText)
                    }
                    if(!h15_validate){
                        const msgValue = row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H15`
                        messageWarning.push(messageText)
                    }
                    if(!h16_validate){
                        const msgValue = row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H16`
                        messageWarning.push(messageText)
                    }
                    if(!h17_validate){
                        const msgValue = row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H17`
                        messageWarning.push(messageText)
                    }
                    if(!h18_validate){
                        const msgValue = row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H18`
                        messageWarning.push(messageText)
                    }
                    if(!h19_validate){
                        const msgValue = row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H19`
                        messageWarning.push(messageText)
                    }
                    if(!h20_validate){
                        const msgValue = row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H20`
                        messageWarning.push(messageText)
                    }
                    if(!h21_validate){
                        const msgValue = row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H21`
                        messageWarning.push(messageText)
                    }
                    if(!h22_validate){
                        const msgValue = row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H22`
                        messageWarning.push(messageText)
                    }
                    if(!h23_validate){
                        const msgValue = row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H23`
                        messageWarning.push(messageText)
                    }
                    if(!h24_validate){
                        const msgValue = row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H24`
                        messageWarning.push(messageText)
                    }
                }
              
                return row
             })

        }else if(data?.type === "TableAllTotalSystem"){
            // ใน UI ยังไม่มีทำ validate แดง
            // [...tableData.nomination?.all?.MMBTUD, ...tableData.nomination?.all?.MMSCFD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)?.length > 0 && [...tableData.nomination?.all?.MMBTUD, ...tableData.nomination?.all?.MMSCFD]?.map((row: any, index: any) => {
            [...(tableData.nomination?.all?.MMSCFD)?.filter((f:any) => f?.entry_exit_id === 1), ...tableData.nomination?.all?.MMBTUD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)?.map((row: any, index: any) => {
            // [...tableData.nomination?.all?.MMSCFD]?.map((row: any, index: any) => {
            // [...tableData.nomination?.all?.MMBTUD, ...tableData.nomination?.all?.MMSCFD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)?.length > 0 && [...tableData.nomination?.all?.MMSCFD]?.map((row: any, index: any) => {

                // let find_validate = data?.nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)
                let find_validate = nomDataK?.find((item: any) => item?.nomination_point === row?.nomination_point)

                let validate
                let validate_total
                if (row?.units === "MMSCFD") { // MMSCF
                    // validate = find_validate?.mmscf_max_cap
                    // validate_total = find_validate?.mmscf_max_cap * 24
                    validate = find_validate?.mmscf_max_cap / 24
                    validate_total = find_validate?.mmscf_max_cap
                } else { // MMBTU
                   
                    if(row?.zone_text === "EAST-WEST"){
                        validate = (row?.hv * find_validate?.maximum_capacity) / 24
                        validate_total = row?.hv * find_validate?.maximum_capacity
                    }else{
                        validate = (find_validate?.maximum_capacity * row?.hv) / 24
                        validate_total = find_validate?.maximum_capacity * row?.hv
                    }
                }

                // if(!Number.isFinite(validate) || !Number.isFinite(validate)){
                //     return row
                // }

                let total_cap_validate = validate_total > row?.totalCap
                let h1_validate = validate > row?.H1
                let h2_validate = validate > row?.H2
                let h3_validate = validate > row?.H3
                let h4_validate = validate > row?.H4
                let h5_validate = validate > row?.H5
                let h6_validate = validate > row?.H6
                let h7_validate = validate > row?.H7
                let h8_validate = validate > row?.H8
                let h9_validate = validate > row?.H9
                let h10_validate = validate > row?.H10
                let h11_validate = validate > row?.H11
                let h12_validate = validate > row?.H12
                let h13_validate = validate > row?.H13
                let h14_validate = validate > row?.H14
                let h15_validate = validate > row?.H15
                let h16_validate = validate > row?.H16
                let h17_validate = validate > row?.H17
                let h18_validate = validate > row?.H18
                let h19_validate = validate > row?.H19
                let h20_validate = validate > row?.H20
                let h21_validate = validate > row?.H21
                let h22_validate = validate > row?.H22
                let h23_validate = validate > row?.H23
                let h24_validate = validate > row?.H24
                
         
                // const validateValTotal = `${formatNumberThreeDecimalNom(Number(String(validate_total).replace(/,/g, '').trim()))}`
                // const validateVal = `${formatNumberThreeDecimalNom(Number(String(validate).replace(/,/g, '').trim()))}`
                const validateValTotal = `${formatNumberThreeDecimalNomRound(Number(String(validate_total).replace(/,/g, '').trim()))}`
                const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(validate).replace(/,/g, '').trim()))}`

                if(!total_cap_validate){
                    const msgValue = row?.totalCap !== null && row?.totalCap !== undefined ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(row?.totalCap) : formatNumberThreeDecimalNom(row?.totalCap) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) Total volume ${msgValue} exceeds max cap value ${validateValTotal}`
                    messageWarning.push(messageText)
                }
                if(!h1_validate){
                    const msgValue = row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H1`
                    messageWarning.push(messageText)
                }
                if(!h2_validate){
                    const msgValue = row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H2`
                    messageWarning.push(messageText)
                }
                if(!h3_validate){
                    const msgValue = row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H3`
                    messageWarning.push(messageText)
                }
                if(!h4_validate){
                    const msgValue = row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H4`
                    messageWarning.push(messageText)
                }
                if(!h5_validate){
                    const msgValue = row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H5`
                    messageWarning.push(messageText)
                }
                if(!h6_validate){
                    const msgValue = row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H6`
                    messageWarning.push(messageText)
                }
                if(!h7_validate){
                    const msgValue = row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H7`
                    messageWarning.push(messageText)
                }
                if(!h8_validate){
                    const msgValue = row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H8`
                    messageWarning.push(messageText)
                }
                if(!h9_validate){
                    const msgValue = row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H9`
                    messageWarning.push(messageText)
                }
                if(!h10_validate){
                    const msgValue = row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H10`
                    messageWarning.push(messageText)
                }
                if(!h11_validate){
                    const msgValue = row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H11`
                    messageWarning.push(messageText)
                }
                if(!h12_validate){
                    const msgValue = row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H12`
                    messageWarning.push(messageText)
                }
                if(!h13_validate){
                    const msgValue = row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H13`
                    messageWarning.push(messageText)
                }
                if(!h14_validate){
                    const msgValue = row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H14`
                    messageWarning.push(messageText)
                }
                if(!h15_validate){
                    const msgValue = row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H15`
                    messageWarning.push(messageText)
                }
                if(!h16_validate){
                    const msgValue = row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H16`
                    messageWarning.push(messageText)
                }
                if(!h17_validate){
                    const msgValue = row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H17`
                    messageWarning.push(messageText)
                }
                if(!h18_validate){
                    const msgValue = row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H18`
                    messageWarning.push(messageText)
                }
                if(!h19_validate){
                    const msgValue = row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H19`
                    messageWarning.push(messageText)
                }
                if(!h20_validate){
                    const msgValue = row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H20`
                    messageWarning.push(messageText)
                }
                if(!h21_validate){
                    const msgValue = row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H21`
                    messageWarning.push(messageText)
                }
                if(!h22_validate){
                    const msgValue = row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H22`
                    messageWarning.push(messageText)
                }
                if(!h23_validate){
                    const msgValue = row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H23`
                    messageWarning.push(messageText)
                }
                if(!h24_validate){
                    const msgValue = row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H24`
                    messageWarning.push(messageText)
                }

                return row
            })
        }else if(data?.type === "TableWeeklyNomination"){
            const allNomdata = activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 ? [...tableData.nomination?.weekly?.MMSCFD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1) : [...tableData.nomination?.weekly?.MMBTUD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)

            allNomdata?.map((row: any, index: any) => {
                // tabIndex2ndTab 0 = mmscf
                // tabIndex2ndTab 1 = mmbtu

                let find_validate = data?.nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)

                const targetData = data?.dataEva?.newWeekly?.find((item: any) => {
                    const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate?.area?.id : find_validate?.area?.supply_reference_quality_area
                    return (
                        item.area.id === area_id &&
                        item.zone.name === find_validate.zone.name &&
                        item.parameter === "HV"
                    );
                });

                let sunday_validate;
                let monday_validate;
                let tuesday_validate;
                let wednesday_validate;
                let thursday_validate;
                let friday_validate;
                let saturday_validate;

                let sunday_max_cap;
                let monday_max_cap;
                let tuesday_max_cap;
                let wednesday_max_cap;
                let thursday_max_cap;
                let friday_max_cap;
                let saturday_max_cap;
                
                if(row?.unix === "MMBTU/D"){
                    if(row?.zone_text === "EAST-WEST"){
                        
                        sunday_max_cap = parseFloat(row?.sunday_hv) * parseFloat(find_validate?.maximum_capacity)
                        monday_max_cap = parseFloat(row?.monday_hv) * parseFloat(find_validate?.maximum_capacity)
                        tuesday_max_cap = parseFloat(row?.tuesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        wednesday_max_cap = parseFloat(row?.wednesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        thursday_max_cap = parseFloat(row?.thursday_hv) * parseFloat(find_validate?.maximum_capacity)
                        friday_max_cap = parseFloat(row?.friday_hv) * parseFloat(find_validate?.maximum_capacity)
                        saturday_max_cap = parseFloat(row?.saturday_hv) * parseFloat(find_validate?.maximum_capacity)

                        sunday_validate = sunday_max_cap > parseFloat(row?.sunday)
                        monday_validate = monday_max_cap > parseFloat(row?.monday)
                        tuesday_validate = tuesday_max_cap > parseFloat(row?.tuesday)
                        wednesday_validate = wednesday_max_cap > parseFloat(row?.wednesday)
                        thursday_validate = thursday_max_cap > parseFloat(row?.thursday)
                        friday_validate = friday_max_cap > parseFloat(row?.friday)
                        saturday_validate = saturday_max_cap > parseFloat(row?.saturday)
                        
                    }else{
                       
                        sunday_max_cap = parseFloat(row?.sunday_hv) * parseFloat(find_validate?.maximum_capacity)
                        monday_max_cap = parseFloat(row?.monday_hv) * parseFloat(find_validate?.maximum_capacity)
                        tuesday_max_cap = parseFloat(row?.tuesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        wednesday_max_cap = parseFloat(row?.wednesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        thursday_max_cap = parseFloat(row?.thursday_hv) * parseFloat(find_validate?.maximum_capacity)
                        friday_max_cap = parseFloat(row?.friday_hv) * parseFloat(find_validate?.maximum_capacity)
                        saturday_max_cap = parseFloat(row?.saturday_hv) * parseFloat(find_validate?.maximum_capacity)

                        sunday_validate = sunday_max_cap > parseFloat(row?.sunday)
                        monday_validate = monday_max_cap > parseFloat(row?.monday)
                        tuesday_validate = tuesday_max_cap > parseFloat(row?.tuesday)
                        wednesday_validate = wednesday_max_cap > parseFloat(row?.wednesday)
                        thursday_validate = thursday_max_cap > parseFloat(row?.thursday)
                        friday_validate = friday_max_cap > parseFloat(row?.friday)
                        saturday_validate = saturday_max_cap > parseFloat(row?.saturday)
                        
                    }
                }else{
                   
                        sunday_max_cap = find_validate?.mmscf_max_cap
                        monday_max_cap = find_validate?.mmscf_max_cap
                        tuesday_max_cap = find_validate?.mmscf_max_cap
                        wednesday_max_cap = find_validate?.mmscf_max_cap
                        thursday_max_cap = find_validate?.mmscf_max_cap
                        friday_max_cap = find_validate?.mmscf_max_cap
                        saturday_max_cap = find_validate?.mmscf_max_cap

                        sunday_validate = find_validate?.maximum_capacity > parseFloat(row?.sunday)
                        monday_validate = find_validate?.maximum_capacity > parseFloat(row?.monday)
                        tuesday_validate = find_validate?.maximum_capacity > parseFloat(row?.tuesday)
                        wednesday_validate = find_validate?.maximum_capacity > parseFloat(row?.wednesday)
                        thursday_validate = find_validate?.maximum_capacity > parseFloat(row?.thursday)
                        friday_validate = find_validate?.maximum_capacity > parseFloat(row?.friday)
                        saturday_validate = find_validate?.maximum_capacity > parseFloat(row?.saturday)
                       
                }

                
                if(!sunday_validate && (row?.sunday !== null)){
                    
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(sunday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(sunday_max_cap).replace(/,/g, '').trim()))}`
                    
                    const msgValue = row?.sunday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.sunday)) : formatNumberThreeDecimalNom(parseToNumber(row?.sunday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(0, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!monday_validate && (row?.monday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(monday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(monday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.monday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.monday)) : formatNumberThreeDecimalNom(parseToNumber(row?.monday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(1, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!tuesday_validate && (row?.tuesday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(tuesday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(tuesday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.tuesday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.tuesday)) : formatNumberThreeDecimalNom(parseToNumber(row?.tuesday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(2, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!wednesday_validate && (row?.wednesday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(wednesday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(wednesday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.wednesday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.wednesday)) : formatNumberThreeDecimalNom(parseToNumber(row?.wednesday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(3, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!thursday_validate && (row?.thursday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(thursday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(thursday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.thursday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.thursday)) : formatNumberThreeDecimalNom(parseToNumber(row?.thursday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(4, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!friday_validate && (row?.friday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(friday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(friday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.friday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.friday)) : formatNumberThreeDecimalNom(parseToNumber(row?.friday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(5, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!saturday_validate && (row?.saturday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(saturday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(saturday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.saturday ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(parseToNumber(row?.saturday)) : formatNumberThreeDecimalNom(parseToNumber(row?.saturday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(6, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }

                return row
            })
        }else if(data?.type === "TableWeeklyArea"){
           
            const allNomdata = activeButton == 2 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 ? [...tableData?.area?.weekly?.MMBTUD] : []
           
            // data?.paginatedData?.length > 0 && data?.paginatedData?.map((row: any, index: any) => {
            allNomdata?.length > 0 && allNomdata?.map((row: any, index: any) => {

                let find_validate = data?.areaMaster?.data?.find((item: any) => item?.name === row?.area_text)
                let sunday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.sunday)
                let monday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.monday)
                let tuesday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.tuesday)
                let wednesday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.wednesday)
                let thursday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.thursday)
                let friday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.friday)
                let saturday_validate = find_validate?.area_nominal_capacity > parseFloat(row?.saturday)

                if(data?.tabIndex2ndTab === 0){
                    if(!sunday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.sunday ? formatNumberThreeDecimalNom(row?.sunday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(0, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }

                    if(!monday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.monday ? formatNumberThreeDecimalNom(row?.monday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(1, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }

                    if(!tuesday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.tuesday ? formatNumberThreeDecimalNom(row?.tuesday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(2, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }

                    if(!wednesday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.wednesday ? formatNumberThreeDecimalNom(row?.wednesday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(3, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }

                    if(!thursday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.thursday ? formatNumberThreeDecimalNom(row?.thursday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(4, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }

                    if(!friday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.friday ? formatNumberThreeDecimalNom(row?.friday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(5, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }

                    if(!saturday_validate){
                        // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                        const msgValue = row?.saturday ? formatNumberThreeDecimalNom(row?.saturday) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(6, "day").format("DD/MM/YYYY")}`
                        messageWarning.push(messageText)
                    }
                    
                }


                return row
            })
        }else if(data?.type === "TableWeeklyTotalSystem"){
            // ใน UI ยังไม่มีทำ validate แดง
            const allNomdata = [...(tableData.nomination?.weekly?.MMSCFD)?.filter((f:any) => f?.entry_exit_id === 1), ...tableData.nomination?.weekly?.MMBTUD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)

            allNomdata?.map((row: any, index: any) => {
                // tabIndex2ndTab 0 = mmscf
                // tabIndex2ndTab 1 = mmbtu

                let find_validate = nomDataK?.find((item: any) => item?.nomination_point === row?.nomination_point)

                const targetData = data?.dataEva?.newWeekly?.find((item: any) => {
                    const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate?.area?.id : find_validate?.area?.supply_reference_quality_area
                    return (
                        item.area.id === area_id &&
                        item.zone.name === find_validate.zone.name &&
                        item.parameter === "HV"
                    );
                });

                let sunday_validate;
                let monday_validate;
                let tuesday_validate;
                let wednesday_validate;
                let thursday_validate;
                let friday_validate;
                let saturday_validate;

                let sunday_max_cap;
                let monday_max_cap;
                let tuesday_max_cap;
                let wednesday_max_cap;
                let thursday_max_cap;
                let friday_max_cap;
                let saturday_max_cap;


                
                if(row?.unix === "MMBTU/D"){
                    if(row?.zone_text === "EAST-WEST"){
                        
                        sunday_max_cap = parseFloat(row?.sunday_hv) * parseFloat(find_validate?.maximum_capacity)
                        monday_max_cap = parseFloat(row?.monday_hv) * parseFloat(find_validate?.maximum_capacity)
                        tuesday_max_cap = parseFloat(row?.tuesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        wednesday_max_cap = parseFloat(row?.wednesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        thursday_max_cap = parseFloat(row?.thursday_hv) * parseFloat(find_validate?.maximum_capacity)
                        friday_max_cap = parseFloat(row?.friday_hv) * parseFloat(find_validate?.maximum_capacity)
                        saturday_max_cap = parseFloat(row?.saturday_hv) * parseFloat(find_validate?.maximum_capacity)

                        sunday_validate = sunday_max_cap > parseFloat(row?.sunday)
                        monday_validate = monday_max_cap > parseFloat(row?.monday)
                        tuesday_validate = tuesday_max_cap > parseFloat(row?.tuesday)
                        wednesday_validate = wednesday_max_cap > parseFloat(row?.wednesday)
                        thursday_validate = thursday_max_cap > parseFloat(row?.thursday)
                        friday_validate = friday_max_cap > parseFloat(row?.friday)
                        saturday_validate = saturday_max_cap > parseFloat(row?.saturday)
                        
                    }else{
                    // if(row?.nomination_point === "ZAWTIKA"){
                    //     console.log('[ZAWTIKA] row : ', row);
                    // }
                        sunday_max_cap = parseFloat(row?.sunday_hv) * parseFloat(find_validate?.maximum_capacity)
                        monday_max_cap = parseFloat(row?.monday_hv) * parseFloat(find_validate?.maximum_capacity)
                        tuesday_max_cap = parseFloat(row?.tuesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        wednesday_max_cap = parseFloat(row?.wednesday_hv) * parseFloat(find_validate?.maximum_capacity)
                        thursday_max_cap = parseFloat(row?.thursday_hv) * parseFloat(find_validate?.maximum_capacity)
                        friday_max_cap = parseFloat(row?.friday_hv) * parseFloat(find_validate?.maximum_capacity)
                        saturday_max_cap = parseFloat(row?.saturday_hv) * parseFloat(find_validate?.maximum_capacity)

                        sunday_validate = sunday_max_cap > parseFloat(row?.sunday)
                        monday_validate = monday_max_cap > parseFloat(row?.monday)
                        tuesday_validate = tuesday_max_cap > parseFloat(row?.tuesday)
                        wednesday_validate = wednesday_max_cap > parseFloat(row?.wednesday)
                        thursday_validate = thursday_max_cap > parseFloat(row?.thursday)
                        friday_validate = friday_max_cap > parseFloat(row?.friday)
                        saturday_validate = saturday_max_cap > parseFloat(row?.saturday)
                        
                    }
                }else{
                   
                        sunday_max_cap = find_validate?.mmscf_max_cap
                        monday_max_cap = find_validate?.mmscf_max_cap
                        tuesday_max_cap = find_validate?.mmscf_max_cap
                        wednesday_max_cap = find_validate?.mmscf_max_cap
                        thursday_max_cap = find_validate?.mmscf_max_cap
                        friday_max_cap = find_validate?.mmscf_max_cap
                        saturday_max_cap = find_validate?.mmscf_max_cap

                        sunday_validate = find_validate?.maximum_capacity > parseFloat(row?.sunday)
                        monday_validate = find_validate?.maximum_capacity > parseFloat(row?.monday)
                        tuesday_validate = find_validate?.maximum_capacity > parseFloat(row?.tuesday)
                        wednesday_validate = find_validate?.maximum_capacity > parseFloat(row?.wednesday)
                        thursday_validate = find_validate?.maximum_capacity > parseFloat(row?.thursday)
                        friday_validate = find_validate?.maximum_capacity > parseFloat(row?.friday)
                        saturday_validate = find_validate?.maximum_capacity > parseFloat(row?.saturday)
                       
                }
                
                if(!sunday_validate && (row?.sunday !== null)){
                    
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(sunday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(sunday_max_cap).replace(/,/g, '').trim()))}`
                    
                    const msgValue = row?.sunday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.sunday)) : formatNumberThreeDecimalNom(parseToNumber(row?.sunday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(0, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!monday_validate && (row?.monday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNom(Number(String(monday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(monday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.monday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.monday)) : formatNumberThreeDecimalNom(parseToNumber(row?.monday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(1, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!tuesday_validate && (row?.tuesday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(tuesday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(tuesday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.tuesday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.tuesday)) : formatNumberThreeDecimalNom(parseToNumber(row?.tuesday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(2, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!wednesday_validate && (row?.wednesday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(wednesday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(wednesday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.wednesday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.wednesday)) : formatNumberThreeDecimalNom(parseToNumber(row?.wednesday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(3, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!thursday_validate && (row?.thursday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(thursday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(thursday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.thursday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.thursday)) : formatNumberThreeDecimalNom(parseToNumber(row?.thursday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(4, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!friday_validate && (row?.friday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(friday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(friday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.friday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.friday)) : formatNumberThreeDecimalNom(parseToNumber(row?.friday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(5, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }
                
                if(!saturday_validate && (row?.saturday !== null)){
                    const validateVal = data?.tabIndex2ndTab == 1 ? `${formatNumberThreeDecimalNomRound(Number(String(saturday_max_cap).replace(/,/g, '').trim()))}` : `${formatNumberThreeDecimalNomRound(Number(String(saturday_max_cap).replace(/,/g, '').trim()))}`
                    const msgValue = row?.saturday ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(parseToNumber(row?.saturday)) : formatNumberThreeDecimalNom(parseToNumber(row?.saturday)) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} gas day ${dayjs(row?.gas_day_text, "DD/MM/YYYY").add(6, "day").format("DD/MM/YYYY")}`
                    messageWarning.push(messageText)
                }

                return row
            })
        }else if(data?.type === "TableDailyNomination"){
            const allNomdata = activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 ? [...tableData.nomination?.daily?.MMSCFD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1) : [...tableData.nomination?.daily?.MMBTUD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)

            //  data?.paginatedData?.length > 0 && data?.paginatedData?.map((row: any, index: any) => {
             allNomdata?.map((row: any, index: any) => {

                let find_validate = data?.nomData?.find((item: any) => item?.nomination_point === row?.nomination_point)

                const targetData = data?.dataEva?.newDaily?.find((item: any) => {
                    const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate?.area?.id : find_validate?.area?.supply_reference_quality_area
                    return (
                        item.area.id === area_id &&
                        item.zone.name === find_validate?.zone?.name &&
                        item.parameter === "HV"
                    );
                });

                let validate
                let validate_total
                if (data?.tabIndex2ndTab == 0) { // MMSCF
                    // validate = find_validate?.mmscf_max_cap
                    // validate_total = find_validate?.mmscf_max_cap * 24
                    validate = find_validate?.mmscf_max_cap / 24
                    validate_total = find_validate?.mmscf_max_cap
                } else { // MMBTU
                    if(row?.zone_text === "EAST-WEST"){
                        validate = (row?.hv * find_validate?.maximum_capacity) / 24
                        validate_total = row?.hv * find_validate?.maximum_capacity
                    }else{
                        validate = (find_validate?.maximum_capacity * row?.hv) / 24
                        validate_total = find_validate?.maximum_capacity * row?.hv
                    }
                }

                let total_cap_validate = validate_total > row?.totalCap
                let h1_is_over = row?.H1 > validate
                let h2_is_over = row?.H2 > validate
                let h3_is_over = row?.H3 > validate
                let h4_is_over = row?.H4 > validate
                let h5_is_over = row?.H5 > validate
                let h6_is_over = row?.H6 > validate
                let h7_is_over = row?.H7 > validate
                let h8_is_over = row?.H8 > validate
                let h9_is_over = row?.H9 > validate
                let h10_is_over = row?.H10 > validate
                let h11_is_over = row?.H11 > validate
                let h12_is_over = row?.H12 > validate
                let h13_is_over = row?.H13 > validate
                let h14_is_over = row?.H14 > validate
                let h15_is_over = row?.H15 > validate
                let h16_is_over = row?.H16 > validate
                let h17_is_over = row?.H17 > validate
                let h18_is_over = row?.H18 > validate
                let h19_is_over = row?.H19 > validate
                let h20_is_over = row?.H20 > validate
                let h21_is_over = row?.H21 > validate
                let h22_is_over = row?.H22 > validate
                let h23_is_over = row?.H23 > validate
                let h24_is_over = row?.H24 > validate
               
                // const validateValTotal = `${formatNumberThreeDecimalNom(Number(String(validate_total).replace(/,/g, '').trim()))}`
                // const validateVal = `${formatNumberThreeDecimalNom(Number(String(validate).replace(/,/g, '').trim()))}`
                const validateValTotal = `${formatNumberThreeDecimalNomRound(Number(String(validate_total).replace(/,/g, '').trim()))}`
                const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(validate).replace(/,/g, '').trim()))}`
                if(!total_cap_validate && !isNaN(validate_total)){
                    const msgValue = row?.totalCap !== null && row?.totalCap !== undefined ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(row?.totalCap) : formatNumberThreeDecimalNom(row?.totalCap) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) Total volume ${msgValue} exceeds max cap value ${validateValTotal}`
                    messageWarning.push(messageText)
                }
                if(h1_is_over){
                    const msgValue = row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H1`
                    messageWarning.push(messageText)
                }
                if(h2_is_over){
                    const msgValue = row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H2`
                    messageWarning.push(messageText)
                }
                if(h3_is_over){
                    const msgValue = row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H3`
                    messageWarning.push(messageText)
                }
                if(h4_is_over){
                    const msgValue = row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H4`
                    messageWarning.push(messageText)
                }
                if(h5_is_over){
                    const msgValue = row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H5`
                    messageWarning.push(messageText)
                }
                if(h6_is_over){
                    const msgValue = row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H6`
                    messageWarning.push(messageText)
                }
                if(h7_is_over){
                    const msgValue = row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H7`
                    messageWarning.push(messageText)
                }
                if(h8_is_over){
                    const msgValue = row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H8`
                    messageWarning.push(messageText)
                }
                if(h9_is_over){
                    const msgValue = row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H9`
                    messageWarning.push(messageText)
                }
                if(h10_is_over){
                    const msgValue = row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H10`
                    messageWarning.push(messageText)
                }
                if(h11_is_over){
                    const msgValue = row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H11`
                    messageWarning.push(messageText)
                }
                if(h12_is_over){
                    const msgValue = row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H12`
                    messageWarning.push(messageText)
                }
                if(h13_is_over){
                    const msgValue = row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H13`
                    messageWarning.push(messageText)
                }
                if(h14_is_over){
                    const msgValue = row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H14`
                    messageWarning.push(messageText)
                }
                if(h15_is_over){
                    const msgValue = row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H15`
                    messageWarning.push(messageText)
                }
                if(h16_is_over){
                    const msgValue = row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H16`
                    messageWarning.push(messageText)
                }
                if(h17_is_over){
                    const msgValue = row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H17`
                    messageWarning.push(messageText)
                }
                if(h18_is_over){
                    const msgValue = row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H18`
                    messageWarning.push(messageText)
                }
                if(h19_is_over){
                    const msgValue = row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H19`
                    messageWarning.push(messageText)
                }
                if(h20_is_over){
                    const msgValue = row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H20`
                    messageWarning.push(messageText)
                }
                if(h21_is_over){
                    const msgValue = row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H21`
                    messageWarning.push(messageText)
                }
                if(h22_is_over){
                    const msgValue = row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H22`
                    messageWarning.push(messageText)
                }
                if(h23_is_over){
                    const msgValue = row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H23`
                    messageWarning.push(messageText)
                }
                if(h24_is_over){
                    const msgValue = row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? tabIndex2ndTab == 0 ? formatNumberSixDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H24`
                    messageWarning.push(messageText)
                }

                return row
            })
        }else if(data?.type === "TableDailyArea"){
            // console.log('activeButton : ', activeButton);
            // console.log('tabIndexNomAreaTotal : ', tabIndexNomAreaTotal);
            // console.log('tabIndex2ndTab : ', tabIndex2ndTab);
            const allNomdata = activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 ? [...tableData?.area?.daily?.MMBTUD] : []
            // data?.paginatedData?.length > 0 && data?.paginatedData?.map((row: any, index: any) => {
            allNomdata?.length > 0 && allNomdata?.map((row: any, index: any) => {

                let find_validate = data?.areaMaster?.data?.find((item: any) => item?.name === row?.area_text)

                const area_nominal_capacity = find_validate?.area_nominal_capacity
                let total_cap_validate = area_nominal_capacity > row?.totalCap
                let h1_validate = (area_nominal_capacity / 24) > row?.H1
                let h2_validate = (area_nominal_capacity / 24) > row?.H2
                let h3_validate = (area_nominal_capacity / 24) > row?.H3
                let h4_validate = (area_nominal_capacity / 24) > row?.H4
                let h5_validate = (area_nominal_capacity / 24) > row?.H5
                let h6_validate = (area_nominal_capacity / 24) > row?.H6
                let h7_validate = (area_nominal_capacity / 24) > row?.H7
                let h8_validate = (area_nominal_capacity / 24) > row?.H8
                let h9_validate = (area_nominal_capacity / 24) > row?.H9
                let h10_validate = (area_nominal_capacity / 24) > row?.H10
                let h11_validate = (area_nominal_capacity / 24) > row?.H11
                let h12_validate = (area_nominal_capacity / 24) > row?.H12
                let h13_validate = (area_nominal_capacity / 24) > row?.H13
                let h14_validate = (area_nominal_capacity / 24) > row?.H14
                let h15_validate = (area_nominal_capacity / 24) > row?.H15
                let h16_validate = (area_nominal_capacity / 24) > row?.H16
                let h17_validate = (area_nominal_capacity / 24) > row?.H17
                let h18_validate = (area_nominal_capacity / 24) > row?.H18
                let h19_validate = (area_nominal_capacity / 24) > row?.H19
                let h20_validate = (area_nominal_capacity / 24) > row?.H20
                let h21_validate = (area_nominal_capacity / 24) > row?.H21
                let h22_validate = (area_nominal_capacity / 24) > row?.H22
                let h23_validate = (area_nominal_capacity / 24) > row?.H23
                let h24_validate = (area_nominal_capacity / 24) > row?.H24
               
                if(data?.tabIndex2ndTab === 0){
                    // const validateValTotal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    // const validateVal = `${formatNumberThreeDecimalNom(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    const validateValTotal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(find_validate?.area_nominal_capacity).replace(/,/g, '').trim()))}`
                    if(!total_cap_validate){
                        const msgValue = row?.totalCap !== null && row?.totalCap !== undefined ? formatNumberThreeDecimalNom(row?.totalCap) : ''
                        const messageText = `Area [${row?.area_text}] Total volume ${msgValue} exceeds area nominal capacity value ${validateValTotal}`
                        messageWarning.push(messageText)
                    }
                    if(!h1_validate){
                        const msgValue = row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H1`
                        messageWarning.push(messageText)
                    }
                    if(!h2_validate){
                        const msgValue = row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H2`
                        messageWarning.push(messageText)
                    }
                    if(!h3_validate){
                        const msgValue = row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H3`
                        messageWarning.push(messageText)
                    }
                    if(!h4_validate){
                        const msgValue = row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H4`
                        messageWarning.push(messageText)
                    }
                    if(!h5_validate){
                        const msgValue = row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H5`
                        messageWarning.push(messageText)
                    }
                    if(!h6_validate){
                        const msgValue = row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H6`
                        messageWarning.push(messageText)
                    }
                    if(!h7_validate){
                        const msgValue = row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H7`
                        messageWarning.push(messageText)
                    }
                    if(!h8_validate){
                        const msgValue = row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H8`
                        messageWarning.push(messageText)
                    }
                    if(!h9_validate){
                        const msgValue = row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H9`
                        messageWarning.push(messageText)
                    }
                    if(!h10_validate){
                        const msgValue = row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H10`
                        messageWarning.push(messageText)
                    }
                    if(!h11_validate){
                        const msgValue = row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H11`
                        messageWarning.push(messageText)
                    }
                    if(!h12_validate){
                        const msgValue = row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H12`
                        messageWarning.push(messageText)
                    }
                    if(!h13_validate){
                        const msgValue = row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H13`
                        messageWarning.push(messageText)
                    }
                    if(!h14_validate){
                        const msgValue = row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H14`
                        messageWarning.push(messageText)
                    }
                    if(!h15_validate){
                        const msgValue = row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H15`
                        messageWarning.push(messageText)
                    }
                    if(!h16_validate){
                        const msgValue = row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H16`
                        messageWarning.push(messageText)
                    }
                    if(!h17_validate){
                        const msgValue = row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H17`
                        messageWarning.push(messageText)
                    }
                    if(!h18_validate){
                        const msgValue = row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H18`
                        messageWarning.push(messageText)
                    }
                    if(!h19_validate){
                        const msgValue = row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H19`
                        messageWarning.push(messageText)
                    }
                    if(!h20_validate){
                        const msgValue = row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H20`
                        messageWarning.push(messageText)
                    }
                    if(!h21_validate){
                        const msgValue = row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H21`
                        messageWarning.push(messageText)
                    }
                    if(!h22_validate){
                        const msgValue = row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H22`
                        messageWarning.push(messageText)
                    }
                    if(!h23_validate){
                        const msgValue = row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H23`
                        messageWarning.push(messageText)
                    }
                    if(!h24_validate){
                        const msgValue = row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : ''
                        const messageText = `Area [${row?.area_text}] max volume ${msgValue} exceeds area nominal capacity value ${validateVal} hour H24`
                        messageWarning.push(messageText)
                    }
                }

                return row 
            })
        }else if(data?.type === "TableDailyTotalSystem"){
            // ใน UI ยังไม่มีทำ validate แดง
            const allNomdata = [...(tableData.nomination?.daily?.MMSCFD)?.filter((f:any) => f?.entry_exit_id === 1), ...tableData.nomination?.daily?.MMBTUD]?.filter((f:any) => f?.query_shipper_nomination_type_id === 1)

            //  data?.paginatedData?.length > 0 && data?.paginatedData?.map((row: any, index: any) => {
             allNomdata?.map((row: any, index: any) => {

                let find_validate = nomDataK?.find((item: any) => item?.nomination_point === row?.nomination_point)

                const targetData = data?.dataEva?.newDaily?.find((item: any) => {
                    const area_id = find_validate?.area?.entry_exit_id == 1 ? find_validate?.area?.id : find_validate?.area?.supply_reference_quality_area
                    return (
                        item.area.id === area_id &&
                        item.zone.name === find_validate?.zone?.name &&
                        item.parameter === "HV"
                    );
                });

                let validate
                let validate_total
                if (row?.units === "MMSCFD") { // MMSCF
                    // validate = find_validate?.mmscf_max_cap
                    // validate_total = find_validate?.mmscf_max_cap * 24
                    validate = find_validate?.mmscf_max_cap / 24
                    validate_total = find_validate?.mmscf_max_cap
                } else { // MMBTU
                  
                    // validate = (find_validate?.maximum_capacity) / 24 
                    // validate_total = find_validate?.maximum_capacity

                    if(row?.zone_text === "EAST-WEST"){
                        validate = (row?.hv * find_validate?.maximum_capacity) / 24
                        validate_total = row?.hv * find_validate?.maximum_capacity
                    }else{
                        validate = (find_validate?.maximum_capacity * row?.hv) / 24
                        validate_total = find_validate?.maximum_capacity * row?.hv
                    }
                }

                let total_cap_validate = row?.query_shipper_nomination_type_id === 1 ? validate_total > row?.totalCap : false
                let h1_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H1 > validate : false
                let h2_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H2 > validate : false
                let h3_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H3 > validate : false
                let h4_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H4 > validate : false
                let h5_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H5 > validate : false
                let h6_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H6 > validate : false
                let h7_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H7 > validate : false
                let h8_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H8 > validate : false
                let h9_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H9 > validate : false
                let h10_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H10 > validate : false
                let h11_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H11 > validate : false
                let h12_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H12 > validate : false
                let h13_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H13 > validate : false
                let h14_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H14 > validate : false
                let h15_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H15 > validate : false
                let h16_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H16 > validate : false
                let h17_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H17 > validate : false
                let h18_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H18 > validate : false
                let h19_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H19 > validate : false
                let h20_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H20 > validate : false
                let h21_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H21 > validate : false
                let h22_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H22 > validate : false
                let h23_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H23 > validate : false
                let h24_is_over = row?.query_shipper_nomination_type_id === 1 ? row?.H24 > validate : false
               
                // const validateValTotal = `${formatNumberThreeDecimalNom(Number(String(validate_total).replace(/,/g, '').trim()))}`
                // const validateVal = `${formatNumberThreeDecimalNom(Number(String(validate).replace(/,/g, '').trim()))}`
                const validateValTotal = `${formatNumberThreeDecimalNomRound(Number(String(validate_total).replace(/,/g, '').trim()))}`
                const validateVal = `${formatNumberThreeDecimalNomRound(Number(String(validate).replace(/,/g, '').trim()))}`
                if(!total_cap_validate && !isNaN(validate_total)){
                    const msgValue = row?.totalCap !== null && row?.totalCap !== undefined ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(row?.totalCap) : formatNumberThreeDecimalNom(row?.totalCap) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) Total volume ${msgValue} exceeds max cap value ${validateValTotal}`
                    messageWarning.push(messageText)
                }
                if(h1_is_over){
                    const msgValue = row?.H1 !== null && row?.H1 !== undefined && row?.H1 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H1).replace(/,/g, '').trim())) : ''
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H1`
                    messageWarning.push(messageText)
                }
                if(h2_is_over){
                    const msgValue = row?.H2 !== null && row?.H2 !== undefined && row?.H2 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H2).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H2`
                    messageWarning.push(messageText)
                }
                if(h3_is_over){
                    const msgValue = row?.H3 !== null && row?.H3 !== undefined && row?.H3 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H3).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H3`
                    messageWarning.push(messageText)
                }
                if(h4_is_over){
                    const msgValue = row?.H4 !== null && row?.H4 !== undefined && row?.H4 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H4).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H4`
                    messageWarning.push(messageText)
                }
                if(h5_is_over){
                    const msgValue = row?.H5 !== null && row?.H5 !== undefined && row?.H5 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H5).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H5`
                    messageWarning.push(messageText)
                }
                if(h6_is_over){
                    const msgValue = row?.H6 !== null && row?.H6 !== undefined && row?.H6 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H6).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H6`
                    messageWarning.push(messageText)
                }
                if(h7_is_over){
                    const msgValue = row?.H7 !== null && row?.H7 !== undefined && row?.H7 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H7).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H7`
                    messageWarning.push(messageText)
                }
                if(h8_is_over){
                    const msgValue = row?.H8 !== null && row?.H8 !== undefined && row?.H8 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H8).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H8`
                    messageWarning.push(messageText)
                }
                if(h9_is_over){
                    const msgValue = row?.H9 !== null && row?.H9 !== undefined && row?.H9 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H9).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H9`
                    messageWarning.push(messageText)
                }
                if(h10_is_over){
                    const msgValue = row?.H10 !== null && row?.H10 !== undefined && row?.H10 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H10).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H10`
                    messageWarning.push(messageText)
                }
                if(h11_is_over){
                    const msgValue = row?.H11 !== null && row?.H11 !== undefined && row?.H11 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H11).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H11`
                    messageWarning.push(messageText)
                }
                if(h12_is_over){
                    const msgValue = row?.H12 !== null && row?.H12 !== undefined && row?.H12 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H12).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H12`
                    messageWarning.push(messageText)
                }
                if(h13_is_over){
                    const msgValue = row?.H13 !== null && row?.H13 !== undefined && row?.H13 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H13).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H13`
                    messageWarning.push(messageText)
                }
                if(h14_is_over){
                    const msgValue = row?.H14 !== null && row?.H14 !== undefined && row?.H14 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H14).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H14`
                    messageWarning.push(messageText)
                }
                if(h15_is_over){
                    const msgValue = row?.H15 !== null && row?.H15 !== undefined && row?.H15 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H15).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H15`
                    messageWarning.push(messageText)
                }
                if(h16_is_over){
                    const msgValue = row?.H16 !== null && row?.H16 !== undefined && row?.H16 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H16).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H16`
                    messageWarning.push(messageText)
                }
                if(h17_is_over){
                    const msgValue = row?.H17 !== null && row?.H17 !== undefined && row?.H17 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H17).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H17`
                    messageWarning.push(messageText)
                }
                if(h18_is_over){
                    const msgValue = row?.H18 !== null && row?.H18 !== undefined && row?.H18 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H18).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H18`
                    messageWarning.push(messageText)
                }
                if(h19_is_over){
                    const msgValue = row?.H19 !== null && row?.H19 !== undefined && row?.H19 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H19).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H19`
                    messageWarning.push(messageText)
                }
                if(h20_is_over){
                    const msgValue = row?.H20 !== null && row?.H20 !== undefined && row?.H20 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H20).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H20`
                    messageWarning.push(messageText)
                }
                if(h21_is_over){
                    const msgValue = row?.H21 !== null && row?.H21 !== undefined && row?.H21 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H21).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H21`
                    messageWarning.push(messageText)
                }
                if(h22_is_over){
                    const msgValue = row?.H22 !== null && row?.H22 !== undefined && row?.H22 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H22).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H22`
                    messageWarning.push(messageText)
                }
                if(h23_is_over){
                    const msgValue = row?.H23 !== null && row?.H23 !== undefined && row?.H23 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H23).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H23`
                    messageWarning.push(messageText)
                }
                if(h24_is_over){
                    const msgValue = row?.H24 !== null && row?.H24 !== undefined && row?.H24 !== '' ? row?.units === "MMSCFD" ? formatNumberSixDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : formatNumberThreeDecimalNom(Number(String(row?.H24).replace(/,/g, '').trim())) : '' 
                    const messageText = `Nominated [${row?.nomination_point}] (${row?.units || row?.unix}) max volume ${msgValue} exceeds max cap value ${validateVal} hour H24`
                    messageWarning.push(messageText)
                }

                return row
            })
        }

        setMdSubmissionView(true)
        setWarningMessage(messageWarning || [])
    }

    const handleChange = (event: any, newValue: any) => {
        // 0 = Nomination
        // 1 = Area
        // 2 = Total System
        setTabIndexNomAreaTotal(newValue);
        setTabIndexFrameTableMain(newValue)
    };

    useEffect(() => {
        setTabIndexNomAreaTotal(tabIdxNomAreaTotal)
    }, [tabIdxNomAreaTotal])

    // ############### TAB MMSCF, MMBTU, Imbalance ###############
    const [tabIndex2ndTab, setTabIndex2ndTab] = useState(0);
    const handleChange2ndTab = (event: any, newValue: any) => {
        // 0 = MMSCF
        // 1 = MMBTU, Imbalance
        setTabIndex2ndTab(newValue);
        setTabIndexFrameTableSub(newValue);
    };

    // activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1

    useEffect(() => {
        if (activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1) { // tab all
            setCheckIsAllAreaImbalance(true)
        // } else if (activeButton == 1 && tabIndexNomAreaTotal == 2) {
        //     setCheckIsAllAreaImbalance(true) // All > Total System > เอา Check Box Over Total Cap ออก https://app.clickup.com/t/86euy3aub
        // } else if (activeButton == 3 && tabIndexNomAreaTotal == 2) {
        //     setCheckIsAllAreaImbalance(true) // Daily > Total System > เอา Check Box Total Cap ออก https://app.clickup.com/t/86euy3pjd
        } else if (activeButton == 2 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1) { // tab weekly
            setCheckIsAllAreaImbalance(true)
        } else if (activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1) { // tab daily
            setCheckIsAllAreaImbalance(true)
        } else {
            setCheckIsAllAreaImbalance(false)
        }
    }, [tabIndexNomAreaTotal, tabIndex2ndTab, activeButton])
    
    
    return (
        <>
            {/* Tab หลัก */}
            <div className="tabPlanning pb-2 ">
                <Tabs
                    value={tabIndexNomAreaTotal}
                    onChange={handleChange}
                    aria-label="tabs"
                    sx={{
                        marginBottom: '-19px !important',
                        '& .MuiTabs-indicator': {
                            display: 'none', // Remove the underline
                        },
                        '& .Mui-selected': {
                            color: '#58585A !important',
                        },
                    }}
                >
                    {['Nomination', 'Area', 'Total System'].map((label, index) => (
                        <Tab
                            key={label}
                            label={label}
                            id={`tab-${index}`}
                            sx={{
                                fontFamily: 'Tahoma !important',
                                border: '0.5px solid',
                                borderColor: '#DFE4EA',
                                borderBottom: 'none',
                                borderTopLeftRadius: '9px',
                                borderTopRightRadius: '9px',
                                textTransform: 'none',
                                padding: '8px 16px',
                                minWidth: '80px',
                                maxWidth: '80px',
                                flexShrink: 0, // Prevents shrinking
                                backgroundColor: tabIndexNomAreaTotal === index ? '#FFFFFF' : '#9CA3AF1A',
                                color: tabIndexNomAreaTotal === index ? '#58585A' : '#9CA3AF',
                                '&:hover': {
                                    backgroundColor: '#F3F4F6',
                                },
                            }}
                        />
                    ))}
                </Tabs>
            </div>

            {/* <div className="w-full h-[calc(100vh-300px)]  border-[#DFE4EA] border-[1px] rounded-tl-none gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden"> */}
            <div className="w-full h-[calc(100vh-180px)] border-[#DFE4EA] border-[1px] rounded-tl-none gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden">

                {/* Tab ย่อยสีฟ้า ๆ */}
                <div className="pt-2 px-2">
                    {tabIndexNomAreaTotal !== 2 && ( // แสดงเฉพาะ tab 'Nomination', 'Area'
                        <Tabs
                            value={tabIndex2ndTab}
                            onChange={handleChange2ndTab}
                            aria-label="wrapped label tabs example"
                            sx={{
                                '& .Mui-selected': {
                                    color: '#00ADEF !important',
                                    fontWeight: 'bold !important',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#00ADEF !important',
                                    width: '59px !important',
                                    transform: 'translateX(35%)',
                                    bottom: '10px',
                                },
                                '& .MuiTab-root': {
                                    minWidth: 'auto !important',
                                },
                            }}
                        >
                            {(tabIndexNomAreaTotal === 0 ? ['MMSCF', 'MMBTU'] : ['MMBTU', 'Imbalance']).map((label, index) => (
                                <Tab
                                    key={label}
                                    label={label}
                                    id={`tab-${index}`}
                                    sx={{
                                        fontFamily: 'Tahoma !important',
                                        textTransform: 'none',
                                        padding: '8px 16px',
                                        minWidth: '35px',
                                        maxWidth: '103px',
                                        flexShrink: 0,
                                        color: tabIndex2ndTab === index ? '#58585A' : '#9CA3AF',
                                    }}
                                />
                            ))}

                        </Tabs>
                    )}
                </div>
                    {/* !checkIsAllAreaImbalance &&  */}
                {/* แสดง table */} 
                {
                    tableData ?
                <div className="pt-2 px-2">
                    {
                        // TABLE ALL --> NOMINATION --> MMSCF
                        // activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableAllNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.all?.MMSCFD} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableAllNomination openWarning={openWarning} tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.all?.MMSCFD} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE ALL --> NOMINATION --> MMBTU
                        // activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableAllNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.all?.MMBTUD} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 1 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableAllNomination openWarning={openWarning} tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.all?.MMBTUD} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE ALL --> AREA --> MMSCF
                        // activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableAllArea tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.area?.all?.MMBTUD} areaMaster={areaMaster} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableAllArea openWarning={openWarning} tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.area?.all?.MMBTUD} areaMaster={areaMaster} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE ALL --> AREA --> IMBALANCE
                        // activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableAllArea tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.area?.all?.Imbalance} areaMaster={areaMaster} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 1 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableAllArea checkIsAllAreaImbalance={checkIsAllAreaImbalance} openWarning={openWarning} tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.area?.all?.Imbalance} areaMaster={areaMaster} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE ALL --> TOTAL SYSTEM
                        activeButton == 1 && tabIndexNomAreaTotal == 2 && <TableAllTotalSystem openWarning={openWarning} nomData={nomDataK} isLoading={true} tableData={tableData?.total?.all} areaMaster={areaMaster} zoneMaster={zoneMaster} userPermission={userPermission} srchStartDate={srchStartDate} />
                    }


                    {/* ============================================================================================================================== */}
                    {/* ============================================================================================================================== */}

                    {
                        // TABLE WEEKLY --> NOMINATION --> MMSCF
                        // activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableWeeklyNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.weekly?.MMSCFD} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableWeeklyNomination openWarning={openWarning} tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.weekly?.MMSCFD} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} dataEva={dataEva} />
                    }

                    {
                        // TABLE WEEKLY --> NOMINATION --> MMBTU
                        // activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableWeeklyNomination tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.weekly?.MMBTUD} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 2 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableWeeklyNomination openWarning={openWarning} tabIndex2ndTab={tabIndex2ndTab} isLoading={true} tableData={tableData?.nomination?.weekly?.MMBTUD} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} dataEva={dataEva} />
                    }

                    {
                        // TABLE WEEKLY --> AREA --> MMBTU
                        activeButton == 2 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableWeeklyArea openWarning={openWarning} isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.weekly?.MMBTUD} areaMaster={areaMaster} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE WEEKLY --> AREA --> IMBALANCE
                        activeButton == 2 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableWeeklyArea checkIsAllAreaImbalance={checkIsAllAreaImbalance} openWarning={openWarning} isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.weekly?.Imbalance} areaMaster={areaMaster} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE WEEKLY --> TOTAL SYSTEM
                        activeButton == 2 && tabIndexNomAreaTotal == 2 && <TableWeeklyTotalSystem openWarning={openWarning} nomData={nomDataK} dataEva={dataEva} isLoading={true} tableData={tableData?.total?.weekly} areaMaster={areaMaster} zoneMaster={zoneMaster} userPermission={userPermission} srchStartDate={srchStartDate} />
                    }


                    {/* ============================================================================================================================== */}
                    {/* ============================================================================================================================== */}

                    {
                        // TABLE DAILY --> NOMINATION --> MMSCF
                        // activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableDailyNomination isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.nomination?.daily?.MMSCFD} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 0 && <TableDailyNomination openWarning={openWarning} isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.nomination?.daily?.MMSCFD} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} dataEva={dataEva} />
                    }

                    {
                        // TABLE DAILY --> NOMINATION --> MMBTU
                        // activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableDailyNomination isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.nomination?.daily?.MMBTUD} nomData={tableData?.nomData} userPermission={userPermission} />
                        activeButton == 3 && tabIndexNomAreaTotal == 0 && tabIndex2ndTab == 1 && <TableDailyNomination openWarning={openWarning} isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.nomination?.daily?.MMBTUD} nomData={nomDataK} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} dataEva={dataEva} />
                    }

                    {
                        // TABLE DAILY --> AREA --> MMBTU
                        activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 0 && <TableDailyArea openWarning={openWarning} isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.daily?.MMBTUD} areaMaster={areaMaster} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE DAILY --> AREA --> IMBALANCE
                        activeButton == 3 && tabIndexNomAreaTotal == 1 && tabIndex2ndTab == 1 && <TableDailyArea checkIsAllAreaImbalance={checkIsAllAreaImbalance} openWarning={openWarning} isLoading={true} tabIndex2ndTab={tabIndex2ndTab} tableData={tableData?.area?.daily?.Imbalance} areaMaster={areaMaster} userPermission={userPermission} srchCheckbox={srchCheckbox} activeButton={activeButton} />
                    }

                    {
                        // TABLE DAILY --> TOTAL SYSTEM
                        activeButton == 3 && tabIndexNomAreaTotal == 2 && <TableDailyTotalSystem openWarning={openWarning} nomData={nomDataK} dataEva={dataEva} isLoading={true} tableData={tableData?.total?.daily} areaMaster={areaMaster} zoneMaster={zoneMaster} userPermission={userPermission} srchStartDate={srchStartDate} />
                    }

                </div>
                : <NodataTable textRender={'Please select filter to view the information.'} />
                }

            </div>

            <ModalSubmissionDetailsSum
            data={warningMessage}
            open={mdSubmissionView}
            onClose={() => {
                setMdSubmissionView(false);
            }}
        />

        </>
    )
}

export default FrameTable;