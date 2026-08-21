"use client"
import React, { useEffect, useState } from 'react'
import dayjs from "dayjs";
import "dayjs/locale/th";

function TimeCount({ className, onSplit, modeShow }: any) {
  const [currentTime, setCurrentTime] = useState<any>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      dayjs.locale("en");
      let format = dayjs().format("DD MMM YYYY HH:mm:ss").toUpperCase();
      setCurrentTime(format);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={className}>
      <div className={` ${modeShow == 'in' ? 'text-[16px]' : 'text-[10px] sm:text-[12px] md:text-[18px] lg:text-[24px]'} ${onSplit && "border-r-[2px] border-[#DFE4EA] pr-2"}`}>
        {(!!currentTime &&
          `${currentTime.split(" ")[0]} ${currentTime.split(" ")[1]} ${
            currentTime.split(" ")[2]
          }`) ||
          "-"}
      </div>
      <div className={`${modeShow == 'in' ? 'text-[16px]' : 'text-[10px] sm:text-[12px] md:text-[18px] lg:text-[24px]'} ml-2`}>
        {(!!currentTime && currentTime.split(" ")[3]) || "-"}
      </div>
    </div>
  )
}

export default TimeCount