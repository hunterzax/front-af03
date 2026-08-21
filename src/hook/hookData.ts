import axios from "axios";
import useSWR from 'swr';

// const API_URL = process.env.NEXT_PUBLIC_API_URL

// Define a fetcher function using axios
const fetcher = (url: string) => axios.get(url, { timeout: 600000 }).then(res => res.data);

// Custom hook to fetch master data
export const getMasterData = (url: any) => {
    const { data, error, isLoading } = useSWR(`${url}`, fetcher, {
        revalidateOnFocus: false, // Optional: Prevents refetching when the window is refocused
        dedupingInterval: 60000,  // Optional: Cache the data for 1 minute
    });

    return {
        data,
        isLoading,
        error,
    };
};