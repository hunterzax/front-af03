import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Switch from '@mui/material/Switch';
import "@/app/globals.css";
import { postService } from '@/utils/postService';
import { toDayjs } from '@/utils/generalFormatter';

type RoleMgnProps = {
    open: boolean;
    handleClose: () => void;
    id: string;
    token: any;
    data: any;
    dataRole: any;
};

const RoleMgnModal: React.FC<RoleMgnProps> = ({
    open, handleClose, id, token, data, dataRole
}) => {
    const [items, setItems] = useState(data);

    // ------ ออล เลือกทั้งหมด ------
    const PERM_FIELDS = ["f_view", "f_create", "f_edit", "f_import", "f_export", "f_approved", "f_noti_inapp", "f_noti_email", "b_manage"] as const;
    // type PermField = typeof PERM_FIELDS[number];

    // true ถ้าทุกฟิลด์ที่ไม่ disabled ถูกเปิดอยู่ทั้งหมด
    const isAllTableChecked = (items: any[]) => {
        if (!items?.length) return false;
        const enabledCells = items.flatMap(i =>
            PERM_FIELDS.map(f => ({ f, v: i?.[f] }))
        ).filter(c => c.v !== 2); // 2 = disabled

        if (enabledCells.length === 0) return false;
        return enabledCells.every(c =>
            c.f === "b_manage" ? !!c.v : c.v === 1
        );
    };

    const handleToggleAllTable = async (checked: boolean) => {
        // อัปเดต state ฝั่ง UI
        setItems((prev: any) => prev.map((i: any) => {
            const next: any = { ...i };
            for (const f of PERM_FIELDS) {
                const v = i?.[f];
                if (v === 2) continue; // ข้าม disabled

                if (f === "b_manage") {
                    next[f] = checked;      // boolean
                } else {
                    next[f] = checked ? 1 : 0; // 1/0
                }
            }
            return next;
        }));

        // ยิง bulk API ครั้งเดียว
        try {
            const ids = items.map((i: any) => i.id);
            await postService('/master/account-manage/role-active-permission/bulk-table', {
                ids,
                fields: PERM_FIELDS,
                value: checked,
                skipDisabled: true, // คือจะ skip ไอ้ตัวที่เป็น 2 (disable)
            });
        } catch (e) {
            // rollback state ?
        }
    };
    // ------ ออล เลือกทั้งหมด ------






    // เลือกตัวเดียว ของเดิมโรงงาน
    const handleCheckboxChange = async (item: { id: any; }, field: string, value: any) => {
        const updatedItems = items.map((i: any) =>
            i.id === item.id ? { ...i, [field]: value ? 1 : 0 } : i
        );
        setItems(updatedItems);

        let checked: any = value == true ? 1 : 0;
        let id: any = item?.id;

        const payload = {
            id: id,
            [field]: field == "b_manage" ? value : checked
        }
        try {
            const response: any = await postService('/master/account-manage/role-active-permission', payload);
        } catch (error) {
            // Error updating API:
        }
    };

    useEffect(() => {
        if (data) {
            setItems(data);
        }
    }, [data]);

    const renderRows = (parentId: any, level = 0) => {
        // const allCheckboxesEnabled = items?.filter((item: any) => item?.menus?.parent === parentId).every((item: any) => item?.f_view !== 2); // Check if all checkboxes are enabled (not disabled)
        const reName = (name:any) => {
            if(name === "OFO"){
                return "OFO/IF"
            }else if(name === "Intraday Balancing Report"){
                return "Intraday Balancing Management"
            }else if(name === "Intraday Balancing Report For Shipper"){
                return "Intraday Balancing Report"
            }else{
                return name
            }
        }


        // Intraday Balancing Report
        // Intraday Balancing Report For Shipper

        // Intraday Balancing Management
        // Intraday Balancing Report
      
                    // ?.filter((f:any) => f?.item?.menus?.name !== "System Acc. Imbalance Inventory")
                    // ?.filter((f:any) => f?.item?.menus?.id !== 97)
        return items?.filter((item: any) => item?.menus?.parent === parentId)
            .map((item: any) => (
                <React.Fragment key={item.menus.id}>
                    <tr className='align-middle'>
                        {/* Conditionally render the correct menu based on the hierarchy level */}
                        <td className={`border-b border-zinc-300 p-2 border-[#EBEBEB] bg-[#E4F2FB] text-[#464255]`}>
                            {level === 0 ? reName(item?.menus?.name) : ""}
                        </td>
                        <td className={`border-b border-zinc-300 p-2 border-[#EBEBEB] bg-[#3582D51A] text-[#464255]`}>
                            {level === 1 ? reName(item?.menus?.name) : ""}
                        </td>
                        <td className={`border-b border-zinc-300 p-2 border-[#EBEBEB] bg-[#E5F4F1] text-[#464255]`}>
                            {level === 2 ? reName(item?.menus?.name) : ""}
                        </td>
                        <td className={`border-b border-zinc-300 p-2 border-[#EBEBEB] bg-[#0DA2A21A] text-[#464255]`}>
                            {level === 3 ? reName(item?.menus?.name) : ""}
                        </td>

                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_view === 1 ? true : false}
                                disabled={item?.f_view === 2}
                                onChange={(e) => {
                                    handleCheckboxChange(item, "f_view", e.target.checked)
                                }}
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_view === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_view === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_create === 1}
                                disabled={item?.f_create === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_create", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_create === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_create === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_edit === 1}
                                disabled={item?.f_edit === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_edit", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_edit === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_edit === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_import === 1}
                                disabled={item?.f_import === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_import", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_import === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_import === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_export === 1}
                                disabled={item?.f_export === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_export", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_export === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_export === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_approved === 1}
                                disabled={item?.f_approved === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_approved", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_approved === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_approved === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_noti_inapp === 1}
                                disabled={item?.f_noti_inapp === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_noti_inapp", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_noti_inapp === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_noti_inapp === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <input
                                type="checkbox"
                                checked={item?.f_noti_email === 1}
                                disabled={item?.f_noti_email === 2}
                                onChange={(e) =>
                                    handleCheckboxChange(item, "f_noti_email", e.target.checked)
                                }
                                className={`checkbox-custom w-4 h-4 rounded border-2 cursor-pointer 
                                ${item?.f_noti_email === 1 ? '!bg-[#00ADEF] !border-[#00ADEF]' : 'bg-gray-200 border-gray-300'} 
                                ${item?.f_noti_email === 2 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
                            />
                        </td>
                        <td className="border-b border-zinc-300 p-2 text-center align-middle">
                            <Switch
                                // className='bg-black'
                                defaultChecked={item?.b_manage}
                                checked={item?.b_manage}
                                onChange={(e) => {
                                    handleCheckboxChange(item, "b_manage", e.target.checked)
                                }}
                            />
                        </td>
                    </tr>
                    {/* {console.log('item?.menus : ', item?.menus?.id)}
                    {console.log('item?.menus : ', item?.menus?.name)} */}
                    {/* 97 */}
                    {/* System Acc. Imbalance Inventory */}
                    {renderRows(item?.menus?.id, level + 1)}
                </React.Fragment>
            ));
    }

    return (
        <Dialog open={open} onClose={handleClose} className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-6">
                    <DialogPanel
                        transition
                        className="flex transform transition-all inset-0 w-full max-w-[95%] sm:max-w-[93%] md:max-w-[90%] lg:max-w-[90%] rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                    >
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="max-h-[95vh] w-full overflow-y-auto scrollbar-hide">
                                <div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-6 rounded-[20px] bg-[#ffffff]">
                                    <div className="w-full">
                                        <h2 className="text-lg sm:text-xl font-bold text-[#00ADEF] mb-4 pb-3">
                                            {`Role`} : {dataRole?.name}
                                        </h2>

                                        <div className="mb-4 w-full sm:w-[75%]">
                                            <div className="grid grid-cols-[120px_120px_120px] text-xs sm:text-sm font-semibold gap-2 sm:gap-4">
                                                <p>{`User Type`}</p>
                                                <p>{`Start Date`}</p>
                                                <p>{`End Date`}</p>
                                            </div>

                                            <div className="grid grid-cols-[120px_120px_120px] text-xs sm:text-sm font-light gap-2 sm:gap-4">
                                                <p>{dataRole?.user_type?.name || '-'}</p>
                                                <p>{dataRole?.start_date ? toDayjs(dataRole?.start_date).format("DD/MM/YYYY") : '-'}</p>
                                                <p>{dataRole?.end_date ? toDayjs(dataRole?.end_date).format("DD/MM/YYYY") : '-'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* bg-[#1473A1] */}

                                    <div className="flex justify-start items-start gap-3 pr-2 w-full">
                                        <label className="inline-flex items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={isAllTableChecked(items)}
                                                onChange={(e) => handleToggleAllTable(e.target.checked)}
                                                className="w-6 h-6 cursor-pointer"
                                            />
                                            <span className='font-semibold'>Select All </span>
                                        </label>

                                        {/* ปุ่มลัด cyberpunk
                                        <button
                                            className="px-3 py-1 rounded bg-emerald-600 text-white text-xs"
                                            onClick={() => handleToggleAllTable(true)}
                                        >
                                            Grant all
                                        </button>
                                        <button
                                            className="px-3 py-1 rounded bg-rose-600 text-white text-xs"
                                            onClick={() => handleToggleAllTable(false)}
                                        >
                                            Revoke all
                                        </button> */}
                                    </div>

                                    <div className="w-full h-[400px] sm:h-[600px] overflow-y-auto overflow-x-auto">
                                        <table className="table-auto w-full text-xs sm:text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                                            <thead className="text-xs sm:text-sm text-[#ffffff] sticky top-0 z-10">
                                                <tr>

                                                    <th className="p-2 bg-[#3AB7EE] rounded-tl-lg text-center">{`Main Menu`}</th>
                                                    <th className="p-2 bg-[#3582D5] text-center">{`Menu`}</th>
                                                    <th className="p-2 bg-[#61C4B1] text-center">{`Sub Menu`}</th>
                                                    <th className="p-2 bg-[#0DA2A2] text-center">{`Secondary Submenu`}</th>

                                                    {/* <th className="p-2">{`Select All`}</th> */}

                                                    <th className="p-2 bg-[#1473A1]">{`View`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Create`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Edit`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Import`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Export`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Approve`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Notice Inapp`}</th>
                                                    <th className="p-2 bg-[#1473A1]">{`Notice Email`}</th>
                                                    <th className="p-2 bg-[#1473A1] rounded-tr-lg">{`Manage`}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-[#ffffff]">{renderRows(0)}</tbody>
                                        </table>
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

export default RoleMgnModal;