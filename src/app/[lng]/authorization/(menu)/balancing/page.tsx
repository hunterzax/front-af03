"use client";
import { useEffect } from "react";
import { useTranslation } from "@/app/i18n/client";
import Link from "next/link";
import EqualizerOutlinedIcon from '@mui/icons-material/EqualizerOutlined';
interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const {
        params: { lng },
    } = props;
    const { t } = useTranslation(lng, "mainPage");

    // ใส่ useEffect และ use client เพื่อจำลองว่าเป็น client site
    // useEffect(() => { }, []);
    return (
        <>
            {/* <div
                className="min-h-screen bg-no-repeat bg-center bg-cover"
                style={{
                    backgroundImage: "url('http://10.100.101.126:9010/exynos/20240918092746_original_photo_2024-09-18_16-27-40.jpg')", // Replace with your SVG path
                }}
            >
                <h1 className="text-center text-white text-3xl pt-10">{`Allocation`}</h1>
                <div className="flex justify-center items-center mt-5">
                </div>
            </div> */}

            <div
                className="w-full h-[calc(100vh-160px)] flex items-center bg-cover bg-center"
                // style={{ backgroundImage: 'url("/assets/image/bg_menu_04.png")' }}
            >
                <div className="w-full h-[calc(100vh-160px)] flex items-center">
                    <div className="flex flex-col items-center p-6">
                        <div className="flex items-center justify-center w-[120px] h-[120px] bg-white border-2 border-[#00ADEF] text-[#00ADEF] rounded-full">
                            <div className="text-center">
                                <EqualizerOutlinedIcon sx={{ color: "#00ADEF", fontSize: '60px' }} />
                            </div>
                        </div>
                        <div className="text-xs text-[#00ADEF] font-semibold !text-[40px] pt-6">Balancing</div>
                    </div>
                </div>
            </div>
        </>

    );
};

export default ClientPage;
