"use client";

import { BaseEdge, EdgeLabelRenderer, EdgeProps, getSmoothStepPath } from "@xyflow/react";
import { useSchemaStore, Relation } from "@/store/useSchemaStore";
import { X } from "lucide-react";

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
  const { updateRelation, removeRelation } = useSchemaStore();
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  if (!data?.relation) return null;

  // Cycle through the relationship types
  const handleToggleType = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering edge selection
    const current = data.relation.type;
    const nextType = current === "1:n" ? "m:n" : current === "m:n" ? "1:1" : "1:n";
    updateRelation(data.relation.id, nextType);
  };

  // Delete the relation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering edge selection
    removeRelation(data.relation.id);
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
            pointerEvents: "all", // CRITICAL: Makes the buttons clickable
          }}
          className="nodrag nopan z-50 flex items-center bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-full shadow-sm overflow-hidden"
        >
          <button
            onClick={handleToggleType}
            title="Change relationship type"
            className="px-2 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-blue-500 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 transition-colors"
          >
            {data.relation.type}
          </button>
          
          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
          
          <button
            onClick={handleDelete}
            title="Delete relationship"
            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}