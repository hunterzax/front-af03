// import * as React from 'react';
import React from "react";
import {
    Dialog,
    DialogPanel,
} from "@headlessui/react";
import getUserValue from "@/utils/getuserValue";
import Image from "next/image";
import { useEffect, useState } from "react";
import { patchService, postService } from '@/utils/postService';
import ModalComponent from '../ResponseModal';
import TemplateMail from '@/components/other/rendermailTemplate';
import UploadProps from "../uploadProps";
import Spinloading from "../spinLoading";
import { decryptData, encryptData } from "@/utils/encryptionData";

interface ModalProps {
    open: boolean;
    setopen: any;
    handleClose: () => void;
}

const ModalProfile: React.FC<ModalProps> = ({ open, setopen, handleClose }) => {
    const userDT: any = getUserValue();
    const inputClass = "text-[14px] lg:text-[16px] h-[35px] lg:h-[40px] block w-full text-[#262626] p-2 ps-5 pe-10 !bg-[#EFECEC] rounded-lg border-[1px] bg-[#EFECEC] border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";
    const [userSignature, setUserSignature] = useState<string | null>(null);

    useEffect(() => {
        if (open == true) {
            const sig = localStorage.getItem("sigUrl");
            if (sig) {
                const decrypted = decryptData(sig);
                setUserSignature(decrypted);
            }
        }
    }, [open]);

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const [isModalChangePassOpen, setModalChangePassOpen] = useState(false);
    const [isModalFailedOpen, setModalFailedOpen] = useState(false);
    const [isThisUserLocal, setIsThisUserLocal] = useState<any>(false);
    const [previewUrl, setPreviewUrl] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCloseModal = () => setModalSuccessOpen(false);

    const fdInterface: any = {
        document_name: '',
        file: '',
        description: '',
        role: [],
    };

    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [formData, setFormData] = useState(fdInterface);
    const [formOpen, setFormOpen] = useState(false);

    const [fileUrl, setFileUrl] = useState('');
    const [fileType, setFileType] = useState('');
    const [isUploadNewSignature, setIsUploadNewSignature] = useState<boolean>(false);

    const [resetForm, setResetForm] = useState<() => void | null>();

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const handleFormSubmit = async (data?: any) => {
        setIsLoading(true);

        if (previewUrl) {
            const patchData = {
                signature: previewUrl,
                // mimetype: "png"
                mimetype: fileType == 'image/jpeg' ? "JPEG" : "png"
            }
            // localStorage.setItem("sigUrl", previewUrl);
            localStorage.setItem("sigUrl", encryptData(previewUrl));
            let res_ = await patchService(`/master/account-manage/signature/${userDT?.id}`, patchData);
            setIsUploadNewSignature(true)
            setModalSuccessOpen(true);
            setPreviewUrl(null);
            // await fetchData();
            if (resetForm) resetForm(); // reset form
        } else {
            // await fetchData();
            setopen(false);
            if (resetForm) resetForm(); // reset form
        }
    };

    const handleSendMailChangePassword = async (data?: any, dataGetLink?: any) => {
        setIsLoading(true);
        // if (resetForm) resetForm(); // reset form

        // send email change password
        const bodyMail = await TemplateMail({
            header: "Reset Your Password",
            description: "A request has been received to reset the password for your account. <br/> Please click the button below to reset your password",
            btntxt: "Reset Password",
            url: data,
            mode: "resetmail"
        });

        let body: any = {
            "to": dataGetLink?.email,
            "subject": "Reset Your Password",
            "body": JSON.parse(bodyMail)
        }

        const result = await postService('/mail/send-email', body);
        setModalChangePassOpen(true);
        setTimeout(() => {
            setIsLoading(false);
        }, 300);
    };

    const handleGetLink = async (data?: any) => {
        let dataGetLink = {
            email: userDT?.email
        }
        const result = await postService('/master/account-manage/get-link', dataGetLink);
        if (result?.link) {
            await handleSendMailChangePassword(result?.link, dataGetLink)
        }
    };

    useEffect(() => {
        if (!isModalSuccessOpen) {
            setopen(false);
            setIsLoading(false);
        }
    }, [isModalSuccessOpen])

    useEffect(() => {
        if (userDT?.account_manage?.[0]?.mode_account_id == 2) { // mode local = 2
            setIsThisUserLocal(true);
        }
    }, [userDT])

    const onClose = () => {
        setModalChangePassOpen(false);
        setIsLoading(false);
        setTimeout(() => {
            handleClose();
        }, 100);
    }

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20">
            {/* overlay */}
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />

            {/* wrapper: บนมือถือให้เริ่มจากด้านบน, จอกว้างค่อย ๆ กลางจอ */}
            <div className="fixed inset-0 z-10 flex items-start sm:items-center justify-center p-4 sm:p-6">
                <DialogPanel
                    transition
                    /* กว้างคงเดิม (auto) แต่ควบคุมแค่ความสูง + เลื่อนภายใน */
                    className="flex w-auto transform transition-all bg-white rounded-[20px] text-left
                        data-[closed]:translate-y-4 data-[closed]:opacity-0
                        data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in
                        data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95
                        overflow-hidden
                        max-h-[85vh] sm:max-h-[90vh] md:max-h-[calc(100svh-64px)]"
                >
                    {/* ทำคอลัมน์หลักสำหรับจัดสัดส่วน: header/content/footer */}
                    <div className="flex flex-col w-full">
                        {/* loading bar (ไม่ sticky ก็ได้) */}
                        <Spinloading spin={isLoading} rounded={20} />

                        {/* เนื้อหาเลื่อนภายในแทนตัว Dialog ทั้งตัว */}
                        <div className="flex flex-col items-center gap-2 p-4 sm:p-6 overflow-y-auto">
                            <div className="text-start w-full text-[#00ADEF] text-[24px] font-[700]">
                                {"My Profile"}
                            </div>

                            {/* avatar + ชื่อ */}
                            <div className="flex items-center w-full mt-2">
                                <div className="w-full">
                                    <div className="flex justify-center items-center">
                                        <Image
                                            // src={`/assets/icon/ptt-logo-2.svg`}
                                            src={`/assets/icon/account_icon_3.jpg`}
                                            // src={`https://flowbite.com/docs/images/people/profile-picture-5.jpg`}
                                            width={80}
                                            height={80}
                                            alt={`Profile Picture`}
                                            className="w-[80px] h-[80px] bg-cover rounded-full"
                                        />
                                    </div>

                                    <div className="mt-3">
                                        <div className="font-[400] text-[20px] text-center">
                                            {`${userDT?.first_name} ${userDT?.last_name}`}
                                        </div>
                                        <div className="text-[16px] py-1 text-center text-[#8b8b8b]">
                                            {`Role : ${userDT?.account_manage?.[0] ? userDT?.account_manage[0]?.account_role[0]?.role?.name : "Unknows"}`}
                                        </div>

                                        {isThisUserLocal && (
                                            <div className="text-[16px] py-2 text-center text-[#8b8b8b]">
                                                <button
                                                    type="button"
                                                    onClick={() => { handleGetLink() }}
                                                    className="w-[180px] h-[44px] text-[16px] font-semibold tracking-wide bg-[#3582D5] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                                                >
                                                    {`Change Password`}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* กว้างคงเดิมตามเดิม: 400/500/600px; เน้นสูงพอดีด้วย overflow ของ container ใหญ่ */}
                            <div className="grid grid-cols-2 gap-4 pt-2 w-[400px] sm:w-[500px] lg:w-[600px]">
                                <div>
                                    <label htmlFor="first_name" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                        {`First Name`}
                                    </label>
                                    <input id="first_name" type="text" value={userDT?.first_name} readOnly className={`${inputClass}`} />
                                </div>

                                <div>
                                    <label htmlFor="last_name" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                        {`Last Name`}
                                    </label>
                                    <input id="last_name" type="text" value={userDT?.last_name} readOnly className={`${inputClass}`} />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                        {`Email`}
                                    </label>
                                    <input id="email" type="text" value={userDT?.email} readOnly className={`${inputClass}`} />
                                </div>

                                <div>
                                    <label htmlFor="comp_group" className="block mb-2 text-[16px] font-light text-[#58585A]">
                                        {`Company/Group Name`}
                                    </label>
                                    <input
                                        id="comp_group"
                                        type="text"
                                        value={userDT?.account_manage?.length > 0 && userDT?.account_manage[0] ? userDT?.account_manage[0]?.group?.name : ''}
                                        readOnly
                                        className={`${inputClass}`}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <UploadProps
                                        // dataLoad={userSignature ? userSignature : userDT?.signature}
                                        dataLoad={isUploadNewSignature ? userSignature : (userDT?.signature ?? userSignature)} // เพิ่มเงื่อนไข ถ้า isUploadNewSignature เป็น true ให้ใช้ userSignature แทน
                                        title="E-Signature"
                                        required
                                        setFileType={setFileType}
                                        requiredTxt="Required: .PNG, .JPG"
                                        requiredTxtSize="Maximum file size 10 MB"
                                        requiredColor="#1473A1"
                                        onChange={(e: any) => { if (e) { setPreviewUrl(e?.url) } }}
                                        progressbarOpen
                                        spinOpen
                                    />
                                </div>
                            </div>
                        </div>

                        {/* footer sticky: ติดขอบล่างของ panel และมีเงาเบา ๆ เวลาเลื่อน */}
                        <div className="flex w-full justify-end gap-3 p-4 sm:p-6 border-t sticky bottom-0 bg-white">
                            <button
                                type="button"
                                onClick={() => {
                                    setopen(false);
                                    setTimeout(() => setPreviewUrl(null), 100);
                                }}
                                className="w-[150px] h-[44px] bg-[#fff] text-black py-2 rounded-lg focus:outline-none"
                            >
                                {`Cancel`}
                            </button>

                            <button
                                type="submit"
                                disabled={!previewUrl}
                                onClick={() => { if (previewUrl) { handleFormSubmit() } else { setopen(false); } }}
                                className={`w-[150px] h-[44px] font-bold ${previewUrl ? 'bg-[#00ADEF] hover:bg-blue-600 focus:bg-blue-600 cursor-pointer' : 'bg-[#8b8b8b] cursor-not-allowed'} text-white py-2 rounded-lg focus:outline-none`}
                            >
                                {`Save`}
                            </button>
                        </div>

                        {/* modals ย่อย */}
                        <ModalComponent
                            open={isModalSuccessOpen}
                            handleClose={() => { setModalSuccessOpen(false); setopen(false); }}
                            title="Success"
                            description="Your E-Signature was uploaded."
                        />
                        <ModalComponent
                            open={isModalChangePassOpen}
                            handleClose={() => { setModalChangePassOpen(false); setopen(false); }}
                            title="Success"
                            description="Please check your email for the instructions to reset your password."
                        />
                        <ModalComponent
                            open={isModalFailedOpen}
                            handleClose={() => setModalFailedOpen(false)}
                            title="Failed"
                            description="Your E-Signature was Upload Failed."
                            stat="error"
                        />
                    </div>
                </DialogPanel>
            </div>
        </Dialog>

    )
}

export default ModalProfile;