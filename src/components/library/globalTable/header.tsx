import { useState } from "react";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const TableHeader = (data:any) => {
    // const headers = data.length > 0 ? Object.keys(data[0]) : [];
    // const headers = data?.data?.length > 0 ? Object.keys(data?.data) : [];
    const headers = data?.data?.length > 0 ? data?.data : [];

    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

    const handleSort = (key: string, direction: string) => {
        const sortedData = [...data].sort((a:any, b:any) => {
          if (a[key] < b[key]) {
            return direction === 'ascending' ? -1 : 1;
          }
          if (a[key] > b[key]) {
            return direction === 'ascending' ? 1 : -1;
          }
          return 0;
        });
        // setData(sortedData);
    };

    const onSort = (key: string) => {
      let direction = 'ascending';
      if (sortConfig.key === key && sortConfig.direction === 'ascending') {
        direction = 'descending';
      }
      setSortConfig({ key, direction });
      handleSort(key, direction);
    };

    const getArrowIcon = (key: string) => {
        if (sortConfig.key !== key) return null;
        if (sortConfig.direction === 'ascending') return <ArrowUpwardIcon fontSize="small" />;
        if (sortConfig.direction === 'descending') return <ArrowDownwardIcon fontSize="small" />;
        return null;
    };

    return (
        <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-1">
            <tr className="h-9">
                {
                    headers.map((header:any) => (
                        <th scope="col" key={header} className="px-2 py-1">{header}</th>
                    ))
                }
            </tr>
        </thead>
    );
};

export default TableHeader