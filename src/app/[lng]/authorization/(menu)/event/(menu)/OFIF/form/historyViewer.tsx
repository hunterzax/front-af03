import { useEffect, useState } from "react";
import { exportToExcel } from '@/utils/generalFormatter';
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import getUserValue from "@/utils/getuserValue";
import { decryptData } from "@/utils/encryptionData";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import { SubmitHandler } from "react-hook-form";
import TableHistoryDocument1 from "./tableHistory/tableHistoryDocument1";
import TableVersion from "./tableHistory/tableVersion";
import BtnGeneral from "@/components/other/btnGeneral";
import PaginationComponent from "@/components/other/globalPagination";
import Spinloading from "@/components/other/spinLoading";

type FormProps = {
    setIsOpenHistory: any;
    WhichOpenDocument: any; // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
    modeOpenDocument: any; // mode -> 'view', 'edit'
    dataOpenDocument: any; // ข้อมูลของ doc ตอนเปิด view, edit
    onSubmit: SubmitHandler<any>;

    setWhichDocumentOpen?: any;
    setModeOpenDocument?: any;
    setIsOpenDocument?: any;
    setDataOpenDocument?: any;
    dataHistory?: any;
    setdataHistory?: any
    modePage?: any // edit, history, review
    rowselected?: any
    setrowselected?: any
};

const HistoryViewer: React.FC<FormProps> = ({
    setIsOpenHistory,
    WhichOpenDocument,
    modeOpenDocument,
    dataOpenDocument,
    onSubmit,
    setWhichDocumentOpen,
    setModeOpenDocument,
    setIsOpenDocument,
    setDataOpenDocument,
    dataHistory,
    setdataHistory,
    modePage,
    rowselected = undefined,
    setrowselected
}) => {

    const [dataTable, setDataTable] = useState<any>([])
    const [dataTableHeader, setDataTableHeader] = useState<any>([])
    const [documentNoText, setDocumentNoText] = useState('');
    const initialColumns: any = [
        { key: 'version', label: 'Version', visible: true },
        { key: 'action_date', label: 'Action Date', visible: true },
        { key: 'edited_by', label: 'Edited By', visible: true },
    ];
    const [columnVisibility, setColumnVisibility] = useState<any>(
        Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
    );

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    // ############### FETCH ###############
    // const [shipperData, setShipperData] = useState<any>([])
    // const [emailGroupForEventData, setEmailGroupForEventData] = useState<any>([])
    // const [refDoc1Data, setRefDoc1Data] = useState<any>([])
    // const [refDoc1and2Data, setRefDoc1and2Data] = useState<any>([])

    const fetchData = async () => {
        switch (WhichOpenDocument) {
            case 'document_7':
                if (modePage == 'version_edit') {
                    setDocumentNoText('แก้ไขเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)')
                } else if (modePage == 'view') {
                    setDocumentNoText('ดูเอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)')
                } else if (modePage == 'history') {
                    setDocumentNoText('เอกสารคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 7)')
                }
                break;
            case 'document_8':
                if (modePage == 'version_edit') {
                    setDocumentNoText('แก้ไขเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)')
                } else if (modePage == 'view') {
                    setDocumentNoText('ดูเอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)')
                } else if (modePage == 'history') {
                    setDocumentNoText('เอกสารแจ้งสิ้นสุดคำสั่งเพิ่ม/ลดปริมาณก๊าซ (Doc 8)')
                }
                break;
        }
    }

    useEffect(() => {
        fetchData()
        setDataTable(dataOpenDocument)

        let data_header: any;
        switch (WhichOpenDocument) {
            case 'document_7':
                data_header = rowselected?.event_nember
                break;
            case 'document_8':
                data_header = rowselected?.event_nember
                break;
        }
        setDataTableHeader((pre: any) => data_header)

    }, [dataOpenDocument, modeOpenDocument])

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
        if (dataTable && dataTable?.length > 0) {
            setPaginatedData(dataTable?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage))
        }
        setTimeout(() => {
            setisLoading(false)
        }, 300);
    }, [dataTable, currentPage, itemsPerPage])

    useEffect(() => {
        if (!dataTable || dataTable?.length == 0) {
            setisLoading(true)
            setDataTable(dataHistory);
        }
    }, [dataHistory])

    const [isLoading, setisLoading] = useState<boolean>(true);

    return (<>
        <div className="text-[#464255] px-4 text-[14px] font-bold pt-4">
            <div className="cursor-pointer"
                onClick={() => {
                    setIsOpenHistory(false)
                    setdataHistory([])
                    setrowselected(undefined)
                }}
            >
                <ArrowBackIos style={{ fontSize: "14px" }} /> {` Back`}
            </div>
        </div>

        <div className="h-full gap-2 pt-2 pb-2 overflow-hidden">
            {/* Main Content */}
            <div className="w-full h-full p-8 border-[#DFE4EA] border-[1px] gap-2 rounded-xl shadow-sm flex flex-col overflow-hidden">

                <div className="flex justify-between items-center w-full mb-5">
                    <div className="flex flex-col">
                        {
                            modePage == 'history' && (
                                <div>
                                    <div className="text-[22px] text-[#58585A] font-semibold">
                                        {`History Event Code : ${dataTableHeader || ''}`}
                                    </div>
                                    <div className="text-[16px] text-[#58585A] font-semibold">
                                        {documentNoText}
                                    </div>
                                </div>
                            )
                        }

                        {
                            (modePage == 'version_edit' || modePage == 'view') && <div className="text-[22px] text-[#58585A] font-semibold">
                                {documentNoText}
                            </div>
                        }

                    </div>

                    {modePage == 'history' && (
                        <BtnGeneral
                            bgcolor={"#24AB6A"}
                            modeIcon={'export'}
                            disable={dataTable?.length > 0 ? false : true}
                            textRender={"Export"}
                            generalFunc={() =>
                                exportToExcel(dataTable, 'history-event-of-if', columnVisibility)
                            }
                            can_export={true}
                        />
                    )}
                </div>

                <div className="w-full h-auto relative">
                    <Spinloading spin={isLoading} rounded={5} />
                    {
                        // DOCUMENT 7
                        WhichOpenDocument == 'document_7' && <TableVersion
                            tableData={paginatedData}
                            dataTableHeader={dataTableHeader}
                            WhichOpenDocument={WhichOpenDocument}
                            modeOpenDocument={modeOpenDocument}

                            setWhichDocumentOpen={setWhichDocumentOpen} // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
                            setModeOpenDocument={setModeOpenDocument}  // mode -> 'view', 'edit'
                            setIsOpenDocument={setIsOpenDocument}  // set เปิด-ปิด
                            setDataOpenDocument={setDataOpenDocument}  // ข้อมูลของ doc ตอนเปิด view, edit

                            setIsOpenHistory={setIsOpenHistory}
                            userDT={userDT}
                        />
                    }

                    {
                        // DOCUMENT 8
                        WhichOpenDocument == 'document_8' && <TableHistoryDocument1
                            tableData={paginatedData}
                            WhichOpenDocument={WhichOpenDocument}
                            modeOpenDocument={modeOpenDocument}

                            setWhichDocumentOpen={setWhichDocumentOpen} // เปิดเอกสารเบอร์ไหน -> 'document_1', 'document_2', 'document_3'
                            setModeOpenDocument={setModeOpenDocument}  // mode -> 'view', 'edit'
                            setIsOpenDocument={setIsOpenDocument}  // set เปิด-ปิด
                            setDataOpenDocument={setDataOpenDocument}  // ข้อมูลของ doc ตอนเปิด view, edit
                            setIsOpenHistory={setIsOpenHistory}
                        />
                    }
                </div>

            </div>

            <PaginationComponent
                totalItems={dataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            />
        </div>
    </>
    );
};

export default HistoryViewer;