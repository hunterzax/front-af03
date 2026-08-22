import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  ActionImpl,
  useKBar,
} from "kbar";
import Profile from "../headers/Profile";
import AppMenu from "../headers/AppMenu";
import Notifys from "../headers/Notifys";
// import KMenu from "../headers/KMenu";
import HomeBack from "../headers/HomeBack";
import BreadcrumbsMenu from "../headers/BreadcrumbsMenu";
import tempMenu from "../headers/tempMenu";
import NavMenu from "./NavMenu";
import WaitingListAppMenu from "../headers/WaitingListAppMenu";

function LayoutMenuContents({ children }: any) {
  const pathname = usePathname();
  const router = useRouter();
  const { query } = useKBar();
  const [toggleNav, setToggleNav] = useState<boolean>(true);
  const [menu, setMenu] = useState<any>(null);

  const goToUrl = async (url: any) => {
    router.push("/en/authorization/" + url); // ถ้าจะสองภาษาเติม lng แทน /en
  };

  useEffect(() => {
    const pathUrl = pathname.split("/")[3];
    setMenu(
      tempMenu().find((f: any) => {
        return f?.url === pathUrl;
      })
    );
    console.log('pathname : ', pathname);
  }, [pathname]);

  // เอาไว้ set bg
  let main_page = [
    {
      name: 'booking'
    },
    {
      name: 'allocation'
    },
    {
      name: 'dam'
    },
    {
      name: 'balancing'
    },
    {
      name: 'planning'
    },
    {
      name: 'nominations'
    },
    {
      name: 'metering'
    },
    {
      name: 'event'
    },
    {
      name: 'tariff'
    }
  ]

  const currentPath = pathname.split("/")[3];
  const pathSegments = pathname.split("/");
  const showBg = main_page.some((page) => page.name === currentPath) && pathSegments.length <= 4;

  return (
    // เดิมคลุมด้วย element <></>
    <div className="no-scrollbar overflow-y-auto scrollbar-hide h-screen"> 
      <header>
        <section className=" flex justify-between items-center h-[70px] px-2">
          <Image
            src={`/assets/icon/ptt-logo-2.svg`}
            width={60}
            height={26.25}
            alt={`/assets/icon/ptt-logo-2.svg`}
            priority
            className="pl-4 w-[100px] h-auto"
          />
          <section className="pr-4 flex items-center gap-3 relative">
            <HomeBack goToUrl={goToUrl} />
            <Notifys />
            <AppMenu />
            <WaitingListAppMenu />
            {/* <KMenu toggle={query.toggle} /> */}
            <Profile mode="in" />
          </section>
        </section>
        <BreadcrumbsMenu menu={menu} goToUrl={goToUrl} />
      </header>

      <aside className="flex gap-5 mt-2 text-[#757575]">
        {/* pathname */}
        {
          !pathname.includes("/dashboardandreport/waitinglist") && 
          <NavMenu
            toggleNav={toggleNav}
            setToggleNav={setToggleNav}
            menu={menu}
            setMenu={setMenu}
            goToUrl={goToUrl}
          />
        }

        <section
          // className={` h-[calc(100vh-50px-40px-0.5rem)] overflow-y-auto w-[100%] pr-2`}
          className={`h-[calc(100vh-135px)] overflow-y-auto scrollbar-hide w-full pr-2 relative ${showBg ? 'bg-[url("/assets/image/bg_menu_04.png")] bg-cover bg-center' : ''}`}
        // className={`h-[calc(100vh-50px-40px-0.5rem)] overflow-y-hidden w-full pr-2 ${showBg ? 'bg-[url("/assets/image/bg_menu_04.png")] bg-cover bg-center' : ''}`}
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </section>
      </aside>
    </div>
  );
}

function LayoutMenu({ children }: any) {
  const router = useRouter();
  const [kBarMenu, setKBarMenu] = useState([]);

  useEffect(() => {
    let kArr: any = [];
    tempMenu().map((e: any) => {
      if (e?.menu.length > 0) {
        e?.menu.map((eSub: any) => {
          if (eSub?.menu.length > 0) {
            eSub?.menu.map((eSubUrl: any) => {

              if (eSubUrl?.menu.length > 0) {
                eSubUrl?.menu.map((eSubSubUrl: any) => {
                  kArr.push({
                    ...eSubSubUrl,
                    id: String(eSubSubUrl?.id),
                    perform: () => router.push("/authorization/" + eSubSubUrl.url),
                  });
                  return eSubSubUrl;
                })
              } else {
                kArr.push({
                  ...eSubUrl,
                  id: String(eSubUrl?.id),
                  perform: () => router.push("/authorization/" + eSubUrl.url),
                });
                return eSubUrl;

              }

              // ---- original bank ----
              // kArr.push({
              //   ...eSubUrl,
              //   id: String(eSubUrl?.id),
              //   perform: () => router.push("/authorization/" + eSubUrl.url),
              // });
              // return eSubUrl;
            });
          } else {
            kArr.push({
              ...eSub,
              id: String(eSub?.id),
              perform: () => router.push("/authorization/" + eSub.url),
            });
          }
          return eSub;
        });
      } else {
        kArr.push({
          ...e,
          id: String(e?.id),
          perform: () => router.push("/authorization/" + e.url),
        });
      }

      return e;
    });
    setKBarMenu(kArr);
  }, []);

  return (
    <>
      {kBarMenu.length > 0 && (
        <KBarProvider actions={kBarMenu}>
          <KBarPortal>
            <KBarPositioner className="bg-[#63676b7d] z-10">
              <KBarAnimator className="max-w-3xlLspInfo w-3/6 bg-white border-r-8 overflow-hidden shadow-white text-black">
                <KBarSearch
                  defaultPlaceholder="Search..."
                  className="py-4 px-5 text-xs w-full outline-none border-none bg-white text-black "
                />
                <RenderResults />
              </KBarAnimator>
            </KBarPositioner>
          </KBarPortal>
          <LayoutMenuContents children={children} />
        </KBarProvider>
      )}
    </>
  );
}

const ResultItem = React.forwardRef(function ResultItem(
  { action, active }: { action: ActionImpl; active: boolean },
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={
        active
          ? `px-3 py-2 leading-none rounded text-sm flex items-center justify-between bg-violet-50 cursor-pointer`
          : `px-3 py-2 leading-none rounded text-sm flex items-center justify-between hover:bg-violet-50 cursor-pointer`
      }
    >
      <header className="flex items-center px-5">
        <div className="rounded flex flex-col items-start justify-center relative select-none outline-none hover:bg-violet-50">
          <h1 className="text-md font-bold text-[#464255]"> {action.name} </h1>
          <p className="text-sm py-1 text-[#a6aeb7]"> {action.subtitle} </p>
        </div>
      </header>
      <div className="text-[15px] leading-none text-sm rounded flex justify-between items-center relative select-none outline-none hover:bg-violet-50 ">
        {action.shortcut?.length ? (
          <div
            aria-hidden
            style={{ display: "grid", gridAutoFlow: "column", gap: "4px" }}
          >
            {action.shortcut.map((sc) => (
              <kbd
                key={sc}
                style={{
                  padding: "4px 6px",
                  background: "rgba(0 0 0 / .1)",
                  borderRadius: "4px",
                  fontSize: 14,
                }}
              >
                {sc}
              </kbd>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});

const RenderResults = () => {
  const { results } = useMatches();
  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        return typeof item === "string" ? (
          <div className="py-3 px-5">
            <h2 className="text-start text-[#00ADEF]"> {item} </h2>{" "}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        );
      }}
    />
  );
};

export default LayoutMenu;