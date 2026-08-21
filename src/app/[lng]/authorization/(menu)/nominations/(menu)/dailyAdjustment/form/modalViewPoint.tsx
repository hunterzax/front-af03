import React, { useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDateNoTime, formatNumberSixDecimal, formatNumberSixDecimalNom, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import { MenuItem, Select, TextField, Typography } from '@mui/material';
import { SubmitHandler, useForm } from 'react-hook-form';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type FormExampleProps = {
    data: any;
    open: boolean;
    onClose: () => void;
    mode?: any;
    modeShowDiv?: any;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    onSubmitUpdate: SubmitHandler<any>;
};

const ModalViewPoint: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    mode,
    onSubmitUpdate,
    modeShowDiv,
    setModalMsg,
    setModalSuccessOpen,
    setModalSuccessMsg
}) => {
    const { register, handleSubmit, setValue, reset, formState: { errors }, watch } = useForm<any>({ defaultValues: data, });

    const inputClass = "text-sm block w-[100%] text-right p-1 ps-5 pe-6 h-[44px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const labelClass = "block mb-2 text-sm font-light"
    const selectboxClass = "flex w-full h-[44px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"

    // clear state when closes
    const handleClose = () => {
        reset();
        onClose();
    };
    
    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{mode == 'view' ? `View Detail` : 'Update Status'}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-3 text-sm font-semibold text-[#58585A]">
                                    <p>{`Gas Day`}</p>
                                    <p>{`Time`}</p>
                                    <p>{`Daily Adjustment Code`}</p>
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                                    <p>{data?.gas_day ? formatDateNoTime(data?.gas_day) : ''}</p>
                                    <p>{data?.time ? data?.time : ''}</p>
                                    <p>{data?.daily_code ? data?.daily_code : ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Horizon Divider */}
                        <div className="pt-2 pb-2 w-full">
                            <hr className="border-t border-[#58585A] w-full mx-auto" />
                        </div>

                        <div
                            className={`mb-4 w-[100%] ${data?.daily_adjustment_nom?.length > 3 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                        >
                            {data && data?.daily_adjustment_nom?.map((item: any) => (
                                <>
                                    <div className="w-full">
                                        <div className="mb-4 w-[100%]">
                                            <div className="grid grid-cols-4 text-sm font-semibold text-[#58585A]">
                                                {/* https://app.clickup.com/t/9018502823/86ey4nadx */}
                                                <p>{`Nomination Point`}</p>
                                                <p>{`HV (BTU/SCF)`}</p>
                                                <p>{item?.valume_mmscfh ? `Volume (MMSCFH)` : `Volume (MMSCFD)`}</p>
                                                <p>{item?.valume_mmscfh2 ? `Energy (MMBTU/H)` : `Energy (MMBTU/D)`}</p>

                                            </div>

                                            <div className="grid grid-cols-4 text-sm font-light text-[#58585A] pt-2 gap-2">
                                                <p>{item?.nomination_point ? item?.nomination_point?.nomination_point : ''}</p>
                                                
                                                <p>
                                                    <input
                                                        id="hv"
                                                        type="text"
                                                        placeholder=""
                                                        value={item?.heating_value ? formatNumberThreeDecimal(item?.heating_value) : ''}
                                                        readOnly={true}
                                                        className={`${inputClass} !bg-[#EFECEC] pointer-events-none `}
                                                    />
                                                </p>
                                                <p>
                                                    <input
                                                        id="unit3"
                                                        type="text"
                                                        placeholder=""
                                                        value={item?.valume_mmscfd ? formatNumberSixDecimal(item?.valume_mmscfd) : item?.valume_mmscfh ? formatNumberSixDecimal(item?.valume_mmscfh) : ''}
                                                        readOnly={true}
                                                        className={`${inputClass} !bg-[#EFECEC] pointer-events-none `}
                                                    />
                                                </p>
                                                <p>
                                                    <input
                                                        id="unit2"
                                                        type="text"
                                                        placeholder=""
                                                        value={item?.valume_mmscfd2 ? formatNumberThreeDecimal(item?.valume_mmscfd2) : item?.valume_mmscfh2 ? formatNumberThreeDecimal(item?.valume_mmscfh2) : ''}
                                                        readOnly={true}
                                                        className={`${inputClass} !bg-[#EFECEC] pointer-events-none `}
                                                    />
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 pb-2 w-full">
                                        <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
                                    </div>
                                </>
                            ))}
                        </div>

                        {
                            mode == 'update' && <div className="mb-4 w-[100%]">
                                <form
                                    // onSubmit={handleSubmit(onSubmitUpdate)} 
                                    // onSubmit={handleSubmit(async (data) => { // clear state when submit
                                    //     await onSubmitUpdate(data);
                                    //     reset();
                                    // })}
                                    onSubmit={handleSubmit(async (data) => { // clear state when submit
                                        // setIsLoading(true);
                                        setTimeout(async () => {
                                            await onSubmitUpdate(data);
                                            reset();
                                        }, 100);
                                    })}
                                >
                                    <div className='pb-2'>
                                        <label className={`${labelClass} font-semibold text-[#58585A]`}>
                                            {/* <span className="text-red-500">*</span> */}
                                            {`Status`}
                                        </label>
                                        <Select
                                            id='select_user_status_in_modal'
                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                            {...register('status')}
                                            value={watch('status') || ''}
                                            className={`!w-[100%] ${selectboxClass} ${errors.status && 'border-red-500'}`}
                                            displayEmpty
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
                                            renderValue={(value: any) => {
                                                if (!value) {
                                                    return <Typography color="#9CA3AF" fontSize={15}>Select Status</Typography>;
                                                }
                                                const periodMap: { [key: string]: string } = {
                                                    "2": 'Approve',
                                                    "3": 'Reject',
                                                };
                                                return periodMap[value] || '';
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
                                            {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
                                            <MenuItem value={"2"}>Approve</MenuItem>
                                            <MenuItem value={"3"}>Reject</MenuItem>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className={`${labelClass} font-semibold text-[#58585A]`}>{`Reasons`}</label>
                                        <TextField
                                            {...register('reason')}
                                            value={watch('reason') || ''}
                                            label=""
                                            multiline
                                            onChange={(e) => {
                                                if (e.target.value.length <= 255) {
                                                    setValue('reason', e.target.value);
                                                }
                                            }}
                                            placeholder='Enter Reasons'
                                            rows={6}
                                            sx={{
                                                '.MuiOutlinedInput-root': {
                                                    borderRadius: '8px',
                                                },
                                                '.MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#DFE4EA',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#d2d4d8',
                                                },
                                                '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
                                                    borderColor: '#d2d4d8',
                                                },
                                                "& .MuiOutlinedInput-input::placeholder": {
                                                    fontSize: "14px",
                                                },
                                            }}
                                            fullWidth
                                            className='rounded-lg'
                                        />
                                        <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                            <span className="text-[13px]">{watch('reason')?.length || 0} / 255</span>
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-end pt-8">
                                        <button
                                            type="button"
                                            onClick={handleClose}
                                            className={`w-[167px] py-2 px-6 rounded-lg ${mode === "view" ? "bg-[#00ADEF] font-bold text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                        >
                                            {mode === "view" ? "Close" : "Cancel"}
                                        </button>

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[160px] font-semibold py-2 px-6 rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
                                            >
                                                {mode === "update" ? "Submit" : "Save"}
                                            </button>
                                        )}
                                    </div>

                                </form>
                            </div>
                        }

                        {
                            mode !== 'update' && <div className="w-full flex justify-end pt-8">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className={`w-[167px] py-2 px-6 rounded-lg ${mode === "view" ? "bg-[#00ADEF] font-bold text-white hover:bg-blue-600" : "bg-slate-100 text-black hover:bg-rose-500"}`}
                                >
                                    {mode === "view" ? "Close" : "Cancel"}
                                </button>

                                {mode !== "view" && (
                                    <button
                                        type="submit"
                                        className="w-[160px] font-semibold py-2 px-6 rounded-lg bg-[#00ADEF] text-white hover:bg-blue-600"
                                    >
                                        {mode === "update" ? "Submit" : "Save"}
                                    </button>
                                )}
                            </div>
                        }


                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    );
};

export default ModalViewPoint;