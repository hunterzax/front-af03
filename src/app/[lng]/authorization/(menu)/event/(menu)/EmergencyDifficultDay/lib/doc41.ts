/**
 * Doc41 — contract helpers for sent to `/master/event/emer/doc41` APIs.
 * Keep mapping pure so UI state shape can evolve without mutating submit payloads.
 */

export type Doc41FormValue  = {
    id?: number | null,
    defaultShippersRender: any[],
    defaultShippersId: any[],
    fileName?: string | null,
    fileNameEditText?: string | null,
    fileNameEditTextUrl?: string | null,
    fileUrl?: string | null,
    selectedShippers: string[],
    selectedShippersRender: any[]
    ir?: number | null,
    io?: number | null,
    value?: string,
    more?: string,
};

export function genEmptyDoc41FormValue(): Doc41FormValue {
    return {
        id: undefined,
        defaultShippersRender: [],
        defaultShippersId: [],
        selectedShippers: [],
        selectedShippersRender: [],
        // ir: undefined,
        // io: undefined,
        // value: undefined,
        // more: undefined,
        fileNameEditText: '',
        fileNameEditTextUrl: '',
        fileName: 'Maximum File 10 MB',
        fileUrl: ''
    };
}