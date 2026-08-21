"use client";
import { cookieName } from "@/app/i18n/settings";
import { usePathname, useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { useCookies } from "react-cookie";

function LocalSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = async (ln: string) => {
    const newPathname = pathname.replace(/^\/(en|th)/, `/${ln}`);
    router.replace(newPathname);
  };

  return (
    <div className=" flex gap-2">
      <div
        className=" cursor-pointer"
        onClick={() => {
          changeLocale("en");
        }}
      >
        en
      </div>
      <div>/</div>
      <div
        className=" cursor-pointer"
        onClick={() => {
          changeLocale("th");
        }}
      >
        th
      </div>
    </div>
  );
}

export default LocalSwitcher;
