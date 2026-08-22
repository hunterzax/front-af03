import React, { useState } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type { FieldErrors, UseFormGetValues, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { Button, Checkbox, ListItemText, MenuItem, Select, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SelectFormProps from "@/components/other/selectProps";
import { NumericFormat } from "react-number-format";
import { uploadFileService } from "@/utils/postService";
import { cutUploadFileName } from "@/utils/generalFormatter";
import {
    DOC6_GAS_SHIPPER_MAX_BLOCKS,
    DOC6_LEGACY_BLOCK_COUNT,
    emptyDoc6ExtraBlock,
    type Doc6ExtraBlockFormValue,
} from "../../lib/doc6GasShipper";

export type Doc6ExtraGasFieldArrayProps = {
    flow: "create" | "extras";
    fields: FieldArrayWithId<any, "doc6_extra_blocks", "id">[];
    append: (value: Doc6ExtraBlockFormValue) => void;
    remove: (index: number) => void;
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    getValues: UseFormGetValues<any>;
    setValue: UseFormSetValue<any>;
    errors: FieldErrors<any>;
    clearErrors: (name?: any) => void;
    dataNomPointForDoc6: any;
    mode: any;
    modeOpenDocument: any;
    isShipper: boolean;
    userDT: any;
    selectboxClass: string;
    selectSx: object;
    inputClass: string;
    labelClass: string;
};

const maxRowsForFlow = (flow: "create" | "extras") =>
    flow === "create" ? DOC6_GAS_SHIPPER_MAX_BLOCKS : DOC6_GAS_SHIPPER_MAX_BLOCKS - DOC6_LEGACY_BLOCK_COUNT;

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

/**
 * Dynamic `doc6_extra_blocks`: same grid/rows as legacy ชุด 1 (`formDocument6`).
 * - `create`: up to 10 rows (TSO create replaces legacy 1–5 UI).
 * - `extras`: rows 6–10 on edit/view (max 5 extra).
 */
const Doc6ExtraGasFieldArray: React.FC<Doc6ExtraGasFieldArrayProps> = ({
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
    dataNomPointForDoc6,
    mode,
    modeOpenDocument,
    isShipper,
    userDT,
    selectboxClass,
    selectSx,
    inputClass,
    labelClass,
}) => {
    const isTso = (userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4);
    const canMutateRows = isTso && mode !== "view";
    const fieldDisabled = mode === "view" || isShipper;
    const maxRows = maxRowsForFlow(flow);
    const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
    const [fileErrIdx, setFileErrIdx] = useState<number | null>(null);

    const appendRow = () => {
        if (fields.length >= maxRows) return;
        append(emptyDoc6ExtraBlock());
    };

    const handleExtraFile = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        const base = `doc6_extra_blocks.${index}` as const;
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
        const base = `doc6_extra_blocks.${index}` as const;
        setFileErrIdx(null);
        setValue(`${base}.fileUrl` as any, "");
        const persisted = String(getValues(`${base}.persistedFileUrl` as any) ?? "").trim();
        if (persisted) {
            setValue(`${base}.fileName` as any, cutUploadFileName(persisted));
        } else {
            setValue(`${base}.fileName` as any, "Maximum File 10 MB");
        }
    };

    if (!isTso) {
        return null;
    }
    if (fields.length === 0 && mode === "view") {
        return null;
    }

    const canRemoveRow = (index: number) => {
        if (!canMutateRows || modeOpenDocument === "view") return false;
        if (flow === "create" && fields.length <= 1) return false;
        return true;
    };

    return (
        <>
            {flow === "extras" && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
                    <div className="text-[14px] font-semibold text-[#58585A]">{`เพิ่มชุดปริมาณก๊าซ (ชุดที่ ${DOC6_LEGACY_BLOCK_COUNT + 1}–${DOC6_GAS_SHIPPER_MAX_BLOCKS})`}</div>
                    {canMutateRows && (
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={appendRow}
                            disabled={fields.length >= maxRows}
                            sx={{ textTransform: "none", borderColor: "#00ADEF", color: "#00ADEF" }}
                            startIcon={<AddOutlinedIcon />}
                        >
                            {`เพิ่มชุด`}
                        </Button>
                    )}
                </div>
            )}

            {fields.map((field, index) => {
                const base = `doc6_extra_blocks.${index}` as const;
                const shipperStored = (watch(`${base}.shipper` as any) ?? []) as number[];
                const defaultIds = ((watch(`${base}.defaultShipperIds` as any) ?? []) as number[]) ?? [];
                const nom = dataNomPointForDoc6?.find((it: any) => it.id == watch(`${base}.nom_point` as any));
                const list = (nom?.shipper ?? []) as { id: number; name: string }[];
                const irSet = !!watch(`${base}.ir` as any);
                /** Full id list for MUI Select (defaults + user picks). Form stores merged list in `shipper`. */
                const shipperVals = Array.from(new Set([...defaultIds, ...shipperStored]));

                const defaultNames = list.filter((s) => defaultIds.includes(s.id));
                const selectedExtras = shipperStored.filter((id) => !defaultIds.includes(id));
                const selectedNames = list.filter((s) => selectedExtras.includes(s.id));
                const optionalIds = list.filter((s) => !defaultIds.includes(s.id)).map((s) => s.id);

                return (
                    <React.Fragment key={field.id}>
                        {index > 0 && (
                            <div className="my-2 w-full">
                                <hr className="border-t border-[#DFE4EA] w-full mx-auto" />
                            </div>
                        )}

                        <div className="pb-5">
                            {canRemoveRow(index) && (
                                <div className="flex justify-end pb-2">
                                    <Button
                                        type="button"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        onClick={() => remove(index)}
                                        startIcon={<DeleteOutlineOutlinedIcon />}
                                        sx={{ textTransform: "none" }}
                                    >
                                        {`ลบชุดนี้`}
                                    </Button>
                                </div>
                            )}

                            <div className="gap-2 w-full flex items-center">
                                <div className="grid grid-cols-2 gap-1 pt-4">
                                    <label className="w-[100px] text-[#58585A]">
                                        <input
                                            type="radio"
                                            {...register(`${base}.ir` as any, { required: false })}
                                            value={1}
                                            disabled={fieldDisabled}
                                            checked={watch(`${base}.ir` as any) == 1 || watch(`${base}.ir` as any) === "1"}
                                            onChange={(e) => setValue(`${base}.ir` as any, e.target.value)}
                                            className="mr-1 accent-[#1473A1]"
                                        />
                                        {`เพิ่ม`}
                                    </label>
                                    <label className="w-[100px] text-[#58585A]">
                                        <input
                                            type="radio"
                                            {...register(`${base}.ir` as any, { required: false })}
                                            value={2}
                                            disabled={fieldDisabled}
                                            checked={watch(`${base}.ir` as any) == 2 || watch(`${base}.ir` as any) === "2"}
                                            onChange={(e) => setValue(`${base}.ir` as any, e.target.value)}
                                            className="mr-1 accent-[#1473A1]"
                                        />
                                        {`ลด`}
                                    </label>
                                </div>

                                <div className="grid grid-cols-3 w-full gap-4">
                                    <div className="flex flex-wrap flex-auto ">
                                        <label className={`${labelClass}`}>{`ปริมาณก๊าซที่`}</label>
                                        <SelectFormProps
                                            id={`${base}.nom_point`}
                                            register={register(`${base}.nom_point` as any, { required: false })}
                                            disabled={fieldDisabled || !irSet}
                                            valueWatch={watch(`${base}.nom_point` as any) || ""}
                                            handleChange={(e) => {
                                                setValue(`${base}.nom_point` as any, e.target.value);
                                                setValue(`${base}.shipper` as any, []);
                                                clearErrors(`${base}.nom_point` as any);
                                            }}
                                            errors={(errors as any)?.doc6_extra_blocks?.[index]?.nom_point}
                                            errorsText={"Select Point"}
                                            options={dataNomPointForDoc6}
                                            optionsKey={"id"}
                                            optionsValue={"id"}
                                            optionsText={"nomination_point"}
                                            optionsResult={"nomination_point"}
                                            placeholder={"Select Point"}
                                            pathFilter={"nomination_point"}
                                        />
                                    </div>
                                    <div className="flex flex-wrap flex-auto ">
                                        <label className={`${labelClass} `}>{`คิดเป็นปริมาณ (MMSCFH)`}</label>
                                        <NumericFormat
                                            placeholder="0.0000"
                                            value={watch(`${base}.nom_value_mmscfh` as any)}
                                            disabled={fieldDisabled || !irSet}
                                            className={`${inputClass} text-right ${(mode === "view" || isShipper) && "!bg-[#EFECEC]"}`}
                                            thousandSeparator
                                            decimalScale={4}
                                            fixedDecimalScale
                                            allowNegative={false}
                                            displayType="input"
                                            onValueChange={(values) => {
                                                setValue(`${base}.nom_value_mmscfh` as any, values.value, {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-wrap flex-auto">
                                        <label className={`${labelClass}`}>{`Shipper`}</label>
                                        <Select
                                            multiple
                                            IconComponent={(props) => <ExpandMoreIcon {...props} fontSize="medium" />}
                                            disabled={fieldDisabled || !irSet || !watch(`${base}.nom_point` as any)}
                                            value={shipperVals}
                                            onChange={(e: any) => {
                                                const raw = e.target.value as unknown[];
                                                if (raw.includes("all")) {
                                                    const pickedOptional = shipperStored.filter((id) => optionalIds.includes(id));
                                                    const allOptionalPicked =
                                                        optionalIds.length > 0 && pickedOptional.length === optionalIds.length;
                                                    setValue(
                                                        `${base}.shipper` as any,
                                                        allOptionalPicked ? [...defaultIds] : [...defaultIds, ...optionalIds],
                                                    );
                                                    return;
                                                }
                                                const next = (raw.filter((x) => x !== "all") as number[]).map((x) =>
                                                    typeof x === "string" ? parseInt(String(x), 10) : x,
                                                );
                                                setValue(`${base}.shipper` as any, Array.from(new Set(next)));
                                            }}
                                            className={`${selectboxClass} ${mode === "view" && "!bg-[#EFECEC]"}`}
                                            sx={selectSx}
                                            displayEmpty
                                            renderValue={(selected) => {
                                                const sel = selected as number[];
                                                if (!sel?.length) {
                                                    return (
                                                        <Typography color="#9CA3AF" fontSize={14}>
                                                            Select Shipper Name
                                                        </Typography>
                                                    );
                                                }
                                                const optionalList = list.filter((item) => !defaultIds.includes(item.id));
                                                const pickedOptional = sel.filter((id) => optionalIds.includes(id));
                                                const showSelectAllLabel =
                                                    optionalList.length > 0 && pickedOptional.length === optionalList.length;
                                                return (
                                                    <span className="pl-[10px] text-[14px]">
                                                        {showSelectAllLabel
                                                            ? `Select All`
                                                            : sel
                                                                  .map((id) => list.find((item: any) => item.id === id)?.name)
                                                                  .filter(Boolean)
                                                                  .join(", ")}
                                                    </span>
                                                );
                                            }}
                                            MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8 } } }}
                                        >
                                            {(userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && (
                                                <MenuItem value="all">
                                                    <Checkbox
                                                        checked={
                                                            optionalIds.length > 0 &&
                                                            optionalIds.every((id) => shipperStored.includes(id))
                                                        }
                                                    />
                                                    <ListItemText primary="Select All" primaryTypographyProps={{ sx: { fontWeight: "bold" } }} />
                                                </MenuItem>
                                            )}
                                            {list
                                                .filter((item: any) => !defaultIds?.includes(item.id))
                                                .sort((a: any, b: any) => (a?.name || "").localeCompare(b?.name || ""))
                                                .map((item: any) => (
                                                    <MenuItem key={item.id} value={item.id}>
                                                        <Checkbox checked={shipperVals.includes(item.id)} />
                                                        <ListItemText primary={item.name} />
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {irSet && (
                                <>
                                    <div className="gap-2 w-full flex items-center">
                                        <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div>
                                        <div className="grid grid-cols-3 w-full gap-4">
                                            <div></div>
                                            <div></div>
                                            <div className="w-full flex flex-wrap items-end justify-end gap-4">
                                                <div className="flex flex-wrap gap-2 pt-2 mt-2 w-full max-h-[120px] overflow-y-auto">
                                                    {defaultNames.map((item: any, i: number) => (
                                                        <div
                                                            key={`def-${field.id}-${i}`}
                                                            className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                        >
                                                            {item?.name}
                                                        </div>
                                                    ))}
                                                    {selectedNames.map((item: any, i: number) => (
                                                        <div
                                                            key={`sel-${field.id}-${i}`}
                                                            className="relative w-fit h-[40px] p-2 text-[13px] bg-[#CFF2FF] border border-[#DFE4EA] rounded-[6px] text-[#58585A] break-all"
                                                        >
                                                            {item?.name}
                                                            {!fieldDisabled && (
                                                                <button
                                                                    type="button"
                                                                    className="absolute top-[-6px] right-[-4px] w-[15px] h-[15px] rounded-full bg-[#58585A] text-white flex justify-center items-center text-[8px]"
                                                                    onClick={() => {
                                                                        setValue(
                                                                            `${base}.shipper` as any,
                                                                            shipperStored.filter((id) => id !== item.id),
                                                                        );
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

                                    <div className="gap-2 w-full flex items-center pt-4">
                                        <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div>
                                        <div className="grid grid-cols-2 w-full gap-4">
                                            <div>
                                                <label htmlFor={`${base}-gas_command`} className={labelClass}>{`การสั่งการ`}</label>
                                                <input
                                                    id={`${base}-gas_command`}
                                                    type="text"
                                                    placeholder="รายละเอียด"
                                                    readOnly={fieldDisabled || !irSet}
                                                    {...register(`${base}.gas_command` as any, { required: false })}
                                                    onChange={(e) => {
                                                        if (e.target.value.length <= 255) {
                                                            setValue(`${base}.gas_command` as any, e.target.value);
                                                        }
                                                    }}
                                                    maxLength={255}
                                                    className={`${inputClass} ${mode === "view" && "!bg-[#EFECEC]"}`}
                                                />
                                                <div className="flex justify-end text-sm text-[#B6B6B6] mt-1">
                                                    <span className="text-[13px]">
                                                        {watch(`${base}.gas_command` as any)?.length || 0} / 255
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor={`${base}-gas_more`} className={labelClass}>{`ข้อมูลเพิ่มเติม`}</label>
                                                <input
                                                    id={`${base}-gas_more`}
                                                    type="text"
                                                    placeholder="รายละเอียด"
                                                    readOnly={fieldDisabled || !irSet}
                                                    {...register(`${base}.gas_more` as any, { required: false })}
                                                    onChange={(e) => {
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

                                    <div className="gap-2 w-full flex items-center ">
                                        <div className="grid grid-cols-2 gap-1 pt-4">
                                            <label className="w-[100px] text-[#58585A]"></label>
                                            <label className="w-[100px] text-[#58585A]"></label>
                                        </div>

                                        {(() => {
                                            const newUrl = String(watch(`${base}.fileUrl` as any) ?? "").trim();
                                            const persistedUrl = String(watch(`${base}.persistedFileUrl` as any) ?? "").trim();
                                            const dlUrl = newUrl || persistedUrl;
                                            const showDownload =
                                                (mode === "view" || mode === "edit") && !!dlUrl;
                                            return (
                                                <>
                                                    {showDownload && (
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
                                                    )}

                                                    {(userDT?.account_manage?.[0]?.user_type_id !== 3 && userDT?.account_manage?.[0]?.user_type_id !== 4) && mode !== "view" && (
                                                        <div className="grid grid-cols-2 w-full">
                                                            <label className={`${labelClass}`}>{`File`}</label>
                                                            <div
                                                                className={`flex items-center col-span-2 ${fileErrIdx === index ? "border border-[#ff0000] rounded-r-lg rounded-l-lg" : ""}`}
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
                                                            <div className="w-full flex items-center justify-between text-[14px] text-red-500 ">
                                                                {fileErrIdx === index && "The file is larger than 10 MB."}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
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

export default Doc6ExtraGasFieldArray;
