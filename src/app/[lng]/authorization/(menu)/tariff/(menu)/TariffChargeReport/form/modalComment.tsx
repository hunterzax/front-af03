import React, { useEffect, useState } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { formatDate } from '@/utils/generalFormatter';
import getUserValue from '@/utils/getuserValue';
import NodataTable from '@/components/other/nodataTable';
import { postService } from '@/utils/postService';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import dayjs from 'dayjs';

type FormExampleProps = {
    data: any;
    dataRow: any;
    dataShipperGroup?: any;
    open: boolean;
    onClose: () => void;
};

const ModalComment: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    dataShipperGroup,
    dataRow
}) => {

    const userDT: any = getUserValue();
    const [comments, setComments] = useState<any>([]);

    useEffect(() => {
        if (data) {
             
            // setComments(data); // เอาไว้ set comment onload
            setComments(data.reverse()); // เอาไว้ set comment onload
        }
    }, [data])

    const [commentText, setCommentText] = useState("");
    const handleSendComment = async () => {
        if (commentText.trim() === "") return;


        let data_post = {
            "comment": commentText,
            "id": dataRow?.id,
        }

        // หรือคุณจะบอกว่าผมไม่เฟี้ยวอะ
        const res_comment = await postService(`/master/tariff/tariffChargeReport/comments`, data_post)
        const newComment = {
            comment: commentText,
            // create_date: gmt7Date,
            create_date: dayjs(),
            create_by_account: {
                id: userDT?.id,
                email: userDT?.email,
                first_name: userDT?.first_name,
                last_name: userDT?.last_name,
            },
        };

        // setComments((prev: any) => [...prev, newComment]) // เอา newComment ต่อท้าย
        setComments((prev: any) => [newComment, ...prev]); // เอา newComment ไว้ตัวแรก
        setCommentText(""); // Clear the input field
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            handleSendComment();
        }
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
                    <div className="flex flex-col items-center gap-2 p-9">
                        <div className="w-[700px]">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Comment`}</h2>

                            <div className="mb-4 w-[650px]">
                                <div className="grid grid-cols-[120px_400px] w-full text-sm font-semibold text-[#58585A] pb-2">
                                    <p>{`Month/Year`}</p>
                                    <p>{`Tariff ID`}</p>
                                </div>

                                <div className="grid grid-cols-[120px_400px] text-sm font-light text-[#58585A]">
                                    <p>{dataRow?.month_year_charge ? dayjs(dataRow?.month_year_charge).format("MMMM YYYY") : ''}</p>
                                    <p>{dataRow?.tariff_id ? dataRow?.tariff_id : ''}</p>
                                </div>
                            </div>
                        </div>

                        <div className={`mb-1 w-[100%] ${comments?.length >= 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                            {/* {comments?.length > 0 && comments.reverse()?.map((item: any) => */}
                            {comments?.length > 0 && comments?.map((item: any) =>
                            (
                                <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-baseline gap-2">
                                                {/* <span className='rounded-md bg-[#D3E6F8] px-4 font-semibold text-[#464255]'> {item?.nomination_version?.version} </span> */}
                                                <span className='font-light'>By <span className="font-bold !text-[#58585A]">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                        </div>

                                        <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                            <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                {item?.comment}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )

                            )}

                            {
                                comments?.length <= 0 &&
                                <div className="w-full h-auto mb-2 p-2 border rounded-lg">
                                    <NodataTable />
                                </div>
                            }
                        </div>

                        <div key={`comment_k`} className="w-full h-auto mb-2 p-2 border rounded-lg">
                            <div className="flex flex-col p-2">
                                <div className="mb-2 flex justify-between">
                                    <span className='font-light'>
                                        <span className="font-bold text-[#58585A]">
                                            {`Comment`}
                                        </span>
                                    </span>
                                </div>

                                <div className="flex justify-between items-center w-full h-[50px] border rounded-lg p-2 ">
                                    <p className="flex items-center">
                                        <input
                                            type="text"
                                            // className={`${inputClass}`}
                                            className={`text-[16px] bg-white ps-[21px] h-[46px] w-[600px] rounded-lg outline-none bg-opacity-100`}
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