import React from "react";
import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import { exportToExcel } from "@/utils/generalFormatter";
import dayjs from "dayjs";
import { NumericFormat } from "react-number-format";
import { postService } from "@/utils/postService";
import ModalComponent from "@/components/other/ResponseModal";
import getUserValue from "@/utils/getuserValue";
import SelectFormProps from "@/components/other/selectProps";
import MonthYearPickaSearch from "@/components/library/dateRang/monthYearPicker";
import { unitMaster2 } from "./mockData";
import TableDetailNote from "./tableDetailNote";
import TuneIcon from "@mui/icons-material/Tune";
import ColumnVisibilityPopover from "@/components/other/popOverShowHideCol";
import ModalConfirmSave from "@/components/other/modalConfirmSave";
import BtnGeneral from "@/components/other/btnGeneral";

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    dataTable?: any;
    dataShipper?: any;
    dataCndnType?: any;
    dataTypeCharge?: any;
    isModalErrorOpen?: any;
    userPermission: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode,
    data = {
        // rows: [
        //     { nomination_point_id: "", nomination_point: "", heating_value: "", volume: "", unit: "", cal_volume: "", unit2: "" },
        // ]
    },
    dataTable = {},
    open,
    dataShipper,
    dataCndnType,
    dataTypeCharge,
    isModalErrorOpen,
    userPermission,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, resetField, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, mode: 'onSubmit' });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "rows",
    });
    const { onChange, ...restMonthYearPick } = register("month_year_pick"); // register email

    const userDT: any = getUserValue();
    const [modaSubmitConfirm, setModaSubmitConfirm] = useState<any>(false)
    const labelClass = "block mb-2 text-sm font-light";
    const inputClass = "text-sm block md:w-full !text-[14px] p-2 ps-5 pe-10 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const [key, setKey] = useState(0);
    const [srchStartDate, setSrchStartDate] = useState<Date | null>();
    const [editTableData, setEditTableData] = useState<any>([])
    const [dataTariffId, setDataTariffId] = useState<any>([])
    const [dataContractData, setDataContractData] = useState<any>([])
    const [editTableDataTemp, setEditTableDataTemp] = useState<any>([])
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [disableGenBtn, setDisableGenBtn] = useState(true);
    const [canAdd, setCanAdd] = useState<any>(false)
    const [unitData, setUnitData] = useState<any>(unitMaster2)

    const [selectedContractCode, setSelectedContractCode] = useState<any>('')
    const [selectedTermType, setSelectedTermType] = useState<any>({})
    const [exportExtraObj, setExportExtraObj] = useState<any>({})

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    // const isReadOnly = (mode === "view" || mode === 'edit');
    const isReadOnly = (mode === "view");

    const [oldComment, setOldComment] = useState<any>('')
    const [tariffIdText, setTariffIdText] = useState<any>(undefined)

    // editTableDataTemp : editTableData

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode == 'create') {
                setValue("shipper_id", undefined);

                clearErrors();
            } else if (mode === "edit" || mode === "view") {

                setValue("shipper_id", data?.shipper_id || "");
                setValue("month_year_pick", data?.month_year_charge || "");
                setSrchStartDate(data?.month_year_charge)
                setValue("cndn_id", data?.cndn_id || "");
                setValue("cndn_type", data?.tariff_credit_debit_note_type?.id || "");
                // setValue("tariff_id", data?.id || "");
                setValue("type_change", data?.tariff_type_charge_id || "");
                setValue("comment", data?.tariff_credit_debit_note_comment?.length > 0 ? data?.tariff_credit_debit_note_comment?.[data?.tariff_credit_debit_note_comment?.length - 1]?.comment : '');
                setOldComment(data?.tariff_credit_debit_note_comment?.length > 0 ? data?.tariff_credit_debit_note_comment?.[data?.tariff_credit_debit_note_comment?.length - 1]?.comment : '')

                const find_type_charge = dataTypeCharge?.find((item: any) => item?.id == data?.tariff_type_charge_id)
                const find_shipper = dataShipper?.find((item: any) => item?.id == data?.shipper_id)
                setExportExtraObj(
                    {
                        "shipper_name": find_shipper?.name,
                        "month_year_change": data?.month_year_charge ? dayjs(data?.month_year_charge).format("MMMM YYYY") : '-',
                        "cndn_id": data?.cndn_id,
                        "cndn_type": data?.tariff_credit_debit_note_type?.name,
                        "tariff_id": '',
                        "type_change": find_type_charge?.name,
                        "comment": data?.tariff_credit_debit_note_comment?.length > 0 ? data?.tariff_credit_debit_note_comment?.[data?.tariff_credit_debit_note_comment?.length - 1]?.comment : '',
                    }
                )

                // เอา data?.tariff_credit_debit_note_detail ไป map เพื่อ setEditTableData,  setEditTableDataTemp
                // const newRow = [{
                //     id: tariff_credit_debit_note_detail?.id,
                //     contract_code_id: tariff_credit_debit_note_detail?.contract_code_id,
                //     contract_code: selectedContractCode,
                //     quantity: tariff_credit_debit_note_detail?.quantity,
                //     unit: tariff_credit_debit_note_detail?.unit,
                //     fee: tariff_credit_debit_note_detail?.fee,
                //     amount: tariff_credit_debit_note_detail?.amount,
                //     term_type: tariff_credit_debit_note_detail?.term_type_id,
                //     term_obj: selectedTermType
                // }];

                let res_contract_data: any
                if (data?.month_year_charge && data?.shipper_id) {

                    const body_post = {
                        "month_year": dayjs(data?.month_year_charge).format('YYYY-MM-DD'), // YYYY-MM-01
                        "shipper_id": data?.shipper_id
                    }
                    res_contract_data = await postService(`/master/tariff/tariffCreditDebitNote/selectContract`, body_post);
                }

                const newRows = data?.tariff_credit_debit_note_detail?.map((item: any) => {
                    const find_contract = res_contract_data?.find((itemx: any) => itemx.id == item?.contract_code_id)
                    // setSelectedTermType(find_contract?.term_type)
                    // setSelectedContractCode(find_contract?.contract_code)
                    return (
                        {
                            id: item.id,
                            contract_code_id: item?.contract_code_id,
                            contract_code: find_contract?.contract_code,
                            quantity: item.quantity,
                            unit: item.unit,
                            fee: item.fee,
                            amount: item.amount,
                            term_type: find_contract?.term_type?.id,
                            term_obj: find_contract?.term_type
                        }
                    )
                });

                setEditTableData(newRows);
                setEditTableDataTemp(newRows);

                // setValue("contract_code_id", data?.contract_code.id || "");
                // setValue("document_type", data?.nomination_type?.id || "");
                // setValue("comment", data?.upload_template_for_shipper_comment?.length > 0 ? data?.upload_template_for_shipper_comment?.[0]?.comment : '');
                // {setFileName(data?.upload_template_for_shipper_file?.length > 0 && data?.upload_template_for_shipper_file?.[0]?.url !== null ? cutUploadFileName(data?.upload_template_for_shipper_file?.[0]?.url) : 'Maximum File 10 MB')}
            }
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    useEffect(() => {
        if (userDT?.account_manage?.[0]?.user_type_id === 3) {
            setValue("shipper_id", [userDT?.account_manage?.[0]?.group_id]);
        }
    }, [])

    // #region handleClose
    const handleClose = () => {
        onClose();

        setTimeout(() => {
            setSrchStartDate(null)
            setKey((prevKey) => prevKey + 1);
            reset();
            setEditTableData([])
            setEditTableDataTemp([])

            setValue('shipper_id', null)

            setIsEditing(false)
            setIsEditedInRow(false)
            // fields.forEach((_, index) => remove(index));
            setResetForm(() => reset);

        }, 300);

    };

    // #region COLUMN SHOW/HIDE
    // ############### COLUMN SHOW/HIDE ###############
    const initialColumns: any = [
        { key: 'contract_code', label: 'Contract Code', visible: true },
        { key: 'contract_type', label: 'Contract Type', visible: true },
        { key: 'quantity', label: 'Quantity', visible: true },
        { key: 'unit', label: 'Unit', visible: true },
        { key: 'fee_baht', label: 'Fee (Baht/MMBTU)', visible: true },
        { key: 'amount_baht', label: 'Amount (Baht)', visible: true },
        { key: 'edit', label: 'Edit', visible: true },
    ];

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openPop = Boolean(anchorEl);
    const id = openPop ? 'column-toggle-popover' : undefined;

    const filteredColumns = mode === "view" ? initialColumns?.filter((col: any) => col.key !== "edit") : initialColumns;

    const [columnVisibility, setColumnVisibility] = useState<any>(
        // Object.fromEntries(initialColumns.map((column: any) => [column.key, column.visible]))
        Object.fromEntries(filteredColumns?.map((column: any) => [column.key, column.visible]))
    );

    const handleTogglePopover = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleColumnToggle = (columnKey: string) => {
        setColumnVisibility((prev: any) => ({
            ...prev,
            [columnKey]: !prev[columnKey]
        }));
    };

    // ################ CHECKBOX FUNCTION ################
    const [selectedRows, setSelectedRows] = useState<number[]>([]);

    // Function to toggle selection of a row
    const handleCheckboxChange = (id: number) => {
        if (selectedRows.includes(id)) {
            setSelectedRows(selectedRows.filter((selectedId) => selectedId !== id));
        } else {
            setSelectedRows([...selectedRows, id]);
        }
    };

    // Function to delete selected rows
    const deleteSelectedRows = () => {
        const updatedData = editTableData?.filter((_: any, index: any) => !selectedRows.includes(index));
        setEditTableData(updatedData); // Update the state of `dataInTable`
        setEditTableDataTemp(updatedData);
        setSelectedRows([]); // Reset the selection
    };

    // Handle Select All checkbox
    const handleSelectAll = () => {
        if (selectedRows.length === editTableData?.length) {
            setSelectedRows([]); // Deselect all
        } else {
            setSelectedRows(editTableData?.map((_: any, index: any) => index)); // Select all
        }
    };

    const isAllSelected = editTableData?.length > 0 && selectedRows.length === editTableData?.length;

    // ===================== EDIT BTN =====================
    const [isEditing, setIsEditing] = useState(false); // ถ้ากด edit isEditing จะเป็น true
    const [isEditedInRow, setIsEditedInRow] = useState(false); // ถ้าแก้ไขข้อมูลใน row จะเป็น true
    const [isSaveClick, setIsSaveClick] = useState(false); // ถ้ากด edit isEditing จะเป็น true
    const [rowEditing, setRowEditing] = useState<any>(); // เก็บ id ของ record ที่ edit

    const handleEditClick = (rowId: any) => {
        if (!rowEditing || rowId == rowEditing) {
            setIsEditing(!isEditing);
        }
        setRowEditing(rowId);
    };

    const handleSaveClick = async (rowId?: any) => {
        setEditTableData([...editTableDataTemp]);
        setIsEditing(!isEditing);
        setRowEditing(undefined);
    }

    const handleCancelClick = (rowId: any) => {
        setIsEditing(!isEditing);
        setRowEditing(undefined)
        setIsEditedInRow(false)
    };

    const handleSetTempData = (rowId: any, value: any, type_key: any) => {

        // แก้ไข editTableData ตาม value ให้ตรง key ที่ได้มา 
        setEditTableDataTemp((prevData: any) => {
            return prevData.map((row: any) => {

                // type_key == 'fee'
                // type_key == 'quantity'
                let amount = 0
                switch (type_key) {
                    case 'fee':
                        amount = value * parseFloat(row?.quantity)
                        break;
                    case 'quantity':
                        amount = value * parseFloat(row?.fee)
                        break;

                    default:
                        break;
                }

                return row.id === rowId
                    ? {
                        ...row,
                        [type_key]: value,
                        "amount": amount // New/Edit : เพิ่มเงื่อนไขให้ช่อง Amount Cal ค่าให้ Auto (QuantityxFee) https://app.clickup.com/t/86evh20fn
                    }
                    : row
            }
            )
        }

        );

        // ถ้าแก้ไข เปิดปุ่ม save draft
        setIsEditedInRow(true)
    };

    // #region handle submit
    {/* Confirm Save */ }
    const handleSaveConfirm = async (data?: any) => {

        // Edit > ตอน Edit ไม่ได้มีการแก้ไขข้อมูล comment มันต้องไม่บันทึกซ้ำ https://app.clickup.com/t/86euqk751
        let comment: any = [];
        const currentComment = watch("comment");
        if (currentComment && currentComment !== oldComment) {
            comment = [{ "comment": currentComment }];
        }


        let data_post = {
            "shipper_id": watch('shipper_id'),
            "month_year_charge": dayjs(watch("month_year_pick")).format('YYYY-MM-DD'), // YYYY-MM-01
            "cndn_id": watch('cndn_id'),
            "tariff_credit_debit_note_type_id": watch("cndn_type"), // 1 credit note | 2 debit note
            "tariff_type_charge_id": watch("type_change"),
            "filter_tariff_id": tariffIdText ? tariffIdText : null,
            detail: editTableData?.map((row: any) => ({
                quantity: row.quantity ?? null,
                unit: row.unit ?? null,
                fee: row.fee ?? null,
                amount: row.amount ?? null,
                contract_code_id: row.contract_code_id ?? null, // ถ้าไม่มี ใส่ null
                term_type: row.term_type ?? null,
            })),
            // "comments": [ // ส่ง comment มาเป็น array
            //     {
            //         // "comment": watch("comment") ? watch("comment") : '' 
            //         "comment": watch("comment") ? watch("comment") : ''
            //     }
            // ]
            "comments": comment
        }

        if (mode == 'create') {
            await onSubmit(data_post);

            setTimeout(() => {
                // clear data after submit
                setSrchStartDate(null)
                setKey((prevKey) => prevKey + 1);
                reset();
                setEditTableData([])
                setEditTableDataTemp([])
                setValue('shipper_id', null)

                setIsEditing(false)
                setIsEditedInRow(false)

            }, 300);
        } else {
            setDataSubmit(data_post)
            setModaConfirmSave(true)
        }
    }

    // #region GENERATE
    const handleGenerateData = async () => {
        // const body_gen = {
        //     "month_year": dayjs(watch("month_year_pick")).format('YYYY-MM-DD'), // YYYY-MM-01
        //     "shipper_id": watch('shipper_id'), // id shipper
        //     "tariff_id": watch("tariff_id"), // id tariff
        //     "tariff_type_charge": watch('type_change') // type charge
        // }

        const body_gen = {
            "month_year": dayjs(watch("month_year_pick")).format('YYYY-MM-DD'), // YYYY-MM-01
            "shipper_id": watch('shipper_id'),
            "tariff_type_charge_id": watch('type_change'),
            "type_id": watch("tariff_id") // มันคือ tariff id
        }

        const res_data_detail = await postService(`/master/tariff/tariffCreditDebitNote/genData`, body_gen);
        addNewDataToState(res_data_detail);

        setDisableGenBtn(true) // gen แล้วปิดปุ่ม
    }

    // #region ตอน gen
    // เอาข้อมูล new_data ไปใส่ใน state คีย์ตามที่ให้ไป โดยมีเงื่อนไขการเช็คซ้ำคือ
    // ถ้า new_data.contract_code.id มีอยู่แล้วใน editTableData ก็ไม่ต้องใส่ไป
    const addNewDataToState = (new_data: any[]) => {
        // จังหวะกด gen มาที่นี่

        const id_: any = Date.now()
        // setEditTableData((prev: any) => {
        //     // const updated = [...prev];
        //     const updated = [...(Array.isArray(prev) ? prev : [])];

        //     new_data.forEach((item) => {
        //         // const exists = updated.some((row) => row.contract_code_id === item?.contract_code.id); // เดิม ๆ

        //         const contractId = item?.contract_code?.id ?? null;
        //         if (!contractId) return;

        //         const exists = updated.some((row) => row.contract_code_id === contractId);

        //         if (!exists) {
        //             updated.push({
        //                 // id: Date.now(), // gen id ใหม่กันชนกัน
        //                 // id: id_, // gen id ใหม่กันชนกัน
        //                 id: id_ + item.id, // gen id ใหม่กันชนกัน
        //                 contract_code_id: item?.contract_code ? item?.contract_code.id : null,
        //                 contract_code: item?.contract_code ? item?.contract_code.contract_code : null,
        //                 quantity: item.quantity,
        //                 unit: item.unit,
        //                 fee: item.fee,
        //                 amount: item.amount,
        //                 term_type: item.term_type.id,
        //                 term_obj: item.term_type
        //             });
        //         }
        //     });

        //     return updated;
        // });

        // setEditTableDataTemp((prev: any) => {
        //     // const updated = [...prev];
        //     const updated = [...(Array.isArray(prev) ? prev : [])];

        //     new_data.forEach((item) => {
        //         // const exists = updated.some((row) => row.contract_code_id === item?.contract_code.id);

        //         const contractId = item?.contract_code?.id ?? null;
        //         if (!contractId) return;

        //         const exists = updated.some((row) => row.contract_code_id === contractId);

        //         if (!exists) {
        //             updated.push({
        //                 // id: Date.now(), // gen id ใหม่กันชนกัน
        //                 // id: id_, // gen id ใหม่กันชนกัน
        //                 id: id_ + item.id, // gen id ใหม่กันชนกัน
        //                 contract_code_id: item?.contract_code ? item?.contract_code.id : null,
        //                 contract_code: item?.contract_code ? item?.contract_code.contract_code : null,
        //                 quantity: item.quantity,
        //                 unit: item.unit,
        //                 fee: item.fee,
        //                 amount: item.amount,
        //                 term_type: item.term_type.id,
        //                 term_obj: item.term_type
        //             });
        //         }
        //     });

        //     return updated;
        // });

        // R : New > กรณีที่เปลี่ยนข้อมูล Type Charge กับ Tariff ID แล้วกด Gen ใหม่ ข้อมูลใน Table ไม่ update แล้วพอ cancel แล้วกด new มาใหม่ ข้อมูลก็ไม่ขึ้นเลย เหมือนข้อมูลมันค้างอยู่ (ถ้างงตอนทำมาถาม) https://app.clickup.com/t/86euqjn55
        setEditTableData(() => {
            return new_data
                .map(item => {
                    const contractId = item?.contract_code?.id ?? null;
                    if (!contractId) return null; // skip ถ้าไม่มี contract_code

                    return {
                        id: id_ + item.id, // gen id ใหม่
                        contract_code_id: contractId,
                        contract_code: item?.contract_code.contract_code,
                        quantity: item.quantity,
                        unit: item.unit,
                        fee: item.fee,
                        amount: item.amount,
                        term_type: item.term_type.id,
                        term_obj: item.term_type
                    };
                })
                .filter(Boolean); // remove nulls
        });

        setEditTableDataTemp(() => {
            return new_data
                .map(item => {
                    const contractId = item?.contract_code?.id ?? null;
                    if (!contractId) return null; // skip ถ้าไม่มี contract_code

                    return {
                        id: id_ + item.id, // gen id ใหม่
                        contract_code_id: contractId,
                        contract_code: item?.contract_code.contract_code,
                        quantity: item.quantity,
                        unit: item.unit,
                        fee: item.fee,
                        amount: item.amount,
                        term_type: item.term_type.id,
                        term_obj: item.term_type
                    };
                })
                .filter(Boolean); // remove nulls
        });
    };

    const handleGetTariffId = async () => {
        // DATA TARIFF ID
        // tariff/tariffCreditDebitNote/selectTariffId
        const body_post = {
            "month_year": dayjs(watch("month_year_pick")).format('YYYY-MM-DD'), // YYYY-MM-01
            "shipper_id": watch('shipper_id')
        }

        const res_tariff_id = await postService(`/master/tariff/tariffCreditDebitNote/selectTariffId`, body_post);
        setDataTariffId(res_tariff_id)
    }

    const handleGetContract = async () => {
        const body_post = {
            "month_year": dayjs(watch("month_year_pick")).format('YYYY-MM-DD'), // YYYY-MM-01
            "shipper_id": watch('shipper_id')
        }
        const res_contract_data = await postService(`/master/tariff/tariffCreditDebitNote/selectContract`, body_post);
        setDataContractData(res_contract_data)
    }

    // #region กรอง contract code ออกจาก select
    // New > กรณีที่ใน Table มีข้อมูลของ Contract Code เลขที่นั้น, และ Unit นั้นแล้ว ระบบต้องไม่มีข้อมูลชุดนั้นแสดงให้เลือกอีก https://app.clickup.com/t/86euqk36r
    const getAvailableContracts = (dataContractData: any[], editTableData: any[]) => {
        const excludeIds = new Set(editTableData?.map(item => item?.contract_code_id));
        return dataContractData.filter(item => !excludeIds.has(item.id));
    }

    // New > กรณีที่ใน Table มีข้อมูลของ Contract Code เลขที่นั้น, และ Unit นั้นแล้ว ระบบต้องไม่มีข้อมูลชุดนั้นแสดงให้เลือกอีก https://app.clickup.com/t/86euqk36r
    const getAvailableContracts2 = (dataContractData: any[], editTableData: any[]) => {
        const excludeIds = new Set(
            editTableData
                ?.filter(item => item.unit && item?.contract_code_id) // มี unit
                .map(item => item?.contract_code_id)
        );

        // group unit per contract_code_id
        const unitsByContractId = editTableData?.reduce((acc, item) => {
            if (!acc[item?.contract_code_id]) acc[item?.contract_code_id] = new Set();
            acc[item?.contract_code_id].add(item.unit);
            return acc;
        }, {} as Record<number, Set<string>>);

        const filtered = dataContractData?.filter(item => {
            // ถ้า contract_id อยู่ใน editTableData
            if (excludeIds.has(item.id)) {
                const units = unitsByContractId[item.id] || new Set();
                // ถ้า unit มีแค่ตัวเดียว ให้ยังไม่กรองออก
                if (units.size < 2) return true;
                // ถ้า unit มีครบ 2 ตัว ("MMBTU" + "MMSCF") ให้กรองออก
                return false;
            }
            return true; // contract_id ไม่อยู่ใน editTableData => keep
        });

        ;
        return filtered
    }

    const filteredUnitByContract = (dataContractData: any[], editTableData: any[], contract_id: any) => {
        const usedUnits = editTableData?.find((item: any) => item?.contract_code_id == contract_id);
        const availableUnits = unitMaster2.filter((item: any) => item?.name !== usedUnits?.unit)
        setUnitData(availableUnits)
    }

    useEffect(() => {
        if (watch('shipper_id') && watch("month_year_pick")) {
            handleGetTariffId();
            handleGetContract();
        } else {
            setDataTariffId([])
            setDataContractData([])
        }
    }, [watch('shipper_id'), watch("month_year_pick")])

    useEffect(() => {
        if (watch('contract_code_id') && watch("quantity") && watch("unit") && watch("fee") && watch("amount")) {
            setCanAdd(true)
        } else {
            setCanAdd(false)
        }
    }, [watch('contract_code_id'), watch('quantity'), watch('unit'), watch('fee'), watch('amount')])

    // #region เปิด-ปิดปุ่ม gen
    useEffect(() => {
        if (watch('shipper_id') && watch("tariff_id") && watch("month_year_pick") && watch("cndn_type") && watch("type_change")) {
            setDisableGenBtn(false)
        } else {
            setDisableGenBtn(true)
        }
    }, [watch('shipper_id'), watch('tariff_id'), watch('month_year_pick'), watch("cndn_type"), watch("type_change")])

    useEffect(() => {
        if (dataTariffId?.length > 0) {
            const tariff_id_filter = dataTariffId?.filter((item: any) => item.id === watch('tariff_id'))
            setTariffIdText(tariff_id_filter[0]?.tariff_id)
        } else if (!watch("tariff_id") || !dataTariffId) {
            setTariffIdText(undefined)
        }
    }, [dataTariffId, watch("tariff_id")])

    return (
        <>
            <Dialog
                open={open}
                onClose={() => {
                    handleClose();
                }}
                className="relative z-20"
            >
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                />
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
                    <div className="flex min-h-full items-center justify-center p-4 text-center ">
                        <DialogPanel
                            transition
                            className="relative min-w-[1400px] max-w-[1500px] bg-white transform transition-all rounded-[20px] text-left shadow-lg data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:w-[90%] lg:max-w-3xl"
                        >
                            <div className="flex flex-col items-center justify-center p-4 gap-4 ">
                                <form
                                    // onSubmit={handleSubmit(handleSubmitConfirm)}
                                    onSubmit={handleSubmit(handleSaveConfirm)}
                                    // onSubmit={(data:any) => handleFormSubmit(data)}
                                    // onSubmit={(data: any) => {
                                    //     // open submit confirm
                                    //     handleSubmitConfirm(data)

                                    //     // handleSubmit(async (data) => { // clear state when submit
                                    //     //      
                                    //     //     onSubmit(data);
                                    //     //     // setIsLoading(true);
                                    //     //     setTimeout(async () => {
                                    //     //         handleClose();
                                    //     //     }, 1000);
                                    //     // })
                                    // }}
                                    className="bg-white p-6  w-full "
                                >
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00ADEF] mb-4 ">
                                        {mode === "create" ? `New Credit/Debit Note` : mode === "edit" ? "Edit Credit/Debit Note" : "View Credit/Debit Note"}
                                    </h2>

                                    {
                                        mode == 'view' && <div className="flex flex-wrap gap-2 justify-end">
                                            <BtnGeneral
                                                bgcolor={"#24AB6A"}
                                                modeIcon={'export'}
                                                textRender={"Export"}
                                                generalFunc={() =>
                                                    exportToExcel(
                                                        editTableData,
                                                        'view_credit_debit_note',
                                                        columnVisibility,
                                                        exportExtraObj
                                                    )
                                                }
                                                can_export={userPermission ? userPermission?.f_export : false}
                                            />
                                        </div>
                                    }

                                    <div className="grid gap-4 grid-cols-4">
                                        <div>
                                            <label
                                                htmlFor="shipper_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span> {`Shipper Name`}
                                            </label>

                                            <SelectFormProps
                                                id={'shipper_id'}
                                                register={register("shipper_id", { required: "Select Shipper Name" })}
                                                disabled={mode == 'view' || mode == 'edit' || userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                                // valueWatch={watch("shipper_id") || ""}
                                                valueWatch={userDT?.account_manage?.[0]?.user_type_id == 3 ? userDT?.account_manage?.[0]?.group?.id_name : watch("shipper_id")}
                                                handleChange={(e) => {
                                                    setValue('shipper_id', e.target.value)

                                                    // ถ้าเปลี่ยน shipper_id เคลียร์ tariff_id ด้วย
                                                    setValue("tariff_id", null);
                                                    setValue("contract_code_id", null);
                                                    setEditTableData([])
                                                    setEditTableDataTemp([])
                                                    if (errors?.shipper_id) { clearErrors('shipper_id') }
                                                }}
                                                errors={errors?.shipper_id}
                                                errorsText={'Select Shipper Name'}
                                                options={dataShipper?.filter((item: any) => // เห็นแค่ชื่อตัวเอง
                                                    userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true
                                                )}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Shipper Name'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        {
                                            (mode == 'edit' || mode == 'view') ?
                                                <div>
                                                    <label htmlFor="group_id" className="block text-sm pb-2 font-light">Month/Year Charge</label>
                                                    <div className="rounded-lg w-full h-[44px] px-4 py-3 bg-[#F1F1F1]">
                                                        {watch('month_year_pick') ? dayjs(watch('month_year_pick')).format("MMMM YYYY") : ''}
                                                    </div>
                                                </div>
                                                : <div>
                                                    <label htmlFor="group_id" className="block text-sm font-light"></label>
                                                    <MonthYearPickaSearch
                                                        key={"start" + key}
                                                        label={'Month/Year Charge'}
                                                        placeHolder={'Select Month/Year Charge'}
                                                        mode={mode}
                                                        valueShow={srchStartDate}
                                                        allowClear
                                                        // min={dataTable?.date_balance}
                                                        // max={endOfMonth}
                                                        customWidth={318}
                                                        customHeight={44}
                                                        // onChange={(e: any) => {
                                                        //     setSrchStartDate(e ? e : null)
                                                        //     setValue("group_id", undefined);
                                                        //     findShipperOnMonth(e)
                                                        // }}
                                                        onChange={(e) => {
                                                            setSrchStartDate(e ? e : null)
                                                            setValue('month_year_pick', e)

                                                            // ถ้าเปลี่ยน Month/Year Charge เคลียร์ tariff_id ด้วย
                                                            setValue("tariff_id", null);
                                                            setValue("contract_code_id", null);
                                                            setEditTableData([])
                                                            setEditTableDataTemp([])
                                                        }}
                                                        {...restMonthYearPick}
                                                    />
                                                </div>
                                        }

                                        <div>
                                            <label
                                                htmlFor="cndn_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                {`CNDN ID`}
                                            </label>
                                            <input
                                                id="cndn_id"
                                                {...register("cndn_id", { required: false })}
                                                type="text"
                                                placeholder="Enter CNDN ID"
                                                readOnly={isReadOnly}
                                                maxLength={200}
                                                onChange={(e) => {
                                                    setValue('cndn_id', e.target.value);
                                                }}
                                                className={`text-[16px] border-[1px] border-[#DFE4EA]  bg-white ps-[21px] h-[46px] w-full rounded-lg outline-none bg-opacity-100 focus:border-[#00ADEF] ${errors.cndn_id && "border-red-500"} ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="cndn_type"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`CNDN Type`}
                                            </label>

                                            <SelectFormProps
                                                id={'cndn_type'}
                                                register={register("cndn_type", { required: "Select CNDN Type" })}
                                                disabled={isReadOnly || mode === 'edit'}
                                                valueWatch={watch("cndn_type") || ""}
                                                handleChange={(e) => {
                                                    setValue("cndn_type", e.target.value);
                                                    if (errors?.cndn_type) { clearErrors('cndn_type') }
                                                }}
                                                errors={errors?.cndn_type}
                                                errorsText={'Select CNDN Type'}
                                                // options={dataUserType?.length > 0 ? dataUserType : []}
                                                options={dataCndnType}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select CNDN Type'}
                                                pathFilter={'name'}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 grid-cols-4 pt-2">
                                        {/* New > สลับเอา field Type Charge ขึ้นมาก่อน เพราะ Tariff ID ต้องกรองมาจาก Type Charge https://app.clickup.com/t/86euqf5td */}
                                        <div>
                                            <label
                                                htmlFor="type_change"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Type Charge`}
                                            </label>

                                            <SelectFormProps
                                                id={'type_change'}
                                                register={register("type_change", { required: "Select Type Charge" })}
                                                disabled={isReadOnly || mode === 'edit'}
                                                valueWatch={watch("type_change") || ""}
                                                handleChange={(e) => {
                                                    if(mode === "create"){
                                                        setEditTableDataTemp([])
                                                        setEditTableData([])
                                                    }
                                                    setValue("type_change", e.target.value);
                                                    if (errors?.type_change) { clearErrors('type_change') }
                                                }}
                                                errors={errors?.type_change}
                                                errorsText={'Select Type Charge'}
                                                // options={dataUserType?.length > 0 ? dataUserType : []}
                                                options={dataTypeCharge}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Type Charge'}
                                                pathFilter={'name'}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="tariff_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                {`Tariff ID`}
                                            </label>

                                            <SelectFormProps
                                                id={'tariff_id'}
                                                register={register("tariff_id", { required: false })}
                                                disabled={isReadOnly}
                                                valueWatch={watch("tariff_id") || ""}
                                                handleChange={(e) => {
                                                    setValue("tariff_id", e.target.value);
                                                    if (errors?.tariff_id) { clearErrors('tariff_id') }
                                                }}
                                                errors={errors?.tariff_id}
                                                errorsText={'Select Tariff ID'}
                                                // options={dataUserType?.length > 0 ? dataUserType : []}
                                                options={dataTariffId}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'tariff_id'}
                                                optionsResult={'tariff_id'}
                                                placeholder={'Select Tariff ID'}
                                                pathFilter={'tariff_id'}
                                            />
                                        </div>

                                        <div className="pt-7">
                                            <BtnGeneral
                                                textRender={"Gen"}
                                                iconNoRender={true}
                                                bgcolor={"#1473A1"}
                                                generalFunc={() => handleGenerateData()}
                                                // disable={urlForApprove == '' ? true : false} 
                                                disable={disableGenBtn || mode == 'view'}
                                                can_create={userPermission ? userPermission?.f_create : false}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 grid-cols-4 pt-2 pb-2">
                                        <div className="col-span-4">
                                            <label className={labelClass}>{`Comment`}</label>
                                            <TextField
                                                {...register("comment")}
                                                value={watch("comment") || ""}
                                                label=""
                                                multiline
                                                onChange={(e) => {
                                                    if (e.target.value.length <= 500) {
                                                        setValue("comment", e.target.value);
                                                    }
                                                }}
                                                placeholder="Enter Comment"
                                                disabled={isReadOnly}
                                                rows={1}
                                                sx={{
                                                    '.MuiOutlinedInput-root': {
                                                        borderRadius: '8px',
                                                    },
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA',
                                                        borderColor: errors.remark && !watch('remark') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.remark && !watch("remark") ? "#FF0000" : '#DFE4EA !important',
                                                    },
                                                    '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                        borderColor: '#00ADEF',
                                                    },
                                                    '&.MuiInputBase-input::placeholder': {
                                                        color: '#9CA3AF', // Placeholder color
                                                        fontSize: '14px', // Placeholder font size
                                                    },
                                                    '& .Mui-disabled': {
                                                        color: '#58585A', // Disabled text color
                                                    },
                                                    "& .MuiOutlinedInput-input::placeholder": {
                                                        fontSize: "14px",
                                                    },
                                                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                        borderColor: "#00ADEF !important", // 👈 force black border on focus
                                                        borderWidth: '1px', // 👈 Force border 1px on focus
                                                    },
                                                }}
                                                fullWidth
                                                className={`rounded-lg ${isReadOnly && '!bg-[#EFECEC]'}`}
                                            />
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">
                                                    {watch("comment")?.length || 0} / 500
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full h-[300px] border rounded-[10px] p-4 overflow-y-auto">
                                        <span className="font-semibold text-[#464255] text-[16px]">Details Note</span>

                                        {
                                            mode !== 'view' && <div className="grid gap-2 grid-cols-[230px_230px_230px_230px_230px_100px] pt-2 pb-2">
                                                <div>
                                                    <label
                                                        htmlFor="contract_code_id"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        {`Contract Code`}
                                                    </label>

                                                    <SelectFormProps
                                                        id={'contract_code_id'}
                                                        register={register("contract_code_id", { required: false })}
                                                        disabled={false}
                                                        valueWatch={watch("contract_code_id") || ""}
                                                        handleChange={(e) => {
                                                            setValue("contract_code_id", e.target.value);
                                                            const find_contract = dataContractData?.find((item: any) => item.id == e.target.value)
                                                            setSelectedTermType(find_contract?.term_type)
                                                            setSelectedContractCode(find_contract?.contract_code)

                                                            // filteredUnitByContract(dataContractData, editTableData, e.target.value) // เลยปิดไว้ ----> New / Edit : Unit ปรับให้เลือกได้เฉพาะ MMBTU เท่านั้น https://app.clickup.com/t/86euzxxk1
                                                            if (errors?.contract_code_id) { clearErrors('contract_code_id') }
                                                        }}
                                                        errors={errors?.contract_code_id}
                                                        errorsText={'Select Contract Code'}
                                                        // options={dataUserType?.length > 0 ? dataUserType : []}
                                                        // options={dataContractData}
                                                        // options={getAvailableContracts(dataContractData, editTableData)}  // New > กรณีที่ใน Table มีข้อมูลของ Contract Code เลขที่นั้น, และ Unit นั้นแล้ว ระบบต้องไม่มีข้อมูลชุดนั้นแสดงให้เลือกอีก https://app.clickup.com/t/86euqk36r
                                                        options={getAvailableContracts2(dataContractData, editTableData)}  // New > กรณีที่ใน Table มีข้อมูลของ Contract Code เลขที่นั้น, และ Unit นั้นแล้ว ระบบต้องไม่มีข้อมูลชุดนั้นแสดงให้เลือกอีก https://app.clickup.com/t/86euqk36r
                                                        optionsKey={'id'}
                                                        optionsValue={'id'}
                                                        optionsText={'contract_code'}
                                                        optionsResult={'contract_code'}
                                                        placeholder={'Select Contract Code'}
                                                        pathFilter={'contract_code'}
                                                    />
                                                </div>

                                                <div >
                                                    <label
                                                        htmlFor="quantity"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        {`Quantity`}
                                                    </label>
                                                    <NumericFormat
                                                        id="quantity"
                                                        placeholder="0"
                                                        value={watch("quantity")}
                                                        readOnly={false}
                                                        {...register("quantity", { required: false })}
                                                        className={`${inputClass} ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={0}
                                                        fixedDecimalScale={true}
                                                        allowNegative={true}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue("quantity", value, { shouldValidate: true, shouldDirty: true });

                                                            const fee = Number(watch("fee") ?? 0);
                                                            const valueNum = Number(value ?? 0);
                                                            if (valueNum) {
                                                                const calc = fee * valueNum;
                                                                setValue("amount", calc);
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="unit"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        {`Unit`}
                                                    </label>

                                                    <SelectFormProps
                                                        id={'unit'}
                                                        register={register("unit", { required: false })}
                                                        disabled={false}
                                                        valueWatch={watch("unit") || ""}
                                                        handleChange={(e) => {
                                                            setValue("unit", e.target.value);
                                                            if (errors?.unit) { clearErrors('unit') }
                                                        }}
                                                        errors={errors?.unit}
                                                        errorsText={'Select Unit'}
                                                        // options={unitMaster2}
                                                        options={unitData?.filter((item: any) => item?.id == 1)} // New / Edit : Unit ปรับให้เลือกได้เฉพาะ MMBTU เท่านั้น https://app.clickup.com/t/86euzxxk1
                                                        optionsKey={'name'}
                                                        optionsValue={'name'}
                                                        optionsText={'name'}
                                                        optionsResult={'name'}
                                                        placeholder={'Select Unit'}
                                                        pathFilter={'name'}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="fee"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        {`Fee (Baht/MMBTU)`}
                                                    </label>
                                                    <NumericFormat
                                                        id="fee"
                                                        placeholder="0.0000"
                                                        value={watch("fee")}
                                                        readOnly={isReadOnly}
                                                        {...register("fee", { required: false })}
                                                        className={`${inputClass} ${errors.fee && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={4} // เดิมเป็น 2 เปลี่ยนเป็น 4 เพราะข้อนี้ https://app.clickup.com/t/86euzxxmh
                                                        fixedDecimalScale={true}
                                                        allowNegative={true}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue("fee", value, { shouldValidate: true, shouldDirty: true });

                                                            const quantity = Number(watch("quantity") ?? 0);
                                                            const valueNum = Number(value ?? 0);
                                                            if (valueNum) {
                                                                const calc = quantity * valueNum;
                                                                setValue("amount", calc);
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <div >
                                                    <label
                                                        htmlFor="amount"
                                                        className="block mb-2 text-sm font-light"
                                                    >
                                                        {`Amount(Baht)`}
                                                    </label>
                                                    <NumericFormat
                                                        id="amount"
                                                        placeholder="0.00"
                                                        value={watch("amount")}
                                                        readOnly={false}
                                                        {...register("amount", { required: false })}
                                                        className={`${inputClass} ${errors.amount && "border-red-500"}  ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                        thousandSeparator={true}
                                                        decimalScale={2}
                                                        fixedDecimalScale={true}
                                                        allowNegative={true}
                                                        displayType="input"
                                                        onValueChange={(values) => {
                                                            const { value } = values;
                                                            setValue("amount", value, { shouldValidate: true, shouldDirty: true });
                                                        }}
                                                    />
                                                </div>

                                                <div className="flex text items-center justify-center pt-6">
                                                    <button
                                                        type="button"
                                                        disabled={!canAdd}
                                                        className={`w-[90px] h-[44px] font-semibold py-2 px-6 rounded-lg text-white ${!canAdd ? 'bg-[#9CA3AF] cursor-not-allowed' : 'bg-[#17AC6B] hover:bg-[#249d68]'}`}
                                                        onClick={() => {
                                                            const newRow = {
                                                                id: Date.now(),
                                                                contract_code_id: watch('contract_code_id'),
                                                                contract_code: selectedContractCode,
                                                                quantity: watch('quantity'),
                                                                unit: watch('unit'),
                                                                fee: watch('fee'),
                                                                amount: watch('amount'),
                                                                term_type: selectedTermType?.id,
                                                                term_obj: selectedTermType
                                                            };

                                                            setEditTableData((prev: any) => [...prev, newRow]);
                                                            setEditTableDataTemp((prev: any) => [...prev, newRow]);

                                                            setValue('contract_code_id', null)
                                                            setValue('quantity', '')
                                                            setValue('unit', null)
                                                            setValue('fee', '')
                                                            setValue('amount', '')
                                                        }}
                                                    >
                                                        {`Add`}
                                                    </button>
                                                </div>
                                            </div>
                                        }

                                        <div className=" text-sm flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-start gap-2 ">
                                            <div onClick={handleTogglePopover}>
                                                <TuneIcon
                                                    className="cursor-pointer rounded-lg"
                                                    style={{ fontSize: "18px", color: '#2B2A87', borderRadius: '4px', width: '22px', height: '22px', border: '1px solid rgba(43, 42, 135, 0.4)' }}
                                                />
                                            </div>

                                            {
                                                mode !== 'view' &&
                                                <button
                                                    type="button"
                                                    className={`flex items-center font-light rounded-lg text-white justify-center h-[44px] w-[121px] normal-case ${selectedRows.length > 0 ? "bg-[#E46969]" : "bg-[#9CA3AF] cursor-not-allowed"}`}
                                                    onClick={deleteSelectedRows}
                                                    disabled={selectedRows.length === 0}
                                                >
                                                    {`Delete`}
                                                </button>
                                            }

                                        </div>

                                        <div className="pt-2">
                                            <TableDetailNote
                                                columnVisibility={columnVisibility}
                                                // tableData={editTableData}
                                                tableData={editTableDataTemp?.length > 0 ? editTableDataTemp : editTableData}
                                                handleCheckboxChange={handleCheckboxChange}
                                                selectedRows={selectedRows}
                                                setSelectedRows={setSelectedRows}
                                                isAllSelected={isAllSelected}
                                                handleSelectAll={handleSelectAll}

                                                isEditing={isEditing}
                                                setIsEditing={setIsEditing}

                                                isEditedInRow={isEditedInRow}
                                                setIsEditedInRow={setIsEditedInRow}

                                                isSaveClick={isSaveClick}
                                                setIsSaveClick={setIsSaveClick}

                                                rowEditing={rowEditing}
                                                setRowEditing={setRowEditing}

                                                handleEditClick={handleEditClick}
                                                handleSaveClick={handleSaveClick}
                                                handleCancelClick={handleCancelClick}

                                                handleSetTempData={handleSetTempData}
                                                mode={mode}
                                            />
                                        </div>
                                    </div>

                                    {/* Add Row Button */}
                                    {/* <div className="flex pt-2 justify-end">
                                        <AddOutlinedIcon
                                            sx={{ fontSize: 40 }}
                                            className={`text-[#ffffff] border rounded-md p-1 ${!btnEnable
                                                ? 'bg-[#B6B6B6] border-[#B6B6B6] pointer-events-none'
                                                : 'bg-[#24AB6A] border-[#24AB6A] hover:bg-[#24ab6acf] cursor-pointer'
                                                }`}
                                            onClick={() => {

                                                // btnEnable &&
                                                // append({ nomination_point_id: "", heating_value: "", volume: "", unit: "", cal_volume: "", unit2: "" })
                                                btnEnable &&
                                                    append(
                                                        { nomination_point_id: "", heating_value: "", volume: "", unit: "", cal_volume: "", unit2: "" },
                                                        { shouldFocus: false }
                                                    )
                                                setTimeout(() => {
                                                    clearErrors();
                                                }, 300);
                                                // if(errors?.rows){
                                                //     clearErrors(`rows.${fields?.length}`);
                                                // }else{
                                                //     clearErrors('rows');
                                                // }
                                            }
                                            }
                                        />
                                    </div> */}

                                    <div className="flex justify-end gap-4 pt-6 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className={`py-2 px-6 rounded-lg ${mode === "view" ? "bg-[#00ADEF] text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                        >
                                            {mode === "view" ? "Close" : "Cancel"}
                                        </button>

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                disabled={editTableData?.length <= 0}
                                                className={`w-[160px] font-semibold py-2 px-6 rounded-lg text-white
                                                    ${editTableData?.length <= 0 ? 'bg-[#9CA3AF] cursor-not-allowed' : 'bg-[#00ADEF] hover:bg-blue-600'}
                                                `}
                                            >
                                                {mode === "create" ? "Add" : "Save"}
                                            </button>
                                        )}
                                    </div>

                                </form>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>

            <ModalComponent
                open={modaSubmitConfirm}
                handleClose={(e: any) => {
                    setModaSubmitConfirm(false);
                    if (e == "submit") {
                        onSubmit(dataSubmit)
                        // setTimeout(async () => {
                        //     handleClose();
                        // }, 1000);

                        setTimeout(() => {
                            reset();
                            setResetForm(() => reset);
                            handleClose();

                        }, 300);
                    }
                    // setModalSuccessOpen(true);
                    // if (resetForm) resetForm();
                }}
                title="Submit Confirm"
                description={
                    <div>
                        <div className="text-center">
                            {`Are you sure to submit data ?`}
                        </div>
                        <div className="text-center">
                            {`You can go back and check the information.`}
                        </div>
                    </div>
                }
                menuMode="daily-adjust"
                btnmode="split"
                btnsplit1="Submit"
                btnsplit2="Check Info."
                stat="confirm"
            />

            {/* Confirm Save */}
            <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);

                            setTimeout(() => {

                                setSrchStartDate(null)
                                setKey((prevKey) => prevKey + 1);
                                reset();
                                setEditTableData([])
                                setEditTableDataTemp([])

                                setValue('shipper_id', null)

                                setIsEditing(false)
                                setIsEditedInRow(false)
                            }, 300);
                        }, 100);
                    }
                }}
                title="Confirm Save"
                description={
                    <div>
                        <div className="text-center">
                            {`Do you want to save the changes ?`}
                        </div>
                    </div>
                }
                menuMode="confirm-save"
                btnmode="split"
                btnsplit1="Save"
                btnsplit2="Cancel"
                stat="none"
            />

            <ColumnVisibilityPopover
                open={openPop}
                anchorEl={anchorEl}
                setAnchorEl={setAnchorEl}
                columnVisibility={columnVisibility}
                handleColumnToggle={handleColumnToggle}
                // initialColumns={initialColumns}
                initialColumns={mode == 'view' ? filteredColumns : initialColumns}
            />

        </>
    );
};

export default ModalAction;