import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect } from "react";
import SelectFormProps from "@/components/other/selectProps";
import dayjs from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import Spinloading from "@/components/other/spinLoading";
dayjs.extend(isSameOrAfter);

// type FormData = {
//     non_tpa_point_name: string;
//     description: string;
//     area_id: string;
//     nomination_point_id: string;
//     start_date: Date;
//     end_date: Date;
// };

type FormExampleProps = {
    mode?: "create" | "edit" | "view" | "period";
    data?: Partial<any>;
    open: boolean;
    isLoading?: any;
    dataTariffId: any;
    headData: any;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalCalBac: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
    dataTariffId = {},
    headData,
    open,
    isLoading,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, clearErrors, formState: { errors }, watch, } = useForm<any>({ defaultValues: data, });
    const labelClass = "block mb-2 text-[14px] font-light"

    {/* Confirm Save */ }
    // const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    // const [dataSubmit, setDataSubmit] = useState<any>()

    // const isReadOnly = mode === "view";
    const isTodayOrFuture = data?.gas_day && dayjs(data.gas_day).isSameOrAfter(dayjs(), 'day');
    // const isReadOnly =  mode === "view" || !isTodayOrFuture;
    const isReadOnly = mode == 'create' ? false : mode === "view" || !isTodayOrFuture;

    // const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (mode === 'create') {
                // setIsLoading(false);
            }

            if (mode === "edit" || mode === "view") {
                // setIsLoading(true);
                // const formattedStartDate: any = formatFormDate(data?.gas_day);
                // setValue("gas_day", formattedStartDate);

                // setValue("tariff_id", data?.west ? "WEST" : "EAST")
                // setValue("value_mmbtu", data?.west ? data?.west : data?.east)
                // setValue("remark", data?.comment?.length > 0 ? data?.comment?.[0]?.remark : '')

                // setTimeout(() => {
                //     if (data) { setIsLoading(false); }
                // }, 300);
            }
        }

        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();

        setTimeout(() => {
            // setValue("gas_day", null);
            setValue("tariff_id", null);
            // setValue("value_mmbtu", null);
            // setValue("remark", null);

            clearErrors();
            reset();
        }, 500);
    };

    {/* Confirm Save */ }
    // const handleSaveConfirm = async (data?: any) => {
    //      
    //     // setDataSubmit(data)
    //     // setModaConfirmSave(true)

    //     if (mode == 'create') {
    //         await onSubmit(data);

    //         setTimeout(() => {
    //             setValue("gas_day", null);
    //             setValue("tariff_id", null);
    //             setValue("value_mmbtu", null);
    //             setValue("remark", null);

    //             clearErrors();

    //             reset();
    //         }, 500);
    //     } else {
    //         setDataSubmit(data)
    //         setModaConfirmSave(true)
    //     }
    // }

    return (
        <>
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
                            <Spinloading spin={isLoading} rounded={20} mode='special'/>

                            <div className="flex inset-0 items-center justify-center  ">
                                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[500px]"
                                        onSubmit={handleSubmit(async (data) => { // clear state when submit
                                            // setIsLoading(true);
                                            setTimeout(async () => {
                                                await onSubmit(data);
                                            }, 100);
                                        })}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] pb-2">
                                            {'BAC Calc'}
                                        </h2>

                                        <div className="w-[500px]">
                                            <section className="relative z-20 pr-4 flex flex-col sm:flex-row w-full gap-10">
                                                {/* Month/Year */}
                                                <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Month/Year`}</p>
                                                    {/* <p className="!text-[14px] font-light text-[#757575]">{'October 2024'}</p> */}
                                                    <p className="!text-[14px] font-light text-[#757575]">{headData?.month_year_charge ? dayjs(headData?.month_year_charge).format("MMMM YYYY") : ''}</p>
                                                </div>

                                                {/* Tariff ID */}
                                                <div className="flex flex-col">
                                                    <p className="!text-[14px] font-semibold text-[#58585A]">{`Tariff ID`}</p>
                                                    {/* <p className="!text-[14px] font-light text-[#757575]">{'20241021-TAR-0001-A (13:08:45)'}</p> */}
                                                    <p className="!text-[14px] font-light text-[#757575]">{headData?.tariff_id ? headData?.tariff_id : ''}</p>
                                                </div>
                                            </section>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 pt-4">
                                            <div>
                                                <label
                                                    htmlFor="tariff_id"
                                                    className={labelClass}
                                                >
                                                    <span className="text-red-500">*</span>
                                                    {`Tariff ID Compare`}
                                                </label>

                                                <SelectFormProps
                                                    id={'tariff_id'}
                                                    register={register("tariff_id", { required: "Select Tariff ID" })}
                                                    disabled={isReadOnly}
                                                    // disabled={mode == 'create' ? false : true || isReadOnly}
                                                    valueWatch={watch("tariff_id") || ""}
                                                    handleChange={(e) => {
                                                        setValue("tariff_id", e.target.value);
                                                        clearErrors('tariff_id')
                                                        if (errors?.tariff_id) { clearErrors('tariff_id') }
                                                    }}
                                                    errors={errors?.tariff_id}
                                                    errorsText={'Select Tariff ID'}
                                                    options={dataTariffId}
                                                    optionsKey={'id'}
                                                    optionsValue={'id'}
                                                    optionsText={'tariff_id'}
                                                    optionsResult={'tariff_id'}
                                                    placeholder={'Select Tariff ID'}
                                                    pathFilter={'tariff_id'}
                                                    specialRenderOptions={true}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            {mode === "view" ? (
                                                <button
                                                    type="button"
                                                    // onClick={onClose}
                                                    onClick={() => handleClose()}
                                                    className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {`Close`}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    // onClick={onClose}
                                                    onClick={() => handleClose()}
                                                    className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                                >
                                                    {`Cancel`}
                                                </button>
                                            )}

                                            {mode !== "view" && (
                                                <button
                                                    type="submit"
                                                    className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {mode === "create" ? "Confirm" : "Save"}
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div >
                </div >
            </Dialog >

            {/* Confirm Save */}
            {/* <ModalConfirmSave
                open={modaConfirmSave}
                handleClose={(e: any) => {
                    setModaConfirmSave(false);
                    if (e == "submit") {
                        setIsLoading(true);
                        setTimeout(async () => {
                            await onSubmit(dataSubmit);
                        }, 100);

                        setTimeout(async () => {
                            handleClose();
                        }, 1000);
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
            /> */}
        </>
    );
};

export default ModalCalBac;