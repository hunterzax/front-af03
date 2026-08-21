"use client";
import * as React from 'react';
interface ModalComponentProps {
    toggleModal?: any;
    row_id?: any
    openSubmissionModal?: any
    disable?: any;
}

const BtnDetailTable: React.FC<ModalComponentProps> = ({ toggleModal, openSubmissionModal, row_id, disable }) => {
    return (
        <div
            onClick={!disable ? () => openSubmissionModal(row_id) : undefined}
            className={`flex justify-center items-center w-[100px] h-[33px] rounded-[8px] border font-semibold cursor-pointer ${disable
                    ? "border-[#B6B6B6] text-[#B6B6B6] cursor-not-allowed"
                    : "border-[#0096CE80] text-[#00ADEF] hover:bg-[#00ADEF] hover:text-[#ffffff]"
                }`}
        >
            Details...
        </div>
    );
};

export default BtnDetailTable;