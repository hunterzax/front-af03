import { fetchAllocationModeMaster } from '@/utils/store/slices/allocationModeSlice';
import { fetchAllocationStatusMaster } from '@/utils/store/slices/allocationStatusSlice';
import { fetchAreaMaster } from '@/utils/store/slices/areaMasterSlice';
import { fetchAuditLogModule } from '@/utils/store/slices/auditLogSlice';
import { fetchContractPoint } from '@/utils/store/slices/contractPointSlice';
// import { fetchEmailNotiMgn } from '@/utils/store/slices/emailNotiMgnSlice';
import { fetchEntryExit } from '@/utils/store/slices/entryExitSlice';
import { fetchNominationPoint } from '@/utils/store/slices/nominationPointSlice';
import { fetchNomStatMaster } from '@/utils/store/slices/nominationStatusSlice';
import { fetchNominationType } from '@/utils/store/slices/nominationTypeSlice';
import { fetchProcessType } from '@/utils/store/slices/processTypeSlice';
import { fetchShipperGroup } from '@/utils/store/slices/shipperGroupSlice';
import { fetchStatCapReqMgnMaster } from '@/utils/store/slices/statusCapReqMgnSlice';
import { fetchSystemParamModule } from '@/utils/store/slices/systemParamModuleSlice';
import { fetchSystemParamMaster } from '@/utils/store/slices/systemParamSlice';
import { fetchTermType } from '@/utils/store/slices/termTypeMasterSlice';
// import { fetchTypeConceptPoint } from '@/utils/store/slices/typeConceptPointSlice';
// import { fetchUserGuideRoleAll } from '@/utils/store/slices/userGuideRoleAllSlice';
import { fetchUserType } from '@/utils/store/slices/userTypeMasterSlice';
import { fetchZoneMasterSlice } from '@/utils/store/slices/zoneMasterSlice';
import { RootState, useAppDispatch } from '@/utils/store/store';
import { useEffect, useCallback, useState, useRef } from 'react';
import { useSelector } from 'react-redux';

export const useFetchMasters = (forceRefetch = false) => {
    const dispatch = useAppDispatch();

    const entryExitMaster = useSelector((state: RootState) => state.entryexit);
    const zoneMaster = useSelector((state: RootState) => state.zonemaster);
    const typeConceptPoint = useSelector((state: RootState) => state.typeconceptpoint);
    const shipperGroupData = useSelector((state: RootState) => state.shippergroup);
    const areaMaster = useSelector((state: RootState) => state.areamaster);
    const nominationPointData = useSelector((state: RootState) => state.nompoint);
    const contractPointData = useSelector((state: RootState) => state.contractpoint);
    const termTypeMaster = useSelector((state: RootState) => state.termtype);
    const auditLogModule = useSelector((state: RootState) => state.auditlogmodule);
    const emailNotiMgn = useSelector((state: RootState) => state.emailnotimgn);
    const processTypeMaster = useSelector((state: RootState) => state.processtype);
    const nominationTypeMaster = useSelector((state: RootState) => state.nominationtype);
    const userTypeMaster = useSelector((state: RootState) => state.usertype);
    const sysParamModule = useSelector((state: RootState) => state.sysparammodule);
    const sysParamMaster = useSelector((state: RootState) => state.systemparam);
    const userGuideRole = useSelector((state: RootState) => state.userguiderole);
    const statCapReqMgn = useSelector((state: RootState) => state.statcapreqmgn);
    const nominationStatMaster = useSelector((state: RootState) => state.nomstatmaster);
    const allocationModeMaster = useSelector((state: RootState) => state.allocationmodemaster);
    const allocationStatusMaster = useSelector((state: RootState) => state.allocationstatusmaster);

    // Fetch data if not present, or forceRefetch is true
    const fetchData = useCallback(() => {
        if (!entryExitMaster?.data || (!Array.isArray(entryExitMaster?.data) && entryExitMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchEntryExit()); //ok
        }
        if (!zoneMaster?.data || (!Array.isArray(zoneMaster?.data) && zoneMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchZoneMasterSlice()); // ok
        }
        if (!areaMaster?.data || (!Array.isArray(areaMaster?.data) && areaMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchAreaMaster()); // ok
        }
        if (!shipperGroupData?.data || (!Array.isArray(shipperGroupData?.data) && shipperGroupData?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchShipperGroup()); // ok
        }
        // if (!typeConceptPoint?.data || forceRefetch) {
        //     dispatch(fetchTypeConceptPoint());
        // }
        if (!nominationPointData?.data || (!Array.isArray(nominationPointData?.data) && nominationPointData?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchNominationPoint()); // ok
        }
        if (!contractPointData?.data || (!Array.isArray(contractPointData?.data) && contractPointData?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchContractPoint()); // ok
        }
        if (!termTypeMaster?.data || (!Array.isArray(termTypeMaster?.data) && termTypeMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchTermType()); // ok
        }
        if (!auditLogModule?.data || (!Array.isArray(auditLogModule?.data) && auditLogModule?.data?.name?.includes('Error')) || forceRefetch) {
            dispatch(fetchAuditLogModule()); // ok
        }
        // if (!emailNotiMgn?.data || forceRefetch) {
        //     dispatch(fetchEmailNotiMgn());
        // }
        if (!processTypeMaster?.data || (!Array.isArray(processTypeMaster?.data) && processTypeMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchProcessType()); // ok
        }
        if (!nominationTypeMaster?.data || (!Array.isArray(nominationTypeMaster?.data) && nominationTypeMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchNominationType()); // ok
        }
        if (!userTypeMaster?.data || (!Array.isArray(userTypeMaster?.data) && userTypeMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchUserType()); // ok
        }
        if (!sysParamModule?.data || (!Array.isArray(sysParamModule?.data) && sysParamModule?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchSystemParamModule()); // ok
        }
        if (!sysParamMaster?.data || (!Array.isArray(sysParamMaster?.data) && sysParamMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchSystemParamMaster()); // ok
        }
        // if (!userGuideRole?.data || forceRefetch) {
        //     dispatch(fetchUserGuideRoleAll());
        // }
        if (!statCapReqMgn?.data || (!Array.isArray(statCapReqMgn?.data) && statCapReqMgn?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchStatCapReqMgnMaster()); // ok
        }
        if (!nominationStatMaster?.data || (!Array.isArray(nominationStatMaster?.data) && nominationStatMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchNomStatMaster()); // ok
        }
        if (!allocationModeMaster?.data || (!Array.isArray(allocationModeMaster?.data) && allocationModeMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchAllocationModeMaster()); // ok
        }
        if (!allocationStatusMaster?.data || (!Array.isArray(allocationStatusMaster?.data) && allocationStatusMaster?.data?.name?.includes('Error'))  || forceRefetch) {
            dispatch(fetchAllocationStatusMaster()); // ok
        }
    }, [dispatch, entryExitMaster, zoneMaster, typeConceptPoint, shipperGroupData, areaMaster, nominationPointData, contractPointData, termTypeMaster, auditLogModule, emailNotiMgn, processTypeMaster, userTypeMaster, nominationTypeMaster, sysParamModule, sysParamMaster, userGuideRole, statCapReqMgn, nominationStatMaster, allocationModeMaster, allocationStatusMaster, forceRefetch]);

    // useEffect(() => {
    //     fetchData();
    // }, [fetchData]);

    const calledRef = useRef(false);

    useEffect(() => {
    if (calledRef.current && !forceRefetch) return;
    calledRef.current = true;
    fetchData();
    }, [fetchData, forceRefetch]);

    // Optional: Provide a function to manually trigger refetch
    const refetch = () => fetchData();
    return { entryExitMaster, zoneMaster, typeConceptPoint, shipperGroupData, areaMaster, nominationPointData, contractPointData, termTypeMaster, auditLogModule, emailNotiMgn, processTypeMaster, userTypeMaster, nominationTypeMaster, sysParamModule, sysParamMaster, userGuideRole, statCapReqMgn, nominationStatMaster, allocationModeMaster, allocationStatusMaster, refetch };
};
