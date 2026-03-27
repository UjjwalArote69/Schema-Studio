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
 *
 * SELECTION MODEL: selectedNodeIds is derived from the `selected` property
 * on React Flow nodes (set via onNodesChange "select" changes). This means
 * React Flow owns the selection state and we simply read it — no fighting
 * between two sources of truth.
 */
export function useSchemaEditor() {
  const {
    tables,
    relations,
    updateTablePosition,
    addTable,
    addRelation,
    removeTable,
    removeTables,
    removeRelation,
    setSchema,
    undo,
    redo,
    past,
    future,
    beginDrag,
    commitDrag,
  } = useSchemaStore();

  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // ── Stable type registries ────────────────────────────────────
  const nodeTypes: NodeTypes = useMemo(() => ({ tableNode: TableNode }), []);
  const edgeTypes = useMemo(() => ({ relationEdge: RelationEdge }), []);

  // ── React Flow state (plain useState — NOT useNodesState) ─────
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Refs to latest Zustand state — used inside callbacks so they
  // never see stale closures.
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const relationsRef = useRef(relations);
  relationsRef.current = relations;

  // ── Derive selection from React Flow node state ───────────────
  // This is always in sync — no extra state to manage.
  const selectedNodeIds = useMemo(
    () => nodes.filter((n) => n.selected).map((n) => n.id),
    [nodes],
  );

  // Single-select convenience: the ID when exactly one node is
  // selected, null otherwise. The FloatingSidebar consumes this.
  const selectedNodeId =
    selectedNodeIds.length === 1 ? selectedNodeIds[0] : null;

  // ── Sync Zustand tables → React Flow nodes ────────────────────
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
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const safe = changes.filter((c) => c.type !== "remove");
      const updated = applyNodeChanges(safe, nds);
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      // Undo
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

      // Redo (Ctrl+Y)
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      // Select All
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        selectAll();
        return;
      }

      // Delete / Backspace — bulk-aware
      if (e.key === "Delete" || e.key === "Backspace") {
        // Read fresh selection from nodes ref-equivalent (via closure
        // over setNodes is stale — read from the latest derived value
        // via the captured selectedNodeIds).
        // Since this effect re-runs when selectedNodeIds changes, the
        // closure always has the latest value.
        if (selectedNodeIds.length > 0) {
          e.preventDefault();
          removeTables(selectedNodeIds);
        } else if (selectedEdgeId) {
          e.preventDefault();
          removeRelation(selectedEdgeId);
          setSelectedEdgeId(null);
        }
        return;
      }

      // Escape — clear selection
      if (e.key === "Escape") {
        clearSelection();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    selectedNodeIds,
    selectedEdgeId,
    removeTable,
    removeTables,
    removeRelation,
    selectAll,
    clearSelection,
  ]);

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

  /**
   * When dragging a multi-selection, React Flow passes ALL dragged
   * nodes in the third parameter. We update every moved node's
   * position in Zustand, then commit the drag as a single undo entry.
   */
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, _node: Node, draggedNodes: Node[]) => {
      for (const n of draggedNodes) {
        updateTablePosition(n.id, n.position);
      }
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
  const onNodeClick = useCallback((_event: React.MouseEvent, _node: Node) => {
    // React Flow manages the actual node selection state (single-click
    // selects that node, Shift/Cmd+click adds to selection). We just
    // clear the edge selection so the two don't overlap.
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
  }, []);

  const onPaneClick = useCallback(() => {
    // React Flow auto-deselects nodes on pane click.
    // selectedNodeIds updates via the derived useMemo.
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
    selectedNodeIds,
    selectedEdgeId,
    selectAll,
    clearSelection,
  };
}