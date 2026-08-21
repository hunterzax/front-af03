import {
    assembleDoc7CreateGasShipper,
    assembleDoc7TsoEditGasShipper,
    buildGasShipperRowsForCreate,
    buildGasShipperRowsForTsoEdit,
    doc7ExtraFormRowsToLegacyInputs,
    emptyDoc7ExtraBlock,
    type Doc7ExtraBlockFormValue,
    type Doc7LegacyBlockInput,
} from "./doc7GasShipper";

function legacyCreateGasShipperReference(
    legacyBlocks: ReadonlyArray<Doc7LegacyBlockInput>,
    extraLegacyBlocks: ReadonlyArray<Doc7LegacyBlockInput>,
) {
    return [...buildGasShipperRowsForCreate(legacyBlocks), ...buildGasShipperRowsForCreate(extraLegacyBlocks)];
}

describe("doc7GasShipper — submit assembly (no regression vs legacy concat)", () => {
    const filledLegacyBlock: Doc7LegacyBlockInput = {
        permLod: "1",
        shipperIdValue: [100],
        io: "3",
        area: "AREA-1",
        nomPoint: 200,
        nomValueMmscfh: "100.000000",
        gasCommand: "cmd",
        gasMore: "more",
        selectedShipperIds: [10, 11],
        defaultShipperIds: [12],
        newFileUrl: "https://new.example/a.pdf",
        serverId: 123,
    };

    const emptyLegacyBlock: Doc7LegacyBlockInput = {
        permLod: "",
        shipperIdValue: null,
        io: "",
        area: "",
        nomPoint: null,
        nomValueMmscfh: "",
        gasCommand: "",
        gasMore: "",
        selectedShipperIds: [],
        defaultShipperIds: [],
        newFileUrl: "",
        serverId: null,
    };

    test("create (non–TSO-only): assembleDoc7CreateGasShipper === legacy concat semantics", () => {
        const legacyBlocks = [filledLegacyBlock, emptyLegacyBlock, emptyLegacyBlock, emptyLegacyBlock, emptyLegacyBlock];

        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc7ExtraBlock(),
                ir: "2",
                io: "4",
                area: "AREA-2",
                nom_point: 201,
                nom_value_mmscfh: "2",
                shipper: [20],
                defaultShipperIds: [21],
                fileUrl: "https://cdn.example/new.pdf",
                persistedFileUrl: "",
                gas_command: "gcmd",
                gas_more: "gmore",
                serverId: null,
            } satisfies Doc7ExtraBlockFormValue,
        ]);

        const expected = legacyCreateGasShipperReference(legacyBlocks, extraLegacyBlocks);
        const actual = assembleDoc7CreateGasShipper({
            tsoNominationCreateOnly: false,
            legacyBlocks,
            extraLegacyBlocks,
        });

        expect(actual).toEqual(expected);
    });

    test("create omission gate: permLod && shipperIdValue (falsy shipperIdValue => omitted)", () => {
        const omittedBlock: Doc7LegacyBlockInput = {
            permLod: "1",
            shipperIdValue: null,
            io: "3",
            area: "AREA-1",
            nomPoint: 200,
            nomValueMmscfh: "1.5",
            gasCommand: "cmd",
            gasMore: "more",
            selectedShipperIds: [],
            defaultShipperIds: [12],
            newFileUrl: "",
            serverId: null,
        };

        expect(buildGasShipperRowsForCreate([omittedBlock])).toEqual([]);
    });

    test("create omission gate: empty shipperIdValue array can still pass JS truthiness", () => {
        // In legacy: `watch('shipper_id_n')` could be `[]` (truthy) => row included.
        const includedBlock: Doc7LegacyBlockInput = {
            permLod: "1",
            shipperIdValue: [], // JS truthiness: [] is truthy
            io: "3",
            area: "AREA-1",
            nomPoint: 200,
            nomValueMmscfh: "0.1",
            gasCommand: "cmd",
            gasMore: "more",
            selectedShipperIds: [],
            defaultShipperIds: [12],
            newFileUrl: "",
            serverId: null,
        };

        const rows = buildGasShipperRowsForCreate([includedBlock]);
        expect(rows).toHaveLength(1);
        expect(rows[0].shipper).toEqual([12]);
        expect(rows[0].file).toEqual([]);
        expect(rows[0].nom_value_mmscfh).toEqual("0.100000");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Regression suite against the real baseline payload captured in resultDoc7.json
// ─────────────────────────────────────────────────────────────────────────────
describe("doc7GasShipper — resultDoc7.json baseline regression", () => {
    /**
     * resultDoc7.json gas_shipper rows recreated as UI form inputs:
     *  Row A: ir=1 (เพิ่ม), io=3 (จุดส่งเข้า), area=1, nom_point=18, nom_value=1, gas_command="เพิ่ม L ", gas_more="---", shipper=[62], file=[]
     *  Row B: ir=2 (ลด),   io=3 (จุดส่งเข้า), area=1, nom_point=18, nom_value=2, gas_command="ลด LM",   gas_more="--",  shipper=[67], file=[]
     */
    const rowA: Doc7ExtraBlockFormValue = {
        ir: "1",
        io: "3",
        area: 1,
        nom_point: 18,
        nom_value_mmscfh: "1",
        gas_command: "เพิ่ม L ",
        gas_more: "---",
        shipper: [62],
        defaultShipperIds: [],
        shipperIdValue: [62],
        fileUrl: "",
        persistedFileUrl: "",
        fileName: "Maximum File 10 MB",
        serverId: null,
    };

    const rowB: Doc7ExtraBlockFormValue = {
        ir: "2",
        io: "3",
        area: 1,
        nom_point: 18,
        nom_value_mmscfh: "2",
        gas_command: "ลด LM",
        gas_more: "--",
        shipper: [67],
        defaultShipperIds: [],
        shipperIdValue: [67],
        fileUrl: "",
        persistedFileUrl: "",
        fileName: "Maximum File 10 MB",
        serverId: null,
    };

    const expectedGasShipper = [
        {
            id: null,
            ir: 1,
            io: 3,
            area: 1,
            nom_point: 18,
            nom_value_mmscfh: "1.000000",
            gas_command: "เพิ่ม L ",
            gas_more: "---",
            shipper: [62],
            file: [],
        },
        {
            id: null,
            ir: 2,
            io: 3,
            area: 1,
            nom_point: 18,
            nom_value_mmscfh: "2.000000",
            gas_command: "ลด LM",
            gas_more: "--",
            shipper: [67],
            file: [],
        },
    ];

    test("two filled rows produce exact gas_shipper[] matching resultDoc7.json", () => {
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([rowA, rowB]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result).toEqual(expectedGasShipper);
    });

    test("delete first row → only second row remains (no stale row from deleted index)", () => {
        // Simulate user having 2 rows then deleting rowA — only rowB survives
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([rowB]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(expectedGasShipper[1]);
    });

    test("delete second row → only first row remains", () => {
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([rowA]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(expectedGasShipper[0]);
    });

    test("empty row (no ir/shipper) is omitted from create payload", () => {
        // When a user clicks เพิ่มชุด but does not fill anything → must not appear in gas_shipper[]
        const emptyExtra: Doc7ExtraBlockFormValue = {
            ...rowA,
            ir: "",
            shipperIdValue: null,
            shipper: [],
        };
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([emptyExtra]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result).toHaveLength(0);
    });

    test("nom_value_mmscfh is formatted to 6 decimal places (string)", () => {
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([rowA]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result[0].nom_value_mmscfh).toBe("1.000000");
    });

    test("persistedFileUrl is NOT included in file[] for create", () => {
        const rowWithPersisted: Doc7ExtraBlockFormValue = {
            ...rowA,
            fileUrl: "",
            persistedFileUrl: "https://storage.example/old.pdf",
        };
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([rowWithPersisted]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result[0].file).toEqual([]);
    });

    test("new fileUrl is included in file[] for create", () => {
        const rowWithNewFile: Doc7ExtraBlockFormValue = {
            ...rowA,
            fileUrl: "https://cdn.example/upload.pdf",
            persistedFileUrl: "",
        };
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([rowWithNewFile]);
        const result = buildGasShipperRowsForCreate(extraLegacyBlocks);
        expect(result[0].file).toEqual(["https://cdn.example/upload.pdf"]);
    });
});

describe("doc7GasShipper — row mapping / file & id contract", () => {
    test("TSO edit file[] semantics: persistedFileUrl must not populate API file[]", () => {
        const extraRows = doc7ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc7ExtraBlock(),
                ir: "1",
                io: "3",
                area: "AREA-1",
                nom_point: 200,
                nom_value_mmscfh: "1.5",
                shipper: [62],
                defaultShipperIds: [],
                fileUrl: "", // no new upload
                persistedFileUrl: "https://storage.example/old.pdf", // must not be mapped to submit payload
                gas_command: "a",
                gas_more: "b",
                serverId: 202,
            } satisfies Doc7ExtraBlockFormValue,
        ]);

        const api = buildGasShipperRowsForTsoEdit({ blocks: extraRows, generate: true });
        expect(api).toHaveLength(1);
        expect(api[0].file).toEqual([]);
    });

    test("TSO edit id mapping: generate=true => id=serverId, generate=false => id=null", () => {
        const block: Doc7LegacyBlockInput = {
            permLod: "2",
            shipperIdValue: "any",
            io: "4",
            area: "AREA-X",
            nomPoint: 300,
            nomValueMmscfh: "2",
            gasCommand: "g1",
            gasMore: "g2",
            selectedShipperIds: [5],
            defaultShipperIds: [],
            newFileUrl: "https://cdn.example/replace.pdf",
            serverId: 999,
        };

        const apiGenerateTrue = buildGasShipperRowsForTsoEdit({ blocks: [block], generate: true });
        expect(apiGenerateTrue[0].id).toBe(999);

        const apiGenerateFalse = buildGasShipperRowsForTsoEdit({ blocks: [block], generate: false });
        expect(apiGenerateFalse[0].id).toBeNull();
    });

    test("stacked payload: assembleDoc7TsoEditGasShipper concatenates legacy rows then extra rows", () => {
        const legacyBlock: Doc7LegacyBlockInput = {
            permLod: "1",
            shipperIdValue: true,
            io: "3",
            area: "AREA-L",
            nomPoint: 111,
            nomValueMmscfh: "1.5",
            gasCommand: "cmd",
            gasMore: "more",
            selectedShipperIds: [1],
            defaultShipperIds: [2],
            newFileUrl: "",
            serverId: 10,
        };

        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs([
            {
                ...emptyDoc7ExtraBlock(),
                ir: "2",
                io: "4",
                area: "AREA-E",
                nom_point: 222,
                nom_value_mmscfh: "3",
                shipper: [7],
                defaultShipperIds: [],
                fileUrl: "",
                persistedFileUrl: "",
                gas_command: "ecmd",
                gas_more: "emore",
                serverId: 20,
            } satisfies Doc7ExtraBlockFormValue,
        ]);

        const api = assembleDoc7TsoEditGasShipper({
            generate: true,
            legacyBlocks: [legacyBlock],
            extraLegacyBlocks,
        });

        expect(api).toHaveLength(2);
        expect(api[0].area).toBe("AREA-L");
        expect(api[1].area).toBe("AREA-E");
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Full payload regression — simulates formDocument7.tsx handleSaveConfirm (create)
// and asserts the entire JSON matches resultDoc7.json field-by-field.
// ─────────────────────────────────────────────────────────────────────────────
describe("doc7GasShipper — FULL payload vs resultDoc7.json", () => {
    /**
     * Mirrors the payload_tso_create assembly in formDocument7.tsx (create mode).
     * All watch() values are hardcoded to match the real submission that produced resultDoc7.json:
     *   - 2 extra dynamic rows (blocks 6-N), no legacy rows (1-5) selected
     *   - Row A: ir=1, io=3, area=1, nom_point=18, nom_value=1, shipper=[62], gas_command="เพิ่ม L ", gas_more="---"
     *   - Row B: ir=2, io=3, area=1, nom_point=18, nom_value=2, shipper=[67], gas_command="ลด LM",   gas_more="--"
     */

    function buildFullPayload() {
        // ── simulate form watch() values ─────────────────────────────────────
        const formValues = {
            generate:                           false,
            id_runnumber:                       null,
            id_documents:                       null,
            longdo_dict:                        "สำเนาบริหารสัญญาระบบท่อส่งก๊าซ (บส.กตต.)",
            event_date:                         "2026-04-29",
            doc_7_input_date_time_of_the_incident: "",
            doc_7_input_detail_incident:        "-",
            doc_7_input_time_event_start_date:  "2026-04-29",
            doc_7_input_time_event_start_time:  "18:30",
            doc_7_input_time_event_end_date:    "2026-04-29",
            doc_7_input_time_event_end_time:    "18:40",
            doc_7_input_note:                   "ทดสอบกรอกข้อมูล 07",
            doc_7_input_ref_1_id:               true,   // checked → sends 1
            doc_7_input_ref_2_id:               false,  // unchecked → null
            event_doc_ofo_type_id:              2,
            event_doc_ofo_gas_tranmiss_id:      "2",    // string from select → parseInt
            event_doc_ofo_gas_tranmiss_other:   null,
            // legacy blocks 1-5: all empty (omitted)
            doc_7_perm_lod_1: "", doc_7_perm_lod_2: "", doc_7_perm_lod_3: "",
            doc_7_perm_lod_4: "", doc_7_perm_lod_5: "",
            shipper_id_1: null, shipper_id_2: null, shipper_id_3: null,
            shipper_id_4: null, shipper_id_5: null,
            // emails
            email_event_for_shipper: [],
            cc_email: [],
        };

        // ── extra dynamic blocks (doc7_extra_blocks) from getValues() ────────
        const extraBlockFormValues: Doc7ExtraBlockFormValue[] = [
            {
                ir: "1",
                io: "3",
                area: 1,
                nom_point: 18,
                nom_value_mmscfh: "1",
                gas_command: "เพิ่ม L ",
                gas_more: "---",
                shipper: [62],
                defaultShipperIds: [],
                shipperIdValue: [62],
                fileUrl: "",
                persistedFileUrl: "",
                fileName: "Maximum File 10 MB",
                serverId: null,
            },
            {
                ir: "2",
                io: "3",
                area: 1,
                nom_point: 18,
                nom_value_mmscfh: "2",
                gas_command: "ลด LM",
                gas_more: "--",
                shipper: [67],
                defaultShipperIds: [],
                shipperIdValue: [67],
                fileUrl: "",
                persistedFileUrl: "",
                fileName: "Maximum File 10 MB",
                serverId: null,
            },
        ];

        // ── replicate formDocument7.tsx handleSaveConfirm (create) ───────────
        const extraLegacyBlocks = doc7ExtraFormRowsToLegacyInputs(extraBlockFormValues);
        const extraGasShippers  = buildGasShipperRowsForCreate(extraLegacyBlocks);

        // legacy blocks 1-5: all gates fail (perm_lod empty) → produce no rows
        const legacyGasShipper: unknown[] = [];

        return {
            generate:                              formValues.generate,
            id_runnumber:                          formValues.id_runnumber,
            id_documents:                          formValues.id_documents,
            longdo_dict:                           formValues.longdo_dict,
            event_date:                            formValues.event_date,
            doc_7_input_date_time_of_the_incident: formValues.doc_7_input_date_time_of_the_incident,
            doc_7_input_detail_incident:           formValues.doc_7_input_detail_incident,
            doc_7_input_time_event_start_date:     formValues.doc_7_input_time_event_start_date,
            doc_7_input_time_event_start_time:     formValues.doc_7_input_time_event_start_time,
            doc_7_input_time_event_end_date:       formValues.doc_7_input_time_event_end_date,
            doc_7_input_time_event_end_time:       formValues.doc_7_input_time_event_end_time,
            doc_7_input_note:                      formValues.doc_7_input_note,
            doc_7_input_ref_1_id:                  formValues.doc_7_input_ref_1_id ? 1 : null,
            doc_7_input_ref_2_id:                  formValues.doc_7_input_ref_2_id ? 2 : null,
            event_doc_ofo_type_id:                 formValues.event_doc_ofo_type_id,
            event_doc_ofo_gas_tranmiss_id:         formValues.event_doc_ofo_gas_tranmiss_id
                                                    ? parseInt(formValues.event_doc_ofo_gas_tranmiss_id as string)
                                                    : null,
            event_doc_ofo_gas_tranmiss_other:      formValues.event_doc_ofo_gas_tranmiss_other ?? null,
            gas_shipper: [
                ...legacyGasShipper,
                ...(extraGasShippers ?? []),
            ],
            email_event_for_shipper:               formValues.email_event_for_shipper,
            cc_email:                              formValues.cc_email,
        };
    }

    // ── expected — mirrors resultDoc7.json exactly ───────────────────────────
    const resultDoc7 = {
        generate:                              false,
        id_runnumber:                          null,
        id_documents:                          null,
        longdo_dict:                           "สำเนาบริหารสัญญาระบบท่อส่งก๊าซ (บส.กตต.)",
        event_date:                            "2026-04-29",
        doc_7_input_date_time_of_the_incident: "",
        doc_7_input_detail_incident:           "-",
        doc_7_input_time_event_start_date:     "2026-04-29",
        doc_7_input_time_event_start_time:     "18:30",
        doc_7_input_time_event_end_date:       "2026-04-29",
        doc_7_input_time_event_end_time:       "18:40",
        doc_7_input_note:                      "ทดสอบกรอกข้อมูล 07",
        doc_7_input_ref_1_id:                  1,
        doc_7_input_ref_2_id:                  null,
        event_doc_ofo_type_id:                 2,
        event_doc_ofo_gas_tranmiss_id:         2,
        event_doc_ofo_gas_tranmiss_other:      null,
        gas_shipper: [
            {
                id: null,
                ir: 1,
                io: 3,
                area: 1,
                nom_point: 18,
                nom_value_mmscfh: "1.000000",
                gas_command: "เพิ่ม L ",
                gas_more: "---",
                shipper: [62],
                file: [],
            },
            {
                id: null,
                ir: 2,
                io: 3,
                area: 1,
                nom_point: 18,
                nom_value_mmscfh: "2.000000",
                gas_command: "ลด LM",
                gas_more: "--",
                shipper: [67],
                file: [],
            },
        ],
        email_event_for_shipper: [],
        cc_email: [],
    };

    test("full payload matches resultDoc7.json — all fields", () => {
        const payload = buildFullPayload();
        expect(payload).toEqual(resultDoc7);
    });

    test("generate is false (new document, not generate flow)", () => {
        expect(buildFullPayload().generate).toBe(false);
    });

    test("id_runnumber and id_documents are null (new document)", () => {
        const payload = buildFullPayload();
        expect(payload.id_runnumber).toBeNull();
        expect(payload.id_documents).toBeNull();
    });

    test("doc_7_input_ref_1_id = 1 when checkbox checked, doc_7_input_ref_2_id = null when unchecked", () => {
        const payload = buildFullPayload();
        expect(payload.doc_7_input_ref_1_id).toBe(1);
        expect(payload.doc_7_input_ref_2_id).toBeNull();
    });

    test("event_doc_ofo_gas_tranmiss_id is parsed to integer", () => {
        expect(buildFullPayload().event_doc_ofo_gas_tranmiss_id).toBe(2);
        expect(typeof buildFullPayload().event_doc_ofo_gas_tranmiss_id).toBe("number");
    });

    test("gas_shipper has exactly 2 rows (matching resultDoc7.json)", () => {
        expect(buildFullPayload().gas_shipper).toHaveLength(2);
    });

    test("email_event_for_shipper and cc_email are empty arrays", () => {
        const payload = buildFullPayload();
        expect(payload.email_event_for_shipper).toEqual([]);
        expect(payload.cc_email).toEqual([]);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edit mode regression (TSO) — focus on delete row behavior & API contract
// ─────────────────────────────────────────────────────────────────────────────
describe("doc7GasShipper — TSO EDIT delete-row regression", () => {
    const rowEditA: Doc7ExtraBlockFormValue = {
        ...emptyDoc7ExtraBlock(),
        ir: "1",
        io: "3",
        area: 1,
        nom_point: 18,
        nom_value_mmscfh: "1",
        gas_command: "cmd-a",
        gas_more: "more-a",
        shipper: [62],
        defaultShipperIds: [],
        shipperIdValue: [62],
        fileUrl: "",
        persistedFileUrl: "https://storage.example/old-a.pdf",
        serverId: 101,
    };

    const rowEditB: Doc7ExtraBlockFormValue = {
        ...emptyDoc7ExtraBlock(),
        ir: "2",
        io: "3",
        area: 1,
        nom_point: 18,
        nom_value_mmscfh: "2",
        gas_command: "cmd-b",
        gas_more: "more-b",
        shipper: [67],
        defaultShipperIds: [],
        shipperIdValue: [67],
        fileUrl: "https://cdn.example/new-b.pdf",
        persistedFileUrl: "https://storage.example/old-b.pdf",
        serverId: 202,
    };

    test("generate=true: ids come from serverId; deleting first row leaves only second row (no stale)", () => {
        const blocksAfterDelete = doc7ExtraFormRowsToLegacyInputs([rowEditB]);
        const api = buildGasShipperRowsForTsoEdit({ blocks: blocksAfterDelete, generate: true });

        expect(api).toHaveLength(1);
        expect(api[0].id).toBe(202);
        expect(api[0].ir).toBe(2);
        expect(api[0].nom_value_mmscfh).toBe("2.000000");
        // persisted file must never be sent; only new upload (fileUrl) is sent
        expect(api[0].file).toEqual(["https://cdn.example/new-b.pdf"]);
    });

    test("generate=true: deleting second row leaves only first row; persistedFileUrl must not populate file[]", () => {
        const blocksAfterDelete = doc7ExtraFormRowsToLegacyInputs([rowEditA]);
        const api = buildGasShipperRowsForTsoEdit({ blocks: blocksAfterDelete, generate: true });

        expect(api).toHaveLength(1);
        expect(api[0].id).toBe(101);
        expect(api[0].ir).toBe(1);
        expect(api[0].file).toEqual([]);
    });

    test("generate=false: ids must be null even if serverId exists (edit default flow)", () => {
        const blocks = doc7ExtraFormRowsToLegacyInputs([rowEditA, rowEditB]);
        const api = buildGasShipperRowsForTsoEdit({ blocks, generate: false });

        expect(api).toHaveLength(2);
        expect(api[0].id).toBeNull();
        expect(api[1].id).toBeNull();
    });

    test("edit omission gate is permLod only: permLod set with empty shipper still included", () => {
        const rowWithEmptyShipper: Doc7ExtraBlockFormValue = {
            ...rowEditA,
            shipper: [],
            shipperIdValue: null,
            defaultShipperIds: [],
        };
        const blocks = doc7ExtraFormRowsToLegacyInputs([rowWithEmptyShipper]);
        const api = buildGasShipperRowsForTsoEdit({ blocks, generate: false });

        expect(api).toHaveLength(1);
        expect(api[0].ir).toBe(1);
        expect(api[0].shipper).toEqual([]);
    });
});

