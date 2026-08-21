"use client";
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import entryNode from './nodeEntry';
import exitNode from './nodeExit';
import './style.css';
import { RenderEntries, RenderExit } from './renderNode';
import { createNodeEdges, sortNodesByEdges } from '@/utils/generalFormatter';
import { toast } from 'react-toastify';

interface FlowProps {
    entryExitMaster: any;
    setNodeData: any;
    setEdgeData: any;
    nodeEditData: any;
    edgeEditData: any;
    setIsEditDup: any;
}

const nodeTypes = {
    entryNode: entryNode,
    exitNode: exitNode,
};

const initialNodes: any = [
    // {
    //     id: '15',
    //     type: 'propertyNode',
    //     position: { x: 510, y: 575 },
    //     data: {
    //         label: 'ศุภาลัย ลอฟท์ สถานีแคราย',
    //         name: 'ศุภาลัย ลอฟท์ สถานีแคราย',
    //         age: '',
    //         gender: '',
    //         address: '',
    //         salary: '',
    //         career: '27/08/2567 : 10.00 น.',
    //         price: '฿3,800,000',
    //         position: 'downpayment',
    //         qoute: `A stylish apartment located in the heart of the city.`,
    //         pic: 'https://pdistorage.s3.ap-southeast-1.amazonaws.com/Artboard%25203%25400.75x.png'
    //     },
    // },

];

const initialEdges: any = [
    // {
    //     id: 'e1-2',
    //     source: '1',
    //     target: '2',
    //     animated: true,
    //     // type: 'smoothstep',
    //     type: 'bezier',
    //     // label: 'present contact',
    //     // labelStyle: { fill: '#000', fontWeight: 700 },
    // },
    // {
    //     id: 'e1-3',
    //     source: '1',
    //     target: '3',
    //     animated: true,
    //     type: 'bezier',
    // },

];

const MasterPathFlow: React.FC<FlowProps> = ({ entryExitMaster, setNodeData, setEdgeData, nodeEditData, edgeEditData, setIsEditDup }) => {
    const test_xxx: any = sortNodesByEdges(nodeEditData, edgeEditData);

    // const [nodes, setNodes, onNodesChange] = useNodesState(test_xxx ? test_xxx : initialNodes);
    // const [edges, setEdges, onEdgesChange] = useEdgesState(edgeEditData ? edgeEditData : initialEdges);
    const [nodes, setNodes, rawOnNodesChange] = useNodesState(test_xxx ? test_xxx : initialNodes);
    const [edges, setEdges, rawOnEdgesChange] = useEdgesState(edgeEditData ? edgeEditData : initialEdges);

    const [arrayEntry, setArrayEntry] = useState<any[]>([]);
    const [arrayExit, setArrayExit] = useState<any[]>([]);

    const [nodeId, setNodeId] = useState(1); // Node ID tracker

    const [selectedEntries, setSelectedEntries] = useState<any[]>([]);
    const [selectedExits, setSelectedExits] = useState<any[]>([]);
    const [disabledItems, setDisabledItems] = useState<any>([]);


    useEffect(() => {
        const updatedNodeEditData = test_xxx?.map((node: any) => ({
            ...node,
            data: {
                ...node.data,
                onDelete: deleteNode
            }
        }));
        setNodes(updatedNodeEditData);
    }, [setNodes]);

    useEffect(() => {
        // **********************************
        // ********* EDIT MODE ONLY *********
        // **********************************

        setArrayEntry(
            entryExitMaster
                .filter((item: any) => item.id === 1) // Entry
                .map((entry: any) => ({
                    ...entry,
                    area: entry.area.filter(
                        (area: any) => !area.end_date || new Date(area.end_date) > new Date()
                    ),
                }))
        );

        // let areaXEntry = entryExitMaster.filter((item: any) => item.id === 1) // Entry
        let areaXEntry = entryExitMaster
            .filter((item: any) => item.id === 1) // Entry
            .map((entry: any) => ({
                ...entry,
                area: entry.area.filter(
                    (area: any) => !area.end_date || new Date(area.end_date) > new Date()
                ),
            }))

        setArrayExit(entryExitMaster
            .filter((item: any) => item.id === 2) // Entry
            .map((entry: any) => ({
                ...entry,
                area: entry.area.filter(
                    (area: any) => !area.end_date || new Date(area.end_date) > new Date()
                ),
            }))
        )

        const idEntry = areaXEntry[0]?.area?.map((item: any) => item?.id);
        // ปิด area ที่เป็น exit
        // 1. หา id ของ area จาก nodeEditData.type == "exitNode"
        // 2. เอา id มาใส่ setDisabledItems
        const idExit = nodeEditData
            .filter((node: any) => node.type === "exitNode")
            .map((item: any) => parseInt(item.id, 10));

        const combinedIds = [...idEntry, ...idExit];
        if (nodeEditData?.length > 0) {
            setDisabledItems(combinedIds); // เลือก entry มาอันนึง ให้ปิดทั้งหมด
        }

    }, [entryExitMaster])


    useEffect(() => {

        setNodeData(nodes);
        // setNodeData(sortedNodes);
    }, [nodes])


    useEffect(() => {
        setEdgeData(edges);
    }, [edges])

    const addNode = (item: any, position: any) => {

        const newNode = {
            // id: `${nodeId}`,
            id: `${item.id}`,
            data: { label: item.name, id: item.id, color: item.color, onDelete: deleteNode },
            // position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position
            position: { x: 87 + Math.floor(Math.random() * 100) + 1, y: 251 + Math.floor(Math.random() * 100) + 1 }, // Random position
            // position: { x: position === 'left' ? -100 : 300, y: Math.random() * 400 },
            type: position === 'entry' ? 'entryNode' : 'exitNode', // Specify custom node type
        };

        setNodes((nds) => [...nds, newNode]);
        setNodeId(nodeId + 1); // Increment node ID

        setIsEditDup(true)
    };

    const handleSelect = (id: any, type: any) => {
        if (type === 'exit') {
            setSelectedExits((prev) => {
                const isSelected = prev.includes(id);
                if (!isSelected) {
                    // addNode(entryExitMaster[1].zone.find((item: any) => item.id === id), 'exit');
                    addNode(arrayExit[0]?.area?.find((item: any) => item.id === id), 'exit');
                }
                return isSelected ? prev.filter((exitId) => exitId !== id) : [...prev, id];
            });
            setDisabledItems((prev: any) => [...prev, id]);

        } else if (type === 'entry') {
            setSelectedEntries((prev) => {
                const isSelected = prev.includes(id);
                if (!isSelected) {
                    // addNode(entryExitMaster[0].zone.find((item: any) => item.id === id), 'entry');
                    // addNode(arrayEntry.find((item: any) => item.id === id), 'entry');
                    addNode(arrayEntry[0]?.area.find((item: any) => item.id === id), 'entry');
                }
                return isSelected ? prev.filter((exitId) => exitId !== id) : [...prev, id];
            });
            const ids = arrayEntry[0]?.area.map((item: any) => item.id);
            setDisabledItems((prevItems: any) => [...prevItems, ...ids]);
        }
    };

    const deleteNode = (id: any, mode: any) => {

        // clear disable item where disbleItem.id == id
        setNodes((prev) => prev.filter((node) => node.id !== id));
        setEdges((prevEdges) => prevEdges.filter((edge) => edge.source !== id && edge.target !== id));

        setSelectedExits((prev) => prev.filter((exitId) => exitId.toString() !== id));
        setSelectedEntries((prev) => prev.filter((exitId) => exitId.toString() !== id));

        if (mode === "exit") {
            setDisabledItems((prev: any) => prev.filter((exitId: any) => exitId.toString() !== id));
        }

        if (mode === "entry") {
            let areaXEntry = entryExitMaster
                .filter((item: any) => item.id === 1) // Entry
            // .flatMap((item: any) =>
            //     item.zone.flatMap((zone: any) => zone.area)
            // )

            // const ids = arrayEntry.map(area => area.id);
            const ids = areaXEntry[0]?.area?.map((area: any) => area.id);
            const idEntry = areaXEntry[0]?.area?.map((area: any) => area.id);
            const idExit = nodeEditData
                .filter((node: any) => node.type === "exitNode")
                .map((item: any) => parseInt(item.id, 10));

            const combinedIds = [...idEntry, ...idExit];
            setDisabledItems(combinedIds); // เลือก entry มาอันนึง ให้ปิดทั้งหมด

            let updatedDisableItem = combinedIds.filter((item: any) => !ids.includes(item));
            setDisabledItems(updatedDisableItem);
        }

        setIsEditDup(true)
    };

    // const onConnect = useCallback((params: Edge<any> | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    const onConnect = useCallback(
        (params: Edge<any> | Connection) => {
            setEdges((eds) => {
                // Check if the source node already has an outgoing edge
                const hasOutgoingEdge = eds.some(
                    (edge) => edge.source === params.source
                );

                // Allow the connection only if there's no outgoing edge
                if (!hasOutgoingEdge) {
                    return addEdge(params, eds);
                } else {
                    // alert('Each node can only have one path.');
                    toast.dismiss();
                    toast.info('Each node can only have one path.', {
                        position: 'bottom-right',
                        autoClose: 2000,
                    });
                    return eds; // Return the existing edges without modification
                }
            });
        },
        [setEdges]
    );

    const [searchEntry, setSearchEntry] = useState('');
    const [searchExit, setSearchExit] = useState('');
    const [dataEntry, setDataEntry] = useState<any>([]);
    const [dataExit, setDataExit] = useState<any>([]);

    const findEntry = (search: any) => {
        setSearchEntry(search);

        const filteredEntries = arrayEntry?.[0]?.area?.filter((entry: any) =>
            entry.name.toLowerCase().includes(search.toLowerCase())
        );
        setDataEntry(filteredEntries);
    }

    const findExit = (search: any) => {
        setSearchExit(search);

        const filteredExit = arrayExit?.[0]?.area?.filter((entry: any) =>
            entry.name.toLowerCase().includes(search.toLowerCase())
        );
        setDataExit(filteredExit);
    }

    useEffect(() => {
        setDataEntry(arrayEntry?.[0]?.area)
        setDataExit(arrayExit?.[0]?.area)
    }, [arrayEntry || arrayExit])

    // const entriesToRender = dataEntry?.length > 0 ? dataEntry : arrayEntry[0]?.area || [];
    const entriesToRender = dataEntry || [];
    const enxitToRender = dataExit || [];



    const onNodesChange = (changes: any) => {
        rawOnNodesChange(
            changes.filter((change: any) => change.type !== "remove") // Prevent node deletion
        );
    };

    const onEdgesChange = (changes: any) => {
        rawOnEdgesChange(
            changes.filter((change: any) => change.type !== "remove") // Prevent edge deletion
        );
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const activeElement = document.activeElement;
            const isInputField =
                activeElement?.tagName === "INPUT" ||
                activeElement?.tagName === "TEXTAREA" ||
                activeElement?.tagName === "SELECT" ||
                (activeElement?.getAttribute("contenteditable") === "true");

            if (!isInputField && (event.key === "Backspace" || event.key === "Delete")) {
                event.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return (<>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
        // fitView
        >
            <MiniMap />
            <Controls />
            <Background />
        </ReactFlow>

        <div className="absolute !top-[230px] right-4 flex flex-col h-[380px] w-[300px] bg-white space-y-4 border rounded-[20px] z-10">
            <div className="bg-[#2B2A87] text-white text-center py-2 rounded-t-[20px]">
                {`Add Area`}
            </div>
            <div className="flex flex-1 p-2">
                {/* Entry Section */}
                <div className="flex flex-col pe-6 flex-1">
                    <div className="text-[#58585A] h-[40px]">{`Entry`}</div>
                    <div className="h-[70px]">
                        <input
                            type="text"
                            placeholder="Search Entry"
                            className="w-full p-2 border rounded-md text-sm"
                            value={searchEntry}
                            onChange={(e) => findEntry(e.target.value)}
                        />
                    </div>
                    {/* <div className="flex flex-col -mt-5 items-center space-y-2 pr-2 overflow-y-auto flex-1 h-[100px]"> */}

                    {/* <div className="flex flex-col items-center justify-center space-y-1 overflow-y-auto h-[200px] w-full "> */}
                    <div className="inline-block overflow-y-auto h-auto max-h-[200px] space-y-1">
                        {entriesToRender.length > 0 ? (
                            <RenderEntries
                                entries={entriesToRender}
                                handleSelect={handleSelect}
                                disabledItems={disabledItems}
                                isFallback={dataEntry?.length === 0}
                            />
                        ) : (
                            <p className='flex justify-center items-center'>No entries available</p>
                        )}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] bg-gray-300 dark:bg-white/10 h-full ml-2 mr-2 z-10"></div>

                {/* Exit Section */}
                <div className="flex flex-col pe-6 flex-1 ">
                    <div className="text-[#58585A] h-[40px]">{`Exit`}</div>
                    <div className="h-[70px]">
                        <input
                            type="text"
                            placeholder="Search Entry"
                            className="w-full p-2 border rounded-md text-sm"
                            value={searchExit}
                            onChange={(e) => findExit(e.target.value)}
                        />
                    </div>

                    <div className="inline-block overflow-y-auto h-auto max-h-[200px] space-y-1">
                        {enxitToRender.length > 0 ? (
                            <RenderExit
                                entries={enxitToRender}
                                handleSelect={handleSelect}
                                disabledItems={disabledItems}
                                isFallback={dataExit?.length === 0}
                            />
                        ) : (
                            <p className='flex justify-center items-center'>No exit available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Delete Node Button */}
            {/* {nodes.length > 0 && (
                <div className="mt-2">
                    {nodes.map((node) => (
                        <button
                            key={node.id}
                            onClick={() => deleteNode(node.id)}
                            className="bg-red-500 text-white rounded px-2 py-1 m-1"
                        >
                            Delete Node {node.data.label}
                        </button>
                    ))}
                </div>
            )} */}
        </div>
    </>

    );
};

export default MasterPathFlow;