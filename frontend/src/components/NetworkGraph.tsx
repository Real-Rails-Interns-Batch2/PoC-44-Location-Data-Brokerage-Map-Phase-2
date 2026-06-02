"use client";

import { useEffect, useRef, useCallback } from "react";
import type { StylesheetCSS } from "cytoscape";
import type { EpisodeStage, Granularity, GraphNode, GraphEdge } from "../lib/types";
import { ENTITY_COLORS, RELATIONSHIP_STYLES } from "../lib/types";
import { filterEdgesByGranularity, filterEdgesByStage, visibleNodes } from "../lib/api";
import { dataset } from "../lib/api";

interface NetworkGraphProps {
  activeStage: EpisodeStage;           // VAR R-02 — current episode step
  granularity: Granularity;            // VAR R-03 — selected granularity filter
  onNodeSelect: (node: GraphNode | null) => void;
}

// ─── Cytoscape stylesheet ─────────────────────────────────────────────────────
function buildStylesheet(activeStage: EpisodeStage): StylesheetCSS[] {
  const styles: any[] = [
    {
      selector: "node",
      style: {
        width: 48,
        height: 48,
        "background-color": "data(fillColor)",
        "border-color": "data(strokeColor)",
        "border-width": 2,
        label: "data(label)",
        color: "#e2e8f0",
        "font-size": 11,
        "font-family": "ui-monospace, 'Cascadia Code', monospace",
        "text-valign": "bottom",
        "text-margin-y": "6px",
        "text-wrap": "none",
        "transition-property": "opacity, border-width",
        "transition-duration": "350ms",
      },
    },
    {
      // VAR R-02 — dim nodes whose episode_stage > activeStage
      selector: `node[episode_stage > ${activeStage}]`,
      style: {
        opacity: 0.15,
      },
    },
    {
      // Highlight nodes in the active stage with a glowing ring
      selector: `node[episode_stage = ${activeStage}]`,
      style: {
        "border-width": 3,
        "border-color": "#ffffff",
        opacity: 1,
      },
    },
    {
      selector: "node:selected",
      style: {
        "border-color": "#ffffff",
        "border-width": 3,
      },
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": "data(strokeColor)",
        "target-arrow-color": "data(strokeColor)",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        "line-dash-pattern": "data(dashPattern)",
        "line-dash-offset": 0,
        opacity: 0.75,
        "transition-property": "opacity",
        "transition-duration": "350ms",
      },
    },
    {
      // VAR R-02 — dim edges whose episode_stage > activeStage
      selector: `edge[episode_stage > ${activeStage}]`,
      style: { opacity: 0.05 },
    },
    {
      selector: `edge[episode_stage = ${activeStage}]`,
      style: { opacity: 1, width: 2 },
    },
  ];
  return styles as StylesheetCSS[];
}

// ─── Build Cytoscape elements from filtered data ───────────────────────────────
function buildElements(activeStage: EpisodeStage, granularity: Granularity) {
  const allEdges = dataset.edges;

  // VAR R-03 — apply granularity filter first
  const granFiltered = filterEdgesByGranularity(allEdges, granularity);

  // All edges (will be dimmed via stylesheet, not removed, so graph stays coherent)
  // We pass episode_stage as a data attribute so Cytoscape selector can dim them
  const nodes = dataset.nodes.map((n: GraphNode) => ({
    data: {
      id: n.id,
      label: n.label,
      fillColor: ENTITY_COLORS[n.type].fill,
      strokeColor: ENTITY_COLORS[n.type].stroke,
      type: n.type,
      episode_stage: n.episode_stage,
      // Pass full node for sidebar
      _raw: n,
    },
    position: n.initial_position, // VAR M-02 — explicit positions, no layout crowding
  }));

  // Build edge set: all edges but mark those excluded by granularity filter as dimmed
  const edges = dataset.edges.map((e: GraphEdge) => {
    const style = RELATIONSHIP_STYLES[e.relationship];
    const granExcluded =
      e.granularity !== null && e.granularity !== granularity;
    return {
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        strokeColor: granExcluded ? "#374151" : style.stroke,
        dashPattern:
          e.relationship === "enforcement" ? [6, 4] : [0],
        episode_stage: e.episode_stage,
        granularity: e.granularity,
        granExcluded,
        _raw: e,
      },
    };
  });

  return [...nodes, ...edges];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function NetworkGraph({
  activeStage,
  granularity,
  onNodeSelect,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);

  // Initialize Cytoscape once on mount
  useEffect(() => {
    if (!containerRef.current) return;

    // Dynamic import so Cytoscape doesn't SSR
    import("cytoscape").then(({ default: cytoscape }) => {
      const cy = cytoscape({
        container: containerRef.current,
        elements: buildElements(activeStage, granularity),
        style: buildStylesheet(activeStage),
        layout: { name: "preset" }, // VAR M-02 — use explicit positions from mock_data
        // VAR D-01 — background must be exactly #030712
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        autoungrabify: false,
      });

      // VAR D-01 — Force container background to match sidebar exactly
      cy.container()!.style.background = "#030712";

      // Node click → pass raw node to sidebar
      cy.on("tap", "node", (evt: any) => {
        const raw: GraphNode = evt.target.data("_raw");
        onNodeSelect(raw ?? null);
      });

      // Tap on background → deselect
      cy.on("tap", (evt: any) => {
        if (evt.target === cy) onNodeSelect(null);
      });

      cyRef.current = cy;
    });

    return () => {
      cyRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update elements & style when stage or granularity changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.elements().remove();
      cy.add(buildElements(activeStage, granularity));
      cy.style(buildStylesheet(activeStage));
    });
  }, [activeStage, granularity]);

  return (
    <div
      style={{
        // VAR D-01 — strictly #030712, no bleed from canvas layers
        background: "#030712",
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* Starfield canvas is optional — keep opacity capped to preserve bg color */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          // VAR D-01 — transparent so the parent #030712 shows through
          background: "transparent",
        }}
      />

      {/* ── Legend (bottom-left of 70% stage) ────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          background: "rgba(3,7,18,0.88)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8,
          padding: "14px 16px",
          minWidth: 220,
          pointerEvents: "none",
        }}
      >
        <p style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", margin: "0 0 10px", textTransform: "uppercase" }}>
          Entity Type
        </p>
        {(Object.entries(ENTITY_COLORS) as [string, { fill: string; label: string }][]).map(
          ([, v]) => (
            <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: v.fill,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: "#cbd5e1", fontSize: 12 }}>{v.label}</span>
            </div>
          )
        )}

        <p style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.08em", margin: "12px 0 10px", textTransform: "uppercase" }}>
          Relationship
        </p>
        {(Object.entries(RELATIONSHIP_STYLES) as [string, { stroke: string; dash: string; label: string }][]).map(
          ([, v]) => (
            <div key={v.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <svg width={24} height={2} style={{ flexShrink: 0 }}>
                <line
                  x1={0} y1={1} x2={24} y2={1}
                  stroke={v.stroke}
                  strokeWidth={1.5}
                  strokeDasharray={v.dash === "none" ? undefined : v.dash}
                />
              </svg>
              <span style={{ color: "#cbd5e1", fontSize: 12 }}>{v.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
