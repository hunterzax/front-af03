// import React from 'react'
// import GroupIcon from "@mui/icons-material/Group";
// import BusinessIcon from "@mui/icons-material/Business";
// import ArticleIcon from "@mui/icons-material/Article";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
// import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
// import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
// import FeaturedPlayListOutlinedIcon from '@mui/icons-material/FeaturedPlayListOutlined';
// import TextSnippetOutlinedIcon from '@mui/icons-material/TextSnippetOutlined';
// import EqualizerOutlinedIcon from '@mui/icons-material/EqualizerOutlined';
// import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
// import ChromeReaderModeOutlinedIcon from '@mui/icons-material/ChromeReaderModeOutlined';
// import WebAssetOutlinedIcon from '@mui/icons-material/WebAssetOutlined';
// import BookOutlinedIcon from '@mui/icons-material/BookOutlined';
// import BorderAllOutlinedIcon from '@mui/icons-material/BorderAllOutlined';
// import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
// import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
// import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
// import DonutSmallOutlinedIcon from '@mui/icons-material/DonutSmallOutlined';
// import OpacityRoundedIcon from '@mui/icons-material/OpacityRounded';
// import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
// import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import { originalMenu } from './menuData';
import { decryptData, encryptData } from '@/utils/encryptionData';

const filterMenus = (menuStructure: any, config: any) => {

  const getConfigById = (menus_config_id: any) => config?.find((item: any) => item.menus_id === menus_config_id);

  return menuStructure
    .filter((menu: any) => {
      const configItem = getConfigById(menu.menus_config_id);
      // return configItem && configItem.f_view === 1; // Include only if f_view === 1
      return configItem && configItem.b_manage === true; // Include only if b_manage === 1
    })
    .map((menu: any) => {
      const configItem = getConfigById(menu.menus_config_id);
      return {
        ...menu,
        menu: filterMenus(menu.menu, config),
        role_config: configItem, // role config เอาไว้เปิดปิดปุ่ม
      };
    });
}

const extractUrls = (data?: any) => {
  const urls: any = [];

  function traverse(menu?: any) {
    menu.forEach((item?: any) => {
      if (item.url) {
        urls.push("/en/authorization/" + item.url);
      }
      if (item.menu && item.menu.length > 0) {
        traverse(item.menu);
      }
    });
  }

  traverse(data);
  return urls;
}

function tempMenu() {
  // const userData: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
  let userData: any = localStorage?.getItem("x9f3w1m8q2y0u5d7v1z");
  userData = userData ? decryptData(userData) : null;

  // const { account_manage } = JSON.parse(userData)
  let account_manage;
  try {
    const parsedUserData = userData ? JSON.parse(userData) : null;
    account_manage = parsedUserData?.account_manage;
  } catch (error) {
    // Failed to parse userData
    account_manage = null;
  }

  const menus_config2 = account_manage?.[0]?.account_role?.[0]?.role?.menus_config

  // use menus_config2 to show/hide these menus
  // if menus_config2.f_view == 0 then remove from array ,
  // if menus_config2.f_view == 1 = keep in array  ,

  const filteredMenu = filterMenus(originalMenu, menus_config2);

  const res_authorize_url = extractUrls(filteredMenu);
  // localStorage.setItem("o8g4z3q9f1v5e2n7k6t", JSON.stringify(res_authorize_url))
  localStorage.setItem("o8g4z3q9f1v5e2n7k6t", encryptData(res_authorize_url))

  return filteredMenu;
}

export default tempMenu