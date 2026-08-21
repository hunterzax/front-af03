import React, { useEffect, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { formatDate, formatDateNoTime, formatNumber, formatNumberThreeDecimal } from '@/utils/generalFormatter';
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style, table_sort_header_style_original } from "@/utils/styles";
import { handleSort } from '@/utils/sortTable';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { postService, uploadFileService } from '@/utils/postService';

type FormExampleProps = {
    data?: any;
    mainData?: any;
    file?: any;
    open: boolean;
    onClose: () => void;
    setModalErrorMsg?: any;
    setModalMsg?: any;
    setModalErrorOpen?: any;
    setModalSuccessOpen?: any;
    setMdSubmissionView?: any;
    setDataFileArr?: any;
};

const ModalSubmissionDetails: React.FC<FormExampleProps> = ({
    open,
    onClose,
    data,
    file,
    mainData,
    setModalErrorMsg,
    setModalMsg,
    setModalErrorOpen,
    setModalSuccessOpen,
    setMdSubmissionView,
    setDataFileArr
}) => {
    // const emails = data?.edit_email_group_for_event_match?.map((item: any) => item.email);
    const inputClass = "text-sm block md:w-full p-2 ps-5 pe-10 h-[35px] rounded-lg border-[1px] bg-white border-[#DFE4EA] outline-none bg-opacity-100 focus:border-[#00ADEF]";

    const [sortState, setSortState] = useState({ column: null, direction: null });
    const [sortedData, setSortedData] = useState(data);

    useEffect(() => {
        if (data && data.length > 0) {
            setSortedData(data);
        }
        setSortedData(data);
    }, [data]);

    const getArrowIcon = (column: string) => {
        return <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4, }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4, }} />
        </div>
    };

    const [fileName, setFileName] = useState('Maximum File 10 MB');
    const [fileUpload, setFileUpload] = useState<any>();
    const [fileUrl, setFileUrl] = useState<any>();

    const handleFileChange = async (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const validFileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
            const maxSizeInMB = 10; // Maximum file size in MB
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

            if (!validFileTypes.includes(file.type)) {
                setFileName('Invalid file type. Please upload a Excel file.');
                // Invalid file type:'
                return;
            }

            if (file.size > maxSizeInBytes) {
                setFileName('The file is larger than 10 MB.');
                // File size too large:
                return;
            }

            try {
                const response: any = await uploadFileService('/files/uploadfile/', file);

                setFileUrl(response?.file?.url)
            } catch (error) {
                // File upload failed:
            }

            setFileName(file.name);
            setFileUpload(file);
            // setModalMsg("Your file has been uploaded")

        } else {
            setFileName('No file chosen');
        }
    };

    const handleSubmit = async () => {
        let newDataFileArr: any
        if (file?.length > 0) {
            newDataFileArr = file.map((file: any) => file.url);
            newDataFileArr.push(fileUrl);
        }

        const transformedData = data?.flatMap((item: any, index: any) => [
            {
                booking_row_json_id: item.pathMatch.booking_version_id, // Unique ID generation logic
                temp_contract_point: item.entryData.contract_point,
                temp_zone: item.entryData.zone_text,
                temp_area: item.entryData.area_text,
                temp_start_date: item.entryData.start_date,
                temp_end_date: item.entryData.end_date,
                total_contracted_mmbtu_d: item.entryData.contracted_mmbtu_d,
                total_release_mmbtu_d: item.entryData.total_release_mmbtu_d,
                total_contracted_mmscfd: item.entryData?.contracted_mmscfd,
                total_release_mmscfd: item.entryData?.total_release_mmscfd,
                entry_exit_id: item.entryData.entry_exit_id,
                // pathMatch: item.pathMatch,
                pathMatch: {
                    // id: item.pathMatch.booking_version_id,
                    id: item.pathMatch.id,
                    entry: {
                        name: item.entryData?.["area_text"],
                    },
                    exit: {
                        name: item.exitData?.["area_text"],
                    },
                },
                path: item.path
            },
            {
                booking_row_json_id: item.pathMatch.booking_version_id, // Unique ID generation logic
                temp_contract_point: item.exitData.contract_point,
                temp_zone: item.exitData.zone_text,
                temp_area: item.exitData.area_text,
                temp_start_date: item.exitData.start_date,
                temp_end_date: item.exitData.end_date,
                total_contracted_mmbtu_d: item.exitData.contracted_mmbtu_d,
                total_release_mmbtu_d: item.exitData.total_release_mmbtu_d,
                total_contracted_mmscfd: item.exitData?.contracted_mmscfd,
                total_release_mmscfd: item.exitData?.total_release_mmscfd,
                entry_exit_id: item.exitData.entry_exit_id,
                // pathMatch: item.pathMatch,
                pathMatch: {
                    // id: item.pathMatch.booking_version_id,
                    id: item.pathMatch.id,
                    entry: {
                        name: item.entryData?.["area_text"],
                    },
                    exit: {
                        name: item.exitData?.["area_text"],
                    },
                },
                path: item.path
            },
        ]);

        // pathMatch 
        // "pathMatch": {
        //     "id": 437,
        //     "entry": {
        //         "name": "z2" 
        //     },
        //     "exit": {
        //         "name": "BB"
        //     }
        // },

        // pathMatch present
        // {
        //     "id": 170,
        //     "zone_text": "EAST",
        //     "area_text": "BB",
        //     "data_temp": {
        //         "0": "EAST",
        //         "1": "BB",
        //         "2": "BB",
        //         "3": "10000",
        //         "4": "X1",
        //         "5": "EXIT_BB",
        //         "6": "N",
        //         "7": "1000",
        //         "8": "1000",
        //         "9": "1000",
        //         "10": "1000",
        //         "33": "08/12/2024",
        //         "34": "03/04/2025",
        //         "35": "500",
        //         "36": "500",
        //         "37": "500",
        //         "38": "500",
        //         "39": "500",
        //         "40": "500",
        //         "41": "500",
        //         "42": "500"
        //     },
        //     "booking_version_id": 66,
        //     "entry_exit_id": 2,
        //     "create_date": "2024-11-14T16:02:19.965Z",
        //     "update_date": null,
        //     "create_date_num": 1731574939,
        //     "update_date_num": null,
        //     "create_by": 25,
        //     "update_by": null,
        //     "flag_use": true,
        //     "contract_point": "ENTRY_A",
        //     "entry_exit": {
        //         "id": 2,
        //         "name": "Exit",
        //         "color": "#FFF3C8",
        //         "create_date": null,
        //         "update_date": null,
        //         "create_date_num": null,
        //         "update_date_num": null,
        //         "create_by": null,
        //         "update_by": null
        //     }
        // }

        // {
        //     "booking_row_json_id": 172,
        //     "temp_contract_point": "ENTRY_A",
        //     "temp_zone": "EAST",
        //     "temp_area": "A1",
        //     "temp_start_date": "01/02/2025",
        //     "temp_end_date": "30/04/2025",
        //     "total_contracted_mmbtu_d": 150,
        //     "total_release_mmbtu_d": 2,
        //     "entry_exit_id": 1,
        //     "pathMatch": {
        //         "id": 172,
        //         "entry": {
        //             "name": "A1"
        //         },
        //         "exit": {
        //             "name": "BB"
        //         }
        //     },
        //     "path": {
        //         "id": 184,
        //         "path_management_id": 40,
        //         "config_master_path_id": 15,
        //         "temps": {
        //             "id": 15,
        //             "path_no": "0001",
        //             "create_date": "2024-09-24T14:13:47.961Z",
        //             "update_date": "2024-10-06T00:07:50.277Z",
        //             "create_date_num": 1727162027,
        //             "update_date_num": 1728148070,
        //             "create_by": 1,
        //             "update_by": 1,
        //             "active": true,
        //             "revised_capacity_path": [
        //                 {
        //                     "id": 229,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 17,
        //                     "revised_capacity_path_type_id": 3,
        //                     "area": {
        //                         "id": 17,
        //                         "name": "FF",
        //                         "create_date": "2024-09-27T21:36:21.207Z",
        //                         "update_date": "2024-10-05T23:50:38.914Z",
        //                         "create_date_num": 1727447781,
        //                         "update_date_num": 1728147038,
        //                         "create_by": 1,
        //                         "update_by": 1,
        //                         "active": true,
        //                         "start_date": "2024-09-17T00:00:00.000Z",
        //                         "end_date": null,
        //                         "description": "FF",
        //                         "area_nominal_capacity": 213123,
        //                         "zone_id": 23,
        //                         "entry_exit_id": 2,
        //                         "color": "#ffccfb",
        //                         "supply_reference_quality_area": 12
        //                     }
        //                 },
        //                 {
        //                     "id": 227,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 16,
        //                     "revised_capacity_path_type_id": 2,
        //                     "area": {
        //                         "id": 16,
        //                         "name": "NE1",
        //                         "create_date": "2024-09-26T11:07:17.112Z",
        //                         "update_date": "2024-09-26T23:19:42.248Z",
        //                         "create_date_num": 1727323637,
        //                         "update_date_num": 1727367582,
        //                         "create_by": 1,
        //                         "update_by": 1,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": "2024-09-26T00:00:00.000Z",
        //                         "description": "test xxx",
        //                         "area_nominal_capacity": 100,
        //                         "zone_id": 22,
        //                         "entry_exit_id": 2,
        //                         "color": "#4fd6e8",
        //                         "supply_reference_quality_area": 10
        //                     }
        //                 },
        //                 {
        //                     "id": 228,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 11,
        //                     "revised_capacity_path_type_id": 2,
        //                     "area": {
        //                         "id": 11,
        //                         "name": "A4",
        //                         "create_date": "2024-09-25T15:39:52.590Z",
        //                         "update_date": "2024-09-30T13:44:38.236Z",
        //                         "create_date_num": 1727253592,
        //                         "update_date_num": 1727678678,
        //                         "create_by": 1,
        //                         "update_by": 1,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": null,
        //                         "description": "kkkkkk",
        //                         "area_nominal_capacity": 10000000,
        //                         "zone_id": 23,
        //                         "entry_exit_id": 2,
        //                         "color": "#FF0000",
        //                         "supply_reference_quality_area": 2
        //                     }
        //                 },
        //                 {
        //                     "id": 226,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 8,
        //                     "revised_capacity_path_type_id": 2,
        //                     "area": {
        //                         "id": 8,
        //                         "name": "XY",
        //                         "create_date": "2024-09-24T10:56:07.801Z",
        //                         "update_date": "2024-09-30T11:30:01.138Z",
        //                         "create_date_num": 1727150167,
        //                         "update_date_num": 1727670601,
        //                         "create_by": 1,
        //                         "update_by": 1,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": null,
        //                         "description": "XY",
        //                         "area_nominal_capacity": 100,
        //                         "zone_id": 21,
        //                         "entry_exit_id": 2,
        //                         "color": "#ff00ea",
        //                         "supply_reference_quality_area": 10
        //                     }
        //                 },
        //                 {
        //                     "id": 225,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 6,
        //                     "revised_capacity_path_type_id": 2,
        //                     "area": {
        //                         "id": 6,
        //                         "name": "BS",
        //                         "create_date": "2024-09-24T10:55:57.347Z",
        //                         "update_date": "2024-09-30T11:29:45.885Z",
        //                         "create_date_num": 1727150157,
        //                         "update_date_num": 1727670585,
        //                         "create_by": 1,
        //                         "update_by": 1,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": null,
        //                         "description": "BS",
        //                         "area_nominal_capacity": 100,
        //                         "zone_id": 22,
        //                         "entry_exit_id": 2,
        //                         "color": "#11ff00",
        //                         "supply_reference_quality_area": 10
        //                     }
        //                 },
        //                 {
        //                     "id": 224,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 5,
        //                     "revised_capacity_path_type_id": 2,
        //                     "area": {
        //                         "id": 5,
        //                         "name": "BB",
        //                         "create_date": "2024-09-24T10:55:47.849Z",
        //                         "update_date": "2024-12-11T14:08:40.941Z",
        //                         "create_date_num": 1727150147,
        //                         "update_date_num": 1733900920,
        //                         "create_by": 1,
        //                         "update_by": 25,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": "2025-12-27T00:00:00.000Z",
        //                         "description": "BB",
        //                         "area_nominal_capacity": 100,
        //                         "zone_id": 23,
        //                         "entry_exit_id": 2,
        //                         "color": "#6be6a0",
        //                         "supply_reference_quality_area": 10
        //                     }
        //                 },
        //                 {
        //                     "id": 223,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 3,
        //                     "revised_capacity_path_type_id": 2,
        //                     "area": {
        //                         "id": 3,
        //                         "name": "A2",
        //                         "create_date": "2024-09-18T14:19:44.011Z",
        //                         "update_date": "2024-12-26T02:01:41.806Z",
        //                         "create_date_num": 1726643984,
        //                         "update_date_num": 1735153301,
        //                         "create_by": 1,
        //                         "update_by": 1,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": "2024-12-10T00:00:00.000Z",
        //                         "description": "A2",
        //                         "area_nominal_capacity": 100,
        //                         "zone_id": 22,
        //                         "entry_exit_id": 2,
        //                         "color": "#80ddf4",
        //                         "supply_reference_quality_area": 10
        //                     }
        //                 },
        //                 {
        //                     "id": 222,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "area_id": 2,
        //                     "revised_capacity_path_type_id": 1,
        //                     "area": {
        //                         "id": 2,
        //                         "name": "A1",
        //                         "create_date": "2024-09-18T13:59:18.284Z",
        //                         "update_date": "2024-12-11T14:08:58.841Z",
        //                         "create_date_num": 1726642758,
        //                         "update_date_num": 1733900938,
        //                         "create_by": 1,
        //                         "update_by": 25,
        //                         "active": true,
        //                         "start_date": "2024-09-10T00:00:00.000Z",
        //                         "end_date": "2025-12-27T00:00:00.000Z",
        //                         "description": "A1",
        //                         "area_nominal_capacity": 100,
        //                         "zone_id": 13,
        //                         "entry_exit_id": 1,
        //                         "color": "#cb88dd",
        //                         "supply_reference_quality_area": null
        //                     }
        //                 }
        //             ],
        //             "revised_capacity_path_edges": [
        //                 {
        //                     "id": 152,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 2,
        //                     "target_id": 3
        //                 },
        //                 {
        //                     "id": 153,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 5,
        //                     "target_id": 6
        //                 },
        //                 {
        //                     "id": 154,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 8,
        //                     "target_id": 16
        //                 },
        //                 {
        //                     "id": 155,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 16,
        //                     "target_id": 11
        //                 },
        //                 {
        //                     "id": 156,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 11,
        //                     "target_id": 17
        //                 },
        //                 {
        //                     "id": 157,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 6,
        //                     "target_id": 8
        //                 },
        //                 {
        //                     "id": 158,
        //                     "create_date": "2024-10-06T00:07:50.309Z",
        //                     "update_date": null,
        //                     "create_date_num": 1728148070,
        //                     "update_date_num": null,
        //                     "create_by": 1,
        //                     "update_by": null,
        //                     "active": true,
        //                     "config_master_path_id": 15,
        //                     "source_id": 3,
        //                     "target_id": 5
        //                 }
        //             ]
        //         },
        //         "temps_json": null,
        //         "start_date": "2025-01-15T00:00:00.000Z",
        //         "create_date": "2025-01-15T21:44:37.919Z",
        //         "update_date": null,
        //         "create_date_num": 1736952277,
        //         "update_date_num": null,
        //         "create_by": 26,
        //         "update_by": null,
        //         "flag_use": true,
        //         "exit_name_temp": "BB",
        //         "exit_id_temp": 5,
        //         "entryId": 2,
        //         "entryName": "A1",
        //         "findExit": [
        //             {
        //                 "id": 229,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 17,
        //                 "revised_capacity_path_type_id": 3,
        //                 "area": {
        //                     "id": 17,
        //                     "name": "FF",
        //                     "create_date": "2024-09-27T21:36:21.207Z",
        //                     "update_date": "2024-10-05T23:50:38.914Z",
        //                     "create_date_num": 1727447781,
        //                     "update_date_num": 1728147038,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-17T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "FF",
        //                     "area_nominal_capacity": 213123,
        //                     "zone_id": 23,
        //                     "entry_exit_id": 2,
        //                     "color": "#ffccfb",
        //                     "supply_reference_quality_area": 12
        //                 }
        //             },
        //             {
        //                 "id": 227,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 16,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 16,
        //                     "name": "NE1",
        //                     "create_date": "2024-09-26T11:07:17.112Z",
        //                     "update_date": "2024-09-26T23:19:42.248Z",
        //                     "create_date_num": 1727323637,
        //                     "update_date_num": 1727367582,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2024-09-26T00:00:00.000Z",
        //                     "description": "test xxx",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 22,
        //                     "entry_exit_id": 2,
        //                     "color": "#4fd6e8",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 228,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 11,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 11,
        //                     "name": "A4",
        //                     "create_date": "2024-09-25T15:39:52.590Z",
        //                     "update_date": "2024-09-30T13:44:38.236Z",
        //                     "create_date_num": 1727253592,
        //                     "update_date_num": 1727678678,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "kkkkkk",
        //                     "area_nominal_capacity": 10000000,
        //                     "zone_id": 23,
        //                     "entry_exit_id": 2,
        //                     "color": "#FF0000",
        //                     "supply_reference_quality_area": 2
        //                 }
        //             },
        //             {
        //                 "id": 226,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 8,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 8,
        //                     "name": "XY",
        //                     "create_date": "2024-09-24T10:56:07.801Z",
        //                     "update_date": "2024-09-30T11:30:01.138Z",
        //                     "create_date_num": 1727150167,
        //                     "update_date_num": 1727670601,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "XY",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 21,
        //                     "entry_exit_id": 2,
        //                     "color": "#ff00ea",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 225,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 6,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 6,
        //                     "name": "BS",
        //                     "create_date": "2024-09-24T10:55:57.347Z",
        //                     "update_date": "2024-09-30T11:29:45.885Z",
        //                     "create_date_num": 1727150157,
        //                     "update_date_num": 1727670585,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "BS",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 22,
        //                     "entry_exit_id": 2,
        //                     "color": "#11ff00",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 224,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 5,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 5,
        //                     "name": "BB",
        //                     "create_date": "2024-09-24T10:55:47.849Z",
        //                     "update_date": "2024-12-11T14:08:40.941Z",
        //                     "create_date_num": 1727150147,
        //                     "update_date_num": 1733900920,
        //                     "create_by": 1,
        //                     "update_by": 25,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2025-12-27T00:00:00.000Z",
        //                     "description": "BB",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 23,
        //                     "entry_exit_id": 2,
        //                     "color": "#6be6a0",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 223,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 3,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 3,
        //                     "name": "A2",
        //                     "create_date": "2024-09-18T14:19:44.011Z",
        //                     "update_date": "2024-12-26T02:01:41.806Z",
        //                     "create_date_num": 1726643984,
        //                     "update_date_num": 1735153301,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2024-12-10T00:00:00.000Z",
        //                     "description": "A2",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 22,
        //                     "entry_exit_id": 2,
        //                     "color": "#80ddf4",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             }
        //         ],
        //         "full": [
        //             {
        //                 "id": 229,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 17,
        //                 "revised_capacity_path_type_id": 3,
        //                 "area": {
        //                     "id": 17,
        //                     "name": "FF",
        //                     "create_date": "2024-09-27T21:36:21.207Z",
        //                     "update_date": "2024-10-05T23:50:38.914Z",
        //                     "create_date_num": 1727447781,
        //                     "update_date_num": 1728147038,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-17T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "FF",
        //                     "area_nominal_capacity": 213123,
        //                     "zone_id": 23,
        //                     "entry_exit_id": 2,
        //                     "color": "#ffccfb",
        //                     "supply_reference_quality_area": 12
        //                 }
        //             },
        //             {
        //                 "id": 227,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 16,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 16,
        //                     "name": "NE1",
        //                     "create_date": "2024-09-26T11:07:17.112Z",
        //                     "update_date": "2024-09-26T23:19:42.248Z",
        //                     "create_date_num": 1727323637,
        //                     "update_date_num": 1727367582,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2024-09-26T00:00:00.000Z",
        //                     "description": "test xxx",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 22,
        //                     "entry_exit_id": 2,
        //                     "color": "#4fd6e8",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 228,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 11,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 11,
        //                     "name": "A4",
        //                     "create_date": "2024-09-25T15:39:52.590Z",
        //                     "update_date": "2024-09-30T13:44:38.236Z",
        //                     "create_date_num": 1727253592,
        //                     "update_date_num": 1727678678,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "kkkkkk",
        //                     "area_nominal_capacity": 10000000,
        //                     "zone_id": 23,
        //                     "entry_exit_id": 2,
        //                     "color": "#FF0000",
        //                     "supply_reference_quality_area": 2
        //                 }
        //             },
        //             {
        //                 "id": 226,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 8,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 8,
        //                     "name": "XY",
        //                     "create_date": "2024-09-24T10:56:07.801Z",
        //                     "update_date": "2024-09-30T11:30:01.138Z",
        //                     "create_date_num": 1727150167,
        //                     "update_date_num": 1727670601,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "XY",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 21,
        //                     "entry_exit_id": 2,
        //                     "color": "#ff00ea",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 225,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 6,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 6,
        //                     "name": "BS",
        //                     "create_date": "2024-09-24T10:55:57.347Z",
        //                     "update_date": "2024-09-30T11:29:45.885Z",
        //                     "create_date_num": 1727150157,
        //                     "update_date_num": 1727670585,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": null,
        //                     "description": "BS",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 22,
        //                     "entry_exit_id": 2,
        //                     "color": "#11ff00",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 224,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 5,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 5,
        //                     "name": "BB",
        //                     "create_date": "2024-09-24T10:55:47.849Z",
        //                     "update_date": "2024-12-11T14:08:40.941Z",
        //                     "create_date_num": 1727150147,
        //                     "update_date_num": 1733900920,
        //                     "create_by": 1,
        //                     "update_by": 25,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2025-12-27T00:00:00.000Z",
        //                     "description": "BB",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 23,
        //                     "entry_exit_id": 2,
        //                     "color": "#6be6a0",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 223,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 3,
        //                 "revised_capacity_path_type_id": 2,
        //                 "area": {
        //                     "id": 3,
        //                     "name": "A2",
        //                     "create_date": "2024-09-18T14:19:44.011Z",
        //                     "update_date": "2024-12-26T02:01:41.806Z",
        //                     "create_date_num": 1726643984,
        //                     "update_date_num": 1735153301,
        //                     "create_by": 1,
        //                     "update_by": 1,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2024-12-10T00:00:00.000Z",
        //                     "description": "A2",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 22,
        //                     "entry_exit_id": 2,
        //                     "color": "#80ddf4",
        //                     "supply_reference_quality_area": 10
        //                 }
        //             },
        //             {
        //                 "id": 222,
        //                 "create_date": "2024-10-06T00:07:50.309Z",
        //                 "update_date": null,
        //                 "create_date_num": 1728148070,
        //                 "update_date_num": null,
        //                 "create_by": 1,
        //                 "update_by": null,
        //                 "active": true,
        //                 "config_master_path_id": 15,
        //                 "area_id": 2,
        //                 "revised_capacity_path_type_id": 1,
        //                 "area": {
        //                     "id": 2,
        //                     "name": "A1",
        //                     "create_date": "2024-09-18T13:59:18.284Z",
        //                     "update_date": "2024-12-11T14:08:58.841Z",
        //                     "create_date_num": 1726642758,
        //                     "update_date_num": 1733900938,
        //                     "create_by": 1,
        //                     "update_by": 25,
        //                     "active": true,
        //                     "start_date": "2024-09-10T00:00:00.000Z",
        //                     "end_date": "2025-12-27T00:00:00.000Z",
        //                     "description": "A1",
        //                     "area_nominal_capacity": 100,
        //                     "zone_id": 13,
        //                     "entry_exit_id": 1,
        //                     "color": "#cb88dd",
        //                     "supply_reference_quality_area": null
        //                 }
        //             }
        //         ]
        //     }
        // }

        let data_post = {
            contract_code_id: mainData?.contract_code_id,
            group_id: mainData?.group?.id,
            url: newDataFileArr?.length > 0 ? newDataFileArr : fileUrl ? [fileUrl] : null,
            data: transformedData
        }

        const res_submit = await postService('/master/release-capacity-submission/submission', data_post)
        const statusCode = res_submit?.response?.data?.statusCode ?? res_submit?.response?.data?.status ?? res_submit?.status ?? res_submit?.statusCode ?? res_submit?.code ?? res_submit?.response?.status;
        const errorMsg = res_submit?.response?.data?.error ?? res_submit?.data?.error ?? res_submit?.response?.error ?? res_submit?.error;

        if (statusCode === 400 || statusCode === 500) {
            setMdSubmissionView(false);
            // setModalErrorMsg(res_submit?.response?.data?.error || "Something wrong");
            setModalErrorMsg(errorMsg || "Something wrong");
            setModalErrorOpen(true);
        } else {
            setMdSubmissionView(false);
            setModalMsg("Submission Success");
            setModalSuccessOpen(true);
            setDataFileArr([]);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} className="relative z-20 w-full">
            {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
            <div className={["fixed inset-0 bg-black/45", "transition-opacity duration-100 ease-out", open ? "opacity-100" : "opacity-0 pointer-events-none"].join(" ")} />
            <div className="fixed inset-0 z-10 flex items-center justify-center">
                <DialogPanel
                    transition
                    className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="flex flex-col items-center gap-2 p-9 w-full">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`Submit`}</h2>
                            <div className="mb-4 w-[100%]">
                                <div className="grid grid-cols-3 text-sm font-semibold text-[#58585A]">
                                    <p>{`Contract Code`}</p>
                                    {/* <p>{`Shipper Name`}</p>
                                    <p>{`Submitted Timestamp`}</p> */}
                                </div>

                                <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                                    <p>{mainData?.contract_code || '-'}</p>
                                    {/* <p>{data?.group?.name || '-'}</p>
                                    <p>{formatDate(data?.submitted_timestamp) || '-'}</p> */}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 w-[100%] h-[350px] border border-[#DFE4EA] rounded-[10px] overflow-auto">
                            <div className="text-[#464255] font-light text-[14px] w-full">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                                        <tr className="h-9">
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contract_point", sortState, setSortState, setSortedData, data)}>
                                                {`Point`}
                                                {getArrowIcon("contract_point")}
                                            </th>
                                            {/* <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("entry_exit_id", sortState, setSortState, setSortedData, data)}>
                                                {`Entry / Exit`}
                                                {getArrowIcon("entry_exit_id")}
                                            </th> */}
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("start_date", sortState, setSortState, setSortedData, data)}>
                                                {`Start Date`}
                                                {getArrowIcon("start_date")}
                                            </th>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("end_date", sortState, setSortState, setSortedData, data)}>
                                                {`End Date`}
                                                {getArrowIcon("end_date")}
                                            </th>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contracted_mmbtu_d", sortState, setSortState, setSortedData, data)}>
                                                {`Contracted (MMBTU/D)`}
                                                {getArrowIcon("contracted_mmbtu_d")}
                                            </th>
                                            <th scope="col" className={`${table_sort_header_style}`} onClick={() => handleSort("contracted_mmscfd", sortState, setSortState, setSortedData, data)}>
                                                {`Contracted (MMSCFD)`}
                                                {getArrowIcon("contracted_mmscfd")}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}>
                                                {`Release (MMSCFD)`}
                                            </th>
                                            <th scope="col" className={`${table_header_style}`}>
                                                {`Release (MMBTU/D)`}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedData?.length > 0 &&
                                            sortedData.map((row: any, index: any) => (
                                                <>
                                                    {/* ENTRY */}
                                                    <tr key={`${index}-entry`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 text-[#464255]">{row?.entryData ? row?.entryData?.contract_point : ''}</td>
                                                        {/* <td className="px-2 py-1 justify-center">
                                                            {row?.entryData?.entry_exit && (
                                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.entryData?.entry_exit?.color }}>
                                                                    {`${row?.entryData?.entry_exit?.name}`}
                                                                </div>
                                                            )}
                                                        </td> */}
                                                        {/* <td className={`px-2 py-1 ${row?.entryData ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{row?.entryData?.start_date ? formatDateNoTime(row?.entryData?.start_date) : ''}</td>
                                                        <td className={`px-2 py-1 ${row?.entryData ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{row?.entryData?.end_date ? formatDateNoTime(row?.entryData?.end_date) : ''}</td> */}
                                                        <td className={`px-2 py-1 ${row?.entryData ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{row?.entryData?.start_date ? row?.entryData?.start_date : ''}</td>
                                                        <td className={`px-2 py-1 ${row?.entryData ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{row?.entryData?.end_date ? row?.entryData?.end_date : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.entryData?.contracted_mmbtu_d && formatNumberThreeDecimal(row?.entryData?.contracted_mmbtu_d)}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.entryData?.contracted_mmscfd && formatNumberThreeDecimal(row?.entryData?.contracted_mmscfd)}</td>
                                                        {/* <td className="px-2 py-1 text-[#464255] text-right">{row?.entryData?.contracted_mmscfd !== null ? row?.entryData?.total_release_mmbtu_d : ''}</td> */}
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.entryData?.total_release_mmscfd !== null ? formatNumberThreeDecimal(row?.entryData?.total_release_mmscfd) : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberThreeDecimal(row?.entryData?.total_release_mmbtu_d)}</td>
                                                    </tr>

                                                    {/* EXIT */}
                                                    <tr key={`${index}-exit`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 text-[#464255]">{row?.exitData ? row?.exitData?.contract_point : ''}</td>
                                                        {/* <td className="px-2 py-1 justify-center">
                                                            {row?.exitData?.entry_exit && (
                                                                <div className="flex w-[100px] justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: row?.exitData?.entry_exit?.color }}>
                                                                    {`${row?.exitData?.entry_exit?.name}`}
                                                                </div>
                                                            )}
                                                        </td> */}
                                                        {/* <td className={`px-2 py-1 ${row?.exitData ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{row?.exitData?.start_date ? formatDateNoTime(row?.exitData?.start_date) : ''}</td>
                                                        <td className={`px-2 py-1 ${row?.exitData ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{row?.exitData?.end_date ? formatDateNoTime(row?.exitData?.end_date) : ''}</td> */}
                                                        <td className={`px-2 py-1 ${row?.exitData ? 'text-[#464255]' : 'text-[#9CA3AF]'}`}>{row?.exitData?.start_date ? row?.exitData?.start_date : ''}</td>
                                                        <td className={`px-2 py-1 ${row?.exitData ? 'text-[#0DA2A2]' : 'text-[#9CA3AF]'}`}>{row?.exitData?.end_date ? row?.exitData?.end_date : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.exitData?.contracted_mmbtu_d && formatNumberThreeDecimal(row?.exitData?.contracted_mmbtu_d)}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.exitData?.contracted_mmscfd && formatNumberThreeDecimal(row?.exitData?.contracted_mmscfd)}</td>
                                                        {/* <td className="px-2 py-1 text-[#464255] text-right">{row?.exitData?.contracted_mmscfd !== null ? row?.exitData?.total_release_mmbtu_d : ''}</td> */}
                                                        <td className="px-2 py-1 text-[#464255] text-right">{row?.exitData?.total_release_mmscfd !== null ? formatNumberThreeDecimal(row?.exitData?.total_release_mmscfd) : ''}</td>
                                                        <td className="px-2 py-1 text-[#464255] text-right">{formatNumberThreeDecimal(row?.exitData?.total_release_mmbtu_d)}</td>
                                                    </tr>

                                                    {/* TOTAL */}
                                                    <tr key={`${row?.id}-total`} className={`${table_row_style}`}>
                                                        <td className="px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47]" colSpan={6}>
                                                            {`Total`}
                                                        </td>
                                                        <td className={`px-2 py-1 font-semibold text-[#464255] bg-[#00ADEF47] text-right`}>{"0.000"}</td>
                                                    </tr>
                                                </>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex w-full">
                            <div className='w-full'>
                                {/* "Choose File" button */}
                                <label
                                    className="block mb-2 text-sm font-light pb-1 text-[#58585A]"
                                >
                                    {`File (Optional)`}
                                </label>

                                <div className="flex items-center">
                                    <label className={`bg-[#00ADEF] text-white flex items-center justify-center font-light rounded-l-[6px] text-sm text-justify w-[15%] !h-[40px] px-5 py-2 cursor-pointer `}> {/* ${isReadOnly && "!bg-[#B6B6B6] !text-[#828282]"} */}
                                        {`Choose File`}
                                        <input
                                            id="url"
                                            type="file"
                                            className="hidden"
                                            accept=".xls, .xlsx"
                                            // readOnly={isReadOnly}
                                            // disabled={isReadOnly}
                                            onChange={handleFileChange}
                                        />
                                    </label>

                                    {/* Filename display */}
                                    <div className={`bg-white text-[#9CA3AF] text-sm w-[30%] !h-[40px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden `}>  {/* ${isReadOnly && '!bg-[#EFECEC]'} */}
                                        {fileName}
                                    </div>
                                </div>
                            </div>
                            {/* "Upload" button */}
                            {/* <label className={`
                                ${fileName === "Maximum File 10 MB" ? 'bg-[#E5E7EB] !text-[#9CA3AF] pointer-events-none' : 'hover:bg-[#2c6582]'}
                                w-[167px] ml-2 !h-[40px] font-bold bg-[#00ADEF] text-white py-2 px-5 rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:bg-blue-600 flex items-center justify-center text-[14px] `}> 
                                {`Upload`}
                                <input
                                    type="button"
                                    className="hidden"
                                    // accept=".xls, .xlsx"
                                    // readOnly={isReadOnly}
                                    // disabled={isReadOnly}
                                    onClick={handleClickUpload}
                                />
                            </label> */}
                        </div>
                        <span className='w-full flex text-left justify-start text-[#1473A1] text-[14px]'>Required :  .xls, .xlsx</span>

                        <div className="w-full flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-[167px] font-light bg-slate-100 text-black py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500"
                            >
                                {`Cancel`}
                            </button>

                            <button
                                // type="submit"
                                type="button"
                                onClick={handleSubmit}
                                className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                            >
                                {`Submit`}
                            </button>
                        </div>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ModalSubmissionDetails;