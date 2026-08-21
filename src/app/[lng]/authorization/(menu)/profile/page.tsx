"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/app/i18n/client";
import Link from "next/link";
import getUserValue from "@/utils/getuserValue";
import Image from "next/image";
import { patchService, postService, putService, uploadFileService } from "@/utils/postService";
import UploadIcon from '@mui/icons-material/Upload';
import ModalAction from "./form/modalAction";
import ModalComponent from "@/components/other/ResponseModal";
import { useRouter } from "next/navigation";
import ArrowBackIos from '@mui/icons-material/ArrowBackIosOutlined';
import { decryptData, encryptData } from "@/utils/encryptionData";

interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {
    const {
        params: { lng },
    } = props;
    const router = useRouter();

    const userDT: any = getUserValue();
    let userSignature: any = localStorage.getItem("sigUrl");
    userSignature = userSignature ? decryptData(userSignature) : null;

    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');

    const [formOpen, setFormOpen] = useState(false);

    const { t } = useTranslation(lng, "mainPage");
    const [fileName, setFileName] = useState('No file chosen');
    const [fileUrl, setFileUrl] = useState('');

    const inputClass = "text-sm block md:w-full text-[#262626] p-2 ps-5 pe-10 !bg-[#DFE4EA] h-[40px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];

        // if (file.type === 'application/pdf') {
        if (file) {
            if (allowedTypes.includes(file.type)) {
                setFileName(file.name);
                try {
                    const response: any = await uploadFileService('/files/uploadfile/', file);
                     
                    // localStorage.setItem("sigUrl", response?.file?.url);
                    localStorage.setItem("sigUrl", encryptData(response?.file?.url));
                    setFileUrl(response?.file?.url);
                    // setFileUrl("file", response?.file?.url);
                } catch (error) {
                    // File upload failed:
                }
            } else {
                setFileName('Invalid file type. Please upload a PDF.');
                // Invalid file type:'
            }
        } else {
            setFileName('No file chosen');
        }
    };

    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);
    const [resetForm, setResetForm] = useState<() => void | null>();
    const fdInterface: any = {
        document_name: '',
        file: '',
        description: '',
        role: [],
    };
    const [formData, setFormData] = useState(fdInterface);

    const handleFormSubmit = async (data: any) => {
        // const newData = replaceEmptyStringsWithNull(data)
        const patchData = {
            signature: data.url
        }
        setFileUrl(data.url)
        // localStorage.setItem("sigUrl", data.url);
        localStorage.setItem("sigUrl", encryptData(data.url));

        switch (formMode) {
            case "create":
                let res_ = await patchService(`/master/account-manage/signature/${userDT?.id}`, patchData);
                setFormOpen(false);
                setModalSuccessOpen(true);
                break;
            case "edit":
                // await putService(`/master/parameter/user-guide-edit/${selectedId}`, data);
                setFormOpen(false);
                setModalSuccessOpen(true);
                break;
        }
        // await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    return (
        <>
            {/* <h1>{`User Profile`}</h1> */}
            {/* <Link href={`/${lng}/authorization`} prefetch={true}>
                <div className="underline text-[#333333]">{`< Back`}</div>
            </Link> */}
            <div
                className="underline text-[#333333] px-4 cursor-pointer"
                onClick={() => router.back()}
            >
                <ArrowBackIos style={{ fontSize: "14px" }} />{` Back`}
            </div>
            <div className="flex w-full inset-0 items-center justify-center -mt-10">
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md">

                    <div className="grid grid-cols-2 gap-4 pt-4 w-[800px]">
                        <div className="col-span-2 flex items-center space-x-4">
                            <Image
                                src={`/assets/icon/account_icon_3.jpg`}
                                // src={`https://flowbite.com/docs/images/people/profile-picture-5.jpg`}
                                width={30}
                                height={30}
                                alt={`Profile Picture`}
                                className="w-[100px] h-[100px] bg-cover rounded-full"
                            />
                            <div>
                                <div className="font-bold text-[20px]">
                                    {`${userDT?.first_name} ${userDT?.last_name}`}
                                </div>
                                <div className="text-[16px] py-1">
                                    {`${userDT?.email}`}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="first_name"
                                className="block mb-2 text-sm font-light text-[#000000]"
                            >
                                {`First Name`}
                            </label>
                            <input
                                id="first_name"
                                type="text"
                                value={userDT?.first_name}
                                readOnly={true}
                                className={`${inputClass}`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="last_name"
                                className="block mb-2 text-sm font-light text-[#000000]"
                            >
                                {`Last Name`}
                            </label>
                            <input
                                id="last_name"
                                type="text"
                                value={userDT?.last_name}
                                readOnly={true}
                                className={`${inputClass}`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block mb-2 text-sm font-light text-[#000000]"
                            >
                                {`Email`}
                            </label>
                            <input
                                id="email"
                                type="text"
                                value={userDT?.email}
                                readOnly={true}
                                className={`${inputClass}`}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="comp_group"
                                className="block mb-2 text-sm font-light text-[#000000]"
                            >
                                {`Company/Group Name`}
                            </label>
                            <input
                                id="comp_group"
                                type="text"
                                value={userDT?.account_manage?.length > 0 && userDT?.account_manage[0] ? userDT?.account_manage[0]?.group?.name : ''}
                                readOnly={true}
                                className={`${inputClass}`}
                            />
                        </div>

                        <div>
                            <div>
                                <label
                                    htmlFor="e_sig"
                                    className="block mb-2 pt-3 text-sm font-light text-[#000000]"
                                >
                                    {`E-Signature`}
                                </label>
                                <img
                                    id="e_sig"
                                    //  userSignature
                                    src={userSignature ? userSignature : userDT?.signature}
                                    alt="E-Signature"
                                    className={`h-[100px] w-[200px] object-contain border rounded-[6px] bg-white`}
                                />
                            </div>
                            <div className="pt-5">
                                <label className={`bg-[#E8F3F6] text-[#1473A1] items-center font-light rounded-[6px] text-sm text-justify  px-5 py-3 cursor-pointer `} onClick={openCreateForm}>
                                    {`Upload `}
                                    {/* <input
                                        type="file"
                                        className="hidden"
                                        // accept=".pdf"
                                        accept=".png, .jpg, .jpeg"
                                        // readOnly={isReadOnly}
                                        onChange={handleFileChange}
                                    /> */}
                                    <UploadIcon />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full justify-end pt-6">
                        <button
                            type="submit"
                            onClick={() => { setModalSuccessOpen(true) }}
                            className="w-[167px] h-[44px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                        >
                            {`Save`}
                        </button>
                    </div>
                </div>

                <ModalAction
                    mode={formMode}
                    data={formData}
                    open={formOpen}
                    onClose={() => {
                        setFormOpen(false);
                        if (resetForm) {
                            setTimeout(() => {
                                resetForm();
                            }, 200);
                        }
                    }}
                    onSubmit={handleFormSubmit}
                    setResetForm={setResetForm}
                />

                <ModalComponent
                    open={isModalSuccessOpen}
                    handleClose={handleCloseModal}
                    title="Success"
                    description="Your Profile has been updated."
                />

            </div>
        </>
    );
};

export default ClientPage;
