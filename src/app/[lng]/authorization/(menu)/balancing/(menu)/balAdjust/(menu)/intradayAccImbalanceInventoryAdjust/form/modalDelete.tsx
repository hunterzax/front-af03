import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { formatNumberFourDecimal, toDayjs } from "@/utils/generalFormatter";
import ModalConfirmSave from "@/components/other/modalConfirmSave";

type FormExampleProps = {
    data?: Partial<any>;
    dataMain?: any;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<any>;
    setResetForm: (reset: () => void) => void;
};

const ModalDelete: React.FC<FormExampleProps> = ({
    data = {},
    dataMain,
    open,
    onClose,
    onSubmit,
    setResetForm,
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
    } = useForm<any>({
        defaultValues: data,
    });

    {/* Confirm Save */ }
    const [modaConfirmSave, setModaConfirmSave] = useState<any>(false)
    const [dataSubmit, setDataSubmit] = useState<any>()
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();
        reset();
    };

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
                            <div className="flex inset-0 items-center justify-center">

                                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                    <form
                                        className="bg-white p-8 rounded-[20px] shadow-lg max-w w-[530px]"
                                        onSubmit={handleSubmit(onSubmit)}
                                    >
                                        <h2 className="text-xl font-bold text-[#00ADEF] pb-8">
                                            {`Confirm to delete ?`}
                                        </h2>

                                        {/* Delete : เพิ่มกรอบเทาให้ข้อมูล https://app.clickup.com/t/86etfq0p2 */}
                                        <div className="border border-[#DFE4EA] rounded-xl p-4">
                                            <div className="w-full">
                                                <div className="mb-4 w-[100%]">
                                                    <div className="grid grid-cols-3 w-full text-sm font-semibold text-[#58585A]">
                                                        <p>{`Gas Day`}</p>
                                                        <p>{`EAST (MMBTU)`}</p>
                                                        <p>{`WEST (MMBTU)`}</p>
                                                    </div>

                                                    <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                                                        <p>{data?.gas_day ? toDayjs(data?.gas_day).format("DD/MM/YYYY") : '-'}</p>
                                                        <p>{data?.east ? formatNumberFourDecimal(data?.east) : '-'}</p>
                                                        <p>{data?.west ? formatNumberFourDecimal(data?.west) : '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>

                                            <button
                                                type="submit"
                                                className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Delete`}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </DialogPanel>
                    </div >
                </div >
            </Dialog >

            {/* Confirm Save */}
            <ModalConfirmSave
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
            />
        </>
    );
};

export default ModalDelete;