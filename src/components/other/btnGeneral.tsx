import React, { useRef, useState } from 'react';
import { Button } from "@material-tailwind/react";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import FullscreenOutlinedIcon from '@mui/icons-material/FullscreenOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import ArrowBackIosNewOutlinedIcon from '@mui/icons-material/ArrowBackIosNewOutlined';
import { Menu, MenuItem } from "@mui/material";

interface BtnGeneralProps {
    // generalFunc?: (data?: any) => void;
    generalFunc?: any;
    textRender?: any
    iconNoRender?: boolean
    bgcolor?: any
    modeIcon?: any
    disable?: any
    can_export?: any
    can_sync?: any
    can_view?: any
    can_create?: any
    handleAccept?: any
    handleReject?: any
    customWidth?: any
    customWidthSpecific?: any
    width?: number
}

const BtnGeneral: React.FC<BtnGeneralProps> = ({ generalFunc, textRender, iconNoRender, bgcolor, modeIcon, disable, can_export, can_sync, can_view, can_create, handleAccept, handleReject, customWidth, customWidthSpecific, width }) => {

    const renderIcon = (modeIcon: any) => {
        switch (modeIcon) {
            case 'add':
                return <AddCircleIcon style={{ fontSize: "16px" }} />;
            case 'sync':
                return <SyncRoundedIcon style={{ fontSize: "16px" }} />;
            case 'export_image_chart':
                return <ImageOutlinedIcon style={{ fontSize: "16px" }} />;
            case 'full_view':
                return <FullscreenOutlinedIcon style={{ fontSize: "16px" }} />;
            case 'export':
                return <DescriptionOutlinedIcon style={{ fontSize: "16px" }} />;
            case 'import':
                return <DescriptionOutlinedIcon style={{ fontSize: "16px" }} />;
            case 're-generate':
                return <AutorenewOutlinedIcon style={{ fontSize: "20px" }} />;
            case 'nom-accept':
                return <CheckOutlinedIcon style={{ fontSize: "20px" }} />;
            case 'nom-reject':
                return <CloseOutlinedIcon style={{ fontSize: "20px" }} />;
            case 'nom-action':
                // return <ArrowBackIosNewOutlinedIcon style={{ fontSize: "20px" }} />;
                return <ArrowBackIosNewOutlinedIcon style={{ fontSize: "18px", transform: "rotate(270deg)" }} />
            case 'template':
                return <FileDownloadIcon style={{ fontSize: "20px" }} />;
            case 'webservice':
                return <OpenInNewOutlinedIcon style={{ fontSize: "20px" }} />;
            default:
                return <span></span>;
        }
    };

    // ใช้กับปุ่ม Action ใน nomination --> daily mgn
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const buttonRef = useRef<HTMLButtonElement | null>(null);

    return (

        // โค้ดเดิม ก่อนเพิ่มปุ่ม Action ใน nomination
        // <aside className="mt-auto">
        //     {
        //         (
        //             modeIcon === 'export' && can_export) || 
        //             (modeIcon === 'export_image_chart' && can_export) || 
        //             (modeIcon === 'sync' && can_sync) || 
        //             (modeIcon === 're-generate' && can_create) || 
        //             (modeIcon === 'template' && can_view)  || 
        //             (modeIcon === 'import' && can_create) || 
        //             (can_view) || 
        //             (can_create) ? (
        //             <Button
        //                 className={`flex items-center justify-center gap-3 px-2 h-[43px] min-w-[120px] 
        //                     ${textRender.length > 10 ? 'w-[140px]' : 'w-[100px]'} 
        //                     ${modeIcon === 'template' && 'w-[154px] h-[44px]'} rounded-[6px] 
        //                     ${(disable && modeIcon == 'nom-reject') ? 'opacity-50 text-[#AEAEB2] border border-[#AEAEB2] cursor-not-allowed !bg-[#ffffff]' : disable ? 'opacity-50 cursor-not-allowed !bg-[#B6B6B6]' : ''}
        //                 `}
        //                 onClick={generalFunc}
        //                 style={{ backgroundColor: bgcolor }}
        //                 disabled={disable}
        //             >
        //                 <span
        //                     className="!font-thin text-center justify-center normal-case text-[16px]"
        //                     style={{
        //                         fontSize: modeIcon === 'template' ? '15px' : '14px',
        //                         whiteSpace: 'nowrap', // Prevent text from wrapping
        //                     }}
        //                 >
        //                     {`${textRender}`}
        //                 </span>
        //                 {!iconNoRender && renderIcon(modeIcon)}
        //             </Button>
        //         ) : null
        //     }
        // </aside>

        <aside className="mt-auto">
            {(modeIcon === "export" && can_export) ||
                (modeIcon === "export_image_chart" && can_export) ||
                (modeIcon === "sync" && can_sync) ||
                (modeIcon === "re-generate" && can_create) ||
                (modeIcon === "template" && can_view) ||
                (modeIcon === "import" && can_create) ||
                (modeIcon === "webservice" && can_create) ||
                can_view ||
                can_create ? (
                modeIcon === "nom-action" ? (
                    <>
                        <Button
                            ref={buttonRef}
                            className={`flex items-center justify-center gap-3 px-2 h-[43px] min-w-[120px] w-[100px] rounded-[6px]
                            ${disable ? 'opacity-50 text-[#ffffff] border border-[#AEAEB2] cursor-not-allowed !bg-[#AEAEB2]' : disable ? 'opacity-50 cursor-not-allowed !bg-[#B6B6B6]' : ''} `}
                            // onClick={handleClick}
                            onClick={disable ? undefined : handleClick}
                            style={{ backgroundColor: bgcolor }}
                        >
                            <span className="!font-thin text-center normal-case text-[16px]">
                                {`${textRender}`}
                            </span>
                            {!iconNoRender && renderIcon(modeIcon)}
                        </Button>

                        {/* Dropdown Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                                style: {
                                    width: buttonRef.current ? buttonRef.current.offsetWidth : 'auto',
                                },
                            }}
                        >
                            <MenuItem onClick={() => { handleAccept(); handleClose(); }}>Approve</MenuItem>
                            <MenuItem onClick={() => { handleReject(); handleClose(); }}>Reject</MenuItem>
                        </Menu>

                    </>
                ) : (
                    <Button
                        className={`flex items-center justify-center gap-3 px-2 h-[43px] min-w-[120px] 
                            ${customWidth && '!min-w-[200px]'}
                            ${modeIcon == 'nom-reject' && '!text-[#464255] border border-[#FFF1CE] !bg-[#FFF1CE]'}
                            ${modeIcon == 'nom-accept' && '!text-[#464255] !bg-[#C2F5CA]'}
                            ${width ? `!min-w-[${width}px]  w-[${width}px]` : textRender.length > 10 ? 'w-[140px]' : 'w-[100px]'} 
                            ${modeIcon === 'template' && 'w-[154px] h-[44px]'} rounded-[6px] 
                            ${(disable && modeIcon == 'nom-reject') ? 'opacity-50 text-[#AEAEB2] border border-[#AEAEB2] cursor-not-allowed !bg-[#ffffff]' : disable ? 'opacity-50 cursor-not-allowed !bg-[#B6B6B6]' : ''}
                        `}
                        onClick={generalFunc}
                        // style={{ backgroundColor: bgcolor }}
                        style={{ backgroundColor: bgcolor, width: customWidthSpecific }}
                        disabled={disable}
                    >
                        <span
                            className="!font-thin text-center justify-center normal-case text-[16px]"
                            style={{
                                fontSize: modeIcon === "template" ? "15px" : "16px",
                                whiteSpace: "nowrap",
                                ...(textRender === 'Approve' && { color: '#464255' }),
                            }}
                        >
                            {textRender}
                        </span>
                        {!iconNoRender && renderIcon(modeIcon)}
                    </Button>
                )
            ) : null}
        </aside>
    );
};

export default BtnGeneral;