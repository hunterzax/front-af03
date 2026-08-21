import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate, formatDateTimeNoPlusSeven } from '@/utils/generalFormatter';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { postService } from '@/utils/postService';
import getUserValue from '@/utils/getuserValue';
type FormExampleProps = {
    data: any;
    dataLog?: any;
    dataMain: any;
    open: boolean;
    onClose: () => void;
    modeShowDiv?: any;
    setModalMsg?: any;
    setModalSuccessOpen?: any;
    setModalSuccessMsg?: any;
    setCommentLog?: any;
};


// terminate | reject
// dataMain?.status_capacity_request_management?.id === 5 || dataMain?.status_capacity_request_management?.id === 3

const ModalBkComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataLog,
    dataMain,
    setCommentLog
}) => {

    const userDT: any = getUserValue();
    const [comments, setComments] = useState<any>([]);
    const inputClass = "text-[16px] block md:w-full p-2 ps-5 pe-10 h-[46px] rounded-lg !w-[520px] bg-white outline-none bg-opacity-100 "

    useEffect(() => {
        // setComments([...(data?.booking_version_comment || []), ...dataLog]);
        setComments([...(data?.booking_version_comment || []), ...dataLog.filter((c: any) => c.version === data?.version)]); // แยก version ของใครของมัน
    }, [open])

    // clear state when closes
    const handleClose = () => {
        onClose();
        // setComments([]);
        setCommentText("");
    };

    const [commentText, setCommentText] = useState("");

    const handleSendComment = async () => {
        if (commentText.trim() === "") return;

        const gmt7Date = new Date().toISOString();

        let data_post = {
            "comment": commentText
        }
        const res_comment = await postService(`/master/capacity/comment-version/${data?.id}`, data_post)

        const newComment = {
            comment: commentText,
            create_date: gmt7Date,
            create_by_account: {
                id: userDT?.id,
                email: userDT?.email,
                first_name: userDT?.first_name,
                last_name: userDT?.last_name,
            },
            version: data?.version
        };

        // setCommentLog((prev: any) => [...prev, newComment])
        setCommentLog((prev: any) => [...prev, newComment])
        setComments((prev: any) => [...prev, newComment]);
        setCommentText(""); // Clear the input field
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            handleSendComment();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-20">
            <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-[900px]">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2>
                            <div className="mb-4 w-[100%]">

                                <div className="grid grid-cols-[100px_200px_200px_200px] gap-x-4 gap-y-2 w-full p-2 text-sm font-semibold text-[#58585A]">
                                    <p>{`Version`}</p>
                                    <p>{`Contract Code`}</p>
                                    <p>{`Shipper Name`}</p>
                                    <p>{`Submitted Timestamp`}</p>
                                </div>

                                <div className="grid grid-cols-[100px_200px_200px_200px] gap-x-4 gap-y-2 w-full p-2 text-sm font-light text-[#58585A]">
                                    <p className='uppercase'>{data?.version || ''}</p>
                                    <p>{dataMain?.contract_code || ''}</p>
                                    <p>{dataMain?.group?.name || ''}</p>
                                    <p>{formatDate(dataMain?.submitted_timestamp) || ''}</p>
                                </div>

                            </div>
                        </div>

                        <div className={`mb-1 w-[100%] ${comments?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {/* {data?.booking_version_comment?.map((item: any) => ( */}
                            {comments && comments?.map((item: any) => (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between">
                                            <span className='font-light'>
                                                By <span className="font-bold text-[#58585A]">
                                                    {item?.create_by_account?.first_name} {" "} {item?.create_by_account?.last_name}
                                                </span>
                                            </span>
                                            <span className="text-[#9CA3AF] font-light">{formatDateTimeNoPlusSeven(item?.create_date)}</span>
                                        </div>

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.comment}
                                            </p>

                                            <span className="flex items-center">
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {
                            // status_capacity_request_management 
                            // 1 = Saved
                            // 2 = Approved
                            // 3 = rejected
                            // 4 = Confirmed
                            // 5 = terminated

                            // status_capacity_request_management_process
                            // 1 == Active
                            // 2 == Waiting For Start Date
                            // 3 == Waiting For Approval
                            // 4 == End
                            // 5 == Close


                            // ของเดิมโรงงาน
                            // ที่ปิดไปเพราะข้อนี้ (อ่านคอมเม้น) R : v1.0.90 ที่ Tab Summary ไม่มีปุ่ม Comment และ Export https://app.clickup.com/t/86ervrxh4
                            // (data?.status_capacity_request_management?.id !== 5 && data?.status_capacity_request_management?.id !== 3) && // ถ้าไม่ใช่ reject หรือ termiante จะมีช่องให้คอมเม้น


                            // ถ้า status_capacity_request_management.id = 3 ไม่ต้องแสดง div นี้
                            // ถ้า status_capacity_request_management.id = 5 และ status_capacity_request_management_process.id = 4 ไม่ต้องแสดง div นี้
                            // ที่เหลือแสดงหมด
                            // ข้อ 2 สัญญาาที่โดน terminated แต่ยังไม่ถึงวัน terminated date ต้องให้ comment ได้อยู่ค่ะ เพราะสัญญายัง Active อยู่ https://app.clickup.com/t/86ervrxh4
                            !(
                                data?.status_capacity_request_management?.id === 3 ||
                                (
                                    data?.status_capacity_request_management?.id === 5 &&
                                    dataMain?.status_capacity_request_management_process?.id === 4
                                ) 
                                ||
                                dataMain?.status_capacity_request_management_process?.id === 4 ||
                                dataMain?.status_capacity_request_management_process?.id === 5
                            ) && <div key={`comment_k`} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                <div className="flex flex-col p-2">
                                    <div className="mb-2 flex justify-between">
                                        <span className='font-light'>
                                            <span className="font-bold text-[#58585A]">
                                                {`Comment`}
                                            </span>
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center w-full h-[50px] border rounded-lg mb-2 p-4">
                                        <p className="flex items-center">
                                            <input
                                                type="text"
                                                className={`${inputClass} `}
                                                placeholder="Enter Comment"
                                                value={commentText}
                                                onKeyDown={handleKeyPress}
                                                onChange={(e) => setCommentText(e.target.value)}
                                            />
                                        </p>

                                        <span
                                            className="flex items-center"
                                            onClick={handleSendComment}
                                        >
                                            <SendRoundedIcon sx={{ color: '#00ADEF' }} />
                                        </span>
                                    </div>

                                </div>
                            </div>
                        }


                        <div className="w-full flex justify-end pt-8">
                            <button
                                onClick={handleClose}
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

export default ModalBkComment;