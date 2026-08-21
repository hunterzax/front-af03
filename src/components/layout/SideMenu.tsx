import { useState } from 'react';
import tempMenu from "@/components/headers/tempMenu";

const RecursiveMenu = ({ menu, lng }: { menu: any, lng: string }) => {
  // try to find permission
  const [openSubMenu, setOpenSubMenu] = useState<number | null>(null);

  const handleToggleSubMenu = (id: number) => {
    setOpenSubMenu((prev) => (prev === id ? null : id));
  };

  return (
    <div>
      {menu.map((item: any, ix: number) => (
        <div key={ix} className="relative group mb-2">
          <div
            className="noisy01 hover:bg-[#3A6993] duration-200 ease-in-out text-white py-5 px-2 rounded-md grid justify-center items-center cursor-pointer"
            onClick={() => handleToggleSubMenu(item.id)}
          >
            <div className="flex flex-col items-center">
              <div className="grid justify-center">{item?.iconSize}</div>
              <div className="grid justify-center">{item?.name}</div>
            </div>
          </div>

          {/* Sub-Menu (and Sub-Sub-Menu) */}
          {item?.menu && item.menu.length > 0 && (
            <div
              className={`transition-all ${openSubMenu === item.id ? 'block' : 'hidden'} pl-4 mt-2`}
            >
              <RecursiveMenu menu={item.menu} lng={lng} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


const MenuComponent = ({ lng }: { lng: string }) => {
  return (
    <aside className="h-[calc(100vh-220px)] px-5 overflow-y-auto">
      <section className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <RecursiveMenu menu={tempMenu} lng={lng} />
      </section>
    </aside>

  );
};

export default MenuComponent;