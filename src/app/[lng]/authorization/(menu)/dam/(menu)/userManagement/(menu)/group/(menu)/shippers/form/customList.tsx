import React, { useState } from 'react';
import { TextField, List, ListItem, ListItemIcon, ListItemText, Checkbox, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface CustomListProps {
  items: any[];
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  handleToggle: (value: any) => () => void;
  checked: number[];
  listType: 'left' | 'right';
  placeholder?: string
}

const CustomList: React.FC<CustomListProps> = ({
  items,
  searchValue,
  setSearchValue,
  handleToggle,
  checked,
  listType,
  placeholder = 'Search'
}) => {
  return (
    <div className="pt-2">

      <div className="flex-1 relative ">
        <TextField
          variant="outlined"
          size="small"
          label=""
          InputLabelProps={{ shrink: true }}
          className='rounded-lg '
          fullWidth
          placeholder={placeholder}
          value={searchValue}
          // onChange={(e) => setSearchValue(e.target.value)}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{
            '.MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
            '.MuiOutlinedInput-notchedOutline': {
              // borderColor: '#DFE4EA',
              borderColor: '#DFE4EA',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#DFE4EA !important',
            },
            '&.Mui-focused .MuiOutlinedI nput-notchedOutline': {
              borderColor: '#00ADEF',
            },
            '&.MuiInputBase-input::placeholder': {
              color: '#9CA3AF', // Placeholder color
              fontSize: '14px', // Placeholder font size
            },
            '& .Mui-disabled': {
              color: '#58585A', // Disabled text color
            },
            "& .MuiOutlinedInput-input::placeholder": {
              fontSize: "14px",
              color: '#464255', // Placeholder color
            },
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#00ADEF !important", // 👈 force black border on focus
              borderWidth: '1px', // 👈 Force border 1px on focus
            },
          }}
        />

        <SearchIcon
          className="text-[#464255] absolute cursor-pointer top-1/2 transform -translate-y-1/2 right-2"
          style={{ fontSize: '18px' }}
        />
      </div>

      <div className="font-light mt-2 mb-2 bg-[#1473A1] h-[35px] w-full rounded-t-[6px] text-center justify-center p-2 text-[#ffffff]">
        {listType === 'left' ? 'Available Point' : 'Group ID'}
      </div>
      {
        items && items.length > 0 ?
          <Box className="w-72 h-96 pt-5 border rounded-b-[6px] overflow-auto -mt-2">
            <List dense component="div" role="list">
              {/* {items && items?.filter((item:any) => item.toString().includes(searchValue)) */}
              {items && items?.filter((item: any) => item?.name?.replace(/\s+/g, '').toLowerCase().trim().includes(searchValue.toLowerCase()))
                .map((value: any) => {
                  const labelId = `transfer-list-item-${value.id}-label`;

                  return (
                    <ListItem key={value.id} role="listitem" button onClick={handleToggle(value)}>
                      <ListItemIcon>
                        <Checkbox
                          checked={checked.indexOf(value) !== -1}
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </ListItemIcon>
                      <ListItemText id={labelId} primary={`${value.name}`} />
                    </ListItem>
                  );
                })}
            </List>
          </Box>
          :
          <div className="flex flex-col items-center justify-center w-72 h-96 pt-5 border rounded-b-[6px] overflow-auto -mt-2">
            <div className='flex justify-center mb-2'>
              <img className="w-[40px] h-auto" src="/assets/image/no_data_icon.svg" alt="No data icon" />
            </div>
            <div className='flex text-[#9CA3AF] justify-center'>
              {listType === 'left' ? 'Please Select Areas' : 'Please Select Available Points'}
            </div>
          </div>

      }

    </div>
  )
};

export default CustomList;