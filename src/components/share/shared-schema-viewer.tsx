// ============================================================
// FILE: src/components/share/shared-schema-viewer.tsx
//
// Read-only React Flow canvas for publicly shared schemas.
// No editing, no sidebar, no AI — just viewing + export.
// ============================================================

"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import {
  Database,
  Code,
  Eye,
  Clock,
  User,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReadOnlyTableNode } from "@/components/share/read-only-table-node";
import { ReadOnlyRelationEdge } from "@/components/share/read-only-relation-edge";
import { ExportModal } from "@/components/editor/export-modal";
import type { Table, Relation } from "@/store/useSchemaStore";

interface SharedSchemaViewerProps {
  name: string;
  tables: Table[];
  relations: Relation[];
  authorName: string;
  updatedAt: string;
}

const PRO_OPTIONS = { hideAttribution: true } as const;

function SharedSchemaContent({
  name,
  tables,
  relations,
  authorName,
  updatedAt,
}: SharedSchemaViewerProps) {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const nodeTypes = useMemo(() => ({ tableNode: ReadOnlyTableNode }), []);
  const edgeTypes = useMemo(() => ({ relationEdge: ReadOnlyRelationEdge }), []);

  const nodes: Node[] = useMemo(
    () =>
      tables.map((table) => ({
        id: table.id,
        type: "tableNode" as const,
        position: table.position,
        data: { table },
        draggable: true,
        selectable: false,
        connectable: false,
      })),
    [tables]
  );

  const edges: Edge[] = useMemo(
    () =>
      relations.map((rel) => ({
        id: rel.id,
        source: rel.sourceTableId,
        sourceHandle: rel.sourceColumnId,
        target: rel.targetTableId,
        targetHandle: rel.targetColumnId,
        type: "relationEdge",
        animated: true,
        style: { stroke: "#a1a1aa", strokeWidth: 2 },
        data: { relation: rel },
        selectable: false,
        deletable: false,
      })),
    [relations]
  );

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const formattedDate = new Date(updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Toolbar */}
      <div className="h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 sm:px-5 z-10 shadow-sm transition-colors duration-300 w-full shrink-0">
        {/* Left: Branding & Schema Info */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-sm hover:opacity-80 transition-opacity shrink-0"
          >
            <div className="p-1 bg-black dark:bg-white rounded-[6px]">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="hidden md:inline text-zinc-900 dark:text-zinc-100">
              SchemaStudio
            </span>
          </Link>

          <span className="text-zinc-300 dark:text-zinc-700 font-light hidden md:inline-block shrink-0">
            /
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[180px] sm:max-w-[280px]">
              {name}
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-900/50 shrink-0">
              <Eye className="w-3 h-3" />
              Public
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 pl-2">
          {/* Meta info (desktop) */}
          <div className="hidden lg:flex items-center gap-3 mr-2 text-[11px] font-medium text-zinc-400">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {authorName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-all border border-zinc-200 dark:border-zinc-800 active:scale-95"
            title="Copy share link"
          >
            {urlCopied ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {urlCopied ? "Copied" : "Copy Link"}
            </span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            disabled={tables.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-40 active:scale-95"
            title="Export Code"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          <Link
            href="/register"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-all border border-zinc-200 dark:border-zinc-800 active:scale-95"
          >
            Try SchemaStudio
            <ArrowRight className="w-3 h-3" />
          </Link>

          <ThemeToggle />
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full relative overflow-hidden">
        {tables.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center z-10 p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-zinc-400" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Empty Schema
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm">
                This shared schema doesn&apos;t have any tables yet.
              </p>
            </div>
          </div>
        ) : null}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
          connectOnClick={false}
          deleteKeyCode={null}
          className="dark:bg-zinc-950 transition-colors duration-300"
          proOptions={PRO_OPTIONS}
          minZoom={0.1}
          maxZoom={2}
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
            className="shadow-lg border-none dark:text-black transition-all overflow-hidden rounded-md m-4 md:m-6 [&>button]:bg-white dark:[&>button]:bg-zinc-900 [&>button]:border-zinc-200 dark:[&>button]:border-zinc-800 hover:[&>button]:bg-zinc-50 dark:hover:[&>button]:bg-zinc-800 [&>button>svg]:fill-zinc-700 dark:[&>button>svg]:fill-zinc-300 mb-6"
          />
        </ReactFlow>
      </div>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tables={tables}
        relations={relations}
      />
    </div>
  );
}

export function SharedSchemaViewer(props: SharedSchemaViewerProps) {
  return (
    <ReactFlowProvider>
      <SharedSchemaContent {...props} />
    </ReactFlowProvider>
  );
}