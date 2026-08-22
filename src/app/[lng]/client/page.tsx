import { DefaultSkeleton } from "@/components/material_custom/DefaultSkeleton";
import {
  KBarProvider,
  KBarPortal,
  KBarPositioner,
  KBarAnimator,
  KBarSearch,
  useMatches,
  KBarResults,
  ActionImpl,
} from "kbar";
import { usePathname, useRouter } from "next/navigation";
import React, { lazy } from "react";
import dynamic from 'next/dynamic';

const LazyClientContent = dynamic(() => import('@/components/clients/ClientContent'), {
    ssr: false, // Disable server-side rendering for this component
  });


interface ClientProps {
  params: {
    lng: string;
  };
}

const BarMenu: React.FC<ClientProps> = (props) => {
  const { params } = props;
  const router = useRouter();
  const pathname = usePathname();

  const kBarmenu1 = [
    {
      id: "1",
      name: "Home",
      shortcut: ["h"],
      keywords: "h",
      section: "Home",
      perform: () => router.push("/en/"),
      // icon: <CottageIcon className="w-6 h-6 mx-3" />,
      subtitle: "Home",
    },
    {
      id: "2",
      name: "client",
      shortcut: ["c"],
      keywords: "c",
      section: "client",
      perform: () => router.push("/en/client"),
      // icon: <CottageIcon className="w-6 h-6 mx-3" />,
      subtitle: "client",
    },
  ];

  return (
    <>
      <KBarProvider actions={kBarmenu1}>
        <KBarPortal>
          <KBarPositioner className="bg-[#63676b7d] z-[9999]">
            <KBarAnimator className="max-w-3xlLspInfo w-3/6 bg-white border-r-8 overflow-hidden shadow-white text-black">
              <KBarSearch
                defaultPlaceholder="Search..."
                className="py-4 px-5 text-xs w-full outline-none border-none bg-white text-black "
              />
              <RenderResults />
            </KBarAnimator>
          </KBarPositioner>
        </KBarPortal>
          <LazyClientContent params={params} />
      </KBarProvider>
    </>
  );
};

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
        {/* {action.icon} */}
        <div className="rounded flex flex-col items-start justify-center relative select-none outline-none hover:bg-violet-50">
          <h1 className="text-md font-bold text-[#464255]"> {action.name} </h1>
          <p className="text-sm py-1 text-[#a6aeb7]"> {action.subtitle} </p>
        </div>
      </header>
      <div className="text-[15px] leading-none text-sm rounded flex justify-between items-center relative select-none outline-none hover:bg-violet-50">
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
            {" "}
            <h2 className="text-start text-[#00ADEF]"> {item} </h2>{" "}
          </div>
        ) : (
          <ResultItem action={item} active={active} />
        );
      }}
    />
  );
};

export default BarMenu;
