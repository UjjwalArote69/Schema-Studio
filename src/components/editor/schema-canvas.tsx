"use client";

import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  SelectionMode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FloatingSidebar } from "@/components/editor/floating-sidebar";
import { EmptyState } from "@/components/editor/empty-state";
import { AIArchitect } from "@/components/editor/ai-architect";
import { ExportModal } from "@/components/editor/export-modal";
import { BulkActionsToolbar } from "@/components/editor/bulk-actions-toolbar";
import type { useSchemaEditor } from "@/hooks/useSchemaEditor";

type EditorReturn = ReturnType<typeof useSchemaEditor>;

interface SchemaCanvasProps {
  editor: EditorReturn;
  toolbar: React.ReactNode;
  isExportOpen: boolean;
  onExportClose: () => void;
  onImportSQL?: () => void;
  isReady?: boolean;
}

// ── Static objects hoisted out of the component ─────────────────
// React Flow shallow-compares these props. Creating new object
// literals inside JSX causes unnecessary internal recalculations.
const PRO_OPTIONS = { hideAttribution: true } as const;
const DEFAULT_EDGE_OPTIONS = { type: "relationEdge" } as const;

export function SchemaCanvas({
  editor,
  toolbar,
  isExportOpen,
  onExportClose,
  onImportSQL,
  isReady = true,
}: SchemaCanvasProps) {
  const {
    tables,
    relations,
    nodes,
    edges,
    nodeTypes,
    edgeTypes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeDragStart,
    onNodeDragStop,
    onEdgesDelete,
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    selectedNodeId,
    selectedNodeIds,
    removeTables,
    selectAll,
    clearSelection,
  } = editor;

  const overlay = !isReady ? null : tables.length === 0 ? (
    <EmptyState onImportSQL={onImportSQL} />
  ) : (
    <AIArchitect />
  );

  // PERF: Memoize the delete callback so BulkActionsToolbar
  // doesn't get a new onDelete prop on every render.
  const handleBulkDelete = useCallback(() => {
    removeTables(selectedNodeIds);
  }, [removeTables, selectedNodeIds]);

  // PERF: Memoize Controls className since it depends on selectedNodeId
  const controlsClassName = useMemo(
    () =>
      `shadow-lg border-none dark:text-black transition-all overflow-hidden rounded-md m-4 md:m-6 [&>button]:bg-white dark:[&>button]:bg-zinc-900 [&>button]:border-zinc-200 dark:[&>button]:border-zinc-800 hover:[&>button]:bg-zinc-50 dark:hover:[&>button]:bg-zinc-800 [&>button>svg]:fill-zinc-700 dark:[&>button>svg]:fill-zinc-300 ${
        selectedNodeId ? "mb-[65vh] md:mb-28" : "mb-24 md:mb-28"
      }`,
    [selectedNodeId],
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <style>{`
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #ef4444 !important;
          stroke-width: 3 !important;
          filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
        }

        .react-flow__nodesselection-rect,
        .react-flow__selection {
          background: rgba(59, 130, 246, 0.06) !important;
          border: 1.5px dashed rgba(59, 130, 246, 0.5) !important;
          border-radius: 8px !important;
        }

        @media (max-width: 768px) {
          .react-flow__handle {
            width: 12px !important;
            height: 12px !important;
          }
        }
      `}</style>

      {toolbar}

      <div className="flex-1 w-full relative overflow-hidden">
        {overlay}

        <BulkActionsToolbar
          selectedCount={selectedNodeIds.length}
          totalCount={tables.length}
          onDelete={handleBulkDelete}
          onSelectAll={selectAll}
          onDeselect={clearSelection}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          deleteKeyCode={null}
          fitView
          connectOnClick={true}
          selectionMode={SelectionMode.Partial}
          className="dark:bg-zinc-950 transition-colors duration-300"
          proOptions={PRO_OPTIONS}
          elevateNodesOnSelect
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        >
          <Background
            color="#a1a1aa"
            gap={24}
            size={1.5}
            className="opacity-40 dark:opacity-10"
          />
          <MiniMap
            position="top-right"
            zoomable
            pannable
            nodeBorderRadius={12}
            className="bg-white/80! dark:bg-zinc-950/80! backdrop-blur-md! border! border-zinc-200/80! dark:border-zinc-800/80! rounded-2xl! shadow-2xl! overflow-hidden hidden md:block m-6!"
            maskColor="rgba(161, 161, 170, 0.2)"
            nodeClassName="!fill-zinc-200 dark:!fill-zinc-800 !stroke-zinc-300 dark:!stroke-zinc-700 !stroke-1 transition-colors"
          />

          <Controls
            position="bottom-right"
            className={controlsClassName}
          />
        </ReactFlow>

        <FloatingSidebar selectedNodeId={selectedNodeId} />
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={onExportClose}
        tables={tables}
        relations={relations}
      />
    </div>
  );
}