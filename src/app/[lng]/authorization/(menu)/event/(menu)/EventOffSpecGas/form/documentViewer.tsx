"use client";
import { useEffect, useState } from "react";
import { generateUserPermission } from '@/utils/generalFormatter';
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import { SubmitHandler } from "react-hook-form";
import FormDocument1 from "./formDocument1";
import FormDocument2 from "./formDocument2";
import { getService } from "@/utils/postService";
import FormDocument3 from "./formDocument3";
import Spinloading from "@/components/other/spinLoading";

type FormProps = {
    setIsOpenDocument: any;
    WhichOpenDocument: any; // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
    modeOpenDocument: any; // mode -> 'view', 'edit'
    setModeOpenDocument: any
    dataOpenDocument: any; // ข้อมูลของ doc ตอนเปิด view, edit
    setDataOpenDocument: any
    setIsOpenHistory: any; // เปิด ปิด history ของ doc 4
    onSubmit: SubmitHandler<any>;
    modePage?: any
};

const DocumentViewer: React.FC<FormProps> = ({ setIsOpenDocument, WhichOpenDocument, modeOpenDocument, dataOpenDocument, setDataOpenDocument, onSubmit, modePage, setModeOpenDocument,  setIsOpenHistory}) => {

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
// let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;
    const getPermission = () => {
        if (user_permission) {
            try {
                user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            } catch (error) {
                // Failed to parse user_permission:
            }
        } else {
            // No user_permission found
        }
    }

    useEffect(() => {
        getPermission();
    }, [])

    // ############### FETCH ###############
    const [shipperData, setShipperData] = useState<any>([])
    const [emailGroupForEventData, setEmailGroupForEventData] = useState<any>([])
    const [refDoc1Data, setRefDoc1Data] = useState<any>([])
    const [refDoc1and2Data, setRefDoc1and2Data] = useState<any>([])

    const fetchData = async () => {
        const gid = userDT?.account_manage?.[0]?.group?.id;

        // DATA SHIPPER 
        const res_shipper: any = await getService(`/master/event/offspec-gas/doc2/shipper`); // สำหรับ doc 2 โดยเฉพาะ
        setShipperData(res_shipper)

        // DATA EMAIL GROUP FOR EVENT
        const res_email_group_for_event: any = await getService(`/master/event/offspec-gas/doc2/email-group-for-event`);
        setEmailGroupForEventData(res_email_group_for_event)

        // DATA FOR REF DOCUMENT 1
        const res_def_doc_1: any = await getService(`/master/event/offspec-gas/doc2/ref-doc-use`);
        if (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) {
            const filtered = Array.isArray(res_def_doc_1) ? res_def_doc_1.filter(doc => (doc?.event_document ?? []).some((ed: any) => ed?.group_id === gid)) : [];
            setRefDoc1Data(filtered)
        } else {
            setRefDoc1Data(res_def_doc_1)
        }

        // DATA FOR REF DOCUMENT 1, 2
        const res_def_doc_2: any = await getService(`/master/event/offspec-gas/doc3/ref-doc-use`);
        if (userDT?.account_manage?.[0]?.user_type_id == 3 || userDT?.account_manage?.[0]?.user_type_id == 4) {
            const filtered = Array.isArray(res_def_doc_2) ? res_def_doc_2.filter(doc => (doc?.event_document ?? []).some((ed: any) => ed?.group_id === gid)) : [];
            setRefDoc1and2Data(filtered)
        } else {
            setRefDoc1and2Data(res_def_doc_2)
        }

        setTimeout(() => {
            setisLoading(false);
        }, 300);

    }

    useEffect(() => {
        fetchData()
    }, [])

    const [isLoading, setisLoading] = useState<boolean>(true);

    const getformSubmit = (data: any) => {
        setisLoading(true);

        setTimeout(() => {
            onSubmit(data);
        }, 300);
    }

    return (<>
        <div className="space-y-2">
            <div className="text-[#464255] px-4 text-[14px] font-bold pt-4">
                <div className="cursor-pointer" onClick={() => {
                    setIsOpenDocument(false)
                    setDataOpenDocument(undefined)
                    if (modePage == 'history') {
                        setIsOpenHistory(true)
                        setModeOpenDocument(modePage)
                    }
                }}
                >
                    <ArrowBackIos style={{ fontSize: "14px" }} /> {` Back`}
                </div>
            </div>
        </div>

        {/* <div className="flex h-[calc(100vh-300px)] gap-2 pt-2 overflow-hidden"> */}
        {/* <div className="flex h-[calc(150vh-240px)] gap-2 pt-2 pb-2 overflow-hidden"> */}
        <div className="flex h-full gap-2 pt-2 pb-2 overflow-hidden">
            {/* Main Content */}
            <div className="w-full h-full p-8 border-[#DFE4EA] border-[1px] gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                <Spinloading spin={isLoading} rounded={5} />

                {
                    // DOCUMENT 1
                    WhichOpenDocument == 'document_1' &&
                    <FormDocument1
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                    />
                }

                {
                    // DOCUMENT 2
                    WhichOpenDocument == 'document_2' &&
                    <FormDocument2
                        mode={modeOpenDocument}
                        data={[]}
                        // onSubmit={onSubmit}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        refDoc1Data={refDoc1Data}
                        userDT={userDT}
                    />
                }

                {
                    // DOCUMENT 3
                    WhichOpenDocument == 'document_3' &&
                    <FormDocument3
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        refDocData={refDoc1and2Data}
                        userDT={userDT}
                    />
                }

            </div>
        </div>
    </>
    );
};

export default DocumentViewer;