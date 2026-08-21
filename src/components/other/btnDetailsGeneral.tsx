"use client";
import * as React from 'react';
interface ModalComponentProps {
    toggleModal?: any;
    row_id?: any
    handleFunc?: any
    disable?: any;
}

const BtnDetailGeneral: React.FC<ModalComponentProps> = ({ toggleModal, handleFunc, row_id, disable }) => {
    return (
        <div
            onClick={!disable ? () => handleFunc() : undefined}
            className={`flex justify-center items-center w-[100px] h-[33px] rounded-[8px] border font-semibold cursor-pointer bg-[#ffffff] ${disable
                    ? "border-[#B6B6B6] text-[#B6B6B6] cursor-not-allowed"
                    : "border-[#0096CE80] text-[#00ADEF] hover:bg-[#00ADEF] hover:text-[#ffffff]"
                }`}
        >
            Details...
        </div>
    );
};

export default BtnDetailGeneral;