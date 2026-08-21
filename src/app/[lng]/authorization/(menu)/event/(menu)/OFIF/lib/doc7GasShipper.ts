/**
 * Local copy of `formatNumberSixDecimalNoComma` to keep Jest unit tests light.
 * Importing `@/utils/generalFormatter` pulls in heavy deps (e.g. exceljs ESM),
 * which breaks Jest parsing in this repo.
 */
function formatNumberSixDecimalNoComma(number: any): any {
    if (isNaN(number)) return number;
    // Convert to fixed 6 decimal places without thousands separators.
    const fixedNumber = parseFloat(number).toFixed(6);
    return fixedNumber;
}

/**
 * Doc7 — contract helpers for `gas_shipper[]` payload sent to `/master/event/ofo/doc7`.
 *
 * Goal: make mapping deterministic so UI state can change without breaking API contract:
 * - Create omission gate: `doc_7_perm_lod_n && shipper_id_n` (JS truthiness).
 * - Edit omission gate: `doc_7_perm_lod_n` only.
 * - Edit file[] semantics: use `newFileUrl` only (persistedFileUrl must never populate `file[]`).
 */

export type Doc7GasShipperApiRow = {
    id: number | null;
    ir: number | null;
    io: number | null;
    area: unknown;
    nom_point: unknown;
    nom_value_mmscfh: string;
    gas_command: unknown;
    gas_more: unknown;
    shipper: Array<number | string>;
    file: string[];
};

export type Doc7LegacyBlockInput = {
    // Mirrors `doc_7_perm_lod_n`
    permLod: unknown;
    // Mirrors `shipper_id_n` (legacy create omission gate uses JS truthiness on this raw value)
    shipperIdValue: unknown;

    // Mirrors legacy gas block fields
    io: unknown;
    area: unknown;
    nomPoint: unknown;
    nomValueMmscfh: unknown;
    gasCommand: unknown;
    gasMore: unknown;

    selectedShipperIds: Array<number | string>;
    defaultShipperIds: Array<number | string>;

    // New upload URL (submit payload uses this for file[])
    newFileUrl: string;

    // Server row id (used only when `generate === true` in TSO edit payload)
    serverId: number | null;
};

export type Doc7ExtraBlockFormValue = {
    ir?: unknown;
    io?: unknown;
    area?: unknown;
    nom_point?: unknown;
    nom_value_mmscfh?: unknown;
    gas_command?: unknown;
    gas_more?: unknown;

    /**
     * Stored shipper selection from the dynamic UI row.
     * Can include both default+selected; we split using `defaultShipperIds`.
     */
    shipper?: Array<number | string>;
    defaultShipperIds?: Array<number | string>;

    /**
     * Raw value used for legacy omission gate `shipper_id_n` (JS truthiness).
     * If not provided, we derive it as "selectedOnly" (shipper ids excluding defaults).
     */
    shipperIdValue?: unknown;

    // New upload file URL for submit; empty string means "no upload"
    fileUrl?: unknown;
    // Existing server file URL for download/view only (must not be mapped to submit file[])
    persistedFileUrl?: unknown;
    fileName?: unknown;
    serverId?: unknown;
};

export function emptyDoc7ExtraBlock(): Doc7ExtraBlockFormValue {
    return {
        ir: "",
        io: "",
        area: "",
        nom_point: "",
        nom_value_mmscfh: "",
        gas_command: "",
        gas_more: "",
        shipper: [],
        defaultShipperIds: [],
        shipperIdValue: null,
        fileUrl: "",
        persistedFileUrl: "",
        fileName: "Maximum File 10 MB",
        serverId: null,
    };
}

export function mergeShipperIds(
    selected: ReadonlyArray<number | string>,
    defaults: ReadonlyArray<number | string>,
): Array<number | string> {
    return Array.from(new Set([...(selected ?? []), ...(defaults ?? [])]));
}

function buildFileArray(newFileUrl: string): string[] {
    return newFileUrl !== "" ? [String(newFileUrl)] : [];
}

/**
 * Map `useFieldArray` rows (extra blocks beyond legacy 1–5) into legacy block inputs.
 * This is the only place we interpret `persistedFileUrl` (it is never mapped to submit `file[]`).
 */
export function doc7ExtraFormRowsToLegacyInputs(
    rows: ReadonlyArray<Doc7ExtraBlockFormValue>,
): Doc7LegacyBlockInput[] {
    return (rows ?? []).map((r) => {
        const stored = Array.isArray(r?.shipper) ? (r.shipper as Array<number | string>) : [];
        const defaults = Array.isArray(r?.defaultShipperIds)
            ? (r.defaultShipperIds as Array<number | string>)
            : [];

        const selectedOnly = stored.filter((id) => !defaults.includes(id));

        return {
            permLod: r?.ir,
            shipperIdValue: r?.shipperIdValue !== undefined ? r.shipperIdValue : selectedOnly,
            io: r?.io,
            area: r?.area,
            nomPoint: r?.nom_point,
            nomValueMmscfh: r?.nom_value_mmscfh,
            gasCommand: r?.gas_command,
            gasMore: r?.gas_more,
            selectedShipperIds: selectedOnly,
            defaultShipperIds: defaults,
            newFileUrl: r?.fileUrl != null ? String(r.fileUrl) : "",
            serverId: r?.serverId != null && r.serverId !== "" ? (Number(r.serverId) as number) : null,
        };
    });
}

/** Create payload `gas_shipper[]` rows (TSO + other) */
export function buildGasShipperRowsForCreate(
    blocks: ReadonlyArray<Doc7LegacyBlockInput>,
): Doc7GasShipperApiRow[] {
    return (blocks ?? [])
        .filter((b) => !!b.permLod && b.shipperIdValue)
        .map((b) => ({
            id: null,
            ir: b.permLod ? parseInt(String(b.permLod), 10) : null,
            io: b.io ? parseInt(String(b.io), 10) : null,
            area: b.area,
            nom_point: b.nomPoint,
            nom_value_mmscfh: b.nomValueMmscfh ? formatNumberSixDecimalNoComma(b.nomValueMmscfh) : "",
            gas_command: b.gasCommand,
            gas_more: b.gasMore,
            shipper: mergeShipperIds(b.selectedShipperIds, b.defaultShipperIds),
            file: buildFileArray(b.newFileUrl),
        }));
}

/** TSO edit payload `gas_shipper[]` rows */
export function buildGasShipperRowsForTsoEdit(params: {
    blocks: ReadonlyArray<Doc7LegacyBlockInput>;
    generate: boolean;
}): Doc7GasShipperApiRow[] {
    const { blocks, generate } = params;

    return (blocks ?? [])
        .filter((b) => !!b.permLod)
        .map((b) => ({
            id: generate ? b.serverId : null,
            ir: b.permLod ? parseInt(String(b.permLod), 10) : null,
            io: b.io ? parseInt(String(b.io), 10) : null,
            area: b.area,
            nom_point: b.nomPoint,
            nom_value_mmscfh: b.nomValueMmscfh ? formatNumberSixDecimalNoComma(b.nomValueMmscfh) : "",
            gas_command: b.gasCommand,
            gas_more: b.gasMore,
            shipper: mergeShipperIds(b.selectedShipperIds, b.defaultShipperIds),
            file: buildFileArray(b.newFileUrl),
        }));
}

/**
 * `gas_shipper` on TSO create (`POST /master/event/ofo/doc7`).
 *
 * If UI uses dynamic blocks as the primary source of rows, set `tsoNominationCreateOnly=true`
 * to ignore legacy 1–5 blocks (like Doc6 pattern).
 */
export function assembleDoc7CreateGasShipper(params: {
    tsoNominationCreateOnly: boolean;
    legacyBlocks: ReadonlyArray<Doc7LegacyBlockInput>;
    extraLegacyBlocks: ReadonlyArray<Doc7LegacyBlockInput>;
}): Doc7GasShipperApiRow[] {
    const { tsoNominationCreateOnly, legacyBlocks, extraLegacyBlocks } = params;

    if (tsoNominationCreateOnly) {
        return buildGasShipperRowsForCreate(extraLegacyBlocks);
    }

    return [...buildGasShipperRowsForCreate(legacyBlocks), ...buildGasShipperRowsForCreate(extraLegacyBlocks)];
}

/**
 * `gas_shipper` on TSO edit (`POST /master/event/ofo/doc7`).
 * Ordering: legacy 1–5 rows first, then extra rows.
 */
export function assembleDoc7TsoEditGasShipper(params: {
    generate: boolean;
    legacyBlocks: ReadonlyArray<Doc7LegacyBlockInput>;
    extraLegacyBlocks: ReadonlyArray<Doc7LegacyBlockInput>;
}): Doc7GasShipperApiRow[] {
    const { generate, legacyBlocks, extraLegacyBlocks } = params;
    return [
        ...buildGasShipperRowsForTsoEdit({ blocks: legacyBlocks, generate }),
        ...buildGasShipperRowsForTsoEdit({ blocks: extraLegacyBlocks, generate }),
    ];
}

