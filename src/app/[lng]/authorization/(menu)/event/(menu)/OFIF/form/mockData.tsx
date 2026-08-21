// mock status ของเอกสาร สำหรับเมนู emergency / difficult day
// GET event/emer/event-doc-status
export const mock_doc_status = [
    {
        "id": 3,
        "name": "Accepted",
        "color": "#CEF8D6"
    },
    {
        "id": 4,
        "name": "Rejected",
        "color": "#FFF1CE"
    },
    {
        "id": 5,
        "name": "Acknowledge",
        "color": "#CEE3F8"
    },
    {
        "id": 6,
        "name": "Generated",
        "color": "#D3C9ED"
    }
]


// mock status หลัก สำหรับเมนู emergency / difficult day
// GET event/emer/event-status
export const mock_main_status = [
    {
        "id": 1,
        "name": "Open",
        "color": "#C9DAED"
    },
    {
        "id": 2,
        "name": "Close",
        "color": "#FDD0D0"
    }
]


// mock ประเภท สำหรับเมนู emergency / difficult day
// GET event/emer/event-type
export const mock_emergency_type = [
    {
        "id": 1,
        "name": "เหตุการณ์ไม่สมดุลอย่างรุนแรง (Difficult Day)"
    },
    {
        "id": 2,
        "name": "ภาวะเหตุฉุกเฉิน (Emergency)"
    }
]

// mock ประเภท สำหรับเมนู ofo
export const mock_ofo_type = [
    {
        "id": 1,
        "name": "Operation Flow Order"
    },
    {
        "id": 2,
        "name": "Instructed Flow Order"
    }
]