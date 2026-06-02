// ─── Entity types ────────────────────────────────────────────────────────────
export type EntityType = "sdk_vendor" | "broker" | "buyer" | "regulator";
export type RelationshipType = "data_feed" | "sale" | "data_exchange" | "enforcement";
export type BuyerCategory = "hedge_fund" | "debt_collector" | "insurer" | "political_campaign" | "pharma";

// VAR R-03 — granularity levels that can be toggled on the graph
export type Granularity = "precise" | "city" | "state";

// VAR R-02 — episode stages (1=SDK, 2=Broker, 3=Buyer, 4=Regulator)
export type EpisodeStage = 1 | 2 | 3 | 4;

// ─── Node ────────────────────────────────────────────────────────────────────
export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  episode_stage: EpisodeStage;
  description: string;
  initial_position: { x: number; y: number };

  // SDK vendor fields
  apps_instrumented?: number;
  granularity_levels?: Granularity[];
  data_types?: string[];

  // Broker fields
  risk_score?: number | null;
  resale_margin_pct?: number;
  policy_flags?: string[];
  monthly_records_sold_M?: number;

  // Buyer fields
  buyer_category?: BuyerCategory;
  use_case?: string;
  annual_spend_usd_M?: number;

  // Regulator fields
  jurisdiction?: string;
  enforcement_targets?: string[];
  gap_note?: string;
}

// ─── Edge ────────────────────────────────────────────────────────────────────
export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: RelationshipType;
  granularity: Granularity | null;          // VAR R-03 — filter key
  records_per_month_M: number | null;
  episode_stage: EpisodeStage;              // VAR R-02 — episode reveal key
  label: string;
}

// ─── Meta ────────────────────────────────────────────────────────────────────
export interface DataMeta {
  title: string;
  poc: number;
  rail: string;
  data_volume_pb_month: number;
  apps_instrumented: number;
  avg_broker_risk_score: number;            // VAR M-03 — used to render score cursor
  risk_score_max: number;
  policy_flags: string[];
  counts: {
    brokers: number;
    sdk_vendors: number;
    downstream_buyers: number;
    regulators: number;
  };
}

// ─── Full dataset ─────────────────────────────────────────────────────────────
export interface MockDataset {
  meta: DataMeta;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── UI state types ───────────────────────────────────────────────────────────

// VAR R-02 — episode step descriptor
export interface EpisodeStep {
  stage: EpisodeStage;
  label: string;
  description: string;
  highlightNodeIds: string[];
}

// VAR R-03 — granularity control
export interface GranularityOption {
  value: Granularity;
  label: string;
  description: string;
}

export const GRANULARITY_OPTIONS: GranularityOption[] = [
  { value: "precise", label: "Precise GPS", description: "Raw lat/lng, ±5m accuracy" },
  { value: "city",    label: "City-level",  description: "Aggregated to city centroid" },
  { value: "state",   label: "State-level", description: "Aggregated to state boundary" },
];

// Relationship color/style map — matches legend
export const RELATIONSHIP_STYLES: Record<RelationshipType, { stroke: string; dash: string; label: string }> = {
  data_feed:     { stroke: "#ef4444", dash: "none",      label: "Data feed (SDK→Broker)" },
  sale:          { stroke: "#60a5fa", dash: "none",      label: "Sale (Broker→Buyer)" },
  data_exchange: { stroke: "#facc15", dash: "none",      label: "Data exchange" },
  enforcement:   { stroke: "#4ade80", dash: "6,4",       label: "Enforcement" },
};

// Entity node color map — matches legend
export const ENTITY_COLORS: Record<EntityType, { fill: string; stroke: string; label: string }> = {
  broker:     { fill: "#ef4444", stroke: "#fca5a5", label: "broker" },
  sdk_vendor: { fill: "#818cf8", stroke: "#c4b5fd", label: "sdk vendor" },
  buyer:      { fill: "#38bdf8", stroke: "#7dd3fc", label: "buyer" },
  regulator:  { fill: "#4ade80", stroke: "#86efac", label: "regulator" },
};
