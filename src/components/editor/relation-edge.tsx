"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath, Position } from "@xyflow/react";
import { useSchemaStore, Relation } from "@/store/useSchemaStore";
import { X } from "lucide-react";

type CustomEdgeProps = EdgeProps & {
  data?: {
    relation: Relation;
  };
};

// ── Notation geometry ───────────────────────────────────────────
// Shapes are drawn facing RIGHT (0°), then rotated via the
// source/target Position to face outward from the node.

const MARK_OFFSET = 16; // px from handle center along edge direction

/** Perpendicular double-bar indicating "one" */
function OneMarker({ x, y, angle, color }: { x: number; y: number; angle: number; color: string }) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <line x1={0} y1={-6} x2={0} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <line x1={-5} y1={-6} x2={-5} y2={6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

/** Crow's foot (three prongs + vertical bar) indicating "many" */
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

function offsetFromPosition(pos: Position, dist: number) {
  switch (pos) {
    case Position.Right:  return { dx: dist,  dy: 0 };
    case Position.Left:   return { dx: -dist, dy: 0 };
    case Position.Bottom: return { dx: 0,     dy: dist };
    case Position.Top:    return { dx: 0,     dy: -dist };
    default:              return { dx: dist,  dy: 0 };
  }
}

// ── Label color per type ────────────────────────────────────────
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

const MARK_COLOR = "#a1a1aa";          // zinc-400
const MARK_COLOR_SELECTED = "#ef4444"; // red-500

// ─────────────────────────────────────────────────────────────────
// Component — direct function export (not memo-wrapped) to match
// React Flow's edge type registry expectations.
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
  const { updateRelation, removeRelation } = useSchemaStore();

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  if (!data?.relation) return null;

  const relType = data.relation.type;

  // Cycle through the relationship types
  const handleToggleType = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextType = relType === "1:n" ? "m:n" : relType === "m:n" ? "1:1" : "1:n";
    updateRelation(data.relation.id, nextType);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeRelation(data.relation.id);
  };

  // ── Notation positions ──────────────────────────────────────
  const srcOff = offsetFromPosition(sourcePosition, MARK_OFFSET);
  const tgtOff = offsetFromPosition(targetPosition, MARK_OFFSET);

  const srcAngle = angleFromPosition(sourcePosition);
  const tgtAngle = angleFromPosition(targetPosition);

  const markColor = selected ? MARK_COLOR_SELECTED : MARK_COLOR;

  // "1:1" → one  / one
  // "1:n" → one  / many
  // "m:n" → many / many
  const sourceIsMany = relType === "m:n";
  const targetIsMany = relType === "1:n" || relType === "m:n";

  const SourceNotation = sourceIsMany ? ManyMarker : OneMarker;
  const TargetNotation = targetIsMany ? ManyMarker : OneMarker;

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />

      {/* ── Crow's foot / tee notation at each end ─────────── */}
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

      {/* ── Label with type toggle + delete ────────────────── */}
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