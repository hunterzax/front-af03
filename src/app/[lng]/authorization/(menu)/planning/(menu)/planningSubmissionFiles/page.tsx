"use client";
import "@/app/globals.css";
import { useForm } from "react-hook-form";
import { MenuItem, Select, Typography } from "@mui/material";
import { generateUserPermission } from "@/utils/generalFormatter";
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { downloadService, getService, uploadFileServiceWithAuth2 } from "@/utils/postService";
import { useEffect, useRef, useState } from "react";
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import { useFetchMasters } from "@/hook/fetchMaster";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import ModalComponent from "@/components/other/ResponseModal";
import { map50year, mapMonth } from "../../../dam/(menu)/parameters/data";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import ModalSelShipper from "./form/modalSelectShipper";
import { useAppDispatch } from "@/utils/store/store";
import { fetchShipperGroup } from "@/utils/store/slices/shipperGroupSlice";
import getUserValue from "@/utils/getuserValue";
import Spinloading from "@/components/other/spinLoading";
import { decryptData } from "@/utils/encryptionData";
import SelectFormProps from "@/components/other/selectProps";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLoadingModal, setIsLoadingModal] = useState<boolean>(false);

    const userDT: any = getUserValue();
    const [formMode, setFormMode] = useState<'download' | 'upload'>('download');
    const currentYear = new Date().getFullYear();

    // ############### Check Authen ###############
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    const { control, register, handleSubmit, setValue, reset, clearErrors, setError, formState: { errors }, watch } = useForm<any>({
        defaultValues: {
            year: null, // Default to empty string
        },
    });
    const selectboxClass = "flex w-full h-[46px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"
    const labelClass = "block mb-2 text-[16px] font-light text-[#58585A]"

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
    const { shipperGroupData, termTypeMaster } = useFetchMasters();
    const [forceRefetch, setForceRefetch] = useState(true);
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (forceRefetch) {
            dispatch(fetchShipperGroup());
        }
        if (forceRefetch) {
            setForceRefetch(false);
        }
    }, [dispatch, shipperGroupData, forceRefetch]);

    // ############### TERM IN EACH TYPE ###############
    const [termMaster, setTermMaster] = useState<any>();
    const [termTypeMasterData, setTermTypeMasterData] = useState<any>();
    const [selectedTermMaster, setSelectedTermMaster] = useState<any>();

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
            setTermMaster(filterTermsByDateRange(response))
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

    const handleFormSubmit = async (data: any) => {
        setTimeout(() => { handleRemoveFile() }, 100);
    }

    // ############# MODAL RESPONSE  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [modalWarningOpen, setModalWarningOpen] = useState(false);
    const [modalWarningMsg, setModalWarningMsg] = useState('');

    // await fetchData();
    // if (resetForm) resetForm(); // reset form
    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [requireText, setRequireText] = useState('Required : .xls, .xlsx');

    const handleFileChange = async (e: any) => {
        clearErrors('upload_tranform')
        setIsLoading(true);
        const file = e.target.files[0];
        // size
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
            // size: 34245926

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                setError('upload_tranform', { message: 'Invalid file type. Please upload a Excel file.' });
                // Invalid file type:'
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                setModalErrorMsg('The file is larger than 10 MB.')
                // File size too large:
                setModalErrorOpen(true)
                setTimeout(() => {
                    setIsLoading(false);
                }, 300);
                return;
            }

            setFileName(file.name);
            setFileUpload(file);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleRemoveFile = () => {
        setFileName("Maximum File 10 MB"); // Reset fileName
        setFileUpload(undefined);
        setValue('upload_tranform', null);
        // setFileUrl('')
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

    const [mapMonthUse, setMapMonthUse] = useState<any>([]);

    useEffect(() => {
        setValue('month', null)
        setValue('year', null)
        setMapMonthUse(mapMonth);
        // mapMonth
        // const mapMonth = [
        //     { id: 1, name: 'January' },
        //     { id: 2, name: 'Febuary' },
        //     { id: 3, name: 'March' },
        //     { id: 4, name: 'April' },
        //     { id: 5, name: 'May' },
        //     { id: 6, name: 'June' },
        //     { id: 7, name: 'July' },
        //     { id: 8, name: 'August' },
        //     { id: 9, name: 'September' },
        //     { id: 10, name: 'October' },
        //     { id: 11, name: 'November' },
        //     { id: 12, name: 'December' },
        // ]
        if (watch("term") == 2) {
            // map mapMonth only id 2, 5, 8, 11
            const filteredMapMonth = watch("term") === 2
                ? mapMonth.filter(month => [2, 5, 8, 11].includes(month.id))
                : mapMonth;

            setMapMonthUse(filteredMapMonth)
        }

    }, [watch("term")])

    // ############### MODAL SELECT SHIPPER ###############
    const [formOpen, setFormOpen] = useState(false);
    const [idShipper, setIdShipper] = useState<any>();

    // const [isDownloadMode, setIsDownloadMode] = useState<any>();

    const checkIsShipper = (mode?: any) => {


        setFormMode(mode)

        // if (userDT?.account_manage?.[0]?.user_type?.id !== 3) {
            setFormOpen(true) // เดิมอยู่ข้างนอก
        // } else {
        //     switch (mode) {
        //         case 'download':
        //             handleButtonDownload();
        //             break;
        //         case 'upload':
        //             handleClickUpload();
        //             break;
        //         default:
        //             handleButtonDownload();
        //             break;
        //     }
        // }
    }

    // ############### UPLOAD ###############
    const [selTerm, setSelTerm] = useState<any>();
    const [selYear, setSelYear] = useState<any>();
    const [selMonth, setSelMonth] = useState<any>();

    const handleClickUpload = async () => {

        if (userDT?.account_manage?.[0]?.user_type?.name == "Shipper") {
            setIsLoading(true);
        } else {
            setIsLoadingModal(true);
        }

        if (fileUpload) {
            try {

                const findYear: any = map50year.find((item: any) => item.id === selYear);
                const findMonth: any = mapMonth.find((item: any) => item.id === selMonth);

                let findYearCopy
                if (findMonth !== undefined) {
                    findYearCopy = { ...findYear };
                    let monthId = findMonth.id < 10 ? `0${findMonth.id}` : `${findMonth.id}`;
                    findYearCopy.name = `01/${monthId}/${findYearCopy.name}`;
                } else {
                    findYearCopy = { ...findYear };
                    findYearCopy.name = `01/01/${findYearCopy.name}`;
                }

                const isShipper = userDT?.account_manage?.[0]?.user_type?.id === 3;
                const dynamicFields = {
                    // shipper_id: isShipper ? null : idShipper,
                    shipper_id: idShipper,
                    type: selTerm,                 // term type
                    startDate: findYearCopy.name,  // 'DD/MM/YYYY'
                };

                let res_upload: any
                try {
                    // res_upload = await uploadFileServiceWithAuth('/master/planning-submission-file/upload', fileUpload, idShipper, 'shipper_id') // ตัวเก่ามีคีย์เดียว
                    res_upload = await uploadFileServiceWithAuth2('/master/planning-submission-file/upload', fileUpload, dynamicFields);
                } catch (error) {
                    // error upload
                }

                const statusCode = res_upload?.response?.data?.statusCode ?? res_upload?.response?.data?.status ?? res_upload?.status ?? res_upload?.statusCode ?? res_upload?.code ?? res_upload?.response?.status;
                const errorMsg = res_upload?.response?.data?.error ?? res_upload?.data?.error ?? res_upload?.response?.error ?? res_upload?.error;

                if (statusCode === 400 || statusCode === 500) {
                    // setModalErrorMsg(res_upload?.response?.data?.error ? res_upload?.response?.data?.error : "Something went wrong");
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true);
                } else {
                    // warning ก่อนสำเร็จ
                    if (res_upload?.warningRowZero) {
                        setModalWarningMsg("A Nomination Point value of 0 was detected in the uploaded file. Please verify if this is correct.")
                        setModalWarningOpen(true)
                        setFormOpen(false)
                    } else if (res_upload?.warning) {
                        setModalWarningMsg("Total Entry & Total Exit equals zero.")
                        setModalWarningOpen(true)
                        setFormOpen(false)
                    } else {
                        setFormOpen(false)
                        setModalSuccessOpen(true);
                    }
                }
            } catch (error) {
                // File upload failed
            }
        } else {
            setFileName('No file chosen');
        }

        setTimeout(() => {
            if (userDT?.account_manage?.[0]?.user_type?.name == "Shipper") {
                setIsLoading(false);
            } else {
                setIsLoadingModal(false);
            }
        }, 100);
    };

    // ############### DOWNLOAD ###############
    const handleButtonDownload = async () => {
        const findYear: any = map50year.find((item: any) => item.id === watch("year"));
        const findMonth: any = mapMonth.find((item: any) => item.id === watch("month"));

        let findYearCopy
        if (findMonth !== undefined) {
            findYearCopy = { ...findYear };
            let monthId = findMonth.id < 10 ? `0${findMonth.id}` : `${findMonth.id}`;
            findYearCopy.name = `01/${monthId}/${findYearCopy.name}`;
        } else {
            findYearCopy = { ...findYear };
            findYearCopy.name = `01/01/${findYearCopy.name}`;
        }

        // Long Term เริ่มวันที่ 1 ม.ค ปี Y+1 จากวันที่ส่งแผน
        // - การเลือก Start Date ให้เลือกเฉพาะปี เริ่มต้นในแผน (Year) และระบบจะ Gen
        // Template ให้ตามระยะการส่งแผนของ Long Term (ตามการตั้งค่าไว้ในระบบ)
        // o Medium Term เริ่มวันที่ 1 ของเดือน จากเดือน M+1 ที่ส่งแผน ซึ่งมีรอบส่งทุกวันที่ 23 ของ
        // เดือน ม.ค./ เม.ย./ ก.ค./ ต.ค. โดยข้อมูลวันเริ่มสัญญาต้องเป็นวันที่ 1 ของเดือน ก.พ./ พ.ค./
        // ส.ค./ พ.ย.
        // - การเลือก Start Date ให้เลือกเฉพาะรอบเดือนและปี (Month/Year) ก.พ./ พ.ค./ ส.ค./
        // พ.ย. และระบบจะ Gen Template ให้ตามระยะการส่งแผนของ Medium Term (ตาม
        // การตั้งค่าไว้ในระบบ)
        // o Short Term เริ่มวันที่ 1 ของเดือน จากเดือน M+1 ที่ส่งแผน - วันที่ 1 ของทุกเดือน
        // - การเลือก Start Date ให้เลือกเฉพาะเดือนและปี (Month/Year) M+1 และระบบจะ Gen
        // Template ให้ตามระยะการส่งแผนของ Short Term (ตามการตั้งค่าไว้ในระบบ)
        // • เงื่อนไขที่ 2 : เมื่อคลิก Download ระบบจะสร้างไฟล์ที่ระบุระยะเวลาส่งแผนในรอบที่ต้องการ โด

        // master/planning-submission-file/download?startDate=01/01/2025&type=1
        // const res: any = await downloadService(`/master/bulletin-board?startDate=${watch("start_date")}&endDateDate=${watch("end_date")}&ContractCode=${watch("contract_code")}&type=${watch("type")}`, watch("type"));
        // const res: any = await downloadService(`/master/planning-submission-file/download?startDate=${findYearCopy?.name}&type=${watch("term")}`, watch("term"));
        let res_download: any
        if (userDT?.account_manage?.[0]?.user_type?.id !== 3) { // ไม่ใช่ shipper กด download
            res_download = await downloadService(`/master/planning-submission-file/download?startDate=${findYearCopy?.name}&type=${watch("term")}&shipper_id=${idShipper}`, watch("term"));
        } else {
            // เดิมโรงงาน
            // ถ้า tso ใช้งานให้ใส่ shipper_id แต่ถ้าไม่ใช่ null
            res_download = await downloadService(`/master/planning-submission-file/download?startDate=${findYearCopy?.name}&type=${watch("term")}&shipper_id=${null}`, watch("term"));
        }

        if (res_download?.status === 400) {
            // setModalErrorMsg(res_download?.error);
            setModalErrorMsg("Planning template date not match");
            setModalErrorOpen(true)
        } else {
            // setModalSuccessOpen(true);
            setFormOpen(false)
            setValue('term', null)
            setValue('month', null)
            setValue('year', null)
        }
    };

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

                    <div className="grid grid-cols-[210px_210px] gap-2 pt-1 relative">
                        {/* <Spinloading spin={isLoading} rounded={20} /> */}
                        <div className="col-span-2">
                            <label htmlFor="term" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                {/* <span className="text-red-500">*</span> */}
                                {`Term`}
                            </label>
                            <Select
                                id="term"
                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                // {...register("term", { required: "Select Process Term" })}
                                {...register("term")}
                                // disabled={isReadOnly}
                                value={watch("term") || ""}
                                className={`${selectboxClass} ${errors.term && "border-red-500"}`}
                                sx={{
                                    '.MuiOutlinedInput-notchedOutline': {
                                        // borderColor: '#DFE4EA', // Change the border color here
                                        borderColor: errors.term && !watch('term') ? '#FF0000' : '#DFE4EA',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: errors.term && !watch("term") ? "#FF0000" : "#d2d4d8"
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#d2d4d8',
                                    },
                                }}
                                onChange={(e) => {
                                    setSelectedTermMaster(termMaster[e.target.value])
                                    setValue("term", e.target.value);
                                }}
                                displayEmpty
                                renderValue={(value: any) => {
                                    if (!value) {
                                        return <Typography color="#9CA3AF" fontSize={14}>Select Term</Typography>;
                                    }
                                    return termTypeMasterData?.find((item: any) => item.id === value)?.name || '';
                                }}
                            >
                                {(termTypeMasterData || [])
                                    .filter((item: any) => item.id !== 4)
                                    .map((item: any) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                            </Select>
                        </div>

                        <div className="col-span-2">
                            <div className="flex gap-2">
                                <div className="w-full flex flex-col">
                                    <label className=" text-[#58585A]">
                                        <label htmlFor="year" className={labelClass}>
                                            {`Year`}
                                        </label>
                                        <div className="w-full">
                                            {/* <Select
                                                id="year"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("year")}
                                                value={watch("year") || ""}
                                                className={` ${selectboxClass}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#DFE4EA', // Change the border color here
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    setValue("year", e.target.value);
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                            // width: 250, // Adjust width as needed
                                                        },
                                                    },
                                                }}
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>Select Year</Typography>;
                                                    }
                                                    return map50year?.find((item: any) => item.id === value)?.name || '';
                                                }}
                                                displayEmpty
                                            >
                                                {map50year
                                                    ?.filter((item: any) => parseInt(item.name) >= currentYear) // Filter years greater than or equal to the current year
                                                    .map((item: any) => (
                                                        <MenuItem key={item.id} value={item.id}>
                                                            {item.name}
                                                        </MenuItem>
                                                    ))}
                                            </Select> */}

                                            <SelectFormProps
                                                id={'year'}
                                                register={register("year", { required: false })}
                                                disabled={false}
                                                valueWatch={watch("year") || ""}
                                                handleChange={(e) => {
                                                    setValue("year", e.target.value);
                                                    if (errors?.year) { clearErrors('year') }
                                                }}
                                                errors={errors?.month}
                                                errorsText={'Select Year'}
                                                options={map50year.filter((item: any) => parseInt(item.name) >= currentYear)}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Year'}
                                                pathFilter={'name'}
                                            />
                                        </div>
                                    </label>
                                </div>

                                <div className="w-full flex flex-col">
                                    <div className="w-full flex flex-col">
                                        {
                                            watch("term") !== 1 && watch("term") && <label className=" text-[#58585A]">
                                                <label htmlFor="month" className={labelClass}>
                                                    {`Month`}
                                                </label>
                                                <div className="w-full">
                                                    {/* <Select
                                                        id="month"
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register("month")}
                                                        value={watch("month") || ""}
                                                        className={` ${selectboxClass}`}
                                                        sx={{
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#DFE4EA', // Change the border color here
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                        }}
                                                        onChange={(e) => {
                                                            setValue("month", e.target.value);
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                },
                                                            },
                                                        }}
                                                        renderValue={(value: any) => {
                                                            if (!value) {
                                                                return <Typography color="#9CA3AF" fontSize={14}>Select Month</Typography>;
                                                            }
                                                            return mapMonth?.find((item: any) => item.id === value)?.name || '';
                                                        }}
                                                        displayEmpty
                                                    >
                                                        {mapMonthUse?.map((item: any) => (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                {item.name}
                                                            </MenuItem>
                                                        ))}
                                                    </Select> */}

                                                    <SelectFormProps
                                                        id={'month'}
                                                        register={register("month", { required: false })}
                                                        disabled={false}
                                                        valueWatch={watch("month") || ""}
                                                        handleChange={(e) => {
                                                            setValue("month", e.target.value);
                                                            if (errors?.month) { clearErrors('month') }
                                                        }}
                                                        errors={errors?.month}
                                                        errorsText={'Select Month'}
                                                        options={mapMonthUse}
                                                        optionsKey={'id'}
                                                        optionsValue={'id'}
                                                        optionsText={'name'}
                                                        optionsResult={'name'}
                                                        placeholder={'Select Month'}
                                                        pathFilter={'name'}
                                                        isNoSort={true}
                                                    />

                                                </div>
                                            </label>
                                        }

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 pt-2">

                            <button
                                type="button"
                                disabled={
                                    watch("term") === 1
                                        ? !watch("term") || !watch("year") // Check only term and year when term === 1
                                        : !watch("term") || !watch("year") || !watch("month") // Otherwise check all three
                                }
                                className={`w-full h-[44px] font-bold text-white py-2 rounded-lg focus:outline-none text-[16px] ${(watch("term") === 1
                                    ? !watch("term") || !watch("year") // Check only term and year when term === 1
                                    : !watch("term") || !watch("year") || !watch("month") // Otherwise check all three
                                )
                                    ? 'bg-[#9CA3AF] cursor-not-allowed'
                                    : 'bg-[#36B1AB] hover:bg-[#29938e]'
                                    }`}
                                // onClick={() => handleButtonDownload()}
                                onClick={() => checkIsShipper('download')}
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
                                    onChange={handleFileChange}
                                />
                            </label>

                            <div className="bg-white text-[#9CA3AF] text-sm w-[70%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                <span className="truncate">{fileName}</span>
                                {fileName !== "Maximum File 10 MB" && (
                                    <CloseOutlinedIcon
                                        onClick={handleRemoveFile}
                                        className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                        sx={{ color: '#323232', fontSize: 18 }}
                                        style={{ fontSize: 18 }}
                                    />
                                )}
                            </div>

                            <label
                                // onClick={handleClickUpload} 
                                onClick={() => checkIsShipper('upload')}
                                className={`${(fileName === "Maximum File 10 MB" || fileName === "The file is larger than 10 MB." || fileName === "Invalid file type. Please upload a Excel file.") ? 'bg-[#9CA3AF] !text-[#FFFFFF] pointer-events-none' : 'hover:bg-[#28805a]'} w-[167px] ml-4 !h-[40px] font-bold bg-[#17AC6B] text-white py-2 px-5 rounded-lg cursor-pointer  focus:outline-none  flex items-center justify-center text-[16px] `}
                            >
                                {`Upload`}
                                <input
                                    type="button"
                                    className="hidden"
                                    // accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    disabled={true}
                                    // onClick={handleClickUpload}
                                    onClick={() => checkIsShipper('upload')}
                                />
                                <FileUploadRoundedIcon sx={{ color: '#ffffff', fontSize: '20px', marginLeft: "8px" }} />
                            </label>
                        </div>
                        <div className="text-[12px] text-[#1473A1] -mt-1 col-span-2">
                            {requireText}
                            {errors?.upload_tranform && (<p className="text-red-500 text-sm w-full">{`${errors?.upload_tranform?.message}`}</p>)}
                        </div>
                    </div>
                </form>
            </div>

            <ModalSelShipper
                mode={formMode}
                // data={formData}
                open={formOpen}
                // dataTable={dataTable}
                shipperGroupData={shipperGroupData?.data}
                setIdShipper={setIdShipper}
                setSelTerm={setSelTerm}
                setSelYear={setSelYear}
                setSelMonth={setSelMonth}
                handleClickUpload={handleClickUpload}
                handleButtonDownload={handleButtonDownload}
                onClose={() => {
                    setFormOpen(false);
                    setIsLoadingModal(false);
                }}
                onSubmit={handleFormSubmit}
                isLoading={isLoadingModal}
                setisLoading={setIsLoadingModal}
            />

            {/* <ModalConfirmTerm
                mode={formMode}
                open={formUploadOpen}
                shipperGroupData={shipperGroupData?.data}
                setIdShipper={setIdShipper}
                handleClickUpload={handleClickUpload}
                handleButtonDownload={handleButtonDownload}
                onClose={() => {
                    setFormOpen(false);
                    setIsLoadingModal(false);
                }}
                onSubmit={handleFormSubmit}
                isLoading={isLoadingModal}
                setisLoading={setIsLoadingModal}
            /> */}

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description="Your file has been uploaded."
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    setFormOpen(false);
                    setIsLoadingModal(false);
                    handleRemoveFile();
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    modalErrorMsg?.split('<br/>')?.length > 1 ?
                        <div className={`${modalErrorMsg?.length > 400 ? "h-[calc(300px)] overflow-y-auto text-sm" : ""}`}>
                            <ul className=" text-start list-disc space-y-3">
                                {
                                    modalErrorMsg.split('<br/>').map(item => {
                                        return (
                                            <li className="">{item}</li>
                                        )
                                    })
                                }
                            </ul>
                        </div>
                    :
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
                    setModalSuccessOpen(true);
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
        </div>

    );
};

export default ClientPage;