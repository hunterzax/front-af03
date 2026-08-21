"use client";
import Image from "next/image";
import {
  /* @ts-ignore */
  Menu,
  /* @ts-ignore */
  MenuHandler,
  /* @ts-ignore */
  MenuList,
  /* @ts-ignore */
  MenuItem,
  /* @ts-ignore */
  Button,
} from "@material-tailwind/react";
import getUserValue from "@/utils/getuserValue";
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { useLogout } from "@/utils/logoutFunc";
import ModalProfile from "../other/modalProfile/modalProfile";
import { useState } from "react";
import ModalComponent from "../other/ResponseModal";
import { useRouter } from "next/navigation";

function Profile({ mode }: any) {

  const { mutateLogout } = useLogout();
  const [isModalProfile, setisModalProfile] = useState<boolean>(false);
  const [isModalLogout, setisModalLogout] = useState<boolean>(false);

  const userDT: any = getUserValue();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.clear();
    const channel = new BroadcastChannel("auth_channel");

    // ส่งสัญญาณ logout ให้ทุก tab
    channel.postMessage("logout");
    channel.close();

    await mutateLogout();
    router.replace("/en/signin");
  };

  return (
    <div className="pl-3 ml-1.5 flex items-start gap-2">
      <div className="inline-block mr-2 h-auto min-h-[1em] w-0.5 self-stretch bg-[#DFE4EA] dark:bg-white/10"></div>
      <Menu>
        <MenuHandler>
          <Button variant="text" className="p-0 m-0 flex gap-[10px] items-center hover:bg-transparent focus:bg-transparent">
            {mode == "in" &&
              <Image
                src={`/assets/icon/account_icon_3.jpg`}
                width={50}
                height={50}
                alt="Profile picture"
                className="w-[50px] h-[50px] bg-cover rounded-full"
              />
            }
            <ul className={`${mode == "in" ? "ml-1" : mode == "out" && "mr-3"}`}>
              <li className="text-[#58585A] text-left">
                <span className="mr-2 capitalize text-[8px] sm:text-[10px] md:text-[14px] lg:text-[18px]">
                  {userDT?.first_name ? userDT?.first_name : "-"}
                </span>
                <span className="capitalize text-[8px] sm:text-[10px] md:text-[14px] lg:text-[18px]">
                  {userDT?.last_name ? userDT?.last_name : "-"}
                </span>
              </li>
              <li
                className={`text-[6px] sm:text-[8px] md:text-[10px] lg:text-[14px] w-fit rounded-full px-[5px] sm:px-[8px] md:px-[8px] lg:px-3 py-[1px] sm:py-[1px] md:py-[3px] lg:py-1 font-bold capitalize mt-none sm:mt-1 duration-200 ease-in-out`}
                style={{
                  color: userDT?.account_manage?.[0]?.user_type?.color_text,
                  backgroundColor: userDT?.account_manage?.[0]?.user_type?.color,
                }}
              >
                {userDT?.account_manage?.length > 0 && userDT?.account_manage[0]
                  ? userDT?.account_manage[0]?.user_type?.name
                  : ''}
              </li>
            </ul>
            {mode == "out" &&
              <Image
                src={`/assets/icon/account_icon_3.jpg`}
                width={50}
                height={50}
                alt="Profile picture"
                className="w-[20px] h-[20px] sm:w-[30px] sm:h-[30px] md:w-[40px] md:h-[40px] lg:w-[40px] lg:h-[40px] xl:w-[50px] xl:h-[50px] bg-cover rounded-full"
              />
            }
          </Button>

        </MenuHandler>
        <MenuList className="min-w-[210px] w-fit">
          <MenuItem className="pointer-events-none">
            <div className="font-bold text-[14px] text-[#58585A] capitalize ">
              {`${userDT?.first_name} ${userDT?.last_name}`}
            </div>
            <div className="text-[14px] py-1 text-[#868686]">
              {`${userDT?.email}`}
            </div>
            <div className={`text-[14px] w-fit rounded-full px-3 py-1 font-bold mt-[10px] mb-[10px]`} style={{ color: userDT?.account_manage?.[0]?.user_type?.color_text, backgroundColor: userDT?.account_manage?.[0]?.user_type?.color }}>
              {userDT?.account_manage?.length > 0 && userDT?.account_manage[0] ? userDT?.account_manage[0]?.user_type?.name : ''}
            </div>
          </MenuItem>
          <hr className="my-1 -mx-3" />
          <MenuItem className="-mx-1 text-[14px]" onClick={() => setisModalProfile(true)}>
            <div className="flex item-center">
              <PermIdentityOutlinedIcon className="!text-[18px] mt-[1px]" />
              <div className="text-[14px] ml-2">{`My Profile`}</div>
            </div>
          </MenuItem>
          <hr className="my-1 -mx-3" />
          <MenuItem className="text-red-700 text-[14px]" onClick={() => setisModalLogout(true)}>{`Log out`}</MenuItem>
        </MenuList>
      </Menu>
      <ModalProfile open={isModalProfile} setopen={setisModalProfile} handleClose={() => setisModalProfile(false)} />
      <ModalComponent
        open={isModalLogout}
        handleClose={async (e: any) => {
          if (e == "submit") {
            handleLogout();
          } else {
            setisModalLogout(false);
          }
        }}
        title="Log out"
        description={
          <div className="text-center text-[16px]">
            {"Are you sure you want to log out ?"}
          </div>
        }
        stat="logout"
        btnmode="split"
        btnsplit1="Log out"
        btnsplit2="Cancel"
      />
    </div>
  );
}

export default Profile;
