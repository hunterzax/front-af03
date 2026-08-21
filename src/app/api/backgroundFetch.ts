import { fetchAllData } from '@/hook/fetchAllMaster';
import cron from 'node-cron';
// import { fetchAllData } from '../../utils/fetchAllData';

let jobStarted = false;

export default function handler(req: any, res: any) {
    // if (!jobStarted) {
    //     jobStarted = true;

    //     // Run the job every 2 minutes
    //     cron.schedule('*/2 * * * *', async () => {
    //         // Running scheduled task: Fetching all APIs
    //         // await fetchAllData();
    //     });

    //     // Cron job started
    //     res.status(200).json({ message: 'Cron job started for fetching data.' });
    // } else {
    //     res.status(200).json({ message: 'Cron job already running.' });
    // }
}