import {
    assembleDoc6CreateGasShipper,
    assembleDoc6TsoEditGasShipper,
    buildGasShipperRowsForCreate,
    buildGasShipperRowsForTsoEdit,
    doc6ExtraFormRowsToLegacyInputs,
    emptyDoc6ExtraBlock,
    type Doc6LegacyBlockInput,
} from "./doc6GasShipper";

/** Reference: pre-refactor `formDocument6` create used two spreads of `buildGasShipperRowsForCreate`. */
function legacyCreateGasShipperReference(
    legacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>,
    extraLegacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>,
) {
    return [
        ...buildGasShipperRowsForCreate(legacyBlocks),
        ...buildGasShipperRowsForCreate(extraLegacyBlocks),
    ];
}

function legacyTsoEditGasShipperReference(
    legacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>,
    extraLegacyBlocks: ReadonlyArray<Doc6LegacyBlockInput>,
) {
    return [
        ...buildGasShipperRowsForTsoEdit(legacyBlocks),
        ...buildGasShipperRowsForTsoEdit(extraLegacyBlocks),
    ];
}

const filledLegacyBlock: Doc6LegacyBlockInput = {
    permLod: "1",
    shipperGate: true,
    nomPoint: 200,
    nomValueMmscfh: "100.000000",
    gasCommand: "cmd",
    gasMore: "more",
    selectedShipperIds: [10, 11],
    defaultShipperIds: [],
    newFileUrl: "https://new.example/a.pdf",
    serverId: null,
};

const emptyLegacyBlock: Doc6LegacyBlockInput = {
    permLod: "",
    shipperGate: false,
    nomPoint: null,
    nomValueMmscfh: "",
    gasCommand: "",
    gasMore: "",
    selectedShipperIds: [],
    defaultShipperIds: [],
    newFileUrl: "",
    serverId: null,
};

describe("doc6GasShipper — submit assembly (no regression vs legacy concat)", () => {
    test("create (non–TSO-only): assembleDoc6CreateGasShipper === legacy two-spread concat", () => {
        const legacyBlocks = [filledLegacyBlock, emptyLegacyBlock, emptyLegacyBlock, emptyLegacyBlock, emptyLegacyBlock];
        const extraLegacyBlocks = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "2",
                nom_point: 201,
                nom_value_mmscfh: "2",
                shipper: [20],
                fileUrl: "",
            },
        ]);
        const expected = legacyCreateGasShipperReference(legacyBlocks, extraLegacyBlocks);
        const actual = assembleDoc6CreateGasShipper({
            tsoNominationCreateOnly: false,
            legacyBlocks,
            extraLegacyBlocks,
        });
        expect(actual).toEqual(expected);
    });

    test("create (non–TSO-only): empty extra blocks same as legacy-only submit", () => {
        const legacyBlocks = [filledLegacyBlock];
        const extraLegacyBlocks: Doc6LegacyBlockInput[] = [];
        expect(
            assembleDoc6CreateGasShipper({
                tsoNominationCreateOnly: false,
                legacyBlocks,
                extraLegacyBlocks,
            }),
        ).toEqual(legacyCreateGasShipperReference(legacyBlocks, extraLegacyBlocks));
    });

    test("create (TSO nomination only): only extra rows, legacy ignored", () => {
        const legacyBlocks = [filledLegacyBlock];
        const extraLegacyBlocks = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "1",
                nom_point: 99,
                shipper: [1],
            },
        ]);
        const actual = assembleDoc6CreateGasShipper({
            tsoNominationCreateOnly: true,
            legacyBlocks,
            extraLegacyBlocks,
        });
        expect(actual).toEqual(buildGasShipperRowsForCreate(extraLegacyBlocks));
        expect(actual).not.toEqual(legacyCreateGasShipperReference(legacyBlocks, extraLegacyBlocks));
    });

    test("TSO edit: assembleDoc6TsoEditGasShipper === legacy two-spread concat", () => {
        const legacyBlocks: Doc6LegacyBlockInput[] = [
            {
                permLod: "1",
                shipperGate: true,
                nomPoint: 300,
                nomValueMmscfh: "1.000000",
                gasCommand: "a",
                gasMore: "b",
                selectedShipperIds: [5],
                defaultShipperIds: [6],
                newFileUrl: "",
                serverId: 101,
            },
        ];
        const extraLegacyBlocks = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "2",
                nom_point: 301,
                shipper: [7],
                fileUrl: "https://up/new",
                serverId: 202,
            },
        ]);
        expect(
            assembleDoc6TsoEditGasShipper({
                legacyBlocks,
                extraLegacyBlocks,
            }),
        ).toEqual(legacyTsoEditGasShipperReference(legacyBlocks, extraLegacyBlocks));
    });

    test("TSO edit: empty extras same as legacy-only", () => {
        const legacyBlocks = [filledLegacyBlock];
        const extraLegacyBlocks: Doc6LegacyBlockInput[] = [];
        expect(assembleDoc6TsoEditGasShipper({ legacyBlocks, extraLegacyBlocks })).toEqual(
            legacyTsoEditGasShipperReference(legacyBlocks, extraLegacyBlocks),
        );
    });
});

describe("doc6GasShipper — row mapping / file contract", () => {
    test("create: extra row maps file only from fileUrl (new upload)", () => {
        const rows = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "1",
                nom_point: 206,
                nom_value_mmscfh: "1.5",
                shipper: [62],
                fileUrl: "https://cdn.example/new.pdf",
                persistedFileUrl: "",
            },
        ]);
        const api = buildGasShipperRowsForCreate(rows);
        expect(api).toHaveLength(1);
        expect(api[0].file).toEqual(["https://cdn.example/new.pdf"]);
        expect(api[0].shipper).toContain(62);
    });

    test("TSO edit: persisted server file must not populate API file[] (only new fileUrl)", () => {
        const rows = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "1",
                nom_point: 206,
                shipper: [62],
                fileUrl: "",
                persistedFileUrl: "https://storage.example/old.pdf",
            },
        ]);
        const api = buildGasShipperRowsForTsoEdit(rows);
        expect(api[0].file).toEqual([]);
    });

    test("TSO edit: new upload replaces empty file[] with single URL", () => {
        const rows = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "2",
                nom_point: 207,
                shipper: [63],
                fileUrl: "https://cdn.example/replace.docx",
                persistedFileUrl: "https://storage.example/old.pdf",
            },
        ]);
        const api = buildGasShipperRowsForTsoEdit(rows);
        expect(api[0].file).toEqual(["https://cdn.example/replace.docx"]);
    });

    test("create: empty extra row (no ir / no shipper) is omitted from gas_shipper", () => {
        const api = buildGasShipperRowsForCreate(doc6ExtraFormRowsToLegacyInputs([emptyDoc6ExtraBlock()]));
        expect(api).toHaveLength(0);
    });

    test("stacked payload: legacy-like create still matches concat semantics", () => {
        const legacyLike: Doc6LegacyBlockInput = {
            permLod: "1",
            shipperGate: true,
            nomPoint: 100,
            nomValueMmscfh: "10.000000",
            gasCommand: "c",
            gasMore: "m",
            selectedShipperIds: [1],
            defaultShipperIds: [],
            newFileUrl: "",
            serverId: null,
        };
        const extra = doc6ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc6ExtraBlock(),
                ir: "2",
                nom_point: 101,
                shipper: [2],
                fileUrl: "https://x/u",
            },
        ]);
        const combined = [...buildGasShipperRowsForCreate([legacyLike]), ...buildGasShipperRowsForCreate(extra)];
        expect(combined).toHaveLength(2);
        expect(combined[1].file).toEqual(["https://x/u"]);
    });
});

describe("doc6GasShipper — delete/reindex behavior (no stale rows after remove)", () => {
    /** Simulates three extra rows where the user deletes the middle one (index 1).
     *  The remaining rows [0, 2] should map to exactly 2 API rows in the original order. */
    test("TSO edit: removing middle extra row produces correct count and order", () => {
        const allThree = [
            { ...emptyDoc6ExtraBlock(), ir: "1", nom_point: 10, nom_value_mmscfh: "0.000000", gas_command: "สั่งการ A", gas_more: "เพิ่มเติม A", shipper: [60], serverId: 301 },
            { ...emptyDoc6ExtraBlock(), ir: "2", nom_point: 11, nom_value_mmscfh: "1.500000", gas_command: "สั่งการ B", gas_more: "เพิ่มเติม B", shipper: [61], serverId: 302 },
            { ...emptyDoc6ExtraBlock(), ir: "1", nom_point: 12, nom_value_mmscfh: "2.000000", gas_command: "สั่งการ C", gas_more: "เพิ่มเติม C", shipper: [62], serverId: 303 },
        ];

        // Simulate field-array remove(1) — watch() would return remaining rows reindexed
        const afterDelete = [allThree[0], allThree[2]];

        const rows = doc6ExtraFormRowsToLegacyInputs(afterDelete);
        const api = buildGasShipperRowsForTsoEdit(rows);

        expect(api).toHaveLength(2);
        expect(api[0].ir).toBe(1);
        expect(api[0].id).toBe(301);
        expect(api[0].nom_value_mmscfh).toBe("0.000000");
        expect(api[0].gas_command).toBe("สั่งการ A");
        expect(api[0].gas_more).toBe("เพิ่มเติม A");
        expect(api[1].ir).toBe(1);
        expect(api[1].id).toBe(303);
        expect(api[1].nom_value_mmscfh).toBe("2.000000");
        expect(api[1].gas_command).toBe("สั่งการ C");
        expect(api[1].gas_more).toBe("เพิ่มเติม C");
    });

    test("TSO edit: removing first extra row leaves remaining rows with correct ids", () => {
        const rows3 = [
            { ...emptyDoc6ExtraBlock(), ir: "1", nom_point: 20, nom_value_mmscfh: "1.000000", gas_command: "cmd1", gas_more: "more1", shipper: [70], serverId: 401 },
            { ...emptyDoc6ExtraBlock(), ir: "2", nom_point: 21, nom_value_mmscfh: "2.000000", gas_command: "cmd2", gas_more: "more2", shipper: [71], serverId: 402 },
            { ...emptyDoc6ExtraBlock(), ir: "1", nom_point: 22, nom_value_mmscfh: "3.000000", gas_command: "cmd3", gas_more: "more3", shipper: [72], serverId: 403 },
        ];

        // Simulate field-array remove(0)
        const afterDelete = [rows3[1], rows3[2]];
        const api = buildGasShipperRowsForTsoEdit(doc6ExtraFormRowsToLegacyInputs(afterDelete));

        expect(api).toHaveLength(2);
        expect(api[0].id).toBe(402);
        expect(api[0].nom_value_mmscfh).toBe("2.000000");
        expect(api[0].gas_command).toBe("cmd2");
        expect(api[0].gas_more).toBe("more2");
        expect(api[1].id).toBe(403);
        expect(api[1].nom_value_mmscfh).toBe("3.000000");
        expect(api[1].gas_command).toBe("cmd3");
        expect(api[1].gas_more).toBe("more3");
    });

    test("TSO edit: deleting all extra rows sends empty extras (legacy rows remain unaffected)", () => {
        const legacyBlocks: Doc6LegacyBlockInput[] = [
            {
                permLod: "1",
                shipperGate: true,
                nomPoint: 17,
                nomValueMmscfh: "0.000000",
                gasCommand: "-",
                gasMore: "-",
                selectedShipperIds: [62],
                defaultShipperIds: [],
                newFileUrl: "",
                serverId: 10,
            },
        ];

        // All extras deleted → doc6_extra_blocks watch() returns []
        const api = assembleDoc6TsoEditGasShipper({
            legacyBlocks,
            extraLegacyBlocks: [],
        });

        expect(api).toHaveLength(1);
        expect(api[0].id).toBe(10);
        expect(api[0].nom_value_mmscfh).toBe("0.000000");
        expect(api[0].gas_command).toBe("-");
        expect(api[0].gas_more).toBe("-");
        expect(api[0].shipper).toContain(62);
    });

    test("create (TSO-only): removing middle row → remaining rows are reindexed correctly", () => {
        const rows = [
            { ...emptyDoc6ExtraBlock(), ir: "1", nom_point: 30, nom_value_mmscfh: "0.000000", gas_command: "A", gas_more: "mA", shipper: [80] },
            { ...emptyDoc6ExtraBlock(), ir: "2", nom_point: 31, nom_value_mmscfh: "0.000000", gas_command: "B", gas_more: "mB", shipper: [81] },
            { ...emptyDoc6ExtraBlock(), ir: "1", nom_point: 32, nom_value_mmscfh: "0.000000", gas_command: "C", gas_more: "mC", shipper: [82] },
        ];

        // Simulate remove(1)
        const afterDelete = [rows[0], rows[2]];
        const extra = doc6ExtraFormRowsToLegacyInputs(afterDelete);
        const api = assembleDoc6CreateGasShipper({
            tsoNominationCreateOnly: true,
            legacyBlocks: [],
            extraLegacyBlocks: extra,
        });

        expect(api).toHaveLength(2);
        expect(api[0].shipper).toContain(80);
        expect(api[0].nom_value_mmscfh).toBe("0.000000");
        expect(api[0].gas_command).toBe("A");
        expect(api[0].gas_more).toBe("mA");
        expect(api[1].shipper).toContain(82);
        expect(api[1].nom_value_mmscfh).toBe("0.000000");
        expect(api[1].gas_command).toBe("C");
        expect(api[1].gas_more).toBe("mC");
    });
});
