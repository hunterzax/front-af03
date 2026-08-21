"use client";
import * as React from 'react';

// interface ModalComponentProps {
//     toggleModal?: any;
//     row_id?: any
//     openSubmissionModal?: any
//     disable?: any;
// }

const NodataTable: React.FC<any> = ({ textRender = "No data." }) => {
    return (
        <div className="flex flex-col justify-center items-center w-[100%] pt-24 pb-24">
            <img className="w-[40px] h-auto mb-2" src="/assets/image/no_data_icon.svg" alt="No data icon" />
            <div className="text-[16px] text-[#9CA3AF]">
                {/* No data. */}
                {textRender}
            </div>
        </div>
    );
};

export default NodataTable;