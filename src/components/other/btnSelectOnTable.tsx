"use client";
import * as React from 'react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
interface ModalComponentProps {
    togglePopover: any;
    row_id: any
    isDisable?: any
}

const BtnSelectTable: React.FC<ModalComponentProps> = ({ togglePopover, row_id, isDisable }) => {
    return (
        <div
            // onClick={isDisable ? undefined : () => togglePopover(row_id)}
            onClick={(e?:any) => { 
                e.stopPropagation();
                if(isDisable){
                    undefined
                }else if (e && 'currentTarget' in e) {
                    togglePopover(row_id, e.currentTarget)
                } else {
                togglePopover(row_id) 
                }
            }}
            className={`flex justify-center items-center w-[100px] h-[33px] rounded-[8px] border font-semibold cursor-pointer ${isDisable
                    ? "border-[#B6B6B6] text-[#B6B6B6] cursor-not-allowed"
                    : "border-[#2B2A87] text-[#2B2A87] hover:bg-[#2B2A87] hover:text-white"
                }`}
        >
            Select
            <ExpandMoreRoundedIcon />
        </div>

    );
};

export default BtnSelectTable;