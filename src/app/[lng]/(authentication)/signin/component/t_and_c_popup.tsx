import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'
import { getService } from '@/utils/postService';
import PdfViewer3 from '@/components/other/renderPdf3';

type PopupTicker = {
    width: number;
    open: boolean;
    tac: any;
    onClose: () => void;
    onSubmit: () => void;
};

const PopupTandC: React.FC<PopupTicker> = ({
    width,
    open,
    tac,
    onClose,
    onSubmit
}) => {
    const [isChecked, setIsChecked] = useState(false);
    const [dataTerm, setDataTerm] = useState<any>([]);
    const [atBottom, setAtBottom] = useState(false);
    const scrollContainerRef = useRef(null);

    const fetchData = async () => {
        try {
            const res_term: any = await getService(`/master/parameter/term-and-condition`);

            const today = new Date();
            const activeTerms: any = res_term?.filter((item: any) => {
                const startDate = new Date(item.start_date);
                const endDate = new Date(item.end_date);

                return item.active === true && today >= startDate && today <= endDate;
            });
            const latestTerm = activeTerms.reduce((latest: any, item: any) => {
                return !latest || new Date(item.create_date) > new Date(latest.create_date) ? item : latest;
            }, null);

            setDataTerm(latestTerm)
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [])

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollHeight, scrollTop, clientHeight } = container;

            // Check if scrolled to the bottom
            // if (scrollHeight - scrollTop === clientHeight) {
            // if (scrollHeight - scrollTop >= 600) { // >= 100 คือ improvise
            // if (scrollHeight - scrollTop >= 600) { // >= 100 คือ improvise
            //     setAtBottom(true);
            // }
            // else {
            //     setAtBottom(false);
            // }

            if (scrollTop / (scrollHeight - clientHeight) >= 0.8) {
                setAtBottom(true);
            } else {
                setAtBottom(false);
            }
        }
    };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    // clear state when closes
    const handleClose = () => {
        onClose();
        setAtBottom(false);
        setIsChecked(false);
    };

    const handleSubmit = () => {
        onSubmit();
        setAtBottom(false);
        setIsChecked(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="flex inset-0 items-center justify-center">
                            <div className={`bg-white w-[${width}px] h-auto rounded-[20px] p-8`}>
                                <div id="body-md">
                                    <div className='text-[#2B2A87] font-bold text-[24px] mb-5'>{"Terms and Conditions"}</div>
                                    <div
                                        id="pdf-t-c"
                                        // className='h-[500px]  overflow-hidden'
                                        className='h-[500px] overflow-x-auto'
                                        ref={scrollContainerRef}
                                        onScroll={handleScroll}
                                    >
                                        {/* <PdfViewer3 pdfUrl={tac?.url || "https://pdfobject.com/pdf/sample.pdf"} /> */}
                                        <PdfViewer3 pdfUrl={'/assets/pdf/sample_2.pdf'} />

                                    </div>
                                </div>
                                <div className='grid grid-cols-[700px_340px] mt-5'>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            disabled={!atBottom} // Disable the checkbox if not at bottom
                                            checked={isChecked} // Bind the checkbox to the state
                                            onChange={handleCheckboxChange} // Update the state when checkbox changes
                                            className="mr-3"
                                        />
                                        <div className={`${atBottom ? 'text-[#2B2A87]' : 'text-[#C7C7C8]'} font-[500]`}>{"I confirm that I have read and accept the terms and conditions and privacy policy."}</div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleSubmit} disabled={!atBottom || !isChecked} className={`w-[167px] font-light  ${atBottom && isChecked ? 'bg-[#00ADEF]' : 'bg-[#9CA3AF]'} text-white py-2 rounded-lg focus:outline-none focus:bg-blue-600`}>
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default PopupTandC;