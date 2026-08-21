"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useLogoutSync() {
  const router = useRouter();

  useEffect(() => {
    const channel = new BroadcastChannel("auth_channel");

    channel.onmessage = (event) => {
      if (event.data === "logout") {
        try {
          // ล้างเฉพาะ localStorage
          localStorage.clear();
        } catch (err) {
          console.error("Error clearing localStorage on logout:", err);
        }

        // redirect ไปหน้า sign-in
        // router.push("/en/signin");
        router.replace("/en/signin"); // ใช้ replace มันจะกดกลับมาไม่ได้
      }
    };

    return () => {
      channel.close();
    };
  }, [router]);
}