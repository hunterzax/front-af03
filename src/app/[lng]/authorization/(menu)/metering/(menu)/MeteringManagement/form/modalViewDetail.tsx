import React from "react";
import { useForm } from 'react-hook-form';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { useEffect, useState } from "react";
import { NumericFormat } from 'react-number-format';
import Spinloading from "@/components/other/spinLoading";

type FormExampleProps = {
    mode?: 'execute' | 'template' | 'view';
    data?: Partial<any>;
    open: boolean;
    onClose: () => void;
    setResetForm: (reset: () => void) => void;
};

let isReadOnly = true;

const ModalViewDetail: React.FC<FormExampleProps> = ({
    mode = 'view',
    data = {},
    open,
    onClose,
    setResetForm,
}) => {
    const { control, register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({
        defaultValues: data,
    });

    isReadOnly = mode === "view" ? true : false;
    const [isLoading, setIsLoading] = useState<boolean>(true);

    let dataQuality = [
        {
            id: 'pressure',
            name: "Pressure (psig)"
        },
        {
            id: 'wobbe_index',
            name: "Wobbe Index (BTU/SCF)"
        },
        {
            id: 'sg',
            name: "SG (Unitless)"
        },
        {
            id: 'c1_mol',
            name: "C1 (% mol)"
        },
        {
            id: 'c2_mol',
            name: "C2 (% mol)"
        },
        {
            id: 'c3_mol',
            name: "C3 (% mol)"
        },
        {
            id: 'ic4',
            name: "iC4 (% mol)"
        },
        {
            id: 'nc4',
            name: "nC4 (% mol)"
        },
        {
            id: 'ic5',
            name: "iC5 (% mol)"
        },
        {
            id: 'nc5',
            name: "nC5 (% mol)"
        },
        {
            id: 'c6',
            name: "C6 (% mol)"
        },
        {
            id: 'c7',
            name: "C7 (% mol)"
        },
        {
            id: 'c2_plus',
            name: "C2+ (% mol)"
        },
        {
            id: 'co2',
            name: "Carbon dioxide (% mol)"
        },
        {
            id: 'nitrogen',
            name: "Nitrogen (% mol)"
        },
        {
            id: 'oxygen',
            name: "Oxygen (% mol)"
        },
        {
            id: 'dew_point',
            name: "Dew point (Deg.F)"
        },
        {
            id: 'moisture',
            name: "Moisture (lb/MMscf)"
        },
        {
            id: 'mercury',
            name: "Mercury (µg/m3)"
        },
        {
            id: 'hydrogen_suifide',
            name: "Hydrogen Suifide (ppm by volume)"
        },
        {
            id: 'total_sulphur',
            name: "Total Sulphur (ppm by volume)"
        },
    ]

    useEffect(() => {
        setIsLoading(true);
        const fetchAndSetData = async () => {

            if (data && Object.keys(data).length > 0) {

                if (mode === 'view') {
                    // setValue('c1_mol', data?.measurements?.c1 || null);
                    // setValue('wobbe_index', data?.measurements?.wobbeIndex || null);
                    // setValue('sg', data?.measurements?.sg || null);
                    // setValue('c3_mol', data?.measurements?.c3 || null);
                    // setValue('c2_mol', data?.measurements?.c2 || null);
                    // setValue('c2_plus', data?.measurements?.c2Plus || null);

                    // setValue('k5_mol', null); // ขาด

                    // setValue('ic4', data?.measurements?.ic4 || null);
                    // setValue('nc4', data?.measurements?.nc4 || null);
                    // setValue('c7', data?.measurements?.c7 || null);
                    // setValue('nc5', data?.measurements?.nc5 || null);
                    // setValue('c6', data?.measurements?.c6 || null);
                    // setValue('oxygen', data?.measurements?.o2 || null);
                    // setValue('co2', data?.measurements?.co2 || null);
                    // setValue('nitrogen', data?.measurements?.n2 || null);
                    // setValue('mercury', data?.measurements?.hg || null);
                    // setValue('dew_point', data?.measurements?.dewPoint || null);
                    // setValue('moisture', data?.measurements?.moisture || null);
                    // setValue('hydrogen_suifide', data?.measurements?.h2s || null);
                    // setValue('total_sulphur', data?.measurements?.s || null);

                    setValue('c1_mol', data?.data_temp?.c1);
                    setValue('wobbe_index', data?.data_temp?.wobbeIndex);
                    setValue('sg', data?.data_temp?.sg);
                    setValue('c3_mol', data?.data_temp?.c3);
                    setValue('c2_mol', data?.data_temp?.c2);
                    setValue('c2_plus', data?.data_temp?.c2Plus);

                    setValue('ic5', data?.data_temp?.ic5); // ขาด

                    setValue('ic4', data?.data_temp?.ic4);
                    setValue('nc4', data?.data_temp?.nc4);
                    setValue('c7', data?.data_temp?.c7);
                    setValue('nc5', data?.data_temp?.nc5);
                    setValue('c6', data?.data_temp?.c6);
                    setValue('oxygen', data?.data_temp?.o2);
                    setValue('co2', data?.data_temp?.co2);
                    setValue('nitrogen', data?.data_temp?.n2);
                    setValue('mercury', data?.data_temp?.hg);
                    setValue('pressure', data?.data_temp?.dewPoint);
                    setValue('dew_point', data?.data_temp?.dewPoint);
                    setValue('moisture', data?.data_temp?.moisture);
                    setValue('hydrogen_suifide', data?.data_temp?.h2s);
                    setValue('total_sulphur', data?.data_temp?.s);
                }
            }

            setTimeout(() => {
                if (data) { setIsLoading(false); }
            }, 300);
        }
        fetchAndSetData();
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleClose = () => {
        onClose();
        setResetForm(() => reset);
    };

    const regeranatePriority: any = (data: any) => {
        return data
    }
    
    return (
        <Dialog open={open} onClose={handleClose} className="relative z-30">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <Spinloading spin={isLoading} rounded={20} />
                        <div className="flex inset-0 items-center justify-center w-full">
                            <div className="max-h-[95vh] w-full overflow-y-auto scrollbar-none">

                                <div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-6 rounded-[20px] bg-[#ffffff]">
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-md ">

                                        <div className="w-full p-4">
                                            <h2 className="text-lg sm:text-xl font-bold text-[#00ADEF] mb-4 pb-2 px-4">
                                                {`Detail`} : {data?.meteringPointId}
                                            </h2>

                                            <div className="w-full sm:w-[40%]">
                                                <div className="grid grid-cols-3 text-xs sm:text-sm font-semibold gap-2 sm:gap-4 px-4 pb-2">
                                                    <p>{`Zone`}</p>
                                                    <p>{`Area`}</p>
                                                </div>

                                                <div className="grid grid-cols-3 text-xs sm:text-sm font-light gap-2 sm:gap-4 px-4">
                                                    <p>{data?.prop?.zone?.name || ''}</p>
                                                    <p>{data?.prop?.area?.name || ''}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <form
                                            className="bg-white p-4 max-w "
                                            onSubmit={handleSubmit(async (data) => { })}
                                        >

                                            <div className="w-full grid grid-cols-[180px_120px_260px_120px_240px_120px] gap-2 ">
                                                <div className="font-semibold text-[#464255] px-4">Parameter</div>
                                                <div className="font-semibold text-[#464255]">Value</div>

                                                <div className="font-semibold text-[#464255] px-4">Parameter</div>
                                                <div className="font-semibold text-[#464255]">Value</div>

                                                <div className="font-semibold text-[#464255] px-4">Parameter</div>
                                                <div className="font-semibold text-[#464255]">Value</div>

                                                {
                                                    dataQuality?.map((item, index) => {
                                                        return (
                                                            <>
                                                                <div key={"detail_label_" + index} className="font-light text-sm pt-4 px-4 flex items-center">
                                                                    {item.name}
                                                                </div>

                                                                <div key={item.id} className="pt-4">
                                                                    {/* {
                                                                        item?.name !== "" && <NumericFormat
                                                                            id={`${item.id}`}
                                                                            placeholder="0.000"
                                                                            value={watch(`${item.id}`)}
                                                                            readOnly={true}
                                                                            disabled={true}
                                                                            {...register(`${item.id}`)}
                                                                            className={`inputSearchk border rounded-lg p-1 w-[120px] h-[40px] text-center ${isReadOnly && '!bg-[#EFECEC]'} text-right`}
                                                                            thousandSeparator={true}
                                                                            decimalScale={3}
                                                                            fixedDecimalScale={true}
                                                                            allowNegative={false}
                                                                            displayType="input"
                                                                        />
                                                                    } */}
                                                                    {
                                                                        item?.name !== "" && <NumericFormat
                                                                            id={`${item.id}`}
                                                                            placeholder="0.000"
                                                                            value={watch(`${item.id}`)}
                                                                            readOnly={true}
                                                                            disabled={true}
                                                                            {...register(`${item.id}`)}
                                                                            className={`border rounded-lg p-1 w-[120px] h-[40px] text-center ${isReadOnly && '!bg-[#EFECEC]'} text-right !hover:bg-transparent !hover:border-gray-300 !hover:shadow-none cursor-default hover:!p-1 focus:!p-1`}
                                                                            thousandSeparator={true}
                                                                            // decimalScale={3}
                                                                            decimalScale={item?.id == 'sg' ? 4 : 3} // V.106 ปรับค่า SG เป็นแสดงทศนิยม 4 ตำแหน่ง ถ้าส่งมาเกิน 4 ตำแหน่งก็ให้ระบบ round ค่าปกติ https://app.clickup.com/t/86euzxxrh
                                                                            fixedDecimalScale={true}
                                                                            allowNegative={false}
                                                                            displayType="input"
                                                                            style={{
                                                                                textAlign: "right",
                                                                            }}
                                                                        />
                                                                    }
                                                                </div>
                                                            </>
                                                        )
                                                    }
                                                    )
                                                }
                                            </div>

                                            <div className="flex justify-end pt-6">
                                                {
                                                    mode === 'view' ?
                                                        <button type="button" onClick={onClose} className="w-[167px] font-semibold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                                            {`Close`}
                                                        </button>
                                                        :
                                                        <button type="button" onClick={onClose} className="w-[167px] font-semibold bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                                            {`Cancel`}
                                                        </button>
                                                }
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalViewDetail;