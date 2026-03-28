/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
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
 * PERF NOTES:
 * ───────────────────────────────────────────────────────────────
 * 1. Zustand `tables`/`relations` are the single source of truth.
 *    React Flow nodes/edges are derived via useEffect.
 *
 * 2. We use plain useState (NOT useNodesState) to prevent React
 *    Flow's internal state from fighting with Zustand.
 *
 * 3. During drag, React Flow manages positions locally through
 *    onNodesChange. We only sync to Zustand on drag STOP to
 *    avoid O(n) rebuilds every frame.
 *
 * 4. Individual Zustand selectors (s => s.someAction) for actions
 *    — these are stable refs that never cause re-renders.
 *
 * 5. tablesRef / relationsRef keep callbacks seeing the latest
 *    store state without re-creating closures.
 * ───────────────────────────────────────────────────────────────
 */
export function useSchemaEditor() {
  // ── Store subscriptions: data (triggers re-renders) ───────────
  const tables = useSchemaStore((s) => s.tables);
  const relations = useSchemaStore((s) => s.relations);
  const past = useSchemaStore((s) => s.past);
  const future = useSchemaStore((s) => s.future);

  // ── Store subscriptions: actions (stable refs, no re-renders) ─
  const updateTablePosition = useSchemaStore((s) => s.updateTablePosition);
  const addTable = useSchemaStore((s) => s.addTable);
  const removeTable = useSchemaStore((s) => s.removeTable);
  const removeTables = useSchemaStore((s) => s.removeTables);
  const addRelation = useSchemaStore((s) => s.addRelation);
  const removeRelation = useSchemaStore((s) => s.removeRelation);
  const setSchema = useSchemaStore((s) => s.setSchema);
  const undo = useSchemaStore((s) => s.undo);
  const redo = useSchemaStore((s) => s.redo);
  const beginDrag = useSchemaStore((s) => s.beginDrag);
  const commitDrag = useSchemaStore((s) => s.commitDrag);

  // ── Selection state ───────────────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // ── Stable type registries (never re-created) ─────────────────
  const nodeTypes: NodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), []);

  // ── React Flow state ──────────────────────────────────────────
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // ── Refs for latest Zustand state (stale-closure prevention) ──
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const relationsRef = useRef(relations);
  relationsRef.current = relations;

  // Track whether a drag is in progress so the sync effect
  // can skip position-only rebuilds during drag.
  const isDraggingRef = useRef(false);

  // ── Sync Zustand tables → React Flow nodes ────────────────────
  // PERF: This is AUTHORITATIVE — it rebuilds nodes from Zustand,
  // preserving only `selected` from existing React Flow state.
  // During drag we skip this (React Flow manages positions locally).
  useEffect(() => {
    // If dragging, React Flow already has the latest positions
    // from onNodesChange. We don't need to rebuild from Zustand
    // since the only change during drag is position.
    if (isDraggingRef.current) return;

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
  // PERF: Filters out "remove" changes (Zustand owns deletions),
  // then reconciles against current store to drop stale nodes.
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const safe = changes.filter((c) => c.type !== "remove");
      const updated = applyNodeChanges(safe, nds);
      // Reconcile — prevent deleted nodes from reappearing
      const validIds = new Set(tablesRef.current.map((t) => t.id));
      return updated.filter((n) => validIds.has(n.id));
    });

    // Track multi-selection from the updated nodes
    setNodes((nds) => {
      const selected = nds.filter((n) => n.selected).map((n) => n.id);
      // Only update if the selection actually changed
      setSelectedNodeIds((prev) => {
        if (
          prev.length === selected.length &&
          prev.every((id, i) => id === selected[i])
        )
          return prev;
        return selected;
      });
      return nds; // no mutation
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

  // ── Keyboard shortcuts ────────────────────────────────────────
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
        if (selectedNodeIds.length > 1) {
          e.preventDefault();
          removeTables(selectedNodeIds);
          setSelectedNodeIds([]);
          setSelectedNodeId(null);
        } else if (selectedNodeId) {
          e.preventDefault();
          removeTable(selectedNodeId);
          setSelectedNodeId(null);
        } else if (selectedEdgeId) {
          e.preventDefault();
          removeRelation(selectedEdgeId);
          setSelectedEdgeId(null);
        }
      } else if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, selectedNodeId, selectedEdgeId, selectedNodeIds, removeTable, removeTables, removeRelation]);

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
  // PERF: Set isDraggingRef so the sync effect skips during drag.
  const onNodeDragStart = useCallback(() => {
    isDraggingRef.current = true;
    beginDrag();
  }, [beginDrag]);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      isDraggingRef.current = false;
      updateTablePosition(node.id, node.position);
      commitDrag();
    },
    [updateTablePosition, commitDrag],
  );

  // ── Edge deletion ─────────────────────────────────────────────
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

  // ── Multi-select helpers ──────────────────────────────────────
  const selectAll = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => (n.selected ? n : { ...n, selected: true })),
    );
    setSelectedNodeIds(tablesRef.current.map((t) => t.id));
  }, []);

  const clearSelection = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => (n.selected ? { ...n, selected: false } : n)),
    );
    setSelectedNodeIds([]);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  return {
    // Store state
    tables,
    relations,
    addTable,
    removeTable,
    removeTables,
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
    selectedNodeIds,
    selectAll,
    clearSelection,
  };
}