"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { useSchemaStore, Relation } from "@/store/useSchemaStore";

type CustomEdgeProps = EdgeProps & {
  data?: {
    relation: Relation;
  };
};

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
}: CustomEdgeProps) {
  const { updateRelation } = useSchemaStore();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  if (!data?.relation) return null;

  // Cycle through the relationship types
  const handleToggleType = () => {
    const current = data.relation.type;
    const nextType = current === "1:n" ? "m:n" : current === "m:n" ? "1:1" : "1:n";
    updateRelation(data.relation.id, nextType);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      
      {/* EdgeLabelRenderer allows us to put normal HTML/React elements over the SVG canvas */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all", // CRITICAL: Makes the button clickable
          }}
          className="nodrag nopan z-50"
        >
          <button
            onClick={handleToggleType}
            className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-500 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 rounded-full shadow-sm transition-all active:scale-95"
          >
            {data.relation.type}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}