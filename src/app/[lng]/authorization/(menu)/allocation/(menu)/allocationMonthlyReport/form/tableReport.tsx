import React, { useCallback, useEffect, useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import NodataTable from "@/components/other/nodataTable";
import TableSkeleton from "@/components/material_custom/DefaultSkeleton";
import { formatNumberFourDecimal, getContrastTextColor, toDayjs } from "@/utils/generalFormatter";
import { table_col_arrow_sort_style, table_header_style, table_row_style, table_sort_header_style } from "@/utils/styles";

type DailyVal = { date: string; value: number };
type PointRow = {
    point: string;
    customer_type: string;
    data: DailyVal[];
    // ถ้ามี contract ในอนาคตค่อยเพิ่ม
    contract_code?: string;
};
type ShipperRow = {
    shipperId: string;
    shipperName: string;
    data: PointRow[];
    total?: DailyVal[];
};
type AreaGroup = { area: string; shipperData: ShipperRow[] };

type AllocMonthlyReport = {
    headDate: string[]; // "YYYY-MM-DD"
    areaShipperData: AreaGroup[];
};

type TableProps = {
    openViewForm?: any;
    tableData: any;
    isLoading: boolean;
    columnVisibility: Record<string, boolean>; // มี key "point","type","area" และ DD/MM/YYYY
    userPermission?: any;
    areaMaster?: any;
};

export const TableReport: React.FC<TableProps> = ({
    tableData,
    isLoading,
    columnVisibility,
    areaMaster,
}) => {

    // expand เร็ว: ใช้ Set
    const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());

    const toggleExpandArea = useCallback((area: string) => {
        setExpandedAreas((prev) => {
            const next = new Set(prev);
            next.has(area) ? next.delete(area) : next.add(area);
            return next;
        });
    }, []);

    // ----- SORTING -----
    const [sortState, setSortState] = useState<{ column: string | null; direction: "asc" | "desc" | null }>({
        column: null,
        direction: null,
    });

    const getArrowIcon = (column: string) => (
        <div className={`${table_col_arrow_sort_style}`}>
            <ArrowDropUpIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "asc" ? 1 : 0.4 }} />
            <ArrowDropDownIcon sx={{ fontSize: 18, opacity: sortState.column === column && sortState.direction === "desc" ? 1 : 0.4 }} />
        </div>
    );

    const [detailSort, setDetailSort] = useState<{ column: string | null; direction: "asc" | "desc" | null; }>({
        column: null,
        direction: null,
    });

    const handleDetailSort = (iso: string) => {
        setDetailSort(prev => {
            if (prev.column !== iso) {
                return { column: iso, direction: "asc" };
            }

            if (prev.direction === "asc") {
                return { column: iso, direction: "desc" };
            }

            return { column: null, direction: null };
        });


        setSortState(prev => {
            if (prev.column !== iso) {
                return { column: iso, direction: "asc" };
            }

            if (prev.direction === "asc") {
                return { column: iso, direction: "desc" };
            }

            return { column: null, direction: null };
        });

    };


    const normalizeDisplayKey = (s: any) =>
        String(s ?? "")
            .trim()
            .replace(/\s+/g, "") // เอาช่องว่างแทรกออก (กัน "01/ 02 /2026")
            .replace(/-/g, "/"); // กันบางคนส่ง 01-02-2026


    const normalizeToDDMMYYYY = (s: any) => {
        const raw = String(s ?? "").trim();
        if (!raw) return "";

        // ถ้าเป็น ISO -> แปลง
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
            return toDayjs(raw, "YYYY-MM-DD").format("DD/MM/YYYY");
        }

        // ถ้าเป็น DD/MM/YYYY หรือ D/M/YYYY -> pad ให้ชัวร์
        // ใช้ strict parse หลาย pattern
        const d = toDayjs(raw, "DD/MM/YYYY", true);
        return d.isValid() ? d.format("DD/MM/YYYY") : normalizeDisplayKey(raw);
    };

    // ----- 1) เตรียม date columns ตาม columnVisibility (ถ้าเปิด/ปิดได้)
    // columnVisibility dateKey ของนายเป็น "DD/MM/YYYY"
    // แต่ headDate เป็น "YYYY-MM-DD" -> เราทำ map iso->display ไว้
    const headDates = tableData?.headDate ?? [];
    const isoToDisplay = useMemo(() => {
        const m = new Map<string, string>();
        headDates.forEach((iso: any) => {
            // toDayjs(iso, "YYYY-MM-DD").format("DD/MM/YYYY")
            const display = toDayjs(iso, "YYYY-MM-DD").format("DD/MM/YYYY");
            m.set(iso, display);
        });
        return m;
    }, [headDates]);

    const displayToIso = useMemo(() => {
        const m = new Map<string, string>();
        headDates.forEach((iso: any) => {
            const display = isoToDisplay.get(iso); // DD/MM/YYYY
            if (!display) return;
            m.set(normalizeToDDMMYYYY(display), iso);
        });
        return m;
    }, [headDates, isoToDisplay]);

    const visibleDateDisplayKeys = useMemo(() => {
        const candidates = Object.entries(columnVisibility).filter(([k, v]) => v && !["nomination_point", "contract_code", "shipper_name", "point", "type", "area"].includes(k)).map(([k]) => normalizeToDDMMYYYY(k));

        if (candidates.length > 0) return candidates;

        // fallback จาก headDate
        return headDates.map((iso: any) => isoToDisplay.get(iso)).filter(Boolean).map((d: any) => normalizeToDDMMYYYY(d));
    }, [columnVisibility, headDates, isoToDisplay]);

    const visibleDateIsoKeys = useMemo(() => {
        const visible_date_ = visibleDateDisplayKeys.map((d: any) => displayToIso.get(normalizeToDDMMYYYY(d))).filter((x: any): x is string => !!x);

        return visible_date_;
    }, [visibleDateDisplayKeys, displayToIso]);

    // ----- 2) Precompute ทุกอย่างให้ lookup O(1) (กัน lag ตอน expand)
    // key patterns:
    // areaTotal: `${area}|${dateIso}`
    // pointShipper: `${area}|${point}|${shipperId}|${dateIso}`
    // shipperTotal (ต่อ point ต่อ shipper): `${area}|${point}|${shipperId}|TOTAL|${dateIso}`
    // pointTotal: `${area}|${point}|TOTAL|${dateIso}`
    const computed = useMemo(() => {
        const areaTotalMap = new Map<string, number>();
        const pointShipperMap = new Map<string, number>();
        const shipperTotalMap = new Map<string, number>();
        const pointTotalMap = new Map<string, number>();

        // เก็บชุดของ point ที่อยู่ใน area (เพื่อ render)
        const areaPointIndex = new Map<string, Set<string>>();
        // เก็บว่า point นี้มี shipper ไหนบ้าง + meta
        const areaPointShippers = new Map<
            string,
            Map<
                string,
                { shipperId: string; shipperName: string; customerType: string; contractCode: string }
            >
        >();

        const areaShipperData = tableData?.areaShipperData ?? [];

        for (const areaGroup of areaShipperData) {
            const area = areaGroup.area;

            if (!areaPointIndex.has(area)) areaPointIndex.set(area, new Set());
            if (!areaPointShippers.has(area)) areaPointShippers.set(area, new Map());

            for (const ship of areaGroup.shipperData ?? []) {
                const shipperId = ship.shipperId;
                const shipperName = ship.shipperName;

                for (const pt of ship.data ?? []) {
                    const point = pt.point;
                    const customerType = pt.customer_type ?? "";
                    const contractCode = pt.contract_code ?? "-";

                    areaPointIndex.get(area)!.add(point);

                    // map shipper meta ต่อ point
                    const shipperKey = `${area}|${point}|${shipperId}`;
                    const metaMap = areaPointShippers.get(area)!;
                    if (!metaMap.has(shipperKey)) {
                        metaMap.set(shipperKey, { shipperId, shipperName, customerType, contractCode });
                    }

                    // values per date
                    for (const dv of pt.data ?? []) {
                        const dateIso = dv.date;
                        const val = Number(dv.value ?? 0);

                        // detail cell (point+shipper)
                        pointShipperMap.set(`${area}|${point}|${shipperId}|${dateIso}`, val);

                        // shipper total ต่อ point
                        const stKey = `${area}|${point}|${shipperId}|TOTAL|${dateIso}`;
                        shipperTotalMap.set(stKey, (shipperTotalMap.get(stKey) ?? 0) + val);

                        // point total รวมทุก shipper
                        const ptKey = `${area}|${point}|TOTAL|${dateIso}`;
                        pointTotalMap.set(ptKey, (pointTotalMap.get(ptKey) ?? 0) + val);

                        // area total
                        const aKey = `${area}|${dateIso}`;
                        areaTotalMap.set(aKey, (areaTotalMap.get(aKey) ?? 0) + val);
                    }
                }
            }
        }

        return { areaTotalMap, pointShipperMap, shipperTotalMap, pointTotalMap, areaPointIndex, areaPointShippers };
    }, [tableData]);

    // ----- 3) เตรียม UI helper area badge เหมือนเดิม
    const renderAreaBadge = useCallback(
        (area: string) => {
            const filter_area = areaMaster?.data?.find((item: any) => item.name === area);
            if (!filter_area) return <div className="text-center">{area}</div>;

            const commonStyle: React.CSSProperties = {
                backgroundColor: filter_area?.color,
                width: "35px",
                height: "35px",
                color: getContrastTextColor(filter_area?.color),
            };

            if (filter_area?.entry_exit_id == 2) {
                return (
                    <div className="flex justify-center items-center rounded-full p-1" style={commonStyle}>
                        {filter_area?.name}
                    </div>
                );
            }

            if (filter_area?.entry_exit_id == 1) {
                return (
                    <div className="flex justify-center items-center rounded-lg p-1" style={commonStyle}>
                        {filter_area?.name}
                    </div>
                );
            }

            return <div className="text-center">{area}</div>;
        },
        [areaMaster]
    );

    // ----- 4) Render table
    const areaShipperData = tableData?.areaShipperData ?? [];

    // ---- หา contract code
    const contractByShipperId = useMemo(() => {
        const m = new Map<string, string[]>();

        (tableData?.data ?? []).forEach((r: any) => {
            const shipperId = String(r?.shipperId ?? "").trim();
            const contract = String(r?.contract ?? "").trim();

            // กัน row พิเศษ เช่น Summary หรือไม่มี shipperId/contract
            if (!shipperId || !contract || contract.toLowerCase() === "summary") return;

            const prev = m.get(shipperId) ?? [];
            if (!prev.includes(contract)) prev.push(contract);
            m.set(shipperId, prev);
        });

        return m;
    }, [tableData?.data]);

    // ---- หา contract code ที่ match กับ shipper
    const computedContracts: any = useMemo(() => {
        const contractByShipperAreaPoint = new Map<string, string[]>(); // shipper|area|point -> [contract...]
        const contractValueMap = new Map<string, number>();             // contract|shipper|area|point|iso -> value

        const pushContract = (key: string, contract: string) => {
            const prev = contractByShipperAreaPoint.get(key) ?? [];
            if (!prev.includes(contract)) contractByShipperAreaPoint.set(key, [...prev, contract]);
        };

        (tableData?.data ?? []).forEach((c: any) => {
            const contract = c?.contract;
            const shipperId = String(c?.shipperId ?? "").trim();

            if (!contract || contract === "Summary" || !shipperId) return;

            (c?.data ?? []).forEach((areaObj: any) => {
                const area = String(areaObj?.area ?? "").trim();

                (areaObj?.data ?? []).forEach((pt: any) => {
                    const point = String(pt?.point ?? "").trim();

                    // 1) map: shipper|area|point -> contracts
                    pushContract(`${shipperId}|${area}|${point}`, contract);

                    // 2) map: contract|shipper|area|point|iso -> value
                    (pt?.data ?? []).forEach((d: any) => {
                        const iso = String(d?.date ?? "").trim(); // "YYYY-MM-DD"
                        const v = d?.value;

                        if (!iso) return;
                        if (v == null) return;

                        contractValueMap.set(`${contract}|${shipperId}|${area}|${point}|${iso}`, Number(v));
                    });
                });
            });
        });

        return { contractByShipperAreaPoint, contractValueMap };
    }, [tableData]);


    const sortedContractsMap = useMemo(() => {
        const out = new Map<string, string[]>();

        // contractByShipperAreaPoint: Map<"shipperId|area|point", string[]>
        for (const [k, contracts] of computedContracts.contractByShipperAreaPoint.entries()) {
            const arr = [...(contracts ?? [])];

            if (detailSort.column && detailSort.direction) {
                // 👇 ถ้าเป็น contract sort
                if (detailSort.column === "contract") {
                    arr.sort((a, b) =>
                        detailSort.direction === "asc"
                            ? a.localeCompare(b)
                            : b.localeCompare(a)
                    );
                } else {
                    // 👇 sort ด้วย date iso
                    const iso = detailSort.column; // YYYY-MM-DD

                    // ต้อง parse key เพื่อดึง shipperId/area/point ออกมา
                    const [shipperId, area, point] = k.split("|");

                    arr.sort((a, b) => {
                        const valA =
                            computedContracts.contractValueMap.get(
                                `${a}|${shipperId}|${area}|${point}|${iso}`
                            ) ?? -Infinity;

                        const valB =
                            computedContracts.contractValueMap.get(
                                `${b}|${shipperId}|${area}|${point}|${iso}`
                            ) ?? -Infinity;

                        return detailSort.direction === "asc" ? valA - valB : valB - valA;
                    });
                }
            }

            out.set(k, arr);
        }

        return out;
    }, [computedContracts, detailSort]);

    return (
        <div className="h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto rounded-t-md">
            {isLoading ? (
                <table className="table-auto min-w-full text-sm rtl:text-right text-gray-500 whitespace-nowrap">
                    <thead className="text-xs text-[#ffffff] bg-[#1473A1] sticky top-0 z-10">
                        <tr className="h-9">
                            <th className="px-2 py-1 text-left">{``}</th>

                            {columnVisibility.nomination_point && (
                                <th className={`${table_header_style} min-w-[160px] text-center`} >
                                    {`Nomination Point`}
                                </th>
                            )}

                            {columnVisibility.shipper_name && (
                                <th className={`${table_header_style} min-w-[160px] text-center`}>
                                    {`Shipper Name`}
                                </th>
                            )}

                            {columnVisibility.contract_code && (
                                <th className={`${table_sort_header_style} min-w-[160px] text-center`} onClick={() => handleDetailSort("contract")}>
                                    {`Contract Code`}
                                    {getArrowIcon("contract")}
                                </th>
                            )}

                            {columnVisibility.type && (
                                <th className={`${table_header_style} min-w-[120px] text-center`}>
                                    {`Type`}
                                </th>
                            )}

                            {columnVisibility.area && (
                                <th className={`${table_header_style} min-w-[120px] text-center`}>
                                    {`Area`}
                                </th>
                            )}

                            {visibleDateDisplayKeys.map((d: any) => {
                                const iso: any = displayToIso.get(d); // แปลง DD/MM/YYYY -> YYYY-MM-DD

                                return (
                                    <th key={d} className={`${table_sort_header_style} text-right min-w-[120px]`} onClick={() => handleDetailSort(iso)}>
                                        {d}
                                        {getArrowIcon(iso)}
                                    </th>
                                )
                            }
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {areaShipperData?.map((ag: any) => {
                            const area = ag.area;
                            const isExpanded = expandedAreas.has(area);

                            // point list ใน area (sort ตามชื่อ)
                            const points = Array.from(computed.areaPointIndex.get(area) ?? []).sort((a, b) => a.localeCompare(b));

                            return (
                                <React.Fragment key={area}>
                                    {/* ----- GREEN ROW: Total Area ----- */}
                                    <tr className={`${table_row_style} !bg-[#E8FFEE] cursor-pointer`} onClick={() => toggleExpandArea(area)}>
                                        <td className="px-2 py-1 text-[#06522E] font-bold">
                                            {isExpanded ? (
                                                <ExpandLessIcon sx={{ fontSize: "25px", color: "#06522E" }} />
                                            ) : (
                                                <ExpandMoreIcon sx={{ fontSize: "25px", color: "#06522E" }} />
                                            )}
                                            {` Total Area`}
                                        </td>

                                        {columnVisibility.nomination_point && <td className="px-2 py-1 text-[#06522E] font-bold">{/* point blank */}</td>}
                                        {columnVisibility.shipper_name && <td className="px-2 py-1 text-[#06522E] font-bold">{/* shipper blank */}</td>}
                                        {columnVisibility.contract_code && <td className="px-2 py-1 text-[#06522E] font-bold">{/* contract blank */}</td>}
                                        {columnVisibility.type && <td className="px-2 py-1 text-[#06522E] font-bold">{/* type blank */}</td>}

                                        {columnVisibility.area && (
                                            <td className="px-2 py-1 text-[#06522E] font-bold">
                                                <div className="flex justify-center">{renderAreaBadge(area)}</div>
                                            </td>
                                        )}

                                        {visibleDateIsoKeys.map((iso: any) => {
                                            const sum = computed.areaTotalMap.get(`${area}|${iso}`) ?? 0;
                                            return (
                                                <td key={iso} className="px-2 py-1 text-[#06522E] font-bold text-right min-w-[120px]">
                                                    {formatNumberFourDecimal(sum)}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* ----- EXPANDED CONTENT ----- */}
                                    {isExpanded &&
                                        points.map((point) => {
                                            // หา shipper ที่มี point นี้
                                            const shipperMetaList = Array.from(computed.areaPointShippers.get(area)?.entries() ?? [])
                                                .filter(([k]) => k.startsWith(`${area}|${point}|`))
                                                .map(([_, meta]) => meta)
                                                .sort((a, b) => a.shipperName.localeCompare(b.shipperName));

                                            return (
                                                <React.Fragment key={`${area}_${point}`}>
                                                    {shipperMetaList.map((shipMeta) => {
                                                        const shipperId = shipMeta.shipperId;
                                                        // const contracts = contractByShipperId.get(String(shipMeta?.shipperId ?? "").trim()) ?? []; // เดิมโรงงาน

                                                        const contracts = computedContracts.contractByShipperAreaPoint.get(`${shipperId}|${area}|${point}`) ?? [];
                                                        // let sortedContracts = [...contracts];

                                                        const contractsKey = `${shipperId}|${area}|${point}`;
                                                        const sortedContracts = sortedContractsMap.get(contractsKey) ?? [];


                                                        if (detailSort.column && detailSort.direction) {
                                                            sortedContracts.sort((a, b) => {
                                                                const iso = detailSort.column; // YYYY-MM-DD
                                                                const valA =
                                                                    computedContracts.contractValueMap.get(
                                                                        `${a}|${shipperId}|${area}|${point}|${iso}`
                                                                    ) ?? -Infinity;

                                                                const valB =
                                                                    computedContracts.contractValueMap.get(
                                                                        `${b}|${shipperId}|${area}|${point}|${iso}`
                                                                    ) ?? -Infinity;

                                                                if (detailSort.direction === "asc") {
                                                                    return valA - valB;
                                                                }
                                                                return valB - valA;
                                                            });
                                                        }

                                                        // ----- NEW WHITE ROW: detail row (point + shipper) -----
                                                        const detailRows = contracts.length
                                                            // ? contracts.map((contractCode) => (
                                                            ? sortedContracts.map((contractCode) => (
                                                                <tr
                                                                    key={`${area}_${point}_${shipperId}_${contractCode}_detail`}
                                                                    className={`${table_row_style} bg-white`}
                                                                >
                                                                    <td className="px-2 py-1 text-[#464255]" />

                                                                    {columnVisibility.nomination_point && (
                                                                        <td className="px-2 py-1 text-[#464255]">
                                                                            <div className="font-medium">{point}</div>
                                                                        </td>
                                                                    )}

                                                                    {/* shipper */}
                                                                    {columnVisibility.shipper_name && (
                                                                        <td className="px-2 py-1 text-[#464255] text-center">{shipMeta.shipperName}</td>
                                                                    )}

                                                                    {/* contract code */}
                                                                    {columnVisibility.contract_code && (
                                                                        <td className="px-2 py-1 text-[#464255] whitespace-normal">
                                                                            <div className="font-medium">{contractCode}</div>
                                                                        </td>
                                                                    )}

                                                                    {columnVisibility.type && (
                                                                        <td className="px-2 py-1 text-[#464255] text-center">{shipMeta.customerType}</td>
                                                                    )}

                                                                    {columnVisibility.area && (
                                                                        <td className="px-2 py-1 text-[#464255] text-center">
                                                                            <div className="flex justify-center">{renderAreaBadge(area)}</div>
                                                                        </td>
                                                                    )}

                                                                    {visibleDateIsoKeys.map((iso: any) => {
                                                                        const v = computedContracts.contractValueMap.get(`${contractCode}|${shipperId}|${area}|${point}|${iso}`);

                                                                        return (
                                                                            <td key={iso} className="px-2 py-1 text-right text-[#464255] min-w-[120px]">
                                                                                {v != null ? formatNumberFourDecimal(v) : ""}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))
                                                            : [
                                                                <tr key={`${area}_${point}_${shipperId}_no_contract`} className={`${table_row_style} bg-white`}>
                                                                    <td className="px-2 py-1 text-[#464255]" />
                                                                    {columnVisibility.nomination_point && <td className="px-2 py-1 text-[#464255]"><div className="font-medium">{point}</div></td>}
                                                                    <td className="px-2 py-1 text-[#464255] text-center">{shipMeta.shipperName}</td>
                                                                    <td className="px-2 py-1 text-center">-</td>
                                                                    {columnVisibility.type && <td className="px-2 py-1 text-[#464255] text-center">{shipMeta.customerType}</td>}
                                                                    {columnVisibility.area && <td className="px-2 py-1 text-[#464255] text-center"><div className="flex justify-center">{renderAreaBadge(area)}</div></td>}
                                                                    {visibleDateIsoKeys.map((iso: any) => (
                                                                        <td key={iso} className="px-2 py-1 text-right text-[#464255] min-w-[120px]" />
                                                                    ))}
                                                                </tr>,
                                                            ];


                                                        // ----- BLUE ROW: Total Shipper (ต่อ shipper ใน point) -----
                                                        const shipperTotalRow = (
                                                            <tr
                                                                key={`${area}_${point}_${shipperId}_shipperTotal`}
                                                                className={`${table_row_style} !bg-[#EAF6FF]`}
                                                            >
                                                                <td className="px-2 py-1 text-[#234] font-bold">{`Total Shipper`}</td>

                                                                {columnVisibility.nomination_point && (
                                                                    <td className="px-2 py-1 text-[#234] font-bold">{point}</td>
                                                                )}

                                                                {columnVisibility.shipper_name && (
                                                                    <td className="px-2 py-1 text-[#234] font-bold text-center">{shipMeta.shipperName}</td>
                                                                )}

                                                                {columnVisibility.contract_code && (
                                                                    <td className="px-2 py-1 text-[#234] font-bold text-center">{/* contract blank */}</td>
                                                                )}

                                                                {columnVisibility.type && (
                                                                    <td className="px-2 py-1 text-[#234] font-bold text-center">{shipMeta.customerType}</td>
                                                                )}

                                                                {columnVisibility.area && (
                                                                    <td className="px-2 py-1 text-[#234] font-bold text-center">
                                                                        <div className="flex justify-center">{renderAreaBadge(area)}</div>
                                                                    </td>
                                                                )}

                                                                {visibleDateIsoKeys.map((iso: any) => {
                                                                    const sum = computed.shipperTotalMap.get(`${area}|${point}|${shipperId}|TOTAL|${iso}`) ?? 0;
                                                                    return (
                                                                        <td key={iso} className="px-2 py-1 text-right text-[#234] font-bold min-w-[120px]">
                                                                            {formatNumberFourDecimal(sum)}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );

                                                        return (
                                                            <React.Fragment key={`${area}_${point}_${shipperId}_block`}>
                                                                {/* {detailRow} */}
                                                                {detailRows}
                                                                {shipperTotalRow}
                                                            </React.Fragment>
                                                        );
                                                    })}

                                                    {/* ----- YELLOW ROW: Total Point (รวมทุก shipper ใน point) ----- */}
                                                    <tr key={`${area}_${point}_pointTotal`} className={`${table_row_style} !bg-[#FFF7D6] border-b-black border-b-2`}>
                                                        <td className="px-2 py-1 text-[#333] font-bold">{`Total Point`}</td>

                                                        {columnVisibility.nomination_point && (
                                                            <td className="px-2 py-1 text-[#333] font-bold">{point}</td>
                                                        )}

                                                        {columnVisibility.shipper_name && (
                                                            <td className="px-2 py-1 text-[#333] font-bold">{/* shipper blank */}</td>
                                                        )}

                                                        {columnVisibility.contract_code && (
                                                            <td className="px-2 py-1 text-[#333] font-bold">{/* contract blank */}</td>
                                                        )}

                                                        {columnVisibility.type && <td className="px-2 py-1 text-[#333] font-bold">{/* type blank */}</td>}

                                                        {columnVisibility.area && (
                                                            <td className="px-2 py-1 text-[#333] font-bold text-center">
                                                                <div className="flex justify-center">{renderAreaBadge(area)}</div>
                                                            </td>
                                                        )}

                                                        {visibleDateIsoKeys.map((iso: any) => {
                                                            const sum = computed.pointTotalMap.get(`${area}|${point}|TOTAL|${iso}`) ?? 0;
                                                            return (
                                                                <td key={iso} className="px-2 py-1 text-right text-[#333] font-bold min-w-[120px]">
                                                                    {formatNumberFourDecimal(sum)}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                </React.Fragment>
                                            );
                                        })}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <TableSkeleton />
            )}

            {isLoading && (!areaShipperData || areaShipperData.length === 0) && (
                <NodataTable textRender={"Please select filter to view the information."} />
            )}
        </div>
    );
};