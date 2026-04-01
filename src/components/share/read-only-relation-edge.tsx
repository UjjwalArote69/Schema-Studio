// ============================================================
// FILE: src/components/share/read-only-relation-edge.tsx
//
// Simplified relation edge for the public share viewer.
// Shows the type badge but no edit or delete controls.
// ============================================================

"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";
import type { Relation } from "@/store/useSchemaStore";

type CustomEdgeProps = EdgeProps & {
  data?: {
    relation: Relation;
  };
};

// ── Notation markers (same as the editable version) ──────────

const MARK_OFFSET = 16;
const MARK_COLOR = "#a1a1aa";

function OneMarker({
  x,
  y,
  angle,
}: {
  x: number;
  y: number;
  angle: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <line
        x1={0}
        y1={-6}
        x2={0}
        y2={6}
        stroke={MARK_COLOR}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <line
        x1={-5}
        y1={-6}
        x2={-5}
        y2={6}
        stroke={MARK_COLOR}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
  );
}

function ManyMarker({
  x,
  y,
  angle,
}: {
  x: number;
  y: number;
  angle: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${angle})`}>
      <line
        x1={-9}
        y1={0}
        x2={0}
        y2={-7}
        stroke={MARK_COLOR}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <line
        x1={-9}
        y1={0}
        x2={0}
        y2={0}
        stroke={MARK_COLOR}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <line
        x1={-9}
        y1={0}
        x2={0}
        y2={7}
        stroke={MARK_COLOR}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={-7}
        x2={0}
        y2={7}
        stroke={MARK_COLOR}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </g>
  );
}

function angleFromPosition(pos: Position): number {
  switch (pos) {
    case Position.Right:
      return 0;
    case Position.Left:
      return 180;
    case Position.Bottom:
      return 90;
    case Position.Top:
      return -90;
    default:
      return 0;
  }
}

function offsetXY(pos: Position, dist: number) {
  switch (pos) {
    case Position.Right:
      return { dx: dist, dy: 0 };
    case Position.Left:
      return { dx: -dist, dy: 0 };
    case Position.Bottom:
      return { dx: 0, dy: dist };
    case Position.Top:
      return { dx: 0, dy: -dist };
    default:
      return { dx: dist, dy: 0 };
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

export const ReadOnlyRelationEdge = memo(function ReadOnlyRelationEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
}: CustomEdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  if (!data?.relation) return null;

  const relType = data.relation.type;

  // Notation positions
  const srcOff = offsetXY(sourcePosition, MARK_OFFSET);
  const tgtOff = offsetXY(targetPosition, MARK_OFFSET);
  const srcAngle = angleFromPosition(sourcePosition);
  const tgtAngle = angleFromPosition(targetPosition);

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
      />
      <TargetNotation
        x={targetX + tgtOff.dx}
        y={targetY + tgtOff.dy}
        angle={tgtAngle}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "none",
          }}
          className="z-50"
        >
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-sm ${typeClasses(relType)}`}
          >
            {relType}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});