/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    options: {
      tsConfig: {
        fileName: "tsconfig.json", // ให้มันเข้าใจ path ของ Next.js
      },
      // ไม่ตาม dependency ที่มาจาก node_modules
      doNotFollow: {
        path: "node_modules"
      },
      // ไม่ต้องวาดไฟล์จาก node_modules
      exclude: {
        path: "node_modules"
      }
    }
  };
  