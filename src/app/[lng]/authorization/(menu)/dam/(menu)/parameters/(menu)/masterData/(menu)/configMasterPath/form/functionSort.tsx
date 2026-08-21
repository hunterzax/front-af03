type Edge = { source_id: number; target_id: number };

export function sortDataPostByEdges(dataPost: { nodes: any[]; edges: Edge[] }) {
    const { nodes, edges } = dataPost;

    // map id -> node (กัน id ซ้ำด้วยการเก็บตัวท้าย)
    const byId:any = new Map<number, any>();
    for (const n of nodes) byId.set(n.id, n);

    // สร้าง adjacency + indegree เฉพาะ edge ที่ปลายทั้งสองฝั่งอยู่ใน nodes
    const adj = new Map<number, number[]>();
    const indeg:any = new Map<number, number>();
    for (const n of byId.values()) indeg.set(n.id, 0);

    for (const e of edges) {
        if (!byId.has(e.source_id) || !byId.has(e.target_id)) continue;
        if (!adj.has(e.source_id)) adj.set(e.source_id, []);
        adj.get(e.source_id)!.push(e.target_id);
        indeg.set(e.target_id, (indeg.get(e.target_id) ?? 0) + 1);
    }

    // Kahn’s algorithm (topological sort) เป็นหลัก
    const queue: number[] = [...indeg.entries()]
        .filter(([, d]) => d === 0)
        .map(([id]) => id)
        .sort((a, b) => a - b); // คงที่เวลาแตกแขนง

    const orderedIds: number[] = [];
    const indegMutable:any = new Map(indeg);

    while (queue.length) {
        const u = queue.shift()!;
        orderedIds.push(u);
        const outs = (adj.get(u) ?? []).slice().sort((a, b) => a - b);
        for (const v of outs) {
            indegMutable.set(v, (indegMutable.get(v) ?? 0) - 1);
            if ((indegMutable.get(v) ?? 0) === 0) queue.push(v);
        }
    }

    // ถ้ายังเหลือโหนด (เช่น อยู่ในวงจร/ไม่เชื่อมกับใคร) ให้คงลำดับเดิมต่อท้าย
    const orderedSet = new Set(orderedIds);
    const tailIds = nodes.map(n => n.id).filter(id => !orderedSet.has(id));
    const finalIds = [...orderedIds, ...tailIds];

    // map กลับเป็น nodes ตามลำดับ
    const sortedNodes = finalIds
        .map(id => byId.get(id))
        .filter(Boolean) as Node[];

    // ส่งกลับ “โครงสร้างเดิม”
    return {
        ...dataPost,
        nodes: sortedNodes,
    };
}
