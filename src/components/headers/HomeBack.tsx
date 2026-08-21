"use client";
import HomeIcon from "@mui/icons-material/Home";

function HomeBack({ goToUrl }: any) {
  return (
    <button
      type="button"
      className=" text-gray-500 rounded-lg hover:opacity-80"
      onClick={() => {
        goToUrl("");
      }}
    >
      <HomeIcon className=" text-[#58585A]" />
    </button>
  );
}

export default HomeBack;
