import LayoutMenu from "@/components/layout/LayoutMenu";
import useLogoutSync from "@/hook/useLogoutSync";

export default function RootLayout({
  children,
  params: { lng },
}: Readonly<{
  children: React.ReactNode;
  params: {
    lng: string;
  };
}>) {
  
  useLogoutSync();
  return (
    <section>
        <LayoutMenu children={children} />
    </section>
  );
}
