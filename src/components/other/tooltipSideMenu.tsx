import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

const useTooltipPosition = () => {
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    const show = (el: HTMLElement, placement: "top" | "right" = "right") => {
        const r = el.getBoundingClientRect();
        if (placement === "right") {
            setPos({ top: r.top + r.height / 2, left: r.right + 8 });
        } else {
            setPos({ top: r.top - 8, left: r.left + r.width / 2 });
        }
    };
    const hide = () => setPos(null);
    return { pos, show, hide };
}

export const TooltipWrapper = ({
    text,
    placement = "right",
    children,
}: {
    text: string;
    placement?: "top" | "right";
    children: React.ReactNode;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { pos, show, hide } = useTooltipPosition();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    return (
        <>
            <div
                ref={ref}
                className="inline-flex items-center"
                onMouseEnter={() => ref.current && show(ref.current, placement)}
                onMouseLeave={hide}
            >
                {children}
            </div>

            {mounted && pos &&
                createPortal(
                    <div
                        className="pointer-events-none fixed z-[9999999]"
                        style={{
                            top: placement === "right" ? pos.top : pos.top,
                            left: placement === "right" ? pos.left : pos.left,
                            transform:
                                placement === "right" ? "translateY(-50%)" : "translate(-50%, -100%)",
                        }}
                    >
                        <div className="rounded bg-gray-800 text-white text-xs px-2 py-1 whitespace-nowrap shadow-lg">
                            {text}
                        </div>
                    </div>,
                    document.body
                )
            }
        </>
    );
}