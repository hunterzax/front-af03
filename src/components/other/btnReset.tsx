import React from 'react';
import { Button } from "@material-tailwind/react";
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
interface BtnResetProps {
    handleReset?: () => void;
    isDisabled?: any;
}

const BtnReset: React.FC<BtnResetProps> = ({ handleReset, isDisabled = false }) => {
    const original_k = "flex items-center rounded-[6px] justify-center gap-3 px-2 h-[35px] w-[35px] border-[#00ADEF] text-[#00ADEF] mt-auto"

    return (
        <Button
            variant="outlined"
            className={`${original_k}`}
            onClick={handleReset}
            disabled={isDisabled}
        >
            <ReplayOutlinedIcon style={{ fontSize: "20px",  }} />
        </Button>
    );
};

export default BtnReset;