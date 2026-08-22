import * as React from 'react';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { iconButtonClassBtnGeneral } from '@/utils/generalFormatter';
interface ModalComponentProps {
    togglePopover: any;
    row_id: any;
    disable?: any;
    btnRef?: any;
    subTabIndexview?: any
}

const BtnActionTable: React.FC<ModalComponentProps> = ({ togglePopover, row_id, disable, btnRef, subTabIndexview }) => {

    return (

        // <button
        //     ref={btnRef}
        //     type="button"
        //     onClick={(e?: any) => {
        //         e.stopPropagation(); // กันกดแล้วไปโดน <tr>

        //         if (e && 'currentTarget' in e) {
        //             togglePopover(row_id, e.currentTarget, subTabIndexview)
        //         } else {
        //             togglePopover(row_id)
        //         }
        //     }}
        //     className={`px-[2px] py-[2px] rounded-md border border-[#DFE4EA] transition duration-300 ease-in-out ${disable ? 'bg-[#B6B6B6] text-[#999] cursor-not-allowed' : 'bg-[#ffffff] hover:bg-blue-600 text-[#000] hover:text-[#fff]'}`}
        //     disabled={disable}
        // >
        //     <MoreHorizIcon
        //         sx={{
        //             fontSize: 20,
        //             color: disable ? '#8c8c8c' : '#000',
        //             '&:hover': {
        //                 color: disable ? '#8c8c8c' : '#fff', // Make the icon white on hover
        //             },
        //         }}
        //     />
        // </button>

        <button
            ref={btnRef}
            type="button"
            onClick={(e?: any) => {
                e.stopPropagation(); // กันกดแล้วไปโดน <tr>

                if (e && 'currentTarget' in e) {
                    togglePopover(row_id, e.currentTarget, subTabIndexview)
                } else {
                    togglePopover(row_id)
                }
            }}
            // className={`px-[2px] py-[2px] rounded-md border border-[#DFE4EA] transition duration-300 ease-in-out ${disable
            //     ? 'bg-[#B6B6B6] text-[#999] cursor-not-allowed'
            //     : 'bg-[#ffffff] hover:bg-blue-600 text-[#000] hover:text-[#fff]'
            //     }`}
            className={`${iconButtonClassBtnGeneral} ${disable && '!bg-[#B6B6B6] !text-[#999] !cursor-not-allowed'} `}
            disabled={disable}
        >
            <MoreHorizIcon
                fontSize="inherit"
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-[1px]"
                sx={{ color: 'currentColor', fontSize: 20 }}
            />
        </button>
    );
};

export default BtnActionTable;