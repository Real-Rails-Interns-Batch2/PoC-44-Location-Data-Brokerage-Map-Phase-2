"use client";

import { useEffect, useRef } from "react";
import type { StylesheetCSS } from "cytoscape";
import type { EpisodeStage, Granularity, GraphNode, GraphEdge } from "../lib/types";
import { ENTITY_COLORS, RELATIONSHIP_STYLES } from "../lib/types";
import { filterEdgesByGranularity, dataset } from "../lib/api";

interface NetworkGraphProps {
  activeStage: EpisodeStage;
  granularity: Granularity;
  onNodeSelect: (node: GraphNode | null) => void;
}

function buildStylesheet(activeStage: EpisodeStage): StylesheetCSS[] {
  return [
    {
      selector: "node",
      style: {
        width: 48, height: 48,
        "background-color": "data(fillColor)",
        "border-color": "data(strokeColor)",
        "border-width": 2,
        label: "data(label)",
        color: "#e2e8f0",
        "font-size": 11,
        "font-family": "ui-monospace,'Cascadia Code',monospace",
        "text-valign": "bottom",
        "text-margin-y": "6px",
        "text-wrap": "none",
        "transition-property": "opacity,border-width",
        "transition-duration": "350ms",
      } as any,
    },
    {
      selector: `node[episode_stage > ${activeStage}]`,
      style: { opacity: 0.15 } as any,
    },
    {
      selector: `node[episode_stage = ${activeStage}]`,
      style: { "border-width": 3, "border-color": "#ffffff", opacity: 1 } as any,
    },
    {
      selector: "node:selected",
      style: { "border-color": "#ffffff", "border-width": 3 } as any,
    },
    {
      selector: "edge",
      style: {
        width: 1.5,
        "line-color": "data(strokeColor)",
        "target-arrow-color": "data(strokeColor)",
        "target-arrow-shape": "triangle",
        "curve-style": "bezier",
        opacity: 0.75,
        "transition-property": "opacity",
        "transition-duration": "350ms",
      } as any,
    },
    {
      selector: `edge[episode_stage > ${activeStage}]`,
      style: { opacity: 0.05 } as any,
    },
    {
      selector: `edge[episode_stage = ${activeStage}]`,
      style: { opacity: 1, width: 2 } as any,
    },
  ] as unknown as StylesheetCSS[];
}

function buildElements(activeStage: EpisodeStage, granularity: Granularity) {
  const granFiltered = filterEdgesByGranularity(dataset.edges, granularity);
  const granFilteredIds = new Set(granFiltered.map((e: GraphEdge) => e.id));

  const nodes = dataset.nodes.map((n: GraphNode) => ({
    data: {
      id: n.id,
      label: n.label,
      fillColor: ENTITY_COLORS[n.type].fill,
      strokeColor: ENTITY_COLORS[n.type].stroke,
      type: n.type,
      episode_stage: n.episode_stage,
      _raw: n,
    },
    position: n.initial_position,
  }));

  const edges = dataset.edges.map((e: GraphEdge) => {
    const style = RELATIONSHIP_STYLES[e.relationship];
    const granExcluded = !granFilteredIds.has(e.id);
    return {
      data: {
        id: e.id,
        source: e.source,
        target: e.target,
        strokeColor: granExcluded ? "#374151" : style.stroke,
        dashPattern: e.relationship === "enforcement" ? [6, 4] : [0],
        episode_stage: e.episode_stage,
        granExcluded,
        _raw: e,
      },
    };
  });

  return [...nodes, ...edges];
}

export default function NetworkGraph({ activeStage, granularity, onNodeSelect }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    import("cytoscape").then(({ default: cytoscape }) => {
      const cy = cytoscape({
        container: containerRef.current,
        elements: buildElements(activeStage, granularity),
        style: buildStylesheet(activeStage),
        layout: { name: "preset", fit: false },
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        autoungrabify: false,
      });
      cy.container()!.style.background = "#030712";

      cy.on("tap", "node", (evt: any) => {
        const raw: GraphNode = evt.target.data("_raw");
        onNodeSelect(raw ?? null);
      });
      cy.on("tap", (evt: any) => {
        if (evt.target === cy) onNodeSelect(null);
      });
      cyRef.current = cy;
    });
    return () => { cyRef.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (typeof window !== "undefined") {
  (window as any).__testSelectNode = (id: string) => {
    const node = cy.getElementById(id);
    if (node && node.length > 0) {
      onNodeSelect(node.data("_raw"));
      return true;
    }
    return false;
  };
}
    if (!cy) return;
    cy.batch(() => {
      cy.elements().remove();
      cy.add(buildElements(activeStage, granularity));
      cy.style(buildStylesheet(activeStage));
    });
  }, [activeStage, granularity]);

  return (
    <div style={{ background:"#030712", width:"100%", height:"100%", position:"relative" }}>
      <div ref={containerRef} style={{ width:"100%", height:"100%", background:"transparent" }} />

      {/* Legend */}
      <div style={{ position:"absolute", bottom:24, left:24, background:"rgba(3,7,18,0.88)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"14px 16px", minWidth:220, pointerEvents:"none" }}>
        <p style={{ color:"#94a3b8", fontSize:10, letterSpacing:"0.08em", margin:"0 0 10px", textTransform:"uppercase" }}>Entity Type</p>
        {(Object.entries(ENTITY_COLORS) as [string, { fill:string; label:string }][]).map(([, v]) => (
          <div key={v.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ width:10, height:10, borderRadius:"50%", background:v.fill, flexShrink:0, border:`1px solid ${v.fill.replace(/[\d.]+\)$/, "1)")}` }} />
            <span style={{ color:"#cbd5e1", fontSize:12 }}>{v.label}</span>
          </div>
        ))}
        <p style={{ color:"#94a3b8", fontSize:10, letterSpacing:"0.08em", margin:"12px 0 10px", textTransform:"uppercase" }}>Relationship</p>
        {(Object.entries(RELATIONSHIP_STYLES) as [string, { stroke:string; dash:string; label:string }][]).map(([, v]) => (
          <div key={v.label} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <svg width={24} height={2} style={{ flexShrink:0 }}>
              <line x1={0} y1={1} x2={24} y2={1} stroke={v.stroke} strokeWidth={1.5} strokeDasharray={v.dash === "none" ? undefined : v.dash} />
            </svg>
            <span style={{ color:"#cbd5e1", fontSize:12 }}>{v.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
