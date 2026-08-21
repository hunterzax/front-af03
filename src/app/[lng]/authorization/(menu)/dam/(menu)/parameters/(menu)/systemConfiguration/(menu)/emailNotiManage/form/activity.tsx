// รายชื่อเมนูที่มี email noti
// 1. Capacity Management ---> menu_id 49
// 2. Planning --> menu_id 44
// 3. Nomination --> menu_id 61
// 4. Allocation --> menu_id 80
// 5. Balancing --> menu_id 87
// 6. Event --> menu_id 105



    // รายชื่อ ACTIVITY ใต้ module
    // --- Module ---> Contract/Bulletin  
    // Shipper submit new contract file         --> relate กับ menu_id 49 ✅

    // --- Module ---> Contract/Release
    // Shipper submit new release               --> relate กับ menu_id 49 ✅
    // TSO accepted release capacity submission --> relate กับ menu_id 49 ✅
    // TSO rejected release capacity submission --> relate กับ menu_id 49 ✅

    // --- Module ---> Planning 
    // Shipper submit planning file  --> relate กับ menu_id 44 ✅
    // Alert to submit planning     --> relate กับ menu_id 44 ✅


    // --- Module ---> Nomination
    // Shipper submits Daily Nomination     --> relate กับ menu_id 61    ✅ 
    // Shipper submits Weekly Nomination    --> relate กับ menu_id 61.   ✅ 
    // TSO accepts Daily Nomination         --> relate กับ menu_id 61    ✅
    // TSO accepts Weekly Nomination        --> relate กับ menu_id 61    ✅
    // TSO rejects Daily Nomination         --> relate กับ menu_id 61    ✅
    // TSO rejects Weekly Nomination        --> relate กับ menu_id 61    ✅
    // Shipper submits Daily Adjustment     --> relate กับ menu_id 61    ✅
    // TSO accepts Daily Adjustment         --> relate กับ menu_id 61    ✅ 
    // Alert to submit Daily Nomination     --> relate กับ menu_id 61    ✅
    // Alert to submit Weekly Nomination    --> relate กับ menu_id 61    ✅ 


    // --- Module ---> Allocation
    // Shipper reviews allocation           --> relate กับ menu_id 80 ✅
    // TSO accepts Shipper´s Allocation     --> relate กับ menu_id 80 ✅
    // TSO rejects Shipper´s Allocation     --> relate กับ menu_id 80 ✅


    // --- Module ---> Balancing
    // TSO informs Instructed Flow          --> relate กับ menu_id 87    ✅ 
    // TSO informs Operational Flow Order   --> relate กับ menu_id 87    ✅ 


    // --- Module ---> Events/Offspec Gas
    // Original Shipper informs offspec gas (Doc.1) (Part 1)    --> relate กับ menu_id 105 ✅
    // TSO Acknowledge (Doc.1)                                  --> relate กับ menu_id 105 ✅
    // TSO Accept (Doc.1) (Part 2)                              --> relate กับ menu_id 105 ✅
    // TSO Reject (Doc.1) (Part 2)                              --> relate กับ menu_id 105 ✅
    // TSO generate Doc.2 to informs other shipper (Part 1)     --> relate กับ menu_id 105 ✅
    // Selected shipper Approve offspec gas (Doc.2) (Part 2)    --> relate กับ menu_id 105 ✅
    // Selected shipper Reject offspec gas (Doc.2) (Part 2)     --> relate กับ menu_id 105 ✅
    // Original Shipper generate Doc.3 (Part 1)                 --> relate กับ menu_id 105 ✅
    // TSO informs Doc.3 (Part 2) Original shipper              --> relate กับ menu_id 105 ✅
    // TSO informs Doc.3 (Part 2) Selected shipper              --> relate กับ menu_id 105 ✅
    // Selected shipper Acknowledge offspec gas (Doc.3) (Part 2)--> relate กับ menu_id 105 ✅


    // --- Module ---> Events/Difficult Day-Emergency
    // TSO generate Doc. 3.9 (Part 1)               --> relate กับ menu_id 105 ✅
    // Shipper acknowledge Doc. 3.9 (Part 2)        --> relate กับ menu_id 105 ✅
    // TSO generate Doc. 4 (Part 1)                 --> relate กับ menu_id 105 ✅
    // Shipper acknowledge Doc. 4 (Part 2)          --> relate กับ menu_id 105 ✅
    // TSO generate Doc. 5 (Part 1)                 --> relate กับ menu_id 105 ✅
    // Shipper acknowledge Doc. 5 (Part 2)          --> relate กับ menu_id 105 ✅
    // TSO generate Doc. 6 (Part 1)                 --> relate กับ menu_id 105 ✅
    // Shipper acknowledge Doc. 6 (Part 2)          --> relate กับ menu_id 105 ✅


    // --- Module ---> Events/Operation Flow Order
    // TSO generate Doc. 7              --> relate กับ menu_id 105 ✅
    // Shipper  Acknowledge Doc. 7      --> relate กับ menu_id 105 ✅
    // TSO  generated Doc. 8            --> relate กับ menu_id 105 ✅
    // Shipper  Acknowledge Doc. 8      --> relate กับ menu_id 105 ✅






    


// รายชื่อ ACTIVITY ใต้ module
// Shipper submit new contract file         --> relate กับ menu_id 49
// Shipper submit new release               --> relate กับ menu_id 49
// TSO accepted release capacity submission --> relate กับ menu_id 49
// TSO rejected release capacity submission --> relate กับ menu_id 49

// Shipper submit planning file  --> relate กับ menu_id 44
// Alert to submit planning     --> relate กับ menu_id 44

// Shipper submits Daily Nomination     --> relate กับ menu_id 61
// Shipper submits Weekly Nomination    --> relate กับ menu_id 61
// TSO accepts Daily Nomination         --> relate กับ menu_id 61
// TSO accepts Weekly Nomination        --> relate กับ menu_id 61
// TSO rejects Daily Nomination         --> relate กับ menu_id 61
// TSO rejects Weekly Nomination        --> relate กับ menu_id 61
// Shipper submits Daily Adjustment     --> relate กับ menu_id 61
// TSO accepts Daily Adjustment         --> relate กับ menu_id 61
// Alert to submit Daily Nomination     --> relate กับ menu_id 61
// Alert to submit Weekly Nomination    --> relate กับ menu_id 61

// Shipper reviews allocation           --> relate กับ menu_id 80
// TSO accepts Shipper´s Allocation     --> relate กับ menu_id 80
// TSO rejects Shipper´s Allocation     --> relate กับ menu_id 80

// TSO informs Instructed Flow          --> relate กับ menu_id 87
// TSO informs Operational Flow Order   --> relate กับ menu_id 87

// Original Shipper informs offspec gas (Doc.1) (Part 1)    --> relate กับ menu_id 105
// TSO Acknowledge (Doc.1)                                  --> relate กับ menu_id 105
// TSO Accept (Doc.1) (Part 2)                              --> relate กับ menu_id 105
// TSO Reject (Doc.1) (Part 2)                              --> relate กับ menu_id 105
// TSO generate Doc.2 to informs other shipper (Part 1)     --> relate กับ menu_id 105
// Selected shipper Approve offspec gas (Doc.2) (Part 2)    --> relate กับ menu_id 105
// Selected shipper Reject offspec gas (Doc.2) (Part 2)     --> relate กับ menu_id 105
// Original Shipper generate Doc.3 (Part 1)                 --> relate กับ menu_id 105
// TSO informs Doc.3 (Part 2)                               --> relate กับ menu_id 105
// TSO informs Doc.3 (Part 2)                               --> relate กับ menu_id 105
// Selected shipper Acknowledge offspec gas (Doc.3) (Part 2)--> relate กับ menu_id 105
// TSO generate Doc. 3.9 (Part 1)                           --> relate กับ menu_id 105
// Shipper acknowledge Doc. 3.9 (Part 2)                    --> relate กับ menu_id 105
// TSO generate Doc. 4 (Part 1)                             --> relate กับ menu_id 105
// Shipper acknowledge Doc. 4 (Part 2)                      --> relate กับ menu_id 105
// TSO generate Doc. 5 (Part 1)                             --> relate กับ menu_id 105
// Shipper acknowledge Doc. 5 (Part 2)                      --> relate กับ menu_id 105
// TSO generate Doc. 6 (Part 1)                             --> relate กับ menu_id 105
// Shipper acknowledge Doc. 6 (Part 2)                      --> relate กับ menu_id 105
// TSO generate Doc. 7                                      --> relate กับ menu_id 105
// Shipper  Acknowledge Doc. 7                              --> relate กับ menu_id 105
// TSO  generated Doc. 8                                    --> relate กับ menu_id 105
// Shipper  Acknowledge Doc. 8                              --> relate กับ menu_id 105