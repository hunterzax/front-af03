"use client";
import { useEffect, useState } from "react";
import { generateUserPermission } from '@/utils/generalFormatter';
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import { SubmitHandler, useForm } from "react-hook-form";
import { getService } from "@/utils/postService";
import FormDocument39 from "./document/formDocument39";
import FormDocument4 from "./document/formDocument4";
import FormDocument5 from "./document/formDocument5";
import FormDocument6 from "./document/formDocument6";
import FormDocument41 from "./document/formDocument41";
import Spinloading from "@/components/other/spinLoading";

type FormProps = {
    setIsOpenDocument: any;
    WhichOpenDocument: any; // เปิดเอกสารเบอร์ไหน -> 'document_39', 'document_4', 'document_5', 'document_6'
    modeOpenDocument: any; // mode -> 'view', 'edit'
    setModeOpenDocument: any
    dataOpenDocument: any; // ข้อมูลของ doc ตอนเปิด view, edit
    setIsOpenHistory: any; // เปิด ปิด history ของ doc 4
    onSubmit: SubmitHandler<any>;
    modePage?: any
    maiHedDocSamKaoLasted?: any
    maiHedDocSeeLasted?: any
    maiHedDocHaLasted?: any
    maiHedDocHokLasted?: any
};

const DocumentViewer: React.FC<FormProps> = ({ setIsOpenDocument, WhichOpenDocument, modeOpenDocument, setModeOpenDocument, dataOpenDocument, onSubmit, setIsOpenHistory, modePage, maiHedDocSamKaoLasted, maiHedDocSeeLasted, maiHedDocHaLasted, maiHedDocHokLasted }) => {

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

    // #region FETCH
    // ############### FETCH ###############
    const [shipperData, setShipperData] = useState<any>([])
    const [emailGroupForEventData, setEmailGroupForEventData] = useState<any>([])
    const [refDoc39ForDoc4, setRefDoc39ForDoc4] = useState<any>([])
    const [refDoc39ForDoc5, setRefDoc39ForDoc5] = useState<any>([])
    const [refDoc39ForDoc6, setRefDoc39ForDoc6] = useState<any>([])
    const [dataNomPointForDoc6, setDataNomPointForDoc6] = useState<any>([])

    const fetchData = async () => {

        // DATA SHIPPER 
        const res_shipper: any = await getService(`/master/event/emer/doc41/shipper`);
        setShipperData(res_shipper)

        // DATA EMAIL GROUP FOR EVENT
        const res_email_group_for_event: any = await getService(`/master/event/emer/doc41/email-group-for-event`);
        setEmailGroupForEventData(res_email_group_for_event)
        
        if(WhichOpenDocument === "document_4" || WhichOpenDocument ===  "document_39"){
            // DATA FOR REF DOCUMENT 3.9 for doc 4
            // const res_def_doc_39_for_doc_4: any = await getService(`/master/event/emer/doc4/ref-doc-use`); // original
            const res_def_doc_39_for_doc_4: any = await getService(`/master/event/emer/doc41/ref-doc-use`);
            setRefDoc39ForDoc4(res_def_doc_39_for_doc_4)

        }
        
        if(WhichOpenDocument === "document_5" || WhichOpenDocument ===  "document_39"){
            // DATA FOR REF DOCUMENT 3.9 for doc 5
            const res_def_doc_39_for_doc_5: any = await getService(`/master/event/emer/doc5/ref-doc-use`);
            setRefDoc39ForDoc5(res_def_doc_39_for_doc_5)
            
        }

        if(WhichOpenDocument === "document_6" || WhichOpenDocument ===  "document_39"){
            // DATA FOR REF DOCUMENT 3.9 for doc 6
            const res_def_doc_39_for_doc_6: any = await getService(`/master/event/emer/doc6/ref-doc-use`);
            setRefDoc39ForDoc6(res_def_doc_39_for_doc_6)
        }

        if(WhichOpenDocument === "document_6"){
            // DATA NOM POINT FOR DOC 6
            const res_nom_point_for_doc_6: any = await getService(`/master/event/emer/doc6/nompoint`);
            setDataNomPointForDoc6(res_nom_point_for_doc_6)
        }


        setTimeout(() => {
            setisLoading(false)
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
                    switch (WhichOpenDocument) {
                        case 'document_39':
                            setIsOpenDocument(false)
                            if (modePage == 'history') {
                                setIsOpenHistory(true)
                                setModeOpenDocument(modePage)
                            }
                            break;
                        case 'document_4':
                            setIsOpenDocument(false)
                            if (modePage !== 'create') {
                                setIsOpenHistory(true)
                                setModeOpenDocument(modePage)
                            }
                            break;
                        case 'document_5':
                            setIsOpenDocument(false)
                            if (modePage == 'history') {
                                setIsOpenHistory(true)
                                setModeOpenDocument(modePage)
                            }
                            break;
                        case 'document_6':
                            setIsOpenDocument(false)
                            if (modePage == 'history') {
                                setIsOpenHistory(true)
                                setModeOpenDocument(modePage)
                            }
                            break;
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
                    // DOCUMENT 39
                    WhichOpenDocument == 'document_39' &&
                    <FormDocument39
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        userDT={userDT}
                        maiHedDocSamKaoLasted={maiHedDocSamKaoLasted}
                    />
                }

                {
                    // DOCUMENT 4
                    WhichOpenDocument == 'document_4' &&                
                    <FormDocument41
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        refDocData={refDoc39ForDoc4}
                        userDT={userDT}
                        maiHedDocSeeLasted={maiHedDocSeeLasted}
                    />
                }
                
                {
                    // DOCUMENT 5
                    WhichOpenDocument == 'document_5' &&
                    <FormDocument5
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        refDocData={refDoc39ForDoc5}
                        userDT={userDT}
                        maiHedDocHaLasted={maiHedDocHaLasted}

                    />
                }

                {
                    // DOCUMENT 6
                    WhichOpenDocument == 'document_6' &&
                    <FormDocument6
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        dataNomPointForDoc6={dataNomPointForDoc6}
                        refDocData={refDoc39ForDoc6}
                        userDT={userDT}
                        maiHedDocHokLasted={maiHedDocHokLasted}
                    />
                }

            </div>
        </div>
    </>
    );
};

export default DocumentViewer;