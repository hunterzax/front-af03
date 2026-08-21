import React, { useRef } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
} from "@headlessui/react";
import { useEffect, useState } from "react";
import { getService, uploadFileService } from "@/utils/postService";
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Spinloading from "@/components/other/spinLoading";
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
        setError,
        clearErrors,
    } = useForm<any>({
        defaultValues: data,
    });

    const [fileName, setFileName] = useState('No file Choose');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isHovered, setIsHovered] = useState(false); // State for hover effect
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (mode === "edit" || mode === "view") {
            setValue("url", data?.url || "");
            const file_name: any = data?.url
            setFileName(file_name)
        }
    }, [data, mode, setValue]);

    useEffect(() => {
      if(open == false){
        setTimeout(() => {
            handleClose();
            clearErrors();
        }, 300);
      }
    }, [open])
    

    useEffect(() => {
        setResetForm(() => reset);
    }, [reset, setResetForm]);

    useEffect(() => {
      console.log('previewUrl : ', previewUrl);
    }, [previewUrl])
    

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                setError("file", {
                    type: "custom",
                    message: "The file is larger than 10 MB.",
                });
                return;
            }

            if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
                setFileName(file.name);

                try {
                    setIsLoading(true)
                    const response: any = await uploadFileService('/files/uploadimage/', file);
                  
                    setValue("url", response?.file?.url);
                    setPreviewUrl(response?.file?.url)
                    // setValue("url", response?.files[0]?.url);
                    // setPreviewUrl(response?.files[0]?.url)
                    if (errors?.file) {
                        clearErrors('file');
                    }
                } catch (error) {
                    // File upload failed:
                }
                finally {
                    setIsLoading(false)
                }

            } else {
                setFileName('Invalid file type. Please upload a PDF.');
                // Invalid file type:'
            }
        } else {
            setFileName('No file Choose');
        }
    };

    const fileInputRef: any = useRef(null);
    const handleButtonClick = () => {
        // Trigger a click on the file input when the button is clicked
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleClose = () => {
        setFileName('No file Choose')
        setPreviewUrl(null); // Clear the preview URL
    };

    return (
        <Dialog open={open} onClose={() => {
            handleClose()
            onClose()
        }} className="relative z-20">
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
                        <Spinloading spin={isLoading} rounded={20} />
                        <div className="flex inset-0 items-center justify-center ">
                            <div className="flex flex-col items-center justify-center gap-2 rounded-md">
                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="bg-white p-8 rounded-[20px] shadow-lg max-w  !w-[600px]"
                                >
                                    <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{mode == "create" ? `Upload Image` : mode == "edit" ? "Edit Image" : "View Image"}</h2>

                                    <div
                                        className="p-4 rounded-[12px] w-full h-[200px] bg-[#FFFFFF] border-dashed border-[#CDCDCD] border-[2px] flex flex-col justify-center items-center text-center cursor-pointer"
                                    >
                                        {previewUrl ? (<div className=" relative flex justify-center items-center ">
                                            <img
                                                className="max-w-[140px] max-h-full object-contain" // Maintain aspect ratio within max dimensions
                                                src={previewUrl}
                                                alt="Uploaded Preview"
                                                onMouseEnter={() => setIsHovered(true)} // Show close button on hover
                                                onMouseLeave={() => setIsHovered(false)} // Hide close button on mouse leave
                                            />
                                            {isHovered && (
                                                <button
                                                    onClick={handleClose}
                                                    onMouseEnter={() => setIsHovered(true)}
                                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#58585A] text-white w-[40px] h-[40px] rounded-full flex justify-center items-center cursor-pointer"
                                                >
                                                    <CloseOutlinedIcon sx={{ fontSize: '20px' }} />
                                                </button>
                                            )}
                                        </div>
                                        ) : (
                                            <img className="w-[140px] h-auto mr-2" src="/assets/image/upload_bg.png" alt="Upload Icon" />
                                        )}
                                    </div>
                                    <div className="text-[#1473A1] text-xs pt-2">{`Supports: JPG, PNG (Max 1920 x 1080px)`}</div>

                                    <div>
                                        <input
                                            type="file"
                                            accept="image/png, image/jpeg"
                                            {...register('file', { required: (fileName !== 'No file Choose' && fileName !== 'The file is larger than 10 MB.') ? false : "Please Choose File" })}
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        <div className="w-full pt-2">
                                            <button
                                                type="button"
                                                className="w-full font-bold bg-[#17AC6B] hover:bg-[#09995b] text-white py-2 rounded-lg focus:outline-none duration-200 ease-in-out"
                                                onClick={handleButtonClick}
                                            >
                                                {`Upload`}
                                            </button>
                                        </div>

                                        {errors?.file && (<p className="text-red-500 text-[14px]">{errors?.file?.message ? String(errors?.file?.message) : `Please Choose File`}</p>)}
                                    </div>

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
                                                {mode === "create" ? "Add" : "Save"}
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