"use client";

import Error from "next/error";

export default function NotFound() {
  return (
      <section>
        <Error statusCode={404} />
      </section>
  );
}
