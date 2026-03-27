"use client";

import { useMemo } from "react";
import type { TemplatePreviewData } from "@/data/template-metadata";

interface TemplatePreviewProps {
  preview: TemplatePreviewData | undefined;
  className?: string;
}

// ── Layout constants ──────────────────────────────────────────
const PAD = 16;
const TABLE_W = 56;
const TABLE_H = 32;
const HEADER_H = 10;
const VIEWBOX_W = 360;
const VIEWBOX_H = 160;

/**
 * Renders a lightweight SVG schematic of a template's table layout.
 * Positions are auto-normalized to fit the viewBox regardless of
 * the template's raw coordinate range.
 */
export function TemplatePreview({ preview, className }: TemplatePreviewProps) {
  const { tables: normalizedTables, relations } = useMemo(() => {
    if (!preview || preview.tables.length === 0) {
      return { tables: [], relations: [] };
    }

    const { tables, relations } = preview;

    // Find the bounding box of raw positions
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const t of tables) {
      if (t.x < minX) minX = t.x;
      if (t.y < minY) minY = t.y;
      if (t.x > maxX) maxX = t.x;
      if (t.y > maxY) maxY = t.y;
    }

    const rawW = maxX - minX || 1;
    const rawH = maxY - minY || 1;

    // Available space after padding and accounting for table size
    const availW = VIEWBOX_W - PAD * 2 - TABLE_W;
    const availH = VIEWBOX_H - PAD * 2 - TABLE_H;

    // Uniform scale to preserve aspect ratio
    const scale = Math.min(availW / rawW, availH / rawH);

    // Center offset
    const scaledW = rawW * scale;
    const scaledH = rawH * scale;
    const offsetX = PAD + (availW - scaledW) / 2;
    const offsetY = PAD + (availH - scaledH) / 2;

    const normalized = tables.map((t) => ({
      name: t.name,
      x: offsetX + (t.x - minX) * scale,
      y: offsetY + (t.y - minY) * scale,
    }));

    return { tables: normalized, relations };
  }, [preview]);

  if (!preview || normalizedTables.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Arrowhead marker */}
        <marker
          id="preview-arrow"
          viewBox="0 0 6 6"
          refX="6"
          refY="3"
          markerWidth="5"
          markerHeight="5"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 6 3 L 0 6 z"
            className="fill-zinc-300 dark:fill-zinc-600"
          />
        </marker>
      </defs>

      {/* Relation edges — drawn first so tables sit on top */}
      {relations.map(([fromIdx, toIdx], i) => {
        const from = normalizedTables[fromIdx];
        const to = normalizedTables[toIdx];
        if (!from || !to) return null;

        // Center points of each table rect
        const x1 = from.x + TABLE_W / 2;
        const y1 = from.y + TABLE_H / 2;
        const x2 = to.x + TABLE_W / 2;
        const y2 = to.y + TABLE_H / 2;

        // Simple bezier with a slight curve
        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx1 = x1 + dx * 0.4;
        const cy1 = y1;
        const cx2 = x2 - dx * 0.4;
        const cy2 = y2;

        return (
          <path
            key={`rel-${i}`}
            d={`M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`}
            fill="none"
            strokeWidth="1"
            markerEnd="url(#preview-arrow)"
            className="stroke-zinc-300 dark:stroke-zinc-700"
          />
        );
      })}

      {/* Table nodes */}
      {normalizedTables.map((t, i) => (
        <g key={i}>
          {/* Card body */}
          <rect
            x={t.x}
            y={t.y}
            width={TABLE_W}
            height={TABLE_H}
            rx={4}
            ry={4}
            className="fill-white dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-700"
            strokeWidth="1"
          />
          {/* Header bar */}
          <rect
            x={t.x}
            y={t.y}
            width={TABLE_W}
            height={HEADER_H}
            rx={4}
            ry={4}
            className="fill-zinc-100 dark:fill-zinc-800"
          />
          {/* Square off bottom corners of header */}
          <rect
            x={t.x}
            y={t.y + HEADER_H - 4}
            width={TABLE_W}
            height={4}
            className="fill-zinc-100 dark:fill-zinc-800"
          />
          {/* Header divider line */}
          <line
            x1={t.x}
            y1={t.y + HEADER_H}
            x2={t.x + TABLE_W}
            y2={t.y + HEADER_H}
            strokeWidth="0.5"
            className="stroke-zinc-200 dark:stroke-zinc-700"
          />
          {/* Table name label */}
          <text
            x={t.x + TABLE_W / 2}
            y={t.y + HEADER_H + (TABLE_H - HEADER_H) / 2 + 3.5}
            textAnchor="middle"
            className="fill-zinc-600 dark:fill-zinc-400"
            style={{ fontSize: "6px", fontWeight: 600, fontFamily: "system-ui, sans-serif" }}
          >
            {t.name.length > 10 ? t.name.slice(0, 9) + "…" : t.name}
          </text>
        </g>
      ))}
    </svg>
  );
}