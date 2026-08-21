import React from 'react';
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface BtnAddNewProps {
    openCreateForm: () => void;
    textRender: any
    iconNoRender?: boolean
    can_create?: boolean
}

const BtnAddNew: React.FC<BtnAddNewProps> = ({ openCreateForm, textRender, iconNoRender, can_create }) => {
    const modified_k = "flex items-center justify-center px-4 py-0 h-[43px] w-auto max-w-[300px] bg-[#00ADEF] gap-3 rounded-[6px] text-[#fff] hover:shadow-lg transition-shadow duration-200"

    return ( can_create ? (
        <aside className="mt-auto w-auto">
            <button
                type='button'
                className={`${modified_k}`}
                onClick={openCreateForm}
            >
                <div className="!font-thin text-center justify-center normal-case text-[16px] overflow-hidden w-auto">
                    {`${textRender}`}
                </div>
                {
                    !iconNoRender && <AddCircleIcon style={{ fontSize: "17px" }} />
                }
            </button>
        </aside>)
        : null
    );
};

export default BtnAddNew;