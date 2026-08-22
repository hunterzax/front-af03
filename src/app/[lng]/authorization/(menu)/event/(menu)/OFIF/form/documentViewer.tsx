import { useEffect, useState } from "react";
import { generateUserPermission } from '@/utils/generalFormatter';
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import { SubmitHandler } from "react-hook-form";
import { getService } from "@/utils/postService";
import FormDocument7 from "./document/formDocument7";
import FormDocument8 from "./document/formDocument8";
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
    maiHedDocJedLasted?: any
};

const DocumentViewer: React.FC<FormProps> = ({ setIsOpenDocument, WhichOpenDocument, modeOpenDocument, setModeOpenDocument, dataOpenDocument, onSubmit, setIsOpenHistory, modePage, maiHedDocJedLasted }) => {

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
    const [ofoTypeData, setOfoTypeData] = useState<any>([])
    const [emailGroupForEventData, setEmailGroupForEventData] = useState<any>([])
    const [dataNomPointForDoc7, setDataNomPointForDoc7] = useState<any>([])
    const [refDataForDoc8, setRefDataForDoc8] = useState<any>([])
    const [refDoc7, setRefDoc7] = useState<any>([])

    const fetchData = async () => {

        // DATA SHIPPER 
        const res_shipper: any = await getService(`/master/event/emer/doc4/shipper`);
        setShipperData(res_shipper)

        // DATA OFO TYPE 
        const res_ofo_type: any = await getService(`/master/event/ofo/event-type`);
        setOfoTypeData(res_ofo_type)

        // DATA EMAIL GROUP FOR EVENT
        const res_email_group_for_event: any = await getService(`/master/event/emer/doc4/email-group-for-event`);
        setEmailGroupForEventData(res_email_group_for_event)

        // DATA NOM POINT FOR DOC 7
        const res_nom_point_for_doc_7: any = await getService(`/master/event/ofo/doc7/nompoint`);
        setDataNomPointForDoc7(res_nom_point_for_doc_7)

        // DATA REF FOR DOC 8
        const res_ref_for_doc_8: any = await getService(`/master/event/ofo/doc8/ref-doc-use`);
        setRefDataForDoc8(res_ref_for_doc_8)


        // DATA อ้างอิง ที่เป็น checkbox doc 7
        // master/event/ofo/doc7/ref-master
        const res_ref_doc7: any = await getService(`/master/event/ofo/doc7/ref-master`);
        setRefDoc7(res_ref_doc7)

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
                    switch (WhichOpenDocument) {
                        case 'document_7':
                            // if (modeOpenDocument == 'create') {
                            //     // ถ้าโหมด create กลับหน้า list
                            //     setIsOpenDocument(false)
                            // } else {
                            //     // ถ้าโหมดอื่น กลับหน้า history viewer
                            //     // ต้อง set ข้อมูลส่งไปที่ history viewer ด้วย
                            //     setIsOpenDocument(false)
                            //     setIsOpenHistory(true)
                            // }
                            setIsOpenDocument(false)
                            if (modePage !== 'create') {
                                setIsOpenHistory(true)
                                setModeOpenDocument(modePage)
                            }
                            break;
                        case 'document_8':
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

        {/* <div className="flex h-[calc(150vh-240px)] gap-2 pt-2 pb-2 overflow-hidden"> */}
        <div className="flex h-full gap-2 pt-2 pb-2 overflow-hidden">
            {/* Main Content */}
            <div className="w-full h-full p-8 border-[#DFE4EA] border-[1px] gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                <Spinloading spin={isLoading} rounded={5} />

                {
                    // DOCUMENT 7
                    WhichOpenDocument == 'document_7' &&
                    <FormDocument7
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        ofoTypeData={ofoTypeData}
                        emailGroupForEventData={emailGroupForEventData}
                        dataNomPointForDoc7={dataNomPointForDoc7}
                        refDocData={[]}
                        userDT={userDT}
                        refDoc7={refDoc7}
                        maiHedDocJedLasted={maiHedDocJedLasted}
                    />
                }

                {
                    // DOCUMENT 8
                    WhichOpenDocument == 'document_8' &&
                    <FormDocument8
                        mode={modeOpenDocument}
                        data={[]}
                        onSubmit={getformSubmit}
                        setIsOpenDocument={setIsOpenDocument}
                        dataOpenDocument={dataOpenDocument}
                        modeOpenDocument={modeOpenDocument}
                        shipperData={shipperData}
                        emailGroupForEventData={emailGroupForEventData}
                        refDocData={refDataForDoc8}
                        userDT={userDT}
                    />
                }

            </div>
        </div>
    </>
    );
};

export default DocumentViewer;