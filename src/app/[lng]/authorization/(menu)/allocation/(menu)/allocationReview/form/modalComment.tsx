import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, toDayjs } from '@/utils/generalFormatter';
import { Tab, Tabs } from '@mui/material';
import NodataTable from '@/components/other/nodataTable';

type FormExampleProps = {
    data: any;
    dataRow: any;
    open: boolean;
    onClose: () => void;
};

const ModalComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataRow
}) => {

    // const userDT: any = getUserValue();
    const [comments, setComments] = useState<any>([]);
    const [commentsShipper, setCommentsShipper] = useState<any>([]);
    const [commentsReason, setCommentsReason] = useState<any>([]);

    useEffect(() => {
        if (data) {

            const filtered_comment = data?.filter((item: any) => item?.reasons !== true);
            const filtered_reason = data?.filter((item: any) => item?.reasons == true);

            setComments(filtered_comment.sort((a: any, b: any) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime()))
            setCommentsShipper(filtered_comment.sort((a: any, b: any) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime()))
            setCommentsReason(filtered_reason.sort((a: any, b: any) => new Date(b.create_date).getTime() - new Date(a.create_date).getTime()))
        }
    }, [data])

    useEffect(() => {
        setComments(commentsShipper) // เข้ามาเจอ tab shipper เสมอ
    }, [commentsShipper])

    const [tabMain, setTabMain] = useState(0);
    const handleChangeTabMain = (event: any, newValue: any) => {
        setTabMain(newValue);
    };

    useEffect(() => {
        if (tabMain == 0) {
            setComments(commentsShipper);
        } else {
            setComments(commentsReason);
        }
    }, [tabMain])

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
                        <div className="w-[700px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-[100px_175px_120px_120px] text-sm font-semibold text-[#58585A]">
                                    <p>{`Gas Day`}</p>
                                    <p>{`Nomination Point / Concept Point`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Contract Code`}</p>
                                </div>

                                <div className="grid grid-cols-[100px_175px_120px_120px] text-sm font-light text-[#58585A]">
                                    <p>{dataRow?.gas_day ? toDayjs(dataRow?.gas_day).format("DD/MM/YYYY") : ''}</p> {/* Comment : Head Detail ปรับ Format Gas Day ให้แสดงเป็น DD/MM/YYY https://app.clickup.com/t/86eu48gcz */}
                                    <p>{dataRow?.point ? dataRow?.point : ''}</p>
                                    <p>{dataRow?.group ? dataRow?.group?.name : ''}</p>
                                    <p>{dataRow?.contract ? dataRow?.contract : ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-[700px]">
                            <Tabs
                                value={tabMain}
                                onChange={handleChangeTabMain}
                                aria-label="wrapped label tabs example"
                                sx={{
                                    '& .Mui-selected': {
                                        color: '#00ADEF !important',
                                        fontWeight: 'bold !important',
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#00ADEF !important',
                                        width: tabMain === 0 ? '63px !important' : '55px !important',
                                        transform: tabMain === 0 ? 'translateX(30%)' : 'translateX(39%)',
                                        bottom: '10px',
                                    },
                                    '& .MuiTab-root': {
                                        minWidth: 'auto !important',
                                    },
                                }}
                            >
                                {/* ถ้าเป็น shipper แสดงแค่ tab shipper and reasons */}
                                {/* {(userDT?.account_manage?.[0]?.user_type?.id === 3
                                    ? ['Shipper', 'Reasons']
                                    : ['Shipper', 'TSO', 'Reasons']
                                ).map((label, index) => (
                                    <Tab
                                        key={label}
                                        label={label}
                                        id={`tab-${index}`}
                                        sx={{
                                            fontFamily: 'Tahoma !important',
                                            textTransform: 'none',
                                            padding: '8px 16px',
                                            minWidth: '50px',
                                            maxWidth: '100px',
                                            flexShrink: 0,
                                            color: tabMain === index ? '#58585A' : '#464255',
                                        }}
                                    />
                                ))} */}

                                {['Shipper', 'Reasons'].map((label, index) => (
                                    <Tab
                                        key={label}
                                        label={label}
                                        id={`tab-${index}`}
                                        sx={{
                                            fontFamily: 'Tahoma !important',
                                            textTransform: 'none',
                                            padding: '8px 16px',
                                            minWidth: '50px',
                                            maxWidth: '100px',
                                            flexShrink: 0,
                                            color: tabMain === index ? '#58585A' : '#464255',
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </div>

                        <div className={`mb-1 w-[100%] ${comments?.length >= 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {comments?.length > 0 && comments?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-baseline gap-2">
                                                <span className='rounded-[20px]  px-1 '>
                                                    <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.allocation_status?.color) }}>{item?.allocation_status?.name}</div>
                                                </span>

                                                {/* <span className='rounded-md bg-[#D3E6F8] px-4 font-semibold text-[#464255]'> {item?.nomination_version?.version} </span> */}
                                                <span className='font-light'>By <span className="font-bold !text-[#58585A]">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                        </div>

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.remark}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {
                                comments?.length <= 0 && <NodataTable />
                            }
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

export default ModalComment;