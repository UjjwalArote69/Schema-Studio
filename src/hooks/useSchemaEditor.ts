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

// ── Static objects hoisted out of the component ─────────────────
// These never change, so React Flow sees stable references.
const EDGE_STYLE = { stroke: "#a1a1aa", strokeWidth: 2 } as const;

/**
 * Shared hook that bridges the Zustand schema store ↔ React Flow state.
 *
 * PERF STRATEGY:
 * 1. Use individual Zustand selectors — only re-render when the
 *    specific slice we read actually changes by reference.
 * 2. Preserve node/edge data object references — only create new
 *    data objects when the backing Zustand object actually changed.
 * 3. Use refs for values the keyboard handler reads so the effect
 *    doesn't re-register on every selection change.
 */
export function useSchemaEditor() {
  // ── Zustand selectors (individual = fine-grained subscriptions) ─
  // State slices — re-render only when these specific references change
  const tables = useSchemaStore((s) => s.tables);
  const relations = useSchemaStore((s) => s.relations);
  const past = useSchemaStore((s) => s.past);
  const future = useSchemaStore((s) => s.future);

  // Actions — stable function references, never trigger re-renders
  const updateTablePosition = useSchemaStore((s) => s.updateTablePosition);
  const addTable = useSchemaStore((s) => s.addTable);
  const addRelation = useSchemaStore((s) => s.addRelation);
  const removeTable = useSchemaStore((s) => s.removeTable);
  const removeTables = useSchemaStore((s) => s.removeTables);
  const removeRelation = useSchemaStore((s) => s.removeRelation);
  const setSchema = useSchemaStore((s) => s.setSchema);
  const undo = useSchemaStore((s) => s.undo);
  const redo = useSchemaStore((s) => s.redo);
  const beginDrag = useSchemaStore((s) => s.beginDrag);
  const commitDrag = useSchemaStore((s) => s.commitDrag);

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // ── Stable type registries ────────────────────────────────────
  const nodeTypes: NodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), []);

  // ── React Flow state ──────────────────────────────────────────
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Refs to latest Zustand state — used inside callbacks so they
  // never see stale closures.
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const relationsRef = useRef(relations);
  relationsRef.current = relations;

  // ── Derive selection from React Flow node state ───────────────
  // PERF: Only produce a new array when the actual set of selected
  // IDs changes, not on every node position update during drag.
  const prevSelectedRef = useRef<string[]>([]);
  const selectedNodeIds = useMemo(() => {
    const ids = nodes.filter((n) => n.selected).map((n) => n.id);
    const prev = prevSelectedRef.current;
    // Shallow compare — if same length and same IDs in order, reuse
    if (
      ids.length === prev.length &&
      ids.every((id, i) => id === prev[i])
    ) {
      return prev;
    }
    prevSelectedRef.current = ids;
    return ids;
  }, [nodes]);

  const selectedNodeId =
    selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;

  // ── Sync Zustand tables → React Flow nodes ────────────────────
  // PERF: Only create a new node object when the backing table
  // reference actually changed. Preserves data identity so React
  // Flow's internal shouldComponentUpdate / memo on TableNode works.
  useEffect(() => {
    setNodes((prev) => {
      const prevMap = new Map(prev.map((n) => [n.id, n]));
      let changed = false;
      const next = tables.map((table) => {
        const existing = prevMap.get(table.id);
        if (existing) {
          // Check if anything React Flow cares about actually changed
          const positionSame =
            existing.position.x === table.position.x &&
            existing.position.y === table.position.y;
          const dataSame = existing.data?.table === table;
          if (positionSame && dataSame) {
            return existing; // Same reference — no re-render
          }
          changed = true;
          return {
            ...existing,
            position: positionSame ? existing.position : table.position,
            data: dataSame ? existing.data : { table },
          };
        }
        // New node
        changed = true;
        return {
          id: table.id,
          type: "tableNode" as const,
          position: table.position,
          data: { table },
          selected: false,
        };
      });
      // If only deletions/additions happened, or references changed
      if (!changed && next.length === prev.length) return prev;
      return next;
    });
  }, [tables]);

  // ── Sync Zustand relations → React Flow edges ────────────────
  // PERF: Reuse edge objects and the shared EDGE_STYLE constant.
  useEffect(() => {
    setEdges((prev) => {
      const prevMap = new Map(prev.map((e) => [e.id, e]));
      let changed = false;
      const next = relations.map((rel) => {
        const existing = prevMap.get(rel.id);
        if (existing) {
          const dataSame = existing.data?.relation === rel;
          if (dataSame) return existing;
          changed = true;
          return {
            ...existing,
            data: { relation: rel },
          };
        }
        changed = true;
        return {
          id: rel.id,
          source: rel.sourceTableId,
          sourceHandle: rel.sourceColumnId,
          target: rel.targetTableId,
          targetHandle: rel.targetColumnId,
          type: "relationEdge",
          animated: true,
          style: EDGE_STYLE,
          interactionWidth: 25,
          selected: false,
          data: { relation: rel },
        };
      });
      if (!changed && next.length === prev.length) return prev;
      return next;
    });
  }, [relations]);

  // ── Handle React Flow node changes ────────────────────────────
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const safe = changes.filter((c) => c.type !== "remove");
      const updated = applyNodeChanges(safe, nds);
      const validIds = new Set(tablesRef.current.map((t) => t.id));
      return updated.filter((n) => validIds.has(n.id));
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      const safe = changes.filter((c) => c.type !== "remove");
      const updated = applyEdgeChanges(safe, eds);
      const validIds = new Set(relationsRef.current.map((r) => r.id));
      return updated.filter((e) => validIds.has(e.id));
    });
  }, []);

  // ── Selection actions ─────────────────────────────────────────
  const selectAll = useCallback(() => {
    setNodes((prev) =>
      prev.map((n) => (n.selected ? n : { ...n, selected: true })),
    );
    setSelectedEdgeId(null);
  }, []);

  const clearSelection = useCallback(() => {
    setNodes((prev) =>
      prev.map((n) => (n.selected ? { ...n, selected: false } : n)),
    );
    setEdges((prev) =>
      prev.map((e) => (e.selected ? { ...e, selected: false } : e)),
    );
    setSelectedEdgeId(null);
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────
  // PERF: Use refs for frequently-changing values so the effect
  // doesn't re-register the listener on every selection/edge change.
  const selectedNodeIdsRef = useRef(selectedNodeIds);
  selectedNodeIdsRef.current = selectedNodeIds;
  const selectedEdgeIdRef = useRef(selectedEdgeId);
  selectedEdgeIdRef.current = selectedEdgeId;

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
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        selectAll();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const ids = selectedNodeIdsRef.current;
        if (ids.length > 0) {
          e.preventDefault();
          removeTables(ids);
        } else if (selectedEdgeIdRef.current) {
          e.preventDefault();
          removeRelation(selectedEdgeIdRef.current);
          setSelectedEdgeId(null);
        }
        return;
      }

      if (e.key === "Escape") {
        clearSelection();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // Only stable function references — this effect registers ONCE
  }, [undo, redo, removeTables, removeRelation, selectAll, clearSelection]);

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
    (_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      for (const n of draggedNodes) {
        updateTablePosition(n.id, n.position);
      }
      commitDrag();
    },
    [updateTablePosition, commitDrag],
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => removeRelation(edge.id));
    },
    [removeRelation],
  );

  // ── Click handlers ────────────────────────────────────────────
  const onNodeClick = useCallback((_event: React.MouseEvent, _node: Node) => {
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null);
  }, []);

  return {
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
    selectedEdgeId,
    selectAll,
    clearSelection,
  };
}