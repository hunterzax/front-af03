import React from "react";
import { Skeleton, Box } from "@mui/material";

const ChartSkeleton = () => {
    return (
        <Box className="w-full h-72 flex flex-col items-center p-4 animate-pulse">

            <Skeleton variant="text" width={200} height={30} className="mb-4" />

            {/* Y-Axis */}
            <Box className="flex w-full h-full items-end">
                <Box className="flex flex-col justify-between h-full mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} variant="text" width={40} height={20} />
                    ))}
                </Box>

                {/* แท่งข้อมูล */}
                <Box className="flex w-full justify-around items-end">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} variant="rectangular" width={40} height={`${Math.random() * 80 + 40}px`} />
                    ))}
                </Box>
            </Box>

            {/* X labels */}
            <Box className="flex w-full justify-around mt-2">
                {Array.from({ length: 13 }).map((_, i) => (
                    <Skeleton key={i} variant="text" width={40} height={20} />
                ))}
            </Box>
        </Box>
    );
};

export default ChartSkeleton;