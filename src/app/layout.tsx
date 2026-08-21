import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { dir } from "i18next";
import "@/app/globals.css";
import { languages } from "@/app/i18n/settings";
import { ProvidersTheme } from "@/context/ThemeContext";
import ProviderRedux from "@/utils/store/ProviderRedux";
import ClientOnlyPersistGate from "@/utils/store/ClientOnlyPersistGate";
import InactivityTracker from "@/components/other/InactivityTracker";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'core-js/full/promise/with-resolvers'

// const webVersion = process.env.NEXT_PUBLIC_WEB_VERSION

export function generateStaticParams() {
  return languages.map((lng) => ({ lng }));
}

export const metadata: Metadata = {
  title: "TPA Systems",
  // title: "TPA Systems : " + webVersion,
  description: "for PTT",
  // icons: ,
};

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode;
  params: {
    lng: string;
  };
}>) {
  // const queryClient = new QueryClient();

  return (
    // <html lang={lng} suppressHydrationWarning={true}>
    <html lang={'en'} suppressHydrationWarning={true}>
      <body className={``} suppressHydrationWarning={true}>
        {/* <ProvidersTheme> */}
          <ProviderRedux>
            <ClientOnlyPersistGate >
              {/* <QueryClientProvider client={queryClient}> */}
              <InactivityTracker />
              {children}
              {/* </QueryClientProvider> */}
            </ClientOnlyPersistGate>
          </ProviderRedux>
        {/* </ProvidersTheme> */}
      </body>
    </html>
  );
}
