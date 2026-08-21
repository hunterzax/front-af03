import React from 'react';
import { Select, MenuItem, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface CustomSelectProps {
    id?: string;
    value: any;
    register: any;
    onChange: (event: any) => void;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    options: { value: string | number; label: string }[];
    isReadOnly?: boolean;
    error?: boolean;
    sx?: object;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    id,
    value,
    register,
    onChange,
    disabled = false,
    className = '',
    placeholder = 'Select an option',
    options = [],
    isReadOnly = false,
    error = false,
    sx = {}
}) => {
    const selectboxClass = "flex w-full h-[35px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-sm block outline-none"

    return (
        <Select
            id={id}
            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
            {...register}
            value={value || ''}
            disabled={disabled || isReadOnly}
            className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${error && "border-red-500"}`}
            sx={{
                '.MuiOutlinedInput-notchedOutline': {
                    borderColor: '#DFE4EA', // Change the border color here
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d2d4d8',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#d2d4d8',
                },
                ...sx,
            }}
            onChange={onChange}
            displayEmpty
            renderValue={(selected) => {
                if (!selected) {
                    return <Typography color="#9CA3AF" fontSize={14}>{placeholder}</Typography>;
                }
                return options.find(option => option.value === selected)?.label || selected;
            }}
            MenuProps={{
                PaperProps: {
                    style: {
                        maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                        // width: 250, // Adjust width as needed
                    },
                },
            }}
        >
            {/* <MenuItem value="" style={{ color: '#A0A0A0', height: '30px' }}>{""}</MenuItem> */}
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    );
};

export default CustomSelect;
