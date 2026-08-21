import React, { useEffect, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface SearchInputProps {
  onSearch: (query: string) => void;
  clear?: boolean;
  onClear?: any;
  placeHolder?: any
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, clear = undefined, onClear, placeHolder = 'Search' }) => {

  useEffect(() => {
    handleClear();
  }, [clear])

  const handleClear = async () => {
    if(clear){
      let status: any = true;
      await onClear(status);
      setSearchQuery('')
    }
  }
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const original_k = "block w-[200px] p-2 ps-5 pe-10 h-[30px] text-xs rounded-[6px] border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
  const modified_k = "block w-[400px] lg:w-[400px] md:w-[250px] sm:w-[150px]  p-2 ps-5 focus:!ps-5 hover:!ps-5 pe-10 h-[43px] text-[14px] rounded-[6px] border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"
  const figma_style = "block w-[400px] p-2 ps-5 pe-10 !h-[46px] text-xs rounded-[6px] border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]"

  const icon_figma_style = "text-[#58585A] absolute cursor-pointer top-[14px] right-[8px]"
  const icon_original = "text-[#58585A] absolute cursor-pointer top-[6px] right-[8px]"
  const icon_modified_k = "text-[#58585A] absolute cursor-pointer top-[13px] right-[8px]"
  return (
    <div className="relative">
      <SearchIcon
        // className="text-[#58585A] absolute cursor-pointer top-[6px] right-[8px]"
        className={`${icon_modified_k}`}
        style={{ fontSize: '18px' }}
      />
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearch}
        className={`${modified_k}`}
        placeholder={placeHolder}
      />
    </div>
  );
};

export default SearchInput;