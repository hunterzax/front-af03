"use client";
import "@/app/globals.css";
import { generateUserPermission, toDayjs } from "@/utils/generalFormatter";
import { useEffect, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import dayjs from 'dayjs';
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { getService, postService } from "@/utils/postService";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    // ############### Check Authen ###############
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

    // ############### REDUX DATA ###############
    // const { termTypeMaster } = useFetchMasters();
    useEffect(() => {
        fetchData();
        getPermission();
    }, []);

    // ############# GET CLOSE BALANCE DATE  #############
    const [dataTable, setData] = useState<any>();

    const fetchData = async () => {
        try {
            const res_ = await getService(`/master/balancing/closed-balancing-report`)
            setData(res_)
        } catch (error) {

        }
    };

    // ############# MODAL RESPONSE  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');

    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [modalWarningOpen, setModalWarningOpen] = useState(false);
    const [modalWarningMsg, setModalWarningMsg] = useState('');
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)

    const handleClickCloseBalance = async () => {
        setModaConfirmSave(true);
    };

    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<any>(null);
    const [disableBtn, setDisableBtn] = useState<any>(true);

    useEffect(() => {
        if (srchStartDate) {
            setDisableBtn(false)
        } else {
            setDisableBtn(true)
        }
    }, [srchStartDate])

    const handleFormSubmit = async () => {

        // srchStartDate = "01-04-2025"
        // format it to 2025-04-01
        const formattedDate = dayjs(srchStartDate, "DD-MM-YYYY").format("YYYY-MM-DD");

        let body_post = {
            "date_balance": formattedDate // DD ต้อง 01 เท่านั้น
        }

        try {
            const res_ = await postService('/master/balancing/closed-balancing-report-setting', body_post);
            const statusCode = res_?.response?.data?.statusCode ?? res_?.response?.data?.status ?? res_?.status ?? res_?.statusCode ?? res_?.code ?? res_?.response?.status;
            const errorMsg = res_?.response?.data?.error ?? res_?.data?.error ?? res_?.response?.error ?? res_?.error;

            if (statusCode === 400 || statusCode === 500) {
                setModalErrorMsg(errorMsg || '');
                setModalErrorOpen(true)
            } else {
                setModalSuccessMsg('Balance Closing process has been executed.')
                setModalSuccessOpen(true);
            }

        } catch (error) {

        }
    }

    return (
        <div className="space-y-2">
            <div className="w-full h-[calc(100vh-160px)] pt-20 flex flex-col items-center justify-start bg-center">

                <div className="w-full flex justify-center pb-10">
                    <img
                        src={(`/assets/image/closed_bal.svg`)}
                        alt="Uploaded Preview"
                        className="w-[200px] h-auto rounded mt-2 transition-opacity duration-300"
                    />
                </div>

                <div className="grid grid-cols-[250px_250px] gap-2 pt-6 relative">
                    <div className="flex items-center justify-center col-span-2 -mt-2">
                        <MonthYearPickaSearch
                            key={"start" + key}
                            label={'Month / Year'}
                            placeHolder={'Select Closing Balance Month/Year'}
                            allowClear
                            // min={dayjs(dataTable?.date_balance).add(1, 'month').startOf('month').toDate()} // เดือนที่กด close balance ล่าสุด 
                            min={toDayjs(dataTable?.date_balance).add(1, 'month').startOf('month').toDate()} // NEW :: กรณีที่ close รอบถัดไป : เดือนที่เลือกได้จะต้องเป็นตั้งแต่เดือนถัดไปจาก ที่ close ไว้ ล่าสุด https://app.clickup.com/t/86euc9hzr
                            max={toDayjs().subtract(1, 'month').endOf('month').toDate()} // เลือกได้สูงสุดคือ เดือนปีปัจจุบัน นับจากเดือน ที่ close ล่าสุด
                            customWidth={350}
                            customHeight={44}
                            isDefaultDate={true}
                            closeBalanceDate={dataTable?.date_balance}
                            onChange={(e: any) => {
                                const formattedDate = dayjs(e).format('DD-MM-YYYY');
                                setSrchStartDate(e ? formattedDate : null);
                            }}
                        />
                    </div>

                    {/* <span className={`text-[14px] text-[#464255]`}>Choose Be Closed After 4 years (Refer to TSO code)</span> */}

                    <div className="flex items-center justify-center col-span-2 pt-3">
                        <label
                            onClick={handleClickCloseBalance}
                            className={`${disableBtn ? 'bg-[#B6B6B6] !text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#1473A1]'} ${disableBtn ? 'bg-[#B6B6B6] !text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#1473A1]'} w-[180px] ml-4 !h-[46px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[16px] `}
                        >
                            {`Close Balance`}
                        </label>
                    </div>
                </div>
            </div>

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Balance Closing process has been executed."
                description={modalModalSuccessMsg}
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    // handleRemoveFile();
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalErrorMsg}`}
                        </div>
                    </div>
                }
                stat="error"
            />

            <ModalComponent
                open={modalWarningOpen}
                handleClose={() => {
                    setModalWarningOpen(false);
                    // setModalSuccessOpen(true);
                    // if (resetForm) resetForm();
                }}
                title="Warning"
                description={
                    <div>
                        <div className="text-center">
                            {`${modalWarningMsg}`}
                        </div>
                    </div>
                }
                stat="confirm"
            />

            <ModalComponent
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        // setIsLoading(true);
                        handleFormSubmit();
                        setTimeout(async () => {
                            // await onSubmit(dataSubmit);
                            setSrchStartDate(null)
                            setKey((prevKey) => prevKey + 1);
                            fetchData();
                        }, 100);
                    }
                }}
                title="Confirm closing balance"
                description={
                    <div>
                        <div className="text-center">
                            {`Closing balance at ${srchStartDate}`}
                        </div>
                        <div className="text-center">
                            {`To proceed, click 'Yes'.`}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Yes"
                btnsplit2="No"
                stat="confirm"
            />
        </div>
    );
};

export default ClientPage;