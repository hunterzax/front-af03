import React from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { InputSearch } from '@/components/other/SearchForm';

type FormExampleProps = {
    data?: any;
    open: boolean;
    onClose: () => void;
    version:any,
    setVersion:any,
    setDataSubmission:any,
};

const ModalSubmissionDetails: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    version,
    setVersion,
    setDataSubmission,
}) => {
    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="min-w-[500px] w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-3 pb-1">{`Submission Comments`}</h2>

                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[200px_150px_200px] text-sm font-semibold text-[#58585A]">
                                    <p>{`Nominations Code`}</p>
                                    <p>{`Contract Code`}</p>
                                    <p>{`Shipper Name`}</p>
                                </div>

                                <div className="grid grid-cols-[200px_150px_200px] text-sm font-light text-[#58585A]">
                                    <p>{data?.nomination_code || '-'}</p>
                                    <p>{data?.contract_code?.contract_code ?? data?.reserve_balancing_gas_contract?.res_bal_gas_contract ?? '-'}</p>
                                    <p>{data?.group?.name || '-'}</p>
                                </div>
                            </div>
                            <InputSearch
                                id="searchVersion"
                                label=""
                                type="select"
                                placeholder='Select Version'
                                // type="select-multi-checkbox"
                                value={version}
                                sortOptionBy="none"
                                onChange={(e) => {
                                    console.log('e.target.value : ', e.target.value);
                                    console.log('data?.data_submission : ', data?.data_submission);
                                    setVersion(e.target.value)
                                    const find_ = data?.data_submission?.find((f:any) => `${f?.id}` === e.target.value)?.submiss || []
                                    setDataSubmission((pre:any) => ({
                                        ...pre,
                                        submission_comment_query_shipper_nomination_file: find_ || []
                                    }))
                                }}
                                options={(data?.data_submission)?.map((item: any, ix:number) => ({
                                    value: item?.id?.toString(),
                                    label: ix === 0 ? "Last Version" : item.version
                                }))}
                            />
                        </div>

                        <div className="mb-4 w-[100%] h-[400px] border border-[#DFE4EA] rounded-[6px] p-4">
                            <div
                                className={`text-[#464255] font-light text-[14px] ${data?.submission_comment_query_shipper_nomination_file?.length > 10 ? 'max-h-[350px] overflow-y-auto' : ''}`}
                            >
                                {data?.submission_comment_query_shipper_nomination_file?.map((item: any, index: number) => (
                                    <div
                                        key={index}
                                        className="relative w-fit h-[30px] p-2 text-[13px] text-[#58585A] break-all"
                                    >
                                        {item?.remark}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="w-full flex justify-end pt-6">
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

export default ModalSubmissionDetails;