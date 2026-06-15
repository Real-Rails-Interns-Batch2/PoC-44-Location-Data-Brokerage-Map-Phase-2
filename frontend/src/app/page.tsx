"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import type { EpisodeStage, Granularity, GraphNode } from "../lib/types";
import { GRANULARITY_OPTIONS } from "../lib/types";
import { EPISODE_STEPS, dataset } from "../lib/api";
import IntelligenceSidebar from "../components/IntelligenceSidebar";

const NetworkGraph = dynamic(() => import("../components/NetworkGraph"), {
  ssr: false,
  loading: () => (
    <div style={{ position:"absolute", inset:0, background:"#010810", display:"flex", alignItems:"center", justifyContent:"center", color:"#0e2a35", fontSize:13, letterSpacing:"0.1em" }}>
      INITIALISING GRAPH…
    </div>
  ),
});

const STACK = ["React","Next.js","TypeScript","Tailwind CSS","shadcn/ui","D3.js","Plotly","Apache ECharts","TanStack Table","FastAPI","Pandas"];
const META_INFO = { location: "Kochi", batch: "Batch 2", author: "Haifa" };

const HEADER_H  = 44;
const STEPPER_H = 40;
const CHROME_H  = HEADER_H + STEPPER_H; // total top chrome = 84px

export default function Page() {
  const [activeStage,  setActiveStage]  = useState<EpisodeStage>(1);
  const [granularity,  setGranularity]  = useState<Granularity>("precise");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [panelOpen,    setPanelOpen]    = useState(false);
  const [infoOpen,     setInfoOpen]     = useState(false);

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
    if (node) setPanelOpen(true);
  }, []);

  const currentEpisode = EPISODE_STEPS.find((e) => e.stage === activeStage)!;

  return (
    <div style={{
      position:"fixed", inset:0,
      background:"radial-gradient(ellipse 120% 80% at 60% 40%, #021018 0%, #010c10 40%, #010810 70%, #010608 100%)",
      overflow:"hidden",
      fontFamily:"ui-monospace,'Cascadia Code','Fira Code',monospace",
    }}>

      {/* ── Full-screen graph — sits below chrome ── */}
      <div style={{ position:"absolute", inset:0, top: CHROME_H }}>
        <NetworkGraph
          activeStage={activeStage}
          granularity={granularity}
          onNodeSelect={handleNodeSelect}
        />
      </div>

      {/* ══════════════════════════════════════════
          HEADER  (z-index 30)
      ══════════════════════════════════════════ */}
      <header style={{
        position:"absolute", top:0, left:0, right:0, height:HEADER_H, zIndex:30,
        display:"flex", alignItems:"center", gap:14, padding:"0 18px",
        background:"rgba(1,10,16,0.97)",
        borderBottom:"1px solid rgba(6,182,212,0.10)",
      }}>
        <span style={{ background:"rgba(6,182,212,0.12)", color:"#67e8f9", fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:3, letterSpacing:"0.1em", border:"1px solid rgba(6,182,212,0.25)" }}>
          REAL RAILS
        </span>
        <span style={{ color:"#164e63", fontSize:12, letterSpacing:"0.04em" }}>
          LOCATION DATA BROKERAGE MAP&nbsp;/&nbsp;PoC {dataset.meta.poc}
        </span>

        <div style={{ flex:1 }} />

        <span style={{ display:"flex", alignItems:"center", gap:6, color:"#164e63", fontSize:11 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#06b6d4", boxShadow:"0 0 6px #06b6d4" }} />
          LIVE MOCK · {dataset.meta.rail} Rail
        </span>

        {/* (i) button + popover */}
        <div style={{ position:"relative" }}>
          <button
            onClick={() => setInfoOpen((v) => !v)}
            style={{ width:26, height:26, borderRadius:"50%", border:"1px solid rgba(6,182,212,0.25)", background: infoOpen ? "rgba(6,182,212,0.15)" : "transparent", color:"#67e8f9", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", transition:"background 150ms" }}
          >i</button>

          {infoOpen && (
            <>
              {/* backdrop */}
              <div style={{ position:"fixed", inset:0, zIndex:40 }} onClick={() => setInfoOpen(false)} />
              {/* popover */}
              <div style={{ position:"absolute", top:34, right:0, width:280, zIndex:50, background:"rgba(1,14,22,0.98)", border:"1px solid rgba(6,182,212,0.18)", borderRadius:6, padding:"14px 16px", boxShadow:"0 8px 32px rgba(0,0,0,0.7)" }}>
                <div style={{ fontSize:10, color:"#06b6d4", letterSpacing:"0.12em", marginBottom:10 }}>PROJECT INFO</div>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                  <span style={{ color:"#67e8f9" }}>Author</span>&emsp;&emsp;{META_INFO.author}
                </div>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:4 }}>
                  <span style={{ color:"#67e8f9" }}>Location</span>&emsp;{META_INFO.location}
                </div>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>
                  <span style={{ color:"#67e8f9" }}>Cohort</span>&emsp;&emsp;{META_INFO.batch}
                </div>
                <div style={{ fontSize:10, color:"#06b6d4", letterSpacing:"0.10em", marginBottom:8 }}>STACK</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                  {STACK.map((s) => (
                    <span key={s} style={{ fontSize:10, padding:"2px 7px", border:"1px solid rgba(6,182,212,0.18)", borderRadius:3, color:"#475569", background:"rgba(6,182,212,0.05)" }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════
          STEPPER  (z-index 29)
      ══════════════════════════════════════════ */}
      <div style={{
        position:"absolute", top:HEADER_H, left:0, right:0, height:STEPPER_H, zIndex:29,
        display:"flex", alignItems:"center",
        padding:"0 18px",
        background:"rgba(1,10,16,0.93)",
        borderBottom:"1px solid rgba(6,182,212,0.07)",
        overflowX:"auto",
      }}>
        {EPISODE_STEPS.map((ep) => {
          const isActive = ep.stage === activeStage;
          const isPast   = ep.stage < activeStage;
          return (
            <button key={ep.stage} onClick={() => setActiveStage(ep.stage)} style={{ display:"flex", alignItems:"center", gap:7, padding:"0 14px", height:STEPPER_H, background:"transparent", border:"none", borderBottom:`2px solid ${isActive ? "#06b6d4" : "transparent"}`, cursor:"pointer", color: isActive ? "#67e8f9" : isPast ? "#334155" : "#1e3a4a", fontSize:11, fontFamily:"inherit", whiteSpace:"nowrap", letterSpacing:"0.04em", transition:"color 200ms,border-color 200ms" }}>
              <span style={{ width:17, height:17, borderRadius:"50%", background: isActive ? "#06b6d4" : isPast ? "rgba(6,182,212,0.15)" : "rgba(255,255,255,0.04)", color: isActive ? "#000" : isPast ? "#06b6d4" : "#1e3a4a", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                {isPast ? "✓" : ep.stage}
              </span>
              {ep.label}
            </button>
          );
        })}

        <div style={{ flex:1 }} />

        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ fontSize:9, color:"#1e3a4a", letterSpacing:"0.12em", textTransform:"uppercase", marginRight:4 }}>Granularity</span>
          {GRANULARITY_OPTIONS.map((opt) => {
            const isSel = granularity === opt.value;
            return (
              <button key={opt.value} onClick={() => setGranularity(opt.value)} title={opt.description} style={{ fontSize:10, padding:"3px 9px", border:`1px solid ${isSel ? "#06b6d4" : "rgba(6,182,212,0.12)"}`, borderRadius:3, background: isSel ? "rgba(6,182,212,0.10)" : "transparent", color: isSel ? "#67e8f9" : "#1e3a4a", cursor:"pointer", fontFamily:"inherit", transition:"all 200ms" }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          STAGE DESCRIPTION — bottom-centre pill
      ══════════════════════════════════════════ */}
      <div style={{
        position:"absolute",
        bottom: 20,
        left: panelOpen ? `calc(50% - 180px)` : "50%",   // shift left when panel open
        transform: panelOpen ? "none" : "translateX(-50%)",
        zIndex:20,
        maxWidth:520, width:"calc(100% - 400px)",
        minWidth:280,
        background:"rgba(1,14,22,0.90)",
        border:"1px solid rgba(6,182,212,0.12)",
        borderRadius:6, padding:"8px 14px",
        transition:"all 300ms ease",
        pointerEvents:"none",
      }}>
        <span style={{ fontSize:11, color:"#334155" }}>
          <strong style={{ color:"#06b6d4" }}>Stage {activeStage} · {currentEpisode.label}</strong>
          {" "}— {currentEpisode.description}
        </span>
      </div>

      {/* ══════════════════════════════════════════
          INTELLIGENCE PANEL — right slide-over
      ══════════════════════════════════════════ */}
      <div style={{
        position:"absolute",
        top: CHROME_H,
        right: 0,
        bottom: 0,
        width: 360,
        zIndex: 25,
        transform: panelOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 340ms cubic-bezier(0.4,0,0.2,1)",
        background:"rgba(1,10,16,0.97)",
        borderLeft:"1px solid rgba(6,182,212,0.12)",
        display:"flex", flexDirection:"column",
      }}>
        {/* Panel header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 16px", borderBottom:"1px solid rgba(6,182,212,0.08)", flexShrink:0 }}>
          <span style={{ fontSize:10, color:"#06b6d4", letterSpacing:"0.12em" }}>INTELLIGENCE PANEL</span>
          <button onClick={() => { setPanelOpen(false); setSelectedNode(null); }} style={{ background:"transparent", border:"none", color:"#334155", fontSize:16, cursor:"pointer", lineHeight:1, padding:"0 2px" }}>✕</button>
        </div>

        {/* Sidebar content */}
        <div style={{ flex:1, overflow:"hidden" }}>
          <IntelligenceSidebar meta={dataset.meta} selectedNode={selectedNode} />
        </div>
      </div>

    </div>
  );
}