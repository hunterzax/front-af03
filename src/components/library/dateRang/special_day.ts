const generateEventDates = (baseYear: any) => {
  const events = [
    { id: 1, month: 1, day: 1, message: "วันหยุดวันปีใหม่" },
    { id: 2, month: 2, day: 12, message: "วันหยุดมาฆบูชา" },
    { id: 3, month: 4, day: 7, message: "วันหยุดชดเชยจักกรี" },
    { id: 4, month: 4, day: 13, message: "วันสงกรานต์" },
    { id: 5, month: 4, day: 14, message: "วันสงกรานต์" },
    { id: 6, month: 4, day: 15, message: "วันสงกรานต์" },
    { id: 7, month: 5, day: 1, message: "วันแรงงาน" },
    { id: 8, month: 5, day: 10, message: "วันวิสาขบูชา" },
    { id: 9, month: 6, day: 2, message: "วันหยุด​ชดเชยเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสุทิดา" },
    { id: 10, month: 7, day: 10, message: "วันหยุดอาสาฬหบูชา" },
    { id: 11, month: 7, day: 27, message: "วันหยุดเฉลิมพระชนมพรรษาพระบาทสมเด็จพระเจ้าอยู่หัว" },
    { id: 12, month: 8, day: 12, message: "วันหยุดแม่แห่งชาติ" },
    { id: 13, month: 10, day: 13, message: "วันหยุดคล้ายวันสวรรคต ร.9" },
    { id: 14, month: 10, day: 23, message: "วันปิยมหาราช" },
    { id: 15, month: 12, day: 5, message: "วันพ่อแห่งชาติ" },
    { id: 16, month: 12, day: 10, message: "วันหยุดรัฐธรรมนูญ" },
    { id: 17, month: 12, day: 29, message: "วันสิ้นปี" },
    { id: 18, month: 12, day: 30, message: "วันสิ้นปี" },
    { id: 19, month: 12, day: 31, message: "วันสิ้นปี" },
  ];

  // Create the event dates for the base year and the following year
  let eventDates2: any = [];
  let idCounter = 1;

  for (let i = 0; i < 10; i++) {
    const year = baseYear + i;
    const yearEvents = events.map(event => ({
      id: idCounter++,
      date: new Date(year, event.month - 1, event.day),
      message: event.message,
    }));

    eventDates2 = eventDates2.concat(yearEvents);
  }

  return eventDates2;
};

// Example usage
const baseYear = 2024;
export const eventDate = generateEventDates(baseYear);