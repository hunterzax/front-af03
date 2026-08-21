import React, { useEffect, useState } from 'react';
import { formatDate } from '@/utils/generalFormatter';
import NodataTable from '@/components/other/nodataTable';
import { deleteService, getService, postService } from '@/utils/postService';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import getUserValue from '@/utils/getuserValue';
import { Tab, Tabs } from '@mui/material';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModalComponent from '@/components/other/ResponseModal';
import ModalDelete from './modalDelete';

type FormExampleProps = {
    data?: any;
    dataRow?: any;
};

const inputClass = "text-[16px] block md:w-full p-2 ps-5 pe-10 h-[46px] rounded-lg !w-[520px] bg-white outline-none bg-opacity-100 "

const PageComment: React.FC<FormExampleProps> = ({
    data,
    dataRow
}) => {
    const userDT: any = getUserValue();
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState<any[]>([]); // state กลางที่เอาไว้โชว์ใน input
    const [commentsShipper, setCommentsShipper] = useState<any[]>([]);
    const [commentsTso, setCommentsTso] = useState<any[]>([]);
    const [commentsReason, setCommentsReason] = useState<any[]>([]);

    // START FN DEL
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');
    const [deleteData, setDeleteData] = useState<any>();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);
    const openDeleteForm = async (data: any) => {
        setDeleteData(data);
        setDeleteOpen(true);
    }
    const handleDelete = async (data_: any) => {
        console.log('deleteData : ', deleteData);
        const res_del: any = await deleteService(`/master/query-shipper-nomination-file/query_shipper_nomination_file_comment/${deleteData?.id}`);
        if (res_del?.response?.data?.status === 400) {
            setModalErrorMsg(res_del?.response?.data?.error);
            setModalErrorOpen(true)
        } else {
            setModalSuccessMsg('Data has been deleted.')
            setModalSuccessOpen(true);
            setTimeout(() => {
                setDeleteOpen(false)
            }, 200);
        }

        setComments((prev: any[] | undefined) => ([...(prev ?? [])]?.filter((f:any) => f?.id !== deleteData?.id)));

        if (tabMain == 0) {
            setCommentsShipper((prev: any[] | undefined) => ([...(prev ?? [])?.filter((f:any) => f?.id !== deleteData?.id)]));
        } else if (tabMain == 1) {
            setCommentsTso((prev: any[] | undefined) => ([...(prev ?? [])]?.filter((f:any) => f?.id !== deleteData?.id)));
        } else {
            setCommentsReason((prev: any[] | undefined) => ([...(prev ?? [])]?.filter((f:any) => f?.id !== deleteData?.id)));
        }
       
    }
    // END FN DEL


    const getComment = async (id?: any) => {
        try { 
            const data_comment: any = await getService(`/master/query-shipper-nomination-file/query_shipper_nomination_file_comment/${id}`);

            // กรองแยก comment ของ TSO, shipper
            const filtered_tso = data_comment?.filter(
                (item: any) => item?.query_shipper_nomination_type_comment_id === 2 // 2 = TSO
            );

            const filtered_shipper = data_comment?.filter(
                (item: any) => item?.query_shipper_nomination_type_comment_id === 1 // 1 = Shipper
            );

            const filtered_reason = data_comment?.filter(
                (item: any) => item?.query_shipper_nomination_type_comment_id === 3 // 3 = Reason
            );

            const sorted_shipper = [...filtered_shipper].sort((a, b) => a.id - b.id);
            const sorted_tso = [...filtered_tso].sort((a, b) => a.id - b.id);
            const sorted_reason = [...filtered_reason].sort((a, b) => a.id - b.id);
            console.log('sorted_shipper : ', sorted_shipper);
            console.log('sorted_tso : ', sorted_tso);
            setComments(sorted_shipper) // เข้ามาเจอ tab shipper เสมอ
            setCommentsTso(sorted_tso)
            setCommentsShipper(sorted_shipper)
            setCommentsReason(sorted_reason)

        } catch (error) {

        }
    }

    useEffect(() => {

        if (data) {
            getComment(data?.id);

            // // กรองแยก comment ของ TSO, shipper
            // const filtered_tso = data?.query_shipper_nomination_file_comment?.filter(
            //     (item: any) => item?.query_shipper_nomination_type_comment_id === 2 // 2 = TSO
            // );

            // const filtered_shipper = data?.query_shipper_nomination_file_comment?.filter(
            //     (item: any) => item?.query_shipper_nomination_type_comment_id === 1 // 1 = Shipper
            // );

            // const filtered_reason = data?.query_shipper_nomination_file_comment?.filter(
            //     (item: any) => item?.query_shipper_nomination_type_comment_id === 3 // 3 = Reason
            // );

            // setComments(filtered_shipper) // เข้ามาเจอ tab shipper เสมอ
            // setCommentsTso(filtered_tso)
            // setCommentsShipper(filtered_shipper)
            // setCommentsReason(filtered_reason)
        }

    }, [data])

    useEffect(() => {
        setComments(commentsShipper) // เข้ามาเจอ tab shipper เสมอ
    }, [commentsShipper])

    const handleSendComment = async () => {
        if (commentText.trim() === "") return;
        const gmt7Date = new Date().toISOString();

        let data_post = {
            "reasons": false, // ใส่ false ตลอด
            "comment": commentText,
            "query_shipper_nomination_file_id": data?.id
        }

        const res_comment = await postService(`/master/daily-management/comment`, data_post)

        const newComment = {
            remark: commentText,
            create_date: gmt7Date,
            nomination_version: data?.nomination_version[0],
            query_shipper_nomination_status: data?.query_shipper_nomination_status,
            create_by_account: {
                id: userDT?.id,
                email: userDT?.email,
                first_name: userDT?.first_name,
                last_name: userDT?.last_name,
            },
        };

        // setComments((prev: any) => [...prev, newComment]);
        setComments((prev: any[] | undefined) => ([...(prev ?? []), newComment]));


        if (tabMain == 0) {
            // setCommentsShipper((prev: any) => [...prev, newComment]);
            setCommentsShipper((prev: any[] | undefined) => ([...(prev ?? []), newComment]));
        } else if (tabMain == 1) {
            // setCommentsTso((prev: any) => [...prev, newComment]);
            setCommentsTso((prev: any[] | undefined) => ([...(prev ?? []), newComment]));
        } else {
            // setCommentsReason((prev: any) => [...prev, newComment]);
            setCommentsReason((prev: any[] | undefined) => ([...(prev ?? []), newComment]));
        }

        setCommentText(""); // Clear the input field
    };

    const handleKeyPress = (e: any) => {
        if (e.key === "Enter") {
            handleSendComment();
        }
    };

    const [tabMain, setTabMain] = useState(0);
    const handleChangeTabMain = (event: any, newValue: any) => {
        setTabMain(newValue);
    };

    useEffect(() => {

        if (tabMain == 0) {
            setComments(commentsShipper);
        } else if (tabMain == 1) {
            setComments(commentsTso);
        } else {
            setComments(commentsReason);
        }

    }, [tabMain])

    return (
        <div className="h-[calc(100vh-240px)] flex flex-col">

            <div className="pb-2 -ml-5">
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
                    {(userDT?.account_manage?.[0]?.user_type?.id === 3
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
                    ))}
                </Tabs>
            </div>

            {/* Scrollable Comment List */}
            <div className="relative overflow-hidden flex-1 rounded-t-md z-1">
                <div className="flex flex-col items-center gap-2 p-4">
                    <div className={`w-full ${comments?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                        {comments && comments.length > 0 ? (
                            comments.map((item: any) => (

                                <div key={item.id} className="w-full mb-2 p-2 border rounded-lg">
                                    <div className="flex flex-col p-2">
                                        <div className="mb-2 flex justify-between items-center">
                                            <div className="flex items-baseline gap-2">
                                                <span className='rounded-[20px]  px-1 '>
                                                    <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.query_shipper_nomination_status?.color) }}>{item?.query_shipper_nomination_status?.name}</div>
                                                </span>
                                                <span className='rounded-md bg-[#D3E6F8] px-4 font-semibold text-[#464255]'> {item?.nomination_version?.version} </span>
                                                <span className='font-light'>By <span className="font-bold !text-[#58585A]">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                            </div>
                                            <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                            
                                        </div>
                                        {
                                            (userDT?.id === item?.create_by || userDT?.account_manage?.[0]?.user_type?.id === 1) &&
                                            <div className="flex justify-between items-center w-full border rounded-lg mb-2 p-4">
                                                <p className="flex items-center break-words text-ellipsis overflow-hidden">
                                                    {item?.remark}
                                                </p>
                                                <div className=' cursor-pointer w-fit'
                                                onClick={()=>{
                                                    openDeleteForm(item)
                                                }}
                                                >
                                                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18, color: '#58585A' }} />
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>

                            ))
                        ) : (
                            <NodataTable />
                        )}
                    </div>
                </div>
            </div>

            {(userDT?.account_manage?.[0]?.user_type?.id === 3 && tabMain === 0) ||
                (userDT?.account_manage?.[0]?.user_type?.id === 2 && tabMain === 1) ? (
                <div className="w-full bg-white p-2 sticky bottom-1">
                    <div className="flex flex-col">
                        <div className="mb-2 flex justify-between">
                            <span className="font-light">
                                <span className="font-bold text-[#58585A]">Comment</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-2 w-full">
                            <div className="flex items-center w-full h-[50px] border rounded-lg p-4">
                                <input
                                    type="text"
                                    className={`${inputClass}`}
                                    placeholder="Enter Comment"
                                    value={commentText}
                                    onKeyDown={handleKeyPress}
                                    onChange={(e) => setCommentText(e.target.value)}
                                />
                            </div>

                            <div
                                className="flex items-center justify-center bg-[#00ADEF] rounded-lg p-2 w-[46px] h-[46px] cursor-pointer"
                                onClick={handleSendComment}
                            >
                                <SendRoundedIcon sx={{ color: '#ffffff' }} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}


            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={`${modalModalSuccessMsg}`}
            />

            <ModalComponent
            open={isModalErrorOpen}
            handleClose={() => {
                setModalErrorOpen(false);
            }}
            title="Failed"
            description={
                <div>
                    <div className="text-center">
                        {`${modalErrorMsg}`}
                    </div>
                </div>
            }
            stat="error"
        />
          
            <ModalDelete
                data={deleteData}
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false);
                }}
                onSubmit={handleDelete}
                setResetForm={()=>{}}
            />
        </div>

    );
};

export default PageComment;