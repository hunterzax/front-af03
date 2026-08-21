import {
    Select,
    MenuItem,
    ListItemText,
    ListSubheader,
    TextField,
    InputAdornment,
    Checkbox,
    Typography
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface Props {
    id: string,
    register?: UseFormRegisterReturn
    disabled: boolean | undefined
    valueWatch: any
    handleChange: (e: any) => void
    errors?: any
    errorsText?: string
    options: any
    optionsKey?: any
    optionsValue?: any
    optionsText?: any
    optionsResult?: any
    placeholder: string,
    pathFilter?: any
}

const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
const itemselectClass = "pl-[10px] text-[14px]"

const SelectFormMulti: React.FC<Props> = ({
    id,
    register,
    disabled,
    valueWatch,          // ← ❶ ต้องเป็น array<string | number> เมื่อใช้ multiple
    handleChange,        // ← ให้ return เป็น array เช่น (e) => setValue(e.target.value)
    errors,
    errorsText,
    options = [],
    optionsKey,
    optionsText,
    optionsValue,
    optionsResult,
    placeholder,
    pathFilter
}) => {
    const [optionRender, setOptionRender] = useState<any[]>(options);
    const [optionFilter, setOptionFilter] = useState<any[]>(options);

    /* รีเฟรช options หาก parent เปลี่ยน */
    useEffect(() => {
        setOptionFilter(options);
        setOptionRender(options);
    }, [options]);

    return (
        <>
            <Select
                id={id}
                multiple                                       // 👈 ❷ เปิดโหมด multiple
                {...register}
                IconComponent={(props) => (
                    <ExpandMoreIcon {...props} fontSize="medium" />
                )}
                disabled={disabled}
                value={valueWatch ?? []}                       // 👈 ❸ ค่าเป็น array
                onChange={handleChange}
                className={selectboxClass}
                style={{
                    border: errors && '1px solid #f44336',
                    backgroundColor: disabled ? '#EFECEC' : '#FFF'
                }}
                sx={{
                    '.MuiOutlinedInput-notchedOutline': { borderColor: '#DFE4EA' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d2d4d8' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d2d4d8' }
                }}
                displayEmpty
                renderValue={(selected: any) => {
                    // selected คือ array
                    if (!selected || selected.length === 0) {
                        return (
                            <Typography
                                color="#9CA3AF"
                                fontSize={14}
                                className={disabled ? '!opacity-50' : 'opacity-100'}
                            >
                                {placeholder}
                            </Typography>
                        );
                    }
                    // แสดงชื่อคั่นด้วย comma
                    const labels = optionFilter
                        .filter((opt) => selected.includes(opt[optionsValue]))
                        .map((opt) => opt[optionsResult])
                        .join(', ');
                    return <span className={itemselectClass}>{labels}</span>;
                }}
                MenuProps={{
                    PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } },
                    autoFocus: false,
                    disableAutoFocusItem: true
                }}
                onClose={() => setTimeout(() => setOptionRender(options), 200)}
            >
                {/* กล่องค้นหา */}
                {optionFilter.length >= 5 && (
                    <ListSubheader style={{ width: '100%' }}>
                        <TextField
                            size="small"
                            autoFocus
                            placeholder="Type to search..."
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 16 }} />
                                    </InputAdornment>
                                )
                            }}
                            className="inputSearchk"
                            style={{ width: '100%', height: 40 }}
                            onChange={(e) => {
                                const keyword = e.target.value?.toLowerCase().replace(/\s+/g, '').trim();
                                if (keyword) {
                                    const filtered = optionFilter.filter((item) =>
                                        item[pathFilter]
                                            ?.replace(/\s+/g, '')
                                            .toLowerCase()
                                            .includes(keyword)
                                    );
                                    setOptionRender(filtered);
                                } else {
                                    setOptionRender(optionFilter);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key !== 'Escape') e.stopPropagation();
                            }}
                        />
                    </ListSubheader>
                )}

                {/* รายการตัวเลือก */}
                {optionRender.map((item) => {
                    const value = item[optionsValue];
                    const checked = valueWatch?.includes(value);

                    return (
                        <MenuItem key={item[optionsKey]} value={value}>
                            <Checkbox checked={checked} sx={{ mr: 1 }} />
                            <ListItemText
                                primary={<Typography fontSize={14}>{item[optionsText]}</Typography>}
                            />
                        </MenuItem>
                    );
                })}
            </Select>

            {errors && <p className="text-red-500 text-sm">{errorsText}</p>}
        </>
    );
};

export default SelectFormMulti;
