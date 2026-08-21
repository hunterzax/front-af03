import React, { useMemo, useState } from "react";

export function RemarkCell({ text = "" }: { text?: string }) {
    const [open, setOpen] = useState(false);
    // const [copied, setCopied] = useState(false);

    const clean = useMemo(
        () => String(text ?? "").trim(),
        [text]
    );

    const isLong = clean.length > 220 || clean.split("\n").length > 4;

    // const copy = async () => {
    //     try {
    //         await navigator.clipboard.writeText(clean);
    //         setCopied(true);
    //         setTimeout(() => setCopied(false), 1200);
    //     } catch { }
    // };

    return (
        <>
            <div className="relative max-w-[720px]">
                <div
                    className={[
                        "text-[#464255] whitespace-pre-line leading-relaxed",
                        isLong ? "line-clamp-4" : ""
                    ].join(" ")}
                    title={!isLong ? clean : undefined}
                >
                    {clean || "-"}
                </div>

                {/* fade + ปุ่มอ่านต่อ */}
                {isLong && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-7 bg-gradient-to-t from-white via-white/70 to-transparent" />
                )}

                {isLong && (
                    <div className="mt-1 flex gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="inline-flex items-center rounded-md border border-[#DFE4EA] px-2 py-1 text-xs text-[#1473A1] hover:bg-[#F5FBFF] transition"
                        >
                            Read more
                        </button>
                        {/* <button
                            type="button"
                            onClick={copy}
                            className="inline-flex items-center rounded-md border border-[#DFE4EA] px-2 py-1 text-xs text-[#58585A] hover:bg-[#F7F7F7] transition"
                        >
                            Copy
                        </button> */}
                        {/* {copied && <span className="text-xs text-green-600">Copied!</span>} */}
                    </div>
                )}
            </div>

            {/* Modal นะวัยรุ่น */}
            {open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-[20px] bg-white p-5 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 p-2">
                            {/* <h3 className="text-base font-semibold text-[#1473A1]">Remark</h3> */}
                            <h2 className="text-xl font-bold text-[#00ADEF]">{`Remark`}</h2>

                            {/* <div className="flex gap-2">
                                <button
                                    onClick={copy}
                                    className="rounded-md border border-[#DFE4EA] px-3 py-1 text-sm text-[#58585A] hover:bg-[#F7F7F7]"
                                >
                                    Copy
                                </button>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="rounded-md bg-[#1473A1] px-3 py-1 text-sm text-white hover:brightness-110"
                                >
                                    Close
                                </button>
                            </div> */}
                        </div>

                        <div className="whitespace-pre-line text-[#464255] leading-relaxed p-5">
                            {clean || "-"}
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}