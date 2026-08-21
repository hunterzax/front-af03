"use client";
import * as React from 'react';
interface ModalComponentProps {
    toggleModal?: any;
    row_id?: any
    openSubmissionModal?: any
    btnText?: any
    disable?: any;
    idToggle?: any;
}

const BtnNomination: React.FC<any> = ({ btnText, disable, isActive, onClick }) => {
    return (
        <div
            onClick={!disable ? onClick : undefined}
            className={`flex justify-center items-center w-full h-[46px] rounded-[8px] border font-semibold cursor-pointer 
                ${isActive ? "bg-[#00ADEF] text-[#ffffff] border-[#0096CE80]" : "text-[#9CA3AF] border-[#B6B6B6] hover:bg-[#00ADEF] hover:text-[#ffffff] hover:border-[#0096CE80]"}
                ${disable ? "cursor-not-allowed opacity-50" : ""}`}
        >
            {btnText}
        </div>
    );
};

export default BtnNomination;