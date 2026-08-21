// import { withSentryConfig } from '@sentry/nextjs';
// import withPWA from 'next-pwa';

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   swcMinify: false,
//   images: {
//     domains: ["raw.githubusercontent.com", "flowbite.com", "10.100.101.126:9010", "demo4.nueamek.com"],
//   },
//   output: 'standalone', // Added standalone output configuration
//   webpack: (config) => {
//     config.resolve.alias.canvas = false;
//     return config;
//   },
// };

// const sentryWebpackPluginOptions = {
//   silent: true, // Suppresses all logs
//   telemetry: false,
// };

// // Use withPWA to wrap nextConfig, disable PWA in development mode
// const pwaConfig = withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development', // ปิด PWA ในโหมดพัฒนา
// })(nextConfig);

// // Combine with Sentry configuration
// const combinedConfig = withSentryConfig(
//   pwaConfig,
//   // sentryWebpackPluginOptions // เปิดใช้งานตัวเลือกนี้
// );

// export default combinedConfig;





// import withPWA from 'next-pwa';

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   swcMinify: false,
//   // images: {
//   //   domains: ["raw.githubusercontent.com", "flowbite.com", "10.100.101.126:9010", "demo4.nueamek.com"],
//   // },
//   output: 'standalone',
//   webpack: (config) => {
//     config.resolve.alias.canvas = false;
//     return config;
//   },
// };

// // PWA (ปิดใน dev)
// const combinedConfig = withPWA({
//   dest: 'public',
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === 'development',
// })(nextConfig);

// export default combinedConfig;






/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  // images: {
  //   domains: ["raw.githubusercontent.com", "flowbite.com", "10.100.101.126:9010", "demo4.nueamek.com"],
  // },
  output: 'standalone',
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};


export default nextConfig; // ⬅️ ส่ง config เดิมโดยไม่ห่อ withPWA