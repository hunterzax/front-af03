export const mockNode = [
    {
        "id": "10",
        "data": {
            "label": "z2",
            "id": 10,
            "color": "#00ff11"
        },
        "position": {
            "x": 19.5,
            "y": 290
        },
        "type": "entryNode",
        "width": 60,
        "height": 60,
        "selected": false,
        "positionAbsolute": {
            "x": 19.5,
            "y": 290
        },
        "dragging": false
    },
    {
        "id": "5",
        "data": {
            "label": "BB",
            "id": 5,
            "color": "#6be6a0"
        },
        "position": {
            "x": 123.5,
            "y": 362.5
        },
        "type": "exitNode",
        "width": 60,
        "height": 60,
        "selected": false,
        "positionAbsolute": {
            "x": 123.5,
            "y": 362.5
        },
        "dragging": false
    },
    {
        "id": "11",
        "data": {
            "label": "A4",
            "id": 11,
            "color": "#FF0000"
        },
        "position": {
            "x": 238,
            "y": 368.5
        },
        "type": "exitNode",
        "width": 60,
        "height": 60,
        "selected": true,
        "positionAbsolute": {
            "x": 238,
            "y": 368.5
        },
        "dragging": false
    }
]

export const mockEdges = [
    {
        "source": "10",
        "sourceHandle": null,
        "target": "5",
        "targetHandle": null,
        "id": "reactflow__edge-10-5"
    },
    {
        "source": "5",
        "sourceHandle": null,
        "target": "11",
        "targetHandle": null,
        "id": "reactflow__edge-5-11"
    }
]

const dataPost = {
    "nodes":[
        { "id": 2 },
        { "id": 3 },
        { "id": 4 },
        { "id": 5 },
        { "id": 6 },
        { "id": 7 },
        { "id": 8 }
    ],
    "edges":[
        { "source_id": 2, "target_id": 3 },
        { "source_id": 3, "target_id": 4 },
        { "source_id": 4, "target_id": 5 },
        { "source_id": 5, "target_id": 6 },
        { "source_id": 6, "target_id": 7 },
        { "source_id": 7, "target_id": 8 }
    ]
}



// NODE
const nodeEditOrigin = [
    // {
    //     "id": revised_capacity_path?.area_id.toString(),
    //     "data": {
    //         "label": revised_capacity_path?.area?.name,
    //         "id": revised_capacity_path?.area_id,
    //         "color": revised_capacity_path?.area?.color
    //     },
    //     "position": {
    //         "x": -69, // + 100 in each loop
    //         "y": 266 // + 100 in each loop
    //     },
    //     "type": revised_capacity_path?.revised_capacity_path_type_id == 1 ? "entryNode" : "exitNode",
    //     "width": 60, 
    //     "height": 60,
    //     "selected": false,
    //     "positionAbsolute": {
    //         "x": -69, // + 100 in each loop
    //         "y": 266 // + 100 in each loop
    //     },
    //     "dragging": false
    // },
    {
        "id": "17",
        "data": {
            "label": "FF",
            "id": 17,
            "color": "#21e8d1"
        },
        "position": {
            "x": 56.193643736021386,
            "y": 267.01210273350137
        },
        "type": "exitNode",
        "width": 60,
        "height": 60,
        "selected": false,
        "positionAbsolute": {
            "x": 56.193643736021386,
            "y": 267.01210273350137
        },
        "dragging": false
    },
    {
        "id": "11",
        "data": {
            "label": "A4",
            "id": 11,
            "color": "#FF0000"
        },
        "position": {
            "x": 171.61497596826268,
            "y": 266.2541574035282
        },
        "type": "exitNode",
        "width": 60,
        "height": 60,
        "selected": true,
        "positionAbsolute": {
            "x": 171.61497596826268,
            "y": 266.2541574035282
        },
        "dragging": false
    }
]



const revised_capacity_path = [
    {
        "id": 127,
        "create_date": "2024-09-30T15:49:19.328Z",
        "update_date": null,
        "create_date_num": 1727686159,
        "update_date_num": null,
        "create_by": 1,
        "update_by": null,
        "active": true,
        "config_master_path_id": 18,
        "area_id": 10,
        "revised_capacity_path_type_id": 1,
        "area": {
            "id": 10,
            "name": "z2",
            "create_date": "2024-09-24T16:48:27.899Z",
            "update_date": "2024-09-26T21:20:17.566Z",
            "create_date_num": 1727171307,
            "update_date_num": 1727360417,
            "create_by": 1,
            "update_by": 1,
            "active": true,
            "start_date": "2024-09-10T00:00:00.000Z",
            "end_date": "2024-09-26T00:00:00.000Z",
            "description": "test",
            "area_nominal_capacity": 100,
            "zone_id": 12,
            "entry_exit_id": 1,
            "color": "#00ff11",
            "supply_reference_quality_area": null
        }
    },
    {
        "id": 128,
        "create_date": "2024-09-30T15:49:19.328Z",
        "update_date": null,
        "create_date_num": 1727686159,
        "update_date_num": null,
        "create_by": 1,
        "update_by": null,
        "active": true,
        "config_master_path_id": 18,
        "area_id": 17,
        "revised_capacity_path_type_id": 2,
        "area": {
            "id": 17,
            "name": "FF",
            "create_date": "2024-09-27T21:36:21.207Z",
            "update_date": null,
            "create_date_num": 1727447781,
            "update_date_num": null,
            "create_by": 1,
            "update_by": null,
            "active": true,
            "start_date": "2024-09-17T00:00:00.000Z",
            "end_date": null,
            "description": "FF",
            "area_nominal_capacity": 213123,
            "zone_id": 23,
            "entry_exit_id": 2,
            "color": "#21e8d1",
            "supply_reference_quality_area": 12
        }
    },
    {
        "id": 129,
        "create_date": "2024-09-30T15:49:19.328Z",
        "update_date": null,
        "create_date_num": 1727686159,
        "update_date_num": null,
        "create_by": 1,
        "update_by": null,
        "active": true,
        "config_master_path_id": 18,
        "area_id": 11,
        "revised_capacity_path_type_id": 3,
        "area": {
            "id": 11,
            "name": "A4",
            "create_date": "2024-09-25T15:39:52.590Z",
            "update_date": "2024-09-30T13:44:38.236Z",
            "create_date_num": 1727253592,
            "update_date_num": 1727678678,
            "create_by": 1,
            "update_by": 1,
            "active": true,
            "start_date": "2024-09-10T00:00:00.000Z",
            "end_date": null,
            "description": "kkkkkk",
            "area_nominal_capacity": 10000000,
            "zone_id": 23,
            "entry_exit_id": 2,
            "color": "#FF0000",
            "supply_reference_quality_area": 2
        }
    }
]


// const nodeEditOrigin = [
//     {
//         "id": revised_capacity_path?.area_id.toString(),
//         "data": {
//             "label": revised_capacity_path?.area?.name,
//             "id": revised_capacity_path?.area_id,
//             "color": revised_capacity_path?.area?.color
//         },
//         "position": {
//             "x": -69, // + 100 in each loop
//             "y": 266 // + 100 in each loop
//         },
//         "type": revised_capacity_path?.revised_capacity_path_type_id == 1 ? "entryNode" : "exitNode",
//         "width": 60, 
//         "height": 60,
//         "selected": false,
//         "positionAbsolute": {
//             "x": -69, // + 100 in each loop
//             "y": 266 // + 100 in each loop
//         },
//         "dragging": false
//     },
// ]



// EDGE

const edgeEditOrigin = [
    // {
    //     "source": revised_capacity_path_edges?.source_id,
    //     "sourceHandle": null,
    //     "target": revised_capacity_path_edges?.target_id,
    //     "targetHandle": null,
    //     "id": `reactflow__edge-${revised_capacity_path_edges?.source_id}-${revised_capacity_path_edges?.target_id}`
    // },
    {
        "source": "17",
        "sourceHandle": null,
        "target": "11",
        "targetHandle": null,
        "id": "reactflow__edge-17-11"
    }
]

const revised_capacity_path_edges =[
    {
        "id": 78,
        "create_date": "2024-09-30T15:49:19.328Z",
        "update_date": null,
        "create_date_num": 1727686159,
        "update_date_num": null,
        "create_by": 1,
        "update_by": null,
        "active": true,
        "config_master_path_id": 18,
        "source_id": 10,
        "target_id": 17
    },
    {
        "id": 79,
        "create_date": "2024-09-30T15:49:19.328Z",
        "update_date": null,
        "create_date_num": 1727686159,
        "update_date_num": null,
        "create_by": 1,
        "update_by": null,
        "active": true,
        "config_master_path_id": 18,
        "source_id": 17,
        "target_id": 11
    }
]

