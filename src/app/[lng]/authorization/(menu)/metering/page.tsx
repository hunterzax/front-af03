"use client";
import { useTranslation } from "@/app/i18n/client";
import getCookieValue from "@/utils/getCookieValue";
import useRestrictedPage from "@/utils/checkRestrictedPage";
import TableViewIcon from '@mui/icons-material/TableView';

interface ClientProps {
  params: {
    lng: string;
  };
}

const ClientPage: React.FC<ClientProps> = (props) => {
  const {
    params: { lng },
  } = props;
  const { t } = useTranslation(lng, "mainPage");

   // ############### Check Authen ###############
   const token = getCookieValue("v4r2d9z5m3h0c1p0x7l");
   useRestrictedPage(token);

  return (
    <div className="w-full h-[calc(100vh-160px)] flex items-center bg-center">
      <div className="flex flex-col items-center p-6">
        <div className="flex items-center justify-center w-[120px] h-[120px] bg-white border-2 border-[#00ADEF] text-[#00ADEF] rounded-full">
          <div className="text-center">
            <TableViewIcon sx={{ color: "#00ADEF", fontSize: '60px' }} />
          </div>
        </div>
        <div className="text-xs text-[#00ADEF] font-semibold !text-[40px] pt-6">{`Metering`}</div>
      </div>
    </div>
  );
};

export default ClientPage;