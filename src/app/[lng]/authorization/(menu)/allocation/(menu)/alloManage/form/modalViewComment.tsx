import React, { useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { Tab, Tabs } from '@mui/material';
import { TabPanel } from '@/components/other/tabPanel';
import { toDayjs } from '@/utils/generalFormatter';

type FormExampleProps = {
    dataUser: any;
    data: any;
    open: boolean;
    onClose: () => void;
};

const ModalViewComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    dataUser,
    data,
}) => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event: any, newValue: any) => {
        setTabIndex(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col gap-2 p-9">
                        <div className="w-[600px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[300px_1fr_1fr] text-sm font-semibold mb-4">
                                    <p>{`Nomination Point / Concept Point`}</p>
                                    <p>{`Shipper Name`}</p>
                                </div>

                                <div className="grid grid-cols-[300px_1fr_1fr] text-sm font-light">
                                    <p>{dataUser?.company_name || '-'}</p>
                                    <p>{dataUser?.first_name || '-'}</p>
                                </div>

                            </div>
                        </div>


                        <Tabs value={tabIndex} onChange={handleChange} aria-label="tabs">
                            <Tab label="Shipper" id="tab-0" />
                            <Tab label="Operator" id="tab-1" />
                        </Tabs>

                        <TabPanel value={tabIndex} index={0}>
                            <div className="mb-4 w-full">
                                <div className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between">
                                            <span className='font-light'>By <span className="font-bold"> {`Teerapong Songsan`}</span></span>
                                            {/* <span className="text-gray-500">{ formatDate(item.create_date)}</span> */}
                                            <span className="text-gray-500">{toDayjs().format("DD/MM/YYYY HH:mm")}</span>

                                        </div>
                                        <div className="w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p>{'ข้อมูลยังไม่ถูกต้องครับ'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <TabPanel value={tabIndex} index={1}>
                            <div className="mb-4 w-full">
                                <div className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between">
                                            <span className='font-light'>By <span className="font-bold"> {`Phakawat Sriprom`}</span></span>
                                            <span className="text-gray-500">{toDayjs().format("DD/MM/YYYY HH:mm")}</span>
                                        </div>
                                        <div className="w-full h-[50px] border rounded-lg mb-2 p-4">
                                            <p>{'REJECT!'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

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

export default ModalViewComment;