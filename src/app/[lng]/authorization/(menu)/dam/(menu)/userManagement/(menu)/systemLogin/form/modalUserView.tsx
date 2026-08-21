import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'

type FormExampleProps = {
    dataUser: any;
    open: boolean;
    onClose: () => void;
};

const ModalUserView: React.FC<FormExampleProps> = ({
    open,
    onClose,
    dataUser,
}) => {

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[500px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`View Users`}</h2>
                        </div>
                        {/* <div className="mb-4 w-[100%]">
                            {dataUser.map((item: any) => (
                                <div key={item.id} className="w-[100%] h-[50px] border rounded-lg mb-2 p-2 flex items-center">
                                    <p className="m-0">{item?.account?.email || ''}</p>
                                </div>
                            ))}
                        </div> */}

                        <div className="mb-4 w-full">
                            {dataUser.map((item: any) => {
                                const first = item?.account?.first_name?.trim() ?? "";
                                const last = item?.account?.last_name?.trim() ?? "";
                                const name = [first, last].filter(Boolean).join(" ") || "-";
                                const email = item?.account?.email ?? "-";
                                const initials = (first?.[0] ?? "").toUpperCase() + (last?.[0] ?? "").toUpperCase() || "•";

                                return (
                                    <div
                                        key={item.id}
                                        className="w-full h-[64px] rounded-xl border border-slate-200 bg-white/70 backdrop-blur flex items-center gap-3 px-3 mb-2 hover:shadow-md transition-all"
                                    >
                                        {/* โคตรเท่ โคตรอันตราย */}
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1473A1]/10 text-[#1473A1] font-semibold">
                                            {initials}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="m-0 font-semibold text-slate-800 leading-5 truncate">
                                                {name}
                                            </p>
                                            <p className="m-0 text-sm text-slate-500 leading-5 truncate">
                                                {email}
                                            </p>
                                        </div>

                                        {/* เผื่ออยากจะ view ซ้ำซาก */}
                                        {/* <button className="text-sm px-3 py-1 rounded-lg border hover:bg-slate-50">View</button> */}

                                    </div>
                                );
                            })}
                        </div>

                        <div className="w-full flex justify-end pt-8">
                            <button
                                onClick={onClose}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                                {'Close'}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalUserView;