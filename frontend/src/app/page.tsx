"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { EpisodeStage, Granularity, GraphNode } from "../lib/types";
import { GRANULARITY_OPTIONS } from "../lib/types";
import { EPISODE_STEPS, dataset } from "../lib/api";
import IntelligenceSidebar from "../components/IntelligenceSidebar";

// Cytoscape uses browser APIs — must be loaded client-side only
const NetworkGraph = dynamic(() => import("../components/NetworkGraph"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        flex: 1,
        background: "#030712",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#334155",
        fontSize: 13,
      }}
    >
      Loading graph…
    </div>
  ),
});

export default function Page() {
  // VAR R-02 — episode stage state (1–4)
  const [activeStage, setActiveStage] = useState<EpisodeStage>(1);
  // VAR R-03 — granularity filter state
  const [granularity, setGranularity] = useState<Granularity>("precise");
  // Selected node for sidebar detail
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const handleNodeSelect = useCallback((node: GraphNode | null) => {
    setSelectedNode(node);
  }, []);

  const currentEpisode = EPISODE_STEPS.find((e) => e.stage === activeStage)!;

  return (
    // VAR D-01 — root background strictly #030712
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#030712",
        overflow: "hidden",
        fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
      }}
    >
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "#030712",
          flexShrink: 0,
          flexWrap: "wrap",
          rowGap: 8,
        }}
      >
        {/* Brand pill */}
        <span
          style={{
            background: "#1e40af",
            color: "#bfdbfe",
            fontSize: 11,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 4,
            letterSpacing: "0.04em",
          }}
        >
          REAL RAILS
        </span>

        <span style={{ color: "#475569", fontSize: 13 }}>
          LOCATION DATA BROKERAGE MAP / PoC {dataset.meta.poc}
        </span>

        {/* Live mock badge */}
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#475569",
            fontSize: 12,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#38bdf8",
            }}
          />
          LIVE MOCK — {dataset.meta.rail} Rail
        </span>
      </header>

      {/* ── VAR R-02 — Episode stepper ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 20px",
          background: "#030712",
          flexShrink: 0,
          overflowX: "auto",
        }}
      >
        {EPISODE_STEPS.map((ep, i) => {
          const isActive = ep.stage === activeStage;
          const isPast = ep.stage < activeStage;
          return (
            <button
              key={ep.stage}
              onClick={() => setActiveStage(ep.stage)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: isActive
                  ? "2px solid #38bdf8"
                  : "2px solid transparent",
                cursor: "pointer",
                color: isActive ? "#38bdf8" : isPast ? "#475569" : "#334155",
                fontSize: 12,
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                transition: "color 200ms, border-color 200ms",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: isActive
                    ? "#0ea5e9"
                    : isPast
                    ? "rgba(14,165,233,0.2)"
                    : "rgba(255,255,255,0.06)",
                  color: isActive ? "#fff" : isPast ? "#38bdf8" : "#475569",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 200ms",
                }}
              >
                {isPast ? "✓" : ep.stage}
              </span>
              {ep.label}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ flex: 1 }} />

        {/* VAR R-03 — Granularity controls (inline in header bar) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 0",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#475569",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginRight: 4,
            }}
          >
            Granularity
          </span>
          {GRANULARITY_OPTIONS.map((opt) => {
            const isSelected = granularity === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setGranularity(opt.value)}
                title={opt.description}
                style={{
                  fontSize: 11,
                  padding: "4px 10px",
                  border: `1px solid ${isSelected ? "#38bdf8" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 4,
                  background: isSelected ? "rgba(56,189,248,0.12)" : "transparent",
                  color: isSelected ? "#38bdf8" : "#475569",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 200ms",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Episode description bar ───────────────────────────────────────── */}
      <div
        style={{
          padding: "8px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(56,189,248,0.04)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 12, color: "#475569" }}>
          <strong style={{ color: "#38bdf8" }}>
            Stage {activeStage} · {currentEpisode.label}
          </strong>{" "}
          — {currentEpisode.description}
        </span>
      </div>

      {/* ── Main content: 70% graph + 30% sidebar ───────────────────────── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
        {/* 70% — graph canvas */}
        <div style={{ flex: "0 0 70%", minWidth: "70%", height: "100%", overflow: "hidden" }}>
          <NetworkGraph
            activeStage={activeStage}
            granularity={granularity}
            onNodeSelect={handleNodeSelect}
          />
        </div>

        {/* 30% — intelligence sidebar */}
        <IntelligenceSidebar meta={dataset.meta} selectedNode={selectedNode} />
      </div>
    </div>
  );
}
