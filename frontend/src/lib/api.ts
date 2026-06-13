import type {
  GraphNode,
  GraphEdge,
  EpisodeStep,
  Granularity,
  EpisodeStage,
  DataMeta,
} from "./types";

// ── Positions ────────────────────────────────────────────────────────────────

const POSITIONS: Record<string, { x: number; y: number }> = {
  E005: { x: 120, y: 100 }, E006: { x: 120, y: 280 }, E007: { x: 120, y: 460 },
  E001: { x: 340, y: 80  }, E002: { x: 340, y: 230 }, E003: { x: 340, y: 380 }, E004: { x: 340, y: 520 },
  E008: { x: 580, y: 60  }, E009: { x: 580, y: 190 }, E010: { x: 580, y: 320 },
  E011: { x: 580, y: 450 }, E012: { x: 580, y: 560 },
  E013: { x: 780, y: 200 }, E014: { x: 780, y: 360 },
};

// ── Static data ───────────────────────────────────────────────────────────────

export const NODES: GraphNode[] = [
  { id:"E005", label:"PulseSDK",            type:"sdk_vendor", episode_stage:1, initial_position:POSITIONS.E005, description:"Embedded in 47,000 apps; collects background location every 90s.",            apps_instrumented:47000, granularity_levels:["precise"],       data_types:["GPS coordinates","background location","device ID"] },
  { id:"E006", label:"HorizonKit",          type:"sdk_vendor", episode_stage:1, initial_position:POSITIONS.E006, description:"Weather & utility app SDK; exclusive supply agreement with Veridian.",        apps_instrumented:31000, granularity_levels:["precise","city"], data_types:["GPS","WiFi triangulation"] },
  { id:"E007", label:"GeoFence Pro",        type:"sdk_vendor", episode_stage:1, initial_position:POSITIONS.E007, description:"Geofencing-as-a-service; sells enriched visit data upstream.",                apps_instrumented:8500,  granularity_levels:["precise","city"], data_types:["geofence entry/exit","dwell time"] },
  { id:"E001", label:"Veridian Data Co.",   type:"broker",     episode_stage:2, initial_position:POSITIONS.E001, description:"Largest independent aggregator; resells to 200+ downstream buyers.",          risk_score:9.2, resale_margin_pct:820, monthly_records_sold_M:14200, policy_flags:["FTC Section 5 investigation","CFPB advisory 2022"] },
  { id:"E002", label:"Prism Location Inc.", type:"broker",     episode_stage:2, initial_position:POSITIONS.E002, description:"Specialises in real-time bid-stream data from 4,000+ SDK partners.",          risk_score:8.7, resale_margin_pct:640, monthly_records_sold_M:9800,  policy_flags:[] },
  { id:"E003", label:"ClearPath Analytics", type:"broker",     episode_stage:2, initial_position:POSITIONS.E003, description:"Enriches credit bureau feeds with mobility patterns.",                         risk_score:6.8, resale_margin_pct:410, monthly_records_sold_M:4200,  policy_flags:[] },
  { id:"E004", label:"Meridian Signals",    type:"broker",     episode_stage:2, initial_position:POSITIONS.E004, description:"Ad-tech origin; pivoted into financial intelligence market 2021.",             risk_score:7.4, resale_margin_pct:510, monthly_records_sold_M:7600,  policy_flags:[] },
  { id:"E008", label:"Apex Capital",         type:"buyer", episode_stage:3, initial_position:POSITIONS.E008, description:"Quantitative fund; uses foot-traffic data for retail stock signals.",         buyer_category:"hedge_fund",        use_case:"Alpha generation — retail sector",     annual_spend_usd_M:4.2 },
  { id:"E009", label:"Natl Recovery Group",  type:"buyer", episode_stage:3, initial_position:POSITIONS.E009, description:"Uses real-time location pings to serve process papers and locate debtors.",  buyer_category:"debt_collector",    use_case:"Debtor location & process serving",    annual_spend_usd_M:1.8 },
  { id:"E010", label:"InsureMetrics LLC",    type:"buyer", episode_stage:3, initial_position:POSITIONS.E010, description:"Mobility patterns feed into home/auto premium models.",                      buyer_category:"insurer",           use_case:"Underwriting risk adjustment",          annual_spend_usd_M:6.7 },
  { id:"E011", label:"PrecisionVote LLC",    type:"buyer", episode_stage:3, initial_position:POSITIONS.E011, description:"Targets voters at polling locations, places of worship, clinics.",           buyer_category:"political_campaign", use_case:"Voter targeting & micro-segmentation", annual_spend_usd_M:2.9 },
  { id:"E012", label:"HealthPath Analytics", type:"buyer", episode_stage:3, initial_position:POSITIONS.E012, description:"Infers clinic visits and addiction treatment attendance from mobility.",      buyer_category:"pharma",            use_case:"Patient behaviour modelling",           annual_spend_usd_M:3.8 },
  { id:"E013", label:"CFPB", type:"regulator", episode_stage:4, initial_position:POSITIONS.E013, description:"Issued 2024 advisory on data brokers in credit/debt context.", jurisdiction:"Federal — consumer finance",      gap_note:"Authority limited to credit/debt use; no upstream broker reach." },
  { id:"E014", label:"FTC",  type:"regulator", episode_stage:4, initial_position:POSITIONS.E014, description:"FTC Act Section 5 enforcement on deceptive data practices.",   jurisdiction:"Federal — unfair/deceptive acts", gap_note:"Section 5 reach is case-by-case; no comprehensive broker rule." },
];
export const EDGES: GraphEdge[] = [
  { id:"R001", source:"E005", target:"E001", relationship:"data_feed",     label:"GPS feed",       episode_stage:1, records_per_month_M:320,  granularity:"precise" },
  { id:"R002", source:"E005", target:"E002", relationship:"data_feed",     label:"GPS feed",       episode_stage:1, records_per_month_M:210,  granularity:"precise" },
  { id:"R003", source:"E006", target:"E001", relationship:"data_feed",     label:"GPS feed",       episode_stage:1, records_per_month_M:640,  granularity:"precise" },
  { id:"R004", source:"E007", target:"E002", relationship:"data_feed",     label:"Visit data",     episode_stage:1, records_per_month_M:230,  granularity:"city"    },
  { id:"R005", source:"E005", target:"E004", relationship:"data_feed",     label:"GPS feed",       episode_stage:1, records_per_month_M:180,  granularity:"precise" },
  { id:"R006", source:"E001", target:"E008", relationship:"sale",          label:"Location pkg",   episode_stage:3, records_per_month_M:42,   granularity:null      },
  { id:"R007", source:"E001", target:"E009", relationship:"sale",          label:"Debtor pings",   episode_stage:3, records_per_month_M:18,   granularity:"precise" },
  { id:"R008", source:"E002", target:"E011", relationship:"sale",          label:"Voter segments", episode_stage:3, records_per_month_M:29,   granularity:"precise" },
  { id:"R009", source:"E002", target:"E012", relationship:"sale",          label:"Clinic visits",  episode_stage:3, records_per_month_M:38,   granularity:"precise" },
  { id:"R010", source:"E003", target:"E010", relationship:"sale",          label:"Mobility score", episode_stage:3, records_per_month_M:67,   granularity:"city"    },
  { id:"R011", source:"E004", target:"E008", relationship:"sale",          label:"Trade signals",  episode_stage:3, records_per_month_M:55,   granularity:null      },
  { id:"R012", source:"E001", target:"E003", relationship:"data_exchange", label:"Cross-license",  episode_stage:2, records_per_month_M:90,   granularity:null      },
  { id:"R013", source:"E004", target:"E002", relationship:"data_exchange", label:"Cross-license",  episode_stage:2, records_per_month_M:120,  granularity:null      },
  { id:"R014", source:"E013", target:"E009", relationship:"enforcement",   label:"CFPB probe",     episode_stage:4, records_per_month_M:null, granularity:null      },
  { id:"R015", source:"E013", target:"E010", relationship:"enforcement",   label:"CFPB probe",     episode_stage:4, records_per_month_M:null, granularity:null      },
  { id:"R016", source:"E014", target:"E001", relationship:"enforcement",   label:"FTC Sec 5",      episode_stage:4, records_per_month_M:null, granularity:null      },
];

const META: DataMeta = {
  title: "Real Rails — POC 44",
  poc: 44,
  rail: "Distribution & Demand",
  data_volume_pb_month: 3.2,
  avg_broker_risk_score: 8.0,
  risk_score_max: 10,
  apps_instrumented: 86500,
  counts: { brokers: 4, sdk_vendors: 3, downstream_buyers: 5, regulators: 2 },
  policy_flags: [
    "No federal data privacy law",
    "FCRA gap exploited",
    "HIPAA doesn't apply",
    "400–900% resale margin",
    "No meaningful opt-out",
  ],
};

export const dataset = { meta: META, nodes: NODES, edges: EDGES };

// ── Episode steps ─────────────────────────────────────────────────────────────

export const EPISODE_STEPS: EpisodeStep[] = [
  {
    stage: 1,
    label: "SDK Collection",
    description:
      "Three silent SDKs embedded in 86,500+ consumer apps harvest raw GPS coordinates with no meaningful user disclosure.",
    highlightNodeIds: ["E005", "E006", "E007"],
  },
  {
    stage: 2,
    label: "Broker Exchange",
    description:
      "Four data brokers aggregate, enrich, and trade the feeds among themselves — tripling the resale value before a single buyer sees it.",
    highlightNodeIds: ["E001", "E002", "E003", "E004"],
  },
  {
    stage: 3,
    label: "Buyer Distribution",
    description:
      "Five downstream buyers — hedge funds, debt collectors, insurers, political campaigns, and pharma firms — purchase targeted packages.",
    highlightNodeIds: ["E008", "E009", "E010", "E011", "E012"],
  },
  {
    stage: 4,
    label: "Regulatory Gap",
    description:
      "CFPB and FTC can probe individual buyers but lack statutory reach to the upstream broker-SDK network. The rail operates in the gap.",
    highlightNodeIds: ["E013", "E014"],
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

export function getNodeById(id: string): GraphNode | undefined {
  return NODES.find((n) => n.id === id);
}

export function getNodesByType(type: GraphNode["type"]): GraphNode[] {
  return NODES.filter((n) => n.type === type);
}

export function filterEdgesByGranularity(
  edges: GraphEdge[],
  granularity: Granularity
): GraphEdge[] {
  return edges.filter((e) => e.granularity === null || e.granularity === granularity);
}

export function filterEdgesByStage(
  edges: GraphEdge[],
  maxStage: EpisodeStage
): GraphEdge[] {
  return edges.filter((e) => e.episode_stage <= maxStage);
}

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

export function riskScoreCursorPct(score: number, max: number): string {
  return `${Math.round((score / max) * 100)}%`;
}

export function brokerRiskColor(score: number): string {
  if (score >= 8.5) return "#ef4444";
  if (score >= 7.0) return "#facc15";
  return "#4ade80";
}

export function totalMonthlyRecords(): number {
  return EDGES.filter((e) => e.records_per_month_M !== null).reduce(
    (sum, e) => sum + (e.records_per_month_M ?? 0),
    0
  );
}

// ── API ───────────────────────────────────────────────────────────────────────

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function downloadSampleCSV() {
  const res = await fetch(`${API_BASE}/api/download/sample`);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "real_rails_poc44_sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}