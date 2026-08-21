import React, { useState, useEffect } from "react";
import { Select, MenuItem, Checkbox, ListItemText, TextField, Typography, ListSubheader, InputAdornment } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Controller } from "react-hook-form";
import SearchIcon from '@mui/icons-material/Search';

const CustomSelectMulti: React.FC<any> = ({
    control,
    name,
    optionData,
    selectedValues,
    onChange,
    register,
    errorMsg,
    placeHolder,
    isReadOnly = false,
    error = false,
}) => {

    const selectboxClass = "flex w-full h-[46px] p-1 ps-1 pe-2 !rounded-lg text-gray-900 text-[16px] block outline-none";
    const [searchTerm, setSearchTerm] = useState("");

    const [displayedOptions, setdisplayedOptions] = useState<any>(optionData);
    const [tk, settk] = useState<boolean>(true);


    useEffect(() => {
        if (optionData?.length > 0) {
            setdisplayedOptions(optionData);
            settk(!tk);
        }
    }, [optionData])

    const handleSelectChange = (event: any) => {
        const value = event.target.value;
        if (value.includes("select-all")) {
            onChange(selectedValues.length === optionData.length ? [] : optionData.map((item: any) => item.id));
            return;
        }
        onChange(value);
    };

    const isAllSelected = () => selectedValues.length === optionData.length;

    const onFilter = (string: any, mode: "search" | "clear") => {

        if (mode == "search") {
            const queryLower = string.toLowerCase().replace(/\s+/g, '')?.trim();
            let filterItems: any = optionData?.filter((f: any) => f?.nomination_point?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower));
            setdisplayedOptions(filterItems);
        } else if (mode == "clear") {
            let filterItems: any = optionData;
            setdisplayedOptions(filterItems);
        }
        settk(!tk);
    }

    return (
        <div>
            {/* <label htmlFor="nomination_point" className="block mb-2 text-[16px] font-light">
                <span className="text-red-500">*</span>
                {`Nomination Point`}
            </label> */}

            <Controller
                name={name}
                control={control}
                render={({ field }) => (

                    <Select
                        {...field}
                        // id="nomination_point"
                        {...register(name, { required: errorMsg })}
                        id={name}
                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                        multiple
                        disabled={isReadOnly}
                        value={selectedValues}
                        onChange={handleSelectChange}
                        onClose={(e: any) => onFilter(undefined, 'clear')}

                        className={`${selectboxClass} ${isReadOnly && '!bg-[#EFECEC]'} ${error && "border-red-500"}`}

                        sx={{
                            ".MuiOutlinedInput-notchedOutline": {
                                borderColor: error ? "#FF0000" : "#DFE4EA",
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#d2d4d8",
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderColor: "#d2d4d8",
                            },
                        }}
                        displayEmpty
                        renderValue={(selected: any) =>
                            selected.length === 0 ? (
                                <span className="text-[#9CA3AF] !text-[15px] placeholder-txt">{placeHolder}</span>
                            ) : (
                                <span>{`${selected.length} Selected`}</span>
                            )
                        }
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 48 * 4.5 + 8,
                                },
                            },
                            autoFocus: false,
                        }}
                    >

                        {/* Search Input */}
                        {/* <MenuItem disableRipple>
                            <TextField
                                variant="outlined"
                                placeholder="Search..."
                                fullWidth
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </MenuItem> */}

                        {
                            optionData?.length > 5 && <ListSubheader>
                                <TextField
                                    size="small"
                                    // Autofocus on textfield
                                    autoFocus
                                    placeholder="Type to search..."
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ fontSize: 16 }} />
                                            </InputAdornment>
                                        )
                                    }}
                                    className='inputSearchk'
                                    style={{ paddingLeft: '5px !important' }}
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

                        {/* 'Select All' Option */}
                        {displayedOptions?.length > 0 && (
                            <MenuItem value="select-all">
                                <Checkbox checked={isAllSelected()} />
                                <ListItemText primary={<Typography sx={{ fontWeight: "bold" }}>All</Typography>} />
                            </MenuItem>
                        )}


                        {/* Filtered Options */}
                        {displayedOptions
                            .filter((item: any) => item.nomination_point.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item: any) => (
                                <MenuItem key={item.id} value={item.id}>
                                    <Checkbox checked={selectedValues.includes(item.id)} />
                                    <ListItemText primary={item.nomination_point} />
                                </MenuItem>
                            ))}





                        {/* 'Select All' Option */}
                        {/* {optionData?.length > 0 && (
                            <MenuItem value="select-all">
                                <Checkbox checked={isAllSelected()} />
                                <ListItemText primary={<Typography sx={{ fontWeight: "bold" }}>All</Typography>} />
                            </MenuItem>
                        )} */}

                        {/* Filtered Options */}
                        {/* {displayedOptions?.length > 0 && displayedOptions?.map((item: any) => (
                            <MenuItem key={item.value} value={item.value}>
                                <ListItemText primary={item.nomination_point} />
                            </MenuItem>
                        ))} */}


                        {/* Filtered Options */}
                        {/* {optionData
                            .filter((item: any) => item.nomination_point.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((item: any) => (
                                <MenuItem key={item.id} value={item.id}>
                                    <Checkbox checked={selectedValues.includes(item.id)} />
                                    <ListItemText primary={item.nomination_point} />
                                </MenuItem>
                            ))} */}
                    </Select>

                )
                }
            />

            {error && <p className="text-red-500 text-[16px]">{`Select Nomination Point`}</p>}
        </div>
    );
};

export default CustomSelectMulti;