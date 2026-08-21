import React from 'react';
import Pagination from '@mui/material/Pagination';
import { Skeleton } from '@mui/material';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  loading?: boolean;
  tempTotal?: any;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  tempTotal,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <>
      {loading == false ?
        <div className="h-[50px] flex items-center justify-between whitespace-nowrap w-full">
          <div className="flex items-center gap-3 text-sm">
            {`Show`}
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#DFE4EA] focus:border-[#DFE4EA] block w-full py-1 px-2"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              {tempTotal && <option value={tempTotal}>{`Total: ${tempTotal}`}</option>}
            </select>
          </div>
          <Pagination
            shape="rounded"
            page={currentPage}
            count={totalPages}
            onChange={(_, page) => onPageChange(page)}
            sx={{
              "& .Mui-selected": {
                backgroundColor: "#1473A1 !important",
                color: "#ffffff !important",
              },
            }}
          />
        </div>
        :
        <div className="h-[50px] flex items-center justify-between whitespace-nowrap w-full">
          <div className="flex items-center gap-3 text-sm">
            {`Show`}

            <Skeleton animation="wave" className='w-[100px] !h-[45px]'/>
            {/* <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-[#DFE4EA] focus:border-[#DFE4EA] block w-full py-1 px-2"
              disabled
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select> */}
          </div>
          <div className='flex gap-3 items-center'>
            <Skeleton animation="wave" className='w-[30px] !h-[45px]'/>
            <Skeleton animation="wave" className='w-[30px] !h-[45px]'/>
            <Skeleton animation="wave" className='w-[100px] !h-[45px]'/>
            </div>
        </div>
      }
    </>
  );
};

export default PaginationComponent;
