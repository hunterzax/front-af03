import React, { useEffect, useState } from 'react';
import { cutUploadFileName, formatDate } from '@/utils/generalFormatter';
import NodataTable from '@/components/other/nodataTable';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { getService } from '@/utils/postService';

type FormExampleProps = {
    data?: any;
    dataRow?: any;
};

const PageViewFile: React.FC<FormExampleProps> = ({
    data,
    dataRow
}) => {
    const [dataFiles, setDataFiles] = useState<any>([]);

    const getFileUrl = async (id?: any) => {
        const data_file: any = await getService(`/master/query-shipper-nomination-file/query_shipper_nomination_file_url/${id}`);
        setDataFiles(data_file)
    }

    useEffect(() => {
        // setDataFiles(data?.query_shipper_nomination_file_url)

        getFileUrl(data?.id)
    }, [data])

    return (
        <div className="h-[calc(100vh-240px)] flex flex-col">
            <div className="relative overflow-hidden flex-1 rounded-t-md z-1">
                <div className='text-[14px] text-[#464255] font-semibold'>Shipper Files</div>

                <div className="flex flex-col items-center gap-2 p-4">
                    <div className={`w-full ${dataFiles?.length > 2 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
                        {
                            dataFiles?.length > 0 ?
                                dataFiles?.map((item: any) => (
                                    <div key={item.id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                                        <div className="flex flex-col p-2">

                                            <div className="mb-2 flex justify-between items-center">
                                                <div className="flex items-baseline gap-2">
                                                    <span className='rounded-[20px] px-1'>
                                                        <div className="flex min-w-[180px] max-w-[250px] w-auto text-center justify-center rounded-full p-1 text-[#464255]" style={{ backgroundColor: String(item?.query_shipper_nomination_status?.color) }}>{item?.query_shipper_nomination_status?.name}</div>
                                                    </span>

                                                    <span className='rounded-md bg-[#D3E6F8] px-4 font-semibold text-[#464255]'> {item?.nomination_version?.version} </span>
                                                    <span className='font-light'>By <span className="font-bold !text-[#58585A]">{item?.create_by_account && item?.create_by_account?.first_name + ' ' + item?.create_by_account?.last_name}</span></span>
                                                </div>
                                                <span className="text-gray-500">{formatDate(item?.create_date)}</span>
                                            </div>

                                            <div className="flex justify-between items-center w-full h-[50px] border rounded-lg mb-2 p-4">
                                                <p className="flex items-center">
                                                    <InsertDriveFileOutlinedIcon sx={{ fontSize: '20px' }} />
                                                    {" "}
                                                    {item?.url ? cutUploadFileName(item?.url) : 'no data'}
                                                </p>

                                                <span className="flex items-center">
                                                    {
                                                        item?.url ?
                                                            <a
                                                                href={item?.url ? item?.url : ''}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                download
                                                                className="flex items-center text-[#323232] hover:text-blue-600"
                                                            >
                                                                <FileDownloadRoundedIcon />
                                                            </a>
                                                            : null
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                : (
                                    <NodataTable />
                                )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageViewFile;