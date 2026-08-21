import Select from "@mui/material/Select";
import { UseFormRegisterReturn } from "react-hook-form";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';

import { Checkbox, InputAdornment, ListItemText, ListSubheader, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import MenuItem from '@mui/material/MenuItem';

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
    sortOption?: boolean,
    specialRenderOptions?: boolean,
    isNoSort?: boolean, // ถ้าไม่ต้องการให้ option sort ส่ง true มาห
    type?: 'select-list' | 'checkbox-list',
    customWidthPopup?: number | undefined;
}

//HOW TO USE <-----------------------

{/* <SelectFormProps 
    id={'ref_id'}
    register={register("ref_id", { required: mode == 'period' ? true : false })}
    disabled={isReadOnly}
    valueWatch={stepAdd == 1 ? watch("nomination_point") : nomPointText}
    handleChange={(e) => {
        modeNewPeriod(e.target.value);
        clearErrors('ref_id');
    }}
    errors={errors?.ref_id}
    errorsText={'Select Nomination Point'}
    options={dataNomPointFiltered}
    optionsKey={'id'}
    optionsValue={'id'}
    optionsText={'nomination_point'}
    optionsResult={'nomination_point'}
    placeholder={'Select Nomination Point'}
    pathFilter={'nomination_point'}
/> */}

//----------------------------------

const selectboxClass = "flex w-full h-[44px] p-1 ps-[6px] pe-2 !rounded-lg text-gray-900 text-sm block outline-none";
const itemselectClass = "pl-[10px] text-[14px]"

const SelectFormProps: React.FC<Props> = (
    {
        id,
        register,
        disabled,
        valueWatch,
        handleChange,
        errors,
        errorsText,
        options = [],
        optionsKey,
        optionsText,
        optionsValue,
        optionsResult,
        placeholder,
        pathFilter,
        specialRenderOptions,
        isNoSort = false,
        type = 'select-list',
        customWidthPopup = undefined,
    }
) => {

    const [optionRender, setoptionRender] = useState<any>(options);
    const [optionFilter, setoptionFilter] = useState<any>(options);
    const [tk, settk] = useState<boolean>(false);

    useEffect(() => {
        setoptionFilter(() => options);
        setoptionRender(() => options);
        settk(!tk);
    }, [options])

    return (
        <>
            <Select
                id={id}
                {...register}
                multiple={type == 'checkbox-list'}
                IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                disabled={disabled}
                value={valueWatch}
                onChange={handleChange}
                className={`${selectboxClass}`}
                style={{ border: disabled ? '1px solid #dfe4ea' : errors && '1px solid #f44336', backgroundColor: disabled ? '#EFECEC' : '#FFF' }}
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
                    '&.Mui-disabled .MuiSelect-select': {
                        opacity: 1, // ยกเลิกความจางของ MUI
                        color: '#464255 !important', // สีที่คุณต้องการ
                        WebkitTextFillColor: '#464255 !important'
                    },
                }}
                displayEmpty
                renderValue={(value: any) => {
                    if (type == 'select-list') {
                        if (!value || value?.length == 0) {
                            return <Typography color="#9CA3AF" fontSize={14} className={`${disabled ? '!opacity-100' : 'opacity-100'}`}>{placeholder}</Typography>;
                        }
                        // return <span className={`${itemselectClass}`}>{optionFilter?.find((item: any) => item?.[optionsValue] === value)?.[optionsResult] || ''} </span>;

                        let render_option_select = optionFilter?.find((item: any) => item?.[optionsValue] === value)?.[optionsResult]
                        let option_special_case = optionFilter?.find((item: any) => item?.[optionsValue] === value)

                        return <span
                            className={`${itemselectClass}`}
                        >
                            {render_option_select}
                            {specialRenderOptions && option_special_case?.tariff_invoice_sent_id == 1 && <span className="w-[100px] h-[20px] bg-[#556BB626] text-[12px] text-[#556BB6] rounded-md">{` Invoice Sent `}</span>}

                        </span>;

                    } else if (type == 'checkbox-list') {
                        let selectedList = []
                        if (value) {
                            if (Array.isArray(value)) {
                                selectedList = value
                            }
                            else {
                                selectedList = [value]
                            }
                        }
                        if (selectedList?.length === 0) {
                            return <Typography color="#9CA3AF" fontSize={14} className={disabled ? 'opacity-0' : 'opacity-100'}>{placeholder}</Typography>;
                        }
                        const selectedOptions = optionFilter?.filter((item: any) => selectedList?.includes(item?.[optionsValue]));

                        return (
                            <span className={itemselectClass}>
                                {optionFilter?.length == selectedOptions?.length ? `Select All` : selectedOptions?.map((item: any) => item?.[optionsResult]).join(", ")}
                            </span>
                        );
                    }
                }}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: 48 * 4.5 + 8, // Item height * 4.5 + padding
                            // width: 250, // Adjust width as needed
                        },
                    },
                    autoFocus: false,
                    disableAutoFocusItem: true,
                }}
                onClose={() => { setTimeout(() => { setoptionRender(options) }, 200) }}
            >
                {optionFilter?.length >= 5 &&
                    <ListSubheader style={{ width: '100%' }}>
                        <TextField
                            size="small"
                            // Autofocus on textfield
                            autoFocus={true}
                            focused
                            placeholder="Type to search..."
                            // fullWidth
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ fontSize: 16 }} />
                                    </InputAdornment>
                                ),
                                sx: {
                                    fontSize: 14 // <-- ขนาดตัวอักษรนะจ้ะ
                                }
                            }}
                            className='inputSearchk'
                            style={{ width: customWidthPopup ? customWidthPopup : '100%', height: 40}}
                            onChange={(e) => {
                                const loadData: any = optionFilter;
                                if (e?.target?.value) {
                                    const queryLower = e?.target?.value.toLowerCase().replace(/\s+/g, '')?.trim();
                                    let newItem: any = optionFilter?.filter((item: any) => item?.[pathFilter]?.replace(/\s+/g, '').toLowerCase().trim().includes(queryLower));

                                    setoptionRender(() => newItem);
                                    settk(!tk);
                                } else {
                                    setoptionRender(loadData);
                                    settk(!tk);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key !== "Escape") {
                                    e.stopPropagation();
                                }
                            }}
                        />
                    </ListSubheader>
                }

                {type == 'checkbox-list' && optionFilter?.length >= 5 &&
                    <MenuItem value="all" sx={{ fontSize: "14px", color: "#454255" }}>
                        <Checkbox checked={(valueWatch ? Array.isArray(valueWatch) ? valueWatch : [valueWatch] : []).length === optionRender?.length} sx={{ padding: "0px", marginRight: "8px" }} />
                        <ListItemText primary={<span style={{ fontWeight: 'bold', fontSize: "14px" }}>{"Select All"}</span>} />
                    </MenuItem>
                }

                {/* ถ้า isNoSort เป็น true ตรง optionRender ไม่ต้อง .sort */}

                {/* เรียง A-Z */}
                {/* {optionRender
                    ?.slice()
                    .sort((a: any, b: any) => {
                        const valA = a?.[optionsText];
                        const valB = b?.[optionsText];

                        const numA = Number(valA);
                        const numB = Number(valB);

                        const bothAreNumbers = !isNaN(numA) && !isNaN(numB);

                        if (bothAreNumbers) {
                            return numA - numB;
                        }

                        // fallback ไปใช้ localeCompare ถ้าไม่ใช่เลข
                        return valA?.toString().toLowerCase().localeCompare(valB?.toString().toLowerCase());
                    })
                    .map((item: any) => {
                        if (type == 'select-list') {
                            return (
                                <MenuItem key={item?.[optionsKey]} value={item?.[optionsValue]} autoFocus={false}>
                                    <ListItemText
                                        autoFocus={false}
                                        primary={
                                            <Typography fontSize={14}>
                                                {item?.[optionsText]}
                                                {specialRenderOptions && item?.tariff_invoice_sent_id == 1 && <span className="w-[100px] h-[20px] bg-[#556BB626] text-[12px] text-[#556BB6] rounded-md">{` Invoice Sent `}</span>}
                                            </Typography>
                                        }
                                    />
                                </MenuItem>
                            )
                        } else if (type == 'checkbox-list') {
                            return (
                                <MenuItem key={item?.[optionsKey]} value={item?.[optionsValue]} autoFocus={false}>
                                    <Checkbox checked={(valueWatch ? Array.isArray(valueWatch) ? valueWatch : [valueWatch] : []).includes(item?.[optionsValue])} sx={{ padding: "0px", marginRight: "8px" }} />
                                    <ListItemText autoFocus={false} primary={<span style={{ fontSize: "14px" }}>{item?.[optionsText]}</span>} />
                                </MenuItem>
                            )
                        }
                    })
                } */}

                {/* เรียง A-Z ถ้า isNoSort = false */}
                {(
                    isNoSort
                        ? optionRender?.slice() // ไม่ sort
                        : optionRender
                            ?.slice()
                            .sort((a: any, b: any) => {
                                const valA = a?.[optionsText];
                                const valB = b?.[optionsText];

                                const numA = Number(valA);
                                const numB = Number(valB);

                                const bothAreNumbers = !isNaN(numA) && !isNaN(numB);

                                if (bothAreNumbers) {
                                    return numA - numB;
                                }

                                // fallback ไปใช้ localeCompare ถ้าไม่ใช่เลข
                                return valA?.toString().toLowerCase().localeCompare(valB?.toString().toLowerCase());
                            })
                )?.map((item: any) => {
                    if (type == 'select-list') {
                        return (
                            <MenuItem key={item?.[optionsKey]} value={item?.[optionsValue]} autoFocus={false}>
                                <ListItemText
                                    autoFocus={false}
                                    primary={
                                        <Typography fontSize={14}>
                                            {item?.[optionsText]}
                                            {specialRenderOptions && item?.tariff_invoice_sent_id == 1 && (
                                                <span className="w-[100px] h-[20px] bg-[#556BB626] text-[12px] text-[#556BB6] rounded-md">
                                                    {` Invoice Sent `}
                                                </span>
                                            )}
                                        </Typography>
                                    }
                                />
                            </MenuItem>
                        )
                    } else if (type == 'checkbox-list') {
                        return (
                            <MenuItem key={item?.[optionsKey]} value={item?.[optionsValue]} autoFocus={false}>
                                <Checkbox
                                    checked={(valueWatch ? Array.isArray(valueWatch) ? valueWatch : [valueWatch] : [])
                                        .includes(item?.[optionsValue])}
                                    sx={{ padding: "0px", marginRight: "8px" }}
                                />
                                <ListItemText
                                    autoFocus={false}
                                    primary={<span style={{ fontSize: "14px" }}>{item?.[optionsText]}</span>}
                                />
                            </MenuItem>
                        )
                    }
                })}



            </Select>
            {errors && <p className="text-red-500 text-sm">{errorsText}</p>}
        </>
    )
}

export default SelectFormProps;