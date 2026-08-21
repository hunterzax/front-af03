import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'

type FormExampleProps = {
    dataDiv: any;
    dataGroup: any;
    open: boolean;
    onClose: () => void;
    modeShowDiv: any;
};

const ModalDivision: React.FC<FormExampleProps> = ({
    open,
    onClose,
    dataDiv,
    dataGroup,
    modeShowDiv
}) => {

    const showGroup = modeShowDiv == 'shipper' ? "Shipper" : modeShowDiv == 'tso' ? "TSO" : "Other"

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[500px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Division`}</h2>
                            <div className="mb-4 w-[100%]">

                                
                                <div className="grid grid-cols-3 text-sm font-semibold">
                                    {/* <p>{`${showGroup}`} {`ID`}</p>
                                    <p>{`${showGroup}`} {`Name`}</p>
                                    <p>{`${showGroup}`} {`Company Name`}</p> */}
                                    <p>{`${modeShowDiv == 'shipper' ? "Shipper ID" : modeShowDiv == 'tso' ? "TSO ID" : "Other ID"}`}</p>
                                    <p>{`Group Name`}</p>
                                    {
                                        modeShowDiv == 'shipper' ?
                                        <p>{`${showGroup}`} {`Company Name`}</p>
                                        : <p></p>
                                    }
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light">
                                    <p>{dataGroup?.id_name || '-'}</p>
                                    <p>{dataGroup?.name || '-'}</p>
                                    {/* <p>{dataGroup?.company_name || '-'}</p> */}

                                    {
                                        modeShowDiv == 'shipper' ?
                                        <p>{dataGroup?.company_name || '-'}</p>
                                        : <p></p>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%]">
                            {dataDiv.map((division: any) => (
                                <div key={division.id} className="w-[100%] h-[50px] border rounded-lg mb-2 p-2 flex items-center">
                                    <p className="m-0">{division?.division_name || '-'}</p>
                                </div>
                            ))}
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

export default ModalDivision;