import React from 'react';
import { Button } from "@material-tailwind/react";
import { Search } from "@mui/icons-material";

interface BtnTextProps {
    handleFieldCilck?: () => void;
    marginL?: boolean;
    isDisabled?: any;
    text?: any;
}

const BtnText: React.FC<BtnTextProps> = ({ text, handleFieldCilck, marginL = false, isDisabled = false }) => {
    const original_k = `flex items-center rounded-[6px] justify-center gap-3 px-2 h-[44px] bg-[#00ADEF] mt-auto !shadow-none text-xs py-3`

    return (
        <Button className={`${original_k} disabled:!bg-black`} style={{marginLeft: marginL == true ? "8px" : "0px"}} onClick={handleFieldCilck} disabled={isDisabled}>
            <span className="text-xs normal-case text-center text-white font-bold">{`${text}`}</span>
            {/* {text} */}
        </Button>
    );
};

export default BtnText;