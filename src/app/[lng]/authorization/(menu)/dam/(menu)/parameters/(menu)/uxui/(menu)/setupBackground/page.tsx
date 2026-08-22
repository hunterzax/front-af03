"use client";
import "@/app/globals.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalComponent from "@/components/other/ResponseModal";
import { deleteService, getService, patchService, postService } from "@/utils/postService";
import ModalAction from "./form/modalAction";
import BtnAddNew from "@/components/other/btnAddNew";
import PaginationComponent from "@/components/other/globalPagination";
import { findRoleConfigByMenuName, formatDate, formatDateTimeSec, generateUserPermission } from "@/utils/generalFormatter";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import { decryptData } from "@/utils/encryptionData";
import { ColumnDef, Row } from "@tanstack/react-table";
import AppTable from "@/components/table/AppTable";
import getUserValue from "@/utils/getuserValue";
import BtnActionTable from "@/components/other/btnActionInTable";
import { Popover } from "@mui/material";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModalDelete from "./form/modalDelete";


interface ClientProps {
    params: {
        lng: string;
    };
}

const ClientPage: React.FC<ClientProps> = (props) => {

    // ############### Check Authen ###############
    const userDT: any = getUserValue();
    const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
    useRestrictedPage(token);

    // ############### PERMISSION ###############
    const [userPermission, setUserPermission] = useState<any>();
    // let user_permission: any = localStorage?.getItem("k3a9r2b6m7t0x5w1s8j");
    let user_permission: any = getCookieValue("k3a9r2b6m7t0x5w1s8j");
    user_permission = user_permission ? decryptData(user_permission) : null;

    const getPermission = () => {
        try {
            user_permission = user_permission ? JSON.parse(user_permission) : null; // Convert JSON string to object

            const permission = findRoleConfigByMenuName('Main Menu Background', userDT)
            if (permission) {
                setUserPermission(permission);
            } else if (user_permission?.role_config) {
                const updatedUserPermission = generateUserPermission(user_permission);
                setUserPermission(updatedUserPermission);
            }
        } catch (error) {
            // Failed to parse user_permission:
        }
    }

    // ############### FIELD SEARCH ###############
    const [filteredDataTable, setFilteredDataTable] = useState<any>([]);
    const [dataExport, setDataExport] = useState<any>([]);
    const [paginatedData, setPaginatedData] = useState<any>([]);

    // ############### DATA TABLE ###############
    const [dataTable, setData] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [resetForm, setResetForm] = useState<() => void | null>();

    const fetchData = async () => {
        try {
            const response: any = await getService(`/master/parameter/setup-background`);
            setData(response);
            setFilteredDataTable(response);

            setIsLoading(true);
        } catch (err) {
            // setError(err.message);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        getPermission();
    }, [resetForm]);

    // ############# NEW MODAL CREATE/EDIT/VIEW  #############
    const [isModalSuccessOpen, setModalSuccessOpen] = useState(false);
    const handleCloseModal = () => setModalSuccessOpen(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
    const [modalErrorMsg, setModalErrorMsg] = useState('');
    const [isModalErrorOpen, setModalErrorOpen] = useState(false);

    const fdInterface: any = {
        document_name: '',
        file: '',
        description: '',
        role: [],
    };
    const [formData, setFormData] = useState(fdInterface);

    useEffect(() => {
        if (filteredDataTable && Array.isArray(filteredDataTable)) {
            setPaginatedData(filteredDataTable.slice(
                (currentPage - 1) * itemsPerPage,
                currentPage * itemsPerPage
            ))
        }
        else {
            setPaginatedData([])
        }
    }, [filteredDataTable])

    const handleFormSubmit = async (data: any) => {

        const postData = {
            url: data.url
        }

        switch (formMode) {
            case "create":
                const res_create = await postService('/master/parameter/setup-background-create', postData);
                const statusCode = res_create?.response?.data?.statusCode ?? res_create?.response?.data?.status ?? res_create?.status ?? res_create?.statusCode ?? res_create?.code ?? res_create?.response?.status;
                const errorMsg = res_create?.response?.data?.error ?? res_create?.data?.error ?? res_create?.response?.error ?? res_create?.error;

                if (statusCode === 400 || statusCode === 500) {
                    setFormOpen(false);
                    setModalErrorMsg(errorMsg || '');
                    setModalErrorOpen(true)
                } else {
                    setFormOpen(false);
                    setModalSuccessOpen(true);
                }
                break;
            // case "edit":
            //     await putService(`/master/parameter/user-guide-edit/${selectedId}`, data);
            //     setFormOpen(false);
            //     setModalSuccessOpen(true);
            //     break;
            default:
                setFormOpen(false);
                break;
        }
        await fetchData();
        if (resetForm) resetForm(); // reset form
    };

    const openCreateForm = () => {
        setFormMode('create');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openEditForm = (id: any) => {
        //  fetchDataDiv(id);
        setSelectedId(id);
        const filteredData = dataTable.find((item: any) => item.id === id);

        let data_role = filteredData?.user_guide_match?.map((item: any) => ({
            id: item.role?.id
        }));


        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.document_name = filteredData.document_name;
            fdInterface.file = filteredData.file;
            fdInterface.description = filteredData.description;
            fdInterface.role = data_role;
        }
        setFormMode('edit');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const openViewForm = (id: any) => {
        const filteredData = dataTable.find((item: any) => item.id === id);

        let data_role = filteredData?.user_guide_match?.map((item: any) => ({
            id: item.role?.id
        }));

        if (filteredData) {
            fdInterface.id = filteredData.id;
            fdInterface.document_name = filteredData.document_name;
            fdInterface.file = filteredData.file;
            fdInterface.description = filteredData.description;
            fdInterface.role = data_role;
        }
        setFormMode('view');
        setFormData(fdInterface);
        setFormOpen(true);
    };

    const handleActive = async (id: any, isActive: any) => {
        let mockUpdateData = paginatedData

        if (isActive) {
            mockUpdateData = paginatedData.map((item: any) => {
                item.active = item.id == id
                return item
            })
        }
        else {
            mockUpdateData = paginatedData.map((item: any) => {
                if (item.id == id) {
                    item.active = isActive
                }
                return item
            })
        }
        setPaginatedData(mockUpdateData)

        let data = {
            active: isActive
        }
        const res_update = await patchService(`/master/parameter/setup-background-active/${id}`, data);
        fetchData();
    }

    // ############### PAGINATION ###############
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (itemsPerPage: number) => {
        setItemsPerPage(itemsPerPage);
        setCurrentPage(1);
    };

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                accessorKey: "active",
                header: "Active",
                align: 'center',
                enableSorting: false,
                cell: ({ getValue, row }: { getValue: () => any, row: Row<any> }) => {
                    const value = getValue()
                    return (
                        <div onClick={(e) => {
                            handleActive(row?.original?.id, !value);
                        }}>
                            <label className="relative inline-block w-11 h-6 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    className="sr-only peer"
                                    disabled={!userPermission?.f_edit}
                                />
                                <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-[#828282] transition duration-400 rounded-full peer-checked:bg-[#1473A1]"></span>
                                <span className="dot absolute h-5 w-5 left-0.5 bottom-0.5 bg-white transition duration-400 rounded-full peer-checked:translate-x-full"></span>
                            </label>
                        </div>
                    )
                },
            },
            {
                accessorKey: "no",
                header: "No.",
                enableSorting: true,
                accessorFn: (row: any) => {
                    let manoNumber: any = dataTable?.findIndex((item: any) => item?.id == row?.id) + 1;
                    let result: any = dataTable?.length - manoNumber;
                    return result
                },
                cell: (info) => {
                    const row: any = info?.row?.original
                    let manoNumber: any = dataTable?.findIndex((item: any) => item?.id == row?.id) + 1;
                    let result: any = dataTable?.length - manoNumber;
                    return (<div>{result}</div>)
                }
            },
            {
                accessorKey: "image",
                header: "Image Preview",
                enableSorting: false,
                width: 150,
                accessorFn: (row: any) => '',
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <img
                                src={row?.url}
                                // src={'https://demo4.nueamek.com/tpa-test/20250305133527_pg.jpg?X-Amz-Expires=86400&X-Amz-Date=20250305T092443Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=PXnZunw8j0OhDFhHMCNn%2F20250305%2Fth-west-rack1%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=9fc68e1e24affc0ddb908718be3eac1f6fa266fc14cb5f93bdc8792d60fb1c3b'}
                                loading="lazy"
                                className="w-auto h-[60px] rounded-[6px]"
                                onClick={() => handleImageClick(row?.url)}
                            ></img>
                        </div>
                    )
                }
            },
            {
                accessorKey: "create_by_account",
                header: "Create by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.create_by_account?.first_name} ` || ''}${row?.create_by_account?.last_name} ${row?.create_date ? formatDate(row?.create_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.create_by_account?.first_name} {row?.create_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.create_date ? formatDate(row?.create_date) : ''}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "update_by",
                header: "Updated by",
                width: 250,
                enableSorting: true,
                accessorFn: (row) => `${`${row?.update_by_account?.first_name} ` || ''}${row?.update_by_account?.last_name} ${row?.update_date ? formatDateTimeSec(row?.update_date) : ''}`,
                cell: (info) => {
                    const row: any = info?.row?.original
                    return (
                        <div>
                            <span className={`text-[#464255]`}>{row?.update_by_account?.first_name} {row?.update_by_account?.last_name}</span>
                            <div className="text-gray-500 text-xs">{row?.update_date ? formatDateTimeSec(row?.update_date) : ''}</div>
                        </div>
                    )
                }
            },
            {
                accessorKey: "action",
                id: 'actions',
                header: "Action",
                align: 'center',
                enableSorting: false,
                size: 100,
                cell: (info) => {
                    const row: any = info?.row?.original;
                    // const getPermission_: any = getPermission();
                    return (
                        <BtnActionTable
                            togglePopover={togglePopover}
                            row_id={row?.id}
                            // disable={getPermission_?.f_edit == true ? false : true}
                        />
                    )
                }
            },
        ],
        [dataTable])

    const [openPopoverId, setOpenPopoverId] = useState(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const [anchorPopover, setAnchorPopover] = useState<null | HTMLElement>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteData, setDeleteData] = useState<any>();
    const [modalModalSuccessMsg, setModalSuccessMsg] = useState('');


    const togglePopover = (id: any, anchor: any) => {
        console.log('id : ', id);
        console.log('anchor : ', anchor);
        console.log('openPopoverId : ', openPopoverId);
        if (openPopoverId === id) {
            setOpenPopoverId(null); // Close the popover if it's already open
            setAnchorPopover(null)
        } else {
            setOpenPopoverId(id); // Open the popover for the clicked row
            if (anchor) {
                setAnchorPopover(anchor)
            }
            else {
                setAnchorPopover(null)
            }
        }
    };

    const toggleMenu = (mode: any, id: any) => {
        switch (mode) {
        case "delete":
            openDeleteForm(id);
            setOpenPopoverId(null); // close popover
            break;
        }
    }

        const openDeleteForm = async (id: any) => {
            console.log('id : ', id);
            // filteredDataTable
            const filteredData = filteredDataTable.find((item: any) => item.id === id);
            setDeleteData(filteredData);
            setDeleteOpen(true);
            // fetchData();
        }
    
        const handleDelete = async (data: any) => {
            console.log('deleteData : ', deleteData);
            const res_del: any = await deleteService(`/master/parameter/setup-background-delete/${deleteData?.id}`);
            if (res_del?.response?.data?.status === 400) {
                setFormOpen(false);
                setModalErrorMsg(res_del?.response?.data?.error);
                setModalErrorOpen(true)
            } else {
                setFormOpen(false);
                setModalSuccessMsg('Data has been deleted.')
                setModalSuccessOpen(true);
                setTimeout(() => {
                    setDeleteOpen(false)
                }, 200);
            }
    
            await fetchData();
        }

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (imageUrl: any) => {
        setSelectedImage(imageUrl);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImage(null);
    };

    // const paginatedData = filteredDataTable?.slice(
    //     (currentPage - 1) * itemsPerPage,
    //     currentPage * itemsPerPage
    // );

    return (
        <div className=" space-y-2">
            <div className="border-[#DFE4EA] p-4 flex justify-end ">
                <BtnAddNew openCreateForm={openCreateForm} textRender={"Add"} can_create={userPermission ? userPermission?.f_create : false} />
            </div>

            {/* <div className="border-[#DFE4EA] border-[1px] p-4 rounded-xl shadow-sm">
                <TableSetupBackground
                    openEditForm={openEditForm}
                    openViewForm={openViewForm}
                    handleActive={handleActive}
                    // tableData={filteredDataTable}
                    tableData={paginatedData}
                    isLoading={isLoading}
                    userPermission={userPermission}
                />
            </div>

            <PaginationComponent
                totalItems={filteredDataTable?.length}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
            /> */}

            {/* ================== NEW TABLE ==================*/}
            <AppTable
                data={filteredDataTable}
                columns={columns}
                isLoading={isLoading}
                onFilteredDataChange={(filteredData: any) => {
                    const newData = filteredData || [];
                    if (JSON.stringify(dataExport) !== JSON.stringify(newData)) {
                        setDataExport(newData);
                    }
                }}
                filter={false}
            />

            <ModalAction
                mode={formMode}
                data={formData}
                open={formOpen}
                onClose={() => {
                    setFormOpen(false);
                    if (resetForm) {
                        setFormData(fdInterface)
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
                description="Your image was upload completed"
            />

            <ModalComponent
                open={isModalErrorOpen}
                handleClose={() => {
                    setModalErrorOpen(false);
                    if (resetForm) resetForm();
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

            {isModalOpen && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25 transition-opacity duration-300 ease-in-out opacity-100"
                    onClick={closeModal}
                >
                    <div className="relative">
                        <button
                            className="absolute top-2 right-2 text-white"
                            onClick={closeModal}
                        >
                            ✕
                        </button>
                        <img
                            src={selectedImage} // Use the selected image URL
                            alt="Enlarged"
                            className="max-w-full max-h-screen rounded-lg"
                        />
                    </div>
                </div>
            )}
            <Popover
                id="action-menu-popover"
                open={!!anchorPopover}
                anchorEl={anchorPopover}
                onClose={() => setAnchorPopover(null)}
                // anchorOrigin={{
                //     vertical: 'top',
                //     horizontal: 'right',
                // }}
                // transformOrigin={{
                //     vertical: 'top',
                //     horizontal: 'left',
                // }}
                // sx={{
                //     overflow: 'hidden',
                //     "& .MuiPopover-paper": {
                //         borderRadius: '10px', // Transfer border
                //     },
                // }}
                anchorOrigin={{
                    vertical: 'center', // เดิม top
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'center', // เดิม top
                    horizontal: 'right', // เดิม left
                }}
                sx={{
                    zIndex: 1300,
                    '& .MuiPaper-root': {
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,.14)',
                        // ขยับออกจากปุ่มไปทางซ้ายอีกเล็กน้อย (ไม่ทับขอบ)
                        transform: 'translateX(-8px)'
                    }
                }}
                className="z-50"
            >
                <div ref={popoverRef} className="w-50 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                    <ul className="py-2">
                        {
                            userPermission?.f_edit && <li className="px-4 py-2 font-bold text-sm text-[#58585A] hover:bg-gray-100 cursor-pointer" onClick={() => { toggleMenu("delete", openPopoverId) }}><DeleteOutlineOutlinedIcon sx={{ fontSize: 20, marginRight: 2, color: '#58585A' }} /> {`Delete`}</li>
                        }
                    </ul>
                </div>
            </Popover>

            <ModalComponent
                open={isModalSuccessOpen}
                handleClose={handleCloseModal}
                title="Success"
                description={`${modalModalSuccessMsg}`}
            />
          
            <ModalDelete
                data={deleteData}
                open={deleteOpen}
                onClose={() => {
                    setDeleteOpen(false);
                }}
                onSubmit={handleDelete}
                setResetForm={setResetForm}
            />
        </div>
    );
};

export default ClientPage;