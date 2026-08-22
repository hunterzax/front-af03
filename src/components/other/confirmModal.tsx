import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
// import CheckIcon from '@mui/icons-material/Check';
// import CloseIcon from '@mui/icons-material/Close';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface ModalComponentProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  title: string;
  description: any;
  stat?: string;
  btnText?: string
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  //   border: '2px solid #000',
  //   boxShadow: 24,
  p: 4,
  borderRadius: '20px',
};

const ConfirmModal: React.FC<ModalComponentProps> = ({ open, handleClose, handleConfirm, title, description, stat = "success", btnText = "ok" }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>

        {
          stat === "confirm" ?
          <div className="flex items-center justify-center pb-2">
            <div className={`flex items-center justify-center w-[60px] h-[60px] mb-3 bg-[#FFF7DB] text-[#D6AC16] rounded-full`}>
              <WarningAmberRoundedIcon sx={{ fontSize: '32px' }} />
            </div>
          </div>
          :
          <></>
        }

        <div className={`flex pb-2 justify-center text-[${stat === "confirm" ? '#D6AC16' : '#00ADEF'}] text-xl font-bold text-2`}>
          {title}
        </div>
        <div className="flex justify-center items-center font-light text-center text-[#637381] h-full">
          {
            description?.split('<br/>')?.length > 1 ?
              <ul className="text-start list-disc">
                  {
                      description.split('<br/>').map((item: string) => {
                          return (
                              <li>{item}</li>
                          )
                      })
                  }
              </ul>
              :
              <div className="text-center">
                  {`${description}`}
              </div>
          }
        </div>

        <div className='flex pt-4 justify-center'>
          <div className='p-2'>
            <button
              type='button'
              onClick={handleClose}
              className="w-[120px] h-[40px] bg-[#ffffff] text-[#464255] border border-[#DFE4EA] hover:bg-blue-600 rounded-md font-light  hover:text-white"
            >
              {`Cancel`}
            </button>
          </div>

          <div className='p-2'>
            <button
              type='button'
              onClick={handleConfirm}
              className="w-[120px] h-[40px] bg-[#00ADEF] text-white hover:bg-blue-600 rounded-md font-light"
            >
              {`${btnText}`}
            </button>
          </div>

        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;