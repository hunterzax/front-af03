// utils/startCronJob.ts
import cron from 'node-cron';
import { fetchAllData } from '@/hook/fetchAllMaster';

let jobStarted = false;

export function startCronJob() {
  if (!jobStarted) {
    jobStarted = true;

    // Run the job every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
      // Running scheduled task: Fetching all APIs
    //   await fetchAllData();
    });

    // Cron job started
  }
}
