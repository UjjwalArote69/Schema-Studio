/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef
} from "react";
import {
  ReactFlow,
  Background,
  Controls,
  NodeTypes,
  Node,
  MiniMap,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  useOnSelectionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSchemaStore } from "@/store/useSchemaStore";
import { TableNode } from "@/components/editor/table-node";
import {
  Database,
  Plus,
  Cloud,
  Loader2,
  ChevronLeft,
  Code,
  PenLine,
  Undo2,
  Redo2,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { updateSchema } from "@/app/actions/schema-actions";
import { ExportModal } from "@/components/editor/export-modal";
import { FloatingSidebar } from "@/components/editor/floating-sidebar";
import { RelationEdge } from "@/components/editor/relation-edge";
import {EmptyState} from '@/components/editor/empty-state'
import { AIArchitect } from "@/components/editor/ai-architect";

export default function EditorClient({
  project,
}: {
  project: any;
}) {
  const {
    tables,
    relations,
    updateTablePosition,
    addTable,
    addRelation,
    removeRelation,
    setSchema,
    undo,
    redo,
    past,
    future,
  } = useSchemaStore();
  const [
    selectedNodeId,
    setSelectedNodeId,
  ] = useState<string | null>(null);
  const [
    isExportOpen,
    setIsExportOpen,
  ] = useState(false);
  const [isSaving, setIsSaving] =
    useState(false);
  const [projectName, setProjectName] =
    useState(project.name);

    const hasInitialized = useRef(false);
  const nodeTypes: NodeTypes = useMemo(
    () => ({ tableNode: TableNode }),
    [],
  );
  const edgeTypes = useMemo(
    () => ({
      relationEdge: RelationEdge,
    }),
    [],
  );

  // 1. INITIALIZE DATA ON LOAD
  useEffect(() => {
    if (!hasInitialized.current) {
      const savedData = (project.data as { tables?: any[]; relations?: any[]; }) || {};
      setSchema(savedData.tables || [], savedData.relations || []);
      hasInitialized.current = true; // Lock it so it never runs again
    }
  }, [project.data, setSchema]);

  // 2. AUTO-SAVE MECHANISM
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      updateSchema(
        project.id,
        projectName,
        { tables, relations },
      )
        .then(() => setIsSaving(false))
        .catch((err) => {
          console.error(
            "Failed to save",
            err,
          );
          setIsSaving(false);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    tables,
    relations,
    projectName,
    project.id,
  ]);

  const [
    nodes,
    setNodes,
    onNodesChange,
  ] = useNodesState<Node>([]);
  const [
    edges,
    setEdges,
    onEdgesChange,
  ] = useEdgesState<Edge>([]);

  // 3. KEYBOARD SHORTCUTS (Undo / Redo / Delete)
  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent,
    ) => {
      // Check if user is typing inside an input field (we don't want to hijack their text editing!)
      if (
        e.target instanceof
          HTMLInputElement ||
        e.target instanceof
          HTMLTextAreaElement
      )
        return;

      if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "z"
      ) {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (
        (e.ctrlKey || e.metaKey) &&
        e.key === "y"
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );
    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
  }, [undo, redo]);

  // 1. Map Tables to Nodes (Preserving 'selected' state!)
  useEffect(() => {
    setNodes((currentNodes) =>
      tables.map((table) => {
        // Find the node if it already exists on the canvas
        const existingNode =
          currentNodes.find(
            (n) => n.id === table.id,
          );

        return {
          id: table.id,
          type: "tableNode",
          position: table.position,
          data: { table },
          // CRITICAL: Keep it selected if it was already selected!
          selected:
            existingNode?.selected ||
            false,
        };
      }),
    );
  }, [tables, setNodes]);

  // 2. Map Relations to Edges
  useEffect(() => {
    setEdges((currentEdges) =>
      relations.map((rel) => {
        const existingEdge =
          currentEdges.find(
            (e) => e.id === rel.id,
          );

        return {
          id: rel.id,
          source: rel.sourceTableId,
          sourceHandle:
            rel.sourceColumnId,
          target: rel.targetTableId,
          targetHandle:
            rel.targetColumnId,
          type: "relationEdge", // <-- Use the custom edge!
          animated: true,
          style: {
            stroke: "#a1a1aa",
            strokeWidth: 2,
          },
          interactionWidth: 25,
          selected:
            existingEdge?.selected ||
            false,
          data: { relation: rel }, // <-- Pass the relation data so the edge knows its type!
        };
      }),
    );
  }, [relations, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (
        !params.source ||
        !params.target ||
        !params.sourceHandle ||
        !params.targetHandle
      )
        return;
      if (
        params.source === params.target
      )
        return;
      addRelation({
        sourceTableId: params.source,
        sourceColumnId:
          params.sourceHandle,
        targetTableId: params.target,
        targetColumnId:
          params.targetHandle,
        type: "1:n",
      });
    },
    [addRelation],
  );

  const onNodeDragStop = (
    event: React.MouseEvent,
    node: Node,
  ) => {
    updateTablePosition(
      node.id,
      node.position,
    );
  };

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      if (removeRelation) {
        edgesToDelete.forEach((edge) =>
          removeRelation(edge.id),
        );
      }
    },
    [removeRelation],
  );

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      if (nodes.length === 1) {
        setSelectedNodeId(nodes[0].id);
      } else {
        setSelectedNodeId(null);
      }
    },
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* INJECT CUSTOM CSS FOR THE GLOW EFFECT */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .react-flow__edge.selected .react-flow__edge-path {
          stroke: #ef4444 !important; /* Tailwind Red-500 */
          stroke-width: 3 !important;
          filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
        }
      `,
        }}
      />

      {/* Top Toolbar */}
      <div className="h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 z-10 shadow-sm transition-colors duration-300">
        {/* Left Side: Navigation & Title */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all"
            title="Back to Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

          {/* App Brand (Read Only) */}
          <div className="flex items-center gap-2 font-semibold select-none cursor-default opacity-80">
            <Database className="w-4 h-4 text-black dark:text-white" />
            <span className="text-sm text-zinc-900 dark:text-zinc-100 hidden sm:inline-block">
              Schema Studio
            </span>
          </div>

          <span className="text-zinc-300 dark:text-zinc-700 font-light hidden sm:inline-block">
            /
          </span>

          {/* Editable Project Name */}
          <div className="relative group flex items-center">
            <input
              value={projectName}
              onChange={(e) =>
                setProjectName(
                  e.target.value,
                )
              }
              className="text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-transparent border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-zinc-50 dark:focus:bg-zinc-900 focus:outline-none rounded px-2 py-1 w-40 sm:w-56 transition-all"
            />
            <PenLine className="w-3 h-3 text-zinc-400 absolute right-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Cloud Auto-Save Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-full border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 ml-2 shadow-sm hidden md:flex">
            {isSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />{" "}
                Saving
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-green-500" />{" "}
                Saved
              </>
            )}
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* UNDO / REDO CONTROLS */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md p-0.5 mr-1 hidden md:flex">
            <button
              onClick={undo}
              disabled={
                past.length === 0
              }
              className={`p-1.5 rounded-sm transition-colors ${past.length === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-700 dark:text-zinc-300"}`}
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={
                future.length === 0
              }
              className={`p-1.5 rounded-sm transition-colors ${future.length === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white dark:hover:bg-zinc-800 hover:shadow-sm text-zinc-700 dark:text-zinc-300"}`}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() =>
              addTable({
                x:
                  Math.random() * 200 +
                  100,
                y:
                  Math.random() * 200 +
                  100,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-black dark:text-white rounded-md text-xs font-semibold transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            <Plus className="w-3.5 h-3.5" />{" "}
            <span className="hidden sm:inline">
              Add Table
            </span>
          </button>
          <button
            onClick={() =>
              setIsExportOpen(true)
            }
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-md text-xs font-semibold transition-all shadow-sm"
          >
            <Code className="w-3.5 h-3.5" />{" "}
            Export Code
          </button>

          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>

          <ThemeToggle />
        </div>
      </div>
      {/* The Canvas Container */}
      <div className="flex-1 w-full relative overflow-hidden">
        
        {tables.length === 0 ? (<EmptyState />) : (<AIArchitect/>)}

        {/* 1. The React Flow Canvas */}
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStop={
            onNodeDragStop
          }
          onConnect={onConnect}
          // --- THE FIX: USE DIRECT CLICK HANDLERS INSTEAD ---
          onNodeClick={(
            event,
            node,
          ) => {
            setSelectedNodeId(node.id);
          }}
          onPaneClick={() => {
            setSelectedNodeId(null); // Closes sidebar when clicking the background
          }}
          // -------------------------------------------------

          fitView
          className="dark:bg-zinc-950 transition-colors duration-300"
          proOptions={{
            hideAttribution: true,
          }}
          elevateNodesOnSelect={true}
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
            className="bg-white/80! dark:bg-zinc-950/80! backdrop-blur-md! border! border-zinc-200/80! dark:border-zinc-800/80! rounded-2xl! shadow-2xl! overflow-hidden m-6!"
            maskColor="rgba(161, 161, 170, 0.2)"
            nodeClassName="!fill-zinc-200 dark:!fill-zinc-800 !stroke-zinc-300 dark:!stroke-zinc-700 !stroke-1 transition-colors"
          />
          <Controls
            position="bottom-right"
            className="shadow-lg border-none dark:text-black !m-6 [&>button]:bg-white dark:[&>button]:bg-zinc-900 [&>button]:border-zinc-200 dark:[&>button]:border-zinc-800 hover:[&>button]:bg-zinc-50 dark:hover:[&>button]:bg-zinc-800 [&>button>svg]:fill-zinc-700 dark:[&>button>svg]:fill-zinc-300 transition-all overflow-hidden rounded-md"
          />
        </ReactFlow>

        {/* 2. THE FIX: RENDER DIRECTLY (No absolute wrapper needed) */}
        <FloatingSidebar
          selectedNodeId={
            selectedNodeId
          }
        />
      </div>

      {/* 3. Leave the Modal outside since it uses a fixed screen overlay */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() =>
          setIsExportOpen(false)
        }
        tables={tables}
        relations={relations}
      />
    </div>
  );
}
