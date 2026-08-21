import { combineReducers } from '@reduxjs/toolkit';
import divisionReducer from './divisionSlice';
import zoneMasterReducer from './zoneMasterSlice';
import entryExitReducer from './entryExitSlice';
import areaMasterReducer from './areaMasterSlice';
import nominationPointReducer from './nominationPointSlice';
import contractPointReducer from './contractPointSlice';
import typeConceptPointReducer from './typeConceptPointSlice';
import shipperGroupReducer from './shipperGroupSlice';
import processTypeReducer from './processTypeSlice';
import nominationTypeReducer from './nominationTypeSlice';
import userTypeReducer from './userTypeMasterSlice';
import termTypeReducer from './termTypeMasterSlice';
import announcementReducer from './announcementSlice';
import statcapreqmgnReducer from './statusCapReqMgnSlice';
import nominationStatReducer from './nominationStatusSlice';
import sysparammoduleReducer from './systemParamModuleSlice';
import systemparamReducer from './systemParamSlice'
import emailnotimgnReducer from './emailNotiMgnSlice';
import userguideroleReducer from './userGuideRoleAllSlice';
import auditlogmoduleReducer from './auditLogSlice';
import allocationModeReducer from './allocationModeSlice';
import allocationStatusReducer from './allocationStatusSlice';
import loginReducer from './loginSlice';
import authReducer from './tokenSlice';
// import departmentReducer from './departmentSlice';

const rootReducer = combineReducers({
  division: divisionReducer,
  zonemaster: zoneMasterReducer,
  entryexit: entryExitReducer,
  areamaster: areaMasterReducer,
  nompoint: nominationPointReducer,
  contractpoint: contractPointReducer,
  typeconceptpoint: typeConceptPointReducer,
  shippergroup: shipperGroupReducer,
  processtype: processTypeReducer,
  nominationtype: nominationTypeReducer,
  usertype: userTypeReducer,
  termtype: termTypeReducer,
  announcement: announcementReducer,
  sysparammodule: sysparammoduleReducer,
  systemparam: systemparamReducer,
  emailnotimgn: emailnotimgnReducer,
  userguiderole: userguideroleReducer,
  auditlogmodule: auditlogmoduleReducer,
  statcapreqmgn: statcapreqmgnReducer,
  nomstatmaster: nominationStatReducer,
  allocationmodemaster: allocationModeReducer,
  allocationstatusmaster: allocationStatusReducer,
  auth: authReducer,
  login: loginReducer,
  //   department: departmentReducer,
});

export default rootReducer;