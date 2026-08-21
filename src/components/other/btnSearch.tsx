import React from 'react';
import { Button } from "@material-tailwind/react";
import { Search } from "@mui/icons-material";

interface BtnSearchProps {
    // handleFieldSearch?: (mode?:any) => void;
    handleFieldSearch?: () => void;
    marginL?: boolean;
    isDisabled?: any;
}

const BtnSearch: React.FC<BtnSearchProps> = ({ handleFieldSearch, marginL = false, isDisabled = false }) => {
    const original_k = `flex items-center rounded-[6px] justify-center gap-3 px-2 h-[35px] w-[35px] bg-[#00ADEF] mt-auto !shadow-none`

    return (
        <Button className={`${original_k} disabled:!bg-black`} style={{marginLeft: marginL == true ? "8px" : "0px"}} onClick={handleFieldSearch} disabled={isDisabled}>
            <Search style={{ fontSize: "17px" }} />
        </Button>
    );
};

export default BtnSearch;