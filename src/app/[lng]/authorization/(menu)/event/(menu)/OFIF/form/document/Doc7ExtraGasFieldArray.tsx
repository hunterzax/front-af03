"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type {
    FieldErrors,
    UseFormGetValues,
    UseFormRegister,
    UseFormSetValue,
    UseFormWatch,
} from "react-hook-form";
import { Button, Checkbox, ListItemText, MenuItem, Select, TextField, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SelectFormProps from "@/components/other/selectProps";
import { uploadFileService } from "@/utils/postService";
import { cutUploadFileName } from "@/utils/generalFormatter";

import { emptyDoc7ExtraBlock, type Doc7ExtraBlockFormValue } from "../../lib/doc7GasShipper";

export type Doc7ExtraGasFieldArrayProps = {
    flow: "create" | "extras";
    fields: FieldArrayWithId<any, "doc7_extra_blocks", "id">[];
    append: (value: Doc7ExtraBlockFormValue) => void;
    remove: (index: number) => void;
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    getValues: UseFormGetValues<any>;
    setValue: UseFormSetValue<any>;
    errors: FieldErrors<any>;
    clearErrors: (name?: any) => void;

    dataNomPointForDoc7: any;
    mode: any;
    modeOpenDocument: any;
    isShipper: boolean;
    userDT: any;

    selectboxClass: string;
    selectSx: object;
    inputClass: string;
    labelClass: string;
    modeDraft: any

    /**
     * Needed for Doc7 "Save" enable gating in edit mode.
     * (formDocument7 passes its own handler)
     */
    onTouchEdit?: () => void;
};

// NOTE: Native radio rendering is OS/browser-controlled; to mimic disabled 1:1 without using `disabled`,
// we render a custom radio UI and keep the real input enabled (but non-interactive via guards).
const radioLabelClass = "w-[85px] text-[#58585A]";
const radioLabelDisabledClass = "w-[85px] text-[#B6B6B6] select-none";
const radioLabelWideClass = "w-[100px] text-[#58585A]";
const radioLabelWideDisabledClass = "w-[100px] text-[#B6B6B6] select-none";

const customRadioOuterClass =
    "relative inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border";
const customRadioDotAfterBase =
    "after:content-[''] after:absolute after:h-[8px] after:w-[8px] after:rounded-full after:opacity-0 peer-checked:after:opacity-100";

const pseudoDisabledProps = (disabled: boolean) => ({
    tabIndex: disabled ? -1 : undefined,
    "aria-disabled": disabled ? true : undefined,
});



async function downloadUrl(url: string) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const fileName = url.split("/").pop() || "download";
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    } catch {
        /* ignore */
    }
}

const Doc7ExtraGasFieldArray: React.FC<Doc7ExtraGasFieldArrayProps> = ({
    flow,
    fields,
    append,
    remove,
    register,
    watch,
    getValues,
    setValue,
    errors,
    clearErrors,
    dataNomPointForDoc7,
    mode,
    modeOpenDocument,
    isShipper,
    userDT,
    selectboxClass,
    selectSx,
    inputClass,
    labelClass,
    onTouchEdit,
    modeDraft,
}) => {
    const canMutateRows = !isShipper && mode !== "view";
    const fieldDisabled = mode === "view" || isShipper;
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [fileErrIdx, setFileErrIdx] = useState<number | null>(null);

    // Ensure default create has at least 1 dynamic row (empty, like legacy set 1).
    useEffect(() => {
        if (mode === "create" && flow === "extras" && fields.length === 0 && canMutateRows) {
            append(emptyDoc7ExtraBlock());
        }
    }, [mode, flow, fields.length, canMutateRows, append]);



    const handleExtraFile = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        const base = `doc7_extra_blocks.${index}` as const;
        const maxSizeInMB = 10;
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        if (!file) {
            setValue(`${base}.fileName` as any, "No file chosen");
            e.target.value = "";
            return;
        }

        if (file.size > maxSizeInBytes) {
            setFileErrIdx(index);
            setValue(`${base}.fileName` as any, "The file is larger than 10 MB.");
            e.target.value = "";
            return;
        }

        setFileErrIdx(null);
        setUploadingIdx(index);
        try {
            const response: any = await uploadFileService("/files/uploadfile/", file);
            setValue(`${base}.fileUrl` as any, response?.file?.url ?? "");
            setValue(`${base}.fileName` as any, file.name);
        } catch {
            setValue(`${base}.fileName` as any, "Upload failed");
        } finally {
            setTimeout(() => setUploadingIdx(null), 400);
            e.target.value = "";
        }
    };

    const handleRemoveExtraFile = (index: number) => {
        const base = `doc7_extra_blocks.${index}` as const;
        setFileErrIdx(null);
        setValue(`${base}.fileUrl` as any, "");
        const persisted = String(getValues(`${base}.persistedFileUrl` as any) ?? "").trim();
        if (persisted) {
            setValue(`${base}.fileName` as any, cutUploadFileName(persisted));
        } else {
            setValue(`${base}.fileName` as any, "Maximum File 10 MB");
        }
    };

    if (fields.length === 0 && mode === "view") return null;

    const canRemoveRow = (index: number) => {
        if (!canMutateRows || modeOpenDocument === "view") return false;
        if (fields.length <= 1 && flow === "create") return false;
        return index >= 0 && fields.length > 1;
    };

    const shipperListForRow = (base: string, watchLocal: any) => {
        const io = watchLocal(`${base}.io`);
        const areaId = watchLocal(`${base}.area`);
        const nomPointId = watchLocal(`${base}.nom_point`);
        const entry_exit_id = io == 3 || io === "3" ? 1 : 2;

        const areas = (dataNomPointForDoc7 ?? []).filter((it: any) => it.entry_exit_id == entry_exit_id);
        const areaObj = areas.find((a: any) => a.id == areaId);
        const nomList = areaObj?.nom ?? [];
        const nomObj = nomList.find((n: any) => n.id == nomPointId);
        return nomObj?.shipper ?? [];
    };

    return (
        <>
            {fields.map((field, index) => {
                const base = `doc7_extra_blocks.${index}` as const;

                const data = field as any;
                /**
                 * ห้ามใช้ native `disabled` บน radio ที่ผูกกับ RHF
                 * เพราะตอน append/update field array RHF อ่านค่าจาก ref แล้วจะข้าม `<input disabled>` ที่ checked
                 * ทำให้ได้ value null และทับ `ir`/`io` ใน form state — ใช้ pointer-events + guard แทน
                 */
                const isDisabled = modeDraft ? false : (fieldDisabled || !!data.serverId);
                const isServerPersistedRow = modeDraft ? false : !!data.serverId;
                /** สีจุด radio: ใช้สตริงคลาสเต็ม (อย่า concat ใน `accent-[...]` เพราะ Tailwind JIT จะไม่ generate) */
                const radioAccentClass = fieldDisabled
                    ? "mr-1 accent-[#B6B6B6] opacity-90"
                    : isServerPersistedRow
                      ? "mr-1 accent-[#f1f1f1]"
                      : "mr-1 accent-[#1473A1]";

                const ir = watch(`${base}.ir`) || data.ir;
                const io = watch(`${base}.io`) || data.io;
                const irSet = watch(`${base}.ir`) == null ? !!data.ir : !!watch(`${base}.ir`);
                const entry_exit_id = io == 3 || io === "3" ? 1 : 2;

                const areaOptions = (dataNomPointForDoc7 ?? []).filter((it: any) => it.entry_exit_id == entry_exit_id);
                const areaId = watch(`${base}.area`) || data.area;
                const areaObj = areaOptions.find((a: any) => a.id == areaId);
                const nomOptions = areaObj?.nom ?? [];
                const nomPointId = watch(`${base}.nom_point`) || data.nom_point;
                const list = shipperListForRow(base, watch);

                const defaultIds = ((watch(`${base}.defaultShipperIds` as any) ?? data.defaultShipperIds ?? []) as Array<number | string>) ?? [];
                const shipperStored = ((watch(`${base}.shipper` as any) ?? data.shipper ?? []) as Array<number | string>) ?? [];
                const optionalIds = list
                    .filter((it: any) => !defaultIds.includes(it.id))
                    .map((it: any) => it.id);

                const selectedOptionalNames = list
                    .filter((it: any) => shipperStored.includes(it.id) && !defaultIds.includes(it.id))
                    .map((it: any) => it.name);

                const defaultNames = list.filter((it: any) => defaultIds.includes(it.id)).map((it: any) => it.name);

                const allOptionalIds = optionalIds;
                const shipperStoredOptional = isDisabled ? defaultIds : shipperStored.filter((id: any) => !defaultIds.includes(id));

                const shipperSelectJsx = (
                    <Select
                        multiple
                        IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                        disabled={isDisabled || !(watch(`${base}.nom_point` as any))}
                        value={shipperStoredOptional}
                        onChange={(e: any) => {
                            onTouchEdit?.();
                            const raw = e.target.value as unknown[];
                            const localOptionalIds = allOptionalIds;
                            const pickedOptional = shipperStoredOptional.filter((id) =>
                                localOptionalIds.includes(id),
                            );
                            if (raw.includes("all")) {
                                const allOptionalPicked =
                                    localOptionalIds.length > 0 && pickedOptional.length === localOptionalIds.length;
                                const nextOptional = allOptionalPicked ? [] : localOptionalIds;
                                setValue(`${base}.shipper` as any, nextOptional);
                                setValue(`${base}.shipperIdValue` as any, nextOptional);
                                return;
                            }

                            const next = raw
                                .filter((x) => x !== "all")
                                .map((x) => (typeof x === "string" ? parseInt(String(x), 10) : x));
                            const uniq = Array.from(new Set(next));
                            setValue(`${base}.shipper` as any, uniq);
                            setValue(`${base}.shipperIdValue` as any, uniq);
                        }}
                        className={`${selectboxClass} ${(mode === "view") && "!bg-[#EFECEC]"}`}
                        sx={selectSx}
                        displayEmpty
                        renderValue={(selected) => {
                            const sel = (selected ?? []) as Array<number | string>;
                            if (!sel?.length) {
                                return (
                                    <Typography color="#9CA3AF" fontSize={14}>
                                        Select Shipper Name
                                    </Typography>
                                );
                            }

                            const optionalList = list.filter((item: any) => !defaultIds.includes(item.id));
                            const showSelectAllLabel =
                                optionalList.length > 0 &&
                                sel.filter((id) => optionalIds.includes(id)).length === optionalList.length;

                            return (
                                <span className="pl-[10px] text-[14px]">
                                    {showSelectAllLabel
                                        ? `Select All`
                                        : sel
                                              .map((id) => optionalList.find((it: any) => it.id === id)?.name)
                                              .filter(Boolean)
                                              .join(", ")}
                                </span>
                            );
                        }}
                        MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                    >
                        {!isShipper && (
                            <MenuItem value="all">
                                <Checkbox
                                    checked={
                                        allOptionalIds.length > 0 &&
                                        allOptionalIds.every((id: number | string) =>
                                            shipperStoredOptional.includes(id),
                                        )
                                    }
                                />
                                <ListItemText
                                    primary="Select All"
                                    primaryTypographyProps={{ sx: { fontWeight: "bold" } }}
                                />
                            </MenuItem>
                        )}

                        {list
                            .filter((it: any) => !defaultIds.includes(it.id))
                            .sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""))
                            .map((it: any) => (
                                <MenuItem key={it.id} value={it.id}>
                                    <Checkbox checked={shipperStoredOptional.includes(it.id)} />
                                    <ListItemText primary={it.name} />
                                </MenuItem>
                            ))}
                    </Select>
                );

                return (
                    <React.Fragment key={field.id}>
                        {index > 0 && (
                            <div className="my-2 w-full">
                                <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
                            </div>
                        )}

                        <div className="pb-5">
                            {/* Row 1: เพิ่ม/ลด + จุดส่งเข้า/ออก on same line (matches legacy) */}
                            <div className="gap-2 w-full flex items-center">
                                <div
                                    className={`flex items-center gap-2 flex-wrap flex-1 ${
                                        isDisabled ? "pointer-events-none" : ""
                                    }`}
                                >
                                    <div className="grid grid-cols-2 gap-1 pt-4">
                                    <label className={`flex items-center gap-2 ${isDisabled ? radioLabelDisabledClass : radioLabelClass} ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                            <input
                                                type="radio"
                                                {...register(`${base}.ir` as any, { required: false })}
                                                value={1}
                                                // disabled={fieldDisabled}
                                                {...pseudoDisabledProps(isDisabled)}
                                                checked={ir == 1 || ir === "1"}
                                                onChange={(e) => {
                                                    if (isDisabled) return;
                                                    onTouchEdit?.();
                                                    setValue(`${base}.ir` as any, e.target.value);
                                                }}
                                                className="peer sr-only"
                                            />
                                            <span
                                                className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                    isDisabled
                                                        ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                        : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                }`}
                                            />
                                            {`เพิ่ม`}
                                        </label>
                                        <label className={`flex items-center gap-2 ${isDisabled ? radioLabelDisabledClass : radioLabelClass} ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                            <input
                                                type="radio"
                                                {...register(`${base}.ir` as any, { required: false })}
                                                value={2}
                                                // disabled={fieldDisabled}
                                                {...pseudoDisabledProps(isDisabled)}
                                                checked={ir == 2 || ir === "2"}
                                                onChange={(e) => {
                                                    if (isDisabled) return;
                                                    onTouchEdit?.();
                                                    setValue(`${base}.ir` as any, e.target.value);
                                                }}
                                                className="peer sr-only"
                                            />
                                            <span
                                                className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                    isDisabled
                                                        ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                        : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                }`}
                                            />
                                            {`ลด`}
                                        </label>
                                    </div>

                                    {irSet && (
                                        <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className={`flex items-center gap-2 ${isDisabled ? radioLabelWideDisabledClass : radioLabelWideClass} ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                                <input
                                                    type="radio"
                                                    {...register(`${base}.io` as any, { required: false })}
                                                    value={3}
                                                    // disabled={fieldDisabled}
                                                    {...pseudoDisabledProps(isDisabled)}
                                                    checked={io == 3 || io === "3"}
                                                    onChange={(e) => {
                                                        if (isDisabled) return;
                                                        onTouchEdit?.();
                                                        setValue(`${base}.io` as any, e.target.value);
                                                        setValue(`${base}.area` as any, null);
                                                        setValue(`${base}.nom_point` as any, null);
                                                        setValue(`${base}.shipper` as any, []);
                                                        setValue(`${base}.shipperIdValue` as any, null);
                                                        clearErrors(`${base}.io` as any);
                                                    }}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                        isDisabled
                                                            ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                            : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                    }`}
                                                />
                                                {`จุดส่งเข้า`}
                                            </label>
                                            <label className={`flex items-center gap-2 ${isDisabled ? radioLabelWideDisabledClass : radioLabelWideClass} ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
                                                <input
                                                    type="radio"
                                                    {...register(`${base}.io` as any, { required: false })}
                                                    value={4}
                                                    // disabled={fieldDisabled}
                                                    {...pseudoDisabledProps(isDisabled)}
                                                    checked={io == 4 || io === "4"}
                                                    onChange={(e) => {
                                                        if (isDisabled) return;
                                                        onTouchEdit?.();
                                                        setValue(`${base}.io` as any, e.target.value);
                                                        setValue(`${base}.area` as any, null);
                                                        setValue(`${base}.nom_point` as any, null);
                                                        setValue(`${base}.shipper` as any, []);
                                                        setValue(`${base}.shipperIdValue` as any, null);
                                                        clearErrors(`${base}.io` as any);
                                                    }}
                                                    className="peer sr-only"
                                                />
                                                <span
                                                    className={`${customRadioOuterClass} ${customRadioDotAfterBase} ${
                                                        isDisabled
                                                            ? "border-[#D1D5DB] bg-[#F3F4F6] after:bg-[#9CA3AF]"
                                                            : "border-[#1473A1] bg-white after:bg-[#1473A1]"
                                                    }`}
                                                />
                                                {`จุดส่งออก`}
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {canRemoveRow(index) && !isDisabled && (
                                    <Button
                                        type="button"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        onClick={() => {
                                            onTouchEdit?.();
                                            remove(index);
                                            clearErrors("doc7_extra_blocks" as any);
                                        }}
                                        startIcon={<DeleteOutlineOutlinedIcon />}
                                        sx={{ textTransform: "none" }}
                                        className="ml-auto !pt-4"
                                    >
                                        {`ลบชุดนี้`}
                                    </Button>
                                )}
                            </div>

                            {/* Row 2: Area (conditional on irSet) ปริมาณก๊าซที่ + Shipper (ALWAYS visible, matches legacy grid-cols-3 with 2 children) */}
                            {irSet && (
                                <div className="gap-2 w-full flex items-center pt-4">
                                    {/* <div className="grid grid-cols-2 gap-1 pt-4">
                                        <label className="w-[100px] text-[#58585A]"></label>
                                        <label className="w-[100px] text-[#58585A]"></label>
                                    </div> */}
                                    <div className="grid grid-cols-3 w-full gap-4">
                                        <div className="flex flex-wrap flex-auto ">
                                            <label className={`${labelClass}`}>{`Area`}</label>
                                            <SelectFormProps
                                                id={`${base}.area`}
                                                register={register(`${base}.area` as any, { required: false })}
                                                disabled={isDisabled || !watch(`${base}.io` as any)}
                                                valueWatch={watch(`${base}.area` as any) || ""}
                                                handleChange={(e) => {
                                                    onTouchEdit?.();
                                                    setValue(`${base}.area` as any, e.target.value);
                                                    setValue(`${base}.nom_point` as any, null);
                                                    setValue(`${base}.shipper` as any, []);
                                                    setValue(`${base}.defaultShipperIds` as any, []);
                                                    setValue(`${base}.shipperIdValue` as any, null);
                                                    clearErrors(`${base}.area` as any);
                                                }}
                                                errors={(errors as any)?.doc7_extra_blocks?.[index]?.area}
                                                errorsText={"Select Area"}
                                                options={areaOptions}
                                                optionsKey={"id"}
                                                optionsValue={"id"}
                                                optionsText={"name"}
                                                optionsResult={"name"}
                                                placeholder={"Select Area"}
                                                pathFilter={"name"}
                                            />
                                        </div>

                                        <div className="flex flex-wrap flex-auto ">
                                            <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                                            <SelectFormProps
                                                id={`${base}.nom_point`}
                                                register={register(`${base}.nom_point` as any, { required: false })}
                                                disabled={isDisabled || !watch(`${base}.area`) as any}
                                                valueWatch={watch(`${base}.nom_point` as any) || ""}
                                                handleChange={(e) => {
                                                    onTouchEdit?.();
                                                    setValue(`${base}.nom_point` as any, e.target.value);
                                                    setValue(`${base}.shipper` as any, []);
                                                    setValue(`${base}.defaultShipperIds` as any, []);
                                                    setValue(`${base}.shipperIdValue` as any, null);
                                                    clearErrors(`${base}.nom_point` as any);
                                                }}
                                                errors={(errors as any)?.doc7_extra_blocks?.[index]?.nom_point}
                                                errorsText={"Select Point"}
                                                options={nomOptions}
                                                optionsKey={"id"}
                                                optionsValue={"id"}
                                                optionsText={"nomination_point"}
                                                optionsResult={"nomination_point"}
                                                placeholder={"Select Point"}
                                                pathFilter={"nomination_point"}
                                            />
                                        </div>

                                        <div className="flex flex-wrap flex-auto">
                                            <label className={`${labelClass}`}>{`Shipper`}</label>
                                            {shipperSelectJsx}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conditional sections below (only when irSet) */}
                            {irSet && (
                                <>
                                    {/* Row 4: Shipper chips */}
                                    <div className="gap-2 w-full flex items-center">
                                        {/* <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div> */}

                                        <div className="grid grid-cols-3 w-full gap-4">
                                            <div></div>
                                            <div></div>
                                            <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                                <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                                    {defaultNames.map((name: string, i: number) => (
                                                        <div
                                                            key={`def-${field.id}-${i}`}
                                                            className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                        >
                                                            {name}
                                                        </div>
                                                    ))}
                                                    {selectedOptionalNames.map((name: string, i: number) => (
                                                        <div
                                                            key={`sel-${field.id}-${i}`}
                                                            className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                        >
                                                            {name}
                                                            {!isDisabled && (
                                                                <button
                                                                    type="button"
                                                                    className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                                    onClick={() => {
                                                                        onTouchEdit?.();
                                                                        const currentOptionalIds = (shipperStoredOptional ?? []) as Array<number | string>;
                                                                        const idToRemove = (list.find((it: any) => it.name === name)?.id ?? null) as any;
                                                                        const nextOptional =
                                                                            idToRemove == null
                                                                                ? currentOptionalIds
                                                                                : currentOptionalIds.filter((id) => id !== idToRemove);
                                                                        setValue(`${base}.shipper` as any, nextOptional);
                                                                        setValue(`${base}.shipperIdValue` as any, nextOptional);
                                                                    }}
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 5: MMSCFH */}
                                    <div className="gap-2 w-full flex items-center pt-4">
                                        {/* <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div> */}
                                        <div className="w-full col-span-2">
                                            <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                                            <TextField
                                                {...register(`${base}.nom_value_mmscfh` as any, { required: false })}
                                                value={watch(`${base}.nom_value_mmscfh` as any) || ""}
                                                label=""
                                                multiline
                                                onChange={(e) => {
                                                    onTouchEdit?.();
                                                    if (e.target.value.length <= 255) {
                                                        setValue(`${base}.nom_value_mmscfh` as any, e.target.value);
                                                    }
                                                }}
                                                placeholder="ระบุรายละเอียด"
                                                disabled={isDisabled || !irSet}
                                                rows={2}
                                                sx={{
                                                    "& .MuiInputBase-root": {
                                                        background: isDisabled ? "#EFECEC" : "transparent",
                                                    },
                                                }}
                                                className={`${mode === "view" && "bg-[#EFECEC] rounded-[8px]"}`}
                                                fullWidth
                                            />
                                            <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                <span className="text-[13px]">
                                                    {watch(`${base}.nom_value_mmscfh` as any)?.length || 0} / 255
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 6: gas_command + gas_more */}
                                    <div className="gap-2 w-full flex items-center pt-4">
                                        {/* <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div> */}

                                        <div className="grid grid-cols-2 w-full gap-4">
                                            <div className="">
                                                <label className={labelClass}>{`การสั่งการ`}</label>
                                                <input
                                                    type="text"
                                                    placeholder="รายละเอียด"
                                                    readOnly={isDisabled || !irSet}
                                                    {...register(`${base}.gas_command` as any, { required: false })}
                                                    onChange={(e) => {
                                                        onTouchEdit?.();
                                                        if (e.target.value.length <= 255) {
                                                            setValue(`${base}.gas_command` as any, e.target.value);
                                                        }
                                                    }}
                                                    maxLength={255}
                                                    className={`${inputClass} ${mode === "view" && "!bg-[#EFECEC]"}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch(`${base}.gas_command` as any)?.length || 0} / 255</span>
                                                </div>
                                            </div>

                                            <div className="">
                                                <label className={labelClass}>{`ข้อมูลเพิ่มเติม`}</label>
                                                <input
                                                    type="text"
                                                    placeholder="รายละเอียด"
                                                    readOnly={isDisabled || !irSet}
                                                    {...register(`${base}.gas_more` as any, { required: false })}
                                                    onChange={(e) => {
                                                        onTouchEdit?.();
                                                        if (e.target.value.length <= 255) {
                                                            setValue(`${base}.gas_more` as any, e.target.value);
                                                        }
                                                    }}
                                                    maxLength={255}
                                                    className={`${inputClass} ${mode === "view" && "!bg-[#EFECEC]"}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">{watch(`${base}.gas_more` as any)?.length || 0} / 255</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Row 7: File upload / download */}
                                    <div className="gap-2 w-full flex items-center ">
                                        {/* <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div> */}

                                        {(() => {
                                            const newUrl = String(watch(`${base}.fileUrl` as any) ?? "").trim();
                                            const persistedUrl = String(watch(`${base}.persistedFileUrl` as any) ?? "").trim();
                                            const dlUrl = newUrl || persistedUrl;
                                            const showDownload = mode === "view" && !!dlUrl;
                                            return showDownload ? (
                                                <div className="grid grid-cols-2 w-full gap-4 ">
                                                    <div className="col-span-2 ">
                                                        <label className={`${labelClass}`}>{`File`}</label>
                                                        <div className="h-[46px] text-[#464255] p-3 rounded-[6px] bg-[#F3F2F2] flex justify-between w-full">
                                                            <div className="flex items-center gap-2">
                                                                <InsertDriveFileOutlinedIcon sx={{ fontSize: "20px" }} />{" "}
                                                                {watch(`${base}.fileName` as any) || "—"}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="flex items-center justify-center px-[2px] py-[2px] rounded-[4px] relative hover:bg-[#DFE4EA] hover:border hover:border-[#DFE4EA]"
                                                                onClick={() => downloadUrl(dlUrl)}
                                                            >
                                                                <FileDownloadIcon
                                                                    sx={{
                                                                        fontSize: 23,
                                                                        color: "#1473A1",
                                                                        backgroundColor: "#ffffff",
                                                                        borderRadius: "4px",
                                                                        borderColor: "#DFE4EA",
                                                                    }}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })()}

                                        {!isShipper && mode !== "view" && (
                                            <div className="grid grid-cols-2 w-full">
                                                <label className={`${labelClass}`}>{`File`}</label>
                                                <div
                                                    className={`flex items-center col-span-2 ${
                                                        fileErrIdx === index ? "border border-[#ff0000] rounded-r-lg rounded-l-lg" : ""
                                                    }`}
                                                >
                                                    <label className="flex bg-[#00ADEF] text-white items-center justify-center font-light rounded-l-[6px] text-[16px] text-justify w-[20%] !h-[44px] px-2 cursor-pointer">
                                                        {`Choose File`}
                                                        {uploadingIdx === index && (
                                                            <span className="ml-2 w-[14px] h-[14px] border-[2px] border-white border-t-transparent rounded-full animate-spin"></span>
                                                        )}
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) => handleExtraFile(e, index)}
                                                        />
                                                    </label>
                                                    <div className="bg-white text-[#9CA3AF] text-sm w-[80%] !h-[44px] px-2 py-2 rounded-r-[6px] border-l-0 border border-gray-300 truncate overflow-hidden flex items-center">
                                                        <span className="truncate">
                                                            {watch(`${base}.fileName` as any) || "Maximum File 10 MB"}
                                                        </span>
                                                        {watch(`${base}.fileName` as any) &&
                                                            watch(`${base}.fileName` as any) !== "Maximum File 10 MB" && (
                                                                <CloseOutlinedIcon
                                                                    onClick={() => handleRemoveExtraFile(index)}
                                                                    className="cursor-pointer ml-2 text-[#9CA3AF] z-10"
                                                                    sx={{ color: "#323232", fontSize: 18 }}
                                                                />
                                                            )}
                                                    </div>
                                                </div>
                                                <div className={`w-full flex items-center justify-between text-[14px] text-red-500 `}>
                                                    {fileErrIdx === index && "The file is larger than 10 MB."}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </>
    );
};

export default Doc7ExtraGasFieldArray;
