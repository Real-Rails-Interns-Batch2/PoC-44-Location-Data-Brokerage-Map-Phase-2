"use client";

import type { GraphNode, DataMeta } from "../lib/types";
import { ENTITY_COLORS } from "../lib/types";
import { riskScoreCursorPct, brokerRiskColor } from "../lib/api";

interface IntelligenceSidebarProps {
  meta: DataMeta;
  selectedNode: GraphNode | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: "12px 14px",
        flex: 1,
        minWidth: 90,
      }}
    >
      <p
        style={{
          fontSize: 22,
          fontWeight: 600,
          margin: 0,
          color: accent ? "#ef4444" : "#f1f5f9",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </p>
      <p style={{ fontSize: 11, color: "#64748b", margin: "3px 0 0" }}>{label}</p>
    </div>
  );
}

// VAR M-03 — Risk score bar with explicit cursor at score position
function RiskScoreBar({ score, max }: { score: number; max: number }) {
  const pct = riskScoreCursorPct(score, max);
  const color = brokerRiskColor(score);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Avg broker risk score</span>
        <span style={{ fontSize: 12, color: "#f1f5f9", fontVariantNumeric: "tabular-nums" }}>
          {score.toFixed(1)} / {max}
        </span>
      </div>
      {/* Track */}
      <div style={{ position: "relative", height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 3,
            background: "linear-gradient(90deg,#facc15,#ef4444)",
            width: pct,
          }}
        />
        {/* VAR M-03 — score cursor (white needle at exact position) */}
        <div
          style={{
            position: "absolute",
            top: -4,
            left: pct,
            transform: "translateX(-50%)",
            width: 2,
            height: 14,
            background: "#ffffff",
            borderRadius: 1,
            boxShadow: `0 0 6px 2px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}

function PolicyFlag({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        background: "rgba(239,68,68,0.15)",
        color: "#fca5a5",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 4,
        padding: "3px 8px",
        marginRight: 6,
        marginBottom: 6,
      }}
    >
      {text}
    </span>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <p
      style={{
        fontSize: 10,
        color: "#475569",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        margin: "20px 0 10px",
      }}
    >
      {text}
    </p>
  );
}

// ─── Selected node detail panel ───────────────────────────────────────────────
function NodeDetail({ node }: { node: GraphNode }) {
  const colors = ENTITY_COLORS[node.type];
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8,
        padding: "14px 16px",
        marginTop: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: colors.fill,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{node.label}</span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            color: "#64748b",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 4,
            padding: "2px 6px",
          }}
        >
          {node.type.replace("_", " ")}
        </span>
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 12px" }}>
        {node.description}
      </p>

      {/* SDK vendor specifics */}
      {node.type === "sdk_vendor" && (
        <>
          <DetailRow label="Apps instrumented" value={node.apps_instrumented?.toLocaleString() ?? "—"} />
          <DetailRow label="Granularity levels" value={(node.granularity_levels ?? []).join(", ")} />
          <DetailRow label="Data types" value={(node.data_types ?? []).join(", ")} />
        </>
      )}

      {/* Broker specifics */}
      {node.type === "broker" && (
        <>
          <DetailRow
            label="Risk score"
            value={node.risk_score != null ? `${node.risk_score} / 10` : "—"}
            accent={node.risk_score != null && node.risk_score >= 8}
          />
          <DetailRow label="Resale margin" value={node.resale_margin_pct != null ? `${node.resale_margin_pct}%` : "—"} />
          <DetailRow label="Monthly records" value={node.monthly_records_sold_M != null ? `${node.monthly_records_sold_M}M` : "—"} />
          {(node.policy_flags ?? []).length > 0 && (
            <div style={{ marginTop: 10 }}>
              {node.policy_flags!.map((f) => (
                <PolicyFlag key={f} text={f} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Buyer specifics */}
      {node.type === "buyer" && (
        <>
          <DetailRow label="Category" value={(node.buyer_category ?? "—").replace("_", " ")} />
          <DetailRow label="Use case" value={node.use_case ?? "—"} />
          <DetailRow label="Annual spend" value={node.annual_spend_usd_M != null ? `$${node.annual_spend_usd_M}M` : "—"} />
        </>
      )}

      {/* Regulator specifics */}
      {node.type === "regulator" && (
        <>
          <DetailRow label="Jurisdiction" value={node.jurisdiction ?? "—"} />
          <DetailRow label="Gap note" value={node.gap_note ?? "—"} />
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 12, color: accent ? "#f87171" : "#cbd5e1", textAlign: "right", maxWidth: "60%" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────
export default function IntelligenceSidebar({ meta, selectedNode }: IntelligenceSidebarProps) {
  return (
    <aside
      style={{
        width: "30%",
        minWidth: 280,
        maxWidth: 420,
        height: "100%",
        overflowY: "auto",
        background: "#030712",              // VAR D-01 — matches graph bg exactly
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 20px",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      {/* A · Rail Intelligence */}
      <p style={{ fontSize: 10, color: "#475569", letterSpacing: "0.08em", margin: "0 0 8px", textTransform: "uppercase" }}>
        A · Rail Intelligence
      </p>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#38bdf8",
          margin: "0 0 4px",
          lineHeight: 1.2,
        }}
      >
        {meta.data_volume_pb_month}+ PB/month
        <br />
        in circulation
      </h1>
      <p style={{ fontSize: 12, color: "#475569", margin: "0 0 20px" }}>
        Across tracked broker-SDK network
      </p>

      {/* Metric cards grid */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <MetricCard value={meta.counts.brokers} label="Broker entities" />
        <MetricCard value={meta.counts.sdk_vendors} label="SDK vendors" />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <MetricCard value={meta.counts.downstream_buyers} label="Downstream buyers" />
        <MetricCard value={(meta.policy_flags ?? []).length} label="Policy flags" accent />
      </div>

      {/* VAR M-03 — Risk score with cursor */}
      <div style={{ marginTop: 20 }}>
        <RiskScoreBar score={meta.avg_broker_risk_score} max={meta.risk_score_max} />
        <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
          Apps instrumented:{" "}
          <strong style={{ color: "#f1f5f9" }}>
            {meta.apps_instrumented.toLocaleString()}+
          </strong>
        </p>
      </div>

      {/* B · Why this matters */}
      <SectionLabel text="B · Why this matters" />
      <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7, margin: "0 0 14px" }}>
        Location data flows silently from {meta.apps_instrumented.toLocaleString()}+ apps through a small
        cartel of brokers to hedge funds, debt collectors, insurers, and political campaigns — with
        consent buried in legalese and no meaningful opt-out.
      </p>
      <div>
        {(meta.policy_flags ?? []).map((f) => (
          <PolicyFlag key={f} text={f} />
        ))}
      </div>

      {/* C · Who controls the rail */}
      <SectionLabel text="C · Who controls the rail" />
      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
        Click any node on the graph to inspect its role, data types, risk score, and downstream connections.
      </p>

      {/* Selected node detail */}
      {selectedNode && <NodeDetail node={selectedNode} />}
    </aside>
  );
}
