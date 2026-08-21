// โอเค อันนี้เขียนเพื่อต่อท้ายโดยต้องหา data_to_export[xx].data[xx].day ที่มากที่สุด แล้วเอาไปเติมของอันที่น้อยกว่า อย่าลืมว่าเติม day. อันไหนไป ต้องเติม value เป็น null ด้วยนะ
const data_to_export = [
    {
        "data": [
            {
                "id": 46,
                "nomination_point": "ZAWTIKA",
                "customer": "SUPPLIER",
                "area": {
                    "id": 4,
                    "name": "Y",
                    "color": "#FFCEE2"
                },
                "unit": "MMBtud",
                "entry_exit_id": 1,
                "entry_exit": "Entry",
                "day": [
                    "01/03/2026",
                    "02/03/2026",
                    "03/03/2026",
                    "04/03/2026",
                    "05/03/2026",
                    "06/03/2026",
                    "07/03/2026",
                    "08/03/2026",
                    "09/03/2026",
                    "10/03/2026",
                    "11/03/2026",
                    "12/03/2026",
                ],
                "value": [
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                    123456,
                ]
            },
            {
                "id": 3,
                "nomination_point": "NGV-R",
                "customer": "NGV",
                "area": {
                    "id": 5,
                    "name": "R",
                    "color": "#DBE4FF"
                },
                "unit": "MMBtud",
                "entry_exit_id": 2,
                "entry_exit": "Exit",
                "day": [
                    "01/03/2026",
                    "02/03/2026",
                ],
                "value": [
                    123456,
                    123456,
                ]
            },
        ],
        "planning_code_id": 10,
        "planning_code": "20251226-ST-0002",
        "group": {
            "id": 2,
            "id_name": "NGP-S16-001",
            "name": "PTT",
            "company_name": "บริษัท ปตท. จำกัด (มหาชน)"
        },
        "start_date": "2026-12-31T17:00:00.000Z",
        "end_date": "2027-04-30T17:00:00.000Z",
        "shipper_file_submission_date": "2025-12-26T04:45:59.479Z"
    },
    {
        "data": [
            {
                "id": 57,
                "nomination_point": "S_GSP1",
                "customer": "GSP",
                "area": {
                    "id": 1,
                    "name": "X1",
                    "color": "#DBE4FF"
                },
                "unit": "MMBtud",
                "entry_exit_id": 1,
                "entry_exit": "Entry",
                "day": [
                    "01/03/2026",
                    "02/03/2026",
                    "03/03/2026",
                    "04/03/2026",
                    "05/03/2026",
                    "06/03/2026",
                    "07/03/2026",
                ],
                "value": [
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                ]
            },
        ],
        "planning_code_id": 12,
        "planning_code": "20251226-ST-0004",
        "group": {
            "id": 5,
            "id_name": "NGP-S20-004",
            "name": "B.GRIMM",
            "company_name": "บริษัท บี.กริม แอลเอ็นจี จำกัด"
        },
        "start_date": "2026-12-31T17:00:00.000Z",
        "end_date": "2027-04-30T17:00:00.000Z",
        "shipper_file_submission_date": "2025-12-26T05:50:22.105Z"
    }
]