import React, { useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { getService, uploadFileService } from "@/utils/postService";
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
type FormData = {
    url: string;
};

type FormExampleProps = {
    mode?: "create" | "edit" | "view";
    data?: Partial<FormData>;
    open: boolean;
    onClose: () => void;
    onSubmit: SubmitHandler<FormData>;
    setResetForm: (reset: () => void) => void;
};

const ModalAction: React.FC<FormExampleProps> = ({
    mode = "create",
    data = {},
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

     
    const [fileName, setFileName] = useState('No file chosen');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isHovered, setIsHovered] = useState(false); // State for hover effect

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            // const filteredData = sysParamModule.find((item: any) => item.id === data?.menus_id);
            // setSubSystem(sysParamModule.find((item: any) => item.id === data?.menus_id))
            setValue("url", data?.url || "");
            const file_name: any = data?.url
            setFileName(file_name)
        }
    }, [data, mode, setValue]);

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'image/png') {
                setFileName(file.name);

                try {
                    const response:any = await uploadFileService('/files/uploadimage/', file);
                     
                    setValue("url", response?.files[0]?.url);
                    setPreviewUrl(response?.files[0]?.url)
                } catch (error) {
                    // File upload failed:
                }

            } else {
                setFileName('Invalid file type. Please upload a PDF.');
                // Invalid file type:'
            }
        } else {
            setFileName('No file chosen');
        }
    };

    const fileInputRef: any = useRef(null);

    const handleClick = () => {
        fileInputRef.current.click(); // Trigger file input click
    };

    const handleClose = () => {
        setPreviewUrl(null); // Clear the preview URL
    };
    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
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
                            <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w  !w-[700px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{mode == "create" ? `Upload Image` : mode == "edit" ? "Edit Image" : "View Image"}</h2>

                                    {
                                        !previewUrl && <div
                                            className="p-4 rounded-[6px] w-full h-[200px] bg-[#FAFAFA] border-dashed border-[#CDCDCD] border-[2px] flex flex-col justify-center items-center text-center cursor-pointer"
                                            onClick={handleClick} // Trigger file input click on div click
                                        >
                                            <div>
                                                <CloudUploadOutlinedIcon sx={{ color: "#5B6066" }} />
                                            </div>
                                            <div className="text-[#5B6066] text-xs">
                                                <span className="font-bold text-xs">Click to upload </span>
                                            </div>
                                            <div className="text-[#5B6066] text-xs">
                                                {/* file format support  only PNG */}
                                                Supports: JPG, PNG (Max 1920 x 1080px)
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/png"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden" // Hide the file input
                                            />
                                        </div>
                                    }

                                    {previewUrl && (
                                        <div className="relative mt-4">
                                            <img
                                                onMouseEnter={() => setIsHovered(true)} // Show close button on hover
                                                onMouseLeave={() => setIsHovered(false)} // Hide close button on mouse leave
                                                src={previewUrl}
                                                alt="Uploaded Preview"
                                                className={`w-full h-auto rounded mt-2 transition-opacity duration-300 ${isHovered && 'opacity-25'}`} // Fade effect on hover
                                            />
                                            {isHovered && ( 
                                                <button
                                                    onClick={handleClose}
                                                    onMouseEnter={() => setIsHovered(true)} // Show close button on hover
                                                    className="absolute top-1/2 left-1/2 bg-[#58585A] text-white w-[60px] h-[60px] rounded-full flex justify-center items-center cursor-pointer"
                                                >
                                                    <CloseOutlinedIcon sx={{fontSize: '30px'}}/>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-6">
                                        {mode === "view" ? (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {`Close`}
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                                            >
                                                {`Cancel`}
                                            </button>
                                        )}

                                        {mode !== "view" && (
                                            <button
                                                type="submit"
                                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                            >
                                                {mode === "create" ? "Upload" : "Save"}
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default ModalAction;
