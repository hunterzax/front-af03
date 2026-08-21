import React from 'react'
import {Dialog, DialogPanel} from '@headlessui/react'
import {cutUploadFileName, formatDateTimeNoPlusSeven} from '@/utils/generalFormatter'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import dayjs from 'dayjs'

type FormExampleProps = {
  data: any
  open: boolean
  onClose: () => void
  modeShowDiv?: any
  setModalMsg?: any
  setModalSuccessOpen?: any
  setModalSuccessMsg?: any
}

const ModalFiles: React.FC<FormExampleProps> = ({open, onClose, data, modeShowDiv, setModalMsg, setModalSuccessOpen, setModalSuccessMsg}) => {
  // clear state when closes
  const handleClose = () => {
    onClose()
    // setEmailGroup([]);
    // setFileName("Maximum File 10 MB")
  }

  // {Type}_{Contract Code}_{ShipperName}_{Timestamp}
  const handleDownload = async () => {
    try {
      const fileUrl = data?.upload_template_for_shipper_file?.[0]?.url

      if (!fileUrl) return

      const originalFileName = cutUploadFileName(fileUrl)

      const extension = originalFileName.includes('.') ? originalFileName.substring(originalFileName.lastIndexOf('.')) : ''

      const nameFile = `${data?.nomination_type?.document_type || ''}_${data?.contract_code?.contract_code || ''}_${data?.group?.name || ''}_${dayjs(data?.upload_template_for_shipper_file?.[0]?.create_date).format('YYYYMMDDHHmmss')}${extension}`

      const response = await fetch(fileUrl)

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()

      const blobUrl = window.URL.createObjectURL(blob)

      const link = document.createElement('a')

      link.href = blobUrl
      link.download = nameFile

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('Download error:', error)

      setModalSuccessOpen?.(true)
      setModalSuccessMsg?.('Unable to download file')
    }
  }
  return (
    <Dialog open={open} onClose={handleClose} className="relative z-20">
      {/* <div className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity" /> */}
      <div className={['fixed inset-0 bg-black/45', 'transition-opacity duration-100 ease-out', open ? 'opacity-100' : 'opacity-0 pointer-events-none'].join(' ')} />
      <div className="fixed inset-0 z-10 flex items-center justify-center">
        <DialogPanel
          transition
          className="flex w-auto transform transition-all bg-white inset-0 rounded-[20px] text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
        >
          <div className="flex flex-col items-center gap-2 p-9 w-[700px]">
            <div className="w-full">
              <h2 className="text-xl font-bold text-[#00ADEF] mb-4 pb-3">{`File`}</h2>
              <div className="mb-4 w-[80%]">
                <div className="grid grid-cols-3 text-sm font-semibold text-[#58585A]">
                  <p>{`Contract Code`}</p>
                  <p>{`Shipper Name`}</p>
                  <p>{`Document Type`}</p>
                </div>

                <div className="grid grid-cols-3 text-sm font-light text-[#58585A]">
                  <p>{data?.contract_code?.contract_code || ''}</p>
                  <p>{data?.group?.name || ''}</p>
                  <p>{data?.nomination_type?.document_type || ''}</p>
                </div>
              </div>
            </div>

            <div className={`mb-4 w-[100%] ${data?.upload_template_for_shipper_file?.length > 3 ? 'max-h-[350px] overflow-y-auto' : ''}`}>
              {/* only lasted 1 file */}
              {data?.upload_template_for_shipper_file?.[0] && (
                <div key={data.upload_template_for_shipper_file[0].id} className="w-full h-auto mb-2 p-2 border rounded-lg">
                  <div className="flex flex-col p-2">
                    <div className="mb-2 flex justify-between">
                      <span className="font-light">
                        By{' '}
                        <span className="font-bold text-[#58585A]">
                          {data.upload_template_for_shipper_file[0]?.create_by_account?.first_name} {data.upload_template_for_shipper_file[0]?.create_by_account?.last_name}
                        </span>
                      </span>
                      <span className="text-[#9CA3AF] font-light">{formatDateTimeNoPlusSeven(data.upload_template_for_shipper_file[0]?.create_date)}</span>
                    </div>
                    <div className="flex justify-between items-center w-full h-[50px] border rounded-lg mb-2 p-4">
                      <p className="flex items-center">
                        <InsertDriveFileOutlinedIcon sx={{fontSize: '20px'}} /> {data.upload_template_for_shipper_file[0]?.url ? cutUploadFileName(data.upload_template_for_shipper_file[0].url) : 'no data'}
                      </p>
                      <span className="flex items-center">
                        {/* {data.upload_template_for_shipper_file[0]?.url && (
                                                    <a
                                                        href={data.upload_template_for_shipper_file[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download
                                                        // download={nameFile}
                                                        className="flex items-center text-[#323232] hover:text-blue-600"
                                                    >
                                                        <FileDownloadRoundedIcon />
                                                    </a>
                                                )} */}
                        {data.upload_template_for_shipper_file[0]?.url && (
                          <button type="button" onClick={handleDownload} className="flex items-center text-[#323232] hover:text-blue-600">
                            <FileDownloadRoundedIcon />
                          </button>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full flex justify-end pt-8">
              <button onClick={handleClose} className="w-[167px] font-bold bg-[#00ADEF] text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                {'Close'}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export default ModalFiles
