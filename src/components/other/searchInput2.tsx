// สำหรับใช้กับ tanstack table

import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputProps {
    // onSearch: (query: string) => void;
    setGlobalFilter: (query: string) => void;
    onKeyDown?: (query: string) => void;
    onBlur?: (query: string) => void;
    value?: string;
    clear?: boolean;
    onClear?: any;
}

const SearchInput2: React.FC<SearchInputProps> = ({ clear = undefined, onClear, setGlobalFilter, onKeyDown, onBlur }) => {
    const modified_k = "block w-[400px] lg:w-[400px] md:w-[250px] sm:w-[150px]  p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[43px] text-[14px] rounded-[6px] border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
    const icon_modified_k = "text-[#58585A] absolute cursor-pointer top-[13px] right-[8px]"
    const iconClasses = "text-[#58585A] absolute cursor-pointer top-[13px] right-[10px]";
    const inputClasses = "block w-[150px] sm:w-[250px] md:w-[400px] lg:w-[400px] p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-12 h-[43px] text-[14px] rounded-[6px] border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";

    useEffect(() => {
        handleClear();
    }, [clear])

    const handleClear = async () => {
        if (clear) {
            let status: any = true;
            await onClear(status);
            setSearchQuery('')
        }
    }

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        setGlobalFilter(query);
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            onKeyDown?.(searchQuery);
        }
    };

    return (
        <div className="relative">
            <SearchIcon
                className={`${icon_modified_k}`}
                style={{ fontSize: '18px' }}
            />
            {/* <input
                type="text"
                value={value}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className={`block w-[400px] lg:w-[400px] md:w-[250px] sm:w-[150px]  p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[43px] text-[14px] rounded-[6px] border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]`}
                placeholder="Search"
            /> */}
            {/* <input
                type="text"
                value={value}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className={inputClasses}
                placeholder="Search"
                aria-label="Search input"
            /> */}

            <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyPress}
                onBlur={() => onBlur?.(searchQuery)}
                className={inputClasses}
                placeholder="Search"
                aria-label="Search input"
            />

        </div>
    );
};

export default SearchInput2;