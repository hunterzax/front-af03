import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";
import DatePickaSearch from "@/components/library/dateRang/dateSearch";
import dayjs from "dayjs";

type FormExampleProps = {
    mode?: "download" | "upload";
    open: boolean;
    dataTable?: any;
    shipperGroupData: any;
    setIdShipper: any;
    handleButtonDownload?: any;
    handleClickUpload?: any;
    dataContractOriginal?: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    isLoading?: boolean;
    setisLoading?: any
    userDT?: any
};

const ModalSelShipperContract: React.FC<FormExampleProps> = ({
    mode,
    open,
    shipperGroupData,
    setIdShipper,
    handleButtonDownload,
    handleClickUpload,
    dataContractOriginal,
    onClose,
    onSubmit,
    isLoading = false,
    setisLoading,
    userDT
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch, clearErrors } = useForm<any>({ defaultValues: {} });

    const updateValue = (fieldName: string, value: any) => {
        setValue(fieldName, value);
        setIdShipper(value)
        clearErrors(fieldName);
    };

    const handleClose = () => {
        onClose();
        setIdShipper(null)
        reset();
    };

    return (
        <Dialog open={open} onClose={() => { handleClose() }} className="relative z-20">
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
                                    // onSubmit={handleSubmit(onSubmit)}
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        // setisLoading(true);
                                        setTimeout(async () => {
                                            await onSubmit(data);
                                        }, 200);
                                    })}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-2 pb-2">{"Select Shipper"}</h2>
                                    <div className={`grid grid-cols-1 gap-2 pt-4`}>

                                        <div>
                                            <label
                                                htmlFor="year"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                {/* <span className="text-red-500">*</span> */}
                                                {`Year`}
                                            </label>
                                          
                                            <SelectFormProps
                                                id={'year'}
                                                disabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                                valueWatch={watch("year")}
                                                handleChange={(e) => {
                                                    updateValue("year", e.target.value);

                                                }}
                                                errors={errors?.y}
                                                errorsText={'Select Year'}
                                                options={Array.from({ length: 5 }, (_, index) => {
                                                const year = dayjs().subtract(index, 'year').year()

                                                return {
                                                    id: year,
                                                    year: String(year),
                                                }
                                                })}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'year'}
                                                optionsResult={'year'}
                                                placeholder={'Select Year'}
                                                pathFilter={'year'}

                                            /> 

                                        </div>
                                        <div>
                                            <label
                                                htmlFor="group_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Shipper Name`}
                                            </label>

                                            {/* 020725 : Import > Template > Field Shipper Name Fix ให้ขึ้นแค่ชื่อ shipper ตัวเอง ไม่ต้องให้เลือก https://app.clickup.com/t/86eu1dj8c */}
                                            <SelectFormProps
                                                id={'group_id'}
                                                register={register("group_id", { required: "Select Shipper Name" })}
                                                disabled={userDT?.account_manage?.[0]?.user_type_id == 3 ? true : false}
                                                // valueWatch={watch("group_id") || ""}
                                                valueWatch={userDT?.account_manage?.[0]?.user_type_id == 3 ? userDT?.account_manage?.[0]?.group?.id_name : watch("group_id")}
                                                handleChange={(e) => {
                                                    updateValue("group_id", e.target.value);
                                                    if (errors?.group_id) { clearErrors('group_id') }
                                                }}
                                                errors={errors?.group_id}
                                                errorsText={'Select Shipper Name'}
                                                // options={shipperGroupData}
                                                options={
                                                    shipperGroupData?.filter((item: any) => {
                                                    
                                                    console.log('watch("year") : ', watch("year"));
                                                    console.log('item : ', item);
                                                    return userDT?.account_manage?.[0]?.user_type_id == 3 ? item?.id === userDT?.account_manage?.[0]?.group?.id : true
                                                })?.filter((f: any) => {
                                                    const selectedYear = Number(watch('year'))
                                                    if (!selectedYear) return true
                                                    if (!f?.start_date) return false
                                                    const startYear = new Date(f.start_date).getFullYear()
                                                    // ถ้า end_date เป็น null ให้เทียบเฉพาะปีของ start_date
                                                    if (!f?.end_date) {
                                                    return selectedYear === startYear
                                                    }
                                                    const endYear = new Date(f.end_date).getFullYear()
                                                    return selectedYear >= startYear && selectedYear <= endYear

                                                })
                                            }
                                                optionsKey={'id_name'}
                                                optionsValue={'id_name'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Shipper Name'}
                                                pathFilter={'name'}
                                            />

                                        </div>

                                        <div>
                                            <label
                                                htmlFor="contract_code"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Contract Code`}
                                            </label>

                                            <SelectFormProps
                                                id={'contract_code'}
                                                register={register("contract_code", { required: "Select Contract Code" })}
                                                disabled={false}
                                                // valueWatch={watch("contract_code") || ""}
                                                valueWatch={watch("contract_code")}
                                                handleChange={(e) => {
                                                    updateValue("contract_code", e.target.value);
                                                    if (errors?.contract_code) { clearErrors('contract_code') }
                                                }}
                                                errors={errors?.contract_code}
                                                errorsText={'Select Contract Code'}
                                                // options={dataContractOriginal}
                                                options={dataContractOriginal?.filter((item: any) => {

                                                   return userDT?.account_manage?.[0]?.user_type_id == 3 ?
                                                        item?.group?.id === userDT?.account_manage?.[0]?.group?.id
                                                        : watch('group_id') ? item?.group?.id_name == watch('group_id') : true
                                                })?.filter((f: any) => {
                                                    const selectedYear = Number(watch('year'))
                                                    if (!selectedYear) return true
                                                    if (!f?.contract_start_date) return false
                                                    const startYear = new Date(f.contract_start_date).getFullYear()
                                                    // ถ้า end_date เป็น null ให้เทียบเฉพาะปีของ start_date
                                                    if (!f?.contract_end_date) {
                                                    return selectedYear === startYear
                                                    }
                                                    const endYear = new Date(f.contract_end_date).getFullYear()
                                                    return selectedYear >= startYear && selectedYear <= endYear

                                                })
                                            }
                                                optionsKey={'contract_code'}
                                                optionsValue={'contract_code'}
                                                optionsText={'contract_code'}
                                                optionsResult={'contract_code'}
                                                placeholder={'Select Contract Code'}
                                                pathFilter={'contract_code'}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <button
                                            type="button"
                                            onClick={() => handleClose()}
                                            className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                        >
                                            {`Cancel`}
                                        </button>

                                        {/* <button
                                            type="button"
                                            className={`w-[167px] font-semibold  text-white py-2 rounded-lg focus:outline-none focus:bg-blue-600 ${isSelected ? 'bg-[#36B1AB] hover:bg-[#2d9690]' : 'bg-[#9CA3AF] cursor-not-allowed'}`}
                                            disabled={!isSelected}
                                            onClick={() => {
                                                if (mode == 'download') {
                                                    handleButtonDownload();
                                                }
                                                // else if(mode == 'upload'){
                                                //     setisLoading(true);
                                                //     setTimeout(() => {
                                                //         handleClickUpload();
                                                //     }, 100); 
                                                // }
                                            }}
                                        >
                                            {mode == 'download' ? `Download` : 'Upload'}
                                        </button> */}

                                        {/* ถ้า watch("contract_code") ไม่มีค่า และ mode == 'download' ให้ disable button นี้เลย */}
                                        {/* <button
                                            type="submit"
                                            className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                        >
                                            {mode == 'download' ? `Download` : 'Upload'}
                                        </button> */}

                                        <button
                                            type="submit"
                                            disabled={!watch("contract_code") && mode === 'download'}
                                            className={`w-[167px] font-light py-2 rounded-lg focus:outline-none
                                            ${!watch("contract_code") && mode === 'download'
                                                    ? 'bg-[#C5C5C5] text-white font-semibold cursor-not-allowed'
                                                    : 'bg-[#00ADEF] font-semibold hover:bg-blue-600 focus:bg-blue-600 text-white'}
                                            `}
                                        >
                                            {mode === 'download' ? 'Download' : 'Upload'}
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

export default ModalSelShipperContract;