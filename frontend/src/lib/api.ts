import type {
  MockDataset,
  GraphNode,
  GraphEdge,
  EpisodeStep,
  Granularity,
  EpisodeStage,
} from "./types";
import rawData from "../data/mock_data.json";

// ─── Raw typed data ───────────────────────────────────────────────────────────
export const dataset: MockDataset = rawData as MockDataset;

// ─── Node / edge accessors ────────────────────────────────────────────────────
export function getNodeById(id: string): GraphNode | undefined {
  return dataset.nodes.find((n) => n.id === id);
}

export function getNodesByType(type: GraphNode["type"]): GraphNode[] {
  return dataset.nodes.filter((n) => n.type === type);
}

// ─── VAR R-03 — Granularity filter ───────────────────────────────────────────
/**
 * Returns only the edges that match the selected granularity level.
 * Enforcement edges (granularity: null) always pass through regardless of selection.
 */
export function filterEdgesByGranularity(
  edges: GraphEdge[],
  granularity: Granularity
): GraphEdge[] {
  return edges.filter(
    (e) => e.granularity === null || e.granularity === granularity
  );
}

/**
 * Returns only the edges at or before the given episode stage.
 * Used to progressively reveal the graph in episode mode (VAR R-02).
 */
export function filterEdgesByStage(
  edges: GraphEdge[],
  maxStage: EpisodeStage
): GraphEdge[] {
  return edges.filter((e) => e.episode_stage <= maxStage);
}

/**
 * Returns only the nodes that are referenced by the filtered edge set,
 * plus any nodes whose episode_stage <= maxStage.
 * Ensures orphan nodes never appear.
 */
export function visibleNodes(
  allNodes: GraphNode[],
  visibleEdges: GraphEdge[],
  maxStage: EpisodeStage
): GraphNode[] {
  const referencedIds = new Set<string>();
  visibleEdges.forEach((e) => {
    referencedIds.add(e.source);
    referencedIds.add(e.target);
  });
  return allNodes.filter(
    (n) => n.episode_stage <= maxStage || referencedIds.has(n.id)
  );
}

// ─── VAR R-02 — Episode steps ─────────────────────────────────────────────────
export const EPISODE_STEPS: EpisodeStep[] = [
  {
    stage: 1,
    label: "SDK Collection",
    description:
      "Three silent SDKs embedded in 86,500+ consumer apps harvest raw GPS coordinates with no meaningful user disclosure.",
    highlightNodeIds: ["pulse_sdk", "geo_pulse_sdk", "nextrack_sdk"],
  },
  {
    stage: 2,
    label: "Broker Exchange",
    description:
      "Four data brokers aggregate, enrich, and trade the feeds among themselves — tripling the resale value before a single buyer sees it.",
    highlightNodeIds: [
      "veridian_data",
      "prism_location",
      "clearpath_analytics",
      "meridian_signals",
    ],
  },
  {
    stage: 3,
    label: "Buyer Distribution",
    description:
      "Five downstream buyers — hedge funds, debt collectors, insurers, political campaigns, and pharma firms — purchase targeted packages.",
    highlightNodeIds: [
      "apex_capital",
      "natl_recovery",
      "insure_metrics",
      "precision_vote",
      "healthpath",
    ],
  },
  {
    stage: 4,
    label: "Regulatory Gap",
    description:
      "CFPB and FTC can probe individual buyers but lack statutory reach to the upstream broker-SDK network. The rail operates in the gap.",
    highlightNodeIds: ["cfpb", "ftc"],
  },
];

// ─── VAR M-03 — Risk score helpers ───────────────────────────────────────────
/**
 * Returns a CSS left-percentage string for positioning the score cursor.
 * e.g. riskScoreCursorPct(8.0, 10) → "80%"
 */
export function riskScoreCursorPct(score: number, max: number): string {
  return `${Math.round((score / max) * 100)}%`;
}

export function brokerRiskColor(score: number): string {
  if (score >= 8.5) return "#ef4444";
  if (score >= 7.0) return "#facc15";
  return "#4ade80";
}

// ─── Derived stats ────────────────────────────────────────────────────────────
export function totalMonthlyRecords(): number {
  return dataset.edges
    .filter((e) => e.records_per_month_M !== null)
    .reduce((sum, e) => sum + (e.records_per_month_M ?? 0), 0);
}
export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export async function downloadSampleCSV() {
  const res = await fetch(`${API_BASE}/api/download/sample`);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'real_rails_poc44_sample.csv';
  a.click();
  URL.revokeObjectURL(url);
}
