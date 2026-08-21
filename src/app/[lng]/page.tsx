import { useTranslation } from "@/app/i18n";

interface HomeProps {
  params: {
    lng: string;
  };
}

const HomePage: React.FC<HomeProps> = async (props) => {
  const {
    params: { lng },
  } = props;
  const { t } = await useTranslation(lng);

  return (
    <>
      <h1 className=" text-red-300">{t("homePage")}</h1>
    </>
  );
};

export default HomePage;