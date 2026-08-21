import { fetchAllocationModeMaster } from "@/utils/store/slices/allocationModeSlice";
import { fetchAllocationStatusMaster } from "@/utils/store/slices/allocationStatusSlice";
import { fetchAnnouncementMaster } from "@/utils/store/slices/announcementSlice";
import { fetchAreaMaster } from "@/utils/store/slices/areaMasterSlice";
import { fetchAuditLogModule } from "@/utils/store/slices/auditLogSlice";
import { fetchContractPoint } from "@/utils/store/slices/contractPointSlice";
// import { fetchEmailNotiMgn } from "@/utils/store/slices/emailNotiMgnSlice";
import { fetchEntryExit } from "@/utils/store/slices/entryExitSlice";
import { fetchNominationPoint } from "@/utils/store/slices/nominationPointSlice";
import { fetchNomStatMaster } from "@/utils/store/slices/nominationStatusSlice";
import { fetchNominationType } from "@/utils/store/slices/nominationTypeSlice";
import { fetchProcessType } from "@/utils/store/slices/processTypeSlice";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import { fetchSystemParamModule } from "@/utils/store/slices/systemParamModuleSlice";
import { fetchSystemParamMaster } from '@/utils/store/slices/systemParamSlice';
import { fetchTermType } from "@/utils/store/slices/termTypeMasterSlice";
// import { fetchTypeConceptPoint } from "@/utils/store/slices/typeConceptPointSlice";
// import { fetchUserGuideRoleAll } from "@/utils/store/slices/userGuideRoleAllSlice";
import { fetchUserType } from "@/utils/store/slices/userTypeMasterSlice";
import { fetchZoneMasterSlice } from "@/utils/store/slices/zoneMasterSlice";

export const fetchAllData = async (dispatch:any, token?:any) => {

    const apiCalls = [
        fetchEntryExit(), // ok
        fetchZoneMasterSlice(), // ok 
        // fetchTypeConceptPoint(), 
        fetchShipperGroup(), // ok
        fetchAreaMaster(), // ok
        fetchNominationPoint(), // ok
        fetchContractPoint(), // ok
        fetchTermType(), // ok
        fetchAuditLogModule(), // ok
        // fetchEmailNotiMgn(), 
        fetchProcessType(), // ok
        fetchNominationType(), // ok 
        fetchUserType(), // ok
        fetchSystemParamModule(), // ok
        fetchSystemParamMaster(), // ok
        // fetchUserGuideRoleAll(),
        fetchAnnouncementMaster(), // json ok
        fetchNomStatMaster(), // ok
        fetchAllocationModeMaster(), // json ok
        fetchAllocationStatusMaster(), // json ok
    ];

    // const apiCalls = [
    //     fetchAreaMaster(),
    // ];

    for (const apiCall of apiCalls) {
        try {
            await dispatch(apiCall);
            await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
            // Error fetching data from API:
        }
    }
    console.log('All data fetched.');
};