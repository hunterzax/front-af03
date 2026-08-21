import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatDateNoTime, formatNumberThreeDecimal } from "@/utils/generalFormatter";
import { NumericFormat } from "react-number-format";
import Spinloading from "@/components/other/spinLoading";

type FormData = {
    id: string;
    mmbtu_d: any;
    mmscfd_d: any;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "release";
    // data?: Partial<FormData>;
    data?: any;
    latestStartDate?: any;
    dataInfo?: any;
    setMdConfirmOpen?: any;
    setDataConfirmCap?: any;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
    isLoading?: any;
    setIsLoading?: any;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    latestStartDate,
    dataInfo,
    setMdConfirmOpen,
    setDataConfirmCap,
    open,
    onClose,
    onSubmit,
    setResetForm,
    isLoading, 
    setIsLoading
}) => {
    
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const inputClass = "text-sm !font-light block md:w-full p-2 ps-5 pe-10 h-[40px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";

    const [contractedMmmbtud, setContractedMmmbtud] = useState<any>();
    const [contractedMmscfd, setContractedMmscfd] = useState<any>();
    const [releaseMmmbtud, setReleaseMmmbtud] = useState<any>();
    const [releaseMmscfd, setReleaseMmscfd] = useState<any>();
    const [releaseStartDate, setReleaseStartDate] = useState<any>();
    const [releaseEndDate, setReleaseEndDate] = useState<any>();
    // const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(false);
    }, [mode, data])

    useEffect(() => {
        setValue('id', data?.id)
        let entryContractedMmmbtud = data?.entryContractedMmmbtud || Number.MAX_VALUE
        let exitContractedMmmbtud = data?.exitContractedMmmbtud || Number.MAX_VALUE
        let entryContractedMmscfd = data?.entryContractedMmscfd && data?.entryContractedMmscfd != '-' ? data?.entryContractedMmscfd : Number.MAX_VALUE
        let exitContractedMmscfd = data?.exitContractedMmscfd && data?.exitContractedMmscfd != '-' ? data?.exitContractedMmscfd : Number.MAX_VALUE
        let entryReleaseMmmbtud = data?.entryReleaseMmmbtud || Number.MAX_VALUE
        let exitReleaseMmmbtud = data?.exitReleaseMmmbtud || Number.MAX_VALUE
        let entryReleaseMmscfd = data?.entryReleaseMmscfd && data?.entryReleaseMmscfd != '-' ? data?.entryReleaseMmscfd : Number.MAX_VALUE
        let exitReleaseMmscfd = data?.exitReleaseMmscfd && data?.exitReleaseMmscfd != '-' ? data?.exitReleaseMmscfd : Number.MAX_VALUE

        if (data?.subRows) {
            if (data.subRows.length > 0) {
                if (data.subRows[0].total_contracted_mmbtu_d && data.subRows[0].total_contracted_mmbtu_d !== "undefined" && data.subRows[0].total_contracted_mmbtu_d !== "null") {
                    entryContractedMmmbtud = data.subRows[0].total_contracted_mmbtu_d
                }
                if (data.subRows[0].total_contracted_mmscfd && data.subRows[0].total_contracted_mmscfd !== "undefined" && data.subRows[0].total_contracted_mmscfd !== "null") {
                    entryContractedMmscfd = data.subRows[0].total_contracted_mmscfd
                }
                if (data.subRows[0].total_release_mmbtu_d && data.subRows[0].total_release_mmbtu_d !== "undefined" && data.subRows[0].total_release_mmbtu_d !== "null") {
                    entryReleaseMmmbtud = data.subRows[0].total_release_mmbtu_d
                }
                if (data.subRows[0].total_release_mmscfd && data.subRows[0].total_release_mmscfd !== "undefined" && data.subRows[0].total_release_mmscfd !== "null") {
                    entryReleaseMmscfd = data.subRows[0].total_release_mmscfd
                }
            }
            if (data.subRows.length > 1) {
                if (data.subRows[1].total_contracted_mmbtu_d && data.subRows[1].total_contracted_mmbtu_d !== "undefined" && data.subRows[1].total_contracted_mmbtu_d !== "null") {
                    exitContractedMmmbtud = data.subRows[1].total_contracted_mmbtu_d
                }
                if (data.subRows[1].total_contracted_mmscfd && data.subRows[1].total_contracted_mmscfd !== "undefined" && data.subRows[1].total_contracted_mmscfd !== "null") {
                    exitContractedMmscfd = data.subRows[1].total_contracted_mmscfd
                }
                if (data.subRows[1].total_release_mmbtu_d && data.subRows[1].total_release_mmbtu_d !== "undefined" && data.subRows[1].total_release_mmbtu_d !== "null") {
                    exitReleaseMmmbtud = data.subRows[1].total_release_mmbtu_d
                }
                if (data.subRows[1].total_release_mmscfd && data.subRows[1].total_release_mmscfd !== "undefined" && data.subRows[1].total_release_mmscfd !== "null") {
                    exitReleaseMmscfd = data.subRows[1].total_release_mmscfd
                }
            }

            const minReleaseStartDate: Date | undefined = data.subRows.reduce((min: any, item: any) => {
                const currentStartDate = new Date(item.release_start_date);
                return (!min || currentStartDate < min) ? currentStartDate : min;
            }, undefined);

            const maxReleaseEndDate: Date | undefined = data.subRows.reduce((max: any, item: any) => {
                const currentEndDate = new Date(item.release_end_date);
                return (!max || currentEndDate > max) ? currentEndDate : max;
            }, undefined);

            setReleaseStartDate(formatDateNoTime(minReleaseStartDate))
            setReleaseEndDate(formatDateNoTime(maxReleaseEndDate))
        }
        else {
            setReleaseStartDate(formatDateNoTime(data.entryReleaseStartDate))
            setReleaseEndDate(formatDateNoTime(data.exitReleaseStartDate))
        }

        if (exitContractedMmmbtud < entryContractedMmmbtud && exitContractedMmmbtud != Number.MAX_VALUE) {
            setContractedMmmbtud(exitContractedMmmbtud)
        }
        else if (entryContractedMmmbtud != Number.MAX_VALUE) {
            setContractedMmmbtud(entryContractedMmmbtud)
        }

        if (exitContractedMmscfd < entryContractedMmscfd && exitContractedMmscfd != Number.MAX_VALUE) {
            setContractedMmscfd(exitContractedMmscfd)
        }
        else if (entryContractedMmscfd != Number.MAX_VALUE) {
            setContractedMmscfd(entryContractedMmscfd)
        }

        if (exitReleaseMmmbtud < entryReleaseMmmbtud && exitReleaseMmmbtud != Number.MAX_VALUE) {
            setReleaseMmmbtud(exitReleaseMmmbtud)
        }
        else if (entryReleaseMmmbtud != Number.MAX_VALUE) {
            setReleaseMmmbtud(entryReleaseMmmbtud)
        }

        if (exitReleaseMmscfd < entryReleaseMmscfd && exitReleaseMmscfd != Number.MAX_VALUE) {
            setReleaseMmscfd(exitReleaseMmscfd)
        }
        else if (entryReleaseMmscfd != Number.MAX_VALUE) {
            setReleaseMmscfd(entryReleaseMmscfd)
        }
        // setDataMaster(data)
        // setFilteredDataTable(data);
    }, [data])


    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    // clear state when closes
    const handleClose = () => {
        onClose();
    };

    useEffect(() => {
      setIsLoading(false)
      if(!open){
          onClose();
      }
    }, [open])
    

    return (
        <Dialog
            open={open}
            // onClose={onClose} 
            onClose={handleClose}
            className="relative z-20"
        >
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
                        <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md ">
                                <Spinloading spin={isLoading} rounded={20} />

                                <form
                                    onSubmit={handleSubmit((submitedData) => { // clear state when submit
                                        setIsLoading(true);

                                        setDataConfirmCap({
                                            ...submitedData,
                                            releaseEndCalc: releaseEndDate,
                                            releaseStartCalc: releaseStartDate,
                                            contract_point_entry_exit: [
                                                data?.entryContractPoint ? data.entryContractPoint : data?.subRows?.length > 0 ? data?.subRows[0].temp_contract_point : data?.release_summary_detail ? data?.release_summary_detail?.[0]?.temp_contract_point : '',
                                                data?.exitContractPoint ? data.exitContractPoint : data?.subRows?.length > 1 ? data?.subRows[1].temp_contract_point : data?.release_summary_detail ? data?.release_summary_detail?.[1]?.temp_contract_point : ''
                                            ]
                                        })
                                        // onSubmit(groupedData, dataMaster);
                                        setMdConfirmOpen(true);
                                    })}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w !w-[900px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-5">{mode == "release" ? `Confirm Capacity` : mode == "edit" ? "Edit Version " + dataInfo?.version : "View Version " + dataInfo?.version}</h2>
                                    <div className="mb-4 w-[100%]">
                                        <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                            <p>{`Contract Code`}</p>
                                            <p>{`Shipper Name`}</p>
                                            <p>{`Entry Point`}</p>
                                            <p>{`Exit Point`}</p>
                                        </div>

                                        <div className="grid grid-cols-4 text-sm font-light pt-2 text-[#58585A]">
                                            <p>{data?.contract_code ? data?.contract_code?.contract_code : ''}</p>
                                            <p>{data?.group ? data?.group?.name : ''}</p>
                                            <p>{data?.subRows?.length > 0 ? data?.subRows[0].temp_contract_point : data?.release_summary_detail ? data?.release_summary_detail?.[0]?.temp_contract_point : ''}</p>
                                            <p>{data?.subRows?.length > 1 ? data?.subRows[1].temp_contract_point : data?.release_summary_detail ? data?.release_summary_detail?.[1]?.temp_contract_point : ''}</p>
                                        </div>
                                    </div>

                                    <div className="mb-4 w-[100%]">
                                        <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                            <p>{`Contracted (MMBTU/D)`}</p>
                                            <p>{`Contracted (MMSCFD)`}</p>
                                            <p>{`Release (MMBTU/D)`}</p>
                                            <p>{`Release (MMSCFD)`}</p>
                                        </div>

                                        <div className="grid grid-cols-4 text-sm font-light text-[#58585A] pt-2 pr-20 text-right">
                                            <p>{contractedMmmbtud ? formatNumberThreeDecimal(contractedMmmbtud || '') : ''}</p>
                                            <p>{contractedMmscfd ? formatNumberThreeDecimal(contractedMmscfd || '') : ''}</p>
                                            <p>{releaseMmmbtud ? formatNumberThreeDecimal(releaseMmmbtud || '') : ''}</p>
                                            <p>{releaseMmscfd ? formatNumberThreeDecimal(releaseMmscfd || '') : ''}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label htmlFor="confirm-cap-mmbtud" className="block mb-2 text-sm font-light">
                                                {`Confirm Capacity (MMBTU/D)`}
                                            </label>

                                            <NumericFormat
                                                id="confirm-cap-mmbtud"
                                                {...register("mmbtu_d")}
                                                value={watch("mmbtu_d")}
                                                placeholder="0.000"
                                                readOnly={false}
                                                className={`${inputClass} !w-[90%] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                                // isAllowed={(values) => {
                                                //     const { floatValue } = values;
                                                //     let maxValue = 0
                                                //     try {
                                                //         // maxValue = parseFloat(contractedMmmbtud) 
                                                //         maxValue = parseFloat(contractedMmmbtud) // เปลี่ยนไปจับจาก release mmbtu
                                                //     } catch (error) {
                                                //         maxValue = 0
                                                //     }

                                                //     return floatValue === undefined || (floatValue <= maxValue && floatValue > 0) // Hard limit
                                                // }}
                                                // onValueChange={(values) => {
                                                //     let { value } = values;
                                                //     let maxValue = 0
                                                //     try {
                                                //         // maxValue = parseFloat(contractedMmmbtud)
                                                //         maxValue = parseFloat(releaseMmmbtud) // เปลี่ยนไปจับจาก release mmbtu
                                                //     } catch (error) {
                                                //         maxValue = 0
                                                //     }

                                                //     if (parseFloat(value) > maxValue) {
                                                //         value = maxValue.toString();
                                                //     }

                                                //     setValue("mmbtu_d", value, { shouldValidate: true, shouldDirty: true });
                                                // }}

                                                // อนุญาตให้ว่าง, 0, และค่า <= maxValue
                                                isAllowed={({ floatValue }) => {
                                                    let maxValue = 0;
                                                    try {
                                                        maxValue = parseFloat(releaseMmmbtud); // ให้ตรงกับ onValueChange
                                                    } catch { maxValue = 0; }
                                                    return floatValue === undefined || (floatValue >= 0 && floatValue <= maxValue);
                                                }}
                                                onValueChange={({ value }) => {
                                                    let maxValue = 0;
                                                    try {
                                                        maxValue = parseFloat(releaseMmmbtud);
                                                    } catch { maxValue = 0; }

                                                    // อนุญาตให้เคลียร์ช่อง
                                                    if (value === '') {
                                                        setValue("mmbtu_d", '', { shouldValidate: true, shouldDirty: true });
                                                        return;
                                                    }

                                                    // clamp ไม่ให้เกิน max
                                                    let next = value;
                                                    const num = parseFloat(value);
                                                    if (!isNaN(num) && num > maxValue) next = String(maxValue);

                                                    setValue("mmbtu_d", next, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirm-cap-mmscfd" className="block mb-2 text-sm font-light">
                                                {`Confirm Capacity (MMSCFD)`}
                                            </label>

                                            <NumericFormat
                                                id="confirm-cap-mmscfd"
                                                {...register("mmscfd_d")}
                                                value={watch("mmscfd_d")}
                                                placeholder="0.000"
                                                readOnly={false}
                                                className={`${inputClass} !w-[90%] text-right`}
                                                thousandSeparator={true}
                                                decimalScale={3}
                                                fixedDecimalScale={true}
                                                allowNegative={false}
                                                displayType="input"
                                                // isAllowed={(values) => {
                                                //     const { floatValue } = values;
                                                //     let maxValue = 0
                                                //     try {
                                                //         // maxValue = parseFloat(contractedMmscfd)
                                                //         maxValue = parseFloat(contractedMmscfd) // เปลี่ยนไปจับจาก release mmbtu
                                                //     } catch (error) {
                                                //         maxValue = 0
                                                //     }

                                                //     return floatValue === undefined || (floatValue <= maxValue && floatValue > 0) // Hard limit
                                                // }}
                                                // onValueChange={(values) => {
                                                //     let { value } = values;
                                                //     let maxValue = 0
                                                //     try {
                                                //         // maxValue = parseFloat(contractedMmscfd)
                                                //         maxValue = parseFloat(contractedMmscfd) // เปลี่ยนไปจับจาก release mmbtu
                                                //     } catch (error) {
                                                //         maxValue = 0
                                                //     }

                                                //     if (parseFloat(value) > maxValue) {
                                                //         value = maxValue.toString();
                                                //     }

                                                //     setValue("mmscfd_d", value, { shouldValidate: true, shouldDirty: true });
                                                // }}

                                                // อนุญาตให้ว่าง, 0, และค่า <= maxValue
                                                isAllowed={({ floatValue }) => {
                                                    let maxValue = 0;
                                                    try {
                                                        // maxValue = parseFloat(contractedMmscfd); // ให้ตรงกับ onValueChange
                                                        maxValue = parseFloat(releaseMmscfd); // ให้ตรงกับ onValueChange
                                                    } catch { maxValue = 0; }
                                                    return floatValue === undefined || (floatValue >= 0 && floatValue <= maxValue);
                                                }}
                                                onValueChange={({ value }) => {
                                                    let maxValue = 0;
                                                    try {
                                                        // maxValue = parseFloat(contractedMmscfd);
                                                        maxValue = parseFloat(releaseMmscfd);
                                                    } catch { maxValue = 0; }

                                                    // อนุญาตให้เคลียร์ช่อง
                                                    if (value === '') {
                                                        setValue("mmscfd_d", '', { shouldValidate: true, shouldDirty: true });
                                                        return;
                                                    }

                                                    // clamp ไม่ให้เกิน max
                                                    let next = value;
                                                    const num = parseFloat(value);
                                                    if (!isNaN(num) && num > maxValue) next = String(maxValue);

                                                    setValue("mmscfd_d", next, { shouldValidate: true, shouldDirty: true });
                                                }}
                                            />
                                        </div>

                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="button"
                                            // onClick={onClose}
                                            onClick={handleClose}
                                            className="w-[167px] font-light bg-slate-100 !text-[#464255] py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                        >
                                            {`Cancel`}
                                        </button>

                                        <button
                                            type="submit"
                                            className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                        >
                                            {"Confirm"}
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div >
            </div >
        </Dialog >
    );
};

export default ModalAction;
