import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
} from "@headlessui/react";
import dayjs from "dayjs";

type FormExampleProps = {
  data?: any;
  open: boolean;
  onClose: () => void;
};

const ModalNotification: React.FC<FormExampleProps> = ({
  data = {},
  open,
  onClose,
}) => {

  const detailData: any = data;

  // useEffect(() => {
  //   if(data && open == true){
  //     setTimeout(() => {
  //       setIsLoading(false)
  //     }, 100);
  //   }else if(open == false){
  //     setTimeout(() => {
  //       setIsLoading(true)
  //     }, 100);
  //   }
  // }, [data, open])

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-[9999]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-[#000000] bg-opacity-45 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="flex transform transition-all inset-0 rounded-lg text-left data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* <Spinloading spin={isLoading} rounded={20} />  */}
            <div className="flex inset-0 items-center w-[600px] bg-white rounded-[16px] p-8 shadow-lg">
              <div className="w-full space-y-6">
                <div className="text-[#00ADEF] font-bold text-xl">{'View'}</div>
                <div className="w-full flex gap-6">
                  <div>
                    <div className="text-[#58585A] font-bold text-sm">{'ID'}</div>
                    <div className="text-[#58585A]">{detailData?.id || ''}</div>
                  </div>
                  <div>
                    <div className="text-[#58585A] font-bold text-sm">{'Origin'}</div>
                    <div className="text-[#58585A]">{detailData?.title || ''}</div>
                  </div>
                  <div>
                    <div className="text-[#58585A] font-bold text-sm">{'Date of Creation'}</div>
                    <div className="text-[#58585A]">{detailData?.date ? dayjs(detailData?.date)?.format('DD/MM/YYYY HH:mm'): ''}</div>
                  </div>
                </div>

                <div className="w-full p-6 text-sm border border-[#DFE4EA] rounded-[8px] max-h-[500px] min-h-[100px] overflow-x-auto h-auto scrollbar-hide">
                  {detailData?.message || ''}
                </div>
                
                <div className="w-full flex justify-end">
                  <button type="button" onClick={handleClose} className="w-[167px] font-light bg-slate-100 text-white py-2 rounded-lg hover:bg-rose-500 focus:outline-none focus:bg-rose-500 bg-[#00ADEF]">
                    {`Close`}
                  </button>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default ModalNotification;