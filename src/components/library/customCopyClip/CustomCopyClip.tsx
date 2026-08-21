"use client";
import React, { useState } from "react";

function CustomCopyClip() {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (text: any) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000); // ซ่อน noti หลัง 2 วินาที
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          handleCopy("coppy");
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Copy
      </button>
      {isCopied && (
        <div className={`absolute top-[-40px] left-0 bg-green-500 text-white px-2 py-1 rounded animate-fadeInOut`}>
          Copied!
        </div>
      )}
    </div>
  );
}

export default CustomCopyClip;
