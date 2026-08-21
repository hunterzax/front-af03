"use client";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import ChartWithCustomLegend from "./form/doughnut";
import TableChart from "./form/table";
import ChartArea from "./form/chartArea";
import ChartEntry from "./form/chartEntry";
import ChartExit from "./form/chartExit";
import getUserValue from "@/utils/getuserValue";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const userDT: any = getUserValue();

    // ############### SEACH ของ Table ข้าง ๆ donut chart ###############
    const [srchStartDateTable, setSrchStartDateTable] = useState<Date | null>(null);
    const [srchEndDateTable, setSrchEndDateTable] = useState<Date | null>(null);
    const [srchShipperTable, setSrchShipperTable] = useState('');
    const [isClickSearch, setIsClickSearch] = useState(false);

    const [dataDonut, setDataDonut] = useState<any>([]);

    const [contractId, setcontractId] = useState([])


    
    // console.log('dataDonut : ', dataDonut?.flatMap((fm:any) => fm?.contract_code?.map((c:any) => c?.id)));

    return (
        <div className="space-y-2">
            <div className="w-full h-[calc(100vh-160px)] flex flex-col  bg-center">
                <div className="grid grid-cols-2 gap-4 pt-1 pb-2">

                    {/* Doughnut */}
                    <div className="w-full min-h-[320px] max-h-[400px] border rounded-[6px] shadow-sm p-3">
                        <div className="w-full h-full">
                            <ChartWithCustomLegend contractId={contractId} setcontractId={setcontractId} dataDonut={dataDonut} setDataDonut={setDataDonut} setSrchStartDateTable={setSrchStartDateTable} setSrchEndDateTable={setSrchEndDateTable} setSrchShipperTable={setSrchShipperTable} setIsClickSearch={setIsClickSearch} />
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="w-full min-h-[320px] max-h-[400px] border rounded-[6px] shadow-sm p-3">
                        <div className="w-full h-full overflow-y-auto">
                            <TableChart contractId={contractId} srchStartDateTable={srchStartDateTable} srchEndDateTable={srchEndDateTable} srchShipperTable={srchShipperTable} isClickSearch={isClickSearch} />
                        </div>
                    </div>

                    {/* CHART 1 */}
                    <div className="col-span-2 w-full h-auto border rounded-[6px] shadow-sm p-2">
                        <div className="w-full h-full ">
                            {
                                <ChartArea />
                            }
                        </div>
                    </div>

                    {
                        // shipper ไม่เห็นสองอันนี้
                        userDT?.account_manage?.[0]?.user_type_id !== 3 && <>
                            {/* CHART 2 */}
                            <div className="w-full h-auto border rounded-[6px] shadow-sm p-2">
                                <div className="w-full h-full overflow-y-auto">
                                    <ChartEntry />
                                </div>
                            </div>

                            {/* CHART 3 */}
                            <div className="w-full h-auto border rounded-[6px] shadow-sm p-2">
                                <div className="w-full h-full overflow-y-auto">
                                    <ChartExit />
                                </div>
                            </div>
                        </>
                    }
                </div>
            </div>
        </div>

    );
};

export default ClientPage;