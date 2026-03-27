/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useCallback } from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, Position } from "@xyflow/react";
import { useSchemaStore, type Relation } from "@/store/useSchemaStore";
import { X } from "lucide-react";

type CustomEdgeProps = EdgeProps & {
  data?: {
    relation: Relation;
  };
};

// ── Static geometry (hoisted — zero allocation per render) ──────

const MARK_OFFSET = 16;

function OneMarker({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <line x1={0} y1={-6} x2={0} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={-5} y1={-6} x2={-5} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

function ManyMarker({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <line x1={-9} y1={0} x2={0} y2={-7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={-9} y1={0} x2={0} y2={0} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={-9} y1={0} x2={0} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={0} y1={-7} x2={0} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

function angleFromPosition(pos: Position): number {
  switch (pos) {
    case Position.Right:  return 0;
    case Position.Left:   return 180;
    case Position.Bottom: return 90;
    case Position.Top:    return -90;
    default:              return 0;
  }
}

function offsetXY(pos: Position, dist: number) {
  switch (pos) {
    case Position.Right:  return { dx: dist,  dy: 0 };
    case Position.Left:   return { dx: -dist, dy: 0 };
    case Position.Bottom: return { dx: 0,     dy: dist };
    case Position.Top:    return { dx: 0,     dy: -dist };
    default:              return { dx: dist,  dy: 0 };
  }
}

function typeClasses(type: Relation["type"]) {
  switch (type) {
    case "1:1":
      return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300";
    case "1:n":
      return "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300";
    case "m:n":
      return "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800/60 text-violet-700 dark:text-violet-300";
  }
}

const MARK_COLOR = "#a1a1aa";
const MARK_COLOR_SELECTED = "#ef4444";

// ─────────────────────────────────────────────────────────────────
// PERF: Use individual selectors for the two action functions.
// These are stable references — they NEVER change after store
// creation, so this component won't re-render from unrelated
// store mutations (column edits, position updates, etc.).
// ─────────────────────────────────────────────────────────────────

export function RelationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}: CustomEdgeProps) {
  // Individual selectors — stable function refs, no re-render
  const updateRelation = useSchemaStore((s) => s.updateRelation);
  const removeRelation = useSchemaStore((s) => s.removeRelation);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  if (!data?.relation) return null;

  const relType = data.relation.type;
  const relId = data.relation.id;

  const handleToggleType = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const next = relType === "1:n" ? "m:n" : relType === "m:n" ? "1:1" : "1:n";
      updateRelation(relId, next);
    },
    [relType, relId, updateRelation],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      removeRelation(relId);
    },
    [relId, removeRelation],
  );

  // ── Notation positions ──────────────────────────────────────
  const srcOff = offsetXY(sourcePosition, MARK_OFFSET);
  const tgtOff = offsetXY(targetPosition, MARK_OFFSET);
  const srcAngle = angleFromPosition(sourcePosition);
  const tgtAngle = angleFromPosition(targetPosition);
  const markColor = selected ? MARK_COLOR_SELECTED : MARK_COLOR;

  const sourceIsMany = relType === "m:n";
  const targetIsMany = relType === "1:n" || relType === "m:n";

  const SourceNotation = sourceIsMany ? ManyMarker : OneMarker;
  const TargetNotation = targetIsMany ? ManyMarker : OneMarker;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      <SourceNotation
        x={sourceX + srcOff.dx}
        y={sourceY + srcOff.dy}
        angle={srcAngle}
        color={markColor}
      />
      <TargetNotation
        x={targetX + tgtOff.dx}
        y={targetY + tgtOff.dy}
        angle={tgtAngle}
        color={markColor}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan z-50 flex items-center border rounded-full shadow-sm overflow-hidden backdrop-blur-sm"
        >
          <button
            onClick={handleToggleType}
            title="Change relationship type"
            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors hover:brightness-95 active:scale-95 border-r ${typeClasses(relType)}`}
          >
            {relType}
          </button>

          <button
            onClick={handleDelete}
            title="Delete relationship"
            className="p-1 bg-white dark:bg-zinc-900 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}