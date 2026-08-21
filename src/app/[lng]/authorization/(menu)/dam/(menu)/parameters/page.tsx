"use client";
import { useEffect } from "react";
import { useTranslation } from "@/app/i18n/client";
import Link from "next/link";

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

  // ใส่ useEffect และ use client เพื่อจำลองว่าเป็น client site
  // useEffect(() => {}, []);
  return (
    <>
      <h1>{`parameters`}</h1>
      <Link href={`/${lng}/authorization`} prefetch={true}>
          {`Back `}
      </Link>
    </>
  );
};

export default ClientPage;
