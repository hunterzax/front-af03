// @ts-ignore
import { Typography } from "@material-tailwind/react";
import React from 'react';
import { Skeleton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

 
export function DefaultSkeleton() {
  return (
    <div className="max-w-full animate-pulse">
      <Typography
        as="div"
        variant="h1"
        className="mb-4 h-3 w-56 rounded-full bg-gray-300"
      >
        &nbsp;
      </Typography>
      <Typography
        as="div"
        variant="paragraph"
        className="mb-2 h-2 w-72 rounded-full bg-gray-300"
      >
        &nbsp;
      </Typography>
      <Typography
        as="div"
        variant="paragraph"
        className="mb-2 h-2 w-72 rounded-full bg-gray-300"
      >
        &nbsp;
      </Typography>
      <Typography
        as="div"
        variant="paragraph"
        className="mb-2 h-2 w-72 rounded-full bg-gray-300"
      >
        &nbsp;
      </Typography>
      <Typography
        as="div"
        variant="paragraph"
        className="mb-2 h-2 w-72 rounded-full bg-gray-300"
      >
        &nbsp;
      </Typography>
    </div>
  );
}

const TableSkeleton = () => {
  return (
      <Table>
          <TableHead>
              <TableRow>
                  {Array(10).fill(0).map((_, index) => (
                      <TableCell key={index}>
                          <Skeleton variant="text" width={100} />
                      </TableCell>
                  ))}
              </TableRow>
          </TableHead>
          <TableBody>
              {Array(2).fill(0).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                      {Array(10).fill(0).map((_, colIndex) => (
                          <TableCell key={colIndex}>
                              <Skeleton variant="rectangular" height={30} />
                          </TableCell>
                      ))}
                  </TableRow>
              ))}
          </TableBody>
      </Table>
  );
};

export default TableSkeleton;