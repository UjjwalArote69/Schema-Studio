/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useMemo, useCallback, useState, useRef } from "react";
import {
  NodeTypes,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { useSchemaStore } from "@/store/useSchemaStore";
import { TableNode } from "@/components/editor/table-node";
import { RelationEdge } from "@/components/editor/relation-edge";

/**
 * Shared hook that bridges the Zustand schema store ↔ React Flow state.
 *
 * KEY DESIGN: Zustand `tables`/`relations` are the single source of truth.
 * React Flow nodes/edges are derived state, synced via useEffect.
 * We use plain useState (NOT useNodesState) to prevent React Flow's
 * internal state from fighting with Zustand. Every onNodesChange call
 * reconciles against the current Zustand state via refs, so deleted
 * nodes can never reappear.
 */
export function useSchemaEditor() {
  const {
    tables,
    relations,
    updateTablePosition,
    addTable,
    addRelation,
    removeTable,
    removeRelation,
    setSchema,
    undo,
    redo,
    past,
    future,
    beginDrag,
    commitDrag,
  } = useSchemaStore();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // ── Stable type registries ────────────────────────────────────
  const nodeTypes: NodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), []);

  // ── React Flow state (plain useState — NOT useNodesState) ─────
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Refs to latest Zustand state — used inside callbacks so they
  // never see stale closures.  This is the key to the reconciliation.
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const relationsRef = useRef(relations);
  relationsRef.current = relations;

  // ── Sync Zustand tables → React Flow nodes ────────────────────
  // This effect is AUTHORITATIVE: it rebuilds the node array from
  // Zustand tables, preserving only `selected` from React Flow state.
  useEffect(() => {
    setNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      return tables.map((table) => {
        const existing = prevMap.get(table.id);
        return {
          id: table.id,
          type: "tableNode" as const,
          position: table.position,
          data: { table },
          selected: existing?.selected ?? false,
        };
      });
    });
  }, [tables]);

  // ── Sync Zustand relations → React Flow edges ────────────────
  useEffect(() => {
    setEdges((prev) => {
      const prevMap = new Map(prev.map((e) => [e.id, e]));
      return relations.map((rel) => {
        const existing = prevMap.get(rel.id);
        return {
          id: rel.id,
          source: rel.sourceTableId,
          sourceHandle: rel.sourceColumnId,
          target: rel.targetTableId,
          targetHandle: rel.targetColumnId,
          type: "relationEdge",
          animated: true,
          style: { stroke: "#a1a1aa", strokeWidth: 2 },
          interactionWidth: 25,
          selected: existing?.selected ?? false,
          data: { relation: rel },
        };
      });
    });
  }, [relations]);

  // ── Handle React Flow node changes ────────────────────────────
  // Position, selection, dimensions — but NEVER removes.
  // After applying changes, reconcile: drop any node whose id
  // isn't in the current Zustand tables (via ref, always fresh).
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const safe = changes.filter((c) => c.type !== "remove");
      const updated = applyNodeChanges(safe, nds);
      // Reconcile — this is what prevents deleted nodes from reappearing
      const validIds = new Set(tablesRef.current.map((t) => t.id));
      return updated.filter((n) => validIds.has(n.id));
    });
  }, []);

  // ── Handle React Flow edge changes ────────────────────────────
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const safe = changes.filter((c) => c.type !== "remove");
      const updated = applyEdgeChanges(safe, eds);
      const validIds = new Set(relationsRef.current.map((r) => r.id));
      return updated.filter((e) => validIds.has(e.id));
    });
  }, []);

  // ── Keyboard shortcuts (Undo / Redo / Delete) ─────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) {
          e.preventDefault();
          removeTable(selectedNodeId);
          setSelectedNodeId(null);
        } else if (selectedEdgeId) {
          e.preventDefault();
          removeRelation(selectedEdgeId);
          setSelectedEdgeId(null);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedNodeId, selectedEdgeId, removeTable, removeRelation]);

  // ── Connection handler ────────────────────────────────────────
  const onConnect = useCallback(
    (params: Connection) => {
      if (
        !params.source ||
        !params.target ||
        !params.sourceHandle ||
        !params.targetHandle
      )
        return;
      if (params.source === params.target) return;
      addRelation({
        sourceTableId: params.source,
        sourceColumnId: params.sourceHandle,
        targetTableId: params.target,
        targetColumnId: params.targetHandle,
        type: "1:n",
      });
    },
    [addRelation],
  );

  // ── Drag handlers ─────────────────────────────────────────────
  const onNodeDragStart = useCallback(() => {
    beginDrag();
  }, [beginDrag]);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateTablePosition(node.id, node.position);
      commitDrag();
    },
    [updateTablePosition, commitDrag],
  );

  // ── Edge deletion (React Flow's onEdgesDelete callback) ───────
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => removeRelation(edge.id));
    },
    [removeRelation],
  );

  // ── Click handlers ────────────────────────────────────────────
  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  return {
    // Store state
    tables,
    relations,
    addTable,
    removeTable,
    setSchema,
    undo,
    redo,
    past,
    future,

    // React Flow state & handlers
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

    // Selection
    selectedNodeId,
    selectedEdgeId,
  };
}