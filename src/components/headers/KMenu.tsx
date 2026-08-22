import React from "react";

function KMenu({ toggle }: any) {
  return (
    <button
      type="button"
      className=" p-[2px] bg-[#58585A] text-[#ffffff] rounded-sm text-[10px] hover:opacity-80"
      onClick={toggle}
    >
      <div className=" flex items-center justify-center font-bold rounded-[6px]">{`⌘K`}</div>
    </button>
  );
}

export default KMenu;
