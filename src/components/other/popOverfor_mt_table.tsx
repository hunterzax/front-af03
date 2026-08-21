import React, { useEffect } from 'react';
import { Popover } from '@mui/material';

interface Column {
    key: string;
    label: string;
}

interface ColumnVisibilityPopoverProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    columnVisibility: Record<string, boolean>;
    handleColumnToggle: (columnKey: string) => void;
    initialColumns: Column[];
}

const ColumnVisibilityPopoverMT: React.FC<ColumnVisibilityPopoverProps> = ({
    open,
    anchorEl,
    setAnchorEl,
    columnVisibility,
    handleColumnToggle,
    initialColumns,
}) => {


    const renderLine: any = (key: any, columnKey: any) => {
        let data: any = initialColumns;
        let findDT: any = data?.filter((item: any) => item?.parent_id == key);
        let findColumnID: any = findDT?.length > 0 ? findDT?.findIndex((item: any) => item?.key == columnKey) : null;
        if (findColumnID !== null) {
            if ((findColumnID + 1) == findDT?.length) {
                return '5px';
            } else {
                return '45px';
            }
        } else {
            return null;
        }
    }

    return (
        <Popover
            id="column-visibility-popover"
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            className="z-50 overflow-hidden"
        >
            <div className="px-4">
                <div className="mb-4">
                    <div className="flex flex-col gap-2 mt-2">
                        {initialColumns?.map((column: any) => (
                            column?.parent_id ?
                                <label key={column.key} className="flex items-center gap-2 pl-[5px]">
                                    <span
                                        className="absolute h-full border-l-2 border-gray-300 translate-y-[1px]"
                                        style={{
                                            height: renderLine(column?.parent_id, column?.key),
                                        }}
                                    />
                                    <span
                                        className="border-b-2 border-l-2 rounded-bl-lg border-gray-300"
                                        style={{ width: "15px", height: "15px" }}
                                    />
                                    <input
                                        type="checkbox"
                                        checked={columnVisibility[column.key]}
                                        onChange={() => handleColumnToggle(column.key)}
                                        className="h-4 w-4 border border-gray-400 rounded-md checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                                        style={{
                                            accentColor: '#1473A1',
                                        }}
                                    />
                                    <span className="text-[#58585A] font-semibold !text-[15px]">
                                        {column.label}
                                    </span>
                                </label>
                                :
                                <label key={column.key} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={columnVisibility[column.key]}
                                        onChange={() => handleColumnToggle(column.key)}
                                        className="h-4 w-4 border border-gray-400 rounded-md checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                                        style={{
                                            accentColor: '#1473A1',
                                        }}
                                    />
                                    <span className="text-[#58585A] font-semibold !text-[15px]">
                                        {column.label}
                                    </span>
                                </label>
                        ))}
                    </div>
                </div>
            </div>
        </Popover>
    );
};

export default ColumnVisibilityPopoverMT;
