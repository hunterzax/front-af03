"use client";
import "@/app/globals.css";
import { useForm } from "react-hook-form";
import { MenuItem, Select, Typography } from "@mui/material";
import DatePickaForm from "@/components/library/dateRang/dateSelectForm";
import { calDatePeriod, findRoleConfigByMenuName, formatFormDateForBulletin, generateUserPermission, toDayjs } from "@/utils/generalFormatter";
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { downloadService, getService, uploadFileServiceWithAuth } from "@/utils/postService";
import { useEffect, useRef, useState } from "react";
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import { NumericFormat } from "react-number-format";
import { useFetchMasters } from "@/hook/fetchMaster";
import { addDays, parse } from "date-fns";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModalComponent from "@/components/other/ResponseModal";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import Spinloading from "@/components/other/spinLoading";
import { decryptData } from "@/utils/encryptionData";
import getUserValue from "@/utils/getuserValue";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import { toast } from "react-toastify";


dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Bangkok");

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    const { register, setValue, setError, reset, resetField, formState: { errors }, watch, clearErrors } = useForm<any>();
    const inputClass = "text-[16px] block md:w-full p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-[16px] block outline-none"
    const labelClass = "block mb-2 text-[16px] font-light text-[#58585A]"
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    const [modalComfirn, setModalComfirn] = useState(false)
    const [msgConfirm, setMsgConfirm] = useState("")


    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    // let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            // if (user_permission?.role_config) {
            //     const updatedUserPermission = generateUserPermission(user_permission);
            //     setUserPermission(updatedUserPermission);
            // } else {
            //     const permission = findRoleConfigByMenuName('Bulletin Board', userDT)
            //     setUserPermission(permission);
            // }

            const permission = findRoleConfigByMenuName('Bulletin Board', userDT)
            if (permission) {
                setUserPermission(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### REDUX DATA ###############
    const { termTypeMaster } = useFetchMasters();

    // ############### TERM IN EACH TYPE ###############
    const currentDate = new Date();

    const [termMaster, setTermMaster] = useState<any>();
    const [termTypeMasterData, setTermTypeMasterData] = useState<any>();
    const [selectedTermMaster, setSelectedTermMaster] = useState<any>();
    const [selectedBookingTemple, setSelectedBookingTemple] = useState<any>();
    const [formattedStartDate, setFormattedStartDate] = useState<any>(currentDate);

    const filterTermsByDateRange = (terms: any) => {
        // const today = new Date();
        // // Filter terms that are within the date range
        // const validTerms = terms.filter((term: any) =>
        //     new Date(term.start_date) <= today &&
        //     today <= new Date(term.end_date)
        // );
        // // ถ้า valid term ไม่ครบ ให้ไปดูใน DAM > Parameter > Booking Template ว่า end date หมดอายุหรือยัง
        // // Group terms by term_type_id
        // const groupedByType = validTerms.reduce((acc: any, term: any) => {
        //     const typeId = term.term_type_id;
        //     if (!acc[typeId]) {
        //         acc[typeId] = [];
        //     }
        //     acc[typeId].push(term);
        //     return acc;
        // }, {});
        // return groupedByType;

        // NO DATE FILTER
        const groupedByType = terms.reduce((acc: any, term: any) => {
            const typeId = term.term_type_id;
            if (!acc[typeId]) {
                acc[typeId] = [];
            }
            acc[typeId].push(term);
            return acc;
        }, {});

        return groupedByType;
    };

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/parameter/booking-template`);

            const currentDate = new Date();
            const filteredTerms = response.filter((item: any) => new Date(item.end_date) > currentDate);
            // let kk = filterTermsByDateRange(filteredTerms)
            let kk = filterTermsByDateRange(response)

            const validTermTypeIds = new Set(
                Object.values(kk).flatMap((terms: any) =>
                    terms.map((term: any) => term.term_type.id)
                )
            );

            // Filter termTypeMas to include only matching ids
            const filteredTermTypeMas = termTypeMaster?.data?.filter((termType: any) =>
                validTermTypeIds.has(termType.id)
            );
            setTermTypeMasterData(filteredTermTypeMas)
            // setTermMaster(filterTermsByDateRange(filteredTerms))

            setTermMaster(filterTermsByDateRange(response)) // ของแท้
            // setTermMaster([
            //     {
            //         "id": 38,
            //         "file_period": null,
            //         "file_period_mode": 3,
            //         "file_start_date_mode": 1,
            //         "fixdayday": null,
            //         "todayday": null,
            //         "start_date": "2024-07-31T17:00:00.000Z",
            //         "end_date": "2030-08-09T17:00:00.000Z",
            //         "create_date": "2025-08-26T06:35:15.355Z",
            //         "update_date": null,
            //         "create_date_num": 1756190115,
            //         "update_date_num": null,
            //         "create_by": 99990,
            //         "update_by": null,
            //         "active": null,
            //         "term_type_id": 1,
            //         "shadow_time": 24,
            //         "shadow_period": null,
            //         "min": 5,
            //         "max": 10,
            //         "term_type": {
            //             "id": 1,
            //             "name": "Long Term",
            //             "color": "#FFDDCE"
            //         },
            //         "create_by_account": {
            //             "id": 99990,
            //             "email": "devk@gmail.com",
            //             "first_name": "Devk",
            //             "last_name": "Undefined"
            //         },
            //         "update_by_account": null
            //     }
            // ]) // เอาไว้แก้บัค


            // setData(response);
            // setFilteredDataTable(response);
            // setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        getPermission();
    }, []);

    useEffect(() => {
        const targetConfig = selectedTermMaster?.find((item: any) => {
            if (item?.start_date) {
                const today = dayjs().startOf('day');
                const startDate = toDayjs(item.start_date).startOf('day');

                if (startDate.isSameOrBefore(today)) {
                    if (item?.end_date) {
                        const endDate = toDayjs(item.end_date).startOf('day');
                        return endDate.isAfter(today);
                    } else {
                        return true;
                    }
                }
            }
        });

        setSelectedBookingTemple(targetConfig)
        let todayplus = 1
        if ((Number(targetConfig?.file_start_date_mode) === 3) && targetConfig?.todayday) {
            try {
                const todayday = Number(targetConfig?.todayday)
                if (Number.isNaN(todayday)) {
                    todayplus = 1
                }
                else {
                    todayplus = todayday
                }
            } catch (error) {
                todayplus = 1
            }
        }
        const newMin = addDays(new Date(), todayplus)
        setStartDateMin(newMin)
        conditionDatePicker(dayjs(newMin.toISOString()).format("DD/MM/YYYY"))
        resetField('start_date');
        resetField('end_date');
        resetField('contract_code_prefix');
        resetField('contract_code');
    }, [selectedTermMaster]);

    const handleFormSubmit = async (data: any) => {
        setTimeout(() => { handleRemoveFile() }, 100);
    }

    // ############# MODAL RESPONSE  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [modalSuccessMsg, setModalSuccessMsg] = useState('');

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [requireText, setRequireText] = useState('Required : .xls, .xlsx');


    const allowedExt = ["xls", "xlsx"];
    const allowedMime = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    function isExcel(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const okExt = !!ext && allowedExt.includes(ext);

    // บาง browser ให้ file.type ว่าง → เลยยอมผ่านถ้า ext ถูก
    const okMime = file.type ? allowedMime.includes(file.type) : true;

    return okExt && okMime;
    }


    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        

        // ปิดไปเพราะข้อนี้ --> https://app.clickup.com/t/86euzxxfq
        //   if (!isExcel(file)) {
        //     toast.info(`กรุณาเลือกไฟล์ Excel (.xls / .xlsx) เท่านั้น`, {
        //                 position: 'bottom-right',
        //                 autoClose: 3000,
        //             });
        //     e.target.value = ""; // ✅ reset เพื่อกันส่งค่าผิด
        //     return;
        // }
        setIsLoading(true);
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setError("upload_tranform", {
                    type: "manual",
                    message: "Invalid file type. Please upload a Excel file.",
                });
                setIsLoading(false);
                return;
            }

            if (file.size > maxSizeInBytes) {
                setError("upload_tranform", {
                    type: "manual",
                    message: "The file is larger than 10 MB.",
                });
                setIsLoading(false);
                return;
            }

            if (errors?.upload_tranform) {
                clearErrors('upload_tranform')
            }
            setFileName(file?.name);
            setFileUpload(file);
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleClickUpload = async () => {
        setIsLoading(true);
        if (fileUpload) {
            try {
                // 
                const response: any = await uploadFileServiceWithAuth('/master/capacity/path-capacity-request-management/upload-tranform-check', fileUpload)
                const status = response?.response?.status ?? response?.status ?? response?.response?.data?.status;
                const code = response?.code;

                if (status === 400) {
                    setModalErrorMsg(response?.response?.data?.error);
                    setModalErrorOpen(true)
                } else if (response?.status === 504 || status === 504) {
                    // 504 Gateway Timeout หรือ client timeout
                    setModalErrorMsg('This is taking longer than expected. The process is still in progress.');
                    setModalErrorOpen(true);
                } else if (status === 500 || code === "ERR_BAD_RESPONSE" || code === "ERR_NETWORK") {
                    setModalErrorMsg('Invalid template format. Please use the correct system-generated template.');
                    setModalErrorOpen(true)
                } else {

                    if(response?.data?.message === "Amd"){
                        setMsgConfirm(`${response?.data?.contractCode} already exists, please confirm to continue Amend.`)
                        setModalComfirn(true)
                    }else if(response?.data?.message === "Version"){
                        setMsgConfirm(`${response?.data?.contractCode} already exists, please confirm to continue New Version.`)
                        setModalComfirn(true)
                    }else if(response?.data?.message === "Create"){
                        await handleClickUploadUse()
                    }
                }

            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 100);
    };

    const handleClickUploadUse = async () => {
        setIsLoading(true);
        if (fileUpload) {
            try {
                // 
                const response: any = await uploadFileServiceWithAuth('/master/capacity/path-capacity-request-management/upload-tranform', fileUpload)

                const status = response?.response?.status ?? response?.status ?? response?.response?.data?.status;
                const code = response?.code;

                if (status === 400) {
                    setModalErrorMsg(response?.response?.data?.error);
                    setModalErrorOpen(true)
                } else if (response?.status === 504) {
                    // 504 Gateway Timeout หรือ client timeout
                    setModalErrorMsg('This is taking longer than expected. The process is still in progress.');
                    setModalErrorOpen(true);
                } else if (status === 500 || code === "ERR_BAD_RESPONSE" || code === "ERR_NETWORK") {
                    setModalErrorMsg('Invalid template format. Please use the correct system-generated template.');
                    setModalErrorOpen(true)
                } else {
                    if (response?.response?.type) {
                        setModalSuccessMsg(response?.response?.type == 1 ? 'Your file has been uploaded.' : 'Zone, Area or Contract point is NOT match.')
                    } else {
                        setModalSuccessMsg('File has been uploaded.')
                    }
                    setModalSuccessOpen(true);
                }


            } catch (error) {
                // File upload failed:
            }
        } else {
            setFileName('No file chosen');
        }
        setTimeout(() => {
            setIsLoading(false);
        }, 100);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('upload_tranform', null);
    };

    // ############### POPUP ###############
    const popupRef = useRef<HTMLDivElement>(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);

    const handleClickOutside = (event: any) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            setIsPopupVisible(false);
            setValue("period_number", null);
        }
    };

    useEffect(() => {
        if (isPopupVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isPopupVisible]);

    const togglePopup = () => {
        setIsPopupVisible(!isPopupVisible);
    };

    const [selectedButton, setSelectedButton] = useState('year'); // year

    const handleButtonClick = (buttonType: any) => {
        setSelectedButton(buttonType);
    };

    const handleButtonDownload = async () => {
        const res: any = await downloadService(`/master/bulletin-board?startDate=${watch("start_date")}&endDateDate=${watch("end_date")}&ContractCode=${watch("contract_code")}&type=${watch("type")}`, watch("type"));
        if (res?.status === 400) {
            setModalErrorMsg(res?.error);
            setModalErrorOpen(true)
        }
    };

    const findStartOrEnd = () => {
        let date = watch("start_date") ? watch("start_date") : watch("end_date")
        let mode = watch("start_date") ? 'start_date' : 'end_date'

        let calculatedDate: any = calDatePeriod(date, watch("period_number"), selectedButton, mode, selectedTermMaster)

        // mode == 'start_date' ตำนวนหา end_date
        // สำหรับหา start_date
        if (mode == 'start_date') {

            // เอา calculatedDate มาคำนวนหาวันที่ใกล้ที่สุด
            // 1 = long term
            // 2 = medium term
            // 3 = short term
            // 4 = short term (non-firm)

            // 2025-02-21 เปลี่ยนจากอ่านจาก type ไปอ่านจาก 
            if (watch('type') == 1 || watch('type') == 2) {
                // ---------------- ของเดิม หาวันต้นเดือน ----------------
                // ถ้าเป็น medium, long term ปัด end_date ไปวันที่เริ่มต้นเดือน
                let [day, month, year]: any = calculatedDate.split('/');
                let date = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript

                // Find the first day of the month
                let startOfMonth = `01/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

                // Set the value to the start of the month
                setValue("end_date", startOfMonth);

            } else if (watch('type') == 3) {
                // ถ้าเป็น short term - 1 วัน แล้วใช้วันนั้นเลย
                let [startDay, startMonth, startYear] = watch('start_date').split('/');
                let startDateObj = new Date(startYear, startMonth - 1, startDay); // Month is 0-indexed in JavaScript

                // Parse calculatedDate into a Date object
                let [calculatedDay, calculatedMonth, calculatedYear] = calculatedDate.split('/');
                let calculatedDateObj = new Date(calculatedYear, calculatedMonth - 1, calculatedDay); // Month is 0-indexed in JavaScript

                // Calculate the 90th day from the start_date
                let ninetyDaysLater = new Date(startDateObj);
                ninetyDaysLater.setDate(startDateObj.getDate() + 90); // Add 90 days to startDateObj

                // Format the adjusted date back to DD/MM/YYYY
                let adjustedDate = `${calculatedDateObj.getDate().toString().padStart(2, '0')}/${(calculatedDateObj.getMonth() + 1).toString().padStart(2, '0')}/${calculatedDateObj.getFullYear()}`;

                // Set the adjusted date as the start date
                setValue("end_date", adjustedDate);
            } else {
                // case short non firm 
                // setValue("end_date", subtractDateByOneDay(calculatedDate))

                // Parse start_date into a Date object
                let [startDay, startMonth, startYear] = watch('start_date').split('/');
                let startDateObj = new Date(startYear, startMonth - 1, startDay); // Month is 0-indexed in JavaScript

                // Parse calculatedDate into a Date object
                let [calculatedDay, calculatedMonth, calculatedYear] = calculatedDate.split('/');
                let calculatedDateObj = new Date(calculatedYear, calculatedMonth - 1, calculatedDay); // Month is 0-indexed in JavaScript

                // Calculate the 90th day from the start_date
                let ninetyDaysLater = new Date(startDateObj);
                ninetyDaysLater.setDate(startDateObj.getDate() + 90); // Add 90 days to startDateObj

                // Format the adjusted date back to DD/MM/YYYY
                let adjustedDate = `${calculatedDateObj.getDate().toString().padStart(2, '0')}/${(calculatedDateObj.getMonth() + 1).toString().padStart(2, '0')}/${calculatedDateObj.getFullYear()}`;

                // Set the adjusted date as the start date
                setValue("end_date", adjustedDate);
            }
        } else {
            // ################ mode == 'end_date' ตำนวนหา start_date ################

            if (watch('type') == 1 || watch('type') == 2) {
                // ถ้าเป็น medium, long term ปัด start_date ไปวันที่ 1

                // เพิ่มเงื่อนไข if present month and day > firstOfMonth then make firstOfMonth 1st day of present month
                // ตอนกดคำนวนจาก end_date จะได้ไม่ไปตกวันก่อนปัจจุบัน
                // Split the calculated date into day, month, and year
                let [day, month, year] = calculatedDate.split('/');
                let date = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript

                // Find the first day of the month
                let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
                let today = new Date();

                // Check if today's date is past the 1st of the current month
                if (today > firstDay) {
                    // Set `firstDay` to the 1st day of the next month
                    if (today.getMonth() === 11) {
                        // If it's December, move to January of the next year
                        firstDay = new Date(today.getFullYear() + 1, 0, 1);
                    } else {
                        // Otherwise, move to the next month
                        firstDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
                    }
                }

                // Format the first day of the month as DD/MM/YYYY
                let firstOfMonth = `${firstDay.getDate().toString().padStart(2, '0')}/${(firstDay.getMonth() + 1).toString().padStart(2, '0')}/${firstDay.getFullYear()}`;

                setValue("start_date", firstOfMonth)
            } else if (watch('type') == 3) {

                // ถ้าเป็น short term - 1 วัน แล้วใช้วันนั้นเลย
                // setValue("start_date", subtractDateByOneDay(calculatedDate))

                // ถ้าคำนวนมาแล้ววันที่ < today ก็ให้ใส่เป็น today
                // Parse calculatedDate into a Date object
                let [day, month, year] = calculatedDate.split('/');
                let calculatedDateObj = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript

                // Get today's date
                let today = new Date();
                today.setHours(0, 0, 0, 0); // Ensure we only compare dates, not time
                let tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                // If calculatedDate is less than today, set it to today's date
                if (tomorrow > calculatedDateObj) {
                    calculatedDateObj = tomorrow;
                }
                calculatedDateObj.setDate(calculatedDateObj.getDate());
                // Format the adjusted date back to DD/MM/YYYY
                let adjustedDate = `${calculatedDateObj.getDate().toString().padStart(2, '0')}/${(calculatedDateObj.getMonth() + 1).toString().padStart(2, '0')}/${calculatedDateObj.getFullYear()}`;

                // Set the adjusted date as the start date
                setValue("start_date", adjustedDate);
            } else {
                // case short non firm 
                // setValue("start_date", subtractDateByOneDay(calculatedDate))

                // ถ้าคำนวนมาแล้ววันที่ < today ก็ให้ใส่เป็น today
                // Parse calculatedDate into a Date object
                let [day, month, year] = calculatedDate.split('/');
                let calculatedDateObj = new Date(year, month - 1, day); // Month is 0-indexed in JavaScript

                // Get today's date
                let today = new Date();
                today.setHours(0, 0, 0, 0); // Ensure we only compare dates, not time
                let tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1);

                // If calculatedDate is less than today, set it to today's date
                if (tomorrow > calculatedDateObj) {
                    calculatedDateObj = tomorrow;
                }
                calculatedDateObj.setDate(calculatedDateObj.getDate());
                // Format the adjusted date back to DD/MM/YYYY
                let adjustedDate = `${calculatedDateObj.getDate().toString().padStart(2, '0')}/${(calculatedDateObj.getMonth() + 1).toString().padStart(2, '0')}/${calculatedDateObj.getFullYear()}`;

                // Set the adjusted date as the start date
                setValue("start_date", adjustedDate);
            }
        }
    }

    const [startDateMin, setStartDateMin] = useState<any>(addDays(new Date(), 1));
    const [endDateMax, setEndDateMax] = useState<any>(undefined);
    const [endDateMin, setEndDateMin] = useState<any>(undefined);

    const conditionDatePicker = (start_date: any) => {

        // 1 = long term
        // 2 = medium term
        // 3 = short term
        // 4 = short term (non-firm)

        // ############### CONDITION ###############
        // 1. Start date ต้องมากกว่าวันปัจจุบันเท่านั้น - done
        // 2. ช่วงเวลาระหว่าง Start date และ end date ต้องอยู่ในช่วง min - max จาก DAM => Booking template ตาม Term ที่เลือก
        // Short term(ทั้งแบบ firm และ none-firm) เวลาที่ Start date และ End date อยู่กันคนละเดือน ตอน validate min - max อย่าลืมนับวันแรกนะ 
        // เช่น max ไว้ 1 เดือน และ Start date เป็นวันที่ 5 เดือน 3 ดังนั้น End date ต้องไม่เกินวันที่ 4 เดือน 4 เท่านั้น
        // เผื่อไม่เห็นภาพ 1 เดือนของธันวาคมคือ 1-31 ธันวาคม ไม่ใช่ข้ามไป 1 มกราคมปีหน้า - done
        // 3. Long term และ medium term เมื่อเลือกแล้ว Start date ต้องเป็นวันที่ 1 ของทุกเดือน และ End date  ต้องเป็นวันสุดท้ายของเดือนเสมอ - done
        // 4. ทำให้ปุ่มคำนวณวันที่รองรับเงื่อนไขที่ 2 กับ 3 ด้วย
        // 5. ตอน upload จำกัดขนาดของไฟล์ไว้ที่ 10 MB

        // {
        //     "term_type_id": 1,
        //     "file_period_mode": 2,  // 1 = วัน, 2 = เดือน, 3 = ปี
        //     "file_start_date_mode": 2, // 1 = every day, 2 = fix day, 3 = to day+
        //     "fixdayday": 10,
        //     "todayday": null,
        //     "start_date": "2024-10-01 00:00:00",
        //     "end_date": "2025-10-10 00:00:00",
        //     "shadow_time": 3,
        //     "shadow_period": 5,
        //     "min": 1,
        //     "max": 3
        // }

        // const startDate = new Date(start_date);

        // let endDate = calMaxEndDate(start_date); // เดิมโรงงาน
        // const min = calMinEndDate(start_date); // เดิมโรงงาน

        // V.2.0.109 กรณีเลือก Start Date แล้วมาเลือก End Date พบว่าเมื่อเลือก End Date แล้วระบบไม่อนุญาตให้เลือก Date ที่น้อยกว่า End Date ที่เลือกไว้ได้ (ที่ถูกต้อง ต้องให้ยังเลือกได้อยู่ ดักแค่ห้ามเลือกเกิน Start Date ก็พอ) https://app.clickup.com/t/86euzxxfr
        let endDate = calMaxEndDate(watch('start_date') || start_date);
        const min = calMinEndDate(watch('start_date') || start_date);
        setEndDateMax(endDate)
        setEndDateMin(min)
    }

    const calMaxEndDate = (start_date: any) => {

        // start_date is 06/12/2024
        // const startDate = new Date(start_date);
        // when I format into new Date(start_date)
        // It's turn out Wed Jun 12 2024 00:00:00 GMT+0700 (Indochina Time)

        // const startDate = new Date(start_date);
        const startDate = parse(start_date, 'dd/MM/yyyy', new Date());
        let endDate;

        // 1 = วัน, 2 = เดือน, 3 = ปี
        switch (selectedBookingTemple?.file_period_mode) {
            case 1: // 1 = วัน,
                // Calculate end_date based on start_date + 3 days
                // add condition if selectedTermMaster[0]?.term_type_id == 1 or 2 then set end_date as the end of that month
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + selectedBookingTemple?.max);
                break;
            case 2: // 2 = เดือน,
                // Calculate end_date based on start_date + 3 months
                endDate = new Date(startDate);
                endDate.setMonth(startDate.getMonth() + selectedBookingTemple?.max);
                break;
            case 3: // 3 = ปี,
                // Calculate end_date based on start_date + 3 years
                endDate = new Date(startDate);
                endDate.setFullYear(startDate.getFullYear() + selectedBookingTemple?.max);
                break;
        }
        return endDate
    }

    const calMinEndDate = (start_date: any) => {
        const startDate = parse(start_date, 'dd/MM/yyyy', new Date());
        let endDate: Date | undefined;

        // Add one day to formattedStartDate
        const minDate = new Date(startDate);
        minDate.setDate(minDate.getDate() + 1); // Adds one day

        // 1 = วัน, 2 = เดือน, 3 = ปี
        switch (selectedBookingTemple?.file_period_mode) {
            case 1: // 1 = วัน,
                // Calculate end_date based on start_date + 3 days
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + selectedBookingTemple?.min);
                break;
            case 2: // 2 = เดือน,
                // Calculate end_date based on start_date + 3 months
                endDate = new Date(startDate);
                endDate.setMonth(startDate.getMonth() + selectedBookingTemple?.min);
                break;
            case 3: // 3 = ปี,
                // Calculate end_date based on start_date + 3 years
                endDate = new Date(startDate);
                endDate.setFullYear(startDate.getFullYear() + selectedBookingTemple?.min);
                break;
        }
        return endDate && endDate >= minDate ? endDate : minDate
    }

    useEffect(() => {
        if(selectedTermMaster && (Array.isArray(selectedTermMaster) ? selectedTermMaster.length > 0 : true) && watch("start_date")) {
            let termPrefix = "";
            const startDate = parse(watch("start_date"), 'dd/MM/yyyy', new Date());


            getService(`/master/capacity/lastest-code-by-year?year=${startDate.getFullYear()}`).then(response => {
                if(!watch("contract_code_code")){
                    if(response?.nextCode){
                        setValue("contract_code_code", response?.nextCode);
                    }
                    else{
                        setValue("contract_code_code", "001");
                    }
                }
            });

            
            if(Array.isArray(selectedTermMaster)) {
                selectedTermMaster.some((item: any) => {
                    if(item.term_type?.name?.toUpperCase()?.includes("LONG")) {
                        termPrefix = "CLF";
                        return true;
                    }else if(item.term_type?.name?.toUpperCase()?.includes("MEDIUM")) {
                        termPrefix = "CMF";
                        return true;
                    } else if(item.term_type?.name?.toUpperCase()?.includes("NON")) {
                        termPrefix = "CNF";
                        return true;
                    } else if(item.term_type?.name?.toUpperCase()?.includes("SHORT")) {
                        termPrefix = "CSF";
                        return true;
                    }
                })
            } else {
                termPrefix = selectedTermMaster.term_type?.name?.toUpperCase()?.includes("LONG") ?
                "CLF"
                : selectedTermMaster.term_type?.name?.toUpperCase()?.includes("MEDIUM") ?
                "CMF"
                : selectedTermMaster.term_type?.name?.toUpperCase()?.includes("NON") ?
                "CNF"
                : selectedTermMaster.term_type?.name?.toUpperCase()?.includes("SHORT") ?
                "CSF"
                : "";
            }
            
            if(termPrefix){
                setValue("contract_code_prefix", `${startDate.getFullYear()}-${termPrefix}-`);
            }
        }
        else{
            resetField('contract_code_prefix');
            resetField('contract_code');
        }
    }, [selectedTermMaster, watch("start_date")])

    useEffect(() => {
        if(watch("contract_code_code")) {
            setValue("contract_code", `${watch("contract_code_prefix")}${watch("contract_code_code")}`);
        }
    }, [watch("contract_code_prefix"), watch("contract_code_code")])

    const {
        onChange: contractCodeCodeOnChange,
        ...contractCodeCodeRegister
    } = register('contract_code_code', {
        maxLength: { value: 3, message: 'สูงสุด 3 หลัก' },
        pattern: { value: /^\d*$/, message: 'กรอกได้เฉพาะตัวเลข 0-9' },
    })

    return (
        <div className="space-y-2">
            <div className="w-full h-[calc(100vh-160px)] flex flex-col items-center justify-start bg-center">
                <div className="text-[#58585A] font-semibold text-[18px] p-6">
                    {`Select Term and Period`}
                </div>

                <div className="w-full flex justify-center">
                    <img
                        src={(`/assets/image/bulletin_board_img_01.png`)}
                        alt="Uploaded Preview"
                        className="w-[300px] h-auto rounded mt-2 transition-opacity duration-300"
                    />
                </div>

                <form onSubmit={handleFormSubmit} className="bg-white p-2 max-w">

                    <div className="grid grid-cols-[220px_220px] gap-2 pt-1 relative">
                        <Spinloading spin={isLoading} rounded={20} />

                        <div className="col-span-2">
                            <label htmlFor="type" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                <span className="text-red-500">*</span>
                                {`Type`}
                            </label>
                            <Select
                                id="type"
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                {...register("type", { required: false })}
                                // disabled={isReadOnly}
                                value={watch("type") || ""}
                                className={`${selectboxClass} ${errors.type && "border-red-500"}`}
                                sx={{
                                    '.MuiOutlinedInput-notchedOutline': {
                                        // borderColor: '#DFE4EA', // Change the border color here
                                        borderColor: errors.type && !watch('type') ? '#FF0000' : '#DFE4EA',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: errors.type && !watch("type") ? "#FF0000" : "#d2d4d8",
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#d2d4d8',
                                    },
                                }}
                                onChange={(e) => {

                                    setSelectedTermMaster(termMaster[e.target.value]) // ของจริง
                                    // setSelectedTermMaster([{
                                    //     "id": 38,
                                    //     "file_period": null,
                                    //     "file_period_mode": 3,
                                    //     "file_start_date_mode": 1,
                                    //     "fixdayday": null,
                                    //     "todayday": null,
                                    //     "start_date": "2024-07-31T17:00:00.000Z",
                                    //     "end_date": "2030-08-09T17:00:00.000Z",
                                    //     "create_date": "2025-08-26T06:35:15.355Z",
                                    //     "update_date": null,
                                    //     "create_date_num": 1756190115,
                                    //     "update_date_num": null,
                                    //     "create_by": 99990,
                                    //     "update_by": null,
                                    //     "active": null,
                                    //     "term_type_id": 1,
                                    //     "shadow_time": 24,
                                    //     "shadow_period": null,
                                    //     "min": 5,
                                    //     "max": 10,
                                    //     "term_type": {
                                    //         "id": 1,
                                    //         "name": "Long Term",
                                    //         "color": "#FFDDCE"
                                    //     },
                                    //     "create_by_account": {
                                    //         "id": 99990,
                                    //         "email": "devk@gmail.com",
                                    //         "first_name": "Devk",
                                    //         "last_name": "Undefined"
                                    //     },
                                    //     "update_by_account": null
                                    // }]) // เอาไว้แก้บัค

                                    setValue("type", e.target.value);
                                }}
                                displayEmpty
                                renderValue={(value: any) => {
                                    if (!value) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Type</Typography>;
                                    }
                                    return termTypeMasterData?.find((item: any) => item.id === value)?.name || '';
                                    // return termTypeMaster?.data?.find((item: any) => item.id === value)?.name || '';
                                }}
                            >
                                {termTypeMasterData?.map((item: any) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div className="col-span-2">
                            <div className="flex gap-4">

                                <div className="w-full flex flex-col">
                                    <label className={labelClass}>
                                        <span className="text-red-500">*</span>
                                        {`Start Date`}
                                    </label>

                                    <DatePickaForm
                                        {...register('start_date', { required: "Select start date" })}
                                        readOnly={false}
                                        placeHolder="Select Start Date"
                                        mode={'edit-bulletin'}
                                        valueShow={watch("start_date")}
                                        min={startDateMin}
                                        allowClear
                                        onChange={(e: any) => {

                                            if (e !== undefined) {
                                                setFormattedStartDate(e)
                                            } else {
                                                setFormattedStartDate(currentDate)
                                            }
                                            const startDateString = formatFormDateForBulletin(e)
                                            const newStartDate = parse(startDateString, 'dd/MM/yyyy', new Date())
                                            const currentEndDate = parse(watch("end_date") || startDateString, 'dd/MM/yyyy', new Date())
                                            setValue('start_date', startDateString);
                                            conditionDatePicker(startDateString);
                                            if (newStartDate > currentEndDate) {
                                                resetField('end_date');
                                            }
                                            e === undefined &&
                                                setValue('start_date', null, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                        }}
                                        isStartDate={true}
                                        termCondition={selectedTermMaster !== undefined ? selectedTermMaster[0]?.term_type_id : null}
                                        bookingTemple={selectedBookingTemple}
                                        termMaxDate={selectedTermMaster !== undefined ? endDateMax : undefined}

                                    // termMinDate={selectedTermMaster !== undefined ? selectedTermMaster[0]?.min : undefined}
                                    />

                                    {/* <DatePickaForm
                                        {...register('gas_day')}
                                        readOnly={false}
                                        placeHolder="Select Gas Day"
                                        mode={'create'}
                                        valueShow={watch("gas_day") && dayjs(watch("gas_day")).format("DD/MM/YYYY")}
                                        // min={formattedStartDate || undefined}
                                        min={new Date()}
                                        // maxNormalForm={watch('end_date') && watch('end_date')} // ไม่ให้ gas_day เกิน end_date
                                        allowClear
                                        isError={errors.gas_day && !watch("gas_day") ? true : false}
                                        onChange={(e: any) => { setValue('gas_day', formatFormDate(e)), e == undefined && setValue('gas_day', null, { shouldValidate: true, shouldDirty: true }); }}
                                    /> */}
                                </div>

                                <div className="w-[100px] items-center flex flex-col relative">
                                    <label className={labelClass}>{`Period`}</label>
                                    <div
                                        className={`flex w-[46px] h-[46px] rounded-[6px] items-center justify-center  ${(watch('start_date') && !watch('end_date')) || (watch('end_date') && !watch('start_date')) ? 'bg-[#1473A1] hover:bg-[#2c6582]' : 'bg-[#B8D5E3] '}`}
                                        onClick={(watch('start_date') && !watch('end_date')) || (watch('end_date') && !watch('start_date')) ? togglePopup : undefined}
                                    >
                                        <AccessTimeOutlinedIcon sx={{ color: "#ffffff", fontSize: '22px' }} />
                                    </div>

                                    {/* Popup */}
                                    {isPopupVisible && (
                                        <div ref={popupRef} className="bottom-arrow !w-[258px] rounded-[8px] absolute top-[-100px] left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg p-4 !z-1">
                                            <div className="flex items-center justify-center text-[#58585A]">
                                                {`Period`}
                                            </div>

                                            <div className="flex items-center justify-center gap-2 py-2">
                                                <div >
                                                    <label
                                                        onClick={() => handleButtonClick('year')}
                                                        className={`w-[100px] ml-2 !h-[46px] ${selectedButton === 'year' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px]`}
                                                    >
                                                        {`ปี`}
                                                    </label>
                                                </div>

                                                <div >
                                                    <label
                                                        onClick={() => handleButtonClick('day')}
                                                        className={`w-[100px] ml-2 !h-[46px] ${selectedButton === 'day' ? 'bg-[#1473A1]' : 'bg-white !text-[#1473A1]'} border border-[#1473A1] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-[#266a8c] hover:!text-[#ffffff] focus:outline-none flex items-center justify-center text-[14px]`}
                                                    >
                                                        {`วัน`}
                                                    </label>
                                                </div>
                                            </div>

                                            <label className={`${labelClass} text-[#58585A] pt-2`}>{`จำนวน`}</label>
                                            <NumericFormat
                                                id="period_number"
                                                value={watch("period_number")}
                                                placeholder="Enter number of period"
                                                // readOnly={isReadOnly}
                                                {...register("period_number")}
                                                // onChange={(e) => setValue("period_number", e.target.value)}
                                                onChange={(e) => {
                                                    const inputValue = e.target.value.replace(/,/g, ''); // Remove commas
                                                    if (inputValue === "") {
                                                        setValue("period_number", "");
                                                        return;
                                                    }
                                                    // const numericValue = parseInt(inputValue); 
                                                    setValue("period_number", inputValue);

                                                }}
                                                // isAllowed={(values: any) => {
                                                //     const { formattedValue, floatValue } = values
                                                //     if (floatValue == null) {
                                                //         return formattedValue === ''
                                                //     } else {
                                                //         return (values.floatValue <= selectedTermMaster[0]?.max)
                                                //     }
                                                // }}
                                                className={`${inputClass} ${errors.period_number && "border-red-500"} text-left`}
                                                thousandSeparator={false}
                                                decimalScale={2}
                                                fixedDecimalScale={false}
                                                allowNegative={false}
                                                displayType="input"
                                                max={selectedTermMaster[0]?.max}
                                            />
                                            {/* date, period, type, mode */}
                                            <div className="flex w-full pt-4">
                                                <button
                                                    type="button"
                                                    className="w-full font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                    onClick={() => { findStartOrEnd(), setIsPopupVisible(false) }}
                                                >
                                                    {`OK`}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full flex flex-col">
                                    <label className={labelClass}>
                                        <span className="text-red-500">*</span>
                                        {`End Date`}
                                    </label>
                                    <DatePickaForm
                                        {...register('end_date', { required: "Select end date" })}
                                        placeHolder="Select End Date"
                                        // valueShow={dayjs(watch("end_date")).format("DD/MM/YYYY")}
                                        valueShow={watch("end_date")}
                                        // min={watch("start_date")}
                                        // min={formattedStartDate}
                                        min={endDateMin} // term ที่ set file period เป็น day (ปัจจุบัน short non firm) เมื่อเลือก period ใน bulletin End date ขึ้นถูกต้องตามจำนวนวันที่เลือก แต่ถ้าเลือก End date เองผิด https://app.clickup.com/t/86erctycg

                                        // min={minTodayPlusOne} // End Date ไม่สามารถเลือกย้อนหลังได้ ต้องเป็น วันที่ start date เป็นต้นไป https://app.clickup.com/t/86er96j73
                                        allowClear
                                        onChange={(e: any) => {
                                            const endDateString = formatFormDateForBulletin(e)
                                            const newEndDate = parse(endDateString, 'dd/MM/yyyy', new Date())
                                            const currentStartDate = parse(watch("start_date") || endDateString, 'dd/MM/yyyy', new Date())
                                            setValue('end_date', formatFormDateForBulletin(e));
                                            conditionDatePicker(endDateString);
                                            if (newEndDate < currentStartDate) {
                                                resetField('start_date');
                                            }
                                            e === undefined &&
                                                setValue('end_date', null, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                        }}
                                        mode={'edit-bulletin'}
                                        isEndDate={true}
                                        readOnly={false}
                                        termCondition={selectedTermMaster !== undefined ? selectedTermMaster[0]?.term_type_id : null}
                                        // termMinDate={selectedTermMaster !== undefined ? selectedTermMaster[0]?.min : undefined}
                                        // termMaxDate={selectedTermMaster !== undefined ? selectedTermMaster[0]?.max : undefined}
                                        bookingTemple={selectedBookingTemple}
                                        termMaxDate={selectedTermMaster !== undefined ? endDateMax : undefined}
                                        placeHolderSize={14}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="contract_code_code" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                <span className="text-red-500">*</span>
                                {`Contract Code`}
                            </label>

                            <div className="flex gap-4">
                                <div className="w-full flex flex-col">
                                    <input
                                        id="contract_code_prefix"
                                        type="text"
                                        placeholder='Select Type and Date'
                                        // disabled={true}
                                        {...register('contract_code_prefix')}
                                        className={`${inputClass} ${errors.contract_code_prefix && 'border-red-500'}`}
                                    />
                                </div>
                                <div className="w-full flex flex-col">
                                    <input
                                        id="contract_code_code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="off"
                                        maxLength={3}
                                        placeholder='Enter Contract Code'
                                        // readOnly={isReadOnly}
                                        // {...register('contract_code_code', { required: "Enter Contract Code" })}
                                        {...contractCodeCodeRegister}
                                        onChange={(e) => {
                                            const next = e.target.value.replace(/\D/g, '').slice(0, 3)
                                            e.target.value = next
                                            contractCodeCodeOnChange(e)
                                        }}
                                        className={`${inputClass} ${errors.contract_code_code && 'border-red-500'}`}
                                    />
                                </div>
                            </div>

                        </div>

                        <input type="hidden" name="contract_code" value={watch("contract_code")}/>

                        <div className="col-span-2 pt-2">
                            <button
                                type="button"
                                disabled={
                                    !watch("start_date") ||
                                    !watch("end_date") ||
                                    !watch("type") ||
                                    !watch("contract_code")
                                }
                                className={`w-full h-[44px] font-bold text-white py-2 rounded-lg focus:outline-none text-[16px] ${!watch("start_date") ||
                                    !watch("end_date") ||
                                    !watch("type") ||
                                    !watch("contract_code")
                                    ? 'bg-[#9CA3AF] cursor-not-allowed'
                                    : 'bg-[#36B1AB] hover:bg-[#29938e]'
                                    }`}
                                onClick={() => handleButtonDownload()}
                            >
                                {`Download`}
                                <DownloadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: "8px" }} />
                            </button>
                        </div>

                        <div className="flex items-center col-span-2 pt-2">
                            {/* "Choose File" button */}
                            <label className={`flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[40%] !h-[40px] px-2 cursor-pointer`}>
                                {`Choose File`}
                                <input
                                    id="url"
                                    type="file"
                                    className="hidden"
                                    {...register('upload_tranform')}
                                    accept=".xls, .xlsx"
                                    onChange={(e: any) => {
                                        handleFileChange(e)
                                    }}
                                />
                            </label>

                            <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                <span className={`truncate ${fileName == 'Maximum File 10 MB' ? 'text-[#9CA3AF]' : 'text-[#464255]'} `}>{fileName}</span>
                                {fileName !== "Maximum File 10 MB" && (
                                    <CloseOutlinedIcon
                                        onClick={handleRemoveFile}
                                        className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                        sx={{ color: '#323232', fontSize: 18 }}
                                        style={{ fontSize: 18 }}
                                    />
                                )}
                            </div>

                            {/* "Upload" button */}
                            <label
                                onClick={handleClickUpload}
                                // className={`${fileName === "Maximum File 10 MB" ? 'bg-[#9CA3AF] !text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] ml-4 !h-[40px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[16px] `}
                                className={`${(fileName === "Maximum File 10 MB" || fileName === "The file is larger than 10 MB." || fileName === "Invalid file type. Please upload a Excel file.") ? 'bg-[#9CA3AF] text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] h-[46px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer focus:outline-none flex items-center justify-center text-[16px]`}
                            >
                                {`Upload`}
                                <input
                                    type="button"
                                    className="hidden"
                                    // accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    disabled={true}
                                    onClick={handleClickUpload}
                                />
                                <FileUploadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: "8px" }} />
                            </label>
                        </div>
                        <div className="text-[12px] text-[#1473A1] -mt-1 w-full col-span-2">
                            {requireText}
                            {errors?.upload_tranform && (<p className="text-red-500 text-sm w-full">{`${errors?.upload_tranform?.message}`}</p>)}
                        </div>
                    </div>
                </form>
            </div>

            <ModalConfirmSave
                open={modalComfirn}
                handleClose={(e: any) => {
                    setModalComfirn(false);
                    if (e == "submit") {
                        setTimeout(async () => {
                            await handleClickUploadUse();
                        }, 100);

                        setTimeout(async () => {
                            // handleClose();
                        }, 1000);
                    }
                }}
                title="Confirm Save"
                description={
                    <div>
                        <div className="text-center">
                            {msgConfirm}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Save"
                btnsplit2="Cancel"
                stat="none"
            />

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                // description="Your file has been uploaded."
                description={modalSuccessMsg}
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    handleRemoveFile();
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
        </div>

    );
};

export default ClientPage;