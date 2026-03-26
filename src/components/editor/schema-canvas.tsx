"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FloatingSidebar } from "@/components/editor/floating-sidebar";
import { EmptyState } from "@/components/editor/empty-state";
import { AIArchitect } from "@/components/editor/ai-architect";
import { ExportModal } from "@/components/editor/export-modal";
import type { useSchemaEditor } from "@/hooks/useSchemaEditor";

type EditorReturn = ReturnType<typeof useSchemaEditor>;

interface SchemaCanvasProps {
  editor: EditorReturn;
  /** Toolbar rendered above the canvas — each editor provides its own */
  toolbar: React.ReactNode;
  isExportOpen: boolean;
  onExportClose: () => void;
  /** Called when "Import SQL" is clicked in the empty state */
  onImportSQL?: () => void;
  /** False until the schema data has been loaded into the store.
   *  Prevents the EmptyState from flashing on page load. */
  isReady?: boolean;
}

/**
 * Shared canvas component used by both the authenticated editor
 * and the public sandbox. All React Flow config lives here once.
 */
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
  } = editor;

  // Determine what overlay to show above the canvas
  const overlay = !isReady ? null : tables.length === 0 ? (
    <EmptyState onImportSQL={onImportSQL} />
  ) : (
    <AIArchitect />
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Selected edge glow — static CSS, no user input */}
      <style>{`
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #ef4444 !important;
          stroke-width: 3 !important;
          filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
        }
      `}</style>

      {/* Each editor provides its own toolbar */}
      {toolbar}

      {/* Canvas container */}
      <div className="flex-1 w-full relative overflow-hidden">
        {overlay}

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
          /* We handle Delete/Backspace in our own keyboard handler,
             so disable React Flow's built-in node/edge deletion
             to prevent double-fires and race conditions. */
          deleteKeyCode={null}
          fitView
          className="dark:bg-zinc-950 transition-colors duration-300"
          proOptions={{ hideAttribution: true }}
          elevateNodesOnSelect
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{ type: "relationEdge" }}
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
            className="bg-white/80! dark:bg-zinc-950/80! backdrop-blur-md! border! border-zinc-200/80! dark:border-zinc-800/80! rounded-2xl! shadow-2xl! overflow-hidden m-6!"
            maskColor="rgba(161, 161, 170, 0.2)"
            nodeClassName="!fill-zinc-200 dark:!fill-zinc-800 !stroke-zinc-300 dark:!stroke-zinc-700 !stroke-1 transition-colors"
          />
          <Controls
            position="bottom-right"
            className="shadow-lg border-none dark:text-black !m-6 [&>button]:bg-white dark:[&>button]:bg-zinc-900 [&>button]:border-zinc-200 dark:[&>button]:border-zinc-800 hover:[&>button]:bg-zinc-50 dark:hover:[&>button]:bg-zinc-800 [&>button>svg]:fill-zinc-700 dark:[&>button>svg]:fill-zinc-300 transition-all overflow-hidden rounded-md"
          />
        </ReactFlow>

        <FloatingSidebar selectedNodeId={selectedNodeId} />
      </div>

      {/* Export modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={onExportClose}
        tables={tables}
        relations={relations}
      />
    </div>
  );
}