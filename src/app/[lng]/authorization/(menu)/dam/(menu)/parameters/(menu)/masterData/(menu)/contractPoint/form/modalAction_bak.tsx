import React from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import { getService, postService } from '@/utils/postService';
import { exportToExcel, formatDateNoTime, formatFormDate, formatWatchFormDate, toDayjs } from '@/utils/generalFormatter';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DatePickaForm from '@/components/library/dateRang/dateSelectForm';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Checkbox, ListItemText, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { table_col_arrow_sort_style, table_sort_header_style } from '@/utils/styles';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { handleSort } from '@/utils/sortTable';
import Spinloading from '@/components/other/spinLoading';
import getUserValue from '@/utils/getuserValue';
import ModalConfirmSave from '@/components/other/modalConfirmSave';
import NodataTable from '@/components/other/nodataTable';
import ModalComponent from '@/components/other/ResponseModal';
import SelectFormProps from '@/components/other/selectProps';
import { InputSearch } from '@/components/other/SearchForm';
import BtnGeneral from '@/components/other/btnGeneral';

// Extend dayjs with the plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type FormData = {
    id: string;
    contract_point: string;
    description: string;
    entry_exit_id: string;
    zone_id: string;
    area_id: string;
    contract_point_start_date: Date | null;
    contract_point_end_date: Date | null;
    nomination_point_list: any;
};

type FormExampleProps = {
    mode?: 'create' | 'edit' | 'view';
    data?: Partial<FormData>;
    open: boolean;
    isLoading: boolean;
    zoneMasterData: any;
    areaMasterData: any;
    entryExitMasterData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    setIsLoading: (isLoading: boolean) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = 'create',
    data = {},
    zoneMasterData = {},
    areaMasterData = {},
    entryExitMasterData = {},
    open,
    isLoading,
    onClose,
    onSubmit,
    setResetForm,
    setIsLoading
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    const userDT: any = getUserValue();

    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const [nominationPoints, setNominationPoints] = useState<any>([]);
    const [zoneMaster, setZoneMaster] = useState(zoneMasterData);
    const [areaMaster, setAreaMaster] = useState(areaMasterData);

    useEffect(() => {
        setAreaMaster(areaMasterData)
    }, [areaMasterData])

    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false);
    const [dataSubmit, setDataSubmit] = useState<any>();
    const [exportData, setExportData] = useState<any>([]);

    // const flatArea = entryExitMasterData?.flatMap((entryExit: any) => entryExit.area);

    const isReadOnly: any = mode === "view" || (data?.contract_point_start_date && new Date(data?.contract_point_start_date) < new Date()); // Edit : ถ้าถึงวัน Start Date แล้วไม่ให้ Edit อะไรเลยนอกจาก End Date (D+1)  https://app.clickup.com/t/86erwkw1v

    const labelClass = "block mb-2 text-[14px] font-light"
    const inputClass = `text-sm block md:w-full !p-2 !ps-5 hover:!p-2 hover:!ps-5 focus:!p-2 focus:!ps-5 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF] ${mode == 'view' && isReadOnly && '!border-none'}`;
    const selectboxClass = "flex w-full h-[35px] p-1 ps-2 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const textErrorClass = "text-red-500 text-[14px]"
    const itemselectClass = "pl-[10px] text-[14px]"
    const pxpyClass = "px-2 py-1 text-[#464255]"

    // const isReadOnly = mode === 'view';
    const isPastStartDate = (data?.contract_point_start_date && new Date(data?.contract_point_start_date) < new Date());

    const startDate = watch('contract_point_start_date');
    // const startDate = new Date();
    const formattedStartDate = formatWatchFormDate(startDate);

    useEffect(() => {
        const fetchAndSetData = async () => {
            setValue('contract_point_start_date', null);
            setValue('contract_point_end_date', null);
            if (mode === 'create') {
                setIsLoading(false);
            }
            if (mode === 'edit' || mode === 'view') {
                 

                setZoneMaster(zoneMasterData)

                setIsLoading(true);
                setNominationPoints(data?.nomination_point_list || [])
                const formattedStartDate: any = formatFormDate(data?.contract_point_start_date);
                // const formattedEndDate: any = formatFormDate(data?.contract_point_end_date);
                let formattedEndDate: any = 'Invalid Date'
                if (data?.contract_point_end_date !== null) {
                    formattedEndDate = formatFormDate(data?.contract_point_end_date);
                }

                setValue('contract_point_end_date', formattedEndDate);
                setValue('contract_point', data?.contract_point || '');
                setValue('description', data?.description || '');
                setValue('entry_exit_id', data?.entry_exit_id || '');
                setValue('zone_id', data?.zone_id || '');
                setValue('area_id', data?.area_id || '');
                setValue('contract_point_start_date', formattedStartDate);

                // const filteredArea = flatArea.filter((item: any) => item.zone_id === data?.zone_id);
                // setAreaMaster(filteredArea)
                // const filteredArea = areaMaster.filter((item: any) => item.zone_id === data?.zone_id);
                const filteredArea = areaMasterData.filter((item: any) => item.zone_id === data?.zone_id);
                setAreaMaster(filteredArea)

                const zone_name = zoneMasterData?.find((item: any) => item.id === data?.zone_id);
                const area_name = areaMasterData?.find((item: any) => item.id === data?.area_id);

                setExportData([
                    {
                        "contract_point": data?.contract_point,
                        "description": data?.description,
                        "entry_exit_id": data?.entry_exit_id,
                        "zone_id": zone_name?.name,
                        "area_id": area_name?.name,
                        "contract_point_start_date": data?.contract_point_start_date,
                        "contract_point_end_date": data?.contract_point_end_date,
                    }
                ])

                setTimeout(() => {
                    if (data) { setIsLoading(false); }
                }, 300);
            }
        }

        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const [tabIndex, setTabIndex] = useState(0);
    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    const deleteNominationPoint = (id: any, index: any) => {
        if (id) {
            setNominationPoints(nominationPoints.filter((point: any) => point.id !== id));
        }
        else {
            setNominationPoints(nominationPoints.filter((point: any, i: any) => i !== index));
        }
    };

    const fetchData = async () => {
        try {
            const res_area: any = await getService(`/master/asset/area`);
            setAreaMaster(res_area)
        } catch (err) {
        } finally {
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const [nomSelectData, setNomSelectData] = useState<any>([]);

    const fetchNomData = async () => {
        try {
            // // const response:any = await getService(`/master/asset/nomination-point-contract/${data?.id}?nomination_point_start_date=${nomStartDate}&nomination_point_end_date=${nomEndDate}`);
            // let operator = '?'
            // let url = `/master/asset/nomination-point-contract`
            // if (data?.id) {
            //     url += `${operator}contract_point=${data?.id}`
            //     operator = '&'
            // }
            // if (watch("nomination_point_start_date")) {
            //     url += `${operator}nomination_point_start_date=${watch("nomination_point_start_date")}`
            //     operator = '&'
            // }
            // if (watch("nomination_point_end_date")) {
            //     url += `${operator}nomination_point_end_date=${watch("nomination_point_end_date")}`
            //     operator = '&'
            // }
            // if (watch("area_id")) {
            //     url += `${operator}area=${watch("area_id")}`
            //     operator = '&'
            // }
            const today = dayjs();
            let url = `/master/asset/nomination-point-contract?nomination_point_start_date=${today.startOf('day').toISOString()}&nomination_point_end_date=${today.endOf('day').toISOString()}`
            if (data?.id) {
                url += `&contract_point=${data?.id}`
            }
            if (watch("area_id")) {
                url += `&area=${watch("area_id")}`
            }

            const response: any = await getService(url);
             
            if (response) {
                setNomSelectData(response)
            }
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    // API call when the startDate changes
    useEffect(() => {
        if (open) {
            fetchNomData();
        }
    }, [watch("nomination_point_start_date"), watch("nomination_point_end_date"), watch("area_id")]);

    const addNomination = () => {
        async function addToTable(id: any, currentNomination: any) {
            const selectedNomination: any = nomSelectData.find((item: any) => item?.id === id); // Find selected nomination object

            if (selectedNomination) {
                const newStartDate = watch('nomination_point_start_date');
                const newEndDate = watch('nomination_point_end_date');
                const newStartDayjs = dayjs(newStartDate);
                const newEndDayjs = newEndDate ? dayjs(newEndDate) : dayjs('');

                const { isValid, validateList } = await validateNewPeriod({
                    ...selectedNomination,
                    start_date: newStartDayjs.isValid() ? newStartDayjs.toISOString() : undefined,
                    end_date: newEndDayjs.isValid() ? newEndDayjs.toISOString() : undefined
                })


                if (isValid) {
                    const now = dayjs();
                    const { id, start_date, end_date, ref_id, zone_id, area_id, create_by_account, create_date, create_date_num, ...rest } = selectedNomination
                    const newNomPoint = {
                        ...rest,
                        ref_id: selectedNomination.id,
                        create_by_account: userDT,
                        create_date: now.toISOString(),
                        create_date_num: now.unix(),
                        zone_id: watch('zone_id'),
                        area_id: watch('area_id'),
                        start_date: watch('nomination_point_start_date'),
                        end_date: watch('nomination_point_end_date')
                    }

                    if (Array.isArray(currentNomination)) {
                        let validateList: string[] = [];
                        const existingList = currentNomination.filter((item: any) => item.nomination_point === selectedNomination.nomination_point);
                        if (existingList) {
                            if (newStartDayjs.isValid()) {
                                if (watch('nomination_point_end_date')) {
                                    if (newEndDayjs.isValid()) {
                                        //หา Point ที่ active อยู่ระหว่างกลางถ้ามีจะแทรกไม่ได้
                                        const activePoint = existingList.filter((item: any) => {
                                            const startDate = dayjs(item?.start_date);
                                            const endDate = dayjs(item?.end_date);
                                            if (
                                                startDate.isValid()
                                                && startDate.isSameOrAfter(newStartDayjs)
                                                && startDate.isSameOrBefore(newEndDayjs)
                                                && endDate.isValid() && endDate.isBefore(newEndDayjs)) {
                                                return item
                                            }
                                            return false
                                        })
                                        if (activePoint && activePoint.length > 0) {
                                            validateList = activePoint.map((point) => {
                                                return `${point.nomination_point} already exists at ${toDayjs(point.start_date).format('DD/MM/YYYY')}`;
                                            });
                                        } else {
                                            //// ลบตัวใหม่ตัวใหม่ทุกตัวหาย
                                            //// เพิ่มตัวใหม่ไม่แทรกตัวใหม่
                                            const moveEndDatePoint = existingList.filter((item: any) => {
                                                const startDate = dayjs(item?.start_date);
                                                const endDate = dayjs(item?.end_date);
                                                if (
                                                    startDate.isValid()
                                                    && startDate.isSameOrBefore(newStartDayjs)
                                                    && (item?.end_date === null || (endDate.isValid() && endDate.isAfter(newStartDayjs)))
                                                ) {
                                                    item?.end_date = newStartDate;
                                                    return item
                                                }
                                                return false
                                            })
                                            const moveStartDatePoint = existingList.filter((item: any) => {
                                                const startDate = dayjs(item?.start_date);
                                                const endDate = dayjs(item?.end_date);
                                                if (
                                                    startDate.isValid()
                                                    && startDate.isSameOrAfter(newStartDayjs)
                                                    && startDate.isSameOrBefore(newEndDayjs)
                                                    && (item?.end_date === null || (endDate.isValid() && endDate.isAfter(newStartDayjs)))
                                                ) {
                                                    item?.start_date = newEndDate;
                                                    return item
                                                }
                                                return false
                                            })
                                            // First update existing points with end date changes
                                            const updatedPoints = currentNomination.map((point: any) => {
                                                const updatedEndPoint = moveEndDatePoint.find((p: any) => p.id === point.id);
                                                if (updatedEndPoint) return updatedEndPoint;

                                                const updatedStartPoint = moveStartDatePoint.find((p: any) => p.id === point.id);
                                                if (updatedStartPoint) return updatedStartPoint;

                                                return point;
                                            });
                                            // Then add the new nomination point
                                            return {
                                                validateList: validateList,
                                                updatedList: [...updatedPoints, newNomPoint]
                                            }
                                        }
                                    }
                                    else {
                                        validateList.push(`Nomination Point End Date is invalid`);
                                    }
                                }
                                else {
                                    //มี Point รอเริ่มอยู่แทรกไม่ได้
                                    const waitForStartPoint = existingList.filter((item: any) => {
                                        const startDate = dayjs(item?.start_date);

                                        if (startDate.isValid() && startDate.isSameOrAfter(newStartDayjs)) {
                                            return item
                                        }
                                        return false
                                    })
                                    if (waitForStartPoint && waitForStartPoint.length > 0) {
                                        validateList = waitForStartPoint.map((point) => {
                                            return `${point.nomination_point} already exists at ${toDayjs(point.start_date).format('DD/MM/YYYY')}`;
                                        });
                                    } else {
                                        const moveEndDatePoint = existingList.filter((item: any) => {
                                            const startDate = dayjs(item?.start_date);
                                            const endDate = dayjs(item?.end_date);
                                            if (
                                                startDate.isValid()
                                                && startDate.isSameOrBefore(newStartDayjs)
                                                && (item?.end_date === null || (endDate.isValid() && endDate.isAfter(newStartDayjs)))
                                            ) {
                                                item?.end_date = newStartDate;
                                                return item
                                            }
                                            return false
                                        })

                                        // First update existing points with end date changes
                                        const updatedPoints = currentNomination.map((point: any) => {
                                            const updatedPoint = moveEndDatePoint.find((p: any) => p.id === point.id);
                                            return updatedPoint || point;
                                        });
                                        // Then add the new nomination point
                                        return {
                                            validateList: validateList,
                                            updatedList: [...updatedPoints, newNomPoint]
                                        }
                                    }
                                }
                            }
                            else {
                                validateList.push(`Nomination Point Start Date is invalid`);
                            }

                            // setModalErrorMsg(validateList.join('<br/>'));
                            // setModalErrorOpen(true)
                            return {
                                validateList: validateList,
                                updatedList: currentNomination
                            }
                        }
                        else {
                            return {
                                validateList: [],
                                updatedList: currentNomination
                            }
                        }
                    }
                    else {
                        return {
                            validateList: [],
                            updatedList: [newNomPoint]
                        }
                    }
                }
                else {
                    return {
                        validateList: validateList,
                        updatedList: currentNomination
                    }
                }
            }
            else {
                return {
                    validateList: [],
                    updatedList: currentNomination
                }
            }
        }

        const selectedNominationId = watch('nomination_point'); // Get selected nomination point ID
        if (selectedNominationId) {
            if (Array.isArray(selectedNominationId)) {
                (async () => {
                    let currentNomination = nominationPoints;
                    let allValidateList: string[] = [];
                    for (const id of selectedNominationId) {
                        const { validateList, updatedList } = await addToTable(id, currentNomination);
                        if (validateList && Array.isArray(validateList) && validateList.length > 0) {
                            allValidateList.push(...validateList);
                        }
                        if (updatedList) {
                            currentNomination = updatedList;
                        }
                    }
                    if (allValidateList.length > 0) {
                        setModalErrorMsg(allValidateList.join('<br/>'));
                        setModalErrorOpen(true);
                    } else {
                        setNominationPoints(currentNomination);
                    }
                })();
            }
            else {
                addToTable(selectedNominationId, nominationPoints).then(({ validateList, updatedList }: any) => {
                    if (validateList && Array.isArray(validateList) && validateList.length > 0) {
                        setModalErrorMsg(validateList.join('<br/>'));
                        setModalErrorOpen(true)
                    }
                    else {
                        setNominationPoints(updatedList)
                    }
                })
            }
        }
    };

    const validateNewPeriod = async (nominationPoint: any) => {
        const res_period = await postService('/master/asset/nomination-point-new-period-check', nominationPoint)
        if (res_period?.isValid == true) {
            return {
                isValid: true,
                validateList: []
            }
        }
        else {
            if (res_period?.nominationPoint && res_period.nominationPoint.length == 1) {
                const startDateAtThai = toDayjs(nominationPoint.start_date).toISOString()
                const endDateAtThai = nominationPoint.end_date ? toDayjs(nominationPoint.end_date).toISOString() : null
                const isSamePoint = res_period?.nominationPoint?.some((item: any) => {
                    return (item?.start_date == nominationPoint.start_date || item?.start_date == startDateAtThai)
                        && (item?.end_date == nominationPoint.end_date || item?.end_date == endDateAtThai || (!item?.end_date && !nominationPoint.end_date))
                })
                if (isSamePoint) {
                    return {
                        isValid: true,
                        validateList: []
                    }
                }
            }

            // if (res_period?.validateList) {
            //     setModalErrorMsg(res_period?.validateList.join('<br/>'));
            //     setModalErrorOpen(true)
            // }
            return {
                isValid: false,
                validateList: res_period?.validateList
            }
        }
    }

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(nominationPoints);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    useEffect(() => {
        setValue("contract_nomination_point", nominationPoints);
    }, [nominationPoints, setValue]);

    const handleClose = () => {
        onClose();
        setTabIndex(0);
        setResetForm(() => reset);

        setNominationPoints([])

        setTimeout(() => {
            setIsLoading(true);
        }, 100);
    };

    const handleSaveConfirm = async (data?: any) => {
        // setDataSubmit(data)
        // setModaConfirmSave(true)

        if (mode == 'create') {
            await onSubmit(data);
        } else {
            setDataSubmit(data)
            setModaConfirmSave(true)
        }
    }

    // const columnVisibility: any = [
    //     { key: 'contract_point', label: 'Contract Point', visible: true },
    //     { key: 'entry_exit', label: 'Entry/Exit', visible: true },
    //     { key: 'description', label: 'Description', visible: true },
    //     { key: 'zone', label: 'Zone', visible: true },
    //     { key: 'area', label: 'Area', visible: true },
    //     { key: 'contract_point_start_date', label: 'Contract Point Start Date', visible: true },
    //     { key: 'contract_point_end_date', label: 'Contract Point End Date', visible: true }
    // ];

    const columnVisibility: any = {
        "contract_point": true,
        "entry_exit": true,
        "description": true,
        "zone": true,
        "area": true,
        "contract_point_start_date": true,
        "contract_point_end_date": true,
    }

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-30">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <Spinloading spin={isLoading} rounded={20} /> {/* loading example here */}
                        <div className="flex inset-0 items-center justify-center ">



                            <div className="flex flex-col items-center justify-center gap-2 rounded-md">

                                <form
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w  w-[800px]"
                                    // onSubmit={handleSubmit(handleSaveConfirm)}
                                    onSubmit={
                                        mode == 'create' ?
                                            handleSubmit(async (data) => { // clear state when submit
                                                setIsLoading(true);
                                                setTimeout(() => {
                                                    onSubmit(data);
                                                }, 100)
                                            })
                                            :
                                            handleSubmit(handleSaveConfirm)
                                    }
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{mode == "create" ? `New Contract Point` : mode == "edit" ? `Edit Contract Point` : `View Contract Point`}</h2>

                                    {
                                        // View : เพิ่ม Export ส่วนของ Contract Point https://app.clickup.com/t/86etzcgyd
                                        mode == 'view' && <div className='flex flex-wrap items-end justify-end'>
                                            <BtnGeneral
                                                bgcolor={"#24AB6A"}
                                                modeIcon={'export'}
                                                textRender={"Export"}
                                                generalFunc={() => exportToExcel(exportData, 'contract-point-view-modal', columnVisibility)}
                                                can_export={true}
                                            />
                                        </div>
                                    }

                                    <div className="grid grid-cols-2 gap-2">

                                        <div>
                                            <label htmlFor="contract_point" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Contract Point`}
                                            </label>
                                            <input
                                                id="contract_point"
                                                type="text"
                                                placeholder='Enter Contract Point'
                                                readOnly={isReadOnly}
                                                {...register('contract_point', { required: "Enter Contract Point " })}
                                                className={`${inputClass} ${errors.contract_point && 'border-red-500'}  ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            {errors.contract_point && <p className="text-red-500 text-[14px]">{`Enter Contract Point`}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="entry_exit_id" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Entry/Exit`}
                                            </label>
                                            {/* <Select
                                                id="entry_exit_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register('entry_exit_id', { required: "Select Entry / Exit" })}
                                                disabled={isReadOnly}
                                                value={watch('entry_exit_id') || ''}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.entry_exit_id && 'border-red-500'}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.entry_exit_id && !watch('entry_exit_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.entry_exit_id && !watch("entry_exit_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    const filteredZones = zoneMasterData.filter((zone: any) => zone.entry_exit_id === e.target.value);
                                                    setZoneMaster(filteredZones)
                                                    if (watch("entry_exit_id") != e.target.value) {
                                                        resetField("zone_id")
                                                        resetField("area_id")
                                                        setNominationPoints(data?.nomination_point_list || [])
                                                    }
                                                    setValue('entry_exit_id', e.target.value);

                                                    // เมื่อ edit เลือกเปลี่ยน Entry/Exit ข้อมูล Area ไม่ reset ให้เหมือน Zone และไม่สามารถ save ได้ แม้จะยังไม่ถึงวัน start date https://app.clickup.com/t/86erctycw
                                                    setValue('zone_id', '');
                                                    setValue('area_id', '');

                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Entry/Exit</Typography>;
                                                    }
                                                    return <span className={itemselectClass}>{entryExitMasterData.find((item: any) => item.id === value)?.name || ''}</span>;
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                            // width: 250, // Adjust width as needed
                                                        },
                                                    },
                                                }}
                                            >
                                                {entryExitMasterData?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        <ListItemText primary={<Typography fontSize={14}>{item.name}</Typography>} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.entry_exit_id && <p className="text-red-500 text-[14px]">{`Select Entry / Exit`}</p>} */}

                                            <SelectFormProps
                                                id={'entry_exit_id'}
                                                register={register("entry_exit_id", { required: "Select Entry / Exit" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("entry_exit_id") || ""}
                                                handleChange={(e) => {
                                                    const filteredZones = zoneMasterData.filter((zone: any) => zone.entry_exit_id === e.target.value);
                                                    setZoneMaster(filteredZones)
                                                    if (watch("entry_exit_id") != e.target.value) {
                                                        resetField("zone_id")
                                                        resetField("area_id")
                                                        setNominationPoints(data?.nomination_point_list || [])
                                                    }
                                                    setValue('entry_exit_id', e.target.value);

                                                    // เมื่อ edit เลือกเปลี่ยน Entry/Exit ข้อมูล Area ไม่ reset ให้เหมือน Zone และไม่สามารถ save ได้ แม้จะยังไม่ถึงวัน start date https://app.clickup.com/t/86erctycw
                                                    setValue('zone_id', '');
                                                    setValue('area_id', '');
                                                    if (errors?.entry_exit_id) { clearErrors('entry_exit_id') }
                                                }}
                                                errors={errors?.entry_exit_id}
                                                errorsText={'Select Entry / Exit'}
                                                options={entryExitMasterData}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Entry / Exit'}
                                                pathFilter={'name'}
                                            />

                                        </div>

                                        <div className="col-span-2">
                                            <label htmlFor="description" className={labelClass}>
                                                {/* <span className="text-red-500">*</span> */}
                                                {`Description`}
                                            </label>

                                            <input
                                                id="description"
                                                type="text"
                                                placeholder='Enter Description'
                                                {...register('description')}
                                                readOnly={mode == 'view' ? true : false}
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 50) {
                                                        setValue('description', e.target.value);
                                                    }
                                                }}
                                                maxLength={50}
                                                className={`${inputClass} ${mode == 'view' && isReadOnly && '!bg-[#EFECEC]'} ${errors.description && 'border-red-500'}`}
                                            />

                                            <div className="flex justify-end text-[14px] text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">{watch('description')?.length || 0} / 50</span>
                                            </div>
                                            {/* {errors.description && <p className="text-red-500 text-sm">{`Enter Description`}</p>} */}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="zone_id"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Zone`}
                                            </label>
                                            {/* <Select
                                                id="zone_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("zone_id", { required: "Select Zone" })}
                                                disabled={isReadOnly}
                                                value={watch("zone_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.zone_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.zone_id && !watch('zone_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.zone_id && !watch("zone_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    const filteredArea = areaMasterData?.filter((item: any) => item.zone_id === e.target.value);
                                                    setAreaMaster(filteredArea)

                                                    if (watch("zone_id") != e.target.value) {
                                                        resetField("area_id")
                                                        setNominationPoints(data?.nomination_point_list || [])
                                                    }
                                                    setValue("zone_id", e.target.value);
                                                    // fetchData(e?.target);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Zone</Typography>;
                                                    }
                                                    // return zoneMasterData.find((item: any) => item.id === value)?.name || '';
                                                    return <span className={itemselectClass}>{zoneMaster.find((item: any) => item.id === value)?.name || ''}</span>
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                            // width: 250, // Adjust width as needed
                                                        },
                                                    },
                                                }}
                                            >
                                                {zoneMaster?.map((zone: any) => {
                                                    return (
                                                        <MenuItem key={zone.id} value={zone.id}>
                                                            <ListItemText primary={<Typography fontSize={14}>{zone?.name}</Typography>} />
                                                        </MenuItem>
                                                    )
                                                })}
                                            </Select>
                                            {errors.zone_id && (<p className="text-red-500 text-sm">{`Select Zone Name`}</p>)} */}

                                            <SelectFormProps
                                                id={'zone_id'}
                                                register={register("zone_id", { required: "Select Zone Name" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("zone_id") || ""}
                                                handleChange={(e) => {
                                                    const filteredArea = areaMasterData?.filter((item: any) => item.zone_id === e.target.value);
                                                    setAreaMaster(filteredArea)

                                                    if (watch("zone_id") != e.target.value) {
                                                        resetField("area_id")
                                                        setNominationPoints(data?.nomination_point_list || [])
                                                    }
                                                    setValue("zone_id", e.target.value);

                                                    if (errors?.zone_id) { clearErrors('zone_id') }
                                                }}
                                                errors={errors?.zone_id}
                                                errorsText={'Select Zone Name'}
                                                options={zoneMaster}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Zone Name'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="area_id"
                                                className={labelClass}
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Area`}
                                            </label>
                                            {/* <Select
                                                id="area_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("area_id", { required: "Select Area" })}
                                                disabled={isReadOnly}
                                                value={watch("area_id") || ""}
                                                className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errors.area_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.area_id && !watch('area_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.area_id && !watch("area_id") ? "#FF0000" : "#d2d4d8",
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    if (watch("area_id") != e.target.value) {
                                                        setNominationPoints(data?.nomination_point_list || [])
                                                    }
                                                    setValue("area_id", e.target.value);
                                                    // fetchData(e?.target);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>Select Area</Typography>;
                                                    }
                                                    // return areaMasterData.find((item: any) => item.id === value)?.name || '';
                                                    return <span className={itemselectClass}>{areaMaster.find((item: any) => item.id === value)?.name || ''}</span>;
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                            // width: 250, // Adjust width as needed
                                                        },
                                                    },
                                                }}
                                            >
                                                {
                                                    areaMaster?.length > 0 && areaMaster?.map((item: any) => {
                                                        return (
                                                            <MenuItem key={item.id} value={item.id}>
                                                                <ListItemText primary={<Typography fontSize={14}>{item.name}</Typography>} />
                                                            </MenuItem>
                                                        )
                                                    })
                                                }
                                            </Select>
                                            {errors.area_id && (<p className="text-red-500 text-sm">{`Select Area Name`}</p>)} */}

                                            <SelectFormProps
                                                id={'area_id'}
                                                register={register("area_id", { required: "Select Area Name" })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("area_id") || ""}
                                                handleChange={(e) => {
                                                    if (watch("area_id") != e.target.value) {
                                                        setNominationPoints([])
                                                    }
                                                    setValue("area_id", e.target.value);
                                                    if (errors?.area_id) { clearErrors('area_id') }
                                                }}
                                                errors={errors?.area_id}
                                                errorsText={'Select Area Name'}
                                                options={areaMaster}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Area Name'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="contract_point_start_date" className={labelClass}>
                                                <span className="text-red-500">*</span>{`Contract Point Start Date`}
                                            </label>
                                            <DatePickaForm
                                                {...register('contract_point_start_date', { required: "Select start date" })}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Contract Point Start Date"
                                                mode={mode}
                                                min={new Date()}
                                                valueShow={watch("contract_point_start_date") && dayjs(watch("contract_point_start_date")).format("DD/MM/YYYY")}
                                                allowClear
                                                isError={errors.contract_point_start_date && !watch("contract_point_start_date") ? true : false}
                                                onChange={(e: any) => {
                                                    setValue('contract_point_start_date', formatFormDate(e)),
                                                        e == undefined && setValue('contract_point_start_date', null, { shouldValidate: true, shouldDirty: true });

                                                    e == undefined && setValue('contract_point_end_date', null, { shouldValidate: true, shouldDirty: true });  // ถ้า start_date โดนเคลียร์ ให้เคลียร์ end_date ด้วย เพื่อป้องกันเลือก start_date หลัง end_date ได้
                                                }}
                                            />
                                            {errors.contract_point_start_date && !watch("contract_point_start_date") && <p className={`${textErrorClass}`}>{'Select Contract Point Start Date'}</p>}
                                            {/* {errors.contract_point_start_date && <p className="text-red-500 text-sm">{`Select Contract Point Start Date`}</p>} */}
                                        </div>

                                        <div>
                                            <label htmlFor="contract_point_end_date" className={`${labelClass} mb-[9px]`}>
                                                {`Contract Point End Date`}
                                            </label>
                                            <DatePickaForm
                                                {...register('contract_point_end_date')}
                                                // readOnly={isReadOnly}
                                                // readOnly={!formattedStartDate ? true : isReadOnly}
                                                readOnly={!formattedStartDate ? true : (isReadOnly && mode === "view")}
                                                placeHolder="Select Contract Point End Date"
                                                mode={mode}
                                                // min={formattedStartDate || undefined}
                                                min={isPastStartDate ? dayjs().add(1, 'day').format('YYYY-MM-DD') : formattedStartDate || undefined}
                                                // valueShow={dayjs(watch("contract_point_end_date")).format("DD/MM/YYYY")}
                                                valueShow={watch("contract_point_end_date") && dayjs(watch("contract_point_end_date")).format("DD/MM/YYYY")}
                                                allowClear
                                                onChange={(e: any) => { setValue('contract_point_end_date', formatFormDate(e)), e == undefined && setValue('contract_point_end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                        </div>

                                        <div className="my-2 col-span-2">
                                            <hr className="border-t border-[#58585A] w-full mx-auto" />
                                        </div>

                                        {/* DIVIDE WITH OR */}
                                        {/* <div className="flex items-center my-6">
                                            <hr className="flex-grow border-t border-gray-300" />
                                            <span className="mx-4 text-gray-500">OR</span>
                                            <hr className="flex-grow border-t border-gray-300" />
                                        </div> */}

                                        <div>
                                            <label htmlFor="nomination_point_start_date" className={labelClass}>
                                                {`Nomination Point Start Date`}
                                            </label>
                                            <DatePickaForm
                                                {...register('nomination_point_start_date')}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Nomination Point Start Date"
                                                mode={mode}
                                                // valueShow={watch("nomination_point_start_date") && dayjs(watch("nomination_point_start_date")).format("DD/MM/YYYY")}
                                                valueShow={watch("nomination_point_start_date") ? dayjs(watch("nomination_point_start_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                                allowClear
                                                onChange={(e: any) => {
                                                    setValue('nomination_point_start_date', formatFormDate(e)),
                                                        e == undefined && setValue('nomination_point_start_date', null, { shouldValidate: true, shouldDirty: true });
                                                    // watch("nomination_point_start_date") === undefined && setValue('nomination_point_end_date', null, { shouldValidate: true, shouldDirty: true })
                                                }}
                                            />
                                            {errors.nomination_point_start_date && <p className="text-red-500 text-[16px]">{`Select Nomination Point Start Date`}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor="nomination_point_end_date" className={labelClass}>
                                                {`Nomination Point End Date`}
                                            </label>
                                            <DatePickaForm
                                                {...register('nomination_point_end_date')}
                                                readOnly={isReadOnly}
                                                placeHolder="Select Nomination Point End Date"
                                                mode={mode}
                                                // valueShow={watch("nomination_point_end_date") && dayjs(watch("nomination_point_end_date")).format("DD/MM/YYYY")}
                                                valueShow={watch("nomination_point_end_date") ? dayjs(watch("nomination_point_end_date")).format("DD/MM/YYYY") : "Invalid Date"}
                                                allowClear
                                                onChange={(e: any) => { setValue('nomination_point_end_date', formatFormDate(e)), e == undefined && setValue('nomination_point_end_date', null, { shouldValidate: true, shouldDirty: true }); }}
                                            />
                                        </div>

                                        <div className="col-span-2 ">
                                            <div >
                                                <label htmlFor="nomPoint" className={labelClass}>
                                                    {`Nomination Point`}
                                                </label>
                                                <div className="flex items-center space-x-2 pb-3">
                                                    <Select
                                                        id="nomination_point"
                                                        multiple
                                                        displayEmpty
                                                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                        {...register("nomination_point")}
                                                        disabled={isReadOnly || !watch('nomination_point_start_date')}
                                                        value={watch("nomination_point") ? Array.isArray(watch("nomination_point")) ? watch("nomination_point") : [watch("nomination_point")] : []}
                                                        className={`flex-grow min-w-[0px] h-[44px] !rounded-lg text-gray-900 text-sm block outline-none ${isReadOnly && '!bg-[#EFECEC]'} ${errors.nomination_point && "border-red-500"}`}
                                                        style={{ backgroundColor: (isReadOnly || !watch('nomination_point_start_date')) ? '#EFECEC' : '#FFF' }}
                                                        sx={{
                                                            '.MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#DFE4EA', // Change the border color here
                                                            },
                                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: "#d2d4d8",
                                                            },
                                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                                borderColor: '#d2d4d8',
                                                            },
                                                            '&.Mui-disabled .MuiSelect-select': {
                                                                opacity: 1, // ยกเลิกความจางของ MUI
                                                                color: '#464255 !important', // สีที่คุณต้องการ
                                                                WebkitTextFillColor: '#464255 !important'
                                                            },
                                                        }}
                                                        onChange={(e: any) => {
                                                            const value = watch("nomination_point") ? Array.isArray(watch("nomination_point")) ? watch("nomination_point") : [watch("nomination_point")] : []
                                                            const selectedValues = e.target.value as string[];
                                                            let newValues;
                                                            if (selectedValues.includes("all")) {
                                                                newValues = value.length === nomSelectData.length ? [] : nomSelectData.map((item: any) => item.id);
                                                            } else {
                                                                newValues = selectedValues;
                                                            }

                                                            setValue("nomination_point", newValues);
                                                        }}
                                                        renderValue={(selected) => {
                                                            let selectedList = []
                                                            if (selected) {
                                                                if (Array.isArray(selected)) {
                                                                    selectedList = selected
                                                                }
                                                                else {
                                                                    selectedList = [selected]
                                                                }
                                                            }
                                                            if (selectedList.length === 0) {
                                                                return <Typography color="#9CA3AF" className={isReadOnly ? 'opacity-0' : 'opacity-100'} fontSize={14}>{watch('nomination_point_start_date') ? 'Select Nomination Point' : 'Select Nomination Point Start Date'}</Typography>;
                                                            }
                                                            const selectedOptions = nomSelectData?.filter((item: any) => selectedList.includes(item.id));
                                                            return (
                                                                <span className={itemselectClass}>
                                                                    {selectedOptions.map((option: any) => option.nomination_point).join(", ")}
                                                                </span>
                                                            );
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                                    // width: 250, // Adjust width as needed
                                                                },
                                                            },
                                                            autoFocus: false,
                                                            disableAutoFocusItem: true,
                                                        }}
                                                    >
                                                        {/* Select All Option */}
                                                        <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                                                            <Checkbox checked={(watch("nomination_point") ? Array.isArray(watch("nomination_point")) ? watch("nomination_point") : [watch("nomination_point")] : []).length === nomSelectData.length} sx={{ padding: "0px", marginRight: "8px" }} />
                                                            <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                                                        </MenuItem>

                                                        {/* Other Options */}
                                                        {nomSelectData?.slice() // เพื่อไม่เปลี่ยนต้นฉบับ
                                                            .sort((a: any, b: any) => {
                                                                const textA = (a?.nomination_point ?? '').toString().toLowerCase();
                                                                const textB = (b?.nomination_point ?? '').toString().toLowerCase();
                                                                return textA?.localeCompare(textB);
                                                            })?.map((item: any) => {
                                                                return (
                                                                    <MenuItem key={item?.id} value={item?.id} sx={{ fontSize: "14px", color: "#454255" }}>
                                                                        <Checkbox checked={(watch("nomination_point") ? Array.isArray(watch("nomination_point")) ? watch("nomination_point") : [watch("nomination_point")] : []).includes(item.id)} sx={{ padding: "0px", marginRight: "8px" }} />
                                                                        <ListItemText primary={item?.nomination_point} />
                                                                    </MenuItem>
                                                                )
                                                            })}
                                                    </Select>

                                                    <AddOutlinedIcon
                                                        sx={{ fontSize: 37 }}
                                                        className={`text-[#ffffff] border rounded-md p-1 ${isReadOnly || !watch('nomination_point') ? 'bg-[#B6B6B6] border-[#B6B6B6] pointer-events-none' : 'bg-[#24AB6A] border-[#24AB6A]'}`}
                                                        onClick={(isReadOnly || !watch('nomination_point')) ? undefined : addNomination}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative h-auto overflow-auto block rounded-t-md">
                                        <table className="w-full text-[16px] text-left rtl:text-right text-gray-500">
                                            <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-2">
                                                <tr>
                                                    <th className={`rounded-tl-[6px] font-light px-2 ${table_sort_header_style}`} onClick={() => handleSort("nomination_point_start_date", sortState, setSortState, setSortedData, nominationPoints)}>
                                                        {`Nomination Point Start Date`}
                                                        {getArrowIcon("nomination_point_start_date")}
                                                    </th>
                                                    <th className={`font-light px-2 ${table_sort_header_style}`} onClick={() => handleSort("nomination_point_end_date", sortState, setSortState, setSortedData, nominationPoints)}>
                                                        {`Nomination Point End Date`}
                                                        {getArrowIcon("nomination_point_end_date")}
                                                    </th>
                                                    <th className={`font-light px-2 ${table_sort_header_style}`} onClick={() => handleSort("nomination_point_end_id", sortState, setSortState, setSortedData, nominationPoints)}>
                                                        {`Nomination Point`}
                                                        {getArrowIcon("nomination_point_end_id")}
                                                    </th>
                                                    <th className={`font-light px-2 ${table_sort_header_style}`} onClick={() => handleSort("create_by_account.first_name", sortState, setSortState, setSortedData, nominationPoints)}>
                                                        {`Created by`}
                                                        {getArrowIcon("create_by_account.first_name")}
                                                    </th>

                                                    {
                                                        (mode !== 'view') && <th className="rounded-tr-[6px] font-light">
                                                            {`Delete`}
                                                        </th>
                                                    }

                                                </tr>
                                            </thead>
                                            <tbody>
                                                {nominationPoints?.map((point: any, index: number) => (
                                                    <tr key={`contract-nomination-point-${point.id}-${index}`}>
                                                        <td className={pxpyClass}>
                                                            {/* {point.start_date ? new Date(point.start_date).toLocaleDateString() : ''} */}
                                                            {point.start_date ? formatDateNoTime(point.start_date) : ''}
                                                        </td>

                                                        <td className={pxpyClass}>
                                                            {/* {point.end_date ? new Date(point.end_date).toLocaleDateString() : ''} */}
                                                            {point?.end_date ? formatDateNoTime(point?.end_date) : ''}
                                                        </td>

                                                        <td className={pxpyClass}>{point?.nomination_point}</td>

                                                        <td className={pxpyClass}>
                                                            <div>

                                                                {
                                                                    mode == 'create' ?
                                                                        <span className="text-[#464255]">
                                                                            {userDT ? `${userDT?.first_name} ${userDT?.last_name}` : ''}
                                                                        </span>
                                                                        :
                                                                        <span className="text-[#464255]">
                                                                            {/* {point.create_by ? `User ${point.create_by}` : ''} */}
                                                                            {point.create_by_account ? `${point?.create_by_account?.first_name} ${point?.create_by_account?.last_name}` : ''}
                                                                        </span>
                                                                }

                                                                <div className="text-gray-500 text-xs">
                                                                    {/* {point.nomination_point?.create_date ? new Date(point.nomination_point.create_date).toLocaleDateString() : '-'} */}
                                                                    {point?.create_date ? formatDateNoTime(point?.create_date) : '-'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {
                                                            (mode !== 'view') &&
                                                            <td className="px-2 py-1">
                                                                <DeleteOutlineOutlinedIcon
                                                                    className={`text-[${mode === 'edit' && data?.nomination_point_list?.some((item: any) => item.id == point.id) ? '#B6B6B6' : '#EA6060'}] bg-[#ffffff] border border-[#DFE4EA] rounded-md p-1 cursor-pointer`}
                                                                    onClick={() => mode === 'edit' && data?.nomination_point_list?.some((item: any) => item.id == point.id) ? {} : deleteNominationPoint(point.id, index)}
                                                                />
                                                            </td>
                                                        }
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* {
                                            nominationPoints?.length <= 0 && <div className="flex flex-col justify-center items-center w-[100%] pt-12">
                                                <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
                                                <div className="text-[16px] text-[#9CA3AF]">
                                                    No data.
                                                </div>
                                            </div>
                                        } */}

                                        {
                                            nominationPoints?.length <= 0 && <NodataTable />
                                        }
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        {
                                            mode === 'view' ?
                                                <button type="button" onClick={onClose} className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                    {`Close`}
                                                </button>
                                                :
                                                <button type="button" onClick={onClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                    {`Cancel`}
                                                </button>
                                        }

                                        {
                                            mode !== 'view' && (
                                                <button type="submit" className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                    {mode === 'create' ? 'Add' : 'Save'}
                                                </button>
                                            )
                                        }

                                        {/* {
                                            // v1.0.90 การเลือก Nomination Point ใน การ New หรือ Edit https://app.clickup.com/t/86errdaku
                                            mode !== 'view' && (
                                                <button
                                                    type="submit"
                                                    disabled={nominationPoints.length <= 0}
                                                    className={`w-[167px] font-semibold py-2 rounded-lg focus:outline-none 
                                                            ${nominationPoints.length <= 0
                                                            ? 'bg-gray-400 cursor-not-allowed text-white'
                                                            : 'bg-[#00ADEF] hover:bg-blue-600 focus:bg-blue-600 text-white'
                                                        }`}
                                                >
                                                    {mode === 'create' ? 'Add' : 'Save'}
                                                </button>
                                            )
                                        } */}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>

            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
                        }, 100);
                    }
                }}
                title="Confirm Save"
                description={
                    <div>
                        <div className="text-center">
                            {`Do you want to save the changes ? `}
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
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    // if (resetForm) resetForm();
                }}
                title="Failed"
                description={
                    <div>
                        {
                            modalErrorMsg?.split('<br/>').length > 1 ?
                                <ul className="text-start list-disc">
                                    {
                                        modalErrorMsg.split('<br/>').map(item => {
                                            return (
                                                <li>{item}</li>
                                            )
                                        })
                                    }
                                </ul>
                                :
                                <div className="text-center">
                                    {`${modalErrorMsg}`}
                                </div>
                        }
                    </div>
                }
                stat="error"
            />

        </Dialog>
    );
};

export default ModalAction;