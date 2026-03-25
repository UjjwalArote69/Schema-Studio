"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { 
  ReactFlow, Background, Controls, NodeTypes, Node, Edge, Connection, 
  useNodesState, useEdgesState, useOnSelectionChange, MiniMap,
  ReactFlowProvider 
} from "@xyflow/react";
import "@xyflow/react/dist/style.css"; 
import { useSchemaStore } from "@/store/useSchemaStore";
import { TableNode } from "@/components/editor/table-node";
import { RelationEdge } from "@/components/editor/relation-edge";
import { Database, Plus, CloudOff, LogIn, Code } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { FloatingSidebar } from "@/components/editor/floating-sidebar";
import { EmptyState } from "@/components/editor/empty-state";
import { AIArchitect } from "@/components/editor/ai-architect";
import { ExportModal } from "@/components/editor/export-modal";

function PublicEditorContent() {
  const { 
    tables, relations, updateTablePosition, addTable, addRelation 
  } = useSchemaStore();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const nodeTypes: NodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), []);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // 1. BULLETPROOF NODE SYNCING
  // This preserves React Flow's internal selection, dimension, and dragging states.
  useEffect(() => {
    setNodes((currentNodes) => {
      return tables.map((table) => {
        const existingNode = currentNodes.find((n) => n.id === table.id);
        
        if (existingNode) {
          return {
            ...existingNode,
            position: table.position,
            // Only update the specific data payload, keep everything else untouched
            data: { ...existingNode.data, table }, 
          };
        }
        
        return {
          id: table.id,
          type: "tableNode",
          position: table.position,
          data: { table },
        };
      });
    });
  }, [tables, setNodes]);

  // 2. BULLETPROOF EDGE SYNCING
  // Ensures relationships don't break when tables are updated
  useEffect(() => {
    setEdges((currentEdges) => {
      return relations.map((rel) => {
        const existingEdge = currentEdges.find((e) => e.id === rel.id);
        
        if (existingEdge) {
          return {
            ...existingEdge,
            source: rel.sourceTableId,
            sourceHandle: rel.sourceColumnId,
            target: rel.targetTableId,
            targetHandle: rel.targetColumnId,
            data: { ...existingEdge.data, relationId: rel.id, type: rel.type },
          };
        }
        
        return {
          id: rel.id,
          source: rel.sourceTableId,
          sourceHandle: rel.sourceColumnId,
          target: rel.targetTableId,
          targetHandle: rel.targetColumnId,
          type: "relationEdge",
          animated: true,
          data: { relationId: rel.id, type: rel.type },
        };
      });
    });
  }, [relations, setEdges]);

  // Track selection state for the sidebar
  useOnSelectionChange({
    onChange: useCallback(({ nodes }: { nodes: Node[] }) => {
      setSelectedNodeId(nodes.length > 0 ? nodes[0].id : null);
    }, []),
  });

  // Handle drawing new relationship lines
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return;
    if (params.source === params.target) return;
    
    addRelation({
      sourceTableId: params.source,
      sourceColumnId: params.sourceHandle,
      targetTableId: params.target,
      targetColumnId: params.targetHandle,
      type: "1:n"
    });
  }, [addRelation]);

  // Sync node movements back to the global store
  const onNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    updateTablePosition(node.id, node.position);
  }, [updateTablePosition]);

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Top Toolbar */}
      <div className="h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-6 z-40 transition-colors duration-300">
        
        {/* Left: Branding & Sandbox Indicator */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight hover:opacity-80 transition-opacity">
            <div className="p-1.5 bg-black dark:bg-white rounded-lg shadow-sm">
              <Database className="w-4 h-4 text-white dark:text-black" />
            </div>
            <span className="text-zinc-900 dark:text-white hidden sm:block">SchemaStudio</span>
          </Link>
          
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800" />
          
          <div className="flex items-center gap-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-500 rounded-md text-[11px] font-bold uppercase tracking-wider border border-amber-200/50 dark:border-amber-900/50">
            <CloudOff className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Local Sandbox</span>
          </div>
        </div>

        {/* Center: Add Table Button */}
        <div className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => addTable({ x: typeof window !== 'undefined' ? window.innerWidth / 2 - 100 : 200, y: typeof window !== 'undefined' ? window.innerHeight / 2 - 100 : 200 })}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-xs font-bold transition-all active:scale-95 border border-transparent dark:border-zinc-800"
          >
            <Plus className="w-3 h-3" /> Add Table
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsExportOpen(true)}
            disabled={tables.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 active:scale-95"
          >
            <Code className="w-4 h-4" /> Export
          </button>
          
          <Link 
            href="/login" 
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
          >
            <LogIn className="w-4 h-4" /> Save to Cloud
          </Link>
          
          <div className="w-px h-5 bg-zinc-200 dark:bg-zinc-800 mx-2 hidden sm:block" />
          <div className="hidden sm:block"><ThemeToggle /></div>
        </div>
      </div>

      {/* The Canvas Area */}
      <div className="flex-1 w-full relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange} // Crucial for selection to work!
          onEdgesChange={onEdgesChange}
          onNodeDragStop={onNodeDragStop}
          onConnect={onConnect}
          fitView
          className="dark:bg-zinc-950 transition-colors duration-300"
          proOptions={{ hideAttribution: true }}
          elevateNodesOnSelect={true}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{ type: "relationEdge" }}
        >
          <Background color="#a1a1aa" gap={24} size={1.5} className="opacity-40 dark:opacity-10" />
          
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

        {tables.length === 0 ? (
          <EmptyState />
        ) : (
          <AIArchitect />
        )}
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

// 3. Wrap in Provider to prevent the runtime error
export default function PublicEditorPage() {
  return (
    <ReactFlowProvider>
      <PublicEditorContent />
    </ReactFlowProvider>
  );
}