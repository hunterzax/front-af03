import React, { useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Spinloading from "@/components/other/spinLoading";
import SelectFormProps from "@/components/other/selectProps";

type FormExampleProps = {
    mode?: "download" | "upload";
    open: boolean;
    dataTable?: any;
    shipperGroupData: any;
    setIdShipper: any;
    handleButtonDownload: any;
    handleClickUpload: any;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    isLoading?: boolean;
    setisLoading?: any
};

const ModalSelShipper: React.FC<FormExampleProps> = ({
    mode,
    open,
    shipperGroupData,
    setIdShipper,
    handleButtonDownload,
    handleClickUpload,
    onClose,
    onSubmit,
    isLoading = false,
    setisLoading
}) => {
    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
        watch,
        clearErrors
    } = useForm<any>({
        defaultValues: {},
    });
    const selectboxClass = "flex w-full h-[46px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
    const [isSelected, setIsSelected] = useState<any>(false);

    useEffect(() => {
        if (open == false) {
            onClose();
            setIdShipper(null)
            setIsSelected(false);
            reset();
        }
    }, [open])


    // const [isLoading, setIsLoading] = useState<boolean>(false);

    const updateValue = (fieldName: string, value: any) => {
        setValue(fieldName, value);
        setIdShipper(value)
        clearErrors(fieldName);
        setIsSelected(true)
    };

    const handleClose = () => {
        onClose();
        setIdShipper(null)
        setIsSelected(false);
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
                                        setisLoading(true);
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
                                                htmlFor="group_id"
                                                className="block mb-2 text-sm font-light"
                                            >
                                                <span className="text-red-500">*</span>
                                                {`Shipper Name`}
                                            </label>
                                            {/* <Select
                                                id="group_id"
                                                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                                {...register("group_id", { required: "Select Shipper Name" })}
                                                disabled={false}
                                                value={watch("group_id") || ""}
                                                className={`${selectboxClass} ${errors.group_id && "border-red-500"}`}
                                                sx={{
                                                    '.MuiOutlinedInput-notchedOutline': {
                                                        // borderColor: '#DFE4EA', // Change the border color here
                                                        borderColor: errors.group_id && !watch('group_id') ? '#FF0000' : '#DFE4EA',
                                                    },
                                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: errors.group_id && !watch("group_id") ? "#FF0000" : "#d2d4d8"
                                                    },
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#d2d4d8',
                                                    },
                                                }}
                                                onChange={(e) => {
                                                    updateValue("group_id", e.target.value);
                                                }}
                                                displayEmpty
                                                renderValue={(value: any) => {
                                                    if (!value) {
                                                        return <Typography color="#9CA3AF" fontSize={14}>{`Select Shipper Name`}</Typography>;
                                                    }
                                                    return shipperGroupData?.find((item: any) => item.id === value)?.name || '';
                                                }}
                                                MenuProps={{
                                                    PaperProps: {
                                                        style: {
                                                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                                                        },
                                                    },
                                                }}
                                            >
                                                {shipperGroupData?.length > 0 && shipperGroupData?.map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        {item.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {errors.group_id && (<p className="text-red-500 text-sm">{`Select Shipper Name`}</p>)} */}

                                            <SelectFormProps
                                                id={'group_id'}
                                                register={register("group_id", { required: "Select Shipper Name" })}
                                                disabled={false}
                                                valueWatch={watch("group_id") || ""}
                                                handleChange={(e) => {
                                                    updateValue("group_id", e.target.value);
                                                    if (errors?.group_id) { clearErrors('group_id') }
                                                }}
                                                errors={errors?.group_id}
                                                errorsText={'Select Shipper Name'}
                                                options={shipperGroupData}
                                                optionsKey={'id'}
                                                optionsValue={'id'}
                                                optionsText={'name'}
                                                optionsResult={'name'}
                                                placeholder={'Select Shipper Name'}
                                                pathFilter={'name'}
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

                                        <button
                                            type="button"
                                            className={`w-[167px] font-semibold  text-white py-2 rounded-lg focus:outline-none focus:bg-blue-600 ${isSelected ? 'bg-[#36B1AB] hover:bg-[#2d9690]' : 'bg-[#9CA3AF] cursor-not-allowed'}`}
                                            disabled={!isSelected}
                                            onClick={() => {
                                                if (mode == 'download') {
                                                    handleButtonDownload();
                                                } else if (mode == 'upload') {
                                                    setisLoading(true);
                                                    setTimeout(() => {
                                                        handleClickUpload();
                                                    }, 100);
                                                }
                                            }}
                                        >
                                            {mode == 'download' ? `Download` : 'Upload'}
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

export default ModalSelShipper;