"use client";
import React, { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
// import 'tailwindcss/tailwind.css'

const entryNode = ({ data, id }: NodeProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            key={data.id}
            className="flex justify-center p-2 items-center cursor-pointer text-gray-400 text-xs"
            // onClick={() => handleSelect(item.id, 'entry')}
            style={{
                backgroundColor: data?.color,
                width: '60px',
                height: '60px',
                borderRadius: '4px',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* <div
                className="absolute -top-1 -right-1 bg-gray-400 text-white w-[12px] h-[12px] rounded-full flex justify-center items-center"
                onClick={() => data.onDelete(id, 'entry')}
            >
                <span className="text-[7px] font-bold">X</span>
            </div> */}

            {isHovered && (
                <div
                    className="absolute -top-1 -right-1 bg-[#58585A] text-white w-[18px] h-[18px] rounded-full flex justify-center items-center cursor-pointer"
                    onClick={() => data.onDelete(id, 'entry')}
                >
                    <span className="text-[7px] font-bold">X</span>
                </div>
            )}

            <span className={`text-black`}>
                {data.label}
            </span>
            {/* <Handle type="target" position={Position.Left} /> */}
            <Handle
                type="source"
                position={Position.Right}
                style={{ // style ตุ่มดำ ๆ ระหว่าง node
                    width: 10,
                    height: 10,
                    background: '#555',
                    borderRadius: '50%',
                    border: '1px solid white',
                }}

            />
        </div>
    );
};

export default entryNode;