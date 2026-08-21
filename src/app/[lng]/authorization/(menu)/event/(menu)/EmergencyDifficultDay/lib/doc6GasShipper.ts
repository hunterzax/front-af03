/**
 * Doc6 — contract helpers for `gas_shipper[]` sent to `/master/event/emer/doc6` APIs.
 * Keep mapping pure so UI state shape can evolve without mutating submit payloads.
 */

export type Doc6GasShipperApiRow = {
    id: number | null;
    ir: number | null;
    nom_point: unknown;
    nom_value_mmscfh: string;
    gas_command: string;
    gas_more: string;
    shipper: number[];
    file: string[];
};

/** One UI/logic block before POST (mirrors legacy watch() + selected shipper arrays). */
export type Doc6LegacyBlockInput = {
    /** `doc_6_perm_lod_*` — truthy when user picked increase/decrease */
    permLod: unknown;
    /**
     * Legacy gate for create: previously `watch('doc_6_perm_lod_n') && watch('shipper_id_n')`.
     * Caller should pass whether shipper selection is considered complete.
     */
    shipperGate: boolean;
    nomPoint: unknown;
    /** Already formatted MMSCFH string (may be empty). */
    nomValueMmscfh: string;
    gasCommand: string;
    gasMore: string;
    /** Extra shipper ids chosen in UI (non-default chips). */
    selectedShipperIds: number[];
    /** Shipper ids locked as default (non-removable in UI). */
    defaultShipperIds: number[];
    /** New upload URL for this block; empty string if none (legacy only sends new URL). */
    newFileUrl: string;
    /** Server row id for edit; null for create rows */
    serverId: number | null;
};

export const DOC6_GAS_SHIPPER_MAX_BLOCKS = 5;
export const DOC6_GAS_SHIPPER_MIN_VISIBLE_BLOCKS = 1;
export const DOC6_LEGACY_BLOCK_COUNT = 5;

/** Default row for `doc6_extra_blocks` (create flow starts with one; edit extras may append). */
export type Doc6ExtraBlockFormValue = {
    ir?: unknown;
    nom_point?: unknown;
    nom_value_mmscfh?: unknown;
    gas_command?: unknown;
    gas_more?: unknown;
    shipper?: number[];
    /** New upload only; sent in API `file` on create/edit. Empty on load when a server file exists. */
    fileUrl?: unknown;
    /** Server file URL for edit/view download only; never mapped into `newFileUrl` for submit. */
    persistedFileUrl?: unknown;
    fileName?: unknown;
    serverId?: unknown;
    defaultShipperIds?: number[];
};

export function emptyDoc6ExtraBlock(): Doc6ExtraBlockFormValue {
    return {
        ir: "",
        nom_point: "",
        nom_value_mmscfh: "",
        gas_command: "",
        gas_more: "",
        shipper: [],
        fileUrl: "",
        persistedFileUrl: "",
        fileName: "Maximum File 10 MB",
        serverId: null,
        defaultShipperIds: [],
    };
}

export function mergeShipperIds(selected: number[], defaults: number[]): number[] {
    return Array.from(new Set([...(selected ?? []), ...(defaults ?? [])]));
}

/** Drop rows with no shipper (matches legacy `filter((g) => g.shipper.length > 0)`). */
export function filterGasShipperRowsWithShippers(rows: Doc6GasShipperApiRow[]): Doc6GasShipperApiRow[] {
    return (rows ?? []).filter((g) => (g.shipper?.length ?? 0) > 0);
}

function buildFileArray(newFileUrl: string): string[] {
    if (newFileUrl && String(newFileUrl).trim() !== "") {
        return [String(newFileUrl)];
    }
    return [];
}

/** Create payload: include row only when permLod && shipperGate (legacy). */
export function buildGasShipperRowsForCreate(blocks: ReadonlyArray<Doc6LegacyBlockInput>): Doc6GasShipperApiRow[] {
    return blocks
        .filter((b) => !!b.permLod && b.shipperGate)
        .map((b) => ({
            id: null,
            ir: b.permLod ? parseInt(String(b.permLod), 10) : null,
            nom_point: b.nomPoint,
            nom_value_mmscfh: b.nomValueMmscfh ?? "",
            gas_command: b.gasCommand ?? "",
            gas_more: b.gasMore ?? "",
            shipper: mergeShipperIds(b.selectedShipperIds, b.defaultShipperIds),
            file: buildFileArray(b.newFileUrl),
        }));
}

/** Edit payload: include row when permLod is set (legacy TSO edit path). */
export function buildGasShipperRowsForTsoEdit(blocks: ReadonlyArray<Doc6LegacyBlockInput>): Doc6GasShipperApiRow[] {
    return blocks
        .filter((b) => !!b.permLod)
        .map((b) => ({
            id: b.serverId,
            ir: b.permLod ? parseInt(String(b.permLod), 10) : null,
            nom_point: b.nomPoint,
            nom_value_mmscfh: b.nomValueMmscfh ?? "",
            gas_command: b.gasCommand ?? "",
            gas_more: b.gasMore ?? "",
            shipper: mergeShipperIds(b.selectedShipperIds, b.defaultShipperIds),
            file: buildFileArray(b.newFileUrl),
        }));
}

/** Map `useFieldArray` rows (extra blocks beyond the legacy 1–5 fields) into legacy block inputs. */
export function doc6ExtraFormRowsToLegacyInputs(
    rows: ReadonlyArray<Doc6ExtraBlockFormValue>,
): Doc6LegacyBlockInput[] {
    return (rows ?? []).map((r) => {
        const stored = Array.isArray(r?.shipper) ? (r.shipper as number[]) : [];
        const defaults = Array.isArray(r?.defaultShipperIds) ? (r.defaultShipperIds as number[]) : [];
        const selectedOnly = stored.filter((id) => !defaults.includes(id));
        return {
            permLod: r?.ir,
            shipperGate: !!(r?.ir && mergeShipperIds(selectedOnly, defaults).length > 0),
            nomPoint: r?.nom_point,
            nomValueMmscfh: r?.nom_value_mmscfh != null ? String(r.nom_value_mmscfh) : "",
            gasCommand: r?.gas_command != null ? String(r.gas_command) : "",
            gasMore: r?.gas_more != null ? String(r.gas_more) : "",
            selectedShipperIds: selectedOnly,
            defaultShipperIds: defaults,
            newFileUrl: r?.fileUrl != null ? String(r.fileUrl) : "",
            serverId: r?.serverId != null && r.serverId !== "" ? (Number(r.serverId) as number) : null,
        };
    });
}

/**
 * `gas_shipper` on **TSO create** (`POST …/emer/doc6`).
 * When `tsoNominationCreateOnly` is true (TSO + create document flow), only dynamic rows are sent.
 * Otherwise: legacy blocks 1–5 + extras — same as historical `[...create(legacy), ...create(extra)]`.
 */
export function assembleDoc6CreateGasShipper(params: {
    tsoNominationCreateOnly: boolean;
    legacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>;
    extraLegacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>;
}): Doc6GasShipperApiRow[] {
    const { tsoNominationCreateOnly, legacyBlocks, extraLegacyBlocks } = params;
    if (tsoNominationCreateOnly) {
        return buildGasShipperRowsForCreate(extraLegacyBlocks);
    }
    return [
        ...buildGasShipperRowsForCreate(legacyBlocks),
        ...buildGasShipperRowsForCreate(extraLegacyBlocks),
    ];
}

/**
 * `gas_shipper` on **TSO edit** (`POST …/emer/doc6/edit/:id`).
 * Same ordering as `formDocument6`: legacy rows then extra rows.
 */
export function assembleDoc6TsoEditGasShipper(params: {
    legacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>;
    extraLegacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>;
}): Doc6GasShipperApiRow[] {
    return [
        ...buildGasShipperRowsForTsoEdit(params.legacyBlocks),
        ...buildGasShipperRowsForTsoEdit(params.extraLegacyBlocks),
    ];
}
