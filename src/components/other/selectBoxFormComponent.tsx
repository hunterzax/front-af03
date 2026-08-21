"use client";
import { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { TextField, Typography, ListItemText, InputAdornment, ListSubheader } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface InputSectionProps {
    id: string;
    label: any;
    type?: "text" | "select" | "select-new" | "select-multi-checkbox";
    mode?: any;
    isReadOnly?: any;
    errorStat?: any;
    showRequire?: any;
    isCheckAll?: any;
    placeholder?: string;
    options?: { value: string; label: string }[];
    value: string;
    isDisabled?: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const SelectBoxForm: React.FC<InputSectionProps> = ({
    id,
    label,
    errorStat,
    isReadOnly,
    showRequire = false,
    placeholder = "",
    options = [],
    value,
    mode,
    isDisabled = false,
    onChange
}) => {
    // const selectboxClass = "w-auto h-[35px] min-w-[150px] max-w-[250px] p-1 !rounded-lg text-[#9BA3AF] text-sm block outline-none";
    const selectboxClass = "flex w-full h-[35px] p-1 ps-2 pe-2 !rounded-lg text-gray-900 text-sm block outline-none";

    const [displayedOptions, setdisplayedOptions] = useState<any>(options?.length <= 0 ? [] : options);
    const [tk, settk] = useState<boolean>(true);

    const onFilter = (string: any, mode: "search" | "clear") => {
        if (mode == "search") {
            let filterItems: any = options?.filter((f: any) => f?.label?.replace(/\s+/g, '').toLowerCase().trim().includes(string?.toLowerCase().replace(/\s+/g, '')?.trim()));
            setdisplayedOptions(filterItems);
        } else if (mode == "clear") {
            let filterItems: any = options;
            setdisplayedOptions(filterItems);
        }
        settk(!tk);
    }

    return (
        <Select
            id={id}
            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
            value={value}
            disabled={isDisabled}
            // className={selectboxClass}
            className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${errorStat && "border-red-500"}`}
            sx={{
                '.MuiOutlinedInput-notchedOutline': {
                    // borderColor: '#DFE4EA', // Change the border color here
                    borderColor: errorStat && !value ? '#FF0000' : '#DFE4EA',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: errorStat && !value ? "#FF0000" : "#d2d4d8"
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d2d4d8',
                },
            }}
            displayEmpty
            onChange={(e: any) => onChange(e)}
            onClose={(e: any) => onFilter(undefined, 'clear')}
            renderValue={(selected) => {

                if (!selected) {
                    return <Typography color="#9CA3AF" fontSize={14}>{`${placeholder}`}</Typography>;
                }

                const selectedOption = options?.find((item: any) => item.value === selected);
                return <span className="text-[#484558] ps-2 text-[14px] whitespace-nowrap overflow-hidden text-ellipsis w-[100%]">{selectedOption ? selectedOption?.label : ''}</span>;
            }}
            MenuProps={{
                autoFocus: false,
                PaperProps: {
                    sx: {
                        maxHeight: 48 * 4.5 + 8,
                    },
                },
            }}
        >
            {
                options?.length > 5 && <ListSubheader style={{ width: '100%' }}>
                    <TextField
                        size="small"
                        // Autofocus on textfield
                        autoFocus
                        placeholder="Type to search..."
                        // fullWidth
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 16 }} />
                                </InputAdornment>
                            ),
                            sx: {
                                fontSize: '14px', // 👈 change this to your desired font size
                            },
                        }}
                        className='inputSearchk'
                        // style={{ paddingLeft: '5px !important'}}
                        style={{ width: '100%', height: 40 }}
                        // onChange={(e) => setSearchText(e.target.value)}
                        onChange={(e) => e.target.value ? onFilter(e.target.value, 'search') : onFilter(undefined, 'clear')}
                        onKeyDown={(e) => {
                            if (e.key !== "Escape") {
                                // Prevents autoselecting item while typing (default Select behaviour)
                                e.stopPropagation();
                            }
                        }}
                    />
                </ListSubheader>
            }
            {/* เรียงลำดับรายการในทุก dropdown ตามตัวอักษร (ถ้าเป็น timestamp เรียงตามเวลาล่าสุด) https://app.clickup.com/t/86et0vtp9 */}
            {displayedOptions?.length > 0
                ? [...displayedOptions]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((item: any) => (
                        <MenuItem key={item.value} value={item.value}>
                            <ListItemText
                                primary={
                                    <Typography
                                        fontSize={14}
                                    // className={`${customWidthPopup ? 'w-[99%] whitespace-nowrap overflow-hidden text-ellipsis' : ''}`}
                                    >
                                        {item.label}
                                    </Typography>
                                }
                            />
                        </MenuItem>
                    ))
                : []
            }
        </Select>
    )
}