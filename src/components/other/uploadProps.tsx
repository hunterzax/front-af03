import { useEffect, useRef, useState } from "react";
import UploadIcon from '@mui/icons-material/Upload';
import { uploadFileService } from "@/utils/postService";
import Spinloading from "./spinLoading";
import LinearProgress from '@mui/material/LinearProgress';

type components = {
    onChange?: any,
    dataLoad?: any,
    title?: string,
    alt?: string,
    fileType?: string
    setFileType?: any
    uploadTxt?: string
    required?: boolean
    requiredTxt?: string
    requiredTxtSize?: string
    requiredColor?: string
    requiredSize?: number
    progressbarOpen?: boolean
    progressbarMinval?: number
    progressbarMaxval?: number
    spinOpen?: boolean
};

const UploadProps: React.FC<components> = ({
    dataLoad, //example path url img
    onChange,
    title,
    alt,
    fileType = "image/png, image/jpeg", //example here
    setFileType,
    uploadTxt = "Upload",
    required = false,
    requiredTxt = null,
    requiredTxtSize = null,
    requiredColor = "#dedede", //example here
    requiredSize = 16, //example here
    progressbarOpen = false,
    progressbarMinval = 0, //example here
    progressbarMaxval =  100, //example here
    spinOpen = false
}) => {

    const fileInputRef: any = useRef(null);
    const [fileStatus, setfileStatus] = useState<any>();
    const [previewUrl, setPreviewUrl] = useState<any>(null);
    const [onloadUrl, setOnloadUrl] = useState<any>(dataLoad);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        // dataLoad = "https://s3.pims.co.th/tpa-sit/20250714081126_original_icon_chat.png"

        // setOnloadUrl(dataLoad ? dataLoad?.replace(/"/g, "") : "https://s3.pims.co.th/tpa-sit/20250714081126_original_icon_chat.png")
        // setOnloadUrl(dataLoad ? dataLoad?.replace(/"/g, "") : "/assets/image/no_data_icon.svg")
        setOnloadUrl(dataLoad ? dataLoad?.replace(/"/g, "") : "")
    }, [dataLoad])

    const handleFileChange = async (e: any) => {
        setIsLoading(true);
        const file = e.target.files[0];
        if (file) {
            const isValidType = file.type === 'image/png' || file.type === 'image/jpeg'; // ยังทำ function ไม่เสร็จเดะมาโมให้ใหม่ BANGJU
            const isUnder5MB = file.size <= 10 * 1024 * 1024; // 10 MB in bytes

            setFileType(file?.type)
            if (isValidType && isUnder5MB) {
                try {
                    const response: any = await uploadFileService('/files/uploadimage/', file);

                     
                    let result: any = response?.files[0];
                    setPreviewUrl(result.url);
                    onChange(result);
                    setfileStatus(undefined);
                } catch (error) {
                    setfileStatus('File upload failed.');
                    onChange(null);
                }

            } else if (isValidType == false) {
                setfileStatus('Invalid file type. PNG or JPG image only.')
                onChange(null);
            } else if (!isUnder5MB) {
                setfileStatus('File size exceeds the 10 MB limit.');
                onChange(null);
            }
        }

        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };


    //custom by BangJu

    return (
        <div className="upload-props-banju">
            <div className="fx-compo">
                <label
                    htmlFor="e_sig"
                    className="block mb-2 pt-3 text-[18px] font-light text-[#000]"
                >
                    {title}
                </label>
                <div className="uploadprops relative w-[200px]">
                    {spinOpen == true && previewUrl && <Spinloading spin={isLoading} rounded={20}/>} 
                    {
                        previewUrl == null && onloadUrl ?
                            <img
                                id="uploadprop-showcase"
                                src={onloadUrl} // if { รูป Onload จาก data }
                                // src={"https://s3.pims.co.th/tpa-sit/20250714081126_original_icon_chat.png"} // if { รูป Onload จาก data }
                                alt={alt}
                                className={`h-[100px] w-[200px] object-contain border rounded-[6px] bg-white`}
                            />
                        :
                        previewUrl && // if { หาก upload รูปจะโผล่มาที่นี่ }
                            <img
                                id="uploadprop-preview"
                                src={previewUrl}
                                alt={alt}
                                className={`h-[100px] w-[200px] object-contain border rounded-[6px] bg-white`}
                            />
                    }
                    {progressbarOpen == true && isLoading == true && <LinearProgress value={20}/>}
                </div>
            </div>
            <div className="pt-5 components">
                <label
                    onClick={() => fileInputRef.current.click()}
                    className={`bg-[#17AC6B] text-[#FFFFFF] items-center font-light rounded-[6px] text-[16px] text-justify px-5 py-3 cursor-pointer`}
                >
                    {uploadTxt}
                    <UploadIcon />
                </label>
                <div className={`text-[${requiredColor}] mt-3 text-[${requiredSize}px] ml-1`}>{requiredTxt}</div>
                <div className={`text-[${requiredColor}] text-[${requiredSize}px] ml-1`}>{requiredTxtSize}</div>
                <input
                    type="file"
                    accept={fileType}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" // Hide the file input
                />
            </div>
            {required = true && fileStatus && <div className="text-red-500">{fileStatus}</div>}
        </div>
    )

}

export default UploadProps;