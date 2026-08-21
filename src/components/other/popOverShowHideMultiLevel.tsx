import React, { useEffect } from "react";
import { Popover } from "@mui/material";

interface Column {
    key: string;
    label: string;
    parent_id?: string;
}

interface ColumnVisibilityPopoverProps {
    open: boolean;
    anchorEl: HTMLElement | null;
    setAnchorEl: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    columnVisibility: Record<string, boolean>;
    handleColumnToggle: (columnKey: string) => void;
    initialColumns: Column[];
}

interface ColumnNode extends Column {
    children?: ColumnNode[];
}
const buildColumnTree = (columns: Column[], parentId?: string): ColumnNode[] => {
    return columns?.filter(col => (col.parent_id ?? null) === (parentId ?? null))?.map(col => ({
            ...col,
            children: buildColumnTree(columns, col.key)
        }));
};

const ColumnVisibilityPopoverMultiLevel: React.FC<ColumnVisibilityPopoverProps> = ({
    open,
    anchorEl,
    setAnchorEl,
    columnVisibility,
    handleColumnToggle,
    initialColumns,
}) => {
    const columnTree = buildColumnTree(initialColumns);

    const renderColumns = (
        columns: ColumnNode[],
        level = 0,
        parentKey?: string,
        allColumns = initialColumns
    ) => {

        return columns?.map((column, index) => {
            const siblings = allColumns?.filter(col => col.parent_id === parentKey);
            const isLast = index === siblings.length - 1;
            const hasChildren = column.children && column.children.length > 0;
            return (
                <div key={column.key} className="relative">

                    {/* Vertical line นะ */}
                    <div
                        className="absolute border-l-2 border-gray-300"
                        style={{
                            // left: `${level * 16 + 6}px`,
                            // left: `${level * 16 + 13}px`,
                            left: level == 2 ? `${level * 21 + 13}px` : `${level * 16 + 13}px`,
                            top: '24px',
                            bottom: '0',
                            // height: '200px'
                        }}
                    />

                    {/* Horizontal + Corner line for each item */}
                    <div className="flex items-center relative" style={{ paddingLeft: level == 3 ? `${level * 22}px` : `${level * 21}px` }}>

                        {/* Horizontal line นะ */}
                        {
                            level !== 0 && (
                                <span
                                    className="absolute border-l-2 border-b-2 border-gray-300 rounded-bl-lg"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        // left: `${level * 16}px`,
                                        // left: `${level * 16 - 3}px`,
                                        left: level == 3 ? `${level * 19 - 2}px` : `${level * 16 - 3}px`,
                                        top: '50%',
                                        // transform: 'translateY(-50%)',
                                        transform: 'translateY(-80%)',
                                    }}
                                />
                            )
                        }

                        <input
                            type="checkbox"
                            checked={columnVisibility[column.key]}
                            onChange={() => handleColumnToggle(column.key)}
                            className="h-4 w-4 ml-2 border border-gray-400 rounded-md checked:bg-[#1473A1] checked:border-transparent text-white focus:ring-0"
                            style={{
                                accentColor: '#1473A1',
                            }}
                        />
                        <span className="ml-2 text-[#58585A] font-semibold text-[15px]">
                            {column.label}
                        </span>
                    </div>

                    {column.children && renderColumns(column.children, level + 1, column.key, allColumns)}
                </div>
            );
        });
    };

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
            <div className="px-4 py-4 max-h-[80vh] overflow-y-auto w-[350px]">
                <div className="flex flex-col gap-2">
                    {renderColumns(columnTree)}
                </div>
            </div>
        </Popover>
    );
};

export default ColumnVisibilityPopoverMultiLevel;
